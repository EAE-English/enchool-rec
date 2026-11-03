/* [Claude] 쿨톡 자연스러운 목소리 (Kokoro로 미리 만든 음성 · 2026-11-04)
   대화문 줄(화자 + 문장)에 맞는 음성 파일이 kool/tts/에 있으면 그걸 틀고, 없으면 false를 돌려줘서 예전 기계음(speechSynthesis)으로 읽어요.
   한 번 받은 음성은 폰(IndexedDB)에 저장해 두고 다시 안 받아요. */
window.TTSA = (function () {
  var BASE = 'https://eae-english.github.io/enchool-rec/kool/tts/';
  var MAP = null, mem = {}, el = null, unlocked = false, cur = null;
  var key = function (who, t) { return String(who || '') + '\t' + String(t).replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim(); };
  var store = (function () {
    var p = null;
    var db = function () { return p || (p = new Promise(function (ok, no) { try { var r = indexedDB.open('enchool_tts', 1); r.onupgradeneeded = function () { r.result.createObjectStore('t'); }; r.onsuccess = function () { ok(r.result); }; r.onerror = function () { no(r.error); }; } catch (e) { no(e); } })); };
    return {
      get: function (k) { return db().then(function (d) { return new Promise(function (ok) { try { var q = d.transaction('t').objectStore('t').get(k); q.onsuccess = function () { ok(q.result || null); }; q.onerror = function () { ok(null); }; } catch (e) { ok(null); } }); }).catch(function () { return null; }); },
      put: function (k, v) { return db().then(function (d) { try { d.transaction('t', 'readwrite').objectStore('t').put(v, k); } catch (e) {} }).catch(function () {}); }
    };
  })();
  var ready = fetch(BASE + 'map.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (j) { MAP = j; }).catch(function () { MAP = {}; });
  function audio() { if (!el) { el = new Audio(); el.preload = 'auto'; } return el; }
  /* 휴대폰은 처음 한 번 손가락으로 누를 때 소리를 열어 둬야 뒤에 이어서 틀 수 있어요 */
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { var a = audio(); a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='; var pr = a.play(); if (pr && pr.then) pr.then(function () { a.pause(); }).catch(function () {}); } catch (e) {}
  }
  ['touchstart', 'pointerdown', 'click', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { capture: true, passive: true }); });
  function urlOf(fn) {
    if (mem[fn]) return Promise.resolve(mem[fn]);
    return store.get('a|' + fn).then(function (c) {
      if (c && c.by) return c.by;
      return fetch(BASE + fn).then(function (r) { if (!r.ok) throw new Error('no'); return r.arrayBuffer(); }).then(function (b) { store.put('a|' + fn, { by: b.slice(0) }); return b; });
    }).then(function (b) { var u = URL.createObjectURL(new Blob([b], { type: 'audio/mpeg' })); mem[fn] = u; return u; });
  }
  function stop() { cur = null; try { if (el) el.pause(); } catch (e) {} }
  function play(t, who, done, rate) {
    var fn = MAP && MAP[key(who, t)];
    if (!fn) return false;
    stop();
    var tok = {}; cur = tok;
    var fired = false, fin = function () { if (fired) return; fired = true; if (cur === tok) cur = null; if (done) done(); };
    urlOf(fn).then(function (u) {
      if (cur !== tok) return;
      var a = audio(); a.onended = fin; a.onerror = fin; a.src = u; a.playbackRate = rate || 1;
      var pr = a.play(); if (pr && pr.catch) pr.catch(fin);
    }).catch(fin);
    return true;
  }
  function pre(lines) { if (!MAP) return; (lines || []).forEach(function (l) { var fn = MAP[key(l[0], l[1])]; if (fn) urlOf(fn).catch(function () {}); }); }
  return { play: play, stop: stop, pre: pre, ready: ready,
    has: function (t, who) { return !!(MAP && MAP[key(who, t)]); },
    playing: function () { return !!cur; } };
})();
