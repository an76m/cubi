/* 말랑달콤 다이어리 - js/mine.js
   📦 내 실물 (도련 11-16) : 받은 상품은 다꾸러 드라이브에 진짜로 있어요 (서버 = 가게 · 서버에서 고치거나 지워도 가진 것은 받은 그때 모습)
   - 지금 = 🪑 책상소품 · ✏️ 문구 (KINDS 에 한 줄 더하면 다른 종류도 · 다음 = 📔 다이어리 · 내지)
   - 진짜 기준 = 물건 하나에 받은- 파일 하나 (예전 그대로 🔐 · 같은 u 는 하나) : 그 안에 실물도 { u, id, from, got 받은 시각, pr: { id, P, f, wh, h }, pi: { 그림 이름: 그림 } }
   - 빨리 읽기 = 종류마다 묶음 하나 : 소품 / _실물.json · 문구 / _실물.json 🔐 { v, k, items: { 상품 id: { P, f, wh, h, got } }, img: { 그림 이름: 그림 }, cs: [담은 받은- 파일 번호] }
       같은 디자인은 한 번만 (여러 개 가져도) · 보관함 것도 · 🎁 처음 선물(받은- 파일 없음)도 · 묶음이 깨지거나 없어져도 받은- 파일 · 서버로 다시 만들어요
   - 기기 보관 (IndexedDB 'malang-mine' · 계정|종류) : 처음 한 번 받아 두고 · 다음부터는 드라이브에 '바뀌었나'만 물어요 (요청 1번에 두 묶음 · 드라이브 modifiedTime)
   - 두 기기 : 쓰기 전에 드라이브 묶음이 바뀌었으면 먼저 읽어서 합쳐요 (상품 id 기준 · 빠지는 것 없이) · 하루 한 번 받은- 파일과 맞춰 봐요 (빠진 것만 읽어요)
   - 그리기 = js/prod.js prodList : 서버와 다른 것만 내 실물로 (mineDiff) · 같은 그림은 서버 주소 그대로 · 다르면 내 그림 (blob) · 바뀌면 prodRebuild (각 파일의 prodHook)
   - 게스트 = 이 기기에만 · 로그인 = 드라이브 + 이 기기 */
(function () {
    const KINDS = { 책상소품: 'desk', 문구: 'gd' };                              // 종류 → 폴더 (drive.js DIRS)
    const FILE = '_실물.json', DAY_MAX = 40;
    const M = { who: '', k: {}, url: {}, diff: {}, sig: '', last: 0, run: null, again: false, dirty: new Set(), t: 0 };
    const blank = () => ({ items: {}, img: {}, cs: [], fid: '', mt: '' });
    const obj = v => v && typeof v === 'object' && !Array.isArray(v);
    const norm = r => { const b = blank(); if (!obj(r)) return b; if (obj(r.items)) Object.keys(r.items).forEach(id => { const x = r.items[id]; if (obj(x) && obj(x.f)) b.items[id] = x; }); if (obj(r.img)) Object.keys(r.img).forEach(f => { if (typeof r.img[f] === 'string' && r.img[f].startsWith('data:')) b.img[f] = r.img[f]; }); if (Array.isArray(r.cs)) b.cs = [...new Set(r.cs.map(String))]; if (typeof r.fid === 'string') b.fid = r.fid; if (typeof r.mt === 'string') b.mt = r.mt; return b; };
    const kind = K => M.k[K] || (M.k[K] = blank());
    const okF = f => window.PROD_OKF ? PROD_OKF(f) : false;
    const online = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
    const whoNow = () => online() ? (typeof COLL !== 'undefined' && COLL.who && COLL.who !== 'guest' ? COLL.who : '') : (typeof drive !== 'undefined' && drive.guest ? 'guest' : '');

    /* 🗄 기기 보관 */
    let dbP = null;
    const db = () => dbP || (dbP = new Promise(res => { try { const r = indexedDB.open('malang-mine', 1); r.onupgradeneeded = () => r.result.createObjectStore('b'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }));
    async function idb(key, v) {
        const d = await db(); if (!d) return null;
        return new Promise(res => { try { const tx = d.transaction('b', v === undefined ? 'readonly' : 'readwrite'), st = tx.objectStore('b'), q = v === undefined ? st.get(key) : st.put(v, key); q.onsuccess = () => res(v === undefined ? q.result || null : true); q.onerror = () => res(null); } catch (e) { res(null); } });
    }
    const devSave = K => idb(M.who + '|' + K, Object.assign({}, kind(K)));
    async function devLoad(who) {
        if (M.who === who) return;
        M.who = who; M.k = {}; M.diff = {}; M.dirty.clear(); M.last = 0;
        for (const K of Object.keys(KINDS)) M.k[K] = norm(await idb(who + '|' + K));
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
        const B = M.k[K], D = {};
        if (B) Object.keys(B.items).forEach(id => { const s = window.prodRawOf ? prodRawOf(K, id) : null, x = B.items[id]; if (!s || LOOK(s) !== LOOK(x)) D[id] = Object.assign({ id }, x); });
        return (M.diff[K] = D);
    }
    function apply() {                                                         // 다른 것이 바뀌었을 때만 다시 그려요
        M.diff = {};
        const sig = stable(Object.keys(KINDS).map(K => Object.keys(mineDiff(K)).sort().map(id => id + '|' + LOOK(mineDiff(K)[id]))));
        if (sig === M.sig) return;
        const first = !M.sig && sig === stable(Object.keys(KINDS).map(() => []));
        M.sig = sig; if (!first && window.prodRebuild) prodRebuild();
    }

    /* 📥 받을 때 : 서버 상품 → 내 실물 (그림까지) · 받은- 파일에 넣을 것 { pr, pi } (못 받으면 null = 다음에 다시) */
    async function mineSnap(K, id) {
        if (!KINDS[K] || typeof id !== 'string') return null;
        if (!M.who) { const w = whoNow(); if (w) await devLoad(w); }
        const B = kind(K);
        let it = B.items[id];
        if (!it) { const raw = window.prodRawOf ? prodRawOf(K, id) : null; if (!raw || !obj(raw.f)) return null; it = JSON.parse(JSON.stringify({ P: raw.P || {}, f: raw.f, wh: raw.wh || {}, h: raw.h || '' })); it.got = Date.now(); }
        const pi = {};
        for (const f of Object.values(it.f)) { if (!okF(f)) continue; if (!B.img[f]) { const d = await fetchData(f); if (!d) return null; B.img[f] = d; } pi[f] = B.img[f]; }
        if (!B.items[id]) { B.items[id] = it; M.dirty.add(K); }
        return { pr: Object.assign({ id }, it), pi };
    }
    function mineGot(K, c) { if (!KINDS[K] || !c) return; const B = kind(K); c = String(c); if (!B.cs.includes(c)) { B.cs.push(c); M.dirty.add(K); } mineSoon(true); }
    const owned = K => K === '책상소품' ? (window.deskOwnIds ? deskOwnIds() : []) : K === '문구' ? ((window.gdOwnList && gdOwnList()) || []).map(o => o.id) : [];
    async function fill() { for (const K of Object.keys(KINDS)) for (const id of new Set(owned(K))) if (typeof id === 'string' && !kind(K).items[id]) await mineSnap(K, id); }   // 🎁 선물 · 아직 실물이 없는 것

    /* ☁ 드라이브 */
    function merge(B, j) {                                                     // 드라이브 묶음을 기기 것에 · 기기에만 있는 것이 있으면 true (올려야 해요)
        const R = norm(j); let extra = false;
        Object.keys(R.items).forEach(id => { const a = B.items[id], b = R.items[id]; if (!a || (+b.got || 0) < (+a.got || Infinity)) B.items[id] = b; });   // 같은 id = 먼저 받은 모습
        Object.keys(B.items).forEach(id => { if (!R.items[id]) extra = true; });
        Object.keys(R.img).forEach(f => { if (!B.img[f]) B.img[f] = R.img[f]; });
        Object.values(B.items).forEach(x => Object.values(x.f).forEach(f => { if (okF(f) && B.img[f] && !R.img[f]) extra = true; }));
        R.cs.forEach(c => { if (!B.cs.includes(c)) B.cs.push(c); });
        if (B.cs.some(c => !R.cs.includes(c))) extra = true;
        return extra;
    }
    const dirOf = (K, create) => getFolder(dirPath(DIRS[KINDS[K]]), create);
    async function write(K) {
        const B = kind(K), used = {};
        Object.values(B.items).forEach(x => Object.values(x.f).forEach(f => { if (B.img[f]) used[f] = B.img[f]; }));
        B.img = used;
        const body = JSON.stringify({ v: 1, k: K, items: B.items, img: used, cs: B.cs });
        let r;
        try { r = await driveUpsert(await dirOf(K, true), FILE, B.fid || null, body); }
        catch (e) { if (!B.fid) throw e; B.fid = ''; r = await driveUpsert(await dirOf(K, true), FILE, null, body); }   // 그 사이 지워진 파일 → 새로
        B.fid = String(r.id || ''); B.mt = String(r.modifiedTime || ''); M.dirty.delete(K);
        await devSave(K);
    }
    async function daily() {                                                   // 하루 한 번 : 받은- 파일 중 묶음에 아직 안 담긴 것만 읽어요
        const key = 'malang_mine_day|' + M.who, today = new Date().toISOString().slice(0, 10);
        let last = ''; try { last = localStorage.getItem(key) || ''; } catch (e) { }
        if (last === today) return;
        for (const K of Object.keys(KINDS)) {
            const dir = await dirOf(K, false); if (!dir) continue;
            const B = kind(K), fs = await driveList(`'${dir}' in parents and trashed=false and name contains '받은-'`, 'id,name');
            const C = new Map(fs.map(f => [(/^받은-(\d+)\.json$/.exec(f.name) || [])[1], f]).filter(([c]) => c));
            const keep = B.cs.filter(c => C.has(c)); if (keep.length !== B.cs.length) { B.cs = keep; M.dirty.add(K); }   // 버린 물건 번호는 빼요 (디자인은 그대로)
            let n = 0;
            for (const [c, f] of C) {
                if (B.cs.includes(c)) continue;
                if (n++ >= DAY_MAX) break;                                     // 많으면 다음 날 이어서
                try {
                    const w = JSON.parse(await readFileText(f.id)), it = w && w.item && typeof w.item.s === 'string' ? await ownUnlock(w.item.s) : null;
                    if (it && obj(it.pr) && typeof it.id === 'string' && obj(it.pr.f)) { const x = Object.assign({}, it.pr); delete x.id; x.got = +x.got || +it.got || Date.now(); const y = B.items[it.id]; if (!y || x.got < (+y.got || Infinity)) B.items[it.id] = x; }   // 같은 id = 먼저 받은 모습
                    if (it && obj(it.pi)) Object.keys(it.pi).forEach(g => { if (!B.img[g] && typeof it.pi[g] === 'string') B.img[g] = it.pi[g]; });
                } catch (e) { }                                                // 🔐 남의 것 · 깨진 것은 넘어가요 (번호만 담아요)
                B.cs.push(c); M.dirty.add(K);
            }
        }
        try { localStorage.setItem(key, today); } catch (e) { }
    }
    async function sync0(force) {
        const who = whoNow(); if (!who) return;
        await devLoad(who);
        await fill();                                                          // 새로 생긴 것 (🎁 선물 · 보관함) = 늘 (기기 안 일 · 그림만 받아요)
        if (!force && !M.dirty.size && Date.now() - M.last < 30000) return;   // 드라이브에 묻기는 30초에 한 번 (받거나 새로 생기면 바로)
        M.last = Date.now();
        if (who !== 'guest' && online() && typeof driveList === 'function') {
            const dirs = {}; for (const K of Object.keys(KINDS)) dirs[K] = await dirOf(K, false);
            const fs = Object.values(dirs).some(Boolean) ? await driveList(`name='${FILE}' and trashed=false`, 'id,parents,modifiedTime') : [];   // 🔎 두 묶음이 바뀌었나 = 요청 1번
            for (const K of Object.keys(KINDS)) {
                const B = kind(K), f = fs.filter(x => dirs[K] && (x.parents || []).includes(dirs[K])).sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime)))[0];
                if (f && (f.id !== B.fid || f.modifiedTime !== B.mt)) {
                    let j = null; try { j = JSON.parse(await readFileText(f.id)); } catch (e) { console.warn('📦 실물 묶음', K, e); }
                    if (j && obj(j.items)) { if (merge(B, j)) M.dirty.add(K); B.fid = f.id; B.mt = String(f.modifiedTime || ''); await devSave(K); }
                    else if (!j) { B.fid = ''; M.dirty.add(K); }                // 못 여는 묶음 = 새로 만들어요 (받은- 파일이 진짜)
                } else if (!f && (B.fid || Object.keys(B.items).length)) { B.fid = ''; M.dirty.add(K); }   // 없어졌어요 → 기기 것으로 다시
            }
            await daily();
            for (const K of [...M.dirty]) { try { await write(K); } catch (e) { console.warn('📦 실물 묶음 올리기', K, e); } }
        } else for (const K of [...M.dirty]) { await devSave(K); M.dirty.delete(K); }
        apply();
    }
    function mineSync(force) {
        if (M.run) { if (force) M.again = true; return M.run; }
        M.run = sync0(force).catch(e => console.warn('📦 실물', e)).finally(() => { M.run = null; if (M.again) { M.again = false; mineSync(true); } });
        return M.run;
    }
    function mineSoon(force) { clearTimeout(M.t); M.t = setTimeout(() => mineSync(!!force), force ? 1500 : 400); }
    window.mineDiff = mineDiff; window.mineUrl = mineUrl; window.mineSnap = mineSnap; window.mineGot = mineGot;
    window.mineSync = mineSync; window.mineSoon = mineSoon;
    window.mineInfo = () => ({ who: M.who, kinds: Object.keys(M.k).map(K => ({ K, n: Object.keys(M.k[K].items).length, img: Object.keys(M.k[K].img).length, cs: M.k[K].cs.length, fid: M.k[K].fid })), diff: Object.keys(KINDS).map(K => Object.keys(mineDiff(K)).length) });   // 🔎 시험 · 점검
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['mine'] = true;
