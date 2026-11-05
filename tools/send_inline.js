/* [Claude] 「📮 선생님께 보내기」: 새 창 없이 화면에서 바로 보내요 (2026-11-05 · 새 창이 까맣게 떠서 뒤로가기를 누르면 기록이 안 갔어요) */
(function(){var a=document.getElementById('sendT');if(!a)return;a.removeAttribute('target');
 a.addEventListener('click',function(e){e.preventDefault();var u=a.href;if(!u||/^(#|javascript)/.test(u.replace(location.href.split('#')[0],'')))return;
  var lab=a.getAttribute('data-lab')||a.textContent;a.setAttribute('data-lab',lab);
  var fail=function(){setTimeout(function(){a.hidden=false;a.textContent='📮 다시 보내기';var ok=document.getElementById('sentOk');if(ok)ok.hidden=true;var m=document.getElementById('must')||document.getElementById('mustMsg');if(m){m.hidden=false;m.innerHTML='⚠️ 인터넷이 끊겨서 못 보냈어요.<br><b>📮 다시 보내기</b>를 눌러 주세요.'}},450)};
  try{fetch(u,{mode:'no-cors',keepalive:true,cache:'no-store',credentials:'omit'}).then(function(){a.textContent=lab}).catch(fail)}catch(err){fail()}});})();
