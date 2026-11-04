/* 말랑달콤 다이어리 - js/shopscene.js
   🏪 기본상품 샵 가게 (도련 10-27 · 🪑 책상 화면에서 🏪 기본상품 샵 소품을 누르면)
   - 분홍 문(img/shop-door.webp · 알림판에 '기본상품 샵') 이 화면을 채우고 → 🔔 딸랑~ (설정 ✨ 연출 소리) · 로그인 화면처럼 문 쪽으로 다가가며 연핑크 빛 → 가게 안(img/shop-inside.webp)
   - 가게 안 진열대마다 이름표 = 기본상품 샵 메뉴 (씰 · 조각 · 모조지 · 마테 · 떡메 · 속지 · 이모지 · 메모지 · 정리 도구 · 문구 · 책상 소품 · 🌸 계절은 이벤트 때만)
       톡 = 그 상품을 고르는 창 (js/basket.js shOpenKind) · 창의 '‹ 기본상품 샵' = 창만 닫고 가게 안 그대로
   - 그림은 화면을 꽉 채우고(cover) · 이름표 자리는 그림 픽셀 기준 → 화면 자리로 · 화면 밖으로 잘리면 안쪽으로 당겨요
   - 🚪 이동 (오른쪽 위 · 도련 10-31) → 이동 창 (js/desk.js deskMoveOpen) 의 🚪 내 방 = 내 방 문(img/room-door.webp)을 지나 책상으로 (도련 10-30) · ▤ 하단 메뉴 화면에서는 예전처럼 기본상품 샵 창 (js/basket.js openShelf)
   - 💻 PC · 아이패드만 (도련 10-27 · html.desk-on = 화면 짧은 쪽 600px 이상 + 🪑 책상 화면) · 📱 폰 · 하단 메뉴 화면은 늘 예전 기본상품 샵 창 · 가게 안에서 화면이 좁아지면 가게를 닫고 기본상품 샵 창으로 */

        const DOOR_W = 1672, DOOR_H = 941;
        const SHOP_SIGN = { cx: 835, cy: 431, w: 393, h: 148 };                   // 문 알림판 안쪽 (그림 px · 10-28 새 그림)
        const SHOP_SPOTS = [                                                      // [종류, 이름, x, y] 가게 그림 px (진열대마다)
            ['seal', '씰스티커', 640, 690], ['piece', '조각스티커', 850, 690], ['paper', '모조지스티커', 1060, 690],
            ['tape', '마스킹테이프', 945, 560], ['tk', '떡메모지', 922, 255], ['memo', '메모지', 760, 385],
            ['leaf', '속지', 1347, 580], ['tool', '다이어리', 290, 470],
            ['gd', '문구용품', 430, 320], ['desk', '책상소품', 1235, 330], ['bg:solid', '단색 배경지', 560, 520], ['bg:pat', '패턴 배경지', 690, 560], ['season', '🌸 계절 스티커', 1500, 765]
        ];   // 📔 다이어리 · ✂️ 문구용품 · 🪑 책상소품 = 그 코너로 · 그 밖 = 그 상품 창 ('종류:칸' = 그 칸만)
        const SHOP_ICON = { gd: '✂️', 'bg:solid': '🎨', 'bg:pat': '☁️', season: '🌸' };   // 🪑 책상소품 = basket.js stkArt('desk') 그림 (도련 11-04)
        /* 🏪 코너 (도련 11-04 : 문을 열면 스티커 코너 · 옆으로 다이어리 · 문구 · 책상소품 코너 = 현실 가게처럼 구경) : 코너 그림 위에 칸(js/basket.js shCatList)마다 아이콘 · 왼쪽 위 ‹ 스티커 코너
           그림마다 위 가운데 구름 간판 = 코너 이름 (글씨는 앱이 써요 · sign = 간판 안쪽 [가운데 x, y, 폭, 높이] 그림 px) · 자리 = 그림 px · 표에 없는 새 칸은 아래 줄에 차례로 놓고 콘솔에 알려요 */
        const SHOP_MAIN = { n: '스티커 코너', img: 'img/shop-inside.webp?v=20261009-1132', W: 1670, H: 942, sign: [846, 98, 215, 80] };
        const SHOP_CORNERS = {
            tool: { n: '다이어리 코너', img: 'img/shop-diary.webp?v=20261009-1132', W: 1670, H: 942, sign: [842, 132, 250, 100], at: { dyb: [620, 450], dyn: [965, 450], bd: [570, 615], rl: [1075, 615] } },
            gd: { n: '문구 코너', img: 'img/shop-gd.webp?v=20261009-1132', W: 1670, H: 942, sign: [848, 122, 230, 90],
                at: { pen: [430, 300], knife: [740, 300], tweez: [1000, 300], clip: [1300, 300], tape: [430, 600], scissors: [760, 600], punch: [1060, 600], ruler: [1270, 600] } },
            desk: { n: '책상소품 코너', img: 'img/shop-desk.webp?v=20261009-1132', W: 1670, H: 942, sign: [838, 118, 230, 90], at: { bookshelf: [330, 260], drawer: [630, 270], riser: [860, 265], wallshelf: [1180, 255], lamp: [1330, 245], basket: [300, 385], board: [590, 385], pencup: [880, 395], clock: [1440, 395],
                doll: [170, 500], taperack: [1555, 470], peg: [520, 140], lights: [1395, 120], wallpaper: [300, 140], desktop: [840, 635] } }   /* 🪑 소품 종류마다 (도련 11-04) */
        };
        const HOME_SIGN = { cx: 836, cy: 490, w: 420, h: 200 };                   // 🚪 내 방 문 타원 판 안쪽 (img/room-door.webp px · 도련 10-30)
        const SC = { on: false, busy: false, corner: '', spots: [] };

        function shopCover(W, H) { const s = Math.max(innerWidth / W, innerHeight / H); return { s, x: (innerWidth - W * s) / 2, y: (innerHeight - H * s) / 2 }; }
        function shopBuild() {
            let el = document.getElementById('shopScene'); if (el) return el;
            el = document.createElement('div'); el.id = 'shopScene'; el.className = 'shop-scene';
            el.innerHTML = `<div class="shop-in"><img class="shop-room" src="${SHOP_MAIN.img}" alt="" draggable="false"><div class="shop-cs"><b></b></div><div class="shop-spots"></div></div>
                <button type="button" class="shop-back" onclick="shopCorner('')">‹ 스티커 코너</button>
                <div class="shop-door"><img src="img/shop-door.webp?v=20261009-819" alt="" draggable="false"><div class="shop-sign"><b>기본상품 샵</b><small>말랑달콤</small></div></div>
                <div class="shop-home"><img src="img/room-door.webp?v=20261009-923" alt="" draggable="false"><div class="shop-sign home"><b>내 방</b></div></div>
                <button type="button" class="shop-x" onclick="deskMoveOpen()">이동</button>`;
            document.body.appendChild(el);
            addEventListener('resize', () => { if (!SC.on) return; if (!shopWide()) { shopSceneClose(true); setTimeout(() => window.openShelf && openShelf(), 400); return; } shopFit(); });   // 좁아지면 (폰 크기) 가게를 닫고 기본상품 샵 창
            return el;
        }
        function shopSpotsPaint() {
            const el = document.getElementById('shopScene'), box = el && el.querySelector('.shop-spots'); if (!box) return;
            const C = SHOP_CORNERS[SC.corner];
            if (C) {                                                                // 🏪 코너 = 칸마다 아이콘 (표에 없는 칸 = 아래 줄에 차례로)
                const cats = window.shCatList ? shCatList(SC.corner) || [] : []; let free = 0;
                SC.spots = cats.map(([c, n, ic]) => { let p = C.at[c]; if (!p) { console.warn('🏪 코너 자리가 없어요 (js/shopscene.js SHOP_CORNERS) :', SC.corner, c); p = [300 + (free++ % 6) * 215, 820]; } return [c, n, p[0], p[1], ic]; });
            } else {
                const season = typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN;
                SC.spots = SHOP_SPOTS.filter(s => s[0] !== 'season' || season).map(([k, n, x, y]) => [k, n, x, y, SHOP_ICON[k] || (window.stkArt ? stkArt(k) : '')]);
            }
            box.innerHTML = SC.spots.map(([k, n, , , ic]) => `<button type="button" class="shop-spot" data-k="${k}" onclick="shopSpot('${k}')"><i class="shop-ic">${ic}</i><b>${n}</b></button>`).join('');
            const room = el.querySelector('.shop-room'), src = (C || SHOP_MAIN).img; if (room.getAttribute('src') !== src) room.setAttribute('src', src);
            el.classList.toggle('corner', !!C); el.querySelector('.shop-cs b').textContent = (C || SHOP_MAIN).n;   // 🪧 간판 = 코너 이름
        }
        /* 🚶 코너 옮기기 ('' = 스티커 코너 · 입구) : 살짝 어두워졌다 그 코너로 */
        function shopCorner(k) {
            const el = document.getElementById('shopScene'); if (!el || !SC.on || SC.busy || (k && !SHOP_CORNERS[k]) || SC.corner === k) return;
            ['shelfKindModal', 'shelfCornerModal'].forEach(id => { const m = document.getElementById(id); if (m && m.style.display && m.style.display !== 'none') { if (window.shZoomOff) shZoomOff(); m.style.display = 'none'; } });
            const go = () => { SC.corner = k; shopSpotsPaint(); shopFit(); el.classList.remove('walk'); };
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) { go(); return; }
            el.classList.add('walk'); setTimeout(go, 260);
        }
        function shopFit() {
            const el = document.getElementById('shopScene'); if (!el) return;
            const A = SHOP_CORNERS[SC.corner] || SHOP_MAIN, R = shopCover(A.W, A.H), room = el.querySelector('.shop-room'), cs = el.querySelector('.shop-cs');
            room.style.width = A.W * R.s + 'px'; room.style.height = A.H * R.s + 'px'; room.style.left = R.x + 'px'; room.style.top = R.y + 'px';
            const [sx, sy, sw, sh] = A.sign; Object.assign(cs.style, { left: R.x + sx * R.s + 'px', top: R.y + sy * R.s + 'px', width: sw * R.s + 'px', height: sh * R.s + 'px', fontSize: Math.min(sh * .44, sw / Math.max(4, cs.textContent.length) * 1.05) * R.s + 'px' });   // 🪧 글씨가 간판 안에 들어가게
            el.querySelectorAll('.shop-spot').forEach(b => {
                const sp = SC.spots.find(s => s[0] === b.dataset.k); if (!sp) return;
                const w = b.offsetWidth || 90, h = b.offsetHeight || 60, M = 10;
                const x = Math.max(M + w / 2, Math.min(innerWidth - M - w / 2, R.x + sp[2] * R.s)), y = Math.max(M + 56 + h / 2, Math.min(innerHeight - M - h / 2, R.y + sp[3] * R.s));   // 화면 밖이면 안쪽으로 (위는 ✕ 자리 비우기)
                b.style.left = x + 'px'; b.style.top = y + 'px';
            });
            const D = shopCover(DOOR_W, DOOR_H), door = el.querySelector('.shop-door img'), sign = el.querySelector('.shop-sign');
            door.style.width = DOOR_W * D.s + 'px'; door.style.height = DOOR_H * D.s + 'px'; door.style.left = D.x + 'px'; door.style.top = D.y + 'px';
            sign.style.left = (D.x + SHOP_SIGN.cx * D.s) + 'px'; sign.style.top = (D.y + SHOP_SIGN.cy * D.s) + 'px';
            sign.style.width = SHOP_SIGN.w * D.s + 'px'; sign.style.height = SHOP_SIGN.h * D.s + 'px'; sign.style.fontSize = (SHOP_SIGN.h * D.s * .34) + 'px';   // '기본상품 샵' 다섯 글자가 판 안에 넉넉히 (도련 10-28)
            homeFit(el);
            el.querySelector('.shop-door').style.transformOrigin = `${D.x + SHOP_SIGN.cx * D.s}px ${D.y + 560 * D.s}px`;   // 문 손잡이 쪽으로 다가가요
        }
        function homeFit(el) {                                                  // 🚪 내 방 문 (가게 · 다른 장소에서 돌아올 때 같은 문 · roomGo)
            const D = shopCover(DOOR_W, DOOR_H), hm = el.querySelector('.shop-home img'), hs = el.querySelector('.shop-sign.home');
            hm.style.width = DOOR_W * D.s + 'px'; hm.style.height = DOOR_H * D.s + 'px'; hm.style.left = D.x + 'px'; hm.style.top = D.y + 'px';
            hs.style.left = (D.x + HOME_SIGN.cx * D.s) + 'px'; hs.style.top = (D.y + HOME_SIGN.cy * D.s) + 'px'; hs.style.width = HOME_SIGN.w * D.s + 'px'; hs.style.height = HOME_SIGN.h * D.s + 'px'; hs.style.fontSize = (HOME_SIGN.h * D.s * .36) + 'px';
            el.querySelector('.shop-home').style.transformOrigin = `${D.x + HOME_SIGN.cx * D.s}px ${D.y + 600 * D.s}px`;
        }
        /* 🚪 다른 장소 → 내 방 (도련 10-31 : 장소를 옮기는 느낌 · 📅 달력 … 어디서든 가게에서 돌아올 때와 같은 연출)
           내 방 문이 그 장소 위로 스르르 → (문 뒤에서 그 장소를 닫아요 = leave) → 문 쪽으로 다가가며 연핑크 → 책상 */
        let roomBusy = false;
        function roomGo(leave) {
            if (roomBusy) return;
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) { leave(); return; }
            let el = document.getElementById('roomGo');
            if (!el) { el = document.createElement('div'); el.id = 'roomGo'; el.className = 'shop-scene room-go'; el.innerHTML = `<div class="shop-home"><img src="img/room-door.webp?v=20261009-923" alt="" draggable="false"><div class="shop-sign home"><b>내 방</b></div></div>`; document.body.appendChild(el); }
            roomBusy = true; homeFit(el);
            el.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('home')));
            setTimeout(leave, 550);
            setTimeout(() => el.classList.add('home-go'), 1000);
            setTimeout(() => { el.classList.add('leave'); setTimeout(() => { el.classList.remove('on', 'home', 'home-go', 'leave'); roomBusy = false; }, 380); }, 2300);
        }
        window.roomGo = roomGo;
        /* 🚪 → 🩷 → 🏪 */
        const shopWide = () => document.documentElement.classList.contains('desk-on');
        function shopSceneOpen() {
            if (!shopWide()) { if (window.openShelf) openShelf(); return; }        // 📱 폰 · 하단 메뉴 화면 = 예전 기본상품 샵 창
            if (SC.on || SC.busy) return;
            const el = shopBuild(); SC.corner = ''; shopSpotsPaint();
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'flex' || m.style.display === 'block') { const x = m.querySelector('.mt-x'); if (x) x.click(); else m.style.display = 'none'; } });
            SC.on = true; SC.busy = true;
            el.classList.remove('inside', 'enter', 'leave'); el.classList.add('on');
            requestAnimationFrame(() => { shopFit(); requestAnimationFrame(shopFit); });
            const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
            /* 🔔 문 열며 딸랑~ (✨ 연출 소리를 끄면 안 나요 · js/sound.js sndShopBell) */
            const go = () => { if (window.sndShopBell) sndShopBell(); el.classList.add('enter'); setTimeout(() => { el.classList.add('inside'); el.classList.remove('enter'); SC.busy = false; shopFit(); }, quiet ? 0 : 1700); };
            const img = el.querySelector('.shop-door img');
            const start = () => setTimeout(go, quiet ? 0 : 700);                   // 문을 잠깐 보여 주고
            if (img.complete) start(); else img.addEventListener('load', start, { once: true });
        }
        /* 🏪 → 🚪 내 방 문 → 🪑 책상 (도련 10-30) : 문이 스르르 나타나 잠깐 → 문 쪽으로 다가가며 연핑크 → 책상 · quick = 바로 (보관함으로 · 화면이 좁아질 때) */
        function shopSceneClose(quick) {
            const el = document.getElementById('shopScene'); if (!el || !SC.on || (SC.busy && !quick)) return;
            if (quick !== true && window.bagBusy && bagBusy()) { const al = document.getElementById('customAlertModal'); if (window.showMsg && !(al && al.style.display === 'flex')) { const ok = document.getElementById('customAlertConfirmBtn'); if (ok) ok.textContent = '확인'; showMsg('🛍️ 상품을 담는 중이에요'); } return; }   // 받는 중 · 봉투 안내가 끝나기 전에는 못 나가요 (도련 10-30) · 묻는 창(하나 더 받기)이 떠 있으면 그 창을 덮지 않고 · 안내 버튼은 늘 '확인'
            ['shelfKindModal', 'shelfCornerModal', 'shelfModal'].forEach(id => { const m = document.getElementById(id); if (m && m.style.display !== 'none' && m.style.display) { if (window.shZoomOff) shZoomOff(); m.style.display = 'none'; } });
            const done = () => { el.classList.remove('on', 'inside', 'enter', 'leave', 'home', 'home-go'); SC.on = false; SC.busy = false; const L = window.SHOP_BAG || []; window.SHOP_BAG = []; if (L.length && window.deskBagAdd) setTimeout(() => deskBagAdd(L), 250); };   // 🛍️ 산 것을 봉투에 담아 책상 위에 (js/desk.js)
            if (quick === true || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('leave'); setTimeout(done, 380); return; }
            SC.busy = true; shopFit(); el.classList.add('home');
            setTimeout(() => el.classList.add('home-go'), 1000);
            setTimeout(() => { el.classList.add('leave'); setTimeout(done, 380); }, 2300);
        }
        function shopSpot(k) {
            if (SC.busy || !window.shOpenKind) return;
            if (SC.corner) { shOpenKind(SC.corner, k); return; }                  // 코너 안 = 그 칸만 보이는 창
            if (SHOP_CORNERS[k]) { shopCorner(k); return; }                      // 📔 ✂️ 🪑 = 그 코너로
            const [kk, c] = k.split(':'); shOpenKind(kk, c);
        }
        const shopSceneOn = () => SC.on;
        document.addEventListener('keydown', e => { if (SC.on && e.key === 'Escape' && !document.querySelector('.modal[style*="flex"], .modal[style*="block"]')) { if (SC.corner) shopCorner(''); else shopSceneClose(); } });   // 코너 안 = 스티커 코너로
        window.shopSceneOpen = shopSceneOpen; window.shopSceneClose = shopSceneClose; window.shopSpot = shopSpot; window.shopSceneOn = shopSceneOn; window.shopCorner = shopCorner;
