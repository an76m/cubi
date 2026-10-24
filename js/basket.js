/* 말랑달콤 다이어리 - js/basket.js
   🧺 내 바구니 · 🏪 진열대 (도련 10-25 · 유한 스티커 · 저장 · 쓰기는 js/own.js)
   - ✨ 스티커 창 → 🧺 내 바구니 : 받거나 만든 스티커 종이가 바구니에 마구 쌓여요 (정리 · 카테고리 · 찾기 · 이름 없음 = 진짜 바구니처럼)
       · 종이는 살짝 기울고 겹쳐 쌓여요 · 새로 들어온 종이가 맨 위
       · 종이를 끌면 옆으로 치워져요(맨 위로) → 아래 깔린 종이를 찾아요 · 🔀 뒤적이기 = 통째로 휘저어 섞기
       · 종이를 톡 = 그 종이가 하얀 떼는 창으로 나와요 (뗀 자리는 비어 있어요 · js/stickerpeel.js) → 붙이면 그 칸은 영원히 사라져요
       · 다 쓴 종이는 바구니에서 사라져요 · 종이 자리 · 쌓인 순서는 이 기기에만 기억 (localStorage · 드라이브에 쓰지 않아요)
       · 화면에는 맨 위 BK_MAX 장만 그려요 (수백 장이어도 버벅이지 않게 · 🔀 뒤적이면 아래 것이 올라와요)
       · 나중에 🗂️ 바인더 · 바구니 · 라벨을 사서 정리하는 기능을 이 위에 얹어요 (도련 10-25)
   - ✨ 스티커 창 → 🏪 진열대 : 기본스티커(Cloudflare 그림 보관함 · js/elements.js basicKit)를 카테고리 매대(선반)별로 진열
       · [🧺 받기] = 그 스티커 종이를 새로 한 장 받아 바구니로 (공짜 · 몇 번이든 · 같은 스티커도 받을 때마다 새 종이 · 도련 10-25)
       · 이름표 = js/kit-meta.js 의 세트 이름 (도구/스티커정리/3_정보.py)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (스티커 창의 두 칸만 안 열려요) */

(function () {
    const bq = id => document.getElementById(id);
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const BK_LAY = 'malang_bk_lay', BK_MAX = 150;
    const B = { list: [], opening: '', lay: null, drag: null, top: 0 };
    const vis = id => { const m = bq(id); return !!m && m.style.display === 'flex'; };

    /* ---------- 종이 자리 (이 기기에만 : { o : [아래 → 위 id], p : { id : [x, y, 기울기] } }) ---------- */
    const bkWho = () => (window.ownMode && ownMode() === 'mem') ? 'guest' : ((typeof COLL !== 'undefined' && COLL.who) || 'me');
    function bkLay() {
        if (B.lay && B.lay.w === bkWho()) return B.lay;
        let all = {}; try { all = JSON.parse(localStorage.getItem(BK_LAY) || '{}') || {}; } catch (e) {}
        const L = all[bkWho()] || {};
        B.lay = { w: bkWho(), o: Array.isArray(L.o) ? L.o : [], p: L.p && typeof L.p === 'object' ? L.p : {} };
        return B.lay;
    }
    function bkLaySave() {
        const L = bkLay(), ids = new Set(B.list.map(e => e.id));
        L.o = L.o.filter(id => ids.has(id)); Object.keys(L.p).forEach(id => { if (!ids.has(id)) delete L.p[id]; });   // 다 쓴 종이는 잊어요
        if (bkWho() === 'guest') return;
        try { const all = JSON.parse(localStorage.getItem(BK_LAY) || '{}') || {}; all[L.w] = { o: L.o, p: L.p }; localStorage.setItem(BK_LAY, JSON.stringify(all)); } catch (e) {}
    }
    function bkRnd(id, n) { let h = 2166136261 ^ n; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 2246822507); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
    /* 쌓인 순서 : 끌었거나 뒤적인 것은 기억한 순서 · 나머지는 받은 순서 (새것이 위) */
    function bkOrder() {
        const L = bkLay(), byId = new Map(B.list.map(e => [e.id, e]));
        const known = L.o.filter(id => byId.has(id)), seen = new Set(known);
        const fresh = B.list.filter(e => !seen.has(e.id)).sort((a, b) => a.at - b.at).map(e => e.id);   // 처음 보는 종이 : 받은 때 순서대로 위에 쌓여요
        return known.concat(fresh).map(id => byId.get(id));
    }

    /* ---------- 🧺 내 바구니 ---------- */
    function openBasket() {
        if (vis('stickerMakeModal')) closeModal('stickerMakeModal');
        openModal('basketModal');
        bkRender(true);
    }
    const bkMsg = (h, btn) => `<div class="bk-msg">${h}${btn || ''}</div>`;
    async function bkRender(force) {
        const wrap = bq('bkWrap'); if (!wrap) return;
        if (!window.ownList) { wrap.innerHTML = bkMsg('🧺 바구니를 준비하고 있어요.'); return; }
        if (!ownMode()) { wrap.innerHTML = bkMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 바구니를 쓸 수 있어요.'); return; }
        if (!wrap.querySelector('.bk-bin')) wrap.innerHTML = bkMsg('🧺 바구니를 여는 중…');
        try { B.list = (await ownList(force)).slice(); }
        catch (e) { wrap.innerHTML = bkMsg('⚠ 바구니를 열지 못했어요.<br>' + ownErrText(e), '<button type="button" class="btn bk-again" onclick="bkRender(true)">🔄 다시 열기</button>'); return; }
        bkDraw();
    }
    function bkCard(e) {
        const used = new Set(e.u), cols = Math.ceil(Math.sqrt(e.n));
        let inner;
        if (e.th) inner = `<img src="${esc(e.th)}" alt="" draggable="false">`;
        else inner = `<i class="bk-grid" style="--c:${cols}">${(e.us || []).map((u, i) => used.has(i) ? '<b class="bk-hole"></b>' : `<img src="${esc(window.kitSize ? kitSize(u, 96) : u)}" alt="" loading="lazy" draggable="false" onerror="this.style.visibility='hidden'">`).join('')}</i>`;
        return `<button type="button" class="bk-sh${e.n === 1 ? ' one' : ''}" data-id="${esc(e.id)}" aria-label="스티커 종이">${inner}</button>`;
    }
    function bkDraw() {
        const wrap = bq('bkWrap'); if (!wrap) return;
        const guest = ownMode() === 'mem';
        const note = `<p class="bk-note">${guest ? '👀 구경만 할 때는 창을 닫거나 새로고침하면 바구니도 비워져요.' : '🔥 받은 · 만든 스티커는 내 드라이브 <b>말랑달콤</b> 폴더에 보관돼요. 폴더를 지우면 모두 사라지고 되돌릴 수 없어요.'}</p>`;
        if (!B.list.length) {
            wrap.innerHTML = `<div class="bk-bin empty"><div class="bk-pile"></div><div class="bk-front"></div></div>`
                + bkMsg('바구니가 비어 있어요.<br>🏪 진열대에서 스티커를 받아 오거나<br>✂️ 나만의 스티커를 만들어 보세요!') + note;
            return;
        }
        const ord = bkOrder(), show = ord.slice(-BK_MAX);
        wrap.innerHTML = `<div class="bk-bin"><div class="bk-pile" id="bkPile">${show.map(bkCard).join('')}</div><div class="bk-front"><span>${B.list.length}장</span></div></div>`
            + `<div class="bk-tools"><button type="button" class="btn bk-mix" onclick="bkMix()">🔀 뒤적이기</button></div>` + note;
        bkPlace(show, false);
        bkWire();
    }
    /* 자리 잡기 : 기억한 자리 · 없으면 그 종이만의 자리 (바닥 쪽으로 몰려 쌓여요) */
    function bkPlace(show, anim) {
        const pile = bq('bkPile'); if (!pile) return;
        const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight;
        show.forEach((e, z) => {
            const c = pile.querySelector(`.bk-sh[data-id="${CSS.escape(e.id)}"]`); if (!c) return;
            const cw = c.offsetWidth || 90, ch = c.offsetHeight || 100;
            let p = L.p[e.id];
            if (!p) p = [bkRnd(e.id, 1), 1 - Math.pow(bkRnd(e.id, 2), 1.7) * .9, (bkRnd(e.id, 3) - .5) * 30];
            c.classList.toggle('anim', !!anim);
            c.style.left = Math.round(p[0] * Math.max(0, W - cw)) + 'px';
            c.style.top = Math.round(p[1] * Math.max(0, H - ch)) + 'px';
            c.style.setProperty('--r', p[2].toFixed(1) + 'deg');
            c.style.zIndex = z + 1;
        });
        B.top = show.length + 1;
    }
    /* 끌기 = 옆으로 치우기 (맨 위로) · 톡 = 그 종이 열기 */
    function bkWire() {
        const pile = bq('bkPile'); if (!pile) return;
        pile.onpointerdown = ev => {
            const c = ev.target.closest('.bk-sh'); if (!c || ev.button > 0) return;
            ev.preventDefault();
            const r = c.getBoundingClientRect(), pr = pile.getBoundingClientRect();
            B.drag = { c, id: c.dataset.id, x0: ev.clientX, y0: ev.clientY, ox: ev.clientX - r.left, oy: ev.clientY - r.top, pr, moved: false, pid: ev.pointerId };
            try { pile.setPointerCapture(ev.pointerId); } catch (e) {}
        };
        pile.onpointermove = ev => {
            const d = B.drag; if (!d || ev.pointerId !== d.pid) return;
            if (!d.moved && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 7) return;
            if (!d.moved) { d.moved = true; d.c.classList.remove('anim'); d.c.classList.add('lift'); d.c.style.zIndex = ++B.top; }
            const W = pile.clientWidth, H = pile.clientHeight, cw = d.c.offsetWidth, ch = d.c.offsetHeight;
            d.c.style.left = Math.max(-cw * .25, Math.min(W - cw * .75, ev.clientX - d.pr.left - d.ox)) + 'px';
            d.c.style.top = Math.max(-ch * .3, Math.min(H - ch * .6, ev.clientY - d.pr.top - d.oy)) + 'px';
        };
        const up = ev => {
            const d = B.drag; if (!d || (ev && ev.pointerId !== d.pid)) return;
            B.drag = null; d.c.classList.remove('lift');
            if (!d.moved) { if (ev && ev.type === 'pointerup') bkOpenSheet(d.id); return; }
            const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight, cw = d.c.offsetWidth, ch = d.c.offsetHeight;
            const rot = parseFloat(d.c.style.getPropertyValue('--r')) || 0;
            L.p[d.id] = [Math.max(0, Math.min(1, parseFloat(d.c.style.left) / Math.max(1, W - cw))), Math.max(0, Math.min(1, parseFloat(d.c.style.top) / Math.max(1, H - ch))), rot];
            L.o = bkOrder().map(e => e.id).filter(id => id !== d.id).concat(d.id);   // 치운 종이는 맨 위에
            bkLaySave();
        };
        pile.onpointerup = up; pile.onpointercancel = up;
    }
    /* 🔀 뒤적이기 : 아래 깔린 종이가 위로 올라오게 통째로 휘저어요 */
    function bkMix() {
        const L = bkLay(), ord = bkOrder().map(e => e.id);
        for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; }
        L.o = ord; L.p = {};
        ord.forEach(id => { L.p[id] = [Math.random(), 1 - Math.pow(Math.random(), 1.5) * .92, (Math.random() - .5) * 34]; });
        bkLaySave();
        const byId = new Map(B.list.map(e => [e.id, e])), show = ord.map(id => byId.get(id)).slice(-BK_MAX), pile = bq('bkPile');
        if (!pile) return;
        const have = new Set([...pile.querySelectorAll('.bk-sh')].map(c => c.dataset.id));
        if (show.some(e => !have.has(e.id))) { pile.innerHTML = show.map(bkCard).join(''); requestAnimationFrame(() => bkPlace(show, true)); }   // 아래 것이 올라왔어요
        else bkPlace(show, true);
        if (navigator.vibrate) try { navigator.vibrate([6, 40, 6]); } catch (e) {}
    }

    /* ---------- 🏷️ 종이 열기 : 하얀 떼는 창 (뗀 자리는 비어 있어요) ---------- */
    async function bkOpenSheet(id) {
        if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
        if (B.opening || !window.ownSheet) return;
        B.opening = id;
        const card = document.querySelector(`.bk-sh[data-id="${CSS.escape(id)}"]`); if (card) card.classList.add('busy');
        try {
            const r = await ownSheet(id);
            if (!r) { showMsg('이 스티커 종이는 이미 다 썼어요.<br><span style="font-size:12px;color:#777;">다른 기기에서 썼을 수도 있어요.</span>'); if (vis('basketModal')) bkRender(true); return; }
            let srcs = r.s.imgs;
            if (!r.s.baked && window.pelBake) srcs = await Promise.all(srcs.map(u => u ? pelBake(u).catch(() => u) : null));   // 기본스티커 : 하얀 테두리 (⚙ 설정을 따라요)
            if (window.stkLeave) stkLeave();
            const ok = window.openStickerPeel && await openStickerPeel(srcs, { own: { id, wh: r.s.wh }, ts: !!r.s.ts });
            if (!ok && window.stkReturn) stkReturn(300);
        } catch (e) {
            console.warn(e);
            showMsg('⚠ 스티커 종이를 열지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        } finally { B.opening = ''; if (card) card.classList.remove('busy'); }
    }
    if (window.ownOnChange) ownOnChange(() => { if (vis('basketModal')) bkRender(false); });

    /* ---------- 🏪 진열대 ---------- */
    const SH = { items: null, busy: false };
    const shFile = u => String(u).split('/').pop();
    function openShelf() {
        if (vis('stickerMakeModal')) closeModal('stickerMakeModal');
        if (vis('basketModal')) closeModal('basketModal');
        openModal('shelfModal');
        shRender();
    }
    async function shRender() {
        const box = bq('shWrap'); if (!box) return;
        if (SH.items && box.querySelector('.sh-row')) return;
        if (SH.busy) return;
        SH.busy = true;
        box.innerHTML = bkMsg('🏪 진열대를 채우는 중…');
        try {
            const kit = await basicKit(), M = (window.KIT_META && KIT_META.sets) || {};
            const items = [];
            kit.sheets.forEach(x => items.push({ us: x.us, c: x.c || '기본' }));
            kit.images.forEach(x => items.push({ us: [x.u], c: x.c || '기본' }));
            items.forEach(it => { const m = M[shFile(it.us[0])]; it.nm = (m && m.n) || ''; });
            SH.items = items;
            const cats = [...new Set(items.map(x => x.c))];
            box.innerHTML = cats.map(c => {
                const its = items.map((x, i) => [x, i]).filter(([x]) => x.c === c);
                return `<section class="sh-row"><h4 class="sh-sign"><span>${esc(window.kitName ? kitName(c) : c)}</span></h4><div class="sh-rack">${its.map(([x, i]) => shCard(x, i)).join('')}</div></section>`;
            }).join('') || bkMsg('진열대가 비어 있어요.');
        } catch (e) {
            SH.items = null;
            box.innerHTML = bkMsg('⚠ 진열대를 불러오지 못했어요.<br>인터넷 연결을 확인해 주세요.', '<button type="button" class="btn bk-again" onclick="shRetry()">🔄 다시 불러오기</button>');
        } finally { SH.busy = false; }
    }
    function shRetry() { SH.items = null; shRender(); }
    function shCard(x, i) {
        const n = x.us.length, cols = Math.ceil(Math.sqrt(n));
        return `<div class="sh-item"><div class="sh-paper${n === 1 ? ' one' : ''}"><i class="bk-grid" style="--c:${cols}">${x.us.map(u => `<img src="${esc(window.kitSize ? kitSize(u, 96) : u)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`).join('')}</i></div>`
            + `${x.nm ? `<b class="sh-tag">${esc(x.nm)}</b>` : ''}<small class="sh-cnt">씰 ${n}개</small>`
            + `<button type="button" class="sh-take" onclick="shTake(${i}, this)">🧺 받기</button></div>`;
    }
    async function shTake(i, btn) {
        const x = SH.items && SH.items[i]; if (!x || btn.disabled) return;
        if (!window.ownTakeKit || !ownMode()) { showMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 스티커를 받을 수 있어요.'); return; }
        btn.disabled = true; btn.classList.add('busy'); btn.textContent = '받는 중…';
        try {
            await ownTakeKit(x.us, x.nm);
            btn.classList.remove('busy'); btn.classList.add('got'); btn.textContent = '✓ 바구니에 쏙!';
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            setTimeout(() => { btn.classList.remove('got'); btn.textContent = '🧺 받기'; btn.disabled = false; }, 1400);
        } catch (e) {
            console.warn(e);
            btn.classList.remove('busy'); btn.textContent = '🧺 받기'; btn.disabled = false;
            showMsg('⚠ 스티커를 받지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        }
    }

    window.openBasket = openBasket; window.bkRender = bkRender; window.bkMix = bkMix; window.bkOpenSheet = bkOpenSheet;
    window.openShelf = openShelf; window.shTake = shTake; window.shRetry = shRetry;
})();
