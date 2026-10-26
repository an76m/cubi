/* 말랑달콤 다이어리 - js/desk.js
   🪑 책상 꾸미기 (도련 10-26 · 💻 PC · 아이패드만 = html.desk-on · 📱 폰은 없어요)
   - 책상 그림(img/desk-wide.webp · 1672×941 · 갈색 선 일러스트 (10-26 픽셀아트 → 일러스트))과 소품을 한 무대(#deskStage)에 · 무대는 책상 그림 크기 그대로 화면을 꽉 채우게(cover · 아래 맞춤) 늘었다 줄었다
     → 소품 자리는 늘 책상 그림 기준 좌표(px)로 저장해요 · 화면 크기가 바뀌어도 같은 자리
   - 소품은 마우스 · 손가락으로 끌어서 옮겨요 · 톡 = 고르기 (점선 테두리 + 위에 작은 버튼)
   - 🧲 딱 맞추기 (켬 / 끔 · 고른 소품 위 버튼 · 이 기기에 기억) :
       켬 = 16px 칸에 맞춰 놓이고 · 다른 소품 위(받침대 · 서랍장 · 벽 선반) · 책상 뒤쪽 선(벽에 붙이기) · 양옆 벽 모서리 가까이 가면 착 붙어요 (분홍 안내선)
       끔 = 손이 가는 그대로 부드럽게
       💻 끄는 동안 Shift 를 누르고 있으면 잠깐 반대로
   - 지금 자리는 이 기기에만 기억해요 (나중에 소품을 사고 팔게 되면 드라이브에 저장)
   - 🔗 소품 ↔ 기능 (도련 10-27 · ⚙️ 설정 📖 다이어리 칸 🪑 화면) : 하단 메뉴 기능(다이어리 · 스티커 · 문구함 · 카페 · 설정)마다 소품 하나
       톡 = 그 기능 (숨긴 하단 메뉴 버튼을 대신 눌러요 · 하는 일이 똑같아요) · 끌기 = 옮기기 · 기능 없는 소품은 톡 = 고르기
       기능은 늘 다섯 개 다 소품에 붙어 있어요 (이미 쓰는 소품을 고르면 서로 바꿔요 · 설정을 못 열게 되는 일이 없게)
       화면이 좁아 기능 소품이 잘려 보이면 보이는 곳 안쪽으로 당겨 보여 줘요 (저장한 자리는 그대로)
       저장 : 설정.json 'diary_desk_fn' {기능: 소품 id} · 게스트는 이 기기 'malang_desk_fn'
   ※ 소품 = DESK_ITEMS */

        const DESK_W = 1672, DESK_H = 941, DESK_PX = 16, DESK_M = 36;   // 🧲 딱 맞추기 : 16px 칸 · 36px 안이면 착 (4px 는 너무 촘촘해서 부드러운 것과 차이를 몰랐어요 · 도련 10-26)
        const DESK_EDGE = { back: 721, left: 140, right: 1540 };                 // 책상 뒤쪽 선 (벽과 만나는 곳) · 양옆 벽 모서리 (그림 px)
        const DESK_ITEMS = [                                                      // 기본 소품 (도련 10-26 · 크기는 참고 그림의 책상 대비 비율) · wall = 벽에 거는 것 (책상 자석 없음 · 늘 뒤)
            // surf = 위에 물건을 올릴 수 있는 면 [소품 안 세로 자리, 왼쪽 끝, 오른쪽 끝] (소품 그림 px) · 올려 둔 물건은 함께 움직이고 그 소품보다 앞에 보여요
            { id: 'corkboard', src: 'img/desk/corkboard.webp', w: 520, h: 406, x: 600, y: 90, name: '코르크 게시판', wall: 1 },
            { id: 'wallshelf', src: 'img/desk/wallshelf.webp', w: 430, h: 233, x: 160, y: 110, name: '벽 선반', wall: 1, surf: [[56, 10, 421], [200, 10, 421]] },
            { id: 'drawer-pink', src: 'img/desk/drawer-pink.webp', w: 330, h: 272, x: 170, y: 489, name: '핑크 서랍장', surf: [[22, 8, 322]] },
            { id: 'riser', src: 'img/desk/riser.webp', w: 470, h: 94, x: 560, y: 667, name: '모니터 받침대', surf: [[19, 3, 467]] },
            { id: 'basket', src: 'img/desk/basket.webp', w: 170, h: 153, x: 600, y: 533, name: '책 바구니' },
            { id: 'pencup', src: 'img/desk/pencup.webp', w: 100, h: 155, x: 840, y: 531, name: '연필꽂이' },
            { id: 'bookbox', src: 'img/desk/bookbox2.webp', w: 200, h: 154, x: 230, y: 357, name: '책 상자' },
            { id: 'magfile', src: 'img/desk/magfile2.webp', w: 130, h: 313, x: 1080, y: 448, name: '파일꽂이' },
            { id: 'polaroid', src: 'img/desk/polaroid2.webp', w: 126, h: 152, x: 1275, y: 150, name: '폴라로이드', wall: 1, photo: [17.1, 22.2, 82.9, 86.2] },   // 줄에 집게로 건 사진 (줄이 양옆으로 이어져요)   // 📷 나중에 사용자 사진을 넣어 벽에 붙여요 (photo = 사진 자리 %)
            { id: 'clock', src: 'img/desk/clock.webp', w: 96, h: 118, x: 1316, y: 414, name: '자명종 시계', clock: { cx: 50, cy: 59.5, r: 35.6 } },   // 🕰 지금 시각 바늘 (시계판 가운데 · 반지름 = 그림 폭 %)
            { id: 'dclock', src: 'img/desk/dclock.webp', w: 130, h: 82, x: 300, y: 228, name: '디지털 시계', lcd: [12, 18.9, 87.9, 71.7] },   // ⏰ 화면에 지금 시각 (화면 자리 %)
            { id: 'drawer', src: 'img/desk/drawer.webp', w: 230, h: 247, x: 1250, y: 514, name: '서랍장', surf: [[18, 6, 224]] }
        ];
        const dkDef = el => DESK_ITEMS.find(d => d.id === el.dataset.id) || {};
        const DK_POS = 'malang_desk_pos5', DK_SNAP = 'malang_desk_snap';
        const dkGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
        const dkSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
        const DK = { s: 1, sel: null, snap: dkGet(DK_SNAP, true), base: {} };     // base = 저장한 자리 (화면이 좁아 당겨 보여 줘도 그대로)
        /* 🔗 소품 ↔ 기능 : [기능, 이름, 하단 메뉴 버튼, 표시] · 처음 연결 (도련 10-27 · 바꿀 수 있어요) */
        const DK_FNS = [['skin', '다이어리', 'tb-skin', '📔'], ['sticker', '스티커', 'tb-sticker', '⭐'], ['gd', '문구함', 'tb-gd', '✏️'], ['cafe', '카페', 'tb-cafe', '☕'], ['set', '설정', 'tb-set', '⚙️']];
        const DK_FN_DEF = { skin: 'bookbox', sticker: 'basket', gd: 'pencup', cafe: 'corkboard', set: 'clock' };
        const DK_FN_KEY = 'diary_desk_fn', DK_FN_LOCAL = 'malang_desk_fn';
        function deskFnMap() {                                                    // 늘 다섯 기능 모두 · 서로 다른 소품
            const v = typeof prefGet === 'function' ? prefGet(DK_FN_KEY, DK_FN_LOCAL) : null, got = v && typeof v === 'object' ? v : {};
            const ids = DESK_ITEMS.map(d => d.id), used = new Set(), m = {};
            DK_FNS.forEach(([k]) => {
                let id = got[k];
                if (!ids.includes(id) || used.has(id)) id = !used.has(DK_FN_DEF[k]) && !Object.values(got).includes(DK_FN_DEF[k]) ? DK_FN_DEF[k] : ids.find(i => !used.has(i) && !Object.values(got).includes(i));
                if (!id) id = ids.find(i => !used.has(i));
                m[k] = id; used.add(id);
            });
            return m;
        }
        function deskFnSet(fn, id) {
            const m = deskFnMap(); if (!(fn in m) || !DESK_ITEMS.some(d => d.id === id)) return;
            const other = Object.keys(m).find(k => k !== fn && m[k] === id);
            if (other) m[other] = m[fn];                                         // 이미 쓰던 소품이면 서로 바꿔요
            m[fn] = id;
            if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, m);
            deskFnPaint(); deskModeRender(); deskFit();
        }
        function deskFnPaint() {
            const m = deskFnMap(), of = {}; Object.keys(m).forEach(k => { of[m[k]] = k; });
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const fn = of[el.dataset.id], f = fn && DK_FNS.find(x => x[0] === fn), d = dkDef(el);
                DK_FNS.forEach(x => el.classList.remove('fn-' + x[0]));
                if (f) { el.dataset.fn = fn; el.classList.add('fn-' + fn); el.title = f[1]; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `${d.name} · ${f[1]}`); }
                else { delete el.dataset.fn; el.removeAttribute('title'); el.setAttribute('role', 'img'); el.setAttribute('aria-label', d.name || ''); }
            });
        }
        function deskFnItemName(fn) { const d = DESK_ITEMS.find(x => x.id === deskFnMap()[fn]); return d ? d.name : ''; }
        /* 기능 실행 = 숨긴 하단 메뉴 버튼을 대신 눌러요 (필기 붙이기 · 카페 · 다시 누르면 닫기 … 하단 메뉴와 똑같이)
           스티커 · 문구함 · 카페는 다이어리에 쓰는 거라 책상에 놓인 다이어리를 먼저 펴요 */
        function deskRun(fn) {
            const f = DK_FNS.find(x => x[0] === fn), b = f && document.querySelector('.toolbar .' + f[2]); if (!b) return;
            const go = () => { b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); b.click(); };
            if (fn !== 'skin' && fn !== 'set' && !document.documentElement.classList.contains('desk-show')) { deskOpenDiary(); setTimeout(go, 620); }
            else setTimeout(go, 0);
        }
        /* 다이어리를 펴 둔 동안 : 소품은 다이어리 뒤라 직접 안 눌려요 → 빈 곳을 톡 한 자리에 기능 소품이 맨 앞에 보이면 그 기능 (js/drive.js) */
        function deskTapAt(x, y) {
            if (!document.documentElement.classList.contains('desk-on')) return false;
            const top = [...document.querySelectorAll('#deskStage .desk-item')].filter(el => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; })
                .sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
            if (!top || !top.dataset.fn) return false;
            deskRun(top.dataset.fn); return true;
        }
        /* ⚙️ 설정 🪑 화면 칸 그리기 (js/drive.js deskModeSet · js/show.js 가 설정을 다시 읽을 때도) */
        function deskModeRender() {
            const mode = typeof deskModeGet === 'function' ? deskModeGet() : 'desk';
            document.querySelectorAll('#deskModePick [data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === mode));
            const box = document.getElementById('deskFnList'); if (!box) return;
            box.hidden = mode !== 'desk';
            const m = deskFnMap();
            box.innerHTML = DK_FNS.map(([k, name, , ic]) => `<label class="dk-fn-row"><span>${ic} ${name}</span><select class="btn" onchange="deskFnSet('${k}', this.value)">`
                + DESK_ITEMS.map(d => `<option value="${d.id}"${m[k] === d.id ? ' selected' : ''}>${d.name}</option>`).join('') + '</select></label>').join('');
            if (document.getElementById('deskStage')) deskFnPaint();
        }

        function deskBuild() {
            const bg = document.getElementById('deskBg'); if (!bg || bg.querySelector('#deskStage')) return;
            const pos = dkGet(DK_POS, {});
            DESK_ITEMS.forEach(it => { const p = pos[it.id] || it; DK.base[it.id] = { x: p.x, y: p.y }; });
            bg.innerHTML = `<div id="deskStage" class="desk-stage"><img class="desk-room" src="img/desk-wide.webp" alt="" draggable="false">
                ${DESK_ITEMS.map(it => { const p = pos[it.id] || it; return deskItemHtml(it, p); }).join('')}
                <div class="dk-diary" id="deskDiary" role="button" tabindex="0" aria-label="다이어리 펴기"><div class="dk-top"><div class="diary-book dk-mini"></div></div><i class="dk-edge"></i></div>
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"><button type="button" class="desk-snap" onclick="deskSnapToggle()"></button></div></div>`;
            bg.querySelectorAll('.desk-item').forEach(deskWire); deskZAll(); deskTick();
            const dd = document.getElementById('deskDiary'); let dn = null;
            dd.addEventListener('pointerdown', ev => { dn = [ev.clientX, ev.clientY]; ev.stopPropagation(); });
            dd.addEventListener('pointerup', ev => { if (dn && Math.hypot(ev.clientX - dn[0], ev.clientY - dn[1]) < 8) deskOpenDiary(); dn = null; });
            dd.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); deskOpenDiary(); } });
            deskMiniPaint();
            deskFnPaint(); deskTipPaint(); deskFit(); deskModeRender();
        }
        /* 물건을 올릴 수 있는 면들 (화면에 있는 소품 기준 · 그림 px) */
        function deskSurfs(skip) {
            const out = [];
            document.querySelectorAll('#deskStage .desk-item').forEach(o => {
                if (o === skip) return; const d = dkDef(o); if (!d.surf) return;
                const L = parseFloat(o.style.left), T = parseFloat(o.style.top);
                d.surf.forEach(([y, x0, x1]) => out.push({ el: o, y: T + y, x0: L + x0, x1: L + x1 }));
            });
            return out;
        }
        function deskOn(el, surfs) {                                              // 이 물건이 올라가 있는 면 (조금 어긋나도 OK)
            const L = parseFloat(el.style.left), T = parseFloat(el.style.top), w = parseFloat(el.style.width), h = parseFloat(el.style.height), b = T + h, cx = L + w / 2;
            return (surfs || deskSurfs(el)).find(s => s.el !== el && b >= s.y - 8 && b <= s.y + 14 && cx >= s.x0 && cx <= s.x1) || null;
        }
        /* 앞뒤 : 아래쪽(앞)에 놓인 것이 앞 · 벽에 건 것은 늘 뒤 · 다른 소품 위에 올린 것은 그 소품 바로 앞 */
        function deskZAll() {
            const items = [...document.querySelectorAll('#deskStage .desk-item')], bot = el => parseFloat(el.style.top) + parseFloat(el.style.height);
            const z = new Map(), surfs = deskSurfs(null), get = (el, depth) => {
                if (z.has(el)) return z.get(el);
                const on = depth < 6 ? deskOn(el, surfs) : null;
                const v = on ? get(on.el, depth + 1) + 1 : el.classList.contains('wall') ? 1 : 10 + Math.round(bot(el)) * 2;
                z.set(el, v); return v;
            };
            items.forEach(el => { el.style.zIndex = get(el, 0); });
        }
        const deskZ = () => deskZAll();
        function deskItemHtml(it, p) {
            const st = `left:${p.x}px;top:${p.y}px;width:${it.w}px;height:${it.h}px`, cls = 'desk-item' + (it.wall ? ' wall' : '');
            let over = '';
            if (it.clock) {                                                         // 🕰 바늘 (지금 시각 · deskTick)
                const c = it.clock, d = c.r * 2, hh = d * it.w / it.h;
                over = `<svg class="dk-hands" viewBox="-50 -50 100 100" aria-hidden="true" style="left:${c.cx}%;top:${c.cy}%;width:${d}%;height:${hh}%"><line class="hr" x1="0" y1="6" x2="0" y2="-24"/><line class="mn" x1="0" y1="8" x2="0" y2="-38"/><line class="sc" x1="0" y1="10" x2="0" y2="-41"/><circle r="4.5"/></svg>`;
            }
            if (it.lcd) { const [l, t, r, b] = it.lcd; over = `<span class="dk-lcd" style="left:${l}%;top:${t}%;width:${r - l}%;height:${b - t}%"><b></b></span>`; }
            return `<div class="${cls}" data-id="${it.id}" role="img" aria-label="${it.name}" style="${st}"><img src="${it.src}" alt="" draggable="false">${over}</div>`;
        }
        /* 🕰 ⏰ 시계는 지금 시각 (1초마다 · 책상이 보일 때만) */
        function deskTick() {
            if (!document.documentElement.classList.contains('desk-on')) return;
            const n = new Date(), h = n.getHours(), m = n.getMinutes(), sec = n.getSeconds();
            document.querySelectorAll('#deskStage .dk-hands').forEach(sv => {
                sv.querySelector('.hr').setAttribute('transform', `rotate(${(h % 12) * 30 + m * .5})`);
                sv.querySelector('.mn').setAttribute('transform', `rotate(${m * 6 + sec * .1})`);
                sv.querySelector('.sc').setAttribute('transform', `rotate(${sec * 6})`);
            });
            document.querySelectorAll('#deskStage .dk-lcd b').forEach(b => { b.innerHTML = `${h % 12 || 12}<i${sec % 2 ? ' class="off"' : ''}>:</i>${String(m).padStart(2, '0')}<small>${h < 12 ? 'AM' : 'PM'}</small>`; });   // 12시간 (21시 → 9 PM · 도련 10-26)
        }
        setInterval(deskTick, 1000);
        /* 📔 책상 가운데 다이어리 (도련 10-26) : 지금 다이어리의 겉표지를 작게 · 책상에 눕혀 놓아요
           - 톡 = 다이어리가 그 자리에서 떠올라 화면 가운데로 → 겉표지가 넘어가며 다꾸 시작 (하단 메뉴도 함께)
           - 책상 빈 곳을 톡 = 다시 책상에 내려놓아요 (펼친 채로 · 다음에 톡 하면 펼친 쪽 그대로 · js/drive.js)
           - 나중에 : 마지막으로 다꾸한 다이어리가 놓여요 (지금은 기본 다이어리 하나) */
        function deskMiniPaint() {
            const box = document.querySelector('#deskDiary .dk-mini'), cv = document.getElementById('coverPage'); if (!box || !cv) return;
            const c = cv.cloneNode(true); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
            c.style.display = ''; c.classList.remove('cv-plain'); c.setAttribute('aria-hidden', 'true');
            box.replaceChildren(c);
        }
        let deskAnim = false;
        const DK_OPENED = 'malang_desk_opened';                                  // 겉표지를 한 번 직접 펼쳤어요 → 그다음부터는 펼친 채로 떠요
        function deskCoverNow() {                                                 // 겉표지를 움직임 없이 바로 펼쳐요 (js/page.js beginCurl · endCurl)
            try { if (typeof isCoverOpen !== 'undefined' && !isCoverOpen && typeof turn !== 'undefined' && !turn && window.beginCurl && beginCurl(true, 1)) endCurl(true); } catch (e) { console.warn(e); }
        }
        function deskOpenDiary() {
            const H = document.documentElement, mini = document.getElementById('deskDiary'), w = document.getElementById('diaryWrapper');
            if (deskAnim || !mini || !w || H.classList.contains('desk-show')) return;
            deskAnim = true; deskSelect(null);
            const r0 = mini.getBoundingClientRect();
            H.classList.add('desk-show'); mini.style.visibility = 'hidden';
            if (dkGet(DK_OPENED, false)) deskCoverNow();                         // 처음엔 사용자가 직접 겉표지를 넘겨요 (도련 10-26)
            const r1 = w.getBoundingClientRect(), k = r0.width / r1.width;
            const dx = r0.left + r0.width / 2 - (r1.left + r1.width / 2), dy = r0.top + r0.height / 2 - (r1.top + r1.height / 2);
            const a = w.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${k}) perspective(900px) rotateX(58deg)` }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.2, .8, .2, 1)' });
            a.onfinish = a.oncancel = () => { deskAnim = false; };
        }
        function deskCloseDiary() {
            const H = document.documentElement, mini = document.getElementById('deskDiary'), w = document.getElementById('diaryWrapper');
            if (deskAnim || !mini || !w || !H.classList.contains('desk-show')) return;
            if (typeof turn !== 'undefined' && turn) return;                      // 넘기는 중에는 그대로
            if (typeof isCoverOpen !== 'undefined' && isCoverOpen) dkSet(DK_OPENED, true);
            deskAnim = true;
            const r1 = w.getBoundingClientRect(), r0 = mini.getBoundingClientRect();
            const k = r0.width / r1.width, dx = r0.left + r0.width / 2 - (r1.left + r1.width / 2), dy = r0.top + r0.height / 2 - (r1.top + r1.height / 2);
            const a = w.animate([{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${k}) perspective(900px) rotateX(58deg)` }], { duration: 480, easing: 'cubic-bezier(.5, 0, .6, 1)', fill: 'forwards' });
            a.onfinish = () => { H.classList.remove('desk-show'); a.cancel(); mini.style.visibility = ''; deskMiniPaint(); deskAnim = false; };
        }
        function deskFit() {                                                      // 책상 그림 크기 그대로 · 화면 꽉 (cover · 아래 맞춤)
            const st = document.getElementById('deskStage'); if (!st) return;
            const W = innerWidth, H = innerHeight, s = Math.max(W / DESK_W, H / DESK_H);
            const tx = (W - DESK_W * s) / 2, ty = H - DESK_H * s;
            DK.s = s; st.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
            deskKeepIn(-tx / s, -ty / s, (W - tx) / s, (H - ty) / s);
            deskTipPlace();
        }
        /* 기능 소품이 화면 밖으로 많이 잘리면 (좁은 창 · 세운 아이패드) 보이는 곳 안쪽으로 당겨 보여 줘요 · 저장한 자리(DK.base)는 그대로 · 넓어지면 제자리 */
        function deskKeepIn(x0, y0, x1, y1) {
            if (DK.drag) return;
            const M = 12, moved = [];
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const b = DK.base[el.dataset.id]; if (!b) return;
                let x = b.x, y = b.y; const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
                if (el.dataset.fn) {
                    const vis = Math.max(0, Math.min(x + w, x1) - Math.max(x, x0)) * Math.max(0, Math.min(y + h, y1) - Math.max(y, y0)) / (w * h);
                    if (vis < .7) { x = Math.max(x0 + M, Math.min(x1 - M - w, x)); y = Math.max(y0 + M, Math.min(y1 - M - h, y)); moved.push(el); }
                }
                el.style.left = x + 'px'; el.style.top = y + 'px';
            });
            deskZAll();
            moved.forEach(el => { el.style.zIndex = 2900; });                    // 당겨 보여 준 소품은 맨 앞 (다른 소품에 가려 못 누르지 않게)
        }
        function deskWire(el) {
            let p = null;
            el.addEventListener('pointerdown', ev => {
                if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
                p = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, l: parseFloat(el.style.left), t: parseFloat(el.style.top), on: false };
                if (dkDef(el).surf) {                                            // 위에 올려 둔 물건은 함께 움직여요
                    const mine = deskSurfs(null).filter(s => s.el === el);
                    p.riders = [...document.querySelectorAll('#deskStage .desk-item')].filter(o => o !== el && deskOn(o, mine)).map(o => ({ o, dx: parseFloat(o.style.left) - p.l, dy: parseFloat(o.style.top) - p.t }));
                }
                try { el.setPointerCapture(ev.pointerId); } catch (e) {}
            });
            el.addEventListener('pointermove', ev => {
                if (!p || ev.pointerId !== p.id) return;
                if (!p.on && Math.hypot(ev.clientX - p.x0, ev.clientY - p.y0) < 4) return;
                if (!p.on) { deskSelect(el); DK.drag = true; }
                p.on = true; el.classList.add('lift');
                let x = p.l + (ev.clientX - p.x0) / DK.s, y = p.t + (ev.clientY - p.y0) / DK.s;
                const snap = DK.snap !== ev.shiftKey, w = el.offsetWidth, h = el.offsetHeight;
                let gh = null, gv = null;
                if (snap) { x = Math.round(x / DESK_PX) * DESK_PX; y = Math.round(y / DESK_PX) * DESK_PX; }   // 16px 칸
                if (snap && !el.classList.contains('wall')) {
                    const M = DESK_M, cx = x + w / 2;
                    let best = null;                                             // 가장 가까운 면 : 다른 소품 위 · 책상 (다리가 놓일 자리 = 뒤쪽 선 조금 앞)
                    deskSurfs(el).forEach(s => { if (p.riders && p.riders.some(r => r.o === s.el)) return; const d = Math.abs(y + h - s.y); if (cx >= s.x0 && cx <= s.x1 && d < M && (!best || d < best.d)) best = { d, y: s.y }; });
                    const foot = DESK_EDGE.back + 40, df = Math.abs(y + h - foot);
                    if (df < M && (!best || df < best.d)) best = { d: df, y: foot, g: DESK_EDGE.back };
                    if (best) { y = best.y - h; gh = best.g != null ? best.g : best.y; }
                    if (Math.abs(x - DESK_EDGE.left) < M) { x = DESK_EDGE.left; gv = DESK_EDGE.left; }
                    else if (Math.abs(x + w - DESK_EDGE.right) < M) { x = DESK_EDGE.right - w; gv = DESK_EDGE.right; }
                }
                x = Math.max(-w / 2, Math.min(DESK_W - w / 2, x)); y = Math.max(0, Math.min(DESK_H - h / 2, y));
                el.style.left = x + 'px'; el.style.top = y + 'px';
                if (p.riders) p.riders.forEach(r => { r.o.style.left = (x + r.dx) + 'px'; r.o.style.top = (y + r.dy) + 'px'; });
                deskZAll();
                deskGuide(gh, gv); deskTipPlace();
            });
            const up = ev => {
                if (!p || ev.pointerId !== p.id) return; const was = p; p = null; el.classList.remove('lift'); deskGuide(null, null); DK.drag = false;
                if (!was.on) {                                                   // 톡 : 기능 소품 = 그 기능 · 아니면 고르기
                    if (ev.type === 'pointercancel') return;
                    if (el.dataset.fn) { deskSelect(null); deskRun(el.dataset.fn); } else deskSelect(el);
                    return;
                }
                const pos = dkGet(DK_POS, {});
                [el].concat((was.riders || []).map(r => r.o)).forEach(o => { const v = { x: parseFloat(o.style.left), y: parseFloat(o.style.top) }; pos[o.dataset.id] = v; DK.base[o.dataset.id] = v; });
                dkSet(DK_POS, pos);
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
        window.deskSnapToggle = deskSnapToggle; window.deskOpenDiary = deskOpenDiary; window.deskCloseDiary = deskCloseDiary;
        window.deskMiniPaint = deskMiniPaint; window.deskTapAt = deskTapAt; window.deskFnSet = deskFnSet; window.deskModeRender = deskModeRender; window.deskFnItemName = deskFnItemName;
