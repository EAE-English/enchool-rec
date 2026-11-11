# [Claude] QR 소리 점검 (2026-11-08 예원 쿨본문 무음): 아이들이 듣는 모든 문장·단어에 원어민(또는 미리 만든 자연스러운) 음원 파일이 있는지 봐요.
# 파일이 없으면 휴대폰 기계 목소리로 읽는데, 아이폰(무음 모드 등)에서는 소리가 안 날 수 있어요 → 「기계 목소리」로 잡아요.
# 사용: python3 tools/qrcheck/soundcheck.py [q.json]   (q.json을 주면 그 QR들만, 없으면 앱 전체)
import json, re, os, sys, urllib.parse
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
plain = lambda t: re.sub(r'\s+', ' ', re.sub(r'[\[\]]', '', str(t))).strip()
nz = lambda t: re.sub(r'[^a-z0-9]+', ' ', str(t or '').lower().replace('’', "'")).strip()
MP = json.load(open(R + '/kool/tts/map.json'))
AU = json.load(open(R + '/kool/aud.json'))
# 구글 드라이브 음원 폴더(선생님이 올린 원음원) 파일 이름 목록 — 점검 전에 새로 받아 두기 (README 참고)
DRV = set(json.load(open(os.path.dirname(os.path.abspath(__file__)) + '/drive_audio.json')))
has_trk = lambda k: os.path.exists(R + '/kool/aud/' + k + '.mp3') or k in DRV
has_tts = lambda who, t: (who + '\t' + plain(t)) in MP and os.path.exists(R + '/kool/tts/' + MP[who + '\t' + plain(t)])

def arr(s, i):
    d = 0; ins = esc = False; j = i
    while True:
        c = s[j]
        if ins:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': ins = False
        elif c == '"': ins = True
        elif c == '[': d += 1
        elif c == ']':
            d -= 1
            if d == 0: return s[i:j + 1]
        j += 1

def packs(f):
    s = open(R + '/kool/' + f).read(); P = {}
    for m in re.finditer(r'\{"id":"([^"]+)","bid":', s):
        i = s.find('"d":[', m.end()); P[m.group(1)] = json.loads(arr(s, i + 4))
    return P

TALK, BON = packs('talk.html'), packs('bon.html')
VS = open(R + '/kool/voca.html').read()
VOCA = {b['id']: b for b in json.loads(re.search(r'const BOOKS=(\[.*?\]);\n', VS, re.S).group(1))}

def chk_lines(P, pid, steps=None):
    d = P.get(pid)
    if d is None: return None, ['팩 없음 ' + pid]
    tot = bad = 0; ex = []
    for u in d:
        if steps and str(u.get('st')) not in steps: continue
        for l in u.get('L', []):
            tot += 1
            if not has_tts(l[0], l[1]): bad += 1; ex.append(plain(l[1])[:40])
    return (tot, bad), ex[:3]

def chk_voca(ids):
    tot = bad = 0; ex = []
    for i in ids:
        b = VOCA.get(i)
        if not b: return None, ['단어장 없음 ' + i]
        for st in b['sets']:
            for w in st['W']:
                tot += 1
                if nz(w[0]) not in AU and not has_tts('', w[0]): bad += 1; ex.append(w[0])
    return (tot, bad), ex[:3]

def chk_rec(k):
    # rec.html?k=<스크립트>.<항목,항목> 또는 k=<트랙키>~... : 항목마다 음원(파일·계획표)이 있는지
    if '.' not in k:
        m = re.match(r'^(.+?)_(\d+(?:~\d+)*)$', k)
        names = [m.group(1) + '_' + n for n in m.group(2).split('~')] if m else [k]
        tot = bad = 0; ex = []
        for nm in names:
            f = R + '/scripts/' + nm + '.json'
            if not os.path.exists(f): tot += 1; bad += 1; ex.append('대본 없음 ' + nm); continue
            d = json.load(open(f)); ids = [str(x['id']) for x in d.get('shadow') or []] + [str(x['id']) for x in d.get('body') or []]
            r, e = chk_rec(nm + '.' + ','.join(ids)); tot += r[0]; bad += r[1]; ex += e
        return (tot, bad), ex
    nm, its = k.split('.', 1); f = R + '/scripts/' + nm + '.json'
    if not os.path.exists(f): return None, ['대본 없음 ' + nm]
    d = json.load(open(f)); tot = bad = 0; ex = []
    allit = {str(x.get('id')): ('dlg', x) for x in d.get('dialogs') or []}
    allit.update({str(x.get('id')): ('body', x) for x in d.get('body') or []})
    allit.update({str(x.get('id')): ('sh', x) for x in d.get('shadow') or []})
    for i in its.split(','):
        t = allit.get(i)
        if not t: tot += 1; bad += 1; ex.append('항목 없음 ' + i); continue
        kind, x = t; tot += 1
        key = x.get('ra') if kind == 'dlg' else x.get('audio')
        ok = bool(key) and has_trk(key)
        if not ok and kind == 'dlg':
            ok = all(has_tts(l[0], l[1]) for l in x.get('L', []))
        if not ok: bad += 1; ex.append(f'{i} 음원 없음')
    return (tot, bad), ex

def check(u):
    p = urllib.parse.urlparse(u); h = p.fragment.split('.')
    if p.path.endswith('/kool/bon.html') or p.path.endswith('/kool/talk.html'):
        P = BON if 'bon' in p.path else TALK; pid = h[1] if len(h) > 1 else ''
        st = None
        if len(h) > 2 and h[2].startswith('s'): st = set(re.findall(r'\d+', h[2]))
        return chk_lines(P, pid, st)
    if p.path.endswith('/kool/voca.html'):
        return chk_voca([x for x in h[1:] if re.search(r'_\d', x)])
    if p.path.endswith('/rec.html'):
        k = urllib.parse.parse_qs(p.query).get('k', [''])[0]
        return chk_rec(k)
    return 'skip', []

if __name__ == '__main__':
    if len(sys.argv) > 1:
        Q = json.load(open(sys.argv[1])); U = sorted({q['url'] for q in Q if q.get('url') and not q.get('warn')})
    else:
        U = [f'x/kool/bon.html#t.{k}' for k in BON] + [f'x/kool/talk.html#t.{k}' for k in TALK] + [f'x/kool/voca.html#t.{k}' for k in VOCA]
    bad = 0
    # 새로 온 아이: 쿨앱(쿨보카·쿨톡·쿨본문) 학생 목록에 없으면 QR이 엉뚱한 책(맨 앞 책)으로 열려요 (2026-11-11 민아 → 워마고등)
    STU = {}
    for app in ('voca.html', 'talk.html', 'bon.html'):
        m = re.search(r'const STUDENTS=(\{.*?\});', open(R + '/kool/' + app).read()); STU[app] = json.loads(m.group(1)) if m else {}
    for u in U:
        p = urllib.parse.urlparse(u); app = p.path.split('/')[-1]
        if app in STU and p.fragment:
            code = p.fragment.split('.')[0].lower()
            if code not in STU[app] and not code.startswith(('t', 'n0', 'n1', 'n2', 'b')) or (code.startswith('sm') and code not in STU[app]):
                bad += 1; print('❌ 쿨앱 학생 목록에 없음(엉뚱한 책이 열림)', app, code, u.split('enchool-rec/')[-1][:70])
    for u in U:
        r, ex = check(u)
        if r == 'skip': continue
        if r is None or r[1]:
            bad += 1; print('❌ 기계 목소리/음원 없음', u.split('enchool-rec/')[-1][:70], '' if r is None else f'{r[1]}/{r[0]}', ex)
    print(f'소리 점검: {len(U)}개 중 문제 {bad}개')
