/* 고장 난 폰 흉내 점검 (2026-11-19)
   가상 폰은 소리가 늘 잘 끝나서, 「소리 끝 신호가 안 오는 폰」에서만 멈추는 오류를 못 잡았어요(세림 쿨본문 입영작 멈춤).
   그래서 일부러 ① 소리가 시작만 되고 안 끝남(noend) ② 음성 파일 받기가 안 끝남(hangfetch) ③ 소리 재생 거절(reject) 을 만들어 놓고
   그래도 화면이 스스로 다음으로 넘어가는지 봐요. 「✗」나 「못 감」이 한 줄이라도 나오면 고쳐야 해요.
   쓰는 법: 저장소 루트에서 python3 -m http.server 8765 --bind 127.0.0.1 켜고 → node tools/qrcheck/fault_kool.js */
const {chromium,devices}=require('playwright');const fs=require('fs');const ROOT=require('path').resolve(__dirname,'../..')+'/';
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
async function page(fault){const ctx=await b.newContext({...devices['Galaxy S9+'],permissions:['microphone']});const p=await ctx.newPage();
 // 깃허브 주소의 스크립트는 지금 고친 파일로
 await p.route(/eae-english\.github\.io\/enchool-rec\//,r=>{const u=decodeURIComponent(r.request().url().split('/enchool-rec/')[1].split('?')[0]);if(fault==='hangfetch'&&/kool\/tts\/.*\.mp3/.test(u))return;const f=ROOT+u;if(!fs.existsSync(f))return r.fulfill({status:404,body:''});r.fulfill({status:200,contentType:/\.js$/.test(u)?'application/javascript':/\.json$/.test(u)?'application/json':/\.mp3$/.test(u)?'audio/mpeg':'text/html',body:fs.readFileSync(f)})});
 await p.route(/fonts\.g/,r=>r.fulfill({status:200,body:''}));
 await p.route(/script\.google|docs\.google/,r=>r.fulfill({status:200,body:'{"ok":true}'}));
 await p.addInitScript(f=>{window.__F=f;
  if(f==='noend'||f==='hangfetch'){HTMLMediaElement.prototype.play=function(){return Promise.resolve()};/* 소리 시작 신호만 오고 진행도 끝도 없음 */
   if(window.speechSynthesis){speechSynthesis.speak=()=>{}}}
  if(f==='reject'){HTMLMediaElement.prototype.play=function(){return Promise.reject(new Error('NotAllowed'))};if(window.speechSynthesis)speechSynthesis.speak=()=>{}}
 },fault);return p}
const out=[];
for(const fault of ['noend','hangfetch','reject']){
 // A. 쿨톡·쿨본문: TTSA.play / speak 의 끝 신호
 for(const [app,h] of [['talk.html','test.n26_7.lta1'],['bon.html','test.n27_5.s5']]){const p=await page(fault);await p.goto('http://localhost:8765/kool/'+app+'#'+h);await p.waitForTimeout(2500);
  const r=await p.evaluate(async()=>{const res={};await TTSA.ready;const M=await (await fetch('https://eae-english.github.io/enchool-rec/kool/tts/map.json')).json();const k=Object.keys(M)[0].split('\t');
   const t0=Date.now();res.tts=await new Promise(ok=>{const s=TTSA.play(k[1],k[0],()=>ok(((Date.now()-t0)/1000).toFixed(1)+'초'));if(!s)ok('음성없음');setTimeout(()=>ok('20초 지나도 멈춤 ✗'),20000)});res.playingAfter=TTSA.playing();
   const t1=Date.now();res.speak=await new Promise(ok=>{speak('This sentence has no file zzz qqq.','B',()=>ok(((Date.now()-t1)/1000).toFixed(1)+'초'));setTimeout(()=>ok('25초 지나도 멈춤 ✗'),25000)});return res});
  out.push([fault,app,JSON.stringify(r)]);await p.close()}
}
console.log(out.map(x=>x.join(' | ')).join('\n'));await b.close()})()
