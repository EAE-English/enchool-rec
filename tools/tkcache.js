/* 한 번 받은 원어민 음원·음원 위치표는 폰(브라우저)에 저장해 두고 다시 안 받음 (쿨보카·녹음 화면 같이 씀 · 2026-11-03) */
const TKDB=(()=>{let p=null;const db=()=>p||(p=new Promise((ok,no)=>{try{const r=indexedDB.open('enchool_aud',1);r.onupgradeneeded=()=>r.result.createObjectStore('t');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}}));
 return {get:k=>db().then(d=>new Promise(ok=>{try{const q=d.transaction('t').objectStore('t').get(k);q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ok(null)}catch(e){ok(null)}})).catch(()=>null),
  put:(k,v)=>db().then(d=>{try{d.transaction('t','readwrite').objectStore('t').put(v,k)}catch(e){}}).catch(()=>{})}})();
const AUDV='a1';   /* 음원 파일을 고치면 이 값을 바꿔서 다시 받게 */
function getTrack(k){return TKDB.get(AUDV+'|'+k).then(c=>c&&c.by?{ok:true,by:c.by,mime:c.mime}:fetch(LOG+'?a=track&k='+encodeURIComponent(k)).then(r=>r.json()).then(j=>{if(!j.ok)return {ok:false};const u=Uint8Array.from(atob(j.b64),c=>c.charCodeAt(0));TKDB.put(AUDV+'|'+k,{by:u.buffer.slice(0),mime:j.mime||'audio/mpeg'});return {ok:true,by:u.buffer,mime:j.mime}}))}
