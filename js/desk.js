/* 말랑달콤 다이어리 - js/desk.js
   🪑 책상 꾸미기 (도련 10-26 · 💻 PC · 아이패드만 = html.desk-on · 📱 폰은 없어요)
   - 책상 그림(img/desk-wide.webp · 1672×941 · 갈색 선 일러스트 (10-26 픽셀아트 → 일러스트))과 소품을 한 무대(#deskStage)에 · 무대는 책상 그림 크기 그대로 화면을 꽉 채우게(cover · 아래 맞춤) 늘었다 줄었다
     → 소품 자리는 늘 책상 그림 기준 좌표(px)로 저장해요 · 화면 크기가 바뀌어도 같은 자리
   - 소품은 마우스 · 손가락으로 끌어서 옮겨요 · 톡 = 고르기 (점선 테두리 + 위에 작은 버튼)
   - 🧲 딱 맞추기 (켬 / 끔 · 고른 소품 위 버튼 · 이 기기에 기억) :
       켬 = 16px 칸에 맞춰 놓이고 · 다른 소품 위(받침대 · 서랍장 · 벽 선반) · 책상 뒤쪽 선(벽에 붙이기) · 양옆 벽 모서리 가까이 가면 착 붙어요 (분홍 안내선)
       끔 = 손이 가는 그대로 부드럽게
       💻 끄는 동안 Shift 를 누르고 있으면 잠깐 반대로
   - 🔗 소품 ↔ 기능 (도련 10-27 · ⚙️ 설정 📖 다이어리 칸 🪑 화면) : 기능마다 책상 위 소품 하나 (라벨이 붙어요)
       하단 메뉴 기능(다이어리 · 스티커 · 문구함 · 카페 · 설정) = 숨긴 하단 메뉴 버튼을 대신 눌러요 (하는 일이 똑같아요) · 🏪 기본샵 · 📦 소품 보관함은 바로 열어요
       톡 = 그 기능 · 끌기 = 옮기기 · 기능 없는 소품은 톡 = 고르기 (위에 🧲 · 📦 넣기 · 🗑 버리기)
       기능은 늘 모두 서로 다른 소품에 (이미 쓰는 소품을 고르면 서로 바꿔요) · 기능 소품은 보관함에 넣거나 버릴 수 없어요 (설정을 못 열게 되는 일이 없게)
       화면이 좁아 기능 소품이 잘려 보이면 보이는 곳 안쪽으로 당겨 맨 앞에 보여 줘요 (저장한 자리는 그대로)
   - 📦 내 소품 (도련 10-27) : 처음엔 기본 세트 선물(DESK_ITEMS 모두 책상 위) · 🏪 기본샵 '책상 소품'에서 더 받으면 📦 소품 보관함으로 (같은 것도 여러 개 · 받기 전에 물어봐요)
       보관함 ↔ 책상 · 🗑 버리기 (버린 것은 기본샵에서 다시 받아요)
   - 저장 : 설정.json 'diary_desk_items' [{u: 하나하나 id, id: 소품 종류, at: 'desk' | 'box', x, y}] · 'diary_desk_fn' {기능: u} · 게스트는 이 기기 malang_desk_items · malang_desk_fn
       기본 세트의 u = 소품 종류 id (그래서 처음 기능 연결이 그대로 맞아요)
   ※ 소품 종류 = DESK_ITEMS (기본샵 카탈로그) */

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
        const dkCat = id => DESK_ITEMS.find(d => d.id === id) || null;
        const dkDef = el => dkCat(el.dataset.id) || {};
        const DK_SNAP = 'malang_desk_snap';
        const dkGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
        const dkSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
        const DK = { s: 1, sel: null, snap: dkGet(DK_SNAP, true), base: {}, items: [], seen: '' };   // base = 저장한 자리 (화면이 좁아 당겨 보여 줘도 그대로)

        /* 📦 내 소품 목록 */
        const DK_ITEMS_KEY = 'diary_desk_items', DK_ITEMS_LOCAL = 'malang_desk_items';
        const dkStarter = () => DESK_ITEMS.map(d => ({ u: d.id, id: d.id, at: 'desk', x: d.x, y: d.y }));   // 🎁 기본 세트 선물
        function dkLoad() {
            const v = typeof prefGet === 'function' ? prefGet(DK_ITEMS_KEY, DK_ITEMS_LOCAL) : null;
            const L = Array.isArray(v) ? v.filter(o => o && typeof o.u === 'string' && dkCat(o.id)).map(o => ({ u: o.u, id: o.id, at: o.at === 'box' ? 'box' : 'desk', x: +o.x || 0, y: +o.y || 0 })) : dkStarter();
            DK.items = L; DK.seen = JSON.stringify(L);
        }
        function dkSave() { DK.seen = JSON.stringify(DK.items); if (typeof prefSet === 'function') prefSet(DK_ITEMS_KEY, DK_ITEMS_LOCAL, DK.items); }
        const dkOnDesk = () => DK.items.filter(o => o.at === 'desk');
        const dkName = o => { const c = dkCat(o.id), same = DK.items.filter(x => x.id === o.id); return (c ? c.name : '') + (same.length > 1 ? ' ' + (same.indexOf(o) + 1) : ''); };
        function josa(w, a, b) { const c = (w || '').charCodeAt(w.length - 1) - 0xAC00; return w + (c >= 0 && c < 11172 && c % 28 ? a : b); }

        /* 🔗 소품 ↔ 기능 : [기능, 이름, 하단 메뉴 버튼(없으면 바로 열기), 표시] · 처음 연결 (도련 10-27 · 바꿀 수 있어요) */
        const DK_FNS = [['skin', '다이어리', 'tb-skin', '📔'], ['sticker', '스티커', 'tb-sticker', '⭐'], ['gd', '문구함', 'tb-gd', '✏️'], ['cafe', '카페', 'tb-cafe', '☕'], ['set', '설정', 'tb-set', '⚙️'],
            ['shop', '기본샵', '', '🏪'], ['box', '소품 보관함', '', '📦']];
        const DK_FN_DEF = { skin: 'bookbox', sticker: 'basket', gd: 'pencup', cafe: 'corkboard', set: 'clock', shop: 'magfile', box: 'drawer' };
        const DK_FN_KEY = 'diary_desk_fn', DK_FN_LOCAL = 'malang_desk_fn';
        function deskFnMap() {                                                    // 모든 기능 · 서로 다른 책상 위 소품 (모자라면 그 기능은 빠져요 → 하단 메뉴가 보여요)
            const v = typeof prefGet === 'function' ? prefGet(DK_FN_KEY, DK_FN_LOCAL) : null, got = v && typeof v === 'object' ? v : {};
            const ids = dkOnDesk().map(o => o.u), claimed = Object.values(got), used = new Set(), m = {};
            DK_FNS.forEach(([k]) => {
                let u = got[k];
                if (!ids.includes(u) || used.has(u)) u = ids.includes(DK_FN_DEF[k]) && !used.has(DK_FN_DEF[k]) && !claimed.includes(DK_FN_DEF[k]) ? DK_FN_DEF[k] : ids.find(i => !used.has(i) && !claimed.includes(i));
                if (!u) u = ids.find(i => !used.has(i));
                if (u) { m[k] = u; used.add(u); }
            });
            return m;
        }
        const dkFnOf = u => { const m = deskFnMap(); return Object.keys(m).find(k => m[k] === u) || ''; };
        function deskFnSet(fn, u) {
            const m = deskFnMap(); if (!dkOnDesk().some(o => o.u === u)) return;
            const other = Object.keys(m).find(k => k !== fn && m[k] === u);
            if (other) m[other] = m[fn];                                         // 이미 쓰던 소품이면 서로 바꿔요
            m[fn] = u;
            if (typeof prefSet === 'function') prefSet(DK_FN_KEY, DK_FN_LOCAL, m);
            deskFnPaint(); deskModeRender(); deskFit();
        }
        function deskFnPaint() {
            const m = deskFnMap(), of = {}; Object.keys(m).forEach(k => { of[m[k]] = k; });
            document.documentElement.classList.toggle('desk-lack', ['skin', 'sticker', 'gd', 'cafe', 'set'].some(k => !m[k]));   // 소품이 모자라 기능이 빠지면 하단 메뉴를 보여요 (안전)
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const fn = of[el.dataset.u], f = fn && DK_FNS.find(x => x[0] === fn), d = dkDef(el);
                DK_FNS.forEach(x => el.classList.remove('fn-' + x[0]));
                let tag = el.querySelector('.dk-fn-tag');                         // 🏷 기능 라벨 (도련 10-27 · 기능 개발하는 동안 알아보게)
                if (f) { if (!tag) { tag = document.createElement('span'); tag.className = 'dk-fn-tag'; tag.setAttribute('aria-hidden', 'true'); el.appendChild(tag); } tag.textContent = f[3] + ' ' + f[1]; }
                else if (tag) tag.remove();
                if (f) { el.dataset.fn = fn; el.classList.add('fn-' + fn); el.title = f[1]; el.setAttribute('role', 'button'); el.setAttribute('aria-label', `${d.name} · ${f[1]}`); }
                else { delete el.dataset.fn; el.removeAttribute('title'); el.setAttribute('role', 'img'); el.setAttribute('aria-label', d.name || ''); }
            });
        }
        function deskFnItemName(fn) { const o = DK.items.find(x => x.u === deskFnMap()[fn]); return o ? dkName(o) : ''; }
        /* 기능 실행 = 숨긴 하단 메뉴 버튼을 대신 눌러요 (필기 붙이기 · 카페 · 다시 누르면 닫기 … 하단 메뉴와 똑같이)
           스티커 · 문구함 · 카페는 다이어리에 쓰는 거라 책상에 놓인 다이어리를 먼저 펴요 · 🏪 기본샵 · 📦 보관함은 바로 */
        function deskRun(fn) {
            if (fn === 'shop') { setTimeout(() => window.openShelf && openShelf(), 0); return; }
            if (fn === 'box') { setTimeout(deskBoxOpen, 0); return; }
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
        /* ⚙️ 설정 🪑 화면 칸 그리기 (js/drive.js deskModeSet · js/show.js 가 설정을 다시 읽을 때도 → 다른 기기에서 바뀐 소품도 여기서 다시) */
        function deskModeRender() {
            deskSyncItems();
            const mode = typeof deskModeGet === 'function' ? deskModeGet() : 'desk';
            document.querySelectorAll('#deskModePick [data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === mode));
            const box = document.getElementById('deskFnList'); if (!box) return;
            box.hidden = mode !== 'desk';
            const m = deskFnMap(), L = dkOnDesk();
            box.innerHTML = DK_FNS.map(([k, name, , ic]) => `<label class="dk-fn-row"><span>${ic} ${name}</span><select class="btn" onchange="deskFnSet('${k}', this.value)">`
                + (m[k] ? '' : '<option value="" selected>(없음)</option>') + L.map(o => `<option value="${o.u}"${m[k] === o.u ? ' selected' : ''}>${dkName(o)}</option>`).join('') + '</select></label>').join('')
                + '<button type="button" class="btn dk-box-open" onclick="deskBoxOpen()">📦 소품 보관함 열기</button>';
            if (document.getElementById('deskStage')) deskFnPaint();
        }
        function deskSyncItems() {                                                 // 드라이브 설정을 읽은 뒤 · 다른 기기에서 바뀌었으면 다시 그려요
            if (DK.drag || !document.getElementById('deskStage')) return;
            const prev = DK.seen; dkLoad();
            if (DK.seen !== prev) { deskItemsRender(); if (window.deskBoxRender) deskBoxRender(); }
        }

        function deskBuild() {
            const bg = document.getElementById('deskBg'); if (!bg || bg.querySelector('#deskStage')) return;
            dkLoad();
            bg.innerHTML = `<div id="deskStage" class="desk-stage"><img class="desk-room" src="img/desk-wide.webp" alt="" draggable="false">
                <div class="dk-diary" id="deskDiary" role="button" tabindex="0" aria-label="다이어리 펴기"><div class="dk-top"><div class="diary-book dk-mini"></div></div><i class="dk-edge"></i></div>
                <i class="desk-guide h"></i><i class="desk-guide v"></i>
                <div class="desk-tip" id="deskTip"><button type="button" class="desk-snap" onclick="deskSnapToggle()"></button><button type="button" class="desk-snap dk-put" onclick="deskTipAct('box')">📦 넣기</button><button type="button" class="desk-snap dk-del" onclick="deskTipAct('del')">🗑 버리기</button></div></div>`;
            const dd = document.getElementById('deskDiary'); let dn = null;
            dd.addEventListener('pointerdown', ev => { dn = [ev.clientX, ev.clientY]; ev.stopPropagation(); });
            dd.addEventListener('pointerup', ev => { if (dn && Math.hypot(ev.clientX - dn[0], ev.clientY - dn[1]) < 8) deskOpenDiary(); dn = null; });
            dd.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); deskOpenDiary(); } });
            deskItemsRender();
            deskMiniPaint();
            deskTipPaint(); deskModeRender();
        }
        /* 책상 위 소품을 목록대로 다시 그려요 */
        function deskItemsRender() {
            const st = document.getElementById('deskStage'); if (!st) return;
            deskSelect(null);
            st.querySelectorAll('.desk-item').forEach(el => el.remove());
            DK.base = {};
            const at = st.querySelector('.dk-diary');
            dkOnDesk().forEach(o => {
                const it = dkCat(o.id); DK.base[o.u] = { x: o.x, y: o.y };
                at.insertAdjacentHTML('beforebegin', deskItemHtml(it, o));
                deskWire(at.previousElementSibling);
            });
            deskZAll(); deskTick(); deskFnPaint(); deskFit();
        }
        /* 고른 소품 위 버튼 : 📦 보관함에 넣기 · 🗑 버리기 */
        function deskTipAct(a) { const el = DK.sel; if (!el) return; const u = el.dataset.u; deskSelect(null); if (a === 'box') deskPut(u, 'box'); else deskDiscard(u); }
        function dkFnBlock(u, what) {                                              // 기능 소품은 못 넣고 못 버려요
            const fn = dkFnOf(u); if (!fn) return false;
            const f = DK_FNS.find(x => x[0] === fn), o = DK.items.find(x => x.u === u);
            if (window.showMsg) showMsg(`${dkName(o)}에는 ${f[3]} '${f[1]}' 기능이 붙어 있어서 ${what} 수 없어요.<br><small>⚙️ 설정 › 🪑 화면에서 기능을 다른 소품으로 옮긴 뒤 해 주세요</small>`);
            return true;
        }
        function deskPut(u, where) {
            const o = DK.items.find(x => x.u === u); if (!o || o.at === where) return;
            if (where === 'box' && dkFnBlock(u, '보관함에 넣을')) return;
            if (where === 'desk') { const c = dkCat(o.id); o.x = c.x; o.y = c.y; }           // 꺼내면 그 소품 처음 자리에
            o.at = where; dkSave(); deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender();
        }
        async function deskDiscard(u) {
            const o = DK.items.find(x => x.u === u); if (!o || dkFnBlock(u, '버릴')) return;
            const ok = window.showAsk ? await showAsk(`🗑 ${josa(dkName(o), '을', '를')} 버릴까요?<br><small>버린 소품은 🏪 기본샵에서 다시 받을 수 있어요</small>`, '버리기', '그만두기') : true;
            if (!ok) return;
            DK.items = DK.items.filter(x => x.u !== u); dkSave(); deskItemsRender(); deskModeRender(); if (window.deskBoxRender) deskBoxRender();
        }
        /* 🏪 기본샵에서 받기 (js/basket.js) : 'have' = 이미 있어요 (묻고 나서 force) · 'ok' = 📦 보관함에 넣었어요 */
        function deskGive(id, force) {
            const c = dkCat(id); if (!c) return 'no';
            if (!force && DK.items.some(o => o.id === id)) return 'have';
            DK.items.push({ u: id + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), id, at: 'box', x: c.x, y: c.y });
            dkSave(); deskModeRender(); if (window.deskBoxRender) deskBoxRender();
            return 'ok';
        }
        const deskShopList = () => DESK_ITEMS.map(d => ({ id: d.id, name: d.name, src: d.src, wall: !!d.wall }));
        /* 📦 소품 보관함 창 */
        function deskBoxRender() {
            const box = document.getElementById('deskBoxList'); if (!box) return;
            if (!DK.items.length) { box.innerHTML = '<p class="dkb-empty">아직 소품이 없어요.<br>🏪 기본샵에서 받아 와요</p>'; return; }
            const order = DK.items.slice().sort((a, b) => (a.at === b.at ? 0 : a.at === 'box' ? -1 : 1));   // 보관 중인 것이 먼저
            box.innerHTML = order.map(o => {
                const c = dkCat(o.id), fn = o.at === 'desk' ? dkFnOf(o.u) : '', f = fn && DK_FNS.find(x => x[0] === fn);
                return `<div class="dkb-it${o.at === 'box' ? ' in' : ''}"><span class="dkb-pic"><img src="${c.src}" alt="" loading="lazy"></span><b>${dkName(o)}</b>`
                    + `<small>${o.at === 'box' ? '📦 보관 중' : '🪑 책상 위'}${f ? ` · ${f[3]} ${f[1]}` : ''}</small><div class="dkb-btns">`
                    + (o.at === 'box' ? `<button type="button" class="btn" onclick="deskPut('${o.u}', 'desk')">🪑 놓기</button>` : `<button type="button" class="btn" onclick="deskPut('${o.u}', 'box')">📦 넣기</button>`)
                    + `<button type="button" class="btn dkb-del" onclick="deskDiscard('${o.u}')">🗑</button></div></div>`;
            }).join('');
        }
        function deskBoxOpen() { deskBoxRender(); if (window.openModal) openModal('deskBoxModal'); }
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
            return `<div class="${cls}" data-id="${it.id}" data-u="${p.u || it.id}" role="img" aria-label="${it.name}" style="${st}"><img src="${it.src}" alt="" draggable="false">${over}</div>`;
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
            DK.s = s; st.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; st.style.setProperty('--dk-inv', (1 / s).toFixed(3));
            deskKeepIn(-tx / s, -ty / s, (W - tx) / s, (H - ty) / s);
            deskTipPlace();
        }
        /* 기능 소품이 화면 밖으로 많이 잘리면 (좁은 창 · 세운 아이패드) 보이는 곳 안쪽으로 당겨 보여 줘요 · 저장한 자리(DK.base)는 그대로 · 넓어지면 제자리 */
        function deskKeepIn(x0, y0, x1, y1) {
            if (DK.drag) return;
            const M = 12, moved = [];
            document.querySelectorAll('#deskStage .desk-item').forEach(el => {
                const b = DK.base[el.dataset.u]; if (!b) return;
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
                [el].concat((was.riders || []).map(r => r.o)).forEach(o => {      // 📦 내 소품 목록에 자리 저장 (설정.json)
                    const v = { x: Math.round(parseFloat(o.style.left)), y: Math.round(parseFloat(o.style.top)) }, it = DK.items.find(x => x.u === o.dataset.u);
                    DK.base[o.dataset.u] = v; if (it) { it.x = v.x; it.y = v.y; }
                });
                dkSave();
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
        window.deskTipAct = deskTipAct; window.deskPut = deskPut; window.deskDiscard = deskDiscard; window.deskGive = deskGive; window.deskShopList = deskShopList; window.deskBoxOpen = deskBoxOpen; window.deskBoxRender = deskBoxRender;
        window.deskMiniPaint = deskMiniPaint; window.deskTapAt = deskTapAt; window.deskFnSet = deskFnSet; window.deskModeRender = deskModeRender; window.deskFnItemName = deskFnItemName;
