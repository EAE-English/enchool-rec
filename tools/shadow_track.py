# [Claude] 원음원 없는 단어 따라 읽기 묶음 → 미리 만든 목소리(kool/tts) 조각을 한 파일로 이어 붙인 음원 + 위치표 (2026-11-06)
# 아이폰에서 녹음 중 기계 목소리가 안 나고 녹음이 2초만 남던 문제 → 원음원 있는 책과 같은 방식(한 파일 재생)으로
import json, glob, os, re, subprocess, numpy as np, soundfile as sf
R='/home/claude/enchool-rec'; T=R+'/kool/tts/'; SR=24000; GAP=0.45
plain=lambda t: re.sub(r'\s+',' ',re.sub(r'[\[\]]','',str(t))).strip()
mp=json.load(open(T+'map.json')); made=0
def pcm(fn):
    o=subprocess.run(['ffmpeg','-loglevel','error','-i',fn,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(o,dtype=np.float32)
for f in sorted(glob.glob(R+'/scripts/*.json')):
    nm=os.path.basename(f)[:-5]; d=json.load(open(f)); ch=False
    for s in d.get('shadow') or []:
        if s.get('audio') and not s['audio'].startswith('gh_'): continue
        key='gh_'+nm+'_'+re.sub(r'[^A-Za-z0-9_]','_',str(s['id']))
        parts=[np.zeros(int(SR*.3),np.float32)]; t=.3; plan=[]
        for w in s['words']:
            for j,tx in enumerate([w['w']]+([w['ex']] if w.get('ex') else [])):
                a=pcm(T+mp['\t'+plain(tx)])
                plan.append([round(max(0,t),2),round(t+len(a)/SR,2),1]+(['e'] if j else []))
                parts+=[a,np.zeros(int(SR*GAP),np.float32)]; t+=len(a)/SR+GAP
        tmp='/tmp/claude-0/-home-claude/eb84d13a-720f-538f-be80-bff5a201daef/scratchpad/_s.wav'; sf.write(tmp,np.concatenate(parts),SR)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',tmp,'-ac','1','-b:a','64k',R+'/kool/aud/'+key+'.mp3'],check=True)
        json.dump(plan,open(R+'/plans/'+key+'.json','w')); made+=1
        if s.get('audio')!=key: s['audio']=key; ch=True
    if ch: json.dump(d,open(f,'w'),ensure_ascii=False)
print('made',made)
