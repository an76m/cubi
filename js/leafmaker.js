/* 말랑달콤 다이어리 - js/leafmaker.js
   📃 속지 만들기 (✂️ 스티커만들기 → 📃 속지 만들기)
   - 🖼️ 사진 불러오기 : 사진을 페이지 비율로 맞춰 깔아요 (손가락으로 옮기기 · 확대 · 연하게 해서 글씨가 잘 보이게)
   - ✏️ 직접 그리기 : 종이 위에 펜으로 그려요 (사진 위에 그려도 돼요)
   - 🧵 종이 꾸미기 : js/maker.js 종이 칸 (상품공방 속지 · 떡메 · 메모지와 같은 칸 · 도련 11-05) = 종이 색 · 줄(무지 · 줄 · 모눈 · 도트) · 줄 색 · 간격 · 위 여백 · 무늬 두 겹 · 테두리 · 모서리 · 머리글
   📝 메모지 만들기 (도련 11-05) : 같은 창을 메모지 모양으로 (lm.for = 'memo' · 440 × 300) → 🧺 바구니에 한 묶음
   - 🎒 만든 속지 한 장 · 떡메 한 묶음은 🧺 바구니로 (10-25 · js/own.js) : 📃 오늘 페이지에 끼우기 · 📌 떡메 묶음으로 꺼내기 = 바구니에 넣고 바로 써요 · 🗄️ 서랍에 넣기
   - 페이지에는 그림(JPG)째로 그날 파일에 lfi 로 저장돼요 (주소 아님 · 인수인계 12번)
   ※ 링 구멍은 미리보기 · 페이지 모두 그 위에 그대로 보여요 (css/style.css --lf-holes)
   🧻 떡메모지 만들기 (✂️ 스티커만들기 → 🧻 떡메모지 만들기) : 같은 창을 떡메 모양으로 써요 (lm.for = 'tk')
   - 한 장 크기는 기본 떡메와 같아요 (150 × 148 · 그림은 2배로 그려요) · 링 구멍 대신 위에 🩷 풀칠 띠 색을 골라요
   - 페이지에 붙은 한 장은 글 + 그림 그대로 그날 파일에 저장돼요 (tk: 'my' · tb · 인수인계 12번) */

        const LM_W = 900;
        const LM_PENS = ['#5a3d4a', '#ff6b8b', '#ff9f43', '#ffd23f', '#4caf7a', '#3d9be0', '#8a6be0', '#ffffff'];
        const LM_SIZES = [['3', '가늘게'], ['7', '보통'], ['16', '굵게']];
        const LM_GLUES = [['', '다이어리 색'], ['#ffb3c6', '분홍'], ['#ffcf9e', '살구'], ['#ffe98a', '노랑'], ['#b9ebcf', '민트'], ['#b7dcff', '하늘'], ['#d6c6ff', '보라'], ['#d9bf94', '크라프트']];
        const LM_TK_W = 300, LM_TK_H = 296;                              // 🧻 떡메 한 장 (TK_W × TK_H 의 2배 · js/leafpad.js)
        const LM_MEMO_W = 440, LM_MEMO_H = 300;                          // 📝 메모지 한 장 (상품공방 메모지와 같은 크기)
        const LM_DEF = { leaf: { g: 'plain', lc: '#f6d5df', gap: 56 }, tk: { bg: '#fff6cf', g: 'line', lc: '#f1d58a', gap: 36, top: 30 }, memo: { bg: '#fff59a', g: 'line', lc: '#e8d27a', gap: 34, top: 20, rad: 6 } };   // 처음 종이 (속지 = 지금 다이어리 속지 색)
        const lm = { built: false, for: 'leaf', glue: '', tab: 'photo', w: LM_W, h: 1400, img: null, zoom: 1, ox: 0, oy: 0, wash: 0, mk: null, mkImg: null,
            pen: LM_PENS[0], size: 7, erase: false, ink: null, undo: [], drag: null };
        const lmq = id => document.getElementById(id);

        /* ---------- 만들기 창 ---------- */
        function lmBuild() {
            if (lm.built) return; lm.built = true;
            const chips = (id, arr, on, fn) => { const b = lmq(id); b.innerHTML = arr.map(([v, n]) => `<button type="button" data-v="${v}" class="${v === on ? 'on' : ''}">${n}</button>`).join(''); b.onclick = e => { const t = e.target.closest('button'); if (!t) return; b.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === t)); fn(t.dataset.v); }; };
            chips('lmSize', LM_SIZES, String(lm.size), v => { lm.size = +v; });
            chips('lmGlue', LM_GLUES, lm.glue, v => { lm.glue = v; lmGlueShow(); });
            lmq('lmGlue').querySelectorAll('button').forEach(b => b.insertAdjacentHTML('afterbegin', `<i style="background:${b.dataset.v || 'var(--dy-accent)'}"></i>`));
            const pens = lmq('lmPens');
            pens.innerHTML = LM_PENS.map(c => `<button type="button" data-c="${c}" style="background:${c}" class="${c === lm.pen ? 'on' : ''}" aria-label="펜 색"></button>`).join('') + '<button type="button" data-c="erase" class="lm-eraser" aria-label="지우개">🧽</button>';
            pens.onclick = e => { const t = e.target.closest('button'); if (!t) return; pens.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === t)); lm.erase = t.dataset.c === 'erase'; if (!lm.erase) lm.pen = t.dataset.c; };
            lmq('lmZoom').oninput = e => { lm.zoom = +e.target.value; lmClamp(); lmDraw(); };
            lmq('lmWash').oninput = e => { lm.wash = +e.target.value; lmDraw(); };
            lmq('lmFile').onchange = e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) lmPhoto(f); };
            const cv = lmq('lmCv');
            cv.addEventListener('pointerdown', lmDown); cv.addEventListener('pointermove', lmMove);
            ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => cv.addEventListener(t, lmUp));
        }
        function lmGlueShow() { lmq('lmBox').style.setProperty('--tk-glue', lm.glue || 'initial'); }
        const openLeafMaker = () => lmOpen('leaf');
        const openTteokMaker = () => lmOpen('tk');
        const openMemoMaker = () => lmOpen('memo');
        function lmOpen(kind) {
            const pad = !!(window.tabletOn && tabletOn());                   // 📱 태블릿에서 열면 다이어리와 상관없이 (도련 11-13 : 서랍에 넣기만 · css/tablet.css)
            if (!isCoverOpen && !pad) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
            lmBuild();
            const T = kind === 'tk', M = kind === 'memo';
            lm.for = kind;
            lmq('leafMakeModal').querySelector('.lm-content').classList.toggle('lm-tk', T);
            lmq('leafMakeModal').querySelector('.lm-content').classList.toggle('lm-memo', M);
            lmq('lmTitle').textContent = T ? '🧻 떡메모지 만들기' : M ? '📝 메모지 만들기' : '📃 속지 만들기';
            lmq('lmGo').textContent = T ? '📌 떡메 묶음으로 꺼내기' : M ? '📌 메모지 꺼내 쓰기' : '📃 오늘 페이지에 끼우기';
            lmq('lmKeep').textContent = '🗄️ 서랍에 넣기';
            lmGlueShow();
            const ca = lmq('canvasArea'), r = ca && ca.getBoundingClientRect();
            if (T) { lm.w = LM_TK_W; lm.h = LM_TK_H; }
            else if (M) { lm.w = LM_MEMO_W; lm.h = LM_MEMO_H; }
            else { lm.w = LM_W; lm.h = Math.round(LM_W * (r && r.width ? r.height / r.width : 1.55)); }
            const cv = lmq('lmCv'); cv.width = lm.w; cv.height = lm.h;
            lm.ink = document.createElement('canvas'); lm.ink.width = lm.w; lm.ink.height = lm.h;
            lm.img = null; lm.zoom = 1; lm.ox = lm.oy = 0; lm.wash = 0; lm.undo = [];
            lmq('lmZoom').value = 1; lmq('lmWash').value = 0;
            lmq('lmBox').style.aspectRatio = `${lm.w} / ${lm.h}`; lmq('lmBox').style.setProperty('--lm-r', (lm.w / lm.h).toFixed(3));
            lm.mk = Object.assign({ bg: lmPageColor() }, LM_DEF[kind]); lm.mkImg = null;
            if (window.MK) MK.form(lmq('lmMk'), 'paper', lm.mk, r => { lm.mk = r; lmMkPaint(); }, { only: ['bg', 'g', 'lc', 'gap', 'top', 'L', 'bd', 'bw', 'bc', 'rad', 'head'] });
            lmTab('photo'); lmDraw();
            openModal('leafMakeModal');
        }
        function lmTab(t) {
            lm.tab = t;
            document.querySelectorAll('#lmTabs .stk-tab').forEach(b => b.classList.toggle('on', b.dataset.t === t));
            lmq('lmPhotoBox').hidden = t !== 'photo'; lmq('lmDrawBox').hidden = t !== 'draw'; lmq('lmMkBox').hidden = t !== 'paper';
            lmq('lmPhotoTools').hidden = t !== 'photo' || !lm.img;
            lmq('lmBox').classList.toggle('drawing', t === 'draw');
        }
        function lmPhoto(file) {
            const u = URL.createObjectURL(file), im = new Image();
            im.onload = () => { lm.img = im; lm.zoom = 1; lm.ox = lm.oy = 0; lmq('lmZoom').value = 1; if (!lm.wash) { lm.wash = .25; lmq('lmWash').value = .25; } lmTab('photo'); lmDraw(); };
            im.onerror = () => { URL.revokeObjectURL(u); showMsg('⚠ 사진을 열지 못했어요.'); };
            im.src = u;
        }
        /* 사진은 페이지를 꽉 채워요 (cover) · 확대한 만큼 손가락으로 옮길 수 있어요 */
        const lmCover = () => { const im = lm.img, k = Math.max(lm.w / im.width, lm.h / im.height) * lm.zoom; return { k, w: im.width * k, h: im.height * k }; };
        function lmClamp() { if (!lm.img) return; const c = lmCover(), mx = (c.w - lm.w) / 2, my = (c.h - lm.h) / 2; lm.ox = Math.max(-mx, Math.min(mx, lm.ox)); lm.oy = Math.max(-my, Math.min(my, lm.oy)); }
        function lmPageColor() { const v = getComputedStyle(document.documentElement).getPropertyValue('--dy-page').trim(); return /^#[0-9a-f]{6}$/i.test(v) ? v : '#ffffff'; }   // 처음 종이 색 = 펼친 다이어리 속지 색
        /* 🧵 종이 (js/maker.js) → 그림 한 장 (바뀔 때만 다시) */
        let lmMkT = 0;
        function lmMkPaint() { clearTimeout(lmMkT); lmMkT = setTimeout(() => { const i = new Image(); i.onload = () => { lm.mkImg = i; lmDraw(); }; i.src = MK.url(MK.paperSvg(lm.mk, lm.w, lm.h)); }, 40); }
        /* 종이(🧵 줄 · 무늬 · 테두리) → 사진 → 연하게(하얀 막) → 그림 */
        function lmCompose(x) {
            const W = lm.w, H = lm.h;
            x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
            if (lm.mkImg) x.drawImage(lm.mkImg, 0, 0, W, H); else { x.fillStyle = (lm.mk || {}).bg || '#ffffff'; x.fillRect(0, 0, W, H); }
            if (lm.img) { const c = lmCover(); x.drawImage(lm.img, (W - c.w) / 2 + lm.ox, (H - c.h) / 2 + lm.oy, c.w, c.h); }
            if (lm.img && lm.wash) { x.fillStyle = `rgba(255,255,255,${lm.wash})`; x.fillRect(0, 0, W, H); }
            x.drawImage(lm.ink, 0, 0);
        }
        function lmDraw() { const cv = lmq('lmCv'); if (cv) lmCompose(cv.getContext('2d')); }

        /* ---------- 손가락 · 펜 ---------- */
        function lmPt(e) { const r = lmq('lmCv').getBoundingClientRect(); return [(e.clientX - r.left) * lm.w / r.width, (e.clientY - r.top) * lm.h / r.height, lm.w / r.width]; }
        function lmDown(e) {
            e.preventDefault();
            if (lm.drag) return;
            const [x, y, s] = lmPt(e);
            try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
            if (lm.tab === 'photo') { if (lm.img) lm.drag = { id: e.pointerId, x, y, ox: lm.ox, oy: lm.oy }; return; }
            lm.undo.push(lm.ink.getContext('2d').getImageData(0, 0, lm.w, lm.h)); if (lm.undo.length > 15) lm.undo.shift();
            lm.drag = { id: e.pointerId, x, y, s };
            lmLine(x, y, x + .01, y);
        }
        function lmMove(e) {
            const d = lm.drag; if (!d || d.id !== e.pointerId) return;
            e.preventDefault();
            const [x, y] = lmPt(e);
            if (lm.tab === 'photo') { lm.ox = d.ox + x - d.x; lm.oy = d.oy + y - d.y; lmClamp(); lmDraw(); return; }
            if (Math.abs(x - d.x) + Math.abs(y - d.y) < .5) return;
            lmLine(d.x, d.y, x, y); d.x = x; d.y = y;
        }
        function lmUp(e) { if (lm.drag && lm.drag.id === e.pointerId) lm.drag = null; }
        function lmLine(x0, y0, x1, y1) {
            const x = lm.ink.getContext('2d');
            x.globalCompositeOperation = lm.erase ? 'destination-out' : 'source-over';
            x.strokeStyle = lm.pen; x.lineCap = x.lineJoin = 'round'; x.lineWidth = lm.size * (lm.erase ? 3 : 1) * (lm.drag ? lm.drag.s : 1) * 1.4;
            x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
            lmDraw();
        }
        function lmUndo() { const s = lm.undo.pop(); if (!s) return; lm.ink.getContext('2d').putImageData(s, 0, 0); lmDraw(); }
        function lmClear() { lm.undo.push(lm.ink.getContext('2d').getImageData(0, 0, lm.w, lm.h)); lm.ink.getContext('2d').clearRect(0, 0, lm.w, lm.h); lmDraw(); }

        /* ---------- 다 만들었어요 : 🧺 바구니에 넣고 · 끼우기면 바로 꺼내 써요 ---------- */
        async function lmDone(btn, keep) {                              // keep : 🗄️ 서랍에 넣기만 (오늘 페이지는 그대로)
            if (btn && btn.disabled) return;
            const c = document.createElement('canvas'); c.width = lm.w; c.height = lm.h; lmCompose(c.getContext('2d'));
            const src = c.toDataURL('image/jpeg', lm.for === 'leaf' ? .86 : .9);
            if (lm.for === 'tk') return tkDone(btn, keep, src);
            if (lm.for === 'memo') return lmOwn(btn, keep, { k: 'memo', from: 'mine', imgs: [src], x: { pp: 'img', w: lm.w, h: lm.h } }, '📝 메모지');   // 🎒 만든 메모지 한 묶음 = 🧺 바구니로
            return lmOwn(btn, keep, { k: 'leaf', from: 'mine', imgs: [src], x: { lf: 'my' } }, '📃 속지');   // 🎒 만든 속지 한 장 = 🧺 바구니로 (끼우면 끝)
        }
        /* 🎒 만든 것 → 🧺 바구니 (keep : 넣기만 · 아니면 바로 꺼내 쓰기 · js/own.js) */
        async function lmOwn(btn, keep, d, name) {
            if (btn) btn.disabled = true;
            let id = '';
            try { id = await ownTake(d); }
            catch (e) { showMsg('⚠ 서랍에 넣지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); return; }
            finally { if (btn) btn.disabled = false; }
            closeModal('leafMakeModal');
            if (!keep && window.bkOpenSheet) { bkOpenSheet(id); return; }
            showMsg(`${name}를 <b>🗄️ 서랍</b>에 넣었어요!<br><span style="font-size:12px;color:#777;">하단메뉴 ✨ 스티커 → 서랍에서 꺼내 써요.</span>`);
        }

        /* 🧻 떡메 : 🧺 바구니에 넣고 · 📌 이면 바로 묶음으로 */
        async function tkDone(btn, keep, src) {                         // 🎒 만든 떡메 한 묶음(50장) = 🧺 바구니로
            return lmOwn(btn, keep, { k: 'tk', from: 'mine', imgs: [src], x: { pad: 'my', glue: lm.glue || '' } }, '🧻 떡메');
        }

        window.openLeafMaker = openLeafMaker; window.openTteokMaker = openTteokMaker; window.openMemoMaker = openMemoMaker;
        window.lmTab = lmTab; window.lmUndo = lmUndo; window.lmClear = lmClear; window.lmDone = lmDone;
