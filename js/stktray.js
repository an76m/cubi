/* 말랑달콤 다이어리 - js/stktray.js
   🍽 오늘 쓸 스티커 (도련 11-01 · 📱 폰만 · 11-13 : 💻 📲 책상은 📔 다이어리모드로 충분해서 책상 쪽 코드는 영구 삭제)
   - 다꾸하기 전에 쓸 스티커를 골라 은빛 쟁반에 담아 두고, 다이어리를 펴서 쟁반에서 바로 꺼내 써요
   - 🧺 스티커 창의 [🍽 오늘 쓸 스티커] → 고르는 화면 : 위 = 스티커 종류 · 가진 그 종류 스티커 → 톡 = 아래 쟁반에 담기 · 쟁반의 것 톡 = 다시 빼기
       [🍽 스티커 담기] = 담기 끝 → 아래 메뉴 줄 끝에 '🍽 쟁반' 버튼 (톡 = 쟁반 나왔다 · 들어갔다)
   - 쟁반의 스티커를 톡 = 바구니에서 누를 때와 똑같이 그 종이가 펼쳐져요 (js/basket.js bkOpenSheet) · 다 쓴 종이는 쟁반에서 저절로 빠져요
   - 담은 목록은 이 창이 열려 있는 동안만 (메모리 · 저장하지 않아요) : 앱을 닫으면 다꾸가 끝난 걸로 알고 비워요 · 스티커는 원래 바구니에 그대로
     쟁반은 스티커를 옮기지 않고 '서랍의 이 종이'를 가리키기만 해요 (복사 · 이동 없음 → 늘어나거나 안 줄어드는 일 없음)
   - 📱 폰 = 위 목록 · 아래 가로 쟁반 · 안내 한 줄 · 다꾸할 때 쟁반 = 아래 메뉴 위에 얇은 줄
   ※ 이 파일이 없어도 다이어리는 정상 동작 (메뉴의 오늘 쓸 스티커만 반응 없음) */
(function () {
    const q = id => document.getElementById(id);
    const T = { ids: [], draft: [], kind: 'seal', list: [], open: false };
    const API = () => window.bkTrayApi;
    const NOTE = '🧺 다꾸하는 동안만 담아 둬요 · 스티커는 서랍에 그대로';   // 📱 한 줄 (도련 11-12)
    const on = () => !UI.desk();                                              // 💻 📲 책상에서는 없어요 (도련 11-13)
    const byId = () => new Map(T.list.map(e => [e.id, e]));

    /* ---------- 고르는 화면 ---------- */
    function stpBuild() {
        let el = q('stkPick'); if (el) return el;
        el = document.createElement('div'); el.id = 'stkPick'; el.className = 'stp';
        el.innerHTML = `<div class="stp-bar"><b>🍽 오늘 쓸 스티커 고르기</b><button type="button" class="desk-shop-go" onclick="stpClose()">닫기</button></div>
            <div class="stp-body">
                <section class="stp-l"><div class="stp-kinds" id="stpKinds"></div><div class="stp-grid" id="stpGrid"></div></section>
                <section class="stp-r"><p class="stp-note" id="stpNote">${NOTE}</p>   <!-- 안내 = 쟁반 위 (도련 11-05) -->
                    <div class="stp-tray" id="stpTray"><b class="stp-cnt" id="stpCnt"></b><div class="stp-tin" id="stpTin"></div></div>
                    <button type="button" class="stp-go" onclick="stpSave()">🍽 스티커 담기</button></section>
            </div>`;
        document.body.appendChild(el);
        el.addEventListener('click', e => { const c = e.target.closest('.stp-c'); if (c) stpMove(c.dataset.id, !c.classList.contains('in')); });   // 📱 톡 = 담기 · 쟁반의 것 톡 = 빼기 (넘겨 보기는 그대로)
        return el;
    }
    async function stpOpen() {
        const A = API(); if (!A || !on()) return;
        if (!A.ok()) { showMsg('🔐 구글 계정으로 로그인하거나<br>🏠 로그인 없이 다꾸할 때 스티커를 고를 수 있어요.'); return; }
        const el = stpBuild(); T.draft = T.ids.slice(); el.classList.add('show');
        const p = A.peek(); if (p) { T.list = p; stpPaint(); } else q('stpGrid').innerHTML = '<p class="stp-empty">스티커를 꺼내는 중…</p>';
        try { T.list = await A.load(true); } catch (e) { if (!p) { q('stpGrid').innerHTML = '<p class="stp-empty">⚠ 스티커를 불러오지 못했어요.<br>인터넷 연결을 확인해 주세요.</p>'; return; } }
        stpPaint();
    }
    function stpPaint() {
        const A = API(), M = byId(); if (!A || !q('stkPick')) return;
        T.draft = T.draft.filter(id => M.has(id));
        q('stpKinds').innerHTML = Object.keys(A.kinds).map(k => { const n = T.list.filter(e => A.kindOf(e) === k && !T.draft.includes(e.id)).length;
            return `<button type="button" class="stp-k${k === T.kind ? ' on' : ''}" onclick="stpKind('${k}')">${A.kinds[k]}<small>${n}</small></button>`; }).join('');
        const L = T.list.filter(e => A.kindOf(e) === T.kind && !T.draft.includes(e.id)).sort((a, b) => b.at - a.at);
        q('stpGrid').innerHTML = L.length ? L.map(e => `<div class="stp-c" data-id="${htmlEsc(e.id)}">${A.card(e)}</div>`).join('')
            : `<p class="stp-empty">${T.list.some(e => A.kindOf(e) === T.kind) ? '이 종류는 다 쟁반에 담았어요 🍽' : '아직 이 종류 스티커가 없어요.<br>🏪 기본상품 샵에서 받아 오거나 ✂️ 직접 만들어요.'}</p>`;
        const cn = q('stpCnt'); if (cn) cn.textContent = T.draft.length ? T.draft.length + '개 담았어요 · 톡 = 빼기' : '';
        q('stpTin').innerHTML = T.draft.length ? T.draft.map(id => `<div class="stp-c in" data-id="${htmlEsc(id)}">${A.card(M.get(id))}</div>`).join('')
            : '<p class="stp-hint">위 스티커를 톡 하면 여기 담겨요</p>';
    }
    function stpKind(k) { T.kind = k; stpPaint(); }
    function stpMove(id, toTray) {
        if (toTray) { if (!T.draft.includes(id)) T.draft.push(id); } else T.draft = T.draft.filter(x => x !== id);
        stpPaint();
    }
    function stpSave() {
        T.ids = T.draft.slice(); stpHide();
        dtrPaint(); if (T.ids.length) dtrShow(true);
    }
    function stpHide() { const el = q('stkPick'); if (el) el.classList.remove('show'); }
    function stpClose() {
        const same = T.draft.length === T.ids.length && T.draft.every(id => T.ids.includes(id));
        if (same) { stpHide(); return; }
        showAsk('고른 스티커를 쟁반에 담지 않고 닫을까요?', '담지 않고 닫기', '계속 고르기').then(ok => { if (ok) stpHide(); });
    }

    /* ---------- 📱 아래 메뉴 줄 : 🍽 버튼 · 은빛 쟁반 ---------- */
    function dtrBuild() {
        let b = q('dtrBtn'); if (b) return b;
        b = document.createElement('button'); b.type = 'button'; b.id = 'dtrBtn'; b.className = 'desk-shop-go dtr-btn'; b.hidden = true; b.onclick = () => dtrShow(!T.open);
        document.body.appendChild(b);
        const p = document.createElement('div'); p.id = 'dtrPanel'; p.className = 'dtr-pn'; p.hidden = true;
        p.innerHTML = `<div class="dtr-hd" id="dtrHd"><i class="dtr-grip" aria-hidden="true"></i><b>🍽 오늘 쓸 스티커</b><small>잡고 끌어 옮겨요</small><button type="button" class="dtr-x" onclick="dtrShow(false)" aria-label="닫기">✕</button></div><div class="dtr-tray"><div class="dtr-in" id="dtrIn"></div></div>
            <div class="dtr-ft"><button type="button" class="dtr-mini" onclick="stpOpen()">＋ 더 고르기</button><button type="button" class="dtr-mini" onclick="dtrEnd()">다꾸 끝 · 비우기</button></div>`;
        document.body.appendChild(p);
        p.querySelector('#dtrIn').addEventListener('click', e => { const c = e.target.closest('.stp-c'); if (c && API()) API().open(c.dataset.id); });
        dtrDrag(p);
        return b;
    }
    function dtrHome() {                                                     // 🍽 버튼 자리 = 아래 메뉴 줄 끝 (다이어리 날짜 막대를 가리지 않게 · 도련 11-11) · 💻 📲 책상 = 없어요
        const b = q('dtrBtn'); if (!b) return;
        if (!on()) { T.ids = []; T.draft = []; b.hidden = true; dtrShow(false); return; }
        const home = document.querySelector('.toolbar') || document.body;
        if (b.parentNode !== home) home.appendChild(b);
    }
    function dtrPaint() {
        const b = dtrBuild(), A = API(); if (!A) return;
        dtrHome(); if (!on()) return;
        const p = A.peek(); if (p) { T.list = p; const M = byId(); T.ids = T.ids.filter(id => M.has(id)); }   // 다 쓴 종이는 저절로 빠져요
        b.hidden = !T.ids.length; if (!b.firstChild) b.innerHTML = '<span class="dtr-lb">오늘 쓸 스티커</span><span class="dtr-lbs">🍽 쟁반</span><i class="dtr-sw" aria-hidden="true"></i>';   // 📱 = 짧은 이름 (css)   // 켜고 끄는 스위치 (개수 대신 · 도련 11-01)
        if (!T.ids.length) dtrShow(false);
        const M = byId(), box = q('dtrIn');
        if (box) box.innerHTML = T.ids.map(id => M.get(id)).filter(Boolean).map(e => `<div class="stp-c in" data-id="${htmlEsc(e.id)}">${A.card(e)}</div>`).join('');
    }
    function dtrShow(on) {
        T.open = !!on && T.ids.length > 0;
        const p = q('dtrPanel'), b = q('dtrBtn'); if (!p) return;
        p.hidden = !T.open; if (b) { b.classList.toggle('on', T.open); b.setAttribute('aria-pressed', String(T.open)); }
        if (T.open) {                                                         // 📱 = 처음엔 아래 메뉴 줄 바로 위 · 머리를 잡고 위아래로 옮긴 자리는 기억 (앱을 닫기 전까지)
            if (T.posY != null) { p.style.top = Math.min(T.posY, innerHeight - p.offsetHeight) + 'px'; p.style.bottom = 'auto'; }
            else { const tb = document.querySelector('.toolbar'), y = tb && tb.getBoundingClientRect().top; p.style.top = 'auto'; p.style.bottom = ((y > 0 ? innerHeight - y : 0) + 6) + 'px'; } }
    }
    function dtrEnd() {
        showAsk('🍽 다꾸를 마쳤나요?<br><span style="font-size:12px;color:#777;">쟁반을 비워요 · 스티커는 원래 서랍에 그대로 있어요</span>', '비우기', '취소')
            .then(ok => { if (ok) { T.ids = []; T.draft = []; dtrPaint(); } });
    }
    function dtrDrag(p) {                                                     // 쟁반 머리를 잡고 위아래로 옮겨요 (화면 너비 그대로 · 자리는 앱을 닫기 전까지만)
        const hd = p.querySelector('#dtrHd');
        hd.addEventListener('pointerdown', ev => {
            if (ev.button > 0 || ev.target.closest('.dtr-x')) return; ev.preventDefault();
            const r = p.getBoundingClientRect(), dy = ev.clientY - r.top;
            const mv = e => { const y = Math.max(0, Math.min(innerHeight - r.height, e.clientY - dy)); p.style.top = y + 'px'; p.style.bottom = 'auto'; T.posY = y; };
            const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        });
    }
    if (window.ownOnChange) ownOnChange(() => { if (T.ids.length) dtrPaint(); if (q('stkPick') && q('stkPick').classList.contains('show') && API()) { const p = API().peek(); if (p) { T.list = p; stpPaint(); } } });
    window.dtrHome = dtrHome; window.stpOpen = stpOpen; window.stpClose = stpClose; window.stpSave = stpSave; window.stpKind = stpKind; window.dtrEnd = dtrEnd; window.dtrShow = dtrShow;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['stktray'] = true;
