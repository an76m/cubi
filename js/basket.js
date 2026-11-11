/* 말랑달콤 다이어리 - js/basket.js
   🧺 내 바구니 · 🏪 기본상품 샵 (도련 10-25 · 유한 스티커 · 저장 · 쓰기는 js/own.js)
   - ✨ 스티커 창 → 🧺 내 바구니 : 종류 아이콘 8개 → 종류마다 바구니 하나 (도련 10-25 · 온갖 종류가 한데 섞이지 않게) · 위에서 내려다본 바구니
   - 바구니 안 : 받거나 만든 스티커 종이가 마구 쌓여요 (정리 · 카테고리 · 찾기 · 이름 없음 = 진짜 바구니처럼)
       · 종이는 살짝 기울고 겹쳐 쌓여요 · 새로 들어온 종이가 맨 위
       · 종이를 끌면 옆으로 치워져요(맨 위로) → 아래 깔린 종이를 찾아요 (🔀 뒤적이기는 도련 10-25 지움)
       · 종이를 톡 = 그 종이가 하얀 떼는 창으로 나와요 (뗀 자리는 비어 있어요 · js/stickerpeel.js) → 붙이면 그 칸은 영원히 사라져요
       · 다 쓴 종이는 바구니에서 사라져요 · 종이 자리 · 쌓인 순서는 이 기기에만 기억 (localStorage · 드라이브에 쓰지 않아요)
       · 화면에는 맨 위 BK_MAX 장만 그려요 (수백 장이어도 버벅이지 않게)
       · 나중에 🗂️ 바인더 · 바구니 · 라벨을 사서 정리하는 기능을 이 위에 얹어요 (도련 10-25)
   - ✨ 스티커 창 → 🏪 기본상품 샵 : 종류 아이콘 8개 → 그 종류의 기본상품 샵 창 (카테고리 · 이름 없이 · 새로 들어온 것이 맨 앞 · 도련 10-25)
       · 🔍 확대 = 그 스티커 전체 모습 + 아래 🧺 받기
       · [🧺 받기] = 그 스티커 종이를 새로 한 장 받아 바구니로 (공짜 · 몇 번이든 · 같은 스티커도 받을 때마다 새 종이 · 도련 10-25)
   - 모든 종류 (10-25) : 🏷️ 씰 · 😀 이모지(씰로 떼요) · 🧩 조각 · 📄 모조지 · 🎀 테이프 · 📝 메모지 · 🧻 떡메 · 📃 속지 (+ 🌸 계절 · 🎁 캡슐 선물)
       · 바구니 카드 모양 = 종류마다 (씰 종이 · 테이프 롤 · 떡메 묶음 · 메모지 묶음 · 속지 한 장 …) · 남은 양은 두께로만 보여요 (숫자 없이)
       · 종이를 톡 = 종류마다 원래 연출로 (씰 · 조각 봉투 · 모조지 · 떡메 묶음) / 테이프 · 메모지 · 속지는 페이지에 바로 놓여요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (스티커 창의 두 칸만 안 열려요) */

(function () {
    const bq = id => document.getElementById(id);
    const esc = htmlEsc;   // 🧰 js/util.js
    const BK_LAY = 'malang_bk_lay', BK_MAX = 150;
    const B = { list: [], all: [], kind: '', view: 'bin', cur: '', pg: 0, desk: null, album: null, byId: new Map(), opening: '', lay: null, drag: null, top: 0 };   // list = 지금 연 바구니(한 종류) · all = 모든 종이
    const BK_KINDS = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', tk: '떡메모지', leaf: '속지', memo: '메모지' };   // 😀 이모지 칸은 없앴어요 (도련 11-02 · 기기 이모지 그림 저작권)
    const bkKindOf = e => e.b || e.k;                                        // 들어갈 바구니 (😀 이모지는 b · 🌸 계절 · 🎁 캡슐 = 씰)
    const vis = id => { const m = bq(id); return !!m && m.style.display === 'flex'; };
    /* 📱 폰 = 톡 해서 꺼내요 (끌어내기 없음) · 💻 PC · 패드 = 바구니 밖으로 끌어내요 (톡 = 안 꺼내요) (도련 11-05)
       폰인지 = js/uimode.js UI.phone() (html.is-phone 도 거기서) */

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
        L.o = L.o.slice(-5000); const keep = new Set(L.o.concat([...ids])); Object.keys(L.p).forEach(id => { if (!keep.has(id)) delete L.p[id]; });   // 다 쓴 종이는 잊어요 (목록이 종류마다라 다른 종류 종이는 몰라요 → 지우지 않고 오래된 것부터 5000장까지만 · 도련 11-05)
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
    function openBasket(sort) {                                               // 첫 창 : 종류 아이콘 8개 · sort = 📒 스티커 정리로 왔어요 (종류를 고르면 바로 정리 책상 · 도련 11-01)
        if (vis('basketKindModal')) closeModal('basketKindModal');
        B.wantSort = !!sort;
        const t = document.querySelector('#basketModal .modal-title .mt-text') || document.querySelector('#basketModal .modal-title'); if (t) t.textContent = sort ? '📒 정리할 스티커 고르기' : '스티커';
        openModal('basketModal');
    }
    window.bkSortOpen = () => { if (B.view === 'desk' && vis('basketKindModal')) return; B.wantSort = true; bkOpenKind('seal'); };   // 📒 스티커 정리 (🪑 위 메뉴) = 고르는 창 없이 바로 씰스티커 정리 책상 · 다른 스티커는 위 줄 버튼으로 (도련 11-11)
    function bkOpenKind(k, keep) {                                            // 그 종류의 창 (🧺 바구니 · 📒 스티커첩)
        if (!BK_KINDS[k]) return;
        if (B.kind !== k || !keep) { B.view = 'bin'; B.cur = ''; B.pg = 0; B.desk = null; }   // keep : 떼는 창에서 돌아올 때 보던 화면 그대로
        B.kind = k; B.sortGo = !!B.wantSort; B.wantSort = false;
        if (vis('basketModal')) closeModal('basketModal');
        const t = bq('bkTitle'); if (t) t.textContent = '🗄️ ' + BK_KINDS[k];
        const w = bq('bkWrap'); if (w) w.innerHTML = '';
        { const m = bq('basketKindModal'); if (m) m.classList.toggle('bk-drw', B.view === 'bin'); }
        openModal('basketKindModal');
        bkRender(true);
    }
    function bkReopen() { if (B.kind) bkOpenKind(B.kind, true); else openBasket(); }   // 떼는 창이 닫히면 보던 바구니로
    const bkMsg = (h, btn) => `<div class="bk-msg">${h}${btn || ''}</div>`;
    async function bkRender(force) {
        const wrap = bq('bkWrap'); if (!wrap) return;
        if (!window.ownList) { wrap.innerHTML = bkMsg('🗄️ 서랍을 준비하고 있어요.'); return; }
        if (!ownMode()) { wrap.innerHTML = bkMsg('🔐 구글 계정으로 로그인하거나<br>🏠 로그인 없이 다꾸할 때 서랍을 쓸 수 있어요.'); return; }
        /* ⚡ 먼저 : 마지막으로 읽은 목록으로 바로 그려요 (드라이브를 기다리지 않게) → 그다음 새로 읽어 달라졌을 때만 다시 그려요 */
        const peek = force && window.ownPeek ? ownPeek(B.kind) : null;   // 그 종류만 (종류마다 목록 · 도련 11-05)
        if (peek) { B.all = peek.list.slice(); B.album = bkUnbag(JSON.parse(JSON.stringify(peek.album))); abReapply(); abSplit(); B.sig = bkSig(); if (!B.drag && !AB.drag) bkView(); }
        else if (!wrap.querySelector('.ab-tabs, .ab-head, .ab-body')) wrap.innerHTML = bkMsg('🗄️ 서랍을 여는 중…');
        try {
            const got = window.ownOpen ? await ownOpen(force, B.kind) : { list: await ownList(force, B.kind), album: { bd: [], rl: [], g: {} } };   // 그 종류의 목록 · 스티커첩을 동시에
            B.all = got.list.slice();
            B.album = bkUnbag(JSON.parse(JSON.stringify(got.album)));
            abReapply();                                                        // 아직 저장 안 된 정리는 그 위에 다시 (화면이 되돌아가지 않게)
        }
        catch (e) {
            if (peek) { console.warn(e); return; }                              // 보던 목록은 그대로 두어요
            wrap.innerHTML = bkMsg('⚠ 서랍을 열지 못했어요.<br>' + ownErrText(e), '<button type="button" class="btn bk-again" onclick="bkRender(true)">🔄 다시 열기</button>'); return;
        }
        const sig = bkSig();
        if (sig === B.sig && wrap.querySelector('.ab-body')) return;            // 그대로면 다시 그리지 않아요 (깜빡이지 않게)
        B.sig = sig;
        abSplit();
        if (B.drag || AB.drag) return;                                          // 끄는 중에는 다시 그리지 않아요 (놓으면 그려요)
        bkView();
    }
    const bkSig = () => { try { const H = bkHold(); return JSON.stringify([B.all.map(e => [e.id, e.u, e.q, e.th ? e.th.length : 0]), B.album, H ? [[...H.s], [...H.b]] : 0]); } catch (e) { return String(Math.random()); } };
    /* (바구니 미리 읽기 bkWarm 도 지웠어요 · 도련 10-25 → 처음 열 때 한 번 읽고, 그다음부터는 기억한 목록으로 바로 그려요) */
    /* 바구니 카드 : 종류마다 모양 · 남은 양은 두께(--q)로만 */
    const kitImg = u => `<img src="${esc(window.kitSize ? kitSize(u, 96) : u)}" alt="" loading="lazy" draggable="false" onerror="this.style.visibility='hidden'">`;
    function bkCard(e) {
        const used = new Set(e.u), cols = Math.ceil(Math.sqrt(e.n)), x = e.x || {}, q = e.q0 ? Math.max(.08, e.q / e.q0) : 1;
        let inner, cls = 'k-' + e.k;
        const qtyTxt = e.q0 && e.k !== 'tape' ? Math.max(0, e.q) + '장' : '';   // 남은 장수 (도련 10-26) · 🎀 테이프는 숫자 없이 롤 두께로만 (진짜 마테처럼 · 도련 10-26)
        if (e.k === 'tape') inner = `<span class="bk-roll" style="--q:${q.toFixed(2)}"><i style="background-image:url(&quot;${esc(e.th || '')}&quot;)"></i>${qtyTxt ? `<b class="bk-qty">${qtyTxt}</b>` : ''}</span>`;
        else if (e.k === 'tk') inner = `<span class="bk-pad" style="--q:${q.toFixed(2)}">${window.tkMiniHtml ? tkMiniHtml('my', { src: e.th, glue: x.glue || '' }) : ''}${qtyTxt ? `<b class="bk-qty top">${qtyTxt}</b>` : ''}</span>`;
        else if (e.k === 'memo') inner = `<span class="bk-pad bk-memo" style="--q:${q.toFixed(2)}"><img src="${esc(e.th || '')}" alt="" draggable="false">${qtyTxt ? `<b class="bk-qty top">${qtyTxt}</b>` : ''}</span>`;
        else if (e.k === 'leaf') inner = `<span class="lf-pick bk-leaf"><i class="lf-sw lf-my" style="--lf-img:url('${esc(e.th || '')}')"></i></span>`;
        else if (e.L && e.us) inner = abLayHtml(e.L, e.us.map(u => window.kitSize ? kitSize(u, 96) : u), used);   // 🗺️ 시트 배치 그대로 (뗀 자리는 빈 종이)
        else if (e.th) inner = `<img src="${esc(e.th)}" alt="" draggable="false">`;
        else inner = `<i class="bk-grid" style="--c:${cols}">${(e.us || []).map((u, i) => used.has(i) ? '<b class="bk-hole"></b>' : kitImg(u)).join('')}</i>`;
        return `<button type="button" class="bk-sh ${cls}${e.n === 1 && !e.q0 ? ' one' : ''}" data-id="${esc(e.id)}" aria-label="${esc(KIND_NAME[e.k] || '스티커')}">${inner}</button>`;
    }
    /* 🗺️ 시트 배치 그대로 (도련 10-29) : 흰 종이 (가로÷세로 = L.r) 위 원래 자리 · 크기 (% 라 카드 · 확대 어디서나) */
    function abLayHtml(L, srcs, used) {
        return `<i class="bk-lay" style="--r:${(+L.r).toFixed(4)}">${L.b.map((v, i) => used && used.has(i) ? '' : `<img src="${esc(srcs[i] || '')}" alt="" loading="lazy" draggable="false" style="left:${(v[0] * 100).toFixed(2)}%;top:${(v[1] * 100).toFixed(2)}%;width:${(v[2] * 100).toFixed(2)}%;height:${(v[3] * 100).toFixed(2)}%" onerror="this.style.visibility='hidden'">`).join('')}</i>`;
    }
    const KIND_NAME = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', memo: '메모지', tk: '떡메모지', leaf: '속지' };
    /* 바구니 꼬리표 : 무엇이 몇 개 (도련 10-25 · '5장'만으로는 헷갈려요) */
    function bkCount(n) {
        const u = { tape: ['테이프', '롤'], tk: ['떡메', '묶음'], memo: ['메모지', '묶음'], leaf: ['속지', '장'] }[B.kind] || ['스티커', '장'];
        return `${u[0]} ${n}${u[1]}`;
    }
    /* 🗄️ 스티커 서랍 (도련 11-05 : 창 안의 바구니 → 서랍 하나만 · 문구함 서랍과 같은 셀 그림 = 단색 + 굵은 선)
       위 = 이름 · 📒 정리 · 📤 공유 · 🗑 버리기 (윗판을 잡고 옮겨요 · ‹ 스티커 · ✕ 없음 · 도련 11-05) · 안 = 쓰는 법 한 줄 + 종이 (끌어 치우기 · 💻 밖으로 끌어내기 · 📱 톡) · 앞판 = 🏪 받기 · 손잡이 · 몇 장 */
    const BK_DRW_RGB = [245, 166, 190];                                       // 🎨 스티커 서랍 몸 색 (문구함보다 진하게 · 도련 11-05 채도 올리기)
    function bkDraw() {
        const wrap = bq('abBody'); if (!wrap) return;
        const nm = BK_KINDS[B.kind] || '스티커', has = B.list.length > 0, c = dkwColors(BK_DRW_RGB);   // 🎨 문구함 서랍과 같은 색 (js/deskgd.js) · 이름이 모두 받침 없이 끝나요 → '는'
        const bagNt = B.bagN ? `<p class="bkd-bag">🛍️ 책상 위 봉투에 <b>${bkCount(B.bagN)}</b>이 아직 있어요 · 봉투에서 꺼내 소품에 넣으면 여기에 보여요</p>` : '';
        const how = has ? `<p class="bk-how" id="bkHow">${UI.phone() ? `${esc(nm)}는 <b>톡</b> 눌러 꺼내서 써요` : `${esc(nm)}는 서랍 <b>밖으로 끌어내서</b> 써요`}</p>` : '';
        const tool = (on, ic, t, fn, cls) => on ? `<button type="button" class="bkd-chip${cls ? ' ' + cls : ''}" onclick="${fn}" title="${t}">${ic}<span>${t}</span></button>` : '';
        const ord = has ? bkOrder() : [], show = ord.slice(-BK_MAX);
        const ph = UI.menu(), ti = ic => ph ? '' : ic;   // ▤ 하단 메뉴 모드 (💻 📲 📱) = 글자만 · ✕ 옆 한 줄에 (도련 11-09 폰 · 11-10 하단 메뉴 모두 · 🪑 책상은 그대로)
        const tools = `${tool(has, ti('📒'), '정리', 'abDesk()')}${window.SHARE_ON ? tool(has, ti('📤'), '공유', 'bkShare()', 'bk-share') : ''}${tool(has, ti('🗑'), '버리기', 'bkBin()', 'bk-binb')}`;
        wrap.innerHTML = `<div class="bkd${ph ? ' bk-ph' : ''}" style="--db:${c.body};--dl:${c.light};--dk:${c.line};--dm:${c.mid}">
            <div class="bkd-top win-grip" title="끌어서 서랍을 옮길 수 있어요"><b>🗄️ ${esc(nm)}</b><i class="bkd-sp"></i>
                ${ph ? `${has ? `<span class="bkd-tools">${tools}</span>` : ''}<button type="button" class="bkd-x win-x" onclick="closeModal('basketKindModal')" aria-label="닫기">✕</button>` : tools}</div>
            <div class="bkd-in">${how}${has
                ? `<div class="bk-bin"><div class="bk-pile" id="bkPile">${show.map(bkCard).join('')}</div></div>`
                : `<div class="bk-bin empty"><button type="button" class="bk-say" onclick="bkGlowGet()"><b>🗄️ 서랍이 텅 비었어요</b><span>앞의 <em>🏪 기본${esc(nm)} 받기</em>로<br>받아서 채워요</span></button></div>`}</div>
            <div class="bkd-front"><button type="button" class="bkd-chip bkd-get" id="bkGet" onclick="bkGetKind()">🏪 기본${esc(nm)} 받기</button><i class="bkd-knob"></i><span class="bkd-cnt">${has ? bkCount(B.list.length) : '비었어요'}</span></div>
            ${bagNt}</div>`;
        if (!has) return;
        bkPlace(show, false);
        bkWire();
        let t = 0; const again = () => { clearTimeout(t); t = setTimeout(() => bkPlace(show, false), 60); };   // 그림이 늦게 오면 크기가 바뀌어요 → 다시 자리 잡기 (서랍 밖으로 안 삐져나오게)
        wrap.querySelectorAll('#bkPile img').forEach(im => { if (!im.complete) im.addEventListener('load', again, { once: true }); });
    }
    /* 📤 이 바구니의 종이를 골라 공유 파일로 (js/itemshare.js · 내 것은 그대로 · 받은 사람의 새 1개)
       ✂️ 내가 만든 것(from 'mine')만 보여요 (도련 11-09 · 무료 · 선물 · 공유받은 것 · 유료는 공유 안 돼요) */
    function bkShare() {
        if (!B.list.length || !window.ishSaveStickers) return;
        const mine = B.list.filter(e => e && e.from === 'mine');
        if (!mine.length) { showMsg('📤 <b>내가 만든 ' + esc(BK_KINDS[B.kind] || '스티커') + '</b>만 공유할 수 있어요.<br><span style="font-size:12px;color:#777;">✂️ 만들기에서 만든 것이 생기면 공유할 수 있어요.</span>'); return; }
        const el = document.createElement('div'); el.className = 'shx-pop ish-pick';
        el.innerHTML = `<div class="alert-card ish-card"><b class="shx-t">📤 공유할 ${esc(BK_KINDS[B.kind] || '스티커')}를 골라요</b><small class="ish-note">내가 만든 것만 보여요</small><div class="ish-grid">${mine.slice().reverse().map(e => `<label class="ish-it"><input type="checkbox" value="${esc(e.id)}"><span class="ish-card-in">${bkCard(e)}</span></label>`).join('')}</div>`
            + `<div class="alert-btns"><button type="button" class="btn btn-primary" data-ok>다음</button><button type="button" class="btn" data-no>취소</button></div></div>`;
        document.body.appendChild(el);
        el.querySelector('[data-no]').onclick = () => el.remove();
        el.querySelector('[data-ok]').onclick = () => { const ids = [...el.querySelectorAll('input:checked')].map(i => i.value); if (!ids.length) return; el.remove(); ishSaveStickers(ids, BK_KINDS[B.kind] || '스티커'); };
    }
    window.bkShare = bkShare;
    document.addEventListener('DOMContentLoaded', () => { const b = document.querySelector('.ish-in'); if (b) b.hidden = !window.SHARE_ON; });   // 🙈 스티커 창 '공유 파일 불러오기' = 공유 스위치 따라 (js/itemshare.js SHARE_ON)
    /* 🚛 버리기 (도련 11-02 · 현실처럼 모든 상품) : 이 바구니의 종이를 골라 → 바로 영구 삭제 (도련 11-11 · 상품 = 쓰레기차 · js/own.js ownDiscard · js/bin.js) */
    function bkBin() {
        if (!B.list.length || !window.ownDiscard) return;
        const nm = BK_KINDS[B.kind] || '스티커';
        const el = document.createElement('div'); el.className = 'shx-pop ish-pick';
        el.innerHTML = `<div class="alert-card ish-card"><b class="shx-t">🗑 버릴 ${esc(nm)}를 골라요</b><div class="ish-grid">${B.list.slice().reverse().map(e => `<label class="ish-it"><input type="checkbox" value="${esc(e.id)}"><span class="ish-card-in">${bkCard(e)}</span></label>`).join('')}</div>`
            + `<div class="alert-btns"><button type="button" class="btn btn-primary" data-ok>🚛 버리기</button><button type="button" class="btn" data-no>취소</button></div></div>`;
        document.body.appendChild(el);
        el.querySelector('[data-no]').onclick = () => el.remove();
        el.querySelector('[data-ok]').onclick = async () => {
            const ids = [...el.querySelectorAll('input:checked')].map(i => i.value); if (!ids.length) return;
            el.remove();
            if (await ownDiscard(ids, ids.length > 1 ? `${nm} ${ids.length}개` : nm)) bkRender(true);
        };
    }
    window.bkBin = bkBin;
    function bkGetKind() { const k = B.kind; if (vis('basketKindModal')) closeModal('basketKindModal'); if (SH_KINDS[k]) shOpenKind(k); else openShelf(); }
    function bkHowGlow() { const h = bq('bkHow'); if (!h) return; h.classList.remove('glow'); void h.offsetWidth; h.classList.add('glow'); }
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
    async function bkFlyOut(c, id) {                                          // ✋ 톡 = 가운데로 (다이어리는 저절로 펴지 않아요 · 붙이려면 다이어리를 톡)
        const at = { x: innerWidth / 2, y: innerHeight / 2 };
        if (window.dkFly) await dkFly(c, at.x, at.y);
        if (dsTake(id, at, true)) { abSplit(); B.sig = bkSig(); bkDraw(); }
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
            const d0 = B.drag; if (UI.phone()) d0.hold = setTimeout(() => { if (B.drag !== d0 || d0.moved) return; B.drag = null; dsTake(d0.id); }, 450);   // 📱 오래 누르기 = 꺼내기
        };
        pile.onpointermove = ev => {
            const d = B.drag; if (!d || ev.pointerId !== d.pid) return;
            if (!d.moved && Math.hypot(ev.clientX - d.x0, ev.clientY - d.y0) < 7) return;
            if (!d.moved) { d.moved = true; clearTimeout(d.hold); d.c.classList.remove('anim'); d.c.classList.add('lift'); d.c.style.zIndex = ++B.top; }
            const bin = pile.closest('.bk-bin'), br = bin && bin.getBoundingClientRect();
            if (!d.desk && !d.no && !UI.phone() && br && (ev.clientX < br.left || ev.clientX > br.right || ev.clientY < br.top || ev.clientY > br.bottom)) {   // 바구니 밖으로 끌어내면 = 그 종이가 페이지 위 스티커창으로 (바구니 창은 그대로)
                d.desk = dsTake(d.id, { x: ev.clientX, y: ev.clientY }, true);
                if (d.desk) d.c.style.visibility = 'hidden'; else d.no = true;   // 못 꺼냈으면(다 쓴 종이) 종이는 바구니에 그대로 보여요 · 안내도 한 번만 (도련 10-30)
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
            if (!d.moved) { if (ev && ev.type === 'pointerup') { if (UI.phone()) dsTake(d.id); else bkFlyOut(d.c, d.id); } return; }   // 💻 📲 톡 = 그 종이가 화면 가운데로 날아와 꺼내져요 (도련 11-11 · 끌기 = 손으로 꺼내기 그대로)   // 📱 톡 = 꺼내기 (바구니는 잠깐 비켰다 다시 떠요) · 💻 톡 = 쓰는 법이 반짝 (도련 11-05)
            const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight, cw = d.c.offsetWidth, ch = d.c.offsetHeight;
            const rot = parseFloat(d.c.style.getPropertyValue('--r')) || 0;
            L.p[d.id] = [Math.max(0, Math.min(1, parseFloat(d.c.style.left) / Math.max(1, W - cw))), Math.max(0, Math.min(1, parseFloat(d.c.style.top) / Math.max(1, H - ch))), rot];
            bkSetOrder(bkOrder().map(e => e.id).filter(id => id !== d.id).concat(d.id));   // 치운 종이는 맨 위에
            bkLaySave();
        };
        pile.onpointerup = up; pile.onpointercancel = up;
    }
    /* ---------- 종이 열기 : 종류마다 원래 연출로 (뗀 자리 · 쓴 양은 이미 빠져 있어요) ---------- */
    /* 🪑 책상 모드에서 다이어리가 책상에 누워 있으면 먼저 들어 올려요 (도련 10-29 : 누운 다이어리는 그림 복사본이라 붙인 스티커를 옮기거나 돌릴 수 없어요) */
    async function bkLift() {
        const H = document.documentElement;
        if (UI.menu() || H.classList.contains('desk-show') || !window.deskOpenDiary) return;
        deskOpenDiary(); await new Promise(r => setTimeout(r, 680));
    }
    window.bkLift = bkLift;
    /* 서랍 창은 그대로 둔 채 떼는 화면이 그 위에 떠요 (💻 📲 · 도련 11-05) · 📱 폰만 화면이 좁아 서랍 창이 잠깐 비켜요 (js/stickermaker.js stkLeave) */
    async function bkOpenSheet(id, stay) {                                    // stay = 다이어리는 그대로 (🏷️ 씰만 · 꺼낸 종이 톡 · 도련 11-05)
        if (!stay) {
            if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
            await bkLift();
        }
        if (B.opening || !window.ownSheet) return;
        B.opening = id;
        const card = document.querySelector(`.bk-sh[data-id="${CSS.escape(id)}"]`); if (card) card.classList.add('busy');
        try {
            const c = DS.m.has(id) ? await dsPrep(id).catch(() => null) : null;   // ⚡ 꺼내 둔 종이는 미리 읽어 둔 것으로 바로 (도련 10-26 · A → B 바꾸기 빠르게)
            const r = c ? { s: c.s } : await ownSheet(id);
            if (!r) { showMsg('이 스티커는 이미 다 썼어요.<br><span style="font-size:12px;color:#777;">다른 기기에서 썼을 수도 있어요.</span>'); if (vis('basketKindModal')) bkRender(true); return; }
            const s = r.s, x = s.x || {}, own = { id, wh: s.wh, gh: s.gh || [], raw: !s.baked };   // 👻 gh = 뗀 자리 모양 · raw = 하얀 테두리를 이제 둘러요 (뗀 자리도 그만큼 크게)
            const die = async a => c && c.baked ? a.map(u => u == null ? null : (c.baked[s.imgs.indexOf(u)] || u)) : !s.baked && window.pelBake ? Promise.all(a.map(u => u ? pelBake(u).catch(() => u) : null)) : a;   // 하얀 테두리 (⚙ 설정을 따라요 · 미리 구운 것이 있으면 그대로)
            let ok = false;
            if (s.k === 'seal') { const srcs = await die(s.imgs); if (window.stkLeave && UI.phone()) stkLeave(); ok = window.openStickerPeel && await openStickerPeel(srcs, { own, ts: !!s.ts, at: DS.at, L: s.L || null, sb: x.sb || '', stay: !!stay }); }   // 🗂️ sb = 내가 꾸민 시트 바탕 (js/sheetmaker.js)
            else if (s.k === 'piece') {
                const slots = s.imgs.map((u, i) => u ? i : -1).filter(i => i >= 0), srcs = await die(slots.map(i => s.imgs[i]));
                if (window.stkLeave && UI.phone()) stkLeave();
                ok = window.openPieceBag && await openPieceBag(srcs, { t: s.nm || '말랑달콤 조각', s: '', own: { id, slots } });
            }
            else if (s.k === 'paper') { if (window.stkLeave && UI.phone()) stkLeave(); ok = window.openPaperSheet && await openPaperSheet(s.imgs[0], { own: { id, a0: x.a0 }, bg: !!x.bg, grained: !!x.grained }); }
            else if (s.k === 'tape') { if (!window.placeTape) return; ok = placeTape(s.imgs[0], { id }, DS.tape); }   // 페이지에 바로 (DS.tape : 롤에서 뽑은 자리 · 길이 · 방향) · 비켰다 다시 떠요 (stkBlink)
            else if (s.k === 'tk') { if (!window.tkOwnOpen) return; if (window.stkLeave && UI.phone()) stkLeave(); tkOwnOpen('my', { src: s.imgs[0], glue: x.glue || '' }, { id }); ok = true; }
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
        if (x.pp === 'img' && window.tkNoteDress) { tkNoteDress(el, 'my', s.imgs[0]); el.style.width = '180px'; el.style.height = Math.round(180 * (x.h || 1) / (x.w || 1)) + 'px';
            const ta = el.querySelector('textarea'); if (ta && /^#[0-9a-f]{6}$/i.test(x.tc || '') && typeof styleTextarea === 'function') styleTextarea(ta, ta.dataset.font, x.tc, ta.dataset.size); }   // 🧁 상품 글자색 (어두운 메모지 = 밝은 글자)
        el.dataset.own = id;
        if (typeof saveData === 'function') saveData(false);
        ownQty(id, 1, el).catch(er => console.warn('메모지를 아직 못 줄였어요 (다시 해요) :', er));
        if (window.stkBlink) stkBlink();
        return true;
    }
    /* 📃 속지 한 장 : 오늘 페이지에 끼우면 그 한 장은 끝 (같은 속지가 이미 깔려 있으면 쓰지 않아요) */
    function bkLeaf(id, s, x) {
        if (!window.pickLeaf) return false;
        const lf = 'my', img = s.imgs[0];                                   // 🧁 샵 속지 = 모두 그림 (상품공방)
        if (typeof pageLeaf !== 'undefined' && pageLeaf === lf && pageLeafImg === img) { showMsg('📃 오늘 페이지에 이미 깔린 속지예요.'); return false; }
        if (window.stkBlink) stkBlink();
        pickLeaf(lf, img);
        ownQty(id, 1, null).catch(er => console.warn('속지를 아직 못 지웠어요 (다시 해요) :', er));
        return true;
    }
    if (window.ownOnChange) ownOnChange(() => { if (vis('basketKindModal')) bkRender(false); });


    /* ---------- 📒 스티커첩 (도련 10-25) : 종류 창 = [🧺 바구니 | 📒 스티커첩] 탭
       · 📒 바인더 = 종이째 포켓에 꽂기 (시트 수 · 한 쪽 포켓 = 그 바인더 상품) · 🤍 이형지북 = 한 칸씩 떼어 모으기 (20쪽 · 🏷️ 씰 · 😀 이모지 · 🧩 조각만)
       · 📒 정리하기(정리 책상) : 위 = 바구니 종이 한 줄 · 아래 = 바인더 포켓 / 이형지 → 끌어 놓거나 · 톡 고르고 톡 놓기
       · 이형지로 옮겨도 쓴 게 아니에요 (한 칸짜리 새 종이가 돼요 · 다이어리에 붙일 때 사라져요 · js/own.js ownRelMove)
       · 바인더 · 이형지북도 🏪 기본상품 샵 → 📔 다이어리에서 받아 와야 내 것이 돼요 (공짜여도 받아서 가지고 · 칸이 차면 또 받아요 · 도련 10-25)
         → 처음부터 '받아서 가진 것을 쓰면 줄어든다'를 알게 해요 (처음 선물 · ＋ 버튼 없음)
       · 정리한 모습은 스티커목록의 스티커첩.json(암호화)에 저장 → 다른 기기에서도 그대로 ---------- */
    const AB = { drag: null, busy: false };
    const REL_KINDS = new Set(['seal', 'piece']);
    /* 🧁 📒 스티커바인더 · 🤍 이형지북 = 서버 상품 (상품공방 '스티커바인더' · '이형지북' · 도련 11-04 : 상품 하나 = 디자인 하나 · 디자인이 늘어도 코드는 그대로)
       가진 책마다 pid = 그 디자인 상품 id (색 · 포켓 · 쪽수를 id 로 찾아요 · 서버 상품 그대로) */
    const AB_BDP = [], AB_RL = [];                                             // 🧁 서버 상품 그대로 (abBuild)
    function abBuild() {
        AB_BDP.length = 0; AB_RL.length = 0;
        const okC = v => /^#[0-9a-f]{6}$/i.test(v || ''), okN = v => +v > 0;     // 🔎 이름 · 색 · 포켓 · 장수 · 쪽수 = 상품 그대로 (빠지면 안 나와요)
        (window.prodList ? prodList('스티커바인더') : []).forEach(x => { if (String(x.P.이름 || '') && Array.isArray(x.P.색) && okC(x.P.색[0]) && okC(x.P.색[1]) && okN(x.P.포켓) && okN(x.P.장수)) AB_BDP.push(x); else console.warn('🧁 스티커바인더 속성이 모자라요 :', x.id); });
        (window.prodList ? prodList('이형지북') : []).forEach(x => { if (String(x.P.이름 || '') && okN(x.P.포켓) && okN(x.P.쪽수)) AB_RL.push(x); else console.warn('🧁 이형지북 속성이 모자라요 :', x.id); });
    }
    abBuild();
    const abBdP = b => AB_BDP.find(x => x.id === b.pid) || AB_BDP[0];         // 그 바인더 상품
    const abRlP = r => AB_RL.find(x => x.id === (r && r.pid)) || AB_RL[0];    // 그 이형지북 상품
    const abPer = b => +abBdP(b).P.포켓;                                       // 한 쪽 포켓 수 = 상품 '포켓'
    const abRelCap = r => { const p = abRlP(r); return p ? +p.P.포켓 : 0; };   // 이형지 한 쪽에 붙는 수 = 그 이형지북 상품 '포켓' (js/own.js)
    window.abRelCap = abRelCap;
    const abRid = () => Date.now().toString(36) + Math.floor(Math.random() * 1e8).toString(36);
    const abMine = arr => (arr || []).filter(x => x.k === B.kind);
    const abCol = b => abBdP(b).P.색.slice(0, 2);                              // 그 바인더 디자인 색 [겉, 테두리]
    const abNewBd = (k, pid) => { const p = AB_BDP.find(x => x.id === pid); return { id: 'b' + abRid(), k, lb: '', pid: p.id, n: +p.P.장수, p: {} }; };
    const abNewRl = (k, pid) => { const p = AB_RL.find(x => x.id === pid); return { id: 'r' + abRid(), k, lb: '', pid: p.id, n: +p.P.쪽수, it: [] }; };   // 📒 바인더 = 시트 수 (장수) · 🤍 이형지북 = 쪽수 (상품)
    /* 📥 받은 📒 스티커바인더 · 🤍 이형지북 (도련 11-08) : 샵 · 처음 선물로 받으면 종류 없이 이 목록에 → 스티커 창(📒 정리하기)에서 📥 불러오면 그 종류 _스티커첩.json 으로 옮겨요
         · 저장 = 소품 · 문구와 같은 목록 파일 (🔐 말랑달콤 / 빈스티커첩 / _목록.json 두 칸 · _목록_백업.json · 받은- 파일은 섞여요 (종류 = 상품) · js/drive.js esown · 💤 쓸 때 읽어요)
         · 한 줄 { id, pid : 상품, n : 시트 수 · 쪽수, lb : 라벨, at, from : basic 샵 · gift 처음 선물 · back 되돌린 것, c : 원본 파일 }
         · 📦 실제 책처럼 (도련 11-08 · 소품 · 문구와 같아요) : 🏪 샵에서 받으면 목록 한 줄 + 원본 파일 받은-<c>.json (🔐 · js/coll.js ofAdd) · 🎁 처음 선물 = 목록에만
           📥 불러오면 그 종류(씰 · 조각 …) _스티커첩.json 에 적히고 → 이 폴더에서는 목록 한 줄 · 원본 파일 둘 다 지워요 (책이 그 서랍으로 가요)
           ↩ 빼면 스티커첩에서 지우고 → 이 폴더에 목록 한 줄 · 원본 파일을 다시 만들어요 · 목록이 없어지면 백업 → 원본 파일들로 되살려요
         · 빈 책(꽂은 것 · 붙인 것이 없는 책)만 ↩ 빼기 = 이 목록으로 돌아와요 · 책상 위 종류 없는 책 톡 = 안내만 */
    const FR = { bd: { key: 'diary_sbd_own', l: 'malang_sbd_own', w: 'esown', get dir() { return DIRS.emptyBook; } }, rl: { key: 'diary_rlb_own', l: 'malang_rlb_own', w: 'esown', get dir() { return DIRS.emptyBook; } } };   // 📥 빈스티커첩 한 폴더 (도련 11-08)
    const frOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
    function frAll(t) { const v = typeof prefGet === 'function' ? prefGet(FR[t].key, FR[t].l) : null; return Array.isArray(v) ? v.filter(x => x && typeof x.id === 'string' && x.id && typeof x.pid === 'string') : []; }
    function frSet(t, L) { prefSet(FR[t].key, FR[t].l, (L || []).filter(Boolean)); }
    let frP = null, frGen = -1;
    function frReady() {                                                     // 💤 처음 쓸 때 한 번 읽어요 (없어졌으면 그 폴더 백업에서 · 🆕 처음 온 다꾸러 = 찾지 않아요 · js/dyown.js dymReady 와 같아요)
        if (!frOnline()) return Promise.resolve(true);
        if (frP && frGen === drive.gen) return frP;
        const gen = frGen = drive.gen;
        frP = (async () => {
            for (const t of ['bd', 'rl']) {
                const w = FR[t].w;
                if (drive.newbie && !drive.lazyOn.has(w)) { drive.lazyOn.add(w); (drive.keyNone = drive.keyNone || new Set()).add(w); }
                await keyFileLoad(w);
                if (gen !== drive.gen) return false;
                if (prefGet(FR[t].key, FR[t].l) === null && keyMade(w) && window.deskBackupRead) {   // 🛟 만든 적 있는데 없어요 = 그 폴더 / _목록_백업.json
                    const bk = await deskBackupRead().catch(() => null), L = bk && Array.isArray(bk[FR[t].key]) ? bk[FR[t].key] : null;
                    if (gen !== drive.gen) return false;
                    if (L && prefGet(FR[t].key, FR[t].l) === null) { frSet(t, L); if (window.diag) diag('rescue', { w: t, n: L.length }); }
                }
                if (prefGet(FR[t].key, FR[t].l) === null && keyMade(w) && window.ofScan) {   // 🛟 백업도 없으면 이 폴더의 원본 파일(받은-)들로 (샵에서 받은 책만 · 선물은 파일이 없어요)
                    const fs = await ofScan(FR[t].dir).catch(() => null);
                    if (gen !== drive.gen) return false;
                    if (fs && fs.length && prefGet(FR[t].key, FR[t].l) === null) { const P = t === 'bd' ? AB_BDP : AB_RL; frSet(t, fs.map(f => { const p = P.find(x => x.id === f.id); return p ? { id: f.u, pid: p.id, n: +(t === 'bd' ? p.P.장수 : p.P.쪽수), lb: '', at: Date.now(), from: 'basic', c: f.c } : null; }).filter(Boolean)); }
                }
            }
            return true;
        })();
        frP.catch(e => { console.warn('📥 받은 스티커첩 목록', e); if (frGen === gen) frP = null; });
        return frP;
    }
    const frNew = (t, pid, from) => { const P = (t === 'bd' ? AB_BDP : AB_RL).find(x => x.id === pid); return { id: (t === 'bd' ? 'b' : 'r') + abRid(), pid: P.id, n: +(t === 'bd' ? P.P.장수 : P.P.쪽수), lb: '', at: Date.now(), from }; };
    /* 🏪 기본상품 샵에서 받기 = 종류 없이 📥 받은 목록에 (도련 11-08 · 예전엔 넣을 서랍을 골랐어요) */
    async function abTakeTool(t, pid) {
        await frReady();
        const o = frNew(t, pid, 'basic');
        if (window.ofAdd) { const c = await ofAdd(FR[t].dir, { u: o.id, id: o.pid, from: 'basic' }); if (c) o.c = c; }   // 📦 원본 파일 받은-<c>.json (소품 · 문구처럼 · 게스트는 목록만)
        window.abLastGiven = { id: o.id, t: Date.now() };
        if (window.shopBagOn && shopBagOn() && window.dkBagHold) dkBagHold(o.id);   // 🛍️ 봉투 카드가 이 책을 기억해요
        frSet(t, frAll(t).concat([o]));
        if (window.dkDeskBooks) dkDeskBooks(true);                               // 📔 책상에도 (종류 없는 책)
        return o.id;
    }
    /* 📒 🤍 책상에 놓는 스티커첩 (도련 10-30 · js/desk.js dkVolsPaint) : [{ id, t: 'bd' | 'rl', k: 종류, lb, col: [바탕, 진한 색] }] · 톡 = 그 종류 창에서 그 책 펼치기 */
    window.abFreeOpen = abFreeOpen; window.abLoadFree = abLoadFree; window.abReturnFree = abReturnFree;
    window.abDeskList = async () => {
        if (!window.ownAlbumGet || !(window.ownMode && ownMode())) return [];
        let a; try { a = await ownAlbumGet(); } catch (e) { return []; }
        try { await frReady(); } catch (e) {}
        const ids = new Set((a.bd || []).map(b => b.id).concat((a.rl || []).map(r => r.id)));   // 불러오다 멈춰 두 곳에 있으면 = 스티커첩 쪽 (📥 목록 것은 안 보여요)
        const free = frAll('bd').filter(x => !ids.has(x.id)).map(b => ({ id: b.id, t: 'bd', k: '', lb: b.lb || '', col: abCol(b) })).concat(frAll('rl').filter(x => !ids.has(x.id)).map(r => ({ id: r.id, t: 'rl', k: '', lb: r.lb || '', col: ['#f6f2fb', '#c9b8e6'] })));   // 📥 종류 없는 책 (도련 11-08)
        return (a.bd || []).map(b => ({ id: b.id, t: 'bd', k: b.k, lb: b.lb || '', col: abCol(b) })).concat((a.rl || []).map(r => ({ id: r.id, t: 'rl', k: r.k, lb: r.lb || '', col: ['#f6f2fb', '#c9b8e6'] })), free);
    };
    window.abOpenAt = (k, v, id) => { bkOpenKind(k); B.view = v; B.cur = id; B.pg = 0; try { bkView(v); } catch (e) {} };
    function abGoShelf() { openShelf(); shOpenKind('tool'); }
    /* 정리한 종이는 바구니에서 빠져요 */
    /* 🛍️ 봉투 속 (💻 📲 책상 · 도련 11-02) : 꺼내기 전 = 보이지 않아요 · 저장은 하나씩 고치는 방식이라 보이는 것만 걸러도 안전해요 */
    const bkHold = () => window.deskBagHold ? deskBagHold() : null;
    function bkUnbag(a) {
        const H = bkHold(); B.bagAl = { bd: [], rl: [] }; if (!H || !H.b.size) return a;
        ['bd', 'rl'].forEach(t => { B.bagAl[t] = (a[t] || []).filter(b => H.b.has(b.id)); a[t] = (a[t] || []).filter(b => !H.b.has(b.id)); });
        return a;
    }
    const abNoneMsg = t => {                                                  // 바인더 · 이형지북이 없어요 (봉투에 있으면 꺼내라고)
        const nm = t === 'bd' ? '바인더' : '이형지북', jo = t === 'bd' ? '가' : '이';
        const fr = abFreeHtml(t);
        if (fr) return bkMsg(`📥 받아 둔 ${nm}${jo} 있어요.`, `<br><small>톡 = 이 서랍 ${nm}로 불러와 써요</small>${fr}`);
        if (abFreeBag(t)) return bkMsg(`🛍️ ${nm}${jo} 아직 책상 위 봉투에 있어요.`, '<br><small>봉투에서 꺼내 책상에 놓으면 여기에서 불러와 써요</small>');
        return bkMsg(`아직 ${nm}${jo} 없어요.`, `<button type="button" class="btn bk-again" onclick="abGoShelf()">🏪 기본상품 샵에서 ${nm} 받아 오기</button>`);
    };    /* 📥 받아 둔 책 (종류 없는 · 봉투에서 꺼낸 것만) → 이 서랍으로 불러오기 · 빈 책 ↩ 빼기 (도련 11-08) */
    const abFreeOk = t => t === 'bd' || REL_KINDS.has(B.kind);
    const abFreeIn = t => { const H = bkHold(), have = new Set(((B.album || {})[t] || []).map(x => x.id)); return frAll(t).filter(x => !have.has(x.id) && (t === 'bd' ? AB_BDP : AB_RL).some(p => p.id === x.pid)); };
    const abFreeList = t => { const H = bkHold(); return abFreeOk(t) ? abFreeIn(t).filter(x => !(H && H.b && H.b.has(x.id))) : []; };
    const abFreeBag = t => { const H = bkHold(); return abFreeOk(t) && abFreeIn(t).some(x => H && H.b && H.b.has(x.id)); };
    function abFreeHtml(t) {
        const L = abFreeList(t); if (!L.length) return '';
        return `<div class="ab-free">${L.map(x => { const P = (t === 'bd' ? AB_BDP : AB_RL).find(p => p.id === x.pid), c = t === 'bd' ? abCol(x) : ['#f6f2fb', '#c9b8e6'];
            return `<button type="button" class="ab-freeb" onclick="abLoadFree('${t}','${esc(x.id)}')"><i class="ab-chip${t === 'rl' ? ' rl' : ''}" style="--c1:${c[0]};--c2:${c[1]}"></i><b>${esc(x.lb || (P && P.P.이름) || (t === 'bd' ? '바인더' : '이형지북'))}</b><small>${t === 'bd' ? x.n + '장' : x.n + '쪽'}</small></button>`; }).join('')}</div>`;
    }
    function abFreeOpen(t) {                                                  // 📥 불러오기 창 (책이 있을 때 다른 책을 더)
        const nm = t === 'bd' ? '바인더' : '이형지북', fr = abFreeHtml(t);
        if (fr) showMsg(`<b>📥 받아 둔 ${nm}</b><br><small style="color:#777;">톡 = 이 서랍 ${nm}로 불러와요</small>${fr}`);
        else if (abFreeBag(t)) showMsg(`🛍️ ${nm}${t === 'bd' ? '가' : '이'} 아직 책상 위 봉투에 있어요.<br><small style="color:#777;">봉투에서 꺼내 책상에 놓으면 불러올 수 있어요</small>`);
        else showMsg(`받아 둔 ${nm}${t === 'bd' ? '가' : '이'} 없어요.<br><button type="button" class="btn bk-again" onclick="closeMsg();abGoShelf()">🏪 기본상품 샵에서 받아 오기</button>`);
    }
    async function abLoadFree(t, id) {
        try { if (window.closeMsg && document.querySelector('#customAlertModal[style*="flex"]')) closeMsg(); } catch (e) {}
        const k = B.kind; if (!abFreeOk(t) || !window.ownAlbum) return;
        await frReady().catch(() => {});
        const x = frAll(t).find(o => o.id === id); if (!x) { bkView(); return; }
        const o = t === 'bd' ? { id: x.id, k, lb: x.lb || '', pid: x.pid, n: x.n, p: {} } : { id: x.id, k, lb: x.lb || '', pid: x.pid, n: x.n, it: [] };
        abToast('불러오는 중', 'on');
        try {
            await abFlush();
            await ownAlbum(a => { const L = t === 'bd' ? a.bd : a.rl; if (!L.some(b => b.id === o.id)) L.push(o); }, [k]);   // ① 이 서랍 _스티커첩.json 에 먼저
            frSet(t, frAll(t).filter(b => b.id !== id));                          // ② 그다음 📥 목록에서 빼요 (멈춰도 잃지 않게 · 두 곳이면 스티커첩 쪽)
            if (x.c && window.ofDel) ofDel(FR[t].dir, x.c);                     // ③ 원본 파일(받은-<c>.json)도 지워요 (이제 이 종류 _스티커첩.json 에 있어요)
            const L = t === 'bd' ? B.album.bd : B.album.rl; if (!L.some(b => b.id === o.id)) L.push(o);
            if (B.desk) { B.desk.mode = t; if (t === 'bd') { B.desk.bd = o.id; B.pg = 0; } else { B.desk.rl = o.id; B.desk.rpg = 0; } }
            abSplit(); bkView(); B.sig = bkSig(); abToast('불러왔어요', 'ok');
            if (window.dkDeskBooks) dkDeskBooks(true);
        } catch (e) { abToast('', 'off'); abErr(e); }
    }
    async function abReturnFree(t, id) {                                       // ↩ 빈 책만 📥 받은 목록으로 돌려보내요
        const L = t === 'bd' ? B.album.bd : B.album.rl, x = L.find(o => o.id === id); if (!x) return;
        const empty = o => t === 'bd' ? !Object.keys(o.p || {}).length : !(o.it || []).length;
        if (!empty(x)) { showMsg('스티커가 들어 있는 책은 뺄 수 없어요.<br><small style="color:#777;">다 꺼내서 빈 책이 되면 뺄 수 있어요</small>'); return; }
        abToast('빼는 중', 'on');
        try {
            await abFlush(); await frReady();
            const line = { id: x.id, pid: x.pid, n: x.n, lb: x.lb || '', at: Date.now(), from: 'basic', back: 1 };   // ↩ 돌아온 책 = 분류는 그대로(지금은 모두 무료) + back (도련 11-09)
            if (window.ofAdd) { const c = await ofAdd(FR[t].dir, { u: x.id, id: x.pid, from: 'basic', back: 1 }); if (c) line.c = c; }   // 📦 원본 파일을 다시 만들어요 (게스트는 목록만)
            frSet(t, frAll(t).filter(o => o.id !== id).concat([line]));          // ① 📥 목록에 먼저
            await ownAlbum(a => { const M = t === 'bd' ? a.bd : a.rl, i = M.findIndex(o => o.id === id); if (i >= 0 && empty(M[i])) M.splice(i, 1); }, [B.kind]);   // ② 그다음 스티커첩에서 빼요
            const i = L.findIndex(o => o.id === id); if (i >= 0) L.splice(i, 1);
            if (B.desk) { if (t === 'bd') B.desk.bd = ''; else B.desk.rl = ''; }
            abSplit(); bkView(); B.sig = bkSig(); abToast('뺐어요', 'ok');
            if (window.dkDeskBooks) dkDeskBooks(true);
        } catch (e) { abToast('', 'off'); abErr(e); }
    }
    const abFreeBtns = (t, x) => (abFreeList(t).length || abFreeBag(t) ? `<button type="button" class="ab-mini" onclick="abFreeOpen('${t}')">📥 불러오기</button>` : '')
        + (x && (t === 'bd' ? !Object.keys(x.p || {}).length : !(x.it || []).length) ? `<button type="button" class="ab-mini" onclick="abReturnFree('${t}','${esc(x.id)}')">↩ 빼기</button>` : '');

    function abSplit() {
        const a = B.album || { bd: [], rl: [] }, placed = new Set();
        (a.bd || []).forEach(b => Object.values(b.p || {}).forEach(id => placed.add(id)));
        (a.rl || []).forEach(r => (r.it || []).forEach(t => placed.add(t.s)));
        B.byId = new Map(B.all.map(e => [e.id, e]));
        const H = bkHold(), bag = e => !!H && H.s.has(e.id);
        B.bagN = B.all.filter(e => bkKindOf(e) === B.kind && bag(e)).length;   // 🛍️ 봉투에 아직 있는 것
        B.list = B.all.filter(e => bkKindOf(e) === B.kind && !placed.has(e.id) && !DS.m.has(e.id) && !bag(e));   // 🗂️ 페이지에 꺼내 둔 종이는 바구니에 없어요 (✕ 로 치우면 돌아와요)
    }
    /* 화면 바꾸기 : bin (바구니) · album (스티커첩) · bd (바인더 펼침) · rl (이형지 펼침) · desk (정리 책상) */
    function bkView(v) {
        if (!v && B.sortGo && B.view === 'bin' && B.list) { B.sortGo = false; abDesk(); return; }   // 📒 스티커 정리로 왔으면 바로 정리 책상 (서랍이 비어도 · 도련 11-11)
        if (v && B.view === 'desk' && v !== 'desk') { abFlush(); if (AB.peelOn && window.closeStickerPeel) closeStickerPeel(); }   // 정리 책상을 나가면 바로 저장 · 띄운 종이도 닫아요
        if (v) { B.view = v; if (v === 'bin' || v === 'album') B.desk = null; }
        const wrap = bq('bkWrap'); if (!wrap || !B.album) return;
        if (B.view === 'album' && !abHasAlbum()) B.view = 'bin';               // 정리한 게 없으면 스티커첩 탭도 없어요
        const V = B.view || 'bin', sc = wrap.closest('.modal-content'), keep = sc ? sc.scrollTop : 0;
        { const m = bq('basketKindModal'); if (m) m.classList.toggle('bk-drw', V === 'bin'); }   // 🗄️ 서랍 = 창 없이 서랍만 (도련 11-05)
        { const m = bq('basketKindModal'); if (m) { m.classList.toggle('ab-space', V === 'desk' && abSpace()); m.classList.toggle('ab-ph', V === 'desk' && abPh()); m.classList.toggle('abs-rl', V === 'desk' && abSpace() && !!B.desk && B.desk.mode === 'rl'); } }   // abs-rl : 🪡 핀셋이 저절로 (js/elements.js pinForce)   // 🪑 💻 📲 정리하기 = 화면 전체 정리 공간 (📱 폰은 창 그대로 · 도련 10-29)
        const tabs = (V === 'bin' || V === 'album') && abHasAlbum() ? `<div class="ab-tabs"><button type="button" class="${V === 'bin' ? 'on' : ''}" onclick="bkView('bin')">🗄️ 서랍</button>`
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
    AB.pend = []; AB.fly = null; AB.flushT = 0; AB.rel = []; AB.relFly = null;   // hi : 이형지북 스티커 큰 그림 (id → 그림 · 작은 미리보기 대신 · abRelHi)
    AB.hi = new Map(); AB.hiBusy = new Set();   // rel : 🤍 이형지북에 붙인 것 (모아서 ownRelBatch)
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
            B.byId.set(o.tmp, { id: o.tmp, th: o.img }); AB.hi.set(o.tmp, o.img); r.it.push(Object.assign({ s: o.tmp, pg: o.pos.pg, x: o.pos.x, y: o.pos.y, r: o.pos.r }, o.pos.w ? { w: Math.round(o.pos.w), h: Math.round(o.pos.h) } : {}));
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
    function abOpen(v, id) { B.cur = id; B.pg = 0; bkView(v); }
    const abChip = b => { const c = abCol(b); return `<i class="ab-chip" style="--c1:${c[0]};--c2:${c[1]}"></i>`; };

    /* 📒 스티커첩 탭 : 바인더 표지 · 이형지 */
    function abAlbum() {
        const body = bq('abBody'), a = B.album, bds = abMine(a.bd), rls = abMine(a.rl);
        const plus = t => `<button type="button" class="ab-plus" onclick="abFreeOpen('${t}')"><b>📥</b>받아 둔 책<br>불러오기</button>`;   // 📥 (도련 11-08 · 샵에서 받은 책은 종류 없이 기다려요)
        const bd = bds.map(b => { const c = abCol(b); return `<button type="button" class="ab-bd" style="--c1:${c[0]};--c2:${c[1]}" onclick="abOpen('bd','${esc(b.id)}')"><span class="ab-cover">${b.lb ? `<i class="ab-lb">${esc(b.lb)}</i>` : ''}</span><small>${Object.keys(b.p).length}장 꽂힘</small></button>`; }).join('');
        const rl = rls.map(r => `<button type="button" class="ab-rlc" onclick="abOpen('rl','${esc(r.id)}')"><span class="ab-rlsheet">${abRelMini(r)}${r.lb ? `<i class="ab-lb">${esc(r.lb)}</i>` : ''}</span><small>${r.it.length}개 · ${r.n}쪽</small></button>`).join('');
        body.innerHTML = `<div class="ab-sec"><h4 class="ab-h"><span>📒 바인더</span><small>종이째 꽂아 둬요</small></h4><div class="ab-row">${bd}${plus('bd')}</div></div>`
            + (REL_KINDS.has(B.kind) ? `<div class="ab-sec"><h4 class="ab-h"><span>🤍 이형지북</span><small>하나씩 떼어 모아요</small></h4><div class="ab-row">${rl}${plus('rl')}</div></div>` : '')
            + '<p class="bk-note">바인더 · 이형지북은 🏪 기본상품 샵에서 받아 와서 📥 불러와 써요 · 빈 책은 ↩ 빼기로 돌려놔요<br>톡 하면 펼쳐져요 · 정리는 🗄️ 서랍 → 📒 정리에서 해요</p>';
    }
    function abRelMini(r) { return r.it.filter(t => !t.pg).slice(0, 14).map(t => { const e = B.byId.get(t.s); return e && e.th ? `<img src="${esc(e.th)}" alt="" style="left:${(t.x * 100).toFixed(1)}%;top:${(t.y * 100).toFixed(1)}%;--r:${(+t.r).toFixed(1)}deg">` : ''; }).join(''); }

    /* 📒 바인더 : 한 쪽 4포켓 · 쪽 넘기기 */
    const abBdOf = id => (B.album.bd || []).find(b => b.id === id);
    const abRlOf = id => (B.album.rl || []).find(r => r.id === id);
    function abPockets(b, desk) {
        let h = '';
        for (let i = B.pg * abPer(b); i < Math.min(b.n, (B.pg + 1) * abPer(b)); i++) {
            const e = b.p[i] && B.byId.get(b.p[i]);
            h += e ? `<div class="ab-pk full" data-pk="${i}">${bkCard(e)}</div>` : `<div class="ab-pk" data-pk="${i}"><span>${desk ? '여기에 놓기' : '빈 포켓'}</span></div>`;
        }
        return h;
    }
    function abBinderHtml(b, desk) {
        const c = abCol(b), pages = Math.ceil(b.n / abPer(b));
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
        body.innerHTML = abHead('스티커첩', 'album', abLbIn('bd', b) + `<button type="button" class="ab-mini" onclick="abColor('${esc(b.id)}')">🎨 표지</button>` + abFreeBtns('bd', b))
            + abBinderHtml(b, false) + '<p class="bk-note">종이를 톡 = 꺼내 쓰기 · 뗀 자리는 비어요 · 다 쓴 종이는 저절로 빠져요</p>';
        bq('abPage').onclick = ev => { const c = ev.target.closest('.bk-sh'); if (c) bkOpenSheet(c.dataset.id); };
    }
    function abLabel(t, id, v) { const fn = a => { const x = (t === 'bd' ? a.bd : a.rl).find(o => o.id === id); if (x) x.lb = String(v || '').trim().slice(0, 8); }; abQueue(fn); abSplit(); if (B.view !== 'desk') bkView(); B.sig = bkSig(); }
    function abColor(id) { const L = AB_BDP.filter(x => !x.P.숨김), fn = a => { const b = a.bd.find(o => o.id === id); if (b && L.length) b.pid = L[(L.findIndex(x => x.id === b.pid) + 1) % L.length].id; };   /* 🎨 표지 = 다음 바인더 디자인 */ abQueue(fn); bkView(); B.sig = bkSig(); }

    /* 🤍 이형지 : 톡 = 꺼내 쓰기 · 끌기 = 자리 옮기기 */
    function abRelItems(r, pg) {
        return r.it.filter(t => (t.pg || 0) === pg).map(t => { const e = B.byId.get(t.s); return e ? `<button type="button" class="ab-it" data-id="${esc(t.s)}" style="left:${(t.x * 100).toFixed(2)}%;top:${(t.y * 100).toFixed(2)}%;--r:${(+t.r).toFixed(1)}deg${t.w ? `;--iw:${t.w};--ih:${t.h}` : ''}" aria-label="스티커"><img src="${esc(AB.hi.get(t.s) || e.th || '')}" alt="" draggable="false"></button>` : ''; }).join('');
    }
    function abRel() {
        const body = bq('abBody'), r = abRlOf(B.cur); if (!r) { bkView('album'); return; }
        B.pg = Math.max(0, Math.min(r.n - 1, B.pg || 0));
        const items = abRelItems(r, B.pg);
        body.innerHTML = abHead('스티커첩', 'album', abLbIn('rl', r) + abFreeBtns('rl', r))
            + `<div class="ab-rel" id="abRel">${items}${items ? '' : `<span class="ab-relhint">${r.it.length ? '이 쪽은 비어 있어요' : '비어 있어요<br>🗄️ 서랍 → 📒 정리에서 떼어 붙여요'}</span>`}</div>`
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
        AB.rise = true;                                                       // 📱 서랍 시트가 아래에서 올라와요 (처음 한 번)
        B.desk = { mode: B.wantMode || 'bd', bd: (abMine(B.album.bd)[0] || {}).id || '', rl: (abMine(B.album.rl)[0] || {}).id || '', pick: '', sheet: null, sel: -1 };
        B.wantMode = ''; B.pg = 0; bkView('desk');
    }
    /* 🔁 정리할 스티커 바꾸기 (도련 11-11) : 정리 책상 위 줄 버튼 ▾ → 종류 목록 → 고르면 그 종류 정리 책상 (보던 📒 / 🤍 그대로) */
    const AB_KIC = { seal: 'seal', piece: 'piece', paper: 'paper', tape: 'tape', tk: 'tteok', leaf: 'leaf', memo: 'memo' };   // js/dakku.js 아이콘 (스티커 창과 같은 그림)
    const abKic = k => window.dkIcon && AB_KIC[k] ? dkIcon(AB_KIC[k]) : '';
    function abKindMenu(btn) {
        const old = bq('abKMenu'); if (old) { old.remove(); return; }
        const m = document.createElement('div'); m.id = 'abKMenu'; m.className = 'ab-kmenu'; m.setAttribute('role', 'menu');
        m.innerHTML = Object.entries(BK_KINDS).map(([k, n]) => `<button type="button" role="menuitem" class="${k === B.kind ? 'on' : ''}" onclick="abKindGo('${k}')"><i>${abKic(k)}</i>${esc(n)}</button>`).join('');
        btn.after(m); m.style.left = btn.offsetLeft + 'px';
        setTimeout(() => document.addEventListener('pointerdown', function off(ev) { if (ev.target.closest('#abKMenu, .ab-kind')) return; document.removeEventListener('pointerdown', off, true); const x = bq('abKMenu'); if (x) x.remove(); }, true), 0);
    }
    function abKindGo(k) {
        const x = bq('abKMenu'); if (x) x.remove();
        if (!BK_KINDS[k] || k === B.kind) return;
        const mode = B.desk ? B.desk.mode : '';
        if (B.view === 'desk') { abFlush(); if (AB.peelOn && window.closeStickerPeel) closeStickerPeel(); }   // 정리 책상을 나가는 것과 같게 (바로 저장 · 띄운 종이 닫기)
        B.wantSort = true; B.wantMode = mode; bkOpenKind(k);
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
        const inBin = B.list.filter(e => !(abSpace() && D.mode === 'rl' && e.id === D.pick));   // 🟩 매트에 펼친 종이는 바구니에서 빠져 보여요 (도련 10-29)
        const strip = inBin.length ? inBin.slice().sort((a, b) => b.at - a.at).map(e => `<div class="ab-sc${D.pick === e.id ? ' on' : ''}${B.up === e.id ? ' up' : ''}" data-id="${esc(e.id)}">${bkCard(e)}</div>`).join('') : '<span class="ab-stripempty">서랍이 비었어요</span>';
        let main;
        if (D.mode === 'bd') {
            const L = abMine(B.album.bd), b = L.find(x => x.id === D.bd) || L[0];
            if (b) { D.bd = b.id; const full = Object.keys(b.p).length >= b.n; main = (full ? bkMsg('📒 이 바인더는 가득 찼어요.', abFreeList('bd').length ? '<button type="button" class="btn bk-again" onclick="abFreeOpen(\'bd\')">📥 다른 바인더 불러오기</button>' : '<button type="button" class="btn bk-again" onclick="abGoShelf()">🏪 기본상품 샵에서 새 바인더 받아 오기</button>') : '') + `<div class="ab-target"><button type="button" class="ab-pick" onclick="abNextTarget()" aria-label="다른 바인더 고르기">${abChip(b)}${L.length > 1 ? `${L.findIndex(x => x.id === b.id) + 1} / ${L.length} ▾` : '바인더'}</button>${abLbDesk('bd', b)}<small>${Object.keys(b.p).length} / ${b.n}장</small>${abFreeBtns('bd', b)}</div>` + abBinderHtml(b, true); }
            else main = abNoneMsg('bd');
        } else {
            const L = abMine(B.album.rl), r = L.find(x => x.id === D.rl) || L[0];
            const panel = !D.pick ? '<div class="ab-peelhint">⬆ 위 줄에서 종이를 톡 골라요</div>' : !D.sheet ? '<div class="ab-peelhint">종이를 펼치는 중…</div>'
                : '<div class="ab-peelzone" id="abPeelZone"><span>🪡 핀셋으로 떼어 아래 이형지북에 붙여요</span></div>';   // 🤍 종이는 이 자리에 한 줄로 떠요 (js/stickerpeel.js 이형지북 모드)
            if (r) {
                D.rl = r.id; D.rpg = Math.max(0, Math.min(r.n - 1, D.rpg || 0));
                const onPg = r.it.filter(t => (t.pg || 0) === D.rpg).length;
                main = panel + `<div class="ab-target"><button type="button" class="ab-pick" onclick="abNextTarget()" aria-label="다른 이형지북 고르기"><i class="ab-chip rl"></i>${L.length > 1 ? `${L.findIndex(x => x.id === r.id) + 1} / ${L.length} ▾` : '이형지북'}</button>${abLbDesk('rl', r)}<small>이 쪽 ${onPg} / ${abRelCap(r)}개</small>${abFreeBtns('rl', r)}</div>`
                    + `<div class="ab-rel desk" id="abRel">${abRelItems(r, D.rpg)}<span class="ab-relhint">${D.sheet ? '떼어 낸 스티커를 여기에 놓아요' : ''}</span></div>` + abNavHtml(D.rpg, r.n, 'abRPage');
            }
            else main = panel + abNoneMsg('rl');
        }
        const tabsH = relOk ? `<div class="ab-tabs sm"><button type="button" class="${D.mode === 'bd' ? 'on' : ''}" onclick="abMode('bd')">📒 바인더에 꽂기</button><button type="button" class="${D.mode === 'rl' ? 'on' : ''}" onclick="abMode('rl')">🤍 이형지북에 붙이기</button></div>` : '';
        const noteH = `<p class="bk-note">${D.mode === 'bd' ? '종이를 끌어 빈 포켓에 놓아요 (톡 고르고 → 포켓 톡도 돼요)<br>꽂힌 종이를 톡 = 서랍으로 다시 빼기' : '종이를 톡 고르면 펼쳐져요 · 🪡 핀셋으로 떼어 이형지북에 붙여요<br>이형지북으로 옮겨도 쓴 게 아니에요 (다이어리에 붙일 때 사라져요)'}</p>`;
        if (abSpace()) {                                                      // 🪑 정리 공간 : 진짜 같은 바구니 · 바인더 · 이형지북 (js 아래 abSpaceHtml)
            body.innerHTML = abSpaceHtml(D, strip, tabsH);
            abSpacePlace();
        } else
        body.innerHTML = abHead('서랍', 'bin', '<b class="ab-ttl">📒 정리하기</b>')
            + tabsH
            + `<div class="ab-strip" id="abStrip">${strip}</div>` + main
            + noteH
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
    /* 🪑 정리 공간 (도련 10-29 · 💻 컴퓨터 · 📲 패드) : 창 대신 화면 전체가 정리하는 책상 · 🧺 바구니와 📒 정리북(바인더 · 이형지북)이 펼쳐져 있어요
       · 둘 다 위쪽 손잡이를 끌어 원하는 자리로 (다이어리처럼) → 정리북을 왼쪽 · 바구니를 오른쪽에 두는 것도 마음대로
       · 놓은 자리는 이 기기에 기억해요 (localStorage malang_ab_space · 화면 크기 비율) · 📱 폰은 예전 창 그대로 */
    const ABS_LOCAL = 'malang_ab_space', ABS_DEF = { basket: [.015, 0], book: [-1, 0] };
    const abSpace = () => true;                                               // 🪑 정리 공간 = 모든 기기 (📱 폰도 · 도련 11-11 : 예전 폰 창은 길고 깨져요) · 배치만 다르게 ↓
    const abPh = () => UI.phone();                                            // 📱 폰 배치 : 위 = 바인더 · 이형지북 한 쪽 · 아래 = 서랍 시트가 올라와요 (스티커 만들기처럼) · 종이를 위로 끌어 올려요
    const abPile = () => abSpace() && !abPh();                                // 🧺 흩어진 바구니 (💻 📲) · 📱 은 한 줄 (옆으로 넘겨 봐요)
    function abSpaceGet() { let v = null; try { v = JSON.parse(localStorage.getItem(ABS_LOCAL)); } catch (e) {} return Object.assign({}, ABS_DEF, v && typeof v === 'object' ? v : {}); }
    function abSpacePlace() {
        const room = bq('absRoom'); if (!room) return;
        if (abPh()) { abPhFit(room); const rl = bq('abRel'); if (rl) { rl.style.setProperty('--rk', abRelK().toFixed(4)); abRelHi(); } return; }   // 📱 = 끌어 옮기기 없이 위 · 아래 (css .ab-ph)
        const P = abSpaceGet(), W = room.clientWidth, H = room.clientHeight;
        abSpaceFit(room, W, H);
        abPilePlace();
        { const rl = bq('abRel'); if (rl) { rl.style.setProperty('--rk', abRelK().toFixed(4)); abRelHi(); } }   // 🤍 진짜 크기 · 큰 그림
        room.querySelectorAll('.abs-box').forEach(bx => {
            const f = P[bx.dataset.p] || ABS_DEF[bx.dataset.p], x = f[0] < 0 ? W - bx.offsetWidth - 24 : f[0] * W;   // 처음 = 바구니 왼쪽 · 정리북 오른쪽 끝
            bx.style.left = Math.max(0, Math.min(W - bx.offsetWidth, x)) + 'px'; bx.style.top = Math.max(0, Math.min(H - bx.offsetHeight, f[1] * H)) + 'px';   // 책상 밖으로 안 나가요
            bx.onpointerdown = ev => { if (ev.target.closest('.abs-grip')) abSpaceGrab(bx, ev); else abSpaceTop(bx); };
        });
    }
    /* 🪑 정리 공간 그림 (도련 10-29 · 아웃라인 + 한 색 · 그라데이션 · 그림자 없이)
       · 🧺 바구니 = 🧺 바구니 화면과 같은 상자(.bk-bin) 를 세로로 길게 · 종이가 기울어 수북이 겹쳐 담겨요 · 많으면 안에서 위아래로 넘겨 봐요
       · 📒 바인더 : 표지째 펼친 두 쪽 (가운데 6공 링) · 한 쪽 = 투명 포켓 4개 → 두 쪽씩 넘겨요
       · 🤍 이형지북 : 왼쪽 스프링 · 반짝이는 이형지 한 쪽 · 뒤로 겹친 종이 · 아래 🟩 커팅 매트 = 떼는 자리 (바구니 아래) */
    const ABS_RING = '<svg viewBox="0 0 120 34" aria-hidden="true"><path d="M10 27C24 3 96 3 110 27" fill="none" stroke="#9d88c2" stroke-width="11" stroke-linecap="round"/><path d="M10 27C24 3 96 3 110 27" fill="none" stroke="#f1eef8" stroke-width="6" stroke-linecap="round"/><circle cx="10" cy="28" r="5" fill="#8a789e"/><circle cx="110" cy="28" r="5" fill="#8a789e"/></svg>';
    /* 🤍 이형지북 처음 안내 (도련 10-29) : 종이를 매트에 펼치기 전까지 바구니 → 매트 화살표 + 한 줄 (바구니 판에 붙어 같이 움직여요) */
    const ABS_GUIDE = '<div class="abx-guide" aria-hidden="true"><b>붙일 스티커 종이를<br>초록 매트로 끌어다 놓아요</b>'
        + '<svg viewBox="0 0 170 90"><path d="M12 14C52 64 108 74 146 54" fill="none" stroke="#8d6f7f" stroke-width="17" stroke-linecap="round"/><path d="M12 14C52 64 108 74 146 54" fill="none" stroke="#ff8fb4" stroke-width="11" stroke-linecap="round"/>'
        + '<path d="M126 30L160 48L130 78Z" fill="#ff8fb4" stroke="#8d6f7f" stroke-width="3" stroke-linejoin="round"/></svg></div>';
    function abSpaceHtml(D, strip, tabsH) {
        const kn = ((bq('bkTitle') || {}).textContent || '').replace(/^\S+\s*/, '');
        const bar = `<div class="abs-bar"><button type="button" class="ab-back" onclick="bkView('bin')">‹ 서랍</button><button type="button" class="ab-kind" onclick="abKindMenu(this)" aria-haspopup="menu" title="정리할 스티커 바꾸기"><i>${abKic(B.kind)}</i>${esc(BK_KINDS[B.kind] || kn)}<b aria-hidden="true">▾</b></button>${tabsH}<span class="abs-fill"></span><button type="button" class="btn ab-done" onclick="bkView('bin')">다 했어요</button><button type="button" class="abs-x win-x" aria-label="닫기" onclick="bkView('bin');closeModal('basketKindModal')">✕</button></div>`;
        const nIn = B.list.filter(e => !(D.mode === 'rl' && e.id === D.pick)).length;   // 매트에 펼친 종이는 빼고 세요
        const grip = (t, n) => `<div class="abs-grip" title="끌어서 옮기기"><i aria-hidden="true">⠿</i><b>${t}</b>${n != null ? `<small>${n}</small>` : ''}</div>`;
        /* 🧺 바구니 */
        const peel = D.mode !== 'rl' ? '' : `<div class="abx-mat">${!D.pick ? '<div class="ab-peelhint">여기에 놓으면<br>스티커 종이가 펼쳐져요<br><small>🪡 핀셋으로 떼어 이형지북에 붙여요</small></div>' : !D.sheet ? '<div class="ab-peelhint">종이를 펼치는 중…</div>' : '<div class="ab-peelzone" id="abPeelZone"></div>'}</div>`;   // 🟩 커팅 매트 = 바구니 오른쪽에 붙어 같이 움직여요 (도련 10-29)
        const ph = abPh(), rise = ph && AB.rise; AB.rise = false;
        const phHead = !ph ? '' : `<div class="abp-head"><i class="abp-bar" aria-hidden="true"></i><b>🗄️ 서랍 <small>${nIn}장</small></b><span>${D.mode === 'bd' ? '종이를 위로 끌어 포켓에 꽂아요' : D.pick ? '🪡 핀셋으로 떼어 위 이형지북에 붙여요' : '종이를 톡 하면 여기서 펼쳐져요'}</span></div>`;   // 📱 아래 시트 머리
        const basket = `<section class="abs-box abs-basket${rise ? ' rise' : ''}${D.mode === 'rl' && D.pick ? ' picked' : ''}" data-p="basket">${ph ? phHead : grip('🗄️ 서랍', nIn + '장')}`
            + `<div class="abx-row"><div class="bk-bin abx-bin"><div class="ab-strip" id="abStrip">${strip}</div><span class="bk-tag">스티커 ${nIn}장</span></div>${peel}${D.mode === 'rl' && !D.pick && nIn && !ph ? ABS_GUIDE : ''}</div></section>`;
        /* 📒 바인더 · 🤍 이형지북 */
        let book;
        if (D.mode === 'bd') {
            const L = abMine(B.album.bd), b = L.find(x => x.id === D.bd) || L[0];
            if (!b) book = `<div class="abx-none">${abNoneMsg('bd')}</div>`;
            else {
                D.bd = b.id; const c = abCol(b), pages = Math.ceil(b.n / abPer(b)), full = Object.keys(b.p).length >= b.n, side = abPh() ? 'l' : abSideGet(), two = side === 'lr';   // 📱 = 한 쪽씩
                B.pg = Math.max(0, Math.min(pages - 1, B.pg || 0)); if (two) B.pg -= B.pg % 2;   // 양쪽 = 두 쪽씩 (왼쪽 = 홀수 쪽) · 한 쪽 = 한 쪽씩 다 넘겨요
                const pg = p => p < pages ? `<div class="abx-pg">${abPocketsAt(b, p)}<b class="abx-no">${p + 1}</b></div>` : '<div class="abx-pg end"></div>';
                const sw = s2 => `<button type="button" class="abx-side${side.includes(s2) ? ' on' : ''}" aria-pressed="${side.includes(s2)}" title="${s2 === 'l' ? '왼쪽 페이지' : '오른쪽 페이지'}" onclick="abSide('${s2}')">${window.dvSideSvg ? dvSideSvg(s2) : s2}</button>`;
                const nav = two ? `<span>${B.pg + 1}${B.pg + 1 < pages ? '–' + (B.pg + 2) : ''} / ${pages}쪽</span>` : `<span>${B.pg + 1} / ${pages}쪽</span>`, st = two ? 2 : 1;
                book = abSpaceTag('bd', b, L, `${Object.keys(b.p).length} / ${b.n}장`, sw('l') + sw('r') + abFreeBtns('bd', b))
                    + (full ? `<div class="abx-full">📒 가득 찼어요 · ${abFreeList('bd').length ? `<button type="button" class="ab-mini" onclick="abFreeOpen('bd')">📥 다른 바인더 불러오기</button>` : `<button type="button" class="ab-mini" onclick="abGoShelf()">🏪 새 바인더 받기</button>`}</div>` : '')
                    + `<div class="abx-binder ${two ? 'two' : 'one ' + (B.pg % 2 ? 'odd' : 'even')}" style="--c1:${c[0]};--c2:${c[1]}"><div class="abx-spread" id="abPage">${two ? pg(B.pg) + pg(B.pg + 1) : pg(B.pg)}</div><div class="abx-rings" aria-hidden="true">${ABS_RING.repeat(3)}<span></span>${ABS_RING.repeat(3)}</div></div>`
                    + `<div class="ab-nav abx-nav"><button type="button" class="ab-nb" aria-label="앞 쪽" onclick="abPage(-${st})"${B.pg ? '' : ' disabled'}>‹</button>${nav}<button type="button" class="ab-nb" aria-label="다음 쪽" onclick="abPage(${st})"${B.pg + st < pages ? '' : ' disabled'}>›</button></div>`;
            }
        } else {
            const L = abMine(B.album.rl), r = L.find(x => x.id === D.rl) || L[0];
            if (!r) book = `<div class="abx-none">${abNoneMsg('rl')}</div>`;
            else {
                D.rl = r.id; D.rpg = Math.max(0, Math.min(r.n - 1, D.rpg || 0));
                const onPg = r.it.filter(t => (t.pg || 0) === D.rpg).length;
                book = abSpaceTag('rl', r, L, `이 쪽 ${onPg} / ${abRelCap(r)}개`, abFreeBtns('rl', r))
                    + `<div class="abx-rlbook"><div class="abx-coil" aria-hidden="true">${'<i></i>'.repeat(14)}</div><div class="abx-stack" aria-hidden="true"></div>`
                    + `<div class="ab-rel desk abx-wax" id="abRel">${abRelItems(r, D.rpg)}<span class="ab-relhint">${D.sheet ? '떼어 낸 스티커를 여기에 놓아요' : ''}</span><b class="abx-no">${D.rpg + 1}</b></div></div>`
                    + abNavHtml(D.rpg, r.n, 'abRPage').replace('class="ab-nav"', 'class="ab-nav abx-nav"');
            }
        }
        return bar + `<div class="abs-room" id="absRoom">${basket}<section class="abs-box abs-book ${D.mode}" data-p="book">${grip(D.mode === 'rl' ? '🤍 이형지북' : '📒 바인더')}${book}</section></div>`;
    }
    /* 책 위에 붙은 이름표 : 다른 책 고르기 · 🏷️ 라벨 · 몇 장 */
    function abSpaceTag(t, x, L, cnt, extra) {
        return `<div class="abx-tag"><button type="button" class="ab-pick" onclick="abNextTarget()" aria-label="다른 ${t === 'bd' ? '바인더' : '이형지북'} 고르기">${t === 'bd' ? abChip(x) : '<i class="ab-chip rl"></i>'}${L.length > 1 ? `${L.findIndex(o => o.id === x.id) + 1} / ${L.length} ▾` : t === 'bd' ? '바인더' : '이형지북'}</button>${abLbDesk(t, x)}<small class="abx-cnt">${cnt}</small>${extra || ''}</div>`;
    }
    function abPocketsAt(b, p) {
        let h = '';
        for (let i = p * abPer(b); i < Math.min(b.n, (p + 1) * abPer(b)); i++) {
            const e = b.p[i] && B.byId.get(b.p[i]);
            h += e ? `<div class="ab-pk full" data-pk="${i}">${bkCard(e)}</div>` : `<div class="ab-pk" data-pk="${i}"><span>여기에 꽂기</span></div>`;
        }
        return h;
    }
    /* 📒 바인더 보는 쪽 (다이어리처럼 · 도련 10-29) : 왼쪽 · 오른쪽 페이지 스위치 · 둘 다 = 펼친 두 쪽 · 하나만 = 한 쪽씩 (모든 쪽을 차례로 · 고른 쪽부터)
       · 이 기기에 기억 (localStorage malang_ab_side · 기본 둘 다) */
    const ABS_SIDE = 'malang_ab_side';
    function abSideGet() { let v = ''; try { v = localStorage.getItem(ABS_SIDE) || ''; } catch (e) {} return ['lr', 'l', 'r'].includes(v) ? v : 'lr'; }
    function abSide(s2) {
        const cur = abSideGet(), on = { l: cur.includes('l'), r: cur.includes('r') };
        on[s2] = !on[s2]; if (!on.l && !on.r) return;                         // 둘 다 끌 수는 없어요
        const v = (on.l ? 'l' : '') + (on.r ? 'r' : ''), pg = B.pg || 0;
        if (v === 'lr') B.pg = pg - pg % 2;                                    // 펼치기 = 지금 쪽이 있는 두 쪽
        else if (cur === 'lr') B.pg = v === 'r' ? pg + 1 : pg;                // 한 쪽만 = 펼쳐 있던 두 쪽 중 고른 쪽
        try { localStorage.setItem(ABS_SIDE, v); } catch (e) {}
        bkView();
    }
    /* 📱 폰 크기 맞추기 : 아래 서랍 시트 높이를 뺀 자리에 바인더 · 이형지북 한 쪽이 꽉 차게 (A5 비율) */
    function abPhFit(room) {
        const bk = room.querySelector('.abs-basket'), bo = room.querySelector('.abs-book'); if (!bk || !bo) return;
        const W = room.clientWidth, H = room.clientHeight, R = 148 / 210, bd = bo.classList.contains('bd');
        const extra = bd ? 78 : 64, availW = W - 20 - extra, availH = H - bk.offsetHeight - (bd ? 150 : 140);   // 이름표 · 넘기기 줄 · 책 테두리
        let ph = Math.max(150, availH), pw = ph * R;
        if (pw > availW) { pw = availW; ph = pw / R; }
        bo.style.width = Math.round(pw + extra) + 'px'; bo.style.setProperty('--ph', Math.round(ph) + 'px');
    }
    /* 📐 크기 맞추기 : 바구니는 세로로 길게 (책상 높이 가득) · 바인더 · 이형지북은 실제 A5 속지 비율(148 × 210)로 남은 자리를 가득 */
    function abSpaceFit(room, W, H) {
        const bk = room.querySelector('.abs-basket'), bo = room.querySelector('.abs-book'); if (!bk || !bo) return;
        const mat = bk.querySelector('.abx-mat'), bw = Math.round(Math.max(250, Math.min(mat ? 380 : 430, W * (mat ? .24 : .27)))), mw = mat ? Math.round(Math.max(240, Math.min(360, W * .22))) : 0;
        bk.style.width = (bw + (mat ? mw + 12 : 0)) + 'px'; bk.style.setProperty('--bw', bw + 'px'); bk.style.setProperty('--mw', mw + 'px');
        bk.style.setProperty('--bh', Math.max(240, H - 58) + 'px');            // 이름표 · 아래 여백만 빼고 가득 (🟩 매트도 같은 높이로 옆에)
        const R = 148 / 210, availW = W - bk.offsetWidth - 56, availH = H - (bo.classList.contains('bd') ? 196 : 200);   // 이름표 · 라벨 줄 · 넘기기 줄
        let ph = availH, pw = ph * R;
        if (bo.classList.contains('bd')) {
            const two = !!bo.querySelector('.abx-binder.two'), extra = two ? 86 : 78, n = two ? 2 : 1;
            if (n * pw + extra > availW && availW > 300) { pw = (availW - extra) / n; ph = pw / R; }
            bo.style.width = Math.round(n * pw + extra) + 'px';
        } else {
            const extra = 64; if (pw + extra > availW && availW > 300) { pw = availW - extra; ph = pw / R; }
            bo.style.width = Math.round(pw + extra) + 'px';
        }
        bo.style.setProperty('--ph', Math.round(ph) + 'px');
    }
    /* 🧺 톡 = 맨 위로 (겹친 종이 중 그 종이를 올려서 봐요) · 🟩 매트 위인지 (떼는 판이 위에 떠 있어도 자리로 봐요) */
    function abRaise(id) {
        B.up = id; const c = document.querySelector(`#abStrip .ab-sc[data-id="${CSS.escape(id)}"]`);
        document.querySelectorAll('#abStrip .ab-sc').forEach(x => x.classList.toggle('up', x === c));
        if (c) { c.style.zIndex = ++AB.top; bkSetOrder(bkOrder().map(e => e.id).filter(x => x !== id).concat(id)); bkLaySave(); }
    }
    /* 🧺 정리 공간 바구니 = 🧺 바구니 화면처럼 종이가 흩어져 쌓여요 (같은 자리 기억 bkLay · 위에 쌓인 순서 bkOrder) */
    function abPilePlace() {
        const pile = bq('abStrip'); if (!pile || !abPile()) return;
        const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight, cards = [...pile.querySelectorAll('.ab-sc')], byId = new Map(cards.map(c => [c.dataset.id, c]));
        const ord = bkOrder().map(e => e.id).filter(id => byId.has(id));
        ord.forEach((id, z) => {
            const c = byId.get(id), cw = c.offsetWidth || 200, ch = c.offsetHeight || 200;
            const p = L.p[id] || [bkRnd(id, 1), bkRnd(id, 2), (bkRnd(id, 3) - .5) * 30];
            c.style.left = Math.round(p[0] * Math.max(0, W - cw)) + 'px'; c.style.top = Math.round(p[1] * Math.max(0, H - ch)) + 'px';
            c.style.setProperty('--tilt', p[2].toFixed(1) + 'deg'); c.style.zIndex = z + 1;
        });
        AB.top = ord.length + 1;
    }
    function abPileSave(c) {
        const pile = bq('abStrip'); if (!pile || !c) return;
        const L = bkLay(), W = pile.clientWidth, H = pile.clientHeight, cw = c.offsetWidth, ch = c.offsetHeight, id = c.dataset.id;
        L.p[id] = [Math.max(0, Math.min(1, c.offsetLeft / Math.max(1, W - cw))), Math.max(0, Math.min(1, c.offsetTop / Math.max(1, H - ch))), parseFloat(c.style.getPropertyValue('--tilt')) || 0];
        bkSetOrder(bkOrder().map(e => e.id).filter(x => x !== id).concat(id)); bkLaySave();
        B.up = id; document.querySelectorAll('#abStrip .ab-sc').forEach(x => x.classList.toggle('up', x === c));
    }
    function abOnMat(x, y) { const m = document.querySelector('#absRoom .abx-mat'), r = m && m.getBoundingClientRect(); return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
    window.abSheetDown = (sc, ev) => { if (!sc || ev.button > 0) return; AB.drag = { kind: 'sheet', src: sc, id: sc.dataset.id, slot: -1, x0: ev.clientX, y0: ev.clientY, pid: ev.pointerId, on: false, ghost: null }; };   // 떼는 판이 떠 있어도 바구니 종이를 끌어요 (js/stickerpeel.js)
    window.abSide = abSide;
    window.abGripAt = (el, ev) => { const bx = el && el.closest('.abs-box'); if (bx) abSpaceGrab(bx, ev); };   // 🤍 떼는 판이 떠 있어도 이름표를 끌면 옮겨져요 (js/stickerpeel.js)
    window.pinForce = () => B.view === 'desk' && !!B.desk && B.desk.mode === 'rl' && abPile() && vis('basketKindModal');   // 📱 폰은 예전처럼 손가락으로 (핀셋이 화면 구석에 떠 있지 않게 · 11-11)   // 🪡 정리 공간 이형지북 = 핀셋이 저절로 (js/elements.js)
    /* 🤍 이형지북 배율 = 이형지북 한 쪽 폭 ÷ 다이어리 한 쪽 폭 (둘 다 A5 비율) → 다이어리에 붙였을 때와 같은 크기로 보여요 (도련 10-29) */
    function abRelK() { const r = bq('abRel'), dw = window.dySize ? (dySize().pw || dySize().w) : 440;   /* pw = 바인더 책등 폭과 상관없는 종이 폭 (도련 11-04) */ return r && dw ? r.clientWidth / dw : .5; }
    /* 큰 그림으로 바꿔 보여요 (목록의 작은 미리보기는 흐려서 · 그 쪽에 보이는 것만 · 한 번 받으면 기억) */
    function abRelHi() {
        const box = bq('abRel'); if (!box || !window.ownSheetImgs) return;
        [...box.querySelectorAll('.ab-it')].map(b => b.dataset.id).filter(id => id && !id.startsWith('tmp') && !AB.hi.has(id) && !AB.hiBusy.has(id)).slice(0, 24).forEach(id => {
            AB.hiBusy.add(id);
            ownSheetImgs(id).then(r => { const u = r && r.imgs && r.imgs[0]; if (!u) return; AB.hi.set(id, u); const im = document.querySelector(`#abRel .ab-it[data-id="${CSS.escape(id)}"] img`); if (im) im.src = u; }).catch(() => {}).finally(() => AB.hiBusy.delete(id));
        });
    }
    function abSpaceTop(bx) { document.querySelectorAll('#absRoom .abs-box').forEach(o => o.classList.toggle('top', o === bx)); }
    function abSpaceGrab(bx, ev) {                                            // ✋ 손잡이를 끌어 옮기기
        if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation(); abSpaceTop(bx);
        const room = bq('absRoom'), R = room.getBoundingClientRect(), l0 = bx.offsetLeft, t0 = bx.offsetTop, x0 = ev.clientX, y0 = ev.clientY;
        bx.classList.add('lift');
        const mv = e => {
            if (e.pointerId !== ev.pointerId) return;
            bx.style.left = Math.max(0, Math.min(R.width - bx.offsetWidth, l0 + e.clientX - x0)) + 'px';
            bx.style.top = Math.max(0, Math.min(R.height - bx.offsetHeight, t0 + e.clientY - y0)) + 'px';   // 아래로도 책상 밖으로 안 나가요
            if (AB.peelOn && window.pelRelayout) pelRelayout();
        };
        const up = e => {
            if (e.pointerId !== ev.pointerId) return;
            removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
            bx.classList.remove('lift');
            const P = abSpaceGet(); P[bx.dataset.p] = [bx.offsetLeft / R.width, bx.offsetTop / R.height];
            try { localStorage.setItem(ABS_LOCAL, JSON.stringify(P)); } catch (x) {}
            if (AB.peelOn && window.pelRelayout) pelRelayout();
        };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    }
    addEventListener('resize', () => { if (B.view === 'desk' && vis('basketKindModal')) abSpacePlace(); });
    /* 🤍 고른 종이를 진짜 씰 종이처럼 띄워요 : 한 줄 · 옆으로 밀어 넘기기 · 🪡 핀셋으로 가장자리를 집어 떼기 → 이형지북 위에 놓기 (js/stickerpeel.js · 도련 10-25) */
    async function abPeelOpen() {
        const D = B.desk; if (!D || !D.sheet || !window.openStickerPeel) return;
        const id = D.sheet.id; AB.peelOn = id;
        const imgs = D.sheet.baked || !window.pelBake ? D.sheet.imgs : await Promise.all(D.sheet.imgs.map(u => u ? pelBake(u).catch(() => u) : null));   // 하얀 테두리 (⚙ 설정을 따라요)
        const D2 = B.desk;
        if (!D2 || !D2.sheet || D2.sheet.id !== id || D2.mode !== 'rl' || B.view !== 'desk') { if (AB.peelOn === id) AB.peelOn = ''; return; }
        const ok = await openStickerPeel(imgs, { L: D.sheet.L || null, sb: D.sheet.sb || '', rel: {
            at: () => { const z = bq('abPeelZone'); return z ? z.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: 130, right: innerWidth, bottom: 130 }; },
            target: () => { const r = bq('abRel'); return r ? r.getBoundingClientRect() : null; },
            alive: () => vis('basketKindModal') && B.view === 'desk' && !!bq('abPeelZone'),
            scale: () => abSpace() ? abRelK() : 0,                              // 🟩 매트 위 스티커 = 이형지북에 붙는 진짜 크기 (도련 10-29)
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
        pos = Object.assign({ x: Math.max(.08, Math.min(.92, pos.x)), y: Math.max(.1, Math.min(.9, pos.y)), r: Math.max(-25, Math.min(25, pos.r || 0)), pg: D.rpg || 0 }, pos.w > 0 && pos.h > 0 ? { w: Math.round(pos.w), h: Math.round(pos.h) } : {});   // w · h = 진짜 크기
        let img = '';
        if (D.sheet && D.sheet.id === src) { img = D.sheet.imgs[k] || ''; D.sheet.imgs[k] = null; }
        const tmp = 'tmp' + Date.now() + k, rel = abRlOf(D.rl), relEl = bq('abRel');                // 화면에는 바로 붙여 보여요
        if (rel && img) { B.byId.set(tmp, { id: tmp, th: img }); AB.hi.set(tmp, img); rel.it.push(Object.assign({ s: tmp, pg: pos.pg, x: pos.x, y: pos.y, r: pos.r }, pos.w ? { w: Math.round(pos.w), h: Math.round(pos.h) } : {})); }
        if (relEl && img) {
            relEl.insertAdjacentHTML('afterbegin', `<button type="button" class="ab-it" data-id="${tmp}" style="left:${(pos.x * 100).toFixed(2)}%;top:${(pos.y * 100).toFixed(2)}%;--r:${pos.r}deg${pos.w ? `;--iw:${Math.round(pos.w)};--ih:${Math.round(pos.h)}` : ''}" aria-label="스티커"><img src="${esc(img)}" alt="" draggable="false"></button>`);
            const sm = document.querySelector('.ab-target small, .abx-cnt'); if (sm && rel) sm.textContent = `이 쪽 ${rel.it.filter(t => (t.pg || 0) === pos.pg).length} / ${abRelCap(rel)}개`;
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
        if (!r || !r.imgs.some(u => u != null)) { D.pick = ''; D.sheet = null; } else D.sheet = { id, imgs: r.imgs, baked: r.baked, L: r.L, sb: r.sb };
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
            if (!B.list.length) { const st = bq('abStrip'); if (st) st.innerHTML = '<span class="ab-stripempty">서랍이 비었어요</span>'; }
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
            st.prepend(sc); st.scrollLeft = 0; abPilePlace();
            abDeskCounts();
        } else bkView();
        B.sig = bkSig();
    }
    function abDeskCounts() { const D = B.desk, b = D && abBdOf(D.bd), sm = document.querySelector('.ab-target small, .abx-cnt'); if (b && sm) sm.textContent = `${Object.keys(b.p).length} / ${b.n}장`; }
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
        const ghost = () => {
            const r = d.src.getBoundingClientRect(), g = document.createElement('div');
            g.className = 'ab-ghost' + (d.kind === 'st' ? ' st' : ''); g.innerHTML = d.src.innerHTML; g.style.width = (d.src.offsetWidth || r.width) + 'px';
            document.body.appendChild(g); d.ghost = g; d.gw = d.src.offsetWidth || r.width; d.gh = d.src.offsetHeight || r.height;
            d.src.classList.add('ab-lifted');
        };
        if (!d.on) {
            if (Math.hypot(dx, dy) < 8) return;
            if (d.kind === 'sheet' && !abPile() && Math.abs(dx) > Math.abs(dy) * 1.2) { AB.drag = null; return; }   // 옆으로 = 줄 넘겨 보기 (🪑 정리 공간의 바구니는 아무 쪽으로나 끌어요)
            d.on = true;
            if (d.kind === 'sheet' && abPile() && bq('abStrip')) {            // 🧺 정리 공간 : 바구니 안에서는 종이를 그대로 끌어 뒤적여요 · 바구니 밖으로 나가면 들어서 옮겨요 (도련 10-29)
                d.pile = bq('abStrip'); d.inBin = true; d.l0 = d.src.offsetLeft; d.t0 = d.src.offsetTop;
                d.src.style.zIndex = ++AB.top; d.src.classList.add('lift');
            } else ghost();
        }
        if (d.inBin) {
            const R = d.pile.getBoundingClientRect();
            if (ev.clientX >= R.left && ev.clientX <= R.right && ev.clientY >= R.top && ev.clientY <= R.bottom) {
                const cw = d.src.offsetWidth, ch = d.src.offsetHeight;
                d.src.style.left = Math.max(-cw * .25, Math.min(R.width - cw * .75, d.l0 + dx)) + 'px';
                d.src.style.top = Math.max(-ch * .3, Math.min(R.height - ch * .6, d.t0 + dy)) + 'px';
                return;
            }
            d.inBin = false; d.src.classList.remove('lift'); d.src.style.left = d.l0 + 'px'; d.src.style.top = d.t0 + 'px'; ghost();   // 바구니 밖 = 들어서 옮기기 (매트 · 포켓)
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
        if (d.src) d.src.classList.remove('lift');
        if (d.inBin) { if (ok) abPileSave(d.src); return; }                     // 🧺 바구니 안에서 뒤적였어요 (자리 · 맨 위 기억)
        if (!ok) return;
        if (!d.on) {
            if (d.kind !== 'sheet') { abTapSt(d.slot); return; }
            if (abPile()) abRaise(d.id);                                       // 🪑 정리 공간 : 톡 = 그 종이를 맨 위로 올려 봐요
            if (!(abPile() && B.desk && B.desk.mode === 'rl')) abTapSheet(d.id);   // 📱 = 톡 하면 아래 매트에 펼쳐져요   // 🤍 이형지북은 톡으로 매트에 안 가요 (끌어서 매트에 놓아야 · 도련 10-29)
            return;
        }
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        if (d.kind === 'sheet') {
            const pk = el && el.closest('.ab-pk:not(.full)');
            if (pk && B.desk && B.desk.mode === 'bd') abPutSheet(d.id, +pk.dataset.pk);
            else if (B.desk && B.desk.mode === 'rl' && (!abPile() || abOnMat(ev.clientX, ev.clientY))) { if (B.desk.pick !== d.id) abTapSheet(d.id); }   // 🟩 매트 위에 놓으면 펼쳐져요
        } else {
            const box = el && el.closest('#abRel');
            if (box) abPutSt(d.slot, ev.clientX, ev.clientY, box);
        }
    }
    document.addEventListener('pointerup', abUp);
    document.addEventListener('pointercancel', abUp);

    window.bkView = bkView; window.abOpen = abOpen; window.abGoShelf = abGoShelf; window.abPage = abPage; window.abRPage = abRPage; window.abLabel = abLabel; window.abColor = abColor;
    window.abDesk = abDesk; window.abKindMenu = abKindMenu; window.abKindGo = abKindGo; window.bkGetKind = bkGetKind; window.shQuick = shQuick; window.bkGlowGet = bkGlowGet; window.abMode = abMode; window.abTapSheet = abTapSheet; window.abItGrab = abItGrab; window.abNextTarget = abNextTarget;

    /* ---------- 🏪 기본상품 샵 (도련 10-25) : 아이콘 8개 → 그 종류의 기본상품 샵 창 → 🔍 확대 → 🧺 받기
       카테고리 · 스티커 이름 없이 (현실 가게도 그렇게 팔아요) · 새로 들어온 것이 맨 앞 · 📄 모조지만 '모양 · 배경' 두 매대 ---------- */
    const SH = { kind: '', items: [], zoom: -1, seq: 0 };
    const kitThumb = (u, w) => window.kitSize ? kitSize(u, w) : u;
    /* 종류 : [아이콘 이름, 창 이름, 상품 만들기] (기본상품 샵 첫 창의 아이콘 순서 = 이 순서) */
    const SH_KINDS = {
        seal: ['씰스티커', async () => {
            const kit = await basicKit(), out = [];
            kit.sheets.filter(x => !(x.P && x.P.스토어)).reverse().forEach(x => out.push([x.us, x.pv, x.L]));   // 💎 스토어(유료) 씰은 빼요       // 새로 들어온 것(뒤 번호)이 맨 앞 · pv = 묶음 미리보기 한 장
            kit.images.slice().reverse().forEach(x => out.push([[x.u]]));            // 낱장
            const items = out.map(([us, pv, L]) => ({ cnt: `씰 ${us.length}개`, look: 'grid', pv, L, thumbs: us.map(u => kitThumb(u, 96)), bigs: us.map(u => kitThumb(u, 360)), take: () => ownTakeKit(us, '', L) }));   // 🗺️ L = 시트 배치 그대로
            return items;
        }],
        piece: ['조각스티커', async () => window.sbShelf ? sbShelf('piece') : []],
        paper: ['모조지스티커', async () => window.sbShelf ? sbShelf('paper') : []],
        tape: ['마스킹테이프', async () => window.sbShelf ? sbShelf('tape') : []],   // 🧁 테이프 · 떡메 · 속지 · 메모지 = 모두 서버 상품 (상품공방 · 도련 11-02)
        tk: ['떡메모지', async () => window.sbShelf ? sbShelf('tk') : []],
        leaf: ['속지', async () => window.sbShelf ? sbShelf('leaf') : []],
        memo: ['메모지', async () => window.sbShelf ? sbShelf('memo') : []],
        tool: ['다이어리', async () => {                                        // 📔 날짜형 다이어리 (해마다 기본 다이어리 · js/dyyear.js · 도련 10-28) + 🗂️ 스티커 정리 바인더 · 이형지북 (공짜지만 받아 와야 내 것 · 도련 10-25)
            const on = (K, x) => !x.P.숨김 && prodList(K).some(y => y.id === x.id);   // 진열 = 서버에 있고 숨기지 않은 디자인
            const out = (window.dyyShopList ? dyyShopList() : [])
                .concat(AB_BDP.filter(x => on('스티커바인더', x)).map(x => ({ cnt: `${x.P.이름} · 속지 ${Math.ceil(x.P.장수 / x.P.포켓 / 2)}장 · 시트 ${+x.P.장수}장 꽂아요`, desc: `한 쪽에 ${+x.P.포켓}포켓 · 앞뒤 ${Math.ceil(x.P.장수 / x.P.포켓)}쪽 · 꽂아도 쓴 게 아니에요`, look: 'binder', pid: x.id, tool: 'bd', name: String(x.P.이름) })))
                .concat(AB_RL.filter(x => on('이형지북', x)).map(x => ({ cnt: `${x.P.이름} · 이형지 ${+x.P.쪽수}쪽 · 스티커 ${x.P.쪽수 * x.P.포켓}개`, desc: `한 쪽에 ${+x.P.포켓}개씩 붙여요 · 옮겨 붙여도 쓴 게 아니에요`, look: 'relbook', pid: x.id, tool: 'rl', name: String(x.P.이름) })));
            return out;
        }],
        bg: ['배경지', async () => window.bgoShopList ? bgoShopList() : []],   // 🌈 배경지 (도련 10-28 · 받으면 🌈 배경지 창 보관함 · js/bgown.js)
        gd: ['문구용품', async () => {                                              // ✏️ 문구함 문구 (도련 10-27 · 받으면 🗄️ 문구함으로 · 같은 것은 하나만)
            const L = window.gdShopList ? gdShopList() : [];                   // 칸 = 문구 종류 (shCatList)
            return L.map(x => ({ cnt: x.name, look: 'gd', art: x.art, g: x.g, gid: x.id, give: f => gdGive(x.id, f) }));   // gid = 봉투 카드가 기억해요
        }],
        desk: ['책상소품', async () => (window.deskShopList ? deskShopList() : []).map(d => ({   // 🪑 책상 소품 (도련 10-27 · 받으면 📦 소품 보관함으로 · 같은 것도 여러 개 · 받기 전에 물어봐요)
            cnt: d.name, look: 'desk', src: d.src, sec: d.kind, wall: d.wall, give: f => deskGive(d.id, f), name: d.name, id: d.id })).concat(window.dsShopList ? dsShopList() : [])],   // + 🧱 벽지 · 🪵 책상 (js/deskskin.js)
        season: ['계절 스티커', async () => {                                    // 🌸 이벤트 때만 (SEASON_OPEN · 아이콘도 그때만)
            if (!shSeasonOn()) return [];
            const md = new Date(Date.now() + 9 * 3600000).toISOString().slice(5, 10), inDays = v => { const m = /^(\d\d-\d\d)~(\d\d-\d\d)$/.exec(String(v || '').trim()); return !!m && (m[1] <= m[2] ? md >= m[1] && md <= m[2] : md >= m[1] || md <= m[2]); };   // 🔎 나오는 기간 = 상품 (MM-DD~MM-DD · 겨울처럼 해를 넘겨도)
            const L = window.prodShelf ? prodShelf('계절스티커').filter(x => inDays(x.P.기간)) : [];   // 🧁 계절 상품 (상품공방 · 도련 11-02) · 그림에 하얀 테두리가 이미 있어요
            const asData = u => /\.svg$/i.test(u) ? fetch(u).then(r => r.text()).then(t => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(t)) : Promise.resolve(u);
            return L.map(x => { const us = Object.keys(x.u).sort().map(r => x.u[r]);
                return { cnt: `씰 ${us.length}개`, look: 'grid', thumbs: us, take: async () => ({ k: 'seal', imgs: await Promise.all(us.map(asData)), baked: true }) }; }).filter(x => x.thumbs.length);
        }],
    };
    /* 🎁 처음 선물 (도련 11-06 · 상품공방 '처음받기' 체크 = 처음 온 다꾸러에게 · 앱은 체크된 것만 줘요 · js/desk.js giftEnsure)
       스티커 = 🏷️ 씰 · 🧩 조각 · 📄 모조지 · 🧻 떡메 · 📃 속지 · 📝 메모지 · 🌸 계절 · 🎁 캡슐 (🎀 마스킹테이프는 마테 정리함에 꽂아서 따로 · dkStarterTapes)
       → ownTakeMany 에 넘길 종이 [] · 그 종류 목록(_목록.json)에 들어가요 · 💎 스토어 상품은 빼요 · 숨김이어도 체크하면 줘요 */
    async function bkStarterSheets() {
        const jobs = [], one = f => jobs.push(Promise.resolve().then(f).catch(e => { console.warn('🎁 처음 선물 스티커', e); return null; }));
        try { const kit = await basicKit(); kit.sheets.filter(x => x.P && x.P.처음받기 && !x.P.스토어).forEach(x => one(() => ownKitDesc(x.us, '', x.L))); } catch (e) { console.warn('🎁 처음 선물 씰', e); }
        for (const kind of ['piece', 'paper', 'tk', 'leaf', 'memo']) (window.sbStarter ? await sbStarter(kind) : []).forEach(x => one(x.take));
        const asData = u => /\.svg$/i.test(u) ? fetch(u).then(r => r.text()).then(t => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(t)) : Promise.resolve(u);
        (window.prodList ? prodList('계절스티커') : []).filter(x => x.P.처음받기).forEach(x => { const us = Object.keys(x.u).sort().map(r => x.u[r]); if (us.length) one(async () => ({ k: 'seal', imgs: await Promise.all(us.map(asData)), baked: true })); });
        (window.capsStarter ? capsStarter() : []).forEach(f => one(f));        // 🎁 캡슐 (js/gacha.js)
        return (await Promise.all(jobs)).filter(Boolean);
    }
    /* 🎁 처음 선물 📒 스티커바인더 · 🤍 이형지북 : 종류 없이 📥 받은 목록에 한 권씩 (도련 11-08 · 샵에서 받은 것과 같아요 · 상품공방 '넣을 서랍' 칸 없앰) → 스티커 창에서 📥 불러와요 */
    async function bkStarterTools() {
        const add = [];
        AB_BDP.filter(x => x.P.처음받기).forEach(x => add.push(['bd', Object.assign(frNew('bd', x.id, 'basic'), { start: 1 }), x.P]));   // 🎁 처음받기 = 무료(basic) + start (도련 11-09)
        AB_RL.filter(x => x.P.처음받기).forEach(x => add.push(['rl', Object.assign(frNew('rl', x.id, 'basic'), { start: 1 }), x.P]));
        if (!add.length) return [];
        await frReady();
        ['bd', 'rl'].forEach(t => { const n = add.filter(a => a[0] === t).map(a => a[1]); if (n.length) frSet(t, frAll(t).concat(n)); });
        if (window.deskVolInit) deskVolInit(add.map(([, o, P]) => ({ id: o.id, spot: P.처음책상, n: String(P.이름 || ''), al: 1, k: '' })));   // 🎁 처음 책상 자리 = 상품공방 '처음책상' (없으면 봉투 · 도련 11-06)
        return [];
    }
    window.bkStarterSheets = bkStarterSheets; window.bkStarterTools = bkStarterTools;
    SH.cache = {};                                                            // 한 번 채운 매대는 기억해요 (다시 열면 바로)
    async function shItems(k) {
        if (SH.cache[k]) return SH.cache[k];
        const items = await SH_KINDS[k][1]();
        if (k !== 'season' && k !== 'tool') SH.cache[k] = items;   // 📔 다이어리는 해마다 바뀌어서 늘 새로
        return items;
    }
    const shSeasonOn = () => typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN;
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
    /* 🚶 기본상품 샵은 걸어가서 (도련 11-01) : 💻 📲 책상 화면에서는 어디서 '받기'를 눌러도 이동 → 🏪 기본상품 샵 과 똑같이 가게로 들어가요
       (책상에서 바로 받는 창이 뜨지 않게 · 가게 안에서는 진열대 이름표로) · 📱 폰 · 하단 메뉴 화면 = 예전 기본상품 샵 창 그대로 */
    const shMustWalk = () => !(window.shopSceneOn && shopSceneOn());   // 💻 📲 📱 모두 가게로 걸어가요 (예전 기본상품 샵 창 영구 삭제 · 도련 11-10)
    function shWalk() {
        if (SH.walking) return; SH.walking = true; setTimeout(() => { SH.walking = false; }, 1500);
        const go = () => { ['basketModal', 'basketKindModal', 'shelfCornerModal', 'shelfKindModal', 'deskBoxModal', 'gdCabModal', 'moveModal'].forEach(id => { if (vis(id)) closeModal(id); });
            if (window.deskLeave) deskLeave(); if (window.deskRun) deskRun('shop'); };
        if (document.documentElement.classList.contains('desk-edit')) {                // 🛠 꾸미는 중이면 먼저 마칠지 물어봐요
            showAsk('🛠 책상 꾸미기를 마치고<br>🏪 기본상품 샵으로 갈까요?', '저장하고 가기', '그대로 꾸미기').then(ok => { if (ok && window.deskEditEnd) { deskEditEnd(true); setTimeout(go, 300); } });
            return;
        }
        if (window.deskTopGo) deskTopGo(go); else go();                       // 📔 펼친 다이어리는 저장하고 접은 뒤 (위 버튼들과 같게)
    }
    window.shWalk = shWalk;
    /* 🏪 기본상품 샵 = 가게로 걸어가요 (예전 종류 아이콘 창은 영구 삭제 · 도련 11-10) · 가게 안이면 고르는 창만 닫고 가게 그대로 */
    function openShelf() {
        if (window.shopSceneOn && shopSceneOn()) { if (vis('shelfKindModal')) { shZoomOff(); closeModal('shelfKindModal'); } return; }   // js/shopscene.js
        shWalk();
    }
    /* 그 종류의 기본상품 샵 창 */
    async function shOpenKind(k, c) {
        const K = SH_KINDS[k]; if (!K) return;
        if (shMustWalk()) { shWalk(); return; }                                // 💻 📲 책상 = 가게로 걸어가요 (가게 안 진열대에서만 이 창)
        if (!c && SH.wantCat && SH.wantCat.k === k) c = SH.wantCat.c;
        SH.wantCat = null;
        const cats = shCatList(k);
        if (cats && !cats.some(x => x[0] === c)) { shCorner(k); return; }      // 🏪 칸이 있는 종류 = 먼저 코너 (창 안 칸 탭 없음 · 도련 11-04)
        closeModal('shelfCornerModal'); openModal('shelfKindModal');
        const cn = cats ? cats.find(x => x[0] === c) : null;
        const t = bq('shkTitle'); if (t) t.textContent = '🏪 ' + (cn ? (k === 'bg' ? cn[1] + ' 배경지' : cn[1]) : K[0]);
        const box = bq('shkWrap'); SH.kind = k; SH.items = []; SH.pg = 0; SH.cat = c || ''; SH.got = new Set(); shZoomOff();
        const seq = ++SH.seq;
        box.scrollTop = 0;
        if (!SH.cache[k]) box.innerHTML = bkMsg('기본상품 샵을 채우는 중…');
        let items = [];
        try { items = await shItems(k); } catch (e) { console.warn(e); if (seq === SH.seq) box.innerHTML = bkMsg('⚠ 기본상품 샵을 불러오지 못했어요.<br>인터넷 연결을 확인해 주세요.', `<button type="button" class="btn bk-again" onclick="shOpenKind('${k}')">🔄 다시 불러오기</button>`); return; }
        if (seq !== SH.seq) return;                                              // 그사이 다른 종류를 열었어요
        SH.items = items;
        shDraw(k);
    }
    /* 📄 쪽으로 넘겨 보기 (도련 10-25 · 게시판처럼) : 한 쪽 = 3줄 (아래로 내리지 않게 · 칸 크기를 창에 맞춰요) · 지금 쪽을 보는 동안 다음 쪽 그림을 미리
       · 📄 모조지 = [✂️ 모양 | 📄 배경] · 📔 다이어리 = [📔 날짜형 | 📒 스티커 바인더 | 🤍 이형지북] 칸으로 나눠요 */
    const SH_ROWS = 2, SH_COLS = 2, SH_GAP = 10;   // 한 쪽 = 세로로 긴 카드 2 × 2 (도련 10-25 · 폰 · PC 모두)
    const SH_CATS = { bg: [['solid', '🎨 단색'], ['pat', '☁️ 패턴']] };   // 📔 다이어리 (도련 10-28 · 예전 정리 도구)
    /* 🏪 코너 (도련 11-04) : 칸이 있는 종류(📔 다이어리 · ✂️ 문구 · 🪑 책상소품 · 🌈 배경지)는 창 안 칸 탭 대신 코너에서 칸을 골라요 (종류가 얼마나 늘지 몰라서 넓은 화면에)
       💻 가게 안 = 그 코너 그림 위 아이콘 (js/shopscene.js shopCorner) · 📱 폰 · 가게 밖 = 코너 진열대 창 (#shelfCornerModal) · 칸 하나 = 그 칸만 보이는 창 */
    const SH_CORNER = { tool: '📔 다이어리', gd: '✂️ 문구', desk: '🪑 책상소품', bg: '🌈 배경지' };   // 📱 구역 진열대 창 제목 · 간판 ('코너' 말 안 써요 · 도련 11-04)
    const SH_GD_IC = { tweez: '🥢', clip: '📎', punch: '🕳️', tape: '🩹', scissors: '✂️', knife: '🔪', ruler: '📏', pen: '✏️' };
    /* 🪑 책상소품 칸 = 소품 종류 (도련 11-04 : 스티커 · 문구처럼 종류 바로 · 상품 폴더 책상소품/<종류>/ 와 같은 이름) + 🧱 벽지 · 🪵 책상 · 상품이 있는 종류만 */
    const SH_DK = { drawer: ['서랍장', '🗄️'], clock: ['시계', '⏰'], bookshelf: ['책꽂이', '📚'], pencup: ['펜꽂이', '🖊️'], riser: ['받침대', '🖥️'], basket: ['바구니', '🧺'], lamp: ['스탠드', '💡'], doll: ['인형', '🧸'], taperack: ['마테정리함', '🎀'], labeler: ['라벨기', '🏷️'], digicam: ['디카', '📷'], printer: ['프린터', '🖨️'],
        wallshelf: ['벽선반', '🪜'], board: ['게시판', '📌'], lights: ['전구줄', '✨'], peg: ['집게사진', '📷'], wallpaper: ['벽지', '🧱'], desktop: ['책상', '🪵'] };
    function shCatList(k) {                                                    // [[칸, 이름, 아이콘]] · 칸 없는 종류 = null
        if (k === 'gd') { const L = window.gdShopList ? gdShopList() : []; return [...new Map(L.map(x => [x.g, [x.g, x.kind, stkArt('gd:' + x.g) || SH_GD_IC[x.g] || stkArt('gd')]])).values()]; }   // 🎨 아이콘 = 손그림 (도련 11-07 · 그림이 없는 새 종류만 이모지)
        if (k === 'tool') {                                                  // 📔 다이어리 코너 = 다이어리 종류 (상품이 있는 것만 · 도련 11-04)
            const y = new Date().getFullYear(), C = [['dyb', `${y} 바인더 표지`, '📔'], ['dyr', `${y} 바인더 내지`, '📅'], ['pgb', '페이지 바인더 표지', '🗂️'], ['pgr', '페이지 바인더 내지', '📄'],   /* 다꾸러가 알아보기 쉽게 (도련 11-07 · 해 = 컴퓨터 날짜 · 해가 바뀌면 저절로) */ ['dyn', `${y} 노트`, '📓'], ['pgn', '페이지노트', '📕'], ['bd', '스티커 바인더', '📒'], ['rl', '이형지북', '🤍']];   /* 📔 다꾸러에게는 '날짜형' 대신 연도 (2026 바인더 · 2026 노트 · 도련 11-04) */
            const have = new Set((window.dyyShopList ? dyyShopList().map(x => x.cat) : []).concat(AB_BDP.some(x => !x.P.숨김) ? ['bd'] : [], AB_RL.some(x => !x.P.숨김) ? ['rl'] : []));
            return C.filter(c => have.has(c[0])).map(([c, n, ic]) => [c, n, stkArt('tool:' + c) || ic]);   // 🎨 손그림 아이콘 (도련 11-07)
        }
        if (k === 'desk') {                                                   // 🆕 새 종류도 (도련 11-06 · 이름 · 아이콘 = 상품공방 '종류이름' · '종류아이콘' → 없으면 아래 표 → 종류 이름)
            const D = window.deskShopList ? deskShopList() : [], L = D.map(d => d.kind).concat(window.dsShopList ? dsShopList().map(x => x.sec) : []);
            const all = [...new Set(Object.keys(SH_DK).concat(L))].filter(c => L.includes(c));
            return all.map(c => { const d = D.find(x => x.kind === c && (x.kn || x.ki)) || {}; return [c, d.kn || (SH_DK[c] || [])[0] || c, stkArt('desk:' + c) || d.ki || (SH_DK[c] || [])[1] || stkArt('desk')]; });   // 🎨 그림이 있는 종류 = 손그림 · 새 종류 = 상품공방 '종류아이콘' (도련 11-07)
        }
        const c = SH_CATS[k]; return c ? c.map(([id, s]) => { const [ic, ...nm] = s.split(' '); return [id, nm.join(' '), ic]; }) : null;
    }
    function shCorner(k) {
        SH.corner = k;
        if (window.shopSceneOn && shopSceneOn() && window.shopCorner && k !== 'bg') { ['shelfKindModal', 'shelfCornerModal'].forEach(id => { if (vis(id)) { shZoomOff(); closeModal(id); } }); shopCorner(k); return; }   // 💻 가게 안 = 코너로 걸어가요
        const cats = shCatList(k) || [], rows = [];
        for (let i = 0; i < cats.length; i += 3) rows.push(cats.slice(i, i + 3));
        const tt = bq('shcTitle'); if (tt) tt.textContent = '🏪 ' + SH_CORNER[k];
        const sg = bq('shcSign'); if (sg) sg.textContent = SH_CORNER[k].split(' ').slice(1).join(' ');
        const cs = bq('shcCase'); if (cs) cs.innerHTML = rows.map(r => `<div class="st2-row">${r.map(([c, n, ic]) => `<button type="button" class="st2-slot st2-more" onclick="shOpenKind('${k}','${c}')"><i class="st2-goods art" data-art="1"><b class="st2-emo">${ic}</b></i><b class="st2-tag">${esc(n)}</b></button>`).join('')}</div><div class="st2-plank"></div>`).join('');
        if (vis('shelfKindModal')) { shZoomOff(); closeModal('shelfKindModal'); }
        openModal('shelfCornerModal');
    }
    function shBack() {                                                        // 창의 ← : 💻 가게 안 = 창만 닫기 (코너 그대로) · 코너에서 왔으면 코너 · 아니면 기본상품 샵
        if (window.shopSceneOn && shopSceneOn()) { shZoomOff(); closeModal('shelfKindModal'); return; }
        if (SH.corner && shCatList(SH.kind) && SH.corner === SH.kind) { shCorner(SH.kind); return; }
        shZoomOff(); closeModal('shelfKindModal');
    }
    /* 😀 이모지 글자 묶음 → [[묶음 이름, [글자…]], …] · 🏷 이름표 아이콘 고르기가 써요 (js/desk.js) */
    const EMO_CATS = [['faces', '😀 얼굴'], ['animals', '🐶 동물'], ['food', '🍎 음식'], ['activities', '🎈 활동'], ['travel', '🚗 탈것'], ['objects', '💡 물건'], ['symbols', '💟 기호']];
    let emoCatsP = null;
    window.shEmoCats = () => emoCatsP || (emoCatsP = (async () => {         // 🏷 이름표 아이콘 고르기만 (글자 그대로 · 기기 글꼴 · 그림으로 굳히지 않아요 · 샵 상품 아님)
        if (typeof emojiRanges === 'undefined') return [];
        const own = new Map(), out = [];                                     // 겹치는 번호는 더 좁은 묶음에 (🦀 게는 얼굴이 아니라 동물 · 기호는 남은 것)
        for (const c of ['animals', 'food', 'activities', 'travel', 'objects', 'faces', 'symbols']) for (const [a, b] of (emojiRanges[c] || [])) for (let i = a; i <= b; i++) if (!own.has(i)) own.set(i, c);
        for (const [c, n] of EMO_CATS) {
            const chars = []; for (const [a, b] of (emojiRanges[c] || [])) for (let i = a; i <= b; i++) if (own.get(i) === c && !chars.includes(i)) chars.push(i);
            const ok = await shEmoOk(chars); if (ok.length) out.push([n, ok]);
        }
        return out;
    })());
    /* 💡 매대 사용 팁 (도련 10-31 · 처음 온 사람이 우리 앱만의 쓰는 법을 알게 · 다꾸러라면 다 아는 건 빼요) : 종류 = 글 한 줄 · 칸이 있는 종류 = { 칸: 글 } */
    const SH_TIPS = {
        seal: '받으면 🗄️ 서랍에 들어가요 · 씰 종이를 펼쳐 <b>🪡 핀셋</b>으로 하나씩 떼어 붙여요 · 붙인 만큼 줄어요',
        piece: '봉투째 받아요 · 봉투 윗부분 점선을 옆으로 쓱 밀어 뜯으면 조각이 쏟아져요 · <b>🪡 핀셋</b>으로 집어 뒷종이를 벗겨 붙여요',
        paper: '<b>✂️ 가위</b>로 그림 둘레를 한 바퀴 오린 다음 <b>🪡 핀셋</b>으로 떼어 붙여요 · 가위 · 핀셋은 ✏️ 문구 칸에서 받아요',
        tape: '한 롤씩 받아요 · 롤 끝을 잡아 뽑아 대 보고 ✂ 로 잘라요 · 자른 만큼 롤이 얇아져요',
        tk: '한 묶음 50장 · 묶음을 톡 = 맨 윗장이 뜯겨 페이지에 붙어요 · 한 장 쓸 때마다 한 장씩 줄어요',
        leaf: '한 장으로 <b>그날 페이지 바탕</b>을 통째로 바꿔요 (줄노트 · 모눈 · 도트 …) · 깔면 그 한 장은 사라져요',
        memo: '한 묶음 50장 · 한 장씩 페이지에 놓고 글을 써요 · 쓴 만큼 줄어요',
        season: '이벤트 기간에만 나오는 스티커예요 · 기간이 지나면 매대에서 사라져요',
        bg: '받은 배경지는 🌈 배경지 창에 모여요 · 같은 것도 또 받을 수 있어요',
        tool: {
            dyb: '<b>1월 1일 ~ 12월 31일</b>, 하루에 한 쪽씩 쓰는 1년 바인더 다이어리예요 · 디자인마다 따로 한 권 · 해가 바뀌면 여기서 새해 다이어리를 받아요',
            dyn: '<b>1월 1일 ~ 12월 31일</b>, 하루에 한 쪽씩 쓰는 1년 노트예요 · 링이 없는 얇은 노트 · 디자인마다 따로 한 권 · 해가 바뀌면 여기서 새해 노트를 받아요',
            bd: '일기장이 아니라 <b>스티커 보관용</b>이에요 · 🗄️ 서랍의 스티커 종이를 포켓에 종이째 꽂아 정리해요 · 꽂아도 줄지 않아요',
            rl: '스티커를 <b>한 칸씩 떼어 모아 두는 책</b>이에요 (씰 · 이모지 · 조각) · 🪡 핀셋으로 떼어 옮겨요 · 옮겨도 줄지 않아요'
        },
        gd: {
            tweez: '<b>스티커는 핀셋을 들어야 만질 수 있어요</b> · 문구함에서 꺼내 톡 = 손에 들기 · 집어서 옮기고 돌리고 뜯어서 버려요',
            clip: '들고 다이어리 테두리 가까이 가면 반짝 → 누르면 꽂혀요 · 꽂힌 집게는 끌면 테두리를 따라가고 톡 하면 빠져요 · 여러 개 꽂아요',
            punch: '바인더 링을 열고 꺼낸 종이에 구멍을 뚫어요 · 구멍 자리 가까이 가면 착 붙고 누르면 철컥 · 위에 붙은 스티커도 같이 뚫려요',
            tape: '들고 끌면 끈 만큼 테이프가 발라져요 · 바른 테이프는 핀셋으로 옮기거나 떼어 낼 수 있어요',
            scissors: '<b>📄 모조지스티커는 가위로만</b> 오려요 · 그림 둘레를 한 바퀴 따라 그려 처음 자리로 돌아오면 그 모양대로 오려져요',
            knife: '붙인 스티커를 끝에서 끝까지 가로질러 그으면 <b>두 조각</b>이 돼요 · 필요 없는 조각은 버려요 (씰 · 조각 · 모조지 · 테이프 · 떡메)',
            ruler: '페이지에 깔아 두는 도구예요 · 가장자리에 대고 칼 · 펜을 그으면 반듯하게 · 일기에는 저장되지 않아요 · ⚙ 설정 → 📏 자 맞추기로 진짜 cm 를 맞춰요',
            pen: '받은 필기구는 펜꽂이 앞 <b>보관함</b>에 모여요 · 보관함에서 펜꽂이에 꽂은 것만 꺼내 써요'
        },
        desk: {
            desk: '받으면 📦 소품 보관함으로 · 🛠 책상 꾸미기에서 책상에 놓아요 · 소품에 기능(다이어리 · 스티커 · 문구함 …)을 이어 두면 소품을 눌러 바로 열려요',
            wall: '벽에 거는 소품이에요 · 🛠 책상 꾸미기에서 벽에 걸어요 · 기능을 이어 둘 수도 있어요',
            wallpaper: '방 벽 전체가 바뀌어요 · 🛠 책상 꾸미기 → 📦 소품함에서 골라요',
            desktop: '책상 상판이 바뀌어요 · 🛠 책상 꾸미기 → 📦 소품함에서 골라요'
        }
    };
    const shTip = k => { const t = SH_TIPS[k]; const s = t && typeof t === 'object' ? t[SH.cat] || (k === 'desk' ? (SH.items.filter(x => x.sec === SH.cat).every(x => x.wall) ? t.wall : t.desk) : '') : t;   /* 🪑 소품 종류 = 모두 벽에 거는 것이면 벽 안내 */ return s ? `<p class="sh-tip">💡 ${s}</p>` : ''; };
    const shCatOf = (k, x) => k === 'tool' ? (x.tool || x.cat) : k === 'gd' ? x.g : k === 'desk' || k === 'bg' ? x.sec : '';
    function shDraw(k) {
        const box = bq('shkWrap'), items = SH.items; if (!box) return;
        if (!items.length) { box.innerHTML = bkMsg('아직 진열된 스티커가 없어요.'); return; }
        const cats = shCatList(k);                                             // 칸 탭 없음 = 코너에서 고른 칸만 (도련 11-04)
        const list = items.map((x, i) => [x, i]).filter(([x]) => !cats || shCatOf(k, x) === SH.cat);
        const cols = SH_COLS, per = cols * SH_ROWS;
        const pages = Math.max(1, Math.ceil(list.length / per));
        SH.pg = Math.max(0, Math.min(pages - 1, SH.pg || 0));
        const page = list.slice(SH.pg * per, (SH.pg + 1) * per);
        const arw = (d, on, lb) => `<button type="button" class="sh-arw ${d < 0 ? 'l' : 'r'}" aria-label="${lb}" onclick="shPage(${d})"${on ? '' : ' disabled'}><svg viewBox="0 0 40 54" aria-hidden="true"><path d="M30 5 L7 27 L30 49 Q35 51 35 45 L35 9 Q35 3 30 5Z"/><path class="hl" d="M27 13 L15 25"/></svg></button>`;
        const nav = pages > 1 ? arw(-1, SH.pg > 0, '앞 쪽') + arw(1, SH.pg < pages - 1, '다음 쪽') + `<div class="sh-pgno">${SH.pg + 1} / ${pages}</div>` : '';   // ◀ ▶ 창 양옆 · 쪽 번호는 아래 가운데 (도련 10-28 시안)
        box.innerHTML = `<div class="sh-case">${shTip(k)}${page.length ? `<div class="sh-grid" style="--cols:${cols}">${page.map(([x, i]) => shCard(x, i)).join('')}</div>` : bkMsg('아직 진열된 것이 없어요.')}</div>${nav}`;   // 🎀 레이스 창 (도련 10-28 시안 · 테두리는 shkFrame)
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
    function shPage(d) { SH.pg = (SH.pg || 0) + d; shDraw(SH.kind); const box = bq('shkWrap'); if (box) box.scrollTop = 0; }
    function shPreload(list) {
        const seen = SH.pre || (SH.pre = new Set());
        list.forEach(([x]) => (x.pv ? [x.pv.u] : x.thumbs || []).forEach(u => {
            if (!u || /^data:/.test(u) || seen.has(u)) return;
            seen.add(u); const im = new Image(); im.decoding = 'async'; im.src = u;
        }));
    }
    /* (미리 채우기 shWarm 은 지웠어요 · 겉표지를 열 때 버벅여서 · 도련 10-25 → 기본상품 샵을 열 때 채우고 그다음부터 기억해요) */
    function shLook(x, big) {
        if (x.look === 'binder') { const c = (AB_BDP.find(p => p.id === x.pid) || AB_BDP[0]).P.색; return `<div class="sh-tool"><span class="ab-cover" style="--c1:${c[0]};--c2:${c[1]}"></span></div>`; }
        if (x.look === 'gd') return `<div class="sh-tool sh-gd${x.g === 'pen' ? ' sh-pen' : ''}">${x.art || ''}</div>`;
        if (x.look === 'desk') return `<div class="sh-tool sh-desk"><img src="${esc(x.src)}" alt="" loading="lazy"></div>`;
        if (x.look === 'relbook') return '<div class="sh-tool"><span class="ab-rlsheet sh-relbook"></span></div>';
        if (x.look === 'dskin') return `<div class="sh-tool sh-ds">${window.dsSwatch ? dsSwatch(x.sid) : ''}</div>`;   // 🧱 🪵 견본
        if (x.look === 'bg') { const p = typeof BG_PATTERNS !== 'undefined' && BG_PATTERNS.find(q => q.id === x.pid); const st = p ? Object.entries(p.css || {}).map(([k, v]) => k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v).join(';') : ''; return `<div class="sh-tool sh-bg"><span class="sh-bgsw" style="${esc(st)}"></span></div>`; }   // 🌈 배경지 견본
        if (x.look === 'note') { const k = DY_COL[x.dc] || {}; return `<div class="sh-tool sh-dy"><span class="sh-dyb sh-dyn" style="--dyb:${k.border || '#ffc6d6'};--dyi:${k.accent || '#c8457a'}"><i class="sh-dys"></i><b>${x.yr}</b><small>NOTE</small></span></div>`; }   // 📓 날짜형 노트 (얇은 책등 · 링 없음 · 도련 11-04 시안 3번)
        if (x.look === 'refill') return `<div class="sh-tool sh-dy"><span class="sh-rfl lf-${x.lf || 'line'}"><i class="sh-rfh"></i><b>${x.rt === 'date' ? '📅' : '📄'}</b><small>${x.rt === 'date' ? 'DATE' : 'PAGE'} · ${x.n || ''}</small></span></div>`;   // 📄 바인더 내지 (6공 · 그 내지 무늬 · 도련 11-07)
        if (x.look === 'pnote') { const c = x.cols || {}; return `<div class="sh-tool sh-dy"><span class="sh-dyb sh-dyn" style="--dyb:${c.테두리색 || '#ffc6d6'};--dyi:${c.강조색 || '#c8457a'}"><i class="sh-dys"></i><b>${x.n || ''}</b><small>NOTE</small></span></div>`; }   // 📕 페이지노트 (도련 11-11 · 날짜형 노트와 같은 책 모양)
        if (x.look === 'pbinder') { const c = x.cols || {}; return `<div class="sh-tool sh-dy"><span class="sh-dyb" style="--dyb:${c.테두리색 || '#ffc6d6'};--dyi:${c.강조색 || '#c8457a'}"><i class="sh-dyr"></i><b>${x.n || ''}</b><small>BINDER</small></span></div>`; }   // 🗂️ 페이지바인더 표지 (도련 11-07)
        if (x.look === 'diary') { const k = DY_COL[x.dc] || {}; return `<div class="sh-tool sh-dy"><span class="sh-dyb" style="--dyb:${k.border || '#ffc6d6'};--dyi:${k.accent || '#c8457a'}"><i class="sh-dyr"></i><b>${x.yr}</b><small>DIARY</small></span></div>`; }   // 📔 6공 바인더 (색마다 한 권 · js/dyyear.js)
        const src = big && x.bigs ? x.bigs : x.thumbs, n = (src || x.chars || []).length, cols = big ? Math.ceil(Math.sqrt(Math.max(1, n))) : Math.ceil(Math.sqrt(Math.max(1, n) * .7));   // 카드는 세로로 길게 (포장기 pvOf 와 같은 칸 수)
        if (x.look === 'tape') return `<div class="sh-tape"><i style="background-image:url(&quot;${esc(src[0])}&quot;)"></i></div>`;
        if (x.look === 'tkimg') return `<div class="sh-pad">${window.tkMiniHtml ? tkMiniHtml('my', { src: src[0] }) : ''}</div>`;
        if (x.look === 'leafimg') return `<span class="lf-pick sh-leaf"><i class="lf-sw lf-my" style="--lf-img:url('${esc(src[0])}')"></i></span>`;
        if (!big && x.pv && x.look === 'grid') { const p = x.pv; return `<div class="sh-paper"><svg class="sh-pv" viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><svg width="${p.w}" height="${p.h}"><image href="${esc(p.u)}" x="0" y="${-p.y}" width="${p.w}" height="${p.H}"/></svg></svg></div>`; }   // 🖼️ 묶음 미리보기 (작은 그림 수십 장 대신 · 포장기 p/ 한 파일에서 내 칸만 잘라 보여요)
        if (x.L && x.look === 'grid' && (big || !x.pv)) return `<div class="sh-paper sh-lay">${abLayHtml(x.L, src)}</div>`;   // 🗺️ 시트 배치 그대로
        if (x.look === 'memoimg' || x.look === 'sheet') return `<div class="sh-paper one"><img src="${esc(src[0])}" alt="" loading="lazy"></div>`;
        return `<div class="sh-paper${n === 1 ? ' one' : ''}"><i class="bk-grid" style="--c:${cols}">${src.map(u => `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`).join('')}</i></div>`;
    }
    function shCard(x, i) {
        return `<div class="sh-item"><button type="button" class="sh-look" onclick="shZoom(${i})" aria-label="확대">${shLook(x)}</button><small class="sh-cnt">${esc(x.cnt || '')}</small>`
            + `<div class="sh-btns"><button type="button" class="sh-take sh-zoombtn" onclick="shZoom(${i})">${SH.kind === 'gd' ? '사용해보기' : '🔍 확대'}</button>${SH.got && SH.got.has(i) ? `<button type="button" class="sh-take sh-get got" onclick="shGoSee('${shInto()}', 0)">${shGotText(x)}</button>` : `<button type="button" class="sh-take sh-get" onclick="shQuick(${i}, this)">${x.give ? '🎁 받기' : '🧺 받기'}</button>`}</div></div>`;   // 받은 것은 창을 닫았다 열 때까지 초록 (쪽을 넘겨도 그대로 · 도련 10-26)   // 받기를 바로 (도련 10-26 · 처음 온 사람은 받으러 와요)
    }
    /* 🔍 확대 : 그 스티커 전체 모습 + 아래 🧺 받기 (기본상품 샵 창 안에 겹쳐 떠요 · 창이 하나라는 규칙 그대로) */
    function shZoom(i) {
        const x = SH.items[i], z = bq('shZoom'); if (!x || !z) return;
        SH.zoom = i;
        let pick = '';
        /* 📒 🤍 정리 도구 = 종류를 고르지 않아요 (도련 11-08 · 받아서 스티커 창에서 📥 불러와요) */
        z.innerHTML = `<div class="sh-zcard"><div class="sh-zlook k-${esc(SH.kind)}">${shLook(x, true)}</div><small class="sh-cnt">${esc(x.cnt || '')}</small>${x.desc ? `<small class="sh-desc">${esc(x.desc)}</small>` : ''}${pick}`
            + `<div class="sh-zbtns"><button type="button" class="sh-take sh-zoombtn sh-zclose" onclick="shZoomOff()">닫기</button><button type="button" class="sh-take sh-zget" onclick="shTake(this)">${x.give ? '🎁 받기' : '🧺 받기'}</button></div></div>`;
        z.hidden = false;
        z.onclick = e => { if (e.target === z) shZoomOff(); };                // 닫기 = [닫기] 버튼 (도련 11-04) 또는 확대 밖을 톡
    }
    const shInto = () => SH.kind === 'season' ? 'seal' : SH.kind;            // 받은 것이 들어간 바구니
    const shInShop = () => !!(window.shopBagOn && shopBagOn());               // 🏪 가게 안 = 🛍️ 봉투 (PC · 아이패드 · 📱 폰 가게는 바로 서랍)
    const shGotText = () => shInShop() ? '🛍️ 봉투에 담았어요' : '보관함 확인';   // 받은 뒤 버튼 (연녹색) · 가게 안 = 봉투에 담겼다는 표시만 (누르면 '내 방에서 봉투를 열어요' · 도련 10-30 : 봉투 → 책상 → 소품에 넣는 과정을 겪게) · 폰(가게 없음) = 예전처럼 보관함으로
    /* 🎁 문구 · 책상 소품 받기 (도련 10-27) : 문구는 이미 있으면 알려만 · 소품은 이미 있으면 물어보고 하나 더 → true = 받았어요 */
    /* 🛍️ 받기가 다 끝나면 쇼핑백 (도련 10-29) : 받는 중인 개수를 세다가 0 이 되는 순간 한 번 · 하나라도 받았으면
       - 이어서 여러 개 = 마지막이 끝날 때 한 번 · 샵 창을 닫았거나 책상이 보여도 화면 맨 위에 떠요 · 실패해도 숫자는 내려요 */
    const BAG = { n: 0, ok: 0 };
    const bagStart = () => { BAG.n++; };
    function bagNote(x, k, al, sid) {                                        // sid = 받은 스티커 종이 id (봉투에서 꺼낼 때까지 바구니에 안 보여요 · js/desk.js deskBagHold)                                             // 🛍️ 가게 안에서 받은 것 = 봉투에 (내 방으로 돌아가면 책상 위 봉투 · js/desk.js deskBagAdd)
        if (!(window.shopBagOn && shopBagOn())) return;                        // 📱 폰 가게 = 봉투 없이 바로 서랍
        const o = { k, n: String(x.name || x.cnt || BK_KINDS[k] || '').slice(0, 30) };
        if (al) o.n = String(x.name || '').slice(0, 30);   // 📒 🤍 정리 도구 = 그 상품 이름           // 📒 🤍 정리 도구 = 그 이름 (예전엔 '속지 10장 …' · 씰스티커로 보였어요 · 도련 10-30)
        if (x.look === 'dskin') { o.ds = x.sec === 'wallpaper' ? 'wall' : 'top'; o.n = String(x.name || '').slice(0, 30); }   // 🧱 벽지 · 🪵 책상 (책상 소품이 아니에요)
        if (al && window.abLastGiven && Date.now() - abLastGiven.t < 8000) o.b = abLastGiven.id;   // 📒 🤍 = 그 책 (책상에 끌어 놓으면 그 자리)
        if (k === 'tool' && window.dyyLastGiven && Date.now() - dyyLastGiven.t < 8000) { if (dyyLastGiven.m) o.m = dyyLastGiven.id; else o.b = dyyLastGiven.id; }   // 🧩 바인더 재료 = m (꺼낼 때까지 조립 바구니에 없어요 · 도련 11-11)   // 📔 새 다이어리 = 그 권 (책상에 끌어 놓으면 그 자리 · js/desk.js dkvPlace)
        if (sid) o.s = [sid];
        if (k === 'gd' && x.gid) o.gid = x.gid;                                 // ✏️ 문구 · 필기구 = 그 디자인 (봉투에서 꺼낼 때까지 문구함 · 펜꽂이에 없어요)
        { const L = x.look === 'dskin' ? window.dsLastGiven : k === 'desk' ? window.deskLastGiven : null; if (L && L.u && Date.now() - L.t < 8000) o.u = L.u; }   // 🪑 🧱 🪵 = 그 하나 (📦 소품함에 없어요)
        if (k === 'desk' && x.id) o.id = x.id; if (k === 'desk' && x.src && !String(x.src).startsWith('data:')) o.src = x.src; if (al) o.al = 1;
        if (k !== 'gd' && k !== 'desk') { const lk = shLookKeep(x); if (lk) o.lk = lk; }   // 🛍️ 봉투 카드 = 산 모습 그대로 (도련 11-03 · 샵 진열 그림과 같은 것 · js/desk.js dkKindIc)
        (window.SHOP_BAG = window.SHOP_BAG || []).push(o);
    }
    /* 🛍️ 봉투 카드에 남길 '산 모습' (샵 shLook 에 필요한 것만 · 그림은 서버 주소라 작아요 · data 그림은 빼요) */
    function shLookKeep(x) {
        if (!x || !x.look) return null;
        const o = {}, url = u => typeof u === 'string' && !/^data:/.test(u);
        ['look', 'g', 'sid', 'pid', 'dc', 'yr', 'c'].forEach(k => { if (x[k] != null && typeof x[k] !== 'object') o[k] = x[k]; });
        if (x.pv && url(x.pv.u)) o.pv = { u: x.pv.u, w: x.pv.w, h: x.pv.h, y: x.pv.y, H: x.pv.H };   // 🖼️ 묶음 미리보기 한 장
        const th = (x.thumbs || []).filter(url);
        if (th.length) { if (x.L && th.length <= 24 && !o.pv) { o.L = x.L; o.thumbs = th; } else o.thumbs = th.slice(0, 9); }
        if (!o.pv && !o.thumbs && !['binder', 'relbook', 'dskin', 'bg', 'diary'].includes(o.look)) return null;   // 그릴 것이 없으면 = 예전 아이콘
        return o;
    }
    window.shItemsOf = shItems; window.shLookKeep = shLookKeep; window.shLookMini = lk => { try { return lk && lk.look ? shLook(lk) : ''; } catch (e) { return ''; } };
    function bagEnd(ok) {
        BAG.n = Math.max(0, BAG.n - 1); if (ok) BAG.ok++;
        if (BAG.n || !BAG.ok) { if (!BAG.n) BAG.ok = 0; return; }
        BAG.ok = 0; bagShow();
    }
    const BAG_SVG = `<svg viewBox="0 0 260 290" aria-hidden="true"><g stroke="#5f1a2c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<path d="M104 78 C98 8 162 8 156 78" fill="none" stroke="#7a5128" stroke-width="6.5"/><path d="M104 78 C98 8 162 8 156 78" fill="none" stroke="#c99556" stroke-width="3.2"/>
<path d="M62 84 C56 140 48 214 50 252 Q51 271 72 272 H188 Q209 271 210 252 C212 214 204 140 198 84 Z" fill="#9a2236"/>
<path d="M74 108 C70 170 66 220 68 262" fill="none" stroke="#84192d" stroke-width="2.2"/><path d="M186 108 C190 170 194 220 192 262" fill="none" stroke="#84192d" stroke-width="2.2"/><path d="M60 240 Q130 250 200 240" fill="none" stroke="#84192d" stroke-width="2"/>
<path d="M62 64 Q96 60 130 62 Q164 60 198 64 L199 92 Q182 98 164 94 Q147 100 130 95 Q113 100 96 94 Q78 98 61 92 Z" fill="#84192d"/>
<path d="M64 70 Q130 64 196 70" fill="none" stroke-width="1.6" stroke="#b03a4e"/><circle cx="104" cy="78" r="3.5" fill="#c99556" stroke-width="2"/><circle cx="156" cy="78" r="3.5" fill="#c99556" stroke-width="2"/>
<path d="M96 120 Q130 117 164 120 L166 206 Q130 209 94 206 Z" fill="#fff6e8"/>
<g transform="translate(130 138) scale(.9)"><path d="M-3 3 L-13 30 L-6 26 L-3 33 L2 6 Z" fill="#ff8fb4"/><path d="M3 3 L14 29 L7 26 L4 32 L-1 6 Z" fill="#ff8fb4"/><path d="M0 0 C-11 -17 -31 -13 -27 0 C-24 9 -8 6 0 0 Z" fill="#ffb3c9"/><path d="M0 0 C11 -17 31 -13 27 0 C24 9 8 6 0 0 Z" fill="#ffb3c9"/><rect x="-6" y="-6" width="12" height="11" rx="4" fill="#ff8fb4"/></g>
<text x="130" y="182" text-anchor="middle" font-size="13" font-weight="800" fill="#9a2236" stroke="none" letter-spacing="2">말랑달콤</text><path d="M108 192 H152" fill="none" stroke="#9a2236" stroke-width="1.4" stroke-dasharray="3 3"/></g></svg>`;
    function bagShow() {
        let el = bq('shBag');
        if (!el) { el = document.createElement('div'); el.id = 'shBag'; el.className = 'sh-bag'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); el.onclick = () => bagHide(); document.body.appendChild(el); }
        el.innerHTML = '<i class="sh-bag-in">' + BAG_SVG + '</i><b class="sh-bag-msg">상품을 담았어요</b>';   // 봉투 + 아래 한 줄 (도련 10-29 · 흰 창 없이)
        el.classList.remove('bye'); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
        clearTimeout(BAG.t); BAG.t = setTimeout(bagHide, 2200);
        if (window.sndBag) sndBag();                                         // 🔔 띠링~ (설정에서 소리를 끄면 조용히)
    }
    function bagHide() { const el = bq('shBag'); if (!el || !el.classList.contains('on')) return; el.classList.add('bye'); clearTimeout(BAG.t); BAG.t = setTimeout(() => el.classList.remove('on', 'bye'), 320); }
    window.bagShow = bagShow; window.BAG_SVG = BAG_SVG;
    window.bagBusy = () => BAG.n > 0 || !!(bq('shBag') && bq('shBag').classList.contains('on'));   // 🛍️ 받는 중 · 봉투 안내가 떠 있는 중 (🚪 내 방으로 못 가요 · js/shopscene.js)
    async function shGive(x) {
        bagStart(); let ok = false;
        try { ok = await shGive0(x); return ok; } finally { bagEnd(ok); }
    }
    async function shGive0(x) {
        let r = await x.give(false);
        if (r === 'have' && SH.kind === 'tool') { showMsg(`📔 ${x.name}는 이미 받았어요.<br><small>📒 다이어리 → 📔 다이어리 보관소에 있어요</small>`); return false; }
        if (r === 'have') {
            const j = josaOf(x.name, '이', '가');
            if (!await showAsk(`${SH.kind === 'gd' ? '✏️' : '🪑'} ${x.name}${j} 이미 있어요.<br>하나 더 받을까요?`, '하나 더 받기', '취소')) return false;   // ✏️ 문구도 같은 것을 또 (도련 11-07)
            r = await x.give(true);
        }
        if (r !== 'ok') { showMsg('⚠ 받지 못했어요.'); return false; }
        if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
        return true;
    }
    function shGoSee(k, album) {                                            // 받은 것 보러 : 그 종류 서랍 (정리 도구는 📒 스티커첩 탭)
        if (shInShop()) { showMsg('🛍️ 봉투에 담았어요!<br><span style="font-size:12px;color:#777;">🚪 내 방으로 돌아가 책상 위 봉투를 열어 보세요.</span>'); return; }   // 가게 안에서는 바로 가지 않아요 (도련 10-30)
        if (window.shopSceneOn && shopSceneOn()) shopSceneClose(true);      // 🏪 가게에서 나와서 (바로)
        if (k === 'tool') { shZoomOff(); closeModal('shelfKindModal'); if (window.dyOpen) dyOpen('다이어리'); return; }   // 📔 다이어리 보관소
        if (k === 'stool') { shZoomOff(); closeModal('shelfKindModal'); return; }   // 📒 🤍 받은 스티커첩 = 책상 위에 (도련 11-08)
        if (k === 'bg') { shZoomOff(); closeModal('shelfKindModal'); if (typeof openPatternList === 'function') openPatternList('free'); return; }   // 🌈 배경지 보관함
        if (k === 'gd' || k === 'desk') { shZoomOff(); closeModal('shelfKindModal'); if (k === 'gd' && window.openGdCab) openGdCab(); if (k === 'desk' && window.deskBoxOpen) deskBoxOpen(); return; }   // ✏️ 문구함 · 📦 소품 보관함
        shZoomOff(); closeModal('shelfKindModal');
        bkOpenKind(k);
        if (album) { B.view = 'album'; bkView('album'); }
    }
    window.SH_SET_CAT = (k, c) => { SH.wantCat = { k, c }; };             // 📔 새해 다이어리 받으러 갈 때 그 칸부터 (js/dyyear.js)
    function shZoomOff() { const z = bq('shZoom'); if (z) { z.hidden = true; z.innerHTML = ''; } SH.zoom = -1; if (SH.redraw) { SH.redraw = false; shDraw(SH.kind); } }
    /* 🧺 카드에서 바로 받기 (확대 없이 · 도련 10-26) : 받으면 잠깐 '✓ 서랍에 쏙' → 다시 받기 (정리 도구는 넣을 서랍을 골라야 해서 확대로) */
    async function shQuick(i, btn) {
        const x = SH.items[i]; if (!x || btn.disabled) return;
        if (x.tool) { shZoom(i); return; }
        const k0 = SH.kind, into = shInto(), got = SH.got || (SH.got = new Set());   // 🛍️ 누른 순간의 종류 (받는 동안 다른 매대로 가도 봉투 · 바구니가 바뀌지 않게 · 도련 11-01)
        if (x.give) {
            if (!await shGive(x)) return; bagNote(x, k0);
            btn.classList.add('got'); btn.textContent = shGotText(x); btn.onclick = () => shGoSee(k0, 0);
            got.add(i); return;
        }
        if (!window.ownTake || !ownMode()) { showMsg('🔐 구글 계정으로 로그인하거나<br>🏠 로그인 없이 다꾸할 때 스티커를 받을 수 있어요.'); return; }
        btn.disabled = true; btn.classList.add('busy'); btn.textContent = '받는 중…';
        bagStart(); let bagOk = false;
        try {
            let real = into;                                                     // 🛍️ 봉투 = 실제로 들어간 바구니 (도련 11-01)
            let sid = null;                                                      // 🛍️ 봉투 카드가 이 종이를 기억해요
            if (x.def) { sid = await ownTake(x.def); real = bkKindOf(x.def); }
            else { const r = await x.take(); if (r && typeof r === 'object') { sid = await ownTake(r); real = bkKindOf(r); } else if (typeof r === 'string') sid = r; }
            bagOk = true; bagNote(x, real, 0, sid);
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            btn.classList.remove('busy'); btn.classList.add('got'); btn.textContent = shGotText(); btn.disabled = false; btn.onclick = () => shGoSee(into, 0);   // 초록 버튼 = 그 바구니로 바로 (도련 10-26)
            got.add(i);                                                          // 창을 닫았다 열면 다시 받기
        } catch (e) {
            console.warn(e);
            btn.classList.remove('busy'); btn.textContent = '🧺 받기'; btn.disabled = false;
            showMsg('⚠ 스티커를 받지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        } finally { bagEnd(bagOk); }
    }
    async function shTake(btn) {
        const zi = SH.zoom, x = SH.items[zi]; if (!x || btn.disabled) return;
        const k = SH.kind, into = x.tool ? 'stool' : (k === 'season' ? 'seal' : k), got = SH.got || (SH.got = new Set()), here = () => SH.kind === k && SH.zoom === zi;   // 🛍️ 누른 순간의 종류 (도련 11-01)
        if (x.give) {
            if (!await shGive(x)) return; bagNote(x, k);
            got.add(zi); if (here()) SH.redraw = true;
            const box = btn.closest('.sh-zbtns');
            const nm = k === 'gd' ? '🗄️ 문구함' : k === 'tool' ? (['dyb', 'dyr', 'pgb', 'pgr'].includes(x.cat) ? '🧩 바인더 재료 (책상 오른쪽 위 메뉴 → 🧩 바인더 조립)' : '📔 다이어리 보관소') : k === 'bg' ? '🌈 배경지' : '📦 소품 보관함';
            if (box) box.outerHTML = `<div class="sh-got"><b>✓ 받았어요!</b><small>${shInShop() ? '봉투에 담았어요 · 내 방에서 꺼내요' : nm + '에 넣었어요'}</small></div>`
                + `<div class="sh-zbtns"><button type="button" class="sh-take sh-zget got" onclick="shGoSee('${k}', 0)">${shGotText()}</button></div>`;
            return;
        }
        if (!window.ownTake || !ownMode()) { showMsg('🔐 구글 계정으로 로그인하거나<br>🏠 로그인 없이 다꾸할 때 스티커를 받을 수 있어요.'); return; }
        btn.disabled = true; btn.classList.add('busy'); btn.textContent = '받는 중…';
        bagStart(); let bagOk = false;
        try {
            let real = into, sid = null;                                         // 🛍️ 봉투 = 실제로 들어간 바구니 (도련 11-01) · sid = 그 종이
            if (x.tool) { if (!window.ownAlbum) throw new Error('ready'); sid = null; await abTakeTool(x.tool, x.pid); }   // 📒 🤍 정리 도구 = 📥 받은 목록 (종류 없이 · 도련 11-08)
            else if (x.def) { sid = await ownTake(x.def); real = bkKindOf(x.def); }
            else { const r = await x.take(); if (r && typeof r === 'object') { sid = await ownTake(r); real = bkKindOf(r); } else if (typeof r === 'string') sid = r; }   // take() : 새 종이 id(씰) 또는 종이 정보
            bagOk = true; bagNote(x, real, x.tool, sid);
            if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
            /* 받았어요 → 이 창에서는 더 못 받아요 : 🗄️ 받은 것 보러 가기 · 닫기 중에 골라요 (닫았다 다시 열면 또 받을 수 있어요 · 도련 10-25) */
            got.add(zi); if (here()) SH.redraw = true;                           // 확대에서 받아도 카드 버튼은 초록
            const box = btn.closest('.sh-zbtns');
            const where = x.tool ? '📔 책상' : `✨ 스티커 · ${esc(BK_KINDS[into] || '')} 서랍`;
            if (box) box.outerHTML = `<div class="sh-got"><b>✓ 받았어요!</b><small>${shInShop() ? '봉투에 담았어요 · 내 방에서 꺼내요' : where + '에 넣었어요'}</small></div>`
                + (x.tool && !shInShop() ? '<small class="sh-desc">정리하고 싶은 스티커 서랍 → 📒 정리하기에서 📥 불러와 써요</small>' : '')
                + `<div class="sh-zbtns"><button type="button" class="sh-take sh-zget got" onclick="shGoSee('${into}', 0)">${shGotText()}</button></div>`;
        } catch (e) {
            console.warn(e);
            btn.classList.remove('busy'); btn.textContent = '🧺 받기'; btn.disabled = false;
            showMsg('⚠ 스티커를 받지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : ''));
        } finally { bagEnd(bagOk); }
    }


    /* ---------- 🗂️ 꺼내 둔 스티커창 (도련 10-26) ----------
       다꾸러처럼 쓸 것을 다 꺼내 놓고 써요 : 💻 PC · 패드 = 바구니 밖으로 끌기 · 📱 폰 = 톡 · 오래 누르기 → 페이지 위에 스티커창이 놓여요 (몇 장이든 · 언제든 더 · 도련 11-05)
       윈도우 창처럼 맨 위 한 장만 '열려' 떼어져요 : 다른 종이를 톡 = 그 종이가 맨 위로 + 떼는 화면 · 끌기 = 옮기기 · ✕ = 치우기
       저장하지 않아요 (앱을 끄면 사라져요) · 다 쓴 종이는 저절로 치워져요 */
    const DS = { m: new Map(), z: 1, act: '', t: 0, at: null, tape: null };
    const DS_ROOMS = ['pelRoom', 'pcbRoom', 'pmRoom', 'tkRoom'];
    function dsLayer() { let l = bq('dskLayer'); if (!l) { l = document.createElement('div'); l.id = 'dskLayer'; document.body.appendChild(l); } return l; }
    function dsEntry(id) { if (window.ownSpent && ownSpent(id)) return null;   // 🧾 다 쓴 종이 = 바구니 옛 목록에 남아 있어도 없어요 (도련 11-09 · 붙였는데 창이 안 사라지던 것)
        const L = (window.ownSeen ? ownSeen() : []).concat(B.all || []), e = L.find(x => x.id === id) || (DS.more || []).find(x => x.id === id) || null;
        return e && window.ownPendOn ? ownPendOn(e) : e; }   // 🧾 아직 드라이브에 못 지운 칸까지 빼고 봐요 (바구니 옛 목록이어도)   // more = 바구니를 안 열었을 때 읽어 둔 목록 (🎀 마테 정리함)
    const dsLeft = e => !!e && (e.q0 ? e.q > 0 : (e.u || []).length < e.n);
    const dsRoomOn = () => DS_ROOMS.some(id => { const r = bq(id); return r && r.classList.contains('show'); });
    function dsPaint(d) {
        const e = dsEntry(d.id); if (!dsLeft(e)) { dsDrop(d.id); return; }
        d.el.innerHTML = `<button type="button" class="dsk-x" aria-label="치우기">✕</button>${bkCard(e)}`;
        const w = d.el.offsetWidth || 110, h = d.el.offsetHeight || 120;
        d.x = Math.max(w / 2 + 4, Math.min(innerWidth - w / 2 - 4, d.x)); d.y = Math.max(h / 2 + 50, Math.min(innerHeight - h / 2 - 90, d.y));
        d.el.style.left = (d.x - w / 2) + 'px'; d.el.style.top = (d.y - h / 2) + 'px';
        if (e.k === 'tape' && !d.pull) { const r = d.el.querySelector('.bk-roll'); if (r) { const t = document.createElement('span'); t.className = 'dsk-tab'; t.title = '끝을 잡아 뽑아요'; t.style.backgroundImage = `url("${e.th || ''}")`; r.appendChild(t); } }   // 🎀 롤 끝 (여기를 잡아 뽑아요 · 도련 11-04)
        if (e.k === 'tape') {                                                   // 🎀 ✕ = 롤 가운데 심 위 (도련 11-04 · 멀리 떨어져 있지 않게)
            const x = d.el.querySelector('.dsk-x'), r = d.el.querySelector('.bk-roll');
            if (x && r) { const a = r.getBoundingClientRect(), b = d.el.getBoundingClientRect(), s = b.width ? d.el.offsetWidth / b.width : 1; x.classList.add('mid'); x.style.left = ((a.left - b.left + a.width / 2) * s) + 'px'; x.style.top = ((a.top - b.top + a.height / 2) * s) + 'px'; }   // s = 톡 뜨는 동안 커졌다 작아지는 것 빼기
        }
    }
    function dsFront(d) { d.el.style.zIndex = ++DS.z; }
    /* 🚪 이동 (가게 · 다른 장소) = 꺼내 둔 종이는 모두 바구니로 정리 (도련 11-05 · 뽑아 둔 테이프는 되감겨요) */
    function dsClear() { [...DS.m.keys()].forEach(dsDrop); }
    window.dsClear = dsClear;
    function dsDrop(id) {
        const d = DS.m.get(id); if (!d) return; if (DS.act === id) dsShut(); dsRewind(d); d.el.remove(); DS.m.delete(id); DS.c.delete(id); DS.v.delete(id); if (window.dktPaint) dktPaint();   // 🎀 마테 정리함 롤이 다시 또렷하게
        if (vis('basketKindModal') && B.view === 'bin') { abSplit(); B.sig = bkSig(); bkDraw(); }   // 치운 종이는 바구니로 돌아와요
    }
    function dsTake(id, at, keep) {                                          // 다이어리를 안 열어도 꺼내 놓을 수 있어요 (도련 11-05 · 떼어 붙일 때만 다이어리가 열려 있어야 해요 · bkOpenSheet)
        const e = dsEntry(id) || B.byId.get(id); if (!dsLeft(e)) { showMsg('이 스티커는 이미 다 썼어요.'); return; }
        let d = DS.m.get(id);
        if (!d) {
            const n = DS.m.size;
            d = { id, el: document.createElement('div'), x: innerWidth * .3 + (n % 5) * 26, y: innerHeight * .32 + (n % 5) * 30 };
            d.el.className = 'dsk'; d.el.dataset.id = id; dsLayer().appendChild(d.el); DS.m.set(id, d); dsWire(d);
        }
        if (at) { d.x = at.x; d.y = at.y; }
        dsPaint(d); dsFront(d); dsPrep(id).catch(() => {});
        if (e.k === 'tape' && !d.el.classList.contains('big')) dsBig(d);       // 🎀 테이프 롤은 늘 그 크기 (작아지지 않아요 · 도련 11-04)
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
        const imgs = v.s.imgs.map((u, i) => used.has(i) ? null : u), gh = v.s.imgs.map((u, i) => used.has(i) && u ? ((v.baked && v.baked[i]) || u) : (v.s.gh || [])[i] || null);   // 👻 방금 뗀 자리도 그 모양대로
        return { s: Object.assign({}, v.s, { imgs, gh }), baked: v.baked && v.baked.map((u, i) => used.has(i) ? null : u) };
    }
    function dsMoveFromPeel(d) { const a = window.pelLastAt && pelLastAt(); if (a && a.id === d.id) { d.x = a.x; d.y = a.y; } }   // 떼는 화면에서 옮긴 자리에서 작아져요 (도련 10-26)
    function dsMove(d, x, y) { d.x = x; d.y = y; const w = d.el.offsetWidth, h = d.el.offsetHeight; d.el.style.left = (x - w / 2) + 'px'; d.el.style.top = (y - h / 2) + 'px'; }
    function dsWire(d) {
        let p = null;
        d.el.addEventListener('pointerdown', ev => {
            if (ev.button > 0) return;
            const onX = !!ev.target.closest('.dsk-x'), tp = d.el.classList.contains('big') && (dsEntry(d.id) || {}).k === 'tape';
            if (onX && !tp) return;                                            // 🎀 테이프 롤 ✕ (가운데) = 톡 = 치우기 · 끌면 = 뽑기
            ev.preventDefault(); dsFront(d);
            p = { x0: ev.clientX, y0: ev.clientY, dx: d.x - ev.clientX, dy: d.y - ev.clientY, on: false, id: ev.pointerId, onX };
            d.el.classList.remove('rest');
            if (d.el.classList.contains('big')) { const e = dsEntry(d.id); if (e && e.k === 'tape') {   // 🎀 테이프 롤 : 롤 끝(탭)을 끌면 = 뽑기 · 롤을 끌면 = 옮기기 (뽑아 둔 테이프도 같이 · 도련 11-04)
                p.tape = e; p.end = !!ev.target.closest('.dsk-tab'); p.mv = !p.end;
            } }
            try { d.el.setPointerCapture(ev.pointerId); } catch (er) {}
        });
        d.el.addEventListener('pointermove', ev => {
            if (!p || ev.pointerId !== p.id) return;
            if (!p.on && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 7) return;
            if (p.tape && p.end && !p.pull) { if (d.pull) { p.on = true; return; } p.pull = dsPullStart(d, p.tape); }
            if (p.pull) { p.on = true; dsPullMove(p.pull, ev.clientX, ev.clientY); return; }
            p.on = true; d.el.classList.add('lift'); const ox = d.x, oy = d.y; d.x = ev.clientX + p.dx; d.y = ev.clientY + p.dy; if (d.pull) dsPullShift(d.pull, d.x - ox, d.y - oy);   // 🎀 뽑아 둔 테이프도 롤과 같이
            const w = d.el.offsetWidth, h = d.el.offsetHeight; d.el.style.left = (d.x - w / 2) + 'px'; d.el.style.top = (d.y - h / 2) + 'px';
        });
        const up = ev => {
            if (!p || ev.pointerId !== p.id) return; const was = p; p = null; d.el.classList.remove('lift');
            if (was.pull) { dsPullEnd(was.pull, ev.type === 'pointerup' && was.on); if (was.on) return; }
            if (ev.type !== 'pointerup') return;
            if (was.tape) { if (!was.on && was.onX) { dsDrop(d.id); return; } if (!was.on && !d.pull) dsBig(d); return; }   // 🎀 롤 톡 = 아무것도 안 써요 (뽑아서 ✂ 로 잘라요)
            if (!was.on) { dsOpen(d); return; }
            if (d.el.classList.contains('big')) dsUse(d);                     // 커진 테이프 · 메모지 · 속지를 끌어 놓으면 = 써요
        };
        d.el.addEventListener('pointerup', up); d.el.addEventListener('pointercancel', up);
        d.el.addEventListener('click', ev => { if (ev.target.closest('.dsk-x')) { ev.stopPropagation(); dsDrop(d.id); } });
    }
    /* 📏 테이프 · 메모지 · 속지 : 톡 = 크게 보기 (아직 안 써요) → 커진 것을 톡 하거나 끌어 놓으면 = 페이지에 써요 · 다른 곳을 누르면 작아져요 */
    function dsBig(d) {
        DS.m.forEach(o => { if (o !== d && o.el.classList.contains('big')) dsSmall(o); });
        d.el.classList.add('big'); d.el.classList.remove('rest'); dsPaint(d); dsFront(d);
        const e = dsEntry(d.id), say = e && e.k === 'tape' ? '끝을 잡아 뽑고 ✂ 로 잘라요 · 롤을 끌면 옮겨요' : '톡 하거나 페이지로 끌어 놓으면 써요';
        if (!d.el.querySelector('.dsk-say')) d.el.insertAdjacentHTML('beforeend', `<span class="dsk-say">${say}</span>`);
    }
    /* 🎀 테이프 뽑아 쓰기 (도련 10-26) : 커진 롤을 잡고 끌면 테이프가 롤에서 풀려 나와 손을 따라와요
       - 끄는 동안 롤이 얇아져요 (숫자는 없어요) · 롤에 남은 만큼만 · 손을 떼면 그 길이 · 그 방향 그대로 페이지에 (tape.js placeTape at)
       - 조금만 끌었으면(20px 안) 안 붙여요 */
    /* 🎀 뽑아 둔 채로 (도련 11-04 · 현실처럼 : 뽑고 → 대 보고 → 더 뽑거나 되감고 → 마음에 들면 자르기)
       - 손을 떼도 안 잘려요 · 롤에 붙은 채 페이지 위에 그대로 (아직 안 써요 · 롤도 그대로) · 테이프 끝을 잡고 늘이거나 롤 쪽으로 밀어 되감아요
       - ✂ = 그 길이 · 그 방향으로 잘라 붙여요 (이때 롤이 쓴 만큼 얇아져요) · 롤 ✕ · 꾹 눌러 옮기기 = 되감겨요 (안 써요) */
    function dsRewind(d) {
        const P = d && d.pull; if (!P) return; d.pull = null;
        P.st.remove(); if (P.cut) P.cut.remove();
        if (P.e.q0) P.roll.style.setProperty('--q', Math.max(0, P.e.q / P.e.q0).toFixed(3));
        if (DS.m.has(d.id)) dsPaint(d);                                          // 롤 끝(탭) 다시
    }
    function dsPullShift(P, dx, dy) {                                         // 🎀 롤을 옮기면 뽑아 둔 테이프도 같이
        P.cx += dx; P.cy += dy; P.x += dx; P.y += dy; const h = P.st.offsetHeight;
        P.st.style.left = P.cx + 'px'; P.st.style.top = (P.cy - h / 2) + 'px';
        if (P.cut && !P.cut.hidden) dsPullCutAt(P);
    }
    function dsPullCutAt(P) {                                                 // ✂ = 롤 입구 바로 옆 (테이프 위)
        if (!P.cut) {
            P.cut = document.createElement('button'); P.cut.type = 'button'; P.cut.className = 'dsk-cut'; P.cut.textContent = '✂'; P.cut.title = '여기서 잘라 붙여요';
            P.cut.addEventListener('pointerdown', ev => ev.stopPropagation());
            P.cut.addEventListener('click', ev => { ev.stopPropagation(); const d = P.d; if (d.pull !== P) return; const r = P.cr || 0; if (P.L - r < 20 * P.k) { showMsg('🎀 조금 더 뽑아 주세요'); return; } const at = { x1: P.cx + Math.cos(P.a) * r, y1: P.cy + Math.sin(P.a) * r, x2: P.x, y2: P.y }; dsRewind(d); DS.tape = at; dsUse(d); });   // ✂ 자리 = 자르는 곳 (도련 11-04 : 롤 밑에 숨은 만큼 길어졌어요 · 보이는 만큼만)
            P.d.el.parentNode.appendChild(P.cut);
        }
        const R0 = P.roll.getBoundingClientRect().width / 2 + 22, r = Math.min(P.L, R0); P.cr = r;
        P.cut.style.left = (P.cx + Math.cos(P.a) * r) + 'px'; P.cut.style.top = (P.cy + Math.sin(P.a) * r) + 'px'; P.cut.style.zIndex = (+P.d.el.style.zIndex || 1) + 1;
        P.cut.hidden = false;
    }
    function dsPullWire(P) {                                                  // 뽑아 둔 테이프 끝을 잡고 늘이기 · 되감기
        P.st.addEventListener('pointerdown', ev => {
            if (ev.button > 0 || P.d.pull !== P) return; ev.preventDefault(); ev.stopPropagation();
            try { P.st.setPointerCapture(ev.pointerId); } catch (er) {}
            const ox = P.x - ev.clientX, oy = P.y - ev.clientY, id = ev.pointerId; if (P.cut) P.cut.hidden = true;
            const mv = e => { if (e.pointerId === id) dsPullMove(P, e.clientX + ox, e.clientY + oy); };
            const up = e => { if (e.pointerId !== id) return; P.st.removeEventListener('pointermove', mv); P.st.removeEventListener('pointerup', up); P.st.removeEventListener('pointercancel', up); dsPullEnd(P, true); };
            P.st.addEventListener('pointermove', mv); P.st.addEventListener('pointerup', up); P.st.addEventListener('pointercancel', up);
        });
    }
    function dsPullStart(d, e) {
        const roll = d.el.querySelector('.bk-roll'), cv = bq('canvasArea'); if (!roll || !cv) return null;
        const r = roll.getBoundingClientRect(), cr = cv.getBoundingClientRect(), k = cr.width / (cv.offsetWidth || cr.width) || 1;
        const st = document.createElement('div'); st.className = 'dsk-pull';
        st.style.backgroundImage = `url("${e.th || ''}")`; st.style.height = (30 * k) + 'px'; st.style.zIndex = d.el.style.zIndex;
        d.el.parentNode.insertBefore(st, d.el);
        const P = { d, e, roll, st, k, cx: r.left + r.width / 2, cy: r.top + r.height / 2, max: Math.max(0, (window.ownQtyLeft ? ownQtyLeft(d.id) : e.q) || 0) * k, L: 0, x: 0, y: 0, a: 0 };
        dsPullWire(P); return P;
    }
    function dsPullMove(P, x, y) {
        const a = Math.atan2(y - P.cy, x - P.cx), L = Math.min(P.max, Math.hypot(x - P.cx, y - P.cy));
        P.L = L; P.a = a; P.x = P.cx + Math.cos(a) * L; P.y = P.cy + Math.sin(a) * L;
        const h = P.st.offsetHeight;
        P.st.style.left = P.cx + 'px'; P.st.style.top = (P.cy - h / 2) + 'px'; P.st.style.width = L + 'px'; P.st.style.transform = `rotate(${a}rad)`;
        if (P.e.q0) P.roll.style.setProperty('--q', Math.max(0, (P.e.q - L / P.k) / P.e.q0).toFixed(3));   // 롤이 얇아져요
    }
    function dsPullEnd(P, use) {                                              // 손을 뗐어요 = 뽑아 둔 채로 (조금만 끌었거나 다 되감았으면 = 없던 일)
        if (!P) return;
        if (!use || P.L < 20 * P.k) { P.d.pull = P; dsRewind(P.d); return; }
        P.d.pull = P; P.st.style.pointerEvents = 'auto'; dsPullCutAt(P);
        const tb = P.d.el.querySelector('.dsk-tab'); if (tb) tb.remove();       // 뽑아 둔 동안은 테이프 끝이 탭
    }
    function dsSmall(d) {
        if (!d.el.classList.contains('big')) return;
        const e = dsEntry(d.id); if (e && e.k === 'tape') { d.el.classList.add('rest'); return; }   // 🎀 테이프 롤은 작아지지 않아요 · 살짝 흐려질 뿐 (크기 = 남은 길이 · 도련 11-04)
        d.el.classList.remove('big'); dsPaint(d);
    }
    async function dsUse(d) {
        dsSmall(d);
        try { await bkOpenSheet(d.id); } finally { DS.tape = null; }
        setTimeout(() => DS.m.has(d.id) && dsPaint(d), 500);
    }
    document.addEventListener('pointerdown', ev => { DS.m.forEach(o => { if (o.el.classList.contains('big') && !o.el.contains(ev.target)) dsSmall(o); }); }, true);   // 다른 곳 = 작아져요
    function dsShut() {                                                       // 열린(맨 위) 종이의 떼는 화면 닫기
        if (window.closeStickerPeel && bq('pelRoom') && bq('pelRoom').classList.contains('show')) closeStickerPeel();
        if (window.closePieceBag && bq('pcbRoom') && bq('pcbRoom').classList.contains('show')) closePieceBag();
        if (window.closePaperSheet && bq('pmRoom') && bq('pmRoom').classList.contains('show')) closePaperSheet();
        if (window.closeTteokRoom && bq('tkRoom') && bq('tkRoom').classList.contains('show')) closeTteokRoom();
    }
    /* 📕 다이어리가 덮였거나 🪑 책상에 놓여 있으면 꺼낸 종이를 톡 해도 다이어리는 그대로 (도련 11-05 · 안내 없음)
       🏷️ 씰 = 스티커창만 크게 (떼어 볼 수 있고 · 붙이려면 다이어리를 펼쳐요 · js/stickerpeel.js stay) · 조각 · 모조지 · 떡메 = 종이만 살짝 흔들 */
    const dsDyAway = () => (typeof isCoverOpen !== 'undefined' && !isCoverOpen) || (UI.desk() && !document.documentElement.classList.contains('desk-show'));
    async function dsOpen(d) {                                                // 톡 = 이 종이가 맨 위 · 떼는 화면으로
        if (B.opening) return;
        const e0 = dsEntry(d.id), stay = dsDyAway();
        if (e0 && stay && !['tape', 'memo', 'leaf', 'seal'].includes(e0.k)) { d.el.animate([{ rotate: '0deg' }, { rotate: '-4deg' }, { rotate: '3deg' }, { rotate: '0deg' }], { duration: 360, easing: 'ease-in-out' }); return; }
        if (!stay) await bkLift();
        const prev = DS.act ? DS.m.get(DS.act) : null;
        if (DS.act) { dsShut(); DS.act = ''; if (prev) { prev.el.classList.remove('act'); dsMoveFromPeel(prev); dsReload(prev.id); dsPaint(prev); } }
        const e = dsEntry(d.id); if (!dsLeft(e)) { dsDrop(d.id); return; }
        const win = !['tape', 'memo', 'leaf'].includes(e.k);                   // 테이프 · 메모지 · 속지는 창이 없어요
        if (!win) { if (e.k === 'tape') { dsBig(d); return; } if (d.el.classList.contains('big')) dsUse(d); else dsBig(d); return; }   // 늘 '커진 다음에 써요' (도련 10-26 · 크게 보려고 눌렀다가 써 버리지 않게)
        DS.act = d.id; d.el.classList.add('act'); document.body.classList.add('dsk-on');
        DS.at = { x: d.x, y: d.y }; await bkOpenSheet(d.id, stay); DS.at = null;
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
    window.dsTapeOut = async (id, at) => { if (!dsEntry(id) && window.ownList) { try { DS.more = await ownList(false, 'tape'); } catch (e) {} } const d = dsTake(id, at, true); if (d) { const e = dsEntry(id); if (e && e.k === 'tape') dsBig(d); } return !!d; };   // 🎀 마테 정리함에서 톡 = 롤을 페이지 위에 꺼내 크게 → 롤에서 끌어 뽑아 써요 (js/desktape.js · 도련 11-03)
    window.dsHas = id => DS.m.has(id);

    /* ---------- 🎨 기본상품 샵 물건 그림 (도련 10-25 · 입체감 있는 손그림 SVG · 그림 파일 없이) ----------
       stkArt(종류) → SVG 글 (72×64 · 진한 갈색 아웃라인 #7b5a63) · 기본상품 샵 선반(.st2-goods)에 넣어요 */
    let ART_N = 0;
    function stkArt(k) {
        const u = 'a' + (++ART_N), sh = `<filter id="${u}s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#6e4050" flood-opacity=".28"/></filter>`;
        const gl = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${u}gl)"/>`;   // 반짝 (위쪽 하이라이트)
        const glDef = `<linearGradient id="${u}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
        const heart = (x, y, s, c1, c2, id) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 4C0-1 7-2 8 3 9-2 16-1 16 4 16 9 8 13 8 13 8 13 0 9 0 4Z" fill="#fff" stroke="#7b5a63" stroke-width="1.4" stroke-linejoin="round" transform="translate(-1.6 -1.6) scale(1.2)"/><path d="M0 4C0-1 7-2 8 3 9-2 16-1 16 4 16 9 8 13 8 13 8 13 0 9 0 4Z" fill="url(#${id})"/><ellipse cx="4.5" cy="3.2" rx="2.2" ry="1.3" fill="#fff" opacity=".7"/></g><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;
        const star = (x, y, s, id) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M8 0l2.4 5 5.4.7-4 3.8 1 5.4L8 12.3 3.2 14.9l1-5.4-4-3.8L5.6 5z" fill="#fff" stroke="#7b5a63" stroke-width="4.6" stroke-linejoin="round"/><path d="M8 0l2.4 5 5.4.7-4 3.8 1 5.4L8 12.3 3.2 14.9l1-5.4-4-3.8L5.6 5z" fill="#fff" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 0l2.4 5 5.4.7-4 3.8 1 5.4L8 12.3 3.2 14.9l1-5.4-4-3.8L5.6 5z" fill="url(#${id})"/><path d="M6 4l2-3 1 3" fill="#fff" opacity=".6"/></g><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset="1" stop-color="#f7c34a"/></linearGradient></defs>`;
        const dot = (x, y, r, c1, c2, id) => `<circle cx="${x}" cy="${y}" r="${r + 1.6}" fill="#fff" stroke="#7b5a63" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/><ellipse cx="${x - r * .35}" cy="${y - r * .4}" rx="${r * .4}" ry="${r * .25}" fill="#fff" opacity=".7"/><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>`;
        /* 🎨 코너 칸 아이콘 도우미 (도련 11-07 · 다이어리 · 문구 · 책상소품도 스티커 아이콘처럼 · 이모지 대신) */
        const O = 'stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"', O2 = 'stroke="#7b5a63" stroke-width="1.2" stroke-linejoin="round"', S = `filter="url(#${u}s)"`;
        const lg = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${u}${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
        const F = id => `url(#${u}${id})`;
        const wire = (d, c, w = 2.6) => `<path d="${d}" fill="none" stroke="#7b5a63" stroke-width="${w + 2.8}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
        const YR = new Date().getFullYear();
        const cover = (id, c1, c2, sp, inner) => `<g ${S}><rect x="18" y="6" width="42" height="52" rx="5" fill="${F(id)}"/><rect x="18" y="6" width="9" height="52" rx="4" fill="${sp}"/><rect x="18" y="6" width="42" height="52" rx="5" fill="none" ${O}/></g>${inner}
            ${[16, 32, 48].map(y => `<rect x="11" y="${y - 3}" width="13" height="6" rx="3" fill="none" stroke="#7b5a63" stroke-width="4.6"/><rect x="11" y="${y - 3}" width="13" height="6" rx="3" fill="none" stroke="#eef0f6" stroke-width="2.2"/>`).join('')}${gl(18, 6, 42, 16, 5)}<defs>${lg(id, c1, c2, 1, 1)}</defs>`;   // 📔 링 바인더 표지
        const holes = () => [14, 26, 38, 50].map(y => `<circle cx="26.5" cy="${y}" r="1.9" fill="#ece5f3" stroke="#7b5a63" stroke-width="1"/>`).join('');
        const book = (x, w, h, c, by) => `<rect x="${x}" y="${by - h}" width="${w}" height="${h}" rx="1" fill="${c}" ${O2}/><path d="M${x + 1} ${by - h + 3}h${w - 2}M${x + 1} ${by - 3}h${w - 2}" stroke="#fff" stroke-width="1" opacity=".7"/>`;
        const roll = (cx, cy, r, c, id) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${u}${id})" ${O2}/><circle cx="${cx}" cy="${cy}" r="${r * .45}" fill="#f2dcbc" ${O2}/><circle cx="${cx}" cy="${cy}" r="${r * .2}" fill="#fff8ee"/><defs><pattern id="${u}${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="${c}"/><rect width="2.5" height="5" fill="#fff" opacity=".7"/></pattern></defs>`;
        const spark = (x, y, s, c) => `<path d="M${x} ${y - 3 * s}l${s} ${2 * s} ${2 * s} ${s} -${2 * s} ${s} -${s} ${2 * s} -${s} -${2 * s} -${2 * s} -${s} ${2 * s} -${s}z" fill="${c}"/>`;
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
            desk: () => `<g filter="url(#${u}s)">
                <ellipse cx="20" cy="56.5" rx="12" ry="3.6" fill="#f58fb0" stroke="#7b5a63" stroke-width="1.7"/>
                <path d="M19 55 L13 33 L30 17" fill="none" stroke="#7b5a63" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 55 L13 33 L30 17" fill="none" stroke="#ffb3c9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="13" cy="33" r="3.2" fill="#ffd3e0" stroke="#7b5a63" stroke-width="1.5"/>
                <path d="M24 12 Q33 4 42 13 L44 24 Q34 27 26 22 Z" fill="#ff9fbd" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M36 9 Q41 11 42 13 L44 24 Q40 25.5 37 25.6 Z" fill="#f07fa2"/>
                <path d="M24 12 Q33 4 42 13 L44 24 Q34 27 26 22 Z" fill="none" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M27 21.6 Q35 25.5 43.6 23.6" fill="none" stroke="#fff3c4" stroke-width="2.4" stroke-linecap="round"/>
                </g>
                <g filter="url(#${u}s)">
                <path d="M45 30 l2 -17 l3 0 l1 17z" fill="#ffd36e" stroke="#7b5a63" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M47 13 l1.5 -5 l1.5 5z" fill="#ffe9c2" stroke="#7b5a63" stroke-width="1.2" stroke-linejoin="round"/>
                <path d="M51 30 l3 -20 l3 .5 l-1 19.5z" fill="#9fd0f5" stroke="#7b5a63" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M54 10 l2.2 -4.6 l.8 5.1z" fill="#ffe9c2" stroke="#7b5a63" stroke-width="1.2" stroke-linejoin="round"/>
                <path d="M56.5 30 l5 -15 l2.8 1 l-4.3 14.5z" fill="#ff9fbd" stroke="#7b5a63" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M61.5 15 l3.3 -3.6 l-.5 4.6z" fill="#ffe9c2" stroke="#7b5a63" stroke-width="1.2" stroke-linejoin="round"/>
                <path d="M41 29 h26 l-2.4 27.5 a3 3 0 0 1 -3 2.7 h-15.2 a3 3 0 0 1 -3 -2.7z" fill="#a8e3cf" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M58 29 h9 l-2.4 27.5 a3 3 0 0 1 -3 2.7 h-4.2z" fill="#86d1b6"/>
                <path d="M41 29 h26 l-2.4 27.5 a3 3 0 0 1 -3 2.7 h-15.2 a3 3 0 0 1 -3 -2.7z" fill="none" stroke="#7b5a63" stroke-width="1.7" stroke-linejoin="round"/>
                <rect x="40" y="27" width="28" height="4.6" rx="2.3" fill="#c9f0e2" stroke="#7b5a63" stroke-width="1.5"/>
                <path d="M48 41.5c0-3 4.2-3.6 4.8-.6.6-3 4.8-2.4 4.8.6 0 2.9-4.8 5.6-4.8 5.6s-4.8-2.7-4.8-5.6z" fill="#ff8fb0" stroke="#7b5a63" stroke-width="1.2" stroke-linejoin="round"/>
                </g>`,   // 🪑 책상소품 = 분홍 스탠드 + 펜꽂이 (도련 11-04 · 이모지 대신)
            /* 📔 다이어리 코너 (도련 11-07) */
            'tool:dyb': () => cover('dyb', '#ffcadb', '#ff9fbd', '#ef86a8', `<rect x="31" y="13" width="23" height="12" rx="3" fill="#fffaf2" ${O2}/><text x="42.5" y="21.8" text-anchor="middle" font-size="7.6" font-weight="700" font-family="Jua, sans-serif" fill="#e0668c">${YR}</text>${heart(35, 34, .95, '#fff', '#ffd6e2', u + 'dbh')}`),
            'tool:pgb': () => cover('pgb', '#d2f3e7', '#8fd6bc', '#6fc3a5', `<rect x="31" y="13" width="23" height="12" rx="3" fill="#fffaf2" ${O2}/><path d="M35 17.6h15M35 21h10" stroke="#9fd3bf" stroke-width="1.5" stroke-linecap="round"/>${star(35, 32, 1, u + 'pbs')}`),
            'tool:dyr': () => `<rect x="14" y="10" width="38" height="50" rx="3" fill="#eaf4ff" ${O} transform="rotate(-8 33 35)" ${S}/>
                <g ${S}><rect x="22" y="6" width="38" height="52" rx="3" fill="#fff"/></g><path d="M22 9a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v8H22z" fill="${F('dyr')}"/>
                <path d="M31 21v34M37.5 21v34M44 21v34M50.5 21v34M57 21v34M31 21h26M31 27.8h26M31 34.6h26M31 41.4h26M31 48.2h26M31 55h26" stroke="#f5c6d5" stroke-width="1"/>
                <rect x="44" y="34.6" width="6.5" height="6.8" fill="#ffe3ec"/>${heart(44.6, 35.4, .37, '#ffb7cc', '#ff7fa3', u + 'drh')}
                <rect x="22" y="6" width="38" height="52" rx="3" fill="none" ${O}/><path d="M22 17h38" stroke="#7b5a63" stroke-width="1.1"/>${holes()}
                <circle cx="38" cy="11.5" r="1.4" fill="#fff"/><circle cx="44" cy="11.5" r="1.4" fill="#fff"/><circle cx="50" cy="11.5" r="1.4" fill="#fff"/><defs>${lg('dyr', '#ffc4d6', '#ff9fbd')}</defs>`,
            'tool:pgr': () => `<rect x="14" y="10" width="38" height="50" rx="3" fill="#ffeef4" ${O} transform="rotate(-8 33 35)" ${S}/>
                <g ${S}><rect x="22" y="6" width="38" height="52" rx="3" fill="${F('pgr')}" ${O}/></g>
                <g fill="#b9cfe8">${[0, 1, 2, 3, 4].map(i => [0, 1, 2, 3, 4, 5, 6, 7, 8].map(j => `<circle cx="${33 + i * 5.5}" cy="${12 + j * 5.2}" r=".95"/>`).join('')).join('')}</g>
                ${star(42, 40, .8, u + 'prs')}${holes()}${gl(22, 6, 38, 16, 3)}<defs>${lg('pgr', '#fff', '#f1f7fd', 1, 1)}</defs>`,
            'tool:dyn': () => `<path d="M25 50v12l3-2.6 3 2.6V50" fill="#c7b3f2" ${O2}/>
                <g ${S}><rect x="18" y="8" width="38" height="50" rx="3" fill="#fffaf0" ${O}/><rect x="14" y="6" width="38" height="50" rx="4" fill="${F('dyn')}" ${O}/></g>
                <path d="M53.5 12v42M55 12v42" stroke="#e8dcc0" stroke-width=".9"/>
                <rect x="43.5" y="6" width="3.8" height="50" fill="#ff9fbd" stroke="#7b5a63" stroke-width="1.1"/>
                <rect x="18" y="15" width="21" height="11" rx="5.5" fill="#fff" ${O2}/><text x="28.5" y="23" text-anchor="middle" font-size="7" font-weight="700" font-family="Jua, sans-serif" fill="#d9a43a">${YR}</text>
                ${heart(21, 33, .78, '#ffb7cc', '#ff7fa3', u + 'dnh')}${dot(33, 46, 3.4, '#d6ecff', '#7fbdf0', u + 'dnb')}${gl(14, 6, 38, 16, 4)}<defs>${lg('dyn', '#fff3c4', '#ffd98a', 1, 1)}</defs>`,
            'tool:pgn': () => `<path d="M24 50v12l3-2.6 3 2.6V50" fill="#ff9fbd" ${O2}/>
                <g ${S}><rect x="18" y="8" width="38" height="50" rx="3" fill="#fffaf0" ${O}/><rect x="14" y="6" width="38" height="50" rx="4" fill="${F('pgn')}" ${O}/></g>
                <path d="M53.5 12v42M55 12v42" stroke="#e8dcc0" stroke-width=".9"/>
                <rect x="14" y="6" width="7" height="50" rx="3.5" fill="#a98bf0" opacity=".85"/><path d="M21 6v50" stroke="#7b5a63" stroke-width="1.1"/>
                <rect x="43.5" y="6" width="3.8" height="50" fill="#ffd98a" stroke="#7b5a63" stroke-width="1.1"/>
                <rect x="25" y="14" width="16" height="13" rx="2.5" fill="#fff" ${O2}/><path d="M28 18.6h10M28 22.4h7" stroke="#c9b6f2" stroke-width="1.5" stroke-linecap="round"/>
                ${star(25, 33, .78, u + 'pns')}${heart(29, 44, .62, '#ffb7cc', '#ff7fa3', u + 'pnh')}${gl(14, 6, 38, 16, 4)}<defs>${lg('pgn', '#e9e1ff', '#c7b3f2', 1, 1)}</defs>`,   // 📕 페이지노트 (도련 11-11 · 2026 노트와 같은 그림 말 · 연보라 · 해 대신 줄 라벨)
            'tool:bd': () => `<g ${S}><rect x="12" y="6" width="48" height="52" rx="6" fill="${F('bd')}"/><rect x="12" y="6" width="10" height="52" rx="5" fill="#a98bf0"/><rect x="12" y="6" width="48" height="52" rx="6" fill="none" ${O}/></g>
                <path d="M56 25h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7z" fill="#ff9fbd" ${O2}/><circle cx="61" cy="32" r="1.8" fill="#fff" ${O2}/>
                <rect x="26" y="12" width="27" height="40" rx="3" fill="#fff" fill-opacity=".78" ${O2}/><path d="M26 32h27" stroke="#7b5a63" stroke-width="1" opacity=".45"/>
                ${heart(29, 16, .62, '#ffb7cc', '#ff7fa3', u + 'bdh')}${star(40, 15, .62, u + 'bdy')}${dot(33, 43, 4, '#c9f0dc', '#6fcfa0', u + 'bdg')}${heart(40, 38, .55, '#d6ecff', '#7fbdf0', u + 'bdb')}
                <path d="M30 50l19-34" stroke="#fff" stroke-width="2.4" opacity=".7"/>${gl(12, 6, 48, 16, 6)}<defs>${lg('bd', '#efe6ff', '#c7b1f5', 1, 1)}</defs>`,
            'tool:rl': () => `<g ${S}><path d="M36 18Q22 12 5 16V57Q22 53 36 59Q50 53 67 57V16Q50 12 36 18Z" fill="#ff9fbd" ${O}/></g>
                <path d="M36 15Q24 9 8 13V54Q24 50 36 56Z" fill="${F('rl')}" ${O}/><path d="M36 15Q48 9 64 13V54Q48 50 36 56Z" fill="${F('rl')}" ${O}/>
                ${heart(12, 21, .72, '#ffb7cc', '#ff7fa3', u + 'rlh')}${dot(23, 42, 4.4, '#d6ecff', '#7fbdf0', u + 'rlb')}${star(43, 18, .78, u + 'rly')}${heart(47, 37, .66, '#e0d2ff', '#a98bf0', u + 'rlv')}
                <path d="M13 50l14-24M42 49l13-22" stroke="#fff" stroke-width="2" opacity=".75"/><defs>${lg('rl', '#ffffff', '#e6ebf4', 1, 1)}</defs>`,
            /* ✂️ 문구 코너 */
            'gd:tweez': () => `${heart(8, 45, .7, '#ffb7cc', '#ff7fa3', u + 'twh')}
                <g ${S}>${wire('M60 9L38 20L17 47', '#eef1f6', 3.4)}${wire('M60 9L46 34L21 50', '#dde2ec', 3.4)}</g>
                <path d="M55.6 11.2L44.6 16.7M57.2 14L50.9 25.2" stroke="#ff9fbd" stroke-width="3.4" stroke-linecap="round"/>
                <path d="M40 19.4L22 41" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/><circle cx="60" cy="9" r="3.4" fill="#f4f6fa" ${O2}/>${spark(12, 38, 1.1, '#ffd36e')}`,
            'gd:clip': () => `<rect x="17" y="41" width="38" height="19" rx="2" fill="#fffaf2" ${O} transform="rotate(4 36 50)"/><path d="M22 52h26M22 56h20" stroke="#ead9c4" stroke-width="1.2" transform="rotate(4 36 50)"/>
                <g ${S}>${wire('M25 29L19 8Q36 1 53 8L47 29', '#eef1f6', 2.8)}</g>
                <g ${S}><path d="M12 34L22 25H50L60 34Z" fill="#ffd0de" ${O}/><path d="M12 34H60L57 50a3 3 0 0 1-3 2.6H18A3 3 0 0 1 15 50Z" fill="${F('clp')}" ${O}/></g>
                <path d="M17 38H55" stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"/>${heart(29.6, 38.6, .8, '#fff', '#ffe0ea', u + 'clh')}<defs>${lg('clp', '#ff9fbd', '#f07fa2')}</defs>`,
            'gd:punch': () => `<g ${S}><path d="M8 43a5 5 0 0 1 5-5H59a5 5 0 0 1 5 5V52a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z" fill="${F('pnb')}" ${O}/><path d="M12 39Q12 21 30 19L60 28Q64 30 62 39Z" fill="${F('pnt')}" ${O}/></g>
                <path d="M18 34Q19 25 30 23.5L50 29" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".75"/><path d="M14 46H58" stroke="#7b5a63" stroke-width="1.2" opacity=".45"/>
                <circle cx="26" cy="51" r="2" fill="#fff" opacity=".7"/><circle cx="46" cy="51" r="2" fill="#fff" opacity=".7"/>
                <circle cx="56" cy="13" r="2.6" fill="#ff9fbd" ${O2}/><circle cx="64" cy="19" r="2.2" fill="#ffd36e" ${O2}/><circle cx="48" cy="8" r="2" fill="#a8e3cf" ${O2}/><defs>${lg('pnb', '#c4e2fb', '#8ec3ee')}${lg('pnt', '#e6f3ff', '#b2d7f7')}</defs>`,
            'gd:tape': () => `<path d="M5 58H32" stroke="#7b5a63" stroke-width="7.4" stroke-linecap="round"/><path d="M5 58H32" stroke="#ffd3e0" stroke-width="4.6" stroke-linecap="round"/><path d="M7 58H31" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 3"/>
                <g ${S}><path d="M22 10Q46 0 60 16Q66 30 54 42L34 55Q26 59 21 53L15 44Q10 22 22 10Z" fill="${F('tpb')}" ${O}/></g>
                <path d="M23 54L31 57.6L25 60.6Z" fill="#f4f6fa" ${O2}/>
                <circle cx="40" cy="25" r="11" fill="#fff" fill-opacity=".85" ${O2}/><circle cx="40" cy="25" r="7.5" fill="${F('tpr')}" stroke="#7b5a63" stroke-width="1"/><circle cx="40" cy="25" r="3" fill="#fff" stroke="#7b5a63" stroke-width="1"/>
                <path d="M24 14Q40 6 54 15" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>${heart(25, 39, .55, '#fff', '#e3fff3', u + 'tph')}<defs>${lg('tpb', '#cdf2e4', '#86d1b6', 1, 1)}${lg('tpr', '#ffc4d6', '#ff9fbd')}</defs>`,
            'gd:scissors': () => `<g ${S}><path d="M33 31L60 5Q66 5 64 11L40 35Z" fill="${F('scb')}" ${O}/><path d="M35 27L65 17Q68 21 63 24L39 34Z" fill="${F('scb')}" ${O}/></g>
                <path d="M37 30L59 9" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
                <g ${S}><path d="M36 32L23 39M38 33L32 47" fill="none" stroke="#7b5a63" stroke-width="7.2" stroke-linecap="round"/><circle cx="17" cy="43" r="7.6" fill="none" stroke="#7b5a63" stroke-width="7.6"/><circle cx="30" cy="54.5" r="6.4" fill="none" stroke="#7b5a63" stroke-width="7.6"/></g>
                <path d="M36 32L23 39M38 33L32 47" fill="none" stroke="#ff9fbd" stroke-width="4.4" stroke-linecap="round"/><circle cx="17" cy="43" r="7.6" fill="none" stroke="#ff9fbd" stroke-width="4.6"/><circle cx="30" cy="54.5" r="6.4" fill="none" stroke="#ff9fbd" stroke-width="4.6"/>
                <path d="M11.5 39.5a7 7 0 0 1 4-3.6" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="37" cy="31.6" r="2.6" fill="#ffd36e" ${O2}/><defs>${lg('scb', '#f6f8fc', '#c9d1de', 1, 1)}</defs>`,
            'gd:knife': () => `<g transform="rotate(-38 36 33)"><g ${S}><path d="M48 27H66L60 39H48Z" fill="${F('knb')}" ${O}/><rect x="6" y="26" width="44" height="14" rx="5" fill="${F('knn')}" ${O}/></g>
                <path d="M55 27L52 39M60 27L57 39" stroke="#7b5a63" stroke-width=".9" opacity=".55"/><path d="M10 30h36" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>
                <path d="M11 34v4M14 34v4M17 34v4" stroke="#d9a43a" stroke-width="1.2" stroke-linecap="round"/><rect x="24" y="22.4" width="11" height="5.4" rx="2" fill="#ff9fbd" ${O2}/></g><defs>${lg('knb', '#f6f8fc', '#c9d1de')}${lg('knn', '#ffeaa6', '#f7c34a')}</defs>`,
            'gd:ruler': () => `<g transform="rotate(-30 36 32)"><g ${S}><rect x="2" y="24" width="68" height="17" rx="3" fill="${F('rul')}" ${O}/></g>
                <path d="${Array.from({ length: 13 }, (_, i) => `M${7 + i * 5} 24v${i % 2 ? 4 : 7}`).join('')}" stroke="#5aa98b" stroke-width="1.1" stroke-linecap="round"/>
                <path d="M50 33.6c0-2.6 3.6-3.2 4.2-.5.6-2.7 4.2-2.1 4.2.5 0 2.6-4.2 4.8-4.2 4.8s-4.2-2.2-4.2-4.8z" fill="#fff" ${O2}/><rect x="4" y="36" width="40" height="2.6" rx="1.3" fill="#fff" opacity=".5"/></g><defs>${lg('rul', '#ddf7ee', '#a8e3cf')}</defs>`,
            'gd:pen': () => `<g transform="rotate(-62 40 32)"><g ${S}><rect x="10" y="28" width="44" height="8" rx="3" fill="${F('pnc')}" ${O}/><path d="M54 28.6L62 32L54 35.4Z" fill="#eef1f6" ${O2}/></g><rect x="14" y="26" width="12" height="4" rx="1.5" fill="#79b6e6" ${O2}/><path d="M12 30.4h40" stroke="#fff" stroke-width="1.4" opacity=".6"/></g>
                <g transform="rotate(-30 34 36)"><g ${S}><rect x="2" y="31" width="7" height="10" rx="2.4" fill="#ff9fbd" ${O}/><rect x="8" y="31" width="40" height="10" fill="${F('pcl')}" ${O}/><path d="M48 31L62 36L48 41Z" fill="#f6dcb5" ${O}/></g>
                <rect x="7.4" y="31" width="4.4" height="10" fill="#eef1f6" ${O2}/><path d="M58.6 34.8L62 36L58.6 37.2Z" fill="#7b5a63"/><path d="M12 34h35" stroke="#fff" stroke-width="1.6" opacity=".6"/><path d="M12 38h35" stroke="#e7b84a" stroke-width="1"/></g>
                <defs>${lg('pnc', '#c4e2fb', '#8ec3ee')}${lg('pcl', '#ffeaa6', '#f7c34a')}</defs>`,
            gd: () => `<g transform="translate(17 -3) scale(.8)">${A['gd:pen']()}</g><g transform="translate(-6 6) scale(.92)">${A['gd:scissors']()}</g>`,   // ✂️ 문구 = 가위 + 연필 (첫 창 · 팻말)
            /* 🪑 책상소품 코너 */
            'desk:drawer': () => `<g ${S}><rect x="12" y="11" width="48" height="45" rx="4" fill="${F('drw')}" ${O}/><rect x="15" y="55" width="6" height="5" rx="1.5" fill="#e7b84a" ${O2}/><rect x="51" y="55" width="6" height="5" rx="1.5" fill="#e7b84a" ${O2}/><rect x="9" y="6" width="54" height="7" rx="3" fill="#ffc4d6" ${O}/></g>
                ${[16, 29, 42].map((y, i) => `<rect x="16" y="${y}" width="40" height="11" rx="2.5" fill="${['#fff8de', '#ffeaf1', '#eaf4ff'][i]}" ${O2}/><circle cx="36" cy="${y + 5.5}" r="2.3" fill="#ff9fbd" stroke="#7b5a63" stroke-width="1.1"/>`).join('')}
                ${heart(20, 18.6, .36, '#ffb7cc', '#ff7fa3', u + 'drh')}${gl(9, 6, 54, 12, 3)}<defs>${lg('drw', '#fff1b8', '#ffd77a')}</defs>`,
            'desk:clock': () => `${wire('M25 53L20 60M47 53L52 60', '#ff9fbd', 2.2)}
                <g ${S}><path d="M12 20A9 9 0 0 1 27 10Z" fill="#ffd36e" ${O}/><path d="M60 20A9 9 0 0 0 45 10Z" fill="#ffd36e" ${O}/></g><path d="M36 9v5" stroke="#7b5a63" stroke-width="2"/><circle cx="36" cy="8" r="2.6" fill="#ffd36e" ${O2}/>
                <g ${S}><circle cx="36" cy="35" r="21" fill="${F('clk')}" ${O}/></g><circle cx="36" cy="35" r="15.5" fill="#fffdf8" ${O2}/>
                <path d="M36 22.5v3M36 44.5v3M23.5 35h3M45.5 35h3" stroke="#e8a9bd" stroke-width="1.7" stroke-linecap="round"/><path d="M36 35V26.5M36 35l6.5 3.4" stroke="#7b5a63" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="35" r="1.9" fill="#ff7fa3"/>
                <ellipse cx="25" cy="22" rx="6" ry="2.6" fill="#fff" opacity=".6" transform="rotate(-38 25 22)"/><defs>${lg('clk', '#ffcadb', '#ff8fb0')}</defs>`,
            'desk:bookshelf': () => `<g ${S}><rect x="10" y="6" width="52" height="54" rx="3" fill="${F('bsf')}" ${O}/></g><rect x="14" y="10" width="44" height="21" rx="1.5" fill="#fbeedd" stroke="#7b5a63" stroke-width="1.1"/><rect x="14" y="35" width="44" height="21" rx="1.5" fill="#fbeedd" stroke="#7b5a63" stroke-width="1.1"/>
                ${book(16, 5, 17, '#ff9fbd', 31)}${book(21.5, 6, 19, '#9fd0f5', 31)}${book(28, 4.5, 15, '#ffd36e', 31)}${book(33, 6, 18, '#c7b3f2', 31)}<g transform="rotate(16 42 31)">${book(39.5, 5, 16, '#a8e3cf', 31)}</g>
                ${book(16, 6, 18, '#a8e3cf', 56)}${book(22.5, 5, 16, '#ffb3c9', 56)}${book(28, 6, 19, '#ffe9a0', 56)}
                <path d="M45 46h10l-1.6 10h-6.8z" fill="#ffb3c9" ${O2}/><path d="M50 46C46 41 45 38 45.5 35 49 37 50.5 41 50 46 50.5 41 53 37 57 37 56 41 53 44 50 46Z" fill="#8fd6bc" ${O2}/>
                <defs>${lg('bsf', '#f8dcbc', '#e7bb8c')}</defs>`,
            'desk:pencup': () => `<path d="M18 32L13 12L18 11L23 32Z" fill="#c7b3f2" ${O2}/><path d="M15.4 16h2.4M16.2 20h2.4M17 24h2.4" stroke="#7b5a63" stroke-width=".9"/>
                <path d="M24 32L26 11H30L31 32Z" fill="#ffd36e" ${O2}/><path d="M26 11L28 4.5L30 11Z" fill="#ffe9c2" ${O2}/><path d="M27.3 7L28 4.5L28.7 7Z" fill="#7b5a63"/>
                <path d="M32 32L38 9L42 10L37 32Z" fill="#9fd0f5" ${O2}/><path d="M38 9L41 4.6L42 10Z" fill="#eef1f6" ${O2}/>
                <path d="M38 32L48 12L51.6 13.6L43 32Z" fill="#ff9fbd" ${O2}/><path d="M48 12L52 8.6L51.6 13.6Z" fill="#ffe9c2" ${O2}/>
                <g ${S}><path d="M16 29h40l-3.5 27.5a3.5 3.5 0 0 1-3.5 3H23a3.5 3.5 0 0 1-3.5-3z" fill="${F('pcp')}" ${O}/><rect x="14.5" y="26" width="43" height="6" rx="3" fill="#c9f0e2" ${O}/></g>
                <path d="M47 35l-2 20" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>${heart(28, 38, .95, '#ffb7cc', '#ff7fa3', u + 'pch')}<defs>${lg('pcp', '#b9ebd9', '#86d1b6', 1, 0)}</defs>`,
            'desk:riser': () => `<rect x="24" y="48" width="22" height="5.4" rx="1.5" fill="#c7b3f2" ${O2}/><rect x="26" y="42.6" width="19" height="5.4" rx="1.5" fill="#ffe9a0" ${O2}/>
                <g ${S}><rect x="12" y="32" width="7" height="23" rx="2" fill="#f07fa2" ${O}/><rect x="53" y="32" width="7" height="23" rx="2" fill="#f07fa2" ${O}/><rect x="6" y="26" width="60" height="8" rx="3" fill="${F('rsr')}" ${O}/></g>
                <rect x="8.4" y="27.4" width="55" height="2.4" rx="1.2" fill="#fff" opacity=".6"/>
                <path d="M15 17h13l-1.7 9h-9.6z" fill="#fff3c4" ${O2}/><path d="M21.5 17C17.5 11 15.5 9 14.5 6 19.5 7 21.5 11 21.5 17 21.5 11 24.5 7 29.5 7 27.5 11 25.5 13 21.5 17Z" fill="#8fd6bc" ${O2}/>
                <g transform="rotate(5 42 18)"><rect x="34" y="10" width="16" height="16" rx="2" fill="#fff" ${O2}/><rect x="37" y="13" width="10" height="10" rx="1" fill="#d6ecff"/>${heart(38.3, 15, .45, '#ffb7cc', '#ff7fa3', u + 'rsh')}</g>${spark(58, 15, 1.2, '#ffd36e')}<defs>${lg('rsr', '#ffd6e2', '#ff9fbd')}</defs>`,
            'desk:basket': () => `${wire('M15 31Q15 5 36 5Q57 5 57 31', '#ecc893', 3)}
                <rect x="20" y="13" width="13" height="18" rx="2" fill="#fff" ${O2} transform="rotate(-12 26 22)"/>${heart(21.5, 16, .45, '#ffb7cc', '#ff7fa3', u + 'bkh')}
                <circle cx="44" cy="23" r="7.4" fill="${F('bkr')}" ${O2}/><circle cx="44" cy="23" r="3.2" fill="#f2dcbc" ${O2}/>
                <g ${S}><path d="M10 31h52l-5.5 23a4 4 0 0 1-4 3h-33a4 4 0 0 1-4-3z" fill="${F('bsk')}" ${O}/></g>
                <path d="M13 38.5H59M14.6 45H57.4M16.2 51.5H55.8" stroke="#e9c38f" stroke-width="3.4" stroke-dasharray="4 3"/><path d="M14.6 45H57.4" stroke="#e9c38f" stroke-width="3.4" stroke-dasharray="4 3" stroke-dashoffset="3.5"/>
                <rect x="7" y="27" width="58" height="7" rx="3.5" fill="#f3d3a6" ${O}/><path d="M18 30.5l-7-4.6v9.2zM18 30.5l7-4.6v9.2z" fill="#ff9fbd" ${O2}/><circle cx="18" cy="30.5" r="2.2" fill="#ff7fa3" ${O2}/>
                <defs>${lg('bsk', '#f6dbb2', '#deb07a')}${lg('bkr', '#bfe3ff', '#7fbdf0')}</defs>`,
            'desk:lamp': () => `<path d="M31 26L26 58H66L54 26Z" fill="${F('lmg')}"/>
                <ellipse cx="20" cy="56.5" rx="13" ry="4" fill="#c7b3f2" ${O}/>${wire('M20 55L13 33L31 16', '#e6dcff', 2.8)}<circle cx="13" cy="33" r="3.2" fill="#ffd3e0" ${O2}/>
                <g ${S}><path d="M28 12Q39 2 51 12L55 26Q43 30 31 25Z" fill="${F('lms')}" ${O}/></g>
                <path d="M31.5 24.6Q43 29 54.4 25.6" stroke="#fff3c4" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M33 11Q38 6.6 44 7.6" stroke="#fff" stroke-width="2" opacity=".75" fill="none" stroke-linecap="round"/>
                ${spark(62, 36, 1.2, '#ffd36e')}${spark(36, 46, .9, '#ffd36e')}<defs>${lg('lms', '#fff0b0', '#f7c34a')}<linearGradient id="${u}lmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></linearGradient></defs>`,
            'desk:doll': () => `<g ${S}><ellipse cx="27" cy="16" rx="5.6" ry="13" fill="${F('dol')}" ${O} transform="rotate(-12 27 16)"/><ellipse cx="45" cy="16" rx="5.6" ry="13" fill="${F('dol')}" ${O} transform="rotate(12 45 16)"/>
                <ellipse cx="36" cy="51" rx="15" ry="11" fill="${F('dol')}" ${O}/><ellipse cx="36" cy="34" rx="16.5" ry="13.5" fill="${F('dol')}" ${O}/></g>
                <ellipse cx="27" cy="16" rx="2.6" ry="9" fill="#ffc4d6" transform="rotate(-12 27 16)"/><ellipse cx="45" cy="16" rx="2.6" ry="9" fill="#ffc4d6" transform="rotate(12 45 16)"/>
                <circle cx="30" cy="34" r="2" fill="#7b5a63"/><circle cx="42" cy="34" r="2" fill="#7b5a63"/><circle cx="30.7" cy="33.3" r=".7" fill="#fff"/><circle cx="42.7" cy="33.3" r=".7" fill="#fff"/>
                <ellipse cx="26.4" cy="39" rx="3" ry="1.8" fill="#ffb3c9" opacity=".85"/><ellipse cx="45.6" cy="39" rx="3" ry="1.8" fill="#ffb3c9" opacity=".85"/><path d="M34 38.6q2 2 2 0q0 2 2 0" stroke="#7b5a63" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                <ellipse cx="25" cy="57" rx="4.6" ry="3.6" fill="#fff" ${O2}/><ellipse cx="47" cy="57" rx="4.6" ry="3.6" fill="#fff" ${O2}/>
                <path d="M36 47.4l-7.4-4.4v8.8zM36 47.4l7.4-4.4v8.8z" fill="#ff9fbd" ${O2}/><circle cx="36" cy="47.4" r="2.1" fill="#ff7fa3" ${O2}/><defs>${lg('dol', '#ffffff', '#ffe6ee')}</defs>`,
            'desk:labeler': () => `<g ${S}><rect x="8" y="22" width="56" height="34" rx="9" fill="${F('lbl')}" ${O}/><rect x="22" y="15" width="28" height="9" rx="3.5" fill="#ff9fbd" ${O2}/></g><path d="M27 16.5h18" stroke="#7b5a63" stroke-width="1.6" stroke-linecap="round"/>
                <rect x="23" y="5" width="26" height="11" rx="1.5" fill="#fff" ${O2}/><path d="M28 10.5h16" stroke="#ff7fa3" stroke-width="2" stroke-linecap="round"/>
                <rect x="13" y="27" width="46" height="11" rx="3" fill="#d6e2c4" stroke="#7b5a63" stroke-width="1.3"/><path d="M17 32.5h18" stroke="#56634a" stroke-width="1.6" stroke-linecap="round"/>
                ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${13 + i * 7.8}" y="42" width="6" height="4.6" rx="1.4" fill="#fff" stroke="#7b5a63" stroke-width=".9"/>`).join('')}${[0, 1, 2, 3, 4].map(i => `<rect x="${13 + i * 7.8}" y="48.6" width="6" height="4.2" rx="1.4" fill="#fff" stroke="#7b5a63" stroke-width=".9"/>`).join('')}<rect x="52" y="48.6" width="7" height="4.2" rx="1.4" fill="#ff7fa3" stroke="#7b5a63" stroke-width=".9"/>
                ${gl(8, 22, 56, 12, 9)}<defs>${lg('lbl', '#ffd3e0', '#f79dbb')}</defs>`,
            'desk:digicam': () => `<g ${S}><rect x="15" y="12" width="9" height="5" rx="1.5" fill="#ff9fbd" ${O2}/><rect x="6" y="15" width="60" height="40" rx="9" fill="${F('dgc')}" ${O}/></g>
                <rect x="47" y="20" width="13" height="6" rx="1.5" fill="#fff4c9" stroke="#7b5a63" stroke-width="1.2"/><circle cx="43" cy="37" r="13" fill="#ece6ee" stroke="#7b5a63" stroke-width="1.4"/><circle cx="43" cy="37" r="8.5" fill="#d6cddf" stroke="#7b5a63" stroke-width="1.2"/><rect x="38.5" y="32.5" width="9" height="9" rx="2.4" fill="#2b2430"/>
                ${heart(17, 24, .32, '#ff9fbd', '#ff7fa3', u + 'dgh')}<path d="M14 46h12" stroke="#7b5a63" stroke-width="1.8" stroke-linecap="round"/>${gl(6, 15, 60, 10, 9)}<defs>${lg('dgc', '#ffd3e0', '#f7a6c0')}</defs>`,
            'desk:printer': () => `<g ${S}><path d="M12 30C12 20 16 16 24 16H50C57 16 60 19 60 26V32H12Z" fill="#ffd9e5" ${O}/><rect x="6" y="28" width="60" height="28" rx="7" fill="${F('prt')}" ${O}/></g>
                <rect x="20" y="9" width="32" height="12" rx="1.5" fill="#fff" stroke="#7b5a63" stroke-width="1.3"/><path d="M26 14h20" stroke="#ff9fbd" stroke-width="2" stroke-linecap="round"/><rect x="18" y="19" width="36" height="3" rx="1.5" fill="#7b5a63"/>
                <rect x="49" y="24.5" width="5" height="2.6" rx="1.3" fill="#7fd3b0"/><circle cx="58" cy="25.6" r="2.4" fill="#fff" stroke="#7b5a63" stroke-width="1"/><path d="M6 46H66" stroke="#c9a3b3" stroke-width="1.2" stroke-dasharray="1 3"/><rect x="10" y="36" width="5" height="11" rx="2" fill="#f4b3c8" stroke="#7b5a63" stroke-width="1"/>
                ${gl(6, 28, 60, 8, 7)}<defs>${lg('prt', '#ffe3ec', '#ffcfdf')}</defs>`,
            'desk:taperack': () => `<g ${S}><rect x="8" y="6" width="6" height="50" rx="2" fill="${F('trk')}" ${O}/><rect x="58" y="6" width="6" height="50" rx="2" fill="${F('trk')}" ${O}/><rect x="5" y="54" width="62" height="6" rx="2.5" fill="${F('trk')}" ${O}/></g>
                <path d="M14 21H58M14 41H58" stroke="#7b5a63" stroke-width="3.6"/><path d="M14 21H58M14 41H58" stroke="#eef0f6" stroke-width="1.6"/>
                ${roll(22, 21, 7, '#ff9fbd', 'tr1')}${roll(36, 21, 7, '#9fd0f5', 'tr2')}${roll(50, 21, 7, '#ffd36e', 'tr3')}${roll(29, 41, 7, '#a8e3cf', 'tr4')}${roll(43, 41, 7, '#c7b3f2', 'tr5')}
                <rect x="8.6" y="8" width="2.2" height="44" rx="1.1" fill="#fff" opacity=".5"/><defs>${lg('trk', '#ffd6e2', '#f7a6c0')}</defs>`,
            'desk:wallshelf': () => `<path d="M14 42.6V54L24 42.6ZM58 42.6V54L48 42.6Z" fill="#e2b07c" ${O2}/>
                <path d="M20 37Q22 46 25 51" stroke="#6fc3a5" stroke-width="1.4" fill="none"/><ellipse cx="22.6" cy="44" rx="2.4" ry="1.4" fill="#8fd6bc" ${O2} transform="rotate(40 22.6 44)"/><ellipse cx="25" cy="51" rx="2.4" ry="1.4" fill="#8fd6bc" ${O2} transform="rotate(70 25 51)"/>
                <path d="M9 27h13l-1.8 10h-9.4z" fill="#ffb3c9" ${O2}/><rect x="8" y="25" width="15" height="4" rx="1.5" fill="#ffc9d9" ${O2}/><path d="M15.5 25C11.5 17 10.5 13 11.5 9 15.5 12 16.5 18 15.5 25 17.5 18 21.5 13 25.5 13 23.5 18 19.5 22 15.5 25Z" fill="#8fd6bc" ${O2}/>
                ${book(28, 5, 16, '#9fd0f5', 37)}${book(33.5, 5, 13, '#ffe9a0', 37)}${book(39, 5, 17, '#c7b3f2', 37)}
                <g transform="rotate(7 55 27)"><rect x="47.5" y="17" width="15" height="19" rx="2" fill="#fff" ${O2}/><rect x="49.8" y="19.4" width="10.4" height="10.4" rx="1" fill="#ffe3ec"/>${star(50.6, 20, .55, u + 'wss')}</g>
                <g ${S}><rect x="5" y="37" width="62" height="6" rx="2" fill="${F('wsb')}" ${O}/></g><rect x="7" y="38.2" width="58" height="1.8" rx=".9" fill="#fff" opacity=".55"/><defs>${lg('wsb', '#f8dcbc', '#e2b07c')}</defs>`,
            'desk:board': () => `<g ${S}><rect x="6" y="8" width="60" height="48" rx="4" fill="${F('bdw')}" ${O}/></g><rect x="11" y="13" width="50" height="38" rx="2" fill="${F('bdc')}" stroke="#7b5a63" stroke-width="1.1"/>
                <g fill="#c4935a" opacity=".45"><circle cx="15" cy="45" r=".8"/><circle cx="34" cy="16" r=".7"/><circle cx="56" cy="46" r=".8"/><circle cx="40" cy="47" r=".7"/><circle cx="14" cy="18" r=".7"/><circle cx="57" cy="16" r=".7"/></g>
                <g transform="rotate(-6 23 25)"><rect x="15" y="17" width="16" height="16" fill="#fff3a8" ${O2}/><path d="M18 23h10M18 26.4h10M18 29.8h6" stroke="#e5d178" stroke-width="1"/></g>
                <g transform="rotate(7 46 30)"><rect x="37" y="17" width="18" height="22" fill="#fff" ${O2}/><rect x="39.5" y="19.5" width="13" height="12" fill="#d6ecff"/>${heart(42, 22.2, .45, '#ffb7cc', '#ff7fa3', u + 'bdph')}</g>
                <rect x="19" y="36" width="15" height="11" fill="#ffd3e0" ${O2} transform="rotate(4 26 41)"/>
                ${dot(23, 18.4, 2, '#ffb7cc', '#ff7fa3', u + 'bp1')}${dot(46, 18, 2, '#d6ecff', '#7fbdf0', u + 'bp2')}${dot(26.4, 37, 1.8, '#c9f0dc', '#6fcfa0', u + 'bp3')}<defs>${lg('bdw', '#f8dcbc', '#e2b07c')}${lg('bdc', '#f0d3a6', '#dcae78')}</defs>`,
            'desk:lights': () => { const P = [.1, .3, .5, .7, .9].map(t => [3 + 66 * t, 10 + 76 * t * (1 - t)]), C = ['#ffd36e', '#ff9fbd', '#9fd0f5', '#a8e3cf', '#c7b3f2'];
                return `<path d="M3 10Q36 48 69 10" fill="none" stroke="#7b5a63" stroke-width="1.7"/><circle cx="3" cy="10" r="2" fill="#fff" ${O2}/><circle cx="69" cy="10" r="2" fill="#fff" ${O2}/>
                ${P.map(([x, y], i) => `<circle cx="${x}" cy="${y + 10}" r="9" fill="${C[i]}" opacity=".3"/><g ${S}><ellipse cx="${x}" cy="${y + 10}" rx="4.4" ry="5.8" fill="${C[i]}" ${O2}/></g><rect x="${x - 2.4}" y="${y - .6}" width="4.8" height="4.6" rx="1" fill="#eef1f6" ${O2}/><ellipse cx="${x - 1.4}" cy="${y + 8}" rx="1.3" ry="2" fill="#fff" opacity=".8"/>`).join('')}
                ${spark(20, 50, 1.1, '#ffd36e')}${spark(54, 51, .9, '#ff9fbd')}`; },
            'desk:peg': () => { const P = [[19.5, -7], [50.5, 7]], C = [['#d6ecff', '#a9d3f5'], ['#ffe3ec', '#ffc0d3']];
                return `<path d="M3 10Q36 36 69 10" fill="none" stroke="#c4935a" stroke-width="1.8"/><circle cx="3" cy="10" r="2" fill="#fff" ${O2}/><circle cx="69" cy="10" r="2" fill="#fff" ${O2}/>
                ${P.map(([x, r], i) => { const y = 10 + 52 * ((x - 3) / 66) * (1 - (x - 3) / 66); return `<g transform="rotate(${r} ${x} ${y})"><g ${S}><rect x="${x - 12}" y="${y + 2}" width="24" height="30" rx="1.5" fill="#fff" ${O}/></g><rect x="${x - 9.5}" y="${y + 4.5}" width="19" height="18" fill="url(#${u}pg${i})"/>
                    ${i ? star(x - 5, y + 7.6, .62, u + 'pgs') : heart(x - 5, y + 8.4, .62, '#ffb7cc', '#ff7fa3', u + 'pgh')}<path d="M${x - 9.5} ${y + 22.5}l6-6 4 4 3-3 6.5 5z" fill="#fff" opacity=".6"/>
                    <rect x="${x - 2.4}" y="${y - 5}" width="4.8" height="11" rx="1.3" fill="#f3d3a6" ${O2}/><path d="M${x} ${y - 4}v9" stroke="#c4935a" stroke-width=".9"/></g><defs>${lg('pg' + i, C[i][0], C[i][1])}</defs>`; }).join('')}`; },
            'desk:wallpaper': () => { const sh = 'M16 14H54V54Q46 50 35 56Q24 61 16 56Z';
                return `<clipPath id="${u}wpc"><path d="${sh}"/></clipPath><g ${S}><path d="${sh}" fill="#fff6f9"/></g>
                <g clip-path="url(#${u}wpc)">${[18, 28, 38, 48].map(x => `<rect x="${x}" y="10" width="4.6" height="54" fill="#ffd3e0"/>`).join('')}${[[24.6, 24], [34.6, 38], [44.6, 26], [24.6, 48], [44.6, 46]].map(([x, y], i) => i % 2 ? `<circle cx="${x}" cy="${y}" r="1.6" fill="#9fd0f5"/>` : `<path d="M${x - 2} ${y}c0-1.4 1.8-1.7 2-.3.2-1.4 2-1.1 2 .3 0 1.4-2 2.6-2 2.6s-2-1.2-2-2.6z" fill="#ff9fbd"/>`).join('')}</g>
                <path d="${sh}" fill="none" ${O}/><g ${S}><rect x="10" y="6" width="50" height="12" rx="6" fill="${F('wpr')}" ${O}/></g><ellipse cx="54" cy="12" rx="3.4" ry="6" fill="#ffe3ec" ${O2}/><ellipse cx="54" cy="12" rx="1.3" ry="2.4" fill="#fff" ${O2}/>
                <rect x="13" y="8" width="36" height="2.6" rx="1.3" fill="#fff" opacity=".6"/><defs>${lg('wpr', '#ffd6e2', '#ff9fbd')}</defs>`; },
            'desk:desktop': () => `${wire('M10 36V60M50 36V60M64 26V50', '#e2b07c', 2.6)}
                <g ${S}><path d="M6 30L20 20H68L54 30Z" fill="${F('dtp')}" ${O}/><path d="M6 30H54V36H6Z" fill="#e8b886" ${O}/><path d="M54 30L68 20V26L54 36Z" fill="#d39c64" ${O}/></g>
                <rect x="16" y="36" width="26" height="8" rx="1.5" fill="#f3cf9f" ${O2}/><circle cx="29" cy="40" r="1.7" fill="#ff9fbd" ${O2}/>
                <path d="M16 27H48M26 23.4H58" stroke="#dcab76" stroke-width="1" opacity=".7"/><path d="M21 28L26.4 24H38L32.6 28Z" fill="#ffb3c9" ${O2}/>
                <rect x="45" y="14" width="8" height="9" rx="2" fill="#a8e3cf" ${O2}/><path d="M53 16.4h1.6a2 2 0 0 1 0 4H53" fill="none" ${O2}/><path d="M47 11q1-2 0-4M50.4 11q1-2 0-4" stroke="#d6cbe0" stroke-width="1.1" fill="none" stroke-linecap="round"/>
                <defs>${lg('dtp', '#f9e3c4', '#ecc391')}</defs>`,
        };
        return A[k] ? `<svg viewBox="0 0 72 64" aria-hidden="true"><defs>${sh}${glDef}</defs>${A[k]()}</svg>` : '';
    }
    /* 🎀 상품 창 테두리 (도련 10-28 시안) : 하얀 물결 레이스 + 파스텔 별 줄 · 그림 파일 없이 SVG 로 · 창 크기가 바뀌면 다시 그려요 */
    function shkFrame() {
        const w = document.querySelector('#shelfKindModal > .modal-content'), f = w && w.querySelector('.shk-frame'); if (!f) return;
        const W = Math.round(w.offsetWidth), H = Math.round(w.offsetHeight); if (W < 60 || H < 60 || f.dataset.wh === W + 'x' + H) return; f.dataset.wh = W + 'x' + H;
        const ring = (ins, rad, step) => {                                     // 둥근 네모 둘레에 고르게 놓은 점
            const x0 = ins, y0 = ins, w2 = W - 2 * ins, h2 = H - 2 * ins, sw = w2 - 2 * rad, sh = h2 - 2 * rad, q = Math.PI * rad / 2;
            const sides = [sw, q, sh, q, sw, q, sh, q], L = 2 * sw + 2 * sh + 4 * q, n = Math.max(8, Math.round(L / step)), pts = [];
            const C = [[x0 + w2 - rad, y0 + rad], [x0 + w2 - rad, y0 + h2 - rad], [x0 + rad, y0 + h2 - rad], [x0 + rad, y0 + rad]];
            for (let i = 0; i < n; i++) {
                let d = i * L / n, k = 0; while (k < 7 && d > sides[k]) { d -= sides[k]; k++; }
                if (k === 0) pts.push([x0 + rad + d, y0]); else if (k === 2) pts.push([x0 + w2, y0 + rad + d]);
                else if (k === 4) pts.push([x0 + w2 - rad - d, y0 + h2]); else if (k === 6) pts.push([x0, y0 + h2 - rad - d]);
                else { const j = (k - 1) / 2, a = -Math.PI / 2 + j * Math.PI / 2 + d / rad, [cx, cy] = C[j]; pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]); }
            }
            return pts;
        };
        const star = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); } return d + 'Z'; };
        const COL = ['#f6b3c7', '#b7d3f3', '#c9bcec'];                          // 분홍 · 하늘 · 연보라
        const lace = ring(14, 30, 25).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14"/>`).join('');
        const stars = ring(27, 22, 40).map(([x, y], i) => `<path d="${star(x, y, 6.5)}" fill="${COL[i % 3]}" stroke="${COL[i % 3]}"/>`).join('');
        f.setAttribute('viewBox', `0 0 ${W} ${H}`);
        f.innerHTML = `<g fill="#fff">${lace}<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="30"/></g><g stroke-width="1.2" stroke-linejoin="round">${stars}</g>`;
    }
    (function shkFrameWatch() {
        const go = () => { const w = document.querySelector('#shelfKindModal > .modal-content'); if (!w || w.dataset.fr) return; w.dataset.fr = 1; new ResizeObserver(() => shkFrame()).observe(w); };
        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
    })();
    /* 👆 상품 창 바깥을 누르면 닫혀요 (도련 10-28 · ✕ 없음) = 예전 '‹ 기본상품 샵' 과 같아요 : 🏪 가게 안이면 가게 그대로 · ▤ 하단 메뉴 · 📱 폰은 기본상품 샵 창으로
       · 다른 창(🗄️ 문구함 · 확인 창 · 꺼내 둔 스티커창) · 가게 진열대 이름표를 누른 것은 닫지 않아요 */
    (function shkOutside() {
        let down = null;
        document.addEventListener('pointerdown', e => {
            const m = document.getElementById('shelfKindModal');
            down = m && m.style.display === 'flex' && !e.target.closest('.modal-content, .alert-card, #customAlertModal, #dskLayer, .shop-spot, .shop-x') ? [e.clientX, e.clientY] : null;
        }, true);
        document.addEventListener('pointerup', e => {
            if (!down) return; const [x, y] = down; down = null;
            if (Math.hypot(e.clientX - x, e.clientY - y) > 10) return;          // 끌기는 아니에요
            const m = document.getElementById('shelfKindModal'); if (!m || m.style.display !== 'flex') return;
            e.preventDefault(); shBack();
            const eat = ev => { ev.stopPropagation(); ev.preventDefault(); }; addEventListener('click', eat, { capture: true, once: true }); setTimeout(() => removeEventListener('click', eat, true), 400);   // 닫는 톡이 밑의 것까지 누르지 않게
        }, true);
    })();
    /* 📦 기본상품 샵 옮기기 (도련 10-25 · 🗄️ 문구함 gdCabMovable 과 같게) : 아무 데나 잡고 8px 넘게 끌면 옮겨져요 · 짧게 톡은 그대로 · 끈 뒤 톡은 무시 · ✕ 는 끌기 아님 */
    (function objMovable() {
        const go = () => ['shelfCornerModal', 'shelfKindModal'].forEach(id => {
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

    function stkArtFill() {                                                   // 기본상품 샵의 물건 자리에 그림을 넣어요 (한 번)
        document.querySelectorAll('.st2-slot').forEach(b => { const k = (b.className.match(/\bg-(\w+)/) || [])[1], g = b.querySelector('.st2-goods'); if (k && g && !g.dataset.art) { g.innerHTML = stkArt(k); g.dataset.art = 1; g.classList.add('art'); } });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', stkArtFill); else stkArtFill();
    window.stkArt = stkArt;

    /* 🍽 오늘 쓸 스티커 (js/stktray.js · 도련 11-01) 가 바구니 카드 · 목록 · 종이 열기를 그대로 써요 (새로 만들지 않아요) */
    const bkFree = got => {                                                   // 바구니에 있는 종이 (스티커첩에 꽂은 것 · 페이지에 꺼내 둔 것 빼고)
        const a = (got && got.album) || { bd: [], rl: [] }, placed = new Set();
        (a.bd || []).forEach(b => Object.values(b.p || {}).forEach(id => placed.add(id)));
        (a.rl || []).forEach(r => (r.it || []).forEach(t => placed.add(t.s)));
        const H = bkHold();
        return ((got && got.list) || []).filter(e => !placed.has(e.id) && !DS.m.has(e.id) && !(H && H.s.has(e.id)));   // 🛍️ 봉투 속은 빼요
    };
    window.bkTrayApi = {
        kinds: BK_KINDS, kindOf: bkKindOf, card: bkCard, open: bkOpenSheet,
        ok: () => !!(window.ownList && window.ownMode && ownMode()),
        peek: () => { const p = window.ownPeek ? ownPeek() : null; return p ? bkFree(p) : null; },
        load: async force => bkFree(window.ownOpen ? await ownOpen(force) : { list: await ownList(force), album: { bd: [], rl: [] } })
    };
    window.openBasket = openBasket; window.bkOpenKind = bkOpenKind; window.bkReopen = bkReopen; window.bkRender = bkRender; window.bkOpenSheet = bkOpenSheet;
    window.openShelf = openShelf; window.shOpenKind = shOpenKind; window.shCorner = shCorner; window.shBack = shBack; window.shCatList = shCatList; window.shZoom = shZoom; window.shZoomOff = shZoomOff; window.shGoSee = shGoSee; window.shPage = shPage; window.shTake = shTake;
})();
