"""[Claude] 엔쿨 녹음 자동 채점 (예약 작업용)
말하기도 같이 봄(2026-10-29): 속도(단어/초) · 멈칫(문장 중간 0.6초 넘게 멈춤) · 반복(같은 말을 다시 함) · 억양(목소리 높낮이 폭, 질문 끝 올림)
사용: python3 tools/grade.py jobs.json results.json
jobs.json  = [{"row": 4, "audio": "/path/a.webm", "ref": ["clap They stood ...", ...]}, ...]
results.json = [{"row": 4, "score": 85, "weak": "clap, collect", "heard": "...", "speech": "속도 2.6단어/초(알맞아요) · 멈칫 1번 · 반복 0번 · 억양 보통(7)"}, ...]
점수 규칙은 Apps Script autoScore_와 같음: 대본 단어 중 받아쓰기에 순서대로 들린 비율, 약한 단어는 작은 단어 빼고 8개까지.
"""
import json, re, subprocess, sys
import numpy as np

SMALL = {'the','are','and','was','were','his','her','its','for','but','not','you','our','has','had','can','did','does','this','that','they','them','their','with','from'}

def words(t):
    t = str(t or '').lower().replace('’', "'").replace('‘', "'")
    return [w for w in re.sub(r"[^a-z0-9' ]+", ' ', t).split() if w]

def lcs_marks(R, H):
    n, m = len(R), len(H)
    d = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            d[i][j] = d[i + 1][j + 1] + 1 if R[i] == H[j] else max(d[i + 1][j], d[i][j + 1])
    ok = [False] * n; i = j = 0
    while i < n and j < m:
        if R[i] == H[j]: ok[i] = True; i += 1; j += 1
        elif d[i + 1][j] > d[i][j + 1]: i += 1
        else: j += 1
    return ok

def score(ref_list, heard):
    R, H = words(' '.join(ref_list)), words(heard)
    if not R: return None, []
    # 녹음된 말이 없으면 0점 (2026-10-30)
    if not H: return 0, ['끝까지 안 읽음']
    ok = lcs_marks(R, H); weak = []
    # 점수는 언제나 대본 전체 기준 = 녹음에서 맞게 읽은 단어 ÷ 대본 전체 단어 (2026-10-30)
    # 마지막으로 맞힌 곳 뒤가 대본의 15% 넘게 남으면 「끝까지 안 읽음」 표시, 틀린 단어는 읽은 데까지만
    last = max([k for k, f in enumerate(ok) if f] or [-1]); end = len(R); part = False
    if (last + 1) < len(R) * 0.85: end = last + 1; part = True
    for k, f in enumerate(ok[:end]):
        w = R[k]
        if not f and len(w) > 2 and w not in SMALL and w not in weak: weak.append(w)
    sc = round(sum(ok) / len(R) * 100)
    if part: weak = ['끝까지 안 읽음'] + weak[:7]
    return sc, weak[:8]

def speech_report(audio, segs, ref_list):
    """속도·멈칫·반복·억양을 한 줄로"""
    words_t = [w for s in segs for w in (s.words or [])]
    if not words_t: return ''
    # 말 덩어리: 단어 사이가 1.2초 넘게 비면 다른 덩어리(따라 읽기는 원어민을 기다리는 시간이 빠짐)
    utt = [[words_t[0]]]
    for a, b in zip(words_t, words_t[1:]):
        (utt[-1].append(b) if b.start - a.end <= 1.2 else utt.append([b]))
    talk = sum(max(0.3, u[-1].end - u[0].start) for u in utt)
    rate = len(words_t) / talk
    rate_lab = '천천히' if rate < 1.8 else ('빨라요' if rate > 3.4 else '알맞아요')
    # 멈칫: 한 덩어리 안에서 단어 사이가 0.6~1.2초 빈 곳
    pauses = sum(1 for u in utt for a, b in zip(u, u[1:]) if b.start - a.end > 0.6)
    # 반복: 같은 낱말·두 낱말을 바로 다시 말함 (대본에 원래 겹친 건 빼고)
    H = words(' '.join(w.word for w in words_t)); R = ' ' + ' '.join(words(' '.join(ref_list))) + ' '
    reps = []
    i = 0
    while i < len(H) - 1:
        hit = None
        for n in (2, 1):
            if i + 2 * n <= len(H) and H[i:i + n] == H[i + n:i + 2 * n] and (' ' + ' '.join(H[i:i + 2 * n]) + ' ') not in R:
                hit = n; break
        if hit: reps.append(' '.join(H[i:i + hit])); i += 2 * hit
        else: i += 1
    # 억양: 목소리 높낮이 폭(반음), 질문 문장 끝 올림
    tone = ''
    try:
        import parselmouth
        snd = parselmouth.Sound(audio, sampling_frequency=16000)
        pitch = snd.to_pitch(time_step=0.02, pitch_floor=75, pitch_ceiling=500)
        f = pitch.selected_array['frequency']; t = pitch.xs(); v = f > 0
        if v.sum() > 20:
            lo, hi = np.percentile(f[v], 5), np.percentile(f[v], 95)
            st = 12 * np.log2(hi / lo)
            tone = f"억양 {'평평해요' if st < 5 else ('생생해요' if st > 10 else '보통')}({st:.0f})"
            q = [s for s in segs if s.text.strip().endswith('?') and s.words]
            if q:
                up = 0
                for s in q:
                    w = s.words[-1]; mid = (w.start + w.end) / 2
                    tail = v & (t >= mid) & (t <= w.end + 0.4); body = v & (t >= s.words[0].start) & (t < w.start)   # 받아쓰기 끝 시간이 조금 일러서 0.4초 더 봄
                    if tail.sum() > 1 and body.sum() > 2 and 12 * np.log2(np.percentile(f[tail], 85) / np.median(f[body])) > 2: up += 1
                tone += f" · 질문 끝 올림 {up}/{len(q)}"
    except Exception:
        pass
    parts = [f"속도 {rate:.1f}단어/초({rate_lab})", f"멈칫 {pauses}번", f"반복 {len(reps)}번" + (f"({', '.join(reps[:3])})" if reps else '')]
    if tone: parts.append(tone)
    return ' · '.join(parts)

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def main(jobs_path, out_path):
    from faster_whisper import WhisperModel
    model = WhisperModel('base.en', device='cpu', compute_type='int8')
    out = []
    for j in json.load(open(jobs_path)):
        try:
            audio = pcm(j['audio'])
            segs, _ = model.transcribe(audio, language='en', beam_size=5, condition_on_previous_text=False, word_timestamps=True)
            segs = list(segs)
            heard = ' '.join(s.text.strip() for s in segs).strip()
            sc, weak = score(j.get('ref') or [], heard)
            out.append({'row': j['row'], 'score': sc, 'weak': ', '.join(weak) if weak else ('모두 OK' if sc is not None else '받아쓰기 안 됨'), 'heard': heard[:3000], 'speech': speech_report(audio, segs, j.get('ref') or [])})
        except Exception as e:
            out.append({'row': j['row'], 'error': str(e)[:200]})
        print(out[-1], flush=True)
    json.dump(out, open(out_path, 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
