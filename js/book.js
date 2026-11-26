/* 말랑달콤 다이어리 - js/book.js
   📚 책 엔진 (도련 11-15 · 10년 쓸 기초) : 모든 책이 같이 쓰는 것 = 여기 하나 · 책 종류는 '다른 점'만 알려 줘요
   - 누가 무엇을 써요 (도련 11-16 · 1233 ~ 1238 다 끝)
       📒 스티커바인더 · 🤍 이형지북 (js/basket.js abFlt) = bookOpen 통째로 (표지 · 넘기기 · 막대 · 보기 · 크기)
       📔 날짜형노트 · 🗂️ 날짜형바인더 · 📓 페이지노트 · 🗂️ 페이지바인더 (js/page.js · js/skins.js) = 쪽 그리기 · 저장은 다이어리 것 + 아래 공통 부품
       📒 🤍 스티커 정리 (js/basket.js abSpaceBook · 1408 · 도련 11-22 '스티커 정리 이형지북도 띄운 책처럼 · 공통은 통일') = bookOpen 통째로 · inline · 펼친 채 (stay)
       🧩 바인더 조립 작업대 (js/binderroom.js · 1374 · 도련 11-21 '다이어리처럼 현실적으로') = bookOpen 통째로 · inline (작업대 안) · 덮인 표지 → 펼치고 → 내지를 끼우면 쪽이 생겨요 → 넘겨 봐요
       공통 부품 = BookSpot (쪽 자리) · bookSide (◧◨) · bookCurlAt (넘어가는 그림) · bookTurner (넘기기 손길) · bookMover (막대 끌기)
   - 엔진이 하는 일
       표지 = 덮인 책으로 시작 · 밀어서(또는 ›) 열기 · 첫 쪽에서 앞으로 밀면(또는 ‹) 덮기
       넘기기 = 드래그(종이가 손가락을 따라 넘어가요 · 35% 넘게 끌면 넘어가요) · ‹ › 버튼 · 두 쪽이면 2쪽씩 · 한 쪽이면 1쪽씩
       보기 = 펼친 두 쪽 / 한 쪽 (◧ ◨ 스위치 · 둘 다 끌 수 없어요 bookSide · 📱 폰 = 한 쪽 · 스위치 없음)
       상단바 = ◧ ‹ [가운데 글] › ◨ ✕ (다이어리 날짜바처럼) · 막대를 끌면 책이 옮겨져요 · 쪽 수가 바뀌어도 막대 가운데 기준 그대로 (자리 = 이 기기)
       크기 = 화면 안에 한 쪽(A5 비율) · 펼친 두 쪽이 다 들어오게
   - 책 종류가 알려 줄 것 (bookOpen(host, spec))
       spec = { id, cls (모양 이름 · css) , pages (쪽 수), pg (처음 쪽), open (처음부터 펼침),
                page(p) → 한 쪽 html · blank() → 빈 쪽 html · cover() → 앞표지 html · spine(two) → 가운데 묶음 html · cvSpine ('ring' · 'spring' = 덮인 표지 왼쪽 구멍에 감긴 고리 · 펼친 묶음과 같은 자리) · colors [겉, 테두리] · face (표지 css 그림 · 없으면 'none'),
                onClose 없으면 ✕ 없음 (🧩 바인더 조립 · 📒 스티커 정리) · stay (첫 쪽에서 덮지 않아요 · 📒 🤍 스티커 정리) · ph() (쪽 높이를 쓰는 곳이 정해요) · desk (📒 🤍 책상에서 띄운 책 = 📔 다이어리처럼 덮인 동안 막대 없음 · 도련 11-22) · inline (자리 host 안에 · 옮기기 없음) · hold (잡아 끄는 것 = 쪽을 안 넘겨요 · 📒 정리 공간 포켓의 종이 · 1425) · real (늘 실제 규격 크기 · 넘치면 자리 안에서 밀어 봐요) · side() · setSide(v) (l · r · lr) · title() (덮였을 때 가운데 글) · wire(stage) (쪽 안 손길) · onPage(pg, open) · onClose() · posKey ·
                mm [가로, 세로] (📏 한 쪽 종이 규격 · 실제 크기로 떠요 · css --mmk = 화면 1mm) }
   ※ util.js 다음 · 책을 쓰는 파일(basket.js)보다 먼저 읽어요 */
/* 📍 쪽 자리 (도련 11-15 · 2-1 : 가짜 날짜 없애기) : 날짜가 아닌 쪽 = BookSpot(n) · 0 = 📕 표지 · 1~ = 페이지형 다이어리 장 (예전 = '2000년 1월 n일' 가짜 날짜 · 1999-12-31 = 표지)
   지금 보는 곳(currentDate · js/app.js) = 날짜(📔 날짜형의 날) 또는 BookSpot · 바꾸기 = curSet · 저장할 때 = spotSave / spotLoad (글자 'p3') */
class BookSpot { constructor(n) { this.n = Math.max(0, Math.round(+n || 0)); } }
const bookSpot = n => new BookSpot(n);
const isSpot = v => v instanceof BookSpot;
const spotCopy = v => isSpot(v) ? new BookSpot(v.n) : new Date(+v);
const spotSave = v => isSpot(v) ? 'p' + v.n : +v;
const spotLoad = v => typeof v === 'string' && /^p\d+$/.test(v) ? new BookSpot(+v.slice(1)) : new Date(+v);
function bookSide(cur, s) {                                                  // ◧ ◨ 스위치 하나 켜기 · 끄기 (남은 하나는 못 꺼요) → 새 값
    const on = { l: cur.includes('l'), r: cur.includes('r') };
    on[s] = !on[s]; if (!on.l && !on.r) return cur;
    return (on.l ? 'l' : '') + (on.r ? 'r' : '');
}
const BOOK_RING = '<svg viewBox="0 0 120 34" aria-hidden="true"><circle cx="11" cy="27" r="5.5" fill="#5d4a66"/><circle cx="109" cy="27" r="5.5" fill="#5d4a66"/><path d="M11 30C25 10 95 10 109 30" fill="none" stroke="#a597c9" stroke-width="4.2" stroke-linecap="round"/><path d="M11 25C25 5 95 5 109 25" fill="none" stroke="#b9abd8" stroke-width="4.2" stroke-linecap="round"/></svg>';   // 🔗 바인더 링 하나 = 구멍 두 개 + 두 줄 와이어 (덮인 표지 고리와 같은 색 · 굵기 · 도련 11-26) (📒 스티커바인더 · 🧩 바인더 조립 · 가운데 묶음 spine 에)
const BOOK_DRAG = 8, BOOK_DONE = .35, BOOK_COVER_K = 1.5;   // BOOK_COVER_K = 펼침면 표지는 책도 같이 움직여서 손길을 더 길게 (📔 다이어리 · 📒 🧩 책 엔진 같이)                                       // 몇 px 부터 끌기 · 얼마나 끌면 넘어가요 (넘어가는 시간 = bookTurner 120 + 480 × 거리)
/* 📖 넘어가는 그림 하나 = 종이 말림 (도련 11-15 · 2-4 · 📔 다이어리 js/page.js updateCurl · 📒 🤍 책 엔진이 같은 계산) : 넘기는 쪽 한 장(폭 W) 기준 자리
   d = 넘긴 만큼 (0 ~ W) · dir 1 = 다음 (오른쪽 끝에서 왼쪽으로) · -1 = 앞 (왼쪽 끝에서 오른쪽으로) · edge = 앞으로 넘길 때 잡는 왼쪽 끝 (다이어리 펼침면 = -W)
   → clip = 지금 쪽에서 가리는 곳 · fx · fw = 넘어가는 종이 뒷면 · sx · sw = 아래 쪽 그림자 (모두 그 쪽 왼쪽 위 기준 px) */
function bookCurlAt(W, d, dir, edge) {
    d = Math.max(0, Math.min(W, d)); const sw = Math.min(90, d);
    if (dir === 1) { const fold = W - d; return { d, show: d >= 1, clip: `inset(0 ${d}px 0 0)`, fx: fold - d, fw: d, sx: fold - 4, sw }; }
    const fold = (edge || 0) + d; return { d, show: d >= 1, clip: `inset(0 0 0 ${d}px)`, fx: fold, fw: d, sx: fold - sw - 4, sw };
}
/* ✋ 넘기기 손길 하나 (도련 11-15 · 2-2 · 📔 📓 다이어리 · 📒 🤍 책 엔진이 같이 써요) : 드래그를 넘기기로 볼지 · 얼마나 끌면 넘어가는지 · 넘어가는 움직임
   책마다 다른 건 '넘어가는 그림을 어디에 그리는지'(ctx)뿐 : 다이어리 = js/page.js beginCurl · updateCurl · endCurl · 책 엔진 = 아래 start · 그림 계산은 둘 다 bookCurlAt
   o = { el (누르는 곳), grab(e) → false = 안 넘겨요 · 0 = 어느 쪽이든 · 1 = 다음만 · -1 = 앞만 (끝을 잡았어요),
         start(dir, e) → ctx | null,  ctx = { w (끝까지 px), k (손가락 대비 · 기본 1), set(px), done(ok), out(e) → true = 다 넘겼어요 } }
   돌려줘요 = { turn(dir) 버튼 · animate(ctx, toPx, ok, rev, after) · busy() } */
function bookTurner(o) {
    const T = { drag: null, anim: null };
    o.el.addEventListener('pointerdown', e => {
        if (T.drag || T.anim || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const g = o.grab(e); if (g === false) return;
        T.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false, edge: g };
    });
    addEventListener('pointermove', e => {
        const d = T.drag; if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.on) {
            if (Math.abs(dx) < BOOK_DRAG || Math.abs(dx) < Math.abs(dy)) return;
            const dir = dx < 0 ? 1 : -1;
            if (d.edge && dir !== d.edge) { T.drag = null; return; }             // 오른쪽 끝은 다음만 · 왼쪽 끝은 앞만
            const ctx = o.start(dir, e); if (!ctx) { T.drag = null; return; }
            d.on = true; d.dir = dir; d.ctx = ctx;
            try { o.el.setPointerCapture(e.pointerId); } catch (er) {}
        }
        const c = d.ctx, moved = ((d.dir === 1 ? d.x - e.clientX : e.clientX - d.x) - BOOK_DRAG) / (c.k || 1);
        c.set(Math.max(0, Math.min(c.w, moved)));
        if ((c.out && c.out(e, d.dir)) || moved >= c.w) { T.drag = null; animate(c, c.w, true); }   // 끝까지 = 넘어가요
    });
    const end = e => {
        const d = T.drag; if (!d || d.id !== e.pointerId) return;
        T.drag = null; if (!d.on) return;
        T.noClick = performance.now();
        const ok = e.type === 'pointerup' && d.ctx.d > d.ctx.w * BOOK_DONE;
        animate(d.ctx, ok ? d.ctx.w : 0, ok);
    };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    function animate(ctx, to, ok, rev, after) {                             // 넘어가는 움직임 (멀수록 길게 · rev = 천천히 시작해 빨라져요 · 되감기)
        const from = ctx.d || 0, dist = Math.abs(to - from), t0 = performance.now();
        const ms = window.calmMotion && calmMotion() ? 120 : (120 + 480 * dist / Math.max(1, ctx.w));
        T.anim = ctx;
        const step = now => {
            if (T.anim !== ctx) return;
            const p = Math.min(1, (now - t0) / ms), k = rev ? Math.pow(p, 3) : 1 - Math.pow(1 - p, 3);
            ctx.set(from + (to - from) * k);
            if (p < 1) { requestAnimationFrame(step); return; }
            T.anim = null; ctx.done(ok); if (after) after();
        };
        requestAnimationFrame(step);
    }
    return {
        turn(dir) { if (T.drag || T.anim) return false; const ctx = o.start(dir); if (!ctx) return false; animate(ctx, ctx.w, true, ctx.rev); return true; },   // ctx.rev = 되감기 (📕 덮기)
        animate, busy: () => !!(T.anim || (T.drag && T.drag.on)), noClick: () => T.noClick && performance.now() - T.noClick < 400,
        stop() { T.drag = null; T.anim = null; }
    };
}
/* ✋ 막대를 끌어 책 옮기기 하나 (도련 11-15 · 2-3 · 📔 다이어리 날짜바 · 📒 🤍 책 엔진 막대가 같이 써요)
   BOOK_MOVE px 넘게 끌어야 옮겨져요 (살짝 누르면 막대의 버튼 그대로) · 옮긴 뒤의 톡은 버튼으로 안 가요 (noClick)
   o = { el (손가락을 잡아 둘 곳), from() → { x, y } (지금 자리), to(x, y) (옮기기), on() (옮기기 시작) · off(moved) (끝) } → { begin(e) (이 손가락으로 시작) · busy() · noClick() } */
const BOOK_MOVE = 8;
function bookMover(o) {
    const M = { d: null, at: 0 };
    addEventListener('pointermove', e => {
        const d = M.d; if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        if (!d.on) {
            if (Math.hypot(dx, dy) < BOOK_MOVE || (o.wait && o.wait())) return;
            d.on = true; try { o.el.setPointerCapture(e.pointerId); } catch (er) {}
            if (o.on) o.on();
        }
        o.to(d.ox + dx, d.oy + dy);
    });
    const end = e => { const d = M.d; if (!d || d.id !== e.pointerId) return; M.d = null; if (!d.on) return; M.at = performance.now(); if (o.off) o.off(true); };
    addEventListener('pointerup', end); addEventListener('pointercancel', end);
    return {
        begin(e) { if (M.d) return false; const p = o.from(); M.d = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: p.x, oy: p.y, on: false }; return true; },
        busy: () => !!(M.d && M.d.on), noClick: () => performance.now() - M.at < 400
    };
}
function bookOpen(host, spec) {
    const ph = () => !!(window.UI && UI.phone());
    const B = { spec, open: !!spec.open, pg: Math.max(0, spec.pg || 0), busy: null, root: null, alive: true };
    const two = () => !ph() && B.open && spec.side() === 'lr';
    const sideBtn = s => `<button type="button" class="page-side bk-side${spec.side().includes(s) ? ' on' : ''}" aria-pressed="${spec.side().includes(s)}" aria-label="${s === 'l' ? '왼쪽 페이지' : '오른쪽 페이지'}" data-side="${s}">${window.dvSideSvg ? dvSideSvg(s) : s}</button>`;
    const arrow = d => `<button type="button" class="page-arrow bk-arr" aria-label="${d < 0 ? '앞 페이지' : '다음 페이지'}" data-d="${d}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
    const pageHtml = p => p >= 0 && p < spec.pages ? spec.page(p) : spec.blank();
    function norm() { B.pg = Math.max(0, Math.min(spec.pages - 1, B.pg)); if (two()) B.pg -= B.pg % 2; }
    function barText() {
        if (!B.open) return spec.title();
        const t = two(), n = spec.pages;
        return `${B.pg + 1}${t && B.pg + 1 < n ? '–' + (B.pg + 2) : ''} <small>/ ${n}페이지</small>`;
    }
    const canNext = () => !B.open || B.pg + (two() ? 2 : 1) < spec.pages;
    const canPrev = () => B.open && !(spec.stay && B.pg === 0);               // 첫 쪽에서 앞으로 = 덮기 · stay = 덮지 않아요 (📒 🤍 스티커 정리)
    /* 🖼 그리기 */
    function render() {
        norm();
        const t = two(), c = spec.colors, side = ph() ? '' : sideBtn('l'), side2 = ph() ? '' : sideBtn('r');
        if (!B.root) {
            B.root = document.createElement('div'); B.root.className = 'bk ' + (spec.cls || '') + (spec.inline ? ' inline' : '') + (spec.desk ? ' desk' : '');
            host.appendChild(B.root); wire();
        }
        B.root.style.setProperty('--c1', c[0]); B.root.style.setProperty('--c2', c[1]); B.root.style.setProperty('--abf', spec.face || 'none');   // 📁 앞표지 = 그 상품 표지.svg (도련 11-18)
        B.root.classList.toggle('shut', !B.open);
        const book = !B.open
            ? `<div class="bk-book shut"><div class="bk-slot">${spec.cover()}</div>${coverSpine()}</div>`   // 🌀 덮인 책 = 표지 왼쪽 구멍에 고리가 감겨 있어요 (실제 바인더 · 스프링 노트처럼 · 펼친 링 · 스프링과 같은 자리 · 도련 11-26)
            : `<div class="bk-book ${t ? 'two' : 'one ' + (B.pg % 2 ? 'odd' : 'even')}"><div class="bk-spread">${t ? `<div class="bk-slot" data-slot="l">${pageHtml(B.pg)}</div><div class="bk-slot" data-slot="r">${pageHtml(B.pg + 1)}</div>` : `<div class="bk-slot" data-slot="o">${pageHtml(B.pg)}</div>`}</div><div class="bk-spine" aria-hidden="true">${spec.spine(t)}</div></div>`;
        B.root.innerHTML = `<div class="bk-bar"${spec.inline ? '' : ' title="끌어서 옮기기"'}>${side}${arrow(-1)}<span class="bk-cnt">${barText()}</span>${arrow(1)}${side2}${spec.onClose ? '<button type="button" class="bk-x" aria-label="닫기">✕</button>' : ''}</div><div class="bk-stage" id="bkStage">${book}</div>`;
        const [pv, nx] = B.root.querySelectorAll('.bk-arr'); pv.disabled = !canPrev(); nx.disabled = !canNext();
        fit();
        if (spec.wire) spec.wire(B.root.querySelector('.bk-stage'), B);
        if (spec.onPage) spec.onPage(B.pg, B.open);
    }
    /* 📐 크기 · 자리 (막대 가운데 기준) */
    function fit() {
        const W = spec.inline ? host.clientWidth : innerWidth, H = spec.inline ? host.clientHeight : innerHeight, t = !ph() && spec.side() === 'lr', one = !t;   // 🧩 inline = 자리(host) 안에 · 쪽 크기 = 덮었을 때도 펼친 모습 기준 (표지를 넘길 때 크기가 안 바뀌어요 · 📔 다이어리처럼)
        const padW = t ? 28 + 44 : one ? 14 + 64 : 28, padH = 28 + 52 + 16 + (ph() ? 24 : 40);
        const mm = spec.mm, R = mm[0] / mm[1];                                // 📏 한 쪽 = spec.mm [가로, 세로] 규격 · 실제 크기 (화면이 작으면 줄여요 · 도련 11-16)
        let h = Math.min(H - padH, (Math.min(W - 16, 1500) - padW) / ((t ? 2 : 1) * R), mm[1] * MM_PX);
        h = Math.max(spec.inline ? 140 : 220, Math.floor(h));                  // 🧩 작업대 안 = 더 작아도 돼요 (📱 폰)
        if (spec.ph) h = Math.round(spec.ph());                                // 📐 ph = 쓰는 곳이 정한 쪽 높이 (📒 🤍 스티커 정리 · 바구니 옆 남은 자리 · basket.js abSpaceFit)
        if (spec.real) h = Math.round(mm[1] * MM_PX);                         // 📏 real = 늘 실제 규격 크기 (화면보다 크면 자리 안에서 밀어 봐요 · 🧩 바인더 조립 · 도련 11-21)
        B.root.style.setProperty('--ph', h + 'px'); B.root.style.setProperty('--pw', Math.floor(h * R) + 'px'); B.root.style.setProperty('--mmk', (h / mm[1]).toFixed(4));   // --mmk = 화면에서 1mm (px 숫자)
        if (spec.inline) return;                                              // 자리 안 = 옮기지 않아요 (가운데 · css .bk.inline)
        let p = lsGet(spec.posKey, null);
        const k = spec.nudge || 0;                                          // nudge = 처음 자리를 그만큼 비켜요 (📒 🤍 책상에 여러 권 띄우면 겹치지 않게)
        place(p && isFinite(p.cx) ? p.cx : W / 2 + k, p && isFinite(p.y) ? p.y : Math.max(8, (H - B.root.offsetHeight) / 2) + k);
    }
    function place(cx, y) {                                                  // cx = 막대 가운데 · 막대가 늘 화면 안에 (책은 반쯤 넘어가도 돼요 · 📱 폰 = 늘 화면 안)
        const W = innerWidth, H = innerHeight, w = B.root.offsetWidth;
        cx = ph() ? W / 2 : Math.max(80, Math.min(W - 80, cx)); y = Math.max(0, Math.min(H - 54, y));
        B.root.style.left = Math.round(cx - w / 2) + 'px'; B.root.style.top = Math.round(y) + 'px'; B.cx = cx; B.y = y;
    }
    /* ✋ 손길 : 막대 끌기 · 버튼 · 쪽 넘기기 드래그 */
    function wire() {
        const R = B.root;
        R.addEventListener('click', e => {
            if ((B.tr && B.tr.noClick()) || (B.mv && B.mv.noClick())) { e.stopPropagation(); e.preventDefault(); return; }   // 넘기거나 옮긴 뒤의 톡은 안 가요
            const b = e.target.closest('button'); if (!b || !R.contains(b)) return;
            if (b.classList.contains('bk-x')) { spec.onClose(); return; }
            if (b.dataset.side) { spec.setSide(bookSide(spec.side(), b.dataset.side)); render(); return; }
            if (b.dataset.d) turn(+b.dataset.d);
        }, true);
        B.mv = bookMover({                                                  // ✋ 막대 끌기 = 공통 (bookMover · 다이어리 날짜바와 같아요)
            el: R, from: () => ({ x: B.cx, y: B.y }), to: (x, y) => place(x, y), on: () => R.classList.add('mv'),
            off: () => { R.classList.remove('mv'); try { localStorage.setItem(spec.posKey, JSON.stringify({ cx: Math.round(B.cx), y: Math.round(B.y) })); } catch (er) {} }
        });
        R.addEventListener('pointerdown', e => {
            if (spec.inline || (e.pointerType === 'mouse' && e.button > 0) || B.busy || !e.target.closest('.bk-bar')) return;   // 막대 = 옮기기 (버튼 위에서 끌어도 · 살짝 누르면 버튼)
            B.mv.begin(e);
        });
        B.tr = bookTurner({                                                 // ✋ 넘기기 손길 = 공통 (bookTurner)
            el: R,
            grab: e => !B.busy && e.target.closest('.bk-stage') && !e.target.closest('.ab-it, input, textarea' + (spec.desk ? ', .bk-sh' : '') + (spec.hold ? ', ' + spec.hold : '')) ? 0 : false,   /* 🪑 책상에 띄운 바인더 = 종이는 끌어내요 (넘기기는 종이 밖에서) · spec.hold = 그 밖에 잡아 끄는 것 (📒 정리 공간 포켓에 꽂은 종이) */   // 쪽 안에서 끄는 것(이형지 스티커)은 그대로 · 종이 위에서 밀어도 넘겨요 (넘긴 뒤 톡은 안 가요)
            start: dir => (dir > 0 ? canNext() : canPrev()) ? start(dir) : null
        });
    }
    /* 📖 넘기기 = 종이 말림 (다이어리와 같은 그림 · bookCurlAt) : 넘기는 쪽 = 지금 모습(cur)이 넘긴 만큼 가려지고 · 그 아래(under) = 넘긴 뒤 모습 · 뒷면(flap)이 말려 넘어가요 */
    function slotRect(k) { const s = B.root.querySelector(`.bk-slot[data-slot="${k}"]`), st = B.root.querySelector('.bk-stage'); if (!s || !st) return null; const a = s.getBoundingClientRect(), b = st.getBoundingClientRect(); return { s, x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
    function start(dir) {
        if (B.busy) return null;
        const cover = !B.open || (dir < 0 && B.pg === 0), back = cover && B.open;   // 📕 표지 열기 · 덮기 = 📔 다이어리와 같은 방식 (page.js openCoverAnimated · closeCoverAnimated)
        if (cover && !B.open && dir < 0) return null;                          //   표지는 펼친 모습 위에서 넘어가요 (펼침면 = 표지가 오른쪽 쪽 자리에서 넘어가며 책이 가운데로 · 덮기 = 여는 것을 그대로 되감아요)
        if (cover) { B.open = true; B.pg = 0; render(); }
        const t = two(), stage = B.root.querySelector('.bk-stage');
        let k, cur, under, cdir = dir, after;
        if (cover) { k = t ? 'r' : 'o'; cur = spec.cover(); under = pageHtml(t ? 1 : 0); cdir = 1; after = () => { B.open = !back; B.pg = 0; }; }
        else if (t && dir > 0) { k = 'r'; cur = pageHtml(B.pg + 1); under = pageHtml(B.pg + 3); after = () => { B.pg += 2; }; }
        else if (t && dir < 0) { k = 'l'; cur = pageHtml(B.pg); under = pageHtml(B.pg - 2); after = () => { B.pg -= 2; }; }
        else if (dir > 0) { k = 'o'; cur = pageHtml(B.pg); under = pageHtml(B.pg + 1); after = () => { B.pg += 1; }; }
        else { k = 'o'; cur = pageHtml(B.pg); under = pageHtml(B.pg - 1); after = () => { B.pg -= 1; }; }
        const r = slotRect(k); if (!r) { if (cover) { B.open = back; render(); } return null; }
        if (cover) { r.x -= 22; r.y -= 16; r.w += 38; r.h += 32; cur = cur.replace(/<\/div>\s*$/, coverSpine() + '</div>'); }   // 📕 넘어가는 표지 = 덮인 표지 그대로 (쪽 + 둘레 · 고리 · 도련 11-26) · 📔 다이어리처럼 말리며 열려요
        r.s.innerHTML = `<div class="bk-under">${under}</div><div class="bk-cur">${cur}</div>`;
        const cu = r.s.querySelector('.bk-cur'), gap = t && cdir > 0 ? 44 : 0; if (cover) cu.classList.add('cv');
        const fl = document.createElement('div'); fl.className = `bk-flap ${cdir > 0 ? 'dir-next' : 'dir-prev'}${cover ? ' cover' : ''}`; fl.style.top = r.y + 'px'; fl.style.height = r.h + 'px';
        const sh = document.createElement('i'); sh.className = `bk-ush ${cdir > 0 ? 'dir-next' : 'dir-prev'}`; sh.style.top = r.y + 'px'; sh.style.height = r.h + 'px';
        stage.appendChild(fl); stage.appendChild(sh);
        const W = Math.max(80, r.w), bk = stage.querySelector('.bk-book'), bx = bk ? bk.getBoundingClientRect().left - stage.getBoundingClientRect().left : 0, hid = Math.max(0, r.x - bx);
        const draw = d => { const g = bookCurlAt(W, d, cdir, 0), x = cdir > 0 ? g.fx - gap * d / W : g.fx;   // 펼친 두 쪽 사이 링 자리만큼 더 가요
            cu.style.clipPath = g.clip; fl.style.display = sh.style.display = g.show ? 'block' : 'none';
            fl.style.left = (r.x + x) + 'px'; fl.style.width = g.fw + 'px'; sh.style.left = (r.x + g.sx) + 'px'; sh.style.width = g.sw + 'px';
            if (cover && t && bk) {                                            // 💻 펼침면 표지 = 넘긴 만큼 왼쪽 쪽이 드러나고 책이 가운데로 (📔 다이어리 updateCurl 과 같아요)
                bk.style.clipPath = `inset(0 0 0 ${Math.max(0, Math.min(hid, r.x + (g.show ? x : W)) - bx)}px)`;
                stage.style.translate = `${(-hid / 2 * (1 - d / W)).toFixed(1)}px 0`;
            } };
        const ctx = { w: W, d: 0, k: cover && t ? BOOK_COVER_K : 1, rev: back, after,   // 💻 표지는 책도 같이 움직여서 손길을 1.5배 (다이어리와 같아요) · 덮기 = 천천히 시작해 빨라져요
            set(px) { this.d = px; draw(back ? W - px : px); },                 // 덮기 = 다 넘긴 데서 되감아요
            done(ok) { B.busy = null; if (ok) after(); else if (cover) B.open = back; render(); } };   // 그만뒀어요 = 처음 모습 그대로
        B.busy = ctx; ctx.set(0);
        return ctx;
    }
    const coverSpine = () => spec.cvSpine ? `<div class="bk-spine bk-cvsp ${spec.cvSpine}">${spec.spine(false).replace(/<svg[\s\S]*?<\/svg>|<i><\/i>/g, '<b></b>')}</div>` : '';   // 🌀 덮인 표지 묶음 = 구멍 + 감긴 고리 (펼친 링 · 스프링과 같은 자리)
    function turn(dir) { if (!B.busy && (dir > 0 ? canNext() : canPrev())) B.tr.turn(dir); }
    function shut(after) {                                                    // 📕 덮기 (어느 쪽에서든 · 📔 다이어리 closeCoverAnimated 처럼 첫 쪽에서 표지가 되감겨 덮여요) → after()
        const fin = () => { if (after) after(); };
        if (!B.open) { fin(); return; }
        if (B.busy || (B.tr && B.tr.busy())) { setTimeout(() => shut(after), 120); return; }
        if (B.pg) { B.pg = 0; render(); }
        const ctx = start(-1); if (!ctx) { B.open = false; render(); fin(); return; }
        B.tr.animate(ctx, ctx.w, true, ctx.rev, fin);
    }
    const onResize = () => { if (B.alive && B.root && !B.busy) render(); };
    addEventListener('resize', onResize);
    render();
    return {
        get id() { return spec.id; }, get pg() { return B.pg; }, get open() { return B.open; }, get busy() { return !!(B.busy || (B.tr && B.tr.busy())); },
        root: () => B.root,
        refresh(s2) { if (s2) Object.assign(spec, s2); if (!B.busy && !(B.tr && B.tr.busy())) render(); },   // 쪽 안 내용이 바뀌었어요 (자리 · 쪽 · 열림은 그대로)
        turn, shut, destroy() { B.alive = false; removeEventListener('resize', onResize); if (B.root) B.root.remove(); B.root = null; }
    };
}
window.BOOK_RING = BOOK_RING; window.bookCurlAt = bookCurlAt; window.bookOpen = bookOpen; window.bookSide = bookSide; window.bookMover = bookMover; window.bookTurner = bookTurner; window.BookSpot = BookSpot; window.bookSpot = bookSpot; window.isSpot = isSpot; window.spotSave = spotSave; window.spotLoad = spotLoad;
/* 🏪 샵 펼쳐보기 (도련 11-25 '받아서 책상에서 펼쳐 볼 때 그 모습을 샵에서 · 현실처럼') : 받기 전에 그 책을 규격 크기로 펼쳐 넘겨 봐요
   - 책 = bookOpen 그대로 (덮인 표지 → 밀어서 펼치기 · 넘기기 · ◧ ◨ · 막대 끌기) · 크기 = 실제 규격 (화면이 작으면 줄여요 · 책상에 띄운 책과 같아요)
   - 저장 없음 · 닫으면 사라져요 · 닫기 = 책 막대 ✕ (다이어리 날짜바처럼) · 책 밖 바탕 누르기 · 바탕 = 🏪 사용해보기와 같은 .gdt
   - 쓰는 곳 = js/basket.js shZoom (📔 다이어리 · 노트 · 바인더 표지 · 내지 = js/dyyear.js dyyTrySpec · 📒 🤍 = basket.js abTrySpec) */
const BKT_SIDE = 'malang_bktry_side';
function bookTry(spec) {
    bookTryOff();
    const r = document.createElement('div'); r.id = 'bkTry'; r.className = 'gdt bk-try';
    document.body.appendChild(r);
    r.addEventListener('pointerdown', e => { if (e.target === r) bookTryOff(); });   // 책 밖 바탕을 누르면 닫혀요 (✕ = 책 막대에 하나)
    bookTry.B = bookOpen(r, Object.assign({ side: () => lsGet(BKT_SIDE, 'lr'), setSide: v => lsSet(BKT_SIDE, v) }, spec, { inline: false, posKey: 'malang_bktry_pos', pg: 0, open: !!spec.open, onClose: bookTryOff, onPage: null, wire: null, desk: false }));
    return true;
}
function bookTryOff() { if (bookTry.B) { bookTry.B.destroy(); bookTry.B = null; } const r = document.getElementById('bkTry'); if (r) r.remove(); }
window.bookTry = bookTry; window.bookTryOff = bookTryOff;
