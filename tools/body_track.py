# [Claude] 원음원(드라이브)이 없는 본문 → 미리 만든 자연스러운 목소리(kool/tts) 조각을 한 파일로 이어 붙인 음원 + 문장 위치표 (2026-11-08)
# 내콘 본문·브릭스 본문 등에서 드라이브에 원음원이 없어 녹음 화면이 기계 목소리로 읽던 문제 (아이폰에서는 소리가 안 날 수 있어요)
# 사용: python3 tools/body_track.py   (tools/qrcheck/drive_audio.json = 드라이브 음원 폴더 파일 이름 목록)
import json, glob, os, re, subprocess, numpy as np, soundfile as sf
R = '/home/claude/enchool-rec'; T = R + '/kool/tts/'; SR = 24000; GAP = 0.7
plain = lambda t: re.sub(r'\s+', ' ', re.sub(r'[\[\]]', '', str(t))).strip()
mp = json.load(open(T + 'map.json')); DRV = set(json.load(open(R + '/tools/qrcheck/drive_audio.json')))
def pcm(fn):
    o = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', fn, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(o, dtype=np.float32)
made = 0; miss = []
for f in sorted(glob.glob(R + '/scripts/*.json')):
    nm = os.path.basename(f)[:-5]; d = json.load(open(f)); ch = False
    for b in d.get('body') or []:
        k = b.get('audio')
        if k and ((k.startswith('gh_') and os.path.exists(R + '/kool/aud/' + k + '.mp3')) or k in DRV): continue
        L = [x for x in (b.get('lines') or re.split(r'(?<=[.!?])\s+', b.get('text', ''))) if plain(x)]
        fns = [mp.get('\t' + plain(x)) for x in L]
        if not L or not all(fns): miss.append(nm + '.' + str(b.get('id'))); continue
        key = 'gh_' + nm + '_' + re.sub(r'[^A-Za-z0-9_]', '_', str(b['id']))
        parts = [np.zeros(int(SR * .4), np.float32)]; t = .4; plan = []
        for fn in fns:
            a = pcm(T + fn); plan.append([round(max(0, t - .05), 2), round(t + len(a) / SR + .05, 2), 1])
            parts += [a, np.zeros(int(SR * GAP), np.float32)]; t += len(a) / SR + GAP
        tmp = '/tmp/claude-0/-home-claude/eb84d13a-720f-538f-be80-bff5a201daef/scratchpad/_bt.wav'; sf.write(tmp, np.concatenate(parts), SR)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-ac', '1', '-b:a', '64k', R + '/kool/aud/' + key + '.mp3'], check=True)
        json.dump(plan, open(R + '/plans/' + key + '.json', 'w')); made += 1
        if k and k != key: b['audio_drive'] = k   # 원래 기다리던 드라이브 이름은 남겨 둬요 (나중에 원음원을 올리면 되돌릴 수 있게)
        b['audio'] = key; ch = True
    if ch:
        raw = open(f).read(); json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1 if raw.startswith('{\n') else None)
print('made', made, 'still missing', miss)
