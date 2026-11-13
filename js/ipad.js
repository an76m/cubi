/* 말랑달콤 다이어리 - js/ipad.js
   📱 아이패드 (도련 11-13 · 💻 📲 책상모드만 · 📱 폰은 예전 ✂️ 스티커 만들기 그대로) : 책상 위 아이패드를 톡 = 책상 자리에서 화면 가운데로 크게 → 홈 화면 앱 6개
   - 상품 = 상품공방 책상소품 · 기능 'pad' (📱 아이패드) · '소품.scr' = 그림 속 화면 자리 [왼, 위, 오른, 아래] % · '크게.webp' = 크게 떴을 때 그림 (없으면 디자인)
   - 앱 : 📃 속지 · 🧻 떡메모지 · 🎀 마스킹테이프 · 🏷️ 씰스티커(시트 꾸미기) = 예전 만들기 화면을 그대로 열어요 (js/craft.js craftWay · 닫으면 아이패드 홈으로)
          🧩 조각스티커 · 📄 모조지스티커 = 아이패드 화면 안 그림 앱 (✏️ 직접 그리기 + 📎 사진 불러오기 · 사진 위에 그려도 돼요)
            조각 = 그린 모양대로 하얀 칼선 (js/stickermaker.js smAdd 'piece' · 🧩 봉투 하나) · 모조지 = 종이 한 장 그대로 (pmMakeSheet → smAdd 'paper')
   - 닫기 = 오른쪽 위 ✕ · 아이패드 바깥 톡 · Esc → 책상 자리로 작게 돌아가요
   - 책상 위 작은 화면 (시계 · 앱 아이콘) = js/desk.js deskItemHtml (.dk-pad) */
(function () {
    'use strict';
    const APPS = [['leaf', '📃', '속지'], ['tk', '🧻', '떡메모지'], ['tape', '🎀', '마스킹테이프'], ['seal', '🏷️', '씰스티커'], ['piece', '🧩', '조각스티커'], ['paper', '📄', '모조지스티커']];
    const WAY = { leaf: 'leaf', tk: 'tk', tape: 'tape', seal: 'sheet' };   // 예전 만들기 화면 (js/craft.js CRAFT_WAYS)
    const PENS = ['#3d2b33', '#ff5d8f', '#ff9a3c', '#ffd23f', '#5cc98a', '#4aa8ff', '#9b7bff', '#ffffff'];
    const SIZES = [4, 9, 18];
    const SCR0 = [3.8, 4.7, 96.3, 75.7];                                       // 화면 자리 (상품에 없을 때)
    const FLY = 560;
    const IP = { on: false, el: null, o: null, busy: false, app: null, D: null };
    const q = id => document.getElementById(id);
    const quiet = () => window.calmMotion && calmMotion();
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const hm = () => { const n = window.tzNow ? tzNow() : new Date(); return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); };

    function build() {
        let r = q('ipRoom'); if (r) return r;
        r = document.createElement('div'); r.id = 'ipRoom'; r.className = 'ip-room';
        r.innerHTML = `<div class="ip-dim"></div>
            <div class="ip-pad" id="ipPad"><img class="ip-img" id="ipImg" alt="" draggable="false"><div class="ip-scr" id="ipScr"></div><button type="button" class="ip-x win-x" aria-label="닫기">✕</button></div>`;
        document.body.appendChild(r);
        r.querySelector('.ip-dim').addEventListener('click', () => closeIpad());
        r.querySelector('.ip-x').addEventListener('click', () => closeIpad());
        return r;
    }
    /* 크게 뜬 아이패드 자리 (화면 가운데 · 화면 안) */
    function fitBox(ratio) {
        const W = Math.min(innerWidth * .9, 1000, (innerHeight * .84) * ratio), H = W / ratio;
        return { left: (innerWidth - W) / 2, top: (innerHeight - H) / 2 + 8, width: W, height: H };
    }
    function place(box) { const p = q('ipPad'); Object.assign(p.style, { left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' }); }
    function scrPlace(scr) {
        const s = q('ipScr'), [l, t, r, b] = scr;
        Object.assign(s.style, { left: l + '%', top: t + '%', width: (r - l) + '%', height: (b - t) + '%' });
    }

    /* 📱 열기 : 책상 위 아이패드(el)에서 크게 */
    async function openIpad(el, o) {
        if (IP.on || IP.busy) return;
        o = o || {};
        const room = build(), img = q('ipImg'), src = o.big || o.src || (el && el.querySelector('img') && el.querySelector('img').src);
        if (!src) return;
        IP.on = true; IP.busy = true; IP.el = el; IP.o = o; IP.app = null;
        document.body.classList.add('ip-on');
        img.src = src; if (!img.complete) await new Promise(r => { img.onload = img.onerror = r; });
        const ratio = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : (o.w && o.h ? o.w / o.h : 1.2);
        const T = fitBox(ratio); place(T); scrPlace(Array.isArray(o.scr) && o.scr.length === 4 ? o.scr : SCR0);
        home();
        room.classList.add('show');
        const pad = q('ipPad'), S = el && el.getBoundingClientRect();
        if (S && S.width > 4 && !quiet()) {
            room.classList.remove('lit'); pad.classList.add('fly');
            pad.style.transition = 'none'; pad.style.transform = `translate(${S.left - T.left}px, ${S.top - T.top}px) scale(${S.width / T.width}, ${S.height / T.height})`;
            el.style.visibility = 'hidden';
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            room.classList.add('lit');
            pad.style.transition = `transform ${FLY}ms cubic-bezier(.22, .9, .3, 1)`; pad.style.transform = 'none';
            await wait(FLY);
        } else room.classList.add('lit');
        pad.classList.remove('fly'); pad.style.transition = ''; IP.busy = false;
    }
    async function closeIpad() {
        if (!IP.on || IP.busy) return;
        if (IP.D && IP.D.dirty && !(await (typeof showAsk === 'function' ? showAsk('그리던 그림이 사라져요.<br>아이패드를 닫을까요?', '닫기', '계속 그리기') : Promise.resolve(true)))) return;
        IP.busy = true;
        const room = q('ipRoom'), pad = q('ipPad'), el = IP.el, S = el && el.isConnected ? el.getBoundingClientRect() : null, T = pad.getBoundingClientRect();
        q('ipScr').classList.add('off');
        room.classList.remove('lit');
        if (S && S.width > 4 && !quiet() && S.bottom > 0 && S.top < innerHeight) {
            pad.classList.add('fly'); pad.style.transition = `transform ${FLY - 80}ms cubic-bezier(.5, 0, .7, .4)`;
            pad.style.transform = `translate(${S.left - T.left}px, ${S.top - T.top}px) scale(${S.width / T.width}, ${S.height / T.height})`;
            await wait(FLY - 80);
        } else { pad.style.transition = 'opacity .2s'; pad.style.opacity = 0; await wait(200); }
        if (el) el.style.visibility = '';
        room.classList.remove('show'); pad.classList.remove('fly'); Object.assign(pad.style, { transition: '', transform: '', opacity: '' });
        q('ipScr').classList.remove('off'); q('ipScr').innerHTML = '';
        document.body.classList.remove('ip-on');
        IP.on = false; IP.busy = false; IP.D = null; IP.app = null;
    }

    /* 🏠 홈 화면 : 시계 + 앱 6개 */
    function home() {
        IP.app = null; IP.D = null;
        const s = q('ipScr'); s.className = 'ip-scr ip-home';
        s.innerHTML = `<div class="ip-stat"><b id="ipTime">${hm()}</b></div>
            <div class="ip-apps">${APPS.map(([k, ic, n]) => `<button type="button" class="ip-app" data-k="${k}"><i class="a-${k}">${ic}</i><span>${n}</span></button>`).join('')}</div>
            <div class="ip-bar"></div>`;
        s.querySelectorAll('.ip-app').forEach(b => b.addEventListener('click', () => launch(b.dataset.k)));
    }
    setInterval(() => { const t = q('ipTime'); if (t && IP.on) t.textContent = hm(); }, 5000);

    /* 앱 열기 */
    function launch(k) {
        if (IP.busy) return;
        if (WAY[k]) {                                                         // 📃 🧻 🎀 🏷️ = 예전 만들기 화면 (아이패드는 뒤에서 기다려요 → 닫으면 홈)
            const b = q('ipScr').querySelector(`.ip-app[data-k="${k}"]`); if (b) { b.classList.add('tap'); setTimeout(() => b.classList.remove('tap'), 300); }
            if (window.craftWay) craftWay(WAY[k], k); return;
        }
        drawApp(k);
    }

    /* ✏️ 🧩 📄 그림 앱 : 직접 그리기 + 📎 사진 (사진은 맨 아래 · 그 위에 그려요) */
    function drawApp(k) {
        const paper = k === 'paper', W = paper ? 600 : 640, H = paper ? 800 : 640;
        const D = IP.D = { k, W, H, pen: PENS[0], size: SIZES[1], erase: false, photo: null, undo: [], dirty: false, down: null };
        IP.app = k;
        const s = q('ipScr'); s.className = 'ip-scr ip-draw';
        const name = (APPS.find(a => a[0] === k) || [])[2];
        s.innerHTML = `<div class="ipd-top"><button type="button" class="ipd-b" data-a="home">‹ 홈</button><b>${paper ? '📄' : '🧩'} ${name}</b>
                <span class="ipd-sp"></span><button type="button" class="ipd-b" data-a="photo">📎 사진</button><button type="button" class="ipd-b" data-a="undo">↩</button><button type="button" class="ipd-b" data-a="clear">🗑</button>
                <button type="button" class="ipd-b ipd-go" data-a="make">✅ 만들기</button></div>
            <div class="ipd-mid"><div class="ipd-cv${paper ? ' paper' : ''}" id="ipdCv" style="aspect-ratio:${W}/${H}"><canvas id="ipdPh" width="${W}" height="${H}"></canvas><canvas id="ipdInk" width="${W}" height="${H}"></canvas></div></div>
            <div class="ipd-tools">${PENS.map(c => `<button type="button" class="ipd-pen${c === D.pen ? ' on' : ''}" data-c="${c}" style="--c:${c}" aria-label="펜 색"></button>`).join('')}
                <span class="ipd-gap"></span>${SIZES.map(z => `<button type="button" class="ipd-sz${z === D.size ? ' on' : ''}" data-z="${z}" aria-label="굵기"><i style="width:${Math.max(4, z * .7)}px;height:${Math.max(4, z * .7)}px"></i></button>`).join('')}
                <button type="button" class="ipd-er" data-a="erase">🧽</button></div>
            <div class="ipd-tip">${paper ? '✏️ 종이에 그리거나 📎 사진을 깔아요 · 종이 한 장 그대로 모조지가 돼요 (가위로 오려 써요)' : '✏️ 그린 모양대로 하얀 칼선이 생겨요 · 📎 사진 위에 그려도 돼요'}</div>
            <input type="file" accept="image/*" id="ipdFile" hidden>`;
        s.querySelector('.ipd-top').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) act(b.dataset.a); });
        s.querySelector('.ipd-tools').addEventListener('click', e => {
            const p = e.target.closest('.ipd-pen'), z = e.target.closest('.ipd-sz'), er = e.target.closest('.ipd-er');
            if (p) { D.pen = p.dataset.c; D.erase = false; }
            if (z) D.size = +z.dataset.z;
            if (er) D.erase = !D.erase;
            s.querySelectorAll('.ipd-pen').forEach(b => b.classList.toggle('on', !D.erase && b.dataset.c === D.pen));
            s.querySelectorAll('.ipd-sz').forEach(b => b.classList.toggle('on', +b.dataset.z === D.size));
            s.querySelector('.ipd-er').classList.toggle('on', D.erase);
        });
        q('ipdFile').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) loadPhoto(f); });
        if (paper) { const x = q('ipdPh').getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
        const ink = q('ipdInk');
        ink.addEventListener('pointerdown', down); ink.addEventListener('pointermove', move);
        ink.addEventListener('pointerup', up); ink.addEventListener('pointercancel', up);
    }
    const pt = e => { const c = q('ipdInk'), r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
    function snap() { const D = IP.D, c = q('ipdInk'); D.undo.push(c.getContext('2d').getImageData(0, 0, c.width, c.height)); if (D.undo.length > 25) D.undo.shift(); }
    function stroke(a, b) {
        const D = IP.D, x = q('ipdInk').getContext('2d');
        x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = D.erase ? D.size * 2.2 : D.size;
        x.globalCompositeOperation = D.erase ? 'destination-out' : 'source-over'; x.strokeStyle = D.pen;
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0] + .01, b[1]); x.stroke(); x.restore();
    }
    function down(e) {
        const D = IP.D; if (!D || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.preventDefault(); try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
        snap(); const p = pt(e); D.down = { id: e.pointerId, last: p }; stroke(p, p); D.dirty = true;
    }
    function move(e) { const D = IP.D; if (!D || !D.down || D.down.id !== e.pointerId) return; const p = pt(e); stroke(D.down.last, p); D.down.last = p; }
    function up(e) { const D = IP.D; if (D && D.down && D.down.id === e.pointerId) D.down = null; }
    function loadPhoto(f) {
        const D = IP.D; if (!D) return;
        const u = URL.createObjectURL(f), im = new Image();
        im.onload = () => {
            const c = q('ipdPh'), x = c.getContext('2d'), W = c.width, H = c.height;
            x.clearRect(0, 0, W, H); if (D.k === 'paper') { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
            const k = D.k === 'paper' ? Math.max(W / im.width, H / im.height) : Math.min(W * .9 / im.width, H * .9 / im.height);   // 📄 종이 가득 · 🧩 조금 작게 가운데
            const w = im.width * k, h = im.height * k; x.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
            D.photo = true; D.dirty = true; URL.revokeObjectURL(u);
        };
        im.onerror = () => { URL.revokeObjectURL(u); if (window.showMsg) showMsg('사진을 열지 못했어요.'); };
        im.src = u;
    }
    async function act(a) {
        const D = IP.D; if (!D) return;
        if (a === 'home') { if (D.dirty && typeof showAsk === 'function' && !(await showAsk('그리던 그림이 사라져요.<br>홈으로 갈까요?', '홈으로', '계속 그리기'))) return; home(); return; }
        if (a === 'photo') { q('ipdFile').click(); return; }
        if (a === 'undo') { const s = D.undo.pop(); if (s) q('ipdInk').getContext('2d').putImageData(s, 0, 0); return; }
        if (a === 'clear') {
            snap(); const c = q('ipdInk'); c.getContext('2d').clearRect(0, 0, c.width, c.height);
            const p = q('ipdPh'), x = p.getContext('2d'); x.clearRect(0, 0, p.width, p.height); if (D.k === 'paper') { x.fillStyle = '#fff'; x.fillRect(0, 0, p.width, p.height); }
            D.photo = false; D.dirty = false; return;
        }
        if (a === 'make') make();
    }
    /* 한 장으로 합치기 (사진 + 그림) */
    function flat() { const D = IP.D, c = document.createElement('canvas'); c.width = D.W; c.height = D.H; const x = c.getContext('2d'); x.drawImage(q('ipdPh'), 0, 0); x.drawImage(q('ipdInk'), 0, 0); return c; }
    function trim(c, pad) {                                                  // 투명한 가장자리 잘라내기 (pad = 둘레 여백)
        const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) if (d[(y * c.width + i) * 4 + 3] > 10) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) return null;
        const o = document.createElement('canvas'); o.width = x1 - x0 + 1 + pad * 2; o.height = y1 - y0 + 1 + pad * 2;
        o.getContext('2d').drawImage(c, x0, y0, x1 - x0 + 1, y1 - y0 + 1, pad, pad, x1 - x0 + 1, y1 - y0 + 1); return o;
    }
    function dieCut(c) {                                                     // 🧩 그린 모양대로 하얀 칼선 (모양을 둘레로 하얗게 넓혀요)
        const R = 14, t = trim(c, R + 2); if (!t) return null;
        const sil = document.createElement('canvas'); sil.width = t.width; sil.height = t.height;
        const sx = sil.getContext('2d'); sx.drawImage(t, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#fff'; sx.fillRect(0, 0, t.width, t.height);
        const o = document.createElement('canvas'); o.width = t.width; o.height = t.height; const x = o.getContext('2d');
        for (let a = 0; a < 32; a++) { const g = a / 32 * Math.PI * 2; for (const r of [R, R * .6]) x.drawImage(sil, Math.cos(g) * r, Math.sin(g) * r); }
        x.drawImage(sil, 0, 0); x.drawImage(t, 0, 0);
        const k = Math.min(1, 300 / Math.max(o.width, o.height));             // 스티커 한 장 크기 (다른 만들기와 같은 정도)
        if (k >= 1) return o;
        const s = document.createElement('canvas'); s.width = Math.round(o.width * k); s.height = Math.round(o.height * k);
        s.getContext('2d').drawImage(o, 0, 0, s.width, s.height); return s;
    }
    async function make() {
        const D = IP.D; if (!D || D.saving) return;
        if (!D.dirty) { if (window.showMsg) showMsg(D.k === 'paper' ? '종이에 그리거나 📎 사진을 깔아 주세요.' : '먼저 그림을 그리거나 📎 사진을 넣어 주세요.'); return; }
        if (window.dkTrialNoSave && dkTrialNoSave()) return;                 // 🏪 샵 적용해보기 = 만들어 보기만
        if (!window.smAdd) { if (window.comingSoon) comingSoon('📱 아이패드 만들기'); return; }
        D.saving = true; const b = q('ipScr').querySelector('.ipd-go'); if (b) { b.disabled = true; b.textContent = '💾 만드는 중…'; }
        try {
            let r;
            if (D.k === 'piece') {
                const c = dieCut(flat()); if (!c) { if (window.showMsg) showMsg('그린 그림이 없어요.'); return; }
                r = await smAdd(window.cvSmall ? cvSmall(c) : c.toDataURL('image/png'), 'piece');
            } else {
                const c = flat(), k = Math.min(1, 480 / Math.max(c.width, c.height)), s = document.createElement('canvas');
                s.width = Math.round(c.width * k); s.height = Math.round(c.height * k); s.getContext('2d').drawImage(c, 0, 0, s.width, s.height);
                const src = window.cvSmall ? cvSmall(s) : s.toDataURL('image/png');
                const o = window.smPaperSheet ? await smPaperSheet([src]) : (window.pmMakeSheet ? [await pmMakeSheet([src])] : null); if (!o) return;
                r = await smAdd(o[0], 'paper');
            }
            if (window.smAddMsg) smAddMsg(r, D.k, false);
            if (r === 'ok') { D.dirty = false; act('clear'); }
        } finally { D.saving = false; if (b && b.isConnected) { b.disabled = false; b.textContent = '✅ 만들기'; } }
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && IP.on && !document.querySelector('.modal[style*="flex"]') && !document.querySelector('.smk-room.show, .shm-room.show')) closeIpad(); });
    window.openIpad = openIpad; window.closeIpad = closeIpad; window.ipadOn = () => IP.on;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['ipad'] = true;
