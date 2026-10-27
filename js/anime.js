/* 말랑달콤 다이어리 - js/anime.js
   🎬 애니 스타일 (도련 10-28 · css/anime.css) : 화면에 생기는 SVG 그림(아이콘 · 문구 도구 · 소품 그림 …)을 애니처럼
   - 그라데이션 → 가운데 색 한 가지 · 흰 반투명 반짝이 · 흐림 필터는 빼요
   - 선(stroke) 색에 흰빛을 40% 섞어 파스텔로 (주위 색과 녹아들게)
   - 한 번 바꾼 그림은 data-an 표시 · 새로 생기는 그림은 MutationObserver 로 (조금 모아서 쉴 때)
   ※ 다이어리 페이지에 붙인 스티커(사진 · 그림 파일)는 건드리지 않아요 */
(function () {
    const ANIME_ON = true;                                                 // 끄려면 false
    if (!ANIME_ON) return;
    document.documentElement.classList.add('an');
    const WASH = .42, SKIP = '#canvasArea, .dk-open-wrap, .element-box';
    const cv = document.createElement('canvas').getContext('2d');
    const rgb = c => { cv.fillStyle = '#000'; cv.fillStyle = c; const m = /^#([0-9a-f]{6})$/i.exec(cv.fillStyle); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const wash = c => { const v = rgb(c); if (!v || v[0] + v[1] + v[2] > 690) return null; const f = x => Math.round(x + (255 - x) * WASH); return `rgb(${f(v[0])},${f(v[1])},${f(v[2])})`; };
    function flat(svg) {
        if (svg.dataset.an || svg.closest(SKIP)) return; svg.dataset.an = 1;
        svg.querySelectorAll('[fill^="url("], [stroke^="url("]').forEach(el => ['fill', 'stroke'].forEach(a => {
            const v = el.getAttribute(a); if (!v || !v.startsWith('url(')) return;
            const id = v.slice(4, -1).replace(/['"#]/g, ''), g = svg.querySelector('[id="' + id + '"]') || document.getElementById(id); if (!g) return;
            const st = [...g.querySelectorAll('stop')]; if (!st.length) return;
            const m = st[Math.floor((st.length - 1) / 2)], col = getComputedStyle(m).stopColor || m.getAttribute('stop-color'); if (col) el.setAttribute(a, col);   /* var() 색도 실제 색으로 */
        }));
        svg.querySelectorAll('[opacity], [fill-opacity]').forEach(el => { const f = (el.getAttribute('fill') || '').toLowerCase(), o = parseFloat(el.getAttribute('opacity') || el.getAttribute('fill-opacity')); if ((f === '#fff' || f === '#ffffff' || f === 'white') && o < .9) el.style.display = 'none'; });
        svg.querySelectorAll('[filter]').forEach(el => el.removeAttribute('filter'));
        svg.querySelectorAll('[stroke]').forEach(el => { const s = el.getAttribute('stroke'); if (!s || s === 'none' || s.startsWith('url') || /currentcolor|var\(|inherit/i.test(s)) return;   /* 글자색 따라가는 선은 그대로 */ const w = wash(s); if (w) el.setAttribute('stroke', w); });
    }
    let todo = new Set(), tm = 0;
    const run = () => { tm = 0; const L = todo; todo = new Set(); L.forEach(n => { if (!n.isConnected) return; if (n.tagName === 'svg') flat(n); n.querySelectorAll && n.querySelectorAll('svg:not([data-an])').forEach(flat); }); };
    const add = n => { if (n.nodeType !== 1) return; todo.add(n); if (!tm) tm = setTimeout(run, 60); };
    const go = () => { add(document.body); new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(add))).observe(document.body, { childList: true, subtree: true }); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
