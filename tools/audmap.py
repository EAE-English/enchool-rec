"""[Claude] 쿨보카 원어민 음원 지도: plans(나누기) + scripts(단어·예문) → kool/aud.json (2026-10-31)
단어·예문마다 음원의 [시작, 끝] 초를 찾아요. 길이로 맞춰 보고(DP), 잘 안 맞는 Day는 빼요(그 Day는 TTS)."""
import json,glob,os,re,math
def norm(t): return re.sub(r'[^a-z0-9]+',' ',str(t).lower().replace('’',"'")).strip()
def expd(t,sc): return sc*(0.3+0.055*len(t))
def align(items,E):
    best=None
    for sc in [x/20 for x in range(10,41)]:
        n,m=len(items),len(E);INF=1e9
        D=[[INF]*(m+1) for _ in range(n+1)];B=[[None]*(m+1) for _ in range(n+1)];D[0][0]=0
        for i in range(n+1):
            for j in range(m+1):
                c=D[i][j]
                if c>=INF: continue
                if j<m and c+0.8<D[i][j+1]: D[i][j+1]=c+0.8;B[i][j+1]=(i,j,None)
                if i<n:
                    for k in range(j+1,min(m,j+3)+1):
                        d=E[k-1][1]-E[j][0];cc=c+abs(math.log(max(d,.05)/expd(items[i][0],sc)))+(0.3*(k-j-1))
                        if cc<D[i+1][k]: D[i+1][k]=cc;B[i+1][k]=(i,j,(E[j][0],E[k-1][1]))
        j=min(range(m+1),key=lambda x:D[n][x]);c=D[n][j]
        if c>=INF: continue
        if best is None or c<best[0]:
            out=[None]*n;i=n
            while i>0 or j>0:
                pi,pj,sg=B[i][j]
                if sg: out[pi]=sg
                i,j=pi,pj
            best=(c,out,sc)
    return best
M={};rep=[]
for pf in sorted(glob.glob('plans/*.json')):
    key=os.path.basename(pf)[:-5];m=re.match(r'^(.+)_(\d+)-(\d+)$',key)
    if not m: continue
    sf=f'scripts/{m[1]}_{m[2]}.json'
    if not os.path.exists(sf): continue
    its=[x for x in json.load(open(sf)).get('shadow',[]) if x.get('audio')==key]
    if not its: continue
    items=[]
    for w in its[0]['words']:
        items.append((w['w'],'w'))
        for p in (w.get('ex') or '').split(' / '):
            if p.strip(): items.append((p.strip(),'e'))
    E=[x for x in json.load(open(pf)) if (x[2] if len(x)>2 else 1)!=0]
    r=align(items,E)
    if not r: rep.append((key,'fail',len(E),len(items)));continue
    c,out,sc=r;avg=c/len(items)
    rep.append((key,round(avg,2),len(E),len(items)))
    if avg>0.45: continue
    for (t,_),sg in zip(items,out):
        if sg:
            L=M.setdefault(norm(t),[])
            if not any(x[0]==key for x in L): L.append([key,round(sg[0],2),round(sg[1],2)])
json.dump(M,open('kool/aud.json','w'),separators=(',',':'))
for r in rep: print(*r)
print('entries',len(M),'keys ok',sum(1 for r in rep if r[1]!='fail' and r[1]<=0.45),'/',len(rep))
