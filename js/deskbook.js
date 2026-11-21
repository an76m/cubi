/* 말랑달콤 다이어리 - js/deskbook.js
   🗄️ 📔 📒 책 서랍 (도련 11-20 · 💻 📲 책상 · 문구처럼 현실처럼)
   - 서랍장 칸 = 📔 다이어리 서랍 (날짜형바인더 · 날짜형노트 · 페이지바인더 · 페이지노트 · 빈 것 · 쓴 것 섞어서) / 📒 스티커첩 서랍 (스티커바인더 · 이형지북 · 새것 · 채운 것 섞어서)
     · 다이어리와 스티커첩은 한 칸에 섞지 않아요 (다이어리 = 끝난 결과물 · 스티커첩 = 다꾸할 준비 · 도련 11-20)
     · 🗄️ 종류마다 서랍 하나만 (도련 11-21 · 1364 · ✏️ 문구함 · 🏷️ 스티커처럼 · 예전 '칸 여러 개'는 없앴어요 · 칸 이름 = 'dy' · 'ab' · 'bm')
   - 넣기 = 책상 위 책을 끌어 서랍장에 놓기 · 🛍️ 봉투 카드를 서랍장에 놓기 · 서랍이 열려 있으면 그 서랍 창 안에 놓기 → 칸을 골라요 (js/desk.js dkChestPick → dkSlotPut = 모든 종류 같은 길)
     · 다른 것이 든 칸에 넣으면 = 바꿀지 묻고 원래 것은 빈 서랍으로 (안에 든 것째) · 그 종류 서랍이 다른 곳에 있으면 = 옮길지 묻고 안에 든 것째 이리로 (dbkMoveIn)
     · 빈 칸에 처음 넣으면 그 칸이 그 종류 서랍이 돼요
   - 빼기 = 서랍을 열고 (서랍장 칸 톡) 책을 끌어 책상에 놓기 (놓은 자리) · 톡 = 꺼내서 펼치기
   - 📔 지금 펼쳐 쓰는 다이어리(dkyCur)는 넣을 수 없어요 (책상에서 떠오르고 내려앉는 그림이 그 권이라서 · 늘 책상에)
   - 💾 저장 = 메모리 'diary_desk_dy' (권마다 한 줄 { in: '서랍장u:칸', p, lb } · 책상 위 = { x, y, p, lb }) → 올릴 때 책상 위 것 = 배치.json · 서랍 속 = 설정/서랍/<서랍장>.json (js/holdfile.js · 1351) · 서랍을 열 때 그 서랍장 파일 한 번 (그 뒤 0번)
     · 빈 것인지 쓴 것인지는 여기 적지 않아요 (다이어리 = 다이어리/_목록.json w · 스티커첩 = 폴더)
     · 칸이 없어지거나 다른 것으로 바뀌면 안의 책은 책상 위로 (dbkSlotGone · js/desk.js dkHomesSet) · 서랍장을 📦 소품함에 넣으면 그동안은 책상 위에 보여요 (다시 꺼내면 서랍 속)
   - 🧩 표지 · 내지 서랍 (도련 11-20 · 1355) : 바인더 재료(🗂️ 표지 · 📅 날짜 표지 · 📄 내지 · 📅 날짜 내지)만 넣는 칸 'bm' · 다이어리 · 스티커첩과 한 칸에 섞지 않아요 · 책상 위에는 안 놓여요
     · 넣기 = 🛍️ 봉투 카드를 서랍장에 · 열린 🧩 서랍의 [🧺 바구니에서 넣기] (조립 바구니에 있는 재료) · 빼기 = 톡 → 🧩 바인더 조립 바구니로 (조립 방이 열려요) · 끌어서 다른 서랍장 = 옮기기 · 책상에 놓으면 = 못 놓아요 (서랍에 그대로 · 1358)
     · 서랍 속 재료는 🧩 조립 바구니에 안 나와요 (현실처럼 서랍에서 꺼내 써요 · js/dymaker.js dmkRmPool · 서랍장이 📦 소품함에 들어가면 바구니에 보여요)
     · 저장 = 메모리 'diary_desk_dy' 의 { in: '서랍장u:칸', m: 1 } → 서랍장 파일 bm { id: 칸 } (js/holdfile.js) · 재료 목록(_바인더재료목록N.json)에는 적지 않아요 */
(function () {
    const KN = { dy: ['📔', '다이어리'], ab: ['📒', '스티커첩'], bm: ['🧩', '표지 · 내지'] };
    const UNIT = k => k === 'bm' ? '개' : '권';
    /* 🧩 바인더 재료 (표지 · 내지) = 책처럼 서랍에 · 책상에는 없어요 */
    const matOf = id => { const x = window.dymGet && dymGet(id); return x ? Object.assign({ mat: 1 }, window.dmkClean ? (dmkClean(x) || x) : x) : null; };
    const mats = () => { if (!window.dymAll) return []; const H = window.deskBagHold && deskBagHold(), bag = H ? H.d : new Set(); return dymAll('cover').concat(dymAll('refill')).filter(x => !bag.has(x.id)).map(x => Object.assign({ mat: 1 }, window.dmkClean ? (dmkClean(x) || x) : x)); };
    const matReady = () => window.dymReady ? dymReady().catch(e => { console.warn('🧩 재료', e); }) : Promise.resolve();
    const DBK = { u: '', s: -1, k: '' };                                          // 지금 열린 책 서랍
    const kindOf = b => b && b.mat ? 'bm' : b && (b.t === 'bd' || b.t === 'rl') ? 'ab' : 'dy';
    const bookOf = id => dkvEvery().find(x => x.id === id) || matOf(id);
    const say = (h) => { if (window.showMsg) showMsg(h); };
    const save = M => { if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M); };
    function slotOk(u, s, k) {                                                    // 책상 위 서랍장의 그 칸이 그 종류 책 서랍이에요
        const o = DK.items.find(x => x.u === u); if (!o || o.at !== 'desk') return false;
        return (dkHomes()[u] || []).some(e => e.s === +s && dkBk(e.k) === k);
    }
    const inOf = id => { const v = dkyMap()[id]; return v && typeof v === 'object' && typeof v.in === 'string' ? v.in : ''; };
    /* 그 권이 든 서랍 'u:칸' (없거나 칸이 맞지 않으면 '' = 책상 위) */
    function dbkIn(id, b) { const p = inOf(id); if (!p) return ''; const [u, s] = p.split(':'); b = b || bookOf(id); return b && slotOk(u, s, kindOf(b)) ? p : ''; }
    const here = (u, s) => { const c = dkyCur(), p = u + ':' + s; return dkvEvery().concat(mats()).filter(b => b.id !== c && dbkIn(b.id, b) === p); };
    function setIn(id, p) {                                                       // 서랍에 넣어요 (봉투에서 왔으면 봉투에서도 빼요)
        const M = dkyMap(), o = M[id] && typeof M[id] === 'object' ? M[id] : {};
        if (matOf(id)) M[id] = { in: p, m: 1 };                                   // 🧩 재료 = 자리만 (책상 모습이 없어요)
        else M[id] = Object.assign({ in: p }, o.p ? { p: o.p } : {}, o.lb ? { lb: o.lb } : {}, o.a ? { a: o.a } : {});   // a = 📒 🤍 사본 (desk.js dkAlbCopies)
        if (Array.isArray(M._bag)) { M._bag = M._bag.filter(x => x !== id); if (!M._bag.length) delete M._bag; }
        save(M);
    }
    function takeOut(id) {                                                        // 서랍에서 꺼내 책상 다이어리 줄에 (이름표 그대로 · 세워서)
        const M = dkyMap(), o = M[id]; if (!o || typeof o !== 'object' || !o.in) return;
        if (o.m) { delete M[id]; save(M); bndSoon(); return; }                  // 🧩 재료 = 🧺 조립 바구니로
        const keep = Object.assign({}, o.lb ? { lb: o.lb } : {}, o.a ? { a: o.a } : {}); M[id] = keep; save(M);
        const at = dkyPosOf(id), M2 = dkyMap(); M2[id] = Object.assign({}, at, keep, { p: 'front' }); save(M2);   // 꺼내면 = 세워요 (도련 11-21 · 끌어 놓을 때 dkvPlace 와 같아요)
    }
    const bndSoon = () => { if (window.bndRender) bndRender(); };
    const fits = t => { const o = t && DK.items.find(x => x.u === t.dataset.u); return !!o && o.at === 'desk' && !!dkSlots(o.id) && ['dy', 'ab', 'bm'].some(k => dkHoldOk(o.id).includes(k)); };
    const chestAt = (x, y) => document.elementsFromPoint(x, y).filter(e => !e.closest('.dkm-ghost, .dkm-fly')).map(e => e.closest('#deskStage .desk-item')).find(Boolean) || null;
    /* 🗄️ 칸째 옮기기 (js/desk.js dkSlotStuff · 1364) : 그 칸에 든 그 종류 것을 모두 새 칸으로 (두 서랍장 파일을 먼저 읽어요 · 올릴 때 파일도 따라가요) */
    async function dbkMoveIn(k, fu, fs, tu, ts) {
        if (window.hfReady) { try { await hfReady(fu); await hfReady(tu); } catch (e) { return; } }
        if (k === 'bm') await matReady();
        const M = dkyMap(), p0 = fu + ':' + fs; let ch = false;
        Object.keys(M).forEach(id => { const o = M[id]; if (!o || typeof o !== 'object' || o.in !== p0) return; const b = bookOf(id); if (b ? kindOf(b) !== k : (k === 'bm') !== !!o.m) return; o.in = tu + ':' + ts; ch = true; });
        if (ch) { save(M); trayPaint(); }
    }
    /* ✋ 넣기 : 그 서랍장에서 칸을 골라요 (열린 그 종류 서랍이 이 서랍장이면 = 바로 거기) → true = 넣었어요 */
    async function dbkPut(id, t, k, op) {                                         // op.s = 칸을 이미 골랐어요 (봉투 → js/desk.js dkbHome · 열린 서랍 창에 놓기) · 없으면 dkChestPick (칸 고르기 한 길 · 1357)
        const o = t && DK.items.find(x => x.u === t.dataset.u), S = o && dkSlots(o.id); k = k || kindOf(bookOf(id));
        const [ic, K] = KN[k];
        if (!S || !dkHoldOk(o.id).includes(k)) { say(`${ic} ${htmlEsc(josa(K, '은', '는'))} <b>${htmlEsc(o ? dkName(o) : '이 소품')}</b>에 넣을 수 없어요.`); return false; }
        if (k === 'bm') await matReady();                                         // 💤 재료 목록 (켤 때 안 읽어요)
        if (id === dkyCur()) { say('📔 지금 펼쳐 쓰는 다이어리는 서랍에 넣을 수 없어요.<br><small>다른 다이어리를 펼친 뒤 넣어요</small>'); return false; }
        if (window.hfReady) { try { await hfReady(o.u); } catch (e) { say('🗄️ 서랍을 못 열었어요.<br><small>잠시 뒤에 다시 해 주세요</small>'); return false; } }   // 🗄️ 그 서랍장에 이미 든 책을 알아야 해요 (칸 바꾸기 · js/holdfile.js)
        const u = o.u;
        let s = op && op.s != null ? op.s : -1, agreed = !!(op && op.agreed);
        if (s < 0) { const P = await dkChestPick(t, o, k); if (!P) return false; if (P.go) return dbkPut(id, P.go, k); s = P.s; agreed = P.agreed; }
        if (typeof s !== 'number' || s < 0) return false;
        if (!await dkSlotPut(t, o, k, s, agreed)) return false;                 // 🗄️ 그 칸 = 그 종류 서랍 (하나만 · ✏️ 문구 · 🏷️ 스티커와 같은 길 · 다른 곳에 있으면 안에 든 것째 옮겨요 · 1364)
        setIn(id, u + ':' + s);
        dkDeskBooks(); dknPaintAll(); deskFnPaint(); dkbPulse(t); trayPaint(); bndSoon();
        return true;
    }
    /* ✋ 끌어 놓았어요 (책상 위 책 · 서랍 속 책) : 열린 서랍 창 안 · 그 서랍장 위 = 그 서랍 (문구 · 스티커와 같아요) · 다른 서랍장 위 = 칸 고르기 · 그 밖 = 넣지 않아요 → true = 넣었어요 */
    async function dbkDrop(id, x, y) {
        const b = bookOf(id); if (!b || DK.edit) return false;
        const k = kindOf(b);
        if (trayHit(x, y) || (DBK.k === k && trayHit(x, y, true))) {           // 다른 종류를 그 서랍장에 = 아래 칸 고르기
            const t = document.querySelector(`#deskStage .desk-item[data-u="${DBK.u}"]`);
            if (DBK.k !== k) { const [ic, K] = KN[k], [ic2, K2] = KN[DBK.k]; say(`${ic2} 이 서랍은 ${K2} 서랍이에요.<br><small>${ic} ${htmlEsc(josa(K, '은', '는'))} 빈 서랍이나 ${ic} ${K} 서랍에 넣어요</small>`); return false; }
            if (dbkIn(id, b) === DBK.u + ':' + DBK.s) return false;
            return t ? dbkPut(id, t, k, { s: DBK.s }) : false;                       // 열린 서랍 창 안 = 그 칸
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
            if (o.m) { delete M[id]; ch = true; return; }                       // 🧩 재료 = 🧺 조립 바구니로
            delete o.in; Object.assign(o, (({ x, y, p }) => ({ x, y, p: o.p || p }))(dkyRow(row++))); ch = true;   // 📚 책상 다이어리 줄에 (하나씩 옆으로)
        });
        if (ch) { save(M); dkDeskBooks(); trayPaint(); bndSoon(); }
    }

    /* ---------- 🗄️ 서랍 창 (서랍장 칸 톡 → 서랍이 열리며 위에서 내려와요 · js/desk.js dkDrawerPull) ---------- */
    const trayEl = () => document.getElementById('dbkTray');
    const trayOn = () => { const r = trayEl(); return !!r && !r.hidden && !!DBK.u; };
    const trayHit = (x, y, chest) => trayOn() && dkDrawerHit(trayEl().querySelector('.dkw-drawer'), chest ? DBK.u : '', x, y);   // 🗄️ 열린 서랍 창 안 (chest = 그 서랍장 위도) · 넣는 자리 하나로 (js/deskmove.js)
    function shut() { const r = trayEl(); if (!r || r.hidden) return; if (window.dkDrawerOwns && dkDrawerOwns(r)) { dkDrawerShut(true); return; } dbkClose(); }
    function dbkClose() {
        const r = trayEl(); DBK.u = ''; DBK.s = -1; if (!r) return;
        r.classList.remove('show'); r.hidden = true; r.innerHTML = '';
        if (!document.querySelector('.dkw-room:not([hidden])')) document.documentElement.classList.remove('dkw-on');
    }
    async function dbkOpen(u, s) {
        if (window.hfReady) { try { await hfReady(u); } catch (e) { say('🗄️ 서랍을 못 열었어요.<br><small>잠시 뒤에 다시 열어 주세요</small>'); return; } }   // 🗄️ 그 서랍장 파일 (한 번 · js/holdfile.js)
        s = +s; const o = DK.items.find(x => x.u === u), S = o && dkSlots(o.id), e = (dkHomes()[u] || []).find(x => x.s === s), k = e && dkBk(e.k); if (!S || !k) return;
        if (k === 'bm') await matReady();                                         // 💤 🧩 재료 목록 (켤 때 안 읽어요 · 한 번)
        const [ic, K] = KN[k];
        DBK.u = u; DBK.s = s; DBK.k = k; DBK.pick = false; DBK.f = { k: '', s: '' };   // 🗂 처음 = 전체
        const r = await dkDrawerWin('dbkTray', { k: e.k, u, s, cls: 'dbk-drawer', title: `${ic} ${K} 서랍`, sub: `${dkName(o)} ${dkSlotNm(s, S.length)} 칸`, label: `${ic} ${K}`, cats: 'dbkCats', inn: 'dbkIn', shut,   // 🗄️ 서랍 창 하나로 (문구함과 같은 창 · js/deskgd.js)
            foot: `<span>${k === 'bm' ? '톡 = 꺼내서 🧩 조립 바구니로' : '톡 = 꺼내서 펼치기 · 끌어서 책상에 놓기'}</span>${k === 'bm' ? '<button type="button" class="btn dbk-pickb">🧺 바구니에서 넣기</button>' : ''}` });
        if (DBK.u !== u || DBK.s !== s) return;                                   // 색을 칠하는 사이 다른 서랍을 열었어요
        const pb = r.querySelector('.dbk-pickb'); if (pb) pb.onclick = () => { DBK.pick = !DBK.pick; DBK.f = { k: '', s: '' }; trayPaint(); };
        dkDrawerShow(r, u, trayPaint);
    }
    function trayPaint() {
        const inn = document.getElementById('dbkIn'); if (!inn || !trayOn()) return;
        const [ic, K] = KN[DBK.k], H = 112, pk = DBK.k === 'bm' && DBK.pick;
        const pb = trayEl().querySelector('.dbk-pickb'); if (pb) pb.textContent = pk ? '🗄️ 서랍 속 보기' : '🧺 바구니에서 넣기';
        const L0 = pk ? mats().filter(b => !dbkIn(b.id, b)) : here(DBK.u, DBK.s);   // 🧺 바구니 = 서랍에 없는 재료 (톡 = 이 서랍에)
        const show = new Set(dkFilterBar(document.getElementById('dbkCats'), L0.map(b => ({ id: b.id, k: kindName(b), s: sizeName(b) })), DBK.f, trayPaint));   // 🗂 걸러 보기 한 줄 (종류 │ 규격 · js/desk.js)
        const L = L0.filter(b => show.has(b.id));
        inn.classList.toggle('dbk-pick', pk);
        const tray = trayEl(); { let t = tray.querySelector('.dbk-pickt'); if (pk && !t) { t = document.createElement('div'); t.className = 'dbk-pickt'; t.textContent = '🧺 조립 바구니에 있는 재료 · 톡 = 이 서랍에 넣기'; inn.before(t); } else if (!pk && t) t.remove(); }
        if (L.length) { dkShelf(inn, L, card, 104, H + 44); return; }      // 🗄️ 서랍 안 진열 = 문구함과 같은 것 (js/desk.js dkShelf · 3줄까지 · 넘으면 슬라이더 · 1363)
        inn.innerHTML = pk ? `<div class="dkw-none">🧺 바구니가 비었어요<br><small>표지 · 내지는 🏪 샵이나 📒 다이어리 → 🗂️ 바인더 만들기에서 생겨요</small></div>`
            : `<div class="dkw-none">${ic} 서랍이 비었어요<br><small>${DBK.k === 'bm' ? '🛍️ 봉투의 표지 · 내지를 이 서랍장에 끌어 놓거나 · 아래 🧺 바구니에서 넣기' : `책상 위 ${htmlEsc(josa(K, '을', '를'))} 끌어다 이 서랍장에 넣어요`}</small></div>`;
    }
    function card(b) {                                                            // 서랍 속 카드 하나 (책 = 책상과 같은 그림 · 🧩 재료 = 조립 바구니 그림)
        const H = 112, pk = DBK.k === 'bm' && DBK.pick;
        {
            if (b.mat) return matCard(b, H, pk);
            const v = Object.assign({}, dkyMap()[b.id] || {}, { p: 'front', x: 0, y: 0 }), [w, h] = dkvSz(b, 'front'), z = H / h;
            const vol = dkvMake(b, v, false); vol.style.left = '0px'; vol.style.top = '0px'; vol.removeAttribute('role');
            const it = document.createElement('div'); it.className = 'dbk-it'; it.dataset.b = b.id; it.title = `${dkvIc(b)} ${dkvName(b)}`;
            it.innerHTML = `<span class="dbk-art" style="width:${Math.round(w * z)}px;height:${H}px"><span class="dbk-in" style="width:${w}px;height:${h}px;transform:scale(${z.toFixed(3)})"></span></span><b>${dkvIc(b)} ${htmlEsc(dkvName(b))}</b>`;
            it.querySelector('.dbk-in').appendChild(vol);
            it.addEventListener('pointerdown', ev => grab(ev, it, b));
            return it;
        }
    }
    /* 🗂 걸러 보기 이름 (도련 11-20 · 1360) : 종류 = 📔 날짜형바인더 · 날짜형노트 · 페이지바인더 · 페이지노트 / 📒 스티커바인더 · 이형지북 / 🧩 표지 · 내지 · 규격 = A5 · A6 … (상품공방 규격 표) */
    const kindName = b => b.mat ? (b.t === 'cover' || b.t === 'dcover' ? '표지' : '내지') : b.t === 'bd' ? '스티커바인더' : b.t === 'rl' ? '이형지북' : b.t === 'pg' ? (b.k === '노트' ? '페이지노트' : '페이지바인더') : b.ch === 'n' ? '날짜형노트' : '날짜형바인더';
    const sizeName = b => b.mat ? String(b.n || '') : dkSpecOf(dkvMm(b));
    /* 🧩 재료 카드 (조립 바구니와 같은 그림 · js/dymaker.js) */
    function matCard(b, H, pk) {
        const it = document.createElement('div'); it.className = 'dbk-it dbk-mat'; it.dataset.b = b.id;
        const cv = b.t === 'cover' || b.t === 'dcover', R = +b.r > 0 ? +b.r : 1.414, h = 96;
        const art = cv ? (window.dmkCvThumb ? dmkCvThumb(b.c, R, h, b.pid || b.d) : '') : window.dmkRfThumb ? (b.t === 'drefill' ? dmkRfThumb([[1, 1, b.lf || 'line']], 1.41, h) : dmkRfThumb(b.lv || [], R, h)) : '';
        const ic = b.t === 'dcover' || b.t === 'drefill' ? '📅' : cv ? '🗂️' : '📄', sub = b.t === 'dcover' ? b.y + ' · ' + (b.n || '') : b.t === 'refill' ? (b.n || '') + ' · ' + (b.pg || 0) + 'p' : (b.n || '');
        it.title = `${ic} ${b.g || ''}`;
        it.innerHTML = `<span class="dbk-art" style="height:${H}px">${art}</span><b>${ic} ${htmlEsc(b.g || (cv ? '표지' : '내지'))}</b><small>${htmlEsc(sub)}</small>`;
        if (pk) it.addEventListener('click', ev => pickIn(ev, b)); else it.addEventListener('pointerdown', ev => grab(ev, it, b));
        return it;
    }
    async function pickIn(ev, b) {                                                // 🧺 바구니 재료 톡 = 이 서랍에
        ev.stopPropagation();
        const t = document.querySelector(`#deskStage .desk-item[data-u="${DBK.u}"]`); if (!t) return;
        if (await dbkPut(b.id, t, 'bm', { s: DBK.s })) trayPaint();             // 열린 서랍 = 그 칸
    }
    function grab(ev, it, b) {                                                    // 톡 = 꺼내서 펼치기 · 끌기 = 손에 들고 놓은 곳에 · 👆 위아래로 밀기 = 내리기 (끌기 하나로 · js/deskmove.js dkDrag)
        if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
        dkDrag(ev, it.querySelector('.dbk-art'), {
            dir: dkShelfDir,                                                      // 끌기 = 꺼내기 · 옮기기 · 👆 위아래로 밀기 = 내리기 (문구함과 같은 규칙 · js/desk.js)
            start: () => { if (window.buzz) buzz(12); },
            tap: () => { takeOut(b.id); dkDeskBooks(); shut(); setTimeout(() => b.mat ? window.bndOpen && bndOpen() : dkVolOpen(b.id), 360); },   // 톡 = 꺼내서 펼치기 · 🧩 재료 = 조립 방 바구니로
            drop: async (x, y) => {
                if (trayHit(x, y)) return;                                       // 서랍 안 = 그대로
                const t = chestAt(x, y);
                if (t && fits(t)) { if (await dbkPut(b.id, t, kindOf(b))) trayPaint(); return; }
                if (b.mat) { say('🧩 표지 · 내지는 책상 위에 놓을 수 없어요.<br><small>서랍에 그대로 있어요 · 톡 하면 🧩 조립 바구니로 꺼내요</small>'); trayPaint(); return; }   // 🧩 재료는 책상에 안 놓여요 = 서랍에 그대로 (도련 11-20 · 1358)
                if (dkvPlace(b.id, x, y)) trayPaint();                            // 📚 놓은 자리에 (책상)
            }
        });
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && trayOn() && !document.querySelector('.modal[style*="flex"]')) { e.stopPropagation(); shut(); } }, true);

    window.dbkIn = dbkIn; window.dbkPut = dbkPut; window.dbkDrop = dbkDrop; window.dbkFits = fits; window.dbkSlotGone = dbkSlotGone;
    window.dbkOpen = dbkOpen; window.dbkClose = dbkClose; window.dbkHere = here; window.dbkMoveIn = dbkMoveIn;
    /* 🧩 조립 바구니가 쓰기 전 : 표지 · 내지 서랍이 있는 서랍장 파일만 읽어요 (그 서랍장 수만큼 · 한 번) */
    window.dbkMatReady = () => window.hfReady ? Promise.all(Object.keys(dkHomes()).filter(u => (dkHomes()[u] || []).some(e => dkBk(e.k) === 'bm') && DK.items.some(x => x.u === u && x.at === 'desk')).map(u => hfReady(u).catch(() => {}))) : Promise.resolve();
    window.dbkMatIn = id => !!dbkIn(id, matOf(id));
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskbook'] = true;
