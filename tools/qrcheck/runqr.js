const {chromium,devices}=require('playwright');const fs=require('fs');
const [IN,OUTF,BASE]=process.argv.slice(2);const Q=JSON.parse(fs.readFileSync(IN));const U=[...new Set(Q.filter(q=>q.url&&!q.warn&&q.url.includes('enchool-rec/')).map(q=>q.url))];
const OUT=[];
async function one(b,u0){const u=u0.replace('https://eae-english.github.io/enchool-rec/',''+(BASE||'http://127.0.0.1:8765/')+'');
 const c=await b.newContext({...devices['iPhone 13'],permissions:['microphone']});const p=await c.newPage();const R={u:u0,errs:[],sent:0};
 await p.addInitScript(()=>{window.__seq=[];window.__tts=0;const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){if(this.src&&!/^data/.test(this.src))window.__seq.push(Math.round(this.currentTime*10)/10);return P.call(this)};if(window.speechSynthesis){const S=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=x=>{window.__tts++;return S(x)}}});
 p.on('pageerror',e=>R.errs.push(e.message.slice(0,120)));
 await p.route(/script\.google|docs\.google/,r=>{const q=r.request();if(q.method()==='POST'||/a=(log|coin|kh)|formResponse/.test(q.url())){R.sent++;return r.fulfill({status:200,body:'{"ok":true}'})}return r.continue()});
 try{await p.goto(u,{timeout:30000});await p.waitForTimeout(2500);
  R.top=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,90);
  if(/kool\//.test(u))R.qrs=await p.evaluate(()=>document.body.classList.contains('qrs'));
  if(/rec\.html/.test(u)){
   R.items=[];const n=await p.evaluate(()=>document.querySelectorAll('#pick button[data-i], #pick .pk, #pick button').length);
   const labs=await p.evaluate(()=>[...document.querySelectorAll('#pick button')].map(x=>x.innerText.replace(/\s+/g,' ').slice(0,30)));
   const pickVisible=await p.evaluate(()=>!document.getElementById('pick').hidden);
   const todo=pickVisible?labs.map((l,i)=>i):[-1];
   for(const i of todo){
    if(i>=0){await p.evaluate(i=>{document.getElementById('pick').querySelectorAll('button')[i].click()},i);await p.waitForTimeout(400)}
    if(await p.evaluate(()=>!document.getElementById('rolePick').hidden)){await p.evaluate(()=>document.querySelector('[data-role]').click())}
    let st='';for(let t=0;t<40;t++){st=await p.evaluate(()=>{const b=document.getElementById('tbox');return b.hidden?'(없음)':b.innerText});if(!/준비 중/.test(st))break;await p.waitForTimeout(1000)}
    const mode=await p.evaluate(()=>document.getElementById('appName').innerText);const title=await p.evaluate(()=>document.getElementById('title').innerText);
    R.items.push({title,mode,st});
    if(!/요약|랩/.test(mode)){ // 첫 항목 녹음 15초
      await p.click('#go');
      for(let t=0;t<15;t++){await p.waitForTimeout(1000);const s=await p.evaluate(()=>({nx:!document.getElementById('next').hidden&&!document.getElementById('next').disabled,txt:document.getElementById('next').innerText}));if(s.nx){await p.click('#next');if(/말하기/.test(s.txt)){await p.waitForTimeout(1200);await p.click('#next')}}}
      if(await p.evaluate(()=>document.getElementById('after').hidden))await p.click('#go').catch(()=>{});
      await p.waitForTimeout(3000);
      R.recs=R.recs||[];R.rec=await p.evaluate(async()=>{const a=document.querySelector('#after audio');let d=null;if(a){await new Promise(ok=>{if(a.readyState>=1)ok();else a.onloadedmetadata=ok;setTimeout(ok,3000)});d=a.duration}return {title:document.getElementById('title').innerText,dur:d,timer:document.getElementById('timer').innerText,plays:window.__seq.length,tts:window.__tts}});R.recs.push(R.rec);await p.evaluate(()=>{window.__seq=[];window.__tts=0});
    }
    if(i>=0&&todo.length>1){await p.goto(u);await p.waitForTimeout(1500)}
   }}
 }catch(e){R.errs.push('X '+e.message.slice(0,100))}
 await c.close();return R}
(async()=>{const b=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required']});
 let k=0;const W=async()=>{while(k<U.length){const u=U[k++];const r=await one(b,u);OUT.push(r);fs.writeFileSync(''+OUTF+'',JSON.stringify(OUT,null,1));process.stdout.write('.')}};
 await Promise.all([W(),W(),W(),W()]);await b.close();console.log('done',OUT.length)})();
