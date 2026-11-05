/* 말랑달콤 다이어리 - js/bgown.js
   🌈 배경지 = 상품 (도련 10-28 · 다이어리처럼) : 🏪 기본상품 샵 → 🌈 배경지 (🎨 단색 · ☁️ 패턴) 에서 받아야 내 것 · 같은 것도 또 받아요 · 🗑 버리면 휴지통 30일
   - 🌈 배경지 창의 '기본' 칸 = 내 배경지 보관함 (받은 것만) · 처음 온 다꾸러는 🎨 분홍 단색 하나만 들고 시작해요
   - 내 배경지 'diary_bg_own' [{ u: 하나하나 id, p: 배경지 id (js/patterns.js BG_PATTERNS = 서버 상품), c: 파일 id }] (설정.json · 게스트는 이 기기)
       · 🗂 하나에 파일 하나 (도련 11-05) : 말랑달콤 / 배경지 / 받은-<c>.json 🔐 (js/coll.js ofAdd · 내가 만든 배경지 = 내-) · 🎁 처음 선물(g: 1)은 기본세트 / 선물.json (첫 접속 요청 줄이기)
       · 설정.json 에 목록이 없어지면 = 배경지 폴더 파일로 되살려요 · 🗑 버리면 휴지통 30일 → 파일 삭제
   - 쓰던 배경지를 버려서 같은 배경지가 하나도 안 남으면 배경을 빼요
   ※ js/skins.js · js/bin.js 다음에 읽어요 (patItems · patCatsPaint · renderPatternList 가 여기 함수를 불러요 · js/basket.js 샵) */

        const BGO_KEY = 'diary_bg_own', BGO_LOCAL = 'malang_bg_own', BGO_FIRST = 'c-pink';
        const bgoPat = id => BG_PATTERNS.find(p => p.id === id) || null;   // 🧁 숨긴 배경지(off)도 가진 사람은 그대로
        const bgoU = () => 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        function bgoOwned() { const v = prefGet(BGO_KEY, BGO_LOCAL); return Array.isArray(v) ? v.filter(x => x && x.u && typeof x.p === 'string') : []; }   // 목록에 없는 것도 남겨요 (지우지 않게 · 보일 땐 bgoItems 가 걸러요)
        (window.SNAP_OWN = window.SNAP_OWN || {})['배경지'] = (() => bgoOwned().map(x => x.p).concat(typeof bgPattern !== 'undefined' && bgPattern && !/^(my|cm):/.test(bgPattern.id) ? [bgPattern.id] : []));   // 📦 사본 (js/snap.js)
        /* 🎁 처음 온 다꾸러 = 분홍 단색 하나 (한 번만 · 다 버려도 다시 주지 않아요) */
        /* 🗂 배경지 폴더 파일 (도련 11-05) */
        const bgoOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        async function bgoFile(it, from) {
            if (it.c) return;
            const c = await ofAdd(DIRS.pattern, { u: it.u, id: it.p, from }); if (!c) return;
            it.c = c;
            const L = bgoOwned(), t = L.find(x => x.u === it.u); if (t && !t.c) { t.c = c; prefSet(BGO_KEY, BGO_LOCAL, L); }
        }
        let bgoBusy = false;
        const bgoGiftTell = () => { if (window.deskGiftWrite) deskGiftWrite(); };   // 🎁 선물.json 다시 쓰기 (js/desk.js)
        window.bgoGiftOwn = () => bgoOwned().filter(x => x.g).map(x => ({ u: x.u, p: x.p }));
        function bgoGift() { prefSet(BGO_KEY, BGO_LOCAL, [{ u: bgoU(), p: BGO_FIRST, g: 1 }]); bgoGiftTell(); }
        async function bgoRescue() {                                           // 🛟 로그인했는데 목록이 없으면 = 배경지 폴더 + 선물.json (있으면 되살리기 · 처음 온 다꾸러만 선물)
            const F = await ofScan(DIRS.pattern);                                // 못 읽으면 에러 → 다음에 다시
            const had = window.deskGiftRead ? await deskGiftRead() : null;
            if (prefGet(BGO_KEY, BGO_LOCAL) !== null) return;
            const gone = new Set((window.binList ? binList() : []).filter(e => e.k === 'bg').map(e => e.id));
            const L = F.filter(f => !gone.has(f.u)).map(f => ({ u: f.u, p: f.id, c: f.c }))
                .concat((had && Array.isArray(had.bg) ? had.bg : []).filter(g => g && g.u && typeof g.p === 'string' && !gone.has(g.u) && !F.some(f => f.u === g.u)).map(g => ({ u: g.u, p: g.p, g: 1 })));
            if (L.length || (had && Array.isArray(had.bg))) prefSet(BGO_KEY, BGO_LOCAL, L); else bgoGift();   // 선물.json 에 배경지 칸이 있는데 비었으면 = 다 버린 사람
        }
        function bgoSync() {
            if (prefGet(BGO_KEY, BGO_LOCAL) === null) {
                if (!bgoOnline()) { prefSet(BGO_KEY, BGO_LOCAL, [{ u: bgoU(), p: BGO_FIRST }]); return; }   // 👤 게스트 = 이 기기 목록만
                if (drive.newbie) { bgoGift(); return; }                         // 🆕 처음 온 다꾸러 = 뒤지지 않고 바로 선물
                if (bgoBusy) return; bgoBusy = true;
                bgoRescue().catch(e => console.warn('🌈 배경지 되살리기', e))
                    .finally(() => { bgoBusy = false; if (typeof renderPatternList === 'function') renderPatternList(); });
                return;
            }
            if (!bgoOnline() || bgoBusy) return;
            bgoBusy = true;                                                      // 파일이 아직 없는 것 (예전에 받은 것도) → 배경지 폴더에
            (async () => { for (const it of bgoOwned().filter(x => !x.c && !x.g)) await bgoFile(it, 'basic'); })().catch(e => console.warn('🌈 파일', e)).finally(() => { bgoBusy = false; });
        }
        /* 🌈 배경지 창 '기본' 칸 (js/skins.js patItems) : 받은 것 (같은 것도 따로 · 새로 받은 것이 앞) */
        function bgoItems(sub) { return bgoOwned().filter(x => bgoPat(x.p)).reverse().map(x => Object.assign({}, bgoPat(x.p), { u: x.u })).filter(p => !sub || patG(p) === sub); }
        function bgoGive(pid) { const p0 = bgoPat(pid); if (!p0 || p0.tier !== 'free') return 'fail'; const it = { u: bgoU(), p: pid }; prefSet(BGO_KEY, BGO_LOCAL, bgoOwned().concat([it])); bgoFile(it, 'basic'); if (window.snapSoon) snapSoon(); if (typeof renderPatternList === 'function') renderPatternList(); return 'ok'; }
        /* 🗑 버리기 (마지막 하나도) */
        async function bgoDiscard(u) {
            const it = bgoOwned().find(x => x.u === u); if (!it) return;
            const p = bgoPat(it.p), nm = `${(p && p.name) || ''} 배경지`.trim();
            if (!await binAsk(nm)) return;
            prefSet(BGO_KEY, BGO_LOCAL, bgoOwned().filter(x => x.u !== u));
            await binAdd(Object.assign({ k: 'bg', id: u, p: it.p }, it.c ? { c: it.c } : {}, it.g ? { g: 1 } : {})); if (it.g) bgoGiftTell();
            if (typeof bgPattern !== 'undefined' && bgPattern && bgPattern.id === it.p && !bgoOwned().some(x => x.p === it.p) && typeof clearBgPattern === 'function') clearBgPattern();   // 쓰던 배경지가 하나도 안 남으면 배경을 빼요
            if (typeof renderPatternList === 'function') renderPatternList();
            await binTold(bgoOwned().length ? '' : '배경지는 🏪 기본상품 샵 → 🌈 배경지에서 받을 수 있어요');
        }
        BIN_KINDS.bg = {
            name: e => { const p = bgoPat(e.p); return `🌈 ${p ? p.name + ' ' : ''}배경지`; },
            restore: e => { if (bgoPat(e.p)) prefSet(BGO_KEY, BGO_LOCAL, bgoOwned().filter(x => x.u !== e.id).concat([Object.assign({ u: e.id, p: e.p }, e.c ? { c: e.c } : {}, e.g ? { g: 1 } : {})])); if (e.g) bgoGiftTell(); },
            purge: e => ofDel(DIRS.pattern, e.c)                                // 🗂 배경지 폴더 파일 (도련 11-05)
        };
        /* 🏪 기본상품 샵 → 🌈 배경지 (js/basket.js) : 🎨 단색 · ☁️ 패턴 · 같은 것도 또 받아요 */
        function bgoShopList() { return BG_PATTERNS.filter(p => p.tier === 'free').map(p => ({ cnt: p.name || '배경지', look: 'bg', pid: p.id, sec: patG(p), give: () => bgoGive(p.id), name: `${p.name || ''} 배경지`.trim() })); }

        window.bgoOwned = bgoOwned; window.bgoSync = bgoSync; window.bgoItems = bgoItems; window.bgoGive = bgoGive; window.bgoDiscard = bgoDiscard; window.bgoShopList = bgoShopList;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['bgown'] = true;
