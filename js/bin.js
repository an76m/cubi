/* 말랑달콤 다이어리 - js/bin.js
   🗑 버린 상품 (도련 10-28 · 현실처럼) : 다이어리 · 책상 소품 · 문구 … 모든 상품은 버릴 수 있고 (마지막 하나도) · 버리면 휴지통에 30일 → 그 뒤 영구 삭제
   - 버릴 때 : ① "🗑 ○○을 버릴까요?" (다이어리는 "안에 쓴 기록도 모두 함께 버려져요") → ② "휴지통으로 옮겼어요 · 30일 보관 · 되살릴 수 있어요" (+ 다시 받는 곳)
   - 버린 상품은 그 자리(파일 · 폴더)에 그대로 두고 '버린 목록'에만 옮겨요 → 되살리면 내 것 목록으로 그대로 돌아와요 (구글 · 📁 폴더 같은 방법)
       설정.json 'diary_bin' [{ k: 종류, id, at: 버린 시각 }] (게스트는 이 기기 · 게스트는 휴지통이 없어서 바로 지워요)
   - 30일이 지나면 (다이어리를 열 때 · binSweep) 그 종류가 진짜로 지워요 (purge) · 🗑 휴지통 비우기도 같아요
   - 종류마다 BIN_KINDS[k] = { name(e) : 휴지통에 보일 이름, restore(e) : 되살리기, purge(e) : 영구 삭제 } (📔 js/dyyear.js …)
   - ⚙ 설정 → 💾 데이터 관리 → 🗑 휴지통 맨 위에 보여요 (js/trash.js) */

        const BIN_KEY = 'diary_bin', BIN_LOCAL = 'malang_bin', BIN_DAYS = 30;
        const BIN_KINDS = {};
        function binList() { const v = prefGet(BIN_KEY, BIN_LOCAL); return Array.isArray(v) ? v.filter(e => e && e.k && e.id && BIN_KINDS[e.k]) : []; }
        const binSave = L => prefSet(BIN_KEY, BIN_LOCAL, L);
        const binSame = (a, b) => a.k === b.k && a.id === b.id;
        const binLeft = e => Math.max(0, Math.ceil(((+e.at || 0) + BIN_DAYS * 864e5 - Date.now()) / 864e5));   // 남은 날
        const binGuest = () => typeof drive === 'undefined' || drive.guest;
        /* 버리기 : 버린 목록에 넣고 (게스트는 바로 지워요) */
        async function binAdd(e) {
            const rec = Object.assign({}, e, { at: Date.now() });
            if (binGuest()) { try { await BIN_KINDS[e.k].purge(rec); } catch (x) { console.warn('버리기', x); } return; }
            binSave(binList().filter(x => !binSame(x, rec)).concat([rec]));
        }
        async function binRestore(e) {
            const K = BIN_KINDS[e.k]; if (!K) return false;
            await K.restore(e);
            binSave(binList().filter(x => !binSame(x, e)));
            return true;
        }
        async function binPurge(e) {
            try { await BIN_KINDS[e.k].purge(e); binSave(binList().filter(x => !binSame(x, e))); return true; }
            catch (x) { console.warn('영구 삭제 (다음에 다시)', x); return false; }
        }
        let binBusy = false;
        async function binSweep() {                                            // 30일 지난 것 (드라이브를 읽은 뒤 · js/dyyear.js dyySync)
            if (binBusy || binGuest() || typeof drive === 'undefined' || !drive.ready) return;
            binBusy = true;
            try { for (const e of binList().filter(x => !binLeft(x))) await binPurge(e); } finally { binBusy = false; }
        }
        /* 묻기 · 알리기 (모든 상품 같은 말) */
        const binJosa = (w, a, b) => { const c = String(w || '').charCodeAt(String(w || '').length - 1) - 0xAC00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); };
        function binAsk(name, extra) {
            return showAsk(`🗑 <b>${binJosa(name, '을', '를')}</b> 휴지통에 버릴까요?${extra ? `<br><small>${extra}</small>` : ''}`, '🗑 휴지통', '취소');   // 버튼 = 휴지통 · 취소 (도련 10-28 : '버리기'는 지우는지 애매 · '그만두기'는 잘 안 쓰는 말)
        }
        function binTold(again) {
            if (binGuest()) return showMsg(`🗑 버렸어요.<br><small>구경하는 중에는 휴지통 없이 바로 지워져요${again ? '<br>' + again : ''}</small>`);
            return showMsg(`🗑 휴지통으로 옮겼어요.<br><b>30일</b> 동안 보관했다가 영구 삭제돼요.<br><small>그 안에는 ⚙ 설정 → 💾 데이터 관리 → 🗑 휴지통에서 되살릴 수 있어요${again ? '<br>' + again : ''}</small>`);
        }

        window.BIN_KINDS = BIN_KINDS; window.binList = binList; window.binAdd = binAdd; window.binRestore = binRestore; window.binPurge = binPurge; window.binSweep = binSweep;
        window.binLeft = binLeft; window.binAsk = binAsk; window.binTold = binTold;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['bin'] = true;
