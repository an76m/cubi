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
   - 목록 한 칸 : { id, f : 종이 파일 id, k : 'seal' 종류, n : 칸 수, u : [쓴 칸 번호], at : 받은 때, from : 'kit' 기본 · 'mine' 만든 것,
                   nm : 이름, us : [기본스티커 그림 주소] (바구니 미리보기 · kit) · th : 작은 그림 (mine) · ts : 🔤 글씨스티커 }
   - 종이 파일 : { v, id, k, from, nm, ts, baked : 하얀 테두리를 이미 둘렀는지, imgs : [그림 data · 쓴 칸은 null], wh : [[가로, 세로]] }
   ※ 파일 불러오는 순서 : drive → coll → … → own → basket (index.html) */

        const OWN_DIR = [TOP_FOLDER_NAME, '스티커', '보관함'], OWN_IDX = '목록.json', OWN_SALT = 'malang-own|v1|softsweetdiary';
        const OWN_PEND = 'malang_own_pend', OWN_FRESH = 15000;
        const O = { kw: '', key: null, idx: null, idxF: null, idxAt: 0, mem: null, q: Promise.resolve(), subs: new Set(), replayed: '' };

        /* ---------- 어디에 (드라이브 · 이 기기 폴더 = 'drive' / 구경만 = 'mem' / 아직 = '') ---------- */
        const ownMode = () => typeof drive === 'undefined' ? '' : drive.guest ? 'mem' : drive.ready ? 'drive' : '';
        const ownWho = () => ownMode() === 'mem' ? 'guest' : ((typeof COLL !== 'undefined' && COLL.who) || 'me');
        function ownReset() {
            const w = ownWho();
            if (O.kw === w) return;
            O.kw = w; O.key = null; O.idx = null; O.idxF = null; O.idxAt = 0;
            if (ownMode() === 'mem') O.mem = { idx: [], files: new Map() };
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
            if (ownMode() === 'mem') return O.mem.idx.map(e => Object.assign({}, e, { u: e.u.slice() }));
            const d = await getFolder(OWN_DIR, false);
            if (!d) { O.idxF = null; return []; }
            const f = await findFile(d, OWN_IDX); O.idxF = f;
            if (!f) return [];
            let t;
            try { t = await readFileText(f.id); } catch (e) { if (e && e.code === 'gone') { O.idxF = null; return []; } throw e; }
            if (!t.trim()) return [];
            const o = await ownUnlock(t);
            return (Array.isArray(o.list) ? o.list : []).filter(e => e && /^[\w-]{4,40}$/.test(e.id || '') && e.f).map(e => Object.assign(e, { u: Array.isArray(e.u) ? e.u.filter(Number.isInteger) : [] }));
        }
        async function ownIdxWrite(list) {
            if (ownMode() === 'mem') { O.mem.idx = list.map(e => Object.assign({}, e, { u: e.u.slice() })); return; }
            const d = await getFolder(OWN_DIR, true), body = await ownLock({ v: 1, list });
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
            return ownSerial(async () => {
                const list = await ownIdxRead();
                const pend = ownPendGet();
                pend.forEach(p => { const e = list.find(x => x.id === p.s); if (e && !e.u.includes(p.k)) e.u.push(p.k); });
                O.idx = list.filter(e => e.u.length < e.n); O.idxAt = performance.now();
                if (pend.length && O.replayed !== O.kw) { O.replayed = O.kw; setTimeout(ownReplay, 0); }   // 지난번에 다 못 지운 칸 이어서
                return O.idx;
            });
        }
        const ownLeft = e => e.n - e.u.length;

        /* ---------- ➕ 새 종이 넣기 (받기 · 만들기 · 나중에 사기) ----------
           sheet : { k, from, nm, ts, baked, imgs, wh } · meta : { us (kit 그림 주소) · th (작은 그림) } → id */
        async function ownAdd(sheet, meta) {
            ownReady();
            const id = ownRid(), imgs = sheet.imgs.slice(0, 40);
            const full = { v: 1, id, k: sheet.k || 'seal', from: sheet.from || 'kit', nm: sheet.nm || '', ts: sheet.ts ? 1 : 0, baked: !!sheet.baked, imgs, wh: sheet.wh || [] };
            const ent = { id, f: '', k: full.k, n: imgs.length, u: [], at: Date.now(), from: full.from, nm: full.nm };
            if (full.ts) ent.ts = 1;
            if (meta && meta.us) ent.us = meta.us.slice(0, 40);
            if (meta && meta.th) ent.th = meta.th;
            return ownSerial(async () => {
                ent.f = await ownFileNew(full);
                try {
                    const list = await ownIdxRead();                              // 다른 기기가 고친 목록 위에 더해요
                    list.push(ent);
                    await ownIdxWrite(list);
                    O.idx = list.filter(e => e.u.length < e.n); O.idxAt = performance.now();
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
                O.idx = list.filter(e => e.u.length < e.n); O.idxAt = performance.now();
                const e = list.find(x => x.id === id);
                if (!e || e.u.length >= e.n) { ownTell(); return null; }
                let s;
                try { s = await ownFileRead(e.f); } catch (er) { if (er && er.code === 'gone') { ownTell(); return null; } throw er; }
                ownPendGet().forEach(p => { if (p.s === id && s.imgs[p.k] != null) s.imgs[p.k] = null; });   // 이 기기에서 쓰는 중인 칸
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
        function ownUse(id, k, el) {
            ownReset();
            const pend = ownPendGet();
            if (!pend.some(p => p.s === id && p.k === k)) { pend.push({ s: id, k, t: Date.now() }); ownPendSet(pend); }
            if (O.idx) { const e = O.idx.find(x => x.id === id); if (e && !e.u.includes(k)) e.u.push(k); O.idx = O.idx.filter(x => x.u.length < x.n); ownTell(); }
            return ownSerial(() => ownSpend(id, k, el));
        }
        async function ownSpend(id, k, el) {
            const done = () => ownPendSet(ownPendGet().filter(p => !(p.s === id && p.k === k)));
            let list;
            try { list = await ownIdxRead(); }
            catch (e) { ownRetryLater(); throw e; }                              // 인터넷이 끊겼어요 → 나중에 이어서 (이 기기에서는 이미 빠져 보여요)
            const e = list.find(x => x.id === id);
            let s = null;
            if (e) { try { s = await ownFileRead(e.f); } catch (er) { if (!(er && er.code === 'gone')) { ownRetryLater(); throw er; } } }
            if (!e || !s || s.imgs[k] == null) {                                 // 📱 다른 기기에서 이미 쓴 칸
                done(); ownGone(el);
                O.idx = list.filter(x => x.u.length < x.n); O.idxAt = performance.now(); ownTell();
                return false;
            }
            s.imgs[k] = null;
            e.u = s.imgs.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
            const old = e.f;
            try {
                if (e.u.length >= e.n) list.splice(list.indexOf(e), 1);         // 마지막 칸 → 종이째 사라져요
                else {
                    if (e.from === 'mine') e.th = await ownThumb(s.imgs);       // 바구니 미리보기도 뗀 자리가 비게
                    e.f = await ownFileNew(s);
                }
                await ownIdxWrite(list);
            } catch (er) { if (e.f !== old) ownFileKill(e.f).catch(() => {}); ownRetryLater(); throw er; }
            await ownFileKill(old).catch(er => console.warn('옛 종이 파일을 지우지 못했어요 (다음에 다시) :', er));
            done();
            O.idx = list.filter(x => x.u.length < x.n); O.idxAt = performance.now(); ownTell();
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
            for (const p of ownPendGet()) { try { await ownSerial(() => ownSpend(p.s, p.k, null)); } catch (e) { return; } }
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

        /* 실패 이유 → 알림 글 */
        function ownErrText(e) {
            const c = e && e.code;
            if (c === 'ready') return '구글 계정으로 로그인하거나 📁 폴더에 저장할 때 쓸 수 있어요.';
            if (c === 'crypto') return '이 브라우저에서는 스티커 보관함을 열 수 없어요.';
            if (c === 'corrupt') return '스티커 보관함을 읽을 수 없어요.<br><span style="font-size:12px;color:#777;">다른 계정의 말랑달콤 폴더이거나 파일이 깨졌어요.</span>';
            if (c === 'full') return '☁ 구글 드라이브 저장공간이 가득 찼어요.';
            if (c === 'auth') return '다시 로그인해 주세요.';
            return '인터넷 연결을 확인한 뒤 다시 해 주세요.';
        }

        window.ownList = ownList; window.ownAdd = ownAdd; window.ownSheet = ownSheet; window.ownUse = ownUse; window.ownLeft = ownLeft;
        window.ownOnChange = ownOnChange; window.ownTakeKit = ownTakeKit; window.ownTakeMine = ownTakeMine; window.ownErrText = ownErrText; window.ownMode = ownMode;
