/* 말랑달콤 다이어리 - js/padpaint.js
   🎨 태블릿 그림판 (도련 11-13 · 1172 · 시안 '그리기시안' 그대로) : 📃 속지부터 · 나중에 떡메 · 마테 · 조각 · 모조지에도 같은 작업대
   - 💻 📲 태블릿 작업대(js/tablet.js #tbWs) 세 칸에 그려요 : 왼쪽 = 가져오기 · 도구 · 도구 설정 · 색 / 가운데 = 종이 · 보기 막대 / 오른쪽 = 레이어 · 고른 것 설정 · 🗄️ 서랍에 넣기
   - 위 = 🖌️ 픽셀 ↔ ✒️ 벡터 · ↶ ↷
   - 🗂️ 레이어 : 종이(맨 아래 · 하얀 종이 · 꾸미기는 블록 레이어로 · 도련 11-18 종이 꾸미기 창 없앰) · 사진(📎) · 픽셀 · 벡터 · 🧩 블록(css 공식 기능 · js/cssblocks.js) 섞어서 · 👁 · 🔒 · 섞는 법 · 투명도 · 그린 곳만 칠
   - 🖌️ 픽셀 = 손으로 쓱쓱 (펜 압력 = 굵기 · 떨림 보정 = 마우스도 매끈) : 브러시(붓 모양 6) · 연필 · 마커 · 에어 · 지우개 · 채우기 · 스포이드 · 올가미 · 옮기기 · 도형 · 글씨 · 확대
   - ✒️ 벡터 = 점을 찍어 그려요 (펜 없이 마우스로도) : 선택 · 점 고치기 · 점 찍기(클릭 = 꺾인 점 · 끌기 = 둥근 점 · 첫 점 = 닫기 · Enter = 끝) · 곡선 · 네모 · 동그라미 · 하트 · 별 · 글씨 · 점 자르기 · 칠하기 · 옮기기
   - 💾 임시저장 (도련 11-14) = 도안/작업중-속지.json 하나에 모두 (레이어 · 그림 PNG · 사진 JPEG · 벡터 점 · 종이 · 도구) · 종류마다 하나 · 열 때 [이어서 작업] [새 작업] (js/tablet.js)
   - 🏷️ 씰스티커 (도련 11-14) : 종이 = 씰 시트 (📐 씰 규격 세로 · 가로 · 정사각 · SEAL_SZ) · 📎 사진 · 🏷️ 내가 만든 스티커(📸 · 📷 · 🔤) = 그림 레이어로 시트 위에 (작게 · 옮기기 · 크기)
     ✅ 완료 = 떨어져 있는 그림마다 한 장 (sealOut : 붙어 있으면 한 장 · 하얀 칼선 · 놓은 자리 그대로 시트 배치 L) → 📐 도안 (🖨 프린터에서 한 시트)
   - 🧩 조각스티커 (도련 11-14) : 종이 = 조각 판 800×800 (PIECE_K .5 → 페이지 400px) · 그린 것 전체 = 조각 하나 (하얀 칼선) · ➕ 이 조각 담기 (4개까지 · P.pcs · 임시저장에도) · ✅ 완료 = 담은 조각 + 그리던 것 → 📐 도안 (🖨 늘 4조각)
   - 📄 모조지스티커 (도련 11-14) : 종이 = 모조지 한 장 그대로 (📐 모조지 규격 세로 · 정사각 · 길쭉 · PAPER_SZ · 가로 720px = 페이지 360px · js/papermaker.js PM_W) · 🧵 종이 꾸미기 · 📎 사진(가득) · 🏷️ 내가 만든 스티커
     ✅ 완료 = 보이는 그대로 인쇄된 모조지 한 장 (ownTake paper · 쓸 때 ✂️ 가위로 오려요) → 📐 도안
   - 📔 붙여 보기 (씰 · 조각 · 모조지) : 스티커 그림 644px = 148mm (붙이면 실제 크기 비율 · js/elements.js elOrig · js/skins.js STK_MM · dyImgK) → 씰은 시트 세로 = 644 로 구워요
   - ✅ 완료 = 보이는 레이어를 한 장으로 → 📃 속지 한 장 (🗄️ 서랍 + 📐 도안 · js/own.js ownTake · 예전 속지 만들기와 같아요) → 작업 중 파일은 지워요 */
(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const SW = ['#3d2b33', '#ff5d8f', '#ff9a3c', '#ffd23f', '#5cc98a', '#4aa8ff', '#9b7bff', '#ffffff', '#ffb3c8', '#ffe7a3', '#bfe9d3', '#cfe3ff'];
    const T_PX = [['brush', '🖌️', '브러시'], ['pencil', '✏️', '연필'], ['marker', '🖍️', '마커'], ['air', '💨', '에어'], ['stamp', '⭐', '스탬프'], ['smudge', '👆', '문지르기'], ['erase', '🧽', '지우개'], ['fill', '🪣', '채우기'], ['grad', '🌈', '그라데이션'], ['drop', '💧', '스포이드'], ['lasso', '➰', '올가미'], ['move', '✋', '옮기기'], ['shape', '⬛', '도형'], ['text', '🔤', '글씨'], ['zoom', '🔍', '확대']];
    const T_VC = [['select', '↖️', '선택'], ['direct', '◦', '점 고치기'], ['pen', '✒️', '점 찍기'], ['curve', '〰️', '곡선'], ['rect', '▭', '네모'], ['ellipse', '◯', '동그라미'], ['heart', '♡', '하트'], ['star', '☆', '별'], ['poly', '⬡', '다각형'], ['line', '╱', '선'], ['arrow', '➝', '화살표'], ['vtext', '🔤', '글씨'], ['cut', '✂️', '점 자르기'], ['paint', '🪣', '칠하기'], ['vmove', '✋', '옮기기']];
    const BRUSH = [['pencil', '연필'], ['round', '둥근 펜'], ['water', '수채'], ['crayon', '크레용'], ['hi', '형광펜'], ['glit', '반짝이'], ['pixel', '픽셀 아트']];
    const STAMPS = [['heart', '💗 하트'], ['star', '⭐ 별'], ['spark', '✨ 반짝'], ['flower', '🌸 꽃'], ['dot', '⚪ 동그라미'], ['drop', '💧 물방울']];   // ⭐ 스탬프 붓 (도련 11-18)
    const BLEND = [['source-over', '보통'], ['multiply', '곱하기'], ['screen', '밝게'], ['overlay', '겹치기'], ['darken', '어두운 쪽'], ['lighten', '밝은 쪽'], ['color-dodge', '닷지'], ['soft-light', '부드럽게'], ['difference', '차이'], ['hue', '색상만'], ['color', '색만']];   // 🧩 css 섞는 법 모두 (도련 11-18)
    const TAG = { paper: ['pp', '종이'], photo: ['ph', '사진'], px: ['px', '픽셀'], vec: ['vc', '벡터'], css: ['cb', 'CSS'], svg: ['sv', 'SVG'] };
    const P = {};                                                                // 지금 그림판
    let uid = 1;
    const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const say = (t, ms) => { const b = $('ppSay'); if (!b) return; b.textContent = t; b.classList.add('on'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), ms || 1800); };
    const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const rgbHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    /* ================= 열기 · 닫기 ================= */
    function ppOpen(o) {
        if (P.on) ppClose();                                                  // 🐞 두 번 열려도 막대 · 단축키가 겹치지 않게 (도련 11-14 : 위 막대가 두 벌 → 끼워 보기가 열리자마자 닫혔어요)
        const TPD = o.kind === 'tape', TKD = o.kind === 'tk' || TPD, PX = TPD ? PXMM_T : PXMM;   // 🧻 떡메 · 🎀 테이프 = 실제 크기(mm)로 (도련 11-14 · 테이프 tkmm = [한 칸 길이, 폭])
        const tkmm = (o.draft && Array.isArray(o.draft.tkmm) && o.draft.tkmm) || o.tkmm || (TPD ? TAPE_MM0 : TK_MM0);
        const SZ = o.kind === 'seal' ? SEAL_SZ[(o.draft && o.draft.sz) || o.sz || 'tall'] || SEAL_SZ.tall : o.kind === 'paper' ? PAPER_SZ[(o.draft && o.draft.sz) || o.sz || 'tall'] || PAPER_SZ.tall : o.kind === 'piece' ? ['조각', PIECE_PX, PIECE_PX] : null;   // 🏷️ 씰 시트 규격
        const W = (o.draft && +o.draft.W) || (SZ ? SZ[1] : TKD ? Math.round(tkmm[0] * PX) : o.W || 900), H = (o.draft && +o.draft.H) || (SZ ? SZ[2] : TKD ? Math.round(tkmm[1] * PX) : o.H || 1395);   // 💾 이어서 = 저장할 때 종이 크기 그대로 (📐 규격)
        Object.assign(P, { on: true, savedAt: 0, o, kind: o.kind || 'leaf', still: ['leaf', 'tk', 'paper', 'tape'].includes(o.kind || 'leaf'), pcs: ((o.draft && o.draft.pcs) || []).slice(0, 4), sz: (o.draft && o.draft.sz) || o.sz || 'tall', W, H, spec: (o.draft && o.draft.spec) || specNow(), tkmm: tkmm.slice(), glue: (o.draft && o.draft.glue) || '', wrap: TPD, layers: [], cur: null, mode: 'px', tool: 'brush', brush: 'round', size: 8, op: .9, soft: .45, stab: .6,
            vsw: 6, vround: 12, color: '#ff5d8f', recent: ['#4aa8ff', '#ffd23f', '#5cc98a'], hsv: [340, .64, 1], z: 1, px: 0, py: 0, base: 1, grid: false, sym: false,
            hist: [], redo: [], sel: null, many: [], addSel: false, cut: null, cutImg: null, symN: 0, adj: null, pt: null, pen: null, lasso: null, fl: null, drag: null, shapeK: 'rect', shapeFill: false, dirty: false, keyOn: true });
        P.two = !!(o.draft && o.draft.two);
        if (!o.draft && P.kind === 'leaf' && P.spec && P.spec.r > 0) P.H = Math.round(P.W * leafR(P.spec.r));   // 📐 새 종이 = 지금 펼친 다이어리 한 쪽 규격 (📖 양쪽 = 펼친 두 쪽)
        if (o.draft) { buildUI(); fit(); restoreDraft(o.draft); P.savedAt = +o.draft.at || 0; tmpShow(); }
        else {
            const paper = addLayer('paper', '종이', { lock: true, mk: Object.assign({ bg: o.bg || '#ffffff' }, o.mk || {}) });
            const L1 = addLayer('px', '그림 1'); P.cur = L1;
            buildUI(); paperPaint(paper); fit(); renderAll(); paintLayers(); paintProps();
        }
        requestAnimationFrame(() => realSize(true));                         // 🧻 떡메 · 📃 속지 = 처음엔 실제 크기(100%)로 보여요 (화면에 다 들어가면 · 아니면 맞춤)
        window.addEventListener('resize', fit); window.addEventListener('resize', rszOn); document.addEventListener('keydown', onKey);
    }
    const rszOn = () => { if (P.rszPlace) P.rszPlace(); };
    function ppClose() {
        if (!P.on) return; P.on = false;
        window.removeEventListener('resize', fit); window.removeEventListener('resize', rszOn); document.removeEventListener('keydown', onKey);
        document.querySelectorAll('.pp-rsz').forEach(x => x.remove()); P.rszPlace = null;
        const x = $('ppBarX'); if (x) x.remove();
        const pop = $('ppPop'); if (pop) pop.remove();
    }
    const ppDirty = () => !!(P.on && P.dirty);
    async function ppDiscard() {                                              // 🗑 나갈 때 '지우기' : 자동 임시저장을 멈추고 (저장 중이면 끝날 때까지 기다려요 · 그다음 지워야 다시 안 생겨요)
        P.dirty = false;
        for (let i = 0; i < 60 && P.saving; i++) await new Promise(r => setTimeout(r, 50));
        P.dirty = false;
    }

    /* ================= 레이어 ================= */
    function addLayer(type, name, extra, at) {
        const L = Object.assign({ id: uid++, type, name, vis: true, lock: false, op: 1, blend: 'source-over', aLock: false, cv: mkCv(P.W, P.H), shapes: [], dirtyV: true }, extra || {});
        if (type === 'vec' || type === 'css' || type === 'svg') L.cache = mkCv(P.W, P.H);
        if (type === 'svg' && !L.els) L.els = [];                             // 🌀 svg 블록 레이어 = 도형 목록 (js/svgblocks.js)
        if (type === 'css') { if (!L.kids) L.kids = []; if (!L.cls) L.cls = {}; if (!L.pfl) L.pfl = []; if (!L.pfn) L.pfn = []; if (!L.blocks) L.blocks = [CB.fresh('background-color')]; if (!L.pb) L.pb = []; if (!L.pa) L.pa = []; if (!L.box) L.box = { x: .15, y: .15, w: .7, h: .7 }; if (L.text == null) L.text = ''; }   // 🧩 블록 레이어 = 상자 하나 + 블록 + 상자 안 글자 (js/cssblocks.js)
        if (at == null) { const i = P.cur ? P.layers.indexOf(P.cur) + 1 : P.layers.length; P.layers.splice(i, 0, L); } else P.layers.splice(at, 0, L);
        return L;
    }
    function paperPaint(L) {                                                    // 🧵 종이 (js/maker.js 속지 종이 그대로)
        const x = L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.fillStyle = L.mk.bg || '#fff'; x.fillRect(0, 0, P.W, P.H);
        if (window.MK && MK.paperSvg && MK.url) {
            const im = new Image(); im.onload = () => { x.clearRect(0, 0, P.W, P.H); x.drawImage(im, 0, 0, P.W, P.H); renderAll(); paintLayers(); }; im.src = MK.url(MK.paperSvg(Object.assign({}, L.mk, { top: 0, head: '' }), P.W, P.H));   // 위 여백 · 머리글 없음 (예전 임시저장에 남아 있어도)
        } else { x.strokeStyle = L.mk.lc || '#f6d5df'; x.lineWidth = 2; for (let y = (L.mk.gap || 56); y < P.H; y += (L.mk.gap || 56)) { x.beginPath(); x.moveTo(0, y); x.lineTo(P.W, y); x.stroke(); } }
    }
    function photoPaint(L) {                                                    // 📎 사진 레이어 : 종이 가득 (크기 · 자리 · 연하게)
        const x = L.cv.getContext('2d'), im = L.img; x.clearRect(0, 0, P.W, P.H);
        const k = (L.fit === 'c' ? Math.min(P.W / im.width, P.H / im.height) * .35 : Math.max(P.W / im.width, P.H / im.height)) * L.s, w = im.width * k, h = im.height * k;   // fit c = 🏷️ 씰 : 작게 가운데 (스티커 한 장)
        x.drawImage(im, (P.W - w) / 2 + L.ox, (P.H - h) / 2 + L.oy, w, h);
        if (L.wash) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(255,255,255,${L.wash})`; x.fillRect(0, 0, P.W, P.H); x.globalCompositeOperation = 'source-over'; }
    }
    function vecPaint(L) {                                                      // ✒️ 벡터 레이어 → 그림 (바뀔 때만)
        const x = L.cache.getContext('2d'); x.clearRect(0, 0, P.W, P.H);
        L.shapes.forEach(s => drawShape(x, s)); L.dirtyV = false;
    }
    const layerImg = L => { if (L.type === 'vec') { if (L.dirtyV) vecPaint(L); return L.cache; } if (L.type === 'css') { if (L.dirtyV) { CB.paint(L.cache, P.W, P.H, L); L.dirtyV = false; } return L.cache; } if (L.type === 'svg') { if (L.dirtyV) { SB.paint(L.cache, P.W, P.H, L); L.dirtyV = false; } return L.cache; } return L.cv; };
    if (window.CB) { CB.onImg = () => { if (!P.on) return; P.layers.forEach(l => { if (l.type === 'css') l.dirtyV = true; }); renderAll(); };   // 🧩 브라우저가 css 를 다 그리면 (js/cssblocks.js)
        CB.onErr = () => { if (P.on) say('⚠ 이 기기에서는 CSS 그림을 만들 수 없어요', 3000); };
        CB.filterOf = ref => {                                                 // 🌀 css → svg : 'svg 레이어 id:도형 id' → 그 도형의 <filter> (js/cssblocks.js 'svg-filter')
            const eid = String(ref).split(':').pop(), l = P.layers.find(q => q.type === 'svg' && (q.els || []).some(e => e.id === eid)); if (!l || !window.SB) return null;   // 도형 id 로 (레이어 id 는 불러올 때 바뀌어요)
            const m = SB.build(l, P.W, P.H, '').match(new RegExp(`<filter id="${eid}f"[\\s\\S]*?</filter>`)); return m ? { id: eid + 'f', svg: m[0] } : null; }; }
    if (window.SB) SB.onImg = () => { if (!P.on) return; P.layers.forEach(l => { if (l.type === 'svg' || l.type === 'css') l.dirtyV = true; }); renderAll(); };   // css 상자가 svg 필터를 쓰면 같이 (11-19)   // 🌀 브라우저가 svg 를 다 그리면

    /* ================= 화면 (작업대 세 칸) ================= */
    function buildUI() {
        const o = P.o;
        document.querySelectorAll('#ppBarX, #ppSpecPop, #ppSizePop').forEach(e => e.remove());   // 예전 막대 · 창은 지우고
        const bar = o.bar, x = document.createElement('div'); x.id = 'ppBarX'; x.className = 'pp-barx';
        x.innerHTML = `<div class="pp-mode"><button type="button" data-m="px">🖌️ 픽셀<small>손으로 쓱쓱 · 펜 있으면 좋아요</small></button><button type="button" data-m="vec">✒️ 벡터<small>점을 찍어 그려요 · 마우스로도</small></button><button type="button" data-m="css">🧩 CSS<small>상자를 CSS 기능으로 꾸며요</small></button><button type="button" data-m="svg">🌀 SVG<small>도형에 SVG 기능을 붙여요</small></button></div><button type="button" class="pp-tourb" data-tour="1" title="예시를 고르면 마우스가 움직이며 만드는 과정을 보여 줘요">🎓 예시 보기<small>CSS · SVG 예시</small></button>
${P.kind === 'leaf' ? '<button type="button" class="pp-specb" data-q="spec" title="만든 속지를 다이어리에 끼워 보고 · 그 다이어리 크기로 맞춰요"></button><button type="button" class="pp-specb pp-two" data-q="two" title="📄 한 쪽 디자인 (양쪽에 같이도) · 📖 양쪽 디자인 (왼쪽 · 오른쪽 따로)"></button>' : ''}${P.kind === 'paper' ? '<button type="button" class="pp-specb" data-q="seal" title="모조지 모양 (세로 · 정사각 · 길쭉)"></button><button type="button" class="pp-specb" data-q="spec" title="만든 모조지를 다이어리 옆에 실제 크기 비율로 놓아 봐요"></button>' : ''}${P.kind === 'seal' ? '<button type="button" class="pp-specb" data-q="seal" title="씰 시트 모양 (세로 · 가로 · 정사각)"></button><button type="button" class="pp-specb" data-q="spec" title="만든 씰 스티커를 다이어리에 실제 크기 비율로 붙여 봐요"></button>' : ''}${P.kind === 'piece' ? '<button type="button" class="pp-specb" data-q="spec" title="만든 조각을 다이어리에 실제 크기 비율로 붙여 봐요"></button>' : ''}${P.kind === 'tk' || P.kind === 'tape' ? `<button type="button" class="pp-specb" data-q="size" title="${P.kind === 'tape' ? '테이프' : '떡메모지'} 실제 크기 (mm)"></button><button type="button" class="pp-specb" data-q="spec" title="만든 ${P.kind === 'tape' ? '테이프' : '떡메'}를 다이어리에 실제 크기로 붙여 봐요"></button>` : ''}<div class="pp-qa"><button type="button" data-q="undo" title="되돌리기 (Ctrl+Z)">↶</button><button type="button" data-q="redo" title="다시 (Ctrl+Y)">↷</button></div>`;
        bar.appendChild(x);
        x.addEventListener('click', e => { if (e.target.closest('[data-tour]')) { if (window.padTour) padTour.open(); return; } const m = e.target.closest('[data-m]'), qq = e.target.closest('[data-q]'); if (m) setMode(m.dataset.m); if (qq && qq.dataset.q === 'seal') { sealPop(); return; } if (qq && qq.dataset.q === 'two') { twoFlip(); return; } if (qq) qq.dataset.q === 'spec' ? (P.kind === 'tk' || P.kind === 'tape' ? tkPastePop() : P.kind === 'seal' || P.kind === 'piece' || P.kind === 'paper' ? sealPastePop() : specPop()) : qq.dataset.q === 'size' ? sizePop() : (qq.dataset.q === 'undo' ? undo : redo)(); });
        o.L.innerHTML = `<h4 id="ppSrcT">📥 가져오기</h4><div class="pp-src"><button type="button" data-a="photo">📎 사진</button>${P.kind === 'seal' || P.kind === 'piece' || P.kind === 'paper' ? '<button type="button" data-a="mine">🏷️ 내가 만든 스티커</button>' : ''}</div>
            <h4 id="ppToolT"></h4><div class="pp-tools" id="ppTools"></div><div id="ppOpt"></div>
            <h4 id="ppColT">🎨 색</h4><div class="pp-col"><canvas id="ppSv" width="172" height="172"></canvas><div><canvas id="ppHue" width="300" height="24"></canvas><div class="pp-sw" id="ppSw"></div></div></div>
            <div class="pp-cur"><span id="ppNow"></span>지금 색 · 최근 <span id="ppRec"></span></div>
            <input type="file" accept="image/*" id="ppFile" hidden>`;
        o.C.innerHTML = `<div class="pp-stage" id="ppStage"><div class="pp-doc${P.kind === 'tk' ? ' pp-tkdoc' : ''}${P.kind === 'tape' ? ' pp-tpdoc' : ''}" id="ppDoc">${P.kind === 'tk' ? '<i class="pp-gluebar" id="ppGlueBar"></i>' : ''}${P.kind === 'tape' ? `<canvas class="pp-ghost l" id="ppGhL" width="${P.W}" height="${P.H}"></canvas><canvas class="pp-ghost r" id="ppGhR" width="${P.W}" height="${P.H}"></canvas>` : ''}<canvas id="ppCv" width="${P.W}" height="${P.H}"></canvas><canvas id="ppOv" width="${P.W}" height="${P.H}"></canvas></div>
                <i class="pp-brush" id="ppBr"></i><div class="pp-fl" id="ppFlS" hidden></div><div class="pp-fl" id="ppFlP" hidden></div><div class="pp-say" id="ppSay"></div></div>
            <div class="pp-view"><button type="button" data-v="out">－</button><b id="ppZ">100%</b><button type="button" data-v="in">＋</button><button type="button" data-v="hand">✋ 손바닥</button><button type="button" data-v="grid">▦ 격자</button><button type="button" data-v="sym">⇋ 대칭</button><button type="button" data-v="fit">🔲 맞춤</button><button type="button" data-v="real" title="화면에 실제 크기(mm)로">📏 실제 크기</button>${P.kind === 'tape' ? '<button type="button" data-v="wrap" class="on" title="왼쪽 끝 · 오른쪽 끝이 이어져요">🔁 이어그리기</button>' : ''}</div>`;
        o.R.innerHTML = (P.kind === 'piece' ? `<h4>🧩 담은 조각<em id="ppPcN">0 / 4</em></h4><div class="ipd-pcs" id="ppPcs"></div><button type="button" class="pp-pcadd" id="ppPcAdd">➕ 이 조각 담기<small>담고 나면 새 조각을 그려요</small></button>` : '') + (P.kind === 'tape' ? `<h4>🎀 테이프 미리보기<em>한 칸이 쭉 이어져요</em></h4><div class="pp-tapepv" id="ppTapePv"></div>` : '') + (P.kind === 'tk' ? `<h4>💗 풀칠 띠 색<em>떡메 윗부분 · 묶음에 붙은 자리</em></h4><div class="pp-glue" id="ppGlue">${GLUES.map(([v, n]) => `<button type="button" data-g="${v}"><i style="background:${v || 'var(--dy-accent, #ff8fb1)'}"></i>${n}</button>`).join('')}</div>` : '') + `<div class="pp-rtab" id="ppRTab" role="tablist"><button type="button" data-rt="ly" role="tab">🗂️ 레이어</button><button type="button" data-rt="bk" role="tab">🧩 기능</button></div><div class="pp-lysec"><h4>🗂️ 레이어<em>위가 앞이에요 · 끌어서 순서</em></h4><div class="pp-layers" id="ppLy"></div>
            <div class="pp-lyb"><button type="button" class="add" data-l="px">＋ 픽셀</button><button type="button" class="add" data-l="vec">＋ 벡터</button><button type="button" class="add" data-l="css">＋ CSS</button><button type="button" class="add" data-l="svg">＋ SVG</button><button type="button" data-l="dup">⧉ 복제</button><button type="button" data-l="del">🗑 삭제</button></div>
            <div class="pp-lyb three"><button type="button" data-l="merge">⤓ 아래로 합치기</button><button type="button" data-l="lock">🔒 잠그기</button><button type="button" data-l="cutl">✂ 잘라 붙이기</button></div></div>
            <h4 id="ppPropT"></h4><div id="ppProp" class="pp-prop"></div>
            <div class="pp-end"><button type="button" class="pp-tmp" id="ppTmp">💾 임시저장</button><button type="button" class="shm-go pp-go" id="ppGo">✅ 도안완료</button></div>
            <p class="pp-tmpt" id="ppTmpT">📱 이 기기에 임시저장 (자동으로도 저장돼요)</p>
            <p class="pp-hint pp-endt">💾 임시저장은 작업 중인 이 기기에만 임시로 저장돼요<br>📐 완료된 도안은 🖨 프린터에서 스티커로 뽑아요</p>`;   // 도련 11-15 : 버튼 밑 두 줄
        o.L.onclick = e => { const a = e.target.closest('[data-a]'); if (a) { if (a.dataset.a === 'photo') $('ppFile').click(); if (a.dataset.a === 'mine') minePop(); } };
        if (P.kind === 'piece') { $('ppPcAdd').onclick = pcAdd; $('ppPcs').onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; P.pcs.splice(+b.dataset.i, 1); P.dirty = true; pcPaint(); }; pcPaint(); }
        $('ppFile').onchange = e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) addPhoto(f); };
        $('ppTools').onclick = e => { const se = e.target.closest('[data-sbel]'); if (se) { sbAddEl(se.dataset.sbel); return; } const sb = e.target.closest('[data-sbb]'); if (sb) { sbAddB(sb.dataset.sbb); return; } const c = e.target.closest('[data-cb]'); if (c) { cbAdd(c.dataset.cb); return; } const b = e.target.closest('[data-t]'); if (b) setTool(b.dataset.t); };
        $('ppOpt').oninput = $('ppOpt').onclick = onOpt;
        o.C.querySelector('.pp-view').onclick = e => { const b = e.target.closest('[data-v]'); if (b) onView(b.dataset.v); };
        o.R.querySelector('.pp-lyb').parentElement.addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) layerAct(b.dataset.l); });
        $('ppRTab').onclick = e => { const b = e.target.closest('[data-rt]'); if (!b) return; P.rTab = b.dataset.rt; paintProps(); };   // 🧩 블록 모드 = 오른쪽 탭 (도련 11-18 · 레이어 | 블록)
        rszWire();
        $('ppGo').onclick = save; $('ppTmp').onclick = () => saveDraft();
        $('ppProp').oninput = $('ppProp').onclick = onProp;
        colorWire(); paintTools(); modeBtns(); specBtn(); glueShow();
        if ($('ppGlue')) $('ppGlue').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; P.glue = b.dataset.g; P.dirty = true; glueShow(); };
        const st = $('ppStage');
        st.addEventListener('pointerdown', down); st.addEventListener('pointermove', move); st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
        st.addEventListener('pointerleave', () => { $('ppBr').hidden = true; });
        st.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY); }, { passive: false });
        st.addEventListener('dblclick', e => { if (P.tool === 'pen' && P.pen) penEnd(); });
        $('ppFlS').onclick = e => { const f = e.target.closest('[data-fx]'); if (f) { flAct(f.dataset.fx); return; } const b = e.target.closest('[data-s]'); if (b) shapeAct(b.dataset.s); };
        $('ppFlP').onclick = e => { const b = e.target.closest('[data-p]'); if (b) pointAct(b.dataset.p); };
    }
    function modeBtns() { document.querySelectorAll('#ppBarX [data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === P.mode)); }
    function setMode(m) {
        if (P.mode === m) return; commitFloat(); penEnd(); P.mode = m; P.sel = null; P.pt = null; P.many = []; P.addSel = false; paintFloats();
        const want = m;
        if (!P.cur || P.cur.type !== want) {                                       // 그 모드의 레이어로 (없으면 새로)
            const L = [...P.layers].reverse().find(l => l.type === want);
            if (L) P.cur = L; else { histSt(); P.cur = addLayer(want, lyName(want)); say(want === 'vec' ? '✒️ 벡터 레이어를 새로 만들었어요' : want === 'css' ? '🧩 CSS 레이어를 새로 만들었어요 · 왼쪽 기능을 눌러 쌓아요' : want === 'svg' ? '🌀 SVG 레이어를 새로 만들었어요 · 왼쪽에서 도형을 넣고 기능을 붙여요' : '🖌️ 픽셀 레이어를 새로 만들었어요'); }
        }
        P.tool = m === 'px' ? 'brush' : m === 'css' ? 'cbmove' : m === 'svg' ? 'sbmove' : 'pen'; if (m === 'css' || m === 'svg') P.rTab = 'bk';
        modeBtns(); paintTools(); renderAll(); paintLayers(); paintProps();
    }
    const lyName = t => t === 'svg' ? 'SVG ' + (P.layers.filter(l => l.type === 'svg').length + 1) : t === 'px' ? '그림 ' + (P.layers.filter(l => l.type === 'px').length + 1) : t === 'css' ? 'CSS ' + (P.layers.filter(l => l.type === 'css').length + 1) : '모양 ' + (P.layers.filter(l => l.type === 'vec').length + 1);
    function setTool(t) {
        if (t === P.tool) return; commitFloat(); penEnd(); P.tool = t; if (!['select', 'direct'].includes(t)) { P.pt = null; } if (!['select', 'direct', 'paint'].includes(t)) P.sel = null;
        paintTools(); drawOv(); paintFloats(); paintProps();
        $('ppStage').dataset.tool = t;
    }
    const sl = (k, n, v, min, max, step, unit) => `<label class="pp-sl">${n}<input type="range" data-k="${k}" min="${min}" max="${max}" step="${step || 1}" value="${v}"><b>${unit === '%' ? Math.round(v * 100) + '%' : v + (unit || '')}</b></label>`;
    function paintTools() {
        P.o.L.classList.toggle('pp-cssm', P.mode === 'css' || P.mode === 'svg');                  // 🧩 블록 모드 = 📥 사진 · 🎨 색 칸 없이 (픽셀 · 벡터에 있어요 · 도련 11-18)
        if (P.mode === 'css') { cbTools(); return; }
        if (P.mode === 'svg') { sbTools(); return; }
        const V = P.mode === 'vec', T = V ? T_VC : T_PX;
        $('ppToolT').innerHTML = V ? '✒️ 벡터 도구<em>클릭 = 꺾인 점 · 끌면 곡선</em>' : '🖌️ 픽셀 도구<em>펜 압력 · 떨림 보정</em>';
        $('ppTools').innerHTML = T.map(([k, i, n]) => `<button type="button" data-t="${k}" class="${k === P.tool ? 'on' : ''}">${i}<small>${n}</small></button>`).join('');
        let h = '';
        if (V) h = `<h4>점 찍기 방법</h4><div class="pp-chips"><span>클릭 = 꺾인 점</span><span>끌기 = 둥근 점</span><span>처음 점 = 닫기</span><span>Enter = 끝</span></div>`
            + sl('vsw', '선 굵기', P.vsw, 0, 40, 1, 'px') + sl('vround', '둥글기', P.vround, 0, 80, 1, '') + sl('op', '투명도', P.op, .05, 1, .05, '%')
            + sl('polyN', '다각형 변', P.polyN || 6, 3, 12, 1, '') + sl('radN', '빙글 복사', P.radN || 6, 2, 24, 1, '개')
            + `<p class="pp-hint">↖️ 선택 → 떠 있는 막대 : ➕ 더 고르기 (여러 개) → 합치기 · 빼기 · 겹친 곳 · 그룹 · 정렬 / 🌀 빙글 복사 · 🌈 그라데이션</p>`;
        else {
            if (P.tool === 'brush') h += `<h4>붓 모양</h4><div class="pp-brushes">${BRUSH.map(([k, n]) => `<button type="button" data-b="${k}" class="${k === P.brush ? 'on' : ''}"><canvas width="160" height="52" data-pv="${k}"></canvas><span>${n}</span></button>`).join('')}</div>`;
            if (P.tool === 'stamp') h += `<h4>스탬프 모양</h4><div class="pp-chips pick">${STAMPS.map(([k, n]) => `<button type="button" data-stk="${k}" class="${k === (P.stampK || 'heart') ? 'on' : ''}">${n}</button>`).join('')}<button type="button" data-stj="1" class="${P.stampJ !== false ? 'on' : ''}">🎲 흩뿌리기</button></div>`;
            if (P.tool === 'grad') h += `<h4>그라데이션</h4><div class="pp-chips pick"><button type="button" data-gs="linear" class="${(P.gradS || 'linear') === 'linear' ? 'on' : ''}">➖ 직선</button><button type="button" data-gs="radial" class="${P.gradS === 'radial' ? 'on' : ''}">⭕ 원형</button><button type="button" data-gk="clear" class="${(P.gradK || 'clear') === 'clear' ? 'on' : ''}">지금 색 → 투명</button><button type="button" data-gk="two" class="${P.gradK === 'two' ? 'on' : ''}">지금 색 → <i style="background:${P.recent[0] || '#fff'}"></i> 최근 색</button></div><p class="pp-hint">종이 위를 끌어요 · 레이어의 🫧 그린 곳만 칠을 켜면 그림 안에만</p>`;
            if (['brush', 'pencil', 'marker'].includes(P.tool)) h += `<div class="pp-chips pick"><button type="button" data-qs="1" class="${P.qshape !== false ? 'on' : ''}">✨ 선 정리 (그리다 멈추면 반듯하게)</button></div>`;
            if (P.tool === 'shape') h += `<h4>도형</h4><div class="pp-chips pick">${[['rect', '네모'], ['ellipse', '동그라미'], ['line', '선']].map(([k, n]) => `<button type="button" data-sk="${k}" class="${k === P.shapeK ? 'on' : ''}">${n}</button>`).join('')}<button type="button" data-sf="1" class="${P.shapeFill ? 'on' : ''}">🎨 채우기</button></div>`;
            h += sl('size', '크기', P.size, 1, 120, 1, 'px') + sl('op', '투명도', P.op, .05, 1, .05, '%');
            if (!['fill', 'drop', 'lasso', 'move', 'zoom', 'text', 'grad', 'smudge'].includes(P.tool)) h += sl('soft', '부드럽게', P.soft, 0, 1, .05, '%') + sl('stab', '떨림 보정', P.stab, 0, .95, .05, '%');
            if (P.tool === 'smudge') h += sl('smk', '문지르는 힘', P.smk == null ? .6 : P.smk, .1, 1, .05, '%');
        }
        $('ppOpt').innerHTML = h;
        $('ppOpt').querySelectorAll('canvas[data-pv]').forEach(c => brushPreview(c, c.dataset.pv));
    }
    function onOpt(e) {
        const r = e.target.closest('input[type=range]');
        if (r && e.type === 'input') {
            const k = r.dataset.k, v = +r.value; P[k] = v; r.nextElementSibling.textContent = k === 'op' || k === 'soft' || k === 'stab' || k === 'smk' ? Math.round(v * 100) + '%' : v + (k === 'size' || k === 'vsw' ? 'px' : k === 'radN' ? '개' : '');
            if (P.mode === 'vec' && P.sel) { histVec(P.cur); if (k === 'vsw') P.sel.sw = v; if (k === 'op') P.sel.op = v; if (k === 'vround' && P.sel.k === 'rect') P.sel.r = v; P.cur.dirtyV = true; renderAll(); }
            return;
        }
        if (e.type !== 'click') return;
        const b = e.target.closest('[data-b]'); if (b) { P.brush = b.dataset.b; paintTools(); }
        const sk = e.target.closest('[data-sk]'); if (sk) { P.shapeK = sk.dataset.sk; paintTools(); }
        const sf = e.target.closest('[data-sf]'); if (sf) { P.shapeFill = !P.shapeFill; paintTools(); }
        const stk = e.target.closest('[data-stk]'); if (stk) { P.stampK = stk.dataset.stk; paintTools(); }
        if (e.target.closest('[data-stj]')) { P.stampJ = P.stampJ === false; paintTools(); }
        const gs = e.target.closest('[data-gs]'); if (gs) { P.gradS = gs.dataset.gs; paintTools(); }
        const gk = e.target.closest('[data-gk]'); if (gk) { P.gradK = gk.dataset.gk; paintTools(); }
        if (e.target.closest('[data-qs]')) { P.qshape = P.qshape === false; paintTools(); }
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
        const mw = mmW(), kr = mw ? MM_PX * mw / P.W : 0;                 // 📏 100% = 실제 크기 (도련 11-14 · 실제 mm 를 모르는 종이만 맞춤 기준)
        $('ppZ').textContent = Math.round((kr ? k / kr : P.z) * 100) + '%'; $('ppZ').title = kr ? '100% = 실제 크기' : '100% = 맞춤'; paintFloats();
    }
    function zoomAt(f, cx, cy) {
        const st = $('ppStage').getBoundingClientRect(), z = Math.max(.25, Math.min(8, P.z * f)), k0 = P.base * P.z, k1 = P.base * z;
        const sx = (cx ?? st.left + st.width / 2) - st.left, sy = (cy ?? st.top + st.height / 2) - st.top;
        P.px = sx - (sx - P.px) * k1 / k0; P.py = sy - (sy - P.py) * k1 / k0; P.z = z; view();
    }
    function onView(v) {
        if (v === 'in') zoomAt(1.25); if (v === 'out') zoomAt(1 / 1.25); if (v === 'fit') fit(); if (v === 'real') realSize();
        if (v === 'hand') { P.hand = !P.hand; }
        if (v === 'wrap') { P.wrap = !P.wrap; say(P.wrap ? '🔁 이어그리기 : 오른쪽 끝을 넘으면 왼쪽에서 이어져요' : '이어그리기 끔'); }
        if (v === 'grid') P.grid = !P.grid; if (v === 'sym') { const S = [[false, 0], [true, 0], [false, 4], [false, 6], [false, 8]], i = S.findIndex(q => q[0] === !!P.sym && q[1] === (P.symN || 0)), n = S[(i + 1) % S.length]; P.sym = n[0]; P.symN = n[1];
            say(P.sym ? '⇋ 대칭 : 왼쪽 · 오른쪽에 같이 그려져요' : P.symN ? `🌸 만화경 ${P.symN}조각 : 돌리고 뒤집어 같이 그려져요` : '대칭 끔'); const b = document.querySelector('.pp-view [data-v="sym"]'); if (b) b.textContent = P.symN ? `🌸 만화경 ${P.symN}` : '⇋ 대칭'; }
        document.querySelectorAll('.pp-view [data-v]').forEach(b => b.classList.toggle('on', (b.dataset.v === 'hand' && P.hand) || (b.dataset.v === 'grid' && P.grid) || (b.dataset.v === 'sym' && (P.sym || P.symN)) || (b.dataset.v === 'wrap' && P.wrap)));
        drawOv();
    }
    const toDoc = e => { const r = $('ppCv').getBoundingClientRect(); return { x: (e.clientX - r.left) * P.W / r.width, y: (e.clientY - r.top) * P.H / r.height }; };
    const scale = () => { const r = $('ppCv').getBoundingClientRect(); return r.width / P.W; };   // 화면 px / 종이 px
    const toScr = p => { const r = $('ppCv').getBoundingClientRect(), s = $('ppStage').getBoundingClientRect(), k = r.width / P.W; return { x: r.left - s.left + p.x * k, y: r.top - s.top + p.y * k }; };

    /* ================= 그리기 (합치기) ================= */
    let raf = 0;
    function renderAll() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(); drawOv(); thumbsSoon(); if (P.cut && P.cut.on && !P.drag) cutSoon(); }); }
    let clipC = null;
    function clipTo(img, base) {                                               // 📎 클리핑 = 아래 레이어 그림 모양 안에만
        if (!clipC || clipC.width !== P.W || clipC.height !== P.H) clipC = mkCv(P.W, P.H); const x = clipC.getContext('2d');
        x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, P.W, P.H); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'destination-in'; x.drawImage(base, 0, 0); x.globalCompositeOperation = 'source-over'; return clipC;
    }
    function compose(x, withStroke) {
        x.save(); x.clearRect(0, 0, P.W, P.H); let base = null;
        for (const L of P.layers) {
            if (!L.vis) continue;
            if (L.type === 'paper') { x.globalAlpha = L.op; x.globalCompositeOperation = L.blend; x.drawImage(layerImg(L), 0, 0); if (P.cut && P.cut.on && P.cutImg) { x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.drawImage(P.cutImg, 0, 0); } continue; }
            if (withStroke && L === P.liveL) continue;                     // 🎬 움직이는 블록 레이어 = 위 진짜 css 가 보여요
            let img = layerImg(L);
            if (withStroke && L === P.cur && P.drag && P.drag.stroke) img = strokePreview(L);
            if (withStroke && L === P.cur && P.fl) { const t = tmp(); const tx = t.getContext('2d'); tx.clearRect(0, 0, P.W, P.H); tx.drawImage(img, 0, 0); tx.drawImage(P.fl.cv, P.fl.dx, P.fl.dy); img = t; }
            if (withStroke && L === P.cur && P.drag && P.drag.moveL) { x.globalAlpha = L.op; x.globalCompositeOperation = L.blend; x.drawImage(img, P.drag.dx, P.drag.dy); continue; }
            if (L.clip && base) img = clipTo(img, base); else if (!L.clip) { if (!L._bc || L._bc.width !== P.W || L._bc.height !== P.H) L._bc = mkCv(P.W, P.H); const bx = L._bc.getContext('2d'); bx.clearRect(0, 0, P.W, P.H); bx.drawImage(img, 0, 0); base = L._bc; }
            x.globalAlpha = L.op; x.globalCompositeOperation = L.blend; x.drawImage(img, 0, 0);
        }
        x.restore();
    }
    function cbLive() {                                                        // 🎬 움직이는 블록 = 그림판에선 진짜 css 로 움직여요 (고른 블록 레이어 · 구운 그림은 첫 장면)
        const L = P.cur, sv = P.on && P.mode === 'svg' && L && L.type === 'svg' && L.vis && window.SB && SB.hasAnim(L), on = sv || (P.on && P.mode === 'css' && L && L.type === 'css' && L.vis && window.CB && CB.hasAnimAll(L)); let el = $('ppLive');
        if (!on) { if (el) el.remove(); P.liveL = null; return; }
        const doc = $('ppDoc'); if (!doc) return; if (!el) { el = document.createElement('div'); el.id = 'ppLive'; el.className = 'pp-live'; doc.insertBefore(el, $('ppOv')); }
        if (sv) {                                                              // 🎬 SVG 움직임도 그림판에서 진짜로 (11-19 · 구운 그림은 첫 장면)
            P.liveL = L; const key = 'sv|' + P.W + 'x' + P.H + JSON.stringify(L.els);
            if (el._k !== key) { el._k = key; el.innerHTML = `<img alt="" style="position:absolute;left:0;top:0;width:${P.W}px;height:${P.H}px" src="${SVG_PFX + encodeURIComponent(SB.build(L, P.W, P.H, ''))}">`; }
            Object.assign(el.style, { left: '0px', top: '0px', opacity: L.op, mixBlendMode: L.blend === 'source-over' ? 'normal' : L.blend }); return;
        }
        if (el._k && el._k.startsWith('sv|')) { el._k = ''; el.innerHTML = ''; }
        P.liveL = L; const bx = L.box, w = Math.max(2, Math.round(bx.w * P.W)), h = Math.max(2, Math.round(bx.h * P.H)), key = w + 'x' + h + '|' + (L.text || '') + JSON.stringify([L.blocks, L.pb, L.pa, L.pfl, L.pfn, L.kids, L.cls]);
        if (el._k !== key) { el._k = key; el.innerHTML = `<style>${CB.styleText(L, '#ppLive .lv', w, h, 'position:absolute;left:0;top:0;')}</style><div class="lv">${CB.htmlOf(L)}</div>`; }
        Object.assign(el.style, { left: bx.x * P.W + 'px', top: bx.y * P.H + 'px', opacity: L.op, mixBlendMode: L.blend === 'source-over' ? 'normal' : L.blend });
    }
    function render() {
        const c = $('ppCv'); if (!c) return; cbLive(); compose(c.getContext('2d'), true);
        if (P.kind === 'tape') { ['ppGhL', 'ppGhR'].forEach(id => { const g = $(id); if (g) { const x = g.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.drawImage(c, 0, 0); } }); tapePvSoon(); }   // 🎀 양옆 = 이어지는 칸 (흐리게)
    }
    let tpvT = 0;
    function tapePvSoon() { clearTimeout(tpvT); tpvT = setTimeout(tapePv, 160); }
    function tapePv() {                                                        // 🎀 오른쪽 미리보기 = 진짜 테이프 모양 (지그재그 끝 · 반투명)
        const el = $('ppTapePv'), cv = $('ppCv'); if (!el || !cv || typeof tapeUrl !== 'function') return;
        const c = mkCv(Math.max(1, Math.round(64 * P.W / P.H)), 64); c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height);
        const h = 34, w = h * P.W / P.H;
        el.style.backgroundImage = `url("${tapeUrl({ id: 'pv', name: '', bg: 'none', w, h, p: `<image href="${c.toDataURL('image/png')}" width="${w}" height="${h}" preserveAspectRatio="none"/>` })}")`;
    }
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
        if (P.symN) { x.save(); x.strokeStyle = 'rgba(255,111,145,.55)'; x.setLineDash([8 * k, 6 * k]); x.lineWidth = 1.5 * k; const R = Math.hypot(P.W, P.H); for (let i = 0; i < P.symN * 2; i++) { const a = i * Math.PI / P.symN; x.beginPath(); x.moveTo(P.W / 2, P.H / 2); x.lineTo(P.W / 2 + Math.cos(a) * R, P.H / 2 + Math.sin(a) * R); x.stroke(); } x.restore(); }
        if (P.drag && P.drag.gradPv) { x.save(); x.strokeStyle = '#4aa8ff'; x.lineWidth = 2 * k; x.setLineDash([6 * k, 4 * k]); x.beginPath(); x.moveTo(P.drag.a.x, P.drag.a.y); x.lineTo(P.drag.b.x, P.drag.b.y); x.stroke(); x.setLineDash([]); x.fillStyle = P.color; x.beginPath(); x.arc(P.drag.a.x, P.drag.a.y, 7 * k, 0, 7); x.fill(); x.stroke(); x.restore(); }
        if (P.sym) { x.strokeStyle = 'rgba(74,168,255,.6)'; x.setLineDash([8 * k, 6 * k]); x.lineWidth = 1.5 * k; x.beginPath(); x.moveTo(P.W / 2, 0); x.lineTo(P.W / 2, P.H); x.stroke(); x.setLineDash([]); }
        if (P.lasso && P.lasso.length > 1) { x.setLineDash([6 * k, 5 * k]); x.strokeStyle = '#4aa8ff'; x.lineWidth = 1.6 * k; x.beginPath(); P.lasso.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.stroke(); x.setLineDash([]); }
        if (P.fl) { x.setLineDash([6 * k, 5 * k]); x.strokeStyle = '#4aa8ff'; x.lineWidth = 1.6 * k; const b = P.fl.box; x.strokeRect(b.x + P.fl.dx, b.y + P.fl.dy, b.w, b.h); x.setLineDash([]); }
        if (P.drag && P.drag.shapePv) shapePx(x, P.drag.a, P.drag.b, true);
        if (P.mode === 'vec') vecOv(x, k);
        if (P.mode === 'css' && P.cur && P.cur.type === 'css' && window.CB) cbOv(x, k);
    }
    function cbOv(x, k) {                                                      // 🧩 본체 = 얇은 점선 · 고른 장식 = 분홍 점선 (종이 위에서 어디를 꾸미는지)
        const L = P.cur, bx = L.box, a = bx.x * P.W, b = bx.y * P.H, w = bx.w * P.W, h = bx.h * P.H, part = P.cbPart || 'blocks';
        x.save(); x.setLineDash([6 * k, 5 * k]); x.lineWidth = 1.4 * k; x.strokeStyle = part === 'blocks' ? '#e0457b' : 'rgba(107,68,56,.35)'; x.strokeRect(a, b, w, h);
        if (part !== 'blocks') {
            const D = Object.fromEntries(CB.decls(L[part] || [])), len = (v, base, d) => { if (v == null) return d; const n = parseFloat(v); return /%$/.test(v) ? base * n / 100 : n; };
            const pw = len(D.width, w, w), ph = len(D.height, h, h), pl = len(D.left, w, 0), pt = len(D.top, h, 0);
            x.strokeStyle = '#e0457b'; x.lineWidth = 2 * k; x.strokeRect(a + pl, b + pt, pw, ph);
            x.setLineDash([]); x.fillStyle = '#e0457b'; x.font = `${Math.round(13 * k)}px sans-serif`; x.fillText(part === 'pb' ? '✨ 장식 1' : '✨ 장식 2', a + pl + 4 * k, b + pt - 5 * k);
        }
        x.restore();
    }

    /* ================= 🖌️ 픽셀 붓 ================= */
    function brushOf() {                                                       // 지금 도구 → 붓 설정
        const t = P.tool, b = t === 'brush' ? P.brush : t === 'pencil' ? 'pencil' : t === 'marker' ? 'hi' : t === 'air' ? 'air' : t === 'erase' ? 'erase' : t === 'stamp' ? 'stamp' : 'round';
        const R = { pencil: { hard: 1, sp: .15, min: .6 }, round: { sp: .12 }, water: { a: .1, sp: .08, soft: 1 }, crayon: { tex: 1, sp: .2 }, hi: { flat: 1, comp: 'multiply', a: .55, sp: .1, hard: 1 }, glit: { sp: .12, glit: 1 }, air: { air: 1 }, erase: { sp: .1 }, stamp: { stamp: 1, sp: 1.5 }, pixel: { pix: 1, sp: .3 } }[b] || {};
        return Object.assign({ k: b }, R);
    }
    function stampPath(k) {                                                    // ⭐ 스탬프 모양 (반지름 1)
        const q = new Path2D();
        if (k === 'heart') { q.moveTo(0, .9); q.bezierCurveTo(-1.3, -.05, -.9, -1.15, 0, -.45); q.bezierCurveTo(.9, -1.15, 1.3, -.05, 0, .9); }
        else if (k === 'star') for (let i = 0; i < 10; i++) { const rr = i % 2 ? .45 : 1, a = -Math.PI / 2 + i * Math.PI / 5; q.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        else if (k === 'spark') for (let i = 0; i < 8; i++) { const rr = i % 2 ? .22 : 1, a = -Math.PI / 2 + i * Math.PI / 4; q.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        else if (k === 'flower') { for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5; q.moveTo(Math.cos(a) * .55 + .42, Math.sin(a) * .55); q.arc(Math.cos(a) * .55, Math.sin(a) * .55, .42, 0, 7); } }
        else if (k === 'drop') { q.moveTo(0, -1); q.bezierCurveTo(.4, -.4, .75, 0, .75, .3); q.arc(0, .3, .75, 0, Math.PI); q.bezierCurveTo(-.75, 0, -.4, -.4, 0, -1); }
        else q.arc(0, 0, 1, 0, 7);
        q.closePath(); return q;
    }
    function dab(x, px, py, r, B, col) {
        if (B.pix) { const s = Math.max(2, Math.round(P.size / 2) * 2); x.globalAlpha = 1; x.fillStyle = col; x.fillRect(Math.floor(px / s) * s, Math.floor(py / s) * s, s, s); return; }   // 👾 픽셀 아트 = 칸에 딱 · 번짐 없이
        if (B.stamp) { const j = P.stampJ !== false, k = j ? .6 + Math.random() * .7 : 1; x.save(); x.translate(px + (j ? (Math.random() - .5) * r : 0), py + (j ? (Math.random() - .5) * r : 0)); x.rotate(j ? (Math.random() - .5) * 1.4 : 0); x.scale(r * k, r * k); x.fillStyle = col; x.fill(stampPath(P.stampK || 'heart')); x.restore(); return; }
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
        if (P.tool === 'smudge') { histPx(L); P.drag = { smudge: 1, last: p }; return true; }   // 👆 문지르기 = 레이어 위 색을 끌고 가요
        const B = brushOf(), cv = tmp(); const x = cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H);
        histPx(L);
        P.drag = { stroke: 1, B, cv, last: p, sm: { x: p.x, y: p.y }, erase: B.k === 'erase', alpha: P.op * (B.comp ? (B.a || 1) : 1), comp: L.aLock ? 'source-atop' : (B.comp || 'source-over'), pen: e.pointerType === 'pen', pts: P.qshape !== false && ['brush', 'pencil', 'marker'].includes(P.tool) && !B.pix ? [{ x: p.x, y: p.y }] : null };
        stroke(p, e.pressure);
        if (B.air) P.drag.airT = setInterval(() => { if (P.drag && P.drag.stroke) { airDab(P.drag.sm); renderAll(); } }, 40);
        return true;
    }
    function symPts(px, py) {                                                 // ⇋ 좌우 · 🌸 만화경 (돌리고 뒤집기) = 같이 그릴 자리
        const o = []; if (P.sym) o.push([P.W - px, py]);
        if (P.symN) { const cx = P.W / 2, cy = P.H / 2, n = P.symN; for (let i = 0; i < n; i++) { const a = i * 2 * Math.PI / n, co = Math.cos(a), si = Math.sin(a); [[px, py], [2 * cx - px, py]].forEach(([u, v], m) => { if (!i && !m) return; const dx = u - cx, dy = v - cy; o.push([cx + dx * co - dy * si, cy + dx * si + dy * co]); }); } }
        return o;
    }
    function airDab(p) { const d = P.drag, x = d.cv.getContext('2d'), r = P.size * 1.5; wdab(x, p.x, p.y, r, d.B, P.color); symPts(p.x, p.y).forEach(([u, v]) => wdab(x, u, v, r, d.B, P.color)); }
    function wdab(x, px, py, r, B, col) {                                      // 🔁 이어그리기 (🎀 테이프) = 끝을 넘은 붓 자국은 반대쪽에도 · 칸이 이어져 보여요
        dab(x, px, py, r, B, col);
        if (!P.wrap) return; const m = r * 1.4 + 2;
        if (px < m) dab(x, px + P.W, py, r, B, col); if (px > P.W - m) dab(x, px - P.W, py, r, B, col);
    }
    let smC = null;
    function smudgeTo(p) {                                                     // 👆 문지르기 : 붓에 묻은 색을 끌고 가며 조금씩 섞어요
        const d = P.drag, L = P.cur, lx = L.cv.getContext('2d'), r = Math.max(3, P.size / 2), D = Math.ceil(r * 2), a = d.last, dd = Math.hypot(p.x - a.x, p.y - a.y), n = Math.max(1, Math.ceil(dd / Math.max(1, r * .25))), k = P.smk == null ? .6 : P.smk;
        if (!smC || smC.width !== D) smC = mkCv(D, D); const sx = smC.getContext('2d');
        const mask = () => { const g = sx.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.6, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)'); sx.globalCompositeOperation = 'destination-in'; sx.fillStyle = g; sx.fillRect(0, 0, D, D); sx.globalCompositeOperation = 'source-over'; };
        if (!d.carry || d.carry.width !== D) { d.carry = mkCv(D, D); d.carry.getContext('2d').drawImage(L.cv, a.x - r, a.y - r, D, D, 0, 0, D, D); }
        const cx = d.carry.getContext('2d');
        for (let i = 1; i <= n; i++) { const c = { x: a.x + (p.x - a.x) * i / n, y: a.y + (p.y - a.y) * i / n };
            sx.clearRect(0, 0, D, D); sx.drawImage(d.carry, 0, 0); mask(); lx.save(); lx.globalAlpha = k; lx.drawImage(smC, c.x - r, c.y - r); lx.restore();   // 묻은 색 찍기
            cx.save(); cx.globalAlpha = 1 - k * .85; cx.drawImage(L.cv, c.x - r, c.y - r, D, D, 0, 0, D, D); cx.restore(); }   // 지금 자리 색이 붓에 묻어요
        d.last = p; renderAll();
    }
    function qsArm() {                                                         // ✨ 선 정리 : 그리다가 멈추면 (0.6초) 반듯한 선 · 동그라미로
        const d = P.drag; clearTimeout(d.qsT); if (d.qsDone) return;
        d.qsT = setTimeout(() => { if (P.drag !== d || !d.pts || d.pts.length < 6) return; const A = d.pts, f = A[0], l = A[A.length - 1];
            let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; A.forEach(q => { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
            const diag = Math.hypot(x1 - x0, y1 - y0) || 1, closed = Math.hypot(l.x - f.x, l.y - f.y) < diag * .2, P2 = [];
            if (closed) { let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2; if (Math.abs(rx - ry) < Math.max(rx, ry) * .18) rx = ry = (rx + ry) / 2; for (let i = 0; i <= 120; i++) { const t = i / 120 * Math.PI * 2; P2.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry }); } }
            else for (let i = 0; i <= 60; i++) P2.push({ x: f.x + (l.x - f.x) * i / 60, y: f.y + (l.y - f.y) * i / 60 });
            const x = d.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); const r = d.r || P.size / 2;
            for (let i = 1; i < P2.length; i++) { const a = P2[i - 1], b = P2[i], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / Math.max(.5, r * (d.B.sp || .12)))); for (let j = 1; j <= n; j++) { const xx = a.x + (b.x - a.x) * j / n, yy = a.y + (b.y - a.y) * j / n; wdab(x, xx, yy, r, d.B, d.erase ? '#000' : P.color); symPts(xx, yy).forEach(([u, v]) => wdab(x, u, v, r, d.B, d.erase ? '#000' : P.color)); } }
            d.qsDone = true; say(closed ? '✨ 동그라미로 정리했어요' : '✨ 곧은 선으로 정리했어요', 1000); renderAll(); }, 600);
    }
    function gradApply(a, b) {                                                 // 🌈 그라데이션 채우기
        const L = P.cur; if (!canPaint(L)) return; histPx(L); const x = L.cv.getContext('2d'), [R, G, B] = hexRgb(P.color), c2 = (P.gradK || 'clear') === 'clear' ? `rgba(${R},${G},${B},0)` : (P.recent[0] || '#ffffff');
        const g = (P.gradS || 'linear') === 'radial' ? x.createRadialGradient(a.x, a.y, 0, a.x, a.y, Math.max(2, Math.hypot(b.x - a.x, b.y - a.y))) : x.createLinearGradient(a.x, a.y, b.x, b.y); g.addColorStop(0, P.color); g.addColorStop(1, c2);
        x.save(); x.globalAlpha = P.op; if (L.aLock) x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, P.W, P.H); x.restore(); P.dirty = true; renderAll();
    }
    function stroke(p, pressure) {
        const d = P.drag, x = d.cv.getContext('2d'), B = d.B;
        if (d.qsDone) return;
        const s = d.sm, k = 1 - P.stab * .92; s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k;   // 〰 떨림 보정
        const pr = d.pen ? Math.max(.1, pressure || .5) : 1, r = Math.max(.5, (B.k === 'pencil' ? Math.max(1, P.size * .35) : P.size / 2) * (d.pen ? .35 + .65 * pr : 1));
        if (B.air) { airDab(s); d.last = { x: s.x, y: s.y }; return; }
        const a = d.last, dd = Math.hypot(s.x - a.x, s.y - a.y), sp = Math.max(.5, r * (B.sp || .12)), n = Math.max(1, Math.ceil(dd / sp));
        for (let i = 1; i <= n; i++) { const xx = a.x + (s.x - a.x) * i / n, yy = a.y + (s.y - a.y) * i / n; wdab(x, xx, yy, r, B, d.erase ? '#000' : P.color); symPts(xx, yy).forEach(([u, v]) => wdab(x, u, v, r, B, d.erase ? '#000' : P.color)); }
        d.last = { x: s.x, y: s.y }; d.r = r; if (d.pts) { d.pts.push({ x: s.x, y: s.y }); qsArm(); }
    }
    function strokeEnd() {
        const d = P.drag, L = P.cur; if (d.airT) clearInterval(d.airT); clearTimeout(d.qsT);
        const x = L.cv.getContext('2d'); x.save();
        if (d.erase) { x.globalCompositeOperation = 'destination-out'; x.drawImage(d.cv, 0, 0); }
        else { x.globalAlpha = d.alpha; x.globalCompositeOperation = d.comp; x.drawImage(d.cv, 0, 0); }
        x.restore(); P.drag = null; P.dirty = true; renderAll();
    }
    function canPaint(L) {
        if (!L) return false;
        if (!L.vis) { say('👁 숨긴 레이어예요 · 눈을 켜 주세요'); return false; }
        if (L.lock) { say('🔒 잠긴 레이어예요'); return false; }
        if (L.type !== 'px') { say(L.type === 'vec' ? '✒️ 벡터 레이어예요 · 픽셀 레이어를 골라요' : L.type === 'css' ? '🧩 CSS 레이어예요 · 픽셀 레이어를 골라요' : L.type === 'photo' ? '📎 사진 레이어예요 · 픽셀 레이어를 골라요' : '🧵 종이예요 · 픽셀 레이어를 골라요'); return false; }
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
        P.fl = { cv: fc, src: fc, dx: 0, dy: 0, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, box0: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, T: { s: 1, r: 0, fx: 1, fy: 1, k: 0 }, L }; say('➰ 떼어 냈어요 · 끌어서 옮기기 · 위 막대로 크기 · 돌리기 · 뒤집기 · 기울이기 · 다른 도구를 고르면 붙어요', 2800); renderAll(); paintFloats();
    }
    function commitFloat() { const f = P.fl; if (!f) return; P.fl = null; const x = f.L.cv.getContext('2d'); x.drawImage(f.cv, f.dx, f.dy); P.dirty = true; renderAll(); paintFloats(); }
    function flAct(a) {                                                        // ➰ 고른 부분 바꾸기 (원래 그림에서 다시 그려서 흐려지지 않게)
        const f = P.fl; if (!f) return; const T = f.T;
        if (a === 'big') T.s = Math.min(4, T.s * 1.1); if (a === 'small') T.s = Math.max(.1, T.s / 1.1); if (a === 'rl') T.r -= 15; if (a === 'rr') T.r += 15;
        if (a === 'fx') T.fx *= -1; if (a === 'fy') T.fy *= -1; if (a === 'kl') T.k -= 10; if (a === 'kr') T.k += 10; if (a === 'ok') { commitFloat(); return; }
        const b = f.box0, cx = b.x + b.w / 2, cy = b.y + b.h / 2, M = new DOMMatrix().translate(cx, cy).rotate(T.r).skewX(T.k).scale(T.s * T.fx, T.s * T.fy).translate(-cx, -cy);
        const c = mkCv(P.W, P.H), x = c.getContext('2d'); x.setTransform(M); x.drawImage(f.src, 0, 0); f.cv = c;
        const pts = [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].map(([u, v]) => M.transformPoint(new DOMPoint(u, v)));
        const xs = pts.map(q => q.x), ys = pts.map(q => q.y); f.box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
        renderAll(); paintFloats();
    }
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
        else if (s.k === 'poly') { const n = Math.max(3, s.n || 6); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n; q.lineTo(Math.cos(a) * w / 2, Math.sin(a) * h / 2); } q.closePath(); }
        else if (s.k === 'star') { for (let i = 0; i < 10; i++) { const rr = i % 2 ? .45 : 1, a = -Math.PI / 2 + i * Math.PI / 5; q.lineTo(Math.cos(a) * w / 2 * rr, Math.sin(a) * h / 2 * rr); } q.closePath(); }
        else if (s.k === 'text') { return null; }
        p.addPath(q, m); return p;
    }
    function fillOf(x, s) {                                                     // 🌈 그라데이션 칠 (모양 크기에 맞춰 · 방향 ga)
        if (!s.grad || !s.fill) return s.fill; const b = bbox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = (s.grad.ang == null ? 90 : s.grad.ang) * Math.PI / 180, L = (Math.abs(b.w * Math.cos(a)) + Math.abs(b.h * Math.sin(a))) / 2;
        const g = x.createLinearGradient(cx - Math.cos(a) * L, cy - Math.sin(a) * L, cx + Math.cos(a) * L, cy + Math.sin(a) * L); g.addColorStop(0, s.fill); g.addColorStop(1, s.grad.c2 || '#ffffff'); return g;
    }
    function maskShape(x, s) {                                                 // 모양 실루엣 (검정) · 합치기 · 빼기 · 겹친 곳 계산용
        x.fillStyle = '#000'; x.strokeStyle = '#000';
        if (s.k === 'group') { x.drawImage(groupMask(s), 0, 0); return; }
        if (s.k === 'text') { x.save(); x.translate(s.x, s.y); x.rotate((s.rot || 0) * Math.PI / 180); x.font = `${s.fs}px Jua, 'Gowun Dodum', sans-serif`; x.textBaseline = 'top'; x.fillText(s.text, 0, 0); x.restore(); return; }
        const p = shapePath(s); if (s.closed || s.k !== 'path') x.fill(p); else { x.lineWidth = s.sw || 4; x.lineCap = 'round'; x.stroke(p); }
    }
    function groupMask(g) {
        const c = mkCv(P.W, P.H), x = c.getContext('2d');
        g.items.forEach((it, i) => { x.globalCompositeOperation = !i || g.bop === 'union' || g.bop === 'none' ? 'source-over' : g.bop === 'sub' ? 'destination-out' : 'destination-in'; if (g.bop === 'int' && i) { const t = mkCv(P.W, P.H); maskShape(t.getContext('2d'), it); x.drawImage(t, 0, 0); } else maskShape(x, it); });
        return c;
    }
    function drawShape(x, s) {
        if (s.k === 'group') {                                                 // 📦 그룹 · ⊕ 합치기 · ⊖ 빼기 · ⊗ 겹친 곳
            if (s.bop === 'none') { x.save(); x.globalAlpha = s.op == null ? 1 : s.op; s.items.forEach(it => drawShape(x, it)); x.restore(); return; }
            const m = groupMask(s), mx = m.getContext('2d'); mx.globalCompositeOperation = 'source-in'; mx.fillStyle = fillOf(mx, s) || P.color; mx.fillRect(0, 0, P.W, P.H);
            x.save(); x.globalAlpha = s.op == null ? 1 : s.op; x.drawImage(m, 0, 0); x.restore(); return;
        }
        x.save(); x.globalAlpha = s.op == null ? 1 : s.op;
        if (s.k === 'text') { x.translate(s.x, s.y); x.rotate((s.rot || 0) * Math.PI / 180); x.font = `${s.fs}px Jua, 'Gowun Dodum', sans-serif`; x.textBaseline = 'top'; if (s.fill) { x.fillStyle = s.fill; x.fillText(s.text, 0, 0); } if (s.stroke && s.sw) { x.lineWidth = s.sw / 2; x.strokeStyle = s.stroke; x.strokeText(s.text, 0, 0); } x.restore(); return; }
        const p = shapePath(s); x.lineCap = s.cap; x.lineJoin = s.cap === 'round' ? 'round' : 'miter';
        if (s.fill) { x.fillStyle = fillOf(x, s); x.fill(p); }
        if (s.stroke && s.sw > 0) { x.lineWidth = s.sw; x.strokeStyle = s.stroke; if (s.dash) x.setLineDash([s.sw * 2, s.sw * 1.6]); x.stroke(p); }
        if (s.arrow && s.k === 'path' && s.pts.length > 1 && s.stroke) {      // ➝ 화살표 머리
            const a = s.pts[s.pts.length - 1], b = a.hi || s.pts[s.pts.length - 2], an = Math.atan2(a.y - b.y, a.x - b.x), L = Math.max(12, (s.sw || 4) * 3.2);
            x.setLineDash([]); x.fillStyle = s.stroke; x.beginPath(); x.moveTo(a.x + Math.cos(an) * L * .3, a.y + Math.sin(an) * L * .3); x.lineTo(a.x - Math.cos(an - .45) * L, a.y - Math.sin(an - .45) * L); x.lineTo(a.x - Math.cos(an + .45) * L, a.y - Math.sin(an + .45) * L); x.closePath(); x.fill(); }
        x.restore();
    }
    const hitCtx = mkCv(4, 4).getContext('2d');
    function textBox(s) { hitCtx.font = `${s.fs}px Jua, sans-serif`; return { x: s.x, y: s.y, w: hitCtx.measureText(s.text).width, h: s.fs * 1.1 }; }
    function hitShape(s, p) {
        const k = 1 / Math.max(.05, scale());
        if (s.k === 'group') { const H = s.items.map(it => hitShape(it, p)); return s.bop === 'sub' ? H[0] && !H.slice(1).some(Boolean) : s.bop === 'int' ? H.every(Boolean) : H.some(Boolean); }
        if (s.k === 'text') { const b = textBox(s); return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h; }
        const path = shapePath(s); hitCtx.lineWidth = Math.max(s.sw || 0, 12 * k);
        return (s.fill || s.closed || s.k !== 'path') && hitCtx.isPointInPath(path, p.x, p.y) || hitCtx.isPointInStroke(path, p.x, p.y);
    }
    function topShape(p) { const L = P.cur; if (!L || L.type !== 'vec') return null; for (let i = L.shapes.length - 1; i >= 0; i--) if (hitShape(L.shapes[i], p)) return L.shapes[i]; return null; }
    function bbox(s) {
        if (s.k === 'text') return textBox(s);
        if (s.k === 'group') { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; s.items.forEach(it => { const b = bbox(it); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }); return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) }; }
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
        if (P.many.length > 1) { x.save(); x.strokeStyle = '#ff6f91'; x.lineWidth = 1.6 * k; x.setLineDash([5 * k, 4 * k]); let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9; P.many.forEach(q => { const b = bbox(q); x.strokeRect(b.x - 3 * k, b.y - 3 * k, b.w + 6 * k, b.h + 6 * k); X0 = Math.min(X0, b.x); Y0 = Math.min(Y0, b.y); X1 = Math.max(X1, b.x + b.w); Y1 = Math.max(Y1, b.y + b.h); }); x.strokeStyle = '#4aa8ff'; x.strokeRect(X0 - 8 * k, Y0 - 8 * k, X1 - X0 + 16 * k, Y1 - Y0 + 16 * k); x.restore(); return; }
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
    function moveShape(s, dx, dy) { if (s.k === 'group') { s.items.forEach(it => moveShape(it, dx, dy)); return; } if (s.k === 'path') s.pts.forEach(a => [a, a.hi, a.ho].forEach(q => { if (q) { q.x += dx; q.y += dy; } })); else { s.x += dx; s.y += dy; } }
    function scaleShape(s, b0, b1, orig) {                                     // orig = 그때 모양 (복사본)
        const fx = b1.w / b0.w, fy = b1.h / b0.h, T = q => ({ x: b1.x + (q.x - b0.x) * fx, y: b1.y + (q.y - b0.y) * fy });
        if (s.k === 'group') { s.items.forEach((it, i) => { const o = orig.items[i], ib = bbox(o); scaleShape(it, ib, { x: b1.x + (ib.x - b0.x) * fx, y: b1.y + (ib.y - b0.y) * fy, w: ib.w * fx, h: ib.h * fy }, o); }); return; }
        if (s.k === 'path') s.pts = orig.pts.map(a => ({ x: T(a).x, y: T(a).y, hi: a.hi ? T(a.hi) : null, ho: a.ho ? T(a.ho) : null, sm: a.sm }));
        else if (s.k === 'text') { s.x = b1.x; s.y = b1.y; s.fs = Math.max(6, orig.fs * fy); }
        else { s.x = b1.x; s.y = b1.y; s.w = b1.w; s.h = b1.h; }
    }
    function rotShape(s, orig, ang, c, around) {
        if (s.k === 'group') { s.items.forEach((it, i) => rotShape(it, orig.items[i], ang, c, true)); return; }
        if (around && s.k !== 'path') { const b = bbox(orig), ox = b.x + b.w / 2, oy = b.y + b.h / 2, co = Math.cos(ang), si = Math.sin(ang), nx = c.x + (ox - c.x) * co - (oy - c.y) * si, ny = c.y + (ox - c.x) * si + (oy - c.y) * co; s.x = orig.x + nx - ox; s.y = orig.y + ny - oy; s.rot = ((orig.rot || 0) + ang * 180 / Math.PI) % 360; return; }
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
        if (P.mode === 'px' && P.fl) { const b = P.fl.box, q = toScr({ x: b.x + P.fl.dx + b.w / 2, y: b.y + P.fl.dy }); fs.hidden = false; fp.hidden = true;
            fs.innerHTML = `<button data-fx="small">－ 작게</button><button data-fx="big">＋ 크게</button><button data-fx="rl">⟲</button><button data-fx="rr">⟳</button><button data-fx="fx">↔ 뒤집기</button><button data-fx="fy">↕ 뒤집기</button><button data-fx="kl">◁ 기울이기</button><button data-fx="kr">기울이기 ▷</button><button data-fx="ok">✔ 붙이기</button>`;
            Object.assign(fs.style, { left: q.x + 'px', top: Math.max(4, q.y - 64) + 'px' }); return; }
        const s = P.sel, V = P.mode === 'vec' && s && P.cur && P.cur.shapes && P.cur.shapes.includes(s) && !P.pen;
        fs.hidden = !(V && ['select', 'paint'].includes(P.tool));
        fp.hidden = !(V && P.tool === 'direct' && P.pt && P.pt.s === s);
        if (!fs.hidden) { const M = P.many.length > 1, b = M ? P.many.map(bbox).reduce((u, v) => ({ x: Math.min(u.x, v.x), y: Math.min(u.y, v.y), w: Math.max(u.x + u.w, v.x + v.w) - Math.min(u.x, v.x), h: 0 })) : bbox(s), q = toScr({ x: b.x + b.w / 2, y: b.y });
            fs.innerHTML = M ? `<button data-s="bunion">⊕ 합치기</button><button data-s="bsub">⊖ 빼기 (위에서 아래)</button><button data-s="bint">⊗ 겹친 곳만</button><button data-s="group">📦 그룹</button><br><button data-s="al">⇤</button><button data-s="ac">⇹</button><button data-s="ar">⇥</button><button data-s="at">⤒</button><button data-s="am">⇳</button><button data-s="ab">⤓</button><button data-s="dh">↔ 같은 간격</button><button data-s="dv">↕ 같은 간격</button><button data-s="mdone">✔ 고르기 끝</button>`
                : `<button data-s="fill">🎨 칠</button><button data-s="stroke">✏️ 선</button><button data-s="grad">🌈 그라데이션</button><button data-s="front">⤴ 앞으로</button><button data-s="dup">⧉ 복사</button><button data-s="del">🗑</button><br><button data-s="more" class="${P.addSel ? 'on' : ''}">➕ 더 고르기</button><button data-s="radial">🌀 빙글 복사 ${P.radN || 6}</button><button data-s="center">⊙ 종이 가운데</button>${s.k === 'group' ? '<button data-s="ungroup">📤 풀기</button>' : ''}`;
            Object.assign(fs.style, { left: q.x + 'px', top: Math.max(4, q.y - (M ? 92 : 92)) + 'px' }); }
        if (!fp.hidden) { const a = s.pts[P.pt.i], q = toScr(a); fp.innerHTML = `<button data-p="sm">⌒ 둥근 점</button><button data-p="cn">∠ 꺾인 점</button><button data-p="add">➕ 점 더하기</button><button data-p="rm">➖ 점 빼기</button>`; Object.assign(fp.style, { left: q.x + 'px', top: (q.y + 22) + 'px' }); }
    }
    function shapeAct(a) {
        const L = P.cur, s = P.sel; if (!s || !L) return;
        if (a === 'more') { P.addSel = !P.addSel; say(P.addSel ? '➕ 같이 고를 모양을 눌러요 (Shift + 누르기도 돼요)' : '더 고르기 끔'); paintFloats(); return; }
        if (a === 'mdone') { P.many = [s]; P.addSel = false; renderAll(); paintFloats(); return; }
        histVec(L);
        const M = P.many.length > 1 ? L.shapes.filter(q => P.many.includes(q)) : null;   // 쌓인 차례 (아래 → 위)
        if (M && ['bunion', 'bsub', 'bint', 'group'].includes(a)) {           // ⊕ ⊖ ⊗ 📦 = 한 모양으로 (풀면 그대로 돌아와요)
            const top = Math.max(...M.map(q => L.shapes.indexOf(q))), base = a === 'bsub' ? M[0] : M[M.length - 1], items = a === 'bsub' ? M : (a === 'bint' ? M : M);
            const g = Object.assign(V0(), { k: 'group', bop: a === 'bunion' ? 'union' : a === 'bsub' ? 'sub' : a === 'bint' ? 'int' : 'none', items: items.map(clone), fill: base.fill || P.color, grad: base.grad || null, stroke: null, op: 1 });
            L.shapes = L.shapes.filter((q, i) => !M.includes(q) || i === top).map(q => q === L.shapes[top] ? g : q); P.sel = g; P.many = [g];
            say(a === 'bsub' ? '⊖ 맨 아래 모양에서 위 모양들을 뺐어요' : a === 'bint' ? '⊗ 모두 겹친 곳만 남겼어요' : a === 'group' ? '📦 그룹으로 묶었어요' : '⊕ 하나로 합쳤어요');
        }
        if (M && /^(a[lcrtmb]|d[hv])$/.test(a)) {                              // 정렬 · 같은 간격
            const B = M.map(bbox), X0 = Math.min(...B.map(b => b.x)), Y0 = Math.min(...B.map(b => b.y)), X1 = Math.max(...B.map(b => b.x + b.w)), Y1 = Math.max(...B.map(b => b.y + b.h));
            M.forEach((q, i) => { const b = B[i]; if (a === 'al') moveShape(q, X0 - b.x, 0); if (a === 'ar') moveShape(q, X1 - b.x - b.w, 0); if (a === 'ac') moveShape(q, (X0 + X1) / 2 - b.x - b.w / 2, 0); if (a === 'at') moveShape(q, 0, Y0 - b.y); if (a === 'ab') moveShape(q, 0, Y1 - b.y - b.h); if (a === 'am') moveShape(q, 0, (Y0 + Y1) / 2 - b.y - b.h / 2); });
            if (a === 'dh' || a === 'dv') { const H = a === 'dh', o = M.map((q, i) => ({ q, b: B[i] })).sort((u, v) => H ? u.b.x - v.b.x : u.b.y - v.b.y), c0 = H ? o[0].b.x + o[0].b.w / 2 : o[0].b.y + o[0].b.h / 2, c1 = H ? o[o.length - 1].b.x + o[o.length - 1].b.w / 2 : o[o.length - 1].b.y + o[o.length - 1].b.h / 2;
                o.forEach((e, i) => { const t = c0 + (c1 - c0) * i / (o.length - 1), c = H ? e.b.x + e.b.w / 2 : e.b.y + e.b.h / 2; moveShape(e.q, H ? t - c : 0, H ? 0 : t - c); }); }
        }
        if (a === 'ungroup' && s.k === 'group') { const i = L.shapes.indexOf(s); L.shapes.splice(i, 1, ...s.items); P.many = s.items.slice(); P.sel = s.items[s.items.length - 1]; say('📤 풀었어요'); }
        if (a === 'center') { const b = bbox(s); moveShape(s, P.W / 2 - b.x - b.w / 2, P.H / 2 - b.y - b.h / 2); }
        if (a === 'radial') { const n = P.radN || 6, c = { x: P.W / 2, y: P.H / 2 }, items = []; for (let i = 0; i < n; i++) { const q = clone(s); if (i) rotShape(q, clone(s), i * 2 * Math.PI / n, c, true); items.push(q); }
            const g = Object.assign(V0(), { k: 'group', bop: 'none', items, fill: s.fill, stroke: null, op: 1 }); L.shapes.splice(L.shapes.indexOf(s), 1, g); P.sel = g; P.many = [g]; say(`🌀 종이 가운데를 돌며 ${n}개 · 📤 풀기로 하나씩`); }
        if (a === 'grad') { if (s.grad) s.grad = null; else { if (!s.fill) s.fill = P.color; s.grad = { c2: P.recent.find(c => c !== s.fill) || '#ffffff', ang: 90 }; say('🌈 오른쪽 칸에서 끝 색 · 방향을 바꿔요'); } }
        if (a === 'fill') s.fill = s.fill === P.color ? null : P.color;
        if (a === 'stroke') { if (s.stroke === P.color && s.k !== 'text') s.stroke = null; else s.stroke = P.color; if (!s.sw) s.sw = P.vsw || 4; }
        if (a === 'front') { const i = L.shapes.indexOf(s); if (i < L.shapes.length - 1) { L.shapes.splice(i, 1); L.shapes.splice(i + 1, 0, s); } }
        if (a === 'dup') { const c = clone(s); c.id = uid++; moveShape(c, 18, 18); L.shapes.push(c); P.sel = c; P.many = [c]; }
        if (a === 'del') { const D = P.many.length > 1 ? P.many : [s]; L.shapes = L.shapes.filter(x => !D.includes(x)); P.sel = null; P.many = []; }
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
            if (t === 'grad') { if (!canPaint(P.cur)) return; P.drag = { gradPv: 1, a: p, b: p }; return; }
            if (t === 'text') { if (!canPaint(P.cur)) return; textInput(p, txt => { histPx(P.cur); const x = P.cur.cv.getContext('2d'); x.save(); x.globalAlpha = P.op; x.fillStyle = P.color; x.font = `${Math.max(10, P.size * 4)}px Jua, 'Gowun Dodum', sans-serif`; x.textBaseline = 'top'; x.fillText(txt, p.x, p.y); x.restore(); P.dirty = true; renderAll(); }); return; }
            if (t === 'smudge') { strokeStart(e, p); return; }
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
        if (P.mode === 'svg') {                                                 // 🌀 svg = 고른 도형을 끌어 옮겨요 (mv = translate)
            const L = P.cur; if (!L || L.type !== 'svg') { say('🌀 SVG 레이어를 골라요'); return; } if (L.lock) { say('🔒 잠긴 레이어예요'); return; }
            const el = L.els.find(x => x.id === P.sbSel); if (!el) { say('⬛ 오른쪽에서 도형을 골라요'); return; }
            histSt(); P.drag = { sbMove: 1, p0: p, x0: el.mv.x, y0: el.mv.y, el }; return;
        }
        if (P.mode === 'css') {                                                 // 🧩 블록 = 상자를 끌어 옮겨요 (크기는 오른쪽 칸)
            const L = P.cur; if (!L || L.type !== 'css') { say('🧩 CSS 레이어를 골라요'); return; } if (L.lock) { say('🔒 잠긴 레이어예요'); return; }
            histSt(); P.drag = { cbMove: 1, p0: p, x0: L.box.x, y0: L.box.y }; return;
        }
        /* ✒️ 벡터 */
        if (t === 'pen') { penDown(p); return; }
        if (t === 'curve') { if (!needVec()) return; P.drag = { curve: [p] }; return; }
        if (['rect', 'ellipse', 'heart', 'star', 'poly'].includes(t)) { const L = needVec(); if (!L) return; P.drag = { newS: Object.assign(V0(), { k: t, x: p.x, y: p.y, w: 0, h: 0, r: t === 'rect' ? P.vround : 0, rot: 0, n: P.polyN || 6, fill: t === 'heart' || t === 'star' || t === 'poly' ? P.color : null }), a: p }; return; }
        if (t === 'line' || t === 'arrow') { const L = needVec(); if (!L) return; P.drag = { newS: Object.assign(V0(), { k: 'path', pts: [{ x: p.x, y: p.y, hi: null, ho: null, sm: false }, { x: p.x, y: p.y, hi: null, ho: null, sm: false }], closed: false, arrow: t === 'arrow', sw: Math.max(2, P.vsw) }), a: p, line: 1 }; return; }
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
            const s = topShape(p);
            if ((P.addSel || e.shiftKey) && P.sel && s) { const M = P.many.length ? P.many : [P.sel]; P.many = M.includes(s) ? M.filter(q => q !== s) : M.concat(s); if (!P.many.length) P.many = [P.sel]; P.sel = P.many[P.many.length - 1]; P.addSel = false; if (P.many.length > 1) say(`➕ ${P.many.length}개 골랐어요 · 위 막대에서 합치기 · 정렬`); renderAll(); paintFloats(); paintProps(); return; }
            if (P.many.length > 1 && s && P.many.includes(s)) { histVec(P.cur); P.drag = { manyMove: 1, last: p }; return; }
            P.sel = s; P.pt = null; P.many = s ? [s] : []; P.addSel = false;
            if (s) { histVec(P.cur); P.drag = { smove: 1, s, last: p }; }
            renderAll(); paintFloats(); paintProps(); return;
        }
    }
    function move(e) {
        const p = toDoc(e), br = $('ppBr');
        if (P.mode === 'px' && ['brush', 'pencil', 'marker', 'air', 'erase', 'stamp', 'smudge'].includes(P.tool) && !P.hand) { const s = $('ppStage').getBoundingClientRect(), r = Math.max(4, (P.tool === 'pencil' ? Math.max(1, P.size * .35) : P.size / 2) * scale() * (P.tool === 'air' ? 3 : 1)); br.hidden = false; Object.assign(br.style, { left: (e.clientX - s.left - r) + 'px', top: (e.clientY - s.top - r) + 'px', width: r * 2 + 'px', height: r * 2 + 'px' }); } else br.hidden = true;
        if (P.pen && !P.drag) { P.pen.hover = p; drawOv(); }
        const d = P.drag; if (!d || !P.down || e.pointerId !== P.down.id) return;
        if (Math.hypot(e.clientX - P.down.sx, e.clientY - P.down.sy) > 3) P.down.moved = true;
        if (d.pan) { P.px = d.px + e.clientX - d.x; P.py = d.py + e.clientY - d.y; view(); return; }
        if (d.stroke) { const ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (ev.length ? ev : [e]).forEach(q => stroke(toDoc(q), q.pressure)); renderAll(); return; }
        if (d.lasso) { P.lasso.push(p); drawOv(); return; }
        if (d.smudge) { const ev = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (ev.length ? ev : [e]).forEach(q => smudgeTo(toDoc(q))); return; }
        if (d.gradPv) { d.b = p; drawOv(); return; }
        if (d.flMove) { P.fl.dx = d.dx + p.x - d.p0.x; P.fl.dy = d.dy + p.y - d.p0.y; renderAll(); return; }
        if (d.photo) { const L = P.cur; L.ox = d.ox + p.x - d.p0.x; L.oy = d.oy + p.y - d.p0.y; photoPaint(L); renderAll(); return; }
        if (d.sbMove) { d.el.mv.x = Math.round(d.x0 + p.x - d.p0.x); d.el.mv.y = Math.round(d.y0 + p.y - d.p0.y); P.cur.dirtyV = true; renderAll(); return; }
        if (d.cbMove) { const L = P.cur; L.box.x = d.x0 + (p.x - d.p0.x) / P.W; L.box.y = d.y0 + (p.y - d.p0.y) / P.H; L.dirtyV = true; renderAll(); return; }
        if (d.moveL) { d.dx = p.x - d.p0.x; d.dy = p.y - d.p0.y; renderAll(); return; }
        if (d.vmoveAll) { const dx = p.x - d.p0.x, dy = p.y - d.p0.y; d.p0 = p; P.cur.shapes.forEach(s => moveShape(s, dx, dy)); P.cur.dirtyV = true; renderAll(); paintFloats(); return; }
        if (d.shapePv) { d.b = e.shiftKey ? sq(d.a, p) : p; drawOv(); return; }
        if (d.penPt) { const a = d.penPt; if (dist(a, p) > 3 / scale()) { a.ho = { x: p.x, y: p.y }; a.hi = { x: 2 * a.x - p.x, y: 2 * a.y - p.y }; a.sm = true; } P.cur.dirtyV = true; renderAll(); return; }
        if (d.curve) { d.curve.push(p); drawOv(); return; }
        if (d.newS && d.line) { let b = p; if (e.shiftKey) { const an = Math.round(Math.atan2(p.y - d.a.y, p.x - d.a.x) / (Math.PI / 4)) * Math.PI / 4, L = dist(d.a, p); b = { x: d.a.x + Math.cos(an) * L, y: d.a.y + Math.sin(an) * L }; } d.newS.pts[1].x = b.x; d.newS.pts[1].y = b.y; drawOv(); return; }
        if (d.newS) { const b = e.shiftKey ? sq(d.a, p) : p; Object.assign(d.newS, { x: Math.min(d.a.x, b.x), y: Math.min(d.a.y, b.y), w: Math.abs(b.x - d.a.x), h: Math.abs(b.y - d.a.y) }); drawOv(); return; }
        if (d.manyMove) { P.many.forEach(q => moveShape(q, p.x - d.last.x, p.y - d.last.y)); d.last = p; P.cur.dirtyV = true; renderAll(); paintFloats(); return; }
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
        if (d.smudge) { P.dirty = true; renderAll(); return; }
        if (d.gradPv) { gradApply(d.a, d.b); drawOv(); return; }
        if (d.lasso) { lassoClose(); return; }
        if (d.moveL) { const L = P.cur, c = mkCv(P.W, P.H); c.getContext('2d').drawImage(L.cv, d.dx, d.dy); const x = L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.drawImage(c, 0, 0); P.dirty = true; renderAll(); return; }
        if (d.shapePv) { histPx(P.cur); const x = P.cur.cv.getContext('2d'); x.save(); x.globalAlpha = P.op; if (P.cur.aLock) x.globalCompositeOperation = 'source-atop'; shapePx(x, d.a, d.b); x.restore(); P.dirty = true; renderAll(); return; }
        if (d.curve) { P.drag = d; curveEnd(); return; }
        if (d.newS && d.line && dist(d.newS.pts[0], d.newS.pts[1]) < 4) d.newS.pts[1].x += 120;
        if (d.newS) { const s = d.newS; if (!d.line && s.w < 4 && s.h < 4) { Object.assign(s, { x: d.a.x - 60, y: d.a.y - 60, w: 120, h: 120 }); } const L = P.cur; histVec(L); L.shapes.push(s); L.dirtyV = true; P.sel = s; P.dirty = true; setTool('select'); renderAll(); paintFloats(); paintProps(); return; }
        if (d.cbMove || d.sbMove) { P.dirty = true; renderAll(); paintProps(); return; }
        if (d.penPt || d.smove || d.anchor || d.handle || d.vmoveAll || d.photo || d.flMove || d.manyMove) { P.dirty = true; renderAll(); paintFloats(); paintProps(); }
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
        e.stopImmediatePropagation(); if (P.pen) penEnd(); else if (P.fl) commitFloat(); else { P.sel = null; P.pt = null; P.many = []; P.addSel = false; renderAll(); paintFloats(); paintProps(); }
    }, true);

    /* ================= 되돌리기 ================= */
    const H_MAX = 30;
    function push(h) { P.hist.push(h); if (P.hist.length > H_MAX) P.hist.shift(); P.redo = []; }
    function histPx(L) { const c = mkCv(P.W, P.H); c.getContext('2d').drawImage(L.cv, 0, 0); push({ t: 'px', L, c }); }
    function histVec(L) { push({ t: 'vec', L, s: JSON.stringify(L.shapes) }); }
    const snapSt = () => ({ t: 'st', layers: P.layers.map(l => ({ l, p: { type: l.type, shapes: l.type === 'vec' ? JSON.parse(JSON.stringify(l.shapes)) : l.shapes, name: l.name, vis: l.vis, lock: l.lock, op: l.op, blend: l.blend, aLock: l.aLock, clip: !!l.clip, s: l.s, ox: l.ox, oy: l.oy, wash: l.wash, mk: l.mk && Object.assign({}, l.mk), blocks: l.blocks && JSON.parse(JSON.stringify(l.blocks)), pb: l.pb && JSON.parse(JSON.stringify(l.pb)), pa: l.pa && JSON.parse(JSON.stringify(l.pa)), els: l.els && JSON.parse(JSON.stringify(l.els)), box: l.box && Object.assign({}, l.box), text: l.text } })), cur: P.cur });
    function histSt() { push(snapSt()); }
    function restore(h) {
        if (h.t === 'multi') return { t: 'multi', items: h.items.slice().reverse().map(restore).reverse() };
        if (h.t === 'px') { const c = mkCv(P.W, P.H); c.getContext('2d').drawImage(h.L.cv, 0, 0); const x = h.L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.drawImage(h.c, 0, 0); return { t: 'px', L: h.L, c }; }
        if (h.t === 'vec') { const now = JSON.stringify(h.L.shapes); h.L.shapes = JSON.parse(h.s); h.L.dirtyV = true; P.sel = null; P.pt = null; P.many = []; return { t: 'vec', L: h.L, s: now }; }
        const now = snapSt(); P.layers = h.layers.map(x => { Object.assign(x.l, x.p); if (x.l.type === 'vec') { if (!x.l.cache) x.l.cache = mkCv(P.W, P.H); x.l.shapes = JSON.parse(JSON.stringify(x.p.shapes)); x.l.dirtyV = true; } if (x.l.type === 'css') { x.l.blocks = JSON.parse(JSON.stringify(x.p.blocks || [])); x.l.pb = JSON.parse(JSON.stringify(x.p.pb || [])); x.l.pa = JSON.parse(JSON.stringify(x.p.pa || [])); x.l.box = Object.assign({}, x.p.box); x.l.dirtyV = true; } if (x.l.type === 'svg') { x.l.els = JSON.parse(JSON.stringify(x.p.els || [])); x.l.dirtyV = true; } if (x.l.type === 'photo') photoPaint(x.l); if (x.l.type === 'paper' && x.p.mk) paperPaint(x.l); return x.l; }); P.cur = P.layers.includes(h.cur) ? h.cur : P.layers[P.layers.length - 1]; return now;
    }
    function undo() { commitFloat(); penEnd(); const h = P.hist.pop(); if (!h) { say('더 되돌릴 게 없어요', 900); return; } P.redo.push(restore(h)); after(); }
    function redo() { const h = P.redo.pop(); if (!h) return; P.hist.push(restore(h)); after(); }
    function after() { P.dirty = true; renderAll(); paintLayers(); paintProps(); paintFloats(); }

    /* ================= 🗂️ 레이어 칸 ================= */
    function paintLayers() {
        const box = $('ppLy'); if (!box) return;
        box.innerHTML = [...P.layers].reverse().map(L => { const T = TAG[L.type], bl = (BLEND.find(b => b[0] === L.blend) || BLEND[0])[1];
            return `<div class="pp-ly${L === P.cur ? ' on' : ''}" data-id="${L.id}" draggable="true"><button type="button" class="eye${L.vis ? '' : ' off'}" data-e="vis">${L.vis ? '👁' : '◌'}</button><canvas width="84" height="64" data-th="${L.id}"></canvas>
                <div><b>${esc(L.name)}</b><span class="tag ${T[0]}">${T[1]}</span><small>${L.clip ? '📎 ' : ''}${bl} · ${Math.round(L.op * 100)}%${L.aLock ? ' · 🫧' : ''}</small></div><button type="button" class="lk${L.lock ? ' on' : ''}" data-e="lock">${L.lock ? '🔒' : '🔓'}</button></div>`; }).join('');
        thumbs();
        box.onclick = e => { const row = e.target.closest('.pp-ly'); if (!row) return; const L = P.layers.find(l => l.id === +row.dataset.id); const b = e.target.closest('[data-e]');
            if (b) { histSt(); if (b.dataset.e === 'vis') L.vis = !L.vis; else L.lock = !L.lock; renderAll(); paintLayers(); paintProps(); return; }
            commitFloat(); penEnd(); if (P.cur !== L) P.cbNode = 'root'; P.cur = L; P.sel = null; P.pt = null; P.many = []; P.addSel = false;
            if (L.type === 'px' && P.mode !== 'px') { P.mode = 'px'; P.tool = 'brush'; modeBtns(); paintTools(); } if (L.type === 'vec' && P.mode !== 'vec') { P.mode = 'vec'; P.tool = 'select'; modeBtns(); paintTools(); } if (L.type === 'css' && P.mode !== 'css') { P.mode = 'css'; P.tool = 'cbmove'; modeBtns(); paintTools(); } if (L.type === 'svg' && P.mode !== 'svg') { P.mode = 'svg'; P.tool = 'sbmove'; modeBtns(); paintTools(); }
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
        if (a === 'px' || a === 'vec' || a === 'css' || a === 'svg') { histSt(); P.cur = addLayer(a, lyName(a)); if (P.mode !== a) { P.mode = a; P.tool = a === 'px' ? 'brush' : a === 'css' ? 'cbmove' : a === 'svg' ? 'sbmove' : 'pen'; modeBtns(); paintTools(); } P.sel = null; }
        if (a === 'dup' && L) { if (L.type === 'paper') { say('🧵 종이는 하나예요'); return; } histSt(); const N = addLayer(L.type, L.name + ' 복사', { op: L.op, blend: L.blend, aLock: L.aLock, img: L.img, s: L.s, ox: L.ox, oy: L.oy, wash: L.wash, blocks: L.blocks && JSON.parse(JSON.stringify(L.blocks)), pb: L.pb && JSON.parse(JSON.stringify(L.pb)), pa: L.pa && JSON.parse(JSON.stringify(L.pa)), els: L.els && JSON.parse(JSON.stringify(L.els)), box: L.box && Object.assign({}, L.box), text: L.text }); if (L.type === 'vec') { N.shapes = JSON.parse(JSON.stringify(L.shapes)); } else if (L.type !== 'css') N.cv.getContext('2d').drawImage(L.cv, 0, 0); P.cur = N; }
        if (a === 'del' && L) { if (L.type === 'paper') { say('🧵 종이는 지울 수 없어요 · 꾸미려면 🧩 CSS · 🌀 SVG 레이어를 써요'); return; } if (P.layers.filter(l => l.type !== 'paper').length <= 1 && P.layers.length <= 2) { histSt(); clearLayer(L); renderAll(); paintLayers(); return; } histSt(); const i = P.layers.indexOf(L); P.layers.splice(i, 1); P.cur = P.layers[Math.max(1, i - 1)] || P.layers[P.layers.length - 1]; P.sel = null; }
        if (a === 'merge' && L) { const i = P.layers.indexOf(L), B = P.layers[i - 1]; if (!B || B.type === 'paper' || L.type === 'paper') { say('⤓ 아래에 합칠 레이어가 없어요 (종이에는 안 합쳐요)'); return; } const pc = mkCv(P.W, P.H); pc.getContext('2d').drawImage(B.cv, 0, 0); push({ t: 'multi', items: [snapSt(), { t: 'px', L: B, c: pc }] }); const bx = B.cv.getContext('2d'); if (B.type === 'vec' || B.type === 'css' || B.type === 'svg') { bx.clearRect(0, 0, P.W, P.H); bx.drawImage(layerImg(B), 0, 0); B.type = 'px'; delete B.cache; B.shapes = []; delete B.blocks; delete B.box; delete B.els; } bx.save(); bx.globalAlpha = L.op; bx.globalCompositeOperation = L.blend; bx.drawImage(layerImg(L), 0, 0); bx.restore(); P.layers.splice(i, 1); P.cur = B; say('⤓ 합쳤어요 (픽셀이 돼요)'); }
        if (a === 'lock' && L) { histSt(); L.lock = !L.lock; }
        P.dirty = true; renderAll(); paintLayers(); paintProps(); paintFloats();
    }
    function clearLayer(L) { if (L.type === 'svg') { L.els = []; L.dirtyV = true; return; } if (L.type === 'css') { L.blocks = []; L.pb = []; L.pa = []; L.dirtyV = true; return; } if (L.type === 'vec') { L.shapes = []; L.dirtyV = true; } else L.cv.getContext('2d').clearRect(0, 0, P.W, P.H); }
    /* ✂ 잘라 붙이기 : 올가미로 떼어 낸 것 → 새 레이어 (P.fl 이 있을 때) */
    function cutToLayer() { const f = P.fl; if (!f) return false; P.fl = null; histSt(); const N = addLayer('px', '조각 ' + (P.layers.length)); N.cv.getContext('2d').drawImage(f.cv, f.dx, f.dy); P.cur = N; say('✂ 새 레이어로 붙였어요'); P.dirty = true; renderAll(); paintLayers(); paintProps(); return true; }

    /* ---------- 오른쪽 아래 : 고른 것 설정 ---------- */
    const chip = (k, v, n, on) => `<button type="button" data-${k}="${v}" class="${on ? 'on' : ''}">${n}</button>`;
    function rTab() {                                                          // 🧩 블록 레이어를 골랐을 때만 탭 (레이어 | 블록)
        const R = P.o && P.o.R, on = P.cur && ((P.mode === 'css' && P.cur.type === 'css') || (P.mode === 'svg' && P.cur.type === 'svg')); if (!R) return false;
        if (!P.rTab) P.rTab = 'bk';
        R.classList.toggle('pp-tabon', !!on); R.classList.toggle('pp-tab-bk', !!on && P.rTab === 'bk');
        R.querySelectorAll('#ppRTab [data-rt]').forEach(b => { const o = b.dataset.rt === P.rTab; b.classList.toggle('on', o); b.setAttribute('aria-selected', o); });
        return on && P.rTab === 'bk';
    }
    function paintProps() {
        const box = $('ppProp'), T = $('ppPropT'); if (!box) return; const L = P.cur, s = P.sel;
        if (rTab()) { if (L.type === 'svg') { T.innerHTML = '🌀 ' + esc(L.name) + '<em>SVG 공식 기능을 하나씩 붙여요</em>'; box.innerHTML = sbPanel(L); return; } T.innerHTML = '🧩 ' + esc(L.name) + '<em>CSS 공식 기능을 하나씩 쌓아요</em>'; box.innerHTML = cbPanel(L); return; }
        if (P.mode === 'vec' && s && L && L.shapes && L.shapes.includes(s)) {
            T.textContent = '✒️ 고른 모양';
            box.innerHTML = `<div class="r"><span>칠하기</span><div>${chip('vf', 'cur', `<i style="background:${s.fill || 'transparent'}"></i>${s.fill ? '바꾸기' : '지금 색'}`, !!s.fill)}${chip('vf', 'none', '없음', !s.fill)}</div></div>
                <div class="r"><span>선</span><div>${chip('vs', 'cur', `<i style="background:${s.stroke || 'transparent'}"></i>${s.stroke ? '바꾸기' : '지금 색'}`, !!s.stroke)}${chip('vs', 'none', '없음', !s.stroke)}${chip('vd', 1, '점선', s.dash)}</div></div>
                <div class="r"><span>선 끝</span><div>${chip('vc', 'round', '둥글게', s.cap === 'round')}${chip('vc', 'butt', '각지게', s.cap !== 'round')}</div></div>
                ${s.k === 'rect' ? `<label class="pp-sl">모서리<input type="range" data-pk="r" min="0" max="120" value="${s.r || 0}"><b>${Math.round(s.r || 0)}</b></label>` : ''}
                <label class="pp-sl">선 굵기<input type="range" data-pk="sw" min="0" max="40" value="${s.sw || 0}"><b>${s.sw || 0}px</b></label>
                <label class="pp-sl">투명도<input type="range" data-pk="op" min=".05" max="1" step=".05" value="${s.op == null ? 1 : s.op}"><b>${Math.round((s.op == null ? 1 : s.op) * 100)}%</b></label>
                <div class="r"><span>그라데이션</span><div>${chip('vg', 'on', s.grad ? '🌈 켜짐' : '꺼짐', !!s.grad)}${s.grad ? chip('vg', 'c2', `<i style="background:${s.grad.c2}"></i>끝 색 = 지금 색`, false) : ''}</div></div>
                ${s.grad ? `<label class="pp-sl">방향<input type="range" data-pk="ga" min="0" max="360" value="${s.grad.ang}"><b>${s.grad.ang}°</b></label>` : ''}${s.k === 'group' ? `<p class="pp-hint">${s.bop === 'none' ? '📦 그룹' : s.bop === 'union' ? '⊕ 합친 모양' : s.bop === 'sub' ? '⊖ 뺀 모양' : '⊗ 겹친 곳'} · 위 막대 📤 풀기로 되돌려요${s.bop !== 'none' ? ' · 선은 칠만 돼요' : ''}</p>` : ''}`;
            return;
        }
        if (!L) { box.innerHTML = ''; T.textContent = ''; return; }
        T.textContent = '🗂️ 고른 레이어 · ' + L.name;
        let h = '';
        if (L.type === 'paper') h = `<p class="pp-hint">🧵 종이는 맨 아래에 늘 있어요 · 종이를 꾸미려면 🧩 CSS · 🌀 SVG 레이어를 써요 (상자 ⬛ 종이 가득)</p>`;
        else {
            h = `<div class="r"><span>섞는 법</span><div>${BLEND.map(([v, n]) => chip('bl', v, n, L.blend === v)).join('')}</div></div>
                <label class="pp-sl">투명도<input type="range" data-pk="lop" min="0" max="1" step=".05" value="${L.op}"><b>${Math.round(L.op * 100)}%</b></label>
                <div class="r"><span>잠금</span><div>${chip('lk', 1, '🔒 레이어', L.lock)}${L.type === 'px' ? chip('al', 1, '🫧 그린 곳만 칠', L.aLock) : ''}</div></div>
                <div class="r"><span>클리핑</span><div>${chip('clip', 1, '📎 아래 레이어 그림 안에만', !!L.clip)}</div></div>`;
            if (L.type === 'px') { const A = P.adj && P.adj.L === L ? P.adj : { h: 0, s: 100, b: 100, bl: 0 };
                h += `<h4>🎨 색 조정<em>움직이면 바로 · 적용하면 끝</em></h4><label class="pp-sl">색 돌리기<input type="range" data-pk="ah" min="-180" max="180" value="${A.h}"><b>${A.h}°</b></label><label class="pp-sl">채도<input type="range" data-pk="as" min="0" max="200" value="${A.s}"><b>${A.s}%</b></label><label class="pp-sl">밝기<input type="range" data-pk="ab" min="0" max="200" value="${A.b}"><b>${A.b}%</b></label><label class="pp-sl">흐리게<input type="range" data-pk="abl" min="0" max="20" value="${A.bl}"><b>${A.bl}</b></label>
                    <div class="r"><span></span><div><button type="button" data-adj="ok"${P.adj && P.adj.L === L ? '' : ' disabled'}>✔ 적용</button><button type="button" data-adj="reset"${P.adj && P.adj.L === L ? '' : ' disabled'}>↺ 처음대로</button></div></div>`; }
            if (L.type === 'photo') h += `<label class="pp-sl">사진 크기<input type="range" data-pk="ps" min="1" max="3" step=".01" value="${L.s}"><b>${Math.round(L.s * 100)}%</b></label><label class="pp-sl">연하게<input type="range" data-pk="pw" min="0" max=".85" step=".01" value="${L.wash}"><b>${Math.round(L.wash * 100)}%</b></label><p class="pp-hint">✋ 옮기기 도구로 사진 자리를 옮겨요</p>`;
        }
        const C = P.cut || { on: false, w: 12, c: '#ffffff' };
        h += `<h4>✂️ 자동 칼선<em>그림 둘레 하얀 테두리 · 스티커처럼</em></h4><div class="r"><span>칼선</span><div>${chip('cut', 1, C.on ? '켜짐' : '꺼짐', C.on)}${chip('cutc', '#ffffff', '하양', C.c === '#ffffff')}${chip('cutc', 'cur', `<i style="background:${C.c !== '#ffffff' ? C.c : P.color}"></i>지금 색`, C.c !== '#ffffff')}${chip('cutsh', 1, '그림자', !!C.sh)}</div></div><label class="pp-sl">두께<input type="range" data-pk="cw" min="2" max="40" value="${C.w}"><b>${C.w}px</b></label>`;
        h += `<div class="r"><span>완성 모양</span><div><button type="button" class="on">${P.kind === 'tk' ? '🧻 떡메 한 묶음' : P.kind === 'tape' ? '🎀 테이프 한 롤' : P.kind === 'seal' ? '🏷️ 씰 시트 한 장' : P.kind === 'piece' ? '🧩 조각 봉투 (4조각)' : P.kind === 'paper' ? '📄 모조지 한 장' : '📃 속지 한 장'}</button></div></div>`;
        box.innerHTML = h;
    }
    function adjSet(L, k, v) {                                                 // 🎨 색 조정 (픽셀 · 사파리도 같게 = 점마다 계산)
        if (!P.adj || P.adj.L !== L) { histPx(L); const b = mkCv(P.W, P.H); b.getContext('2d').drawImage(L.cv, 0, 0); P.adj = { L, base: b, h: 0, s: 100, b: 100, bl: 0 }; paintProps(); }
        P.adj[{ ah: 'h', as: 's', ab: 'b', abl: 'bl' }[k]] = v; cancelAnimationFrame(P.adjR); P.adjR = requestAnimationFrame(() => adjRun(L));
    }
    function adjRun(L) {
        const A = P.adj; if (!A || A.L !== L) return; const W = P.W, H = P.H, id = A.base.getContext('2d').getImageData(0, 0, W, H), d = id.data;
        const a = A.h * Math.PI / 180, co = Math.cos(a), si = Math.sin(a), S = A.s / 100, Bk = A.b / 100;
        const m = [.213 + co * .787 - si * .213, .715 - co * .715 - si * .715, .072 - co * .072 + si * .928, .213 - co * .213 + si * .143, .715 + co * .285 + si * .14, .072 - co * .072 - si * .283, .213 - co * .213 - si * .787, .715 - co * .715 + si * .715, .072 + co * .928 + si * .072];
        for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; let r = d[i], g = d[i + 1], b = d[i + 2];
            if (A.h) { const R = r * m[0] + g * m[1] + b * m[2], G = r * m[3] + g * m[4] + b * m[5], Bb = r * m[6] + g * m[7] + b * m[8]; r = R; g = G; b = Bb; }
            if (S !== 1) { const l = .2126 * r + .7152 * g + .0722 * b; r = l + (r - l) * S; g = l + (g - l) * S; b = l + (b - l) * S; }
            d[i] = r * Bk; d[i + 1] = g * Bk; d[i + 2] = b * Bk; }
        const x = L.cv.getContext('2d'); x.clearRect(0, 0, W, H); x.putImageData(id, 0, 0);
        if (A.bl > 0) { const t = mkCv(W, H), tx = t.getContext('2d'), n = Math.max(6, A.bl * 2); tx.globalAlpha = 1 / n * 2; for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2; tx.drawImage(L.cv, Math.cos(an) * A.bl * .7, Math.sin(an) * A.bl * .7); } x.clearRect(0, 0, W, H); x.globalAlpha = 1; x.drawImage(t, 0, 0); x.drawImage(t, 0, 0, W, H); }
        P.dirty = true; renderAll();
    }
    let propH = 0;
    function onProp(e) {
        const L = P.cur, s = P.sel;
        if (L && L.type === 'css' && cbProp(e, L)) return;
        if (L && L.type === 'svg' && sbProp(e, L)) return;
        const r = e.target.closest('input[type=range]');
        if (r && e.type === 'input') {
            const k = r.dataset.pk, v = +r.value, now = Date.now(); if (now - propH > 800) { if (['r', 'sw', 'op', 'ga'].includes(k)) histVec(L); else if (!['ah', 'as', 'ab', 'abl'].includes(k)) histSt(); } propH = now;
            if (k === 'r') s.r = v; if (k === 'sw') s.sw = v; if (k === 'op') s.op = v; if (k === 'ga' && s.grad) { s.grad.ang = v; L.dirtyV = true; r.nextElementSibling.textContent = v + '°'; P.dirty = true; renderAll(); return; } if (['r', 'sw', 'op'].includes(k)) L.dirtyV = true;
            if (k === 'lop') L.op = v; if (k === 'ps') { L.s = v; photoPaint(L); } if (k === 'pw') { L.wash = v; photoPaint(L); }
            if (k === 'cw') { P.cut = Object.assign({ on: true, w: 12, c: '#ffffff' }, P.cut, { w: v }); r.nextElementSibling.textContent = v + 'px'; P.dirty = true; cutSoon(); return; }
            if (['ah', 'as', 'ab', 'abl'].includes(k)) { adjSet(L, k, v); r.nextElementSibling.textContent = v + (k === 'ah' ? '°' : k === 'abl' ? '' : '%'); return; }
            r.nextElementSibling.textContent = k === 'op' || k === 'lop' || k === 'ps' || k === 'pw' ? Math.round(v * 100) + '%' : k === 'sw' ? v + 'px' : Math.round(v);
            P.dirty = true; renderAll(); if (k === 'lop') thumbsSoon(); return;
        }
        if (e.type !== 'click') return;
        const b = e.target.closest('button'); if (!b) return; const ds = b.dataset;
        if (ds.vg) { histVec(L); if (ds.vg === 'on') shapeAct('grad'); else if (s.grad) s.grad.c2 = P.color; L.dirtyV = true; }
        if (ds.vf || ds.vs || ds.vd || ds.vc) { histVec(L); if (ds.vf) s.fill = ds.vf === 'none' ? null : P.color; if (ds.vs) { s.stroke = ds.vs === 'none' ? null : P.color; if (s.stroke && !s.sw) s.sw = P.vsw || 4; } if (ds.vd) s.dash = !s.dash; if (ds.vc) s.cap = ds.vc; L.dirtyV = true; }
        if (ds.bl) { histSt(); L.blend = ds.bl; }
        if (ds.clip) { histSt(); L.clip = !L.clip; say(L.clip ? '📎 바로 아래 레이어 그림 안에만 보여요' : '📎 클리핑 끔'); }
        if (ds.cut) { P.cut = Object.assign({ on: false, w: 12, c: '#ffffff' }, P.cut); P.cut.on = !P.cut.on; cutSoon(); }
        if (ds.cutc) { P.cut = Object.assign({ on: true, w: 12, c: '#ffffff' }, P.cut); P.cut.c = ds.cutc === 'cur' ? P.color : ds.cutc; P.cut.on = true; cutSoon(); }
        if (ds.cutsh) { P.cut = Object.assign({ on: true, w: 12, c: '#ffffff' }, P.cut); P.cut.sh = !P.cut.sh; cutSoon(); }
        if (ds.adj) { if (ds.adj === 'reset' && P.adj && P.adj.L === L) { const x = L.cv.getContext('2d'); x.clearRect(0, 0, P.W, P.H); x.drawImage(P.adj.base, 0, 0); } P.adj = null; }
        if (ds.lk) { histSt(); L.lock = !L.lock; }
        if (ds.al) { histSt(); L.aLock = !L.aLock; }
        P.dirty = true; renderAll(); paintLayers(); paintProps();
    }


    /* ================= ↔ 양쪽 칸 폭 (도련 11-18) : 칸 사이 손잡이를 끌어 넓히고 줄여요 · 두 번 누르면 처음 폭 · 이 기기에 기억 (태블릿 작업대 세 칸만) ================= */
    const RSZ_K = 'mld_pp_cols', RSZ0 = { l: 262, r: 290 };
    function rszWire() {
        const o = P.o, host = o.L && o.L.parentElement; document.querySelectorAll('.pp-rsz').forEach(x => x.remove());
        if (!host || host !== o.R.parentElement || !host.classList.contains('shm-body') || !host.closest('#tbWs')) return;
        let W = {}; try { W = JSON.parse(localStorage.getItem(RSZ_K) || '{}') || {}; } catch (e) { }
        const apply = () => { host.style.setProperty('--pp-lw', (W.l || RSZ0.l) + 'px'); host.style.setProperty('--pp-rw', (W.r || RSZ0.r) + 'px'); };
        const place = () => { if (!host.isConnected) return; [[hl, o.L, o.C], [hr, o.C, o.R]].forEach(([h, a, b]) => { const x = (a.offsetLeft + a.offsetWidth + b.offsetLeft) / 2; h.style.left = (x - 7) + 'px'; h.style.top = a.offsetTop + 'px'; h.style.height = Math.max(a.offsetHeight, b.offsetHeight) + 'px'; }); };
        const mk = side => { const h = document.createElement('div'); h.className = 'pp-rsz'; h.title = '끌어서 칸 넓이 바꾸기 · 두 번 누르면 처음대로'; h.setAttribute('role', 'separator'); h.setAttribute('aria-orientation', 'vertical'); host.appendChild(h);
            h.addEventListener('pointerdown', e => { e.preventDefault(); h.setPointerCapture(e.pointerId); h.classList.add('on'); const x0 = e.clientX, v0 = W[side] || RSZ0[side], k = host.getBoundingClientRect().width / host.offsetWidth || 1;
                const mv = ev => { const other = side === 'l' ? (W.r || RSZ0.r) : (W.l || RSZ0.l), mx = Math.max(200, host.offsetWidth - other - 380); W[side] = Math.round(Math.max(200, Math.min(mx, 560, v0 + (side === 'l' ? 1 : -1) * (ev.clientX - x0) / k))); apply(); place(); };
                const up = () => { h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up); h.classList.remove('on'); try { localStorage.setItem(RSZ_K, JSON.stringify(W)); } catch (e) { } fit(); place(); };
                h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up); });
            h.addEventListener('dblclick', () => { delete W[side]; try { localStorage.setItem(RSZ_K, JSON.stringify(W)); } catch (e) { } apply(); fit(); place(); });
            return h; };
        host.classList.add('pp-rszhost'); const hl = mk('l'), hr = mk('r'); apply(); requestAnimationFrame(place); setTimeout(place, 300);
        P.rszPlace = place;
    }
    /* ================= 🧩 블록 레이어 (도련 11-18 · 시안 13 · js/cssblocks.js) : 왼쪽 = 블록 상자 (css 공식 기능) · 오른쪽 🧩 블록 탭 = 상자 자리 · 글자 (접기) · 쌓은 블록 · 👩‍💻 코드 ================= */
    const KIND_TIP = () => (P.still ? '<p class="pp-kindtip">🎬 이 종류는 가만히 있는 그림이라 움직임 기능은 없어요</p>' : '') + (P.kind === 'tk' ? '<p class="pp-kindtip">🧻 맨 위 풀칠 띠 자리는 묶음에 가려져요</p>' : P.kind === 'tape' ? '<p class="pp-kindtip">🎀 한 칸 밖으로 나간 그림자 · 장식 · 기울이기는 이어지는 곳에서 끊겨요</p>' : '');   // 종류마다 (도련 11-19)
    function cbTools() {
        $('ppToolT').innerHTML = '🧩 CSS 기능 상자<em>눌러서 쌓아요 · 위가 앞</em>';
        const tile = (a, e, n, tt) => `<button type="button" ${a} title="${esc(tt)}">${e}<small>${esc(n)}</small></button>`;
        $('ppTools').innerHTML = KIND_TIP() + CB.GROUPS.filter(([g, ks]) => !(P.still && ks.includes('animation'))).map(([g, ks]) => `<div class="pp-cbg"><b>${g}</b><div class="pp-cbs">${ks.map(k => tile(`data-cb="${k}" data-q="${esc((CB.DEF(k).n + ' ' + CB.OFF(k)).toLowerCase())}"`, CB.DEF(k).e, CB.DEF(k).n, 'CSS 공식 기능 : ' + CB.OFF(k))).join('')}</div></div>`).join('');
        $('ppOpt').innerHTML = '<p class="pp-hint">✋ 종이 위를 끌면 CSS 상자를 옮겨요<br>🧩 CSS 공식 기능을 하나씩 · 오른쪽에서 ▣ 본체 · ✨ 장식 1 · ✨ 장식 2 를 골라 쌓아요<br>🎬 움직임은 그림판에서 움직여요 (구운 그림은 첫 장면)</p>';
    }
    function cbLayer() {                                                        // 지금 블록 레이어 (아니면 새로)
        if (P.cur && P.cur.type === 'css') return P.cur;
        const L = addLayer('css', lyName('css')); L.blocks = []; P.cur = L; return L;
    }
    const CB_PART = [['pa', '✨ 장식 2', '::after · 맨 위'], ['pb', '✨ 장식 1', '::before · 본체 위'], ['blocks', '▣ 상자', '이 상자 · 맨 아래'], ['pfl', '🔠 첫 글자', '::first-letter'], ['pfn', '📏 첫 줄', '::first-line']];   // 위가 앞 (레이어처럼)
    const cbFind = (L, id) => { let f = null; const go = (A, par) => (A || []).forEach((n, i) => { if (f) return; if (n.id === id) f = { n, A, i, par }; else go(n.kids, n); }); go(L.kids, null); return f; };   // 🌳 상자 나무에서 찾기
    const cbNode = L => (P.cbNode && P.cbNode !== 'root' && cbFind(L, P.cbNode)) ? cbFind(L, P.cbNode).n : null;
    const cbParts = L => CB.partsOf(L, cbNode(L));
    const cbPart = L => { const k = P.cbPart || 'blocks', o = cbParts(L); if (!o[k]) o[k] = []; return o[k]; };
    const cbAll = L => { const A = []; [L].concat(Object.values(L.cls || {})).forEach(o => CB.PART.forEach(([k]) => { if (o[k]) A.push(...o[k]); })); return A; };
    let cbUid = Date.now() % 100000;
    function cbGc(L) { const u = new Set(CB.usedCls(L)); Object.keys(L.cls || {}).forEach(k => { if (!u.has(k)) delete L.cls[k]; }); }   // 아무도 안 쓰는 이름은 지워요
    function cbTreeAct(L, a) {                                                 // 🌳 ＋ 안에 · ＋ 옆에 · ▲ ▼ · 🗑
        const f = P.cbNode && P.cbNode !== 'root' ? cbFind(L, P.cbNode) : null;
        if (a === 'in' || a === 'sib') { if (a === 'sib' && !f) { say('▣ 맨 위 상자 옆에는 못 넣어요 · ＋ 안에 상자를 눌러요'); return; }
            const nm = a === 'sib' ? f.n.name : (() => { let i = 1; while ((L.cls || {})['상자' + i] || CB.usedCls(L).includes('상자' + i)) i++; return '상자' + i; })();
            const n = { id: 'b' + (++cbUid), name: nm, text: a === 'sib' ? f.n.text || '' : '', kids: [] };
            if (a !== 'sib') { const o = CB.partsOf(L, n); if (!o.blocks.length) { const w = CB.fresh('width'), h = CB.fresh('height'); w.v.v.n = 30; h.v.v.n = 30; o.blocks.push(Object.assign(CB.fresh('background-color'), { v: { c: { c: ['#ffb3c9', '#b3e5ff', '#c9f2c7', '#fff1a8', '#e0c8ff'][(Object.keys(L.cls || {}).length - 1) % 5], a: 100 } } }), w, h); } }
            if (a === 'in') (f ? f.n.kids : L.kids).push(n); else f.A.splice(f.i + 1, 0, n);
            P.cbNode = n.id; P.cbPart = 'blocks'; P.cbOpen = null; say(a === 'in' ? '🌳 안에 상자를 넣었어요 · 이름이 같으면 기능도 같아요' : '🌳 옆에 같은 이름 상자 = 같은 기능', 2000); }
        if (!f) return;
        if (a === 'up' && f.i > 0) [f.A[f.i - 1], f.A[f.i]] = [f.A[f.i], f.A[f.i - 1]];
        if (a === 'down' && f.i < f.A.length - 1) [f.A[f.i + 1], f.A[f.i]] = [f.A[f.i], f.A[f.i + 1]];
        if (a === 'del') { f.A.splice(f.i, 1); P.cbNode = f.par ? f.par.id : 'root'; cbGc(L); }
    }
    function cbRename(L, v) {                                                  // 🏷️ 이름 (class) 바꾸기 = 그 이름이 있으면 같이 쓰고 · 없으면 지금 기능을 복사해서 새 이름
        const n = cbNode(L); v = CB.cname(v); if (!n || !v || v === n.name) return;
        L.cls = L.cls || {}; let others = 0; CB.walk(L, q => { if (q !== n && q.name === n.name) others++; });
        if (!L.cls[v]) { if (!others) { L.cls[v] = CB.partsOf(L, n); delete L.cls[n.name]; }   // 나만 쓰던 이름 = 그대로 이름만 바꿔요
            else { L.cls[v] = CB.clone(CB.partsOf(L, n)); Object.values(L.cls[v]).forEach(A => (A || []).forEach(c => { c.id = CB.fresh('opacity').id; })); } }   // 같이 쓰던 이름 = 복사해서 따로
        n.name = v; cbGc(L);
    }
    function cbAdd(t) {
        const B = CB.fresh(t); if (!B) return; commitFloat(); penEnd();
        if (P.cur && P.cur.type === 'css' && P.cur.lock) { say('🔒 잠긴 레이어예요'); return; }
        histSt(); const L = cbLayer(); cbPart(L).unshift(B); P.cbOpen = B.id; P.rTab = 'bk'; L.dirtyV = true; P.dirty = true;
        if ((t === 'url' || t === 'm-url') && !P.tour) setTimeout(() => { P.cbImgFor = B.id; const f = $('ppCbFile'); if (f) f.click(); }, 60);   // 🖼️ 그림 깔기 = 바로 그림 고르기
        renderAll(); paintLayers(); paintProps();
    }
    /* 칸 하나 (k = 블록id|길) */
    const cbRng = (k, v, mn, mx, st, u) => `<input type="range" data-cf="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}"><input type="number" class="nb" data-cf="${k}" step="${st}" value="${v}" aria-label="숫자">${u ? `<s>${u}</s>` : ''}`;
    function cbIn(k, t, val, o, lb) {
        let h = '';
        if (t === 'col') h = `<input type="color" data-cf="${k}.c" value="${/^#[0-9a-f]{6}$/i.test(val.c) ? val.c : '#000000'}"><span class="al">진하기</span><input type="range" class="sm" data-cf="${k}.a" min="0" max="100" value="${val.a == null ? 100 : val.a}" aria-label="진하기">`;
        else if (t === 'len') { const [us, mn, mx] = o || ['px', 0, 200], U = Array.isArray(us) ? us : [us]; h = cbRng(`${k}.n`, val.n, val.u === '%' ? 0 : mn, val.u === '%' ? 100 : mx, 1) + (U.length > 1 ? `<select data-cf="${k}.u" class="un">${U.map(u => `<option value="${u}"${u === val.u ? ' selected' : ''}>${u}</option>`).join('')}</select>` : `<s>${val.u}</s>`); }
        else if (t === 'ang') { const [mn, mx] = o || [0, 360]; h = cbRng(k, val, mn, mx, 1, '°'); }
        else if (t === 'pct') { const [mn, mx] = o || [0, 100]; h = cbRng(k, val, mn, mx, 1, '%'); }
        else if (t === 'num') { const [mn, mx, st] = o || [0, 100, 1]; h = cbRng(k, val, mn, mx, st); }
        else if (t === 'sel') h = `<select data-cf="${k}">${o.map(x => `<option value="${esc(x)}"${x === val ? ' selected' : ''}>${esc((P.kox || CB.KO)[x] || x)}</option>`).join('')}</select>`;
        else if (t === 'bool') h = `<input type="checkbox" data-cf="${k}"${val ? ' checked' : ''}>`;
        else if (t === 'img') h = `<button type="button" data-cbimg="${k.split('|')[0]}">${val ? '🖼️ 다른 그림' : '📎 그림 고르기'}</button>${lyOpts()}`.replace('<select data-cbly>', `<select data-cbly="${esc(k)}">`);   // 🗂️ 그림판 레이어를 그림으로 (섞기 · 11-19)
        else if (t === 'sfx') { const O = sfxList(); h = O.length ? `<select data-cf="${k}"><option value="">고르기</option>${O.map(([v, n]) => `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select>` : '<small class="pp-hint">먼저 🌀 SVG 레이어에서 도형에 🪄 필터를 붙여요</small>'; }
        else if (t === 'txt') h = `<input type="text" class="tx" data-cf="${k}" value="${esc(val)}" aria-label="${esc(lb)}">`;
        else if (t === 'txta') h = `<textarea class="tx" data-cf="${k}" rows="2" aria-label="${esc(lb)}">${esc(val)}</textarea>`;
        return `<div class="pp-cf"><label>${esc(lb)}</label><div class="pp-cfv">${h}</div></div>`;
    }
    function lyOpts() {                                                        // 🗂️ 이 그림판의 다른 레이어 = 그 순간 모습을 그림으로
        const A = P.layers.filter(l => l !== P.cur && l.type !== 'paper'); if (!A.length) return '';
        return `<select data-cbly><option value="">🗂️ 그림판 레이어 그림으로…</option>${A.map(l => `<option value="${l.id}">${esc(l.name)} (${{ px: '픽셀', vec: '벡터', css: 'CSS', svg: 'SVG', photo: '사진' }[l.type] || l.type})</option>`).join('')}</select>`;
    }
    function sfxList() {                                                       // 🌀 svg 블록 레이어에서 필터를 붙인 도형들
        const o = []; P.layers.forEach(l => { if (l.type !== 'svg') return; (l.els || []).forEach((e, i) => { if ((e.b || []).some(B => B.on && SB.BL[B.t] && SB.BL[B.t].fx)) o.push([e.id, `${l.name} · ${SB.EL[e.t].n} (${i + 1}번째)`]); }); }); return o;
    }
    async function layerPic(L) {                                               // 레이어 → 그림 주소 (그린 곳만 잘라서 · svg · 벡터 = 선명한 svg 그대로)
        if (L.type === 'css') await CB.settle(); if (L.type === 'svg') { L.dirtyV = true; layerImg(L); await SB.settle(); L.dirtyV = true; }
        const cr = cropCv(layerImg(L)); if (!cr) return '';
        const vb = `${cr.x - 2} ${cr.y - 2} ${cr.c.width + 4} ${cr.c.height + 4}`, wh = `width="${cr.c.width + 4}" height="${cr.c.height + 4}"`;
        if (L.type === 'svg') return SVG_PFX + encodeURIComponent(SB.build(L, P.W, P.H, await SB.fontsOf(L)).replace(/^<svg ([^>]*?)width="[^"]*" height="[^"]*" viewBox="[^"]*"/, `<svg $1${wh} viewBox="${vb}"`));
        if (L.type === 'vec') { const D = [], r = vecSvg(L, D); return SVG_PFX + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" ${wh} viewBox="${vb}">${D.length ? `<defs>${D.join('')}</defs>` : ''}${r.s}</svg>`); }
        return cr.c.toDataURL('image/png');
    }
    async function lyPick(t, L, all) {                                         // <select data-cbly> 고르면
        const [id, path] = t.dataset.cbly.split('|'), c = all.find(x => x.id === id), src = P.layers.find(l => String(l.id) === t.value); if (!c || !src) return;
        histSt(); CB.set(c, path, await layerPic(src)); L.dirtyV = true; P.dirty = true; renderAll(); paintProps(); thumbsSoon(); say('🗂️ 그 레이어의 지금 모습을 그림으로 넣었어요', 1800);
    }
    function cbFields(id, spec, obj, base) {
        return spec.map(([key, lb, t, o]) => {
            const k = `${id}|${base}.${key}`, v = obj[key];
            if (t === 'stops') { const mx = v.u === '%' ? 100 : v.u === 'deg' ? 360 : 200;
                return `<div class="pp-cf"><label>${lb} <small>차례대로 · 자리 단위</small> <select data-cf="${k}.u" class="un">${o.map(u => `<option value="${u}"${u === v.u ? ' selected' : ''}>${u}</option>`).join('')}</select></label>
                    ${v.s.map((s, i) => `<div class="pp-stp"><b>${i + 1}</b><input type="color" data-cf="${k}.s.${i}.c.c" value="${s.c.c}" aria-label="색 ${i + 1}"><span class="al">진하기</span><input type="range" class="sm" data-cf="${k}.s.${i}.c.a" min="0" max="100" value="${s.c.a}" aria-label="진하기 ${i + 1}"><button type="button" class="x" data-cbrm="${k}.s.${i}" aria-label="색 ${i + 1} 빼기"${v.s.length > 1 ? '' : ' disabled'}>✕</button></div>
                    <div class="pp-stp in"><span class="al">자리</span>${cbRng(`${k}.s.${i}.p`, s.p, 0, mx, 1, v.u)}</div>`).join('')}
                    <button type="button" class="pp-plus" data-cbst="${k}.s">＋ 색 더하기</button></div>`; }
            if (t === 'kf') return `<div class="pp-cf"><label>${lb} <small>% 자리마다 무엇을 얼마나</small></label>${v.map((f, i) => { const K = CB.KP[f.p] || CB.KP.rotate, kk = `${k}.${i}`;
                    const vin = K[0] === 'col' ? `<input type="color" data-cf="${kk}.v.c" value="${f.v.c}"><input type="range" class="sm" data-cf="${kk}.v.a" min="0" max="100" value="${f.v.a}" aria-label="진하기">` : K[0] === 'ang' ? cbRng(`${kk}.v`, f.v, -360, 360, 1, '°') : K[0] === 'px' ? cbRng(`${kk}.v`, f.v, -200, 200, 1, 'px') : K[0] === 'pct' ? cbRng(`${kk}.v`, f.v, 0, 100, 1, '%') : cbRng(`${kk}.v`, f.v, 0, 3, .01);
                    return `<div class="pp-stp"><b>${i + 1}</b><select data-cf="${kk}.p" data-kfp="1" aria-label="무엇을">${Object.keys(CB.KP).map(x => `<option value="${x}"${x === f.p ? ' selected' : ''}>${esc(CB.KO[x] || x)}</option>`).join('')}</select><select data-cf="${kk}.e" aria-label="이 장면부터 빠르기">${['', 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(.68,-0.6,.32,1.6)', 'steps(2)'].map(x => `<option value="${x}"${x === (f.e || '') ? ' selected' : ''}>${x ? esc(CB.KO[x] || x) : '빠르기 그대로'}</option>`).join('')}</select><button type="button" class="x" data-cbrm="${kk}" aria-label="장면 빼기"${v.length > 1 ? '' : ' disabled'}>✕</button></div>
                        <div class="pp-stp in"><span class="al">때</span>${cbRng(`${kk}.at`, f.at, 0, 100, 1, '%')}</div><div class="pp-stp in"><span class="al">값</span>${vin}</div>`; }).join('')}<button type="button" class="pp-plus" data-cbst="${k}">＋ 장면 더하기</button></div>`;
            if (t === 'pts') return `<div class="pp-cf"><label>${lb} <small>${o ? '가로 · 세로' : '가로 % · 세로 %'}</small></label>${v.map((p, i) => `<div class="pp-stp"><b>${i + 1}</b>${cbRng(`${k}.${i}.0`, p[0], 0, o ? o[0] : 100, 1)}${cbRng(`${k}.${i}.1`, p[1], 0, o ? o[1] : 100, 1)}<button type="button" class="x" data-cbrm="${k}.${i}" aria-label="점 빼기"${v.length > 3 ? '' : ' disabled'}>✕</button></div>`).join('')}<button type="button" class="pp-plus" data-cbpt="${k}">＋ 점 더하기</button></div>`;
            return cbIn(k, t, v, o, lb);
        }).join('');
    }
    function cbCard(c, i, n) {
        const D = CB.DEF(c.t), open = P.cbOpen === c.id, lay = (P.cbLay || []).includes(c.id) || c.t === 'url';
        const body = open ? `<div class="pp-cbf">${cbFields(c.id, D.f, c.v, 'v')}${c.L ? `<details class="pp-in"${lay ? ' open' : ''}><summary data-cblay="${c.id}">🧭 놓는 방법 · 크기 · 자리 · 반복</summary>${cbFields(c.id, CB.LAYER, c.L, 'L')}</details>` : ''}</div>` : '';
        return `<div class="pp-cbk${c.on ? '' : ' off'}${open ? ' open' : ''}"><div class="pp-cbh"><button type="button" class="nm" data-cbo="${c.id}"><span>${D.e} ${esc(D.n)}</span><small>${esc(CB.OFF(c.t))}</small></button><button type="button" data-cba="on" data-i="${c.id}" title="켜기 · 끄기">${c.on ? '👁' : '◌'}</button><button type="button" data-cba="up" data-i="${c.id}" title="앞으로"${i ? '' : ' disabled'}>▲</button><button type="button" data-cba="down" data-i="${c.id}" title="뒤로"${i < n - 1 ? '' : ' disabled'}>▼</button><button type="button" data-cba="dup" data-i="${c.id}" title="복제">⧉</button><button type="button" data-cba="del" data-i="${c.id}" title="빼기">✕</button></div>${body}</div>`;
    }
    function cbPanel(L) {
        const bx = L.box, pc = v => Math.round(v * 100), sl2 = (k, n, v, min, max) => `<label class="pp-sl">${n}<input type="range" data-cbx="${k}" min="${min}" max="${max}" value="${pc(v)}"><b>${pc(v)}%</b></label>`;
        let h = `<details class="pp-cbfold"${P.cbBox ? ' open' : ''}><summary data-cbfold="1">📐 상자 자리 · 글자<em>${L.text ? '글자 있음 · ' : ''}${pc(bx.w)} × ${pc(bx.h)}%</em></summary><div class="pp-cbbox">${sl2('x', '가로 자리', bx.x, -50, 100)}${sl2('y', '세로 자리', bx.y, -50, 100)}${sl2('w', '폭', bx.w, 2, 150)}${sl2('h', '높이', bx.h, 2, 150)}
            <div class="r"><span>상자</span><div><button type="button" data-cbq="full">⬛ 종이 가득</button><button type="button" data-cbq="center">⊙ 가운데로</button></div></div>
            <label class="pp-cbt">맨 위 상자 안 글자<textarea data-cbtext="1" rows="2" placeholder="글자를 쓰면 상자 안에 나와요">${esc(L.text || '')}</textarea></label></div></details>`;
        const nd = cbNode(L), sel = nd ? nd.id : 'root', sameN = nd ? nd.name : null;
        const row = (n, d) => `<button type="button" data-cbnode="${n.id}" class="${n.id === sel ? 'on' : ''}${sameN && n.id !== sel && n.name === sameN ? ' same' : ''}" style="padding-left:${8 + d * 16}px"><span>${n.kids.length ? '📦' : '▫️'} ${esc(String(n.text || '').slice(0, 8))}</span><code>.${esc(n.name)}</code></button>` + n.kids.map(k => row(k, d + 1)).join('');
        h += `<div class="pp-cbtree"><b>🌳 상자 나무<em>안에 든 것 = 들여쓰기 · 같은 이름 = 같은 기능</em></b><button type="button" data-cbnode="root" class="${sel === 'root' ? 'on' : ''}"><span>▣ 맨 위 상자</span><code>.내-디자인</code></button>${(L.kids || []).map(n => row(n, 1)).join('')}
            <div class="pp-cbtb"><button type="button" data-cbt="in">＋ 안에 상자</button><button type="button" data-cbt="sib">＋ 옆에 상자</button><button type="button" data-cbt="up" title="앞 차례로">▲</button><button type="button" data-cbt="down" title="뒤 차례로">▼</button><button type="button" data-cbt="del" title="이 상자 빼기">🗑</button></div>
            ${nd ? `<label class="pp-cbt">이름 (class) · 같은 이름이면 기능을 같이 써요<input type="text" class="tx" data-cbnm="1" value="${esc(nd.name)}"></label><label class="pp-cbt">이 상자 안 글자<textarea data-cbntext="1" rows="1" placeholder="글자 · 이모지">${esc(nd.text || '')}</textarea></label>` : ''}</div>`;
        const A = cbPart(L), PO = cbParts(L);
        const cur = P.cbPart || 'blocks', PN = Object.fromEntries(CB_PART.map(x => [x[0], x[1]]));
        h += `<div class="pp-cbparts"><b>고른 상자의 부분<em>위가 앞 · 눌러서 고르기</em></b>${CB_PART.map(([k, n, o]) => `<button type="button" data-cbpart="${k}" class="${cur === k ? 'on' : ''}${(PO[k] || []).length ? '' : ' empty'}"><span>${n}</span><small>${o}</small><i>${(PO[k] || []).length ? '기능 ' + PO[k].length : '비어 있음'}</i></button>`).join('')}</div>`;
        h += `<h4>🧩 ${PN[cur]} 기능 (${A.length})<em>위가 앞 · 눌러서 열기</em></h4>`;
        if (!A.length) h += `<p class="pp-hint">${cur === 'blocks' ? '왼쪽 기능 상자에서 기능을 눌러 보세요' : `✨ ${PN[cur]}는 본체에 붙는 작은 상자예요 · 기능을 넣으면 생겨요<br>처음엔 본체와 같은 크기로 겹쳐요 → ✨ 장식 상자 묶음의 폭 · 높이 · 왼쪽에서 · 위에서로 자리를 정하고 · 바탕색이나 장식 글자로 보이게 해요`}</p>`;
        h += A.map((c, i) => cbCard(c, i, A.length)).join('');
        h += `<div class="r"><span>코드</span><div><button type="button" data-cbq="code" class="${P.cbCode ? 'on' : ''}">👩‍💻 ${P.cbCode ? '코드 숨기기' : '진짜 CSS 코드 보기'}</button></div></div>${P.cbCode ? `<pre class="pp-cbcode">${esc(CB.cssText(L))}</pre>` : ''}<input type="file" accept="image/*" id="ppCbFile" hidden>`;
        return h;
    }
    function cbProp(e, L) {                                                     // true = 블록 칸에서 처리했어요
        const t = e.target, Cof = id => cbAll(L).find(c => c.id === id), code = () => { if (P.cbCode) { const c = $('ppProp').querySelector('.pp-cbcode'); if (c) c.textContent = CB.cssText(L); } };
        if (t.id === 'ppCbFile') { if (e.type !== 'input') return true; const f = t.files && t.files[0]; t.value = ''; if (f) cbImg(L, f); return true; }
        if (e.type === 'input') {
            if (L.lock) { say('🔒 잠긴 레이어예요'); paintProps(); return true; }
            if (t.dataset.cbly) { if (t.value) lyPick(t, L, cbAll(L)); return true; }
            const now = Date.now(), hist = () => { if (now - propH > 800) histSt(); propH = now; };
            if (t.dataset.cbx) { hist(); L.box[t.dataset.cbx] = +t.value / 100; t.nextElementSibling.textContent = t.value + '%'; L.dirtyV = true; P.dirty = true; renderAll(); return true; }
            if (t.dataset.cbtext) { hist(); L.text = t.value; L.dirtyV = true; P.dirty = true; renderAll(); code(); return true; }
            if (t.dataset.cbntext) { hist(); const n = cbNode(L); if (n) n.text = t.value; L.dirtyV = true; P.dirty = true; renderAll(); code(); return true; }
            if (t.dataset.cbnm) { hist(); cbRename(L, t.value); L.dirtyV = true; P.dirty = true; renderAll(); code(); const tr = $('ppProp').querySelector('.pp-cbtree'); if (tr) { clearTimeout(P.cbNmT); P.cbNmT = setTimeout(() => { const a = document.activeElement, keep = a && a.dataset && a.dataset.cbnm; paintProps(); if (keep) { const i = $('ppProp').querySelector('[data-cbnm]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } }, 500); } return true; }
            if (t.dataset.cf) { const [id, path] = t.dataset.cf.split('|'), c = Cof(id); if (!c) return true; hist();
                const v = t.type === 'checkbox' ? t.checked : (t.type === 'range' || t.type === 'number') ? (isFinite(+t.value) ? +t.value : 0) : t.value;
                CB.set(c, path, v); $('ppProp').querySelectorAll(`[data-cf="${t.dataset.cf}"]`).forEach(o => { if (o !== t) o.value = t.value; });
                if (t.dataset.kfp) { const K = CB.KP[v]; CB.set(c, path.replace(/\.p$/, '.v'), CB.clone(K[3])); paintProps(); }
                L.dirtyV = true; P.dirty = true; renderAll(); thumbsSoon(); code();
                if (t.tagName === 'SELECT' && /\.u$/.test(path)) paintProps();
                return true; }
            return false;
        }
        if (e.type !== 'click') return false;
        const sm = t.closest('summary');                                       // 접기 · 펴기 = 기억 (다시 그려도 그대로)
        if (sm && sm.dataset.cbfold) { P.cbBox = !sm.parentElement.open; return true; }
        if (sm && sm.dataset.cblay) { const id = sm.dataset.cblay, A = P.cbLay = P.cbLay || []; if (sm.parentElement.open) { const i = A.indexOf(id); if (i >= 0) A.splice(i, 1); } else A.push(id); return true; }
        const b = t.closest('button'); if (!b) return false; const ds = b.dataset;
        if (ds.cbo) { P.cbOpen = P.cbOpen === ds.cbo ? null : ds.cbo; paintProps(); return true; }
        if (ds.cbpart) { P.cbPart = ds.cbpart; paintProps(); drawOv(); return true; }
        if (ds.cbnode) { P.cbNode = ds.cbnode; P.cbPart = 'blocks'; P.cbOpen = null; paintProps(); drawOv(); return true; }
        if (ds.cbt) { if (L.lock) { say('🔒 잠긴 레이어예요'); return true; } histSt(); cbTreeAct(L, ds.cbt); L.dirtyV = true; P.dirty = true; renderAll(); paintProps(); drawOv(); return true; }
        if (ds.cbq === 'code') { P.cbCode = !P.cbCode; paintProps(); return true; }
        if (L.lock && (ds.cbq || ds.cba || ds.cbimg || ds.cbst || ds.cbrm || ds.cbpt)) { say('🔒 잠긴 레이어예요'); return true; }
        if (ds.cbq === 'full' || ds.cbq === 'center') { histSt(); if (ds.cbq === 'full') L.box = { x: 0, y: 0, w: 1, h: 1 }; else { L.box.x = (1 - L.box.w) / 2; L.box.y = (1 - L.box.h) / 2; } }
        else if (ds.cba) { const A = cbPart(L), i = A.findIndex(c => c.id === ds.i); if (i < 0) return true; histSt();
            if (ds.cba === 'on') A[i].on = !A[i].on; if (ds.cba === 'up' && i > 0) [A[i - 1], A[i]] = [A[i], A[i - 1]]; if (ds.cba === 'down' && i < A.length - 1) [A[i + 1], A[i]] = [A[i], A[i + 1]];
            if (ds.cba === 'dup') { const N = CB.clone(A[i]); N.id = CB.fresh('opacity').id; A.splice(i, 0, N); P.cbOpen = N.id; }
            if (ds.cba === 'del') A.splice(i, 1); }
        else if (ds.cbst || ds.cbrm || ds.cbpt) { const [id, path] = (ds.cbst || ds.cbrm || ds.cbpt).split('|'), c = Cof(id); if (!c) return true; histSt();
            if (ds.cbst) { const s = CB.get(c, path); s.push(CB.clone(s[s.length - 1])); }
            if (ds.cbpt) CB.get(c, path).push([50, 50]);
            if (ds.cbrm) { const ps = path.split('.'), j = +ps.pop(); CB.get(c, ps.join('.')).splice(j, 1); } }
        else if (ds.cbimg) { P.cbImgFor = ds.cbimg; const f = $('ppCbFile'); if (f) f.click(); return true; }
        else return false;
        L.dirtyV = true; P.dirty = true; renderAll(); paintLayers(); paintProps(); return true;
    }
    /* ================= 🌀 svg 블록 레이어 (도련 11-18 · 1296 · js/svgblocks.js) : 왼쪽 = ⬛ 도형 넣기 + 블록 상자 (svg 공식 기능) · 오른쪽 = 도형 목록 · 고른 도형의 블록 · 👩‍💻 svg 코드 ================= */
    const sbAll = L => [].concat(L.els || [], ...(L.els || []).map(e => e.b || []));
    const sbEl = L => (L.els || []).find(e => e.id === P.sbSel);
    function sbTools() {
        $('ppToolT').innerHTML = '🌀 SVG 기능 상자<em>도형을 넣고 · 고른 도형에 붙여요</em>';
        const tile = (a, e, n, tt, q) => `<button type="button" ${a} data-q="${esc(q.toLowerCase())}" title="${esc(tt)}">${e}<small>${esc(n)}</small></button>`;
        $('ppTools').innerHTML = KIND_TIP() + `<div class="pp-cbg"><b>⬛ 도형 넣기<em>SVG 요소</em></b><div class="pp-cbs">${Object.keys(SB.EL).map(k => tile(`data-sbel="${k}"`, SB.EL[k].e, SB.EL[k].n, 'SVG 공식 요소 : <' + k + '>', SB.EL[k].n + ' ' + k)).join('')}</div></div>`
            + SB.GROUPS.map(([g, ks]) => [g, ks.filter(k => !(P.still && SB.BL[k].an))]).filter(([g, ks]) => ks.length).map(([g, ks]) => `<div class="pp-cbg"><b>${g}</b><div class="pp-cbs">${ks.map(k => tile(`data-sbb="${k}"`, SB.BL[k].e, SB.BL[k].n, 'SVG 공식 기능 : ' + SB.BL[k].o, SB.BL[k].n + ' ' + SB.BL[k].o)).join('')}</div></div>`).join('');
        $('ppOpt').innerHTML = '<p class="pp-hint">⬛ 도형을 넣고 → 오른쪽에서 도형을 골라 → 기능을 붙여요<br>✋ 종이 위를 끌면 고른 도형이 옮겨져요<br>🪄 필터는 위에서부터 차례로 · 1번 결과 · 2번 결과 … 를 이어 써요</p>';
    }
    function sbLayer() { if (P.cur && P.cur.type === 'svg') return P.cur; const L = addLayer('svg', lyName('svg')); P.cur = L; return L; }
    function sbAddEl(t) {
        const el = SB.freshEl(t, P.W, P.H); if (!el) return; commitFloat(); penEnd();
        if (P.cur && P.cur.type === 'svg' && P.cur.lock) { say('🔒 잠긴 레이어예요'); return; }
        histSt(); const L = sbLayer(); if (t === 'use') { const o = L.els[0]; if (o) el.v.ref = o.id; else { say('🪞 먼저 찍을 도형을 넣어요'); return; } }
        L.els.unshift(el); P.sbSel = el.id; P.sbOpen = null; P.rTab = 'bk'; L.dirtyV = true; P.dirty = true;
        if (t === 'image' && !P.tour) setTimeout(() => { P.cbImgFor = el.id; const f = $('ppCbFile'); if (f) f.click(); }, 60);
        renderAll(); paintLayers(); paintProps(); sbTools();
    }
    function sbAddB(t) {
        const L = P.cur && P.cur.type === 'svg' ? P.cur : null, el = L && sbEl(L); if (!el) { say('⬛ 먼저 도형을 넣거나 오른쪽에서 골라요'); return; } if (L.lock) { say('🔒 잠긴 레이어예요'); return; }
        const B = SB.freshB(t, P.W, P.H); if (!B) return; histSt();
        if (SB.BL[t].fx) { let at = 0; el.b.forEach((x, i) => { if (SB.BL[x.t].fx) at = i + 1; }); if (!at) at = el.b.length; el.b.splice(at, 0, B); } else el.b.unshift(B);
        P.sbOpen = B.id; L.dirtyV = true; P.dirty = true;
        if (t === 'feImage' && !P.tour) setTimeout(() => { P.cbImgFor = B.id; const f = $('ppCbFile'); if (f) f.click(); }, 60);
        renderAll(); paintProps();
    }
    function sbSpec(spec, ins, els, ans) {                                     // 범위 W · H · 필터 입력 · use 대상 · 앞 움직임
        const R = x => x === 'W' ? P.W : x === 'H' ? P.H : x === '-W' ? -P.W : x === '-H' ? -P.H : x;
        return spec.map(([k, lb, t, o]) => [k, lb, t, o === 'IN' ? ins : o === 'ELS' ? (els || ['']) : o === 'ANS' ? (ans || ['']) : Array.isArray(o) ? o.map(R) : o]);
    }
    function sbPanel(L) {
        const E = L.els, sel = sbEl(L) || E[0]; if (sel) P.sbSel = sel.id;
        P.kox = Object.assign({}, SB.KO, { '': '없음' }); E.forEach((e, i) => { P.kox[e.id] = `${SB.EL[e.t].e} ${SB.EL[e.t].n} (${i + 1}번째)`; });
        const ANS = [''].concat(...E.map((e, i) => (e.b || []).filter(B => SB.BL[B.t] && ['animate', 'animateTransform', 'animateMotion', 'set'].includes(B.t)).map(B => { P.kox[B.id] = `${i + 1}번째 ${SB.EL[e.t].n} · ${SB.BL[B.t].n}`; return B.id; })));
        const ctl = (k, id, i, n, on, eid) => `<button type="button" data-sba="on" data-k="${k}" data-i="${id}" data-e="${eid || ''}" title="켜기 · 끄기">${on ? '👁' : '◌'}</button><button type="button" data-sba="up" data-k="${k}" data-i="${id}" data-e="${eid || ''}" title="앞으로"${i ? '' : ' disabled'}>▲</button><button type="button" data-sba="down" data-k="${k}" data-i="${id}" data-e="${eid || ''}" title="뒤로"${i < n - 1 ? '' : ' disabled'}>▼</button><button type="button" data-sba="dup" data-k="${k}" data-i="${id}" data-e="${eid || ''}" title="복제">⧉</button><button type="button" data-sba="del" data-k="${k}" data-i="${id}" data-e="${eid || ''}" title="빼기">✕</button>`;
        let h = `<h4>⬛ 도형 (${E.length})<em>위가 앞 · 눌러서 고르기</em></h4>`;
        if (!E.length) h += '<p class="pp-hint">왼쪽 ⬛ 도형 넣기에서 도형을 눌러 보세요</p>';
        h += E.map((e, i) => { const D = SB.EL[e.t], on = e.id === P.sbSel; let fx = 0;
            const blocks = on ? e.b.map((B, j) => { const BD = SB.BL[B.t], ins = ['prev', 'SourceGraphic', 'SourceAlpha'].concat(e.b.slice(0, j).filter(x => SB.BL[x.t].fx).map((x, q) => 'r' + (q + 1))), num = BD.fx ? ++fx : 0, op = P.sbOpen === B.id;
                return `<div class="pp-cbk sb${B.on ? '' : ' off'}${op ? ' open' : ''}${BD.fx ? ' fx' : ''}"><div class="pp-cbh">${num ? `<em class="pp-no">${num}</em>` : ''}<button type="button" class="nm" data-sbo="${B.id}"><span>${BD.e} ${esc(BD.n)}</span><small>${esc(BD.o)}</small></button>${ctl('b', B.id, j, e.b.length, B.on, e.id)}</div>${op ? `<div class="pp-cbf">${BD.f.length ? cbFields(B.id, sbSpec(BD.f, ins, [''].concat(E.filter(x => x.id !== e.id).map(x => x.id)), ANS.filter(x => x !== B.id)), B.v, 'v') : '<p class="pp-hint">칸 없음 · 켜 두면 돼요</p>'}</div>` : ''}</div>`; }).join('') : '';
            return `<div class="pp-cbk sbe${e.on ? '' : ' off'}${on ? ' open picked' : ''}"><div class="pp-cbh"><button type="button" class="nm" data-sbsel="${e.id}"><span>${D.e} ${esc(D.n)}</span><small>&lt;${e.t}&gt;${on ? '' : ' · 기능 ' + e.b.length}</small></button>${ctl('e', e.id, i, E.length, e.on)}</div>
                ${on ? `<div class="pp-cbf">${cbFields(e.id, sbSpec(D.f, [], [''].concat(E.filter(x => x.id !== e.id).map(x => x.id)), ), e.v, 'v')}<details class="pp-in"><summary>✋ 끌어 옮긴 만큼 (translate)</summary>${cbFields(e.id, sbSpec([['x', '가로', 'num', ['-W', 'W', 1]], ['y', '세로', 'num', ['-H', 'H', 1]]]), e.mv, 'mv')}</details>
                    <div class="pp-sbbl">${blocks || '<p class="pp-hint">왼쪽 기능 상자에서 기능을 눌러 이 도형에 붙여요</p>'}</div></div>` : ''}</div>`; }).join('');
        h += `<div class="r"><span>코드</span><div><button type="button" data-sbq="code" class="${P.sbCode ? 'on' : ''}">👩‍💻 ${P.sbCode ? '코드 숨기기' : '진짜 SVG 코드 보기'}</button></div></div>${P.sbCode ? `<pre class="pp-cbcode">${esc(SB.svgText(L, P.W, P.H))}</pre>` : ''}<input type="file" accept="image/*" id="ppCbFile" hidden>`;
        P.kox = null; return h;
    }
    function sbProp(e, L) {
        const t = e.target, find = id => sbAll(L).find(c => c.id === id), code = () => { if (P.sbCode) { const c = $('ppProp').querySelector('.pp-cbcode'); if (c) c.textContent = SB.svgText(L, P.W, P.H); } };
        if (t.id === 'ppCbFile') { if (e.type !== 'input') return true; const f = t.files && t.files[0]; t.value = ''; if (f) cbImg(L, f); return true; }
        if (e.type === 'input') {
            if (t.dataset.cbly) { if (!L.lock && t.value) lyPick(t, L, sbAll(L)); return true; }
            if (!t.dataset.cf) return false; if (L.lock) { say('🔒 잠긴 레이어예요'); paintProps(); return true; }
            const now = Date.now(); if (now - propH > 800) histSt(); propH = now;
            const [id, path] = t.dataset.cf.split('|'), c = find(id); if (!c) return true;
            const v = t.type === 'checkbox' ? t.checked : (t.type === 'range' || t.type === 'number') ? (isFinite(+t.value) ? +t.value : 0) : t.value;
            CB.set(c, path, v); $('ppProp').querySelectorAll(`[data-cf="${t.dataset.cf}"]`).forEach(o => { if (o !== t) o.value = t.value; });
            L.dirtyV = true; P.dirty = true; renderAll(); thumbsSoon(); code(); return true;
        }
        if (e.type !== 'click') return false;
        const b = t.closest('button'); if (!b) return false; const ds = b.dataset;
        if (ds.sbsel) { P.sbSel = ds.sbsel; P.sbOpen = null; paintProps(); return true; }
        if (ds.sbo) { P.sbOpen = P.sbOpen === ds.sbo ? null : ds.sbo; paintProps(); return true; }
        if (ds.sbq === 'code') { P.sbCode = !P.sbCode; paintProps(); return true; }
        if (L.lock && (ds.sba || ds.cbst || ds.cbrm || ds.cbpt || ds.cbimg)) { say('🔒 잠긴 레이어예요'); return true; }
        if (ds.sba) { histSt(); const A = ds.k === 'e' ? L.els : (L.els.find(x => x.id === ds.e) || { b: [] }).b, i = A.findIndex(x => x.id === ds.i); if (i < 0) return true;
            if (ds.sba === 'on') A[i].on = !A[i].on; if (ds.sba === 'up' && i > 0) [A[i - 1], A[i]] = [A[i], A[i - 1]]; if (ds.sba === 'down' && i < A.length - 1) [A[i + 1], A[i]] = [A[i], A[i + 1]];
            if (ds.sba === 'dup') { const N = SB.clone(A[i]); N.id = SB.freshB('fill').id; if (N.b) N.b.forEach(x => { x.id = SB.freshB('fill').id; }); A.splice(i, 0, N); if (ds.k === 'e') P.sbSel = N.id; else P.sbOpen = N.id; }
            if (ds.sba === 'del') { A.splice(i, 1); if (ds.k === 'e') L.els.forEach(x => { if (x.t === 'use' && x.v.ref === ds.i) x.v.ref = ''; }); } }
        else if (ds.cbst || ds.cbrm || ds.cbpt) { const [id, path] = (ds.cbst || ds.cbrm || ds.cbpt).split('|'), c = find(id); if (!c) return true; histSt();
            if (ds.cbst) { const s = CB.get(c, path); s.push(CB.clone(s[s.length - 1])); }
            if (ds.cbpt) CB.get(c, path).push([Math.round(P.W / 2), Math.round(P.H / 2)]);
            if (ds.cbrm) { const ps = path.split('.'), j = +ps.pop(); CB.get(c, ps.join('.')).splice(j, 1); } }
        else if (ds.cbimg) { P.cbImgFor = ds.cbimg; const f = $('ppCbFile'); if (f) f.click(); return true; }
        else return false;
        L.dirtyV = true; P.dirty = true; renderAll(); paintLayers(); paintProps(); return true;
    }
    function cbImg(L, f) {                                                      // 🖼️ 그림 깔기 url() : 긴 쪽 1600px 까지 줄여 블록 안에 (임시저장에도 같이)
        const u = URL.createObjectURL(f), im = new Image();
        im.onload = () => {
            URL.revokeObjectURL(u); const k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = mkCv(Math.round(im.width * k), Math.round(im.height * k)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            const src = /png|gif|webp|svg/.test(f.type) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .9);
            const all = L.type === 'svg' ? sbAll(L) : cbAll(L), B = all.find(x => x.id === P.cbImgFor) || all.find(x => /url$/.test(x.t) && !x.v.src); P.cbImgFor = null;
            if (!B) return; histSt(); B.v.src = src; L.dirtyV = true; P.dirty = true; renderAll(); paintProps(); thumbsSoon();
        };
        im.onerror = () => { URL.revokeObjectURL(u); say('그림을 열 수 없어요'); }; im.src = u;
    }
    /* ---------- 📎 사진 ---------- */
    function addPhoto(f) {
        const u = URL.createObjectURL(f), im = new Image();
        im.onload = () => { histSt(); const at = P.layers.findIndex(l => l.type !== 'paper'); const L = addLayer('photo', '사진', Object.assign({ img: im, s: 1, ox: 0, oy: 0, wash: 0, op: 1 }, P.kind === 'seal' || P.kind === 'piece' ? { fit: 'c' } : {}), at < 0 ? P.layers.length : at); photoPaint(L); P.cur = L; P.dirty = true; if (P.mode === 'px') setTool('move'); renderAll(); paintLayers(); paintProps(); say('📎 사진 레이어 · ✋ 옮기기 · 오른쪽에서 크기 · 연하게', 2400); };
        im.onerror = () => { URL.revokeObjectURL(u); if (window.showMsg) showMsg('사진을 열지 못했어요.'); };
        im.src = u;
    }
    /* ================= 🏷️ 씰스티커 (도련 11-14) ================= */
    const SEAL_SZ = { tall: ['세로', 700, 1000], wide: ['가로', 1000, 700], square: ['정사각', 860, 860] };   // [이름, 종이 px 가로, 세로]
    const PAPER_SZ = { tall: ['세로', 720, 960], square: ['정사각', 720, 720], long: ['길쭉', 720, 1200] }, PAPER_K = .5;   // 📄 모조지 가로 720 = 페이지 360px (js/papermaker.js PM_W · 두 배로 선명하게)
    const SZT = () => P.kind === 'paper' ? PAPER_SZ : SEAL_SZ;
    const szMm = v => P.kind === 'paper' ? `${Math.round(v[1] * PAPER_K * sealPh() / 644)} × ${Math.round(v[2] * PAPER_K * sealPh() / 644)}mm` : `${Math.round(sealPh() * v[1] / v[2])} × ${sealPh()}mm`;
    /* 📏 씰 시트 세로 644px = 148mm (js/stickerpeel.js PEL_SHEET_H · 스티커 그림 기준 1mm ≈ 4.35px · 떼어 붙이면 실제 크기 비율) → 1mm = P.H / 148 */
    const mmOf = s => +String(s || '').split(/[×x*]/)[1] || 0;
    const sealPh = () => 148;                                                // 📏 시트 그림 644px = 148mm (A6 · 1mm ≈ 4.35px · 다이어리 규격과 상관없이 · js/skins.js STK_MM · 도련 11-16 실제 크기 비율)
    function sealPastePop() {                                                  // 📔 다이어리에 붙여 보기 (도련 11-14 : 내 씰이 다이어리에서 얼마나 큰지)
        let pop = $('ppSpecPop'); if (pop) { pop.remove(); return; }
        commitFloat(); penEnd();
        const L = specList(); if (!L.length) { say('📔 붙여 볼 다이어리가 아직 없어요'); return; }
        const PA = P.kind === 'paper', PC = P.kind === 'piece', cut = PA ? [(() => { const c = mkCv(P.W, P.H), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, P.W, P.H); compose(x, false); return cvUrl(c, PAPER_K); })()] : PC ? P.pcs.concat(pieceOne() || []) : sealOut(); if (!cut.length) { say(PC ? '🧩 먼저 조각을 그려 주세요' : '🏷️ 먼저 시트에 그림을 그려 주세요'); return; }
        const cur = { id: curId() }, all = L.flatMap(g => g.items);
        let pick = (P.spec && all.find(i => i.id === P.spec.id)) || all.find(i => i.id === cur.id) || all[0], at = 'r';
        pop = document.createElement('div'); pop.id = 'ppSpecPop'; pop.className = 'pp-pop pp-specpop';
        pop.innerHTML = `<div class="pp-pop-h"><b>📔 다이어리에 ${PA ? '놓아' : '붙여'} 보기</b><button type="button" class="win-x" aria-label="닫기">✕</button></div>
            <div class="pp-sp-b"><div class="pp-sp-l" id="ppSpL">${L.map(g => `<div class="pp-sg"><div class="pp-sg-h"><b>${esc(g.n)}</b><small>${esc(g.mm)}mm</small></div>
                <div class="pp-sg-i">${g.items.map(i => `<button type="button" data-sp="${esc(i.id)}"><i style="background:${esc(i.bd)}"></i>${esc(i.name)}${i.id === cur.id ? '<u>펼친 다이어리</u>' : ''}</button>`).join('')}</div></div>`).join('')}</div>
            <div class="pp-sp-r"><p class="pp-sp-h">${PA ? '📄 모조지 한 장을 <b>실제 크기 비율</b>로 다이어리 위에 놓아 봤어요 · ✂️ 오린 만큼 붙어요' : `${PC ? '🧩 봉투에서 꺼내 붙이면' : '🏷️ 시트에서 떼어 붙이면'} <b>이 크기 그대로</b> 다이어리에 붙어요`}</p><div class="pp-bkw" id="ppBk"></div><p class="pp-sp-t" id="ppSpT"></p>
            <div class="pp-sl-at" id="ppSlAt"><button type="button" data-at="l">◀ 왼쪽 쪽</button><button type="button" data-at="r" class="on">오른쪽 쪽 ▶</button></div></div></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        const show = () => {
            const g = L.find(x => x.items.includes(pick)), ph = mmOf(g.mm) || 148, pw = +String(g.mm).split(/[×x*]/)[0] || 105;
            pop.querySelectorAll('[data-sp]').forEach(b => b.classList.toggle('on', b.dataset.sp === pick.id));
            let H = 300, W = Math.round(H / pick.r); const WM = Math.min(470, innerWidth - 64); if (W > WM) { W = WM; H = Math.round(W * pick.r); }   /* 📱 폰 = 화면 안으로 */
            const SH = H * 644 / 700 * 148 / ph, top = H * 52 / 700, SW = SH * P.W / P.H, cx = W * (at === 'r' ? .75 : .25);   // 📏 시트 세로 148mm : 쪽 세로 ph mm (실제 크기 비율 · 도련 11-16 · 예전 = 시트 세로 = 쪽)
            const kp = SH / PG_PX;                                             // 페이지 px → 미리보기 px
            let st = '';
            if (PA) { const o = cut[0], w = o.wh[0] * kp, h = o.wh[1] * kp;   // 📄 쪽 가운데에 한 장 (살짝 비스듬히)
                st = `<img class="pp-paon" src="${o.u}" alt="" style="left:${(cx - w / 2).toFixed(1)}px;top:${(top + Math.max(0, (SH - h) / 2)).toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px">`; }
            else if (PC) {                                                     // 🧩 조각 = 쪽 위에 나란히 (넘치면 다음 줄)
                let x = (at === 'r' ? W / 2 : 0) + 14 * kp + 8, y = top + 30 * kp, rh = 0; const xe = (at === 'r' ? W : W / 2) - 8;
                cut.forEach(o => { const w = o.wh[0] * kp, h = o.wh[1] * kp; if (x + w > xe && rh) { x = (at === 'r' ? W / 2 : 0) + 14 * kp + 8; y += rh + 8; rh = 0; }
                    st += `<img src="${o.u}" alt="" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px">`; x += w + 8; rh = Math.max(rh, h); });
            } else st = cut.map(o => `<img src="${o.u}" alt="" style="left:${(cx - SW / 2 + o.b[0] * SW).toFixed(1)}px;top:${(top + o.b[1] * SH).toFixed(1)}px;width:${(o.b[2] * SW).toFixed(1)}px;height:${(o.b[3] * SH).toFixed(1)}px">`).join('');
            $('ppBk').innerHTML = `<div class="pp-bk b-${pick.b}" style="--bd:${esc(pick.bd)};--pg:${esc(pick.pg)};--w:${W}px;--h:${H}px"><div class="pp-sprd pp-sprd-0"></div><i class="pp-bind"></i>
                <div class="pp-slon" style="width:${W}px;height:${H}px">${PC || PA ? '' : `<i class="pp-slsh" style="left:${(cx - SW / 2).toFixed(1)}px;top:${top.toFixed(1)}px;width:${SW.toFixed(1)}px;height:${SH.toFixed(1)}px"></i>`}${st}</div></div>`;
            const mm = 148 / PG_PX, big = cut.reduce((m, o) => o.wh[0] * o.wh[1] > m[0] * m[1] ? o.wh : m, [0, 0]);   // 그림 px = 페이지 px
            if (PA) { const v = cut[0].wh; $('ppSpT').innerHTML = `<b>${esc(pick.name)}</b> · 한 쪽 ${esc(g.mm)}mm<br>모조지 한 장 약 <b>${Math.round(v[0] * mm)} × ${Math.round(v[1] * mm)}mm</b>` + (v[1] * mm > ph ? '<br><span style="color:#c2457a">⚠ 모조지가 한 쪽보다 길어요</span>' : ''); return; }
            $('ppSpT').innerHTML = `<b>${esc(pick.name)}</b> · 한 쪽 ${esc(g.mm)}mm<br>${PC ? '조각 ' + cut.length + '개' : '스티커 ' + cut.length + '장'} · 가장 큰 것 약 <b>${Math.round(big[0] * mm)} × ${Math.round(big[1] * mm)}mm</b>`
                + (PC ? '' : (SW > W / 2 + 1 ? '<br><span style="color:#c2457a">⚠ 시트가 한 쪽보다 넓어요 (떼어서 나눠 붙여요)</span>' : '') + '<br><span style="font-size:11px;color:#8a6a76">점선 = 씰 시트 한 장 (세로 148mm · 실제 크기 비율)</span>');
        };
        $('ppSpL').onclick = e => { const b = e.target.closest('[data-sp]'); if (!b) return; pick = all.find(i => i.id === b.dataset.sp) || pick; const g = L.find(x => x.items.includes(pick)); P.spec = { n: g.n, mm: g.mm, r: pick.r, id: pick.id }; specBtn(); show(); };
        $('ppSlAt').onclick = e => { const b = e.target.closest('[data-at]'); if (!b) return; at = b.dataset.at; pop.querySelectorAll('[data-at]').forEach(x => x.classList.toggle('on', x === b)); show(); };
        show();
    }
    function sealPop() {
        let pop = $('ppSizePop'); if (pop) { pop.remove(); return; }
        commitFloat(); penEnd();
        pop = document.createElement('div'); pop.id = 'ppSizePop'; pop.className = 'pp-pop pp-sizepop';
        const T = SZT(), NM = P.kind === 'paper' ? '모조지' : '씰';
        pop.innerHTML = `<div class="pp-pop-h"><b>📐 ${NM} 규격</b><button type="button" class="win-x" aria-label="닫기">✕</button></div>
            <div class="pp-sz-b"><div class="pp-sz-l">${Object.entries(T).map(([k, v]) => `<button type="button" data-sz="${k}" class="${P.sz === k ? 'on' : ''}"><i style="aspect-ratio:${v[1]} / ${v[2]}"></i><b>${v[0]}</b><small>${szMm(v)}</small></button>`).join('')}</div></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        pop.querySelector('.pp-sz-l').onclick = async e => {
            const b = e.target.closest('[data-sz]'); if (!b || b.dataset.sz === P.sz) return;
            const v = T[b.dataset.sz], has = P.dirty || P.layers.some(l => l.type === 'photo');
            if (has && window.showAsk && !(await showAsk(`📐 ${P.kind === 'paper' ? '모조지' : '시트'}를 <b>${v[0]}</b>(으)로 바꿀까요?<br><span style="font-size:12px;color:#777;">그린 것은 왼쪽 위 기준 그대로 남아요 · 시트 밖으로 나간 곳은 잘려요</span>`, '바꾸기', '그대로'))) return;
            P.sz = b.dataset.sz; resizePaper(v[1], v[2]); pop.remove(); say(`📐 ${v[0]} ${P.kind === 'paper' ? '모조지' : '시트'}예요`);
        };
    }
    /* 🏷️ 내가 만든 스티커 (📸 포토부스 · 📷 디카 · 🔤 라벨 기계 = 서랍의 내가 만든 씰) → 그림 레이어로 */
    async function minePop() {
        let pop = $('ppMinePop'); if (pop) { pop.remove(); return; }
        pop = document.createElement('div'); pop.id = 'ppMinePop'; pop.className = 'pp-pop pp-minepop';
        pop.innerHTML = `<div class="pp-pop-h"><b>🏷️ 내가 만든 스티커</b><button type="button" class="win-x" aria-label="닫기">✕</button></div><div class="pp-mine" id="ppMineG"><p class="pp-hint">꺼내는 중…</p></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        let out = [];
        try {
            const L = ((window.ownList ? await ownList(false, 'seal') : []) || []).filter(e => e.k === 'seal' && e.from === 'mine' && !(e.x && e.x.dz)).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 24);
            for (const e of L) { const r = window.ownSheetImgs ? await ownSheetImgs(e.id) : null; if (r) r.imgs.forEach(u => { if (u) out.push(u); }); if (out.length >= 80) break; }
        } catch (e) { console.warn('🏷️ 내가 만든 스티커', e); }
        const g = $('ppMineG'); if (!g) return;
        g.innerHTML = out.length ? out.map((u, i) => `<button type="button" data-i="${i}"><img src="${esc(u)}" alt="" draggable="false"></button>`).join('')
            : '<p class="pp-hint">아직 내가 만든 스티커가 없어요.<br>책상의 📸 포토부스 · 📷 디카 · 🔤 라벨 기계로 만들어 보세요.</p>';
        g.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; addImgSrc(out[+b.dataset.i], '내 스티커'); pop.remove(); };
    }
    function addImgSrc(src, name) {
        const im = new Image();
        im.onload = () => { histSt(); const at = P.layers.findIndex(l => l.type !== 'paper'); const L = addLayer('photo', name || '그림', { img: im, s: 1, ox: 0, oy: 0, wash: 0, op: 1, fit: 'c' }, at < 0 ? P.layers.length : at); photoPaint(L); P.cur = L; P.dirty = true; if (P.mode === 'px') setTool('move'); renderAll(); paintLayers(); paintProps(); say('🏷️ ✋ 옮기기 · 오른쪽에서 크기', 2000); };
        im.onerror = () => { if (window.showMsg) showMsg('그림을 열지 못했어요.'); };
        im.src = src;
    }
    /* ✅ 완료 : 종이를 뺀 그림에서 떨어져 있는 덩어리마다 스티커 한 장 (하얀 칼선 · 자리 그대로) */
    const SEAL_R = 14, SEAL_GAP = 6;                                           // 칼선 두께 · 이만큼 가까우면 한 장 (그림 px)
    function sealCut(c) {                                                      // 그림 → 둘레를 하얗게 넓힌 스티커 (그림 크기 그대로)
        const pad = SEAL_R + 2, t = mkCv(c.width + pad * 2, c.height + pad * 2); t.getContext('2d').drawImage(c, pad, pad);
        const sil = mkCv(t.width, t.height), sx = sil.getContext('2d'); sx.drawImage(t, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#fff'; sx.fillRect(0, 0, t.width, t.height);
        const o = mkCv(t.width, t.height), x = o.getContext('2d');
        for (let a = 0; a < 32; a++) { const g = a / 32 * Math.PI * 2; for (const r of [SEAL_R, SEAL_R * .6]) x.drawImage(sil, Math.cos(g) * r, Math.sin(g) * r); }
        x.drawImage(sil, 0, 0); x.drawImage(t, 0, 0);
        return { c: o, pad };
    }
    const PG_PX = 644;                                                         // 스티커 그림 148mm = 644px (js/stickerpeel.js PEL_SHEET_H · js/skins.js STK_MM)
    const PIECE_PX = 800, PIECE_K = .5;                                        // 🧩 조각 판 800px = 페이지 400px (선명하게 두 배로 그려요)
    function artRaw() {                                                        // 종이 · 칼선을 뺀 그림 (클리핑 그대로)
        const art = mkCv(P.W, P.H), ax = art.getContext('2d'); let base = null;
        P.layers.forEach(L => { if (L.type === 'paper' || !L.vis) return; let img = layerImg(L); if (L.clip && base) img = mkCv(P.W, P.H), img.getContext('2d').drawImage(clipTo(layerImg(L), base), 0, 0); else if (!L.clip) base = layerImg(L); ax.save(); ax.globalAlpha = L.op; ax.globalCompositeOperation = L.blend || 'source-over'; ax.drawImage(img, 0, 0); ax.restore(); });
        return art;
    }
    function cutMake(art) {                                                    // ✂️ 자동 칼선 = 그림 둘레를 두껍게 (스티커 하얀 테두리)
        const w = P.cut.w, sil = mkCv(P.W, P.H), sx = sil.getContext('2d'); sx.drawImage(art, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = P.cut.c || '#ffffff'; sx.fillRect(0, 0, P.W, P.H);
        const o = mkCv(P.W, P.H), ox = o.getContext('2d'); for (const f of [1, .66, .33]) { const n = Math.max(12, Math.round(w * f)); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ox.drawImage(sil, Math.cos(a) * w * f, Math.sin(a) * w * f); } } ox.drawImage(sil, 0, 0);
        if (P.cut.sh) { const g = mkCv(P.W, P.H), gx = g.getContext('2d'); gx.shadowColor = 'rgba(61,53,82,.35)'; gx.shadowBlur = 10; gx.shadowOffsetY = 5; gx.drawImage(o, 0, 0); return g; }
        return o;
    }
    let cutT = 0; function cutSoon() { clearTimeout(cutT); if (!P.cut || !P.cut.on) { if (P.cutImg) { P.cutImg = null; render(); } return; } cutT = setTimeout(() => { if (!P.on || !P.cut.on) return; P.cutImg = cutMake(artRaw()); render(); }, 220); }
    function artCv() {                                                         // 종이를 뺀 그림 (투명 바탕 · ✂️ 칼선 켜면 그림 밑에)
        const raw = artRaw(); if (!(P.cut && P.cut.on)) return raw;
        const art = mkCv(P.W, P.H), ax = art.getContext('2d'); ax.drawImage(cutMake(raw), 0, 0); ax.drawImage(raw, 0, 0); return art;
    }
    function cvUrl(c, k) {                                                     // k 배로 줄여 굽기 (🗜 js/imgsmall.js 그림 굽기 엔진 · ✅ 완료 때 cvBest 로 한 번 더)
        const s = k !== 1 ? mkCv(Math.max(1, Math.round(c.width * k)), Math.max(1, Math.round(c.height * k))) : c;
        if (s !== c) s.getContext('2d').drawImage(c, 0, 0, s.width, s.height);
        return { u: window.imgBake ? imgBake(s) : s.toDataURL('image/png'), wh: [s.width, s.height], cv: s };
    }
    /* 🗜 ✅ 완료 = 같은 잣대로 가장 작게 (도련 11-17 · 원본 모습 그대로 · 용량은 가장 작게 · js/imgsmall.js imgBakeBest) */
    const cvBest = async c => window.imgBakeBest ? (await imgBakeBest(c)).url : c.toDataURL('image/png');
    async function cvBestAll(L) { for (const o of L) { if (o && o.cv instanceof HTMLCanvasElement) o.u = await cvBest(o.cv); if (o) delete o.cv; } return L; }
    function pieceOne() {                                                      // 🧩 판의 그림 전체 = 조각 하나 (하얀 칼선 · 페이지 크기로)
        const art = artCv(), d = art.getContext('2d').getImageData(0, 0, P.W, P.H).data;
        let x0 = P.W, y0 = P.H, x1 = -1, y1 = -1;
        for (let y = 0; y < P.H; y++) for (let x = 0; x < P.W; x++) if (d[(y * P.W + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) return null;
        const c = mkCv(x1 - x0 + 1, y1 - y0 + 1); c.getContext('2d').drawImage(art, -x0, -y0);
        const pad = SEAL_R + 2; return Object.assign(cvUrl(sealCut(c).c, PIECE_K), { vb: [x0 - pad, y0 - pad, x1 - x0 + 1 + pad * 2, y1 - y0 + 1 + pad * 2] });
    }
    async function pieceBest(one) {                                            // 🧩 조각 하나 = 그림 · svg 중 가볍게 (그리던 판이 있을 때만)
        const img = await cvBest(one.cv); let b = null; try { b = await artSvg({ vb: one.vb, out: one.wh, seal: true }); } catch (e) { console.warn('✨ 조각 svg', e); }
        return pickBest(img, b);
    }
    function pcPaint() {
        const box = $('ppPcs'), n = $('ppPcN'); if (!box) return;
        box.innerHTML = P.pcs.map((o, i) => `<button type="button" class="ipd-pc" data-i="${i}" title="빼기"><img src="${o.u}" alt=""><b>✕</b></button>`).join('') || '<span class="shm-hint">아직 없어요 · 그리고 ➕ 담기</span>';
        if (n) n.textContent = `${P.pcs.length} / 4`;
    }
    async function pcAdd() {
        commitFloat(); penEnd();
        if (P.pcs.length >= 4) { if (window.showMsg) showMsg('🧩 조각은 4개까지 담을 수 있어요.<br><span style="font-size:12px;color:#777;">✅ 완료를 눌러 도안으로 저장해요.</span>'); return; }
        const one = pieceOne(); if (!one) { say('🧩 먼저 조각을 그려 주세요'); return; }
        P.pcs.push(Object.assign({}, one, { u: await pieceBest(one), cv: undefined, vb: undefined }));   // 🗜 담을 때 가장 작게 (그림 · svg 중 · 그림 판은 임시저장(IndexedDB)에 못 넣어서 글로만)
        delete P.pcs[P.pcs.length - 1].cv;
        P.layers = P.layers.filter(l => l.type === 'paper'); P.cur = addLayer('px', '그림 1'); P.hist = []; P.redo = [];   // 담은 조각은 판에서 비워요 (↶ 로 되살리면 두 번 담겨요)
        P.dirty = true; renderAll(); paintLayers(); paintProps(); pcPaint();
        say(`🧩 ${P.pcs.length}번째 조각을 담았어요 · 새 조각을 그려요`, 2000);
        try { await saveDraft(true, true); } catch (e) {}
    }
    function alphaBox(c) {                                                    // 그림이 있는 곳 [x0, y0, x1, y1] (없으면 null)
        if (!c) return null; const W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
        for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        return x1 < 0 ? null : [x0, y0, Math.min(W, x1 + 2), Math.min(H, y1 + 2)];
    }
    async function animBox(L) {                                                // 🎬 움직이는 동안 닿는 곳 (svg 로 한 번 그려 10초를 0.25초마다 재요 · 1324 · 비눗방울이 칸 밖으로 나가지 않게)
        if (!window.SB || !window.CB) return null;
        const D = { defs: [], anim: false, heavy: false, part: false }, K = []; let s = ''; try { s = await layerSvg(L, D, K); } catch (e) { return null; } if (!D.anim || !s) return null;
        const W = P.W, H = P.H, host = document.createElement('div'); host.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1';
        host.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;left:0;top:0">${K.length ? `<style>${K.join('')}</style>` : ''}<defs>${D.defs.join('')}</defs><g>${s}</g></svg>`;
        document.body.appendChild(host); let box = null;
        try {
            const sv = host.firstChild, SV = [...host.querySelectorAll('svg')]; SV.forEach(x => { try { x.pauseAnimations(); } catch (e) { } });   // 안에 든 svg 도 따로 시간을 가져요
            const A = sv.getAnimations ? sv.getAnimations({ subtree: true }) : []; A.forEach(a => { try { a.pause(); } catch (e) { } });
            const G = sv.querySelectorAll('path,circle,ellipse,rect,line,polyline,polygon,text,image,use'), o = sv.getBoundingClientRect(), kx = W / (o.width || W), ky = H / (o.height || H);
            for (let t = 0; t <= 10; t += .25) {
                SV.forEach(x => { try { x.setCurrentTime(t); } catch (e) { } }); A.forEach(a => { try { a.currentTime = t * 1000; } catch (e) { } });
                G.forEach(g => { if (g.closest('defs,clipPath,mask,pattern,marker,symbol')) return; const r = g.getBoundingClientRect(); if (!r.width && !r.height) return; const q = [(r.left - o.left) * kx, (r.top - o.top) * ky, (r.right - o.left) * kx, (r.bottom - o.top) * ky]; box = box ? [Math.min(box[0], q[0]), Math.min(box[1], q[1]), Math.max(box[2], q[2]), Math.max(box[3], q[3])] : q; });
            }
        } catch (e) { box = null; } finally { host.remove(); }
        if (!box) return null; const m = Math.max(4, (box[2] - box[0] + box[3] - box[1]) * (D.heavy ? .08 : .03));   // 흐림 · 일렁임 필터는 조금 더
        return [Math.max(0, box[0] - m), Math.max(0, box[1] - m), Math.min(W, box[2] + m), Math.min(H, box[3] + m)];
    }
    function sealOut(rects) {                                                 // rects = CSS · SVG 레이어 자리 (한 레이어 = 한 장 · 움직이는 범위까지 · 1324)
        const art = artCv(), ax = art.getContext('2d');
        const W = P.W, H = P.H, A = ax.getImageData(0, 0, W, H), d = A.data, S = 2, gw = Math.ceil(W / S), gh = Math.ceil(H / S);
        const on = new Uint8Array(gw * gh);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 16) on[(y / S | 0) * gw + (x / S | 0)] = 1;
        (rects || []).forEach(r => { for (let y = Math.max(0, r[1] / S | 0); y < Math.min(gh, Math.ceil(r[3] / S)); y++) for (let x = Math.max(0, r[0] / S | 0); x < Math.min(gw, Math.ceil(r[2] / S)); x++) on[y * gw + x] = 1; });
        const g = Math.ceil(SEAL_GAP / S), dil = new Uint8Array(gw * gh);                // 가까운 그림은 한 장 (조금 넓혀서 이어 보기)
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (on[y * gw + x]) for (let j = -g; j <= g; j++) for (let i = -g; i <= g; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) dil[yy * gw + xx] = 1; }
        const lab = new Int32Array(gw * gh), boxes = []; let n = 0;
        for (let st = 0; st < gw * gh; st++) {
            if (!dil[st] || lab[st]) continue; n++; const q = [st]; lab[st] = n; let x0 = gw, y0 = gh, x1 = -1, y1 = -1, ink = 0;
            while (q.length) { const p = q.pop(), x = p % gw, y = p / gw | 0; if (on[p]) { ink++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
                for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + i, yy = y + j; if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue; const k = yy * gw + xx; if (dil[k] && !lab[k]) { lab[k] = n; q.push(k); } } }
            if (ink > 2 && x1 >= 0) boxes.push({ n, x0: x0 * S, y0: y0 * S, x1: Math.min(W, (x1 + 1) * S), y1: Math.min(H, (y1 + 1) * S) });
        }
        return boxes.slice(0, 40).map(b => {                                    // 시트 한 장 = 40장까지
            const w = b.x1 - b.x0, h = b.y1 - b.y0, c = mkCv(w, h), cx = c.getContext('2d'), I = cx.createImageData(w, h);
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const X = b.x0 + x, Y = b.y0 + y; if (lab[(Y / S | 0) * gw + (X / S | 0)] !== b.n) continue; const si = (Y * W + X) * 4, di = (y * w + x) * 4; I.data[di] = d[si]; I.data[di + 1] = d[si + 1]; I.data[di + 2] = d[si + 2]; I.data[di + 3] = d[si + 3]; }
            cx.putImageData(I, 0, 0);
            const { c: o, pad } = sealCut(c), { u, wh } = cvUrl(o, PG_PX / H);   // 시트 세로 = 페이지 644px → 떼어 붙여도 시트에서 본 크기 그대로
            return { u, wh, b: [(b.x0 - pad) / W, (b.y0 - pad) / H, (w + pad * 2) / W, (h + pad * 2) / H] };
        });
    }
    async function pageBest(c) {                                              // 📃 한 장 전체 (종이까지) = 그림 · svg 중 가볍게
        const img = await cvBest(c); let b = null; try { b = await artSvg({ paper: true, vb: [0, 0, P.W, P.H], out: [P.W, P.H] }); } catch (e) { console.warn('✨ 한 장 svg', e); }
        return pickBest(img, b);
    }
    async function sealSave() {
        const anim = window.SB && SB.bakeStill ? P.layers.filter(l => l.type === 'svg' && l.vis && SB.hasAnim(l)) : [], keep = anim.map(l => l.cache);   // 🎬 첫 장면이 비어도 자리는 찾게 (움직임을 뺀 모습으로 · 1324)
        for (const l of anim) { try { l.cache = await SB.bakeStill(l, P.W, P.H); l.dirtyV = false; } catch (e) { } }
        const rects = [];                                                     // 🧩 CSS · SVG 레이어 = 그 레이어 그림 전체가 한 장 (글자 · 도장 조각이 나뉘지 않게) + 🎬 움직이는 동안 닿는 곳까지
        for (const l of P.layers) { if (!l.vis || (l.type !== 'css' && l.type !== 'svg')) continue; let r = alphaBox(layerImg(l)); const m = await animBox(l); if (m) r = r ? [Math.min(r[0], m[0]), Math.min(r[1], m[1]), Math.max(r[2], m[2]), Math.max(r[3], m[3])] : m; if (r) rects.push(r); }
        let so; try { so = sealOut(rects); } finally { anim.forEach((l, i) => { l.cache = keep[i]; }); }
        const L = await cvBestAll(so); if (!L.length) { if (window.showMsg) showMsg('시트에 그린 그림이 없어요.'); return false; }
        const W0 = P.W, H0 = P.H, bx = L.map(o => [o.b[0] * W0, o.b[1] * H0, o.b[2] * W0, o.b[3] * H0]);   // ✨ 다른 스티커와 안 겹치는 것만 svg 후보 (겹치면 그림 그대로)
        for (let i = 0; i < L.length; i++) { const a = bx[i]; if (bx.some((q, j) => j !== i && q[0] < a[0] + a[2] && a[0] < q[0] + q[2] && q[1] < a[1] + a[3] && a[1] < q[1] + q[3])) { (P.lastPick = P.lastPick || []).push({ fmt: 'img', why: 'overlap' }); continue; }
            let b = null; try { b = await artSvg({ vb: a, out: L[i].wh, seal: true }); } catch (e) { console.warn('✨ 씰 svg', e); } L[i].u = await pickBest(L[i].u, b); }
        const W = P.W, H = P.H, sbc = mkCv(Math.round(644 * W / H), 644), sx = sbc.getContext('2d'); sx.fillStyle = '#ffffff'; sx.fillRect(0, 0, sbc.width, sbc.height);
        let sb = ''; try { sb = sbc.toDataURL('image/webp', .85); } catch (e) {} if (!/^data:image\/webp/.test(sb)) sb = sbc.toDataURL('image/png');
        const tc = mkCv(Math.round(240 * W / H), 240), t = tc.getContext('2d'); t.fillStyle = '#ffffff'; t.fillRect(0, 0, tc.width, tc.height);
        const ims = await Promise.all(L.map(o => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = o.u; })));
        ims.forEach((im, i) => { if (im) { const b = L[i].b; t.drawImage(im, b[0] * tc.width, b[1] * tc.height, b[2] * tc.width, b[3] * tc.height); } });
        let th = ''; try { th = tc.toDataURL('image/webp', .8); } catch (e) {} if (!/^data:image\/webp/.test(th)) th = tc.toDataURL('image/png');
        await ownAdd({ k: 'seal', from: 'mine', nm: '내가 그린 씰', baked: true, imgs: L.map(o => o.u), wh: L.map(o => o.wh), L: { r: W / H, b: L.map(o => o.b) }, x: { sb } }, { th });
        return L.length;
    }
    /* ================= ✨ 저장 = 그림 · svg 중 가장 가볍게 (도련 11-19 · 아이패드 시험 결과대로)
       사용자는 ✅ 완료만 · 앱이 두 가지를 다 만들어 보고 작은 쪽으로 (움직임이 있으면 svg · 무거운 svg 필터만 있으면 그림)
       svg = 벡터 · svg 블록은 그대로 · 픽셀 · 사진 · css 상자는 96색 그림으로 구워 넣고 움직임은 svg 쪽 (css 상자를 svg 안에 그대로 넣으면 아이패드에서 잘려요)
       간단한 css 상자 (바탕색 · 직선 그라데이션 · 둥근 모서리 · 실선 · 점선 테두리 · 그림자 · 투명도) = svg 네모로 바꿔요 (더 작아요) ================= */
    const SVG_PFX = 'data:image/svg+xml;charset=utf-8,';
    const n1 = v => Math.round((+v || 0) * 10) / 10;
    const xa = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    function cropCv(c) {                                                       // 투명한 둘레 잘라내기 → { c, x, y } (빈 그림 = null)
        const W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
        for (let y = 0; y < H; y++) { const o = y * W * 4; for (let x = 0; x < W; x++) if (d[o + x * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
        if (x1 < 0) return null; const o = mkCv(x1 - x0 + 1, y1 - y0 + 1); o.getContext('2d').drawImage(c, -x0, -y0); return { c: o, x: x0, y: y0 };
    }
    async function cvImg(c) { const r = cropCv(c); if (!r) return ''; return `<image x="${r.x}" y="${r.y}" width="${r.c.width}" height="${r.c.height}" href="${await cvBest(r.c)}"/>`; }
    /* ---- ✒️ 벡터 모양 → svg ---- */
    function vecSvg(L, D) {
        let k = 0; const gid = () => 'v' + L.id + '_' + (k++);
        const paintOf = (s, inv) => { if (!s.fill) return 'none'; if (!s.grad) return s.fill; const b = bbox(s), cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = (s.grad.ang == null ? 90 : s.grad.ang) * Math.PI / 180, R = (Math.abs(b.w * Math.cos(a)) + Math.abs(b.h * Math.sin(a))) / 2, id = gid();
            D.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse"${inv ? ` gradientTransform="${inv}"` : ''} x1="${n1(cx - Math.cos(a) * R)}" y1="${n1(cy - Math.sin(a) * R)}" x2="${n1(cx + Math.cos(a) * R)}" y2="${n1(cy + Math.sin(a) * R)}"><stop offset="0" stop-color="${s.fill}"/><stop offset="1" stop-color="${s.grad.c2 || '#ffffff'}"/></linearGradient>`); return `url(#${id})`; };
        const geo = (s, at) => {                                               // 모양 하나 (칠 · 선은 at)
            if (s.k === 'text') return `<text x="${n1(s.x)}" y="${n1(s.y)}" font-size="${n1(s.fs)}" font-family="Jua,'Gowun Dodum',sans-serif" dominant-baseline="text-before-edge"${s.rot ? ` transform="rotate(${n1(s.rot)} ${n1(s.x)} ${n1(s.y)})"` : ''} ${at}>${xa(s.text)}</text>`;
            if (s.k === 'path') { const a = s.pts; if (!a.length) return ''; const P2 = q => `${n1(q.x)} ${n1(q.y)}`, seg = (u, v) => `C${P2(u.ho || u)} ${P2(v.hi || v)} ${P2(v)}`;
                let d = 'M' + P2(a[0]); for (let i = 1; i < a.length; i++) d += seg(a[i - 1], a[i]); if (s.closed && a.length > 2) d += seg(a[a.length - 1], a[0]) + 'Z'; return `<path d="${d}" ${at}/>`; }
            const w = s.w, h = s.h, cx = s.x + w / 2, cy = s.y + h / 2, tf = `transform="translate(${n1(cx)} ${n1(cy)})${s.rot ? ` rotate(${n1(s.rot)})` : ''}"`, aw = Math.abs(w), ah = Math.abs(h);
            if (s.k === 'rect') { const r = Math.min(s.r || 0, aw / 2, ah / 2); return `<rect x="${n1(-aw / 2)}" y="${n1(-ah / 2)}" width="${n1(aw)}" height="${n1(ah)}"${r ? ` rx="${n1(r)}"` : ''} ${tf} ${at}/>`; }
            if (s.k === 'ellipse') return `<ellipse rx="${n1(aw / 2)}" ry="${n1(ah / 2)}" ${tf} ${at}/>`;
            let d = '';
            if (s.k === 'heart') { const W2 = w / 2, H2 = h / 2; d = `M0 ${n1(H2)}C${n1(-W2 * 1.3)} ${n1(-H2 * .05)} ${n1(-W2 * .9)} ${n1(-H2 * 1.15)} 0 ${n1(-H2 * .45)}C${n1(W2 * .9)} ${n1(-H2 * 1.15)} ${n1(W2 * 1.3)} ${n1(-H2 * .05)} 0 ${n1(H2)}Z`; }
            else { const n = s.k === 'star' ? 10 : Math.max(3, s.n || 6), A = []; for (let i = 0; i < n; i++) { const rr = s.k === 'star' && i % 2 ? .45 : 1, an = -Math.PI / 2 + i * (s.k === 'star' ? Math.PI / 5 : 2 * Math.PI / n); A.push(`${n1(Math.cos(an) * w / 2 * rr)} ${n1(Math.sin(an) * h / 2 * rr)}`); } d = 'M' + A.join('L') + 'Z'; }
            return `<path d="${d}" ${tf} ${at}/>`;
        };
        const sil = (s, fp) => {                                               // 실루엣 (합치기 · 빼기 · 겹친 곳)
            if (s.k === 'group') { if (s.bop === 'none' || s.bop === 'union') return s.items.map(it => sil(it, fp)).join('');
                if (s.bop === 'sub') { const id = gid(); D.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${P.W}" height="${P.H}"><rect width="${P.W}" height="${P.H}" fill="#fff"/>${s.items.slice(1).map(it => sil(it, '#000')).join('')}</mask>`); return `<g mask="url(#${id})">${sil(s.items[0], fp)}</g>`; }
                let g = sil(s.items[0], fp); s.items.slice(1).forEach(it => { const id = gid(); D.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${P.W}" height="${P.H}">${sil(it, '#fff')}</mask>`); g = `<g mask="url(#${id})">${g}</g>`; }); return g; }
            if (s.k === 'path' && !s.closed) return geo(s, `fill="none" stroke="${fp}" stroke-width="${n1(s.sw || 4)}" stroke-linecap="round"`);
            return geo(s, `fill="${fp}"`);
        };
        const one = s => {
            const op = s.op == null || s.op >= 1 ? '' : ` opacity="${n1(s.op * 100) / 100}"`;
            if (s.k === 'group') { if (s.bop === 'none') return `<g${op}>${s.items.map(one).join('')}</g>`;
                const id = gid(); D.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${P.W}" height="${P.H}">${sil(s, '#fff')}</mask>`);   // 합친 모양 = 가리개 · 칠은 종이 전체에 (그라데이션도 그대로)
                return `<rect width="${P.W}" height="${P.H}" fill="${paintOf(s.fill ? s : Object.assign({}, s, { fill: P.color }))}" mask="url(#${id})"${op}/>`; }
            const inv = s.k === 'path' ? '' : s.k === 'text' ? (s.rot ? `rotate(${n1(-s.rot)} ${n1(s.x)} ${n1(s.y)})` : '') : `rotate(${n1(-(s.rot || 0))}) translate(${n1(-(s.x + s.w / 2))} ${n1(-(s.y + s.h / 2))})`;   // 그라데이션은 종이 기준 (모양이 돌아도)
            const st = s.stroke && s.sw > 0, at = [`fill="${paintOf(s, inv)}"`];
            if (st) at.push(`stroke="${s.stroke}" stroke-width="${n1(s.k === 'text' ? s.sw / 2 : s.sw)}"` + (s.k === 'text' ? '' : ` stroke-linecap="${s.cap || 'round'}" stroke-linejoin="${s.cap === 'round' ? 'round' : 'miter'}"`) + (s.dash && s.k !== 'text' ? ` stroke-dasharray="${n1(s.sw * 2)} ${n1(s.sw * 1.6)}"` : ''));
            let o = geo(s, at.join(' ') + op);
            if (s.arrow && s.k === 'path' && s.pts.length > 1 && s.stroke) { const a = s.pts[s.pts.length - 1], b = a.hi || s.pts[s.pts.length - 2], an = Math.atan2(a.y - b.y, a.x - b.x), Ln = Math.max(12, (s.sw || 4) * 3.2);
                o += `<path d="M${n1(a.x + Math.cos(an) * Ln * .3)} ${n1(a.y + Math.sin(an) * Ln * .3)}L${n1(a.x - Math.cos(an - .45) * Ln)} ${n1(a.y - Math.sin(an - .45) * Ln)}L${n1(a.x - Math.cos(an + .45) * Ln)} ${n1(a.y - Math.sin(an + .45) * Ln)}Z" fill="${s.stroke}"${op}/>`; }
            return o;
        };
        const txt = []; const walk = s => { if (s.k === 'text') txt.push(s.text); if (s.items) s.items.forEach(walk); }; L.shapes.forEach(walk);
        return { s: L.shapes.map(one).join(''), text: txt.join('') };
    }
    /* ---- 🧩 css 블록 상자 → svg ---- */
    const CSS_SIMPLE = ['background-color', 'linear-gradient', 'border-radius', 'border', 'opacity', 'shadow', 'animation', 'transform-origin'];
    function cssAnim(L, D, K) {                                                // 🎬 움직임 (돌기 · 크기 · 옮기기 · 진하기만 · 나머지는 첫 장면 그대로)
        const A = CB.expand(L.blocks).filter(c => c.t === 'animation'); let part = false; if (!A.length) return '';
        A.forEach(c => { const at = {}; (c.v.kf || []).forEach(k => { const Dk = CB.KP[k.p]; if (!Dk) return; if (Dk[2] !== 'transform' && Dk[2] !== 'opacity') { part = true; return; } const o = at[k.at] = at[k.at] || {}; o[Dk[2]] = Dk[2] === 'transform' ? ((o.transform ? o.transform + ' ' : '') + Dk[1](k.v)) : Dk[1](k.v); });
            K.push(`@keyframes cbk${c.id}{` + Object.keys(at).sort((a, b) => a - b).map(p => `${p}%{${Object.entries(at[p]).map(([k, v]) => `${k}:${v}`).join(';')}}`).join('') + '}'); });
        if (part) D.part = true;
        return A.map(c => CB.FN.animation.css(c.v, c)).join(',');
    }
    async function cssSvg(L, D, K) {
        const W = P.W, H = P.H, bx = L.box || { x: .15, y: .15, w: .7, h: .7 }, a = bx.x * W, b = bx.y * H, w = Math.max(2, Math.round(bx.w * W)), h = Math.max(2, Math.round(bx.h * H));
        const cards = CB.expand(L.blocks), first = t => cards.find(c => c.t === t), anim = cssAnim(L, D, K), to = first('transform-origin'), ox = to ? to.v.x / 100 : .5, oy = to ? to.v.y / 100 : .5;
        const KA = (L.kids || []).length && CB.bakeWith ? CB.usedCls(L).filter(nm => CB.hasAnim(CB.partsOf(L, { name: nm }))) : [];   // 🌳 안에 든 상자의 움직임 (도련 11-19 · 1324 : 막대사탕 사탕만 돌기) = 그 상자만 따로 굽고 svg 로 움직여요
        const simple = !String(L.text || '').trim() && !(L.kids || []).length && !CB.expand(L.pfl).length && !CB.expand(L.pfn).length && !CB.expand(L.pb).length && !CB.expand(L.pa).length && cards.every(c => CSS_SIMPLE.includes(c.t))
            && cards.filter(c => c.t === 'linear-gradient').every(c => !c.L || (c.L.sz === 'auto' && c.L.rep === 'repeat' && !+c.L.x && !+c.L.y)) && cards.filter(c => c.t === 'shadow').length <= 1 && !(first('shadow') && (first('shadow').v.inset || first('shadow').v.s.n))
            && (!first('border') || ['solid', 'dashed', 'dotted'].includes(first('border').v.s)) && (!first('border-radius') || first('border-radius').v.r.u === 'px' || first('border-radius').v.r.u === '%');
        let inner, gx, gy;
        if (simple) {                                                           // ▣ svg 네모로 그대로
            const R = first('border-radius'), rx = R ? (R.v.r.u === '%' ? w * R.v.r.n / 100 : R.v.r.n) : 0, ry = R ? (R.v.r.u === '%' ? h * R.v.r.n / 100 : R.v.r.n) : 0, rr = `${rx ? ` rx="${n1(Math.min(rx, w / 2))}"` : ''}${ry ? ` ry="${n1(Math.min(ry, h / 2))}"` : ''}`;
            const box = f => `<rect x="${n1(a)}" y="${n1(b)}" width="${w}" height="${h}"${rr} fill="${f}"/>`; let s = '';
            const bg = first('background-color'); if (bg) s += box(CB.SIMPLE['background-color'].css(bg.v));
            cards.filter(c => c.t === 'linear-gradient').reverse().forEach(c => { const an = c.v.ang * Math.PI / 180, Ln = Math.abs(w * Math.sin(an)) + Math.abs(h * Math.cos(an)), cx = a + w / 2, cy = b + h / 2, dx = Math.sin(an) * Ln / 2, dy = -Math.cos(an) * Ln / 2, id = 'cg' + c.id;
                const st = c.v.stops, pos = p => st.u === 'px' ? p / Ln : p / 100; D.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n1(cx - dx)}" y1="${n1(cy - dy)}" x2="${n1(cx + dx)}" y2="${n1(cy + dy)}">${st.s.map(x => `<stop offset="${Math.max(0, Math.min(1, pos(x.p))).toFixed(3)}" stop-color="${x.c.c}"${x.c.a != null && x.c.a < 100 ? ` stop-opacity="${x.c.a / 100}"` : ''}/>`).join('')}</linearGradient>`); s += box(`url(#${id})`); });
            const bd = first('border'); if (bd && bd.v.w.n > 0) { const bw = bd.v.w.n, ds = bd.v.s === 'dashed' ? ` stroke-dasharray="${n1(bw * 3)} ${n1(bw * 2)}"` : bd.v.s === 'dotted' ? ` stroke-dasharray="0 ${n1(bw * 2)}" stroke-linecap="round"` : '', c = bd.v.c;
                s += `<rect x="${n1(a + bw / 2)}" y="${n1(b + bw / 2)}" width="${n1(w - bw)}" height="${n1(h - bw)}"${rx ? ` rx="${n1(Math.max(0, Math.min(rx, w / 2) - bw / 2))}"` : ''}${ry ? ` ry="${n1(Math.max(0, Math.min(ry, h / 2) - bw / 2))}"` : ''} fill="none" stroke="${c.c}"${c.a != null && c.a < 100 ? ` stroke-opacity="${c.a / 100}"` : ''} stroke-width="${bw}"${ds}/>`; }
            const sh = first('shadow'); if (sh) { const id = 'cs' + sh.id, v = sh.v; D.defs.push(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${v.x.n}" dy="${v.y.n}" stdDeviation="${n1(v.b.n / 2)}" flood-color="${v.c.c}" flood-opacity="${(v.c.a == null ? 100 : v.c.a) / 100}"/></filter>`); s = `<g filter="url(#${id})">${s}</g>`; }
            const op = first('opacity'); if (op && op.v.v < 1) s = `<g opacity="${op.v.v}">${s}</g>`;
            inner = s; gx = w * ox; gy = h * oy;
        } else {                                                                // 🔥 그림으로 굽고 (2배 · 사파리 = zoom) → 움직임만 svg 쪽
            const sel = nm => `.cbx .c-${CB.cname(nm)}`;
            const r = KA.length ? await CB.bakeWith(L, w, h, KA.map(nm => `${sel(nm)}{visibility:hidden}`).join('')) : L._cbr; if (!r) return '';   // 움직이는 안쪽 상자는 빼고 구워요
            const cr = cropCv(r.c); if (!cr) return ''; const ix = a - r.M + cr.x, iy = b - r.M + cr.y;
            inner = `<image x="${n1(ix)}" y="${n1(iy)}" width="${cr.c.width}" height="${cr.c.height}" href="${await cvBest(cr.c)}"/>`; gx = a + w * ox - ix; gy = b + h * oy - iy;
            for (const nm of KA) {                                              // 🌳 그 상자만 (나머지는 안 보이게) 굽고 · 그 상자의 움직임을 svg 로
                const q = await CB.bakeWith(L, w, h, `.cbx,.cbx::before,.cbx::after{visibility:hidden}${sel(nm)}{visibility:visible}`); if (!q) continue;
                const qc = cropCv(q.c); if (!qc) continue; const qx = a - q.M + qc.x, qy = b - q.M + qc.y, Pn = CB.partsOf(L, { name: nm }), an = cssAnim(Pn, D, K), qt = CB.expand(Pn.blocks).find(c => c.t === 'transform-origin');
                const img = `<image x="${n1(qx)}" y="${n1(qy)}" width="${qc.c.width}" height="${qc.c.height}" href="${await cvBest(qc.c)}"/>`;
                inner += an ? `<g style="transform-box:fill-box;transform-origin:${n1(qc.c.width * (qt ? qt.v.x / 100 : .5))}px ${n1(qc.c.height * (qt ? qt.v.y / 100 : .5))}px;animation:${an}">${img}</g>` : img;
                if (an) D.anim = true;
            }
        }
        if (anim) { D.anim = true; return `<g style="transform-box:fill-box;transform-origin:${n1(gx)}px ${n1(gy)}px;animation:${anim}">${inner}</g>`; }
        return inner;
    }
    /* ---- 레이어 하나 → svg ---- */
    async function layerSvg(L, D, K) {
        if (L.type === 'vec') { const r = vecSvg(L, D.defs); if (r.text && window.CB) K.push(await CB.faceCss('Jua', r.text)); return r.s; }
        if (L.type === 'svg') { const s = SB.build(L, P.W, P.H, await SB.fontsOf(L)); if (SB.hasAnim(L)) D.anim = true; if (/<fe(Turbulence|DisplacementMap|DiffuseLighting|SpecularLighting|ConvolveMatrix)/.test(s)) D.heavy = true; return s.replace(/^<svg /, '<svg x="0" y="0" '); }
        if (L.type === 'css') return await cssSvg(L, D, K);
        return await cvImg(layerImg(L));                                        // 픽셀 · 사진 = 96색 그림
    }
    async function artSvg(o) {                                                 // o = { paper, vb: [x, y, w, h], out: [w, h], seal } → { svg, anim, heavy, part } · 못 하면 null
        if (!window.SB || !window.CB) return null;
        const D = { defs: [], anim: false, heavy: false, part: false }, K = [], parts = []; let paper = '';
        for (const L of P.layers) {
            if (!L.vis) continue;
            if (L.type === 'paper') { if (o.paper) paper += await cvImg(layerImg(L)); continue; }
            if (L.clip) return null;                                            // 📎 클리핑 = 그림으로
            const s = await layerSvg(L, D, K); if (!s) continue;
            const op = L.op < 1 ? ` opacity="${n1(L.op * 100) / 100}"` : '', bl = L.blend && L.blend !== 'source-over' ? ` style="mix-blend-mode:${L.blend}"` : '';
            parts.push(op || bl ? `<g${op}${bl}>${s}</g>` : s);
        }
        const [vx, vy, vw, vh] = o.vb.map(n1), reg = `filterUnits="userSpaceOnUse" x="${vx}" y="${vy}" width="${vw}" height="${vh}"`;
        let art = parts.join('');
        if (P.cut && P.cut.on) { D.defs.push(`<filter id="mcut" ${reg}><feMorphology in="SourceAlpha" operator="dilate" radius="${P.cut.w}"/><feFlood flood-color="${P.cut.c || '#ffffff'}"/><feComposite in2="${'r0'}" operator="in" result="o"/>${P.cut.sh ? '<feDropShadow in="o" dx="0" dy="5" stdDeviation="5" flood-color="#3d3552" flood-opacity=".35" result="o"/>' : ''}<feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`.replace('radius="' + P.cut.w + '"/>', 'radius="' + P.cut.w + '" result="r0"/>')); art = `<g filter="url(#mcut)">${art}</g>`; }
        if (o.seal) { D.defs.push(`<filter id="mseal" ${reg}><feMorphology in="SourceAlpha" operator="dilate" radius="${SEAL_R}" result="r0"/><feFlood flood-color="#fff"/><feComposite in2="r0" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`); art = `<g filter="url(#mseal)">${art}</g>`; }
        const css = K.join('');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${Math.round(o.out[0])}" height="${Math.round(o.out[1])}" viewBox="${vx} ${vy} ${vw} ${vh}">${css ? `<style>${css}</style>` : ''}${D.defs.length ? `<defs>${D.defs.join('')}</defs>` : ''}${o.paper ? `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>${paper}` : ''}${art}</svg>`;
        return { svg, anim: D.anim, heavy: D.heavy, part: D.part };
    }
    const tmoP = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('time')), ms))]);
    async function pickBest(img, built) {                                      // 그림 url · svg 후보 → 저장할 url (가장 가볍게)
        const rec = { fmt: 'img', img: img.length, svg: 0, anim: false, heavy: false };
        P.lastPick = P.lastPick || []; P.lastPick.push(rec);
        if (!built) { rec.why = 'clip'; return img; }
        const url = SVG_PFX + encodeURIComponent(built.svg); Object.assign(rec, { svg: url.length, anim: built.anim, heavy: built.heavy, part: built.part });
        try { await tmoP(new Promise((ok, no) => { const im = new Image(); im.onload = () => im.naturalWidth ? ok() : no(new Error('svg')); im.onerror = () => no(new Error('svg')); im.src = url; }), 6000); } catch (e) { rec.why = 'load'; console.warn('✨ svg 저장 확인', e); return img; }
        const useSvg = built.anim || (!built.heavy && url.length < img.length * (/<image /.test(built.svg) ? .9 : 1));   // 그림이 든 svg 는 10% 넘게 작을 때만 (다듬기 · 사진틀은 그림만 돼요)
        if (useSvg) { rec.fmt = 'svg'; if (built.anim) P.savedAnim = true; return url; }
        return img;
    }
    /* ================= 🗄️ 서랍에 넣기 ================= */
    async function save() {
        if (P.saving) return;
        if (P.tour) { say('🎓 예시 보기를 먼저 끝내요'); return; }
        commitFloat(); penEnd();
        if (!P.dirty && !(P.pcs && P.pcs.length) && !P.layers.some(l => l.type === 'photo' || (l.type === 'vec' && l.shapes.length) || (l.type === 'css' && cbAll(l).length) || (l.type === 'svg' && l.els.length) || (l.type === 'px' && !isBlank(l.cv)))) { /* 💾 임시저장한 뒤(dirty 아님)에도 그린 게 있으면 넣어요 */ if (window.showMsg) showMsg('먼저 그림을 그리거나 📎 사진을 넣어 주세요.'); return; }
        if (window.dkTrialNoSave && dkTrialNoSave()) return;
        if (!window.ownTake) { if (window.comingSoon) comingSoon('🗄️ 서랍에 넣기'); return; }
        if (window.showAsk && !(await showAsk('✅ 도안을 완료할까요?<br><small style="color:#777;">완료한 도안은 수정할 수 없어요</small>', '✅ 완료', '취소'))) return;   // 도련 11-15 : 완료 · 취소를 고르게
        if (P.saving || !P.on) return;
        const b = $('ppGo'); P.saving = true; b.disabled = true; b.textContent = '💾 저장 중…';
        if (window.CB && P.layers.some(l => l.type === 'css' || l.type === 'svg')) { P.layers.forEach(l => { if (l.type === 'css' || l.type === 'svg') { layerImg(l); } }); await CB.settle(); if (window.SB) await SB.settle(); P.layers.forEach(l => { if (l.type === 'css' || l.type === 'svg') l.dirtyV = true; }); }   // 🧩 브라우저가 블록을 다 그릴 때까지
        P.lastPick = []; P.savedAnim = false;
        const g = gauge(); g(12); await new Promise(r => requestAnimationFrame(() => setTimeout(r, 30)));   // 📊 저장 중 게이지 (도련 11-15 · 다 되면 저절로 닫혀요)
        let ok = false;
        try {
            const c = mkCv(P.W, P.H), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, P.W, P.H); compose(x, false);
            g(35);
            let nSeal = 0; if (window.ownAdd) ownAdd.design = '';
            if (P.kind === 'seal') { if (!window.ownAdd) throw new Error('ownAdd'); nSeal = await sealSave(); if (!nSeal) return; }
            else if (P.kind === 'paper') await ownTake({ k: 'paper', from: 'mine', imgs: [await pageBest(c)] });   // 📄 보이는 그대로 인쇄된 한 장 (js/papermaker.js openPaperSheet · 가로 = PM_W)
            else if (P.kind === 'piece') {                                     // 🧩 담은 조각 + 그리던 것 (4개까지) → 봉투 하나 (🖨 뽑으면 늘 4조각 · own.js ownDesignPrint)
                const cur = pieceOne(), L = P.pcs.slice();
                if (cur) { if (L.length < 4) L.push(cur); else if (window.showAsk && !(await showAsk('🧩 조각 4개가 가득 찼어요.<br><span style="font-size:12px;color:#777;">지금 그리던 조각은 빠져요 · 그래도 완료할까요?</span>', '완료', '그만'))) return; }
                if (!L.length) { if (window.showMsg) showMsg('먼저 조각을 그려 주세요.'); return; }
                for (const o of L) if (o.cv) { o.u = await pieceBest(o); delete o.cv; delete o.vb; }
                await ownTake({ k: 'piece', from: 'mine', baked: true, nm: '내가 만든 조각', imgs: L.map(o => o.u), wh: L.map(o => o.wh) });
                nSeal = L.length; P.pcs = [];
            }   // 🏷️ 떨어진 그림마다 한 장 · 놓은 자리 그대로 한 시트
            else if (P.kind === 'tape') await ownTake(tapeOut());   // 🎀 한 롤 (붙인 길이만큼 줄어요) · 📏 폭 · 한 칸 mm 가 그림 안에 (js/tape.js tapeFit)
            else if (P.kind === 'tk') await ownTake({ k: 'tk', from: 'mine', imgs: [await pageBest(c)], x: { pad: 'my', glue: P.glue || '', mm: P.tkmm.slice() } });   // 🧻 한 묶음(50장) · 📏 실제 크기 mm (js/leafpad.js tkDim)
            else await ownTake({ k: 'leaf', from: 'mine', imgs: [await pageBest(c)], x: Object.assign({ lf: 'my', two: !!P.two }, P.spec ? { sz: { n: P.spec.n, mm: P.spec.mm, r: P.spec.r } } : {}) });   // 📐 어느 규격으로 그렸는지 (나중에 쓰려고 적어 둬요)
            P.dirty = false; g(85); if (P.savedAnim) say('✨ 움직이는 스티커로 저장했어요', 2200);
            if (window.draftDrop) { try { await draftDrop(DRAFT_K[P.kind] || P.kind); } catch (e) { console.warn('📐 작업 중 파일 지우기', e); } }   // ✅ 완료 = 작업 중 파일은 이제 필요 없어요
            if (window.ownAdd && ownAdd.design && window.ownDzMsg) ownDzMsg('design:' + ownAdd.design, nSeal ? (P.kind === 'piece' ? `🧩 조각 ${nSeal}개` : `🏷️ 스티커 ${nSeal}장`) : '');   // 📐 도안 (📱 태블릿 = 책상 프린터 · 📱 폰 = 🖨 지금 바로 뽑기)
            else if (P.kind === 'paper' && window.showMsg) showMsg('📄 모조지 한 장을 <b>🗄️ 서랍</b>에 넣었어요!<br><span style="font-size:12px;color:#777;">✂️ 가위로 오려 붙여요.</span>');
            else if (P.kind === 'piece' && window.showMsg) showMsg(`🧩 조각 ${nSeal}개를 <b>🗄️ 서랍</b>에 넣었어요!`);
            else if (P.kind === 'seal' && window.showMsg) showMsg(`🏷️ 스티커 ${nSeal}장짜리 씰 시트를 <b>🗄️ 서랍</b>에 넣었어요!`);
            else if (window.showMsg) showMsg(`${P.kind === 'tk' ? '🧻 떡메 한 묶음을' : P.kind === 'tape' ? '🎀 테이프 한 롤을' : '📃 속지를'} <b>🗄️ 서랍</b>에 넣었어요!<br><span style="font-size:12px;color:#777;">다이어리에서 서랍을 열어 꺼내 써요.</span>`);
            g(100); ok = true; await new Promise(r => setTimeout(r, 350));        // 가득 찬 것을 잠깐 보여 주고
            g(-1);
            if (P.o.done) P.o.done();
        } catch (e) { g(-1); if (window.showMsg) showMsg('⚠ 서랍에 넣지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); }
        finally { if (!ok) g(-1); P.saving = false; if (b.isConnected) { b.disabled = false; b.textContent = '✅ 도안완료'; } }
    }
    /* 📊 저장 중 게이지 : 그림판 위에 덮개 + 막대 (g(0~100) = 채우기 · g(-1) = 닫기) */
    function gauge() {
        let el = $('ppSaving'); if (el) el.remove();
        el = document.createElement('div'); el.id = 'ppSaving'; el.className = 'pp-saving'; el.setAttribute('role', 'progressbar'); el.setAttribute('aria-label', '저장 중');
        el.innerHTML = '<div class="pp-sv-box"><b>💾 도안을 저장하고 있어요</b><div class="pp-sv-bar"><i></i></div><small>잠시만 기다려 주세요</small></div>';
        document.body.appendChild(el);
        return v => { if (v < 0) { el.remove(); return; } const i = el.querySelector('i'); if (i) i.style.width = v + '%'; el.setAttribute('aria-valuenow', v); };
    }

    /* ================= 💾 임시저장 (도안/작업중-<종류>.json · 도련 11-14) ================= */
    const DRAFT_K = { leaf: '속지', tk: '떡메', tape: '마테', piece: '조각', paper: '모조지', seal: '씰' };
    const isBlank = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return false; return true; };
    function photoData(im) {                                                  // 📎 사진 = 종이 크기에 맞게 줄여서 (긴 쪽 1800px · JPEG)
        const k = Math.min(1, 1800 / Math.max(im.width, im.height)), c = mkCv(Math.round(im.width * k), Math.round(im.height * k));
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', .88);
    }
    function snapshot() {
        return { v: 1, kind: P.kind, sz: P.kind === 'seal' || P.kind === 'paper' ? P.sz : undefined, pcs: P.kind === 'piece' ? P.pcs : undefined, W: P.W, H: P.H, spec: P.spec || null, two: P.kind === 'leaf' ? !!P.two : undefined, tkmm: P.kind === 'tk' || P.kind === 'tape' ? P.tkmm : undefined, glue: P.glue || '', at: Date.now(), cur: P.layers.indexOf(P.cur),
            set: { mode: P.mode, tool: P.tool, brush: P.brush, size: P.size, op: P.op, soft: P.soft, stab: P.stab, vsw: P.vsw, vround: P.vround, color: P.color, recent: P.recent, grid: P.grid, sym: P.sym, symN: P.symN || 0, shapeK: P.shapeK, shapeFill: P.shapeFill, cut: P.cut || null, stampK: P.stampK, qshape: P.qshape, polyN: P.polyN, radN: P.radN },
            layers: P.layers.map(L => {
                const o = { type: L.type, name: L.name, vis: L.vis, lock: L.lock, op: L.op, blend: L.blend, aLock: L.aLock, clip: !!L.clip };
                if (L.type === 'paper') o.mk = L.mk;
                if (L.type === 'px') o.png = isBlank(L.cv) ? '' : L.cv.toDataURL('image/png');
                if (L.type === 'vec') o.shapes = L.shapes;
                if (L.type === 'css') { o.blocks = L.blocks; o.pb = L.pb || []; o.pa = L.pa || []; o.pfl = L.pfl || []; o.pfn = L.pfn || []; o.kids = L.kids || []; o.cls = L.cls || {}; o.box = L.box; o.text = L.text || ''; }
                if (L.type === 'svg') o.els = L.els;                           // 🌀 svg 도형 · 블록 (그림도 블록 안에)   // 🧩 블록 (그림 깔기 그림 · 내 블록 속도 블록 안에)
                if (L.type === 'photo') Object.assign(o, { img: L.imgData || (L.imgData = photoData(L.img)), s: L.s, ox: L.ox, oy: L.oy, wash: L.wash, fit: L.fit || '' });
                return o;
            }) };
    }
    /* 📱 이 기기에만 (도련 11-14 · 다이어리 임시저장과 같게) : 💾 버튼 = 지금 저장하고 알려 줘요 · 그리는 동안 자동으로도 (auto = 그리던 것을 끊지 않아요) */
    const hm = t => new Date(t).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
    function tmpShow() { const t = $('ppTmpT'); if (t) t.textContent = '📱 이 기기에 임시저장' + (P.savedAt ? ' · ' + hm(P.savedAt) : ' (자동으로도 저장돼요)'); }
    async function saveDraft(quietly, auto) {
        if (P.saving) return false;
        if (P.tour) { if (!auto) say('🎓 예시 보기 중에는 저장하지 않아요 · 끝내고 저장해요'); return false; }
        if (!auto) { commitFloat(); penEnd(); }
        if (window.dkTrialNoSave && dkTrialNoSave()) return false;
        if (!window.draftWrite) { if (window.comingSoon) comingSoon('💾 임시저장'); return false; }
        const b = auto ? null : $('ppTmp'); P.saving = true; if (b) { b.disabled = true; b.textContent = '💾 저장 중…'; }
        try {
            P.dirty = false;                                                  // 저장하는 사이에 그린 것은 다음 자동 저장으로
            await draftWrite(DRAFT_K[P.kind] || P.kind, snapshot()); P.savedAt = Date.now(); tmpShow();
            if (!quietly) say(`📱 이 기기에 임시저장했어요 (${hm(P.savedAt)}) · 다른 기기에서는 보이지 않아요 · ${P.kind === 'tk' ? '떡메' : P.kind === 'tape' ? '테이프' : P.kind === 'seal' ? '씰' : P.kind === 'piece' ? '조각' : P.kind === 'paper' ? '모조지' : '속지'}마다 하나`, 3200);
            return true;
        }
        catch (e) { P.dirty = true; console.warn('💾 임시저장', e); if (!auto && window.showMsg) showMsg('⚠ 임시저장하지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '잠시 뒤 다시 해 주세요.')); return false; }
        finally { P.saving = false; if (b && b.isConnected) { b.disabled = false; b.textContent = '💾 임시저장'; } }
    }
    tsAuto({ dirty: () => P.on && !P.tour && P.dirty && !P.saving && !P.drag && !P.fl && !P.pen, save: () => saveDraft(true, true) });   // 📱 자동 임시저장 = 공통 (js/tempsave.js TS.ms · 앱을 내릴 때도 · 바뀐 게 있을 때만 · 이 기기에만 · 도련 11-15)
    function restoreDraft(d, keep) {                                          // keep = 📐 규격 바꾸기 (조용히 · 그린 것은 그대로)
        const loadImg = src => new Promise(ok => { if (!src) return ok(null); const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
        P.layers = []; P.cur = null;
        Object.assign(P, d.set || {});
        (d.layers || []).forEach(o => {
            const L = addLayer(o.type, o.name, { vis: o.vis !== false, lock: !!o.lock, op: o.op == null ? 1 : o.op, blend: o.blend || 'source-over', aLock: !!o.aLock, clip: !!o.clip }, P.layers.length);
            if (o.type === 'paper') { L.mk = o.mk || { bg: '#ffffff' }; paperPaint(L); }
            if (o.type === 'vec') { L.shapes = o.shapes || []; L.dirtyV = true; }
            if (o.type === 'css') { L.blocks = (o.blocks || []).filter(CB.ok); L.pb = (o.pb || []).filter(CB.ok); L.pa = (o.pa || []).filter(CB.ok); L.box = o.box || { x: .15, y: .15, w: .7, h: .7 }; L.text = o.text || ''; L.pfl = (o.pfl || []).filter(CB.ok); L.pfn = (o.pfn || []).filter(CB.ok); L.kids = Array.isArray(o.kids) ? o.kids : [];
                L.cls = {}; Object.entries(o.cls || {}).forEach(([k, v]) => { L.cls[k] = {}; CB.PART.forEach(([q]) => { L.cls[k][q] = ((v || {})[q] || []).filter(CB.ok); }); }); L.dirtyV = true; }
            if (o.type === 'svg') { L.els = (o.els || []).filter(SB.okEl); L.dirtyV = true; }
            if (o.type === 'px' && o.png) loadImg(o.png).then(im => { if (im) { L.cv.getContext('2d').drawImage(im, 0, 0); renderAll(); thumbsSoon(); } });
            if (o.type === 'photo') { Object.assign(L, { fit: o.fit || '', s: o.s || 1, ox: o.ox || 0, oy: o.oy || 0, wash: o.wash || 0, imgData: o.img }); loadImg(o.img).then(im => { if (im) { L.img = im; photoPaint(L); renderAll(); thumbsSoon(); } }); }
        });
        if (!P.layers.some(l => l.type === 'paper')) { const pp = addLayer('paper', '종이', { lock: true, mk: { bg: '#ffffff' } }, 0); paperPaint(pp); }
        P.cur = P.layers[d.cur] || P.layers[P.layers.length - 1];
        modeBtns(); paintTools(); setColor(P.color); renderAll(); paintLayers(); paintProps();
        document.querySelectorAll('.pp-view [data-v]').forEach(b => b.classList.toggle('on', (b.dataset.v === 'grid' && P.grid) || (b.dataset.v === 'sym' && (P.sym || P.symN)) || (b.dataset.v === 'wrap' && P.wrap)));
        { const sb = document.querySelector('.pp-view [data-v="sym"]'); if (sb) sb.textContent = P.symN ? `🌸 만화경 ${P.symN}` : '⇋ 대칭'; } cutSoon();
        if (!keep) { P.dirty = false; say('✏️ 이어서 그려요', 1500); }
    }

    /* ================= 📐 다이어리 규격 (도련 11-14) : 앱의 모든 바인더 · 노트 크기 중에서 골라 끼워 보기 · 그 크기로 종이 맞추기
       - 상품 그대로 (📔 날짜형바인더 · 날짜형노트 js/app.js DY_DESIGNS · 🗂️ 페이지바인더 · 📕 페이지노트 js/skins.js DY_TYPES · 숨김 상품은 빼요) · 같은 규격(이름 + mm)끼리 묶어요
       - 📏 속지 = 종이 한 쪽 (규격 mm · js/skins.js dyLeafR) · 📖 양쪽 디자인 = 펼친 두 쪽 (가로 × 2) · 다이어리에는 쪽마다 그 mm 그대로 (늘이지 않아요 · js/leafpad.js) · 같은 규격 다이어리에만 (도련 11-16)
       - 종이 맞추기 = 가로 900 그대로 · 세로 = 900 × 그 다이어리 속지 비율 · 그린 것은 위 기준 그대로 (작아지면 아래가 잘려요) ================= */
    const SPEC_B = { ring: '링 바인더', tn: '고무줄 노트', spread: '쫙 펼침', hard: '하드커버', thin: '얇은 노트' };
    function specList() {
        const out = [], yr = new Date().getFullYear();
        const lr = mm => dyLeafR({ mm });                                    // 📃 한 쪽 종이 mm 비율 (규격만 · js/skins.js)
        const add = (n, mm, r, it) => { if (!(r > 0) || !n) return; let g = out.find(x => x.n === n && x.mm === mm); if (!g) out.push(g = { n, mm, items: [] }); it.r = lr(mm); g.items.push(it); };
        (typeof DY_DESIGNS !== 'undefined' ? DY_DESIGNS : []).forEach(d => { if (d.off && !d.mine) return; const c = (typeof DY_COL !== 'undefined' && DY_COL[d.id]) || {};
            add(d.n, d.mm, d.r, { id: d.id, name: d.mine ? d.name : `${yr} ${d.kind} · ${d.name}`, b: d.b, bd: c.border || d.c, pg: c.page || '#fffdfb' }); });
        (typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).forEach(t => { if (t.off) return;
            add(t.n, t.mm, t.r, { id: t.id, name: `${t.k === '바인더' ? '페이지바인더' : '페이지노트'} · ${t.g}`, b: t.b, bd: (t.cols && t.cols.테두리색) || t.c, pg: (t.cols && t.cols.속지색) || '#fffdfb' }); });
        return out;
    }
    function curId() {                                                        // 지금 펼친 다이어리 (📔 날짜형은 dyLook id 가 'basic' → 같은 이름 · 규격 디자인)
        const t = window.dyLook ? dyLook() : null; if (!t) return '';
        if (t.id !== 'basic') return t.id;
        const d = (typeof DY_DESIGNS !== 'undefined' ? DY_DESIGNS : []).find(x => x.name === t.g && x.n === t.n && x.mm === t.mm); return d ? d.id : '';
    }
    function specNow() {                                                       // 지금 펼친 다이어리의 규격
        const t = window.dyLook ? dyLook() : null; if (!t) return null; const id = curId();
        const L = specList(), all = L.flatMap(g => g.items.map(i => [g, i])), m = all.find(([, i]) => i.id === id) || all.find(([g, i]) => g.n === t.n && g.mm === t.mm && i.b === t.b);
        if (m) return { n: m[0].n, mm: m[0].mm, r: m[1].r, id: m[1].id };
        return { n: t.n || '', mm: t.mm || '', r: dyLeafR(t), id };
    }
    function specBtn() {
        if (P.kind === 'paper') {
            const a = document.querySelector('#ppBarX [data-q="seal"]'), b = document.querySelector('#ppBarX [data-q="spec"]'), v = PAPER_SZ[P.sz] || PAPER_SZ.tall;
            if (a) a.innerHTML = `<b>📐 모조지 규격</b><small>${v[0]} · ${szMm(v)}</small>`;
            if (b) b.innerHTML = `<b>📔 다이어리에 놓아 보기</b><small>${P.spec ? '지금 다이어리 · ' + esc(P.spec.n) : '다이어리 고르기'}</small>`;
            return;
        }
        if (P.kind === 'piece') { const b = document.querySelector('#ppBarX [data-q="spec"]'); if (b) b.innerHTML = `<b>📔 다이어리에 붙여 보기</b><small>${P.spec ? '지금 다이어리 · ' + esc(P.spec.n) : '다이어리 고르기'}</small>`; return; }
        if (P.kind === 'seal') {
            const a = document.querySelector('#ppBarX [data-q="seal"]'), b = document.querySelector('#ppBarX [data-q="spec"]'), s = P.spec;
            if (a) a.innerHTML = `<b>📐 씰 규격</b><small>${(SEAL_SZ[P.sz] || SEAL_SZ.tall)[0]} · 세로 = 다이어리 한 쪽</small>`;
            if (b) b.innerHTML = `<b>📔 다이어리에 붙여 보기</b><small>${s ? '지금 다이어리 · ' + esc(s.n) : '다이어리 고르기'}</small>`;
            return;
        }
        if (P.kind === 'tk' || P.kind === 'tape') {
            const a = document.querySelector('#ppBarX [data-q="size"]'), b = document.querySelector('#ppBarX [data-q="spec"]'), s = P.spec;
            if (a) a.innerHTML = P.kind === 'tape' ? `<b>📏 테이프 크기</b><small>폭 ${P.tkmm[1]}mm · 한 칸 ${P.tkmm[0]}mm</small>` : `<b>📏 떡메 크기</b><small>${P.tkmm[0]} × ${P.tkmm[1]} mm</small>`;
            if (b) b.innerHTML = `<b>📔 다이어리에 붙여 보기</b><small>${s ? '지금 다이어리 · ' + esc(s.n) : '다이어리 고르기'}</small>`;
            return;
        }
        const b = document.querySelector('#ppBarX .pp-specb'); if (!b) return;
        const s = P.spec; b.innerHTML = `<b>📔 다이어리에 끼워 보기</b><small>지금 종이 · ${s ? esc(s.n) + ' ' + esc(s.mm) + 'mm' : '규격 고르기'}</small>`;   // 누르기 전에 무엇인지 알게 (도련 11-14)
        const t = document.querySelector('#ppBarX .pp-two'); if (t) t.innerHTML = P.two ? '<b>📖 양쪽 디자인</b><small>왼쪽 · 오른쪽 따로</small>' : '<b>📄 한 쪽 디자인</b><small>양쪽에 같이도</small>';
        const ov = $('ppStage'); if (ov) ov.classList.toggle('pp-two-on', !!P.two);
    }
    const leafR = r => P.two ? r / 2 : r;                                     // 📃 종이 비율 (세로 ÷ 가로) : 한 쪽 = 규격 · 📖 양쪽 = 펼친 두 쪽 (가로 × 2)
    const ratioOk = r => Math.abs(leafR(r) - P.H / P.W) < .015;
    function twoFlip() {                                                      // 📄 한 쪽 ↔ 📖 양쪽 디자인 (도련 11-16 · 가로 900 그대로 · 세로를 그 비율로)
        P.two = !P.two; const r = P.spec && P.spec.r > 0 ? P.spec.r : P.H / P.W * (P.two ? 1 : .5);
        resizePaper(P.W, Math.round(P.W * leafR(r)), P.spec); say(P.two ? '📖 양쪽 디자인 · 가운데 점선 왼쪽 = 왼쪽 쪽 · 오른쪽 = 오른쪽 쪽' : '📄 한 쪽 디자인 · 끼울 때 양쪽에 같이 · 한 쪽에만 골라요', 2600);
    }
    function specShot() {                                                      // 미리보기용 작은 그림
        const w = 320, h = Math.round(w * P.H / P.W), c = mkCv(w, h), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
        const big = mkCv(P.W, P.H); compose(big.getContext('2d'), false); x.drawImage(big, 0, 0, w, h); return c.toDataURL('image/jpeg', .85);
    }
    function specPop() {
        let pop = $('ppSpecPop'); if (pop) { pop.remove(); return; }
        commitFloat(); penEnd();
        const L = specList(); if (!L.length) { say('📐 고를 수 있는 다이어리가 아직 없어요'); return; }
        const cur = { id: curId() };
        let pick = (P.spec && L.flatMap(g => g.items).find(i => i.id === P.spec.id)) || L.flatMap(g => g.items).find(i => i.id === cur.id) || L[0].items[0];
        const shot = specShot();
        pop = document.createElement('div'); pop.id = 'ppSpecPop'; pop.className = 'pp-pop pp-specpop';
        pop.innerHTML = `<div class="pp-pop-h"><b>📐 다이어리 규격 · 끼워 보기</b><button type="button" class="win-x" aria-label="닫기">✕</button></div>
            <div class="pp-sp-b"><div class="pp-sp-l" id="ppSpL">${L.map(g => `<div class="pp-sg"><div class="pp-sg-h"><b>${esc(g.n)}</b><small>${esc(g.mm)}mm</small>${g.items.some(i => ratioOk(i.r)) ? '<em>지금 종이</em>' : ''}</div>
                <div class="pp-sg-i">${g.items.map(i => `<button type="button" data-sp="${esc(i.id)}"><i style="background:${esc(i.bd)}"></i>${esc(i.name)}${i.id === cur.id ? '<u>펼친 다이어리</u>' : ''}</button>`).join('')}</div></div>`).join('')}</div>
            <div class="pp-sp-r"><p class="pp-sp-h">📃 속지 한 장 = <b>${P.two ? '펼친 두 쪽 (양쪽 디자인)' : '한 쪽'}</b> 크기예요</p><div class="pp-bkw" id="ppBk"></div><p class="pp-sp-t" id="ppSpT"></p><button type="button" class="pp-sp-go" id="ppSpGo"></button></div></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        const groupOf = it => L.find(g => g.items.includes(it));
        const show = () => {
            const g = groupOf(pick), same = ratioOk(pick.r);
            pop.querySelectorAll('[data-sp]').forEach(b => b.classList.toggle('on', b.dataset.sp === pick.id));
            let H = 250, W = Math.round(H / pick.r); const WM = Math.min(470, innerWidth - 64); if (W > WM) { W = WM; H = Math.round(W * pick.r); }   /* 📱 폰 = 화면 안으로 */
            $('ppBk').innerHTML = `<div class="pp-bk b-${pick.b}" style="--bd:${esc(pick.bd)};--pg:${esc(pick.pg)};--w:${W}px;--h:${H}px"><div class="pp-sprd" style="background-image:url('${shot}')"></div><i class="pp-bind"></i></div>`;
            $('ppSpT').innerHTML = `<b>${esc(pick.name)}</b> · ${esc(g.n)} ${esc(g.mm)}mm · ${SPEC_B[pick.b] || ''}<br>` + (same ? '✅ 지금 종이와 같은 비율이라 그대로 꼭 맞아요' : `⚠ 지금 종이와 비율이 달라서 <b>${pick.r > P.H / P.W ? '세로로 늘어나' : '납작하게 눌려'}</b> 보여요`);
            const go = $('ppSpGo'); go.disabled = same && !!P.spec && P.spec.id === pick.id; go.textContent = same ? (go.disabled ? '📐 지금 이 다이어리에 맞춰 그리고 있어요' : '📐 이 다이어리로 정하기') : `📐 이 다이어리 크기로 종이 맞추기`;
        };
        $('ppSpL').onclick = e => { const b = e.target.closest('[data-sp]'); if (!b) return; pick = L.flatMap(g => g.items).find(i => i.id === b.dataset.sp) || pick; show(); };
        $('ppSpGo').onclick = async () => {
            const g = groupOf(pick), spec = { n: g.n, mm: g.mm, r: pick.r, id: pick.id };
            if (ratioOk(pick.r)) { P.spec = spec; specBtn(); pop.remove(); say(`📐 ${g.n} 규격이에요`); return; }
            const H2 = Math.round(P.W * leafR(pick.r)), has = P.dirty || P.layers.some(l => l.type === 'photo');
            if (has && window.showAsk && !(await showAsk(`📐 종이를 <b>${esc(g.n)} (${esc(g.mm)}mm)</b> 크기로 바꿀까요?<br><span style="font-size:12px;color:#777;">그린 것은 위쪽 기준 그대로 남아요 · ${H2 < P.H ? '종이가 짧아져서 <b>아래쪽이 잘려요</b>' : '아래쪽에 빈 종이가 늘어나요'}<br>되돌리기 기록은 비워져요</span>`, '바꾸기', '그대로'))) return;
            resizePaper(P.W, H2, spec); pop.remove(); say(`📐 ${g.n} 크기 종이로 바꿨어요`, 2000);
        };
        show();
    }
    function resizePaper(W2, H2, spec) {
        commitFloat(); penEnd();
        const d = snapshot(); P.W = W2; P.H = H2; if (spec) P.spec = spec;
        ['ppCv', 'ppOv'].forEach(id => { const c = $(id); if (c) { c.width = P.W; c.height = P.H; } });
        P.hist = []; P.redo = []; P.sel = null; P.pt = null;
        restoreDraft(d, true); P.dirty = true; fit(); requestAnimationFrame(() => realSize(true)); specBtn();   // 📏 종이 모양을 바꿔도 실제 크기로 (화면에 들어가면 · 도련 11-19 1313)
        if (P.kind === 'tk' || P.kind === 'tape') requestAnimationFrame(() => realSize(true));
        if (P.kind === 'tape') { ['ppGhL', 'ppGhR'].forEach(id => { const g = $(id); if (g) { g.width = P.W; g.height = P.H; } }); renderAll(); }
    }

    /* ================= 🧻 떡메 (도련 11-14) : 📏 실제 크기(mm) 정하기 · 💗 풀칠 띠 · 📔 다이어리에 붙여 보기 (실제 크기 비율) ================= */
    const PXMM = 8, TK_MM0 = [50, 50], PXMM_T = 16, TAPE_MM0 = [30, 15];   // 🎀 테이프 = 1mm 16px (가늘어서 더 촘촘히) · 처음 한 칸 30mm · 폭 15mm
    const TAPE_W = [10, 15, 20, 30, 50];                                      // 🎀 흔한 테이프 폭 (mm)
    function tapeOut() {                                                      // 🎀 서랍에 넣을 한 롤 : 한 칸 그림(작게) → 늘어나는 테이프 그림 (js/tape.js tapeSvg) · 실제 mm 를 적어 둬요
        const big = mkCv(P.W, P.H); compose(big.getContext('2d'), false);
        const th = 96, tw = Math.max(8, Math.round(th * P.W / P.H)), c = mkCv(tw, th); c.getContext('2d').drawImage(big, 0, 0, tw, th);
        const d = window.imgBake ? imgBake(c) : c.toDataURL('image/png');   // 🗜 js/imgsmall.js
        const h = 30, w = Math.round(h * P.W / P.H * 100) / 100;              // 예전 테이프처럼 높이 30 기준 (붙일 때 실제 폭으로 맞춰요)
        const u = tapeUrl({ id: 'm-' + Date.now().toString(36), name: '', bg: 'none', w, h, mm: [P.tkmm[0], P.tkmm[1]], p: `<image href="${d}" width="${w}" height="${h}" preserveAspectRatio="none"/>` });
        return { k: 'tape', from: 'mine', imgs: [u], th: u, x: { mm: P.tkmm.slice() } };
    }                                        // 종이 1mm = 8px (50mm = 400px) · 처음 크기
    const TK_SIZES = [[[50, 50], '작은 정사각'], [[75, 75], '정사각'], [[100, 100], '큰 정사각'], [[76, 51], '가로 긴'], [[51, 76], '세로 긴'], [[76, 127], '긴 메모']];
    const GLUES = [['', '다이어리 색'], ['#ffb3c6', '분홍'], ['#ffcf9e', '살구'], ['#ffe98a', '노랑'], ['#b9ebcf', '민트'], ['#b7dcff', '하늘'], ['#d6c6ff', '보라'], ['#d9bf94', '크라프트']];   // js/leafmaker.js 와 같아요
    const glueCol = () => P.glue || 'color-mix(in srgb, var(--primary-accent, #ff8fb1) 62%, #fff)';
    function glueShow() {
        const g = $('ppGlueBar'); if (g) g.style.background = `linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0) 45%, rgba(0,0,0,.06)), ${glueCol()}`;
        document.querySelectorAll('#ppGlue [data-g]').forEach(b => b.classList.toggle('on', b.dataset.g === P.glue));
    }
    const mmW = () => P.kind === 'seal' ? sealPh() * P.W / P.H : P.kind === 'piece' ? sealPh() * P.W * PIECE_K / 644 : P.kind === 'paper' ? sealPh() * P.W * PAPER_K / 644 : P.kind === 'tk' || P.kind === 'tape' ? P.tkmm[0] : (P.spec && +String(P.spec.mm || '').split(/[×x*]/)[0]) * (P.two ? 2 : 1) || 0;   // 종이 가로 = 몇 mm (📃 속지 한 쪽 = 규격 가로 · 📖 양쪽 디자인만 두 배 · 도련 11-19 1313 : 늘 두 배라 실제 크기가 2배로 컸어요)
    function realSize(auto) {                                                  // 📏 화면에 실제 크기 (1mm = MM_PX · js/skins.js 한 곳)
        const st = $('ppStage'), mw = mmW(); if (!st || !mw) { if (!auto) say('📏 이 종이는 실제 크기를 몰라요'); return; }
        const r = st.getBoundingClientRect(), k = MM_PX * mw / P.W;
        if (P.W * k > r.width - 20 || P.H * k > r.height - 20) { if (auto) return; say('📏 실제 크기는 화면보다 커요 · 손바닥으로 옮겨 보세요', 2000); }
        P.z = k / P.base; P.px = (r.width - P.W * k) / 2; P.py = (r.height - P.H * k) / 2; view();
        if (!auto) say(`📏 실제 크기 (${mw}mm${P.kind === 'tk' || P.kind === 'tape' ? ' × ' + P.tkmm[1] + 'mm' : ''})`, 1400);
    }
    function sizePop() {
        let pop = $('ppSizePop'); if (pop) { pop.remove(); return; }
        commitFloat(); penEnd();
        pop = document.createElement('div'); pop.id = 'ppSizePop'; pop.className = 'pp-pop pp-sizepop';
        const TP = P.kind === 'tape', LIM = TP ? [[10, 100], [5, 60]] : [[20, 150], [20, 150]], SZ = TP ? TAPE_W.map(w => [[P.tkmm[0], w], w + 'mm 폭']) : TK_SIZES;   // 🎀 = 폭 고르기 + 한 칸 길이
        pop.innerHTML = `<div class="pp-pop-h"><b>📏 ${TP ? '마스킹테이프' : '떡메모지'} 크기</b><button type="button" class="win-x" aria-label="닫기">✕</button></div>
            <div class="pp-sz-b"><div class="pp-sz-l${TP ? ' tp' : ''}">${SZ.map(([m, n]) => `<button type="button" data-w="${m[0]}" data-h="${m[1]}"><i style="aspect-ratio:${TP ? '60 / ' + m[1] : m[0] + ' / ' + m[1]}"></i><b>${TP ? m[1] + 'mm' : m[0] + ' × ' + m[1]}</b><small>${TP ? ['아주 가는', '가는', '보통', '넓은', '아주 넓은'][TAPE_W.indexOf(m[1])] : n}</small></button>`).join('')}</div>
            <div class="pp-sz-c"><b>직접 정하기</b><label>${TP ? '한 칸 길이' : '가로'} <input type="number" id="ppSzW" min="${LIM[0][0]}" max="${LIM[0][1]}" value="${P.tkmm[0]}"> mm</label><label>${TP ? '폭' : '세로'} <input type="number" id="ppSzH" min="${LIM[1][0]}" max="${LIM[1][1]}" value="${P.tkmm[1]}"> mm</label><small>${TP ? '한 칸 = 되풀이되는 무늬 길이 (10~100mm) · 폭 5~60mm' : '20 ~ 150mm'}</small></div>
            <button type="button" class="pp-sp-go" id="ppSzGo">📏 이 크기로</button></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        const mark = () => { const w = +$('ppSzW').value, h = +$('ppSzH').value; pop.querySelectorAll('[data-w]').forEach(b => b.classList.toggle('on', (TP || +b.dataset.w === w) && +b.dataset.h === h)); };
        pop.querySelector('.pp-sz-l').onclick = e => { const b = e.target.closest('[data-w]'); if (!b) return; if (!TP) $('ppSzW').value = b.dataset.w; $('ppSzH').value = b.dataset.h; mark(); };
        pop.querySelector('.pp-sz-c').oninput = mark; mark();
        $('ppSzGo').onclick = async () => {
            const cl = (v, L) => Math.max(L[0], Math.min(L[1], Math.round(+v || 0))), w = cl($('ppSzW').value, LIM[0]), h = cl($('ppSzH').value, LIM[1]);
            if (w === P.tkmm[0] && h === P.tkmm[1]) { pop.remove(); return; }
            const PX = TP ? PXMM_T : PXMM, W2 = Math.round(w * PX), H2 = Math.round(h * PX), has = P.dirty || P.layers.some(l => l.type === 'photo');
            if (has && window.showAsk && !(await showAsk(`📏 ${TP ? '테이프를 <b>폭 ' + h + 'mm · 한 칸 ' + w + 'mm</b>' : '떡메를 <b>' + w + ' × ' + h + 'mm</b>'} 로 바꿀까요?<br><span style="font-size:12px;color:#777;">그린 것은 왼쪽 위 기준 그대로 남아요 · ${W2 < P.W || H2 < P.H ? '작아지는 쪽은 <b>잘려요</b>' : '늘어난 곳은 빈 종이예요'}<br>되돌리기 기록은 비워져요</span>`, '바꾸기', '그대로'))) return;
            P.tkmm = [w, h]; resizePaper(W2, H2, null); pop.remove(); say(TP ? `📏 폭 ${h}mm · 한 칸 ${w}mm 테이프예요` : `📏 ${w} × ${h}mm 떡메예요`, 1800);
        };
    }
    function tkPastePop() {                                                    // 📔 다이어리에 붙여 보기 : 고른 다이어리 펼친 모습 위에 실제 크기 비율로
        let pop = $('ppSpecPop'); if (pop) { pop.remove(); return; }
        commitFloat(); penEnd();
        const L = specList(); if (!L.length) { say('📔 붙여 볼 다이어리가 아직 없어요'); return; }
        const cur = { id: curId() }, all = L.flatMap(g => g.items), TP = P.kind === 'tape';
        let pick = (P.spec && all.find(i => i.id === P.spec.id)) || all.find(i => i.id === cur.id) || all[0];
        const shot = specShot();
        pop = document.createElement('div'); pop.id = 'ppSpecPop'; pop.className = 'pp-pop pp-specpop';
        pop.innerHTML = `<div class="pp-pop-h"><b>📔 다이어리에 붙여 보기</b><button type="button" class="win-x" aria-label="닫기">✕</button></div>
            <div class="pp-sp-b"><div class="pp-sp-l" id="ppSpL">${L.map(g => `<div class="pp-sg"><div class="pp-sg-h"><b>${esc(g.n)}</b><small>${esc(g.mm)}mm</small></div>
                <div class="pp-sg-i">${g.items.map(i => `<button type="button" data-sp="${esc(i.id)}"><i style="background:${esc(i.bd)}"></i>${esc(i.name)}${i.id === cur.id ? '<u>펼친 다이어리</u>' : ''}</button>`).join('')}</div></div>`).join('')}</div>
            <div class="pp-sp-r"><p class="pp-sp-h">${TP ? `🎀 폭 <b>${P.tkmm[1]}mm</b> 테이프를 <b>실제 크기 비율</b>로 붙여 봤어요` : `🧻 <b>${P.tkmm[0]} × ${P.tkmm[1]}mm</b> 떡메 한 장을 <b>실제 크기 비율</b>로 붙여 봤어요`}</p><div class="pp-bkw" id="ppBk"></div><p class="pp-sp-t" id="ppSpT"></p></div></div>`;
        document.body.appendChild(pop); pop.querySelector('.win-x').onclick = () => pop.remove();
        const show = () => {
            const g = L.find(x => x.items.includes(pick)), ph = +String(g.mm).split(/[×x*]/)[1] || 148, pw = +String(g.mm).split(/[×x*]/)[0] || 105;
            pop.querySelectorAll('[data-sp]').forEach(b => b.classList.toggle('on', b.dataset.sp === pick.id));
            let H = 260, W = Math.round(H / pick.r); const WM = Math.min(470, innerWidth - 64); if (W > WM) { W = WM; H = Math.round(W * pick.r); }   /* 📱 폰 = 화면 안으로 */
            const k = H / ph, tw = P.tkmm[0] * k, th = P.tkmm[1] * k;   // 1mm = k px (쪽 높이 기준)
            if (TP) {                                                          // 🎀 오른쪽 쪽에 70mm 쯤 비스듬히 + 왼쪽 쪽 위 모서리에 짧게
                const tu = typeof tapeUrl === 'function' ? tapeUrl({ id: 'pv', name: '', bg: 'none', w: tw, h: th, p: `<image href="${shot}" width="${tw}" height="${th}" preserveAspectRatio="none"/>` }) : '';
                $('ppBk').innerHTML = `<div class="pp-bk b-${pick.b}" style="--bd:${esc(pick.bd)};--pg:${esc(pick.pg)};--w:${W}px;--h:${H}px"><div class="pp-sprd pp-sprd-0"></div><i class="pp-bind"></i>
                    <i class="pp-tpon" style="width:${(70 * k).toFixed(1)}px;height:${th.toFixed(1)}px;left:calc(75% - ${(35 * k).toFixed(1)}px);top:calc(40% - ${(th / 2).toFixed(1)}px);transform:rotate(-8deg);background-image:url(&quot;${tu}&quot;)"></i>
                    <i class="pp-tpon" style="width:${(36 * k).toFixed(1)}px;height:${th.toFixed(1)}px;left:${(12 * k).toFixed(1)}px;top:${(14 * k).toFixed(1)}px;transform:rotate(-38deg);background-image:url(&quot;${tu}&quot;)"></i></div>`;
                $('ppSpT').innerHTML = `<b>${esc(pick.name)}</b> · 한 쪽 ${esc(g.mm)}mm<br>테이프 폭이 한 쪽 세로의 ${Math.round(P.tkmm[1] / ph * 100)}% 쯤이에요`;
                return;
            }
            $('ppBk').innerHTML = `<div class="pp-bk b-${pick.b}" style="--bd:${esc(pick.bd)};--pg:${esc(pick.pg)};--w:${W}px;--h:${H}px"><div class="pp-sprd pp-sprd-0"></div><i class="pp-bind"></i>
                <div class="pp-tkon" style="width:${tw.toFixed(1)}px;height:${th.toFixed(1)}px;left:calc(75% - ${(tw / 2).toFixed(1)}px);top:calc(50% - ${(th / 2).toFixed(1)}px)"><img src="${shot}" alt=""><i class="pp-tktape"></i></div></div>`;   /* 뜯어 붙인 한 장 = 테이프로 (풀칠 띠는 묶음에 남아요) */
            const big = P.tkmm[0] > pw || P.tkmm[1] > ph;
            $('ppSpT').innerHTML = `<b>${esc(pick.name)}</b> · 한 쪽 ${esc(g.mm)}mm<br>` + (big ? '⚠ 떡메가 다이어리 한 쪽보다 커요' : `떡메가 한 쪽의 가로 ${Math.round(P.tkmm[0] / pw * 100)}% · 세로 ${Math.round(P.tkmm[1] / ph * 100)}% 쯤이에요`);
        };
        $('ppSpL').onclick = e => { const b = e.target.closest('[data-sp]'); if (!b) return; pick = all.find(i => i.id === b.dataset.sp) || pick; show(); };
        show();
    }

    window.ppOpen = ppOpen; window.ppClose = ppClose; window.ppDirty = ppDirty; window.ppDiscard = ppDiscard; window.ppSaveDraft = saveDraft; window.PP_DRAFT_K = DRAFT_K; window.ppSpecList = specList;
    window.ppTourHook = {                                                     // 🎓 예시 보기 (js/padtour.js) : 지금 그림은 보관 · 빈 연습 종이 · 끝나면 가져가기 / 그냥 닫기
        get still() { return !!P.still; }, get kind() { return P.kind; },                                     // 🎬 움직임 숨기는 종류 (속지 · 떡메 · 모조지 · 테이프)
        get on() { return !!P.on; }, get busy() { return !!P.tour; },
        begin() { if (!P.on || P.tour) return false; commitFloat(); penEnd(); P.tour = { s0: snapshot(), dirty: P.dirty };
            const pp = P.layers.filter(l => l.type === 'paper'); P.layers = pp; P.cur = pp[0] || null; P.hist = []; P.redo = []; P.sel = null; P.many = []; P.pt = null; P.cbOpen = null; P.sbSel = null; P.sbOpen = null; P.cbPart = 'blocks'; P.cbNode = 'root'; P.cbBox = false; P.cbCode = false; P.sbCode = false;
            setMode('px'); renderAll(); paintLayers(); paintProps(); return true; },
        end() { const T = P.tour; if (!T) return; commitFloat(); penEnd(); P.tour = null;   // 🎓 예시 보기 결과는 버리고 원래 그림으로 (가져가기 없음 · 도련 11-19)
            restoreDraft(T.s0, true); P.hist = []; P.redo = []; P.dirty = T.dirty; },
        layerOf: t => { const l = [...P.layers].reverse().find(q => q.type === t); return l ? l.id : null; }
    };
    window.ppTest = () => P;                                                     // 🧪 시험용 (tests/t_padpaint.py)
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['padpaint'] = true;
