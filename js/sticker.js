/* 말랑달콤 다이어리 - js/sticker.js
   🏷️ 스티커 엔진 (도련 11-16 · 책 엔진처럼 · 10년 쓸 기초) : 🪡 핀셋으로 떼어 쓰는 스티커가 같이 쓰는 것 = 여기 하나 · 스티커 종류는 '다른 점'만
   - 스티커 종류 : 🏷️ 씰스티커 (js/stickerpeel.js · 하얀 종이에서 떼기) · 🧩 조각스티커 (js/piecebag.js · 봉투 뜯기 · 뒷종이 벗기기) · 📄 모조지스티커 (js/papermaker.js · ✂️ 오리기 · 칼집 · 글씨 · 구김)
   - 엔진이 하는 일 (S-1)
       🪡 핀셋 = stkTwz(x, y) : 핀셋을 들었으면 true · 아니면 그 자리에 '🪡 핀셋을 사용해 주세요' 말풍선 + 핀셋 자리 깜박 (js/skins.js twzSay)
       🔊 떼는 소리 = stkNoise(v) : 사각사각 하나 (0 = 조용 · js/util.js scrubSound)
       📄 붙이기 = stkStick(o) : 페이지에 그림을 놓고 (자리 · 크기 · 돌기) → 저장 (공간이 정해요 · js/space.js spSave) → 내 종이에서 그 칸을 지워요 (o.own)
           o = { src 그림, cx · cy 화면 가운데, w · h 화면 크기(px), deg 돌기, clamp (가운데를 페이지 안으로), orig (붙은 뒤 원본 크기로 · js/elements.js elOrig),
                 mark(el) 놓기 전에 표시 · after(el) 놓은 뒤 · own(el) 칸 지우기 } → 붙은 요소 (못 붙이면 null · addImage 가 늘 하나를 붙여요)
           stkUse(id, slot, el) = 🎒 그 칸은 영원히 사라져요 (js/own.js ownUse · 요소에 data-own = '종이:칸')
       stkDeg(rad, lim) = 돌기 각도 (도 · 소수 한 자리 · lim = 이만큼까지만 기울어요)
   - 🪟 종이 화면 (S-2) : 화면 한가운데 떠 있는 종이 창 (#pelRoom · #pcbRoom · #pmRoom = .pel-room)
       stkRoom(o) = 창 한 번 만들기 { id, cls, html, hit (손가락 받는 곳 id), down · move · up, resize } · 손가락은 hit 만 받아요 (그 밖은 페이지 그대로)
       stkScreen(S, fl) = 화면 크기 · 선명도(DPR · 3까지) · 캔버스 크기 맞추기 (fl = 겹쳐 그릴 빈 캔버스 S.fl 도)
       stkShow(S, room, frame) · stkHide(S, room) = 띄우기 (움직임 시작 · 뒤 페이지 고정 fc-lock) · 내리기
       stkKeep(x, y, w, h, dx, dy, A) = 종이 옮기기 : 화면 밖으로 안 나가게 [dx, dy] (A = { l, t, r, b } 둘레 여백 · 화면보다 크면 가운데)
       stkLoad(src, soft) = 그림 받기 (주소 그림은 CORS · soft = 못 받으면 null) · stkMk = 빈 캔버스 · stkGrow(src, r, step) = 둘레로 r 만큼 키운 모양 (하얀 칼선 · 뒷종이)
   - ✋ 핀셋 손길 (S-3) : 스티커 한 장 st = { cx, cy (화면 가운데), rot (라디안), s (배율) } · 그림 재료 a = { edge (가장자리 점), alpha(x, y) }
       stkToStage(st, x, y) · stkToLocal(st, x, y) = 스티커 안 좌표 ↔ 화면 좌표
       stkEdge(a, st, P) = 손가락에서 가장 가까운 가장자리 { bp 그 점, d 거리(화면 px), inside 그림 위인지 } → 가장자리를 잡아야 떼어져요
       stkPull(d, P, sticky) = 떼는 끝 F (끈적임 : 처음엔 손가락보다 덜 따라와요 · 220px 쯤 끌면 그대로) · d = { C 잡은 곳, start 누른 곳, base 시작 끝 }
       stkPeeled(a, st, C, F) = 얼마나 떼어졌는지 (0 ~ 1 · 가장자리 점이 접힌 선 너머로 간 비율)
       stkSpeed(d, P) = 손가락 빠르기 (px/ms · 떼는 소리 크기) · stkSway(st, dx, base, lim) = 끌면 살랑 기울어요 · stkWiggle(st) = 가운데를 누르면 살짝 흔들려요
       stkPageScale() = 떨어지는 순간 페이지에 붙을 진짜 크기 (페이지 배율) · stkCap(el, e) = 손가락 붙잡기 · stkBar(e, P) = 종이 밖 날짜바 = 페이지 옮기기
   - 📖 떼어지는 그림 (S-4) : 잡은 점(C)과 떼는 끝(F) 사이 가운데가 접히는 선 · 붙은 쪽 = 앞면 · 들린 쪽 = 뒤집힌 뒷면 + 말린 음영 + 그림자 (씰스티커 R&D 방법)
       stkImg(ctx, img, st, sh, extra, flip) = 스티커 한 장 그리기 (sh = 그림자 { c, b, y, x } · flip = 좌우 뒤집기 · 뗀 순간 뒷면 → 앞면)
       stkFold(S, ctx, a, st, C, F, sh) = 접혀 떼어지는 모습 (S = { fl 겹쳐 그릴 캔버스, DPR, W, H } · a = { front, back, w, h })
       stkSnap(sn, t) = 덜 떼고 놓으면 제자리로 착 (0.26초 · 끝 F 를 돌려줘요 · 끝나면 sn.end = true) · stkHalf = 접는 선 한쪽 칠할 곳
       📄 모조지 · 페이지 스티커 떼기(js/peelfx.js pfxSeal)도 이 그림을 써요 (soft = 큰 종이 둥근 말림 · 1246)
   - 🎞️ 매 순간 그리기 (S-6) : stkClear(S) 화면 지우기 · stkAway(S, t, out) 📱 종이가 비켜 줄 때 · 다시 나올 때 스르르 (보이는 정도 0 ~ 1 · S.gone · S.back)
       stkFlipIn(ctx, a, st, t, sh, extra, w, h) = 뗀 순간 뒷면 → 앞면으로 뒤집혀 손가락을 따라와요 (0.22초) · stkTape(c, box, alpha) = 종이 위 '✋ 잡고 옮겨요' 마스킹테이프
   - 🧩 그림 재료 (S-5) : stkAsset(img, m, o) = 둘레 여백 m 을 둔 앞면 front · 종이 뒷면 back (o.paper = [바탕색, 점 색] · 오톨도톨) · 가장자리 점 edge · alpha(x, y) (그림 위인지)
       o.gloss(ctx, w, h) = 뒷면을 만들기 전에 앞면에 더 그릴 것 (🧩 조각 = 유광 빛) · 종류만의 재료(🧩 뒷종이 liner · 조각 piece)는 종류 파일이 더해요
   - 단계 S-1 ~ S-6 다 끝 (도련 11-16 · 1241 ~ 1246) · 새 스티커 종류 = 종이 화면 모양 · 떼는 방법(어디를 잡는지 · 얼마나 떼면 떨어지는지) · 붙일 때 다른 점만 만들고 나머지는 여기 것을 써요
   ※ util.js · space.js · elements.js 다음 · 스티커 종류 파일보다 먼저 읽어요 */
const stkNoise = scrubSound({ hz: 3200, q: .7, hit: .3, lo: .3 });            // 🔊 🏷️ 씰 · 🧩 조각 '찌익' (예전엔 파일마다 같은 소리를 따로)
function stkTwz(x, y) {
    if (!window.gdTwz || gdTwz()) return true;
    if (window.twzSay) twzSay(x, y);
    return false;
}
const stkDeg = (rad, lim) => { if (lim != null) rad = Math.max(-lim, Math.min(lim, rad)); return Math.round(rad * 180 / Math.PI * 10) / 10; };
function stkUse(id, slot, el) {
    if (!window.ownUse) return;
    if (el) el.dataset.own = id + ':' + slot;
    ownUse(id, slot, el).catch(e => console.warn('스티커 칸을 아직 못 지웠어요 (다시 해요) :', e));
}
/* ---------- 🪟 종이 화면 (S-2) ---------- */
const stkMk = mkCanvas;                                                       // 🧰 js/util.js
function stkGrow(src, r, step) { const c = stkMk(src.width, src.height), d = c.getContext('2d'); for (const k of [1, .66, .33]) for (let a = 0; a < 360; a += step) d.drawImage(src, Math.cos(a * Math.PI / 180) * r * k, Math.sin(a * Math.PI / 180) * r * k); d.drawImage(src, 0, 0); return c; }
const stkLoad = (src, soft) => new Promise((ok, no) => { const im = new Image(); if (/^https?:/i.test(src)) im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = () => soft ? ok(null) : no(); im.src = src; });   // 주소 그림은 하얀 테두리를 그리려고 CORS 로
function stkRoom(o) {
    let el = document.getElementById(o.id); if (el) return el;
    el = document.createElement('div'); el.id = o.id; el.className = o.cls; el.innerHTML = o.html;
    document.body.appendChild(el);
    const h = document.getElementById(o.hit);
    h.addEventListener('pointerdown', o.down); h.addEventListener('pointermove', o.move);
    h.addEventListener('pointerup', o.up); h.addEventListener('pointercancel', o.up);
    if (o.resize) window.addEventListener('resize', o.resize);
    return el;
}
function stkScreen(S, fl) {
    const cv = S.cv;
    S.DPR = Math.min(window.devicePixelRatio || 1, 3); S.W = window.innerWidth; S.H = window.innerHeight;
    if (cv.width !== S.W * S.DPR || cv.height !== S.H * S.DPR) { cv.width = S.W * S.DPR; cv.height = S.H * S.DPR; }
    if (fl) S.fl = stkMk(cv.width, cv.height);
}
function stkShow(S, room, frame) {
    document.getElementById(room).classList.add('show'); document.body.classList.add('fc-lock');
    cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(frame);
}
function stkHide(S, room, ...cls) {
    S.on = false; S.drag = null; cancelAnimationFrame(S.raf);
    const r = document.getElementById(room); if (r) r.classList.remove('show', ...cls);
    document.body.classList.remove('fc-lock');
}
function stkKeep(x, y, w, h, dx, dy, A) {
    const W = window.innerWidth, H = window.innerHeight;
    dx = w > W - A.l - A.r ? (W - w) / 2 - x : Math.max(A.l - x, Math.min(W - A.r - w - x, dx));
    dy = h > H - A.t - A.b ? (H - h) / 2 - y : Math.max(A.t - y, Math.min(H - A.b - h - y, dy));
    return [dx, dy];
}

/* ---------- ✋ 핀셋 손길 (S-3) ---------- */
const stkToStage = (st, lx, ly) => { const c = Math.cos(st.rot), s = Math.sin(st.rot); return [st.cx + (lx * c - ly * s) * st.s, st.cy + (lx * s + ly * c) * st.s]; };
const stkToLocal = (st, x, y) => { const dx = (x - st.cx) / st.s, dy = (y - st.cy) / st.s, c = Math.cos(-st.rot), s = Math.sin(-st.rot); return [dx * c - dy * s, dx * s + dy * c]; };
function stkEdge(a, st, P) {
    const [lx, ly] = stkToLocal(st, P[0], P[1]); let best = 1e12, bp = null;
    for (const q of a.edge) { const d = (q[0] - lx) ** 2 + (q[1] - ly) ** 2; if (d < best) { best = d; bp = q; } }
    return { bp, d: Math.sqrt(best) * st.s, inside: a.alpha(lx, ly) > 128 };
}
function stkPull(d, P, sticky) {
    const b = d.base || d.C, dx = P[0] - d.start[0], dy = P[1] - d.start[1], k = sticky === false ? 1 : Math.min(1, .45 + Math.hypot(dx, dy) / 220);   // 끈적임
    return [b[0] + dx * k, b[1] + dy * k];
}
function stkPeeled(a, st, C, F) {
    const dx = F[0] - C[0], dy = F[1] - C[1], len = Math.hypot(dx, dy); if (len < 1) return 0;
    const n = [dx / len, dy / len], M = [(C[0] + F[0]) / 2, (C[1] + F[1]) / 2]; let off = 0;
    for (const [lx, ly] of a.edge) { const [x, y] = stkToStage(st, lx, ly); if ((x - M[0]) * n[0] + (y - M[1]) * n[1] < 0) off++; }
    return off / a.edge.length;
}
function stkSpeed(d, P) { const t = performance.now(), sp = Math.hypot(P[0] - d.last[0], P[1] - d.last[1]) / Math.max(1, t - d.lt); d.last = P; d.lt = t; return sp; }
function stkSway(st, dx, base, lim) { const r = st.rot + dx * .004 - (st.rot - base) * .08; st.rot = lim ? Math.max(-lim, Math.min(lim, r)) : r; }
function stkWiggle(st) { const r = st.rot, t0 = performance.now(); (function w() { const q = (performance.now() - t0) / 300; st.rot = r + Math.sin(q * Math.PI * 4) * .04 * (1 - q); if (q < 1) requestAnimationFrame(w); else st.rot = r; })(); }
function stkPageScale() { const pg = spPage(), r = pg && pg.getBoundingClientRect(); return r && r.width ? r.width / (pg.offsetWidth || r.width) * (window.dyImgK && spKeep() ? dyImgK() : 1) : 0; }   // 그림 1px → 화면 px (📏 실제 크기 비율 · js/skins.js dyImgK)
function stkCap(el, e) { try { el.setPointerCapture(e.pointerId); } catch (er) {} }
function stkBar(e, P) { if (window.pgmOnBar && pgmOnBar(P[0], P[1])) pgmBegin(e); }   // 종이 밖 날짜바 위 → 페이지 옮기기 (js/page.js)

/* ---------- 🎞️ 매 순간 그리기 (S-6) ---------- */
function stkClear(S) { const c = S.ctx; c.setTransform(S.DPR, 0, 0, S.DPR, 0, 0); c.clearRect(0, 0, S.W, S.H); return c; }
const stkAway = (S, t, out = 260) => S.gone ? Math.max(0, 1 - (t - S.gone) / out) : S.back ? Math.min(1, (t - S.back) / 260) : 1;
function stkFlipIn(ctx, a, st, t, sh, extra, w, h) {
    const fp = Math.min(1, (t - st.t0) / 220), flip = Math.cos(Math.PI * (1 - fp));
    stkImg(ctx, flip < 0 ? a.back : a.front, st, sh, extra, Math.max(.05, Math.abs(flip)) * (flip < 0 ? -1 : 1), w, h);
}
function stkTape(c, t, alpha = .92) {                                          // t = { x, y, w, h }
    c.save(); c.translate(t.x + t.w / 2, t.y + t.h / 2); c.rotate(-.03);
    const w = t.w / 2, h = t.h / 2; c.beginPath(); c.moveTo(-w, -h);
    for (let i = 0; i <= 6; i++) c.lineTo(w - (i % 2) * 4, -h + i * t.h / 6);
    for (let i = 0; i <= 6; i++) c.lineTo(-w + ((i + 1) % 2) * 4, h - i * t.h / 6);
    c.closePath(); c.shadowColor = 'rgba(90,60,70,.18)'; c.shadowBlur = 3; c.shadowOffsetY = 1;
    c.fillStyle = `rgba(255,198,214,${alpha})`; c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = -w + 8; x < w - 4; x += 12) c.fillRect(x, -h, 5, t.h);
    c.fillStyle = '#9b5a6e'; c.font = "700 12px 'Jua', sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✋ 잡고 옮겨요', 0, 1);
    c.restore();
}

/* ---------- 🧩 그림 재료 (S-5) ---------- */
function stkAsset(img, m, o = {}) {
    const w = img.width + m * 2, h = img.height + m * 2;
    const front = stkMk(w, h), f = front.getContext('2d'); f.drawImage(img, m, m);
    if (o.gloss) { f.save(); o.gloss(f, w, h); f.restore(); }
    const P = o.paper || ['#f4efe9', '#e4dcd3'], back = tintCanvas(front, P[0]), bk = back.getContext('2d');   // 종이 뒷면 (오톨도톨)
    bk.globalCompositeOperation = 'source-atop'; bk.globalAlpha = .25;
    for (let i = 0; i < w * h / 120; i++) { bk.fillStyle = Math.random() < .5 ? '#fff' : P[1]; bk.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const data = f.getImageData(0, 0, w, h).data, edge = [];
    const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : data[(y * w + x) * 4 + 3];
    const st = Math.max(2, Math.round(Math.max(w, h) / 160));
    for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st)
        if (A(x, y) > 128 && (A(x - st, y) <= 128 || A(x + st, y) <= 128 || A(x, y - st) <= 128 || A(x, y + st) <= 128)) edge.push([x - w / 2, y - h / 2]);
    return { w, h, m, front, back, edge, alpha: (lx, ly) => A(Math.round(lx + w / 2), Math.round(ly + h / 2)) };
}

/* ---------- 📖 떼어지는 그림 (S-4) ---------- */
const STK_SOFT = [[0, 'rgba(90,60,70,.42)'], [.12, 'rgba(255,255,255,.6)'], [.3, 'rgba(255,255,255,.2)'], [.7, 'rgba(160,130,140,.12)'], [1, 'rgba(120,90,100,.3)']];   // 📄 둥근 말림 음영 : 접힌 곳은 반짝 · 끝은 어둑
function stkImg(ctx, img, st, sh, extra = 1, flip = 1, w, h) {             // w · h = 그릴 크기 (선명하게 크게 만든 그림 · 없으면 그림 크기)
    ctx.save();
    if (sh) { ctx.shadowColor = sh.c; ctx.shadowBlur = sh.b; ctx.shadowOffsetY = sh.y; ctx.shadowOffsetX = sh.x || 0; }
    ctx.translate(st.cx, st.cy); ctx.rotate(st.rot); ctx.scale(st.s * extra * flip, st.s * extra);
    w = w || img.width; h = h || img.height; ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
}
function stkHalf(c, M, n, sign) {
    const p = [-n[1], n[0]], L = 4000; c.beginPath();
    c.moveTo(M[0] + p[0] * L, M[1] + p[1] * L); c.lineTo(M[0] - p[0] * L, M[1] - p[1] * L);
    c.lineTo(M[0] - p[0] * L + n[0] * L * sign, M[1] - p[1] * L + n[1] * L * sign); c.lineTo(M[0] + p[0] * L + n[0] * L * sign, M[1] + p[1] * L + n[1] * L * sign); c.closePath();
}
function stkFold(S, ctx, a, st, C, F, sh, soft) {                            // soft = 📄 큰 종이 (들린 쪽을 접힌 선 쪽으로 눌러 둥글게 말려 올라간 느낌 · js/peelfx.js pfxSeal)
    const dx = F[0] - C[0], dy = F[1] - C[1], len = Math.hypot(dx, dy);
    if (len < .5) { stkImg(ctx, a.front, st, sh, 1, 1, a.w, a.h); return; }
    const n = [dx / len, dy / len], M = [(C[0] + F[0]) / 2, (C[1] + F[1]) / 2];
    ctx.save(); stkHalf(ctx, M, n, 1); ctx.clip(); stkImg(ctx, a.front, st, sh, 1, 1, a.w, a.h); ctx.restore();
    const md = M[0] * n[0] + M[1] * n[1], A = 1 - 2 * n[0] * n[0], B = -2 * n[0] * n[1], D = 1 - 2 * n[1] * n[1], E = 2 * md * n[0], Fv = 2 * md * n[1], R = S.DPR;   // 접는 선으로 뒤집기
    const L = S.fl.getContext('2d'); L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, S.fl.width, S.fl.height);
    L.setTransform(R * A, R * B, R * B, R * D, R * E, R * Fv);
    if (soft) {                                                               // 📄 말린 종이 : 들린 부분을 접힌 선 쪽으로 짧게
        const c = .58, k = c - 1, nx = n[0], ny = n[1];
        const sa = 1 + k * nx * nx, sb = k * nx * ny, sd = 1 + k * ny * ny, se = M[0] - (sa * M[0] + sb * M[1]), sf = M[1] - (sb * M[0] + sd * M[1]);
        L.setTransform(1, 0, 0, 1, 0, 0); L.transform(R, 0, 0, R, 0, 0); L.transform(sa, sb, sb, sd, se, sf); L.transform(A, B, B, D, E, Fv);
    }
    L.save(); stkHalf(L, M, n, -1); L.clip();
    L.translate(st.cx, st.cy); L.rotate(st.rot); L.scale(st.s, st.s); L.drawImage(a.back, -a.w / 2, -a.h / 2, a.w, a.h); L.restore();
    L.setTransform(R, 0, 0, R, 0, 0); L.globalCompositeOperation = 'source-atop';                               // 말린 느낌 음영 : 접힌 선 근처는 어둡고 가운데는 밝게
    const span = Math.max(20, len / 2 * (soft ? .58 : 1)), g = L.createLinearGradient(M[0], M[1], M[0] + n[0] * span, M[1] + n[1] * span);
    if (soft) STK_SOFT.forEach(([p, c]) => g.addColorStop(p, c));
    else { g.addColorStop(0, 'rgba(110,80,90,.35)'); g.addColorStop(.18, 'rgba(255,255,255,.25)'); g.addColorStop(.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(150,120,130,.15)'); }
    L.fillStyle = g; L.fillRect(0, 0, S.W, S.H); L.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.shadowColor = 'rgba(80,50,60,.28)'; ctx.shadowBlur = 10 + Math.min(14, len / 12); ctx.shadowOffsetX = n[0] * 4; ctx.shadowOffsetY = 4 + n[1] * 3;
    ctx.drawImage(S.fl, 0, 0, S.W, S.H); ctx.restore();
}
function stkSnap(sn, t) {
    const q = Math.min(1, (t - sn.t0) / 260), e = 1 - Math.pow(1 - q, 3);
    if (q >= 1) sn.end = true;
    return [sn.F[0] + (sn.C[0] - sn.F[0]) * e, sn.F[1] + (sn.C[1] - sn.F[1]) * e];
}

/* ---------- 📄 붙이기 (S-1) ---------- */
function stkStick(o) {
    const pg = spPage(); if (!pg) return null;
    const P = pageK(pg); let cx = o.cx, cy = o.cy;
    if (o.clamp) [cx, cy] = pageIn(P.r, cx, cy);
    if (!addImage(o.src)) return null;
    const el = pg.querySelector('.element-box:last-child');
    if (el) {
        if (o.mark) o.mark(el);
        elPlace(el, P, cx, cy, o.w / P.k, o.h / P.k, o.deg || 0);
        if (o.orig && window.elOrig) elOrig(el);                                // 🖼️ 원본 크기로 (가운데는 그대로)
        if (o.after) o.after(el, pg);
    }
    spSave(false);
    if (el && o.own) o.own(el);
    return el;
}

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['sticker'] = true;
