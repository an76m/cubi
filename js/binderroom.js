/* 말랑달콤 다이어리 - js/binderroom.js
   🧩 바인더 조립 공간 (도련 11-07 · 981 · 💻 📲 책상 오른쪽 위 메뉴 '바인더 조립')
   - 왼쪽 🧺 재료 바구니 = 가진 표지 · 내지 (🧩 다이어리 / _바인더재료목록.json · js/dyown.js) · 만들기는 여기 없어요 (도련 11-11 : 📒 다이어리 → 🗂️ 바인더 만들기 · 조립은 고르기만)
   - 가운데 작업대 = 진짜 책 (1374 · 도련 11-21 · js/book.js bookOpen inline) : 표지를 놓으면 덮인 책 → 밀어서 펼쳐요 → 펼친 표지에 내지를 끼워요 (톡 또는 끌어다 놓기) → 쪽이 생겨 넘겨 봐요
     · 되돌리기 = 아래 ⛓ 분리하기 하나 (표지 · 내지 모두 바구니로 · 도련 11-21) · 책 아래 끼운 내지 정보 줄은 영구 삭제 (도련 11-23)
   - 📅 날짜 표지(해가 적힌) = 같은 크기 날짜 내지 하나 · 끼운 표지의 해로 날짜가 그려져요 · 해가 지난 표지는 못 해요
   - 🧩 조립하기 = 다이어리 목록에 한 권 · 쓴 재료는 바구니에서 빠져요 → 바인더는 책상 위에 (책상 꾸미기에서 옮겨요)
   - ✏️ 내 바인더 고치기 = 이미 조립했지만 아직 안 쓴 페이지바인더 (꾸민 페이지가 있으면 목록에 없어요 · 도련 11-21) (내지 더 끼우기 · 빼기 · 표지 바꾸기 · 뺀 것은 바구니로)
   - 조립 규칙 · 저장은 js/dymaker.js (dmkRmInit · dmkRmPick · dmkRmAdd · dmkRmUnbind · dmkRoomSave) 와 같아요 · 여기는 그 모습만 */
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
                <div class="bnd-panel bnd-basket" id="bndBasket"><h3>🧺 재료 바구니</h3>
                    <div class="bnd-sec"><b>🗂️ 표지</b><div class="bnd-grid" id="bndCovers"></div></div>
                    <div class="bnd-sec"><b>📄 내지</b><div class="bnd-grid" id="bndRefills"></div></div></div>
                <div class="bnd-panel bnd-work"><div class="bnd-top"><span class="bnd-wt" id="bndWorkT">작업대</span><span class="bnd-mine" id="bndMine"></span>
                        <label>이름 <input id="bndName" maxlength="20" autocomplete="off" placeholder="내 바인더"></label>
                        <span class="bnd-info" id="bndInfo"></span>
                        <button type="button" class="btn" id="bndNew">분리하기</button>
                        <button type="button" class="btn bnd-ok" id="bndOk">🧩 조립하기</button></div>
                    <div class="bnd-bench" id="bndBench"></div></div></div>`;
        document.body.appendChild(el);
        bq('bndGo').onclick = bndCancel;
        bq('bndNew').onclick = split;
        bq('bndOk').onclick = save;
        bq('bndName').oninput = e => { const s = st(); if (s) s.g = e.target.value; };
        el.addEventListener('pointerdown', down);
        return el;
    }
    async function bndOpen() {
        if (!window.dmkRmInit) return;
        if (window.deskLeave) deskLeave();
        const el = build(); if (!B.on && window.driveHold) driveHold(true); B.on = true;   // ⏸ 조립하는 동안 드라이브 저장은 모아 두었다가 나갈 때 한 번 (도련 11-22)
        if (!st()) dmkRmInit('');
        el.classList.add('show'); document.body.classList.add('cal-on', 'bnd-on');
        if (document.documentElement.classList.contains('desk-on')) { el.classList.add('bnd-dkmode'); if (window.dkUnderVars) dkUnderVars(); if (window.dtmShow) dtmShow('바인더 조립'); }   // 🧩 바인더조립모드 = 책상 위 (도련 11-14)
        render();
        try { if (window.dymReady) await dymReady(); } catch (e) { console.warn('🧩 재료', e); }
        if (B.on) render();
    }
    function bndClose() {
        const el = bq('bndRoom'); if (!el || !B.on) return;
        B.on = false; bookOff(); el.classList.remove('show', 'bnd-dkmode'); document.body.classList.remove('cal-on', 'bnd-on'); if (window.dtmShow) dtmShow(null);
        if (window.driveHold) driveHold(false);                                 // ☁ 나갈 때 = 조립한 것 모두 한 번에 드라이브로
    }
    const C = v => window.dmkClean ? dmkClean(v) : v;
    const drIn = (h, id) => window.dbkMatIn && dbkMatIn(id) ? h.replace('>', '><i class="bnd-dr" title="서랍에 있어요 · ✔ 완료하면 서랍에서 빠져요">🗄️</i>') : h;   // 🗄️ 서랍 속 재료 표시 (도련 11-21 · 바구니에도 보여요)
    function cvCard(c, extra) {
        const yr = new Date().getFullYear(), old = c.t === 'dcover' && c.y < yr;
        return drIn(`<div class="bnd-card bnd-cv${old ? ' old' : ''}" data-cv="${esc(c.id)}" title="${old ? '해가 지난 표지예요' : ''}">${dmkCvThumb(c.c, c.r, 64, c.pid || c.d)}<span>${esc(c.g)}</span><small>${c.t === 'dcover' ? '📅 ' + c.y + ' · ' + c.n : c.n}</small>${extra || ''}</div>`, c.id);
    }
    function rfCard(r, R) {
        return drIn(`<div class="bnd-card bnd-rf" data-rf="${esc(r.id)}">${r.t === 'drefill' ? dmkRfThumb([[1, 1, r.lf || 'line']], R || 1.41, 64) : dmkRfThumb(r.lv, r.r, 64)}<span>${esc(r.g)}</span><small>${r.t === 'drefill' ? '📅 날짜 · ' + r.n : r.n + ' · ' + r.pg + '펼침면'}</small>${r.t === 'refill' && r.from === 'mine' && window.dymGet && dymGet(r.id) ? `<i class="bnd-ed" data-ed="refill:${esc(r.id)}" title="고치기">✏️</i>` : ''}</div>`, r.id);
    }
    /* 📖 작업대 = 진짜 책처럼 (도련 11-21 · 1374 · 📚 책 엔진 js/book.js bookOpen 하나 · 📒 스티커바인더와 같은 엔진)
         표지를 놓으면 = 덮인 책 → 밀어서(또는 ›) 펼쳐요 → 펼친 표지에 내지를 끼우면(톡 · 끌기) 그 쪽들이 생겨요 → 넘겨 봐요 · 첫 쪽에서 앞으로 = 덮기
         쪽 = 끼운 내지 차례대로 (📄 내지 = 그 내지무늬 · 📅 날짜 내지 = 그 해 날짜마다 한 쪽) · 막대에 ✕ 없음 (되돌리기 = ⛓ 분리하기 하나) */
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
        const P = pagesOf(s, cv), hint = open => open ? (date ? '📅 같은 크기 날짜 내지를 하나 끼워요 (톡 · 끌어서 책에)' : '📄 같은 크기 내지를 하나 끼워요 (톡 · 끌어서 책에)') : '📖 표지를 밀어서 (또는 ›) 펼쳐요';
        B.hint = hint;
        const empty = `<div class="bnd-pg bnd-pg0"><span>${date ? '📅 같은 크기 날짜 내지를<br>여기에 끼워요' : '📄 바구니의 내지를<br>톡 하거나 끌어서<br>여기에 끼워요'}</span></div>`;
        const leaf = (lf, p) => { const a = String(lf || 'line').split('/'); return window.leafCss ? leafCss(a[p % 2] || a[0]) : '#fffdfb'; };   // 📖 양쪽 디자인 = 왼쪽 / 오른쪽
        const spec = {
            id: cv.id, cls: 'bk-bd bk-bnd', inline: true, real: true,   // 📏 실제 규격 크기 (도련 11-21)
            pages: Math.max(1, P.length), mm: mmOf(cv),
            colors: [cv.c, `color-mix(in srgb, ${cv.c} 72%, #5a3a46)`], face: window.dyFaceCss && (cv.pid || cv.d) ? dyFaceCss(cv.pid || cv.d, 'px') : 'none',
            page: p => P.length ? `<div class="bnd-pg" style="background:${esc(leaf(P[p][0], p))}"><b class="abx-no">${esc(P[p][1])}</b></div>` : empty,
            blank: () => P.length ? '<div class="bnd-pg end"></div>' : empty,   // 내지 전 = 양쪽 모두 표지 색 위에 안내 (도련 11-23 · 1419 · 예전 왼쪽만 내지색 빗금 종이)
            cover: () => `<div class="bk-cover bd"><span class="bk-cvlb">${date ? '📅 ' + cv.y : '🗂️'} ${esc(cv.g)}</span><small>${esc(cv.n)} · 밀어서 펼쳐요</small></div>`,
            spine: () => BOOK_RINGS, cvSpine: 'ring',
            title: () => `🗂️ ${esc(cv.g)} <small>· 표지</small>`,
            side: () => { try { return localStorage.getItem(BND_SIDE) || 'lr'; } catch (e) { return 'lr'; } }, setSide: v => { try { localStorage.setItem(BND_SIDE, v); } catch (e) {} },
            onPage: (pg, open) => { const e = bq('bndSheets'), h = e && e.querySelector('.bnd-empty'); if (h) h.textContent = hint(open); },   // 펼치면 안내 글이 바뀌어요 (다시 그리지 않아요)
        };
        if (B.book && B.book.id === cv.id && B.book.root()) { B.book.refresh(spec); return; }   // 같은 표지 = 쪽만 다시 (펼침 · 쪽은 그대로)
        bookOff(); B.book = bookOpen(bq('bndBookHost'), Object.assign(spec, { pg: 0, open: false }));   // 새 표지 = 덮인 책부터 (다이어리처럼 밀어서 열어요)
    }
    function guidePos() {                                                    // 👉 안내 = 화살 꼬리가 바구니 오른쪽 끝에서 70px 안쪽 · 말풍선은 바구니 밖 (바구니 넓이가 바뀌어도 · 이형지북 .abx-guide 와 같은 자리 잡기)
        const g = document.querySelector('#bndRoom .bnd-mat > .bnd-guide'), k = bq('bndBasket'); if (!g || !k) return;
        g.style.left = (k.offsetLeft + k.offsetWidth - 70) + 'px';
    }
    addEventListener('resize', guidePos);
    function render() {
        if (!B.on) return;
        const s = st(); if (!s) return;
        const date = dmkRmDate(), n = dmkRmN(), lock = dmkRmLock(), cv = s.cv ? C(s.cv) : null;
        /* 🧺 바구니 */
        const covers = dmkRmPool('cover').filter(c => !(s.id && c.t === 'dcover'));
        bq('bndCovers').innerHTML = covers.map(c => cvCard(c, c.t === 'cover' && c.from === 'mine' && window.dymGet && dymGet(c.id) ? `<i class="bnd-ed" data-ed="cover:${esc(c.id)}" title="고치기">✏️</i>` : '')).join('');   // 표지 얻는 곳 안내 글 없앰 (도련 11-21)
        const refills = dmkRmPool('refill');
        const fit = r => cv && (date ? r.t === 'drefill' : r.t === 'refill') && r.n === n;
        bq('bndRefills').innerHTML = refills.sort((a, b) => fit(b) - fit(a)).map(r => rfCard(r, cv && cv.r).replace('class="bnd-card bnd-rf"', `class="bnd-card bnd-rf${cv && !fit(r) ? ' off' : ''}"`)).join('');
        /* 작업대 */
        bq('bndWorkT').textContent = s.id ? '✏️ ' + (s.g || '내 바인더') + ' 고치기' : '작업대';
        const mine = (window.dmkAll ? dmkAll() : []).filter(d => d.t === 'binder' && !(window.dmkFilledMax && dmkFilledMax(d.id) > 0));   // ✏️ 고치기 = 아직 안 쓴 바인더만 (꾸민 페이지가 있으면 = 쓴 바인더 · 안 보여요 · 도련 11-21)
        bq('bndMine').innerHTML = mine.length ? `<select id="bndMineSel" title="내 바인더 고치기"><option value="">✏️ 내 바인더 고치기</option>${mine.map(d => `<option value="${esc(d.id)}"${d.id === s.id ? ' selected' : ''}${window.dmkLocked && dmkLocked(d.id) ? ' disabled' : ''}>${window.dmkLocked && dmkLocked(d.id) ? '🔒 ' : ''}${esc(d.g)}</option>`).join('')}</select>` : '';
        const sel = bq('bndMineSel'); if (sel) sel.onchange = () => { dmkRmInit(sel.value); render(); };
        const bench = bq('bndBench');
        const mat = bench.closest('.bnd-mat'), gd = mat.querySelector(':scope > .bnd-guide');   // 👉 빈 작업대 = 바구니에 걸친 '표지를 작업대로' 안내 (가진 표지가 있을 때만 · js/util.js dragGuide · 도련 11-24 · 표지를 놓으면 · 표지가 없으면 없어요)
        if (!cv && covers.length) { if (!gd) mat.insertAdjacentHTML('beforeend', dragGuide('표지를<br>작업대로 끌어다 놓아요', 'bnd-guide')); guidePos(); } else if (gd) gd.remove();
        if (!cv) { bookOff(); bench.innerHTML = ''; }
        else {
            if (!bq('bndBookHost')) bench.innerHTML = '<div class="bnd-bookhost" id="bndBookHost"></div><div class="bnd-sheets" id="bndSheets"></div>';
            bookShow(cv, s, date, lock);
            bq('bndSheets').innerHTML = s.rf.length ? '' : `<div class="bnd-empty">${B.hint(!!(B.book && B.book.open))}</div>`;   // 끼운 내지 정보 줄 (책 아래 · '1~40 · 페이지 내지 …')은 영구 삭제 (도련 11-23 · 1419) · 안 끼웠을 때 안내 한 줄만
        }
        const pg = s.rf.reduce((t, x) => t + (C(x).t === 'drefill' ? 0 : C(x).pg), 0);
        bq('bndInfo').textContent = !cv ? '' : date ? (s.rf.length ? `📅 ${cv.y}년 다이어리가 돼요` : '날짜 내지를 끼워 주세요') : `내지 ${s.rf.length}묶음 · ${pg}펼침면`;
        bq('bndName').value = s.g || ''; bq('bndName').disabled = date;
        bq('bndOk').disabled = !(cv && s.rf.length);
        bq('bndNew').disabled = !(cv || s.rf.length) || (!!s.id && dmkRmFilled() > 0);   // ⛓ 분리할 게 없거나 꾸민 바인더 = 못 눌러요
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
    function down(e) {                                                            // 톡 · 끌기 = 바구니 재료를 작업대로 (끌기 하나로 · js/deskmove.js dkDrag) · 되돌리기 = ⛓ 분리하기 하나 (도련 11-21)
        const ed = e.target.closest('[data-ed]'); if (ed) { e.preventDefault(); const [t, id] = ed.dataset.ed.split(':'); dmkForm(t, id); return; }
        const t = e.target.closest('.bnd-card'); if (!t) return;
        if (e.button > 0) return; e.preventDefault();
        const room = bq('bndRoom'), over = ev => document.elementFromPoint(ev.clientX, ev.clientY);
        dkDrag(e, t, {
            at: null, from: 'lift',
            ghost: () => { const g = t.cloneNode(true); g.classList.add('bnd-ghost'); g.style.width = t.getBoundingClientRect().width + 'px'; return g; },
            move: ev => { const o = over(ev); room.classList.toggle('drop-in', !!(o && o.closest('#bndBench'))); },
            tap: () => act(t),                                                    // 톡 = 넣기
            drop: (cx, cy, ev) => { room.classList.remove('drop-in'); const o = over(ev); if (o && o.closest('#bndBench')) act(t); },
            cancel: () => room.classList.remove('drop-in')
        });
    }
    /* ⛓ 분리하기 (도련 11-21 '바구니로 옮기는 기능은 다 지우고 · 새로 → 분리하기 = 표지와 내지가 분리되어 바구니로') : 작업대의 표지 · 내지를 모두 바구니로
       새로 조립 중 = 작업대 비우기 (아직 바구니에서 빠지지 않았어요) · 조립한 바인더 = 한 번 묻고 풀기 (그 바인더는 없어져요 · dymaker.js dmkRmUnbind) · 꾸민 페이지가 있으면 못 해요 */
    async function split() {
        const s = st(); if (!s || (!s.cv && !s.rf.length)) return;
        if (!s.id) { dmkRmInit(''); render(); return; }
        if (dmkRmFilled() > 0) { showMsg('🔒 꾸민 페이지가 있어서 분리할 수 없어요.'); return; }
        const n = (s.o0.rf || []).length;
        if (await showAsk(`⛓ <b>${esc(s.g || '내 바인더')}</b> 바인더를 분리할까요?<br><span style="font-size:12px;color:#777;">표지${n ? ` · 내지 ${n}묶음` : ''}이 바구니로 돌아가고 바인더는 없어져요</span>`, '⛓ 분리하기', '취소') !== true) return;
        if (window.dmkRmUnbind && dmkRmUnbind()) render();
    }
    async function save() {
        const s = st(); if (!s) return;
        const date = dmkRmDate(), was = !!s.id;
        const id = await dmkRoomSave({ quiet: true });
        if (!id) { render(); return; }
        dmkRmInit('');
        render();
        if (window.dkDeskBooks) dkDeskBooks();
        await showMsg(`🧩 ${was ? '다시 조립했어요' : '조립했어요'}!<br><span style="font-size:12px;color:#777;">${date ? '📅 날짜형바인더' : '🗂️ 바인더'}는 책상 위에 있어요<br>책상 꾸미기에서 위치를 옮길 수 있어요</span>`);
    }
    /* 🧩 조립 = 🧩 조립하기 버튼 하나 (도련 11-21 · 저장 · ✔ 완료 버튼 없음 : 조립한 뒤에도 쓰기 전엔 고칠 수 있어서 '임시보관 · 완료' 규칙이 안 맞아요)
       ☁ 드라이브 = 조립 공간을 나갈 때(✕ · 닫기) 한 번에 (도련 11-22 '여러 개 조립하고 나갈 때 저장하는 게 효율적' · drive.js driveHold) · 이 기기엔 바로 보관
       ✕ = 조립하지 않고 나가기 (놓은 게 있으면 한 번 물어요) */
    const bndDirty = () => { const s = st(); if (!s || !s.o0) return false; const a = s.rf || [], b = s.o0.rf || []; return s.cv !== s.o0.cv || a.length !== b.length || a.some((x, i) => x !== b[i]); };
    async function bndCancel() {
        if (bndDirty()) {
            if (!await showAsk('조립하지 않고 나갈까요?<br><small style="color:#777;">🧩 조립하기를 눌러야 바인더가 만들어져요</small>', '조립 안 하고 나가기', '계속 조립하기')) return;
            window.dmkRmInit('');
        }
        bndClose();
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && B.on && !document.querySelector('.modal[style*="flex"]')) bndCancel(); });
    window.bndOpen = bndOpen; window.bndClose = bndClose; window.bndCancel = bndCancel; window.bndRender = () => { if (B.on) render(); }; window.bndIsOpen = () => B.on;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['binderroom'] = true;
