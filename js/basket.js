/* 말랑달콤 다이어리 - js/basket.js
   🧺 내 바구니 · 🏪 진열대 (도련 10-25 · 유한 스티커 · 저장 · 쓰기는 js/own.js)
   - ✨ 스티커 창 → 🧺 내 바구니 : 종류 아이콘 8개 → 종류마다 바구니 하나 (도련 10-25 · 온갖 종류가 한데 섞이지 않게) · 위에서 내려다본 바구니
   - 바구니 안 : 받거나 만든 스티커 종이가 마구 쌓여요 (정리 · 카테고리 · 찾기 · 이름 없음 = 진짜 바구니처럼)
       · 종이는 살짝 기울고 겹쳐 쌓여요 · 새로 들어온 종이가 맨 위
       · 종이를 끌면 옆으로 치워져요(맨 위로) → 아래 깔린 종이를 찾아요 (🔀 뒤적이기는 도련 10-25 지움)
       · 종이를 톡 = 그 종이가 하얀 떼는 창으로 나와요 (뗀 자리는 비어 있어요 · js/stickerpeel.js) → 붙이면 그 칸은 영원히 사라져요
       · 다 쓴 종이는 바구니에서 사라져요 · 종이 자리 · 쌓인 순서는 이 기기에만 기억 (localStorage · 드라이브에 쓰지 않아요)
       · 화면에는 맨 위 BK_MAX 장만 그려요 (수백 장이어도 버벅이지 않게)
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
    const B = { list: [], all: [], kind: '', view: 'bin', cur: '', pg: 0, desk: null, album: null, byId: new Map(), opening: '', lay: null, drag: null, top: 0 };   // list = 지금 연 바구니(한 종류) · all = 모든 종이
    const BK_KINDS = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', tk: '떡메모지', leaf: '속지', emoji: '이모지', memo: '메모지' };
    const bkKindOf = e => e.b || e.k;                                        // 들어갈 바구니 (😀 이모지는 b · 🌸 계절 · 🎁 캡슐 = 씰)
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
        if (vis('basketKindModal')) closeModal('basketKindModal');
        openModal('basketModal');
    }
    function bkOpenKind(k, keep) {                                            // 그 종류의 창 (🧺 바구니 · 📒 스티커첩)
        if (!BK_KINDS[k]) return;
        if (B.kind !== k || !keep) { B.view = 'bin'; B.cur = ''; B.pg = 0; B.desk = null; }   // keep : 떼는 창에서 돌아올 때 보던 화면 그대로
        B.kind = k;
        if (vis('basketModal')) closeModal('basketModal');
        const t = bq('bkTitle'); if (t) t.textContent = '🗄️ ' + BK_KINDS[k];
        const w = bq('bkWrap'); if (w) w.innerHTML = '';
        openModal('basketKindModal');
        bkRender(true);
    }
    function bkReopen() { if (B.kind) bkOpenKind(B.kind, true); else openBasket(); }   // 떼는 창이 닫히면 보던 바구니로
    const bkMsg = (h, btn) => `<div class="bk-msg">${h}${btn || ''}</div>`;
    async function bkRender(force) {
        const wrap = bq('bkWrap'); if (!wrap) return;
        if (!window.ownList) { wrap.innerHTML = bkMsg('🧺 바구니를 준비하고 있어요.'); return; }
        if (!ownMode()) { wrap.innerHTML = bkMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 바구니를 쓸 수 있어요.'); return; }
        /* ⚡ 먼저 : 마지막으로 읽은 목록으로 바로 그려요 (드라이브를 기다리지 않게) → 그다음 새로 읽어 달라졌을 때만 다시 그려요 */
        const peek = force && window.ownPeek ? ownPeek() : null;
        if (peek) { B.all = peek.list.slice(); B.album = JSON.parse(JSON.stringify(peek.album)); abReapply(); abSplit(); B.sig = bkSig(); if (!B.drag && !AB.drag) bkView(); }
        else if (!wrap.querySelector('.ab-tabs, .ab-head, .ab-body')) wrap.innerHTML = bkMsg('🧺 바구니를 여는 중…');
        try {
            const got = window.ownOpen ? await ownOpen(force) : { list: await ownList(force), album: { bd: [], rl: [], g: {} } };   // 목록 · 스티커첩을 동시에
            B.all = got.list.slice();
            B.album = JSON.parse(JSON.stringify(got.album));
            abReapply();                                                        // 아직 저장 안 된 정리는 그 위에 다시 (화면이 되돌아가지 않게)
        }
        catch (e) {
            if (peek) { console.warn(e); return; }                              // 보던 목록은 그대로 두어요
            wrap.innerHTML = bkMsg('⚠ 바구니를 열지 못했어요.<br>' + ownErrText(e), '<button type="button" class="btn bk-again" onclick="bkRender(true)">🔄 다시 열기</button>'); return;
        }
        const sig = bkSig();
        if (sig === B.sig && wrap.querySelector('.ab-body')) return;            // 그대로면 다시 그리지 않아요 (깜빡이지 않게)
        B.sig = sig;
        abSplit();
        if (B.drag || AB.drag) return;                                          // 끄는 중에는 다시 그리지 않아요 (놓으면 그려요)
        bkView();
    }
    const bkSig = () => { try { return JSON.stringify([B.all.map(e => [e.id, e.u, e.q, e.th ? e.th.length : 0]), B.album]); } catch (e) { return String(Math.random()); } };
    /* (바구니 미리 읽기 bkWarm 도 지웠어요 · 도련 10-25 → 처음 열 때 한 번 읽고, 그다음부터는 기억한 목록으로 바로 그려요) */
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
    /* 바구니 꼬리표 : 무엇이 몇 개 (도련 10-25 · '5장'만으로는 헷갈려요) */
    function bkCount(n) {
        const u = { tape: ['테이프', '롤'], tk: ['떡메', '묶음'], memo: ['메모지', '묶음'], leaf: ['속지', '장'] }[B.kind] || ['스티커', '장'];
        return `${u[0]} ${n}${u[1]}`;
    }
    function bkDraw() {
        const wrap = bq('abBody'); if (!wrap) return;
        const guest = ownMode() === 'mem';
        const note = `<p class="bk-note">${guest ? '👀 구경만 할 때는 창을 닫거나 새로고침하면 바구니도 비워져요.' : '🔥 받은 · 만든 스티커는 내 드라이브 <b>말랑달콤</b> 폴더에 보관돼요. 폴더를 지우면 모두 사라지고 되돌릴 수 없어요.'}</p>`;
        if (!B.list.length) {
            wrap.innerHTML = `<div class="bk-bin empty"><div class="bk-pile"></div><button type="button" class="bk-say" onclick="bkGlowGet()"><b>🧺 스티커 바구니가 텅 비었어요</b><span>아래 <em>기본${esc(BK_KINDS[B.kind] || '스티커')} 받기</em>로<br>받아서 채워요</span></button></div>`
                + bkTools(false) + note;
            return;
        }
        const ord = bkOrder(), show = ord.slice(-BK_MAX);
        wrap.innerHTML = `<div class="bk-bin"><div class="bk-pile" id="bkPile">${show.map(bkCard).join('')}</div><span class="bk-tag">${bkCount(B.list.length)}</span></div>`
            + bkTools(true) + note;
        bkPlace(show, false);
        bkWire();
        let t = 0; const again = () => { clearTimeout(t); t = setTimeout(() => bkPlace(show, false), 60); };   // 그림이 늦게 오면 크기가 바뀌어요 → 다시 자리 잡기 (바구니 밖으로 안 삐져나오게)
        wrap.querySelectorAll('#bkPile img').forEach(im => { if (!im.complete) im.addEventListener('load', again, { once: true }); });
    }
    /* 아래 버튼 : 📒 정리하기 (스티커가 있을 때) · 🏪 기본스티커 받기 (늘) — 둘 다 평범하게 (도련 10-26 · 처음 쓰는 사람이 '받아야 한다'를 알게) */
    const bkTools = has => `<div class="bk-tools bk-tools2">${has ? '<button type="button" class="btn bk-act" onclick="abDesk()">📒 바구니스티커 정리하기</button>' : ''}<button type="button" class="btn bk-act" id="bkGet" onclick="bkGetKind()">🏪 기본${esc(BK_KINDS[B.kind] || '스티커')} 받기</button></div>`;   // 그 종류 진열대로 바로 (도련 10-26 · 진열대 첫 화면을 거치지 않게)
    function bkGetKind() { const k = B.kind; if (vis('basketKindModal')) closeModal('basketKindModal'); if (SH_KINDS[k]) shOpenKind(k); else openShelf(); }
    function bkGlowGet() {                                                   // 빈 바구니 안내를 누르면 → 받기 버튼이 붉게 반짝
        const b = bq('bkGet'); if (!b) return;
        b.classList.remove('glow'); void b.offsetWidth; b.classList.add('glow');
        b.addEventListener('animationend', () => b.classList.remove('glow'), { once: true });
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
            const d0 = B.drag; d0.hold = setTimeout(() => { if (B.drag !== d0 || d0.moved) return; B.drag = null; dsTake(d0.id); }, 450);   // 오래 누르기 = 꺼내기
        };
        pile.onpointermove = ev => {
            const d = B.drag; if (!d || ev.pointerId !== d.pid) return;
            if (!d.moved && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 7) return;
            if (!d.moved) { d.moved = true; clearTimeout(d.hold); d.c.classList.remove('anim'); d.c.classList.add('lift'); d.c.style.zIndex = ++B.top; }
            const bin = pile.closest('.bk-bin'), br = bin && bin.getBoundingClientRect();
            if (!d.desk && br && (ev.clientX < br.left || ev.clientX > br.right || ev.clientY < br.top || ev.clientY > br.bottom)) {   // 바구니 밖으로 끌어내면 = 그 종이가 페이지 위 스티커창으로 (바구니 창은 그대로)
                d.desk = dsTake(d.id, { x: ev.clientX, y: ev.clientY }, true); d.c.style.visibility = 'hidden';
            }
            if (d.desk) { dsMove(d.desk, ev.clientX, ev.clientY); return; }
            const W = pile.clientWidth, H = pile.clientHeight, cw = d.c.offsetWidth, ch = d.c.offsetHeight;
            d.c.style.left = Math.max(-cw * .25, Math.min(W - cw * .75, ev.clientX - d.pr.left - d.ox)) + 'px';
            d.c.style.top = Math.max(-ch * .3, Math.min(H - ch * .6, ev.clientY - d.pr.top - d.oy)) + 'px';
        };
        const up = ev => {
            const d = B.drag; if (!d || (ev && ev.pointerId !== d.pid)) return;
            B.drag = null; d.c.classList.remove('lift'); clearTimeout(d.hold);
            if (d.desk) { abSplit(); B.sig = bkSig(); bkDraw(); return; }       // 꺼낸 종이는 바구니에서 빠져요
            if (!d.moved) { if (ev && ev.type === 'pointerup') dsTake(d.id); return; }   // 톡 = 꺼내기 (도련 10-26 · 바구니는 잠깐 비켰다 다시 떠요)
            const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight, cw = d.c.offsetWidth, ch = d.c.offsetHeight;
            const rot = parseFloat(d.c.style.getPropertyValue('--r')) || 0;
            L.p[d.id] = [Math.max(0, Math.min(1, parseFloat(d.c.style.left) / Math.max(1, W - cw))), Math.max(0, Math.min(1, parseFloat(d.c.style.top) / Math.max(1, H - ch))), rot];
            bkSetOrder(bkOrder().map(e => e.id).filter(id => id !== d.id).concat(d.id));   // 치운 종이는 맨 위에
            bkLaySave();
        };
        pile.onpointerup = up; pile.onpointercancel = up;
    }
    /* ---------- 종이 열기 : 종류마다 원래 연출로 (뗀 자리 · 쓴 양은 이미 빠져 있어요) ---------- */
    async function bkOpenSheet(id) {
        if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
        if (B.opening || !window.ownSheet) return;
        B.opening = id;
        const card = document.querySelector(`.bk-sh[data-id="${CSS.escape(id)}"]`); if (card) card.classList.add('busy');
        try {
            const c = DS.m.has(id) ? await dsPrep(id).catch(() => null) : null;   // ⚡ 꺼내 둔 종이는 미리 읽어 둔 것으로 바로 (도련 10-26 · A → B 바꾸기 빠르게)
            const r = c ? { s: c.s } : await ownSheet(id);
            if (!r) { showMsg('이 스티커는 이미 다 썼어요.<br><span style="font-size:12px;color:#777;">다른 기기에서 썼을 수도 있어요.</span>'); if (vis('basketKindModal')) bkRender(true); return; }
            const s = r.s, x = s.x || {}, own = { id, wh: s.wh };
            const die = async a => c && c.baked ? a.map(u => u == null ? null : (c.baked[s.imgs.indexOf(u)] || u)) : !s.baked && window.pelBake ? Promise.all(a.map(u => u ? pelBake(u).catch(() => u) : null)) : a;   // 하얀 테두리 (⚙ 설정을 따라요 · 미리 구운 것이 있으면 그대로)
            let ok = false;
            if (s.k === 'seal') { const srcs = await die(s.imgs); if (window.stkLeave) stkLeave(); ok = window.openStickerPeel && await openStickerPeel(srcs, { own, ts: !!s.ts, at: DS.at }); }
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


    /* ---------- 📒 스티커첩 (도련 10-25) : 종류 창 = [🧺 바구니 | 📒 스티커첩] 탭
       · 📒 바인더 = 종이째 포켓에 꽂기 (속지 10장 = 20쪽 · 한 쪽 4포켓) · 🤍 이형지북 = 한 칸씩 떼어 모으기 (20쪽 · 🏷️ 씰 · 😀 이모지 · 🧩 조각만)
       · 📒 정리하기(정리 책상) : 위 = 바구니 종이 한 줄 · 아래 = 바인더 포켓 / 이형지 → 끌어 놓거나 · 톡 고르고 톡 놓기
       · 이형지로 옮겨도 쓴 게 아니에요 (한 칸짜리 새 종이가 돼요 · 다이어리에 붙일 때 사라져요 · js/own.js ownRelMove)
       · 바인더 · 이형지북도 🏪 진열대 → 🗂️ 정리 도구에서 받아 와야 내 것이 돼요 (공짜여도 받아서 가지고 · 칸이 차면 또 받아요 · 도련 10-25)
         → 처음부터 '받아서 가진 것을 쓰면 줄어든다'를 알게 해요 (처음 선물 · ＋ 버튼 없음)
       · 정리한 모습은 수납함의 스티커첩.json(암호화)에 저장 → 다른 기기에서도 그대로 ---------- */
    const AB = { drag: null, busy: false };
    const REL_KINDS = new Set(['seal', 'emoji', 'piece']);
    const AB_COL = [['#ffb3c9', '#f08fae'], ['#bfe3ff', '#8cc4ee'], ['#c6ecd6', '#8fd0ac'], ['#ffe08f', '#f0c35a'], ['#d8c8f6', '#b49de8'], ['#ffc8a8', '#f4a27a']];
    const AB_PER = 4;                                                         // 바인더 한 쪽 포켓 수
    const abRid = () => Date.now().toString(36) + Math.floor(Math.random() * 1e8).toString(36);
    const abMine = arr => (arr || []).filter(x => x.k === B.kind);
    const abCol = b => AB_COL[(b.c || 0) % AB_COL.length];
    const AB_BD_N = 80, AB_RL_N = 20;                                         // 바인더 = 속지 10장(20쪽 × 4포켓) · 이형지북 = 20쪽
    const abNewBd = (k, c) => ({ id: 'b' + abRid(), k, lb: '', c: (+c || 0) % AB_COL.length, n: AB_BD_N, p: {} });
    const abNewRl = k => ({ id: 'r' + abRid(), k, lb: '', n: AB_RL_N, it: [] });
    /* 🏪 진열대 → 🗂️ 정리 도구에서 받기 (그 종류 서랍으로) */
    function abTakeTool(t, k, c) { return ownAlbum(a => { (t === 'bd' ? a.bd : a.rl).push(t === 'bd' ? abNewBd(k, c) : abNewRl(k)); }); }
    function abGoShelf() { SH.toolKind = B.kind; openShelf(); shOpenKind('tool'); }
    /* 정리한 종이는 바구니에서 빠져요 */
    function abSplit() {
        const a = B.album || { bd: [], rl: [] }, placed = new Set();
        (a.bd || []).forEach(b => Object.values(b.p || {}).forEach(id => placed.add(id)));
        (a.rl || []).forEach(r => (r.it || []).forEach(t => placed.add(t.s)));
        B.byId = new Map(B.all.map(e => [e.id, e]));
        B.list = B.all.filter(e => bkKindOf(e) === B.kind && !placed.has(e.id) && !DS.m.has(e.id));   // 🗂️ 페이지에 꺼내 둔 종이는 바구니에 없어요 (✕ 로 치우면 돌아와요)
    }
    /* 화면 바꾸기 : bin (바구니) · album (스티커첩) · bd (바인더 펼침) · rl (이형지 펼침) · desk (정리 책상) */
    function bkView(v) {
        if (v && B.view === 'desk' && v !== 'desk') { abFlush(); if (AB.peelOn && window.closeStickerPeel) closeStickerPeel(); }   // 정리 책상을 나가면 바로 저장 · 띄운 종이도 닫아요
        if (v) { B.view = v; if (v === 'bin' || v === 'album') B.desk = null; }
        const wrap = bq('bkWrap'); if (!wrap || !B.album) return;
        if (B.view === 'album' && !abHasAlbum()) B.view = 'bin';               // 정리한 게 없으면 스티커첩 탭도 없어요
        const V = B.view || 'bin', sc = wrap.closest('.modal-content'), keep = sc ? sc.scrollTop : 0;
        const tabs = (V === 'bin' || V === 'album') && abHasAlbum() ? `<div class="ab-tabs"><button type="button" class="${V === 'bin' ? 'on' : ''}" onclick="bkView('bin')">🧺 바구니</button>`
            + `<button type="button" class="${V === 'album' ? 'on' : ''}" onclick="bkView('album')">📒 스티커첩</button></div>` : '';
        wrap.innerHTML = tabs + '<div class="ab-body" id="abBody"></div>';
        if (V === 'bin') bkDraw(); else if (V === 'album') abAlbum(); else if (V === 'bd') abBinder(); else if (V === 'rl') abRel(); else if (V === 'desk') abDeskDraw();
        if (sc && !v) sc.scrollTop = keep;                                     // 고친 뒤 다시 그릴 때는 보던 자리 그대로
    }
    /* 📒 스티커첩 탭은 정리한 스티커가 하나라도 생기면 보여요 (처음엔 🧺 바구니만 · 도련 10-25) */
    const abHasAlbum = () => !!B.album && (abMine(B.album.bd).some(b => Object.keys(b.p || {}).length) || abMine(B.album.rl).some(r => (r.it || []).length));
    const abErr = e => { console.warn(e); showMsg('⚠ 정리하지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); };
    /* 저장하는 동안 알려 줘요 (앱이 멈춘 게 아니에요 · 도련 10-25) : msg = 하는 중 · ok = 끝났어요 */
    async function abDo(p, msg, ok) {                                         // 기다리게 하지 않아요 (저장하는 동안에도 계속 정리해요)
        if (msg) abToast(msg, 'on');
        try { const r = await p; if (msg && !AB.pend.length && !AB.fly) abToast(ok || '저장됨', 'ok'); return r; }
        catch (e) { if (msg) abToast('', 'off'); abErr(e); B.sig = ''; bkRender(true); }
    }
    /* 💾 모아서 한 번에 저장 (도련 10-25) : 꽂기 · 빼기 · 라벨 · 표지 · 자리 옮기기는 화면에 바로 → 손을 멈추고 1.2초 뒤(또는 다 했어요 · 창 닫기) 한 번에
       · 저장하는 동안 새로 한 정리는 다음 번에 또 한 번에 · 스티커첩 파일(작은 파일)만 써요 */
    AB.pend = []; AB.fly = null; AB.flushT = 0; AB.rel = []; AB.relFly = null;   // rel : 🤍 이형지북에 붙인 것 (모아서 ownRelBatch)
    function abQueue(fn) {
        try { fn(B.album); } catch (e) {}
        AB.pend.push(fn); B.sig = bkSig();
        clearTimeout(AB.flushT); AB.flushT = setTimeout(abFlush, 1200);
    }
    async function abFlush() {
        clearTimeout(AB.flushT);
        if (AB.fly || AB.relFly || (!AB.pend.length && !AB.rel.length) || !window.ownAlbum) return;
        abToast('저장 중', 'on');
        if (AB.pend.length) {
            const fns = AB.pend; AB.pend = []; AB.fly = fns;
            try { await ownAlbum(a => fns.forEach(fn => { try { fn(a); } catch (e) {} })); AB.fly = null; }
            catch (e) { AB.fly = null; abToast('', 'off'); abErr(e); B.sig = ''; bkRender(true); return; }
        }
        if (AB.rel.length && window.ownRelBatch) {                               // 🤍 이형지북 : 여러 장을 한 번에 (목록 · 스티커첩 한 번씩)
            const ops = AB.rel; AB.rel = []; AB.relFly = ops;
            try {
                const ids = await ownRelBatch(ops.map(o => ({ s: o.src, k: o.k, rl: o.rl, pos: o.pos })));
                AB.relFly = null;
                if (ids.some(x => !x)) { showMsg('이미 썼거나 자리가 없는 스티커는 붙이지 못했어요.'); B.sig = ''; bkRender(true); }
            } catch (e) { AB.relFly = null; abToast('', 'off'); abErr(e); B.sig = ''; bkRender(true); return; }
        }
        if (!AB.pend.length && !AB.rel.length) abToast('저장됨', 'ok');
        else AB.flushT = setTimeout(abFlush, 300);
    }
    function abReapply() {
        (AB.fly || []).concat(AB.pend).forEach(fn => { try { fn(B.album); } catch (e) {} });
        (AB.relFly || []).concat(AB.rel).forEach(o => {                         // 아직 저장 안 된 이형지북 스티커도 다시 얹어요
            const r = (B.album.rl || []).find(x => x.id === o.rl); if (!r || r.it.some(t => t.s === o.tmp)) return;
            B.byId.set(o.tmp, { id: o.tmp, th: o.img }); r.it.push({ s: o.tmp, pg: o.pos.pg, x: o.pos.x, y: o.pos.y, r: o.pos.r });
        });
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) abFlush(); });
    window.addEventListener('pagehide', () => abFlush());
    function abToast(t, kind) {
        let el = bq('abToast');
        if (!el) { el = document.createElement('div'); el.id = 'abToast'; el.className = 'ab-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
        clearTimeout(AB.toastT);
        if (kind === 'off') { el.classList.remove('show'); return; }
        el.innerHTML = (kind === 'on' ? '<i class="ab-spin" aria-hidden="true"></i>' : '☁ ') + esc(t);   // ☁ 작은 표시 (페이지 저장처럼 조용히 · 도련 10-25)
        el.classList.toggle('ok', kind === 'ok'); el.classList.add('show');
        if (kind === 'ok') AB.toastT = setTimeout(() => el.classList.remove('show'), 900);
    }
    /* 화면은 바로 바꾸고(기다리지 않게) 저장은 뒤에서 · 실패하면 드라이브 모습으로 되돌아가요 */
    function abNow(fn) { try { fn(B.album, B.all); } catch (e) {} abSplit(); bkView(); B.sig = bkSig(); }
    function abOpen(v, id) { B.cur = id; B.pg = 0; bkView(v); }
    const abChip = b => { const c = abCol(b); return `<i class="ab-chip" style="--c1:${c[0]};--c2:${c[1]}"></i>`; };

    /* 📒 스티커첩 탭 : 바인더 표지 · 이형지 */
    function abAlbum() {
        const body = bq('abBody'), a = B.album, bds = abMine(a.bd), rls = abMine(a.rl);
        const plus = () => `<button type="button" class="ab-plus" onclick="abGoShelf()"><b>🏪</b>기본 스티커<br>진열대에서 받기</button>`;
        const bd = bds.map(b => { const c = abCol(b); return `<button type="button" class="ab-bd" style="--c1:${c[0]};--c2:${c[1]}" onclick="abOpen('bd','${esc(b.id)}')"><span class="ab-cover">${b.lb ? `<i class="ab-lb">${esc(b.lb)}</i>` : ''}</span><small>${Object.keys(b.p).length}장 꽂힘</small></button>`; }).join('');
        const rl = rls.map(r => `<button type="button" class="ab-rlc" onclick="abOpen('rl','${esc(r.id)}')"><span class="ab-rlsheet">${abRelMini(r)}${r.lb ? `<i class="ab-lb">${esc(r.lb)}</i>` : ''}</span><small>${r.it.length}개 · ${r.n}쪽</small></button>`).join('');
        body.innerHTML = `<div class="ab-sec"><h4 class="ab-h"><span>📒 바인더</span><small>종이째 꽂아 둬요</small></h4><div class="ab-row">${bd}${plus()}</div></div>`
            + (REL_KINDS.has(B.kind) ? `<div class="ab-sec"><h4 class="ab-h"><span>🤍 이형지북</span><small>하나씩 떼어 모아요</small></h4><div class="ab-row">${rl}${plus()}</div></div>` : '')
            + '<p class="bk-note">바인더 · 이형지북은 🏪 기본 스티커 진열대 → 🗂️ 정리 도구에서 받아 와요 · 칸이 다 차면 또 받아 와요<br>톡 하면 펼쳐져요 · 정리는 🧺 바구니 → 📒 정리하기에서 해요</p>';
    }
    function abRelMini(r) { return r.it.filter(t => !t.pg).slice(0, 14).map(t => { const e = B.byId.get(t.s); return e && e.th ? `<img src="${esc(e.th)}" alt="" style="left:${(t.x * 100).toFixed(1)}%;top:${(t.y * 100).toFixed(1)}%;--r:${(+t.r).toFixed(1)}deg">` : ''; }).join(''); }

    /* 📒 바인더 : 한 쪽 4포켓 · 쪽 넘기기 */
    const abBdOf = id => (B.album.bd || []).find(b => b.id === id);
    const abRlOf = id => (B.album.rl || []).find(r => r.id === id);
    function abPockets(b, desk) {
        let h = '';
        for (let i = B.pg * AB_PER; i < Math.min(b.n, (B.pg + 1) * AB_PER); i++) {
            const e = b.p[i] && B.byId.get(b.p[i]);
            h += e ? `<div class="ab-pk full" data-pk="${i}">${bkCard(e)}</div>` : `<div class="ab-pk" data-pk="${i}"><span>${desk ? '여기에 놓기' : '빈 포켓'}</span></div>`;
        }
        return h;
    }
    function abBinderHtml(b, desk) {
        const c = abCol(b), pages = Math.ceil(b.n / AB_PER);
        B.pg = Math.max(0, Math.min(pages - 1, B.pg || 0));
        return `<div class="ab-binder" style="--c1:${c[0]};--c2:${c[1]}"><div class="ab-rings"><i></i><i></i><i></i></div><div class="ab-page" id="abPage">${abPockets(b, desk)}</div></div>`
            + abNavHtml(B.pg, pages, 'abPage');
    }
    const abNavHtml = (pg, pages, fn) => `<div class="ab-nav"><button type="button" class="ab-nb" aria-label="앞 쪽" onclick="${fn}(-1)"${pg ? '' : ' disabled'}>‹</button><span>${pg + 1} / ${pages}쪽</span><button type="button" class="ab-nb" aria-label="다음 쪽" onclick="${fn}(1)"${pg < pages - 1 ? '' : ' disabled'}>›</button></div>`;
    function abRPage(d) { const D = B.desk; if (!D) return; D.rpg = (D.rpg || 0) + d; bkView(); }
    function abPage(d) { B.pg = (B.pg || 0) + d; bkView(); }
    const abHead = (back, go, extra) => `<div class="ab-head"><button type="button" class="ab-back" onclick="bkView('${go}')">‹ ${back}</button>${extra || ''}</div>`;
    /* 🏷️ 정리 책상에서 바로 라벨 붙이기 (첩이 여러 개일 때 무엇인지 알게 · 도련 10-25) */
    const abLbDesk = (t, x) => `<label class="ab-lbdesk"><span aria-hidden="true">🏷️</span><input value="${esc(x.lb)}" placeholder="라벨 붙이기" maxlength="8" aria-label="라벨" enterkeyhint="done" onkeydown="if(event.key==='Enter')this.blur()" onchange="abLabel('${t}','${esc(x.id)}',this.value)"></label>`;
    const abLbIn = (t, x) => `<input class="ab-lbin" value="${esc(x.lb)}" placeholder="라벨 쓰기" maxlength="8" aria-label="라벨" onchange="abLabel('${t}','${esc(x.id)}',this.value)">`;
    function abBinder() {
        const body = bq('abBody'), b = abBdOf(B.cur); if (!b) { bkView('album'); return; }
        body.innerHTML = abHead('스티커첩', 'album', abLbIn('bd', b) + `<button type="button" class="ab-mini" onclick="abColor('${esc(b.id)}')">🎨 표지</button>`)
            + abBinderHtml(b, false) + '<p class="bk-note">종이를 톡 = 꺼내 쓰기 · 뗀 자리는 비어요 · 다 쓴 종이는 저절로 빠져요</p>';
        bq('abPage').onclick = ev => { const c = ev.target.closest('.bk-sh'); if (c) bkOpenSheet(c.dataset.id); };
    }
    function abLabel(t, id, v) { const fn = a => { const x = (t === 'bd' ? a.bd : a.rl).find(o => o.id === id); if (x) x.lb = String(v || '').trim().slice(0, 8); }; abQueue(fn); abSplit(); if (B.view !== 'desk') bkView(); B.sig = bkSig(); }
    function abColor(id) { const fn = a => { const b = a.bd.find(o => o.id === id); if (b) b.c = ((b.c || 0) + 1) % AB_COL.length; }; abQueue(fn); bkView(); B.sig = bkSig(); }

    /* 🤍 이형지 : 톡 = 꺼내 쓰기 · 끌기 = 자리 옮기기 */
    function abRelItems(r, pg) {
        return r.it.filter(t => (t.pg || 0) === pg).map(t => { const e = B.byId.get(t.s); return e ? `<button type="button" class="ab-it" data-id="${esc(t.s)}" style="left:${(t.x * 100).toFixed(2)}%;top:${(t.y * 100).toFixed(2)}%;--r:${(+t.r).toFixed(1)}deg" aria-label="스티커"><img src="${esc(e.th || '')}" alt="" draggable="false"></button>` : ''; }).join('');
    }
    function abRel() {
        const body = bq('abBody'), r = abRlOf(B.cur); if (!r) { bkView('album'); return; }
        B.pg = Math.max(0, Math.min(r.n - 1, B.pg || 0));
        const items = abRelItems(r, B.pg);
        body.innerHTML = abHead('스티커첩', 'album', abLbIn('rl', r))
            + `<div class="ab-rel" id="abRel">${items}${items ? '' : `<span class="ab-relhint">${r.it.length ? '이 쪽은 비어 있어요' : '비어 있어요<br>🧺 바구니 → 📒 정리하기에서 떼어 붙여요'}</span>`}</div>`
            + abNavHtml(B.pg, r.n, 'abPage')
            + '<p class="bk-note">스티커를 톡 = 다이어리에 붙이러 가요 (붙이면 사라져요) · 끌기 = 자리 옮기기</p>';
        const box = bq('abRel');
        box.onpointerdown = ev => {
            const it = ev.target.closest('.ab-it'); if (!it || ev.button > 0) return;
            ev.preventDefault();
            const r0 = it.getBoundingClientRect();
            AB.drag = { kind: 'move', it, id: it.dataset.id, rid: r.id, x0: ev.clientX, y0: ev.clientY, ox: ev.clientX - (r0.left + r0.width / 2), oy: ev.clientY - (r0.top + r0.height / 2), br: box.getBoundingClientRect(), on: false, pid: ev.pointerId };
            try { box.setPointerCapture(ev.pointerId); } catch (e) {}
        };
    }

    /* 📒 정리 책상 */
    function abDesk() {
        B.desk = { mode: 'bd', bd: (abMine(B.album.bd)[0] || {}).id || '', rl: (abMine(B.album.rl)[0] || {}).id || '', pick: '', sheet: null, sel: -1 };
        B.pg = 0; bkView('desk');
    }
    function abMode(m) { const D = B.desk; if (!D) return; if (AB.peelOn && m !== 'rl' && window.closeStickerPeel) closeStickerPeel(); D.mode = m; D.sel = -1; bkView(); }
    function abNextTarget() {
        const D = B.desk; if (!D) return;
        const L = abMine(D.mode === 'bd' ? B.album.bd : B.album.rl); if (L.length < 2) return;
        const i = L.findIndex(x => x.id === (D.mode === 'bd' ? D.bd : D.rl)), nx = L[(i + 1) % L.length].id;
        if (D.mode === 'bd') { D.bd = nx; B.pg = 0; } else { D.rl = nx; D.rpg = 0; }
        bkView();
    }
    function abDeskDraw() {
        const body = bq('abBody'), D = B.desk; if (!D) { bkView('bin'); return; }
        const relOk = REL_KINDS.has(B.kind); if (!relOk) D.mode = 'bd';
        if (D.pick && !B.list.some(e => e.id === D.pick)) { D.pick = ''; D.sheet = null; D.sel = -1; }
        const strip = B.list.length ? B.list.slice().sort((a, b) => b.at - a.at).map(e => `<div class="ab-sc${D.pick === e.id ? ' on' : ''}" data-id="${esc(e.id)}">${bkCard(e)}</div>`).join('') : '<span class="ab-stripempty">바구니가 비었어요</span>';
        let main;
        if (D.mode === 'bd') {
            const L = abMine(B.album.bd), b = L.find(x => x.id === D.bd) || L[0];
            if (b) { D.bd = b.id; const full = Object.keys(b.p).length >= b.n; main = (full ? bkMsg('📒 이 바인더는 가득 찼어요.', '<button type="button" class="btn bk-again" onclick="abGoShelf()">🏪 기본 스티커 진열대에서 새 바인더 받아 오기</button>') : '') + `<div class="ab-target"><button type="button" class="ab-pick" onclick="abNextTarget()" aria-label="다른 바인더 고르기">${abChip(b)}${L.length > 1 ? `${L.findIndex(x => x.id === b.id) + 1} / ${L.length} ▾` : '바인더'}</button>${abLbDesk('bd', b)}<small>${Object.keys(b.p).length} / ${b.n}장</small></div>` + abBinderHtml(b, true); }
            else main = bkMsg('아직 바인더가 없어요.', '<button type="button" class="btn bk-again" onclick="abGoShelf()">🏪 기본 스티커 진열대에서 바인더 받아 오기</button>');
        } else {
            const L = abMine(B.album.rl), r = L.find(x => x.id === D.rl) || L[0];
            const panel = !D.pick ? '<div class="ab-peelhint">⬆ 위 줄에서 종이를 톡 골라요</div>' : !D.sheet ? '<div class="ab-peelhint">종이를 펼치는 중…</div>'
                : '<div class="ab-peelzone" id="abPeelZone"><span>🪡 핀셋으로 떼어 아래 이형지북에 붙여요</span></div>';   // 🤍 종이는 이 자리에 한 줄로 떠요 (js/stickerpeel.js 이형지북 모드)
            if (r) {
                D.rl = r.id; D.rpg = Math.max(0, Math.min(r.n - 1, D.rpg || 0));
                const onPg = r.it.filter(t => (t.pg || 0) === D.rpg).length;
                main = panel + `<div class="ab-target"><button type="button" class="ab-pick" onclick="abNextTarget()" aria-label="다른 이형지북 고르기"><i class="ab-chip rl"></i>${L.length > 1 ? `${L.findIndex(x => x.id === r.id) + 1} / ${L.length} ▾` : '이형지북'}</button>${abLbDesk('rl', r)}<small>이 쪽 ${onPg} / ${window.OWN_REL_MAX || 24}개</small></div>`
                    + `<div class="ab-rel desk" id="abRel">${abRelItems(r, D.rpg)}<span class="ab-relhint">${D.sheet ? '떼어 낸 스티커를 여기에 놓아요' : ''}</span></div>` + abNavHtml(D.rpg, r.n, 'abRPage');
            }
            else main = panel + bkMsg('아직 이형지북이 없어요.', '<button type="button" class="btn bk-again" onclick="abGoShelf()">🏪 기본 스티커 진열대에서 이형지북 받아 오기</button>');
        }
        body.innerHTML = abHead('바구니', 'bin', '<b class="ab-ttl">📒 정리하기</b>')
            + (relOk ? `<div class="ab-tabs sm"><button type="button" class="${D.mode === 'bd' ? 'on' : ''}" onclick="abMode('bd')">📒 바인더에 꽂기</button><button type="button" class="${D.mode === 'rl' ? 'on' : ''}" onclick="abMode('rl')">🤍 이형지북에 붙이기</button></div>` : '')
            + `<div class="ab-strip" id="abStrip">${strip}</div>` + main
            + `<p class="bk-note">${D.mode === 'bd' ? '종이를 끌어 빈 포켓에 놓아요 (톡 고르고 → 포켓 톡도 돼요)<br>꽂힌 종이를 톡 = 바구니로 다시 빼기' : '종이를 톡 고르면 펼쳐져요 · 🪡 핀셋으로 떼어 이형지북에 붙여요<br>이형지북으로 옮겨도 쓴 게 아니에요 (다이어리에 붙일 때 사라져요)'}</p>`
            + '<div class="bk-tools"><button type="button" class="btn ab-done" onclick="bkView(\'bin\')">다 했어요</button></div>';
        body.onpointerdown = ev => {
            if (ev.button > 0) return;
            const ri = ev.target.closest('#abRel .ab-it'); if (ri) { abItGrab(ri, ev); return; }   // ✋ 이형지에 놓은 스티커 = 자리 옮기기
            const sc = ev.target.closest('.ab-sc'), st = ev.target.closest('.ab-st:not(.hole)'), src = sc || st; if (!src) return;
            AB.drag = { kind: sc ? 'sheet' : 'st', src, id: sc ? sc.dataset.id : D.pick, slot: st ? +st.dataset.slot : -1, x0: ev.clientX, y0: ev.clientY, pid: ev.pointerId, on: false, ghost: null };
        };
        body.onclick = ev => {
            const pk = ev.target.closest('.ab-pk');
            if (pk) { if (pk.classList.contains('full')) abTakeOut(+pk.dataset.pk); else if (D.pick) abPutSheet(D.pick, +pk.dataset.pk); else abSay(pk, '⬆ 위에서 종이를 먼저 골라요'); return; }
            const rel = ev.target.closest('#abRel');
            if (rel && D.mode === 'rl' && D.sel >= 0) abPutSt(D.sel, ev.clientX, ev.clientY, rel);
        };
        if (D.mode === 'rl' && D.pick && !D.sheet) abLoadSheet(D.pick);
        if (D.mode === 'rl' && D.sheet) { if (AB.peelOn !== D.sheet.id) abPeelOpen(); else if (window.pelRelayout) pelRelayout(); }
        else if (AB.peelOn && window.closeStickerPeel) closeStickerPeel();
    }
    /* 🤍 고른 종이를 진짜 씰 종이처럼 띄워요 : 한 줄 · 옆으로 밀어 넘기기 · 🪡 핀셋으로 가장자리를 집어 떼기 → 이형지북 위에 놓기 (js/stickerpeel.js · 도련 10-25) */
    async function abPeelOpen() {
        const D = B.desk; if (!D || !D.sheet || !window.openStickerPeel) return;
        const id = D.sheet.id; AB.peelOn = id;
        const imgs = D.sheet.baked || !window.pelBake ? D.sheet.imgs : await Promise.all(D.sheet.imgs.map(u => u ? pelBake(u).catch(() => u) : null));   // 하얀 테두리 (⚙ 설정을 따라요)
        const D2 = B.desk;
        if (!D2 || !D2.sheet || D2.sheet.id !== id || D2.mode !== 'rl' || B.view !== 'desk') { if (AB.peelOn === id) AB.peelOn = ''; return; }
        const ok = await openStickerPeel(imgs, { rel: {
            at: () => { const z = bq('abPeelZone'); return z ? z.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: 130, right: innerWidth, bottom: 130 }; },
            target: () => { const r = bq('abRel'); return r ? r.getBoundingClientRect() : null; },
            alive: () => vis('basketKindModal') && B.view === 'desk' && !!bq('abPeelZone'),
            drop: (k, pos) => abRelDrop(id, k, pos),
            close: () => {
                if (AB.peelOn !== id) return;
                AB.peelOn = '';
                const D3 = B.desk;
                if (D3 && D3.pick === id && D3.sheet && !D3.sheet.imgs.some(u => u != null)) { D3.pick = ''; D3.sheet = null; if (B.view === 'desk') bkView(); }   // 다 뗐어요
                else if (D3 && D3.pick === id && B.view === 'desk') { D3.pick = ''; D3.sheet = null; bkView(); }   // ✕ 로 닫았어요
            }
        } });
        if (!ok && AB.peelOn === id) AB.peelOn = '';
    }
    function abRelDrop(src, k, pos) {
        const D = B.desk; if (!D) return;
        pos = { x: Math.max(.08, Math.min(.92, pos.x)), y: Math.max(.1, Math.min(.9, pos.y)), r: Math.max(-25, Math.min(25, pos.r || 0)), pg: D.rpg || 0 };
        let img = '';
        if (D.sheet && D.sheet.id === src) { img = D.sheet.imgs[k] || ''; D.sheet.imgs[k] = null; }
        const tmp = 'tmp' + Date.now() + k, rel = abRlOf(D.rl), relEl = bq('abRel');                // 화면에는 바로 붙여 보여요
        if (rel && img) { B.byId.set(tmp, { id: tmp, th: img }); rel.it.push({ s: tmp, pg: pos.pg, x: pos.x, y: pos.y, r: pos.r }); }
        if (relEl && img) {
            relEl.insertAdjacentHTML('afterbegin', `<button type="button" class="ab-it" data-id="${tmp}" style="left:${(pos.x * 100).toFixed(2)}%;top:${(pos.y * 100).toFixed(2)}%;--r:${pos.r}deg" aria-label="스티커"><img src="${esc(img)}" alt="" draggable="false"></button>`);
            const sm = document.querySelector('.ab-target small'); if (sm && rel) sm.textContent = `이 쪽 ${rel.it.filter(t => (t.pg || 0) === pos.pg).length} / ${window.OWN_REL_MAX || 24}개`;
        }
        AB.rel.push({ src, k, rl: D.rl, pos, tmp, img });                      // 모아서 저장 (손을 멈추면 · 다 했어요 · 창 닫기)
        B.sig = bkSig();
        if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
        clearTimeout(AB.flushT); AB.flushT = setTimeout(abFlush, 1200);
    }
    function abSay(el, t) { const s = el.querySelector('span'); if (!s) return; const o = s.textContent; s.textContent = t; setTimeout(() => { if (s.isConnected) s.textContent = o; }, 1300); }
    async function abLoadSheet(id) {
        let r = null; try { r = await ownSheetImgs(id); } catch (e) { abErr(e); }
        const D = B.desk; if (!D || D.pick !== id) return;
        if (!r || !r.imgs.some(u => u != null)) { D.pick = ''; D.sheet = null; } else D.sheet = { id, imgs: r.imgs, baked: r.baked };
        if (B.view === 'desk' && !AB.drag) bkView();
    }
    function abTapSheet(id) {
        const D = B.desk; if (!D) return;
        if (AB.peelOn && AB.peelOn !== id && window.closeStickerPeel) closeStickerPeel();   // 다른 종이를 고르면 띄운 종이는 닫아요
        if (D.pick === id) { if (D.mode === 'bd') D.pick = ''; } else { D.pick = id; D.sheet = null; D.sel = -1; }
        bkView();
    }
    function abTapSt(slot) { const D = B.desk; if (!D) return; D.sel = D.sel === slot ? -1 : slot; bkView(); }
    /* 꽂기 · 빼기 : 화면을 다시 그리지 않고 떠 있는 카드를 그대로 옮겨요 (그림을 새로 받지 않아서 바로 · 도련 10-25) */
    function abPutSheet(id, pk) {
        const D = B.desk; if (!D) return;
        const b0 = abBdOf(D.bd); if (!b0 || b0.p[pk]) return;
        D.pick = '';
        const bd = D.bd, fn = a => {
            const b = a.bd.find(x => x.id === bd); if (!b || b.p[pk]) return;
            a.bd.forEach(x => Object.keys(x.p).forEach(i => { if (x.p[i] === id) delete x.p[i]; }));
            b.p[pk] = id;
        };
        const sc = document.querySelector(`#abStrip .ab-sc[data-id="${CSS.escape(id)}"]`), pkEl = document.querySelector(`#abPage .ab-pk[data-pk="${pk}"]`);
        abQueue(fn); abSplit();
        if (sc && pkEl) {
            const card = sc.querySelector('.bk-sh'); sc.remove();
            pkEl.classList.add('full'); pkEl.textContent = ''; if (card) pkEl.appendChild(card);
            document.querySelectorAll('#abStrip .ab-sc.on').forEach(x => x.classList.remove('on'));
            abDeskCounts();
            if (!B.list.length) { const st = bq('abStrip'); if (st) st.innerHTML = '<span class="ab-stripempty">바구니가 비었어요</span>'; }
        } else bkView();
        B.sig = bkSig();
        if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
    }
    function abTakeOut(pk) {
        const D = B.desk; if (!D) return;
        const b0 = abBdOf(D.bd), id = b0 && b0.p[pk]; if (!id) return;
        const bd = D.bd, fn = a => { const b = a.bd.find(x => x.id === bd); if (b) delete b.p[pk]; };
        const pkEl = document.querySelector(`#abPage .ab-pk[data-pk="${pk}"]`), st = bq('abStrip');
        abQueue(fn); abSplit();
        if (pkEl && st) {
            const card = pkEl.querySelector('.bk-sh');
            pkEl.classList.remove('full'); pkEl.innerHTML = '<span>여기에 놓기</span>';
            const em = st.querySelector('.ab-stripempty'); if (em) em.remove();
            const sc = document.createElement('div'); sc.className = 'ab-sc'; sc.dataset.id = id; if (card) sc.appendChild(card);
            st.prepend(sc); st.scrollLeft = 0;
            abDeskCounts();
        } else bkView();
        B.sig = bkSig();
    }
    function abDeskCounts() { const D = B.desk, b = D && abBdOf(D.bd), sm = document.querySelector('.ab-target small'); if (b && sm) sm.textContent = `${Object.keys(b.p).length} / ${b.n}장`; }
    async function abPutSt(slot, cx, cy, box) {
        const D = B.desk; if (!D || !D.sheet || D.sheet.imgs[slot] == null) return;
        const r = box.getBoundingClientRect();
        const pos = { x: Math.max(.08, Math.min(.92, (cx - r.left) / r.width)), y: Math.max(.1, Math.min(.9, (cy - r.top) / r.height)), r: Math.round((Math.random() - .5) * 24) };
        const src = D.sheet.id; D.sel = -1;
        pos.pg = D.rpg || 0;
        const img = D.sheet.imgs[slot], tmp = 'tmp' + Date.now(), rel = abRlOf(D.rl);   // 화면에는 바로 붙여 보여요
        D.sheet.imgs[slot] = null;
        if (rel) { B.byId.set(tmp, { id: tmp, th: img }); rel.it.push({ s: tmp, pg: pos.pg, x: pos.x, y: pos.y, r: pos.r }); }
        const stEl = document.querySelector(`#abPeel .ab-st[data-slot="${slot}"]`), relEl = bq('abRel');      // 화면만 바로 고쳐요 (다시 그리지 않아요)
        if (stEl && relEl) {
            const hole = document.createElement('b'); hole.className = 'ab-st hole'; stEl.replaceWith(hole);
            relEl.insertAdjacentHTML('afterbegin', `<button type="button" class="ab-it" data-id="${tmp}" style="left:${(pos.x * 100).toFixed(2)}%;top:${(pos.y * 100).toFixed(2)}%;--r:${pos.r}deg" aria-label="스티커"><img src="${esc(img)}" alt="" draggable="false"></button>`);
            relEl.classList.remove('ready'); const hint = relEl.querySelector('.ab-relhint'); if (hint) hint.textContent = '스티커를 끌어 와 붙여요';
            document.querySelectorAll('#abPeel .ab-st.on').forEach(x => x.classList.remove('on'));
        } else bkView();
        const nid = await abDo(ownRelMove(src, slot, D.rl, pos), '🤍 이형지북에 붙이는 중…', '✓ 이형지북에 붙였어요');
        if (nid === undefined) { D.sheet = null; return; }                       // 실패 (알림은 abDo)
        if (!nid) { showMsg('이 스티커는 이미 썼거나 옮겨졌어요.'); D.sheet = null; bkRender(true); return; }
        if (B.desk && B.desk.sheet && B.desk.sheet.id === src) { B.desk.sheet.imgs[slot] = null; if (!B.desk.sheet.imgs.some(u => u != null)) { B.desk.pick = ''; B.desk.sheet = null; } }
        if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
        if (B.desk && !B.desk.pick && B.view === 'desk') bkView();               // 종이를 다 옮겼으면 다시 그려요
    }
    /* ✋ 정리 책상 이형지 위에 놓은 스티커 옮기기 (도련 10-25 · 떼는 판이 떠 있어도 js/stickerpeel.js 가 여기로 넘겨줘요) */
    function abItGrab(it, ev) {
        const D = B.desk, box = bq('abRel'); if (!D || !box || !it) return;
        if (ev.preventDefault) ev.preventDefault();
        const r0 = it.getBoundingClientRect();
        AB.drag = { kind: 'move', desk: true, it, id: it.dataset.id, rid: D.rl, x0: ev.clientX, y0: ev.clientY, ox: ev.clientX - (r0.left + r0.width / 2), oy: ev.clientY - (r0.top + r0.height / 2), br: box.getBoundingClientRect(), on: false, pid: ev.pointerId };
    }
    /* 끌기 (정리 책상 : 종이 → 포켓 · 스티커 → 이형지 / 이형지 펼침 : 자리 옮기기) */
    document.addEventListener('pointermove', ev => {
        const d = AB.drag; if (!d || d.pid !== ev.pointerId) return;
        const dx = ev.clientX - d.x0, dy = ev.clientY - d.y0;
        if (d.kind === 'move') {
            if (!d.on && Math.hypot(dx, dy) < 7) return;
            d.on = true; d.it.classList.add('lift');
            d.x = Math.max(.05, Math.min(.95, (ev.clientX - d.ox - d.br.left) / d.br.width));
            d.y = Math.max(.05, Math.min(.95, (ev.clientY - d.oy - d.br.top) / d.br.height));
            d.it.style.left = (d.x * 100) + '%'; d.it.style.top = (d.y * 100) + '%';
            return;
        }
        if (!d.on) {
            if (Math.hypot(dx, dy) < 8) return;
            if (d.kind === 'sheet' && Math.abs(dx) > Math.abs(dy) * 1.2) { AB.drag = null; return; }   // 옆으로 = 줄 넘겨 보기
            d.on = true;
            const r = d.src.getBoundingClientRect(), g = document.createElement('div');
            g.className = 'ab-ghost' + (d.kind === 'st' ? ' st' : ''); g.innerHTML = d.src.innerHTML; g.style.width = r.width + 'px';
            document.body.appendChild(g); d.ghost = g; d.gw = r.width; d.gh = r.height;
            d.src.classList.add('ab-lifted');
        }
        d.ghost.style.left = (ev.clientX - d.gw / 2) + 'px'; d.ghost.style.top = (ev.clientY - d.gh / 2) + 'px';
        const el = document.elementFromPoint(ev.clientX, ev.clientY), tg = el && (d.kind === 'sheet' ? el.closest('.ab-pk:not(.full)') : el.closest('#abRel'));
        document.querySelectorAll('.ab-over').forEach(x => { if (x !== tg) x.classList.remove('ab-over'); });
        if (tg) tg.classList.add('ab-over');
    }, { passive: true });
    function abUp(ev) {
        const d = AB.drag; if (!d || d.pid !== ev.pointerId) return;
        AB.drag = null;
        if (d.ghost) d.ghost.remove();
        if (d.src) d.src.classList.remove('ab-lifted');
        document.querySelectorAll('.ab-over').forEach(x => x.classList.remove('ab-over'));
        const ok = ev.type === 'pointerup';
        if (d.kind === 'move') {
            d.it.classList.remove('lift');
            if (!ok) return;
            if (!d.on) { if (!d.desk) bkOpenSheet(d.id); return; }
            const op = AB.rel.find(o => o.tmp === d.id);
            if (op) { op.pos.x = d.x; op.pos.y = d.y; const r = abRlOf(d.rid), t = r && r.it.find(o => o.s === d.id); if (t) { t.x = d.x; t.y = d.y; } return; }   // 아직 저장 전 = 저장할 자리만 바꿔요
            const fn = a => { const r = a.rl.find(x => x.id === d.rid), t = r && r.it.find(o => o.s === d.id); if (t) { t.x = d.x; t.y = d.y; } };
            abQueue(fn);
            return;
        }
        if (!ok) return;
        if (!d.on) { if (d.kind === 'sheet') abTapSheet(d.id); else abTapSt(d.slot); return; }
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        if (d.kind === 'sheet') {
            const pk = el && el.closest('.ab-pk:not(.full)');
            if (pk && B.desk && B.desk.mode === 'bd') abPutSheet(d.id, +pk.dataset.pk);
            else if (B.desk && B.desk.mode === 'rl') abTapSheet(d.id);
        } else {
            const box = el && el.closest('#abRel');
            if (box) abPutSt(d.slot, ev.clientX, ev.clientY, box);
        }
    }
    document.addEventListener('pointerup', abUp);
    document.addEventListener('pointercancel', abUp);

    window.bkView = bkView; window.abOpen = abOpen; window.abGoShelf = abGoShelf; window.abPage = abPage; window.abRPage = abRPage; window.abLabel = abLabel; window.abColor = abColor;
    window.abDesk = abDesk; window.bkGetKind = bkGetKind; window.shQuick = shQuick; window.bkGlowGet = bkGlowGet; window.abMode = abMode; window.abTapSheet = abTapSheet; window.abItGrab = abItGrab; window.abNextTarget = abNextTarget;

    /* ---------- 🏪 진열대 (도련 10-25) : 아이콘 8개 → 그 종류의 진열대 창 → 🔍 확대 → 🧺 받기
       카테고리 · 스티커 이름 없이 (현실 가게도 그렇게 팔아요) · 새로 들어온 것이 맨 앞 · 📄 모조지만 '모양 · 배경' 두 매대 ---------- */
    const SH = { kind: '', items: [], zoom: -1, seq: 0, toolKind: '' };
    const kitThumb = (u, w) => window.kitSize ? kitSize(u, w) : u;
    /* 종류 : [아이콘 이름, 창 이름, 상품 만들기] (진열대 첫 창의 아이콘 순서 = 이 순서) */
    const SH_KINDS = {
        seal: ['씰스티커', async () => {
            const kit = await basicKit(), out = [];
            kit.sheets.slice().reverse().forEach(x => out.push([x.us, x.pv]));       // 새로 들어온 것(뒤 번호)이 맨 앞 · pv = 묶음 미리보기 한 장
            kit.images.slice().reverse().forEach(x => out.push([[x.u]]));            // 낱장
            const items = out.map(([us, pv]) => ({ cnt: `씰 ${us.length}개`, look: 'grid', pv, thumbs: us.map(u => kitThumb(u, 96)), bigs: us.map(u => kitThumb(u, 360)), take: () => ownTakeKit(us, '') }));
            return items;
        }],
        piece: ['조각스티커', async () => window.sbShelf ? sbShelf('piece') : []],
        paper: ['모조지스티커', async () => window.sbShelf ? sbShelf('paper') : []],
        tape: ['마스킹테이프', async () => (window.sbShelf ? await sbShelf('tape') : []).concat((window.tapeShelf ? tapeShelf() : []).map(t => ({ cnt: '한 롤', look: 'tape', thumbs: [t.url], def: { k: 'tape', imgs: [t.url], th: t.url } })))],
        tk: ['떡메모지', async () => (window.sbShelf ? await sbShelf('tk') : []).concat((window.tkShelf ? tkShelf() : []).map(t => ({ cnt: `${OWN_Q.tk}장`, look: 'tk', pad: t.k, def: { k: 'tk', imgs: [''], x: { pad: t.k }, noTh: true } })))],
        leaf: ['속지', async () => (window.sbShelf ? await sbShelf('leaf') : []).concat((window.leafShelf ? leafShelf() : []).map(l => ({ cnt: '한 장', look: 'leaf', lf: l.k, def: { k: 'leaf', imgs: [''], x: { lf: l.k }, noTh: true } })))],
        emoji: ['이모지', async () => {                                          // 😀 예전 이모지 창의 7묶음 전부 (도련 10-25) · 실제 그림 이모지로 보이는 것만 · 16개씩 씰 종이 한 장
            if (typeof emojiRanges === 'undefined') return [];
            const own = new Map(), out = [];                                     // 겹치는 번호는 더 좁은 묶음에 (🦀 게는 얼굴이 아니라 동물 · 기호는 남은 것)
            for (const c of ['animals', 'food', 'activities', 'travel', 'objects', 'faces', 'symbols']) for (const [a, b] of (emojiRanges[c] || [])) for (let i = a; i <= b; i++) if (!own.has(i)) own.set(i, c);
            for (const c of Object.keys(emojiRanges)) {
                const chars = [];
                for (const [a, b] of emojiRanges[c]) for (let i = a; i <= b; i++) if (own.get(i) === c && !chars.includes(i)) chars.push(i);
                const ok = await shEmoOk(chars);
                for (let i = 0; i < ok.length; i += 16) {
                    const part = ok.slice(i, i + 16);
                    out.push({ cnt: `씰 ${part.length}개`, look: 'emoji', chars: part, cat: c, take: async () => ({ k: 'seal', b: 'emoji', imgs: await Promise.all(part.map(shEmoji)), baked: true }) });
                }
            }
            return out;
        }],
        memo: ['메모지', async () => (window.sbShelf ? await sbShelf('memo') : []).concat((window.memoShelf ? memoShelf() : []).map(p => ({ cnt: `${OWN_Q.memo}장`, look: 'memo', pp: p.id, def: { k: 'memo', imgs: [''], x: { pp: p.id }, noTh: true } })))],
        tool: ['정리 도구', async () => {                                       // 🗂️ 바인더 · 이형지북 (공짜지만 받아 와야 내 것 · 도련 10-25)
            const out = AB_COL.map((c, i) => ({ cnt: `속지 10장 · 시트 ${AB_BD_N}장 꽂아요`, desc: `한 쪽에 ${AB_PER}포켓 · 앞뒤 ${AB_BD_N / AB_PER}쪽 · 꽂아도 쓴 게 아니에요`, look: 'binder', c: i, tool: 'bd' }));
            out.push({ cnt: `이형지 ${AB_RL_N}쪽 · 스티커 ${AB_RL_N * (window.OWN_REL_MAX || 24)}개`, desc: `한 쪽에 ${window.OWN_REL_MAX || 24}개씩 붙여요 · 옮겨 붙여도 쓴 게 아니에요`, look: 'relbook', tool: 'rl' });
            return out;
        }],
        season: ['계절 스티커', async () => {                                    // 🌸 이벤트 때만 (SEASON_OPEN · 아이콘도 그때만)
            if (!shSeasonOn()) return [];
            const k = seasonNow(), srcs = (SEASON_STICKERS[k] || []).map(x => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(x.svg));
            return srcs.length ? [{ cnt: `씰 ${srcs.length}개`, look: 'grid', thumbs: srcs, def: { k: 'seal', imgs: srcs, baked: true } }] : [];
        }],
    };
    SH.cache = {};                                                            // 한 번 채운 매대는 기억해요 (다시 열면 바로)
    async function shItems(k) {
        if (SH.cache[k]) return SH.cache[k];
        const items = await SH_KINDS[k][1]();
        if (k !== 'season') SH.cache[k] = items;
        return items;
    }
    const shSeasonOn = () => typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN && typeof SEASON_STICKERS !== 'undefined';
    /* 😀 이 기기에서 그림 이모지로 보이는 글자만 (빈 번호 = □ · 색 없는 글자는 빼요) · 텍스트로 보이는 글자는 FE0F 를 붙여 그림으로 */
    async function shEmoOk(cps) {
        const c = document.createElement('canvas'); c.width = c.height = 24;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '20px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
        const look = ch => { x.clearRect(0, 0, 24, 24); x.fillText(ch, 12, 13); return x.getImageData(0, 0, 24, 24).data; };
        const same = (p, q) => { for (let i = 0; i < p.length; i += 4) if (p[i + 3] !== q[i + 3]) return false; return true; };
        const tofu = look(String.fromCodePoint(0x10FFFD)), tofu2 = look(String.fromCodePoint(0x1FBFF));
        const color = d => { let n = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 60 && (Math.abs(d[i] - d[i + 1]) > 24 || Math.abs(d[i + 1] - d[i + 2]) > 24)) { if (++n > 6) return true; } } return false; };
        const ink = d => { for (let i = 3; i < d.length; i += 4) if (d[i] > 60) return true; return false; };
        const res = [], plain = [];
        for (let k = 0; k < cps.length; k++) {
            if (k && k % 150 === 0) await new Promise(r => setTimeout(r, 0));     // 화면이 멈추지 않게 조금씩
            const cp = cps[k]; let ch = String.fromCodePoint(cp);
            if (!/\p{Extended_Pictographic}/u.test(ch)) continue;
            if (!/\p{Emoji_Presentation}/u.test(ch)) ch += '\uFE0F';
            const d = look(ch);
            if (!ink(d) || same(d, tofu) || same(d, tofu2)) continue;
            (color(d) ? res : plain).push(ch);
        }
        return res.length >= 20 ? res : res.concat(plain);                    // 색 이모지 글꼴이 없는 기기면 보이는 것 모두
    }
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
        const box = bq('shkWrap'); SH.kind = k; SH.items = []; SH.pg = 0; SH.cat = ''; SH.got = new Set(); shZoomOff();
        const seq = ++SH.seq;
        box.scrollTop = 0;
        if (!SH.cache[k]) box.innerHTML = bkMsg('기본 스티커 진열대를 채우는 중…');
        let items = [];
        try { items = await shItems(k); } catch (e) { console.warn(e); if (seq === SH.seq) box.innerHTML = bkMsg('⚠ 기본 스티커 진열대를 불러오지 못했어요.<br>인터넷 연결을 확인해 주세요.', `<button type="button" class="btn bk-again" onclick="shOpenKind('${k}')">🔄 다시 불러오기</button>`); return; }
        if (seq !== SH.seq) return;                                              // 그사이 다른 종류를 열었어요
        SH.items = items;
        shDraw(k);
    }
    /* 📄 쪽으로 넘겨 보기 (도련 10-25 · 게시판처럼) : 한 쪽 = 3줄 (아래로 내리지 않게 · 칸 크기를 창에 맞춰요) · 지금 쪽을 보는 동안 다음 쪽 그림을 미리
       · 📄 모조지 = [✂️ 모양 | 📄 배경] · 🗂️ 정리 도구 = [📒 바인더 | 🤍 이형지북] 칸으로 나눠요 */
    const SH_ROWS = 2, SH_COLS = 2, SH_GAP = 10;   // 한 쪽 = 세로로 긴 카드 2 × 2 (도련 10-25 · 폰 · PC 모두)
    const SH_CATS = { paper: [['모양', '✂️ 모양'], ['배경', '📄 배경']], tool: [['bd', '📒 바인더'], ['rl', '🤍 이형지북']],
        emoji: [['faces', '😀 얼굴'], ['animals', '🐶 동물'], ['food', '🍎 음식'], ['activities', '🎈 활동'], ['travel', '🚗 탈것'], ['objects', '💡 물건'], ['symbols', '💟 기호']] };
    const shCatOf = (k, x) => k === 'paper' ? (x.sec || '모양') : k === 'tool' ? x.tool : k === 'emoji' ? x.cat : '';
    function shDraw(k) {
        const box = bq('shkWrap'), items = SH.items; if (!box) return;
        if (!items.length) { box.innerHTML = bkMsg('아직 진열된 스티커가 없어요.'); return; }
        const cats = SH_CATS[k];
        if (cats && !cats.some(c => c[0] === SH.cat)) SH.cat = cats[0][0];
        const tabs = cats ? `<div class="ab-tabs sm sh-cats${cats.length > 3 ? ' many' : ''}" style="--n:${cats.length}">${cats.map(c => { const [ic, ...nm] = c[1].split(' '); return `<button type="button" class="${c[0] === SH.cat ? 'on' : ''}" onclick="shCat('${c[0]}')">${cats.length > 3 ? `<b>${ic}</b><small>${nm.join(' ')}</small>` : c[1]}</button>`; }).join('')}</div>` : '';
        const list = items.map((x, i) => [x, i]).filter(([x]) => !cats || shCatOf(k, x) === SH.cat);
        const cols = SH_COLS, per = cols * SH_ROWS;
        const pages = Math.max(1, Math.ceil(list.length / per));
        SH.pg = Math.max(0, Math.min(pages - 1, SH.pg || 0));
        const page = list.slice(SH.pg * per, (SH.pg + 1) * per);
        const nav = pages > 1 ? `<div class="ab-nav sh-nav"><button type="button" class="ab-nb" aria-label="앞 쪽" onclick="shPage(-1)"${SH.pg ? '' : ' disabled'}>‹</button><span>${SH.pg + 1} / ${pages}쪽</span><button type="button" class="ab-nb" aria-label="다음 쪽" onclick="shPage(1)"${SH.pg < pages - 1 ? '' : ' disabled'}>›</button></div>` : '';
        box.innerHTML = `<div class="sh-case"><div class="sh-awn" aria-hidden="true"></div>${tabs}${page.length ? `<div class="sh-grid" style="--cols:${cols}">${page.map(([x, i]) => shCard(x, i)).join('')}</div>` : bkMsg('아직 진열된 것이 없어요.')}</div>`
            + `<div class="sh-base">${nav}</div><div class="obj-feet"><i></i><i></i></div>`;   // 🏪 작은 진열장 (차양 · 칸 · 선반 · 받침 서랍의 ‹ 쪽 › · 다리 · 도련 10-26 · 창 없이 물건처럼)
        shFit(box);
        shPreload(list.slice((SH.pg + 1) * per, (SH.pg + 2) * per));          // 다음 쪽 미리
    }
    /* 창 안에 3줄이 다 들어가게 칸 높이를 맞춰요 (넘치면 조금씩 줄여요) */
    function shFit(box) {
        const mc = box.closest('.modal-content'); if (!mc) return;
        let h = Math.round(Math.min(300, ((box.clientWidth || 340) - 8 - SH_GAP) / SH_COLS * 1.35));   // 세로로 긴 카드 (가로 × 1.35 · 창에 안 들어가면 줄여요)
        const set = () => { box.style.setProperty('--sh-h', h + 'px'); box.style.setProperty('--sh-z', (h / 130).toFixed(3)); };
        set();
        for (let i = 0; i < 10; i++) {
            const over = mc.classList.contains('obj-win') ? mc.getBoundingClientRect().height - (innerHeight - 190) : mc.scrollHeight - mc.clientHeight;   // 📦 창 없는 진열장은 화면 높이에 맞춰요
            if (over <= 1 || h <= 64) break;
            h = Math.max(64, h - Math.ceil(over / SH_ROWS) - 1); set();
        }
    }
    function shCat(c) { SH.cat = c; SH.pg = 0; shDraw(SH.kind); }
    function shPage(d) { SH.pg = (SH.pg || 0) + d; shDraw(SH.kind); const box = bq('shkWrap'); if (box) box.scrollTop = 0; }
    function shPreload(list) {
        const seen = SH.pre || (SH.pre = new Set());
        list.forEach(([x]) => (x.pv ? [x.pv.u] : x.thumbs || []).forEach(u => {
            if (!u || /^data:/.test(u) || seen.has(u)) return;
            seen.add(u); const im = new Image(); im.decoding = 'async'; im.src = u;
        }));
    }
    /* (미리 채우기 shWarm 은 지웠어요 · 겉표지를 열 때 버벅여서 · 도련 10-25 → 진열대를 열 때 채우고 그다음부터 기억해요) */
    function shLook(x, big) {
        if (x.look === 'binder') { const c = AB_COL[x.c]; return `<div class="sh-tool"><span class="ab-cover" style="--c1:${c[0]};--c2:${c[1]}"></span></div>`; }
        if (x.look === 'relbook') return '<div class="sh-tool"><span class="ab-rlsheet sh-relbook"></span></div>';
        const src = big && x.bigs ? x.bigs : x.thumbs, n = (src || x.chars || []).length, cols = big ? Math.ceil(Math.sqrt(Math.max(1, n))) : Math.ceil(Math.sqrt(Math.max(1, n) * .7));   // 카드는 세로로 길게 (포장기 pvOf 와 같은 칸 수)
        if (x.look === 'emoji') return `<div class="sh-paper"><i class="bk-grid sh-emo" style="--c:${cols}">${x.chars.map(ch => `<b>${ch}</b>`).join('')}</i></div>`;
        if (x.look === 'tape') return `<div class="sh-tape"><i style="background-image:url(&quot;${esc(src[0])}&quot;)"></i></div>`;
        if (x.look === 'tk') return `<div class="sh-pad">${window.tkMiniHtml ? tkMiniHtml(x.pad) : ''}</div>`;
        if (x.look === 'tkimg') return `<div class="sh-pad">${window.tkMiniHtml ? tkMiniHtml('my', { src: src[0] }) : ''}</div>`;
        if (x.look === 'leaf') return `<span class="lf-pick sh-leaf"><i class="lf-sw lf-${esc(x.lf)}"></i></span>`;
        if (x.look === 'leafimg') return `<span class="lf-pick sh-leaf"><i class="lf-sw lf-my" style="--lf-img:url('${esc(src[0])}')"></i></span>`;
        if (x.look === 'memo') return `<div class="sh-memo"><span class="pp-chip pp-${esc(x.pp)}"></span></div>`;
        if (!big && x.pv && x.look === 'grid') { const p = x.pv; return `<div class="sh-paper"><svg class="sh-pv" viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg width="${p.w}" height="${p.h}"><image href="${esc(p.u)}" x="0" y="${-p.y}" width="${p.w}" height="${p.H}"/></svg></svg></div>`; }   // 🖼️ 묶음 미리보기 (작은 그림 수십 장 대신 · 포장기 p/ 한 파일에서 내 칸만 잘라 보여요)
        if (x.look === 'memoimg' || x.look === 'sheet') return `<div class="sh-paper one"><img src="${esc(src[0])}" alt="" loading="lazy"></div>`;
        return `<div class="sh-paper${n === 1 ? ' one' : ''}"><i class="bk-grid" style="--c:${cols}">${src.map(u => `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`).join('')}</i></div>`;
    }
    function shCard(x, i) {
        return `<div class="sh-item"><button type="button" class="sh-look" onclick="shZoom(${i})" aria-label="확대">${shLook(x)}</button><small class="sh-cnt">${esc(x.cnt || '')}</small>`
            + `<div class="sh-btns"><button type="button" class="sh-take sh-zoombtn" onclick="shZoom(${i})">🔍 확대</button>${SH.got && SH.got.has(i) ? `<button type="button" class="sh-take sh-get got" onclick="shGoSee('${shInto()}', 0)">✓ 바구니에 쏙</button>` : `<button type="button" class="sh-take sh-get" onclick="shQuick(${i}, this)">🧺 받기</button>`}</div></div>`;   // 받은 것은 창을 닫았다 열 때까지 초록 (쪽을 넘겨도 그대로 · 도련 10-26)   // 받기를 바로 (도련 10-26 · 처음 온 사람은 받으러 와요)
    }
    /* 🔍 확대 : 그 스티커 전체 모습 + 아래 🧺 받기 (진열대 창 안에 겹쳐 떠요 · 창이 하나라는 규칙 그대로) */
    function shZoom(i) {
        const x = SH.items[i], z = bq('shZoom'); if (!x || !z) return;
        SH.zoom = i;
        let pick = '';
        if (x.tool) {                                                         // 🗂️ 어느 서랍에 넣을지 (그 종류의 📒 스티커첩으로)
            const ks = Object.keys(BK_KINDS).filter(k => x.tool === 'bd' || REL_KINDS.has(k));
            if (!ks.includes(SH.toolKind)) SH.toolKind = ks[0];
            pick = `<div class="sh-into"><small>넣을 서랍</small><div>${ks.map(k => `<button type="button" class="sh-ik${k === SH.toolKind ? ' on' : ''}" onclick="shToolKind('${k}')">${esc(BK_KINDS[k])}</button>`).join('')}</div></div>`;
        }
        z.innerHTML = `<div class="sh-zcard"><div class="sh-zlook k-${esc(SH.kind)}">${shLook(x, true)}</div><small class="sh-cnt">${esc(x.cnt || '')}</small>${x.desc ? `<small class="sh-desc">${esc(x.desc)}</small>` : ''}${pick}`
            + `<div class="sh-zbtns"><button type="button" class="sh-take sh-zget" onclick="shTake(this)">🧺 받기</button><button type="button" class="btn" onclick="shZoomOff()">닫기</button></div></div>`;
        z.hidden = false;
    }
    const shInto = () => SH.kind === 'season' ? 'seal' : SH.kind;            // 받은 것이 들어간 바구니
    function shGoSee(k, album) {                                            // 받은 것 보러 : 그 종류 서랍 (정리 도구는 📒 스티커첩 탭)
        shZoomOff(); closeModal('shelfKindModal');
        bkOpenKind(k);
        if (album) { B.view = 'album'; bkView('album'); }
    }
    function shToolKind(k) { SH.toolKind = k; if (SH.zoom >= 0) shZoom(SH.zoom); }
    function shZoomOff() { const z = bq('shZoom'); if (z) { z.hidden = true; z.innerHTML = ''; } SH.zoom = -1; if (SH.redraw) { SH.redraw = false; shDraw(SH.kind); } }
    /* 🧺 카드에서 바로 받기 (확대 없이 · 도련 10-26) : 받으면 잠깐 '✓ 바구니에 쏙' → 다시 받기 (정리 도구는 넣을 서랍을 골라야 해서 확대로) */
    async function shQuick(i, btn) {
        const x = SH.items[i]; if (!x || btn.disabled) return;
        if (x.tool) { shZoom(i); return; }
        if (!window.ownTake || !ownMode()) { showMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 스티커를 받을 수 있어요.'); return; }
        btn.disabled = true; btn.classList.add('busy'); btn.textContent = '받는 중…';
        try {
            if (x.def) await ownTake(x.def);
            else { const r = await x.take(); if (r && typeof r === 'object') await ownTake(r); }
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            btn.classList.remove('busy'); btn.classList.add('got'); btn.textContent = '✓ 바구니에 쏙'; btn.disabled = false; btn.onclick = () => shGoSee(shInto(), 0);   // 초록 버튼 = 그 바구니로 바로 (도련 10-26)
            (SH.got || (SH.got = new Set())).add(i);                            // 창을 닫았다 열면 다시 받기
        } catch (e) {
            console.warn(e);
            btn.classList.remove('busy'); btn.textContent = '🧺 받기'; btn.disabled = false;
            showMsg('⚠ 스티커를 받지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        }
    }
    async function shTake(btn) {
        const x = SH.items[SH.zoom]; if (!x || btn.disabled) return;
        if (!window.ownTake || !ownMode()) { showMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 스티커를 받을 수 있어요.'); return; }
        btn.disabled = true; btn.classList.add('busy'); btn.textContent = '받는 중…';
        try {
            if (x.tool) { if (!window.ownAlbum) throw new Error('ready'); await abTakeTool(x.tool, SH.toolKind, x.c); }
            else if (x.def) await ownTake(x.def);
            else { const r = await x.take(); if (r && typeof r === 'object') await ownTake(r); }   // take() : 새 종이 id(씰) 또는 종이 정보
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            /* 받았어요 → 이 창에서는 더 못 받아요 : 🗄️ 받은 것 보러 가기 · 닫기 중에 골라요 (닫았다 다시 열면 또 받을 수 있어요 · 도련 10-25) */
            (SH.got || (SH.got = new Set())).add(SH.zoom); SH.redraw = true;                       // 확대에서 받아도 카드 버튼은 초록
            const box = btn.closest('.sh-zbtns'), into = x.tool ? SH.toolKind : (SH.kind === 'season' ? 'seal' : SH.kind);
            const where = x.tool ? `🗄️ 내 스티커 수납함 · ${esc(BK_KINDS[into] || '')} 스티커첩` : `🗄️ 내 스티커 수납함 · ${esc(BK_KINDS[into] || '')} 바구니`;
            if (box) box.outerHTML = `<div class="sh-got"><b>✓ 받았어요!</b><small>${where}에 넣었어요</small></div>`
                + `<div class="sh-zbtns"><button type="button" class="sh-take sh-zget" onclick="shGoSee('${into}', ${x.tool ? 1 : 0})">${x.tool ? '📒 스티커첩에서 보기' : '🧺 바구니에서 보기'}</button><button type="button" class="btn" onclick="shZoomOff()">닫기</button></div>`;
        } catch (e) {
            console.warn(e);
            btn.classList.remove('busy'); btn.textContent = '🧺 받기'; btn.disabled = false;
            showMsg('⚠ 스티커를 받지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        }
    }


    /* ---------- 🗂️ 꺼내 둔 스티커창 (도련 10-26) ----------
       다꾸러처럼 쓸 것을 다 꺼내 놓고 써요 : 바구니에서 톡 · 오래 누르기 · 창 밖으로 끌기 = 페이지 위에 스티커창이 놓여요 (몇 장이든 · 언제든 더)
       윈도우 창처럼 맨 위 한 장만 '열려' 떼어져요 : 다른 종이를 톡 = 그 종이가 맨 위로 + 떼는 화면 · 끌기 = 옮기기 · ✕ = 치우기
       저장하지 않아요 (앱을 끄면 사라져요) · 다 쓴 종이는 저절로 치워져요 */
    const DS = { m: new Map(), z: 1, act: '', t: 0, at: null };
    const DS_ROOMS = ['pelRoom', 'pcbRoom', 'pmRoom', 'tkRoom'];
    function dsLayer() { let l = bq('dskLayer'); if (!l) { l = document.createElement('div'); l.id = 'dskLayer'; document.body.appendChild(l); } return l; }
    function dsEntry(id) { const pk = window.ownPeek ? ownPeek() : null, L = (pk && pk.list) || B.all || []; return L.find(e => e.id === id) || null; }
    const dsLeft = e => !!e && (e.q0 ? e.q > 0 : (e.u || []).length < e.n);
    const dsRoomOn = () => DS_ROOMS.some(id => { const r = bq(id); return r && r.classList.contains('show'); });
    function dsPaint(d) {
        const e = dsEntry(d.id); if (!dsLeft(e)) { dsDrop(d.id); return; }
        d.el.innerHTML = `<button type="button" class="dsk-x" aria-label="치우기">✕</button>${bkCard(e)}`;
        const w = d.el.offsetWidth || 110, h = d.el.offsetHeight || 120;
        d.x = Math.max(w / 2 + 4, Math.min(innerWidth - w / 2 - 4, d.x)); d.y = Math.max(h / 2 + 50, Math.min(innerHeight - h / 2 - 90, d.y));
        d.el.style.left = (d.x - w / 2) + 'px'; d.el.style.top = (d.y - h / 2) + 'px';
    }
    function dsFront(d) { d.el.style.zIndex = ++DS.z; }
    function dsDrop(id) {
        const d = DS.m.get(id); if (!d) return; if (DS.act === id) dsShut(); d.el.remove(); DS.m.delete(id); DS.c.delete(id); DS.v.delete(id);
        if (vis('basketKindModal') && B.view === 'bin') { abSplit(); B.sig = bkSig(); bkDraw(); }   // 치운 종이는 바구니로 돌아와요
    }
    function dsTake(id, at, keep) {
        if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
        const e = dsEntry(id) || B.byId.get(id); if (!dsLeft(e)) { showMsg('이 스티커는 이미 다 썼어요.'); return; }
        let d = DS.m.get(id);
        if (!d) {
            const n = DS.m.size;
            d = { id, el: document.createElement('div'), x: innerWidth * .3 + (n % 5) * 26, y: innerHeight * .32 + (n % 5) * 30 };
            d.el.className = 'dsk'; d.el.dataset.id = id; dsLayer().appendChild(d.el); DS.m.set(id, d); dsWire(d);
        }
        if (at) { d.x = at.x; d.y = at.y; }
        dsPaint(d); dsFront(d); dsPrep(id).catch(() => {});
        d.el.classList.remove('pop'); void d.el.offsetWidth; d.el.classList.add('pop');
        if (navigator.vibrate) try { navigator.vibrate(8); } catch (er) {}
        if (!keep && vis('basketKindModal')) {                                 // 톡 · 오래 누르기 : 바구니가 비켰다가 다시 떠요 (끌어서 꺼낼 땐 그대로)
            closeModal('basketKindModal');
            setTimeout(() => { if (![...document.querySelectorAll('.modal')].some(m => m.style.display === 'flex') && !dsRoomOn()) bkReopen(); }, 420);
        }
        return d;
    }
    /* ⚡ 꺼낸 종이는 미리 읽고 하얀 테두리까지 구워 둬요 → 톡 하면 바로 열려요 · 떼는 화면을 닫으면 다시 읽어 둬요 (쓴 자리 반영) */
    DS.c = new Map(); DS.v = new Map();                                        // c = 읽는 중(약속) · v = 마지막으로 읽어 둔 것
    function dsPrep(id) {
        if (DS.v.has(id)) return Promise.resolve(dsFresh(id, DS.v.get(id)));   // ⚡ 읽어 둔 게 있으면 기다리지 않아요 (새로 읽기는 뒤에서)
        if (DS.c.has(id)) return DS.c.get(id).then(v => v && dsFresh(id, v));
        return dsLoad(id);
    }
    function dsReload(id) { if (!DS.m.has(id)) return; DS.c.delete(id); dsLoad(id).catch(() => {}); }   // 뒤에서 다시 읽어 두기 (읽는 동안은 예전 것 + 뗀 기록으로)
    function dsLoad(id) {
        const p = (async () => {
            const r = await ownSheet(id); if (!r) return null;
            const s = r.s; let baked = null;
            if ((s.k === 'seal' || s.k === 'piece') && !s.baked && window.pelBake) baked = await Promise.all(s.imgs.map(u => u ? pelBake(u).catch(() => u) : null));
            return { s, baked };
        })();
        DS.c.set(id, p); p.then(v => { if (!v) { DS.c.delete(id); DS.v.delete(id); } else DS.v.set(id, v); }, () => DS.c.delete(id));
        return p;
    }
    function dsFresh(id, v) {                                                 // 그사이 이 기기에서 뗀 자리는 비워요 (쓴 기록 · 목록)
        const e = dsEntry(id), used = new Set((e && e.u) || []);
        (window.ownPendGet ? ownPendGet() : []).forEach(p => { if (p.s === id && !p.q) used.add(p.k); });
        if (!used.size) return v;
        const imgs = v.s.imgs.map((u, i) => used.has(i) ? null : u);
        return { s: Object.assign({}, v.s, { imgs }), baked: v.baked && v.baked.map((u, i) => used.has(i) ? null : u) };
    }
    function dsMoveFromPeel(d) { const a = window.pelLastAt && pelLastAt(); if (a && a.id === d.id) { d.x = a.x; d.y = a.y; } }   // 떼는 화면에서 옮긴 자리에서 작아져요 (도련 10-26)
    function dsMove(d, x, y) { d.x = x; d.y = y; const w = d.el.offsetWidth, h = d.el.offsetHeight; d.el.style.left = (x - w / 2) + 'px'; d.el.style.top = (y - h / 2) + 'px'; }
    function dsWire(d) {
        let p = null;
        d.el.addEventListener('pointerdown', ev => {
            if (ev.button > 0) return;
            if (ev.target.closest('.dsk-x')) return;
            ev.preventDefault(); dsFront(d);
            p = { x0: ev.clientX, y0: ev.clientY, dx: d.x - ev.clientX, dy: d.y - ev.clientY, on: false, id: ev.pointerId };
            try { d.el.setPointerCapture(ev.pointerId); } catch (er) {}
        });
        d.el.addEventListener('pointermove', ev => {
            if (!p || ev.pointerId !== p.id) return;
            if (!p.on && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 7) return;
            p.on = true; d.el.classList.add('lift'); d.x = ev.clientX + p.dx; d.y = ev.clientY + p.dy;
            const w = d.el.offsetWidth, h = d.el.offsetHeight; d.el.style.left = (d.x - w / 2) + 'px'; d.el.style.top = (d.y - h / 2) + 'px';
        });
        const up = ev => {
            if (!p || ev.pointerId !== p.id) return; const was = p; p = null; d.el.classList.remove('lift');
            if (ev.type !== 'pointerup') return;
            if (!was.on) { dsOpen(d); return; }
            if (d.el.classList.contains('big')) dsUse(d);                     // 커진 테이프 · 메모지 · 속지를 끌어 놓으면 = 써요
        };
        d.el.addEventListener('pointerup', up); d.el.addEventListener('pointercancel', up);
        d.el.addEventListener('click', ev => { if (ev.target.closest('.dsk-x')) { ev.stopPropagation(); dsDrop(d.id); } });
    }
    /* 📏 테이프 · 메모지 · 속지 : 톡 = 크게 보기 (아직 안 써요) → 커진 것을 톡 하거나 끌어 놓으면 = 페이지에 써요 · 다른 곳을 누르면 작아져요 */
    function dsBig(d) {
        DS.m.forEach(o => { if (o !== d && o.el.classList.contains('big')) { o.el.classList.remove('big'); dsPaint(o); } });
        d.el.classList.add('big'); dsPaint(d); dsFront(d);
        if (!d.el.querySelector('.dsk-say')) d.el.insertAdjacentHTML('beforeend', '<span class="dsk-say">톡 하거나 페이지로 끌어 놓으면 써요</span>');
    }
    function dsSmall(d) { if (!d.el.classList.contains('big')) return; d.el.classList.remove('big'); dsPaint(d); }
    async function dsUse(d) {
        dsSmall(d);
        await bkOpenSheet(d.id);
        setTimeout(() => DS.m.has(d.id) && dsPaint(d), 500);
    }
    document.addEventListener('pointerdown', ev => { DS.m.forEach(o => { if (o.el.classList.contains('big') && !o.el.contains(ev.target)) dsSmall(o); }); }, true);   // 다른 곳 = 작아져요
    function dsShut() {                                                       // 열린(맨 위) 종이의 떼는 화면 닫기
        if (window.closeStickerPeel && bq('pelRoom') && bq('pelRoom').classList.contains('show')) closeStickerPeel();
        if (window.closePieceBag && bq('pcbRoom') && bq('pcbRoom').classList.contains('show')) closePieceBag();
        if (window.closePaperSheet && bq('pmRoom') && bq('pmRoom').classList.contains('show')) closePaperSheet();
        if (window.closeTteokRoom && bq('tkRoom') && bq('tkRoom').classList.contains('show')) closeTteokRoom();
    }
    async function dsOpen(d) {                                                // 톡 = 이 종이가 맨 위 · 떼는 화면으로
        if (B.opening) return;
        const prev = DS.act ? DS.m.get(DS.act) : null;
        if (DS.act) { dsShut(); DS.act = ''; if (prev) { prev.el.classList.remove('act'); dsMoveFromPeel(prev); dsReload(prev.id); dsPaint(prev); } }
        const e = dsEntry(d.id); if (!dsLeft(e)) { dsDrop(d.id); return; }
        const win = !['tape', 'memo', 'leaf'].includes(e.k);                   // 테이프 · 메모지 · 속지는 창이 없어요
        if (!win) { if (d.el.classList.contains('big')) dsUse(d); else dsBig(d); return; }   // 늘 '커진 다음에 써요' (도련 10-26 · 크게 보려고 눌렀다가 써 버리지 않게)
        DS.act = d.id; d.el.classList.add('act'); document.body.classList.add('dsk-on');
        DS.at = { x: d.x, y: d.y }; await bkOpenSheet(d.id); DS.at = null;
        clearInterval(DS.t); let seen = false;
        DS.t = setInterval(() => {                                            // 떼는 화면이 닫히면 종이를 다시 그려요 (쓴 자리 · 다 쓰면 치워요)
            const on = dsRoomOn(); if (on) { seen = true; return; }
            if (!seen && DS.act === d.id && B.opening) return;
            clearInterval(DS.t); if (DS.act !== d.id) return;
            DS.act = ''; d.el.classList.remove('act'); document.body.classList.remove('dsk-on'); dsMoveFromPeel(d); dsReload(d.id); dsPaint(d); setTimeout(() => DS.m.has(d.id) && dsPaint(d), 1500);
        }, 250);
    }
    if (window.ownOnChange) ownOnChange(() => DS.m.forEach(d => { if (DS.act !== d.id) dsPaint(d); }));   // 쓴 양이 바뀌면 다시 그려요
    window.dsTake = dsTake;

    /* ---------- 🎨 진열대 · 수납함 물건 그림 (도련 10-25 · 입체감 있는 손그림 SVG · 그림 파일 없이) ----------
       stkArt(종류) → SVG 글 (72×64 · 진한 갈색 아웃라인 #7b5a63) · 진열대 선반(.st2-goods) · 수납 바구니 위 살짝 보이는 물건(.bk2-peek)에 넣어요 */
    let ART_N = 0;
    function stkArt(k) {
        const u = 'a' + (++ART_N), sh = `<filter id="${u}s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#6e4050" flood-opacity=".28"/></filter>`;
        const gl = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${u}gl)"/>`;   // 반짝 (위쪽 하이라이트)
        const glDef = `<linearGradient id="${u}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
        const heart = (x, y, s, c1, c2, id) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 4C0-1 7-2 8 3 9-2 16-1 16 4 16 9 8 13 8 13 8 13 0 9 0 4Z" fill="#fff" stroke="#7b5a63" stroke-width="1.4" stroke-linejoin="round" transform="translate(-1.6 -1.6) scale(1.2)"/><path d="M0 4C0-1 7-2 8 3 9-2 16-1 16 4 16 9 8 13 8 13 8 13 0 9 0 4Z" fill="url(#${id})"/><ellipse cx="4.5" cy="3.2" rx="2.2" ry="1.3" fill="#fff" opacity=".7"/></g><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;
        const star = (x, y, s, id) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M8 0l2.4 5 5.4.7-4 3.8 1 5.4L8 12.3 3.2 14.9l1-5.4-4-3.8L5.6 5z" fill="#fff" stroke="#7b5a63" stroke-width="4.6" stroke-linejoin="round"/><path d="M8 0l2.4 5 5.4.7-4 3.8 1 5.4L8 12.3 3.2 14.9l1-5.4-4-3.8L5.6 5z" fill="#fff" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 0l2.4 5 5.4.7-4 3.8 1 5.4L8 12.3 3.2 14.9l1-5.4-4-3.8L5.6 5z" fill="url(#${id})"/><path d="M6 4l2-3 1 3" fill="#fff" opacity=".6"/></g><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#f7c34a"/></linearGradient></defs>`;
        const dot = (x, y, r, c1, c2, id) => `<circle cx="${x}" cy="${y}" r="${r + 1.6}" fill="#fff" stroke="#7b5a63" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/><ellipse cx="${x - r * .35}" cy="${y - r * .4}" rx="${r * .4}" ry="${r * .25}" fill="#fff" opacity=".7"/><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`;
        const A = {
            seal: () => `<rect x="9" y="12" width="40" height="48" rx="5" fill="#f7f4fa" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round" transform="rotate(-9 29 36)" filter="url(#${u}s)"/>
                <rect x="22" y="5" width="42" height="54" rx="5" fill="url(#${u}p)" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round" filter="url(#${u}s)"/>
                ${heart(27, 12, .95, '#ffb7cc', '#ff7fa3', u + 'h')}${star(45, 10, .95, u + 'y')}${dot(33, 41, 6, '#d6ecff', '#7fbdf0', u + 'b')}${heart(44, 36, .8, '#e0d2ff', '#a98bf0', u + 'v')}
                ${gl(22, 5, 42, 20, 5)}<defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#eef1f8"/></linearGradient></defs>`,
            piece: () => `<path d="M14 10h44v44a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" fill="url(#${u}p)" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round" filter="url(#${u}s)"/>
                <rect x="14" y="10" width="44" height="8" fill="#c7b3f2"/><path d="M14 14h44" stroke="#a88ce6" stroke-width="1.6" stroke-dasharray="3 2"/>
                ${heart(21, 26, .85, '#ffb7cc', '#ff7fa3', u + 'h')}${star(38, 30, .85, u + 'y')}${dot(28, 47, 5, '#c9f0dc', '#6fcfa0', u + 'g')}
                <path d="M18 20v34a4 4 0 0 0 4 4" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>
                <defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4eeff" stop-opacity=".95"/><stop offset="1" stop-color="#ddd0fb" stop-opacity=".95"/></linearGradient></defs>`,
            paper: () => `<path d="M16 4h32l10 10v46H16z" fill="url(#${u}p)" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round" filter="url(#${u}s)"/><path d="M48 4v10h10z" fill="#e6e0d8" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <circle cx="29" cy="22" r="7" fill="none" stroke="#f19ab3" stroke-width="1.8" stroke-dasharray="3 2.4"/>
                <path d="M34 38c0-4 6-5 7-1 1-4 7-3 7 1 0 4-7 8-7 8s-7-4-7-8z" fill="none" stroke="#7fbdf0" stroke-width="1.8" stroke-dasharray="3 2.4"/>
                <rect x="21" y="44" width="11" height="9" rx="2" fill="none" stroke="#f3c45c" stroke-width="1.8" stroke-dasharray="3 2.4"/>
                <defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffefb"/><stop offset="1" stop-color="#f4efe6"/></linearGradient></defs>`,
            tape: () => { const roll = (cx, cy, R, c1, c2, id) => `<g filter="url(#${u}s)"><path d="M${cx - R} ${cy}v8a${R} ${R * .42} 0 0 0 ${R * 2} 0v-8z" fill="${c2}" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R * .42}" fill="url(#${id})" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${cy}" rx="${R * .5}" ry="${R * .21}" fill="#f2dcbc" stroke="#7b5a63" stroke-width="1.2"/><ellipse cx="${cx}" cy="${cy + .6}" rx="${R * .34}" ry="${R * .14}" fill="#fff8ee"/></g><defs><pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${c1}"/><rect width="3" height="6" fill="#fff" opacity=".75"/></pattern></defs>`;
                return `<path d="M44 40 L66 46 L64 50 L67 54 L44 49z" fill="#bfe3ff" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>${roll(22, 38, 17, '#ff9fbd', '#f07fa2', u + 'a')}${roll(48, 22, 14, '#9fd0f5', '#79b6e6', u + 'b')}`; },
            tk: () => `<g filter="url(#${u}s)"><path d="M12 22l8-8h40l-8 8z" fill="#fff6c6" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/><path d="M52 22l8-8v34l-8 8z" fill="#efdf9a" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <rect x="12" y="22" width="40" height="34" fill="url(#${u}p)"/></g><rect x="12" y="22" width="40" height="7" fill="#ff9fb8"/><rect x="12" y="22" width="40" height="34" fill="none" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M12 48h40M12 51h40M12 54h40" stroke="#eadb9a" stroke-width="1"/><path d="M53 24l6-6M53 30l6-6M53 36l6-6" stroke="#e2d185" stroke-width=".8"/>
                <defs><linearGradient id="${u}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7c9"/><stop offset="1" stop-color="#ffeea0"/></linearGradient></defs>`,
            leaf: () => `<rect x="12" y="10" width="36" height="50" rx="3" fill="#eaf4ff" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round" transform="rotate(-7 30 35)" filter="url(#${u}s)"/>
                <rect x="24" y="6" width="36" height="52" rx="3" fill="url(#${u}p)" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round" filter="url(#${u}s)"/>
                <path d="M30 18h26M30 24h26M30 30h26M30 36h26M30 42h26M30 48h26" stroke="#cfe2f5" stroke-width="1"/><path d="M33 8v48" stroke="#ffb3c9" stroke-width="1"/>
                <circle cx="27.5" cy="16" r="1.8" fill="#dfe8f2"/><circle cx="27.5" cy="32" r="1.8" fill="#dfe8f2"/><circle cx="27.5" cy="48" r="1.8" fill="#dfe8f2"/>
                ${gl(24, 6, 36, 16, 3)}<defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#f3f8fd"/></linearGradient></defs>`,
            emoji: () => { const face = (cx, cy, r, c1, c2, id, blush) => `<g filter="url(#${u}s)"><circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="#fff" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/></g>
                    <ellipse cx="${cx - r * .36}" cy="${cy - r * .12}" rx="${r * .09}" ry="${r * .14}" fill="#6b4a3a"/><ellipse cx="${cx + r * .36}" cy="${cy - r * .12}" rx="${r * .09}" ry="${r * .14}" fill="#6b4a3a"/>
                    <path d="M${cx - r * .35} ${cy + r * .25}q${r * .35} ${r * .32} ${r * .7} 0" stroke="#6b4a3a" stroke-width="${r * .1}" fill="none" stroke-linecap="round"/>
                    <circle cx="${cx - r * .62}" cy="${cy + r * .18}" r="${r * .15}" fill="${blush}" opacity=".7"/><circle cx="${cx + r * .62}" cy="${cy + r * .18}" r="${r * .15}" fill="${blush}" opacity=".7"/>
                    <ellipse cx="${cx - r * .35}" cy="${cy - r * .55}" rx="${r * .32}" ry="${r * .16}" fill="#fff" opacity=".7"/>
                    <defs><radialGradient id="${id}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`;
                return face(26, 28, 15, '#fff1a8', '#ffcf45', u + 'a', '#ff9fb8') + face(49, 41, 12, '#ffe0cc', '#ffad80', u + 'b', '#ff8fab'); },
            memo: () => `<g filter="url(#${u}s)"><path d="M14 12h44v38l-10 10H14z" fill="url(#${u}p)" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/><path d="M58 50l-10 10V54a4 4 0 0 1 4-4z" fill="#efe2b0" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/></g>
                <rect x="28" y="7" width="18" height="9" fill="#ff9fb8" opacity=".9" stroke="#7b5a63" stroke-width="1.2" transform="rotate(-5 37 11)"/>
                <path d="M21 26h28M21 33h28M21 40h20" stroke="#ead9a0" stroke-width="1.4" stroke-linecap="round"/>
                <defs><linearGradient id="${u}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#fff3c4"/></linearGradient></defs>`,
            tool: () => `<g filter="url(#${u}s)"><rect x="10" y="6" width="34" height="52" rx="4" fill="url(#${u}c)"/><rect x="10" y="6" width="8" height="52" rx="3" fill="#ef86a8"/><rect x="10" y="6" width="34" height="52" rx="4" fill="none" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/></g>
                <circle cx="14" cy="16" r="2" fill="#fff"/><circle cx="14" cy="32" r="2" fill="#fff"/><circle cx="14" cy="48" r="2" fill="#fff"/>
                <rect x="22" y="14" width="18" height="8" rx="1.5" fill="#fffaf2" stroke="#7b5a63" stroke-width="1.2"/>
                <g filter="url(#${u}s)"><rect x="36" y="12" width="26" height="44" rx="3" fill="url(#${u}r)" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/></g>
                ${heart(41, 20, .55, '#ffb7cc', '#ff7fa3', u + 'h')}${dot(53, 40, 3.6, '#d6ecff', '#7fbdf0', u + 'b')}<path d="M38 50l22-28" stroke="#fff" stroke-width="3" opacity=".6"/>
                ${gl(10, 6, 34, 14, 4)}<defs><linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc4d6"/><stop offset="1" stop-color="#ff9fbd"/></linearGradient><linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#f1edf5"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>`,
        };
        return A[k] ? `<svg viewBox="0 0 72 64" aria-hidden="true"><defs>${sh}${glDef}</defs>${A[k]()}</svg>` : '';
    }
    /* 📦 진열대 · 수납함 옮기기 (도련 10-25 · 🗄️ 문구함 gdCabMovable 과 같게) : 아무 데나 잡고 8px 넘게 끌면 옮겨져요 · 짧게 톡은 그대로 · 끈 뒤 톡은 무시 · ✕ 는 끌기 아님 */
    (function objMovable() {
        const go = () => ['basketModal', 'shelfModal', 'shelfKindModal'].forEach(id => {
            const w = document.querySelector('#' + id + ' > .obj-win'); if (!w || w.dataset.mv) return; w.dataset.mv = 1;
            let d = null, swallow = false;
            w.addEventListener('pointerdown', e => { if (e.button > 0 || e.target.closest('.mt-x, .modal-title, .sh-zoom')) return; d = { x: e.clientX, y: e.clientY, ox: parseFloat(w.style.left) || 0, oy: parseFloat(w.style.top) || 0, on: false, id: e.pointerId }; });   // 제목 줄은 js/skins.js 가 옮겨요 (두 번 안 움직이게) · 확대 창 안은 끌기 X
            w.addEventListener('pointermove', e => {
                if (!d || e.pointerId !== d.id) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                if (!d.on) { if (Math.hypot(dx, dy) < 8) return; d.on = true; w.setPointerCapture(e.pointerId); w.classList.add('moving'); }
                const r = w.getBoundingClientRect(), bl = r.left - (parseFloat(w.style.left) || 0), bt = r.top - (parseFloat(w.style.top) || 0);
                w.style.left = Math.max(8 - bl, Math.min(innerWidth - 8 - r.width - bl, d.ox + dx)) + 'px';
                w.style.top = Math.max(40 - bt, Math.min(innerHeight - 8 - r.height - bt, d.oy + dy)) + 'px';
                e.preventDefault();
            });
            const end = () => { if (d && d.on) { swallow = true; setTimeout(() => { swallow = false; }, 0); w.classList.remove('moving'); } d = null; };
            w.addEventListener('pointerup', end); w.addEventListener('pointercancel', end);
            w.addEventListener('click', e => { if (swallow) { e.stopPropagation(); e.preventDefault(); swallow = false; } }, true);
            addEventListener('resize', () => { w.style.left = w.style.top = ''; });
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
    })();

    function stkArtFill() {                                                   // 진열대 · 수납함의 물건 자리에 그림을 넣어요 (한 번)
        document.querySelectorAll('.st2-slot').forEach(b => { const k = (b.className.match(/\bg-(\w+)/) || [])[1], g = b.querySelector('.st2-goods'); if (k && g && !g.dataset.art) { g.innerHTML = stkArt(k); g.dataset.art = 1; g.classList.add('art'); } });
        document.querySelectorAll('.bk2-bin').forEach(b => { const k = (b.className.match(/\bb-(\w+)/) || [])[1], g = b.querySelector('.bk2-peek'); if (k && g && !g.dataset.art) { g.innerHTML = stkArt(k); g.dataset.art = 1; g.classList.add('art'); } });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', stkArtFill); else stkArtFill();
    window.stkArt = stkArt;

    window.openBasket = openBasket; window.bkOpenKind = bkOpenKind; window.bkReopen = bkReopen; window.bkRender = bkRender; window.bkOpenSheet = bkOpenSheet;
    window.openShelf = openShelf; window.shOpenKind = shOpenKind; window.shZoom = shZoom; window.shZoomOff = shZoomOff; window.shToolKind = shToolKind; window.shGoSee = shGoSee; window.shPage = shPage; window.shCat = shCat; window.shTake = shTake;
})();
