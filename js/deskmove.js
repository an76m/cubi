/* 말랑달콤 다이어리 - js/deskmove.js
   ✋ 꺼내기 · 넣기 하나로 (도련 11-11 · 현실처럼 · 자유롭게 · 편하게 · 💻 📲 책상)
   - 꺼내기 : 톡 = 그 상품이 화면 가운데로 날아와요 (dkFly) · 끌기 = 손으로 끌어내 놓은 자리에 (dkCarry) · 확대한 보관함 = 위로 쏙 뽑은 뒤 그대로 끌어요
   - 넣기 (다이어리가 접힌 채 = 이동) : 밖에 나온 상품을 보관함에 끌어 놓거나 · 상품이 나와 있을 때 그 보관함을 톡 하면 → 바로 넣지 않고 한 번 골라요 (실수로 누를 수 있어서)
       보관 자리가 하나 = '넣을까요?' · 여러 자리 = 그 자리를 그림으로 (🗄 서랍장 칸 · 🎀 정리함 빈 칸)
       🗄 서랍장 톡 = [넣기] [서랍 열기] · 나온 상품이 여럿 = 넣을 것부터 골라요
   - 펼친 다이어리 페이지에 쓰는 건 예전 그대로 · 다이어리는 톡 할 때만 펴져요 (상품을 꺼내도 저절로 안 떠요)
   - 어떤 상품이 어디로 : 🎀 마테 = 정리함 · 마스킹테이프 서랍 / 📒 스티커 종이 · 떡메 · 메모지 · 속지 = 그 종류 서랍 / ✏️ 문구 = 펜꽂이 · 문구 서랍 */
(function () {
    const C = () => ({ x: innerWidth / 2, y: innerHeight / 2 });
    const itemOf = t => t && DK.items.find(i => i.u === t.dataset.u);
    const isRack = t => dkDef(t).hold === 'tape';
    const say = (t, x, y) => { if (window.dkwSay) dkwSay(t, { getBoundingClientRect: () => ({ left: x - 40, width: 80, top: y }) }); };
    /* 이 보관함에 들어갈 수 있나요 : o = { k: 'tape' | 'stk' | 'gd', id, kind } */
    function fits(t, o) {
        const ti = itemOf(t); if (!ti) return false;
        const ok = dkHoldOk(ti.id), chest = !!dkSlots(ti.id);
        if (o.k === 'tape') return isRack(t) || (chest && ok.includes('h:tape'));
        if (o.k === 'stk') return chest && ok.includes('h:' + o.kind);
        if (o.k === 'gd') return (ok.includes('pc') && !chest && window.dkwCanCup && dkwCanCup(o.id)) || (chest && ok.includes('gd'));
        return false;
    }
    /* 밖에 나와 있는 것 (떠 있는 스티커 · 마테 · 페이지 위 문구 · 떠 있는 손) 중 이 보관함에 들어갈 것 */
    function outsFor(t) {
        const L = [];
        (window.dsOuts ? dsOuts() : []).forEach(e => { const o = e.k === 'tape' ? { k: 'tape', id: e.id, th: e.th } : { k: 'stk', kind: e.k, id: e.id, th: e.th }; if (fits(t, o)) L.push(o); });
        (window.dkwOutNow ? dkwOutNow() : []).forEach(id => { const o = { k: 'gd', id }; if (fits(t, o)) L.push(o); });
        return L;
    }
    const artOf = o => o.k === 'gd' ? (window.dkwArtOf ? dkwArtOf(o.id) : '✏️') : `<i style="background-image:url('${htmlEsc(o.th || '')}')"></i>`;
    const nameOf = o => o.k === 'gd' ? ((window.dkwNameOf && dkwNameOf(o.id)) || '문구') : o.k === 'tape' ? '마스킹테이프' : (DKH_NAMES[o.kind] || '스티커');
    async function pickOut(L) {                                               // 나온 상품이 여럿 = 넣을 것 고르기
        if (L.length < 2) return L[0] || null;
        const a = document.getElementById('customAlertConfirmBtn'); if (a) a.style.display = 'none';
        let r; try { r = await showAsk(`✋ 어느 것을 넣을까요?<div class="dkm-pick">${L.map((o, i) => `<button type="button" onclick="closeMsg('o${i}')" title="${htmlEsc(nameOf(o))}">${artOf(o)}<small>${htmlEsc(nameOf(o))}</small></button>`).join('')}</div>`, '', '취소'); }
        finally { if (a) a.style.display = ''; }
        return typeof r === 'string' && r[0] === 'o' ? L[+r.slice(1)] : null;
    }
    /* 🧺 그 종류의 집 (서랍 칸 · 봉투에서 꺼낼 때와 같은 창 · js/desk.js dkbHome) : 이미 이 서랍장이면 '넣을까요?' · 아니면 칸 고르기 */
    async function homeAsk(k, t, nm) {
        const win = dkbWin(k), u = t.dataset.u, is = () => deskFnMap()[win] === u || (dkHomes()[u] || []).some(e => e.k === win);
        if (is()) { const [, K, , ic] = dkWin(win) || []; return !!await showAsk(`${ic || '🗄️'} <b>${htmlEsc(josa(K || '스티커', '을', '를'))}</b> ${htmlEsc(nm)}에 넣을까요?`, '넣기', '취소'); }
        await dkbHome(t, { k }, -1, -1, 0, 0);                               // 봉투 칸 번호 -1 = 꺼낼 카드 없음
        return is();
    }
    /* ✋ 넣기 (한 번 골라요) → true = 넣었어요 */
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
            if (!chest && !await showAsk(`✏️ <b>${htmlEsc(josa(nameOf(o), '을', '를'))}</b> ${htmlEsc(nm)}에 넣을까요?`, '넣기', '취소')) return false;   // ✏️ 펜꽂이 = 한 자리
            if (!await dkGdPut(o.id, t)) return false;                           // 🗄 서랍장 = 칸 고르기 (dkzChoose)
            if (window.dkwBack) dkwBack(o.id); dkbPulse(t); return true;
        }
        return false;
    }
    /* 끌어 놓은 곳이 들어갈 보관함이면 = 넣기 (한 번 골라요) → true · 다이어리를 펼친 동안은 페이지에 쓰는 거라 넣지 않아요 */
    function holderAt(x, y) {
        const L = document.elementsFromPoint(x, y).filter(e => !e.closest('.dkm-ghost, .dkm-fly, .dsk'));
        if (L.some(e => e.closest('.modal-content, .dkw-cupbox, .dkw-drawer'))) return null;
        return L.map(e => e.closest('#deskStage .desk-item')).find(Boolean) || null;
    }
    async function dropOn(x, y, o) {
        if (document.documentElement.classList.contains('desk-show') || DK.edit) return false;
        const t = holderAt(x, y); if (!t || !fits(t, o)) return false;
        await store(t, o); return true;                                         // 취소해도 = 넣지 않았을 뿐 (꺼낸 자리 그대로)
    }
    /* 보관함 톡 (js/desk.js dkHomeTap 맨 앞) : 들어갈 상품이 나와 있으면 = 넣기 · 🗄 서랍장 = [넣기] [서랍 열기] → true = 여기서 처리 */
    function tapHolder(t, open) {
        if (DK.edit || !UI.desk()) return false;
        const L = outsFor(t); if (!L.length) return false;
        (async () => {
            const ti = itemOf(t);
            if (dkSlots(ti.id)) {
                const r = await showAsk(`🗄️ 밖에 나와 있는 ${L.length > 1 ? `상품 ${L.length}개` : `<b>${htmlEsc(nameOf(L[0]))}</b>`}를 ${htmlEsc(dkName(ti))}에 넣을까요?`, '넣기', '서랍 열기');
                if (!r) { open(); return; }
            }
            const o = await pickOut(L); if (o) await store(t, o);
        })().catch(e => console.warn('✋ 넣기', e));
        return true;
    }
    /* ✋ 손으로 끌기 : 그림이 손을 따라와요 → 놓으면 done(x, y) */
    function carry(src, ev, done) {
        const r = src.getBoundingClientRect(), g = src.cloneNode(true);
        g.classList.add('dkm-ghost'); g.removeAttribute('id'); g.classList.remove('grab', 'pull', 'dkt-lift');
        Object.assign(g.style, { width: Math.max(24, Math.min(160, r.width)) + 'px', height: Math.max(24, Math.min(220, r.height)) + 'px', left: ev.clientX + 'px', top: ev.clientY + 'px', transform: 'none', translate: '', opacity: '' });
        document.body.appendChild(g); src.classList.add('dkm-from');
        const mv = e => {
            if (e.pointerId !== ev.pointerId) return; g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px';
            const t = holderAt(e.clientX, e.clientY); document.querySelectorAll('.dkh-hi').forEach(x => { if (x !== t) x.classList.remove('dkh-hi'); }); if (t) t.classList.add('dkh-hi');
        };
        const up = e => {
            if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
            g.remove(); src.classList.remove('dkm-from'); document.querySelectorAll('.dkh-hi').forEach(x => x.classList.remove('dkh-hi'));
            if (e.type === 'pointerup') done(e.clientX, e.clientY);
        };
        addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
    }
    /* ✋ 톡 = 화면 가운데로 날아오기 (마테 롤 · 펜 · 서랍 문구 · 스티커 종이 모두 같은 모습) : 그 그림이 제자리에서 떠올라 가운데로 → 끝나면 resolve */
    function fly(src, x, y) {
        return new Promise(ok => {
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
        });
    }
    window.dkFly = fly; window.dkCarry = carry; window.dkDropOn = dropOn; window.dkStoreTap = tapHolder; window.dkStore = store; window.dkOutsFor = outsFor; window.dkCenter = C;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskmove'] = true;
