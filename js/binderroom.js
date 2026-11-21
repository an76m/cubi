/* 말랑달콤 다이어리 - js/binderroom.js
   🧩 바인더 조립 공간 (도련 11-07 · 981 · 💻 📲 책상 오른쪽 위 메뉴 '바인더 조립')
   - 왼쪽 🧺 재료 바구니 = 가진 표지 · 내지 (🧩 다이어리 / _바인더재료목록.json · js/dyown.js) · 만들기는 여기 없어요 (도련 11-11 : 📒 다이어리 → 🗂️ 바인더 만들기 · 조립은 고르기만)
   - 가운데 작업대 = 진짜 책 (1374 · 도련 11-21 · js/book.js bookOpen inline) : 표지를 놓으면 덮인 책 → 밀어서 펼쳐요 → 펼친 표지에 내지를 끼워요 (톡 또는 끌어다 놓기) → 쪽이 생겨 넘겨 봐요
     · 끼운 내지 묶음 = 책 아래 한 줄 (바구니로 끌거나 ✕ = 빼기) · 책 막대 ✕ = 표지 내려놓기
   - 📅 날짜 표지(해가 적힌) = 같은 크기 날짜 내지 하나 · 끼운 표지의 해로 날짜가 그려져요 · 해가 지난 표지는 못 해요
   - 🧩 조립하기 = 다이어리 목록에 한 권 · 쓴 재료는 바구니에서 빠져요 → 바인더는 책상 위에 (끌어서 옮겨요)
   - ✏️ 내 바인더 고치기 = 이미 조립했지만 아직 안 쓴 페이지바인더 (꾸민 페이지가 있으면 목록에 없어요 · 도련 11-21) (내지 더 끼우기 · 빼기 · 표지 바꾸기 · 뺀 것은 바구니로)
   - 조립 규칙 · 저장은 js/dymaker.js (dmkRmInit · dmkRmPick · dmkRmAdd · dmkRmOut · dmkRoomSave) 와 같아요 · 여기는 그 모습만 */
(function () {
    const B = { on: false, drag: null, book: null };
    const bq = id => document.getElementById(id);
    const esc = htmlEsc;   // 🧰 js/util.js
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
                        <button type="button" class="btn bnd-ok" id="bndOk">🧩 조립하기</button><button type="button" class="btn bnd-done" id="bndDone">✔ 완료</button></div></div></div>`;
        document.body.appendChild(el);
        bq('bndGo').onclick = bndCancel; bq('bndDone').onclick = bndDone;
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
        if (document.documentElement.classList.contains('desk-on')) { el.classList.add('bnd-dkmode'); if (window.dkUnderVars) dkUnderVars(); if (window.dtmShow) dtmShow('바인더 조립'); }   // 🧩 바인더조립모드 = 책상 위 (도련 11-14)
        render();
        try { if (window.dymReady) await dymReady(); } catch (e) { console.warn('🧩 재료', e); }
        try { if (window.dbkMatReady) await dbkMatReady(); } catch (e) {}       // 🗄️ 🧩 서랍 속 재료 표시 (🗄️ · 그 서랍장 파일만 · js/deskbook.js)
        if (B.on) render();
    }
    function bndClose() {
        const el = bq('bndRoom'); if (!el || !B.on) return;
        B.on = false; bookOff(); el.classList.remove('show', 'bnd-dkmode'); document.body.classList.remove('cal-on', 'bnd-on'); if (window.dtmShow) dtmShow(null);
    }
    const C = v => window.dmkClean ? dmkClean(v) : v;
    const drIn = (h, id) => window.dbkMatIn && dbkMatIn(id) ? h.replace('>', '><i class="bnd-dr" title="서랍에 있어요 · ✔ 완료하면 서랍에서 빠져요">🗄️</i>') : h;   // 🗄️ 서랍 속 재료 표시 (도련 11-21 · 바구니에도 보여요)
    function cvCard(c, extra) {
        const yr = new Date().getFullYear(), old = c.t === 'dcover' && c.y < yr;
        return drIn(`<div class="bnd-card bnd-cv${old ? ' old' : ''}" data-cv="${esc(c.id)}" title="${old ? '해가 지난 표지예요' : ''}">${dmkCvThumb(c.c, c.r, 64, c.pid || c.d)}<span>${esc(c.g)}</span><small>${c.t === 'dcover' ? '📅 ' + c.y + ' · ' + c.n : c.n}</small>${extra || ''}</div>`, c.id);
    }
    function rfCard(r, R) {
        return drIn(`<div class="bnd-card bnd-rf" data-rf="${esc(r.id)}">${r.t === 'drefill' ? dmkRfThumb([[1, 1, r.lf || 'line']], R || 1.41, 64) : dmkRfThumb(r.lv, r.r, 64)}<span>${esc(r.g)}</span><small>${r.t === 'drefill' ? '📅 날짜 · ' + r.n : r.n + ' · ' + r.pg + 'p'}</small>${r.t === 'refill' && r.from === 'mine' && window.dymGet && dymGet(r.id) ? `<i class="bnd-ed" data-ed="refill:${esc(r.id)}" title="고치기">✏️</i>` : ''}</div>`, r.id);
    }
    /* 📖 작업대 = 진짜 책처럼 (도련 11-21 · 1374 · 📚 책 엔진 js/book.js bookOpen 하나 · 📒 스티커바인더와 같은 엔진)
         표지를 놓으면 = 덮인 책 → 밀어서(또는 ›) 펼쳐요 → 펼친 표지에 내지를 끼우면(톡 · 끌기) 그 쪽들이 생겨요 → 넘겨 봐요 · 첫 쪽에서 앞으로 = 덮기
         쪽 = 끼운 내지 차례대로 (📄 내지 = 그 내지무늬 · 📅 날짜 내지 = 그 해 날짜마다 한 쪽) · ✕ = 표지 내려놓기 (꾸민 쪽이 있는 바인더 고치기는 못 해요) */
    const BND_SIDE = 'malang_bnd_side';
    const mmOf = c => { const m = String(c.mm || '').match(/([\d.]+)\D+([\d.]+)/); return m ? [+m[1], +m[2]] : [Math.round(148 / (c.r || 1.41)), 148]; };
    function pagesOf(s, cv) {                                                     // 끼운 내지 → 쪽마다 [무늬, 쪽 이름]
        const P = [];
        s.rf.forEach(x0 => { const x = C(x0) || x0;
            if (x.t === 'drefill') { const y = cv.y || new Date().getFullYear(); for (let d = new Date(y, 0, 1); d.getFullYear() === y; d.setDate(d.getDate() + 1)) P.push([x.lf || 'line', `${d.getMonth() + 1}월 ${d.getDate()}일`]); return; }
            const lv = x.lv && x.lv.length ? x.lv : [[1, x.pg, 'line']];
            for (let k = 1; k <= x.pg; k++) { const r = lv.find(v => k >= v[0] && k <= v[1]) || lv[lv.length - 1]; P.push([r[2], String(P.length + 1)]); }
        });
        return P;
    }
    function bookOff() { if (B.book) { B.book.destroy(); B.book = null; } }
    function bookShow(cv, s, date, lock) {
        const P = pagesOf(s, cv), canX = !(s.id && lock), hint = open => open ? (date ? '📅 같은 크기 날짜 내지를 하나 끼워요 (톡 · 끌어서 책에)' : '📄 같은 크기 내지를 끼워요 (톡 · 끌어서 책에 · 여러 개 · 순서대로)') : '📖 표지를 밀어서 (또는 ›) 펼쳐요';
        B.hint = hint;
        const leaf = (lf, p) => { const a = String(lf || 'line').split('/'); return window.leafCss ? leafCss(a[p % 2] || a[0]) : '#fffdfb'; };   // 📖 양쪽 디자인 = 왼쪽 / 오른쪽
        const spec = {
            id: cv.id, cls: 'bk-bd bk-bnd', inline: true, pages: Math.max(1, P.length), mm: mmOf(cv),
            colors: [cv.c, `color-mix(in srgb, ${cv.c} 72%, #5a3a46)`], face: window.dyFaceCss && (cv.pid || cv.d) ? dyFaceCss(cv.pid || cv.d, 'px') : 'none',
            page: p => P.length ? `<div class="bnd-pg" style="background:${esc(leaf(P[p][0], p))}"><b class="abx-no">${esc(P[p][1])}</b></div>`
                : `<div class="bnd-pg bnd-pg0"><span>${date ? '📅 같은 크기 날짜 내지를<br>여기에 끼워요' : '📄 바구니의 내지를<br>톡 하거나 끌어서<br>여기에 끼워요'}</span></div>`,
            blank: () => '<div class="bnd-pg end"></div>',
            cover: () => `<div class="bk-cover bd"><span class="bk-cvlb">${date ? '📅 ' + cv.y : '🗂️'} ${esc(cv.g)}</span><small>${esc(cv.n)} · 밀어서 펼쳐요</small></div>`,
            spine: () => BOOK_RING.repeat(3) + '<span></span>' + BOOK_RING.repeat(3),
            title: () => `🗂️ ${esc(cv.g)} <small>· 표지</small>`,
            side: () => { try { return localStorage.getItem(BND_SIDE) || 'lr'; } catch (e) { return 'lr'; } }, setSide: v => { try { localStorage.setItem(BND_SIDE, v); } catch (e) {} },
            onPage: (pg, open) => { const e = bq('bndSheets'), h = e && e.querySelector('.bnd-empty'); if (h) h.textContent = hint(open); },   // 펼치면 안내 글이 바뀌어요 (다시 그리지 않아요)
            onClose: () => { if (!canX) { showMsg('🔒 꾸민 페이지가 있어서 표지를 내려놓을 수 없어요.'); return; } const st0 = st(); if (st0) { st0.cv = null; st0.rf = []; } render(); }   // ✕ = 표지 내려놓기
        };
        if (B.book && B.book.id === cv.id && B.book.root()) { B.book.refresh(spec); return; }   // 같은 표지 = 쪽만 다시 (펼침 · 쪽은 그대로)
        bookOff(); B.book = bookOpen(bq('bndBookHost'), Object.assign(spec, { pg: 0, open: false }));   // 새 표지 = 덮인 책부터 (다이어리처럼 밀어서 열어요)
    }
    function render() {
        if (!B.on) return;
        const s = st(); if (!s) return;
        const date = dmkRmDate(), n = dmkRmN(), lock = dmkRmLock(), cv = s.cv ? C(s.cv) : null;
        /* 🧺 바구니 */
        const covers = dmkRmPool('cover').filter(c => !(s.id && c.t === 'dcover'));
        bq('bndCovers').innerHTML = covers.map(c => cvCard(c, c.t === 'cover' && c.from === 'mine' && window.dymGet && dymGet(c.id) ? `<i class="bnd-ed" data-ed="cover:${esc(c.id)}" title="고치기">✏️</i>` : '')).join('')
            + (covers.some(c => c.t === 'dcover') ? '' : `<div class="bnd-hint">🗂️ 표지는 📒 다이어리 → 🗂️ 바인더 만들기에서 만들거나 🏪 샵 → 📔 다이어리에서 받아요</div>`);
        const refills = dmkRmPool('refill');
        const fit = r => cv && (date ? r.t === 'drefill' : r.t === 'refill') && r.n === n;
        bq('bndRefills').innerHTML = refills.sort((a, b) => fit(b) - fit(a)).map(r => rfCard(r, cv && cv.r).replace('class="bnd-card bnd-rf"', `class="bnd-card bnd-rf${cv && !fit(r) ? ' off' : ''}"`)).join('')
            + (refills.length ? '' : `<div class="bnd-hint">📄 내지는 📒 다이어리 → 🗂️ 바인더 만들기에서 만들거나 🏪 샵 → 📅 날짜 내지 · 📄 페이지 내지에서 받아요</div>`);
        /* 작업대 */
        bq('bndWorkT').textContent = s.id ? '✏️ ' + (s.g || '내 바인더') + ' 고치기' : '작업대';
        const mine = (window.dmkAll ? dmkAll() : []).filter(d => d.t === 'binder' && !(window.dmkFilledMax && dmkFilledMax(d.id) > 0));   // ✏️ 고치기 = 아직 안 쓴 바인더만 (꾸민 페이지가 있으면 = 쓴 바인더 · 안 보여요 · 도련 11-21)
        bq('bndMine').innerHTML = mine.length ? `<select id="bndMineSel" title="내 바인더 고치기"><option value="">✏️ 내 바인더 고치기</option>${mine.map(d => `<option value="${esc(d.id)}"${d.id === s.id ? ' selected' : ''}${window.dmkLocked && dmkLocked(d.id) ? ' disabled' : ''}>${window.dmkLocked && dmkLocked(d.id) ? '🔒 ' : ''}${esc(d.g)}</option>`).join('')}</select>` : '';
        const sel = bq('bndMineSel'); if (sel) sel.onchange = () => { dmkRmInit(sel.value); render(); };
        let at = 0;
        const filled = dmkRmFilled();
        const sheets = s.rf.map((x0, i) => {                                     // 끼운 내지 묶음 (책 아래 한 줄 · 끌어서 바구니로 = 빼기 · ✕)
            const x = C(x0) || x0;
            if (x.t === 'drefill') return `<div class="bnd-sheet" data-out="${i}" style="--i:${i}"><b>📅 ${esc(x.g)}</b><small>${cv ? cv.y + '년 날짜로' : ''} · ${window.dmkLeafName ? dmkLeafName(x.lf || 'line') : ''}</small><button type="button" class="bnd-x" data-x="${i}" title="빼기">✕</button></div>`;
            const a = at + 1; at += x.pg; const keep = a - 1 < filled;
            return `<div class="bnd-sheet${keep ? ' keep' : ''}" ${keep ? '' : `data-out="${i}"`} style="--i:${i}"><b>${a}~${at} · ${esc(x.g)}</b><small>${window.dmkLvText ? dmkLvText(x.lv, x.pg) : ''}</small>${keep ? '<span class="bnd-lock" title="꾸민 페이지가 있어서 뺄 수 없어요">🔒</span>' : `<button type="button" class="bnd-x" data-x="${i}" title="빼기">✕</button>`}</div>`;
        }).join('');
        const bench = bq('bndBench');
        if (!cv) { bookOff(); bench.innerHTML = `<div class="bnd-place" id="bndDrop"><b>🗂️</b><span>바구니에서 표지를 골라 여기에 놓아요</span></div>`; }
        else {
            if (!bq('bndBookHost')) bench.innerHTML = '<div class="bnd-bookhost" id="bndBookHost"></div><div class="bnd-sheets" id="bndSheets"></div>';
            bookShow(cv, s, date, lock);
            bq('bndSheets').innerHTML = sheets || `<div class="bnd-empty">${B.hint(!!(B.book && B.book.open))}</div>`;
        }
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
            if (!B.book || !B.book.open) { showMsg('📖 표지를 먼저 펼쳐 주세요.<br><small>책을 밀거나 › 를 눌러요</small>'); return; }   // 다이어리처럼 = 펼친 표지에 끼워요 (도련 11-21)
            if (t.classList.contains('off')) { showMsg(dmkRmDate() ? `📅 ${dmkRmN()} 크기 날짜 내지만 끼울 수 있어요.` : `📄 ${dmkRmN()} 크기 내지만 끼울 수 있어요.`); return; }
            dmkRmAdd(t.dataset.rf); return;
        }
    }
    function down(e) {
        const ed = e.target.closest('[data-ed]'); if (ed) { e.preventDefault(); const [t, id] = ed.dataset.ed.split(':'); dmkForm(t, id); return; }
        const x = e.target.closest('[data-x]'); if (x) { e.preventDefault(); dmkRmOut(+x.dataset.x); return; }
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
    /* ✔ 완료 = 작업대에 놓은 게 있으면 조립(저장)하고 책상으로 · ✕ = 조립하지 않고 (놓은 게 있으면 한 번 물어요) · 도련 11-15 '완료 전엔 드라이브에 저장 안 돼요' (작업대는 원래 🧩 조립하기 때만 저장) */
    const bndDirty = () => { const s = st(); if (!s || !s.o0) return false; const a = s.rf || [], b = s.o0.rf || []; return s.cv !== s.o0.cv || a.length !== b.length || a.some((x, i) => x !== b[i]); };
    async function bndDone() {
        if (bndDirty()) { await save(); if (bndDirty()) return; }                 // 못 했으면 (표지가 없어요 …) 그대로
        bndClose();
    }
    async function bndCancel() {
        if (bndDirty()) {
            if (!await showAsk('조립하지 않고 나갈까요?<br><small style="color:#777;">✔ 완료를 눌러야 바인더가 만들어져요</small>', '조립 안 하고 나가기', '계속 조립하기')) return;
            window.dmkRmInit('');
        }
        bndClose();
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && B.on && !document.querySelector('.modal[style*="flex"]')) bndCancel(); });
    window.bndOpen = bndOpen; window.bndClose = bndClose; window.bndDone = bndDone; window.bndCancel = bndCancel; window.bndRender = () => { if (B.on) render(); }; window.bndIsOpen = () => B.on;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['binderroom'] = true;
