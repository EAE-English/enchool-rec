// [Claude] 숙제장 QR 목록 뽑기 (2026-11-06) — 사용: node listqr.js <학습관리실.html> <DB 내려받은 폴더> <날짜 YYYY-MM-DD[,YYYY-MM-DD]> <out.json>
// DB 폴더: books/ students/ sheets/ classes/ settings/ 안에 문서 JSON (ArtifactData out_dir 형식)
const {chromium}=require('playwright');const fs=require('fs');const [LMS,D0,DAY,OUT]=process.argv.slice(2);const D=D0.replace(/\/?$/,'/');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+LMS);await p.waitForTimeout(3000);
const rd=c=>{const o={};if(!fs.existsSync(D+c))return o;for(const f of fs.readdirSync(D+c)){const d=JSON.parse(fs.readFileSync(D+c+'/'+f));d.id=d.id||f.replace('.json','');o[d.id]=d}return o};
const SH=Object.fromEntries(Object.entries(rd('sheets')).filter(([k,v])=>DAY.split(',').includes(v.date||k.slice(-10))));
const out=await p.evaluate(([B,ST,SH,CL,SE])=>{S.books=B;S.students=ST;S.classes=CL;S.settings=SE||{};window.koolQrImg=()=>'x';const R=[];
 for(const sh of Object.values(SH)){const sids=sh.sid?[sh.sid]:Object.values(ST).filter(s=>s.cls===sh.cls&&s.status!=="퇴원").map(s=>s.id);
  for(const sid of sids){let L;try{L=hwQrList(sh,sid)}catch(e){R.push({sh:sh.id,sid,err:String(e)});continue}
   L.forEach(q=>R.push({sh:sh.id,sid,name:(ST[sid]||{}).krName||'',lab:q.lab,url:q.href||q.url||null,warn:q.warn?String(q.lab):''}))}}
 return R},[rd('books'),rd('students'),SH,rd('classes'),rd('settings')]);
fs.writeFileSync(OUT,JSON.stringify(out,null,1));console.log('sheets',Object.keys(SH).length,'qr',out.length,'pageErrors',errs.length);await b.close()})();
