# [Claude] 역할극: 대화문 한 편의 대사를 미리 만든 목소리(kool/tts)로 한 파일에 이어 붙임 + 줄 위치표 [시작, 끝, 줄번호] (2026-11-06)
# 녹음 중에는 이 한 파일에서 상대 대사 구간만 틀어요 (폰 기계 목소리·짧은 파일 바꿔 틀기 안 씀 → 아이폰 무음·3초 녹음 문제)
import json, glob, os, re, subprocess, numpy as np, soundfile as sf
R='/home/claude/enchool-rec'; T=R+'/kool/tts/'; SR=24000; GAP=0.35
key=lambda w,t: str(w or '')+'\t'+re.sub(r'\s+',' ',re.sub(r'[\[\]]','',str(t))).strip()
mp=json.load(open(T+'map.json')); made=0
def pcm(fn):
    o=subprocess.run(['ffmpeg','-loglevel','error','-i',fn,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(o,dtype=np.float32)
for f in sorted(glob.glob(R+'/scripts/*.json')):
    nm=os.path.basename(f)[:-5]; d=json.load(open(f)); ch=False
    for g in d.get('dialogs') or []:
        k='gh_'+nm+'_'+re.sub(r'[^A-Za-z0-9_]','_',str(g['id']))+'_r'
        out=R+'/kool/aud/'+k+'.mp3'; pl=R+'/plans/'+k+'.json'
        parts=[np.zeros(int(SR*.3),np.float32)]; t=.3; plan=[]
        for n,l in enumerate(g['L']):
            a=pcm(T+mp[key(l[0],l[1])]); plan.append([round(t,2),round(t+len(a)/SR,2),n])
            parts+=[a,np.zeros(int(SR*GAP),np.float32)]; t+=len(a)/SR+GAP
        tmp='/tmp/claude-0/-home-claude/eb84d13a-720f-538f-be80-bff5a201daef/scratchpad/_r.wav'; sf.write(tmp,np.concatenate(parts),SR)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',tmp,'-ac','1','-b:a','64k',out],check=True)
        json.dump(plan,open(pl,'w')); made+=1
        if g.get('ra')!=k: g['ra']=k; ch=True
    if ch: json.dump(d,open(f,'w'),ensure_ascii=False)
print('made',made)
