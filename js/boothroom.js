/* 말랑달콤 다이어리 - js/boothroom.js
   📸 포토부스 거리 (도련 11-08 · 🚪 이동 → 📸 포토부스)
   - 길에서 본 포토부스(img/booth-street.webp) → 포토부스 쪽으로 다가가요 (그림이 커지며) → 포토부스 앞 (img/booth.webp · 뒤 = 같은 길 그림을 크게 · 살짝 흐리게)
   - 위 간판 = 📟 LED 전광판 (1990 ~ 2000년대 초 · 촘촘한 점 · 한 칸씩 툭툭 흐르는 글 · 가끔 깜빡 · 캔버스)
   - 왼쪽 화면 = 📺 옛 브라운관 (노이즈 · 주사선 · 위에서 아래로 흐르는 약한 줄 · 가끔 화면이 덜컥 · 색 번짐 · 캔버스)
   - 커튼 톡 = 📸 포토부스 (js/photobooth.js openBooth · 찍기 · 모양 · 스티커로) · 💻 PC = 카메라가 있는 📱 폰 · 📲 패드에서 해요 안내 (도련 11-08)
   - 그림 자리는 포토부스 그림(829 × 1348) px · 길 그림(1536 × 1024)의 포토부스 = BS_STREET
   - 닫기 없이 '이동' (data-place="booth" · body.bth-on · js/desk.js deskHere · deskLeave) */
    (function () {
        const BS_W = 829, BS_H = 1348;                                          // 포토부스 그림
        const ST_W = 1536, ST_H = 1024, BS_STREET = [631, 292, 934, 752];        // 길 그림 · 그 속 포토부스 [왼 · 위 · 오른 · 아래]
        const BS_SIGN = [142, 17, 689, 159], BS_TV = [57, 353, 217, 733], BS_CURTAIN = [240, 245, 694, 912], BS_LAMP = [243, 997];   // 간판 안쪽 · 화면 안쪽 · 커튼 · 출력구 옆 동그라미
        const IMG_V = '?v=20261009-1237';
        const B = { on: false, busy: false, raf: 0, t0: 0, led: null, tv: null };
        const bq = id => document.getElementById(id);
        const quiet = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
        const camOk = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) || matchMedia('(pointer: coarse)').matches;   // 📷 화면 안 카메라로 찍기 = 📱 📲 (아이패드는 맥처럼 보여서 터치로)

        function build() {
            let el = bq('bthRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'bthRoom'; el.className = 'bth-room';
            el.innerHTML = `<img class="bth-bg" src="img/booth-street.webp${IMG_V}" alt="" draggable="false">
                <div class="bth-booth" id="bthBooth">
                    <img class="bth-pic" src="img/booth.webp${IMG_V}" alt="포토부스" draggable="false">
                    <canvas class="bth-led" id="bthLed" aria-label="PHOTOBOOTH 전광판"></canvas>
                    <div class="bth-tv"><canvas id="bthTv"></canvas></div>
                    <i class="bth-lamp" id="bthLamp"></i>
                    <button type="button" class="bth-curtain" id="bthCurtain" aria-label="커튼을 열고 들어가기"><span class="bth-hint">📸 커튼을 톡!</span></button>
                </div>
                <button type="button" class="bth-go desk-shop-go" onclick="deskMoveOpen()">이동</button>`;
            document.body.appendChild(el);
            bq('bthCurtain').onclick = enter;
            addEventListener('resize', () => { if (B.on) fit(); });
            return el;
        }
        /* 📐 포토부스 = 화면 가운데 · 뒤 길 그림 = 그 속 포토부스가 앞 포토부스와 겹치게 (다가가는 연출이 그대로 이어져요) */
        function layout() {
            const vw = innerWidth, vh = innerHeight, H = Math.min(vh * .86, vw * .92 * BS_H / BS_W), W = H * BS_W / BS_H;
            const x = (vw - W) / 2, y = (vh - H) / 2 + Math.min(18, vh * .02);
            const s = H / (BS_STREET[3] - BS_STREET[1]), cx = (BS_STREET[0] + BS_STREET[2]) / 2, cy = (BS_STREET[1] + BS_STREET[3]) / 2;
            return { x, y, W, H, k: W / BS_W, bg: { s, x: x + W / 2 - cx * s, y: y + H / 2 - cy * s } };
        }
        const box = (r, k) => ({ left: r[0] * k + 'px', top: r[1] * k + 'px', width: (r[2] - r[0]) * k + 'px', height: (r[3] - r[1]) * k + 'px' });
        function fit() {
            const el = bq('bthRoom'); if (!el) return; const L = layout(), dpr = Math.min(2, devicePixelRatio || 1);
            Object.assign(el.querySelector('.bth-bg').style, { width: ST_W * L.bg.s + 'px', height: ST_H * L.bg.s + 'px', left: L.bg.x + 'px', top: L.bg.y + 'px' });
            Object.assign(bq('bthBooth').style, { left: L.x + 'px', top: L.y + 'px', width: L.W + 'px', height: L.H + 'px' });
            const led = bq('bthLed'); Object.assign(led.style, box(BS_SIGN, L.k));
            led.width = Math.round((BS_SIGN[2] - BS_SIGN[0]) * L.k * dpr); led.height = Math.round((BS_SIGN[3] - BS_SIGN[1]) * L.k * dpr); B.led = null;
            const tv = bq('bthTv'); Object.assign(tv.parentNode.style, box(BS_TV, L.k));
            tv.width = Math.round((BS_TV[2] - BS_TV[0]) * L.k * dpr); tv.height = Math.round((BS_TV[3] - BS_TV[1]) * L.k * dpr); B.tv = null;
            Object.assign(bq('bthCurtain').style, box(BS_CURTAIN, L.k));
            Object.assign(bq('bthLamp').style, { left: BS_LAMP[0] * L.k + 'px', top: BS_LAMP[1] * L.k + 'px', width: 16 * L.k + 'px', height: 16 * L.k + 'px' });
        }

        /* ---------- 📟 LED 전광판 : 점 하나하나 (켜짐 = 빛 번짐 · 꺼짐 = 어두운 점) · 글은 한 칸씩 툭툭 ---------- */
        const LED_MSG = [['★ ', '#3dff7a'], ['PHOTOBOOTH', '#ff4a5e'], [' ★ ', '#3dff7a'], ['말랑달콤 인생네컷', '#ffb21e'], [' ♥ ', '#ff4a5e'], ['오늘의 나를 스티커로', '#ffb21e'], [' ★ ', '#3dff7a'], ['4CUT', '#ff4a5e'], ['   ', '#000']];
        const LED_ROWS = 18;                                                     // 글 16줄 + 위아래 한 줄씩
        function ledPrep(cv) {
            const pitch = cv.height / LED_ROWS, cols = Math.max(20, Math.floor(cv.width / pitch)), ox = (cv.width - cols * pitch) / 2;
            const src = document.createElement('canvas'), g = src.getContext('2d'), font = '700 15px "Jua", "Noto Sans KR", sans-serif';
            g.font = font; const w = Math.ceil(LED_MSG.reduce((a, [t]) => a + g.measureText(t).width, 0)) + 2;
            src.width = w; src.height = 16; g.font = font; g.textBaseline = 'middle';
            let x = 0; LED_MSG.forEach(([t, c]) => { g.fillStyle = c; g.fillText(t, x, 8.5); x += g.measureText(t).width; });
            const d = g.getImageData(0, 0, w, 16).data, bits = [];                 // 글 그림 → 켜진 점 (반 넘게 칠해진 칸만 · 색 = 빨강 · 주황 · 초록 셋 중 가까운 것)
            const PAL = ['#ff4a5e', '#ffb21e', '#3dff7a'], rgb = PAL.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));
            for (let cx = 0; cx < w; cx++) { const col = []; for (let r = 0; r < 16; r++) { const i = (r * w + cx) * 4; if (d[i + 3] > 120) { let b = 0, bd = 1e9; rgb.forEach((p, j) => { const dd = (p[0] - d[i]) ** 2 + (p[1] - d[i + 1]) ** 2 + (p[2] - d[i + 2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); col.push(b + 1); } else col.push(0); } bits.push(col); }
            const sprite = c => { const s = document.createElement('canvas'), z = Math.ceil(pitch * 3); s.width = s.height = z; const q = s.getContext('2d'), m = z / 2;
                const gr = q.createRadialGradient(m, m, 0, m, m, m); gr.addColorStop(0, c + 'cc'); gr.addColorStop(.25, c + '55'); gr.addColorStop(1, c + '00'); q.fillStyle = gr; q.fillRect(0, 0, z, z);   // 빛 번짐
                q.fillStyle = c; q.beginPath(); q.arc(m, m, pitch * .36, 0, 7); q.fill(); q.fillStyle = '#fff8'; q.beginPath(); q.arc(m - pitch * .08, m - pitch * .1, pitch * .13, 0, 7); q.fill(); return s; };
            const noise = Array.from({ length: cols * LED_ROWS }, () => .82 + Math.random() * .18);   // 점마다 밝기가 조금씩 (옛 LED)
            return { pitch, cols, ox, bits, sp: PAL.map(sprite), noise, step: 0, last: 0, mode: 'run', mt: 0 };
        }
        function ledDraw(now) {
            const cv = bq('bthLed'); if (!cv || !cv.width) return; const g = cv.getContext('2d');
            const L = B.led || (B.led = ledPrep(cv)), P = L.pitch, n = L.bits.length;
            if (now - L.last > 55) { L.last = now; L.step++;                       // 툭툭 한 칸씩 (부드럽게 흐르지 않아요)
                if (L.mode === 'run' && L.step % (n + L.cols) === 0) { L.mode = 'flash'; L.mt = now; } }
            if (L.mode === 'flash' && now - L.mt > 1900) { L.mode = 'run'; L.step = 0; }
            g.fillStyle = '#140a0d'; g.fillRect(0, 0, cv.width, cv.height);
            const flashOn = L.mode === 'flash' && Math.floor((now - L.mt) / 260) % 2 === 0;
            const lit = (c, r) => {                                               // 이 점에 켜질 색 (0 = 꺼짐)
                if (L.mode === 'flash') return flashOn ? flashPat(L, c, r) : 0;
                if (r < 1 || r > 16) return 0;
                const i = c + L.step - L.cols; return i >= 0 && i < n ? L.bits[i][r - 1] : 0;
            };
            for (let c = 0; c < L.cols; c++) for (let r = 0; r < LED_ROWS; r++) {
                const x = L.ox + (c + .5) * P, y = (r + .5) * P, v = lit(c, r);
                if (v) { g.globalAlpha = L.noise[c * LED_ROWS + r] * (Math.random() < .002 ? .4 : 1); g.drawImage(L.sp[v - 1], x - L.sp[0].width / 2, y - L.sp[0].width / 2); g.globalAlpha = 1; }
                else { g.fillStyle = '#3a1c22'; g.beginPath(); g.arc(x, y, P * .3, 0, 7); g.fill(); }
            }
        }
        /* ✨ 한 바퀴 돈 뒤 = '♥ 찰칵 ♥' 이 가운데서 깜빡깜빡 (그 시절 전광판처럼) */
        function flashPat(L, c, r) {
            if (!L.fl) { const s = document.createElement('canvas'), g = s.getContext('2d'), f = '700 15px "Jua", "Noto Sans KR", sans-serif'; g.font = f; const t = '♥ 찰칵! ♥', w = Math.ceil(g.measureText(t).width) + 2; s.width = w; s.height = 16; g.font = f; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(t, 1, 8.5);
                const d = g.getImageData(0, 0, w, 16).data; L.fl = { w, on: (x, y) => d[(y * w + x) * 4 + 3] > 120 }; }
            const x = c - Math.floor((L.cols - L.fl.w) / 2), y = r - 1; if (x < 0 || x >= L.fl.w || y < 0 || y > 15) return 0;
            return L.fl.on(x, y) ? (x < L.fl.w / 3 || x > L.fl.w * 2 / 3 ? 1 : 2) : 0;
        }

        /* ---------- 📺 옛 브라운관 : 장면을 작게 그려 크게 늘리고 → 주사선 · 노이즈 · 흐르는 줄 · 색 번짐 · 가끔 덜컥 ---------- */
        const TV_SLIDES = [
            g => { tvBg(g, '#ffb3c6', '#ff7aa2'); tvTxt(g, '인생', 30, '#fff', 74); tvTxt(g, '네컷', 30, '#fff', 104); tvTxt(g, 'with 말랑달콤', 9, '#ffe9f0', 128); tvStrip(g, 40, 140); },
            g => { tvBg(g, '#2b2a6b', '#5d3f8f'); tvTxt(g, '♥', 26, '#ff7aa2', 66); tvTxt(g, '4 CUT', 22, '#ffe680', 100); tvTxt(g, 'PHOTO', 13, '#fff', 124); tvTxt(g, 'STICKER', 13, '#fff', 140); },
            g => { tvBg(g, '#c6f2df', '#7fd3b0'); tvTxt(g, '커튼을', 15, '#2f6b55', 70); tvTxt(g, '열고', 15, '#2f6b55', 90); tvTxt(g, '들어오세요', 15, '#2f6b55', 110); tvTxt(g, '▼', 14, '#ff6b8b', 136); },
            g => { tvBg(g, '#ffe9a0', '#ffc24d'); tvTxt(g, '찍고', 17, '#8a4b10', 64); tvTxt(g, '꾸미고', 17, '#8a4b10', 88); tvTxt(g, '스티커로!', 17, '#c8457a', 112); tvTxt(g, '★ ★ ★', 10, '#fff', 136); }
        ];
        const TV_W = 80, TV_H = 190;                                            // 작게 그려서 (그 시절 화질) 늘려요
        function tvBg(g, a, b) { const gr = g.createLinearGradient(0, 0, 0, TV_H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, TV_W, TV_H); }
        function tvTxt(g, t, s, c, y) { g.font = `700 ${s}px "Jua", "Noto Sans KR", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#0005'; g.fillText(t, TV_W / 2 + 1, y + 1); g.fillStyle = c; g.fillText(t, TV_W / 2, y); }
        function tvStrip(g, x, y) { g.fillStyle = '#fff'; g.fillRect(x - 8, y, 16, 40); g.fillStyle = '#ffb3c6'; for (let i = 0; i < 4; i++) g.fillRect(x - 6, y + 2 + i * 9.5, 12, 8); }
        function tvPrep() {
            const src = document.createElement('canvas'); src.width = TV_W; src.height = TV_H;
            const nz = document.createElement('canvas'); nz.width = TV_W; nz.height = TV_H;
            return { src, nz, slide: 0, st: 0, glitch: 0, roll: 0 };
        }
        function tvDraw(now) {
            const cv = bq('bthTv'); if (!cv || !cv.width) return; const g = cv.getContext('2d'), T = B.tv || (B.tv = tvPrep()), W = cv.width, H = cv.height;
            if (now - T.st > 3200) { T.st = now; T.slide = (T.slide + 1) % TV_SLIDES.length; T.glitch = now; }   // 장면이 바뀔 때 = 화면이 덜컥 (채널 돌리듯)
            const sg = T.src.getContext('2d'); TV_SLIDES[T.slide](sg);
            const ng = T.nz.getContext('2d'), id = ng.createImageData(TV_W, TV_H), d = id.data;   // ▒ 노이즈
            for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() < .5 ? 34 : 0; }
            ng.putImageData(id, 0, 0);
            const gl = now - T.glitch < 380, jump = gl ? Math.round((Math.random() - .5) * H * .25) : 0;   // 덜컥 = 화면이 위아래로 튀어요
            g.imageSmoothingEnabled = true; g.fillStyle = '#0c0a10'; g.fillRect(0, 0, W, H);
            const band = H / 24;
            for (let y = 0; y < H; y += band) {                                   // 줄마다 조금씩 옆으로 (수평이 안 맞는 느낌)
                const wob = Math.sin(now / 260 + y * .05) * (gl ? W * .06 : W * .006), sy = ((y + jump) % H + H) % H;
                g.drawImage(T.src, 0, sy / H * TV_H, TV_W, band / H * TV_H, wob, y, W, band + 1);
            }
            g.globalCompositeOperation = 'screen'; g.globalAlpha = .35;           // 🌈 색 번짐 (빨강 · 파랑이 살짝 어긋나요)
            g.drawImage(cv, W * .012, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
            g.globalAlpha = gl ? .55 : .3; g.drawImage(T.nz, 0, 0, W, H); g.globalAlpha = 1;   // ▒ 노이즈
            T.roll = (now / 28) % (H * 1.6);                                       // ⬇ 위에서 아래로 흐르는 약한 줄
            const ry = T.roll - H * .3, gr = g.createLinearGradient(0, ry, 0, ry + H * .3);
            gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.13)'); gr.addColorStop(.56, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = gr; g.fillRect(0, ry, W, H * .3);
            g.fillStyle = 'rgba(0,0,0,.28)'; const sl = Math.max(2, Math.round(H / 140)); for (let y = 0; y < H; y += sl * 2) g.fillRect(0, y, W, sl);   // ═ 주사선
            g.fillStyle = `rgba(255,240,250,${.03 + Math.random() * .04})`; g.fillRect(0, 0, W, H);   // 화면이 미세하게 깜빡
        }
        function loop(now) {
            if (!B.on) { B.raf = 0; return; }
            if (now - B.t0 > 33) { B.t0 = now; ledDraw(now); tvDraw(now); }      // 초당 30번이면 충분 (옛 화면)
            B.raf = requestAnimationFrame(loop);
        }

        /* ---------- 🚶 길 → 포토부스 앞 ---------- */
        function approach(done) {
            if (quiet()) { done(); return; }
            let d = bq('bthWalk');
            if (!d) { d = document.createElement('div'); d.id = 'bthWalk'; d.className = 'bth-walk'; d.innerHTML = `<img src="img/booth-street.webp${IMG_V}" alt="" draggable="false">`; document.body.appendChild(d); }
            const img = d.querySelector('img'), I = coverFit(ST_W, ST_H, [560, 1000, 260, 800]), F = layout().bg, k = F.s / I.s;
            Object.assign(img.style, { width: ST_W * I.s + 'px', height: ST_H * I.s + 'px', left: I.x + 'px', top: I.y + 'px', transition: 'none', transform: 'none' });
            d.classList.remove('leave'); d.classList.add('on');
            const go = () => {
                img.style.transition = 'transform 1.5s cubic-bezier(.45, 0, .2, 1)';
                img.style.transform = `translate(${F.x - I.x}px, ${F.y - I.y}px) scale(${k})`;   // 그 속 포토부스가 앞 포토부스 자리로 (원점 = 그림 왼쪽 위)
                setTimeout(() => { done(); d.classList.add('leave'); setTimeout(() => d.classList.remove('on', 'leave'), 650); }, 1450);
            };
            const start = () => setTimeout(go, 650);                              // 길을 잠깐 보여 주고
            if (img.complete) start(); else img.addEventListener('load', start, { once: true });
        }
        function openBoothPlace() {
            if (B.busy) return;
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            const el = build(); B.busy = true;
            const show = () => { B.on = true; el.classList.add('show'); document.body.classList.add('bth-on'); fit(); B.busy = false; if (!B.raf) B.raf = requestAnimationFrame(loop); };
            fit(); approach(show);
        }
        function closeBoothPlace() {
            const el = bq('bthRoom'); if (!el || !el.classList.contains('show')) return;
            B.on = false; el.classList.remove('show'); document.body.classList.remove('bth-on');
            if (window.closeBooth) closeBooth();
        }
        /* 👆 커튼 = 들어가기 · 💻 PC 는 안내만 (카메라가 있는 폰 · 패드에서 · 도련 11-08) */
        function enter() {
            if (!camOk()) { if (window.showMsg) showMsg('📸 포토부스는 <b>카메라가 있는 📱 폰 · 📲 패드</b>에서 찍을 수 있어요.<br><span style="font-size:12px;color:#777;">폰이나 패드로 말랑달콤에 들어와 커튼을 열어 보세요</span>'); return; }
            const el = bq('bthRoom'); el.classList.add('in');                     // 커튼 쪽으로 쏙 (어두워지며)
            setTimeout(() => { if (window.openBooth) openBooth(); else if (window.comingSoon) comingSoon('📸 포토부스'); setTimeout(() => el.classList.remove('in'), 300); }, quiet() ? 0 : 420);
        }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && B.on && !document.querySelector('.modal[style*="flex"]') && !(bq('boothRoom') && bq('boothRoom').classList.contains('show'))) { if (window.deskGoRoom) deskGoRoom(); else closeBoothPlace(); } });
        window.openBoothPlace = openBoothPlace; window.closeBoothPlace = closeBoothPlace;
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['boothroom'] = true;
