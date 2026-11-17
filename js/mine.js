/* 말랑달콤 다이어리 - js/mine.js
   📦 내 실물 (도련 11-16) : 받은 상품은 다꾸러 드라이브에 진짜로 있어요 (서버 = 가게 · 서버에서 고치거나 지워도 가진 것은 받은 그때 모습)
   - 묶음 다섯 (G · 한 줄 더하면 다른 종류도) : 🪑 소품 / _실물.json (책상소품 · 🧱 벽지 · 🪵 책상판) · ✏️ 문구 / _실물.json (문구) · 📔 다이어리 / _실물.json (날짜형 · 페이지형 바인더 · 노트 · 내지 · 1265)
       · 🌈 배경지 / _실물.json · 📥 빈스티커첩 / _실물.json (📒 스티커바인더 · 🤍 이형지북 · 1266)
       📒 🤍 가진 것 = 빈스티커첩 목록 + 스티커 정리에 불러온 책 (그 종류 _스티커첩.json · 읽어 둔 것만) → 받는 순간 실물이 생겨서 (받은- 파일 · 묶음) 스티커 정리로 옮겨도 그대로 · 스티커 창을 열면 빠진 것을 채워요
       📋 목록 _실물.json 🔐 { v: 2, k, items: { '종류|상품 id': { K, P, f, wh, h, got } }, gid, gf: [그림 이름], cs: [담은 받은- 파일 번호] } = 속성 + 그림 이름만 (가벼워요 · 몇 KB)
       🖼 그림 묶음 _실물그림.json 🔐 { v, img: { 그림 이름: 그림 } } = 묶음마다 파일 하나 (새 그림이 생기면 통째로 다시 · 목록에 파일 번호 gid · 그림 이름 gf → 🚨 비상 = 요청 1번)
       같은 디자인은 한 번만 (여러 개 가져도) · 보관함 · 재료 · 🎁 처음 선물도
   - 🪑 ✏️ 진짜 기준 = 물건 하나에 받은- 파일 하나 (예전 그대로 🔐 · 같은 u 는 하나) : 그 안에 실물도 { u, id, from, got 받은 시각, pr: { id, K, P, f, wh, h }, pi: { 그림 이름: 그림 } }
       묶음이 깨지거나 없어져도 받은- 파일 · 서버로 다시 만들어요
   - 📔 다이어리는 받은- 파일이 없어요 (목록 한 줄이 원본 · js/dyown.js) → 묶음 + 기기 사본 (백업 파일 없음 · 도련 11-17 : 깨짐 = 올릴 때 구글 지문 md5 확인)
       가진 것 = 다이어리 목록 · 바인더 재료 목록의 pid (상품 id) · 날짜 표지 d + 날짜형 권 id 안의 디자인 (dyyOf)
   - 🎯 드라이브 요청을 아껴요 (도련 11-16 · 11-17 : 많은 사용자 = 앱 전체 요청 한도 · 서버 = 요청 · 트래픽 무제한)
       평소 앱을 열 때 = 드라이브 0번 (기기 것) · 묻는 때 = 받거나 새로 생겼을 때 (쓰기 전 합치기) · 다른 기기가 고쳤을 때 (drive.js changes 를 같이 봐요) · 하루 한 번
       🚨 서버가 아예 없으면 = js/prod.js 기기에 둔 지난 목록 + 가진 것 모두 내 실물로 (PROD_CACHED)
       평소 그림 = 늘 서버 (같은 그림이면 서버 주소 그대로) · 드라이브를 물을 때도 '바뀌었나' 목록 요청 1번 · 바뀌었으면 가벼운 목록만 (그림 X)
       🚨 비상 (서버에 없거나 서버 모습이 내 것과 달라요) + 기기에 그 그림이 없어요 → 1) 서버에 같은 그림 이름이 있으면 서버 2) 없으면 드라이브 그림 묶음 (파일 번호로 바로 · 요청 1번)
   - 기기 보관 (IndexedDB 'malang-mine' · 계정|묶음) : 목록 + 받아 둔 그림 (서버에서 받은 것 · 비상 때 드라이브에서 받은 것)
   - 두 기기 : 쓰기 전에 드라이브 목록이 바뀌었으면 먼저 읽어서 합쳐요 (상품 id 기준 · 빠지는 것 없이) · 하루 한 번 받은- 파일과 맞춰 봐요 (모든 폴더 이름 목록 요청 1번 · 빠진 것만 읽어요)
   - 그리기 = js/prod.js prodList : 서버와 다른 것만 내 실물로 (mineDiff) · 같은 그림은 서버 주소 그대로 · 다르면 내 그림 (blob) · 바뀌면 prodRebuild (각 파일의 prodHook)
   - 게스트 = 이 기기에만 · 로그인 = 드라이브 + 이 기기 */
(function () {
    const G = {                                                                // 묶음 → 폴더 (drive.js DIRS) · 상품 종류 · rcv = 받은- 파일이 있어요
        소품: { dir: 'desk', K: ['책상소품', '벽지', '책상판'], rcv: 1 },         // 🧱 🪵 벽지 · 책상판도 소품 폴더 (1266)
        문구: { dir: 'gd', K: ['문구'], rcv: 1 },
        다이어리: { dir: 'diary', K: ['날짜형바인더', '날짜형노트', '페이지바인더', '페이지노트', '날짜형내지', '페이지내지'] },
        배경지: { dir: 'pattern', K: ['배경지'], rcv: 1 },                          // 🌈 (1266)
        빈스티커첩: { dir: 'emptyBook', K: ['스티커바인더', '이형지북'], rcv: 1 }   // 📒 🤍 (1266)
    };
    const KINDS = {}; Object.keys(G).forEach(g => G[g].K.forEach(K => { KINDS[K] = g; }));   // 상품 종류 → 묶음
    const FILE = '_실물.json', PK = '_실물그림.json', DAY_MAX = 40;
    const key = (K, id) => K + '|' + id;
    const M = { who: '', pg: [], k: {}, url: {}, diff: {}, sig: '', last: 0, run: null, again: false, dirty: new Set(), t: 0 };
    const blank = () => ({ items: {}, img: {}, gf: [], gid: '', cs: [], fid: '', mt: '' });   // img = 기기에만 · 드라이브 목록에는 gid 그림 묶음 파일 번호 + gf 그 안의 그림 이름
    const obj = v => v && typeof v === 'object' && !Array.isArray(v);
    const norm = r => { const b = blank(); if (!obj(r)) return b; if (obj(r.items)) Object.keys(r.items).forEach(k => { const x = r.items[k]; if (obj(x) && obj(x.f) && typeof x.K === 'string' && k === key(x.K, k.slice(x.K.length + 1))) b.items[k] = x; }); if (obj(r.img)) Object.keys(r.img).forEach(f => { if (typeof r.img[f] === 'string' && r.img[f].startsWith('data:')) b.img[f] = r.img[f]; }); if (Array.isArray(r.gf)) b.gf = [...new Set(r.gf.filter(okF))]; if (typeof r.gid === 'string') b.gid = r.gid; if (Array.isArray(r.cs)) b.cs = [...new Set(r.cs.map(String))]; if (typeof r.fid === 'string') b.fid = r.fid; if (typeof r.mt === 'string') b.mt = r.mt; return b; };
    const grp = g => M.k[g] || (M.k[g] = blank());
    const kind = K => grp(KINDS[K]);
    const okF = f => window.PROD_OKF ? PROD_OKF(f) : false;
    const online = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
    const whoNow = () => online() ? (typeof COLL !== 'undefined' && COLL.who && COLL.who !== 'guest' ? COLL.who : '') : (typeof drive !== 'undefined' && drive.guest ? 'guest' : '');

    /* 🗄 기기 보관 */
    let dbP = null;
    const db = () => dbP || (dbP = new Promise(res => { try { const r = indexedDB.open('malang-mine', 1); r.onupgradeneeded = () => r.result.createObjectStore('b'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }));
    async function idb(key, v) {
        if (typeof drive !== 'undefined' && drive.local) return null;           // 🏠 로그인 없이 = 원본(_실물 · 그림 묶음)이 이미 이 브라우저 → 사본은 안 만들고 메모리로만 (켤 때 원본에서 읽어요 · 도련 11-18)
        const d = await db(); if (!d) return null;
        return new Promise(res => { try { const tx = d.transaction('b', v === undefined ? 'readonly' : 'readwrite'), st = tx.objectStore('b'), q = v === undefined ? st.get(key) : st.put(v, key); q.onsuccess = () => res(v === undefined ? q.result || null : true); q.onerror = () => res(null); } catch (e) { res(null); } });
    }
    const devSave = g => idb(M.who + '|' + g, Object.assign({}, grp(g)));
    async function devLoad(who) {
        if (M.who === who) return;
        M.who = who; M.k = {}; M.diff = {}; M.dirty.clear(); M.last = 0;
        for (const g of Object.keys(G)) M.k[g] = norm(await idb(who + '|' + g));
        M.pg.splice(0).forEach(([K, c]) => mineGot(K, c));                    // 그 사이 받은 것
        apply();
    }

    /* 🖼 그림 */
    const blobOf = d => { const i = d.indexOf(','), mime = (d.slice(5, i).split(';')[0]) || 'image/webp', bin = atob(d.slice(i + 1)), a = new Uint8Array(bin.length); for (let j = 0; j < bin.length; j++) a[j] = bin.charCodeAt(j); return new Blob([a], { type: mime }); };
    function mineUrl(f) {
        if (M.url[f]) return M.url[f];
        for (const K of Object.keys(M.k)) { const d = M.k[K].img[f]; if (d) { try { return (M.url[f] = URL.createObjectURL(blobOf(d))); } catch (e) { return ''; } } }
        return '';
    }
    async function fetchData(f) {
        try {
            const r = await fetch((typeof PROD_BASE !== 'undefined' ? PROD_BASE : 'https://malang-img.pages.dev') + '/k/' + f); if (!r.ok) return '';
            const b = await r.blob();
            return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(String(fr.result || '')); fr.onerror = () => res(''); fr.readAsDataURL(b); });
        } catch (e) { return ''; }
    }

    /* 🔎 서버와 다른 것만 (그릴 때 · js/prod.js) */
    const stable = v => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : obj(v) ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}' : JSON.stringify(v === undefined ? null : v);
    const LOOK = x => { const P = Object.assign({}, (x && x.P) || {}); ['숨김', '처음받기', '순서', '신상', '스토어'].forEach(k => delete P[k]); return stable({ P, f: (x && x.f) || {}, wh: (x && x.wh) || {} }); };   // 진열 값은 빼고 모습만
    function mineDiff(K) {
        if (M.diff[K]) return M.diff[K];
        const B = KINDS[K] && M.k[KINDS[K]], D = {};
        if (B) Object.keys(B.items).forEach(k => { const x = B.items[k]; if (x.K !== K) return; const id = k.slice(K.length + 1), s = window.prodRawOf ? prodRawOf(K, id) : null; if (!s || LOOK(s) !== LOOK(x) || window.PROD_CACHED) D[id] = Object.assign({ id }, x); });   // 🚨 서버가 없으면 가진 것 모두 내 실물로 (그림 = 기기 · 드라이브)
        return (M.diff[K] = D);
    }
    function apply() {                                                         // 다른 것이 바뀌었을 때만 다시 그려요
        M.diff = {};
        const sig = stable(Object.keys(KINDS).map(K => Object.keys(mineDiff(K)).sort().map(id => id + '|' + LOOK(mineDiff(K)[id]))));   // (종류마다)
        if (sig === M.sig) return;
        const first = !M.sig && sig === stable(Object.keys(KINDS).map(() => []));
        M.sig = sig; if (!first && window.prodRebuild) prodRebuild();
    }

    /* 📥 받을 때 : 서버 상품 → 내 실물 (그림까지) · 받은- 파일에 넣을 것 { pr, pi } (못 받으면 null = 다음에 다시) */
    async function mineSnap(K, id) {
        if (!KINDS[K] || typeof id !== 'string') return null;
        if (!M.who) { const w = whoNow(); if (w) await devLoad(w); }
        const B = kind(K);
        let it = B.items[key(K, id)];
        if (!it) { const raw = window.prodRawOf ? prodRawOf(K, id) : null; if (!raw || !obj(raw.f)) return null; it = JSON.parse(JSON.stringify({ K, P: raw.P || {}, f: raw.f, wh: raw.wh || {}, h: raw.h || '' })); it.got = Date.now(); }
        const pi = {};
        for (const f of Object.values(it.f)) { if (!okF(f)) continue; if (!B.img[f]) { const d = await fetchData(f); if (!d) return null; B.img[f] = d; } pi[f] = B.img[f]; }
        if (!B.items[key(K, id)]) { B.items[key(K, id)] = it; M.dirty.add(KINDS[K]); }
        return { pr: Object.assign({ id }, it), pi };
    }
    function mineGot(K, c) { if (!KINDS[K] || !c) return; if (!M.who) { M.pg.push([K, c]); mineSoon(true); return; }   /* 기기 것을 읽기 전 = 읽은 뒤에 담아요 */ const B = kind(K); c = String(c); if (B.cs.includes(c)) return; B.cs.push(c); devSave(KINDS[K]).catch(() => {}); mineSoon(true); }   // 새 받은- 파일일 때만 · 📦 번호만 늘었으면 이 기기에만 적고 드라이브엔 다음에 실물이 바뀔 때 같이 (도련 11-17 · 같은 상품을 또 받을 때 _실물.json 다시 올리기 없음 · 새 디자인이면 fill 이 올려요)
    function diaryIds() {                                                      // 📔 가진 다이어리 · 재료의 상품 id (목록 · 재료 목록 · 날짜형 권 id)
        const out = [], walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (obj(v)) Object.keys(v).forEach(k => { const x = v[k]; if ((k === 'pid' || (k === 'd' && v.t === 'dcover')) && typeof x === 'string') out.push(x); else if (x && typeof x === 'object') walk(x); }); };
        const L = typeof dyoAll === 'function' ? dyoAll() : [];
        walk(L);
        L.forEach(x => { const b = x.t === 'date' && typeof dyyOf === 'function' ? dyyOf(x.id) : null; if (b) out.push(b.c); });
        if (typeof prefGet === 'function') ['diary_cover_own', 'diary_refill_own'].forEach(k => { try { walk(prefGet(k, '')); } catch (e) { } });   // 💤 재료 목록은 읽은 뒤에만
        return out;
    }
    function pids(v, out) { if (Array.isArray(v)) v.forEach(x => pids(x, out)); else if (obj(v)) Object.keys(v).forEach(k => { const x = v[k]; if (k === 'pid' && typeof x === 'string') out.push(x); else if (x && typeof x === 'object') pids(x, out); }); return out; }
    function bookIds() {                                                       // 📒 🤍 빈스티커첩 목록 + 스티커 정리에 불러온 책 (읽어 둔 종류만 · js/own.js O)
        const out = [];
        if (typeof prefGet === 'function') ['diary_sbd_own', 'diary_rlb_own'].forEach(k => { try { pids(prefGet(k, ''), out); } catch (e) { } });
        try { if (typeof O !== 'undefined' && O) { Object.values(O.kd || {}).forEach(d => pids(d && d.alb && { bd: d.alb.bd, rl: d.alb.rl }, out)); if (O.mem && O.mem.alb) Object.values(O.mem.alb).forEach(a => pids(a && { bd: a.bd, rl: a.rl }, out)); } } catch (e) { }
        return out;
    }
    function skinIds() {                                                       // 🧱 🪵 가진 벽지 · 책상판 + 지금 고른 것 (js/deskskin.js)
        try { const s = typeof dsRead === 'function' ? dsRead() : null; if (!s) return []; return (s.own || []).map(x => x && x.id).concat([s.wi, s.ti]).filter(x => typeof x === 'string'); } catch (e) { return []; }
    }
    const raw = g => g === '소품' ? (window.deskOwnIds ? deskOwnIds() : []).concat(skinIds())
        : g === '문구' ? ((window.gdOwnList && gdOwnList()) || []).map(o => o.id)
        : g === '다이어리' ? diaryIds()
        : g === '배경지' ? (typeof bgoOwned === 'function' ? bgoOwned().map(x => x.p) : [])
        : g === '빈스티커첩' ? bookIds() : [];
    const owned = g => { const out = []; new Set(raw(g)).forEach(id => { if (typeof id === 'string') G[g].K.forEach(K => { if (window.prodRawOf && prodRawOf(K, id)) out.push([K, id]); }); }); return out; };   // → [[종류, 상품 id]] · 같은 id 가 두 종류에 있으면 둘 다
    const mineKOf = (dir, id) => { const g = Object.keys(G).find(x => typeof DIRS !== 'undefined' && DIRS[G[x].dir] === dir); return g ? G[g].K.find(K => window.prodRawOf && prodRawOf(K, id)) || '' : ''; };   // 폴더 이름 + 상품 id → 종류 (js/coll.js ofAdd)
    async function fill() { for (const g of Object.keys(G)) for (const [K, id] of owned(g)) if (typeof id === 'string' && !grp(g).items[key(K, id)]) await mineSnap(K, id); }   // 🎁 선물 · 아직 실물이 없는 것

    /* ☁ 드라이브 (요청을 아껴요 · 평소 = '바뀌었나' 1번 · 그림은 비상일 때만) */
    function merge(B, j) {                                                     // 드라이브 목록을 기기 것에 · 기기에만 있는 것이 있으면 true (올려야 해요)
        const R = norm(j); let extra = false;
        Object.keys(R.items).forEach(id => { const a = B.items[id], b = R.items[id]; if (!a || (+b.got || 0) < (+a.got || Infinity)) B.items[id] = b; });   // 같은 id = 먼저 받은 모습
        Object.keys(B.items).forEach(id => { if (!R.items[id]) extra = true; });
        if (R.gid) { B.gid = R.gid; B.gf = R.gf.slice(); }                    // 🖼 그림 묶음 = 드라이브에 적힌 것이 진짜 (빠진 그림은 올릴 때 더해요)
        R.cs.forEach(c => { if (!B.cs.includes(c)) B.cs.push(c); });
        if (B.cs.some(c => !R.cs.includes(c))) extra = true;
        return extra;
    }
    const dirKey = g => dirPath(DIRS[G[g].dir]).join('/');
    const dirOf = (g, create) => getFolder(dirPath(DIRS[G[g].dir]), create);
    async function write(K) {
        const B = grp(K), dir = await dirOf(K, true);
        const all = new Set(); Object.values(B.items).forEach(x => Object.values(x.f).forEach(f => { if (okF(f)) all.add(f); }));
        if ([...all].some(f => !B.gf.includes(f) && B.img[f])) {               // 🖼 그림 묶음에 없는 그림이 생겼어요 → 그림 묶음 하나를 통째로 다시 (파일은 늘 하나 · 비상 = 요청 1번)
            const miss = B.gf.filter(f => all.has(f) && !B.img[f]);            // 묶음에 있는데 이 기기에 없는 그림 = 서버 (무제한) → 그래도 없으면 지금 묶음을 한 번 읽어요
            for (const f of miss) { const d = await fetchData(f); if (d) B.img[f] = d; }
            if (B.gf.some(f => all.has(f) && !B.img[f]) && B.gid) await packRead(B);
            const img = {}; all.forEach(f => { if (B.img[f]) img[f] = B.img[f]; });
            let r;
            try { r = await driveUpsert(dir, PK, B.gid || null, JSON.stringify({ v: 1, img })); }
            catch (e) { if (!B.gid) throw e; B.gid = ''; r = await driveUpsert(dir, PK, null, JSON.stringify({ v: 1, img })); }
            B.gid = String(r.id || ''); B.gf = Object.keys(img);
        }
        const body = JSON.stringify({ v: 2, k: K, items: B.items, gid: B.gid, gf: B.gf, cs: B.cs });   // 📋 목록 = 속성 + 그림 이름만 (가벼워요)
        let r;
        try { r = await driveUpsert(dir, FILE, B.fid || null, body); }
        catch (e) { if (!B.fid) throw e; B.fid = ''; r = await driveUpsert(dir, FILE, null, body); }   // 그 사이 지워진 파일 → 새로
        B.fid = String(r.id || ''); B.mt = String(r.modifiedTime || ''); M.dirty.delete(K);
        await devSave(K);
    }
    async function daily(dirs, need) {                                         // 받은- 파일 중 목록에 아직 안 담긴 것만 읽어요 (모든 폴더 = 요청 1번) · need = 바뀐 것을 모르는 사이가 있었거나 받은- 파일이 바뀌었을 때만 (도련 11-17 · 예전 = 하루 한 번)
        if (!need) return;
        const fs = await driveList(`name contains '받은-' and trashed=false`, 'id,name,parents', true);   // 지금 모습 그대로 (드물게 · 기억 말고)
        for (const K of Object.keys(G)) {
            if (!G[K].rcv || !dirs[K]) continue;
            const B = grp(K), C = new Map(fs.filter(f => (f.parents || []).includes(dirs[K])).map(f => [(/^받은-(\d+)\.json$/.exec(f.name) || [])[1], f]).filter(([c]) => c));
            const keep = B.cs.filter(c => C.has(c)); if (keep.length !== B.cs.length) { B.cs = keep; M.dirty.add(K); }   // 버린 물건 번호는 빼요 (디자인은 그대로)
            let n = 0;
            for (const [c, f] of C) {
                if (B.cs.includes(c)) continue;
                if (n++ >= DAY_MAX) break;                                     // 많으면 다음 날 이어서
                try {
                    const w = JSON.parse(await readFileText(f.id)), it = w && w.item && typeof w.item.s === 'string' ? await ownUnlock(w.item.s) : null;
                    if (it && obj(it.pr) && typeof it.id === 'string' && obj(it.pr.f)) { const x = Object.assign({}, it.pr); delete x.id; x.K = G[K].K.includes(x.K) ? x.K : G[K].K[0]; x.got = +x.got || +it.got || Date.now(); const k = key(x.K, it.id), y = B.items[k]; if (!y || x.got < (+y.got || Infinity)) B.items[k] = x; }   // 같은 id = 먼저 받은 모습
                    if (it && obj(it.pi)) Object.keys(it.pi).forEach(g => { if (!B.img[g] && typeof it.pi[g] === 'string') B.img[g] = it.pi[g]; });   // 그림은 기기에 (드라이브 그림 묶음이 없으면 올릴 때 생겨요)
                } catch (e) { }                                                // 🔐 남의 것 · 깨진 것은 넘어가요 (번호만 담아요)
                B.cs.push(c); M.dirty.add(K);
            }
        }
    }
    async function packRead(B) {                                               // 🖼 그림 묶음 읽기 (요청 1번 · 이 기기에 없는 그림만 담아요)
        try { const j = JSON.parse(await readFileText(B.gid)); let n = 0; if (j && obj(j.img)) Object.keys(j.img).forEach(x => { if (!B.img[x] && typeof j.img[x] === 'string' && j.img[x].startsWith('data:')) { B.img[x] = j.img[x]; n++; } }); return n > 0; }
        catch (e) { console.warn('📦 그림 묶음', e); return false; }
    }
    /* 🚨 비상 : 서버와 다른 내 실물의 그림이 기기에 없어요 → 1) 서버 (같은 그림 이름이 아직 있으면 · 무제한) 2) 드라이브 그림 묶음 (그 파일만) */
    const tried = new Set();
    async function rescue() {
        const want = {};
        Object.keys(KINDS).forEach(K => { const B = kind(K), D = mineDiff(K); Object.values(D).forEach(x => Object.values(x.f || {}).forEach(f => { if (okF(f) && !B.img[f] && !tried.has(f)) (want[KINDS[K]] = want[KINDS[K]] || new Set()).add(f); })); });
        let got = false;
        for (const g of Object.keys(want)) {
            const B = grp(g), left = [];
            for (const f of want[g]) { tried.add(f); const d = await fetchData(f); if (d) { B.img[f] = d; got = true; } else left.push(f); }
            if (left.some(f => B.gf.includes(f)) && B.gid && online() && await packRead(B)) got = true;   // 드라이브 그림 묶음 = 파일 번호로 바로 (요청 1번)
            if (got) await devSave(g);
        }
        if (got) { M.sig = ''; apply(); }                                      // 그림이 생겼어요 → 다시 그리기
    }
    async function sync0(force) {
        const who = whoNow(); if (!who) return;
        await devLoad(who);
        await fill();                                                          // 새로 생긴 것 (🎁 선물 · 보관함) = 늘 (그림은 서버에서 · 드라이브 요청 없음)
        /* 🎯 드라이브에 묻기 (도련 11-17 · 예전 = 하루 한 번 _실물 · 받은- 파일 목록) = 받거나 새로 생겼을 때 · 구글 changes 에 _실물 · 받은- 파일이 있을 때 (켤 때 drive.drcBoot.ch · 돌아올 때 mineHint)
           · 바뀐 것을 모르는 사이가 있었을 때 (처음 · 기억 지움 = drcBoot.n -1) · 이 기기 실물 기억이 비었을 때 */
        const B0 = (typeof drive !== 'undefined' && drive.drcBoot) || null, first = !!B0 && M.boot !== B0;   // 이번 로그인에서 처음
        const Bs = Object.values(M.k), other = c => {                         // 다른 기기가 바꾼 내 실물 파일 (이 기기가 올린 그대로면 아니에요)
            const f = c.file, n = (f && f.name) || '';
            if (!f || c.removed || f.trashed) return Bs.some(B => B.fid === c.fileId);
            if (n === FILE) return !Bs.some(B => B.fid === f.id && B.mt === f.modifiedTime);
            const m = /^받은-(\d+)\.json$/.exec(n); return !!m && !Bs.some(B => B.cs.includes(m[1]));
        };
        const need = first && (B0.n < 0 || !Array.isArray(B0.ch) || B0.ch.some(other) || !Bs.some(B => B.fid));
        if (B0) M.boot = B0;
        if (!force && !M.dirty.size && !M.hint && !need) { apply(); rescue(); return; }
        const live = M.hint || need; M.hint = false;                           // 다른 기기가 바꿨거나 모르는 사이 = 드라이브 지금 모습 · 받기 · 내 것 고침 = ⚡ 읽기 기억 (📱 한 기기 기준 · 도련 11-17)
        if (who !== 'guest' && online() && typeof driveList === 'function') {
            const fs = await driveList(`name='${FILE}' and trashed=false`, 'id,name,parents,modifiedTime', live);   // 🔎 모든 목록이 바뀌었나 = 요청 1번
            const dirs = {};
            Object.keys(G).forEach(g => { const v = drive.folderIds && drive.folderIds.get(dirKey(g)); if (v) dirs[g] = v; });   // 폴더 = 기억한 것 먼저
            for (const g of Object.keys(G)) {                                  // 모르는 폴더는 그 목록 파일이 있을 수 있을 때만 찾아요 (없는 폴더를 매번 묻지 않게)
                if (dirs[g]) continue;
                const known = new Set(Object.values(dirs));
                if (M.dirty.has(g) || Object.keys(grp(g).items).length || fs.some(x => !(x.parents || []).some(p => known.has(p)))) { const v = await dirOf(g, false); if (v) dirs[g] = v; }
            }
            const read = async id => { try { const j = JSON.parse(await readFileText(id)); return j && obj(j.items) ? j : null; } catch (e) { console.warn('📦 실물 목록', e); return null; } };
            for (const K of Object.keys(G)) {
                const mine = n => fs.filter(x => x.name === n && dirs[K] && (x.parents || []).includes(dirs[K])).sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime)))[0];
                const B = grp(K), f = mine(FILE);
                if (f && (f.id !== B.fid || f.modifiedTime !== B.mt)) {
                    const j = await read(f.id);
                    if (j) { if (merge(B, j)) M.dirty.add(K); B.fid = f.id; B.mt = String(f.modifiedTime || ''); await devSave(K); }
                    else { B.fid = f.id; M.dirty.add(K); }                      // 못 여는 목록 = 기기 것 · 받은- 파일로 다시 써요
                } else if (!f) {                                               // 없어졌어요 → 기기 것으로 다시
                    if (B.fid || Object.keys(B.items).length) { B.fid = ''; M.dirty.add(K); }
                }
            }
            await daily(dirs, live);
            for (const K of [...M.dirty]) { try { await write(K); } catch (e) { console.warn('📦 실물 목록 올리기', K, e); } }
        } else for (const K of [...M.dirty]) { await devSave(K); M.dirty.delete(K); }
        apply(); await rescue();
    }
    function mineSync(force) {
        if (M.run) { if (force) M.again = true; return M.run; }
        M.run = sync0(force).catch(e => console.warn('📦 실물', e)).finally(() => { M.run = null; if (M.again) { M.again = false; mineSync(true); } });
        return M.run;
    }
    function mineSoon(force) { M.f = M.f || !!force; clearTimeout(M.t); M.t = setTimeout(() => { const f = M.f; M.f = false; mineSync(f); }, M.f ? 1500 : 400); }   // 받은 것(force)은 이어지는 부름에도 그대로
    function mineHint(id) { if (!id) return; if (Object.values(M.k).some(B => B.fid === id || B.gid === id)) { M.hint = true; mineSoon(); } }   // 🔔 다른 기기가 내 목록을 고쳤어요 (drive.js changesAny · 요청 더 없음)
    window.mineHint = mineHint;
    window.mineDiff = mineDiff; window.mineUrl = mineUrl; window.mineSnap = mineSnap; window.mineGot = mineGot;
    window.mineSync = mineSync; window.mineSoon = mineSoon; window.mineKOf = mineKOf;
    window.mineInfo = () => ({ who: M.who, kinds: Object.keys(M.k).map(g => ({ g, n: Object.keys(M.k[g].items).length, img: Object.keys(M.k[g].img).length, gf: M.k[g].gf.length, cs: M.k[g].cs.length, fid: M.k[g].fid })), diff: Object.keys(KINDS).reduce((a, K) => a + Object.keys(mineDiff(K)).length, 0), owned: g => owned(g) });   // 🔎 시험 · 점검
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['mine'] = true;
