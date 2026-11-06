/* [Claude] 「📮 선생님께 보내기」: 새 창 없이 화면에서 바로 보내요 (2026-11-05 · 새 창이 까맣게 떠서 뒤로가기를 누르면 기록이 안 갔어요)
   + 자동 보내기 (2026-11-06): 결과 화면이 뜨면 아이가 안 눌러도 저절로 보내요 · 같은 결과는 두 번 안 보내요 */
(function(){var a=document.getElementById('sendT');if(!a)return;a.removeAttribute('target');
 var DONE={},TRIED={},key=function(){return (a.getAttribute('data-key')||a.href||'').replace(/&coins=[^&]*/,'')};
 var fetchIt=function(u,ok,fail){try{fetch(u,{mode:'no-cors',keepalive:true,cache:'no-store',credentials:'omit'}).then(ok).catch(fail)}catch(err){fail()}};
 /* 결과 화면 전에 미리 보내기 (쿨보카 마스터 테스트 끝 · 2026-11-06) */
 window.koolSendSilent=function(u,k){if(!u||DONE[k])return;DONE[k]=1;fetchIt(u,function(){},function(){delete DONE[k]})};
 a.addEventListener('click',function(e){e.preventDefault();var u=a.href;if(!u||/^(#|javascript)/.test(u.replace(location.href.split('#')[0],'')))return;
  var lab=a.getAttribute('data-lab')||a.textContent;a.setAttribute('data-lab',lab);var k=key();
  if(DONE[k]){a.textContent=lab;return}
  var fail=function(){delete DONE[k];setTimeout(function(){a.hidden=false;a.textContent='📮 다시 보내기';var ok=document.getElementById('sentOk');if(ok)ok.hidden=true;var m=document.getElementById('must')||document.getElementById('mustMsg');if(m){m.hidden=false;m.innerHTML='⚠️ 인터넷이 끊겨서 못 보냈어요.<br><b>📮 다시 보내기</b>를 눌러 주세요.'}},450)};
  DONE[k]=1;fetchIt(u,function(){a.textContent=lab},fail)});
 var auto=function(){if(a.hidden||!a.offsetParent)return;var u=a.href;if(!u||/^(#|javascript)/.test(u.replace(location.href.split('#')[0],'')))return;var k=key();if(TRIED[k])return;TRIED[k]=1;setTimeout(function(){if(!a.hidden)a.click()},350)};
 try{new MutationObserver(function(){setTimeout(auto,60)}).observe(document.body,{attributes:true,subtree:true,attributeFilter:['hidden','href','class','style']})}catch(err){}})();
