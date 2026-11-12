/* 말랑달콤 다이어리 - js/gdtry.js
   🏪 문구 사용해보기 = 가상 연습장 (도련 11-12)
   - 샵의 문구 [사용해보기] → 화면 가득 펼친 연습장 · 그 문구를 손에 들고 바로 써 봐요 (버튼 없이 · 한 줄 안내)
   - 진짜와 가상은 따로예요 : 진짜 다이어리 · 문구함 · 드라이브 · 스티커 서랍과 아무 상관이 없어요 · 저장 없음 · 닫으면 다 사라져요
   - 크기 = 진짜 다이어리 페이지와 같은 비율 (페이지 440 × 640 · 문구는 🧁 상품공방 크기 그대로 · js/gdpic.js)
   - 문구마다 준비물 : ✏️ 필기구 · 🖍 형광펜 = 빈 종이 · 🧽 지우개 = 미리 쓴 글씨 · 📏 자 = 자 + 검정 펜 (자 옆을 따라 곧게)
     🔪 칼 = 샘플 스티커 (끌어서 자르기) · ✂️ 가위 = 샘플 모조지 (빙 둘러 오리기) · 🪡 핀셋 = 샘플 스티커 셋 (집어 옮기기)
     📎 집게 = 종이 가장자리에 꽂기 · 🩹 양면테이프 = 끌어서 바르기 · 🕳️ 펀칭기 = 구멍 막힌 바인더 속지 (왼쪽 구멍 자리)
   - 🏠 공간 나누기 (도련 11-12 · js/space.js) : 연습장 = '저장하지 않는 공간' · 문구 기능은 진짜 다이어리와 같은 함수를 빌려 써요
     ✏️ 필기구 · 🖍 형광펜 · 🧽 지우개 · 📏 자 = js/draw.js · js/ruler.js 그대로 (펜꽂이 · 손 · 자에 붙이기 · 꽂으면 그림 하나) · 다른 문구는 차례로 옮겨요
   ※ 이 파일이 없어도 샵은 예전처럼 확대로 보여요 (js/basket.js shZoom) */
(function () {
    const PW = 440, PH = 640;                                                     // 다이어리 한 쪽 (진짜 다이어리와 같은 비율)
    const TIP = {
        pen: '✏️ 종이 위를 끌어서 써 보세요', hi: '🖍 끌어서 칠해 보세요', erase: '🧽 쓴 글씨를 문질러 지워 보세요',
        ruler: '📏 자를 옮기고 · 자 옆을 따라 그어 보세요', knife: '🔪 스티커 위를 끌어서 잘라 보세요', scissors: '✂️ 모조지 위를 빙 둘러 오려 보세요',
        tweez: '🪡 스티커를 집어서 옮겨 보세요', clip: '📎 종이 가장자리에 꽂아 보세요', tape: '🩹 끌어서 테이프를 발라 보세요', punch: '🕳️ 왼쪽 동그라미 자리를 눌러 구멍을 뚫어 보세요'
    };
    const PENLIKE = { knife: 1 };                                                 // 연필처럼 비스듬히 들어요 (js/draw.js PC_ANG)
    const REAL = { pen: 1, hi: 1, erase: 1, ruler: 1 };                           // 🏠 진짜 기능을 빌려 쓰는 문구 (js/draw.js · js/ruler.js)
    const PC_ANG = -145;
    let G = null;                                                                 // 지금 연습장 (닫으면 null · 아무것도 남지 않아요)

    /* 🎀 샘플 그림 (앱 안에서 바로 그려요 · 받을 것 없음) */
    const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    const STK = [
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><path d="M60 104C20 76 4 54 4 32 4 15 17 4 32 4c12 0 22 7 28 18C66 11 76 4 88 4c15 0 28 11 28 28 0 22-16 44-56 72z" fill="#ff9ec1" stroke="#fff" stroke-width="7"/><circle cx="42" cy="46" r="5" fill="#5a3a44"/><circle cx="78" cy="46" r="5" fill="#5a3a44"/><path d="M50 60q10 9 20 0" stroke="#5a3a44" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="60" r="7" fill="#ffd0e0"/><circle cx="88" cy="60" r="7" fill="#ffd0e0"/></svg>'),
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 6l15 33 36 4-27 24 8 36-32-19-32 19 8-36L9 43l36-4z" fill="#ffd36b" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><circle cx="48" cy="58" r="4.5" fill="#6a4a2a"/><circle cx="72" cy="58" r="4.5" fill="#6a4a2a"/><path d="M53 70q7 6 14 0" stroke="#6a4a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>'),
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130"><ellipse cx="42" cy="34" rx="13" ry="30" fill="#fff" stroke="#f3b6c8" stroke-width="5"/><ellipse cx="78" cy="34" rx="13" ry="30" fill="#fff" stroke="#f3b6c8" stroke-width="5"/><circle cx="60" cy="82" r="42" fill="#fff" stroke="#f3b6c8" stroke-width="6"/><circle cx="46" cy="78" r="5" fill="#4a3a40"/><circle cx="74" cy="78" r="5" fill="#4a3a40"/><circle cx="36" cy="92" r="7" fill="#ffd0e0"/><circle cx="84" cy="92" r="7" fill="#ffd0e0"/><path d="M54 92q6 6 12 0" stroke="#4a3a40" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>')
    ];
    function paperDraw(c) {                                                       // ✂️ 샘플 모조지 (분홍 바탕 · 하얀 물방울 · 작은 하트)
        const x = c.getContext('2d'), W = c.width, H = c.height;
        x.fillStyle = '#ffc9dc'; x.fillRect(0, 0, W, H);
        for (let j = 0; j < H / 22 + 1; j++) for (let i = 0; i < W / 22 + 1; i++) {
            const cx = i * 22 + (j % 2 ? 11 : 0), cy = j * 22;
            if ((i + j) % 3) { x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill(); }
            else { x.fillStyle = '#ff7aa8'; x.font = '12px sans-serif'; x.fillText('♥', cx - 5, cy + 4); }
        }
    }

    /* 🧭 여는 곳 (js/basket.js shZoom) */
    function gdTry(id) {
        const p = window.gdPic && gdPic(id); if (!p) return false;
        const g = p.g, size = p.size || [p.w, p.h], tip = (window.gdPicTip && gdPicTip(p)) || [size[0] / 2, 0];
        gdTryOff();
        const one = g === 'punch' || UI.phone();                                  // 🕳️ 펀칭 = 바인더 속지 한 장 · 📱 폰 = 한 쪽
        const W = one ? PW : PW * 2;
        if (REAL[g] && window.penOn && penOn()) penDone();                       // ✏️ 다이어리에서 쓰던 것은 다이어리에 붙이고 (연습장과 섞이지 않게)
        const r = document.createElement('div'); r.id = 'gdTry'; r.className = 'gdt';
        r.innerHTML = `<div class="gdt-st" style="width:${W}px;height:${PH}px">
                <div class="gdt-book${one ? ' one' : ''}${g === 'punch' ? ' bnd' : ''}">${one ? '<i class="gdt-pg"></i>' : '<i class="gdt-pg l"></i><i class="gdt-pg r"></i>'}</div>
                <div class="gdt-page"></div><div class="gdt-lay"></div>
                <div class="gdt-hand" style="width:${size[0]}px;height:${size[1]}px;transform-origin:${tip[0]}px ${tip[1]}px">${gdPicSvg(id, { parts: g === 'scissors' ? [['날1', 'gdt-b1'], ['날2', 'gdt-b2']] : g === 'tweez' ? [['왼팔', 'gdt-a1'], ['오른팔', 'gdt-a2']] : null, over: g === 'tweez' ? '몸' : '' })}</div>
            </div>
            <div class="gdt-tip">${TIP[g] || '✨ 써 보세요'}</div><button type="button" class="desk-shop-go gdt-x">닫기</button>`;
        document.body.appendChild(r);
        const st = r.querySelector('.gdt-st');
        G = { id, p, g, W, one, size, tip, r, st, page: r.querySelector('.gdt-page'), lay: r.querySelector('.gdt-lay'), hand: r.querySelector('.gdt-hand'), k: 1, drag: null, pieces: [], held: null, slots: [] };
        document.body.classList.add('gdt-on');
        r.querySelector('.gdt-x').onclick = gdTryOff;
        fit(); setup();
        st.addEventListener('pointerdown', down); st.addEventListener('pointermove', move); st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
        st.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !G.drag) G.hand.classList.add('away'); });
        if (REAL[g]) realStart(); else handAt(W * .62, PH * .5);
        return true;
    }
    function gdTryOff() {                                                         // 🧹 닫으면 다 사라져요 (가상)
        if (G && G.real) { if (penOn()) penClose(); if (G.rl && window.rlOn && rlOn()) rlEnd(); spUse(null); }   // 🏠 다시 진짜 다이어리 공간으로
        const r = document.getElementById('gdTry'); if (r) r.remove(); G = null; document.body.classList.remove('gdt-on');
    }
    /* 🏠 저장하지 않는 공간 : 쓰는 종이 = 연습장 · 붙이면 연습장 위에 · 저장 없음 · 펜꽂이 = 써 볼 것 하나 */
    function realStart() {
        const g = G.g, pen = g === 'ruler' ? (gdPicOf('pen').find(x => /333|000|black/i.test(x.id)) || gdPicOf('pen')[0] || {}).id : G.id;
        const one = window.pkCupOne && pkCupOne(pen); if (!one) return;
        G.real = true; G.pen = pen; G.hand.hidden = true;
        spUse({ page: () => G.page, rect: p => p.getBoundingClientRect(), add: realAdd, keep: false, cup: [one] });
        if (g === 'erase') penAttach(SCRIBBLE(G.one ? [70] : [70, PW + 70]));   // 🧽 미리 쓴 글씨 (진짜 펜 그림 그대로)
        const b = G.page.getBoundingClientRect(), x = b.left + b.width * (G.one ? .5 : .75), y = b.top + b.height * .5;
        if (g === 'ruler') { G.rl = !rlOn(); rlShow(b.left + b.width * (G.one ? .5 : .75), b.top + b.height * .4, G.id.replace(/^ruler:/, '')); }
        drawWith(pen, x + 40, y + 120);
    }
    function realAdd(src) {                                                       // 붙이기 = 연습장 종이 위에 (옮기기 · 저장 없음)
        const el = document.createElement('div'); el.className = 'element-box'; el.style.width = '150px';
        const img = document.createElement('img'); img.src = src; img.alt = ''; img.draggable = false; el.appendChild(img);
        G.page.appendChild(el); return true;
    }
    const SCRIBBLE = xs => xs.flatMap(x0 => [180, 250, 320].map((y0, j) => {   // 꼬불꼬불 손글씨 세 줄
        const pts = []; for (let i = 0; i <= 70; i++) { const x = x0 + i * 4.2; pts.push([x, y0 + Math.sin(x / 7 + j) * 9 + Math.sin(x / 23) * 5]); }
        return { tool: 'pen', color: '#3a3a4a', w: 3, pts };
    }));
    function fit() {
        if (!G) return;
        const k = Math.min((innerWidth - 24) / G.W, (innerHeight - 110) / PH);    // 화면 안 가득 (위 닫기 · 아래 안내 자리)
        G.k = k; G.st.style.transform = `translate(${(innerWidth - G.W * k) / 2}px, ${Math.max(46, (innerHeight - PH * k) / 2 - 10)}px) scale(${k})`;
    }
    addEventListener('resize', fit);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && G) gdTryOff(); });
    const loc = e => { const b = G.st.getBoundingClientRect(); return { x: (e.clientX - b.left) / G.k, y: (e.clientY - b.top) / G.k }; };
    function handAt(x, y, ang) {                                                  // 쓰는 끝 = (x, y)
        const h = G.hand; h.classList.remove('away');
        const a = ang != null ? ang : PENLIKE[G.g] ? PC_ANG : 0;
        h.style.left = (x - G.tip[0]) + 'px'; h.style.top = (y - G.tip[1]) + 'px'; h.style.rotate = a + 'deg';
    }
    const say = (e, t) => { if (window.twzSay) twzSay(e.clientX, e.clientY, t, 1500); };
    const pageOf = x => G.one ? { l: 0, r: PW } : x < PW ? { l: 0, r: PW } : { l: PW, r: PW * 2 };
    const onPaper = q => q.x > 6 && q.x < G.W - 6 && q.y > 6 && q.y < PH - 6;
    const add = (cls, css, html) => { const d = document.createElement('div'); d.className = cls; if (css) d.style.cssText = css; if (html) d.innerHTML = html; G.lay.appendChild(d); return d; };

    /* 📦 문구마다 준비물 */
    function setup() {
        const g = G.g;
        if (g === 'knife') { const s = 190; G.pieces.push(pieceEl({ src: STK[0], x: (G.one ? PW / 2 : PW * 1.5) - s / 2, y: PH / 2 - s * .45, w: s, h: s * 110 / 120, poly: [[0, 0], [1, 0], [1, 1], [0, 1]] })); }
        if (g === 'tweez') STK.forEach((u, i) => { const s = 92; G.pieces.push(pieceEl({ src: u, x: (G.one ? 60 : PW + 40) + i * 120, y: 230 + (i % 2) * 90, w: s, h: s, poly: [[0, 0], [1, 0], [1, 1], [0, 1]] })); });
        if (g === 'scissors') {                                                   // 모조지 한 장 (캔버스 · 오린 자리는 비어요)
            const w = 260, h = 300, c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; c.className = 'gdt-sheet';
            c.style.cssText = `left:${(G.one ? PW / 2 : PW * 1.5) - w / 2}px;top:${PH / 2 - h / 2}px;width:${w}px;height:${h}px`;
            const x = c.getContext('2d'); x.scale(2, 2); paperDraw({ getContext: () => x, width: w, height: h }); G.lay.appendChild(c); G.sheet = { c, x: parseFloat(c.style.left), y: parseFloat(c.style.top), w, h };
        }
        if (g === 'punch') {                                                      // 바인더 속지 = 6공 자리 (막혀 있어요)
            const ys = [0.12, 0.2, 0.28, 0.72, 0.8, 0.88].map(f => f * PH);
            G.slots = ys.map(y => ({ x: 24, y, done: false, el: add('gdt-slot', `left:${24 - 9}px;top:${y - 9}px`) }));
        }
    }

    /* 🎀 스티커 조각 (칼 · 핀셋) : poly = 0~1 비율 다각형 */
    function pieceEl(o) {
        const d = add('gdt-pc', '', `<img src="${o.src}" alt="" draggable="false">`);
        o.el = d; piecePaint(o); return o;
    }
    function piecePaint(o) {
        Object.assign(o.el.style, { left: o.x + 'px', top: o.y + 'px', width: o.w + 'px', height: o.h + 'px', clipPath: `polygon(${o.poly.map(p => (p[0] * 100).toFixed(2) + '% ' + (p[1] * 100).toFixed(2) + '%').join(',')})` });
    }
    const pieceAt = q => [...G.pieces].reverse().find(o => inPoly(o.poly.map(p => [o.x + p[0] * o.w, o.y + p[1] * o.h]), q));
    function inPoly(P, q) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > q.y) !== (yj > q.y) && q.x < (xj - xi) * (q.y - yi) / (yj - yi) + xi) c = !c; } return c; }
    function halfClip(P, a, b, keep) {                                           // 다각형을 선 a→b 한쪽만 (keep = +1 · -1)
        const sd = p => keep * ((b.x - a.x) * (p[1] - a.y) - (b.y - a.y) * (p[0] - a.x)), out = [];
        for (let i = 0; i < P.length; i++) {
            const p = P[i], q = P[(i + 1) % P.length], sp = sd(p), sq = sd(q);
            if (sp >= 0) out.push(p);
            if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
        }
        return out;
    }
    const area = P => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
    function knifeCut(a, b) {                                                     // 🔪 선이 지나간 조각 = 두 조각 (살짝 벌어져요)
        if (Math.hypot(b.x - a.x, b.y - a.y) < 24) return false;
        let did = false;
        G.pieces.slice().forEach(o => {
            const P = o.poly.map(p => [o.x + p[0] * o.w, o.y + p[1] * o.h]);
            if (inPoly(P, a) || inPoly(P, b)) return;                             // 스티커 밖에서 밖으로 끝까지 그어야 잘려요
            const A = halfClip(P, a, b, 1), B = halfClip(P, a, b, -1);
            if (A.length < 3 || B.length < 3 || area(A) < 60 || area(B) < 60) return;
            const L = Math.hypot(b.x - a.x, b.y - a.y), nx = -(b.y - a.y) / L * 5, ny = (b.x - a.x) / L * 5;
            const mk = (Q, s) => pieceEl({ src: o.src, x: o.x + nx * s, y: o.y + ny * s, w: o.w, h: o.h, poly: Q.map(p => [(p[0] - o.x) / o.w, (p[1] - o.y) / o.h]) });
            o.el.remove(); G.pieces.splice(G.pieces.indexOf(o), 1, mk(A, 1), mk(B, -1)); did = true;
        });
        return did;
    }
    function scissorsCut(path) {                                                  // ✂️ 빙 둘러 오린 곳 = 새 조각 (모조지엔 구멍)
        const S = G.sheet; if (!S || path.length < 8) return false;
        const P = path.map(q => [q.x - S.x, q.y - S.y]);
        if (area(P) < 300) return false;
        const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.max(0, Math.min(...xs)), y0 = Math.max(0, Math.min(...ys)), x1 = Math.min(S.w, Math.max(...xs)), y1 = Math.min(S.h, Math.max(...ys));
        if (x1 - x0 < 10 || y1 - y0 < 10) return false;
        const w = x1 - x0, h = y1 - y0, c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const x = c.getContext('2d'); x.scale(2, 2);
        x.beginPath(); P.forEach((p, i) => i ? x.lineTo(p[0] - x0, p[1] - y0) : x.moveTo(p[0] - x0, p[1] - y0)); x.closePath(); x.save(); x.clip();
        x.drawImage(S.c, x0 * 2, y0 * 2, w * 2, h * 2, 0, 0, w, h); x.restore();
        const sx = S.c.getContext('2d'); sx.save(); sx.globalCompositeOperation = 'destination-out'; sx.beginPath(); P.forEach((p, i) => i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1])); sx.closePath(); sx.fill(); sx.restore();
        c.className = 'gdt-cut'; c.style.cssText = `left:${S.x + x0 + 14}px;top:${S.y + y0 + 14}px;width:${w}px;height:${h}px`; G.lay.appendChild(c);
        c.animate([{ translate: '-14px -14px', scale: '1' }, { translate: '0 0', scale: '1.04' }, { translate: '0 0', scale: '1' }], { duration: 420, easing: 'ease-out' });
        return true;
    }

    /* 👆 손짓 */
    function down(e) {
        if (!G || e.button > 0) return;
        if (G.real) { if (!penOn()) drawWith(G.pen, e.clientX, e.clientY); return; }   // ✏️ 꽂고 나서 종이를 누르면 다시 손에
        const q = loc(e), g = G.g; e.preventDefault(); G.st.setPointerCapture(e.pointerId);
        handAt(q.x, q.y);
        const cut = e.target.closest('.gdt-cut');
        if (cut && G.g === 'scissors') { G.drag = { k: 'move', el: cut, ox: q.x - parseFloat(cut.style.left), oy: q.y - parseFloat(cut.style.top) }; return; }
        if (g === 'knife') { G.drag = { k: 'knife', a: q, line: add('gdt-line', '') }; lineDraw(G.drag.line, q, q); return; }
        if (g === 'scissors') {
            const S = G.sheet; G.drag = { k: 'scs', path: [q], on: !!S && q.x >= S.x - 30 && q.x <= S.x + S.w + 30 && q.y >= S.y - 30 && q.y <= S.y + S.h + 30, trail: add('gdt-trail', '', `<svg viewBox="0 0 ${G.W} ${PH}" width="${G.W}" height="${PH}"><polyline points=""/></svg>`) };
            G.hand.classList.add('snip'); return;
        }
        if (g === 'tweez') { const o = pieceAt(q); G.hand.classList.add('pinch'); if (o) { G.drag = { k: 'twz', o, ox: q.x - o.x, oy: q.y - o.y }; o.el.classList.add('up'); G.lay.appendChild(o.el); } else G.drag = { k: 'none' }; return; }
        if (g === 'tape') { G.drag = { k: 'tape', a: q, el: add('gdt-tape', '') }; tapeDraw(G.drag.el, q, q); return; }
        if (g === 'clip') {
            const c = e.target.closest('.gdt-clip'); if (c) { c.remove(); G.drag = { k: 'none' }; return; }   // 꽂힌 집게 톡 = 다시 손에
            G.drag = { k: 'clip' }; return;
        }
        if (g === 'punch') { G.drag = { k: 'punch' }; return; }
    }
    function move(e) {
        if (!G || G.real) return;
        let q = loc(e); const d = G.drag;
        if (G.g === 'punch') { const s = G.slots.find(s => !s.done && Math.hypot(s.x - q.x, s.y - q.y) < 30); G.hand.classList.toggle('snap', !!s); if (s) q = { x: s.x, y: s.y }; }
        if (!d) { if (e.pointerType === 'mouse') handAt(q.x, q.y); return; }
        if (d.k === 'move') { d.el.style.left = (q.x - d.ox) + 'px'; d.el.style.top = (q.y - d.oy) + 'px'; return; }
        handAt(q.x, q.y);
        if (d.k === 'knife') lineDraw(d.line, d.a, q);
        if (d.k === 'scs') { const l = d.path[d.path.length - 1]; if (Math.hypot(q.x - l.x, q.y - l.y) > 4) { d.path.push(q); d.trail.querySelector('polyline').setAttribute('points', d.path.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ')); } }
        if (d.k === 'twz') { d.o.x = q.x - d.ox; d.o.y = q.y - d.oy; piecePaint(d.o); }
        if (d.k === 'tape') tapeDraw(d.el, d.a, q);
    }
    function up(e) {
        if (!G || G.real) return;
        const d = G.drag, q0 = loc(e); G.drag = null;
        G.hand.classList.remove('pinch', 'snip');
        if (!d) return;
        if (d.k === 'knife') { d.line.remove(); if (!knifeCut(d.a, q0)) say(e, '🔪 스티커 밖에서 밖으로 끝까지 그어요'); return; }
        if (d.k === 'scs') { d.trail.remove(); if (!d.on || !scissorsCut(d.path)) say(e, '✂️ 모조지 위를 빙 둘러 오려요'); return; }
        if (d.k === 'twz' && d.o) { d.o.el.classList.remove('up'); return; }
        if (d.k === 'tape') { const a = d.a, L = Math.hypot(q0.x - a.x, q0.y - a.y); if (L < 14) { d.el.remove(); say(e, '🩹 끌어서 발라요'); } return; }
        if (d.k === 'clip') {                                                     // 가장자리 (위 · 오른쪽 · 아래 · 바깥 왼쪽) 가까우면 꽂혀요
            const q = q0, E = [{ k: 't', d: Math.abs(q.y), x: q.x, y: 0, a: 0 }, { k: 'b', d: Math.abs(PH - q.y), x: q.x, y: PH, a: 180 }, { k: 'r', d: Math.abs(G.W - q.x), x: G.W, y: q.y, a: 90 }, { k: 'l', d: Math.abs(q.x), x: 0, y: q.y, a: -90 }].sort((a, b) => a.d - b.d)[0];
            if (E.d > 40) { say(e, '📎 종이 가장자리에 꽂아요'); return; }
            const s = G.size, t = G.tip, c = add('gdt-clip', `width:${s[0]}px;height:${s[1]}px;left:${E.x - t[0]}px;top:${E.y - t[1]}px;transform-origin:${t[0]}px ${t[1]}px;rotate:${E.a}deg`, gdPicSvg(G.id));
            c.animate([{ scale: '1.12' }, { scale: '1' }], { duration: 220 }); G.hand.classList.add('away'); return;
        }
        if (d.k === 'punch') {
            const s = G.slots.find(s => !s.done && Math.hypot(s.x - q0.x, s.y - q0.y) < 30);
            if (!s) { say(e, '🕳️ 왼쪽 동그라미 자리를 눌러요'); return; }
            s.done = true; s.el.className = 'gdt-hole'; G.hand.animate([{ translate: '0 0' }, { translate: '0 5px' }, { translate: '0 0' }], { duration: 180 });
            const ch = add('gdt-chad', `left:${s.x - 7}px;top:${s.y - 7}px`); ch.animate([{ translate: '0 0', opacity: 1 }, { translate: '14px 120px', rotate: '200deg', opacity: 0 }], { duration: 900, easing: 'ease-in' }).onfinish = () => ch.remove();
            if (G.slots.every(s => s.done)) setTimeout(() => G && say(e, '🎉 구멍이 다 뚫렸어요'), 300);
        }
    }
    function lineDraw(el, a, b) { const L = Math.hypot(b.x - a.x, b.y - a.y); Object.assign(el.style, { left: a.x + 'px', top: a.y + 'px', width: L + 'px', rotate: Math.atan2(b.y - a.y, b.x - a.x) + 'rad' }); }
    function tapeDraw(el, a, b) { const L = Math.max(4, Math.hypot(b.x - a.x, b.y - a.y)); Object.assign(el.style, { left: a.x + 'px', top: (a.y - 7) + 'px', width: L + 'px', rotate: Math.atan2(b.y - a.y, b.x - a.x) + 'rad' }); }

    window.gdTry = gdTry; window.gdTryOff = gdTryOff;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['gdtry'] = true;
