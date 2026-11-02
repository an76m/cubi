/* 말랑달콤 다이어리 - js/deskgd.js
   🪑 책상 모드 문구 (도련 11-02 · 현실처럼 · 💻 PC · 📲 아이패드 = html.desk-on · 📱 폰은 예전 🗄️ 문구함 창 그대로)
   - ✏️ 책상 위 연필꽂이 소품 (기능 'pc') 톡 = 연필꽂이가 앞으로 다가와요 (dkwCupOpen)
       꽂힌 것 = 필기구(색연필 · 형광펜 · 지우개) + 📏 자 · 🔪 칼 · ✂️ 가위 · 🪡 핀셋 (24개까지)
       하나를 톡 = 쏙 뽑혀 손에 (다이어리를 펴고 · 표지면 열고) : 필기구 = 바로 그리기 · 가위 · 핀셋 = 손에 · 칼 = 손에 · 자 = 페이지에
       페이지에 꺼내 둔 도구는 연필꽂이에 안 보여요 (현실처럼)
       연필꽂이 그림 = 다꾸러가 놓은 그 소품 그림 그대로 : 앞벽 마스크 + 입구(상품공방)가 있으면 도구가 그 안에 꽂힌 모습 · 없으면 그 소품 색으로 그린 컵
   - 🗄️ 서랍장 문구함 칸 (기능 'gd') 톡 = 그 서랍이 쭉 열려요 (dkwTrayOpen) : 칸막이 트레이에 가진 문구 전부
       필기구 · 자 · 칼 · 가위 · 핀셋 · 펀칭기 · 집게 · 양면테이프 (종류는 칸막이로만 나눠요)
       톡 = 꺼내 쓰기 · ♥ = 연필꽂이에 꽂기 / 빼기 (필기구 · 자 · 칼 · 가위 · 핀셋만 · 펀칭기 · 집게 · 양면테이프는 서랍에만)
       서랍 색 = 그 서랍장 그림의 그 칸 색 · 🏪 더 받기 · 🧰 정리하기(버리기 · 예전 문구함 창)
   - 경우의 수
       연필꽂이 + 문구함 칸 = 위 그대로 · 연필꽂이만 = 연필꽂이의 '🗄️ 문구함' 버튼 → 서랍(기본 색) · 문구함 칸만 = ♥ 는 필기구만(그리기 연필꽂이)
       둘 다 없으면 = 예전처럼 (🛠 책상 꾸미기에서 이어요) · 예전에 연필꽂이 소품에 이은 '문구함' = 이제 '연필꽂이' (js/desk.js deskFnMap)
       문구를 봉투째 연필꽂이에 넣으면 = 그 연필꽂이를 내 연필꽂이로 (문구는 문구함에 · js/desk.js dkbHome)
       그리기 중 연필꽂이의 '보관함' = 이 서랍 · 🪡 핀셋 · ✂️ 가위가 필요할 때(gdNeed) = 이 서랍이 열리고 그 문구가 깜박
   - 저장 : 필기구 = 예전 그대로 'diary_pencase' (js/pencase.js · 폰 그리기 연필꽂이와 같은 목록) · 도구 = 'diary_cup_tools' [id] (게스트 'malang_cup_tools' · 없으면 가진 도구 모두) */

        const DKW_CUP_KEY = 'diary_cup_tools', DKW_CUP_L = 'malang_cup_tools', DKW_MAX = 24;
        /* 🧩 문구 종류는 이 파일에 적지 않아요 (앞으로 계속 늘어요) : 모두 js/skins.js GD_CAB 한 표 (cup · hand · sec · len) · 필기구 = js/pencase.js PK_KINDS
             → 새 종류가 생기면 서랍 칸막이 · 연필꽂이 · 꺼내 쓰기가 저절로 (이 파일은 그대로) */
        const dkwMeta = g => ((GD_CAB.find(x => x[0] === g) || [])[2]) || {};
        const dkwKindName = g => (GD_CAB.find(x => x[0] === g) || [])[1] || '';
        const dkwCupKinds = () => GD_CAB.filter(x => (x[2] || {}).cup).map(x => x[0]);   // 연필꽂이에 꽂을 수 있는 종류
        const DKW_PEN_SEC = '필기구';                                            // 필기구 칸막이 (늘 맨 앞 · 색연필 · 형광펜 · 지우개 … PK_KINDS 가 늘면 저절로)
        const DKW = { need: null, tint: new Map(), sayT: 0 };
        const dkwq = id => document.getElementById(id);
        const dkwDesk = () => document.documentElement.classList.contains('desk-on');
        const dkwWait = ms => new Promise(r => setTimeout(r, ms));
        const dkwPens = () => { const own = new Set(pkOwnIds()); return pkAll().filter(t => own.has(t.id)); };
        const dkwOwnOf = gs => gs.flatMap(g => cabOwn(g));
        const dkwIsPen = id => pkIsId(id);
        function dkwCupTools() { const v = prefGet(DKW_CUP_KEY, DKW_CUP_L), own = dkwOwnOf(dkwCupKinds()).filter(dkwCanCup); return Array.isArray(v) ? v.filter(id => own.includes(id)) : own.slice(0, Math.max(0, DKW_MAX - pkRead().length)); }   // 처음 = 가진 도구 모두
        const dkwCupToolN = () => dkwCupTools().length;
        const dkwInCup = id => dkwIsPen(id) ? pkRead().includes(id) : dkwCupTools().includes(id);
        const dkwCupN = () => pkRead().length + dkwCupToolN();
        function dkwCanCup(id) {                                                  // 연필꽂이에 꽂을 수 있나요 : 필기구 = 늘 · 그 밖 = 상품 속성 '연필꽂이'(예 / 아니오)가 먼저 · 없으면 종류 표(cup)
            if (dkwIsPen(id)) return true;
            const p = !cabTool(id) && window.prodList ? prodList('문구').find(x => x.id === id) : null, v = p && p.P.연필꽂이;
            if (v === true || v === '예') return true; if (v === false || v === '아니오') return false;
            return !!dkwMeta(cabGOf(id)).cup;
        }
        function dkwName(id) {                                                   // 상품 이름 (없으면 종류 이름 · 색 이름만 있으면 종류를 붙여요 : 검정 → 검정 집게)
            const kn = dkwIsPen(id) ? pkName(pkAll().find(t => t.id === id) || {}) : dkwKindName(cabGOf(id));
            const p = !cabTool(id) && window.prodList ? prodList('문구').find(x => x.id === id) : null;
            let n = String((p && p.P.이름) || (dkwIsPen(id) ? '' : cabName(id)) || '').replace(/^기본\s*/, '').trim();
            if (!n) return kn;
            return kn && !n.includes(kn) && !n.includes(kn.slice(0, 2)) && n.length <= 4 ? `${n} ${kn}` : n;
        }
        const dkwArt = id => { if (dkwIsPen(id)) { const t = pkAll().find(x => x.id === id); return t ? pkSvg(t) : ''; } return cabArt(id); };
        const dkwCupU = () => (deskFnMap() || {}).pc || '';
        const dkwItemEl = u => u ? document.querySelector(`#deskStage .desk-item[data-u="${u}"]`) : null;
        function dkwGdHome() {                                                    // 🗄️ 문구함이 든 서랍장 칸 { u, e: 칸, el }
            const H = dkHomes();
            for (const u of Object.keys(H)) { const e = (H[u] || []).find(x => x.k === 'gd'); if (e) return { u, e, el: dkwItemEl(u) }; }
            return null;
        }
        function dkwToggle(id) {                                                  // ♥ 연필꽂이에 꽂기 ↔ 빼기
            const on = dkwInCup(id);
            if (!on && dkwCupN() >= DKW_MAX) { dkwSay(`✏️ 연필꽂이에는 ${DKW_MAX}개까지 꽂을 수 있어요`); return false; }
            if (dkwIsPen(id)) { const L = pkRead().filter(x => x !== id); if (!on) L.push(id); pkWrite(L); if (window.pcRefill) pcRefill(); }
            else { const L = dkwCupTools().filter(x => x !== id); if (!on) L.push(id); prefSet(DKW_CUP_KEY, DKW_CUP_L, L); }
            return true;
        }
        function dkwSay(t) {                                                      // 열린 창 위 작은 말풍선
            let b = dkwq('dkwSay'); if (!b) { b = document.createElement('div'); b.id = 'dkwSay'; b.className = 'dkw-say'; document.body.appendChild(b); }
            b.textContent = t; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
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
        }
        const dkwShown = () => ['dkwCup', 'dkwTray'].some(id => { const r = dkwq(id); return r && !r.hidden; });
        function dkwShow(r) { r.hidden = false; requestAnimationFrame(() => r.classList.add('show')); document.documentElement.classList.add('dkw-on'); }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && dkwShown() && !document.querySelector('.modal[style*="flex"]')) { e.stopPropagation(); dkwClose(); } }, true);

        /* ---------- ✏️ 연필꽂이 ---------- */
        async function dkwCupOpen() {
            if (!dkwDesk()) return;
            const u = dkwCupU(), el = dkwItemEl(u), d = el ? dkDef(el) : {}, img = el && el.querySelector(':scope > img');
            const src = img ? img.src : '', box = !!(d.front && d.mouth && src);   // 앞벽 + 입구 = 그 그림 안에 꽂아요
            const r = dkwRoom('dkwCup');
            const tools = pkRead().map(id => ({ id })).concat(dkwCupTools().filter(id => !cabIsOn(id)).map(id => ({ id })));   // 페이지에 꺼내 둔 도구는 연필꽂이에 없어요
            const out = dkwCupTools().filter(cabIsOn).length;
            const col = dkwColors(src ? await dkwTint(src, .5, .78) : null);
            const H = 330, W = box ? Math.round(H * (d.w || 100) / (d.h || 148)) : 250;
            const art = box
                ? `<div class="dkw-cupart" style="width:${W}px;height:${H}px"><img class="dkw-cupimg" src="${htmlEsc(src)}" alt=""${el && el.classList.contains('dk-fl') ? ' style="transform:scaleX(-1)"' : ''}><div class="dkw-tools" id="dkwTools"></div><i class="dkw-cupfm" style="--fm:url('${htmlEsc(new URL(d.front, location.href).href)}')"><img src="${htmlEsc(src)}" alt=""></i></div>`
                : `<div class="dkw-cupart dkw-plain" style="width:${W}px;height:${H}px;--cb:${col.body};--cl:${col.line};--cm:${col.mid}"><i class="dkw-cupback"></i><div class="dkw-tools" id="dkwTools"></div><i class="dkw-cupfront"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 74c-9-6-10-13-5-15 2.4-.9 4.2.4 5 1.7.8-1.3 2.6-2.6 5-1.7 5 2 4 9-5 15z" fill="#fff" opacity=".85"/></svg></i></div>`;
            r.innerHTML = `<div class="dkw-cupbox">
                <p class="dkw-hint">${tools.length ? '도구를 <b>톡</b> = 쏙 뽑아 손에 들어요' : '연필꽂이가 비었어요 · <b>🗄️ 문구함</b>에서 ♥ 를 눌러 꽂아요'}${out ? `<small>페이지에 꺼내 둔 도구 ${out}개</small>` : ''}</p>
                ${art}
                <div class="dkw-btns"><button type="button" class="dkw-b" onclick="dkwTrayOpen()">🗄️ 문구함</button><button type="button" class="dkw-b dkw-x" onclick="dkwClose()">닫기</button></div></div>`;
            dkwShow(r);
            dkwCupFill(tools, box ? d.mouth : null, W, H);
            dkwFly(r.querySelector('.dkw-cupart'), el);
        }
        function dkwCupFill(tools, mouth, W, H) {                                 // 부채꼴로 꽂아요 (가운데가 높게)
            const box = dkwq('dkwTools'); if (!box) return;
            const n = tools.length, l = mouth ? mouth[0] / 100 * W : W * .16, rr = mouth ? mouth[1] / 100 * W : W * .84, base = mouth ? Math.min(H * .92, (mouth[2] / 100 + .22) * H) : H * .62;
            box.innerHTML = tools.map((t, i) => {
                const f = n === 1 ? .5 : i / (n - 1), x = l + (rr - l) * (.12 + .76 * f), a = (f - .5) * Math.min(40, 8 + n * 3), pen = dkwIsPen(t.id);
                const h = Math.round(235 * (pen ? 1 : +dkwMeta(cabGOf(t.id)).len || 1) * (n > 14 ? .9 : 1));   // 꽂힌 길이 = 종류 표 len
                return `<button type="button" class="dkw-t${pen ? ' pen' : ' ' + cabGOf(t.id)}" data-id="${htmlEsc(t.id)}" title="${htmlEsc(dkwName(t.id))}" style="left:${x.toFixed(1)}px;top:${(base - h + 40 + (i % 3) * 10).toFixed(1)}px;height:${h}px;--a:${a.toFixed(1)}deg;z-index:${i % 2 ? 2 : 1}">${dkwArt(t.id)}</button>`;
            }).join('');
            box.querySelectorAll('.dkw-t').forEach(b => b.onclick = () => {
                if (b.classList.contains('pull')) return;
                b.classList.add('pull'); setTimeout(() => dkwUse(b.dataset.id), 330);
            });
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
                <div class="dkw-dtop"><b>🗄️ 문구함</b><small>${home && el ? htmlEsc(dkName(DK.items.find(x => x.u === home.u)) + ' · ' + dkSlotNm(home.e.s, (dkSlots(DK.items.find(x => x.u === home.u).id) || []).length) + ' 칸') : '책상 서랍장 칸에 넣으면 그 서랍에서 열려요'}</small><span class="dkw-cnt" id="dkwCnt"></span><button type="button" class="dkw-dx" aria-label="닫기" onclick="dkwClose()">✕</button></div>
                <div class="dkw-din" id="dkwIn"></div>
                <div class="dkw-dfront"><span class="dkw-lbl">✏️ 문구함</span><i class="dkw-knob"></i></div>
                <div class="dkw-foot"><span id="dkwTip"></span><button type="button" class="dkw-b" onclick="dkwClose(); gdCabShop()">🏪 더 받기</button><button type="button" class="dkw-b" onclick="dkwClose(); openGdCab()" title="버리기 · 주로 쓰는 것">🧰 정리하기</button></div></div>`;
            dkwTrayPaint();
            dkwShow(r);
            dkwFly(r.querySelector('.dkw-drawer'), el);
        }
        function dkwTrayPaint() {
            const inn = dkwq('dkwIn'); if (!inn) return;
            const cup = !!dkwItemEl(dkwCupU());
            const secs = [['pen', DKW_PEN_SEC, dkwPens().map(t => t.id)]], at = {};   // 칸막이 = 종류 표의 sec (같은 이름끼리 · 표 순서) · 없으면 종류 이름
            GD_CAB.forEach(([g, nm, m]) => { const ids = cabOwn(g); if (!ids.length) return; const sn = (m && m.sec) || nm; if (at[sn] == null) { at[sn] = secs.length; secs.push(['s' + secs.length, sn, []]); } secs[at[sn]][2].push(...ids); });
            secs.forEach(x => { x[3] = x[2].length > 6; });                        // 많으면 한 줄 전체 (가로로 넓게)
            for (let i = secs.length - 1; i >= 0; i--) if (!secs[i][2].length) secs.splice(i, 1);
            inn.innerHTML = secs.length ? secs.map(([k, nm, ids, wide]) => `<div class="dkw-sec dkw-${k}${wide ? ' wide' : ''}"><h4>${nm}<small>${ids.length}개</small></h4><div class="dkw-its">${ids.map(id => {
                const can = dkwCanCup(id) && (cup || dkwIsPen(id)), on = can && dkwInCup(id), pg = !dkwIsPen(id) && cabIsOn(id), need = DKW.need && cabGOf(id) === DKW.need;
                return `<div class="dkw-it${on ? ' in' : ''}${need ? ' need' : ''}" data-id="${htmlEsc(id)}"><button type="button" class="dkw-use" title="꺼내 쓰기"><span class="dkw-art">${dkwArt(id)}</span><b>${htmlEsc(dkwName(id))}</b>${pg ? '<em>페이지에</em>' : ''}</button>${can ? `<button type="button" class="dkw-heart${on ? ' on' : ''}" aria-label="연필꽂이에 꽂기" title="${on ? '연필꽂이에서 빼기' : '연필꽂이에 꽂기'}">♥</button>` : ''}</div>`;
            }).join('')}</div></div>`).join('') : '<div class="dkw-none">아직 문구가 없어요<br><button type="button" class="dkw-b" onclick="dkwClose(); gdCabShop()">🏪 기본상품 샵에서 받아 오기</button></div>';
            inn.querySelectorAll('.dkw-it').forEach(it => {
                const id = it.dataset.id;
                it.querySelector('.dkw-use').onclick = () => dkwUse(id);
                const h = it.querySelector('.dkw-heart'); if (h) h.onclick = () => { if (dkwToggle(id)) { dkwSay(dkwInCup(id) ? `♥ ${dkwName(id)} → 연필꽂이에 꽂았어요` : `${dkwName(id)} → 서랍에 넣었어요`); dkwTrayPaint(); } };
            });
            const n = dkwq('dkwCnt'); if (n) n.innerHTML = `✏️ 연필꽂이 <b>${dkwCupN()}</b> / ${DKW_MAX}`;
            const tip = dkwq('dkwTip'); if (tip) tip.innerHTML = cup ? '톡 = 꺼내 쓰기 · <b>♥</b> = 연필꽂이에 꽂기 / 빼기' : '톡 = 꺼내 쓰기 · <b>♥</b> = 그리기 연필꽂이 · 책상에 연필꽂이를 놓으면 도구도 꽂아 둬요';
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
                return;
            }
            if (!cabIsOn(id)) { if (!GD_MULTI.includes(g)) gdOnPage(g).forEach(cabFlip); cabFlip(id); gdMainSet(g, id); }   // 하나만 쓰는 종류는 바꿔 놓기 (집게처럼 여럿 = GD_MULTI)
            const el = gdEl(id); if (!el) return;
            gdHome(el);
            if (dkwMeta(g).hand) { const b = el.getBoundingClientRect(); try { gdHold(id, b.left + b.width / 2, b.top + b.height / 2); } catch (e) { console.warn('🪑 들기', e); } }
            el.classList.remove('need'); void el.offsetWidth; el.classList.add('need'); setTimeout(() => el.classList.remove('need'), 2600);
        }
        window.dkwCupOpen = dkwCupOpen; window.dkwTrayOpen = dkwTrayOpen; window.dkwClose = dkwClose; window.dkwCupToolN = dkwCupToolN; window.dkwUse = dkwUse;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskgd'] = true;
