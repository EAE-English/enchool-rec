"""[Claude] 엔쿨 녹음 자동 채점 (예약 작업용)
사용: python3 tools/grade.py jobs.json results.json
jobs.json  = [{"row": 4, "audio": "/path/a.webm", "ref": ["clap They stood ...", ...]}, ...]
results.json = [{"row": 4, "score": 85, "weak": "clap, collect", "heard": "..."}, ...]
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
        elif d[i + 1][j] >= d[i][j + 1]: i += 1
        else: j += 1
    return ok

def score(ref_list, heard):
    R, H = words(' '.join(ref_list)), words(heard)
    if not R or not H: return None, []
    ok = lcs_marks(R, H); weak = []
    for k, f in enumerate(ok):
        w = R[k]
        if not f and len(w) > 2 and w not in SMALL and w not in weak: weak.append(w)
    return round(sum(ok) / len(R) * 100), weak[:8]

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def main(jobs_path, out_path):
    from faster_whisper import WhisperModel
    model = WhisperModel('base.en', device='cpu', compute_type='int8')
    out = []
    for j in json.load(open(jobs_path)):
        try:
            segs, _ = model.transcribe(pcm(j['audio']), language='en', beam_size=5, condition_on_previous_text=False)
            heard = ' '.join(s.text.strip() for s in segs).strip()
            sc, weak = score(j.get('ref') or [], heard)
            out.append({'row': j['row'], 'score': sc, 'weak': ', '.join(weak) if weak else ('모두 OK' if sc is not None else '받아쓰기 안 됨'), 'heard': heard[:3000]})
        except Exception as e:
            out.append({'row': j['row'], 'error': str(e)[:200]})
        print(out[-1], flush=True)
    json.dump(out, open(out_path, 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
