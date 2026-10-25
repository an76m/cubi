/* 말랑달콤 다이어리 - js/basket.js
   🧺 내 바구니 · 🏪 진열대 (도련 10-25 · 유한 스티커 · 저장 · 쓰기는 js/own.js)
   - ✨ 스티커 창 → 🧺 내 바구니 : 종류 아이콘 8개 → 종류마다 바구니 하나 (도련 10-25 · 온갖 종류가 한데 섞이지 않게) · 위에서 내려다본 바구니
   - 바구니 안 : 받거나 만든 스티커 종이가 마구 쌓여요 (정리 · 카테고리 · 찾기 · 이름 없음 = 진짜 바구니처럼)
       · 종이는 살짝 기울고 겹쳐 쌓여요 · 새로 들어온 종이가 맨 위
       · 종이를 끌면 옆으로 치워져요(맨 위로) → 아래 깔린 종이를 찾아요 · 🔀 뒤적이기 = 통째로 휘저어 섞기
       · 종이를 톡 = 그 종이가 하얀 떼는 창으로 나와요 (뗀 자리는 비어 있어요 · js/stickerpeel.js) → 붙이면 그 칸은 영원히 사라져요
       · 다 쓴 종이는 바구니에서 사라져요 · 종이 자리 · 쌓인 순서는 이 기기에만 기억 (localStorage · 드라이브에 쓰지 않아요)
       · 화면에는 맨 위 BK_MAX 장만 그려요 (수백 장이어도 버벅이지 않게 · 🔀 뒤적이면 아래 것이 올라와요)
       · 나중에 🗂️ 바인더 · 바구니 · 라벨을 사서 정리하는 기능을 이 위에 얹어요 (도련 10-25)
   - ✨ 스티커 창 → 🏪 진열대 : 종류 아이콘 8개 → 그 종류의 진열대 창 (카테고리 · 이름 없이 · 새로 들어온 것이 맨 앞 · 도련 10-25)
       · 🔍 확대 = 그 스티커 전체 모습 + 아래 🧺 받기
       · [🧺 받기] = 그 스티커 종이를 새로 한 장 받아 바구니로 (공짜 · 몇 번이든 · 같은 스티커도 받을 때마다 새 종이 · 도련 10-25)
   - 모든 종류 (10-25) : 🏷️ 씰 · 😀 이모지(씰로 떼요) · 🧩 조각 · 📄 모조지 · 🎀 테이프 · 📝 메모지 · 🧻 떡메 · 📃 속지 (+ 🌸 계절 · 🎁 캡슐 선물)
       · 바구니 카드 모양 = 종류마다 (씰 종이 · 테이프 롤 · 떡메 묶음 · 메모지 묶음 · 속지 한 장 …) · 남은 양은 두께로만 보여요 (숫자 없이)
       · 종이를 톡 = 종류마다 원래 연출로 (씰 · 조각 봉투 · 모조지 · 떡메 묶음) / 테이프 · 메모지 · 속지는 페이지에 바로 놓여요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (스티커 창의 두 칸만 안 열려요) */

(function () {
    const bq = id => document.getElementById(id);
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const BK_LAY = 'malang_bk_lay', BK_MAX = 150;
    const B = { list: [], all: [], kind: '', opening: '', lay: null, drag: null, top: 0 };   // list = 지금 연 바구니(한 종류) · all = 모든 종이
    const BK_KINDS = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', tk: '떡메모지', leaf: '속지', emoji: '이모지', memo: '메모지' };
    const bkKindOf = e => e.b || (e.k === 'point' ? 'seal' : e.k);           // 들어갈 바구니 (😀 이모지는 b · 옛 포인트는 씰 · 🌸 계절 · 🎁 캡슐 = 씰)
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
        const L = bkLay(), ids = new Set(B.all.map(e => e.id));
        L.o = L.o.filter(id => ids.has(id)); Object.keys(L.p).forEach(id => { if (!ids.has(id)) delete L.p[id]; });   // 다 쓴 종이는 잊어요
        if (bkWho() === 'guest') return;
        try { const all = JSON.parse(localStorage.getItem(BK_LAY) || '{}') || {}; all[L.w] = { o: L.o, p: L.p }; localStorage.setItem(BK_LAY, JSON.stringify(all)); } catch (e) {}
    }
    /* 이 바구니의 쌓인 순서만 바꿔요 (다른 바구니 순서는 그대로) */
    function bkSetOrder(ord) { const L = bkLay(), mine = new Set(ord); L.o = L.o.filter(id => !mine.has(id)).concat(ord); }
    function bkRnd(id, n) { let h = 2166136261 ^ n; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 2246822507); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
    /* 쌓인 순서 : 끌었거나 뒤적인 것은 기억한 순서 · 나머지는 받은 순서 (새것이 위) */
    function bkOrder() {
        const L = bkLay(), byId = new Map(B.list.map(e => [e.id, e]));
        const known = L.o.filter(id => byId.has(id)), seen = new Set(known);
        const fresh = B.list.filter(e => !seen.has(e.id)).sort((a, b) => a.at - b.at).map(e => e.id);   // 처음 보는 종이 : 받은 때 순서대로 위에 쌓여요
        return known.concat(fresh).map(id => byId.get(id));
    }

    /* ---------- 🧺 내 바구니 ---------- */
    function openBasket() {                                                   // 첫 창 : 종류 아이콘 8개
        if (vis('stickerMakeModal')) closeModal('stickerMakeModal');
        if (vis('basketKindModal')) closeModal('basketKindModal');
        openModal('basketModal');
    }
    function bkOpenKind(k) {                                                  // 그 종류의 바구니
        if (!BK_KINDS[k]) return;
        B.kind = k;
        if (vis('basketModal')) closeModal('basketModal');
        const t = bq('bkTitle'); if (t) t.textContent = '🧺 ' + BK_KINDS[k];
        const w = bq('bkWrap'); if (w) w.innerHTML = '';
        openModal('basketKindModal');
        bkRender(true);
    }
    function bkReopen() { if (B.kind) bkOpenKind(B.kind); else openBasket(); }   // 떼는 창이 닫히면 보던 바구니로
    const bkMsg = (h, btn) => `<div class="bk-msg">${h}${btn || ''}</div>`;
    async function bkRender(force) {
        const wrap = bq('bkWrap'); if (!wrap) return;
        if (!window.ownList) { wrap.innerHTML = bkMsg('🧺 바구니를 준비하고 있어요.'); return; }
        if (!ownMode()) { wrap.innerHTML = bkMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 바구니를 쓸 수 있어요.'); return; }
        if (!wrap.querySelector('.bk-bin')) wrap.innerHTML = bkMsg('🧺 바구니를 여는 중…');
        try { B.all = (await ownList(force)).slice(); B.list = B.all.filter(e => bkKindOf(e) === B.kind); }
        catch (e) { wrap.innerHTML = bkMsg('⚠ 바구니를 열지 못했어요.<br>' + ownErrText(e), '<button type="button" class="btn bk-again" onclick="bkRender(true)">🔄 다시 열기</button>'); return; }
        bkDraw();
    }
    /* 바구니 카드 : 종류마다 모양 · 남은 양은 두께(--q)로만 */
    const kitImg = u => `<img src="${esc(window.kitSize ? kitSize(u, 96) : u)}" alt="" loading="lazy" draggable="false" onerror="this.style.visibility='hidden'">`;
    function bkCard(e) {
        const used = new Set(e.u), cols = Math.ceil(Math.sqrt(e.n)), x = e.x || {}, q = e.q0 ? Math.max(.08, e.q / e.q0) : 1;
        let inner, cls = 'k-' + e.k;
        if (e.k === 'tape') inner = `<span class="bk-roll" style="--q:${q.toFixed(2)}"><i style="background-image:url(&quot;${esc(e.th || '')}&quot;)"></i></span>`;
        else if (e.k === 'tk') inner = `<span class="bk-pad" style="--q:${q.toFixed(2)}">${window.tkMiniHtml ? tkMiniHtml(x.pad || 'memo', x.pad === 'my' ? { src: e.th, glue: x.glue || '' } : null) : ''}</span>`;
        else if (e.k === 'memo') inner = `<span class="bk-pad bk-memo" style="--q:${q.toFixed(2)}">${x.pp && x.pp !== 'img' ? `<span class="pp-chip pp-${esc(x.pp)}"></span>` : `<img src="${esc(e.th || '')}" alt="" draggable="false">`}</span>`;
        else if (e.k === 'leaf') inner = `<span class="lf-pick bk-leaf"><i class="lf-sw ${x.lf && x.lf !== 'my' ? 'lf-' + esc(x.lf) : 'lf-my'}"${!x.lf || x.lf === 'my' ? ` style="--lf-img:url('${esc(e.th || '')}')"` : ''}></i></span>`;
        else if (e.th) inner = `<img src="${esc(e.th)}" alt="" draggable="false">`;
        else inner = `<i class="bk-grid" style="--c:${cols}">${(e.us || []).map((u, i) => used.has(i) ? '<b class="bk-hole"></b>' : kitImg(u)).join('')}</i>`;
        return `<button type="button" class="bk-sh ${cls}${e.n === 1 && !e.q0 ? ' one' : ''}" data-id="${esc(e.id)}" aria-label="${esc(KIND_NAME[e.k] || '스티커')}">${inner}</button>`;
    }
    const KIND_NAME = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', memo: '메모지', tk: '떡메모지', leaf: '속지' };
    function bkDraw() {
        const wrap = bq('bkWrap'); if (!wrap) return;
        const guest = ownMode() === 'mem';
        const note = `<p class="bk-note">${guest ? '👀 구경만 할 때는 창을 닫거나 새로고침하면 바구니도 비워져요.' : '🔥 받은 · 만든 스티커는 내 드라이브 <b>말랑달콤</b> 폴더에 보관돼요. 폴더를 지우면 모두 사라지고 되돌릴 수 없어요.'}</p>`;
        if (!B.list.length) {
            wrap.innerHTML = `<div class="bk-bin empty"><div class="bk-pile"></div></div>`
                + bkMsg(`${esc(BK_KINDS[B.kind] || '')} 바구니가 비어 있어요.<br>🏪 진열대에서 받아 오거나<br>✂️ 나만의 스티커를 만들어 보세요!`) + note;
            return;
        }
        const ord = bkOrder(), show = ord.slice(-BK_MAX);
        wrap.innerHTML = `<div class="bk-bin"><div class="bk-pile" id="bkPile">${show.map(bkCard).join('')}</div><span class="bk-tag">${B.list.length}장</span></div>`
            + `<div class="bk-tools"><button type="button" class="btn bk-mix" onclick="bkMix()">🔀 뒤적이기</button></div>` + note;
        bkPlace(show, false);
        bkWire();
        let t = 0; const again = () => { clearTimeout(t); t = setTimeout(() => bkPlace(show, false), 60); };   // 그림이 늦게 오면 크기가 바뀌어요 → 다시 자리 잡기 (바구니 밖으로 안 삐져나오게)
        wrap.querySelectorAll('#bkPile img').forEach(im => { if (!im.complete) im.addEventListener('load', again, { once: true }); });
    }
    /* 자리 잡기 : 기억한 자리 · 없으면 그 종이만의 자리 (위에서 내려다본 바구니 · 바닥 전체에 흩어져요) */
    function bkPlace(show, anim) {
        const pile = bq('bkPile'); if (!pile) return;
        const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight;
        show.forEach((e, z) => {
            const c = pile.querySelector(`.bk-sh[data-id="${CSS.escape(e.id)}"]`); if (!c) return;
            const cw = c.offsetWidth || 90, ch = c.offsetHeight || 100;
            let p = L.p[e.id];
            if (!p) p = [bkRnd(e.id, 1), bkRnd(e.id, 2), (bkRnd(e.id, 3) - .5) * 30];
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
            bkSetOrder(bkOrder().map(e => e.id).filter(id => id !== d.id).concat(d.id));   // 치운 종이는 맨 위에
            bkLaySave();
        };
        pile.onpointerup = up; pile.onpointercancel = up;
    }
    /* 🔀 뒤적이기 : 아래 깔린 종이가 위로 올라오게 통째로 휘저어요 */
    function bkMix() {
        const L = bkLay(), ord = bkOrder().map(e => e.id);
        for (let i = ord.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; }
        bkSetOrder(ord);
        ord.forEach(id => { L.p[id] = [Math.random(), Math.random(), (Math.random() - .5) * 34]; });
        bkLaySave();
        const byId = new Map(B.list.map(e => [e.id, e])), show = ord.map(id => byId.get(id)).slice(-BK_MAX), pile = bq('bkPile');
        if (!pile) return;
        const have = new Set([...pile.querySelectorAll('.bk-sh')].map(c => c.dataset.id));
        if (show.some(e => !have.has(e.id))) { pile.innerHTML = show.map(bkCard).join(''); requestAnimationFrame(() => bkPlace(show, true)); }   // 아래 것이 올라왔어요
        else bkPlace(show, true);
        if (navigator.vibrate) try { navigator.vibrate([6, 40, 6]); } catch (e) {}
    }

    /* ---------- 종이 열기 : 종류마다 원래 연출로 (뗀 자리 · 쓴 양은 이미 빠져 있어요) ---------- */
    async function bkOpenSheet(id) {
        if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
        if (B.opening || !window.ownSheet) return;
        B.opening = id;
        const card = document.querySelector(`.bk-sh[data-id="${CSS.escape(id)}"]`); if (card) card.classList.add('busy');
        try {
            const r = await ownSheet(id);
            if (!r) { showMsg('이 스티커는 이미 다 썼어요.<br><span style="font-size:12px;color:#777;">다른 기기에서 썼을 수도 있어요.</span>'); if (vis('basketKindModal')) bkRender(true); return; }
            const s = r.s, x = s.x || {}, own = { id, wh: s.wh };
            const die = async a => !s.baked && window.pelBake ? Promise.all(a.map(u => u ? pelBake(u).catch(() => u) : null)) : a;   // 하얀 테두리 (⚙ 설정을 따라요)
            let ok = false;
            if (s.k === 'seal') { const srcs = await die(s.imgs); if (window.stkLeave) stkLeave(); ok = window.openStickerPeel && await openStickerPeel(srcs, { own, ts: !!s.ts }); }
            else if (s.k === 'piece') {
                const slots = s.imgs.map((u, i) => u ? i : -1).filter(i => i >= 0), srcs = await die(slots.map(i => s.imgs[i]));
                if (window.stkLeave) stkLeave();
                ok = window.openPieceBag && await openPieceBag(srcs, { t: s.nm || '말랑달콤 조각', s: '', own: { id, slots } });
            }
            else if (s.k === 'paper') { if (window.stkLeave) stkLeave(); ok = window.openPaperSheet && await openPaperSheet(s.imgs[0], { own: { id, a0: x.a0 }, bg: !!x.bg, grained: !!x.grained }); }
            else if (s.k === 'tape') { if (!window.placeTape) return; ok = placeTape(s.imgs[0], { id }); }   // 페이지에 바로 · 비켰다 다시 떠요 (stkBlink)
            else if (s.k === 'tk') { if (!window.tkOwnOpen) return; if (window.stkLeave) stkLeave(); tkOwnOpen(x.pad || 'memo', x.pad === 'my' ? { src: s.imgs[0], glue: x.glue || '' } : null, { id }); ok = true; }
            else if (s.k === 'memo') ok = bkMemo(id, s, x);
            else if (s.k === 'leaf') ok = bkLeaf(id, s, x);
            if (!ok && window.stkReturn) stkReturn(300);
        } catch (e) {
            console.warn(e);
            showMsg('⚠ 스티커를 열지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        } finally { B.opening = ''; if (card) card.classList.remove('busy'); }
    }
    /* 📝 메모지 한 장 : 페이지에 바로 놓여요 → 톡 해서 글쓰기 */
    function bkMemo(id, s, x) {
        if (typeof addText !== 'function') return false;
        addText();
        const el = typeof selectedElement !== 'undefined' ? selectedElement : null; if (!el) return false;
        if (x.pp === 'img' && window.tkNoteDress) { tkNoteDress(el, 'my', s.imgs[0]); el.style.width = '180px'; el.style.height = Math.round(180 * (x.h || 1) / (x.w || 1)) + 'px'; }
        else if (window.applyPaper) applyPaper(x.pp);
        el.dataset.own = id;
        if (typeof saveData === 'function') saveData(false);
        ownQty(id, 1, el).catch(er => console.warn('메모지를 아직 못 줄였어요 (다시 해요) :', er));
        if (window.stkBlink) stkBlink();
        return true;
    }
    /* 📃 속지 한 장 : 오늘 페이지에 끼우면 그 한 장은 끝 (같은 속지가 이미 깔려 있으면 쓰지 않아요) */
    function bkLeaf(id, s, x) {
        if (!window.pickLeaf) return false;
        const lf = x.lf && x.lf !== 'my' ? x.lf : 'my', img = lf === 'my' ? s.imgs[0] : undefined;
        if (typeof pageLeaf !== 'undefined' && pageLeaf === lf && (lf !== 'my' || pageLeafImg === img)) { showMsg('📃 오늘 페이지에 이미 깔린 속지예요.'); return false; }
        if (window.stkBlink) stkBlink();
        pickLeaf(lf, img);
        ownQty(id, 1, null).catch(er => console.warn('속지를 아직 못 지웠어요 (다시 해요) :', er));
        return true;
    }
    if (window.ownOnChange) ownOnChange(() => { if (vis('basketKindModal')) bkRender(false); });

    /* ---------- 🏪 진열대 (도련 10-25) : 아이콘 8개 → 그 종류의 진열대 창 → 🔍 확대 → 🧺 받기
       카테고리 · 스티커 이름 없이 (현실 문구점도 그렇게 팔아요) · 새로 들어온 것이 맨 앞 · 📄 모조지만 '모양 · 배경' 두 매대 ---------- */
    const SH = { kind: '', items: [], zoom: -1, seq: 0 };
    const kitThumb = (u, w) => window.kitSize ? kitSize(u, w) : u;
    /* 종류 : [아이콘 이름, 창 이름, 상품 만들기] (진열대 첫 창의 아이콘 순서 = 이 순서) */
    const SH_KINDS = {
        seal: ['씰스티커', async () => {
            const kit = await basicKit(), out = [];
            kit.sheets.slice().reverse().forEach(x => out.push(x.us));               // 새로 들어온 것(뒤 번호)이 맨 앞
            kit.images.slice().reverse().forEach(x => out.push([x.u]));              // 낱장
            const items = out.map(us => ({ cnt: `씰 ${us.length}개`, look: 'grid', thumbs: us.map(u => kitThumb(u, 96)), bigs: us.map(u => kitThumb(u, 360)), take: () => ownTakeKit(us, '') }));
            for (const p of (window.spkPackList ? spkPackList() : [])) { const srcs = await p.srcs(); items.push({ cnt: `씰 ${srcs.length}개`, look: 'grid', thumbs: srcs, def: { k: 'seal', imgs: srcs, baked: true } }); }   // 제가 그린 씰 종이 (예전 포인트스티커 · js/stickerpack.js)
            return items.concat(window.sbShelf ? await sbShelf('mini') : []);         // 옛 포인트스티커 폴더 그림도 씰로
        }],
        piece: ['조각스티커', async () => window.sbShelf ? sbShelf('piece') : []],
        paper: ['모조지스티커', async () => window.sbShelf ? sbShelf('paper') : []],
        tape: ['마스킹테이프', async () => (window.sbShelf ? await sbShelf('tape') : []).concat((window.tapeShelf ? tapeShelf() : []).map(t => ({ cnt: '한 롤', look: 'tape', thumbs: [t.url], def: { k: 'tape', imgs: [t.url], th: t.url } })))],
        tk: ['떡메모지', async () => (window.sbShelf ? await sbShelf('tk') : []).concat((window.tkShelf ? tkShelf() : []).map(t => ({ cnt: `${OWN_Q.tk}장`, look: 'tk', pad: t.k, def: { k: 'tk', imgs: [''], x: { pad: t.k }, noTh: true } })))],
        leaf: ['속지', async () => (window.sbShelf ? await sbShelf('leaf') : []).concat((window.leafShelf ? leafShelf() : []).map(l => ({ cnt: '한 장', look: 'leaf', lf: l.k, def: { k: 'leaf', imgs: [''], x: { lf: l.k }, noTh: true } })))],
        emoji: ['이모지', async () => {
            if (typeof emojiRanges === 'undefined') return [];
            return Object.keys(emojiRanges).map(c => {
                const chars = []; for (const [a, b] of emojiRanges[c]) for (let i = a; i <= b && chars.length < 16; i++) chars.push(String.fromCodePoint(i));
                return { cnt: `씰 ${chars.length}개`, look: 'emoji', chars, take: async () => ({ k: 'seal', b: 'emoji', imgs: await Promise.all(chars.map(shEmoji)), baked: true }) };
            });
        }],
        memo: ['메모지', async () => (window.sbShelf ? await sbShelf('memo') : []).concat((window.memoShelf ? memoShelf() : []).map(p => ({ cnt: `${OWN_Q.memo}장`, look: 'memo', pp: p.id, def: { k: 'memo', imgs: [''], x: { pp: p.id }, noTh: true } })))],
        season: ['계절 스티커', async () => {                                    // 🌸 이벤트 때만 (SEASON_OPEN · 아이콘도 그때만)
            if (!shSeasonOn()) return [];
            const k = seasonNow(), srcs = (SEASON_STICKERS[k] || []).map(x => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(x.svg));
            return srcs.length ? [{ cnt: `씰 ${srcs.length}개`, look: 'grid', thumbs: srcs, def: { k: 'seal', imgs: srcs, baked: true } }] : [];
        }],
    };
    const shSeasonOn = () => typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN && typeof SEASON_STICKERS !== 'undefined';
    /* 😀 이모지 → 그림 (64px · 작게 콕) */
    function shEmoji(ch) {
        const c = document.createElement('canvas'); c.width = c.height = 64;
        const x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '50px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        x.fillText(ch, 32, 35);
        const u = c.toDataURL('image/png');
        return window.pelBake ? pelBake(u).catch(() => u) : u;
    }
    /* 진열대 첫 창 : 종류 아이콘 (🌸 계절은 이벤트 때만) */
    function openShelf() {
        if (vis('stickerMakeModal')) closeModal('stickerMakeModal');
        if (vis('basketModal')) closeModal('basketModal');
        if (vis('basketKindModal')) closeModal('basketKindModal');
        if (vis('shelfKindModal')) closeModal('shelfKindModal');
        const se = document.querySelector('#shelfModal [data-shk="season"]'); if (se) se.hidden = !shSeasonOn();
        openModal('shelfModal');
    }
    /* 그 종류의 진열대 창 */
    async function shOpenKind(k) {
        const K = SH_KINDS[k]; if (!K) return;
        closeModal('shelfModal'); openModal('shelfKindModal');
        const t = bq('shkTitle'); if (t) t.textContent = '🏪 ' + K[0];
        const box = bq('shkWrap'); SH.kind = k; SH.items = []; shZoomOff();
        const seq = ++SH.seq;
        box.innerHTML = bkMsg('진열대를 채우는 중…'); box.scrollTop = 0;
        let items = [];
        try { items = await K[1](); } catch (e) { console.warn(e); if (seq === SH.seq) box.innerHTML = bkMsg('⚠ 진열대를 불러오지 못했어요.<br>인터넷 연결을 확인해 주세요.', `<button type="button" class="btn bk-again" onclick="shOpenKind('${k}')">🔄 다시 불러오기</button>`); return; }
        if (seq !== SH.seq) return;                                              // 그사이 다른 종류를 열었어요
        SH.items = items;
        if (!items.length) { box.innerHTML = bkMsg('아직 진열된 스티커가 없어요.'); return; }
        const secs = k === 'paper' ? ['모양', '배경'] : [''];
        box.innerHTML = secs.map(sec => {
            const its = items.map((x, i) => [x, i]).filter(([x]) => !sec || (x.sec || '모양') === sec); if (!its.length) return '';
            return (sec ? `<h4 class="sh-sign"><span>${sec === '배경' ? '📄 배경 (통째로 떼기)' : '✂️ 모양 (가위로 오리기)'}</span></h4>` : '') + `<div class="sh-grid">${its.map(([x, i]) => shCard(x, i)).join('')}</div>`;
        }).join('');
    }
    function shLook(x, big) {
        const src = big && x.bigs ? x.bigs : x.thumbs, n = (src || x.chars || []).length, cols = Math.ceil(Math.sqrt(Math.max(1, n)));
        if (x.look === 'emoji') return `<div class="sh-paper"><i class="bk-grid sh-emo" style="--c:${cols}">${x.chars.map(ch => `<b>${ch}</b>`).join('')}</i></div>`;
        if (x.look === 'tape') return `<div class="sh-tape"><i style="background-image:url(&quot;${esc(src[0])}&quot;)"></i></div>`;
        if (x.look === 'tk') return `<div class="sh-pad">${window.tkMiniHtml ? tkMiniHtml(x.pad) : ''}</div>`;
        if (x.look === 'tkimg') return `<div class="sh-pad">${window.tkMiniHtml ? tkMiniHtml('my', { src: src[0] }) : ''}</div>`;
        if (x.look === 'leaf') return `<span class="lf-pick sh-leaf"><i class="lf-sw lf-${esc(x.lf)}"></i></span>`;
        if (x.look === 'leafimg') return `<span class="lf-pick sh-leaf"><i class="lf-sw lf-my" style="--lf-img:url('${esc(src[0])}')"></i></span>`;
        if (x.look === 'memo') return `<div class="sh-memo"><span class="pp-chip pp-${esc(x.pp)}"></span></div>`;
        if (x.look === 'memoimg' || x.look === 'sheet') return `<div class="sh-paper one"><img src="${esc(src[0])}" alt="" loading="lazy"></div>`;
        return `<div class="sh-paper${n === 1 ? ' one' : ''}"><i class="bk-grid" style="--c:${cols}">${src.map(u => `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`).join('')}</i></div>`;
    }
    function shCard(x, i) {
        return `<div class="sh-item"><button type="button" class="sh-look" onclick="shZoom(${i})" aria-label="확대">${shLook(x)}</button><small class="sh-cnt">${esc(x.cnt || '')}</small>`
            + `<button type="button" class="sh-take" onclick="shZoom(${i})">🔍 확대</button></div>`;
    }
    /* 🔍 확대 : 그 스티커 전체 모습 + 아래 🧺 받기 (진열대 창 안에 겹쳐 떠요 · 창이 하나라는 규칙 그대로) */
    function shZoom(i) {
        const x = SH.items[i], z = bq('shZoom'); if (!x || !z) return;
        SH.zoom = i;
        z.innerHTML = `<div class="sh-zcard"><div class="sh-zlook k-${esc(SH.kind)}">${shLook(x, true)}</div><small class="sh-cnt">${esc(x.cnt || '')}</small>`
            + `<div class="sh-zbtns"><button type="button" class="sh-take sh-zget" onclick="shTake(this)">🧺 받기</button><button type="button" class="btn" onclick="shZoomOff()">닫기</button></div></div>`;
        z.hidden = false;
    }
    function shZoomOff() { const z = bq('shZoom'); if (z) { z.hidden = true; z.innerHTML = ''; } SH.zoom = -1; }
    async function shTake(btn) {
        const x = SH.items[SH.zoom]; if (!x || btn.disabled) return;
        if (!window.ownTake || !ownMode()) { showMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 스티커를 받을 수 있어요.'); return; }
        btn.disabled = true; btn.classList.add('busy'); btn.textContent = '받는 중…';
        try {
            if (x.def) await ownTake(x.def);
            else { const r = await x.take(); if (r && typeof r === 'object') await ownTake(r); }   // take() : 새 종이 id(씰) 또는 종이 정보
            btn.classList.remove('busy'); btn.classList.add('got'); btn.textContent = '✓ 바구니에 쏙!';
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            setTimeout(() => { btn.classList.remove('got'); btn.textContent = '🧺 받기'; btn.disabled = false; }, 1400);
        } catch (e) {
            console.warn(e);
            btn.classList.remove('busy'); btn.textContent = '🧺 받기'; btn.disabled = false;
            showMsg('⚠ 스티커를 받지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        }
    }

    window.openBasket = openBasket; window.bkOpenKind = bkOpenKind; window.bkReopen = bkReopen; window.bkRender = bkRender; window.bkMix = bkMix; window.bkOpenSheet = bkOpenSheet;
    window.openShelf = openShelf; window.shOpenKind = shOpenKind; window.shZoom = shZoom; window.shZoomOff = shZoomOff; window.shTake = shTake;
})();
