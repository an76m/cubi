/* 말랑달콤 다이어리 - js/book.js
   📚 책 엔진 (도련 11-15 · 10년 쓸 기초) : 모든 책이 같이 쓰는 것 = 여기 하나 · 책 종류는 '다른 점'만 알려 줘요
   - 지금 쓰는 책 : 📒 스티커바인더 · 🤍 이형지북 (js/basket.js abFlt) · 다음 단계 = 📕 페이지노트 · 🗂️ 페이지바인더 → 📔 날짜형노트 · 🗂️ 날짜형바인더 (그때 js/page.js 넘기기를 이리로)
   - 엔진이 하는 일
       표지 = 덮인 책으로 시작 · 밀어서(또는 ›) 열기 · 첫 쪽에서 앞으로 밀면(또는 ‹) 덮기
       넘기기 = 드래그(종이가 손가락을 따라 넘어가요 · 35% 넘게 끌면 넘어가요) · ‹ › 버튼 · 두 쪽이면 2쪽씩 · 한 쪽이면 1쪽씩
       보기 = 펼친 두 쪽 / 한 쪽 (◧ ◨ 스위치 · 둘 다 끌 수 없어요 bookSide · 📱 폰 = 한 쪽 · 스위치 없음)
       상단바 = ◧ ‹ [가운데 글] › ◨ ✕ (다이어리 날짜바처럼) · 막대를 끌면 책이 옮겨져요 · 쪽 수가 바뀌어도 막대 가운데 기준 그대로 (자리 = 이 기기)
       크기 = 화면 안에 한 쪽(A5 비율) · 펼친 두 쪽이 다 들어오게
   - 책 종류가 알려 줄 것 (bookOpen(host, spec))
       spec = { id, cls (모양 이름 · css) , pages (쪽 수), pg (처음 쪽), open (처음부터 펼침),
                page(p) → 한 쪽 html · blank() → 빈 쪽 html · cover() → 앞표지 html · spine(two) → 가운데 묶음 html · colors [겉, 테두리],
                side() · setSide(v) (l · r · lr) · title() (덮였을 때 가운데 글) · wire(stage) (쪽 안 손길) · onPage(pg, open) · onClose() · posKey }
   ※ util.js 다음 · 책을 쓰는 파일(basket.js)보다 먼저 읽어요 */
/* 📍 쪽 자리 (도련 11-15 · 2-1 : 가짜 날짜 없애기) : 날짜가 아닌 쪽 = BookSpot(n) · 0 = 📕 표지 · 1~ = 페이지형 다이어리 장 (예전 = '2000년 1월 n일' 가짜 날짜 · 1999-12-31 = 표지)
   지금 보는 곳(currentDate · js/app.js) = 날짜(📔 날짜형의 날) 또는 BookSpot · 바꾸기 = curSet · 저장할 때 = spotSave / spotLoad (글자 'p3') */
class BookSpot { constructor(n) { this.n = Math.max(0, Math.round(+n || 0)); } }
const bookSpot = n => new BookSpot(n);
const isSpot = v => v instanceof BookSpot;
const spotCopy = v => isSpot(v) ? new BookSpot(v.n) : new Date(+v);
const spotSave = v => isSpot(v) ? 'p' + v.n : +v;
const spotLoad = v => typeof v === 'string' && /^p\d+$/.test(v) ? new BookSpot(+v.slice(1)) : new Date(+v);
const spotSame = (a, b) => isSpot(a) ? isSpot(b) && a.n === b.n : !isSpot(b) && +a === +b;
const BOOK_R = 148 / 210;                                                    // 한 쪽 비율 (A5)
function bookSide(cur, s) {                                                  // ◧ ◨ 스위치 하나 켜기 · 끄기 (남은 하나는 못 꺼요) → 새 값
    const on = { l: cur.includes('l'), r: cur.includes('r') };
    on[s] = !on[s]; if (!on.l && !on.r) return cur;
    return (on.l ? 'l' : '') + (on.r ? 'r' : '');
}
const BOOK_DRAG = 8, BOOK_DONE = .35, BOOK_MS = 420;                         // 몇 px 부터 끌기 · 얼마나 끌면 넘어가요 · 넘어가는 시간
/* 📖 넘어가는 그림 하나 = 종이 말림 (도련 11-15 · 2-4 · 📔 다이어리 js/page.js updateCurl · 📒 🤍 책 엔진이 같은 계산) : 넘기는 쪽 한 장(폭 W) 기준 자리
   d = 넘긴 만큼 (0 ~ W) · dir 1 = 다음 (오른쪽 끝에서 왼쪽으로) · -1 = 앞 (왼쪽 끝에서 오른쪽으로) · edge = 앞으로 넘길 때 잡는 왼쪽 끝 (다이어리 펼침면 = -W)
   → clip = 지금 쪽에서 가리는 곳 · fx · fw = 넘어가는 종이 뒷면 · sx · sw = 아래 쪽 그림자 (모두 그 쪽 왼쪽 위 기준 px) */
function bookCurlAt(W, d, dir, edge) {
    d = Math.max(0, Math.min(W, d)); const sw = Math.min(90, d);
    if (dir === 1) { const fold = W - d; return { d, show: d >= 1, clip: `inset(0 ${d}px 0 0)`, fx: fold - d, fw: d, sx: fold - 4, sw }; }
    const fold = (edge || 0) + d; return { d, show: d >= 1, clip: `inset(0 0 0 ${d}px)`, fx: fold, fw: d, sx: fold - sw - 4, sw };
}
/* ✋ 넘기기 손길 하나 (도련 11-15 · 2-2 · 📔 📓 다이어리 · 📒 🤍 책 엔진이 같이 써요) : 드래그를 넘기기로 볼지 · 얼마나 끌면 넘어가는지 · 넘어가는 움직임
   책마다 다른 건 '넘어가는 그림'(ctx)뿐 : 다이어리 = 종이 말림 (js/page.js beginCurl · updateCurl · endCurl) · 책 엔진 = 앞뒷면 종이 (flip)
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
        turn(dir) { if (T.drag || T.anim) return false; const ctx = o.start(dir); if (!ctx) return false; animate(ctx, ctx.w, true); return true; },
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
    const arrow = d => `<button type="button" class="page-arrow bk-arr" aria-label="${d < 0 ? '앞 쪽' : '다음 쪽'}" data-d="${d}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;
    const pageHtml = p => p >= 0 && p < spec.pages ? spec.page(p) : spec.blank();
    function norm() { B.pg = Math.max(0, Math.min(spec.pages - 1, B.pg)); if (two()) B.pg -= B.pg % 2; }
    function barText() {
        if (!B.open) return spec.title();
        const t = two(), n = spec.pages;
        return `${B.pg + 1}${t && B.pg + 1 < n ? '–' + (B.pg + 2) : ''} <small>/ ${n}쪽</small>`;
    }
    const canNext = () => !B.open || B.pg + (two() ? 2 : 1) < spec.pages;
    const canPrev = () => B.open;                                            // 첫 쪽에서 앞으로 = 덮기
    /* 🖼 그리기 */
    function render() {
        norm();
        const t = two(), c = spec.colors, side = ph() ? '' : sideBtn('l'), side2 = ph() ? '' : sideBtn('r');
        if (!B.root) {
            B.root = document.createElement('div'); B.root.className = 'bk ' + (spec.cls || '');
            host.appendChild(B.root); wire();
        }
        B.root.style.setProperty('--c1', c[0]); B.root.style.setProperty('--c2', c[1]);
        B.root.classList.toggle('shut', !B.open);
        const book = !B.open
            ? `<div class="bk-book shut"><div class="bk-slot bk-cv" data-slot="cv">${spec.cover()}</div></div>`
            : `<div class="bk-book ${t ? 'two' : 'one ' + (B.pg % 2 ? 'odd' : 'even')}"><div class="bk-spread">${t ? `<div class="bk-slot" data-slot="l">${pageHtml(B.pg)}</div><div class="bk-slot" data-slot="r">${pageHtml(B.pg + 1)}</div>` : `<div class="bk-slot" data-slot="o">${pageHtml(B.pg)}</div>`}</div><div class="bk-spine" aria-hidden="true">${spec.spine(t)}</div></div>`;
        B.root.innerHTML = `<div class="bk-bar" title="끌어서 옮기기">${side}${arrow(-1)}<span class="bk-cnt">${barText()}</span>${arrow(1)}${side2}<button type="button" class="bk-x" aria-label="닫기">✕</button></div><div class="bk-stage" id="bkStage">${book}</div>`;
        const [pv, nx] = B.root.querySelectorAll('.bk-arr'); pv.disabled = !canPrev(); nx.disabled = !canNext();
        fit();
        if (spec.wire) spec.wire(B.root.querySelector('.bk-stage'), B);
        if (spec.onPage) spec.onPage(B.pg, B.open);
    }
    /* 📐 크기 · 자리 (막대 가운데 기준) */
    function fit() {
        const W = innerWidth, H = innerHeight, t = two(), one = B.open && !t;
        const padW = t ? 28 + 44 : one ? 14 + 64 : 28, padH = 28 + 52 + 16 + (ph() ? 24 : 40);
        let h = Math.min(H - padH, (Math.min(W - 16, 1500) - padW) / ((t ? 2 : 1) * BOOK_R), 760);
        h = Math.max(220, Math.floor(h));
        B.root.style.setProperty('--ph', h + 'px'); B.root.style.setProperty('--pw', Math.floor(h * BOOK_R) + 'px');
        let p = null; try { p = JSON.parse(localStorage.getItem(spec.posKey) || 'null'); } catch (e) {}
        place(p && isFinite(p.cx) ? p.cx : W / 2, p && isFinite(p.y) ? p.y : Math.max(8, (H - B.root.offsetHeight) / 2));
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
            if ((e.pointerType === 'mouse' && e.button > 0) || B.busy || !e.target.closest('.bk-bar')) return;   // 막대 = 옮기기 (버튼 위에서 끌어도 · 살짝 누르면 버튼)
            B.mv.begin(e);
        });
        B.tr = bookTurner({                                                 // ✋ 넘기기 손길 = 공통 (bookTurner)
            el: R,
            grab: e => !B.busy && e.target.closest('.bk-stage') && !e.target.closest('.ab-it, input, textarea') ? 0 : false,   // 쪽 안에서 끄는 것(이형지 스티커)은 그대로 · 종이 위에서 밀어도 넘겨요 (넘긴 뒤 톡은 안 가요)
            start: dir => (dir > 0 ? canNext() : canPrev()) ? start(dir) : null
        });
    }
    /* 📖 넘기기 = 종이 말림 (다이어리와 같은 그림 · bookCurlAt) : 넘기는 쪽 = 지금 모습(cur)이 넘긴 만큼 가려지고 · 그 아래(under) = 넘긴 뒤 모습 · 뒷면(flap)이 말려 넘어가요 */
    function slotRect(k) { const s = B.root.querySelector(`.bk-slot[data-slot="${k}"]`), st = B.root.querySelector('.bk-stage'); if (!s || !st) return null; const a = s.getBoundingClientRect(), b = st.getBoundingClientRect(); return { s, x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
    function start(dir) {
        if (B.busy) return null;
        const t = two(), stage = B.root.querySelector('.bk-stage');
        let k, cur, under, cdir = dir, cover = false, back = false, after;
        if (!B.open) {                                                       // 📕 표지 열기 (표지가 말려 넘어가요)
            if (dir < 0) return null;
            k = 'cv'; cur = spec.cover(); under = pageHtml(0); cover = true; after = () => { B.open = true; B.pg = 0; };
        } else if (dir < 0 && B.pg === 0) {                                  // 📕 첫 쪽에서 앞으로 = 덮기 (여는 것을 그대로 되감아요)
            B.open = false; render();
            k = 'cv'; cur = spec.cover(); under = pageHtml(0); cover = true; back = true; cdir = 1; after = () => { B.open = false; };
        } else if (t && dir > 0) { k = 'r'; cur = pageHtml(B.pg + 1); under = pageHtml(B.pg + 3); after = () => { B.pg += 2; }; }
        else if (t && dir < 0) { k = 'l'; cur = pageHtml(B.pg); under = pageHtml(B.pg - 2); after = () => { B.pg -= 2; }; }
        else if (dir > 0) { k = 'o'; cur = pageHtml(B.pg); under = pageHtml(B.pg + 1); after = () => { B.pg += 1; }; }
        else { k = 'o'; cur = pageHtml(B.pg); under = pageHtml(B.pg - 1); after = () => { B.pg -= 1; }; }
        const r = slotRect(k); if (!r) return null;
        r.s.innerHTML = `<div class="bk-under">${under}</div><div class="bk-cur">${cur}</div>`;
        const cu = r.s.querySelector('.bk-cur'), gap = t && !cover ? 44 : 0;
        const fl = document.createElement('div'); fl.className = `bk-flap ${cdir > 0 ? 'dir-next' : 'dir-prev'}${cover ? ' cover' : ''}`; fl.style.top = r.y + 'px'; fl.style.height = r.h + 'px';
        const sh = document.createElement('i'); sh.className = `bk-ush ${cdir > 0 ? 'dir-next' : 'dir-prev'}`; sh.style.top = r.y + 'px'; sh.style.height = r.h + 'px';
        stage.appendChild(fl); stage.appendChild(sh);
        const W = Math.max(80, r.w);
        const draw = d => { const g = bookCurlAt(W, d, cdir, 0), x = cdir > 0 ? g.fx - gap * d / W : g.fx;   // 펼친 두 쪽 사이 링 자리만큼 더 가요
            cu.style.clipPath = g.clip; fl.style.display = sh.style.display = g.show ? 'block' : 'none';
            fl.style.left = (r.x + x) + 'px'; fl.style.width = g.fw + 'px'; sh.style.left = (r.x + g.sx) + 'px'; sh.style.width = g.sw + 'px'; };
        const ctx = { w: W, d: 0, after,
            set(px) { this.d = px; draw(back ? W - px : px); },                 // 덮기 = 다 넘긴 데서 되감아요
            done(ok) { B.busy = null; if (ok) after(); else if (back && !B.open) B.open = true; render(); } };   // 덮기를 그만뒀어요 = 펼친 채로
        B.busy = ctx; ctx.set(0);
        return ctx;
    }
    function turn(dir) { if (!B.busy && (dir > 0 ? canNext() : canPrev())) B.tr.turn(dir); }
    const onResize = () => { if (B.alive && B.root && !B.busy) render(); };
    addEventListener('resize', onResize);
    render();
    return {
        get id() { return spec.id; }, get pg() { return B.pg; }, get open() { return B.open; }, get busy() { return !!(B.busy || (B.tr && B.tr.busy())); },
        root: () => B.root,
        refresh(s2) { if (s2) Object.assign(spec, s2); if (!B.busy && !(B.tr && B.tr.busy())) render(); },   // 쪽 안 내용이 바뀌었어요 (자리 · 쪽 · 열림은 그대로)
        turn, destroy() { B.alive = false; removeEventListener('resize', onResize); if (B.root) B.root.remove(); B.root = null; }
    };
}
window.bookCurlAt = bookCurlAt; window.bookOpen = bookOpen; window.bookSide = bookSide; window.bookMover = bookMover; window.bookTurner = bookTurner; window.BookSpot = BookSpot; window.bookSpot = bookSpot; window.isSpot = isSpot; window.spotSave = spotSave; window.spotLoad = spotLoad;
