const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['Galaxy S9+']});
for(const [app,h] of [['talk.html','test.n26_7.lta1'],['voca.html','test.n02_7'],['bon.html','test.n27_5.s5']]){const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8765/kool/'+app+'#'+h);await p.waitForTimeout(2500);
const r=await p.evaluate(async()=>{/* 소리가 끝나지 않은 것처럼 */window.TTSA=window.TTSA||{};const o=TTSA.playing;TTSA.playing=()=>true;let fin=0;const f0=finish;finish=function(){fin=Date.now()};ST={total:1,ok:1,wrong:[],q:[]};const t0=Date.now();finishSay();await new Promise(r=>setTimeout(r,7000));return fin?((fin-t0)/1000).toFixed(1)+'초 뒤 다음으로 넘어감':'7초가 지나도 안 넘어감'});
console.log(app,r,errs.slice(0,2));await p.close()}
await b.close()})()
