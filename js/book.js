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
            if (B.noClick && performance.now() - B.noClick < 400) { e.stopPropagation(); e.preventDefault(); return; }   // 넘긴 뒤의 톡은 쪽 안으로 안 가요
            const b = e.target.closest('button'); if (!b || !R.contains(b)) return;
            if (b.classList.contains('bk-x')) { spec.onClose(); return; }
            if (b.dataset.side) { spec.setSide(bookSide(spec.side(), b.dataset.side)); render(); return; }
            if (b.dataset.d) turn(+b.dataset.d);
        }, true);
        R.addEventListener('pointerdown', e => {
            if (e.button > 0 || B.busy) return;
            const bar = e.target.closest('.bk-bar');
            if (bar) {                                                       // 막대 = 옮기기 (버튼은 그대로 눌려요)
                if (e.target.closest('button')) return;
                e.preventDefault();
                const x0 = e.clientX - B.cx, y0 = e.clientY - B.y, id = e.pointerId; let moved = false;
                try { bar.setPointerCapture(id); } catch (er) {}
                R.classList.add('mv');
                const mv = ev => { if (ev.pointerId === id) { place(ev.clientX - x0, ev.clientY - y0); moved = true; } };
                const up = ev => { if (ev.pointerId !== id) return; bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); R.classList.remove('mv');
                    if (moved) try { localStorage.setItem(spec.posKey, JSON.stringify({ cx: Math.round(B.cx), y: Math.round(B.y) })); } catch (er) {} };
                bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
                return;
            }
            if (!e.target.closest('.bk-stage') || e.target.closest('.ab-it, input, textarea')) return;   // 쪽 안에서 끄는 것(이형지 스티커)은 그대로 · 종이 위에서 밀어도 넘겨요 (넘긴 뒤 톡은 안 가요)
            B.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: false };
        });
        addEventListener('pointermove', e => {
            if (!B.alive) return;
            const d = B.drag; if (!d || d.id !== e.pointerId) return;
            const dx = e.clientX - d.x, dy = e.clientY - d.y;
            if (!d.on) {
                if (Math.abs(dx) < BOOK_DRAG || Math.abs(dx) < Math.abs(dy)) return;
                const dir = dx < 0 ? 1 : -1;
                if (!(dir > 0 ? canNext() : canPrev()) || !(d.ctx = start(dir))) { B.drag = null; return; }
                d.on = true; d.dir = dir;
            }
            d.ctx.set(Math.max(0, Math.min(1, (Math.abs(dx) - BOOK_DRAG) / d.ctx.w)));
        });
        const end = e => {
            if (!B.alive) return;
            const d = B.drag; if (!d || d.id !== e.pointerId) return;
            B.drag = null; if (!d.on) return;
            B.noClick = performance.now();
            const ok = e.type === 'pointerup' && d.ctx.p > BOOK_DONE;
            animate(d.ctx, ok ? 1 : 0, ok);
        };
        addEventListener('pointerup', end); addEventListener('pointercancel', end);
    }
    /* 📖 넘기기 : 넘어가는 종이(앞면 · 뒷면)를 쪽 위에 얹고 · 아래 쪽은 다음 모습으로 → 각도만 바꿔요 */
    function slotRect(k) { const s = B.root.querySelector(`.bk-slot[data-slot="${k}"]`), st = B.root.querySelector('.bk-stage'); if (!s || !st) return null; const a = s.getBoundingClientRect(), b = st.getBoundingClientRect(); return { s, x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
    function start(dir) {
        if (B.busy) return null;
        const t = two(), stage = B.root.querySelector('.bk-stage');
        let r, front, back, a0, a1, origin, under = null, after;
        if (!B.open) {                                                       // 📕 표지 열기
            if (dir < 0) return null;
            r = slotRect('cv'); front = spec.cover(); back = spec.blank(); a0 = 0; a1 = -180; origin = 'left'; under = pageHtml(0);
            after = () => { B.open = true; B.pg = 0; };
        } else if (dir < 0 && B.pg === 0) {                                  // 📕 첫 쪽에서 앞으로 = 덮기
            B.open = false; render();
            r = slotRect('cv'); front = spec.cover(); back = spec.blank(); a0 = -180; a1 = 0; origin = 'left'; under = pageHtml(0);
            after = () => { B.open = false; };
        } else if (t && dir > 0) {
            r = slotRect('r'); front = pageHtml(B.pg + 1); back = pageHtml(B.pg + 2); a0 = 0; a1 = -180; origin = 'left'; under = pageHtml(B.pg + 3);
            after = () => { B.pg += 2; };
        } else if (t && dir < 0) {
            r = slotRect('l'); front = pageHtml(B.pg); back = pageHtml(B.pg - 1); a0 = 0; a1 = 180; origin = 'right'; under = pageHtml(B.pg - 2);
            after = () => { B.pg -= 2; };
        } else if (dir > 0) {
            r = slotRect('o'); front = pageHtml(B.pg); back = spec.blank(); a0 = 0; a1 = -180; origin = 'left'; under = pageHtml(B.pg + 1);
            after = () => { B.pg += 1; };
        } else {
            r = slotRect('o'); front = pageHtml(B.pg - 1); back = spec.blank(); a0 = -180; a1 = 0; origin = 'left'; under = null;
            after = () => { B.pg -= 1; };
        }
        if (!r) return null;
        if (under != null) r.s.innerHTML = under;                            // 아래 쪽 = 넘긴 뒤 모습
        const f = document.createElement('div');
        f.className = 'bk-flip'; f.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;transform-origin:${origin} center`;
        f.innerHTML = `<div class="bk-face front">${front}</div><div class="bk-face back">${back}</div><i class="bk-fsh" aria-hidden="true"></i>`;
        stage.appendChild(f);
        const ctx = { f, a0, a1, w: Math.max(80, r.w), p: 0, after,
            set(p) { this.p = p; const a = a0 + (a1 - a0) * p; f.style.transform = `rotateY(${a}deg)`; f.style.setProperty('--sh', (Math.sin(Math.abs(a) * Math.PI / 180) * .28).toFixed(3)); } };
        B.busy = ctx; ctx.set(0);
        return ctx;
    }
    function animate(ctx, to, ok) {
        const from = ctx.p, t0 = performance.now(), ms = (window.calmMotion && calmMotion() ? 120 : BOOK_MS) * Math.max(.25, Math.abs(to - from));
        const step = now => {
            const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
            ctx.set(from + (to - from) * e);
            if (k < 1) { requestAnimationFrame(step); return; }
            B.busy = null; if (ok) ctx.after(); else if (ctx.after && ctx.a0 === -180 && ctx.a1 === 0 && !B.open) B.open = true;   // 덮기를 그만뒀어요 = 펼친 채로
            render();
        };
        requestAnimationFrame(step);
    }
    function turn(dir) {
        if (B.busy || !(dir > 0 ? canNext() : canPrev())) return;
        const ctx = start(dir); if (ctx) animate(ctx, 1, true);
    }
    const onResize = () => { if (B.alive && B.root && !B.busy) render(); };
    addEventListener('resize', onResize);
    render();
    return {
        get id() { return spec.id; }, get pg() { return B.pg; }, get open() { return B.open; }, get busy() { return !!(B.busy || B.drag); },
        root: () => B.root,
        refresh(s2) { if (s2) Object.assign(spec, s2); if (!B.busy && !(B.drag && B.drag.on)) render(); },   // 쪽 안 내용이 바뀌었어요 (자리 · 쪽 · 열림은 그대로)
        turn, destroy() { B.alive = false; removeEventListener('resize', onResize); if (B.root) B.root.remove(); B.root = null; }
    };
}
window.bookOpen = bookOpen; window.bookSide = bookSide; window.BookSpot = BookSpot; window.bookSpot = bookSpot; window.isSpot = isSpot; window.spotSave = spotSave; window.spotLoad = spotLoad;
