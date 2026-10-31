/* 쿨보카 원어민 음원 (GitHub 주소에서만 · 2026-10-31): kool/aud.json 지도로 그 단어·예문 부분만 재생, 없거나 받는 중이면 TTS */
(function(){
const LOG='https://script.google.com/macros/s/AKfycbwdK8492SzMcrc_hmwGWIquliehqASMrSAhbXJ5D-UyygkmwYvO23LWDzU8O44UrGQD/exec';
let AM=null;const TK={},LD={};
const nz=t=>String(t||'').toLowerCase().replace(/’/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
async function toWav(buf){const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!C)return null;const SR=22050,ctx=new C(1,SR,SR);
 const ab=await new Promise((ok,no)=>{const r=ctx.decodeAudioData(buf,ok,no);if(r&&r.then)r.then(ok,no)});const n=ab.length,ch=ab.numberOfChannels,d=new DataView(new ArrayBuffer(44+n*2)),w=(o,t)=>{for(let i=0;i<t.length;i++)d.setUint8(o+i,t.charCodeAt(i))};
 w(0,'RIFF');d.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,ab.sampleRate,true);d.setUint32(28,ab.sampleRate*2,true);d.setUint16(32,2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*2,true);
 const cs=[];for(let c=0;c<ch;c++)cs.push(ab.getChannelData(c));for(let i=0;i<n;i++){let v=0;for(let c=0;c<ch;c++)v+=cs[c][i];v=Math.max(-1,Math.min(1,v/ch));d.setInt16(44+i*2,v<0?v*0x8000:v*0x7fff,true)}
 return URL.createObjectURL(new Blob([d],{type:'audio/wav'}))}
function load(k){if(LD[k])return LD[k];LD[k]=fetch(LOG+'?a=track&k='+encodeURIComponent(k)).then(r=>r.json()).then(j=>{if(!j.ok)throw 0;const by=Uint8Array.from(atob(j.b64),c=>c.charCodeAt(0));
  return toWav(by.buffer.slice(0)).catch(()=>null).then(u=>{TK[k]=u||URL.createObjectURL(new Blob([by],{type:j.mime||'audio/mpeg'}))})}).catch(()=>{TK[k]='none'});return LD[k]}
function pre(){const ids=(location.hash||'').slice(1).split('.').slice(1).filter(x=>/_\d/.test(x));if(!ids.length)return;const ks=new Set();
 Object.values(AM).forEach(L=>L.forEach(c=>{if(ids.some(id=>c[0].indexOf(id+'-')===0))ks.add(c[0])}));[...ks].sort().reduce((p,k)=>p.then(()=>load(k)),Promise.resolve())}
fetch('aud.json',{cache:'no-cache'}).then(r=>r.json()).then(j=>{AM=j;pre()}).catch(()=>{});
window.addEventListener('hashchange',()=>{if(AM)pre()});
function pick(t){if(!AM)return null;const L=AM[nz(t)];if(!L)return null;return L.find(c=>TK[c[0]]&&TK[c[0]]!=='none')||L.find(c=>LD[c[0]])||L[0]}
const tts=window.speak;let A=null,T=null;
window.speak=function(t,slow){const c=pick(t);if(!c)return tts(t,slow);const k=c[0];
 if(!TK[k]){load(k);return tts(t,slow)}if(TK[k]==='none')return tts(t,slow);
 try{speechSynthesis.cancel()}catch(e){}clearTimeout(T);if(!A)A=new Audio();if(A.src!==TK[k])A.src=TK[k];
 A.playbackRate=slow?.7:1;A.preservesPitch=true;A.webkitPreservesPitch=true;
 const go=()=>{try{A.currentTime=Math.max(0,c[1]-.05)}catch(e){}window.__audOn=true;A.play().then(()=>{(function w(){if(A.paused||A.currentTime>=c[2]+.08){A.pause();window.__audOn=false;return}T=setTimeout(w,25)})()},()=>{window.__audOn=false;tts(t,slow)})};
 if(A.readyState>=1)go();else{A.onloadedmetadata=()=>{A.onloadedmetadata=null;go()};A.load()}};
})();
