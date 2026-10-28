/* 말랑달콤 다이어리 - js/dyyear.js
   📔 기본 다이어리 = 1년짜리 날짜 다이어리 (도련 10-28)
   - 6공 바인더 · A6 (105×148) · 1월 1일 ~ 12월 31일 · 내지는 한 가지 (바꾸고 싶으면 속지로 꾸며요)
   - 바인더 색 = 다이어리 한 권 (도련 10-28) : 분홍 · 녹색 · 보라 · 노랑 (js/app.js skinPresets 4색)
       · 다른 색이 갖고 싶으면 색만 바꾸는 게 아니라 🏪 기본상품 샵에서 그 색 바인더를 새로 받아요 → 📔 다이어리 보관소에 한 권 더
       · 다이어리끼리 기록을 나누지 않아요 (현실처럼) : 권마다 따로 저장
           분홍 = diary_2026_10_28 → 일기기본 / 기본-2026-10-28.json · 녹색 = diary_mint_2026_10_28 → 녹색-2026-10-28.json (보라 · 노랑도 같아요 · js/drive.js DYC_FILE)
           🔍 검색 목록도 권마다 (검색-기본-2026.json · 검색-녹색-2026.json) · 📅 달력 · 🗂 꾸민 페이지만 보기도 펼친 권 것만
       · 같은 해 같은 색은 한 권 (이미 받았어요)
   - 권 id = '2026-pink' · 받은 권 'diary_years' ['2026-pink', '2026-mint'] · 펼친 권 'diary_year' '2026-mint' (설정.json · 게스트는 이 기기)
   - 처음 온 다꾸러는 그 해 분홍 바인더를 선물로 받아요 (드라이브를 읽은 뒤 · 게스트는 들어올 때)
   - 해가 바뀌면 새 다이어리는 🏪 기본상품 샵 → 📔 다이어리 → 날짜형에서 받아요 (공짜여도 받으러 가는 습관 · 도련)
       · 받은 해의 12월 31일 다음으로 넘기거나 · 새해에 다이어리를 펼치면 "○○ 기본 다이어리를 받아 주세요" · 더 안 넘어가요
   - 📔 다이어리 보관소 (다이어리 창) : 받은 권이 쌓여요 · 톡 = 그 권을 펼쳐요 (그 색으로) · 지난 해도 보고 고칠 수 있어요
   - 펼친 권의 색 = 다이어리 테두리 · 페이지 색 (applySkinPreset)
   ※ js/skins.js 다음에 읽어요 (dyStep · dyOpenDate · dkEnd · dyTabSet · dfDays 가 여기 함수를 불러요 · js/page.js getDateKey · goToDate · js/search.js) */

        const DYY_KEY = 'diary_years', DYY_LOCAL = 'malang_years', DYY_OPEN = 'diary_year', DYY_OPEN_L = 'malang_year';
        const DYY_COLORS = [['pink', '분홍'], ['mint', '녹색'], ['purple', '보라'], ['yellow', '노랑']];
        const dyyThis = () => new Date().getFullYear();
        const dyyId = (y, c) => `${y}-${c}`;
        const dyyOf = id => { const m = /^(\d{4})-(pink|mint|purple|yellow)$/.exec(String(id)); return m ? { y: +m[1], c: m[2] } : null; };
        const dyyCName = c => (DYY_COLORS.find(x => x[0] === c) || DYY_COLORS[0])[1];
        function dyyBooks() {                                                  // 받은 권 (해 · 색 순서)
            const v = prefGet(DYY_KEY, DYY_LOCAL), ord = c => DYY_COLORS.findIndex(x => x[0] === c);
            return Array.isArray(v) ? [...new Set(v)].map(dyyOf).filter(Boolean).sort((a, b) => a.y - b.y || ord(a.c) - ord(b.c)) : [];
        }
        const dyyHasBook = (y, c) => dyyBooks().some(b => b.y === +y && b.c === c);
        const dyyHas = y => dyyBooks().some(b => b.y === +y);
        function dyyBook() {                                                   // 지금 펼친 권 (없으면 마지막 권 · 아무것도 없으면 올해 분홍)
            const L = dyyBooks(), o = dyyOf(prefGet(DYY_OPEN, DYY_OPEN_L));
            if (o && L.some(b => b.y === o.y && b.c === o.c)) return o;
            return L.length ? L[L.length - 1] : { y: dyyThis(), c: 'pink' };
        }
        const dyyYear = () => dyyBook().y;
        const dyyColor = () => { const c = dyyBook().c; return c === 'pink' ? '' : c; };   // 저장 키에 붙는 색 (분홍 = 없음)
        const dyyBasic = () => typeof dkType !== 'function' || !dkType();
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
            const c = dyyBook().c;
            if (dyyBasic() && typeof currentSkinId !== 'undefined' && currentSkinId !== c && typeof applySkinPreset === 'function') applySkinPreset(c);
        }

        /* 🎁 처음 온 다꾸러 : 그 해 분홍 바인더 (드라이브를 읽은 뒤 · 게스트는 들어올 때 · js/drive.js) */
        function dyySync() {
            if (!dyyBooks().length) { const id = dyyId(dyyThis(), 'pink'); prefSet(DYY_KEY, DYY_LOCAL, [id]); prefSet(DYY_OPEN, DYY_OPEN_L, id); }
            dyyPaint();
            dyyFit();
            if (window.dyRender) dyRender();
        }
        /* 지금 펼친 장이 펼친 해 밖이면 → 그 해 안으로 */
        function dyyFit() {
            if (!dyyBasic() || typeof currentDate === 'undefined' || currentDate.getFullYear() === dyyYear()) return;
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

        /* 📔 보관소에서 그 권 펼치기 : 올해면 오늘 · 지난 해면 12월 31일 (🗂 꾸민 페이지만 보기면 그 권에서 마지막으로 꾸민 날) */
        function dyySelect(id) {
            const o = dyyOf(id); if (!o || !dyyHasBook(o.y, o.c)) return;
            const was = dyyBook(), basic = dyyBasic(), same = was.y === o.y && was.c === o.c;
            if (!basic && typeof dySet === 'function') dySet(DY_DEF);
            if (same && basic) { if (window.dyRender) dyRender(); return; }
            dyyOpenSet(id);
            const to = (typeof dyOpenDate === 'function' && dyOpenDate()) || dyyClamp(new Date(currentDate));
            if (typeof isCoverOpen !== 'undefined' && isCoverOpen) {
                currentDate.setTime(to.getTime()); selectedElement = null;      // 같은 날이어도 다른 권이라 다시 읽어요
                if (window.dyViewSet) dyViewSet('l');
                document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
                loadData(); if (typeof prefetchInitial === 'function') prefetchInitial();
            } else if (typeof currentDate !== 'undefined') currentDate.setTime(to.getTime());
        }

        /* 다른 해 날짜로 갈 때 (📅 달력 · 🔍 검색 · 오늘 · js/page.js goToDate) : 그 해 다이어리가 있으면 그 권으로 (같은 색이 있으면 같은 색) · 없으면 알려 주고 false */
        function dyyPick(y) { const L = dyyBooks().filter(b => b.y === y); return L.find(b => b.c === dyyBook().c) || L[0] || null; }
        function dyyGuard(target) {
            if (!dyyBasic() || !target || (typeof dkIs === 'function' && dkIs(target))) return true;
            const y = target.getFullYear();
            if (y === dyyYear()) return true;
            const b = dyyPick(y);
            if (b) { dyyOpenSet(dyyId(b.y, b.c)); return true; }
            dyyNeed(y);
            return false;
        }

        /* 다이어리 끝에서 더 넘기려고 할 때 (js/skins.js dkEnd) */
        let dyyMsgAt = 0;
        async function dyyEnd(dir) {
            if (!dyyBasic() || performance.now() - dyyMsgAt < 2500) return;
            const y = dyyYear(), to = y + (dir > 0 ? 1 : -1);
            const edge = dir > 0 ? currentDate.getMonth() === 11 && currentDate.getDate() === 31 : currentDate.getMonth() === 0 && currentDate.getDate() === 1;
            if (!edge) return;                                                 // 🗂 꾸민 페이지만 보기에서 꾸민 날이 더 없을 때는 그대로
            dyyMsgAt = performance.now();
            const b = dyyPick(to);
            if (b) {
                if (await showAsk(`📔 ${y} 다이어리의 ${dir > 0 ? '마지막 날' : '첫날'}이에요.<br>${to} 다이어리(${dyyCName(b.c)})를 펼칠까요?`, `📔 ${to} 펼치기`, '그대로 있기')) {
                    dyyOpenSet(dyyId(b.y, b.c));
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
            if (!dyyBasic() || dyyHas(dyyThis()) || dyyYear() > dyyThis()) return;
            setTimeout(() => { if (performance.now() - dyyMsgAt < 2500) return; dyyMsgAt = performance.now(); dyyNeed(dyyThis()).then(() => { dyyMsgAt = performance.now(); }); }, 900);
        }

        /* 🏪 기본상품 샵 → 📔 다이어리 → 날짜형 (js/basket.js) : 올해 바인더 4색 */
        function dyyShopList() {
            const y = dyyThis();
            return DYY_COLORS.map(([c, n]) => ({ cnt: `${y} 기본 다이어리 · ${n}`, desc: `${n} 6공 바인더 · A6 · ${y}년 1월 1일 ~ 12월 31일 · 새 다이어리 한 권 (다른 바인더 기록과 따로)`, look: 'diary', yr: y, dc: c, cat: 'dy', give: () => dyyGive(y, c), name: `${y} ${n} 다이어리` }));
        }
        function dyyGive(y, c) {
            if (dyyHasBook(y, c)) return 'have';
            const id = dyyId(y, c);
            prefSet(DYY_KEY, DYY_LOCAL, dyyBooks().map(b => dyyId(b.y, b.c)).concat([id]));
            dyySelect(id);
            return 'ok';
        }

        /* 📔 보관소 칸 (js/skins.js dyTabSet) : 최신 권부터 */
        function dyyCells() {
            const base = DY_TYPES.find(t => t.id === DY_DEF);
            return dyyBooks().slice().reverse().map(b => {
                const sk = typeof skinPresets !== 'undefined' ? skinPresets[b.c] : null;
                return `<button type="button" class="dy-it dy-yr" data-id="${dyyId(b.y, b.c)}" onclick="dyySelect('${dyyId(b.y, b.c)}')"><span class="dy-stage">${dyThumb(base, sk)}<b class="dy-yr-n">${b.y}</b></span><span class="dy-n">${b.y} ${dyyCName(b.c)}</span><small>6공 바인더 · ${base.n}</small></button>`;
            }).join('');
        }
        const dyyOnId = () => { const b = dyyBook(); return dyyId(b.y, b.c); };   // 보관소에서 지금 펼친 권 표시 (js/skins.js dyRender)

        window.dyyBooks = dyyBooks; window.dyyHas = dyyHas; window.dyyYear = dyyYear; window.dyyColor = dyyColor; window.dyyIn = dyyIn; window.dyyClamp = dyyClamp; window.dyySync = dyySync; window.dyySelect = dyySelect;
        window.dyyGuard = dyyGuard; window.dyyEnd = dyyEnd; window.dyyOnOpen = dyyOnOpen; window.dyyShopList = dyyShopList; window.dyyCells = dyyCells; window.dyyShop = dyyShop; window.dyyOnId = dyyOnId; window.dyyPaint = dyyPaint;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dyyear'] = true;
