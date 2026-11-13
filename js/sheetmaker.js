/* 말랑달콤 다이어리 - js/sheetmaker.js
   🗂️ 시트 꾸미기 (도련 11-06 · 시안 '스티커 공방 시안' 시트 꾸미기) : 그림 여러 개를 한 장에 붙여 기본 씰스티커처럼
   - 여는 곳 : ✂️ 스티커 만들기 → 🏷️ 씰스티커 → '🗂️ 시트 꾸미기' (js/craft.js CRAFT_WAYS.sheet)
   - 1 시트 모양 (세로 · 가로 · 정사각) · 바탕 (흰 대지 · 투명 · 크라프트 · 홀로그램)
     2 그림 넣기 : 📷 사진 찍기 · 🖼️ 앨범(여러 장) · 🔤 글씨 → 지금 스티커 만들기 화면(모양 · 오리기 · 글꼴)을 지나 '🗂️ 시트에 넣기' (js/stickermaker.js smSheetGo)
                  🏷️ 내가 만든 씰 : 내가 만든 씰 종이의 남은 그림을 골라 넣어요 (그 종이는 그대로)
     3 자리 잡기 : 끌어 옮기기 · 크게 · 작게 · 돌리기 · 맨 앞으로 · 빼기 · ✨ 알아서 놓기 (🖱 휠 = 크기)
     4 마무리 : 유광 · 무광 · 반짝 · 시트 이름표 → 🏷️ 시트 완성
   - 저장 = 기본 씰스티커와 같은 모양 (js/own.js ownAdd) : 그림마다 한 장 (돌린 모습 · 마무리를 그림에 구워요) + 배치 L { r : 가로÷세로, b : [x, y, w, h] 0~1 }
     + 바탕 그림 x.sb (색 · 무늬 · 이름표 · 떼는 창이 그려요 js/stickerpeel.js) + 바구니 카드 th (시트 모습 그대로)
     → 🧺 바구니 · 떼어 쓰기 · 스티커첩이 기본 시트처럼 (다 뗀 자리는 빈 자리) · baked = 하얀 테두리를 이미 둘렀어요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (스티커 만들기의 '시트 꾸미기'만 안 보여요) */
(function () {
    const q = id => document.getElementById(id);
    const SIZES = { tall: ['세로', 350, 500], wide: ['가로', 500, 350], square: ['정사각', 430, 430] };   // 세로 = A6 비율 (기본 씰 시트와 같아요)
    const BGS = { white: '흰 대지', clear: '투명', kraft: '크라프트', holo: '홀로그램' };
    const FINS = { gloss: '유광', matte: '무광', holo: '반짝' };
    const MAX = 40, OUT_H = 1288, SB_H = 644, OUT_MAX = 1024;            // OUT_H : 그림을 굽는 시트 높이 (떼는 창 시트 높이 644 의 두 배 · 선명하게)
    const S = { on: false, size: 'tall', bg: 'white', fin: 'gloss', title: '', items: [], sel: null, seq: 1, k: 1, busy: false };
    const dims = () => SIZES[S.size].slice(1);
    const esc = htmlEsc;   // 🧰 js/util.js
    const loadImg = loadImgP;   // 🧰 js/util.js

    function build() {
        let el = q('shmRoom'); if (el) return el;
        el = document.createElement('div'); el.id = 'shmRoom'; el.className = 'shm-room';
        el.innerHTML = `<div class="shm-bar"><div class="shm-sign">🗂️ 시트 꾸미기<small>그림 여러 개를 한 장에 · 끌어서 자리를 잡아요</small></div><button type="button" class="shm-x" id="shmX">닫기</button></div>
            <div class="shm-body">
              <section class="shm-panel shm-l">
                <h4>1 · 시트 모양</h4><div class="shm-row" id="shmSizes"></div><div class="shm-two" id="shmBgs"></div>
                <h4>2 · 그림 넣기</h4>
                <div class="shm-srcs">
                  <button type="button" class="shm-src" data-src="cam"><i>📷</i>사진 찍기</button>
                  <button type="button" class="shm-src" data-src="file"><i>🖼️</i>앨범에서 고르기</button>
                  <button type="button" class="shm-src" data-src="text"><i>🔤</i>글씨 스티커</button>
                  <button type="button" class="shm-src" data-src="mine"><i>🏷️</i>내가 만든 씰</button>
                </div>
              </section>
              <section class="shm-mat" id="shmMat"><div class="shm-fit" id="shmFit"><div class="shm-paper" id="shmPaper"><p class="shm-ttl" id="shmTtl"></p><div id="shmItems"></div></div></div>
                <p class="shm-say" id="shmSay"></p></section>
              <section class="shm-panel shm-r">
                <h4>3 · 자리 잡기</h4>
                <button type="button" class="shm-b" id="shmAuto">✨ 알아서 놓기</button>
                <div class="shm-two" id="shmTools">
                  <button type="button" class="shm-b" data-t="big">크게</button><button type="button" class="shm-b" data-t="small">작게</button>
                  <button type="button" class="shm-b" data-t="rl">↺ 돌리기</button><button type="button" class="shm-b" data-t="rr">↻ 돌리기</button>
                  <button type="button" class="shm-b" data-t="front">맨 앞으로</button><button type="button" class="shm-b" data-t="del">빼기</button>
                </div>
                <p class="shm-hint" id="shmNoSel">시트의 그림을 누르면 크기 · 돌리기를 바꿀 수 있어요</p>
                <h4>4 · 마무리</h4><div class="shm-row" id="shmFins"></div>
                <label class="shm-lb" for="shmTitle">시트 이름표 <small>(비우면 없어요)</small></label>
                <input id="shmTitle" class="shm-in" maxlength="14" placeholder="예: 말랑 딸기밭">
                <button type="button" class="shm-go" id="shmDone">🏷️ 시트 완성</button>
              </section>
            </div>
            <div class="shm-pick" id="shmPick" hidden><div class="shm-pick-box"><div class="shm-pick-h"><b>🏷️ 내가 만든 씰에서 고르기</b><button type="button" class="shm-x" id="shmPickX">닫기</button></div><div class="shm-pick-g" id="shmPickG"></div></div></div>`;
        document.body.appendChild(el);
        q('shmX').onclick = () => closeSheetMaker();
        q('shmTitle').oninput = e => { S.title = e.target.value; paintPaper(); };
        q('shmAuto').onclick = () => { arrange(); paintPaper(); };
        q('shmDone').onclick = () => finish();
        q('shmPickX').onclick = () => { q('shmPick').hidden = true; };
        el.querySelectorAll('.shm-src').forEach(b => b.onclick = () => addFrom(b.dataset.src));
        q('shmTools').onclick = e => { const b = e.target.closest('[data-t]'); if (b) tool(b.dataset.t); };
        q('shmPaper').addEventListener('pointerdown', down);
        q('shmMat').addEventListener('pointerdown', e => { if (!e.target.closest('.shm-it') && !e.target.closest('.shm-paper')) { S.sel = null; paintPaper(); } });
        q('shmPaper').addEventListener('wheel', e => { const it = selIt(); if (!it) return; e.preventDefault(); it.w = Math.max(30, Math.min(dims()[0] * 1.2, it.w * (e.deltaY < 0 ? 1.06 : .94))); paintPaper(); }, { passive: false });
        addEventListener('resize', () => { if (S.on) fit(); });
        return el;
    }
    function paintChips() {
        q('shmSizes').innerHTML = Object.entries(SIZES).map(([k, v]) => `<button type="button" class="shm-c${S.size === k ? ' on' : ''}" data-v="${k}">${v[0]}</button>`).join('');
        q('shmBgs').innerHTML = Object.entries(BGS).map(([k, v]) => `<button type="button" class="shm-c${S.bg === k ? ' on' : ''}" data-v="${k}">${v}</button>`).join('');
        q('shmFins').innerHTML = Object.entries(FINS).map(([k, v]) => `<button type="button" class="shm-c${S.fin === k ? ' on' : ''}" data-v="${k}">${v}</button>`).join('');
        q('shmSizes').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const [W0, H0] = dims(); S.size = b.dataset.v; const [W, H] = dims();
            S.items.forEach(it => { it.cx = it.cx / W0 * W; it.cy = it.cy / H0 * H; }); paintChips(); fit(); paintPaper(); };
        q('shmBgs').onclick = e => { const b = e.target.closest('[data-v]'); if (b) { S.bg = b.dataset.v; paintChips(); paintPaper(); } };
        q('shmFins').onclick = e => { const b = e.target.closest('[data-v]'); if (b) { S.fin = b.dataset.v; paintChips(); paintPaper(); } };
    }
    /* 시트를 매트에 맞게 (그림 자리는 시트 px 그대로 · 보이는 크기만 줄여요) */
    function fit() {
        const m = q('shmMat'), [W, H] = dims(); if (!m) return;
        const r = m.getBoundingClientRect(), k = Math.max(.2, Math.min((r.width - 32) / W, (r.height - 56) / H, 1.6));
        S.k = k;
        Object.assign(q('shmFit').style, { width: W * k + 'px', height: H * k + 'px' });
        Object.assign(q('shmPaper').style, { width: W + 'px', height: H + 'px', transform: `scale(${k})` });
    }
    const selIt = () => S.items.find(it => it.id === S.sel) || null;
    function paintPaper() {
        const p = q('shmPaper'); if (!p) return;
        p.className = 'shm-paper bg-' + S.bg;
        const t = q('shmTtl'); t.textContent = S.title.trim(); t.hidden = !S.title.trim();
        const L = S.items.slice().sort((a, b) => a.z - b.z);
        q('shmItems').innerHTML = L.map(it => { const h = it.w * it.ar;
            return `<div class="shm-it${it.id === S.sel ? ' sel' : ''} fin-${S.fin}" data-id="${it.id}" style="left:${(it.cx - it.w / 2).toFixed(1)}px;top:${(it.cy - h / 2).toFixed(1)}px;width:${it.w.toFixed(1)}px;height:${h.toFixed(1)}px;transform:rotate(${it.r}deg)"><img src="${esc(it.src)}" alt="" draggable="false"><i style="--m:url('${esc(it.src)}')"></i></div>`; }).join('');
        const has = !!selIt();
        q('shmTools').hidden = !has; q('shmNoSel').hidden = has;
        q('shmSay').textContent = S.items.length ? `그림 ${S.items.length}개 · 그림을 끌어 옮겨요 · 빈 곳을 누르면 고른 것이 풀려요` : '왼쪽 ‘그림 넣기’로 시트에 붙일 그림을 넣어요';
        q('shmDone').disabled = !S.items.length || S.busy;
    }
    /* 끌어 옮기기 */
    function down(ev) {
        const el = ev.target.closest('.shm-it');
        if (!el) { S.sel = null; paintPaper(); return; }
        ev.preventDefault();
        const it = S.items.find(x => x.id === +el.dataset.id); if (!it) return;
        const top = S.items.reduce((m, x) => Math.max(m, x.z), 0);
        S.sel = it.id; paintPaper();
        const x0 = ev.clientX, y0 = ev.clientY, cx0 = it.cx, cy0 = it.cy, [W, H] = dims();
        const mv = e => { if (e.pointerId !== ev.pointerId) return;
            it.cx = Math.max(0, Math.min(W, cx0 + (e.clientX - x0) / S.k)); it.cy = Math.max(0, Math.min(H, cy0 + (e.clientY - y0) / S.k));
            const d = q('shmItems').querySelector(`[data-id="${it.id}"]`), h = it.w * it.ar;
            if (d) { d.style.left = (it.cx - it.w / 2) + 'px'; d.style.top = (it.cy - h / 2) + 'px'; } };
        const up = e => { if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
        addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        void top;
    }
    function tool(t) {
        const it = selIt(); if (!it) return;
        const [W] = dims();
        if (t === 'big') it.w = Math.min(W * 1.2, it.w * 1.15);
        else if (t === 'small') it.w = Math.max(30, it.w / 1.15);
        else if (t === 'rl') it.r -= 10;
        else if (t === 'rr') it.r += 10;
        else if (t === 'front') it.z = S.items.reduce((m, x) => Math.max(m, x.z), 0) + 1;
        else if (t === 'del') { S.items = S.items.filter(x => x !== it); S.sel = null; }
        paintPaper();
    }
    /* ✨ 알아서 놓기 : 개수에 맞춰 칸을 나누고 칸 가운데에 살짝 기울여서 */
    function arrange() {
        const [W, H] = dims(), n = S.items.length; if (!n) return;
        const top = S.title.trim() ? 50 : 14, ih = H - top - 14, cols = Math.max(1, Math.round(Math.sqrt(n * W / ih))), rows = Math.ceil(n / cols);
        const cw = (W - 20) / cols, ch = ih / rows, TILT = [-6, 5, -3, 7, -5, 3];
        S.items.slice().sort((a, b) => a.z - b.z).forEach((it, i) => {
            const c = i % cols, r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols), sx = (cols - inRow) * cw / 2;
            const s = Math.min(cw * .86, ch * .86 / it.ar);
            Object.assign(it, { w: s, cx: 10 + sx + c * cw + cw / 2, cy: top + r * ch + ch / 2, r: TILT[i % 6] });
        });
    }
    async function addImgs(srcs) {
        const room = MAX - S.items.length;
        if (room <= 0) { showMsg(`🗂️ 시트 한 장에는 그림을 ${MAX}개까지 붙일 수 있어요.`); return; }
        const L = srcs.filter(Boolean).slice(0, room), [W, H] = dims();
        for (const src of L) {
            let im; try { im = await loadImg(src); } catch (e) { continue; }
            const ar = (im.naturalHeight || 1) / (im.naturalWidth || 1), n = S.items.length, z = S.items.reduce((m, x) => Math.max(m, x.z), 0) + 1;
            const w = Math.min(W * .38, H * .38 / ar);
            S.items.push({ id: S.seq++, src, img: im, ar, w, cx: W / 2 + ((n % 5) - 2) * 22, cy: H / 2 + ((n % 3) - 1) * 26, r: [-6, 5, -3, 7][n % 4], z });
            S.sel = S.items[S.items.length - 1].id;
        }
        if (srcs.length > room) showMsg(`🗂️ 시트 한 장에는 그림을 ${MAX}개까지라서 앞의 ${room}개만 넣었어요.`);
        paintPaper();
    }
    function addFrom(how) {
        if (how === 'mine') return pickMine();
        if (!window.smSheetGo) { showMsg('스티커 만들기를 불러오지 못했어요.'); return; }
        smSheetGo(srcs => { addImgs(srcs); }, how);
    }
    /* 🏷️ 내가 만든 씰 : 남은 그림만 (그 종이는 그대로 · 시트에는 같은 그림이 한 번 더) */
    async function pickMine() {
        const box = q('shmPick'), g = q('shmPickG'); box.hidden = false; g.innerHTML = '<p class="shm-hint">내가 만든 씰을 꺼내는 중…</p>';
        let out = [];
        try {
            const L = ((window.ownList ? await ownList(false, 'seal') : []) || []).filter(e => e.k === 'seal' && e.from === 'mine').sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 24);
            for (const e of L) { const r = window.ownSheetImgs ? await ownSheetImgs(e.id) : null; if (r) r.imgs.forEach(u => { if (u) out.push(u); }); if (out.length >= 80) break; }
        } catch (e) { console.warn('🗂️ 내가 만든 씰', e); }
        if (box.hidden) return;
        g.innerHTML = out.length ? out.map((u, i) => `<button type="button" class="shm-pk" data-i="${i}"><img src="${esc(u)}" alt="" draggable="false"></button>`).join('')
            : '<p class="shm-hint">아직 내가 만든 씰스티커가 없어요.<br>📷 사진이나 🔤 글씨로 넣어 보세요.</p>';
        g.onclick = ev => { const b = ev.target.closest('.shm-pk'); if (!b) return; b.classList.add('on'); addImgs([out[+b.dataset.i]]); };
    }

    /* ---------- 🏷️ 시트 완성 : 그림마다 돌린 모습 · 마무리를 구워서 + 배치 + 바탕 ---------- */
    function finPaint(c, w, h) {                                              // 그림 위에만 (source-atop)
        c.save(); c.globalCompositeOperation = 'source-atop';
        if (S.fin === 'gloss') { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(.30, 'rgba(255,255,255,0)'); g.addColorStop(.44, 'rgba(255,255,255,.55)'); g.addColorStop(.58, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
        else if (S.fin === 'matte') { c.fillStyle = 'rgba(255,250,245,.16)'; c.fillRect(0, 0, w, h); }
        else if (S.fin === 'holo') { const g = c.createLinearGradient(0, 0, w, h); ['rgba(255,140,200,.32)', 'rgba(140,220,255,.32)', 'rgba(255,240,140,.32)', 'rgba(190,150,255,.32)'].forEach((s, i) => g.addColorStop(i / 3, s)); c.globalCompositeOperation = 'source-atop'; c.fillStyle = g; c.fillRect(0, 0, w, h); }
        c.restore();
    }
    function bgPaint(c, w, h, title) {
        if (S.bg === 'white') { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); }
        else if (S.bg === 'clear') { c.fillStyle = 'rgba(255,255,255,.45)'; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.35)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
        else if (S.bg === 'kraft') { c.fillStyle = '#e2bf94'; c.fillRect(0, 0, w, h); let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
            for (let i = 0; i < w * h / 260; i++) { c.fillStyle = rnd() < .5 ? 'rgba(120,80,40,.18)' : 'rgba(255,240,215,.25)'; c.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); } }
        else { const g = c.createLinearGradient(0, 0, w, h); ['#ffe3f1', '#e1f3ff', '#fff6d6', '#eadfff'].forEach((s, i) => g.addColorStop(i / 3, s)); c.fillStyle = g; c.fillRect(0, 0, w, h); }
        if (title) { const k = h / dims()[1], ff = getComputedStyle(document.body).fontFamily || 'sans-serif';
            c.fillStyle = '#6b4a55'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 ${Math.round(24 * k)}px ${ff}`; c.fillText(title, w / 2, 28 * k); }
    }
    async function finish() {
        if (S.busy || !S.items.length) return;
        if (!window.ownAdd) { showMsg('스티커를 저장하지 못했어요.'); return; }
        S.busy = true; paintPaper(); q('shmDone').textContent = '🏷️ 시트를 만드는 중…';
        try {
            const [W, H] = dims(), k = OUT_H / H, L = S.items.slice().sort((a, b) => a.z - b.z), imgs = [], wh = [], b = [];
            for (const it of L) {
                const w = it.w, h = it.w * it.ar, a = it.r * Math.PI / 180, bw = Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a)), bh = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
                const sc = Math.min(k, OUT_MAX / bw, OUT_MAX / bh), cw = Math.max(1, Math.ceil(bw * sc)), ch = Math.max(1, Math.ceil(bh * sc));
                const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const c = cv.getContext('2d');
                c.translate(cw / 2, ch / 2); c.rotate(a); c.drawImage(it.img, -w * sc / 2, -h * sc / 2, w * sc, h * sc); c.setTransform(1, 0, 0, 1, 0, 0);
                finPaint(c, cw, ch);
                let u = ''; try { u = cv.toDataURL('image/webp', .9); } catch (e) {} if (!/^data:image\/webp/.test(u)) u = cv.toDataURL('image/png');
                imgs.push(u); wh.push([cw, ch]); b.push([(it.cx - bw / 2) / W, (it.cy - bh / 2) / H, bw / W, bh / H]);
            }
            const title = S.title.trim();
            const sbc = document.createElement('canvas'); sbc.width = Math.round(SB_H * W / H); sbc.height = SB_H; bgPaint(sbc.getContext('2d'), sbc.width, sbc.height, title);
            let sb = ''; try { sb = sbc.toDataURL('image/webp', .85); } catch (e) {} if (!/^data:image\/webp/.test(sb)) sb = sbc.toDataURL('image/png');
            const TH = 240, tc = document.createElement('canvas'); tc.width = Math.round(TH * W / H); tc.height = TH; const t = tc.getContext('2d');
            t.drawImage(sbc, 0, 0, tc.width, tc.height);
            const ims = await Promise.all(imgs.map(loadImg));
            ims.forEach((im, i) => t.drawImage(im, b[i][0] * tc.width, b[i][1] * tc.height, b[i][2] * tc.width, b[i][3] * tc.height));
            let th = ''; try { th = tc.toDataURL('image/webp', .8); } catch (e) {} if (!/^data:image\/webp/.test(th)) th = tc.toDataURL('image/png');
            await ownAdd({ k: 'seal', from: 'mine', nm: (title || '내가 꾸민 시트').slice(0, 20), baked: true, imgs, wh, L: { r: W / H, b }, x: { sb } }, { th });
            S.items = []; S.sel = null; S.title = ''; q('shmTitle').value = '';
            S.busy = false; q('shmDone').textContent = '🏷️ 시트 완성';
            closeSheetMaker(true);
            showMsg('🏷️ 시트 한 장이 나왔어요!<br><span style="font-size:12px;color:#777;">🗄️ 서랍 · 🏷️ 씰에 들어갔어요. 기본 씰스티커처럼 떼어 쓸 수 있어요.</span>');
        } catch (e) {
            console.warn('🗂️ 시트 완성', e);
            S.busy = false; q('shmDone').textContent = '🏷️ 시트 완성'; paintPaper();
            showMsg('⚠ 시트를 저장하지 못했어요.<br><span style="font-size:12px;color:#777;">로그인 · 인터넷 연결을 확인하고 다시 해 주세요.</span>');
        }
    }

    function openSheetMaker() {
        const el = build(); S.on = true; el.classList.add('show');
        if (q('shmPick')) q('shmPick').hidden = true;
        paintChips(); fit(); paintPaper();
    }
    async function closeSheetMaker(force) {
        if (!force && S.items.length && !await showMsg('🗂️ 꾸미던 시트를 그만할까요?<br><span style="font-size:12px;color:#777;">붙인 그림은 없어져요.</span>', true)) return;
        if (!force) { S.items = []; S.sel = null; }
        S.on = false; const el = q('shmRoom'); if (el) el.classList.remove('show');
    }
    document.addEventListener('keydown', e => { if (!S.on || document.querySelector('.modal[style*="flex"]') || (q('smRoom') && q('smRoom').classList.contains('show'))) return;
        if (e.key === 'Escape') { e.stopPropagation(); if (!q('shmPick').hidden) q('shmPick').hidden = true; else closeSheetMaker(); }
        else if ((e.key === 'Delete' || e.key === 'Backspace') && selIt() && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); tool('del'); } }, true);
    window.openSheetMaker = openSheetMaker; window.closeSheetMaker = closeSheetMaker; window.sheetMakerOn = () => S.on;
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['sheetmaker'] = true;
