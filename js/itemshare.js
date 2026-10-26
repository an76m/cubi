/* 말랑달콤 다이어리 - js/itemshare.js
   📤 공유 파일로 저장 · 📥 공유 파일 불러오기 (도련 10-27 · 스티커 · 책상 소품 · 문구 모두 같은 규칙)
   - 유일한 1개 = 계정마다 따로 인식되는 1개 (도련) : 복사는 되지만 들어오는 순간 그 계정의 새 1개로 바뀌어요
   - 📤 저장 : 내 열쇠로 잠긴 물건을 풀어서 → 모든 말랑달콤 앱이 여는 '공용 포장'(사람은 못 고침)으로 다시 싸고 → 파일 번호(t)를 붙여 기기에 저장
       저장해도 내 것은 그대로 · 💰 유료(from: 'paid')는 저장 안 돼요 (나중에 스토어 · 도련 10-27)
   - 📥 불러오기 : 공용 포장을 열고 → 이 계정에서 이미 불러온 파일 번호면 거절 (같은 파일로 두 개 만들기 막기)
       → 스티커 = js/own.js ownTake (새 번호 · 🔐 내 열쇠) · 책상 소품 = js/desk.js deskReceive (칠한 그림째 · 📦 보관함) · 문구 = gdGive (이미 있으면 건너뛰어요)
       불러온 파일 번호는 책상배치 / 배치.json (🔐) 'diary_share_got' 에 기억해요
   - 파일 모양 : { malang_share: 1, kind, by, d: 공용 포장 } · 예전 공유 파일(malang_sticker · 포장 없음)은 안 받아요 (개발 중 · 옮기는 코드 없음) */

        const ISH_WHO = 'malang-share|v1';                                      // 🔐 공용 포장 열쇠 이름 (모든 앱이 같아요 · 바꾸면 예전 공유 파일을 못 열어요)
        const ISH_GOT = 'diary_share_got', ISH_GOT_L = 'malang_share_got', ISH_GOT_MAX = 5000;
        const ishRid = () => Date.now().toString(36) + crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 12);
        const ishGot = () => { const v = typeof prefGet === 'function' ? prefGet(ISH_GOT, ISH_GOT_L) : null; return Array.isArray(v) ? v : []; };
        const ISH_NAME = { sticker: '스티커', desk: '책상 소품', gd: '문구' };

        async function ishPack(kind, items, by) {
            const body = { v: 1, t: ishRid(), kind, by: by || '', at: Date.now(), items };
            return { malang_share: 1, kind, by: by || '', d: await ownLock(body, ISH_WHO) };
        }
        async function ishSave(kind, items, defName, paid) {
            if (!items.length) { showMsg(paid ? '💰 산 물건은 공유 파일로 저장할 수 없어요.' : '저장할 것이 없어요.'); return false; }
            const a = await shxAsk('📤 공유 파일로 저장', defName, '', false, '받은 사람의 앱에서 그 사람의 <b>새 1개</b>가 돼요 · 내 것은 그대로예요');
            if (!a) return false;
            shxDownload(await ishPack(kind, items, a.by), a.name);
            if (paid) showMsg(`📤 저장했어요.<br><span style="font-size:12px;color:#777;">💰 산 물건 ${paid}개는 빼고 저장했어요.</span>`);
            return true;
        }
        /* 📤 스티커 종이들 (id = 종이 id) : 남은 칸 · 수량만 */
        async function ishSaveStickers(ids, defName) {
            const items = []; let paid = 0;
            for (const id of ids) {
                const r = await ownSheet(id); if (!r) continue;
                const s = r.s; if (s.from === 'paid') { paid++; continue; }
                const keep = (s.imgs || []).map((u, i) => [u, i]).filter(([u]) => u != null);
                const it = { k: s.k, nm: s.nm || '', ts: s.ts ? 1 : 0, baked: !!s.baked, imgs: keep.map(x => x[0]), x: s.x || {}, th: r.e.th || '' };
                if (Array.isArray(s.wh) && s.wh.length) it.wh = keep.map(x => s.wh[x[1]] || [0, 0]);
                if (s.b) it.b = s.b;
                if (s.q0) it.q0 = Math.max(1, s.q || 0);                          // 남은 수량만큼
                if (!it.imgs.length) continue;
                items.push(it);
            }
            return ishSave('sticker', items, defName || '스티커', paid);
        }
        /* 📤 책상 소품 하나 (u) : 칠한 그림째 */
        async function ishSaveDesk(u) {
            const o = DK.items.find(x => x.u === u); if (!o) return false;
            let from = 'basic', img = '';
            if (o.c) { try { const it = await dkUnseal(await collItem(dkColl(o.id), o.c)); if (it) { from = it.from || from; if (typeof it.img === 'string') img = it.img; } } catch (e) { console.warn(e); } }
            if (from === 'paid') return ishSave('desk', [], '', 1);
            return ishSave('desk', [Object.assign({ id: o.id }, img ? { img } : {})], dkName(o));
        }
        /* 📥 불러오기 */
        function ishPick() {
            const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
            inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) ishImport(f); };
            inp.click();
        }
        async function ishImport(f) {
            let o = null, body = null;
            try { o = JSON.parse(await f.text()); } catch (e) {}
            if (!o || o.malang_share !== 1 || typeof o.d !== 'string') { showMsg('⚠ 말랑달콤 공유 파일이 아니에요.' + (o && (o.malang_sticker || o.malang_skin || o.malang_pattern) ? '<br><span style="font-size:12px;color:#777;">예전 방식 파일이라 받을 수 없어요.</span>' : '')); return; }
            try { body = await ownUnlock(o.d, ISH_WHO); } catch (e) { body = null; }
            if (!body || !body.t || !Array.isArray(body.items) || !ISH_NAME[body.kind]) { showMsg('⚠ 공유 파일이 깨졌어요.'); return; }
            const got = ishGot();
            if (got.includes(body.t)) { showMsg('📥 이미 불러온 파일이에요.<br><span style="font-size:12px;color:#777;">같은 파일로는 한 번만 받을 수 있어요.</span>'); return; }
            let n = 0, skip = 0;
            try {
                if (body.kind === 'sticker') {
                    if (!window.ownMode || !ownMode()) { showMsg('🔐 로그인하거나 📁 폴더에 저장할 때 받을 수 있어요.'); return; }
                    for (const it of body.items) {
                        if (!it || typeof it.k !== 'string' || !Array.isArray(it.imgs)) { skip++; continue; }
                        await ownTake({ k: it.k, from: 'share', nm: it.nm, ts: it.ts, baked: it.baked, imgs: it.imgs, wh: it.wh, x: it.x, q0: it.q0, b: it.b, th: it.th, noTh: !it.th });
                        n++;
                    }
                } else if (body.kind === 'desk') {
                    for (const it of body.items) { if (it && window.deskReceive && deskReceive(it.id, 'share', typeof it.img === 'string' && /^data:image\//.test(it.img) ? it.img : '')) n++; else skip++; }
                } else {
                    for (const it of body.items) { const r = it && window.gdGive ? gdGive(it.id) : 'no'; if (r === 'ok') n++; else skip++; }
                }
            } catch (e) { console.warn(e); showMsg('⚠ 받다가 멈췄어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); }
            if (n || !skip) { got.push(body.t); if (typeof prefSet === 'function') prefSet(ISH_GOT, ISH_GOT_L, got.slice(-ISH_GOT_MAX)); }   // 하나라도 받았으면 이 파일은 끝
            const where = body.kind === 'sticker' ? '✨ 스티커 → 바구니' : body.kind === 'desk' ? '📦 소품 보관함' : '🗄️ 문구함';
            showMsg(n ? `📥 받았어요! ${ISH_NAME[body.kind]} ${n}개${body.by ? ` <small>(by ${String(body.by).replace(/[<>&]/g, '')})</small>` : ''}<br><span style="font-size:12px;color:#777;">${where}에 넣었어요${skip ? ` · 이미 있는 ${skip}개는 건너뛰었어요` : ''}</span>`
                : `받을 것이 없었어요${skip ? ` (이미 있는 ${skip}개)` : ''}.`);
        }
        window.ishSaveStickers = ishSaveStickers; window.ishSaveDesk = ishSaveDesk; window.ishPick = ishPick; window.ishImport = ishImport;
        window.shxPickFile = ishPick;                                           // 예전 📥 버튼도 새 관문으로
