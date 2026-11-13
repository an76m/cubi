/* 말랑달콤 다이어리 - js/padpaint.js
   🎨 태블릿 그림판 (도련 11-13 · 1172 · 시안 '그리기시안' 그대로) : 📃 속지부터 · 나중에 떡메 · 마테 · 조각 · 모조지에도 같은 작업대
   - 💻 📲 태블릿 작업대(js/tablet.js #tbWs) 세 칸에 그려요 : 왼쪽 = 가져오기 · 도구 · 도구 설정 · 색 / 가운데 = 종이 · 보기 막대 / 오른쪽 = 레이어 · 고른 것 설정 · 🗄️ 서랍에 넣기
   - 위 = 🖌️ 픽셀 ↔ ✒️ 벡터 · ↶ ↷
   - 🗂️ 레이어 : 종이(맨 아래 · 🧵 종이 꾸미기 = js/maker.js) · 사진(📎) · 픽셀 · 벡터 섞어서 · 👁 · 🔒 · 섞는 법 · 투명도 · 그린 곳만 칠
   - 🖌️ 픽셀 = 손으로 쓱쓱 (펜 압력 = 굵기 · 떨림 보정 = 마우스도 매끈) : 브러시(붓 모양 6) · 연필 · 마커 · 에어 · 지우개 · 채우기 · 스포이드 · 올가미 · 옮기기 · 도형 · 글씨 · 확대
   - ✒️ 벡터 = 점을 찍어 그려요 (펜 없이 마우스로도) : 선택 · 점 고치기 · 점 찍기(클릭 = 꺾인 점 · 끌기 = 둥근 점 · 첫 점 = 닫기 · Enter = 끝) · 곡선 · 네모 · 동그라미 · 하트 · 별 · 글씨 · 점 자르기 · 칠하기 · 옮기기
   - 💾 임시저장 (도련 11-14) = 도안/작업중-속지.json 하나에 모두 (레이어 · 그림 PNG · 사진 JPEG · 벡터 점 · 종이 · 도구) · 종류마다 하나 · 열 때 [이어서 작업] [새 작업] (js/tablet.js)
   - ✅ 완료 = 보이는 레이어를 한 장으로 → 📃 속지 한 장 (🗄️ 서랍 + 📐 도안 · js/own.js ownTake · 예전 속지 만들기와 같아요) → 작업 중 파일은 지워요 */
(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const SW = ['#3d2b33', '#ff5d8f', '#ff9a3c', '#ffd23f', '#5cc98a', '#4aa8ff', '#9b7bff', '#ffffff', '#ffb3c8', '#ffe7a3', '#bfe9d3', '#cfe3ff'];
    const T_PX = [['brush', '🖌️', '브러시'], ['pencil', '✏️', '연필'], ['marker', '🖍️', '마커'], ['air', '💨', '에어'], ['erase', '🧽', '지우개'], ['fill', '🪣', '채우기'], ['drop', '💧', '스포이드'], ['lasso', '➰', '올가미'], ['move', '✋', '옮기기'], ['shape', '⬛', '도형'], ['text', '🔤', '글씨'], ['zoom', '🔍', '확대']];
    const T_VC = [['select', '↖️', '선택'], ['direct', '◦', '점 고치기'], ['pen', '✒️', '점 찍기'], ['curve', '〰️', '곡선'], ['rect', '▭', '네모'], ['ellipse', '◯', '동그라미'], ['heart', '♡', '하트'], ['star', '☆', '별'], ['vtext', '🔤', '글씨'], ['cut', '✂️', '점 자르기'], ['paint', '🪣', '칠하기'], ['vmove', '✋', '옮기기']];
    const BRUSH = [['pencil', '연필'], ['round', '둥근 펜'], ['water', '수채'], ['crayon', '크레용'], ['hi', '형광펜'], ['glit', '반짝이']];
    const BLEND = [['source-over', '보통'], ['multiply', '곱하기'], ['screen', '밝게'], ['overlay', '겹치기']];
    const TAG = { paper: ['pp', '종이'], photo: ['ph', '사진'], px: ['px', '픽셀'], vec: ['vc', '벡터'] };
    const P = {};                                                                // 지금 그림판
    let uid = 1;
    const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const say = (t, ms) => { const b = $('ppSay'); if (!b) return; b.textContent = t; b.classList.add('on'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), ms || 1800); };
    const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const rgbHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    /* ================= 열기 · 닫기 ================= */
    function ppOpen(o) {
        const W = o.W || 900, H = o.H || 1395;
        Object.assign(P, { on: true, o, kind: o.kind || 'leaf', W, H, layers: [], cur: null, mode: 'px', tool: 'brush', brush: 'round', size: 8, op: .9, soft: .45, stab: .6,
            vsw: 6, vround: 12, color: '#ff5d8f', recent: ['#4aa8ff', '#ffd23f', '#5cc98a'], hsv: [340, .64, 1], z: 1, px: 0, py: 0, base: 1, grid: false, sym: false,
            hist: [], redo: [], sel: null, pt: null, pen: null, lasso: null, fl: null, drag: null, shapeK: 'rect', shapeFill: false, dirty: false, keyOn: true });
        if (o.draft) { buildUI(); fit(); restoreDraft(o.draft); }
        else {
            const paper = addLayer('paper', '종이', { lock: true, mk: Object.assign({ bg: o.bg || '#ffffff' }, o.mk || {}) });
            const L1 = addLayer('px', '그림 1'); P.cur = L1;
            buildUI(); paperPaint(paper); fit(); renderAll(); paintLayers(); paintProps();
        }
        window.addEventListener('resize', fit); document.addEventListener('keydown', onKey);
    }
    function ppClose() {
        if (!P.on) return; P.on = false;
        window.removeEventListener('resize', fit); document.removeEventListener('keydown', onKey);
        const x = $('ppBarX'); if (x) x.remove();
        const pop = $('ppPop'); if (pop) pop.remove();
    }
    const ppDirty = () => !!(P.on && P.dirty);

    /* ================= 레이어 ================= */
    function addLayer(type, name, extra, at) {
        const L = Object.assign({ id: uid++, type, name, vis: true, lock: false, op: 1, blend: 'source-over', aLock: false, cv: mkCv(P.W, P.H), shapes: [], dirtyV: true }, extra || {});
        if (type === 'vec') L.cache = mkCv(P.W, P.H);
        if (at == null) { const i = P.cur ? P.layers.indexOf(P.cur) + 1 : P.layers.length; P.layers.splice(i, 0, L); } else P.layers.splice(at, 0, L);
        return L;
    }
    function paperPaint(L) {                                                    // 🧵 종이 (js/maker.js 속지 종이 그대로)
        const x = L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.fillStyle = L.mk.bg || '#fff'; x.fillRect(0, 0, P.W, P.H);
        if (window.MK && MK.paperSvg && MK.url) {
            const im = new Image(); im.onload = () => { x.clearRect(0, 0, P.W, P.H); x.drawImage(im, 0, 0, P.W, P.H); renderAll(); paintLayers(); }; im.src = MK.url(MK.paperSvg(L.mk, P.W, P.H));
        } else { x.strokeStyle = L.mk.lc || '#f6d5df'; x.lineWidth = 2; for (let y = (L.mk.gap || 56); y < P.H; y += (L.mk.gap || 56)) { x.beginPath(); x.moveTo(0, y); x.lineTo(P.W, y); x.stroke(); } }
    }
    function photoPaint(L) {                                                    // 📎 사진 레이어 : 종이 가득 (크기 · 자리 · 연하게)
        const x = L.cv.getContext('2d'), im = L.img; x.clearRect(0, 0, P.W, P.H);
        const k = Math.max(P.W / im.width, P.H / im.height) * L.s, w = im.width * k, h = im.height * k;
        x.drawImage(im, (P.W - w) / 2 + L.ox, (P.H - h) / 2 + L.oy, w, h);
        if (L.wash) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(255,255,255,${L.wash})`; x.fillRect(0, 0, P.W, P.H); x.globalCompositeOperation = 'source-over'; }
    }
    function vecPaint(L) {                                                      // ✒️ 벡터 레이어 → 그림 (바뀔 때만)
        const x = L.cache.getContext('2d'); x.clearRect(0, 0, P.W, P.H);
        L.shapes.forEach(s => drawShape(x, s)); L.dirtyV = false;
    }
    const layerImg = L => { if (L.type === 'vec') { if (L.dirtyV) vecPaint(L); return L.cache; } return L.cv; };

    /* ================= 화면 (작업대 세 칸) ================= */
    function buildUI() {
        const o = P.o;
        const bar = o.bar, x = document.createElement('div'); x.id = 'ppBarX'; x.className = 'pp-barx';
        x.innerHTML = `<div class="pp-mode"><button type="button" data-m="px">🖌️ 픽셀<small>손으로 쓱쓱 · 펜 있으면 좋아요</small></button><button type="button" data-m="vec">✒️ 벡터<small>점을 찍어 그려요 · 마우스로도</small></button></div>
            <div class="pp-qa"><button type="button" data-q="undo" title="되돌리기 (Ctrl+Z)">↶</button><button type="button" data-q="redo" title="다시 (Ctrl+Y)">↷</button></div>`;
        bar.appendChild(x);
        x.addEventListener('click', e => { const m = e.target.closest('[data-m]'), qq = e.target.closest('[data-q]'); if (m) setMode(m.dataset.m); if (qq) (qq.dataset.q === 'undo' ? undo : redo)(); });
        o.L.innerHTML = `<h4>📥 가져오기</h4><div class="pp-src"><button type="button" data-a="photo">📎 사진</button><button type="button" data-a="paper">🧵 종이 꾸미기</button></div>
            <h4 id="ppToolT"></h4><div class="pp-tools" id="ppTools"></div><div id="ppOpt"></div>
            <h4>🎨 색</h4><div class="pp-col"><canvas id="ppSv" width="172" height="172"></canvas><div><canvas id="ppHue" width="300" height="24"></canvas><div class="pp-sw" id="ppSw"></div></div></div>
            <div class="pp-cur"><span id="ppNow"></span>지금 색 · 최근 <span id="ppRec"></span></div>
            <input type="file" accept="image/*" id="ppFile" hidden>`;
        o.C.innerHTML = `<div class="pp-stage" id="ppStage"><div class="pp-doc" id="ppDoc"><canvas id="ppCv" width="${P.W}" height="${P.H}"></canvas><canvas id="ppOv" width="${P.W}" height="${P.H}"></canvas></div>
                <i class="pp-brush" id="ppBr"></i><div class="pp-fl" id="ppFlS" hidden></div><div class="pp-fl" id="ppFlP" hidden></div><div class="pp-say" id="ppSay"></div></div>
            <div class="pp-view"><button type="button" data-v="out">－</button><b id="ppZ">100%</b><button type="button" data-v="in">＋</button><button type="button" data-v="hand">✋ 손바닥</button><button type="button" data-v="grid">▦ 격자</button><button type="button" data-v="sym">⇋ 대칭</button><button type="button" data-v="fit">🔲 맞춤</button></div>`;
        o.R.innerHTML = `<h4>🗂️ 레이어<em>위가 앞이에요 · 끌어서 순서</em></h4><div class="pp-layers" id="ppLy"></div>
            <div class="pp-lyb"><button type="button" class="add" data-l="px">＋ 픽셀</button><button type="button" class="add" data-l="vec">＋ 벡터</button><button type="button" data-l="dup">⧉ 복제</button><button type="button" data-l="del">🗑 삭제</button></div>
            <div class="pp-lyb three"><button type="button" data-l="merge">⤓ 아래로 합치기</button><button type="button" data-l="lock">🔒 잠그기</button><button type="button" data-l="cutl">✂ 잘라 붙이기</button></div>
            <h4 id="ppPropT"></h4><div id="ppProp" class="pp-prop"></div>
            <div class="pp-end"><button type="button" class="pp-tmp" id="ppTmp">💾 임시저장</button><button type="button" class="shm-go pp-go" id="ppGo">✅ 완료</button></div>
            <p class="pp-hint pp-endt">💾 임시저장 = 그리던 그대로 (나중에 이어서) · ✅ 완료 = 🗄️ 서랍에 속지 한 장</p>`;
        o.L.onclick = e => { const a = e.target.closest('[data-a]'); if (a) { if (a.dataset.a === 'photo') $('ppFile').click(); if (a.dataset.a === 'paper') paperPop(); } };
        $('ppFile').onchange = e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) addPhoto(f); };
        $('ppTools').onclick = e => { const b = e.target.closest('[data-t]'); if (b) setTool(b.dataset.t); };
        $('ppOpt').oninput = $('ppOpt').onclick = onOpt;
        o.C.querySelector('.pp-view').onclick = e => { const b = e.target.closest('[data-v]'); if (b) onView(b.dataset.v); };
        o.R.querySelector('.pp-lyb').parentElement.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) layerAct(b.dataset.l); });
        $('ppGo').onclick = save; $('ppTmp').onclick = () => saveDraft();
        $('ppProp').oninput = $('ppProp').onclick = onProp;
        colorWire(); paintTools(); modeBtns();
        const st = $('ppStage');
        st.addEventListener('pointerdown', down); st.addEventListener('pointermove', move); st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
        st.addEventListener('pointerleave', () => { $('ppBr').hidden = true; });
        st.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY); }, { passive: false });
        st.addEventListener('dblclick', e => { if (P.tool === 'pen' && P.pen) penEnd(); });
        $('ppFlS').onclick = e => { const b = e.target.closest('[data-s]'); if (b) shapeAct(b.dataset.s); };
        $('ppFlP').onclick = e => { const b = e.target.closest('[data-p]'); if (b) pointAct(b.dataset.p); };
    }
    function modeBtns() { document.querySelectorAll('#ppBarX [data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === P.mode)); }
    function setMode(m) {
        if (P.mode === m) return; commitFloat(); penEnd(); P.mode = m; P.sel = null; P.pt = null;
        const want = m === 'px' ? 'px' : 'vec';
        if (!P.cur || P.cur.type !== want) {                                       // 그 모드의 레이어로 (없으면 새로)
            const L = [...P.layers].reverse().find(l => l.type === want);
            if (L) P.cur = L; else { P.cur = addLayer(want, want === 'px' ? '그림 ' + (P.layers.filter(l => l.type === 'px').length + 1) : '모양 ' + (P.layers.filter(l => l.type === 'vec').length + 1)); say(want === 'vec' ? '✒️ 벡터 레이어를 새로 만들었어요' : '🖌️ 픽셀 레이어를 새로 만들었어요'); }
        }
        P.tool = m === 'px' ? 'brush' : 'pen';
        modeBtns(); paintTools(); renderAll(); paintLayers(); paintProps();
    }
    function setTool(t) {
        if (t === P.tool) return; commitFloat(); penEnd(); P.tool = t; if (!['select', 'direct'].includes(t)) { P.pt = null; } if (!['select', 'direct', 'paint'].includes(t)) P.sel = null;
        paintTools(); drawOv(); paintFloats(); paintProps();
        $('ppStage').dataset.tool = t;
    }
    const sl = (k, n, v, min, max, step, unit) => `<label class="pp-sl">${n}<input type="range" data-k="${k}" min="${min}" max="${max}" step="${step || 1}" value="${v}"><b>${unit === '%' ? Math.round(v * 100) + '%' : v + (unit || '')}</b></label>`;
    function paintTools() {
        const V = P.mode === 'vec', T = V ? T_VC : T_PX;
        $('ppToolT').innerHTML = V ? '✒️ 벡터 도구<em>클릭 = 꺾인 점 · 끌면 곡선</em>' : '🖌️ 픽셀 도구<em>펜 압력 · 떨림 보정</em>';
        $('ppTools').innerHTML = T.map(([k, i, n]) => `<button type="button" data-t="${k}" class="${k === P.tool ? 'on' : ''}">${i}<small>${n}</small></button>`).join('');
        let h = '';
        if (V) h = `<h4>점 찍기 방법</h4><div class="pp-chips"><span>클릭 = 꺾인 점</span><span>끌기 = 둥근 점</span><span>처음 점 = 닫기</span><span>Enter = 끝</span></div>`
            + sl('vsw', '선 굵기', P.vsw, 0, 40, 1, 'px') + sl('vround', '둥글기', P.vround, 0, 80, 1, '') + sl('op', '투명도', P.op, .05, 1, .05, '%');
        else {
            if (P.tool === 'brush') h += `<h4>붓 모양</h4><div class="pp-brushes">${BRUSH.map(([k, n]) => `<button type="button" data-b="${k}" class="${k === P.brush ? 'on' : ''}"><canvas width="160" height="52" data-pv="${k}"></canvas><span>${n}</span></button>`).join('')}</div>`;
            if (P.tool === 'shape') h += `<h4>도형</h4><div class="pp-chips pick">${[['rect', '네모'], ['ellipse', '동그라미'], ['line', '선']].map(([k, n]) => `<button type="button" data-sk="${k}" class="${k === P.shapeK ? 'on' : ''}">${n}</button>`).join('')}<button type="button" data-sf="1" class="${P.shapeFill ? 'on' : ''}">🎨 채우기</button></div>`;
            h += sl('size', '크기', P.size, 1, 120, 1, 'px') + sl('op', '투명도', P.op, .05, 1, .05, '%');
            if (!['fill', 'drop', 'lasso', 'move', 'zoom', 'text'].includes(P.tool)) h += sl('soft', '부드럽게', P.soft, 0, 1, .05, '%') + sl('stab', '떨림 보정', P.stab, 0, .95, .05, '%');
        }
        $('ppOpt').innerHTML = h;
        $('ppOpt').querySelectorAll('canvas[data-pv]').forEach(c => brushPreview(c, c.dataset.pv));
    }
    function onOpt(e) {
        const r = e.target.closest('input[type=range]');
        if (r && e.type === 'input') {
            const k = r.dataset.k, v = +r.value; P[k] = v; r.nextElementSibling.textContent = k === 'op' || k === 'soft' || k === 'stab' ? Math.round(v * 100) + '%' : v + (k === 'size' || k === 'vsw' ? 'px' : '');
            if (P.mode === 'vec' && P.sel) { histVec(P.cur); if (k === 'vsw') P.sel.sw = v; if (k === 'op') P.sel.op = v; if (k === 'vround' && P.sel.k === 'rect') P.sel.r = v; P.cur.dirtyV = true; renderAll(); }
            return;
        }
        if (e.type !== 'click') return;
        const b = e.target.closest('[data-b]'); if (b) { P.brush = b.dataset.b; paintTools(); }
        const sk = e.target.closest('[data-sk]'); if (sk) { P.shapeK = sk.dataset.sk; paintTools(); }
        const sf = e.target.closest('[data-sf]'); if (sf) { P.shapeFill = !P.shapeFill; paintTools(); }
    }

    /* ---------- 🎨 색 ---------- */
    function hsvRgb(h, s, v) { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return [f(5) * 255, f(3) * 255, f(1) * 255]; }
    function rgbHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; } return [h, mx ? d / mx : 0, mx]; }
    function colorWire() {
        const sv = $('ppSv'), hue = $('ppHue');
        const hx = hue.getContext('2d'), g = hx.createLinearGradient(0, 0, 300, 0); [0, 60, 120, 180, 240, 300, 360].forEach((d, i) => g.addColorStop(i / 6, `hsl(${d},100%,50%)`)); hx.fillStyle = g; hx.fillRect(0, 0, 300, 24);
        const drag = (el, f) => el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); const mv = ev => { const r = el.getBoundingClientRect(); f(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height))); }; mv(e); el.onpointermove = mv; el.onpointerup = () => { el.onpointermove = null; pushRecent(); }; });
        drag(sv, (x, y) => { P.hsv[1] = x; P.hsv[2] = 1 - y; setColor(rgbHex(...hsvRgb(...P.hsv)), true); });
        drag(hue, x => { P.hsv[0] = x * 359.9; setColor(rgbHex(...hsvRgb(...P.hsv)), true); });
        $('ppSw').innerHTML = SW.map(c => `<i style="background:${c}" data-c="${c}"></i>`).join('');
        $('ppSw').onclick = e => { const i = e.target.closest('[data-c]'); if (i) { setColor(i.dataset.c); pushRecent(); } };
        $('ppRec').onclick = e => { const i = e.target.closest('[data-c]'); if (i) setColor(i.dataset.c); };
        setColor(P.color);
    }
    function setColor(c, keepHsv) {
        P.color = c; if (!keepHsv) P.hsv = rgbHsv(...hexRgb(c));
        const sv = $('ppSv'); if (!sv) return; const x = sv.getContext('2d'), W = sv.width;
        x.fillStyle = `hsl(${P.hsv[0]},100%,50%)`; x.fillRect(0, 0, W, W);
        let g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, W, W);
        g = x.createLinearGradient(0, 0, 0, W); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, W, W);
        x.beginPath(); x.arc(P.hsv[1] * W, (1 - P.hsv[2]) * W, 8, 0, 7); x.lineWidth = 3; x.strokeStyle = '#fff'; x.stroke(); x.lineWidth = 1.5; x.strokeStyle = '#5b3f4a'; x.stroke();
        const hue = $('ppHue'), hx = hue.getContext('2d'); colorHue(hx);
        $('ppNow').style.background = c;
        $('ppSw').querySelectorAll('i').forEach(i => i.classList.toggle('on', i.dataset.c.toLowerCase() === c.toLowerCase()));
        $('ppRec').innerHTML = P.recent.map(r => `<i style="background:${r}" data-c="${r}"></i>`).join('');
        if (P.mode === 'vec' && P.sel && P.tool === 'select' && P.selFill) { /* 칠 · 선 은 버튼으로 */ }
    }
    function colorHue(hx) { const g = hx.createLinearGradient(0, 0, 300, 0); [0, 60, 120, 180, 240, 300, 360].forEach((d, i) => g.addColorStop(i / 6, `hsl(${d},100%,50%)`)); hx.fillStyle = g; hx.fillRect(0, 0, 300, 24); const x = P.hsv[0] / 360 * 300; hx.lineWidth = 3; hx.strokeStyle = '#fff'; hx.strokeRect(x - 3, 1, 6, 22); hx.lineWidth = 1; hx.strokeStyle = '#5b3f4a'; hx.strokeRect(x - 4, 0, 8, 24); }
    function pushRecent() { P.recent = [P.color].concat(P.recent.filter(c => c !== P.color)).slice(0, 5); $('ppRec').innerHTML = P.recent.map(r => `<i style="background:${r}" data-c="${r}"></i>`).join(''); }

    /* ================= 보기 (확대 · 손바닥 · 맞춤) ================= */
    function fit() {
        const st = $('ppStage'); if (!st) return; const r = st.getBoundingClientRect(); if (!r.width) return;
        P.base = Math.min((r.width - 30) / P.W, (r.height - 30) / P.H); P.z = 1; P.px = (r.width - P.W * P.base) / 2; P.py = (r.height - P.H * P.base) / 2; view();
    }
    function view() {
        const d = $('ppDoc'); if (!d) return; const k = P.base * P.z;
        Object.assign(d.style, { width: P.W + 'px', height: P.H + 'px', transform: `translate(${P.px}px, ${P.py}px) scale(${k})` });
        $('ppZ').textContent = Math.round(P.z * 100) + '%'; paintFloats();
    }
    function zoomAt(f, cx, cy) {
        const st = $('ppStage').getBoundingClientRect(), z = Math.max(.25, Math.min(8, P.z * f)), k0 = P.base * P.z, k1 = P.base * z;
        const sx = (cx ?? st.left + st.width / 2) - st.left, sy = (cy ?? st.top + st.height / 2) - st.top;
        P.px = sx - (sx - P.px) * k1 / k0; P.py = sy - (sy - P.py) * k1 / k0; P.z = z; view();
    }
    function onView(v) {
        if (v === 'in') zoomAt(1.25); if (v === 'out') zoomAt(1 / 1.25); if (v === 'fit') fit();
        if (v === 'hand') { P.hand = !P.hand; }
        if (v === 'grid') P.grid = !P.grid; if (v === 'sym') { P.sym = !P.sym; say(P.sym ? '⇋ 대칭 : 왼쪽 · 오른쪽에 같이 그려져요' : '대칭 끔'); }
        document.querySelectorAll('.pp-view [data-v]').forEach(b => b.classList.toggle('on', (b.dataset.v === 'hand' && P.hand) || (b.dataset.v === 'grid' && P.grid) || (b.dataset.v === 'sym' && P.sym)));
        drawOv();
    }
    const toDoc = e => { const r = $('ppCv').getBoundingClientRect(); return { x: (e.clientX - r.left) * P.W / r.width, y: (e.clientY - r.top) * P.H / r.height }; };
    const scale = () => { const r = $('ppCv').getBoundingClientRect(); return r.width / P.W; };   // 화면 px / 종이 px
    const toScr = p => { const r = $('ppCv').getBoundingClientRect(), s = $('ppStage').getBoundingClientRect(), k = r.width / P.W; return { x: r.left - s.left + p.x * k, y: r.top - s.top + p.y * k }; };

    /* ================= 그리기 (합치기) ================= */
    let raf = 0;
    function renderAll() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(); drawOv(); thumbsSoon(); }); }
    function compose(x, withStroke) {
        x.save(); x.clearRect(0, 0, P.W, P.H);
        for (const L of P.layers) {
            if (!L.vis) continue;
            let img = layerImg(L);
            if (withStroke && L === P.cur && P.drag && P.drag.stroke) img = strokePreview(L);
            if (withStroke && L === P.cur && P.fl) { const t = tmp(); const tx = t.getContext('2d'); tx.clearRect(0, 0, P.W, P.H); tx.drawImage(img, 0, 0); tx.drawImage(P.fl.cv, P.fl.dx, P.fl.dy); img = t; }
            if (withStroke && L === P.cur && P.drag && P.drag.moveL) { x.globalAlpha = L.op; x.globalCompositeOperation = L.blend; x.drawImage(img, P.drag.dx, P.drag.dy); continue; }
            x.globalAlpha = L.op; x.globalCompositeOperation = L.blend; x.drawImage(img, 0, 0);
        }
        x.restore();
    }
    function render() { const c = $('ppCv'); if (c) compose(c.getContext('2d'), true); }
    let tmpCv = null; const tmp = () => (tmpCv && tmpCv.width === P.W && tmpCv.height === P.H) ? tmpCv : (tmpCv = mkCv(P.W, P.H));
    let tmp2 = null; const tmpB = () => (tmp2 && tmp2.width === P.W && tmp2.height === P.H) ? tmp2 : (tmp2 = mkCv(P.W, P.H));
    function strokePreview(L) {
        const d = P.drag, t = tmpB(), x = t.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, P.W, P.H); x.drawImage(L.cv, 0, 0);
        if (d.erase) { x.globalCompositeOperation = 'destination-out'; x.drawImage(d.cv, 0, 0); }
        else { x.globalAlpha = d.alpha; x.globalCompositeOperation = d.comp; x.drawImage(d.cv, 0, 0); }
        x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; return t;
    }
    /* 겹 그림 (격자 · 대칭선 · 올가미 · 점 · 손잡이) */
    function drawOv() {
        const c = $('ppOv'); if (!c) return; const x = c.getContext('2d'), k = 1 / Math.max(.05, scale()); x.clearRect(0, 0, P.W, P.H);
        if (P.grid) { x.strokeStyle = 'rgba(107,68,56,.14)'; x.lineWidth = k; for (let i = 50; i < P.W; i += 50) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, P.H); x.stroke(); } for (let j = 50; j < P.H; j += 50) { x.beginPath(); x.moveTo(0, j); x.lineTo(P.W, j); x.stroke(); } }
        if (P.sym) { x.strokeStyle = 'rgba(74,168,255,.6)'; x.setLineDash([8 * k, 6 * k]); x.lineWidth = 1.5 * k; x.beginPath(); x.moveTo(P.W / 2, 0); x.lineTo(P.W / 2, P.H); x.stroke(); x.setLineDash([]); }
        if (P.lasso && P.lasso.length > 1) { x.setLineDash([6 * k, 5 * k]); x.strokeStyle = '#4aa8ff'; x.lineWidth = 1.6 * k; x.beginPath(); P.lasso.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.stroke(); x.setLineDash([]); }
        if (P.fl) { x.setLineDash([6 * k, 5 * k]); x.strokeStyle = '#4aa8ff'; x.lineWidth = 1.6 * k; const b = P.fl.box; x.strokeRect(b.x + P.fl.dx, b.y + P.fl.dy, b.w, b.h); x.setLineDash([]); }
        if (P.drag && P.drag.shapePv) shapePx(x, P.drag.a, P.drag.b, true);
        if (P.mode === 'vec') vecOv(x, k);
    }

    /* ================= 🖌️ 픽셀 붓 ================= */
    function brushOf() {                                                       // 지금 도구 → 붓 설정
        const t = P.tool, b = t === 'brush' ? P.brush : t === 'pencil' ? 'pencil' : t === 'marker' ? 'hi' : t === 'air' ? 'air' : t === 'erase' ? 'erase' : 'round';
        const R = { pencil: { hard: 1, sp: .15, min: .6 }, round: { sp: .12 }, water: { a: .1, sp: .08, soft: 1 }, crayon: { tex: 1, sp: .2 }, hi: { flat: 1, comp: 'multiply', a: .55, sp: .1, hard: 1 }, glit: { sp: .12, glit: 1 }, air: { air: 1 }, erase: { sp: .1 } }[b] || {};
        return Object.assign({ k: b }, R);
    }
    function dab(x, px, py, r, B, col) {
        if (B.air) { for (let i = 0; i < 14; i++) { const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * r; x.globalAlpha = .08; x.fillStyle = col; x.fillRect(px + Math.cos(a) * d, py + Math.sin(a) * d, 1.6, 1.6); } x.globalAlpha = 1; return; }
        if (B.tex) { for (let i = 0; i < Math.max(6, r * 2); i++) { const a = Math.random() * 6.283, d = Math.sqrt(Math.random()) * r; x.globalAlpha = .5 + Math.random() * .5; x.fillStyle = col; x.fillRect(px + Math.cos(a) * d, py + Math.sin(a) * d, 1.4 + Math.random(), 1.4 + Math.random()); } x.globalAlpha = 1; return; }
        if (B.flat) { x.fillStyle = col; x.fillRect(px - r * .45, py - r, r * .9, r * 2); return; }
        const soft = B.hard ? 0 : B.soft != null ? B.soft : P.soft;
        if (soft > .02) { const g = x.createRadialGradient(px, py, r * (1 - soft) * .95, px, py, r); const [R, G, Bc] = hexRgb(col); g.addColorStop(0, `rgba(${R},${G},${Bc},${B.a || 1})`); g.addColorStop(1, `rgba(${R},${G},${Bc},0)`); x.fillStyle = g; }
        else { x.globalAlpha = B.a && !B.flat ? B.a : 1; x.fillStyle = col; }
        x.beginPath(); x.arc(px, py, Math.max(.4, r), 0, 6.283); x.fill(); x.globalAlpha = 1;
        if (B.glit && Math.random() < .25) { x.fillStyle = '#fff'; const a = Math.random() * 6.283, d = Math.random() * r * 1.2; star(x, px + Math.cos(a) * d, py + Math.sin(a) * d, 1.5 + Math.random() * 2.5); }
    }
    function star(x, cx, cy, r) { x.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .35 : r, a = i * Math.PI / 4; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); }
    function brushPreview(c, k) {
        const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); const save = P.brush; P.brush = k; const t = P.tool; P.tool = 'brush'; const B = brushOf(); P.tool = t; P.brush = save;
        const s = mkCv(c.width, c.height), sx = s.getContext('2d'), col = { pencil: '#5b3f4a', round: '#ff5d8f', water: '#4aa8ff', crayon: '#ff9a3c', hi: '#ffd23f', glit: '#9b7bff' }[k];
        let last = null; for (let i = 0; i <= 60; i++) { const tt = i / 60, px = 12 + tt * 136, py = 26 + Math.sin(tt * 6.283) * 12, r = k === 'pencil' ? 1.4 : k === 'hi' ? 7 : 5;
            if (last) { const d = Math.hypot(px - last[0], py - last[1]), n = Math.max(1, Math.ceil(d / Math.max(.6, r * (B.sp || .12)))); for (let j = 1; j <= n; j++) dab(sx, last[0] + (px - last[0]) * j / n, last[1] + (py - last[1]) * j / n, r, B, col); } last = [px, py]; }
        x.globalAlpha = B.a && B.comp ? B.a : 1; x.drawImage(s, 0, 0);
    }
    function strokeStart(e, p) {
        const L = P.cur; if (!canPaint(L)) return false;
        const B = brushOf(), cv = tmp(); const x = cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H);
        histPx(L);
        P.drag = { stroke: 1, B, cv, last: p, sm: { x: p.x, y: p.y }, erase: B.k === 'erase', alpha: P.op * (B.comp ? (B.a || 1) : 1), comp: L.aLock ? 'source-atop' : (B.comp || 'source-over'), pen: e.pointerType === 'pen' };
        stroke(p, e.pressure);
        if (B.air) P.drag.airT = setInterval(() => { if (P.drag && P.drag.stroke) { airDab(P.drag.sm); renderAll(); } }, 40);
        return true;
    }
    function airDab(p) { const d = P.drag, x = d.cv.getContext('2d'), r = P.size * 1.5; dab(x, p.x, p.y, r, d.B, P.color); if (P.sym) dab(x, P.W - p.x, p.y, r, d.B, P.color); }
    function stroke(p, pressure) {
        const d = P.drag, x = d.cv.getContext('2d'), B = d.B;
        const s = d.sm, k = 1 - P.stab * .92; s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k;   // 〰 떨림 보정
        const pr = d.pen ? Math.max(.1, pressure || .5) : 1, r = Math.max(.5, (B.k === 'pencil' ? Math.max(1, P.size * .35) : P.size / 2) * (d.pen ? .35 + .65 * pr : 1));
        if (B.air) { airDab(s); d.last = { x: s.x, y: s.y }; return; }
        const a = d.last, dd = Math.hypot(s.x - a.x, s.y - a.y), sp = Math.max(.5, r * (B.sp || .12)), n = Math.max(1, Math.ceil(dd / sp));
        for (let i = 1; i <= n; i++) { const xx = a.x + (s.x - a.x) * i / n, yy = a.y + (s.y - a.y) * i / n; dab(x, xx, yy, r, B, d.erase ? '#000' : P.color); if (P.sym) dab(x, P.W - xx, yy, r, B, d.erase ? '#000' : P.color); }
        d.last = { x: s.x, y: s.y };
    }
    function strokeEnd() {
        const d = P.drag, L = P.cur; if (d.airT) clearInterval(d.airT);
        const x = L.cv.getContext('2d'); x.save();
        if (d.erase) { x.globalCompositeOperation = 'destination-out'; x.drawImage(d.cv, 0, 0); }
        else { x.globalAlpha = d.alpha; x.globalCompositeOperation = d.comp; x.drawImage(d.cv, 0, 0); }
        x.restore(); P.drag = null; P.dirty = true; renderAll();
    }
    function canPaint(L) {
        if (!L) return false;
        if (!L.vis) { say('👁 숨긴 레이어예요 · 눈을 켜 주세요'); return false; }
        if (L.lock) { say('🔒 잠긴 레이어예요'); return false; }
        if (L.type !== 'px') { say(L.type === 'vec' ? '✒️ 벡터 레이어예요 · 픽셀 레이어를 골라요' : L.type === 'photo' ? '📎 사진 레이어예요 · 픽셀 레이어를 골라요' : '🧵 종이예요 · 픽셀 레이어를 골라요'); return false; }
        return true;
    }
    /* 🪣 채우기 : 보이는 그림 전체를 경계로 (선 따로 · 색 따로 레이어도 돼요) */
    function flood(p) {
        const L = P.cur; if (!canPaint(L)) return;
        const c = mkCv(P.W, P.H), cx = c.getContext('2d'); compose(cx, false);
        const W = P.W, H = P.H, src = cx.getImageData(0, 0, W, H).data, sx = Math.floor(p.x), sy = Math.floor(p.y); if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
        const i0 = (sy * W + sx) * 4, r0 = src[i0], g0 = src[i0 + 1], b0 = src[i0 + 2], a0 = src[i0 + 3], tol = 40;
        const same = i => Math.abs(src[i] - r0) + Math.abs(src[i + 1] - g0) + Math.abs(src[i + 2] - b0) + Math.abs(src[i + 3] - a0) <= tol * 2;
        const m = new Uint8Array(W * H), st = [sx, sy];
        while (st.length) { const y = st.pop(), x0 = st.pop(); let x = x0; while (x >= 0 && !m[y * W + x] && same((y * W + x) * 4)) x--; x++; let up = false, dn = false;
            while (x < W && !m[y * W + x] && same((y * W + x) * 4)) { m[y * W + x] = 1;
                if (y > 0) { const q = ((y - 1) * W + x); if (!m[q] && same(q * 4)) { if (!up) { st.push(x, y - 1); up = true; } } else up = false; }
                if (y < H - 1) { const q = ((y + 1) * W + x); if (!m[q] && same(q * 4)) { if (!dn) { st.push(x, y + 1); dn = true; } } else dn = false; }
                x++; } }
        const o = mkCv(W, H), ox = o.getContext('2d'), id = ox.createImageData(W, H), [R, G, B] = hexRgb(P.color);
        for (let j = 0; j < W * H; j++) if (m[j] || (m[j - 1] || m[j + 1] || m[j - W] || m[j + W])) { const k = j * 4; id.data[k] = R; id.data[k + 1] = G; id.data[k + 2] = B; id.data[k + 3] = 255; }   // 1px 넓혀서 선 둘레 틈 없이
        ox.putImageData(id, 0, 0); histPx(L);
        const x = L.cv.getContext('2d'); x.save(); x.globalAlpha = P.op; if (L.aLock) x.globalCompositeOperation = 'source-atop'; x.drawImage(o, 0, 0); x.restore(); P.dirty = true; renderAll();
    }
    function pick(p) { const c = mkCv(P.W, P.H), x = c.getContext('2d'); compose(x, false); const d = x.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data; if (d[3] < 10) return; setColor(rgbHex(d[0], d[1], d[2])); pushRecent(); say('💧 이 색을 골랐어요', 900); }
    /* ⬛ 도형 (픽셀) */
    function shapePx(x, a, b, pv) {
        x.save(); x.strokeStyle = x.fillStyle = P.color; x.lineWidth = Math.max(1, P.size / 2); x.lineCap = x.lineJoin = 'round'; if (pv) x.globalAlpha = P.op;
        x.beginPath();
        if (P.shapeK === 'line') { x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
        else { if (P.shapeK === 'rect') x.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); else x.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, 6.283); if (P.shapeFill) x.fill(); else x.stroke(); }
        x.restore();
    }
    /* ➰ 올가미 : 둘러싼 곳을 떼어 옮겨요 (✂ 잘라 붙이기 = 새 레이어로) */
    function lassoClose() {
        const L = P.cur, pts = P.lasso; P.lasso = null; if (!pts || pts.length < 4 || !canPaint(L)) { drawOv(); return; }
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        histPx(L);
        const fc = mkCv(P.W, P.H), fx = fc.getContext('2d'); fx.beginPath(); pts.forEach((p, i) => i ? fx.lineTo(p.x, p.y) : fx.moveTo(p.x, p.y)); fx.closePath(); fx.save(); fx.clip(); fx.drawImage(L.cv, 0, 0); fx.restore();
        const lx = L.cv.getContext('2d'); lx.save(); lx.globalCompositeOperation = 'destination-out'; lx.beginPath(); pts.forEach((p, i) => i ? lx.lineTo(p.x, p.y) : lx.moveTo(p.x, p.y)); lx.closePath(); lx.fill(); lx.restore();
        P.fl = { cv: fc, dx: 0, dy: 0, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, L }; say('➰ 떼어 냈어요 · 끌어서 옮기고 다른 도구를 고르면 붙어요 · ✂ 잘라 붙이기 = 새 레이어', 2600); renderAll();
    }
    function commitFloat() { const f = P.fl; if (!f) return; P.fl = null; const x = f.L.cv.getContext('2d'); x.drawImage(f.cv, f.dx, f.dy); P.dirty = true; renderAll(); }
    const inFloat = p => { const f = P.fl; if (!f) return false; const b = f.box; return p.x >= b.x + f.dx && p.x <= b.x + b.w + f.dx && p.y >= b.y + f.dy && p.y <= b.y + b.h + f.dy; };
    /* 🔤 글씨 (픽셀 · 벡터) */
    function textInput(p, done) {
        const s = toScr(p), st = $('ppStage'), inp = document.createElement('input'); inp.className = 'pp-tin'; inp.placeholder = '글씨를 쓰고 Enter';
        Object.assign(inp.style, { left: s.x + 'px', top: s.y + 'px', fontSize: Math.max(14, P.size * 4 * scale()) + 'px', color: P.color });
        st.appendChild(inp); setTimeout(() => inp.focus(), 0); P.keyOn = false;
        let ok = false; const fin = () => { if (ok) return; ok = true; P.keyOn = true; const t = inp.value.trim(); inp.remove(); if (t) done(t); };
        inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') fin(); if (e.key === 'Escape') { inp.value = ''; fin(); } }); inp.addEventListener('blur', fin);
    }

    /* ================= ✒️ 벡터 ================= */
    const V0 = () => ({ id: uid++, fill: null, stroke: P.color, sw: P.vsw, cap: 'round', dash: false, op: P.op });
    function shapePath(s) {
        const p = new Path2D();
        if (s.k === 'path') {
            const a = s.pts; if (!a.length) return p; p.moveTo(a[0].x, a[0].y);
            const seg = (u, v) => p.bezierCurveTo(u.ho ? u.ho.x : u.x, u.ho ? u.ho.y : u.y, v.hi ? v.hi.x : v.x, v.hi ? v.hi.y : v.y, v.x, v.y);
            for (let i = 1; i < a.length; i++) seg(a[i - 1], a[i]); if (s.closed && a.length > 2) { seg(a[a.length - 1], a[0]); p.closePath(); }
            return p;
        }
        const m = new DOMMatrix().translate(s.x + s.w / 2, s.y + s.h / 2).rotate(s.rot || 0), q = new Path2D(), w = s.w, h = s.h, x0 = -w / 2, y0 = -h / 2;
        if (s.k === 'rect') { const r = Math.min(s.r || 0, Math.abs(w) / 2, Math.abs(h) / 2); q.roundRect ? q.roundRect(Math.min(x0, -x0), Math.min(y0, -y0), Math.abs(w), Math.abs(h), r) : q.rect(x0, y0, w, h); }
        else if (s.k === 'ellipse') q.ellipse(0, 0, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, 6.283);
        else if (s.k === 'heart') { const W2 = w / 2, H2 = h / 2; q.moveTo(0, H2); q.bezierCurveTo(-W2 * 1.3, -H2 * .05, -W2 * .9, -H2 * 1.15, 0, -H2 * .45); q.bezierCurveTo(W2 * .9, -H2 * 1.15, W2 * 1.3, -H2 * .05, 0, H2); q.closePath(); }
        else if (s.k === 'star') { for (let i = 0; i < 10; i++) { const rr = i % 2 ? .45 : 1, a = -Math.PI / 2 + i * Math.PI / 5; q.lineTo(Math.cos(a) * w / 2 * rr, Math.sin(a) * h / 2 * rr); } q.closePath(); }
        else if (s.k === 'text') { return null; }
        p.addPath(q, m); return p;
    }
    function drawShape(x, s) {
        x.save(); x.globalAlpha = s.op == null ? 1 : s.op;
        if (s.k === 'text') { x.translate(s.x, s.y); x.rotate((s.rot || 0) * Math.PI / 180); x.font = `${s.fs}px Jua, 'Gowun Dodum', sans-serif`; x.textBaseline = 'top'; if (s.fill) { x.fillStyle = s.fill; x.fillText(s.text, 0, 0); } if (s.stroke && s.sw) { x.lineWidth = s.sw / 2; x.strokeStyle = s.stroke; x.strokeText(s.text, 0, 0); } x.restore(); return; }
        const p = shapePath(s); x.lineCap = s.cap; x.lineJoin = s.cap === 'round' ? 'round' : 'miter';
        if (s.fill) { x.fillStyle = s.fill; x.fill(p); }
        if (s.stroke && s.sw > 0) { x.lineWidth = s.sw; x.strokeStyle = s.stroke; if (s.dash) x.setLineDash([s.sw * 2, s.sw * 1.6]); x.stroke(p); }
        x.restore();
    }
    const hitCtx = mkCv(4, 4).getContext('2d');
    function textBox(s) { hitCtx.font = `${s.fs}px Jua, sans-serif`; return { x: s.x, y: s.y, w: hitCtx.measureText(s.text).width, h: s.fs * 1.1 }; }
    function hitShape(s, p) {
        const k = 1 / Math.max(.05, scale());
        if (s.k === 'text') { const b = textBox(s); return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }
        const path = shapePath(s); hitCtx.lineWidth = Math.max(s.sw || 0, 12 * k);
        return (s.fill || s.closed || s.k !== 'path') && hitCtx.isPointInPath(path, p.x, p.y) || hitCtx.isPointInStroke(path, p.x, p.y);
    }
    function topShape(p) { const L = P.cur; if (!L || L.type !== 'vec') return null; for (let i = L.shapes.length - 1; i >= 0; i--) if (hitShape(L.shapes[i], p)) return L.shapes[i]; return null; }
    function bbox(s) {
        if (s.k === 'text') return textBox(s);
        if (s.k !== 'path') return { x: Math.min(s.x, s.x + s.w), y: Math.min(s.y, s.y + s.h), w: Math.abs(s.w), h: Math.abs(s.h) };
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; s.pts.forEach(a => [a, a.hi, a.ho].forEach(q => { if (!q) return; x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }));
        return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
    }
    function vecOv(x, k) {
        const s = P.sel, hs = 5 * k;
        if (P.pen && P.pen.s) { const a = P.pen.s.pts, last = a[a.length - 1]; if (last && P.pen.hover) { x.strokeStyle = 'rgba(74,168,255,.8)'; x.setLineDash([5 * k, 4 * k]); x.lineWidth = 1.2 * k; x.beginPath(); x.moveTo(last.x, last.y); x.lineTo(P.pen.hover.x, P.pen.hover.y); x.stroke(); x.setLineDash([]); } anchors(x, P.pen.s, k, true); }
        if (P.drag && P.drag.curve) { x.strokeStyle = P.color; x.lineWidth = P.vsw; x.lineCap = x.lineJoin = 'round'; x.beginPath(); P.drag.curve.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.stroke(); }
        if (P.drag && P.drag.newS) { drawShape(x, P.drag.newS); }
        if (!s) return;
        if (P.tool === 'direct' || P.tool === 'cut') { anchors(x, s, k, false); return; }
        const b = bbox(s); x.save();
        if (s.k !== 'path' && s.rot) { x.translate(b.x + b.w / 2, b.y + b.h / 2); x.rotate(s.rot * Math.PI / 180); x.translate(-(b.x + b.w / 2), -(b.y + b.h / 2)); }
        x.strokeStyle = '#4aa8ff'; x.lineWidth = 1.4 * k; x.setLineDash([5 * k, 4 * k]); x.strokeRect(b.x - 4 * k, b.y - 4 * k, b.w + 8 * k, b.h + 8 * k); x.setLineDash([]);
        x.fillStyle = '#fff'; handles(b, k).forEach(h => { x.fillRect(h.x - hs, h.y - hs, hs * 2, hs * 2); x.strokeRect(h.x - hs, h.y - hs, hs * 2, hs * 2); });
        const rt = { x: b.x + b.w / 2, y: b.y - 26 * k }; x.beginPath(); x.moveTo(rt.x, rt.y + 5 * k); x.lineTo(rt.x, b.y - 4 * k); x.stroke(); x.beginPath(); x.arc(rt.x, rt.y, 5 * k, 0, 7); x.fill(); x.stroke();
        x.restore();
    }
    function anchors(x, s, k, pen) {
        if (s.k !== 'path') return; const hs = 4.5 * k;
        x.strokeStyle = '#4aa8ff'; x.lineWidth = 1.2 * k;
        x.save(); x.globalAlpha = .9; const p = shapePath(s); x.lineWidth = 1.2 * k; x.stroke(p); x.restore();
        s.pts.forEach((a, i) => {
            const on = P.pt && P.pt.s === s && P.pt.i === i;
            [a.hi, a.ho].forEach(h => { if (!h || (Math.abs(h.x - a.x) < .5 && Math.abs(h.y - a.y) < .5)) return; if (!on && !pen) return; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(h.x, h.y); x.stroke(); x.beginPath(); x.arc(h.x, h.y, hs * .8, 0, 7); x.fillStyle = '#fff'; x.fill(); x.stroke(); });
            x.fillStyle = on ? '#4aa8ff' : '#fff'; x.fillRect(a.x - hs, a.y - hs, hs * 2, hs * 2); x.strokeRect(a.x - hs, a.y - hs, hs * 2, hs * 2);
        });
    }
    const handles = (b, k) => [{ x: b.x - 4 * k, y: b.y - 4 * k, c: 'nw' }, { x: b.x + b.w + 4 * k, y: b.y - 4 * k, c: 'ne' }, { x: b.x - 4 * k, y: b.y + b.h + 4 * k, c: 'sw' }, { x: b.x + b.w + 4 * k, y: b.y + b.h + 4 * k, c: 'se' }];
    function localP(s, p) { if (s.k === 'path' || !s.rot) return p; const b = bbox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = -s.rot * Math.PI / 180, dx = p.x - cx, dy = p.y - cy; return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) }; }
    function hitHandle(s, p) {
        const k = 1 / Math.max(.05, scale()), b = bbox(s), q = localP(s, p), r = 9 * k;
        if (Math.hypot(q.x - (b.x + b.w / 2), q.y - (b.y - 26 * k)) < r) return 'rot';
        const h = handles(b, k).find(h => Math.abs(q.x - h.x) < r && Math.abs(q.y - h.y) < r); return h ? h.c : null;
    }
    function hitAnchor(s, p) {
        if (!s || s.k !== 'path') return null; const r = 9 / Math.max(.05, scale());
        for (let i = 0; i < s.pts.length; i++) { const a = s.pts[i]; if (P.pt && P.pt.s === s && P.pt.i === i) { if (a.hi && dist(a.hi, p) < r) return { i, h: 'hi' }; if (a.ho && dist(a.ho, p) < r) return { i, h: 'ho' }; } if (dist(a, p) < r) return { i, h: null }; }
        return null;
    }
    function moveShape(s, dx, dy) { if (s.k === 'path') s.pts.forEach(a => [a, a.hi, a.ho].forEach(q => { if (q) { q.x += dx; q.y += dy; } })); else { s.x += dx; s.y += dy; } }
    function scaleShape(s, b0, b1, orig) {                                     // orig = 그때 모양 (복사본)
        const fx = b1.w / b0.w, fy = b1.h / b0.h, T = q => ({ x: b1.x + (q.x - b0.x) * fx, y: b1.y + (q.y - b0.y) * fy });
        if (s.k === 'path') s.pts = orig.pts.map(a => ({ x: T(a).x, y: T(a).y, hi: a.hi ? T(a.hi) : null, ho: a.ho ? T(a.ho) : null, sm: a.sm }));
        else if (s.k === 'text') { s.x = b1.x; s.y = b1.y; s.fs = Math.max(6, orig.fs * fy); }
        else { s.x = b1.x; s.y = b1.y; s.w = b1.w; s.h = b1.h; }
    }
    function rotShape(s, orig, ang, c) {
        if (s.k === 'path') { const co = Math.cos(ang), si = Math.sin(ang), R = q => ({ x: c.x + (q.x - c.x) * co - (q.y - c.y) * si, y: c.y + (q.x - c.x) * si + (q.y - c.y) * co }); s.pts = orig.pts.map(a => ({ x: R(a).x, y: R(a).y, hi: a.hi ? R(a.hi) : null, ho: a.ho ? R(a.ho) : null, sm: a.sm })); }
        else s.rot = ((orig.rot || 0) + ang * 180 / Math.PI) % 360;
    }
    const clone = s => JSON.parse(JSON.stringify(s));
    function needVec() {
        const L = P.cur;
        if (!L || L.type !== 'vec') { say('✒️ 벡터 레이어를 골라요 (오른쪽 ＋ 벡터)'); return null; }
        if (L.lock) { say('🔒 잠긴 레이어예요'); return null; } if (!L.vis) { say('👁 숨긴 레이어예요'); return null; }
        return L;
    }
    /* 점 찍기 */
    function penDown(p) {
        const L = needVec(); if (!L) return;
        if (!P.pen) { histVec(L); const s = Object.assign(V0(), { k: 'path', pts: [], closed: false }); L.shapes.push(s); P.pen = { s }; P.sel = s; }
        const s = P.pen.s, a = s.pts;
        if (a.length > 2 && dist(a[0], p) < 10 / scale()) { s.closed = true; if (P.shapeFillDef) s.fill = P.color; penEnd(); say('✒️ 닫았어요 · 🪣 칠하기로 색을 채워요'); return; }
        const pt = { x: p.x, y: p.y, hi: null, ho: null, sm: false }; a.push(pt); P.drag = { penPt: pt }; L.dirtyV = true; P.dirty = true; renderAll();
    }
    function penEnd() {
        const pen = P.pen; if (!pen) return; P.pen = null;
        if (pen.s.pts.length < 2) { const L = P.cur; if (L && L.shapes) L.shapes = L.shapes.filter(x => x !== pen.s); P.sel = null; }
        if (P.cur) P.cur.dirtyV = true; renderAll(); paintFloats();
    }
    /* 곡선 = 손으로 그은 선 → 점 몇 개 (둥근 점) */
    function simplify(pts, eps) {
        if (pts.length < 3) return pts.slice();
        const d = (p, a, b) => { const l = Math.hypot(b.x - a.x, b.y - a.y) || 1; return Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / l; };
        let mi = 0, mx = 0; for (let i = 1; i < pts.length - 1; i++) { const v = d(pts[i], pts[0], pts[pts.length - 1]); if (v > mx) { mx = v; mi = i; } }
        if (mx > eps) { const A = simplify(pts.slice(0, mi + 1), eps), B = simplify(pts.slice(mi), eps); return A.slice(0, -1).concat(B); }
        return [pts[0], pts[pts.length - 1]];
    }
    function smoothPts(a, closed) {                                           // 둥근 점 : 이웃 점 방향으로 손잡이
        const n = a.length;
        a.forEach((p, i) => {
            const pr = a[i - 1] || (closed ? a[n - 1] : null), nx = a[i + 1] || (closed ? a[0] : null);
            if (!pr || !nx) { p.hi = p.ho = null; p.sm = false; return; }
            const tx = (nx.x - pr.x) / 6, ty = (nx.y - pr.y) / 6; p.hi = { x: p.x - tx, y: p.y - ty }; p.ho = { x: p.x + tx, y: p.y + ty }; p.sm = true;
        });
    }
    function curveEnd() {
        const raw = P.drag.curve; P.drag = null; const L = needVec(); if (!L || raw.length < 3) { renderAll(); return; }
        const closed = raw.length > 8 && dist(raw[0], raw[raw.length - 1]) < 14 / scale();
        let a = simplify(raw, 3 / scale()).map(p => ({ x: p.x, y: p.y })); if (closed && a.length > 3) a.pop();
        smoothPts(a, closed); histVec(L);
        const s = Object.assign(V0(), { k: 'path', pts: a, closed }); L.shapes.push(s); L.dirtyV = true; P.sel = s; P.dirty = true; renderAll(); paintFloats(); paintProps();
    }
    /* 떠 있는 막대 : 모양 (칠 · 선 · 앞으로 · 복사 · 삭제) · 점 (둥근 · 꺾인 · 더하기 · 빼기) */
    function paintFloats() {
        const fs = $('ppFlS'), fp = $('ppFlP'); if (!fs) return;
        const s = P.sel, V = P.mode === 'vec' && s && P.cur && P.cur.shapes && P.cur.shapes.includes(s) && !P.pen;
        fs.hidden = !(V && ['select', 'paint'].includes(P.tool));
        fp.hidden = !(V && P.tool === 'direct' && P.pt && P.pt.s === s);
        if (!fs.hidden) { const b = bbox(s), q = toScr({ x: b.x + b.w / 2, y: b.y }); fs.innerHTML = `<button data-s="fill">🎨 칠</button><button data-s="stroke">✏️ 선</button><button data-s="front">⤴ 앞으로</button><button data-s="dup">⧉ 복사</button><button data-s="del">🗑</button>`; Object.assign(fs.style, { left: q.x + 'px', top: Math.max(4, q.y - 64) + 'px' }); }
        if (!fp.hidden) { const a = s.pts[P.pt.i], q = toScr(a); fp.innerHTML = `<button data-p="sm">⌒ 둥근 점</button><button data-p="cn">∠ 꺾인 점</button><button data-p="add">➕ 점 더하기</button><button data-p="rm">➖ 점 빼기</button>`; Object.assign(fp.style, { left: q.x + 'px', top: (q.y + 22) + 'px' }); }
    }
    function shapeAct(a) {
        const L = P.cur, s = P.sel; if (!s || !L) return; histVec(L);
        if (a === 'fill') s.fill = s.fill === P.color ? null : P.color;
        if (a === 'stroke') { if (s.stroke === P.color && s.k !== 'text') s.stroke = null; else s.stroke = P.color; if (!s.sw) s.sw = P.vsw || 4; }
        if (a === 'front') { const i = L.shapes.indexOf(s); if (i < L.shapes.length - 1) { L.shapes.splice(i, 1); L.shapes.splice(i + 1, 0, s); } }
        if (a === 'dup') { const c = clone(s); c.id = uid++; moveShape(c, 18, 18); L.shapes.push(c); P.sel = c; }
        if (a === 'del') { L.shapes = L.shapes.filter(x => x !== s); P.sel = null; }
        L.dirtyV = true; P.dirty = true; renderAll(); paintFloats(); paintProps();
    }
    function pointAct(a) {
        const L = P.cur, s = P.sel, pt = P.pt; if (!s || !pt || s.k !== 'path') return; histVec(L);
        const i = pt.i, A = s.pts;
        if (a === 'sm') { const B = A.map(p => ({ ...p })); smoothPts(B, s.closed); A[i].hi = B[i].hi; A[i].ho = B[i].ho; A[i].sm = true; if (!A[i].hi) { const n = A[i + 1] || A[0]; A[i].ho = { x: A[i].x + (n.x - A[i].x) / 3, y: A[i].y + (n.y - A[i].y) / 3 }; } }
        if (a === 'cn') { A[i].hi = A[i].ho = null; A[i].sm = false; }
        if (a === 'add') {                                                     // 다음 점과의 가운데 (곡선 그대로 반으로)
            const j = i + 1 < A.length ? i + 1 : (s.closed ? 0 : -1); if (j < 0) { P.pt = null; paintFloats(); return; }
            const p0 = A[i], p3 = A[j], p1 = p0.ho || p0, p2 = p3.hi || p3, m = (u, v) => ({ x: (u.x + v.x) / 2, y: (u.y + v.y) / 2 });
            const a1 = m(p0, p1), a2 = m(p1, p2), a3 = m(p2, p3), b1 = m(a1, a2), b2 = m(a2, a3), c = m(b1, b2);
            if (p0.ho) p0.ho = a1; if (p3.hi) p3.hi = a3;
            A.splice(i + 1, 0, { x: c.x, y: c.y, hi: (p0.ho || p3.hi) ? b1 : null, ho: (p0.ho || p3.hi) ? b2 : null, sm: true }); P.pt = { s, i: i + 1 };
        }
        if (a === 'rm') { if (A.length <= 2) { L.shapes = L.shapes.filter(x => x !== s); P.sel = null; P.pt = null; } else { A.splice(i, 1); P.pt = null; } }
        L.dirtyV = true; P.dirty = true; renderAll(); paintFloats();
    }
    function cutAt(s, i) {                                                      // ✂️ 점 자르기
        const L = P.cur; histVec(L);
        if (s.closed) { const A = s.pts; s.pts = A.slice(i).concat(A.slice(0, i + 1).map((p, j) => j === i ? { ...p, hi: p.hi, ho: null } : p)); s.pts[0] = { ...s.pts[0], hi: null }; s.closed = false; say('✂️ 열었어요'); }
        else if (i > 0 && i < s.pts.length - 1) { const B = Object.assign(clone(s), { id: uid++, pts: s.pts.slice(i).map(p => ({ ...p })) }); s.pts = s.pts.slice(0, i + 1); s.pts[i] = { ...s.pts[i], ho: null }; B.pts[0].hi = null; L.shapes.splice(L.shapes.indexOf(s) + 1, 0, B); say('✂️ 둘로 나눴어요'); }
        L.dirtyV = true; P.dirty = true; renderAll();
    }

    /* ================= 손가락 · 마우스 ================= */
    function down(e) {
        if (e.target.closest('.pp-fl, .pp-tin')) return;
        if (e.pointerType === 'mouse' && e.button > 0 && e.button !== 1) return;
        const st = $('ppStage'); try { st.setPointerCapture(e.pointerId); } catch (er) {}
        const p = toDoc(e); P.down = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
        if (P.hand || e.button === 1 || P.space) { P.drag = { pan: 1, x: e.clientX, y: e.clientY, px: P.px, py: P.py }; return; }
        const t = P.tool;
        if (P.mode === 'px') {
            if (t === 'zoom') { zoomAt(e.altKey || e.shiftKey ? 1 / 1.4 : 1.4, e.clientX, e.clientY); return; }
            if (t === 'drop') { pick(p); return; }
            if (t === 'fill') { flood(p); return; }
            if (t === 'text') { if (!canPaint(P.cur)) return; textInput(p, txt => { histPx(P.cur); const x = P.cur.cv.getContext('2d'); x.save(); x.globalAlpha = P.op; x.fillStyle = P.color; x.font = `${Math.max(10, P.size * 4)}px Jua, 'Gowun Dodum', sans-serif`; x.textBaseline = 'top'; x.fillText(txt, p.x, p.y); x.restore(); P.dirty = true; renderAll(); }); return; }
            if (t === 'lasso') { if (P.fl && inFloat(p)) { P.drag = { flMove: 1, p0: p, dx: P.fl.dx, dy: P.fl.dy }; return; } commitFloat(); P.lasso = [p]; P.drag = { lasso: 1 }; return; }
            if (t === 'move') {
                const L = P.cur; if (!L || L.lock) { say('🔒 잠긴 레이어예요'); return; }
                if (L.type === 'photo') { histSt(); P.drag = { photo: 1, p0: p, ox: L.ox, oy: L.oy }; return; }
                if (L.type === 'px') { histPx(L); P.drag = { moveL: 1, p0: p, dx: 0, dy: 0 }; return; }
                if (L.type === 'vec') { histVec(L); P.drag = { vmoveAll: 1, p0: p }; return; }
                say('🧵 종이는 옮기지 않아요'); return;
            }
            if (t === 'shape') { if (!canPaint(P.cur)) return; P.drag = { shapePv: 1, a: p, b: p }; return; }
            strokeStart(e, p); renderAll(); return;
        }
        /* ✒️ 벡터 */
        if (t === 'pen') { penDown(p); return; }
        if (t === 'curve') { if (!needVec()) return; P.drag = { curve: [p] }; return; }
        if (['rect', 'ellipse', 'heart', 'star'].includes(t)) { const L = needVec(); if (!L) return; P.drag = { newS: Object.assign(V0(), { k: t, x: p.x, y: p.y, w: 0, h: 0, r: t === 'rect' ? P.vround : 0, rot: 0, fill: t === 'heart' || t === 'star' ? P.color : null }), a: p }; return; }
        if (t === 'vtext') { const L = needVec(); if (!L) return; textInput(p, txt => { histVec(L); const s = Object.assign(V0(), { k: 'text', x: p.x, y: p.y, text: txt, fs: Math.max(12, P.vsw * 6), fill: P.color, stroke: null }); L.shapes.push(s); P.sel = s; L.dirtyV = true; P.dirty = true; setTool('select'); renderAll(); }); return; }
        if (t === 'vmove') { const L = needVec(); if (!L) return; histVec(L); P.drag = { vmoveAll: 1, p0: p }; return; }
        if (t === 'paint') { const s = topShape(p); if (!s) { say('🪣 칠할 모양을 눌러요'); return; } histVec(P.cur); s.fill = P.color; P.sel = s; P.cur.dirtyV = true; P.dirty = true; renderAll(); paintFloats(); return; }
        if (t === 'cut') { const s = P.sel && hitAnchor(P.sel, p) ? P.sel : topShape(p); if (!s) return; P.sel = s; const h = hitAnchor(s, p); if (h && s.k === 'path') cutAt(s, h.i); else { renderAll(); say('✂️ 자를 점을 눌러요'); } return; }
        if (t === 'direct') {
            if (P.sel) { const h = hitAnchor(P.sel, p); if (h) { histVec(P.cur); P.pt = { s: P.sel, i: h.i }; P.drag = { anchor: h, s: P.sel, p0: p }; renderAll(); paintFloats(); return; } }
            const s = topShape(p); P.sel = s; P.pt = null; if (s && s.k !== 'path') say('◦ 점은 점 찍기 · 곡선으로 그린 모양에 있어요 · 이 모양은 ↖️ 선택으로 크기 · 돌리기'); renderAll(); paintFloats(); paintProps(); return;
        }
        if (t === 'select') {
            if (P.sel) { const h = hitHandle(P.sel, p); if (h) { histVec(P.cur); const b = bbox(P.sel); P.drag = { handle: h, s: P.sel, b0: b, orig: clone(P.sel), p0: p, c: { x: b.x + b.w / 2, y: b.y + b.h / 2 } }; return; } }
            const s = topShape(p); P.sel = s; P.pt = null;
            if (s) { histVec(P.cur); P.drag = { smove: 1, s, last: p }; }
            renderAll(); paintFloats(); paintProps(); return;
        }
    }
    function move(e) {
        const p = toDoc(e), br = $('ppBr');
        if (P.mode === 'px' && ['brush', 'pencil', 'marker', 'air', 'erase'].includes(P.tool) && !P.hand) { const s = $('ppStage').getBoundingClientRect(), r = Math.max(4, (P.tool === 'pencil' ? Math.max(1, P.size * .35) : P.size / 2) * scale() * (P.tool === 'air' ? 3 : 1)); br.hidden = false; Object.assign(br.style, { left: (e.clientX - s.left - r) + 'px', top: (e.clientY - s.top - r) + 'px', width: r * 2 + 'px', height: r * 2 + 'px' }); } else br.hidden = true;
        if (P.pen && !P.drag) { P.pen.hover = p; drawOv(); }
        const d = P.drag; if (!d || !P.down || e.pointerId !== P.down.id) return;
        if (Math.hypot(e.clientX - P.down.sx, e.clientY - P.down.sy) > 3) P.down.moved = true;
        if (d.pan) { P.px = d.px + e.clientX - d.x; P.py = d.py + e.clientY - d.y; view(); return; }
        if (d.stroke) { const ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (ev.length ? ev : [e]).forEach(q => stroke(toDoc(q), q.pressure)); renderAll(); return; }
        if (d.lasso) { P.lasso.push(p); drawOv(); return; }
        if (d.flMove) { P.fl.dx = d.dx + p.x - d.p0.x; P.fl.dy = d.dy + p.y - d.p0.y; renderAll(); return; }
        if (d.photo) { const L = P.cur; L.ox = d.ox + p.x - d.p0.x; L.oy = d.oy + p.y - d.p0.y; photoPaint(L); renderAll(); return; }
        if (d.moveL) { d.dx = p.x - d.p0.x; d.dy = p.y - d.p0.y; renderAll(); return; }
        if (d.vmoveAll) { const dx = p.x - d.p0.x, dy = p.y - d.p0.y; d.p0 = p; P.cur.shapes.forEach(s => moveShape(s, dx, dy)); P.cur.dirtyV = true; renderAll(); paintFloats(); return; }
        if (d.shapePv) { d.b = e.shiftKey ? sq(d.a, p) : p; drawOv(); return; }
        if (d.penPt) { const a = d.penPt; if (dist(a, p) > 3 / scale()) { a.ho = { x: p.x, y: p.y }; a.hi = { x: 2 * a.x - p.x, y: 2 * a.y - p.y }; a.sm = true; } P.cur.dirtyV = true; renderAll(); return; }
        if (d.curve) { d.curve.push(p); drawOv(); return; }
        if (d.newS) { const b = e.shiftKey ? sq(d.a, p) : p; Object.assign(d.newS, { x: Math.min(d.a.x, b.x), y: Math.min(d.a.y, b.y), w: Math.abs(b.x - d.a.x), h: Math.abs(b.y - d.a.y) }); drawOv(); return; }
        if (d.smove) { moveShape(d.s, p.x - d.last.x, p.y - d.last.y); d.last = p; P.cur.dirtyV = true; renderAll(); paintFloats(); return; }
        if (d.anchor) {
            const a = d.s.pts[d.anchor.i];
            if (!d.anchor.h) { const dx = p.x - a.x, dy = p.y - a.y; a.x += dx; a.y += dy; if (a.hi) { a.hi.x += dx; a.hi.y += dy; } if (a.ho) { a.ho.x += dx; a.ho.y += dy; } }
            else { const h = d.anchor.h, o = h === 'hi' ? 'ho' : 'hi'; a[h] = { x: p.x, y: p.y }; if (a.sm && a[o]) { const L0 = Math.hypot(a[o].x - a.x, a[o].y - a.y), L1 = Math.hypot(p.x - a.x, p.y - a.y) || 1; a[o] = { x: a.x - (p.x - a.x) * L0 / L1, y: a.y - (p.y - a.y) * L0 / L1 }; } }
            P.cur.dirtyV = true; renderAll(); paintFloats(); return;
        }
        if (d.handle) {
            const s = d.s;
            if (d.handle === 'rot') { const a0 = Math.atan2(d.p0.y - d.c.y, d.p0.x - d.c.x), a1 = Math.atan2(p.y - d.c.y, p.x - d.c.x); let ang = a1 - a0; if (e.shiftKey) ang = Math.round(ang / (Math.PI / 12)) * (Math.PI / 12); rotShape(s, d.orig, ang, d.c); }
            else { const b0 = d.b0, q = localP(d.orig, p); let x0 = b0.x, y0 = b0.y, x1 = b0.x + b0.w, y1 = b0.y + b0.h; if (d.handle.includes('w')) x0 = Math.min(q.x, x1 - 4); if (d.handle.includes('e')) x1 = Math.max(q.x, x0 + 4); if (d.handle.includes('n')) y0 = Math.min(q.y, y1 - 4); if (d.handle.includes('s')) y1 = Math.max(q.y, y0 + 4);
                if (e.shiftKey || s.k === 'text') { const f = Math.max((x1 - x0) / b0.w, (y1 - y0) / b0.h); if (d.handle.includes('w')) x0 = x1 - b0.w * f; else x1 = x0 + b0.w * f; if (d.handle.includes('n')) y0 = y1 - b0.h * f; else y1 = y0 + b0.h * f; }
                scaleShape(s, b0, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, d.orig); }
            P.cur.dirtyV = true; renderAll(); paintFloats(); return;
        }
    }
    const sq = (a, p) => { const m = Math.max(Math.abs(p.x - a.x), Math.abs(p.y - a.y)); return { x: a.x + Math.sign(p.x - a.x || 1) * m, y: a.y + Math.sign(p.y - a.y || 1) * m }; };
    function up(e) {
        const d = P.drag; if (!P.down || e.pointerId !== P.down.id) return; P.down = null;
        if (!d) return;
        if (d.stroke) { strokeEnd(); return; }
        P.drag = null;
        if (d.lasso) { lassoClose(); return; }
        if (d.moveL) { const L = P.cur, c = mkCv(P.W, P.H); c.getContext('2d').drawImage(L.cv, d.dx, d.dy); const x = L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.drawImage(c, 0, 0); P.dirty = true; renderAll(); return; }
        if (d.shapePv) { histPx(P.cur); const x = P.cur.cv.getContext('2d'); x.save(); x.globalAlpha = P.op; if (P.cur.aLock) x.globalCompositeOperation = 'source-atop'; shapePx(x, d.a, d.b); x.restore(); P.dirty = true; renderAll(); return; }
        if (d.curve) { P.drag = d; curveEnd(); return; }
        if (d.newS) { const s = d.newS; if (s.w < 4 && s.h < 4) { Object.assign(s, { x: d.a.x - 60, y: d.a.y - 60, w: 120, h: 120 }); } const L = P.cur; histVec(L); L.shapes.push(s); L.dirtyV = true; P.sel = s; P.dirty = true; setTool('select'); renderAll(); paintFloats(); paintProps(); return; }
        if (d.penPt || d.smove || d.anchor || d.handle || d.vmoveAll || d.photo || d.flMove) { P.dirty = true; renderAll(); paintFloats(); paintProps(); }
    }
    function onKey(e) {
        if (!P.on || !P.keyOn || e.target.closest && e.target.closest('input, textarea')) return;
        const z = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z', y = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'));
        if (y) { e.preventDefault(); redo(); return; } if (z) { e.preventDefault(); undo(); return; }
        if (e.key === 'Enter' && P.pen) { penEnd(); return; }
        if ((e.key === 'Delete' || e.key === 'Backspace') && P.mode === 'vec' && P.sel) { e.preventDefault(); if (P.tool === 'direct' && P.pt) pointAct('rm'); else shapeAct('del'); return; }
        if (e.key === ' ' && !P.space) { P.space = true; document.addEventListener('keyup', function k(ev) { if (ev.key === ' ') { P.space = false; document.removeEventListener('keyup', k); } }); }
    }
    document.addEventListener('keydown', e => {                                // Esc = 그리던 것 먼저 끝내요 (태블릿 홈보다 · 잡는 단계에서)
        if (!P.on || !P.keyOn || e.key !== 'Escape' || !(P.pen || P.fl || P.sel)) return;
        e.stopImmediatePropagation(); if (P.pen) penEnd(); else if (P.fl) commitFloat(); else { P.sel = null; P.pt = null; renderAll(); paintFloats(); paintProps(); }
    }, true);

    /* ================= 되돌리기 ================= */
    const H_MAX = 30;
    function push(h) { P.hist.push(h); if (P.hist.length > H_MAX) P.hist.shift(); P.redo = []; }
    function histPx(L) { const c = mkCv(P.W, P.H); c.getContext('2d').drawImage(L.cv, 0, 0); push({ t: 'px', L, c }); }
    function histVec(L) { push({ t: 'vec', L, s: JSON.stringify(L.shapes) }); }
    const snapSt = () => ({ t: 'st', layers: P.layers.map(l => ({ l, p: { type: l.type, shapes: l.type === 'vec' ? JSON.parse(JSON.stringify(l.shapes)) : l.shapes, name: l.name, vis: l.vis, lock: l.lock, op: l.op, blend: l.blend, aLock: l.aLock, s: l.s, ox: l.ox, oy: l.oy, wash: l.wash, mk: l.mk && Object.assign({}, l.mk) } })), cur: P.cur });
    function histSt() { push(snapSt()); }
    function restore(h) {
        if (h.t === 'multi') return { t: 'multi', items: h.items.slice().reverse().map(restore).reverse() };
        if (h.t === 'px') { const c = mkCv(P.W, P.H); c.getContext('2d').drawImage(h.L.cv, 0, 0); const x = h.L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.drawImage(h.c, 0, 0); return { t: 'px', L: h.L, c }; }
        if (h.t === 'vec') { const now = JSON.stringify(h.L.shapes); h.L.shapes = JSON.parse(h.s); h.L.dirtyV = true; P.sel = null; P.pt = null; return { t: 'vec', L: h.L, s: now }; }
        const now = snapSt(); P.layers = h.layers.map(x => { Object.assign(x.l, x.p); if (x.l.type === 'vec') { if (!x.l.cache) x.l.cache = mkCv(P.W, P.H); x.l.shapes = JSON.parse(JSON.stringify(x.p.shapes)); x.l.dirtyV = true; } if (x.l.type === 'photo') photoPaint(x.l); if (x.l.type === 'paper' && x.p.mk) paperPaint(x.l); return x.l; }); P.cur = P.layers.includes(h.cur) ? h.cur : P.layers[P.layers.length - 1]; return now;
    }
    function undo() { commitFloat(); penEnd(); const h = P.hist.pop(); if (!h) { say('더 되돌릴 게 없어요', 900); return; } P.redo.push(restore(h)); after(); }
    function redo() { const h = P.redo.pop(); if (!h) return; P.hist.push(restore(h)); after(); }
    function after() { P.dirty = true; renderAll(); paintLayers(); paintProps(); paintFloats(); }

    /* ================= 🗂️ 레이어 칸 ================= */
    function paintLayers() {
        const box = $('ppLy'); if (!box) return;
        box.innerHTML = [...P.layers].reverse().map(L => { const T = TAG[L.type], bl = (BLEND.find(b => b[0] === L.blend) || BLEND[0])[1];
            return `<div class="pp-ly${L === P.cur ? ' on' : ''}" data-id="${L.id}" draggable="true"><button type="button" class="eye${L.vis ? '' : ' off'}" data-e="vis">${L.vis ? '👁' : '◌'}</button><canvas width="84" height="64" data-th="${L.id}"></canvas>
                <div><b>${esc(L.name)}</b><span class="tag ${T[0]}">${T[1]}</span><small>${bl} · ${Math.round(L.op * 100)}%${L.aLock ? ' · 🫧' : ''}</small></div><button type="button" class="lk${L.lock ? ' on' : ''}" data-e="lock">${L.lock ? '🔒' : '🔓'}</button></div>`; }).join('');
        thumbs();
        box.onclick = e => { const row = e.target.closest('.pp-ly'); if (!row) return; const L = P.layers.find(l => l.id === +row.dataset.id); const b = e.target.closest('[data-e]');
            if (b) { histSt(); if (b.dataset.e === 'vis') L.vis = !L.vis; else L.lock = !L.lock; renderAll(); paintLayers(); paintProps(); return; }
            commitFloat(); penEnd(); P.cur = L; P.sel = null; P.pt = null;
            if (L.type === 'px' && P.mode !== 'px') { P.mode = 'px'; P.tool = 'brush'; modeBtns(); paintTools(); } if (L.type === 'vec' && P.mode !== 'vec') { P.mode = 'vec'; P.tool = 'select'; modeBtns(); paintTools(); }
            if (L.type === 'photo' && P.mode === 'px') setTool('move');
            renderAll(); paintLayers(); paintProps(); paintFloats(); };
        let dragId = null;
        box.ondragstart = e => { const r = e.target.closest('.pp-ly'); if (r) { dragId = +r.dataset.id; e.dataTransfer.effectAllowed = 'move'; } };
        box.ondragover = e => { e.preventDefault(); };
        box.ondrop = e => { e.preventDefault(); const r = e.target.closest('.pp-ly'); if (!r || dragId == null) return; const A = P.layers.find(l => l.id === dragId), B = P.layers.find(l => l.id === +r.dataset.id); if (!A || !B || A === B || A.type === 'paper' || B.type === 'paper') { if (A && B && (A.type === 'paper' || B.type === 'paper')) say('🧵 종이는 늘 맨 아래예요'); return; }
            histSt(); P.layers.splice(P.layers.indexOf(A), 1); const j = P.layers.indexOf(B); const rb = r.getBoundingClientRect(); P.layers.splice(e.clientY < rb.top + rb.height / 2 ? j + 1 : j, 0, A); renderAll(); paintLayers(); };
    }
    let thT = 0; function thumbsSoon() { clearTimeout(thT); thT = setTimeout(thumbs, 250); }
    function thumbs() { document.querySelectorAll('#ppLy canvas[data-th]').forEach(c => { const L = P.layers.find(l => l.id === +c.dataset.th); if (!L) return; const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); const k = Math.min(c.width / P.W, c.height / P.H), w = P.W * k, h = P.H * k; x.fillStyle = '#fff'; x.fillRect((c.width - w) / 2, (c.height - h) / 2, w, h); x.drawImage(layerImg(L), (c.width - w) / 2, (c.height - h) / 2, w, h); }); }
    function layerAct(a) {
        if (a === 'cutl') { if (!cutToLayer()) say('✂ 올가미(➰)로 떼어 낸 뒤 눌러요'); return; }
        commitFloat(); penEnd(); const L = P.cur;
        if (a === 'px' || a === 'vec') { histSt(); P.cur = addLayer(a, a === 'px' ? '그림 ' + (P.layers.filter(l => l.type === 'px').length + 1) : '모양 ' + (P.layers.filter(l => l.type === 'vec').length + 1)); if (P.mode !== (a === 'px' ? 'px' : 'vec')) { P.mode = a; P.tool = a === 'px' ? 'brush' : 'pen'; modeBtns(); paintTools(); } P.sel = null; }
        if (a === 'dup' && L) { if (L.type === 'paper') { say('🧵 종이는 하나예요'); return; } histSt(); const N = addLayer(L.type, L.name + ' 복사', { op: L.op, blend: L.blend, aLock: L.aLock, img: L.img, s: L.s, ox: L.ox, oy: L.oy, wash: L.wash }); if (L.type === 'vec') { N.shapes = JSON.parse(JSON.stringify(L.shapes)); } else N.cv.getContext('2d').drawImage(L.cv, 0, 0); P.cur = N; }
        if (a === 'del' && L) { if (L.type === 'paper') { say('🧵 종이는 지울 수 없어요 · 종이 꾸미기로 바꿔요'); return; } if (P.layers.filter(l => l.type !== 'paper').length <= 1 && P.layers.length <= 2) { histSt(); clearLayer(L); renderAll(); paintLayers(); return; } histSt(); const i = P.layers.indexOf(L); P.layers.splice(i, 1); P.cur = P.layers[Math.max(1, i - 1)] || P.layers[P.layers.length - 1]; P.sel = null; }
        if (a === 'merge' && L) { const i = P.layers.indexOf(L), B = P.layers[i - 1]; if (!B || B.type === 'paper' || L.type === 'paper') { say('⤓ 아래에 합칠 레이어가 없어요 (종이에는 안 합쳐요)'); return; } const pc = mkCv(P.W, P.H); pc.getContext('2d').drawImage(B.cv, 0, 0); push({ t: 'multi', items: [snapSt(), { t: 'px', L: B, c: pc }] }); const bx = B.cv.getContext('2d'); if (B.type === 'vec') { bx.clearRect(0, 0, P.W, P.H); bx.drawImage(layerImg(B), 0, 0); B.type = 'px'; delete B.cache; B.shapes = []; } bx.save(); bx.globalAlpha = L.op; bx.globalCompositeOperation = L.blend; bx.drawImage(layerImg(L), 0, 0); bx.restore(); P.layers.splice(i, 1); P.cur = B; say('⤓ 합쳤어요 (픽셀이 돼요)'); }
        if (a === 'lock' && L) { histSt(); L.lock = !L.lock; }
        P.dirty = true; renderAll(); paintLayers(); paintProps(); paintFloats();
    }
    function clearLayer(L) { if (L.type === 'vec') { L.shapes = []; L.dirtyV = true; } else L.cv.getContext('2d').clearRect(0, 0, P.W, P.H); }
    /* ✂ 잘라 붙이기 : 올가미로 떼어 낸 것 → 새 레이어 (P.fl 이 있을 때) */
    function cutToLayer() { const f = P.fl; if (!f) return false; P.fl = null; histSt(); const N = addLayer('px', '조각 ' + (P.layers.length)); N.cv.getContext('2d').drawImage(f.cv, f.dx, f.dy); P.cur = N; say('✂ 새 레이어로 붙였어요'); P.dirty = true; renderAll(); paintLayers(); paintProps(); return true; }

    /* ---------- 오른쪽 아래 : 고른 것 설정 ---------- */
    const chip = (k, v, n, on) => `<button type="button" data-${k}="${v}" class="${on ? 'on' : ''}">${n}</button>`;
    function paintProps() {
        const box = $('ppProp'), T = $('ppPropT'); if (!box) return; const L = P.cur, s = P.sel;
        if (P.mode === 'vec' && s && L && L.shapes && L.shapes.includes(s)) {
            T.textContent = '✒️ 고른 모양';
            box.innerHTML = `<div class="r"><span>칠하기</span><div>${chip('vf', 'cur', `<i style="background:${s.fill || 'transparent'}"></i>${s.fill ? '바꾸기' : '지금 색'}`, !!s.fill)}${chip('vf', 'none', '없음', !s.fill)}</div></div>
                <div class="r"><span>선</span><div>${chip('vs', 'cur', `<i style="background:${s.stroke || 'transparent'}"></i>${s.stroke ? '바꾸기' : '지금 색'}`, !!s.stroke)}${chip('vs', 'none', '없음', !s.stroke)}${chip('vd', 1, '점선', s.dash)}</div></div>
                <div class="r"><span>선 끝</span><div>${chip('vc', 'round', '둥글게', s.cap === 'round')}${chip('vc', 'butt', '각지게', s.cap !== 'round')}</div></div>
                ${s.k === 'rect' ? `<label class="pp-sl">모서리<input type="range" data-pk="r" min="0" max="120" value="${s.r || 0}"><b>${Math.round(s.r || 0)}</b></label>` : ''}
                <label class="pp-sl">선 굵기<input type="range" data-pk="sw" min="0" max="40" value="${s.sw || 0}"><b>${s.sw || 0}px</b></label>
                <label class="pp-sl">투명도<input type="range" data-pk="op" min=".05" max="1" step=".05" value="${s.op == null ? 1 : s.op}"><b>${Math.round((s.op == null ? 1 : s.op) * 100)}%</b></label>`;
            return;
        }
        if (!L) { box.innerHTML = ''; T.textContent = ''; return; }
        T.textContent = '🗂️ 고른 레이어 · ' + L.name;
        let h = '';
        if (L.type === 'paper') h = `<p class="pp-hint">🧵 종이는 맨 아래에 늘 있어요</p><button type="button" class="shm-src" data-pp="paper"><i>🧵</i>종이 꾸미기</button>`;
        else {
            h = `<div class="r"><span>섞는 법</span><div>${BLEND.map(([v, n]) => chip('bl', v, n, L.blend === v)).join('')}</div></div>
                <label class="pp-sl">투명도<input type="range" data-pk="lop" min="0" max="1" step=".05" value="${L.op}"><b>${Math.round(L.op * 100)}%</b></label>
                <div class="r"><span>잠금</span><div>${chip('lk', 1, '🔒 레이어', L.lock)}${L.type === 'px' ? chip('al', 1, '🫧 그린 곳만 칠', L.aLock) : ''}</div></div>`;
            if (L.type === 'photo') h += `<label class="pp-sl">사진 크기<input type="range" data-pk="ps" min="1" max="3" step=".01" value="${L.s}"><b>${Math.round(L.s * 100)}%</b></label><label class="pp-sl">연하게<input type="range" data-pk="pw" min="0" max=".85" step=".01" value="${L.wash}"><b>${Math.round(L.wash * 100)}%</b></label><p class="pp-hint">✋ 옮기기 도구로 사진 자리를 옮겨요</p>`;
        }
        h += `<div class="r"><span>완성 모양</span><div><button type="button" class="on">📃 속지 한 장</button></div></div>`;
        box.innerHTML = h;
    }
    let propH = 0;
    function onProp(e) {
        const L = P.cur, s = P.sel;
        const r = e.target.closest('input[type=range]');
        if (r && e.type === 'input') {
            const k = r.dataset.pk, v = +r.value, now = Date.now(); if (now - propH > 800) { if (['r', 'sw', 'op'].includes(k)) histVec(L); else histSt(); } propH = now;
            if (k === 'r') s.r = v; if (k === 'sw') s.sw = v; if (k === 'op') s.op = v; if (['r', 'sw', 'op'].includes(k)) L.dirtyV = true;
            if (k === 'lop') L.op = v; if (k === 'ps') { L.s = v; photoPaint(L); } if (k === 'pw') { L.wash = v; photoPaint(L); }
            r.nextElementSibling.textContent = k === 'op' || k === 'lop' || k === 'ps' || k === 'pw' ? Math.round(v * 100) + '%' : k === 'sw' ? v + 'px' : Math.round(v);
            P.dirty = true; renderAll(); if (k === 'lop') thumbsSoon(); return;
        }
        if (e.type !== 'click') return;
        const b = e.target.closest('button'); if (!b) return; const ds = b.dataset;
        if (ds.pp === 'paper') { paperPop(); return; }
        if (ds.vf || ds.vs || ds.vd || ds.vc) { histVec(L); if (ds.vf) s.fill = ds.vf === 'none' ? null : P.color; if (ds.vs) { s.stroke = ds.vs === 'none' ? null : P.color; if (s.stroke && !s.sw) s.sw = P.vsw || 4; } if (ds.vd) s.dash = !s.dash; if (ds.vc) s.cap = ds.vc; L.dirtyV = true; }
        if (ds.bl) { histSt(); L.blend = ds.bl; }
        if (ds.lk) { histSt(); L.lock = !L.lock; }
        if (ds.al) { histSt(); L.aLock = !L.aLock; }
        P.dirty = true; renderAll(); paintLayers(); paintProps();
    }

    /* ---------- 📎 사진 · 🧵 종이 꾸미기 ---------- */
    function addPhoto(f) {
        const u = URL.createObjectURL(f), im = new Image();
        im.onload = () => { histSt(); const at = P.layers.findIndex(l => l.type !== 'paper'); const L = addLayer('photo', '사진', { img: im, s: 1, ox: 0, oy: 0, wash: 0, op: 1 }, at < 0 ? P.layers.length : at); photoPaint(L); P.cur = L; P.dirty = true; if (P.mode === 'px') setTool('move'); renderAll(); paintLayers(); paintProps(); say('📎 사진 레이어 · ✋ 옮기기 · 오른쪽에서 크기 · 연하게', 2400); };
        im.onerror = () => { URL.revokeObjectURL(u); if (window.showMsg) showMsg('사진을 열지 못했어요.'); };
        im.src = u;
    }
    function paperPop() {
        const L = P.layers.find(l => l.type === 'paper'); if (!L) return;
        if (!window.MK || !MK.form) { say('🧵 종이 꾸미기를 쓸 수 없어요'); return; }
        let pop = $('ppPop'); if (pop) { pop.remove(); return; }
        pop = document.createElement('div'); pop.id = 'ppPop'; pop.className = 'pp-pop';
        pop.innerHTML = `<div class="pp-pop-h"><b>🧵 종이 꾸미기</b><button type="button" class="win-x" aria-label="닫기">✕</button></div><div class="pp-pop-b" id="ppPopB"></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        histSt(); let t = 0;
        MK.form($('ppPopB'), 'paper', L.mk, r => { L.mk = r; clearTimeout(t); t = setTimeout(() => paperPaint(L), 120); P.dirty = true; }, { only: ['bg', 'g', 'lc', 'gap', 'top', 'L', 'bd', 'bw', 'bc', 'rad', 'head'] });
    }

    /* ================= 🗄️ 서랍에 넣기 ================= */
    async function save() {
        if (P.saving) return;
        commitFloat(); penEnd();
        if (!P.dirty && !P.layers.some(l => l.type === 'photo')) { if (window.showMsg) showMsg('먼저 그림을 그리거나 📎 사진을 넣어 주세요.'); return; }
        if (window.dkTrialNoSave && dkTrialNoSave()) return;
        if (!window.ownTake) { if (window.comingSoon) comingSoon('🗄️ 서랍에 넣기'); return; }
        const b = $('ppGo'); P.saving = true; b.disabled = true; b.textContent = '💾 넣는 중…';
        try {
            const c = mkCv(P.W, P.H), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, P.W, P.H); compose(x, false);
            const src = c.toDataURL('image/jpeg', .86);
            await ownTake({ k: 'leaf', from: 'mine', imgs: [src], x: { lf: 'my' } });
            P.dirty = false;
            if (window.draftDrop) { try { await draftDrop(DRAFT_K[P.kind] || P.kind); } catch (e) { console.warn('📐 작업 중 파일 지우기', e); } }   // ✅ 완료 = 작업 중 파일은 이제 필요 없어요
            if (window.showMsg) showMsg('📃 속지를 <b>🗄️ 서랍</b>에 넣었어요!<br><span style="font-size:12px;color:#777;">다이어리에서 서랍을 열어 꺼내 써요.</span>');
            if (P.o.done) P.o.done();
        } catch (e) { if (window.showMsg) showMsg('⚠ 서랍에 넣지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); }
        finally { P.saving = false; if (b.isConnected) { b.disabled = false; b.textContent = '✅ 완료'; } }
    }

    /* ================= 💾 임시저장 (도안/작업중-<종류>.json · 도련 11-14) ================= */
    const DRAFT_K = { leaf: '속지', tk: '떡메', tape: '마테', piece: '조각', paper: '모조지', seal: '씰' };
    const isBlank = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return false; return true; };
    function photoData(im) {                                                  // 📎 사진 = 종이 크기에 맞게 줄여서 (긴 쪽 1800px · JPEG)
        const k = Math.min(1, 1800 / Math.max(im.width, im.height)), c = mkCv(Math.round(im.width * k), Math.round(im.height * k));
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .88);
    }
    function snapshot() {
        return { v: 1, kind: P.kind, W: P.W, H: P.H, at: Date.now(), cur: P.layers.indexOf(P.cur),
            set: { mode: P.mode, tool: P.tool, brush: P.brush, size: P.size, op: P.op, soft: P.soft, stab: P.stab, vsw: P.vsw, vround: P.vround, color: P.color, recent: P.recent, grid: P.grid, sym: P.sym, shapeK: P.shapeK, shapeFill: P.shapeFill },
            layers: P.layers.map(L => {
                const o = { type: L.type, name: L.name, vis: L.vis, lock: L.lock, op: L.op, blend: L.blend, aLock: L.aLock };
                if (L.type === 'paper') o.mk = L.mk;
                if (L.type === 'px') o.png = isBlank(L.cv) ? '' : L.cv.toDataURL('image/png');
                if (L.type === 'vec') o.shapes = L.shapes;
                if (L.type === 'photo') Object.assign(o, { img: L.imgData || (L.imgData = photoData(L.img)), s: L.s, ox: L.ox, oy: L.oy, wash: L.wash });
                return o;
            }) };
    }
    async function saveDraft(quietly) {
        if (P.saving) return false; commitFloat(); penEnd();
        if (window.dkTrialNoSave && dkTrialNoSave()) return false;
        if (!window.draftWrite) { if (window.comingSoon) comingSoon('💾 임시저장'); return false; }
        const b = $('ppTmp'); P.saving = true; if (b) { b.disabled = true; b.textContent = '💾 저장 중…'; }
        try { await draftWrite(DRAFT_K[P.kind] || P.kind, snapshot()); P.dirty = false; if (!quietly) say('💾 임시저장했어요 · 다음에 [이어서 작업]으로 열어요', 2200); return true; }
        catch (e) { console.warn('💾 임시저장', e); if (window.showMsg) showMsg('⚠ 임시저장하지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '잠시 뒤 다시 해 주세요.')); return false; }
        finally { P.saving = false; if (b && b.isConnected) { b.disabled = false; b.textContent = '💾 임시저장'; } }
    }
    function restoreDraft(d) {
        const loadImg = src => new Promise(ok => { if (!src) return ok(null); const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
        P.layers = []; P.cur = null;
        Object.assign(P, d.set || {});
        (d.layers || []).forEach(o => {
            const L = addLayer(o.type, o.name, { vis: o.vis !== false, lock: !!o.lock, op: o.op == null ? 1 : o.op, blend: o.blend || 'source-over', aLock: !!o.aLock }, P.layers.length);
            if (o.type === 'paper') { L.mk = o.mk || { bg: '#ffffff' }; paperPaint(L); }
            if (o.type === 'vec') { L.shapes = o.shapes || []; L.dirtyV = true; }
            if (o.type === 'px' && o.png) loadImg(o.png).then(im => { if (im) { L.cv.getContext('2d').drawImage(im, 0, 0); renderAll(); thumbsSoon(); } });
            if (o.type === 'photo') { Object.assign(L, { s: o.s || 1, ox: o.ox || 0, oy: o.oy || 0, wash: o.wash || 0, imgData: o.img }); loadImg(o.img).then(im => { if (im) { L.img = im; photoPaint(L); renderAll(); thumbsSoon(); } }); }
        });
        if (!P.layers.some(l => l.type === 'paper')) { const pp = addLayer('paper', '종이', { lock: true, mk: { bg: '#ffffff' } }, 0); paperPaint(pp); }
        P.cur = P.layers[d.cur] || P.layers[P.layers.length - 1];
        modeBtns(); paintTools(); setColor(P.color); renderAll(); paintLayers(); paintProps();
        document.querySelectorAll('.pp-view [data-v]').forEach(b => b.classList.toggle('on', (b.dataset.v === 'grid' && P.grid) || (b.dataset.v === 'sym' && P.sym)));
        P.dirty = false; say('✏️ 이어서 그려요', 1500);
    }

    window.ppOpen = ppOpen; window.ppClose = ppClose; window.ppDirty = ppDirty; window.ppSaveDraft = saveDraft; window.PP_DRAFT_K = DRAFT_K;
    window.ppTest = () => P;                                                     // 🧪 시험용 (tests/t_padpaint.py)
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['padpaint'] = true;
