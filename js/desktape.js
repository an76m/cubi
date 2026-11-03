/* 말랑달콤 다이어리 - js/desktape.js
   🎀 마테 정리함 (도련 11-03 · 💻 📲 책상 · 현실처럼 : 다꾸러들은 마스킹테이프를 꺼내 세워 두고 골라 써요)
   - 책상소품 종류 'taperack' (상품공방 '마테 정리함') · 칸 = 상품 '소품.slots' (그림 위 세로 칸 · [왼, 위, 오른, 아래] %) · 앞벽 그림이 있으면 앞 가로대가 롤 앞을 가려요
   - 🛍️ 봉투의 마스킹테이프 카드를 정리함에 끌어다 놓으면 = 놓은 칸(비었으면) 또는 빈 칸부터 꽂혀요 · 칸이 모자라면 안 들어가요 (봉투에 그대로)
   - 꽂힌 롤 = 옆모습 (그 테이프 무늬 · 남은 길이만큼 지름이 줄어요) · 톡 = 다이어리를 펴고 바로 페이지에 붙여요 (정리함엔 그대로)
   - 🛠 책상 꾸미기에서만 : 롤을 끌어 다른 칸 · 다른 정리함으로 (차 있으면 서로 바꿔요) · 정리함 밖에 놓으면 서랍(마스킹테이프 칸)으로
   - 정리함에 꽂힌 테이프는 바구니 · 서랍 마스킹테이프 칸에 안 보여요 (js/desk.js deskBagHold 의 s 에 더해요 · 한 곳에만 있어요)
   - 저장 : 'diary_desk_tape' { 소품 u: [칸마다 테이프 id | null] } (게스트 'malang_desk_tape') */
(function () {
    const DKT_KEY = 'diary_desk_tape', DKT_L = 'malang_desk_tape';
    const T = { list: null, loading: false, drag: null, fresh: false };   // fresh = 방금 새로 읽은 목록 (없는 테이프를 뺄 때만)
    const desk = () => document.documentElement.classList.contains('desk-on');
    const read = () => { const v = typeof prefGet === 'function' ? prefGet(DKT_KEY, DKT_L) : null; return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; };
    const write = v => { if (typeof prefSet === 'function') prefSet(DKT_KEY, DKT_L, v); };
    const isRack = el => !!el && dkDef(el).kind === 'taperack';
    const slotsOf = el => (dkDef(el).slots || []).filter(r => Array.isArray(r) && r.length === 4);
    const entry = id => (T.list || []).find(e => e.id === id) || null;
    function load(force) {                                                    // 테이프 무늬 · 남은 길이 = 내 스티커 목록 (js/own.js)
        if ((T.list && !force) || T.loading || !window.ownList) return;
        T.loading = true;
        ownList(!!force).then(L => { T.list = Array.isArray(L) ? L : []; T.fresh = !!force; paint(); }).catch(() => {}).finally(() => { T.loading = false; });
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
            const S = slotsOf(el), ids = (M[el.dataset.u] || []).slice(0, S.length);
            if (T.list) ids.forEach((id, i) => { if (id && !entry(id)) { if (T.fresh) { ids[i] = null; dirty = true; } else load(true); } });   // 버렸거나 없어진 테이프는 빼요 (목록을 새로 읽고 나서만 · 방금 받은 것은 아직 목록에 없을 수 있어요)
            if (dirty) M[el.dataset.u] = ids;
            const img = el.querySelector(':scope > img'), d = dkDef(el);
            const iw = parseFloat(el.style.width) || el.offsetWidth, ih = parseFloat(el.style.height) || el.offsetHeight;
            host.innerHTML = S.map((r, i) => {
                const id = ids[i]; if (!id || (T.list && !entry(id))) return '';
                const e = entry(id), q = e && e.q0 ? Math.max(.25, Math.min(1, e.q / e.q0)) : 1, th = e && e.th ? e.th : '';
                const H = (r[3] - r[1]) * (.55 + .45 * q), W = (r[2] - r[0]) * .86;   // 남은 길이만큼 지름이 줄어요
                return `<button type="button" class="dkt-roll" data-i="${i}" data-id="${htmlEsc(id)}" title="🎀 마스킹테이프" style="left:${(r[0] + (r[2] - r[0] - W) / 2).toFixed(2)}%;top:${(r[3] - H).toFixed(2)}%;width:${W.toFixed(2)}%;height:${H.toFixed(2)}%"><i style="width:${(H / 100 * ih).toFixed(1)}px;height:${(W / 100 * iw).toFixed(1)}px;background-image:url(&quot;${htmlEsc(th)}&quot;)"></i></button>`;   // 무늬 = 테이프 결 그대로 세로로 (롤 둘레)
            }).join('') + (d.front && img ? `<i class="dkt-front"><i style="--fm:url('${htmlEsc(new URL(d.front, location.href).href)}')"><img src="${htmlEsc(img.src)}" alt="" draggable="false"></i></i>` : '');
            host.querySelectorAll('.dkt-roll').forEach(b => wire(b, el));
        });
        if (dirty) write(M);
        if (!T.list) load();
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
    async function use(id, b) {                                               // 🎀 톡 = 다이어리를 펴고 바로 페이지에 (정리함엔 그대로)
        if (b) { b.classList.remove('dkt-pick'); void b.offsetWidth; b.classList.add('dkt-pick'); }
        if (!window.dkwReady || !await dkwReady()) return;
        try {
            const r = window.ownSheet ? await ownSheet(id) : null;
            if (!r) { showMsg('🎀 이 테이프는 다 썼어요.'); return; }
            if (window.placeTape) placeTape(r.s.imgs[0], { id });
        } catch (e) { console.warn(e); showMsg('⚠ 테이프를 꺼내지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); }
    }
    /* 🛍️ 봉투 카드를 정리함에 (js/desk.js dkbHome 맨 앞) : 처리했으면 true */
    window.dktDrop = (t, it, n, j, cx, cy) => {
        if (!isRack(t)) return false;
        if (it.k !== 'tape' || !Array.isArray(it.s) || !it.s.length) { showMsg(`🎀 ${htmlEsc(dkName(DK.items.find(x => x.u === t.dataset.u)) || '마테 정리함')}에는 마스킹테이프만 꽂을 수 있어요.`); return true; }
        const S = slotsOf(t), M = read(), ids = (M[t.dataset.u] || []).slice(0, S.length); while (ids.length < S.length) ids.push(null);
        const free = ids.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        if (free.length < it.s.length) { showMsg(`🎀 마테 정리함 칸이 ${free.length ? `${free.length}칸밖에 안 남았어요` : '다 찼어요'}.<br><span style="font-size:12px;color:#777;">다른 정리함이나 서랍에 넣어요 · 🛠 책상 꾸미기에서 롤을 정리함 밖으로 빼면 서랍으로 가요</span>`); return true; }
        const hit = slotAt(cx, cy), order = hit && hit.u === t.dataset.u && !ids[hit.i] ? [hit.i].concat(free.filter(i => i !== hit.i)) : free;   // 놓은 칸부터
        it.s.forEach((id, k) => { ids[order[k]] = id; });
        M[t.dataset.u] = ids; write(M);
        dkbTake(n, j); dkbPulse(t); paint();
        return true;
    };
    document.addEventListener('prod-change', () => window.dktPaint());
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['desktape'] = true;
