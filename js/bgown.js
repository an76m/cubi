/* 말랑달콤 다이어리 - js/bgown.js
   🌈 배경지 = 상품 (도련 10-28 · 다이어리처럼) : 🏪 기본상품 샵 → 🌈 배경지 (🎨 단색 · ☁️ 패턴) 에서 받아야 내 것 · 같은 것도 또 받아요 · 🗑 버리면 휴지통 30일
   - 🌈 배경지 창의 '기본' 칸 = 내 배경지 보관함 (받은 것만) · 처음 온 다꾸러는 🎨 분홍 단색 하나만 들고 시작해요
   - 내 배경지 'diary_bg_own' [{ u: 하나하나 id, p: 배경지 id (js/patterns.js BG_PATTERNS) }] (설정.json · 게스트는 이 기기)
       · 배경지는 그림 파일이 없는 색 · 무늬라서 목록에만 적어요 (버려도 지울 파일이 없어요)
   - 쓰던 배경지를 버려서 같은 배경지가 하나도 안 남으면 배경을 빼요
   ※ js/skins.js · js/bin.js 다음에 읽어요 (patItems · patCatsPaint · renderPatternList 가 여기 함수를 불러요 · js/basket.js 샵) */

        const BGO_KEY = 'diary_bg_own', BGO_LOCAL = 'malang_bg_own', BGO_FIRST = 'c-pink';
        const bgoPat = id => BG_PATTERNS.find(p => p.id === id && p.tier === 'free') || null;
        const bgoU = () => 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        function bgoOwned() { const v = prefGet(BGO_KEY, BGO_LOCAL); return Array.isArray(v) ? v.filter(x => x && x.u && bgoPat(x.p)) : []; }
        /* 🎁 처음 온 다꾸러 = 분홍 단색 하나 (한 번만 · 다 버려도 다시 주지 않아요) */
        function bgoSync() { if (prefGet(BGO_KEY, BGO_LOCAL) === null) prefSet(BGO_KEY, BGO_LOCAL, [{ u: bgoU(), p: BGO_FIRST }]); }
        /* 🌈 배경지 창 '기본' 칸 (js/skins.js patItems) : 받은 것 (같은 것도 따로 · 새로 받은 것이 앞) */
        function bgoItems(sub) { return bgoOwned().slice().reverse().map(x => Object.assign({}, bgoPat(x.p), { u: x.u })).filter(p => !sub || patG(p) === sub); }
        function bgoGive(pid) { if (!bgoPat(pid)) return 'fail'; prefSet(BGO_KEY, BGO_LOCAL, bgoOwned().concat([{ u: bgoU(), p: pid }])); if (typeof renderPatternList === 'function') renderPatternList(); return 'ok'; }
        /* 🗑 버리기 (마지막 하나도) */
        async function bgoDiscard(u) {
            const it = bgoOwned().find(x => x.u === u); if (!it) return;
            const p = bgoPat(it.p), nm = `${p.name || ''} 배경지`.trim();
            if (!await binAsk(nm)) return;
            prefSet(BGO_KEY, BGO_LOCAL, bgoOwned().filter(x => x.u !== u));
            await binAdd({ k: 'bg', id: u, p: it.p });
            if (typeof bgPattern !== 'undefined' && bgPattern && bgPattern.id === it.p && !bgoOwned().some(x => x.p === it.p) && typeof clearBgPattern === 'function') clearBgPattern();   // 쓰던 배경지가 하나도 안 남으면 배경을 빼요
            if (typeof renderPatternList === 'function') renderPatternList();
            await binTold(bgoOwned().length ? '' : '배경지는 🏪 기본상품 샵 → 🌈 배경지에서 받을 수 있어요');
        }
        BIN_KINDS.bg = {
            name: e => { const p = bgoPat(e.p); return `🌈 ${p ? p.name + ' ' : ''}배경지`; },
            restore: e => { if (bgoPat(e.p)) prefSet(BGO_KEY, BGO_LOCAL, bgoOwned().filter(x => x.u !== e.id).concat([{ u: e.id, p: e.p }])); },
            purge: () => {}                                                    // 지울 파일이 없어요 (목록에서만)
        };
        /* 🏪 기본상품 샵 → 🌈 배경지 (js/basket.js) : 🎨 단색 · ☁️ 패턴 · 같은 것도 또 받아요 */
        function bgoShopList() { return BG_PATTERNS.filter(p => p.tier === 'free').map(p => ({ cnt: p.name || '배경지', look: 'bg', pid: p.id, sec: patG(p), give: () => bgoGive(p.id), name: `${p.name || ''} 배경지`.trim() })); }

        window.bgoOwned = bgoOwned; window.bgoSync = bgoSync; window.bgoItems = bgoItems; window.bgoGive = bgoGive; window.bgoDiscard = bgoDiscard; window.bgoShopList = bgoShopList;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['bgown'] = true;
