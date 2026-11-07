/* 말랑달콤 다이어리 - js/bgown.js
   🌈 배경지 = 상품 (도련 10-28 · 다이어리처럼) : 🏪 기본상품 샵 → 🌈 배경지 (🎨 단색 · ☁️ 패턴) 에서 받아야 내 것 · 같은 것도 또 받아요 · 🗑 버리면 휴지통 30일
   - 🌈 배경지 창의 '기본' 칸 = 내 배경지 보관함 (받은 것만) · 처음 온 다꾸러는 상품공방에서 '처음선물'에 체크한 배경지를 들고 시작해요 (도련 11-06 · 앱이 정하지 않아요)
   - 내 배경지 'diary_bg_own' [{ u: 하나하나 id, p: 배경지 id (js/patterns.js BG_PATTERNS = 서버 상품), c: 파일 id }] (🔐 배경지 / _목록.json · 게스트는 이 기기 · 도련 11-07)
       · 💤 앱을 켤 때 안 읽어요 (폰 · 책상 모두 · 지금 깐 배경지는 설정.json) → 🌈 배경지 창 · 🏪 샵 받기 · 🗑 버리기 · 되돌리기 때 bgoReady 가 한 번 읽어요 (js/drive.js keyFileLoad)
       · 🆕 처음 온 다꾸러 = 선물 배경지는 _선물.json 에만 · 목록 파일은 받기 · 버리기처럼 바뀔 때 처음 생겨요 (첫 접속자에게 필요한 파일만 · 도련 11-07)
       · 목록 파일이 없으면 = 되살리기 (배경지 폴더 파일 + _백업.json + _선물.json) · 선물뿐이면 메모리에만 (파일을 만들지 않아요)
       · 🗂 하나에 파일 하나 (도련 11-05) : 말랑달콤 / 배경지 / 받은-<c>.json 🔐 (js/coll.js ofAdd · 내가 만든 배경지 = 내-) · 🎁 처음 선물(g: 1)은 설정 / _선물.json (첫 접속 요청 줄이기)
       · 설정.json 에 목록이 없어지면 = 배경지 폴더 파일로 되살려요 · 🗑 버리면 휴지통 30일 → 파일 삭제
   - 쓰던 배경지를 버려서 같은 배경지가 하나도 안 남으면 배경을 빼요
   ※ js/skins.js · js/bin.js 다음에 읽어요 (patItems · patCatsPaint · renderPatternList 가 여기 함수를 불러요 · js/basket.js 샵) */

        const BGO_KEY = 'diary_bg_own', BGO_LOCAL = 'malang_bg_own';
        const bgoPat = id => BG_PATTERNS.find(p => p.id === id) || null;   // 🧁 숨긴 배경지(off)도 가진 사람은 그대로
        const bgoU = () => 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        function bgoOwned() { const v = prefGet(BGO_KEY, BGO_LOCAL); return Array.isArray(v) ? v.filter(x => x && x.u && typeof x.p === 'string').map(x => { const y = Object.assign({}, x); delete y.g; return window.giftHas && giftHas('bg', y.u) ? Object.assign(y, { g: 1 }) : y; }) : []; }   // 🎁 선물 = _선물.json 주소
        const bgoSet = L => prefSet(BGO_KEY, BGO_LOCAL, bgoStrip(L));
        const bgoStrip = L => (L || []).map(x => { const y = Object.assign({}, x); delete y.g; return y; });   // 저장할 땐 선물 표시를 빼요
        const bgoHas = () => prefGet(BGO_KEY, BGO_LOCAL) !== null;               // 목록을 알아요 (읽었거나 · 되살렸거나 · 선물을 메모리에)
        const bgoMem = L => { if (bgoOnline()) store.putLoaded(BGO_KEY, JSON.stringify(bgoStrip(L))); else bgoSet(L); };   // 💤 메모리에만 (드라이브에 안 써요 · 바뀔 때 prefSet 이 파일을 만들어요)   // 목록에 없는 것도 남겨요 (지우지 않게 · 보일 땐 bgoItems 가 걸러요)
        /* 🎁 처음 온 다꾸러 = 상품공방 '처음선물' 배경지 (도련 11-06 · 한 번만 · 다 버려도 다시 주지 않아요) */
        const bgoFirst = () => BG_PATTERNS.filter(p => p.gift).map(p => ({ u: p.id, p: p.id }));   // 🎁 선물 u = 상품 id
        /* 🗂 배경지 폴더 파일 (도련 11-05) */
        const bgoOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        async function bgoFile(it, from) {
            if (it.c) return;
            const c = await ofAdd(DIRS.pattern, { u: it.u, id: it.p, from }); if (!c) return;
            it.c = c;
            const L = bgoOwned(), t = L.find(x => x.u === it.u); if (t && !t.c) { t.c = c; bgoSet(L); }
        }

        const bgoGiftTell = () => { if (window.deskGiftWrite) deskGiftWrite(); };   // 🎁 선물.json 다시 쓰기 (js/desk.js)
        window.bgoGiftOwn = () => bgoHas() ? bgoOwned().filter(x => x.g).map(x => ({ u: x.u, p: x.p })) : null;   // null = 아직 몰라요 (_선물.json 의 배경지 칸은 그대로 · js/desk.js giftWrite)
        function bgoGift() { const L = bgoFirst(); if (window.giftAdd) giftAdd('bg', L.map(x => x.u)); bgoMem(L); }   // 🎁 선물은 _선물.json 주소 (목록 파일은 안 만들어요 · 도련 11-07)   // 🎁 선물은 _선물.json 에 (목록 파일은 안 만들어요 · 도련 11-07)
        async function bgoRescue() {                                           // 🛟 로그인했는데 목록이 없으면 = 배경지 폴더 + 선물.json (있으면 되살리기 · 처음 온 다꾸러만 선물)
            const had = window.deskGiftRead ? await deskGiftRead() : null, bk = window.deskBackupRead ? await deskBackupRead().catch(() => null) : null;
            const lost = keyMade('bgown') || (bk && Array.isArray(bk.diary_bg_own) && bk.diary_bg_own.some(x => x && !x.g && !(window.giftHas && giftHas('bg', x.u))));   // 📝 목록 파일을 만든 적이 있어요 (또는 백업에 받은 것) = 없어진 것 · 아니면 아직 선물 그대로 (폴더를 안 뒤져요 · 도련 11-07)
            const F = lost ? await ofScan(DIRS.pattern) : [];                    // 못 읽으면 에러 → 다음에 다시
            if (prefGet(BGO_KEY, BGO_LOCAL) !== null) return;
            const gone = new Set((window.binList ? binList() : []).filter(e => e.k === 'bg').map(e => e.id));
            const bkL = bk && Array.isArray(bk.diary_bg_own) ? bk.diary_bg_own.filter(x => x && x.u && typeof x.p === 'string' && !gone.has(x.u)) : null;   // 🛟 설정 / _백업.json (도련 11-06 · _배경지목록.json 이 없어졌어요)
            const L = (bkL || []).concat(F.filter(f => !gone.has(f.u) && !(bkL || []).some(x => x.u === f.u)).map(f => ({ u: f.u, p: f.id, c: f.c })))
                .concat((had && Array.isArray(had.bg) ? had.bg : []).filter(g => g && g.u && typeof g.p === 'string' && !gone.has(g.u) && !F.some(f => f.u === g.u) && !(bkL || []).some(x => x.u === g.u)).map(g => ({ u: g.u, p: g.p, g: 1 })));
            if (!L.length && !(had && Array.isArray(had.bg)) && !bkL) { bgoGift(); return; }   // 선물.json 에 배경지 칸이 있는데 비었으면 = 다 버린 사람
            if (L.some(x => !x.g)) { bgoSet(L); diag('rescue', { w: 'bg', n: L.length }); }   // 받은 것이 있었어요 = 목록 파일을 다시 만들어요
            else bgoMem(L);                                                      // 선물뿐 = 아직 안 바뀐 사람 (파일을 만들지 않아요)
        }
        /* 💤 배경지 목록 준비 (도련 11-07) : 쓰기 전에 꼭 (창 · 샵 · 버리기 · 되돌리기) · 한 번 읽으면 그대로 */
        let bgoP = null, bgoPGen = -1, bgoRR = false;
        function bgoReady() {
            if (!bgoOnline()) { if (!bgoHas()) bgoSet(bgoFirst()); return Promise.resolve(true); }   // 👤 게스트 = 이 기기 목록만
            if (bgoHas() && keyFileOn('bgown')) return Promise.resolve(true);
            if (bgoP && bgoPGen === drive.gen) return bgoP;
            const gen = bgoPGen = drive.gen;
            bgoP = (async () => {
                await keyFileLoad('bgown');
                if (gen !== drive.gen) return false;
                if (!bgoHas()) { if (drive.newbie) bgoGift(); else await bgoRescue(); }
                if (gen !== drive.gen) return false;
                for (const it of bgoOwned().filter(x => !x.c && !x.g)) await bgoFile(it, 'basic');   // 파일이 아직 없는 것 (예전에 받은 것도) → 배경지 폴더에
                return true;
            })();
            bgoP.catch(e => { console.warn('🌈 배경지 목록', e); if (bgoP && bgoPGen === gen) bgoP = null; });
            return bgoP;
        }
        /* 드라이브를 읽은 뒤 (js/drive.js applyLoadedData) : 💤 목록은 읽지 않아요 · 게스트 · 🆕 처음 온 다꾸러만 선물을 메모리에 (_선물.json 에 적히게) */
        function bgoSync() {
            bgoP = null;
            if (bgoHas()) return;
            if (!bgoOnline()) { bgoSet(bgoFirst()); return; }   // 👤 게스트 = 이 기기 목록만
            if (drive.newbie) { bgoGift(); drive.lazyOn.add('bgown'); (drive.keyNone = drive.keyNone || new Set()).add('bgown'); }   // 🆕 처음 온 다꾸러 = 뒤지지 않고 바로 선물 (메모리 · _선물.json) · 목록 파일이 없는 걸 알아요 (찾지 않아요)
        }
        /* 🌈 배경지 창 '기본' 칸 (js/skins.js patItems) : 받은 것 (같은 것도 따로 · 새로 받은 것이 앞) */
        function bgoItems(sub) {
            if ((!bgoHas() || !keyFileOn('bgown')) && !bgoRR) { bgoRR = true; bgoReady().then(ok => { bgoRR = false; if (ok && typeof renderPatternList === 'function') renderPatternList(); }, () => { bgoRR = false; }); }   // 💤 처음 열 때 읽고 다시 그려요 (한 번만)
            if (!bgoHas()) return [];
            return bgoOwned().filter(x => bgoPat(x.p)).reverse().map(x => Object.assign({}, bgoPat(x.p), { u: x.u })).filter(p => !sub || patG(p) === sub); }
        async function bgoGive(pid) { const p0 = bgoPat(pid); if (!p0 || p0.tier !== 'free') return 'fail'; try { await bgoReady(); } catch (e) { return 'fail'; }   /* 💤 먼저 목록 */ const it = { u: bgoU(), p: pid }; bgoSet(bgoOwned().concat([it])); bgoFile(it, 'basic'); if (typeof renderPatternList === 'function') renderPatternList(); return 'ok'; }
        /* 🗑 버리기 (마지막 하나도) */
        async function bgoDiscard(u) {
            try { await bgoReady(); } catch (e) { return; }                     // 💤 먼저 목록
            const it = bgoOwned().find(x => x.u === u); if (!it) return;
            const p = bgoPat(it.p), nm = `${(p && p.name) || ''} 배경지`.trim();
            if (!await binAsk(nm)) return;
            bgoSet(bgoOwned().filter(x => x.u !== u));
            await binAdd(Object.assign({ k: 'bg', id: u, p: it.p }, it.c ? { c: it.c } : {}, it.g ? { g: 1 } : {})); if (it.g && window.giftDel) giftDel('bg', u);   // 🎁 선물 주소를 빼요
            if (typeof bgPattern !== 'undefined' && bgPattern && bgPattern.id === it.p && !bgoOwned().some(x => x.p === it.p) && typeof clearBgPattern === 'function') clearBgPattern();   // 쓰던 배경지가 하나도 안 남으면 배경을 빼요
            if (typeof renderPatternList === 'function') renderPatternList();
            await binTold(bgoOwned().length ? '' : '배경지는 🏪 기본상품 샵 → 🌈 배경지에서 받을 수 있어요');
        }
        BIN_KINDS.bg = {
            name: e => { const p = bgoPat(e.p); return `🌈 ${p ? p.name + ' ' : ''}배경지`; },
            restore: async e => { await bgoReady(); if (bgoPat(e.p)) bgoSet(bgoOwned().filter(x => x.u !== e.id).concat([Object.assign({ u: e.id, p: e.p }, e.c ? { c: e.c } : {}, e.g ? { g: 1 } : {})])); if (e.g && window.giftAdd) giftAdd('bg', e.id); },
            purge: e => ofDel(DIRS.pattern, e.c)                                // 🗂 배경지 폴더 파일 (도련 11-05)
        };
        /* 🏪 기본상품 샵 → 🌈 배경지 (js/basket.js) : 🎨 단색 · ☁️ 패턴 · 같은 것도 또 받아요 */
        function bgoShopList() { return BG_PATTERNS.filter(p => p.tier === 'free').map(p => ({ cnt: p.name || '배경지', look: 'bg', pid: p.id, sec: patG(p), give: () => bgoGive(p.id), name: `${p.name || ''} 배경지`.trim() })); }

        window.bgoOwned = bgoOwned; window.bgoSync = bgoSync; window.bgoReady = bgoReady; window.bgoItems = bgoItems; window.bgoGive = bgoGive; window.bgoDiscard = bgoDiscard; window.bgoShopList = bgoShopList;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['bgown'] = true;
