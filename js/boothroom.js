/* 말랑달콤 다이어리 - js/boothroom.js
   📸 포토부스 (도련 11-08 · 🚪 이동 → 📸 포토부스)
   ▶ 앞 (#bthRoom)
     - 길에서 본 포토부스(img/booth-street.webp) → 캡슐기계 · 벽 달력처럼 포토부스 쪽으로 빨려 들어가며 빛 → 포토부스 앞 (뒤에서 미리 열어 둬요)
     - 포토부스 그림(img/booth.webp · 바탕 없이) + 뒤 배경 = 그림이 아니라 css 로 따로 (벽 · 바닥 · 불빛 · 장식) → 철마다 바꾸기 쉽게 (BTH_THEME · data-th · css/boothroom.css '🎨 배경 테마')
     - 위 간판 = 📟 LED 전광판 (1990~2000년대 · 점 하나하나 · 한 칸씩 툭툭) · 왼쪽 = 📺 옛 브라운관 (노이즈 · 주사선 · 흐르는 줄 · 덜컥) · 출력구 옆 💡 깜빡
     - 커튼 톡 = 포토부스 안으로 (📱 📲 = 📷 카메라 · 🖼️ 앨범 중 고르기 · 💻 PC = 🖼️ 앨범에서 사진 고르기 · 도련 11-08)
   ▶ 안 (#bthIn · 창이 아니라 화면 전체 = 부스 안에 들어온 느낌)
     - 위 = 렌즈 · 플래시 · 단계 LED / 가운데 = 화면 / 아래 = 아날로그 버튼 ◀ ● ▶
     - ① 프레임 (네컷 · 2×2 · 한 컷) → ② 프레임 색 → ③ 찍기 (3 · 2 · 1 찰칵 · 번쩍) → ④ 확인 (다시 찍기 · 인쇄)
   ▶ 인쇄 = 밖으로 나와 출력구에서 사진이 찌이익 (점점 현상) → 주변이 흐려지며 사진이 정면에 → 🏷️ 씰스티커로 저장 (🗄️ 서랍 · 씰 보관함 · 알려 줘요)
   - 그림 자리는 포토부스 그림(829 × 1348) px · 닫기 없이 '이동' (data-place="booth" · body.bth-on · js/desk.js deskHere · deskLeave) */
    (function () {
        const BS_W = 829, BS_H = 1348;                                          // 포토부스 그림
        const ST_W = 1536, ST_H = 1024, ST_BOOTH = [782, 522];                  // 길 그림 · 그 속 포토부스 가운데
        const STM_W = 941, STM_H = 1672, STM_BOOTH = [468, 960];                // 📱 세로 길 그림 (img/booth-street-m.webp · 도련 11-09) · 그 속 포토부스 가운데
        const BS_SIGN = [142, 17, 689, 159], BS_TV = [57, 353, 217, 733], BS_CURTAIN = [240, 245, 694, 912], BS_LAMP = [243, 997], BS_SLOT = [88, 999, 200, 1051];   // 간판 안쪽 · 화면 안쪽 · 커튼 · 출력구 옆 동그라미 · 출력구 구멍
        const IMG_V = '?v=20261009-1237';
        /* 🎨 배경 테마 = css/boothroom.css 의 [data-th="이름"] (벽 · 바닥 · 불빛 · 장식) · 새 테마 = css 한 덩어리 + 여기 이름만 바꾸면 돼요 (예 크리스마스 'xmas') */
        const BTH_THEME = () => 'base';
        const B = { on: false, busy: false, raf: 0, t0: 0, led: null, tv: null };
        const bq = id => document.getElementById(id);
        const quiet = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
        const camOk = () => window.__bthCam || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) || matchMedia('(pointer: coarse)').matches;   // 📷 화면 안 카메라 = 📱 📲 (아이패드는 맥처럼 보여서 터치로)

        function build() {
            let el = bq('bthRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'bthRoom'; el.className = 'bth-room';
            el.innerHTML = `<div class="bth-set" aria-hidden="true"><i class="bth-wall"></i><i class="bth-floor"></i><i class="bth-glow"></i><i class="bth-deco"></i></div>
                <div class="bth-booth" id="bthBooth">
                    <img class="bth-pic" src="img/booth.webp${IMG_V}" alt="포토부스" draggable="false">
                    <canvas class="bth-led" id="bthLed" aria-label="PHOTOBOOTH 전광판"></canvas>
                    <div class="bth-tv"><canvas id="bthTv"></canvas></div>
                    <i class="bth-lamp" id="bthLamp"></i>
                    <div class="bth-out" id="bthOut"><img alt="" draggable="false"></div>
                    <button type="button" class="bth-curtain" id="bthCurtain" aria-label="커튼을 열고 들어가기"><span class="bth-hint">📸 커튼을 톡!</span></button>
                </div>
                <button type="button" class="bth-go desk-shop-go" onclick="deskMoveOpen()">이동</button>
                <div class="bth-focus" id="bthFocus" hidden><div class="bth-card"><img id="bthFocusImg" alt="찍은 사진"><p id="bthFocusTx"></p><button type="button" class="bth-okb" id="bthFocusOk">확인</button></div></div>`;
            document.body.appendChild(el);
            bq('bthCurtain').onclick = enter;
            bq('bthFocusOk').onclick = focusOff; bq('bthFocusOk').addEventListener('pointerup', focusOff);   // 👆 터치 기기에서 클릭이 늦거나 빠져도 손을 떼면 바로
            bq('bthFocus').addEventListener('click', e => { if (!e.target.closest('.bth-card')) focusOff(); });   // 사진 바깥을 눌러도 닫혀요
            addEventListener('resize', () => { if (B.on) fit(); if (I.on) inFit(); });
            return el;
        }
        /* 📐 포토부스 = 화면 가운데 · 바닥(css 배경)에 서 있어요 */
        function layout() {
            const vw = innerWidth, vh = innerHeight, H = Math.min(vh * .84, vw * .92 * BS_H / BS_W), W = H * BS_W / BS_H;
            const floor = vh * .8, y = Math.min(floor + vh * .1, vh - 6) - H;        // 바닥 위에 (발이 바닥선 아래로 조금)
            return { x: (vw - W) / 2, y: Math.max(8, y), W, H, k: W / BS_W, floor };
        }
        const box = (r, k) => ({ left: r[0] * k + 'px', top: r[1] * k + 'px', width: (r[2] - r[0]) * k + 'px', height: (r[3] - r[1]) * k + 'px' });
        function fit() {
            const el = bq('bthRoom'); if (!el) return; const L = layout(), dpr = Math.min(2, devicePixelRatio || 1);
            el.style.setProperty('--floor', L.floor + 'px'); el.style.setProperty('--bx', (L.x + L.W / 2) + 'px'); el.style.setProperty('--bw', L.W + 'px');
            Object.assign(bq('bthBooth').style, { left: L.x + 'px', top: L.y + 'px', width: L.W + 'px', height: L.H + 'px' });
            const led = bq('bthLed'); Object.assign(led.style, box(BS_SIGN, L.k));
            led.width = Math.round((BS_SIGN[2] - BS_SIGN[0]) * L.k * dpr); led.height = Math.round((BS_SIGN[3] - BS_SIGN[1]) * L.k * dpr); B.led = null;
            const tv = bq('bthTv'); Object.assign(tv.parentNode.style, box(BS_TV, L.k));
            tv.width = Math.round((BS_TV[2] - BS_TV[0]) * L.k * dpr); tv.height = Math.round((BS_TV[3] - BS_TV[1]) * L.k * dpr); B.tv = null;
            Object.assign(bq('bthCurtain').style, box(BS_CURTAIN, L.k));
            Object.assign(bq('bthLamp').style, { left: BS_LAMP[0] * L.k + 'px', top: BS_LAMP[1] * L.k + 'px', width: 16 * L.k + 'px', height: 16 * L.k + 'px' });
            const sx = (BS_SLOT[0] + BS_SLOT[2]) / 2 * L.k, sw = (BS_SLOT[2] - BS_SLOT[0]) * L.k;   // 🖨 출력구 = 구멍 가운데 · 구멍 높이 가운데부터 아래로 (위는 잘려요 = 구멍 속)
            Object.assign(bq('bthOut').style, { left: sx - sw * .42 + 'px', top: (BS_SLOT[1] + BS_SLOT[3]) / 2 * L.k + 'px', width: sw * .84 + 'px' });
        }

        /* ---------- 📟 LED 전광판 : 점 하나하나 (켜짐 = 빛 번짐 · 꺼짐 = 어두운 점) · 글은 한 칸씩 툭툭 ---------- */
        const LED_MSG = [['★ ', '#3dff7a'], ['PHOTOBOOTH', '#ff4a5e'], [' ★ ', '#3dff7a'], ['말랑달콤 인생네컷', '#ffb21e'], [' ♥ ', '#ff4a5e'], ['오늘의 나를 스티커로', '#ffb21e'], [' ★ ', '#3dff7a'], ['4CUT', '#ff4a5e'], ['   ', '#000']];
        const LED_ROWS = 18;                                                     // 글 16줄 + 위아래 한 줄씩
        const LED_FONT = '700 15px "Jua", "Noto Sans KR", sans-serif';
        function textBits(msg) {                                                // 글 그림 → 켜진 점 (반 넘게 칠해진 칸 · 색 = 빨강 · 주황 · 초록 셋 중 가까운 것)
            const src = document.createElement('canvas'), g = src.getContext('2d'); g.font = LED_FONT;
            const w = Math.ceil(msg.reduce((a, [t]) => a + g.measureText(t).width, 0)) + 2;
            src.width = w; src.height = 16; g.font = LED_FONT; g.textBaseline = 'middle';
            let x = 0; msg.forEach(([t, c]) => { g.fillStyle = c; g.fillText(t, x, 8.5); x += g.measureText(t).width; });
            const d = g.getImageData(0, 0, w, 16).data, bits = [], P = [[255, 74, 94], [255, 178, 30], [61, 255, 122]];
            for (let cx = 0; cx < w; cx++) { const col = []; for (let r = 0; r < 16; r++) { const i = (r * w + cx) * 4; if (d[i + 3] > 120) { let b = 0, bd = 1e9; P.forEach((p, j) => { const dd = (p[0] - d[i]) ** 2 + (p[1] - d[i + 1]) ** 2 + (p[2] - d[i + 2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); col.push(b + 1); } else col.push(0); } bits.push(col); }
            return bits;
        }
        function ledPrep(cv) {
            const pitch = cv.height / LED_ROWS, cols = Math.max(20, Math.floor(cv.width / pitch)), ox = (cv.width - cols * pitch) / 2;
            const sprite = c => { const s = document.createElement('canvas'), z = Math.ceil(pitch * 3); s.width = s.height = z; const q = s.getContext('2d'), m = z / 2;
                const gr = q.createRadialGradient(m, m, 0, m, m, m); gr.addColorStop(0, c + 'cc'); gr.addColorStop(.25, c + '55'); gr.addColorStop(1, c + '00'); q.fillStyle = gr; q.fillRect(0, 0, z, z);   // 빛 번짐
                q.fillStyle = c; q.beginPath(); q.arc(m, m, pitch * .36, 0, 7); q.fill(); q.fillStyle = '#fff8'; q.beginPath(); q.arc(m - pitch * .08, m - pitch * .1, pitch * .13, 0, 7); q.fill(); return s; };
            const fl = textBits([['♥ ', '#ff4a5e'], ['찰칵!', '#ffb21e'], [' ♥', '#ff4a5e']]);
            return { pitch, cols, ox, bits: textBits(LED_MSG), fl, sp: ['#ff4a5e', '#ffb21e', '#3dff7a'].map(sprite), noise: Array.from({ length: cols * LED_ROWS }, () => .82 + Math.random() * .18), step: 0, last: 0, mode: 'run', mt: 0 };
        }
        function ledDraw(now) {
            const cv = bq('bthLed'); if (!cv || !cv.width) return; const g = cv.getContext('2d');
            const L = B.led || (B.led = ledPrep(cv)), P = L.pitch, n = L.bits.length;
            if (now - L.last > 55) { L.last = now; L.step++; if (L.mode === 'run' && L.step % (n + L.cols) === 0) { L.mode = 'flash'; L.mt = now; } }   // 툭툭 한 칸씩 · 한 바퀴 뒤 '♥ 찰칵! ♥' 깜빡
            if (L.mode === 'flash' && now - L.mt > 1900) { L.mode = 'run'; L.step = 0; }
            g.fillStyle = '#140a0d'; g.fillRect(0, 0, cv.width, cv.height);
            const flashOn = L.mode === 'flash' && Math.floor((now - L.mt) / 260) % 2 === 0, fx0 = Math.floor((L.cols - L.fl.length) / 2);
            for (let c = 0; c < L.cols; c++) for (let r = 0; r < LED_ROWS; r++) {
                let v = 0;
                if (r >= 1 && r <= 16) { if (L.mode === 'flash') { const i = c - fx0; v = flashOn && i >= 0 && i < L.fl.length ? L.fl[i][r - 1] : 0; } else { const i = c + L.step - L.cols; v = i >= 0 && i < n ? L.bits[i][r - 1] : 0; } }
                const x = L.ox + (c + .5) * P, y = (r + .5) * P;
                if (v) { g.globalAlpha = L.noise[c * LED_ROWS + r] * (Math.random() < .002 ? .4 : 1); g.drawImage(L.sp[v - 1], x - L.sp[0].width / 2, y - L.sp[0].width / 2); g.globalAlpha = 1; }
                else { g.fillStyle = '#3a1c22'; g.beginPath(); g.arc(x, y, P * .3, 0, 7); g.fill(); }
            }
        }

        /* ---------- 📺 옛 브라운관 : 작게 그려 크게 늘리고 → 주사선 · 노이즈 · 흐르는 줄 · 색 번짐 · 가끔 덜컥 ---------- */
        const TV_W = 80, TV_H = 190;
        const TV_SLIDES = [
            g => { tvBg(g, '#ffb3c6', '#ff7aa2'); tvTxt(g, '인생', 30, '#fff', 74); tvTxt(g, '네컷', 30, '#fff', 104); tvTxt(g, 'with 말랑달콤', 9, '#ffe9f0', 128); },
            g => { tvBg(g, '#2b2a6b', '#5d3f8f'); tvTxt(g, '♥', 26, '#ff7aa2', 66); tvTxt(g, '4 CUT', 22, '#ffe680', 100); tvTxt(g, 'PHOTO', 13, '#fff', 124); tvTxt(g, 'STICKER', 13, '#fff', 140); },
            g => { tvBg(g, '#c6f2df', '#7fd3b0'); tvTxt(g, '커튼을', 15, '#2f6b55', 70); tvTxt(g, '열고', 15, '#2f6b55', 90); tvTxt(g, '들어오세요', 15, '#2f6b55', 110); tvTxt(g, '▼', 14, '#ff6b8b', 136); },
            g => { tvBg(g, '#ffe9a0', '#ffc24d'); tvTxt(g, '찍고', 17, '#8a4b10', 64); tvTxt(g, '꾸미고', 17, '#8a4b10', 88); tvTxt(g, '스티커로!', 17, '#c8457a', 112); tvTxt(g, '★ ★ ★', 10, '#fff', 136); }
        ];
        function tvBg(g, a, b) { const gr = g.createLinearGradient(0, 0, 0, TV_H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, TV_W, TV_H); }
        function tvTxt(g, t, s, c, y) { g.font = `700 ${s}px "Jua", "Noto Sans KR", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#0005'; g.fillText(t, TV_W / 2 + 1, y + 1); g.fillStyle = c; g.fillText(t, TV_W / 2, y); }
        function tvPrep() { const mk = () => { const c = document.createElement('canvas'); c.width = TV_W; c.height = TV_H; return c; }; return { src: mk(), nz: mk(), slide: 0, st: 0, glitch: 0 }; }
        function crt(g, W, H, now, src, T, glitchOn, soft) {                    // 📺 같은 브라운관 효과 (밖 화면 · 안 화면 함께 · soft = 안 화면은 글이 잘 읽히게 살짝만)
            const jump = glitchOn ? Math.round((Math.random() - .5) * H * .25) : 0, band = H / 24, sw = src.width, sh = src.height;
            g.fillStyle = '#0c0a10'; g.fillRect(0, 0, W, H);
            for (let y = 0; y < H; y += band) { const wob = soft ? 0 : Math.sin(now / 260 + y * .05) * (glitchOn ? W * .06 : W * .006), sy = ((y + jump) % H + H) % H; g.drawImage(src, 0, sy / H * sh, sw, band / H * sh, wob, y, W, band + 1); }   // 줄마다 조금씩 옆으로
            g.globalCompositeOperation = 'screen'; g.globalAlpha = soft ? .12 : .3; g.drawImage(g.canvas, W * (soft ? .004 : .01), 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';   // 🌈 색 번짐
            const ng = T.nz.getContext('2d'), id = ng.createImageData(T.nz.width, T.nz.height), d = id.data;   // ▒ 노이즈
            for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.random() < .5 ? 34 : 0; }
            ng.putImageData(id, 0, 0); g.globalAlpha = glitchOn ? .55 : soft ? .1 : .26; g.drawImage(T.nz, 0, 0, W, H); g.globalAlpha = 1;
            const ry = (now / 28) % (H * 1.6) - H * .3, gr = g.createLinearGradient(0, ry, 0, ry + H * .3);   // ⬇ 위에서 아래로 흐르는 약한 줄
            gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.12)'); gr.addColorStop(.56, 'rgba(0,0,0,.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, ry, W, H * .3);
            g.fillStyle = soft ? 'rgba(0,0,0,.12)' : 'rgba(0,0,0,.26)'; const sl = Math.max(2, Math.round(H / (soft ? 220 : 140))); for (let y = 0; y < H; y += sl * 2) g.fillRect(0, y, W, sl);   // ═ 주사선
            g.fillStyle = `rgba(255,240,250,${.03 + Math.random() * .04})`; g.fillRect(0, 0, W, H);
        }
        function tvDraw(now) {
            const cv = bq('bthTv'); if (!cv || !cv.width) return; const T = B.tv || (B.tv = tvPrep());
            if (now - T.st > 3200) { T.st = now; T.slide = (T.slide + 1) % TV_SLIDES.length; T.glitch = now; }   // 장면이 바뀔 때 = 덜컥 (채널 돌리듯)
            TV_SLIDES[T.slide](T.src.getContext('2d'));
            crt(cv.getContext('2d'), cv.width, cv.height, now, T.src, T, now - T.glitch < 380);
        }
        function loop(now) {
            if (!B.on && !I.on) { B.raf = 0; return; }
            if (now - B.t0 > 33) { B.t0 = now; if (B.on && !I.on) { ledDraw(now); tvDraw(now); } if (I.on) inDraw(now); }   // 초당 30번 (옛 화면)
            B.raf = requestAnimationFrame(loop);
        }
        const run = () => { if (!B.raf) B.raf = requestAnimationFrame(loop); };

        /* ---------- 🚶 길 → 포토부스 앞 (캡슐기계 · 벽 달력과 같은 연출 : 포토부스 쪽으로 빨려 들어가며 빛 · 뒤에서 미리 열어 둬요) ---------- */
        let walkBusy = false;
        function approach() {
            if (walkBusy || quiet()) return;
            let d = bq('bthWalk');
            if (!d) { d = document.createElement('div'); d.id = 'bthWalk'; d.className = 'bth-walk'; d.innerHTML = `<div class="bth-walk-in"><img alt="" draggable="false"></div>`; document.body.appendChild(d); }
            walkBusy = true;
            const ph = UI.tall(), W = ph ? STM_W : ST_W, H = ph ? STM_H : ST_H, P = ph ? STM_BOOTH : ST_BOOTH;   // 📱 세로 길 그림 (도련 11-09)
            const im = d.querySelector('img'), src = (ph ? 'img/booth-street-m.webp?v=20261009-1042' : 'img/booth-street.webp' + IMG_V);
            if (im.getAttribute('src') !== src) im.setAttribute('src', src);
            const { s, x, y } = ph ? coverFit(W, H, [280, 660, 660, 1260]) : coverFit(ST_W, ST_H, [560, 1000, 260, 800]);
            Object.assign(im.style, { width: W * s + 'px', height: H * s + 'px', left: x + 'px', top: y + 'px' });
            const ox = x + P[0] * s, oy = y + P[1] * s, inn = d.querySelector('.bth-walk-in');
            inn.style.transformOrigin = `${ox}px ${oy}px`; inn.style.setProperty('--lx', ox + 'px'); inn.style.setProperty('--ly', oy + 'px');
            d.classList.remove('go', 'leave'); d.classList.add('on');
            const go = () => { d.classList.add('go'); setTimeout(() => { d.classList.add('leave'); setTimeout(() => { d.classList.remove('on', 'go', 'leave'); walkBusy = false; }, 400); }, 1700); };
            const img = d.querySelector('img'), start = () => setTimeout(go, 700);   // 길을 잠깐 보여 주고
            if (img.complete) start(); else img.addEventListener('load', start, { once: true });
        }
        function openBoothPlace() {
            if (B.on) return;
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            approach();
            const el = build(); el.dataset.th = BTH_THEME();
            B.on = true; el.classList.add('show'); document.body.classList.add('bth-on'); fit(); run();
        }
        function closeBoothPlace() {
            const el = bq('bthRoom'); if (!el || !el.classList.contains('show')) return;
            inClose(true); focusOff();
            B.on = false; el.classList.remove('show'); document.body.classList.remove('bth-on');
        }
        function enter() {
            if (I.on || P.busy) return;
            const el = bq('bthRoom'); el.classList.add('in');                     // 커튼 쪽으로 쏙 (어두워지며)
            setTimeout(() => { inOpen(); setTimeout(() => el.classList.remove('in'), 300); }, quiet() ? 0 : 420);
        }

        /* =================== 🎞 포토부스 안 =================== */
        const LAYOUTS = [
            { id: 'strip', name: '네컷', n: 4, w: 400, slot: [360, 270], cols: 1, gap: 14, pad: 20, foot: 92 },
            { id: 'grid', name: '2×2', n: 4, w: 600, slot: [270, 300], cols: 2, gap: 14, pad: 22, foot: 80 },
            { id: 'one', name: '한 컷', n: 1, w: 500, slot: [456, 456], cols: 1, gap: 0, pad: 22, foot: 96 }
        ];
        const COLORS = [['핑크', '#ffc2d4', '#ff6b8b'], ['하늘', '#bfe3ff', '#3d8fd6'], ['민트', '#c6f2df', '#2f9a6a'], ['라벤더', '#e3d6ff', '#7a5ad0'], ['버터', '#fff1b0', '#b8860b'], ['블랙', '#2b2b2b', '#ffffff'], ['화이트', '#ffffff', '#5a3d4a'], ['체크', '#ffe0ea', '#ff6b8b']];
        const STEP_TX = { frame: ['STEP 1', '프레임'], color: ['STEP 2', '프레임 색'], src: ['STEP 3', '사진'], pick: ['STEP 3', '사진 고르기'], more: ['STEP 3', '사진 고르기'], ready: ['STEP 3', '찍기'], shoot: ['STEP 3', '찍는 중'], check: ['STEP 4', '확인'], nocam: ['ERROR', '카메라'] };
        const I = { on: false, st: 'frame', lay: 0, col: 0, shots: [], stream: null, count: '', msg: '', out: '', busy: false, scr: null, via: 'cam', sel: 0, picks: [] };
        /* 📷 사진 = 📱 📲 는 고르기 (📷 카메라 · 🖼️ 앨범) · 💻 PC 는 🖼️ 앨범 (도련 11-08) */

        function inBuild() {
            let el = bq('bthIn'); if (el) return el;
            el = document.createElement('div'); el.id = 'bthIn'; el.className = 'bin-room';
            el.innerHTML = `<i class="bin-wall" aria-hidden="true"></i>
                <button type="button" class="bin-exit" id="binExit">‹ 커튼 밖으로</button>
                <div class="bin-mach">
                    <div class="bin-top"><i class="bin-flash-bar"></i><i class="bin-lens"><b></b></i><i class="bin-flash-bar"></i></div>
                    <div class="bin-led"><b id="binStepA"></b><span id="binStepB"></span></div>
                    <div class="bin-screen"><canvas id="binScr"></canvas><i class="bin-glass"></i></div>
                    <div class="bin-panel">
                        <div class="bin-bt"><button type="button" class="bin-b side" id="binL" aria-label="이전">◀</button><small id="binLt"></small></div>
                        <div class="bin-bt"><button type="button" class="bin-b ok" id="binOk" aria-label="선택"><i></i></button><small id="binOt"></small></div>
                        <div class="bin-bt"><button type="button" class="bin-b side" id="binR" aria-label="다음">▶</button><small id="binRt"></small></div>
                    </div>
                    <div class="bin-plate">MALANG PHOTO · SINCE 1999</div>
                </div>
                <video id="binCam" playsinline muted autoplay></video>
                <div class="bin-flash" id="binFlash"></div>
                <input type="file" id="binFile" accept="image/*" multiple hidden>`;
            document.body.appendChild(el);
            bq('binL').onclick = () => inKey('L'); bq('binR').onclick = () => inKey('R'); bq('binOk').onclick = () => inKey('OK');
            bq('binExit').onclick = () => inClose();
            bq('binFile').onchange = e => { const f = [...(e.target.files || [])].filter(x => /^image\//.test(x.type) || /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(x.name)); e.target.value = ''; if (f.length) picked(f); };
            return el;
        }
        function inFit() { const c = bq('binScr'); if (!c) return; const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); I.scr = null; }
        function inOpen() {
            const el = inBuild(); Object.assign(I, { on: true, st: 'frame', shots: [], out: '', count: '', msg: '', busy: false, picks: [], sel: 0 });
            const room = bq('bthRoom'); if (room) room.classList.remove('in');     // 커튼 쪽 어둠은 안에 들어오면 바로 걷어요
            el.classList.add('show'); document.body.classList.add('bin-on'); requestAnimationFrame(inFit); inPaint(); run();
        }
        function inClose(now) {
            const el = bq('bthIn'); camStop(); I.on = false; I.busy = false; I.picks = [];
            const room = bq('bthRoom'); if (room) room.classList.remove('in');     // 🌑 커튼 밖으로 = 부스 그림이 늘 밝게 (도련 11-08 : 검은 막이 남지 않게)
            if (!el) return;
            if (now || quiet()) { el.classList.remove('show', 'bye'); document.body.classList.remove('bin-on'); return; }
            el.classList.add('bye'); setTimeout(() => { el.classList.remove('show', 'bye'); document.body.classList.remove('bin-on'); }, 380);   // 커튼 밖으로 = 스르르
        }
        function inPaint() {                                                    // 단계 LED · 버튼 아래 글
            const [a, b] = STEP_TX[I.st] || ['', '']; bq('binStepA').textContent = a; bq('binStepB').textContent = b;
            const T = { frame: ['이전', '선택', '다음'], color: ['이전', '선택', '다음'], src: ['카메라', '선택', '앨범'], pick: ['이전', '사진 고르기', ''], more: ['처음부터', '더 고르기', '이대로 채우기'], ready: ['', '찍기 시작', ''], shoot: ['', '', ''], check: [I.via === 'album' ? '다시 고르기' : '다시 찍기', '인쇄하기', ''], nocam: ['앨범', '나가기', ''] }[I.st] || ['', '', ''];
            ['binLt', 'binOt', 'binRt'].forEach((id, i) => { bq(id).textContent = T[i]; });
            bq('binL').disabled = !T[0] || I.busy; bq('binR').disabled = !T[2] || I.busy; bq('binOk').disabled = !T[1] || I.busy;
        }
        function beep(f, d, type) { try { if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(sndOut()); o.start(t); o.stop(t + d + .02); } catch (e) {} }   // 🔊 삑 (✨ 연출 소리를 끄면 조용히)
        function inKey(k) {
            if (I.busy) return; beep(k === 'OK' ? 880 : 620, .07);
            if (I.st === 'frame') { if (k === 'L') I.lay = (I.lay + LAYOUTS.length - 1) % LAYOUTS.length; else if (k === 'R') I.lay = (I.lay + 1) % LAYOUTS.length; else I.st = 'color'; }
            else if (I.st === 'color') { if (k === 'L') I.col = (I.col + COLORS.length - 1) % COLORS.length; else if (k === 'R') I.col = (I.col + 1) % COLORS.length; else if (camOk()) { I.st = 'src'; } else pick(); }   // 💻 = 바로 앨범
            else if (I.st === 'src') { if (k === 'L') I.sel = 0; else if (k === 'R') I.sel = 1; else if (I.sel) pick(); else { I.via = 'cam'; camGo(); } }
            else if (I.st === 'pick') { if (k === 'L') I.st = camOk() ? 'src' : 'color'; else if (k === 'OK') pick(); }
            else if (I.st === 'more') { if (k === 'L') { I.picks = []; pick(); } else if (k === 'OK') pick(true); else if (k === 'R') fillGo(); }
            else if (I.st === 'ready' && k === 'OK') shoot();
            else if (I.st === 'check') { if (k === 'L') { I.shots = []; I.out = ''; if (I.via === 'album') { I.picks = []; pick(); } else camGo(); } else if (k === 'OK') print(); }
            else if (I.st === 'nocam') { if (k === 'OK') inClose(); else if (k === 'L') pick(); }
            inPaint();
        }
        /* 🖼️ 앨범에서 고르기 (도련 11-08) : 프레임 칸 수만큼 · 넘치면 알려 줘요 · 모자라면 [더 고르기] / [이대로 채우기] (고른 사진을 돌려 가며 채워요)
           사진은 이 기기 안에서만 (어디에도 보내지 않아요) · 큰 사진은 1600px 로 줄여 둬요 */
        function pick(more) {
            camStop(); I.via = 'album'; if (!more) I.picks = [];
            I.st = I.picks.length ? 'more' : 'pick'; I.msg = ''; inPaint();
            const f = bq('binFile'); f.multiple = true; f.click();                   // 버튼을 누른 그 순간에 열어요 (📱 이 막지 않게)
        }
        const loadPic = file => new Promise(res => {
            const url = URL.createObjectURL(file), im = new Image();
            im.onload = () => { const k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c); };
            im.onerror = () => { URL.revokeObjectURL(url); res(null); }; im.src = url;
        });
        async function picked(files) {
            if (!I.on) return; const L = LAYOUTS[I.lay], N = L.n, left = N - I.picks.length;
            if (N === 1 && files.length > 1) { if (window.showMsg) showMsg('🖼️ <b>한 컷</b> 프레임에는 사진이 <b>한 장</b>만 들어가요.<br>한 장만 골라 주세요.'); return; }
            if (files.length > left) { if (window.showMsg) showMsg(`🖼️ <b>${L.name}</b> 프레임에는 사진이 <b>${N}장</b> 들어가요.<br>${I.picks.length ? `지금 ${I.picks.length}장을 골랐으니 <b>${left}장</b>까지 더 골라 주세요.` : `<b>${N}장</b>까지 골라 주세요.`}`); return; }
            I.busy = true; I.msg = '사진을 불러오는 중…'; inPaint();
            const got = (await Promise.all(files.map(loadPic))).filter(Boolean); I.busy = false; I.msg = '';
            if (!I.on) return;
            if (!got.length) { inPaint(); if (window.showMsg) showMsg('사진을 열 수 없어요. 다른 사진을 골라 주세요.'); return; }
            I.picks = I.picks.concat(got);
            if (I.picks.length >= N) { I.shots = I.picks.slice(0, N); I.out = compose(); I.st = 'check'; }
            else I.st = 'more';
            I.scr = null; inPaint();
        }
        function fillGo() {                                                     // 이대로 채우기 = 고른 사진을 차례로 돌려 가며 (1장이면 모든 칸 같은 사진)
            const N = LAYOUTS[I.lay].n; if (!I.picks.length) return;
            I.shots = Array.from({ length: N }, (_, i) => I.picks[i % I.picks.length]); I.out = compose(); I.st = 'check'; I.scr = null; inPaint();
        }
        /* 📷 카메라 (앞 카메라 · 거울처럼 · 영상은 이 기기 안에서만 · 어디에도 보내지 않아요) */
        async function camGo() {
            I.via = 'cam'; I.st = 'ready'; I.msg = '카메라를 켜는 중…'; inPaint();
            if (!I.stream) {
                try { I.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }); }
                catch (e) { I.st = 'nocam'; I.msg = ''; inPaint(); return; }
                if (!I.on) { camStop(); return; }
                const v = bq('binCam'); v.srcObject = I.stream; try { await v.play(); } catch (e) {}
            }
            I.msg = ''; inPaint();
        }
        function camStop() { if (I.stream) { I.stream.getTracks().forEach(t => t.stop()); I.stream = null; } const v = bq('binCam'); if (v) v.srcObject = null; }
        const wait = ms => new Promise(r => setTimeout(r, ms));
        async function shoot() {                                                // 3 · 2 · 1 → 찰칵 (컷 수만큼)
            const L = LAYOUTS[I.lay], v = bq('binCam'); I.st = 'shoot'; I.busy = true; I.shots = []; inPaint();
            for (let i = 0; i < L.n && I.on; i++) {
                for (const n of ['3', '2', '1']) { I.count = n; beep(n === '1' ? 990 : 740, .12); await wait(800); if (!I.on) return; }
                I.count = ''; const c = document.createElement('canvas'), vw = v.videoWidth || 640, vh = v.videoHeight || 480; c.width = vw; c.height = vh;
                const g = c.getContext('2d'); g.translate(vw, 0); g.scale(-1, 1); g.drawImage(v, 0, 0, vw, vh);   // 거울처럼
                I.shots.push(c); flash(); beep(1500, .05, 'triangle');
                I.msg = `${i + 1} / ${L.n}`; await wait(900); I.msg = '';
            }
            if (!I.on) return;
            I.out = compose(); I.st = 'check'; I.busy = false; inPaint();
        }
        function flash() { const f = bq('binFlash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
        /* 🖼 합치기 (프레임 색 · 컷 · 아래 글씨 · 반짝이) */
        function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
        function frameCanvas(L, C, shots, ghost) {
            const rows = Math.ceil(L.n / L.cols), W = L.w, H = L.pad * 2 + rows * L.slot[1] + (rows - 1) * L.gap + L.foot;
            const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
            x.fillStyle = C[1]; x.fillRect(0, 0, W, H);
            if (C[0] === '체크') { x.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < W; i += 24) for (let j = 0; j < H; j += 24) if (((i + j) / 24) % 2 === 0) x.fillRect(i, j, 12, 12); }
            const sw = L.slot[0], sh = L.slot[1], x0 = (W - (L.cols * sw + (L.cols - 1) * L.gap)) / 2;
            for (let i = 0; i < L.n; i++) {
                const col = i % L.cols, row = Math.floor(i / L.cols), px = x0 + col * (sw + L.gap), py = L.pad + row * (sh + L.gap), s = shots && shots[i];
                x.save(); rr(x, px, py, sw, sh, 10); x.clip();
                if (s) { const k = Math.max(sw / s.width, sh / s.height), cw = sw / k, ch = sh / k; x.drawImage(s, (s.width - cw) / 2, (s.height - ch) / 2, cw, ch, px, py, sw, sh); x.fillStyle = 'rgba(255,240,245,.08)'; x.fillRect(px, py, sw, sh); }   // 살짝 뽀샤시
                else { x.fillStyle = ghost ? 'rgba(255,255,255,.55)' : '#eee'; x.fillRect(px, py, sw, sh); x.fillStyle = ghost ? 'rgba(0,0,0,.12)' : '#ccc'; x.beginPath(); x.arc(px + sw / 2, py + sh * .42, sh * .16, 0, 7); x.fill(); x.beginPath(); x.ellipse(px + sw / 2, py + sh * .95, sw * .3, sh * .32, 0, Math.PI, 0); x.fill(); }   // 사람 자리 (그림자)
                x.restore();
            }
            const now = new Date(), date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`, fy = H - L.foot;
            x.fillStyle = C[2]; x.textAlign = 'center'; x.font = `bold ${L.id === 'strip' ? 26 : 30}px Jua, "Gowun Dodum", "Noto Sans KR", sans-serif`; x.fillText('말랑달콤 💕', W / 2, fy + L.foot * .48);
            x.font = '15px "Noto Sans KR", sans-serif'; x.globalAlpha = .8; x.fillText(`${date} · 말랑 포토부스`, W / 2, fy + L.foot * .8); x.globalAlpha = 1;
            [[.06, .03], [.94, .05], [.04, .5], [.96, .62], [.1, .97], [.9, .95]].forEach(([a, b], i) => { const cx = a * W, cy = b * H, r = 8 + (i % 3) * 3; x.fillStyle = i % 2 ? '#fff6b8' : '#ffffff'; x.beginPath(); for (let k = 0; k < 8; k++) { const q = k % 2 ? r * .3 : r, an = k * Math.PI / 4; x.lineTo(cx + Math.cos(an) * q, cy + Math.sin(an) * q); } x.closePath(); x.fill(); });   // ✨
            return c;
        }
        const compose = () => frameCanvas(LAYOUTS[I.lay], COLORS[I.col], I.shots).toDataURL('image/jpeg', .88);
        /* 🖥 안 화면 그리기 (그 단계에 맞게 · 마지막에 브라운관 효과를 살짝) */
        function inDraw(now) {
            const cv = bq('binScr'); if (!cv || !cv.width) return; const W = cv.width, H = cv.height, g = cv.getContext('2d');
            const S = I.scr || (I.scr = { src: document.createElement('canvas'), nz: Object.assign(document.createElement('canvas'), { width: 160, height: 120 }), outImg: null, outSrc: '' });
            const s = S.src; if (s.width !== W || s.height !== H) { s.width = W; s.height = H; }   // 안 화면은 글이 또렷하게 (옛 화면 느낌은 효과로만 살짝)
            const x = s.getContext('2d'), w = s.width, h = s.height, L = LAYOUTS[I.lay], C = COLORS[I.col], u = Math.min(w, h) / 100;
            const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2a2350'); bg.addColorStop(1, '#4a2f6e'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
            const txt = (t, size, col, y, al) => { x.font = `700 ${size * u}px Jua, "Noto Sans KR", sans-serif`; x.textAlign = al || 'center'; x.textBaseline = 'middle'; x.fillStyle = '#0008'; x.fillText(t, w / 2 + u * .5, y + u * .5); x.fillStyle = col; x.fillText(t, w / 2, y); };
            const fitDraw = (img, top, bot) => { const ah = h - top - bot, k = Math.min(w * .78 / img.width, ah / img.height), dw = img.width * k, dh = img.height * k; x.drawImage(img, (w - dw) / 2, top + (ah - dh) / 2, dw, dh); return k; };
            const v = bq('binCam'), live = I.stream && v && v.videoWidth;
            if (I.st === 'frame' || I.st === 'color') {
                txt(I.st === 'frame' ? '프레임을 골라요' : '프레임 색을 골라요', 7, '#ffe680', h * .08);
                const fk = I.st + I.lay + '-' + I.col; if (S.fk !== fk) { S.fk = fk; S.fimg = frameCanvas(L, I.st === 'frame' ? ['', '#f3eef7', '#8a7a99'] : C, null, true); }   // 프레임 그림은 바뀔 때만 새로
                fitDraw(S.fimg, h * .15, h * .16);
                txt(I.st === 'frame' ? `◀  ${L.name}  ▶` : `◀  ${C[0]}  ▶`, 8, '#fff', h * .9);
                txt(I.st === 'frame' ? `${I.lay + 1} / ${LAYOUTS.length}` : `${I.col + 1} / ${COLORS.length}`, 4.2, '#c9b8ff', h * .97);
            } else if (I.st === 'src') {                                                // 📷 / 🖼️ 고르기 (◀ ▶ 로 옮기고 ● 로)
                txt('사진을 어떻게 넣을까요?', 6.4, '#ffe680', h * .1);
                [['📷', '카메라로 찍기'], ['🖼️', '앨범에서 고르기']].forEach(([ic, t], i) => {
                    const bw = w * .38, bh = h * .52, bx = w * (i ? .56 : .06), by = h * .22, on = I.sel === i;
                    x.fillStyle = on ? '#ff8fb1' : '#3b3166'; rr(x, bx, by, bw, bh, u * 4); x.fill();
                    x.lineWidth = u * (on ? 1.4 : .8); x.strokeStyle = on ? '#fff' : '#7d6fb0'; x.stroke();
                    x.font = `${18 * u}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(ic, bx + bw / 2, by + bh * .42);
                    x.font = `700 ${5.4 * u}px Jua, "Noto Sans KR", sans-serif`; x.fillStyle = on ? '#fff' : '#cfc4ff'; x.fillText(t, bx + bw / 2, by + bh * .82);
                });
                txt('◀ ▶ 로 고르고 ● 를 눌러요', 4.8, '#fff', h * .87);
            } else if (I.st === 'pick' || I.st === 'more') {                            // 🖼️ 고른 사진이 칸에 (모자라면 빈 칸)
                const fk = 'p' + I.lay + '-' + I.col + '-' + I.picks.length; if (S.fk !== fk) { S.fk = fk; S.fimg = frameCanvas(L, C, I.picks, true); }
                txt(I.msg || (I.st === 'pick' ? `앨범에서 사진 ${L.n}장을 골라요` : `${I.picks.length}장 골랐어요 · 남은 칸 ${L.n - I.picks.length}`), 5.6, '#ffe680', h * .07);
                fitDraw(S.fimg, h * .13, h * .16);
                txt(I.st === 'pick' ? '● 를 누르면 앨범이 열려요' : '● 더 고르기 · ▶ 고른 사진으로 채우기', 4.6, '#fff', h * .91);
            } else if (I.st === 'ready' || I.st === 'shoot') {
                if (live) { const vw = v.videoWidth, vh = v.videoHeight, k = Math.max(w / vw, h / vh); x.save(); x.translate(w, 0); x.scale(-1, 1); x.drawImage(v, (w - vw * k) / 2, (h - vh * k) / 2, vw * k, vh * k); x.restore(); }
                x.strokeStyle = C[1]; x.lineWidth = u * 2.2; rr(x, w * .08, h * .08, w * .84, h * .84, u * 3); x.stroke();   // 프레임 색 테두리 = 찍히는 자리
                if (I.st === 'ready') { txt(I.msg || '● 를 누르면 3초 뒤 찰칵!', 6.4, '#fff', h * .9); txt(`${L.name} · ${C[0]} · ${L.n}컷`, 4.6, '#ffe680', h * .08); }
                if (I.count) { x.font = `700 ${42 * u}px Jua, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = u * 2; x.strokeStyle = '#0009'; x.strokeText(I.count, w / 2, h / 2); x.fillStyle = '#fff'; x.fillText(I.count, w / 2, h / 2); }
                if (I.msg && I.st === 'shoot') txt(`찰칵! ${I.msg}`, 7, '#ffe680', h * .9);
            } else if (I.st === 'check') {
                if (S.outSrc !== I.out) { S.outSrc = I.out; S.outImg = new Image(); S.outImg.src = I.out; }
                txt('어때요? 인쇄할까요?', 6.4, '#ffe680', h * .07);
                if (S.outImg && S.outImg.complete) fitDraw(S.outImg, h * .13, h * .06);
            } else if (I.st === 'nocam') {
                txt('카메라를 켤 수 없어요', 7.4, '#ffb3c6', h * .42); txt('카메라 허용을 확인하거나', 5, '#fff', h * .54); txt('◀ 앨범에서 골라 주세요', 5, '#fff', h * .62);
            }
            crt(g, W, H, now, s, S, false, true);                                          // 📺 같은 옛 화면 느낌 (흐르는 줄 · 주사선 · 노이즈)
        }

        /* =================== 🖨 인쇄 → 출력구에서 찌이익 → 정면에 → 씰스티커로 =================== */
        const P = { busy: false, saved: null };
        function zzz(ms) {                                                      // 🔊 찌이익 (거친 소리를 끊어 끊어 · 연출 소리를 끄면 조용히)
            try {
                if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), t0 = ac.currentTime, len = ms / 1000;
                const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate), d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) { const t = i / ac.sampleRate; d[i] = (Math.random() * 2 - 1) * (0.55 + 0.45 * Math.sign(Math.sin(t * 2 * Math.PI * 24))); }   // 톱니 걸리듯 (초당 24번)
                const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = .8;
                g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.07, t0 + .05); g.gain.setValueAtTime(.07, t0 + len - .1); g.gain.linearRampToValueAtTime(0, t0 + len);
                s.connect(f).connect(g).connect(sndOut()); s.start(t0); s.stop(t0 + len);
            } catch (e) {}
        }
        async function print() {
            if (P.busy || !I.out) return; P.busy = true; const out = I.out;
            I.busy = true; inPaint(); inClose();                                    // 커튼 밖으로 → 출력구를 봐요
            P.saved = (async () => { try { let src = out; if (window.pelBake) { try { src = await pelBake(src); } catch (e) {} } return window.smAdd ? await smAdd(src, 'seal') : 'fail'; } catch (e) { return 'fail'; } })();   // 🏷️ 씰스티커로 (하얀 테두리 · 🗄️ 서랍) · 뒤에서 미리
            const o = bq('bthOut'), img = o.querySelector('img');
            img.src = out; await (img.decode ? img.decode().catch(() => {}) : wait(200));
            o.classList.remove('dev'); o.style.setProperty('--y', '-100%'); o.classList.add('on');
            await wait(quiet() ? 0 : 900);                                          // 기계가 잠깐 웅…
            if (!quiet()) {                                                          // 찌이익 = 조금씩 덜컥덜컥 내려와요
                zzz(2200); o.classList.add('dev');
                for (let p = 0; p <= 1.0001; p += 1 / 26) { o.style.setProperty('--y', (-100 + p * 100) + '%'); await wait(70 + (Math.random() < .2 ? 120 : 0)); }
            } else { o.classList.add('dev'); o.style.setProperty('--y', '0%'); }
            await wait(quiet() ? 0 : 1300);                                         // 현상되는 걸 잠깐 보고
            const r = await P.saved;
            o.classList.remove('on', 'dev');
            focusOn(out, r);
            P.busy = false;
        }
        function focusOn(src, r) {                                             // 주변이 흐려지며 사진이 정면에
            const f = bq('bthFocus'); bq('bthFocusImg').src = src;
            bq('bthFocusTx').innerHTML = r === 'ok' ? '🏷️ <b>씰스티커</b>로 만들었어요!<br><small>🗄️ 서랍의 🏷️ 씰 보관함에 담았어요 · 떼어서 다이어리에 붙여요</small>'
                : '⚠ 씰스티커로 담지 못했어요.<br><small>' + (window.ownErrText && window.smAdd && smAdd.err ? ownErrText(smAdd.err) : '잠시 뒤 다시 찍어 주세요') + '</small>';
            clearTimeout(focusOff.t); f.hidden = false; bq('bthRoom').classList.add('focus'); requestAnimationFrame(() => f.classList.add('on'));
        }
        function focusOff() {                                                  // ✔ 확인 = 흐림을 늘 풀고 원래 모습으로 (도련 11-08 : 흐린 채 남지 않게 · 조건 없이)
            const f = bq('bthFocus'), el = bq('bthRoom'); if (el) el.classList.remove('focus'); if (!f) return;
            f.classList.remove('on'); clearTimeout(focusOff.t); focusOff.t = setTimeout(() => { if (!f.classList.contains('on')) f.hidden = true; }, 300);
        }

        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape' || document.querySelector('.modal[style*="flex"]')) return;
            if (I.on) { if (!I.busy) inClose(); return; }
            if (B.on && !P.busy) { const f = bq('bthFocus'); if (f && !f.hidden) { focusOff(); return; } if (window.deskGoRoom) deskGoRoom(); else closeBoothPlace(); }
        });
        window.openBoothPlace = openBoothPlace; window.closeBoothPlace = closeBoothPlace;
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['boothroom'] = true;
