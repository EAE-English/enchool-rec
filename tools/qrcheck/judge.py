# [Claude] 점검 결과 → 「됨/안 됨」 요약 (2026-11-06) — 사용: python3 judge.py <listqr out.json> <runqr out.json>
import json, re, sys, collections
Q = json.load(open(sys.argv[1])); R = {r['u']: r for r in json.load(open(sys.argv[2]))}
bad = []; ok = 0
app = lambda u: re.sub(r'[?#].*', '', u.split('enchool-rec/')[1]) if 'enchool-rec/' in u else u[:40]
for q in Q:
    who = f"{q.get('name') or q['sid']}({q['sh'].split('_')[0]}) {q['lab']}"
    if q.get('err'): bad.append(f"❌ {who} · QR을 만들지 못함: {q['err'][:80]}"); continue
    if q.get('warn'): bad.append(f"⚠️ {who} · 숙제장 경고(QR 없음)"); continue
    u = q.get('url')
    if not u or 'enchool-rec/' not in u: continue
    r = R.get(u)
    if not r: bad.append(f"❌ {who} · 점검 못 함"); continue
    p = []
    if r['errs']: p.append('화면 오류 ' + r['errs'][0][:60])
    if '/kool/bbi.html' in u:  # 삐딱동사: 아이 이름 없이 듣기만 하는 화면 (2026-11-13) — 동사표가 떴는지만 봐요
        if '삐딱동사' not in r.get('top', '') or re.search(r'못 받았어요', r.get('top', '')): p.append('삐딱동사 화면이 안 열림')
    elif '/kool/' in u and not r.get('qrs'): p.append('목록 화면으로 열림')
    if re.search(r'대본이 없|아직 없어요', r.get('top', '')): p.append('대본 없음')
    for it in r.get('items') or []:
        if not re.search(r'음원 준비 끝|\(없음\)', it['st']): p.append(f"음원 안 됨: {it['title'][:25]}")
    for rc in r.get('recs') or []:
        try: t = int(rc['timer'][-2:]) + 60 * int(rc['timer'][-5:-3])
        except Exception: t = None
        if rc['tts'] or not rc['plays'] or not rc['dur'] or (t and abs(rc['dur'] - t) > 2): p.append(f"녹음 이상: {rc.get('title','')[:20]} {rc}")
    if p: bad.append(f"❌ {who} · " + ' / '.join(p))
    else: ok += 1
print(f"QR {ok + len([b for b in bad if b.startswith('❌')])}개 중 됨 {ok}개 · 안 됨 {len([b for b in bad if b.startswith('❌')])}개 · 경고 {len([b for b in bad if b.startswith('⚠️')])}개")
for b in bad: print(b)
