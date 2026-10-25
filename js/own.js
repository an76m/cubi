/* 말랑달콤 다이어리 - js/own.js
   🎒 유한 스티커 공통 시스템 (도련 10-25 · 모든 스티커 종류가 같이 써요)
   - 스티커는 '내 것'(소장 종이)이어야만 붙일 수 있어요 → 🏪 진열대에서 받거나 · ✂️ 직접 만들거나 · (나중에) 🛍️ 사거나
   - 종이 한 장 = 파일 하나 (씰 종이 한 장 · 나중에 테이프 한 롤 · 떡메 한 묶음 …) · 받을 때마다 새 종이 (같은 스티커도 따로 · 고유 id)
   - 한 칸을 떼어 페이지에 붙이고 일기가 저장되는 순간 그 칸은 영원히 사라져요
       · 그 칸의 그림을 지운 새 파일을 만들고 옛 파일은 완전 삭제 (구글 드라이브 휴지통 · 옛 버전 기록에도 안 남아요)
       · 마지막 칸을 쓰면 종이 파일도 완전 삭제 → 🧺 바구니에서 사라져요
   - 다른 기기에서 이미 쓴 칸이면 : 붙이려던 스티커를 페이지에서 빼고 알려 줘요 (늘 드라이브의 지금 모습을 다시 읽고 고쳐요)
   - 저장 : 내 드라이브 말랑달콤 / 스티커 / 보관함 / 목록.json (바구니 목록) · <id>.json (종이 한 장씩)
       · 모두 암호화(AES-GCM · 계정마다 다른 열쇠) → 드라이브에서 열어 봐도 그림이 아니고, 다른 계정으로 옮겨도 못 열어요
       · 📦 백업 · 📥 불러오기에서 빼요 (불러오기로 쓴 스티커가 되살아나지 않게 · js/backup.js)
       · 말랑달콤 폴더를 지우면 모두 사라지고 되돌릴 수 없어요 (진짜 문구를 불태운 것과 같아요 · 도련)
   - 📁 로그인 없이 폴더에 저장 = 드라이브와 똑같이 (js/devsave.js vfsFetch) · 👀 구경만 = 이 창을 닫으면 사라져요 (일기처럼)
   - 줄어드는 방식 (도련 10-25) : 칸 = 🏷️ 씰(😀 이모지 포함) · 🧩 조각 (뗀 칸만 비어요)
                               수량 = 🎀 테이프 (붙인 길이만큼 · 한 롤 OWN_Q.tape px) · 🧻 떡메 · 📝 메모지 (한 장씩 · 한 묶음 50장) · 📃 속지 (깔면 끝)
                               종이 = 📄 모조지 (오린 자리만 비고 남은 종이는 계속 · 거의 다 오리면 끝)
   - 목록 한 칸 : { id, f : 종이 파일 id, k : 종류, n : 칸 수, u : [쓴 칸 번호] · q0 · q : 처음 · 남은 수량, at : 받은 때, from : 'kit' 기본 · 'mine' 만든 것 · 'gift' 선물,
                   nm : 이름, us : [기본스티커 그림 주소] (바구니 미리보기) · th : 작은 그림 · ts : 🔤 글씨스티커 }
   - 종이 파일 : { v, id, k, from, nm, ts, baked : 하얀 테두리를 이미 둘렀는지, imgs : [그림 data · 쓴 칸은 null], wh : [[가로, 세로]], q0 · q, x : 종류마다 정보 }
   ※ 파일 불러오는 순서 : drive → coll → … → own → basket (index.html) */

        const OWN_DIR = [TOP_FOLDER_NAME, '스티커', '보관함'], OWN_IDX = '목록.json', OWN_SALT = 'malang-own|v1|softsweetdiary';
        const OWN_PEND = 'malang_own_pend', OWN_FRESH = 15000;
        const OWN_Q = { tape: 2000, tk: 50, memo: 50, leaf: 1 };            // 🎀 한 롤 길이(px · 한 번에 170 쯤 → 열 번 남짓) · 🧻 📝 한 묶음 장 수 (실제 떡메 50 · 100매 중 · 도련 10-25) · 📃 한 장
        const ownAlive = e => e.q0 ? e.q > 0 : e.u.length < e.n;
        const O = { kw: '', key: null, idx: null, idxF: null, idxAt: 0, mem: null, album: null, albumR: null, albF: null, q: Promise.resolve(), subs: new Set(), replayed: '' };

        /* ---------- 어디에 (드라이브 · 이 기기 폴더 = 'drive' / 구경만 = 'mem' / 아직 = '') ---------- */
        const ownMode = () => typeof drive === 'undefined' ? '' : drive.guest ? 'mem' : drive.ready ? 'drive' : '';
        const ownWho = () => ownMode() === 'mem' ? 'guest' : ((typeof COLL !== 'undefined' && COLL.who) || 'me');
        function ownReset() {
            const w = ownWho();
            if (O.kw === w) return;
            O.kw = w; O.key = null; O.idx = null; O.idxF = null; O.idxAt = 0; O.album = O.albumR = O.albF = null;
            if (ownMode() === 'mem') O.mem = { idx: [], files: new Map(), album: null, alb: null };
        }

        /* ---------- 🔐 암호화 (계정마다 다른 열쇠 · 압축 → AES-GCM) ---------- */
        const ownEnc = s => new TextEncoder().encode(s), ownDec = b => new TextDecoder().decode(b);
        async function ownKey() {
            ownReset();
            if (O.key) return O.key;
            const raw = await crypto.subtle.digest('SHA-256', ownEnc(OWN_SALT + '|' + O.kw));
            O.key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
            return O.key;
        }
        const ownZip = async (b, how) => new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(how)).arrayBuffer());
        const ownB64 = u8 => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).slice(String(r.result).indexOf(',') + 1)); r.onerror = no; r.readAsDataURL(new Blob([u8])); });
        function ownUnB64(s) { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; }
        async function ownLock(obj) {
            let b = ownEnc(JSON.stringify(obj)), z = 0;
            if (window.CompressionStream) { b = await ownZip(b, new CompressionStream('gzip')); z = 1; }
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await ownKey(), b));
            const out = new Uint8Array(13 + ct.length); out[0] = z; out.set(iv, 1); out.set(ct, 13);
            return JSON.stringify({ v: 1, d: await ownB64(out) });
        }
        async function ownUnlock(text) {
            let o; try { o = JSON.parse(text); } catch (e) { o = null; }
            if (!o || typeof o.d !== 'string') { const er = new Error('corrupt'); er.code = 'corrupt'; throw er; }
            const u = ownUnB64(o.d);
            let b;
            try { b = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(1, 13) }, await ownKey(), u.slice(13))); }
            catch (e) { const er = new Error('locked'); er.code = 'corrupt'; throw er; }   // 다른 계정 열쇠 · 깨진 파일 → 절대 덮어쓰지 않아요
            if (u[0]) b = await ownZip(b, new DecompressionStream('gzip'));
            return JSON.parse(ownDec(b));
        }

        /* ---------- 저장소 (드라이브 · 이 기기 폴더는 js/drive.js 함수 그대로 · 구경만은 메모리) ---------- */
        const ownRid = () => Date.now().toString(36) + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
        async function ownIdxRead() {
            ownReset();
            O.albumR = null;
            if (ownMode() === 'mem') { O.albumR = O.mem.album ? JSON.parse(JSON.stringify(O.mem.album)) : null; return O.mem.idx.map(e => Object.assign({}, e, { u: e.u.slice() })); }
            const d = await getFolder(OWN_DIR, false);
            if (!d) { O.idxF = null; return []; }
            const f = await findFile(d, OWN_IDX); O.idxF = f;
            if (!f) return [];
            let t;
            try { t = await readFileText(f.id); } catch (e) { if (e && e.code === 'gone') { O.idxF = null; return []; } throw e; }
            if (!t.trim()) return [];
            const o = await ownUnlock(t);
            O.albumR = o.album && typeof o.album === 'object' ? o.album : null;           // 📒 예전(v698~v714) 스티커첩 자리 : 이제는 스티커첩.json 따로 (없을 때만 이걸 읽어요)
            return (Array.isArray(o.list) ? o.list : []).filter(e => e && /^[\w-]{4,40}$/.test(e.id || '') && e.f).map(e => Object.assign(e, { u: Array.isArray(e.u) ? e.u.filter(Number.isInteger) : [] }, e.q0 ? { q: Math.max(0, +e.q || 0) } : {}));
        }
        async function ownIdxWrite(list) {
            const album = O.albumR;                                               // 예전 스티커첩 자리는 읽은 그대로 둬요 (스티커첩.json 이 생기면 안 써요)
            if (ownMode() === 'mem') { O.mem.idx = list.map(e => Object.assign({}, e, { u: e.u.slice() })); O.mem.album = album ? JSON.parse(JSON.stringify(album)) : null; return; }
            const d = await getFolder(OWN_DIR, true), body = await ownLock(album ? { v: 1, list, album } : { v: 1, list });
            let saved;
            try { saved = await driveUpsert(d, OWN_IDX, O.idxF && O.idxF.id, body); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; O.idxF = null; saved = await driveUpsert(await getFolder(OWN_DIR, true), OWN_IDX, null, body); }
            O.idxF = { id: saved.id, modifiedTime: saved.modifiedTime };
        }
        async function ownFileNew(sheet) {
            const body = await ownLock(sheet);
            if (ownMode() === 'mem') { const id = 'm' + ownRid(); O.mem.files.set(id, body); return id; }
            let d = await getFolder(OWN_DIR, true), saved;
            try { saved = await driveUpsert(d, ownRid() + '.json', null, body); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; saved = await driveUpsert(await getFolder(OWN_DIR, true), ownRid() + '.json', null, body); }
            return saved.id;
        }
        async function ownFileRead(fid) {
            if (ownMode() === 'mem') { const t = O.mem.files.get(fid); if (t == null) { const er = new Error('gone'); er.code = 'gone'; throw er; } return ownUnlock(t); }
            return ownUnlock(await readFileText(fid));
        }
        /* 🔥 완전 삭제 : 휴지통 · 옛 버전 기록에도 남지 않아요 (DELETE) */
        async function ownFileKill(fid) {
            if (!fid) return;
            if (ownMode() === 'mem') { O.mem.files.delete(fid); return; }
            const res = await gfetch(`${DRIVE_API}/${fid}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 404) throw await driveFail(res, 'delete');
        }

        /* ---------- 차례대로 (한 기기 안에서 겹치지 않게) ---------- */
        function ownSerial(fn) { const p = O.q.then(fn, fn); O.q = p.catch(() => {}); return p; }
        function ownTell() { O.subs.forEach(fn => { try { fn(); } catch (e) {} }); }
        function ownOnChange(fn) { O.subs.add(fn); return () => O.subs.delete(fn); }
        function ownReady() {
            const m = ownMode();
            if (!m) { const er = new Error('ready'); er.code = 'ready'; throw er; }
            if (!window.crypto || !crypto.subtle) { const er = new Error('crypto'); er.code = 'crypto'; throw er; }
            ownReset();
        }

        /* ---------- 📋 바구니 목록 (새것 먼저 · 쓰는 중인 칸은 이 기기에서 바로 빠져 보여요) ---------- */
        async function ownList(force) {
            ownReady();
            if (O.idx && !force && performance.now() - O.idxAt < OWN_FRESH) return O.idx;
            return ownSerial(async () => ownIdxApply(await ownIdxRead()));
        }
        function ownIdxApply(list) {                                             // 이 기기에서 쓰는 중인 칸 · 수량을 빼고 기억해요
            const pend = ownPendGet();
            pend.forEach(p => { const e = list.find(x => x.id === p.s); if (!e) return; if (p.q) e.q = Math.max(0, e.q - p.q); else if (!e.u.includes(p.k)) e.u.push(p.k); });
            O.idx = list.filter(ownAlive); O.idxAt = performance.now();
            if (pend.length && O.replayed !== O.kw) { O.replayed = O.kw; setTimeout(ownReplay, 0); }   // 지난번에 다 못 지운 칸 이어서
            return O.idx;
        }
        /* ⚡ 수납함 열기 : 목록 파일 · 스티커첩 파일을 동시에 읽어요 (하나씩 읽던 것보다 빨라요 · 도련 10-25) */
        async function ownOpen(force) {
            ownReady();
            if (O.idx && O.album && !force && performance.now() - O.idxAt < OWN_FRESH) return { list: O.idx, album: O.album };
            return ownSerial(async () => {
                const [list, alb] = await Promise.all([ownIdxRead(), ownAlbRead(true)]);
                ownIdxApply(list);
                O.album = ownAlbumClean(alb == null ? O.albumR : alb, null);   // 스티커첩 파일이 아직 없으면 예전 자리(목록 안)
                return { list: O.idx, album: O.album };
            });
        }
        const ownLeft = e => e.q0 ? e.q : e.n - e.u.length;
        const ownQtyLeft = id => { const e = O.idx && O.idx.find(x => x.id === id); return e ? (e.q0 ? e.q : ownLeft(e)) : 0; };

        /* ---------- ➕ 새 종이 넣기 (받기 · 만들기 · 나중에 사기) ----------
           sheet : { k, from, nm, ts, baked, imgs, wh } · meta : { us (kit 그림 주소) · th (작은 그림) } → id */
        async function ownAdd(sheet, meta) {
            ownReady();
            const id = ownRid(), imgs = sheet.imgs.slice(0, 40);
            const full = { v: 1, id, k: sheet.k || 'seal', from: sheet.from || 'kit', nm: sheet.nm || '', ts: sheet.ts ? 1 : 0, baked: !!sheet.baked, imgs, wh: sheet.wh || [], x: sheet.x || {} };
            const ent = { id, f: '', k: full.k, n: imgs.length, u: [], at: Date.now(), from: full.from, nm: full.nm };
            const q0 = sheet.q0 || OWN_Q[full.k];
            if (q0) { full.q0 = full.q = q0; ent.q0 = ent.q = q0; }
            if (full.ts) ent.ts = 1;
            if (meta && meta.us) ent.us = meta.us.slice(0, 40);
            if (meta && meta.th) ent.th = meta.th;
            if (sheet.b) ent.b = sheet.b;                                         // 들어갈 바구니 (😀 이모지는 씰이지만 이모지 바구니로)
            if (sheet.x && (sheet.x.pad || sheet.x.lf || sheet.x.pp || sheet.x.glue || sheet.x.bg)) ent.x = { pad: sheet.x.pad, lf: sheet.x.lf, pp: sheet.x.pp, glue: sheet.x.glue, bg: sheet.x.bg };   // 바구니 모양 (떡메 종류 · 속지 무늬 · 메모지 모양)
            return ownSerial(async () => {
                ent.f = await ownFileNew(full);
                try {
                    const list = await ownIdxRead();                              // 다른 기기가 고친 목록 위에 더해요
                    list.push(ent);
                    await ownIdxWrite(list);
                    O.idx = list.filter(ownAlive); O.idxAt = performance.now();
                } catch (e) { ownFileKill(ent.f).catch(() => {}); throw e; }   // 목록에 못 넣었으면 종이 파일도 치워요
                ownTell();
                return id;
            });
        }

        /* ---------- 📂 종이 한 장 열기 : 늘 드라이브의 지금 모습 (다른 기기에서 쓴 칸은 비어 있어요) ---------- */
        async function ownSheet(id) {
            ownReady();
            return ownSerial(async () => {
                const list = await ownIdxRead();
                O.idx = list.filter(ownAlive); O.idxAt = performance.now();
                const e = list.find(x => x.id === id);
                if (!e || !ownAlive(e)) { ownTell(); return null; }
                let s;
                try { s = await ownFileRead(e.f); } catch (er) { if (er && er.code === 'gone') { ownTell(); return null; } throw er; }
                ownPendGet().forEach(p => { if (p.s !== id) return; if (p.q) s.q = Math.max(0, (s.q || 0) - p.q); else if (s.imgs[p.k] != null) s.imgs[p.k] = null; });   // 이 기기에서 쓰는 중인 칸 · 수량
                if (s.q0 && s.q <= 0) return null;
                return { e, s };
            });
        }

        /* ---------- ✂️ 한 칸 쓰기 (페이지에 붙고 저장된 순간) ----------
           el : 붙은 페이지 요소 (다른 기기에서 이미 쓴 칸이면 페이지에서 빼요) */
        function ownPendGet() { try { const o = JSON.parse(localStorage.getItem(OWN_PEND) || '{}'); return Array.isArray(o[O.kw || ownWho()]) ? o[O.kw || ownWho()] : []; } catch (e) { return []; } }
        function ownPendSet(arr) {
            if (ownMode() === 'mem') return;                                    // 👀 구경만은 남기지 않아요
            try { const o = JSON.parse(localStorage.getItem(OWN_PEND) || '{}'); if (arr.length) o[O.kw] = arr; else delete o[O.kw]; localStorage.setItem(OWN_PEND, JSON.stringify(o)); } catch (e) {}
        }
        function ownUse(id, k, el) { return ownOp(id, { k }, el); }                     // 칸 하나
        function ownQty(id, q, el) { return ownOp(id, { q: Math.max(1, Math.round(q)) }, el); }   // 수량 (테이프 길이 · 떡메 · 메모지 · 속지)
        function ownPaper(id, img, th, left, el, a0) { return ownOp(id, { img, th, left, a0 }, el); }   // 📄 모조지 : 남은 종이 그림으로 바꾸기 (left : 남은 비율)
        function ownOp(id, op, el) {
            ownReset();
            if (op.img == null) {                                                 // 칸 · 수량은 끊겨도 다음에 이어서 지워요 (이 기기에 기억)
                const pend = ownPendGet();
                if (op.q) pend.push({ s: id, q: op.q, t: Date.now(), n: ownRid() });
                else if (!pend.some(p => p.s === id && p.k === op.k)) pend.push({ s: id, k: op.k, t: Date.now() });
                ownPendSet(pend); op.n = op.q ? pend[pend.length - 1].n : '';
            }
            if (O.idx) {                                                          // 이 기기에서는 바로 빠져 보여요
                const e = O.idx.find(x => x.id === id);
                if (e) { if (op.q) e.q = Math.max(0, e.q - op.q); else if (op.img != null) { if (op.th) e.th = op.th; if (op.left <= OWN_PAPER_END) { e.q0 = 1; e.q = 0; } } else if (!e.u.includes(op.k)) e.u.push(op.k); }
                O.idx = O.idx.filter(ownAlive); ownTell();
            }
            return ownSerial(() => ownSpend(id, op, el));
        }
        const OWN_PAPER_END = .04;                                                // 📄 남은 종이가 이만큼보다 적으면 다 쓴 종이
        async function ownSpend(id, op, el) {
            const done = () => ownPendSet(ownPendGet().filter(p => !(p.s === id && (op.q ? p.n === op.n : p.k === op.k))));
            let list;
            try { list = await ownIdxRead(); }
            catch (e) { ownRetryLater(); throw e; }                              // 인터넷이 끊겼어요 → 나중에 이어서 (이 기기에서는 이미 빠져 보여요)
            const e = list.find(x => x.id === id);
            let s = null;
            if (e) { try { s = await ownFileRead(e.f); } catch (er) { if (!(er && er.code === 'gone')) { ownRetryLater(); throw er; } } }
            const gone = !e || !s || (op.q ? !(s.q > 0) : op.img != null ? false : s.imgs[op.k] == null);
            if (gone) {                                                          // 📱 다른 기기에서 이미 쓴 칸 · 다 쓴 묶음
                done(); ownGone(el);
                O.idx = list.filter(ownAlive); O.idxAt = performance.now(); ownTell();
                return false;
            }
            let end;
            if (op.q) { s.q = Math.max(0, s.q - op.q); e.q = s.q; end = s.q <= 0; }
            else if (op.img != null) { s.imgs = [op.img]; if (op.th) e.th = op.th; s.x = Object.assign({}, s.x, { grained: 1 }, op.a0 && !(s.x && s.x.a0) ? { a0: op.a0 } : {}); end = op.left <= OWN_PAPER_END; }   // a0 : 처음 종이의 잉크 양 (남은 비율 재기)
            else {
                s.imgs[op.k] = null;
                e.u = s.imgs.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
                end = e.u.length >= e.n;
            }
            const old = e.f;
            try {
                if (end) list.splice(list.indexOf(e), 1);                        // 마지막 칸 · 다 쓴 묶음 → 종이째 사라져요
                else {
                    if (op.k != null && e.th && !e.us) e.th = await ownThumb(s.imgs);   // 바구니 미리보기도 뗀 자리가 비게
                    e.f = await ownFileNew(s);                                   // 새 파일로 바꿔 쓰고 옛 것은 완전 삭제 (옛 버전 기록으로 되살릴 수 없게)
                }
                await ownIdxWrite(list);
            } catch (er) { if (e.f !== old) ownFileKill(e.f).catch(() => {}); ownRetryLater(); throw er; }
            await ownFileKill(old).catch(er => console.warn('옛 종이 파일을 지우지 못했어요 (다음에 다시) :', er));
            done();
            O.idx = list.filter(ownAlive); O.idxAt = performance.now(); ownTell();
            return true;
        }
        function ownGone(el) {
            if (!el) return;                                                     // 이어서 지우기(ownReplay) : 이미 지운 칸이면 조용히
            if (el.isConnected) {
                el.remove();
                if (typeof saveData === 'function') saveData(false);
            }
            if (typeof showMsg === 'function') showMsg('📱 이 스티커는 <b>다른 기기에서 이미 썼어요.</b><br><span style="font-size:12px;color:#777;">스티커는 한 번만 쓸 수 있어서 페이지에서 뺐어요.</span>');
        }
        let ownRetryT = 0;
        function ownRetryLater() { clearTimeout(ownRetryT); ownRetryT = setTimeout(ownReplay, 30000); }
        async function ownReplay() {
            if (!ownMode()) return;
            for (const p of ownPendGet()) { try { await ownSerial(() => ownSpend(p.s, p.q ? { q: p.q, n: p.n } : { k: p.k }, null)); } catch (e) { return; } }
        }
        window.addEventListener('online', () => { if (ownPendGet().length) ownReplay(); });

        /* ---------- 🖼️ 종이 미리보기 (만든 스티커 : 바구니 칸 · 뗀 자리는 비워요) ---------- */
        const ownImg = src => new Promise(ok => { if (!src) { ok(null); return; } const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
        async function ownThumb(imgs, size) {
            size = size || 120;
            const ims = await Promise.all(imgs.map(ownImg)), n = ims.length, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
            const P = 8, G = 4, cs = (size - P * 2 - G * (cols - 1)) / cols, c = document.createElement('canvas');
            c.width = size; c.height = Math.round(P * 2 + rows * cs + G * (rows - 1));
            const x = c.getContext('2d');
            ims.forEach((im, i) => {
                const cx = P + (i % cols) * (cs + G), cy = P + Math.floor(i / cols) * (cs + G);
                if (!im) { x.fillStyle = 'rgba(200,190,205,.22)'; x.beginPath(); x.arc(cx + cs / 2, cy + cs / 2, cs * .3, 0, Math.PI * 2); x.fill(); return; }   // 뗀 자리
                const k = Math.min(cs / im.width, cs / im.height), w = im.width * k, h = im.height * k;
                x.drawImage(im, cx + (cs - w) / 2, cy + (cs - h) / 2, w, h);
            });
            let u = ''; try { u = c.toDataURL('image/webp', .8); } catch (e) {}
            return /^data:image\/webp/.test(u) ? u : c.toDataURL('image/png');
        }
        /* 그림 크기 [[가로, 세로]] */
        async function ownSizes(imgs) { return (await Promise.all(imgs.map(ownImg))).map(im => im ? [im.naturalWidth, im.naturalHeight] : [0, 0]); }

        /* ---------- 🏪 기본스티커 받기 : 그림을 받아 그대로 내 종이로 (us : 기본스티커 그림 주소들) ---------- */
        async function ownBlobUrl(u) {
            const res = await fetch(u, { cache: 'force-cache' });
            if (!res.ok) throw new Error('kit ' + res.status);
            const b = await res.blob();
            return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsDataURL(b); });
        }
        async function ownTakeKit(us, nm) {
            const imgs = await Promise.all(us.map(ownBlobUrl));
            return ownAdd({ k: 'seal', from: 'kit', nm, baked: false, imgs, wh: await ownSizes(imgs) }, { us });
        }
        /* ✂️ 만든 씰 : 하얀 테두리를 이미 두른 그림들 → 내 종이로 */
        async function ownTakeMine(srcs, opt) {
            const imgs = (Array.isArray(srcs) ? srcs : [srcs]).filter(Boolean);
            return ownAdd({ k: 'seal', from: 'mine', nm: (opt && opt.nm) || '', ts: opt && opt.ts, baked: true, imgs, wh: await ownSizes(imgs) }, { th: await ownThumb(imgs) });
        }

        /* 🎒 아무 종류나 새 종이로 (진열대 · 만들기 · 선물) : d = { k, from, nm, imgs, baked, ts, x, q0, us, th } · th 가 없으면 그림으로 만들어요 */
        async function ownTake(d) {
            const imgs = (d.imgs || []).slice();
            const th = d.th || (d.us || d.noTh ? '' : await ownThumb(imgs.filter(Boolean), d.thSize));   // noTh : 바구니가 모양을 직접 그려요 (그린 떡메 · 속지 · 메모지)
            return ownAdd({ k: d.k, from: d.from || 'kit', nm: d.nm, ts: d.ts, baked: d.baked, imgs, wh: d.wh || (d.k === 'seal' || d.k === 'point' || d.k === 'piece' ? await ownSizes(imgs) : []), x: d.x, q0: d.q0, b: d.b },
                Object.assign({}, d.us ? { us: d.us } : {}, th ? { th } : {}));
        }
        /* ---------- 📒 스티커첩 (도련 10-25) : 바인더 = 종이째 포켓에 · 이형지 = 낱개로 떼어 모으기
           album = { bd : [{ id, k : 종류, lb : 라벨, c : 표지 색 번호, n : 포켓 수, p : { 포켓 번호 : 종이 id } }],
                     rl : [{ id, k, lb, n : 쪽 수, it : [{ s : 종이 id(한 칸짜리), pg : 쪽, x, y : 0~1 자리, r : 기울기 }] }] (🤍 이형지북), g : { 종류 : 1 (처음 선물 받음) } }
           · 바인더 1권 = 속지 10장(20쪽 × 4포켓 = 80) · 이형지북 1권 = 20쪽 (한 쪽에 OWN_REL_MAX 개) · 진열대 기본스티커처럼 몇 권이든 공짜로 더 받아요 (도련 10-25)
           · 정리한 종이는 바구니에서 빠져 보여요 · 다 쓴 종이는 저절로 빠져요 · 목록과 같은 파일(암호화)이라 다른 기기에서도 그대로 ---------- */
        const OWN_REL_MAX = 24;                                                   // 이형지 한 쪽에 붙는 수
        function ownAlbumClean(a, list) {
            const alive = list ? new Set(list.filter(ownAlive).map(e => e.id)) : null;   // list 없으면 다 쓴 종이 거르기는 안 해요 (화면에서 걸러요)
            const ok = id => !alive || alive.has(id);
            const o = { bd: [], rl: [], g: {} };
            if (a && typeof a === 'object') {
                if (a.g && typeof a.g === 'object') Object.keys(a.g).forEach(k => { if (a.g[k]) o.g[k] = 1; });
                (Array.isArray(a.bd) ? a.bd : []).forEach(b => {
                    if (!b || !b.id) return;
                    const p = {}; Object.keys(b.p || {}).forEach(i => { if (ok(b.p[i])) p[i] = b.p[i]; });
                    o.bd.push({ id: String(b.id), k: String(b.k || 'seal'), lb: String(b.lb || '').slice(0, 12), c: +b.c || 0, n: Math.max(4, Math.min(200, +b.n || 80)), p });
                });
                (Array.isArray(a.rl) ? a.rl : []).forEach(r => {
                    if (!r || !r.id) return;
                    const n = Math.max(1, Math.min(100, +r.n || 20));
                    o.rl.push({ id: String(r.id), k: String(r.k || 'seal'), lb: String(r.lb || '').slice(0, 12), n, it: (Array.isArray(r.it) ? r.it : []).filter(t => t && ok(t.s)).map(t => ({ s: t.s, pg: Math.max(0, Math.min(n - 1, Math.floor(+t.pg || 0))), x: Math.max(0, Math.min(1, +t.x || 0)), y: Math.max(0, Math.min(1, +t.y || 0)), r: +t.r || 0 })) });
                });
            }
            return o;
        }
        /* ⚡ 마지막으로 읽은 목록 · 스티커첩 (드라이브를 기다리지 않고 바로 그려요 · 그 뒤 새로 읽어 바뀐 게 있으면 다시 그려요 · 도련 10-25) */
        function ownPeek() {
            if (!ownMode() || !O.idx || !O.album || O.kw !== ownWho()) return null;
            return { list: O.idx, album: O.album };
        }
        /* 📒 스티커첩은 작은 파일 하나 (보관함/스티커첩.json · 암호화) : 바인더에 꽂을 때 큰 목록 파일을 건드리지 않아서 빨라요 (도련 10-25) */
        const OWN_ALB = '스티커첩.json';
        async function ownAlbRead(noOld) {                                       // noOld : 스티커첩 파일이 없어도 예전 자리를 따로 읽지 않아요 (ownOpen 이 목록과 같이 읽어요)
            if (ownMode() === 'mem') { if (O.mem.alb) return JSON.parse(JSON.stringify(O.mem.alb)); if (noOld) return null; if (!O.idx) await ownIdxRead(); return O.albumR; }
            const d = await getFolder(OWN_DIR, false);
            if (!d) return null;
            let f = await findFile(d, OWN_ALB); O.albF = f;
            if (!f) { if (noOld) return null; if (O.albumR == null && !O.idx) await ownIdxRead(); return O.albumR; }   // 아직 없으면 예전 자리(목록 안)에서
            let t; try { t = await readFileText(f.id); } catch (e) { if (e && e.code === 'gone') { O.albF = null; return null; } throw e; }
            if (!t.trim()) return null;
            const o = await ownUnlock(t);
            return o && o.album && typeof o.album === 'object' ? o.album : null;
        }
        async function ownAlbWrite(a) {
            if (ownMode() === 'mem') { O.mem.alb = JSON.parse(JSON.stringify(a)); return; }
            const body = await ownLock({ v: 1, album: a });
            let saved;
            try { saved = await driveUpsert(await getFolder(OWN_DIR, true), OWN_ALB, O.albF && O.albF.id, body); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; O.albF = null; saved = await driveUpsert(await getFolder(OWN_DIR, true), OWN_ALB, null, body); }
            O.albF = { id: saved.id, modifiedTime: saved.modifiedTime };
        }
        async function ownAlbumGet(force) {
            ownReady();
            if (O.album && !force) return O.album;
            return ownSerial(async () => { O.album = ownAlbumClean(await ownAlbRead(), null); return O.album; });
        }
        /* 스티커첩 고치기 : fn(album) 이 album 을 고쳐요 (차례대로 · 드라이브의 지금 모습 위에 · 스티커첩 파일만) */
        async function ownAlbum(fn) {
            ownReady();
            return ownSerial(async () => {
                const a = ownAlbumClean(await ownAlbRead(), null);
                const r = await fn(a, O.idx || []);
                const c = ownAlbumClean(a, null);
                await ownAlbWrite(c);
                O.album = c;
                ownTell();
                return r;
            });
        }
        /* 🤍 이형지로 옮기기 : 종이의 한 칸을 떼어 → 한 칸짜리 새 종이 (이형지 위 그 자리) · 옮기는 건 쓴 게 아니에요 (다이어리에 붙일 때 사라져요) */
        async function ownRelMove(srcId, slot, relId, pos) {
            ownReady();
            return ownSerial(async () => {
                const list = await ownIdxRead(), a = ownAlbumClean(await ownAlbRead(), list);
                const rel = a.rl.find(r => r.id === relId);
                if (!rel) { const er = new Error('gone'); er.code = 'gone'; throw er; }
                const pg = Math.max(0, Math.min(rel.n - 1, Math.floor(+pos.pg || 0)));
                if (rel.it.filter(t => t.pg === pg).length >= OWN_REL_MAX) { const er = new Error('relfull'); er.code = 'relfull'; throw er; }
                const e = list.find(x => x.id === srcId);
                if (!e || !ownAlive(e) || e.q0 || ownPendGet().some(p => p.s === srcId && p.k === slot)) return '';
                let s; try { s = await ownFileRead(e.f); } catch (er) { if (er && er.code === 'gone') return ''; throw er; }
                const img = s.imgs[slot]; if (img == null) return '';
                const nid = ownRid();
                const one = { v: 1, id: nid, k: e.k, from: 'rel', nm: s.nm || '', ts: s.ts ? 1 : 0, baked: !!s.baked, imgs: [img], wh: [(s.wh || [])[slot] || [0, 0]], x: {} };
                const ne = { id: nid, f: '', k: e.k, n: 1, u: [], at: Date.now(), from: 'rel', nm: one.nm, th: await ownThumb([img], 96) };
                if (e.b) ne.b = e.b; if (s.ts) ne.ts = 1;
                ne.f = await ownFileNew(one);
                s.imgs[slot] = null;
                e.u = s.imgs.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
                const end = e.u.length >= e.n, old = e.f;
                try {
                    if (end) list.splice(list.indexOf(e), 1);
                    else { if (e.th && !e.us) e.th = await ownThumb(s.imgs); e.f = await ownFileNew(s); }
                    list.push(ne);
                    rel.it.push({ s: nid, pg, x: Math.max(0, Math.min(1, +pos.x || 0)), y: Math.max(0, Math.min(1, +pos.y || 0)), r: +pos.r || 0 });
                    await ownIdxWrite(list);
                } catch (er) { ownFileKill(ne.f).catch(() => {}); if (e.f !== old) ownFileKill(e.f).catch(() => {}); throw er; }
                await ownFileKill(old).catch(er => console.warn('옛 종이 파일을 지우지 못했어요 :', er));
                O.idx = list.filter(ownAlive); O.idxAt = performance.now();
                const c = ownAlbumClean(a, list);
                try { await ownAlbWrite(c); O.album = c; } catch (er) { O.album = null; ownTell(); throw er; }   // 스티커첩 저장이 안 되면 새 종이는 바구니에 남아요 (잃어버리지 않아요)
                ownTell();
                return nid;
            });
        }
        /* 종이의 그림들 (정리 책상에서 낱개로 보여 주기 · 쓰는 중인 칸은 비어요) */
        async function ownSheetImgs(id) { const r = await ownSheet(id); return r ? { imgs: r.s.imgs.slice(), baked: !!r.s.baked } : null; }

        /* 실패 이유 → 알림 글 */
        function ownErrText(e) {
            const c = e && e.code;
            if (c === 'ready') return '구글 계정으로 로그인하거나 📁 폴더에 저장할 때 쓸 수 있어요.';
            if (c === 'crypto') return '이 브라우저에서는 스티커 보관함을 열 수 없어요.';
            if (c === 'corrupt') return '스티커 보관함을 읽을 수 없어요.<br><span style="font-size:12px;color:#777;">다른 계정의 말랑달콤 폴더이거나 파일이 깨졌어요.</span>';
            if (c === 'full') return '☁ 구글 드라이브 저장공간이 가득 찼어요.';
            if (c === 'auth') return '다시 로그인해 주세요.';
            if (c === 'relfull') return '이 쪽은 가득 찼어요. 다른 쪽에 붙여 주세요.';
            if (c === 'gone') return '스티커첩이 바뀌었어요. 다시 열어 주세요.';
            return '인터넷 연결을 확인한 뒤 다시 해 주세요.';
        }

        window.ownList = ownList; window.ownAdd = ownAdd; window.ownSheet = ownSheet; window.ownUse = ownUse; window.ownLeft = ownLeft;
        window.ownQty = ownQty; window.ownPaper = ownPaper; window.ownQtyLeft = ownQtyLeft; window.ownTake = ownTake; window.ownThumb = ownThumb; window.OWN_Q = OWN_Q;
        window.ownOnChange = ownOnChange; window.ownTakeKit = ownTakeKit; window.ownTakeMine = ownTakeMine; window.ownErrText = ownErrText; window.ownMode = ownMode;
        window.ownAlbum = ownAlbum; window.ownAlbumGet = ownAlbumGet; window.ownPeek = ownPeek; window.ownOpen = ownOpen; window.ownRelMove = ownRelMove; window.ownSheetImgs = ownSheetImgs; window.OWN_REL_MAX = OWN_REL_MAX;
