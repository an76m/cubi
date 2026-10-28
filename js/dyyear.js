/* 말랑달콤 다이어리 - js/dyyear.js
   📔 기본 다이어리 = 1년짜리 날짜 다이어리 (도련 10-28)
   - 6공 바인더 · A6 (105×148) · 1월 1일 ~ 12월 31일 · 내지는 한 가지 (바꾸고 싶으면 속지로 꾸며요)
   - 다이어리 한 권 = 상품 하나 = 폴더 하나 (현실처럼 · 도련 10-28)
       · 바인더 색 4가지 (분홍 · 녹색 · 보라 · 노랑 = js/app.js skinPresets) · 색을 바꾸려면 🏪 기본상품 샵에서 그 색 바인더를 새로 받아요
       · 같은 것도 또 받을 수 있어요 (2026 노랑을 또 받으면 새 2026 노랑 한 권) · 다이어리끼리 기록을 나누지 않아요
       · 권 id '2026mint2' = 해 · 색 · 그 해 그 색 몇 번째 ('diary_book_n' · 버려도 번호는 다시 안 써요 → 되살려도 안 겹쳐요)
       · 저장 : diary_2026mint2_2026_10_28 → 말랑달콤 / 날짜바인더 / 2026 녹색 2 / 2026-10-28.json · 🔍 검색 = 그 폴더 / 검색.json (js/drive.js dyBookDir)
       · 📅 달력 · 🗂 꾸민 페이지만 보기 · 🔍 검색은 펼친 권 것만
   - 받은 권 'diary_years' ['2026pink1', '2026mint2'] · 펼친 권 'diary_year' (설정.json · 게스트는 이 기기)
   - 처음 온 다꾸러는 그 해 분홍 바인더를 선물로 받아요 (한 번만 · 다 버려도 다시 주지 않아요 → 샵에서 받아요)
   - 해가 바뀌면 새 다이어리는 🏪 기본상품 샵 → 📔 다이어리 → 날짜형에서 받아요 (공짜여도 받으러 가는 습관 · 도련)
       · 받은 해의 12월 31일 다음으로 넘기거나 · 새해에 다이어리를 펼치면 "○○ 기본 다이어리를 받아 주세요" · 더 안 넘어가요
   - 📔 다이어리 보관소 (다이어리 창) : 받은 권이 쌓여요 · 톡 = 그 권을 펼쳐요 (그 색으로) · 🗑 = 버리기 (js/bin.js · 휴지통 30일 · 마지막 한 권도)
       · 다이어리가 한 권도 없으면 펼치지 못하고 "🏪 기본상품 샵에서 받아 주세요"
   - 펼친 권의 색 = 다이어리 테두리 · 페이지 색 (applySkinPreset)
   ※ js/skins.js · js/bin.js 다음에 읽어요 (dyStep · dyOpenDate · dkEnd · dyTabSet · dfDays · js/page.js getDateKey · goToDate · beginCurl · js/search.js 가 여기 함수를 불러요) */

        const DYY_KEY = 'diary_years', DYY_LOCAL = 'malang_years', DYY_OPEN = 'diary_year', DYY_OPEN_L = 'malang_year', DYY_N = 'diary_book_n', DYY_N_L = 'malang_book_n';
        const DYY_INFO = 'diary_book_info', DYY_INFO_L = 'malang_book_info';   // 권마다 받은 곳 · 받은 날 { '2026pink1': { from: 'basic', at: '2026-10-28' } } (무료 · 유료는 폴더가 아니라 여기에 · 도련 10-28)
        const DYY_COLORS = [['pink', '분홍'], ['mint', '녹색'], ['purple', '보라'], ['yellow', '노랑']];
        const dyyThis = () => new Date().getFullYear();
        const dyyOf = id => { const m = /^(\d{4})(pink|mint|purple|yellow)(\d+)$/.exec(String(id || '')); return m ? { id: String(id), y: +m[1], c: m[2], n: +m[3] } : null; };
        const dyyCName = c => (DYY_COLORS.find(x => x[0] === c) || DYY_COLORS[0])[1];
        const dyyTitle = b => `${b.y} ${dyyCName(b.c)}${b.n > 1 ? ' ' + b.n : ''}`;   // 보관소 · 메시지에 보일 이름 (2026 녹색 · 2026 녹색 2)
        const dyyIds = () => { const v = prefGet(DYY_KEY, DYY_LOCAL); return Array.isArray(v) ? [...new Set(v.map(String))].filter(id => dyyOf(id)) : []; };
        function dyyBooks() {                                                  // 받은 권 (해 · 색 · 번호 순서)
            const ord = c => DYY_COLORS.findIndex(x => x[0] === c);
            return dyyIds().map(dyyOf).sort((a, b) => a.y - b.y || ord(a.c) - ord(b.c) || a.n - b.n);
        }
        const dyyHas = y => dyyBooks().some(b => b.y === +y);
        function dyyBook() {                                                   // 지금 펼친 권 (없으면 마지막 권 · 한 권도 없으면 null)
            const L = dyyBooks(), o = dyyOf(prefGet(DYY_OPEN, DYY_OPEN_L));
            if (o && L.some(b => b.id === o.id)) return o;
            return L.length ? L[L.length - 1] : null;
        }
        const dyyBookId = () => { const b = dyyBook(); return b ? b.id : ''; };
        const dyyYear = () => { const b = dyyBook(); return b ? b.y : dyyThis(); };
        const dyyBasic = () => typeof dkType !== 'function' || !dkType();
        /* 다이어리가 한 권도 없어요 (js/page.js beginCurl) → 알려 주고 true */
        let dyyNoneAt = 0;
        function dyyNone() {
            if (!dyyBasic() || dyyBooks().length) return false;
            if (performance.now() - dyyNoneAt > 1500) { dyyNoneAt = performance.now(); showAsk('📔 다이어리가 없어요.<br>🏪 기본상품 샵 → 📔 다이어리에서 받아 주세요.<br><small>버린 다이어리는 30일 안에 ⚙ 설정 → 🗑 휴지통에서 되살릴 수 있어요</small>', '🏪 받으러 가기', '나중에').then(ok => { if (ok) dyyShop(); }); }
            return true;
        }
        /* 그 날짜가 펼친 권의 해 안이면 그대로 · 아니면 null (넘기기 · 꾸민 날 건너뛰기) */
        const dyyIn = d => !d || !dyyBasic() || d.getFullYear() === dyyYear() ? d : null;
        /* 펼칠 날 : 그 날이 펼친 해 안이면 그대로 · 아니면 올해 다이어리는 오늘 · 지난 해는 12월 31일 (뒤에서 왔으면) · 1월 1일 (앞에서 왔으면) */
        function dyyClamp(d) {
            if (!dyyBasic()) return d;
            const y = dyyYear(), t = d || new Date();
            if (t.getFullYear() === y) return t;
            if (y === dyyThis()) return new Date();
            return t.getFullYear() > y ? new Date(y, 11, 31) : new Date(y, 0, 1);
        }
        /* 펼친 권의 색을 다이어리에 (테두리 · 페이지 색 = js/settings.js applySkinPreset) */
        function dyyPaint() {
            const b = dyyBook(); if (!b) return;
            if (dyyBasic() && typeof currentSkinId !== 'undefined' && currentSkinId !== b.c && typeof applySkinPreset === 'function') applySkinPreset(b.c);
        }
        /* 새 권 id (그 해 그 색 번호는 늘 새로 · 버린 것 · 되살린 것과 안 겹쳐요) */
        function dyyInfoSet(id, from) {
            const o = Object.assign({}, prefGet(DYY_INFO, DYY_INFO_L) || {}), t = new Date();
            if (from) o[id] = { from, at: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}` }; else delete o[id];
            prefSet(DYY_INFO, DYY_INFO_L, o);
        }
        function dyyNewId(y, c) {
            const k = `${y}${c}`, cnt = Object.assign({}, prefGet(DYY_N, DYY_N_L) || {});
            const used = dyyIds().concat((window.binList ? binList() : []).filter(e => e.k === 'dy').map(e => e.id)).map(dyyOf).filter(b => b && b.y === y && b.c === c).map(b => b.n);
            const n = Math.max(+cnt[k] || 0, ...used, 0) + 1;
            cnt[k] = n; prefSet(DYY_N, DYY_N_L, cnt);
            return k + n;
        }

        /* 🎁 처음 온 다꾸러 : 그 해 분홍 바인더 (한 번만 · 드라이브를 읽은 뒤 · 게스트는 들어올 때 · js/drive.js) */
        function dyySync() {
            if (prefGet(DYY_KEY, DYY_LOCAL) === null) { const id = dyyNewId(dyyThis(), 'pink'); prefSet(DYY_KEY, DYY_LOCAL, [id]); prefSet(DYY_OPEN, DYY_OPEN_L, id); dyyInfoSet(id, 'gift'); }   // 🎁 처음 선물
            dyyPaint();
            dyyFit();
            if (window.dyRender) dyRender();
            if (window.binSweep) binSweep();                                   // 🗑 30일 지난 버린 상품 (js/bin.js)
        }
        /* 지금 펼친 장이 펼친 해 밖이면 → 그 해 안으로 */
        function dyyFit() {
            if (!dyyBasic() || !dyyBook() || typeof currentDate === 'undefined' || currentDate.getFullYear() === dyyYear()) return;
            currentDate.setTime(dyyClamp(new Date()).getTime());
            const d = document.getElementById('pageDateDisplay'); if (d && typeof formatDate === 'function') d.innerText = formatDate(currentDate);
            if (typeof isCoverOpen !== 'undefined' && isCoverOpen && !turn && typeof loadData === 'function') loadData();
        }
        /* 다른 권으로 바꾸기 (펼친 장은 먼저 저장 · 저장 키가 바뀌어요) */
        function dyyOpenSet(id) {
            if (typeof isCoverOpen !== 'undefined' && isCoverOpen && !turn && typeof saveData === 'function') saveData(false);
            prefSet(DYY_OPEN, DYY_OPEN_L, id);
            dyyPaint();
            if (window.dyRender) dyRender();
        }
        /* 펼친 다이어리를 그 권 것으로 다시 (같은 날이어도 다른 권이라 다시 읽어요) */
        function dyyReload() {
            const to = (typeof dyOpenDate === 'function' && dyOpenDate()) || dyyClamp(new Date(currentDate));
            currentDate.setTime(to.getTime());
            if (typeof isCoverOpen === 'undefined' || !isCoverOpen) return;
            selectedElement = null;
            if (window.dyViewSet) dyViewSet('l');
            document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
            loadData(); if (typeof prefetchInitial === 'function') prefetchInitial();
        }

        /* 📔 보관소에서 그 권 펼치기 : 올해면 오늘 · 지난 해면 12월 31일 (🗂 꾸민 페이지만 보기면 그 권에서 마지막으로 꾸민 날) */
        function dyySelect(id) {
            const o = dyyOf(id); if (!o || !dyyIds().includes(o.id)) return;
            const was = dyyBookId(), basic = dyyBasic();
            if (!basic && typeof dySet === 'function') dySet(DY_DEF);
            if (was === o.id && basic) { if (window.dyRender) dyRender(); return; }
            dyyOpenSet(o.id);
            dyyReload();
        }

        /* 다른 해 날짜로 갈 때 (📅 달력 · 🔍 검색 · 오늘 · js/page.js goToDate) : 그 해 다이어리가 있으면 그 권으로 (같은 색이 있으면 같은 색) · 없으면 알려 주고 false */
        function dyyPick(y) { const L = dyyBooks().filter(b => b.y === y), cur = dyyBook(); return (cur && L.find(b => b.c === cur.c)) || L[0] || null; }
        function dyyGuard(target) {
            if (!dyyBasic() || !target || (typeof dkIs === 'function' && dkIs(target))) return true;
            if (!dyyBook()) { dyyNone(); return false; }
            const y = target.getFullYear();
            if (y === dyyYear()) return true;
            const b = dyyPick(y);
            if (b) { dyyOpenSet(b.id); return true; }
            dyyNeed(y);
            return false;
        }

        /* 다이어리 끝에서 더 넘기려고 할 때 (js/skins.js dkEnd) */
        let dyyMsgAt = 0;
        async function dyyEnd(dir) {
            if (!dyyBasic() || !dyyBook() || performance.now() - dyyMsgAt < 2500) return;
            const y = dyyYear(), to = y + (dir > 0 ? 1 : -1);
            const edge = dir > 0 ? currentDate.getMonth() === 11 && currentDate.getDate() === 31 : currentDate.getMonth() === 0 && currentDate.getDate() === 1;
            if (!edge) return;                                                 // 🗂 꾸민 페이지만 보기에서 꾸민 날이 더 없을 때는 그대로
            dyyMsgAt = performance.now();
            const b = dyyPick(to);
            if (b) {
                if (await showAsk(`📔 ${y} 다이어리의 ${dir > 0 ? '마지막 날' : '첫날'}이에요.<br>${dyyTitle(b)} 다이어리를 펼칠까요?`, `📔 ${to} 펼치기`, '그대로 있기')) {
                    dyyOpenSet(b.id);
                    goToDate(dir > 0 ? new Date(to, 0, 1) : new Date(to, 11, 31));
                }
            } else if (dir > 0) await dyyNeed(to);
            else await showMsg(`📔 ${y} 다이어리의 첫날이에요.`);
            dyyMsgAt = performance.now();
        }
        /* 그 해 다이어리가 없어요 → 올해면 🏪 기본상품 샵으로 · 아직 안 온 해면 기다려요 */
        async function dyyNeed(y) {
            if (y > dyyThis()) { await showMsg(`📔 ${y} 기본 다이어리는<br><b>${y}년 1월 1일</b>부터 🏪 기본상품 샵에서 받을 수 있어요.`); return; }
            if (y < dyyThis()) { await showMsg(`📔 ${y} 기본 다이어리가 없어요.`); return; }
            if (await showAsk(`🎉 ${y}년이 되었어요!<br><b>${y} 기본 다이어리</b>를 받아 주세요.<br><small>🏪 기본상품 샵 → 📔 다이어리에서 받아요</small>`, '🏪 받으러 가기', '나중에')) dyyShop();
        }
        function dyyShop() { if (typeof openShelf === 'function') { if (window.SH_SET_CAT) SH_SET_CAT('tool', 'dy'); openShelf(); if (typeof shOpenKind === 'function') shOpenKind('tool'); } }
        /* 새해에 다이어리를 펼치면 (js/skins.js dyOpenDate) : 올해 다이어리가 없으면 한 번 알려요 */
        function dyyOnOpen() {
            if (!dyyBasic() || !dyyBook() || dyyHas(dyyThis()) || dyyYear() > dyyThis()) return;
            setTimeout(() => { if (performance.now() - dyyMsgAt < 2500) return; dyyMsgAt = performance.now(); dyyNeed(dyyThis()).then(() => { dyyMsgAt = performance.now(); }); }, 900);
        }

        /* 🏪 기본상품 샵 → 📔 다이어리 → 날짜형 (js/basket.js) : 올해 바인더 4색 · 같은 것도 또 받아요 (받을 때마다 새 다이어리 한 권) */
        function dyyShopList() {
            const y = dyyThis();
            return DYY_COLORS.map(([c, n]) => ({ cnt: `${y} 기본 다이어리 · ${n}`, desc: `${n} 6공 바인더 · A6 · ${y}년 1월 1일 ~ 12월 31일 · 받을 때마다 새 다이어리 한 권 (다른 다이어리 기록과 따로)`, look: 'diary', yr: y, dc: c, cat: 'dy', give: () => dyyGive(y, c), name: `${y} ${n} 다이어리` }));
        }
        function dyyGive(y, c) {
            const id = dyyNewId(y, c);
            prefSet(DYY_KEY, DYY_LOCAL, dyyIds().concat([id]));
            dyyInfoSet(id, 'basic');                                           // 🏪 기본상품 샵 (나중 유료 = 'shop')
            dyySelect(id);
            return 'ok';
        }

        /* 🗑 버리기 (보관소 · 마지막 한 권도) : 묻고 → 버린 목록 (js/bin.js) → 펼친 권이었으면 다른 권 (없으면 덮어요) → 휴지통 안내 */
        async function dyyDiscard(id) {
            const b = dyyOf(id); if (!b || !dyyIds().includes(b.id)) return;
            if (!await binAsk(`${dyyTitle(b)} 다이어리`, '안에 쓴 기록도 모두 함께 버려져요')) return;
            const open = dyyBookId() === b.id;
            if (open && typeof isCoverOpen !== 'undefined' && isCoverOpen && !turn && typeof saveData === 'function') saveData(false);
            prefSet(DYY_KEY, DYY_LOCAL, dyyIds().filter(x => x !== b.id));
            await binAdd({ k: 'dy', id: b.id });
            const next = dyyBook();
            if (open) { if (next) { dyyOpenSet(next.id); if (dyyBasic()) dyyReload(); } else dyyShut(); }
            if (window.dyTabSet) dyTabSet('free');
            await binTold(dyyBooks().length ? '' : '새 다이어리는 🏪 기본상품 샵 → 📔 다이어리에서 받을 수 있어요');
        }
        /* 다이어리가 한 권도 없으면 펼친 다이어리를 덮어요 (겉표지로) */
        function dyyShut() {
            if (typeof isCoverOpen === 'undefined' || !isCoverOpen || !dyyBasic()) return;
            isCoverOpen = false; selectedElement = null;
            const ip = document.getElementById('innerPage'), cp = document.getElementById('coverPage');
            if (ip) ip.style.display = 'none'; if (cp) cp.style.display = '';
            if (typeof refreshLayout === 'function') refreshLayout();
            if (typeof updateTextPanel === 'function') updateTextPanel();
        }
        /* 🗑 휴지통 (js/bin.js · js/trash.js) : 되살리기 = 받은 권으로 다시 · 영구 삭제 = 그 권 폴더째 */
        BIN_KINDS.dy = {
            name: e => { const b = dyyOf(e.id); return b ? `📔 ${dyyTitle(b)} 다이어리` : '📔 다이어리'; },
            restore: e => { prefSet(DYY_KEY, DYY_LOCAL, dyyIds().filter(x => x !== e.id).concat([e.id])); if (!dyyBookId() || dyyBookId() === e.id) { dyyOpenSet(e.id); dyyFit(); } if (window.dyRender) dyRender(); },
            purge: async e => {
                const dir = !drive.guest ? await getFolder(dyBookDir(e.id), false) : null;
                if (dir) { const res = await gfetch(`${DRIVE_API}/${dir}`, { method: 'DELETE' }); if (!res.ok && res.status !== 404) throw new Error('purge ' + res.status); }
                const pre = 'diary_' + e.id + '_';                             // 이 기기 메모리에서도
                store.keys().filter(k => k.startsWith(pre)).forEach(k => { store.putLoaded(k, null); drive.dirtyKeys.delete(k); drive.loadedDays.delete(k); });
                if (drive.guest) Object.keys(localStorage).filter(k => k.startsWith(pre)).forEach(k => { try { localStorage.removeItem(k); } catch (x) {} });
                drive.monthIndex.delete('all:' + e.id);
                dyyInfoSet(e.id, null);
            }
        };

        /* 📔 보관소 칸 (js/skins.js dyTabSet) : 최신 권부터 · 🗑 버리기 */
        /* 📔 보관소 = 다이어리 책꽂이 하나 (도련 10-28) : 날짜바인더 · 날짜노트 · 페이지바인더 · 페이지노트 모두 한곳 (현실 책꽂이처럼)
             · 순서 = 지금 펼친 것 → 최근 해 → 먼저 받은 것 · 칸마다 종류 표시 (📅 날짜 바인더 …)
             · 종류가 두 가지 이상 생기면 위에 거르기 칩 (전체 · 날짜형 · 페이지형) · 지금은 날짜 바인더만이라 칩이 안 보여요 */
        const DYY_KINDS = [['date', '📅 날짜형'], ['page', '📄 페이지형']];
        let dyyFilter = 'all';
        const dyyKindOf = () => 'date';                                       // 지금 받은 권은 모두 날짜형 바인더 (날짜노트 · 페이지형은 팔 때 여기에)
        const dyyKindName = () => '📅 날짜 바인더';
        function dyyFilterSet(v) { dyyFilter = v; if (window.dyTabSet) dyTabSet('free'); }
        function dyyCells() {
            const base = DY_TYPES.find(t => t.id === DY_DEF), cur = dyyBookId();
            const all = dyyBooks().slice().sort((a, b) => (b.id === cur) - (a.id === cur) || b.y - a.y || b.n - a.n);
            if (!all.length) return `<div class="cs-empty">📔 다이어리가 없어요.<br>🏪 기본상품 샵 → 📔 다이어리에서 받아 주세요.<br><button type="button" class="btn primary" style="margin-top:10px" onclick="closeModal('dyModal'); dyyShop()">🏪 받으러 가기</button></div>`;
            const kinds = DYY_KINDS.filter(([k]) => all.some(b => dyyKindOf(b) === k));
            if (kinds.length < 2 || !kinds.some(([k]) => k === dyyFilter)) dyyFilter = 'all';
            const chips = kinds.length > 1 ? `<div class="dyy-chips">${[['all', '전체']].concat(kinds).map(([k, n]) => `<button type="button" class="${k === dyyFilter ? 'on' : ''}" onclick="dyyFilterSet('${k}')">${n}</button>`).join('')}</div>` : '';
            const L = dyyFilter === 'all' ? all : all.filter(b => dyyKindOf(b) === dyyFilter);
            return chips + L.map(b => {
                const sk = typeof skinPresets !== 'undefined' ? skinPresets[b.c] : null;
                return `<button type="button" class="dy-it dy-yr" data-id="${b.id}" onclick="dyySelect('${b.id}')"><span class="dy-stage">${dyThumb(base, sk)}<b class="dy-yr-n">${b.y}</b></span><span class="dy-n">${dyyTitle(b)}</span><small>${dyyKindName(b)} · ${base.n}</small>`
                    + `<span class="dy-del" role="button" tabindex="0" title="휴지통" aria-label="휴지통" onclick="event.stopPropagation(); dyyDiscard('${b.id}')">🗑</span></button>`;
            }).join('');
        }
        window.dyyFilterSet = dyyFilterSet;
        const dyyOnId = () => dyyBookId();                                     // 보관소에서 지금 펼친 권 표시 (js/skins.js dyRender)

        window.dyyBooks = dyyBooks; window.dyyBookId = dyyBookId; window.dyyHas = dyyHas; window.dyyYear = dyyYear; window.dyyIn = dyyIn; window.dyyClamp = dyyClamp; window.dyySync = dyySync; window.dyySelect = dyySelect;
        window.dyyGuard = dyyGuard; window.dyyEnd = dyyEnd; window.dyyOnOpen = dyyOnOpen; window.dyyShopList = dyyShopList; window.dyyCells = dyyCells; window.dyyShop = dyyShop; window.dyyOnId = dyyOnId; window.dyyPaint = dyyPaint;
        window.dyyNone = dyyNone; window.dyyDiscard = dyyDiscard;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dyyear'] = true;
