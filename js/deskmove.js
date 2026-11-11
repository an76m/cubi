/* 말랑달콤 다이어리 - js/deskmove.js
   🔁 꾹 잡아 옮기기 (도련 11-11 · 현실처럼 : 꽂혀 있는 걸 빼서 서랍에 · 쓰다가 다른 곳으로)
   - 💻 📲 책상 (🛠 꾸미기 밖 · 평소에도) : 꾹 누르고(0.45초) 있으면 손에 들려요 → 놓는 곳이 새 자리 · 그냥 톡 = 예전 그대로 (쓰기 · 펼치기)
   - 옮길 수 있는 것 · 놓을 수 있는 곳 (규칙은 하나 : 넣을 수 있는 소품이면 들어가고 · 아니면 '○○에 넣을 수 없어요' · 제자리)
       🎀 정리함의 롤      → 정리함 칸 (차 있으면 서로 바꾸기) · 마스킹테이프 서랍(소품) · 빈 칸 톡 = 서랍에서 골라 꽂기 (js/desktape.js)
       ✏️ 펜꽂이 · 서랍 문구 → 다른 펜꽂이 · 서랍장 (js/desk.js dkGdPut · 봉투 · 꺼낸 문구 줄과 같은 함수)
       📔 책상 위 다이어리  → 책상 빈 곳 = 그 자리 · 다이어리 보관 소품 = 안으로 (책상에서 사라지고 📔 보관소에만)
       📔 보관소 창의 권    → 책상에 끌어다 놓으면 = 그 자리에 꺼내 놓아요
   - 넣는 곳 고르기 · 서랍 칸 정하기 · 이름표는 봉투에서 꺼낼 때와 같은 창 (js/desk.js dkbHome) */
(function () {
    const HOLD_MS = 450, SLOP = 8;
    const M = { p: null, eat: false };
    const on = () => UI.desk() && document.documentElement.classList.contains('desk-on') && !(typeof DK !== 'undefined' && DK.edit);
    /* 어떤 것을 잡았나요 → { k, id, from, el } */
    function what(t) {
        let el;
        if ((el = t.closest('#deskStage .dkt-roll'))) { const host = el.closest('.desk-item'); return host && { k: 'tape', id: el.dataset.id, from: { u: host.dataset.u, i: +el.dataset.i }, el }; }
        if ((el = t.closest('#dkwCup .dkw-t[data-id], #dkwTray .dkw-it[data-id], #deskStage .dkw-desk .dkw-t[data-id]'))) return { k: 'gd', id: el.dataset.id, el };
        if ((el = t.closest('#deskStage .dk-vol[data-b]'))) return { k: 'vol', id: el.dataset.b, el };
        if ((el = t.closest('#dyModal .dy-it[data-id]')) && !t.closest('.dy-del, .dy-ed') && isBook(el.dataset.id)) return { k: 'vol', id: el.dataset.id, el, box: 1 };
        return null;
    }
    const isBook = id => (window.dkvBooks ? dkvBooks() : (window.dyyBooks ? dyyBooks() : [])).concat(window.dmkAll ? dmkAll() : []).some(b => b.id === id);
    /* 놓은 곳 */
    function under(x, y) {
        const L = document.elementsFromPoint(x, y).filter(e => !e.closest('.dkm-ghost'));
        const box = L.find(e => e.closest('.modal-content, #dkwCup .dkw-cupbox, #dkwTray .dkw-drawer'));
        const item = L.map(e => e.closest('#deskStage .desk-item')).find(Boolean) || null;
        const st = document.getElementById('deskStage'), R = st && st.getBoundingClientRect();
        return { box: !!box, item: box ? null : item, stage: !box && !!R && x >= R.left && x <= R.right && y >= R.top && y <= R.bottom };
    }
    const say = (t, x, y) => { if (window.dkwSay) dkwSay(t, { getBoundingClientRect: () => ({ left: x - 40, width: 80, top: y }) }); else showMsg(t); };
    /* 🧺 그 소품을 그 종류의 집으로 (봉투에서 꺼낼 때와 같은 창 · js/desk.js dkbHome) → true = 집이에요 */
    async function homeOf(k, t) {
        const win = dkbWin(k), u = t.dataset.u, is = () => deskFnMap()[win] === u || (dkHomes()[u] || []).some(e => e.k === win);
        if (is()) return true;
        await dkbHome(t, { k }, -1, -1, 0, 0);                               // 봉투 칸 번호 -1 = 꺼낼 카드 없음
        return is();
    }
    async function drop(o, x, y) {
        const U = under(x, y), t = U.item, nm = t ? dkName(DK.items.find(i => i.u === t.dataset.u) || {}) : '';
        if (o.k === 'tape') {
            const A = window.dktApi; if (!A) return;
            const hit = A.slotAt(x, y);
            if (hit) { if (A.put(o.id, o.from, hit)) dkbPulse(hit.el); return; }
            if (t) { if (await homeOf('tape', t)) { A.put(o.id, o.from, null); dkbPulse(t); say(`🎀 ${htmlEsc(nm)}에 넣었어요`, x, y); } return; }
            if (U.stage) say('🎀 정리함이나 서랍에 넣어요', x, y);
            return;
        }
        if (o.k === 'gd') {
            if (t) { if (await dkGdPut(o.id, t)) { dkbPulse(t); if (window.dkwClose) dkwClose(); if (window.dkwDeskSoon) dkwDeskSoon(); say(`✏️ ${htmlEsc(nm)}에 넣었어요`, x, y); } return; }
            if (U.stage) say('✏️ 펜꽂이나 서랍장에 넣어요', x, y);
            return;
        }
        if (o.k === 'vol') {
            const ti = t && DK.items.find(i => i.u === t.dataset.u);
            if (ti && !dkIsBox(t) && dkHoldOk(ti.id).includes('skin')) {   // 📔 보관 소품 = 안으로
                if (!await homeOf('tool', t)) return;
                dkBagHold(o.id); dkDeskBooks(); dkbPulse(t); say(`📔 ${htmlEsc(nm)}에 넣었어요`, x, y); return;
            }
            if (U.stage) { if (o.box && window.closeModal) closeModal('dyModal'); dkvPlace(o.id, x, y); }   // 책상 빈 곳 · 바구니 같은 담는 소품 = 그 자리에 (보이게)
        }
    }
    /* 손 그림 */
    function ghost(o, x, y) {
        const r = o.el.getBoundingClientRect(), g = o.el.cloneNode(true);
        g.classList.add('dkm-ghost'); g.removeAttribute('id');
        const w = Math.max(28, Math.min(160, r.width)), h = r.width ? r.height * w / r.width : w;
        Object.assign(g.style, { width: w + 'px', height: Math.min(200, h) + 'px', left: x + 'px', top: y + 'px', transform: '', translate: '', rotate: '' });
        document.body.appendChild(g); return g;
    }
    /* 손에 든 동안 = 다른 손짓(톡 · 뽑기 · 밀기)은 받지 않아요 · 놓으면 원래 손짓에는 '취소'를 보내 정리해요 */
    const eat = e => { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); };
    addEventListener('pointerdown', ev => {
        if (ev.button > 0 || !ev.isPrimary || !on()) return;
        const o = what(ev.target); if (!o || !o.id) return;
        const p = M.p = { o, x: ev.clientX, y: ev.clientY, id: ev.pointerId, src: ev.target, held: false };
        p.tm = setTimeout(() => {
            if (M.p !== p) return;
            p.held = true; M.eat = true; o.el.classList.add('dkm-from');
            p.g = ghost(o, p.lx || p.x, p.ly || p.y);
            if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) {}
            if (o.box) { const m = document.getElementById('dyModal'); if (m) m.classList.add('dkm-see'); }   // 📔 보관소 창 너머 책상이 보이게
        }, HOLD_MS);
    }, true);
    addEventListener('pointermove', ev => {
        const p = M.p; if (!p || ev.pointerId !== p.id) return;
        p.lx = ev.clientX; p.ly = ev.clientY;
        if (!p.held) { if (Math.hypot(ev.clientX - p.x, ev.clientY - p.y) > SLOP) { clearTimeout(p.tm); M.p = null; } return; }   // 먼저 움직이면 = 원래 손짓 (뽑기 · 밀기 · 넘기기)
        eat(ev);
        p.g.style.left = ev.clientX + 'px'; p.g.style.top = ev.clientY + 'px';
        const U = under(ev.clientX, ev.clientY);
        document.querySelectorAll('.dkh-hi').forEach(e => { if (e !== U.item) e.classList.remove('dkh-hi'); });
        if (U.item) U.item.classList.add('dkh-hi');
    }, true);
    const end = ev => {
        const p = M.p; if (!p || ev.pointerId !== p.id) return;
        clearTimeout(p.tm); M.p = null; if (!p.held) return;
        eat(ev);
        document.querySelectorAll('.dkh-hi').forEach(e => e.classList.remove('dkh-hi'));
        p.g.remove(); p.o.el.classList.remove('dkm-from');
        const m = document.getElementById('dyModal'); if (m) m.classList.remove('dkm-see');
        setTimeout(() => {                                                    // 원래 손짓 정리 (가짜 '취소' · 이 줄은 eat 가 거르지 않아요) → 다음 톡이 섞이지 않게
            M.eat = false;
            try { const c = new PointerEvent('pointercancel', { pointerId: p.id, bubbles: true, isPrimary: true }); (p.src.isConnected ? p.src : document.body).dispatchEvent(c); } catch (e) {}
        }, 0);
        if (ev.type === 'pointerup') drop(p.o, ev.clientX, ev.clientY).catch(e => console.warn('🔁 옮기기', e));
    };
    addEventListener('pointerup', end, true); addEventListener('pointercancel', end, true);
    addEventListener('click', e => { if (M.eat) eat(e); }, true);            // 놓은 뒤 따라오는 톡 (펼치기 · 쓰기) 은 버려요
    window.dkmDrop = drop;
    /* ✋ 톡 = 화면 가운데로 날아오기 (도련 11-11 · 마테 롤 · 펜 · 서랍 문구 · 스티커 종이 모두 같은 모습) : 그 그림이 제자리에서 떠올라 가운데로 → 끝나면 resolve */
    window.dkFly = (src, x, y) => new Promise(ok => {
        const r = src && src.getBoundingClientRect ? src.getBoundingClientRect() : null;
        if (!r || !r.width || matchMedia('(prefers-reduced-motion: reduce)').matches) return ok();
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
    });                                                    // 🧪 시험용
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskmove'] = true;
