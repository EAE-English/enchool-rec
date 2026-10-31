"""[Claude] 쿨보카·쿨톡·쿨본문을 GitHub Pages에도 올림 (Claude 앱이 claude.ai QR을 가로채는 휴대폰용 · 2026-10-31)
사용: python3 tools/make_kool.py  (원본: /home/claude/words/단어마스터.html, /home/claude/dialogue/live.html, /home/claude/bon/쿨본문.html)"""
import re
G='https://eae-english.github.io/enchool-rec/kool/'
MAP={'https://claude.ai/artifact/Dpya8Pt4HZAs1trsu5HahP':G+'voca.html','https://claude.ai/artifact/5YGausaL8BVc5K1GqsUEzG':G+'talk.html','https://claude.ai/artifact/1qQfccPrdGXketezkcJ9ki':G+'bon.html'}
KAKAO_JS='<script>/* 카톡 안 작은 브라우저면 바깥 브라우저로 다시 열기 (소리·마이크가 막혀서 · 2026-10-31) */(function(){try{if(/KAKAOTALK/i.test(navigator.userAgent)&&!/[?&#]noext/.test(location.href)){location.href="kakaotalk://web/openExternal?url="+encodeURIComponent(location.href)}}catch(e){}})();</script>'
SK='<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
for src,out in [('/home/claude/words/단어마스터.html','voca.html'),('/home/claude/dialogue/live.html','talk.html'),('/home/claude/bon/쿨본문.html','bon.html')]:
    s=open(src,encoding='utf8').read()
    if not s.lstrip().lower().startswith('<!doctype'): s=SK+s+'</body></html>'
    for a,b in MAP.items(): s=s.replace(a,b)
    s=s.replace('<body>',KAKAO_JS+'<body>',1) if '<body>' in s else KAKAO_JS+s
    if out=='voca.html':
        a='on=speechSynthesis.speaking||speechSynthesis.pending'
        assert s.count(a)==1; s=s.replace(a,a+'||!!window.__audOn')
        i=s.rfind('</body>'); s=s[:i]+'<script>'+open('/home/claude/enchool-rec/tools/voca_aud.js',encoding='utf8').read()+'</script>'+s[i:]
    open('/home/claude/enchool-rec/kool/'+out,'w',encoding='utf8').write(s);print(out,len(s))
