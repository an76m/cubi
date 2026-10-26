/* 말랑달콤 다이어리 - js/desk.js
   🪑 책상 꾸미기 (도련 10-26 · 💻 PC · 아이패드만 = html.desk-on · 📱 폰은 없어요)
   - 책상 그림(img/desk-wide.webp · 1672×941 · 갈색 선 일러스트 (10-26 픽셀아트 → 일러스트))과 소품을 한 무대(#deskStage)에 · 무대는 책상 그림 크기 그대로 화면을 꽉 채우게(cover · 아래 맞춤) 늘었다 줄었다
     → 소품 자리는 늘 책상 그림 기준 좌표(px)로 저장해요 · 화면 크기가 바뀌어도 같은 자리
   - 소품은 마우스 · 손가락으로 끌어서 옮겨요 · 톡 = 고르기 (점선 테두리 + 위에 작은 버튼)
   - 🧲 딱 맞추기 (켬 / 끔 · 고른 소품 위 버튼 · 이 기기에 기억) :
       켬 = 4px 칸에 맞춰 놓이고 · 책상 뒤쪽 선(벽에 붙이기) · 양옆 벽 모서리 가까이 가면 착 붙어요 (분홍 안내선)
       끔 = 손이 가는 그대로 부드럽게
       💻 끄는 동안 Shift 를 누르고 있으면 잠깐 반대로
   - 지금 자리는 이 기기에만 기억해요 (나중에 소품을 사고 팔게 되면 드라이브에 저장)
   ※ 소품 = DESK_ITEMS · 나중에 소품 ↔ 기능 연결(설정)을 붙여요 */

        const DESK_W = 1672, DESK_H = 941, DESK_PX = 4;
        const DESK_EDGE = { back: 721, left: 140, right: 1540 };                 // 책상 뒤쪽 선 (벽과 만나는 곳) · 양옆 벽 모서리 (그림 px)
        const DESK_ITEMS = [{ id: 'drawer', src: 'img/desk/drawer.webp', w: 270, h: 290, x: 1200, y: 471, name: '서랍장' }];   // y = 위쪽 (다리가 책상 뒤쪽 선 조금 앞)
        const DK_POS = 'malang_desk_pos', DK_SNAP = 'malang_desk_snap';
        const dkGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
        const dkSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
        const DK = { s: 1, sel: null, snap: dkGet(DK_SNAP, true) };

        function deskBuild() {
            const bg = document.getElementById('deskBg'); if (!bg || bg.querySelector('#deskStage')) return;
            const pos = dkGet(DK_POS, {});
            bg.innerHTML = `<div id="deskStage" class="desk-stage"><img class="desk-room" src="img/desk-wide.webp" alt="" draggable="false">
                ${DESK_ITEMS.map(it => { const p = pos[it.id] || it; return `<img class="desk-item" data-id="${it.id}" src="${it.src}" alt="${it.name}" draggable="false" style="left:${p.x}px;top:${p.y}px;width:${it.w}px;height:${it.h}px">`; }).join('')}
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"><button type="button" class="desk-snap" onclick="deskSnapToggle()"></button></div></div>`;
            bg.querySelectorAll('.desk-item').forEach(deskWire);
            deskTipPaint(); deskFit();
        }
        function deskFit() {                                                      // 책상 그림 크기 그대로 · 화면 꽉 (cover · 아래 맞춤)
            const st = document.getElementById('deskStage'); if (!st) return;
            const W = innerWidth, H = innerHeight, s = Math.max(W / DESK_W, H / DESK_H);
            DK.s = s; st.style.transform = `translate(${(W - DESK_W * s) / 2}px, ${H - DESK_H * s}px) scale(${s})`;
            deskTipPlace();
        }
        function deskWire(el) {
            let p = null;
            el.addEventListener('pointerdown', ev => {
                if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
                deskSelect(el);
                p = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top), on: false };
                try { el.setPointerCapture(ev.pointerId); } catch (e) {}
            });
            el.addEventListener('pointermove', ev => {
                if (!p || ev.pointerId !== p.id) return;
                if (!p.on && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 4) return;
                p.on = true; el.classList.add('lift');
                let x = p.l + (ev.clientX - p.x0) / DK.s, y = p.t + (ev.clientY - p.y0) / DK.s;
                const snap = DK.snap !== ev.shiftKey, w = el.offsetWidth, h = el.offsetHeight;
                let gh = null, gv = null;
                if (snap) {
                    x = Math.round(x / DESK_PX) * DESK_PX; y = Math.round(y / DESK_PX) * DESK_PX;   // 책상 픽셀 한 칸
                    const M = 22;                                                // 이만큼 가까우면 착 붙어요 (그림 px)
                    const foot = DESK_EDGE.back + 40;                            // 다리가 놓일 자리 = 뒤쪽 선 조금 앞 (벽에 붙인 느낌)
                    if (Math.abs(y + h - foot) < M) { y = foot - h; gh = DESK_EDGE.back; }
                    if (Math.abs(x - DESK_EDGE.left) < M) { x = DESK_EDGE.left; gv = DESK_EDGE.left; }
                    else if (Math.abs(x + w - DESK_EDGE.right) < M) { x = DESK_EDGE.right - w; gv = DESK_EDGE.right; }
                }
                x = Math.max(-w / 2, Math.min(DESK_W - w / 2, x)); y = Math.max(0, Math.min(DESK_H - h / 2, y));
                el.style.left = x + 'px'; el.style.top = y + 'px';
                deskGuide(gh, gv); deskTipPlace();
            });
            const up = ev => {
                if (!p || ev.pointerId !== p.id) return; const was = p; p = null; el.classList.remove('lift'); deskGuide(null, null);
                if (!was.on) return;
                const pos = dkGet(DK_POS, {}); pos[el.dataset.id] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) }; dkSet(DK_POS, pos);
            };
            el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        }
        function deskGuide(h, v) {
            const st = document.getElementById('deskStage'); if (!st) return;
            const gh = st.querySelector('.desk-guide.h'), gv = st.querySelector('.desk-guide.v');
            gh.classList.toggle('on', h != null); if (h != null) gh.style.top = h + 'px';
            gv.classList.toggle('on', v != null); if (v != null) gv.style.left = v + 'px';
        }
        function deskSelect(el) {
            document.querySelectorAll('.desk-item.sel').forEach(o => o !== el && o.classList.remove('sel'));
            DK.sel = el; if (el) el.classList.add('sel');
            const tip = document.getElementById('deskTip'); if (tip) tip.classList.toggle('on', !!el);
            deskTipPlace();
        }
        function deskTipPlace() {                                                 // 고른 소품 바로 위 가운데
            const tip = document.getElementById('deskTip'), el = DK.sel; if (!tip || !el) return;
            tip.style.left = (parseFloat(el.style.left) + el.offsetWidth / 2) + 'px'; tip.style.top = parseFloat(el.style.top) + 'px';
            tip.style.scale = (1 / DK.s).toFixed(3);                              // 버튼은 화면에서 늘 같은 크기
        }
        function deskTipPaint() { const b = document.querySelector('#deskTip .desk-snap'); if (b) { b.textContent = DK.snap ? '🧲 딱 맞추기 켬' : '〰️ 딱 맞추기 끔'; b.classList.toggle('off', !DK.snap); b.title = '💻 끄는 동안 Shift 를 누르면 잠깐 반대로'; } }
        function deskSnapToggle() { DK.snap = !DK.snap; dkSet(DK_SNAP, DK.snap); deskTipPaint(); }
        document.addEventListener('pointerdown', ev => {                          // 다른 곳을 누르면 고르기 끝
            if (!DK.sel) return; const t = ev.target;
            if (t.closest && (t.closest('.desk-item') || t.closest('#deskTip'))) return;
            deskSelect(null);
        }, true);
        window.addEventListener('resize', () => requestAnimationFrame(deskFit));
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', deskBuild); else deskBuild();
        window.deskSnapToggle = deskSnapToggle;
