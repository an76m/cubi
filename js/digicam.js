/* 말랑달콤 다이어리 - js/digicam.js
   📷 말랑 디카 (도련 11-08 · 예전 📷 사진 찍어 만들기를 옛날 디지털카메라로)
   - 책상 위 디카 소품(상품 '기능' camera · js/deskcustom.js dcTap) 톡 → 앞모습 그대로 떠올라 가운데 크게 → 휙 돌아 뒷모습(화면 + 단추)
     ✂️ 스티커 만들기의 📷 사진 찍어 만들기도 여기로 (책상에 보이면 거기서 · 아니면 아래에서 쏙 · 그 종류로)
   - 사진 넣기 : 📱 📲 = 📷 카메라 (화면에 비친 걸 셔터로 찰칵) / 🖼️ 앨범 · 💻 PC = 🖼️ 사진 파일 고르기
   - 사진이 들어오면 화면을 보며 오른쪽 단추로 : ◀ ▶ 모양 · ▲ ▼ (W T) 크기 · 화면을 끌어 자리 (✂️ 손으로 = 화면에 빙 둘러 그리기)
     MENU = 종류 (🏷️ 씰 · 🧩 조각 · 📄 모조지) · 하얀 테두리 (모조지만) · 사진 다시 / DISP = 처음으로 (카메라 = 앞 ↔ 뒤)
   - 셔터 (또는 OK) = 🖨 출력 → 위 틈에서 폴라로이드처럼 사진 한 장이 쓱 (하얗던 필름에 그림이 천천히) → 📌 다이어리에 붙이기 (펴져 있을 때) · 💾 만들기 · 📷 다시 찍기
   - 그림 · 저장 = 예전 사진 스티커와 같아요 (js/stickermaker.js smPhotoApi) · 사진은 이 기기 안에서만 (어디에도 보내지 않아요)
   - 책상 그림(디자인.png) = 이 디카 앞모습을 그대로 찍은 것 (몸통 둘레 3u) · 디카 모습을 바꾸면 책상 그림도 다시 찍어요 */
    (function () {
        const D = { on: false, st: 'home', sel: 0, kind: 'seal', shape: 'circle', zoom: 1, ox: 0, oy: 0, path: [], border: true, img: null,
            stream: null, face: 'environment', menu: -1, mrow: 0, busy: false, src: null, saving: false, drag: null, sm: null, msg: '', msgT: 0 };
        const dq = id => document.getElementById(id);
        const quiet = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
        const api = () => window.smPhotoApi;
        const camOk = () => window.__bthCam || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) || matchMedia('(pointer: coarse)').matches;   // 📱 📲 (아이패드는 맥처럼 보여서 터치로)
        const KINDS = [['seal', '🏷️', '씰'], ['piece', '🧩', '조각'], ['paper', '📄', '모조지']];
        const kindOf = k => KINDS.find(x => x[0] === k) || KINDS[0];
        const shapes = () => api() ? api().shapes : [['circle', '동그라미']];
        const shapeName = s => ((shapes().find(x => x[0] === s) || [, s])[1] || '').replace(/^[^가-힣]+\s*/, '');
        const wait = ms => new Promise(r => setTimeout(r, ms));

        /* ---------- 화면 만들기 (앞모습 · 뒷모습 = 한 장의 앞뒤) ---------- */
        const FRONT = `
            <i class="dcm-top dcm-shut-f"></i><i class="dcm-top dcm-pow-f"></i>
            <div class="dcm-bd"></div>
            <i class="dcm-flash"></i>
            <div class="dcm-lens"><i class="dcm-l1"></i><i class="dcm-l2"></i><i class="dcm-l3"></i></div>   <!-- 렌즈 둘레 영어 글씨는 없앴어요 (도련 11-11 : 한국 다꾸러에게 한글만) -->
            <svg class="dcm-deco" viewBox="0 0 60 60" aria-hidden="true" data-an="1">
              <g stroke="#5b3a46" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
                <path d="M15 8c-3-4-9-1-7 3 1 3 7 6 7 6s6-3 7-6c2-4-4-7-7-3z" fill="#ff8fb1"/>
                <path d="M15 29C9 22 3 24 4 29s7 6 11 1zM15 29c6-7 12-5 11 0s-7 6-11 1z" fill="#fff"/><path d="M14 31l-3 7M16 31l3 7" fill="none"/><circle cx="15" cy="29.6" r="2.4" fill="#ff8fb1"/>
                <path d="M41 6l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#fff"/>
                <path d="M40 40c-4-4-11-1-8 4 2 3 8 7 8 7s6-4 8-7c3-5-4-8-8-4z" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray=".1 2.6" stroke-linecap="round"/>
                <path d="M16 46c-3-3-8 0-6 3 1 2 6 5 6 5s5-3 6-5c2-3-3-6-6-3z" fill="#ffd6e4"/>
                <path d="M49 46c0-4 3-6 6-7M49 46c-2 1-3 4-3 6" fill="none"/><circle cx="46" cy="53" r="3" fill="#ff6b8b"/><circle cx="53" cy="51" r="3" fill="#ff6b8b"/>
              </g>
            </svg>
            <div class="dcm-name"><b>디카</b><small>셀카 스티커 만들기</small></div>`;
        const BACK = `
            <i class="dcm-top dcm-shut" id="dcmShut" data-k="shut" role="button" aria-label="셔터"></i><i class="dcm-top dcm-pow" id="dcmOff" role="button" aria-label="끄기"></i>
            <i class="dcm-slit"></i>
            <div class="dcm-bd"></div>
            <div class="dcm-scr"><canvas id="dcmLcd"></canvas><i class="dcm-pearl a"></i><i class="dcm-pearl b"></i></div>
            <b class="dcm-bname">셀카 스티커 만들기</b>
            <i class="dcm-heart" aria-hidden="true"></i>
            <div class="dcm-spk" aria-hidden="true">${'<i></i>'.repeat(7)}</div>
            <button type="button" class="dcm-k dcm-sm" style="left:69u;top:7u" data-k="W">W</button>
            <button type="button" class="dcm-k dcm-sm" style="left:77u;top:7u" data-k="T">T</button>
            <button type="button" class="dcm-k dcm-sm" style="left:69u;top:15u" data-k="album" aria-label="앨범">▶</button>
            <button type="button" class="dcm-k dcm-sm dcm-rec" style="left:77u;top:15u" data-k="cam" aria-label="카메라"><i></i></button>
            <div class="dcm-pad">
              <button type="button" class="dcm-k dcm-ar u" data-k="U" aria-label="위">▲</button><button type="button" class="dcm-k dcm-ar d" data-k="D" aria-label="아래">▼</button>
              <button type="button" class="dcm-k dcm-ar l" data-k="L" aria-label="왼쪽">◀</button><button type="button" class="dcm-k dcm-ar r" data-k="R" aria-label="오른쪽">▶</button>
              <button type="button" class="dcm-k dcm-ok" data-k="OK">OK</button>
            </div>
            <button type="button" class="dcm-k dcm-wd" style="left:68u;top:51u" data-k="MENU">MENU</button>
            <button type="button" class="dcm-k dcm-wd" style="left:81u;top:51u" data-k="DISP">DISP</button>`;
        function build() {
            let el = dq('dcmRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'dcmRoom'; el.className = 'dcm-room';
            const u = h => h.replace(/(\d+(?:\.\d+)?)u\b/g, 'calc(var(--u) * $1)');
            el.innerHTML = `<div class="dcm-back" id="dcmBack"></div>
                <img class="dcm-fly" id="dcmFly" alt="" draggable="false">
                <div class="dcm-wrap" id="dcmWrap">
                  <div class="dcm-mach" id="dcmMach">
                    <div class="dcm-out" id="dcmOut"><div class="dcm-pol" id="dcmPol"><div class="dcm-film"><img id="dcmPolImg" alt="" draggable="false"><i class="dcm-dev"></i></div><b class="dcm-cap" id="dcmCap"></b></div></div>
                    <div class="dcm-card" id="dcmCard">
                      <div class="dcm-face dcm-front">${FRONT}</div>
                      <div class="dcm-face dcm-rear">${u(BACK)}</div>
                    </div>
                  </div>
                  <div class="dcm-acts" id="dcmActs" hidden>
                    <button type="button" class="dcm-a pk" data-a="stick"></button>
                    <button type="button" class="dcm-a" data-a="keep"></button>
                    <button type="button" class="dcm-a sub" data-a="again">📷 다시 찍기</button>
                  </div>
                </div>
                <video id="dcmCam" playsinline muted autoplay></video>
                <i class="dcm-blink" id="dcmBlink"></i>
                <input type="file" id="dcmFile" accept="image/*" hidden>`;
            document.body.appendChild(el);
            const press = e => { const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 120); key(b.dataset.k); };
            el.querySelector('.dcm-rear').addEventListener('pointerdown', press);
            dq('dcmOff').addEventListener('click', () => close());
            dq('dcmBack').onclick = () => { if (!D.busy) close(); };
            dq('dcmActs').addEventListener('click', e => { const b = e.target.closest('.dcm-a'); if (b) act(b.dataset.a); });
            dq('dcmFile').onchange = e => { const f = (e.target.files || [])[0]; e.target.value = ''; if (f) loadFile(f); };
            const lcd = dq('dcmLcd');
            lcd.addEventListener('pointerdown', lcdDown); lcd.addEventListener('pointermove', lcdMove); lcd.addEventListener('pointerup', lcdUp); lcd.addEventListener('pointercancel', lcdUp);
            lcd.addEventListener('wheel', e => { if (D.st !== 'edit') return; e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.06 : .94); }, { passive: false });
            addEventListener('resize', () => { if (D.on) { fit(); lcdSize(); } });
            return el;
        }
        /* 📐 크기 (--u = 몸통 너비의 1% · 몸통 = 100u × 62u · 위로 사진 나올 자리) */
        function fit() {
            const W = Math.min(innerWidth * .95, 720, (innerHeight - 110) / 1.08), m = dq('dcmMach');
            m.style.setProperty('--u', W / 100 + 'px'); m.style.width = W + 'px';
            return m.getBoundingClientRect();
        }
        function lcdSize() { const c = dq('dcmLcd'); if (!c) return; const r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); c.width = Math.max(10, Math.round(r.width * dpr)); c.height = Math.max(10, Math.round(r.height * dpr)); }

        /* ---------- 🛫 책상에서 떠올라 → 휙 돌아 뒷모습 ---------- */
        const FLY = 560, SWAP = 160, P = 3;                                      // P = 책상 그림의 몸통 둘레 (u)
        const deskImg = el => el && (el.querySelector(':scope > img') || el);
        /* 🛫 진짜 디카가 그대로 날아요 (도련 11-11 : 책상 그림으로 바꿔 끼면 예전 영어 글씨가 잠깐 보였어요) : 책상 그림 칸(S) = 앞모습 + 둘레 P */
        function cardFrom(S, flipX) {
            const c = dq('dcmCard'), R = c.getBoundingClientRect(), w = c.offsetWidth, h = c.offsetHeight, u = w / 100, sx = S.width / (w + 2 * P * u), sy = S.height / (h + 2 * P * u);
            return { t: `${S.left + S.width / 2 - (R.left + R.width / 2)}px ${S.top + S.height / 2 - (R.top + R.height / 2)}px`, s: `${flipX ? -sx : sx} ${sy}` };
        }
        const cardAt = (st, ms) => { const c = dq('dcmCard'); c.style.transition = ms ? `translate ${ms}ms cubic-bezier(.22, .9, .3, 1), scale ${ms}ms cubic-bezier(.22, .9, .3, 1)` : 'none'; c.style.translate = st ? st.t : ''; c.style.scale = st ? st.s : ''; };
        function toCard(S) {
            const c = dq('dcmCard'), R = c.getBoundingClientRect(), w = c.offsetWidth, h = c.offsetHeight, u = w / 100;
            return `translate(${R.left + R.width / 2 - (S.left + S.width / 2)}px, ${R.top + R.height / 2 - (S.top + S.height / 2)}px) scale(${(w + 2 * P * u) / S.width}, ${(h + 2 * P * u) / S.height})`;
        }
        function showNow(w) { w.style.transition = 'none'; w.classList.remove('hide'); void w.offsetWidth; w.style.transition = ''; }
        function hideNow(w) { w.style.transition = 'none'; w.classList.add('hide'); void w.offsetWidth; w.style.transition = ''; }
        function flip(back) { const c = dq('dcmCard'); c.classList.toggle('rear', back); }
        function flipNow(back) { const c = dq('dcmCard'); c.style.transition = 'none'; c.classList.toggle('rear', back); void c.offsetWidth; c.style.transition = ''; }
        function openDigicam(o) {
            o = o || {}; if (D.on) return;
            if (!api()) { if (window.comingSoon) comingSoon('📷 말랑 디카'); return; }
            if (typeof closeModal === 'function') ['stickerToolModal', 'stickerSrcModal', 'moveModal'].forEach(id => { const m = dq(id); if (m && m.style.display === 'flex') closeModal(id); });
            if (window.closeCraft && document.body.classList.contains('craft-on')) closeCraft();
            const room = build(), el = o.el || null;
            Object.assign(D, { on: true, src: el, busy: false, saving: false, menu: -1, msg: '' });
            if (o.kind && kindOf(o.kind)[0] === o.kind) D.kind = o.kind;
            if (!D.img) D.st = 'home';
            room.classList.add('show'); document.body.classList.add('dcm-on');
            dq('dcmActs').hidden = true; dq('dcmOut').className = 'dcm-out';
            fit(); flipNow(false); requestAnimationFrame(lcdSize); run();
            const img = deskImg(el), fly = dq('dcmFly'), wrap = dq('dcmWrap');
            const S = img && img.getBoundingClientRect ? img.getBoundingClientRect() : null;
            const turn = () => setTimeout(() => { if (D.on) { flip(true); setTimeout(lcdSize, 650); } }, quiet() ? 0 : 140);   // 휙 = 뒷모습 (화면 · 단추)
            if (S && S.width > 4 && !quiet()) {
                fly.style.opacity = 0;
                el.style.visibility = 'hidden'; room.classList.remove('lit');
                cardAt(cardFrom(S, el.classList.contains('dk-fl')), 0); showNow(wrap); void dq('dcmCard').offsetWidth;   // 🛫 진짜 디카 (앞모습) 를 책상 자리에 작게
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    room.classList.add('lit'); cardAt(null, FLY);
                    setTimeout(() => { dq('dcmCard').style.transition = ''; if (D.on) turn(); }, FLY);   // 다 뜨면 휙 돌아요
                }));
            } else { fly.style.opacity = 0; showNow(wrap); room.classList.add('lit', 'pop'); setTimeout(() => room.classList.remove('pop'), 500); turn(); }
        }
        /* 🛬 닫기 = 휙 앞모습으로 → 책상 제자리로 */
        function close(after) {
            if (!D.on) return; D.on = false; D.busy = false; camStop(); D.menu = -1;
            const room = dq('dcmRoom'), fly = dq('dcmFly'), wrap = dq('dcmWrap'), el = D.src, img = deskImg(el);
            const done = () => { room.classList.remove('show', 'lit', 'bye'); document.body.classList.remove('dcm-on'); if (el) el.style.visibility = ''; wrap.classList.remove('hide'); flipNow(false); if (after) after(); };
            const S0 = img && el.isConnected ? img.getBoundingClientRect() : null;
            dq('dcmActs').hidden = true;
            if (S0 && S0.width > 4 && !quiet()) {
                flip(false); room.classList.remove('lit');
                setTimeout(() => {
                    const S = img.getBoundingClientRect();
                    cardAt(cardFrom(S, el.classList.contains('dk-fl')), 500);            // 🛬 진짜 디카가 그대로 책상 자리로 (도련 11-11)
                    setTimeout(() => { done(); cardAt(null, 0); }, 520);
                }, 560);
            } else { room.classList.add('bye'); setTimeout(done, quiet() ? 0 : 300); }
        }

        /* ---------- 🔊 소리 (✨ 연출 소리를 끄면 조용히) ---------- */
        function snd(f, d, type, vol) { try { if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(vol || .03, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(sndOut()); o.start(t); o.stop(t + d + .02); } catch (e) {} }
        function noise(ms, freq, vol, chop) {
            try {
                if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), t0 = ac.currentTime, len = ms / 1000;
                const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate), d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) { const t = i / ac.sampleRate; d[i] = (Math.random() * 2 - 1) * (chop ? .5 + .5 * Math.sign(Math.sin(t * 2 * Math.PI * chop)) : Math.exp(-t * 30)); }
                const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
                g.gain.setValueAtTime(vol, t0); g.gain.setValueAtTime(vol, t0 + len - .05); g.gain.linearRampToValueAtTime(0, t0 + len);
                s.connect(f).connect(g).connect(sndOut()); s.start(t0); s.stop(t0 + len);
            } catch (e) {}
        }
        const click = () => { noise(90, 2400, .12); setTimeout(() => noise(70, 1600, .09), 110); };   // 찰-칵
        function say(t, ms) { D.msg = t; clearTimeout(D.msgT); D.msgT = setTimeout(() => { D.msg = ''; }, ms || 1300); }

        /* ---------- 🎛 단추 ---------- */
        function key(k) {
            if (!D.on || D.busy) return;
            snd(k === 'shut' ? 1400 : 1900, .03, 'square', .02);
            if (k === 'shut') return shutter();
            if (D.menu >= 0) return menuKey(k);
            if (k === 'album') return pickFile();
            if (k === 'cam') { if (camOk()) camGo(); else say('📷 카메라는 폰 · 패드에서 · ▶ 사진 고르기', 1800); return; }
            if (D.st === 'home') {
                const opts = homeOpts();
                if (k === 'L' || k === 'U') D.sel = Math.max(0, D.sel - 1); else if (k === 'R' || k === 'D') D.sel = Math.min(opts.length - 1, D.sel + 1);
                else if (k === 'OK') { opts[D.sel][2](); }
                else if (k === 'MENU') openMenu();
            } else if (D.st === 'live') {
                if (k === 'OK') shutter(); else if (k === 'DISP') { D.face = D.face === 'user' ? 'environment' : 'user'; camStop(); camGo(); } else if (k === 'MENU') openMenu(); else if (k === 'L') { camStop(); D.st = 'home'; }
            } else if (D.st === 'edit') {
                const S = shapes(), i = S.findIndex(x => x[0] === D.shape);
                if (k === 'L' || k === 'R') { D.shape = S[(i + (k === 'R' ? 1 : S.length - 1)) % S.length][0]; D.path = []; say(shapeName(D.shape)); }
                else if (k === 'U' || k === 'T') zoomBy(1.08); else if (k === 'D' || k === 'W') zoomBy(1 / 1.08);
                else if (k === 'OK') shutter();
                else if (k === 'MENU') openMenu();
                else if (k === 'DISP') { D.st = 'home'; D.img = null; }
            } else if (D.st === 'done') {
                if (k === 'DISP' || k === 'OK') again();
            }
        }
        function zoomBy(f) { D.zoom = Math.max(.4, Math.min(3, D.zoom * f)); say(`🔍 ${Math.round(D.zoom * 100)}%`, 700); }
        function homeOpts() {
            return camOk() ? [['📷', '카메라로 찍기', camGo], ['🖼️', '앨범에서 고르기', pickFile]] : [['🖼️', '사진 파일 고르기', pickFile]];   // 💻 PC = 사진 파일
        }
        /* MENU = 종류 · 하얀 테두리 · 사진 다시 */
        const menuRows = () => [
            ['종류', `${kindOf(D.kind)[1]} ${kindOf(D.kind)[2]}`, d => { const i = KINDS.findIndex(x => x[0] === D.kind); D.kind = KINDS[(i + d + KINDS.length) % KINDS.length][0]; }],
            ['하얀 테두리', D.kind === 'paper' ? (D.border ? '켬' : '끔') : '늘 켬', d => { if (D.kind === 'paper') D.border = !D.border; }],
            ['모양', shapeName(D.shape), d => { const S = shapes(), i = S.findIndex(x => x[0] === D.shape); D.shape = S[(i + d + S.length) % S.length][0]; D.path = []; }],
            ['사진 다시 넣기', '', null]
        ];
        function openMenu() { D.menu = 0; }
        function menuKey(k) {
            const R = menuRows();
            if (k === 'U') D.menu = (D.menu + R.length - 1) % R.length;
            else if (k === 'D') D.menu = (D.menu + 1) % R.length;
            else if ((k === 'L' || k === 'R') && R[D.menu][2]) R[D.menu][2](k === 'R' ? 1 : -1);
            else if (k === 'OK' && D.menu === 3) { D.menu = -1; camStop(); D.img = null; D.st = 'home'; }
            else if (k === 'OK' && R[D.menu][2]) R[D.menu][2](1);
            else if (k === 'MENU' || k === 'DISP') D.menu = -1;
        }

        /* ---------- 📷 카메라 · 🖼️ 사진 ---------- */
        function pickFile() { camStop(); const f = dq('dcmFile'); f.click(); }      // 단추를 누른 그 순간에 열어요 (📱 이 막지 않게)
        function loadFile(file) {
            const url = URL.createObjectURL(file), im = new Image();
            im.onload = () => { const k = Math.min(1, 1000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); gotPhoto(c); };
            im.onerror = () => { URL.revokeObjectURL(url); if (window.showMsg) showMsg('사진을 열지 못했어요. 다른 사진을 골라 주세요.'); };
            im.src = url;
        }
        function gotPhoto(c) {
            if (!D.on) return; camStop();
            Object.assign(D, { img: c, st: 'edit', zoom: 1, ox: 0, oy: 0, path: [], menu: -1 });
            if (D.shape === 'free') D.shape = 'circle';
            say('◀ ▶ 모양 · ▲ ▼ 크기 · 끌어서 자리', 2200);
        }
        async function camGo() {
            if (!camOk()) return pickFile();
            D.st = 'live'; say('카메라를 켜는 중…', 4000);
            if (!D.stream) {
                try { D.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: D.face, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }); }
                catch (e) { D.st = 'home'; D.sel = 1; say('카메라를 켤 수 없어요 · 앨범에서 골라요', 2600); return; }
                if (!D.on || D.st !== 'live') { camStop(); return; }
                const v = dq('dcmCam'); v.srcObject = D.stream; try { await v.play(); } catch (e) {}
            }
            say('셔터를 눌러 찰칵!', 1800);
        }
        function camStop() { if (D.stream) { D.stream.getTracks().forEach(t => t.stop()); D.stream = null; } const v = dq('dcmCam'); if (v) v.srcObject = null; }
        function blink() { const b = dq('dcmBlink'); b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); }
        /* 셔터 = 카메라면 찰칵 · 사진이 있으면 🖨 출력 */
        function shutter() {
            if (D.busy || D.menu >= 0) { if (D.menu >= 0) D.menu = -1; return; }
            if (D.st === 'live') {
                const v = dq('dcmCam'); if (!v || !v.videoWidth) return;
                const c = document.createElement('canvas'), k = Math.min(1, 1000 / Math.max(v.videoWidth, v.videoHeight)); c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
                const g = c.getContext('2d'); if (D.face === 'user') { g.translate(c.width, 0); g.scale(-1, 1); } g.drawImage(v, 0, 0, c.width, c.height);   // 앞 카메라 = 거울처럼
                click(); blink(); gotPhoto(c); return;
            }
            if (D.st === 'edit') return print();
            if (D.st === 'home') { const o = homeOpts(); o[Math.min(D.sel, o.length - 1)][2](); }
        }

        /* ---------- 🖐 화면 끌기 (자리) · ✂️ 손으로 오리기 ---------- */
        function lcdPt(e) {                                                      // 화면 → 스티커 판 (SM 크기)
            const c = dq('dcmLcd'), r = c.getBoundingClientRect(), B = D.box; if (!B) return [0, 0];
            const x = (e.clientX - r.left) * c.width / r.width, y = (e.clientY - r.top) * c.height / r.height, N = api().size;
            return [(x - B.x) * N / B.s, (y - B.y) * N / B.s];
        }
        function lcdDown(e) {
            if (!D.on || D.busy) return;
            if (D.st === 'home') { const opts = homeOpts(), c = dq('dcmLcd'), r = c.getBoundingClientRect(), i = Math.min(opts.length - 1, Math.floor((e.clientX - r.left) / r.width * opts.length)); D.sel = i; opts[i][2](); return; }   // 화면을 톡 = 그 칸
            if (D.st !== 'edit' || D.menu >= 0) return;
            e.preventDefault(); try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
            const p = lcdPt(e);
            if (D.shape === 'free') { D.drawing = true; D.path = [p]; } else D.drag = { x: p[0], y: p[1], ox: D.ox, oy: D.oy };
        }
        function lcdMove(e) {
            if (!D.drawing && !D.drag) return; const p = lcdPt(e);
            if (D.drawing) { const l = D.path[D.path.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 2) D.path.push(p); }
            else { D.ox = D.drag.ox + p[0] - D.drag.x; D.oy = D.drag.oy + p[1] - D.drag.y; }
        }
        function lcdUp() {
            if (D.drawing) { D.drawing = false; if (D.path.length < 9) { D.path = []; say('조금 더 크게 빙 둘러 그려요'); } else say('✂️ 다시 그리면 새로 오려요'); }
            D.drag = null;
        }
        function sync() { api().set({ img: D.img, shape: D.shape, zoom: D.zoom, ox: D.ox, oy: D.oy, path: D.path.slice(), border: D.kind === 'paper' ? D.border : true, drawing: !!D.drawing }); }

        /* ---------- 🖥 화면 그리기 (옛 디카 화면 · 위아래 글줄) ---------- */
        let raf = 0;
        function run() { if (raf) return; const f = now => { raf = 0; if (!D.on) return; draw(now); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
        function draw(now) {
            const c = dq('dcmLcd'); if (!c || !c.width) return; const x = c.getContext('2d'), w = c.width, h = c.height, u = Math.min(w, h) / 100;
            const T = (t, size, col, X, Y, al, bold) => { x.font = `${bold === false ? '' : '700 '}${size * u}px Jua, "Noto Sans KR", sans-serif`; x.textAlign = al || 'center'; x.textBaseline = 'middle'; x.lineWidth = u * 1.2; x.strokeStyle = 'rgba(30,20,40,.55)'; x.lineJoin = 'round'; x.strokeText(t, X, Y); x.fillStyle = col; x.fillText(t, X, Y); };
            const rr = (a, b, ww, hh, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + ww, b, a + ww, b + hh, r); x.arcTo(a + ww, b + hh, a, b + hh, r); x.arcTo(a, b + hh, a, b, r); x.arcTo(a, b, a + ww, b, r); x.closePath(); };
            x.fillStyle = '#d9e6f5'; x.fillRect(0, 0, w, h);
            const v = dq('dcmCam'), live = D.st === 'live' && D.stream && v && v.videoWidth;
            if (D.st === 'home') {
                x.fillStyle = '#bcd3ec'; for (let i = 0; i < w; i += 14 * u) for (let j = 0; j < h; j += 14 * u) if (((i + j) / (14 * u)) % 2 < 1) x.fillRect(i, j, 7 * u, 7 * u);
                T('사진을 넣어요', 9, '#fff', w / 2, h * .2);
                const O = homeOpts(), n = O.length, bw = Math.min(w * .4, w * .82 / n), gap = w * .05, x0 = (w - (n * bw + (n - 1) * gap)) / 2;
                O.forEach(([ic, t], i) => {
                    const bx = x0 + i * (bw + gap), by = h * .32, bh = h * .46, on = D.sel === i;
                    x.fillStyle = on ? '#ff8fb1' : '#fff'; rr(bx, by, bw, bh, 5 * u); x.fill(); x.lineWidth = u * (on ? 1.6 : 1); x.strokeStyle = '#5b3a46'; x.stroke();
                    x.font = `${Math.min(bw * .3, h * .2)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#000'; x.fillText(ic, bx + bw / 2, by + bh * .4);
                    x.font = `700 ${7 * u}px Jua, "Noto Sans KR", sans-serif`; x.fillStyle = on ? '#fff' : '#6b3f55'; x.fillText(t, bx + bw / 2, by + bh * .82);
                });
                T(camOk() ? '◀ ▶ 고르고 OK' : 'OK 를 누르면 사진 고르는 창이 열려요', 6, '#fff', w / 2, h * .9, 'center', false);
            } else if (D.st === 'live') {
                if (live) { const vw = v.videoWidth, vh = v.videoHeight, k = Math.max(w / vw, h / vh); x.save(); if (D.face === 'user') { x.translate(w, 0); x.scale(-1, 1); } x.drawImage(v, (w - vw * k) / 2, (h - vh * k) / 2, vw * k, vh * k); x.restore(); }
                else { x.fillStyle = '#2a2430'; x.fillRect(0, 0, w, h); }
                x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = u * .5; for (const f of [1 / 3, 2 / 3]) { x.beginPath(); x.moveTo(w * f, 0); x.lineTo(w * f, h); x.moveTo(0, h * f); x.lineTo(w, h * f); x.stroke(); }
                x.strokeStyle = '#7dff9a'; x.lineWidth = u * 1.2; const fx = w / 2, fy = h / 2, fs = Math.min(w, h) * .14;   // 초점 네모
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { x.beginPath(); x.moveTo(fx + a * fs, fy + b * fs * .6); x.lineTo(fx + a * fs, fy + b * fs); x.lineTo(fx + a * fs * .6, fy + b * fs); x.stroke(); });
                bar(x, w, h, u, T, `📷 ${D.face === 'user' ? '앞' : '뒤'} 카메라`, `DISP 앞↔뒤 · 셔터 찰칵`);
            } else if (D.st === 'edit' || D.st === 'print' || D.st === 'done') {
                x.fillStyle = '#fbeef4'; x.fillRect(0, 0, w, h); x.fillStyle = '#f6dce7'; for (let i = 0; i < w; i += 10 * u) for (let j = 0; j < h; j += 10 * u) if (((i + j) / (10 * u)) % 2 < 1) x.fillRect(i, j, 5 * u, 5 * u);
                if (D.img) {
                    const N = api().size, s = Math.min(w, h * .8) * .98, B = D.box = { x: (w - s) / 2, y: (h - s) / 2, s };
                    const sm = D.sm || (D.sm = document.createElement('canvas')); if (sm.width !== N) { sm.width = sm.height = N; }
                    sync(); api().render(sm.getContext('2d'), D.st === 'edit'); x.drawImage(sm, B.x, B.y, s, s);
                }
                const K = kindOf(D.kind);
                if (D.st === 'edit') bar(x, w, h, u, T, `${K[1]} ${K[2]} · ${shapeName(D.shape)}`, D.shape === 'free' ? '✂️ 화면에 빙 둘러 그려요 · 셔터 = 출력' : '◀▶ 모양 · ▲▼ 크기 · 셔터 = 출력');
                else bar(x, w, h, u, T, `${K[1]} ${K[2]}`, D.st === 'print' ? '🖨 출력 중 ···' : '📸 출력 완료!');
            }
            if (D.menu >= 0) {                                                         // MENU (파란 옛 메뉴)
                const R = menuRows(), mw = w * .82, rh = h * .14, mx = (w - mw) / 2, my = (h - rh * (R.length + 1)) / 2;
                x.fillStyle = 'rgba(20,24,60,.88)'; rr(mx, my, mw, rh * (R.length + 1), 3 * u); x.fill(); x.lineWidth = u; x.strokeStyle = '#fff'; x.stroke();
                T('MENU', 6.4, '#ffe680', w / 2, my + rh * .55);
                R.forEach(([a, b], i) => {
                    const y = my + rh * (i + 1); if (i === D.menu) { x.fillStyle = '#ff8fb1'; rr(mx + u * 2, y + rh * .08, mw - u * 4, rh * .84, 2 * u); x.fill(); }
                    T(a, 6, '#fff', mx + u * 6, y + rh / 2, 'left'); if (b) T(i === D.menu && R[i][2] ? `◀ ${b} ▶` : b, 6, '#fff', mx + mw - u * 6, y + rh / 2, 'right');
                });
            }
            if (D.msg) { const mw = Math.min(w * .9, (D.msg.length * 6.6 + 10) * u), my = h * .5; x.fillStyle = 'rgba(40,24,48,.78)'; rr((w - mw) / 2, my - 7 * u, mw, 14 * u, 4 * u); x.fill(); T(D.msg, 6.4, '#fff', w / 2, my); }
        }
        function bar(x, w, h, u, T, top, bot) {                                   // 위아래 글줄 (옛 디카 화면처럼)
            x.fillStyle = 'rgba(40,30,60,.55)'; x.fillRect(0, 0, w, h * .12); x.fillRect(0, h * .88, w, h * .12);
            const d = new Date(); T(top, 5.4, '#fff', w * .03, h * .06, 'left'); T(`▮▮▮ ${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, 4.6, '#fff', w * .97, h * .06, 'right', false);
            T(bot, 5, '#fff', w / 2, h * .94, 'center', false);
        }

        /* ---------- 🖨 출력 = 위 틈에서 폴라로이드처럼 한 장이 쓱 → 천천히 그림이 ---------- */
        async function print() {
            if (D.busy || !D.img) return;
            if (D.shape === 'free' && D.path.length < 9) { say('✂️ 먼저 화면에 빙 둘러 그려요', 1800); return; }
            sync(); const src = api().make(D.kind);
            if (!src) { say('다시 해 주세요'); return; }
            D.busy = true; D.st = 'print';
            dq('dcmPolImg').src = src; const d = new Date(); dq('dcmCap').textContent = `말랑 ♥ ${d.getMonth() + 1}.${d.getDate()}`;
            const o = dq('dcmOut'); o.className = 'dcm-out on'; o.style.setProperty('--y', '100%');
            await wait(quiet() ? 0 : 350); click();
            if (!quiet()) { noise(1300, 900, .05, 22); for (let p = 0; p <= 1.0001; p += 1 / 16) { o.style.setProperty('--y', (100 - p * 100) + '%'); await wait(70); } }
            o.style.setProperty('--y', '0%'); o.classList.add('dev');                // 하얗던 필름에 그림이 천천히 (폴라로이드처럼)
            snd(1320, .08, 'triangle', .05); D.st = 'done'; D.busy = false;
            const K = kindOf(D.kind), open = !(typeof isCoverOpen !== 'undefined' && !isCoverOpen), A = dq('dcmActs');
            A.querySelector('[data-a="stick"]').textContent = `📌 ${K[1]} 다이어리에 붙이기`; A.querySelector('[data-a="stick"]').hidden = !open;   // 📌 = 다이어리가 펴져 있을 때만
            A.querySelector('[data-a="keep"]').textContent = `💾 ${K[1]} ${K[2]}스티커 만들기`; A.querySelector('[data-a="keep"]').classList.toggle('pk', !open);
            A.hidden = false;
        }
        function again() { dq('dcmActs').hidden = true; dq('dcmOut').className = 'dcm-out'; D.st = D.img ? 'edit' : 'home'; D.busy = false; }
        async function act(a) {
            if (a === 'again') { again(); D.img = null; D.st = 'home'; return; }
            if (D.saving || D.st !== 'done') return;
            if (typeof DK !== 'undefined' && DK.trial) { if (window.showMsg) showMsg('🏪 적용해보기에서는 저장되지 않아요'); return; }   // 🏪 샵 적용해보기 = 만들어 보기만 (도련 11-12)
            D.saving = true; [...document.querySelectorAll('#dcmActs .dcm-a')].forEach(b => { b.disabled = true; });
            try {
                sync(); const k = D.kind;
                if (a === 'stick') close(() => { api().finish(k, true); });      // 📌 디카는 책상으로 → 종이째 나와서 떼어 붙여요 (예전과 같아요)
                else { await api().finish(k, false); again(); }                   // 💾 🗄️ 서랍 (알림은 예전과 같아요) · 디카는 그대로 (또 만들어요)
            } finally { D.saving = false; [...document.querySelectorAll('#dcmActs .dcm-a')].forEach(b => { b.disabled = false; }); }
        }
        /* 💻 키보드 : 화살표 · Enter(OK) · 스페이스(셔터) · M(MENU) · Esc */
        document.addEventListener('keydown', e => {
            if (!D.on || document.querySelector('#customAlertModal[style*="flex"]')) return;
            const m = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', Enter: 'OK', ' ': 'shut', m: 'MENU', M: 'MENU' }[e.key];
            if (e.key === 'Escape') { e.preventDefault(); if (D.menu >= 0) D.menu = -1; else close(); return; }
            if (m) { e.preventDefault(); key(m); }
        });
        window.openDigicam = openDigicam; window.closeDigicam = close;
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['digicam'] = true;
