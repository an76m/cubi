/* 말랑달콤 다이어리 - js/elements.js
   스티커/글/이미지 추가 · 라이브러리 · 요소 이동/회전/크기 · 페이지 내용 저장(saveData)/불러오기
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        function addText() {
            const el = document.createElement('div');
            el.className = 'element-box';
            el.style.width = '160px';
            el.style.height = '80px';
            const ta = document.createElement('textarea');
            ta.placeholder = '글을 입력하세요...';
            styleTextarea(ta, DEFAULT_TEXT_FONT, DEFAULT_TEXT_COLOR, DEFAULT_TEXT_SIZE);
            el.appendChild(ta);
            makeTransformable(el);
            if (window.tmPlace) tmPlace(el);
            document.getElementById('canvasArea').appendChild(el);
            selectElement(el);
        }

        function resolveSrc(p) {
            return /^(https?:|data:|blob:)/i.test(p) ? p : p.split('/').map(encodeURIComponent).join('/');
        }

        function bindImage(img, src, fallback) {
            img.dataset.src = src;
            img.onerror = () => {
                if (fallback && img.src !== fallback) { img.src = fallback; }
                else { img.classList.add('broken'); img.alt = '⚠ ' + src; }
            };
            img.src = resolveSrc(src);
            inlineImage(img);
        }
        /* 🖼️ 페이지 그림은 주소가 아닌 그림 그대로(data) 일기 JSON에 담아요 (확정 원칙)
           → 불러올 때 개발자 구글 드라이브 · 앱스크립트 트래픽 0 · 주소로 붙은 그림은 한 번 그려서 바꾼 뒤 저장
           - 긴 변 최대 1000px · 투명한 곳이 있으면 PNG, 없으면 JPG */
        const INLINE_MAX = 1000;
        function inlineImage(img) {
            const src = img.dataset.src;
            if (!src || src.startsWith('data:')) return;
            const im = new Image();
            im.crossOrigin = 'anonymous';
            im.onload = () => {
                if (img.dataset.src !== src || !im.naturalWidth) return;
                try {
                    const k = Math.min(1, INLINE_MAX / Math.max(im.naturalWidth, im.naturalHeight));
                    const w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
                    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
                    const x = cv.getContext('2d'); x.drawImage(im, 0, 0, w, h);
                    const a = x.getImageData(0, 0, w, h).data; let clear = false;
                    for (let i = 3; i < a.length; i += 16) if (a[i] < 255) { clear = true; break; }
                    const url = clear ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', .9);
                    img.dataset.src = url; img.src = url;
                    if (img.isConnected && typeof saveData === 'function') saveData(false);
                } catch (e) {}
            };
            im.src = resolveSrc(src);
        }

        function addImage(src, fallback) {
            if (!isCoverOpen) { showMsg('먼저 다이어리를 열어주세요!'); return false; }
            const el = document.createElement('div');
            el.className = 'element-box';
            el.style.width = '150px';
            const img = document.createElement('img');
            bindImage(img, src, fallback);
            el.appendChild(img);
            makeTransformable(el);
            const at = window.tmPlace && tmPlace(el);
            document.getElementById('canvasArea').appendChild(el);
            if (!at) elCenter(el);
            return true;
        }
        /* 🖼️ 스티커는 늘 원본 크기 그대로 (그림 1px = 페이지 1px · 도련 · 2026-10-16) : 그림이 다 오면 (붙이는 쪽이 자리를 정한 뒤) 크기만 원본으로 · 가운데는 그대로
           씰(하얀 종이) · 조각 봉투 · 📒 수첩 시트에서 작게 보이던 것도 붙는 순간 원본 크기 · 페이지보다 크면 페이지 밖으로 넘쳐요
           (🎀 테이프 · 카드 · 그림 그리기 · 📄 모조지스티커처럼 크기를 정해 두고 붙는 것은 그대로) */
        function elOrig(el) { const img = el && el.querySelector(':scope > img'); if (img) elRealSize(el, img); }
        function elRealSize(el, img) {
            const go = () => requestAnimationFrame(() => requestAnimationFrame(() => {
                const w = img.naturalWidth, h = img.naturalHeight; if (!el.isConnected || !w || !h) return;
                const b0 = el.getBoundingClientRect(), c0 = [b0.left + b0.width / 2, b0.top + b0.height / 2];
                el.style.width = w + 'px'; el.style.height = el.style.height ? h + 'px' : ''; el.dataset.scale = 1;
                const pg = document.getElementById('canvasArea'), r = pg.getBoundingClientRect(), k = r.width / (pg.offsetWidth || r.width) || 1;
                const put = (x, y) => { el.dataset.posX = x; el.dataset.posY = y; el.style.transform = `translate(${x}px, ${y}px) scale(1) rotate(${el.dataset.rotation || 0}deg)`; };
                const b1 = el.getBoundingClientRect();
                put(Math.round(+el.dataset.posX + (c0[0] - (b1.left + b1.width / 2)) / k), Math.round(+el.dataset.posY + (c0[1] - (b1.top + b1.height / 2)) / k));
                if (typeof saveData === 'function') saveData(false);
            }));
            if (img.complete && img.naturalWidth) setTimeout(go, 60); else img.addEventListener('load', () => setTimeout(go, 60), { once: true });
        }
        /* 📍 꺼낸 스티커는 배경(화면) 한가운데에 놓여요 (화면 가운데가 페이지 밖이면 페이지 안에서 가장 가까운 곳)
           - 처음 자리(100, 100) 그대로일 때만 : 떼어 붙이기 · 필기구처럼 부른 곳에서 자리를 정했으면 그대로 둬요
           - 그림은 다 불러온 뒤 크기를 재서 맞춰요 */
        function elCenter(el) {
            const go = () => {
                if (!el.isConnected || +el.dataset.posX !== (el._p0 ?? 100) || el.dataset.posY !== '100') return;
                const pg = document.getElementById('canvasArea'), r0 = pg.getBoundingClientRect(), k = r0.width / (pg.offsetWidth || r0.width) || 1, r = window.dyVisRect ? dyVisRect(r0) : r0;
                const put = (x, y) => { el.dataset.posX = x; el.dataset.posY = y; el.style.transform = `translate(${x}px, ${y}px) scale(${el.dataset.scale || 1}) rotate(${el.dataset.rotation || 0}deg)`; };
                put(0, 0);
                const b = el.getBoundingClientRect(), hw = Math.min(b.width, r.width) / 2, hh = Math.min(b.height, r.height) / 2;
                const cx = Math.min(r.right - hw, Math.max(r.left + hw, window.innerWidth / 2)), cy = Math.min(r.bottom - hh, Math.max(r.top + hh, window.innerHeight / 2));
                put(Math.round((cx - (b.left + b.width / 2)) / k), Math.round((cy - (b.top + b.height / 2)) / k));
                if (selectedElement === el && typeof positionTextPanel === 'function') positionTextPanel();
                if (typeof saveData === 'function') saveData(false);
            };
            const img = el.querySelector('img');
            if (img && !img.complete) { img.addEventListener('load', () => requestAnimationFrame(go), { once: true }); img.addEventListener('error', () => requestAnimationFrame(go), { once: true }); }
            else requestAnimationFrame(go);
        }

        /* 📚 기본스티커 : 그림과 목록은 Cloudflare 그림 보관함(KIT_BASE)에 있어요 (도구/말랑달콤_포장기.html 로 만든 zip 을 올려요)
           - list.json : images [{ f, c }] 씰 낱장 · sheets [{ c, fs }] 씰 종이 · kits { 종류: [{ c, fs }] · [{ c, f }] } · t [미리보기가 있는 그림]
             f = 그림 파일 이름 (같은 그림은 늘 같은 이름) → 원본 KIT_BASE/k/이름 · 미리보기 KIT_BASE/t/지문.webp (작게 보여 줄 때)
           - 다이어리 안에서는 주소로 바꿔서 써요 : images [{ u, c }] · sheets [{ c, us }] · kits [{ c, us }] · [{ c, u }]
           - c = 기본스티커/씰스티커 아래 폴더 이름 = 카테고리 ('' 이면 '기본' 카테고리) · 나머지 종류는 js/stk-basic.js 가 각 창의 기본 칸에 제가 그린 그림과 섞어서 보여요
           - 카테고리만 이름이 보여요 ('1. 캐릭터' 처럼 앞 번호는 순서용 · 화면에는 '캐릭터') · 스티커 이름은 없어요
           - 목록은 앱을 켠 동안 한 번만 받아요 (basicKit) · 🏪 진열대가 써요 (js/basket.js · 🎒 유한 스티커 10-25 : 예전 그림 모음 목록 창은 없앴어요) */
        const KIT_BASE = 'https://malang-img.pages.dev';                    // ← 🖼️ 그림 보관함 (Cloudflare Pages 주소 · 끝에 / 없이)
        const KIT_THUMB = new Set();                                         // 미리보기(t/)가 따로 있는 그림 지문
        const kitOk = f => typeof f === 'string' && /^[0-9a-f]{16}\.(png|jpg|gif|webp|svg)$/.test(f);
        const kitUrl = f => KIT_BASE + '/k/' + f;
        /* 보여 줄 크기에 맞는 주소 : 작게(400 이하)는 미리보기 · 크게는 원본 */
        function kitSize(u, w) {
            u = String(u || '');
            if (u.startsWith(KIT_BASE + '/k/')) { const f = u.slice(KIT_BASE.length + 3), h = f.split('.')[0]; return w <= 400 && KIT_THUMB.has(h) ? KIT_BASE + '/t/' + h + '.webp' : u; }
            return u;
        }
        const libCatName = c => c.replace(/^\d+\s*[.)_\-]?\s*/, '') || c;
        window.elOrig = elOrig;

        async function fetchLibraryList() {
            if (!KIT_BASE) throw new Error('setup');
            const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), KT_WAIT_SLOW);   // 기다리는 시간은 keepTrying 이 정해요 (5초 · 느리면 10초)
            try {
                const res = await fetch(KIT_BASE + '/list.json', { signal: ctl.signal, cache: 'no-cache' });
                if (!res.ok) throw new Error('server');
                const d = await res.json();
                if (!d || !Array.isArray(d.images)) throw new Error('server');
                return kitParse(d);
            } finally { clearTimeout(timer); }
        }
        try { localStorage.removeItem('malang_kit_list'); } catch (e) {}       // 예전 목록 기억은 안 써요 (도련 10-25 · 늘 새 목록만) → v711 때 남은 것 치우기
        function kitParse(d) {
            {
                (Array.isArray(d.t) ? d.t : []).forEach(h => { if (/^[0-9a-f]{16}$/.test(h)) KIT_THUMB.add(h); });
                const us = fs => (Array.isArray(fs) ? fs : []).filter(kitOk).slice(0, 30).map(kitUrl);
                const pv = p => typeof p === 'string' && /^[0-9a-f]{16}$/.test(p) ? KIT_BASE + '/p/' + p + '.webp' : '';   // 🖼️ 묶음 미리보기 한 장 (포장기 · 진열대 카드용)
                const kits = {};
                Object.keys(d.kits && typeof d.kits === 'object' ? d.kits : {}).forEach(k => {
                    kits[k] = (Array.isArray(d.kits[k]) ? d.kits[k] : []).map(x => !x ? null : Array.isArray(x.fs) ? { c: String(x.c || ''), us: us(x.fs), pv: pv(x.p) } : kitOk(x.f) ? { c: String(x.c || ''), u: kitUrl(x.f) } : null)
                        .filter(x => x && (x.u || (x.us && x.us.length)));
                });
                return {
                    images: d.images.filter(x => x && kitOk(x.f)).map(x => ({ u: kitUrl(x.f), c: String(x.c || '') })),
                    sheets: (Array.isArray(d.sheets) ? d.sheets : []).map(x => x && { c: String(x.c || ''), us: us(x.fs), pv: pv(x.p) }).filter(x => x && x.us.length),
                    kits
                };
            }
        }
        /* 기본스티커 목록 (앱을 켠 동안 한 번) : { images, sheets, kits }
           실패하면 받을 때까지 5초마다 알아서 다시 해요 (js/drive.js keepTrying · 창을 닫아도 뒤에서 계속)
           씰 · 조각 · 모조지스티커 · 테이프 · 메모지 · 떡메 · 속지 창이 모두 이 목록 하나를 같이 기다려요 */
        let basicKitP = null, basicKitTry = 0;
        async function basicKitLoop() {
            basicKitTry = 1;
            try {
                return await keepTrying(fetchLibraryList, {
                    stop: e => e && e.message === 'setup',                     // 서버 주소가 없으면 기다려도 소용없어요
                    onTry: n => { basicKitTry = n; document.dispatchEvent(new CustomEvent('basickit-retry', { detail: { n: n - 1 } })); }
                });
            } catch (e) { basicKitP = null; throw e; }
            finally { basicKitTry = 0; }
        }
        function basicKit(force) {
            if (!basicKitP || (force && !basicKitTry)) basicKitP = basicKitLoop();
            return basicKitP;
        }
        /* (미리 받기는 안 해요 · 겉표지를 열 때 버벅여서 · 도련 10-25 → 진열대를 열 때 받아요) */
        window.basicKit = basicKit; window.kitSize = kitSize; window.kitName = libCatName;


        /* 🔒 페이지 스티커 크기 바꾸기 막기 (도련 · 2026-10-16) : 빨간 점선 네모의 꼭짓점 · 두 손가락 · 마우스 휠로 크기가 안 바뀌어요 (돌리기 · 옮기기는 그대로)
           다시 켜려면 false 로 바꾸면 돼요 (크기 코드는 그대로 있어요) */
        const EL_SCALE_LOCK = true;
        /* 📄 스티커는 진짜처럼 페이지 밖으로 삐져나갈 수 있어요 (도련 · 2026-10-17 · #canvasArea overflow: visible)
           - 다만 가운데는 페이지 안에 있어야 붙어 있어요 = 최대 반쯤만 밖으로 (밖으로 나간 부분은 ✂️ 스티커 칼로 잘라 버리는 게 다꾸의 맛) */
        function elKeepCenter(el, x, y) {
            const ca = document.getElementById('canvasArea'); if (!ca) return [x, y];
            const W = el.offsetWidth, H = el.offsetHeight, PW = ca.offsetWidth, PH = ca.offsetHeight;
            const L = ca.closest('.dk-cover') ? PW / 2 : 0;                     // 📕 표꾸 : 표지는 오른쪽 쪽 (js/skins.js dkCv)
            return [Math.max(L - W / 2, Math.min(PW - W / 2, x)), Math.max(-H / 2, Math.min(PH - H / 2, y))];
        }
        window.elKeepCenter = elKeepCenter;
        function makeTransformable(el) {
            zRoom(); el.style.zIndex = zIndexCounter++;
            const p0 = 100 + (window.dyVisX ? dyVisX() : 0);                   // 새로 놓는 자리 : 보이는 쪽의 왼쪽 위 (📱 한쪽 보기 · 오른쪽 쪽이면 오른쪽 쪽에 · 도련 10-19)
            let posX = p0, posY = 100, scale = 1, rotation = 0; el._p0 = p0;

            /* 네 꼭짓점 : 잡고 돌리면 회전 + 가운데로 당기면 작게 · 바깥으로 밀면 크게 (눈에 안 보이는 터치 칸 · 도련 · 2026-10-13)
               · 손가락 2개로 벌리면 확대/축소 + 비틀면 회전 · 마우스 휠로 확대/축소 */
            ['tl', 'tr', 'bl', 'br'].forEach(c => {
                const z = document.createElement('div');
                z.className = 'rot-zone rot-' + c;
                el.appendChild(z);
            });

            /* 🎀 마스킹테이프 (js/tape.js) : ↔ 손잡이로 길이만 늘이고 줄이기 */
            let stretchHandle = null, initialW = 0;
            const tapeImg = el.querySelector('img');
            if (tapeImg && typeof isTapeSrc === 'function' && isTapeSrc(tapeImg.dataset.src)) {
                stretchHandle = document.createElement('div');
                stretchHandle.className = 'handle stretch-handle';
                el.classList.add('is-tape');
                stretchHandle.innerHTML = '↔';
                el.appendChild(stretchHandle);
            }

            /* 🪶 끌어 옮기기 (맨 위 레이어로 · 놓은 뒤에도 맨 위)
               - 그림 스티커 · 이모지 : 🏷️ 씰스티커처럼 손가락을 따라 가장자리부터 떼어져요 (js/peelfx.js pfxSeal) → 다 떼면 떠서 따라오고, 놓으면 작아지며 붙어요 · 덜 떼고 놓으면 제자리에 다시 붙어요
               - 액자 사진 · 마스킹테이프 등 : 6% 커지고 그림자를 단 채 떠서 따라와요 */
            let lift = 1, liftRaf = 0, lifted = false, seal = null, peelStop = null;
            /* 스티커인지 : 그림 스티커 · 이모지 (액자 사진 · 테이프 · 글 쓰는 메모 · 움직이는 것은 아니에요) */
            function isStickerEl() {
                if (el.className.indexOf('fr-') >= 0 || el.dataset.float || el.querySelector('textarea')) return false;
                const img = el.querySelector(':scope > img');
                if (img) return img.complete && !!img.naturalWidth && !(typeof isTapeSrc === 'function' && isTapeSrc(img.dataset.src));
                return !!el.querySelector(':scope > span');
            }
            function liftTo(to) {
                cancelAnimationFrame(liftRaf);
                const from = lift, t0 = performance.now();
                const step = now => {
                    const k = Math.min(1, (now - t0) / 140), e = 1 - (1 - k) * (1 - k);
                    lift = from + (to - from) * e;
                    updateTransform();
                    if (k < 1) liftRaf = requestAnimationFrame(step);
                };
                liftRaf = requestAnimationFrame(step);
            }

            function updateTransform() {
                el.style.transform = `translate(${posX}px, ${posY}px) scale(${scale * lift}) rotate(${rotation}deg)`;
                el.style.setProperty('--inv', Math.min(5, 1 / (scale || 1)));
            }
            
            el.dataset.posX = posX; el.dataset.posY = posY;
            el.dataset.scale = scale; el.dataset.rotation = rotation;
            updateTransform();

            let actionType = null;
            let startX, startY, startAngle, initialX, initialY, pinch = null, rotD0 = 0, rotS0 = 1;

            function getClientPos(e) {
                if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
                return { x: e.clientX, y: e.clientY };
            }

            const onStart = (e) => {
                /* 두 번째 손가락이 다른 것 위에 닿으면 고른 걸 바꾸지 않음 */
                if (e.touches && e.touches.length > 1 && selectedElement && selectedElement !== el) return;
                selectElement(el);
                const pos = getClientPos(e);
                startX = pos.x; startY = pos.y;
                posX = parseFloat(el.dataset.posX) || 0;
                posY = parseFloat(el.dataset.posY) || 0;
                scale = parseFloat(el.dataset.scale) || 1;
                rotation = parseFloat(el.dataset.rotation) || 0;

                pinch = null;
                if (e.touches && e.touches.length > 1) {
                    actionType = 'pinch';
                } else if (e.target.classList && e.target.classList.contains('rot-zone')) {
                    actionType = 'rotate';
                    const rect = el.getBoundingClientRect();
                    startAngle = Math.atan2(pos.y - (rect.top + rect.height / 2), pos.x - (rect.left + rect.width / 2)) * (180 / Math.PI) - rotation;
                    rotD0 = Math.hypot(pos.x - (rect.left + rect.width / 2), pos.y - (rect.top + rect.height / 2)); rotS0 = scale;   // 가운데(피봇)까지 거리 → 크기
                } else if (stretchHandle && e.target === stretchHandle) {
                    actionType = 'stretch';
                    initialW = parseFloat(el.style.width) || el.offsetWidth;
                    if (!el.dataset.own && el._tapeMax == null) el._tapeMax = initialW;   // 🎒 저장된 테이프는 줄이기만 (롤과 이어져 있지 않아요 · js/tape.js)
                } else {
                    actionType = 'move';
                    initialX = posX; initialY = posY;
                }
                e.stopPropagation();
            };

            const onMove = (e) => {
                if (!actionType) return;
                if (e.cancelable) e.preventDefault();
                if (e.touches && e.touches.length > 1) {
                    const a = e.touches[0], b = e.touches[1];
                    const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
                    const ang = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * (180 / Math.PI);
                    if (actionType !== 'pinch' || !pinch) {
                        actionType = 'pinch';
                        pinch = { d0: d || 1, a0: ang, s0: parseFloat(el.dataset.scale) || 1, r0: parseFloat(el.dataset.rotation) || 0 };
                        return;
                    }
                    if (!EL_SCALE_LOCK) scale = Math.max(0.2, Math.min(5, pinch.s0 * (d / pinch.d0)));   // 🔒 크기 막기면 돌리기만
                    rotation = pinch.r0 + (ang - pinch.a0);
                    el.dataset.scale = scale; el.dataset.rotation = rotation;
                    updateTransform();
                    if (el === selectedElement) positionTextPanel();
                    return;
                }
                if (actionType === 'pinch') return;
                const pos = getClientPos(e);

                if (actionType === 'move') {
                    const ddx = pos.x - startX, ddy = pos.y - startY;
                    if (seal) { seal.move(pos.x, pos.y); return; }
                    if (!lifted && Math.hypot(ddx, ddy) > 6) {
                        lifted = true;
                        if (!el.dataset.bgp) { zRoom(); el.style.zIndex = zIndexCounter++; }   // 📄 배경 모조지는 옮겨도 뒤에 그대로
                        /* 🏷️ 씰스티커처럼 떼었다 붙이기 : 지금은 꺼 뒀어요 (모든 것이 모조지스티커처럼 살짝 떠서 옮겨져요)
                           다시 켜려면 아래 두 줄의 // 를 지우고, 그 밑의 '살짝 떠서' 한 줄을 지우면 돼요 (sealStart 함수는 그대로 있어요)
                        if (!(seal = sealStart())) { el.classList.add('lifting'); liftTo(1.06); }   // 📝 메모지 · 🧻 떡메 · 📄 모조지스티커 · 테이프 : 살짝 떠서 옮겨요
                        else { seal.move(pos.x, pos.y); return; } */
                        el.classList.add('lifting'); liftTo(1.06);                      // 모두 살짝 떠서 옮겨요 (그림자 : css .lifting)
                        /* 🏷️ 스티커만 살짝 들렸다가 평평해지며 뜨기 (v373) : 지금은 꺼 뒀어요 (도련 · 2026-10-13 · 그냥 떠서 옮겨요)
                           다시 켜려면 아래 한 줄의 // 만 지우면 돼요 (js/peelfx.js pfxPeel · isStickerEl 는 그대로 있어요)
                           처음에 잡은 쪽 가장자리가 살짝(30%) 들렸다가 평평해지며 떠요 (0.3초 · 저절로) · 위치는 처음부터 손가락과 1:1 */
                        // if (window.pfxPeel && isStickerEl()) { if (peelStop) peelStop(); peelStop = pfxPeel(el, startX, startY, ddx, ddy, rotation, () => { peelStop = null; }, { upto: .3, ms: 160, flat: true, flatMs: 150 }); }
                    }
                    posX = initialX + ddx;
                    posY = initialY + ddy;
                    [posX, posY] = elKeepCenter(el, posX, posY);                 // 📄 페이지 밖으로 반쯤은 나가도 돼요 (가운데만 페이지 안)
                    el.dataset.posX = posX; el.dataset.posY = posY;
                } else if (actionType === 'rotate') {
                    const rect = el.getBoundingClientRect();
                    const currentAngle = Math.atan2(pos.y - (rect.top + rect.height / 2), pos.x - (rect.left + rect.width / 2)) * (180 / Math.PI);
                    rotation = currentAngle - startAngle;
                    el.dataset.rotation = rotation;
                    const d = Math.hypot(pos.x - (rect.left + rect.width / 2), pos.y - (rect.top + rect.height / 2));
                    if (!EL_SCALE_LOCK && rotD0 > 8) { scale = Math.max(0.2, Math.min(5, rotS0 * d / rotD0)); el.dataset.scale = scale; }   // 가까이 → 작게 · 멀리 → 크게 (🔒 크기 막기면 돌리기만)
                } else if (actionType === 'stretch') {
                    const a = rotation * Math.PI / 180;
                    const d = ((pos.x - startX) * Math.cos(a) + (pos.y - startY) * Math.sin(a)) / (scale || 1);
                    const tmax = el.dataset.own ? +el.dataset.ownMax || initialW : el._tapeMax != null ? el._tapeMax : 1200;   // 🎒 롤에 남은 만큼만 늘어나요
                    el.style.width = Math.round(Math.max(40, Math.min(1200, tmax, initialW + d))) + 'px';
                }
                updateTransform();
                if (el === selectedElement) positionTextPanel();
            };

            const onEnd = () => {
                if (actionType === 'stretch' && el.dataset.own && window.ownQty) {   // 🎒 늘인 만큼 롤이 더 줄어요 (줄인 건 돌아오지 않아요)
                    const w = parseFloat(el.style.width) || 0, used = +el.dataset.ownUsed || 0;
                    if (w > used + .5) { el.dataset.ownUsed = w; if (typeof saveData === 'function') saveData(false); ownQty(el.dataset.own, w - used, el).catch(() => {}); }
                }
                actionType = null; pinch = null;
                if (seal) { lifted = false; seal.up(); return; }
                if (peelStop) { peelStop(); peelStop = null; }                  // 아주 빨리 놓으면 들린 쪽도 바로 평평하게
                if (lifted) { lifted = false; el.classList.remove('lifting'); land(); }
            };
            /* 내려앉기 : 살짝 눌렸다가(0.98) 제자리 크기로 */
            function land() {
                cancelAnimationFrame(liftRaf);
                const from = lift, t0 = performance.now();
                const step = now => {
                    const k = Math.min(1, (now - t0) / 260);
                    lift = k < .55 ? from + (.98 - from) * (1 - (1 - k / .55) ** 2) : .98 + .02 * Math.sin((k - .55) / .45 * Math.PI / 2);
                    updateTransform();
                    if (k < 1) liftRaf = requestAnimationFrame(step);
                };
                liftRaf = requestAnimationFrame(step);
            }

            /* 🏷️ 씰스티커처럼 떼기 시작 : 지금 보이는 모습 그대로 맨 위 캔버스에 옮겨 그리고, 페이지의 스티커는 잠깐 숨겨요 */
            function sealStart() {
                if (!window.pfxSeal || el.className.indexOf('fr-') >= 0 || el.dataset.float || el.querySelector('textarea')) return null;
                const img = el.querySelector(':scope > img'), span = !img && el.querySelector(':scope > span');
                if (img && (!img.complete || !img.naturalWidth || (typeof isTapeSrc === 'function' && isTapeSrc(img.dataset.src)))) return null;
                if (!img && !span) return null;
                const ca = document.getElementById('canvasArea'), k = (ca.getBoundingClientRect().width / (ca.offsetWidth || 1)) || 1, S = scale * k;
                const node = img || span, w = node.offsetWidth * S, h = node.offsetHeight * S;
                if (w < 4 || h < 4) return null;
                let src = img;
                if (!img) {                                                     // 이모지는 글자를 그림으로
                    const R = 3, c = document.createElement('canvas'), fs = parseFloat(getComputedStyle(span).fontSize) || 45;
                    c.width = Math.ceil(span.offsetWidth * R); c.height = Math.ceil(span.offsetHeight * R);
                    const g = c.getContext('2d'); g.font = `${fs * R}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
                    g.fillText(span.textContent, c.width / 2, c.height / 2 + fs * R * .06); src = c;
                }
                const r = el.getBoundingClientRect(), cx0 = r.left + r.width / 2, cy0 = r.top + r.height / 2;
                const x0 = initialX, y0 = initialY;
                el.style.visibility = 'hidden';
                return pfxSeal({ src, cx: cx0, cy: cy0, w, h, rot: rotation * Math.PI / 180, x: startX, y: startY,
                    onCancel: () => { seal = null; el.style.visibility = ''; },
                    onDrop: (cx, cy) => {                                       // 놓은 자리에 작아지며 붙어요
                        seal = null;
                        posX = x0 + (cx - cx0) / k; posY = y0 + (cy - cy0) / k;
                        [posX, posY] = elKeepCenter(el, posX, posY);
                        el.dataset.posX = posX; el.dataset.posY = posY;
                        lift = 1.07; updateTransform(); el.style.visibility = ''; liftTo(1);
                        if (el === selectedElement) positionTextPanel();
                    } });
            }

            el.addEventListener('wheel', (e) => {
                if (EL_SCALE_LOCK) return;                                      // 🔒 크기 막기 : 휠로 크기가 안 바뀌어요
                e.preventDefault();
                scale = parseFloat(el.dataset.scale) || 1;
                posX = parseFloat(el.dataset.posX) || 0;
                posY = parseFloat(el.dataset.posY) || 0;
                rotation = parseFloat(el.dataset.rotation) || 0;
                scale += e.deltaY < 0 ? 0.05 : -0.05;
                scale = Math.max(0.2, Math.min(scale, 5));
                el.dataset.scale = scale;
                updateTransform();
                if (el === selectedElement) positionTextPanel();
            });

            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', onStart, { passive: false });
            window.addEventListener('mousemove', onMove);
            window.addEventListener('touchmove', onMove, { passive: false });
            window.addEventListener('mouseup', onEnd);
            window.addEventListener('touchend', onEnd);
            window.addEventListener('touchcancel', onEnd);                     // 끊겨도 (펜슬 등) 떼던 스티커를 제자리에 돌려놔요
        }

        function selectElement(el) {
            if (selectedElement !== el) panelOffset = null;
            if (selectedElement) selectedElement.classList.remove('selected');
            selectedElement = el;
            selectedElement.classList.add('selected');
            updateTextPanel();
            idleArm();
        }

        /* 👆 사진 · 스티커 같은 그림을 골라 놓고 3초 동안 이동 · 회전 · 크기 조절(손가락 · 마우스 · 창 누르기)을 안 하면 선택 풀기
           - 누르고 있는 동안은 기다리고, 뗀 뒤부터 다시 3초 · 사진 꾸미기 창의 글 입력 중이거나 순서 메뉴가 열려 있으면 끝날 때까지 기다려요
           - 글상자는 그대로 (쓰는 중에 풀리면 안 되니까요) */
        const idleMs = () => (window.clearSec ? clearSec() : 5) * 1000;   // 설정 '자동으로 사라지는 시간'(팝업메뉴와 같은 값)
        let idleTimer = 0, idleDown = false;
        function idleArm() {
            clearTimeout(idleTimer); idleTimer = 0;
            const el = selectedElement;
            if (!el || idleDown || el.querySelector('textarea')) return;
            idleTimer = setTimeout(() => {
                idleTimer = 0;
                if (selectedElement !== el || !el.isConnected || idleDown) return;
                const a = document.activeElement, typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.closest('#textPanel');
                if (typing || document.getElementById('layerMenu') || document.querySelector('.tap-menu.elem')) { idleArm(); return; }
                el.classList.remove('selected');
                selectedElement = null;
                updateTextPanel();
            }, idleMs());
        }
        const idleTouch = e => {
            idleDown = e.type === 'mousedown' || e.type === 'touchstart' ? true : !!(e.touches && e.touches.length);
            if (idleDown) { clearTimeout(idleTimer); idleTimer = 0; } else idleArm();
        };
        ['mousedown', 'touchstart', 'mouseup', 'touchend', 'touchcancel'].forEach(t => document.addEventListener(t, idleTouch, { capture: true, passive: true }));
        /* ✏️ 애플펜슬 : 아이패드는 펜슬로 끌자마자 그림 끌어 옮기기 · 글자 고르기를 시작해서 (손가락은 꾹 눌러야 시작) 끌기가 중간에 끊겨요
           → 페이지 스티커 · 🏷️ 씰스티커 · 🧩 조각스티커(비닐 찢기) · 📄 모조지스티커 화면에서는 펜슬일 때 그 동작을 막아요 (글상자 · 버튼은 그대로) */
        document.addEventListener('touchstart', e => {
            const t = e.touches[0], tg = e.target;
            if (!e.cancelable || !t || t.touchType !== 'stylus' || !tg.closest) return;
            if (tg.closest('textarea, input, button, select')) return;
            if (tg.closest('#canvasArea .element-box, .pel-room')) e.preventDefault();
        }, { capture: true, passive: false });

        document.getElementById('canvasArea').addEventListener('click', (e) => {
            if (e.target.id === 'canvasArea') {
                /* 고른 게 있으면 선택 해제가 먼저 · 해제된 상태에서 누르면 추가 메뉴 (js/tapmenu.js) */
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                    selectedElement = null;
                    updateTextPanel();
                    if (window.tmClose) tmClose();
                } else if (window.tmOpen) tmOpen(e);
            }
        });

        /* 📄 페이지 바깥(스킨 부분)을 눌러도 선택 풀기 · 메모(글상자)도 같이 (빨간 점선이 사라져요) */
        document.addEventListener('pointerdown', (e) => {
            const t = e.target;
            if (!selectedElement || !(t === document.body || t === document.documentElement || t.id === 'diaryWrapper' || t.id === 'diaryBook')) return;
            const a = document.activeElement;
            if (a && a.closest && a.closest('#canvasArea') && a.blur) a.blur();
            selectedElement.classList.remove('selected');
            selectedElement = null;
            updateTextPanel();
            if (window.tmClose) tmClose();
        }, true);

        /* 🧱 페이지에 붙인 것(스티커 · 글 · 그림 · 필기구 글씨)의 z 는 1 ~ Z_MAX 안에서만 (도련 10-21)
           그 위는 늘 페이지 문구 · 날짜바 · 도장 · 알림 · 넘기기 그림자 (css z 10000 ~ · .bd-tool · .page-header …) → 꾸밈이 아무리 쌓여도 문구를 덮지 않아요
           옮길 때마다 z 가 1씩 올라가니 Z_MAX 를 넘으면 겹친 순서는 그대로 두고 1 부터 다시 매겨요 */
        const Z_MAX = 9000;
        function zRoom() {
            if (zIndexCounter <= Z_MAX) return;
            const L = layerBoxes(); L.forEach((x, n) => { x.style.zIndex = n + 1; });
            zIndexCounter = L.length + 1;
        }
        /* ↕️ 순서 : 고른 것의 겹친 순서 바꾸기 (맨 앞 · 한 칸 앞 · 한 칸 뒤 · 맨 뒤) */
        function layerBoxes() {
            return [...document.querySelectorAll('#canvasArea > .element-box')].map((el, i) => [el, parseInt(el.style.zIndex) || 1, i])
                .sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(a => a[0]);
        }
        function openLayerMenu(anchor) {  // anchor = 버튼 · 또는 { left, width, bottom } 자리
            let m = document.getElementById('layerMenu');
            if (m) { m.remove(); return; }
            if (!selectedElement) { showMsg('순서를 바꿀 스티커 · 글 · 사진을<br>먼저 눌러서 골라 주세요.'); return; }
            m = document.createElement('div');
            m.id = 'layerMenu'; m.className = 'layer-menu';
            const A = (c, d, st) => `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.2" fill="${c}"/><path d="${d}" fill="none" stroke="${st}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const ICS = {
                top: A('#dbe8fc', 'M7 12l5-5 5 5M7 18l5-5 5 5', '#4a7fd6'), up: A('#d6f2cc', 'M12 18V7M7 11.5l5-5 5 5', '#3f9455'),
                down: A('#d6f2cc', 'M12 6v11M7 12.5l5 5 5-5', '#3f9455'), bottom: A('#dbe8fc', 'M7 6l5 5 5-5M7 12l5 5 5-5', '#4a7fd6')
            };
            m.innerHTML = [['top', '맨 앞'], ['up', '한 칸 앞'], ['down', '한 칸 뒤'], ['bottom', '맨 뒤']]
                .map(([k, t]) => `<button type="button" class="tap-menu-btn" data-k="${k}" onclick="layerMove('${k}')"><i class="tm-ic">${ICS[k]}</i><span>${t}</span></button>`).join('');
            document.body.appendChild(m);
            const r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : anchor, w = m.offsetWidth, h = m.offsetHeight;
            m.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
            m.style.top = Math.max(8, Math.min(innerHeight - h - 8, r.bottom + 6)) + 'px';
            layerMark();
            setTimeout(() => document.addEventListener('pointerdown', layerAway, true), 0);
        }
        function layerAway(e) {
            const m = document.getElementById('layerMenu');
            if (m && m.contains(e.target)) return;
            document.removeEventListener('pointerdown', layerAway, true);
            if (m) m.remove();
        }
        function layerMark() {
            const m = document.getElementById('layerMenu'); if (!m) return;
            const L = layerBoxes(), i = L.indexOf(selectedElement), last = L.length - 1;
            m.querySelectorAll('button').forEach(b => { b.disabled = i < 0 || (/top|up/.test(b.dataset.k) ? i === last : i === 0); });
        }
        function layerMove(k) {
            const el = selectedElement; if (!el) return;
            const L = layerBoxes().filter(x => x !== el);
            let i = layerBoxes().indexOf(el);
            i = k === 'top' ? L.length : k === 'bottom' ? 0 : Math.max(0, Math.min(L.length, i + (k === 'up' ? 1 : -1)));
            L.splice(i, 0, el);
            L.forEach((x, n) => { x.style.zIndex = n + 1; });
            zIndexCounter = L.length + 1;
            layerMark();
        }
        /* 🎨 페이지에 붙인 것 다시 다듬기 (꾹 누르기 · 오른쪽 클릭 메뉴 · js/tapmenu.js) → js/stkedit.js · 종류마다 맞는 도구만 (도련 · 2026-10-15)
           - 스티커 · 사진 (씰 · 조각 · 내 스티커) : 전부
           - 📄 모조지스티커 · 🧻 떡메 · 📝 메모지(그림) : 글씨 빼고 (종이 위에는 원래 글을 써요) · 긴 변 1000 까지
           - 🎀 마테 : 색만 (무늬가 이어져 늘어나서 자르면 이음새가 어긋나요) → 테이프 SVG 에 색 행렬을 넣어요 (늘이기 그대로)
           - 빼요 : 사진틀 · 글 · 인형 · 움직이는 캡슐(svg) · 그림 없는 기본 메모지
           - 잘라서 작아지면 붙인 크기도 그만큼 작아지고 · 가운데는 그 자리 그대로 */
        const EL_ED_PAPER = ['color', 'flip', 'crop', 'erase', 'glit'];
        function elEditKind(el) {
            if (!window.openStickerEdit || !el || el.dataset.doll || el.dataset.frame || el.dataset.cm || el.dataset.sh) return null;   // 움직이는 그림(🪄 · ✨)은 다듬기 없음
            if (el.dataset.tk && el.dataset.tkSrc) { const b = el.querySelector(':scope > img.tk-bg'); return b && b.naturalWidth ? { k: 'note', img: b, src: el.dataset.tkSrc } : null; }
            if (el.querySelector('textarea')) return null;
            const img = el.querySelector(':scope > img'), s = img && (img.dataset.src || img.src);
            if (!img || !img.naturalWidth || img.classList.contains('broken')) return null;
            if (typeof isTapeSrc === 'function' && isTapeSrc(s)) return { k: 'tape', img, src: img.getAttribute('src') };   // dataset.src 는 줄인 모양(sv:)일 수 있어요
            if (/^data:image\/svg/.test(s)) return null;
            return { k: el.dataset.float ? 'paper' : 'sticker', img, src: img.src };
        }
        const elEditable = el => !!elEditKind(el);
        /* 🎀 테이프 SVG 에 색 행렬 넣기 (다시 다듬으면 앞의 색 위에 겹쳐요) */
        const elMx = v => v.trim().split(/\s+/).map(Number);
        function elMxMul(N, O) {                                               // 4×5 두 개 → N(O(색))
            const R = [];
            for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
                let v = j === 4 ? N[i * 5 + 4] : 0;
                for (let t = 0; t < 4; t++) v += N[i * 5 + t] * O[t * 5 + j];
                R.push(Math.round(v * 10000) / 10000);
            }
            return R.join(' ');
        }
        function elTapeTint(src, vals) {
            let svg = decodeURIComponent(src.slice(src.indexOf(',') + 1));
            const old = svg.match(/<feColorMatrix id="mlc" type="matrix" values="([^"]+)"/);
            if (old) svg = svg.replace(old[0], `<feColorMatrix id="mlc" type="matrix" values="${elMxMul(elMx(vals), elMx(old[1]))}"`);
            else {
                const a = svg.indexOf('>', svg.indexOf('<svg')) + 1, z = svg.lastIndexOf('</svg>');
                svg = svg.slice(0, a) + `<filter id="mlcf" color-interpolation-filters="sRGB"><feColorMatrix id="mlc" type="matrix" values="${vals}"/></filter><g filter="url(#mlcf)">` + svg.slice(a, z) + '</g>' + svg.slice(z);
            }
            return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }
        async function elEdit(el) {
            const K = elEditKind(el); if (!K) return;
            const img = K.img;
            if (K.k === 'tape') {                                                // 🎀 붙인 길이 그대로 미리 보기 → 색 행렬만 받아요
                const w = Math.max(40, Math.round(img.offsetWidth)), h = Math.max(10, Math.round(img.offsetHeight));
                const pv = K.src.replace(/width%3D%22100%25%22%20height%3D%22100%25%22/, `width%3D%22${w}%22%20height%3D%22${h}%22`);
                const vals = await openStickerEdit(pv, { tools: ['color'], matrix: true }); if (!vals || !el.isConnected) return;
                const out = elTapeTint(K.src, vals); img.dataset.src = out; img.src = out;
                if (typeof saveData === 'function') saveData(false);
                return;
            }
            const MAX = K.k === 'sticker' ? 600 : 1000, nw = img.naturalWidth, nh = img.naturalHeight, k = Math.min(1, MAX / Math.max(nw, nh));
            const out = await openStickerEdit(K.src, K.k === 'sticker' ? {} : { tools: EL_ED_PAPER, max: MAX }); if (!out || !el.isConnected) return;
            const im = new Image(); im.src = out; try { await im.decode(); } catch (e) { return; }
            const fw = im.naturalWidth / (nw * k), fh = im.naturalHeight / (nh * k);   // 다듬기 창은 긴 변 MAX 까지 줄여서 열어요
            const w0 = parseFloat(el.style.width) || el.offsetWidth, hs = parseFloat(el.style.height), h0 = hs || w0 * nh / nw;
            const w1 = Math.max(20, Math.round(w0 * fw)), h1 = hs ? Math.max(20, Math.round(h0 * fh)) : w1 * im.naturalHeight / im.naturalWidth;
            const x = Math.round((parseFloat(el.dataset.posX) || 0) + (w0 - w1) / 2), y = Math.round((parseFloat(el.dataset.posY) || 0) + (h0 - h1) / 2);
            el.dataset.posX = x; el.dataset.posY = y; el.style.width = w1 + 'px'; if (hs) el.style.height = h1 + 'px';
            el.style.transform = `translate(${x}px, ${y}px) scale(${el.dataset.scale || 1}) rotate(${el.dataset.rotation || 0}deg)`;
            if (K.k === 'note') el.dataset.tkSrc = out; else img.dataset.src = out;
            img.src = out;
            if (typeof saveData === 'function') saveData(false);
        }
        window.elEditable = elEditable; window.elEdit = elEdit;
        function deleteSelected() {
            if (selectedElement) { elTweezers(selectedElement); selectedElement = null; }   // 🩷 핀셋으로 뜯어서 버려요
            updateTextPanel();
        }
        /* 🗑️ 삭제 = 🩷 핀셋으로 뜯어서 버리기 (도련 · 2026-10-17 · 현실에서 스티커를 뜯어 버리는 느낌)
           - 삭제를 누르면 큼직한 핀셋이 나와서 마우스를 따라다녀요 (터치는 손가락이 닿는 곳으로) · 핀셋 끝 = 포인터 · 기울기는 글쓰기 필기구와 같아요
           - 스티커를 집은(누른) 곳에서부터 뜯겨요 : 집은 곳(가장 가까운 가장자리)이 핀셋을 따라오고, 접히는 선(집은 곳과 핀셋의 가운데 선)에서 하얀 뒷면이 뒤집혀요
           - 뜯긴 부분이 절반을 넘는 순간부터 스티커가 스르르 사라지기 시작해요 · 그동안에도 멈추지 않고 핀셋을 따라 계속 뜯겨요 (도련 10-17)
             핀셋은 끝까지 포인터에 붙어 다니다가 스티커가 다 사라진 뒤에 사라져요
           - 덜 뜯고 놓으면 다시 착 붙어요(핀셋은 그대로) · ✕ / Esc / 스티커에서 먼 곳을 톡 = 지우지 않고 그만두기
           - 앞면 · 뒷면(복제본) 모두 clip-path 다각형 · 뒷면은 접는 선에 비친 모양(matrix) · 연출 중인 것은 저장에서 빼요
           📌 삭제핀 (도련 · 10-17 · 페이지 빈 곳 메뉴 js/tapmenu.js) : 같은 핀셋인데 고른 것 하나가 아니라 페이지 위 무엇이든 집어서 뜯어요 (twzPin)
           - 집은 곳 맨 위의 스티커 · 사진 · 글 · 메모가 뜯겨요 · 하나를 버려도 핀셋은 남아서 계속 뜯을 수 있어요
           - 덜 뜯고 놓으면 다시 붙고 놓아줘요 · ✕ / Esc / 아무것도 없는 곳을 톡 = 그만두기 */
        const TWZ_SVG = '<svg viewBox="0 0 36 130" aria-hidden="true">'
            + '<defs><linearGradient id="twzA" x1="0" x2="1"><stop offset="0" stop-color="#ffd1df"/><stop offset=".5" stop-color="#ff9dbb"/><stop offset="1" stop-color="#f3779c"/></linearGradient>'
            + '<linearGradient id="twzT" x1="0" x2="1"><stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#e9c46a"/></linearGradient></defs>'
            + '<g class="twz-l"><path d="M16.2 3 L14.6 3 L5 96 Q4.6 118 16 126 L17 126 Z" fill="url(#twzA)" stroke="#d95a84" stroke-width="1"/><path d="M14.6 3 L16.2 3 L15.4 16 L13.4 16 Z" fill="url(#twzT)"/><circle cx="10" cy="70" r="2.2" fill="#fff" opacity=".8"/></g>'
            + '<g class="twz-r"><path d="M19.8 3 L21.4 3 L31 96 Q31.4 118 20 126 L19 126 Z" fill="url(#twzA)" stroke="#d95a84" stroke-width="1"/><path d="M19.8 3 L21.4 3 L22.6 16 L20.6 16 Z" fill="url(#twzT)"/><circle cx="26" cy="70" r="2.2" fill="#fff" opacity=".8"/></g>'
            + '<path d="M18 104c-2.6-3.4-7-1.6-6 1.8.8 2.6 6 5.8 6 5.8s5.2-3.2 6-5.8c1-3.4-3.4-5.2-6-1.8z" fill="#fff"/><rect x="12" y="118" width="12" height="7" rx="3.5" fill="#ffe27a" stroke="#e7b93d" stroke-width=".8"/></svg>';
        const TWZ_Z = 1.55, TWZ_TIP = [18 * TWZ_Z, 3 * TWZ_Z], TWZ_ANG = 215;   // 크기 · 집게 끝(화면 px) · 기울기 = 필기구(draw.js PC_ANG)와 같아요
        /* 🪡 핀셋 모양은 하나 (도련 · 10-17) : 📌 삭제핀 · 스티커 삭제핀 · 스티커 뜯는 핀셋이 모두 pinSvg() 를 써요
           - 나중에 문구점에서 핀셋을 사서 바꾸면 PIN_SKINS 에 모양을 더하고 설정.json 'diary_pin' 에 그 이름을 적어요 → 세 곳이 모두 바뀌어요 */
        const PIN_SKINS = { basic: TWZ_SVG }, PIN_KEY = 'diary_pin', PIN_LOCAL = 'malang_pin';
        let pinSeq = 0;
        function pinSvg() {   // 그라데이션 id 는 핀셋마다 따로 · 같은 id 가 숨은 핀셋에 있으면 색이 안 칠해지고 테두리만 보여요
            const k = prefGet(PIN_KEY, PIN_LOCAL), n = ++pinSeq;
            return (PIN_SKINS[k] || PIN_SKINS.basic).replace(/id="(\w+)"/g, `id="$1-${n}"`).replace(/url\(#(\w+)\)/g, `url(#$1-${n})`); }
        /* 🪡 핀셋 (도련 · 10-17 · 10-19) : 핀셋을 손에 든 동안 늘 보여요 · 절대 사라지지 않아요 · 🗄️ 문구함 🪡 핀셋 서랍 (js/skins.js gdHold) · 들어야 스티커를 만질 수 있어요
           - 쓰임이 없을 땐 그 자리에서 아주 느리게 위아래로 둥실 (공중에 떠서 기다리는 느낌) · 누르는 동안은 둥실 멈추고 집게가 오므라들어요
           - 💻 마우스 : 핀셋이 갈 수 있는 곳(pinOver : 페이지 · 🏷️ 씰 종이 · 🧩 조각 봉투 · 📒 수첩 속지 · 배경지)에선 마우스에 붙어 둥실거리며 따라와요
             갈 수 없는 곳(하단메뉴 · 창 · 버튼 · 메뉴 · 날짜바)으로 마우스가 가면 그 끝자리에 멈춰 둥실 (마우스 화살표가 보여요) · 돌아오면 다시 따라와요
           - 📱 폰 · 📲 패드 : 핀셋과 상관있는 곳(pinRel)을 누를 때만 그 자리로 옮겨 가요 · 나머지를 누르면 그 자리에 둥실
           - ✏️ 그리기 · ✂️ 스티커 칼 · ✏️ 연필꽂이를 쓰는 동안은 따라오지 않고 그 자리에 둥실 (pinBusy)
           - 비키는 건 핀셋을 내려놓거나(🗄️ 문구함 서랍) · 표지로 돌아가거나 · 🗑 뜯기 화면의 핀셋이 대신 나올 때뿐 (pinOff) */
        let pinRelNow = false, pinLast = null, pinEl = null, pinWatch = 0, pinKind = 'pc', pinHold = false, pinFollow = false;   // pinHold : 핀셋 자리에서 눌러 끄는 중 (스티커를 옮기는 동안은 어디서든 따라와요)
        const pinOpen = () => { const p = document.getElementById('innerPage'); return !!p && p.offsetParent !== null; };
        const pinOff = () => !!twz || !(window.gdTwz && gdTwz()) || !pinOpen();
        const pinBusy = () => document.body.classList.contains('draw-on') || !!document.querySelector('body.sk-held, .sk-knife.grab, .rl-ruler.grab, #pcRoom:not([hidden]):not(.rest)');   // ✂️ 칼 · 📏 자를 잡고 있는 동안은 핀셋이 안 따라와요 (도련 10-19)
        const PIN_AREA = '#innerPage, #pelRoom, #pmRoom, #pcbRoom, #spkBoard, .modal.snb-on .snb-sheets';   // 🪡 핀셋이 갈 수 있는 곳 (📄 모조지 종이 #pmRoom : 오린 스티커를 핀셋으로 떼요 · 도련 10-21)
        const pinTop = (x, y) => document.elementsFromPoint(x, y).find(n => !n.closest('.snb-ghost, .pin-cur, .el-peel-back'));
        function pinOver(x, y) {
            const top = pinTop(x, y);
            if (top && !pinBusy() && top.closest('.modal.snb-on')) return true;   // 📒 수첩 · 🪟 고르는 창 : 어디서든 핀셋 · 가위가 마우스를 따라와요 (카테고리 · 칸 · 버튼도 · 도련 10-22)
            if (!top || pinBusy() || top.closest('.pel-hint, .snb-cover, #pageHeader, .tap-menu') || (top.closest('button') && !top.closest('#innerPage'))) return false;   // 안내 · 수첩 표지 · 날짜 바 · 메뉴 · 창의 버튼 (페이지 안 😊 기분 · ☀️ 날씨 도장은 페이지라 돼요)
            if (top.closest(PIN_AREA)) return true;
            return top === document.body || top === document.documentElement || top.matches('.modal.snb-on') || !!top.closest('#diaryWrapper, #bgPatternLayer');   // 🖼 배경지 (다이어리 둘레 · 무늬 배경 · 📒 수첩 뒤 배경지 포함)
        }
        function pinRel(x, y) {                                                  // 👆 핀셋과 상관있는 곳 (그 자리로 옮겨 가요) · 아니면 그 자리에 둥실
            const top = pinTop(x, y);
            if (top && !pinBusy() && top.closest('.modal.snb-on')) return true;   // 📒 수첩 : 어디를 눌러도 그 자리로 (도련 10-22)
            return !!top && !pinBusy() && !!top.closest(PIN_AREA) && !top.closest('.rl-ruler, .sk-knife, button, input, select, textarea, a, .tap-menu, .page-header, #pageHeader, .pel-hint, .snb-cover, .bd-tool, .bd-back, .page-stamps');
        }
        const pinDev = e => e.pointerType === 'mouse' || e.pointerType === 'pen' ? 'pc' : Math.min(screen.width, screen.height) < 600 ? 'phone' : 'pad';   // ✏️ 펜(애플 펜슬 · S펜)은 마우스처럼 : 닿기 전 떠 있는 펜 끝도 따라와요 (펜 호버 · 도련 10-21)
        function pinStart() {
            pinEl = document.createElement('div'); pinEl.className = 'twz pin-cur in bob'; pinEl.setAttribute('aria-hidden', 'true'); pinEl.innerHTML = pinSvg();
            document.body.appendChild(pinEl); pinFollow = false;
            if (window.toolGlow) toolGlow(pinEl);                              // ✨ 든 순간 한 번 반짝 (js/skins.js)
            if (pinLast) pinPut(...pinLast);
            pinWatch = setInterval(() => { if (pinOff()) pinStop(); else pinDodge(); }, 120);   // 메뉴 · 창이 가리면 비켜요 (pinDodge)
        }
        /* 메뉴 · 창이 둥실 떠 있는 핀셋과 겹치면 창 바로 바깥의 가장 가까운 빈자리로 스르르 비켜요 (도련 10-19)
           - 화면 안에서만 · 창에서 멀리 가지 않아요 (창 둘레 바로 옆) · 손이 닿아 있는 동안 · 💻 마우스를 따라오는 동안은 안 움직여요
           - 핀셋을 쓰는 창(📒 수첩 · 떼는 창)은 비키지 않아요 */
        let pinDown = 0;
        window.addEventListener('pointerdown', () => { pinDown = 1; }, true);
        ['pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, () => { pinDown = 0; }, true));
        const PIN_WALL = '.modal:not(.snb-on) > .modal-content, .twz-say.on';   // 페이지 팝업메뉴(.tap-menu)는 피하지 않아요 (도련 10-19 · 메뉴가 핀셋 위에 떠요)
        const PIN_COVER = '#gdCabModal[style*="display: flex"], #stickerMakeModal[style*="display: flex"], #stickerToolModal[style*="display: flex"], #basketModal[style*="display: flex"], #basketKindModal[style*="display: flex"], #shelfModal[style*="display: flex"], #shelfKindModal[style*="display: flex"], #paperModal:not(.snb-on)[style*="display: flex"], #tteokModal:not(.snb-on)[style*="display: flex"], #leafModal:not(.snb-on)[style*="display: flex"]';   // 🪟 고르는 창 위에 뜬 🪡 핀셋 · ✂️ 가위도 비키지 않아요 (도련 10-22)
        const pinCovered = () => !!document.querySelector(PIN_COVER) && !document.querySelector('.modal.snb-on[style*="display: flex"]');   // 📒 수첩이 떠 있으면 늘 창 앞           // 🗂 문구함 · ✨ 스티커 창 · 🪟 고르는 창 : 든 문구는 그 창 뒤로 (비키지 않아요 · css · 도련 10-22)
        function dodgeBy(b) {                                                   // b : 떠 있는 도구의 테두리 → 비킬 거리 [dx, dy] (안 겹치면 null) · ✂️ 가위도 같이 써요 (js/skins.js scsFrame)
            if (pinCovered()) return null;
            const vis = el => { const r = el.getBoundingClientRect(); return r.width && r.height && getComputedStyle(el).visibility !== 'hidden' ? r : null; };
            const walls = [...document.querySelectorAll(PIN_WALL)].filter(el => !el.closest('.modal') || el.closest('.modal').style.display === 'flex').map(vis).filter(Boolean);
            if (!walls.length) return null;
            const M = 10, W = innerWidth, H = innerHeight;
            const hit = (dx, dy) => walls.some(r => b.left + dx < r.right + 4 && b.right + dx > r.left - 4 && b.top + dy < r.bottom + 4 && b.bottom + dy > r.top - 4);
            if (!hit(0, 0)) return null;
            const inside = (dx, dy) => b.left + dx >= M && b.right + dx <= W - M && b.top + dy >= M && b.bottom + dy <= H - M;
            const fit = (dx, dy) => [Math.min(Math.max(dx, M - b.left), W - M - b.right), Math.min(Math.max(dy, M - b.top), H - M - b.bottom)];   // 화면 안으로
            let best = null;
            walls.forEach(r => [[r.left - M - b.right, 0], [r.right + M - b.left, 0], [0, r.top - M - b.bottom], [0, r.bottom + M - b.top]].forEach(([dx, dy]) => {
                const c = fit(dx, dy), d = Math.hypot(c[0], c[1]), ok = inside(c[0], c[1]) && !hit(c[0], c[1]);
                if (!best || (ok && !best.ok) || (ok === best.ok && d < best.d)) best = { c, d, ok };
            }));
            if (!best || !best.ok) {                                            // 빈자리가 없으면 덜 가리는 화면 구석 쪽으로
                const cs = [[M - b.left, M - b.top], [W - M - b.right, M - b.top], [M - b.left, H - M - b.bottom], [W - M - b.right, H - M - b.bottom]];
                const area = (dx, dy) => walls.reduce((a, r) => a + Math.max(0, Math.min(b.right + dx, r.right) - Math.max(b.left + dx, r.left)) * Math.max(0, Math.min(b.bottom + dy, r.bottom) - Math.max(b.top + dy, r.top)), 0);
                const c = cs.sort((p, q) => area(...p) - area(...q) || Math.hypot(...p) - Math.hypot(...q))[0]; best = { c };
            }
            return Math.hypot(best.c[0], best.c[1]) < 2 ? null : best.c;
        }
        function pinDodge() {
            if (!pinEl || pinDown || pinFollow || !pinLast || pinEl.classList.contains('glide')) return;
            const c = dodgeBy(pinEl.getBoundingClientRect()); if (!c) return;
            pinEl.classList.add('glide'); pinPut(pinLast[0] + c[0], pinLast[1] + c[1]);
            setTimeout(() => { if (pinEl) pinEl.classList.remove('glide'); }, 620);
        }
        function pinStop() {
            clearInterval(pinWatch); if (pinEl) pinEl.remove(); pinEl = null; pinFollow = false; document.body.classList.remove('pin-on');
        }
        function pinStay() { pinFollow = false; document.body.classList.remove('pin-on'); if (pinEl && !pinHold) pinEl.classList.add('bob'); }   // 그 자리에 멈춰 둥실 (💻 마우스 화살표가 보여요)
        const pinPut = (x, y) => { pinLast = [x, y]; pinEl.style.transform = `translate(${x - TWZ_TIP[0]}px, ${y - TWZ_TIP[1]}px)${handFlip()} rotate(${TWZ_ANG}deg)`; };
        function pinMove(e) {
            pinKind = pinDev(e);
            if (!pinEl) { if (pinOff()) return; pinStart(); }
            if (pinKind !== 'pc') {                                             // 📱 📲 터치 : 상관있는 곳만 옮겨 가요 (누른 순간 정해요)
                pinFollow = false; document.body.classList.remove('pin-on');
                if (e.type === 'pointerdown') pinRelNow = pinRel(e.clientX, e.clientY);
                if (!pinRelNow) return;
                pinEl.classList.remove('bob', 'glide'); pinPut(e.clientX, e.clientY); return;   // 손이 닿으면 둥실 멈춤
            }
            const on = (pinHold && (e.buttons & 1)) || pinOver(e.clientX, e.clientY);
            if (!on) { pinStay(); return; }
            pinFollow = true; document.body.classList.add('pin-on'); pinEl.classList.remove('glide');
            pinEl.classList.toggle('bob', !(e.buttons & 1));                    // 💻 마우스에 붙어 둥실 · 누르는 동안은 멈춤
            pinPut(e.clientX, e.clientY);
        }
        document.addEventListener('pointermove', pinMove, true);
        window.pinOver = pinOver; window.pinRel = pinRel; window.pinBusy = pinBusy; window.dodgeBy = dodgeBy;   // ✂️ 가위도 핀셋과 같은 규칙 (js/skins.js scsRel · scsFrame)
        document.addEventListener('pointerdown', e => { pinHold = false; pinMove(e); if (pinEl && (pinKind === 'pc' ? pinFollow : pinRelNow)) { pinEl.classList.add('shut'); pinEl.classList.remove('bob'); pinHold = true; } }, true);
        ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, e => { pinHold = false; if (pinEl) { pinEl.classList.remove('shut'); pinEl.classList.add('bob'); } }, true));
        document.addEventListener('mouseout', e => { if (!e.relatedTarget && pinEl) pinStay(); });   // 💻 마우스가 창 밖으로 나가면 그 자리에 둥실
        window.pinAt = e => { pinMove(e); if (pinEl) { pinRelNow = false; pinEl.classList.add('bob'); pinPut(e.clientX, e.clientY); } };   // 🪡 놓인 핀셋을 막 집은 순간 (그 누름은 js/skins.js gdDown 이 먹어서 여기로 안 와요)
        let twz = null;
        const twzReduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
        function twzRoom(pin) {
            let room = document.getElementById('twzRoom');
            if (!room) {
                room = document.createElement('div'); room.id = 'twzRoom'; room.className = 'twz-room';
                room.innerHTML = '<div class="twz-tip"><b id="twzTitle"></b><span id="twzSay"></span><button type="button" class="twz-x" aria-label="그만두기">✕</button></div><div class="twz" id="twzTool"></div><span class="twz-del" id="twzDel" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.5 10.5v6M13.5 10.5v6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>삭제</span>';
                document.body.appendChild(room);
                const x = room.querySelector('.twz-x');
                x.addEventListener('pointerdown', e => e.stopPropagation()); x.addEventListener('click', e => { e.stopPropagation(); twzQuit(); });
                room.addEventListener('pointerdown', twzDown); room.addEventListener('pointermove', twzMove);
                room.addEventListener('pointerup', twzUp); room.addEventListener('pointercancel', twzUp);
                addEventListener('keydown', e => { if (e.key === 'Escape' && twz) twzQuit(); });
            }
            room.querySelector('#twzTool').innerHTML = pinSvg();                // 🪡 지금 쓰는 핀셋 모양
            room.querySelector('#twzTitle').textContent = '🗑 삭제';
            room.querySelector('#twzSay').textContent = pin ? '무엇이든 핀셋으로 집어 쭉 뜯어요' : '핀셋으로 이 스티커를 집어 쭉 뜯어요';
            room.hidden = false; room.classList.remove('bye');
            return room;
        }
        function elTweezers(el) {
            if (!el || !el.isConnected || el.classList.contains('el-dying')) return;
            if (twz) twzQuit();
            el.classList.remove('selected');
            if (twzReduce()) { el.remove(); if (typeof saveData === 'function') saveData(false); return; }
            const room = twzRoom(false);
            twz = { room, tool: room.querySelector('#twzTool'), pin: false };
            twzAttach(el);
            twz.tool.classList.remove('shut', 'bye', 'in');
            const b = el.getBoundingClientRect(); twzToolAt(b.left + b.width / 2, b.bottom - 6);   // 처음엔 스티커 아래쪽에서 · 이후 포인터를 따라와요
            requestAnimationFrame(() => twz && twz.tool.classList.add('in'));
        }
        /* 📌 삭제핀 : 핀셋만 먼저 나와요 → 누른 곳의 것을 그때 집어요 */
        function twzPin(x, y) {
            if (twz) twzQuit();
            if (typeof selectedElement !== 'undefined' && selectedElement) { selectedElement.classList.remove('selected'); selectedElement = null; }
            const room = twzRoom(true);
            twz = { room, tool: room.querySelector('#twzTool'), pin: true, el: null };
            twz.tool.classList.remove('shut', 'bye', 'in');
            const ca = document.getElementById('canvasArea').getBoundingClientRect();
            twzToolAt(x != null ? x : ca.left + ca.width / 2, y != null ? y : ca.top + ca.height / 2);
            requestAnimationFrame(() => twz && twz.tool.classList.add('in'));
        }
        function twzPick(x, y) {                                               // 누른 곳 맨 위의 것 (뜯기는 중인 것 · 뒷면 복제본은 빼요)
            const cv = document.getElementById('canvasArea'), free = cv && cv.closest('.dy-free');   // 📄 바인더 링을 연 뒤 (꾸밈은 평소엔 못 눌러요 · js/skins.js bdFree) 에도 집어요
            if (free) cv.classList.add('bd-pick');
            try { return twzPickAt(x, y); } finally { if (free) cv.classList.remove('bd-pick'); }
        }
        function twzPickAt(x, y) {
            return document.elementsFromPoint(x, y).map(n => n.closest && n.closest('#canvasArea > .element-box')).find(b => b && !b.classList.contains('el-peel-back') && !b.classList.contains('el-dying')) || null;
        }
        function twzAttach(el) {                                               // 이 스티커를 뜯을 준비 (뒷면 복제본 · 손잡이 숨기기)
            el.classList.remove('selected');
            el.classList.add('el-dying');
            el.querySelectorAll('.handle, .rot-zone, .stretch-handle').forEach(h => h.style.display = 'none');
            const back = el.cloneNode(true); back.classList.add('el-peel-back'); back.removeAttribute('id'); back.style.clipPath = 'polygon(0 0, 0 0, 0 0)'; back.style.zIndex = Z_MAX + 500;   // 뜯긴 부분은 다른 스티커보다 위로 (문구 · 날짜바보다는 아래)
            back.querySelectorAll('textarea').forEach(t => { t.readOnly = true; t.tabIndex = -1; });
            el.after(back);
            Object.assign(twz, { el, back, H: el.offsetHeight, W: el.offsetWidth, base: el.style.transform || '', G: null, P: null, drag: null, done: false, full: false });
        }
        function twzDetach() {                                                 // 뜯지 않고 원래대로 붙여 둬요
            const t = twz; if (!t || !t.el) return;
            t.el.style.clipPath = ''; t.el.classList.remove('el-dying'); t.el.querySelectorAll('.handle, .rot-zone, .stretch-handle').forEach(h => h.style.display = ''); t.back.remove();
            t.el = null; t.back = null;
        }
        /* 스티커 안 좌표 ↔ 화면 좌표 (돌리기 · 크기 · 페이지 배율까지) */
        function twzGeo() {
            const t = twz, ca = document.getElementById('canvasArea'), r = ca.getBoundingClientRect(), k = r.width / (ca.offsetWidth || r.width) || 1;
            const s = parseFloat(t.el.dataset.scale) || 1, a = ((parseFloat(t.el.dataset.rotation) || 0) + (parseFloat(t.el.style.rotate) || 0)) * Math.PI / 180;   // 📄 바인더 쪽째 돌린 것까지 (js/skins.js bdFreeApply)
            const b = t.el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;   // 가운데는 화면에 보이는 그대로 (바인더 쪽 벌어짐 · 옮긴 쪽까지)
            return { toLoc: (X, Y) => { const ux = (X - cx) / k, uy = (Y - cy) / k; return [(ux * Math.cos(-a) - uy * Math.sin(-a)) / s + t.W / 2, (ux * Math.sin(-a) + uy * Math.cos(-a)) / s + t.H / 2]; } };
        }
        function twzToolAt(x, y) {
            const t = twz; if (!t) return; t.tip = [x, y]; t.tool.style.transform = `translate(${x - TWZ_TIP[0]}px, ${y - TWZ_TIP[1]}px)${handFlip()} rotate(${TWZ_ANG}deg)`;
            t.room.querySelector('#twzDel').style.transform = `translate(${x + 10}px, ${y + 8}px)`;   // 🗑 삭제 표시는 핀셋 끝 옆에
        }
        /* 사각형을 반평면 (X - M)·n ≥ 0 (side = 1) / < 0 (side = -1) 으로 자른 다각형 */
        function twzClip(W, H, M, n, side) {
            const R = [[0, 0], [W, 0], [W, H], [0, H]], f = p => side * ((p[0] - M[0]) * n[0] + (p[1] - M[1]) * n[1]), out = [];
            for (let i = 0; i < 4; i++) {
                const a = R[i], b = R[(i + 1) % 4], fa = f(a), fb = f(b);
                if (fa >= 0) out.push(a);
                if ((fa >= 0) !== (fb >= 0)) { const u = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); }
            }
            return out;
        }
        const twzPoly = pts => pts.length < 3 ? 'polygon(0 0, 0 0, 0 0)' : 'polygon(' + pts.map(p => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(', ') + ')';
        /* 접기 : 집은 곳 G 가 지금 자리 P 로 → 접는 선 = G · P 의 가운데 수직선 · G 쪽은 뒤집혀 접는 선 너머로 */
        function twzPaint() {
            const t = twz, G = t.G, P = t.P, W = t.W, H = t.H;
            const dx = P[0] - G[0], dy = P[1] - G[1], L = Math.hypot(dx, dy);
            if (L < .5) { t.el.style.clipPath = ''; t.back.style.clipPath = 'polygon(0 0, 0 0, 0 0)'; t.full = false; return; }
            const n = [dx / L, dy / L], M = [(G[0] + P[0]) / 2, (G[1] + P[1]) / 2];
            t.el.style.clipPath = twzPoly(twzClip(W, H, M, n, 1));
            const bp = twzClip(W, H, M, n, -1); t.back.style.clipPath = twzPoly(bp);
            const a = 1 - 2 * n[0] * n[0], b = -2 * n[0] * n[1], d = 1 - 2 * n[1] * n[1], md = 2 * (M[0] * n[0] + M[1] * n[1]);   // 접는 선에 비추기 (가운데 기준)
            const C = [W / 2, H / 2], tx = a * C[0] + b * C[1] + md * n[0] - C[0], ty = b * C[0] + d * C[1] + md * n[1] - C[1];
            t.back.style.transform = `${t.base} matrix(${a}, ${b}, ${b}, ${d}, ${tx}, ${ty})`;
            let ar = 0; for (let i = 0; i < bp.length; i++) { const p = bp[i], q = bp[(i + 1) % bp.length]; ar += p[0] * q[1] - q[0] * p[1]; }
            t.full = Math.abs(ar) / 2 > W * H * .5;                            // 뜯긴 부분이 절반을 넘으면 사라져요 (도련 · 10-17)
        }
        function twzDown(e) {
            const t = twz; if (!t || t.done || e.button > 0) return;
            e.preventDefault();
            twzToolAt(e.clientX, e.clientY);                                    // 👆 터치는 닿은 곳으로 핀셋이 와요
            if (t.pin) {                                                       // 📌 삭제핀 : 누른 곳의 것을 집어요 · 없으면 그만두기
                const box = twzPick(e.clientX, e.clientY);
                if (!box || box !== t.el) { twzDetach(); if (!box) { twzQuit(); return; } if (twzReduce()) { box.remove(); if (typeof saveData === 'function') saveData(false); return; } twzAttach(box); }
            }
            const L = twzGeo().toLoc(e.clientX, e.clientY);
            if (L[0] < -30 || L[0] > t.W + 30 || L[1] < -30 || L[1] > t.H + 30) { twzQuit(); return; }   // 스티커에서 먼 곳을 톡 = 그만두기
            const P0 = 7, x = Math.max(P0, Math.min(t.W - P0, L[0])), y = Math.max(P0, Math.min(t.H - P0, L[1]));
            const dl = x - P0, dr = t.W - P0 - x, dt = y - P0, db = t.H - P0 - y, m = Math.min(dl, dr, dt, db);   // 집은 곳에서 가장 가까운 가장자리부터 들려요
            const G = m === dl ? [P0, y] : m === dr ? [t.W - P0, y] : m === dt ? [x, P0] : [x, t.H - P0];
            t.G = G; t.off = [L[0] - G[0], L[1] - G[1]]; t.P = G.slice();
            t.drag = { id: e.pointerId };
            try { t.room.setPointerCapture(e.pointerId); } catch (er) {}
            t.tool.classList.add('shut');                                     // 집게를 꽉
            twzPaint();
            if (navigator.vibrate) try { navigator.vibrate(8); } catch (er) {}
        }
        function twzMove(e) {
            const t = twz; if (!t) return;
            twzToolAt(e.clientX, e.clientY);                                    // 🖱 핀셋 끝 = 포인터 (누르지 않아도 · 사라지는 중에도 따라와요)
            if (!t.drag || t.drag.id !== e.pointerId || !t.el) return;
            const L = twzGeo().toLoc(e.clientX, e.clientY);
            t.P = [L[0] - t.off[0], L[1] - t.off[1]];
            twzPaint();
            if (t.full) twzFinish();
        }
        function twzUp(e) {
            const t = twz; if (!t || !t.drag || t.drag.id !== e.pointerId) return;
            t.drag = null; t.tool.classList.remove('shut');
            if (t.done) return;                                                // 사라지는 중이면 그대로 사라져요
            if (t.full) { twzFinish(); return; }
            const P0 = t.P.slice(), t0 = performance.now();                    // 덜 뜯었으면 다시 착 붙어요
            const el0 = t.el, back = now => { if (twz !== t || t.drag || t.done || t.el !== el0) return; const p = Math.min(1, (now - t0) / 260), v = (1 - p) * (1 - p); t.P = [t.G[0] + (P0[0] - t.G[0]) * v, t.G[1] + (P0[1] - t.G[1]) * v]; twzPaint(); if (p < 1) requestAnimationFrame(back); else if (t.pin) twzDetach(); };   // 📌 삭제핀은 다시 붙으면 놓아줘요
            requestAnimationFrame(back);
        }
        const TWZ_FADE = 420;                                                  // 스티커가 사라지는 시간 (css twzVanish 와 같아요)
        function twzFinish() {                                                 // 절반 넘게 뜯긴 순간 : 계속 뜯기면서 스르르 → 다 사라지면 핀셋도
            const t = twz; if (!t || t.done) return;
            t.done = true;
            const el = t.el, bk = t.back;
            el.classList.add('twz-vanish'); bk.classList.add('twz-vanish');
            if (navigator.vibrate) try { navigator.vibrate([6, 30, 10]); } catch (er) {}
            setTimeout(() => {
                el.remove(); bk.remove();
                if (typeof saveData === 'function') saveData(false);
                if (twz !== t) return;
                if (t.pin) { t.el = null; t.back = null; t.done = false; t.drag = null; t.tool.classList.remove('shut'); return; }   // 📌 삭제핀은 남아서 또 뜯어요
                t.drag = null; t.tool.classList.remove('shut'); t.tool.classList.add('bye'); t.room.classList.add('bye');
                setTimeout(() => { if (twz === t) twz = null; t.room.hidden = true; }, 400);
            }, TWZ_FADE);
        }
        function twzQuit() {                                                   // 지우지 않고 그만두기 : 원래대로
            const t = twz; if (!t) return;
            if (!t.done) twzDetach();
            twz = null; t.room.hidden = true;
        }
        window.elTweezers = elTweezers; window.twzPin = twzPin;

        async function saveData(showAlert = false) {
            if (!isCoverOpen) return;
            const canvas = document.getElementById('canvasArea');
            const r1 = v => Math.round((parseFloat(v) || 0) * 10) / 10;
            const elementsData = [];

            canvas.querySelectorAll('.element-box:not(.el-dying):not(.el-peel-back)').forEach(el => {   // 🗑️ 삭제 연출 중인 것은 빼요
                const textarea = el.querySelector('textarea');
                const img = el.querySelector('img');
                const span = el.querySelector('span');
                let dollData = null;                                            // 👧 붙인 인형 (js/doll-room.js)
                if (el.dataset.doll) { try { dollData = JSON.parse(el.dataset.doll); } catch (e) { dollData = null; } }
                const item = {
                    t: dollData ? 'd' : (textarea ? 't' : (img ? 'i' : 's')),
                    c: dollData ? dollData : (textarea ? textarea.value : (img ? slimEnc(img.dataset.src || img.getAttribute('src')) : span.innerText)),
                    x: r1(el.dataset.posX), y: r1(el.dataset.posY)
                };
                const sc = Math.round((parseFloat(el.dataset.scale) || 1) * 1000) / 1000;
                if (sc !== 1) item.s = sc;
                const rot = r1(el.dataset.rotation);
                if (rot) item.r = rot;
                const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
                if (w) item.w = Math.round(w);
                if (h) item.h = Math.round(h);
                item.z = parseInt(el.style.zIndex) || 1;
                item.bw = el.offsetWidth; item.bh = el.offsetHeight;
                if (img && el.dataset.float) item.fm = 1;
                if (img && el.dataset.cm) { try { item.cm = JSON.parse(el.dataset.cm); } catch (e) {} }   // 🪄 움직이는 캐릭터 : 칠한 곳 · 움직임 설정 (js/char-move.js)
                if (img && el.dataset.sh) { try { item.sh = JSON.parse(el.dataset.sh); } catch (e) {} }   // ✨ 셰이더 스티커 : 효과 이름 · GLSL 글자 · 속도 · 세기 (js/glrun.js)
                if (el.dataset.bs) item.bs = el.dataset.bs;                    // 📌 바인더 가운데 틈 근처에 놓인 쪽 (js/skins.js bdPin · 그때만 저장)
                if (el.dataset.ph) item.ph = el.dataset.ph;                    // 🕳️ 펀칭기로 같이 뚫린 구멍 (js/skins.js bdPierce)
                if (img && el.dataset.bgp) item.bgp = 1;                        // 📄 배경 모조지 : 옮겨도 맨 뒤 그대로 (js/papermaker.js · 10-23)
                if (img && el.dataset.ts) item.ts = 1;                          // 🔤 글씨스티커 : 📷 사진 꾸미기 창이 안 떠요 (js/page.js getSelectedPhoto)                       // 📄 모조지스티커 : 옮길 때 떼지 않고 살짝 떠서 (아래 makeTransformable)
                if (img && el.dataset.frame) {                                  // 📷 사진 틀 (js/frame.js)
                    item.fr = el.dataset.frame;
                    if (el.dataset.caption) item.cp = el.dataset.caption;
                }
                if (textarea) {
                    if (el.dataset.paper) item.pp = el.dataset.paper;            // 📝 글상자 모양 (js/paper.js)
                    if (el.dataset.tk) { item.tk = el.dataset.tk; item.tb = slimEnc(el.dataset.tkSrc); }   // 🧻 떡메 메모 : 종류 + 그림 그대로 (js/leafpad.js)
                    const fid = fontIdOf(textarea.dataset.font);
                    if (fid !== 'sys') item.f = fid;
                    if ((textarea.dataset.color || DEFAULT_TEXT_COLOR) !== DEFAULT_TEXT_COLOR) item.k = textarea.dataset.color;
                    const fs = parseInt(textarea.dataset.size) || DEFAULT_TEXT_SIZE;
                    if (fs !== DEFAULT_TEXT_SIZE) item.fs = fs;
                    if (textarea.dataset.hl) item.hl = textarea.dataset.hl;      // ✏️ 📒 형광펜으로 칠한 메모 (js/draw.js mhl)
                    if (textarea.dataset.pn) item.pn = 1;                        // ✏️ 📒 색연필 느낌 글씨
                }
                elementsData.push(item);
            });

            const ps = getPageSize();
            const dayKey = getDateKey(currentDate);
            if (!drive.guest && !drive.loadedDays.has(dayKey)) {     // 아직 읽지 못한 날짜는 저장 금지 (빈 화면으로 덮어쓰기 방지)
                if (showAlert) showMsg('⏳ 이 날짜를 아직 드라이브에서 불러오는 중이에요.<br>잠시 후 다시 저장해 주세요.');
                return;
            }
            const day = { v: 3, pw: ps.w, ph: ps.h, i: elementsData };
            if (pageStamps.mo) day.mo = pageStamps.mo;                          // 😊 오늘의 기분 · ☀️ 날씨 도장 (js/stamp.js)
            if (pageStamps.we) day.we = pageStamps.we;
            const lfDef = (window.dkLeafOf && dkLeafOf(currentDate)) || 'line';   // 📓 만든 노트는 페이지마다 정해 둔 내지가 기본 (js/dymaker.js)
            if (typeof pageLeaf !== 'undefined' && pageLeaf !== lfDef) { day.lf = pageLeaf; if (pageLeaf === 'my') day.lfi = pageLeafImg; }   // 📃 속지 (js/leafpad.js · 기본 내지는 저장 안 함)
            const has = !!(elementsData.length || day.mo || day.we || day.lf);
            if (has) store.setItem(dayKey, JSON.stringify(day));
            else store.removeItem(dayKey);   // 빈 페이지는 파일에 남기지 않음
            if (window.dkMark) dkMark(dayKey, has);                             // 📕 유한 다이어리 : 장을 처음 꾸민 날 (js/skins.js)
            if (typeof searchTouch === 'function') searchTouch(dayKey);          // 🔍 검색 목록 고치기 (js/search.js)

            if (!showAlert) return;          // 자동 저장: 변경이 있으면 잠시 뒤 드라이브에 자동 업로드
            if (drive.guest || !drive.ready) {
                showMsg('⚠ 구글 드라이브에 연결되어 있지 않아 웹에 저장되지 않았어요.<br>왼쪽 아래 ☁ 표시를 눌러 로그인해 주세요.<br><span style="font-size:12px;color:#777;">사진으로 남기려면 💾 저장 → 🖼 내 기기에 사진(PNG)으로 저장을 눌러 주세요.</span>');
                return;
            }
            saveBusy(drive.local ? '📁 저장 중…' : '☁ 저장 중…');
            let ok = false;
            try { ok = await flushUpload({ force: true }); } finally { await saveBusy(false); }   // 파일이 없으면 생성, 있으면 덮어쓰기
            if (drive.local) { showMsg(ok ? '📁 ' + dvWhere() + '에 저장했어요!<br><span style="font-size:12px;color:#777;">' + dayPathText(currentDate) + '</span>' : '⚠ 폴더에 저장하지 못했어요.<br>잠시 후 자동으로 다시 시도합니다.'); return; }   // 📁 (js/devsave.js)
            showMsg(ok
                ? '☁ 구글 드라이브에 저장했어요!<br><span style="font-size:12px;color:#777;">' + dayPathText(currentDate) + '</span>'
                : '⚠ 구글 드라이브 저장에 실패했어요.<br>잠시 후 자동으로 다시 시도합니다.');
        }

        function createElementFromData(data, interactive) {
            const el = document.createElement('div');
            el.className = 'element-box';
            if (data.width) el.style.width = data.width;
            if (data.height) el.style.height = data.height;

            if (data.type === 'text') {
                const ta = document.createElement('textarea');
                ta.value = data.content || '';
                if (!interactive) ta.readOnly = true;
                styleTextarea(ta, data.fontFamily || SYSTEM_FONT, data.color, data.fontSize);   // 글씨체가 정해지지 않은 메모 = 기기 기본 폰트
                el.appendChild(ta);
                if (data.paper && /^[a-z]{1,10}$/.test(data.paper)) { el.classList.add('pp-' + data.paper); el.dataset.paper = data.paper; }
                if (data.tk && data.tb && window.tkNoteDress) tkNoteDress(el, data.tk, data.tb);
                if (window.mhlLook) mhlLook(ta, data.hl, data.pn);             // ✏️ 📒 형광펜 띠 · 색연필 글씨 (js/draw.js)
            } else if (data.type === 'doll') {
                buildPlacedDoll(el, data.content, interactive);                // 👧 붙인 인형 (js/doll-room.js)
            } else if (data.type === 'image') {
                const img = document.createElement('img');
                bindImage(img, data.content);
                el.appendChild(img);
                if (data.float) el.dataset.float = 1;
                if (data.ts) el.dataset.ts = 1;
                if (data.bgp) el.dataset.bgp = 1;
                if (data.cm && window.cmvDress) cmvDress(el, img, data.cm);    // 🪄 움직이는 캐릭터 (js/char-move.js) : 그림 위에 움직이는 캔버스를 겹쳐요
                else if (data.sh && window.glrDress) glrDress(el, img, data.sh); // ✨ 셰이더 스티커 (js/glrun.js) : 그림 위에 움직이는 캔버스를 겹쳐요
                if (data.frame && /^[a-z0-9]{1,10}$/.test(data.frame)) {
                    el.classList.add('fr-' + data.frame); el.dataset.frame = data.frame;
                    if (data.caption) el.dataset.caption = String(data.caption).slice(0, 40);
                }
            } else {
                const span = document.createElement('span');
                span.style.cssText = 'font-size:45px; display:inline-block;';
                span.textContent = data.content;
                el.appendChild(span);
            }

            if (interactive) makeTransformable(el);

            if (data.bs === 'l' || data.bs === 'r') el.dataset.bs = data.bs;
            if (data.ph && /^[\d.,|-]{1,800}$/.test(data.ph)) { el.dataset.ph = data.ph; if (window.bdPhPaint) bdPhPaint(el); }
            el.dataset.posX = data.posX || 0;
            el.dataset.posY = data.posY || 0;
            el.dataset.scale = data.scale || 1;
            el.dataset.rotation = data.rotation || 0;
            el.style.transform = `translate(${data.posX || 0}px, ${data.posY || 0}px) scale(${data.scale || 1}) rotate(${data.rotation || 0}deg)`;

            const z = parseInt(data.zIndex) || 1;
            el.style.zIndex = z;
            if (interactive) { zIndexCounter = Math.max(zIndexCounter, z + 1); if (z > Z_MAX) setTimeout(zRoom, 0); }
            return el;
        }

        function setCanvasLoading(on) {
            const c = document.getElementById('canvasArea');
            c.style.pointerEvents = on ? 'none' : '';
            if (on) c.innerHTML = '<div class="cv-loading">☁ 불러오는 중…</div>';
        }

        function loadData() {
            if (window.dkSync) dkSync();                                        // 📕 고른 다이어리와 펼친 장이 맞게 (js/skins.js)
            liveSize = getPageSize();
            clearCanvas();
            pageStamps.mo = ''; pageStamps.we = '';
            if (typeof psRender === 'function') psRender();
            if (typeof setPageLeaf === 'function') setPageLeaf((window.dkLeafOf && dkLeafOf(currentDate)) || 'line');
            const canvas = document.getElementById('canvasArea');
            const key = getDateKey(currentDate);
            /* 아직 드라이브에서 읽지 못한 날짜라면 읽어 온 뒤에 표시 (빈 화면으로 덮어쓰는 사고 방지) */
            if (!drive.guest && !drive.loadedDays.has(key)) {
                setCanvasLoading(true);
                ensureDayLoaded(currentDate).then(ok => {
                    if (getDateKey(currentDate) !== key) return;    // 그 사이 다른 날짜로 넘어감
                    if (ok) { loadData(); return; }
                    setCanvasLoading(false);
                    showMsg('⚠ 이 날짜의 일기를 불러오지 못했어요.<br><span style="font-size:12px;color:#777;">데이터 보호를 위해 이 날짜는 저장되지 않아요.<br>왼쪽 아래 ☁ 표시를 확인하거나 다른 날짜로 넘겼다가 다시 돌아와 주세요.</span>');
                });
                return;
            }
            setCanvasLoading(false);
            readDayData(currentDate).forEach(data => {
                canvas.appendChild(createElementFromData(data, true));
            });
            let raw = null; try { raw = JSON.parse(store.getItem(key)); } catch (e) {}
            pageStamps.mo = raw && raw.mo || ''; pageStamps.we = raw && raw.we || '';
            if (typeof psRender === 'function') psRender();
            if (typeof setPageLeaf === 'function') setPageLeaf((raw && raw.lf) || (window.dkLeafOf && dkLeafOf(currentDate)) || 'line', raw && raw.lfi);  // 📃 그날 속지 (js/leafpad.js) · 📓 없으면 만든 노트의 내지 (js/dymaker.js)
            if (typeof ddRefresh === 'function') ddRefresh();               // ⏳ 이 페이지 날짜 기준 D-day (js/dday.js)
            if (window.bdAfterLoad) bdAfterLoad();                          // 🗂 바인더 : 불러온 꾸밈도 바로 그 쪽 자리로 (js/skins.js)
        }
        const pageStamps = { mo: '', we: '' };            // 지금 페이지의 기분 · 날씨 도장

        /* ✍ 쓰거나 옮기고 손을 떼면 1.5초 뒤 화면 → 메모리 (그 3초 뒤 드라이브에 · js/drive.js)
           → 앱이 갑자기 꺼져도 잃는 게 적고, 다른 기기에도 금방 보여요
           - 바뀐 게 없으면 메모리 값이 같아서 드라이브에 올리지 않아요 · 아직 못 읽은 날짜는 saveData 가 저장하지 않아요 */
        let pageQuickTimer = 0;
        function pageQuickSave() {
            if (typeof isCoverOpen === 'undefined' || !isCoverOpen) return;
            clearTimeout(pageQuickTimer);
            pageQuickTimer = setTimeout(() => { try { if (isCoverOpen && !turn) saveData(false); } catch (e) { console.warn(e); } }, 1500);
        }
        ['input', 'change', 'pointerup', 'keyup'].forEach(t => document.addEventListener(t, pageQuickSave, true));

        function clearCanvas() { document.getElementById('canvasArea').innerHTML = ''; }


        /* =====================================================================
           💾 저장 버튼 : 어떤 저장을 할지 고르는 창
           - ☁ 웹에 저장      : 구글 드라이브에 저장 (다른 기기에서도 이어서 보기) → saveData(true)
           - 🖼 기기에 PNG 저장 : 지금 페이지를 사진 파일로 컴퓨터·폰에 내려받기 → exportToPNG()
           ===================================================================== */
        function openSaveChooser() {
            if (!isCoverOpen) { showMsg('먼저 다이어리를 열어주세요!'); return; }
            const web = document.getElementById('saveWebDesc');
            const L = !!drive.local, set = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };   // 📁 폴더(하드)로 쓰면 '폴더에 저장' (js/devsave.js)
            set('saveWebIcon', L ? '📁' : '☁');
            set('saveWebTitle', L ? '폴더에 저장 (이 기기)' : '웹에 저장 (구글 드라이브)');
            set('saveChooserNote', L ? '※ 일기는 쓰는 동안 몇 초마다 폴더에 자동 저장돼요.' : '※ 일기는 쓰는 동안 몇 초마다 웹에 자동 저장돼요.');
            if (web) web.textContent = L ? '이 기기 폴더에 저장해요. 기기를 바꿀 땐 ⚙ 설정 → 📦 백업 파일 받기.' : drive.ready && !drive.guest
                ? '내 구글 드라이브에 저장해요. 다른 기기에서 로그인해도 이어서 볼 수 있어요.'
                : '⚠ 지금은 로그인되어 있지 않아서 웹에 저장할 수 없어요.';
            openModal('saveChooser');
        }
        function chooseSave(kind) {
            closeModal('saveChooser');
            if (kind === 'web') saveData(true);
            if (kind === 'png') { saveBusy('🖼 사진으로 저장 중…'); setTimeout(() => { let p = null; try { p = exportToPNG(); } catch (e) { console.warn('PNG', e); showMsg('⚠ PNG 저장에 실패했습니다.'); } if (!p) saveBusy(false); }, 60); }   // 끝나면 js/settings.js 가 saveBusy(false)
        }
        /* 💾 저장 중 (도련 10-19 · 페이지 팝업메뉴 저장) : 하얀 바탕 · 화면 가운데 · 너무 빨리 끝나도 잠깐은 보여요 */
        let saveBusyAt = 0;
        function saveBusy(t) {
            let b = document.getElementById('saveBusy');
            if (t) {
                if (!b) { b = document.createElement('div'); b.id = 'saveBusy'; b.className = 'save-busy'; document.body.appendChild(b); }
                b.textContent = t; b.classList.add('on'); saveBusyAt = Date.now(); return Promise.resolve();
            }
            const wait = Math.max(0, 600 - (Date.now() - saveBusyAt));
            return new Promise(r => setTimeout(() => { if (b) b.classList.remove('on'); r(); }, wait));
        }
        window.saveBusy = saveBusy;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['elements'] = true;
