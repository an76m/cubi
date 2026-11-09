/* 말랑달콤 다이어리 - js/devsave.js
   🏠 로그인 없이 쓰기 : 이 브라우저 안에 '말랑달콤' 폴더를 만들어 저장 (도련 · 2026-10-13 · 11-09 하나로 통일)
   - 첫 화면 '로그인 없이 다꾸하기' → 묻지 않고 바로 이 브라우저 저장공간(IndexedDB 'malang-device')에 (PC · 폰 · 패드 모두 같아요)
   - 🚪 로그인 없이 쓰는 사람은 앱을 열 때마다 첫 화면 (구글 로그인을 늘 권해요 · 도련 11-09) · '로그인 없이 다꾸하기'를 누르면 쓰던 다이어리 그대로 · 구글로 로그인했던 기기는 창 없이 바로
   - 구글로 로그인했을 때와 저장 · 불러오기 · 폴더 모양 · 기능이 모두 같아요
     → 드라이브에 말을 거는 곳(drive.js gfetch) 하나만 '이 브라우저 저장공간'으로 바꿔 끼워요 (vfsFetch : 드라이브 API 흉내)
     → 첫 접속 파일(설정 · 다이어리 · 소품 · 문구 목록 …)도 구글과 똑같이 이 안에 생겨요
   - 📁 PC 폴더에 저장하기 · 폴더 바꾸기는 없앴어요 (도련 11-09 · 폰 · 사파리는 폴더를 못 골라서 기기마다 달라지던 것을 하나로)
   - 브라우저 기록을 지우거나 · 브라우저를 바꾸거나 · 아이폰 사파리를 오래 안 열면 사라질 수 있어요 (맛보기라서 괜찮아요 · 지키려면 구글로)
   - ⚙ 설정 → ☁ 구글로 이동 = 말랑달콤의 이사는 이것 하나 (dvLogin · 백업 zip 은 없앴어요 · 도련 11-09) → 그 뒤로는 드라이브로 열려요
   - 안 되는 것 : 편지 · 명예의 전당 · 뽑기처럼 구글 계정이 있어야 하는 서버 기능
   ※ drive.js 의 initDrive · gfetch · ensureToken · driveLogin · driveLogout 이 이 파일을 불러요 · 이 파일이 없어도 다이어리는 정상 */

        const DV_MODE = 'malang_dev_mode';                 // 'idb' (이 브라우저 저장공간) · 없으면 쓰지 않음
        const DV_DB = 'malang-device', DV_TOP = '말랑달콤';
        const V = { on: false, mode: '', idx: new Map(), stale: false, last: 0 };

        /* ---------- 작은 저장소 (IndexedDB) : vmeta 파일 정보 · vdata 내용 ---------- */
        let dvDbP = null;
        function dvDb() {
            if (!dvDbP) dvDbP = new Promise((ok, no) => {
                let r; try { r = indexedDB.open(DV_DB, 2); } catch (e) { no(e); return; }
                r.onupgradeneeded = () => {
                    const db = r.result;
                    ['vmeta', 'vdata'].forEach(n => { if (!db.objectStoreNames.contains(n)) db.createObjectStore(n); });
                };
                r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
            });
            dvDbP.catch(() => { dvDbP = null; });
            return dvDbP;
        }
        const dvReq = q => new Promise((ok, no) => { q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error); });
        async function dvTx(stores, mode, fn) {
            const db = await dvDb();
            return new Promise((ok, no) => {
                const t = db.transaction(stores, mode); let out;
                Promise.resolve(fn(t)).then(v => { out = v; }, no);
                t.oncomplete = () => ok(out); t.onerror = () => no(t.error); t.onabort = () => no(t.error || new Error('abort'));
            });
        }

        /* ---------- 경로 · 번호 : 번호는 경로를 그대로 담아요 (같은 이름 파일이 둘이 될 수 없어요) ---------- */
        const vId = p => p === '' ? 'root' : 'v~' + encodeURIComponent(p);
        const vPath = id => id === 'root' ? '' : (typeof id === 'string' && id.startsWith('v~')) ? decodeURIComponent(id.slice(2)) : null;
        const vParent = p => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
        const vName = p => p.slice(p.lastIndexOf('/') + 1);
        const vJoin = (a, b) => a ? a + '/' + b : b;
        const vNow = () => (V.last = Math.max(Date.now(), V.last + 1));
        const vIso = ms => new Date(ms).toISOString();
        const vBC = (() => { try { return 'BroadcastChannel' in window ? new BroadcastChannel('malang-vfs') : null; } catch (e) { return null; } })();
        if (vBC) vBC.onmessage = () => { V.stale = true; };        // 같은 기기의 다른 탭이 고쳤어요 → 다음에 볼 때 목록을 새로
        const vTell = () => { try { if (vBC) vBC.postMessage(1); } catch (e) {} };

        /* ---------- 목록 읽기 (처음 한 번 · 다른 탭이 고치면 다시) ---------- */
        async function vLoad() {
            const idx = new Map();
            await dvTx(['vmeta'], 'readonly', async t => {
                const st = t.objectStore('vmeta');
                const [ks, vs] = await Promise.all([dvReq(st.getAllKeys()), dvReq(st.getAll())]);
                ks.forEach((k, i) => idx.set(String(k), vs[i]));
            });
            V.idx = idx; V.stale = false;
        }
        async function vFresh() { if (V.stale) await vLoad(); }

        /* ---------- 기본 동작 : 폴더 만들기 · 쓰기 · 읽기 · 지우기 · 옮기기 ---------- */
        async function vMkdir(p) {
            if (!p || (V.idx.get(p) || {}).k === 'd') return;
            await vMkdir(vParent(p));
            const now = vNow(), m = { k: 'd', mt: now, ct: now };
            await dvTx(['vmeta'], 'readwrite', t => { t.objectStore('vmeta').put(m, p); });
            V.idx.set(p, m); vTell();
        }
        async function vWrite(p, text) {
            await vMkdir(vParent(p));
            const old = V.idx.get(p), now = vNow();
            const m = { k: 'f', mt: now, ct: old && old.ct || now, size: new Blob([text]).size };
            await dvTx(['vmeta', 'vdata'], 'readwrite', t => { t.objectStore('vdata').put(text, p); t.objectStore('vmeta').put(m, p); });
            V.idx.set(p, m); vTell();
            return m;
        }
        async function vRead(p) { return dvTx(['vdata'], 'readonly', t => dvReq(t.objectStore('vdata').get(p))); }
        async function vRemove(p) {
            const kill = [p].concat(Array.from(V.idx.keys()).filter(k => k.startsWith(p + '/')));
            await dvTx(['vmeta', 'vdata'], 'readwrite', t => { kill.forEach(k => { t.objectStore('vmeta').delete(k); t.objectStore('vdata').delete(k); }); });
            kill.forEach(k => V.idx.delete(k)); vTell();
        }
        async function vMove(p, np) {
            if (p === np) return;
            const e = V.idx.get(p); if (!e) return;
            if (e.k === 'f') { const txt = await vRead(p); await vWrite(np, txt == null ? '' : txt); }
            else { await vMkdir(np); for (const k of Array.from(V.idx.keys()).filter(k => vParent(k) === p)) await vMove(k, vJoin(np, vName(k))); }
            await vRemove(p);
        }

        /* ---------- 🗑 휴지통 칸 : 말랑달콤 / 휴지통 / 시각-xxxx.json ({ path : 원래 자리, at : 지운 때, text : 내용 }) + 목록.json
           - 30일이 지나거나 휴지통이 너무 커지면 (50MB) 오래된 것부터 지워요
           - ☁ 구글로 이동할 때 옮기지 않고 버려요 (dvPack) ---------- */
        const TRASH = DV_TOP + '/휴지통', TRASH_IDX = TRASH + '/목록.json', TRASH_DAYS = 30;
        const trashCap = () => 50 * 1048576;
        async function vTrashIdx() { try { const a = JSON.parse(await vRead(TRASH_IDX) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
        async function vTrashSave(a) { await vWrite(TRASH_IDX, JSON.stringify(a)); }
        async function vTrashPut(path, text) {
            if (text == null || path.startsWith(TRASH + '/')) return;
            const at = Date.now(), f = `${at}-${Math.random().toString(36).slice(2, 6)}.json`, body = JSON.stringify({ v: 1, path, at, text });
            await vWrite(TRASH + '/' + f, body);
            const a = await vTrashIdx(); a.push({ f, path, at, size: body.length }); await vTrashSave(a);
            await vTrashPurge();
        }
        async function vTrashPurge() {
            let a = await vTrashIdx(); const n = a.length, old = Date.now() - TRASH_DAYS * 864e5;
            a.sort((x, y) => x.at - y.at);
            let total = a.reduce((s, e) => s + (e.size || 0), 0);
            while (a.length && (a[0].at < old || total > trashCap())) { const e = a.shift(); total -= e.size || 0; try { await vRemove(TRASH + '/' + e.f); } catch (x) {} }
            if (a.length !== n) await vTrashSave(a);
        }
        async function vToTrash(p) {                                       // 파일 하나 · 폴더째
            const e = V.idx.get(p); if (!e) return;
            const files = e.k === 'f' ? [p] : Array.from(V.idx.keys()).filter(k => k.startsWith(p + '/') && V.idx.get(k).k === 'f');
            for (const f of files) { const t = await vRead(f); if (t != null) await vTrashPut(f, t); }
            await vRemove(p);
        }
        const dvTrash = {
            list: async () => (await vTrashIdx()).filter(e => V.idx.has(TRASH + '/' + e.f)),
            take: async e => { try { return JSON.parse(await vRead(TRASH + '/' + e.f)); } catch (x) { return null; } },
            drop: async e => { await vRemove(TRASH + '/' + e.f); await vTrashSave((await vTrashIdx()).filter(x => x.f !== e.f)); },
            empty: async () => { await vRemove(TRASH); },
            read: p => vRead(p), write: (p, t) => vWrite(p, t), put: vTrashPut, purge: vTrashPurge
        };
        window.dvTrash = dvTrash;

        /* ---------- 🪄 드라이브 API 흉내 : drive.js gfetch 가 로그인 없이(이 브라우저)일 때 여기로 와요 ---------- */
        const FOLDER = 'application/vnd.google-apps.folder';
        const vRes = (st, obj) => new Response(obj === undefined ? '' : typeof obj === 'string' ? obj : JSON.stringify(obj), { status: st, headers: { 'Content-Type': 'application/json' } });
        /* createdTime 도 드라이브처럼 (도련 11-09 · 없으면 '방금 받은 첫 선물 종이'를 오래된 종이로 보고 🛟 되살리기 창이 떴어요 · js/own.js rescueWait) */
        const vFile = p => { const e = V.idx.get(p); return { id: vId(p), name: vName(p), mimeType: e.k === 'd' ? FOLDER : 'application/json', modifiedTime: vIso(e.mt || 0), createdTime: vIso(e.ct || e.mt || 0), size: String(e.size || 0), trashed: false }; };
        function vQuery(q) {
            const c = { name: null, names: null, parent: null, folder: null, trashed: false };
            for (const part of q.split(' and ')) {
                let m;
                if ((m = /^name='((?:\\.|[^'\\])*)'$/.exec(part))) c.name = m[1].replace(/\\(.)/g, '$1');
                else if (/^\(name='.*'\)$/.test(part)) c.names = [...part.matchAll(/name='((?:\\.|[^'\\])*)'/g)].map(x => x[1].replace(/\\(.)/g, '$1'));   // (name='가' or name='나') · 🎒 수납함 두 파일 한 번에 (js/own.js)
                else if ((m = /^'([^']*)' in parents$/.exec(part))) c.parent = m[1];
                else if ((m = /^mimeType(!?)='(.*)'$/.exec(part))) c.folder = m[1] ? (m[2] === FOLDER ? false : null) : (m[2] === FOLDER ? true : null);
                else if ((m = /^trashed=(true|false)$/.exec(part))) c.trashed = m[1] === 'true';
            }
            if (c.trashed) return [];                                   // 휴지통은 없어요 (지우면 바로 지워져요)
            const pp = c.parent == null ? null : vPath(c.parent);
            if (c.parent != null && pp == null) return [];
            const out = [];
            V.idx.forEach((e, p) => {
                if (pp != null && vParent(p) !== pp) return;
                if (c.name != null && vName(p) !== c.name) return;
                if (c.names && !c.names.includes(vName(p))) return;
                if (c.folder === true && e.k !== 'd') return;
                if (c.folder === false && e.k !== 'f') return;
                out.push(p);
            });
            out.sort((a, b) => (V.idx.get(a).ct || 0) - (V.idx.get(b).ct || 0) || (a < b ? -1 : 1));
            return out.map(vFile);
        }
        function vMultipart(body, ctype) {
            const b = (/boundary=([^;]+)/.exec(ctype || '') || [])[1];
            const parts = String(body).split('--' + b).slice(1, -1).map(s => s.replace(/^\r\n/, '').replace(/\r\n$/, ''));
            const pick = s => s.slice(s.indexOf('\r\n\r\n') + 4);
            return { meta: JSON.parse(pick(parts[0])), body: pick(parts[1]) };
        }
        async function vfsFetch(url, opts) {
            opts = opts || {};
            try {
                await vFresh();
                const u = new URL(url), method = (opts.method || 'GET').toUpperCase(), path = u.pathname;
                if (/\/about$/.test(path)) {
                    if (/storageQuota/.test(u.searchParams.get('fields') || '')) {
                        let usage = 0, quota = 0; try { const e = await navigator.storage.estimate(); usage = e.usage || 0; quota = e.quota || 0; } catch (e) {}
                        return vRes(200, { storageQuota: { usage: String(usage), limit: String(quota) } });
                    }
                    return vRes(200, { user: { permissionId: 'device' } });
                }
                const m = /\/files(?:\/([^/]+))?(\/revisions(?:\/[^/]+)?)?$/.exec(path);
                if (!m) return vRes(404, {});
                if (m[2]) return method === 'GET' && !/alt=media/.test(u.search) ? vRes(200, { revisions: [] }) : method === 'PATCH' ? vRes(200, {}) : vRes(404, {});   // 옛 버전 목록은 없어요
                const upload = /\/upload\//.test(path), id = m[1];
                if (!id) {
                    if (method === 'GET') return vRes(200, { files: vQuery(u.searchParams.get('q') || '') });
                    if (method === 'POST' && upload) {                      // 새 파일 (폴더 · 이름 · 내용)
                        const ct = (opts.headers && (opts.headers['Content-Type'] || opts.headers['content-type'])) || '';
                        const { meta, body } = vMultipart(opts.body, ct);
                        const pp = vPath((meta.parents || ['root'])[0]);
                        if (pp == null || (pp && (V.idx.get(pp) || {}).k !== 'd')) return vRes(404, {});
                        const p = vJoin(pp, meta.name), e = await vWrite(p, body);
                        return vRes(200, { id: vId(p), modifiedTime: vIso(e.mt) });
                    }
                    if (method === 'POST') {                                // 새 폴더
                        const meta = JSON.parse(opts.body || '{}'), pp = vPath((meta.parents || ['root'])[0]);
                        if (pp == null || (pp && (V.idx.get(pp) || {}).k !== 'd')) return vRes(404, {});
                        const p = vJoin(pp, meta.name); await vMkdir(p);
                        return vRes(200, { id: vId(p) });
                    }
                    return vRes(400, {});
                }
                const p = vPath(id);
                const ent = p === '' ? { k: 'd' } : (p != null && V.idx.get(p));
                if (!ent) return vRes(404, { error: { errors: [{ reason: 'notFound' }] } });
                if (method === 'GET') {
                    if (u.searchParams.get('alt') === 'media') { const t = await vRead(p); return t === undefined ? vRes(404, {}) : vRes(200, t); }
                    return vRes(200, p === '' ? { id: 'root', name: '', mimeType: FOLDER, trashed: false } : vFile(p));
                }
                if (method === 'DELETE') { await vRemove(p); return vRes(200, {}); }   // 🔥 완전 삭제 (휴지통 칸에 안 넣어요 · 🎒 유한 스티커 js/own.js)
                if (method === 'PATCH' && upload) { const e = await vWrite(p, String(opts.body == null ? '' : opts.body)); return vRes(200, { id, modifiedTime: vIso(e.mt) }); }
                if (method === 'PATCH') {
                    const add = u.searchParams.get('addParents'), meta = (() => { try { return JSON.parse(opts.body || '{}'); } catch (e) { return {}; } })();
                    if (meta.trashed) { await vToTrash(p); return vRes(200, { id }); }   // 🗑 바로 지우지 않고 휴지통 칸으로 (js/trash.js)
                    let np = p;
                    if (add != null && vPath(add) != null) np = vJoin(vPath(add), vName(p));
                    if (meta.name) np = vJoin(vParent(np), meta.name);
                    if (np !== p) { await vMove(p, np); return vRes(200, vFile(np)); }
                    return vRes(200, vFile(p));
                }
                return vRes(400, {});
            } catch (e) {
                console.warn('이 브라우저 저장소 오류:', url, e);
                return vRes(500, { error: { errors: [{ reason: String(e && e.name || 'error') }] } });
            }
        }

        /* ---------- 시작 : 이 브라우저 저장공간으로 '로그인'한 것처럼 ---------- */
        function dvSetMode(m) { try { if (m) localStorage.setItem(DV_MODE, m); else localStorage.removeItem(DV_MODE); } catch (e) {} }
        function dvGetMode() { try { return localStorage.getItem(DV_MODE) || ''; } catch (e) { return ''; } }
        async function dvStart() {
            V.mode = 'idb'; await vLoad();
            V.on = true; drive.local = true; drive.token = null;
            if (typeof waitForGoogle === 'function') waitForGoogle(15000).then(ok => { if (ok) driveClientMake(); });   // ☁ 구글로 로그인을 누르면 바로 창이 뜨게 미리 준비
            await loadFromDrive();                                         // 드라이브로 로그인할 때와 똑같이 읽어요 (설정 · 카페 · 모음 · 3일치)
            vTrashPurge().catch(() => {});                                 // 🗑 30일 지난 것 비우기
            hideGate(); updateBadge();
            try { await postLoginTasks(); } catch (e) {}
            if (navigator.storage && navigator.storage.persist && !/firefox/i.test(navigator.userAgent)) navigator.storage.persist().catch(() => {});   // 지우지 말아 주세요 (묻는 창 없이 되는 브라우저만)
        }
        /* drive.js initDrive 맨 앞 : true 면 구글 화면 없이 이 브라우저 저장공간으로 열렸어요 */
        function dvQuit() { V.on = false; drive.local = false; drive.ready = false; }

        /* '로그인 없이 다꾸하기' → 묻는 창 없이 바로 이 브라우저 저장공간(idb)으로 시작 → 💻 책상 · 📱 겉표지 (도련 10-28 · "어디에 둘까요?" 창 없앰) */
        async function dvChoose() {
            try { await dvDb(); } catch (e) { enterGuestMode(); showMsg('⚠ 이 브라우저에서는 저장할 수 없어서 구경만 할 수 있어요.<br><span style="font-size:12px;color:#777;">시크릿 모드라면 일반 창으로 열어 주세요.</span>'); return; }
            dvSetMode('idb'); showGate('wait', '📔 다이어리를 펴는 중…');
            try { localStorage.removeItem('gdrive_authed'); } catch (e) {}   // 🚪 마지막에 고른 쪽으로 : 로그인 없이를 골랐으면 다음에도 첫 화면 (구글 자동 로그인 안 함)
            try { await dvStart(); }
            catch (e) { console.warn(e); dvSetMode(''); dvQuit(); enterGuestMode(); showMsg('⚠ 이 기기에 저장하지 못해서 구경만 할 수 있어요.'); }
        }
        /* ---------- ☁ 구글로 이동 (도련 11-09 · 말랑달콤의 이사는 이것 하나) ----------
           🏠 로그인 없이(이 브라우저) → ☁ 구글 드라이브 : 짐을 100% 그대로 옮기고 · 데이터는 언제나 한 곳에만
           1. 누른 그 순간 구글 로그인 창 (아이패드 · 아이폰 사파리는 조금이라도 늦게 열면 창을 막아요)
           2. 묻는 창 하나 (도련 11-09) : 한두 줄 + 수락 · 취소 · 취소 = 이동 없음 + 방금 한 구글 로그인은 로그아웃
              (구글에 말랑달콤이 있을 때만) 구글 드라이브에 말랑달콤 폴더가 있어요. 지우고 이동하시겠어요? / 이동이 끝나면 이 브라우저의 다이어리는 지워져요.
              휴지통 이야기는 하지 않고 양쪽 휴지통까지 조용히 지워요
           3. 수락한 뒤에야 이삿짐을 싸요 · 진행 0 ~ 100% = 짐 싸기 + 구글 비우기(휴지통까지) + 옮기기 + 이 브라우저 비우기를 합친 것
           5. 끝나면 다음부터 구글로 열려요 (새로고침)
           - 짐 = 말랑달콤 폴더의 파일 전부 (일기 · 설정 · 스티커 · 상품 목록 · 받은 파일 · 책상 자리 …) · 🗑 휴지통 · 🗑 버린 상품 목록(_휴지통목록.json)은 옮기지 않고 버려요
           - 🔐 계정 열쇠로 잠긴 것은 이 브라우저 열쇠('device')로 열어 구글 계정 열쇠로 다시 잠가요 (내용은 그대로 · js/own.js ownLock)
           - 옮기다 실패하면 이 브라우저 것은 지우지 않아요 (다시 누르면 처음부터 다시 · 구글 쪽은 그때 다시 비워요) */
        const DV_TRASH = DV_TOP + '/휴지통', DV_BIN = () => `${DV_TOP}/${DIRS.settings}/${KEY_FILES.binown.name}`;   // 🗑 휴지통 칸 · 🗑 버린 상품 목록
        const DV_LOCKED = /^\{"v":1,"d":"[A-Za-z0-9+/=]*"\}$/;           // ownLock 이 만든 글 모양
        async function dvSettle() {                                      // 아직 기다리는 저장까지 이 브라우저에 다 넣어요
            try { if (isCoverOpen && !turn) saveData(false); } catch (e) {}
            try { await flushUpload({ force: true }); } catch (e) {}
            try { if (typeof collPump === 'function') await collPump(); } catch (e) {}
            try { if (typeof srUpload === 'function') await srUpload(); } catch (e) {}
        }
        async function dvPack() {                                        // [[경로, 글]] · 🗑 휴지통 빼고 전부
            await vLoad();
            const all = await dvTx(['vdata'], 'readonly', async t => {
                const st = t.objectStore('vdata');
                const [ks, vs] = await Promise.all([dvReq(st.getAllKeys()), dvReq(st.getAll())]);
                return ks.map((k, i) => [String(k), vs[i]]);
            });
            const bin = DV_BIN();
            return all.filter(([p, t]) => typeof t === 'string' && p.startsWith(DV_TOP + '/') && !p.startsWith(DV_TRASH + '/') && p !== bin && (V.idx.get(p) || {}).k === 'f');
        }
        async function dvRelock(text, to) {                              // 🔐 'device' 열쇠 → 구글 계정 열쇠 (파일 통째 · 안에 든 글 모두)
            const one = async str => { try { return await ownLock(await ownUnlock(str, 'device'), to); } catch (e) { return str; } };   // 못 열면 그대로
            if (DV_LOCKED.test(text)) return one(text);
            if (!text.includes('"v\\":1,\\"d\\"') && !text.includes('{\\"v\\":1')) return text;   // 안에 잠긴 글이 없으면 그대로 (대부분)
            let o; try { o = JSON.parse(text); } catch (e) { return text; }
            const walk = async v => {
                if (typeof v === 'string') return DV_LOCKED.test(v) ? one(v) : v;
                if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) v[i] = await walk(v[i]); return v; }
                if (v && typeof v === 'object') { for (const k of Object.keys(v)) v[k] = await walk(v[k]); return v; }
                return v;
            };
            return JSON.stringify(await walk(o));
        }
        async function dvGoogleTops() {                                  // 구글의 말랑달콤 폴더 (같은 이름이 여럿 · 휴지통에 든 것까지)
            return driveList(`name='${DV_TOP}' and mimeType='${FOLDER_MIME}' and 'root' in parents`, 'id,name,trashed');
        }
        async function dvGoogleHas(tops) {                               // 그 안에 파일이 하나라도 있나요
            for (const t of tops) { const L = await driveList(`'${t.id}' in parents`, 'id'); if (L.length) return true; }
            return false;
        }
        function dvGoogleOut() {                                         // 이동 안 함 = 방금 한 구글 로그인을 로그아웃
            const tk = drive.token;
            drive.token = null; drive.ready = false;
            try { localStorage.removeItem('gdrive_authed'); } catch (e) {}
            try { if (tk && window.google && google.accounts && google.accounts.oauth2) google.accounts.oauth2.revoke(tk, () => {}); } catch (e) {}
        }
        async function dvBack(msg) {                                     // 다시 이 브라우저로
            drive.local = true; resetDriveCaches();
            try { await dvStart(); } catch (e) { console.warn(e); }
            bkBusyOff(); if (msg) showMsg(msg);
        }
        const dvBusy = m => showGate('wait', m), bkBusyOff = () => hideGate();
        /* 🚚 묻는 창 (도련 11-09) : 한두 줄 + 수락 · 취소 (휴지통 이야기는 하지 않고 조용히 지워요) → true / false */
        function dvAgree(has) {
            const L = (has ? ['☁ 구글 드라이브에 말랑달콤 폴더가 있어요.<br>지우고 이동하시겠어요?'] : []).concat(['🏠 이동이 끝나면 이 브라우저의 다이어리는 지워져요.']);
            return showAsk(L.join('<br><br>'), '수락', '취소');
        }
        async function dvLogin() {
            if (!V.on) return;
            if (!drive.client && !driveClientMake()) { showMsg('구글 로그인을 준비하는 중이에요.<br>잠시 후 다시 눌러 주세요.'); waitForGoogle(10000).then(ok => { if (ok) driveClientMake(); }); return; }
            const tp = requestToken('select_account');                      // 창은 지금 바로
            dvBusy('☁ 구글 로그인 중이에요… 잠시만 기다려 주세요');
            try { await tp; }
            catch (e) { bkBusyOff(); drive.token = null; try { localStorage.removeItem('gdrive_authed'); } catch (x) {} showMsg('로그인하지 않았어요.<br><span style="font-size:12px;color:#777;">지금처럼 이 브라우저에 저장해요.</span>'); return; }
            /* 구글 쪽 살피기 (아직 아무것도 바꾸지 않아요) */
            dvBusy('☁ 구글 드라이브를 살피는 중…');
            try { await dvSettle(); } catch (e) {}                           // 기다리던 저장은 이 브라우저에 먼저 (구글로 바꾸기 전에)
            V.on = false; drive.local = false; drive.ready = false; resetDriveCaches();
            let tops = [], has = false, who = '';
            try { who = await collWhoami(); tops = await dvGoogleTops(); has = await dvGoogleHas(tops); }
            catch (e) { console.warn(e); dvGoogleOut(); return dvBack('⚠ 구글 드라이브를 열지 못해서 이동하지 않았어요.<br><span style="font-size:12px;color:#777;">지금처럼 이 브라우저에 저장해요. 잠시 후 다시 해 주세요.</span>'); }
            bkBusyOff();
            if (!(await dvAgree(has))) { dvGoogleOut(); return dvBack('이동하지 않았어요.<br><span style="font-size:12px;color:#777;">구글 로그인은 로그아웃했고, 지금처럼 이 브라우저에 저장해요.</span>'); }
            /* ✅ 모두 체크 → 이제부터 이사 (짐 싸기부터) */
            dvBusy('🚚 ☁ 구글로 이동 중… <b>0%</b><br><span style="font-size:12px;color:#777;">이삿짐 싸는 중 · 창을 닫지 말아 주세요</span>');
            let files = null;
            try { files = await dvPack(); } catch (e) { console.warn(e); }
            if (!files) { dvGoogleOut(); return dvBack('⚠ 이 브라우저의 다이어리를 다 챙기지 못해서 이동하지 않았어요.<br><span style="font-size:12px;color:#777;">구글 로그인은 로그아웃했어요. 잠시 후 다시 해 주세요.</span>'); }
            /* 0 ~ 100% : 짐 싸기 1 + 구글 비우기 (폴더마다 1 · 휴지통에 든 것까지) + 옮기기 (파일마다 1) + 이 브라우저 비우기 (파일 수의 1/10 · 적어도 1) */
            const total = 1 + tops.length + files.length + Math.max(1, Math.ceil(files.length / 10));   // 1 = 짐 싸기 (끝났어요)
            let done = 1;
            const tick = (n, what) => { done += n || 0; dvBusy(`🚚 ☁ 구글로 이동 중… <b>${Math.min(99, Math.floor(done * 100 / total))}%</b><br><span style="font-size:12px;color:#777;">${what} · 창을 닫지 말아 주세요</span>`); };
            try {
                tick(0, '구글 비우는 중');
                for (const t of tops) { const r = await gfetch(`${DRIVE_API}/${t.id}`, { method: 'DELETE' }); if (!r.ok && r.status !== 404) throw new Error('clear ' + r.status); tick(1, '구글 비우는 중'); }   // 🔥 휴지통에 넣지 않고 바로 (안에 든 것까지)
                resetDriveCaches();
                let i = 0;
                await Promise.all(Array.from({ length: 4 }, async () => {
                    while (i < files.length) {
                        const [path, text] = files[i++], parts = path.split('/'), name = parts.pop();
                        const body = await dvRelock(text, who);
                        let ok = false;
                        for (let a = 0; a < 3 && !ok; a++) {
                            try { await driveUpsert(await getFolder(parts, true), name, null, body); ok = true; }
                            catch (e) { if (e && e.code === 'gone') resetDriveCaches(); if (a === 2) throw e; await new Promise(r => setTimeout(r, 800)); }
                        }
                        tick(1, '옮기는 중');
                    }
                }));
            } catch (e) {
                console.warn('🚚 이동 실패', e);
                dvGoogleOut();
                return dvBack('⚠ 옮기다가 멈췄어요. <b>이 브라우저의 다이어리는 그대로예요.</b><br><span style="font-size:12px;color:#777;">인터넷을 확인하고 다시 ☁ 구글로 이동을 눌러 주세요.</span>');
            }
            /* 이 브라우저 비우기 : 말랑달콤 서랍 · 못 올린 보관본 · 읽어 둔 그림 · 저장 방식 */
            tick(0, '이 브라우저 비우는 중');
            try { const db = await dvDb(); db.close(); } catch (e) {}
            dvDbP = null;
            await new Promise(r => { try { const q = indexedDB.deleteDatabase(DV_DB); q.onsuccess = q.onerror = q.onblocked = () => r(); } catch (e) { r(); } setTimeout(r, 4000); });
            await new Promise(r => { try { const q = indexedDB.deleteDatabase('mallang-coll'); q.onsuccess = q.onerror = q.onblocked = () => r(); } catch (e) { r(); } setTimeout(r, 4000); });
            try { const K = []; for (let n = 0; n < localStorage.length; n++) { const k = localStorage.key(n); if (k && k.startsWith('gdrive_pending_backup')) K.push(k); } K.forEach(k => localStorage.removeItem(k)); } catch (e) {}
            dvSetMode('');
            try { localStorage.setItem('gdrive_authed', '1'); } catch (e) {}
            tick(Math.max(1, Math.ceil(files.length / 10)), '다 됐어요');
            dvBusy('🚚 ☁ 구글로 이동 중… <b>100%</b>');
            await new Promise(r => setTimeout(r, 400));
            hideGate();
            await showMsg('☁ <b>구글로 이동했어요!</b><br><span style="font-size:12px;color:#777;">이 브라우저의 다이어리는 지웠어요.<br>이제 구글로 로그인해서 써요.</span>');
            dvBusy('☁ 구글 드라이브로 여는 중…');
            location.reload();
        }
        function dvAfterLogin() { dvSetMode(''); }
        const dvOn = () => V.on;
        const dvWhere = () => '이 브라우저';

        window.dvChoose = dvChoose; window.vfsFetch = vfsFetch; window.dvOn = dvOn; window.dvWhere = dvWhere;
        window.dvLogin = dvLogin; window.dvAfterLogin = dvAfterLogin;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['devsave'] = true;
