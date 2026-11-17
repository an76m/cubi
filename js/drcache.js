/* 말랑달콤 다이어리 - js/drcache.js · ⚡ 드라이브 읽기 기억 (DRC · 도련 11-17 "요청 1번으로 다 알아보고 바뀐 것만 받기")
   앱을 켤 때 : 계정 확인 1번 (about) + 바뀐 것 묻기 1번 (changes · 지난번 '여기부터' 표시부터) → 바뀐 파일 · 폴더 목록만 잊어요 → 나머지는 이 기기에 둔 것으로 바로
   - 기억하는 것 = 드라이브에서 읽은 그대로 (GET 답 · 잠긴 json 은 잠긴 채 · 계정마다 · 이 기기 IndexedDB 'malang-drc')
       L = 파일 · 폴더 목록 (files?q=…) · F = 파일 하나 (files/<번호>?alt=media · ?fields=…) · 계정 확인(about) = 이 창 메모리만
   - 잊는 때 (js/drive.js 가 불러요)
       ① 바뀐 것 묻기 답 (켤 때 drcBoot · 돌아올 때 changesForeign) : 바뀐 파일 · 폴더 · 지운 것 = 그것 · 그것이 든 목록 · 그 폴더(부모) 목록 · 그 폴더 안 목록
       ② 이 창이 쓸 때 (gfetch 쓰기) : 그 파일 · 그 파일이 든 목록 · 새 파일의 폴더 목록 (모르면 목록 모두) · 올린 내용은 그대로 기억 (driveUpsert · 다음에 켤 때 지문 md5 가 같으면 다시 안 받아요)
   - 처음 기기 · 브라우저 저장을 지움 · 🍎 7일 규칙으로 지워짐 · 표시가 너무 오래돼 구글이 안 받아 줌 = 예전처럼 다 읽어요 (드라이브가 기준이라 잃는 건 없어요)
   - 🏠 로그인 없이 · 👀 구경 = 안 써요 (드라이브 요청이 없어서) · 🧹 설정 브라우저 지우기 = '🖼 읽어 둔 스티커 · 그림 · 목록' 칸 */
(function () {
    const API = 'https://www.googleapis.com/drive/v3/files', ABOUT = 'https://www.googleapis.com/drive/v3/about';
    const DB = 'malang-drc', MAXB = 6 * 1024 * 1024, CAP = 300 * 1024 * 1024;
    const D = { on: false, who: '', db: null, lists: new Map(), about: new Map(), q: Promise.resolve(), hit: 0, miss: 0, size: 0, tok: '' };
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
        D.size = (m && m.size) || 0; D.tok = (m && m.tok) || '';
        try { const L = await req(tx('r', 'readonly').index('w').getAll(who)); L.forEach(e => { if (e.t === 'L') D.lists.set(e.k, e.s); }); } catch (e) {}
        return D.tok;
    }
    async function ready(tok) {                                                  // 바뀐 것을 다 잊은 뒤 = 이제 기억에서 꺼내 써요
        D.tok = tok || ''; D.on = !!(D.db && D.who && tok);
        if (D.on) await saveMeta();
    }
    const saveMeta = () => serial(async () => { try { await req(tx('m', 'readwrite').put({ w: D.who, tok: D.tok, size: D.size, at: Date.now() })); } catch (e) {} });
    async function wipe() {                                                      // 이 계정 기억 모두 버리기 (표시도)
        D.on = false; D.lists.clear(); D.size = 0; D.tok = '';
        if (!D.db || !D.who) return;
        await serial(async () => {
            try { const ks = await req(tx('r', 'readonly').index('w').getAllKeys(D.who)); const s = tx('r', 'readwrite'); ks.forEach(k => s.delete(k)); await new Promise(ok => { s.transaction.oncomplete = s.transaction.onerror = ok; }); } catch (e) {}
            try { await req(tx('m', 'readwrite').delete(D.who)); } catch (e) {}
        });
    }
    /* ---------- 잊기 ---------- */
    function dropKeys(ks) {
        if (!ks.length || !D.db) return Promise.resolve();
        ks.forEach(k => D.lists.delete(k));
        return serial(async () => { try { const s = tx('r', 'readwrite'); ks.forEach(k => s.delete(k)); await new Promise(ok => { s.transaction.oncomplete = s.transaction.onerror = ok; }); } catch (e) {} });
    }
    const listsWith = s => [...D.lists.entries()].filter(([k, t]) => k.includes(s) || (t && t.includes('"' + s + '"'))).map(([k]) => k);
    async function dropFile(fid, keepMd5) {                                      // 그 파일 (keepMd5 = 이 지문으로 기억한 내용은 그대로) + 그 파일이 든 목록 + 그 번호로 찾은 목록 (폴더 안)
        if (!D.db || !fid) return;
        let F = []; try { F = await req(tx('r', 'readonly').index('wf').getAll([D.who, fid])); } catch (e) {}
        await dropKeys(F.filter(e => !(keepMd5 && e.md5 && e.md5 === keepMd5)).map(e => e.k).concat(listsWith(fid)));
    }
    const dropParent = pid => dropKeys(listsWith(pid));
    const dropGlobal = () => dropKeys([...D.lists.keys()].filter(k => { let q = k; try { q = decodeURIComponent(k); } catch (e) {} return !/ in parents/.test(q); }));   // 폴더를 정하지 않은 찾기 (이름으로 모든 폴더 · js/mine.js) = 어디에 새 파일이 생겨도 달라질 수 있어요
    const dropAllLists = () => dropKeys([...D.lists.keys()]);
    /* 바뀐 것 묻기 답 (changes) → 잊기 */
    async function apply(changes) {
        if (!D.db || !D.who || !Array.isArray(changes) || !changes.length) return;
        for (const c of changes) {
            const f = c.file;
            await dropFile(c.fileId, f && !c.removed && !f.trashed ? f.md5Checksum : '');   // 그 파일 + 그 파일이 든 목록 + 그 폴더 안 목록 (폴더면 · 주소에 번호가 있어요)
            if (f) (f.parents || []).forEach(p => { dropParent(p); });                  // 그 파일이 있는 폴더의 목록 (새로 생긴 것 · 수정 시각)
            if (f) dropGlobal();
            if (f && (f.spaces || []).includes('appDataFolder')) dropKeys(listsWith('appDataFolder'));
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
        D.hit++;
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
        D.size += e.b.byteLength || e.b.length || 0;
        if (D.size > CAP) { const t = D.tok; await wipe(); D.tok = t; D.on = !!t; D.size = 0; await saveMeta(); return; }   // 너무 커지면 한 번 비우고 다시 (표시는 그대로)
        return serial(async () => { try { await req(tx('r', 'readwrite').put(e)); } catch (er) {} });
    }
    /* 이 창이 쓸 때 (gfetch 쓰기 답 뒤) */
    async function wrote(url, opts, id) {
        if (!D.db || !D.who) return;
        const m = /\/files\/([^/?]+)/.exec(url), fid = (m && m[1]) || id || '';
        if (fid) await dropFile(fid);
        const body = typeof (opts && opts.body) === 'string' ? opts.body : '';
        if (/addParents|removeParents/.test(url) || /"(name|trashed|parents)"\s*:/.test(m && !/uploadType=media/.test(url) ? body : '')) { await dropAllLists(); return; }   // 이름 · 휴지통 · 옮기기
        if (m) await dropGlobal();                                               // 내용 고침 = 수정 시각이 바뀌어요 (이름 찾기 목록에도 있어요 · 그 파일이 든 목록은 위에서)
        if (!m) {                                                                // 새로 만들기 : 그 폴더 목록 (모르면 모두)
            const p = /"parents"\s*:\s*\[([^\]]*)\]/.exec(body);
            const ps = p ? (p[1].match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1)) : [];
            if (ps.length) for (const x of ps) await dropParent(x); else await dropAllLists();
            await dropGlobal();
        }
    }
    async function keepBody(id, body, md5) {                                     // 올린 내용 그대로 (driveUpsert) = 다시 받지 않아요
        if (!D.db || !D.who || !id || typeof body !== 'string') return;
        const b = new TextEncoder().encode(body).buffer; if (b.byteLength > MAXB) return;
        await put({ k: D.who + '|' + API + '/' + id + '?alt=media', w: D.who, t: 'F', f: id, b, ct: 'application/json', md5: md5 || '' });
    }
    window.DRC = { boot, ready, wipe, apply, serve, keep, wrote, keepBody, off: () => { D.on = false; }, get on() { return D.on; }, stat: () => ({ on: D.on, hit: D.hit, miss: D.miss, lists: D.lists.size, size: D.size }) };
})();
