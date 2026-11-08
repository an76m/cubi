/* 말랑달콤 다이어리 - js/stickerprinter.js
   🖨️ 말랑 스티커 프린터 (도련 11-08 · 예전 🖼️ 앨범에서 골라 만들기를 책상 위 작은 프린터로 · 시안 '말랑 스티커 기계' 연출)
   - 책상 위 프린터 소품(상품 '기능' print · js/deskcustom.js dcTap) 톡 → 프린터가 떠올라 가운데 크게 (다이어리처럼) · ✕ / 바깥 톡 = 제자리로
     ✂️ 스티커 만들기의 🖼️ 앨범에서 골라 만들기도 여기로 (책상에 보이면 거기서 · 아니면 아래에서 쏙 · 그 종류로)
   - 🖼️ 사진 고르기 = 한 장 · 여러 장 (SM_MANY 10장까지) → 틈 위 미리보기 종이에서 끌어 자리 · 🔍 크기 · 모양 (원본 · 동그라미 · 하트 · 별 · 둥근네모 · 구름 · ✂️ 손으로 = 빙 둘러 그리기)
     여러 장 = 아래 사진 줄에서 한 장씩 따로 · 🔁 모두 같게 · 종류 🏷️ 씰 · 🧩 조각 · 📄 모조지 (모조지만 하얀 테두리 켜고 끄기)
   - 전원 버튼 꾹 (또는 '버튼 꾹 누르기') = 지이잉 (몸이 덜덜 · 불빛 깜빡) → 틈에서 종이가 조금씩 올라오며 위에서부터 그림이 찍혀요 → 초록 불 반짝
     → 📌 톡! 떼어 다이어리에 (펴져 있을 때만) · 💾 톡! 떼어 서랍에 = 종이가 휙 떼어져 날아가요 → 하나 더 뽑기
   - 그림 · 저장 = 예전 앨범 스티커와 같아요 (js/stickermaker.js smPhotoApi.finishMany · 여러 장 씰 = 종이 한 장 · 조각 = 봉투 하나 · 모조지 = 한 장) · 사진은 이 기기 안에서만
   - 책상 그림(디자인.png) = 이 프린터 그림(MACH)을 그대로 찍은 것 (둘레 3u) · 프린터 모습을 바꾸면 책상 그림도 다시 찍어요 */
    (function () {
        const MAX = 10, PRINT = 3600;
        const P = { on: false, st: 'empty', list: [], cur: 0, kind: 'seal', border: true, src: null, busy: false, saving: false, drawing: false, drag: null, sheet: '' };
        const pq = id => document.getElementById(id);
        const quiet = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
        const api = () => window.smPhotoApi;
        const KINDS = [['seal', '🏷️', '씰스티커'], ['piece', '🧩', '조각스티커'], ['paper', '📄', '모조지스티커']];
        const kindOf = k => KINDS.find(x => x[0] === k) || KINDS[0];
        const shapes = () => api() ? api().shapes : [['circle', '동그라미']];
        const wait = ms => new Promise(r => setTimeout(r, ms));
        const cur = () => P.list[P.cur];

        /* 🩷 프린터 그림 (셀 애니 · 도련 11-08 시안 고친 그림) · 500 × 250 (y 40 부터) · 틈 = y 69 */
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
        function build() {
            let el = pq('sprRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'sprRoom'; el.className = 'spr-room';
            el.innerHTML = `<div class="spr-back" id="sprBack"></div>
                <img class="spr-fly" id="sprFly" alt="" draggable="false">
                <button type="button" class="spr-x" id="sprX" aria-label="닫기">✕</button>
                <div class="spr-wrap" id="sprWrap">
                  <div class="spr-mach" id="sprMach">
                    <div class="spr-pz" id="sprPz">
                      <div class="spr-ghost" id="sprGhost"><canvas id="sprCv"></canvas><button type="button" class="spr-pick" id="sprPick">🖼️ 사진 고르기<small>한 장 · 여러 장 (${MAX}장까지)</small></button></div>
                      <div class="spr-paper" id="sprPaper"><div class="spr-ink" id="sprInk"><img id="sprSheet" alt="" draggable="false"></div></div>
                    </div>
                    <div class="spr-body" id="sprBody">${MACH}<button type="button" class="spr-pwb" id="sprPw" aria-label="전원 버튼 · 인쇄하기"></button></div>
                    <i class="spr-floor" aria-hidden="true"></i>
                  </div>
                  <div class="spr-ctl" id="sprCtl"></div>
                </div>
                <input type="file" id="sprFile" accept="image/*" multiple hidden>`;
            document.body.appendChild(el);
            pq('sprX').onclick = () => close(); pq('sprBack').onclick = () => { if (!P.busy) close(); };
            pq('sprPw').onclick = () => press();
            pq('sprPick').onclick = () => pickFiles(false);
            pq('sprFile').onchange = e => { const f = [...(e.target.files || [])].filter(x => /^image\//.test(x.type) || /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(x.name)); e.target.value = ''; if (f.length) gotFiles(f); };
            pq('sprCtl').addEventListener('click', ctlClick);
            const cv = pq('sprCv');
            cv.addEventListener('pointerdown', cvDown); cv.addEventListener('pointermove', cvMove); cv.addEventListener('pointerup', cvUp); cv.addEventListener('pointercancel', cvUp);
            cv.addEventListener('wheel', e => { if (P.st !== 'edit') return; e.preventDefault(); zoom(e.deltaY < 0 ? 1.06 : .94); }, { passive: false });
            addEventListener('resize', () => { if (P.on) fit(); });
            return el;
        }
        /* 📐 --u = 프린터 너비의 1% · 프린터 = 100u × 50u · 위 종이 자리 64u */
        function fit() {
            const ctl = pq('sprCtl'), ch = Math.max(innerWidth <= 560 ? 290 : 196, ctl ? ctl.offsetHeight : 200);
            const W = Math.min(innerWidth * .92, 470, (innerHeight - ch - 60) / 1.16), m = pq('sprMach');
            m.style.setProperty('--u', W / 100 + 'px'); m.style.width = W + 'px';
            const cv = pq('sprCv'), r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(10, Math.round(r.width * dpr)); cv.height = Math.max(10, Math.round(r.height * dpr));
            draw();
            return pq('sprBody').getBoundingClientRect();
        }

        /* ---------- 🛫 책상에서 떠올라 가운데로 (라벨기 · 디카와 같아요) ---------- */
        const FLY = 560, SWAP = 160, PAD = 3;
        const deskImg = el => el && (el.querySelector(':scope > img') || el);
        function toBody(S) {
            const b = pq('sprBody'), R = b.getBoundingClientRect(), w = b.offsetWidth, h = b.offsetHeight, u = w / 100;
            return `translate(${R.left + R.width / 2 - (S.left + S.width / 2)}px, ${R.top + R.height / 2 - (S.top + S.height / 2)}px) scale(${(w + 2 * PAD * u) / S.width}, ${(h + 2 * PAD * u) / S.height})`;
        }
        function showNow(w) { w.style.transition = 'none'; w.classList.remove('hide'); void w.offsetWidth; w.style.transition = ''; }
        function hideNow(w) { w.style.transition = 'none'; w.classList.add('hide'); void w.offsetWidth; w.style.transition = ''; }
        function openStickerPrinter(o) {
            o = o || {}; if (P.on) return;
            if (!api() || !api().finishMany) { if (window.comingSoon) comingSoon('🖨️ 말랑 스티커 프린터'); return; }
            if (typeof closeModal === 'function') ['stickerToolModal', 'stickerSrcModal', 'moveModal'].forEach(id => { const m = pq(id); if (m && m.style.display === 'flex') closeModal(id); });
            if (window.closeCraft && document.body.classList.contains('craft-on')) closeCraft();
            const room = build(), el = o.el || null;
            Object.assign(P, { on: true, src: el, busy: false, saving: false });
            if (o.kind && kindOf(o.kind)[0] === o.kind) P.kind = o.kind;
            if (P.st !== 'edit') reset(!P.list.length);
            room.classList.add('show'); document.body.classList.add('spr-on');
            ctl(); const R = fit();
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
                    setTimeout(() => { if (!P.on) return; showNow(wrap); wrap.classList.add('intro'); setTimeout(() => wrap.classList.remove('intro'), 600); requestAnimationFrame(() => { fly.style.transition = `opacity ${SWAP}ms ease`; fly.style.opacity = 0; }); }, FLY - 40);   // 종이 · 아래 판은 그 뒤에 스르륵
                }));
            } else { fly.style.opacity = 0; showNow(wrap); room.classList.add('lit', 'pop'); setTimeout(() => room.classList.remove('pop'), 500); }
        }
        function close(after) {
            if (!P.on) return; P.on = false; P.busy = false;
            const room = pq('sprRoom'), fly = pq('sprFly'), wrap = pq('sprWrap'), el = P.src, img = deskImg(el);
            const done = () => { room.classList.remove('show', 'lit', 'bye'); document.body.classList.remove('spr-on'); if (el) el.style.visibility = ''; wrap.classList.remove('hide'); if (P.st !== 'edit') reset(true); if (after) after(); };
            const S0 = img && el.isConnected ? img.getBoundingClientRect() : null;
            if (S0 && S0.width > 4 && !quiet()) {
                fly.style.transition = 'none'; fly.style.opacity = 1; fly.style.transform = toBody(S0); hideNow(wrap); room.classList.remove('lit');   // 똑같은 그림을 덮고 진짜는 숨겨요
                requestAnimationFrame(() => requestAnimationFrame(() => { fly.style.transition = 'transform .5s cubic-bezier(.5, 0, .3, 1)'; fly.style.transform = 'none'; setTimeout(done, 520); }));
            } else { room.classList.add('bye'); setTimeout(done, quiet() ? 0 : 300); }
        }

        /* ---------- 🖼️ 사진 ---------- */
        function pickFiles(add) { P.add = !!add; pq('sprFile').click(); }        // 누른 그 순간에 열어요 (📱 이 막지 않게)
        const loadPic = file => new Promise(res => {
            const url = URL.createObjectURL(file), im = new Image();
            im.onload = () => { const k = Math.min(1, 1000 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c); };
            im.onerror = () => { URL.revokeObjectURL(url); res(null); }; im.src = url;
        });
        async function gotFiles(files) {
            const room = MAX - (P.add ? P.list.length : 0);
            if (files.length > room) showMsg(`사진은 한 번에 <b>${MAX}장까지</b> 넣을 수 있어요.<br><span style="font-size:12px;color:#777;">고른 ${files.length}장 중 앞의 ${Math.max(0, room)}장만 가져올게요.</span>`);
            const imgs = (await Promise.all(files.slice(0, Math.max(0, room)).map(loadPic))).filter(Boolean);
            if (!imgs.length) { if (files.length <= room) showMsg('사진을 열지 못했어요. 다른 사진을 골라 주세요.'); return; }
            const shape = cur() && cur().shape !== 'free' ? cur().shape : 'circle';
            const add = imgs.map(img => ({ img, shape, zoom: 1, ox: 0, oy: 0, path: [] }));
            if (P.add) { P.list = P.list.concat(add); P.cur = P.list.length - add.length; } else { P.list = add; P.cur = 0; }
            P.st = 'edit'; ctl(); fit();
        }
        function reset(clear) {
            if (clear) { P.list = []; P.cur = 0; }
            P.st = P.list.length ? 'edit' : 'empty'; P.busy = false;
            const pz = pq('sprPz'); if (pz) { pq('sprPaper').className = 'spr-paper'; pq('sprGhost').className = 'spr-ghost'; }
            const b = pq('sprBody'); if (b) b.classList.remove('buzz', 'busy', 'ready');
        }

        /* ---------- ✏️ 미리보기 종이 (끌어 자리 · ✂️ 손으로 오리기) ---------- */
        let box = null;
        function draw() {
            const cv = pq('sprCv'); if (!cv || !cv.width) return; const x = cv.getContext('2d'), w = cv.width, h = cv.height;
            x.clearRect(0, 0, w, h); pq('sprPick').hidden = P.st !== 'empty';
            if (P.st === 'empty' || !cur()) { box = null; return; }
            const N = api().size, s = Math.min(w, h) * .96; box = { x: (w - s) / 2, y: (h - s) / 2, s };
            const sm = draw.c || (draw.c = document.createElement('canvas')); if (sm.width !== N) sm.width = sm.height = N;
            sync(cur()); api().render(sm.getContext('2d'), true); x.drawImage(sm, box.x, box.y, s, s);
        }
        function sync(m, drawing) { api().set({ img: m.img, shape: m.shape, zoom: m.zoom, ox: m.ox, oy: m.oy, path: m.path, border: P.kind === 'paper' ? P.border : true, drawing: !!drawing }); }
        function cvPt(e) { const cv = pq('sprCv'), r = cv.getBoundingClientRect(), N = api().size; const x = (e.clientX - r.left) * cv.width / r.width, y = (e.clientY - r.top) * cv.height / r.height; return box ? [(x - box.x) * N / box.s, (y - box.y) * N / box.s] : [0, 0]; }
        function cvDown(e) {
            if (P.st !== 'edit' || !cur()) { if (P.st === 'empty') pickFiles(false); return; }
            e.preventDefault(); try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
            const p = cvPt(e), m = cur();
            if (m.shape === 'free') { P.drawing = true; m.path = [p]; } else P.drag = { x: p[0], y: p[1], ox: m.ox, oy: m.oy };
            drawLive();
        }
        function cvMove(e) {
            if (!P.drawing && !P.drag) return; const p = cvPt(e), m = cur();
            if (P.drawing) { const l = m.path[m.path.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 2) m.path.push(p); }
            else { m.ox = P.drag.ox + p[0] - P.drag.x; m.oy = P.drag.oy + p[1] - P.drag.y; }
            drawLive();
        }
        function cvUp() {
            if (P.drawing) { P.drawing = false; const m = cur(); if (m.path.length < 9) { m.path = []; tip('✂️ 조금 더 크게 빙 둘러 그려 주세요'); } else tip('✂️ 다시 그리면 새로 오려요'); }
            P.drag = null; draw(); thumbs();
        }
        function drawLive() { if (P.drawing) { const cv = pq('sprCv'), x = cv.getContext('2d'), N = api().size, sm = draw.c; sync(cur(), true); api().render(sm.getContext('2d'), true); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(sm, box.x, box.y, box.s, box.s); } else draw(); }
        function zoom(f) { const m = cur(); if (!m) return; m.zoom = Math.max(.4, Math.min(3, m.zoom * f)); draw(); }
        function tip(t) { const e = pq('sprTip'); if (e) e.textContent = t; }

        /* ---------- 🎛 아래 판 (사진 줄 · 모양 · 종류 · 크기 · 버튼) ---------- */
        function ctl() {
            const el = pq('sprCtl'); if (!el) return; const K = kindOf(P.kind), open = !(typeof isCoverOpen !== 'undefined' && !isCoverOpen);
            const msg = { empty: '사진을 고르고 오른쪽 위 동그란 버튼을 꾹!', edit: cur() && cur().shape === 'free' ? '✂️ 종이 위에 손가락(마우스)으로 빙 둘러 그려요' : '종이 위 사진을 끌어 자리 · 🔍 크기 · 버튼 꾹 = 인쇄', print: '지이잉… 스티커가 나오고 있어요', ready: '다 나왔어요! 따끈따끈해요', peel: '톡!', done: P.doneMsg || '서랍에 쏙 넣었어요' }[P.st];
            let h = `<p class="spr-msg${P.st === 'print' ? ' blink' : ''}" id="sprTip">${msg}</p>`;
            if (P.st === 'edit') {
                if (P.list.length > 1 || true) h += `<div class="spr-row spr-th" id="sprTh"></div>`;
                h += `<div class="spr-row">${shapes().map(([k, n]) => `<button type="button" class="spr-chip${cur().shape === k ? ' on' : ''}" data-shape="${k}">${n.replace('🖼️ ', '')}</button>`).join('')}</div>`;
                h += `<div class="spr-row">${KINDS.map(([k, i, n]) => `<button type="button" class="spr-chip${P.kind === k ? ' on' : ''}" data-kind="${k}">${i} ${n.replace('스티커', '')}</button>`).join('')}`
                    + (P.kind === 'paper' ? `<button type="button" class="spr-chip${P.border ? ' on' : ''}" data-b="1">하얀 테두리</button>` : '')
                    + `<button type="button" class="spr-chip sq" data-z="-">－</button><button type="button" class="spr-chip sq" data-z="+">＋</button>`
                    + (P.list.length > 1 ? `<button type="button" class="spr-chip" data-all="1">🔁 모두 같게</button>` : '') + `</div>`;
                h += `<div class="spr-row"><button type="button" class="spr-btn" data-go="press">버튼 꾹 누르기</button><button type="button" class="spr-btn soft" data-go="pick">🖼️ 다시 고르기</button></div>`;
            } else if (P.st === 'empty') h += `<div class="spr-row"><button type="button" class="spr-btn" data-go="pick">🖼️ 사진 고르기</button></div>`;
            else if (P.st === 'ready') h += `<div class="spr-row">${open ? `<button type="button" class="spr-btn pop" data-go="stick">📌 톡! 떼어 다이어리에</button>` : ''}<button type="button" class="spr-btn pop${open ? ' soft' : ''}" data-go="keep">💾 톡! 떼어 서랍에</button></div>`;
            else if (P.st === 'done') h += `<div class="spr-row"><button type="button" class="spr-btn soft pop" data-go="again">하나 더 뽑기</button></div>`;
            el.innerHTML = h; thumbs();
        }
        function thumbs() {
            const el = pq('sprTh'); if (!el) return;
            el.innerHTML = P.list.map((m, i) => `<button type="button" class="spr-tb${i === P.cur ? ' on' : ''}" data-i="${i}"><img src="${m.th || (m.th = th(m.img))}" alt=""><span>${i + 1}</span></button>`).join('')
                + (P.list.length < MAX ? `<button type="button" class="spr-tb add" data-go="add" aria-label="사진 더 넣기">＋</button>` : '');
        }
        function th(img) { const c = document.createElement('canvas'), k = 96 / Math.min(img.width, img.height); c.width = c.height = 96; c.getContext('2d').drawImage(img, (96 - img.width * k) / 2, (96 - img.height * k) / 2, img.width * k, img.height * k); return c.toDataURL('image/jpeg', .8); }
        function ctlClick(e) {
            const b = e.target.closest('button'); if (!b || P.busy) return; const m = cur();
            if (b.dataset.shape && m) { m.shape = b.dataset.shape; m.path = []; ctl(); draw(); }
            else if (b.dataset.kind) { P.kind = b.dataset.kind; ctl(); draw(); }
            else if (b.dataset.b) { P.border = !P.border; ctl(); draw(); }
            else if (b.dataset.z) zoom(b.dataset.z === '+' ? 1.1 : 1 / 1.1);
            else if (b.dataset.all) { if (m.shape === 'free') { showMsg('✂️ 손으로 오리기는 사진마다 따로 그려 주세요.'); return; } P.list.forEach(x => { x.shape = m.shape; x.zoom = m.zoom; x.path = []; }); tip(`🔁 ${P.list.length}장 모두 같은 모양 · 크기로`); }
            else if (b.dataset.i) { P.cur = +b.dataset.i; ctl(); draw(); }
            else if (b.dataset.go === 'press') press();
            else if (b.dataset.go === 'pick') pickFiles(false);
            else if (b.dataset.go === 'add') pickFiles(true);
            else if (b.dataset.go === 'stick' || b.dataset.go === 'keep') peel(b.dataset.go === 'stick');
            else if (b.dataset.go === 'again') { reset(true); ctl(); fit(); }
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
        function beep(f, d) { try { if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.05, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(sndOut()); o.start(t); o.stop(t + d + .02); } catch (e) {} }

        /* ---------- 🖨 버튼 꾹 = 지이잉 → 종이가 조금씩 · 위에서부터 그림 ---------- */
        function sheetOf(srcs) {                                                 // 종이 한 장 (만든 스티커를 나란히 · 칼같은 그늘 한 톤)
            return Promise.all(srcs.map(s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = s; }))).then(imgs => {
                imgs = imgs.filter(Boolean); const W = 540, H = 620, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
                const n = imgs.length, cols = n < 2 ? 1 : n < 5 ? 2 : 3, rows = Math.ceil(n / cols), pad = 34, cw = (W - pad * 2) / cols, rh = (H - pad * 2) / rows;
                imgs.forEach((im, i) => {
                    const col = i % cols, row = Math.floor(i / cols), k = Math.min((cw - 18) / im.width, (rh - 18) / im.height, n < 2 ? 1.8 : 9), w = im.width * k, h = im.height * k;
                    const px = pad + col * cw + (cw - w) / 2, py = pad + row * rh + (rh - h) / 2;
                    const t = document.createElement('canvas'); t.width = w; t.height = h; const tx = t.getContext('2d'); tx.drawImage(im, 0, 0, w, h); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = '#efc6d5'; tx.fillRect(0, 0, w, h);
                    x.drawImage(t, px, py + 5); x.drawImage(im, px, py, w, h);
                });
                return c.toDataURL('image/png');
            });
        }
        async function press() {
            if (P.busy || !P.on) return;
            if (P.st === 'empty') { pickFiles(false); return; }
            if (P.st !== 'edit') return;
            const bad = P.list.findIndex(m => m.shape === 'free' && (m.path || []).length < 9);
            if (bad >= 0) { P.cur = bad; ctl(); draw(); tip(`✂️ ${bad + 1}번째 사진을 먼저 빙 둘러 그려 주세요`); return; }
            const pw = pq('sprBody').querySelector('.spr-pw'); pw.classList.add('down'); setTimeout(() => pw.classList.remove('down'), 160);
            const srcs = P.list.map(m => { sync(m); return api().make(P.kind); }).filter(Boolean);
            if (!srcs.length) { tip('스티커를 만들지 못했어요'); return; }
            P.busy = true; P.st = 'print'; ctl();
            const sheet = await sheetOf(srcs); pq('sprSheet').src = sheet;
            const body = pq('sprBody'), paper = pq('sprPaper'), ink = pq('sprInk'); pq('sprGhost').className = 'spr-ghost gone';
            body.classList.add('buzz', 'busy'); paper.className = 'spr-paper on'; paper.style.animationDuration = ink.style.animationDuration = PRINT + 'ms';
            void paper.offsetWidth; paper.classList.add('rise'); ink.classList.add('go');
            noise(PRINT, 700, .045, 18);
            await wait(quiet() ? 0 : PRINT + 80);
            body.classList.remove('buzz', 'busy'); body.classList.add('ready'); beep(1320, .1);
            P.busy = false; P.st = 'ready'; ctl();
        }
        /* 톡! 떼어 가기 = 종이가 휙 날아가요 → 저장 (예전과 같아요) */
        async function peel(stick) {
            if (P.saving || P.st !== 'ready') return; P.saving = true; P.busy = true;
            const paper = pq('sprPaper'); paper.classList.remove('rise'); paper.classList.add('peel'); noise(140, 2600, .1); P.st = 'peel'; ctl();
            await wait(quiet() ? 0 : 1150);
            const list = P.list.slice(), k = P.kind, border = P.border;
            pq('sprBody').classList.remove('ready');
            try {
                if (stick) { P.saving = false; P.busy = false; reset(true); close(() => { api().finishMany(k, true, list, border); }); return; }   // 📌 프린터는 책상으로 → 종이째 나와서 떼어 붙여요
                await api().finishMany(k, false, list, border);                                                                                  // 💾 🗄️ 서랍 (알림은 예전과 같아요)
                P.doneMsg = `${kindOf(k)[1]} 서랍에 쏙 넣었어요`; P.st = 'done';
            } finally { P.saving = false; P.busy = false; if (P.on) { paper.className = 'spr-paper'; ctl(); } }
        }
        document.addEventListener('keydown', e => {
            if (!P.on || document.querySelector('#customAlertModal[style*="flex"]')) return;
            if (e.key === 'Escape') { e.preventDefault(); close(); }
            else if (e.key === 'Enter' && P.st === 'edit' && !e.target.closest('input, textarea')) { e.preventDefault(); press(); }
        });
        window.openStickerPrinter = openStickerPrinter; window.closeStickerPrinter = close;
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['stickerprinter'] = true;
