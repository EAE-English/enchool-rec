/* 고장 난 폰 흉내 점검 (2026-11-19)
   가상 폰은 소리가 늘 잘 끝나서, 「소리 끝 신호가 안 오는 폰」에서만 멈추는 오류를 못 잡았어요(세림 쿨본문 입영작 멈춤).
   그래서 일부러 ① 소리가 시작만 되고 안 끝남(noend) ② 음성 파일 받기가 안 끝남(hangfetch) ③ 소리 재생 거절(reject) 을 만들어 놓고
   그래도 화면이 스스로 다음으로 넘어가는지 봐요. 「✗」나 「못 감」이 한 줄이라도 나오면 고쳐야 해요.
   쓰는 법: 저장소 루트에서 python3 -m http.server 8765 --bind 127.0.0.1 켜고 → node tools/qrcheck/fault_rec.js   (PICK="(3)" 처럼 목록에서 고를 글자, 뒤에 rec 주소를 더 줄 수 있어요) */
const {chromium,devices}=require('playwright');const fs=require('fs');const ROOT=require('path').resolve(__dirname,'../..')+'/';
const URLS=process.argv.slice(2).length?process.argv.slice(2):['rec.html?k=bmviyiauzbrob_7&s=테스트&c=T'];if(!process.env.PICK)process.env.PICK='(3)';
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
for(const fault of ['noend','reject'])for(const u of URLS){const ctx=await b.newContext({...devices['Galaxy S9+'],permissions:['microphone']});const p=await ctx.newPage();const errs=[];p.on('console',m=>{if(/\/\//.test(m.text())&&fault==='noend')console.log('목록:',m.text().replace(/\s+/g,' ').slice(0,300))});p.on('pageerror',e=>errs.push(e.message.slice(0,100)));
 await p.route(/eae-english\.github\.io\/enchool-rec\//,r=>{const x=decodeURIComponent(r.request().url().split('/enchool-rec/')[1].split('?')[0]);const f=ROOT+x;if(!fs.existsSync(f))return r.fulfill({status:404,body:''});r.fulfill({status:200,contentType:/\.js$/.test(x)?'application/javascript':/\.json$/.test(x)?'application/json':/\.mp3$/.test(x)?'audio/mpeg':'text/html',body:fs.readFileSync(f)})});
 await p.route(/fonts\.g/,r=>r.fulfill({status:200,body:''}));await p.route(/script\.google|docs\.google/,r=>r.fulfill({status:200,body:'{"ok":true}'}));
 await p.addInitScript(f=>{const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(/^(data|blob)/.test(this.src)&&this.closest&&this.closest('#after'))return P.call(this);return f==='noend'?Promise.resolve():Promise.reject(new Error('NotAllowed'))};if(window.speechSynthesis)speechSynthesis.speak=()=>{}},fault);
 await p.goto('http://localhost:8765/'+u);await p.waitForTimeout(2500);
 if(await p.evaluate(()=>!document.getElementById('pick').hidden)){await p.evaluate(k=>{const B=[...document.querySelectorAll('#pick button')];console.log(B.map(x=>x.innerText).join(' // '));(B.find(x=>x.innerText.includes(k))||B[0]).click()},process.env.PICK||'');await p.waitForTimeout(500)}
 if(await p.evaluate(()=>!document.getElementById('rolePick').hidden))await p.evaluate(()=>document.querySelector('[data-role]').click());
 for(let t=0;t<30;t++){const st=await p.evaluate(()=>{const b=document.getElementById('tbox');return b.hidden?'':b.innerText});if(!/준비 중/.test(st))break;await p.waitForTimeout(1000)}
 const mode=await p.evaluate(()=>document.getElementById('appName').innerText+' / '+document.getElementById('title').innerText);
 // ① 먼저 듣기: 버튼이 스스로 되돌아오나
 let la='(버튼 없음)';if(await p.evaluate(()=>{const x=document.getElementById('listenAll');return x&&!x.hidden&&x.offsetParent})){await p.click('#listenAll');const t0=Date.now();la='40초 지나도 「그만 듣기」 그대로';for(let t=0;t<80;t++){await p.waitForTimeout(500);if(!/그만/.test(await p.evaluate(()=>document.getElementById('listenAll').textContent))){la=((Date.now()-t0)/1000).toFixed(1)+'초 뒤 되돌아옴';break}}
   if(/그대로/.test(la))await p.click('#listenAll')}
 // ② 녹음: 따라 읽는 줄이 계속 넘어가나 (60초 동안 지켜봄)
 await p.click('#go');const seen=new Set();let after=false,t0=Date.now(),nexts=0;
 for(let t=0;t<360;t++){await p.waitForTimeout(500);const s=await p.evaluate(()=>({f:(document.querySelector('.ln.cur')||{dataset:{}}).dataset.i,after:!document.getElementById('after').hidden,nx:!document.getElementById('next').hidden&&!document.getElementById('next').disabled}));seen.add(s.f);if(s.nx){nexts++;await p.click('#next').catch(()=>{})}if(s.after){after=true;break}}
 console.log([fault,mode.replace(/\s+/g,' '),'먼저듣기: '+la,'녹음: '+(after?((Date.now()-t0)/1000).toFixed(0)+'초에 끝 화면':'180초 안에 끝 화면 못 감')+' · 넘어간 줄 '+seen.size+' · 다음버튼 '+nexts,errs.slice(0,2).join(';')].join(' | '));await ctx.close()}
await b.close()})()
