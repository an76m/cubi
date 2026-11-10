/* 말랑달콤 다이어리 - js/draw.js
   🖍️ 펜 · 형광펜 : 다이어리 위에 손으로 그리고 밑줄 긋기 (툴바 → 🖍️ 펜)
   - 펜 : 또렷한 선 · 형광펜 : 반투명한 굵은 선 (글 위에 그어도 글씨가 비쳐 보여요)
   - 지우개는 문지른 부분만 지워요 (굵기 3가지) · ↶ 는 방금 한 일(그리기 · 지우기) 되돌리기
   - ✓ 완료를 누르면 이번에 그린 선들이 그림 하나가 돼요 → 다른 그림처럼 옮기기 · 돌리기 · 크기 · 삭제
   - 그림은 SVG 로 일기에 담겨요 (파일 없음) · 선을 아주 많이 그리면 그날 일기 파일이 조금 커져요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (펜 버튼만 '준비 중') */

        const dw = { on: false, tool: 'pen', color: {}, w: {},   /* w = 굵기 px (상품 '굵기' · 도련 11-02) */ strokes: [], hist: [], cur: null, ring: null, svg: null, k: 1 };
        const drq = id => document.getElementById(id);
        const DRAW_NS = 'http://www.w3.org/2000/svg';

        function penPathD(pts) {                       // 점들을 부드러운 곡선으로
            const f = n => Math.round(n * 10) / 10;
            if (pts.length === 1) return `M${f(pts[0][0])} ${f(pts[0][1])}l0.1 0`;
            let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
            for (let i = 1; i < pts.length - 1; i++) {
                const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
                d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
            }
            const l = pts[pts.length - 1];
            return d + `L${f(l[0])} ${f(l[1])}`;
        }
        function penAttrs(s) {
            return s.tool === 'hi'
                ? { stroke: s.color, 'stroke-width': s.w, 'stroke-opacity': .42, 'stroke-linecap': 'butt', 'stroke-linejoin': 'round', fill: 'none' }
                : { stroke: s.color, 'stroke-width': s.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
        }
        function penRender() {
            const g = dw.svg && dw.svg.firstChild; if (!g) return;
            g.innerHTML = '';
            dw.strokes.concat(dw.cur ? [dw.cur] : []).forEach(s => {
                const p = document.createElementNS(DRAW_NS, 'path');
                p.setAttribute('d', penPathD(s.pts));
                const a = penAttrs(s); Object.keys(a).forEach(k => p.setAttribute(k, a[k]));
                g.appendChild(p);
            });
        }

        /* ---------- 그리기 모드 ---------- */
        function openDraw() {
            if (dw.on) { penWake(true); return; }   // ✏️ 이미 필기 중(쉬는 중 포함) = 펜꽂이를 다시 펼쳐요 (쓴 것 · 구석 펜꽂이 그대로)
            if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
            if (window.pkHas && !pkHas()) {                                      // ✏️ 필기구가 없으면 펜꽂이를 못 써요 (도련 10-31 · 🏪 기본상품 샵에서 받아요)
                showAsk('✏️ 아직 필기구가 없어요.<br><span style="font-size:12px;color:#777;">🏪 기본상품 샵 → 문구에서 색연필 · 형광펜 · 지우개를 받아 와요</span>', '🏪 받으러 가기', '닫기').then(go => { if (go && window.gdCabShop) gdCabShop(); });
                return;
            }
            if (selectedElement) { selectedElement.classList.remove('selected'); selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel(); }
            penMkLayer(); dw.strokes = []; dw.hist = []; dw.cur = null; dw.on = true; dw.rest = false;
            document.body.classList.add('draw-on');
            penSetTool(dw.tool);
            pcOpen();                                                          // ✏️ 모든 기기 · 모드에서 펜꽂이 (아래 펜 창은 없앴어요 · 도련 10-22)
            penRender();
        }
        function penMkLayer() {
            const canvas = drq('canvasArea');
            const svg = document.createElementNS(DRAW_NS, 'svg');
            svg.id = 'penLayer'; svg.setAttribute('class', 'draw-layer');
            svg.innerHTML = '<g></g><circle class="draw-ring" r="10" cx="-99" cy="-99"/>';
            canvas.appendChild(svg);
            dw.svg = svg; dw.ring = svg.lastChild;
            svg.addEventListener('pointerdown', penDown);
            svg.addEventListener('pointermove', penMove);
            svg.addEventListener('pointerup', penUp);
            svg.addEventListener('pointercancel', penUp);
            svg.addEventListener('pointerleave', () => penRing(null));
        }
        /* ✏️ 필기구 ↔ 다른 문구 자유롭게 (도련 10-21) : 필기구는 구석 펜꽂이를 톡 눌러야만 끝나요
           - 다른 문구를 들면 '쉬는 중' : 쓴 것은 페이지에 붙고 · 든 필기구는 구석 펜꽂이에 쏙 · 구석 펜꽂이는 그대로 보여요
           - 다시 쓰려면 구석 펜꽂이를 위로 밀거나 🗄️ 문구함의 펜꽂이 → 필기구를 뽑으면 다른 문구는 내려놔요 */
        function penFlush() {                                                  // 지금까지 쓴 것만 페이지에 붙이고 계속 써요
            const s = dw.strokes.slice(); if (!s.length) return;
            dw.strokes = []; dw.hist = []; dw.cur = null; penRender();
            penAttach(s);
        }
        function pcStow() {                                                    // 든 필기구를 조용히 펜꽂이에 (끝내지 않아요)
            const h = drq('pcHeld'); pcS.held = null; pcS.laid = null; pcS.press = null; pcS.carry = null; pcS.drag = null;
            if (h) { h.hidden = true; h.classList.remove('carry', 'in', 'laid'); }
            const n = drq('pcTipNote'); if (n) n.hidden = true;
            if (drq('pcTools')) pcFill();
        }
        function penRest() {
            if (pcS.memo) { pcMemoEnd(); return; }                             // 📝 메모 쓰기는 쓴 글 그대로 끝
            if (!dw.on) return;
            if (dw.cur) { dw.strokes.push(dw.cur); dw.cur = null; }
            dw.erasing = false; penRing(null);
            penFlush();
            if (pcS.held && pcDesk()) pcLayDown();                             // 🪑 책상 = 페이지에 놓아요 (여러 개 · 아래 pcLayDown)
            else if (pcS.held) {                                                    // ✏️ 든 필기구는 사라지지 않고 그 자리에 내려놔요 (도련 10-21 · 톡 누르면 다시 들어요)
                pcS.laid = pcS.held; pcS.held = null; pcS.press = null; pcS.carry = null;
                const h = drq('pcHeld'), b = h.getBoundingClientRect(); h.classList.remove('carry', 'in'); h.classList.add('laid');
                h.style.transform = `translate(${b.left + b.width / 2}px, ${b.top + b.height / 2}px) rotate(-28deg) translate(-15px, -75px)`;   // 놓인 필기구는 🪡 놓인 핀셋과 같은 방향 (끝이 왼쪽 위 · 손잡이 오른쪽 아래 · css .bd-tool.tweez · 도련 10-21)
                const n = drq('pcTipNote'); if (n) n.hidden = true;
            }
            pcShrink();
            const m = drq('pcMini'); if (m) m.hidden = false; pcLayout();
            if (dw.rest) return;
            dw.rest = true; document.body.classList.remove('draw-on'); document.body.classList.add('pen-rest');
            const r = drq('pcRoom'); if (r) r.classList.add('rest');
        }
        function penWake(open) {
            if (!dw.on) return;
            if (!dw.svg) penMkLayer(); else if (!dw.svg.isConnected) drq('canvasArea').appendChild(dw.svg);   // 쉬는 사이 페이지를 넘겼으면 새 페이지 위에
            if (dw.rest) {
                dw.rest = false; document.body.classList.remove('pen-rest'); document.body.classList.add('draw-on');
                const r = drq('pcRoom'); if (r) r.classList.remove('rest');
            }
            if (window.gdLetGo) gdLetGo(); if (window.skLetGo) skLetGo();     // 🪡 들고 있던 다른 문구는 내려놔요
            if (open) { if (pcS.held) pcStow(); pcReopen(); }
        }
        window.penRest = penRest;
        function penPoint(e) { return penPointXY(e.clientX, e.clientY); }
        function penPointXY(x, y) {
            const c = drq('canvasArea'), r = c.getBoundingClientRect();
            dw.k = r.width / (c.offsetWidth || r.width) || 1;
            return [(x - r.left) / dw.k, (y - r.top) / dw.k];
        }
        function penDown(e) {
            e.preventDefault(); e.stopPropagation();
            if (!pcS.held && !pcS.carry && window.rlOn && rlOn()) { rlMeasure(e); return; }   // 📏 문구함에서 꺼낸 자 : 아무것도 안 든 채 가장자리를 쓸면 길이 재기
            if (!pcS.held || pcS.carry) return;                 // 📒 필기구를 뽑아야 써져요
            const sn = dw.tool !== 'erase' && window.rlSnap ? rlSnap(e.clientX, e.clientY) : null;   // 📏 자 가장자리에 대고 그으면 반듯하게
            const at = sn ? rlProj(sn, e.clientX, e.clientY) : [e.clientX, e.clientY];
            pcHeldAt(at[0], at[1]);                                            // 연필심이 닿은 바로 그 자리
            try { dw.svg.setPointerCapture(e.pointerId); } catch (err) {}
            const pt = penPointXY(at[0], at[1]);
            if (dw.tool === 'erase') { dw.erasing = true; dw.hist.push(dw.strokes); dw.erased = false; dw.inks = penInks(); penRing(pt); penEraseAt(pt); return; }
            dw.cur = { tool: dw.tool, color: dw.color[dw.tool], w: dw.w[dw.tool], pts: [pt] };
            dw.snap = sn ? { sn, a: at, n: 1 } : null;
            penRender();
        }
        window.rlEdgeDown = e => {                                             // 📏 자 가장자리 안쪽을 누름 (js/ruler.js) : 필기구를 들었으면 여기서 긋기 시작
            if (!dw.on || !dw.svg || dw.tool === 'erase' || !pcS.held || pcS.carry) return false;
            penDown(e); return true;
        };
        function penMove(e) {
            if (dw.snap && dw.cur && !rlStay(dw.snap.sn, e.clientX, e.clientY)) { dw.snap = null; rlTell(null); }   // 자 바깥으로 끌면 떨어져서 이어 그려요 (자 안쪽으로는 붙은 채 · 도련 10-19)
            else if (!dw.snap && dw.cur && dw.cur.tool !== 'erase' && window.rlSnap) {   // 📏 긋다가 자 가장자리에 닿으면 거기서부터 자를 따라 곧게 (그어 온 선은 그대로)
                const sn = rlSnap(e.clientX, e.clientY);
                if (sn) { const at = rlProj(sn, e.clientX, e.clientY); dw.cur.pts.push(penPointXY(at[0], at[1])); dw.snap = { sn, a: at, n: dw.cur.pts.length }; }
            }
            if (dw.snap && dw.cur) {                                               // 📏 자에 붙은 곧은 선 : 붙은 자리 → 지금 자리 (가장자리 위)
                e.preventDefault(); e.stopPropagation();
                const at = rlProj(dw.snap.sn, e.clientX, e.clientY);
                pcHeldAt(at[0], at[1]);
                dw.cur.pts.length = dw.snap.n; dw.cur.pts.push(penPointXY(at[0], at[1])); rlTell(dw.snap.a, at);
                penRender(); return;
            }
            { if (!pcS.held || pcS.carry) return; if (dw.cur || dw.erasing || e.pointerType === 'mouse') pcHeldAt(e.clientX, e.clientY); }   // 📒 연필심이 따라와요
            if (dw.tool === 'erase' && !dw.erasing) penRing(penPoint(e));
            if (!dw.cur && !dw.erasing) return;
            e.preventDefault(); e.stopPropagation();
            const pt = penPoint(e);
            if (dw.erasing) penRing(pt);
            if (dw.erasing) { penEraseAt(pt); return; }
            const l = dw.cur.pts[dw.cur.pts.length - 1];
            if (Math.hypot(pt[0] - l[0], pt[1] - l[1]) < 1.5) return;
            if (dw.cur.tool === 'hi' && e.shiftKey) pt[1] = dw.cur.pts[0][1];      // PC : Shift 를 누르면 곧은 형광펜
            dw.cur.pts.push(pt);
            penRender();
        }
        function penUp(e) {
            if (e) e.stopPropagation();
            if (dw.erasing) { dw.erasing = false; if (!dw.erased) dw.hist.pop(); if (e && e.pointerType !== 'mouse') penRing(null); penRender(); if ((dw.inks || []).some(d => d.dirty) && typeof saveData === 'function') saveData(false); dw.inks = null; }
            if (dw.snap) { dw.snap = null; rlTell(null); }
            if (dw.cur) { dw.hist.push(dw.strokes); dw.strokes = dw.strokes.concat([dw.cur]); dw.cur = null; penRender(); }
        }
        /* 🧽 지우개 : 동그라미에 닿은 부분만 지우고, 선이 끊기면 두 개로 나눠요 */
        function penRing(pt) {
            const c = dw.ring; if (!c) return;
            c.setAttribute('r', dw.w.erase / 2);
            c.setAttribute('cx', pt ? pt[0] : -99); c.setAttribute('cy', pt ? pt[1] : -99);
        }
        function penDense(pts) {                       // 점 사이가 멀면 촘촘하게 (곧은 형광펜도 부분 지우기)
            const out = [pts[0]];
            for (let i = 1; i < pts.length; i++) {
                const a = pts[i - 1], b = pts[i], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
                for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
            }
            return out;
        }
        function penEraseAt(pt) {
            const r = dw.w.erase / 2;
            const near = (p, s) => Math.hypot(p[0] - pt[0], p[1] - pt[1]) < r + s.w * .35;
            let hit = false;
            const out = [];
            dw.strokes.forEach(s => {
                const pts = penDense(s.pts);
                if (!pts.some(p => near(p, s))) { out.push(s); return; }
                hit = true;
                let run = [];
                const keep = () => { if (run.length > (s.tool === 'hi' ? 1 : 0)) out.push({ tool: s.tool, color: s.color, w: s.w, pts: run }); run = []; };
                pts.forEach(p => { if (near(p, s)) keep(); else run.push(p); });
                keep();
            });
            if (hit) { dw.strokes = out; dw.erased = true; penRender(); }
            penEraseInk(pt, r);                                                   // 🧽 예전에 쓰고 완료한 글씨 · 그림도 언제든 지워요
        }
        /* ---------- 🧽 완료한 글씨 · 그림(페이지에 붙은 SVG)도 지우기 (도련 · 2026-10-17 · 지우개는 언제든지 글씨를 지울 수 있어야 해요)
           - 그림 속 선(path)을 다시 점으로 읽어서 (penPathD 모양 : M 시작 · Q 조절점 = 원래 점 · L 끝) 그 자리에서 지우고 다시 그려요
           - 옮기고 돌린 그림도 그 자리 그대로 · 다 지우면 그림이 없어져요 · 이건 ↶ 되돌리기에 안 들어가요 */
        const penIsInk = el => { const i = el.querySelector(':scope > img'), sr = i && (i.dataset.src || i.getAttribute('src')) || ''; return /^data:image\/svg/.test(sr) && (sr.indexOf('malang-draw') >= 0 || sr.indexOf('malang-draw'.replace(/-/g, '%2D')) >= 0 || decodeURIComponent(sr).indexOf('malang-draw') >= 0); };
        function penInkParse(el) {
            const img = el.querySelector(':scope > img'), sr = img.dataset.src || img.getAttribute('src');
            let txt = ''; try { txt = decodeURIComponent(sr.slice(sr.indexOf(',') + 1)); } catch (e) { return null; }
            const doc = new DOMParser().parseFromString(txt, 'image/svg+xml'), sv = doc.documentElement; if (!sv || sv.nodeName !== 'svg') return null;
            const vb = (sv.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number), bw = vb[2] || +sv.getAttribute('width'), bh = vb[3] || +sv.getAttribute('height');
            const strokes = [...sv.querySelectorAll('path')].map(p => {
                const n = (p.getAttribute('d') || '').match(/-?\d*\.?\d+(?:e-?\d+)?/gi), c = (p.getAttribute('d') || '').match(/[MQLl]/g); if (!n || !c) return null;
                const v = n.map(Number), pts = []; let k = 0;
                for (const cmd of c) {
                    if (cmd === 'M' || cmd === 'L') { pts.push([v[k], v[k + 1]]); k += 2; }
                    else if (cmd === 'Q') { pts.push([v[k], v[k + 1]]); k += 4; }     // 조절점 = 원래 찍은 점
                    else if (cmd === 'l') { k += 2; }
                }
                const tool = p.getAttribute('stroke-opacity') ? 'hi' : 'pen';
                return pts.length ? { tool, color: p.getAttribute('stroke'), w: +p.getAttribute('stroke-width') || 2, pts } : null;
            }).filter(Boolean);
            return { bw, bh, strokes };
        }
        function penInks() {                                                       // 지우기 시작할 때 페이지의 글씨 그림들
            const c = drq('canvasArea'); if (!c) return [];
            return [...c.querySelectorAll(':scope > .element-box')].filter(penIsInk).map(el => { const d = penInkParse(el); return d && d.strokes.length ? Object.assign(d, { el }) : null; }).filter(Boolean);
        }
        function penEraseInk(pt, r) {
            (dw.inks || []).forEach(d => {
                const el = d.el; if (!el.isConnected) return;
                const img = el.querySelector(':scope > img'), W = el.offsetWidth, H = el.offsetHeight, iw = img.offsetWidth || 1, ih = img.offsetHeight || 1;
                const s = parseFloat(el.dataset.scale) || 1, a = -(parseFloat(el.dataset.rotation) || 0) * Math.PI / 180;
                const cx = (parseFloat(el.dataset.posX) || 0) + W / 2, cy = (parseFloat(el.dataset.posY) || 0) + H / 2;
                const ux = pt[0] - cx, uy = pt[1] - cy, lx = (ux * Math.cos(a) - uy * Math.sin(a)) / s + W / 2, ly = (ux * Math.sin(a) + uy * Math.cos(a)) / s + H / 2;
                const fx = d.bw / iw, fy = d.bh / ih, P = [(lx - 1 - img.offsetLeft) * fx, (ly - 1 - img.offsetTop) * fy], rr = r * fx / s;
                if (P[0] < -rr - 40 || P[1] < -rr - 40 || P[0] > d.bw + rr + 40 || P[1] > d.bh + rr + 40) return;
                const near = (p, st) => Math.hypot(p[0] - P[0], p[1] - P[1]) < rr + st.w * .35;
                let hit = false; const out = [];
                d.strokes.forEach(st => {
                    const pts = penDense(st.pts);
                    if (!pts.some(p => near(p, st))) { out.push(st); return; }
                    hit = true; let run = [];
                    const keep = () => { if (run.length > (st.tool === 'hi' ? 1 : 0)) out.push({ tool: st.tool, color: st.color, w: st.w, pts: run }); run = []; };
                    pts.forEach(p => { if (near(p, st)) keep(); else run.push(p); });
                    keep();
                });
                if (!hit) return;
                d.strokes = out; dw.erased = true;
                if (!out.length) { el.remove(); if (selectedElement === el) selectedElement = null; return; }
                const paths = out.map(st => { const at = penAttrs(st); return `<path d="${penPathD(st.pts)}" ${Object.keys(at).map(k => `${k}="${at[k]}"`).join(' ')}/>`; }).join('');
                const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.bw} ${d.bh}" width="${d.bw}" height="${d.bh}"><!--malang-draw-->${paths}</svg>`);
                if (img.dataset.src) img.dataset.src = url;
                img.src = url; d.dirty = true;
            });
        }
        /* ---------- ✏️ 필기구 그림 = 🧁 상품공방 그림 그대로 (js/gdpic.js · js/pencase.js pkSvg · 도련 11-02 · 앱은 모양을 그리지 않아요 · 색 = 그어지는 선 색) ---------- */
        function penSetTool(t) {                       // 뽑은 필기구로 바꿔 들기 (색 · 굵기는 펜꽂이 필기구 그대로)
            dw.tool = t;
            const l = drq('penLayer'); if (l) l.classList.toggle('erasing', t === 'erase');
            if (t !== 'erase') penRing(null);
        }

        /* ✓ 완료 : 그린 선들 → 다이어리 그림 하나 */
        function penDone() {
            const strokes = dw.strokes.slice();
            penClose();
            penAttach(strokes);
        }
        function penAttach(strokes) {
            if (!strokes.length) return;
            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            strokes.forEach(s => s.pts.forEach(p => { const r = s.w / 2 + 2; x0 = Math.min(x0, p[0] - r); y0 = Math.min(y0, p[1] - r); x1 = Math.max(x1, p[0] + r); y1 = Math.max(y1, p[1] + r); }));
            const bw = Math.max(10, Math.ceil(x1 - x0)), bh = Math.max(10, Math.ceil(y1 - y0));
            const paths = strokes.map(s => {
                const a = penAttrs(s);
                const d = penPathD(s.pts.map(p => [p[0] - x0, p[1] - y0]));
                return `<path d="${d}" ${Object.keys(a).map(k => `${k}="${a[k]}"`).join(' ')}/>`;
            }).join('');
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bw} ${bh}" width="${bw}" height="${bh}"><!--malang-draw-->${paths}</svg>`;
            if (!addImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))) return;
            const el = document.querySelector('#canvasArea .element-box:last-child'); if (!el) return;
            const img = el.querySelector('img');
            el.style.width = bw + 'px'; el.style.height = bh + 'px';
            el.dataset.posX = 0; el.dataset.posY = 0; el.dataset.scale = 1; el.dataset.rotation = 0;
            el.style.transform = 'translate(0px, 0px) scale(1) rotate(0deg)';
            // 그린 자리에 정확히 놓기 (화면 확대 · 여백까지 계산)
            const c = drq('canvasArea').getBoundingClientRect(), k = dw.k || 1, ir = img.getBoundingClientRect();
            const ew = bw + (bw - ir.width / k), eh = bh + (bh - ir.height / k);
            el.style.width = ew + 'px'; el.style.height = eh + 'px';
            const ir2 = img.getBoundingClientRect();
            const px = (c.left + x0 * k - ir2.left) / k, py = (c.top + y0 * k - ir2.top) / k;
            el.dataset.posX = px; el.dataset.posY = py;
            el.style.transform = `translate(${px}px, ${py}px) scale(1) rotate(0deg)`;
            const fix = n => requestAnimationFrame(() => {                     // 📎 바인더 : 붙은 쪽(bd-l · bd-r)만큼 벌어져 보여서 그린 자리에서 밀려나요 → 화면에서 그린 자리 그대로 맞추기 (도련 10-19)
                if (!el.isConnected) return;
                const r3 = img.getBoundingClientRect(), dx = (c.left + x0 * k - r3.left) / k, dy = (c.top + y0 * k - r3.top) / k;
                if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
                const x = +el.dataset.posX + dx, y = +el.dataset.posY + dy; el.dataset.posX = x; el.dataset.posY = y;
                el.style.transform = `translate(${x}px, ${y}px) scale(1) rotate(0deg)`; saveData(false);
                if (n) fix(n - 1);
            });
            fix(1);
            if (selectedElement) selectedElement.classList.remove('selected');
            selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel();
            saveData(false);
        }
        function penClose() {
            dw.on = false; dw.rest = false; dw.cur = null; dw.snap = null; dw.strokes = []; dw.hist = []; dw.ring = null;
            const l = drq('penLayer'); if (l) l.remove();
            dw.svg = null;
            pcClose();
            document.body.classList.remove('draw-on', 'pen-rest');
            const r = drq('pcRoom'); if (r) r.classList.remove('rest');
        }

        /* ---------- ✏️ 펜꽂이 (모든 기기 · 수첩 · 고르는 창 모드 공통 · 아래 펜 창은 10-22 없앰 · 도련)
           - 예쁜 펜꽂이에 색연필 · 형광펜 · 지우개가 섞여 꽂혀 있어요 → 옆으로 끌면 비켜나고, 위로 쭉 끌면 쏙 뽑혀요
           - 뽑으면 펜꽂이는 오른쪽 아래 구석의 작은 펜꽂이가 되고, 뽑은 필기구만 손에 들려요
           - 쓰면 연필심(지우개는 바닥)이 손가락 · 마우스가 닿은 바로 그 자리를 따라가요
           - 필기구를 꾹 누르면 집어 들어 옮겨요 → 작은 펜꽂이에 꽂으면 ✓ 완료 · 화면 밖으로 던지면 '지울까요?'
           - 작은 펜꽂이를 톡 눌러도 꽂혀요 ---------- */
        const PC_ANG = -145;                               // 들고 있는 필기구 기울기 (연필심이 왼쪽 아래 · 몸통은 오른쪽 위)
        const pcS = { tools: [], held: null, tip: null, carry: null, press: null, drag: null, z: 10 };
        const pcSvg = o => o.id && window.gdPicSvg ? gdPicSvg(o.id) : '';
        const pcTipOf = o => o.tip;                                             // 그림 안 닿는 점 = 쓰는끝 (크기 상자 안 · js/gdpic.js gdPicTip)
        const pcList = () => window.pkCupList ? pkCupList() : [];          // 👝 보관함에서 고른 것만 (js/pencase.js · 🧁 상품 필기구 · 색 = 그 상품 색)
        function pcBuild() {
            let r = drq('pcRoom'); if (r) return r;
            r = document.createElement('div'); r.id = 'pcRoom'; r.className = 'pc-room'; r.hidden = true;
            r.innerHTML = `<div class="pc-cup" id="pcCup"><p class="pc-hint">도구를 골라 <b>위로 쏙</b> 뽑아요 · 옆으로 밀면 비켜나요</p>`
                + `<button type="button" class="pc-x" aria-label="닫기">✕</button>`
                + `<div class="pc-back"></div><div class="pc-tools" id="pcTools"></div><div class="pc-front"><i></i><button type="button" class="pc-box" aria-label="보관함 열기 (꽂을 필기구 고르기)"><small>색연필 · 형광펜 · 지우개</small><b>♡ 필기구 보관함</b><em>👆 눌러서 열기 ›</em></button></div></div>`
                + `<div class="pc-held" id="pcHeld" hidden></div><p class="pc-tipnote" id="pcTipNote" hidden>다 쓰면 손에 든 것을 꾹 집어 <b>구석 펜꽂이</b>에 꽂아요 ✏️</p>`
                + `<button type="button" class="pc-mini" id="pcMini" hidden aria-label="펜꽂이 (꽂으면 완료)"><span class="pc-mini-tops">${pcList().slice(0, 3).map(o => `<i>${pcSvg(o)}</i>`).join('')}</span><span class="pc-mini-cup"></span></button>`;
            document.body.appendChild(r);
            r.querySelector('.pc-box').onclick = () => { if (pcS.held) return; if (UI.desk() && window.dkwTrayOpen) { dkwTrayOpen(); return; } if (window.openPencase) openPencase(); };   // 🪑 책상 = 서랍장 문구함 서랍 (js/deskgd.js)   // 👝 보관함 : 꽂을 필기구 고르기 (js/pencase.js · 닫으면 다시 꽂아요)
            r.querySelector('.pc-x').onclick = () => { if (pcS.memo) pcMemoSkip(); else penClose(); };
            drq('pcHeld').addEventListener('pointerdown', e => {               // ✏️ 내려놓은 필기구를 톡 = 다시 들기 (다른 문구는 내려놔요 · 끌면 그대로 따라와요)
                const o = pcS.laid; if (!o || e.button > 0) return;
                e.preventDefault(); e.stopPropagation();
                const h = drq('pcHeld'); pcS.laid = null; h.classList.remove('laid');
                penWake(false);
                pcS.held = o; dw.tool = o.tool; if (o.tool !== 'erase') dw.color[o.tool] = o.color; dw.w[o.tool] = o.w; penSetTool(o.tool);
                pcS.carry = { id: e.pointerId, off: [0, 0] }; h.classList.add('carry'); pcHeldAt(e.clientX, e.clientY);   // 집은 자리에 연필심 (다시 바로 든 모양으로)
                window.toolGlow && toolGlow(h);
                if (navigator.vibrate) try { navigator.vibrate(10); } catch (er) {}
            });
            const mini = drq('pcMini');
            mini.onclick = () => { if (pcS.mini && pcS.mini.up) { pcS.mini = null; return; } if (pcS.held) pcPutBack(); else if (pcS.laid) { pcS.laid = null; drq('pcHeld').classList.remove('laid'); pcPutBack(); } else if (pcS.memo) pcMemoEnd(); else penDone(); };   // ✏️ 내려놓은 필기구도 쏙 빨려 들어가며 끝 (도련 10-21)   // 손이 비어 있으면 톡 = 끝
            mini.addEventListener('pointerdown', e => { pcS.mini = null; if (pcS.held || pcS.memo || e.button > 0) return; pcS.mini = { id: e.pointerId, y: e.clientY, up: false }; });
            mini.addEventListener('pointermove', e => { const m = pcS.mini; if (m && m.id === e.pointerId && !m.up && m.y - e.clientY > 30) { m.up = true; pcReopen(); } });
            return r;
        }
        /* 페이지 가운데 길쭉한 펜꽂이 · 작은 펜꽂이는 페이지 오른쪽 아래 (하단 메뉴 밖으로 안 나가게) */
        function pcLayout() {
            const pg = drq('canvasArea'), cup = drq('pcCup'), mini = drq('pcMini'), note = drq('pcTipNote'); if (!pg || !cup) return;
            const r = window.dyVisRect ? dyVisRect(pg.getBoundingClientRect()) : pg.getBoundingClientRect(), cw = cup.offsetWidth, ch = cup.offsetHeight;   // 📱 폰 = 보이는 오른쪽 쪽 가운데
            cup.style.left = Math.round(r.left + r.width / 2 - cw / 2) + 'px';
            cup.style.top = Math.round(Math.max(8, r.top + r.height / 2 - ch / 2 + 10)) + 'px';
            const vv = window.visualViewport, bot = Math.min(r.bottom, vv ? vv.offsetTop + vv.height : innerHeight);   // 📱 자판이 올라오면 그 위로
            if (mini) { mini.style.left = Math.round(r.right - (mini.offsetWidth || 62) - 12) + 'px'; mini.style.top = Math.round(bot - (mini.offsetHeight || 84) - 12) + 'px'; }   // 🪑 책상 펜꽂이 모양이면 그 크기
            if (note) { note.style.right = Math.round(innerWidth - r.right + 10) + 'px'; note.style.top = Math.round(bot - 84 - 22) + 'px'; }
        }
        addEventListener('resize', () => { const r = drq('pcRoom'); if (r && !r.hidden) pcLayout(); });
        if (window.visualViewport) visualViewport.addEventListener('resize', () => { const r = drq('pcRoom'); if (r && !r.hidden) { pcLayout(); if (pcS.memo) mfAim(); } });
        function pcPlace(o) {
            const lift = o.lift || 0, a = o.a * (1 - Math.min(1, lift / 90));
            o.el.style.transform = `translate(${o.x}px, ${o.y - lift}px) rotate(${a}deg)`;   // 펜꽂이 바닥이 돌아가는 점
        }
        function pcOpen(memo) {
            const r = pcBuild(); r.hidden = false;
            requestAnimationFrame(pcLayout);
            Object.assign(pcS, { held: null, tip: null, carry: null, press: null, drag: null, memo: memo || null });
            r.querySelector('.pc-hint').innerHTML = '도구를 골라 <b>위로 쏙</b> 뽑아요 · 옆으로 밀면 비켜나요';
            const cup = drq('pcCup'); cup.classList.remove('gone'); cup.style.transform = '';
            drq('pcHeld').hidden = true; drq('pcMini').hidden = true; drq('pcTipNote').hidden = true;
            pcFill();
        }
        window.pcRefill = () => {                          // 👝 보관함에서 바꾸면 다시 꽂아요
            const r = drq('pcRoom');
            if (r && !r.hidden && !pcS.held) pcFill();
        };
        function pcFill() {                                // 펜꽂이에 필기구 꽂기 (👝 보관함에서 바꾸면 다시 꽂아요)
            const box = drq('pcTools'); box.textContent = '';
            const L = pcList().slice();                       // 👝 보관함에서 고른 것 (색연필 · 형광펜 · 지우개 · ✂️ 칼 · 📏 자는 🗄️ 문구함에서)
            const n = L.length;
            pcS.tools = L.map((o, i) => {
                const el = document.createElement('div'); el.className = 'pc-tool' + (o.tool === 'erase' ? ' er' : ''); el.innerHTML = pcSvg(o);
                const sv = el.querySelector('svg'); if (sv && o.tool !== 'erase') sv.setAttribute('preserveAspectRatio', 'none');   // 실제처럼 길쭉하게
                o.el = el; o.x = Math.round(-76 + i * 152 / Math.max(1, n - 1)); o.a = o.x * .17 + (i % 3 - 1) * 1.5; o.y = -((i * 7) % 3 * 14) + (o.tool === 'hi' ? 12 : 0); o.lift = 0;   // 넓은 통에 부채꼴로 기대어요 (윗부분이 넉넉히 벌어져 고르기 쉬워요)
                el.style.zIndex = o.tool === 'erase' ? 3 : i % 2 ? 2 : 1;   // 짧은 지우개는 앞쪽에
                pcPlace(o); box.appendChild(el); pcBindTool(o);
                return o;
            });
        }
        function pcBindTool(o) {
            const el = o.el;
            el.addEventListener('pointerdown', e => {
                if (pcS.held || e.button > 0) return;
                e.preventDefault(); e.stopPropagation();
                try { el.setPointerCapture(e.pointerId); } catch (er) {}
                pcS.drag = { o, id: e.pointerId, x: e.clientX, y: e.clientY, x0: o.x, a0: o.a };
                el.classList.add('grab'); el.style.zIndex = ++pcS.z;
            });
            el.addEventListener('pointermove', e => {
                const d = pcS.drag;
                if (pcS.carry && pcS.carry.id === e.pointerId) { pcCarryMove(e); return; }   // 뽑은 채 그대로 끌고 있어요
                if (!d || d.o !== o || d.id !== e.pointerId) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                o.x = Math.max(-90, Math.min(90, d.x0 + dx)); o.a = Math.max(-16, Math.min(16, d.a0 + dx * .15));   // 옆으로 밀면 비켜나요
                o.lift = Math.max(0, -dy);
                pcPlace(o);
                if (o.lift > 110) pcPick(o, e);                                  // 위로 쭉 → 쏙 뽑혀요
            });
            const up = e => {
                if (pcS.carry && pcS.carry.id === e.pointerId) { pcCarryEnd(e); return; }
                const d = pcS.drag; if (!d || d.o !== o || d.id !== e.pointerId) return;
                pcS.drag = null; el.classList.remove('grab'); o.lift = 0; pcPlace(o);   // 덜 뽑으면 다시 쏙 들어가요
            };
            el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        }
        /* 뽑기 : 펜꽂이는 구석의 작은 펜꽂이로 · 뽑은 필기구만 손에 */
        function pcPick(o, e) {
            if (dw.on) penWake(false);                                         // ✏️ 쉬다가 다시 뽑으면 다른 문구는 내려놔요
            pcS.drag = null; o.el.classList.remove('grab'); o.el.style.visibility = 'hidden';
            pcS.held = o;
            pcShrink();
            if (pcS.memo) mhlApply(pcS.memo, o);                                 // 📝 메모 : 고른 필기구로 글씨 모양이 바로 바뀌어요
            else { dw.tool = o.tool; if (o.tool !== 'erase') dw.color[o.tool] = o.color; dw.w[o.tool] = o.w; penSetTool(o.tool); }
            const h = drq('pcHeld'); h.innerHTML = pcSvg(o); h.style.width = o.box[0] + 'px'; h.style.height = o.box[1] + 'px'; h.hidden = false; h.classList.add('carry');   // 📐 상품 크기
            pcS.carry = { id: e.pointerId, off: [0, 0] };                         // 뽑은 손 그대로 들고 있어요 (연필심 = 손가락)
            pcHeldAt(e.clientX, e.clientY);
            if (window.toolGlow) toolGlow(h);                                  // ✨ 뽑는 순간 한 번 반짝
            if (navigator.vibrate) try { navigator.vibrate(12); } catch (er) {}
            const note = drq('pcTipNote'); note.hidden = false; clearTimeout(pcS.noteTm);
            note.innerHTML = pcS.memo ? '이제 글을 써요 · 다 쓰면 <b>구석 펜꽂이</b>을 톡 ✏️' : '다 쓰면 손에 든 것을 꾹 집어 <b>구석 펜꽂이</b>에 꽂아요 ✏️'; pcS.noteTm = setTimeout(() => { note.hidden = true; }, 4200);
        }
        /* 펜꽂이가 구석 작은 펜꽂이 자리로 쏙 줄어요 (손이 차면) */
        function pcShrink() {
            const cup = drq('pcCup'); if (!cup || cup.classList.contains('gone')) return;
            drq('pcMini').hidden = false; pcLayout();
            const cr = cup.getBoundingClientRect(), mr = drq('pcMini').getBoundingClientRect();
            cup.style.transform = `translate(${mr.left + mr.width / 2 - (cr.left + cr.width / 2)}px, ${mr.bottom - cr.bottom}px) scale(.22)`;
            cup.classList.add('gone');
        }
        /* 구석 펜꽂이를 위로 밀면 다시 커져요 (손이 비어 있을 때 · 필기구를 더 뽑으려고) */
        function pcReopen() {
            const cup = drq('pcCup'); if (!cup || pcS.held) return;
            if (dw.rest) penWake(false);
            if (pcS.laid) pcStow();                                            // 내려놓은 필기구는 펜꽂이에 다시 꽂아요
            drq('pcMini').hidden = true; drq('pcTipNote').hidden = true;
            cup.classList.remove('gone'); cup.style.transform = '';
        }
        function pcHeldAt(x, y, da) {
            const h = drq('pcHeld'); if (!h || !pcS.held) return;
            const t = pcTipOf(pcS.held); pcS.tip = [x, y];
            h.style.transform = `translate(${x}px, ${y}px)${handFlip()} rotate(${PC_ANG + (da || 0)}deg) translate(${-t[0]}px, ${-t[1]}px)`;
        }
        /* 필기구 몸통 위인지 (연필심 쪽 20px 은 빼요 → 쓰기) */
        function pcOnBody(x, y) {
            if (!pcS.held || !pcS.tip) return false;
            const a = PC_ANG * Math.PI / 180, ux = -Math.sin(a) * (handLeft() ? -1 : 1), uy = Math.cos(a), t = pcTipOf(pcS.held);
            const px = x - pcS.tip[0], py = y - pcS.tip[1], along = px * ux + py * uy, across = Math.abs(px * uy - py * ux);
            return along > 22 + (t[1] - 2) && along < pcS.held.box[1] - t[1] && across < pcS.held.box[0] / 2 + 3;
        }
        const pcOverMini = (x, y) => { const m = drq('pcMini'); if (!m || m.hidden) return false; const r = m.getBoundingClientRect(); return x > r.left - 16 && x < r.right + 16 && y > r.top - 24 && y < r.bottom + 16; };
        function pcCarryMove(e) {
            const c = pcS.carry; pcHeldAt(e.clientX + c.off[0], e.clientY + c.off[1]);
            drq('pcMini').classList.toggle('over', pcOverMini(e.clientX, e.clientY));
        }
        function pcCarryEnd(e) {
            const x = e.clientX, y = e.clientY;
            pcS.carry = null; drq('pcHeld').classList.remove('carry'); drq('pcMini').classList.remove('over');
            if (e.type !== 'pointercancel' && pcOverMini(x, y)) { pcPutBack(); return; }                 // 🖊️ 꽂으면 완료
            if (x < 6 || y < 6 || x > innerWidth - 6 || y > innerHeight - 6) { pcThrow(); return; }        // 화면 밖으로 휙
            if (pcS.memo) mfWrite();                                                                        // 📝 메모 : 손을 떼면 바로 써요 (자판이 올라와요)
            else if (pcDesk()) penRest();                                                                   // 🪑 책상 = 꾹 집어 옮겨 놓으면 그 자리에 내려놔요 (도련 11-03)
        }
        /* 꾹 누르면 집어 들기 (그냥 쓰려고 누른 건 그대로 써져요) */
        document.addEventListener('pointerdown', e => {
            if (!(dw.on || pcS.memo) || !pcS.held || pcS.carry || !pcOnBody(e.clientX, e.clientY)) return;
            const p = pcS.press = { id: e.pointerId, x: e.clientX, y: e.clientY };
            p.tm = setTimeout(() => {
                if (pcS.press !== p) return;
                pcS.press = null;
                if (dw.cur) { dw.cur = null; penRender(); }                       // 누르는 사이 찍힌 점은 지워요
                if (dw.erasing) { dw.erasing = false; if (!dw.erased) dw.hist.pop(); penRing(null); }
                pcS.carry = { id: p.id, off: [pcS.tip[0] - p.x, pcS.tip[1] - p.y] };
                drq('pcHeld').classList.add('carry');
                if (navigator.vibrate) try { navigator.vibrate(10); } catch (er) {}
            }, 320);
        }, true);
        document.addEventListener('pointermove', e => {
            const p = pcS.press; if (p && p.id === e.pointerId && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) { clearTimeout(p.tm); pcS.press = null; }
            if (pcS.carry && pcS.carry.id === e.pointerId) { e.preventDefault(); pcCarryMove(e); }
        }, true);
        const pcDocUp = e => {
            const p = pcS.press; if (p && p.id === e.pointerId) { clearTimeout(p.tm); pcS.press = null; }
            if (pcS.carry && pcS.carry.id === e.pointerId) pcCarryEnd(e);
        };
        document.addEventListener('pointerup', pcDocUp, true); document.addEventListener('pointercancel', pcDocUp, true);
        /* 작은 펜꽂이에 쏙 꽂고 ✓ 완료 */
        function pcPutBack() {
            const h = drq('pcHeld'), m = drq('pcMini').getBoundingClientRect();
            pcS.held = null; pcS.press = null; pcS.carry = null;
            h.classList.add('in'); h.style.transform = `translate(${m.left + m.width / 2}px, ${m.top + 6}px) rotate(-180deg) translate(-15px, -2px) scale(.35)`;
            if (navigator.vibrate) try { navigator.vibrate(8); } catch (er) {}
            setTimeout(() => { h.classList.remove('in'); if (pcS.memo) pcMemoEnd(); else penDone(); }, 280);
        }
        function pcThrow() {
            if (pcS.memo) { pcMemoEnd(); return; }                               // 📝 메모 : 쓴 글은 그대로
            if (!dw.strokes.length) { penClose(); return; }
            showMsg('쓴 것을 모두 지울까요?', true).then(ok => { if (ok) penClose(); else pcHeldAt(innerWidth / 2, innerHeight / 2); });
        }
        function pcClose() {
            const r = drq('pcRoom'); if (r) r.hidden = true;
            pcS.held = null; pcS.laid = null; pcS.carry = null; pcS.press = null; pcS.drag = null;
            const h = drq('pcHeld'); if (h) h.classList.remove('laid', 'carry');
        }
        /* ---------- ✏️ 📒 수첩 모드 : 메모에 글 쓰기 (도련 · 2026-10-13)
           - 페이지의 메모(글상자 · 떡메)를 톡 눌러 쓰려는 순간 펜꽂이가 떠요 → 필기구를 위로 쏙 뽑아요
           - 색연필 = 그 색 · 연필 느낌 글씨 / 형광펜 = 글씨가 있는 줄마다 칠한 띠 / 지우개 = 원래 글씨로
           - 한 메모 = 마지막에 고른 필기구 하나 · 메모마다 저장돼요 (k 색 · hl 형광펜 색 · pn 연필 느낌)
           - 자판으로 쓰면 손에 든 필기구 끝이 커서를 따라가며 사각사각 움직여요
           - 다 쓰면 구석 작은 펜꽂이를 톡 (또는 꾹 집어 꽂기 · 메모 밖을 눌러도 쏙 들어가요)
           - ✕ 를 누르면 필기구 없이 그대로 써요 ---------- */
        const mhlOk = c => /^#[0-9a-f]{6}$/i.test(c || '');
        function mhlLook(ta, hl, pn) {                                        // 불러올 때 · 고를 때
            if (mhlOk(hl)) ta.dataset.hl = hl; else delete ta.dataset.hl;
            if (pn) ta.dataset.pn = 1; else delete ta.dataset.pn;
            ta.classList.toggle('pencil', !!pn);
            if (!ta.dataset.hl) { const l = ta.parentElement && ta.parentElement.querySelector(':scope > .mhl'); if (l) l.remove(); return; }
            mhlWatch(ta);
        }
        function mhlApply(ta, o) {
            const font = ta.dataset.font, size = ta.dataset.size;
            if (o.tool === 'pen') { styleTextarea(ta, font, o.color, size); mhlLook(ta, '', 1); }
            else if (o.tool === 'hi') { styleTextarea(ta, font, DEFAULT_TEXT_COLOR, size); mhlLook(ta, o.color, 0); }
            else { styleTextarea(ta, font, DEFAULT_TEXT_COLOR, size); mhlLook(ta, '', 0); }   // 지우개 = 원래 글씨
            if (typeof updateTextPanel === 'function') updateTextPanel();
            if (typeof saveData === 'function') saveData();
        }
        let mhlRO = null;
        function mhlWatch(ta) {                                               // 상자 크기가 바뀌거나 처음 보일 때 다시 칠해요
            if (!window.ResizeObserver) { requestAnimationFrame(() => mhlPaint(ta)); return; }
            if (!mhlRO) mhlRO = new ResizeObserver(es => es.forEach(e => { if (e.target.dataset.hl) mhlPaint(e.target); }));
            mhlRO.observe(ta);
            if (ta.isConnected) requestAnimationFrame(() => mhlPaint(ta));
        }
        let mhlMir = null;
        const MHL_COPY = ['boxSizing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'wordSpacing', 'textIndent', 'textAlign', 'tabSize'];
        function mhlMeasure(ta, upto) {                                      // 보이지 않는 복사본에 글씨를 넣고 재요 (돌리기 · 크기와 상관없는 원래 크기)
            if (!mhlMir) { mhlMir = document.createElement('div'); mhlMir.className = 'mhl-mirror'; mhlMir.setAttribute('aria-hidden', 'true'); document.body.appendChild(mhlMir); }
            const cs = getComputedStyle(ta); MHL_COPY.forEach(k => { mhlMir.style[k] = cs[k]; });
            mhlMir.style.width = ta.clientWidth + 'px'; mhlMir.style.boxSizing = 'border-box';   // 글씨가 줄 바뀌는 너비 (테두리 · 스크롤 막대 빼고)
            mhlMir.textContent = upto == null ? ta.value : ta.value.slice(0, upto);
            const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) || 18) * 1.2;
            return lh;
        }
        function mhlPaint(ta) {
            const el = ta.parentElement; if (!el || !ta.isConnected) return;
            let l = el.querySelector(':scope > .mhl');
            const c = ta.dataset.hl;
            if (!c) { if (l) l.remove(); return; }
            if (!l) { l = document.createElement('div'); l.className = 'mhl'; l.setAttribute('aria-hidden', 'true'); ta.after(l); }
            l.style.cssText = `left:${ta.offsetLeft}px;top:${ta.offsetTop}px;width:${ta.offsetWidth}px;height:${ta.offsetHeight}px`;
            l.textContent = '';
            if (!ta.value.trim()) return;
            const lh = mhlMeasure(ta), node = mhlMir.firstChild; if (!node) return;
            const rg = document.createRange(); rg.selectNodeContents(mhlMir);
            const base = mhlMir.getBoundingClientRect(), st = ta.scrollTop;
            let n = 0;
            for (const r of rg.getClientRects()) {                                // 글씨가 있는 줄 조각마다 띠 하나 (살짝 삐뚤게)
                if (r.width < 4) continue;
                const i = document.createElement('i'), wob = (n++ % 3 - 1) * .6;
                i.style.cssText = `left:${r.left - base.left - 3}px;top:${r.top - base.top + lh * .3 - st}px;width:${r.width + 6}px;height:${lh * .52}px;background:${c};transform:rotate(${wob}deg)`;
                l.appendChild(i);
            }
        }
        window.mhlLook = mhlLook; window.mhlPaint = mhlPaint;

        /* 커서 자리 (화면 좌표) : 복사본으로 상자 안 자리를 재고 → 상자 안에 작은 점을 놓아 돌리기 · 크기 · 확대까지 그대로 */
        function mfCaret(ta) {
            const lh = mhlMeasure(ta, ta.selectionEnd == null ? ta.value.length : ta.selectionEnd);
            const mk = document.createElement('span'); mk.textContent = '\u200b'; mhlMir.appendChild(mk);
            const x = ta.offsetLeft + mk.offsetLeft + 1, y = ta.offsetTop + mk.offsetTop + lh * .78 - ta.scrollTop;
            const el = ta.parentElement; let pr = el.querySelector(':scope > .mf-probe');
            if (!pr) { pr = document.createElement('i'); pr.className = 'mf-probe'; el.appendChild(pr); }
            pr.style.left = x + 'px'; pr.style.top = y + 'px';
            const r = pr.getBoundingClientRect();
            return [r.left + r.width / 2, r.top + r.height / 2];
        }
        const mf = { pos: null, target: null, raf: 0, wig: 0, last: 0 };
        function mfAim() {
            const ta = pcS.memo; if (!ta || !pcS.held || pcS.carry || document.activeElement !== ta) return;
            mf.target = mfCaret(ta); if (!mf.pos) mf.pos = (pcS.tip || mf.target).slice();
            if (!mf.raf) { mf.last = performance.now(); mf.raf = requestAnimationFrame(mfFrame); }
        }
        function mfFrame(now) {
            mf.raf = 0; if (!mf.target || !pcS.held || pcS.carry || !pcS.memo) return;
            const dt = Math.min(50, now - mf.last), k = 1 - Math.pow(.001, dt / 240); mf.last = now;
            mf.pos[0] += (mf.target[0] - mf.pos[0]) * k; mf.pos[1] += (mf.target[1] - mf.pos[1]) * k; mf.wig = Math.max(0, mf.wig - dt / 320);
            const w = mf.wig, t = now / 1000;                                   // 사각사각 : 처음과 크게 한 것의 중간 (도련 · 2026-10-13)
            const dx = Math.sin(t * 42) * 4.35 * w, dy = Math.cos(t * 29) * 2.95 * w - 2 * w, da = Math.sin(t * 33) * 3 * w;   // 좌우 · 위아래 · 기울기
            pcHeldAt(mf.pos[0] + dx, mf.pos[1] + dy, da);
            if (Math.abs(mf.target[0] - mf.pos[0]) > .2 || Math.abs(mf.target[1] - mf.pos[1]) > .2 || mf.wig > 0) mf.raf = requestAnimationFrame(mfFrame);
        }
        function mfWrite() {                                                   // 손을 뗀 그 자리에서 메모로 → 커서 따라가기
            const ta = pcS.memo; if (!ta) return;
            mf.pos = pcS.tip ? pcS.tip.slice() : null;
            pcS.memoFocus = true;
            try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); }
            pcS.memoFocus = false;
            mfAim();
        }
        function pcOpenMemo(ta) {
            if (dw.on) return;
            pcOpen(ta); mf.pos = null;
            drq('pcRoom').classList.add('memo');
            drq('pcRoom').querySelector('.pc-hint').innerHTML = '쓸 필기구를 <b>위로 쏙</b> 뽑아요 · ✕ 는 그냥 쓰기';
        }
        function pcMemoSkip() {                                                // ✕ : 필기구 없이 그대로 써요
            const ta = pcS.memo; pcMemoEnd();
            if (ta && ta.isConnected) { pcS.memoFocus = true; try { ta.focus({ preventScroll: true }); } catch (e) {} pcS.memoFocus = false; }
        }
        function pcMemoEnd() {
            if (!pcS.memo) return;
            const ta = pcS.memo; pcS.memo = null; mf.target = null;
            const pr = ta.parentElement && ta.parentElement.querySelector(':scope > .mf-probe'); if (pr) pr.remove();
            const r = drq('pcRoom'); if (r) r.classList.remove('memo');
            pcClose();
        }
        /* 수첩 모드에서 메모를 톡 눌러 쓰려는 순간 (끌어서 옮기는 건 그대로) */
        let mfTapAt = 0, mfTapTa = null;
        document.addEventListener('pointerdown', e => {
            const ta = e.target && e.target.closest && e.target.closest('#canvasArea .element-box > textarea');
            mfTapTa = ta; mfTapAt = ta ? performance.now() : 0;
        }, true);
        document.addEventListener('focusin', e => {
            const ta = e.target;
            if (dw.on || pcS.memoFocus || ta.tagName !== 'TEXTAREA' || ta.readOnly || !ta.closest('#canvasArea .element-box')) return;
            if (pcS.memo === ta) { mfAim(); return; }
            if (ta !== mfTapTa || performance.now() - mfTapAt > 1500) return;     // 손으로 누른 때만
            if (pcS.memo) pcMemoEnd();
            ta.blur();                                                         // 자판은 필기구를 뽑은 뒤에 올라와요
            pcOpenMemo(ta);
        });
        document.addEventListener('focusout', e => {
            const ta = pcS.memo; if (!ta || e.target !== ta) return;
            setTimeout(() => {
                if (pcS.memo !== ta || document.activeElement === ta || pcS.carry || pcS.press || !pcS.held) return;
                pcPutBack();                                                   // 메모 밖을 누르면 필기구는 쏙 펜꽂이로
            }, 300);
        });
        document.addEventListener('selectionchange', () => { if (pcS.memo) mfAim(); });
        document.addEventListener('input', e => { const ta = e.target; if (ta && ta.dataset && ta.dataset.hl) mhlPaint(ta); if (pcS.memo === ta) { mf.wig = 1; mfAim(); } }, true);
        document.addEventListener('compositionupdate', e => { if (pcS.memo === e.target) { mf.wig = 1; requestAnimationFrame(() => { if (e.target.dataset.hl) mhlPaint(e.target); mfAim(); }); } }, true);
        ['keyup', 'click', 'scroll'].forEach(t => document.addEventListener(t, e => { if (pcS.memo && e.target === pcS.memo) { if (t === 'scroll' && pcS.memo.dataset.hl) mhlPaint(pcS.memo); mfAim(); } }, true));
        /* 그리는 동안에는 페이지 넘기기(끌기)를 막아요 */
        document.getElementById('diaryWrapper').addEventListener('pointerdown', e => {
            if (dw.on && !dw.rest && !e.target.closest('#penLayer')) e.stopPropagation();
        }, true);
        /* ✏️ 책상 펜꽂이 · 문구함 서랍에서 필기구를 뽑으면 (도련 11-02 · js/deskgd.js) : 그리기를 켜고 그 필기구를 바로 손에 (페이지 가운데) */
        function drawWith(id, x, y) {                                       // x, y = 연필심 자리 (없으면 보이는 쪽 가운데)
            const all = typeof pkAll === 'function' ? pkAll() : [], w = all.find(x => x.id === id); if (!w) return false;
            if (pcS.held && pcDesk()) { penFlush(); pcLayDown(); }             // 🪑 책상 = 들고 있던 필기구는 페이지에 놓고 (여러 개 꺼내기 · 도련 11-03)
            else if (pcS.held) pcStow();
            openDraw(); if (!dw.on) return false;
            const o = (pcS.tools || []).find(x => x.id === w.id);
            if (!o) return false;
            const pg = drq('canvasArea'), r = window.dyVisRect ? dyVisRect(pg.getBoundingClientRect()) : pg.getBoundingClientRect();
            pcPick(o, { pointerId: -7, clientX: x != null ? x : r.left + r.width / 2, clientY: y != null ? y : r.top + r.height / 2 });
            pcS.carry = null; drq('pcHeld').classList.remove('carry');                  // 손에 든 채 가운데 (🖱 마우스면 따라와요 · 👆 누른 곳에서 써요)
            if (window.dkwDeskSoon) dkwDeskSoon();
            return true;
        }
        /* ---------- ✏️ 🪑 책상 : 필기구 여러 개 꺼내기 (도련 11-03 · 현실처럼) ----------
           손에는 하나 · 다른 필기구를 뽑거나 다른 문구를 들거나 꾹 집어 옮겨 놓으면 = 그 자리(페이지)에 놓여요 · 놓인 필기구 톡 = 다시 들기
           치우기 = 다이어리 아래 '↩ 꺼낸 문구 정리' (js/deskgd.js) · 앱을 다시 켜면 없어요 (저장하지 않아요) · 📱 폰은 예전 그대로 */
        const pcDesk = UI.desk;
        pcS.lay = [];                                                         // [{ id, el }] 페이지에 놓인 필기구
        function pcLayDown() {
            const o = pcS.held, h = drq('pcHeld'), ip = drq('innerPage'); if (!o || !h || !ip) return;
            const r = h.getBoundingClientRect(), k = typeof gdK === 'function' ? gdK().k : (ip.getBoundingClientRect().width / (ip.offsetWidth || 1)) || 1, ir = ip.getBoundingClientRect();
            const cx = (r.left + r.width / 2 - ir.left) / k, cy = (r.top + r.height / 2 - ir.top) / k, W = o.box[0], H = o.box[1];
            const el = document.createElement('div'); el.className = 'pc-lay'; el.dataset.id = o.id; el.innerHTML = pcSvg(o);
            Object.assign(el.style, { left: (cx - W / 2) + 'px', top: (cy - H / 2) + 'px', width: W + 'px', height: H + 'px', transform: `rotate(${handLeft() ? 28 : -28}deg)` });
            ip.appendChild(el); pcS.lay.push({ id: o.id, el });
            pcS.held = null; pcS.laid = null; pcS.press = null; pcS.carry = null;
            h.hidden = true; h.classList.remove('carry', 'in', 'laid');
            if (window.dkwDeskSoon) dkwDeskSoon();
        }
        window.addEventListener('pointerdown', e => {                         // 놓인 필기구 톡 = 다시 들기 (그 자리에서)
            const el = e.target && e.target.closest && e.target.closest('#innerPage > .pc-lay'); if (!el || e.button > 0) return;
            e.preventDefault(); e.stopPropagation();
            const id = el.dataset.id; pcS.lay = pcS.lay.filter(x => x.el !== el); el.remove();
            if (window.gdLetGo) gdLetGo(); if (window.skLetGo) skLetGo();
            drawWith(id, e.clientX, e.clientY);
        }, true);
        window.pcOutIds = () => pcDesk() ? pcS.lay.filter(x => x.el.isConnected).map(x => x.id).concat(pcS.held && !pcS.memo ? [pcS.held.id] : []) : [];
        window.pcReturn = id => {                                              // ↩ 제자리로 (js/deskgd.js 꺼낸 문구 정리)
            pcS.lay.filter(x => x.id === id).forEach(x => x.el.remove()); pcS.lay = pcS.lay.filter(x => x.id !== id);
            if (pcS.held && pcS.held.id === id) { penFlush(); pcStow(); if (dw.on) penRest(); }
            if (window.dkwDeskSoon) dkwDeskSoon();
        };
        window.openDraw = openDraw; window.drawWith = drawWith;
        document.addEventListener('pointerdown', e => { if (dw.on && e.target.closest && e.target.closest('.toolbar')) { penFlush(); } }, true);   // 🧭 하단 메뉴를 누르면 : 쓴 것만 페이지에 붙여요 · 필기구는 손에 그대로 (도련 10-21 · 🪟 고르는 창 모드는 ✓ 완료)
