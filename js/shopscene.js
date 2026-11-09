/* 말랑달콤 다이어리 - js/shopscene.js
   🏪 기본상품 샵 가게 (도련 10-27 · 🪑 책상 화면에서 🏪 기본상품 샵 소품을 누르면)
   - 분홍 문(img/shop-door.webp · 알림판에 '기본상품 샵') 이 화면을 채우고 → 🔔 딸랑~ (설정 ✨ 연출 소리) · 로그인 화면처럼 문 쪽으로 다가가며 연핑크 빛 → 가게 안(img/shop-inside.webp)
   - 가게 안 진열대마다 이름표 = 기본상품 샵 메뉴 (씰 · 조각 · 모조지 · 마테 · 떡메 · 속지 · 이모지 · 메모지 · 정리 도구 · 문구 · 책상 소품 · 🌸 계절은 이벤트 때만)
       톡 = 그 상품을 고르는 창 (js/basket.js shOpenKind) · 창의 '‹ 기본상품 샵' = 창만 닫고 가게 안 그대로
   - 그림은 화면을 꽉 채우고(cover) · 이름표 자리는 그림 픽셀 기준 → 화면 자리로 · 화면 밖으로 잘리면 안쪽으로 당겨요
   - 🚪 이동 (오른쪽 위 · 도련 10-31) → 이동 창 (js/desk.js deskMoveOpen) 의 🚪 내 방 = 내 방 문(img/room-door.webp)을 지나 책상으로 (도련 10-30) · ▤ 하단 메뉴 화면도 같은 가게 (예전 기본상품 샵 창 영구 삭제 · 도련 11-10)
   - 💻 PC · 아이패드만 (도련 10-27 · html.desk-on = 화면 짧은 쪽 600px 이상 + 🪑 책상 화면) · 📱 폰 · 하단 메뉴 화면은 늘 예전 기본상품 샵 창 · 가게 안에서 화면이 좁아지면 가게를 닫고 기본상품 샵 창으로 */

        const DOOR_W = 1672, DOOR_H = 941;
        const SHOP_SIGN = { cx: 835, cy: 431, w: 393, h: 148 };                   // 문 알림판 안쪽 (그림 px · 10-28 새 그림)
        /* 🏪 코너 그림 · 간판 · 아이콘 자리 = 서버 상품 '샵' (상품공방 🏪 샵 배치 · 도련 11-04 : 코너가 늘거나 종류가 늘어도 코드를 고치지 않게)
           P.구역 = stk(입구 · 스티커) · tool · gd · desk · P.간판 = [가운데 x, y, 폭, 높이] · P.자리 = { 열쇠: [x, y] } · P.길 = { 구역: [x, y, l|r] } (입구의 다른 구역 가는 팻말) · 모두 그림 px
           구역 하나라도 없거나 모자라면 = 가게를 열지 않아요 (빈 값을 짐작하지 않아요 · 기본상품 샵 창으로) */
        const SHOP_CN = ['stk', 'tool', 'gd', 'desk'];
        const SHOP_STK = [['seal', '씰스티커'], ['piece', '조각스티커'], ['paper', '모조지스티커'], ['tape', '마스킹테이프'], ['tk', '떡메모지'], ['memo', '메모지'], ['leaf', '속지'], ['season', '🌸 계절 스티커']];   // 🏷️ 입구 = 스티커 종류 (앱이 아는 종류 · 🌸 계절은 이벤트 때만 · 🌈 배경지는 가게에 안 나와요)
        const SHOP_ICON = { season: '🌸' };
        const SHOP_WAY_IC = {};                                                   // 🪧 팻말 아이콘 = basket.js stkArt('tool' · 'gd' · 'desk') 손그림 (도련 11-07 · 이모지 대신)
        let SHOP_D = null;
        function shopData() {
            if (SHOP_D) return SHOP_D;
            const ok = x => { const P = x.P, wh = x.wh.디자인; return SHOP_CN.includes(P.구역) && x.u.디자인 && Array.isArray(wh) && wh[0] > 0 && wh[1] > 0 && String(P.이름 || '') && Array.isArray(P.간판) && P.간판.length === 4 && P.간판.every(v => isFinite(+v)) && P.자리 && typeof P.자리 === 'object'; };
            const L = (window.prodShelf ? prodShelf('샵') : []), D = {}, DP = {};   // 📱 화면 = '폰' 인 샵 상품 = 폰 그림 · 간판 (도련 11-10 · 상품공방에 올려요 · 깃허브 아니에요)
            L.forEach(x => { if (!ok(x)) { console.warn('🏪 샵 구역 속성이 모자라요 (상품공방 샵) :', x.id); return; } const T = x.P.화면 === '폰' ? DP : D; if (!T[x.P.구역]) T[x.P.구역] = { n: x.P.이름, img: x.u.디자인, W: x.wh.디자인[0], H: x.wh.디자인[1], sign: x.P.간판.map(Number), at: x.P.자리, ways: x.P.길 && typeof x.P.길 === 'object' ? x.P.길 : {} }; });
            const miss = SHOP_CN.filter(c => !D[c]); if (miss.length) { console.warn('🏪 샵 구역이 없어요 (상품공방 샵) :', miss.join(' · ')); return null; }
            const pm = SHOP_CN.filter(c => !DP[c]); if (pm.length) console.warn('🏪 📱 폰 샵 구역이 없어요 (상품공방 샵 · 화면 = 폰) → 폰은 기본상품 샵 창 :', pm.join(' · '));
            D[' ph'] = pm.length ? null : DP;
            return (SHOP_D = D);
        }
        /* 📱 폰 가게 (도련 11-10 · 세로 그림 941 × 1672) : 입구 문 → 스티커 코너(입구) · 다이어리 · 문구 · 책상소품 · 코너 이름 · 칸 · 팻말은 서버(상품공방 샵) 그대로
           그림 · 간판 자리만 폰 것 (상품공방 '샵' 상품 · 화면 = 📱 폰 · 구역마다 하나 · 넷이 다 있어야 열려요 · 모자라면 예전 기본상품 샵 창) · 이름표는 그림 자리 대신 아래 상자에 줄 바꿈 (폰은 좁아서 15칸이 겹쳐요) · 산 것은 🛍️ 봉투 없이 바로 서랍 (폰은 책상이 없어요 · shopBagOn) */
        const SHOP_PH = { W: 941, H: 1672, v: '?v=20261009-1047',                // 📱 문만 앱 그림 (💻 문처럼 · 코너 그림 · 간판은 상품공방 샵 '화면 = 폰' · 1048 도련)
            door: { img: 'img/shop-door-m.webp', sign: [472, 750, 320, 140], go: [472, 970] } };
        const shopPhone = () => document.documentElement.classList.contains('is-phone');   // 📱 폰 = 세로 가게 (💻 📲 = 책상이든 하단 메뉴든 가로 가게 · 도련 11-10)
        const shopC = c => { const A = shopData() || {}, D = A[c || 'stk']; if (!D || !SC.ph) return D; const P = (A[' ph'] || {})[c || 'stk']; return P ? Object.assign({}, D, { img: P.img, W: P.W, H: P.H, sign: P.sign }) : D; };   // 📱 이름 · 칸 · 팻말 = 💻 것 · 그림 · 간판 = 폰 것
        /* 🖼 구역 그림 미리 받기 (도련 11-04 : 처음 걸어갈 때 그림이 늦게 떠서 이름만 먼저 바뀌었어요) : 가게에 들어갈 때 모두 받아 두고 · 옮길 땐 그 그림이 준비된 뒤에 바꿔요 */
        const SHOP_PIC = new Map();
        function shopPic(src) {
            if (!SHOP_PIC.has(src)) { const im = new Image(); im.src = src; SHOP_PIC.set(src, (im.decode ? im.decode() : Promise.resolve()).catch(() => {})); }
            return SHOP_PIC.get(src);
        }
        const shopPicAll = () => { if (shopData()) SHOP_CN.forEach(c => shopPic(shopC(c).img)); };
        const HOME_SIGN = { cx: 836, cy: 490, w: 420, h: 200 };                   // 🚪 내 방 문 타원 판 안쪽 (img/room-door.webp px · 도련 10-30)
        const SC = { on: false, busy: false, corner: '', spots: [], ph: false, bag: false };

        function shopCover(W, H) { const s = Math.max(innerWidth / W, innerHeight / H); return { s, x: (innerWidth - W * s) / 2, y: (innerHeight - H * s) / 2 }; }
        function shopBuild() {
            let el = document.getElementById('shopScene'); if (el) return el;
            el = document.createElement('div'); el.id = 'shopScene'; el.className = 'shop-scene';
            el.innerHTML = `<div class="shop-in"><img class="shop-room" src="${shopC('').img}" alt="" draggable="false"><div class="shop-cs"><b></b></div><div class="shop-spots"></div></div>
                <button type="button" class="shop-back" onclick="shopCorner('')">‹ ${htmlEsc(shopC('').n)}</button>
                <div class="shop-door"><img src="img/shop-door.webp?v=20261009-819" alt="" draggable="false"><div class="shop-sign"><b>기본상품 샵</b><small>말랑달콤</small></div></div>
                <div class="shop-home"><img src="img/room-door.webp?v=20261009-923" alt="" draggable="false"><div class="shop-sign home"><b>내 방</b></div></div>
                <button type="button" class="shop-x" onclick="deskMoveOpen()">이동</button>`;
            document.body.appendChild(el);
            addEventListener('resize', () => { if (!SC.on) return; if (SC.ph !== shopPhone()) { shopSceneClose(true); return; } shopFit(); });   // 폰 ↔ 넓은 화면이 바뀌면 가게를 닫아요
            return el;
        }
        function shopSpotsPaint() {
            const el = document.getElementById('shopScene'), box = el && el.querySelector('.shop-spots'); if (!box) return;
            const C = SC.corner ? shopC(SC.corner) : null, M = shopC('');
            if (C) {                                                                // 🏪 코너 = 칸마다 아이콘 (표에 없는 칸 = 아래 줄에 차례로)
                const cats = window.shCatList ? shCatList(SC.corner) || [] : []; let free = 0;
                SC.spots = cats.map(([c, n, ic]) => { let p = C.at[c]; if (!p) { console.warn('🏪 구역 아이콘 자리가 없어요 (상품공방 샵 배치) :', SC.corner, c); p = [300 + (free++ % 6) * 215, 820]; } return [c, n, p[0], p[1], ic]; });
            } else {
                const season = typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN;
                let free = 0; const at = k => { const p = M.at[k]; if (Array.isArray(p)) return p; console.warn('🏪 입구 자리가 없어요 (상품공방 샵 배치) :', k); return [300 + (free++ % 6) * 215, 820]; };
                SC.spots = SHOP_STK.filter(s => s[0] !== 'season' || season).map(([k, n]) => [k, n, ...at(k), SHOP_ICON[k] || (window.stkArt ? stkArt(k) : '')])
                    .concat(SHOP_CN.filter(c => c !== 'stk' && Array.isArray(M.ways[c])).map(c => { const [x, y, d] = M.ways[c]; return [c, shopC(c).n, x, y, SHOP_WAY_IC[c] || (window.stkArt ? stkArt(c) : ''), d === 'r' ? 'r' : 'l']; }));   // 🪧 다른 구역 가는 팻말 (이름 = 그 구역 이름 · '코너' 말 안 써요 · 도련 11-04)
            }
            box.innerHTML = SC.spots.map(([k, n, , , ic, d]) => d
                ? `<button type="button" class="shop-spot shop-way ${d}" data-k="${k}" onclick="shopSpot('${k}')"><span class="sw-board">${d === 'l' ? '<i class="sw-ar">◀</i>' : ''}<i class="shop-ic">${ic}</i><b>${n}</b>${d === 'r' ? '<i class="sw-ar">▶</i>' : ''}</span><i class="sw-pole"></i></button>`   // 🪧 코너 팻말
                : `<button type="button" class="shop-spot" data-k="${k}" onclick="shopSpot('${k}')"><i class="shop-ic">${ic}</i><b>${n}</b></button>`).join('');
            const room = el.querySelector('.shop-room'), src = (C || M).img; if (room.getAttribute('src') !== src) room.setAttribute('src', src);
            el.classList.toggle('corner', !!C); el.querySelector('.shop-cs b').textContent = (C || M).n;   // 🪧 간판 = 코너 이름
        }
        /* 🚶 코너 옮기기 ('' = 스티커 코너 · 입구 · 도련 11-04 연출) : 팻말 화살표 쪽으로 걸어가요 = 지금 코너가 반대쪽으로 밀려나며 흐려지고 → 새 코너가 그쪽에서 들어와요 (돌아올 땐 거꾸로) */
        const shopWayDir = k => { const w = shopC('').ways[k]; return Array.isArray(w) && w[2] === 'r' ? 'r' : 'l'; };   // 그 코너가 입구의 어느 쪽인지
        function shopCorner(k) {
            const el = document.getElementById('shopScene'); if (!el || !SC.on || SC.busy || (k && (k === 'stk' || !shopC(k))) || SC.corner === k) return;
            ['shelfKindModal', 'shelfCornerModal'].forEach(id => { const m = document.getElementById(id); if (m && m.style.display && m.style.display !== 'none') { if (window.shZoomOff) shZoomOff(); m.style.display = 'none'; } });
            const go = () => { SC.corner = k; shopSpotsPaint(); shopFit(); };
            const pic = Promise.race([shopPic(shopC(k).img), new Promise(r => setTimeout(r, 4000))]);   // 그림이 준비되면 (늦어도 4초)
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) { SC.busy = true; pic.then(() => { SC.busy = false; go(); }); return; }
            const d = shopWayDir(k || SC.corner), toL = k ? d === 'l' : d !== 'l';   // 왼쪽 코너로 = 화면이 오른쪽으로 밀려요 (내가 왼쪽으로 걸어가니까)
            SC.busy = true; el.classList.remove('walk-in', 'from-l', 'from-r'); el.classList.add('walk-out', toL ? 'to-r' : 'to-l');
            Promise.all([pic, new Promise(r => setTimeout(r, 360))]).then(() => {
                go(); el.classList.remove('walk-out', 'to-l', 'to-r'); el.classList.add('walk-in', toL ? 'from-l' : 'from-r');
                requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('walk-on')));
                setTimeout(() => { el.classList.remove('walk-in', 'walk-on', 'from-l', 'from-r'); SC.busy = false; }, 420);
            });
        }
        function shopFit() {
            const el = document.getElementById('shopScene'); if (!el) return;
            const A = shopC(SC.corner), R = shopCover(A.W, A.H), room = el.querySelector('.shop-room'), cs = el.querySelector('.shop-cs');
            room.style.width = A.W * R.s + 'px'; room.style.height = A.H * R.s + 'px'; room.style.left = R.x + 'px'; room.style.top = R.y + 'px';
            const [sx, sy, sw, sh] = A.sign; Object.assign(cs.style, { left: R.x + sx * R.s + 'px', top: R.y + sy * R.s + 'px', width: sw * R.s + 'px', height: sh * R.s + 'px', fontSize: Math.min(sh * .44, sw / Math.max(4, cs.textContent.length) * 1.05) * R.s + 'px' });   // 🪧 글씨가 간판 안에 들어가게
            el.querySelectorAll('.shop-spot').forEach(b => {
                const sp = SC.spots.find(s => s[0] === b.dataset.k); if (!sp) return;
                const w = b.offsetWidth || 90, h = b.offsetHeight || 60, M = 10;
                if (SC.ph) { b.style.left = b.style.top = ''; return; }          // 📱 아래 상자에 줄 바꿈 (css .shop-scene.ph)
                const x = Math.max(M + w / 2, Math.min(innerWidth - M - w / 2, R.x + sp[2] * R.s)), y = Math.max(M + 56 + h / 2, Math.min(innerHeight - M - h / 2, R.y + sp[3] * R.s));   // 화면 밖이면 안쪽으로 (위는 ✕ 자리 비우기)
                b.style.left = x + 'px'; b.style.top = y + 'px';
            });
            const ph = SC.ph, DW = ph ? SHOP_PH.W : DOOR_W, DH = ph ? SHOP_PH.H : DOOR_H, S = ph ? { cx: SHOP_PH.door.sign[0], cy: SHOP_PH.door.sign[1], w: SHOP_PH.door.sign[2], h: SHOP_PH.door.sign[3] } : SHOP_SIGN;   // 📱 세로 문
            const D = shopCover(DW, DH), door = el.querySelector('.shop-door img'), sign = el.querySelector('.shop-sign');
            door.style.width = DW * D.s + 'px'; door.style.height = DH * D.s + 'px'; door.style.left = D.x + 'px'; door.style.top = D.y + 'px';
            sign.style.left = (D.x + S.cx * D.s) + 'px'; sign.style.top = (D.y + S.cy * D.s) + 'px';
            sign.style.width = S.w * D.s + 'px'; sign.style.height = S.h * D.s + 'px'; sign.style.fontSize = (S.h * D.s * (ph ? .3 : .34)) + 'px';   // '기본상품 샵' 다섯 글자가 판 안에 넉넉히 (도련 10-28)
            homeFit(el);
            el.querySelector('.shop-door').style.transformOrigin = ph ? `${D.x + SHOP_PH.door.go[0] * D.s}px ${D.y + SHOP_PH.door.go[1] * D.s}px` : `${D.x + SHOP_SIGN.cx * D.s}px ${D.y + 560 * D.s}px`;   // 문 손잡이 쪽으로 다가가요
        }
        /* 📱 폰 = 다이어리 문 (도련 11-10 · img/room-door-m.webp 941 × 1672 · 타원 판에 '다이어리' · 폰은 내 방이 없어요 → 하단 메뉴 넷이 있는 다이어리로) */
        const HOME_PH = { W: 941, H: 1672, img: 'img/room-door-m.webp?v=20261009-1048', sign: { cx: 465, cy: 622, w: 420, h: 220 }, go: 880 };
        const homePh = () => !document.documentElement.classList.contains('desk-on') && document.documentElement.classList.contains('is-phone');
        function homeFit(el) {                                                  // 🚪 내 방 문 (가게 · 다른 장소에서 돌아올 때 같은 문 · roomGo)
            const ph = homePh(), W = ph ? HOME_PH.W : DOOR_W, H = ph ? HOME_PH.H : DOOR_H, S = ph ? HOME_PH.sign : HOME_SIGN;
            const D = shopCover(W, H), hm = el.querySelector('.shop-home img'), hs = el.querySelector('.shop-sign.home');
            const src = ph ? HOME_PH.img : 'img/room-door.webp?v=20261009-923'; if (hm.getAttribute('src') !== src) hm.setAttribute('src', src);
            hs.querySelector('b').textContent = document.documentElement.classList.contains('desk-on') ? '내 방' : '다이어리';   // ▤ 하단 메뉴 화면(📱 · 💻 📲) = 다이어리로
            hm.style.width = W * D.s + 'px'; hm.style.height = H * D.s + 'px'; hm.style.left = D.x + 'px'; hm.style.top = D.y + 'px';
            hs.style.left = (D.x + S.cx * D.s) + 'px'; hs.style.top = (D.y + S.cy * D.s) + 'px'; hs.style.width = S.w * D.s + 'px'; hs.style.height = S.h * D.s + 'px'; hs.style.fontSize = (S.h * D.s * (ph ? .4 : .36)) + 'px';
            el.querySelector('.shop-home').style.transformOrigin = `${D.x + S.cx * D.s}px ${D.y + (ph ? HOME_PH.go : 600) * D.s}px`;
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
            if (!shopData() || (shopPhone() && !shopData()[' ph'])) { if (window.showMsg) showMsg('🏪 기본상품 샵을 준비하는 중이에요<br>잠시 뒤에 다시 와 주세요'); return; }   // 🏪 샵 코너가 없으면 (예전 기본상품 샵 창은 영구 삭제 · 도련 11-10)
            if (SC.on || SC.busy) return;
            SC.ph = shopPhone(); SC.bag = shopWide();   // 🛍️ 봉투 = 💻 📲 책상에서만 (하단 메뉴 · 📱 = 바로 서랍)
            const el = shopBuild(); el.classList.toggle('ph', SC.ph);
            { const di = el.querySelector('.shop-door img'), src = SC.ph ? SHOP_PH.door.img + SHOP_PH.v : 'img/shop-door.webp?v=20261009-819'; if (di.getAttribute('src') !== src) di.setAttribute('src', src); }
            SC.corner = ''; shopSpotsPaint(); shopPicAll();   // 🖼 구역 그림 미리
            document.querySelectorAll('.modal').forEach(m => { if (m.style.display === 'flex' || m.style.display === 'block') { const x = m.querySelector('.mt-x'); if (x) x.click(); else m.style.display = 'none'; } });
            if (window.dsClear) dsClear();                                       // 🧺 꺼내 둔 스티커는 바구니로 정리 (도련 11-05)
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
            ['shelfKindModal', 'shelfCornerModal'].forEach(id => { const m = document.getElementById(id); if (m && m.style.display !== 'none' && m.style.display) { if (window.shZoomOff) shZoomOff(); m.style.display = 'none'; } });
            const done = () => { el.classList.remove('on', 'inside', 'enter', 'leave', 'home', 'home-go'); SC.on = false; SC.busy = false; const L = window.SHOP_BAG || []; window.SHOP_BAG = []; if (L.length && window.deskBagAdd) setTimeout(() => deskBagAdd(L), 250); };   // 🛍️ 산 것을 봉투에 담아 책상 위에 (js/desk.js)
            if (quick === true || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('leave'); setTimeout(done, 380); return; }
            SC.busy = true; shopFit(); el.classList.add('home');
            setTimeout(() => el.classList.add('home-go'), 1000);
            setTimeout(() => { el.classList.add('leave'); setTimeout(done, 380); }, 2300);
        }
        function shopSpot(k) {
            if (SC.busy || !window.shOpenKind) return;
            if (SC.corner) { shOpenKind(SC.corner, k); return; }                  // 코너 안 = 그 칸만 보이는 창
            if (k !== 'stk' && shopC(k)) { shopCorner(k); return; }                      // 📔 ✂️ 🪑 = 그 코너로
            const [kk, c] = k.split(':'); shOpenKind(kk, c);
        }
        const shopSceneOn = () => SC.on;
        window.shopBagOn = () => SC.on && SC.bag;                               // 🛍️ 산 것 = 봉투 (💻 📲 책상 · 📱 폰은 바로 서랍)
        document.addEventListener('keydown', e => { if (SC.on && e.key === 'Escape' && !document.querySelector('.modal[style*="flex"], .modal[style*="block"]')) { if (SC.corner) shopCorner(''); else shopSceneClose(); } });   // 코너 안 = 스티커 코너로
        window.shopSceneOpen = shopSceneOpen; window.shopSceneClose = shopSceneClose; window.shopSpot = shopSpot; window.shopSceneOn = shopSceneOn; window.shopCorner = shopCorner;
