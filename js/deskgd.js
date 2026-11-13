/* 말랑달콤 다이어리 - js/deskgd.js
   🪑 책상 모드 문구 (도련 11-02 · 현실처럼 · 💻 PC · 📲 아이패드 = html.desk-on · 📱 폰은 예전 🗄️ 문구함 창 그대로)
   - 🏠 문구의 집 (도련 11-05 · 현실처럼) : 봉투에서 끌어 넣은 그 소품 = 그 문구의 집 · 꺼내 쓰기도 거기서만 · 페이지에 꺼낸 문구 ✕ = 집으로
       집 = 'u' (펜꽂이 소품 · 꽂을 수 있는 것만 · 24개까지) · 'u:칸' (서랍장 그 칸 = 문구함 · 문구는 한 칸에 여러 종류 함께)
       저장 = 'diary_gd_at' { 문구 id: 집 } (책상배치 · js/drive.js DESK_KEYS) · 넣기 = js/desk.js dkGdPut (봉투 카드 · 꺼낸 문구 줄에서 끌어 옮기기)
       집이 없어진 문구(소품을 버림 · 서랍 칸을 다른 걸로 바꿈) · 집 없이 받은 문구 = 봉투에 담겨 책상에 (다시 넣어요) · 🎁 처음 선물 = 책상 펜꽂이에 (dkwSweep)
       소품을 소품함에 치우면 = 안에 든 문구도 같이 (다시 꺼내 놓으면 그대로)
   - ✏️ 펜꽂이 소품 톡 = 그 펜꽂이가 앞으로 다가와요 (dkwCupOpen(u)) : 그 펜꽂이에 꽂힌 것만 · 잡고 위로 쏙 = 손에
       펜꽂이 그림 = 다꾸러가 놓은 그 소품 그림 그대로 : 앞벽 마스크 + 입구(상품공방)가 있으면 도구가 그 안에 꽂힌 모습 · 없으면 앞벽 없이
   - 🗄️ 서랍장 문구함 칸 톡 = 그 서랍이 쭉 열려요 (dkwTrayOpen(need, 'u:칸')) : 칸막이 트레이에 그 서랍에 넣은 문구만 · 톡 = 꺼내 쓰기 · 🗑 버리기
       서랍 색 = 그 서랍장 그림의 그 칸 색
   - 🪡 핀셋 · ✂️ 가위가 필요할 때(gdNeed) = 그 문구가 든 곳(서랍 · 펜꽂이)이 열리고 깜박 (dkwOpenFor)
   - 필기구를 꺼내 쓰면 그리기 목록(diary_pencase · js/pencase.js)에도 들어가요 (그리기는 그 목록을 써요) */

        /* 🧩 문구 종류 = js/skins.js GD_CAB (종류마다 하는 일 hand) · 🧁 상품마다 = 상품공방 (도련 11-02) : 🗄️ 서랍칸 (칸막이 이름) · ✏️ 펜꽂이 (yes / no · 필기구는 늘) · 꽂이길이 · 이름
             → 새 종류 · 새 상품이 생기면 서랍 칸막이 · 펜꽂이 · 꺼내 쓰기가 저절로 (이 파일은 그대로) */
        const DKW_MAX = 24, DKW_AT_KEY = 'diary_gd_at', DKW_AT_L = 'malang_gd_at';
        const dkwMeta = g => ((GD_CAB.find(x => x[0] === g) || [])[2]) || {};
        const dkwP = id => ((window.prodList ? prodList('문구') : []).find(x => x.id === id) || {}).P || {};   // 그 문구 상품 속성
        const DKW = { need: null, tint: new Map(), sayT: 0 };
        const dkwq = id => document.getElementById(id);
        const dkwDesk = UI.desk;
        const dkwWait = ms => new Promise(r => setTimeout(r, ms));
        const dkwPens = () => { const own = new Set(pkOwnIds()); return pkAll().filter(t => own.has(t.id)); };
        const dkwOwnOf = gs => gs.flatMap(g => cabOwn(g));
        const dkwIsPen = id => pkIsId(id);
        const dkwCanCup = id => dkwIsPen(id) || dkwP(id).연필꽂이 === 'yes';       // 펜꽂이에 꽂을 수 있나요 : 필기구 = 늘 · 그 밖 = 상품 '펜꽂이'
        const dkwName = id => String(dkwP(id).이름 || '');                      // 상품 이름 그대로 (상품공방에서 정해요)
        const dkwArt = id => { if (dkwIsPen(id)) { const t = pkAll().find(x => x.id === id); return t ? pkSvg(t) : ''; } return cabArt(id); };
        const dkwItemEl = u => u ? document.querySelector(`#deskStage .desk-item[data-u="${u}"]`) : null;
        /* 🏠 문구의 집 (위 설명) */
        const dkwAt = () => { const v = prefGet(DKW_AT_KEY, DKW_AT_L); return v && typeof v === 'object' && !Array.isArray(v) ? Object.assign({}, v) : {}; };
        const dkwAtSet = m => prefSet(DKW_AT_KEY, DKW_AT_L, m);
        const dkwOwnAll = () => dkwPens().map(t => t.id).concat(dkwOwnOf(GD_CAB.map(x => x[0])));   // 가진 문구 (봉투 속은 빼요)
        const dkwIsCupU = u => { const o = DK.items.find(x => x.u === u); if (!o) return !!DK.partial; return dkHoldOk(o.id).includes('pc') && !dkSlots(o.id); };
        function dkwPlaceOk(p) { const [u, s] = String(p).split(':'); return s == null ? dkwIsCupU(u) : (dkHomes()[u] || []).some(e => e.k === 'gd' && e.s === +s); }
        const dkwHere = p => { const at = dkwAt(); return dkwOwnAll().filter(id => at[id] === p); };   // 그 집에 사는 문구
        const dkwOut = id => (DKW.fl && DKW.fl.has(id)) || (dkwIsPen(id) ? dkwPenOut().includes(id) : cabIsOn(id));   // ✋ 떠 있는 손도 = 밖에 (펜꽂이에서 빠져 보여요)   // 페이지에 꺼내 둔 것 (손에 든 것 포함)
        function dkwAtPut(id, p) { const m = dkwAt(); m[id] = p; dkwAtSet(m); dkwDeskSoon(); }
        const dkwPlaceName = p => { const [u, s] = String(p || '').split(':'), o = DK.items.find(x => x.u === u); if (!o) return ''; const S = dkSlots(o.id); return dkName(o) + (s != null && S ? ' ' + dkSlotNm(+s, S.length) + ' 서랍' : ''); };
        /* 집이 없는 문구 정리 : 🎁 처음 선물 = 담는 소품 상품 '처음담기' (✏️ 펜꽂이 · 🗄️ 문구함 칸 · 없으면 🛍️ 봉투 · 도련 11-06) · 나머지 (집이 없어졌거나 집 없이 받은 것) = 봉투에 담아 책상에 (페이지에 꺼내 둔 것은 치울 때)
           꾸미는 중 · 선물 받는 중 · 책상이 아직 없으면 기다려요 */
        function dkwSweep() {
            if (!dkwDesk() || DK.edit || !dkOnDesk().length || (window.deskGiftBusy && deskGiftBusy()) || !window.deskBagAdd) return;
            const at = dkwAt(), st = new Set(window.gdStarter ? gdStarter() : []), lost = []; let ch = false;
            const desk = dkOnDesk(), H = dkHomes(), n = u => Object.values(at).filter(p => p === u).length;
            const first = id => {                                                  // 🎁 처음 자리 = 책상 위 담는 소품 상품의 '처음담기' (도련 11-06 · 상품 순서 · 비어 있으면 봉투)
                for (const o of desk) {
                    const d = dkCat(o.id) || {}, F = d.firstIn; if (!F) continue;
                    if (d.hold === 'pc' && Array.isArray(F) && F.includes(id) && dkwIsCupU(o.u) && dkwCanCup(id) && n(o.u) < DKW_MAX) return o.u;
                    if (d.hold === 'drawer' && !Array.isArray(F)) for (const k of Object.keys(F)) { const s = Math.round(+k) - 1; if (Array.isArray(F[k]) && F[k].includes(id) && (H[o.u] || []).some(e => e.k === 'gd' && e.s === s)) return `${o.u}:${s}`; }
                }
                return '';
            };
            dkwOwnAll().forEach(id => {
                if (at[id] && dkwPlaceOk(at[id])) return;
                const w = !at[id] && st.has(id) ? first(id) : '';
                if (w) { at[id] = w; ch = true; return; }
                if (dkwOut(id)) return;
                if (at[id]) { delete at[id]; ch = true; }
                lost.push(id);
            });
            if (ch) dkwAtSet(at);
            if (lost.length) deskBagAdd(lost.map(id => ({ k: 'gd', n: dkwOutName(id).slice(0, 30), gid: id })));
        }
        function dkwSay(t, at) {                                                  // 작은 말풍선 = 누른 것 바로 위 (눈이 가 있는 곳 · 도련 11-02) · at 이 없으면 열린 창 위쪽
            let b = dkwq('dkwSay'); if (!b) { b = document.createElement('div'); b.id = 'dkwSay'; b.className = 'dkw-say'; document.body.appendChild(b); }
            b.textContent = t; b.classList.remove('on');
            const box = at || document.querySelector('#dkwTray:not([hidden]) .dkw-din, #dkwCup:not([hidden]) .dkw-cupart'), r = box ? box.getBoundingClientRect() : { left: innerWidth / 2, width: 0, top: innerHeight / 2 };
            const hw = b.offsetWidth / 2 + 8, x = Math.max(hw, Math.min(innerWidth - hw, r.left + r.width / 2)), y = at ? r.top - 8 : r.top + 12;
            b.style.left = x + 'px'; b.style.top = Math.max(b.offsetHeight + 8, y) + 'px';
            void b.offsetWidth; b.classList.add('on');
            clearTimeout(DKW.sayT); DKW.sayT = setTimeout(() => b.classList.remove('on'), 2000);
        }
        /* 🎨 소품 그림의 색 (그 자리 둘레 평균 · 투명은 빼요) → 서랍 · 컵 색 */
        function dkwTint(src, fx, fy) {
            const k = `${src.slice(0, 200)}|${src.length}|${fx}|${fy}`; if (DKW.tint.has(k)) return Promise.resolve(DKW.tint.get(k));
            return new Promise(ok => {
                const i = new Image(); if (!/^data:/.test(src)) i.crossOrigin = 'anonymous';
                i.onload = () => {
                    let out = null;
                    try {
                        const c = document.createElement('canvas'), w = 60, h = Math.max(1, Math.round(60 * i.naturalHeight / i.naturalWidth)); c.width = w; c.height = h;
                        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(i, 0, 0, w, h);
                        const cx = Math.round(fx * w), cy = Math.round(fy * h), d = x.getImageData(Math.max(0, cx - 3), Math.max(0, cy - 2), 7, 5).data;
                        let r = 0, g = 0, b = 0, n = 0; for (let j = 0; j < d.length; j += 4) if (d[j + 3] > 200) { r += d[j]; g += d[j + 1]; b += d[j + 2]; n++; }
                        if (n) out = [r / n, g / n, b / n].map(Math.round);
                    } catch (e) {}
                    DKW.tint.set(k, out); ok(out);
                };
                i.onerror = () => ok(null); i.src = src;
            });
        }
        const dkwMix = (c, t, a) => `rgb(${c.map((v, i) => Math.round(v + (t[i] - v) * a)).join(',')})`;
        function dkwColors(c) {                                                   // 바탕색 → 서랍 몸 · 속 · 선
            c = c || [248, 191, 205];
            return { body: `rgb(${c.join(',')})`, light: dkwMix(c, [255, 252, 246], .78), line: dkwMix(c, [70, 40, 34], .72), mid: dkwMix(c, [255, 255, 255], .35) };
        }

        /* ---------- 공통 : 다가오는 창 ---------- */
        function dkwRoom(id) {
            let r = dkwq(id); if (r) return r;
            r = document.createElement('div'); r.id = id; r.className = 'dkw-room'; r.hidden = true;
            r.addEventListener('pointerdown', e => { if (e.target !== r) return; if (window.dkDrawerOwns && dkDrawerOwns(r) && window.deskTapAt && deskTapAt(e.clientX, e.clientY)) return; dkwClose(); });   // 🗄 서랍에서 내려온 창 밖 = 그 자리 책상 톡 (같은 서랍 = 닫기 · 다른 서랍 = 이건 닫고 그 서랍 · 도련 11-05)
            document.body.appendChild(r); return r;
        }
        function dkwFly(box, el) {                                                // 책상 위 그 소품 자리에서 커지며 나와요
            if (!el) { box.animate([{ transform: 'scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.9,.3,1.1)' }); return; }
            const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); if (!b.width) return;
            const s = Math.max(.08, Math.min(a.width / b.width, a.height / b.height));
            const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
            box.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.08)' });
        }
        /* 🔍 가벼운 보관함 확대 (도련 11-11 · ✏️ 펜꽂이 · 🎀 마테 정리함 · 🧺 책 바구니 같은 모습) : 책상 위 작은 소품은 비워 두고 (들어 올린 것처럼) · 닫으면 큰 소품이 날아가 제자리로 들어가요 · 닫기 버튼 없이 밖 톡 */
        function dkwZoomIn(room, box, el, extra) {
            const away = [el].concat(extra || []).filter(Boolean); away.forEach(x => x.classList.add('dkz-away'));
            room._away = away; room._box = box; room._src = el; room.classList.remove('leaving');
            dkwShow(room); dkwFly(box, el);
        }
        function dkwZoomOut(room, fast) {
            if (!room || room.hidden || room._out) return Promise.resolve();
            const box = room._box, el = room._src, away = room._away || [];
            const done = () => { room._out = null; room.hidden = true; room.classList.remove('show', 'leaving'); room.innerHTML = ''; away.forEach(x => x.classList.remove('dkz-away')); room._away = null; };
            if (fast || !box || !el || !el.isConnected || matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return Promise.resolve(); }
            const a = el.getBoundingClientRect(), b = box.getBoundingClientRect();
            if (!b.width || !a.width) { done(); return Promise.resolve(); }
            const s = Math.max(.08, Math.min(a.width / b.width, a.height / b.height)), dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
            room.classList.add('leaving');
            return room._out = new Promise(ok => {
                const an = box.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
                let fin = false; const end = () => { if (fin) return; fin = true; done(); ok(); };
                an.onfinish = end; setTimeout(end, 600);
            });
        }
        window.dkwZoomIn = dkwZoomIn; window.dkwZoomOut = dkwZoomOut;
        function dkwClose() {
            const tr = dkwq('dkwTray'); if (tr && !tr.hidden && window.dkDrawerOwns && dkDrawerOwns(tr)) { dkDrawerShut(true); return; }   // 🗄 서랍에서 내려온 문구함 = 위로 올라가며 서랍도 닫혀요 (도련 11-05 · 그다음 이 함수가 다시 불려 닫아요)
            { const c = dkwq('dkwCup'); if (c && !c.hidden) dkwZoomOut(c); }   // ✏️ 큰 펜꽂이 = 날아가 제자리로
            ['dkwTray'].forEach(id => { const r = dkwq(id); if (r && !r.hidden) { r.classList.remove('show'); setTimeout(() => { r.hidden = true; }, 180); } });
            document.documentElement.classList.remove('dkw-on');
            dkwDeskSoon();
        }
        const dkwShown = () => ['dkwCup', 'dkwTray'].some(id => { const r = dkwq(id); return r && !r.hidden; });
        function dkwShow(r) { r.hidden = false; requestAnimationFrame(() => r.classList.add('show')); document.documentElement.classList.add('dkw-on'); }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && dkwShown() && !document.querySelector('.modal[style*="flex"]')) { e.stopPropagation(); dkwClose(); } }, true);

        /* ---------- ✏️ 펜꽂이 ---------- */
        /* 🧺 펜꽂이 앞벽 (도련 11-02 · 바구니처럼) = 상품공방에서 도련이 올린 '앞벽' 그림 + 입구 · 없으면 앞벽 없이 (자동으로 만들지 않아요) */
        function dkwFrontFor(el) {                                                // 이 펜꽂이 소품의 앞벽 · 입구 (상품 것) · 없으면 null
            const d = dkDef(el); return d.front && d.mouth ? { fm: new URL(d.front, location.href).href, mouth: d.mouth } : null;
        }
        const dkwPenOut = () => window.pcOutIds ? pcOutIds() : [];                // ✏️ 손에 든 · 페이지에 놓인 필기구 (js/draw.js)
        const dkwCupList = u => dkwHere(u).filter(id => !dkwOut(id));             // 그 펜꽂이에 꽂혀 있는 것 (페이지에 꺼내 둔 것은 빼요)
        /* 펜꽂이 장면 = 그 소품 그림 + 꽂힌 도구 + 앞벽 (책상 위 작은 것 · 다가온 큰 것 모두 이것) */
        function dkwCupScene(host, u, src, F, W, H, fl, big, skip) {               // skip = 빼고 그릴 것 (✏️ 손에 든 · 내려놓은 필기구)
            const m = F.mouth, mo = fl ? [100 - m[1], 100 - m[0], m[2]] : m;      // ↔ 좌우 바꾼 소품 = 입구도 반대로
            const ids = dkwCupList(u).filter(id => !(skip && skip.includes(id))), n = ids.length, l = mo[0] / 100 * W, rr = mo[1] / 100 * W, top = mo[2] / 100 * H, base = top + (H - top) * .45;
            const sc = H / 330;                                                   // 다가온 펜꽂이 높이 330 기준
            const tools = ids.map((id, i) => {
                const f = n === 1 ? .5 : i / (n - 1), x = l + (rr - l) * (.1 + .8 * f), a = (f - .5) * Math.min(36, 6 + n * 2.6), pen = dkwIsPen(id);
                const h = Math.round(sc * 250 * +dkwP(id).꽂이길이 * (n > 14 ? .92 : 1)), y = base - h + (i % 3) * 7 * sc;
                return `<${big ? 'button type="button"' : 'i'} class="dkw-t${pen ? ' pen' : ' ' + cabGOf(id)}" data-id="${htmlEsc(id)}"${big ? ` title="${htmlEsc(dkwName(id))}"` : ''} style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;height:${h}px;--a:${a.toFixed(1)}deg;z-index:${i % 2 ? 2 : 1}">${dkwArt(id)}</${big ? 'button' : 'i'}>`;
            }).join('');
            host.innerHTML = `<img class="dkw-cupimg" src="${htmlEsc(src)}" alt=""${fl ? ' style="transform:scaleX(-1)"' : ''} draggable="false"><div class="dkw-tools">${tools}</div>`
                + (!F.fm ? '' : `<i class="dkw-cupfm"${fl ? ' style="transform:scaleX(-1)"' : ''}><i style="--fm:url('${htmlEsc(F.fm)}')"><img src="${htmlEsc(src)}" alt="" draggable="false"></i></i>`);
            host.dataset.l = l.toFixed(1); host.dataset.r = rr.toFixed(1); host.querySelectorAll('.dkw-t').forEach(t => dkwPullWire(t, !big));   // ↔ 옆으로 밀 수 있는 곳 = 입구 안 (📌 책상 위 작은 펜꽂이도 · 도련 11-11)
        }
        /* 🪑 책상 위 펜꽂이에도 내가 꽂은 도구가 꽂혀 보여요 (바구니의 다이어리처럼 · 앞벽 뒤) */
        function dkwDeskPaint() {
            try { dkwSweep(); } catch (e) { console.warn('🏠 문구 집', e); }
            const cups = dkwDesk() ? dkOnDesk().filter(o => dkwIsCupU(o.u)).map(o => o.u) : [];
            document.querySelectorAll('#deskStage .desk-item > .dkw-desk').forEach(x => { if (!cups.includes(x.parentNode.dataset.u)) x.remove(); });
            cups.forEach(u => {
                const el = dkwItemEl(u); if (!el) return;
                const img = el.querySelector(':scope > img'), F = img && dkwFrontFor(el); if (!F) return;   // 앞벽이 없으면 책상 위에는 그림 그대로
                let host = el.querySelector(':scope > .dkw-desk'); if (!host) { host = document.createElement('div'); host.className = 'dkw-desk'; el.appendChild(host); }
                dkwCupScene(host, u, img.src, F, el.offsetWidth || parseFloat(el.style.width), el.offsetHeight || parseFloat(el.style.height), el.classList.contains('dk-fl'), false);
            });
        }
        let dkwDpT = 0; const dkwDeskSoon = () => { clearTimeout(dkwDpT); dkwDpT = setTimeout(() => { try { dkwDeskPaint(); } catch (e) { console.warn('✏️ 책상 펜꽂이', e); } }, 120); };
        new MutationObserver(dkwDeskSoon).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });   // 다이어리를 펴고 접을 때 (꺼낸 도구가 돌아오면)
        async function dkwCupOpen(u, need) {
            if (!dkwDesk()) return;
            const el = dkwItemEl(u); if (!el) return;
            const img = el.querySelector(':scope > img'), F = img && (dkwFrontFor(el) || { fm: '', mouth: [15, 85, 45] }), r = dkwRoom('dkwCup');   // 앞벽이 없으면 = 도구가 그림 앞에 (가리지 않아요)
            const n = dkwCupList(u).length, out = dkwHere(u).filter(dkwOut).length, d = dkDef(el);
            const H = Math.min(380, Math.round(innerHeight * .5)), W = Math.round(H * (d.w || el.offsetWidth) / (d.h || el.offsetHeight));
            r.innerHTML = `<div class="dkw-cupbox">
                <p class="dkw-hint">${n ? '도구를 잡고 <b>위로 쏙</b> 끌어 올리면 손에 들어요 · <b>옆으로 밀면</b> 비켜나요' : '펜꽂이가 비었어요 · <b>🛍️ 봉투</b>에서 문구를 끌어다 꽂아요'}${out ? `<small>페이지에 꺼내 둔 도구 ${out}개</small>` : ''}</p>
                <div class="dkw-cupart" style="width:${W}px;height:${H}px"></div></div>`;   // 닫기 = 밖 톡 (도련 11-11 · 버튼 없이)
            const host = r.querySelector('.dkw-cupart');
            if (F) dkwCupScene(host, u, img.src, F, W, H, el.classList.contains('dk-fl'), true);
            if (need) host.querySelectorAll('.dkw-t').forEach(t => { if (cabGOf(t.dataset.id) === need) t.classList.add('need'); });
            dkwZoomIn(r, host, el);                                                // 🔍 책상 위 작은 펜꽂이는 비워 두고 · 큰 펜꽂이가 그 자리에서 날아와요
        }
        /* ✋ 뽑기 = 잡고 위로 끌어 올려요 (도련 11-02 · 톡 = 안 뽑혀요 · 현실처럼) : 110px 넘게 올리면 쏙 · 덜 올리고 놓으면 제자리로
           ↔ 옆으로 밀면 비켜나요 (도련 11-03 · 예전 펜꽂이처럼) : 놓아도 민 자리 · 기울기 그대로 · 잡은 것이 맨 앞 → 뒤에 가린 것을 골라요 */
        const DKW_PULL = 110; let dkwZ = 10;
        function dkwPullWire(b, desk) {                                           // ✋ 펜꽂이 도구 : 옆으로 밀기 · 위로 쏙 뽑기 (큰 펜꽂이 · 📌 책상 위 작은 펜꽂이 같게 · 도련 11-11)
            let p = null;
            const S = () => desk ? (DK.s || 1) : 1, PULL = desk ? 46 : DKW_PULL;  // 작은 펜꽂이 = 책상 그림 배율 (화면에서 움직인 만큼)
            const place = up => { const k = 1 - Math.min(1, up / PULL); b.style.transform = `translateX(-50%) translateY(${(-up / S()).toFixed(1)}px) rotate(calc(var(--a) * ${k.toFixed(2)}))`; };
            b.addEventListener('pointerdown', e => {
                if (e.button > 0 || b.classList.contains('pull')) return;
                if (desk && (DK.edit || !dkwDesk())) return;                        // 🛠 꾸미는 동안 = 펜꽂이를 옮겨요
                e.preventDefault(); if (desk) e.stopPropagation();                 // 작은 펜꽂이 통 톡(확대)으로 가지 않게
                try { b.setPointerCapture(e.pointerId); } catch (er) {}
                const host = b.parentNode.parentNode;
                p = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, x0: parseFloat(b.style.left), a0: parseFloat(b.style.getPropertyValue('--a')) || 0, L: +host.dataset.l, R: +host.dataset.r };
                b.classList.add('grab'); b.style.zIndex = ++dkwZ;                    // 잡은 것이 맨 앞
            });
            b.addEventListener('pointermove', e => {
                if (!p || e.pointerId !== p.id) return;
                const up = Math.max(0, p.y - e.clientY), dx = e.clientX - p.x;
                if (up > 4 || Math.abs(dx) > 3) p.moved = true;
                const x = Math.max(p.L, Math.min(p.R, p.x0 + dx / S()));             // ↔ 입구 안에서만
                b.style.left = x.toFixed(1) + 'px'; b.style.setProperty('--a', Math.max(-24, Math.min(24, p.a0 + (x - p.x0) * .15)).toFixed(1) + 'deg');   // 민 쪽으로 기울어요
                place(up);
                if (up > PULL) {                                                 // 쏙 뽑혔어요
                    const id = b.dataset.id; p = null; b.classList.remove('grab'); b.style.transform = '';
                    if (navigator.vibrate) try { navigator.vibrate(12); } catch (er) {}
                    if (window.dkCarry) { dkwManual(id, b, e); b.style.opacity = '0'; if (!desk) dkwClose(); }   // 뽑은 채로 끌어요 → 놓은 곳 (보관함 = 넣기 · 그 밖 = 손에 · 도련 11-11)
                    else { b.classList.add('pull'); setTimeout(() => dkwUse(id), 260); }
                }
            });
            const end = e => {
                if (!p || e.pointerId !== p.id) return;
                const tap = !p.moved; p = null; b.classList.remove('grab'); b.style.transform = '';   // 덜 뽑았으면 쏙 내려가요 (민 자리는 그대로)
                if (tap && desk && e.type === 'pointerup') { dkwFlyUse(b.dataset.id, b); return; }   // 📌 작은 펜꽂이 톡 = 가운데로 와서 손에
                if (tap) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); dkwSay('✋ 잡고 위로 쏙 끌어 올려요 · 옆으로 밀면 비켜나요', b); }
            };
            b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
        }

        /* ---------- 🗄️ 문구함 서랍 ---------- */
        /* 🪡 그 종류 문구가 든 곳을 열어요 (gdNeed · 그리기 펜꽂이의 '보관함') : 서랍 먼저 · 펜꽂이 · 없으면 알려 줘요 */
        function dkwOpenFor(need) {
            if (!dkwDesk()) return;
            { const f = [...DKW.fl.keys()].find(id => !need || cabGOf(id) === need || (need === 'pen' && dkwIsPen(id))); if (f) { if (window.toolGlow) toolGlow(DKW.fl.get(f)); return; } }   // ✋ 그 문구가 밖에 떠 있으면 = 그걸 반짝 (서랍을 뒤지지 않아요 · '넣어 둔 핀셋이 없어요' 알림이 떴어요 · 도련 11-13)
            const at = dkwAt(), ids = dkwOwnAll().filter(id => at[id] && dkwPlaceOk(at[id]) && !dkwOut(id) && (!need || cabGOf(id) === need || (need === 'pen' && dkwIsPen(id))));
            const ps = [...new Set(ids.map(id => at[id]))].filter(p => { const u = String(p).split(':')[0], o = DK.items.find(x => x.u === u); return o && o.at === 'desk'; }).sort((a, b) => String(b).includes(':') - String(a).includes(':'));
            if (!ps.length) { if (window.showMsg) showMsg(`✏️ 책상 소품에 넣어 둔 ${htmlEsc(josa(need ? (GD_CAB.find(x => x[0] === need) || [])[1] || '문구' : '문구', '이', '가'))} 없어요.`); return; }
            const p0 = ps[0]; if (String(p0).includes(':')) dkwTrayOpen(need, p0); else dkwCupOpen(p0, need);
        }
        async function dkwTrayOpen(need, place) {
            if (!dkwDesk()) return;
            if (!place) { dkwOpenFor(typeof need === 'string' ? need : ''); return; }
            DKW.need = typeof need === 'string' ? need : null; DKW.place = place;
            { const c = dkwq('dkwCup'); if (c && !c.hidden) { c.classList.remove('show'); c.hidden = true; } }   // ✏️ 펜꽂이에서 왔으면 펜꽂이는 내려놓고
            const [hu, hs] = place.split(':'), he = (dkHomes()[hu] || []).find(e => e.k === 'gd' && e.s === +hs), el = dkwItemEl(hu), img = el && el.querySelector(':scope > img');
            let col = null;
            if (img && he) { const R = he.r || [0, 0, 100, 100], fl = el.classList.contains('dk-fl'), fx = (R[0] + (R[2] - R[0]) * .2) / 100; col = await dkwTint(img.src, fl ? 1 - fx : fx, ((R[1] + R[3]) / 2) / 100); }
            const c = dkwColors(col), r = dkwRoom('dkwTray');
            r.innerHTML = `<div class="dkw-drawer" style="--db:${c.body};--dl:${c.light};--dk:${c.line};--dm:${c.mid}">
                <div class="dkw-dtop"><b>🗄️ 문구함</b><small>${htmlEsc(dkwPlaceName(place))}</small><button type="button" class="dkw-bin" id="dkwBin" aria-pressed="false" title="버리기">🗑</button><button type="button" class="dkw-dx" aria-label="닫기" onclick="dkwClose()">✕</button></div>
                <div class="dkw-din" id="dkwIn"></div>
                <span class="dkw-more" id="dkwMore" hidden><b>⬇ 아래로 더 있어요</b></span>
                <div class="dkw-dfront"><span class="dkw-lbl">✏️ 문구함</span><i class="dkw-knob"></i></div>
                <div class="dkw-foot"><span id="dkwTip"></span></div></div>`;
            DKW.bin = false;
            dkwq('dkwBin').onclick = () => { DKW.bin = !DKW.bin; dkwTrayPaint(); };   // 🗑 버리기 (도련 11-02 · 📱 문구함 서랍처럼 · 톡 = 휴지통으로 · js/skins.js gdBin)
            dkwShow(r); dkwTrayPaint();                                          // 보이게 한 뒤 그려요 (줄이 넘치는지 재야 해서)
            dkwFly(r.querySelector('.dkw-drawer'), el);
        }
        /* 🗄️ 서랍 칸막이 = 한 줄씩 · 옆으로 끝없이 넘겨요 (도련 11-02 · 📱 보관함처럼) : 문구가 늘어도 서랍 높이는 그대로 · 칸막이 종류가 한눈에
           넘치는 줄만 = 같은 줄을 세 번 이어 붙이고 가운데에서 시작 · 끝에 가까워지면 한 바퀴만큼 몰래 되돌려요 (끝에 닿으면 처음 것이 다시 와요)
           넘기기 : 👆 밀기 · 🖱 끌기 · 휠 · ‹ › · 다시 그려도(♥) 넘긴 자리 그대로 */
        function dkwTrayPaint() {
            const inn = dkwq('dkwIn'); if (!inn) return;
            const keep = {}; inn.querySelectorAll('.dkw-row').forEach(r => { keep[r.dataset.k] = r._off || 0; }); const top = inn.scrollTop;   // 넘긴 자리 기억
            const secs = [], at = {};                                          // 칸막이 = 상품 '서랍칸' (같은 이름끼리 · 필기구 먼저 · 그다음 종류 표 순서)
            /* ✋ 밖에 나온 문구(떠 있는 · 페이지 위)는 서랍에 없어요 (도련 11-11 · 현실처럼) */
            dkwHere(DKW.place).filter(id => !dkwOut(id)).forEach(id => { const sn = String(dkwP(id).서랍칸 || ''); if (!sn) return; if (at[sn] == null) { at[sn] = secs.length; secs.push([dkwIsPen(id) ? 'pen' : 's' + secs.length, sn, []]); } secs[at[sn]][2].push(id); });   // 필기구 칸 = 넓게 (css .dkw-pen)
            for (let i = secs.length - 1; i >= 0; i--) if (!secs[i][2].length) secs.splice(i, 1);
            const card = (id, copy) => {
                const pg = dkwOut(id), need = DKW.need && cabGOf(id) === DKW.need;
                return `<div class="dkw-it${need ? ' need' : ''}" data-id="${htmlEsc(id)}"${copy ? ' aria-hidden="true"' : ''}><button type="button" class="dkw-use" title="꺼내 쓰기"${copy ? ' tabindex="-1"' : ''}><span class="dkw-art">${dkwArt(id)}</span><b>${htmlEsc(dkwName(id))}</b>${pg ? '<em>페이지에</em>' : ''}</button></div>`;
            };
            inn.innerHTML = secs.length ? secs.map(([k, nm, ids]) => `<div class="dkw-sec dkw-${k}"><h4>${htmlEsc(nm)}<small>${ids.length}개</small></h4><div class="dkw-rowbox"><div class="dkw-row" data-k="${htmlEsc(nm)}"><div class="dkw-its">${ids.map(id => card(id)).join('')}</div></div>`
                + `<button type="button" class="dkw-go l" aria-label="앞으로" hidden>‹</button><button type="button" class="dkw-go r" aria-label="뒤로" hidden>›</button></div></div>`).join('') : '<div class="dkw-none">서랍이 비었어요 · 🛍️ 봉투에서 문구를 끌어다 넣어요</div>';
            inn.querySelectorAll('.dkw-row').forEach(r => dkwRowWire(r, keep[r.dataset.k] || 0, card));
            inn.scrollTop = top;
            inn.onclick = e => {                                                   // 톡 = 꺼내 쓰기 (이어 붙인 것도 같아요)
                const it = e.target.closest('.dkw-it'); if (!it) return; const row = it.closest('.dkw-row'); if (row && row._drag) return;   // 끌어서 넘긴 건 톡이 아니에요
                const id = it.dataset.id;
                if (DKW.bin) { gdBin(id).then(ok => { if (ok) dkwTrayPaint(); }); return; }   // 🗑 버리는 중 = 톡 = 휴지통으로
                if (e.target.closest('.dkw-use')) dkwFlyUse(id, it.querySelector('.dkw-art') || it);   // 톡 = 화면 가운데로 날아와 손에 (도련 11-11)
            };
            const more = () => { const d = dkwq('dkwIn'), m = dkwq('dkwMore'); if (!d) return; const on = d.scrollHeight - d.scrollTop - d.clientHeight > 12; if (m) m.hidden = !on; };   // ⬇ 아래에 더 있어요 (칸막이 종류가 아주 많을 때만)
            inn.onscroll = more; requestAnimationFrame(more);
            { const t = inn.closest('.dkw-drawer'), bb = dkwq('dkwBin'); if (t) t.classList.toggle('binning', !!DKW.bin); if (bb) { bb.classList.toggle('on', !!DKW.bin); bb.setAttribute('aria-pressed', !!DKW.bin); bb.textContent = DKW.bin ? '✓ 다 했어요' : '🗑'; } }
            if (DKW.bin) { const tip = dkwq('dkwTip'); if (tip) tip.innerHTML = '🗑 <b>버릴 문구를 톡</b> · 휴지통에 30일 보관했다가 지워져요 (⚙ 설정 → 🗑 휴지통에서 되살리기)'; return; }
            const tip = dkwq('dkwTip'); if (tip) tip.innerHTML = '톡 = 꺼내 쓰기 · 옆으로 밀면 더 있어요';
        }
        /* 🗄️ 서랍이 열려 있을 때 넣는 길 둘 (도련 11-12) : 밖에 나온 문구를 ① 열린 문구함(위 창) 안으로 끌어 놓거나 ② 그 서랍장에 끌어 놓으면 = 고르기 없이 그 서랍에 · 바로 위 창에 보여요
           부르는 곳 = js/deskmove.js dropOn (떠 있는 문구 끌기) · 아래 꺼낸 문구 줄 끌기 (dkwOutGrab) → true = 넣었어요 */
        function dkwTrayInto(id, x, y) {
            const r = dkwq('dkwTray'); if (!r || r.hidden || !DKW.place || !dkwDesk() || DKW.bin) return false;
            const box = r.querySelector('.dkw-drawer'), b = box && box.getBoundingClientRect();
            const inBox = !!b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
            const u = String(DKW.place).split(':')[0];
            const onChest = !inBox && document.elementsFromPoint(x, y).some(e => { const h = e.closest && e.closest('#deskStage .desk-item'); return !!h && h.dataset.u === u; });
            if (!inBox && !onChest) return false;
            dkwBackOne(id, true); dkwAtPut(id, DKW.place); dkwTrayPaint();
            const it = dkwq('dkwIn') && dkwq('dkwIn').querySelector(`.dkw-it[data-id="${CSS.escape(id)}"]:not([aria-hidden])`);
            if (it) { it.scrollIntoView({ block: 'nearest', inline: 'nearest' }); it.animate([{ transform: 'translateY(-26px) scale(1.25)', opacity: .3 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.2)' }); }   // 쏙 들어가는 모습
            if (window.dkbPulse) { const h = dkwItemEl(u); if (h) dkbPulse(h); }
            setTimeout(dkwBackPaint, 0);
            return true;
        }
        window.dkwTrayInto = dkwTrayInto;
        function dkwRowWire(r, off, card) {                                         // 한 줄 : 넘치면 끝없이 · 아니면 그대로
            const its = r.querySelector('.dkw-its'), box = r.parentNode, L = box.querySelector('.dkw-go.l'), R = box.querySelector('.dkw-go.r');
            if (its.scrollWidth <= r.clientWidth + 2) { r._off = 0; return; }
            const one = its.innerHTML, ids = [...its.children].map(x => x.dataset.id);
            const lap0 = its.scrollWidth + parseFloat(getComputedStyle(its).columnGap || 6);   // 한 바퀴 길이 (사이 간격 하나 더)
            its.innerHTML = ids.map(id => card(id, true)).join('') + one + ids.map(id => card(id, true)).join('');
            r.classList.add('loop'); L.hidden = R.hidden = false;
            const lap = () => its.children[ids.length].offsetLeft - its.children[0].offsetLeft || lap0;
            r.scrollLeft = lap() + off;
            const wrap = () => { const w = lap(); if (r.scrollLeft < w * .5) r.scrollLeft += w; else if (r.scrollLeft > w * 1.5) r.scrollLeft -= w; r._off = r.scrollLeft - w; };
            r.addEventListener('scroll', wrap, { passive: true });
            r.addEventListener('wheel', e => { const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (!d) return; e.preventDefault(); r.scrollLeft += d; }, { passive: false });   // 🖱 휠 = 옆으로
            const step = k => { r.scrollBy({ left: k * r.clientWidth * .7, behavior: 'smooth' }); };
            L.onclick = () => step(-1); R.onclick = () => step(1);
            let d = null;                                                         // 🖱 끌어서 넘기기 (👆 손가락은 원래대로 밀려요)
            r.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button > 0) return; d = { x: e.clientX, s: r.scrollLeft, id: e.pointerId }; r._drag = false; });
            r.addEventListener('pointermove', e => { if (!d || e.pointerId !== d.id) return; const dx = e.clientX - d.x; if (Math.abs(dx) > 6) { r._drag = true; r.classList.add('drag'); } if (r._drag) r.scrollLeft = d.s - dx; });
            const up = () => { if (!d) return; d = null; r.classList.remove('drag'); setTimeout(() => { r._drag = false; }, 0); };
            r.addEventListener('pointerup', up); r.addEventListener('pointercancel', up); r.addEventListener('pointerleave', up);
        }

        /* ---------- 꺼내 쓰기 ---------- */
        async function dkwReady() {                                               // 📔 책상 위 다이어리를 펴고 · 표지면 열어요
            const H = document.documentElement;
            if (!H.classList.contains('desk-show') && window.deskOpenDiary) { deskOpenDiary(); await dkwWait(720); }
            if (!isCoverOpen && typeof openCoverAnimated === 'function') { openCoverAnimated(); for (let i = 0; i < 40 && !isCoverOpen; i++) await dkwWait(80); await dkwWait(200); }
            if (!isCoverOpen) { if (window.showMsg) showMsg('📔 다이어리를 펴면 문구를 쓸 수 있어요.'); return false; }
            return true;
        }
        /* ✋ 떠 있는 문구 (도련 11-11 · 💻 📲 책상 = 다이어리 따로 · 상품 따로) : 다이어리가 닫혀 있을 때 꺼낸 문구 · 다이어리를 접을 때 페이지에 있던 문구는
             쓰는 크기 · 방향 그대로 공중에 떠 있어요 (다이어리와 같이 사라지지 않아요 · 📱 하단 메뉴는 예전처럼 페이지 안)
             - 끌기 = 옮기기 (보관함에 놓으면 = 넣기 · 한 번 골라요) · 톡 = 다이어리가 펼쳐져 있으면 그 자리에서 손에 · 접혀 있으면 '다이어리를 펴면 써요'
             - 아래 꺼낸 문구 줄 ✕ = 제자리로 (다이어리가 접혀 있어도) */
        const dkwOpenNow = () => document.documentElement.classList.contains('desk-show') && isCoverOpen;
        DKW.fl = new Map();                                                     // id → 떠 있는 그림
        function dkwFloat(id, x, y) {
            dkwFloatOff(id, true);
            const pen = dkwIsPen(id), P = pen && window.pkAll ? pkAll().find(t => t.id === id) : null, pic = window.gdPic ? gdPic(id) : null;
            const rf = id.startsWith('ruler:') && window.rlFloatArt ? rlFloatArt(id) : null;   // 📏 자 = 페이지 자와 같은 눈금 자 · 같은 길이 (민무늬 큰 '가상의 자' 없앰 · 도련 11-13)
            const sz = pen && P && P.box ? P.box : rf ? [rf.w, rf.h] : (pic && pic.size ? pic.size : [40, 140]);   // 📏 자 = 쓰는 크기(진짜 cm) 그대로 (도련 11-12 : 공중의 자가 너무 작았어요)
            const el = document.createElement('div'); el.className = 'dkw-fl' + (pen ? ' pen' : ''); el.dataset.id = id;
            el.innerHTML = `<i style="width:${sz[0]}px;height:${sz[1]}px;rotate:${pen ? (typeof handLeft === 'function' && handLeft() ? 145 : -145) : -28}deg">${rf ? rf.svg : window.gdPicSvg ? gdPicSvg(id) : dkwArt(id)}</i>`;   // ✏️ 손에 든 모습 그대로 (연필심이 왼쪽 아래 · js/draw.js PC_ANG)
            el.style.left = x + 'px'; el.style.top = y + 'px';
            el._ang = pen ? (typeof handLeft === 'function' && handLeft() ? 145 : -145) : -28;
            el._tip = pen && P && P.tip ? [P.tip[0] - sz[0] / 2, P.tip[1] - sz[1] / 2] : [0, 0];   // 연필심 = 마우스 끝 (손에 든 것처럼)
            document.body.appendChild(el); DKW.fl.set(id, el); dkwFlWire(el); if (dkwDiaryUp()) dkwSel(id, true); dkwDeskSoon();   // 🪑 책상모드에서 꺼내면 = 마우스에 안 붙어요 (도련 11-12)
            return el;
        }
        function dkwFloatOff(id, quiet) { const el = DKW.fl.get(id); if (!el) return false; el.remove(); DKW.fl.delete(id); if (DKW.sel === id) { DKW.sel = null; document.body.classList.remove('dkw-follow'); } if (!quiet) dkwDeskSoon(); return true; }
        /* 🖱 마지막으로 만진 것 = 마우스에 붙어 따라와요 (도련 11-11 · 손에 든 것처럼 · 연필심이 마우스 끝) : 다이어리 페이지 클릭 = 그 자리에서 쓰기 · 들어갈 보관함 클릭 = 넣기 · 다른 곳 클릭 = 그 자리에 내려놔요 (떠 있어요) */
        /* 🪑 책상모드(책상이 보여요 · 다이어리가 접힌 채 떠 있어도)에서는 마우스에 붙지 않아요 (도련 11-12) · 📔 다이어리모드(표지를 펼쳐 바탕이 깔림 = html.dk-bgon)에서만 따라와요
           책상모드에서 고른 것(톡)은 표시만 → 📔 다이어리 톡 · 표지 밀기 = 든 채로 펼치기 (1134 : 로그인 첫 번 접힌 채 떠 있을 때 붙은 손이 표지 밀기를 먹었어요) */
        const dkwDiaryUp = () => document.documentElement.classList.contains('dk-bgon');
        function dkwSel(id, quiet) { const was = DKW.sel; DKW.sel = id || null; if (!DKW.sel || !dkwDiaryUp()) document.body.classList.remove('dkw-follow'); DKW.fl.forEach((el, k) => el.classList.toggle('sel', k === DKW.sel)); if (id && DKW.mouse && dkwDiaryUp()) dkwFollow(DKW.mouse.x, DKW.mouse.y); if (id && id !== was && !quiet && window.toolGlow) toolGlow(DKW.fl.get(id)); }   // ✨ 고르면 핑크빛으로 한 번 반짝 (손에 들 때와 같은 toolGlow · 도련 11-12)
        /* ✋ 📔 다이어리모드 : 손에 든 문구가 페이지 밖으로 나가면 = 공중에 떠서 마우스를 따라와요 (🪡 핀셋처럼 화면 전체 · 도련 11-12) · ✏️ 필기구 (js/draw.js) · 🔪 칼 (js/stkcut.js) 도 여기로 (다른 문구는 js/skins.js gdLetAir)
           → 페이지 톡 = 그 자리에서 다시 손에 · 책상(다이어리 밖) 톡 = 고르기 풀림 (그 톡으로 책상모드로 넘어가지 않아요 · js/drive.js dkwAteAt) */
        window.dkwAirOut = (id, el) => !!id && !!el && dkwDesk() && dkwDiaryUp() && !!window.dkwAirPut && window.dkwAirPut(id, el, true);
        function dkwFollow(x, y) {
            const el = DKW.sel && DKW.fl.get(DKW.sel); if (!el) { document.body.classList.remove('dkw-follow'); return; }
            document.body.classList.add('dkw-follow');                          // 🖱 붙은 문구가 곧 마우스 (화살표 숨김 · 도련 11-13 · css body.dkw-follow)
            const a = (el._ang || 0) * Math.PI / 180, t = el._tip || [0, 0], ox = t[0] * Math.cos(a) - t[1] * Math.sin(a), oy = t[0] * Math.sin(a) + t[1] * Math.cos(a);
            el.style.left = (x - ox) + 'px'; el.style.top = (y - oy) + 'px';
        }
        addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse') return;
            DKW.mouse = { x: e.clientX, y: e.clientY };
            if (DKW.sel && !e.buttons && dkwDesk() && dkwDiaryUp()) dkwFollow(e.clientX, e.clientY);
        }, { passive: true });
        addEventListener('pointerdown', e => {
            if (!DKW.sel || e.button > 0 || !dkwDesk()) return;   // 👆 손가락도 (도련 11-12 : 집어 든 다음 톡 = 그 자리)
            const t = e.target, id = DKW.sel;
            if (cabGOf(id) === 'tweez' && dkwOpenNow() && !(t.closest && t.closest('.dkw-fl, .dkw-strip, .modal, .dkw-room, .desk-top-r, .toolbar, .page-header, #customAlertModal, .dk-vol, #coverPage, #dkLock'))) {   // 🪡 붙은 핀셋 : 빈 책상이 아니면 (페이지 · 스티커 떼는 창 · 꺼낸 스티커 위) = 그 자리에서 손에 (도련 11-13)
                const H = document.documentElement, desk = t === document.body || t === H || (t.closest && t.closest('#diaryWrapper, #bgPatternLayer') && !t.closest('#diaryBook'));
                if (!desk) { e.preventDefault(); e.stopPropagation(); dkwUse(id, { x: e.clientX, y: e.clientY }); return; }   // 이 톡 = 손에 들기 (다른 문구와 같아요 · 그다음 톡부터 집기 · 떼기)
            }
            if (t.closest && t.closest('.dkw-fl, .dkw-strip, .modal, .dkw-room, .desk-top-r, .toolbar, .page-header, #customAlertModal, .dsk, .dk-vol, #coverPage, #dkLock')) return;   // 📖 겉표지 = 밀어서 펼치기 그대로   // 다른 떠 있는 것 · 꺼낸 문구 줄 · 창 · 버튼 · 📔 다이어리 톡(펼치기)은 그대로 (든 채로)
            const pg = t.closest && t.closest('#canvasArea');
            if (pg && dkwOpenNow()) { e.preventDefault(); e.stopPropagation(); dkwUse(id, { x: e.clientX, y: e.clientY }); return; }   // 📔 펼친 페이지 = 그 자리에서 쓰기
            const h = t.closest && t.closest('#deskStage .desk-item');
            if (h && window.dkOutsFor && dkOutsFor(h).some(o => o.id === id)) return;   // 들어갈 보관함 = 넣기 (js/deskmove.js)
            if (!dkwDiaryUp()) { dkwSel(null); return; }                          // 🪑 책상모드 = 붙어 있지 않으니 고른 표시만 풀고 그 톡은 그대로 (서랍 · 소품 기능)
            e.preventDefault(); e.stopPropagation(); dkwSel(null); window.dkwAteAt = Date.now();   // 그 밖 = 그 자리에 내려놔요 (이 톡은 고르기 풀기만 · 책상모드로 안 넘어가요)
        }, true);
        function dkwFlWire(el) {
            const id = el.dataset.id;
            el.addEventListener('pointerdown', ev => {
                if (ev.button > 0) return; ev.preventDefault(); ev.stopPropagation();
                const x0 = ev.clientX, y0 = ev.clientY, l0 = parseFloat(el.style.left), t0 = parseFloat(el.style.top); let on = false;
                try { el.setPointerCapture(ev.pointerId); } catch (e) {}
                const mv = e => { if (e.pointerId !== ev.pointerId) return; if (!on && Math.hypot(e.clientX - x0, e.clientY - y0) < 6) return; on = true; el.classList.add('lift'); el.style.left = (l0 + e.clientX - x0) + 'px'; el.style.top = (t0 + e.clientY - y0) + 'px'; };
                const up = async e => {
                    if (e.pointerId !== ev.pointerId) return; el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.classList.remove('lift');
                    if (e.type !== 'pointerup') return;
                    if (on) { if (window.dkDropOn) await dkDropOn(e.clientX, e.clientY, { k: 'gd', id }); return; }   // 끌어 놓기 = 옮기기 · 보관함 = 넣기
                    if (e.pointerType === 'mouse') { dkwSel(id); return; }               // 🖱 톡 = 집어 들어요 (마우스에 붙어요)
                    if (!dkwOpenNow()) { dkwSel(DKW.sel === id ? null : id); return; }     // 👆 다이어리가 접혀 있으면 = 공중에서 집어 들어요 (도련 11-12 · 하단 모드 페이지 안처럼) → 다이어리를 펴고 페이지 톡 = 그 자리에서 써요
                    const r = el.getBoundingClientRect(); dkwUse(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });   // 톡 = 그 자리에서 손에
                };
                el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
            });
        }
        /* 📔 다이어리를 접을 때 (js/desk.js deskCloseDiary 맨 앞) : 페이지 위 문구 · 손에 든 필기구 = 그 자리에서 떠요 */
        function dkwFloatAll() {
            if (!dkwDesk()) return;
            const L = dkwOutAll().filter(id => !DKW.fl.has(id)).map(id => { const r = dkwIsPen(id) ? (window.pcRectOf && pcRectOf(id)) : (gdEl(id) && gdEl(id).getBoundingClientRect()); return [id, r]; });
            L.forEach(([id, r]) => { dkwBackOne(id, true); if (r && r.width) dkwFloat(id, r.left + r.width / 2, r.top + r.height / 2); else dkwFloat(id, innerWidth / 2, innerHeight / 2); });
            if (DKW.sel) dkwSel(null);                                            // 🪑 책상모드로 돌아가니 마우스에 안 붙어요 (도련 11-12)
        }
        window.dkwFloatAll = dkwFloatAll;
        /* ✋ 손에 든 문구를 내려놓으면 = 그 자리 공중에 떠요 (도련 11-12 · 💻 📲 책상 : 하단 모드는 페이지 안에 놓이지만 책상 모드는 다이어리 밖 공중) · js/skins.js gdLetAir */
        window.dkwAirPut = (id, el, keep) => {   // keep = 손에 든 채 (🖱 마우스에 붙어 따라와요)
            if (!dkwDesk() || !el) return false;
            const r = el.getBoundingClientRect(); if (!r.width) return false;
            dkwBackOne(id, true); dkwFloat(id, r.left + r.width / 2, r.top + r.height / 2); if (!keep) dkwSel(null);
            return true;
        };
        window.dkwPendOff = () => { [...DKW.fl.keys()].forEach(id => dkwFloatOff(id, true)); dkwDeskSoon(); };   // 🧹 다른 곳으로 갈 때 = 모두 제자리로 (js/desk.js deskReset)
        window.dkwOutNow = () => dkwOutAll();                                    // ✋ 밖에 나온 문구 (페이지 위 · 떠 있는 것 · js/deskmove.js 넣기)
        window.dkwBack = id => { dkwBackOne(id); dkwDeskSoon(); };              // ✋ 제자리로
        async function dkwUse(id, at) {                                          // at = 그 자리 (끌어 놓은 곳 · 떠 있던 곳 · 없으면 가운데)
            const air = !dkwOpenNow() && dkwDesk(), tr = dkwq('dkwTray'), keep = air && tr && !tr.hidden;   // 🗄️ 열린 서랍에서 꺼내 공중에 = 서랍은 열린 채 (도련 11-12 : 원하는 만큼 꺼내요 · 닫기는 손으로)
            if (!keep) dkwClose();
            if (dkwIsPen(id) && !pkRead().includes(id)) { pkWrite(pkRead().concat([id])); if (window.pcRefill) pcRefill(); }   // 꺼낸 필기구 = 그리기 목록에도 (그리기는 그 목록을 써요 · 책상의 집과는 따로)
            if (air) { const c = at || { x: innerWidth / 2, y: innerHeight / 2 }; dkwFloat(id, c.x, c.y); if (keep) dkwTrayPaint(); return; }   // 📔 저절로 펴지 않아요 = 그 자리에 떠 있어요 (도련 11-11) · 서랍 창에서는 빠져 보여요
            dkwFloatOff(id, true);
            if (dkwIsPen(id)) { if (window.drawWith && !drawWith(id, at && at.x, at && at.y) && window.openDraw) openDraw(); return; }
            dkwTake(id, at);
        }
        /* ✋ 꺼내기 하나로 (도련 11-11 · 마테 · 스티커와 같아요) : 톡 = 그 문구가 화면 가운데로 날아와 손에 · 끌기 = 손으로 끌어내 놓은 곳에서 손에 */
        async function dkwFlyUse(id, from) {
            if (from && window.dkFly) await dkFly(from, innerWidth / 2, innerHeight / 2);
            dkwUse(id);
        }
        function dkwManual(id, src, ev) {                                         // ✋ 끌어내기 : 그림이 손을 따라와요 → 들어갈 보관함 = 넣기 (한 번 골라요) · 아니면 손에 (js/deskmove.js)
            const done = async (x, y) => { if (window.dkDropOn && await dkDropOn(x, y, { k: 'gd', id })) return; dkwUse(id, { x, y }); };   // 놓은 자리에 (펼친 다이어리 = 그 자리에서 손에 · 접혀 있으면 그 자리에 떠요)
            if (window.dkCarry) dkCarry(src, ev, done); else dkwUse(id);
        }
        window.dkwArtOf = id => dkwArt(id);
        /* 🗄️ 서랍 문구 : 위아래로 끌면 = 끌어내기 (옆으로 = 줄 넘기기 그대로) */
        document.addEventListener('pointerdown', ev => {
            const it = ev.target.closest && ev.target.closest('#dkwTray .dkw-it[data-id]');
            if (!it || ev.button > 0 || DKW.bin || it.getAttribute('aria-hidden')) return;
            const id = it.dataset.id, x0 = ev.clientX, y0 = ev.clientY; let on = true;
            const mv = e => {
                if (!on || e.pointerId !== ev.pointerId) return; const dx = e.clientX - x0, dy = e.clientY - y0;
                if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { on = false; off(); return; }   // 옆으로 = 넘기기
                if (Math.abs(dy) < 14) return;
                on = false; off(); const row = it.closest('.dkw-row'); if (row) row._drag = true;
                dkwManual(id, it.querySelector('.dkw-art') || it, e); if (row) setTimeout(() => { row._drag = false; }, 400);
            };
            const up = e => { if (e.pointerId !== ev.pointerId) return; on = false; off(); };
            const off = () => { removeEventListener('pointermove', mv, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true); };
            addEventListener('pointermove', mv, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
        }, true);
        function dkwTake(id, at) {                                                  // 문구 = 페이지에 (종류 표 hand = 바로 손에) · 종류별 꺼내는 법은 js/skins.js 그대로 (cabFlip)
            const g = cabGOf(id); if (!g) return;
            if (cabTool(id)) {                                                   // 🔪 칼 · 📏 자처럼 따로 그리는 도구 (GD_TOOL) : cabFlip 이 꺼내요 (칼은 손에)
                if (!cabIsOn(id)) cabFlip(id); else if (dkwMeta(g).hand) cabHoldAgain(id);
                dkwDeskSoon(); return;
            }
            if (!cabIsOn(id)) { if (!GD_MULTI.includes(g)) gdOnPage(g).forEach(cabFlip); cabFlip(id); gdMainSet(g, id); }   // 하나만 쓰는 종류는 바꿔 놓기 (집게처럼 여럿 = GD_MULTI)
            const el = gdEl(id); if (!el) return;
            gdHome(el);
            if (dkwMeta(g).hand || dkwDesk()) { const b = el.getBoundingClientRect(), p = at || { x: b.left + b.width / 2, y: b.top + b.height / 2 }; try { gdHold(id, p.x, p.y); if (at && typeof gdFollow === 'function') gdFollow(p.x, p.y); } catch (e) { console.warn('🪑 들기', e); } }   // 💻 📲 책상 = 늘 손에 (페이지에 놓아 두지 않아요 · 내려놓으면 공중 · 도련 11-12)
            el.classList.remove('need'); void el.offsetWidth; el.classList.add('need'); setTimeout(() => el.classList.remove('need'), 2600);
            dkwDeskSoon();
        }
        /* ---------- ↩ 꺼낸 문구 정리 (도련 11-03 · 11-05 : 버튼 없이 바로) ----------
           페이지에 꺼낸 문구(필기구 여럿 · 핀셋 · 가위 · 칼 · 자 · 집게 · 펀칭기 · 양면테이프)가 있으면 화면 아래 가운데에 그 문구 그림 줄이 바로 보여요
           그림 오른쪽 위 ✕ = 닫는다는 표시 · 그림(또는 ✕) 톡 = 그 문구만 집으로 (넣어 두었던 서랍 · 펜꽂이)
           그림을 끌어 다른 책상 소품(펜꽂이 · 서랍장)에 놓으면 = 그 소품이 새 집 (도련 11-05 · 꺼내서 옮겨 넣기 · js/desk.js dkGdPut)
           📎 종이에 꽂아 둔 집게는 꾸밈이라 빼요 · 앱을 다시 켜면 꺼낸 문구가 없어요 (저장하지 않아요) */
        const dkwOutAll = () => [...DKW.fl.keys()].concat(dkwPenOut()).concat(GD_CAB.flatMap(([g]) => dkwOwnOf([g])).filter(id => cabIsOn(id) && !(gdEl(id) && gdEl(id).classList.contains('edge'))));
        const dkwOutName = id => dkwIsPen(id) ? ((pkAll().find(x => x.id === id) || {}).name || '필기구') : dkwName(id);
        function dkwBackPaint() {                                                 // 화면 아래 가운데 고정 (css .dkw-strip · 다이어리를 따라다니지 않아요)
            const on = dkwDesk() && ((isCoverOpen && document.documentElement.classList.contains('desk-show')) || DKW.fl.size > 0);   // ✋ 떠 있는 문구가 있으면 다이어리가 접혀 있어도 (도련 11-11)
            const out = on ? dkwOutAll() : [], p = dkwq('dkwBackPn');
            if (!out.length) { if (p && !p.hidden) p.hidden = true; return; }
            if (!p || p.hidden || p.dataset.sig !== out.join(',')) dkwBackOpen();
        }
        function dkwBackOpen() {                                                  // 그림 줄 (글씨 없이 · 그림마다 ✕)
            let p = dkwq('dkwBackPn');
            const out = dkwOutAll(); if (!out.length) { if (p) p.hidden = true; return; }
            if (!p) { p = document.createElement('div'); p.id = 'dkwBackPn'; p.className = 'dkw-strip'; document.body.appendChild(p); p.addEventListener('pointerdown', e => e.stopPropagation()); }
            p.dataset.sig = out.join(',');
            p.innerHTML = out.map(id => `<button type="button" class="dkw-out" data-id="${htmlEsc(id)}" title="${htmlEsc(dkwOutName(id))} → ${htmlEsc(dkwPlaceName(dkwAt()[id]) || '봉투')}" aria-label="${htmlEsc(dkwOutName(id))} 제자리로">${dkGdIc({ k: 'gd', gid: id }) || '<i>✂️</i>'}<span class="dkw-x" aria-hidden="true">✕</span></button>`).join('');
            p.querySelectorAll('.dkw-out').forEach(c => c.addEventListener('pointerdown', e => dkwOutGrab(e, c)));   // 톡 = 집으로 (알림 글 없이) · 끌기 = 다른 소품에 옮겨 넣기
            p.hidden = false;
        }
        function dkwOutGrab(ev, c) {
            if (ev.button > 0) return; ev.preventDefault();
            const id = c.dataset.id, x0 = ev.clientX, y0 = ev.clientY; let gh = null, hi = null;
            const at = (x, y) => [...document.querySelectorAll('#deskStage .desk-item')].filter(el => dkSolidAt(el, x, y)).sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0] || null;   // 다이어리 뒤 소품도 그림 모양대로
            const mv = e => {
                if (e.pointerId !== ev.pointerId) return;
                if (!gh) { if (Math.hypot(e.clientX - x0, e.clientY - y0) < 8) return; gh = c.cloneNode(true); gh.className = 'dkw-out dkw-ghost'; document.body.appendChild(gh); c.classList.add('dkb-out'); }
                gh.style.left = e.clientX + 'px'; gh.style.top = e.clientY + 'px';
                const t = at(e.clientX, e.clientY); if (t !== hi) { if (hi) hi.classList.remove('dkh-hi'); hi = t; if (hi) hi.classList.add('dkh-hi'); }
            };
            const up = async e => {
                if (e.pointerId !== ev.pointerId) return; removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
                if (hi) hi.classList.remove('dkh-hi'); if (gh) gh.remove(); c.classList.remove('dkb-out');
                if (e.type === 'pointercancel') return;
                if (!gh) { dkwBackOne(id); setTimeout(dkwBackPaint, 0); return; }   // 톡 = 집으로
                if (dkwTrayInto(id, e.clientX, e.clientY)) return;                 // 🗄️ 열린 서랍(위 창 · 그 서랍장) = 바로 그 서랍에
                if (hi && window.dkGdPut && await dkGdPut(id, hi)) { dkwBackOne(id); setTimeout(dkwBackPaint, 0); }   // 새 집에 넣었어요 → 페이지에서 치워요
            };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
        }
        function dkwBackOne(id, quiet) {                                           // 그 문구만 제자리로 (페이지에서 치워요)
            if (dkwFloatOff(id, true)) { dkwDeskSoon(); return; }                  // ✋ 떠 있던 것
            if (dkwIsPen(id)) { if (window.pcReturn) pcReturn(id); }
            else {
                if (typeof gdHeld !== 'undefined' && gdHeld === id && window.gdLetGo) gdLetGo();
                if (id.startsWith('knife') && window.skLetGo) skLetGo();
                if (cabIsOn(id)) cabFlip(id);
            }
            dkwDeskSoon();
            if (!quiet && navigator.vibrate) try { navigator.vibrate(8); } catch (er) {}
        }
        setInterval(() => { try { dkwBackPaint(); } catch (er) {} }, 600);         // 꺼내고 치울 때 · 다이어리를 펴고 접을 때 (가벼워요)
        addEventListener('resize', () => { try { dkwBackPaint(); } catch (er) {} });
        window.dkwCupOpen = dkwCupOpen; window.dkwDeskPaint = dkwDeskPaint; window.dkwDeskSoon = () => dkwDeskSoon(); window.dkwTrayOpen = dkwTrayOpen; window.dkwClose = dkwClose; window.dkwUse = dkwUse; window.dkwOpenFor = dkwOpenFor; window.dkwAtPut = dkwAtPut; window.dkwHere = dkwHere; window.dkwCanCup = dkwCanCup; window.dkwNameOf = dkwOutName; window.dkwAtMove = (a, b) => { const m = dkwAt(); let ch = false; Object.keys(m).forEach(id => { if (m[id] === a) { m[id] = b; ch = true; } }); if (ch) { dkwAtSet(m); dkwDeskSoon(); } }; window.dkwOut = dkwOut; window.DKW_MAX = DKW_MAX;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskgd'] = true;
