/* 말랑달콤 다이어리 - js/stktray.js
   🍽 오늘 쓸 스티커 (도련 11-01 · 💻 📲 책상만 · 📱 폰은 없어요)
   - 다꾸하기 전에 쓸 스티커를 골라 은빛 쟁반에 담아 두고, 다이어리를 펴서 쟁반에서 바로 꺼내 써요
   - 🔽 오른쪽 위 메뉴 '오늘 쓸 스티커' → 고르는 화면
       왼쪽 위 = 스티커 종류 · 그 아래 = 가진 그 종류 스티커 (🧺 바구니에 있는 것) → 오른쪽 쟁반으로 끌어 놓거나 톡 · 쟁반의 것을 톡 = 다시 빼기
       [🍽 스티커 담기] = 담기 끝 → 책상 위쪽 가운데에 '🍽 오늘 쓸 스티커 n' 버튼 (톡 = 쟁반 나왔다 · 들어갔다)
   - 쟁반의 스티커를 톡 = 바구니에서 누를 때와 똑같이 그 종이가 펼쳐져요 (js/basket.js bkOpenSheet) · 다 쓴 종이는 쟁반에서 저절로 빠져요
   - 담은 목록은 이 창이 열려 있는 동안만 (메모리 · 저장하지 않아요) : 앱을 닫으면 다꾸가 끝난 걸로 알고 비워요 · 스티커는 원래 바구니에 그대로
     쟁반은 스티커를 옮기지 않고 '바구니의 이 종이'를 가리키기만 해요 (복사 · 이동 없음 → 늘어나거나 안 줄어드는 일 없음)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (메뉴의 오늘 쓸 스티커만 반응 없음) */
(function () {
    const q = id => document.getElementById(id);
    const T = { ids: [], draft: [], kind: 'seal', list: [], noted: false, open: false, pos: null };
    const API = () => window.bkTrayApi;
    const NOTE = '🧺 여기 담은 스티커는 <b>지금 다꾸할 때 쓸 스티커</b>예요.<br>앱을 닫으면 <b>쟁반은 비워져요.</b><br>사용 안 된 스티커는 <b>원래 바구니로 돌아가니</b> 걱정하지 마세요!';
    const byId = () => new Map(T.list.map(e => [e.id, e]));

    /* ---------- 고르는 화면 ---------- */
    function stpBuild() {
        let el = q('stkPick'); if (el) return el;
        el = document.createElement('div'); el.id = 'stkPick'; el.className = 'stp';
        el.innerHTML = `<div class="stp-bar"><b>🍽 오늘 쓸 스티커 고르기</b><button type="button" class="desk-shop-go" onclick="stpClose()">닫기</button></div>
            <div class="stp-body">
                <section class="stp-l"><div class="stp-kinds" id="stpKinds"></div><div class="stp-grid" id="stpGrid"></div></section>
                <section class="stp-r"><div class="stp-tray" id="stpTray"><div class="stp-tin" id="stpTin"></div></div>
                    <p class="stp-note">${NOTE}</p>
                    <button type="button" class="stp-go" onclick="stpSave()">🍽 스티커 담기</button></section>
            </div>`;
        document.body.appendChild(el);
        el.addEventListener('pointerdown', stpDown);
        return el;
    }
    async function stpOpen() {
        const A = API(); if (!A) return;
        if (!A.ok()) { showMsg('🔐 구글 계정으로 로그인하거나<br>📁 폴더에 저장할 때 스티커를 고를 수 있어요.'); return; }
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
        q('stpTin').innerHTML = T.draft.length ? T.draft.map(id => `<div class="stp-c in" data-id="${htmlEsc(id)}">${A.card(M.get(id))}</div>`).join('')
            : '<p class="stp-hint">왼쪽 스티커를 이 쟁반으로<br>끌어 놓거나 톡 눌러 담아요</p>';
    }
    function stpKind(k) { T.kind = k; stpPaint(); }
    function stpMove(id, toTray) {
        if (toTray) { if (!T.draft.includes(id)) T.draft.push(id); } else T.draft = T.draft.filter(x => x !== id);
        stpPaint();
    }
    /* 끌어 놓기 (조금만 움직이면 톡 = 담기 · 빼기) */
    function stpDown(ev) {
        const c = ev.target.closest('.stp-c'); if (!c || ev.button > 0) return;
        ev.preventDefault();
        const id = c.dataset.id, inTray = c.classList.contains('in'), x0 = ev.clientX, y0 = ev.clientY;
        let gh = null;
        const mv = e => {
            if (e.pointerId !== ev.pointerId) return;
            if (!gh && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) { gh = c.cloneNode(true); gh.className = 'stp-c stp-ghost'; gh.style.width = c.offsetWidth + 'px'; document.body.appendChild(gh); c.classList.add('stp-out'); }
            if (gh) { gh.style.left = e.clientX + 'px'; gh.style.top = e.clientY + 'px'; q('stpTray').classList.toggle('hot', !inTray && stpOverTray(e)); }
        };
        const up = e => {
            if (e.pointerId !== ev.pointerId) return;
            removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
            q('stpTray').classList.remove('hot'); c.classList.remove('stp-out');
            if (!gh) { if (e.type !== 'pointercancel') stpMove(id, !inTray); return; }
            gh.remove();
            const over = stpOverTray(e);
            if (!inTray && over) stpMove(id, true); else if (inTray && !over) stpMove(id, false);
        };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    }
    const stpOverTray = e => { const r = q('stpTray').getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
    function stpSave() {
        T.ids = T.draft.slice(); stpHide();
        if (T.ids.length && !T.noted) { T.noted = true; showMsg(NOTE); }        // 처음 담을 때 한 번 더 크게
        dtrPaint(); if (T.ids.length) dtrShow(true);
    }
    function stpHide() { const el = q('stkPick'); if (el) el.classList.remove('show'); }
    function stpClose() {
        const same = T.draft.length === T.ids.length && T.draft.every(id => T.ids.includes(id));
        if (same) { stpHide(); return; }
        showAsk('고른 스티커를 쟁반에 담지 않고 닫을까요?', '담지 않고 닫기', '계속 고르기').then(ok => { if (ok) stpHide(); });
    }

    /* ---------- 책상 위 : 🍽 버튼 · 은빛 쟁반 ---------- */
    function dtrBuild() {
        let b = q('dtrBtn'); if (b) return b;
        b = document.createElement('button'); b.type = 'button'; b.id = 'dtrBtn'; b.className = 'desk-shop-go dtr-btn'; b.hidden = true; b.onclick = () => dtrShow(!T.open);
        document.body.appendChild(b);
        const p = document.createElement('div'); p.id = 'dtrPanel'; p.className = 'dtr-pn'; p.hidden = true;
        p.innerHTML = `<div class="dtr-hd" id="dtrHd"><b>🍽 오늘 쓸 스티커</b><small>잡고 끌어 옮겨요</small></div><div class="dtr-tray"><div class="dtr-in" id="dtrIn"></div></div>
            <div class="dtr-ft"><button type="button" class="dtr-mini" onclick="stpOpen()">＋ 더 고르기</button><button type="button" class="dtr-mini" onclick="dtrEnd()">다꾸 끝 · 비우기</button></div>`;
        document.body.appendChild(p);
        p.querySelector('#dtrIn').addEventListener('click', e => { const c = e.target.closest('.stp-c'); if (c && API()) API().open(c.dataset.id); });
        dtrDrag(p);
        return b;
    }
    function dtrPaint() {
        const b = dtrBuild(), A = API(); if (!A) return;
        const p = A.peek(); if (p) { T.list = p; const M = byId(); T.ids = T.ids.filter(id => M.has(id)); }   // 다 쓴 종이는 저절로 빠져요
        b.hidden = !T.ids.length; b.textContent = `🍽 오늘 쓸 스티커 ${T.ids.length}`;
        if (!T.ids.length) dtrShow(false);
        const M = byId(), box = q('dtrIn');
        if (box) box.innerHTML = T.ids.map(id => M.get(id)).filter(Boolean).map(e => `<div class="stp-c in" data-id="${htmlEsc(e.id)}">${A.card(e)}</div>`).join('');
    }
    function dtrShow(on) {
        T.open = !!on && T.ids.length > 0;
        const p = q('dtrPanel'), b = q('dtrBtn'); if (!p) return;
        p.hidden = !T.open; if (b) b.classList.toggle('on', T.open);
        if (T.open && T.pos) Object.assign(p.style, { left: T.pos[0] + 'px', top: T.pos[1] + 'px' });
    }
    function dtrEnd() {
        showAsk('🍽 다꾸를 마쳤나요?<br><span style="font-size:12px;color:#777;">쟁반을 비워요 · 스티커는 원래 바구니에 그대로 있어요</span>', '비우기', '취소')
            .then(ok => { if (ok) { T.ids = []; T.draft = []; dtrPaint(); } });
    }
    function dtrDrag(p) {                                                     // 쟁반 머리를 잡고 끌어 옮겨요 (자리는 앱을 닫기 전까지만)
        const hd = p.querySelector('#dtrHd');
        hd.addEventListener('pointerdown', ev => {
            if (ev.button > 0) return; ev.preventDefault();
            const r = p.getBoundingClientRect(), dx = ev.clientX - r.left, dy = ev.clientY - r.top;
            const mv = e => { const x = Math.max(0, Math.min(innerWidth - r.width, e.clientX - dx)), y = Math.max(0, Math.min(innerHeight - 60, e.clientY - dy)); p.style.left = x + 'px'; p.style.top = y + 'px'; T.pos = [x, y]; };
            const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        });
    }
    if (window.ownOnChange) ownOnChange(() => { if (T.ids.length) dtrPaint(); if (q('stkPick') && q('stkPick').classList.contains('show') && API()) { const p = API().peek(); if (p) { T.list = p; stpPaint(); } } });
    window.stpOpen = stpOpen; window.stpClose = stpClose; window.stpSave = stpSave; window.stpKind = stpKind; window.dtrEnd = dtrEnd;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['stktray'] = true;
