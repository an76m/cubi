/* 말랑달콤 다이어리 - js/shopscene.js
   🏪 기본상품 샵 가게 (도련 10-27 · 🪑 책상 화면에서 🏪 기본상품 샵 소품을 누르면)
   - 분홍 문(img/shop-door.webp · 알림판에 '기본상품 샵') 이 화면을 채우고 → 🔔 딸랑~ (설정 ✨ 연출 소리) · 로그인 화면처럼 문 쪽으로 다가가며 연핑크 빛 → 가게 안(img/shop-inside.webp)
   - 가게 안 진열대마다 이름표 = 기본상품 샵 메뉴 (씰 · 조각 · 모조지 · 마테 · 떡메 · 속지 · 이모지 · 메모지 · 정리 도구 · 문구 · 책상 소품 · 🌸 계절은 이벤트 때만)
       톡 = 그 상품을 고르는 창 (js/basket.js shOpenKind) · 창의 '‹ 기본상품 샵' = 창만 닫고 가게 안 그대로
   - 그림은 화면을 꽉 채우고(cover) · 이름표 자리는 그림 픽셀 기준 → 화면 자리로 · 화면 밖으로 잘리면 안쪽으로 당겨요
   - ✕ (오른쪽 위) = 책상으로 · ▤ 하단 메뉴 화면에서는 예전처럼 기본상품 샵 창 (js/basket.js openShelf)
   - 💻 PC · 아이패드만 (도련 10-27 · html.desk-on = 화면 짧은 쪽 600px 이상 + 🪑 책상 화면) · 📱 폰 · 하단 메뉴 화면은 늘 예전 기본상품 샵 창 · 가게 안에서 화면이 좁아지면 가게를 닫고 기본상품 샵 창으로 */

        const SHOP_W = 1672, SHOP_H = 941, DOOR_W = 1672, DOOR_H = 941;
        const SHOP_SIGN = { cx: 835, cy: 431, w: 393, h: 148 };                   // 문 알림판 안쪽 (그림 px · 10-28 새 그림)
        const SHOP_SPOTS = [                                                      // [종류, 이름, x, y] 가게 그림 px (진열대마다)
            ['seal', '씰스티커', 640, 690], ['piece', '조각스티커', 850, 690], ['paper', '모조지스티커', 1060, 690],
            ['tape', '마스킹테이프', 945, 560], ['tk', '떡메모지', 922, 255], ['memo', '메모지', 760, 385],
            ['emoji', '이모지', 430, 320], ['leaf', '속지', 1347, 580], ['tool', '다이어리', 290, 470],
            ['gd', '문구', 1575, 250], ['desk', '책상 소품', 1300, 330], ['bg', '배경지', 625, 540], ['season', '🌸 계절 스티커', 1500, 765]
        ];
        const SHOP_ICON = { gd: '✂️', desk: '🪑', bg: '🌈', season: '🌸' };
        const SC = { on: false, busy: false };

        function shopCover(W, H) { const s = Math.max(innerWidth / W, innerHeight / H); return { s, x: (innerWidth - W * s) / 2, y: (innerHeight - H * s) / 2 }; }
        function shopBuild() {
            let el = document.getElementById('shopScene'); if (el) return el;
            el = document.createElement('div'); el.id = 'shopScene'; el.className = 'shop-scene';
            el.innerHTML = `<div class="shop-in"><img class="shop-room" src="img/shop-inside.webp?v=20261009-815" alt="" draggable="false"><div class="shop-spots"></div></div>
                <div class="shop-door"><img src="img/shop-door.webp?v=20261009-819" alt="" draggable="false"><div class="shop-sign"><b>기본상품 샵</b><small>말랑달콤</small></div></div>
                <button type="button" class="shop-x" aria-label="책상으로" onclick="shopSceneClose()">✕</button>`;
            document.body.appendChild(el);
            addEventListener('resize', () => { if (!SC.on) return; if (!shopWide()) { shopSceneClose(); setTimeout(() => window.openShelf && openShelf(), 400); return; } shopFit(); });   // 좁아지면 (폰 크기) 가게를 닫고 기본상품 샵 창
            return el;
        }
        function shopSpotsPaint() {
            const box = document.querySelector('#shopScene .shop-spots'); if (!box) return;
            const season = typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN && typeof SEASON_STICKERS !== 'undefined';
            box.innerHTML = SHOP_SPOTS.filter(s => s[0] !== 'season' || season).map(([k, n]) => `<button type="button" class="shop-spot" data-k="${k}" onclick="shopSpot('${k}')"><i class="shop-ic">${SHOP_ICON[k] || (window.stkArt ? stkArt(k) : '')}</i><b>${n}</b></button>`).join('');
        }
        function shopFit() {
            const el = document.getElementById('shopScene'); if (!el) return;
            const R = shopCover(SHOP_W, SHOP_H), room = el.querySelector('.shop-room');
            room.style.width = SHOP_W * R.s + 'px'; room.style.height = SHOP_H * R.s + 'px'; room.style.left = R.x + 'px'; room.style.top = R.y + 'px';
            el.querySelectorAll('.shop-spot').forEach(b => {
                const sp = SHOP_SPOTS.find(s => s[0] === b.dataset.k); if (!sp) return;
                const w = b.offsetWidth || 90, h = b.offsetHeight || 60, M = 10;
                const x = Math.max(M + w / 2, Math.min(innerWidth - M - w / 2, R.x + sp[2] * R.s)), y = Math.max(M + 56 + h / 2, Math.min(innerHeight - M - h / 2, R.y + sp[3] * R.s));   // 화면 밖이면 안쪽으로 (위는 ✕ 자리 비우기)
                b.style.left = x + 'px'; b.style.top = y + 'px';
            });
            const D = shopCover(DOOR_W, DOOR_H), door = el.querySelector('.shop-door img'), sign = el.querySelector('.shop-sign');
            door.style.width = DOOR_W * D.s + 'px'; door.style.height = DOOR_H * D.s + 'px'; door.style.left = D.x + 'px'; door.style.top = D.y + 'px';
            sign.style.left = (D.x + SHOP_SIGN.cx * D.s) + 'px'; sign.style.top = (D.y + SHOP_SIGN.cy * D.s) + 'px';
            sign.style.width = SHOP_SIGN.w * D.s + 'px'; sign.style.height = SHOP_SIGN.h * D.s + 'px'; sign.style.fontSize = (SHOP_SIGN.h * D.s * .34) + 'px';   // '기본상품 샵' 다섯 글자가 판 안에 넉넉히 (도련 10-28)
            el.querySelector('.shop-door').style.transformOrigin = `${D.x + SHOP_SIGN.cx * D.s}px ${D.y + 560 * D.s}px`;   // 문 손잡이 쪽으로 다가가요
        }
        /* 🚪 → 🩷 → 🏪 */
        const shopWide = () => document.documentElement.classList.contains('desk-on');
        function shopSceneOpen() {
            if (!shopWide()) { if (window.openShelf) openShelf(); return; }        // 📱 폰 · 하단 메뉴 화면 = 예전 기본상품 샵 창
            if (SC.on || SC.busy) return;
            const el = shopBuild(); shopSpotsPaint();
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
        function shopSceneClose() {
            const el = document.getElementById('shopScene'); if (!el || !SC.on) return;
            ['shelfKindModal', 'shelfModal'].forEach(id => { const m = document.getElementById(id); if (m && m.style.display !== 'none' && m.style.display) { if (window.shZoomOff) shZoomOff(); m.style.display = 'none'; } });
            el.classList.add('leave');
            setTimeout(() => { el.classList.remove('on', 'inside', 'enter', 'leave'); SC.on = false; SC.busy = false; }, 380);
        }
        function shopSpot(k) { if (SC.busy) return; if (window.shOpenKind) shOpenKind(k); }
        const shopSceneOn = () => SC.on;
        document.addEventListener('keydown', e => { if (SC.on && e.key === 'Escape' && !document.querySelector('.modal[style*="flex"], .modal[style*="block"]')) shopSceneClose(); });
        window.shopSceneOpen = shopSceneOpen; window.shopSceneClose = shopSceneClose; window.shopSpot = shopSpot; window.shopSceneOn = shopSceneOn;
