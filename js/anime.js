/* 말랑달콤 다이어리 - js/anime.js
   🎬 애니 스타일 (도련 10-28 · css/anime.css) : 화면에 생기는 SVG 그림(아이콘 · 문구 도구 · 소품 그림 …)을 애니처럼
   - 그라데이션 → 가운데 색 한 가지 · 흰 반투명 반짝이 · 흐림 필터는 빼요
   - 선(stroke) 색에 흰빛을 40% 섞어 파스텔로 (주위 색과 녹아들게)
   - ✂️ 문구(핀셋 · 가위 · 칼 · 자 · 펀칭기 · 테이프 · 필기구 …) = 📔 다이어리처럼 또렷한 선 (도련 10-30)
       선 색 = 그 조각의 색을 진하게 (녹색 집게 = 진한 녹색 선 · darkC) · 굵기 = 페이지 위 문구 2px / 📦 문구함 · 🏪 샵 목록의 작은 아이콘 1.2px (ICON)
       그림이 커지거나 작아져도 화면에서 늘 같은 굵기 (vector-effect) · 흰 반짝이는 그대로
   - 한 번 바꾼 그림은 data-an 표시 · 새로 생기는 그림은 MutationObserver 로 (조금 모아서 쉴 때)
   ※ 다이어리 페이지에 붙인 스티커(사진 · 그림 파일)는 건드리지 않아요 */
(function () {
    const ANIME_ON = true;                                                 // 끄려면 false
    if (!ANIME_ON) return;
    document.documentElement.classList.add('an');
    const WASH = .42, SKIP = '#canvasArea, .dk-open-wrap, .element-box', OL = '#bba6d6';
    const ICON = '.gdc-wrap, .sh-tool';                                    /* 목록 속 작은 문구 아이콘 = 얇은 선 */
    const METAL = '#d3d8e1';                                               /* 쇠 = 연한 은색 */
    const TOOL = '.bd-tool, .sh-tool, .gdc-wrap, .pc-tool, .pc-held, .twz, .sk-knife, .rl-ruler, .scs-cur';   /* ✂️ 문구 (css/anime.css 와 같게) */
    const isWhite = c => { const v = rgb(c); return !v || v[0] + v[1] + v[2] > 690; };
    const cv = document.createElement('canvas').getContext('2d');
    const rgb = c => { cv.fillStyle = '#000'; cv.fillStyle = c; const m = /^#([0-9a-f]{6})$/i.exec(cv.fillStyle); if (!m) return null; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const wash = c => { const v = rgb(c); if (!v || v[0] + v[1] + v[2] > 690) return null; const f = x => Math.round(x + (255 - x) * WASH); return `rgb(${f(v[0])},${f(v[1])},${f(v[2])})`; };
    /* 그 색을 진하게 (색은 그대로 · 밝기만 낮춰요) → 문구 조각마다 제 색의 진한 선 */
    function darkC(c) {
        const v = rgb(c); if (!v) return OL;
        let [r, g, b] = v.map(x => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
        let h = 0, s = 0;
        if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
        return `hsl(${Math.round(h)} ${Math.round(Math.min(1, s * 1.05) * 100)}% ${Math.round(Math.min(.9, Math.max(.25, l - .28)) * 100)}%)`;   /* 제 색보다 조금 진하게 (밝기 -28%) */
    }
    function flat(svg) {
        if (svg.dataset.an || svg.closest(SKIP)) return; svg.dataset.an = 1;
        const tool = !!svg.closest(TOOL);
        svg.querySelectorAll('[fill^="url("], [stroke^="url("]').forEach(el => ['fill', 'stroke'].forEach(a => {
            const v = el.getAttribute(a); if (!v || !v.startsWith('url(')) return;
            const id = v.slice(4, -1).replace(/['"#]/g, ''), g = svg.querySelector('[id="' + id + '"]') || document.getElementById(id); if (!g) return;
            const st = [...g.querySelectorAll('stop')]; if (!st.length) return;
            const m = st[Math.floor((st.length - 1) / 2)]; let col = getComputedStyle(m).stopColor || m.getAttribute('stop-color');
            if (col && tool && isWhite(col)) col = METAL;                     /* ✂️ 쇠(은색 그라데이션)가 흰색이 되면 흰 바탕에 묻혀요 → 연한 은색 (도련 10-30 : 집게 손잡이) */
            if (col) el.setAttribute(a, col);   /* var() 색도 실제 색으로 */
        }));
        svg.querySelectorAll('[opacity], [fill-opacity]').forEach(el => { const f = (el.getAttribute('fill') || '').toLowerCase(), o = parseFloat(el.getAttribute('opacity') || el.getAttribute('fill-opacity')); if ((f === '#fff' || f === '#ffffff' || f === 'white') && o < .9) el.style.display = 'none'; });
        svg.querySelectorAll('[filter]').forEach(el => el.removeAttribute('filter'));
        const tw = svg.closest(ICON) ? '1.2' : '2';
        const thin = (el, c) => { el.setAttribute('stroke', darkC(c)); el.setAttribute('stroke-width', tw); el.setAttribute('vector-effect', 'non-scaling-stroke'); el.setAttribute('stroke-linejoin', 'round'); };
        if (tool) svg.querySelectorAll('path, rect, circle, ellipse, polygon').forEach(el => { if (el.closest('defs, clipPath, mask') || el.hasAttribute('stroke')) return;   /* 색 칠한 조각 둘레 */
            const f = el.getAttribute('fill'); if (f === 'none' || (f && !f.startsWith('url') && isWhite(f)) || (!f && !el.getAttribute('style'))) return; thin(el, f || getComputedStyle(el).fill); });
        svg.querySelectorAll('[stroke]').forEach(el => { const s = el.getAttribute('stroke'); if (!s || s === 'none' || s.startsWith('url') || /currentcolor|var\(|inherit/i.test(s)) return;   /* 글자색 따라가는 선은 그대로 */
            if (tool && parseFloat(el.getAttribute('stroke-width')) < 3) { if (!isWhite(s)) thin(el, s); return; }
            if (tool) {                                                       /* 굵은 선 = 선으로 그린 몸통(가위 손잡이) : 색 그대로 · 바로 위에 같은 모양이 또 있으면 이건 테두리 → 몸통 색을 진하게 */
                const n = el.nextElementSibling, same = n && n.tagName === el.tagName && ['d', 'cx', 'cy', 'rx', 'ry'].every(k => n.getAttribute(k) === el.getAttribute(k));
                if (same) { el.setAttribute('stroke', darkC(n.getAttribute('stroke'))); return; } }   /* 테두리 = 위 몸통 색의 진한 색 */   /* 흰 반짝 선은 그대로 */
            const pv = el.previousElementSibling, hasOl = pv && pv.tagName === el.tagName && ['d', 'cx', 'cy', 'rx', 'ry'].every(k => pv.getAttribute(k) === el.getAttribute(k));   /* 이미 테두리가 있는 몸통 (가위 손잡이) */
            if (tool && !hasOl && !el.dataset.anOl && !isWhite(s)) {                   /* 굵은 선으로 그린 몸통(집게 손잡이 쇠 …)도 제 색의 진한 테두리 (뒤에 한 겹) */
                const o = el.cloneNode(false); o.dataset.anOl = 1; o.setAttribute('stroke', darkC(s)); o.setAttribute('stroke-width', String(parseFloat(el.getAttribute('stroke-width') || 1) + 2.2)); el.parentNode.insertBefore(o, el); return; }
            const w = wash(s); if (w) el.setAttribute('stroke', w); });
    }
    let todo = new Set(), tm = 0;
    const run = () => { tm = 0; const L = todo; todo = new Set(); L.forEach(n => { if (!n.isConnected) return; if (n.tagName === 'svg') flat(n); n.querySelectorAll && n.querySelectorAll('svg:not([data-an])').forEach(flat); }); };
    const add = n => { if (n.nodeType !== 1) return; todo.add(n); if (!tm) tm = setTimeout(run, 60); };
    const go = () => {
        add(document.body); new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(add))).observe(document.body, { childList: true, subtree: true }); };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
})();
