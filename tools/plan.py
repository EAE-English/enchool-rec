"""[Claude] 따라 읽기 음원 나누기 계획 만들기 (한국어 뜻은 따라 하지 않고 넘어가게)
사용: python3 tools/plan.py 음원.mp3 plans/<책ID_단원>.json
결과: [[시작초, 끝초, 1=영어(멈추고 따라 하기) / 0=한국어(그냥 듣고 넘어감)], ...]
"""
import json, sys, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0]); import grade
from faster_whisper import WhisperModel

def main(src, out, gap=0.45):
    a = grade.pcm(src); hop = 320
    F = np.array([10 * np.log10((a[i:i + hop] ** 2).mean() + 1e-12) for i in range(0, len(a) - hop, hop)])
    th = max(-50, np.sort(F)[::-1][int(len(F) * 0.05)] - 30)
    segs, st, q = [], -1, 0
    for i, v in enumerate(F):
        if v > th:
            if st < 0: st = i
            q = 0
        elif st >= 0:
            q += 1
            if q * 0.02 >= gap: segs.append([st * 0.02, (i - q + 1) * 0.02]); st, q = -1, 0
    if st >= 0: segs.append([st * .02, len(F) * .02])
    segs = [s for s in segs if s[1] - s[0] >= 0.2]
    m = WhisperModel('small', device='cpu', compute_type='int8')
    plan = []
    for s0, e0 in segs:
        sl = np.concatenate([a[int(max(0, s0 - 0.05) * 16000):int((e0 + 0.1) * 16000)], np.zeros(16000, np.float32)])
        d = dict(m.detect_language(sl)[2] or [])
        plan.append([round(max(0, s0 - 0.05), 2), round(e0 + 0.1, 2), 0 if d.get('ko', 0) > d.get('en', 0) else 1])
    json.dump(plan, open(out, 'w'))
    print(len(plan), 'segments,', sum(p[2] for p in plan), 'to repeat')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
