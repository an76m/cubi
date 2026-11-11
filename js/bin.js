/* 말랑달콤 다이어리 - js/bin.js
   🗑🚛 버리기는 처음부터 두 갈래 (도련 11-11 · "현실과 똑같이" 하나만 지켜요)
   - 🚛 상품(입력) = 쓰레기차가 실어 가요 : 안 쓴 다이어리 · 스티커 · 마테 · 종이 · 책상 소품 · 벽지 · 책상판 · 배경지 · 문구 (무료 상품도 같아요)
       → 버리는 순간 영구 삭제 (그 상품 파일 · 폴더) · 되살리기 없음 · 휴지통에도 안 들어가요
       → 그 종류 목록 파일 안 🔐 영구삭제 칸에 { u: 번호, at } 한 줄이 영원히 (js/drive.js GONE_OF · 📒 스티커는 그 종류 _목록.json 안 · js/own.js)
          · 칸이 종류마다 흩어져 있어 한꺼번에 지워질 일이 없고 · 암호라 사용자가 봐도 몰라요 · 목록을 지우면 가진 상품도 함께 사라져요
       → '목록이 정답' : 받기 · 선물 · 🛟 되살리기 · 기기 맞추기 · 백업 … 상품이 들어오는 길은 모두 목록을 보고 영구삭제 번호는 들이지 않아요
          · 영구삭제 칸은 백업(_목록_백업.json)에도 바로 (deskBackOne) · 두 기기 목록을 합칠 때는 영구삭제 > 휴지통 > 사용 중
   - 🗑 기록(출력) = 방 안 휴지통 30일 (js/trash.js) : 꾸민 페이지 · 표지 · 인형 · 인형극 · 내 도안 · 덮어쓰기 전 모습
       → 📔 쓴 다이어리(표지든 페이지든 한 번 꾸몄으면 영원히)는 상품이지만 기록이 묶여 있어서 방 안 휴지통 (js/dyyear.js 'diary_dy_bin')
          · 30일 안에 권 그대로 되살리기 (꾸민 것은 🔒 볼 수만 · 빈 날은 계속 써요) · 30일 뒤 쓰레기차 (폴더째 + 영구삭제 칸)
   - 🗑 설정 / _휴지통목록.json 은 없앴어요 (11-11) : 예전 기록은 한 번 옮기고 (binMigrate · 상품 = 영구 삭제 · 쓴 다이어리 = 휴지통 칸) 파일을 지워요
   - 종류마다 BIN_KINDS[k].purge(e) = 그 상품 파일 지우기 (dy js/dyyear.js · ds js/deskskin.js · bg js/bgown.js · dk js/desk.js · gd js/skins.js · own js/own.js)
   - 👀 구경 중(게스트)도 같은 말 · 같은 영구 삭제 (이 기기 메모리) */

        const BIN_DAYS = 30;
        const BIN_KINDS = Object.assign({}, window.BIN_PRE);                      // 이 파일보다 먼저 읽는 것 (🪑 책상 소품 js/desk.js · ✏️ 문구 js/skins.js) 은 window.BIN_PRE 에 넣어 둬요
        const binGuest = () => typeof drive === 'undefined' || drive.guest;
        const binLeft = at => Math.max(0, Math.ceil(((+at || 0) + BIN_DAYS * 864e5 - Date.now()) / 864e5));   // 남은 날

        /* 🚛 영구삭제 칸 : [키 · 게스트 키 · 그 목록 파일] (벽지 · 책상판은 소품 목록 파일 안) */
        const GONE = { dy: ['diary_dy_gone', 'malang_dy_gone', 'dyown'], dk: ['diary_dk_gone', 'malang_dk_gone', 'dkown'], ds: ['diary_dk_gone', 'malang_dk_gone', 'dkown'], gd: ['diary_gd_gone', 'malang_gd_gone', 'gdown'], bg: ['diary_bg_gone', 'malang_bg_gone', 'bgown'] };
        function goneList(k) { const g = GONE[k], v = g ? prefGet(g[0], g[1]) : null; return Array.isArray(v) ? v.filter(x => x && typeof x.u === 'string') : []; }
        function goneIds(...ks) { const s = new Set(); ks.forEach(k => goneList(k).forEach(x => s.add(x.u))); return s; }
        function goneAdd(k, id) {
            const g = GONE[k]; if (!g || !id) return;
            const L = goneList(k); if (L.some(x => x.u === id)) return;
            L.push({ u: String(id), at: Date.now() }); prefSet(g[0], g[1], L);
            if (window.deskBackOne) deskBackOne(g[2]);                         // 🛟 백업에도 바로 (예전 백업으로 되살아나지 않게)
        }

        /* 🛟 되살릴 때 (목록 파일이 없어졌으면 영구삭제 칸도 같이 없어졌어요) : 지금 칸 + 백업 속 칸을 합쳐 다시 적고 → 그 번호들 (되살리는 목록에서 빼요) */
        function goneHeal(k, bk) {
            const g = GONE[k], L = goneList(k), have = new Set(L.map(x => x.u));
            const B = g && bk && Array.isArray(bk[g[0]]) ? bk[g[0]].filter(x => x && typeof x.u === 'string' && !have.has(x.u)) : [];
            if (B.length) { prefSet(g[0], g[1], L.concat(B)); B.forEach(x => have.add(x.u)); }
            return have;
        }
        /* 🚛 상품 버리기 : 영구삭제 칸 먼저 (파일을 못 지워 남아도 되살아나지 않아요) → 그 상품 파일 지우기 (📒 스티커는 ownPurge 가 칸까지) */
        async function binAdd(e) {
            const K = BIN_KINDS[e.k]; if (!K) return;
            if (e.k !== 'own') goneAdd(e.k, e.id);
            try { await K.purge(e); } catch (x) { console.warn('🚛 상품 파일 지우기 (번호는 영구삭제 칸에 있어요 · 다음에 앱이 정리)', e.k, x); if (window.diag) diag('goneFile', { k: e.k }); }
        }
        /* 묻기 · 알리기 (모든 상품 같은 말) */
        const binJosa = josa;   // 🧰 js/util.js
        function binAsk(name, extra) {
            return showAsk(`🚛 <b>${binJosa(name, '을', '를')}</b> 버릴까요?<br><small>상품은 버리면 바로 영구 삭제돼요.<br>되살릴 수 없어요.${extra ? '<br>' + extra : ''}</small>`, '🚛 영구 삭제', '취소');   // 휴지통이 아니라 쓰레기차 (도련 11-11)
        }
        function binTold(again) {
            return showMsg(`🚛 버렸어요.<br><small>상품은 영구 삭제되어 되살릴 수 없어요${again ? '<br>' + again : ''}</small>`);
        }
        /* 📔 쓴 다이어리 (기록이 묶인 상품 = 방 안 휴지통) */
        function binAskBook(name) {
            return showAsk(`🗑 <b>${binJosa(name, '을', '를')}</b> 휴지통에 버릴까요?<br><small>꾸민 기록이 있어서 <b>30일</b> 동안 보관해요.<br>되살리면 꾸민 것은 🔒 볼 수만 있어요.</small>`, '🗑 휴지통', '취소');
        }
        function binToldBook(again) {
            return showMsg(`🗑 휴지통으로 옮겼어요.<br><b>30일</b> 동안 보관했다가 영구 삭제돼요.<br><small>그 안에는 ⚙ 설정 → 💾 데이터 관리 → 🗑 휴지통에서 되살릴 수 있어요 (꾸민 것은 🔒 볼 수만)${again ? '<br>' + again : ''}</small>`);
        }

        /* 🧹 드라이브를 읽은 뒤 (js/dyyear.js dyySync) : 30일 지난 쓴 다이어리 · 휴지통 폴더 · 예전 휴지통 목록 옮기기 */
        let binBusy = false;
        async function binSweep() {
            if (binBusy || binGuest() || typeof drive === 'undefined' || !drive.ready) return;
            binBusy = true;
            try { await binMigrate(); if (window.dyyBinSweep) await dyyBinSweep(); } catch (e) { console.warn('🗑 정리 (다음에 다시)', e); } finally { binBusy = false; }
            if (window.trSweep) trSweep();
        }
        /* 🗑 예전 설정 / _휴지통목록.json 'diary_bin' → 새 규칙으로 한 번 (도련 11-11) : 지운 파일 = 휴지통 폴더가 정답이라 그냥 · 쓴 다이어리 = 휴지통 칸 · 나머지 상품 = 영구 삭제
             못 옮긴 줄은 남겨 두고 다음에 다시 · 다 옮기면 파일을 지워요 */
        async function binMigrate() {
            const old = prefGet('diary_bin', 'malang_bin'); if (old == null) return;
            const L = Array.isArray(old) ? old : [], left = [];
            for (const e of L) {
                if (!e || !e.k || !e.id || e.k === 'file' || !BIN_KINDS[e.k]) continue;
                try {
                    if (e.k === 'dy' && window.dyyBinFromOld) await dyyBinFromOld(e);
                    else { if (e.k !== 'own') goneAdd(e.k, e.id); await BIN_KINDS[e.k].purge(e); }
                } catch (x) { console.warn('🗑 예전 휴지통 옮기기 (다음에 다시)', e.k, x); left.push(e); }
            }
            if (left.length) { prefSet('diary_bin', 'malang_bin', left); return; }
            const F = KEY_FILES.binown, dir = await getFolder(F.path, false), cur = dir && await findFile(dir, F.name);
            if (cur) { const r = await gfetch(`${DRIVE_API}/${cur.id}`, { method: 'DELETE' }); if (!r.ok && r.status !== 404) throw new Error('delete ' + r.status); }   // 🔥 구글 휴지통을 거치지 않아요
            store.putLoaded('diary_bin', null); drive.dirtyKeys.delete('diary_bin'); drive[F.prop] = null;
            if (window.diag) diag('binMigrate', { n: L.length });
        }

        window.BIN_KINDS = BIN_KINDS; window.binAdd = binAdd; window.binSweep = binSweep; window.binLeft = binLeft;
        window.binAsk = binAsk; window.binTold = binTold; window.binAskBook = binAskBook; window.binToldBook = binToldBook;
        window.goneIds = goneIds; window.goneAdd = goneAdd; window.goneHeal = goneHeal; window.goneList = goneList; window.BIN_DAYS = BIN_DAYS;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['bin'] = true;
