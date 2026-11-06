/* 말랑달콤 다이어리 - js/desk.js
   🪑 책상 꾸미기 (도련 10-26 · 💻 PC · 아이패드만 = html.desk-on · 📱 폰은 없어요)
   - 책상 그림(img/desk-wide.webp · 1672×941 · 갈색 선 일러스트 (10-26 픽셀아트 → 일러스트))과 소품을 한 무대(#deskStage)에 · 무대는 책상 그림 크기 그대로 화면을 꽉 채우게(cover · 아래 맞춤) 늘었다 줄었다
     → 소품 자리는 늘 책상 그림 기준 좌표(px)로 저장해요 · 화면 크기가 바뀌어도 같은 자리
   - 소품은 마우스 · 손가락으로 끌어서 옮겨요 · 톡 = 고르기 (점선 테두리 + 위에 작은 버튼)
   - 🧲 딱 맞추기 (켬 / 끔 · 고른 소품 위 버튼 · 이 기기에 기억) :
       켬 = 16px 칸에 맞춰 놓이고 · 다른 소품 위(받침대 · 서랍장 · 벽 선반) · 책상 뒤쪽 선(벽에 붙이기) · 양옆 벽 모서리 가까이 가면 착 붙어요 (분홍 안내선)
       끔 = 손이 가는 그대로 부드럽게
       💻 끄는 동안 Shift 를 누르고 있으면 잠깐 반대로
   - 🔗 소품 ↔ 기능 (도련 10-27 · ⚙️ 설정 📖 다이어리 칸 🪑 화면) : 기능마다 책상 위 소품 하나 (라벨이 붙어요)
       하단 메뉴 기능(다이어리 · 스티커 · 문구함 · 카페 · 설정) = 숨긴 하단 메뉴 버튼을 대신 눌러요 (하는 일이 똑같아요) · 🏪 기본상품 샵 · 📦 소품 보관함은 바로 열어요
       평소 책상 = 톡 하면 그 기능만 · 소품은 안 움직여요
   - 🛠 책상 꾸미기 (도련 10-27 · 배치 + 기능 연결을 한곳에서) : 🛠 소품(처음 = 서랍장) 또는 ⚙️ 설정 🪑 화면 칸 버튼으로 들어가요 (html.desk-edit)
       끌기 = 옮기기 · 톡 = 고르기 → 위에 기능 칩(톡 = 이 소품에 연결 · 다시 톡 = 빼기 · 다른 소품에 있던 기능은 옮겨 와요) · 🧲 · 📦 넣기 · 🗑 버리기
       아래 📦 보관함 줄 : 톡 = 책상에 놓기 · 위 막대 [취소] = 들어오기 전 그대로 · [✓ 확정] = 그때 저장
       확정은 다이어리 · 스티커 · 문구함 · 카페 · 설정 다섯 기능이 모두 연결돼야 눌려요 (설정을 못 열게 되는 일이 없게) · 꾸미는 동안은 아무것도 저장 안 해요
       화면이 좁아 기능 소품이 잘려 보이면 보이는 곳 안쪽으로 당겨 맨 앞에 보여 줘요 (저장한 자리는 그대로)
   - 📦 내 소품 (도련 10-27) : 처음엔 기본 세트 선물(DESK_ITEMS 중 nost 가 아닌 것 · 책상 위) · 🏪 기본상품 샵 '책상 소품'에서 더 받으면 📦 소품 보관함으로 (같은 것도 여러 개 · 받기 전에 물어봐요)
       보관함 ↔ 책상 · 🗑 버리기 = 🛠 책상 꾸미기에서 (▤ 하단 메뉴 화면이면 📦 소품 보관함 창) · 버린 것은 기본상품 샵에서 다시 받아요
   - 저장 (도련 10-27)
       설정 / 🔐 _소품목록.json 'diary_desk_own' [{u: 하나하나 id, id: 소품, c: 종류 폴더 파일 id, g · p · cs · tag}] (가진 것 전부) · 📍 배치.json 'diary_desk_pos' {u: {x, y, lz, fl, lp, lb, on}} (책상 위에 놓인 것만) · ⚙ 책상설정.json 'diary_desk_fn' {기능: u} (js/drive.js DESK_FILE_KEYS · 게스트는 이 기기 · 도련 11-06)
       종류 폴더 (서랍장 · 시계 … js/drive.js DESK_DIRS · 소품의 kind) / 받은-<c>.json = 가진 소품 하나에 파일 하나 (js/coll.js 모음 · 뒤에서 차례로 올려요)
         기본 세트 선물 · 기본상품 샵 · 나중에 유료 · 이벤트 · 공유 = 받은- · 내가 만든 것 = 내- · 버리면 그 파일도 지워요
       🎁 기본세트 (도련 10-27 · 서비스 = 예외) : 처음 한 번 받는 책상 소품 + 문구 (+ 🧱 벽지 · 🪵 책상판 · 🌈 배경지 · 📔 처음 다이어리 · 11-05) 는 종류 폴더가 아니라 설정 / _선물.json 한 파일 (g: 1 · 첫 접속 요청 3~4번)
         버리면 선물.json 에서 빠져요 (다 비면 파일도 지워요) · 그 뒤에 받는 것부터 종류 폴더 · 배치.json 이 없어지면 🛟 되살리기 (giftEnsure)
       기본 세트의 u = 소품 id (그래서 처음 기능 연결이 그대로 맞아요) · 선물이 아닌데 파일이 아직 없는 것(c 없음)은 드라이브를 읽은 뒤 만들어요
   ※ 소품 종류 = DESK_ITEMS (기본상품 샵 카탈로그) */

        const DESK_W = 1672, DESK_H = 941, DESK_PX = 16, DESK_M = 36;   // 🧲 딱 맞추기 : 16px 칸 · 36px 안이면 착 (4px 는 너무 촘촘해서 부드러운 것과 차이를 몰랐어요 · 도련 10-26)
        const DESK_EDGE = { back: 721, left: 140, right: 1540 };                 // 책상 뒤쪽 선 (벽과 만나는 곳) · 양옆 벽 모서리 (그림 px)
        /* 🧁 소품 = 서버 상품 (상품공방 '책상소품' · js/prod.js · 도련 11-02 : 예전 목록 · img/desk 그림은 기본상품샵/책상소품 으로 옮겼어요)
           속성 '소품' = { kind, w, h, x, y, wall, surf, slots, mouth, clock, lcd, photo, area, cork } (상품공방 📍 그림 위 자리에서 그려요) · 디자인 = 그림 · 앞벽 = 앞벽 마스크
             front = 앞벽 마스크(흰 부분 = 앞벽 · 도구/앞벽마스크.html) · mouth = [입구 왼쪽 %, 오른쪽 %, 앞벽 위 %] · area = 💡 누르면 동작하는 곳 (그림 % · js/deskcustom.js) · cork = 📝 메모 붙는 곳 (그림 %)
             slots = 서랍 칸 [왼 · 위 · 오른 · 아래] (그림 %) · surf = 올리는 면 [세로 자리, 왼쪽 끝, 오른쪽 끝] (소품 px) · clock = 바늘 { cx, cy, r } · lcd · photo = [왼 · 위 · 오른 · 아래] %
           처음선물 = 🎁 기본 세트 (아니면 nost) · 숨김 = 샵에서만 빠지고 가진 다꾸러는 그대로 · 소품은 꾸미기 상품이라 고치면 모두 새 모습 */
        const DKB_STK0 = ['seal', 'piece', 'paper', 'tape', 'tk', 'leaf', 'memo'];
        const DK_HOLD_OF = { pc: { all: ['pc'] }, skin: { all: ['skin'] }, drawer: { ok: ['gd', 'skin'].concat(DKB_STK0.map(k => 'h:' + k)) }, tape: null };   // 🧺 상품 '담는것' → 넣을 수 있는 창 (tape = 마테 롤만 · js/desktape.js)
        const dkItemOf = x => {                                                   // 상품 하나 → 소품 정보
            const P = x.P || {}, o = Object.assign({}, P.소품 && typeof P.소품 === 'object' ? P.소품 : {});
            const num = v => v !== '' && v != null && isFinite(+v);              // 🔎 크기 · 처음 자리 · 이름 = 상품 그대로 (도련 11-02 · 빠지면 안 나와요 · 상품공방이 검수)
            if (!x.u.디자인 || !o.kind || !String(P.이름 || '') || !(+o.w > 0) || !(+o.h > 0) || !num(o.x) || !num(o.y)) { console.warn('🧁 소품 속성이 모자라요 :', x.id); return null; }
            Object.assign(o, { id: x.id, src: x.u.디자인, name: String(P.이름), w: +o.w, h: +o.h, x: +o.x, y: +o.y });
            if (x.u.앞벽) o.front = x.u.앞벽; else delete o.front;
            if (x.u.서랍속) o.inside = x.u.서랍속; else delete o.inside;   // 🗄 서랍 속 그림 (없으면 그림자 · js/desk.js dkDrawerPull)
            o.kind = String(o.kind).replace(/[\/\\'"<>`]/g, '').slice(0, 20);   // 🆕 새 종류 = 상품공방 폴더 이름 그대로 (도련 11-06 · 드라이브 폴더 · 보관함 칸 이름)
            const CAN = ['turn', 'light', 'clock', 'memo', 'rope', 'peg'];       // 🧩 고르는 기능 = 상품공방 '기능' (도련 11-06 · 종류가 아니라 상품이 정해요 · 새 소품도 코드 없이)
            o.can = (Array.isArray(P.기능) ? P.기능 : []).filter(f => CAN.includes(f));
            if (P.종류이름) o.kn = String(P.종류이름).slice(0, 12); if (P.종류아이콘) o.ki = String(P.종류아이콘).slice(0, 4);   // 🏪 샵 · 보관함 칸 이름 (새 종류)
            if (o.can.includes('rope')) o.bulbs = ((o.줄 && o.줄.그림) || []).map(g => g && x.u[g.f] ? { src: x.u[g.f], pv: g.pv, s: g.s } : null).filter(Boolean);   // 💡 전구줄 그림 (상품 폴더의 전구1 … · js/desklights.js)
            if (P.처음선물) delete o.nost; else o.nost = 1;
            /* 🧺 담는 소품 (도련 11-06 · 상품공방 '담는것' · 종류가 아니라 상품이 정해요 → 새 소품도 코드 없이) : tape 마테 롤 세워 꽂기 · pc 문구 꽂기 · skin 다이어리 · drawer 서랍 칸
               🎁 처음 모습 = 상품 '처음연결' (pc · skin) · '처음칸' { 칸 번호: 창 } (서랍) · '처음담기' (tape = [칸마다 테이프 id] · pc = [문구 id] · drawer = { 칸 번호: [문구 id] }) */
            if (Object.prototype.hasOwnProperty.call(DK_HOLD_OF, P.담는것)) o.hold = P.담는것; else delete o.hold;
            if (P.처음연결 === 'pc' || P.처음연결 === 'skin') o.link = P.처음연결; else delete o.link;
            const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : null;
            if (obj(P.처음칸)) o.firstSlots = P.처음칸; else delete o.firstSlots;
            if (Array.isArray(P.처음담기) || obj(P.처음담기)) o.firstIn = P.처음담기; else delete o.firstIn;
            if (P.숨김) o.off = 1;
            return o;
        };
        const DK_GHOST = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect x="4" y="4" width="72" height="72" rx="14" fill="#fff" stroke="#e8c6d4" stroke-width="3" stroke-dasharray="6 5"/><text x="40" y="50" font-size="30" text-anchor="middle" fill="#d9a3b8">?</text></svg>');
        const DESK_ITEMS = [], DK_CAT = new Map();                                // 소품이 많아져도 바로 찾기
        function dkBuild() {                                                       // 🧁 서버 상품 그대로 (js/prod.js)
            DESK_ITEMS.length = 0; DK_CAT.clear();
            (window.prodList ? prodList('책상소품') : []).forEach(x => { const o = dkItemOf(x); if (o) { DESK_ITEMS.push(o); DK_CAT.set(o.id, o); } });
            const v = typeof prefGet === 'function' ? prefGet(DK_OWN_KEY, DK_OWN_LOCAL) : null;   // 가졌는데 서버에 없는 것 = 자리만 지키는 '?' (지워지지 않게 · 서버에 다시 올리면 제 모습)
            (Array.isArray(v) ? v : []).forEach(o => { if (o && typeof o.id === 'string' && !DK_CAT.has(o.id)) { const g = { id: o.id, kind: 'doll', src: DK_GHOST, name: '불러오는 중', w: 80, h: 80, x: 700, y: 560, nost: 1, off: 1, ghost: 1 }; DK_CAT.set(o.id, g); } });
        }
        const dkCat = id => DK_CAT.get(id) || null;
        const dkDef = el => dkCat(el.dataset.id) || {};
        const DK_SNAP = 'malang_desk_snap';
        const dkGet = lsGet, dkSet = lsSet;                                     // 🧰 js/util.js
        const DK = { s: 1, sel: null, zone: null, snap: dkGet(DK_SNAP, true), base: {}, items: [], seen: '', art: {} };   // art = 🎨 칠한 그림 {u: 그림} (종류 폴더 파일에서 읽어 둔 것)   // base = 저장한 자리 (화면이 좁아 당겨 보여 줘도 그대로)

        /* 📦 내 소품 목록 */
        /* 💾 저장은 둘로 나눠요 (도련 11-06) : 🔐 _소품목록.json 'diary_desk_own' = 가진 소품 전부 (이게 '가진 것') · 📍 배치.json 'diary_desk_pos' = 책상 위에 놓인 것의 자리만 { u: { x, y, lz, fl, lp, lb, on } }
           · 화면 · 코드는 예전처럼 DK.items 하나 (at : 'desk' = 배치에 있음 · 'box' = 없음) · 목록에 없는 자리는 버려요 (목록이 진짜) · 보관함에서 꺼내면 그 소품 처음 자리라 보관함 자리는 안 남겨요 */
        const DK_OWN_KEY = 'diary_desk_own', DK_OWN_LOCAL = 'malang_desk_own', DK_POS_KEY = 'diary_desk_pos', DK_POS_LOCAL = 'malang_desk_pos';
        const DK_SPOT = ['x', 'y', 'lz', 'fl', 'lp', 'lb', 'on'];                  // 자리 · 놓인 모습 (배치.json) · 나머지(u · id · c · g · p · cs · tag)는 목록
        function dkJoin(own, pos) {                                                // 목록 + 자리 → 예전 모양 한 줄
            if (!Array.isArray(own)) return null;
            pos = pos && typeof pos === 'object' && !Array.isArray(pos) ? pos : {};
            return own.map(o => { const p = o && typeof o.u === 'string' && pos[o.u]; return o ? Object.assign({}, o, p && typeof p === 'object' ? p : {}, { at: p ? 'desk' : 'box' }) : o; });
        }
        function dkSplit(L) {                                                      // 예전 모양 → 목록 · 자리
            const own = [], pos = {};
            (L || []).forEach(o => {
                if (!o || typeof o.u !== 'string') return;
                const a = {}, b = {};
                Object.keys(o).forEach(k => { if (k === 'at') return; (DK_SPOT.includes(k) ? b : a)[k] = o[k]; });
                own.push(a); if (o.at !== 'box') pos[o.u] = b;
            });
            return { own, pos };
        }
        const dkItemsGet = () => typeof prefGet === 'function' ? dkJoin(prefGet(DK_OWN_KEY, DK_OWN_LOCAL), prefGet(DK_POS_KEY, DK_POS_LOCAL)) : null;
        function dkItemsPut(L) { if (typeof prefSet !== 'function') return; const { own, pos } = dkSplit(L); prefSet(DK_OWN_KEY, DK_OWN_LOCAL, own); prefSet(DK_POS_KEY, DK_POS_LOCAL, pos); }   // 바뀐 쪽 파일만 올라가요 (store 가 같은 값이면 안 올려요)
        dkBuild();
        const dkStarter = () => DESK_ITEMS.filter(d => !d.nost).map(d => Object.assign({ u: d.id, id: d.id, at: 'desk', x: d.x, y: d.y }, d.fl && dkFlipOk(d) ? { fl: 1 } : {}));   // ↔ 처음엔 돌린 모습 (상품 '소품.fl' · 상품공방)   // 🎁 기본 세트 선물
        function dkLoad() {
            const v = dkItemsGet();
            const seenU = new Set();
            const L = Array.isArray(v) ? v.filter(o => o && typeof o.u === 'string' && dkCat(o.id) && !seenU.has(o.u) && seenU.add(o.u)).map(o => Object.assign({ u: o.u, id: o.id, at: o.at === 'box' ? 'box' : 'desk', x: +o.x || 0, y: +o.y || 0 }, typeof o.c === 'string' ? { c: o.c } : {}, o.g ? { g: 1 } : {}, o.p ? { p: 1 } : {}, o.cs && typeof o.cs === 'object' ? { cs: o.cs } : {}, o.lz ? { lz: +o.lz || 0 } : {}, o.fl ? { fl: 1 } : {}, o.tag && typeof o.tag === 'object' ? { tag: o.tag } : {}, Array.isArray(o.lp) ? { lp: o.lp } : {}, Array.isArray(o.lb) ? { lb: o.lb } : {}, o.on && typeof o.on === 'object' && typeof o.on.r === 'string' ? { on: { r: o.on.r, t: +o.on.t || 0 } } : {})) : dkStarter();   // + 🗂 레이어(lz) · 🏷 이름표(tag) (10-30 : 빠져서 다시 읽으면 사라졌어요) · 💡 전구줄 핀(lp) · 네모(lb) · 📷 집힌 줄(on)
            DK.posLost = Array.isArray(v) && typeof prefGet === 'function' && prefGet(DK_POS_KEY, DK_POS_LOCAL) == null;   // 📍 목록은 있는데 배치.json(자리)이 없어요 → 백업 자리로 (giftEnsure)
            DK.fresh = !Array.isArray(v);                                         // 아직 목록이 없어요 → 🎁 기본세트 (드라이브를 읽은 뒤 giftEnsure)
            DK.items = L; DK.seen = JSON.stringify(L);
        }
        /* 🗂 종류 폴더 파일 (js/coll.js) */
        const dkDirOf = k => (typeof DESK_DIRS !== 'undefined' && DESK_DIRS[k]) || String(k || '');   // 🆕 종류 폴더 = 표에 있으면 그 이름 · 새 종류면 종류 이름 그대로 (도련 11-06)
        const dkDirs = () => [...new Set((typeof DESK_DIRS !== 'undefined' ? Object.values(DESK_DIRS) : []).concat(DESK_ITEMS.map(d => dkDirOf(d.kind)).filter(Boolean)))];
        window.dkDirs = dkDirs;
        const dkKN = k => ({ basket: '바구니' })[k] || (DESK_ITEMS.find(d => d.kind === k && d.kn) || {}).kn || dkDirOf(k);         // 소품함에 보일 종류 이름 (폴더는 '소품바구니' · 🧺 스티커 바구니와 헷갈리지 않게 · 도련 10-28)
        const dkColl = id => { const c = dkCat(id); return typeof collOf === 'function' && c && typeof DESK_DIRS !== 'undefined' ? collOf(dirPath(dkDirOf(c.kind)), '받은-') : null; };
        const dkAdding = new Set();                                                // 파일을 만드는 중인 소품 u (두 번 만들지 않게)
        /* 🔐 종류 폴더 파일 내용 · 선물.json 은 스티커처럼 계정마다 다른 열쇠로 암호화 (도련 10-27 · 복사해도 하나 · 남의 것은 못 열어요 · js/own.js)
              파일 안에 고유 번호 u · 목록(배치.json · 암호화)에 있는 u 만 내 것 · 같은 u 는 하나만 */
        const dkSeal = async o => ({ s: await ownLock(o) });
        const dkUnseal = async it => it && typeof it.s === 'string' ? ownUnlock(it.s) : null;
        async function dkFileAdd(o, from) {
            const C = dkColl(o.id); if (!C || o.c || dkAdding.has(o.u)) return;
            dkAdding.add(o.u);
            try { o.c = await collAdd(C, await dkSeal({ u: o.u, id: o.id, from }), '', { id: o.id }); const cur = DK.items.find(x => x.u === o.u); if (cur) cur.c = o.c; }   // 그사이 목록을 다시 읽었어도 그 소품에
            catch (e) { console.warn('소품 파일', e); }
            finally { dkAdding.delete(o.u); }
        }
        function dkFileDel(o) { if (o.g) { giftWrite(); return; } const C = dkColl(o.id); if (C && o.c) collRemove(C, o.c).catch(e => console.warn('소품 파일', e)); }
        /* 🎁 설정 / _선물.json { desk: [{u, id}], gd: [디자인 id] } = 지금 가진 선물 (목록에서 g: 1 인 것) */
        const GIFT_NAME = '_선물.json';   // 🎁 설정 폴더 (도련 11-06 · 예전 기본세트 폴더)
        const giftOn = () => typeof drive !== 'undefined' && drive.ready && !drive.guest && typeof getFolder === 'function';
        let giftChain = Promise.resolve(), giftLate = false, giftWrote = false;
        function giftBody() {
            const gd = window.gdOwnList ? (gdOwnList() || []) : [];
            const more = n => { try { return window[n] ? window[n]() : []; } catch (e) { return []; } };   // 🧱 🪵 🌈 📔 처음 선물도 여기에 (도련 11-05 · 첫 접속 요청 줄이기 · js/deskskin.js · bgown.js · dyyear.js)
            return { v: 1, desk: DK.items.filter(o => o.g).map(o => ({ u: o.u, id: o.id })), gd: gd.filter(o => o.g).map(o => o.id), ds: more('dsGiftOwn'), bg: more('bgoGiftOwn'), dy: more('dyyGiftOwn') };
        }
        function giftWrite() {                                                    // 지금 모습으로 덮어쓰기 (차례대로 · 실패하면 다음에 다시)
            if (!giftOn()) return giftChain;
            if (DK.fresh || drive.deskLocked || (window.gdOwnList && gdOwnList() === null)) { giftLate = true; return giftChain; }   // 아직 책상 목록을 정하는 중 = 선물을 덮어쓰지 않아요 (giftEnsure 가 뒤에 써요)
            giftChain = giftChain.then(async () => {
                try {
                    const b = giftBody(), dir = await getFolder(dirPath(DIRS.settings), true), cur = drive.newbie && !giftWrote ? null : await findFile(dir, GIFT_NAME);   // 🆕 처음 온 다꾸러 첫 쓰기 = 찾지 않아요 (도련 11-06)
                    if (!b.desk.length && !b.gd.length && !b.ds.length && !b.bg.length && !b.dy.length) { if (cur) await driveTrash(cur.id); }
                    else await driveUpsert(dir, GIFT_NAME, cur && cur.id, await ownLock(b));   // 🔐
                    giftReadOnce.forget();
                    giftLate = false; giftWrote = true;
                } catch (e) { console.warn('기본세트', e); giftLate = true; }
            });
            return giftChain;
        }
        /* 📖 되살리기는 여러 곳(책상 · 벽지 · 배경지 · 다이어리)이 한꺼번에 물어요 → 30초 안에는 한 번만 읽어요 (도련 11-06 · 쓰면 잊어요) */
        const dkMemo = (fn, ms) => { let p = null, at = 0; const get = () => { if (!p || Date.now() - at > ms) { at = Date.now(); p = fn(); p.catch(() => { p = null; }); } return p; }; get.forget = () => { p = null; }; return get; };
        const giftReadOnce = dkMemo(() => giftRead0(), 30000);
        const giftRead = () => drive.newbie && !giftWrote ? Promise.resolve(null) : giftReadOnce();   // 🆕 처음 온 다꾸러 = 아직 선물 파일이 없어요 (요청 줄이기 · 도련 11-06)
        async function giftRead0() {
            const dir = await getFolder(dirPath(DIRS.settings), false), f = dir && await findFile(dir, GIFT_NAME);
            if (!f) return null;
            const o = await ownUnlock(await readFileText(f.id));                  // 🔐 못 열면 에러 → 선물을 다시 주지 않아요
            return o && typeof o === 'object' ? o : null;
        }
        /* 🛟 되살리기 (도련 10-27 · 스티커 ownRescue 와 같게) : 배치.json 이 없어지거나 깨지면
             가진 것 = 종류 폴더의 내 파일(🔐 열리는 것만 · 같은 u 는 하나) + 선물.json · 자리 · 기능 연결 = 설정 / _백업.json (하루 한 번 드라이브 안에 복사)
             → 지금 가진 것만 살아나요 (버린 것은 파일이 없어서 안 살아나요 · 📦 zip 백업과는 달라요)
             처음 온 사람(선물.json · 백업 둘 다 없음)은 폴더를 뒤지지 않고 바로 선물 */
        const DK_BK_NAME = '_백업.json', DK_BK_LS = 'malang_desk_bk';   // 🛟 설정 폴더 (도련 11-06 · 소품 · 문구 · 다이어리 · 배경지 목록 + 자리 · 책상 설정)
        async function dkBackupRead0() {                                           // 못 닿으면 에러 · 없거나 못 여는 백업은 null
            const dir = await getFolder(dirPath(DIRS.settings), false), f = dir && await findFile(dir, DK_BK_NAME);
            if (!f) return null;
            const t = await readFileText(f.id);
            try { const o = await ownUnlock(t); return o && typeof o === 'object' ? o : null; } catch (e) { return null; }   // 못 여는 백업은 없는 셈
        }
        const dkBackupOnce = dkMemo(() => dkBackupRead0(), 30000);
        const dkBackupRead = () => drive.newbie && !dkBkWrote ? Promise.resolve(null) : dkBackupOnce();   // 🆕 처음 온 다꾸러 = 아직 백업이 없어요 (도련 11-06)
        const DK_BK_KEYS = [DK_OWN_KEY, DK_POS_KEY, 'diary_desk_fn', 'diary_gd_own', 'diary_desk_skin', 'diary_gd_at', 'diary_desk_tape', 'diary_pencase', 'diary_bin', 'diary_lock', 'diary_nick', 'diary_tojeong_birth', 'diary_fp_contacts', 'diary_years', 'diary_book_info', 'diary_book_n', 'diary_mine', 'diary_bg_own'];   // 🛟 소품 · 자리 · 기능 연결 · 문구 · 벽지 · 문구의 집 · 다이어리 · 배경지
        let dkBkBusy = false, dkBkWrote = false;
        async function dkBackupWrite() {                                            // 배치.json 을 잘 읽은 날 하루 한 번
            if (dkBkBusy || !giftOn() || drive.deskLocked || DK.fresh || DK.edit || DK.starting) return;   // DK.starting = 처음 선물을 넣는 중
            const day = new Date().toISOString().slice(0, 10), who = (typeof COLL !== 'undefined' && COLL.who) || 'me';
            let m = {}; try { m = JSON.parse(localStorage.getItem(DK_BK_LS) || '{}') || {}; } catch (e) {}
            if (m[who] === day) return;
            const body = {}; DK_BK_KEYS.forEach(k => { const v = prefGet(k, ''); if (v != null) body[k] = v; });   // 🛟 목록 · 자리 · 설정을 한 백업에 (되살릴 때 맞춰 보려고)
            if (!Array.isArray(body[DK_OWN_KEY])) return;
            dkBkBusy = true;
            try {
                /* 🛡 아직 없는 목록(파일이 없어져서 되살리는 중 · 아직 못 읽음)은 예전 백업 값을 그대로 둬요 (도련 11-06 · 빈 채로 덮으면 되살릴 원본까지 사라져요) */
                const old = DK_BK_KEYS.some(k => !(k in body)) && !(drive.newbie && !dkBkWrote) ? await dkBackupRead0() : null;   // 못 닿으면 에러 → 이번엔 안 써요
                if (old) DK_BK_KEYS.forEach(k => { if (!(k in body) && old[k] != null) body[k] = old[k]; });
                const dir = await getFolder(dirPath(DIRS.settings), true), cur = drive.newbie && !dkBkWrote ? null : await findFile(dir, DK_BK_NAME);   // 🆕 처음 온 다꾸러 첫 백업 = 찾지 않아요
                await driveUpsert(dir, DK_BK_NAME, cur && cur.id, await ownLock(body));
                dkBackupOnce.forget(); dkBkWrote = true;
                m[who] = day; try { localStorage.setItem(DK_BK_LS, JSON.stringify(m)); } catch (e) {}
            } catch (e) { console.warn('배치 백업', e); }
            finally { dkBkBusy = false; }
        }
        window.deskBackupRead = dkBackupRead; window.deskGiftRead = () => giftRead();   // 🛟 되살리기 (js/deskskin.js · bgown.js · dyyear.js)                                       // 🧱 벽지 · 책상판 되살리기 (js/deskskin.js dsRescue · 쓰던 것)
        async function dkScan() {                                                   // 종류 폴더의 내 파일들 → { desk: [{u, id, c, p, mt}], gd: [...] }
            const out = { desk: [], gd: [] }, kinds = dkDirs().map(n => ['desk', n]).concat(Object.values(GD_DIRS).map(n => ['gd', n]));
            for (const [t, n] of kinds) {
                const dir = await getFolder(dirPath(n), false); if (!dir) continue;
                const fs = await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}'`, 'id,name,modifiedTime');
                for (const f of fs) {
                    if (!/^(받은|내)-\d+\.json$/.test(f.name)) continue;             // 목록 파일은 빼요
                    let w, it; try { w = JSON.parse(await readFileText(f.id)); it = await dkUnseal(w && w.item); } catch (e) { continue; }   // 🔐 남의 것 · 깨진 것은 무시
                    if (!it || typeof it.id !== 'string' || !w.id) continue;
                    out[t].push({ u: typeof it.u === 'string' ? it.u : it.id, id: it.id, c: String(w.id), p: typeof it.img === 'string' ? 1 : 0, mt: String(f.modifiedTime || '') });
                }
            }
            const one = L => { const m = new Map(); L.sort((a, b) => b.mt.localeCompare(a.mt)).forEach(r => { if (!m.has(r.u)) m.set(r.u, r); }); return [...m.values()]; };   // 같은 u 는 하나 (새것)
            out.desk = one(out.desk); out.gd = one(out.gd);
            return out;
        }
        function dkRebuild(had, bk, files) {
            const pos = new Map((bk && dkJoin(bk[DK_OWN_KEY], bk[DK_POS_KEY]) || []).filter(o => o && o.u).map(o => [o.u, o]));
            const out = [], seen = new Set();
            const add = (o, def) => {
                if (!o || !o.u || seen.has(o.u) || !dkCat(o.id)) return; seen.add(o.u);
                const c = dkCat(o.id), b = pos.get(o.u);
                out.push(Object.assign({ u: o.u, id: o.id, at: b ? (b.at === 'box' ? 'box' : 'desk') : def, x: b && isFinite(+b.x) ? +b.x : c.x, y: b && isFinite(+b.y) ? +b.y : c.y }, o.c ? { c: o.c } : {}, o.p ? { p: 1 } : {}, o.g ? { g: 1 } : {}));
            };
            (files ? files.desk : []).forEach(f => add(f, 'box'));                    // 백업에 자리가 없으면 보관함으로
            (had && Array.isArray(had.desk) ? had.desk : []).forEach(g => add({ u: g.u, id: g.id, g: 1 }, 'desk'));
            return out;
        }
        /* 드라이브를 읽은 뒤 : 소품 · 문구 목록이 아직 없으면 → 되살리기 (선물.json · 백업 · 종류 폴더) · 아무것도 없으면 처음 선물 (책상 소품 모두 + 문구 모두) */
        let giftBusy = false;
        /* 🛟 _휴지통목록.json · _내정보.json 이 없어졌으면 = _백업.json 에서 (도련 11-06 · 하루 한 번만 물어봐요 · 처음 온 다꾸러는 안 물어요) */
        const DK_KR = { binown: ['diary_bin'], me: ['diary_lock', 'diary_nick', 'diary_tojeong_birth', 'diary_fp_contacts'] };
        let dkKR = false;
        async function dkKeyRescue() {
            if (dkKR || !giftOn() || drive.newbie || !drive.deskNone || drive.deskLocked) return;
            const need = Object.keys(DK_KR).filter(w => drive.deskNone.has(w)).flatMap(w => DK_KR[w]).filter(k => prefGet(k, '') == null); if (!need.length) return;
            const day = new Date().toISOString().slice(0, 10); try { if (localStorage.getItem('malang_keyresc') === day) return; } catch (e) {}
            dkKR = true;
            try { const bk = await dkBackupRead(); need.forEach(k => { if (bk && bk[k] != null && prefGet(k, '') == null) prefSet(k, '', bk[k]); }); try { localStorage.setItem('malang_keyresc', day); } catch (e) {} }
            catch (e) { console.warn('되살리기', e); dkKR = false; }
        }
        async function giftEnsure() {
            dkKeyRescue();
            if (DK.posLost && !DK.fresh && !DK.edit && !giftBusy && giftOn()) {        // 🛟 자리만 잃었어요 (배치.json 이 없어짐) : 가진 것은 목록 그대로 · 자리는 하루 한 번 백업에서 (없으면 보관함에)
                DK.posLost = false;
                try {
                    const bk = await dkBackupRead(), p = bk && bk[DK_POS_KEY];
                    if (p && typeof p === 'object' && !DK.edit) { DK.items = dkJoin(dkSplit(DK.items).own, p); dkSave(); deskItemsRender(); deskModeRender(); }
                    ['diary_gd_at', 'diary_desk_tape', 'diary_pencase'].forEach(k => { const v = bk && bk[k]; if (v && typeof v === 'object' && prefGet(k, '') == null) prefSet(k, '', v); });   // ✏️ 문구의 집 · 🎀 정리함 롤도 배치.json 에 있었어요 (도련 11-06)
                } catch (e) { console.warn('배치 되살리기', e); }
            }
            let gdNull = window.gdOwnList ? gdOwnList() === null : false;
            if (giftBusy || DK.edit || typeof drive === 'undefined' || !(drive.ready || drive.guest) || (drive.deskLocked && DK.lockTried) || (!DK.fresh && !gdNull && !drive.deskLocked)) { if (giftLate) giftWrite(); dkBackupWrite(); return; }
            giftBusy = true;
            try {
                let had = null, bk = null, files = null;
                if (giftOn()) {
                    try { had = await giftRead(); bk = await dkBackupRead(); }
                    catch (e) { console.warn('기본세트 · 되살리기', e); return; }   // 못 읽으면 다음에 (선물을 두 번 주지 않게)
                    if (drive.deskLocked) {                                       // 🔐 배치.json 이 깨졌어요 : 내 선물.json · 백업이 열리면(내 열쇠가 맞아요) 되살려서 새로 쓰고 · 아니면 그대로 둬요 (남의 파일일 수 있어요)
                        DK.lockTried = true;
                        if (!had && !bk) { if (window.showMsg) showMsg('🔐 책상 정보(설정 폴더의 책상 · 목록 파일)를 열 수 없어요.<br><span style="font-size:12px;color:#777;">다른 계정의 파일이거나 깨진 파일이에요. 그 파일은 건드리지 않았어요.</span>'); return; }
                        drive.deskLocked = false; DK.fresh = true;
                    }
                    if (had || bk) { try { files = await dkScan(); } catch (e) { console.warn('되살리기', e); return; } }
                }
                const back = !!(had || bk);                                           // 예전에 쓰던 사람 → 되살리기
                if (window.gdOwnList) gdNull = gdOwnList() === null;
                if (DK.fresh) {
                    DK.items = back ? dkRebuild(had, bk, files) : dkStarter().map(o => Object.assign(o, { g: 1 }));
                    DK.fresh = false; dkSave();
                    if (!back) { dkStarterLinks(); DK.starting = true; Promise.all([dkStarterTapes(), dkStarterMore()]).finally(() => { DK.starting = false; setTimeout(dkBackupWrite, 3000); }); }   // 🛟 첫 백업은 처음 선물을 다 넣은 뒤 (도련 11-06 · 마테 자리까지)                // 🎁 처음 온 다꾸러 = 기본 펜꽂이 · 서랍장 한 칸을 미리 이어 둬요 (도련 11-02) · 처음 선물 테이프 (도련 11-04) · 그 밖의 스티커 · 스티커첩 · 페이지 다이어리 (도련 11-06)
                    if (back && bk && bk.diary_desk_fn && typeof bk.diary_desk_fn === 'object' && typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, bk.diary_desk_fn);
                    deskItemsRender(); deskModeRender();
                }
                if (gdNull) {
                    if (back && window.gdSetList) {
                        const seen = new Set(), L = [];
                        (files ? files.gd : []).forEach(f => { if (!seen.has(f.id)) { seen.add(f.id); L.push({ id: f.id, c: f.c }); } });
                        (had && Array.isArray(had.gd) ? had.gd : []).forEach(id => { if (!seen.has(id)) { seen.add(id); L.push({ id, g: 1 }); } });
                        gdSetList(L);
                    } else if (window.gdSetList) gdSetList((window.gdStarter ? gdStarter() : []).map(id => ({ id, g: 1 })));   // 🎁 처음 온 다꾸러 = 핀셋 + 필기구 5 (선물.json · 나머지는 🏪 기본상품 샵 · 도련 11-01)
                }
                if (!back && giftOn()) giftWrite();
            } finally { giftBusy = false; }
        }
        /* 🎁 처음 선물 테이프 (도련 11-04 · 상품공방 마스킹테이프 '처음선물') : 한 롤씩 받아서 (내 스티커 목록) 책상 위 정리함 상품 '처음담기' 칸에 꽂아요 (도련 11-06 · 어느 정리함에도 없는 롤은 스티커 서랍에만) */
        async function dkStarterTapes() {
            try {
                if (!window.sbStarterTapes || !window.ownTake || !(window.ownMode && ownMode())) return;
                const L = await sbStarterTapes(), ds = await Promise.all(L.map(t => t.take().catch(e => { console.warn('🎁 처음 선물 테이프', t.id, e); return null; })));   // 무늬는 한꺼번에 (빨라요)
                const its = ds.map((d, i) => d && { tmp: `tmp-${i}-${Date.now()}`, th: d.th, q0: d.q0, d, pid: L[i].id }).filter(Boolean);   // 🎀 어느 칸 = 정리함 상품 '처음담기' (pid = 테이프 상품 id)
                if (window.dktStarterShow) dktStarterShow(its);                     // 👀 보이는 것부터 : 정리함에 바로 (도련 11-04)
                let ids = [];                                                         // 💾 드라이브 저장은 뒤에서 한 번에 (종이 파일 동시에 · 목록 한 번 · 도련 11-04)
                try { ids = window.ownTakeMany ? await ownTakeMany(its.map(it => it.d)) : []; } catch (e) { console.warn('🎁 처음 선물 테이프', e); }
                its.forEach((it, i) => { if (ids[i] && window.dktStarterReal) dktStarterReal(it.tmp, ids[i]); else if (window.dktStarterDrop) dktStarterDrop(it.tmp); });
            } catch (e) { console.warn('🎁 처음 선물 테이프', e); }
        }
        /* 🎁 그 밖의 처음 선물 (도련 11-06 · 상품공방 '처음선물' 체크 = 처음 온 다꾸러에게 · 앱은 상품공방이 체크한 것만 줘요)
           🏷️ 씰 · 🧩 조각 · 📄 모조지 · 🧻 떡메 · 📃 속지 · 📝 메모지 · 🌸 계절 · 🎁 캡슐 = 그 종류 목록 (js/basket.js bkStarterSheets · 로그인 · 폴더 저장일 때)
           📒 스티커바인더 · 🤍 이형지북 = 그 종류 스티커첩 (bkStarterTools) · 📓 페이지노트 · 🗂️ 페이지바인더 = 내가 만든 칸 (js/dymaker.js dmkStarter) */
        async function dkStarterMore() {
            try { if (window.dmkStarter) await dmkStarter(); } catch (e) { console.warn('🎁 처음 선물 다이어리', e); }
            if (!window.ownTakeMany || !(window.ownMode && ownMode())) return;
            try { if (window.bkStarterTools) await bkStarterTools(); } catch (e) { console.warn('🎁 처음 선물 스티커첩', e); }
            try {
                const ds = window.bkStarterSheets ? await bkStarterSheets() : []; if (!ds.length) return;
                const ids = await ownTakeMany(ds), cap = ds.find((d, i) => d.cap && ids[i]);
                if (cap && window.capsGiftPop) capsGiftPop(cap.cap);              // 🎁 캡슐 = '첫 선물이 도착했어요' 창 (js/gacha.js)
            } catch (e) { console.warn('🎁 처음 선물 스티커', e); }
        }
        /* 🎁 처음 연결 (도련 11-06 · 상품공방 책상소품 '처음연결' · '처음칸' · 앱은 그대로 따라 해요) : 소품 전체 = ✏️ 펜꽂이 · 📔 다이어리 기능 · 서랍 칸 = 🗄️ 문구함 · 📔 · 스티커 한 종류 (이름표 = 글)
           처음 선물로 놓인 소품 · 상품 순서대로 · 한 창 = 한 자리 (먼저 고른 소품) · 이미 연결이 있으면(다른 기기 · 되살리기) 그대로 */
        function dkStarterLinks() {
            if (typeof prefGet !== 'function' || DK.edit) return;
            const desk = dkOnDesk(), v = prefGet(DK_FN_KEY, DK_FN_LOCAL), M = v && typeof v === 'object' ? Object.assign({}, v) : {}, H = dkHomes();
            const taken = k => k in M || Object.keys(H).some(u => (H[u] || []).some(e => e.k === k));
            let chM = false, chH = false;
            DESK_ITEMS.forEach(d => {
                const o = desk.find(x => x.id === d.id); if (!o) return;
                if (d.link && dkHoldOk(o.id).includes(d.link) && !dkSlots(o.id) && !taken(d.link) && !Object.values(M).includes(o.u)) { M[d.link] = o.u; if (!o.tag) o.tag = dknWordTag(d.link); chM = true; }
                const S = dkSlots(o.id), F = d.firstSlots; if (!S || !F) return;
                Object.keys(F).sort((a, b) => a - b).forEach(n => {
                    const s = Math.round(+n) - 1, k = String(F[n] || '');
                    if (!(s >= 0 && s < S.length) || !dkHoldOk(o.id).includes(k) || taken(k) || (H[o.u] || []).some(e => e.s === s)) return;
                    H[o.u] = (H[o.u] || []).concat([{ k, s, r: S[s], tag: dknWordTag(k) }]); chH = true;
                });
            });
            if (chM) { dkSave(); prefSet(DK_FN_KEY, DK_FN_LOCAL, M); }
            if (chH) dkHomesSet(H);
            deskFnPaint(); if (typeof dknPaintAll === 'function') dknPaintAll();
        }
        window.deskGiftWrite = giftWrite; window.deskGiftBusy = () => giftBusy || DK.fresh;
        async function dkFilesFill() {                                             // 파일이 아직 없는 소품 (🎁 기본 세트 선물 · 다른 기기 것은 이미 있어요) → 만들기 · 드라이브를 읽은 뒤에만
            if (DK.filing || DK.edit || DK.fresh || giftBusy || typeof drive === 'undefined' || !drive.ready) return;   // 🎁 선물을 정하는 중이면 기다려요 (선물은 종류 폴더에 안 만들어요)
            const need = DK.items.filter(o => !o.c && !o.g && !dkAdding.has(o.u)); if (!need.length) return;
            DK.filing = true;
            try { for (const o of need) await dkFileAdd(o, 'basic'); }
            finally { DK.filing = false; }
            if (!DK.edit) dkSave();
        }
        function dkSave() { if (DK.edit) return; DK.seen = JSON.stringify(DK.items); dkItemsPut(DK.items); }
        const dkOnDesk = () => DK.items.filter(o => o.at === 'desk');
        const dkName = o => { const c = dkCat(o.id), same = DK.items.filter(x => x.id === o.id); return (c ? c.name : '') + (same.length > 1 ? ' ' + (same.indexOf(o) + 1) : ''); };
        /* josa = 🧰 js/util.js */

        /* 🔗 소품 ↔ 기능 : [기능, 이름, 하단 메뉴 버튼(없으면 바로 열기), 표시] · 처음 연결 (도련 10-27 · 바꿀 수 있어요) */
        const DK_FNS = [['skin', '다이어리', 'tb-skin', '📔'], ['sticker', '스티커', 'tb-sticker', '⭐'], ['gd', '문구함', 'tb-gd', '🗄️'], ['pc', '펜꽂이', '', '✏️'], ['cafe', '카페', 'tb-cafe', '☕'], ['set', '설정', 'tb-set', '⚙️'],
            ['shop', '기본상품 샵', '', '🏪'], ['edit', '책상 꾸미기', '', '🛠']];   // 📦 소품함은 기능에서 뺐어요 (도련 10-28 : 소품을 내놓고 넣는 건 🛠 책상 꾸미기 안에서만 → 작업대 📦 소품함)
        const DK_FN_KEY = 'diary_desk_fn', DK_FN_LOCAL = 'malang_desk_fn';
        /* 🪟 누르면 열리는 창 = 기능 + 상품 창 한 목록 (도련 10-30 : 모든 창이 🔗 기능 연결 목록에) · [id, 이름, 하단 메뉴 버튼, 아이콘, 묶음 'fn' | 'h']
           상품 창 id = 'h:' + 종류 (h:seal …) · 저장 : 소품 전체 = diary_desk_fn {창: 소품} · 👆 칸 = diary_desk_home {소품: [{k: 창, r, tag}]} · 한 창 = 한 자리 */
        const DK_HIC = { seal: '🏷️', piece: '🧩', paper: '📄', tape: '🎀', tk: '🧻', leaf: '📃', memo: '📝', gd: '✂️', tool: '📔', bg: '🌈', desk: '🪑' };
        const DK_HSAME = { tool: 'skin', gd: 'gd' };                             // 같은 창이 열리는 상품 = 기본 기능으로 (📔 다이어리 보관소 · ✏️ 문구함)
        const dkWinOfKind = k => DK_HSAME[k] || 'h:' + k;
        const DK_FN_OFF = ['cafe', 'shop', 'edit'];                              // 🔗 기능 연결 목록에서 뺀 것 (도련 11-01 · ☕ 카페 · 🏪 기본상품 샵 · 🛠 책상 꾸미기 = 이동 · 오른쪽 위 메뉴로)
        /* 🧺 넣을 수 있는 소품만 (도련 11-01 · 현실처럼) : 통 = ✏️ 문구함 · 바구니 · 책 상자 · 파일꽂이 = 📔 다이어리 · 서랍장 = 칸마다 문구함 · 다이어리 · 스티커 한 종류(씰스티커 · 마스킹테이프 …) 중 하나 (도련 11-01)
           나머지 소품(인형 · 시계 · 스탠드 · 게시판 · 사진 · 벽 선반 · 받침대 …) = 연결 없음 · 한 창 = 한 자리 (다른 곳에 넣으면 옮겨요)
           서랍 칸 = 소품 그림 % [왼 · 위 · 오른 · 아래] 미리 정해 둠 (다꾸러가 그리지 않아요) · 새 소품 = 종류(kind)만 맞으면 저절로 · 서랍장 그림이 새로 생기면 칸 자리만 더해요 */
        const DK_FN_OK = ['skin', 'sticker', 'gd', 'pc'];   // ✏️ pc = 펜꽂이 (도련 11-02 · 꽂아 둔 문구 · js/deskgd.js) · 🗄️ gd = 문구함 (서랍장 칸 · 가진 문구 전부)
        const DKB_STK = DKB_STK0;   // 스티커 종류 (서랍 칸 하나 = 한 종류 · 상품 창 h:종류)
        /* 넣을 수 있는 것 = 상품 '담는것' (도련 11-06 · 예전엔 종류마다 여기 한 줄) : all = 소품 전체에 하나 · ok = 서랍 칸마다 하나 (칸 자리 = 상품 slots) · 없으면 = 연결 없음 (인형 · 시계 …) · DK_HOLD_OF 는 위 (dkItemOf 보다 먼저) */

        (function dkCheck() {                                                    // 🔎 개발용 점검 (소품을 추가할 때 빠뜨린 것 · 콘솔에만)
            const seen = new Set();
            DESK_ITEMS.forEach(d => {
                if (seen.has(d.id)) console.warn('🪑 소품 id 가 겹쳐요', d.id); seen.add(d.id);
                if ((d.hold === 'drawer' || d.hold === 'tape') && !(d.slots && d.slots.length)) console.warn('🪑 칸(slots)이 없어요', d.id); if ((d.hold === 'pc' || d.hold === 'skin') && !(d.front && d.mouth)) console.warn('🪑 입구 · 앞벽이 없어요', d.id);
            });
        })();
        const DK_SLOT_NM = ['위', '가운데', '아래'];
        const dkSlotNm = (i, n) => n > 3 ? `${i + 1}번째` : DK_SLOT_NM[i] || `${i + 1}번째`;   // 3칸 = 위 · 가운데 · 아래 · 더 많으면 번호
        const dkHold = id => { const c = dkCat(id); return (c && DK_HOLD_OF[c.hold]) || null; };   // 🧺 상품 '담는것' (도련 11-06)
        const dkSlots = id => { const c = dkCat(id); return (c && c.slots && c.slots.length && dkHold(id) && dkHold(id).ok) ? c.slots : null; };   // 칸이 있는 소품 (서랍장)
        const dkHoldOk = id => { const h = dkHold(id); return h ? (h.all || h.ok) : []; };
        const dkWins = () => DK_FNS.filter(f => DK_FN_OK.includes(f[0])).map(f => f.concat('fn')).concat(DKB_STK.map(k => ['h:' + k, DKH_NAMES[k], '', DK_HIC[k], 'h']));   // 🗄️ 스티커는 종류마다 따로 (서랍 한 칸 = 한 종류 · 도련 11-01)
        const dkWin = id => (id && dkWins().find(x => x[0] === id)) || null;
        window.dkWin = dkWin;
        function deskFnMap() {                                                    // 연결한 기능 → 책상 위 소품 (소품마다 하나)
            if (DK.edit) return DK.editFn;                                        // 🛠 꾸미는 동안은 고치는 중인 연결
            const v = typeof prefGet === 'function' ? prefGet(DK_FN_KEY, DK_FN_LOCAL) : null;
            const got = v && typeof v === 'object' ? v : {};
            const ids = dkOnDesk().map(o => o.u), used = new Set(), m = {};
            Object.keys(got).forEach(k => { const u = got[k]; const o = k.startsWith('h:') && DK.items.find(x => x.u === u); if (o && dkWin(k) && !dkSlots(o.id) && dkHoldOk(o.id).includes(k) && ids.includes(u) && !used.has(u)) { m[k] = u; used.add(u); } });   // 서랍장 = 칸에만   // 🛍️ 상품 창 (저절로 붙이지 않아요)
            DK_FNS.forEach(([k]) => { const u = got[k], o = u && DK.items.find(x => x.u === u), h = o && dkHold(o.id); if (!h || !h.all || !h.all.includes(k)) return; if (u && ids.includes(u) && !used.has(u)) { m[k] = u; used.add(u); } });   // 다꾸러가 연결한 것만 (처음엔 아무것도 · 저절로 붙이지 않아요 · 도련 10-31)
            return m;
        }
        const dkFnOf = u => { const m = deskFnMap(); return Object.keys(m).find(k => m[k] === u) || ''; };
        /* 🛠 🔗 기능 연결 창에서 고르기 (도련 10-30 · 모든 창 한 목록) : 한 창 = 한 자리 (다른 곳에 있던 그 창은 옮겨 와요)
           · 소품 전체 = 창 하나 (다시 고르면 빼기) · 서랍장 = 칸(s)마다 창 하나 (미리 정한 칸 · 도련 11-01) */
        function dkWinFree(k, m, keep) {                                          // 창 k 를 다른 자리에서 빼요 (keep = 남길 칸 'u|k')
            Object.keys(m).forEach(x => { if (x === k) delete m[x]; });
            const H = dkHomes(); let ch = false;
            Object.keys(H).forEach(u => { const L = H[u].filter(e => e.k !== k || `${u}|${k}` === keep); if (L.length !== H[u].length) { ch = true; if (L.length) H[u] = L; else delete H[u]; } });
            if (ch) dkHomesSet(H);
        }
        async function deskFnPick(fn, s) {                                        // 🛠 🔗 넣을 것 고르기 : s = 서랍 칸 (서랍장) · fn '' = 칸 비우기
            const el = DK.sel; if (!DK.edit || !el) return; const u = el.dataset.u, m = DK.editFn, o = DK.items.find(x => x.u === u), S = o && dkSlots(o.id);
            if (S) {
                const cur = (dkHomes()[u] || []).find(e => e.s === s); if (fn && cur && cur.k === fn) return;
                const H0 = dkHomes(), pe = fn && Object.keys(H0).map(x => H0[x].find(e => e.k === fn)).find(Boolean);   // 🏷 옮겨도 이름표는 따라가요
                if (fn && fn !== 'gd') dkWinFree(fn, m);                         // 다른 곳(다른 칸 포함)에 있으면 이리로 옮겨요 · 🗄️ 문구함은 여러 칸 (도련 11-05 · 칸마다 넣은 문구)
                const H = dkHomes(); H[u] = (H[u] || []).filter(e => e.s !== s); if (fn) H[u].push(Object.assign({ k: fn, s, r: S[s] }, pe && pe.tag ? { tag: dkzTagMove(pe.tag, pe.r, S[s]) } : {})); if (!H[u].length) delete H[u]; dkHomesSet(H);
                DK.zone = fn ? `${u}|${fn}` : null;
            } else if (m[fn] === u) delete m[fn];                                 // 소품 전체 = 풀기
            else { Object.keys(m).forEach(k => { if (m[k] === u) delete m[k]; }); dkWinFree(fn, m); m[fn] = u; }
            deskFnPaint(); dknPaintAll(); dkzPaint(); deskTipPaint(); deskEditPaint();
        }
        function deskFnPaint() {
            if (window.dkwDeskSoon) dkwDeskSoon();                                // ✏️ 책상 펜꽂이에 꽂힌 도구 (js/deskgd.js · 소품을 다시 그리거나 연결이 바뀌면)
            const m = deskFnMap(), of = {}; Object.keys(m).forEach(k => { of[m[k]] = k; });
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const fn = of[el.dataset.u], f = dkWin(fn), d = dkDef(el);
                DK_FNS.forEach(x => el.classList.remove('fn-' + x[0]));
                if (f) { el.dataset.fn = fn; if (f[4] === 'fn') el.classList.add('fn-' + fn); el.title = f[1]; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `${d.name} · ${f[1]}`); }
                else { delete el.dataset.fn; el.removeAttribute('title'); el.setAttribute('role', 'img'); el.setAttribute('aria-label', d.name || ''); }
            });
        }
        function deskFnItemName(fn) { const o = DK.items.find(x => x.u === deskFnMap()[fn]); return o ? dkName(o) : ''; }
        /* 기능 실행 = 숨긴 하단 메뉴 버튼을 대신 눌러요 (필기 붙이기 · 카페 · 다시 누르면 닫기 … 하단 메뉴와 똑같이)
           스티커 · 카페는 다이어리에 쓰는 거라 책상에 놓인 다이어리를 먼저 펴요 · 문구함은 펴지 않고 그대로 열어요 (꺼낼 때만 다이어리가 필요) · 🏪 기본상품 샵 · 📦 보관함은 바로 */
        function deskRun(fn) {
            if (fn && fn.startsWith('h:')) { dkHomeOpen(fn.slice(2)); return; }    // 🛍️ 상품 창 (그 종류 보관함)
            if (fn === 'shop') { setTimeout(() => window.shopSceneOpen ? shopSceneOpen() : window.openShelf && openShelf(), 0); return; }   // 🏪 가게 안으로 (js/shopscene.js)
            if (fn === 'edit') { setTimeout(deskEditOpen, 0); return; }
            if (fn === 'box') { setTimeout(deskBoxOpen, 0); return; }
            if ((fn === 'pc' || fn === 'gd') && window.dkwOpenFor && document.documentElement.classList.contains('desk-on')) { setTimeout(() => dkwOpenFor(''), 0); return; }   // ✏️ 🗄️ 문구가 든 곳 (펜꽂이 · 서랍은 소품을 누르면 그곳 · js/deskgd.js)   // 🗄️ 서랍장 문구함 칸 = 서랍이 열려요 (📱 폰은 예전 문구함 창)                // 📦 소품함 (다이어리를 띄우지 않아요)
            if (fn === 'skin' && window.dyOpen) { setTimeout(() => dyOpen('다이어리'), 0); return; }   // 📔 책상에서는 바로 다이어리 보관소 (배경지는 책상에서 못 써서 메뉴를 건너뛰어요 · 도련 10-28)
            const f = DK_FNS.find(x => x[0] === fn), b = f && document.querySelector('.toolbar .' + f[2]); if (!b) return;
            const go = () => { b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); b.click(); };
            if (!['skin', 'set', 'gd', 'sticker', 'cafe'].includes(fn) && !document.documentElement.classList.contains('desk-show')) { deskOpenDiary(); setTimeout(go, 620); }   // ⭐ 스티커 · ☕ 카페도 다이어리를 안 띄워요 (도련 10-28 · 책상 위 바인더가 공중에 뜨지 않게) · 📔 다이어리 · ⚙ 설정 · ✏️ 문구함은 다이어리를 띄우지 않아요 (도련 10-28)
            else setTimeout(go, 0);
        }
        /* 다이어리를 펴 둔 동안 : 소품은 다이어리 뒤라 직접 안 눌려요 → 빈 곳을 톡 한 자리에 기능 소품이 맨 앞에 보이면 그 기능 (js/drive.js) */
        /* 👆 그림 모양대로 누르기 (도련 10-28) : 소품 네모 칸이 아니라 '그림이 그려진 곳'만 그 소품이에요
           · 그림의 투명한 곳을 누르면 그 아래 소품(또는 책상)이 눌려요 → 큰 스탠드 뒤의 시계도 그림 전체가 버튼 · 사용자가 칠하거나 바꾼 그림도 자동
           · 그림마다 작은 투명도 지도(가로 최대 160칸)를 한 번 만들어 기억해요 · 테두리 근처는 조금 넉넉하게(주변 2칸) */
        const DK_HIT = new Map();                                                 // src → { w, h, a: Uint8Array } | 'wait'
        function dkHitMap(img) {
            const src = img.currentSrc || img.src; if (!src) return null;
            const m = DK_HIT.get(src); if (m && m !== 'wait') return m; if (m === 'wait') return null;
            if (!img.complete || !img.naturalWidth) { DK_HIT.set(src, 'wait'); img.addEventListener('load', () => { DK_HIT.delete(src); }, { once: true }); return null; }
            try {
                const k = Math.min(1, 160 / img.naturalWidth), w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
                const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, w, h);
                const d = x.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h); for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
                const r = { w, h, a }; DK_HIT.set(src, r); return r;
            } catch (e) { return null; }                                         // 읽을 수 없는 그림이면 네모 전체
        }
        function dkSolidAt(el, cx, cy) {                                         // 그 소품 그림이 (cx, cy) 화면 자리에 그려져 있나요
            if (el.classList.contains('dk-lt')) return !!(window.dlSolid && dlSolid(el, cx, cy));   // 💡 전구줄 = 줄 · 전구 위 (js/desklights.js)
            const img = el.querySelector(':scope > img'), r = (img || el).getBoundingClientRect();
            if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return false;
            const m = img && dkHitMap(img); if (!m) return true;
            const fx = el.classList.contains('dk-fl') ? r.right - cx : cx - r.left, px = Math.floor(fx / r.width * m.w), py = Math.floor((cy - r.top) / r.height * m.h);
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = px + dx, y = py + dy; if (x >= 0 && y >= 0 && x < m.w && y < m.h && m.a[y * m.w + x] > 40) return true; }
            return false;
        }
        function dkItemsAt(cx, cy) {                                              // 그 자리의 소품 (위에 보이는 것부터)
            const seen = new Set();
            return document.elementsFromPoint(cx, cy).map(e => e.closest && e.closest('#deskStage .desk-item')).filter(e => e && !seen.has(e) && seen.add(e));
        }
        (function dkHitWire() {                                                   // 투명한 곳을 누르면 그 아래 소품으로 넘겨요
            let off = [];
            const back = () => { off.forEach(e => { e.style.pointerEvents = ''; }); off = []; };
            document.addEventListener('pointerdown', ev => {
                if (ev.dkPass || !ev.target.closest || !ev.target.closest('#deskStage .desk-item')) return;
                const L = dkItemsAt(ev.clientX, ev.clientY), i = L.findIndex(e => dkSolidAt(e, ev.clientX, ev.clientY));
                if (i === 0) return;                                              // 맨 위 소품의 그림 위 = 그대로
                ev.stopPropagation(); ev.preventDefault();
                back(); off = i < 0 ? L : L.slice(0, i); off.forEach(e => { e.style.pointerEvents = 'none'; });
                const t = document.elementFromPoint(ev.clientX, ev.clientY); if (!t) { back(); return; }
                const n = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, clientX: ev.clientX, clientY: ev.clientY, screenX: ev.screenX, screenY: ev.screenY, pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: ev.isPrimary, button: ev.button, buttons: ev.buttons });
                try { if (ev.target.hasPointerCapture && ev.target.hasPointerCapture(ev.pointerId)) ev.target.releasePointerCapture(ev.pointerId); } catch (e) {}   // 📱 터치(아이패드)는 처음 누른 그림이 손가락을 붙잡아서 손 뗀 신호가 아래 소품에 안 가요 → 놓아 줘요 (도련 10-28 : 스탠드 뒤 시계 ⚙ 설정이 안 열림)
                n.dkPass = true; t.dispatchEvent(n);
                const end = () => { setTimeout(back, 60); removeEventListener('pointerup', end, true); removeEventListener('pointercancel', end, true); };
                addEventListener('pointerup', end, true); addEventListener('pointercancel', end, true);
            }, true);
        })();
        function deskTapAt(x, y) {
            if (!document.documentElement.classList.contains('desk-on') || DK.edit) return false;
            const top = [...document.querySelectorAll('#deskStage .desk-item')].filter(el => dkSolidAt(el, x, y))   // 그림 모양대로
                .sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
            if (!top) return false;
            if (window.dcTap && dcTap(top, x, y)) return true;
            if (dkHomeTap(top, x, y)) return true;
            if (!top.dataset.fn) return false;
            deskRun(top.dataset.fn); return true;
        }
        /* ⚙️ 설정 🪑 화면 칸 그리기 (js/drive.js deskModeSet · js/show.js 가 설정을 다시 읽을 때도 → 다른 기기에서 바뀐 소품도 여기서 다시) */
        function deskModeRender() {
            deskSyncItems();
            const mode = typeof deskModeGet === 'function' ? deskModeGet() : 'desk';
            document.querySelectorAll('#deskModePick [data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === mode));
            const box = document.getElementById('deskFnList'); if (!box) return;
            box.hidden = mode !== 'desk';
            box.innerHTML = '<button type="button" class="btn dk-box-open" onclick="deskEditFromSettings()">🛠 책상 꾸미기 <small>소품 배치 · 기능 연결</small></button>';
            if (document.getElementById('deskStage')) deskFnPaint();
        }
        function deskSyncItems() {                                                 // 드라이브 설정을 읽은 뒤 · 다른 기기에서 바뀌었으면 다시 그려요
            if (DK.drag || DK.edit || DK.filing || !document.getElementById('deskStage')) return;
            const prev = DK.seen; dkLoad();
            if (DK.seen !== prev) { deskItemsRender(); if (window.deskBoxRender) deskBoxRender(); }
            deskBagsPaint();                                                       // 🛍️ 봉투 · 처음 봉투 안내도 드라이브 것으로
            giftEnsure().then(() => { dkFilesFill(); if (window.gdFilesFill) gdFilesFill(); });
        }

        /* 🚪 이동 창 (도련 10-31) : 🏪 기본상품 샵 (가게 안에서는 🚪 내 방) + ☕ 카페 칸 전부 (카페 창 #svcCats 의 칸을 열 때마다 복사 · 새 칸이 생기면 저절로 · 알림 숫자도 그대로)
           칸 톡 = 이동 창 닫고 → 카페 칸이면 카페 창의 그 칸 · 준비중 · 따로 여는 것(인형 · 펫 …)은 그것만 */
        /* 📍 지금 있는 장소 = 이동 창 칸의 data-place 이름표와 같은 이름 (새 장소 = 여기 한 줄 + 칸에 이름표) */
        function deskHere() {
            if (window.shopSceneOn && shopSceneOn()) return 'shop';
            if (document.body.classList.contains('craft-on')) return 'craft';   // 🎨 다꾸 작업실 (js/craft.js)
            if (document.body.classList.contains('post-on')) return 'post';
            if (document.body.classList.contains('world-on')) return 'world';   // 🌳 말랑 광장 (js/world.js)
            if (document.body.classList.contains('tarot-on')) return 'tarot';
            if (document.body.classList.contains('arc-on')) return 'game';
            if (document.body.classList.contains('gacha-on')) return 'gacha';
            if (document.body.classList.contains('cal-on')) return 'cal';
            return 'room';
        }
        function deskMoveOpen() {
            const box = document.getElementById('moveCafe'), here = deskHere();
            document.querySelectorAll('#moveModal > .modal-content > .svc-cats > [data-place]').forEach(b => { b.hidden = b.dataset.place === here; });   // 📍 지금 있는 곳은 목록에서 빼요 (도련 10-31 · 규칙 하나 · 칸마다 data-place 이름표)
            const fill = () => {
                box.innerHTML = '';
                document.querySelectorAll('#svcCats > .svc-cat:not(.svc-extra):not([hidden])').forEach(b => {
                    if (b.dataset.place && b.dataset.place === here) return;
                    const c = b.cloneNode(true); c.removeAttribute('onclick'); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
                    const cat = /svcOpenCat/.test(b.getAttribute('onclick') || '');
                    const stay = /준비중/.test(b.textContent) || b.hasAttribute('data-keep');   // 🚧 (준비중) · 👭 모임방(새 창) = 이동 창 · 지금 장소 그대로 (도련 10-31)
                    c.addEventListener('click', () => { if (stay) { b.click(); return; } closeModal('moveModal'); if (window.dsClear) dsClear(); deskLeave(); if (window.shopSceneOn && shopSceneOn()) shopSceneClose(true); if (cat) openModal('serviceModal'); b.click(); });
                    box.appendChild(c);
                });
            };
            if (box) {
                fill();
                if (typeof svcDailyBadges === 'function') Promise.resolve(svcDailyBadges()).then(() => { if (getComputedStyle(document.getElementById('moveModal')).display !== 'none') fill(); });   // 🌷 물 주기 표시는 조금 늦게 와요
            }
            openModal('moveModal');
        }
        window.deskMoveOpen = deskMoveOpen;
        /* 🔽 오른쪽 위 메뉴 셋 (도련 11-01) : 🛠 책상 꾸미기 · ✂️ 스티커 만들기(→ 🎨 다꾸 작업실) · 📒 스티커 정리 · 한 개만 보이고 ▾ 를 누르면 나머지 둘
           다른 곳에 갔다 내 방으로 돌아올 때마다(deskGoRoom) 보이는 메뉴가 다음 것으로 돌아가요 (이 창이 열려 있는 동안만 기억 · 처음 = 책상 꾸미기) */
        const DTM_ITEMS = [['책상 꾸미기', () => deskRun('edit')], ['스티커 만들기', () => window.openCraft && openCraft()], ['스티커 정리', () => window.bkSortOpen && bkSortOpen()], ['오늘 쓸 스티커', () => window.stpOpen && stpOpen()]];   // 🍽 오늘 쓸 스티커 (js/stktray.js · 도련 11-01)
        const DTM = { i: 0 };
        function dtmPaint() {
            const m = document.getElementById('deskTopMenu'); if (!m) return;
            m.querySelector('.dtm-main').textContent = DTM_ITEMS[DTM.i][0];
            m.querySelector('.dtm-list').innerHTML = DTM_ITEMS.map((x, i) => i === DTM.i ? '' : `<button type="button" class="desk-shop-go" onclick="dtmRun(${i})">${x[0]}</button>`).join('');
        }
        function dtmToggle(on) {
            const m = document.getElementById('deskTopMenu'); if (!m) return;
            const L = m.querySelector('.dtm-list'), open = on === undefined ? L.hidden : on;
            L.hidden = !open; m.classList.toggle('open', open); m.querySelector('.dtm-tg').setAttribute('aria-expanded', String(open));
        }
        function dtmRun(i) { dtmToggle(false); const it = DTM_ITEMS[i]; if (it) deskTopGo(it[1]); }
        function dtmNext() { DTM.i = (DTM.i + 1) % DTM_ITEMS.length; dtmPaint(); }
        document.addEventListener('pointerdown', e => { const m = document.getElementById('deskTopMenu'); if (m && m.classList.contains('open') && !m.contains(e.target)) dtmToggle(false); }, true);
        window.DTM = DTM; window.dtmToggle = dtmToggle; window.dtmRun = dtmRun;
        function deskLeave() { if (window.closeCraft) closeCraft(); if (window.closeCalRoom) closeCalRoom(); if (window.closePostRoom) closePostRoom(); if (window.closeWorld) closeWorld(); if (window.closeTarotRoom) closeTarotRoom(); if (window.closeArcRoom) closeArcRoom(); if (window.closeGacha && document.body.classList.contains('gacha-on')) closeGacha(); }      // 📅 달력(벽)에서 다른 곳으로 = 달력을 떠나요
        function deskGoRoom() {                                                  // 🚪 내 방 = 어디서든 내 방 문을 지나 책상으로 (도련 10-31 · 가게는 가게 연출 · 그 밖 = roomGo)
            dtmNext();                                                           // 🔽 돌아올 때마다 오른쪽 위 메뉴가 다음 것으로 (도련 11-01)
            if (window.shopSceneOn && shopSceneOn()) { shopSceneClose(); return; }
            if (window.roomGo) roomGo(deskLeave); else deskLeave();
        }
        window.deskLeave = deskLeave; window.deskGoRoom = deskGoRoom;
        function deskBuild() {
            const bg = document.getElementById('deskBg'); if (!bg || bg.querySelector('#deskStage')) return;
            dkLoad();
            bg.innerHTML = `<div id="deskStage" class="desk-stage"><img class="desk-room" src="img/desk-wide.webp?v=20261009-831" alt="" draggable="false">
                <div class="dk-diary" id="deskDiary" aria-hidden="true"></div>   <!-- 📔 기준점만 (권 그림 = .dk-vol · dkVolsPaint) -->
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"></div></div>
                <div class="desk-top-r"><span class="dtm" id="deskTopMenu"><button type="button" class="dtm-tg" onclick="dtmToggle()" aria-label="다른 메뉴 보기" aria-expanded="false"><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5"/></svg></button><button type="button" class="desk-shop-go dtm-main" onclick="dtmRun(DTM.i)"></button><span class="dtm-list" hidden></span></span><button type="button" class="desk-shop-go" id="deskShopGo" onclick="deskTopGo(deskMoveOpen)" aria-label="이동">이동</button></div>`;
            const tr = bg.querySelector('.desk-top-r'); if (tr) { document.body.appendChild(tr); dtmPaint(); }   // 🪑 다이어리를 펼쳐도 보이게 (책상 그림 밖 · 맨 위 · 도련 10-31)   /* 🚪 오른쪽 위 이동 → 갈 곳 고르는 창 (index.html #moveModal · 도련 10-31 · 책상만 볼 때) */
            if (window.dsPaint) dsPaint();                                        // 🧱 벽지 · 🪵 책상 (js/deskskin.js)
            deskItemsRender();
            dkyApply();
            deskTipPaint(); deskModeRender();
        }
        /* 책상 위 소품을 목록대로 다시 그려요 */
        function deskItemsRender() {
            const st = document.getElementById('deskStage'); if (!st) return;
            deskSelect(null);
            st.querySelectorAll('.desk-item').forEach(el => el.remove());
            DK.base = {};
            const at = st.querySelector('.dk-diary');
            dkOnDesk().forEach(o => {
                const it = dkCat(o.id); DK.base[o.u] = { x: o.x, y: o.y };
                at.insertAdjacentHTML('beforebegin', deskItemHtml(it, o));
                deskWire(at.previousElementSibling);
                dkArtLoad(o);
            });
            DK.items.forEach(o => { if (o.at !== 'desk') dkArtLoad(o); });          // 📦 보관함의 칠한 소품 그림도
            if (window.dcApplyAll) dcApplyAll();                                  // 💡 불빛 · 🔢 숫자 (js/deskcustom.js)
            dknPaintAll(); dkVolsPaint(); deskZAll(); deskTick(); deskFnPaint(); deskFit(); deskBagsPaint(); if (window.dktPaint) dktPaint(); if (window.dlPaint) dlPaint();   // 💡 전구줄   // 🎀 마테 정리함 롤   // 📔 나머지 다이어리 권
        }
        /* 🎨 칠한 소품 (p: 1) = 종류 폴더 파일에 칠한 그림이 들어 있어요 (js/deskpaint.js) → 읽어서 그 소품 그림만 바꿔요 */
        const dkSrc = o => DK.art[o.u] || (dkCat(o.id) || {}).src || '';
        function dkArtPaint(u) { document.querySelectorAll(`[data-u="${u}"] > img, [data-art-u="${u}"]`).forEach(im => { im.src = DK.art[u]; }); }
        async function dkArtLoad(o) {
            if (!o.p || !o.c || DK.art[o.u]) { if (DK.art[o.u]) dkArtPaint(o.u); return; }
            const C = dkColl(o.id); if (!C) return;
            try { const it = await dkUnseal(await collItem(C, o.c)); if (it && it.u === o.u && typeof it.img === 'string') { DK.art[o.u] = it.img; dkArtPaint(o.u); } } catch (e) { console.warn('칠한 소품', e); }   // 다른 소품 파일(u 가 다름)이면 안 써요
        }
        /* 🛠 꾸미는 중에도 바로 저장해야 하는 것 (칠하기 · 받기) : 취소해도 남게 들어오기 전 모습에도 같이 넣어요 */
        /* 💾 소품 정보 저장 : 🛠 꾸미는 동안(커스텀 · 색칠 미리 보기)은 저장하지 않고 들고만 있다가 하단 ✔ 완료 때 한꺼번에 (취소 = 처음대로 · 도련 10-28 : 완료는 하나)
             sys = 알람이 울린 날처럼 꾸미기와 상관없는 기록 → 꾸미는 중에도 바로 (취소해도 남아요) */
        function dkPersist(it, sys) {
            if (!(DK.edit && DK.back)) { dkSave(); return; }
            if (!sys) return;
            const b = JSON.parse(DK.back.items), i = b.findIndex(x => x.u === it.u), rec = JSON.parse(JSON.stringify(it));
            if (i >= 0) b[i] = Object.assign(rec, { x: b[i].x, y: b[i].y, at: b[i].at }); else b.push(rec);   // 자리는 들어오기 전 그대로
            DK.back.items = JSON.stringify(b);
            dkItemsPut(b);
        }
        /* 고른 소품 위 버튼 : 🎨 칠하기 · 📦 보관함에 넣기 · 🗑 버리기 */
        function deskTipAct(a) { const el = DK.sel; if (!el) return; const u = el.dataset.u; deskSelect(null); if (a === 'paint') { if (window.dcOpen) dcOpen(u); else if (window.dpOpen) dpOpen(u); }   /* 🎨 꾸미기 창 (색칠 + 소품별 · js/deskcustom.js) */ else if (a === 'share') { if (window.ishSaveDesk) ishSaveDesk(u); } else if (a === 'box') deskPut(u, 'box'); else deskDiscard(u); }
        function dkFnBlock(u, what) {                                              // 기능 소품은 못 넣고 못 버려요 (🛠 꾸미기에서는 돼요 · 기능이 빠지고 확정 때 확인)
            if (DK.edit) { Object.keys(DK.editFn).forEach(k => { if (DK.editFn[k] === u) delete DK.editFn[k]; }); return false; }
            const fn = dkFnOf(u); if (!fn) return false;
            const f = DK_FNS.find(x => x[0] === fn), o = DK.items.find(x => x.u === u);
            if (window.showMsg) showMsg(`${dkName(o)}에는 ${f[3]} '${f[1]}' 기능이 붙어 있어서 ${what} 수 없어요.<br><small>🛠 책상 꾸미기에서 기능을 다른 소품으로 옮긴 뒤 해 주세요</small>`);
            return true;
        }
        function deskPut(u, where) {
            const o = DK.items.find(x => x.u === u); if (!o || o.at === where) return;
            if (where === 'box' && dkFnBlock(u, '보관함에 넣을')) return;
            if (where === 'desk') { const c = dkCat(o.id); o.x = c.x; o.y = c.y; }           // 꺼내면 그 소품 처음 자리에
            o.at = where; dkSave(); deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender(); deskEditPaint();
            if (DK.edit && where === 'desk') { const el = document.querySelector(`#deskStage .desk-item[data-u="${u}"]`); if (el) deskSelect(el); }   // 놓은 소품을 바로 골라 줘요
        }
        async function deskDiscard(u) {                                          // 🗑 버리기 → 휴지통 30일 (js/bin.js · 도련 11-02 · 파일은 그대로 두고 되살릴 수 있어요)
            const o = DK.items.find(x => x.u === u); if (!o || dkFnBlock(u, '버릴')) return;
            if (!window.binAsk || !await binAsk(dkName(o))) return;
            DK.items = DK.items.filter(x => x.u !== u); dkSave();
            deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender(); deskEditPaint();
            if (DK.edit) { if (window.showMsg) showMsg('🗑 버릴게요.<br><small>하단 ✔ 완료를 누르면 휴지통으로 가요 (✕ 취소 = 그대로)</small>'); return; }   // 🛠 꾸미는 중이면 확정할 때
            await dkBin([o]); binTold('');
        }
        /* 🗑 휴지통으로 (파일 · 🎁 선물은 그대로 기억 → 되살리면 소품함으로) */
        async function dkBin(L) {
            for (const o of L) await binAdd({ k: 'dk', id: o.u, o: Object.assign({ u: o.u, id: o.id }, o.c ? { c: o.c } : {}, o.g ? { g: 1 } : {}) });
            if (L.some(o => o.g)) giftWrite();                                   // 🎁 선물이면 선물.json 에서 빠져요 (되살리면 다시)
        }
        (window.BIN_PRE = window.BIN_PRE || {}).dk = {
            name: e => `🪑 ${(dkCat(e.o.id) || {}).name || '책상 소품'}`,
            restore: e => {
                if (!dkCat(e.o.id)) throw new Error('gone');
                const back = Object.assign({ at: 'box', x: 0, y: 0 }, e.o);
                if (!DK.items.some(x => x.u === back.u)) DK.items.push(back);
                if (DK.edit && DK.back) { const b = JSON.parse(DK.back.items); if (!b.some(x => x.u === back.u)) { b.push(back); DK.back.items = JSON.stringify(b); } }
                dkSave(); if (back.g) giftWrite();
                deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender();
            },
            purge: e => { if (!e.o.g) dkFileDel(e.o); }                          // 🔥 종류 폴더 파일 (🎁 선물은 선물.json 에서 이미 빠졌어요)
        };
        /* 🏪 기본상품 샵에서 받기 (js/basket.js) : 'have' = 이미 있어요 (묻고 나서 force) · 'ok' = 📦 보관함에 넣었어요 */
        function deskGive(id, force) {
            if (!dkCat(id)) return 'no';
            if (!force && DK.items.some(o => o.id === id)) return 'have';
            const it = deskReceive(id, 'basic'); window.deskLastGiven = { u: it && it.u, t: Date.now() };   // 🛍️ 봉투 카드가 이 소품을 기억해요
            return 'ok';
        }
        /* 새 소품 하나 들어오기 (🏪 기본상품 샵 · 📥 공유 파일) = 무조건 이 계정의 새 1개 : 새 u + 🔐 내 열쇠로 종류 폴더 파일 · img = 칠한 그림(공유받은 것) */
        function deskReceive(id, from, img) {
            const c = dkCat(id); if (!c) return null;
            const it = { u: id + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), id, at: 'box', x: c.x, y: c.y };
            if (img) { it.p = 1; DK.art[it.u] = img; }
            DK.items.push(it);
            const keep = () => {                                                  // 🛠 꾸미는 중에 받은 것은 취소해도 남아요 (받은 것은 바로 저장)
                if (!(DK.edit && DK.back)) return false;
                const b = JSON.parse(DK.back.items), i = b.findIndex(x => x.u === it.u);
                if (i >= 0) b[i] = JSON.parse(JSON.stringify(it)); else b.push(JSON.parse(JSON.stringify(it)));
                DK.back.items = JSON.stringify(b);
                dkItemsPut(b);
                return true;
            };
            keep();
            const done = () => { const cur = DK.items.find(x => x.u === it.u); if (cur && it.c) cur.c = it.c; if (it.c && !keep()) dkSave(); };
            const C = dkColl(id);
            if (img && C) {                                                       // 🗂 칠한 그림째 파일 하나
                dkAdding.add(it.u);
                dkSeal({ u: it.u, id, from, img }).then(sl => collAdd(C, sl, '', { id })).then(cid => { it.c = cid; done(); })
                    .catch(e => console.warn('소품 파일', e)).finally(() => dkAdding.delete(it.u));
            } else dkFileAdd(it, from).then(done);                                // 🗂 종류 폴더에 파일 하나
            dkSave(); deskModeRender(); if (window.deskBoxRender) deskBoxRender(); deskEditPaint();
            return it;
        }
        const deskShopList = () => (window.prodShelf ? prodShelf('책상소품') : []).map(dkItemOf).filter(Boolean).map(d => ({ id: d.id, name: d.name, src: d.src, wall: !!d.wall, kind: d.kind, kn: d.kn, ki: d.ki }));   // 🏪 샵 = 늘 서버 모습 · kind = 코너 칸 (js/basket.js)
        /* 📦 소품 보관함 창 */
        /* 🗂 보관함 종류 칸 (도련 10-27 · 드라이브 종류 폴더와 같은 이름 : 서랍장 · 시계 · 책꽂이 … · 많아져도 찾기 쉽게) : 가진 종류만 · [이름 개수] */
        const dkKinds = () => [...new Set((typeof DESK_DIRS !== 'undefined' ? Object.keys(DESK_DIRS) : []).concat(DESK_ITEMS.map(d => d.kind)))];   // 🆕 새 종류도 (도련 11-06)
        const dkKindOf = o => (dkCat(o.id) || {}).kind || '';
        function dkTabs(list, key, fn) {                                          // → { html, kind, rows } · key = DK 에 기억할 칸 이름
            const have = dkKinds().filter(k => list.some(o => dkKindOf(o) === k));
            if (!have.includes(DK[key])) DK[key] = have[0] || '';
            const k = DK[key];
            return { kind: k, rows: list.filter(o => dkKindOf(o) === k),
                html: have.length ? have.map(x => `<button type="button" class="dk-tab${x === k ? ' on' : ''}" onclick="${fn}('${x}')">${dkKN(x)}<small>${list.filter(o => dkKindOf(o) === x).length}</small></button>`).join('') : '' };
        }
        function deskBoxTab(k) { DK.boxKind = k; DK.boxSel = null; deskBoxRender(); requestAnimationFrame(() => window.deskBoxTabShow && deskBoxTabShow()); }
        function deskTrayTab(k) { DK.trayKind = k; deskEditPaint(); }
        /* 📦 소품함 = 게임 인벤토리 (도련 10-28 시안) : 위 = 종류 탭(소품 그림) · 칸 = 내 소품 (🪑 민트 = 책상 위 · 연핑크 = 보관 중 · 보라 = 고른 것)
           · 첫 칸 ⊘ = 그 종류를 책상에서 모두 넣기 · 아래 = 넣기 / 책상에 놓기 · 🗑 버리기 · 🏪 받기 · 💻 책상에서는 오른쪽에 떠서 책상을 보며 꺼내요 */
        const DK_BOX_MIN = 15;   // 3칸 × 5줄 (B : 왼쪽 목록 옆 · 도련 10-28)                                                    // 칸이 모자라 보이지 않게 빈칸을 채워요
        function deskBoxRender() {                                                // B : 왼쪽 = 종류 세로 목록(따로 스크롤) · 오른쪽 = 칸(따로 스크롤) · 도련 10-28
            const box = document.getElementById('deskBoxList'); if (!box) return;
            const keep = box.querySelector('.iv-side'), sTop = keep ? keep.scrollTop : null, gTop = (box.querySelector('.iv-in') || {}).scrollTop || 0;
            const kinds = dkKinds().filter(k => DESK_ITEMS.some(d => d.kind === k)), SK = window.dsBoxCells ? [['wallpaper', '벽지'], ['desktop', '책상']] : [];   // 다른 칸처럼 글씨만 (도련 10-28)   // 🧱 🪵 = js/deskskin.js
            if (DK.boxKind !== 'all' && !kinds.includes(DK.boxKind) && !SK.some(x => x[0] === DK.boxKind)) DK.boxKind = 'all';
            const HB = deskBagHold(), IT = HB && HB.u.size ? DK.items.filter(o => !HB.u.has(o.u)) : DK.items;   // 🛍️ 봉투 속 소품은 꺼낼 때까지 없어요
            const k = DK.boxKind, rows = k === 'all' ? IT.slice() : IT.filter(o => dkKindOf(o) === k);
            if (DK.boxSel && !rows.some(o => o.u === DK.boxSel)) DK.boxSel = null;
            const side = [['all', '전체', IT.length]].concat(kinds.map(kk => [kk, dkKN(kk), IT.filter(o => dkKindOf(o) === kk).length]))
                .concat(SK.map(([kk, n]) => [kk, n, dsCount(kk)]))
                .map(([kk, n, c], i) => `<button type="button" class="iv-tab${kk === k ? ' on' : ''}${i === 0 ? ' all' : ''}" onclick="deskBoxTab('${kk}')"><span>${n}</span><i>${c || ''}</i></button>`).join('');   // ✨ 새 모습 (js/snap.js · 있을 때만)
            if (SK.some(x => x[0] === k)) {                                       // 🧱 벽지 · 🪵 책상 : 톡 = 쓰기 · 🗑 버리기 (js/deskskin.js)
                const cs = dsBoxCells(k);
                box.innerHTML = `<div class="iv-body"><div class="iv-side">${side}</div><div class="iv-box"><div class="iv-in">${cs.join('')}${'<span class="iv-c empty"></span>'.repeat(Math.max(0, DK_BOX_MIN - cs.length))}</div>`
                    + `<div class="iv-name"><b>${dsName(k)}</b><small>톡 = ${k === 'wallpaper' ? '벽 전체에 바르기' : '책상 바꾸기'}${DK.edit ? ' · ✔ 완료 때 저장' : ''}</small></div></div></div>`;
                const sd2 = box.querySelector('.iv-side'); if (sd2 && sTop != null) sd2.scrollTop = sTop;
                return;
            }
            const cells = rows.map(o => `<button type="button" class="iv-c ${o.at === 'desk' ? 'desk' : 'box'}${o.u === DK.boxSel ? ' sel' : ''}" title="${dkName(o)}" onclick="deskBoxPick('${o.u}')"><img src="${dkSrc(o)}" data-art-u="${o.u}" alt="" loading="lazy">${o.at === 'desk' ? '<em>🪑</em>' : ''}</button>`);
            const none = k === 'all' ? '' : `<button type="button" class="iv-c no" title="책상에서 모두 넣기" onclick="deskBoxAllIn()"><b>⊘</b></button>`;
            const fill = Math.max(0, DK_BOX_MIN - (none ? 1 : 0) - cells.length);
            const o = rows.find(x => x.u === DK.boxSel);
            const act = o ? (o.at === 'box' ? `<button type="button" class="btn primary" onclick="deskPut('${o.u}', 'desk')">🪑 책상에 놓기</button>` : `<button type="button" class="btn" onclick="deskPut('${o.u}', 'box')">📦 넣기</button>`)
                + `<button type="button" class="btn iv-del" onclick="deskDiscard('${o.u}')" aria-label="휴지통">🗑</button>` : '';
            box.innerHTML = `<div class="iv-body"><div class="iv-side">${side}</div><div class="iv-box"><div class="iv-in">${none}${cells.join('')}${'<span class="iv-c empty"></span>'.repeat(fill)}</div>`
                + `<div class="iv-name">${o ? `<b>${dkName(o)}</b><small>${o.at === 'desk' ? '🪑 책상 위' : '📦 보관 중'}</small>` : ''}</div>${o ? `<div class="iv-foot">${act}</div>` : ''}</div></div>`;
            const sd = box.querySelector('.iv-side'); if (sd && sTop != null) sd.scrollTop = sTop;   // 왼쪽 목록은 보던 자리 그대로
            const g = box.querySelector('.iv-in'); if (g && DK.boxSel) g.scrollTop = gTop;
        }
        window.deskBoxTabShow = deskBoxTabShow;
        function deskBoxTabShow() { const t = document.querySelector('#deskBoxList .iv-tab.on'), sd = t && t.closest('.iv-side'); if (!t || !sd) return; if (t.offsetTop < sd.scrollTop || t.offsetTop + t.offsetHeight > sd.scrollTop + sd.clientHeight) sd.scrollTop = t.offsetTop - sd.clientHeight / 2; }
        function deskBoxPick(u) { DK.boxSel = DK.boxSel === u ? null : u; deskBoxRender(); }
        function deskBoxAllIn() {                                                // ⊘ 이 종류를 책상에서 모두 보관함으로 (기능 소품은 그대로)
            const L = DK.items.filter(o => dkKindOf(o) === DK.boxKind && o.at === 'desk' && !dkFnOf(o.u));
            if (!L.length) { if (window.showMsg) showMsg('책상 위에 넣을 수 있는 소품이 없어요.<br><small>기능이 연결된 소품은 🛠 책상 꾸미기에서 바꿔요</small>'); return; }
            L.forEach(o => { o.at = 'box'; }); dkSave(); deskItemsRender(); deskModeRender(); deskBoxRender(); deskEditPaint();
        }
        function deskBoxOpen() {                                                  // 📦 소품함 (💻 책상 · ▤ 하단 메뉴 모두 같은 창)
            deskBoxRender(); if (window.openModal) openModal('deskBoxModal'); requestAnimationFrame(deskBoxTabShow);
        }
        /* ---------- 🛠 책상 꾸미기 (도련 10-27) ---------- */
        function deskEditOpen() {
            const H = document.documentElement; if (!H.classList.contains('desk-on') || DK.edit) return;
            if (H.classList.contains('desk-show')) { dkFoldShut(); H.classList.remove('desk-show'); }   // 펴 둔 다이어리는 접어서 책상에   // 펴 둔 다이어리는 책상에 내려놓고 (펼친 모양은 보일 때 그려요)
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'flex' || m.style.display === 'block') { const x = m.querySelector('.mt-x'); if (x) x.click(); else m.style.display = 'none'; } });
            DK.back = { items: JSON.stringify(DK.items), fn: JSON.stringify(deskFnMap()), home: JSON.stringify(dkHomes()) };   // 취소하면 이대로 (👆 칸 · 칸 이름표도)
            DK.editFn = JSON.parse(DK.back.fn); DK.edit = true;
            if (window.dsEditStart) dsEditStart();                                // 🧱 🪵 벽지 · 책상도 완료 때 저장 (js/deskskin.js)
            DK.volEdit = {}; dkyApply();                         // 📔 다이어리 자리 · 모습 = 모든 권 같은 틀 (.dk-vol · 펼쳐 볼 권도 · 도련 10-30)
            H.classList.add('desk-edit');
            deskSelect(null); deskFnPaint(); deskEditPaint();
            dkEditHello();                                                        // ✨ '꾸미기 시작!' 리본 (도련 10-28)
            deskBoxOpen();                                                        // 📦 소품함도 같이 (도련 11-04)
        }
        function dkEditHello() {                                                  // 🎀 리본이 톡 떴다가 스르르 (1.3초)
            const old = document.getElementById('dkeHello'); if (old) old.remove();
            const d = document.createElement('div'); d.id = 'dkeHello'; d.className = 'dke-hello'; d.setAttribute('aria-hidden', 'true');
            d.innerHTML = '<i>✨</i><b>🛠 꾸미기 시작!</b><i>✨</i>'; document.body.appendChild(d);
            setTimeout(() => d.remove(), 1500);
        }
        function deskEditFromSettings() { if (window.closeModal) closeModal('settingsModal'); deskEditOpen(); }
        function deskEditEnd(ok) {
            if (!DK.edit) return;
            if (window.closeModal) closeModal('deskBoxModal');
            if (ok) {
                /* 기능을 하나도 연결하지 않아도 ✔ 확인 돼요 (도련 10-31 · 🛠 책상 꾸미기는 책상 오른쪽 위 버튼으로 늘 열려요) */
                const fn = DK.editFn, gone = JSON.parse(DK.back.items).filter(b => !DK.items.some(x => x.u === b.u));
                DK.edit = false; dkSave();
                if (gone.length) dkBin(gone).then(() => binTold(''));   // 🗑 버린 소품 → 휴지통 (js/bin.js)
                if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, fn);
                dkArtCommit();                                                    // 🎨 색칠 · 🖼 사진 미리 보기 → 진짜 저장 (💾 저장 중)
            } else {
                DK.edit = false; DK.items = JSON.parse(DK.back.items); DK.seen = DK.back.items;
                if (DK.back.home !== JSON.stringify(dkHomes())) dkHomesSet(JSON.parse(DK.back.home));   // 👆 칸 고친 것 되돌리기
                dkArtUndo();                                                      // 🎨 색칠 미리 보기는 처음 그림으로
            }
            DK.editFn = null; DK.back = null;
            if (window.dsEditEnd) dsEditEnd(!!ok);                                // 🧱 🪵 완료 = 저장 · 취소 = 처음대로
            { const VE = DK.volEdit; DK.volEdit = null; dkvMenu(null);
              if (ok && VE && typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, Object.assign(dkyMap(), VE));   /* 권마다 자리 */ dknPanel(false); dkyApply(); }
            document.documentElement.classList.remove('desk-edit'); dkSelPaint();
            deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender();
        }
        /* 위 막대 (확정 가능 여부) · 아래 📦 보관함 줄 */
        /* 🎨 색칠 · 🖼 사진 미리 보기 (도련 10-28) : 창을 닫으면 책상에 칠한 모습만 보여 주고 (어울리나 전체로 보기) · 하단 ✔ 완료 때 파일에 저장 · ✕ 취소 = 처음 그림
             DK.artPend { u: 칠한 그림 } · DK.artOld { u: 칠하기 전 그림(없으면 null) } */
        function dkArtDraft(o, url) {
            if (!DK.edit) return window.dpSave ? dpSave(o, url) : null;           // 꾸미기 밖이면 바로 저장
            DK.artPend = DK.artPend || {}; DK.artOld = DK.artOld || {};
            if (!(o.u in DK.artOld)) DK.artOld[o.u] = DK.art[o.u] || null;
            DK.artPend[o.u] = url; DK.art[o.u] = url; dkArtPaint(o.u);
            if (window.deskBoxRender) deskBoxRender();
        }
        function dkArtUndo() {
            const old = DK.artOld || {}; Object.keys(old).forEach(u => { if (old[u]) DK.art[u] = old[u]; else delete DK.art[u]; dkArtPaint(u); });
            DK.artPend = DK.artOld = null;
        }
        async function dkArtCommit() {
            const P = DK.artPend || {}, L = Object.keys(P).map(u => [DK.items.find(x => x.u === u), P[u]]).filter(x => x[0]);   // 버린 소품은 빼고
            DK.artPend = DK.artOld = null; if (!L.length) return;
            if (window.saveBusy) saveBusy('💾 꾸민 소품 저장 중…');
            let bad = 0; for (const [o, url] of L) { try { await dpSave(o, url); } catch (e) { console.warn(e); bad++; } }
            if (window.saveBusy) await saveBusy(false);
            if (bad && window.showMsg) showMsg('⚠ 꾸민 소품을 저장하지 못했어요.<br><small>인터넷 연결을 확인하고 다시 꾸며 주세요</small>');
        }
        window.dkArtDraft = dkArtDraft;
        function deskEditPaint() {
            dkSnapBtn();
            const bar = document.getElementById('deskEditBar'), tray = document.getElementById('deskEditTray'); if (!bar || !tray) return;
            if (!DK.edit) return;
            const all = DK.items.filter(o => o.at === 'box'), T = dkTabs(all, 'trayKind', 'deskTrayTab'), L = T.rows;
            tray.innerHTML = (T.html ? `<div class="dk-tabs dke-tabs"><b class="dke-tt">📦 보관함</b>${T.html}</div>` : '') + `<div class="dke-row">${T.html ? '' : '<b class="dke-tt">📦 보관함</b>'}` + (L.length ? L.map(o => `<button type="button" class="dke-it" onclick="deskPut('${o.u}', 'desk')" title="책상에 놓기"><img src="${dkSrc(o)}" data-art-u="${o.u}" alt=""><small>${dkName(o)}</small></button>`).join('') : '<small class="dke-none">비어 있어요 · 소품을 고르고 📦 넣기</small>')
                + `<button type="button" class="dke-shop" onclick="deskEditShop()">🏪 기본상품 샵</button><button type="button" class="dke-shop" onclick="ishPick()">📥 불러오기</button></div>`;
        }
        function deskEditShop() { if (window.openShelf) { openShelf(); shOpenKind('desk'); } }   // 받으면 바로 아래 보관함 줄에 (꾸미기는 그대로)
        document.addEventListener('keydown', ev => { if (DK.edit && ev.key === 'Escape' && !document.querySelector('.modal[style*="flex"], .modal[style*="block"]')) deskEditEnd(false); });
        /* 물건을 올릴 수 있는 면들 (화면에 있는 소품 기준 · 그림 px) */
        function deskSurfs(skip) {
            const out = [];
            document.querySelectorAll('#deskStage .desk-item').forEach(o => {
                if (o === skip) return; const d = dkDef(o); if (!d.surf) return;
                const L = parseFloat(o.style.left), T = parseFloat(o.style.top);
                d.surf.forEach(([y, x0, x1]) => out.push({ el: o, y: T + y, x0: L + x0, x1: L + x1 }));
            });
            return out;
        }
        function deskOn(el, surfs) {                                              // 이 물건이 올라가 있는 면 (조금 어긋나도 OK)
            const L = parseFloat(el.style.left), T = parseFloat(el.style.top), w = parseFloat(el.style.width), h = parseFloat(el.style.height), b = T + h, cx = L + w / 2;
            return (surfs || deskSurfs(el)).find(s => s.el !== el && b >= s.y - 8 && b <= s.y + 14 && cx >= s.x0 && cx <= s.x1) || null;
        }
        /* 앞뒤 : 아래쪽(앞)에 놓인 것이 앞 · 벽에 건 것은 늘 뒤 · 다른 소품 위에 올린 것은 그 소품 바로 앞 */
        /* 앞뒤 (도련 10-29 · 사실적으로) : 모든 소품 + 📔 다이어리 + 앞벽을 한 줄로 세워 차례대로 z
           - 벽에 건 것 < 책상 위 (바닥이 아래일수록 앞) · 다른 소품 위에 올린 것 = 그 소품 바로 앞 (같은 면 위끼리는 바닥 순서)
           - 담는 소품 안 = 담는 소품 → 안에 든 것(바닥 순서) → 앞벽 → 위에 올린 것 · 다이어리도 똑같이 (늘 맨 앞이 아니에요) */
        function deskZAll() { dkLayers(); }
        /* 🧺 넣을 수 있는 소품 (도련 10-29 · 사실적으로 · 자유롭게) : 소품 정보에 front(앞벽 마스크) + mouth(입구)가 있으면 = '담는 소품'
           - 넣는 것 = 책상 위 모든 소품(벽에 건 것 · 다른 담는 소품은 빼고) + 📔 다이어리 : 바닥 가운데가 입구 안이면 담는 소품과 앞벽 사이
           - 여러 개 = 바닥이 아래인 것이 앞 · 담는 소품을 옮기면 안에 든 것도 같이 · 크기 · 자리는 사용자 마음 (맞춰 주지 않아요)
           - 앞벽 = 같은 그림을 앞벽 마스크로 잘라 한 겹 더 (칠한 그림도 그대로) · 안에 든 게 있을 때만 */
        const dkIsBox = el => { const d = dkDef(el); return !!(d.front && d.mouth) && d.hold !== 'tape'; };   // 🎀 마테 정리함 앞벽은 롤만 가려요 (소품을 담지 않아요)
        function dkBoxAt(x, y, skip) {
            let best = null;
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                if (el === skip || !dkIsBox(el)) return;
                const L = parseFloat(el.style.left), T = parseFloat(el.style.top), w = parseFloat(el.style.width), h = parseFloat(el.style.height), [m0, m1, m2] = dkDef(el).mouth;
                if (x >= L + w * m0 / 100 && x <= L + w * m1 / 100 && y >= T + h * m2 / 100 && y <= T + h + 2 && (!best || +el.style.zIndex > +best.style.zIndex)) best = el;
            });
            return best;
        }
        /* 끄는 동안 : 입구 폭 안 · 앞벽 위에서 바구니 바닥보다 조금 아래(6px)까지 = 안에 넣는 것 → 바닥에 닿게 (바닥 밑으로 빠지지 않아요 · 도련 10-29 : 다이어리가 살짝 아래로 놓여 안 들어가던 것) */
        function dkBoxFloor(x, y, skip) {
            let r = null;
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                if (el === skip || !dkIsBox(el)) return;
                const L = parseFloat(el.style.left), T = parseFloat(el.style.top), w = parseFloat(el.style.width), h = parseFloat(el.style.height), [m0, m1, m2] = dkDef(el).mouth;
                if (x >= L + w * m0 / 100 && x <= L + w * m1 / 100 && y >= T + h * m2 / 100 && y <= T + h + 6 && (!r || +el.style.zIndex > +r.el.style.zIndex)) r = { el, y: Math.min(y, T + h - 3) };
            });
            return r ? r.y : y;
        }
        const dkItemBox = el => (el.classList.contains('wall') || dkIsBox(el)) ? null : dkBoxAt(parseFloat(el.style.left) + parseFloat(el.style.width) / 2, parseFloat(el.style.top) + parseFloat(el.style.height), el);
        function dkLayers() {
            const stg = document.getElementById('deskStage'); if (!stg) return;
            const items = [...stg.querySelectorAll('.desk-item, .dk-vol')], dy = null, surfs = deskSurfs(null);   // 📔 다이어리 권도 소품처럼 (안 · 위 · 바닥 순서)
            const bot = el => parseFloat(el.style.top) + parseFloat(el.style.height);
            const par = new Map();                                                // 무엇의 [안 'in' | 위 'on'] 인지
            items.forEach(el => { const b = dkItemBox(el); if (b) { par.set(el, { el: b, k: 'in' }); return; } const on = deskOn(el, surfs); if (on) par.set(el, { el: on.el, k: 'on' }); });
            const st = null;
            const keyMemo = new Map(), bOf = el => el === dy ? st.y : bot(el);
            const key = (el, d) => {                                              // 사전 순서로 비교하는 자리 열쇠
                if (keyMemo.has(el)) return keyMemo.get(el);
                const p = d < 6 ? par.get(el) : null;
                const k = p ? key(p.el, d + 1).concat([p.k === 'in' ? 1 : 3, bOf(el)]) : [el !== dy && el.classList.contains('wall') ? -1 : 0, bOf(el)];
                keyMemo.set(el, k); return k;
            };
            const fronts = new Map();                                             // 담는 소품 → 안에 든 게 있나
            par.forEach(p => { if (p.k === 'in') fronts.set(p.el, true); });
            const list = items.map(el => ({ el, k: key(el, 0) }));
            fronts.forEach((v, b) => list.push({ el: b, front: 1, k: key(b, 0).concat([2]) }));
            const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { if (a[i] === undefined) return -1; if (b[i] === undefined) return 1; if (a[i] !== b[i]) return a[i] - b[i]; } return 0; };
            list.sort((a, b) => cmp(a.k, b.k));
            /* 🗂 손으로 고른 레이어 (lz = 겹친 것 몇 개만큼 앞 + / 뒤 -) : 자동 순서에서 겹친 것들만 세어 옮겨요 (안 겹친 건 앞뒤가 안 보여서) */
            const rectOf = o => o.el.getBoundingClientRect();
            const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
            DK.lzDone = new Map();
            list.filter(o => !o.front).forEach(o => {
                const lz = o.el.classList.contains('dk-vol') ? +(dkvPos(o.el.dataset.b).lz || 0) : +((DK.items.find(x => x.u === o.el.dataset.u) || {}).lz || 0); if (!lz) return;
                let i = list.indexOf(o), n = 0; const r = rectOf(o), d = Math.sign(lz); list.splice(i, 1);
                for (let j = d > 0 ? i : i - 1; j >= 0 && j < list.length && n < Math.abs(lz); j += d) if (hit(r, rectOf(list[j]))) { n++; i = d > 0 ? j + 1 : j; }
                list.splice(i, 0, o); DK.lzDone.set(o.el, n * d);
            });
            const fz = new Map();
            list.forEach((o, i) => { const z = 10 + i * 2; if (o.front) fz.set(o.el, z); else o.el.style.zIndex = DK.pull && DK.pull.has(o.el) ? 8900 : z; });
            const keep = new Set();
            items.forEach(el => {
                if (!dkIsBox(el)) return; const d = dkDef(el), u = el.dataset.u, on = fz.has(el); keep.add(u);
                let f = [...stg.querySelectorAll('.dk-front')].find(x => x.dataset.fu === u);
                if (!f) { f = document.createElement('div'); f.className = 'dk-front'; f.dataset.fu = u; f.innerHTML = `<i class="dk-fm"><img data-art-u="${u}" alt="" draggable="false" crossorigin="anonymous"></i>`; f.style.setProperty('--fm', `url("${new URL(d.front, location.href).href}")`); el.after(f); }   // 마스크 주소는 css 파일 기준이 아니라 이 페이지 기준으로
                const im = f.querySelector('img'), src = el.querySelector(':scope > img').src; if (im.src !== src) im.src = src;
                Object.assign(f.style, { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height, zIndex: on ? fz.get(el) : 0, display: on ? '' : 'none' });
                f.querySelectorAll('.dkn-tag').forEach(x => x.remove()); if (on) el.querySelectorAll(':scope > .dkn-tag').forEach(tg => f.appendChild(tg.cloneNode(true)));   // 🏷 기능 라벨이 앞벽에 가리지 않게 한 장 더
            });
            stg.querySelectorAll('.dk-front').forEach(f => { if (!keep.has(f.dataset.fu)) f.remove(); });
            if (dy) dy.classList.toggle('in-box', !!(par.get(dy) && par.get(dy).k === 'in'));
        }
        function deskLayer(d) {                                                   // 🛠 고른 소품 ⬆ 앞으로 · ⬇ 뒤로 · ↺ 자동
            const el = DK.sel, it = el && DK.items.find(x => x.u === el.dataset.u); if (!it) return;
            if (!d) delete it.lz; else { it.lz = (it.lz || 0) + d; dkLayers(); const got = (DK.lzDone && DK.lzDone.get(el)) || 0; if (got !== it.lz) it.lz = got; if (!it.lz) delete it.lz; }   // 더 갈 데가 없으면 그대로
            dkLayers(); deskTipPaint();
        }
        window.deskLayer = deskLayer;
        /* 🛍️ 가게에서 사 온 봉투 (도련 10-30) : 기본상품 샵 가게에서 산 것이 봉투에 담겨 책상 앞쪽에 똑바로 놓여요 (끝없이 · 저장 = 'diary_desk_bags')
           - 봉투 톡 = 봉투 속 상품 카드 → 카드를 아무 책상 소품에 끌어다 넣으면 그 소품이 그 상품 종류의 집 ('diary_desk_home' {u: [{ k: 종류, r: 누르는 곳 | null, tag }]})
           - 👆 한 소품에 여러 상품 (도련 10-30 · 서랍마다 다른 종류) : 첫 상품 = 소품 전체(r null) · 두 번째부터 [취소] [바꾸기] [➕ 추가]
             추가 = 다꾸러가 소품 그림 위에 누르는 곳을 직접 그려요 (앱이 알아서 정하지 않아요 · r = [l, t, r, b] % ) · 칸마다 이름표 · 고치기 · 빼기는 🛠 책상 꾸미기에서 칸을 톡
           - 집이 된 소품을 톡 = 그 종류 창 (기능도 있으면 고르기) · 🪑 책상 소품을 산 거면 끌어다 놓은 자리에 그 소품이 바로 놓여요
           - 다 꺼내면 봉투는 사라져요 · 진짜 상품은 살 때 이미 보관함에 들어가 있어요 (봉투는 정리하는 재미) */
        const DKB_KEY = 'diary_desk_bags', DKB_LOCAL = 'malang_desk_bags', DKH_KEY = 'diary_desk_home', DKH_LOCAL = 'malang_desk_home';
        const DKH_NAMES = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', tk: '떡메모지', leaf: '속지', memo: '메모지', gd: '문구', tool: '다이어리', bg: '배경지', desk: '책상 소품' };
        const dkBags = () => { const v = typeof prefGet === 'function' ? prefGet(DKB_KEY, DKB_LOCAL) : null; return Array.isArray(v) ? v.filter(b => b && Array.isArray(b.it) && b.it.length) : []; };
        const dkBagsSet = v => { if (typeof prefSet === 'function') prefSet(DKB_KEY, DKB_LOCAL, v); };
        const dkHomes = () => {
            const v = typeof prefGet === 'function' ? prefGet(DKH_KEY, DKH_LOCAL) : null, H = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
            Object.keys(H).forEach(u => {                                         // 🗄️ 서랍 칸 = 미리 정한 자리 (s = 몇 번째 칸) · 그 서랍에 넣을 수 있는 것만
                const o = DK.items.find(x => x.u === u), S = o && dkSlots(o.id), ok = o ? dkHoldOk(o.id) : [], seen = new Set();
                H[u] = Array.isArray(H[u]) && S ? H[u].filter(e => e && typeof e === 'object' && S[e.s] && ok.includes(e.k) && dkWin(e.k) && !seen.has(e.s) && seen.add(e.s)).map(e => Object.assign({}, e, { r: S[e.s] })) : [];
                if (!H[u].length) delete H[u];
            });
            return H;
        };
        const dkHomesSet = v => { if (typeof prefSet === 'function') prefSet(DKH_KEY, DKH_LOCAL, v); };
        const dkbSub = it => it.ds ? (it.ds === 'wall' ? '벽지' : '책상') : it.al ? `${DKH_NAMES[it.k] || ''} 스티커첩` : DKH_NAMES[it.k] || '';   // 카드 아래 작은 글 = 무엇인지
        const dkGdIc = it => { const p = it.k === 'gd' && it.gid && window.gdPic ? gdPic(it.gid) : null; return p ? `<i class="dkb-gd${p.h / p.w > 2.2 ? ' tall' : ''}"><img src="${htmlEsc(p.u)}" alt="" draggable="false"></i>` : ''; };   // ✏️ 문구 = 그 상품 그림 (도련 11-03 · 현실처럼 · 길쭉한 필기구는 비스듬히)
        const dkLkIc = it => { const h = it.lk && window.shLookMini ? shLookMini(it.lk) : ''; return h ? `<i class="dkb-lk"><span class="dkb-lkin k-${htmlEsc(it.k || '')}">${h}</span></i>` : ''; };   // 🛍️ 산 모습 그대로 (샵 진열 그림 · js/basket.js shLookKeep · 도련 11-03)
        const dkKindIc = it => dkGdIc(it) || dkLkIc(it) || (it.ds ? `<i>${it.ds === 'wall' ? '🧱' : '🪵'}</i>` : it.al ? `<i>${it.n === '이형지북' ? '🤍' : '📒'}</i>` : it.src ? `<img src="${it.src}" alt="">` : `<i>${{ gd: '✂️', desk: '🪑', bg: '🌈', tool: '📔' }[it.k] || (window.stkArt ? stkArt(it.k) : '🎁')}</i>`);
        const dkBagXY = (bg, n) => isFinite(+bg.x) && isFinite(+bg.y) ? [+bg.x, +bg.y] : [836 + [0, -260, 260, -520, 520][n % 5] + 36 * Math.floor(n / 5), 830 - 14 * Math.floor(n / 5)];
        function deskBagAdd(L) {
            if (!Array.isArray(L) || !L.length) return;
            const B = dkBags(), at = B.map((b, i) => dkBagXY(b, i));             // 🛍️ 봉투는 끝없이 늘어요 (도련 10-30 : 정리는 다꾸러 마음 · 알림 없음)
            const SL = [836, 576, 1096, 316, 1356], free = (x, y) => !at.some(p => Math.abs(p[0] - x) < 110 && Math.abs(p[1] - y) < 60);
            let x = 836, y = 830;
            for (let r = 0; r < 40; r++) { const c = SL.map(v => [v + 36 * r, 830 - 14 * r]).find(([a, b]) => free(a, b)); if (c) { [x, y] = c; break; } }   // 비어 있는 자리부터 · 다 차면 조금씩 비켜서 겹쳐요
            B.push({ t: Date.now(), it: L, x, y });
            dkBagsSet(B); deskBagsPaint();
        }
        function deskBagsPaint() {
            const st = document.getElementById('deskStage'); if (!st || !window.BAG_SVG) return;
            st.querySelectorAll('.dk-bag').forEach(x => x.remove());
            dkBags().forEach((bg, n) => {
                const b = document.createElement('button'); b.type = 'button'; b.className = 'dk-bag'; b.setAttribute('aria-label', `사 온 봉투 (${bg.it.length}개)`);
                const [x, y] = dkBagXY(bg, n);                                   // 책상 앞쪽 · 똑바로 (도련 10-30 : 2배) · 자리 = bg.x · bg.y
                b.style.left = (x - 120) + 'px'; b.style.top = (y - 268) + 'px';
                b.innerHTML = window.BAG_SVG + `<b class="dk-bag-n">${bg.it.length}</b>`;
                b.addEventListener('click', e => e.stopPropagation());
                b.addEventListener('pointerdown', e => dkBagDown(e, b, n, x, y));
                st.appendChild(b);
            });
            dkBagHint();
        }
        /* 🛍️ 사 온 봉투 알려 주기 (도련 10-31 : 처음 쓰는 사람은 봉투를 어떻게 할지 몰라요) : 책상에 봉투가 있으면 늘 · 마지막에 놓인 봉투 바로 아래 (아래가 모자라면 위) */
        function dkBagHint() {
            const st = document.getElementById('deskStage'); if (!st) return;
            let h = document.getElementById('deskBagHint'); const B = dkBags();
            if (!B.length) { if (h) h.hidden = true; return; }
            if (!h) { h = document.createElement('div'); h.id = 'deskBagHint'; h.className = 'desk-hint'; h.innerHTML = '🛍️ <b>봉투를 눌러</b> 받은 것을 꺼내 보세요'; }
            if (h.parentElement !== st) st.appendChild(h);
            const [x, y] = dkBagXY(B[B.length - 1], B.length - 1), low = y + 70 > DESK_H;
            h.classList.toggle('up', low); h.style.left = x + 'px'; h.style.top = (low ? y - 268 - 12 : y + 12) + 'px'; h.hidden = false;
        }
        /* 🛍️ 봉투 : 톡 = 열기 · 끌기 = 옮기기 (평소 책상에서만 · 🛠 꾸미는 동안은 안 눌려요 · 도련 10-30) · 자리 = 'diary_desk_bags' 의 그 봉투 x · y */
        function dkBagDown(ev, b, n, x0, y0) {
            ev.stopPropagation(); if (ev.button > 0 || DK.edit) return; ev.preventDefault();
            const s = DK.s || 1, cx = ev.clientX, cy = ev.clientY; let moved = false, x = x0, y = y0;
            try { b.setPointerCapture(ev.pointerId); } catch (e) {}
            const mv = e => { if (e.pointerId !== ev.pointerId) return; const dx = (e.clientX - cx) / s, dy = (e.clientY - cy) / s; if (!moved && Math.hypot(dx, dy) < 6) return; moved = true; b.classList.add('lift');
                x = Math.round(Math.max(130, Math.min(DESK_W - 130, x0 + dx))); y = Math.round(Math.max(300, Math.min(DESK_H - 4, y0 + dy))); b.style.left = (x - 120) + 'px'; b.style.top = (y - 268) + 'px'; };
            const up = e => { if (e.pointerId !== ev.pointerId) return; b.removeEventListener('pointermove', mv); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up); b.classList.remove('lift');
                if (e.type === 'pointercancel') return;
                if (!moved) { deskBagOpen(n); return; }
                const B = dkBags(); if (B[n]) { B[n].x = x; B[n].y = y; dkBagsSet(B); dkBagHint(); } };   // 🛍️ 안내도 봉투 따라
            b.addEventListener('pointermove', mv); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
        }
        window.deskBagDrop = () => deskBagsPaint();
        /* 봉투 속 : 화면 맨 위 카드 줄 (봉투 위) · 카드를 끌어 책상 소품에 */
        function deskBagOpen(n) {
            let pn = document.getElementById('dkBagPanel');
            const B = dkBags(), bg = B[n];
            if (!bg) { if (pn) pn.hidden = true; return; }
            if (!pn) { pn = document.createElement('div'); pn.id = 'dkBagPanel'; pn.className = 'dkb-pn'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); }
            pn.dataset.n = n;
            pn.innerHTML = `<div class="dkb-top"><b>🛍️ 봉투 속</b><small>상품을 원하는 소품에 끌어다 넣어요<br>소품을 누르면 상품을 사용할 수 있어요</small><button type="button" class="dkb-x" onclick="deskBagOpen(-1)" aria-label="닫기">✕</button></div>`
                + `<div class="dkb-cards">${bg.it.map((it, j) => `<div class="dkb-card" data-j="${j}">${dkKindIc(it)}${DKB_STK.includes(it.k) && !it.al ? `<b>${DKH_NAMES[it.k]}</b>` : `<b>${htmlEsc(it.n || DKH_NAMES[it.k] || '')}</b><small>${dkbSub(it)}</small>`}</div>`).join('')}</div>`;
            pn.querySelectorAll('.dkb-card').forEach(c => c.addEventListener('pointerdown', e => dkbGrab(e, n, +c.dataset.j, c)));
            pn.hidden = false;
        }
        function dkbTake(n, j) {                                                  // 카드 하나 꺼냈어요 → 봉투에서 빼요 (다 비면 봉투도)
            const B = dkBags(); if (!B[n]) return; const out = B[n].it[j]; B[n].it.splice(j, 1);
            if (out && out.k === 'gd' && out.gid && window.pkAdd && window.pkIsId && pkIsId(out.gid)) setTimeout(() => pkAdd(out.gid), 0);   // ✏️ 꺼낸 필기구 = 펜꽂이에도 (봉투에 있는 동안 빠졌을 수 있어요) if (!B[n].it.length) B.splice(n, 1);
            dkBagsSet(B); deskBagsPaint(); deskBagOpen(B[n] ? n : -1);
        }
        function dkbGrab(ev, n, j, card) {
            if (ev.button > 0) return; ev.preventDefault();
            const it = (dkBags()[n] || { it: [] }).it[j]; if (!it) return;
            const gh = card.cloneNode(true); gh.className = 'dkb-card dkb-ghost'; document.body.appendChild(gh);
            const place = (x, y) => { gh.style.left = x + 'px'; gh.style.top = y + 'px'; };
            place(ev.clientX, ev.clientY); card.classList.add('dkb-out');
            let hi = null;
            const at = (x, y) => { gh.style.display = 'none'; const t = document.elementFromPoint(x, y); gh.style.display = ''; return t && t.closest ? t.closest('#deskStage .desk-item') : null; };
            const mv = e => { if (e.pointerId !== ev.pointerId) return; place(e.clientX, e.clientY); const t = at(e.clientX, e.clientY); if (t !== hi) { if (hi) hi.classList.remove('dkh-hi'); hi = t; if (hi) hi.classList.add('dkh-hi'); } };
            const up = e => {
                if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
                if (hi) hi.classList.remove('dkh-hi'); gh.remove(); card.classList.remove('dkb-out');
                if (e.type === 'pointercancel') return;
                const t = at(e.clientX, e.clientY), stg = document.getElementById('deskStage');
                if (it.k === 'desk' && it.id && dkCat(it.id)) {                    // 🪑 산 소품 = 놓은 자리에 바로
                    const o = (it.u && DK.items.find(x => x.u === it.u)) || [...DK.items].reverse().find(x => x.id === it.id && x.at === 'box'), R = stg && stg.getBoundingClientRect();
                    const onStage = R && e.clientX >= R.left && e.clientX <= R.right && e.clientY >= R.top && e.clientY <= R.bottom && !e.target.closest('#dkBagPanel');
                    if (!onStage) return;
                    if (o) { const c = dkCat(o.id), s = DK.s || 1, dx = (e.clientX - R.left) / s, dy = (e.clientY - R.top) / s; o.x = Math.round(Math.max(0, Math.min(DESK_W - c.w, dx - c.w / 2))); o.y = Math.round(Math.max(0, Math.min(DESK_H - c.h, dy - c.h))); o.at = 'desk'; o.lz = 99; deskItemsRender();   // 🛍️ 꺼낸 소품 = 겹친 소품들보다 앞에 (도련 10-31 · 뒤로 가면 소품 안에 들어간 줄 알아요)
                        const nel = stg.querySelector(`.desk-item[data-u="${o.u}"]`), got = (DK.lzDone && nel && DK.lzDone.get(nel)) || 0; if (got > 0) o.lz = got; else delete o.lz;
                        dkSave(); dkLayers(); deskModeRender(); }
                    dkbTake(n, j); return;
                }
                if (it.ds) { const R = stg && stg.getBoundingClientRect(); if (R && e.clientX >= R.left && e.clientX <= R.right && e.clientY >= R.top && e.clientY <= R.bottom && !e.target.closest('#dkBagPanel')) dkbTake(n, j); return; }   // 🧱 🪵 벽지 · 책상 = 이미 📦 소품함에 · 책상에 놓으면 꺼낸 걸로
                if (it.al && it.b) { if (dkvPlace(it.b, e.clientX, e.clientY)) dkbTake(n, j); return; }   // 📒 🤍 새 스티커첩 = 놓은 자리에 그 책
                if (it.k === 'tool' && it.b) {                                    // 📔 새 다이어리 : 빈 곳 = 놓은 자리에 그 권 · 소품 위 = 책상에 놓을지 · 소품 안에 넣을지 물어봐요 (도련 10-31)
                    const tk = t && DK.items.find(x => x.u === t.dataset.u);
                    if (!t || !tk || !dkHoldOk(tk.id).includes('skin')) { if (dkvPlace(it.b, e.clientX, e.clientY)) dkbTake(n, j); return; }   // 다이어리를 못 넣는 소품 위 = 책상에 놓기
                    const o = DK.items.find(x => x.u === t.dataset.u), nm = o ? dkName(o) : '이 소품', cx = e.clientX, cy = e.clientY;
                    showAsk(`📔 새 다이어리를 어디에 둘까요?<br><span style="font-size:12px;color:#777;">소품 안에 넣으면 ${josa(nm, '을', '를')} 눌렀을 때 📔 다이어리 보관소가 열려요</span>`, `🧺 ${nm} 안에 넣기`, '📚 책상에 놓기').then(inside => {
                        if (!inside) { dkvHome(it.b); dkbTake(n, j); return; }     // 📚 소품 뒤에 숨지 않게 = 다이어리 줄 빈자리에 앞을 보고
                        dkBagHold(it.b); dkDeskBooks();                           // 책상에 안 나와요 · 보관소에 있어요
                        dkbHome(t, it, n, j, cx, cy);                             // 이 소품 = 📔 다이어리 보관소 창
                    });
                    return;
                }
                if (!t) return;                                                   // 소품 밖 = 다시 봉투로
                dkbHome(t, it, n, j, e.clientX, e.clientY);
            };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        /* 봉투 카드 넣기 (도련 11-01 · 현실처럼) : 스티커 = 그 종류 창 (씰스티커 · 마스킹테이프 … · 서랍 한 칸 = 한 종류 · 도련 11-01) · 📔 다이어리 = 다이어리 · ✂️ 문구 = 문구함
           넣을 수 있는 소품이면 = 그 소품에 (서랍장 = 그림이 크게 떠서 칸을 눌러 골라요 · dkzChoose) · 한 창 = 한 자리 (다른 곳에 있으면 '옮길까요?')
           못 넣는 소품(인형 · 시계 …)이면 = '○○에 넣을 수 없어요' 만 (넣을 곳은 안 알려요 · 도련 11-05) · 🌈 배경지 = 보류 */
        const dkbWin = k => k === 'tool' ? 'skin' : k === 'gd' ? 'gd' : DKB_STK.includes(k) ? 'h:' + k : '';   // 스티커 = 그 종류 창 (씰스티커 · 마스킹테이프 … 칸마다 한 종류)
        const dkbPulse = t => { t.classList.remove('dkh-in'); void t.offsetWidth; t.classList.add('dkh-in'); setTimeout(() => t.classList.remove('dkh-in'), 600); };
        async function dkbHome(t, it, n, j, cx, cy) {
            if (window.dktDrop && dktDrop(t, it, n, j, cx, cy)) return;           // 🎀 마테 정리함 (js/desktape.js)
            if (it.k === 'gd' && it.gid) { if (await dkGdPut(it.gid, t)) { dkbPulse(t); dkbTake(n, j); } return; }   // ✏️ 문구 = 넣은 소품이 그 문구의 집 (도련 11-05)
            let win = dkbWin(it.k); if (!win) { showMsg('🌈 배경지는 아직 소품에 넣을 수 없어요.'); return; }
            const u = t.dataset.u, o = DK.items.find(x => x.u === u), nm = o ? dkName(o) : '이 소품', [, K, , ic] = dkWin(win);
            if (!o || !dkHoldOk(o.id).includes(win)) {                          // 🧸 못 넣는 소품 = '○○에 넣을 수 없어요'
                showMsg(`${ic} ${josa(K, '은', '는')} <b>${htmlEsc(nm)}</b>에 넣을 수 없어요.`);   // 넣을 수 있는 곳은 안 알려요 (소품이 끝없이 늘어요 · 도련 11-05)
                return;
            }
            const S = dkSlots(o.id), M = deskFnMap(), H = dkHomes(), zones = H[u] || [];
            let s = -1, old = '';                                                // old = 바꾸기로 밀려난 것 (어디로 옮길지 물어봐요 · 도련 11-01)
            if (S) {
                let agreed = false;                                              // 🗄️ 서랍이 다 찼어요 (도련 11-01) : 다른 서랍장(빈 서랍 있으면) · 서랍 바꾸기 · 취소
                if (S.every((r, i) => zones.some(e => e.s === i)) && !zones.some(e => e.k === win)) {
                    const other = dkOnDesk().find(x => x.u !== u && dkSlots(x.id) && dkHoldOk(x.id).includes(win) && dkSlots(x.id).some((r, i) => !(H[x.u] || []).some(e => e.s === i)));
                    const t2 = other && document.querySelector(`#deskStage .desk-item[data-u="${other.u}"]`);
                    const q = `🗄️ ${htmlEsc(nm)}의 서랍 ${S.length}칸이 다 찼어요.<br>${ic} ${htmlEsc(josa(K, '은', '는'))} 어떻게 할까요?<br><span style="font-size:12px;color:#777;">${t2 ? `${htmlEsc(dkName(other))}에는 빈 서랍이 있어요 · ` : ''}서랍을 바꾸면 원래 있던 스티커는 빈 서랍으로 옮기거나 빼요 (스티커 서랍엔 그대로)</span>`;
                    const r = t2 ? await showAsk3(q, '서랍 바꾸기', '취소', `${dkName(other)}에 넣기`) : await showAsk(q, '서랍 바꾸기', '취소');
                    if (r === 'extra') { dkbHome(t2, it, n, j, cx, cy); return; }
                    if (!r) return; agreed = true;
                }
                s = await dkzChoose(t, o, win); if (s < 0) return;               // 🗄️ 서랍장 그림에서 칸 고르기 (도련 11-01)
                const same = zones.find(e => e.k === win); if (same && same.s === s) { dkbPulse(t); dkbTake(n, j); return; }   // 이미 이 칸에
                const cur = zones.find(e => e.s === s);
                if (cur && !agreed && !await showAsk(`${nm} ${dkSlotNm(s, S.length)} 칸에는 ${josa(dkWin(cur.k)[1], '이', '가')} 들어 있어요.<br>${josa(K, '으로', '로')} 바꿀까요?`, '바꾸기', '취소')) return;
                if (cur) old = cur;
            } else if (M[win] === u) { dkbPulse(t); dkbTake(n, j); return; }
            const wasU = M[win] || Object.keys(H).find(x => H[x].some(e => e.k === win)), ow = wasU && DK.items.find(x => x.u === wasU);
            if (ow && !(S && wasU === u)) {
                const we = !M[win] && (H[wasU] || []).find(e => e.k === win), at = dkName(ow) + (we ? ` ${dkSlotNm(we.s, (dkSlots(ow.id) || []).length)} 칸` : '');
                if (!await showAsk(`${ic} ${josa(K, '이', '가')} ${at}에 있어요.<br>${nm}${S ? ' ' + dkSlotNm(s, S.length) + ' 칸' : ''}으로 옮길까요?`, '옮기기', '취소')) return;
            }
            const M2 = Object.assign({}, deskFnMap()); dkWinFree(win, M2);
            const prevE = Object.keys(H).map(x => H[x].find(e => e.k === win)).find(Boolean), keepTag = S && prevE && prevE.tag ? dkzTagMove(prevE.tag, prevE.r, S[s]) : null;   // 🏷 옮겨도 이름표는 따라가요 (도련 11-01)
            if (S) { const H2 = dkHomes(); H2[u] = (H2[u] || []).filter(e => e.s !== s); H2[u].push(Object.assign({ k: win, s, r: S[s] }, keepTag ? { tag: keepTag } : {})); dkHomesSet(H2); }
            else { Object.keys(M2).forEach(k => { if (M2[k] === u) delete M2[k]; }); M2[win] = u; }
            DK_FNS.forEach(([k]) => { if (!M2[k]) M2[k] = ''; });                   // 빠진 기능은 '' (저절로 다시 붙이지 않게)
            if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, M2);
            deskFnPaint();
            if (old) { dknPaintAll(); await dkzRehome(old.k, u, old); }                 // 🗄️ 밀려난 것 = 빈 서랍으로 옮기기
            if (S) { if (!keepTag && await showAsk(`🏷 ${dkSlotNm(s, S.length)} 칸에 이름표를 붙일까요?<br><span style="font-size:12px;color:#777;">어느 서랍인지 잊지 않게요 · 🛠 책상 꾸미기에서 바꿀 수 있어요</span>`, '붙이기', '안 붙이기')) { dkzTagOn(u, win); setTimeout(() => dknPanel(u + '|' + win), 50); } }
            else if (!o.tag) { o.tag = { m: 't', t: (dkWin(win) || [])[1] || '', on: !!await showAsk(`🏷 ${nm}에 이름표를 붙일까요?<br><span style="font-size:12px;color:#777;">어디에 넣었는지 잊지 않게요 · 🛠 책상 꾸미기에서 바꿀 수 있어요</span>`, '붙이기', '안 붙이기') }; dkSave(); if (o.tag.on) setTimeout(() => dknPanel(u), 50); }
            dknPaintAll(); dkbPulse(t); dkbTake(n, j);
        }
        /* ✏️ 문구 넣기 (도련 11-05 · 현실처럼) : 넣은 곳 = 그 문구의 집 · 꺼내 쓰기도 거기서만 (js/deskgd.js 문구의 집)
           펜꽂이 = 꽂을 수 있는 것만 (필기구 · 상품 '연필꽂이' yes) · 24개까지 · 서랍장 = 칸을 골라요 (한 칸에 문구 여러 종류 함께 · 다른 것이 든 칸이면 바꿀지 물어요)
           봉투 카드 · 꺼낸 문구 줄에서 끌어 놓을 때 같이 써요 → true = 넣었어요 */
        async function dkGdPut(id, t) {
            const u = t.dataset.u, o = DK.items.find(x => x.u === u), ok = o ? dkHoldOk(o.id) : [], S = o && dkSlots(o.id), nm = o ? dkName(o) : '이 소품', gn = (window.dkwNameOf && dkwNameOf(id)) || '문구';
            const no = () => { showMsg(`✏️ ${htmlEsc(josa(gn, '은', '는'))} <b>${htmlEsc(nm)}</b>에 넣을 수 없어요.`); return false; };
            if (!o || !window.dkwAtPut) return no();
            if (S && ok.includes('gd')) {
                const s = await dkzChoose(t, o, 'gd'); if (s < 0) return false;
                const cur = (dkHomes()[u] || []).find(e => e.s === s);
                if (cur && cur.k !== 'gd' && !await showAsk(`${htmlEsc(nm)} ${dkSlotNm(s, S.length)} 칸에는 ${josa(dkWin(cur.k)[1], '이', '가')} 들어 있어요.<br>문구함으로 바꿀까요?`, '바꾸기', '취소')) return false;
                if (!cur || cur.k !== 'gd') {
                    const H = dkHomes(); H[u] = (H[u] || []).filter(e => e.s !== s); H[u].push({ k: 'gd', s, r: S[s] }); dkHomesSet(H);
                    if (cur) { dknPaintAll(); await dkzRehome(cur.k, u, cur); }
                    if (await showAsk(`🏷 ${dkSlotNm(s, S.length)} 칸에 이름표를 붙일까요?<br><span style="font-size:12px;color:#777;">어느 서랍인지 잊지 않게요 · 🛠 책상 꾸미기에서 바꿀 수 있어요</span>`, '붙이기', '안 붙이기')) { const H2 = dkHomes(), e = (H2[u] || []).find(x => x.k === 'gd' && x.s === s); if (e) { e.tag = Object.assign(dknWordTag('gd'), { on: true }); dkHomesSet(H2); } }
                }
                dkwAtPut(id, u + ':' + s);
            } else if (ok.includes('pc') && !S) {
                if (!dkwCanCup(id)) return no();
                if (dkwHere(u).length >= DKW_MAX) { showMsg(`✏️ ${htmlEsc(nm)}에는 ${DKW_MAX}개까지 꽂을 수 있어요.`); return false; }
                dkwAtPut(id, u);
            } else return no();
            dknPaintAll(); deskFnPaint(); return true;
        }
        window.dkGdPut = dkGdPut;
        /* ---------- 🗄️ 서랍 칸 (도련 11-01 : 칸 자리는 미리 정해 둬요 · DK_HOLD) ---------- */
        /* 🗄️ 서랍 고르기 (도련 11-01) : 상품을 서랍장에 넣을 때 그 서랍장 그림이 크게 뜨고 칸을 직접 눌러요 · 칸마다 지금 든 것 · 결과 = 칸 번호 (취소 = -1 · '다른 서랍장' = 'more')
           op = { free : 빈 칸만 누를 수 있게, ask : 위 글, no : 취소 글, more : 세 번째 버튼 글 } */
        async function dkzChoose(t, o, win, op) {
            op = op || {};
            const S = dkSlots(o.id), im = t.querySelector(':scope > img'), Z = dkHomes()[t.dataset.u] || [], [, K, , ic] = dkWin(win);
            const html = (op.ask || `${ic} <b>${htmlEsc(josa(K, "을", "를"))}</b> 넣을 서랍을 눌러 주세요`) + (op.free ? `<br><span style="font-size:12px;color:#777;">${htmlEsc(dkName(o))} · 빈 서랍만 고를 수 있어요</span>` : '')
                + `<div class="dkz-pick"><img src="${im ? im.src : ''}" alt=""${o.fl && dkFlipOk(dkCat(o.id)) ? ' style="transform:scaleX(-1)"' : ''}>`
                + S.map((r, i) => { const c = Z.find(e => e.s === i), w = c && dkWin(c.k), off = op.free && c;
                    return `<button type="button" class="dkz-slot${c && c.k === win ? ' on' : ''}" style="left:${r[0]}%;top:${r[1]}%;width:${r[2] - r[0]}%;height:${r[3] - r[1]}%"${off ? ' disabled' : ` onclick="closeMsg('s${i}')"`}><b>${dkSlotNm(i, S.length)} 서랍</b><small>${w ? (c.k === win ? '✔ 지금 여기' : `${w[3]} ${htmlEsc(w[1])}`) : '비어 있어요'}</small></button>`; }).join('') + '</div>';
            const a = document.getElementById('customAlertConfirmBtn'); a.style.display = 'none';
            let r; try { r = op.more ? await showAsk3(html, '', op.no || '취소', op.more) : await showAsk(html, '', op.no || '취소'); } finally { a.style.display = ''; }
            return r === 'extra' ? 'more' : typeof r === 'string' && r[0] === 's' ? +r.slice(1) : -1;
        }
        /* 🏷 칸 이름표 옮기기 (도련 11-01) : 칸이 바뀌면 이름표 자리도 그 칸만큼 같이 (직접 옮긴 자리 그대로 · 처음 자리면 새 칸 가운데) */
        function dkzTagMove(g, r0, r1) {
            const t = Object.assign({}, g); if (!r0 || !r1) { delete t.x; delete t.y; return t; }
            if (t.x != null) t.x += ((r1[0] + r1[2]) - (r0[0] + r0[2])) / 200;
            if (t.y != null) t.y += ((r1[1] + r1[3]) - (r0[1] + r0[3])) / 200;
            return t;
        }
        /* 🗄️ 바꾸기로 밀려난 것 옮기기 (도련 11-01) : 빈 서랍(이 서랍장 먼저 · 다른 서랍장)을 골라요 · 안 옮기면 서랍에서만 빠져요 (바구니 · 보관함에는 그대로) */
        async function dkzRehome(k, u0, oldE) {
            const [, K, , ic] = dkWin(k), H = dkHomes();
            const C = dkOnDesk().filter(x => dkSlots(x.id) && dkHoldOk(x.id).includes(k) && dkSlots(x.id).some((r, i) => !(H[x.u] || []).some(e => e.s === i)))
                .sort((a, b) => (b.u === u0) - (a.u === u0));
            const out = () => showMsg(`${ic} ${josa(K, '은', '는')} 서랍에서 빠졌어요.<br><span style="font-size:12px;color:#777;">스티커는 스티커 서랍에 그대로 있어요 · 🛠 책상 꾸미기 → 🔗 기능 연결에서 다시 넣을 수 있어요</span>`);
            if (!C.length) { await out(); return; }
            for (let i = 0; ; i = (i + 1) % C.length) {
                const o = C[i], t = document.querySelector(`#deskStage .desk-item[data-u="${o.u}"]`); if (!t) { await out(); return; }
                const s = await dkzChoose(t, o, k, { free: true, ask: `${ic} 원래 있던 <b>${htmlEsc(josa(K, '은', '는'))}</b> 어느 서랍으로 옮길까요?`, no: '옮기지 않기', more: C.length > 1 ? '다른 서랍장' : '' });
                if (s === 'more') continue;
                if (s < 0) { await out(); return; }
                const H2 = dkHomes(), R = dkSlots(o.id)[s]; H2[o.u] = (H2[o.u] || []).filter(e => e.s !== s && e.k !== k);
                H2[o.u].push(Object.assign({ k, s, r: R }, oldE && oldE.tag ? { tag: dkzTagMove(oldE.tag, oldE.r, R) } : {})); dkHomesSet(H2);   // 🏷 이름표도 같이
                if (k === 'gd' && oldE && window.dkwAtMove) dkwAtMove(u0 + ':' + oldE.s, o.u + ':' + s);   // ✏️ 문구함 서랍을 옮기면 안에 든 문구도 같이
                dknPaintAll(); dkbPulse(t); return;
            }
        }
        function dkzTagOn(u, k) { const H = dkHomes(), e = (H[u] || []).find(x => x.k === k && x.r); if (!e) return; e.tag = Object.assign(dknWordTag(k), e.tag || {}, { on: true }); dkHomesSet(H); dknPaintAll(); }
        const dkzPct = (el, cx, cy) => { const im = el.querySelector(':scope > img') || el, q = im.getBoundingClientRect(); return [(cx - q.left) / q.width * 100, (cy - q.top) / q.height * 100]; };   // 소품 그림 안 %
        const dkzHit = (L, p) => [...L].reverse().find(e => e.r && p[0] >= e.r[0] && p[0] <= e.r[2] && p[1] >= e.r[1] && p[1] <= e.r[3]);   // 겹치면 나중에 그린 칸
        /* 🛠 꾸미기 : 고른 소품의 칸을 점선으로 */
        function dkzPaint() {
            document.querySelectorAll('#deskStage .dkz-show').forEach(x => x.remove());
            const el = DK.edit && DK.sel; if (!el || !el.classList || !el.classList.contains('desk-item')) return;
            const L = (dkHomes()[el.dataset.u] || []).filter(e => e.r), im = el.querySelector(':scope > img') || el; if (!L.length) return;
            const box = document.createElement('div'); box.className = 'dkz-show'; box.setAttribute('aria-hidden', 'true');
            Object.assign(box.style, { left: im.offsetLeft + 'px', top: im.offsetTop + 'px', width: im.offsetWidth + 'px', height: im.offsetHeight + 'px' });
            const cur = e => DK.zone === el.dataset.u + '|' + e.k;
            box.classList.toggle('veil', L.some(cur));
            box.innerHTML = L.filter(e => !cur(e)).concat(L.filter(cur)).map(e => `<i${cur(e) ? ' class="on"' : ''} style="left:${e.r[0]}%;top:${e.r[1]}%;width:${e.r[2] - e.r[0]}%;height:${e.r[3] - e.r[1]}%"></i>`).join('');   // 칸 = 점선만 (이름은 칸 메뉴 · 이름표에)
            el.appendChild(box);
        }
        /* 🛠 칸 메뉴 버튼 : tag(칸 이름표) · del(칸 빼기) · draw(누르는 곳 다시 그리기) */
        async function dkzAct(a, id) {
            const [u, k] = id.split('|'), o = DK.items.find(x => x.u === u), e = (dkHomes()[u] || []).find(x => x.k === k && x.r); if (!o || !e) return;
            if (a === 'tag') { dkzTagOn(u, k); dknPanel(id); return; }
            if (a === 'del') {
                if (!await showAsk(`👆 ${(dkWin(k) || [])[1]} 칸을 뺄까요?<br><span style="font-size:12px;color:#777;">봉투에서 다시 넣을 수 있어요</span>`, '빼기', '취소')) return;
                const H = dkHomes(); H[u] = (H[u] || []).filter(x => x.k !== k); if (!H[u].length) delete H[u]; dkHomesSet(H);
                const pn = document.getElementById('dknPanel'); if (pn && pn.dataset.u === id) dknPanel(false);
                DK.zone = null;
            }
            dknPaintAll(); deskTipPaint(); dkzPaint();
        }
        window.dkzAct = dkzAct;
        /* 🏷 소품 이름표 (도련 10-30 : 연결한 소품을 까먹지 않게 · 다이어리 라벨처럼) : 글씨 · 아이콘 · 둘 다 · 라벨 바탕 · 아웃라인 · 글꼴 · 색 · 자리 · 크기
           it.tag = { on, m: 'ti' | 't' | 'i', t: 직접 쓴 글(없으면 연결한 종류 이름), ic: 아이콘(없으면 종류 아이콘), f, c, bx, bg, ol, oc, x, y, s } · 🛠 꾸미기 → 고른 소품 칩 '🏷 이름표' */
        const DKN0 = { on: false, m: 'ti', t: '', ic: '', f: 'sys', c: '#8a2f58', bx: true, bg: '#fffaf3', ol: false, oc: '#ffffff', x: .5, y: .45, s: 1, v: 0 };   // 처음 자리 = 소품 가운데 (위에 올린 소품 · 기능 이름표에 가리지 않게)
        const DKN_IC = ['⭐', '🌸', '🎀', '💖', '🍓', '🧸', '✂️', '📎', '🖍️', '📒', '🗂️', '🌈'];
        /* 이름표 처음 값 : 기능이 붙은 소품은 예전 기능 이름표처럼 (켜짐 · 아래쪽) → 고치면 그때부터 내 이름표 (도련 10-30 : 이미 붙어 있던 이름표도 이 창으로) */
        const dknOf = o => Object.assign({}, DKN0, (o && o.tag) || {});         // 🏷 처음엔 꺼져 있고 글은 비어 있어요 (도련 10-30 : 정해진 이름이 저절로 붙지 않게 · 내가 적은 것만)
        const dknKindIc = k => ({ gd: '✂️', desk: '🪑', bg: '🌈', tool: '📔' }[k] || (window.stkArt ? stkArt(k) : '🎁'));
        const dknAuto = () => ({ t: '', ic: '🏷️' });
        const dknWordTag = k => ({ on: true, m: 't', t: (dkWin(k) || [])[1] || '' });   // 🏷 처음 붙는 이름표 = 아이콘 말고 글 (문구함 · 펜꽂이 · 씰스티커 … · 도련 11-03 · 🛠 꾸미기에서 바꿀 수 있어요)                             // 비워 두면 = 글 없음 · 아이콘만 기본 🏷️
        /* 🏷 이름표 하나 만들기 = 소품 · 📔 다이어리 모두 이것 하나 (도련 10-30 : 이름표를 바꾸면 한 번에 다 바뀌게) · 모양은 css .dkn-tag
           g = { on, m, t, ic, f, c, bx, bg, ol, oc, x, y, s, v } · a = 비워 둘 때 { t, ic } · cls = 더 붙일 class */
        function dknBuild(g, a, cls) {
            const b = document.createElement('span'); b.className = 'dkn-tag' + (cls ? ' ' + cls : '') + (g.bx ? '' : ' clear') + (g.ol ? ' ol' : '') + (g.v ? ' v' : '');
            const fo = (typeof fontList !== 'undefined' ? fontList : []).find(x => x.id === g.f);
            Object.assign(b.style, { left: (g.x * 100) + '%', top: (g.y * 100) + '%', color: g.c, background: g.bx ? g.bg : 'transparent', fontFamily: fo ? fo.css : '' });
            b.style.setProperty('--fs', g.s); b.style.setProperty('--oc', g.oc);
            b.innerHTML = (g.m !== 't' ? `<i class="dkn-ic">${g.ic ? String(g.ic).replace(/[&<>"]/g, '') : a.ic}</i>` : '') + (g.m !== 'i' && (g.t || a.t) ? `<span class="dkn-t">${g.v ? [...String(g.t || a.t)].map(ch => ch === ' ' ? '<i class="dkn-sp"></i>' : htmlEsc(ch) + '<br>').join('') : htmlEsc(String(g.t || a.t))}</span>` : '');   // 세로쓰기 = 한 글자씩 아래로 (글자 사이 빈칸이 넘치던 것 막기)
            if (!g.t && g.m !== 'i') b.classList.add('ph');
            return b;
        }
        function dknPaintAll() {
            document.querySelectorAll('#deskStage .desk-item > .dkn-tag').forEach(x => x.remove());   // 📔 다이어리 이름표는 그대로
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const o = DK.items.find(x => x.u === el.dataset.u);
                (dkHomes()[el.dataset.u] || []).forEach(e => {                    // 👆 칸 이름표
                    const T = e.r && e.tag && dknTarget(el.dataset.u + '|' + e.k); if (!T || !T.g.on) return;
                    const b = dknBuild(T.g, T.a, 'dkz-tag'); b.classList.remove('ph'); if (b.firstChild) el.appendChild(b);
                });
                const g = dknOf(o); if (!o || !o.tag || !g.on) return;
                const b = dknBuild(g, dknAuto(o)); b.classList.remove('ph'); if (b.firstChild) el.appendChild(b);
            });
            if (typeof dkLayers === 'function') dkLayers();                       // 앞벽 위에도 한 장 (바구니 안에 든 게 있을 때)
        }
        /* 🏷 이름표 창 (소품 · 📔 다이어리 같이 · 도련 10-30) : set = 바꾸는 함수 이름 · close = 닫는 코드 · a = 비워 둘 때 글 · 아이콘 */
        function dknHtml(g, set, close, sub, a) {
            const fl = typeof fontList !== 'undefined' ? fontList : [], q = v => String(v).replace(/"/g, '&quot;');
            const sw = (arr, cur, k) => arr.map(c => `<button type="button" class="dky-sw${c === cur ? ' on' : ''}" style="--c:${c}" onclick="${set}('${k}','${c}')" aria-label="${c}"></button>`).join('') + dknCc(arr, cur, k, set);
            const icMy = g.ic && !DKN_IC.includes(g.ic) ? `<span class="dkn-my"><button type="button" class="dkn-ic-b on" onclick="${set}('ic','${q(g.ic)}')">${q(g.ic)}</button><button type="button" class="dkn-my-x" onclick="${set}('ic','')" aria-label="이모지 빼기" title="빼기">✕</button></span>` : '';   // 😀 모든 이모지에서 고른 것 · ✕ = 빼기 (기본 아이콘으로)
            const seg = [['ti', '아이콘 + 글씨'], ['t', '글씨만'], ['i', '아이콘만']].map(([v, n]) => `<button type="button" class="dkn-seg${g.m === v ? ' on' : ''}" onclick="${set}('m','${v}')">${n}</button>`).join('');
            return `<div class="dky-row"><b>🏷 이름표</b><label class="dky-tg"><input type="checkbox" ${g.on ? 'checked' : ''} onchange="${set}('on', this.checked)"> 붙이기</label><small>${sub}</small><button type="button" class="dky-x" onclick="${close}" aria-label="닫기">✕</button></div>`
                + (g.on ? `<div class="dky-row">${seg}</div>`
                + (g.m !== 'i' ? `<div class="dky-row"><input class="dky-t" maxlength="20" placeholder="${q(a.t || '이름을 적어요')}" value="${q(g.t)}" oninput="${set}('t', this.value, 1)"><select onchange="${set}('f', this.value)">${fl.map(f => `<option value="${f.id}"${f.id === g.f ? ' selected' : ''}>${f.name.replace(/ \(Local\)$/, '')}</option>`).join('')}</select></div>` : '')
                + (g.m !== 't' ? `<div class="dky-row"><span>아이콘</span><button type="button" class="dkn-ic-b${!g.ic ? ' on' : ''}" onclick="${set}('ic','')">기본 ${a.ic.length < 9 ? a.ic : ''}</button>${DKN_IC.map(c => `<button type="button" class="dkn-ic-b${g.ic === c ? ' on' : ''}" onclick="${set}('ic','${c}')">${c}</button>`).join('')}${icMy}<button type="button" class="dkn-seg dkn-emo-b" onclick="dknEmoOpen('${set}','${q(g.ic)}')">😀 모든 이모지</button></div>` : '')
                + `<div class="dky-row"><span>글 색</span>${sw(DKY_TC, g.c, 'c')}</div>`
                + `<div class="dky-row"><label class="dky-tg"><input type="checkbox" ${g.bx ? 'checked' : ''} onchange="${set}('bx', this.checked)"> 라벨</label>${g.bx ? sw(DKY_BC, g.bg, 'bg') : ''}</div>`
                + `<div class="dky-row"><label class="dky-tg"><input type="checkbox" ${g.ol ? 'checked' : ''} onchange="${set}('ol', this.checked)"> 아웃라인</label>${g.ol ? sw(DKY_OC, g.oc, 'oc') : ''}</div>`
                + `<div class="dky-row"><span>가로</span><input type="range" min="0" max="1" step="0.01" value="${g.x}" oninput="${set}('x', this.value, 1)"><span>세로</span><input type="range" min="0" max="1" step="0.01" value="${g.y}" oninput="${set}('y', this.value, 1)"></div>`
                + `<div class="dky-row"><span>크기</span><input type="range" min="0.4" max="3" step="0.05" value="${g.s}" oninput="${set}('s', this.value, 1)"><label class="dky-tg"><input type="checkbox" ${g.v ? 'checked' : ''} onchange="${set}('v', this.checked)"> 세로쓰기</label></div>` : '')
                + `<div class="dky-row"><button type="button" class="dkn-done" onclick="${close}">✔ 다 됐어요</button></div>`;
        }
        /* 🎨 내 마음대로 색 (도련 10-30) : 준비된 색 뒤 동그라미 하나 = 색 고르기 창 · 고른 색이 준비된 색에 없으면 이 동그라미가 그 색으로 골라져 있어요
           끄는 동안(oninput)은 이름표만 바로 바꾸고 창은 다시 그리지 않아요 (다시 그리면 색 고르기 창이 닫혀요) */
        function dknCc(arr, cur, k, set) {
            const my = !!cur && !arr.includes(cur), hex = /^#[0-9a-f]{6}$/i.test(cur || '') ? cur : '#ffffff';
            return `<label class="dky-sw dkn-cc${my ? ' on' : ''}" style="--c:${my ? hex : '#fff'}" title="내 마음대로 색"><input type="color" value="${hex}" oninput="this.parentNode.style.setProperty('--c',this.value);this.parentNode.classList.add('my');${set}('${k}',this.value,1)" onchange="${set}('${k}',this.value)"></label>`;
        }
        /* 😀 모든 이모지 (도련 10-30) : 아이콘 줄 = 샘플 몇 개 그대로 + '😀 모든 이모지' → 따로 뜨는 창에서 골라요 (고르면 창이 닫혀요)
           이모지는 새로 만들지 않고 🏪 기본상품 샵 이모지 칸과 같은 것 그대로 (js/basket.js shEmoCats · 묶음도 같아요) · ⌨️ 키보드 이모지를 붙여 넣어도 돼요 (최대 3개) */
        const DKN_EMO = { c: 0, cats: null, set: '', cur: '' };
        const DKN_EMO_RX = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u;
        function dknEmoClose() { const w = document.getElementById('dknEmoWin'); if (w) w.hidden = true; }
        async function dknEmoOpen(set, cur) {
            DKN_EMO.set = set; DKN_EMO.cur = cur || '';
            let w = document.getElementById('dknEmoWin');
            if (!w) {
                w = document.createElement('div'); w.id = 'dknEmoWin'; w.className = 'dkn-emo-bk'; document.body.appendChild(w);
                w.addEventListener('pointerdown', e => e.stopPropagation());
                w.addEventListener('click', e => { e.stopPropagation(); if (e.target === w) dknEmoClose(); });   // 창 밖 누르면 닫혀요
            }
            w.hidden = false;
            if (!DKN_EMO.cats) { w.innerHTML = '<div class="dkn-emo-win"><small>이모지를 꺼내는 중…</small></div>'; DKN_EMO.cats = window.shEmoCats ? await shEmoCats() : []; if (w.hidden) return; }
            dknEmoPaint();
        }
        function dknEmoPaint() {
            const w = document.getElementById('dknEmoWin'), C = DKN_EMO.cats || []; if (!w) return;
            if (DKN_EMO.c >= C.length) DKN_EMO.c = 0;
            const tabs = C.map(([n], i) => `<button type="button" class="dkn-emo-tab${i === DKN_EMO.c ? ' on' : ''}" onclick="dknEmoCat(${i})">${n}</button>`).join('');
            const cells = C.length ? C[DKN_EMO.c][1].map(e => `<button type="button" data-e="${e}"${e === DKN_EMO.cur ? ' class="on"' : ''}>${e}</button>`).join('') : '<small class="dkn-emo-none">이모지를 못 꺼냈어요</small>';
            w.innerHTML = `<div class="dkn-emo-win"><div class="dky-row"><b>😀 모든 이모지</b><small>골라서 톡</small><button type="button" class="dky-x" onclick="dknEmoClose()" aria-label="닫기">✕</button></div>`
                + `<div class="dkn-emo-tabs">${tabs}</div><div class="dkn-emo-grid" onclick="dknEmoPick(event)">${cells}</div>`
                + `<input class="dkn-emo-q" placeholder="⌨️ 키보드 이모지를 붙여 넣어도 돼요" oninput="dknEmoPaste(this)"></div>`;
        }
        function dknEmoCat(i) { DKN_EMO.c = i; dknEmoPaint(); }
        function dknEmoPick(ev) { const b = ev.target.closest('button[data-e]'); if (!b) return; dknEmoClose(); window[DKN_EMO.set]('ic', b.dataset.e); }
        function dknEmoPaste(inp) {
            const v = inp.value, seg = typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter().segment(v)].map(x => x.segment) : [...v];
            const em = seg.filter(ch => DKN_EMO_RX.test(ch)).slice(0, 3).join('');
            if (em) { dknEmoClose(); window[DKN_EMO.set]('ic', em); }
        }
        window.dknEmoOpen = dknEmoOpen; window.dknEmoClose = dknEmoClose; window.dknEmoCat = dknEmoCat; window.dknEmoPick = dknEmoPick; window.dknEmoPaste = dknEmoPaste;
        /* 이름표 대상 : 'u' = 소품 이름표 (o.tag) · 'u|종류' = 👆 칸 이름표 (diary_desk_home 칸의 tag · 처음 자리 = 칸 가운데) */
        function dknTarget(id) {
            const [u, k] = String(id || '').split('|'), o = u && DK.items.find(x => x.u === u); if (!o) return null;
            if (!k) return { o, g: dknOf(o), a: dknAuto(o), sub: dkName(o), put: g => { o.tag = g; if (!DK.edit) dkSave(); } };
            const e = (dkHomes()[u] || []).find(x => x.k === k && x.r); if (!e) return null;
            return { o, g: Object.assign({}, DKN0, { on: true, x: (e.r[0] + e.r[2]) / 200, y: (e.r[1] + e.r[3]) / 200 }, e.tag || {}), a: { t: '', ic: (dkWin(k) || [])[3] }, sub: `${dkName(o)} · 👆 ${(dkWin(k) || [])[1]} 칸`,
                put: g => { const H = dkHomes(), e2 = (H[u] || []).find(x => x.k === k && x.r); if (e2) { e2.tag = g; dkHomesSet(H); } } };
        }
        function dknPanel(show) {
            let pn = document.getElementById('dknPanel');
            const id = show === true ? (DK.sel && DK.sel.dataset.u) || (pn && pn.dataset.u) : show, T = id && dknTarget(id);   // 고른 소품이 바뀌어도 창은 그 소품 그대로 (체크하면 창이 닫히던 것 · 도련 10-30)
            if (!show || !T) { if (pn) pn.hidden = true; dknEmoClose(); return; }   // 🛠 꾸미기 · 상품을 넣으며 '붙이기'를 골랐을 때 (그때는 바로 저장)
            if (!pn) { pn = document.createElement('div'); pn.id = 'dknPanel'; pn.className = 'dky-lbp'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); pn.addEventListener('click', e => e.stopPropagation()); }
            pn.dataset.u = id;
            pn.innerHTML = dknHtml(T.g, 'dknSet', 'dknPanel(false)', htmlEsc(T.sub), T.a);
            pn.hidden = false;
        }
        function dknSet(k, v, live) {
            const pn = document.getElementById('dknPanel'), T = pn && dknTarget(pn.dataset.u); if (!T) return;
            const g = T.g;
            if (k === 'x' || k === 'y' || k === 's') g[k] = +v; else if (k === 'v') g.v = v ? 1 : 0; else if (k === 'on' || k === 'bx' || k === 'ol') g[k] = !!v; else if (k === 't') g.t = String(v).slice(0, 20); else if (k === 'ic') g.ic = String(v).slice(0, 40); else g[k] = v;
            T.put(g);                                                             // 소품 이름표 : 평소에는 바로 저장 · 🛠 꾸미기는 ✔ 완료 때 / 칸 이름표 : 바로 (🛠 취소하면 처음대로)
            dknPaintAll(); if (!live) dknPanel(pn.dataset.u);
        }
        window.dknPanel = dknPanel; window.dknSet = dknSet;
        /* 👆 칸 톡 = 그 칸 창 (칸 밖 = 소품 전체 창 → deskTapAt 이 el.dataset.fn) */
        function dkHomeTap(el, cx, cy) {
            const p = dkzPct(el, cx, cy), z = dkzHit(dkHomes()[el.dataset.u] || [], p);
            const o = DK.items.find(x => x.u === el.dataset.u), S = o && dkSlots(o.id), si = S ? S.findIndex(r => p[0] >= r[0] && p[0] <= r[2] && p[1] >= r[1] && p[1] <= r[3]) : -1;
            const desk = document.documentElement.classList.contains('desk-on');
            if (o && !S && desk && window.dkwCupOpen && dkHoldOk(o.id).includes('pc')) { setTimeout(() => dkwCupOpen(el.dataset.u), 0); return true; }   // ✏️ 펜꽂이마다 그 펜꽂이에 꽂힌 것 (도련 11-05)
            const run = z && (z.k === 'gd' && desk && window.dkwTrayOpen ? () => dkwTrayOpen(null, el.dataset.u + ':' + z.s) : () => deskRun(z.k));   // 🗄️ 문구함 서랍 = 그 서랍에 넣은 문구만
            if (si >= 0) { dkDrawerPull(el, S[si], run || null); return true; }   // 🗄 서랍 = 톡 열기 · 다시 톡 닫기 (든 창이 위에서 내려와요 · 도련 11-05) · 빈 서랍은 쏙 열렸다 닫혀요
            if (!z) return false;
            run(); return true;
        }
        /* 🗄 서랍 열고 닫기 (도련 11-04 · 현실처럼) : 서랍 칸(상품 '소품.slots')대로 그림에서 앞판을 잘라 앞으로 당겨요 (조금 아래로 · 조금 크게)
           원래 자리 = 서랍 속 (상품 '서랍속' 그림 · 없으면 그림자) · 다 열리면 넣어 둔 창을 열고 · 조금 뒤 닫혀요 · 손잡이 · 태슬도 앞판과 같이 */
        /* 🗄 서랍 열고 닫기 2 (도련 11-05 · 고개를 숙여 서랍을 여닫는 눈길) : 톡 = 열려요 · 다시 톡 = 닫혀요
           열면 → 그 서랍에 든 창이 화면 위에서 아래로 내려와 화면 맨 위에 붙어요 (서랍은 열린 채) · 닫으면 → 창이 위로 올라가며 사라지고 서랍도 같이 닫혀요
           창을 다른 데서 닫으면(✕ · 메뉴) 서랍도 닫혀요 · 든 게 없는 서랍(창 없음) = 예전처럼 쏙 열렸다 닫혀요 */
        const DKD = { cur: null };
        const dkdBoxes = () => {                                                // 지금 떠 있는 창 [창 상자, 바깥(모달 · 방)]
            const L = [];
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'flex' || m.style.display === 'block') { const b = m.querySelector(':scope > .modal-content'); if (b) L.push([b, m]); } });
            document.querySelectorAll('.dkw-room:not([hidden])').forEach(r => { const b = r.firstElementChild; if (b) L.push([b, r]); });
            return L;
        };
        const dkdOn = h => h && (h.classList.contains('modal') ? (h.style.display === 'flex' || h.style.display === 'block') : !h.hidden);
        function dkDrawerPull(el, r, run) {
            const key = el.dataset.u + '|' + r.join(',');
            if (DKD.cur && DKD.cur.key === key) { dkDrawerShut(true); return; }  // 다시 톡 = 닫기
            if (DKD.cur) { const w = DKD.cur.win; dkDrawerShut(false); if (w) dkdHide(w[1]); }   // 다른 서랍 = 열린 서랍(앞판은 닫히고 · 창은 바로 치워요) → 이 서랍 창이 위에서 내려와요
            dkdUnhide();
            const img = el.querySelector(':scope > img'), o = DK.items.find(x => x.u === el.dataset.u), c = o && dkCat(o.id);
            if (!img || matchMedia('(prefers-reduced-motion: reduce)').matches || el.querySelector(':scope > .dkd-front:not(.bye)')) { if (run) run(); return; }   // .bye = 닫히는 중인 앞판 (다른 서랍으로 바로 넘어가요)
            const W = r[2] - r[0], H = r[3] - r[1], box = `left:${r[0]}%;top:${r[1]}%;width:${W}%;height:${H}%`;
            const hole = document.createElement('i'); hole.className = 'dkd-hole'; hole.style.cssText = box + (c && c.inside ? `;background-image:url("${c.inside}")` : '');
            const fr = document.createElement('i'); fr.className = 'dkd-front'; fr.style.cssText = box;
            fr.innerHTML = `<img src="${htmlEsc(img.src)}" alt="" draggable="false" style="left:${-r[0] / W * 100}%;top:${-r[1] / H * 100}%;width:${100 / W * 100}%;height:${100 / H * 100}%">`;
            img.after(hole, fr);
            if (window.sndDrawer) sndDrawer(true);
            const tags = [...el.querySelectorAll(':scope > .dkn-tag')].filter(g => { const x = parseFloat(g.style.left), y = parseFloat(g.style.top); return x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]; });   // 🏷 그 칸 이름표도 앞판과 같이
            const ew = el.offsetWidth / 100, eh = el.offsetHeight / 100;
            tags.forEach(g => { const x = parseFloat(g.style.left), y = parseFloat(g.style.top); g.dataset.dkd = `translate(${((x - (r[0] + W / 2)) * .06) * ew}px, ${((y - r[1]) * .06 + H * .16) * eh}px) scale(1.06)`; g.style.transition = 'transform .22s cubic-bezier(.2, .7, .3, 1.15)'; });
            requestAnimationFrame(() => requestAnimationFrame(() => { fr.classList.add('open'); tags.forEach(g => { g.style.transform = g.dataset.dkd; }); }));
            const D = { key, hole, fr, tags, win: null, t: 0 };
            if (!run) { setTimeout(() => dkdFront(D), 760); return; }            // 든 게 없는 서랍 = 쏙 열렸다 닫혀요
            DKD.cur = D;
            dkdBoxes().forEach(([b, h]) => { if (h.id === 'basketKindModal' || h.id === 'dkwTray') dkdHide(h); });   // 서랍 밖에서 떠 있던 서랍 창(가운데)은 먼저 치워요 → 이 서랍에서 다시 내려와요 (도련 11-05)
            const now = dkdBoxes(), before = new Set(now.map(x => x[0])), t0 = performance.now();
            setTimeout(() => {
                if (DKD.cur !== D) return;
                now.forEach(x => x[1].classList.add('dk-keep')); document.documentElement.classList.add('dk-dropping');   // 새로 뜰 창은 자리 잡을 때까지 안 보여요 (가운데에 잠깐 떴다 사라지지 않게 · 도련 11-05)
                run();
                const look = () => {                                            // 새로 뜬 창을 찾아 위에서 내려오게
                    if (DKD.cur !== D) return;
                    const w = dkdBoxes().find(x => !before.has(x[0]));
                    if (w) { dkdUnhide(); dkdDrop(D, w); return; }
                    if (performance.now() - t0 < 1800) requestAnimationFrame(look); else { dkdUnhide(); dkDrawerShut(false); }   // 창이 안 떴으면 서랍만 닫아요
                };
                look();
            }, 240);
        }
        const dkdAway = () => document.body.classList.contains('fc-lock') || (window.stkAway && stkAway()) || !!document.querySelector('#pelRoom.show, #pcbRoom.show, #pmRoom.show, #tkRoom.show, #spkRoom.show');   // 🏷️ 떼는 화면 · 봉투 · 모조지 · 떡메 (서랍 창이 잠깐 비켜요 · js/stickermaker.js stkLeave)
        function dkdHide(h) { if (h.classList.contains('modal')) { if (h.style.display === 'flex') closeModal(h.id); } else { h.classList.remove('show'); h.hidden = true; if (!document.querySelector('.dkw-room:not([hidden])')) document.documentElement.classList.remove('dkw-on'); } }   // 창 바로 치우기 (연출 없이)
        function dkdUnhide() { document.documentElement.classList.remove('dk-dropping'); document.querySelectorAll('.dk-keep').forEach(h => h.classList.remove('dk-keep')); }
        function dkdDrop(D, [box, host]) {
            D.win = [box, host];
            box.getAnimations().forEach(a => a.cancel());                      // 다가오는 창 연출 대신
            box.style.left = box.style.top = '';                               // 옮겨 둔 창도 화면 맨 위 가운데로
            host.classList.add('dk-drop');
            box.animate([{ translate: '0 calc(-100% - 24px)' }, { translate: '0 0' }], { duration: 420, easing: 'cubic-bezier(.2, .85, .3, 1.04)' });
            D.t = setInterval(() => { if (DKD.cur === D && !dkdOn(host) && !dkdAway()) dkDrawerShut(false); }, 250);   // 창을 다른 데서 닫으면 서랍도 (스티커를 떼러 잠깐 비킨 동안은 그대로 · 닫으면 다시 맨 위로)
        }
        function dkdFront(D) {
            D.fr.classList.remove('open'); D.fr.classList.add('bye'); D.tags.forEach(g => { g.style.transform = ''; }); if (window.sndDrawer) sndDrawer(false);
            setTimeout(() => { D.hole.remove(); D.fr.remove(); D.tags.forEach(g => { g.style.transition = ''; delete g.dataset.dkd; }); }, 280);
        }
        function dkDrawerShut(anim) {                                           // anim = 창이 위로 올라가며 사라져요 (서랍 톡 · 다른 서랍)
            const D = DKD.cur; if (!D) return; DKD.cur = null; clearInterval(D.t); dkdUnhide();
            dkdFront(D);
            const w = D.win; if (!w) return;
            const [box, host] = w, done = () => { host.classList.remove('dk-drop'); box.getAnimations().forEach(a => a.cancel()); };
            if (!anim || !dkdOn(host)) { done(); return; }
            box.animate([{ translate: '0 0' }, { translate: '0 calc(-100% - 24px)' }], { duration: 300, easing: 'cubic-bezier(.5, 0, .8, .4)', fill: 'forwards' }).onfinish = () => {
                if (host.classList.contains('modal')) closeModal(host.id); else if (window.dkwClose) dkwClose();
                setTimeout(done, 200);
            };
        }
        window.dkDrawerShut = dkDrawerShut;
        window.dkDrawerOwns = h => !!DKD.cur && !!DKD.cur.win && DKD.cur.win[1] === h;   // 이 창이 열린 서랍에서 나온 창이에요 (🗄️ 문구함 ✕ = 서랍 닫듯이 · js/deskgd.js dkwClose)
        function dkHomeOpen(k) { if (k === 'desk') { deskBoxOpen(); return; } if (window.shGoSee) setTimeout(() => shGoSee(k, 0), 0); }
        /* 🛍️ 봉투 속 = 아직 꺼내지 않았어요 (도련 11-02 · 현실처럼) : 💻 📲 책상에서는 봉투에서 꺼낼 때까지 바구니 · 스티커 정리 · 오늘 쓸 스티커 · 스티커첩 어디에도 없어요 (js/basket.js)
           s = 스티커 종이 id (카드 it.s · 살 때 적어 둬요) · b = 📒 🤍 스티커첩 id (카드 it.b) · 📱 폰은 그대로 다 보여요 (나중에 폰 정리할 때 · 도련) */
        /* 모든 상품 (도련 11-02) : g = ✏️ 문구 · 필기구 (문구함 · 펜꽂이 · js/skins.js cabOwn · js/pencase.js pkOwnIds) · u = 🪑 소품 · 🧱 🪵 (📦 소품함) · d = 📔 다이어리 (보관소 · js/dyyear.js dyyCells) */
        function deskBagHold() {
            if (!document.documentElement.classList.contains('desk-on')) return null;
            const s = new Set(), b = new Set(), g = new Set(), u = new Set(), d = new Set();
            dkBags().forEach(bg => bg.it.forEach(it => {
                (Array.isArray(it.s) ? it.s : []).forEach(id => s.add(id));
                if (it.al && it.b) b.add(it.b);                                   // 📒 🤍 스티커첩
                if (it.k === 'tool' && it.b) d.add(it.b);                          // 📔 다이어리 (보관소에도 없어요)
                if (it.k === 'gd' && it.gid) g.add(it.gid);                        // ✏️ 문구 · 필기구 (디자인 id)
                if (it.u) u.add(it.u);                                             // 🪑 소품 · 🧱 🪵 벽지 · 책상 (그 하나)
            }));
            if (window.dktHeld) dktHeld().forEach(id => s.add(id));             // 🎀 마테 정리함에 꽂힌 테이프도 바구니 · 서랍엔 없어요 (js/desktape.js)
            return { s, b, g, u, d };
        }
        window.deskBagAdd = deskBagAdd; window.deskBagOpen = deskBagOpen; window.deskBagHold = deskBagHold;
        const deskZ = () => deskZAll();
        function deskItemHtml(it, p) {
            const st = `left:${p.x}px;top:${p.y}px;width:${it.w}px;height:${it.h}px`, cls = 'desk-item' + (it.wall ? ' wall' : '') + (p.fl && dkFlipOk(it) ? ' dk-fl' : '');   // ↔ 좌우 바꾼 소품 (그림만 · 바늘은 그대로)
            let over = '';
            if (it.clock && (it.can || []).includes('clock')) {                     // 🕰 바늘 (상품 '기능' clock · 도련 11-06) (지금 시각 · deskTick)
                const c = it.clock, d = c.r * 2, hh = d * it.w / it.h;
                over = `<svg class="dk-hands" viewBox="-50 -50 100 100" aria-hidden="true" style="left:${c.cx}%;top:${c.cy}%;width:${d}%;height:${hh}%"><line class="hr" x1="0" y1="6" x2="0" y2="-24"/><line class="mn" x1="0" y1="8" x2="0" y2="-38"/><line class="sc" x1="0" y1="10" x2="0" y2="-41"/><circle r="4.5"/></svg>`;
            }
            if (it.lcd) { const [l, t, r, b] = it.lcd; over = `<span class="dk-lcd" style="left:${l}%;top:${t}%;width:${r - l}%;height:${b - t}%"><b></b></span>`; }
            return `<div class="${cls}" data-id="${it.id}" data-u="${p.u || it.id}" role="img" aria-label="${it.name}" style="${st}"><img src="${(p.u && DK.art[p.u]) || it.src}" alt="" draggable="false" crossorigin="anonymous">${over}</div>`;
        }
        /* 🕰 ⏰ 시계는 지금 시각 (1초마다 · 책상이 보일 때만) */
        function deskTick() {
            if (!document.documentElement.classList.contains('desk-on')) return;
            const n = new Date(), h = n.getHours(), m = n.getMinutes(), sec = n.getSeconds();
            document.querySelectorAll('#deskStage .dk-hands').forEach(sv => {
                sv.querySelector('.hr').setAttribute('transform', `rotate(${(h % 12) * 30 + m * .5})`);
                sv.querySelector('.mn').setAttribute('transform', `rotate(${m * 6 + sec * .1})`);
                sv.querySelector('.sc').setAttribute('transform', `rotate(${sec * 6})`);
            });
            document.querySelectorAll('#deskStage .dk-lcd b').forEach(b => { b.innerHTML = `${h % 12 || 12}<i${sec % 2 ? ' class="off"' : ''}>:</i>${String(m).padStart(2, '0')}<small>${h < 12 ? 'AM' : 'PM'}</small>`; });   // 12시간 (21시 → 9 PM · 도련 10-26)
        }
        setInterval(deskTick, 1000);
        /* 📔 책상 위 다이어리 : 톡 = 그 자리에서 떠올라 화면 가운데로 · 책상 빈 곳 톡 = 접혀서 제자리로 (js/drive.js) · 그림 = .dk-vol 틀 하나 (아래 dkVolsPaint) */
        let deskAnim = false;                                                     // 떠오르기 · 내려놓기 움직이는 중
        const DK_TILT = 71;                                                       // 눕힌 각도 (css .dk-vol.p-lay .dv-cv 와 같게)
        const dkOpenNow = () => typeof isCoverOpen !== 'undefined' && isCoverOpen;
        const dkVisEl = (bk, ip, cv) => dkOpenNow() ? (bk.classList.contains('dy-one') ? bk : ip) : cv;   // 펼침 = 두 쪽(한 쪽씩 보기면 책 자리) · 접힘 = 겉표지
        /* 🏷️ 라벨 (도련 10-29) : 사용자가 알아서 붙여요 · 켜기/끄기 · 글 · 글꼴 · 글 색 · 라벨 색 · 크기 · 세로쓰기 · 자리 (모습마다 따로 : 📚 책등 / 📔 앞면) · 🛠 꾸미기에서만 */
        const DKY_LB0 = { on: false, m: 't', ic: '', t: '', f: 'sys', c: '#8a2f58', bx: true, bg: '#fffaf3', ol: false, oc: '#ffffff', side: { x: .5, y: .3, s: 1, v: 1 }, front: { x: .5, y: .78, s: 1, v: 0 } };
        const DKY_TC = ['#8a2f58', '#5b3f4a', '#c8457a', '#7a5bb8', '#3d7fc4', '#2f8a5a', '#d08a2a', '#ffffff'];   // 🏷 이름표 색 (글 · 라벨 · 아웃라인 · dknHtml)
        const DKY_BC = ['#fffaf3', '#ffd3e2', '#e6dcf8', '#d6ecfb', '#dff4e7', '#fff1c4', '#5b3f4a', '#8a2f58'];
        const DKY_OC = ['#ffffff', '#5b3f4a', '#8a2f58', '#ffd3e2', '#fff1c4', '#d6ecfb', '#2a2a2a', '#d08a2a'];
        const dkyLb = st => { const L = Object.assign({}, DKY_LB0, (st && st.lb) || {}); L.side = Object.assign({}, DKY_LB0.side, L.side || {}); L.front = Object.assign({}, DKY_LB0.front, L.front || {}); return L; };
        const dkyFace = p => p === 'side' ? 'side' : 'front';
        /* 📔 책상 위 다이어리 자리 · 모습 (도련 10-29) : 📚 꽂기(옆모습 · 책등) · 📔 세우기(앞모습) · 🛏 눕히기
           - 🛠 책상 꾸미기에서만 끌어 옮기고 · 톡 = 모습 고르기 · ✔ 완료 때 저장 (✕ 취소 = 그대로) · 평소에는 누르면 떠올라요 (넣으면 고른 모습 그대로 돌아가요)
           - 'diary_desk_dy' { x, y : 책상 그림 px (바닥 가운데) · p : side · front · lay } (배치.json · js/drive.js DESK_KEYS)
           - 처음 = 서랍장 왼쪽 옆에 📚 꽂기 */
        const DKY_KEY = 'diary_desk_dy', DKY_LOCAL = 'malang_desk_dy';   // 세우면 실제 A6 크기쯤 (파일꽂이와 어울리게)
        const dkyDef = () => ({ x: 1196, y: 758, p: 'front' });                 // 📔 처음 = 앞을 보고 세워요 (도련 10-31 · 다꾸러가 바꾸기 전까지)
        function dkyGet() {                                                       // 펼쳐 둔 권의 자리 (권마다 따로 · 아래 📔 책상 = 다이어리 보관소)
            const c = dkyCur(), M = dkyMap();
            if (c && DK.volEdit) return dkvPos(c);                                 // 🛠 꾸미는 동안 = 고치는 중인 자리
            return c ? dkyPosOf(c) : dkyOk(M._) ? M._ : dkyDef();                  // _ = 날짜형이 아닌 다이어리를 펼쳐 둔 때
        }
        /* ═══ 📔 책상 = 다이어리 보관소 (도련 10-30 : 현실처럼 받은 다이어리는 모두 책상에) ═══
           - 모든 권 = .dk-vol 틀 하나 (펼쳐 볼 권 = .cur · 그 권 색 · 해 이름판 · 이름표) · #deskDiary = 안 보이는 자리 표시만
           - 자리 = 권마다 'diary_desk_dy' {권 id: {x, y : 바닥 가운데 · p : side · front · lay · lb · lz}} · 자리가 없는 권은 기본 다이어리 옆에 책등으로 줄지어 꽂혀요 (잃어버리지 않게)
           - 평소 다이어리 권 톡 = 그 권 펼치기 · 🛠 꾸미기 = 끌어 옮기기 · 톡 = 모습 (📚 꽂기 · 📔 세우기 · 🛏 눕히기) · 바구니 · 받침 위도 소품처럼 (dkLayers)
           - 🛍️ 봉투의 새 다이어리 카드 = 끌어 놓은 자리에 그 권 · 📔 보관소 창은 뒤에서만 (📱 폰 · 못 찾을 때 · 🛠 다이어리 메뉴 '📔 보관소') · 📦 소품함에는 안 들어가요 */
        const DKV_SZ = { side: [24, 127], front: [80, 120], lay: [150, 86] };      // 🛏 눕히기 = 표지를 비스듬히 (펼쳐 둔 권처럼 perspective · css .dk-vol.p-lay)       // 모습마다 크기 (책상 그림 px · #deskDiary 와 비슷하게)
        const dkvCol = c => { const k = DY_COL[c]; return k ? ['', k.border, k.accent] : ['', '#ffb6c1', '#ff6b81']; };   // 🧁 그 권 디자인의 색 (js/app.js · 디자인 속성이 없으면 분홍으로 보여만 줘요)
        const dkyCur = () => { if (typeof dkType === 'function' && dkType()) { const n = typeof dyNow === 'function' ? dyNow() : null; return n && n.my ? n.id : ''; } return (window.dyyBookId ? dyyBookId() : '') || ''; };   // 📓 🗂️ 페이지 다이어리를 펼쳐 둔 때 = 그 권 (도련 11-06)
        const dkyMap = () => { const v = typeof prefGet === 'function' ? prefGet(DKY_KEY, DKY_LOCAL) : null; return v && typeof v === 'object' && !('x' in v) ? v : {}; };
        const dkyOk = v => v && isFinite(+v.x) && isFinite(+v.y) && ['side', 'front', 'lay'].includes(v.p);
        const dkvBooks = () => window.dyyBooks ? dyyBooks() : [];
        /* 📓 🗂️ 페이지노트 · 페이지바인더도 책상에 (도련 11-06 · '내가 만든' 칸의 권 · 톡 = 그 권 펼치기) */
        const dkvPages = () => (window.dmkAll ? dmkAll() : []).map(d => ({ t: 'pg', id: d.id, g: d.g, k: d.k, col: [d.c, (d.cols && d.cols.강조색) || d.c] }));
        /* 📒 스티커 바인더 · 🤍 이형지북도 책상에 (도련 10-30) : js/basket.js abDeskList 로 읽어 둔 것 (DK.albs) · 톡 = 그 종류 창에서 그 책 */
        /* 🛍️ 가게에서 산 다이어리 · 스티커첩 = 봉투 속 (도련 10-30 : 꺼내 놓기 전엔 책상에 없어요) · 'diary_desk_dy' 의 _bag = [id] · 꺼내 놓으면 빠져요 (dkvPlace) */
        const dkBagged = () => { const b = dkyMap()._bag; return Array.isArray(b) ? b : []; };
        /* 🎁 처음 선물 권 자리 (도련 11-06 · 상품공방 '처음책상' { x, y, p: side · front · lay } · 앱은 그대로) : 자리가 없으면 🛍️ 봉투에 (꺼내 놓을 때까지 책상에 없어요)
           L = [{ id, spot, n : 이름, al : 스티커첩, k : 그 종류 }] · js/dyyear.js dyyGift · js/dymaker.js dmkStarter · js/basket.js bkStarterTools */
        const dkySpot = v => v && typeof v === 'object' && isFinite(+v.x) && isFinite(+v.y) && v.x !== '' && v.y !== '' && DKV_SZ[v.p] ? { x: Math.round(+v.x), y: Math.round(+v.y), p: v.p } : null;
        function deskVolInit(L) {
            if (typeof prefSet !== 'function' || !Array.isArray(L) || !L.length) return;
            const M = dkyMap(), bag = [];
            L.forEach(o => { const s = dkySpot(o.spot); if (s) M[o.id] = s; else { M._bag = (Array.isArray(M._bag) ? M._bag : []).filter(x => x !== o.id).concat([o.id]); bag.push(Object.assign({ k: o.al ? o.k : 'tool', n: String(o.n || '').slice(0, 30), b: o.id }, o.al ? { al: 1 } : {})); } });
            prefSet(DKY_KEY, DKY_LOCAL, M);
            if (bag.length) deskBagAdd(bag);
            dkDeskBooks(true);
        }
        window.deskVolInit = deskVolInit;
        function dkBagHold(id) { const M = dkyMap(); M._bag = dkBagged().filter(x => x !== id).concat([id]); if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M); }
        window.dkBagHold = dkBagHold;
        const dkvAll = () => { const bg = dkBagged(); return dkvBooks().map(b => Object.assign({ t: 'dy' }, b)).concat(dkvPages(), (DK.albs || []).map(a => Object.assign({}, a))).filter(x => !bg.includes(x.id)); };
        const dkvOf = id => dkvAll().find(x => x.id === id);
        function dkyPosOf(id) {                                                   // 그 권 자리 (없으면 줄지어 꽂힌 자리)
            const M = dkyMap(); if (dkyOk(M[id])) return M[id];
            const L = dkvAll().filter(b => !dkyOk(M[b.id])), k = Math.max(0, L.findIndex(b => b.id === id));
            if (!k) return { x: DESK_W / 2, y: 850, p: 'lay' };                      // 🛏 처음 = 첫 권은 책상 가운데 앞에 눕혀요 (도련 11-03 · 떠 있던 다이어리를 내려놓으면 여기)
            return { x: 1196 - (DKV_SZ.front[0] + 10) * (k - 1), y: 758, p: 'front' };   // 다른 권 = 앞을 보고 나란히 (도련 10-31)
        }
        const dkvName = b => b.t === 'pg' ? String(b.g || '') : b.t === 'bd' || b.t === 'rl' ? `${b.lb || DKH_NAMES[b.k] || ''} ${b.t === 'bd' ? '바인더' : '이형지북'}` : (window.dyyTitle ? dyyTitle(b) : b.id);
        const dkvIc = b => b.t === 'bd' ? '📒' : b.t === 'rl' ? '🤍' : b.t === 'pg' ? (b.k === '노트' ? '📓' : '🗂️') : '📔';
        const dkvPos = id => (DK.volEdit && DK.volEdit[id]) || dkyPosOf(id);
        function dkVolsPaint() {
            const st = document.getElementById('deskStage'); if (!st) return;
            st.querySelectorAll('.dk-vol').forEach(x => x.remove());
            const cur = dkyCur(), at = st.querySelector('.dk-diary');
            dkvAll().forEach(b => {                                               // 📔 모든 권 = 이 틀 하나 (펼쳐 볼 권도 · .cur · 새로 그리지 않기 · 도련 10-30)
                const v = dkvPos(b.id), [w, h] = DKV_SZ[v.p] || DKV_SZ.side, C = b.col ? ['', b.col[0], b.col[1]] : dkvCol(b.c);
                const el = document.createElement('div'); el.className = 'dk-vol p-' + v.p + (b.t === 'pg' ? (b.k === '노트' ? ' note pg' : ' pg') : b.t !== 'dy' ? ' alb ' + b.t : '') + (b.t === 'dy' && window.dyyIsNote && dyyIsNote(b) ? ' note' : '') + (b.id === cur ? ' cur' : ''); el.dataset.b = b.id; el.setAttribute('role', 'button'); el.title = `${dkvIc(b)} ${dkvName(b)}`;
                Object.assign(el.style, { left: Math.round(v.x - w / 2) + 'px', top: Math.round(v.y - h) + 'px', width: w + 'px', height: h + 'px' });
                el.style.setProperty('--dy-c', C[1]); el.style.setProperty('--primary-accent', C[2]);
                const lb = b.t === 'dy' ? b.y : b.t === 'pg' ? (b.k === '노트' ? '📓' : '🗂️') + (v.p === 'side' ? '' : ' ' + htmlEsc(String(b.g || '').slice(0, 6))) : (b.t === 'bd' ? '📒' : '🤍') + (v.p === 'side' ? '' : ' ' + htmlEsc(String(b.lb || DKH_NAMES[b.k] || '').slice(0, 6)));   // 📒 🤍 = 아이콘 + 종류(이름표)
                el.innerHTML = v.p === 'lay' ? `<i class="dv-pg"></i><i class="dv-cv"><b>${lb}</b></i>` : `<i class="dv-cv"><b>${lb}</b></i>`;
                const L = dkyLb(v), fc = dkyFace(v.p);                                // 🏷 그 권 이름표 (펼쳐 둔 권과 같은 이름표 · 책등 / 앞면 따로)
                if (L.on && (L.t || L.m === 'i' || DK.edit)) { el.querySelector('.dv-cv').appendChild(dknBuild(Object.assign({}, L, L[fc]), { t: '이름표', ic: dkvIc(b) }, 'dky-lb ' + fc)); el.classList.add('has-lb'); }
                if (DK.volSel === b.id) el.classList.add('pose-on');
                el.addEventListener('pointerdown', ev => dkvDown(ev, el));
                st.insertBefore(el, at);
            });
            dkLayers();
        }
        /* 권 자리 바꾸기 (🛠 꾸미는 동안 = DK.volEdit · ✔ 완료 때 저장) */
        function dkvSet(id, v) { if (DK.volEdit) DK.volEdit[id] = Object.assign({}, dkvPos(id), v); }
        const dkvFromEl = el => { const x = parseFloat(el.style.left) + parseFloat(el.style.width) / 2, y = parseFloat(el.style.top) + parseFloat(el.style.height); return { x: Math.round(x), y: Math.round(y) }; };
        function dkvDown(ev, el) {
            if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
            const id = el.dataset.b, x0 = ev.clientX, y0 = ev.clientY, s = DK.s || 1, v0 = dkvPos(id); let moved = false;
            if (DK.edit) deskSelect(null);
            const mv = e => {
                if (e.pointerId !== ev.pointerId || !DK.edit) return; const dx = (e.clientX - x0) / s, dy = (e.clientY - y0) / s; if (!moved && Math.hypot(dx, dy) < 5) return;
                if (!moved) { moved = true; el.classList.add('lift'); dkvMenu(null); }
                const x = Math.round(Math.max(40, Math.min(1632, v0.x + dx))), y = Math.round(dkBoxFloor(x, Math.max(120, Math.min(930, v0.y + dy)), null));
                const [w, h] = DKV_SZ[v0.p] || DKV_SZ.side; el.style.left = Math.round(x - w / 2) + 'px'; el.style.top = Math.round(y - h) + 'px'; dkLayers();
            };
            const up = e => {
                if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); el.classList.remove('lift');
                if (e.type === 'pointercancel') return;
                if (!DK.edit) { if (Math.hypot(e.clientX - x0, e.clientY - y0) < 10) dkVolOpen(id); return; }   // 평소 톡 = 그 권 펼치기
                if (moved) { dkvSet(id, dkvFromEl(el)); dkVolsPaint(); dkvMenu(null); } else dkvMenu(id);
            };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        /* 🛠 다이어리 권 모습 창 (펼쳐 둔 권의 📔 모습 창과 같은 모양) */
        function dkvMenu(id) {
            let m = document.getElementById('dkVolMenu');
            document.querySelectorAll('.dk-vol.pose-on').forEach(x => x.classList.remove('pose-on'));
            DK.volSel = id && DK.edit ? id : null;
            if (!id || !DK.edit) { if (m) m.hidden = true; dkvLbPanel(false); dkSelPaint(); return; }
            if (!m) { m = document.createElement('div'); m.id = 'dkVolMenu'; m.className = 'dkv-menu'; document.body.appendChild(m); m.addEventListener('pointerdown', e => e.stopPropagation());
                addEventListener('pointerdown', e => { if (!m.hidden && !e.target.closest('#dkVolMenu, .dk-vol, .dky-lbp, #dknEmoWin')) dkvMenu(null); }, true); }
            const b = dkvOf(id), el = document.querySelector(`.dk-vol[data-b="${id}"]`); if (!b || !el) return;
            const p = dkvPos(id).p, bx = dkItemBox(el), bo = bx && DK.items.find(x => x.u === bx.dataset.u);
            m.innerHTML = `<b class="dkt-hd"><span class="dkt-chip">${dkvIc(b)} ${b.t === 'dy' ? '다이어리' : '스티커첩'}</span>${dkvName(b)}${bo ? `<small>🧺 ${htmlEsc(dkName(bo))} 안</small>` : ''}</b>`
                + [['side', '📚 꽂기'], ['front', '📔 세우기'], ['lay', '🛏 눕히기']].map(([k, n]) => `<button type="button" class="${p === k ? 'on' : ''}" onclick="dkvPose('${id}','${k}')">${n}</button>`).join('')
                + `<button type="button" class="dky-lbb" onclick="dkvLbPanel('${id}')">🏷 이름표</button><button type="button" onclick="dkvLayer('${id}',1)">⬆ 앞으로</button><button type="button" onclick="dkvLayer('${id}',-1)">⬇ 뒤로</button>`;   // 펼쳐 둔 권 메뉴와 같게 (도련 10-30)
            const r = el.getBoundingClientRect(); m.style.left = (r.left + r.width / 2) + 'px'; m.style.top = Math.min(innerHeight - 110, r.bottom + 14) + 'px'; m.hidden = false;
            el.classList.add('pose-on'); dkSelPaint();
        }
        function dkvPose(id, p) { dkvSet(id, { p }); dkVolsPaint(); dkvMenu(id); const pn = document.getElementById('dkvLbPanel'); if (pn && !pn.hidden) dkvLbPanel(id); }
        function dkvLayer(id, d) {                                                // ⬆ ⬇ (펼쳐 둔 권 dkyLayer 와 같게 · 겹친 것만 세어요)
            const v = dkvPos(id), lz = (v.lz || 0) + d; dkvSet(id, { lz }); dkLayers();
            const el = document.querySelector(`.dk-vol[data-b="${id}"]`), got = (DK.lzDone && el && DK.lzDone.get(el)) || 0; dkvSet(id, { lz: got || undefined }); dkLayers();
        }
        /* 🏷 그 권 이름표 창 (펼쳐 둔 권 · 소품과 같은 창 dknHtml) */
        function dkvLbPanel(id) {
            let pn = document.getElementById('dkvLbPanel');
            if (!id || !DK.edit) { if (pn) pn.hidden = true; return; }
            if (!pn) { pn = document.createElement('div'); pn.id = 'dkvLbPanel'; pn.className = 'dky-lbp'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); }
            const v = dkvPos(id), L = dkyLb(v), fc = dkyFace(v.p), b = dkvOf(id);
            pn.dataset.b = id;
            pn.innerHTML = dknHtml(Object.assign({}, L, L[fc]), 'dkvLbSet', 'dkvLbPanel(false)', `${b ? dkvIc(b) + ' ' + dkvName(b) + ' · ' : ''}${fc === 'side' ? '📚 책등' : '📔 앞면'} · 자리는 가로 · 세로로`, { t: '예 : 2026 · 일기', ic: b ? dkvIc(b) : '📔' });
            pn.hidden = false;
        }
        function dkvLbSet(k, v, live) {
            const pn = document.getElementById('dkvLbPanel'), id = pn && pn.dataset.b; if (!id || !DK.edit) return;
            const P = dkvPos(id), L = dkyLb(P), g = L[dkyFace(P.p)];
            if (k === 's' || k === 'x' || k === 'y') g[k] = +v; else if (k === 'v') g.v = v ? 1 : 0; else if (k === 'on' || k === 'bx' || k === 'ol') L[k] = !!v; else if (k === 't') L.t = String(v).slice(0, 20); else if (k === 'ic') L.ic = String(v).slice(0, 40); else L[k] = v;
            dkvSet(id, { lb: L }); dkVolsPaint(); if (!live) dkvLbPanel(id);
        }
        window.dkvLayer = dkvLayer; window.dkvLbPanel = dkvLbPanel; window.dkvLbSet = dkvLbSet;
        /* 평소 다이어리 권 톡 = 그 권 펼치기 (펼쳐 둔 권은 먼저 저장 · js/dyyear.js dyySelect) */
        function dkVolOpen(id) {
            const a = dkvOf(id);
            if (a && a.t === 'pg') { if (deskAnim) return; if (dyNow().id !== id) dySet(id); dkDeskBooks(); requestAnimationFrame(() => deskOpenDiary()); return; }   // 📓 🗂️ 페이지 다이어리 = 그 권 펼치기 (도련 11-06)
            if (a && a.t !== 'dy') { if (window.abOpenAt) abOpenAt(a.k, a.t, a.id); return; }   // 📒 🤍 = 그 종류 창에서 그 책 펼치기
            if (deskAnim || !window.dyySelect) return;
            if (id === dkyCur()) { deskOpenDiary(); return; }                       // 펼쳐 볼 권 = 바로
            dyySelect(id);                                                        // → dyyPaint → dkDeskBooks (펼쳐 둔 권이 바뀌어 자리도 바뀌어요)
            dkDeskBooks(); requestAnimationFrame(() => deskOpenDiary());
        }
        /* 펼쳐 둔 권 · 나머지 권 다시 그리기 (권이 바뀌거나 · 새로 받거나 · 버렸을 때 · js/dyyear.js dyyPaint) */
        function dkDeskBooks(alb) {
            if (!document.getElementById('deskStage')) return;
            if ((alb || !DK.albs) && window.abDeskList && !DK.albGet) { DK.albGet = true; abDeskList().then(L => { DK.albGet = false; const was = JSON.stringify(DK.albs || null); DK.albs = L; if (was !== JSON.stringify(L)) dkVolsPaint(); }).catch(() => { DK.albGet = false; }); }   // 📒 🤍 스티커첩 (한 번 읽어 두고 · 받으면 다시)
            dkVolsPaint();
        }
        /* 🛍️ 봉투의 새 다이어리 카드를 책상에 놓아요 (그 자리 · 📚 꽂기) */
        function dkvPlace(id, cx, cy) {
            const stg = document.getElementById('deskStage'), R = stg && stg.getBoundingClientRect(); if (!R) return false;
            if (cx < R.left || cx > R.right || cy < R.top || cy > R.bottom) return false;
            const s = DK.s || 1, x = Math.round(Math.max(40, Math.min(1632, (cx - R.left) / s))), y = Math.round(dkBoxFloor(x, Math.max(120, Math.min(930, (cy - R.top) / s + 60)), null));
            const M = dkyMap(); M[id] = Object.assign({}, dkyOk(M[id]) ? M[id] : {}, { x, y, p: (M[id] && M[id].p) || 'front' });   // 처음 = 앞을 보고 세워요
            if (Array.isArray(M._bag)) { M._bag = M._bag.filter(x => x !== id); if (!M._bag.length) delete M._bag; }   // 봉투에서 꺼냈어요
            if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M);
            dkDeskBooks(); dkvFront(id); return true;
        }
        function dkvHome(id) {                                                    // 📚 다이어리 줄의 빈자리에 (자리를 지우면 dkyPosOf 가 줄지어 세워요)
            const M = dkyMap(); delete M[id];
            if (Array.isArray(M._bag)) { M._bag = M._bag.filter(x => x !== id); if (!M._bag.length) delete M._bag; }
            if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M);
            dkDeskBooks(); dkvFront(id);
        }
        /* 📔 봉투에서 꺼내 놓은 권은 겹친 소품보다 앞에 (도련 10-31 : 소품 뒤에 숨었어요) · ⬆ 앞으로(dkvLayer)와 같은 방법 = 겹친 것만 세어 맨 앞 */
        function dkvFront(id) {
            const put = lz => { const M = dkyMap(); M[id] = Object.assign({}, dkyPosOf(id)); if (lz) M[id].lz = lz; else delete M[id].lz; if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M); dkLayers(); };
            put(99);
            const el = document.querySelector(`#deskStage .dk-vol[data-b="${id}"]`);
            put((DK.lzDone && el && DK.lzDone.get(el)) || 0);
        }
        window.dkVolsPaint = dkVolsPaint; window.dkDeskBooks = dkDeskBooks; window.dkvPose = dkvPose;

        const dkyApply = () => dkLayers();                                       // 📔 권 자리가 바뀌면 레이어만 (권 그림 = dkVolsPaint)
        /* 떠오르기 · 내려앉기 = 책상 위 그 권 그림(.dk-vol.cur)에서 · 그 그림으로 (모든 권이 같은 틀이라 놓인 모습 그대로 이어져요) */
        function dkDeskTf(w) {
            const bk = document.getElementById('diaryBook'), ip = document.getElementById('innerPage'), cv = document.getElementById('coverPage');
            const vo = document.querySelector('#deskStage .dk-vol.cur'), f = vo && vo.querySelector('.dv-cv'); if (!f) return 'none';
            const rw = w.getBoundingClientRect(), rv = dkVisEl(bk, ip, cv).getBoundingClientRect();
            const ox = rv.left + rv.width / 2 - rw.left, oy = rv.bottom - rw.top;
            w.style.transformOrigin = `${ox}px ${oy}px`;
            const p = dkyGet().p, s = DK.s || 1;
            if (p !== 'lay') {                                                    // 📚 📔 세운 권 : 그 표지 높이에 맞게 · 📚 꽂기는 옆으로 돌아 책등만
                const T = f.getBoundingClientRect(), k = T.height / rv.height;
                return `translate(${T.left + T.width / 2 - rw.left - ox}px, ${T.bottom - rw.top - oy}px) scale(${k})` + (p === 'side' ? ' perspective(1400px) rotateY(-84deg)' : '');
            }
            const R = vo.getBoundingClientRect(), k = (DKV_SZ.lay[0]) / rv.width, bx = R.left + R.width / 2, by = R.bottom - 13 * s;   // 🛏 눕힌 표지 = 같은 각도 (css .dk-vol.p-lay .dv-cv)
            return `translate(${bx - rw.left - ox}px, ${by - rw.top - oy}px) scale(${s}) perspective(900px) rotateX(${DK_TILT}deg) scale(${k})`;
        }
        function deskOpenDiary() {
            const H = document.documentElement, w = document.getElementById('diaryWrapper');
            if (deskAnim || !w || H.classList.contains('desk-show')) return;
            deskAnim = true; deskSelect(null);
            H.classList.add('desk-show');                                         // 로그인 뒤 처음은 늘 접힌 채 (isCoverOpen = false) · 그 뒤로는 내려놓은 모양 그대로
            if (typeof refreshLayout === 'function') refreshLayout();             // 📐 떠오르기 전에 크기 · 펼침면을 지금 화면(하단 메뉴 포함)에 맞춰요 (숨어 있는 동안 맞춘 크기로 크게 떴다가 줄던 것 · 도련 10-28)
            const tf = dkDeskTf(w);                                               // 책상 위 그 권 그림(.dk-vol.cur)에서 떠올라요 (그 그림은 desk-show 동안 숨어요)
            H.classList.add('dk-landing'); requestAnimationFrame(() => requestAnimationFrame(() => H.classList.remove('dk-landing')));   // 화면 도구(안내 쪽지 · 핀셋)는 떠오르며 스르르
            const a = w.animate([{ transform: tf }, { transform: 'none' }], { duration: 640, easing: 'cubic-bezier(.2, .8, .2, 1)' });
            a.onfinish = a.oncancel = () => { w.style.transformOrigin = ''; deskAnim = false; };
        }
        function deskCloseDiary() {
            const H = document.documentElement, w = document.getElementById('diaryWrapper');
            if (deskAnim || !w || !H.classList.contains('desk-show')) return;
            if (window.penRest) penRest();                                        // ✏️ 든 필기구는 페이지에 놓고 쓴 것은 붙여요 (도련 11-03 · 손에 든 채 접히지 않게)
            if (typeof turn !== 'undefined' && turn) return;                      // 넘기는 중에는 그대로
            if (dkOpenNow()) {                                                    // 📕 펼친 채로는 책상에 안 놓아요 (도련 10-30) : 먼저 저장 → 왼쪽 쪽이 오른쪽으로 덮이며 접혀요 → 겉표지로 내려앉아요
                try { if (typeof saveData === 'function') saveData(false); } catch (e) {}
                deskAnim = true;
                const ip = document.getElementById('innerPage'), done = () => { dkFoldShut(); deskAnim = false; requestAnimationFrame(() => requestAnimationFrame(deskCloseDiary)); };
                if (!ip || matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
                const a = ip.animate([{ transform: 'none', opacity: 1 }, { transform: 'scaleX(.5)', opacity: .6 }], { duration: 280, easing: 'ease-in' });
                ip.style.transformOrigin = '100% 50%'; a.onfinish = a.oncancel = () => { ip.style.transformOrigin = ''; done(); };
                return;
            }
            deskAnim = true;
            H.classList.add('dk-landing');                                        // 화면 도구는 내려앉는 동안 스르르 사라져요 (책상 위 다이어리엔 없어요)
            const a = w.animate([{ transform: 'none' }, { transform: dkDeskTf(w) }], { duration: 560, easing: 'cubic-bezier(.45, 0, .55, 1)', fill: 'forwards' });
            a.onfinish = () => { H.classList.remove('desk-show', 'dk-landing'); a.cancel(); w.style.transformOrigin = ''; deskAnim = false; };
        }
        function dkFoldShut() {                                                   // 겉표지로 덮어요 (다시 펴면 밀어서 열기부터)
            if (!dkOpenNow()) return;
            isCoverOpen = false; selectedElement = null;
            const ip = document.getElementById('innerPage'), cp = document.getElementById('coverPage');
            if (ip) ip.style.display = 'none'; if (cp) cp.style.display = '';
            if (typeof refreshLayout === 'function') refreshLayout();
            if (typeof updateTextPanel === 'function') updateTextPanel();
        }
        function deskFit() {                                                      // 책상 그림 크기 그대로 · 화면 꽉 (cover · 아래 맞춤)
            const st = document.getElementById('deskStage'); if (!st) return;
            const W = innerWidth, H = innerHeight, s = Math.max(W / DESK_W, H / DESK_H);
            const tx = (W - DESK_W * s) / 2, ty = H - DESK_H * s;
            DK.s = s; st.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; st.style.setProperty('--dk-inv', (1 / s).toFixed(3));
            deskKeepIn(-tx / s, -ty / s, (W - tx) / s, (H - ty) / s);
            deskTipPlace();
        }
        /* 기능 소품이 화면 밖으로 많이 잘리면 (좁은 창 · 세운 아이패드) 보이는 곳 안쪽으로 당겨 보여 줘요 · 저장한 자리(DK.base)는 그대로 · 넓어지면 제자리 */
        function deskKeepIn(x0, y0, x1, y1) {
            if (DK.drag) return;
            const M = 12, moved = [];
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const b = DK.base[el.dataset.u]; if (!b) return;
                let x = b.x, y = b.y; const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
                if (el.dataset.fn) {
                    const vis = Math.max(0, Math.min(x + w, x1) - Math.max(x, x0)) * Math.max(0, Math.min(y + h, y1) - Math.max(y, y0)) / (w * h);
                    if (vis < .7) { x = Math.max(x0 + M, Math.min(x1 - M - w, x)); y = Math.max(y0 + M, Math.min(y1 - M - h, y)); moved.push(el); }
                }
                el.style.left = x + 'px'; el.style.top = y + 'px';
            });
            DK.pull = new Set(moved);                                            // 당겨 보여 준 소품은 맨 앞 (다른 소품에 가려 못 누르지 않게 · dkLayers)
            deskZAll();
        }
        function deskWire(el) {
            let p = null;
            el.addEventListener('pointerdown', ev => {
                if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
                if (!DK.edit) { p = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, tap: true }; return; }   // 평소 = 톡만 (안 움직여요)
                p = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top), on: false };
                if (dkDef(el).surf) {                                            // 위에 올려 둔 물건은 함께 움직여요
                    const mine = deskSurfs(null).filter(s => s.el === el);
                    p.riders = [...document.querySelectorAll('#deskStage .desk-item, #deskStage .dk-vol')].filter(o => o !== el && deskOn(o, mine)).map(o => ({ o, dx: parseFloat(o.style.left) - p.l, dy: parseFloat(o.style.top) - p.t }));
                }
                if (dkIsBox(el)) {                                               // 🧺 담는 소품 = 안에 든 소품 · 다이어리도 함께
                    const ins = [...document.querySelectorAll('#deskStage .desk-item, #deskStage .dk-vol')].filter(o => o !== el && dkItemBox(o) === el && !(p.riders || []).some(r => r.o === o)).map(o => ({ o, dx: parseFloat(o.style.left) - p.l, dy: parseFloat(o.style.top) - p.t }));
                    if (ins.length) p.riders = (p.riders || []).concat(ins);
                }
                try { el.setPointerCapture(ev.pointerId); } catch (e) {}
            });
            el.addEventListener('pointermove', ev => {
                if (!p || ev.pointerId !== p.id || p.tap) return;
                if (!p.on && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 4) return;
                if (!p.on) { deskSelect(el); DK.drag = true; }
                p.on = true; el.classList.add('lift');
                let x = p.l + (ev.clientX - p.x0) / DK.s, y = p.t + (ev.clientY - p.y0) / DK.s;
                const snap = DK.snap !== ev.shiftKey, w = el.offsetWidth, h = el.offsetHeight;
                let gh = null, gv = null;
                if (snap) { x = Math.round(x / DESK_PX) * DESK_PX; y = Math.round(y / DESK_PX) * DESK_PX; }   // 16px 칸
                if (snap && !el.classList.contains('wall')) {
                    const M = DESK_M, cx = x + w / 2;
                    let best = null;                                             // 가장 가까운 면 : 다른 소품 위 · 책상 (다리가 놓일 자리 = 뒤쪽 선 조금 앞)
                    deskSurfs(el).forEach(s => { if (p.riders && p.riders.some(r => r.o === s.el)) return; const d = Math.abs(y + h - s.y); if (cx >= s.x0 && cx <= s.x1 && d < M && (!best || d < best.d)) best = { d, y: s.y }; });
                    const foot = DESK_EDGE.back + 40, df = Math.abs(y + h - foot);
                    if (df < M && (!best || df < best.d)) best = { d: df, y: foot, g: DESK_EDGE.back };
                    if (best) { y = best.y - h; gh = best.g != null ? best.g : best.y; }
                    if (Math.abs(x - DESK_EDGE.left) < M) { x = DESK_EDGE.left; gv = DESK_EDGE.left; }
                    else if (Math.abs(x + w - DESK_EDGE.right) < M) { x = DESK_EDGE.right - w; gv = DESK_EDGE.right; }
                }
                x = Math.max(-w / 2, Math.min(DESK_W - w / 2, x)); y = Math.max(0, Math.min(DESK_H - h / 2, y));
                if (!el.classList.contains('wall') && !dkIsBox(el)) y = dkBoxFloor(x + w / 2, y + h, el) - h;   // 🧺 담는 소품 안이면 바닥에 닿게
                el.style.left = x + 'px'; el.style.top = y + 'px';
                if (p.riders) p.riders.forEach(r => { r.o.style.left = (x + r.dx) + 'px'; r.o.style.top = (y + r.dy) + 'px'; });
                deskZAll();
                deskGuide(gh, gv); deskTipPlace();
            });
            const up = ev => {
                if (!p || ev.pointerId !== p.id) return; const was = p; p = null; el.classList.remove('lift'); deskGuide(null, null); DK.drag = false;
                if (was.tap) { if (ev.type !== 'pointercancel' && Math.hypot(ev.clientX - was.x0, ev.clientY - was.y0) < 10) { if (window.dcTap && dcTap(el, ev.clientX, ev.clientY)) return; if (dkHomeTap(el, ev.clientX, ev.clientY)) return; if (el.dataset.fn) deskRun(el.dataset.fn); } return; }   // 🛍️ 상품을 넣은 소품 = 그 창   // 평소 톡 = 소품 동작(누르는 곳 · js/deskcustom.js) 아니면 그 기능   // 평소 톡 = 그 기능
                if (!was.on) { if (ev.type !== 'pointercancel') { const z = dkzHit(dkHomes()[el.dataset.u] || [], dkzPct(el, ev.clientX, ev.clientY)); DK.zone = z ? `${el.dataset.u}|${z.k}` : null; deskSelect(el); } return; }   // 🛠 톡 = 고르기 · 👆 그린 칸을 톡 = 그 칸 메뉴 (소품 메뉴 대신 · 도련 10-30)
                if (window.dlPegDrop) dlPegDrop(el);                              // 📷 집게 사진 = 줄 가까이 놓으면 집혀요 (js/desklights.js)
                [el].concat((was.riders || []).map(r => r.o)).forEach(o => {      // 📦 내 소품 목록에 자리 저장 (설정.json)
                    if (o.classList.contains('dk-vol')) { dkvSet(o.dataset.b, dkvFromEl(o)); return; }   // 📔 같이 옮긴 다이어리 권
                    const v = { x: Math.round(parseFloat(o.style.left)), y: Math.round(parseFloat(o.style.top)) }, it = DK.items.find(x => x.u === o.dataset.u);
                    DK.base[o.dataset.u] = v; if (it) { it.x = v.x; it.y = v.y; }
                });
                dkSave();
            };
            el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        }
        function deskGuide(h, v) {
            const st = document.getElementById('deskStage'); if (!st) return;
            const gh = st.querySelector('.desk-guide.h'), gv = st.querySelector('.desk-guide.v');
            gh.classList.toggle('on', h != null); if (h != null) gh.style.top = h + 'px';
            gv.classList.toggle('on', v != null); if (v != null) gv.style.left = v + 'px';
        }
        function deskSelect(el) {
            document.querySelectorAll('.desk-item.sel').forEach(o => o !== el && o.classList.remove('sel'));
            if (el && DK.sel !== el) { const pn = document.getElementById('dknPanel'); if (pn && !pn.hidden && pn.dataset.u.split('|')[0] !== el.dataset.u) dknPanel(false); }   // 다른 소품을 고르면 이름표 창은 닫아요
            if (!el || (DK.zone && DK.zone.split('|')[0] !== el.dataset.u)) DK.zone = null;   // 👆 고른 칸은 그 소품에서만
            DK.sel = el; if (el) { el.classList.add('sel'); dkvMenu(null); }   // 소품을 고르면 다이어리 창은 닫아요
            const tip = document.getElementById('deskTip'); if (tip) tip.classList.toggle('on', !!el);
            deskTipPaint(); dkzPaint(); dkSelPaint();
        }
        /* 🎯 지금 고른 것 한눈에 (도련 10-30 시안) : 고른 것 = 그림 모양 따라 핑크 선 (.sel) · 들어 있는 곳 = 연보라 점선 + '○○ 안 / 위' (.dk-host) · 같이 움직이는 것 = 연보라 점선
           · 나머지 = 연하게 (.dk-dim) · 👆 칸을 고르면 소품은 연보라 점선 '○○ 안' (.zsel) + 칸 밖은 하얗게 가려요 (dkzPaint) · 📔 다이어리 모습 창(pose-on)도 같은 규칙 */
        function dkSelPaint() {
            const st = document.getElementById('deskStage'); if (!st) return;
            st.querySelectorAll('.dk-hostlb').forEach(x => x.remove());
            st.querySelectorAll('.dk-host, .dk-dim, .zsel').forEach(x => x.classList.remove('dk-host', 'dk-dim', 'zsel'));
            const vo = DK.edit && st.querySelector('.dk-vol.pose-on');                // 📔 다이어리 권 모습 창
            const el = DK.edit && DK.sel && DK.sel.classList && DK.sel.classList.contains('desk-item') ? DK.sel : vo || null;
            document.documentElement.classList.toggle('dk-sel-on', !!el);
            if (!el) return;
            const keep = new Set(), nm = x => { const o = DK.items.find(y => y.u === x.dataset.u); return o ? dkName(o) : ''; };
            const host = (h, t) => {                                              // 이름은 책상 맨 위 한 겹 (다른 소품에 가리지 않게)
                h.classList.add('dk-host'); keep.add(h); if (!t) return;
                const b = document.createElement('b'), R = h.getBoundingClientRect(), S = st.getBoundingClientRect(), k = DK.s || 1;
                b.className = 'dk-hostlb'; b.textContent = t; b.style.left = ((R.left - S.left) / k + 8) + 'px'; b.style.top = ((R.top - S.top) / k - 19) + 'px'; st.appendChild(b);
            };
            if (el && DK.zone && DK.zone.split('|')[0] === el.dataset.u) { el.classList.add('zsel'); host(el, `🪑 ${nm(el)} 안`); }
            else if (el) {
                keep.add(el);
                const box = dkItemBox(el), on = !box && deskOn(el, deskSurfs(el));
                if (box) host(box, `🧺 ${nm(box)} 안`); else if (on && on.el) host(on.el, `${nm(on.el)} 위`);
                const mine = dkDef(el).surf ? deskSurfs(null).filter(x => x.el === el) : [];
                st.querySelectorAll('.desk-item, .dk-vol').forEach(o => { if (o !== el && ((dkIsBox(el) && dkItemBox(o) === el) || (mine.length && deskOn(o, mine)))) host(o); });   // 같이 움직이는 것
            }
            st.querySelectorAll('.desk-item, .dk-vol').forEach(o => { if (!keep.has(o)) o.classList.add('dk-dim'); });
            st.querySelectorAll('.dk-front').forEach(f => { const b = st.querySelector(`.desk-item[data-u="${f.dataset.fu}"]`); if (b && b.classList.contains('dk-dim')) f.classList.add('dk-dim'); });
        }
        function deskTipPlace() {                                                 // 고른 소품 바로 위 가운데 (위가 모자라면 아래)
            const tip = document.getElementById('deskTip'), el = DK.sel; if (!tip || !el) return;
            if (DK.drag) dkSelPaint();                                            // 끄는 동안 '○○ 안 / 위'도 따라 바뀌어요
            const L = parseFloat(el.style.left), T = parseFloat(el.style.top), k = 1 / DK.s, th = (tip.offsetHeight + 14) * k;
            const st = document.getElementById('deskStage'), top0 = st ? -(innerHeight - DESK_H * DK.s) / DK.s : 0;   // 화면에 보이는 맨 위 (그림 px)
            const below = T - th < top0 + 8;
            tip.classList.toggle('below', below);
            tip.style.left = Math.max(170 * k, Math.min(DESK_W - 170 * k, L + el.offsetWidth / 2)) + 'px'; tip.style.top = (below ? T + el.offsetHeight : T) + 'px';
            tip.style.scale = k.toFixed(3);                                       // 버튼은 화면에서 늘 같은 크기
            tip.style.setProperty('--ax', '0px');                                 // 📐 화면 (또는 책상을 자르는 틀) 밖으로 나가면 안으로 밀어요 · 꼬리는 소품을 그대로 가리켜요 (도련 10-30)
            let B = { left: 0, right: innerWidth };
            for (let n = st; n && n !== document.body; n = n.parentElement) { if (getComputedStyle(n).overflowX !== 'visible') { const r = n.getBoundingClientRect(); B = { left: Math.max(B.left, r.left), right: Math.min(B.right, r.right) }; } }
            const r = tip.getBoundingClientRect(), pad = 6;
            const dx = r.left < B.left + pad ? B.left + pad - r.left : r.right > B.right - pad ? B.right - pad - r.right : 0;
            if (dx) {
                tip.style.left = (parseFloat(tip.style.left) + dx / DK.s) + 'px';
                tip.style.setProperty('--ax', Math.max(-(r.width / 2 - 22), Math.min(r.width / 2 - 22, -dx)) + 'px');
            }
        }
        /* ↔ 좌우 바꾸기 (도련 10-31 · 11-03) : 현실에서 물건을 돌려 놓는 것 (그림 뒤집기가 아니에요) · 돌릴 수 있는 종류만 = DK_TURN (지금 🪔 스탠드) · 저장 fl: 1 */
        /* ↔ 돌릴 수 있는 소품 = 상품 '기능' turn (도련 11-06 · 예전엔 종류 lamp) */ const DK_TURN_OLD = null;   // 뒤집기가 아니에요 · 도련 11-03 · 불빛도 돌린 쪽으로)
        const dkFlipOk = c => !!c && Array.isArray(c.can) && c.can.includes('turn');
        function deskFlip() {
            const el = DK.sel, o = el && DK.items.find(x => x.u === el.dataset.u); if (!o || !dkFlipOk(dkCat(o.id))) return;
            if (o.fl) delete o.fl; else o.fl = 1;
            el.classList.toggle('dk-fl', !!o.fl); dkSave(); dkLayers(); deskTipPaint();
        }
        window.deskFlip = deskFlip;
        function deskTipPaint() {                                                 // 🛠 고른 소품 위 : 기능 칩 + 🧲 · 📦 넣기 · 🗑 버리기
            const tip = document.getElementById('deskTip'), el = DK.sel; if (!tip) return;
            if (!el || !DK.edit) { tip.innerHTML = ''; return; }
            const u = el.dataset.u, m = DK.editFn || {};
            const zk = DK.zone && DK.zone.split('|')[0] === u && DK.zone.split('|')[1], ze = zk && (dkHomes()[u] || []).find(x => x.k === zk && x.r);
            if (ze) {                                                              // 👆 그린 칸을 톡 = 그 칸 메뉴 (소품 메뉴 대신 · 칸 밖을 톡 = 소품 메뉴)
                tip.innerHTML = `<b class="dkt-hd"><span class="dkt-chip lv">🗄️ 서랍 칸</span>${(dkWin(zk) || [])[1]}<small>· ${htmlEsc(dkName(DK.items.find(x => x.u === u) || {}))}</small></b><div class="dkt-act"><button type="button" class="desk-snap" onclick="deskFnOpen()">🔗 기능 연결</button></div><div class="dkt-act">`
                    + `<button type="button" class="desk-snap" onclick="dkzAct('tag','${DK.zone}')">🏷 칸 이름표</button><button type="button" class="desk-snap" onclick="dkzAct('del','${DK.zone}')">🗑 칸 빼기</button></div>`;
                deskTipPlace(); return;
            }
            const f = Object.keys(m).find(k => m[k] === u), fi = f && DK_FNS.find(x => x[0] === f);
            const me = DK.items.find(x => x.u === u), bx = dkItemBox(el), bo = bx && DK.items.find(x => x.u === bx.dataset.u);
            tip.innerHTML = `<b class="dkt-hd"><span class="dkt-chip">🪑 소품</span>${me ? htmlEsc(dkName(me)) : ''}${bo ? `<small>🧺 ${htmlEsc(dkName(bo))} 안</small>` : ''}</b>`
                + `<div class="dkt-act">${me && dkHoldOk(me.id).length ? `<button type="button" class="desk-snap${fi ? ' on' : ''}" onclick="deskFnOpen()">🔗 기능 연결</button>` : ''}`   // 기능 연결은 창으로 (도련 10-28) · 연결돼도 글은 늘 '기능 연결' (기능 이름이면 샵 가는 버튼으로 착각 · 도련 10-28)
                + `<button type="button" class="desk-snap" onclick="deskTipAct('paint')">🎨 꾸미기</button><button type="button" class="desk-snap" onclick="deskTipAct('box')">📦 넣기</button></div>`
                + `<div class="dkt-act"><button type="button" class="desk-snap" onclick="dknPanel(true)">🏷 소품 이름표</button><button type="button" class="desk-snap" onclick="deskLayer(1)">⬆ 앞으로</button><button type="button" class="desk-snap" onclick="deskLayer(-1)">⬇ 뒤로</button>${me && dkFlipOk(dkCat(me.id)) ? `<button type="button" class="desk-snap${me.fl ? ' on' : ''}" onclick="deskFlip()">↔ 좌우</button>` : ''}${(DK.items.find(x => x.u === u) || {}).lz ? '<button type="button" class="desk-snap" onclick="deskLayer(0)">↺ 자동</button>' : ''}</div>`;   // 🗂 레이어 (도련 10-29 : 자동 + 손으로)   // 🧲 딱 맞추기 = 작업대 · 📤 저장(공유)은 숨김 · 🗑 버리기는 📦 소품함에서
            deskTipPlace();
        }
        /* 🔗 기능 연결 창 (도련 10-28) : 고른 소품에 기능 하나 · 다시 누르면 풀기 */
        /* 🔗 기능 연결 창 (도련 10-30 : 모든 창 한 목록) : 📌 기본 기능 · 🛍️ 상품 창 · 지금 고른 곳 = 소품 전체 / 👆 칸 / ➕ 새 칸 · 맨 아래 ➕ 누르는 곳을 따로 정해 추가 */
        function deskFnOpen() {                                                   // 🔗 넣을 것 고르기 창 (도련 11-01 : 그 소품에 넣을 수 있는 것만 · 서랍장 = 칸마다)
            const el = DK.sel; if (!DK.edit || !el) return;
            const u = el.dataset.u, m = DK.editFn || {}, o = DK.items.find(x => x.u === u), box = document.getElementById('deskFnList'); if (!box || !o) return;
            const ok = dkHoldOk(o.id), S = dkSlots(o.id), H = dkHomes(); if (!ok.length) return;
            const where = k => { if (m[k]) { const x = DK.items.find(y => y.u === m[k]); return x ? dkName(x) : ''; } const zu = Object.keys(H).find(y => H[y].some(e => e.k === k)), x = zu && DK.items.find(y => y.u === zu), e = x && H[zu].find(y => y.k === k); return x ? `${dkName(x)} ${dkSlotNm(e.s, (dkSlots(x.id) || []).length)} 칸` : ''; };
            const tt = document.getElementById('deskFnTitle'); if (tt) tt.textContent = dkName(o) + (S ? '의 서랍마다 넣을 것' : '에 넣을 것');
            const again = "document.getElementById('deskFnModal').style.display !== 'none' && deskFnOpen()";
            const btn = (k, mine, s) => { const [, n, , ic] = dkWin(k), w = mine ? '' : where(k);
                return `<button type="button" class="btn${mine ? ' on' : ''}" onclick="deskFnPick('${k}'${S ? ',' + s : ''}).then(() => ${again})"><b>${ic} ${n}</b><small>${mine ? (S ? '✔ 이 칸' : '✔ 넣었어요 · 누르면 빼기') : w ? '지금 : ' + w : ''}</small></button>`; };
            box.innerHTML = S ? S.map((r, s) => { const cur = (H[u] || []).find(e => e.s === s);
                    return `<h4 class="dkf-g">🗄️ ${dkSlotNm(s, S.length)} 칸</h4>` + ok.map(k => btn(k, !!cur && cur.k === k, s)).join('') + (cur ? `<button type="button" class="btn" onclick="deskFnPick('', ${s}).then(() => ${again})"><b>비우기</b><small>이 칸을 빈 서랍으로</small></button>` : ''); }).join('')
                    + '<p class="dkf-note">💡 같은 것은 한 곳에만 있어요 · 다른 칸이나 소품에 넣으면 그리로 옮겨요</p>'
                : `<h4 class="dkf-g">🧺 넣을 수 있는 것</h4>` + ok.map(k => btn(k, m[k] === u)).join('');
            if (window.openModal) openModal('deskFnModal');
        }
        window.deskFnOpen = deskFnOpen;
        function deskSnapToggle() { DK.snap = !DK.snap; dkSet(DK_SNAP, DK.snap); deskTipPaint(); dkSnapBtn(); }
        function dkSnapBtn() { const b = document.getElementById('dkeSnap'); if (b) { b.textContent = DK.snap ? '🧲 딱 맞추기' : '〰️ 자유롭게'; b.classList.toggle('on', DK.snap); } }
        document.addEventListener('pointerdown', ev => {                          // 다른 곳을 누르면 고르기 끝
            if (!DK.sel) return; const t = ev.target;
            if (t.closest && (t.closest('.desk-item') || t.closest('#deskTip') || t.closest('#deskEditBar') || t.closest('#deskEditTray') || t.closest('.modal'))) return;
            deskSelect(null);
        }, true);
        window.addEventListener('resize', () => requestAnimationFrame(deskFit));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', deskBuild); else deskBuild();
        /* 📔 로그인하면 늘 다이어리 겉표지가 떠요 (도련 10-31) : 처음 온 다꾸러 = 기본 다이어리 · 쓰던 다꾸러 = 마지막으로 다꾸한 다이어리 (설정 'diary_last_deco' · js/elements.js saveData)
           js/drive.js postLoginTasks 끝에서 (구글 · 이 기기 폴더 모두) */
        const DK_LAST = 'diary_last_deco', DK_LAST_L = 'malang_last_deco';
        function deskLoginShow() {
            if (!document.documentElement.classList.contains('desk-on') || !document.getElementById('deskStage')) return;
            setTimeout(() => {                                                    // 로그인 문이 걷힌 뒤 (권 목록도 다 읽은 뒤)
                const gf = window.dkGiftFloat;                                    // 🎁 처음 온 날 = 상품공방 '처음띄움' 권만 떠요 (도련 11-06 · '' = 아무 권도 안 떠요 · 'pg' = 페이지 다이어리가 받고 나서 떠요)
                if (gf !== undefined) { if (gf !== 'pg') window.dkGiftFloat = undefined; dkDeskBooks(); if (gf && gf !== 'pg') requestAnimationFrame(() => deskOpenDiary()); return; }
                const last = prefGet(DK_LAST, DK_LAST_L), own = window.dyyBooks ? dyyBooks().map(b => b.id) : [];   // 버린 권이면 그대로
                if (last && own.includes(last) && last !== dkyCur() && window.dyySelect) { dyySelect(last); dkDeskBooks(); }
                requestAnimationFrame(() => deskOpenDiary());                     // 이미 떠 있으면 그대로 (권만 바뀌어요)
            }, 350);
        }
        function deskLastDeco() { const id = dkyCur(); if (id && prefGet(DK_LAST, DK_LAST_L) !== id) prefSet(DK_LAST, DK_LAST_L, id); }   // 꾸민 내용이 바뀌었을 때만 (js/elements.js)
        window.deskLoginShow = deskLoginShow; window.deskLastDeco = deskLastDeco;
        /* 🪑 오른쪽 위 🛠 책상 꾸미기 · 🚪 이동 (도련 10-31) : 다이어리가 떠 있으면 먼저 저장 → 접히며 제자리 → 저장이 잘 됐을 때만 그 버튼 일 */
        let deskTopBusy = false;
        async function deskTopGo(run) {
            const H = document.documentElement;
            if (!H.classList.contains('desk-show')) { run(); return; }
            if (deskTopBusy || deskAnim) return;
            deskTopBusy = true;
            try {
                if (typeof isCoverOpen !== 'undefined' && isCoverOpen && typeof saveData === 'function') await deskSaveSure();
                deskCloseDiary();
                const t0 = Date.now();
                while ((H.classList.contains('desk-show') || deskAnim) && Date.now() - t0 < 6000) await new Promise(r => setTimeout(r, 80));
                if (!H.classList.contains('desk-show')) run();
            } finally { deskTopBusy = false; }
        }
        /* 💾 저장은 실패하면 안 돼요 (도련 10-31) : 될 때까지 다시 · 늦어지면 왜 늦는지 알려 줘요 (화면 위 '저장 중' 표시 = js/elements.js saveBusy) */
        async function deskSaveSure() {
            const why = () => {                                                   // 지금 저장할 수 없는 이유 (saveData 는 이때 조용히 건너뛰어요)
                if (typeof drive === 'undefined' || drive.guest) return '';
                const k = typeof getDateKey === 'function' ? getDateKey(currentDate) : '';
                if (!drive.ready) return '드라이브에 다시 연결하는 중이에요';
                if (k && !drive.loadedDays.has(k)) { if (typeof ensureKeyLoaded === 'function') ensureKeyLoaded(k).catch(() => {}); return '이 날짜를 드라이브에서 아직 불러오는 중이에요'; }
                return '';
            };
            for (let n = 0; ; n++) {
                let r = why();
                if (!r) { try { await saveData(false); if (n && window.saveBusy) await saveBusy(false); return; } catch (e) { console.warn('저장', e); r = '저장하다 문제가 생겼어요'; } }
                if (window.saveBusy) saveBusy(`💾 저장이 늦어지고 있어요 · ${r} · 다시 저장하는 중 (${n + 1}번째)`);
                await new Promise(ok => setTimeout(ok, Math.min(1000 * (n + 1), 5000)));   // 1초 · 2초 … 5초마다
            }
        }
        window.deskTopGo = deskTopGo;
        window.deskSnapToggle = deskSnapToggle; window.deskOpenDiary = deskOpenDiary; window.deskCloseDiary = deskCloseDiary;
        window.deskTipAct = deskTipAct; window.deskPut = deskPut; window.deskDiscard = deskDiscard; window.deskGive = deskGive; window.deskReceive = deskReceive; window.deskBoxPick = deskBoxPick; window.deskBoxAllIn = deskBoxAllIn; window.deskBoxTab = deskBoxTab; window.deskTrayTab = deskTrayTab; window.deskShopList = deskShopList; window.deskBoxOpen = deskBoxOpen; window.deskBoxRender = deskBoxRender;
        window.deskFnPick = deskFnPick; window.deskEditOpen = deskEditOpen; window.deskEditEnd = deskEditEnd; window.deskEditFromSettings = deskEditFromSettings; window.deskEditShop = deskEditShop;
        window.deskTapAt = deskTapAt;  window.deskModeRender = deskModeRender; window.deskFnItemName = deskFnItemName;
