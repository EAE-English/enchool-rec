# [Claude] 원음원 없는 본문(리더스뱅크3 등) → Kokoro로 본문 한 편을 이어 읽은 음원 + 문장 위치표 (2026-11-06)
# 녹음 화면이 원음원 있는 책처럼 「한 문장 듣고 → 따라 말하기」로 재생해요 (아이폰에서 녹음 중 기계 목소리가 안 나던 문제)
# 결과: kool/aud/<스크립트>_<본문id>.mp3 · plans/<같은 이름>.json · scripts/*.json 본문에 "audio" 키
import json, glob, os, re, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
R='/home/claude/enchool-rec'; KK='/tmp/claude-0/-home-claude/eb84d13a-720f-538f-be80-bff5a201daef/scratchpad/kk/'
k=Kokoro(KK+'kokoro-v1.0.onnx',KK+'voices-v1.0.bin')
GAP=0.7; V='af_heart'
only=sys.argv[1:]  # 스크립트 이름 일부 (예: n07_9)
made=0
for f in sorted(glob.glob(R+'/scripts/*.json')):
    nm=os.path.basename(f)[:-5]
    if only and not any(nm==o or nm.startswith(o) for o in only): continue
    d=json.load(open(f)); ch=False
    for b in d.get('body') or []:
        if b.get('audio') and not b['audio'].startswith('gh_'): continue
        key='gh_'+nm+'_'+b['id']; out=R+'/kool/aud/'+key+'.mp3'
        L=b.get('lines') or re.split(r'(?<=[.!?])\s+',b.get('text',''))
        if not os.path.exists(out) or not os.path.exists(R+'/plans/'+key+'.json'):
            sr=24000; parts=[np.zeros(int(sr*.4),dtype=np.float32)]; t=.4; plan=[]
            for line in L:
                say=re.sub(r'[“”]','"',re.sub(r'[‘’]',"'",line)).replace('—',', ').strip()
                a,sr=k.create(say,voice=V,speed=0.9,lang='en-us'); a=a.astype(np.float32)
                plan.append([round(max(0,t-.05),2),round(t+len(a)/sr+.08,2),1]); parts+= [a,np.zeros(int(sr*GAP),dtype=np.float32)]; t+=len(a)/sr+GAP
            tmp=KK+'_b.wav'; sf.write(tmp,np.concatenate(parts),sr)
            subprocess.run(['ffmpeg','-y','-loglevel','error','-i',tmp,'-ac','1','-ar','24000','-b:a','64k',out],check=True)
            json.dump(plan,open(R+'/plans/'+key+'.json','w')); made+=1
        if b.get('audio')!=key: b['audio']=key; ch=True
    if ch: json.dump(d,open(f,'w'),ensure_ascii=False,indent=1 if open(f).read().startswith('{\n') else None)
print('made',made)
