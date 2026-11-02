/* 말랑달콤 다이어리 - js/deskgd.js
   🪑 책상 모드 문구 (도련 11-02 · 현실처럼 · 💻 PC · 📲 아이패드 = html.desk-on · 📱 폰은 예전 🗄️ 문구함 창 그대로)
   - ✏️ 책상 위 연필꽂이 소품 (기능 'pc') 톡 = 연필꽂이가 앞으로 다가와요 (dkwCupOpen)
       꽂힌 것 = 필기구(색연필 · 형광펜 · 지우개) + 📏 자 · 🔪 칼 · ✂️ 가위 · 🪡 핀셋 (24개까지)
       하나를 톡 = 쏙 뽑혀 손에 (다이어리를 펴고 · 표지면 열고) : 필기구 = 바로 그리기 · 가위 · 핀셋 = 손에 · 칼 = 손에 · 자 = 페이지에
       페이지에 꺼내 둔 도구는 연필꽂이에 안 보여요 (현실처럼)
       연필꽂이 그림 = 다꾸러가 놓은 그 소품 그림 그대로 : 앞벽 마스크 + 입구(상품공방에서 도련이 올림)가 있으면 도구가 그 안에 꽂힌 모습 · 없으면 앞벽 없이 (책상 위엔 그림만 · 다가오면 도구가 그림 앞에)
   - 🗄️ 서랍장 문구함 칸 (기능 'gd') 톡 = 그 서랍이 쭉 열려요 (dkwTrayOpen) : 칸막이 트레이에 가진 문구 전부
       필기구 · 자 · 칼 · 가위 · 핀셋 · 펀칭기 · 집게 · 양면테이프 (종류는 칸막이로만 나눠요)
       톡 = 꺼내 쓰기 · ♥ = 연필꽂이에 꽂기 / 빼기 (필기구 · 자 · 칼 · 가위 · 핀셋만 · 펀칭기 · 집게 · 양면테이프는 서랍에만)
       서랍 색 = 그 서랍장 그림의 그 칸 색 
   - 경우의 수
       연필꽂이 + 문구함 칸 = 위 그대로 · 연필꽂이만 = 연필꽂이의 '🗄️ 문구함' 버튼 → 서랍(기본 색) · 문구함 칸만 = ♥ 는 필기구만(그리기 연필꽂이)
       둘 다 없으면 = 예전처럼 (🛠 책상 꾸미기에서 이어요)
       문구를 봉투째 연필꽂이에 넣으면 = 그 연필꽂이를 내 연필꽂이로 (문구는 문구함에 · js/desk.js dkbHome)
       그리기 중 연필꽂이의 '보관함' = 이 서랍 · 🪡 핀셋 · ✂️ 가위가 필요할 때(gdNeed) = 이 서랍이 열리고 그 문구가 깜박
   - 저장 : 필기구 = 예전 그대로 'diary_pencase' (js/pencase.js · 폰 그리기 연필꽂이와 같은 목록) · 도구 = 'diary_cup_tools' [id] (게스트 'malang_cup_tools' · 없으면 가진 도구 모두) */

        const DKW_CUP_KEY = 'diary_cup_tools', DKW_CUP_L = 'malang_cup_tools', DKW_MAX = 24;
        /* 🧩 문구 종류 = js/skins.js GD_CAB (종류마다 하는 일 hand) · 🧁 상품마다 = 상품공방 (도련 11-02) : 🗄️ 서랍칸 (칸막이 이름) · ✏️ 연필꽂이 (yes / no · 필기구는 늘) · 꽂이길이 · 이름
             → 새 종류 · 새 상품이 생기면 서랍 칸막이 · 연필꽂이 · 꺼내 쓰기가 저절로 (이 파일은 그대로) */
        const dkwMeta = g => ((GD_CAB.find(x => x[0] === g) || [])[2]) || {};
        const dkwP = id => ((window.prodList ? prodList('문구') : []).find(x => x.id === id) || {}).P || {};   // 그 문구 상품 속성
        const DKW = { need: null, tint: new Map(), sayT: 0 };
        const dkwq = id => document.getElementById(id);
        const dkwDesk = () => document.documentElement.classList.contains('desk-on');
        const dkwWait = ms => new Promise(r => setTimeout(r, ms));
        const dkwPens = () => { const own = new Set(pkOwnIds()); return pkAll().filter(t => own.has(t.id)); };
        const dkwOwnOf = gs => gs.flatMap(g => cabOwn(g));
        const dkwIsPen = id => pkIsId(id);
        function dkwCupTools() { const v = prefGet(DKW_CUP_KEY, DKW_CUP_L), own = dkwOwnOf(GD_CAB.map(x => x[0])).filter(dkwCanCup); return Array.isArray(v) ? v.filter(id => own.includes(id)) : own.slice(0, Math.max(0, DKW_MAX - pkRead().length)); }   // 처음 = 가진 도구 모두
        const dkwCupToolN = () => dkwCupTools().length;
        const dkwInCup = id => dkwIsPen(id) ? pkRead().includes(id) : dkwCupTools().includes(id);
        const dkwCupN = () => pkRead().length + dkwCupToolN();
        const dkwCanCup = id => dkwIsPen(id) || dkwP(id).연필꽂이 === 'yes';       // 연필꽂이에 꽂을 수 있나요 : 필기구 = 늘 · 그 밖 = 상품 '연필꽂이'
        const dkwName = id => String(dkwP(id).이름 || '');                      // 상품 이름 그대로 (상품공방에서 정해요)
        const dkwArt = id => { if (dkwIsPen(id)) { const t = pkAll().find(x => x.id === id); return t ? pkSvg(t) : ''; } return cabArt(id); };
        const dkwCupU = () => (deskFnMap() || {}).pc || '';
        const dkwItemEl = u => u ? document.querySelector(`#deskStage .desk-item[data-u="${u}"]`) : null;
        function dkwGdHome() {                                                    // 🗄️ 문구함이 든 서랍장 칸 { u, e: 칸, el }
            const H = dkHomes();
            for (const u of Object.keys(H)) { const e = (H[u] || []).find(x => x.k === 'gd'); if (e) return { u, e, el: dkwItemEl(u) }; }
            return null;
        }
        function dkwToggle(id, at) {                                                  // ♥ 연필꽂이에 꽂기 ↔ 빼기
            const on = dkwInCup(id);
            if (!on && dkwCupN() >= DKW_MAX) { dkwSay(`✏️ 연필꽂이에는 ${DKW_MAX}개까지 꽂을 수 있어요`, at); return false; }
            if (dkwIsPen(id)) { const L = pkRead().filter(x => x !== id); if (!on) L.push(id); pkWrite(L); if (window.pcRefill) pcRefill(); }
            else { const L = dkwCupTools().filter(x => x !== id); if (!on) L.push(id); prefSet(DKW_CUP_KEY, DKW_CUP_L, L); }
            dkwDeskSoon(); return true;
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
            r.addEventListener('pointerdown', e => { if (e.target === r) dkwClose(); });
            document.body.appendChild(r); return r;
        }
        function dkwFly(box, el) {                                                // 책상 위 그 소품 자리에서 커지며 나와요
            if (!el) { box.animate([{ transform: 'scale(.85)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.2,.9,.3,1.1)' }); return; }
            const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); if (!b.width) return;
            const s = Math.max(.08, Math.min(a.width / b.width, a.height / b.height));
            const dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
            box.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.08)' });
        }
        function dkwClose() {
            ['dkwCup', 'dkwTray'].forEach(id => { const r = dkwq(id); if (r && !r.hidden) { r.classList.remove('show'); setTimeout(() => { r.hidden = true; }, 180); } });
            document.documentElement.classList.remove('dkw-on');
            dkwDeskSoon();
        }
        const dkwShown = () => ['dkwCup', 'dkwTray'].some(id => { const r = dkwq(id); return r && !r.hidden; });
        function dkwShow(r) { r.hidden = false; requestAnimationFrame(() => r.classList.add('show')); document.documentElement.classList.add('dkw-on'); }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && dkwShown() && !document.querySelector('.modal[style*="flex"]')) { e.stopPropagation(); dkwClose(); } }, true);

        /* ---------- ✏️ 연필꽂이 ---------- */
        /* 🧺 연필꽂이 앞벽 (도련 11-02 · 바구니처럼) = 상품공방에서 도련이 올린 '앞벽' 그림 + 입구 · 없으면 앞벽 없이 (자동으로 만들지 않아요) */
        function dkwFrontFor(el) {                                                // 이 연필꽂이 소품의 앞벽 · 입구 (상품 것) · 없으면 null
            const d = dkDef(el); return d.front && d.mouth ? { fm: new URL(d.front, location.href).href, mouth: d.mouth } : null;
        }
        const dkwPenOut = () => window.pcOutIds ? pcOutIds() : [];                // ✏️ 손에 든 · 페이지에 놓인 필기구 (js/draw.js)
        const dkwCupList = () => { const po = dkwPenOut(); return pkRead().filter(id => !po.includes(id)).concat(dkwCupTools().filter(id => !cabIsOn(id))); };   // 꽂혀 있는 것 (페이지에 꺼내 둔 것은 빼요)
        /* 연필꽂이 장면 = 그 소품 그림 + 꽂힌 도구 + 앞벽 (책상 위 작은 것 · 다가온 큰 것 모두 이것) */
        function dkwCupScene(host, src, F, W, H, fl, big, skip) {               // skip = 빼고 그릴 것 (✏️ 손에 든 · 내려놓은 필기구)
            const m = F.mouth, mo = fl ? [100 - m[1], 100 - m[0], m[2]] : m;      // ↔ 좌우 바꾼 소품 = 입구도 반대로
            const ids = dkwCupList().filter(id => !(skip && skip.includes(id))), n = ids.length, l = mo[0] / 100 * W, rr = mo[1] / 100 * W, top = mo[2] / 100 * H, base = top + (H - top) * .45;
            const sc = H / 330;                                                   // 다가온 연필꽂이 높이 330 기준
            const tools = ids.map((id, i) => {
                const f = n === 1 ? .5 : i / (n - 1), x = l + (rr - l) * (.1 + .8 * f), a = (f - .5) * Math.min(36, 6 + n * 2.6), pen = dkwIsPen(id);
                const h = Math.round(sc * 250 * +dkwP(id).꽂이길이 * (n > 14 ? .92 : 1)), y = base - h + (i % 3) * 7 * sc;
                return `<${big ? 'button type="button"' : 'i'} class="dkw-t${pen ? ' pen' : ' ' + cabGOf(id)}" data-id="${htmlEsc(id)}"${big ? ` title="${htmlEsc(dkwName(id))}"` : ''} style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;height:${h}px;--a:${a.toFixed(1)}deg;z-index:${i % 2 ? 2 : 1}">${dkwArt(id)}</${big ? 'button' : 'i'}>`;
            }).join('');
            host.innerHTML = `<img class="dkw-cupimg" src="${htmlEsc(src)}" alt=""${fl ? ' style="transform:scaleX(-1)"' : ''} draggable="false"><div class="dkw-tools">${tools}</div>`
                + (!F.fm ? '' : `<i class="dkw-cupfm"${fl ? ' style="transform:scaleX(-1)"' : ''}><i style="--fm:url('${htmlEsc(F.fm)}')"><img src="${htmlEsc(src)}" alt="" draggable="false"></i></i>`);
            if (big) { host.dataset.l = l.toFixed(1); host.dataset.r = rr.toFixed(1); host.querySelectorAll('.dkw-t').forEach(dkwPullWire); }   // ↔ 옆으로 밀 수 있는 곳 = 입구 안
        }
        /* 🪑 책상 위 연필꽂이에도 내가 꽂은 도구가 꽂혀 보여요 (바구니의 다이어리처럼 · 앞벽 뒤) */
        function dkwDeskPaint() {
            document.querySelectorAll('#deskStage .desk-item > .dkw-desk').forEach(x => { if (x.parentNode.dataset.u !== dkwCupU()) x.remove(); });
            const el = dkwItemEl(dkwCupU()); if (!el || !dkwDesk()) return;
            const img = el.querySelector(':scope > img'), F = img && dkwFrontFor(el); if (!F) return;   // 앞벽이 없으면 책상 위에는 그림 그대로
            let host = el.querySelector(':scope > .dkw-desk'); if (!host) { host = document.createElement('div'); host.className = 'dkw-desk'; el.appendChild(host); }
            dkwCupScene(host, img.src, F, el.offsetWidth || parseFloat(el.style.width), el.offsetHeight || parseFloat(el.style.height), el.classList.contains('dk-fl'), false);
        }
        let dkwDpT = 0; const dkwDeskSoon = () => { clearTimeout(dkwDpT); dkwDpT = setTimeout(() => { try { dkwDeskPaint(); } catch (e) { console.warn('✏️ 책상 연필꽂이', e); } }, 120); };
        new MutationObserver(dkwDeskSoon).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });   // 다이어리를 펴고 접을 때 (꺼낸 도구가 돌아오면)
        async function dkwCupOpen() {
            if (!dkwDesk()) return;
            const el = dkwItemEl(dkwCupU()); if (!el) return;
            const img = el.querySelector(':scope > img'), F = img && (dkwFrontFor(el) || { fm: '', mouth: [15, 85, 45] }), r = dkwRoom('dkwCup');   // 앞벽이 없으면 = 도구가 그림 앞에 (가리지 않아요)
            const n = dkwCupList().length, out = dkwCupTools().filter(cabIsOn).length, d = dkDef(el);
            const H = Math.min(380, Math.round(innerHeight * .5)), W = Math.round(H * (d.w || el.offsetWidth) / (d.h || el.offsetHeight));
            r.innerHTML = `<div class="dkw-cupbox">
                <p class="dkw-hint">${n ? '도구를 잡고 <b>위로 쏙</b> 끌어 올리면 손에 들어요 · <b>옆으로 밀면</b> 비켜나요' : '연필꽂이가 비었어요 · <b>🗄️ 문구함</b>에서 ♥ 를 눌러 꽂아요'}${out ? `<small>페이지에 꺼내 둔 도구 ${out}개</small>` : ''}</p>
                <div class="dkw-cupart" style="width:${W}px;height:${H}px"></div>
                <div class="dkw-btns"><button type="button" class="dkw-b" onclick="dkwTrayOpen()">🗄️ 문구함</button><button type="button" class="dkw-b dkw-x" onclick="dkwClose()">닫기</button></div></div>`;
            const host = r.querySelector('.dkw-cupart');
            if (F) dkwCupScene(host, img.src, F, W, H, el.classList.contains('dk-fl'), true);
            dkwShow(r);
            dkwFly(host, el);
        }
        /* ✋ 뽑기 = 잡고 위로 끌어 올려요 (도련 11-02 · 톡 = 안 뽑혀요 · 현실처럼) : 110px 넘게 올리면 쏙 · 덜 올리고 놓으면 제자리로
           ↔ 옆으로 밀면 비켜나요 (도련 11-03 · 예전 연필꽂이처럼) : 놓아도 민 자리 · 기울기 그대로 · 잡은 것이 맨 앞 → 뒤에 가린 것을 골라요 */
        const DKW_PULL = 110; let dkwZ = 10;
        function dkwPullWire(b) {
            let p = null;
            const place = up => { const k = 1 - Math.min(1, up / 90); b.style.transform = `translateX(-50%) translateY(${(-up).toFixed(1)}px) rotate(calc(var(--a) * ${k.toFixed(2)}))`; };
            b.addEventListener('pointerdown', e => {
                if (e.button > 0 || b.classList.contains('pull')) return;
                e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (er) {}
                const host = b.parentNode.parentNode;
                p = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, x0: parseFloat(b.style.left), a0: parseFloat(b.style.getPropertyValue('--a')) || 0, L: +host.dataset.l, R: +host.dataset.r };
                b.classList.add('grab'); b.style.zIndex = ++dkwZ;                    // 잡은 것이 맨 앞
            });
            b.addEventListener('pointermove', e => {
                if (!p || e.pointerId !== p.id) return;
                const up = Math.max(0, p.y - e.clientY), dx = e.clientX - p.x;
                if (up > 4 || Math.abs(dx) > 3) p.moved = true;
                const x = Math.max(p.L, Math.min(p.R, p.x0 + dx));                   // ↔ 입구 안에서만
                b.style.left = x.toFixed(1) + 'px'; b.style.setProperty('--a', Math.max(-24, Math.min(24, p.a0 + (x - p.x0) * .15)).toFixed(1) + 'deg');   // 민 쪽으로 기울어요
                place(up);
                if (up > DKW_PULL) {                                             // 쏙 뽑혔어요
                    p = null; b.classList.remove('grab'); b.style.transform = ''; b.classList.add('pull');
                    if (navigator.vibrate) try { navigator.vibrate(12); } catch (er) {}
                    setTimeout(() => dkwUse(b.dataset.id), 260);
                }
            });
            const end = e => {
                if (!p || e.pointerId !== p.id) return;
                const tap = !p.moved; p = null; b.classList.remove('grab'); b.style.transform = '';   // 덜 뽑았으면 쏙 내려가요 (민 자리는 그대로)
                if (tap) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); dkwSay('✋ 잡고 위로 쏙 끌어 올려요 · 옆으로 밀면 비켜나요', b); }
            };
            b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
        }

        /* ---------- 🗄️ 문구함 서랍 ---------- */
        async function dkwTrayOpen(need) {
            if (!dkwDesk()) return;
            DKW.need = typeof need === 'string' ? need : null;
            { const c = dkwq('dkwCup'); if (c && !c.hidden) { c.classList.remove('show'); c.hidden = true; } }   // ✏️ 연필꽂이에서 왔으면 연필꽂이는 내려놓고
            const home = dkwGdHome(), el = home && home.el, img = el && el.querySelector(':scope > img');
            let col = null;
            if (img) { const R = home.e.r || [0, 0, 100, 100], fl = el.classList.contains('dk-fl'), fx = (R[0] + (R[2] - R[0]) * .2) / 100; col = await dkwTint(img.src, fl ? 1 - fx : fx, ((R[1] + R[3]) / 2) / 100); }
            const c = dkwColors(col), r = dkwRoom('dkwTray');
            r.innerHTML = `<div class="dkw-drawer" style="--db:${c.body};--dl:${c.light};--dk:${c.line};--dm:${c.mid}">
                <div class="dkw-dtop"><b>🗄️ 문구함</b><small>${home && el ? htmlEsc(dkName(DK.items.find(x => x.u === home.u)) + ' · ' + dkSlotNm(home.e.s, (dkSlots(DK.items.find(x => x.u === home.u).id) || []).length) + ' 칸') : '책상 서랍장 칸에 넣으면 그 서랍에서 열려요'}</small><span class="dkw-cnt" id="dkwCnt"></span><button type="button" class="dkw-bin" id="dkwBin" aria-pressed="false" title="버리기">🗑</button><button type="button" class="dkw-dx" aria-label="닫기" onclick="dkwClose()">✕</button></div>
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
            const cup = !!dkwItemEl(dkwCupU());
            const secs = [], at = {};                                          // 칸막이 = 상품 '서랍칸' (같은 이름끼리 · 필기구 먼저 · 그다음 종류 표 순서)
            dkwPens().map(t => t.id).concat(GD_CAB.flatMap(([g]) => cabOwn(g))).forEach(id => { const sn = String(dkwP(id).서랍칸 || ''); if (!sn) return; if (at[sn] == null) { at[sn] = secs.length; secs.push([dkwIsPen(id) ? 'pen' : 's' + secs.length, sn, []]); } secs[at[sn]][2].push(id); });   // 필기구 칸 = 넓게 (css .dkw-pen)
            for (let i = secs.length - 1; i >= 0; i--) if (!secs[i][2].length) secs.splice(i, 1);
            const card = (id, copy) => {
                const can = dkwCanCup(id) && (cup || dkwIsPen(id)), on = can && dkwInCup(id), pg = !dkwIsPen(id) && cabIsOn(id), need = DKW.need && cabGOf(id) === DKW.need;
                return `<div class="dkw-it${on ? ' in' : ''}${need ? ' need' : ''}" data-id="${htmlEsc(id)}"${copy ? ' aria-hidden="true"' : ''}><button type="button" class="dkw-use" title="꺼내 쓰기"${copy ? ' tabindex="-1"' : ''}><span class="dkw-art">${dkwArt(id)}</span><b>${htmlEsc(dkwName(id))}</b>${pg ? '<em>페이지에</em>' : ''}</button>${can ? `<button type="button" class="dkw-heart${on ? ' on' : ''}" aria-label="연필꽂이에 꽂기" title="${on ? '연필꽂이에서 빼기' : '연필꽂이에 꽂기'}"${copy ? ' tabindex="-1"' : ''}>♥</button>` : ''}</div>`;
            };
            inn.innerHTML = secs.length ? secs.map(([k, nm, ids]) => `<div class="dkw-sec dkw-${k}"><h4>${htmlEsc(nm)}<small>${ids.length}개</small></h4><div class="dkw-rowbox"><div class="dkw-row" data-k="${htmlEsc(nm)}"><div class="dkw-its">${ids.map(id => card(id)).join('')}</div></div>`
                + `<button type="button" class="dkw-go l" aria-label="앞으로" hidden>‹</button><button type="button" class="dkw-go r" aria-label="뒤로" hidden>›</button></div></div>`).join('') : '<div class="dkw-none">아직 문구가 없어요</div>';
            inn.querySelectorAll('.dkw-row').forEach(r => dkwRowWire(r, keep[r.dataset.k] || 0, card));
            inn.scrollTop = top;
            inn.onclick = e => {                                                   // 톡 = 꺼내 쓰기 · ♥ = 꽂기 / 빼기 (이어 붙인 것도 같아요)
                const it = e.target.closest('.dkw-it'); if (!it) return; const row = it.closest('.dkw-row'); if (row && row._drag) return;   // 끌어서 넘긴 건 톡이 아니에요
                const id = it.dataset.id;
                if (DKW.bin) { gdBin(id).then(ok => { if (ok) dkwTrayPaint(); }); return; }   // 🗑 버리는 중 = 톡 = 휴지통으로
                if (e.target.closest('.dkw-heart')) { if (dkwToggle(id, it)) { dkwSay(dkwInCup(id) ? `♥ ${dkwName(id)} → 연필꽂이에 꽂았어요` : `${dkwName(id)} → 서랍에 넣었어요`, it); dkwTrayPaint(); } return; }
                if (e.target.closest('.dkw-use')) dkwUse(id);
            };
            const more = () => { const d = dkwq('dkwIn'), m = dkwq('dkwMore'); if (!d) return; const on = d.scrollHeight - d.scrollTop - d.clientHeight > 12; if (m) m.hidden = !on; };   // ⬇ 아래에 더 있어요 (칸막이 종류가 아주 많을 때만)
            inn.onscroll = more; requestAnimationFrame(more);
            const n = dkwq('dkwCnt'); if (n) n.innerHTML = `✏️ 연필꽂이 <b>${dkwCupN()}</b> / ${DKW_MAX}`;
            { const t = inn.closest('.dkw-drawer'), bb = dkwq('dkwBin'); if (t) t.classList.toggle('binning', !!DKW.bin); if (bb) { bb.classList.toggle('on', !!DKW.bin); bb.setAttribute('aria-pressed', !!DKW.bin); bb.textContent = DKW.bin ? '✓ 다 했어요' : '🗑'; } }
            if (DKW.bin) { const tip = dkwq('dkwTip'); if (tip) tip.innerHTML = '🗑 <b>버릴 문구를 톡</b> · 휴지통에 30일 보관했다가 지워져요 (⚙ 설정 → 🗑 휴지통에서 되살리기)'; return; }
            const tip = dkwq('dkwTip'); if (tip) tip.innerHTML = (cup ? '톡 = 꺼내 쓰기 · <b>♥</b> = 연필꽂이에 꽂기 / 빼기' : '톡 = 꺼내 쓰기 · <b>♥</b> = 그리기 연필꽂이 · 책상에 연필꽂이를 놓으면 도구도 꽂아 둬요') + ' · 옆으로 밀면 더 있어요';
        }
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
        async function dkwUse(id) {
            dkwClose();
            if (dkwIsPen(id) && !pkRead().includes(id)) {                           // 서랍에서 꺼낸 필기구 = 그리기 연필꽂이에도 꽂아요 (그리기는 연필꽂이에서)
                if (dkwCupN() >= DKW_MAX) { if (window.showMsg) showMsg(`✏️ 연필꽂이가 꽉 찼어요 (${DKW_MAX}개).<br><span style="font-size:12px;color:#777;">문구함에서 ♥ 를 눌러 하나 빼 주세요</span>`); return; }
                dkwToggle(id);
            }
            if (!await dkwReady()) return;
            if (dkwIsPen(id)) { if (window.drawWith && !drawWith(id) && window.openDraw) openDraw(); return; }
            dkwTake(id);
        }
        function dkwTake(id) {                                                    // 문구 = 페이지에 (종류 표 hand = 바로 손에) · 종류별 꺼내는 법은 js/skins.js 그대로 (cabFlip)
            const g = cabGOf(id); if (!g) return;
            if (cabTool(id)) {                                                   // 🔪 칼 · 📏 자처럼 따로 그리는 도구 (GD_TOOL) : cabFlip 이 꺼내요 (칼은 손에)
                if (!cabIsOn(id)) cabFlip(id); else if (dkwMeta(g).hand) cabHoldAgain(id);
                dkwDeskSoon(); return;
            }
            if (!cabIsOn(id)) { if (!GD_MULTI.includes(g)) gdOnPage(g).forEach(cabFlip); cabFlip(id); gdMainSet(g, id); }   // 하나만 쓰는 종류는 바꿔 놓기 (집게처럼 여럿 = GD_MULTI)
            const el = gdEl(id); if (!el) return;
            gdHome(el);
            if (dkwMeta(g).hand) { const b = el.getBoundingClientRect(); try { gdHold(id, b.left + b.width / 2, b.top + b.height / 2); } catch (e) { console.warn('🪑 들기', e); } }
            el.classList.remove('need'); void el.offsetWidth; el.classList.add('need'); setTimeout(() => el.classList.remove('need'), 2600);
            dkwDeskSoon();
        }
        /* ---------- ↩ 꺼낸 문구 정리 (도련 11-03 · 💻 📲 책상 · 현실처럼 : 마음대로 꺼내고 골라서 치워요) ----------
           페이지에 꺼낸 문구(필기구 여럿 · 핀셋 · 가위 · 칼 · 자 · 집게 · 펀칭기 · 양면테이프)가 있으면 다이어리 아래 책상 위에 '↩ 꺼낸 문구 정리' 버튼
           버튼 톡 = 봉투 속처럼 아래에 카드 줄 → 카드 톡 = 그 문구만 제자리로 (연필꽂이 ♥ = 연필꽂이 · 나머지 = 문구함 서랍) · '모두 정리'
           📎 종이에 꽂아 둔 집게는 꾸밈이라 빼요 · 앱을 다시 켜면 꺼낸 문구가 없어요 (저장하지 않아요) */
        const dkwOutAll = () => dkwPenOut().concat(GD_CAB.flatMap(([g]) => dkwOwnOf([g])).filter(id => cabIsOn(id) && !(gdEl(id) && gdEl(id).classList.contains('edge'))));
        const dkwHomeOf = id => dkwIsPen(id) || (dkwCanCup(id) && dkwCupTools().includes(id)) ? (dkwItemEl(dkwCupU()) ? 'cup' : 'tray') : 'tray';
        const dkwOutName = id => dkwIsPen(id) ? ((pkAll().find(x => x.id === id) || {}).name || '필기구') : dkwName(id);
        /* 자리 = 페이지(글 쓰는 종이)를 절대 가리지 않아요 (도련 11-03) : 다이어리 아래 → 모자라면 다이어리 옆 (세로로) */
        function dkwBackSpot(el, w, h) {
            const pg = dkwq('canvasArea'), cv = document.querySelector('#innerPage > .dy-cov') || dkwq('innerPage'); if (!pg || !cv) return;
            const P = pg.getBoundingClientRect(), B = cv.getBoundingClientRect(), vv = window.visualViewport, vb = vv ? vv.offsetTop + vv.height : innerHeight;
            const below = vb - P.bottom - 8;                                     // 종이 아래 (표지 테두리 · 책상)
            el.classList.toggle('side', below < h); el.style.transform = ''; el.style.transformOrigin = '';
            if (below >= h) {                                                    // 아래 : 표지 밖에 자리가 있으면 책상 위 가운데 · 없으면 표지 테두리 위
                const top = vb - B.bottom - 8 >= h ? B.bottom + (vb - B.bottom - h) / 2 : P.bottom + 4 + (below - h) / 2;
                el.style.left = Math.round(Math.max(6, Math.min(innerWidth - w - 6, B.left + B.width / 2 - w / 2))) + 'px'; el.style.top = Math.round(top) + 'px';
            } else {                                                             // 옆 : 넓은 쪽 (표지 바깥 책상 위 · 모자라면 표지 테두리 위)
                const L = P.left - 6, R = innerWidth - P.right - 6, right = R >= L, room = right ? R : L, out = right ? innerWidth - B.right : B.left;
                const k = Math.min(1, Math.max(.5, (room - 2) / w)), W = w * k, H = h * k;   // 자리가 좁으면 작게 (종이는 안 가려요)
                const x = right ? (out >= W + 12 ? B.right + (out - W) / 2 : P.right + 3) : (out >= W + 12 ? (out - W) / 2 : P.left - 3 - W);
                if (k < 1) { el.style.transformOrigin = '0 0'; el.style.transform = `scale(${k.toFixed(3)})`; }
                el.style.left = Math.round(x) + 'px';
                el.style.top = Math.round(Math.max(8, Math.min(vb - H - 8, P.bottom - H))) + 'px';
            }
        }
        function dkwBackPaint() {                                                 // 버튼 (다이어리 아래 책상 위 · 종이를 가리지 않게)
            let b = dkwq('dkwBackBtn');
            const on = dkwDesk() && typeof isCoverOpen !== 'undefined' && isCoverOpen && document.documentElement.classList.contains('desk-show');
            const out = on ? dkwOutAll() : [], p = dkwq('dkwBackPn');
            if (!out.length) { if (b) b.hidden = true; if (p && !p.hidden) p.hidden = true; return; }
            if (!b) { b = document.createElement('button'); b.type = 'button'; b.id = 'dkwBackBtn'; b.className = 'dkw-backbtn'; b.onclick = () => dkwBackOpen(); document.body.appendChild(b); }
            const t = `<i>↩</i><span>꺼낸 문구 정리</span><b>${out.length}</b>`; if (b.innerHTML !== t) b.innerHTML = t;
            b.title = '꺼낸 문구를 연필꽂이 · 문구함에 다시 넣어요';
            if (p && !p.hidden) { b.hidden = true; if (p.dataset.sig !== out.join(',')) dkwBackOpen(true); else dkwBackSpot(p, p.offsetWidth, p.offsetHeight); return; }   // offsetWidth = 줄이기 전 크기   // 목록이 열리면 그 자리에 목록만
            b.hidden = false; b.classList.remove('side');
            dkwBackSpot(b, b.offsetWidth, b.offsetHeight);
        }
        function dkwBackOpen(keep) {                                              // 버튼 자리에 작은 목록 줄 (그림만 · 글씨 없이 · 도련 11-03)
            let p = dkwq('dkwBackPn');
            const out = dkwOutAll(); if (!out.length) { if (p) p.hidden = true; return; }
            if (!p) { p = document.createElement('div'); p.id = 'dkwBackPn'; p.className = 'dkw-strip'; document.body.appendChild(p); p.addEventListener('pointerdown', e => e.stopPropagation()); }
            p.dataset.sig = out.join(',');
            p.innerHTML = out.map(id => `<button type="button" class="dkw-out" data-id="${htmlEsc(id)}" title="${htmlEsc(dkwOutName(id))} → ${dkwHomeOf(id) === 'cup' ? '연필꽂이' : '문구함'}">${dkGdIc({ k: 'gd', gid: id }) || '<i>✂️</i>'}</button>`).join('')
                + `<button type="button" class="dkw-all" title="모두 제자리로" aria-label="모두 제자리로">↩</button><button type="button" class="dkw-sx" aria-label="닫기">✕</button>`;
            p.querySelector('.dkw-sx').onclick = () => { p.hidden = true; dkwBackPaint(); };
            p.querySelector('.dkw-all').onclick = () => { const at = p.getBoundingClientRect(); dkwOutAll().forEach(id => dkwBackOne(id, true)); p.hidden = true; dkwSay('↩ 꺼낸 문구를 모두 제자리에 두었어요', { getBoundingClientRect: () => at }); dkwBackPaint(); };
            p.querySelectorAll('.dkw-out').forEach(c => c.onclick = () => { const id = c.dataset.id, h = dkwHomeOf(id), at = c.getBoundingClientRect(); dkwBackOne(id); dkwSay(h === 'cup' ? `✏️ ${dkwOutName(id)} → 연필꽂이` : `🗄️ ${dkwOutName(id)} → 문구함 서랍`, { getBoundingClientRect: () => at }); setTimeout(() => { if (dkwOutAll().length) dkwBackOpen(true); dkwBackPaint(); }, 0); });
            p.hidden = false; p.classList.remove('side'); p.style.transform = '';
            const bt = dkwq('dkwBackBtn'); if (bt) bt.hidden = true;
            dkwBackSpot(p, p.offsetWidth, p.offsetHeight);
            if (p.classList.contains('side')) dkwBackSpot(p, p.offsetWidth, p.offsetHeight);   // 세로로 바뀐 크기로 한 번 더
        }
        function dkwBackOne(id, quiet) {                                           // 그 문구만 제자리로 (페이지에서 치워요)
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
        window.dkwCupOpen = dkwCupOpen; window.dkwDeskPaint = dkwDeskPaint; window.dkwDeskSoon = () => dkwDeskSoon(); window.dkwTrayOpen = dkwTrayOpen; window.dkwClose = dkwClose; window.dkwCupToolN = dkwCupToolN; window.dkwUse = dkwUse;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskgd'] = true;
