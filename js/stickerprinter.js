/* 말랑달콤 다이어리 - js/stickerprinter.js
   🖨️ 말랑 스티커 프린터 (도련 11-08 · 예전 🖼️ 앨범에서 골라 만들기를 책상 위 작은 프린터로 · 시안 '말랑 스티커 기계' + '위 화면 시안')
   - 책상 위 프린터 소품(상품 '기능' print · js/deskcustom.js dcTap) 톡 → 프린터가 떠올라 가운데 크게 → 앞으로 기울어 위에서 내려다본 모습 (위 화면 · 버튼)
     ✂️ 스티커 만들기의 🖼️ 앨범에서 골라 만들기도 여기로 (책상에 보이면 거기서 · 아니면 아래에서 쏙 · 그 종류로) · ✕ / 바깥 톡 = 일어서서 제자리로
   🖨 도련 11-14 : 프린터 = 📐 내 도안을 뽑는 곳 (사진 → 스티커는 영구 삭제 · 사진 · 모양 · 여러 장 · 시트 꾸미기는 📱 태블릿 🏷️ 씰스티커)
     위 화면 두 단계 : 도안 (◀ ▶ 고르기) → 출력 (전원 꾹) · 나오는 양 = 🖨 제작 규칙 (js/own.js ownRules · 상품공방) · 씰 · 모조지 한 시트 · 조각 4조각 · 마테 · 떡메 · 메모지 · 속지
     그 도안으로 뽑은 것이 서랍에 남아 있으면 못 뽑아요 (다 쓰거나 🗑 버리면 다시 · ownDesignBusy)
   - (예전) 위 화면 (LCD) 네 단계 : 사진 → 모양 → 크기 · 자리 → 출력 (종류는 늘 🏷️ 씰 · 도련 11-08) (맨 위 단계 줄 · 가운데 미리보기 · 아래 할 일)
     ◀ ▶ 고르기 · ▲ ▼ 크기 · OK 다음 · 뒤로 = 한 단계 앞 · 앞으로 = 앞모습으로 세우기 · 화면을 끌면 자리 · ✂️ 손으로 = 화면에 빙 둘러 그리기
     사진 : OK = 앨범 (한 장 · 여러 장 SM_MANY 10장까지) · ◀ ▶ 한 장씩 · ▲ 더 넣기 · ▼ 새로 고르기 / 모양 : ▲ = 모든 사진에 같게
     💻 화살표 · Enter(OK) · Backspace(뒤로) · 스페이스(전원) · Esc
   - 마지막 단계에서 전원 버튼 꾹 = 프린터가 앞으로 일어서고 → 지이잉 (몸 덜덜 · 노란 불 깜빡) → 틈에서 종이가 조금씩 · 위에서부터 그림 → 초록 불
     → 📌 톡! 떼어 다이어리에 (펴져 있을 때만) · 💾 톡! 떼어 서랍에 = 종이가 휙 → 하나 더 뽑기 (다시 위 화면)
   - 그림 · 저장 = 예전 앨범 스티커와 같아요 (js/stickermaker.js smPhotoApi.finishMany) · 사진은 이 기기 안에서만
   - 책상 그림(디자인.png) = 앞모습 그림(MACH)을 그대로 찍은 것 (둘레 3u) · 앞모습을 바꾸면 책상 그림도 다시 찍어요 (위 모습 TOP 은 책상 그림과 상관없어요) */
    (function () {
        const MAX = 10, PRINT = 3600, TILT = 420;
        const P = { on: false, view: 'front', step: 0, ds: [], di: 0, img: new Map(), busyD: new Set(), loading: false, kind: 'seal', src: null, busy: false, saving: false, st: 'edit', msg: '', msgT: 0 };
        const pq = id => document.getElementById(id);
        const quiet = () => calmMotion();
        const api = () => window.smPhotoApi;
        const KINDS = [['seal', '🏷️', '씰스티커'], ['piece', '🧩', '조각스티커'], ['paper', '📄', '모조지스티커'], ['tape', '🎀', '마스킹테이프'], ['tk', '🧻', '떡메모지'], ['leaf', '📃', '속지'], ['memo', '📝', '메모지']];
        const STEPS = ['도안', '출력'];                                         // 🖨 도련 11-14 : 📐 내 도안 고르기 → 출력
        const kindOf = k => KINDS.find(x => x[0] === k) || KINDS[0];
        const wait = waitMs;   // 🧰 js/util.js
        const cur = () => P.ds[P.di];

        /* 🩷 앞모습 (셀 애니 · 도련 고친 그림) · 500 × 250 (y 40 부터) · 틈 = y 69 */
        const C = { body: '#ffd9e5', shade: '#f4b3c8', light: '#fff3f7', ln: '#6b4a55' };
        const MACH = `<svg class="spr-svg" viewBox="0 40 500 250" data-an="1" aria-hidden="true">
            <g stroke="${C.ln}" stroke-linejoin="round" stroke-linecap="round">
              <path d="M38 132 C36 78 52 52 96 50 L408 50 C444 50 460 64 462 96 L464 132 Z" fill="${C.body}" stroke-width="5"/>
              <rect x="108" y="61" width="296" height="16" rx="8" fill="${C.ln}" stroke-width="0"/>
              <path d="M118 69 L394 69" stroke="${C.light}" stroke-width="3.5"/>
              <rect class="spr-led" x="368" y="94" width="28" height="11" rx="5.5" fill="#7fd3b0" stroke-width="3"/>
              <g class="spr-pw"><ellipse cx="431" cy="100" rx="25" ry="14.5" fill="${C.shade}" stroke-width="4"/><ellipse cx="431" cy="96" rx="17" ry="9" fill="#fff" stroke-width="3"/>
                <path d="M431 90.5 L431 96 M425.5 92 A6.6 5.6 0 1 0 436.5 92" fill="none" stroke="#ff7a93" stroke-width="2.6"/></g>
              <rect x="20" y="120" width="460" height="152" rx="32" fill="${C.body}" stroke-width="5"/>
              <path d="M44 150 C44 141 51 136 62 136 L446 136" fill="none" stroke="${C.light}" stroke-width="7"/>
              <path d="M24 222 L476 222" stroke="#c9a3b3" stroke-width="3" stroke-dasharray="2 10"/>
              <rect x="38" y="178" width="30" height="60" rx="10" fill="${C.shade}" stroke-width="4"/>
              <rect x="45" y="190" width="16" height="10" rx="4" fill="#b98a9c" stroke-width="0"/>
              <rect x="210" y="248" width="80" height="12" rx="6" fill="#e9bccb" stroke-width="0"/>
            </g></svg>`;
        /* 🔽 위에서 내려다본 모습 (위 화면 시안) · 500 × 320 · 화면 = x56 y172 252×104 · 십자 = (400, 218) */
        const TOP = `<svg class="spr-svg" viewBox="0 0 500 320" data-an="1" aria-hidden="true">
            <g stroke="${C.ln}" stroke-linejoin="round" stroke-linecap="round">
              <rect x="14" y="112" width="472" height="194" rx="38" fill="${C.body}" stroke-width="4.5"/>
              <path d="M36 296 L464 296" stroke="${C.shade}" stroke-width="7"/>
              <rect x="40" y="14" width="420" height="132" rx="38" fill="${C.body}" stroke-width="4.5"/>
              <path d="M66 30 L434 30" stroke="${C.light}" stroke-width="6"/>
              <rect x="80" y="46" width="340" height="18" rx="9" fill="${C.ln}" stroke-width="0"/>
              <path d="M92 55 L408 55" stroke="${C.light}" stroke-width="3"/>
              <text x="64" y="118" font-family="Jua, sans-serif" font-size="13" fill="#c06a8f" stroke="none" letter-spacing="1">내 도안 프린터</text>
              <rect class="spr-led" x="330" y="92" width="30" height="12" rx="6" fill="#7fd3b0" stroke-width="3"/>
              <g class="spr-pw"><circle cx="410" cy="98" r="22" fill="${C.shade}" stroke-width="4"/><circle cx="410" cy="98" r="14" fill="#fff" stroke-width="3"/>
                <path d="M410 91 L410 98 M403.5 94 A8 8 0 1 0 416.5 94" fill="none" stroke="#ff7a93" stroke-width="2.6"/></g>
              <rect x="44" y="160" width="276" height="128" rx="18" fill="#4a3540" stroke-width="4"/>
              <circle cx="400" cy="218" r="54" fill="#fde3ec" stroke-width="4"/>
            </g></svg>`;
        const at = (x, y) => `left:${x / 5}%;top:${y / 3.2}%`;                       // 위 모습 좌표 → % (500 × 320)
        function build() {
            let el = pq('sprRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'sprRoom'; el.className = 'spr-room';
            el.innerHTML = `<div class="spr-back" id="sprBack"></div>
                <img class="spr-fly" id="sprFly" alt="" draggable="false">
                <div class="spr-wrap" id="sprWrap">
                  <div class="spr-mach" id="sprMach">
                    <div class="spr-front" id="sprFront">
                      <div class="spr-pz" id="sprPz"><div class="spr-paper" id="sprPaper"><div class="spr-ink" id="sprInk"><img id="sprSheet" alt="" draggable="false"></div></div></div>
                      <div class="spr-body" id="sprBody">${MACH}<button type="button" class="spr-pwb" id="sprPw" aria-label="위에서 보기"></button></div>
                    </div>
                    <div class="spr-top" id="sprTop">
                      ${TOP}
                      <canvas class="spr-lcd" id="sprLcd" style="left:11.2%;top:53.75%;width:50.4%;height:32.5%"></canvas>
                      <button type="button" class="spr-tk spr-tpw" style="${at(410, 98)}" data-k="PW" aria-label="전원 버튼 · 출력"></button>
                      <button type="button" class="spr-tk spr-ar" style="${at(400, 180)}" data-k="U" aria-label="위">▲</button>
                      <button type="button" class="spr-tk spr-ar" style="${at(400, 256)}" data-k="D" aria-label="아래">▼</button>
                      <button type="button" class="spr-tk spr-ar" style="${at(362, 218)}" data-k="L" aria-label="왼쪽">◀</button>
                      <button type="button" class="spr-tk spr-ar" style="${at(438, 218)}" data-k="R" aria-label="오른쪽">▶</button>
                      <button type="button" class="spr-tk spr-ok" style="${at(400, 218)}" data-k="OK">OK</button>
                      <button type="button" class="spr-tk spr-pill" style="${at(366, 289)}" data-k="BACK">뒤로</button>
                      <button type="button" class="spr-tk spr-pill" style="${at(436, 289)}" data-k="FRONT">앞으로</button>
                    </div>
                    <i class="spr-floor" aria-hidden="true"></i>
                  </div>
                  <div class="spr-ctl" id="sprCtl"></div>
                </div>
`;
            document.body.appendChild(el);
            pq('sprBack').onclick = () => { if (!P.busy) close(); };
            pq('sprPw').onclick = () => { if (P.view === 'front' && P.st === 'edit' && !P.busy) toTop(); };
            pq('sprTop').addEventListener('pointerdown', e => { const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 130); if (b.dataset.k === 'PW') { const t = pq('sprTop'); t.classList.add('pw'); setTimeout(() => t.classList.remove('pw'), 160); } key(b.dataset.k); });
            pq('sprCtl').addEventListener('click', ctlClick);
            addEventListener('resize', () => { if (P.on) fit(); });
            return el;
        }
        /* 📐 --u = 프린터 너비의 1% · 앞모습 = 위 종이 자리 64u + 몸 50u · 위 모습 = 100u × 64u (아래에 맞춰요) */
        function fit() {
            const W = Math.min(innerWidth * .95, 540, (innerHeight - 170) / 1.14), m = pq('sprMach');
            m.style.setProperty('--u', W / 100 + 'px'); m.style.width = W + 'px';
            m.style.setProperty('--ts', Math.max(1, Math.min(1.32, innerWidth * .98 / W, (innerHeight - 150) / (W * .64))));   // 위 모습은 화면이 잘 보이게 더 크게 (앞모습 자리 안에서)
            const cv = pq('sprLcd'), k = Math.min(2, devicePixelRatio || 1) * (+m.style.getPropertyValue('--ts') || 1);   // 기울기 · 키움을 빼고 잰 크기 (offset) × 키움
            if (cv.offsetWidth > 4) { cv.width = Math.round(cv.offsetWidth * k); cv.height = Math.round(cv.offsetHeight * k); }
            draw();
            return pq('sprBody').getBoundingClientRect();
        }

        /* ---------- 🛫 책상에서 떠올라 가운데로 → 앞으로 기울어 위 모습 ---------- */
        const FLY = 560, SWAP = 160, PAD = 3;
        const deskImg = el => el && (el.querySelector(':scope > img') || el);
        function toBody(S) {
            const b = pq('sprBody'), R = b.getBoundingClientRect(), w = b.offsetWidth, h = b.offsetHeight, u = w / 100;
            return `translate(${R.left + R.width / 2 - (S.left + S.width / 2)}px, ${R.top + R.height / 2 - (S.top + S.height / 2)}px) scale(${(w + 2 * PAD * u) / S.width}, ${(h + 2 * PAD * u) / S.height})`;
        }
        function showNow(w) { w.style.transition = 'none'; w.classList.remove('hide'); void w.offsetWidth; w.style.transition = ''; }
        function hideNow(w) { w.style.transition = 'none'; w.classList.add('hide'); void w.offsetWidth; w.style.transition = ''; }
        function setView(v, anim) {                                               // front · top (기울기 연출)
            const m = pq('sprMach'); P.view = v;
            m.classList.remove('tilt-in', 'stand-up'); void m.offsetWidth;
            m.classList.toggle('is-top', v === 'top');
            if (anim && !quiet()) m.classList.add(v === 'top' ? 'tilt-in' : 'stand-up');
            if (v === 'top') requestAnimationFrame(() => fit());
            ctl();
        }
        function toTop() { if (!P.on) return; setView('top', true); }
        function openStickerPrinter(o) {
            o = o || {}; if (P.on) return;
            if (typeof closeModal === 'function') ['stickerToolModal', 'stickerSrcModal', 'moveModal'].forEach(id => { const m = pq(id); if (m && m.style.display === 'flex') closeModal(id); });
            if (window.closeCraft && document.body.classList.contains('craft-on')) closeCraft();
            const room = build(), el = o.el || null;
            Object.assign(P, { on: true, src: el, busy: false, saving: false, st: 'edit', msg: '' });
            P.step = 0; loadDesigns();                                              // 📐 내 도안 (도련 11-14)
            pq('sprPaper').className = 'spr-paper'; pq('sprBody').classList.remove('buzz', 'busy', 'ready');
            room.classList.add('show'); document.body.classList.add('spr-on');
            setView('front', false); const R = fit(); run();
            const img = deskImg(el), fly = pq('sprFly'), wrap = pq('sprWrap');
            const S = img && img.getBoundingClientRect ? img.getBoundingClientRect() : null;
            if (S && S.width > 4 && !quiet()) {
                fly.src = img.currentSrc || img.src;
                Object.assign(fly.style, { left: S.left + 'px', top: S.top + 'px', width: S.width + 'px', height: S.height + 'px', transform: 'none', opacity: 1, transition: 'none', scale: el.classList.contains('dk-fl') ? '-1 1' : '' });
                el.style.visibility = 'hidden'; hideNow(wrap); room.classList.remove('lit');
                const to = toBody(S);
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    room.classList.add('lit');
                    fly.style.transition = `transform ${FLY}ms cubic-bezier(.22, .9, .3, 1)`; fly.style.transform = to;
                    setTimeout(() => { if (!P.on) return; showNow(wrap); requestAnimationFrame(() => { fly.style.transition = `opacity ${SWAP}ms ease`; fly.style.opacity = 0; }); setTimeout(toTop, 220); }, FLY - 40);   // 다 뜨면 앞으로 기울어 위 화면
                }));
            } else { fly.style.opacity = 0; showNow(wrap); room.classList.add('lit', 'pop'); setTimeout(() => room.classList.remove('pop'), 500); setTimeout(toTop, quiet() ? 0 : 480); }
        }
        function close(after) {
            if (!P.on) return;
            if (P.view === 'top' && !quiet()) { P.busy = true; setView('front', true); setTimeout(() => { P.busy = false; close(after); }, TILT); return; }   // 일어선 다음 내려가요
            P.on = false; P.busy = false;
            const room = pq('sprRoom'), fly = pq('sprFly'), wrap = pq('sprWrap'), el = P.src, img = deskImg(el);
            const done = () => { room.classList.remove('show', 'lit', 'bye'); document.body.classList.remove('spr-on'); if (el) el.style.visibility = ''; wrap.classList.remove('hide'); if (after) after(); };
            const S0 = img && el.isConnected ? img.getBoundingClientRect() : null;
            pq('sprPaper').className = 'spr-paper';
            if (S0 && S0.width > 4 && !quiet()) {
                fly.style.transition = 'none'; fly.style.opacity = 1; fly.style.transform = toBody(S0); hideNow(wrap); room.classList.remove('lit');
                requestAnimationFrame(() => requestAnimationFrame(() => { fly.style.transition = 'transform .5s cubic-bezier(.5, 0, .3, 1)'; fly.style.transform = 'none'; setTimeout(done, 520); }));
            } else { room.classList.add('bye'); setTimeout(done, quiet() ? 0 : 300); }
        }

        /* ---------- 📐 내 도안 (도련 11-14 · js/own.js ownDesigns · 새것부터 · 모든 종류) ---------- */
        async function loadDesigns() {
            P.loading = true; P.ds = []; P.di = 0;
            try { P.ds = window.ownDesigns ? await ownDesigns() : []; } catch (e) { console.warn('🖨 도안', e); P.ds = []; }
            P.loading = false;
            P.ds.forEach(e => { if (e.th && !P.img.has(e.id)) { const im = new Image(); im.src = e.th; P.img.set(e.id, im); } });
            busyCheck();
        }
        async function busyCheck() {                                              // 그 도안으로 뽑은 것이 서랍에 남아 있나요
            const d = cur(); if (!d || !window.ownDesignBusy) return;
            try { if (await ownDesignBusy(d.id)) P.busyD.add(d.id); else P.busyD.delete(d.id); } catch (e) {}
        }
        const kindName = k => { const K = kindOf(k); return K[0] === k ? K[1] + ' ' + K[2] : '📐 도안'; };

        /* ---------- 🎛 위 화면 버튼 ---------- */
        function key(k) {
            if (!P.on || P.busy || P.view !== 'top') return;
            beep(k === 'PW' ? 660 : 1700, .03, 'square', .02);
            const n = P.ds.length;
            if (k === 'FRONT') { setView('front', true); return; }
            if (k === 'BACK') { if (P.step > 0) P.step--; else setView('front', true); return; }
            if (!n) { say(P.loading ? '도안을 불러오는 중이에요' : '📱 태블릿에서 먼저 디자인해요', 1800); return; }
            if (k === 'PW') { if (P.step === 1) return print(); P.step = 1; say('전원 버튼을 한 번 더 꾹!'); return; }
            if (k === 'OK') { if (P.step === 0) { P.step = 1; return; } return say('전원 버튼을 꾹 눌러요'); }
            if (k === 'L' || k === 'R' || k === 'U' || k === 'D') { P.di = (P.di + (k === 'R' || k === 'D' ? 1 : n - 1)) % n; P.step = 0; busyCheck(); }
        }
        function say(t, ms) { P.msg = t; clearTimeout(P.msgT); P.msgT = setTimeout(() => { P.msg = ''; }, ms || 1400); }

        /* ---------- 🖥 위 화면 그리기 (연두 LCD · 단계 줄 · 미리보기 · 할 일) ---------- */
        let raf = 0, box = null;
        function run() { if (raf) return; const f = () => { raf = 0; if (!P.on) return; draw(); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
        function draw() {
            const cv = pq('sprLcd'); if (!cv || !cv.width || P.view !== 'top') return;
            const x = cv.getContext('2d'), w = cv.width, h = cv.height, u = h / 100;
            const T = (t, size, col, X, Y, al) => { x.font = `${size * u}px Jua, "Noto Sans KR", sans-serif`; x.textAlign = al || 'left'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(t, X, Y); };
            const rr = (a, b, ww, hh, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + ww, b, a + ww, b + hh, r); x.arcTo(a + ww, b + hh, a, b + hh, r); x.arcTo(a, b + hh, a, b, r); x.arcTo(a, b, a + ww, b, r); x.closePath(); };
            x.fillStyle = '#dff2e8'; x.fillRect(0, 0, w, h);
            let sx = 5 * u; x.font = `${13 * u}px Jua, sans-serif`;                    // 단계 줄
            STEPS.forEach((s, i) => { const tw = x.measureText(s).width + 8 * u; if (i === P.step) { x.fillStyle = '#2f4a3c'; rr(sx, 4 * u, tw, 17 * u, 4 * u); x.fill(); } T(s, 13, i === P.step ? '#dff2e8' : '#7d9a8a', sx + 4 * u, 12.8 * u); sx += tw + 2 * u; });
            const n = P.ds.length, d = cur(), pv = h * .72, px = 5 * u, py = 25 * u, tx = px + pv + 8 * u;
            let big = '', small = '';
            x.fillStyle = '#c4e3d3'; rr(px, py, pv, pv, 6 * u); x.fill();
            if (!n) { T(P.loading ? '…' : '📐', 34, '#7d9a8a', px + pv / 2, py + pv / 2, 'center'); big = P.loading ? '불러오는 중…' : '도안이 없어요'; small = P.loading ? '' : '📱 태블릿에서 디자인해요 · ✅ 완료 = 내 도안'; }
            else {
                const im = P.img.get(d.id);
                if (im && im.complete && im.naturalWidth) { const k = Math.min((pv - 8 * u) / im.naturalWidth, (pv - 8 * u) / im.naturalHeight); x.drawImage(im, px + (pv - im.naturalWidth * k) / 2, py + (pv - im.naturalHeight * k) / 2, im.naturalWidth * k, im.naturalHeight * k); }
                else T(kindOf((d.x || {}).k)[1], 34, '#7d9a8a', px + pv / 2, py + pv / 2, 'center');
                const nm = String((d.x || {}).nm || '').slice(0, 12), busy = P.busyD.has(d.id);
                big = `${kindName((d.x || {}).k)}${nm ? ' · ' + nm : ''}`;
                if (P.step === 0) small = busy ? `서랍에 아직 있어요 · 다 쓰거나 버리면 다시 · ◀ ▶ (${P.di + 1}/${n})` : `◀ ▶ 도안 (${P.di + 1}/${n}) · OK 다음`;
                else small = busy ? '서랍에 아직 있어요 · 다 쓰거나 버리면 다시' : ((Date.now() / 450 | 0) % 2 ? '전원 버튼을 꾹!' : '');
            }
            lines(x, w, h, u, T, tx, big, small);
        }
        function lines(x, w, h, u, T, tx, big, small) {                         // 오른쪽 글 : 크게 한 줄 + 할 일 (' · ' 로 나눠 두 줄까지)
            const maxW = w - tx - 4 * u, fit = (t, s, min) => { let z = s; x.font = `${z * u}px Jua, sans-serif`; while (z > min && x.measureText(t).width > maxW) { z -= .5; x.font = `${z * u}px Jua, sans-serif`; } return z; };
            T(big, fit(big, 24, 12), '#24382d', tx, h * .44);
            if (P.msg) { const z = fit(P.msg, 13, 8); x.font = `${z * u}px Jua, sans-serif`; const mw = Math.min(maxW, x.measureText(P.msg).width + 10 * u); x.fillStyle = '#2f4a3c'; rr2(x, tx - 3 * u, h * .66 - 10 * u, mw + 6 * u, 20 * u, 5 * u); x.fill(); T(P.msg, z, '#dff2e8', tx + 2 * u, h * .66, 'left'); return; }   // 잠깐 알림 = 할 일 자리에
            if (small) {
                x.font = `${13 * u}px Jua, sans-serif`; const parts = small.split(' · '), L = [''];
                parts.forEach(p => { const t = L[L.length - 1] ? L[L.length - 1] + ' · ' + p : p; if (x.measureText(t).width <= maxW || !L[L.length - 1]) L[L.length - 1] = t; else L.push(p); });
                L.slice(0, 2).forEach((t, i) => T(t, fit(t, 13, 8), '#4f6b5c', tx, h * (.66 + i * .16)));
            }
        }
        function rr2(x, a, b, ww, hh, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + ww, b, a + ww, b + hh, r); x.arcTo(a + ww, b + hh, a, b + hh, r); x.arcTo(a, b + hh, a, b, r); x.arcTo(a, b, a + ww, b, r); x.closePath(); }
        /* ---------- 아래 글 · 버튼 (출력 뒤에만 버튼) ---------- */
        function ctl() {
            const el = pq('sprCtl'); if (!el) return; const open = isCoverOpen;
            const msg = P.st === 'edit' ? ''   /* 기계 밖 안내 글은 없어요 (도련 11-11) */
                : { print: '지이잉… 스티커가 나오고 있어요', ready: '다 나왔어요! 따끈따끈해요', peel: '톡!', done: P.doneMsg || '서랍에 쏙 넣었어요' }[P.st];
            let h = msg ? `<p class="spr-msg${P.st === 'print' ? ' blink' : ''}" id="sprTip">${msg}</p>` : '';
            if (P.st === 'ready') h += `<div class="spr-row"><button type="button" class="spr-btn pop" data-go="keep">💾 톡! 떼어 서랍에</button></div>`;
            else if (P.st === 'done') h += `<div class="spr-row"><button type="button" class="spr-btn soft pop" data-go="again">🖨 다른 도안 뽑기</button></div>`;
            el.innerHTML = h;
        }
        function ctlClick(e) {
            const b = e.target.closest('button'); if (!b || P.busy) return;
            if (b.dataset.go === 'keep') peel();
            else if (b.dataset.go === 'again') { P.st = 'edit'; P.step = 0; pq('sprPaper').className = 'spr-paper'; toTop(); busyCheck(); }
        }

        /* ---------- 🔊 (✨ 연출 소리를 끄면 조용히) ---------- */
        function noise(ms, freq, vol, chop) {
            try {
                if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), t0 = ac.currentTime, len = ms / 1000;
                const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate), d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) { const t = i / ac.sampleRate; d[i] = (Math.random() * 2 - 1) * (chop ? .55 + .45 * Math.sign(Math.sin(t * 2 * Math.PI * chop)) : Math.exp(-t * 26)); }
                const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .7;
                g.gain.setValueAtTime(vol, t0); g.gain.setValueAtTime(vol, t0 + len - .06); g.gain.linearRampToValueAtTime(0, t0 + len);
                s.connect(f).connect(g).connect(sndOut()); s.start(t0); s.stop(t0 + len);
            } catch (e) {}
        }
        function beep(f, d, type, vol) { try { if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(vol || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(sndOut()); o.start(t); o.stop(t + d + .02); } catch (e) {} }

        /* ---------- 🖨 전원 꾹 = 일어서고 → 지이잉 → 종이가 조금씩 · 위에서부터 그림 ---------- */
        async function print() {
            const d = cur(); if (P.busy || !P.on || !d) return;
            if (window.ownDesignBusy && await ownDesignBusy(d.id)) { P.busyD.add(d.id); say('서랍에 아직 있어요 · 다 쓰거나 버리면 다시', 2400); return; }   // 다 써야 다시 (도련 11-14)
            P.busy = true; noise(120, 900, .08);
            pq('sprSheet').src = d.th || '';
            setView('front', true); P.st = 'print'; ctl();                                // 앞으로 일어서고
            await wait(quiet() ? 0 : TILT + 120);
            const body = pq('sprBody'), paper = pq('sprPaper'), ink = pq('sprInk');
            body.classList.add('buzz', 'busy'); paper.className = 'spr-paper on'; paper.style.animationDuration = ink.style.animationDuration = PRINT + 'ms';
            void paper.offsetWidth; paper.classList.add('rise'); ink.classList.add('go');
            noise(PRINT, 700, .045, 18);
            await wait(quiet() ? 0 : PRINT + 80);
            body.classList.remove('buzz', 'busy'); body.classList.add('ready'); beep(1320, .1);
            P.busy = false; P.st = 'ready'; ctl();
        }
        /* 톡! 떼어 서랍에 = 종이가 휙 → 🖨 제작 규칙대로 새 종이 (js/own.js ownDesignPrint) */
        async function peel() {
            if (P.saving || P.st !== 'ready') return;
            if (window.dkTrialNoSave && dkTrialNoSave()) return;   // 🏪 샵 적용해보기 = 만들어 보기만 (js/desk.js)
            const d = cur(); if (!d) return;
            P.saving = true; P.busy = true;
            const paper = pq('sprPaper'); paper.classList.remove('rise'); paper.classList.add('peel'); noise(140, 2600, .1); P.st = 'peel'; ctl();
            await wait(quiet() ? 0 : 1150);
            pq('sprBody').classList.remove('ready');
            try {
                await ownDesignPrint(d.id);
                P.busyD.add(d.id);
                const R = window.ownRules ? ownRules() : {}, k = (d.x || {}).k, q = { piece: `${R.piece || 4}조각 한 봉투`, tape: '한 롤', tk: `${R.tk || 30}장 한 묶음`, memo: `${R.memo || 30}장 한 묶음`, leaf: `${R.leaf || 1}장` }[k] || '한 시트';
                P.doneMsg = `${kindOf(k)[1]} ${q} · 서랍에 쏙 넣었어요`; P.st = 'done';
            } catch (e) {
                console.warn('🖨 출력', e); P.st = 'edit';
                if (window.showMsg) showMsg('⚠ 서랍에 넣지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '잠시 뒤 다시 해 주세요.'));
            } finally { P.saving = false; P.busy = false; if (P.on) { paper.className = 'spr-paper'; ctl(); } }
        }
        document.addEventListener('keydown', e => {
            if (!P.on || document.querySelector('#customAlertModal[style*="flex"]')) return;
            if (e.key === 'Escape') { e.preventDefault(); close(); return; }
            const k = { ArrowLeft: 'L', ArrowRight: 'R', ArrowUp: 'U', ArrowDown: 'D', Enter: 'OK', Backspace: 'BACK', ' ': 'PW' }[e.key];
            if (k && P.view === 'top' && !e.target.closest('input, textarea')) { e.preventDefault(); key(k); }
        });
        window.openStickerPrinter = openStickerPrinter; window.closeStickerPrinter = close; window.sprTest = () => ({ P, key, print, peel });   // 🧪 시험용
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['stickerprinter'] = true;
