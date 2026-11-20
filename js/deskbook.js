/* 말랑달콤 다이어리 - js/deskbook.js
   🗄️ 📔 📒 책 서랍 (도련 11-20 · 💻 📲 책상 · 문구처럼 현실처럼)
   - 서랍장 칸 = 📔 다이어리 서랍 (날짜형바인더 · 날짜형노트 · 페이지바인더 · 페이지노트 · 빈 것 · 쓴 것 섞어서) / 📒 스티커첩 서랍 (스티커바인더 · 이형지북 · 새것 · 채운 것 섞어서)
     · 다이어리와 스티커첩은 한 칸에 섞지 않아요 (다이어리 = 끝난 결과물 · 스티커첩 = 다꾸할 준비 · 도련 11-20)
     · 칸 여러 개 (칸마다 넣은 책만 · 한 칸에 하나씩도 · '한 창 = 한 자리'의 예외 · 칸 이름 = js/desk.js dkSlotK 'dy.칸' · 'ab.칸')
   - 넣기 = 책상 위 책을 끌어 서랍장에 놓기 · 🛍️ 봉투 카드를 서랍장에 놓기 · 서랍이 열려 있으면 그 서랍 창 안에 놓기 → 칸을 골라요 (빈 칸 · 같은 종류 칸만 · 문구 · 스티커 칸은 못 골라요)
     · 다른 종류 책 칸에 넣으면 = 칸을 바꿀지 묻고 → 안에 있던 책은 🗄️ 다른 서랍 고르기 / 📚 책상 위로
     · 빈 칸에 처음 넣은 책이 그 칸 종류를 정해요
   - 빼기 = 서랍을 열고 (서랍장 칸 톡) 책을 끌어 책상에 놓기 (놓은 자리) · 톡 = 꺼내서 펼치기
   - 📔 지금 펼쳐 쓰는 다이어리(dkyCur)는 넣을 수 없어요 (책상에서 떠오르고 내려앉는 그림이 그 권이라서 · 늘 책상에)
   - 💾 저장 = 메모리 'diary_desk_dy' (권마다 한 줄 { in: '서랍장u:칸', p, lb } · 책상 위 = { x, y, p, lb }) → 올릴 때 책상 위 것 = 배치.json · 서랍 속 = 설정/서랍/<서랍장>.json (js/holdfile.js · 1351) · 서랍을 열 때 그 서랍장 파일 한 번 (그 뒤 0번)
     · 빈 것인지 쓴 것인지는 여기 적지 않아요 (다이어리 = 다이어리/_목록.json w · 스티커첩 = 폴더)
     · 칸이 없어지거나 다른 것으로 바뀌면 안의 책은 책상 위로 (dbkSlotGone · js/desk.js dkHomesSet) · 서랍장을 📦 소품함에 넣으면 그동안은 책상 위에 보여요 (다시 꺼내면 서랍 속) */
(function () {
    const KN = { dy: ['📔', '다이어리'], ab: ['📒', '스티커첩'] };
    const DBK = { u: '', s: -1, k: '' };                                          // 지금 열린 책 서랍
    const kindOf = b => b && (b.t === 'bd' || b.t === 'rl') ? 'ab' : 'dy';
    const bookOf = id => dkvEvery().find(x => x.id === id) || null;
    const say = (h) => { if (window.showMsg) showMsg(h); };
    const save = M => { if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M); };
    function slotOk(u, s, k) {                                                    // 책상 위 서랍장의 그 칸이 그 종류 책 서랍이에요
        const o = DK.items.find(x => x.u === u); if (!o || o.at !== 'desk') return false;
        return (dkHomes()[u] || []).some(e => e.s === +s && dkBk(e.k) === k);
    }
    const inOf = id => { const v = dkyMap()[id]; return v && typeof v === 'object' && typeof v.in === 'string' ? v.in : ''; };
    /* 그 권이 든 서랍 'u:칸' (없거나 칸이 맞지 않으면 '' = 책상 위) */
    function dbkIn(id, b) { const p = inOf(id); if (!p) return ''; const [u, s] = p.split(':'); b = b || bookOf(id); return b && slotOk(u, s, kindOf(b)) ? p : ''; }
    const here = (u, s) => { const c = dkyCur(), p = u + ':' + s; return dkvEvery().filter(b => b.id !== c && dbkIn(b.id, b) === p); };
    function setIn(id, p) {                                                       // 서랍에 넣어요 (봉투에서 왔으면 봉투에서도 빼요)
        const M = dkyMap(), o = M[id] && typeof M[id] === 'object' ? M[id] : {};
        M[id] = Object.assign({ in: p }, o.p ? { p: o.p } : {}, o.lb ? { lb: o.lb } : {}, o.a ? { a: o.a } : {});   // a = 📒 🤍 사본 (desk.js dkAlbCopies)
        if (Array.isArray(M._bag)) { M._bag = M._bag.filter(x => x !== id); if (!M._bag.length) delete M._bag; }
        save(M);
    }
    function takeOut(id) {                                                        // 서랍에서 꺼내 책상 다이어리 줄에 (이름표 · 모습 그대로)
        const M = dkyMap(), o = M[id]; if (!o || typeof o !== 'object' || !o.in) return;
        const keep = Object.assign({}, o.p ? { p: o.p } : {}, o.lb ? { lb: o.lb } : {}, o.a ? { a: o.a } : {}); M[id] = keep; save(M);
        const at = dkyPosOf(id), M2 = dkyMap(); M2[id] = Object.assign({}, at, keep, { p: keep.p || at.p }); save(M2);
    }
    const fits = t => { const o = t && DK.items.find(x => x.u === t.dataset.u); return !!o && o.at === 'desk' && !!dkSlots(o.id) && (dkHoldOk(o.id).includes('dy') || dkHoldOk(o.id).includes('ab')); };
    const chestAt = (x, y) => document.elementsFromPoint(x, y).filter(e => !e.closest('.dkm-ghost, .dkm-fly')).map(e => e.closest('#deskStage .desk-item')).find(Boolean) || null;
    const can = k => (i, c) => !c || !!dkBk(c.k);                                // 빈 칸 · 책 칸만 (✏️ 문구 · 🏷️ 스티커 칸은 그대로)
    async function newSlot(u, s, k, tag) {                                        // 칸을 그 종류 책 서랍으로 (tag = 바뀌기 전 칸 이름표)
        const o = DK.items.find(x => x.u === u), S = o && dkSlots(o.id); if (!S) return '';
        const kk = dkSlotK(k, s), H = dkHomes(); H[u] = (H[u] || []).filter(e => e.s !== s); H[u].push(Object.assign({ k: kk, s, r: S[s] }, tag ? { tag } : {})); dkHomesSet(H);
        return kk;
    }
    /* 안에 있던 책 옮기기 (칸을 다른 종류로 바꿀 때) : 🗄️ 다른 서랍 고르기 (빈 칸 · 같은 종류 칸) / 📚 책상 위로 · false = 그만두기 */
    async function moveAll(L, k, u0, s0) {
        const [ic, K] = KN[k];
        const r = await showPick(`${ic} 안에 있던 ${K} ${L.length}권은 어디에 둘까요?`, ['🗄️ 다른 서랍 고르기', '📚 책상 위로']);
        if (r < 0) return false; if (r === 1) return true;                     // 책상 위로 = 칸이 바뀌면 저절로 (dbkSlotGone)
        const ok = (o, i, c) => !(o.u === u0 && i === s0) && (!c || dkBk(c.k) === k);
        const C = dkOnDesk().filter(o => dkSlots(o.id) && dkHoldOk(o.id).includes(k) && dkSlots(o.id).some((x, i) => ok(o, i, (dkHomes()[o.u] || []).find(e => e.s === i)))).sort((a, b) => (b.u === u0) - (a.u === u0));
        if (!C.length) { await showMsg(`🗄️ 옮길 빈 서랍이 없어요.<br><small>${ic} ${K}는 책상 위로 꺼내 둘게요</small>`); return true; }
        for (let i = 0; ; i = (i + 1) % C.length) {
            const o = C[i], t = document.querySelector(`#deskStage .desk-item[data-u="${o.u}"]`); if (!t) return true;
            const s = await dkzChoose(t, o, k, { can: (j, c) => ok(o, j, c), ask: `${ic} 안에 있던 <b>${htmlEsc(josa(K, '을', '를'))}</b> 어느 서랍으로 옮길까요?`, no: '📚 책상 위로', more: C.length > 1 ? '다른 서랍장' : '' });
            if (s === 'more') continue; if (typeof s !== 'number' || s < 0) return true;
            const cur = (dkHomes()[o.u] || []).find(e => e.s === s); if (!cur) await newSlot(o.u, s, k);
            L.forEach(id => setIn(id, o.u + ':' + s)); dkbPulse(t); return true;
        }
    }
    /* ✋ 넣기 : 그 서랍장에서 칸을 골라요 (열린 그 종류 서랍이 이 서랍장이면 = 바로 거기) → true = 넣었어요 */
    async function dbkPut(id, t, k) {
        const o = t && DK.items.find(x => x.u === t.dataset.u), S = o && dkSlots(o.id); k = k || kindOf(bookOf(id));
        const [ic, K] = KN[k];
        if (!S || !dkHoldOk(o.id).includes(k)) { say(`${ic} ${htmlEsc(josa(K, '은', '는'))} <b>${htmlEsc(o ? dkName(o) : '이 소품')}</b>에 넣을 수 없어요.`); return false; }
        if (id === dkyCur()) { say('📔 지금 펼쳐 쓰는 다이어리는 서랍에 넣을 수 없어요.<br><small>다른 다이어리를 펼친 뒤 넣어요</small>'); return false; }
        if (window.hfReady) { try { await hfReady(o.u); } catch (e) { say('🗄️ 서랍을 못 열었어요.<br><small>잠시 뒤에 다시 해 주세요</small>'); return false; } }   // 🗄️ 그 서랍장에 이미 든 책을 알아야 해요 (칸 바꾸기 · js/holdfile.js)
        const u = o.u, nm = dkName(o), Z = dkHomes()[u] || [];
        if (!S.some((r, i) => can(k)(i, Z.find(e => e.s === i)))) { say(`🗄️ <b>${htmlEsc(nm)}</b>에는 ${ic} ${htmlEsc(josa(K, '을', '를'))} 넣을 서랍이 없어요.<br><small>빈 서랍이나 📔 📒 책 서랍에만 넣어요</small>`); return false; }
        const s = DBK.u === u && DBK.k === k && trayOn() ? DBK.s : await dkzChoose(t, o, k, { can: can(k) });
        if (typeof s !== 'number' || s < 0) return false;
        const cur = (dkHomes()[u] || []).find(e => e.s === s); let made = '';
        if (cur && dkBk(cur.k) !== k) {                                        // 다른 종류 책 칸 = 칸을 바꿀까요? → 안의 책은 다른 서랍 · 책상 위로
            const k2 = dkBk(cur.k), [ic2, K2] = KN[k2];
            if (!await showAsk(`${dkSlotNm(s, S.length)} 서랍은 ${ic2} ${K2} 서랍이에요.<br>${ic} ${htmlEsc(josa(K, '으로', '로'))} 바꿀까요?<br><span style="font-size:12px;color:#777;">다이어리와 스티커첩은 한 서랍에 같이 넣지 않아요</span>`, '바꾸기', '취소')) return false;
            const L = here(u, s).map(b => b.id);
            if (L.length && !await moveAll(L, k2, u, s)) return false;
            const g = cur.tag ? Object.assign({}, cur.tag, cur.tag.t === K2 ? { t: K } : {}) : null;   // 🏷 칸 이름표가 종류 이름이면 새 종류로
            made = await newSlot(u, s, k, g); dknPaintAll();
        } else if (!cur) made = await newSlot(u, s, k);
        setIn(id, u + ':' + s);
        dkDeskBooks(); dknPaintAll(); deskFnPaint(); dkbPulse(t); trayPaint();
        if (made && !cur && !DK.edit && await showAsk(`🏷 ${dkSlotNm(s, S.length)} 칸에 이름표를 붙일까요?<br><span style="font-size:12px;color:#777;">어느 서랍인지 잊지 않게요 · 🛠 책상 꾸미기에서 바꿀 수 있어요</span>`, '붙이기', '안 붙이기')) { dkzTagOn(u, made); setTimeout(() => dknPanel(u + '|' + made), 50); }
        return true;
    }
    /* ✋ 끌어 놓았어요 (책상 위 책 · 서랍 속 책) : 열린 서랍 창 안 = 그 서랍 · 서랍장 위 = 칸 고르기 · 그 밖 = 넣지 않아요 → true = 넣었어요 */
    async function dbkDrop(id, x, y) {
        const b = bookOf(id); if (!b || DK.edit) return false;
        const k = kindOf(b), box = trayBox();
        if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
            const t = document.querySelector(`#deskStage .desk-item[data-u="${DBK.u}"]`);
            if (DBK.k !== k) { const [ic, K] = KN[k], [ic2, K2] = KN[DBK.k]; say(`${ic2} 이 서랍은 ${K2} 서랍이에요.<br><small>${ic} ${htmlEsc(josa(K, '은', '는'))} 빈 서랍이나 ${ic} ${K} 서랍에 넣어요</small>`); return false; }
            if (dbkIn(id, b) === DBK.u + ':' + DBK.s) return false;
            return t ? dbkPut(id, t, k) : false;
        }
        const t = chestAt(x, y); if (!t || !fits(t)) return false;
        return dbkPut(id, t, k);
    }
    /* 칸이 없어지거나 다른 것으로 바뀌었어요 (js/desk.js dkHomesSet) : 그 칸에 있던 책 = 책상 위로 (지워지지 않아요) */
    function dbkSlotGone(was, v) {
        if (!was || typeof was !== 'object') return;
        const M = dkyMap(); let ch = false, row = 1;
        const kAt = (H, u, s) => ((H && Array.isArray(H[u]) ? H[u] : []).find(e => e && e.s === s) || {}).k;
        Object.keys(M).forEach(id => {
            const o = M[id]; if (!o || typeof o !== 'object' || typeof o.in !== 'string') return;
            const [u, s] = o.in.split(':'); if (!DK.items.some(x => x.u === u)) return;   // 모르는 서랍장 (목록을 아직 안 읽었어요) = 그대로
            const k0 = dkBk(kAt(was, u, +s)); if (!k0 || k0 === dkBk(kAt(v, u, +s))) return;
            delete o.in; Object.assign(o, (({ x, y, p }) => ({ x, y, p: o.p || p }))(dkyRow(row++))); ch = true;   // 📚 책상 다이어리 줄에 (하나씩 옆으로)
        });
        if (ch) { save(M); dkDeskBooks(); trayPaint(); }
    }

    /* ---------- 🗄️ 서랍 창 (서랍장 칸 톡 → 서랍이 열리며 위에서 내려와요 · js/desk.js dkDrawerPull) ---------- */
    const trayEl = () => document.getElementById('dbkTray');
    const trayOn = () => { const r = trayEl(); return !!r && !r.hidden && !!DBK.u; };
    const trayBox = () => { if (!trayOn()) return null; const d = trayEl().querySelector('.dkw-drawer'); return d ? d.getBoundingClientRect() : null; };
    function room() {
        let r = trayEl(); if (r) return r;
        r = document.createElement('div'); r.id = 'dbkTray'; r.className = 'dkw-room'; r.hidden = true;
        r.addEventListener('pointerdown', e => {
            if (e.target !== r) return;
            const v = document.elementsFromPoint(e.clientX, e.clientY).map(x => x.closest('#deskStage .dk-vol')).find(Boolean);
            if (v && e.button <= 0) { volGrab(e, v); return; }                    // ✋ 서랍이 열린 채 책상 위 책을 끌어 이 서랍 창에 넣기
            if (window.dkDrawerOwns && dkDrawerOwns(r) && window.deskTapAt && deskTapAt(e.clientX, e.clientY)) return; shut();   // 창 밖 = 그 자리 책상 톡 (다른 서랍처럼)
        });
        document.body.appendChild(r); return r;
    }
    function volGrab(ev, v) {                                                     // 끌면 = 손에 들고 놓은 곳에 (dbkDrop) · 톡 = 서랍 닫기 (예전처럼 창 밖 톡)
        ev.preventDefault(); const x0 = ev.clientX, y0 = ev.clientY;
        const mv = e => { if (e.pointerId !== ev.pointerId || Math.hypot(e.clientX - x0, e.clientY - y0) < 10) return; off(); dkCarry(v, e, (x, y) => dbkDrop(v.dataset.b, x, y)); };
        const up = e => { if (e.pointerId !== ev.pointerId) return; off(); if (e.type === 'pointerup') shut(); };
        const off = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    }
    function shut() { const r = trayEl(); if (!r || r.hidden) return; if (window.dkDrawerOwns && dkDrawerOwns(r)) { dkDrawerShut(true); return; } dbkClose(); }
    function dbkClose() {
        const r = trayEl(); DBK.u = ''; DBK.s = -1; if (!r) return;
        r.classList.remove('show'); r.hidden = true; r.innerHTML = '';
        if (!document.querySelector('.dkw-room:not([hidden])')) document.documentElement.classList.remove('dkw-on');
    }
    async function dbkOpen(u, s) {
        if (window.hfReady) { try { await hfReady(u); } catch (e) { say('🗄️ 서랍을 못 열었어요.<br><small>잠시 뒤에 다시 열어 주세요</small>'); return; } }   // 🗄️ 그 서랍장 파일 (한 번 · js/holdfile.js)
        s = +s; const o = DK.items.find(x => x.u === u), S = o && dkSlots(o.id), e = (dkHomes()[u] || []).find(x => x.s === s), k = e && dkBk(e.k); if (!S || !k) return;
        const [ic, K] = KN[k], r = room();
        DBK.u = u; DBK.s = s; DBK.k = k;
        r.innerHTML = `<div class="dkw-drawer dbk-drawer"><div class="dkw-dtop"><b>${ic} ${K} 서랍</b><small>${htmlEsc(dkName(o))} ${dkSlotNm(s, S.length)} 칸</small><button type="button" class="dkw-dx" aria-label="닫기">✕</button></div>`
            + `<div class="dkw-din" id="dbkIn"></div><div class="dkw-dfront"><span class="dkw-lbl">${ic} ${K}</span><i class="dkw-knob"></i></div><div class="dkw-foot"><span>톡 = 꺼내서 펼치기 · 끌어서 책상에 놓기</span></div></div>`;
        r.querySelector('.dkw-dx').onclick = shut;
        if (window.dkSlotPaint) dkSlotPaint(r.querySelector('.dkw-drawer'), e.k, u, s, [248, 191, 205]);   // 🎨 서랍 색 = 그 칸 색 (문구함 · 스티커 서랍과 같은 함수)
        r.hidden = false; requestAnimationFrame(() => r.classList.add('show')); document.documentElement.classList.add('dkw-on');
        trayPaint();
    }
    function trayPaint() {
        const inn = document.getElementById('dbkIn'); if (!inn || !trayOn()) return;
        const [ic, K] = KN[DBK.k], L = here(DBK.u, DBK.s), H = 112;
        inn.innerHTML = L.length ? '' : `<div class="dkw-none">${ic} 서랍이 비었어요<br><small>책상 위 ${htmlEsc(josa(K, '을', '를'))} 끌어다 이 서랍장에 넣어요</small></div>`;
        L.forEach(b => {
            const v = Object.assign({}, dkyMap()[b.id] || {}, { p: 'front', x: 0, y: 0 }), [w, h] = dkvSz(b, 'front'), z = H / h;
            const vol = dkvMake(b, v, false); vol.style.left = '0px'; vol.style.top = '0px'; vol.removeAttribute('role');
            const it = document.createElement('div'); it.className = 'dbk-it'; it.dataset.b = b.id; it.title = `${dkvIc(b)} ${dkvName(b)}`;
            it.innerHTML = `<span class="dbk-art" style="width:${Math.round(w * z)}px;height:${H}px"><span class="dbk-in" style="width:${w}px;height:${h}px;transform:scale(${z.toFixed(3)})"></span></span><b>${dkvIc(b)} ${htmlEsc(dkvName(b))}</b>`;
            it.querySelector('.dbk-in').appendChild(vol);
            it.addEventListener('pointerdown', ev => grab(ev, it, b));
            inn.appendChild(it);
        });
    }
    function grab(ev, it, b) {                                                    // 톡 = 꺼내서 펼치기 · 끌기 = 손에 들고 놓은 곳에
        if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
        const x0 = ev.clientX, y0 = ev.clientY, art = it.querySelector('.dbk-art');
        const mv = e => {
            if (e.pointerId !== ev.pointerId || Math.hypot(e.clientX - x0, e.clientY - y0) < 8) return;
            off(); if (window.buzz) buzz(12);
            dkCarry(art, e, async (x, y) => {
                const box = trayBox(); if (box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return;   // 서랍 안 = 그대로
                const t = chestAt(x, y);
                if (t && fits(t)) { if (await dbkPut(b.id, t, kindOf(b))) trayPaint(); return; }
                if (dkvPlace(b.id, x, y)) trayPaint();                            // 📚 놓은 자리에 (책상)
            });
        };
        const up = e => { if (e.pointerId !== ev.pointerId) return; off(); if (e.type === 'pointerup') { takeOut(b.id); dkDeskBooks(); shut(); setTimeout(() => dkVolOpen(b.id), 360); } };   // 톡 = 꺼내서 펼치기
        const off = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && trayOn() && !document.querySelector('.modal[style*="flex"]')) { e.stopPropagation(); shut(); } }, true);

    window.dbkIn = dbkIn; window.dbkPut = dbkPut; window.dbkDrop = dbkDrop; window.dbkFits = fits; window.dbkSlotGone = dbkSlotGone;
    window.dbkOpen = dbkOpen; window.dbkClose = dbkClose; window.dbkHere = here;
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskbook'] = true;
