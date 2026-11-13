/* 말랑달콤 다이어리 - js/desklights.js
   💡 전구줄 (도련 11-03 · 책상 소품 종류 'lights')
   - 줄 = 진짜 끈처럼 처지고 출렁여요 (길이는 그대로) · 양 끝 · 중간 핀 = 🛠 책상 꾸미기에서만 끌어요 (줄을 잡으면 그 자리가 새 핀 · 가운데 핀 두 번 톡 = 빼기) · 평소엔 고정
   - 줄에 그림(전구)이 같은 간격으로 매달려요 · 그림 · 피봇 · 크기 · 개수 · 빛 색 · 깜빡임 = 상품 '소품.줄' (상품공방) · 깜빡임 종류의 동작 = 이 파일 DL_BLINK
   - 빛 = 책상 맨 위 한 겹 (#deskStage > .dk-lights · 스크린) · 톡 = 켜고 끄기 (o.cs.off · js/deskcustom.js dcTap)
   - 저장 : o.lp = 핀 [[줄 위 자리 0~1, x, y], …] (소품 네모 안 px) · o.lb = [가로, 세로] (핀을 옮기면 줄을 감싸게 다시 정해요)
   📷 집게 사진 (종류 'peg') : 🛠 꾸미기에서 줄 위에 놓으면 그 자리에 집혀요 (o.on = { r: 줄 소품 u, t: 줄 위 자리 0~1 }) · 줄 따라 흔들리고 무게만큼 줄이 더 처져요 · 줄 밖에 놓으면 그냥 소품 · 집는 자리 = 상품 '소품.peg' [x, y] (소품 px)
   상품 '소품.줄' = { lc: 줄 색, lw: 줄 굵기(px), len: 줄 길이(px), n: 전구 수 (0 = 줄만), glowR: 빛 크기(전구 크기 ×), cols: [빛 색 …](전구마다 돌아가며), 그림: [{ f: 파일 이름(전구1 …), pv: [x, y](0~1), s: 크기(px) }](돌아가며), 깜빡임: [{ t, d: 초, v: 한 박자 초 }](차례대로 · 끝나면 처음부터) } */
(function () {
    const DL_N = 40, DL_G = 0.5, DL_IT = 40, DL_DAMP = 0.93, DL_FADE = 0.07, DL_M = 160;
    /* 깜빡임 종류 (상품공방 BL_KINDS 와 같게) : i = 전구 번호 · n = 전구 수 · t = 이 칸에서 지난 초 · v = 한 박자 초 → 0 ~ 1 */
    const DL_BLINK = {
        on: () => 1,                                                          // 켜짐 그대로
        all: (i, n, t, v) => Math.floor(t / v) % 2 ? 0 : 1,                  // 전체 깜빡
        chase: (i, n, t, v) => Math.floor(t / v) % n === i ? 1 : 0,          // 차례대로 (앞부터)
        alt: (i, n, t, v) => (i + Math.floor(t / v)) % 2 ? 0 : 1             // 한 칸 건너
    };
    const S = new Map();                                                      // u → 줄 상태
    const IMG = new Map();                                                    // 그림 주소 → Image
    let run = false, T0 = performance.now(), last = T0, PEGS = [];
    const cfgOf = c => (c && c.줄) || {};
    const itemOf = u => DK.items.find(x => x.u === u);
    const imgOf = src => { if (!IMG.has(src)) { const im = new Image(); im.src = src; IMG.set(src, im); } return IMG.get(src); };
    const hex = c => { const n = parseInt(String(c || '#ffe28c').slice(1), 16) || 0xffe28c; return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); };

    /* ---------- 줄 ---------- */
    function pinsOf(el, o, c) {                                               // → Map(줄 점 번호 → 네모 안 {x, y})
        const L = Array.isArray(o.lp) && o.lp.length >= 2 ? o.lp : [[0, 0, 0], [1, Math.min(el.offsetWidth, +cfgOf(c).len || el.offsetWidth), 0]];
        const m = new Map(); L.forEach(p => { const k = Math.max(0, Math.min(DL_N - 1, Math.round(+p[0] * (DL_N - 1)))); m.set(k, { x: +p[1] || 0, y: +p[2] || 0 }); });
        if (!m.has(0)) m.set(0, { x: 0, y: 0 }); if (!m.has(DL_N - 1)) m.set(DL_N - 1, { x: el.offsetWidth, y: 0 });
        return m;
    }
    function stateOf(el) {
        const u = el.dataset.u; let st = S.get(u);
        if (st && st.el === el) return st;
        const o = itemOf(u), c = dkCat(el.dataset.id); if (!o || !c) return null;
        if (st) dropState(u);
        st = { u, el, c, pins: pinsOf(el, o, c), pts: [], bright: [], drag: null };
        const len = Math.max(20, +cfgOf(c).len || 400); st.seg = len / (DL_N - 1);
        const ks = [...st.pins.keys()].sort((a, b) => a - b), ox = el.offsetLeft, oy = el.offsetTop;
        for (let i = 0; i < DL_N; i++) {                                      // 처음 = 핀 사이를 곧게
            const a = ks.filter(k => k <= i).pop(), b = ks.find(k => k >= i), A = st.pins.get(a), B = st.pins.get(b), r = b === a ? 0 : (i - a) / (b - a);
            const x = ox + A.x + (B.x - A.x) * r, y = oy + A.y + (B.y - A.y) * r; st.pts.push({ x, y, px: x, py: y });
        }
        el.classList.add('dk-lt');
        const cv = document.createElement('canvas'); cv.className = 'dl-cv'; cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv); st.cv = cv;
        const stg = document.getElementById('deskStage'); let L = stg.querySelector(':scope > .dk-lights');
        if (!L) { L = document.createElement('div'); L.className = 'dk-lights'; L.setAttribute('aria-hidden', 'true'); stg.appendChild(L); }
        const gl = document.createElement('canvas'); gl.className = 'dl-glow'; gl.dataset.gu = u; L.appendChild(gl); st.gl = gl;
        wire(); S.set(u, st); return st;
    }
    function dropState(u) { const st = S.get(u); if (!st) return; if (st.gl) st.gl.remove(); if (st.cv) st.cv.remove(); S.delete(u); }
    const absPin = (st, p) => ({ x: st.el.offsetLeft + p.x, y: st.el.offsetTop + p.y });
    function clampPin(st, k, x, y) {                                          // 줄이 늘어나지 않게 (옆 핀과 줄 길이 안)
        for (let t = 0; t < 3; t++) st.pins.forEach((p, j) => { if (j === k) return; const a = absPin(st, p), max = Math.abs(j - k) * st.seg * .999, dx = x - a.x, dy = y - a.y, d = Math.hypot(dx, dy); if (d > max) { x = a.x + dx / d * max; y = a.y + dy / d * max; } });
        return { x, y };
    }
    function step(st) {
        const P = st.pts, pins = [...st.pins].map(([k, p]) => [k, absPin(st, p)]);
        for (const p of P) { const vx = (p.x - p.px) * DL_DAMP, vy = (p.y - p.py) * DL_DAMP; p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + DL_G; }
        (st.load || []).forEach(i => { P[i].y += DL_G * 1.2; });              // 📷 집은 사진 무게
        for (let it = 0; it < DL_IT; it++) {
            for (let i = 0; i < DL_N - 1; i++) {
                const a = P[i], b = P[i + 1], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-6, df = (d - st.seg) / d;
                const ia = st.pins.has(i) ? 0 : 1, ib = st.pins.has(i + 1) ? 0 : 1, s = ia + ib; if (!s) continue;
                a.x += dx * df * ia / s; a.y += dy * df * ia / s; b.x -= dx * df * ib / s; b.y -= dy * df * ib / s;
            }
            pins.forEach(([k, p]) => { P[k].x = p.x; P[k].y = p.y; });
        }
    }
    function onRope(P, u) {                                                   // 줄 위 자리 (0~1) → 그려진 선 위 점
        const f = u * (DL_N - 2), i = Math.min(DL_N - 3, Math.floor(f)), r = f - i;
        const m = k => ({ x: (P[k].x + P[k + 1].x) / 2, y: (P[k].y + P[k + 1].y) / 2 }), a = m(i), b = m(i + 1);
        return { x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r, vx: P[i + 1].x - P[i + 1].px };
    }

    /* ---------- 그리기 ---------- */
    function fitCv(cv, w, h, k) { const W = Math.round(w * k), H = Math.round(h * k); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } }
    function draw(st, now, dt) {
        const el = st.el, c = cfgOf(st.c), o = itemOf(st.u) || {}, on = !(o.cs && o.cs.off);
        const W = el.offsetWidth + DL_M * 2, H = el.offsetHeight + DL_M * 2, ox = el.offsetLeft - DL_M, oy = el.offsetTop - DL_M;
        const k = Math.min(2, (DK.s || 1) * (devicePixelRatio || 1));
        Object.assign(st.cv.style, { left: -DL_M + 'px', top: -DL_M + 'px', width: W + 'px', height: H + 'px' }); fitCv(st.cv, W, H, k);
        Object.assign(st.gl.style, { left: ox + 'px', top: oy + 'px', width: W + 'px', height: H + 'px', display: el.style.display === 'none' ? 'none' : '' }); fitCv(st.gl, W, H, k);
        const x = st.cv.getContext('2d'), g = st.gl.getContext('2d'), P = st.pts;
        x.setTransform(k, 0, 0, k, -ox * k, -oy * k); x.clearRect(ox, oy, W, H);
        g.setTransform(k, 0, 0, k, -ox * k, -oy * k); g.clearRect(ox, oy, W, H);
        x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(P[0].x, P[0].y);   // 🔌 전기줄 : 얇은 검정
        for (let i = 1; i < DL_N - 1; i++) x.quadraticCurveTo(P[i].x, P[i].y, (P[i].x + P[i + 1].x) / 2, (P[i].y + P[i + 1].y) / 2);
        x.lineTo(P[DL_N - 1].x, P[DL_N - 1].y); x.strokeStyle = /^#[0-9a-f]{6}$/i.test(c.lc || '') ? c.lc : '#111'; x.lineWidth = +c.lw > 0 ? +c.lw : 2; x.stroke();   // 줄 색 · 굵기 = 상품
        const n = Math.max(0, Math.min(60, Math.round(+c.n || 0))), B = (st.c.bulbs || []), cols = Array.isArray(c.cols) && c.cols.length ? c.cols : ['#ffe28c'], R = +c.glowR || 2;
        const L = Array.isArray(c.깜빡임) ? c.깜빡임.filter(b => b && DL_BLINK[b.t]) : [], tot = L.reduce((a, b) => a + Math.max(.1, +b.d || 0), 0);
        let clip = null, tl = 0; if (tot) { let r = ((now - T0) / 1000) % tot; for (const b of L) { const d = Math.max(.1, +b.d || 0); if (r < d) { clip = b; tl = r; break; } r -= d; } }
        if (st.bright.length !== n) st.bright = Array(n).fill(on ? 1 : 0);
        for (let i = 0; i < n; i++) {
            const tg = !on ? 0 : clip ? DL_BLINK[clip.t](i, n, tl, Math.max(.05, +clip.v || .5)) : 1;
            st.bright[i] += (tg - st.bright[i]) * Math.min(1, dt / DL_FADE);
            const b = B.length ? B[i % B.length] : null, im = b && imgOf(b.src); if (!im || !im.complete || !im.naturalWidth) continue;
            const p = onRope(P, (i + .5) / n), sw = Math.max(-.35, Math.min(.35, -p.vx * .06)), s = +b.s || 30, mx = Math.max(im.naturalWidth, im.naturalHeight);
            const w = s * im.naturalWidth / mx, h = s * im.naturalHeight / mx, pv = Array.isArray(b.pv) ? b.pv : [.5, .1], col = hex(cols[i % cols.length]), br = st.bright[i];
            const bx = -pv[0] * w, by = -pv[1] * h, gx = bx + w / 2, gy = by + h / 2;
            if (br > .01) {                                                   // ✨ 빛 (맨 위 한 겹 · 스크린)
                g.save(); g.translate(p.x, p.y); g.rotate(sw);
                const gd = g.createRadialGradient(gx, gy, 0, gx, gy, s * R);
                gd.addColorStop(0, `rgba(${col},${.95 * br})`); gd.addColorStop(.3, `rgba(${col},${.55 * br})`); gd.addColorStop(.65, `rgba(${col},${.18 * br})`); gd.addColorStop(1, `rgba(${col},0)`);
                g.fillStyle = gd; g.beginPath(); g.arc(gx, gy, s * R, 0, 7); g.fill(); g.restore();
            }
            x.save(); x.translate(p.x, p.y); x.rotate(sw); x.globalAlpha = .72 + .28 * br;   // 꺼지면 살짝 어둡게
            if (br > .01) { x.shadowColor = `rgba(${col},${br})`; x.shadowBlur = 10 * br; }
            x.drawImage(im, bx, by, w, h); if (br > .01) { x.shadowBlur = 4 * br; x.drawImage(im, bx, by, w, h); }
            x.restore();
        }
        x.fillStyle = '#111'; st.pins.forEach(p => { const a = absPin(st, p); x.beginPath(); x.arc(a.x, a.y, 4, 0, 7); x.fill(); });   // 📌 핀
    }
    function frame(now) {
        const dt = Math.min(.1, (now - last) / 1000); last = now;
        if (!S.size || UI.menu()) { run = false; return; }
        if (!document.hidden) { pegLoad(); S.forEach(st => { if (!st.el.isConnected) { dropState(st.u); return; } step(st); draw(st, now, dt); }); pegPlace(); }
        requestAnimationFrame(frame);
    }
    function dlPaint() {                                                      // js/desk.js deskItemsRender 끝에서
        const els = [...document.querySelectorAll('#deskStage .desk-item')].filter(el => ((dkCat(el.dataset.id) || {}).can || []).includes('rope'));   // 🎐 상품 '기능' rope (도련 11-06)
        S.forEach((st, u) => { if (!els.includes(st.el)) dropState(u); });
        PEGS = [...document.querySelectorAll('#deskStage .desk-item')].filter(el => ((dkCat(el.dataset.id) || {}).can || []).includes('peg'));
        els.forEach(el => { const o = itemOf(el.dataset.u); if (o && Array.isArray(o.lb)) { el.style.width = o.lb[0] + 'px'; el.style.height = o.lb[1] + 'px'; } stateOf(el); });
        if (S.size && !run) { run = true; last = performance.now(); requestAnimationFrame(frame); }
    }

    /* ---------- 🛠 꾸미기 : 끝 · 핀 끌기 ---------- */
    function toDesk(ev) { const R = document.getElementById('deskStage').getBoundingClientRect(), s = DK.s || 1; return { x: (ev.clientX - R.left) / s, y: (ev.clientY - R.top) / s }; }
    function hitPin(st, m, r) { let best = -1, bd = r; st.pins.forEach((p, k) => { const a = absPin(st, p), d = Math.hypot(a.x - m.x, a.y - m.y); if (d < bd) { bd = d; best = k; } }); return best; }
    function hitAny(ev) {                                                     // 꾸미기 중 · 핀이나 줄 위를 눌렀나 (소품 네모 밖으로 처진 줄도)
        if (!DK.edit || !S.size) return null;
        const m = toDesk(ev), r = 18 / (DK.s || 1);
        for (const st of S.values()) { const k = hitPin(st, m, r); if (k >= 0) return { st, k, m }; }
        for (const st of S.values()) { let k = -1, bd = r * .8; st.pts.forEach((p, i) => { const d = Math.hypot(p.x - m.x, p.y - m.y); if (d < bd) { bd = d; k = i; } }); if (k >= 0) return { st, k, m, rope: true }; }
        return null;
    }
    let DRAG = null, WIRED = false;
    function wire() {
        if (WIRED) return; WIRED = true;
        document.addEventListener('pointerdown', ev => {
            if (ev.button > 0) return; const h = hitAny(ev); if (!h) return;   // 빈 곳 = 소품째 옮기기 (js/desk.js deskWire)
            const { st, k } = h, el = st.el;
            if (h.rope) st.pins.set(k, { x: st.pts[k].x - el.offsetLeft, y: st.pts[k].y - el.offsetTop });   // 줄을 잡으면 그 자리가 새 핀
            ev.stopImmediatePropagation(); ev.preventDefault();
            if (typeof deskSelect === 'function') deskSelect(el);
            DRAG = { st, k, id: ev.pointerId };
        }, true);
        document.addEventListener('pointermove', ev => {
            if (!DRAG || ev.pointerId !== DRAG.id) return;
            ev.stopImmediatePropagation(); const { st, k } = DRAG, m = toDesk(ev), p = clampPin(st, k, m.x, m.y);
            st.pins.set(k, { x: p.x - st.el.offsetLeft, y: p.y - st.el.offsetTop });
        }, true);
        const up = ev => { if (!DRAG || ev.pointerId !== DRAG.id) return; ev.stopImmediatePropagation(); const st = DRAG.st; DRAG = null; refit(st); };
        document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
        document.addEventListener('dblclick', ev => {
            const h = hitAny(ev); if (!h || h.rope || h.k <= 0 || h.k >= DL_N - 1) return;   // 양 끝은 못 빼요
            ev.stopImmediatePropagation(); h.st.pins.delete(h.k); refit(h.st);
        }, true);
    }
    function refit(st) {                                                      // 소품 네모 = 핀 + 줄을 감싸게 · 핀은 새 네모 안 자리로
        const el = st.el, o = itemOf(st.u); if (!o) return;
        const A = [...st.pins.values()].map(p => absPin(st, p)), xs = A.concat(st.pts).map(p => p.x), ys = A.concat(st.pts).map(p => p.y);
        const l = Math.round(Math.min(...xs)) - 8, t = Math.round(Math.min(...ys)) - 8, w = Math.round(Math.max(...xs)) + 8 - l, h = Math.max(40, Math.round(Math.max(...ys)) + 30 - t);
        const ol = el.offsetLeft, ot = el.offsetTop;
        st.pins.forEach(p => { p.x += ol - l; p.y += ot - t; });
        Object.assign(el.style, { left: l + 'px', top: t + 'px', width: w + 'px', height: h + 'px' });
        o.x = l; o.y = t; o.lb = [w, h]; o.lp = [...st.pins].sort((a, b) => a[0] - b[0]).map(([k, p]) => [+(k / (DL_N - 1)).toFixed(4), Math.round(p.x), Math.round(p.y)]);
        DK.base[st.u] = { x: l, y: t };
        dkPersist(o); if (window.deskZAll) deskZAll(); if (window.deskTipPlace) deskTipPlace();
    }
    function dlSolid(el, cx, cy) {                                            // 톡 · 끌기 = 줄 · 전구 · 핀 위만 (빈 곳은 아래 소품으로 · js/desk.js dkSolidAt)
        const st = S.get(el.dataset.u); if (!st) return false;
        const m = toDesk({ clientX: cx, clientY: cy }), r = 14 / (DK.s || 1), c = cfgOf(st.c), n = Math.max(0, Math.round(+c.n || 0)), B = st.c.bulbs || [];
        if (st.pts.some(p => Math.hypot(p.x - m.x, p.y - m.y) < r)) return true;
        for (let i = 0; i < n; i++) { const b = B.length ? B[i % B.length] : null, s = (b && +b.s) || 30, p = onRope(st.pts, (i + .5) / n); if (Math.hypot(p.x - m.x, p.y + s * .4 - m.y) < s * .6 + r * .5) return true; }
        return false;
    }
    /* ---------- 📷 집게 사진 ---------- */
    const pegPt = el => { const c = dkCat(el.dataset.id) || {}; return Array.isArray(c.peg) ? [+c.peg[0] || 0, +c.peg[1] || 0] : [(c.w || el.offsetWidth) / 2, 4]; };
    function pegLoad() {                                                      // 줄마다 집힌 자리 (무게)
        S.forEach(st => { st.load = []; });
        PEGS.forEach(el => { const o = itemOf(el.dataset.u), st = o && o.on && S.get(o.on.r); if (!st || el.classList.contains('lift')) return; st.load.push(Math.max(1, Math.min(DL_N - 2, Math.round(+o.on.t * (DL_N - 1))))); });
    }
    function pegPlace() {
        PEGS.forEach(el => {
            if (!el.isConnected) return; const o = itemOf(el.dataset.u), st = o && o.on && S.get(o.on.r);
            if (el.classList.contains('lift') || !st) { el.style.rotate = ''; return; }   // 끄는 중 · 줄이 없으면 그 자리 그대로
            const pg = pegPt(el), p = onRope(st.pts, Math.max(.01, Math.min(.99, +o.on.t))), sw = Math.max(-.3, Math.min(.3, -p.vx * .05));
            el.style.left = (p.x - pg[0]) + 'px'; el.style.top = (p.y - pg[1]) + 'px';
            el.style.transformOrigin = `${pg[0]}px ${pg[1]}px`; el.style.rotate = sw.toFixed(3) + 'rad';
            el.style.zIndex = (parseInt(st.el.style.zIndex) || 10) + 1;       // 집힌 줄 바로 앞
        });
    }
    const isPeg = el => ((dkCat(el.dataset.id) || {}).can || []).includes('peg');
    function pegNear(el) {                                                    // 가장 가까운 줄 자리 (집게 끝에서 40px 안) → { d, r, t, p } | null
        const pg = pegPt(el), a = { x: el.offsetLeft + pg[0], y: el.offsetTop + pg[1] }; let best = null;
        S.forEach(st => { for (let i = 1; i < 200; i++) { const t = i / 200, p = onRope(st.pts, t), d = Math.hypot(p.x - a.x, p.y - a.y); if (d < 40 && (!best || d < best.d)) best = { d, r: st.u, t: +t.toFixed(4), p }; } });
        return best;
    }
    /* 📷 끄는 동안 = 줄에 닿으면 알려 줘요 (도련 11-12 : 만든 사람이 아니면 줄에 놓으면 집힌다는 걸 몰라요) : 줄 위 그 자리에 반짝 동그라미 + 집게가 빛나요 */
    function dlPegHint(el) {
        const st0 = document.getElementById('deskStage'); if (!st0) return;
        let mk = st0.querySelector(':scope > .dl-pegmk');
        const b = el && isPeg(el) ? pegNear(el) : null;
        if (el) el.classList.toggle('dl-near', !!b);
        if (!b) { if (mk) mk.remove(); return; }
        if (!mk) { mk = document.createElement('i'); mk.className = 'dl-pegmk'; mk.innerHTML = '<b>놓으면 집혀요</b>'; st0.appendChild(mk); }
        mk.style.left = b.p.x + 'px'; mk.style.top = b.p.y + 'px';
    }
    function dlPegDrop(el) {                                                  // js/desk.js deskWire : 🛠 꾸미기에서 놓으면 = 줄 가까우면 집혀요
        dlPegHint(null); el.classList.remove('dl-near');
        if (!isPeg(el)) return;
        const o = itemOf(el.dataset.u); if (!o) return;
        const best = pegNear(el), was = !!o.on;
        if (best) o.on = { r: best.r, t: best.t }; else delete o.on;
        if (!run && S.size) { run = true; last = performance.now(); requestAnimationFrame(frame); }
        if (best) {                                                           // 📌 찰칵 = 집혔어요
            setTimeout(() => { el.animate([{ scale: '1' }, { scale: '1.08' }, { scale: '.97' }, { scale: '1' }], { duration: 380, easing: 'ease-out' }); if (window.dkwSay) dkwSay('📌 줄에 집혔어요', el); }, 60);
            buzz(12);
        } else if (was && window.dkwSay) dkwSay('줄에서 뺐어요', el);
    }
    window.dlPaint = dlPaint; window.dlSolid = dlSolid; window.dlPegDrop = dlPegDrop; window.dlPegHint = dlPegHint;
})();
