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
            { id: 'basket', kind: 'basket', src: 'img/desk/basket.webp?v=20261009-833', w: 170, h: 142, x: 600, y: 544, name: '책 바구니', front: 'img/desk/basket-front.webp?v=20261009-919', mouth: [5, 95, 54] },
            { id: 'pencup', kind: 'pencup', src: 'img/desk/pencup.webp?v=20261009-833', w: 100, h: 148, x: 840, y: 538, name: '연필꽂이' },
            { id: 'bookbox', kind: 'bookshelf', src: 'img/desk/bookbox2.webp?v=20261009-832', w: 200, h: 152, x: 230, y: 367, name: '책 상자', nost: 1 },   // nost = 🎁 기본 세트에서 빼요 (🏪 샵에는 그대로 · 도련 10-30)
            { id: 'magfile', kind: 'bookshelf', src: 'img/desk/magfile2.webp?v=20261009-832', w: 110, h: 241, x: 1090, y: 520, name: '파일꽂이', front: 'img/desk/magfile2-front.webp?v=20261009-911', mouth: [4, 96, 51], nost: 1 },
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
        const DK = { s: 1, sel: null, zone: null, snap: dkGet(DK_SNAP, true), base: {}, items: [], seen: '', art: {} };   // art = 🎨 칠한 그림 {u: 그림} (종류 폴더 파일에서 읽어 둔 것)   // base = 저장한 자리 (화면이 좁아 당겨 보여 줘도 그대로)

        /* 📦 내 소품 목록 */
        const DK_ITEMS_KEY = 'diary_desk_items', DK_ITEMS_LOCAL = 'malang_desk_items';
        const dkStarter = () => DESK_ITEMS.filter(d => !d.nost).map(d => ({ u: d.id, id: d.id, at: 'desk', x: d.x, y: d.y }));   // 🎁 기본 세트 선물
        function dkLoad() {
            const v = typeof prefGet === 'function' ? prefGet(DK_ITEMS_KEY, DK_ITEMS_LOCAL) : null;
            const seenU = new Set();
            const L = Array.isArray(v) ? v.filter(o => o && typeof o.u === 'string' && dkCat(o.id) && !seenU.has(o.u) && seenU.add(o.u)).map(o => Object.assign({ u: o.u, id: o.id, at: o.at === 'box' ? 'box' : 'desk', x: +o.x || 0, y: +o.y || 0 }, typeof o.c === 'string' ? { c: o.c } : {}, o.g ? { g: 1 } : {}, o.p ? { p: 1 } : {}, o.cs && typeof o.cs === 'object' ? { cs: o.cs } : {}, o.lz ? { lz: +o.lz || 0 } : {}, o.tag && typeof o.tag === 'object' ? { tag: o.tag } : {})) : dkStarter();   // + 🗂 레이어(lz) · 🏷 이름표(tag) (10-30 : 빠져서 다시 읽으면 사라졌어요)
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
        const DK_FN_DEF = { sticker: 'basket', gd: 'pencup', cafe: 'corkboard', set: 'clock', edit: 'drawer' };   // 핑크 서랍장은 기능 없는 소품 · 📔 다이어리 · 🏪 기본상품 샵은 처음엔 소품 없음 (샵 = 책상 오른쪽 위 버튼 · 도련 10-30 · 🔗 기능 연결로 붙여요)
        const DK_EDIT_NEED = ['edit'];
        const dkHasWin = (m, k) => !!m[k] || Object.values(dkHomes()).some(L => L.some(e => e.k === k));   // 소품 전체 또는 👆 칸 어디든                                            // 🛠 꾸미기 ✔ 완료에 꼭 있어야 하는 건 책상 꾸미기 하나 (도련 10-30 · 나머지는 풀어도 저장)
        const DK_FN_KEY = 'diary_desk_fn', DK_FN_LOCAL = 'malang_desk_fn';
        /* 🪟 누르면 열리는 창 = 기능 + 상품 창 한 목록 (도련 10-30 : 모든 창이 🔗 기능 연결 목록에) · [id, 이름, 하단 메뉴 버튼, 아이콘, 묶음 'fn' | 'h']
           상품 창 id = 'h:' + 종류 (h:seal …) · 저장 : 소품 전체 = diary_desk_fn {창: 소품} · 👆 칸 = diary_desk_home {소품: [{k: 창, r, tag}]} · 한 창 = 한 자리 */
        const DK_HIC = { seal: '🏷️', piece: '🧩', paper: '📄', tape: '🎀', tk: '🧻', leaf: '📃', emoji: '😀', memo: '📝', gd: '✂️', tool: '📔', bg: '🌈', desk: '🪑' };
        const DK_HSAME = { tool: 'skin', gd: 'gd' };                             // 같은 창이 열리는 상품 = 기본 기능으로 (📔 다이어리 보관소 · ✏️ 문구함)
        const dkWinOfKind = k => DK_HSAME[k] || 'h:' + k;
        const dkWins = () => DK_FNS.map(f => f.concat('fn')).concat(Object.keys(DKH_NAMES).filter(k => !DK_HSAME[k]).map(k => ['h:' + k, DKH_NAMES[k], '', DK_HIC[k] || '🎁', 'h']));
        const dkWin = id => (id && dkWins().find(x => x[0] === id)) || null;
        window.dkWin = dkWin;
        function deskFnMap() {                                                    // 모든 기능 · 서로 다른 책상 위 소품 (모자라면 그 기능은 빠져요 → 하단 메뉴가 보여요)
            if (DK.edit) return DK.editFn;                                        // 🛠 꾸미는 동안은 고치는 중인 연결
            const v = typeof prefGet === 'function' ? prefGet(DK_FN_KEY, DK_FN_LOCAL) : null, got = v && typeof v === 'object' ? v : {};
            const ids = dkOnDesk().map(o => o.u), claimed = Object.values(got), used = new Set(), m = {};
            Object.keys(got).forEach(k => { const u = got[k]; if (k.startsWith('h:') && dkWin(k) && ids.includes(u) && !used.has(u)) { m[k] = u; used.add(u); } });   // 🛍️ 상품 창 (저절로 붙이지 않아요)
            DK_FNS.forEach(([k]) => {
                let u = got[k];
                if (u === undefined && !DK_FN_DEF[k]) return;                       // 처음 소품이 없는 기능 (📔 다이어리) = 아무 소품에나 붙이지 않아요
                if (u === '') return;                                             // 다꾸러가 🛠 꾸미기에서 일부러 푼 기능 = 그대로 비워 둬요 (저절로 다시 붙이지 않기 · 도련 10-30)
                if (!ids.includes(u) || used.has(u)) u = ids.includes(DK_FN_DEF[k]) && !used.has(DK_FN_DEF[k]) && !claimed.includes(DK_FN_DEF[k]) ? DK_FN_DEF[k] : ids.find(i => !used.has(i) && !claimed.includes(i));
                if (!u) u = ids.find(i => !used.has(i));
                if (u) { m[k] = u; used.add(u); }
            });
            return m;
        }
        const dkFnOf = u => { const m = deskFnMap(); return Object.keys(m).find(k => m[k] === u) || ''; };
        /* 🛠 🔗 기능 연결 창에서 고르기 (도련 10-30 · 모든 창 한 목록) : 한 창 = 한 자리 (다른 곳에 있던 그 창은 옮겨 와요)
           · 소품 = 소품 전체(칸 밖) 창 하나 · 이미 이 소품 것이면 풀기 · 👆 칸(DK.zone) = 그 칸 창 바꾸기 · ➕ 추가(DK.fnAdd) = 누르는 곳을 그려 새 칸 */
        function dkWinFree(k, m, keep) {                                          // 창 k 를 다른 자리에서 빼요 (keep = 남길 칸 'u|k')
            Object.keys(m).forEach(x => { if (x === k) delete m[x]; });
            const H = dkHomes(); let ch = false;
            Object.keys(H).forEach(u => { const L = H[u].filter(e => e.k !== k || `${u}|${k}` === keep); if (L.length !== H[u].length) { ch = true; if (L.length) H[u] = L; else delete H[u]; } });
            if (ch) dkHomesSet(H);
        }
        async function deskFnPick(fn) {
            const el = DK.sel; if (!DK.edit || !el) return; const u = el.dataset.u, m = DK.editFn;
            if (DK.fnAdd) {                                                      // ➕ 새 칸
                DK.fnAdd = false; if (window.closeModal) closeModal('deskFnModal');
                const o = DK.items.find(x => x.u === u), r = o && await dkzDraw(o, fn); if (!r) return;
                dkWinFree(fn, m); const H = dkHomes(); (H[u] = H[u] || []).push({ k: fn, r }); dkHomesSet(H); DK.zone = `${u}|${fn}`;
            } else if (DK.zone && DK.zone.split('|')[0] === u) {                   // 👆 칸 창 바꾸기
                const k = DK.zone.split('|')[1]; if (k === fn) return;
                dkWinFree(fn, m); const H = dkHomes(), e = (H[u] || []).find(x => x.k === k); if (!e) return;
                e.k = fn; dkHomesSet(H); DK.zone = `${u}|${fn}`;
            } else if (m[fn] === u) delete m[fn];                                 // 소품 전체 = 풀기
            else { Object.keys(m).forEach(k => { if (m[k] === u) delete m[k]; }); dkWinFree(fn, m); m[fn] = u; }
            deskFnPaint(); dknPaintAll(); dkzPaint(); deskTipPaint(); deskEditPaint();
        }
        function deskFnPaint() {
            const m = deskFnMap(), of = {}; Object.keys(m).forEach(k => { of[m[k]] = k; });
            if (!DK.edit) document.documentElement.classList.toggle('desk-lack', DK_EDIT_NEED.some(k => !dkHasWin(m, k)));   // 🛟 🛠 책상 꾸미기가 빠졌을 때만 하단 메뉴 (도련 10-30 : 다른 기능을 풀었다고 하단 메뉴가 뜨지 않게)
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const fn = of[el.dataset.u], f = dkWin(fn), d = dkDef(el);
                DK_FNS.forEach(x => el.classList.remove('fn-' + x[0]));
                let tag = el.querySelector('.dk-fn-tag');                         // 🏷 기능 라벨 (도련 10-27 · 기능 개발하는 동안 알아보게)
                if (f) { if (!tag) { tag = document.createElement('span'); tag.className = 'dk-fn-tag'; tag.setAttribute('aria-hidden', 'true'); el.appendChild(tag); } tag.textContent = f[3] + ' ' + f[1]; const o = DK.items.find(x => x.u === el.dataset.u); tag.hidden = !!(o && o.tag); }   // 🏷 내 이름표가 있으면 숨겨요
                else if (tag) tag.remove();
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
            giftEnsure().then(() => { dkFilesFill(); if (window.gdFilesFill) gdFilesFill(); });
        }

        function deskBuild() {
            const bg = document.getElementById('deskBg'); if (!bg || bg.querySelector('#deskStage')) return;
            dkLoad();
            bg.innerHTML = `<div id="deskStage" class="desk-stage"><img class="desk-room" src="img/desk-wide.webp?v=20261009-831" alt="" draggable="false">
                <div class="dk-diary" id="deskDiary" role="button" tabindex="0" aria-label="다이어리 펴기"><div class="dk-top"><div class="diary-book dk-mini"></div></div><i class="dk-edge"></i><i class="dk-spine"><b></b></i><div class="dk-pose" id="dkPose"><b class="dkt-hd" id="dkPoseHd"></b><button type="button" data-p="side" onclick="dkyPose(\'side\')">📚 꽂기</button><button type="button" data-p="front" onclick="dkyPose(\'front\')">📔 세우기</button><button type="button" data-p="lay" onclick="dkyPose(\'lay\')">🛏 눕히기</button><button type="button" class="dky-lbb" onclick="dkyLbPanel(true)">🏷 이름표</button><button type="button" class="dkl" onclick="dkyLayer(1)">⬆ 앞으로</button><button type="button" class="dkl" onclick="dkyLayer(-1)">⬇ 뒤로</button><button type="button" class="dky-arc" onclick="window.dyOpen && dyOpen(\'다이어리\')">📔 보관소</button></div></div>
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"></div></div>
                <button type="button" class="desk-shop-go" id="deskShopGo" onclick="deskRun('shop')" aria-label="기본상품 샵으로 가기">🏪 기본상품 샵</button>`;   /* 🏪 오른쪽 위 바로 가기 (도련 10-30 · 책상만 볼 때) */
            const dd = document.getElementById('deskDiary'); let dn = null;
            dd.addEventListener('pointerdown', ev => { if (ev.target.closest('.dk-pose')) { ev.stopPropagation(); return; } if (DK.edit) { dkyGrab(ev); return; }   /* 🏷 이름표 글씨를 눌러도 다이어리 (도련 10-30 : 이름표 창은 메뉴 🏷 이름표로만 · 글 자리는 창의 가로 · 세로로만) */ dn = [ev.clientX, ev.clientY]; ev.stopPropagation(); });
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
            dknPaintAll(); dkVolsPaint(); deskZAll(); deskTick(); deskFnPaint(); deskFit(); deskBagsPaint();   // 📔 나머지 다이어리 권
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
            DK.back = { items: JSON.stringify(DK.items), fn: JSON.stringify(deskFnMap()), home: JSON.stringify(dkHomes()) };   // 취소하면 이대로 (👆 칸 · 칸 이름표도)
            DK.editFn = JSON.parse(DK.back.fn); DK.edit = true;
            if (window.dsEditStart) dsEditStart();                                // 🧱 🪵 벽지 · 책상도 완료 때 저장 (js/deskskin.js)
            DK.dyEdit = JSON.parse(JSON.stringify(dkyGet())); DK.volEdit = {}; dkyApply();   // 📔 다이어리 자리 · 모습 (펼쳐 둔 권 + 나머지 권)
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
                const miss = DK_EDIT_NEED.filter(k => !dkHasWin(DK.editFn, k));                 // 꼭 있어야 하는 건 🛠 책상 꾸미기 하나 (도련 10-30 · 나머지는 풀어도 돼요 → 하단 메뉴가 보여요)
                if (miss.length) { if (window.showMsg) showMsg(`아직 연결 안 된 기능이 있어요.<br><b>${miss.map(k => { const f = DK_FNS.find(x => x[0] === k); return f[3] + ' ' + f[1]; }).join(' · ')}</b><br><small>소품을 톡 하고 위 칩에서 골라 주세요</small>`); return; }
                const fn = DK.editFn, gone = JSON.parse(DK.back.items).filter(b => !DK.items.some(x => x.u === b.u));
                DK.edit = false; dkSave();
                gone.filter(o => !o.g).forEach(dkFileDel); if (gone.some(o => o.g)) giftWrite();   // 🗑 버린 소품의 파일 · 🎁 선물.json
                DK_FNS.forEach(([k]) => { if (!fn[k]) fn[k] = ''; });             // 푼 기능은 '' 로 (deskFnMap 이 다시 붙이지 않게)
                if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, fn);
                dkArtCommit();                                                    // 🎨 색칠 · 🖼 사진 미리 보기 → 진짜 저장 (💾 저장 중)
            } else {
                DK.edit = false; DK.items = JSON.parse(DK.back.items); DK.seen = DK.back.items;
                if (DK.back.home !== JSON.stringify(dkHomes())) dkHomesSet(JSON.parse(DK.back.home));   // 👆 칸 고친 것 되돌리기
                dkArtUndo();                                                      // 🎨 색칠 미리 보기는 처음 그림으로
            }
            DK.editFn = null; DK.back = null;
            if (window.dsEditEnd) dsEditEnd(!!ok);                                // 🧱 🪵 완료 = 저장 · 취소 = 처음대로
            { const v = DK.dyEdit, VE = DK.volEdit; DK.dyEdit = null; DK.volEdit = null; dkvMenu(null);
              if (ok && v && typeof prefSet === 'function') { const M = Object.assign(dkyMap(), VE || {}); M[dkyCur() || '_'] = Object.assign({ x: v.x, y: v.y, p: v.p, lb: dkyLb(v) }, v.lz ? { lz: v.lz } : {}); prefSet(DKY_KEY, DKY_LOCAL, M); }   /* 권마다 자리 */ dkyMenu(false); dkyLbPanel(false); dknPanel(false); dkyApply(); }
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
            const miss = DK_EDIT_NEED.filter(k => !dkHasWin(DK.editFn, k));
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
        /* 앞뒤 (도련 10-29 · 사실적으로) : 모든 소품 + 📔 다이어리 + 앞벽을 한 줄로 세워 차례대로 z
           - 벽에 건 것 < 책상 위 (바닥이 아래일수록 앞) · 다른 소품 위에 올린 것 = 그 소품 바로 앞 (같은 면 위끼리는 바닥 순서)
           - 담는 소품 안 = 담는 소품 → 안에 든 것(바닥 순서) → 앞벽 → 위에 올린 것 · 다이어리도 똑같이 (늘 맨 앞이 아니에요) */
        function deskZAll() { dkLayers(); }
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
            const items = [...stg.querySelectorAll('.desk-item, .dk-vol')], dy = document.getElementById('deskDiary'), surfs = deskSurfs(null);   // 📔 다이어리 권도 소품처럼 (안 · 위 · 바닥 순서)
            const bot = el => parseFloat(el.style.top) + parseFloat(el.style.height);
            const par = new Map();                                                // 무엇의 [안 'in' | 위 'on'] 인지
            items.forEach(el => { const b = dkItemBox(el); if (b) { par.set(el, { el: b, k: 'in' }); return; } const on = deskOn(el, surfs); if (on) par.set(el, { el: on.el, k: 'on' }); });
            let st = null;
            if (dy) {
                st = dkyGet(); const b = dkyIn(st);
                if (b) par.set(dy, { el: b, k: 'in' });
                else { const on = surfs.find(s => st.y >= s.y - 8 && st.y <= s.y + 14 && st.x >= s.x0 && st.x <= s.x1); if (on) par.set(dy, { el: on.el, k: 'on' }); }
            }
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
            if (dy) list.push({ el: dy, k: key(dy, 0) });
            fronts.forEach((v, b) => list.push({ el: b, front: 1, k: key(b, 0).concat([2]) }));
            const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { if (a[i] === undefined) return -1; if (b[i] === undefined) return 1; if (a[i] !== b[i]) return a[i] - b[i]; } return 0; };
            list.sort((a, b) => cmp(a.k, b.k));
            /* 🗂 손으로 고른 레이어 (lz = 겹친 것 몇 개만큼 앞 + / 뒤 -) : 자동 순서에서 겹친 것들만 세어 옮겨요 (안 겹친 건 앞뒤가 안 보여서) */
            const rectOf = o => (o.el === dy ? dy.querySelector(st.p === 'side' ? ':scope > .dk-spine' : ':scope > .dk-top') : o.el).getBoundingClientRect();
            const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
            DK.lzDone = new Map();
            list.filter(o => !o.front).forEach(o => {
                const lz = o.el === dy ? +(st.lz || 0) : +((DK.items.find(x => x.u === o.el.dataset.u) || {}).lz || 0); if (!lz) return;
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
                if (!f) { f = document.createElement('div'); f.className = 'dk-front'; f.dataset.fu = u; f.innerHTML = `<i class="dk-fm"><img data-art-u="${u}" alt="" draggable="false"></i>`; f.style.setProperty('--fm', `url("${new URL(d.front, location.href).href}")`); el.after(f); }   // 마스크 주소는 css 파일 기준이 아니라 이 페이지 기준으로
                const im = f.querySelector('img'), src = el.querySelector(':scope > img').src; if (im.src !== src) im.src = src;
                Object.assign(f.style, { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height, zIndex: on ? fz.get(el) : 0, display: on ? '' : 'none' });
                f.querySelectorAll('.dk-fn-tag, .dkn-tag').forEach(x => x.remove()); if (on) el.querySelectorAll(':scope > .dk-fn-tag, :scope > .dkn-tag').forEach(tg => f.appendChild(tg.cloneNode(true)));   // 🏷 기능 라벨이 앞벽에 가리지 않게 한 장 더
            });
            stg.querySelectorAll('.dk-front').forEach(f => { if (!keep.has(f.dataset.fu)) f.remove(); });
            if (dy) dy.classList.toggle('in-box', !!(par.get(dy) && par.get(dy).k === 'in'));
        }
        function deskLayer(d) {                                                   // 🛠 고른 소품 ⬆ 앞으로 · ⬇ 뒤로 · ↺ 자동
            const el = DK.sel, it = el && DK.items.find(x => x.u === el.dataset.u); if (!it) return;
            if (!d) delete it.lz; else { it.lz = (it.lz || 0) + d; dkLayers(); const got = (DK.lzDone && DK.lzDone.get(el)) || 0; if (got !== it.lz) it.lz = got; if (!it.lz) delete it.lz; }   // 더 갈 데가 없으면 그대로
            dkLayers(); deskTipPaint();
        }
        function dkyLayer(d) {                                                    // 📔 다이어리 ⬆ ⬇
            const st = DK.dyEdit; if (!st) return; const el = document.getElementById('deskDiary');
            st.lz = (st.lz || 0) + d; dkLayers(); const got = (DK.lzDone && DK.lzDone.get(el)) || 0; if (got !== st.lz) st.lz = got; if (!st.lz) delete st.lz; dkLayers();
        }
        window.deskLayer = deskLayer; window.dkyLayer = dkyLayer;
        /* 🛍️ 가게에서 사 온 봉투 (도련 10-30) : 기본상품 샵 가게에서 산 것이 봉투에 담겨 책상 앞쪽에 똑바로 놓여요 (최대 3개 · 저장 = 'diary_desk_bags')
           - 봉투 톡 = 봉투 속 상품 카드 → 카드를 아무 책상 소품에 끌어다 넣으면 그 소품이 그 상품 종류의 집 ('diary_desk_home' {u: [{ k: 종류, r: 누르는 곳 | null, tag }]})
           - 👆 한 소품에 여러 상품 (도련 10-30 · 서랍마다 다른 종류) : 첫 상품 = 소품 전체(r null) · 두 번째부터 [취소] [바꾸기] [➕ 추가]
             추가 = 다꾸러가 소품 그림 위에 누르는 곳을 직접 그려요 (앱이 알아서 정하지 않아요 · r = [l, t, r, b] % ) · 칸마다 이름표 · 고치기 · 빼기는 🛠 책상 꾸미기에서 칸을 톡
           - 집이 된 소품을 톡 = 그 종류 창 (기능도 있으면 고르기) · 🪑 책상 소품을 산 거면 끌어다 놓은 자리에 그 소품이 바로 놓여요
           - 다 꺼내면 봉투는 사라져요 · 진짜 상품은 살 때 이미 보관함에 들어가 있어요 (봉투는 정리하는 재미) */
        const DKB_KEY = 'diary_desk_bags', DKB_LOCAL = 'malang_desk_bags', DKH_KEY = 'diary_desk_home', DKH_LOCAL = 'malang_desk_home';
        const DKH_NAMES = { seal: '씰스티커', piece: '조각스티커', paper: '모조지스티커', tape: '마스킹테이프', tk: '떡메모지', leaf: '속지', emoji: '이모지', memo: '메모지', gd: '문구', tool: '다이어리', bg: '배경지', desk: '책상 소품' };
        const dkBags = () => { const v = typeof prefGet === 'function' ? prefGet(DKB_KEY, DKB_LOCAL) : null; return Array.isArray(v) ? v.filter(b => b && Array.isArray(b.it) && b.it.length) : []; };
        const dkBagsSet = v => { if (typeof prefSet === 'function') prefSet(DKB_KEY, DKB_LOCAL, v); };
        const dkHomes = () => {
            const v = typeof prefGet === 'function' ? prefGet(DKH_KEY, DKH_LOCAL) : null, H = v && typeof v === 'object' && !Array.isArray(v) ? v : {};
            Object.keys(H).forEach(u => { H[u] = Array.isArray(H[u]) ? H[u].filter(e => e && typeof e === 'object' && e.r && dkWin(e.k)) : []; if (!H[u].length) delete H[u]; });
            return H;
        };
        const dkHomesSet = v => { if (typeof prefSet === 'function') prefSet(DKH_KEY, DKH_LOCAL, v); };
        const dkKindIc = it => it.src ? `<img src="${it.src}" alt="">` : `<i>${{ gd: '✂️', desk: '🪑', bg: '🌈', tool: '📔' }[it.k] || (window.stkArt ? stkArt(it.k) : '🎁')}</i>`;
        function deskBagAdd(L) {
            if (!Array.isArray(L) || !L.length) return;
            const B = dkBags(); if (B.length >= 3) B[B.length - 1].it = B[B.length - 1].it.concat(L); else B.push({ t: Date.now(), it: L });
            dkBagsSet(B); deskBagsPaint();
        }
        function deskBagsPaint() {
            const st = document.getElementById('deskStage'); if (!st || !window.BAG_SVG) return;
            st.querySelectorAll('.dk-bag').forEach(x => x.remove());
            dkBags().forEach((bg, n) => {
                const b = document.createElement('button'); b.type = 'button'; b.className = 'dk-bag'; b.setAttribute('aria-label', `사 온 봉투 (${bg.it.length}개)`);
                const x = 836 + [0, -260, 260][n], y = 830;                      // 책상 앞쪽 · 똑바로 (도련 10-30 : 2배)
                b.style.left = (x - 120) + 'px'; b.style.top = (y - 268) + 'px';
                b.innerHTML = window.BAG_SVG + `<b class="dk-bag-n">${bg.it.length}</b>`;
                b.addEventListener('pointerdown', e => e.stopPropagation());
                b.addEventListener('click', e => { e.stopPropagation(); deskBagOpen(n); });
                st.appendChild(b);
            });
        }
        window.deskBagDrop = () => deskBagsPaint();
        /* 봉투 속 : 화면 맨 위 카드 줄 (봉투 위) · 카드를 끌어 책상 소품에 */
        function deskBagOpen(n) {
            let pn = document.getElementById('dkBagPanel');
            const B = dkBags(), bg = B[n];
            if (!bg) { if (pn) pn.hidden = true; return; }
            if (!pn) { pn = document.createElement('div'); pn.id = 'dkBagPanel'; pn.className = 'dkb-pn'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); }
            pn.dataset.n = n;
            pn.innerHTML = `<div class="dkb-top"><b>🛍️ 봉투 속</b><small>카드를 책상 소품에 끌어다 넣어요 · 넣은 소품을 누르면 그 창이 열려요</small><button type="button" class="dkb-x" onclick="deskBagOpen(-1)" aria-label="닫기">✕</button></div>`
                + `<div class="dkb-cards">${bg.it.map((it, j) => `<div class="dkb-card" data-j="${j}">${dkKindIc(it)}<b>${(it.n || DKH_NAMES[it.k] || '').replace(/</g, '&lt;')}</b><small>${DKH_NAMES[it.k] || ''}</small></div>`).join('')}</div>`;
            pn.querySelectorAll('.dkb-card').forEach(c => c.addEventListener('pointerdown', e => dkbGrab(e, n, +c.dataset.j, c)));
            pn.hidden = false;
        }
        function dkbTake(n, j) {                                                  // 카드 하나 꺼냈어요 → 봉투에서 빼요 (다 비면 봉투도)
            const B = dkBags(); if (!B[n]) return; B[n].it.splice(j, 1); if (!B[n].it.length) B.splice(n, 1);
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
                    const o = [...DK.items].reverse().find(x => x.id === it.id && x.at === 'box'), R = stg && stg.getBoundingClientRect();
                    const onStage = R && e.clientX >= R.left && e.clientX <= R.right && e.clientY >= R.top && e.clientY <= R.bottom && !e.target.closest('#dkBagPanel');
                    if (!onStage) return;
                    if (o) { const c = dkCat(o.id), s = DK.s || 1, dx = (e.clientX - R.left) / s, dy = (e.clientY - R.top) / s; o.x = Math.round(Math.max(0, Math.min(DESK_W - c.w, dx - c.w / 2))); o.y = Math.round(Math.max(0, Math.min(DESK_H - c.h, dy - c.h))); o.at = 'desk'; dkSave(); deskItemsRender(); deskModeRender(); }
                    dkbTake(n, j); return;
                }
                if (it.k === 'tool' && it.b) { if (dkvPlace(it.b, e.clientX, e.clientY)) dkbTake(n, j); return; }   // 📔 새 다이어리 = 놓은 자리에 그 권 (소품에 넣지 않아요)
                if (!t) return;                                                   // 소품 밖 = 다시 봉투로
                dkbHome(t, it, n, j);
            };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        /* 봉투 카드 넣기 = 그 상품 창을 이 소품에 연결하는 지름길 (도련 10-30) · 한 창 = 한 자리 (다른 곳에 있으면 '옮길까요?')
           아무 창도 없는 소품 = 소품 전체 · 창이 있으면 [취소] [바꾸기 = 소품 전체를 이 상품 창으로] [➕ 추가 = 누르는 곳을 그려 칸 하나 더] */
        async function dkbHome(t, it, n, j) {
            const u = t.dataset.u, o = DK.items.find(x => x.u === u), nm = o ? dkName(o) : '이 소품', win = dkWinOfKind(it.k), K = (dkWin(win) || [])[1] || DKH_NAMES[it.k];
            const M = Object.assign({}, deskFnMap()), H = dkHomes(), zones = H[u] || [], whole = Object.keys(M).find(k => M[k] === u);
            if (whole === win || zones.some(e => e.k === win)) { t.classList.remove('dkh-in'); void t.offsetWidth; t.classList.add('dkh-in'); dkbTake(n, j); return; }   // 이미 여기 = 그대로
            const wasU = M[win] || Object.keys(H).find(x => H[x].some(e => e.k === win)), ow = wasU && DK.items.find(x => x.u === wasU);
            if (ow && !await showAsk(`${K} 창이 ${dkName(ow)}에 있어요.<br>${josa(nm, '으로', '로')} 옮길까요?`, '옮기기', '취소')) return;
            let mode = 'all', r = null;
            if (whole || zones.length) {
                const has = [whole].concat(zones.map(e => e.k)).filter(Boolean).map(k => (dkWin(k) || [])[1]).join(' · ');
                const ans = await showAsk3(`🧺 ${nm}에는 <b>${has}</b> 창이 연결돼 있어요.<br>${josa(K, '으로', '로')} 바꿀까요?<br><span style="font-size:12px;color:#777;">➕ 추가 = 누르는 곳을 직접 정해서 같이 넣어요 (서랍마다 다르게)</span>`, '바꾸기', '취소', '➕ 추가');
                if (!ans) return;
                if (ans === 'extra') { r = o && await dkzDraw(o, win); if (!r) return; mode = 'zone'; }
                else if (whole && DK_EDIT_NEED.includes(whole)) { showMsg(`🛠 ${(dkWin(whole) || [])[1]}는 꼭 있어야 해서 바꿀 수 없어요.<br><span style="font-size:12px;color:#777;">➕ 추가로 칸을 그려 넣어 주세요</span>`); return; }
            }
            const M2 = Object.assign({}, deskFnMap()); dkWinFree(win, M2);
            if (mode === 'zone') { const H2 = dkHomes(); (H2[u] = H2[u] || []).push({ k: win, r }); dkHomesSet(H2); }
            else { Object.keys(M2).forEach(k => { if (M2[k] === u) delete M2[k]; }); M2[win] = u; }
            DK_FNS.forEach(([k]) => { if (!M2[k]) M2[k] = ''; });                   // 빠진 기능은 '' (저절로 다시 붙이지 않게)
            if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, M2);
            deskFnPaint();
            if (mode === 'zone') {                                                // 🏷 새 칸 = 그 칸 이름표를 물어봐요
                if (await showAsk(`🏷 ${K} 칸에 이름표를 붙일까요?<br><span style="font-size:12px;color:#777;">어느 서랍인지 잊지 않게요 · 🛠 책상 꾸미기에서 바꿀 수 있어요</span>`, '붙이기', '안 붙이기')) { dkzTagOn(u, win); setTimeout(() => dknPanel(u + '|' + win), 50); }
            } else if (o && !o.tag) { o.tag = { on: !!await showAsk(`🏷 ${nm}에 이름표를 붙일까요?<br><span style="font-size:12px;color:#777;">어디에 넣었는지 잊지 않게요 · 🛠 책상 꾸미기에서 바꿀 수 있어요</span>`, '붙이기', '안 붙이기') }; dkSave(); if (o.tag.on) setTimeout(() => dknPanel(o.u), 50); }   // 🏷 처음 집이 될 때 물어봐요 (도련 10-30 : 알아서 붙이지 말고 사용자가 꾸며서)
            dknPaintAll();
            t.classList.remove('dkh-in'); void t.offsetWidth; t.classList.add('dkh-in'); setTimeout(() => t.classList.remove('dkh-in'), 600);
            dkbTake(n, j);
        }
        /* ---------- 👆 칸 (누르는 곳) : 다꾸러가 직접 그려요 (도련 10-30 · 앱이 알아서 정하지 않아요) ---------- */
        const DKZ_MIN = 28;                                                       // 손가락으로 누를 수 있는 가장 작은 칸 (소품 그림 px)
        function dkzTagOn(u, k) { const H = dkHomes(), e = (H[u] || []).find(x => x.k === k && x.r); if (!e) return; e.tag = Object.assign({}, e.tag || {}, { on: true }); dkHomesSet(H); dknPaintAll(); }
        /* 누르는 곳 그리기 창 : 소품 그림 위를 끌어 네모 → 네모 끌기 = 옮기기 · 오른쪽 아래 점 = 크기 · 그려 둔 다른 칸은 흐리게 · ✔ 는 그려야 눌려요 → [l, t, r, b] % 또는 null(취소) */
        function dkzDraw(o, k, init) {
            return new Promise(done => {
                const c = dkCat(o.id) || { w: 200, h: 200 }, sc = Math.min(340 / c.w, 300 / c.h, 2.2), W = Math.round(c.w * sc), Hh = Math.round(c.h * sc);
                const others = (dkHomes()[o.u] || []).filter(e => e.r && e.k !== k);
                const w = document.createElement('div'); w.className = 'dkz-bk'; document.body.appendChild(w);
                w.addEventListener('pointerdown', e => e.stopPropagation());
                const KN = (dkWin(k) || [])[1] || '';
                w.innerHTML = `<div class="dkz-win"><div class="dky-row"><b>👆 ${KN} 누르는 곳</b><small>${dkName(o).replace(/</g, '&lt;')}</small></div>`
                    + `<p class="dkz-p">소품 그림 위를 <b>끌어서 네모</b>를 그려 주세요<br>네모 안을 누르면 ${KN} 창이 열려요</p>`
                    + `<div class="dkz-pic" style="width:${W}px;height:${Hh}px"><img src="${dkSrc(o)}" alt="" draggable="false">`
                    + others.map(e => `<i class="dkz-old" style="left:${e.r[0]}%;top:${e.r[1]}%;width:${e.r[2] - e.r[0]}%;height:${e.r[3] - e.r[1]}%"><span>${(dkWin(e.k) || [])[1]}</span></i>`).join('')
                    + `<div class="dkz-box" hidden><span>${KN}</span><b class="dkz-h"></b></div></div>`
                    + `<p class="dkz-warn" hidden></p><div class="dkz-btns"><button type="button" class="btn dkz-no">취소</button><button type="button" class="btn dkz-ok" disabled>✔ 정했어요</button></div></div>`;
                const P = w.querySelector('.dkz-pic'), Bx = w.querySelector('.dkz-box'), Hd = w.querySelector('.dkz-h'), ok = w.querySelector('.dkz-ok'), warn = w.querySelector('.dkz-warn');
                let R = init ? init.slice() : null, d = null;
                const pct = ev => { const q = P.getBoundingClientRect(); return [Math.max(0, Math.min(100, (ev.clientX - q.left) / q.width * 100)), Math.max(0, Math.min(100, (ev.clientY - q.top) / q.height * 100))]; };
                const small = () => (R[2] - R[0]) * c.w / 100 < DKZ_MIN || (R[3] - R[1]) * c.h / 100 < DKZ_MIN;
                const paint = () => {
                    Bx.hidden = !R; if (R) Object.assign(Bx.style, { left: R[0] + '%', top: R[1] + '%', width: (R[2] - R[0]) + '%', height: (R[3] - R[1]) + '%' });
                    const bad = !!R && small(); ok.disabled = !R || bad; warn.hidden = !bad; warn.textContent = bad ? '👆 너무 작아요 · 손가락으로 누를 수 있게 조금 키워 주세요' : '';
                };
                P.addEventListener('pointerdown', ev => {
                    ev.preventDefault(); const p = pct(ev);
                    d = R && ev.target === Hd ? { m: 'size', p, a: R.slice() } : R && ev.target.closest('.dkz-box') ? { m: 'move', p, a: R.slice() } : { m: 'new', p };
                    if (d.m === 'new') R = [p[0], p[1], p[0], p[1]];
                    try { P.setPointerCapture(ev.pointerId); } catch (e) {} paint();
                });
                P.addEventListener('pointermove', ev => {
                    if (!d) return; const [x, y] = pct(ev), dx = x - d.p[0], dy = y - d.p[1], a = d.a;
                    if (d.m === 'new') R = [Math.min(d.p[0], x), Math.min(d.p[1], y), Math.max(d.p[0], x), Math.max(d.p[1], y)];
                    else if (d.m === 'move') { const ww = a[2] - a[0], hh = a[3] - a[1], l = Math.max(0, Math.min(100 - ww, a[0] + dx)), t = Math.max(0, Math.min(100 - hh, a[1] + dy)); R = [l, t, l + ww, t + hh]; }
                    else R = [a[0], a[1], Math.max(a[0] + 2, Math.min(100, a[2] + dx)), Math.max(a[1] + 2, Math.min(100, a[3] + dy))];
                    paint();
                });
                const up = () => { if (!d) return; d = null; if (R && R[2] - R[0] < .5 && R[3] - R[1] < .5) R = null; paint(); };   // 톡만 하면 = 안 그린 것
                P.addEventListener('pointerup', up); P.addEventListener('pointercancel', up);
                const end = v => { w.remove(); done(v); };
                w.querySelector('.dkz-no').onclick = () => end(null);
                ok.onclick = () => { if (!ok.disabled) end(R.map(v => Math.round(v * 10) / 10)); };
                w.addEventListener('click', e => { e.stopPropagation(); if (e.target === w) end(null); });   // 창 밖 = 취소
                paint();
            });
        }
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
            } else {
                const r = await dkzDraw(o, k, e.r); if (!r) return;
                const H = dkHomes(), e2 = (H[u] || []).find(x => x.k === k && x.r); if (e2) { e2.r = r; dkHomesSet(H); }
            }
            dknPaintAll(); deskTipPaint(); dkzPaint();
        }
        window.dkzAct = dkzAct;
        /* 🏷 소품 이름표 (도련 10-30 : 연결한 소품을 까먹지 않게 · 다이어리 라벨처럼) : 글씨 · 아이콘 · 둘 다 · 라벨 바탕 · 아웃라인 · 글꼴 · 색 · 자리 · 크기
           it.tag = { on, m: 'ti' | 't' | 'i', t: 직접 쓴 글(없으면 연결한 종류 이름), ic: 아이콘(없으면 종류 아이콘), f, c, bx, bg, ol, oc, x, y, s } · 🛠 꾸미기 → 고른 소품 칩 '🏷 이름표' */
        const DKN0 = { on: false, m: 'ti', t: '', ic: '', f: 'sys', c: '#8a2f58', bx: true, bg: '#fffaf3', ol: false, oc: '#ffffff', x: .5, y: .45, s: 1, v: 0 };   // 처음 자리 = 소품 가운데 (위에 올린 소품 · 기능 이름표에 가리지 않게)
        const DKN_IC = ['⭐', '🌸', '🎀', '💖', '🍓', '🧸', '✂️', '📎', '🖍️', '📒', '🗂️', '🌈'];
        const dknFn = o => { const m = DK.edit && DK.editFn ? DK.editFn : deskFnMap(), k = o && Object.keys(m).find(x => m[x] === o.u); return dkWin(k); };   // 소품 전체 창 (기능 · 상품)
        /* 이름표 처음 값 : 기능이 붙은 소품은 예전 기능 이름표처럼 (켜짐 · 아래쪽) → 고치면 그때부터 내 이름표 (도련 10-30 : 이미 붙어 있던 이름표도 이 창으로) */
        const dknOf = o => Object.assign({}, DKN0, o && !o.tag && dknFn(o) ? { on: true, y: 1 } : {}, (o && o.tag) || {});
        const dknKindIc = k => ({ gd: '✂️', desk: '🪑', bg: '🌈', tool: '📔' }[k] || (window.stkArt ? stkArt(k) : '🎁'));
        function dknAuto(o) {                                                     // 비워 두면 = 소품 전체 창 (기능 · 상품) · 없으면 소품 이름
            const f = dknFn(o); return f ? { t: f[1], ic: f[3] } : { t: dkName(o), ic: '🏷️' };
        }
        /* 🏷 이름표 하나 만들기 = 소품 · 📔 다이어리 모두 이것 하나 (도련 10-30 : 이름표를 바꾸면 한 번에 다 바뀌게) · 모양은 css .dkn-tag
           g = { on, m, t, ic, f, c, bx, bg, ol, oc, x, y, s, v } · a = 비워 둘 때 { t, ic } · cls = 더 붙일 class */
        function dknBuild(g, a, cls) {
            const b = document.createElement('span'); b.className = 'dkn-tag' + (cls ? ' ' + cls : '') + (g.bx ? '' : ' clear') + (g.ol ? ' ol' : '') + (g.v ? ' v' : '');
            const fo = (typeof fontList !== 'undefined' ? fontList : []).find(x => x.id === g.f);
            Object.assign(b.style, { left: (g.x * 100) + '%', top: (g.y * 100) + '%', color: g.c, background: g.bx ? g.bg : 'transparent', fontFamily: fo ? fo.css : '' });
            b.style.setProperty('--fs', g.s); b.style.setProperty('--oc', g.oc);
            b.innerHTML = (g.m !== 't' ? `<i class="dkn-ic">${g.ic ? String(g.ic).replace(/[&<>"]/g, '') : a.ic}</i>` : '') + (g.m !== 'i' ? `<span class="dkn-t">${g.v ? [...String(g.t || a.t)].map(ch => ch === ' ' ? '<i class="dkn-sp"></i>' : ch.replace(/</g, '&lt;') + '<br>').join('') : String(g.t || a.t).replace(/</g, '&lt;')}</span>` : '');   // 세로쓰기 = 한 글자씩 아래로 (글자 사이 빈칸이 넘치던 것 막기)
            if (!g.t && g.m !== 'i') b.classList.add('ph');
            return b;
        }
        function dknPaintAll() {
            document.querySelectorAll('#deskStage .desk-item > .dkn-tag').forEach(x => x.remove());   // 📔 다이어리 이름표는 그대로
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const o = DK.items.find(x => x.u === el.dataset.u), ft = el.querySelector(':scope > .dk-fn-tag');
                if (ft) ft.hidden = !!(o && o.tag);                               // 내 이름표를 만들면 예전 기능 이름표는 숨겨요
                (dkHomes()[el.dataset.u] || []).forEach(e => {                    // 👆 칸 이름표
                    const T = e.r && e.tag && dknTarget(el.dataset.u + '|' + e.k); if (!T || !T.g.on) return;
                    const b = dknBuild(T.g, T.a, 'dkz-tag'); b.classList.remove('ph'); el.appendChild(b);
                });
                const g = dknOf(o); if (!o || !o.tag || !g.on) return;
                const b = dknBuild(g, dknAuto(o)); b.classList.remove('ph'); el.appendChild(b);
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
                + (g.m !== 'i' ? `<div class="dky-row"><input class="dky-t" maxlength="20" placeholder="${q(a.t)}" value="${q(g.t)}" oninput="${set}('t', this.value, 1)"><select onchange="${set}('f', this.value)">${fl.map(f => `<option value="${f.id}"${f.id === g.f ? ' selected' : ''}>${f.name.replace(/ \(Local\)$/, '')}</option>`).join('')}</select></div>` : '')
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
            return { o, g: Object.assign({}, DKN0, { on: true, x: (e.r[0] + e.r[2]) / 200, y: (e.r[1] + e.r[3]) / 200 }, e.tag || {}), a: { t: (dkWin(k) || [])[1], ic: (dkWin(k) || [])[3] }, sub: `${dkName(o)} · 👆 ${(dkWin(k) || [])[1]} 칸`,
                put: g => { const H = dkHomes(), e2 = (H[u] || []).find(x => x.k === k && x.r); if (e2) { e2.tag = g; dkHomesSet(H); } } };
        }
        function dknPanel(show) {
            let pn = document.getElementById('dknPanel');
            const id = show === true ? (DK.sel && DK.sel.dataset.u) || (pn && pn.dataset.u) : show, T = id && dknTarget(id);   // 고른 소품이 바뀌어도 창은 그 소품 그대로 (체크하면 창이 닫히던 것 · 도련 10-30)
            if (!show || !T) { if (pn) pn.hidden = true; dknEmoClose(); return; }   // 🛠 꾸미기 · 상품을 넣으며 '붙이기'를 골랐을 때 (그때는 바로 저장)
            if (!pn) { pn = document.createElement('div'); pn.id = 'dknPanel'; pn.className = 'dky-lbp'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); pn.addEventListener('click', e => e.stopPropagation()); }
            pn.dataset.u = id;
            pn.innerHTML = dknHtml(T.g, 'dknSet', 'dknPanel(false)', T.sub.replace(/</g, '&lt;'), T.a);
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
            const z = dkzHit(dkHomes()[el.dataset.u] || [], dkzPct(el, cx, cy)); if (!z) return false;
            deskRun(z.k); return true;
        }
        function dkHomeOpen(k) { if (k === 'desk') { deskBoxOpen(); return; } if (window.shGoSee) setTimeout(() => shGoSee(k, 0), 0); }
        window.deskBagAdd = deskBagAdd; window.deskBagOpen = deskBagOpen;
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
        const DKY_LB0 = { on: false, m: 't', ic: '', t: '', f: 'sys', c: '#8a2f58', bx: true, bg: '#fffaf3', ol: false, oc: '#ffffff', side: { x: .5, y: .3, s: 1, v: 1 }, front: { x: .5, y: .78, s: 1, v: 0 } };
        const dkyLb = st => { const L = Object.assign({}, DKY_LB0, (st && st.lb) || {}); L.side = Object.assign({}, DKY_LB0.side, L.side || {}); L.front = Object.assign({}, DKY_LB0.front, L.front || {}); return L; };
        const dkyFace = p => p === 'side' ? 'side' : 'front';
        function dkyLabelPaint() {
            const el = document.getElementById('deskDiary'); if (!el) return;
            const st = dkyGet(), L = dkyLb(st), fc = dkyFace(st.p), g = L[fc];
            el.querySelectorAll('.dky-lb').forEach(x => x.remove());
            if (!L.on || (!L.t && L.m !== 'i' && !DK.dyEdit)) return;
            const host = el.querySelector(fc === 'side' ? ':scope > .dk-spine' : ':scope > .dk-top'); if (!host) return;
            const b = dknBuild(Object.assign({}, L, g), { t: '이름표', ic: '📔' }, 'dky-lb ' + fc);   // 🏷 소품 이름표와 같은 것 하나 (dknBuild)
            host.appendChild(b);
        }
        const DKY_TC = ['#8a2f58', '#5b3f4a', '#c8457a', '#7a5bb8', '#3d7fc4', '#2f8a5a', '#d08a2a', '#ffffff'];
        const DKY_BC = ['#fffaf3', '#ffd3e2', '#e6dcf8', '#d6ecfb', '#dff4e7', '#fff1c4', '#5b3f4a', '#8a2f58'];
        const DKY_OC = ['#ffffff', '#5b3f4a', '#8a2f58', '#ffd3e2', '#fff1c4', '#d6ecfb', '#2a2a2a', '#d08a2a'];
        function dkyLbPanel(show) {                                               // 🏷 이름표 꾸미기 창 (꾸미기 동안 화면 위 · 소품 이름표와 같은 창)
            let pn = document.getElementById('dkyLbPanel');
            if (!show || !DK.dyEdit) { if (pn) pn.hidden = true; dknEmoClose(); return; }
            if (!pn) { pn = document.createElement('div'); pn.id = 'dkyLbPanel'; pn.className = 'dky-lbp'; document.body.appendChild(pn); pn.addEventListener('pointerdown', e => e.stopPropagation()); }
            const st = DK.dyEdit, L = st.lb = dkyLb(st), fc = dkyFace(st.p), g = L[fc];   // 🏷 소품 이름표와 같은 창 (도련 10-30)
            pn.innerHTML = dknHtml(Object.assign({}, L, g), 'dkyLbSet', 'dkyLbPanel(false)', (fc === 'side' ? '📚 책등' : '📔 앞면') + ' · 자리는 가로 · 세로로', { t: '예 : 2026 · 일기', ic: '📔' });
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
           - 처음 = 서랍장 왼쪽 옆에 📚 꽂기 */
        const DKY_KEY = 'diary_desk_dy', DKY_LOCAL = 'malang_desk_dy', DKY_S = .4;   // 세우면 실제 A6 크기쯤 (파일꽂이와 어울리게)
        const dkyDef = () => ({ x: 1222, y: 758, p: 'side' });
        function dkyGet() {                                                       // 펼쳐 둔 권의 자리 (권마다 따로 · 아래 📔 책상 = 다이어리 보관소)
            if (DK.dyEdit) return DK.dyEdit;
            const c = dkyCur(), M = dkyMap();
            return c ? dkyPosOf(c) : dkyOk(M._) ? M._ : dkyDef();                  // _ = 날짜형이 아닌 다이어리를 펼쳐 둔 때
        }
        /* ═══ 📔 책상 = 다이어리 보관소 (도련 10-30 : 현실처럼 받은 다이어리는 모두 책상에) ═══
           - 펼쳐 둔 권 = #deskDiary (진짜 다이어리를 줄여서 · 이름표 · 레이어) · 나머지 권 = .dk-vol (가벼운 표지 그림 · 그 권 색 · 해 이름판)
           - 자리 = 권마다 'diary_desk_dy' {권 id: {x, y : 바닥 가운데 · p : side · front · lay · lb · lz}} · 자리가 없는 권은 기본 다이어리 옆에 책등으로 줄지어 꽂혀요 (잃어버리지 않게)
           - 평소 다이어리 권 톡 = 그 권 펼치기 · 🛠 꾸미기 = 끌어 옮기기 · 톡 = 모습 (📚 꽂기 · 📔 세우기 · 🛏 눕히기) · 바구니 · 받침 위도 소품처럼 (dkLayers)
           - 🛍️ 봉투의 새 다이어리 카드 = 끌어 놓은 자리에 그 권 · 📔 보관소 창은 뒤에서만 (📱 폰 · 못 찾을 때 · 🛠 다이어리 메뉴 '📔 보관소') · 📦 소품함에는 안 들어가요 */
        const DKV_SZ = { side: [24, 127], front: [80, 120], lay: [150, 36] };       // 모습마다 크기 (책상 그림 px · #deskDiary 와 비슷하게)
        const DKV_COL = { pink: ['분홍', '#ffb6c1', '#ff6b81'], mint: ['녹색', '#a8dfc8', '#3fae86'], purple: ['보라', '#cdb8f2', '#8d63d8'], yellow: ['노랑', '#f5d58a', '#e39a1f'] };
        const dkyCur = () => (window.dyyBookId && (typeof dkType !== 'function' || !dkType()) ? dyyBookId() : '') || '';
        const dkyMap = () => { const v = typeof prefGet === 'function' ? prefGet(DKY_KEY, DKY_LOCAL) : null; return v && typeof v === 'object' && !('x' in v) ? v : {}; };
        const dkyOk = v => v && isFinite(+v.x) && isFinite(+v.y) && ['side', 'front', 'lay'].includes(v.p);
        const dkvBooks = () => window.dyyBooks ? dyyBooks() : [];
        function dkyPosOf(id) {                                                   // 그 권 자리 (없으면 줄지어 꽂힌 자리)
            const M = dkyMap(); if (dkyOk(M[id])) return M[id];
            const L = dkvBooks().filter(b => !dkyOk(M[b.id])), k = Math.max(0, L.findIndex(b => b.id === id));
            return { x: 1222 - 28 * k, y: 758, p: 'side' };
        }
        const dkvName = b => `${b.y} ${(DKV_COL[b.c] || DKV_COL.pink)[0]}${b.n > 1 ? ' ' + b.n : ''}`;
        const dkvPos = id => (DK.volEdit && DK.volEdit[id]) || dkyPosOf(id);
        function dkVolsPaint() {
            const st = document.getElementById('deskStage'); if (!st) return;
            st.querySelectorAll('.dk-vol').forEach(x => x.remove());
            const cur = dkyCur(), at = st.querySelector('.dk-diary');
            dkvBooks().filter(b => b.id !== cur).forEach(b => {
                const v = dkvPos(b.id), [w, h] = DKV_SZ[v.p] || DKV_SZ.side, C = DKV_COL[b.c] || DKV_COL.pink;
                const el = document.createElement('div'); el.className = 'dk-vol p-' + v.p; el.dataset.b = b.id; el.setAttribute('role', 'button'); el.title = `📔 ${dkvName(b)} 다이어리`;
                Object.assign(el.style, { left: Math.round(v.x - w / 2) + 'px', top: Math.round(v.y - h) + 'px', width: w + 'px', height: h + 'px' });
                el.style.setProperty('--dy-c', C[1]); el.style.setProperty('--primary-accent', C[2]);
                el.innerHTML = v.p === 'lay' ? `<i class="dv-pg"></i><i class="dv-cv"><b>${b.y}</b></i>` : `<i class="dv-cv"><b>${b.y}</b></i>`;
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
            if (DK.edit) { deskSelect(null); dkyMenu(false); }
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
            if (!id || !DK.edit) { if (m) m.hidden = true; dkSelPaint(); return; }
            if (!m) { m = document.createElement('div'); m.id = 'dkVolMenu'; m.className = 'dkv-menu'; document.body.appendChild(m); m.addEventListener('pointerdown', e => e.stopPropagation());
                addEventListener('pointerdown', e => { if (!m.hidden && !e.target.closest('#dkVolMenu, .dk-vol')) dkvMenu(null); }, true); }
            const b = dkvBooks().find(x => x.id === id), el = document.querySelector(`.dk-vol[data-b="${id}"]`); if (!b || !el) return;
            const p = dkvPos(id).p, bx = dkItemBox(el), bo = bx && DK.items.find(x => x.u === bx.dataset.u);
            m.innerHTML = `<b class="dkt-hd"><span class="dkt-chip">📔 다이어리</span>${dkvName(b)}${bo ? `<small>🧺 ${dkName(bo).replace(/</g, '&lt;')} 안</small>` : ''}</b>`
                + [['side', '📚 꽂기'], ['front', '📔 세우기'], ['lay', '🛏 눕히기']].map(([k, n]) => `<button type="button" class="${p === k ? 'on' : ''}" onclick="dkvPose('${id}','${k}')">${n}</button>`).join('');
            const r = el.getBoundingClientRect(); m.style.left = (r.left + r.width / 2) + 'px'; m.style.top = Math.min(innerHeight - 110, r.bottom + 14) + 'px'; m.hidden = false;
            el.classList.add('pose-on'); dkSelPaint();
        }
        function dkvPose(id, p) { dkvSet(id, { p }); dkVolsPaint(); dkvMenu(id); }
        /* 평소 다이어리 권 톡 = 그 권 펼치기 (펼쳐 둔 권은 먼저 저장 · js/dyyear.js dyySelect) */
        function dkVolOpen(id) {
            if (deskAnim || !window.dyySelect) return;
            dyySelect(id);                                                        // → dyyPaint → dkDeskBooks (펼쳐 둔 권이 바뀌어 자리도 바뀌어요)
            dkDeskBooks(); requestAnimationFrame(() => deskOpenDiary());
        }
        /* 펼쳐 둔 권 · 나머지 권 다시 그리기 (권이 바뀌거나 · 새로 받거나 · 버렸을 때 · js/dyyear.js dyyPaint) */
        function dkDeskBooks() {
            if (!document.getElementById('deskStage')) return;
            if (!DK.edit) { const el = document.getElementById('deskDiary'); if (el) el.hidden = !dkvBooks().length && !(typeof dkType === 'function' && dkType()); }
            dkyApply(); dkVolsPaint();
            if (!document.documentElement.classList.contains('desk-show') && !deskAnim) deskMiniPaint();
        }
        /* 🛍️ 봉투의 새 다이어리 카드를 책상에 놓아요 (그 자리 · 📚 꽂기) */
        function dkvPlace(id, cx, cy) {
            const stg = document.getElementById('deskStage'), R = stg && stg.getBoundingClientRect(); if (!R) return false;
            if (cx < R.left || cx > R.right || cy < R.top || cy > R.bottom) return false;
            const s = DK.s || 1, x = Math.round(Math.max(40, Math.min(1632, (cx - R.left) / s))), y = Math.round(dkBoxFloor(x, Math.max(120, Math.min(930, (cy - R.top) / s + 60)), null));
            const M = dkyMap(); M[id] = Object.assign({}, dkyOk(M[id]) ? M[id] : {}, { x, y, p: (M[id] && M[id].p) || 'side' });
            if (typeof prefSet === 'function') prefSet(DKY_KEY, DKY_LOCAL, M);
            dkDeskBooks(); return true;
        }
        window.dkVolsPaint = dkVolsPaint; window.dkDeskBooks = dkDeskBooks; window.dkvPose = dkvPose;

        function dkyApply() {
            const el = document.getElementById('deskDiary'); if (!el) return;
            const st = dkyGet();
            ['side', 'front', 'lay'].forEach(p => el.classList.toggle('p-' + p, st.p === p));
            el.style.setProperty('--ax', st.x + 'px'); el.style.setProperty('--ay', st.y + 'px'); el.style.setProperty('--dks', DKY_S);
            el.querySelectorAll('.dk-pose button').forEach(b => b.classList.toggle('on', b.dataset.p === st.p));
            dkLayers(); dkyLabelPaint(); if (DK.dyEdit) { const pn = document.getElementById('dkyLbPanel'); if (pn && !pn.hidden) dkyLbPanel(true); }
        }
        function dkyPose(p) { if (!DK.dyEdit) return; DK.dyEdit.p = p; dkyApply(); dkyMenu(true); }
        /* 📔 모습 고르기 창 = 화면 맨 위 한 겹(body) · 다이어리를 맨 앞으로 올리지 않아요 → 고르는 동안에도 레이어 · 바구니 안 모습 그대로 (도련 10-29) */
        function dkyMenu(on) {
            const m = document.getElementById('dkPose'), el = document.getElementById('deskDiary'); if (!m) return;
            if (!on || !el || !DK.dyEdit) { m.classList.remove('on'); if (el) el.classList.remove('pose-on'); dkSelPaint(); return; }
            if (m.parentElement !== document.body) { document.body.appendChild(m); m.addEventListener('pointerdown', e => e.stopPropagation()); }
            const v = el.querySelector(dkyGet().p === 'side' ? ':scope > .dk-spine' : ':scope > .dk-top').getBoundingClientRect();
            m.style.left = (v.left + v.width / 2) + 'px'; m.style.top = Math.min(innerHeight - 70, v.bottom + 14) + 'px';
            m.classList.add('on'); el.classList.add('pose-on');
            const hd = document.getElementById('dkPoseHd'), bx = DK.dyEdit && dkyIn(DK.dyEdit), bo = bx && DK.items.find(x => x.u === bx.dataset.u);
            if (hd) hd.innerHTML = `<span class="dkt-chip">📔 다이어리</span>${bo ? `<small>🧺 ${dkName(bo).replace(/</g, '&lt;')} 안</small>` : ''}`;
            dkSelPaint();
        }
        window.dkyMenu = dkyMenu;
        function dkyGrab(ev) {                                                    // 🛠 끌어 옮기기 · 톡 = 모습 고르기
            if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
            const el = document.getElementById('deskDiary'), st = DK.dyEdit, x0 = ev.clientX, y0 = ev.clientY, sx = st.x, sy = st.y, s = DK.s || 1; let moved = false;
            document.querySelectorAll('.desk-item.sel').forEach(x => x.classList.remove('sel')); if (window.deskSelect) deskSelect(null);
            const mv = e => { if (e.pointerId !== ev.pointerId) return; const dx = (e.clientX - x0) / s, dy = (e.clientY - y0) / s; if (!moved && Math.hypot(dx, dy) < 5) return; moved = true; el.classList.add('lift'); dkyMenu(false);   // 끌면 모습 고르기 창은 닫아요
                st.x = Math.round(Math.max(40, Math.min(1632, sx + dx))); st.y = Math.round(dkBoxFloor(st.x, Math.max(120, Math.min(930, sy + dy)), null)); dkyApply(); };
            const up = e => { if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); el.classList.remove('lift'); if (!moved) dkyMenu(!el.classList.contains('pose-on')); };
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
                if (!el.classList.contains('wall') && !dkIsBox(el)) y = dkBoxFloor(x + w / 2, y + h, el) - h;   // 🧺 담는 소품 안이면 바닥에 닿게
                el.style.left = x + 'px'; el.style.top = y + 'px';
                if (p.riders) p.riders.forEach(r => { r.o.style.left = (x + r.dx) + 'px'; r.o.style.top = (y + r.dy) + 'px'; });
                if (p.dyr && DK.dyEdit) { DK.dyEdit.x = Math.round(x + p.dyr.dx); DK.dyEdit.y = Math.round(y + p.dyr.dy); const dd = document.getElementById('deskDiary'); if (dd) { dd.style.setProperty('--ax', DK.dyEdit.x + 'px'); dd.style.setProperty('--ay', DK.dyEdit.y + 'px'); } }
                deskZAll();
                deskGuide(gh, gv); deskTipPlace();
            });
            const up = ev => {
                if (!p || ev.pointerId !== p.id) return; const was = p; p = null; el.classList.remove('lift'); deskGuide(null, null); DK.drag = false;
                if (was.tap) { if (ev.type !== 'pointercancel' && Math.hypot(ev.clientX - was.x0, ev.clientY - was.y0) < 10) { if (window.dcTap && dcTap(el, ev.clientX, ev.clientY)) return; if (dkHomeTap(el, ev.clientX, ev.clientY)) return; if (el.dataset.fn) deskRun(el.dataset.fn); } return; }   // 🛍️ 상품을 넣은 소품 = 그 창   // 평소 톡 = 소품 동작(누르는 곳 · js/deskcustom.js) 아니면 그 기능   // 평소 톡 = 그 기능
                if (!was.on) { if (ev.type !== 'pointercancel') { const z = dkzHit(dkHomes()[el.dataset.u] || [], dkzPct(el, ev.clientX, ev.clientY)); DK.zone = z ? `${el.dataset.u}|${z.k}` : null; deskSelect(el); } return; }   // 🛠 톡 = 고르기 · 👆 그린 칸을 톡 = 그 칸 메뉴 (소품 메뉴 대신 · 도련 10-30)
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
            DK.sel = el; if (el) { el.classList.add('sel'); dkyMenu(false); }   // 소품을 고르면 다이어리 창은 닫아요
            const tip = document.getElementById('deskTip'); if (tip) tip.classList.toggle('on', !!el);
            deskTipPaint(); dkzPaint(); dkSelPaint();
        }
        /* 🎯 지금 고른 것 한눈에 (도련 10-30 시안) : 고른 것 = 그림 모양 따라 핑크 선 (.sel) · 들어 있는 곳 = 연보라 점선 + '○○ 안 / 위' (.dk-host) · 같이 움직이는 것 = 연보라 점선
           · 나머지 = 연하게 (.dk-dim) · 👆 칸을 고르면 소품은 연보라 점선 '○○ 안' (.zsel) + 칸 밖은 하얗게 가려요 (dkzPaint) · 📔 다이어리 모습 창(pose-on)도 같은 규칙 */
        function dkSelPaint() {
            const st = document.getElementById('deskStage'); if (!st) return;
            st.querySelectorAll('.dk-hostlb').forEach(x => x.remove());
            st.querySelectorAll('.dk-host, .dk-dim, .zsel').forEach(x => x.classList.remove('dk-host', 'dk-dim', 'zsel'));
            const dyEl = document.getElementById('deskDiary'); if (dyEl) dyEl.classList.remove('dk-host', 'dk-dim');
            const vo = DK.edit && st.querySelector('.dk-vol.pose-on');                // 📔 다이어리 권 모습 창
            const el = DK.edit && DK.sel && DK.sel.classList && DK.sel.classList.contains('desk-item') ? DK.sel : vo || null, dyOn = !!(DK.edit && dyEl && dyEl.classList.contains('pose-on'));
            document.documentElement.classList.toggle('dk-sel-on', !!(el || dyOn));
            if (!el && !dyOn) return;
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
                if (dyEl && DK.dyEdit && dkIsBox(el) && dkyIn(DK.dyEdit) === el) host(dyEl);
            } else { keep.add(dyEl); const bx = DK.dyEdit && dkyIn(DK.dyEdit); if (bx) host(bx, `🧺 ${nm(bx)} 안`); }
            st.querySelectorAll('.desk-item, .dk-vol').forEach(o => { if (!keep.has(o)) o.classList.add('dk-dim'); });
            st.querySelectorAll('.dk-front').forEach(f => { const b = st.querySelector(`.desk-item[data-u="${f.dataset.fu}"]`); if (b && b.classList.contains('dk-dim')) f.classList.add('dk-dim'); });
            if (dyEl && !keep.has(dyEl)) dyEl.classList.add('dk-dim');
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
        }
        function deskTipPaint() {                                                 // 🛠 고른 소품 위 : 기능 칩 + 🧲 · 📦 넣기 · 🗑 버리기
            const tip = document.getElementById('deskTip'), el = DK.sel; if (!tip) return;
            if (!el || !DK.edit) { tip.innerHTML = ''; return; }
            const u = el.dataset.u, m = DK.editFn || {};
            const zk = DK.zone && DK.zone.split('|')[0] === u && DK.zone.split('|')[1], ze = zk && (dkHomes()[u] || []).find(x => x.k === zk && x.r);
            if (ze) {                                                              // 👆 그린 칸을 톡 = 그 칸 메뉴 (소품 메뉴 대신 · 칸 밖을 톡 = 소품 메뉴)
                tip.innerHTML = `<b class="dkt-hd"><span class="dkt-chip lv">👆 칸</span>${(dkWin(zk) || [])[1]}<small>· ${dkName(DK.items.find(x => x.u === u) || {}).replace(/</g, '&lt;')}</small></b><div class="dkt-act"><button type="button" class="desk-snap" onclick="deskFnOpen(false)">🔗 기능 연결</button><button type="button" class="desk-snap" onclick="dkzAct('draw','${DK.zone}')">✏️ 누르는 곳 다시 그리기</button></div><div class="dkt-act">`
                    + `<button type="button" class="desk-snap" onclick="dkzAct('tag','${DK.zone}')">🏷 칸 이름표</button><button type="button" class="desk-snap" onclick="dkzAct('del','${DK.zone}')">🗑 칸 빼기</button></div>`;
                deskTipPlace(); return;
            }
            const f = Object.keys(m).find(k => m[k] === u), fi = f && DK_FNS.find(x => x[0] === f);
            const me = DK.items.find(x => x.u === u), bx = dkItemBox(el), bo = bx && DK.items.find(x => x.u === bx.dataset.u);
            tip.innerHTML = `<b class="dkt-hd"><span class="dkt-chip">🪑 소품</span>${me ? dkName(me).replace(/</g, '&lt;') : ''}${bo ? `<small>🧺 ${dkName(bo).replace(/</g, '&lt;')} 안</small>` : ''}</b>`
                + `<div class="dkt-act"><button type="button" class="desk-snap${fi ? ' on' : ''}" onclick="deskFnOpen(false)">🔗 기능 연결</button>`   // 기능 연결은 창으로 (도련 10-28) · 연결돼도 글은 늘 '기능 연결' (기능 이름이면 샵 가는 버튼으로 착각 · 도련 10-28)
                + `<button type="button" class="desk-snap" onclick="deskTipAct('paint')">🎨 꾸미기</button><button type="button" class="desk-snap" onclick="deskTipAct('box')">📦 넣기</button></div>`
                + `<div class="dkt-act"><button type="button" class="desk-snap" onclick="dknPanel(true)">🏷 소품 이름표</button><button type="button" class="desk-snap" onclick="deskLayer(1)">⬆ 앞으로</button><button type="button" class="desk-snap" onclick="deskLayer(-1)">⬇ 뒤로</button>${(DK.items.find(x => x.u === u) || {}).lz ? '<button type="button" class="desk-snap" onclick="deskLayer(0)">↺ 자동</button>' : ''}</div>`;   // 🗂 레이어 (도련 10-29 : 자동 + 손으로)   // 🧲 딱 맞추기 = 작업대 · 📤 저장(공유)은 숨김 · 🗑 버리기는 📦 소품함에서
            deskTipPlace();
        }
        /* 🔗 기능 연결 창 (도련 10-28) : 고른 소품에 기능 하나 · 다시 누르면 풀기 */
        /* 🔗 기능 연결 창 (도련 10-30 : 모든 창 한 목록) : 📌 기본 기능 · 🛍️ 상품 창 · 지금 고른 곳 = 소품 전체 / 👆 칸 / ➕ 새 칸 · 맨 아래 ➕ 누르는 곳을 따로 정해 추가 */
        function deskFnOpen(add) {
            const el = DK.sel; if (!DK.edit || !el) return;
            if (add !== undefined) DK.fnAdd = !!add;
            const u = el.dataset.u, m = DK.editFn || {}, o = DK.items.find(x => x.u === u), box = document.getElementById('deskFnList'); if (!box) return;
            const zk = !DK.fnAdd && DK.zone && DK.zone.split('|')[0] === u ? DK.zone.split('|')[1] : '', H = dkHomes();
            const where = k => { if (m[k]) { const x = DK.items.find(y => y.u === m[k]); return x ? dkName(x) : ''; } const zu = Object.keys(H).find(y => H[y].some(e => e.k === k)), x = zu && DK.items.find(y => y.u === zu); return x ? dkName(x) + ' 칸' : ''; };
            const tt = document.getElementById('deskFnTitle'); if (tt) tt.textContent = DK.fnAdd ? '➕ 새 칸에 연결할 창을 골라요 (고르면 누르는 곳을 그려요)' : zk ? `👆 ${(dkWin(zk) || [])[1]} 칸에 연결할 창` : (o ? dkName(o) + '에 연결할 창' : '');
            const btn = ([k, n, , ic]) => { const mine = DK.fnAdd ? false : zk ? zk === k : m[k] === u, w = mine ? '' : where(k);
                return `<button type="button" class="btn${mine ? ' on' : ''}" onclick="deskFnPick('${k}').then(() => document.getElementById('deskFnModal').style.display !== 'none' && deskFnOpen())"><b>${ic} ${n}</b><small>${mine ? (zk ? '✔ 이 칸' : '✔ 연결됨 · 누르면 풀기') : w ? '지금 : ' + w : k === 'edit' ? '꼭 필요해요' : ''}</small></button>`; };
            const W = dkWins();
            box.innerHTML = `<h4 class="dkf-g">📌 기본 기능</h4>` + W.filter(x => x[4] === 'fn').map(btn).join('')
                + `<h4 class="dkf-g">🛍️ 상품 창</h4>` + W.filter(x => x[4] === 'h').map(btn).join('')
                + (DK.fnAdd ? `<button type="button" class="btn dkf-add on" onclick="deskFnOpen(false)">✕ 추가 그만두고 돌아가기</button>` : zk ? '' : `<button type="button" class="btn dkf-add" onclick="deskFnOpen(true)">➕ 누르는 곳을 따로 정해 추가 <small>서랍마다 다른 창</small></button>`);
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
