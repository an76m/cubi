/* 말랑달콤 다이어리 - js/dyown.js
   📚 가진 다이어리 · 🧩 바인더 재료 (도련 11-07 · 981 "통일")
   - 📚 다이어리 / _목록.json 'diary_own' = 쓸 수 있는 권 하나에 한 줄 (날짜형 · 페이지형 모두) · 줄마다 from (gift 첫 선물 · basic 샵 · mine 내가 만들거나 조립)
       · 📅 날짜형 { id: '2026b-분홍-1', t: 'date', from, at, f } · 날짜형바인더는 + cv (끼운 표지) · rf [끼운 날짜 내지]
       · 📓 노트 { id: 'my…', t: 'note', from, … 설계도 } (js/dymaker.js dmkClean)
       · 🗂️ 페이지바인더 { id: 'my…', t: 'binder', from, cv · cvf (표지 · 표지 from) · rf [끼운 내지 · 내지마다 from] … }
   - 📓 노트(날짜형 · 페이지형) = 완제품 → 받거나 만들면 바로 이 목록에
   - 🗂️ 바인더(날짜형 · 페이지형) = 조립품 → 받거나 만든 표지 · 내지는 재료 목록에 있다가 🧩 조립하면 이 목록에 한 줄 · 쓴 재료는 재료 목록에서 빠져요 (현실처럼)
       · 🧩 재료 = 다이어리 / _바인더재료목록.json 'diary_cover_own' (cover 페이지 표지 · dcover 해가 적힌 날짜 표지) · 같은 파일 'diary_refill_own' (refill 페이지 내지 · drefill 날짜 내지)
       · 날짜 내지는 해가 없어요 = 끼운 표지의 해를 따라가요 · 해가 지난 표지는 조립 못 해요 · 날짜형바인더는 조립한 뒤 내지를 빼지 않아요
       · 페이지바인더는 내지를 빼면 재료로 돌아와요 (꾸민 페이지가 있는 내지는 못 빼요) · 표지를 바꾸면 예전 표지도 돌아와요
       · 💤 재료 목록은 앱을 켤 때 안 읽어요 (🧩 조립 · 만들기 · 샵에서 받을 때 dymReady) · 바뀔 때 처음 생겨요
   - 🎁 첫 선물 바인더는 조립된 채로 이 목록에 (재료 목록에는 없어요)
   ※ js/bin.js 다음 · js/dyyear.js · js/dymaker.js 앞에 읽어요 */

        const DYO_KEY = 'diary_own', DYO_LOCAL = 'malang_diary_own';
        const DYO_T = ['date', 'note', 'binder'];
        const dyoOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        const dyoHas = () => prefGet(DYO_KEY, DYO_LOCAL) !== null;              // 목록을 알아요 (읽었거나 · 되살렸거나 · 처음 선물)
        function dyoAll() { const v = prefGet(DYO_KEY, DYO_LOCAL); return Array.isArray(v) ? v.filter(x => x && typeof x === 'object' && typeof x.id === 'string' && x.id && DYO_T.includes(x.t)) : []; }
        function dyoSet(L, mem) { const v = (L || []).filter(Boolean); if (mem && dyoOnline()) store.putLoaded(DYO_KEY, JSON.stringify(v)); else prefSet(DYO_KEY, DYO_LOCAL, v); }   // mem = 메모리에만
        const dyoGet = id => dyoAll().find(x => x.id === id) || null;
        function dyoPut(line, mem) { const L = dyoAll(), i = L.findIndex(x => x.id === line.id); if (i >= 0) L[i] = line; else L.push(line); dyoSet(L, mem); }
        function dyoDel(id) { const L = dyoAll(); if (L.some(x => x.id === id)) dyoSet(L.filter(x => x.id !== id)); }
        const dyoDay = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
        const DYO_FROM = ['gift', 'basic', 'shop', 'mine', 'event'];
        const dyoFrom = (v, def) => DYO_FROM.includes(v) ? v : def;

        /* 🧩 바인더 재료 */
        const DYM = { cover: { key: 'diary_cover_own', l: 'malang_cover_own', w: 'bmown' }, refill: { key: 'diary_refill_own', l: 'malang_refill_own', w: 'bmown' } };   // 🧩 다이어리 / _바인더재료목록.json 한 파일에 두 칸 (도련 11-08)
        const dymKind = t => t === 'cover' || t === 'dcover' ? 'cover' : t === 'refill' || t === 'drefill' ? 'refill' : '';
        const dymIs = t => !!dymKind(t);
        function dymAll(k) { const v = prefGet(DYM[k].key, DYM[k].l); return Array.isArray(v) ? v.filter(x => x && typeof x === 'object' && typeof x.id === 'string' && dymKind(x.t) === k) : []; }
        const dymGet = id => dymAll('cover').concat(dymAll('refill')).find(x => x.id === id) || null;
        function dymSet(k, L) { prefSet(DYM[k].key, DYM[k].l, (L || []).filter(Boolean)); }
        function dymPut(it) { const k = dymKind(it && it.t); if (!k) return; const L = dymAll(k), i = L.findIndex(x => x.id === it.id); if (i >= 0) L[i] = it; else L.push(it); dymSet(k, L); }
        function dymDel(id) { ['cover', 'refill'].forEach(k => { const L = dymAll(k); if (L.some(x => x.id === id)) dymSet(k, L.filter(x => x.id !== id)); }); }
        /* 💤 재료 목록 준비 : 쓰기 전에 꼭 (읽은 적 없으면 한 번 읽고 · 없어졌으면 그 폴더 백업에서) · 🆕 처음 온 다꾸러 = 찾지 않아요 */
        let dymP = null, dymGen = -1;
        function dymReady() {
            if (!dyoOnline()) return Promise.resolve(true);
            if (dymP && dymGen === drive.gen) return dymP;
            const gen = dymGen = drive.gen;
            dymP = (async () => {
                for (const k of ['cover', 'refill']) {
                    const w = DYM[k].w;
                    if (drive.newbie && !drive.lazyOn.has(w)) { drive.lazyOn.add(w); (drive.keyNone = drive.keyNone || new Set()).add(w); }
                    await keyFileLoad(w);
                    if (gen !== drive.gen) return false;
                    if (prefGet(DYM[k].key, DYM[k].l) === null && keyMade(w) && window.deskBackupRead) {   // 🛟 만든 적 있는데 없어요 = 그 폴더 / _목록_백업.json
                        const bk = await deskBackupRead().catch(() => null), L = bk && Array.isArray(bk[DYM[k].key]) ? bk[DYM[k].key] : null;
                        if (gen !== drive.gen) return false;
                        if (L && prefGet(DYM[k].key, DYM[k].l) === null) { dymSet(k, L); if (window.diag) diag('rescue', { w: k, n: L.length }); }
                    }
                }
                return true;
            })();
            dymP.catch(e => { console.warn('🧩 재료 목록', e); if (dymGen === gen) dymP = null; });
            return dymP;
        }
        const dymNewId = () => 'my' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

        window.dyoAll = dyoAll; window.dyoGet = dyoGet; window.dyoPut = dyoPut; window.dyoDel = dyoDel; window.dyoHas = dyoHas; window.dyoSet = dyoSet;
        window.dymAll = dymAll; window.dymGet = dymGet; window.dymPut = dymPut; window.dymDel = dymDel; window.dymReady = dymReady; window.dymIs = dymIs;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dyown'] = true;
