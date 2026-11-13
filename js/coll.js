/* 말랑달콤 다이어리 - js/coll.js
   📚 모음 저장소 : 스티커 · 페이지 · 배경지처럼 '하나씩 늘어나는 것'을 드라이브에 담는 공통 코드
   - 드라이브 (도련 10-26 · 폴더 한 줄 확정 : 모음 폴더 안에 폴더 없음 · 한 폴더에 '내-' · '받은-' 두 모음이 이름으로 나뉘어 살아요)
                <모음 폴더> / 내-목록1.json · 내-목록2.json …   작은 그림(썸네일) 100개씩 묶음 · 화면에 보이는 묶음만 읽어요
                <모음 폴더> / 내-1760000000000.json             하나에 파일 하나 (이름 = 머리말 + 만든 시각 ms) · 눌렀을 때만 읽어요
                (받은 것은 받은-목록1.json · 받은-<id>.json)
       목록 한 칸 : { id, th : 작은 그림, x : 칸에 보일 작은 정보, f : 원본 파일 id, m : 고친 시각 }
       원본       : { v:1, id, th, x, m, item : 진짜 내용 } → 목록이 없어져도 원본만 있으면 목록을 다시 만들 수 있어요
   - 이 기기 (IndexedDB 'mallang-coll')
       orig   : 읽은 원본 (200MB 를 넘으면 오래 안 쓴 것부터 지워요 · 다시 누르면 드라이브에서 또 읽어요)
       list   : 읽은 목록 묶음 (드라이브 파일의 수정 시각이 같으면 다시 받지 않아요)
       local  : 게스트(로그인 안 함)의 모음 · 원본 (지우지 않아요)
       outbox : 아직 드라이브에 못 올린 일 (인터넷이 끊겨도 다음에 이어서 올려요)
   - 두 기기에서 같이 써도
       새로 만든 것 : 시각으로 이름을 지어 겹치지 않아요
       목록 묶음을 고칠 때 : 고치기 직전에 드라이브 파일의 '마지막 수정 시각'을 보고, 바뀌었으면 다시 읽은 위에 내 것만 얹어요
       같은 것을 두 기기가 고쳤으면 : 물어봐요
       접속마다 모음을 처음 열 때 한 번 : 원본 폴더와 목록을 맞춰 봐요 (빠진 것은 원본에서 다시 넣고, 원본이 없는 칸은 빼요)
   ※ 파일 불러오는 순서: drive → coll → app … (index.html) */

        const COLL_PER = 100, COLL_CACHE_MAX = 200 * 1048576, COLL_TH = 96;   // 작은 그림 : 96px (폰 화면에서도 또렷하게)
        const COLL = { db: null, who: '', map: new Map(), pumping: null, timer: 0, lastId: 0, puts: 0, fullTold: false, loginHooks: [] };
        const collGuest = () => typeof drive === 'undefined' || drive.guest;
        const collOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;

        /* ---------- IndexedDB ---------- */
        function collDb() {
            if (COLL.db) return COLL.db;
            COLL.db = new Promise(ok => {
                let r;
                try { r = indexedDB.open('mallang-coll', 1); } catch (e) { ok(null); return; }
                r.onupgradeneeded = () => {
                    const d = r.result;
                    ['orig', 'list', 'local'].forEach(n => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n); });
                    if (!d.objectStoreNames.contains('outbox')) d.createObjectStore('outbox', { autoIncrement: true });
                };
                r.onsuccess = () => ok(r.result);
                r.onerror = r.onblocked = () => ok(null);
            });
            return COLL.db;
        }
        async function collTx(name, mode, fn) {
            const d = await collDb();
            if (!d) return undefined;
            return new Promise(ok => {
                let out;
                try {
                    const tx = d.transaction(name, mode), req = fn(tx.objectStore(name));
                    if (req) req.onsuccess = () => { out = req.result; };
                    tx.oncomplete = () => ok(out);
                    tx.onerror = tx.onabort = () => ok(undefined);
                } catch (e) { ok(undefined); }
            });
        }
        const collGet = (s, k) => collTx(s, 'readonly', st => st.get(k));
        const collPut = (s, k, v) => collTx(s, 'readwrite', st => st.put(v, k));
        const collDel = (s, k) => collTx(s, 'readwrite', st => st.delete(k));
        /* 상자 안의 것 모두 [{ k, v }] (filter 로 고르기) */
        async function collScan(s, filter) {
            const d = await collDb();
            if (!d) return [];
            return new Promise(ok => {
                const out = [];
                try {
                    const tx = d.transaction(s, 'readonly'), req = tx.objectStore(s).openCursor();
                    req.onsuccess = () => { const c = req.result; if (!c) return; if (!filter || filter(c.key, c.value)) out.push({ k: c.key, v: c.value }); c.continue(); };
                    tx.oncomplete = () => ok(out);
                    tx.onerror = tx.onabort = () => ok(out);
                } catch (e) { ok(out); }
            });
        }

        /* ---------- 모음 ---------- */
        /* names : 드라이브 폴더 경로 ['말랑달콤','배경지'] · pre : 파일 이름 머리말 ('내-' · '받은-') → 모음 하나 (같은 경로 · 머리말은 늘 같은 것) */
        const collKeyOf = (names, pre) => names.join('/') + '|' + (pre || '');
        function collOf(names, pre) {
            pre = pre || '';
            const key = collKeyOf(names, pre);
            let C = COLL.map.get(key);
            if (!C) { C = { key, names, pre, lists: null, idx: null, pend: [], gone: new Set(), checked: false, onChange: null }; COLL.map.set(key, C); }
            return C;
        }
        const collEsc = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const collListRe = C => new RegExp('^' + collEsc(C.pre) + '목록(\\d+)\\.json$');   // 목록 묶음 파일
        const collItemRe = C => new RegExp('^' + collEsc(C.pre) + '([\\w-]{1,30})\\.json$');   // 원본 파일 (목록 파일은 한글이라 안 걸려요)
        const collListName = (C, n) => `${C.pre}목록${n}.json`, collItemName = (C, id) => `${C.pre}${id}.json`;
        const collKey = (C, x) => `${COLL.who || 'me'}|${C.key}|${x}`;
        function collNewId() {
            let t = Date.now();
            if (t <= COLL.lastId) t = COLL.lastId + 1;
            COLL.lastId = t;
            return String(t);
        }
        /* 목록 한 칸 확인 (드라이브 · 기기에서 읽은 것) */
        function collClean(arr) {
            return (Array.isArray(arr) ? arr : []).filter(e => e && typeof e === 'object' && /^[\w-]{1,30}$/.test(e.id || ''))
                .map(e => ({ id: e.id, th: e.th == null ? '' : e.th, x: e.x && typeof e.x === 'object' ? e.x : {}, f: typeof e.f === 'string' ? e.f : '', m: +e.m || 0 }));
        }

        /* 목록 묶음 이름들만 (내용은 아직) : [{ n, f, items(null = 아직 안 읽음) }] 번호 순서 */
        function collIndex(C) {
            if (C.lists) return Promise.resolve(C.lists);
            if (C.idx) return C.idx;
            C.idx = (async () => {
                const lists = [];
                if (collGuest()) {
                    const g = await collGet('local', collKey(C, 'g'));
                    (g && Array.isArray(g.lists) ? g.lists : []).forEach(l => lists.push({ n: +l.n || 1, f: null, items: collClean(l.items) }));
                } else {
                    const dir = await getFolder(C.names, false), re = collListRe(C);
                    if (dir) {
                        const fs = await driveList(`'${dir}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime');
                        fs.forEach(f => { const r = re.exec(f.name); if (r && !lists.some(l => l.n === +r[1])) lists.push({ n: +r[1], f, items: null }); });
                    }
                    await collPendLoad(C);
                }
                lists.sort((a, b) => a.n - b.n);
                C.lists = lists;
                return lists;
            })().finally(() => { C.idx = null; });
            return C.idx;
        }
        /* 묶음 하나 읽기 (이 기기에 같은 시각 것이 있으면 그것) */
        function collLoad(C, L) {
            if (L.items) return Promise.resolve(L.items);
            if (L.busy) return L.busy;
            L.busy = (async () => {
                const k = collKey(C, 'l' + L.n), c = await collGet('list', k);
                if (c && L.f && c.fid === L.f.id && c.mt === L.f.modifiedTime) L.items = collClean(c.items);
                else {
                    let o = null;
                    try { o = JSON.parse(await readFileText(L.f.id) || '{}'); } catch (e) { if (e && e.code === 'gone') o = {}; else throw e; }
                    L.items = collClean(o && o.items);
                    collPut('list', k, { fid: L.f.id, mt: L.f.modifiedTime, items: L.items });
                }
                return L.items;
            })().finally(() => { L.busy = null; });
            return L.busy;
        }
        /* 모두 읽기 (📥 받은 것 겹침 확인 · 맞춰 보기용) : 칸들 (새것 먼저) */
        async function collAll(C) {
            const lists = await collIndex(C);
            for (const L of lists) await collLoad(C, L);
            const seen = new Set();
            return C.pend.slice().reverse().concat(...lists.slice().reverse().map(L => L.items.slice().reverse())).filter(e => !C.gone.has(e.id) && !seen.has(e.id) && seen.add(e.id));   // 같은 칸은 한 번만
        }
        /* 이미 읽은 칸에서 찾기 */
        function collEnt(C, id) {
            return C.pend.find(e => e.id === id) || (C.lists || []).reduce((hit, L) => hit || (L.items || []).find(e => e.id === id), null);
        }

        /* ---------- 원본 ---------- */
        async function collItem(C, id) {
            const e = collEnt(C, id);
            if (e && e._item) return e._item;                                         // 아직 올리는 중인 것
            if (collGuest()) { const g = await collGet('local', collKey(C, 'o' + id)); return g ? g.item : null; }
            const k = collKey(C, 'o' + id), c = await collGet('orig', k);
            if (c && (!e || !e.m || c.m === e.m)) { c.t = Date.now(); collPut('orig', k, c); return c.item; }
            let fid = e && e.f, o = null;
            for (let round = 0; round < 2 && !o; round++) {
                if (!fid || round) {
                    const dir = await getFolder(C.names, false);
                    const f = dir && await findFile(dir, collItemName(C, id));
                    if (!f) break;
                    fid = f.id;
                }
                try { o = JSON.parse(await readFileText(fid) || 'null'); }
                catch (er) { if (!(er && er.code === 'gone')) throw er; }
            }
            if (!o || o.item == null) return null;
            collCache(k, o.item, +o.m || (e && e.m) || 0);
            return o.item;
        }
        /* 원본을 이 기기에 넣어 두기 (200MB 를 넘으면 오래 안 쓴 것부터 지워요) */
        async function collCache(k, item, m) {
            let sz = 0; try { sz = JSON.stringify(item).length; } catch (e) {}
            await collPut('orig', k, { item, m, t: Date.now(), sz });
            if (++COLL.puts % 20) return;
            const all = await collScan('orig');
            let total = (all || []).reduce((s, r) => s + (r.v.sz || 0), 0);
            if (total <= COLL_CACHE_MAX) return;
            (all || []).sort((a, b) => a.v.t - b.v.t);
            for (const r of all) { if (total <= COLL_CACHE_MAX * .9) break; total -= r.v.sz || 0; await collDel('orig', r.k); }
        }

        /* ---------- 넣기 · 고치기 · 빼기 (화면은 바로 · 드라이브는 뒤에서 차례대로) ---------- */
        /* th : 작은 그림 · x : 칸에 보일 작은 정보 · item : 진짜 내용 → 새 id */
        /* noIdx (도련 11-07) = 원본 파일만 · 목록 묶음(받은-목록N.json)은 안 만들어요 : 🪑 소품 · ✏️ 문구 · 🧱 벽지 · 🪵 책상판 · 🌈 샵 배경지 (가진 것 목록은 따로 있고 · 되살리기는 원본 파일을 직접 봐요 · 읽는 곳이 없어서) */
        async function collAdd(C, item, th, x, noIdx) {
            const id = collNewId(), ent = { id, th: th || '', x: x || {}, f: '', m: Date.now() };
            noIdx = !!(noIdx || C.noIdx);
            if (collGuest()) {
                if (noIdx) { await collPut('local', collKey(C, 'o' + id), { item }); return id; }   // 게스트 = 원본만 이 기기에 (칠한 소품 그림 · 목록 묶음 없음)
                await collIndex(C);
                await collPut('local', collKey(C, 'o' + id), { item });
                collGuestList(C, ent, null);
                return id;
            }
            if (!noIdx) await collIndex(C);
            C.pend.push(Object.assign({ _item: item }, ent));
            await collQueue(Object.assign({ op: 'add', names: C.names, pre: C.pre, id, ent, item }, noIdx ? { noIdx: 1 } : {}));
            return id;
        }
        async function collSet(C, id, item, th, x) {
            const old = collEnt(C, id) || {};
            const ent = { id, th: th == null ? old.th || '' : th, x: x || old.x || {}, f: old.f || '', m: Date.now() };
            if (collGuest()) {
                await collPut('local', collKey(C, 'o' + id), { item });
                if (!C.noIdx) collGuestList(C, ent, id);
                return;
            }
            if (!C.noIdx) collPatch(C, id, ent, item);
            collCache(collKey(C, 'o' + id), item, ent.m);
            await collQueue(Object.assign({ op: 'put', names: C.names, pre: C.pre, id, ent, item, base: old.m || 0, f: old.f || '' }, C.noIdx ? { noIdx: 1 } : {}));   // 원본만 (목록 묶음 없음 · 칠한 소품 다시 칠하기)
        }
        async function collRemove(C, id, noIdx, keep) {                     // keep = 사용자가 직접 지움 → 🗑 앱 휴지통 (그 밖 = 버린 상품 30일 뒤 · 옮긴 원본 = 영구 삭제 · 도련 11-11)
            const old = collEnt(C, id) || {};
            noIdx = !!(noIdx || C.noIdx);
            if (collGuest()) {
                if (noIdx) { await collDel('local', collKey(C, 'o' + id)); return; }
                await collDel('local', collKey(C, 'o' + id));
                collGuestList(C, null, id);
                return;
            }
            C.gone.add(id);
            C.pend = C.pend.filter(e => e.id !== id);
            collDel('orig', collKey(C, 'o' + id));
            await collQueue(Object.assign({ op: 'del', names: C.names, pre: C.pre, id, f: old.f || '' }, noIdx ? { noIdx: 1 } : {}, keep ? { keep: 1 } : {}));
        }
        /* 화면용 목록에서 그 칸 바꾸기 */
        function collPatch(C, id, ent, item) {
            const p = C.pend.find(e => e.id === id);
            if (p) { Object.assign(p, ent, item !== undefined ? { _item: item } : {}); return; }
            (C.lists || []).forEach(L => { const i = (L.items || []).findIndex(e => e.id === id); if (i >= 0) L.items[i] = Object.assign({}, L.items[i], ent); });
        }
        /* 게스트 : 묶음째 이 기기에 */
        function collGuestList(C, ent, id) {
            const lists = C.lists || (C.lists = []);
            if (id) lists.forEach(L => { const i = L.items.findIndex(e => e.id === id); if (i >= 0) { if (ent) L.items[i] = ent; else L.items.splice(i, 1); } });
            else if (ent) {
                let L = lists[lists.length - 1];
                if (!L || L.items.length >= COLL_PER) { L = { n: (L ? L.n : 0) + 1, f: null, items: [] }; lists.push(L); }
                L.items.push(ent);
            }
            collPut('local', collKey(C, 'g'), { lists: lists.map(L => ({ n: L.n, items: L.items })) });
        }

        /* ---------- 못 올린 일 (outbox) ---------- */
        async function collQueue(op) {
            op.who = COLL.who;
            await collTx('outbox', 'readwrite', st => st.add(op));
            collPump();
        }
        /* 다시 열었을 때 아직 못 올린 것도 화면에 보이게 */
        async function collPendLoad(C) {
            const ops = (await collScan('outbox', (k, v) => v && v.who === COLL.who && v.names && collKeyOf(v.names, v.pre) === C.key)) || [];
            ops.forEach(({ v }) => {
                if (v.op === 'add' && !C.pend.some(e => e.id === v.id) && !C.gone.has(v.id)) C.pend.push(Object.assign({ _item: v.item }, v.ent));
                if (v.op === 'del') { C.gone.add(v.id); C.pend = C.pend.filter(e => e.id !== v.id); }
            });
        }
        function collPump() {
            if (COLL.pumping) return COLL.pumping;
            clearTimeout(COLL.timer);
            COLL.pumping = (async () => {
                while (collOnline()) {
                    const ops = (await collScan('outbox', (k, v) => v && v.who === COLL.who)) || [];
                    if (!ops.length) break;
                    const { k, v } = ops[0];
                    /* 🔁 같은 모음에 새로 넣은 것이 줄지어 있으면 = 원본은 하나씩 · 목록 파일은 한 번에 (도련 11-05 · 처음 접속 요청 줄이기) */
                    const run = v.op === 'add' ? ops.slice(0, 40).filter((o, i, a) => a.slice(0, i + 1).every(x => x.v.op === 'add' && !x.v.noIdx === !v.noIdx && collKeyOf(x.v.names, x.v.pre) === collKeyOf(v.names, v.pre))) : [];
                    if (run.length > 1) {
                        try {
                            const C = collOf(v.names, v.pre), ents = [];
                            for (const o of run) ents.push(await collDo(o.v, o.k, true));
                            if (!v.noIdx) await collListAdd(C, ents);
                            for (const o of run) { await collDel('outbox', o.k); C.pend = C.pend.filter(e => e.id !== o.v.id); }
                            continue;
                        } catch (e) { if (e && e.code === 'auth') break; console.warn('모음 한꺼번에 올리기 → 하나씩', e); }
                    }
                    try { await collDo(v, k); await collDel('outbox', k); }
                    catch (e) {
                        if (e && e.code === 'auth') break;                              // 다시 로그인하면 이어서
                        if (e && e.code === 'full' && !COLL.fullTold) {
                            COLL.fullTold = true;
                            showMsg('☁ 구글 드라이브 저장공간이 <b>가득 찼어요.</b><br>새로 만든 것은 이 기기에 보관해 둘게요.<br><span style="font-size:12px;color:#777;">공간을 비우면 자동으로 다시 저장해요.</span>');
                        }
                        console.warn('모음을 드라이브에 올리지 못했어요:', v.op, v.id, e);
                        COLL.timer = setTimeout(collPump, e && e.code === 'full' ? 5 * 60000 : 30000);
                        break;
                    }
                }
            })().finally(() => { COLL.pumping = null; });
            return COLL.pumping;
        }
        async function collDo(v, k, noList) {
            const C = collOf(v.names, v.pre), name = collItemName(C, v.id);
            if (v.op === 'del') {
                const dir = await getFolder(C.names, false);
                let cur = v.f ? await driveMeta(v.f) : null;
                if (!cur && dir) cur = await findFile(dir, name);
                if (cur) {
                    if (v.keep && window.appTrash) await appTrash(cur.id, C.names.concat(name).join('/'), 'u');   // 🗑 사용자가 지운 것 = 앱 휴지통 30일
                    else { const r = await gfetch(`${DRIVE_API}/${cur.id}`, { method: 'DELETE' }); if (!r.ok && r.status !== 404) throw new Error('delete ' + r.status); }   // 🔥 버린 상품의 30일 뒤 · 옮긴 원본 = 영구 삭제 (구글 휴지통 안 거쳐요)
                }
                if (!v.noIdx) await collListEdit(C, v.id, null);
                C.gone.delete(v.id);
                return;
            }
            const dir = await getFolder(C.names, true);
            let cur = v.f ? await driveMeta(v.f) : null;
            if (v.op === 'add' && !v.tried && k != null) {                       // 🆕 처음 올리는 새것 = 같은 이름 파일이 있을 수 없어요 (찾지 않아요 · 끊겼다 다시 하면 그때 찾아요 · 요청 줄이기 · 도련 11-05)
                v.tried = 1; await collTx('outbox', 'readwrite', st => st.put(v, k));
            } else if (!cur) cur = await findFile(dir, name);
            if (v.op === 'put' && cur && v.base && Date.parse(cur.modifiedTime) > v.base + 2000) {       // 📱 다른 기기가 그 사이 고쳤어요
                let theirs = null;
                try { theirs = JSON.parse(await readFileText(cur.id) || 'null'); } catch (e) {}
                if (theirs && theirs.item != null && JSON.stringify(theirs.item) !== JSON.stringify(v.item)) {
                    const mine = await showAsk('📱 다른 기기에서 같은 것을 고쳤어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 사라져요.</span>', '📝 내 것 저장', '📱 다른 기기 것');
                    if (!mine) {
                        const ent = { id: v.id, th: theirs.th || '', x: theirs.x || {}, f: cur.id, m: Date.parse(cur.modifiedTime) || Date.now() };
                        collPatch(C, v.id, ent);
                        collCache(collKey(C, 'o' + v.id), theirs.item, ent.m);
                        await collListEdit(C, v.id, ent);
                        if (C.onChange) C.onChange(v.id, theirs.item);
                        return;
                    }
                }
            }
            const body = JSON.stringify({ v: 1, id: v.id, th: v.ent.th, x: v.ent.x, m: v.ent.m, item: v.item });
            const saved = await driveUpsert(dir, name, cur && cur.id, body);
            const ent = Object.assign({}, v.ent, { f: saved.id, m: Date.parse(saved.modifiedTime) || v.ent.m });
            collCache(collKey(C, 'o' + v.id), v.item, ent.m);
            if (noList) return ent;                                               // 목록은 부른 쪽이 한 번에 (collListAdd)
            if (v.noIdx) { C.pend = C.pend.filter(e => e.id !== v.id); return; }  // 원본 파일만 (목록 묶음 없음)
            await collListEdit(C, v.id, ent, v.op === 'add');
            C.pend = C.pend.filter(e => e.id !== v.id);
        }
        /* 목록 묶음 고치기 : 고치기 직전에 드라이브 파일을 다시 보고 그 위에 (ent = null 이면 빼기) */
        async function collListEdit(C, id, ent, isNew, more) {
            const lists = await collIndex(C);
            const listDir = await getFolder(C.names, true);
            let L = null;
            if (!isNew) for (let i = lists.length - 1; i >= 0 && !L; i--) { if ((await collLoad(C, lists[i])).some(e => e.id === id)) L = lists[i]; }
            if (!L) {
                if (!ent) return;                                                     // 뺄 것이 목록에 없어요 (이미 빠짐)
                L = lists[lists.length - 1];
                if (!L || (await collLoad(C, L)).length >= COLL_PER) { L = { n: (L ? L.n : 0) + 1, f: null, items: [] }; lists.push(L); }
            }
            const name = collListName(C, L.n);
            let cur = L.f ? await driveMeta(L.f.id) : null;
            if (!cur) cur = await findFile(listDir, name);
            if (cur && (!L.f || cur.id !== L.f.id || cur.modifiedTime !== L.f.modifiedTime)) { L.f = cur; L.items = null; await collLoad(C, L); }   // 다른 기기가 고쳤어요 → 다시 읽은 위에
            const items = L.items || (L.items = []);
            const i = items.findIndex(e => e.id === id);
            if (ent) { if (i >= 0) items[i] = ent; else items.push(ent); }
            else if (i >= 0) items.splice(i, 1);
            else return;
            (more || []).forEach(e => { const j = items.findIndex(x => x.id === e.id); if (j >= 0) items[j] = e; else items.push(e); });   // 🔁 한 번에 더 넣을 것 (collListAdd)
            let saved = await driveUpsert(listDir, name, cur && cur.id, JSON.stringify({ v: 1, items }));
            if (!cur) {                                                               // 📄📄 다른 기기가 거의 동시에 같은 목록 파일을 먼저 만들었으면 : 그 파일에 합쳐서 하나로
                const first = await findFile(listDir, name);
                if (first && first.id !== saved.id) {
                    let theirs = [];
                    try { const o = JSON.parse(await readFileText(first.id) || '{}'); if (o && Array.isArray(o.items)) theirs = o.items; } catch (e) {}
                    theirs.forEach(e => { if (e && e.id && !items.some(x => x.id === e.id)) items.push(e); });
                    const fin = await driveUpsert(listDir, name, first.id, JSON.stringify({ v: 1, items }));
                    await (window.appTrash ? appTrash(saved.id, name, 'a') : driveTrash(saved.id));   // 합친 뒤 남는 쪽 (앱 정리 · 숨김)
                    saved = fin;
                }
            }
            L.f = { id: saved.id, name, modifiedTime: saved.modifiedTime };
            collPut('list', collKey(C, 'l' + L.n), { fid: saved.id, mt: saved.modifiedTime, items });
            if (typeof driveTell === 'function') driveTell({ t: 'coll', path: C.key });
        }

        /* 새것 여러 개를 목록에 한 번에 (묶음이 차면 다음 묶음 · 하나씩 넣기와 같은 규칙 · 도련 11-05) */
        async function collListAdd(C, ents) {
            const rest = ents.filter(Boolean);
            while (rest.length) {
                const lists = await collIndex(C);
                let L = lists[lists.length - 1];
                if (!L || (await collLoad(C, L)).length >= COLL_PER) { L = { n: (L ? L.n : 0) + 1, f: null, items: [] }; lists.push(L); }
                const room = COLL_PER - (L.items || []).length, part = rest.splice(0, Math.max(1, room));
                await collListEdit(C, part[0].id, part[0], true, part.slice(1));
            }
        }

        /* ---------- 맞춰 보기 (접속마다 모음을 처음 열 때 한 번 · 뒤에서) ---------- */
        async function collCheck(C) {
            if (C.checked || !collOnline()) return;
            C.checked = true;
            try {
                await collPump();
                const dir = await getFolder(C.names, false), re = collItemRe(C);
                const lists = await collIndex(C);
                for (const L of lists) await collLoad(C, L);
                const have = new Map();
                if (dir) (await driveList(`'${dir}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name')).forEach(f => {
                    const r = re.exec(f.name); if (r && !have.has(r[1])) have.set(r[1], f.id);
                });
                const busy = new Set(((await collScan('outbox', (k, v) => v && v.who === COLL.who)) || []).map(o => o.v.id));
                const inList = new Set();
                lists.forEach(L => L.items.forEach(e => inList.add(e.id)));
                const missing = [...have.keys()].filter(id => !inList.has(id) && !busy.has(id));
                const dead = [...inList].filter(id => !have.has(id) && !busy.has(id));
                for (const id of dead) await collListEdit(C, id, null);
                for (const id of missing) {                                           // 목록에서 빠진 원본 → 원본에 든 작은 그림으로 다시 넣기
                    let o = null; try { o = JSON.parse(await readFileText(have.get(id)) || 'null'); } catch (e) {}
                    if (!o || o.item == null) continue;
                    await collListEdit(C, id, { id, th: o.th || '', x: o.x && typeof o.x === 'object' ? o.x : {}, f: have.get(id), m: +o.m || 0 }, true);
                }
                if ((dead.length || missing.length) && C.onChange) C.onChange();
            } catch (e) { C.checked = false; console.warn('모음 맞춰 보기 실패:', C.key, e); }
        }

        /* ---------- 다른 기기 · 다른 탭에서 바뀌었을 때 (js/drive.js checkRemote · BroadcastChannel) ---------- */
        async function collRemote(path) {
            if (!collOnline()) return;
            for (const C of COLL.map.values()) {
                if (!C.lists || (path && C.key !== path)) continue;
                let changed = !!path;
                if (!path) {
                    try {
                        const dir = await getFolder(C.names, false), re = collListRe(C);
                        const fs = dir ? await driveList(`'${dir}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime') : [];
                        const now = fs.filter(f => re.test(f.name)).map(f => f.name + f.modifiedTime).sort().join();
                        const was = C.lists.filter(L => L.f).map(L => collListName(C, L.n) + L.f.modifiedTime).sort().join();
                        changed = now !== was;
                    } catch (e) { continue; }
                }
                if (changed) { C.lists = null; if (C.onChange) C.onChange(); }
            }
        }

        /* ---------- 로그인할 때 (js/drive.js loadFromDrive) ---------- */
        /* 지금 계정 (드라이브 permissionId) · 🔐 배치.json 을 열기 전에 먼저 (js/drive.js loadFromDrive) */
        async function collWhoami() {
            let who = 'me';
            try {
                const res = await gfetch('https://www.googleapis.com/drive/v3/about?fields=user(permissionId)');
                if (res.ok) who = ((await res.json()).user || {}).permissionId || who;
            } catch (e) {}
            if (who !== COLL.who) { COLL.map.clear(); COLL.who = who; }
            return who;
        }
        async function collLogin() {
            if (!COLL.who || COLL.who === 'guest') await collWhoami();
            for (const fn of COLL.loginHooks) { try { await fn(); } catch (e) { console.warn('모음 준비 실패:', e); } }
            setTimeout(collPump, 1500);
        }
        function collGuestStart() { COLL.who = 'guest'; COLL.map.clear(); }

        /* ---------- 작은 그림 만들기 (96px webp) ---------- */
        function collThumb(src, size) {
            size = size || COLL_TH;
            return new Promise(ok => {
                if (typeof src !== 'string' || !/^data:image\//.test(src)) { ok(''); return; }
                const im = new Image();
                im.onload = () => {
                    const k = Math.min(1, size / Math.max(im.width, im.height)), c = document.createElement('canvas');
                    c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
                    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
                    let u = '';
                    try { u = c.toDataURL('image/webp', .82); } catch (e) {}
                    if (!/^data:image\/webp/.test(u)) u = c.toDataURL('image/png');
                    ok(u.length < src.length ? u : src);
                };
                im.onerror = () => ok('');
                im.src = src;
            });
        }


        /* 글자 → 짧은 확인 글자 (같은 그림인지 보기) */
        function collHash(s) { s = String(s || ''); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); }

        window.collHash = collHash;
        window.collOf = collOf; window.collAdd = collAdd; window.collSet = collSet; window.collRemove = collRemove; window.collItem = collItem;
        window.collAll = collAll; window.collEnt = collEnt; window.collThumb = collThumb; window.collNewId = collNewId;
        window.collLogin = collLogin; window.collWhoami = collWhoami; window.collRemote = collRemote; window.collGuestStart = collGuestStart; window.collCheck = collCheck;

        /* 🗂 상품 하나 = 파일 하나 (도련 11-05 · 목록에만 적던 것도 모두 : ✏️ 필기구 · 🧱 벽지 · 🪵 책상판 · 🌈 배경지 · 📔 날짜형 다이어리)
             말랑달콤 / <종류 폴더> / 받은-<시각>.json = 🔐 { u 하나하나 id, id 디자인, from 받은 곳 } (스티커처럼 계정마다 다른 열쇠 · js/own.js ownLock)
             ofAdd = 만들기 (로그인 때만 · 게스트는 이 기기 목록만) → 파일 id (목록 칸의 c) · ofDel = 지우기 (🗑 휴지통 30일 뒤)
             ofScan = 목록이 없어졌을 때 되살리기 (열리는 내 파일만 · 같은 u 는 새것 하나) · 드라이브를 못 읽으면 에러 (선물을 또 주지 않게) */
        const ofColl = n => collOf(dirPath(n), '받은-');
        async function ofAdd(n, it) {
            if (!n || !collOnline() || typeof ownLock !== 'function') return '';
            try { return await collAdd(ofColl(n), { s: await ownLock(it) }, '', { id: it.id }, true); } catch (e) { console.warn('🗂 파일', n, e); return ''; }   // 원본 파일만 (받은-목록N.json 없음 · 도련 11-07)
        }
        function ofDel(n, c) { if (n && c && collOnline()) return collRemove(ofColl(n), c, true).catch(e => console.warn('🗂 파일', n, e)); }
        async function ofScan(n) {
            const dir = await getFolder(dirPath(n), false); if (!dir) return [];
            const out = new Map();
            for (const f of await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}'`, 'id,name,modifiedTime')) {
                if (!/^받은-\d+\.json$/.test(f.name)) continue;                    // 목록 파일은 빼요
                let w, it; try { w = JSON.parse(await readFileText(f.id)); it = w && w.item && typeof w.item.s === 'string' ? await ownUnlock(w.item.s) : null; } catch (e) { continue; }   // 🔐 남의 것 · 깨진 것은 무시
                if (!it || typeof it.id !== 'string' || !w.id) continue;
                const u = typeof it.u === 'string' ? it.u : it.id, r = { u, id: it.id, c: String(w.id), mt: String(f.modifiedTime || '') }, o = out.get(u);
                if (!o || o.mt < r.mt) out.set(u, r);
            }
            return [...out.values()].sort((a, b) => a.mt.localeCompare(b.mt));
        }
        window.ofAdd = ofAdd; window.ofDel = ofDel; window.ofScan = ofScan;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['coll'] = true;
