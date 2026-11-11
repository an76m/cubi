/* 말랑달콤 다이어리 - js/desktape.js
   🎀 마테 정리함 (도련 11-03 · 💻 📲 책상 · 현실처럼 : 다꾸러들은 마스킹테이프를 꺼내 세워 두고 골라 써요)
   - 상품 '담는것' = tape 인 책상소품 (상품공방 '마테 정리함' · 도련 11-06 · 종류가 달라도 돼요) · 칸 = 상품 '소품.slots' (그림 위 세로 칸 · [왼, 위, 오른, 아래] %) · 앞벽 그림이 있으면 앞 가로대가 롤 앞을 가려요
   - 🛍️ 봉투의 마스킹테이프 카드를 정리함에 끌어다 놓으면 = 정리함 그림이 크게 뜨고 꽂을 빈 칸을 골라요 (서랍장처럼 · 도련 11-04) · 칸이 모자라면 안 들어가요 (봉투에 그대로)
   - 꽂힌 롤 = 옆모습 (그 테이프 무늬 · 남은 길이만큼 지름이 줄어요) · 톡 = 다이어리를 펴고 바로 페이지에 붙여요 (정리함엔 그대로)
   - 🛠 책상 꾸미기에서만 : 롤을 끌어 다른 칸 · 다른 정리함으로 (차 있으면 서로 바꿔요) · 정리함 밖에 놓으면 서랍(마스킹테이프 칸)으로
   - 정리함에 꽂힌 테이프는 바구니 · 서랍 마스킹테이프 칸에 안 보여요 (js/desk.js deskBagHold 의 s 에 더해요 · 한 곳에만 있어요)
   - 저장 : 'diary_desk_tape' { 소품 u: [칸마다 테이프 id | null] } → 🔐 설정 / 배치.json (도련 11-06 · js/drive.js DESK_FILE_KEYS · 게스트 'malang_desk_tape') */
(function () {
    const DKT_KEY = 'diary_desk_tape', DKT_L = 'malang_desk_tape';
    const T = { list: null, loading: false, drag: null, fresh: false, tmp: new Map(), ov: {}, wait: new Map() };   // wait = 임시 롤을 누르고 기다리는 중 (tmp → [ok])   // ov = { 정리함 u: [칸마다 임시 롤 id] } (저장 전 · 화면에만)   // fresh = 방금 새로 읽은 목록 (없는 테이프를 뺄 때만)
    const desk = UI.desk;
    const read = () => { const v = typeof prefGet === 'function' ? prefGet(DKT_KEY, DKT_L) : null; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
    const write = v => { if (typeof prefSet === 'function') prefSet(DKT_KEY, DKT_L, v); };
    const isRack = el => !!el && dkDef(el).hold === 'tape';   // 🧺 상품 '담는것' = 마테 롤 (도련 11-06 · 종류가 아니라 상품)
    const slotsOf = el => (dkDef(el).slots || []).filter(r => Array.isArray(r) && r.length === 4);
    const entry = id => (T.list || []).find(e => e.id === id) || T.tmp.get(id) || null;   // T.tmp = 🎁 아직 드라이브에 저장 중인 처음 선물 롤 (먼저 보여 줘요)
    /* 🔑 누구의 목록인지 (도련 11-04 고침) : 로그인이 끝나기 전에 읽은 목록은 빈 목록이에요 → 그걸 믿고 칸을 비우면 꽂아 둔 테이프가 저장에서 사라졌어요
       → 저장 모드 + 계정이 정해진 뒤에 읽은 목록만 믿어요 · 계정이 바뀌면 다시 읽어요 */
    const who = () => { const m = window.ownMode ? window.ownMode() : ''; return m === 'drive' ? (typeof COLL !== 'undefined' && COLL.who ? 'drive|' + COLL.who : '') : m; };
    function load(force) {                                                    // 테이프 무늬 · 남은 길이 = 내 스티커 목록 (js/own.js)
        if ((T.list && !force && T.who === who()) || T.loading || !window.ownList || !who()) return;   // 아직 로그인 중 = 읽지 않아요
        T.loading = true; const w = who();
        ownList(!!force, 'tape').then(L => {
            if (w !== who()) return; T.list = Array.isArray(L) ? L : []; T.who = w; T.fresh = !!force; paint();
            if (window.ownTapeFix && T.list.some(e => !/^data:image\/svg/.test(e.th || ''))) ownTapeFix();   // 🎀 하얀 롤 = 무늬를 되돌려요 (js/own.js · 고치면 ownOnChange 로 다시 그려요 · 11-11)
        }).catch(() => {}).finally(() => { T.loading = false; });
    }
    if (window.ownOnChange) ownOnChange(() => { T.fresh = false; load(true); });
    /* 정리함에 꽂힌 테이프 id (지금 책상에 있는 정리함만 · 다 쓴 · 버린 테이프는 빼요) */
    function held() {
        const M = read(), out = new Set();
        document.querySelectorAll('#deskStage .desk-item').forEach(el => { if (isRack(el)) (M[el.dataset.u] || []).forEach(id => { if (id) out.add(id); }); });
        return out;
    }
    window.dktHeld = () => desk() ? held() : new Set();
    /* 🎀 그리기 : 소품 안에 롤 + 앞벽 */
    function paint() {
        if (!desk()) return;
        const M = read(); let dirty = false;
        document.querySelectorAll('#deskStage .desk-item').forEach(el => {
            let host = el.querySelector(':scope > .dkt-rack');
            if (!isRack(el)) { if (host) host.remove(); return; }
            if (!host) { host = document.createElement('div'); host.className = 'dkt-rack'; el.appendChild(host); }
            const S = slotsOf(el), ids = (M[el.dataset.u] || []).slice(0, S.length), ov = T.ov[el.dataset.u] || [];
            ov.forEach((id, i) => { if (id && !ids[i]) ids[i] = id; });   // 🎁 저장 중인 처음 선물 롤도 같이
            if (T.list && ids.some(id => id && !entry(id))) { if (!T.fresh) load(true); else if (!T.retry && (T.tries || 0) < 10) { T.tries = (T.tries || 0) + 1; T.retry = setTimeout(() => { T.retry = 0; T.fresh = false; load(true); }, 3000); } }   // 늦게 들어오는 롤 = 3초마다 다시 (10번까지)   /* 목록에 없는 롤 = 그리지만 않아요 · 칸에서 빼지 않아요 (도련 11-04 고침 : 드라이브는 방금 받은 롤이 목록 파일에 늦게 들어와서 처음 선물 롤이 칸에서 빠졌어요) · 빈 칸 정리는 새 롤을 꽂을 때 (dktDrop) */
            { const why = ids.map(id => { if (!id || (T.list && !entry(id))) return ''; const e = entry(id); return !e ? 'nolist' : !e.th ? 'noth' : /^data:image\/svg/.test(e.th) || e.th.startsWith('blob:') ? '' : 'raster'; }).filter(Boolean);   // 🧾 하얀 롤 까닭 (11-11 · 도련 : 어느 순간 하얗게 → 다음엔 문제 기록으로 알아봐요)
              if (why.length && window.diag) { const key = why.sort().join(','); if (T.white !== key) { T.white = key; T.whiteT = setTimeout(() => { if (T.white === key) diag('tapeWhite', { why: key.slice(0, 60), list: T.list ? T.list.length : -1, who: who() ? 1 : 0, fresh: T.fresh ? 1 : 0 }); }, 4000); } } else if (!why.length) T.white = ''; }   // 4초 넘게 하얀 채일 때만 (읽는 중 잠깐은 빼요)
            const img = el.querySelector(':scope > img'), d = dkDef(el);
            const iw = parseFloat(el.style.width) || el.offsetWidth, ih = parseFloat(el.style.height) || el.offsetHeight;
            host.innerHTML = S.map((r, i) => {
                const id = ids[i]; if (!id || (T.list && !entry(id))) return DK.edit ? '' : `<button type="button" class="dkt-empty" data-i="${i}" title="빈 칸 · 톡 = 서랍에서 꺼내 꽂기" style="left:${r[0]}%;top:${r[1]}%;width:${r[2] - r[0]}%;height:${r[3] - r[1]}%"></button>`;   // 🎀 빈 칸 톡 = 서랍 테이프 꽂기 (도련 11-11)
                const e = entry(id), q = e && e.q0 ? Math.max(.25, Math.min(1, e.q / e.q0)) : 1, th = e && e.th ? e.th : '';
                const H = (r[3] - r[1]) * (.55 + .45 * q), W = (r[2] - r[0]) * .86;   // 남은 길이만큼 지름이 줄어요
                return `<button type="button" class="dkt-roll${window.dsHas && dsHas(id) ? ' dkt-out' : ''}" data-i="${i}" data-id="${htmlEsc(id)}" title="🎀 마스킹테이프" style="left:${(r[0] + (r[2] - r[0] - W) / 2).toFixed(2)}%;top:${(r[3] - H).toFixed(2)}%;width:${W.toFixed(2)}%;height:${H.toFixed(2)}%"><i style="width:${(H / 100 * ih).toFixed(1)}px;height:${(W / 100 * iw).toFixed(1)}px;background-image:url(&quot;${htmlEsc(th)}&quot;)"></i></button>`;   // 무늬 = 테이프 결 그대로 세로로 (롤 둘레)
            }).join('') + (d.front && img ? `<i class="dkt-front"><i style="--fm:url('${htmlEsc(new URL(d.front, location.href).href)}')"><img src="${htmlEsc(img.src)}" alt="" draggable="false"></i></i>` : '');
            host.querySelectorAll('.dkt-roll').forEach(b => wire(b, el));
            host.querySelectorAll('.dkt-empty').forEach(b => { b.addEventListener('pointerdown', ev => ev.stopPropagation()); b.addEventListener('click', ev => { ev.stopPropagation(); fill(el, +b.dataset.i); }); });
        });
        if (dirty) write(M);
        if (!T.list || T.who !== who()) load(true);
    }
    window.dktPaint = () => { try { paint(); } catch (e) { console.warn('🎀 마테 정리함', e); } };
    /* 롤 톡 = 바로 쓰기 · 🛠 꾸미기 = 끌어 옮기기 */
    function wire(b, el) {
        b.addEventListener('pointerdown', ev => {
            if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
            const id = b.dataset.id;
            if (!DK.edit) { T.drag = { tap: true, id, x: ev.clientX, y: ev.clientY, pid: ev.pointerId }; return; }
            try { b.setPointerCapture(ev.pointerId); } catch (er) {}
            const r = b.getBoundingClientRect(), g = b.cloneNode(true); g.className = 'dkt-roll dkt-ghost';
            Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); document.body.appendChild(g);
            b.classList.add('dkt-lift');
            T.drag = { id, from: el.dataset.u, i: +b.dataset.i, g, b, dx: ev.clientX - r.left, dy: ev.clientY - r.top, pid: ev.pointerId };
        });
        b.addEventListener('pointermove', ev => { const d = T.drag; if (!d || d.tap || d.pid !== ev.pointerId) return; d.g.style.left = (ev.clientX - d.dx) + 'px'; d.g.style.top = (ev.clientY - d.dy) + 'px'; });
        const up = ev => {
            const d = T.drag; if (!d || d.pid !== ev.pointerId) return; T.drag = null;
            if (d.tap) { if (ev.type === 'pointerup' && Math.hypot(ev.clientX - d.x, ev.clientY - d.y) < 10) use(d.id, b); return; }
            d.g.remove(); d.b.classList.remove('dkt-lift');
            if (ev.type !== 'pointerup') return;
            const hit = slotAt(ev.clientX, ev.clientY), M = read();
            const from = (M[d.from] || []).slice();
            if (hit) {                                                          // 다른 칸으로 (차 있으면 서로 바꿔요)
                if (hit.u === d.from && hit.i === d.i) return;
                const to = hit.u === d.from ? from : (M[hit.u] || []).slice(), other = to[hit.i] || null;
                to[hit.i] = d.id; if (hit.u === d.from) to[d.i] = other; else { from[d.i] = other; M[hit.u] = to; }
                M[d.from] = from; write(M); paint(); return;
            }
            from[d.i] = null; M[d.from] = from; write(M); paint();             // 정리함 밖 = 서랍(마스킹테이프 칸)으로
            if (window.dkwSay) dkwSay('🎀 서랍 마스킹테이프 칸으로 넣었어요', { getBoundingClientRect: () => ({ left: ev.clientX - 40, width: 80, top: ev.clientY }) });
        };
        b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    }
    function slotAt(x, y) {                                                   // 그 자리의 정리함 칸 { u, i }
        for (const el of document.querySelectorAll('#deskStage .desk-item')) {
            if (!isRack(el)) continue;
            const im = el.querySelector(':scope > img') || el, R = im.getBoundingClientRect(); if (x < R.left || x > R.right || y < R.top || y > R.bottom) continue;
            const px = (x - R.left) / R.width * 100, S = slotsOf(el);
            let best = -1, bd = 1e9; S.forEach((r, i) => { const c = (r[0] + r[2]) / 2, dd = px >= r[0] && px <= r[2] ? 0 : Math.abs(px - c); if (dd < bd) { bd = dd; best = i; } });
            if (best >= 0) return { u: el.dataset.u, i: best, el };
        }
        return null;
    }
    async function use(id, b) {
        if (String(id).startsWith('tmp-')) {                                  // 🎁 저장 중인 처음 선물 롤 = 저장이 끝나면 바로 꺼내요 (메시지 없이 · 도련 11-04)
            if (b) { b.classList.remove('dkt-pick'); void b.offsetWidth; b.classList.add('dkt-pick'); }
            const real = await new Promise(ok => { const w = T.wait.get(id) || []; w.push(ok); T.wait.set(id, w); setTimeout(() => ok(null), 30000); });
            if (!real) { if (window.showMsg) showMsg('⚠ 테이프를 아직 못 받았어요.<br><small>인터넷 연결을 확인해 주세요</small>'); return; }
            id = real; b = null;
        }                                               // 🎀 톡 = 다이어리를 펴고 롤을 페이지 위에 꺼내요 → 롤에서 끌어 뽑아 붙여요 (예전 바구니에서 꺼낸 롤과 같게 · 도련 11-03)
        if (b) { b.classList.remove('dkt-pick'); void b.offsetWidth; b.classList.add('dkt-pick'); }
        if (!window.dkwReady || !await dkwReady()) return;
        const cv = document.getElementById('canvasArea'), r0 = cv ? cv.getBoundingClientRect() : null, r = r0 && window.dyVisRect ? dyVisRect(r0) : r0;
        const at = r ? { x: r.left + r.width * .5, y: r.top + r.height * .45 } : null;
        if (window.dsTapeOut) { await dsTapeOut(id, at); setTimeout(paint, 50); return; }
        try {                                                                  // (꺼내 둔 스티커창이 없으면 = 바로 붙여요)
            const s = window.ownSheet ? await ownSheet(id) : null;
            if (!s) { showMsg('🎀 이 테이프는 다 썼어요.'); return; }
            if (window.placeTape) placeTape(s.s.imgs[0], { id });
        } catch (e) { console.warn(e); showMsg('⚠ 테이프를 꺼내지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); }
    }
    /* 🎀 칸 고르기 (도련 11-04 · 서랍장 dkzChoose 처럼) : 정리함 그림이 크게 뜨고 빈 칸을 직접 눌러요 · 찬 칸 = 그 테이프가 보이고 못 눌러요 · 결과 = 칸 번호 (취소 = -1) */
    async function pickSlot(t, ids, need) {
        const S = slotsOf(t), im = t.querySelector(':scope > img'), o = DK.items.find(x => x.u === t.dataset.u);
        const html = `🎀 <b>마스킹테이프</b>를 꽂을 칸을 눌러 주세요<br><span style="font-size:12px;color:#777;">${htmlEsc(dkName(o) || '마테 정리함')} · 빈 칸만 고를 수 있어요${need > 1 ? ` · ${need}개는 고른 칸부터 빈 칸에 차례로` : ''}</span>`
            + `<div class="dkz-pick dkt-pick"><img src="${im ? htmlEsc(im.src) : ''}" alt="">`
            + S.map((r, i) => {
                const id = ids[i], e = id && entry(id), pos = `left:${r[0]}%;top:${r[1]}%;width:${r[2] - r[0]}%;height:${r[3] - r[1]}%`;
                return id ? `<button type="button" class="dkt-slot full" style="${pos}" disabled title="찬 칸">${e && e.th ? `<i style="background-image:url('${htmlEsc(e.th)}')"></i>` : ''}<b>${i + 1}</b></button>`
                    : `<button type="button" class="dkt-slot" style="${pos}" onclick="closeMsg('s${i}')" title="${i + 1}번째 칸"><b>${i + 1}</b></button>`;
            }).join('') + '</div>';
        const a = document.getElementById('customAlertConfirmBtn'); if (a) a.style.display = 'none';
        let r; try { r = await showAsk(html, '', '취소'); } finally { if (a) a.style.display = ''; }
        return typeof r === 'string' && r[0] === 's' ? +r.slice(1) : -1;
    }
    /* 🔁 옮기기 (도련 11-11 · js/deskmove.js) : from = { u, i } (정리함 칸) 또는 null (서랍) · hit = { u, i } 칸 또는 null (= 서랍으로) → true = 옮겼어요
         칸이 차 있으면 서로 바꿔요 (서랍에서 온 것은 바꾸지 않고 '찬 칸') */
    function put(id, from, hit) {
        const M = read();
        if (hit) {
            if (from && hit.u === from.u && hit.i === from.i) return false;
            const to = (M[hit.u] || []).slice(), o0 = to[hit.i] || null, other = o0 && T.list && !entry(o0) ? null : o0;   // 다 쓴 · 버린 롤 칸 = 빈 칸
            if (other && !from) { showMsg('🎀 이미 테이프가 꽂힌 칸이에요.<br><small>빈 칸에 꽂아요</small>'); return false; }
            while (to.length <= hit.i) to.push(null);
            if (from && from.u === hit.u) { to[hit.i] = id; to[from.i] = other; M[hit.u] = to; }
            else { to[hit.i] = id; M[hit.u] = to; if (from) { const f = (M[from.u] || []).slice(); f[from.i] = other; M[from.u] = f; } }
        } else if (from) { const f = (M[from.u] || []).slice(); f[from.i] = null; M[from.u] = f; }
        else return false;
        write(M); paint(); return true;
    }
    /* 🎀 빈 칸 톡 = 서랍(정리함에 없는 테이프)에서 하나 골라 꽂기 */
    async function fill(el, i) {
        if (!T.list) { load(true); showMsg('🎀 테이프 목록을 읽는 중이에요.<br><small>잠시 뒤 다시 눌러 주세요</small>'); return; }
        const H = held(), L = T.list.filter(e => e && e.id && !H.has(e.id) && (e.q0 ? e.q > 0 : true) && !(window.dsHas && dsHas(e.id)));
        if (!L.length) { showMsg('🎀 서랍에 꽂을 마스킹테이프가 없어요.'); return; }
        const html = `🎀 <b>${i + 1}번째 칸</b>에 꽂을 테이프를 골라요<br><span style="font-size:12px;color:#777;">서랍(마스킹테이프 칸)에 있는 테이프예요</span><div class="dkt-pickl">`
            + L.map((e, k) => `<button type="button" onclick="closeMsg('t${k}')" title="${htmlEsc(e.nm || '마스킹테이프')}"><i style="background-image:url('${htmlEsc(e.th || '')}')"></i></button>`).join('') + '</div>';
        const a = document.getElementById('customAlertConfirmBtn'); if (a) a.style.display = 'none';
        let r; try { r = await showAsk(html, '', '취소'); } finally { if (a) a.style.display = ''; }
        if (typeof r !== 'string' || r[0] !== 't') return;
        const e = L[+r.slice(1)]; if (e && put(e.id, null, { u: el.dataset.u, i })) dkbPulse(el);
    }
    window.dktApi = { slotAt, put, isRack, held, paint: () => paint() };
    /* 🛍️ 봉투 카드를 정리함에 (js/desk.js dkbHome 맨 앞) : 처리했으면 true · 칸은 고르는 창에서 (도련 11-04) */
    window.dktDrop = (t, it, n, j, cx, cy) => {
        if (!isRack(t)) return false;
        if (it.k !== 'tape' || !Array.isArray(it.s) || !it.s.length) { showMsg(`🎀 ${htmlEsc(dkName(DK.items.find(x => x.u === t.dataset.u)) || '마테 정리함')}에는 마스킹테이프만 꽂을 수 있어요.`); return true; }
        const S = slotsOf(t), now = () => { const ids = (read()[t.dataset.u] || []).slice(0, S.length).map(id => id && T.list && T.fresh && T.list.length && !entry(id) ? null : id); while (ids.length < S.length) ids.push(null); return ids; };   // 다 쓴 · 버린 롤 칸 = 빈 칸 (방금 새로 읽은 목록일 때만)
        const freeOf = ids => ids.map((v, i) => v ? -1 : i).filter(i => i >= 0), full = f => showMsg(`🎀 마테 정리함 칸이 ${f ? `${f}칸밖에 안 남았어요` : '다 찼어요'}.<br><span style="font-size:12px;color:#777;">다른 정리함이나 서랍에 넣어요 · 🛠 책상 꾸미기에서 롤을 빼면 칸이 생겨요</span>`);
        let ids = now(); if (freeOf(ids).length < it.s.length) { full(freeOf(ids).length); return true; }
        (async () => {
            const s = await pickSlot(t, ids, it.s.length); if (s < 0) return;
            ids = now(); const free = freeOf(ids);                                // 고르는 동안 바뀌었을 수도 있어요
            if (ids[s] || free.length < it.s.length) { full(free.length); return; }
            const order = [s].concat(free.filter(i => i > s), free.filter(i => i < s));   // 고른 칸부터 오른쪽으로 · 모자라면 앞쪽 빈 칸
            try { const w = who(), L = await ownList(true, 'tape'); if (w === who() && Array.isArray(L)) { T.list = L; T.who = w; T.fresh = true; } } catch (e) {}   /* 🔑 방금 받은 테이프가 든 목록으로 (도련 11-04 고침 : 받기 전에 읽은 목록엔 없어서 안 보였고 · 목록이 있으면 '없는 테이프' 로 빠졌어요) */
            const M = read(); it.s.forEach((id, k) => { ids[order[k]] = id; }); M[t.dataset.u] = ids; write(M);
            dkbTake(n, j); dkbPulse(t); paint();
        })();
        return true;
    };
    /* 🎁 처음 선물 테이프를 정리함에 (도련 11-04 · js/desk.js giftEnsure) : 책상 위 정리함마다 상품 '처음담기' 칸 그대로 (도련 11-06 · 정리함이 여럿이어도 · 어느 정리함에도 없는 롤은 스티커 서랍에만) */
    /* 🎁 처음 선물 롤 먼저 보이기 (도련 11-04 : 보이는 것부터 빨리 · 드라이브 저장은 뒤에서) : items = [{ tmp, th, q0 }] → 빈 칸에 임시 롤 (화면에만)
       → 저장이 끝나면 dktStarterReal(tmp, 진짜 id) = 그 칸에 진짜 롤로 저장 (목록에 들어오기 전에도 같은 모습) · 못 받으면 dktStarterDrop(tmp) */
    window.dktStarterShow = items => {
        const M = read(), left = items.slice(); let k = 0;
        document.querySelectorAll('#deskStage .desk-item').forEach(el => {
            const F = isRack(el) ? dkDef(el).firstIn : null; if (!Array.isArray(F)) return;   // 🎁 정리함 상품 '처음담기' = [칸마다 테이프 상품 id]
            const S = slotsOf(el), cur = (M[el.dataset.u] || []).slice(0, S.length), ov = T.ov[el.dataset.u] = (T.ov[el.dataset.u] || []).slice(0, S.length);
            for (let i = 0; i < S.length; i++) {
                const at = F[i] ? left.findIndex(it => it.pid === F[i]) : -1; if (at < 0 || cur[i] || ov[i]) continue;
                const it = left.splice(at, 1)[0]; ov[i] = it.tmp; k++; T.tmp.set(it.tmp, { id: it.tmp, k: 'tape', th: it.th, q: it.q0, q0: it.q0, u: [] });
            }
        });
        paint(); return k;
    };
    window.dktStarterReal = (tmp, sid) => {
        const e = T.tmp.get(tmp); if (e) T.tmp.set(sid, Object.assign({}, e, { id: sid }));   // 목록에 들어올 때까지 같은 모습
        T.tmp.delete(tmp); (T.wait.get(tmp) || []).forEach(ok => ok(sid)); T.wait.delete(tmp);   // 누르고 기다리던 롤 = 이제 꺼내요
        for (const u in T.ov) { const i = T.ov[u].indexOf(tmp); if (i < 0) continue; T.ov[u][i] = null; const M = read(), cur = (M[u] || []).slice(); while (cur.length <= i) cur.push(null); if (!cur[i]) { cur[i] = sid; M[u] = cur; write(M); } }
        paint();
    };
    window.dktStarterDrop = tmp => { T.tmp.delete(tmp); (T.wait.get(tmp) || []).forEach(ok => ok(null)); T.wait.delete(tmp); for (const u in T.ov) { const i = T.ov[u].indexOf(tmp); if (i >= 0) T.ov[u][i] = null; } paint(); };
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['desktape'] = true;
