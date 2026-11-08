/* 말랑달콤 다이어리 - js/dyyear.js
   📔 기본 다이어리 = 1년짜리 날짜 다이어리 (도련 10-28)
   - 1월 1일 ~ 12월 31일 · 내지는 한 가지 (바꾸고 싶으면 속지로 꾸며요)
   - 📔 디자인 = 서버 상품 (상품공방 '날짜형바인더' · '날짜형노트' · 도련 11-04 : 상품 하나 = 디자인 하나 · js/app.js DY_DESIGNS) · 모양(규격 · 묶음) · 스킨 · 이름 모두 그 상품
   - 다이어리 한 권 = 디자인 하나를 받은 것 = 폴더 하나 (현실처럼 · 도련 10-28)
       · 같은 것도 또 받을 수 있어요 (2026 분홍을 또 받으면 새 2026 분홍 한 권) · 다이어리끼리 기록을 나누지 않아요
       · 권 id '2026b-분홍-2' = 해 · 종류 글자(b 날짜형바인더 · n 날짜형노트) · 디자인 id · 그 해 그 디자인 몇 번째 ('diary_book_n' · 버려도 번호는 다시 안 써요 → 되살려도 안 겹쳐요)
       · 저장 : diary_2026b-분홍-2_2026_10_28 → 말랑달콤 / 날짜형바인더 (노트 = 날짜형노트) / 2026 분홍 2 / 2026-10-28.json · 🔍 검색 = 그 폴더 / 검색.json (js/drive.js dyBookDir)
       · ⚠ 디자인 id = 드라이브 폴더 이름이라 짧은 한글로 (분홍 · 딸기) · 한 번 올린 id 는 바꾸지 않아요
       · 📅 달력 · 🗂 꾸민 페이지만 보기 · 🔍 검색은 펼친 권 것만
   - 받은 권 = 다이어리 / _목록.json 'diary_own' 의 t: 'date' 줄 (권 하나에 한 줄 · from · js/dyown.js · 981) · 펼친 권 'diary_year' (설정.json · 게스트는 이 기기)
   - 📓 날짜형노트 = 완제품 (샵에서 받으면 바로 권) · 🗂️ 날짜형바인더 = 조립품 (샵 = 해가 적힌 표지 + 날짜 내지 재료 → 🧩 조립하면 권 · 내지는 표지의 해를 따라가요 · 도련 11-07)
   - 처음 온 다꾸러는 그 해 '처음선물' 디자인을 한 권씩 받아요 (상품 속성 · 한 번만 · 다 버려도 다시 주지 않아요 → 샵에서 받아요)
   - 해가 바뀌면 새 다이어리는 🏪 기본상품 샵 → 📔 다이어리 → 날짜형에서 받아요 (공짜여도 받으러 가는 습관 · 도련)
       · 받은 해의 12월 31일 다음으로 넘기거나 · 새해에 다이어리를 펼치면 "○○ 기본 다이어리를 받아 주세요" · 더 안 넘어가요
   - 📔 다이어리 보관소 (다이어리 창) : 받은 권이 쌓여요 · 톡 = 그 권을 펼쳐요 (그 색으로) · 🗑 = 버리기 (js/bin.js · 휴지통 30일 · 마지막 한 권도)
       · 다이어리가 한 권도 없으면 펼치지 못하고 "🏪 기본상품 샵에서 받아 주세요"
   - 펼친 권의 색 = 다이어리에만 (표지 · 테두리 · 강조 · 속지 · dyyColorPaint · 앱 화면은 늘 기본 색 · 도련 11-05)
   ※ js/skins.js · js/bin.js 다음에 읽어요 (dyStep · dyOpenDate · dkEnd · dyTabSet · dfDays · js/page.js getDateKey · goToDate · beginCurl · js/search.js 가 여기 함수를 불러요) */

        const DYY_OPEN = 'diary_year', DYY_OPEN_L = 'malang_year', DYY_N = 'diary_book_n', DYY_N_L = 'malang_book_n';
        /* 권마다 받은 곳 · 받은 날 = 그 줄의 from · at (diary_own · 무료 · 유료는 폴더가 아니라 여기에 · 도련 10-28) */
        const dyyThis = () => new Date().getFullYear();
        const dyyOf = id => { const m = /^(\d{4})([a-z])-(.+)-(\d+)$/.exec(String(id || '')); return m ? { id: String(id), y: +m[1], ch: m[2], c: m[3], n: +m[4] } : null; };   // c = 디자인 id · ch = 종류 글자 (js/app.js DY_DKINDS)
        const dyyDesign = b => b ? DY_DESIGNS.find(d => d.id === b.c && d.ch === b.ch) || null : null;   // 그 권의 디자인 (서버 상품 그대로)
        const dyyIsNote = b => !!b && b.ch === 'n';                            // 📓 날짜형 노트 (저장 = 말랑달콤 / 날짜형노트 · js/drive.js)
        const dyyColor = c => String(c || '');                                 // 색 id = 디자인 id
        const dyyTitle = b => { const d = dyyDesign(b); return `${b.y} ${d ? d.name : b.c}${b.n > 1 ? ' ' + b.n : ''}`; };   // 보관소 · 메시지에 보일 이름 (2026 분홍 다이어리 · … 2)
        const dyyIds = () => [...new Set(dyoAll().filter(x => x.t === 'date').map(x => x.id))].filter(id => dyyOf(id));
        const dyyLine = id => { const x = dyoGet(id); return x && x.t === 'date' ? x : null; };
        function dyyBooks() {                                                  // 받은 권 (해 · 바인더 → 노트 · 디자인 순서 · 번호 순서)
            const ord = b => DY_DESIGNS.indexOf(dyyDesign(b));
            return dyyIds().map(dyyOf).sort((a, b) => a.y - b.y || dyyIsNote(a) - dyyIsNote(b) || ord(a) - ord(b) || a.n - b.n);
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
        /* 🎨 펼친 권의 색 → 다이어리에만 (--dy-cover · --dy-page · --dy-border · --dy-accent → css 가 다이어리 안에서 --cover-bg 들로 · 앱 화면은 늘 기본 색 · 도련 11-05)
           날짜형이 아닌 권(유한 다이어리)은 기본 색 */
        function dyyColorPaint() {   // 📓 🗂️ 페이지노트 · 바인더도 그 권 색 (상품 · 내가 만든 것 · t.cols · 도련 11-05)
            const b = dyyBook(), t = !dyyBasic() && typeof dkType === 'function' ? dkType() : null, C = t && t.cols;
            const k = b && dyyBasic() ? DY_COL[dyyColor(b.c)] : C ? { cover: C.표지색, page: C.속지색, border: C.테두리색, accent: C.강조색 } : null, r = document.documentElement.style;
            [['--dy-cover', 'cover'], ['--dy-page', 'page'], ['--dy-border', 'border'], ['--dy-accent', 'accent']].forEach(([v, n]) => k ? r.setProperty(v, k[n]) : r.removeProperty(v));
        }
        let dyyLastNote = null;
        function dyyPaint() {
            const b = dyyBook(), yl = document.getElementById('cvYear'); if (yl) yl.textContent = b && dyyBasic() ? String(b.y) : '';   // 📔 겉표지 해 이름판 (도련 10-30 시안)
            if (window.dkDeskBooks) setTimeout(dkDeskBooks, 0);              // 📔 책상 = 다이어리 보관소 (펼쳐 둔 권 · 나머지 권 다시 · js/desk.js)
            dyyColorPaint();
            if (window.dyyPastMark) dyyPastTag();
            if (window.dkCoverPaint) dkCoverPaint();                           // 📢 📕 권을 바꾸면 그 상품의 공지 · 표지 꾸미기 (js/skins.js)
            if (!b) return;
            const d = dyyDesign(b), nt = dyyBasic() && d ? d.b + ':' + d.r : null;   // 📐 디자인마다 모양(묶음 · 크기)이 달라요 → 바뀌면 다시 그리기
            if (nt !== dyyLastNote) { dyyLastNote = nt; if (typeof refreshLayout === 'function') setTimeout(refreshLayout, 0); }
        }
        /* 새 권 id (그 해 그 색 번호는 늘 새로 · 버린 것 · 되살린 것과 안 겹쳐요) */
        /* 💤 mem = 메모리에만 (도련 11-07 · 🆕 처음 선물 · 아직 안 바뀐 선물 = 다이어리 / _목록.json 을 만들지 않아요 · 바뀔 때 prefSet 이 파일을 만들어요) */
        const dyyPut = (k, l, v, mem) => { if (mem && dyyOnline()) store.putLoaded(k, JSON.stringify(v)); else prefSet(k, l, v); };
        const dyyLineNew = (id, from, ex) => Object.assign({ id, t: 'date', from, at: dyoDay() }, ex || {});
        /* 🗂️ 날짜형바인더 재료 (샵 · 첫 선물) : 해가 적힌 표지 + 날짜 내지 (해 없음 · 끼운 표지를 따라가요) */
        const dyyCoverOf = (y, d, from) => ({ id: dymNewId(), t: 'dcover', y, d: d.id, g: `${y} ${d.name}`, from });
        const dyyRefillProd = (R, from) => R.t === 'date' ? { id: dymNewId(), t: 'drefill', pid: R.id, n: R.n, lf: R.lf, g: R.g, from } : { id: dymNewId(), t: 'refill', pid: R.id, n: R.n, g: R.g, pg: R.pg, lv: R.lv, from };   // 📄 바인더내지 상품 → 재료
        function dyyRefillOf(d, from) {                                         // 🎁 첫 선물 바인더에 끼울 날짜 내지 = 표지 상품 '처음내지' (없으면 같은 크기 날짜 내지 · 그것도 없으면 줄노트)
            const R = (typeof DY_REFILLS !== 'undefined' ? DY_REFILLS : []).filter(r => r.t === 'date' && r.n === d.n), r = R.find(x => x.id === d.rf0) || R[0];
            return r ? dyyRefillProd(r, from) : { id: dymNewId(), t: 'drefill', n: d.n, lf: d.lf || 'line', g: `${d.name} 날짜 내지`, from };
        }
        async function dyyPCoverGive(p) { try { if (!await dymReady()) return 'fail'; } catch (e) { return 'fail'; } dymPut({ id: dymNewId(), t: 'cover', pid: p.id, g: p.g, n: p.n, c: p.c, cols: p.cols, cw: 1, from: 'basic' }); window.dyyLastGiven = null; return 'ok'; }   // 🏪 샵 페이지바인더 표지 = 🧩 재료
        async function dyyRefillGive(R) { try { if (!await dymReady()) return 'fail'; } catch (e) { return 'fail'; } dymPut(dyyRefillProd(R, 'basic')); window.dyyLastGiven = null; return 'ok'; }   // 🏪 샵 바인더 내지 = 🧩 재료
        function dyyNewId(y, d, mem) {                                         // d = 디자인 (DY_DESIGNS)
            const k = `${y}${d.ch}-${d.id}-`, cnt = Object.assign({}, prefGet(DYY_N, DYY_N_L) || {});
            const used = dyyIds().concat((window.binList ? binList() : []).filter(e => e.k === 'dy').map(e => e.id)).map(dyyOf).filter(b => b && b.y === y && b.ch === d.ch && b.c === d.id).map(b => b.n);
            const n = Math.max(+cnt[k] || 0, ...used, 0) + 1;
            cnt[k] = n; dyyPut(DYY_N, DYY_N_L, cnt, mem);
            return k + n;
        }

        /* 🗂 받은 권 = 권 폴더 + 다이어리.json (도련 11-05 · 안 쓴 권도) : 말랑달콤 / 다이어리 / 2026 분홍 1 / 다이어리.json 🔐 { id, from, at }
             만들면 그 권 줄에 f: 1 (다시 확인하지 않아요) · 다이어리 / _목록.json 이 없어지면 = _목록_백업.json + 권 폴더 + 첫 선물로 되살려요 · 🗑 영구 삭제 = 폴더째
             🎁 첫 선물 권은 꾸미기 시작할 때 폴더가 생겨요 (첫 접속 요청 줄이기) */
        const DYY_FILE = '다이어리.json';
        const dyyOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        async function dyyFile(id, from) {
            if (!dyyOnline() || typeof ownLock !== 'function') return;
            try {
                const dir = await getFolder(dyBookDir(id), true), cur = await findFile(dir, DYY_FILE);
                if (!cur) { const I = dyyLine(id) || {}; await driveUpsert(dir, DYY_FILE, null, await ownLock({ id, from: I.from || from, at: I.at || '' })); }
                const L = dyyLine(id); if (L && !L.f) dyoPut(Object.assign({}, L, { f: 1 }));   // 권 폴더를 만들었어요 (다시 확인하지 않아요)
            } catch (e) { console.warn('📔 다이어리.json', id, e); }
        }
        async function dyyRescue() {                                           // 🛟 권 폴더 → 받은 권 (못 읽으면 에러 → 다음에 다시)
            const ids = [], lines = [], gone = new Set((window.binList ? binList() : []).filter(e => e.k === 'dy').map(e => e.id));
            for (const [path, note] of [[DIARY_PATH, null]]) {                // 📔 다이어리 폴더 하나 (노트인지 = 디자인으로 · 도련 11-07)
                const root = await getFolder(path, false); if (!root) continue;
                for (const dir of await driveList(`'${root}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`, 'id,name')) {
                    const id = dyBookOfName(dir.name, note); if (!dyyOf(id) || gone.has(id) || ids.includes(id)) continue;
                    const f = await findFile(dir.id, DYY_FILE);
                    let o = null;
                    if (f) { try { o = await ownUnlock(await readFileText(f.id)); } catch (e) {} if (!o || o.id !== id) continue; }   // 🔐 남의 것은 빼요 (다이어리.json 이 없는 예전 권은 폴더 그대로)
                    ids.push(id); lines.push(dyyLineNew(id, dyoFrom(o && o.from, 'basic'), { at: (o && o.at) || '', f: 1 }));
                }
            }
            return lines;
        }
        let dyyBusy = false;
        const dyyIsGift = id => { const I = dyyLine(id); return !!I && I.from === 'gift' && !I.f; };
        const dyyGiftTell = () => { if (window.deskGiftWrite) deskGiftWrite(); };   // (예전 _선물.json 다시 쓰기 자리 · 지금은 할 일 없음 · js/desk.js giftWrite)
        window.dyyGiftOwn = () => dyyIds().filter(dyyIsGift);
        function dyyGift() {                                                   // 🎁 처음 선물 (상품 속성 '처음선물' · 도련 11-04) · 다이어리 목록에 바로 (from gift · 바인더는 조립된 채로 · 981)
            const y = dyyThis(), G = DY_DESIGNS.filter(d => d.gift), ids = G.map(d => dyyNewId(y, d)), fl = G.findIndex(d => d.float);
            const lines = G.map((d, i) => dyyLineNew(ids[i], 'gift', d.ch === 'b' ? { cv: dyyCoverOf(y, d, 'gift'), rf: [dyyRefillOf(d, 'gift')] } : null));
            dyoSet(dyoAll().filter(x => x.t !== 'date').concat(lines)); if (ids.length) prefSet(DYY_OPEN, DYY_OPEN_L, ids[Math.max(0, fl)]);
            if (window.giftMark) giftMark();   // 펼쳐 둘 권 = 상품공방 '처음띄움' (없으면 첫 권)
            if (window.deskVolInit) deskVolInit(G.map((d, i) => ({ id: ids[i], spot: d.desk, n: d.name })));   // 🎁 처음 책상 자리 = 상품공방 '처음책상' (없으면 봉투 · 도련 11-06)
            window.dkGiftFloat = fl >= 0 ? ids[fl] : (typeof DY_TYPES !== 'undefined' && DY_TYPES.some(p => p.gift && p.float)) ? 'pg' : '';   // 🎈 처음에 떠 있는 권 (js/desk.js deskLoginShow · 'pg' = 페이지 다이어리가 뒤에 떠요)
            dyyGiftTell();
            return ids;
        }
        /* 🎁 처음 온 다꾸러 : 그 해 '처음선물' 디자인마다 한 권 (한 번만 · 드라이브를 읽은 뒤 · 게스트는 들어올 때 · js/drive.js) · 펼칠 권 = 첫 권
           🛟 로그인했는데 받은 권 목록이 없으면 = 먼저 권 폴더를 봐요 (있으면 되살리기 · 없으면 처음 선물 · 도련 11-05) */
        function dyySync() {
            if (!dyoHas()) {
                if (!dyyOnline() || drive.newbie) dyyGift();                     // 👤 게스트 = 이 기기 목록만 · 🆕 처음 온 다꾸러 = 뒤지지 않고 바로 선물
                else if (!dyyBusy) {
                    dyyBusy = true;
                    Promise.all([window.deskGiftRead ? deskGiftRead() : null, window.deskBackupRead ? deskBackupRead().catch(() => null) : null]).then(async ([had, bk]) => {
                        const giftIds = had && Array.isArray(had.dy) ? had.dy.map(x => x && x.id) : [];
                        const lost = keyMade('dyown') || (bk && Array.isArray(bk.diary_own) && bk.diary_own.some(x => x && x.t === 'date' && !giftIds.includes(x.id)));   // 📝 목록 파일을 만든 적이 있어요 (또는 백업에 선물 아닌 권) = 없어진 것 · 아니면 아직 선물 그대로 (권 폴더를 안 뒤져요 · 도련 11-07)
                        return [lost ? await dyyRescue() : [], had, bk];
                    }).then(([found, had, bk]) => {
                        if (dyoHas()) return [];                                         // 그사이 다른 기기에서
                        const gone = new Set((window.binList ? binList() : []).filter(e => e.k === 'dy' || e.k === 'dk').map(e => e.id));
                        const ok = x => x && typeof x === 'object' && typeof x.id === 'string' && ['date', 'note', 'binder'].includes(x.t) && !gone.has(x.id) && (x.t !== 'date' || dyyOf(x.id));
                        const gifts = (had && Array.isArray(had.dy) ? had.dy : []).filter(ok);
                        const bkL = bk && Array.isArray(bk.diary_own) ? bk.diary_own : null;   // 🛟 다이어리 / _목록_백업.json (권마다 한 줄 · 981)
                        const all = [], seen = new Set(), add = x => { if (ok(x) && !seen.has(x.id)) { seen.add(x.id); all.push(x); } };
                        (bkL || []).forEach(add); found.forEach(add); gifts.forEach(add);
                        if (bk && bk.diary_book_n && typeof bk.diary_book_n === 'object' && !prefGet(DYY_N, DYY_N_L)) dyyPut(DYY_N, DYY_N_L, bk.diary_book_n, false);
                        if (bk && bk.diary_books && typeof bk.diary_books === 'object' && !prefGet('diary_books', 'malang_books')) prefSet('diary_books', 'malang_books', bk.diary_books);   // 📕 페이지형 규격 → 권 (982)
                        if (!all.length) { if (!had && !bkL) dyyGift(); else dyoSet([], true); return []; }   // 선물을 준 적이 있는데 비었으면 = 다 버린 사람
                        dyoSet(all);                                                     // 🛟 되살린 목록은 늘 파일로 (선물도 · 도련 11-07)
                        const dates = all.filter(x => x.t === 'date').map(x => x.id);
                        if (dates.length && !dates.includes(prefGet(DYY_OPEN, DYY_OPEN_L))) prefSet(DYY_OPEN, DYY_OPEN_L, dates[dates.length - 1]);   // 펼친 권이 목록에 있으면 그대로
                        diag('rescue', { w: 'dy', n: all.length });
                        return found.filter(x => !gifts.some(g => g.id === x.id)).map(x => [x.id, x.from]);
                    }).then(L => Promise.all(L.map(([id, from]) => dyyFile(id, from)))).catch(e => console.warn('📔 다이어리 되살리기', e))
                        .finally(() => { dyyBusy = false; dyyPaint(); dyyFit(); if (window.dyRender) dyRender(); if (window.dkDeskBooks) dkDeskBooks(); });
                }
            } else if (dyyOnline() && !dyyBusy) {                                // 다이어리.json 이 아직 없는 권 (예전에 받은 권도)
                const L = dyyIds().filter(id => !(dyyLine(id) || {}).f && !dyyIsGift(id));   // 🎁 첫 선물 권은 꾸밀 때 폴더가 생겨요
                if (L.length) { dyyBusy = true; (async () => { for (const id of L) await dyyFile(id, (dyyLine(id) || {}).from || 'basic'); })().finally(() => { dyyBusy = false; }); }
            }
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
        function dyyShop() { if (typeof openShelf === 'function') { const b = dyyBook(); if (window.SH_SET_CAT) SH_SET_CAT('tool', b && dyyIsNote(b) ? 'dyn' : 'dyb'); openShelf(); if (typeof shOpenKind === 'function') shOpenKind('tool'); } }
        /* 새해에 다이어리를 펼치면 (js/skins.js dyOpenDate) : 올해 다이어리가 없으면 한 번 알려요 */
        function dyyOnOpen() {
            if (!dyyBasic() || !dyyBook() || dyyHas(dyyThis()) || dyyYear() > dyyThis()) return;
            setTimeout(() => { if (performance.now() - dyyMsgAt < 2500) return; dyyMsgAt = performance.now(); dyyNeed(dyyThis()).then(() => { dyyMsgAt = performance.now(); }); }, 900);
        }

        /* 🏪 기본상품 샵 → 📔 다이어리 코너 → 날짜형 바인더 · 날짜형 노트 (js/basket.js) : 올해 디자인마다 · 같은 것도 또 받아요 (받을 때마다 새 다이어리 한 권) */
        function dyyShopList() {
            const y = dyyThis();
            return DY_DESIGNS.filter(d => !d.off && prodList(d.K).some(x => x.id === d.id)).map(d => d.ch === 'b'
                ? { cnt: `${y} ${d.name} 표지`, desc: `${d.name} · 바인더 표지 · ${d.n} (${d.mm}) · 📅 ${y}년 · 🧩 바인더 조립에서 같은 크기 날짜 내지를 끼워 써요`, look: 'diary', yr: y, dc: d.id, cat: 'dyb', give: () => dyyGive(y, d), name: `${y} ${d.name} 표지` }
                : { cnt: `${y} ${d.name}`, desc: `${d.name} · 노트 · ${d.n} (${d.mm}) · ${y}년 1월 1일 ~ 12월 31일 · 받을 때마다 새 다이어리 한 권 (다른 다이어리 기록과 따로)`, look: 'note', yr: y, dc: d.id, cat: 'dyn', give: () => dyyGive(y, d), name: `${y} ${d.name}` })
                .concat((typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).filter(p => p.cvOnly && !p.off).map(p => ({   // 🗂️ 페이지바인더 표지 (도련 11-07)
                    cnt: `${p.g} 표지`, desc: `${p.g} · 바인더 표지 · ${p.n} (${p.mm}) · 🧩 바인더 조립에서 같은 크기 페이지 내지를 끼워 써요`, look: 'pbinder', cols: p.cols, n: p.n, cat: 'pgb', give: () => dyyPCoverGive(p), name: `${p.g} 표지` })))
                .concat((typeof DY_REFILLS !== 'undefined' ? DY_REFILLS : []).filter(r => !r.off && prodList(r.K).some(x => x.id === r.id)).map(r => ({   // 📅 날짜 내지 · 📄 페이지 내지 (샵 칸도 둘 · 도련 11-07)
                    cnt: r.g, desc: `${r.t === 'date' ? '📅 날짜 내지 · 끼운 표지의 해를 따라가요' : `📄 페이지 내지 · ${r.pg}쪽`} · ${r.n} (${r.mm}) · 🧩 같은 크기 바인더 표지에 끼워요`, look: 'refill', lf: r.lf, rt: r.t, n: r.n, cat: r.t === 'date' ? 'dyr' : 'pgr', give: () => dyyRefillGive(r), name: r.g })));
        }
        async function dyyGive(y, d) {
            if (d.ch === 'b') {                                                // 🗂️ 날짜형바인더 = 조립품 : 샵 = 해가 적힌 표지 → 🧩 바인더 재료 (도련 11-07 · 981)
                try { if (!await dymReady()) return 'fail'; } catch (e) { return 'fail'; }
                dymPut(dyyCoverOf(y, d, 'basic'));                            // 📄 내지는 따로 (🏪 바인더 내지 · 도련 11-07)
                window.dyyLastGiven = null;
                return 'ok';
            }
            const id = dyyNewId(y, d);                                         // 📓 날짜형노트 = 완제품 → 바로 권
            dyoPut(dyyLineNew(id, 'basic'));                                   // 🏪 기본상품 샵 (나중 유료 = 'shop')
            dyyFile(id, 'basic');                                              // 🗂 권 폴더 + 다이어리.json (도련 11-05)
            window.dyyLastGiven = { id, t: Date.now() };                       // 🛍️ 봉투 카드가 이 권을 기억해요 (끌어 놓으면 책상 그 자리 · js/basket.js bagNote)
            if (window.shopSceneOn && shopSceneOn() && window.dkBagHold) dkBagHold(id);   // 🏪 가게에서 산 것 = 봉투 속 (책상에 꺼내 놓을 때까지 책상에 없어요 · 펼쳐 둔 권도 그대로 · 도련 10-30)
            else dyySelect(id);
            return 'ok';
        }
        /* 🧩 날짜형바인더 조립 (js/dymaker.js dmkRoomSave) : 해가 적힌 표지 + 날짜 내지 하나 → 그 해 권 · 쓴 재료는 빠져요 · 해가 지난 표지는 못 해요 → 권 id · 'old' · null */
        function dyyAssemble(cv, rf) {
            const d = cv && DY_DESIGNS.find(x => x.id === cv.d && x.ch === 'b'); if (!d || !rf) return null;
            if (+cv.y < dyyThis()) return 'old';
            if (rf.n && cv.n && rf.n !== cv.n) return null;                      // 같은 크기만
            const id = dyyNewId(+cv.y, d);
            dyoPut(dyyLineNew(id, 'mine', { cv: Object.assign({}, cv), rf: [Object.assign({}, rf)] }));
            dymDel(cv.id); dymDel(rf.id);
            dyyFile(id, 'mine');
            if (window.dkDeskBooks) dkDeskBooks();                             // 📔 책상 위에 (자리가 없으면 줄지어)
            dyySelect(id);
            return id;
        }
        window.dyyAssemble = dyyAssemble;
        /* 🔒 지난 해 다이어리 = 보기만 (도련 11-07 · A) : 날짜형(바인더 · 노트)은 그 해가 지나면 펼쳐 읽기 · 넘기기 · 검색만 · 쓰기 · 꾸미기 · 붙이기는 안 돼요
             해 = 컴퓨터 날짜 (dyyThis) · 자정이 넘어도 그 전에 펼친 장은 저장해요 (그 다음 장부터 · js/elements.js loadData · saveData) · 붙여 둔 것은 이미 24시간 고정 */
        const dyyPast = () => dyyBasic() && !!dyyBook() && dyyBook().y < dyyThis() && !(typeof dkIs === 'function' && typeof currentDate !== 'undefined' && dkIs(currentDate));
        let dyyPastAt = false, dyyPastMsg = 0;
        window.dyyPast = dyyPast;
        window.dyyPastMark = () => { dyyPastAt = dyyPast(); dyyPastTag(); };
        window.dyyPastLock = () => dyyPastAt && dyyPast();
        window.dyyPastSay = () => { if (!dyyPast()) return false; if (performance.now() - dyyPastMsg > 1500) { dyyPastMsg = performance.now(); showMsg(`🔒 ${dyyBook().y} 다이어리는 해가 지나서 읽기만 할 수 있어요.<br><span style="font-size:12px;color:#777;">${dyyThis()} 다이어리는 🏪 기본상품 샵 → 📔 다이어리에서 받아요</span>`); } return true; };
        function dyyPastTag() {                                                // 🔒 펼친 장 위 작은 표시
            const ip = document.getElementById('innerPage'); if (!ip) return;
            let t = document.getElementById('dyPastTag'); const on = dyyPast();
            document.documentElement.classList.toggle('dy-past', on);
            if (!on) { if (t) t.remove(); return; }
            if (!t) { t = document.createElement('div'); t.id = 'dyPastTag'; t.className = 'dy-past-tag'; ip.appendChild(t); }
            t.textContent = `🔒 ${dyyBook().y} · 읽기만`;
        }
        window.dyyDesignOf = id => DY_DESIGNS.find(x => x.id === id && x.ch === 'b') || null;

        /* 🗑 버리기 (보관소 · 마지막 한 권도) : 묻고 → 버린 목록 (js/bin.js) → 펼친 권이었으면 다른 권 (없으면 덮어요) → 휴지통 안내 */
        async function dyyDiscard(id) {
            const b = dyyOf(id); if (!b || !dyyIds().includes(b.id)) return;
            if (!await binAsk(`${dyyTitle(b)} 다이어리`, '안에 쓴 기록도 모두 함께 버려져요')) return;
            const open = dyyBookId() === b.id;
            if (open && typeof isCoverOpen !== 'undefined' && isCoverOpen && !turn && typeof saveData === 'function') saveData(false);
            const ln = dyyLine(b.id); dyoDel(b.id);
            await binAdd({ k: 'dy', id: b.id, ln });                           // 줄째 (표지 · 내지 · from)
            if (dyyIsGift(b.id)) dyyGiftTell();                                // (예전 _선물.json 자리 · 목록에서 빠지는 걸로 끝)
            if (window.dkDeskBooks) dkDeskBooks();                             // 📔 책상에서도 사라져요
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
            restore: e => { dyoPut(e.ln && e.ln.id === e.id ? e.ln : dyyLineNew(e.id, 'basic')); if (dyyIsGift(e.id)) dyyGiftTell(); if (!dyyBookId() || dyyBookId() === e.id) { dyyOpenSet(e.id); dyyFit(); } if (window.dyRender) dyRender(); if (window.dkDeskBooks) dkDeskBooks(); },
            purge: async e => {
                const dir = !drive.guest ? await getFolder(dyBookDir(e.id), false) : null;
                if (dir) { const res = await gfetch(`${DRIVE_API}/${dir}`, { method: 'DELETE' }); if (!res.ok && res.status !== 404) throw new Error('purge ' + res.status); }
                const pre = 'diary_' + e.id + '_';                             // 이 기기 메모리에서도
                store.keys().filter(k => k.startsWith(pre)).forEach(k => { store.putLoaded(k, null); drive.dirtyKeys.delete(k); drive.loadedDays.delete(k); });
                if (drive.guest) Object.keys(localStorage).filter(k => k.startsWith(pre)).forEach(k => { try { localStorage.removeItem(k); } catch (x) {} });
                drive.monthIndex.delete('all:' + e.id);
            }
        };

        /* 📔 보관소 칸 (js/skins.js dyTabSet) : 최신 권부터 · 🗑 버리기 */
        /* 📔 보관소 = 다이어리 책꽂이 하나 (도련 10-28) : 날짜형바인더 · 날짜형노트 · 페이지바인더 · 페이지노트 모두 한곳 (현실 책꽂이처럼)
             · 순서 = 지금 펼친 것 → 최근 해 → 먼저 받은 것 · 칸마다 종류 표시 (📅 날짜 바인더 …)
             · 종류가 두 가지 이상 생기면 위에 거르기 칩 (전체 · 날짜형 · 페이지형) · 지금은 날짜 바인더만이라 칩이 안 보여요 */
        const DYY_KINDS = [['date', '📅 1년'], ['page', '📄 페이지']];   // 다꾸러에게 보이는 이름 (도련 11-04 : 날짜형 = 2026 바인더 · 2026 노트 · 페이지노트 · 페이지바인더)
        let dyyFilter = 'all';
        const dyyKindOf = () => 'date';                                       // 받은 권은 모두 날짜형 (바인더 · 노트 · 페이지형은 팔 때 여기에)
        const dyyKindName = b => dyyIsNote(b) ? `📓 ${b.y} 노트` : `📔 ${b.y} 바인더`;
        const dyyType = b => { const d = dyyDesign(b); return d ? { id: DY_DEF, k: '다이어리', g: d.name, n: d.n, mm: d.mm, b: d.b, r: d.r, c: d.c, ntOn: d.ntOn, cvOk: d.cvOk } : null; };   // 📐 그 권의 모양 (js/skins.js dyNow 와 같은 모양)
        function dyyFilterSet(v) { dyyFilter = v; if (window.dyTabSet) dyTabSet('free'); }
        function dyyCells() {
            const cur = dyyBookId();
            const H = window.deskBagHold ? deskBagHold() : null;                 // 🛍️ 봉투 속 다이어리는 꺼낼 때까지 보관소에 없어요 (💻 📲)
            const all = dyyBooks().filter(b => !(H && H.d.has(b.id))).sort((a, b) => (b.id === cur) - (a.id === cur) || b.y - a.y || b.n - a.n);
            if (!all.length) return `<div class="cs-empty">📔 다이어리가 없어요.<br>🏪 기본상품 샵 → 📔 다이어리에서 받아 주세요.<br><button type="button" class="btn primary" style="margin-top:10px" onclick="closeModal('dyModal'); dyyShop()">🏪 받으러 가기</button></div>`;
            const kinds = DYY_KINDS.filter(([k]) => all.some(b => dyyKindOf(b) === k));
            if (kinds.length < 2 || !kinds.some(([k]) => k === dyyFilter)) dyyFilter = 'all';
            const chips = kinds.length > 1 ? `<div class="dyy-chips">${[['all', '전체']].concat(kinds).map(([k, n]) => `<button type="button" class="${k === dyyFilter ? 'on' : ''}" onclick="dyyFilterSet('${k}')">${n}</button>`).join('')}</div>` : '';
            const L = dyyFilter === 'all' ? all : all.filter(b => dyyKindOf(b) === dyyFilter);
            return chips + L.map(b => {
                const sk = DY_COL[b.c] || null, bt = dyyType(b); if (!bt) return '';   // 디자인 속성이 없으면 (console.warn 이미) 안 보여요
                return `<button type="button" class="dy-it dy-yr" data-id="${b.id}" onclick="dyySelect('${b.id}')"><span class="dy-stage">${dyThumb(bt, sk)}<b class="dy-yr-n">${b.y}</b></span><span class="dy-n">${htmlEsc(dyyTitle(b))}</span><small>${dyyKindName(b)} · ${bt.n}</small>`
                    + `<span class="dy-del" role="button" tabindex="0" title="휴지통" aria-label="휴지통" onclick="event.stopPropagation(); dyyDiscard('${b.id}')">🗑</span></button>`;
            }).join('');
        }
        window.dyyFilterSet = dyyFilterSet;
        const dyyOnId = () => dyyBookId();                                     // 보관소에서 지금 펼친 권 표시 (js/skins.js dyRender)

        window.dyyBooks = dyyBooks; window.dyyBookId = dyyBookId; window.dyyHas = dyyHas; window.dyyYear = dyyYear; window.dyyIn = dyyIn; window.dyyClamp = dyyClamp; window.dyySync = dyySync; window.dyySelect = dyySelect;
        window.dyyGuard = dyyGuard; window.dyyEnd = dyyEnd; window.dyyOnOpen = dyyOnOpen; window.dyyShopList = dyyShopList; window.dyyCells = dyyCells; window.dyyShop = dyyShop; window.dyyOnId = dyyOnId; window.dyyPaint = dyyPaint;
        window.dyyNone = dyyNone; window.dyyDiscard = dyyDiscard; window.dyyColor = dyyColor; window.dyyColorPaint = dyyColorPaint; window.dyyLeafNow = () => { const b = dyyBasic() && dyyBook(), L = b && dyyLine(b.id), r = L && Array.isArray(L.rf) && L.rf[0], d = b && DY_DESIGNS.find(x => x.id === dyyColor(b.c)); return r && r.lf ? r.lf : d ? d.lf : ''; };   /* 🗂️ 끼운 날짜 내지 */   // 📔 날짜형 = 모든 날 같은 내지 (상품 '내지') window.dyyIsNote = dyyIsNote;
        window.dyyIsNoteOpen = () => dyyBasic() && dyyIsNote(dyyBook());      // 📓 펼친 권이 날짜형 노트
        window.dyyDesign = dyyDesign; window.dyyTitle = dyyTitle;
        window.dyyBookType = () => dyyType(dyyBook()) || dyyType({ ch: (DY_DESIGNS.find(d => d.gift) || DY_DESIGNS[0] || {}).ch, c: (DY_DESIGNS.find(d => d.gift) || DY_DESIGNS[0] || {}).id });   // 📐 펼친 권 모양 (권이 없으면 처음선물 디자인 · js/skins.js dyNow)

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dyyear'] = true;
