/* 말랑달콤 다이어리 - js/drcache.js · ⚡ 드라이브 읽기 기억 (DRC · 도련 11-17 "요청 1번으로 다 알아보고 바뀐 것만 받기")
   앱을 켤 때 : 계정 확인 1번 (about) + 바뀐 것 묻기 1번 (changes · 지난번 '여기부터' 표시부터) → 바뀐 파일 · 폴더 목록만 잊어요 → 나머지는 이 기기에 둔 것으로 바로
   - 기억하는 것 = 드라이브에서 읽은 그대로 (GET 답 · 잠긴 json 은 잠긴 채 · 계정마다 · 이 기기 IndexedDB 'malang-drc')
       L = 파일 · 폴더 목록 (files?q=…) · F = 파일 하나 (files/<번호>?alt=media · ?fields=…) · 계정 확인(about) = 이 창 메모리만
   - 잊는 때 (js/drive.js 가 불러요)
       ① 바뀐 것 묻기 답 (켤 때 drcBoot · 돌아올 때 changesForeign) : 내용만 바뀐 파일 = 그 파일 내용은 잊고 그 파일이 든 목록엔 새 값만 바꿔 끼워요 (🩹 patchLists · 도련 11-17) · 새로 생김 · 이름 · 자리가 바뀜 = 그 폴더 안 목록 · 이름 찾기 목록을 잊어요 · 지움 · 휴지통 = 그것이 든 목록 · 그 안을 찾은 목록
       ② 이 창이 쓸 때 (gfetch 쓰기) : 내용 고침 = 그 파일이 든 목록에 새 값만 · 새 파일 = 그 폴더 안 목록 · 이름 · 휴지통 · 옮기기 = 목록 모두 · 올린 내용은 그대로 기억 (driveUpsert · 다음에 켤 때 지문 md5 가 같으면 다시 안 받아요)
   - 📏 크기 (도련 11-23 · 1442) : 기억마다 [크기, 마지막 쓴 때] 를 meta 에 적어 진짜 크기를 세요 (덮어쓰면 그만큼만 · 잊으면 빼요) · 300MB 를 넘으면 오래 안 쓴 것부터 240MB 까지만 잊어요 (예전 = 통째로 비움)
       켤 때 = 목록만 꺼내요 (예전 = 파일 내용까지 모두 메모리로) · meta 에 크기 표가 없으면 한 번 훑어 다시 만들어요
   - 처음 기기 · 브라우저 저장을 지움 · 🍎 7일 규칙으로 지워짐 · 표시가 너무 오래돼 구글이 안 받아 줌 = 예전처럼 다 읽어요 (드라이브가 기준이라 잃는 건 없어요)
   - 🏠 로그인 없이 · 👀 구경 = 안 써요 (드라이브 요청이 없어서) · 🧹 설정 브라우저 지우기 = '🖼 읽어 둔 스티커 · 그림 · 목록' 칸 */
(function () {
    const API = 'https://www.googleapis.com/drive/v3/files', ABOUT = 'https://www.googleapis.com/drive/v3/about';
    const DB = 'malang-drc', MAXB = 6 * 1024 * 1024; let CAP = 300 * 1024 * 1024, LOW = 240 * 1024 * 1024;
    const D = { on: false, who: '', db: null, lists: new Map(), about: new Map(), q: Promise.resolve(), hit: 0, miss: 0, size: 0, tok: '', ix: new Map(), ixT: 0 };   // ix = 기억 하나마다 [크기, 마지막 쓴 때]
    const req = r => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
    function open() {
        if (D.db) return Promise.resolve(D.db);
        return new Promise((ok, no) => {
            let r; try { r = indexedDB.open(DB, 1); } catch (e) { no(e); return; }
            r.onupgradeneeded = () => { const db = r.result; const s = db.createObjectStore('r', { keyPath: 'k' }); s.createIndex('w', 'w'); s.createIndex('wf', ['w', 'f']); db.createObjectStore('m', { keyPath: 'w' }); };
            r.onsuccess = () => { D.db = r.result; D.db.onversionchange = () => { try { D.db.close(); } catch (e) {} D.db = null; D.on = false; }; ok(D.db); };
            r.onerror = () => no(r.error); r.onblocked = () => no(new Error('blocked'));
        });
    }
    const tx = (st, mode) => D.db.transaction(st, mode).objectStore(st);
    const serial = fn => { const p = D.q.then(fn, fn); D.q = p.catch(() => {}); return p; };   // 쓰기 · 잊기는 차례대로 (잊은 뒤 새로 기억한 것이 지워지지 않게)
    /* 요청 주소 → 종류 : 'L' 목록 · ['F', 번호] 파일 하나 · '' 안 기억 */
    function kindOf(url) {
        if (!url.startsWith(API)) return null;
        const rest = url.slice(API.length);
        if (rest[0] === '?') return { k: 'L' };
        const m = /^\/([^/?]+)/.exec(rest); return m ? { k: 'F', f: m[1] } : null;
    }
    /* ---------- 켤 때 ---------- */
    async function boot(who) {                                                   // → 지난번 '여기부터' 표시 ('' = 없음 · 처음)
        D.on = false; D.lists.clear(); D.about.clear();
        if (!who || !window.indexedDB) return '';
        try { await open(); } catch (e) { return ''; }
        if (D.who !== who) D.who = who;
        let m = null; try { m = await req(tx('m', 'readonly').get(who)); } catch (e) {}
        D.tok = (m && m.tok) || ''; D.ix.clear(); D.size = 0;
        if (m && Array.isArray(m.ix)) m.ix.forEach(x => { if (Array.isArray(x) && typeof x[0] === 'string') ixSet(x[0], +x[1] || 0, +x[2] || 0); });
        else await ixScan();                                                     // 📏 크기 표가 없어요 = 한 번 훑어 만들어요 (하나씩 · 내용을 한꺼번에 들고 있지 않게)
        try { const L = await req(tx('r', 'readonly').index('wf').getAll(IDBKeyRange.only([who, '']))); L.forEach(e => { if (e.t === 'L') D.lists.set(e.k, e.s); }); } catch (e) {}   // 목록만 (파일 내용은 쓸 때 하나씩)
        return D.tok;
    }
    async function ready(tok) {                                                  // 바뀐 것을 다 잊은 뒤 = 이제 기억에서 꺼내 써요
        D.tok = tok || ''; D.on = !!(D.db && D.who && tok);
        if (D.on) await saveMeta();
    }
    const saveMeta = () => { clearTimeout(D.ixT); D.ixT = 0; return serial(async () => { try { await req(tx('m', 'readwrite').put({ w: D.who, tok: D.tok, size: D.size, ix: [...D.ix].map(([k, v]) => [k, v[0], v[1]]), at: Date.now() })); } catch (e) {} }); };
    const metaSoon = () => { if (!D.ixT) D.ixT = setTimeout(saveMeta, 3000); };   // 📏 크기 표는 모아서 조금 뒤에 한 번
    /* 📏 크기 표 (ix) : 넣을 때 · 고칠 때 = 그 크기로 (예전 크기는 빼고) · 잊을 때 = 빼요 */
    function ixSet(k, n, a) { const o = D.ix.get(k); if (o) D.size -= o[0]; D.ix.set(k, [n, a || Date.now()]); D.size += n; }
    function ixDel(k) { const o = D.ix.get(k); if (!o) return; D.size -= o[0]; D.ix.delete(k); }
    const byteLen = b => (b && (b.byteLength || b.length)) || 0;
    function ixScan() {
        return new Promise(ok => {
            let c; try { c = tx('r', 'readonly').index('w').openCursor(IDBKeyRange.only(D.who)); } catch (e) { ok(); return; }
            c.onsuccess = () => { const cur = c.result; if (!cur) { ok(); return; } ixSet(cur.value.k, byteLen(cur.value.b), 0); cur.continue(); };
            c.onerror = () => ok();
        });
    }
    async function trim() {                                                      // 📏 넘쳤으면 오래 안 쓴 것부터 LOW 까지
        if (D.size <= CAP) return;
        const old = [...D.ix].sort((x, y) => x[1][1] - y[1][1]), ks = []; let sz = D.size;
        for (const [k, v] of old) { if (sz <= LOW) break; ks.push(k); sz -= v[0]; }
        await dropKeys(ks); metaSoon();
    }
    async function wipe() {                                                      // 이 계정 기억 모두 버리기 (표시도)
        D.on = false; D.lists.clear(); D.size = 0; D.tok = ''; D.ix.clear(); clearTimeout(D.ixT); D.ixT = 0;
        if (!D.db || !D.who) return;
        await serial(async () => {
            try { const ks = await req(tx('r', 'readonly').index('w').getAllKeys(D.who)); const s = tx('r', 'readwrite'); ks.forEach(k => s.delete(k)); await new Promise(ok => { s.transaction.oncomplete = s.transaction.onerror = ok; }); } catch (e) {}
            try { await req(tx('m', 'readwrite').delete(D.who)); } catch (e) {}
        });
    }
    /* ---------- 잊기 ---------- */
    function dropKeys(ks) {
        if (!ks.length || !D.db) return Promise.resolve();
        ks.forEach(k => { D.lists.delete(k); ixDel(k); }); metaSoon();
        return serial(async () => { try { const s = tx('r', 'readwrite'); ks.forEach(k => s.delete(k)); await new Promise(ok => { s.transaction.oncomplete = s.transaction.onerror = ok; }); } catch (e) {} });
    }
    const urlQ = k => { try { return decodeURIComponent(k); } catch (e) { return k; } };
    const listsUrl = s => [...D.lists.keys()].filter(k => urlQ(k).includes("'" + s + "'"));   // 그 폴더 안을 찾은 목록 (주소에 그 번호 · 도련 11-17 : 폴더를 찾은 목록은 아니에요)
    const listsHas = s => [...D.lists.entries()].filter(([k, t]) => t && t.includes('"' + s + '"')).map(([k]) => k);   // 그 파일이 들어 있는 목록
    const parentsOf = k => (urlQ(k).match(/'[^']+' in parents/g) || []).map(x => x.slice(1, x.indexOf("'", 1)));
    /* 새 파일이 이 목록에 들어갈 수 있나 (찾는 글의 이름 · 종류 조건만 봐요 · 모르면 들어갈 수 있다고 봐요) */
    const FOLDER = 'application/vnd.google-apps.folder';
    function mayHold(k, f) {
        if (!f || !f.name) return true;
        const q = urlQ(k), eq = [...q.matchAll(/name='((?:\\.|[^'])*)'/g)].map(m => m[1].replace(/\\(.)/g, '$1')), has = [...q.matchAll(/name contains '((?:\\.|[^'])*)'/g)].map(m => m[1].replace(/\\(.)/g, '$1'));
        if ((eq.length || has.length) && !eq.includes(f.name) && !has.some(x => f.name.includes(x))) return false;
        if (q.includes("mimeType='" + FOLDER + "'") && f.mimeType && f.mimeType !== FOLDER) return false;
        if (q.includes("mimeType!='" + FOLDER + "'") && f.mimeType === FOLDER) return false;
        return true;
    }
    const dropNew = (ks, f) => dropKeys(ks.filter(k => mayHold(k, f)));         // 새로 생긴 파일 = 들어갈 수 있는 목록만 잊어요
    const dropGlobal = () => dropKeys([...D.lists.keys()].filter(k => !/ in parents/.test(urlQ(k))));   // 폴더를 정하지 않은 찾기 (이름으로 모든 폴더 · js/mine.js) = 어디에 새 파일이 생겨도 달라질 수 있어요
    const dropAllLists = () => dropKeys([...D.lists.keys()]);
    async function dropContent(fid, keepMd5) {                                   // 그 파일 내용 · 정보 (keepMd5 = 이 지문으로 기억한 내용은 그대로)
        if (!D.db || !fid) return;
        let F = []; try { F = await req(tx('r', 'readonly').index('wf').getAll([D.who, fid])); } catch (e) {}
        await dropKeys(F.filter(e => !(keepMd5 && e.md5 && e.md5 === keepMd5)).map(e => e.k));
    }
    function rewrite(k, text) {                                                  // 목록 글 고쳐 쓰기
        D.lists.set(k, text);
        return serial(async () => { try { const e = await req(tx('r', 'readonly').get(k)); if (!e) return; e.s = text; e.b = new TextEncoder().encode(text).buffer; ixSet(k, e.b.byteLength); metaSoon(); await req(tx('r', 'readwrite').put(e)); } catch (er) {} });
    }
    /* 🩹 그 파일이 든 목록 = 버리지 않고 새 값만 바꿔 끼워요 (도련 11-17 · changes 답 · 올린 답에 새 수정 시각 · 크기 · 지문이 있어요)
       f = 새 정보 (null = 지웠어요 · 휴지통) → { has: 들어 있던 목록 수, out: 이름이 바뀌거나 다른 폴더로 옮겨졌어요 } */
    async function patchLists(fid, f) {
        const ks = listsHas(fid), drop = []; let has = 0, out = false;
        for (const k of ks) {
            let j; try { j = JSON.parse(D.lists.get(k)); } catch (e) { drop.push(k); continue; }
            const e = (j.files || []).find(x => x && x.id === fid); if (!e) continue;   // 그 번호가 다른 파일의 부모로만 적힌 목록 = 그대로
            has++;
            const ps = parentsOf(k), moved = !!(f && f.parents && ps.length && !ps.some(p => f.parents.includes(p)));
            if (!f || f.trashed || moved || (f.name != null && e.name != null && e.name !== f.name)) { drop.push(k); if (f) out = true; continue; }
            ['modifiedTime', 'size', 'md5Checksum', 'createdTime', 'mimeType'].forEach(x => { if (x in e && f[x] != null) e[x] = f[x]; });
            if ('parents' in e && Array.isArray(f.parents)) e.parents = f.parents;
            await rewrite(k, JSON.stringify(j));
        }
        await dropKeys(drop);
        return { has, out };
    }
    /* 바뀐 것 묻기 답 (changes) → 잊기 · 바꿔 끼우기 */
    async function apply(changes) {
        if (!D.db || !D.who || !Array.isArray(changes) || !changes.length) return;
        for (const c of changes) {
            const f = c.file, gone = !!(c.removed || !f || f.trashed);
            await dropContent(c.fileId, !gone ? f.md5Checksum : '');
            const r = await patchLists(c.fileId, gone ? null : f);
            if (gone) { await dropKeys(listsUrl(c.fileId)); continue; }            // 지운 폴더 = 그 안을 찾은 목록도
            if (!r.has || r.out) {                                               // 새로 생겼거나 · 이름 · 자리가 바뀌었어요 = 그 폴더 안 목록 · 이름 찾기 목록 중 그 파일이 들어갈 수 있는 것만 다시
                (f.parents || []).forEach(p => dropNew(listsUrl(p), f));
                if ((f.spaces || []).includes('appDataFolder')) dropNew(listsUrl('appDataFolder'), f);
                await dropNew([...D.lists.keys()].filter(k => !/ in parents/.test(urlQ(k))), f);
            }
        }
        await D.q;
    }
    /* ---------- 꺼내 쓰기 · 기억하기 (js/drive.js gfetch) ---------- */
    async function serve(url) {
        if (!D.on) return null;
        if (url.startsWith(ABOUT)) { const t = D.about.get(url); if (t == null) return null; D.hit++; return new Response(t, { status: 200, headers: { 'content-type': 'application/json' } }); }
        const K = kindOf(url); if (!K) return null;
        let e = null;
        try { e = await req(tx('r', 'readonly').get(D.who + '|' + url)); } catch (er) { return null; }
        if (!e) { D.miss++; return null; }
        D.hit++; const o = D.ix.get(e.k); if (o) { o[1] = Date.now(); metaSoon(); } else { ixSet(e.k, byteLen(e.b)); metaSoon(); }   // 📏 마지막 쓴 때
        return new Response(e.b, { status: 200, headers: { 'content-type': e.ct || 'application/json' } });
    }
    async function keep(url, res) {                                              // 받은 그대로 기억 (늘 · 표시가 정해지기 전에도 · 켤 때 다 잊고 시작하면 써요)
        if (!D.db || !D.who) return;
        if (url.startsWith(ABOUT)) { try { D.about.set(url, await res.text()); } catch (e) {} return; }
        if (!D.on) return;                                                       // 표시가 정해진 뒤에 읽은 것만 (그 전 것은 바뀌었는지 몰라요)
        const K = kindOf(url); if (!K) return;
        let b; try { b = await res.arrayBuffer(); } catch (e) { return; }
        if (b.byteLength > MAXB) return;
        const ct = res.headers.get('content-type') || '';
        await put({ k: D.who + '|' + url, w: D.who, t: K.k, f: K.f || '', b, ct, s: K.k === 'L' ? new TextDecoder().decode(b) : undefined });
    }
    async function put(e) {
        if (e.t === 'L') D.lists.set(e.k, e.s);
        ixSet(e.k, byteLen(e.b)); metaSoon();                                     // 📏 같은 것을 덮어쓰면 예전 크기는 빼요
        const p = serial(async () => { try { await req(tx('r', 'readwrite').put(e)); } catch (er) {} });
        if (D.size > CAP) await trim();                                          // 너무 커지면 오래 안 쓴 것부터 (예전 = 통째로 비움)
        return p;
    }
    /* 이 창이 쓸 때 (gfetch 쓰기 답 뒤) */
    async function wrote(url, opts, id, j) {                                    // j = 쓰기 답 (번호 · 수정 시각 · 지문)
        if (!D.db || !D.who) return;
        const m = /\/files\/([^/?]+)/.exec(url), fid = (m && m[1]) || id || '';
        const body = typeof (opts && opts.body) === 'string' ? opts.body : '', meth = (opts && opts.method) || '';
        if (fid) await dropContent(fid);
        if (/addParents|removeParents/.test(url) || (m && !/uploadType=media/.test(url) && /"(name|trashed|parents)"\s*:/.test(body))) { await dropAllLists(); return; }   // 이름 · 휴지통 · 옮기기 (드물어요)
        if (m && meth === 'DELETE') { await patchLists(fid, null); await dropKeys(listsUrl(fid)); return; }
        if (m && /uploadType=media/.test(url)) {                                 // 내용 고침 = 그 파일이 든 목록에 새 값만
            const f = Object.assign({ size: String(new TextEncoder().encode(body).length) }, j || {}); delete f.id;
            const r = await patchLists(fid, f.trashed ? null : f);
            if (!r.has) await dropGlobal();
            return;
        }
        if (!m) {                                                                // 새로 만들기 : 그 폴더 안 목록 · 이름 찾기 목록 (모르면 모두)
            const p = /"parents"\s*:\s*\[([^\]]*)\]/.exec(body);
            const ps = p ? (p[1].match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1)) : [];
            let nf = null; try { const mm = /\{[^{}]*"name"[^{}]*\}/.exec(body); if (mm) nf = JSON.parse(mm[0]); } catch (e) {}   // 새 파일 이름 · 종류 (만들기 글 맨 앞)
            if (ps.length) for (const x of ps) await dropNew(listsUrl(x), nf); else await dropAllLists();
            await dropNew([...D.lists.keys()].filter(k => !/ in parents/.test(urlQ(k))), nf);
        }
    }
    async function keepBody(id, body, md5) {                                     // 올린 내용 그대로 (driveUpsert) = 다시 받지 않아요
        if (!D.db || !D.who || !id || typeof body !== 'string') return;
        const b = new TextEncoder().encode(body).buffer; if (b.byteLength > MAXB) return;
        await put({ k: D.who + '|' + API + '/' + id + '?alt=media', w: D.who, t: 'F', f: id, b, ct: 'application/json', md5: md5 || '' });
    }
    window.DRC = { limit: (c, l) => { CAP = c; LOW = l; }, boot, ready, wipe, apply, serve, keep, wrote, keepBody, off: () => { D.on = false; }, get on() { return D.on; }, stat: () => ({ on: D.on, hit: D.hit, miss: D.miss, lists: D.lists.size, size: D.size, n: D.ix.size })  };
})();
