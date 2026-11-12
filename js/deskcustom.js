/* 말랑달콤 다이어리 - js/deskcustom.js
   🎨 책상 소품 꾸미기 창 (도련 10-28) = 🎨 색칠(모든 소품) + 그 소품만의 탭 + 👆 누르는 곳
   - 💡 스탠드 : 켜고 끄기 · 불빛 색            (톡 = 켜고 끄기)
   - 🔢 디지털 시계 : 숫자 글꼴 · 색  · ⏰ 알람 (시계 모두 · 울리면 시계를 톡 = 끄기)
   - 🖼 사진   : 내 사진 넣기 · 그림 그리기(🎨 색칠 창)
   - 📝 게시판 : 메모지 고르기 + 글 쓰기 → 게시판에 붙이기 (최대 8장 · 끌어서 옮기기 · 톡 = 고치기 · 떼기)
   - 👆 누르는 곳 : 기능(다이어리 · 설정 …)이 연결된 소품만 · 네모 안 = 소품 동작 · 나머지 그림 = 연결된 기능
       네모가 소품의 85% 이상이면 기능을 누를 자리가 없어서 고쳐 달라고 해요 · 너무 작으면(그림 px 28 미만) 안 돼요
   저장 : 바꾸면 바로 책상에 보이고 · 🛠 책상 꾸미기 하단 ✔ 완료 때 한꺼번에 저장 (취소 = 처음대로 · 창마다 완료 없음 · 도련 10-28)
          배치.json 의 소품 o.cs = { on, light, font, ink, alarm: { t, on }, area: [l, t, r, b] (%), memos: [{ p, t, x, y, r }] } (js/desk.js dkPersist)
   ※ 기능 = 상품공방 '기능' (도련 11-06 · DC_CAN) · 새 동작을 만들면 DC_CAN 에 한 줄 (그 뒤로는 아무 소품에나 골라요) · 그림마다 다르면 DESK_ITEMS 에 area(누르는 곳) · cork(메모 붙는 곳) (도련 11-01) */
(function () {
    /* 🧩 기능마다 꾸미기 탭 · 톡 동작 · 기본 누르는 곳 (도련 11-06 · 상품 '기능' 을 합쳐요 · 예전엔 종류마다) */
    const DC_CAN = {
        light: { tabs: ['light'], act: 'lamp', area: [0, 0, 62, 50] },     // 💡 불빛 : 톡 = 켜고 끄기 · 모양 = 상품 '소품.glow'
        clock: { tabs: ['digits', 'alarm'] },                               // 🕰 시계 : 숫자(lcd 가 있을 때) · 알람
        memo: { tabs: ['memo'] },                                           // 📝 메모 붙이기 (붙는 곳 = 상품 '소품.cork')
        rope: { tabs: [], act: 'lights' },                                  // 🎐 전구줄 : 톡 = 켜고 끄기 (js/desklights.js)
        peg: { tabs: ['photo'] },                                           // 📷 집게 사진 : 내 사진 넣기 (줄에 집기 = js/desklights.js)
        label: { tabs: [], act: 'label' }, camera: { tabs: [], act: 'camera' }, print: { tabs: [], act: 'print' }                                   // 🏷️ 라벨 스티커 기계 : 톡 = 기계가 공중에 떠서 크게 → 글씨 스티커 (js/labeler.js · 도련 11-08)
    };
    const DC_TAB = { paint: '🎨 색칠', light: '💡 불빛', digits: '🔢 숫자', alarm: '⏰ 알람', photo: '🖼 사진', memo: '📝 메모', area: '👆 누르는 곳' };
    const DC_LIGHT = ['#fff3c4', '#ffd9a8', '#ffc8dc', '#d7c8ff', '#c4ecff', '#cff5dc'];   // 💡 불빛 색 (맨 앞 = 기본 · 다꾸러가 바꿔 골라요 · 색은 앱 코드 · 모양만 상품공방 '소품.glow' · 도련 11-03)
    const dcLights = () => DC_LIGHT;
    const DC_INK = ['#4f6f93', '#c8457a', '#8f7bd6', '#2f7a5c', '#d98a1e', '#5e4250'];
    const DC_FONT = [['Jua', '말랑'], ["'Press Start 2P'", '픽셀'], ['Gaegu', '손글씨'], ["'Do Hyeon'", '또박']];
    const DC = { u: null, tab: 'paint', area: null, ring: null, mi: -1, mp: 'post' };
    /* 📝 메모지 : [종류, 이름] (모양은 css/anime.css .dk-memo.m-종류) · 게시판 코르크 칸 (그림 %) */
    const DC_PAPER = [['post', '포스트잇'], ['pink', '줄노트'], ['grid', '모눈'], ['mint', '민트'], ['lilac', '체크'], ['letter', '편지지']];
    const DC_CORK = [6, 25, 95, 94], DC_MEMO_MAX = 8;
    const dcEsc = t => htmlEsc(t || '');   // 🧰 js/util.js
    const dcMemoHtml = (m, i, sel) => `<div class="dk-memo m-${m.p}${sel ? ' sel' : ''}" data-i="${i}" style="left:${m.x}%;top:${m.y}%;--r:${m.r || 0}deg"><p>${dcEsc(m.t)}</p></div>`;

    const dcItem = u => DK.items.find(x => x.u === u);
    const dcCat = o => (o && dkCat(o.id)) || {};
    const dcKind = o => { const C = (dcCat(o).can || []).map(f => DC_CAN[f]).filter(Boolean); if (!C.length) return null; const a = C.find(c => c.act); return { tabs: [].concat(...C.map(c => c.tabs)), act: a ? a.act : null, area: a && a.area ? a.area : null }; };   // 기능을 합쳐요 (톡 동작은 하나 · 앞 기능)
    const dcCs = o => (o.cs = o.cs || {});
    const dcFnOf = u => { const m = DK.edit ? (DK.editFn || {}) : deskFnMap(); return Object.keys(m).find(k => m[k] === u) || ''; };
    const dcArea = o => (o.cs && o.cs.area) || dcCat(o).area || (dcKind(o) || {}).area || [0, 0, 100, 100];   // 내가 정한 곳 → 그 소품 그림(DESK_ITEMS area) → 종류 기본
    const dcCork = o => dcCat(o).cork || DC_CORK;                           // 📝 메모 붙는 곳 = 그 게시판 그림(DESK_ITEMS cork) → 기본 (도련 11-01 · 게시판이 늘어도)
    function dcSave(o) { dkPersist(o); dcApply(o.u); }

    /* ---------- 🪟 꾸미기 창 ---------- */
    function dcOpen(u, keep) {
        const o = dcItem(u); if (!o) return;
        DC.u = u; DC.area = null;
        const K = dcKind(o), tabs = (DK.trial ? [] : ['paint']).concat(K ? K.tabs.filter(t => t !== 'digits' || dcCat(o).lcd) : []);   // 🏪 적용해보기 = 색칠 · 누르는 곳 빼고 기능만
        if (K && K.act && dcFnOf(u) && !DK.trial) tabs.unshift('area');
        if (!tabs.length) return;   /* 👆 누르는 곳 = 맨 앞 · 꾸미기 열면 바로 보여 줌 */
        if (!keep) DC.mi = -1;
        if (!keep || !tabs.includes(DC.tab)) DC.tab = DK.trial ? tabs[0] : tabs[0] === 'area' ? 'area' : (tabs[1] || 'paint');
        const t = document.getElementById('deskCsTitle'); if (t) t.textContent = DK.trial ? '✨ ' + dkName(o) : '🎨 ' + dkName(o) + ' 꾸미기';
        const bar = document.getElementById('deskCsTabs');
        if (bar) bar.innerHTML = tabs.map(k => `<button type="button" class="dcs-tab${k === DC.tab ? ' on' : ''}" onclick="dcTab('${k}')">${DC_TAB[k]}</button>`).join('');
        dcBody();
        if (window.openModal) openModal('deskCsModal');
    }
    function dcTab(k) { DC.tab = k; DC.area = null; dcOpen(DC.u, 1); }
    function dcBody() {
        const o = dcItem(DC.u), box = document.getElementById('deskCsBody'); if (!o || !box) return;
        const cs = dcCs(o), sw = (L, cur, fn) => `<div class="dcs-sw">${L.map(c => `<button type="button" class="${c === cur ? 'on' : ''}" style="--c:${c}" onclick="${fn}('${c}')" aria-label="${c}"></button>`).join('')}</div>`;
        const T = DC.tab;
        if (T === 'paint') box.innerHTML = `<p class="dcs-p">소품 모양 안에 붓으로 칠하거나 그림을 붙여요.</p><button type="button" class="btn primary dcs-big" onclick="dcPaint()">🎨 색칠하러 가기</button>`;
        else if (T === 'light') box.innerHTML = `<div class="dcs-row"><b>불</b><button type="button" class="btn${cs.on ? ' primary' : ''}" onclick="dcLamp()">${cs.on ? '💡 켜짐' : '🌙 꺼짐'}</button></div>`
            + `<div class="dcs-row"><b>불빛 색</b>${sw(dcLights(o), cs.light || dcLights(o)[0], 'dcLight')}</div><p class="dcs-p">책상에서 스탠드를 톡 하면 켜고 꺼요.</p>`;
        else if (T === 'digits') box.innerHTML = `<div class="dcs-row"><b>글꼴</b><div class="dcs-font">${DC_FONT.map(([f, n]) => `<button type="button" class="btn${(cs.font || DC_FONT[0][0]) === f ? ' primary' : ''}" style="font-family:${f}" onclick="dcFont(&quot;${f.replace(/'/g, '&#39;')}&quot;)">${n} 12:34</button>`).join('')}</div></div>`
            + `<div class="dcs-row"><b>숫자 색</b>${sw(DC_INK, cs.ink || DC_INK[0], 'dcInk')}</div>`;
        else if (T === 'alarm') { const a = cs.alarm || { t: '07:30', on: false };
            box.innerHTML = `<div class="dcs-row"><b>시각</b><input type="time" class="dcs-time" value="${a.t}" onchange="dcAlarm(this.value, null)"></div>`
                + `<div class="dcs-row"><b>알람</b><button type="button" class="btn${a.on ? ' primary' : ''}" onclick="dcAlarm(null, ${!a.on})">${a.on ? '⏰ 켜짐' : '💤 꺼짐'}</button><button type="button" class="btn" onclick="dcRingTest()">🔔 들어 보기</button></div>`
                + `<p class="dcs-p">다이어리가 열려 있을 때 그 시각이 되면 시계가 울려요 · 울리는 시계를 톡 하면 꺼져요</p>`; }
        else if (T === 'photo') box.innerHTML = `<p class="dcs-p">사진 칸에 내 사진을 넣거나, 직접 그림을 그려요.</p><div class="dcs-snd"><button type="button" class="btn primary" onclick="dcPhoto()">🖼 내 사진 넣기</button><button type="button" class="btn" onclick="dcPaint()">✏️ 그림 그리기</button></div><p class="dcs-p">책상 꾸미기 아래 ✔ 완료를 누르면 저장돼요</p>`;
        else if (T === 'area') dcAreaBody(box, o);
        else if (T === 'memo') dcMemoBody(box, o);
    }
    function dcPaint() { const u = DC.u; if (window.closeModal) closeModal('deskCsModal'); if (window.dpOpen) dpOpen(u); }
    /* 💡 */
    function dcLamp() { const o = dcItem(DC.u); if (!o) return; dcCs(o).on = !o.cs.on; dcSave(o); dcBody(); }
    function dcLight(c) { const o = dcItem(DC.u); if (!o) return; Object.assign(dcCs(o), { light: c, on: true }); dcSave(o); dcBody(); }
    /* 🔢 */
    function dcFont(f) { const o = dcItem(DC.u); if (!o) return; dcCs(o).font = f; dcSave(o); dcBody(); }
    function dcInk(c) { const o = dcItem(DC.u); if (!o) return; dcCs(o).ink = c; dcSave(o); dcBody(); }
    /* ⏰ */
    function dcAlarm(t, on) { const o = dcItem(DC.u); if (!o) return; const a = dcCs(o).alarm = Object.assign({ t: '07:30', on: false }, o.cs.alarm); if (t) { a.t = t; a.on = true; } if (on != null) a.on = on; delete a.last; dcSave(o); dcBody(); }
    function dcRingTest() { dcBeep(); }
    const dcAc = () => (window.sndCtx ? sndCtx() : null);
    const dcBus = (ac, v) => { const g = ac.createGain(); g.gain.value = v; g.connect(window.sndOut ? sndOut() : ac.destination); return g; };
    function dcTone(ac, bus, t, f0, f1, dur, type, vol) {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine';
        o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .5, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + dur);
        o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .02);
    }
    function dcBeep() {                                                       // ⏰ 알람 소리 (삐삐삐 · 소리 크기는 🔊 설정 슬라이더)
        const ac = dcAc(); if (!ac) return; const t = ac.currentTime + .02, b = dcBus(ac, .3);
        [0, .18, .36].forEach(d => dcTone(ac, b, t + d, 1760, 0, .12, 'square', .35));
    }
    /* 🖼 사진 넣기 : 지금 그림 위 사진 칸(photo %)에 내 사진을 꽉 채워 그려 한 장으로 → 칠한 그림과 같은 파일 (js/deskpaint.js dpSave) */
    function dcPhoto() {
        const o = dcItem(DC.u), P = dcCat(o).photo; if (!o || !P) return;
        const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*';
        f.onchange = () => { const file = f.files && f.files[0]; if (!file) return;
            const pic = new Image(), base = new Image(); let n = 0;
            const go = async () => { if (++n < 2) return;
                const W = base.naturalWidth, H = base.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
                x.drawImage(base, 0, 0);
                const L = W * P[0] / 100, T = H * P[1] / 100, w = W * (P[2] - P[0]) / 100, h = H * (P[3] - P[1]) / 100, k = Math.max(w / pic.naturalWidth, h / pic.naturalHeight);
                const sw = w / k, sh = h / k; x.save(); x.beginPath(); x.rect(L, T, w, h); x.clip();
                x.drawImage(pic, (pic.naturalWidth - sw) / 2, (pic.naturalHeight - sh) / 2, sw, sh, L, T, w, h); x.restore();
                let url = c.toDataURL('image/webp', .9); if (!/^data:image\/webp/.test(url)) url = c.toDataURL('image/png');
                try { if (window.dkArtDraft) await dkArtDraft(o, url); if (window.closeModal) closeModal('deskCsModal'); } catch (e) { console.warn(e); if (window.showMsg) showMsg('⚠ 사진을 넣지 못했어요.'); }
                URL.revokeObjectURL(pic.src); };
            pic.onload = go; base.onload = go; base.crossOrigin = 'anonymous';
            pic.src = URL.createObjectURL(file); base.src = dkSrc(o); };
        f.click();
    }
    /* 👆 누르는 곳 : 그림 위 민트 네모 (👆 상품 칸 분홍과 나눠요 · 도련 10-30) (끌어 옮기기 · 오른쪽 아래 점 = 크기) · 보라 = 연결된 기능 */
    function dcAreaBody(box, o) {
        const it = dcCat(o), fn = dcFnOf(o.u), f = window.dkWin ? dkWin(fn) : null, K = dcKind(o);
        if (!DC.area) DC.area = dcArea(o).slice();
        const k = Math.min(240 / it.w, 220 / it.h), W = Math.round(it.w * k), H = Math.round(it.h * k), [l, t, r, b] = DC.area;
        box.innerHTML = `<p class="dcs-p">민트 네모 안을 톡 = 💡 켜고 끄기 · 나머지 그림 = ${f ? f[3] + ' ' + f[1] : '기능'}</p>`
            + `<div class="dcs-area" id="dcsArea" style="width:${W}px;height:${H}px"><img src="${dkSrc(o)}" alt="" draggable="false"><i class="dcs-fn"></i>`
            + `<div class="dcs-box" id="dcsBox" style="left:${l}%;top:${t}%;width:${r - l}%;height:${b - t}%"><span>💡</span><b class="dcs-h" id="dcsH"></b></div></div>`
            + `<p class="dcs-warn" id="dcsWarn" hidden></p><div class="dcs-row dcs-end"><button type="button" class="btn" onclick="dcAreaReset()">↺ 처음대로</button></div>`;
        const A = document.getElementById('dcsArea'), Bx = document.getElementById('dcsBox'), Hd = document.getElementById('dcsH');
        let d = null;
        const pct = ev => { const R = A.getBoundingClientRect(); return [(ev.clientX - R.left) / R.width * 100, (ev.clientY - R.top) / R.height * 100]; };
        const paint = () => { const [a, c, e, g] = DC.area; Object.assign(Bx.style, { left: a + '%', top: c + '%', width: (e - a) + '%', height: (g - c) + '%' }); };
        Bx.addEventListener('pointerdown', ev => { ev.preventDefault(); d = { m: ev.target === Hd ? 'size' : 'move', p: pct(ev), a: DC.area.slice() }; try { Bx.setPointerCapture(ev.pointerId); } catch (e) {} });
        Bx.addEventListener('pointermove', ev => { if (!d) return; const [x, y] = pct(ev), dx = x - d.p[0], dy = y - d.p[1], a = d.a;
            if (d.m === 'move') { const w = a[2] - a[0], h = a[3] - a[1], nl = Math.max(0, Math.min(100 - w, a[0] + dx)), nt = Math.max(0, Math.min(100 - h, a[1] + dy)); DC.area = [nl, nt, nl + w, nt + h]; }
            else DC.area = [a[0], a[1], Math.max(a[0] + 8, Math.min(100, a[2] + dx)), Math.max(a[1] + 8, Math.min(100, a[3] + dy))];
            paint(); });
        const up = () => { if (!d) return; d = null; dcAreaSave(); }; Bx.addEventListener('pointerup', up); Bx.addEventListener('pointercancel', up);
    }
    function dcAreaReset() { const o = dcItem(DC.u); if (!o) return; DC.area = ((dcKind(o) || {}).area || [0, 0, 100, 100]).slice(); delete dcCs(o).area; dcSave(o); dcBody(); }
    /* 네모를 놓으면 바로 적용 (저장은 하단 ✔ 완료) · 안 되는 크기면 창 안에 빨간 글로 알려 주고 적용 안 해요 */
    function dcAreaSave() {
        const o = dcItem(DC.u); if (!o) return; const it = dcCat(o), [l, t, r, b] = DC.area.map(v => Math.round(v * 10) / 10);
        const fn = dcFnOf(o.u), f = window.dkWin ? dkWin(fn) : null, W = document.getElementById('dcsWarn');
        const bad = fn && (r - l) * (b - t) >= 8500 ? `📌 <b>${f ? f[3] + ' ' + f[1] : '기능'}</b>을 누를 자리가 남도록 민트 네모를 줄여 주세요`
            : (r - l) * it.w / 100 < 28 || (b - t) * it.h / 100 < 28 ? '👆 너무 작아요 · 손가락으로 누를 수 있게 조금 키워 주세요' : '';
        if (W) { W.innerHTML = bad; W.hidden = !bad; }
        if (bad) return;
        dcCs(o).area = [l, t, r, b]; dcSave(o);
    }

    /* 📝 메모 : 위 = 게시판 미리 보기 (메모 톡 = 고르기 · 끌기 = 옮기기) · 아래 = 메모지 + 글 */
    const dcMemos = o => (dcCs(o).memos = o.cs.memos || []);
    function dcMemoBody(box, o) {
        const it = dcCat(o), L = dcMemos(o), k = Math.min(300 / it.w, 230 / it.h), W = Math.round(it.w * k), H = Math.round(it.h * k);
        if (DC.mi >= L.length) DC.mi = -1;
        const m = L[DC.mi], p = m ? m.p : DC.mp;
        box.innerHTML = `<p class="dcs-p">${L.length ? '메모를 톡 = 고치기 · 끌어서 옮겨요' : '메모지를 고르고 글을 써서 붙여 보세요'}</p>`
            + `<div class="dcs-board" id="dcsBoard" style="width:${W}px;height:${H}px"><div class="dcs-bin" style="width:${it.w}px;height:${it.h}px;transform:scale(${k})"><img src="${dkSrc(o)}" alt="" draggable="false"><div class="dk-memos">${L.map((x, i) => dcMemoHtml(x, i, i === DC.mi)).join('')}</div></div></div>`
            + `<div class="dcs-paper">${DC_PAPER.map(([c, n]) => `<button type="button" class="${c === p ? 'on' : ''}" onclick="dcMemoPaper('${c}')"><i class="dk-memo m-${c}"></i><span>${n}</span></button>`).join('')}</div>`
            + `<textarea class="dcs-memo-t" id="dcsMemoT" maxlength="40" rows="2" placeholder="메모에 쓸 말 (40자까지)">${dcEsc(m ? m.t : DC.draft || '')}</textarea>`
            + `<div class="dcs-row dcs-end">${m ? `<button type="button" class="btn" onclick="dcMemoNew()">➕ 새 메모</button><button type="button" class="btn" onclick="dcMemoDel()">🗑 떼기</button>`
                : `<button type="button" class="btn primary" onclick="dcMemoAdd()">📌 붙이기 <small>${L.length}/${DC_MEMO_MAX}</small></button>`}</div>`;
        const T = document.getElementById('dcsMemoT'), B = document.getElementById('dcsBoard');
        T.addEventListener('input', () => { const n = L[DC.mi]; if (!n) { DC.draft = T.value; return; } n.t = T.value; const e = B.querySelector(`.dk-memo[data-i="${DC.mi}"] p`); if (e) e.textContent = n.t; });
        T.addEventListener('change', () => { if (L[DC.mi]) dcSave(o); });
        let d = null;
        const pct = ev => { const r = B.getBoundingClientRect(); return [(ev.clientX - r.left) / r.width * 100, (ev.clientY - r.top) / r.height * 100]; };
        B.addEventListener('pointerdown', ev => { const e = ev.target.closest('.dk-memo'); if (!e) return; ev.preventDefault();
            const i = +e.dataset.i, n = L[i]; d = { i, e, p: pct(ev), a: [n.x, n.y], mv: false }; try { B.setPointerCapture(ev.pointerId); } catch (x) {} });
        B.addEventListener('pointermove', ev => { if (!d) return; const [x, y] = pct(ev), dx = x - d.p[0], dy = y - d.p[1]; if (!d.mv && Math.hypot(dx, dy) < 2) return; d.mv = true;
            const n = L[d.i], C = dcCork(o); n.x = Math.round(Math.max(C[0] + 8, Math.min(C[2] - 8, d.a[0] + dx)) * 10) / 10; n.y = Math.round(Math.max(C[1] + 10, Math.min(C[3] - 10, d.a[1] + dy)) * 10) / 10;
            d.e.style.left = n.x + '%'; d.e.style.top = n.y + '%'; });
        const up = () => { if (!d) return; const q = d; d = null; if (q.mv) dcSave(o); else { DC.mi = q.i === DC.mi ? -1 : q.i; dcBody(); } };
        B.addEventListener('pointerup', up); B.addEventListener('pointercancel', up);
    }
    function dcMemoPaper(c) { const o = dcItem(DC.u); if (!o) return; const m = dcMemos(o)[DC.mi]; if (m) { m.p = c; dcSave(o); } else DC.mp = c; dcBody(); }
    function dcMemoNew() { DC.mi = -1; DC.draft = ''; dcBody(); const t = document.getElementById('dcsMemoT'); if (t) t.focus(); }
    function dcMemoAdd() {
        const o = dcItem(DC.u); if (!o) return; const L = dcMemos(o), t = (document.getElementById('dcsMemoT') || {}).value || '';
        if (!t.trim()) { if (window.showMsg) showMsg('📝 메모에 쓸 말을 적어 주세요.'); return; }
        if (L.length >= DC_MEMO_MAX) { if (window.showMsg) showMsg(`📌 게시판에는 메모를 ${DC_MEMO_MAX}장까지 붙일 수 있어요.<br><small>다 쓴 메모를 떼고 붙여 주세요</small>`); return; }
        const [l, tp, r, b] = dcCork(o), n = L.length, col = n % 4, row = Math.floor(n / 4) % 2;   // 빈칸부터 차례로 (4 × 2)
        L.push({ p: DC.mp, t: t.trim(), x: Math.round(l + (r - l) * (col + .5) / 4 + (Math.random() * 4 - 2)), y: Math.round(tp + (b - tp) * (row + .5) / 2 + (Math.random() * 4 - 2)), r: Math.round(Math.random() * 10 - 5) });
        DC.mi = -1; DC.draft = ''; dcSave(o); dcBody();
    }
    function dcMemoDel() { const o = dcItem(DC.u); if (!o) return; dcMemos(o).splice(DC.mi, 1); DC.mi = -1; dcSave(o); dcBody(); }

    /* ---------- 🪑 책상 위 모습 (불빛 · 숫자) ---------- */
    function dcApply(u) {
        const o = dcItem(u), el = document.querySelector(`#deskStage .desk-item[data-u="${u}"]`); if (!o || !el) return;
        const cs = o.cs || {}, can = dcCat(o).can || [];
        if (can.includes('light')) {
            el.classList.toggle('lit', !!cs.on); el.style.setProperty('--lt', cs.light || dcLights(o)[0]);
            dcGlow(el, dcCat(o));                                              // 💡 불빛 모양 = 상품 '소품.glow' (상품공방에서 점을 찍어요 · 도련 11-03)
        }
        if (can.includes('memo')) {                                               // 📝 붙인 메모 (누르면 그대로 게시판 기능 · 메모는 못 눌러요)
            let w = el.querySelector(':scope > .dk-memos'); if (!w) { w = document.createElement('div'); w.className = 'dk-memos'; w.setAttribute('aria-hidden', 'true'); el.appendChild(w); }
            w.innerHTML = (cs.memos || []).map((m, i) => dcMemoHtml(m, i)).join('');
        }
        const lcd = el.querySelector('.dk-lcd b'); if (lcd) { lcd.style.fontFamily = cs.font ? `${cs.font}, 'Jua', sans-serif` : ''; lcd.style.color = cs.ink || ''; lcd.style.fontSize = cs.font && /Press/.test(cs.font) ? '19px' : ''; }
    }
    /* 💡 불빛 (도련 11-03) : 상품 '소품.glow' = 점 [x, y] (소품 크기 % · 소품 밖도 돼요) 를 이은 모양 · 1 · 2번 점 가운데(갓 입구)에서 밝고 멀어질수록 흐려져 끝은 0 (가장자리도 번져서 0) · 없으면 불빛 없어요 (검수 = 상품공방)
       불빛은 소품 안이 아니라 책상 위 따로 한 겹 (#deskStage > .dk-lights · 모든 소품 위) = 앞에 놓인 소품에도 빛이 비쳐요 · 스탠드를 옮기거나 돌리면 따라가요 */
    const DC_SVG = 'http://www.w3.org/2000/svg';
    function dcGlowPts(c) { return Array.isArray(c.glow) ? c.glow.filter(p => Array.isArray(p) && isFinite(+p[0]) && isFinite(+p[1])).map(p => [+p[0], +p[1]]) : []; }
    function dcGlow(el, c) {
        const st = document.getElementById('deskStage'), u = el.dataset.u; if (!st) return;
        let L = st.querySelector(':scope > .dk-lights');
        if (!L) { L = document.createElement('div'); L.className = 'dk-lights'; L.setAttribute('aria-hidden', 'true'); st.appendChild(L); }
        let g = [...L.children].find(x => x.dataset.gu === u);
        const fl = el.classList.contains('dk-fl'), P = dcGlowPts(c).map(p => fl ? [100 - p[0], p[1]] : p);   // ↔ 돌린 스탠드 = 불빛도 반대쪽
        if (P.length < 3) { if (g) g.remove(); return; }
        if (!g) { g = document.createElementNS(DC_SVG, 'svg'); g.setAttribute('class', 'dk-glow'); g.dataset.gu = u; g.dataset.an = 1;   /* 🎬 애니 효과(js/anime.js)가 그라데이션을 첫 색 하나로 굳히지 않게 (불빛 색이 안 바뀌던 까닭 · 11-12 고침) */ L.appendChild(g); }
        if (!el._dcGlowObs) { el._dcGlowObs = new MutationObserver(() => { const o = dcItem(el.dataset.u); if (o && el.isConnected) dcGlow(el, dcCat(o)); }); el._dcGlowObs.observe(el, { attributes: true, attributeFilter: ['style', 'class'] }); }   // 옮기기 · 크기 · 돌리기 · 켜고 끄기
        const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
        const W = el.offsetWidth, H = el.offsetHeight;
        Object.assign(g.style, { left: (el.offsetLeft + x0 / 100 * W) + 'px', top: (el.offsetTop + y0 / 100 * H) + 'px', width: (w / 100 * W) + 'px', height: (h / 100 * H) + 'px', display: el.style.display === 'none' ? 'none' : '' });
        g.style.filter = `blur(${Math.max(4, Math.min(w / 100 * W, h / 100 * H) * .035).toFixed(1)}px)`;   // 가장자리 = 부드럽게 0 으로 (불빛 크기에 맞춰 번져요)
        const lt = el.style.getPropertyValue('--lt') || '#fff3c4'; g.style.setProperty('--lt', lt);
        g.classList.toggle('on', el.classList.contains('lit'));
        const paint = () => g.querySelectorAll('stop').forEach(x => { x.style.stopColor = lt; });   // 🎨 색은 점마다 바로 (크롬은 그라데이션 속 var(--lt) 가 바뀌어도 다시 안 그려요 · 11-12 고침)
        const sig = JSON.stringify(P); if (g.dataset.sig === sig) { paint(); return; }
        const cx = (P[0][0] + P[1][0]) / 2, cy = (P[0][1] + P[1][1]) / 2, r = Math.max(...P.map(p => Math.hypot(p[0] - cx, p[1] - cy)));
        const id = 'dkg' + Math.random().toString(36).slice(2, 7);
        g.dataset.sig = sig; g.setAttribute('viewBox', `${x0} ${y0} ${w} ${h}`); g.setAttribute('preserveAspectRatio', 'none');
        g.innerHTML = `<defs><radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" style="stop-color:var(--lt)" stop-opacity=".95"/><stop offset=".5" style="stop-color:var(--lt)" stop-opacity=".7"/><stop offset=".8" style="stop-color:var(--lt)" stop-opacity=".35"/><stop offset="1" style="stop-color:var(--lt)" stop-opacity="0"/></radialGradient></defs><polygon points="${P.map(p => p.join(',')).join(' ')}" fill="url(#${id})"/>`;
        paint();
    }
    function dcGlowPrune() {                                                   // 책상에서 빠진 스탠드의 불빛은 지워요
        const L = document.querySelector('#deskStage > .dk-lights'); if (!L) return;
        [...L.children].forEach(g => { const el = document.querySelector(`#deskStage .desk-item[data-u="${g.dataset.gu}"]`); if (!el) g.remove(); });
    }
    function dcApplyAll() { dcGlowPrune(); DK.items.forEach(o => { if (o.at === 'desk') dcApply(o.u); }); }

    /* ---------- 👆 톡 (js/desk.js deskWire · deskTapAt 이 먼저 물어봐요) → true 면 소품 동작을 했어요 ---------- */
    function dcTap(el, x, y) {
        const o = dcItem(el.dataset.u); if (!o) return false;
        if (DC.ring === o.u) { dcRingStop(); return true; }                  // ⏰ 울리는 시계 = 끄기
        const K = dcKind(o); if (!K || !K.act) return false;
        if (el.dataset.fn) {                                                  // 기능이 있으면 민트 네모 안만 소품 동작
            const im = el.querySelector(':scope > img') || el, R = im.getBoundingClientRect(), [l, t, r, b] = dcArea(o);
            const px = (el.classList.contains('dk-fl') ? R.right - x : x - R.left) / R.width * 100, py = (y - R.top) / R.height * 100;
            if (px < l || px > r || py < t || py > b) return false;
        }
        if (K.act === 'label') { if (window.openLabeler) openLabeler(el); return true; }
        if (K.act === 'camera') { if (window.openDigicam) openDigicam({ el }); return true; }   // 📷 말랑 디카 (도련 11-08)
        if (K.act === 'print') { if (window.openStickerPrinter) openStickerPrinter({ el }); return true; }   // 🖨️ 말랑 스티커 프린터 (도련 11-08)
        if (K.act === 'lamp') { dcCs(o).on = !o.cs.on; dcSave(o); }
        if (K.act === 'lights') { dcCs(o).off = !o.cs.off; if (!o.cs.off) delete o.cs.off; dcSave(o); }
        return true;
    }
    /* ⏰ 알람 : 1초마다 (책상 화면) · 그 분 0초 ~ 59초 사이 한 번 · 하루 한 번 (alarm.last = 날짜) */
    function dcRingStop() { const el = DC.ring && document.querySelector(`#deskStage .desk-item[data-u="${DC.ring}"]`); if (el) el.classList.remove('ring'); clearInterval(DC.ringT); DC.ring = null; }
    setInterval(() => {
        if (typeof DK === 'undefined' || !DK.items || DC.ring) return;
        const n = new Date(), hm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'), day = n.toDateString();
        const o = DK.items.find(x => x.at === 'desk' && x.cs && x.cs.alarm && x.cs.alarm.on && x.cs.alarm.t === hm && x.cs.alarm.last !== day); if (!o) return;
        o.cs.alarm.last = day; dkPersist(o, 1);
        const el = document.querySelector(`#deskStage .desk-item[data-u="${o.u}"]`); if (el) el.classList.add('ring');
        DC.ring = o.u; dcBeep(); let k = 0; DC.ringT = setInterval(() => { if (++k > 20) dcRingStop(); else dcBeep(); }, 1500);   // 30초 동안
        if (window.showMsg) showMsg(`⏰ ${hm} 알람이에요!`).then(() => dcRingStop());
    }, 1000);

    /* 🏪 적용해보기 (도련 11-12) : 처음부터 기능 창이 떠 있어요 (색칠 빼고 · 버튼 없이 바로) · 기계(라벨기 · 디카 · 프린터) = 기계가 바로 떠요 · 소품을 톡 = 앱처럼 동작 + 창 */
    const dcTrialTabs = o => { const K = dcKind(o); return K ? K.tabs.filter(t => t !== 'digits' || dcCat(o).lcd) : []; };
    function dcTrialOpen(u, did, first) {
        const o = dcItem(u); if (!o || !DK.trial) return;
        const K = dcKind(o), M = document.getElementById('deskCsModal'), on = M && M.style.display === 'flex';
        if (dcTrialTabs(o).length) { if (on && DC.u === u) dcBody(); else dcOpen(u);
            const el = document.querySelector(`#deskStage .desk-item[data-u="${u}"]`), R = el && el.getBoundingClientRect();   // 창은 소품 반대쪽에 (소품이 가리지 않게)
            if (M) M.classList.toggle('dct-l', !!R && R.left + R.width / 2 > innerWidth / 2); return; }
        if (first && K && ['label', 'camera', 'print'].includes(K.act)) { const el = document.querySelector(`#deskStage .desk-item[data-u="${u}"]`); if (el) dcTap(el, 0, 0); }
    }
    function dcTrialOff() { dcRingStop(); const M = document.getElementById('deskCsModal'); if (M) M.classList.remove('dct-l'); if (M && M.style.display === 'flex' && window.closeModal) closeModal('deskCsModal'); }
    window.dcTrialOpen = dcTrialOpen; window.dcTrialOff = dcTrialOff;
    window.dcOpen = dcOpen; window.dcTab = dcTab; window.dcPaint = dcPaint; window.dcLamp = dcLamp; window.dcLight = dcLight; window.dcFont = dcFont; window.dcInk = dcInk;
    window.dcMemoPaper = dcMemoPaper; window.dcMemoNew = dcMemoNew; window.dcMemoAdd = dcMemoAdd; window.dcMemoDel = dcMemoDel;
    window.dcAlarm = dcAlarm; window.dcRingTest = dcRingTest; window.dcPhoto = dcPhoto;
    window.dcAreaReset = dcAreaReset; window.dcAreaSave = dcAreaSave; window.dcApply = dcApply; window.dcApplyAll = dcApplyAll; window.dcTap = dcTap;
    window.dcActEl = act => [...document.querySelectorAll('.desk-item[data-u]')].find(el => { const o = dcItem(el.dataset.u), K = o && dcKind(o); if (!K || K.act !== act) return false; const R = el.getBoundingClientRect(); return R.width > 4 && R.bottom > 0 && R.top < innerHeight && getComputedStyle(el).visibility !== 'hidden'; }) || null;
    window.dcLabelerEl = () => window.dcActEl('label');   // 🏷️ · 📷 책상 위 소품 (보일 때만 · ✂️ 스티커 만들기가 거기서 떠오르게)   // 🏷️ 책상 위 라벨기 (보일 때만 · ✂️ 글씨 스티커가 거기서 떠오르게)
})();
