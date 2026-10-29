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
   - 📦 내 소품 (도련 10-27) : 처음엔 기본 세트 선물(DESK_ITEMS 모두 책상 위) · 🏪 기본상품 샵 '책상 소품'에서 더 받으면 📦 소품 보관함으로 (같은 것도 여러 개 · 받기 전에 물어봐요)
       보관함 ↔ 책상 · 🗑 버리기 = 🛠 책상 꾸미기에서 (▤ 하단 메뉴 화면이면 📦 소품 보관함 창) · 버린 것은 기본상품 샵에서 다시 받아요
   - 저장 (도련 10-27)
       책상배치 / 배치.json : 'diary_desk_items' [{u: 하나하나 id, id: 소품, at: 'desk' | 'box', x, y, c: 종류 폴더 파일 id}] · 'diary_desk_fn' {기능: u} (js/drive.js DESK_KEYS · 게스트는 이 기기)
       종류 폴더 (서랍장 · 시계 … js/drive.js DESK_DIRS · 소품의 kind) / 받은-<c>.json = 가진 소품 하나에 파일 하나 (js/coll.js 모음 · 뒤에서 차례로 올려요)
         기본 세트 선물 · 기본상품 샵 · 나중에 유료 · 이벤트 · 공유 = 받은- · 내가 만든 것 = 내- · 버리면 그 파일도 지워요
       🎁 기본세트 (도련 10-27 · 서비스 = 예외) : 처음 한 번 받는 책상 소품 + 문구는 종류 폴더가 아니라 기본세트 / 선물.json 한 파일 (g: 1 · 첫 접속 요청 3~4번)
         버리면 선물.json 에서 빠져요 (다 비면 파일도 지워요) · 그 뒤에 받는 것부터 종류 폴더 · 배치.json 이 없어지면 🛟 되살리기 (giftEnsure)
       기본 세트의 u = 소품 id (그래서 처음 기능 연결이 그대로 맞아요) · 선물이 아닌데 파일이 아직 없는 것(c 없음)은 드라이브를 읽은 뒤 만들어요
   ※ 소품 종류 = DESK_ITEMS (기본상품 샵 카탈로그) */

        const DESK_W = 1672, DESK_H = 941, DESK_PX = 16, DESK_M = 36;   // 🧲 딱 맞추기 : 16px 칸 · 36px 안이면 착 (4px 는 너무 촘촘해서 부드러운 것과 차이를 몰랐어요 · 도련 10-26)
        const DESK_EDGE = { back: 721, left: 140, right: 1540 };                 // 책상 뒤쪽 선 (벽과 만나는 곳) · 양옆 벽 모서리 (그림 px)
        const DESK_ITEMS = [                                                      // 기본 소품 (도련 10-26 · 크기는 참고 그림의 책상 대비 비율) · wall = 벽에 거는 것 (책상 자석 없음 · 늘 뒤)
            // front = 앞벽 마스크(흰 부분 = 앞벽 · 도구/앞벽마스크.html) · mouth = [입구 왼쪽 %, 오른쪽 %, 앞벽 위 %] → 다이어리 바닥이 그 안이면 '꽂힘' = 소품과 앞벽 사이 (도련 10-29)
            // surf = 위에 물건을 올릴 수 있는 면 [소품 안 세로 자리, 왼쪽 끝, 오른쪽 끝] (소품 그림 px) · 올려 둔 물건은 함께 움직이고 그 소품보다 앞에 보여요
            { id: 'corkboard', kind: 'board', src: 'img/desk/corkboard.webp?v=20261009-832', w: 520, h: 393, x: 600, y: 90, name: '코르크 게시판', wall: 1 },
            { id: 'wallshelf', kind: 'wallshelf', src: 'img/desk/wallshelf.webp?v=20261009-833', w: 430, h: 248, x: 160, y: 104, name: '벽 선반', wall: 1, surf: [[50, 10, 421], [211, 10, 421]] },
            { id: 'drawer-pink', kind: 'drawer', src: 'img/desk/drawer-pink.webp?v=20261009-833', w: 330, h: 257, x: 170, y: 504, name: '핑크 서랍장', surf: [[16, 8, 322]] },
            { id: 'riser', kind: 'riser', src: 'img/desk/riser.webp?v=20261009-833', w: 470, h: 92, x: 560, y: 669, name: '모니터 받침대', surf: [[16, 3, 467]] },
            { id: 'basket', kind: 'basket', src: 'img/desk/basket.webp?v=20261009-833', w: 170, h: 142, x: 600, y: 544, name: '책 바구니', front: 'img/desk/basket-front.webp?v=20261009-916', mouth: [5, 95, 54] },
            { id: 'pencup', kind: 'pencup', src: 'img/desk/pencup.webp?v=20261009-833', w: 100, h: 148, x: 840, y: 538, name: '연필꽂이' },
            { id: 'bookbox', kind: 'bookshelf', src: 'img/desk/bookbox2.webp?v=20261009-832', w: 200, h: 152, x: 230, y: 367, name: '책 상자' },
            { id: 'magfile', kind: 'bookshelf', src: 'img/desk/magfile2.webp?v=20261009-832', w: 110, h: 241, x: 1090, y: 520, name: '파일꽂이', front: 'img/desk/magfile2-front.webp?v=20261009-911', mouth: [4, 96, 51] },
            { id: 'polaroid', kind: 'photo', src: 'img/desk/polaroid2.webp?v=20261009-836', w: 126, h: 151, x: 1395, y: 120, name: '폴라로이드', wall: 1, photo: [17.5, 22.3, 82.6, 85.9] },   // 줄에 집게로 건 사진 (줄이 양옆으로 이어져요)   // 📷 나중에 사용자 사진을 넣어 벽에 붙여요 (photo = 사진 자리 %)
            { id: 'clock', kind: 'clock', src: 'img/desk/clock.webp?v=20261009-832', w: 96, h: 117, x: 1258, y: 415, name: '자명종 시계', clock: { cx: 50, cy: 59.5, r: 35.6 } },   // 🕰 지금 시각 바늘 (시계판 가운데 · 반지름 = 그림 폭 %)
            { id: 'dclock', kind: 'clock', src: 'img/desk/dclock.webp?v=20261009-833', w: 130, h: 87, x: 300, y: 228, name: '디지털 시계', lcd: [10.7, 16, 89.1, 73.7] },   // ⏰ 화면에 지금 시각 (화면 자리 %)
            { id: 'drawer', kind: 'drawer', src: 'img/desk/drawer.webp?v=20261009-833', w: 230, h: 244, x: 1250, y: 517, name: '서랍장', surf: [[12, 6, 224]] },
            { id: 'lamp', kind: 'lamp', src: 'img/desk/lamp.webp?v=20261009-835', w: 200, h: 309, x: 1270, y: 220, name: '스탠드' },          // 🆕 10-28 도련 그림
            { id: 'bunny', kind: 'doll', src: 'img/desk/bunny.webp?v=20261009-834', w: 64, h: 117, x: 955, y: 568, name: '토끼 인형' },
            { id: 'bear', kind: 'doll', src: 'img/desk/bear.webp?v=20261009-835', w: 88, h: 108, x: 412, y: 412, name: '곰 인형' }
        ];
        const dkCat = id => DESK_ITEMS.find(d => d.id === id) || null;
        const dkDef = el => dkCat(el.dataset.id) || {};
        const DK_SNAP = 'malang_desk_snap';
        const dkGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
        const dkSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
        const DK = { s: 1, sel: null, snap: dkGet(DK_SNAP, true), base: {}, items: [], seen: '', art: {} };   // art = 🎨 칠한 그림 {u: 그림} (종류 폴더 파일에서 읽어 둔 것)   // base = 저장한 자리 (화면이 좁아 당겨 보여 줘도 그대로)

        /* 📦 내 소품 목록 */
        const DK_ITEMS_KEY = 'diary_desk_items', DK_ITEMS_LOCAL = 'malang_desk_items';
        const dkStarter = () => DESK_ITEMS.map(d => ({ u: d.id, id: d.id, at: 'desk', x: d.x, y: d.y }));   // 🎁 기본 세트 선물
        function dkLoad() {
            const v = typeof prefGet === 'function' ? prefGet(DK_ITEMS_KEY, DK_ITEMS_LOCAL) : null;
            const seenU = new Set();
            const L = Array.isArray(v) ? v.filter(o => o && typeof o.u === 'string' && dkCat(o.id) && !seenU.has(o.u) && seenU.add(o.u)).map(o => Object.assign({ u: o.u, id: o.id, at: o.at === 'box' ? 'box' : 'desk', x: +o.x || 0, y: +o.y || 0 }, typeof o.c === 'string' ? { c: o.c } : {}, o.g ? { g: 1 } : {}, o.p ? { p: 1 } : {}, o.cs && typeof o.cs === 'object' ? { cs: o.cs } : {})) : dkStarter();
            DK.fresh = !Array.isArray(v);                                         // 아직 목록이 없어요 → 🎁 기본세트 (드라이브를 읽은 뒤 giftEnsure)
            DK.items = L; DK.seen = JSON.stringify(L);
        }
        /* 🗂 종류 폴더 파일 (js/coll.js) */
        const dkKN = k => ({ basket: '바구니' })[k] || DESK_DIRS[k];         // 소품함에 보일 종류 이름 (폴더는 '소품바구니' · 🧺 스티커 바구니와 헷갈리지 않게 · 도련 10-28)
        const dkColl = id => { const c = dkCat(id); return typeof collOf === 'function' && c && typeof DESK_DIRS !== 'undefined' ? collOf(dirPath(DESK_DIRS[c.kind]), '받은-') : null; };
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
        /* 🎁 기본세트 / 선물.json { desk: [{u, id}], gd: [디자인 id] } = 지금 가진 선물 (목록에서 g: 1 인 것) */
        const GIFT_NAME = '선물.json';
        const giftOn = () => typeof drive !== 'undefined' && drive.ready && !drive.guest && typeof getFolder === 'function';
        let giftChain = Promise.resolve(), giftLate = false;
        function giftBody() {
            const gd = window.gdOwnList ? (gdOwnList() || []) : [];
            return { v: 1, desk: DK.items.filter(o => o.g).map(o => ({ u: o.u, id: o.id })), gd: gd.filter(o => o.g).map(o => o.id) };
        }
        function giftWrite() {                                                    // 지금 모습으로 덮어쓰기 (차례대로 · 실패하면 다음에 다시)
            if (!giftOn()) return giftChain;
            giftChain = giftChain.then(async () => {
                try {
                    const b = giftBody(), dir = await getFolder(dirPath(DIRS.starter), true), cur = await findFile(dir, GIFT_NAME);
                    if (!b.desk.length && !b.gd.length) { if (cur) await driveTrash(cur.id); }
                    else await driveUpsert(dir, GIFT_NAME, cur && cur.id, await ownLock(b));   // 🔐
                    giftLate = false;
                } catch (e) { console.warn('기본세트', e); giftLate = true; }
            });
            return giftChain;
        }
        async function giftRead() {
            const dir = await getFolder(dirPath(DIRS.starter), false), f = dir && await findFile(dir, GIFT_NAME);
            if (!f) return null;
            const o = await ownUnlock(await readFileText(f.id));                  // 🔐 못 열면 에러 → 선물을 다시 주지 않아요
            return o && typeof o === 'object' ? o : null;
        }
        /* 🛟 되살리기 (도련 10-27 · 스티커 ownRescue 와 같게) : 배치.json 이 없어지거나 깨지면
             가진 것 = 종류 폴더의 내 파일(🔐 열리는 것만 · 같은 u 는 하나) + 선물.json · 자리 · 기능 연결 = 배치_백업.json (하루 한 번 드라이브 안에 복사)
             → 지금 가진 것만 살아나요 (버린 것은 파일이 없어서 안 살아나요 · 📦 zip 백업과는 달라요)
             처음 온 사람(선물.json · 백업 둘 다 없음)은 폴더를 뒤지지 않고 바로 선물 */
        const DK_BK_NAME = '배치_백업.json', DK_BK_LS = 'malang_desk_bk';
        async function dkBackupRead() {
            const dir = await getFolder(dirPath(DIRS.deskLayout), false), f = dir && await findFile(dir, DK_BK_NAME);
            if (!f) return null;
            try { const o = await ownUnlock(await readFileText(f.id)); return o && typeof o === 'object' ? o : null; } catch (e) { return null; }   // 못 여는 백업은 없는 셈
        }
        let dkBkBusy = false;
        async function dkBackupWrite() {                                            // 배치.json 을 잘 읽은 날 하루 한 번
            if (dkBkBusy || !giftOn() || drive.deskLocked || DK.fresh || DK.edit) return;
            const day = new Date().toISOString().slice(0, 10), who = (typeof COLL !== 'undefined' && COLL.who) || 'me';
            let m = {}; try { m = JSON.parse(localStorage.getItem(DK_BK_LS) || '{}') || {}; } catch (e) {}
            if (m[who] === day) return;
            const body = {}; ['diary_desk_items', 'diary_desk_fn', 'diary_gd_own'].forEach(k => { const v = prefGet(k, ''); if (v != null) body[k] = v; });
            if (!Array.isArray(body.diary_desk_items)) return;
            dkBkBusy = true;
            try {
                const dir = await getFolder(dirPath(DIRS.deskLayout), true), cur = await findFile(dir, DK_BK_NAME);
                await driveUpsert(dir, DK_BK_NAME, cur && cur.id, await ownLock(body));
                m[who] = day; try { localStorage.setItem(DK_BK_LS, JSON.stringify(m)); } catch (e) {}
            } catch (e) { console.warn('배치 백업', e); }
            finally { dkBkBusy = false; }
        }
        async function dkScan() {                                                   // 종류 폴더의 내 파일들 → { desk: [{u, id, c, p, mt}], gd: [...] }
            const out = { desk: [], gd: [] }, kinds = Object.values(DESK_DIRS).map(n => ['desk', n]).concat(Object.values(GD_DIRS).map(n => ['gd', n]));
            for (const [t, n] of kinds) {
                const dir = await getFolder(dirPath(n), false); if (!dir) continue;
                const fs = await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}'`, 'id,name,modifiedTime');
                for (const f of fs) {
                    if (!/^(받은|내)-\d+\.json$/.test(f.name)) continue;             // 목록 · 사본 파일은 빼요
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
            const pos = new Map((bk && Array.isArray(bk.diary_desk_items) ? bk.diary_desk_items : []).filter(o => o && o.u).map(o => [o.u, o]));
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
        async function giftEnsure() {
            let gdNull = window.gdOwnList ? gdOwnList() === null : false;
            if (giftBusy || DK.edit || typeof drive === 'undefined' || !drive.ready || (drive.deskLocked && DK.lockTried) || (!DK.fresh && !gdNull && !drive.deskLocked)) { if (giftLate) giftWrite(); dkBackupWrite(); return; }
            giftBusy = true;
            try {
                let had = null, bk = null, files = null;
                if (giftOn()) {
                    try { had = await giftRead(); bk = await dkBackupRead(); }
                    catch (e) { console.warn('기본세트 · 되살리기', e); return; }   // 못 읽으면 다음에 (선물을 두 번 주지 않게)
                    if (drive.deskLocked) {                                       // 🔐 배치.json 이 깨졌어요 : 내 선물.json · 백업이 열리면(내 열쇠가 맞아요) 되살려서 새로 쓰고 · 아니면 그대로 둬요 (남의 파일일 수 있어요)
                        DK.lockTried = true;
                        if (!had && !bk) { if (window.showMsg) showMsg('🔐 책상 정보(책상배치 / 배치.json)를 열 수 없어요.<br><span style="font-size:12px;color:#777;">다른 계정의 파일이거나 깨진 파일이에요. 그 파일은 건드리지 않았어요.</span>'); return; }
                        drive.deskLocked = false; DK.fresh = true;
                    }
                    if (had || bk) { try { files = await dkScan(); } catch (e) { console.warn('되살리기', e); return; } }
                }
                const back = !!(had || bk);                                           // 예전에 쓰던 사람 → 되살리기
                if (window.gdOwnList) gdNull = gdOwnList() === null;
                if (DK.fresh) {
                    DK.items = back ? dkRebuild(had, bk, files) : dkStarter().map(o => Object.assign(o, { g: 1 }));
                    DK.fresh = false; dkSave();
                    if (back && bk && bk.diary_desk_fn && typeof bk.diary_desk_fn === 'object' && typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, bk.diary_desk_fn);
                    deskItemsRender(); deskModeRender();
                }
                if (gdNull) {
                    if (back && window.gdSetList) {
                        const seen = new Set(), L = [];
                        (files ? files.gd : []).forEach(f => { if (!seen.has(f.id)) { seen.add(f.id); L.push({ id: f.id, c: f.c }); } });
                        (had && Array.isArray(had.gd) ? had.gd : []).forEach(id => { if (!seen.has(id)) { seen.add(id); L.push({ id, g: 1 }); } });
                        gdSetList(L);
                    } else if (window.gdGiftSet) gdGiftSet(null);
                }
                if (!back && giftOn()) giftWrite();
            } finally { giftBusy = false; }
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
        function dkSave() { if (DK.edit) return; DK.seen = JSON.stringify(DK.items); if (typeof prefSet === 'function') prefSet(DK_ITEMS_KEY, DK_ITEMS_LOCAL, DK.items); }
        const dkOnDesk = () => DK.items.filter(o => o.at === 'desk');
        const dkName = o => { const c = dkCat(o.id), same = DK.items.filter(x => x.id === o.id); return (c ? c.name : '') + (same.length > 1 ? ' ' + (same.indexOf(o) + 1) : ''); };
        function josa(w, a, b) { const c = (w || '').charCodeAt(w.length - 1) - 0xAC00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); }

        /* 🔗 소품 ↔ 기능 : [기능, 이름, 하단 메뉴 버튼(없으면 바로 열기), 표시] · 처음 연결 (도련 10-27 · 바꿀 수 있어요) */
        const DK_FNS = [['skin', '다이어리', 'tb-skin', '📔'], ['sticker', '스티커', 'tb-sticker', '⭐'], ['gd', '문구함', 'tb-gd', '✏️'], ['cafe', '카페', 'tb-cafe', '☕'], ['set', '설정', 'tb-set', '⚙️'],
            ['shop', '기본상품 샵', '', '🏪'], ['edit', '책상 꾸미기', '', '🛠']];   // 📦 소품함은 기능에서 뺐어요 (도련 10-28 : 소품을 내놓고 넣는 건 🛠 책상 꾸미기 안에서만 → 작업대 📦 소품함)
        const DK_FN_DEF = { skin: 'bookbox', sticker: 'basket', gd: 'pencup', cafe: 'corkboard', set: 'clock', shop: 'magfile', edit: 'drawer' };   // 핑크 서랍장은 기능 없는 소품
        const DK_FN_NEED = ['skin', 'sticker', 'gd', 'cafe', 'set'];                // 꼭 있어야 하는 기능 (하단 메뉴 다섯 개)
        const DK_FN_KEY = 'diary_desk_fn', DK_FN_LOCAL = 'malang_desk_fn';
        function deskFnMap() {                                                    // 모든 기능 · 서로 다른 책상 위 소품 (모자라면 그 기능은 빠져요 → 하단 메뉴가 보여요)
            if (DK.edit) return DK.editFn;                                        // 🛠 꾸미는 동안은 고치는 중인 연결
            const v = typeof prefGet === 'function' ? prefGet(DK_FN_KEY, DK_FN_LOCAL) : null, got = v && typeof v === 'object' ? v : {};
            const ids = dkOnDesk().map(o => o.u), claimed = Object.values(got), used = new Set(), m = {};
            DK_FNS.forEach(([k]) => {
                let u = got[k];
                if (!ids.includes(u) || used.has(u)) u = ids.includes(DK_FN_DEF[k]) && !used.has(DK_FN_DEF[k]) && !claimed.includes(DK_FN_DEF[k]) ? DK_FN_DEF[k] : ids.find(i => !used.has(i) && !claimed.includes(i));
                if (!u) u = ids.find(i => !used.has(i));
                if (u) { m[k] = u; used.add(u); }
            });
            return m;
        }
        const dkFnOf = u => { const m = deskFnMap(); return Object.keys(m).find(k => m[k] === u) || ''; };
        /* 🛠 기능 칩 톡 : 이 소품에 연결 (소품 하나에 기능 하나 · 다른 소품에 있던 그 기능은 옮겨 와요) · 이미 이 소품 것이면 빼기 */
        function deskFnPick(fn) {
            const el = DK.sel; if (!DK.edit || !el) return; const u = el.dataset.u, m = DK.editFn;
            if (m[fn] === u) delete m[fn];
            else { Object.keys(m).forEach(k => { if (m[k] === u) delete m[k]; }); m[fn] = u; }
            deskFnPaint(); deskTipPaint(); deskEditPaint();
        }
        function deskFnPaint() {
            const m = deskFnMap(), of = {}; Object.keys(m).forEach(k => { of[m[k]] = k; });
            if (!DK.edit) document.documentElement.classList.toggle('desk-lack', DK_FN_NEED.some(k => !m[k]));   // 소품이 모자라 기능이 빠지면 하단 메뉴를 보여요 (안전)
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const fn = of[el.dataset.u], f = fn && DK_FNS.find(x => x[0] === fn), d = dkDef(el);
                DK_FNS.forEach(x => el.classList.remove('fn-' + x[0]));
                let tag = el.querySelector('.dk-fn-tag');                         // 🏷 기능 라벨 (도련 10-27 · 기능 개발하는 동안 알아보게)
                if (f) { if (!tag) { tag = document.createElement('span'); tag.className = 'dk-fn-tag'; tag.setAttribute('aria-hidden', 'true'); el.appendChild(tag); } tag.textContent = f[3] + ' ' + f[1]; }
                else if (tag) tag.remove();
                if (f) { el.dataset.fn = fn; el.classList.add('fn-' + fn); el.title = f[1]; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `${d.name} · ${f[1]}`); }
                else { delete el.dataset.fn; el.removeAttribute('title'); el.setAttribute('role', 'img'); el.setAttribute('aria-label', d.name || ''); }
            });
        }
        function deskFnItemName(fn) { const o = DK.items.find(x => x.u === deskFnMap()[fn]); return o ? dkName(o) : ''; }
        /* 기능 실행 = 숨긴 하단 메뉴 버튼을 대신 눌러요 (필기 붙이기 · 카페 · 다시 누르면 닫기 … 하단 메뉴와 똑같이)
           스티커 · 카페는 다이어리에 쓰는 거라 책상에 놓인 다이어리를 먼저 펴요 · 문구함은 펴지 않고 그대로 열어요 (꺼낼 때만 다이어리가 필요) · 🏪 기본상품 샵 · 📦 보관함은 바로 */
        function deskRun(fn) {
            if (fn === 'shop') { setTimeout(() => window.shopSceneOpen ? shopSceneOpen() : window.openShelf && openShelf(), 0); return; }   // 🏪 가게 안으로 (js/shopscene.js)
            if (fn === 'edit') { setTimeout(deskEditOpen, 0); return; }
            if (fn === 'box') { setTimeout(deskBoxOpen, 0); return; }                // 📦 소품함 (다이어리를 띄우지 않아요)
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
            const img = el.querySelector(':scope > img'), r = (img || el).getBoundingClientRect();
            if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return false;
            const m = img && dkHitMap(img); if (!m) return true;
            const px = Math.floor((cx - r.left) / r.width * m.w), py = Math.floor((cy - r.top) / r.height * m.h);
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
            giftEnsure().then(() => { dkFilesFill(); if (window.gdFilesFill) gdFilesFill(); });
        }

        function deskBuild() {
            const bg = document.getElementById('deskBg'); if (!bg || bg.querySelector('#deskStage')) return;
            dkLoad();
            bg.innerHTML = `<div id="deskStage" class="desk-stage"><img class="desk-room" src="img/desk-wide.webp?v=20261009-831" alt="" draggable="false">
                <div class="dk-diary" id="deskDiary" role="button" tabindex="0" aria-label="다이어리 펴기"><div class="dk-top"><div class="diary-book dk-mini"></div></div><i class="dk-edge"></i><i class="dk-spine"><b></b></i><div class="dk-pose" id="dkPose"><button type="button" data-p="side" onclick="dkyPose(\'side\')">📚 꽂기</button><button type="button" data-p="front" onclick="dkyPose(\'front\')">📔 세우기</button><button type="button" data-p="lay" onclick="dkyPose(\'lay\')">🛏 눕히기</button><button type="button" class="dky-lbb" onclick="dkyLbPanel(true)">🏷️ 라벨</button></div></div>
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"></div></div>`;
            const dd = document.getElementById('deskDiary'); let dn = null;
            dd.addEventListener('pointerdown', ev => { if (ev.target.closest('.dk-pose')) { ev.stopPropagation(); return; } if (DK.edit) { const lb = ev.target.closest('.dky-lb'); if (lb) dkyLbGrab(ev, lb); else dkyGrab(ev); return; } dn = [ev.clientX, ev.clientY]; ev.stopPropagation(); });
            dd.addEventListener('pointerup', ev => { if (dn && !DK.edit && Math.hypot(ev.clientX - dn[0], ev.clientY - dn[1]) < 8) deskOpenDiary(); dn = null; });
            dd.addEventListener('keydown', ev => { if (!DK.edit && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); deskOpenDiary(); } });
            if (window.dsPaint) dsPaint();                                        // 🧱 벽지 · 🪵 책상 (js/deskskin.js)
            deskItemsRender();
            deskMiniPaint(); dkyApply();
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
            deskZAll(); deskTick(); deskFnPaint(); deskFit();
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
            if (typeof prefSet === 'function') prefSet(DK_ITEMS_KEY, DK_ITEMS_LOCAL, b);
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
        async function deskDiscard(u) {
            const o = DK.items.find(x => x.u === u); if (!o || dkFnBlock(u, '버릴')) return;
            const ok = window.showAsk ? await showAsk(`🗑 ${josa(dkName(o), '을', '를')} 휴지통에 버릴까요?<br><small>버린 소품은 🏪 기본상품 샵에서 다시 받을 수 있어요</small>`, '🗑 휴지통', '취소') : true;
            if (!ok) return;
            DK.items = DK.items.filter(x => x.u !== u); dkSave();
            if (!DK.edit) dkFileDel(o);                                        // 🛠 꾸미는 중이면 확정할 때 (선물이면 선물.json 에서 빼요)
            deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender(); deskEditPaint();   // (예전엔 위 주석 안에 들어가 있어서 버린 뒤 화면이 그대로였어요 · 10-28 고침)
        }
        /* 🏪 기본상품 샵에서 받기 (js/basket.js) : 'have' = 이미 있어요 (묻고 나서 force) · 'ok' = 📦 보관함에 넣었어요 */
        function deskGive(id, force) {
            if (!dkCat(id)) return 'no';
            if (!force && DK.items.some(o => o.id === id)) return 'have';
            deskReceive(id, 'basic');
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
                if (typeof prefSet === 'function') prefSet(DK_ITEMS_KEY, DK_ITEMS_LOCAL, b);
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
        const deskShopList = () => DESK_ITEMS.map(d => ({ id: d.id, name: d.name, src: d.src, wall: !!d.wall }));
        /* 📦 소품 보관함 창 */
        /* 🗂 보관함 종류 칸 (도련 10-27 · 드라이브 종류 폴더와 같은 이름 : 서랍장 · 시계 · 책꽂이 … · 많아져도 찾기 쉽게) : 가진 종류만 · [이름 개수] */
        const dkKinds = () => typeof DESK_DIRS !== 'undefined' ? Object.keys(DESK_DIRS) : [];
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
            const k = DK.boxKind, rows = k === 'all' ? DK.items.slice() : DK.items.filter(o => dkKindOf(o) === k);
            if (DK.boxSel && !rows.some(o => o.u === DK.boxSel)) DK.boxSel = null;
            const side = [['all', '전체', DK.items.length]].concat(kinds.map(kk => [kk, dkKN(kk), DK.items.filter(o => dkKindOf(o) === kk).length]))
                .concat(SK.map(([kk, n]) => [kk, n, dsCount(kk)]))
                .map(([kk, n, c], i) => `<button type="button" class="iv-tab${kk === k ? ' on' : ''}${i === 0 ? ' all' : ''}" onclick="deskBoxTab('${kk}')"><span>${n}</span><i>${c || ''}</i></button>`).join('');
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
            if (H.classList.contains('desk-show')) { deskMiniPaint(); H.classList.remove('desk-show'); const m = document.getElementById('deskDiary'); if (m) m.style.visibility = ''; }   // 펴 둔 다이어리는 책상에 내려놓고 (펼친 모양은 보일 때 그려요)
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'flex' || m.style.display === 'block') { const x = m.querySelector('.mt-x'); if (x) x.click(); else m.style.display = 'none'; } });
            DK.back = { items: JSON.stringify(DK.items), fn: JSON.stringify(deskFnMap()) };   // 취소하면 이대로
            DK.editFn = JSON.parse(DK.back.fn); DK.edit = true;
            if (window.dsEditStart) dsEditStart();                                // 🧱 🪵 벽지 · 책상도 완료 때 저장 (js/deskskin.js)
            DK.dyEdit = JSON.parse(JSON.stringify(dkyGet())); dkyApply();                // 📔 다이어리 자리 · 모습
            H.classList.add('desk-edit'); H.classList.remove('desk-lack');
            deskSelect(null); deskFnPaint(); deskEditPaint();
            dkEditHello();                                                        // ✨ '꾸미기 시작!' 리본 (도련 10-28)
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
                const miss = DK_FN_NEED.filter(k => !DK.editFn[k]);
                if (miss.length) { if (window.showMsg) showMsg(`아직 연결 안 된 기능이 있어요.<br><b>${miss.map(k => { const f = DK_FNS.find(x => x[0] === k); return f[3] + ' ' + f[1]; }).join(' · ')}</b><br><small>소품을 톡 하고 위 칩에서 골라 주세요</small>`); return; }
                const fn = DK.editFn, gone = JSON.parse(DK.back.items).filter(b => !DK.items.some(x => x.u === b.u));
                DK.edit = false; dkSave();
                gone.filter(o => !o.g).forEach(dkFileDel); if (gone.some(o => o.g)) giftWrite();   // 🗑 버린 소품의 파일 · 🎁 선물.json
                if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, fn);
                dkArtCommit();                                                    // 🎨 색칠 · 🖼 사진 미리 보기 → 진짜 저장 (💾 저장 중)
            } else {
                DK.edit = false; DK.items = JSON.parse(DK.back.items); DK.seen = DK.back.items;
                dkArtUndo();                                                      // 🎨 색칠 미리 보기는 처음 그림으로
            }
            DK.editFn = null; DK.back = null;
            if (window.dsEditEnd) dsEditEnd(!!ok);                                // 🧱 🪵 완료 = 저장 · 취소 = 처음대로
            { const v = DK.dyEdit; DK.dyEdit = null; if (ok && v && typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, { x: v.x, y: v.y, p: v.p, lb: dkyLb(v) }); dkyLbPanel(false); const m = document.getElementById('deskDiary'); if (m) m.classList.remove('pose-on'); dkyLbPanel(false); dkyApply(); }
            document.documentElement.classList.remove('desk-edit');
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
            const miss = DK_FN_NEED.filter(k => !DK.editFn[k]);
            const ok = bar.querySelector('.dke-ok'); if (ok) ok.classList.toggle('dim', !!miss.length);
            const hint = bar.querySelector('.dke-hint'); if (hint) hint.textContent = miss.length ? '연결할 기능 : ' + miss.map(k => DK_FNS.find(x => x[0] === k)[1]).join(' · ') : '끌어서 옮기고 · 톡 해서 기능을 연결해요';
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
        const DK_ZS = 8;                                                         // 바닥 1px 마다 z 8칸 : 소품 · 그 안에 넣은 것(최대 6) · 앞벽
        function deskZAll() {
            const items = [...document.querySelectorAll('#deskStage .desk-item')], bot = el => parseFloat(el.style.top) + parseFloat(el.style.height);
            const z = new Map(), surfs = deskSurfs(null), get = (el, depth) => {
                if (z.has(el)) return z.get(el);
                const on = depth < 6 ? deskOn(el, surfs) : null;
                const v = on ? get(on.el, depth + 1) + 1 : el.classList.contains('wall') ? 1 : 10 + Math.round(Math.min(950, bot(el))) * DK_ZS;
                z.set(el, v); return v;
            };
            items.forEach(el => { el.style.zIndex = get(el, 0); });
            dkLayers();
        }
        /* 🧺 넣을 수 있는 소품 (도련 10-29 · 사실적으로 · 자유롭게) : 소품 정보에 front(앞벽 마스크) + mouth(입구)가 있으면 = '담는 소품'
           - 넣는 것 = 책상 위 모든 소품(벽에 건 것 · 다른 담는 소품은 빼고) + 📔 다이어리 : 바닥 가운데가 입구 안이면 담는 소품과 앞벽 사이
           - 여러 개 = 바닥이 아래인 것이 앞 · 담는 소품을 옮기면 안에 든 것도 같이 · 크기 · 자리는 사용자 마음 (맞춰 주지 않아요)
           - 앞벽 = 같은 그림을 앞벽 마스크로 잘라 한 겹 더 (칠한 그림도 그대로) · 안에 든 게 있을 때만 */
        const dkIsBox = el => { const d = dkDef(el); return !!(d.front && d.mouth); };
        function dkBoxAt(x, y, skip) {
            let best = null;
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                if (el === skip || !dkIsBox(el)) return;
                const L = parseFloat(el.style.left), T = parseFloat(el.style.top), w = parseFloat(el.style.width), h = parseFloat(el.style.height), [m0, m1, m2] = dkDef(el).mouth;
                if (x >= L + w * m0 / 100 && x <= L + w * m1 / 100 && y >= T + h * m2 / 100 && y <= T + h + 2 && (!best || +el.style.zIndex > +best.style.zIndex)) best = el;
            });
            return best;
        }
        const dkyIn = st => dkBoxAt(st.x, st.y, null);
        const dkItemBox = el => (el.classList.contains('wall') || dkIsBox(el)) ? null : dkBoxAt(parseFloat(el.style.left) + parseFloat(el.style.width) / 2, parseFloat(el.style.top) + parseFloat(el.style.height), el);
        function dkLayers() {
            const stg = document.getElementById('deskStage'); if (!stg) return;
            const dy = document.getElementById('deskDiary'), inside = new Map();       // 담는 소품 → [{ el, b : 바닥 }]
            const put = (box, el, b) => { if (!inside.has(box)) inside.set(box, []); inside.get(box).push({ el, b }); };
            stg.querySelectorAll('.desk-item').forEach(el => { const box = dkItemBox(el); if (box) put(box, el, parseFloat(el.style.top) + parseFloat(el.style.height)); });
            if (dy) { const st = dkyGet(), box = dkyIn(st); if (box) put(box, dy, st.y); }
            inside.forEach((L, box) => { const bz = +box.style.zIndex || 0; L.sort((a, b) => a.b - b.b).forEach((o, i) => { o.el.style.zIndex = bz + 1 + Math.min(i, DK_ZS - 3); }); });   // 위(뒤)에 놓인 것부터
            const keep = new Set();
            stg.querySelectorAll('.desk-item').forEach(el => {
                if (!dkIsBox(el)) return; const d = dkDef(el), u = el.dataset.u, on = inside.has(el); keep.add(u);
                let f = [...stg.querySelectorAll('.dk-front')].find(x => x.dataset.fu === u);
                if (!f) { f = document.createElement('div'); f.className = 'dk-front'; f.dataset.fu = u; f.innerHTML = `<i class="dk-fm"><img data-art-u="${u}" alt="" draggable="false"></i>`; f.style.setProperty('--fm', `url("${new URL(d.front, location.href).href}")`); el.after(f); }   // 마스크 주소는 css 파일 기준이 아니라 이 페이지 기준으로
                const im = f.querySelector('img'), src = el.querySelector(':scope > img').src; if (im.src !== src) im.src = src;
                Object.assign(f.style, { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height, zIndex: (+el.style.zIndex || 0) + DK_ZS - 1, display: on ? '' : 'none' });
                f.querySelectorAll('.dk-fn-tag').forEach(x => x.remove()); const tg = el.querySelector('.dk-fn-tag'); if (tg && on) f.appendChild(tg.cloneNode(true));   // 🏷 기능 라벨이 앞벽에 가리지 않게 한 장 더
            });
            stg.querySelectorAll('.dk-front').forEach(f => { if (!keep.has(f.dataset.fu)) f.remove(); });
            if (dy) { const inb = [...inside.values()].some(L => L.some(o => o.el === dy)); if (!inb) dy.style.zIndex = 9000; dy.classList.toggle('in-box', inb); }   // 밖이면 늘 맨 앞
        }
        const deskZ = () => deskZAll();
        function deskItemHtml(it, p) {
            const st = `left:${p.x}px;top:${p.y}px;width:${it.w}px;height:${it.h}px`, cls = 'desk-item' + (it.wall ? ' wall' : '');
            let over = '';
            if (it.clock) {                                                         // 🕰 바늘 (지금 시각 · deskTick)
                const c = it.clock, d = c.r * 2, hh = d * it.w / it.h;
                over = `<svg class="dk-hands" viewBox="-50 -50 100 100" aria-hidden="true" style="left:${c.cx}%;top:${c.cy}%;width:${d}%;height:${hh}%"><line class="hr" x1="0" y1="6" x2="0" y2="-24"/><line class="mn" x1="0" y1="8" x2="0" y2="-38"/><line class="sc" x1="0" y1="10" x2="0" y2="-41"/><circle r="4.5"/></svg>`;
            }
            if (it.lcd) { const [l, t, r, b] = it.lcd; over = `<span class="dk-lcd" style="left:${l}%;top:${t}%;width:${r - l}%;height:${b - t}%"><b></b></span>`; }
            return `<div class="${cls}" data-id="${it.id}" data-u="${p.u || it.id}" role="img" aria-label="${it.name}" style="${st}"><img src="${(p.u && DK.art[p.u]) || it.src}" alt="" draggable="false">${over}</div>`;
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
        /* 📔 책상 가운데 다이어리 (도련 10-26) : 지금 다이어리의 겉표지를 작게 · 책상에 눕혀 놓아요
           - 톡 = 다이어리가 그 자리에서 떠올라 화면 가운데로 → 겉표지가 넘어가며 다꾸 시작 (하단 메뉴도 함께)
           - 책상 빈 곳을 톡 = 다시 책상에 내려놓아요 (js/drive.js) · 펼친 채로 내려놓으면 다음에 펼친 쪽 그대로 · 접은 채로면 접은 채로 (도련 10-28)
           - 로그인(앱을 연) 뒤 처음 톡 = 늘 접힌 겉표지로 떠요 (기기에 '펼친 적 있음'을 저장하지 않아요 · 도련 10-28)
           - 나중에 : 마지막으로 다꾸한 다이어리가 놓여요 (지금은 기본 다이어리 하나) */
        /* 📔 책상 위 다이어리 그리기 (도련 10-28 · A) : 접혀 있으면 겉표지 · 펼쳐 있으면 펼친 두 쪽(그날 꾸민 것 그대로)을 작게 복사해 눕혀요
           · 펼친 모양은 가로가 두 배 (가운데 · 아래 끝은 그대로) · 크기는 다이어리가 보일 때 재 두고(DK_SZ) 숨어 있으면 마지막 값 */
        let deskAnim = false;                                                     // 떠오르기 · 내려놓기 움직이는 중
        const DK_MW = 200, DK_TILT = 71;                                          // 책상 위 다이어리 한 쪽 폭 (책상 그림 px) · 눕힌 각도 (css .dk-top 과 같게)
        let DK_SZ = null;                                                         // { bw, bh, vx, vy, vw, vh } 책 크기 · 보이는 것(겉표지 / 펼친 두 쪽 / 📱 한 쪽)의 자리와 크기
        const dkOpenNow = () => typeof isCoverOpen !== 'undefined' && isCoverOpen;
        const dkVisEl = (bk, ip, cv) => dkOpenNow() ? (bk.classList.contains('dy-one') ? bk : ip) : cv;   // 펼침 = 두 쪽(한 쪽씩 보기면 책 자리) · 접힘 = 겉표지
        function dkMeasure() {                                                    // 다이어리가 숨어 있으면 안 보이게 잠깐 펴서 재요
            const w = document.getElementById('diaryWrapper'), bk = document.getElementById('diaryBook'), ip = document.getElementById('innerPage'), cv = document.getElementById('coverPage');
            if (!w || !bk || !ip || !cv) return DK_SZ;
            const hid = !w.offsetWidth;
            if (hid) { w.style.setProperty('display', 'block', 'important'); w.style.setProperty('visibility', 'hidden', 'important'); }
            try {
                const rb = bk.getBoundingClientRect(), rv = dkVisEl(bk, ip, cv).getBoundingClientRect();
                if (rb.width > 50 && rv.width > 50) DK_SZ = { bw: bk.offsetWidth, bh: bk.offsetHeight, vx: rb.left - rv.left, vy: rb.top - rv.top, vw: rv.width, vh: rv.height };
            } finally { if (hid) { w.style.removeProperty('display'); w.style.removeProperty('visibility'); } }
            return DK_SZ;
        }
        /* 📔 책상 위 다이어리 (도련 10-28) : 지금 다이어리를 통째로 복사해 같은 비율로 줄여 눕혀요 = 떠 있던 다이어리와 모양이 똑같아요
           · 접힘 = 겉표지 · 펼침 = 두 쪽 (붙인 스티커 · 글 그대로) · 놓는 순간 한 번만 복사 (놓여 있는 동안은 다시 계산하지 않아요) */
        function deskMiniPaint() {
            const mini = document.getElementById('deskDiary'), box = mini && mini.querySelector(':scope > .dk-top > .dk-mini'), src = document.getElementById('diaryBook'); if (!box || !src) return;
            const Z = dkMeasure(); if (!Z) return;
            const open = dkOpenNow(), k = DK_MW / Z.bw; let W = Math.round(Z.vw * k), H = Math.round(Z.vh * k);
            const bk = src.cloneNode(true);
            const cs0 = src.querySelectorAll('canvas'), cs1 = bk.querySelectorAll('canvas');   // ✨ 캔버스로 그린 것(반짝이 스티커 등)은 복사로는 비어서 그림을 옮겨 그려요
            cs1.forEach((c, i) => { const o = cs0[i]; if (!o || !o.width || !o.height) return; try { c.width = o.width; c.height = o.height; c.getContext('2d').drawImage(o, 0, 0); } catch (e) {} });
            const ts0 = src.querySelectorAll('textarea'), ts1 = bk.querySelectorAll('textarea');   // ✍️ 글상자에 쓴 글도 복사로는 안 옮겨져서 넣어 줘요
            ts1.forEach((t, i) => { const o = ts0[i]; if (o) { t.value = o.value; t.textContent = o.value; t.scrollTop = o.scrollTop; } });
            bk.removeAttribute('id'); bk.querySelectorAll('[id]').forEach(e => e.removeAttribute('id')); bk.setAttribute('aria-hidden', 'true');
            bk.querySelectorAll(open ? '.cover-page' : '.inner-page').forEach(e => e.remove());
            if (!open) bk.querySelectorAll('.cover-page').forEach(c => { c.style.display = ''; c.classList.remove('cv-plain'); });
            bk.querySelectorAll('.drive-badge, .handle, .rot-zone, .dg-note, .bd-tool, .cover-notice, .drag-hint').forEach(e => e.remove());   // 화면 도구(안내 쪽지 · 핀셋 · 밀어서 열기)는 빼요
            bk.classList.remove('dy-anim'); bk.style.position = 'absolute'; bk.style.left = Z.vx + 'px'; bk.style.top = Z.vy + 'px'; bk.style.width = Z.bw + 'px'; bk.style.height = Z.bh + 'px'; bk.style.margin = '0';
            const wrap = document.createElement('div'); wrap.className = 'dk-open-wrap';
            wrap.style.cssText = `position:absolute;left:0;top:0;width:${Z.vw}px;height:${Z.vh}px;overflow:hidden;transform:scale(${k});transform-origin:0 0;`;
            wrap.appendChild(bk);
            box.replaceChildren(wrap);
            if (!open) {                                                          // 📔 접힘 = 복사한 겉표지 크기 그대로 (잰 값이 다른 때 것이면 아래가 비어 잘려 보였어요 · 도련 10-29)
                const c = wrap.querySelector('.cover-page');
                if (c && c.offsetWidth > 50 && c.offsetHeight > 50) { bk.style.left = -c.offsetLeft + 'px'; bk.style.top = -c.offsetTop + 'px'; wrap.style.width = c.offsetWidth + 'px'; wrap.style.height = c.offsetHeight + 'px'; W = Math.round(c.offsetWidth * k); H = Math.round(c.offsetHeight * k); }
            }
            mini.classList.toggle('open', open); mini.style.setProperty('--dkw', W + 'px'); mini.style.setProperty('--dkh', H + 'px'); mini.dataset.sz = dkMiniKey(Z);
            dkySpinePaint(k); dkyThickPaint(W, H);
        }
        /* 📚 📔 세운 다이어리 두께 (도련 10-29 : 일러스트 책처럼 · 도련 포토샵 시안) : 표지가 그대로 위로 이어지고(무늬 · 선 그대로) 그 안에 종이 단면
           📔 앞모습 = 겉표지 윗부분을 위로 한 번 더(.dk-thf) + 종이(왼 · 위 · 아래 테 · 오른쪽 = 책장이라 열림)
           📚 책등 = 책등을 위로 늘이고(css --dkth) 그 윗부분 안에 종이(양옆 테 · 위 = 책장이라 열림) */
        const DKY_TH = { dy: 15 };
        function dkyThickPaint(W, H) {
            const el = document.getElementById('deskDiary'), cv = document.getElementById('coverPage'); if (!el || !W || !H) return;
            el.querySelectorAll('.dk-th, .dk-thf').forEach(x => x.remove());
            const fh = H * DKY_S, fw = W * DKY_S, { dy } = DKY_TH, cc = cv ? getComputedStyle(cv).borderTopColor : '#ffb6c1';
            el.style.setProperty('--dk-cv', cc); el.style.setProperty('--dkth', dy + 'px');
            const ln = (x0, y0, x1, y1) => `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`;
            const svg = (cls, l, w, h, inner) => `<svg class="dk-th ${cls}" aria-hidden="true" style="left:${l}px;top:${H - fh - dy}px;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}">${inner}</svg>`;
            const o = .8, c = 3.4;                                                 // o = 선 반 · c = 표지 테 두께
            // 📔 겉표지 윗부분 복사 (무늬 그대로 위로 이어져요)
            const top = el.querySelector(':scope > .dk-top'), wf = document.createElement('div'); wf.className = 'dk-thf';
            wf.style.cssText = `left:${(W - fw) / 2}px;top:${H - fh - dy}px;width:${fw}px;height:${dy + 2}px`;
            if (top) { const t = top.cloneNode(true); t.classList.add('dk-top-cl'); t.querySelectorAll('.dky-lb').forEach(x => x.remove()); t.style.left = -(W - fw) / 2 + 'px'; t.style.top = -(H - fh) + 'px'; wf.appendChild(t); }
            const y0 = o + c, y1 = dy - 2, x0 = o + c;
            const F = `<polygon class="pp" points="${x0 + 1},${y1} ${x0 + 2.2},${y0} ${fw - 1.6},${y0} ${fw - 1.6},${y1}"/>`
                + `<g class="ln">${[.3, .55, .8].map(t => ln(x0 + 4, y0 + (y1 - y0) * t, fw - 2.4, y0 + (y1 - y0) * t)).join('')}</g>`
                + `<path class="ed" d="M${fw - 1.6},${y0} H${x0 + 2.2} L${x0 + 1},${y1} H${fw - 1.6}"/>`                                    // 종이 둘레 (오른쪽 = 책장 열림)
                + `<path class="ed" d="M${o},${dy + 2} V${o + 3} Q${o},${o} ${o + 3},${o} H${fw - o - 3} Q${fw - o},${o} ${fw - o},${o + 3} V${dy + 2}"/>`;   // 바깥 선 (앞표지 선과 이어져요)
            // 📚 책등 윗부분 안 종이
            const sw = 24, S = `<rect class="pp" x="${c + o}" y="1.6" width="${sw - 2 * (c + o)}" height="${dy - 3.2}"/>`
                + `<g class="ln">${[.3, .5, .7].map(t => ln(c + o + (sw - 2 * (c + o)) * t, 2.6, c + o + (sw - 2 * (c + o)) * t, dy - 2.4)).join('')}</g>`
                + `<path class="ed" d="M${c + o},1.6 V${dy - 1.6} H${sw - c - o} V1.6"/>`;
            el.insertAdjacentHTML('afterbegin', svg('front', (W - fw) / 2, fw, dy + 2, F));
            el.insertBefore(wf, el.firstChild);
            const sp = el.querySelector('.dk-spine'); if (sp) sp.insertAdjacentHTML('afterend', svg('side', W / 2 - sw / 2, sw, dy, S));
        }
        /* 📚 책등 = 지금 다이어리 겉표지 그대로 (도련 10-29 : 앞모습과 같은 무늬 간격) : 겉표지를 속은 빼고(바탕만) 복사해 세운 크기로 줄여 가운데 한 줄만 보여요 */
        let DK_CVZ = null;                                                        // 접혀 있을 때 잰 겉표지 자리 { vx, vy, vw }
        function dkySpinePaint(k) {
            const sp = document.querySelector('#deskDiary .dk-spine'), cv = document.getElementById('coverPage'), Z = DK_SZ; if (!sp || !cv || !Z) return;
            if (!dkOpenNow()) DK_CVZ = { vx: Z.vx, vy: Z.vy, vw: Z.vw };
            const C = DK_CVZ || { vx: 0, vy: -48, vw: Z.bw }, f = k * DKY_S, sw = 24;
            const book = document.createElement('div'); book.className = 'diary-book dk-sp-book';
            book.style.cssText = `position:absolute;left:${C.vx * f - C.vw / 2 * f + sw / 2}px;top:${C.vy * f}px;width:${Z.bw}px;height:${Z.bh}px;margin:0;transform:scale(${f});transform-origin:0 0;pointer-events:none;`;
            const c = cv.cloneNode(false); c.removeAttribute('id'); c.style.display = ''; c.classList.remove('cv-plain'); book.appendChild(c);
            let art = sp.querySelector('.dk-sp-art'); if (!art) { art = document.createElement('i'); art.className = 'dk-sp-art'; sp.prepend(art); }
            art.replaceChildren(book);
            sp.style.borderColor = getComputedStyle(cv).borderTopColor;
        }
        /* 🏷️ 라벨 (도련 10-29) : 사용자가 알아서 붙여요 · 켜기/끄기 · 글 · 글꼴 · 글 색 · 라벨 색 · 크기 · 세로쓰기 · 자리 (모습마다 따로 : 📚 책등 / 📔 앞면) · 🛠 꾸미기에서만 */
        const DKY_LB0 = { on: false, t: '', f: 'sys', c: '#8a2f58', bx: true, bg: '#fffaf3', ol: false, oc: '#ffffff', side: { x: .5, y: .3, s: 1, v: 1 }, front: { x: .5, y: .78, s: 1, v: 0 } };
        const dkyLb = st => { const L = Object.assign({}, DKY_LB0, (st && st.lb) || {}); L.side = Object.assign({}, DKY_LB0.side, L.side || {}); L.front = Object.assign({}, DKY_LB0.front, L.front || {}); return L; };
        const dkyFace = p => p === 'side' ? 'side' : 'front';
        function dkyLabelPaint() {
            const el = document.getElementById('deskDiary'); if (!el) return;
            const st = dkyGet(), L = dkyLb(st), fc = dkyFace(st.p), g = L[fc];
            el.querySelectorAll('.dky-lb').forEach(x => x.remove());
            if (!L.on || (!L.t && !DK.dyEdit)) return;
            const host = el.querySelector(fc === 'side' ? ':scope > .dk-spine' : ':scope > .dk-top'); if (!host) return;
            const b = document.createElement('span'); b.className = 'dky-lb ' + fc + (g.v ? ' v' : '') + (L.bx ? '' : ' clear') + (L.ol ? ' ol' : '');
            const fo = (typeof fontList !== 'undefined' ? fontList : []).find(x => x.id === L.f);
            Object.assign(b.style, { left: (g.x * 100) + '%', top: (g.y * 100) + '%', color: L.c, background: L.bx ? L.bg : 'transparent', fontFamily: fo ? fo.css : '' });
            b.style.setProperty('--fs', g.s); b.style.setProperty('--oc', L.oc);
            const tx = document.createElement('i'); tx.textContent = L.t || '라벨'; b.appendChild(tx); if (!L.t) b.classList.add('ph');
            host.appendChild(b);
        }
        function dkyLbGrab(ev, b) {                                               // 🛠 라벨 끌어 옮기기 (그 면 안에서)
            ev.preventDefault(); ev.stopPropagation();
            const st = DK.dyEdit, L = st.lb = dkyLb(st), g = L[dkyFace(st.p)], host = b.parentElement, R = host.getBoundingClientRect(), gx = g.x, gy = g.y, x0 = ev.clientX, y0 = ev.clientY;
            const mv = e => { if (e.pointerId !== ev.pointerId) return; g.x = Math.max(0, Math.min(1, gx + (e.clientX - x0) / R.width)); g.y = Math.max(0, Math.min(1, gy + (e.clientY - y0) / R.height)); dkyLabelPaint(); };
            const up = e => { if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); dkyLbPanel(true); };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        const DKY_TC = ['#8a2f58', '#5b3f4a', '#c8457a', '#7a5bb8', '#3d7fc4', '#2f8a5a', '#d08a2a', '#ffffff'];
        const DKY_BC = ['#fffaf3', '#ffd3e2', '#e6dcf8', '#d6ecfb', '#dff4e7', '#fff1c4', '#5b3f4a', '#8a2f58'];
        const DKY_OC = ['#ffffff', '#5b3f4a', '#8a2f58', '#ffd3e2', '#fff1c4', '#d6ecfb', '#2a2a2a', '#d08a2a'];
        function dkyLbPanel(show) {                                               // 🏷️ 라벨 꾸미기 창 (꾸미기 동안 화면 아래)
            let pn = document.getElementById('dkyLbPanel');
            if (!show || !DK.dyEdit) { if (pn) pn.hidden = true; return; }
            if (!pn) { pn = document.createElement('div'); pn.id = 'dkyLbPanel'; pn.className = 'dky-lbp'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); }
            const st = DK.dyEdit, L = st.lb = dkyLb(st), fc = dkyFace(st.p), g = L[fc], fl = typeof fontList !== 'undefined' ? fontList : [];
            const sw = (arr, cur, k) => arr.map(c => `<button type="button" class="dky-sw${c === cur ? ' on' : ''}${c === 'none' ? ' none' : ''}" style="--c:${c === 'none' ? '#fff' : c}" onclick="dkyLbSet('${k}','${c}')" aria-label="${c}"></button>`).join('');
            pn.innerHTML = `<div class="dky-row"><b>🏷️ 라벨</b><label class="dky-tg"><input type="checkbox" ${L.on ? 'checked' : ''} onchange="dkyLbSet('on', this.checked)"> 붙이기</label><small>${fc === 'side' ? '📚 책등' : '📔 앞면'} · 라벨과 글씨는 한몸 · 끌어 옮겨요</small><button type="button" class="dky-x" onclick="dkyLbPanel(false)" aria-label="닫기">✕</button></div>`
                + (L.on ? `<div class="dky-row"><input class="dky-t" maxlength="20" placeholder="라벨 글 (예 : 2026 · 일기)" value="${String(L.t).replace(/"/g, '&quot;')}" oninput="dkyLbSet('t', this.value, 1)">`
                + `<select onchange="dkyLbSet('f', this.value)">${fl.map(o => `<option value="${o.id}"${o.id === L.f ? ' selected' : ''}>${o.name.replace(/ \(Local\)$/, '')}</option>`).join('')}</select></div>`
                + `<div class="dky-row"><span>글 색</span>${sw(DKY_TC, L.c, 'c')}</div><div class="dky-row"><label class="dky-tg"><input type="checkbox" ${L.bx ? 'checked' : ''} onchange="dkyLbSet('bx', this.checked)"> 라벨</label>${L.bx ? sw(DKY_BC, L.bg, 'bg') : ''}</div>`
                + `<div class="dky-row"><label class="dky-tg"><input type="checkbox" ${L.ol ? 'checked' : ''} onchange="dkyLbSet('ol', this.checked)"> 아웃라인</label>${L.ol ? sw(DKY_OC, L.oc, 'oc') : ''}</div>`
                + `<div class="dky-row"><span>가로</span><input type="range" min="0" max="1" step="0.01" value="${g.x}" oninput="dkyLbSet('x', this.value, 1)"><span>세로</span><input type="range" min="0" max="1" step="0.01" value="${g.y}" oninput="dkyLbSet('y', this.value, 1)"></div>`
                + `<div class="dky-row"><span>글씨</span><input type="range" min="0.4" max="3" step="0.05" value="${g.s}" oninput="dkyLbSet('s', this.value, 1)"><label class="dky-tg"><input type="checkbox" ${g.v ? 'checked' : ''} onchange="dkyLbSet('v', this.checked)"> 세로쓰기</label></div>`
                : '');
            pn.hidden = false;
        }
        function dkyLbSet(k, v, live) {
            const st = DK.dyEdit; if (!st) return; const L = st.lb = dkyLb(st), g = L[dkyFace(st.p)];
            if (k === 's' || k === 'x' || k === 'y') g[k] = +v; else if (k === 'v') g.v = v ? 1 : 0; else if (k === 'on' || k === 'bx' || k === 'ol') L[k] = !!v; else if (k === 't') L.t = String(v).slice(0, 20); else L[k] = v;
            dkyLabelPaint(); if (!live) dkyLbPanel(true);
        }
        window.dkyLbPanel = dkyLbPanel; window.dkyLbSet = dkyLbSet;
        const dkMiniKey = Z => [Math.round(Z.vw * DK_MW / Z.bw), Math.round(Z.vh * DK_MW / Z.bw), dkOpenNow() ? 1 : 0].join('x');
        /* 다이어리 크기가 정해진 뒤(로그인 · 화면 크기 바뀜) 책상 위 다이어리 크기가 다르면 다시 그려요 (처음 켤 때는 다이어리 크기가 정해지기 전이라 · 도련 10-28) */
        function deskMiniSync() {
            const mini = document.getElementById('deskDiary'); if (!mini || deskAnim || document.documentElement.classList.contains('desk-show')) return;
            const Z = dkMeasure(); if (Z && mini.dataset.sz !== dkMiniKey(Z)) deskMiniPaint();
        }
        /* 떠오르기 · 내려놓기 : 떠 있는 다이어리가 책상 위 다이어리와 '똑같은 계산'(아래 끝 기준 · 같은 원근 · 같은 각도)으로 내려앉아요 → 놓이는 순간 모양이 그대로 이어져요
           dkDeskTf(w, mini) = 책상 위에 놓인 모양의 transform (w 의 기준점 = 보이는 것의 아래 가운데) */
        /* 📔 책상 위 다이어리 자리 · 모습 (도련 10-29) : 📚 꽂기(옆모습 · 책등) · 📔 세우기(앞모습) · 🛏 눕히기
           - 🛠 책상 꾸미기에서만 끌어 옮기고 · 톡 = 모습 고르기 · ✔ 완료 때 저장 (✕ 취소 = 그대로) · 평소에는 누르면 떠올라요 (넣으면 고른 모습 그대로 돌아가요)
           - 'diary_desk_dy' { x, y : 책상 그림 px (바닥 가운데) · p : side · front · lay } (배치.json · js/drive.js DESK_KEYS)
           - 처음 = 파일꽂이 오른쪽 옆에 📚 꽂기 (도련 : 파일꽂이와 서랍장 사이) */
        const DKY_KEY = 'diary_desk_dy', DKY_LOCAL = 'malang_desk_dy', DKY_S = .4;   // 세우면 실제 A6 크기쯤 (파일꽂이와 어울리게)
        function dkyDef() {
            const m = DK.items.find(o => o.id === 'magfile' && o.at === 'desk'), d = DK.items.find(o => o.id === 'drawer' && o.at === 'desk'), mc = dkCat('magfile');
            if (m && mc) { const x1 = m.x + mc.w, x2 = d && d.x > x1 ? d.x : x1 + 50; return { x: Math.round((x1 + x2) / 2), y: Math.round(m.y + mc.h - 3), p: 'side' }; }
            return { x: 1222, y: 758, p: 'side' };
        }
        function dkyGet() {
            if (DK.dyEdit) return DK.dyEdit;
            const v = typeof prefGet === 'function' ? prefGet(DKY_KEY, DKY_LOCAL) : null;
            return v && isFinite(+v.x) && isFinite(+v.y) && ['side', 'front', 'lay'].includes(v.p) ? v : dkyDef();
        }
        function dkyApply() {
            const el = document.getElementById('deskDiary'); if (!el) return;
            const st = dkyGet();
            ['side', 'front', 'lay'].forEach(p => el.classList.toggle('p-' + p, st.p === p));
            el.style.setProperty('--ax', st.x + 'px'); el.style.setProperty('--ay', st.y + 'px'); el.style.setProperty('--dks', DKY_S);
            el.querySelectorAll('.dk-pose button').forEach(b => b.classList.toggle('on', b.dataset.p === st.p));
            dkLayers(); dkyLabelPaint(); if (DK.dyEdit) { const pn = document.getElementById('dkyLbPanel'); if (pn && !pn.hidden) dkyLbPanel(true); }
        }
        function dkyPose(p) { if (!DK.dyEdit) return; DK.dyEdit.p = p; dkyApply(); }
        function dkyGrab(ev) {                                                    // 🛠 끌어 옮기기 · 톡 = 모습 고르기
            if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
            const el = document.getElementById('deskDiary'), st = DK.dyEdit, x0 = ev.clientX, y0 = ev.clientY, sx = st.x, sy = st.y, s = DK.s || 1; let moved = false;
            document.querySelectorAll('.desk-item.sel').forEach(x => x.classList.remove('sel')); if (window.deskSelect) deskSelect(null);
            const mv = e => { if (e.pointerId !== ev.pointerId) return; const dx = (e.clientX - x0) / s, dy = (e.clientY - y0) / s; if (!moved && Math.hypot(dx, dy) < 5) return; moved = true; el.classList.add('lift');
                st.x = Math.round(Math.max(40, Math.min(1632, sx + dx))); st.y = Math.round(Math.max(120, Math.min(930, sy + dy))); dkyApply(); };
            const up = e => { if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); el.classList.remove('lift'); if (!moved) el.classList.toggle('pose-on'); };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        window.dkyPose = dkyPose;
        function dkDeskTf(w, mini) {
            const bk = document.getElementById('diaryBook'), ip = document.getElementById('innerPage'), cv = document.getElementById('coverPage');
            const rw = w.getBoundingClientRect(), rv = dkVisEl(bk, ip, cv).getBoundingClientRect();
            const ox = rv.left + rv.width / 2 - rw.left, oy = rv.bottom - rw.top;
            w.style.transformOrigin = `${ox}px ${oy}px`;
            const p = dkyGet().p;
            if (p !== 'lay') {                                                    // 📚 📔 세운 다이어리 : 그 자리 높이에 맞게 · 📚 꽂기는 옆으로 돌아 책등만 (rotateY)
                const T = mini.querySelector(p === 'side' ? ':scope > .dk-spine' : ':scope > .dk-top').getBoundingClientRect(), k = T.height / rv.height;
                return `translate(${T.left + T.width / 2 - rw.left - ox}px, ${T.bottom - rw.top - oy}px) scale(${k})` + (p === 'side' ? ' perspective(1400px) rotateY(-84deg)' : '');
            }
            const R = mini.getBoundingClientRect(), s = DK.s || 1, mh = parseFloat(mini.style.getPropertyValue('--dkh')) || 0;
            const k = R.width / s / rv.width, bx = R.left + R.width / 2, by = R.top + mh * s;
            return `translate(${bx - rw.left - ox}px, ${by - rw.top - oy}px) scale(${s}) perspective(900px) rotateX(${DK_TILT}deg) scale(${k})`;
        }
        function deskOpenDiary() {
            const H = document.documentElement, mini = document.getElementById('deskDiary'), w = document.getElementById('diaryWrapper');
            if (deskAnim || !mini || !w || H.classList.contains('desk-show')) return;
            deskAnim = true; deskSelect(null);
            H.classList.add('desk-show');                                         // 로그인 뒤 처음은 늘 접힌 채 (isCoverOpen = false) · 그 뒤로는 내려놓은 모양 그대로
            if (typeof refreshLayout === 'function') refreshLayout();             // 📐 떠오르기 전에 크기 · 펼침면을 지금 화면(하단 메뉴 포함)에 맞춰요 (숨어 있는 동안 맞춘 크기로 크게 떴다가 줄던 것 · 도련 10-28)
            const tf = dkDeskTf(w, mini); mini.classList.add('dk-fly');             // 책상 위 다이어리는 두께(옆면)만 남겨 두고 들리는 순간 줄어들며 사라져요
            const eg = mini.querySelector('.dk-edge'), ea = eg && eg.animate([{ opacity: 1, transform: 'scaleY(1)' }, { opacity: 0, transform: 'scaleY(0)', offset: .3 }, { opacity: 0, transform: 'scaleY(0)' }], { duration: 640, easing: 'ease-out', fill: 'forwards' });
            H.classList.add('dk-landing'); requestAnimationFrame(() => requestAnimationFrame(() => H.classList.remove('dk-landing')));   // 화면 도구(안내 쪽지 · 핀셋)는 떠오르며 스르르
            const a = w.animate([{ transform: tf }, { transform: 'none' }], { duration: 640, easing: 'cubic-bezier(.2, .8, .2, 1)' });
            a.onfinish = a.oncancel = () => { w.style.transformOrigin = ''; mini.style.visibility = 'hidden'; mini.classList.remove('dk-fly'); if (ea) ea.cancel(); deskAnim = false; };
        }
        function deskCloseDiary() {
            const H = document.documentElement, mini = document.getElementById('deskDiary'), w = document.getElementById('diaryWrapper');
            if (deskAnim || !mini || !w || !H.classList.contains('desk-show')) return;
            if (typeof turn !== 'undefined' && turn) return;                      // 넘기는 중에는 그대로
            deskAnim = true;
            try { if (dkOpenNow() && typeof saveData === 'function') saveData(false); } catch (e) {}
            deskMiniPaint();                                                      // 책상 위 다이어리를 지금 모양으로 먼저 그려 두고 (숨긴 채) 그 자리로
            H.classList.add('dk-landing');                                        // 화면 도구는 내려앉는 동안 스르르 사라져요 (책상 위 다이어리엔 없어요)
            const a = w.animate([{ transform: 'none' }, { transform: dkDeskTf(w, mini) }], { duration: 560, easing: 'cubic-bezier(.45, 0, .55, 1)', fill: 'forwards' });
            mini.style.visibility = ''; mini.classList.add('dk-fly');             // 📏 두께(옆면)는 책이 작아지며 책상에 닿는 마지막 구간에 같이 자라나요 (도련 10-28)
            const eg = mini.querySelector('.dk-edge'), ea = eg && eg.animate([{ opacity: 0, transform: 'scaleY(0)' }, { opacity: 0, transform: 'scaleY(0)', offset: .62 }, { opacity: 1, transform: 'scaleY(1)' }], { duration: 560, easing: 'cubic-bezier(.45, 0, .55, 1)', fill: 'forwards' });
            a.onfinish = () => { mini.classList.remove('dk-fly'); if (ea) ea.cancel(); mini.style.visibility = ''; H.classList.remove('desk-show', 'dk-landing'); a.cancel(); w.style.transformOrigin = ''; deskAnim = false; };
        }
        function deskFit() {                                                      // 책상 그림 크기 그대로 · 화면 꽉 (cover · 아래 맞춤)
            const st = document.getElementById('deskStage'); if (!st) return;
            const W = innerWidth, H = innerHeight, s = Math.max(W / DESK_W, H / DESK_H);
            const tx = (W - DESK_W * s) / 2, ty = H - DESK_H * s;
            DK.s = s; st.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; st.style.setProperty('--dk-inv', (1 / s).toFixed(3));
            deskKeepIn(-tx / s, -ty / s, (W - tx) / s, (H - ty) / s);
            deskTipPlace();
            deskMiniSync();
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
            deskZAll();
            moved.forEach(el => { el.style.zIndex = 8900; });                    // 당겨 보여 준 소품은 맨 앞 (다른 소품에 가려 못 누르지 않게)
            dkLayers();
        }
        function deskWire(el) {
            let p = null;
            el.addEventListener('pointerdown', ev => {
                if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
                if (!DK.edit) { p = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, tap: true }; return; }   // 평소 = 톡만 (안 움직여요)
                p = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top), on: false };
                if (dkDef(el).surf) {                                            // 위에 올려 둔 물건은 함께 움직여요
                    const mine = deskSurfs(null).filter(s => s.el === el);
                    p.riders = [...document.querySelectorAll('#deskStage .desk-item')].filter(o => o !== el && deskOn(o, mine)).map(o => ({ o, dx: parseFloat(o.style.left) - p.l, dy: parseFloat(o.style.top) - p.t }));
                }
                if (dkIsBox(el)) {                                               // 🧺 담는 소품 = 안에 든 소품 · 다이어리도 함께
                    const ins = [...document.querySelectorAll('#deskStage .desk-item')].filter(o => o !== el && dkItemBox(o) === el && !(p.riders || []).some(r => r.o === o)).map(o => ({ o, dx: parseFloat(o.style.left) - p.l, dy: parseFloat(o.style.top) - p.t }));
                    if (ins.length) p.riders = (p.riders || []).concat(ins);
                    if (DK.dyEdit && dkyIn(DK.dyEdit) === el) p.dyr = { dx: DK.dyEdit.x - p.l, dy: DK.dyEdit.y - p.t };
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
                el.style.left = x + 'px'; el.style.top = y + 'px';
                if (p.riders) p.riders.forEach(r => { r.o.style.left = (x + r.dx) + 'px'; r.o.style.top = (y + r.dy) + 'px'; });
                if (p.dyr && DK.dyEdit) { DK.dyEdit.x = Math.round(x + p.dyr.dx); DK.dyEdit.y = Math.round(y + p.dyr.dy); const dd = document.getElementById('deskDiary'); if (dd) { dd.style.setProperty('--ax', DK.dyEdit.x + 'px'); dd.style.setProperty('--ay', DK.dyEdit.y + 'px'); } }
                deskZAll();
                deskGuide(gh, gv); deskTipPlace();
            });
            const up = ev => {
                if (!p || ev.pointerId !== p.id) return; const was = p; p = null; el.classList.remove('lift'); deskGuide(null, null); DK.drag = false;
                if (was.tap) { if (ev.type !== 'pointercancel' && Math.hypot(ev.clientX - was.x0, ev.clientY - was.y0) < 10) { if (window.dcTap && dcTap(el, ev.clientX, ev.clientY)) return; if (el.dataset.fn) deskRun(el.dataset.fn); } return; }   // 평소 톡 = 소품 동작(누르는 곳 · js/deskcustom.js) 아니면 그 기능   // 평소 톡 = 그 기능
                if (!was.on) { if (ev.type !== 'pointercancel') deskSelect(el); return; }   // 🛠 톡 = 고르기
                [el].concat((was.riders || []).map(r => r.o)).forEach(o => {      // 📦 내 소품 목록에 자리 저장 (설정.json)
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
            DK.sel = el; if (el) el.classList.add('sel');
            const tip = document.getElementById('deskTip'); if (tip) tip.classList.toggle('on', !!el);
            deskTipPaint();
        }
        function deskTipPlace() {                                                 // 고른 소품 바로 위 가운데 (위가 모자라면 아래)
            const tip = document.getElementById('deskTip'), el = DK.sel; if (!tip || !el) return;
            const L = parseFloat(el.style.left), T = parseFloat(el.style.top), k = 1 / DK.s, th = (tip.offsetHeight + 14) * k;
            const st = document.getElementById('deskStage'), top0 = st ? -(innerHeight - DESK_H * DK.s) / DK.s : 0;   // 화면에 보이는 맨 위 (그림 px)
            const below = T - th < top0 + 8;
            tip.classList.toggle('below', below);
            tip.style.left = Math.max(170 * k, Math.min(DESK_W - 170 * k, L + el.offsetWidth / 2)) + 'px'; tip.style.top = (below ? T + el.offsetHeight : T) + 'px';
            tip.style.scale = k.toFixed(3);                                       // 버튼은 화면에서 늘 같은 크기
        }
        function deskTipPaint() {                                                 // 🛠 고른 소품 위 : 기능 칩 + 🧲 · 📦 넣기 · 🗑 버리기
            const tip = document.getElementById('deskTip'), el = DK.sel; if (!tip) return;
            if (!el || !DK.edit) { tip.innerHTML = ''; return; }
            const u = el.dataset.u, m = DK.editFn || {};
            const f = Object.keys(m).find(k => m[k] === u), fi = f && DK_FNS.find(x => x[0] === f);
            tip.innerHTML = `<div class="dkt-act"><button type="button" class="desk-snap${fi ? ' on' : ''}" onclick="deskFnOpen()">🔗 기능 연결</button>`   // 기능 연결은 창으로 (도련 10-28) · 연결돼도 글은 늘 '기능 연결' (기능 이름이면 샵 가는 버튼으로 착각 · 도련 10-28)
                + `<button type="button" class="desk-snap" onclick="deskTipAct('paint')">🎨 꾸미기</button><button type="button" class="desk-snap" onclick="deskTipAct('box')">📦 넣기</button></div>`;   // 🧲 딱 맞추기 = 작업대 · 📤 저장(공유)은 숨김 · 🗑 버리기는 📦 소품함에서
            deskTipPlace();
        }
        /* 🔗 기능 연결 창 (도련 10-28) : 고른 소품에 기능 하나 · 다시 누르면 풀기 */
        function deskFnOpen() {
            const el = DK.sel; if (!DK.edit || !el) return;
            const u = el.dataset.u, m = DK.editFn || {}, o = DK.items.find(x => x.u === u), box = document.getElementById('deskFnList'); if (!box) return;
            const tt = document.getElementById('deskFnTitle'); if (tt) tt.textContent = o ? dkName(o) + '에 연결할 기능' : '';
            box.innerHTML = DK_FNS.map(([k, n, , ic]) => { const mine = m[k] === u, other = m[k] && !mine ? DK.items.find(x => x.u === m[k]) : null;
                return `<button type="button" class="btn${mine ? ' on' : ''}" onclick="deskFnPick('${k}'); deskFnOpen()"><b>${ic} ${n}</b><small>${mine ? '✔ 연결됨 · 누르면 풀기' : other ? '지금 : ' + dkName(other) : DK_FN_NEED.includes(k) ? '꼭 필요해요' : ''}</small></button>`; }).join('');
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
        window.deskSnapToggle = deskSnapToggle; window.deskOpenDiary = deskOpenDiary; window.deskCloseDiary = deskCloseDiary;
        window.deskTipAct = deskTipAct; window.deskPut = deskPut; window.deskDiscard = deskDiscard; window.deskGive = deskGive; window.deskReceive = deskReceive; window.deskBoxPick = deskBoxPick; window.deskBoxAllIn = deskBoxAllIn; window.deskBoxTab = deskBoxTab; window.deskTrayTab = deskTrayTab; window.deskShopList = deskShopList; window.deskBoxOpen = deskBoxOpen; window.deskBoxRender = deskBoxRender;
        window.deskFnPick = deskFnPick; window.deskEditOpen = deskEditOpen; window.deskEditEnd = deskEditEnd; window.deskEditFromSettings = deskEditFromSettings; window.deskEditShop = deskEditShop;
        window.deskMiniPaint = deskMiniPaint; window.deskMiniSync = deskMiniSync; window.deskTapAt = deskTapAt;  window.deskModeRender = deskModeRender; window.deskFnItemName = deskFnItemName;
