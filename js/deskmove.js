/* 말랑달콤 다이어리 - js/deskmove.js
   ✋ 꺼내기 · 넣기 하나로 (도련 11-11 · 현실처럼 · 자유롭게 · 편하게 · 💻 📲 책상)
   - 꺼내기 : 톡 = 그 상품이 화면 가운데로 날아와요 (dkFly) · 끌기 = 손으로 끌어내 놓은 자리에 (dkCarry) · 확대한 보관함 = 위로 쏙 뽑은 뒤 그대로 끌어요
   - 넣기 = 밖에 나온 상품을 보관함에 **끌어 놓을 때만** · 묻지 않고 바로 넣어요 (도련 11-13 · 문구가 들어가는 곳 모두 같아요)
       자리가 여럿이면 그 자리만 골라요 (🗄 서랍장 칸 · 🎀 정리함 빈 칸 · 그 종류 서랍이 이미 있으면 바로 거기)
       보관함 톡 = 늘 그 보관함 기능 (서랍 열기 · 닫기 · 펜꽂이 확대 …) · 예전 '톡 = 넣을까요?' 는 영구 삭제
   - 펼친 다이어리 페이지에 쓰는 건 예전 그대로 · 다이어리는 톡 할 때만 펴져요 (상품을 꺼내도 저절로 안 떠요)
   - 어떤 상품이 어디로 : 🎀 마테 = 정리함 · 마스킹테이프 서랍 / 📒 스티커 종이 · 떡메 · 메모지 · 속지 = 그 종류 서랍 / ✏️ 문구 = 펜꽂이 · 문구 서랍 */
(function () {
    const C = () => ({ x: innerWidth / 2, y: innerHeight / 2 });
    const itemOf = t => t && DK.items.find(i => i.u === t.dataset.u);
    const isRack = t => dkDef(t).hold === 'tape';
    /* 이 보관함에 들어갈 수 있나요 : o = { k: 'tape' | 'stk' | 'gd', id, kind } */
    function fits(t, o) {
        const ti = itemOf(t); if (!ti) return false;
        const ok = dkHoldOk(ti.id), chest = !!dkSlots(ti.id);
        if (o.k === 'tape') return isRack(t) || (chest && ok.includes('h:tape'));
        if (o.k === 'stk') return chest && ok.includes('h:' + o.kind);
        if (o.k === 'gd') return (ok.includes('pc') && !chest && window.dkwCanCup && dkwCanCup(o.id)) || (chest && ok.includes('gd'));
        return false;
    }
    /* 🧺 그 종류의 집 (서랍 칸 · 봉투에서 꺼낼 때와 같은 창 · js/desk.js dkbHome) : 이미 이 서랍장이면 = 바로 넣어요 (묻지 않아요 · 도련 11-13) · 아니면 칸 고르기 */
    async function homeAsk(k, t, nm) {
        const win = dkbWin(k), u = t.dataset.u, is = () => deskFnMap()[win] === u || (dkHomes()[u] || []).some(e => e.k === win);
        if (is()) return true;
        await dkbHome(t, { k }, -1, -1, 0, 0);                               // 봉투 칸 번호 -1 = 꺼낼 카드 없음
        return is();
    }
    /* ✋ 넣기 (묻지 않아요 · 자리가 여럿이면 자리만 골라요) → true = 넣었어요 */
    async function store(t, o) {
        const ti = itemOf(t); if (!ti) return false;
        const nm = dkName(ti), A = window.dktApi;
        if (o.k === 'tape' && isRack(t)) {                                    // 🎀 정리함 = 빈 칸 고르기
            const hit = A && await A.pickFor(t); if (!hit) return false;
            A.put(o.id, o.from || A.where(o.id), hit); if (window.dsPutBack) dsPutBack(o.id); dkbPulse(t); return true;
        }
        if (o.k === 'tape' || o.k === 'stk') {                                // 🗄 그 종류 서랍
            if (!await homeAsk(o.k === 'tape' ? 'tape' : o.kind, t, nm)) return false;
            if (o.k === 'tape' && A) { const w = o.from || A.where(o.id); if (w) A.put(o.id, w, null); }   // 정리함에서 빠져요
            if (window.dsPutBack) dsPutBack(o.id); dkbPulse(t); return true;
        }
        if (o.k === 'gd') {
            const chest = !!dkSlots(ti.id);
            if (!await dkGdPut(o.id, t)) return false;                           // 🗄 서랍장 = 칸 고르기 (dkzChoose)
            if (window.dkwBack) dkwBack(o.id); dkbPulse(t); return true;
        }
        return false;
    }
    /* 끌어 놓은 곳이 들어갈 보관함이면 = 넣기 → true · 다이어리를 펼친 동안은 페이지에 쓰는 거라 넣지 않아요 */
    function holderAt(x, y) {
        const L = document.elementsFromPoint(x, y).filter(e => !e.closest('.dkm-ghost, .dkm-fly, .dsk'));
        if (L.some(e => e.closest('.modal-content, .dkw-cupbox, .dkw-drawer'))) return null;
        return L.map(e => e.closest('#deskStage .desk-item')).find(Boolean) || null;
    }
    /* 🗄️ 서랍이 열려 있으면 넣는 길 둘 (도련 11-12 · ✏️ 문구 = js/deskgd.js dkwTrayInto 와 같아요) : 밖에 나온 스티커 · 마테를 ① 열린 그 종류 서랍 창 안 ② 그 서랍장에 끌어 놓기 = 고르기 없이 그 서랍 · 창에 바로 보여요 */
    function drawerInto(o, x, y) {
        const kind = o.k === 'tape' ? 'tape' : o.kind; if (!window.bkDrawerKind || bkDrawerKind() !== kind) return false;
        const m = document.getElementById('basketKindModal'), box = m && m.querySelector('.modal-content'), u = window.dkDrawerU ? dkDrawerU() : '';
        if (!drawerHit(box, u, x, y)) return false;                            // 🗄️ 넣는 자리 = 하나로 (drawerHit)
        const A = window.dktApi; if (o.k === 'tape' && A) { const w = o.from || A.where(o.id); if (w) A.put(o.id, w, null); }   // 정리함에서 빠져요
        if (window.dsPutBack) dsPutBack(o.id);                                  // 꺼낸 것 치우기 = 서랍 창이 바로 다시 그려요 (js/basket.js dsDrop)
        const h = u && document.querySelector(`#deskStage .desk-item[data-u="${u}"]`); if (h && window.dkbPulse) dkbPulse(h);
        return true;
    }
    async function dropOn(x, y, o) {
        if (document.documentElement.classList.contains('desk-show') || DK.edit) return false;
        if (o.k === 'gd' && window.dkwTrayInto && dkwTrayInto(o.id, x, y)) return true;
        if ((o.k === 'stk' || o.k === 'tape') && drawerInto(o, x, y)) return true;   // 🗄️ 스티커 · 마테도 같아요   // 🗄️ 서랍이 열려 있으면 = 위 창 안 · 그 서랍장에 놓기 = 고르기 없이 그 서랍에 (도련 11-12 · js/deskgd.js)
        const t = holderAt(x, y); if (!t || !fits(t, o)) return false;
        await store(t, o); return true;                                         // 취소해도 = 넣지 않았을 뿐 (꺼낸 자리 그대로)
    }
    /* ✋ 끌기 하나로 (도련 11-21 · 공통 뼈대 하나 + 상품마다 다른 것만 덧붙여요) : 책상의 모든 '그림이 손을 따라오는 끌기' = 이 함수
         봉투 카드 · 꺼낸 문구 줄 · 서랍 카드 · 책상 책 · 마테 롤 · 🏪 적용해보기 테이프 · 펜꽂이 · 정리함에서 뽑은 것 모두 같아요
       DK_FAR = 끌기로 치는 거리 하나 (그보다 덜 움직이고 떼면 = 톡) · dkFar(x0, y0, e) = 그만큼 움직였나요
       dkDrag(ev, src, op) : ev = pointerdown (또는 이미 움직이는 중인 pointermove)
         op.min   = 끌기 시작 거리 (기본 DK_FAR · 0 = 바로 끌기)
         op.ghost = 따라올 그림 만들기 (src → 요소 · 기본 = src 그림 그대로 · .dkm-ghost)
         op.grab  = true → 잡은 자리 그대로 따라와요 (기본 = 그림 가운데가 손끝)
         op.at    = 지금 손 아래 보관함 (x, y → 요소 · 반짝 표시 · 기본 = 책상 보관함 · null = 표시 없음)
         op.from  = 끄는 동안 원래 그림에 붙일 class (기본 'dkm-from' · '' = 없음)
         op.dir   = (x0, y0, e) → 'pick' | 'scroll' | '' (서랍 카드 = dkShelfDir · scroll = 끌기 안 하고 놓아줘요)
         op.start(e) · op.tap(e) · op.drop(x, y, e, hi) · op.cancel() */
    const DK_FAR = 8;
    const far = (x0, y0, e) => Math.hypot(e.clientX - x0, e.clientY - y0) >= DK_FAR;
    function drag(ev, src, op) {
        op = op || {};
        const x0 = ev.clientX, y0 = ev.clientY, min = op.min == null ? DK_FAR : op.min, at = op.at === undefined ? holderAt : op.at, from = op.from == null ? 'dkm-from' : op.from;
        let g = null, hi = null, ox = 0, oy = 0, on = false;
        const place = e => { g.style.left = (e.clientX - ox) + 'px'; g.style.top = (e.clientY - oy) + 'px'; };
        const light = t => { if (t === hi) return; if (hi) hi.classList.remove('dkh-hi'); hi = t; if (hi) hi.classList.add('dkh-hi'); };
        const begin = e => {
            on = true; const r = src.getBoundingClientRect();
            g = op.ghost ? op.ghost(src) : ghostOf(src, r); g.removeAttribute('id'); g.style.pointerEvents = 'none'; g.style.zIndex = '';   // 책상에서 쓰던 겹침 순서(인라인)는 버려요 = 늘 맨 위 (열린 서랍 창 뒤로 안 숨어요 · 도련 11-21)
            if (op.grab) { ox = e.clientX - r.left; oy = e.clientY - r.top; Object.assign(g.style, { width: r.width + 'px', height: r.height + 'px' }); }
            document.body.appendChild(g); place(e); if (from) src.classList.add(from);
            if (op.start) op.start(e);
        };
        const off = () => { removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true); };
        const mv = e => {
            if (e.pointerId !== ev.pointerId) return;
            if (!on) {
                if (op.dir) { const d = op.dir(x0, y0, e); if (d === 'scroll') { off(); if (op.cancel) op.cancel(); return; } if (d !== 'pick') return; }
                else if (min && Math.hypot(e.clientX - x0, e.clientY - y0) < min) return;
                begin(e);
            }
            place(e); if (at) light(at(e.clientX, e.clientY));
        };
        const up = e => {
            if (e.pointerId !== ev.pointerId) return; off();
            const t = hi; light(null); if (g) g.remove(); if (from) src.classList.remove(from);
            if (e.type !== 'pointerup') { if (op.cancel) op.cancel(); return; }
            if (!on) { if (op.tap) op.tap(e); return; }
            if (op.drop) op.drop(e.clientX, e.clientY, e, at ? at(e.clientX, e.clientY) || t : null);
        };
        addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
        if (!min && !op.dir) { begin(ev); if (at) light(at(ev.clientX, ev.clientY)); }   // 바로 끌기 (이미 움직이는 중 · 뽑은 채로)
        return { stop: () => { off(); light(null); if (g) g.remove(); if (from) src.classList.remove(from); } };
    }
    function ghostOf(src, r) {                                                // 기본 따라오는 그림 = 그 그림 그대로 (크기만 알맞게)
        const g = src.cloneNode(true);
        g.classList.add('dkm-ghost'); g.classList.remove('grab', 'pull', 'dkt-lift', 'dkm-from');
        Object.assign(g.style, { width: Math.max(24, Math.min(160, r.width)) + 'px', height: Math.max(24, Math.min(220, r.height)) + 'px', transform: 'none', translate: '', opacity: '' });
        return g;
    }
    /* ✋ 손으로 끌기 (바로) : 그림이 손을 따라와요 → 놓으면 done(x, y) · dkDrag 의 짧은 이름 */
    function carry(src, ev, done) { return drag(ev, src, { min: 0, drop: (x, y) => done(x, y) }); }
    /* ✋ 위로 쏙 뽑기 하나로 (🎀 확대한 정리함 롤 · 🧺 바구니 책 · ✏️ 펜꽂이는 옆으로 밀기도 있어서 따로) : 잡고 위로 op.up 만큼 = 뽑혀요 → op.out(e) · 톡 = op.hint 글 */
    function pull(b, op) {
        let p = null; const k = () => op.k || 1;
        b.addEventListener('pointerdown', e => { if (e.button > 0) return; e.preventDefault(); e.stopPropagation(); try { b.setPointerCapture(e.pointerId); } catch (er) {} p = { id: e.pointerId, y: e.clientY, x: e.clientX }; b.classList.add('grab'); });
        b.addEventListener('pointermove', e => {
            if (!p || e.pointerId !== p.id) return;
            const up = Math.max(0, p.y - e.clientY); b.style.translate = `0 ${(-up / k()).toFixed(1)}px`;
            if (up > op.up) { p = null; b.classList.remove('grab'); buzz(12); op.out(e); }   // 쏙 뽑혔어요
        });
        const end = e => { if (!p || e.pointerId !== p.id) return; const tap = !far(p.x, p.y, e); p = null; b.classList.remove('grab'); b.style.translate = ''; if (tap && op.hint && window.dkwSay) dkwSay(op.hint, b); };
        b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
    }
    /* 🗄️ 열린 서랍에 넣는 자리 하나로 (✏️ 문구함 · 🏷️ 스티커 · 🎀 마테 서랍 창 · 📔 📒 🧩 책 서랍) : ① 열린 서랍 창 안 ② 그 서랍장 위 → true */
    function drawerHit(box, u, x, y) {
        const b = box && box.getBoundingClientRect();
        if (b && b.width > 0 && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) return true;
        return !!u && document.elementsFromPoint(x, y).some(e => { const h = e.closest && e.closest('#deskStage .desk-item'); return !!h && h.dataset.u === u; });
    }
    window.DK_FAR = DK_FAR; window.dkFar = far; window.dkDrag = drag; window.dkPull = pull; window.dkDrawerHit = drawerHit;
    /* ✋ 톡 = 화면 가운데로 날아오기 (마테 롤 · 펜 · 서랍 문구 · 스티커 종이 모두 같은 모습) : 그 그림이 제자리에서 떠올라 가운데로 → 끝나면 resolve */
    function fly(src, x, y) {
        return new Promise(ok => {
            const r = src && src.getBoundingClientRect ? src.getBoundingClientRect() : null;
            if (!r || !r.width || calmMotion()) return ok();
            const g = src.cloneNode(true); g.removeAttribute('id'); g.classList.add('dkm-fly'); g.classList.remove('dkt-lift', 'grab', 'pull', 'need');
            Object.assign(g.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0', transform: 'none', translate: 'none', rotate: 'none', zIndex: 2147482950, transition: 'none', opacity: '1' });
            document.body.appendChild(g);
            const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2), k = Math.max(1, Math.min(2.4, 110 / Math.max(r.width, r.height)));
            let done = false; const end = () => { if (done) return; done = true; g.remove(); ok(); };
            try {
                const a = g.animate([{ transform: 'translate(0px, 0px) scale(1)', opacity: 1 }, { transform: `translate(${dx * .55}px, ${dy * .55 - 50}px) scale(${(1 + k) / 2})`, opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(${k})`, opacity: .35 }], { duration: 430, easing: 'cubic-bezier(.33, .9, .4, 1)' });
                a.onfinish = end;
            } catch (e) { end(); }
            setTimeout(end, 800);
        });
    }
    window.dkFly = fly; window.dkCarry = carry; window.dkDropOn = dropOn; window.dkStore = store; window.dkCenter = C;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskmove'] = true;
