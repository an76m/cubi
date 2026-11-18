/* 말랑달콤 다이어리 - js/padtour.js
   🎓 그림판 따라 보기 (도련 11-19 · 1305) : 글 대신 · 예시를 고르면 진짜 그림판에서 마우스가 움직이며 메뉴를 눌러 만드는 과정을 보여 줘요
   - 🧩 CSS · 🌀 SVG · 🔗 섞기 × 초급 · 중급 · 고급 (예시 = 공식 기능을 이렇게 쓴다는 순서 · 기능 목록에는 안 섞여요)
   - 연습 종이 (js/padpaint.js ppTourHook) : 지금 그림은 보관 → 빈 종이에서 만들고 → 끝나면 ✔ 내 그림에 가져가기 · ✕ 그냥 닫기
   - 조절 : ⏸ 멈춤 · ▶ 이어서 · ⏭ 다음 한 걸음 · ↺ 처음부터 · 🐢 🐇 빠르기 · ✋ 따라 하기 (반짝이는 곳을 내가 눌러요)
   - 걸음 = { c: 누를 곳 } · { v: 칸, val: 값 } · { pick: 고르는 칸, opt: 글자 } · { drag: [[가로, 세로] 비율 …] } · { say: 말풍선 }
     누를 곳 · 칸 = css 선택자 (그때그때 찾아요 · 오른쪽 칸은 다시 그려지니까) 또는 함수
   ⚠ 그림판 메뉴 (data-m · data-cb · data-sbel · data-sbb · data-cf) 를 바꾸면 여기도 · tests/t_padtour.py 가 예시마다 끝까지 돌려 봐요 */
(function () {
    'use strict';
    const $ = s => document.querySelector(s);
    const M = m => `#ppBarX [data-m="${m}"]`, CBT = t => `#ppTools [data-cb="${t}"]`, SBE = t => `#ppTools [data-sbel="${t}"]`, SBB = t => `#ppTools [data-sbb="${t}"]`, PT = t => `#ppTools [data-t="${t}"]`;
    const CF = (p, k) => `#ppProp .pp-cbk.open ${k || 'input'}[data-cf$="|${p}"]${k ? '' : ':not(.nb)'}`;                       // 🧩 열린 기능 칸
    const SF = (p, k) => `#ppProp .pp-cbk.sbe.picked > .pp-cbf > .pp-cf ${k || 'input'}[data-cf$="|${p}"]${k ? '' : ':not(.nb)'}`;   // 🌀 고른 도형 칸
    const SK = (p, k) => `#ppProp .pp-cbk.sb.open ${k || 'input'}[data-cf$="|${p}"]${k ? '' : ':not(.nb)'}`;                        // 🌀 열린 기능 칸
    const OPEN1 = '#ppProp .pp-cbk:not(.open) [data-cbo]';
    const eye = t => () => { const id = window.ppTourHook && ppTourHook.layerOf(t); return id == null ? null : $(`#ppLy .pp-ly[data-id="${id}"] .eye`); };
    const W = () => (window.ppTest ? ppTest().W : 900), H = () => (window.ppTest ? ppTest().H : 1200);
    const star = () => { const w = W(), h = H(), cx = w / 2, cy = h * .4, R = w * .28, r = R * .45, p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; p.push(`${Math.round(cx + Math.cos(a) * q)} ${Math.round(cy + Math.sin(a) * q)}`); } return 'M ' + p.join(' L ') + ' Z'; };
    const heart = () => { const w = W(), h = H(), cx = w / 2, y = h * .28, s = w * .3, R = n => Math.round(n); return `M ${R(cx)} ${R(y + s * 1.25)} C ${R(cx - s * 1.6)} ${R(y + s * .4)} ${R(cx - s * .9)} ${R(y - s * .6)} ${R(cx)} ${R(y + s * .15)} C ${R(cx + s * .9)} ${R(y - s * .6)} ${R(cx + s * 1.6)} ${R(y + s * .4)} ${R(cx)} ${R(y + s * 1.25)} Z`; };

    /* ---------- 예시 9개 (그룹 × 단계) ---------- */
    const TOUR = [
        { g: 'css', lv: 1, e: '🎀', n: '둥근 분홍 상자', d: '바탕색 · 둥근 모서리 · 그림자', s: [
            { c: M('css'), say: '🧩 CSS 로 가요 · 상자 하나가 생겨요' },
            { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' },
            { c: OPEN1, say: '바탕색 기능을 열어요' },
            { v: CF('v.c.c'), val: '#ff9ab8', say: '분홍으로 바꿔요' },
            { c: CBT('border-radius'), say: '⬜ 둥근 모서리를 붙여요' },
            { v: CF('v.r.n'), val: 60, say: '얼마나 둥글게 할지' },
            { c: CBT('shadow'), say: '🌑 그림자를 붙여요' },
            { v: CF('v.y.n'), val: 16, say: '아래로 조금' },
            { v: CF('v.b.n'), val: 34, say: '부드럽게 번지게 · 완성!' }] },
        { g: 'css', lv: 2, e: '🍬', n: '땡땡이 무늬', d: '원형 그라데이션 하나를 작게 반복', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' },
            { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' },
            { c: OPEN1, say: '바탕색을 열어요' },
            { v: CF('v.c.c'), val: '#fff4f8', say: '연한 바탕' },
            { c: CBT('radial-gradient'), say: '🔆 원형 그라데이션을 붙여요' },
            { pick: CF('v.size', 'select'), opt: 'closest-side', say: '가장 가까운 변까지만 퍼지게' },
            { v: CF('v.stops.s.0.c.c'), val: '#ff8fb1', say: '가운데 색 = 분홍' },
            { v: CF('v.stops.s.1.c.c'), val: '#ff8fb1', say: '끝 색도 분홍' },
            { v: CF('v.stops.s.1.p'), val: 45, say: '45% 까지만 분홍' },
            { c: '#ppProp .pp-cbk.open [data-cbst]', say: '색을 하나 더 넣어요' },
            { v: CF('v.stops.s.2.c.a'), val: 0, say: '세 번째 색은 투명하게' },
            { v: CF('v.stops.s.2.p'), val: 47, say: '바로 뒤에서 뚝 끊겨요 = 동그라미' },
            { pick: CF('L.sz', 'select'), opt: 'w h', say: '🧭 놓는 방법 : 크기를 직접 정해요' },
            { v: CF('L.w.n'), val: 44, say: '한 칸 가로' },
            { v: CF('L.h.n'), val: 44, say: '한 칸 세로 · 반복되면 땡땡이!' },
            { c: CBT('border-radius'), say: '모서리도 둥글게' },
            { v: CF('v.r.n'), val: 40, say: '완성!' }] },
        { g: 'css', lv: 3, e: '💗', n: '흔들리는 하트 장식', d: '장식 1 (::before) · 글자 · 움직임', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' },
            { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' },
            { c: OPEN1, say: '바탕색을 열어요' },
            { v: CF('v.c.c'), val: '#cdeaff', say: '하늘색 상자' },
            { c: CBT('border-radius'), say: '둥글게' },
            { v: CF('v.r.n'), val: 50, say: '' },
            { c: '#ppProp [data-cbpart="pb"]', say: '✨ 장식 1 (::before) 을 골라요 · 본체 위에 붙는 작은 상자' },
            { c: CBT('content'), say: '💬 장식 글자를 붙여요' },
            { v: CF('v.t'), val: '💗', say: '하트 이모지' },
            { c: CBT('font-size'), say: '🔠 글자 크기' },
            { v: CF('v.s.n'), val: 120, say: '크게' },
            { c: CBT('left'), say: '⇥ 왼쪽에서 얼마나' },
            { v: CF('v.v.n'), val: 62, say: '오른쪽 위로 옮겨요' },
            { c: CBT('top'), say: '⤓ 위에서 얼마나' },
            { v: CF('v.v.n'), val: 0, say: '맨 위로' },
            { c: CBT('animation'), say: '🎬 움직임을 붙여요 · 흔들흔들' },
            { v: CF('v.dur'), val: .8, say: '빠르게 흔들려요 · 완성!' }] },
        { g: 'svg', lv: 1, e: '⭐', n: '노란 별', d: '패스 · 칠 · 선', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 패스 도형을 넣어요' },
            { v: SF('v.d'), val: star, say: '길 d 에 별 모양 점을 적어요 (M 이동 · L 직선 · Z 닫기)' },
            { c: SBB('fill'), say: '🎨 칠을 붙여요' },
            { v: SK('v.c.c'), val: '#ffd23f', say: '노랑' },
            { c: SBB('stroke'), say: '🖍 선 색' },
            { v: SK('v.c.c'), val: '#ff8fb1', say: '분홍 선' },
            { c: SBB('stroke-width'), say: '📏 선 굵기' },
            { v: SK('v.v'), val: 14, say: '' },
            { c: SBB('stroke-linejoin'), say: '📐 꺾이는 곳을 둥글게 · 완성!' }] },
        { g: 'svg', lv: 2, e: '💜', n: '점선 하트 + 그라데이션', d: '그라데이션 칠 · 점선 · 둥근 끝', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 패스 도형' },
            { v: SF('v.d'), val: heart, say: '하트 모양 (C = 곡선)' },
            { c: SBB('linearGradient'), say: '🌈 직선 그라데이션으로 칠해요' },
            { c: SBB('stroke'), say: '🖍 선 색' },
            { v: SK('v.c.c'), val: '#7a4fd6', say: '보라 선' },
            { c: SBB('stroke-width'), say: '📏 선 굵기' },
            { v: SK('v.v'), val: 10, say: '' },
            { c: SBB('stroke-dasharray'), say: '┅ 점선으로' },
            { v: SK('v.a'), val: 4, say: '짧은 선' },
            { v: SK('v.b'), val: 18, say: '넓은 빈칸' },
            { c: SBB('stroke-linecap'), say: '⏺ 선 끝 둥글게 = 동글동글 점선 · 완성!' }] },
        { g: 'svg', lv: 3, e: '🌀', n: '물결 상자 + 길 따라 도는 별', d: '필터 두 단계 · 길 따라 움직이기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('rect'), say: '⬛ 네모 도형' },
            { c: SBB('fill'), say: '🎨 칠' },
            { v: SK('v.c.c'), val: '#c4b2f2', say: '연보라' },
            { c: SBB('feTurbulence'), say: '🪄 필터 1 : 노이즈 만들기 (보이지 않는 무늬)' },
            { c: SBB('feDisplacementMap'), say: '🪄 필터 2 : 그 무늬대로 일렁이기 = 물결 가장자리' },
            { c: SBE('circle'), say: '⚪ 원을 하나 더 넣어요' },
            { v: SF('v.r'), val: 34, say: '작게' },
            { c: SBB('fill'), say: '🎨 칠' },
            { v: SK('v.c.c'), val: '#ffd23f', say: '노랑' },
            { c: SBB('animateMotion'), say: '🛤 길 따라 움직이기 · 완성!' }] },
        { g: 'mix', lv: 1, e: '🫧', n: 'SVG 원에 CSS 효과', d: 'SVG 도형 + CSS 그림자 · CSS 움직임', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪ 원' },
            { c: SBB('fill'), say: '🎨 칠' },
            { v: SK('v.c.c'), val: '#5cc98a', say: '초록' },
            { c: SBB('css-drop-shadow'), say: '🫥 CSS 모양 그림자 (SVG 에 CSS 를 써요)' },
            { v: SK('v.y'), val: 14, say: '' },
            { c: SBB('css-animation'), say: '🎬 CSS 움직임 (@keyframes) · 두근두근' },
            { v: SK('v.b'), val: 1.25, say: '얼마나 커질지 · 완성!' }] },
        { g: 'mix', lv: 2, e: '🌊', n: 'CSS 상자에 SVG 물결', d: 'SVG 필터를 만들고 CSS 상자에 입혀요', s: [
            { c: M('svg'), say: '🌀 먼저 SVG 에서 필터를 만들어요' },
            { c: SBE('rect'), say: '⬛ 네모 (필터를 붙일 도형)' },
            { c: SBB('feTurbulence'), say: '🪄 노이즈 만들기' },
            { c: SBB('feDisplacementMap'), say: '🪄 일렁이기 = 물결 필터 완성' },
            { c: eye('svg'), say: '👁 SVG 레이어는 숨겨요 (필터만 빌려 쓸 거예요)' },
            { c: M('css'), say: '🧩 이제 CSS 로' },
            { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' },
            { c: OPEN1, say: '바탕색' },
            { v: CF('v.c.c'), val: '#ff9ab8', say: '분홍' },
            { c: CBT('border-radius'), say: '둥글게' },
            { v: CF('v.r.n'), val: 50, say: '' },
            { c: CBT('svg-filter'), say: '🌀 SVG 필터 쓰기 (CSS → SVG)' },
            { pick: CF('v.ref', 'select'), opt: 1, say: '아까 만든 물결 필터를 골라요 · 완성!' }] },
        { g: 'mix', lv: 3, e: '💞', n: '벡터 하트를 CSS 무늬로', d: '레이어를 그림으로 · 반복 · 움직임', s: [
            { c: M('vec'), say: '✒️ 벡터로 하트를 그려요' },
            { c: PT('heart'), say: '♡ 하트 도구' },
            { drag: [[.32, .3], [.68, .58]], say: '종이 위를 끌어요' },
            { c: eye('vec'), say: '👁 벡터 레이어는 숨겨요 (무늬로만 쓸 거예요)' },
            { c: M('css'), say: '🧩 CSS 로' },
            { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' },
            { c: OPEN1, say: '바탕색' },
            { v: CF('v.c.c'), val: '#fff4f8', say: '연한 바탕' },
            { c: CBT('url'), say: '🖼️ 그림 깔기' },
            { pick: '#ppProp .pp-cbk.open select[data-cbly]', opt: '벡터', say: '🗂️ 그림판 레이어 = 아까 그린 하트' },
            { pick: CF('L.sz', 'select'), opt: 'w h', say: '🧭 크기를 직접' },
            { pick: CF('L.w.u', 'select'), opt: 'px', say: '단위를 px 로' },
            { v: CF('L.w.n'), val: 90, say: '한 칸 가로 90px' },
            { pick: CF('L.h.u', 'select'), opt: 'px', say: '' },
            { v: CF('L.h.n'), val: 90, say: '한 칸 세로 90px' },
            { pick: CF('L.rep', 'select'), opt: 'repeat', say: '🔁 반복 = 하트 무늬' },
            { c: CBT('animation'), say: '🎬 흔들흔들 · 완성!' }] }
    ];
    const GN = { css: '🧩 CSS', svg: '🌀 SVG', mix: '🔗 섞기' }, LV = ['', '초급', '중급', '고급'];

    /* ---------- 화면 ---------- */
    const T = { on: false, run: 0, i: 0, ex: null, pause: false, step: false, speed: 1, follow: false, fast: false };
    const wait = ms => new Promise(r => setTimeout(r, T.fast ? 0 : ms / T.speed));
    async function hold() { while (T.on && T.pause && !T.step) await new Promise(r => setTimeout(r, 80)); T.step = false; }
    function ui() {
        if ($('#ptCur')) return;
        const d = document.createElement('div'); d.id = 'ptWrap';
        d.innerHTML = `<div id="ptCur" class="pt-cur" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 2 L3 19 L8 14.5 L11.5 22 L14.5 20.6 L11 13.3 L17.5 13 Z" fill="#fff" stroke="#3d3552" stroke-width="1.6" stroke-linejoin="round"/></svg><i></i></div>
            <div id="ptBub" class="pt-bub"></div><div id="ptRing" class="pt-ring"></div>
            <div id="ptBar" class="pt-bar"><b id="ptT"></b><span id="ptN"></span><button type="button" data-pt="play">⏸</button><button type="button" data-pt="next" title="다음 한 걸음">⏭</button><button type="button" data-pt="again" title="처음부터">↺</button><button type="button" data-pt="slow" title="느리게">🐢</button><button type="button" data-pt="fast" title="빠르게">🐇</button><button type="button" data-pt="follow" title="반짝이는 곳을 내가 눌러요">✋ 따라 하기</button><button type="button" data-pt="stop">✕ 끝내기</button></div>`;
        document.body.appendChild(d);
        $('#ptBar').onclick = e => { const b = e.target.closest('[data-pt]'); if (!b) return; const k = b.dataset.pt;
            if (k === 'play') { T.pause = !T.pause; b.textContent = T.pause ? '▶' : '⏸'; }
            if (k === 'next') { T.pause = true; T.step = true; $('#ptBar [data-pt="play"]').textContent = '▶'; }
            if (k === 'again') restart();
            if (k === 'slow') T.speed = Math.max(.5, T.speed / 1.5); if (k === 'fast') T.speed = Math.min(4, T.speed * 1.5);
            if (k === 'follow') { T.follow = !T.follow; b.classList.toggle('on', T.follow); }
            if (k === 'stop') finish(false); };
    }
    function gone() { const w = $('#ptWrap'); if (w) w.remove(); }
    function bub(t) { const b = $('#ptBub'); if (!b) return; b.textContent = t || ''; b.style.display = t ? 'block' : 'none'; }
    async function moveTo(el) {
        const c = $('#ptCur'); if (!c || !el) return; el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        const r = el.getBoundingClientRect(), x = r.left + Math.min(r.width / 2, 40), y = r.top + r.height / 2;
        c.style.transitionDuration = (T.fast ? 0 : 650 / T.speed) + 'ms'; c.style.left = x + 'px'; c.style.top = y + 'px';
        const b = $('#ptBub'); if (b) { b.style.left = Math.min(innerWidth - 300, x + 24) + 'px'; b.style.top = Math.max(8, y + 26) + 'px'; }
        await wait(700);
    }
    async function tap() { const c = $('#ptCur'); if (!c) return; c.classList.remove('tap'); void c.offsetWidth; c.classList.add('tap'); await wait(260); }
    function ring(el) { const g = $('#ptRing'); if (!g) return; if (!el) { g.style.display = 'none'; return; } const r = el.getBoundingClientRect(); Object.assign(g.style, { display: 'block', left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); }
    const find = t => typeof t === 'function' ? t() : $(t);
    async function get(t) { for (let k = 0; k < 40; k++) { const el = find(t); if (el && el.offsetParent !== null) return el; await new Promise(r => setTimeout(r, 50)); } return find(t); }
    function userDid(el, ev) { return new Promise(ok => { const f = e => { if (e.target === el || el.contains(e.target)) { document.removeEventListener(ev, f, true); ok(true); } }; document.addEventListener(ev, f, true); const s = setInterval(() => { if (!T.on || T.step) { clearInterval(s); document.removeEventListener(ev, f, true); T.step = false; ok(false); } }, 100); }); }
    function setVal(el, v) { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
    async function doStep(s, run) {
        await hold(); if (!T.on || run !== T.run) return false;
        bub(s.say || '');
        if (s.c) { const el = await get(s.c); if (!el) throw new Error('없음 ' + s.c); await moveTo(el);
            if (T.follow) { ring(el); bub((s.say || '') + ' 👉 반짝이는 곳을 눌러요'); const me = await userDid(el, 'click'); ring(null); if (!me) { await tap(); el.click(); } }
            else { await tap(); el.click(); } }
        else if (s.v || s.pick) { const el = await get(s.v || s.pick); if (!el) throw new Error('없음 ' + (s.v || s.pick)); await moveTo(el);
            let val = typeof s.val === 'function' ? s.val() : s.val;
            if (s.pick) { const o = [...el.options]; const op = typeof s.opt === 'number' ? o[s.opt] : o.find(x => x.value === s.opt) || o.find(x => x.textContent.includes(s.opt)); if (!op) throw new Error('고를 것 없음 ' + s.opt); val = op.value; }
            if (T.follow) { ring(el); bub((s.say || '') + ' 👉 여기를 바꿔 봐요 (⏭ = 대신 해 줘요)'); const me = await userDid(el, 'input'); ring(null); if (me) return true; }
            await tap();
            if (el.type === 'range' && !T.fast) { const a = +el.value, b = +val, n = 12; for (let k = 1; k <= n; k++) { setVal(el, Math.round((a + (b - a) * k / n) * 100) / 100); await wait(35); } const nb = el.nextElementSibling; if (nb && nb.classList.contains('nb')) nb.value = el.value; }
            else if (el.type === 'text' && !T.fast && String(val).length < 24) { for (let k = 1; k <= String(val).length; k++) { setVal(el, String(val).slice(0, k)); await wait(60); } }
            else setVal(el, val);
            if (el.type === 'range') { const nb = el.nextElementSibling; if (nb && nb.classList.contains('nb')) nb.value = el.value; } }
        else if (s.drag) { const st = $('#ppStage'), cv = $('#ppCv'); if (!st || !cv) return true; const r = cv.getBoundingClientRect(), pt = ([fx, fy]) => ({ clientX: r.left + r.width * fx, clientY: r.top + r.height * fy });
            const ev = (k, q) => st.dispatchEvent(new PointerEvent(k, Object.assign({ bubbles: true, pointerId: 77, pointerType: 'mouse', button: 0, buttons: k === 'pointerup' ? 0 : 1, isPrimary: true }, q)));
            const c = $('#ptCur'), A = pt(s.drag[0]), B = pt(s.drag[s.drag.length - 1]); c.style.transitionDuration = (T.fast ? 0 : 500 / T.speed) + 'ms'; c.style.left = A.clientX + 'px'; c.style.top = A.clientY + 'px'; await wait(550);
            ev('pointerdown', A); const n = T.fast ? 2 : 16; c.style.transitionDuration = '0ms';
            for (let k = 1; k <= n; k++) { const q = { clientX: A.clientX + (B.clientX - A.clientX) * k / n, clientY: A.clientY + (B.clientY - A.clientY) * k / n }; ev('pointermove', q); c.style.left = q.clientX + 'px'; c.style.top = q.clientY + 'px'; await wait(30); }
            ev('pointerup', B); }
        await wait(s.say ? 900 : 350); return true;
    }
    async function play(ex) {
        const run = ++T.run; T.ex = ex; T.i = 0; $('#ptT').textContent = `${GN[ex.g]} ${LV[ex.lv]} · ${ex.e} ${ex.n}`;
        try {
            for (; T.i < ex.s.length; T.i++) { if (!T.on || run !== T.run) return; $('#ptN').textContent = `${T.i + 1} / ${ex.s.length}`; if (!(await doStep(ex.s[T.i], run))) return; }
        } catch (e) { console.warn('🎓 따라 보기', e); bub('⚠ 메뉴를 찾지 못했어요 · ✕ 끝내기를 눌러요'); T.err = String(e.message || e); return; }
        if (run !== T.run) return; T.done = true; bub(''); ring(null); if (!T.fast) ask();
    }
    function ask() {
        const m = document.createElement('div'); m.className = 'pt-done'; m.id = 'ptDone';
        m.innerHTML = `<b>🎉 완성!</b><small>${T.ex.e} ${T.ex.n}</small><button type="button" data-pd="keep">✔ 내 그림에 가져가기</button><button type="button" data-pd="close">✕ 그냥 닫기</button><button type="button" data-pd="again">↺ 다시 보기</button><button type="button" data-pd="more">🎓 다른 예시</button>`;
        document.body.appendChild(m);
        m.onclick = e => { const b = e.target.closest('[data-pd]'); if (!b) return; m.remove(); const k = b.dataset.pd;
            if (k === 'keep') finish(true); if (k === 'close') finish(false); if (k === 'again') restart(); if (k === 'more') { finish(false); open(); } };
    }
    function restart() { const ex = T.ex; if (!ex) return; const d = $('#ptDone'); if (d) d.remove(); ppTourHook.end(false); ppTourHook.begin(); T.pause = false; const b = $('#ptBar [data-pt="play"]'); if (b) b.textContent = '⏸'; play(ex); }
    function start(ex) {
        if (!window.ppTourHook || !ppTourHook.on) return; if (ppTourHook.busy) ppTourHook.end(false);
        if (!ppTourHook.begin()) return; T.on = true; T.pause = false; T.done = false; T.err = ''; ui(); document.body.classList.add('pt-on'); play(ex);
    }
    function finish(keep) { T.run++; const d = $('#ptDone'); if (d) d.remove(); T.on = false; gone(); document.body.classList.remove('pt-on'); if (window.ppTourHook && ppTourHook.busy) ppTourHook.end(!!keep); }
    /* ---------- 고르는 창 ---------- */
    function open() {
        const old = $('#ptPick'); if (old) old.remove();
        const m = document.createElement('div'); m.id = 'ptPick'; m.className = 'pt-pick';
        m.innerHTML = `<div class="pt-box"><button type="button" class="pt-x" data-pp="x">✕</button><h3>🎓 따라 보기<em>예시를 누르면 마우스가 움직이며 만들어요 · 지금 그림은 그대로 두고 연습 종이에서</em></h3>
            <div class="pt-grid"><span></span>${[1, 2, 3].map(l => `<b class="pt-lv l${l}">${LV[l]}</b>`).join('')}
            ${['css', 'svg', 'mix'].map(g => `<b class="pt-g">${GN[g]}</b>` + [1, 2, 3].map(l => TOUR.filter(x => x.g === g && x.lv === l).map(x => `<button type="button" class="pt-card" data-ex="${TOUR.indexOf(x)}"><i>${x.e}</i><b>${x.n}</b><small>${x.d}</small></button>`).join('')).join('')).join('')}</div>
            <p class="pt-tip">⏸ 멈춤 · ⏭ 한 걸음씩 · 🐢 🐇 빠르기 · ✋ 따라 하기 = 반짝이는 곳을 내가 눌러요</p></div>`;
        document.body.appendChild(m);
        m.onclick = e => { if (e.target === m || e.target.closest('[data-pp="x"]')) { m.remove(); return; } const c = e.target.closest('[data-ex]'); if (c) { m.remove(); start(TOUR[+c.dataset.ex]); } };
    }
    window.padTour = { open, start: i => start(TOUR[i]), finish, TOUR, get state() { return { on: T.on, i: T.i, done: !!T.done, err: T.err || '' }; }, set fast(v) { T.fast = !!v; } };
})();
