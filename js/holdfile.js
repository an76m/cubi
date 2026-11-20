/* 말랑달콤 다이어리 - js/holdfile.js
   🗄️ 서랍장 하나 = 파일 하나 (도련 11-20 · 저장 정리 2단계 · 03 저장지도 원칙 3 · 4)
   - 배치.json 에는 책상 위에 보이는 것만 : 서랍 칸에 든 ✏️ 문구 · 📔 📒 책은 빼서 → 설정 / <서랍장 u>.json 🔐 (1370 · 서랍 폴더 따로 없이)
       { v: 1, u, gd: { 문구 id: 칸 }, dy: { 책 id: { s: 칸, p, lb } } }
   - 화면 · 코드는 예전 그대로 : 'diary_gd_at' { 문구 id: 'u' 펜꽂이 | 'u:칸' 서랍 } · 'diary_desk_dy' { 책 id: { x, y, p, lb } 책상 | { in: 'u:칸', p, lb } 서랍 }
       → 올릴 때만 나눠요 (drive.js settingsBody → hfOut = 배치에서 서랍 것 빼기 · writeKeyFile 'desk' 다음 → hfFlush = 바뀐 서랍장 파일만)
   - 읽기 = 그 서랍장을 쓸 때 한 번 (hfReady) : 🗄️ 서랍 열기 (문구함 · 책 서랍) · 문구 집 정리(dkwSweep · 문구함 서랍장 하나) · 그 서랍장에 넣을 때 (올리기 전에 먼저 읽고 합쳐요 = 빈 내용으로 덮지 않아요)
       · 읽은 것은 이 창 기억 + ⚡ js/drcache.js (다시 켜도 안 바뀌었으면 드라이브 0번) · 앱을 켤 때는 안 읽어요 (배치만)
   - 🏠 로그인 없이 (게스트 = 이 기기) = 나누지 않아요 (그대로 한 곳)
   - 📏 시험 tests/t_holdfile.py */
(function () {
    const HF = { got: new Map(), id: new Map(), busy: new Map(), dir: null };   // got = 서랍장 u → 마지막으로 읽거나 올린 내용 (글자)
    const on = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
    const PATH = () => (typeof DESK_PATH !== 'undefined' ? DESK_PATH : dirPath(DIRS.settings));   // 설정 폴더 바로 아래 (도련 11-21 · 1370 : 서랍 폴더 따로 없이)
    const nameOf = u => String(u).replace(/[\\/:*?"<>|]/g, '_') + '.json';
    const jget = k => { try { const v = JSON.parse(store.getItem(k)); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } };
    const placeU = p => { const m = /^(.+):(\d+)$/.exec(String(p || '')); return m ? [m[1], +m[2]] : null; };   // 'u:칸' = 서랍 · 'u' = 펜꽂이
    /* 지금 메모리 → 서랍장마다 내용 */
    function split() {
        const per = new Map(), at = u => per.get(u) || (per.set(u, { gd: {}, dy: {}, bm: {} }), per.get(u));
        const G = jget('diary_gd_at'); Object.keys(G).forEach(id => { const p = placeU(G[id]); if (p) at(p[0]).gd[id] = p[1]; });
        const D = jget('diary_desk_dy'); Object.keys(D).forEach(id => { const o = D[id], p = o && typeof o === 'object' && placeU(o.in); if (!p) return; if (o.m) { at(p[0]).bm[id] = p[1]; return; } at(p[0]).dy[id] = Object.assign({ s: p[1] }, o.p ? { p: o.p } : {}, o.lb ? { lb: o.lb } : {}, o.a ? { a: o.a } : {}); });   // a = 📒 🤍 스티커첩 사본 (desk.js dkAlbCopies)
        return per;
    }
    const bodyOf = (u, c) => JSON.stringify(Object.assign({ v: 1, u, gd: (c && c.gd) || {}, dy: (c && c.dy) || {} }, c && c.bm && Object.keys(c.bm).length ? { bm: c.bm } : {}));   // bm = 🧩 표지 · 내지 { id: 칸 } (1355 · 있을 때만)
    const empty = c => !c || (!Object.keys(c.gd || {}).length && !Object.keys(c.dy || {}).length && !Object.keys(c.bm || {}).length);
    /* 배치.json 에 올릴 값 (서랍 것 빼기) */
    function hfOut(k, v) {
        if (!on() || (k !== 'diary_gd_at' && k !== 'diary_desk_dy')) return v;
        let o; try { o = JSON.parse(v); } catch (e) { return v; }
        if (!o || typeof o !== 'object' || Array.isArray(o)) return v;
        const r = {};
        Object.keys(o).forEach(id => { const x = o[id]; if (k === 'diary_gd_at' ? placeU(x) : (x && typeof x === 'object' && typeof x.in === 'string')) return; r[id] = x; });
        return JSON.stringify(r);
    }
    async function folder(create) { if (HF.dir) return HF.dir; const d = await getFolder(PATH(), create); if (d) HF.dir = d; return d; }
    /* 그 서랍장 파일 읽기 (한 번) → 메모리에 합쳐요 (이 창에서 이미 바꾼 것이 이겨요) */
    function hfReady(u) {
        if (!on() || !u || HF.got.has(u)) return Promise.resolve(true);
        if (HF.busy.has(u)) return HF.busy.get(u);
        const p = (async () => {
            const dir = await folder(false); let c = null;
            if (dir) { const f = await findFile(dir, nameOf(u)); if (f) { HF.id.set(u, f.id); try { c = await ownUnlock(await readFileText(f.id)); } catch (e) { console.warn('🗄️ 서랍장 파일을 못 열었어요 (덮어쓰지 않아요)', u, e); HF.busy.delete(u); throw e; } } }
            const G = jget('diary_gd_at'), D = jget('diary_desk_dy'); let gch = false, dch = false;
            if (c && c.gd) Object.keys(c.gd).forEach(id => { if (!(id in G)) { G[id] = u + ':' + c.gd[id]; gch = true; } });
            if (c && c.dy) Object.keys(c.dy).forEach(id => { if (!(id in D)) { const x = c.dy[id] || {}; D[id] = Object.assign({ in: u + ':' + x.s }, x.p ? { p: x.p } : {}, x.lb ? { lb: x.lb } : {}, x.a ? { a: x.a } : {}); dch = true; } });
            if (c && c.bm) Object.keys(c.bm).forEach(id => { if (!(id in D) && Number.isInteger(+c.bm[id])) { D[id] = { in: u + ':' + c.bm[id], m: 1 }; dch = true; } });   // 🧩 표지 · 내지
            if (gch) store.putLoaded('diary_gd_at', JSON.stringify(G));            // 올리지 않아요 (읽은 것 그대로)
            if (dch) store.putLoaded('diary_desk_dy', JSON.stringify(D));
            HF.got.set(u, c ? bodyOf(u, c) : bodyOf(u, null));
            HF.busy.delete(u);
            if (dch && window.DK && DK.albs && !DK.albReal) DK.albs = null;      // 📒 🤍 서랍 속 스티커첩 사본도 더해서 다시
            if (gch && window.dkwDeskSoon) dkwDeskSoon(); if (dch && window.dkDeskBooks) dkDeskBooks();
            return true;
        })();
        HF.busy.set(u, p); return p;
    }
    /* 올리기 (배치.json 다음) : 바뀐 서랍장 파일만 · 아직 안 읽은 서랍장에 새로 넣었으면 먼저 읽고 합쳐요 */
    async function hfFlush() {
        if (!on()) return;
        let per = split();
        const us = [...new Set([...per.keys(), ...HF.got.keys()])];
        for (const u of us) if (!HF.got.has(u)) await hfReady(u);
        per = split();
        for (const u of [...new Set([...per.keys(), ...HF.got.keys()])]) {
            const c = per.get(u), b = bodyOf(u, c);
            if (HF.got.get(u) === b) continue;
            if (empty(c) && !HF.id.has(u)) { HF.got.set(u, b); continue; }          // 비었고 파일도 없음 = 만들지 않아요
            const dir = await folder(true), sealed = await ownLock(JSON.parse(b), typeof COLL !== 'undefined' ? COLL.who : undefined);
            let saved;
            try { saved = await driveUpsert(dir, nameOf(u), HF.id.get(u) || null, sealed); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; HF.id.delete(u); const f = await findFile(dir, nameOf(u)); saved = await driveUpsert(dir, nameOf(u), f ? f.id : null, sealed); }
            HF.id.set(u, saved.id); HF.got.set(u, b);
        }
    }
    function hfForgetDir(par, f, fid) {                                       // 다른 기기가 바꾼 서랍장 파일 → 그 서랍장 것은 메모리에서 빼고 다시 읽어요
        if (!HF.dir || par !== HF.dir) return false;
        const u = [...HF.id.entries()].find(([, id]) => id === fid)?.[0] || (f && f.name ? String(f.name).replace(/\.json$/, '') : '');
        if (!u || !(HF.id.has(u) || (typeof DK !== 'undefined' && DK.items.some(x => x.u === u)))) return false;   // 설정 폴더의 다른 파일 (설정 · 배치 …) = 서랍장 파일이 아니에요
        {
            const G = jget('diary_gd_at'), D = jget('diary_desk_dy'); let gch = false, dch = false;
            Object.keys(G).forEach(id => { const p = placeU(G[id]); if (p && p[0] === u && !drive.dirtyKeys.has('diary_gd_at')) { delete G[id]; gch = true; } });
            Object.keys(D).forEach(id => { const p = D[id] && placeU(D[id].in); if (p && p[0] === u && !drive.dirtyKeys.has('diary_desk_dy')) { delete D[id]; dch = true; } });
            if (gch) store.putLoaded('diary_gd_at', JSON.stringify(G)); if (dch) store.putLoaded('diary_desk_dy', JSON.stringify(D));
            HF.got.delete(u); HF.id.delete(u);
        }
        return true;
    }
    const hfLoaded = u => !on() || HF.got.has(u);
    function hfReset() { HF.got.clear(); HF.id.clear(); HF.busy.clear(); HF.dir = null; }   // 계정이 바뀌거나 다시 들어올 때 (js/drive.js)
    window.hfOut = hfOut; window.hfFlush = hfFlush; window.hfReady = hfReady; window.hfLoaded = hfLoaded; window.hfReset = hfReset; window.hfForgetDir = hfForgetDir;
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['holdfile'] = true;
