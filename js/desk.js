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
            // surf = 위에 물건을 올릴 수 있는 면 [소품 안 세로 자리, 왼쪽 끝, 오른쪽 끝] (소품 그림 px) · 올려 둔 물건은 함께 움직이고 그 소품보다 앞에 보여요
            { id: 'corkboard', kind: 'board', src: 'img/desk/corkboard.webp?v=20261009-832', w: 520, h: 393, x: 600, y: 90, name: '코르크 게시판', wall: 1 },
            { id: 'wallshelf', kind: 'wallshelf', src: 'img/desk/wallshelf.webp?v=20261009-833', w: 430, h: 248, x: 160, y: 104, name: '벽 선반', wall: 1, surf: [[50, 10, 421], [211, 10, 421]] },
            { id: 'drawer-pink', kind: 'drawer', src: 'img/desk/drawer-pink.webp?v=20261009-833', w: 330, h: 257, x: 170, y: 504, name: '핑크 서랍장', surf: [[16, 8, 322]] },
            { id: 'riser', kind: 'riser', src: 'img/desk/riser.webp?v=20261009-833', w: 470, h: 92, x: 560, y: 669, name: '모니터 받침대', surf: [[16, 3, 467]] },
            { id: 'basket', kind: 'basket', src: 'img/desk/basket.webp?v=20261009-833', w: 170, h: 142, x: 600, y: 544, name: '책 바구니' },
            { id: 'pencup', kind: 'pencup', src: 'img/desk/pencup.webp?v=20261009-833', w: 100, h: 148, x: 840, y: 538, name: '연필꽂이' },
            { id: 'bookbox', kind: 'bookshelf', src: 'img/desk/bookbox2.webp?v=20261009-832', w: 200, h: 152, x: 230, y: 367, name: '책 상자' },
            { id: 'magfile', kind: 'bookshelf', src: 'img/desk/magfile2.webp?v=20261009-832', w: 110, h: 241, x: 1090, y: 520, name: '파일꽂이' },
            { id: 'polaroid', kind: 'photo', src: 'img/desk/polaroid2.webp?v=20261009-831', w: 126, h: 152, x: 1395, y: 120, name: '폴라로이드', wall: 1, photo: [17.1, 22.2, 82.9, 86.2] },   // 줄에 집게로 건 사진 (줄이 양옆으로 이어져요)   // 📷 나중에 사용자 사진을 넣어 벽에 붙여요 (photo = 사진 자리 %)
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
            const L = Array.isArray(v) ? v.filter(o => o && typeof o.u === 'string' && dkCat(o.id) && !seenU.has(o.u) && seenU.add(o.u)).map(o => Object.assign({ u: o.u, id: o.id, at: o.at === 'box' ? 'box' : 'desk', x: +o.x || 0, y: +o.y || 0 }, typeof o.c === 'string' ? { c: o.c } : {}, o.g ? { g: 1 } : {}, o.p ? { p: 1 } : {})) : dkStarter();
            DK.fresh = !Array.isArray(v);                                         // 아직 목록이 없어요 → 🎁 기본세트 (드라이브를 읽은 뒤 giftEnsure)
            DK.items = L; DK.seen = JSON.stringify(L);
        }
        /* 🗂 종류 폴더 파일 (js/coll.js) */
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
            ['shop', '기본상품 샵', '', '🏪'], ['edit', '책상 꾸미기', '', '🛠']];
        const DK_FN_DEF = { skin: 'bookbox', sticker: 'basket', gd: 'pencup', cafe: 'corkboard', set: 'clock', shop: 'magfile', edit: 'drawer' };
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
           스티커 · 문구함 · 카페는 다이어리에 쓰는 거라 책상에 놓인 다이어리를 먼저 펴요 · 🏪 기본상품 샵 · 📦 보관함은 바로 */
        function deskRun(fn) {
            if (fn === 'shop') { setTimeout(() => window.shopSceneOpen ? shopSceneOpen() : window.openShelf && openShelf(), 0); return; }   // 🏪 가게 안으로 (js/shopscene.js)
            if (fn === 'edit') { setTimeout(deskEditOpen, 0); return; }
            const f = DK_FNS.find(x => x[0] === fn), b = f && document.querySelector('.toolbar .' + f[2]); if (!b) return;
            const go = () => { b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); b.click(); };
            if (fn !== 'skin' && fn !== 'set' && !document.documentElement.classList.contains('desk-show')) { deskOpenDiary(); setTimeout(go, 620); }
            else setTimeout(go, 0);
        }
        /* 다이어리를 펴 둔 동안 : 소품은 다이어리 뒤라 직접 안 눌려요 → 빈 곳을 톡 한 자리에 기능 소품이 맨 앞에 보이면 그 기능 (js/drive.js) */
        function deskTapAt(x, y) {
            if (!document.documentElement.classList.contains('desk-on') || DK.edit) return false;
            const top = [...document.querySelectorAll('#deskStage .desk-item')].filter(el => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; })
                .sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
            if (!top || !top.dataset.fn) return false;
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
                <div class="dk-diary" id="deskDiary" role="button" tabindex="0" aria-label="다이어리 펴기"><div class="dk-top"><div class="diary-book dk-mini"></div></div><i class="dk-edge"></i></div>
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"></div></div>`;
            const dd = document.getElementById('deskDiary'); let dn = null;
            dd.addEventListener('pointerdown', ev => { dn = [ev.clientX, ev.clientY]; ev.stopPropagation(); });
            dd.addEventListener('pointerup', ev => { if (dn && !DK.edit && Math.hypot(ev.clientX - dn[0], ev.clientY - dn[1]) < 8) deskOpenDiary(); dn = null; });
            dd.addEventListener('keydown', ev => { if (!DK.edit && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); deskOpenDiary(); } });
            deskItemsRender();
            deskMiniPaint();
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
        function dkPersist(it) {
            if (!(DK.edit && DK.back)) { dkSave(); return; }
            const b = JSON.parse(DK.back.items), i = b.findIndex(x => x.u === it.u), rec = JSON.parse(JSON.stringify(it));
            if (i >= 0) b[i] = Object.assign(rec, { x: b[i].x, y: b[i].y, at: b[i].at }); else b.push(rec);   // 자리는 들어오기 전 그대로
            DK.back.items = JSON.stringify(b);
            if (typeof prefSet === 'function') prefSet(DK_ITEMS_KEY, DK_ITEMS_LOCAL, b);
        }
        /* 고른 소품 위 버튼 : 🎨 칠하기 · 📦 보관함에 넣기 · 🗑 버리기 */
        function deskTipAct(a) { const el = DK.sel; if (!el) return; const u = el.dataset.u; deskSelect(null); if (a === 'paint') { if (window.dpOpen) dpOpen(u); } else if (a === 'share') { if (window.ishSaveDesk) ishSaveDesk(u); } else if (a === 'box') deskPut(u, 'box'); else deskDiscard(u); }
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
            const ok = window.showAsk ? await showAsk(`🗑 ${josa(dkName(o), '을', '를')} 버릴까요?<br><small>버린 소품은 🏪 기본상품 샵에서 다시 받을 수 있어요</small>`, '버리기', '그만두기') : true;
            if (!ok) return;
            DK.items = DK.items.filter(x => x.u !== u); dkSave();
            if (!DK.edit) dkFileDel(o);                                        // 🛠 꾸미는 중이면 확정할 때 (선물이면 선물.json 에서 빼요) deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender(); deskEditPaint();
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
                html: have.length ? have.map(x => `<button type="button" class="dk-tab${x === k ? ' on' : ''}" onclick="${fn}('${x}')">${DESK_DIRS[x]}<small>${list.filter(o => dkKindOf(o) === x).length}</small></button>`).join('') : '' };
        }
        function deskBoxTab(k) { DK.boxKind = k; deskBoxRender(); }
        function deskTrayTab(k) { DK.trayKind = k; deskEditPaint(); }
        function deskBoxRender() {
            const box = document.getElementById('deskBoxList'); if (!box) return;
            if (!DK.items.length) { box.innerHTML = '<p class="dkb-empty">아직 소품이 없어요.<br>🏪 기본상품 샵에서 받아 와요</p>'; return; }
            const T = dkTabs(DK.items, 'boxKind', 'deskBoxTab');
            const order = T.rows.slice().sort((a, b) => (a.at === b.at ? 0 : a.at === 'box' ? -1 : 1));   // 보관 중인 것이 먼저
            box.innerHTML = `<div class="dk-tabs">${T.html}</div>` + order.map(o => {
                const c = dkCat(o.id), fn = o.at === 'desk' ? dkFnOf(o.u) : '', f = fn && DK_FNS.find(x => x[0] === fn);
                return `<div class="dkb-it${o.at === 'box' ? ' in' : ''}"><span class="dkb-pic"><img src="${dkSrc(o)}" data-art-u="${o.u}" alt="" loading="lazy"></span><b>${dkName(o)}</b>`
                    + `<small>${o.at === 'box' ? '📦 보관 중' : '🪑 책상 위'}${f ? ` · ${f[3]} ${f[1]}` : ''}</small><div class="dkb-btns">`
                    + (o.at === 'box' ? `<button type="button" class="btn" onclick="deskPut('${o.u}', 'desk')">🪑 놓기</button>` : `<button type="button" class="btn" onclick="deskPut('${o.u}', 'box')">📦 넣기</button>`)
                    + `<button type="button" class="btn dkb-del" onclick="deskDiscard('${o.u}')">🗑</button></div></div>`;
            }).join('');
        }
        function deskBoxOpen() {                                                  // 🪑 책상 화면이면 🛠 꾸미기(아래 보관함 줄) · ▤ 하단 메뉴 화면이면 보관함 창
            if (document.documentElement.classList.contains('desk-on')) { deskEditOpen(); return; }
            deskBoxRender(); if (window.openModal) openModal('deskBoxModal');
        }
        /* ---------- 🛠 책상 꾸미기 (도련 10-27) ---------- */
        function deskEditOpen() {
            const H = document.documentElement; if (!H.classList.contains('desk-on') || DK.edit) return;
            if (H.classList.contains('desk-show')) { deskMiniPaint(); H.classList.remove('desk-show'); const m = document.getElementById('deskDiary'); if (m) m.style.visibility = ''; }   // 펴 둔 다이어리는 책상에 내려놓고 (펼친 모양은 보일 때 그려요)
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'flex' || m.style.display === 'block') { const x = m.querySelector('.mt-x'); if (x) x.click(); else m.style.display = 'none'; } });
            DK.back = { items: JSON.stringify(DK.items), fn: JSON.stringify(deskFnMap()) };   // 취소하면 이대로
            DK.editFn = JSON.parse(DK.back.fn); DK.edit = true;
            H.classList.add('desk-edit'); H.classList.remove('desk-lack');
            deskSelect(null); deskFnPaint(); deskEditPaint();
        }
        function deskEditFromSettings() { if (window.closeModal) closeModal('settingsModal'); deskEditOpen(); }
        function deskEditEnd(ok) {
            if (!DK.edit) return;
            if (ok) {
                const miss = DK_FN_NEED.filter(k => !DK.editFn[k]);
                if (miss.length) { if (window.showMsg) showMsg(`아직 연결 안 된 기능이 있어요.<br><b>${miss.map(k => { const f = DK_FNS.find(x => x[0] === k); return f[3] + ' ' + f[1]; }).join(' · ')}</b><br><small>소품을 톡 하고 위 칩에서 골라 주세요</small>`); return; }
                const fn = DK.editFn, gone = JSON.parse(DK.back.items).filter(b => !DK.items.some(x => x.u === b.u));
                DK.edit = false; dkSave();
                gone.filter(o => !o.g).forEach(dkFileDel); if (gone.some(o => o.g)) giftWrite();   // 🗑 버린 소품의 파일 · 🎁 선물.json
                if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, fn);
            } else {
                DK.edit = false; DK.items = JSON.parse(DK.back.items); DK.seen = DK.back.items;
            }
            DK.editFn = null; DK.back = null;
            document.documentElement.classList.remove('desk-edit');
            deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender();
        }
        /* 위 막대 (확정 가능 여부) · 아래 📦 보관함 줄 */
        function deskEditPaint() {
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
        function deskZAll() {
            const items = [...document.querySelectorAll('#deskStage .desk-item')], bot = el => parseFloat(el.style.top) + parseFloat(el.style.height);
            const z = new Map(), surfs = deskSurfs(null), get = (el, depth) => {
                if (z.has(el)) return z.get(el);
                const on = depth < 6 ? deskOn(el, surfs) : null;
                const v = on ? get(on.el, depth + 1) + 1 : el.classList.contains('wall') ? 1 : 10 + Math.round(bot(el)) * 2;
                z.set(el, v); return v;
            };
            items.forEach(el => { el.style.zIndex = get(el, 0); });
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
            const mini = document.getElementById('deskDiary'), box = mini && mini.querySelector('.dk-mini'), src = document.getElementById('diaryBook'); if (!box || !src) return;
            const Z = dkMeasure(); if (!Z) return;
            const open = dkOpenNow(), k = DK_MW / Z.bw, W = Math.round(Z.vw * k), H = Math.round(Z.vh * k);
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
            mini.classList.toggle('open', open); mini.style.setProperty('--dkw', W + 'px'); mini.style.setProperty('--dkh', H + 'px'); mini.dataset.sz = dkMiniKey(Z);
            box.replaceChildren(wrap);
        }
        const dkMiniKey = Z => [Math.round(Z.vw * DK_MW / Z.bw), Math.round(Z.vh * DK_MW / Z.bw), dkOpenNow() ? 1 : 0].join('x');
        /* 다이어리 크기가 정해진 뒤(로그인 · 화면 크기 바뀜) 책상 위 다이어리 크기가 다르면 다시 그려요 (처음 켤 때는 다이어리 크기가 정해지기 전이라 · 도련 10-28) */
        function deskMiniSync() {
            const mini = document.getElementById('deskDiary'); if (!mini || deskAnim || document.documentElement.classList.contains('desk-show')) return;
            const Z = dkMeasure(); if (Z && mini.dataset.sz !== dkMiniKey(Z)) deskMiniPaint();
        }
        /* 떠오르기 · 내려놓기 : 떠 있는 다이어리가 책상 위 다이어리와 '똑같은 계산'(아래 끝 기준 · 같은 원근 · 같은 각도)으로 내려앉아요 → 놓이는 순간 모양이 그대로 이어져요
           dkDeskTf(w, mini) = 책상 위에 놓인 모양의 transform (w 의 기준점 = 보이는 것의 아래 가운데) */
        function dkDeskTf(w, mini) {
            const bk = document.getElementById('diaryBook'), ip = document.getElementById('innerPage'), cv = document.getElementById('coverPage');
            const rw = w.getBoundingClientRect(), rv = dkVisEl(bk, ip, cv).getBoundingClientRect();
            const ox = rv.left + rv.width / 2 - rw.left, oy = rv.bottom - rw.top;
            w.style.transformOrigin = `${ox}px ${oy}px`;
            const R = mini.getBoundingClientRect(), s = DK.s || 1, mh = parseFloat(mini.style.getPropertyValue('--dkh')) || 0;
            const k = R.width / s / rv.width, bx = R.left + R.width / 2, by = R.top + mh * s;
            return `translate(${bx - rw.left - ox}px, ${by - rw.top - oy}px) scale(${s}) perspective(900px) rotateX(${DK_TILT}deg) scale(${k})`;
        }
        function deskOpenDiary() {
            const H = document.documentElement, mini = document.getElementById('deskDiary'), w = document.getElementById('diaryWrapper');
            if (deskAnim || !mini || !w || H.classList.contains('desk-show')) return;
            deskAnim = true; deskSelect(null);
            H.classList.add('desk-show');                                         // 로그인 뒤 처음은 늘 접힌 채 (isCoverOpen = false) · 그 뒤로는 내려놓은 모양 그대로
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
            moved.forEach(el => { el.style.zIndex = 2900; });                    // 당겨 보여 준 소품은 맨 앞 (다른 소품에 가려 못 누르지 않게)
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
                deskZAll();
                deskGuide(gh, gv); deskTipPlace();
            });
            const up = ev => {
                if (!p || ev.pointerId !== p.id) return; const was = p; p = null; el.classList.remove('lift'); deskGuide(null, null); DK.drag = false;
                if (was.tap) { if (ev.type !== 'pointercancel' && el.dataset.fn && Math.hypot(ev.clientX - was.x0, ev.clientY - was.y0) < 10) deskRun(el.dataset.fn); return; }   // 평소 톡 = 그 기능
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
            tip.innerHTML = `<div class="dkt-fn">${DK_FNS.map(([k, n, , ic]) => `<button type="button" class="dkt-chip${m[k] === u ? ' on' : ''}${DK_FN_NEED.includes(k) && !m[k] ? ' need' : ''}" onclick="deskFnPick('${k}')">${ic} ${n}</button>`).join('')}</div>`
                + `<div class="dkt-act"><button type="button" class="desk-snap${DK.snap ? '' : ' off'}" onclick="deskSnapToggle()" title="💻 끄는 동안 Shift 를 누르면 잠깐 반대로">${DK.snap ? '🧲 딱 맞추기 켬' : '〰️ 딱 맞추기 끔'}</button>`
                + `<button type="button" class="desk-snap" onclick="deskTipAct('paint')">🎨 꾸미기</button><button type="button" class="desk-snap" onclick="deskTipAct('share')">📤 저장</button><button type="button" class="desk-snap" onclick="deskTipAct('box')">📦 넣기</button><button type="button" class="desk-snap dk-del" onclick="deskTipAct('del')">🗑 버리기</button></div>`;
            deskTipPlace();
        }
        function deskSnapToggle() { DK.snap = !DK.snap; dkSet(DK_SNAP, DK.snap); deskTipPaint(); }
        document.addEventListener('pointerdown', ev => {                          // 다른 곳을 누르면 고르기 끝
            if (!DK.sel) return; const t = ev.target;
            if (t.closest && (t.closest('.desk-item') || t.closest('#deskTip') || t.closest('#deskEditBar') || t.closest('#deskEditTray') || t.closest('.modal'))) return;
            deskSelect(null);
        }, true);
        window.addEventListener('resize', () => requestAnimationFrame(deskFit));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', deskBuild); else deskBuild();
        window.deskSnapToggle = deskSnapToggle; window.deskOpenDiary = deskOpenDiary; window.deskCloseDiary = deskCloseDiary;
        window.deskTipAct = deskTipAct; window.deskPut = deskPut; window.deskDiscard = deskDiscard; window.deskGive = deskGive; window.deskReceive = deskReceive; window.deskBoxTab = deskBoxTab; window.deskTrayTab = deskTrayTab; window.deskShopList = deskShopList; window.deskBoxOpen = deskBoxOpen; window.deskBoxRender = deskBoxRender;
        window.deskFnPick = deskFnPick; window.deskEditOpen = deskEditOpen; window.deskEditEnd = deskEditEnd; window.deskEditFromSettings = deskEditFromSettings; window.deskEditShop = deskEditShop;
        window.deskMiniPaint = deskMiniPaint; window.deskMiniSync = deskMiniSync; window.deskTapAt = deskTapAt;  window.deskModeRender = deskModeRender; window.deskFnItemName = deskFnItemName;
