/* 오늘 숙제를 다 끝낸 뒤 첫 화면 (2026-11-22 · 쿨보카·쿨톡·쿨본문 공통 — 세 앱 맨 끝에 그대로 넣어요)
   「🏆 오늘 숙제 끝! 잘했어!!」를 크게 보여 주고, 「모험 시작」은 못 누르게 흐리게(✓ 오늘 모험 완료).
   「원하면 한 번 더!」를 눌러야 「모험 시작 ▶」이 다시 살아나요 — 꼭 더 해야 하는 것처럼 보이지 않게. */
(function(){
 if(typeof qrBar!=='function')return;
 var AGAIN=false,_qb=qrBar;
 var css=document.createElement('style');css.textContent='#qrbar.fin{flex-direction:column;justify-content:center;text-align:center;gap:12px;padding:22px 14px;border-width:2px}'
  +'#qrbar.fin .qf-t{font-size:27px;font-weight:900;color:#102f5e;line-height:1.3;word-break:keep-all}'
  +'#qrbar.fin .qf-s{font-size:14px;color:#5b6474;margin:-6px 0 0}'
  +'.qf-again{border:1.5px solid #102f5e;background:#fff;color:#102f5e;border-radius:999px;padding:9px 20px;font:inherit;font-size:15px;font-weight:700;cursor:pointer}'
  +'body.qrfin #course .pickhint,body.qrfin #course .path{display:none}'
  +'body.qrfin #course .btn.go{pointer-events:none;margin-top:14px;background:#cfd4dc;border-color:#cfd4dc;color:#fff;box-shadow:none;font-size:0}'
  +'body.qrfin #course .btn.go::after{content:"✓ 오늘 모험 완료";font-size:18px}';
 document.head.appendChild(css);
 var run=function(){try{return !!COURSE}catch(e){return false}};
 window.qrBar=qrBar=function(){_qb.apply(this,arguments);var el=document.getElementById('qrbar');if(!el)return;
  var done=/다 했어요/.test(el.textContent)||el.classList.contains('fin')&&/숙제 끝/.test(el.textContent)&&false;
  if(done){el.classList.add('fin');el.innerHTML='<div class="qf-t">🏆 오늘 숙제 끝! 잘했어!!</div>'+(run()?'':AGAIN?'<p class="qf-s">한 번 더 하려면 아래 「모험 시작」을 눌러요</p>':'<p class="qf-s">오늘은 더 안 해도 돼요</p><button type="button" class="qf-again" id="qfAgain">원하면 한 번 더!</button>')}
  else el.classList.remove('fin');
  document.body.classList.toggle('qrfin',done&&!AGAIN&&!run())};
 document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('#qfAgain,[data-course]');if(!t)return;
  if(t.id==='qfAgain'){AGAIN=true;qrBar();var g=document.querySelector('#course .btn.go');if(g)g.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(document.body.classList.contains('qrfin')){e.stopPropagation();e.preventDefault();return}
  AGAIN=false;document.body.classList.remove('qrfin');setTimeout(function(){try{qrBar()}catch(err){}},80)},true);
 try{if(document.body.classList.contains('qrs'))qrBar()}catch(e){}
})();
