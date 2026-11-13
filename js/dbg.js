/* 🐞 멈춤 기록 (도련 11-13 · 칼로 스티커를 자르거나 떼려 하면 앱이 멈춰요 → 어디서 멈추는지 F12 에서 보려고 넣은 임시 도구)
   - 누르기 · 떼기 · ✂️ 칼 자르기 단계 · 화면이 멈춘 시간 · 오류를 이 기기에 짧게 적어 둬요 (localStorage 'malang_dbg' · 마지막 120줄)
   - 앱이 멈춰서 다시 열면 → F12 → Console(콘솔)에 '🐞 지난번 기록' 표가 저절로 떠요 (맨 아래 줄 = 멈추기 직전)
   - 콘솔에서 dbgShow() = 지난번 기록 · dbgNow() = 지금 기록 · dbgClear() = 지우기
   - 일기 · 드라이브에는 아무것도 보내지 않아요 · 원인을 찾으면 이 파일과 index.html 의 한 줄 · dbg( 부르는 곳을 지워요 */
(() => {
    'use strict';
    const KEY = 'malang_dbg', PREV = 'malang_dbg_prev', MAX = 120, T0 = Date.now();
    let ring = [];
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(ring)); } catch (e) {} };
    const read = k => { try { return JSON.parse(localStorage.getItem(k) || '[]') || []; } catch (e) { return []; } };
    const short = v => { try { const s = typeof v === 'string' ? v : JSON.stringify(v); return s && s.length > 160 ? s.slice(0, 160) + '…' : s; } catch (e) { return String(v); } };
    const tm = () => { const d = new Date(); return d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0'); };
    function dbg(tag, info) {
        const row = { at: tm(), ms: Date.now() - T0, tag, info: info == null ? '' : short(info) };
        ring.push(row); if (ring.length > MAX) ring = ring.slice(-MAX);
        save();
        try { console.log('%c🐞 ' + tag, 'color:#c2457a;font-weight:bold', row.info); } catch (e) {}
    }
    window.dbg = dbg;
    /* 지난번 기록 (다시 열었을 때) */
    const old = read(KEY);
    if (old.length) { try { localStorage.setItem(PREV, JSON.stringify(old)); } catch (e) {} }
    window.dbgShow = () => { const p = read(PREV); console.log('%c🐞 지난번 기록 (맨 아래 줄 = 멈추기 직전) · ' + p.length + '줄', 'color:#c2457a;font-size:14px;font-weight:bold'); console.table(p.slice(-40)); return p.length; };
    window.dbgNow = () => { console.table(ring.slice(-40)); return ring.length; };
    window.dbgClear = () => { ring = []; try { localStorage.removeItem(KEY); localStorage.removeItem(PREV); } catch (e) {} return '지웠어요'; };
    if (old.length) setTimeout(() => window.dbgShow(), 1500);
    dbg('start', location.pathname + ' · ' + innerWidth + 'x' + innerHeight + ' · ' + (navigator.userAgent.match(/(Chrome|Edg|Whale|Firefox|Safari)\/[\d.]+/g) || []).join(' '));
    /* 누르기 · 떼기 : 무엇을 눌렀는지 (맨 먼저 · 다른 손짓보다 앞에서) */
    const who = t => { if (!t || !t.tagName) return '?'; const c = typeof t.className === 'string' ? t.className.trim().split(/\s+/).slice(0, 3).join('.') : ''; const b = t.closest && t.closest('.element-box'); return t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (c ? '.' + c : '') + (b && b !== t ? ' in box' + (b.dataset.cut ? '(cut)' : '') : ''); };
    const body = () => (document.body ? document.body.className : '').replace(/\s+/g, ' ').slice(0, 70);
    ['pointerdown', 'pointerup', 'pointercancel'].forEach(ty => window.addEventListener(ty, e => dbg(ty, `${e.pointerType} ${Math.round(e.clientX)},${Math.round(e.clientY)} ${who(e.target)} | ${body()}`), true));
    /* 화면이 멈춘 시간 : 그림이 0.7초 넘게 안 바뀌었으면 (다시 움직일 때 적어요) */
    let last = performance.now();
    const loop = t => { const gap = t - last; last = t; if (gap > 700 && document.visibilityState === 'visible') dbg('frame-gap', Math.round(gap) + 'ms'); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    try { new PerformanceObserver(l => l.getEntries().forEach(en => { if (en.duration >= 200) dbg('long-task', Math.round(en.duration) + 'ms'); })).observe({ type: 'longtask', buffered: false }); } catch (e) {}
    window.addEventListener('error', e => dbg('error', (e.message || '') + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
    window.addEventListener('unhandledrejection', e => dbg('reject', e.reason && (e.reason.stack || e.reason.message) || String(e.reason)));
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dbg'] = true;
