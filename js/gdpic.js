/* 말랑달콤 다이어리 - js/gdpic.js
   🧁 문구 그림 (도련 11-02) : 모든 문구 = 🧁 상품공방에서 올린 그림 + 속성 그대로 · 앱은 모양을 그리지 않아요 (기능만 : 긋기 · 지우기 · 자르기 · 재기 · 집기)
   - 디자인 = 보이는 그림 (문구함 · 연필꽂이 · 손에 든 것 · 페이지에 놓인 것 · 샵)
   - 움직이는 조각 (같은 크기 · 같은 자리) : ✂️ 가위 = 날1 · 날2 (축에서 벌어져요) · 🪡 핀셋 = 왼팔 · 오른팔 (+ 몸 = 안 움직이는 가운데) · 조각이 다 없으면 디자인 그대로 (안 움직여요)
   - 속성 : 쓰는끝 [x, y] (그림 px · 연필심 · 칼끝 · 핀셋 끝 · 가위가 자르는 자리) · 축 [x, y] · 색 (그어지는 선) · 눈금영역 · 눈금색 (자) · 틀.size (지우개 크기)
   - 그림은 정한 상자(가로 × 세로)에 비율 그대로 가운데 (gdPicFit) · 상자 안 자리 = gdPicAt
   ※ js/prod.js 다음에 읽어요 */
(function () {
    const PIC = {};
    const pt = v => Array.isArray(v) && v.length === 2 && v.every(n => isFinite(+n)) ? [+v[0], +v[1]] : null;
    function build() {
        Object.keys(PIC).forEach(k => delete PIC[k]);
        (window.prodList ? prodList('문구') : []).forEach(x => {
            const u = x.u || {}, wh = (x.wh || {}).디자인; if (!u.디자인) return;
            const parts = {}; Object.keys(u).forEach(k => { if (k !== '디자인') parts[k] = u[k]; });
            PIC[x.id] = { id: x.id, g: (x.P || {}).문구종류 || '', u: u.디자인, w: +(wh && wh[0]) || 100, h: +(wh && wh[1]) || 100, parts, tip: pt((x.P || {}).쓰는끝), axis: pt((x.P || {}).축), P: x.P || {} };
        });
    }
    build();
    if (window.prodHook) prodHook(build);
    const fit = (p, BW, BH) => { const s = Math.min(BW / p.w, BH / p.h); return { s, ox: (BW - p.w * s) / 2, oy: (BH - p.h * s) / 2 }; };
    const at = (p, q, BW, BH) => { const f = fit(p, BW, BH); return [f.ox + q[0] * f.s, f.oy + q[1] * f.s]; };
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    /* <svg> : o.parts = [[조각 이름, class], …] (다 있으면 조각마다 <g> · 축을 transform-origin 으로) · o.over = 맨 위 안 움직이는 조각 · o.extra = 위에 더 그릴 것 (자 눈금 …) */
    function svg(id, o) {
        const p = PIC[id]; if (!p) return '';
        o = o || {};
        const img = u => `<image href="${esc(u)}" width="${p.w}" height="${p.h}" preserveAspectRatio="none"/>`;
        const ax = p.axis || [p.w / 2, p.h / 2], ps = o.parts && o.parts.every(([n]) => p.parts[n]) ? o.parts : null;
        const body = ps ? ps.map(([n, cls]) => `<g class="${cls}" style="transform-origin:${ax[0]}px ${ax[1]}px;transform-box:view-box">${img(p.parts[n])}</g>`).join('') + (o.over && p.parts[o.over] ? img(p.parts[o.over]) : '') : img(p.u);
        return `<svg viewBox="0 0 ${p.w} ${p.h}" data-an="1" aria-hidden="true"${o.attr || ''}>${body}${o.extra || ''}</svg>`;
    }
    window.gdPic = id => PIC[id] || null;
    window.gdPicOf = g => Object.values(PIC).filter(p => p.g === g);
    window.gdPicSvg = svg; window.gdPicFit = fit; window.gdPicAt = at;
    window.gdPicMoves = (id, names) => { const p = PIC[id]; return !!p && names.every(n => p.parts[n]); };   // 움직이는 조각이 다 있나요
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['gdpic'] = true;
