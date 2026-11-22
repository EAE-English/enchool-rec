/* 오늘 숙제를 다 끝낸 뒤 첫 화면 (2026-11-22 · 쿨보카·쿨톡·쿨본문 공통 — 세 앱 맨 끝에 그대로 넣어요)
   「🏆 오늘 숙제 끝! 잘했어!!」를 크게 보여 주고, 큰 버튼은 못 누르게 흐리게(✓ 오늘 모험 완료) — 꼭 더 해야 하는 것처럼 보이지 않게.
   그 아래는 「선택 학습」: 필수 없이 하고 싶은 번호만 골라서 한 번 더 할 수 있어요. 번호를 고르면 「고른 게임 시작 ▶」이 살아나요.
   선택 학습 기록은 「… · 선택 학습」으로 따로 남고, 이미 끝낸 숙제(마스터 완료)는 바꾸지 않아요. */
(function(){
 if(typeof qrBar!=='function'||typeof courseSteps!=='function'||typeof renderCourse!=='function')return;
 var DONE=false,FS=[],_qb=qrBar,_cs=courseSteps,_rc=renderCourse,_sc=startCourse;
 var VOCA=typeof REQ==='undefined',ORDER=VOCA?['card'].concat(POOL,['write']):['listen'].concat(POOL,['role','write']);
 var css=document.createElement('style');css.textContent='#qrbar.fin{flex-direction:column;justify-content:center;text-align:center;gap:10px;padding:22px 14px;border-width:2px}'
  +'#qrbar.fin .qf-t{font-size:27px;font-weight:900;color:#102f5e;line-height:1.3;word-break:keep-all}'
  +'#qrbar.fin .qf-s{font-size:15px;color:#5b6474;margin:0}'
  +'#course .btn.go.qf-off{pointer-events:none;background:#cfd4dc;border-color:#cfd4dc;color:#fff;box-shadow:none}'
  +'#course .path.pick [data-ftog]:not(.on) .st{background:#fff;border:2px solid #9fb3cf;color:#102f5e;opacity:1}#course .path.pick [data-ftog]:not(.on) small{color:#102f5e;opacity:1}#course .path.pick [data-ftog]{opacity:1}'
  +'#course .pickhint.qf-h{font-size:15px;color:#102f5e;line-height:1.55;background:#f3f6fb;border-radius:12px;padding:10px 12px}#course .pickhint.qf-h small{display:block;margin-top:4px;font-size:13.5px;color:#8a5a00;font-weight:700}';
 document.head.appendChild(css);
 var run=function(){try{return !!COURSE}catch(e){return false}};
 var free=function(){return DONE&&!run()};
 courseSteps=function(id){return free()?ORDER.filter(function(m){return FS.indexOf(m)>-1}):_cs.apply(this,arguments)};
 startCourse=function(){var was=run(),fr=free();if(fr&&!FS.length)return;_sc.apply(this,arguments);try{if(!was&&fr&&COURSE){COURSE.free=true;FS=[]}}catch(e){}};
 function ui(){if(!free())return;var c=document.getElementById('course');if(!c)return;var h=c.querySelector('.pickhint'),p=c.querySelector('.path.pick'),g=c.querySelector('.btn.go');
  if(h){h.className='pickhint qf-h';h.innerHTML='👇 <b>선택 학습</b>으로 한 번 더 할 수 있어요 · 하고 싶은 <b>번호를 골라요</b><small>⚔ '+(VOCA?'⑦ 마스터는 단어 시험이에요':'마스터는 통문장 시험이에요')+' — 시험을 더 보고 싶은 친구에게 추천!</small>'}
  if(p)p.innerHTML=ORDER.map(function(m){var on=FS.indexOf(m)>-1,M=MN(m);return '<button class="node opt'+(on?' on':'')+(m==='write'?' boss':'')+'" data-ftog="'+m+'" aria-pressed="'+on+'"><span class="st">'+(on?'✓':M.n)+'</span><small>'+M.s+'</small></button>'}).join('');
  var t=c.querySelector('.ctop p');if(t)t.textContent=FS.length?'고른 게임 '+FS.length+'개만 해요':'오늘 숙제는 끝났어요';
  if(g){g.classList.toggle('qf-off',!FS.length);g.textContent=FS.length?'고른 게임 '+FS.length+'개 시작 ▶':'✓ 오늘 모험 완료'}}
 renderCourse=function(){_rc.apply(this,arguments);try{ui()}catch(e){}};
 var wasRun=false;
 window.qrBar=qrBar=function(){_qb.apply(this,arguments);var el=document.getElementById('qrbar');if(!el)return;
  DONE=/다 했어요/.test(el.textContent);if(wasRun&&!run())FS=[];wasRun=run();
  if(DONE){el.classList.add('fin');el.innerHTML='<div class="qf-t">🏆 오늘 숙제 끝! 잘했어!!</div>'+(run()?'':'<p class="qf-s">오늘은 더 안 해도 돼요</p>')}else el.classList.remove('fin');
  if(free()){try{_rc();ui()}catch(e){}}};
 document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-ftog]');if(!t)return;e.stopPropagation();e.preventDefault();
  var m=t.dataset.ftog,i=FS.indexOf(m);if(i>-1)FS.splice(i,1);else FS.push(m);renderCourse()},true);
 try{if(document.body.classList.contains('qrs'))qrBar()}catch(e){}
})();
