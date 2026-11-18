/* 말랑달콤 다이어리 - js/cssblocks.js
   🧩 블록 레이어 엔진 (도련 11-18 · 그림판 업그레이드) : css 의 그리는 기능을 블록 하나씩으로 → 다꾸러가 쌓고 이어서 자유롭게 (코드 몰라도)
   - 블록 레이어 = 상자 하나 (box = 종이 안 자리 · 크기 %) + 블록 목록 (위 = 앞) · 움직임(애니메이션) 블록은 없어요 (도련 11-18)
   - 묶음 : 🎨 바탕 (단색 · 그라데이션 3가지 · 줄 · 동심원 · 부채살 · 땡땡이 · 체크 · 모눈 · 그림 깔기)
            🔷 모양 (둥근 모서리 · 오리기 모양 · 테두리 · 바깥 테두리 · 그림자 · 안쪽 그림자 · 돌리기·늘리기 · 투명도)
            🪄 필터 (흐리게 · 밝기 · 대비 · 채도 · 흑백 · 세피아 · 색 돌리기 · 색 뒤집기 · 그림 그림자)
            🔤 글자 (글자 · 글자 테두리 · 글자 그림자 · 글자에만 바탕 무늬)
   - 그리기 = 캔버스에 직접 (사파리 · 아이패드도 같게 · ctx.filter · foreignObject 안 써요) → 그림판 합치기 · ✅ 완료 그대로
   - CB.css(L) = 같은 모습의 css 코드 글 (👩‍💻 코드 보기 · 배우기용) */
(function () {
    'use strict';
    const C = (k, n) => ({ k, n, t: 'c' }), N = (k, n, min, max, u, step) => ({ k, n, t: 'n', min, max, u: u == null ? 'px' : u, step: step || 1 }),
        K = (k, n, opts) => ({ k, n, t: 'p', opts }), T = (k, n) => ({ k, n, t: 's' }), F = (k, n) => ({ k, n, t: 'f' });
    const CLIPS = [['none', '네모'], ['circle', '원'], ['ellipse', '타원'], ['heart', '하트'], ['star', '별'], ['tri', '세모'], ['diamond', '마름모'], ['hex', '육각'], ['drop', '물방울'], ['cloud', '구름']];
    const FONTS = [['Jua', '주아'], ['Gowun Dodum', '고운돋움'], ['sans-serif', '고딕'], ['serif', '명조']];
    const DEFS = {
        fill:    { g: 'bg', i: '🎨', n: '단색', f: [C('c', '색'), N('a', '진하기', 0, 100, '%')], d: { c: '#ffe7ee', a: 100 } },
        linear:  { g: 'bg', i: '🌈', n: '그라데이션', f: [C('a', '처음 색'), C('b', '끝 색'), N('deg', '방향', 0, 360, '°')], d: { a: '#ffc6d6', b: '#c4b2f2', deg: 135 } },
        radial:  { g: 'bg', i: '🔆', n: '원형 그라데이션', f: [C('a', '가운데 색'), C('b', '바깥 색'), N('s', '퍼짐', 10, 150, '%'), N('cx', '가운데 가로', 0, 100, '%'), N('cy', '가운데 세로', 0, 100, '%')], d: { a: '#ffffff', b: '#ffb3c9', s: 80, cx: 50, cy: 50 } },
        conic:   { g: 'bg', i: '🥧', n: '부채꼴 그라데이션', f: [C('a', '처음 색'), C('b', '끝 색'), N('deg', '시작', 0, 360, '°')], d: { a: '#ffd479', b: '#ff8fb1', deg: 0 } },
        stripe:  { g: 'bg', i: '〰️', n: '줄무늬', f: [C('c', '색'), N('s', '간격', 6, 200), N('w', '굵기', 5, 95, '%'), N('deg', '기울기', 0, 180, '°')], d: { c: '#ffd6e2', s: 40, w: 50, deg: 90 } },
        rings:   { g: 'bg', i: '🎯', n: '동심원', f: [C('c', '색'), N('s', '간격', 6, 200), N('w', '굵기', 5, 95, '%')], d: { c: '#ffd6e2', s: 40, w: 40 } },
        rays:    { g: 'bg', i: '🌞', n: '부채살', f: [C('c', '색'), N('n', '살 수', 3, 48, '개'), N('deg', '돌리기', 0, 360, '°')], d: { c: '#fff1a8', n: 16, deg: 0 } },
        dot:     { g: 'bg', i: '⚪', n: '땡땡이', f: [C('c', '색'), N('s', '간격', 8, 200), N('r', '크기', 1, 60), K('m', '놓기', [['grid', '바둑판'], ['brick', '엇갈림']])], d: { c: '#ffffff', s: 34, r: 6, m: 'brick' } },
        check:   { g: 'bg', i: '🟪', n: '체크', f: [C('c', '색'), N('s', '칸', 8, 200), N('o', '진하기', 5, 100, '%')], d: { c: '#85a6dc', s: 36, o: 36 } },
        grid:    { g: 'bg', i: '📐', n: '모눈', f: [C('c', '색'), N('s', '칸', 6, 200), N('w', '선', 1, 12)], d: { c: '#f2c94c', s: 28, w: 2 } },
        image:   { g: 'bg', i: '🖼️', n: '그림 깔기', f: [F('src', '그림'), K('fit', '깔기', [['cover', '꽉 채우기'], ['contain', '다 보이게'], ['tile', '이어 깔기']]), N('s', '이어 깔 크기', 20, 600)], d: { src: '', fit: 'cover', s: 160 } },
        radius:  { g: 'shape', i: '⬜', n: '둥근 모서리', f: [N('r', '둥글기', 0, 400)], d: { r: 60 } },
        clip:    { g: 'shape', i: '✂️', n: '오리기 모양', f: [K('m', '모양', CLIPS)], d: { m: 'heart' } },
        border:  { g: 'shape', i: '🖍', n: '테두리', f: [C('c', '색'), N('w', '굵기', 1, 60), K('st', '선', [['solid', '실선'], ['dashed', '점선'], ['dotted', '땡땡'], ['double', '이중']])], d: { c: '#5b3f4a', w: 6, st: 'dashed' } },
        outline: { g: 'shape', i: '⭕', n: '바깥 테두리', f: [C('c', '색'), N('w', '굵기', 1, 40), N('gap', '띄우기', 0, 80)], d: { c: '#ffffff', w: 8, gap: 0 } },
        shadow:  { g: 'shape', i: '🌑', n: '그림자', f: [C('c', '색'), N('x', '옆', -80, 80), N('y', '아래', -80, 80), N('b', '흐림', 0, 80), N('sp', '넓히기', -40, 80), N('o', '진하기', 5, 100, '%')], d: { c: '#f08fae', x: 10, y: 10, b: 0, sp: 0, o: 100 } },
        inset:   { g: 'shape', i: '🕳️', n: '안쪽 그림자', f: [C('c', '색'), N('b', '흐림', 0, 80), N('sp', '넓히기', 0, 80), N('o', '진하기', 5, 100, '%')], d: { c: '#c2457a', b: 24, sp: 0, o: 45 } },
        tf:      { g: 'shape', i: '↪️', n: '돌리기 · 늘리기', f: [N('rot', '돌리기', -180, 180, '°'), N('sx', '가로', 20, 200, '%'), N('sy', '세로', 20, 200, '%'), N('sk', '비틀기', -45, 45, '°')], d: { rot: -6, sx: 100, sy: 100, sk: 0 } },
        opacity: { g: 'shape', i: '👻', n: '투명도', f: [N('o', '진하기', 0, 100, '%')], d: { o: 80 } },
        blur:    { g: 'fx', i: '🌫️', n: '흐리게', f: [N('v', '흐림', 0, 40)], d: { v: 6 } },
        bright:  { g: 'fx', i: '☀️', n: '밝기', f: [N('v', '밝기', 0, 200, '%')], d: { v: 120 } },
        contrast:{ g: 'fx', i: '◐', n: '대비', f: [N('v', '대비', 0, 200, '%')], d: { v: 130 } },
        saturate:{ g: 'fx', i: '🍭', n: '채도', f: [N('v', '채도', 0, 300, '%')], d: { v: 160 } },
        gray:    { g: 'fx', i: '🩶', n: '흑백', f: [N('v', '흑백', 0, 100, '%')], d: { v: 100 } },
        sepia:   { g: 'fx', i: '📜', n: '세피아', f: [N('v', '세피아', 0, 100, '%')], d: { v: 80 } },
        hue:     { g: 'fx', i: '🎡', n: '색 돌리기', f: [N('v', '돌리기', 0, 360, '°')], d: { v: 90 } },
        invert:  { g: 'fx', i: '🔄', n: '색 뒤집기', f: [N('v', '뒤집기', 0, 100, '%')], d: { v: 100 } },
        drop:    { g: 'fx', i: '🫥', n: '그림 그림자', f: [C('c', '색'), N('x', '옆', -60, 60), N('y', '아래', -60, 60), N('b', '흐림', 0, 60)], d: { c: '#5b3f4a', x: 6, y: 8, b: 8 } },
        text:    { g: 'text', i: '🔤', n: '글자', f: [T('t', '글자'), K('font', '글꼴', FONTS), N('fs', '크기', 12, 400), C('c', '색'), K('wt', '굵기', [['400', '보통'], ['700', '굵게']]), K('al', '줄 맞춤', [['left', '왼쪽'], ['center', '가운데'], ['right', '오른쪽']])], d: { t: '말랑달콤', font: 'Jua', fs: 110, c: '#5b3f4a', wt: '400', al: 'center' } },
        tstroke: { g: 'text', i: '🖊', n: '글자 테두리', f: [C('c', '색'), N('w', '굵기', 1, 30)], d: { c: '#ffffff', w: 8 } },
        tshadow: { g: 'text', i: '💬', n: '글자 그림자', f: [C('c', '색'), N('x', '옆', -40, 40), N('y', '아래', -40, 40), N('b', '흐림', 0, 40)], d: { c: '#f08fae', x: 5, y: 5, b: 0 } },
        tclip:   { g: 'text', i: '🌈', n: '글자에만 바탕 무늬', f: [], d: {} }
    };
    const GROUPS = [['bg', '🎨 바탕'], ['shape', '🔷 모양'], ['fx', '🪄 필터'], ['text', '🔤 글자']];
    const ORDER = Object.keys(DEFS);
    const BG = new Set(['fill', 'linear', 'radial', 'conic', 'stripe', 'rings', 'rays', 'dot', 'check', 'grid', 'image']);
    const FX = ['blur', 'bright', 'contrast', 'saturate', 'gray', 'sepia', 'hue', 'invert', 'drop'];
    let seq = 1;
    const fresh = t => ({ id: Date.now().toString(36) + (seq++), t, on: true, v: JSON.parse(JSON.stringify(DEFS[t].d)) });
    const hexOk = v => /^#[0-9a-f]{6}$/i.test(v || '');
    const rgba = (h, a) => { h = hexOk(h) ? h : '#000000'; const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a == null ? 1 : a})`; };
    const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

    /* 그림 깔기 : 그림 불러오기 (다 불러오면 onImg → 그림판이 다시 그려요) */
    const IMGS = new Map(); let onImg = null;
    function img(src) {
        if (!src) return null; let im = IMGS.get(src);
        if (!im) { im = new Image(); im.onload = () => { if (onImg) onImg(); }; im.src = src; IMGS.set(src, im); if (IMGS.size > 40) IMGS.delete(IMGS.keys().next().value); }
        return im.complete && im.naturalWidth ? im : null;
    }

    /* ---------- 모양 길 (상자 안 · x y w h) ---------- */
    function rrect(x, a, b, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
    function poly(x, a, b, w, h, pts) { pts.forEach(([u, v], i) => i ? x.lineTo(a + u * w, b + v * h) : x.moveTo(a + u * w, b + v * h)); x.closePath(); }
    function shapePath(x, m, a, b, w, h, r) {                                  // x = 캔버스 또는 Path2D
        if (x.beginPath) x.beginPath();
        if (m === 'circle') { const R = Math.min(w, h) / 2; x.arc(a + w / 2, b + h / 2, R, 0, Math.PI * 2); return; }
        if (m === 'ellipse') { x.ellipse(a + w / 2, b + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); return; }
        if (m === 'heart') { x.moveTo(a + w * .5, b + h * .96); x.bezierCurveTo(a + w * .1, b + h * .68, a - w * .02, b + h * .38, a + w * .14, b + h * .16); x.bezierCurveTo(a + w * .28, b - h * .02, a + w * .46, b + h * .06, a + w * .5, b + h * .24); x.bezierCurveTo(a + w * .54, b + h * .06, a + w * .72, b - h * .02, a + w * .86, b + h * .16); x.bezierCurveTo(a + w * 1.02, b + h * .38, a + w * .9, b + h * .68, a + w * .5, b + h * .96); x.closePath(); return; }
        if (m === 'star') { const p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? .21 : .5, t = -Math.PI / 2 + i * Math.PI / 5; p.push([.5 + Math.cos(t) * rr, .53 + Math.sin(t) * rr * 1.04]); } poly(x, a, b, w, h, p); return; }
        if (m === 'tri') { poly(x, a, b, w, h, [[.5, 0], [1, 1], [0, 1]]); return; }
        if (m === 'diamond') { poly(x, a, b, w, h, [[.5, 0], [1, .5], [.5, 1], [0, .5]]); return; }
        if (m === 'hex') { poly(x, a, b, w, h, [[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]]); return; }
        if (m === 'drop') { x.moveTo(a + w * .5, b); x.bezierCurveTo(a + w * .62, b + h * .22, a + w, b + h * .44, a + w, b + h * .66); x.arc(a + w * .5, b + h * .66, w * .5, 0, Math.PI, false); x.bezierCurveTo(a, b + h * .44, a + w * .38, b + h * .22, a + w * .5, b); x.closePath(); return; }
        if (m === 'cloud') { const cs = [[.25, .62, .22], [.42, .4, .24], [.64, .38, .22], [.78, .6, .2], [.52, .66, .26]]; cs.forEach(([u, v, q]) => { x.moveTo(a + (u + q) * w, b + v * h); x.ellipse(a + u * w, b + v * h, q * w, q * h * 1.1, 0, 0, Math.PI * 2); }); return; }
        rrect(x, a, b, w, h, r || 0);
    }

    /* ---------- 바탕 한 겹 (상자 안에 · 위 = 앞) ---------- */
    function tile(w, h, draw) { const c = mkCv(w, h); draw(c.getContext('2d'), c.width, c.height); return c; }
    function bgLayer(x, B, a, b, w, h) {
        const v = B.v, t = B.t;
        x.save();
        const pat = c => { const p = x.createPattern(c, 'repeat'); if (p.setTransform && window.DOMMatrix) p.setTransform(new DOMMatrix().translateSelf(a, b)); return p; };
        if (t === 'fill') { x.fillStyle = rgba(v.c, (v.a == null ? 100 : v.a) / 100); x.fillRect(a, b, w, h); }
        else if (t === 'linear') {   // css 와 같은 길이 (모서리까지)
            const r = (v.deg - 90) * Math.PI / 180, L = Math.abs(w * Math.sin(v.deg * Math.PI / 180)) + Math.abs(h * Math.cos(v.deg * Math.PI / 180)), cx = a + w / 2, cy = b + h / 2, dx = Math.cos(r) * L / 2, dy = Math.sin(r) * L / 2;
            const g = x.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy); g.addColorStop(0, v.a); g.addColorStop(1, v.b); x.fillStyle = g; x.fillRect(a, b, w, h);
        }
        else if (t === 'radial') { const cx = a + w * v.cx / 100, cy = b + h * v.cy / 100, R = Math.max(1, Math.hypot(w, h) / 2 * v.s / 100), g = x.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, v.a); g.addColorStop(1, v.b); x.fillStyle = g; x.fillRect(a, b, w, h); }
        else if (t === 'conic') {
            const cx = a + w / 2, cy = b + h / 2;
            if (x.createConicGradient) { const g = x.createConicGradient((v.deg - 90) * Math.PI / 180, cx, cy); g.addColorStop(0, v.a); g.addColorStop(1, v.b); x.fillStyle = g; x.fillRect(a, b, w, h); }
            else { const R = Math.hypot(w, h), n = 120; for (let i = 0; i < n; i++) { const t0 = (v.deg - 90) * Math.PI / 180 + i / n * Math.PI * 2; x.fillStyle = mix(v.a, v.b, i / n); x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, t0, t0 + Math.PI * 2 / n + .01); x.fill(); } }
        }
        else if (t === 'stripe') {   // 줄 = 기울인 긴 막대 여러 개
            const s = v.s, sw = s * v.w / 100, cx = a + w / 2, cy = b + h / 2, R = Math.hypot(w, h) / 2 + s;
            x.beginPath(); x.rect(a, b, w, h); x.clip(); x.translate(cx, cy); x.rotate((v.deg - 90) * Math.PI / 180); x.fillStyle = v.c;
            for (let p = -Math.ceil(R / s) * s; p < R; p += s) x.fillRect(p, -R, sw, R * 2);
        }
        else if (t === 'rings') { const s = v.s, sw = s * v.w / 100, cx = a + w / 2, cy = b + h / 2, R = Math.hypot(w, h) / 2; x.beginPath(); x.rect(a, b, w, h); x.clip(); x.strokeStyle = v.c; x.lineWidth = sw; for (let r = sw / 2; r < R + s; r += s) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke(); } }
        else if (t === 'rays') { const cx = a + w / 2, cy = b + h / 2, R = Math.hypot(w, h), n = Math.round(v.n), st = Math.PI * 2 / n, o = v.deg * Math.PI / 180 - Math.PI / 2; x.beginPath(); x.rect(a, b, w, h); x.clip(); x.fillStyle = v.c; for (let i = 0; i < n; i++) { x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, o + i * st, o + i * st + st / 2); x.closePath(); x.fill(); } }
        else if (t === 'dot') { const s = v.s, c = tile(s, s, (q, W, H) => { q.fillStyle = v.c; const d = (u, k) => { q.beginPath(); q.arc(u, k, v.r, 0, Math.PI * 2); q.fill(); }; if (v.m === 'brick') { [[0, 0], [W, 0], [0, H], [W, H], [W / 2, H / 2]].forEach(([u, k]) => d(u, k)); } else d(W / 2, H / 2); }); x.fillStyle = pat(c); x.fillRect(a, b, w, h); }
        else if (t === 'check') { const s = v.s, c = tile(s, s, (q, W, H) => { q.fillStyle = rgba(v.c, v.o / 100); q.fillRect(0, 0, W / 2, H); q.fillRect(0, 0, W, H / 2); }); x.fillStyle = pat(c); x.fillRect(a, b, w, h); }
        else if (t === 'grid') { const s = v.s, c = tile(s, s, (q, W, H) => { q.fillStyle = v.c; q.fillRect(0, 0, W, v.w); q.fillRect(0, 0, v.w, H); }); x.fillStyle = pat(c); x.fillRect(a, b, w, h); }
        else if (t === 'image') {
            const im = img(v.src);
            if (im) {
                x.beginPath(); x.rect(a, b, w, h); x.clip();
                if (v.fit === 'tile') { const k = v.s / im.width, c = mkCv(im.width * k, im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); x.fillStyle = pat(c); x.fillRect(a, b, w, h); }
                else { const k = (v.fit === 'contain' ? Math.min : Math.max)(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k; x.drawImage(im, a + (w - iw) / 2, b + (h - ih) / 2, iw, ih); }
            }
        }
        x.restore();
    }
    function mix(p, q, k) { const A = parseInt(p.slice(1), 16), B = parseInt(q.slice(1), 16), f = s => Math.round((A >> s & 255) * (1 - k) + (B >> s & 255) * k); return `rgb(${f(16)},${f(8)},${f(0)})`; }

    /* ---------- 필터 (픽셀 · 사파리도 같게) ---------- */
    function colorFx(d, list) {
        if (!list.length) return;
        for (let i = 0; i < d.length; i += 4) {
            if (!d[i + 3]) continue;
            let r = d[i], g = d[i + 1], b = d[i + 2];
            for (const [t, v] of list) {
                if (t === 'bright') { const k = v / 100; r *= k; g *= k; b *= k; }
                else if (t === 'contrast') { const k = v / 100; r = (r - 128) * k + 128; g = (g - 128) * k + 128; b = (b - 128) * k + 128; }
                else if (t === 'saturate' || t === 'gray') { const s = t === 'gray' ? 1 - v / 100 : v / 100, l = .2126 * r + .7152 * g + .0722 * b; r = l + (r - l) * s; g = l + (g - l) * s; b = l + (b - l) * s; }
                else if (t === 'sepia') { const k = v / 100, R = .393 * r + .769 * g + .189 * b, G = .349 * r + .686 * g + .168 * b, Bb = .272 * r + .534 * g + .131 * b; r += (R - r) * k; g += (G - g) * k; b += (Bb - b) * k; }
                else if (t === 'hue') { const a = v * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), R = r * (.213 + c * .787 - s * .213) + g * (.715 - c * .715 - s * .715) + b * (.072 - c * .072 + s * .928), G = r * (.213 - c * .213 + s * .143) + g * (.715 + c * .285 + s * .14) + b * (.072 - c * .072 - s * .283), Bb = r * (.213 - c * .213 - s * .787) + g * (.715 - c * .715 + s * .715) + b * (.072 + c * .928 + s * .072); r = R; g = G; b = Bb; }
                else if (t === 'invert') { const k = v / 100; r += (255 - 2 * r) * k; g += (255 - 2 * g) * k; b += (255 - 2 * b) * k; }
                r = r < 0 ? 0 : r > 255 ? 255 : r; g = g < 0 ? 0 : g > 255 ? 255 : g; b = b < 0 ? 0 : b > 255 ? 255 : b;
            }
            d[i] = r; d[i + 1] = g; d[i + 2] = b;
        }
    }
    function boxBlur(d, w, h, r) {                                              // 가우스 흐림 ≈ 상자 흐림 세 번 (미리 곱한 알파로 · 가장자리 번짐 없이)
        if (r < 1) return;
        for (let i = 0; i < d.length; i += 4) { const a = d[i + 3] / 255; d[i] *= a; d[i + 1] *= a; d[i + 2] *= a; }
        const t = new Float32Array(d.length), s = new Float32Array(d);
        const pass = (src, dst, rr, horiz) => {
            const n = horiz ? w : h, m = horiz ? h : w, k = 1 / (rr * 2 + 1);
            for (let j = 0; j < m; j++) for (let c = 0; c < 4; c++) {
                const at = i => ((horiz ? j * w + i : i * w + j) << 2) + c; let acc = 0;
                for (let i = -rr; i <= rr; i++) acc += src[at(Math.min(n - 1, Math.max(0, i)))];
                for (let i = 0; i < n; i++) { dst[at(i)] = acc * k; acc += src[at(Math.min(n - 1, i + rr + 1))] - src[at(Math.max(0, i - rr))]; }
            }
        };
        const rr = Math.max(1, Math.round(r / 1.7));
        for (let n = 0; n < 3; n++) { pass(s, t, rr, true); pass(t, s, rr, false); }
        for (let i = 0; i < d.length; i += 4) { const a = s[i + 3]; d[i + 3] = a; d[i] = a ? s[i] / a * 255 : 0; d[i + 1] = a ? s[i + 1] / a * 255 : 0; d[i + 2] = a ? s[i + 2] / a * 255 : 0; }
    }

    /* ---------- 그리기 : 블록 레이어 → 캔버스 (W × H 종이) ---------- */
    function paint(out, W, H, L) {
        const ox = out.getContext('2d'); ox.clearRect(0, 0, W, H);
        const bx = L.box || { x: .15, y: .15, w: .7, h: .7 }, a = bx.x * W, b = bx.y * H, w = Math.max(2, bx.w * W), h = Math.max(2, bx.h * H);
        const on = (L.blocks || []).filter(B => B.on && DEFS[B.t]), one = t => { for (const B of on) if (B.t === t) return B.v; return null; }, all = t => on.filter(B => B.t === t).map(B => B.v);
        const R = one('radius'), CL = one('clip'), m = CL ? CL.m : 'none', r = R ? R.r : 0;
        const path = (x, g) => shapePath(x, m, a - g, b - g, w + g * 2, h + g * 2, m === 'none' ? r + (r ? g : 0) : 0);
        const E = mkCv(W, H), x = E.getContext('2d');
        /* ① 그림자 (뒤) */
        all('shadow').reverse().forEach(s => { const BIG = W * 4; x.save(); x.shadowColor = rgba(s.c, s.o / 100); x.shadowBlur = s.b; x.shadowOffsetX = s.x + BIG; x.shadowOffsetY = s.y; x.translate(-BIG, 0); path(x, s.sp); x.fillStyle = '#000'; x.fill(); x.restore(); });
        /* ② 바탕 (모양 안 · 아래 블록부터) */
        const T = one('text'), tclip = !!one('tclip') && T, bgs = on.filter(B => BG.has(B.t)).reverse();
        const bgDraw = q => bgs.forEach(B => bgLayer(q, B, a, b, w, h));
        if (!tclip) { x.save(); path(x, 0); x.clip(); bgDraw(x); x.restore(); }
        /* ③ 안쪽 그림자 */
        all('inset').reverse().forEach(s => {   // 바깥 큰 네모 − 안쪽 모양 = 테 → 그 그림자만 모양 안에
            const BIG = W * 4, sp = Math.min(s.sp, w / 2 - 1, h / 2 - 1), q = new Path2D(); q.rect(a - w - BIG, b - h, w * 3, h * 3);
            shapePath(q, m, a + sp - BIG, b + sp, w - sp * 2, h - sp * 2, m === 'none' ? Math.max(0, r - sp) : 0);
            x.save(); path(x, 0); x.clip(); x.shadowColor = rgba(s.c, s.o / 100); x.shadowBlur = s.b; x.shadowOffsetX = BIG; x.fillStyle = '#000'; x.fill(q, 'evenodd'); x.restore();
        });
        /* ④ 글자 */
        if (T && String(T.t || '').trim()) {
            const ts = one('tstroke'), sh = one('tshadow'), lines = String(T.t).split('\n');
            const set = q => { q.font = `${T.wt === '700' ? 'bold ' : ''}${T.fs}px ${T.font === 'serif' || T.font === 'sans-serif' ? T.font : `'${T.font}', sans-serif`}`; q.textAlign = T.al; q.textBaseline = 'middle'; };
            const tx = T.al === 'left' ? a + T.fs * .3 : T.al === 'right' ? a + w - T.fs * .3 : a + w / 2, lh = T.fs * 1.2, y0 = b + h / 2 - (lines.length - 1) * lh / 2;
            const each = fn => lines.forEach((ln, i) => fn(ln, tx, y0 + i * lh));
            if (tclip) {   // 🌈 글자 모양에만 바탕
                const G = mkCv(W, H), g = G.getContext('2d'); bgDraw(g); g.globalCompositeOperation = 'destination-in'; set(g); g.fillStyle = '#000'; each((ln, u, k) => g.fillText(ln, u, k));
                if (sh) { x.save(); x.shadowColor = sh.c; x.shadowBlur = sh.b; x.shadowOffsetX = sh.x; x.shadowOffsetY = sh.y; x.drawImage(G, 0, 0); x.restore(); }
                if (ts) { x.save(); set(x); x.lineJoin = 'round'; x.strokeStyle = ts.c; x.lineWidth = ts.w * 2; each((ln, u, k) => x.strokeText(ln, u, k)); x.restore(); }
                x.drawImage(G, 0, 0);
            } else {
                x.save(); set(x);
                if (sh) { x.save(); x.shadowColor = sh.c; x.shadowBlur = sh.b; x.shadowOffsetX = sh.x; x.shadowOffsetY = sh.y; x.fillStyle = T.c; each((ln, u, k) => x.fillText(ln, u, k)); x.restore(); }
                if (ts) { x.lineJoin = 'round'; x.strokeStyle = ts.c; x.lineWidth = ts.w * 2; each((ln, u, k) => x.strokeText(ln, u, k)); }
                x.fillStyle = T.c; each((ln, u, k) => x.fillText(ln, u, k)); x.restore();
            }
        }
        /* ⑤ 테두리 · 바깥 테두리 */
        const bd = one('border');
        if (bd) {
            x.save(); x.strokeStyle = bd.c; x.lineCap = bd.st === 'dotted' ? 'round' : 'butt';
            if (bd.st === 'double') { const t = Math.max(1, bd.w / 3); x.lineWidth = t; path(x, -t / 2); x.stroke(); path(x, -bd.w + t / 2); x.stroke(); }
            else { x.lineWidth = bd.w; if (bd.st === 'dashed') x.setLineDash([bd.w * 2.2, bd.w * 1.4]); if (bd.st === 'dotted') x.setLineDash([.01, bd.w * 1.8]); path(x, -bd.w / 2); x.stroke(); }
            x.restore();
        }
        all('outline').forEach(o => { x.save(); x.strokeStyle = o.c; x.lineWidth = o.w; path(x, o.gap + o.w / 2); x.stroke(); x.restore(); });
        /* ⑥ 필터 (쌓은 차례대로 · 아래 블록부터) */
        const fx = on.filter(B => FX.includes(B.t)).reverse();
        let F = E;
        if (fx.length) {
            const pad = Math.max(0, ...fx.map(B => B.t === 'blur' ? B.v.v * 3 : 0)), ext = 200 + pad;
            const rx = Math.max(0, Math.floor(a - ext)), ry = Math.max(0, Math.floor(b - ext)), rw = Math.min(W, Math.ceil(a + w + ext)) - rx, rh = Math.min(H, Math.ceil(b + h + ext)) - ry;
            let run = [];
            const flush = () => { if (!run.length) return; const id = F.getContext('2d').getImageData(rx, ry, rw, rh); colorFx(id.data, run); F.getContext('2d').putImageData(id, rx, ry); run = []; };
            for (const B of fx) {
                if (B.t === 'blur') { flush(); const id = F.getContext('2d').getImageData(rx, ry, rw, rh); boxBlur(id.data, rw, rh, B.v.v); F.getContext('2d').putImageData(id, rx, ry); }
                else if (B.t === 'drop') { flush(); const G = mkCv(W, H), g = G.getContext('2d'), s = B.v, BIG = W * 4; g.save(); g.shadowColor = s.c; g.shadowBlur = s.b; g.shadowOffsetX = s.x + BIG; g.shadowOffsetY = s.y; g.drawImage(F, -BIG, 0); g.restore(); g.drawImage(F, 0, 0); F = G; }
                else run.push([B.t, B.v.v]);
            }
            flush();
        }
        /* ⑦ 돌리기 · 늘리기 · 투명도 → 종이에 */
        const tf = one('tf'), op = one('opacity');
        ox.save(); ox.globalAlpha = op ? op.o / 100 : 1;
        if (tf) { const cx = a + w / 2, cy = b + h / 2; ox.translate(cx, cy); ox.rotate(tf.rot * Math.PI / 180); ox.transform(1, 0, Math.tan(tf.sk * Math.PI / 180), 1, 0, 0); ox.scale(tf.sx / 100, tf.sy / 100); ox.translate(-cx, -cy); }
        ox.drawImage(F, 0, 0); ox.restore();
    }
    /* ---------- 👩‍💻 같은 모습의 css 코드 (보기 · 배우기용) ---------- */
    function css(L) {
        const on = (L.blocks || []).filter(B => B.on && DEFS[B.t]), one = t => { for (const B of on) if (B.t === t) return B.v; return null; }, all = t => on.filter(B => B.t === t).map(B => B.v);
        const bg = on.filter(B => BG.has(B.t)).map(({ t, v }) => {
            if (t === 'fill') { const c = v.a >= 100 ? v.c : rgba(v.c, v.a / 100); return `linear-gradient(${c}, ${c})`; }
            if (t === 'linear') return `linear-gradient(${v.deg}deg, ${v.a}, ${v.b})`;
            if (t === 'radial') return `radial-gradient(circle at ${v.cx}% ${v.cy}%, ${v.a}, ${v.b} ${v.s}%)`;
            if (t === 'conic') return `conic-gradient(from ${v.deg}deg, ${v.a}, ${v.b})`;
            if (t === 'stripe') { const sw = Math.round(v.s * v.w / 100); return `repeating-linear-gradient(${v.deg}deg, ${v.c} 0 ${sw}px, transparent ${sw}px ${v.s}px)`; }
            if (t === 'rings') { const sw = Math.round(v.s * v.w / 100); return `repeating-radial-gradient(circle, ${v.c} 0 ${sw}px, transparent ${sw}px ${v.s}px)`; }
            if (t === 'rays') { const st = 360 / v.n; return `repeating-conic-gradient(from ${v.deg}deg, ${v.c} 0 ${(st / 2).toFixed(1)}deg, transparent 0 ${st.toFixed(1)}deg)`; }
            if (t === 'dot') return `radial-gradient(circle, ${v.c} ${v.r}px, transparent ${v.r + 1}px) 0 0 / ${v.s}px ${v.s}px`;
            if (t === 'check') return `linear-gradient(90deg, ${rgba(v.c, v.o / 100)} 50%, transparent 0) 0 0 / ${v.s}px ${v.s}px, linear-gradient(${rgba(v.c, v.o / 100)} 50%, transparent 0) 0 0 / ${v.s}px ${v.s}px`;
            if (t === 'grid') return `linear-gradient(${v.c} ${v.w}px, transparent 0) 0 0 / ${v.s}px ${v.s}px, linear-gradient(90deg, ${v.c} ${v.w}px, transparent 0) 0 0 / ${v.s}px ${v.s}px`;
            if (t === 'image') return `url(내-그림) center / ${v.fit === 'tile' ? v.s + 'px' : v.fit}${v.fit === 'tile' ? ' repeat' : ' no-repeat'}`;
            return '';
        }).filter(Boolean);
        const o = [];
        if (bg.length) o.push(['background', bg.join(',\n    ')]);
        const R = one('radius'), CL = one('clip'); if (R) o.push(['border-radius', R.r + 'px']);
        if (CL && CL.m !== 'none') o.push(['clip-path', CL.m === 'circle' ? 'circle(50%)' : CL.m === 'ellipse' ? 'ellipse(50% 50%)' : `path(/* ${CLIPS.find(c => c[0] === CL.m)[1]} */)`]);
        const bd = one('border'); if (bd) o.push(['border', `${bd.w}px ${bd.st} ${bd.c}`]);
        all('outline').forEach(v => { o.push(['outline', `${v.w}px solid ${v.c}`]); if (v.gap) o.push(['outline-offset', v.gap + 'px']); });
        const sh = all('shadow').map(v => `${v.x}px ${v.y}px ${v.b}px ${v.sp}px ${rgba(v.c, v.o / 100)}`).concat(all('inset').map(v => `inset 0 0 ${v.b}px ${v.sp}px ${rgba(v.c, v.o / 100)}`));
        if (sh.length) o.push(['box-shadow', sh.join(', ')]);
        const fx = on.filter(B => FX.includes(B.t)).reverse().map(({ t, v }) => t === 'blur' ? `blur(${v.v}px)` : t === 'bright' ? `brightness(${v.v}%)` : t === 'contrast' ? `contrast(${v.v}%)` : t === 'saturate' ? `saturate(${v.v}%)` : t === 'gray' ? `grayscale(${v.v}%)` : t === 'sepia' ? `sepia(${v.v}%)` : t === 'hue' ? `hue-rotate(${v.v}deg)` : t === 'invert' ? `invert(${v.v}%)` : `drop-shadow(${v.x}px ${v.y}px ${v.b}px ${v.c})`);
        if (fx.length) o.push(['filter', fx.join(' ')]);
        const tf = one('tf'); if (tf) o.push(['transform', `rotate(${tf.rot}deg) skewX(${tf.sk}deg) scale(${tf.sx / 100}, ${tf.sy / 100})`]);
        const op = one('opacity'); if (op) o.push(['opacity', op.o / 100]);
        const T = one('text');
        if (T) { o.push(['font', `${T.wt === '700' ? 'bold ' : ''}${T.fs}px '${T.font}'`], ['color', T.c], ['text-align', T.al]); const ts = one('tstroke'), tsh = one('tshadow'); if (ts) o.push(['-webkit-text-stroke', `${ts.w}px ${ts.c}`]); if (tsh) o.push(['text-shadow', `${tsh.x}px ${tsh.y}px ${tsh.b}px ${tsh.c}`]); if (one('tclip')) o.push(['background-clip', 'text'], ['color', 'transparent']); }
        return '.내-디자인 {\n' + o.map(([k, v]) => `  ${k}: ${v};`).join('\n') + '\n}';
    }

    window.CB = { DEFS, GROUPS, ORDER, CLIPS, fresh, paint, css, img, set onImg(f) { onImg = f; }, hexOk };
})();
