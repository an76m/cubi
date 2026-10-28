/* 말랑달콤 다이어리 - js/deskcustom.js
   🎨 책상 소품 꾸미기 창 (도련 10-28) = 🎨 색칠(모든 소품) + 그 소품만의 탭 + 👆 누르는 곳
   - 💡 스탠드 : 켜고 끄기 · 불빛 색            (톡 = 켜고 끄기)
   - 🔢 디지털 시계 : 숫자 글꼴 · 색  · ⏰ 알람 (시계 모두 · 울리면 시계를 톡 = 끄기)
   - 🖼 사진   : 내 사진 넣기 · 그림 그리기(🎨 색칠 창)
   - 👆 누르는 곳 : 기능(다이어리 · 설정 …)이 연결된 소품만 · 네모 안 = 소품 동작 · 나머지 그림 = 연결된 기능
       네모가 소품의 85% 이상이면 기능을 누를 자리가 없어서 고쳐 달라고 해요 · 너무 작으면(그림 px 28 미만) 안 돼요
   저장 : 배치.json 의 소품 o.cs = { on, light, font, ink, alarm: { t, on }, area: [l, t, r, b] (%) } (js/desk.js dkPersist)
   ※ 소품 종류를 더하면 DC_KINDS 에 탭 · 동작 · 기본 누르는 곳만 더해요 */
(function () {
    const DC_KINDS = {
        lamp: { tabs: ['light'], act: 'lamp', area: [0, 0, 62, 50] },
        clock: { tabs: ['digits', 'alarm'], act: null, area: null },
        photo: { tabs: ['photo'], act: null, area: null }
    };
    const DC_TAB = { paint: '🎨 색칠', light: '💡 불빛', digits: '🔢 숫자', alarm: '⏰ 알람', photo: '🖼 사진', area: '👆 누르는 곳' };
    const DC_LIGHT = ['#fff3c4', '#ffd9a8', '#ffc8dc', '#d7c8ff', '#c4ecff', '#cff5dc'];
    const DC_INK = ['#4f6f93', '#c8457a', '#8f7bd6', '#2f7a5c', '#d98a1e', '#5e4250'];
    const DC_FONT = [['Jua', '말랑'], ["'Press Start 2P'", '픽셀'], ['Gaegu', '손글씨'], ["'Do Hyeon'", '또박']];
    const DC = { u: null, tab: 'paint', area: null, ring: null, };

    const dcItem = u => DK.items.find(x => x.u === u);
    const dcCat = o => (o && dkCat(o.id)) || {};
    const dcKind = o => DC_KINDS[dcCat(o).kind] || null;
    const dcCs = o => (o.cs = o.cs || {});
    const dcFnOf = u => { const m = DK.edit ? (DK.editFn || {}) : deskFnMap(); return Object.keys(m).find(k => m[k] === u) || ''; };
    const dcArea = o => (o.cs && o.cs.area) || (dcKind(o) || {}).area || [0, 0, 100, 100];
    function dcSave(o) { dkPersist(o); dcApply(o.u); }

    /* ---------- 🪟 꾸미기 창 ---------- */
    function dcOpen(u) {
        const o = dcItem(u); if (!o) return;
        DC.u = u; DC.area = null;
        const K = dcKind(o), tabs = ['paint'].concat(K ? K.tabs.filter(t => t !== 'digits' || dcCat(o).lcd) : []);
        if (K && K.act && dcFnOf(u)) tabs.push('area');
        if (!tabs.includes(DC.tab)) DC.tab = tabs[1] || 'paint';
        const t = document.getElementById('deskCsTitle'); if (t) t.textContent = '🎨 ' + dkName(o) + ' 꾸미기';
        const bar = document.getElementById('deskCsTabs');
        if (bar) bar.innerHTML = tabs.map(k => `<button type="button" class="dcs-tab${k === DC.tab ? ' on' : ''}" onclick="dcTab('${k}')">${DC_TAB[k]}</button>`).join('');
        dcBody();
        if (window.openModal) openModal('deskCsModal');
    }
    function dcTab(k) { DC.tab = k; DC.area = null; dcOpen(DC.u); }
    function dcBody() {
        const o = dcItem(DC.u), box = document.getElementById('deskCsBody'); if (!o || !box) return;
        const cs = dcCs(o), sw = (L, cur, fn) => `<div class="dcs-sw">${L.map(c => `<button type="button" class="${c === cur ? 'on' : ''}" style="--c:${c}" onclick="${fn}('${c}')" aria-label="${c}"></button>`).join('')}</div>`;
        const T = DC.tab;
        if (T === 'paint') box.innerHTML = `<p class="dcs-p">소품 모양 안에 붓으로 칠하거나 그림을 붙여요.</p><button type="button" class="btn primary dcs-big" onclick="dcPaint()">🎨 색칠하러 가기</button>`;
        else if (T === 'light') box.innerHTML = `<div class="dcs-row"><b>불</b><button type="button" class="btn${cs.on ? ' primary' : ''}" onclick="dcLamp()">${cs.on ? '💡 켜짐' : '🌙 꺼짐'}</button></div>`
            + `<div class="dcs-row"><b>불빛 색</b>${sw(DC_LIGHT, cs.light || DC_LIGHT[0], 'dcLight')}</div><p class="dcs-p">책상에서 스탠드를 톡 하면 켜고 꺼요.</p>`;
        else if (T === 'digits') box.innerHTML = `<div class="dcs-row"><b>글꼴</b><div class="dcs-font">${DC_FONT.map(([f, n]) => `<button type="button" class="btn${(cs.font || DC_FONT[0][0]) === f ? ' primary' : ''}" style="font-family:${f}" onclick="dcFont(&quot;${f.replace(/'/g, '&#39;')}&quot;)">${n} 12:34</button>`).join('')}</div></div>`
            + `<div class="dcs-row"><b>숫자 색</b>${sw(DC_INK, cs.ink || DC_INK[0], 'dcInk')}</div>`;
        else if (T === 'alarm') { const a = cs.alarm || { t: '07:30', on: false };
            box.innerHTML = `<div class="dcs-row"><b>시각</b><input type="time" class="dcs-time" value="${a.t}" onchange="dcAlarm(this.value, null)"></div>`
                + `<div class="dcs-row"><b>알람</b><button type="button" class="btn${a.on ? ' primary' : ''}" onclick="dcAlarm(null, ${!a.on})">${a.on ? '⏰ 켜짐' : '💤 꺼짐'}</button><button type="button" class="btn" onclick="dcRingTest()">🔔 들어 보기</button></div>`
                + `<p class="dcs-p">다이어리가 열려 있을 때 그 시각이 되면 시계가 울려요 · 울리는 시계를 톡 하면 꺼져요</p>`; }
        else if (T === 'photo') box.innerHTML = `<p class="dcs-p">사진 칸에 내 사진을 넣거나, 직접 그림을 그려요.</p><div class="dcs-snd"><button type="button" class="btn primary" onclick="dcPhoto()">🖼 내 사진 넣기</button><button type="button" class="btn" onclick="dcPaint()">✏️ 그림 그리기</button></div><p class="dcs-p">넣으면 되돌릴 수 없어요 (색칠과 같아요)</p>`;
        else if (T === 'area') dcAreaBody(box, o);
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
                try { if (window.dpSave) await dpSave(o, url); if (window.closeModal) closeModal('deskCsModal'); } catch (e) { console.warn(e); if (window.showMsg) showMsg('⚠ 사진을 넣지 못했어요.'); }
                URL.revokeObjectURL(pic.src); };
            pic.onload = go; base.onload = go; base.crossOrigin = 'anonymous';
            pic.src = URL.createObjectURL(file); base.src = dkSrc(o); };
        f.click();
    }
    /* 👆 누르는 곳 : 그림 위 분홍 네모 (끌어 옮기기 · 오른쪽 아래 점 = 크기) · 보라 = 연결된 기능 */
    function dcAreaBody(box, o) {
        const it = dcCat(o), fn = dcFnOf(o.u), f = DK_FNS.find(x => x[0] === fn), K = dcKind(o);
        if (!DC.area) DC.area = dcArea(o).slice();
        const k = Math.min(240 / it.w, 220 / it.h), W = Math.round(it.w * k), H = Math.round(it.h * k), [l, t, r, b] = DC.area;
        box.innerHTML = `<p class="dcs-p">분홍 네모 안을 톡 = 💡 켜고 끄기 · 나머지 그림 = ${f ? f[3] + ' ' + f[1] : '기능'}</p>`
            + `<div class="dcs-area" id="dcsArea" style="width:${W}px;height:${H}px"><img src="${dkSrc(o)}" alt="" draggable="false"><i class="dcs-fn"></i>`
            + `<div class="dcs-box" id="dcsBox" style="left:${l}%;top:${t}%;width:${r - l}%;height:${b - t}%"><span>💡</span><b class="dcs-h" id="dcsH"></b></div></div>`
            + `<div class="dcs-row dcs-end"><button type="button" class="btn" onclick="dcAreaReset()">↺ 처음대로</button><button type="button" class="btn primary" onclick="dcAreaSave()">✔ 저장</button></div>`;
        const A = document.getElementById('dcsArea'), Bx = document.getElementById('dcsBox'), Hd = document.getElementById('dcsH');
        let d = null;
        const pct = ev => { const R = A.getBoundingClientRect(); return [(ev.clientX - R.left) / R.width * 100, (ev.clientY - R.top) / R.height * 100]; };
        const paint = () => { const [a, c, e, g] = DC.area; Object.assign(Bx.style, { left: a + '%', top: c + '%', width: (e - a) + '%', height: (g - c) + '%' }); };
        Bx.addEventListener('pointerdown', ev => { ev.preventDefault(); d = { m: ev.target === Hd ? 'size' : 'move', p: pct(ev), a: DC.area.slice() }; try { Bx.setPointerCapture(ev.pointerId); } catch (e) {} });
        Bx.addEventListener('pointermove', ev => { if (!d) return; const [x, y] = pct(ev), dx = x - d.p[0], dy = y - d.p[1], a = d.a;
            if (d.m === 'move') { const w = a[2] - a[0], h = a[3] - a[1], nl = Math.max(0, Math.min(100 - w, a[0] + dx)), nt = Math.max(0, Math.min(100 - h, a[1] + dy)); DC.area = [nl, nt, nl + w, nt + h]; }
            else DC.area = [a[0], a[1], Math.max(a[0] + 8, Math.min(100, a[2] + dx)), Math.max(a[1] + 8, Math.min(100, a[3] + dy))];
            paint(); });
        const up = () => { d = null; }; Bx.addEventListener('pointerup', up); Bx.addEventListener('pointercancel', up);
    }
    function dcAreaReset() { const o = dcItem(DC.u); if (!o) return; DC.area = (dcKind(o).area || [0, 0, 100, 100]).slice(); dcBody(); }
    function dcAreaSave() {
        const o = dcItem(DC.u); if (!o) return; const it = dcCat(o), [l, t, r, b] = DC.area.map(v => Math.round(v * 10) / 10);
        const fn = dcFnOf(o.u), f = DK_FNS.find(x => x[0] === fn);
        if (fn && (r - l) * (b - t) >= 8500) { if (window.showMsg) showMsg(`📌 이 소품에는 <b>${f ? f[3] + ' ' + f[1] : '기능'}</b>이 연결돼 있어요.<br>기능을 누를 자리가 남도록 분홍 네모를 줄여 주세요.`); return; }
        if ((r - l) * it.w / 100 < 28 || (b - t) * it.h / 100 < 28) { if (window.showMsg) showMsg('👆 누르는 곳이 너무 작아요.<br><small>손가락으로 누를 수 있게 조금 키워 주세요</small>'); return; }
        dcCs(o).area = [l, t, r, b]; dcSave(o); if (window.showMsg) showMsg('👆 누르는 곳을 저장했어요!');
    }

    /* ---------- 🪑 책상 위 모습 (불빛 · 숫자) ---------- */
    function dcApply(u) {
        const o = dcItem(u), el = document.querySelector(`#deskStage .desk-item[data-u="${u}"]`); if (!o || !el) return;
        const cs = o.cs || {}, kind = dcCat(o).kind;
        if (kind === 'lamp') {
            let g = el.querySelector('.dk-glow'); if (!g) { g = document.createElement('i'); g.className = 'dk-glow'; g.setAttribute('aria-hidden', 'true'); el.insertBefore(g, el.firstChild); }
            el.classList.toggle('lit', !!cs.on); el.style.setProperty('--lt', cs.light || DC_LIGHT[0]);
        }
        const lcd = el.querySelector('.dk-lcd b'); if (lcd) { lcd.style.fontFamily = cs.font ? `${cs.font}, 'Jua', sans-serif` : ''; lcd.style.color = cs.ink || ''; lcd.style.fontSize = cs.font && /Press/.test(cs.font) ? '19px' : ''; }
    }
    function dcApplyAll() { DK.items.forEach(o => { if (o.at === 'desk') dcApply(o.u); }); }

    /* ---------- 👆 톡 (js/desk.js deskWire · deskTapAt 이 먼저 물어봐요) → true 면 소품 동작을 했어요 ---------- */
    function dcTap(el, x, y) {
        const o = dcItem(el.dataset.u); if (!o) return false;
        if (DC.ring === o.u) { dcRingStop(); return true; }                  // ⏰ 울리는 시계 = 끄기
        const K = dcKind(o); if (!K || !K.act) return false;
        if (el.dataset.fn) {                                                  // 기능이 있으면 분홍 네모 안만 소품 동작
            const im = el.querySelector(':scope > img') || el, R = im.getBoundingClientRect(), [l, t, r, b] = dcArea(o);
            const px = (x - R.left) / R.width * 100, py = (y - R.top) / R.height * 100;
            if (px < l || px > r || py < t || py > b) return false;
        }
        if (K.act === 'lamp') { dcCs(o).on = !o.cs.on; dcSave(o); }
        return true;
    }
    /* ⏰ 알람 : 1초마다 (책상 화면) · 그 분 0초 ~ 59초 사이 한 번 · 하루 한 번 (alarm.last = 날짜) */
    function dcRingStop() { const el = DC.ring && document.querySelector(`#deskStage .desk-item[data-u="${DC.ring}"]`); if (el) el.classList.remove('ring'); clearInterval(DC.ringT); DC.ring = null; }
    setInterval(() => {
        if (typeof DK === 'undefined' || !DK.items || DC.ring) return;
        const n = new Date(), hm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'), day = n.toDateString();
        const o = DK.items.find(x => x.at === 'desk' && x.cs && x.cs.alarm && x.cs.alarm.on && x.cs.alarm.t === hm && x.cs.alarm.last !== day); if (!o) return;
        o.cs.alarm.last = day; dkPersist(o);
        const el = document.querySelector(`#deskStage .desk-item[data-u="${o.u}"]`); if (el) el.classList.add('ring');
        DC.ring = o.u; dcBeep(); let k = 0; DC.ringT = setInterval(() => { if (++k > 20) dcRingStop(); else dcBeep(); }, 1500);   // 30초 동안
        if (window.showMsg) showMsg(`⏰ ${hm} 알람이에요!`).then(() => dcRingStop());
    }, 1000);

    window.dcOpen = dcOpen; window.dcTab = dcTab; window.dcPaint = dcPaint; window.dcLamp = dcLamp; window.dcLight = dcLight; window.dcFont = dcFont; window.dcInk = dcInk;
    window.dcAlarm = dcAlarm; window.dcRingTest = dcRingTest; window.dcPhoto = dcPhoto;
    window.dcAreaReset = dcAreaReset; window.dcAreaSave = dcAreaSave; window.dcApply = dcApply; window.dcApplyAll = dcApplyAll; window.dcTap = dcTap;
})();
