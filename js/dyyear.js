/* 말랑달콤 다이어리 - js/dyyear.js
   📔 기본 다이어리 = 1년짜리 날짜 다이어리 (도련 10-28)
   - 1월 1일 ~ 12월 31일 · 내지는 한 가지 (바꾸고 싶으면 속지로 꾸며요)
   - 📔 디자인 = 서버 상품 (상품공방 '날짜형바인더' · '날짜형노트' · 도련 11-04 : 상품 하나 = 디자인 하나 · js/app.js DY_DESIGNS) · 모양(규격 · 묶음) · 스킨 · 이름 모두 그 상품
   - 다이어리 한 권 = 디자인 하나를 받은 것 = 폴더 하나 (현실처럼 · 도련 10-28)
       · 같은 것도 또 받을 수 있어요 (같은 디자인을 또 받으면 새 한 권) · 다이어리끼리 기록을 나누지 않아요
       · 권 id '2026b-dyb-20261104090000-2' = 해 · 종류 글자(b 날짜형바인더 · n 날짜형노트) · 디자인 id · 그 해 그 디자인 몇 번째 ('diary_book_n' · 버려도 번호는 다시 안 써요 → 되살려도 안 겹쳐요)
       · 저장 : diary_2026b-dyb-20261104090000-2_2026_10_28 → 말랑달콤 / 다이어리 / 2026 dyb-20261104090000 2 / 2026-10-28.json · 🔍 검색 = 그 폴더 / 검색.json (js/drive.js dyBookDir)
       · 디자인 id = 다른 상품처럼 앞머리-한국 시각 14자리 (dyb · dyn · 도련 11-15 · 폴더 이름에도 그대로 · 화면 이름은 상품 이름) · 한 번 올린 id 는 바꾸지 않아요
       · 📅 달력 · 🗂 꾸민 페이지만 보기 · 🔍 검색은 펼친 권 것만
   - 받은 권 = 다이어리 / _목록.json 'diary_own' 의 t: 'date' 줄 (권 하나에 한 줄 · from · js/dyown.js · 981) · 펼친 권 'diary_year' (설정.json · 게스트는 이 기기)
   - 📓 날짜형노트 = 완제품 (샵에서 받으면 바로 권) · 🗂️ 날짜형바인더 = 조립품 (샵 = 해가 적힌 표지 + 날짜 내지 재료 → 🧩 조립하면 권 · 내지는 표지의 해를 따라가요 · 도련 11-07)
   - 처음 온 다꾸러는 그 해 '처음받기' 디자인을 한 권씩 받아요 (상품 속성 · 한 번만 · 다 버려도 다시 주지 않아요 → 샵에서 받아요)
   - 해가 바뀌면 새 다이어리는 🏪 기본상품 샵 → 📔 다이어리 → 날짜형에서 받아요 (공짜여도 받으러 가는 습관 · 도련)
       · 받은 해의 12월 31일 다음으로 넘기거나 · 새해에 다이어리를 펼치면 "○○ 기본 다이어리를 받아 주세요" · 더 안 넘어가요
   - 📔 다이어리 보관소 (다이어리 창) : 받은 권이 쌓여요 · 톡 = 그 권을 펼쳐요 (그 색으로) · 🗑 = 버리기 (js/bin.js · 마지막 한 권도 · 🚛 안 쓴 권 = 바로 영구 삭제 · 🗑 쓴 권 = 휴지통 30일 · 도련 11-11)
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
        /* 🗑 쓴 다이어리 휴지통 칸 (도련 11-11 · 다이어리 / _목록.json 'diary_dy_bin' 🔐) : [{ u: 권 id, at: 버린 때, ln: 그 권 줄 }] · 🚛 영구삭제 칸 'diary_dy_gone' (js/bin.js) */
        const DYB_KEY = 'diary_dy_bin', DYB_L = 'malang_dy_bin';
        function dyyBinList() { const v = prefGet(DYB_KEY, DYB_L); return Array.isArray(v) ? v.filter(x => x && typeof x.u === 'string' && x.ln && x.ln.id === x.u) : []; }
        const dyyBinSet = L => prefSet(DYB_KEY, DYB_L, L);
        const dyyOut = () => { const s = window.goneIds ? goneIds('dy') : new Set(); dyyBinList().forEach(x => s.add(x.u)); return s; };   // 내 목록에 들이지 않는 권 (영구삭제 · 휴지통)
        const dyyDead = id => dyyOut().has(id);                               // 🚛 🗑 이 권에는 저장하지 않아요 (js/drive.js writeDay · 목록이 정답)
        let dyyDeadSaid = '';
        function dyyDeadSay(id) { if (dyyDeadSaid === id) return; dyyDeadSaid = id; if (window.showMsg) showMsg('🗑 버린 다이어리라서 저장하지 않았어요.<br><small>다른 기기에서 버렸을 수 있어요</small>'); }
        /* ✍️ 한 번 꾸미면 영원히 '쓴 다이어리' (도련 11-11 · 표지든 페이지든 · 지워도 그대로) : 그 권 줄 w: 1 */
        function dyyUsedMark(id) { const L = dyyLine(id); if (L && !L.w) dyoPut(Object.assign({}, L, { w: 1 })); }
        async function dyyUsed(id) {                                           // 버릴 때 : 표시 · 없으면 (예전 권) 그 권 폴더 · 휴지통 폴더를 봐요 (못 닿으면 에러)
            const L = dyyLine(id); if (L && L.w) return true;
            if (!dyyOnline()) return store.keys().some(k => k.startsWith('diary_' + id + '_') && store.getItem(k) != null);
            const dir = await getFolder(dyBookDir(id), false);
            if (dir && (await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}'`, 'id,name')).some(f => !/^(다이어리|검색)\.json$/.test(f.name))) return true;
            return window.trHasBook ? await trHasBook(id) : false;            // 지운 페이지가 방 안 휴지통에 있어도 = 쓴 다이어리
        }
        const dyyLockAt = () => { const L = dyyBasic() && dyyLine(dyyBookId()); return L && +L.lk || 0; };   // 🔒 되살린 권 : 되살린 때까지 꾸민 것은 볼 수만 (js/elements.js)
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
            if (performance.now() - dyyNoneAt > 1500) { dyyNoneAt = performance.now(); showAsk('📔 다이어리가 없어요.<br>🏪 기본상품 샵 → 📔 다이어리에서 받아 주세요.<br><small>꾸민 기록이 있는 다이어리는 버려도 30일 안에 ⚙ 설정 → 🗑 휴지통에서 되살릴 수 있어요</small>', '🏪 받으러 가기', '나중에').then(ok => { if (ok) dyyShop(); }); }
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
            const pid = b && dyyBasic() ? dyyColor(b.c) : t ? (t.pid || t.id) : '', ring = window.dyRingCss ? dyRingCss(pid) : '';   // 📁 펼친 권의 표지 · 링 = 그 상품 폴더의 파일 (도련 11-18)
            r.setProperty('--dy-face', window.dyFaceCss ? dyFaceCss(pid) : 'none');
            if (ring) r.setProperty('--dy-ring', ring); else r.removeProperty('--dy-ring');
            dyStrapPaint();                                                   // 🔘 스트랩 바인더
        }
        /* 🔘 스트랩 바인더 (도련 11-28 시안 A '모든지 현실처럼') : 링 바인더 표지 + 오른쪽 끈 + 은색 똑딱이 (상품공방 '스트랩')
           - 잠겨 있으면 표지가 안 열려요 (밀면 들썩 · js/page.js grab → dyStrapLocked · dyStrapNudge)
           - 끈을 오른쪽으로 끌면 = 풀려요 (끈이 바깥으로 젖혀져요) · 풀린 끈을 왼쪽으로 끌어 덮으면 = 잠겨요 · 덮을 때 저절로 안 잠겨요 (수동 · 도련 11-28)
           - 잠김 · 풀림 = 권마다 이 기기에 (malang_strap · 화면 모습이라 드라이브엔 안 올려요) */
        const STRAP_LS = 'malang_strap';
        function dyStrapNow() {
            const b = dyyBook(), t = !dyyBasic() && typeof dkType === 'function' ? dkType() : null;
            const d = b && dyyBasic() ? DY_DESIGNS.find(x => x.id === dyyColor(b.c)) : t;
            return d && d.strap ? { key: String((b && b.id) || (t && t.id) || 'x') } : null;
        }
        const strapMap = () => { try { const m = JSON.parse(localStorage.getItem(STRAP_LS) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } };
        const strapShut = key => strapMap()[key] !== 0;                       // 처음 = 잠긴 채 와요
        function strapSet(key, shut) { const m = strapMap(); if (shut) delete m[key]; else m[key] = 0; try { localStorage.setItem(STRAP_LS, JSON.stringify(m)); } catch (e) {} }
        function dyStrapPaint() {
            const cp = document.getElementById('coverPage'), bk = document.getElementById('diaryBook'), s = dyStrapNow(); document.documentElement.classList.toggle('dy-strap', !!s);
            let el = document.getElementById('cvStrap');
            if (!s || !cp || !bk) { if (el) el.remove(); return; }
            if (!el) {
                el = document.createElement('div'); el.id = 'cvStrap'; el.className = 'cv-strap';
                el.innerHTML = '<i class="cv-sock" aria-hidden="true"></i><b class="cv-band" title="끈을 끌어서 똑딱이 풀기 · 잠그기"></b>';
                el.querySelector('.cv-band').addEventListener('pointerdown', strapDown);
            }
            if (el.parentNode !== bk) bk.appendChild(el);                        // 책 안 · 겉표지 위 (겉표지는 밖을 잘라서 끈이 나올 수 없어요 · css .cv-strap = 겉표지와 같은 자리)
            el.dataset.k = s.key; el.classList.toggle('open', !strapShut(s.key)); el.style.removeProperty('--sr');
            { const cs = getComputedStyle(cp), band = el.querySelector('.cv-band'); Object.assign(band.style, { backgroundImage: cs.backgroundImage, backgroundColor: cs.backgroundColor, backgroundSize: cs.backgroundSize, backgroundPosition: '0 0' }); }   // 끈 = 표지와 같은 무늬 그대로
        }
        let strapDg = null;
        function strapDown(e) {
            const el = document.getElementById('cvStrap'); if (!el || (e.pointerType === 'mouse' && e.button !== 0)) return;
            e.preventDefault(); e.stopPropagation();
            const band = e.currentTarget, open = el.classList.contains('open'), w = band.getBoundingClientRect().width || 80;
            strapDg = { id: e.pointerId, x: e.clientX, open, w, band, el, r: open ? 180 : 0 };
            try { band.setPointerCapture(e.pointerId); } catch (er) {}
            el.classList.add('drag');
            band.addEventListener('pointermove', strapMove); band.addEventListener('pointerup', strapUp); band.addEventListener('pointercancel', strapUp);
        }
        function strapMove(e) {
            const d = strapDg; if (!d || e.pointerId !== d.id) return;
            const dx = (e.clientX - d.x) * ((window.dyRot && dyRot()) ? 1 : 1);   // 겉표지는 돌리지 않아요
            d.r = Math.max(0, Math.min(180, (d.open ? 180 : 0) + dx / d.w * 180));   // 오른쪽으로 끌면 젖혀져요 · 왼쪽으로 끌면 덮여요
            d.el.style.setProperty('--sr', d.r.toFixed(1) + 'deg');
        }
        function strapUp(e) {
            const d = strapDg; if (!d || e.pointerId !== d.id) return; strapDg = null;
            ['pointermove', 'pointerup', 'pointercancel'].forEach((t, i) => d.band.removeEventListener(t, [strapMove, strapUp, strapUp][i]));
            const open = d.r > 90; d.el.classList.remove('drag'); d.el.style.removeProperty('--sr');
            if (open !== d.open) { strapSet(d.el.dataset.k, !open); d.el.classList.toggle('open', open); d.el.classList.remove('snap'); void d.el.offsetWidth; d.el.classList.add('snap'); strapSnd(); }
        }
        function strapSnd() { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const a = strapSnd.a || (strapSnd.a = new C()), t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(500, t + .05); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .07); o.connect(g).connect(a.destination); o.start(t); o.stop(t + .08); } catch (e) {} }   // 🔊 딱!
        let strapTold = 0;
        window.dyStrapLocked = () => { const s = dyStrapNow(); return !!s && strapShut(s.key) && !!document.getElementById('cvStrap'); };
        window.dyStrapNudge = e => {                                           // 잠긴 채 밀면 = 표지가 들썩 · 처음 몇 번은 말풍선
            const cp = document.getElementById('coverPage'), el = document.getElementById('cvStrap'); if (!cp) return;
            cp.classList.remove('cv-nudge'); void cp.offsetWidth; cp.classList.add('cv-nudge'); setTimeout(() => cp.classList.remove('cv-nudge'), 450);
            if (el) { el.classList.remove('hint'); void el.offsetWidth; el.classList.add('hint'); }
            if (strapTold < 3 && window.bubbleAt && el) { strapTold++; const r = el.querySelector('.cv-band').getBoundingClientRect(); bubbleAt('strapSay', 'twz-say', '🔘 끈을 오른쪽으로 끌어 똑딱이를 먼저 풀어요', r.left + r.width / 2, r.top, { half: 140, dy: 14, top: 40 }); }
        };
        window.dyStrapPaint = dyStrapPaint;
        let dyyLastNote = null;
        function dyyPaint() {
            const b = dyyBook(), yl = document.getElementById('cvYear'); if (yl) yl.textContent = b && dyyBasic() ? String(b.y) : '';   // 📔 겉표지 해 이름판 (도련 10-30 시안)
            if (window.dkDeskBooks) setTimeout(dkDeskBooks, 0);              // 📔 책상 = 다이어리 보관소 (펼쳐 둔 권 · 나머지 권 다시 · js/desk.js)
            dyyColorPaint();
            if (window.dyyPastMark) dyyPastTag();
            if (window.dkCoverPaint) dkCoverPaint();                           // 📢 📕 권을 바꾸면 그 상품의 공지 · 표지 꾸미기 (js/skins.js)
            if (!b) return;
            const d = dyyDesign(b), nt = dyyBasic() && d ? d.b + ':' + d.r + ':' + d.mm : null;   // 📐 디자인마다 모양(묶음 · 크기)이 달라요 → 바뀌면 다시 그리기 (규격 mm 도 · 도련 11-19 1315 : 바이블 → A6 로 바뀌었는데 r 이 같아 그대로였어요)
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
            return r ? dyyRefillProd(r, from) : { id: dymNewId(), t: 'drefill', n: d.n, lf: d.lf || '', g: `${d.name} 날짜 내지`, from };
        }
        /* 🧩 샵에서 받은 바인더 재료 (표지 · 내지) = 봉투 속 (도련 11-11 : 꺼내기 전엔 🧩 바인더 조립 바구니에 없어요) · m = 재료 (책상에 놓는 권이 아니에요) */
        function dyyMatGot(o) { dymPut(o); window.dyyLastGiven = { id: o.id, t: Date.now(), m: 1 }; }
        function dyyPNoteGive(p) {                                           // 📕 페이지노트 (완제품) = 다이어리 목록에 바로 한 권 (📓 페이지노트 창 '기본' 칸 · 도련 11-11)
            const id = dymNewId();
            dyoPut({ id, t: 'note', pid: p.id, g: p.g, n: p.n, b: p.b, c: p.c, cols: p.cols, cw: 1, pg: p.pg, lv: p.lv, from: 'basic' });   // 🎁 첫 선물 노트와 같은 모양 (js/dymaker.js)
            window.dyyLastGiven = { id, t: Date.now() };                       // 🛍️ 봉투 카드가 이 권을 기억해요 (꺼낼 때까지 노트 창 · 책상에 없어요 · 도련 11-11)
            if (window.shopBagOn && shopBagOn() && window.dkBagHold) dkBagHold(id);
            return 'ok';
        }
        async function dyyPCoverGive(p) { try { if (!await dymReady()) return 'fail'; } catch (e) { return 'fail'; } dyyMatGot({ id: dymNewId(), t: 'cover', pid: p.id, g: p.g, n: p.n, c: p.c, cols: p.cols, cw: 1, from: 'basic' }); return 'ok'; }   // 🏪 샵 페이지바인더 표지 = 🧩 재료
        async function dyyRefillGive(R) { try { if (!await dymReady()) return 'fail'; } catch (e) { return 'fail'; } dyyMatGot(dyyRefillProd(R, 'basic')); return 'ok'; }   // 🏪 샵 바인더 내지 = 🧩 재료
        function dyyNewId(y, d, mem) {                                         // d = 디자인 (DY_DESIGNS)
            const k = `${y}${d.ch}-${d.id}-`, cnt = Object.assign({}, prefGet(DYY_N, DYY_N_L) || {});
            const used = dyyIds().concat([...dyyOut()]).map(dyyOf).filter(b => b && b.y === y && b.ch === d.ch && b.c === d.id).map(b => b.n);
            const n = Math.max(+cnt[k] || 0, ...used, 0) + 1;
            cnt[k] = n; dyyPut(DYY_N, DYY_N_L, cnt, mem);
            return k + n;
        }

        /* 🗂 받은 권 = 권 폴더 + 다이어리.json (도련 11-05 · 안 쓴 권도) : 말랑달콤 / 다이어리 / 2026 분홍 1 / 다이어리.json 🔐 { id, from, at }
             만들면 그 권 줄에 f: 1 (다시 확인하지 않아요) · 다이어리 / _목록.json 이 없어지면 = 권 폴더 + 첫 선물로 되살려요 · 🗑 영구 삭제 = 폴더째
             🎁 첫 선물 권은 꾸미기 시작할 때 폴더가 생겨요 (첫 접속 요청 줄이기) */
        const DYY_FILE = '다이어리.json';
        const dyyOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        async function dyyFile(id, from, isNew) {                              // isNew = 방금 새 번호로 만든 권 (그 폴더는 아직 없어요 → 찾지 않고 바로 만들어요 · 도련 11-18 요청 줄이기)
            if (!dyyOnline() || typeof ownLock !== 'function') return;
            if (isNew && typeof drive !== 'undefined' && drive.folderMiss) drive.folderMiss.set(dyBookDir(id).join('/'), Date.now());
            try {
                const dir = await getFolder(dyBookDir(id), true), cur = await findFile(dir, DYY_FILE);
                if (!cur) { const I = dyyLine(id) || {}, md = I.md || (I.cv && I.cv.md); await driveUpsert(dir, DYY_FILE, null, await ownLock(Object.assign({ id, from: I.from || from, at: I.at || '' }, md ? { md } : {}))); }   // ✏️ 내가 만든 디자인도 (되살릴 때)
                const L = dyyLine(id); if (L && !L.f) dyoPut(Object.assign({}, L, { f: 1 }));   // 권 폴더를 만들었어요 (다시 확인하지 않아요)
            } catch (e) { console.warn('📔 다이어리.json', id, e); }
        }
        async function dyyRescue() {                                           // 🛟 권 폴더 → 받은 권 (못 읽으면 에러 → 다음에 다시)
            const ids = [], lines = [], gone = dyyOut();                        // 🚛 영구삭제 · 🗑 휴지통 권은 빼요 (목록이 정답)
            for (const [path, note] of [[DIARY_PATH, null]]) {                // 📔 다이어리 폴더 하나 (노트인지 = 디자인으로 · 도련 11-07)
                const root = await getFolder(path, false); if (!root) continue;
                for (const dir of await driveList(`'${root}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`, 'id,name')) {
                    const id = dyBookOfName(dir.name, note); if (!dyyOf(id) || gone.has(id) || ids.includes(id)) continue;
                    const f = await findFile(dir.id, DYY_FILE);
                    let o = null;
                    if (f) { try { o = await ownUnlock(await readFileText(f.id)); } catch (e) {} if (!o || o.id !== id) continue; }   // 🔐 남의 것은 빼요 (다이어리.json 이 없는 예전 권은 폴더 그대로)
                    ids.push(id); lines.push(dyyLineNew(id, dyoFrom(o && o.from, 'basic'), Object.assign({ at: (o && o.at) || '', f: 1 }, o && o.md ? { md: o.md } : {}))); if (o && o.md && window.dyoMy) dyoMy(o);
                }
            }
            return lines;
        }
        let dyyBusy = false;
        const dyyIsGift = id => { const I = dyyLine(id); return !!I && !!I.start && !I.f; };   // 🎁 처음받기 (start · 아직 권 폴더 없음 · 도련 11-09)
        window.dyyGiftOwn = () => dyyIds().filter(dyyIsGift);
        function dyyGift() {                                                   // 🎁 처음 선물 (상품 속성 '처음받기' · 도련 11-04) · 다이어리 목록에 바로 (from basic + start · 바인더는 조립된 채로 · 981)
            const y = dyyThis(), G = DY_DESIGNS.filter(d => d.gift), ids = G.map(d => dyyNewId(y, d)), fl = G.findIndex(d => d.float);
            const lines = G.map((d, i) => dyyLineNew(ids[i], 'basic', Object.assign({ start: 1 }, d.ch === 'b' ? { cv: dyyCoverOf(y, d, 'basic'), rf: [dyyRefillOf(d, 'basic')] } : {})));   // 🎁 처음받기 = 무료(basic) + start (도련 11-09)
            dyoSet(dyoAll().filter(x => x.t !== 'date').concat(lines)); if (ids.length) prefSet(DYY_OPEN, DYY_OPEN_L, ids[Math.max(0, fl)]);
            setTimeout(() => { if (window.dkvNew) ids.forEach(dkvNew); }, 0);   // 🆕 처음 선물 권 = 책상 줄에 (1356)
            if (window.giftMark) giftMark();   // 펼쳐 둘 권 = 상품공방 '처음띄움' (없으면 첫 권)
            if (window.deskVolInit) deskVolInit(G.map((d, i) => ({ id: ids[i], spot: d.desk, n: d.name })));   // 🎁 처음 책상 자리 = 상품공방 '처음책상' (없으면 봉투 · 도련 11-06)
            if (window.diag) diag('dygift', { gift: G.map((d, i) => `${ids[i]} ${d.name} ${d.n} ${d.mm}${d.float ? ' 🎈' : ''}`), pg: (typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).filter(p => p.gift).map(p => `${p.id} ${p.g} ${p.n} ${p.mm}${p.float ? ' 🎈' : ''}`), open: ids[Math.max(0, fl)] || '' });   // 🧾 처음 선물 권 · 띄울 권 (도련 11-19 · 처음 로그인 규격 찾기)
            window.dkGiftFloat = fl >= 0 ? ids[fl] : (typeof DY_TYPES !== 'undefined' && DY_TYPES.some(p => p.gift && p.float)) ? 'pg' : '';   // 🎈 처음에 떠 있는 권 (js/desk.js deskLoginShow · 'pg' = 페이지 다이어리가 뒤에 떠요)
            setTimeout(dyyPaint, 0);                                            // 📐 선물 권 모양으로 다시 그리기 (도련 11-19 : 권이 생기기 전 크기 그대로 떠올랐어요)
            return ids;
        }
        /* 🎁 처음 온 다꾸러 : 그 해 '처음받기' 디자인마다 한 권 (한 번만 · 드라이브를 읽은 뒤 · 게스트는 들어올 때 · js/drive.js) · 펼칠 권 = 첫 권
           🛟 로그인했는데 받은 권 목록이 없으면 = 먼저 권 폴더를 봐요 (있으면 되살리기 · 없으면 처음 선물 · 도련 11-05) */
        function dyySync() {
            if (!dyoHas()) {
                if (!dyyOnline() || drive.newbie) dyyGift();                     // 👤 게스트 = 이 기기 목록만 · 🆕 처음 온 다꾸러 = 뒤지지 않고 바로 선물
                else if (!dyyBusy) {
                    dyyBusy = true;
                    Promise.resolve(window.deskGiftRead ? deskGiftRead() : null).then(async had => {
                        const lost = keyMade('dyown');   // 📝 목록 파일을 만든 적이 있어요 (또는 백업에 선물 아닌 권) = 없어진 것 · 아니면 아직 선물 그대로 (권 폴더를 안 뒤져요 · 도련 11-07)
                        return [lost ? await dyyRescue() : [], had];
                    }).then(([found, had]) => {
                        if (dyoHas()) return [];                                         // 그사이 다른 기기에서
                        const gone = dyyOut(); if (window.goneHeal) goneHeal('dy').forEach(id => gone.add(id));   // 🚛 영구삭제 · 🗑 휴지통 권 (백업 속 칸도 · 도련 11-11)
                        const ok = x => x && typeof x === 'object' && typeof x.id === 'string' && ['date', 'note', 'binder'].includes(x.t) && !gone.has(x.id) && (x.t !== 'date' || dyyOf(x.id));
                        const gifts = (had && Array.isArray(had.dy) ? had.dy : []).filter(ok);
                        const all = [], seen = new Set(), add = x => { if (ok(x) && !seen.has(x.id)) { seen.add(x.id); all.push(x); } };
                        found.forEach(add); gifts.forEach(add);
                        if (!all.length) { if (!had) dyyGift(); else dyoSet([], true); return []; }   // 선물을 준 적이 있는데 비었으면 = 다 버린 사람
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
            if (!dyyBasic() || !dyyBook() || typeof currentDate === 'undefined' || isSpot(currentDate) || currentDate.getFullYear() === dyyYear()) return;
            curSet(dyyClamp(new Date()));
            const d = document.getElementById('pageDateDisplay'); if (d && typeof formatDate === 'function') d.innerText = formatDate(currentDate);
            if (isCoverOpen && !turn && typeof loadData === 'function') loadData();
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
            const to = (typeof dyOpenDate === 'function' && dyOpenDate()) || dyyClamp(isSpot(currentDate) ? new Date() : new Date(currentDate));
            curSet(to);
            if (!isCoverOpen) return;
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
            if (isSpot(currentDate)) return;                                  // 📕 표지 · 장
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
                ? { cnt: `${y} ${d.name}${d.named ? ' 표지' : ''}`, desc: `${d.name} · 바인더 표지 · ${d.n} (${d.mm}) · 📅 ${y}년 · 🧩 바인더 조립에서 같은 크기 날짜 내지를 끼워 써요`, look: 'diary', yr: y, dc: d.id, cat: 'dyb', give: () => dyyGive(y, d), name: `${y} ${d.name}${d.named ? ' 표지' : ''}` }
                : { cnt: `${y} ${d.name}`, desc: `${d.name} · 노트 · ${d.n} (${d.mm}) · ${y}년 1월 1일 ~ 12월 31일 · 받을 때마다 새 다이어리 한 권 (다른 다이어리 기록과 따로)`, look: 'note', yr: y, dc: d.id, cat: 'dyn', give: () => dyyGive(y, d), name: `${y} ${d.name}` })
                .concat((typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).filter(p => p.cvOnly && !p.off).map(p => ({   // 🗂️ 페이지바인더 표지 (도련 11-07)
                    cnt: `${p.g}${p.named ? ' 표지' : ''}`, desc: `${p.g} · 바인더 표지 · ${p.n} (${p.mm}) · 🧩 바인더 조립에서 같은 크기 페이지 내지를 끼워 써요`, look: 'pbinder', pid: p.id, cols: p.cols, n: p.n, cat: 'pgb', give: () => dyyPCoverGive(p), name: `${p.g}${p.named ? ' 표지' : ''}` })))
                .concat((typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).filter(p => p.k === '노트' && !p.off).map(p => ({   // 📕 페이지노트 = 완제품 (도련 11-11 · 받으면 바로 한 권)
                    cnt: p.g, desc: `${p.g} · 페이지노트 · ${p.n} (${p.mm}) · ${p.pg}펼침면 · 받을 때마다 새 노트 한 권 (다른 노트 기록과 따로)`, look: 'pnote', pid: p.id, cols: p.cols, n: p.n, cat: 'pgn', give: () => dyyPNoteGive(p), name: p.g })))
                .concat((typeof DY_REFILLS !== 'undefined' ? DY_REFILLS : []).filter(r => !r.off && prodList(r.K).some(x => x.id === r.id)).map(r => ({   // 📅 날짜 내지 · 📄 페이지 내지 (샵 칸도 둘 · 도련 11-07)
                    cnt: r.g, desc: `${r.t === 'date' ? '📅 날짜 내지 · 끼운 표지의 해를 따라가요' : `📄 페이지 내지 · ${r.pg}펼침면`} · ${r.n} (${r.mm}) · 🧩 같은 크기 바인더 표지에 끼워요`, look: 'refill', rid: r.id, lf: r.lf, rt: r.t, n: r.n, cat: r.t === 'date' ? 'dyr' : 'pgr', give: () => dyyRefillGive(r), name: r.g })));
        }
        /* 🏪 샵 📖 펼쳐보기 = 가상 틀 (도련 11-27 '가상의 다이어리 틀 안에 디자인 · 페이지 수 · 표지에서 페이지 넘기기만') : 책 엔진 (js/book.js bookTry · 📒 🤍 와 같은 틀 · 처음부터 가운데)
             - 모양은 진짜 다이어리 것을 빌려요 = 묶음 그림 js/skins.js dyParts (링 · 밴드 · 접힘 · 리본) · 그 상품 링.svg (--dy-ring) · 표지.svg · 색 · 내지 무늬 · 규격 mm · 펼침면 수
             - 저장 · 붙이기 · 드라이브 = 이 틀에는 처음부터 없어요 (닫으면 사라져요)
             📔 날짜형노트 · 📕 페이지노트 = 표지 + 모든 펼침면 · 🗂️ 바인더 표지 = 표지 + 빈 묶음 (내지는 따로 사요) · 📅 📄 내지 = 펼친 종이만 */
        const dyyDays = y => (new Date(y, 1, 29).getMonth() === 1 ? 366 : 365);   // 📅 그해 날 수 = 펼침면 수
        const dyyBind = b => ((window.MK && MK.BINDS || []).find(v => v[0] === b) || [, ''])[1];   // 묶음 이름 (링 · 실 제본 …)
        function dyyTrySpec(x) {
            const lfBg = (lf, p, bg) => `--page-bg:${bg};background:${window.leafCss ? leafCss(lf, p % 2 ? 'r' : 'l') : bg}`;   // 📖 펼침면 그림 = 왼쪽 반 / 오른쪽 반
            const pageOf = (P, bg) => p => `<div class="bnd-pg" style="${htmlEsc(lfBg(P[p][0], p, bg))}"><b class="abx-no">${htmlEsc(P[p][1])}</b></div>`;
            const dates = (y, lf) => { const P = []; for (let d = new Date(y, 0, 1); d.getFullYear() === y; d.setDate(d.getDate() + 1)) P.push([lf, `${d.getMonth() + 1}월 ${d.getDate()}일`], [lf, '']); return P; };   // 📖 하루 = 펼침면
            const nums = (pg, lv, lf) => { const P = []; for (let k = 1; k <= pg; k++) { const r = (lv || []).find(v => k >= v[0] && k <= v[1]), f = r ? r[2] : lf; P.push([f, String(k)], [f, '']); } return P; };   // 📖 쪽수 = 펼침면 수
            const hex = v => (String(v || '').match(/#[0-9a-f]{6}/i) || [''])[0];
            const book = L => {
                const ring = window.dyRingCss ? dyRingCss(L.pid) : '', gap = (MK.GAP[L.b] || 0);
                const ring6 = L.b === 'ring', c1 = hex(L.cover) || L.border;   // 🗂️ 링 바인더 = 🧩 바인더 조립 책상과 같은 묶음 · 색 (BOOK_RINGS · 도련 11-27) · 📓 노트 = 진짜 다이어리 묶음 그림 (dyParts)
                return { id: 'try', spread: true, cls: ring6 ? 'bk-bd' : 'bk-dy', mm: MK.mmOf(L.mm), colors: ring6 ? [c1, `color-mix(in srgb, ${c1} 72%, #5a3a46)`] : [c1, L.border], face: window.dyFaceCss ? dyFaceCss(L.pid, 'px') : 'none',
                    pages: Math.max(1, L.P.length), page: L.P.length ? pageOf(L.P, L.page) : () => '<div class="bnd-pg end"></div>', blank: () => '<div class="bnd-pg end"></div>',
                    title: () => htmlEsc(L.nm) + ' <small>· 표지</small>', cover: () => `<div class="bk-cover bd"><span class="bk-cvlb">${htmlEsc(L.l1 || L.nm)}</span><small>${htmlEsc(L.l2 || L.n)}</small>${L.strap ? '<i class="bk-strap" aria-hidden="true"></i>' : ''}</div>`,   /* 🔘 스트랩 (도련 11-28) */   /* 🏷 썸네일 정보 = 두 줄 (도련 11-28 '어떤 상품인지 알 수 있게 · 기준 통일') : 아이콘 (해) 종류·이름 / 규격 · 펼침면 수 · 묶음 */
                    spine: () => ring6 ? BOOK_RINGS : window.dyParts ? dyParts({ b: L.b })[1] : '', cvSpine: ring6 && !L.strap ? 'ring' : '',   // 🔘 스트랩 = 표지가 등까지 감싸 링이 안 보여요
                    wire: st => { const r = st.closest('.bk'); r.style.setProperty('--dy-c', L.border); r.style.setProperty('--dy-face', window.dyFaceCss ? dyFaceCss(L.pid) : 'none');   // 🎨 이 틀에만 (내 다이어리 색은 그대로)
                        if (ring) r.style.setProperty('--dy-ring', ring); r.style.setProperty('--gap', `calc(${gap} * var(--mmk) * 1px)`); r.style.setProperty('--gh', `calc(${gap / 2} * var(--mmk) * 1px)`); } };
            };
            if (x.look === 'diary' || x.look === 'note') {
                const d = DY_DESIGNS.find(v => v.id === x.dc), c = d && DY_COL[d.id]; if (!d || !c) return null;
                return book({ nm: x.name || d.name, n: d.n, l1: `${x.look === 'note' ? '📓' : '📔'} ${x.name || d.name}`, l2: x.look === 'note' ? `${d.n} · ${dyyDays(+x.yr || dyyThis())}펼침면` : `${d.n} · ${dyyBind(d.b)}${d.strap ? ' · 스트랩' : ''}`, strap: x.look !== 'note' && d.strap, b: d.b, mm: d.mm, pid: d.id, cover: c.cover, border: c.border, page: c.page, P: x.look === 'note' ? dates(+x.yr || dyyThis(), d.lf) : [] });
            }
            if (x.look === 'pbinder' || x.look === 'pnote') {
                const p = DY_TYPES.find(v => v.id === x.pid); if (!p) return null;
                return book({ nm: p.g, n: p.n, l1: x.look === 'pnote' ? `📕 ${p.g}` : `🗂️ ${p.g}${p.named ? ' 표지' : ''}`, l2: x.look === 'pnote' ? `${p.n} · ${p.pg}펼침면` : `${p.n} · ${dyyBind(p.b)}${p.strap ? ' · 스트랩' : ''}`, strap: x.look !== 'pnote' && p.strap, b: p.b, mm: p.mm, pid: p.id, cover: p.cols.표지색 || p.c, border: p.cols.테두리색, page: p.cols.속지색, P: x.look === 'pnote' ? nums(p.pg, p.lv, (p.lv[p.lv.length - 1] || [])[2]) : [] });
            }
            if (x.look === 'refill') {                                         // 📅 📄 내지 = 표지 없이 펼친 종이 묶음 (구멍 자리)
                const r = DY_REFILLS.find(v => v.id === x.rid); if (!r) return null;
                const P = r.t === 'date' ? dates(dyyThis(), r.lf) : nums(r.pg, r.lv, r.lf);
                return { id: 'try', spread: true, cls: 'bk-bd bk-try-dy', mm: MK.mmOf(r.mm), colors: ['#fffdfb', '#d9cbd2'], face: 'none', open: true, stay: true, pages: P.length, page: pageOf(P, '#fffdfb'),
                    blank: () => '<div class="bnd-pg end"></div>', title: () => htmlEsc(r.g), cover: () => '', spine: () => '', holes: true };   // 🕳️ 내지만 = 구멍만 (링 없이 · 도련 11-28)
            }
            return null;
        }
        window.dyyTrySpec = dyyTrySpec; window.dyyDays = dyyDays;
        async function dyyGive(y, d) {
            if (d.ch === 'b') {                                                // 🗂️ 날짜형바인더 = 조립품 : 샵 = 해가 적힌 표지 → 🧩 바인더 재료 (도련 11-07 · 981)
                try { if (!await dymReady()) return 'fail'; } catch (e) { return 'fail'; }
                dyyMatGot(dyyCoverOf(y, d, 'basic'));                         // 📄 내지는 따로 (🏪 바인더 내지 · 도련 11-07) · 🛍️ 봉투 속
                return 'ok';
            }
            const id = dyyNewId(y, d);                                         // 📓 날짜형노트 = 완제품 → 바로 권
            dyoPut(dyyLineNew(id, 'basic'));                                   // 🏪 기본상품 샵 (나중 유료 = 'paid')
            dyyFile(id, 'basic', true);                                        // 🗂 권 폴더 + 다이어리.json (도련 11-05)
            window.dyyLastGiven = { id, t: Date.now() };                       // 🛍️ 봉투 카드가 이 권을 기억해요 (끌어 놓으면 책상 그 자리 · js/basket.js bagNote)
            if (window.shopBagOn && shopBagOn() && window.dkBagHold) dkBagHold(id);   // 🏪 가게에서 산 것 = 봉투 속 (책상에 꺼내 놓을 때까지 책상에 없어요 · 펼쳐 둔 권도 그대로 · 도련 10-30)
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
            if (window.driveLater) driveLater(() => dyyFile(id, 'mine', true)); else dyyFile(id, 'mine', true);   // ⏸ 🧩 바인더 조립 중이면 = 나갈 때 권 폴더를 만들어요
            if (window.dkDeskBooks) dkDeskBooks();                             // 📔 책상 위에 (자리가 없으면 줄지어)
            dyySelect(id);
            return id;
        }
        window.dyyAssemble = dyyAssemble;
        /* ✏️ 날짜형노트 만들기 (도련 11-11 · 노트 만들기 → 날짜형노트) : 내 디자인(md) → 그 해 권 하나 (from mine · 노트 = 완제품) */
        function dyyMakeNote(md, y) {
            if (window.dyoMy) dyoMy({ md });
            const d = DY_DESIGNS.find(x => x.id === md.id && x.ch === 'n'); if (!d) return '';
            const id = dyyNewId(y, d);
            dyoPut(dyyLineNew(id, 'mine', { md }));
            dyyFile(id, 'mine', true);
            if (window.dkDeskBooks) dkDeskBooks();
            dyySelect(id);
            return id;
        }
        window.dyyMakeNote = dyyMakeNote;
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

        /* 버리기 (보관소 · 마지막 한 권도 · 도련 11-11 두 갈래) : 🚛 안 쓴 권 = 바로 영구 삭제 · 🗑 쓴 권 = 방 안 휴지통 30일 (권 그대로 · 되살리면 꾸민 것은 볼 수만) */
        async function dyyDiscard(id) {
            const b = dyyOf(id); if (!b || !dyyIds().includes(b.id)) return;
            const open = dyyBookId() === b.id;
            if (open && typeof isCoverOpen !== 'undefined' && isCoverOpen && !turn && typeof saveData === 'function') saveData(false);
            if (open && typeof flushUpload === 'function' && dyyOnline()) { try { await flushUpload(); } catch (e) {} }   // 방금 꾸민 것까지 올린 뒤에 판단
            let used;
            try { used = await dyyUsed(b.id); } catch (e) { console.warn('📔 쓴 다이어리인지', e); showMsg('⚠ 지금은 버릴 수 없어요. 잠시 후 다시 해 주세요.'); return; }
            const nm = `${dyyTitle(b)} 다이어리`, toBin = used && dyyOnline();   // 👀 구경 중은 휴지통이 없어요
            if (!await (toBin ? binAskBook(nm) : binAsk(nm))) return;
            const ln = dyyLine(b.id); dyoDel(b.id);
            if (toBin) dyyBinSet(dyyBinList().filter(x => x.u !== b.id).concat([{ u: b.id, at: Date.now(), ln: Object.assign({}, ln, { w: 1 }) }]));   // 🗑 줄째 (표지 · 내지 · from)
            else await binAdd({ k: 'dy', id: b.id, ln });                       // 🚛 (👀 구경 중은 쓴 권도 바로)
            if (window.dkDeskBooks) dkDeskBooks();                             // 📔 책상에서도 사라져요
            const next = dyyBook();
            if (open) { if (next) { dyyOpenSet(next.id); if (dyyBasic()) dyyReload(); } else dyyShut(); }
            if (window.dyTabSet) dyTabSet('free');
            const again = dyyBooks().length ? '' : '새 다이어리는 🏪 기본상품 샵 → 📔 다이어리에서 받을 수 있어요';
            await (toBin ? binToldBook(again) : binTold(again));
        }
        /* 다이어리가 한 권도 없으면 펼친 다이어리를 덮어요 (겉표지로) */
        function dyyShut() {
            if (!isCoverOpen || !dyyBasic()) return;
            isCoverOpen = false; selectedElement = null;
            const ip = document.getElementById('innerPage'), cp = document.getElementById('coverPage');
            if (ip) ip.style.display = 'none'; if (cp) cp.style.display = '';
            if (typeof refreshLayout === 'function') refreshLayout();
            if (typeof updateTextPanel === 'function') updateTextPanel();
        }
        /* 🚛 영구 삭제 = 그 권 폴더째 + 방 안 휴지통에 있던 그 권 페이지도 (js/bin.js binAdd 가 영구삭제 칸에 먼저) */
        BIN_KINDS.dy = {
            purge: async e => {
                const dir = !drive.guest ? await getFolder(dyBookDir(e.id), false) : null;
                if (dir) { const res = await gfetch(`${DRIVE_API}/${dir}`, { method: 'DELETE' }); if (!res.ok && res.status !== 404) throw new Error('purge ' + res.status); }
                const pre = 'diary_' + e.id + '_';                             // 이 기기 메모리에서도
                store.keys().filter(k => k.startsWith(pre)).forEach(k => { store.putLoaded(k, null); drive.dirtyKeys.delete(k); drive.loadedDays.delete(k); });
                if (drive.guest) Object.keys(localStorage).filter(k => k.startsWith(pre)).forEach(k => { try { localStorage.removeItem(k); } catch (x) {} });
                drive.monthIndex.delete('all:' + e.id);
                if (!drive.guest && window.trKillBook) await trKillBook(e.id);
            }
        };
        /* 🗑 쓴 다이어리 휴지통 (js/trash.js 화면) : 되살리기 = 권 그대로 + 🔒 되살린 때까지 꾸민 것은 볼 수만 · 30일 뒤 = 🚛 */
        const dyyBinName = x => { const b = dyyOf(x.u); return b ? `📔 ${dyyTitle(b)} 다이어리` : '📔 다이어리'; };
        function dyyBinRestore(id) {
            const x = dyyBinList().find(v => v.u === id); if (!x) return false;
            if (window.goneIds && goneIds('dy').has(id)) { dyyBinSet(dyyBinList().filter(v => v.u !== id)); return false; }
            dyoPut(Object.assign({}, x.ln, { w: 1, lk: Date.now() }));
            dyyBinSet(dyyBinList().filter(v => v.u !== id));
            if (!dyyBookId() || dyyBookId() === id) { dyyOpenSet(id); dyyFit(); }
            if (window.dyRender) dyRender(); if (window.dkDeskBooks) dkDeskBooks();
            return true;
        }
        async function dyyBinPurge(id) {
            const x = dyyBinList().find(v => v.u === id); if (!x) return;
            await binAdd({ k: 'dy', id, ln: x.ln });                            // 🚛 영구삭제 칸 → 폴더째
            dyyBinSet(dyyBinList().filter(v => v.u !== id));
        }
        async function dyyBinSweep() { for (const x of dyyBinList().filter(v => !binLeft(v.at))) await dyyBinPurge(x.u); }   // 30일 지난 것
        window.dyyBinList = dyyBinList; window.dyyBinName = dyyBinName; window.dyyBinRestore = dyyBinRestore; window.dyyBinPurge = dyyBinPurge; window.dyyBinSweep = dyyBinSweep;
        window.dyyDead = dyyDead; window.dyyDeadSay = dyyDeadSay; window.dyyUsedMark = dyyUsedMark; window.dyyLockAt = dyyLockAt; window.dyyOut = dyyOut;

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
            const sub = window.dySubNow ? dySubNow() : '', subOk = b => sub === 'b' ? !dyyIsNote(b) : sub === 'n' ? dyyIsNote(b) : true;   // 📔 날짜형바인더 · 📓 날짜형노트 버튼 (도련 11-11)
            const all = dyyBooks().filter(b => !(H && H.d.has(b.id)) && subOk(b)).sort((a, b) => (b.id === cur) - (a.id === cur) || b.y - a.y || b.n - a.n);
            if (!all.length) return `<div class="cs-empty">${sub === 'b' ? '📔 날짜형바인더가' : sub === 'n' ? '📓 날짜형노트가' : '📔 다이어리가'} 없어요.<br>🏪 기본상품 샵 → 📔 다이어리에서 받아 주세요.<br><button type="button" class="btn primary" style="margin-top:10px" onclick="closeModal('dyModal'); dyyShop()">🏪 받으러 가기</button></div>`;
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
        if (window.prodHook) prodHook(() => { dyoAll(); if (typeof isCoverOpen !== 'undefined' && isCoverOpen) dyyColorPaint(); });   // 📦 내 실물이 바뀌면 = 내가 만든 디자인도 다시 · 펼친 권 색 (js/mine.js)
        const DYY_SEEN = {};   // 🛟 권마다 마지막으로 알던 모양 (도련 11-19 : 디자인이 목록에서 빠져도 다른 디자인 크기로 바뀌지 않게)
        window.dyyBookType = () => { const b = dyyBook(), t = dyyType(b); if (t && b) { DYY_SEEN[b.id] = t; return t; } if (b && DYY_SEEN[b.id]) return DYY_SEEN[b.id]; const g = DY_DESIGNS.find(d => d.gift && d.float) || DY_DESIGNS.find(d => d.gift) || DY_DESIGNS[0] || {}; return dyyType({ ch: g.ch, c: g.id }); };   // 🎈 띄울 권 디자인 먼저 (도련 11-19 : 처음받기 첫 권이 바이블이라 떠오른 표지가 바이블 크기였어요)   // 📐 펼친 권 모양 (권이 없으면 처음받기 디자인 · js/skins.js dyNow)

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dyyear'] = true;
