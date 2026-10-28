/* 말랑달콤 다이어리 - js/dyyear.js
   📔 기본 다이어리 = 1년짜리 날짜 다이어리 (도련 10-28)
   - 연핑크 6공 바인더 · A6 (105×148) · 1월 1일 ~ 12월 31일 · 내지는 한 가지 (바꾸고 싶으면 속지로 꾸며요)
   - 처음 온 다꾸러는 그 해 다이어리를 선물로 받아요 (드라이브를 읽은 뒤 · 게스트는 들어올 때) → 'diary_years' [2026]
   - 해가 바뀌면 새 다이어리는 🏪 기본상품 샵 → 📔 다이어리 → 날짜형에서 받아요 (공짜여도 받으러 가는 습관 · 도련)
       · 받은 해의 12월 31일 다음으로 넘기거나 · 새해에 다이어리를 펼치면 "○○ 기본 다이어리를 받아 주세요" · 더 안 넘어가요
       · 하루만 쓰고 해가 바뀌어도 똑같아요
   - 📔 다이어리 보관소 (다이어리 창) : 받은 해가 쌓여요 · 톡 = 그 해 다이어리를 펼쳐요 · 지난 해도 보고 고칠 수 있어요 (현실처럼 · 기록은 그대로)
   - 펼친 해 'diary_year' · 다른 해 날짜로 가려면 (📅 달력 · 🔍 검색 · 오늘) 그 해 다이어리가 있어야 해요 (있으면 그 해로 바꿔서 · 없으면 알려 줘요)
   - 저장 파일은 그대로 (일기기본 / 기본-2026-10-28.json · 하루 파일 하나) · 받은 해 · 펼친 해는 설정.json (게스트는 이 기기)
   ※ js/skins.js 다음에 읽어요 (dyStep · dyOpenDate · dkEnd · dyTabSet 가 여기 함수를 불러요) */

        const DYY_KEY = 'diary_years', DYY_LOCAL = 'malang_years', DYY_OPEN = 'diary_year', DYY_OPEN_L = 'malang_year';
        const dyyThis = () => new Date().getFullYear();
        function dyyOwned() { const v = prefGet(DYY_KEY, DYY_LOCAL); return Array.isArray(v) ? [...new Set(v.map(Number).filter(y => y > 2000))].sort((a, b) => a - b) : []; }
        const dyyHas = y => dyyOwned().includes(+y);
        function dyyYear() {                                                   // 지금 펼친 해 (받은 해 중에서 · 없으면 올해)
            const L = dyyOwned(), v = +prefGet(DYY_OPEN, DYY_OPEN_L);
            return L.includes(v) ? v : L.length ? L[L.length - 1] : dyyThis();
        }
        const dyyBasic = () => typeof dkType !== 'function' || !dkType();
        /* 그 날짜가 펼친 해 안이면 그대로 · 아니면 null (넘기기 · 꾸민 날 건너뛰기) */
        const dyyIn = d => !d || !dyyBasic() || d.getFullYear() === dyyYear() ? d : null;
        /* 펼칠 날 : 그 날이 펼친 해 안이면 그대로 · 아니면 올해 다이어리는 오늘 · 지난 해는 12월 31일 (뒤에서 왔으면) · 1월 1일 (앞에서 왔으면) */
        function dyyClamp(d) {
            if (!dyyBasic()) return d;
            const y = dyyYear(), t = d || new Date();
            if (t.getFullYear() === y) return t;
            if (y === dyyThis()) return new Date();
            return t.getFullYear() > y ? new Date(y, 11, 31) : new Date(y, 0, 1);
        }

        /* 🎁 처음 온 다꾸러 : 그 해 다이어리 (드라이브를 읽은 뒤 · 게스트는 들어올 때 · js/drive.js) */
        function dyySync() {
            if (!dyyOwned().length) { prefSet(DYY_KEY, DYY_LOCAL, [dyyThis()]); prefSet(DYY_OPEN, DYY_OPEN_L, dyyThis()); }
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

        /* 📔 보관소에서 그 해 다이어리 펼치기 : 올해면 오늘 · 지난 해면 12월 31일 (🗂 꾸민 페이지만 보기면 그 해 마지막으로 꾸민 날) */
        function dyySelect(y) {
            y = +y; if (!dyyHas(y)) return;
            const was = dyyYear(), basic = dyyBasic();
            prefSet(DYY_OPEN, DYY_OPEN_L, y);
            if (!basic && typeof dySet === 'function') dySet(DY_DEF);
            if (was !== y || !basic) {
                const to = (typeof dyOpenDate === 'function' && dyOpenDate()) || dyyClamp(new Date(currentDate));
                if (typeof isCoverOpen !== 'undefined' && isCoverOpen && typeof goToDate === 'function') goToDate(to);
                else if (typeof currentDate !== 'undefined') currentDate.setTime(to.getTime());
            }
            if (window.dyRender) dyRender();
        }

        /* 다른 해 날짜로 갈 때 (📅 달력 · 🔍 검색 · 오늘 · js/page.js goToDate) : 그 해 다이어리가 있으면 그 해로 · 없으면 알려 주고 false */
        function dyyGuard(target) {
            if (!dyyBasic() || !target || (typeof dkIs === 'function' && dkIs(target))) return true;
            const y = target.getFullYear();
            if (y === dyyYear()) return true;
            if (dyyHas(y)) { prefSet(DYY_OPEN, DYY_OPEN_L, y); if (window.dyRender) dyRender(); return true; }
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
            if (dyyHas(to)) {
                if (await showAsk(`📔 ${y} 다이어리의 ${dir > 0 ? '마지막 날' : '첫날'}이에요.<br>${to} 다이어리를 펼칠까요?`, `📔 ${to} 펼치기`, '그대로 있기')) {
                    prefSet(DYY_OPEN, DYY_OPEN_L, to); if (window.dyRender) dyRender();
                    goToDate(dir > 0 ? new Date(to, 0, 1) : new Date(to, 11, 31));
                }
            } else if (dir > 0) await dyyNeed(to);
            else await showMsg(`📔 ${y} 다이어리의 첫날이에요.`);
            dyyMsgAt = performance.now();
        }
        /* 그 해 다이어리가 없어요 → 올해 · 지난 해면 🏪 기본상품 샵으로 · 아직 안 온 해면 기다려요 */
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

        /* 🏪 기본상품 샵 → 📔 다이어리 → 날짜형 (js/basket.js) : 올해 기본 다이어리 */
        function dyyShopList() {
            const y = dyyThis();
            return [{ cnt: `${y} 기본 다이어리`, desc: `연핑크 6공 바인더 · A6 · ${y}년 1월 1일 ~ 12월 31일`, look: 'diary', yr: y, cat: 'dy', give: () => dyyGive(y), name: `${y} 기본 다이어리` }];
        }
        function dyyGive(y) {
            if (dyyHas(y)) return 'have';
            prefSet(DYY_KEY, DYY_LOCAL, dyyOwned().concat([y]));
            dyySelect(y);
            return 'ok';
        }

        /* 📔 보관소 칸 (js/skins.js dyTabSet) */
        function dyyCells() {
            const L = dyyOwned().slice().reverse(), base = DY_TYPES.find(t => t.id === DY_DEF), sk = typeof skinPresets !== 'undefined' ? skinPresets.pink : null;
            return L.map(y => `<button type="button" class="dy-it dy-yr" data-id="y${y}" onclick="dyySelect(${y})"><span class="dy-stage">${dyThumb(base, sk)}<b class="dy-yr-n">${y}</b></span><span class="dy-n">${y} 기본 다이어리</span><small>6공 바인더 · ${base.n}</small></button>`).join('');
        }

        window.dyyOwned = dyyOwned; window.dyyHas = dyyHas; window.dyyYear = dyyYear; window.dyyIn = dyyIn; window.dyyClamp = dyyClamp; window.dyySync = dyySync; window.dyySelect = dyySelect;
        window.dyyGuard = dyyGuard; window.dyyEnd = dyyEnd; window.dyyOnOpen = dyyOnOpen; window.dyyShopList = dyyShopList; window.dyyCells = dyyCells; window.dyyShop = dyyShop;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dyyear'] = true;
