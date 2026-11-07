/* 말랑달콤 다이어리 - js/binderroom.js
   🧩 바인더 조립 공간 (도련 11-07 · 981 · 💻 📲 책상 오른쪽 위 메뉴 '바인더 조립')
   - 왼쪽 🧺 재료 바구니 = 가진 표지 · 내지 (🧩 바인더표지 · 바인더내지 / _목록.json · js/dyown.js) · ＋ 새 표지 · 새 내지 (내가 만들기 · js/dymaker.js)
   - 가운데 작업대 = 펼친 바인더 : 표지를 놓고 · 내지를 링에 끼워요 (톡 또는 끌어다 놓기) · 끼운 내지를 바구니로 끌거나 ✕ = 빼기
   - 📅 날짜 표지(해가 적힌) = 같은 크기 날짜 내지 하나 · 끼운 표지의 해로 날짜가 그려져요 · 해가 지난 표지는 못 해요
   - 🧩 조립하기 = 다이어리 목록에 한 권 · 쓴 재료는 바구니에서 빠져요 → 바인더는 책상 위에 (끌어서 옮겨요)
   - ✏️ 내 바인더 고치기 = 이미 조립한 페이지바인더 (내지 더 끼우기 · 빼기 · 표지 바꾸기 · 뺀 것은 바구니로)
   - 조립 규칙 · 저장은 js/dymaker.js (dmkRmInit · dmkRmPick · dmkRmAdd · dmkRmOut · dmkRoomSave) 와 같아요 · 여기는 그 모습만 */
(function () {
    const B = { on: false, drag: null };
    const bq = id => document.getElementById(id);
    const esc = v => (window.htmlEsc ? htmlEsc(v) : String(v == null ? '' : v));
    const st = () => window.dmkRmState ? dmkRmState() : null;
    function build() {
        let el = bq('bndRoom'); if (el) return el;
        el = document.createElement('div'); el.id = 'bndRoom'; el.className = 'bnd-room';
        el.innerHTML = `<div class="bnd-wall"><div class="bnd-sign">🧩 바인더 조립<small>표지에 내지를 끼워 나만의 바인더를 만들어요</small></div>
                <div class="bnd-garland" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
                <button type="button" class="bnd-go desk-shop-go" id="bndGo">닫기</button></div>
            <div class="bnd-mat">
                <div class="bnd-panel bnd-basket" id="bndBasket"><h3>🧺 재료 바구니 <small>톡 · 끌어서 작업대로</small></h3>
                    <div class="bnd-sec"><b>🗂️ 표지</b><div class="bnd-grid" id="bndCovers"></div></div>
                    <div class="bnd-sec"><b>📄 내지</b><div class="bnd-grid" id="bndRefills"></div></div></div>
                <div class="bnd-panel bnd-work"><h3><span id="bndWorkT">작업대</span><span class="bnd-mine" id="bndMine"></span></h3>
                    <div class="bnd-bench" id="bndBench"></div>
                    <div class="bnd-bar"><label>이름 <input id="bndName" maxlength="20" autocomplete="off" placeholder="내 바인더"></label>
                        <span class="bnd-info" id="bndInfo"></span>
                        <button type="button" class="btn" id="bndNew">새로</button>
                        <button type="button" class="btn bnd-ok" id="bndOk">🧩 조립하기</button></div></div></div>`;
        document.body.appendChild(el);
        bq('bndGo').onclick = bndClose;
        bq('bndNew').onclick = () => { window.dmkRmInit(''); render(); };
        bq('bndOk').onclick = save;
        bq('bndName').oninput = e => { const s = st(); if (s) s.g = e.target.value; };
        el.addEventListener('pointerdown', down);
        return el;
    }
    async function bndOpen() {
        if (!window.dmkRmInit) return;
        if (window.deskLeave) deskLeave();
        const el = build(); B.on = true;
        if (!st()) dmkRmInit('');
        el.classList.add('show'); document.body.classList.add('cal-on', 'bnd-on');
        render();
        try { if (window.dymReady) await dymReady(); } catch (e) { console.warn('🧩 재료', e); }
        if (B.on) render();
    }
    function bndClose() {
        const el = bq('bndRoom'); if (!el || !B.on) return;
        B.on = false; el.classList.remove('show'); document.body.classList.remove('cal-on', 'bnd-on');
    }
    const C = v => window.dmkClean ? dmkClean(v) : v;
    function cvCard(c, extra) {
        const yr = new Date().getFullYear(), old = c.t === 'dcover' && c.y < yr;
        return `<div class="bnd-card bnd-cv${old ? ' old' : ''}" data-cv="${esc(c.id)}" title="${old ? '해가 지난 표지예요' : ''}">${dmkCvThumb(c.c, c.r, 64)}<span>${esc(c.g)}</span><small>${c.t === 'dcover' ? '📅 ' + c.y + ' · ' + c.n : c.n}</small>${extra || ''}</div>`;
    }
    function rfCard(r, R) {
        return `<div class="bnd-card bnd-rf" data-rf="${esc(r.id)}">${r.t === 'drefill' ? dmkRfThumb([[1, 1, r.lf || 'line']], R || 1.41, 64) : dmkRfThumb(r.lv, r.r, 64)}<span>${esc(r.g)}</span><small>${r.t === 'drefill' ? '📅 날짜 · ' + r.n : r.n + ' · ' + r.pg + 'p'}</small>${r.t === 'refill' && r.from === 'mine' && window.dymGet && dymGet(r.id) ? `<i class="bnd-ed" data-ed="refill:${esc(r.id)}" title="고치기">✏️</i>` : ''}</div>`;
    }
    function render() {
        if (!B.on) return;
        const s = st(); if (!s) return;
        const date = dmkRmDate(), n = dmkRmN(), lock = dmkRmLock(), cv = s.cv ? C(s.cv) : null;
        /* 🧺 바구니 */
        const covers = dmkRmPool('cover').filter(c => !(s.id && c.t === 'dcover'));
        bq('bndCovers').innerHTML = `<div class="bnd-card bnd-new" data-new="cover"><b>＋</b><span>새 표지</span></div>` + covers.map(c => cvCard(c, c.t === 'cover' && c.from === 'mine' && window.dymGet && dymGet(c.id) ? `<i class="bnd-ed" data-ed="cover:${esc(c.id)}" title="고치기">✏️</i>` : '')).join('')
            + (covers.some(c => c.t === 'dcover') ? '' : `<div class="bnd-hint">📅 날짜 표지는 🏪 기본상품 샵 → 📔 다이어리에서 받아요</div>`);
        const refills = dmkRmPool('refill');
        const fit = r => cv && (date ? r.t === 'drefill' : r.t === 'refill') && r.n === n;
        bq('bndRefills').innerHTML = `<div class="bnd-card bnd-new" data-new="refill"><b>＋</b><span>새 내지</span></div>` + refills.sort((a, b) => fit(b) - fit(a)).map(r => rfCard(r, cv && cv.r).replace('class="bnd-card bnd-rf"', `class="bnd-card bnd-rf${cv && !fit(r) ? ' off' : ''}"`)).join('')
            + (refills.length ? '' : `<div class="bnd-hint">📄 내지는 ＋ 새 내지로 만들거나 🏪 샵 → 📄 바인더 내지에서 받아요</div>`);
        /* 작업대 */
        bq('bndWorkT').textContent = s.id ? '✏️ ' + (s.g || '내 바인더') + ' 고치기' : '작업대';
        const mine = (window.dmkAll ? dmkAll() : []).filter(d => d.t === 'binder');
        bq('bndMine').innerHTML = mine.length ? `<select id="bndMineSel" title="내 바인더 고치기"><option value="">✏️ 내 바인더 고치기</option>${mine.map(d => `<option value="${esc(d.id)}"${d.id === s.id ? ' selected' : ''}>${esc(d.g)}</option>`).join('')}</select>` : '';
        const sel = bq('bndMineSel'); if (sel) sel.onchange = () => { dmkRmInit(sel.value); render(); };
        let at = 0;
        const filled = dmkRmFilled();
        const sheets = s.rf.map((x0, i) => {
            const x = C(x0) || x0;
            if (x.t === 'drefill') return `<div class="bnd-sheet" data-out="${i}" style="--i:${i}"><b>📅 ${esc(x.g)}</b><small>${cv ? cv.y + '년 날짜로' : ''} · ${window.dmkLeafName ? dmkLeafName(x.lf || 'line') : ''}</small><button type="button" class="bnd-x" data-x="${i}" title="빼기">✕</button></div>`;
            const a = at + 1; at += x.pg; const keep = a - 1 < filled;
            return `<div class="bnd-sheet${keep ? ' keep' : ''}" ${keep ? '' : `data-out="${i}"`} style="--i:${i}"><b>${a}~${at} · ${esc(x.g)}</b><small>${window.dmkLvText ? dmkLvText(x.lv, x.pg) : ''}</small>${keep ? '<span class="bnd-lock" title="꾸민 페이지가 있어서 뺄 수 없어요">🔒</span>' : `<button type="button" class="bnd-x" data-x="${i}" title="빼기">✕</button>`}</div>`;
        }).join('');
        bq('bndBench').innerHTML = cv
            ? `<div class="bnd-open" style="--cv:${cv.c};--ar:${1 / cv.r}"><div class="bnd-left">${dmkCvThumb(cv.c, cv.r, 150)}<b>${esc(cv.g)}</b><small>${cv.t === 'dcover' ? '📅 ' + cv.y + '년 · ' : ''}${cv.n} · ${cv.mm}mm</small>${s.id && lock ? '' : '<button type="button" class="bnd-x bnd-cvx" data-cvx="1" title="표지 내려놓기">↩</button>'}</div>
                <div class="bnd-ring" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
                <div class="bnd-right" id="bndDrop">${sheets || `<div class="bnd-empty">${date ? '📅 같은 크기 날짜 내지를 하나 끼워요' : '📄 같은 크기 내지를 끼워요 (여러 개 · 순서대로)'}</div>`}</div></div>`
            : `<div class="bnd-place" id="bndDrop"><b>🗂️</b><span>바구니에서 표지를 골라 여기에 놓아요</span></div>`;
        const pg = s.rf.reduce((t, x) => t + (C(x).t === 'drefill' ? 0 : C(x).pg), 0);
        bq('bndInfo').textContent = !cv ? '' : date ? (s.rf.length ? `📅 ${cv.y}년 다이어리가 돼요` : '날짜 내지를 끼워 주세요') : `내지 ${s.rf.length}묶음 · ${pg}페이지`;
        bq('bndName').value = s.g || ''; bq('bndName').disabled = date;
        bq('bndOk').textContent = s.id ? '💾 저장' : '🧩 조립하기';
        bq('bndOk').disabled = !(cv && s.rf.length);
    }
    /* 톡 · 끌기 */
    function act(t) {
        const s = st(); if (!s) return;
        if (t.dataset.new) { window.dmkForm && dmkForm(t.dataset.new); return; }
        if (t.dataset.cv) { if (t.classList.contains('old')) { showMsg('📅 해가 지난 표지라 조립할 수 없어요.'); return; } dmkRmPick(t.dataset.cv); if (st().cv && C(st().cv).id !== t.dataset.cv && dmkRmLock()) showMsg('꾸민 페이지가 있어서 같은 크기 표지로만 바꿀 수 있어요.'); return; }
        if (t.dataset.rf) {
            if (!s.cv) { showMsg('🗂️ 표지를 먼저 놓아 주세요.'); return; }
            if (t.classList.contains('off')) { showMsg(dmkRmDate() ? `📅 ${dmkRmN()} 크기 날짜 내지만 끼울 수 있어요.` : `📄 ${dmkRmN()} 크기 내지만 끼울 수 있어요.`); return; }
            dmkRmAdd(t.dataset.rf); return;
        }
    }
    function down(e) {
        const ed = e.target.closest('[data-ed]'); if (ed) { e.preventDefault(); const [t, id] = ed.dataset.ed.split(':'); dmkForm(t, id); return; }
        const x = e.target.closest('[data-x]'); if (x) { e.preventDefault(); dmkRmOut(+x.dataset.x); return; }
        if (e.target.closest('[data-cvx]')) { e.preventDefault(); const s = st(); if (s) { s.cv = null; s.rf = []; render(); } return; }
        const t = e.target.closest('.bnd-card, .bnd-sheet[data-out]'); if (!t) return;
        e.preventDefault();
        B.drag = { t, x: e.clientX, y: e.clientY, g: null, id: e.pointerId };
        const mv = ev => {
            const d = B.drag; if (!d || ev.pointerId !== d.id) return;
            if (!d.g && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 6) return;
            if (!d.g) { d.g = t.cloneNode(true); d.g.classList.add('bnd-ghost'); const r = t.getBoundingClientRect(); d.g.style.width = r.width + 'px'; document.body.appendChild(d.g); t.classList.add('lift'); }
            d.g.style.left = ev.clientX + 'px'; d.g.style.top = ev.clientY + 'px';
            const over = document.elementFromPoint(ev.clientX, ev.clientY);
            bq('bndRoom').classList.toggle('drop-in', !!(over && over.closest('#bndBench')) && !t.dataset.out);
            bq('bndRoom').classList.toggle('drop-out', !!(over && over.closest('#bndBasket')) && !!t.dataset.out);
        };
        const up = ev => {
            const d = B.drag; if (!d || ev.pointerId !== d.id) return;
            removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
            B.drag = null; t.classList.remove('lift'); bq('bndRoom').classList.remove('drop-in', 'drop-out');
            if (!d.g) { if (!t.dataset.out) act(t); return; }                 // 톡
            d.g.remove();
            const over = document.elementFromPoint(ev.clientX, ev.clientY);
            if (t.dataset.out != null && over && over.closest('#bndBasket')) { dmkRmOut(+t.dataset.out); return; }   // 끼운 내지 → 바구니 = 빼기
            if (!t.dataset.out && over && over.closest('#bndBench')) act(t);   // 바구니 → 작업대
        };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    }
    async function save() {
        const s = st(); if (!s) return;
        const date = dmkRmDate(), was = !!s.id;
        const id = await dmkRoomSave({ quiet: true });
        if (!id) { render(); return; }
        dmkRmInit('');
        render();
        if (window.dkDeskBooks) dkDeskBooks();
        await showMsg(`🧩 ${was ? '저장했어요' : '조립했어요'}!<br><span style="font-size:12px;color:#777;">${date ? '📅 날짜형바인더' : '🗂️ 바인더'}는 책상 위에 있어요 · 끌어서 옮겨요</span>`);
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && B.on && !document.querySelector('.modal[style*="flex"]')) bndClose(); });
    window.bndOpen = bndOpen; window.bndClose = bndClose; window.bndRender = () => { if (B.on) render(); }; window.bndIsOpen = () => B.on;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['binderroom'] = true;
