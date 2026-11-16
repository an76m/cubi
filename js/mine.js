/* 말랑달콤 다이어리 - js/mine.js
   📦 내 실물 (도련 11-16) : 받은 상품은 다꾸러 드라이브에 진짜로 있어요 (서버 = 가게 · 서버에서 고치거나 지워도 가진 것은 받은 그때 모습)
   - 묶음 셋 (G · 한 줄 더하면 다른 종류도) : 🪑 소품 / _실물.json (책상소품) · ✏️ 문구 / _실물.json (문구) · 📔 다이어리 / _실물.json (날짜형 · 페이지형 바인더 · 노트 · 내지 · 1265)
       🔐 { v, k, items: { '종류|상품 id': { K, P, f, wh, h, got } }, img: { 그림 이름: 그림 }, cs: [담은 받은- 파일 번호] } · 같은 디자인은 한 번만 (여러 개 가져도) · 보관함 · 재료 · 🎁 처음 선물도
   - 🪑 ✏️ 진짜 기준 = 물건 하나에 받은- 파일 하나 (예전 그대로 🔐 · 같은 u 는 하나) : 그 안에 실물도 { u, id, from, got 받은 시각, pr: { id, K, P, f, wh, h }, pi: { 그림 이름: 그림 } }
       묶음이 깨지거나 없어져도 받은- 파일 · 서버로 다시 만들어요
   - 📔 다이어리는 받은- 파일이 없어요 (목록 한 줄이 원본 · js/dyown.js) → 묶음 + _실물_백업.json (하루 한 번 + 새 디자인을 받으면 바로 · 묶음이 없어지면 백업에서)
       가진 것 = 다이어리 목록 · 바인더 재료 목록의 pid (상품 id) · 날짜 표지 d + 날짜형 권 id 안의 디자인 (dyyOf)
   - 기기 보관 (IndexedDB 'malang-mine' · 계정|종류) : 처음 한 번 받아 두고 · 다음부터는 드라이브에 '바뀌었나'만 물어요 (요청 1번에 두 묶음 · 드라이브 modifiedTime)
   - 두 기기 : 쓰기 전에 드라이브 묶음이 바뀌었으면 먼저 읽어서 합쳐요 (상품 id 기준 · 빠지는 것 없이) · 하루 한 번 받은- 파일과 맞춰 봐요 (빠진 것만 읽어요)
   - 그리기 = js/prod.js prodList : 서버와 다른 것만 내 실물로 (mineDiff) · 같은 그림은 서버 주소 그대로 · 다르면 내 그림 (blob) · 바뀌면 prodRebuild (각 파일의 prodHook)
   - 게스트 = 이 기기에만 · 로그인 = 드라이브 + 이 기기 */
(function () {
    const G = {                                                                // 묶음 → 폴더 (drive.js DIRS) · 상품 종류 · rcv = 받은- 파일이 있어요
        소품: { dir: 'desk', K: ['책상소품'], rcv: 1 },
        문구: { dir: 'gd', K: ['문구'], rcv: 1 },
        다이어리: { dir: 'diary', K: ['날짜형바인더', '날짜형노트', '페이지바인더', '페이지노트', '날짜형내지', '페이지내지'] }
    };
    const KINDS = {}; Object.keys(G).forEach(g => G[g].K.forEach(K => { KINDS[K] = g; }));   // 상품 종류 → 묶음
    const FILE = '_실물.json', BK = '_실물_백업.json', DAY_MAX = 40;
    const key = (K, id) => K + '|' + id;
    const M = { who: '', k: {}, url: {}, diff: {}, sig: '', last: 0, run: null, again: false, dirty: new Set(), t: 0 };
    const blank = () => ({ items: {}, img: {}, cs: [], fid: '', mt: '', bkid: '' });
    const obj = v => v && typeof v === 'object' && !Array.isArray(v);
    const norm = r => { const b = blank(); if (!obj(r)) return b; if (obj(r.items)) Object.keys(r.items).forEach(k => { const x = r.items[k]; if (obj(x) && obj(x.f) && typeof x.K === 'string' && k === key(x.K, k.slice(x.K.length + 1))) b.items[k] = x; }); if (obj(r.img)) Object.keys(r.img).forEach(f => { if (typeof r.img[f] === 'string' && r.img[f].startsWith('data:')) b.img[f] = r.img[f]; }); if (Array.isArray(r.cs)) b.cs = [...new Set(r.cs.map(String))]; if (typeof r.fid === 'string') b.fid = r.fid; if (typeof r.mt === 'string') b.mt = r.mt; if (typeof r.bkid === 'string') b.bkid = r.bkid; if (isFinite(+r.bkn)) b.bkn = +r.bkn; return b; };
    const grp = g => M.k[g] || (M.k[g] = blank());
    const kind = K => grp(KINDS[K]);
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
    const devSave = g => idb(M.who + '|' + g, Object.assign({}, grp(g)));
    async function devLoad(who) {
        if (M.who === who) return;
        M.who = who; M.k = {}; M.diff = {}; M.dirty.clear(); M.last = 0;
        for (const g of Object.keys(G)) M.k[g] = norm(await idb(who + '|' + g));
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
        if (B) Object.keys(B.items).forEach(k => { const x = B.items[k]; if (x.K !== K) return; const id = k.slice(K.length + 1), s = window.prodRawOf ? prodRawOf(K, id) : null; if (!s || LOOK(s) !== LOOK(x)) D[id] = Object.assign({ id }, x); });
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
    function mineGot(K, c) { if (!KINDS[K] || !c) return; const B = kind(K); c = String(c); if (!B.cs.includes(c)) { B.cs.push(c); M.dirty.add(KINDS[K]); } mineSoon(true); }
    function diaryIds() {                                                      // 📔 가진 다이어리 · 재료의 상품 id (목록 · 재료 목록 · 날짜형 권 id)
        const out = [], walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (obj(v)) Object.keys(v).forEach(k => { const x = v[k]; if ((k === 'pid' || (k === 'd' && v.t === 'dcover')) && typeof x === 'string') out.push(x); else if (x && typeof x === 'object') walk(x); }); };
        const L = typeof dyoAll === 'function' ? dyoAll() : [];
        walk(L);
        L.forEach(x => { const b = x.t === 'date' && typeof dyyOf === 'function' ? dyyOf(x.id) : null; if (b) out.push(b.c); });
        if (typeof prefGet === 'function') ['diary_cover_own', 'diary_refill_own'].forEach(k => { try { walk(prefGet(k, '')); } catch (e) { } });   // 💤 재료 목록은 읽은 뒤에만
        return out;
    }
    const owned = g => {                                                       // → [[종류, 상품 id]]
        if (g === '소품') return (window.deskOwnIds ? deskOwnIds() : []).map(id => ['책상소품', id]);
        if (g === '문구') return ((window.gdOwnList && gdOwnList()) || []).map(o => ['문구', o.id]);
        if (g === '다이어리') { const out = []; new Set(diaryIds()).forEach(id => G[g].K.forEach(K => { if (window.prodRawOf && prodRawOf(K, id)) out.push([K, id]); })); return out; }   // 같은 id 가 두 종류에 있으면 둘 다
        return [];
    };
    async function fill() { for (const g of Object.keys(G)) for (const [K, id] of owned(g)) if (typeof id === 'string' && !grp(g).items[key(K, id)]) await mineSnap(K, id); }   // 🎁 선물 · 아직 실물이 없는 것

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
    const dirOf = (g, create) => getFolder(dirPath(DIRS[G[g].dir]), create);
    async function write(K) {
        const B = grp(K), used = {};
        Object.values(B.items).forEach(x => Object.values(x.f).forEach(f => { if (B.img[f]) used[f] = B.img[f]; }));
        B.img = used;
        const body = JSON.stringify({ v: 1, k: K, items: B.items, img: used, cs: B.cs });
        let r;
        try { r = await driveUpsert(await dirOf(K, true), FILE, B.fid || null, body); }
        catch (e) { if (!B.fid) throw e; B.fid = ''; r = await driveUpsert(await dirOf(K, true), FILE, null, body); }   // 그 사이 지워진 파일 → 새로
        B.fid = String(r.id || ''); B.mt = String(r.modifiedTime || ''); M.dirty.delete(K);
        await devSave(K);
        if (!G[K].rcv) {                                                       // 📔 받은- 파일이 없는 묶음 = 하루 한 번 백업
            const bk = 'malang_mine_bk|' + M.who + '|' + K, today = new Date().toISOString().slice(0, 10);
            let last = ''; try { last = localStorage.getItem(bk) || ''; } catch (e) { }
            const n = Object.keys(B.items).length;
            if (last !== today || n !== +B.bkn) { try { await driveUpsert(await dirOf(K, true), BK, B.bkid || null, body).then(x => { B.bkid = String(x.id || ''); }); B.bkn = n; localStorage.setItem(bk, today); await devSave(K); } catch (e) { B.bkid = ''; console.warn('📦 실물 백업', K, e); } }   // 새로 받은 디자인이 있으면 바로도
        }
    }
    async function daily() {                                                   // 하루 한 번 : 받은- 파일 중 묶음에 아직 안 담긴 것만 읽어요
        const dk = 'malang_mine_day|' + M.who, today = new Date().toISOString().slice(0, 10);
        let last = ''; try { last = localStorage.getItem(dk) || ''; } catch (e) { }
        if (last === today) return;
        for (const K of Object.keys(G)) {
            if (!G[K].rcv) continue;
            const dir = await dirOf(K, false); if (!dir) continue;
            const B = grp(K), fs = await driveList(`'${dir}' in parents and trashed=false and name contains '받은-'`, 'id,name');
            const C = new Map(fs.map(f => [(/^받은-(\d+)\.json$/.exec(f.name) || [])[1], f]).filter(([c]) => c));
            const keep = B.cs.filter(c => C.has(c)); if (keep.length !== B.cs.length) { B.cs = keep; M.dirty.add(K); }   // 버린 물건 번호는 빼요 (디자인은 그대로)
            let n = 0;
            for (const [c, f] of C) {
                if (B.cs.includes(c)) continue;
                if (n++ >= DAY_MAX) break;                                     // 많으면 다음 날 이어서
                try {
                    const w = JSON.parse(await readFileText(f.id)), it = w && w.item && typeof w.item.s === 'string' ? await ownUnlock(w.item.s) : null;
                    if (it && obj(it.pr) && typeof it.id === 'string' && obj(it.pr.f)) { const x = Object.assign({}, it.pr); delete x.id; x.K = G[K].K.includes(x.K) ? x.K : G[K].K[0]; x.got = +x.got || +it.got || Date.now(); const k = key(x.K, it.id), y = B.items[k]; if (!y || x.got < (+y.got || Infinity)) B.items[k] = x; }   // 같은 id = 먼저 받은 모습
                    if (it && obj(it.pi)) Object.keys(it.pi).forEach(g => { if (!B.img[g] && typeof it.pi[g] === 'string') B.img[g] = it.pi[g]; });
                } catch (e) { }                                                // 🔐 남의 것 · 깨진 것은 넘어가요 (번호만 담아요)
                B.cs.push(c); M.dirty.add(K);
            }
        }
        try { localStorage.setItem(dk, today); } catch (e) { }
    }
    async function sync0(force) {
        const who = whoNow(); if (!who) return;
        await devLoad(who);
        await fill();                                                          // 새로 생긴 것 (🎁 선물 · 보관함) = 늘 (기기 안 일 · 그림만 받아요)
        if (!force && !M.dirty.size && Date.now() - M.last < 30000) return;   // 드라이브에 묻기는 30초에 한 번 (받거나 새로 생기면 바로)
        M.last = Date.now();
        if (who !== 'guest' && online() && typeof driveList === 'function') {
            const dirs = {}; for (const K of Object.keys(G)) dirs[K] = await dirOf(K, false);
            const fs = Object.values(dirs).some(Boolean) ? await driveList(`(name='${FILE}' or name='${BK}') and trashed=false`, 'id,name,parents,modifiedTime') : [];   // 🔎 세 묶음이 바뀌었나 = 요청 1번
            const read = async id => { try { const j = JSON.parse(await readFileText(id)); return j && obj(j.items) ? j : null; } catch (e) { console.warn('📦 실물 묶음', e); return null; } };
            for (const K of Object.keys(G)) {
                const mine = n => fs.filter(x => x.name === n && dirs[K] && (x.parents || []).includes(dirs[K])).sort((a, b) => String(b.modifiedTime).localeCompare(String(a.modifiedTime)))[0];
                const B = grp(K), f = mine(FILE), bf = mine(BK);
                if (bf) B.bkid = bf.id;
                if (f && (f.id !== B.fid || f.modifiedTime !== B.mt)) {
                    const j = await read(f.id);
                    if (j) { if (merge(B, j)) M.dirty.add(K); B.fid = f.id; B.mt = String(f.modifiedTime || ''); await devSave(K); }
                    else { B.fid = f.id; M.dirty.add(K); }                      // 못 여는 묶음 = 기기 것 · 백업 · 받은- 파일로 다시 써요
                    if (!j && bf) { const b = await read(bf.id); if (b) merge(B, b); }
                } else if (!f) {                                               // 없어졌어요 → 백업 · 기기 것으로 다시
                    if (bf) { const b = await read(bf.id); if (b) merge(B, b); }   // 같은 id = 먼저 받은 모습 (방금 서버에서 채운 것보다 백업이 먼저)
                    if (B.fid || Object.keys(B.items).length) { B.fid = ''; M.dirty.add(K); }
                }
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
    function mineSoon(force) { M.f = M.f || !!force; clearTimeout(M.t); M.t = setTimeout(() => { const f = M.f; M.f = false; mineSync(f); }, M.f ? 1500 : 400); }   // 받은 것(force)은 이어지는 부름에도 그대로
    window.mineDiff = mineDiff; window.mineUrl = mineUrl; window.mineSnap = mineSnap; window.mineGot = mineGot;
    window.mineSync = mineSync; window.mineSoon = mineSoon;
    window.mineInfo = () => ({ who: M.who, kinds: Object.keys(M.k).map(g => ({ g, n: Object.keys(M.k[g].items).length, img: Object.keys(M.k[g].img).length, cs: M.k[g].cs.length, fid: M.k[g].fid })), diff: Object.keys(KINDS).reduce((a, K) => a + Object.keys(mineDiff(K)).length, 0), owned: g => owned(g) });   // 🔎 시험 · 점검
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['mine'] = true;
