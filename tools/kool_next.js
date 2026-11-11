/* [Claude] 쿨톡·쿨본문: 오늘 숙제(QR)가 여러 개면 하나 끝낼 때마다 무조건 다음 것 하라고 (2026-11-11)
   - 홈: 「계속 학습을 이어가세요! · ✅ ○○ 완료 · 남은 대화문 · ▶ ○○ 시작하기」 (쿨보카와 같은 모양), 다 하면 「오늘 숙제 끝」
   - 결과 창: 선생님께 보낸 뒤 맨 앞 버튼이 「▶ 다음 숙제: ○○ 시작하기」
   - 끝낸 것 = 통째로 마스터 통과했거나, 오늘의 모험(틀린 문장까지)을 끝까지 한 것 */
(function(){
if(typeof qrTargets!=='function'||typeof home!=='function')return;
var BON=/bon\.html/.test(location.pathname),W=BON?'본문':'대화문',APP=BON?'쿨본문':'쿨톡';
var css=document.createElement('style');
css.textContent='#qrgo{text-align:center;background:#fff;border:2px solid var(--gold,#f2c94c);border-radius:16px;padding:14px 14px 16px;margin:0 2px 12px}#qrgo .qg-go{font-size:24px;font-weight:800;color:#c0392b;line-height:1.3}#qrgo .qg-ok{font-size:16px;font-weight:800;color:var(--navy,#102f5e);margin-top:4px}#qrgo .qg-ok.big{font-size:22px}#qrgo .qg-rem{font-size:14px;color:var(--navy,#102f5e);margin-top:6px}#qrgo .qg-rem b{color:#c0392b}#qrgo .qg-btn{width:100%;margin-top:12px}body:not(.qrs) #qrgo{display:none}#nextRow .qg-nx{width:100%;font-size:17px;padding:12px}#nextRow .qg-nxl{width:100%;text-align:center;font-weight:800;color:#c0392b;font-size:16px;margin-bottom:4px}';
document.head.appendChild(css);
var done=function(d){var r=rec(d.id);return isM(r)||(r.courses||0)>0};
var nm=function(d){return d.t||d.id};
window.qrPick=qrPick=function(){if(COURSE)return;var T=qrTargets();if(!T.length)return;var cur=T.find(function(d){return d.id===CUR});
 if(!cur||done(cur)){var nx=T.find(function(d){return !done(d)});if(nx)CUR=nx.id;else if(!cur)CUR=T[0].id}};
window.qrBar=qrBar=function(){var T=qrTargets(),i=Math.max(0,T.findIndex(function(d){return d.id===CUR})),n=T.filter(done).length;var el=document.getElementById('qrbar');
 if(!el){el=document.createElement('div');el.id='qrbar';document.getElementById('course').before(el)}
 el.innerHTML=n>=T.length?'🏆 오늘 숙제 <b>다 했어요!</b>':'📌 오늘 숙제 <b>'+(T.length>1?T.length+'개 중 '+(i+1)+'번째 · '+esc(nm(dlg())):esc(nm(dlg())))+'</b>'+(T.length>1?'<span>완료 '+n+' / '+T.length+'</span>':'')};
function qrGo(){var el=document.getElementById('qrgo'),T=qrTargets();if(T.length<2){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='qrgo';document.getElementById('qrbar').after(el)}
 var D=T.filter(done),R=T.filter(function(d){return !done(d)});if(!D.length){el.hidden=true;return}el.hidden=false;
 var nx=R.find(function(d){return d.id===CUR})||R[0];
 el.innerHTML=R.length?'<div class="qg-go">계속 학습을 이어가세요!</div><div class="qg-ok">✅ '+D.map(nm).map(esc).join(' · ')+' 완료!</div><div class="qg-rem">남은 '+W+': <b>'+R.map(nm).map(esc).join(' · ')+'</b> ('+R.length+'개)</div><button class="btn pri lg qg-btn" data-qgo="'+nx.id+'">▶ '+esc(nm(nx))+' 시작하기</button>'
  :'<div class="qg-ok big">🎉 오늘 '+APP+' 숙제 끝!</div><div class="qg-rem">'+T.map(nm).map(esc).join(' · ')+' 모두 했어요.</div>'}
function goNext(id){var r=document.getElementById('result');if(r)r.hidden=true;document.getElementById('act').hidden=true;COURSE=null;CUR=id;home();startCourse()}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-qgo],[data-qnx]');if(!b)return;e.preventDefault();e.stopPropagation();goNext(b.dataset.qgo||b.dataset.qnx)},true);
var _h=home;window.home=home=function(){_h();if(QRS()){try{qrGo()}catch(e){}}else{var g=document.getElementById('qrgo');if(g)g.hidden=true}};
/* 결과 창: 보낸 뒤(원래 버튼이 300ms 뒤에 나옴) 맨 앞에 「다음 숙제」 */
var s=document.getElementById('sendT');
if(s)s.addEventListener('click',function(){setTimeout(function(){if(!QRS())return;var T=qrTargets();if(T.length<2)return;var R=T.filter(function(d){return !done(d)}),row=document.getElementById('nextRow');if(!row)return;
 if(R.length){var nx=R[0];row.innerHTML='<div class="qg-nxl">계속 학습을 이어가세요! (남은 '+W+' '+R.length+'개)</div><button class="btn pri qg-nx" data-qnx="'+nx.id+'">▶ 다음 숙제: '+esc(nm(nx))+' 시작하기</button>'}
 else row.innerHTML='<div class="qg-nxl" style="color:#1b7a45">🎉 오늘 '+APP+' 숙제 끝! 모두 했어요.</div>';row.hidden=false},420)});
home();
})();
