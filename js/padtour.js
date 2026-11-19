/* 말랑달콤 다이어리 - js/padtour.js
   🎓 그림판 따라 보기 (도련 11-19 · 1305 · 1306 예시 바꿈 : ✨ 가만히 9 (픽셀 · 벡터로는 어려운 것) + 🎬 움직이는 9 (실험)) : 글 대신 · 예시를 고르면 진짜 그림판에서 마우스가 움직이며 메뉴를 눌러 만드는 과정을 보여 줘요
   - 🧩 CSS · 🌀 SVG · 🔗 섞기 × 초급 · 중급 · 고급 (예시 = 공식 기능을 이렇게 쓴다는 순서 · 기능 목록에는 안 섞여요)
   - 연습 종이 (js/padpaint.js ppTourHook) : 지금 그림은 보관 → 빈 종이에서 만들고 → 끝나면 늘 원래 그림으로 (결과는 가져가지 않아요 · 도련 11-19)
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

    const R = Math.round, HT = (cx, cy, k) => `M ${R(cx)} ${R(cy + k * 1.25)} C ${R(cx - k * 1.6)} ${R(cy + k * .4)} ${R(cx - k * .9)} ${R(cy - k * .6)} ${R(cx)} ${R(cy + k * .15)} C ${R(cx + k * .9)} ${R(cy - k * .6)} ${R(cx + k * 1.6)} ${R(cy + k * .4)} ${R(cx)} ${R(cy + k * 1.25)} Z`;
    const ST = (cx, cy, Ro) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? Ro * .45 : Ro; p.push(`${R(cx + Math.cos(a) * q)} ${R(cy + Math.sin(a) * q)}`); } return 'M ' + p.join(' L ') + ' Z'; };
    const CIR = (cx, cy, r) => `M ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx + r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx - r)} ${R(cy)}`;
    const FLAME = () => { const w = W(), h = H(), cx = w / 2, b = h * .7, k = w * .16; return `M ${R(cx)} ${R(b)} C ${R(cx - k * 1.6)} ${R(b)} ${R(cx - k * 1.7)} ${R(b - k * 1.6)} ${R(cx - k * .9)} ${R(b - k * 2.6)} C ${R(cx - k * .5)} ${R(b - k * 3.2)} ${R(cx - k * .2)} ${R(b - k * 3.6)} ${R(cx)} ${R(b - k * 4.4)} C ${R(cx + k * .6)} ${R(b - k * 3.4)} ${R(cx + k * 1.8)} ${R(b - k * 2.4)} ${R(cx + k * 1.5)} ${R(b - k * 1.1)} C ${R(cx + k * 1.3)} ${R(b - k * .2)} ${R(cx + k * .7)} ${R(b)} ${R(cx)} ${R(b)} Z`; };
    const TAB = { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' }, FOLD = { c: '#ppProp summary[data-cbfold]', say: '📐 상자 자리 · 글자를 펼쳐요' };
    const BOX = (k, v) => ({ v: `#ppProp input[data-cbx="${k}"]`, val: v, say: { x: '상자 가로 자리', y: '상자 세로 자리', w: '상자 폭', h: '상자 높이' }[k] });
    const TXT = t => ({ v: '#ppProp textarea[data-cbtext]', val: t, say: '상자 안 글자를 써요' });
    const PART = (k, say) => ({ c: `#ppProp [data-cbpart="${k}"]`, say });
    const SKN = n => () => [...document.querySelectorAll('#ppProp .pp-cbk.sb .nm')].filter(b => b.textContent.includes(n)).pop();   // 🌀 이름으로 기능 칸 열기
    const CNM = n => () => [...document.querySelectorAll('#ppProp .pp-cbk .nm')].find(b => b.textContent.includes(n) && !b.closest('.pp-cbk').classList.contains('open'));   // 🧩 이름으로 닫힌 기능 칸 열기
    const SKNI = (n, i) => () => [...document.querySelectorAll('#ppProp .pp-cbk.sb .nm')].filter(b => b.textContent.includes(n))[i];   // 🌀 같은 이름 중 i 번째
    const NODE = i => () => [...document.querySelectorAll('#ppProp .pp-cbtree [data-cbnode]')][i];   // 🌳 나무 i 번째 줄 (0 = 맨 위 상자)
    const TIN = { c: '#ppProp [data-cbt="in"]', say: '🌳 ＋ 안에 상자' }, TSIB = { c: '#ppProp [data-cbt="sib"]', say: '🌳 ＋ 옆에 상자 (같은 이름)' }, ROOT = { c: '#ppProp [data-cbnode="root"]', say: '맨 위 상자를 골라요' };
    const NM = n => ({ v: '#ppProp input[data-cbnm]', val: n, say: `🏷️ 이름 (class) = ${n}`, pause: 750 }), NTX = t => ({ v: '#ppProp textarea[data-cbntext]', val: t, say: '이 상자 안 글자' });
    const SDUP = { c: '#ppProp .pp-cbk.sbe.picked [data-sba="dup"][data-k="e"]', say: '⧉ 도형 복제' };
    const CDUP = { c: '#ppProp .pp-cbk.open [data-cba="dup"]', say: '⧉ 같은 기능 한 장 더 (복제)' };
    const ADDST = (sb) => ({ c: `#ppProp .pp-cbk${sb ? '.sb' : ''}.open [data-cbst]`, say: '색을 하나 더 넣어요' });
    const STOP = (F, i, c, p, a) => [{ v: F(`v.stops.s.${i}.c.c`), val: c, say: '' }].concat(p == null ? [] : [{ v: F(`v.stops.s.${i}.p`), val: p, say: '' }]).concat(a == null ? [] : [{ v: F(`v.stops.s.${i}.c.a`), val: a, say: '' }]);
    const GINGHAM = [
        { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 직선 = 줄무늬 한 장' },
        { v: CF('v.ang'), val: 0, say: '가로 줄무늬로' },
        ...STOP(CF, 0, '#ff8fb1', null, 55), ...STOP(CF, 1, '#ff8fb1', null, 55), ...STOP(CF, 2, '#ffffff', null, 0), ...STOP(CF, 3, '#ffffff', null, 0),
        CDUP, { v: CF('v.ang'), val: 90, say: '하나는 세로로 = 겹친 곳이 진해져서 깅엄!' }];

    /* ---------- ✨ 예시 (가만히 · 서비스용) ---------- */
    const TOUR = [
        { m: 's', g: 'css', lv: 1, e: '🧺', n: '깅엄 체크 천', d: '줄무늬 두 장을 겹쳐요', s: [
            { c: M('css'), say: '🧩 CSS 로 가요 · 상자 하나가 생겨요' }, TAB, FOLD, BOX('w', 60), BOX('h', () => Math.round(60 * W() / H() * .85)), BOX('x', 20), BOX('y', 30),
            { c: OPEN1, say: '바탕색을 열어요' }, { v: CF('v.c.c'), val: '#ffffff', say: '하얀 천' },
            { c: CBT('border-radius'), say: '⬜ 둥근 모서리' }, { v: CF('v.r.n'), val: 56, say: '' },
            { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 직선 = 줄무늬 한 장' },
            { v: CF('v.ang'), val: 0, say: '가로 줄무늬로' },
            ...STOP(CF, 0, '#ff8fb1', 0, 50), ...STOP(CF, 1, '#ff8fb1', 50, 50), ...STOP(CF, 2, '#ffffff', 50, 0), ...STOP(CF, 3, '#ffffff', 100, 0),
            CDUP, { v: CF('v.ang'), val: 90, say: '하나는 세로로 = 겹친 곳이 진해져서 깅엄!' }] },
        { m: 's', g: 'css', lv: 2, e: '🌈', n: '글자 안에 무늬', d: '무늬를 글자 모양으로 오려요', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, { c: OPEN1, say: '바탕색' }, { v: CF('v.c.a'), val: 0, say: '상자는 투명하게' }, FOLD, TXT('말랑'),
            { c: CBT('font-size'), say: '🔠 글자 크기' }, { v: CF('v.s.n'), val: 260, say: '아주 크게' },
            { c: CBT('font-weight'), say: '🅱️ 글자 굵기' }, { pick: CF('v.w', 'select'), opt: '900', say: '아주 굵게' },
            { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 줄무늬 (45°)' },
            ...STOP(CF, 0, '#ff5d8f', 0), ...STOP(CF, 1, '#ff5d8f', 34), ...STOP(CF, 2, '#ffd23f', 34), ...STOP(CF, 3, '#ffd23f', 68),
            ADDST(), ...STOP(CF, 4, '#7cc8ff', 68), ADDST(), ...STOP(CF, 5, '#7cc8ff', 102),
            { c: CBT('background-clip'), say: '✂️ 바탕 그릴 곳 = 글자 안에만' },
            { c: CBT('-webkit-text-fill-color'), say: '🫗 글자 속은 투명하게 = 무늬가 보여요 · 완성!' }] },
        { m: 's', g: 'css', lv: 2, e: '🍭', n: '겹테두리 팝 글씨', d: '테두리 + 그림자 세 겹', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB,
            { c: OPEN1, say: '바탕색을 열어요' }, { v: CF('v.c.a'), val: 0, say: '상자는 투명하게 (글씨만)' },
            FOLD, TXT('말랑'),
            { c: CBT('font-size'), say: '🔠 글자 크기' }, { v: CF('v.s.n'), val: 210, say: '' },
            { c: CBT('font-weight'), say: '🅱️ 굵게' }, { pick: CF('v.w', 'select'), opt: '900', say: '' },
            { c: CBT('color'), say: '🖌 글자색' }, { v: CF('v.c.c'), val: '#ffffff', say: '하양' },
            { c: CBT('-webkit-text-stroke'), say: '✒️ 글자 테두리' }, { v: CF('v.w.n'), val: 10, say: '' }, { v: CF('v.c.c'), val: '#ff5d8f', say: '분홍 테두리' },
            { c: CBT('paint-order'), say: '🖊 테두리를 글자 바깥으로' },
            { c: CBT('tshadow'), say: '💬 글자 그림자 1 (맨 아래)' }, { v: CF('v.x.n'), val: 20, say: '' }, { v: CF('v.y.n'), val: 20, say: '' }, { v: CF('v.c.c'), val: '#a37cff', say: '보라' },
            { c: CBT('tshadow'), say: '💬 그림자 2' }, { v: CF('v.x.n'), val: 14, say: '' }, { v: CF('v.y.n'), val: 14, say: '' }, { v: CF('v.c.c'), val: '#7cc8ff', say: '하늘' },
            { c: CBT('tshadow'), say: '💬 그림자 3 (맨 위)' }, { v: CF('v.x.n'), val: 7, say: '' }, { v: CF('v.y.n'), val: 7, say: '' }, { v: CF('v.c.c'), val: '#ffd23f', say: '노랑 · 완성!' }] },
        { m: 's', g: 'css', lv: 3, e: '🎀', n: '새틴 리본 라벨', d: '광택 · 바느질 점선 · 장식으로 리본 꼬리', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, FOLD, BOX('w', 60), BOX('h', 10), BOX('x', 20), BOX('y', 42), TXT('MALANG'),
            { c: CBT('linear-gradient'), say: '🌈 광택 그라데이션' }, { v: CF('v.ang'), val: 180, say: '위에서 아래로' }, ADDST(), ADDST(),
            ...STOP(CF, 0, '#ff9cbb', 0), ...STOP(CF, 1, '#ff6f97', 45), ...STOP(CF, 2, '#f25485', 55), ...STOP(CF, 3, '#ff86a8', 100),
            { c: CBT('color'), say: '🖌 글자색' }, { v: CF('v.c.c'), val: '#ffffff', say: '' },
            { c: CBT('font-size'), say: '🔠' }, { v: CF('v.s.n'), val: 54, say: '' },
            { c: CBT('letter-spacing'), say: '↔️ 글자 사이' }, { v: CF('v.s.n'), val: 5, say: '' },
            { c: CBT('tshadow'), say: '💬 글자 그림자' }, { v: CF('v.x.n'), val: 0, say: '' }, { v: CF('v.y.n'), val: 2, say: '' }, { v: CF('v.c.c'), val: '#b8325a', say: '' },
            { c: CBT('outline'), say: '⭕ 바깥 테두리 = 바느질' }, { pick: CF('v.s', 'select'), opt: 'dashed', say: '점선' }, { v: CF('v.w.n'), val: 2, say: '' }, { v: CF('v.c.c'), val: '#ffffff', say: '' }, { v: CF('v.c.a'), val: 75, say: '' },
            { c: CBT('outline-offset'), say: '↔ 안쪽으로 당기기' }, { v: CF('v.o.n'), val: -9, say: '' },
            PART('pb', '✨ 장식 1 = 왼쪽 리본 꼬리'),
            { c: CBT('border-top'), say: '⬆️ 위 테두리' }, { v: CF('v.w.n'), val: 52, say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-bottom'), say: '⬇️ 아래 테두리' }, { v: CF('v.w.n'), val: 52, say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-left'), say: '⬅️ 왼쪽 테두리를 투명하게 = V 홈' }, { v: CF('v.w.n'), val: 40, say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            { c: CBT('height'), say: '↕️ 높이 0 = 테두리만 남아요' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 0, say: '' }, { c: CBT('width'), say: '↔️ 꼬리 폭' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 140, say: '' },
            { c: CBT('left'), say: '⇥ 왼쪽 밖으로' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: -96, say: '' },
            { c: CBT('top'), say: '⤓ 조금 아래로' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 36, say: '' },
            { c: CBT('z-index'), say: '🗂 본체 뒤로' }, { v: CF('v.v'), val: -1, say: '' },
            PART('pa', '✨ 장식 2 = 오른쪽 꼬리'),
            { c: CBT('border-top'), say: '' }, { v: CF('v.w.n'), val: 52, say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-bottom'), say: '' }, { v: CF('v.w.n'), val: 52, say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-right'), say: '➡️ 오른쪽을 투명하게' }, { v: CF('v.w.n'), val: 40, say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            { c: CBT('height'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 0, say: '' }, { c: CBT('width'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 140, say: '' },
            { c: CBT('left'), say: '⇥ 오른쪽 끝에 붙여요' }, { v: CF('v.v.n'), val: 92, say: '' },
            { c: CBT('top'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 36, say: '' },
            { c: CBT('z-index'), say: '' }, { v: CF('v.v'), val: -1, say: '완성!' }] },
        { m: 's', g: 'svg', lv: 1, e: '🔴', n: '동그란 도장 로고', d: '원 따라 글자를 둘러요', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪ 원' }, { v: SF('v.r'), val: () => W() * .34, say: '크게' },
            { c: SBB('fill'), say: '🎨 칠' }, { v: SK('v.c.a'), val: 0, say: '속은 비워요' },
            { c: SBB('stroke'), say: '🖍 선 색' }, { v: SK('v.c.c'), val: '#d64b6e', say: '도장 빨강' },
            { c: SBB('stroke-width'), say: '📏 선 굵기' }, { v: SK('v.v'), val: 9, say: '' },
            SDUP, { v: SF('v.r'), val: () => W() * .19, say: '안쪽 원' },
            { c: SKN('선 굵기'), say: '선 굵기를 열어요' }, { v: SK('v.v'), val: 4, say: '얇게' },
            { c: SBE('textPath'), say: '➰ 길 따라 글자' }, { v: SF('v.d'), val: () => CIR(W() / 2, H() / 2, W() * .265), say: '원 모양 길' },
            { v: SF('v.t'), val: 'MALANG DALKOM · DIARY · 2026 · ', say: '둘러쓸 글자' },
            { c: SBB('fill'), say: '🎨 글자색' }, { v: SK('v.c.c'), val: '#d64b6e', say: '' },
            { c: SBB('font-size'), say: '🔠' }, { v: SK('v.v'), val: () => W() / 13, say: '' },
            { c: SBB('letter-spacing'), say: '↔️ 글자 사이' }, { v: SK('v.v'), val: 8, say: '' },
            { c: SBE('path'), say: '✒️ 가운데 하트' }, { v: SF('v.d'), val: () => HT(W() / 2, H() / 2 - W() * .07, W() * .09), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#d64b6e', say: '완성!' }] },
        { m: 's', g: 'svg', lv: 2, e: '🥇', n: '금박 글씨', d: '그라데이션 + 빛 비추기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('text'), say: '🔤 글자' }, { v: SF('v.t', 'textarea'), val: 'Gold', say: '' },
            { c: SBB('font-size'), say: '🔠' }, { v: SK('v.v'), val: () => W() / 3.4, say: '' },
            { c: SBB('font-family'), say: '🅰️ 글꼴' }, { pick: SK('v.v', 'select'), opt: 'serif', say: '명조' },
            { c: SBB('linearGradient'), say: '🌈 금색 그라데이션' }, { v: SK('v.x2'), val: 0, say: '위에서 아래로' }, { v: SK('v.y2'), val: 100, say: '' },
            ADDST(1), ADDST(1), ...STOP(SK, 0, '#fff3b0', 0), ...STOP(SK, 1, '#e2a93b', 45), ...STOP(SK, 2, '#b8791f', 55), ...STOP(SK, 3, '#ffe08a', 100),
            { c: SBB('feGaussianBlur'), say: '🪄 1 : 모양을 살짝 흐리게 (높이 지도)' }, { pick: SK('v.in', 'select'), opt: 'SourceAlpha', say: '' }, { v: SK('v.s'), val: 3, say: '' },
            { c: SBB('feSpecularLighting'), say: '🪄 2 : 반짝 빛 비추기' }, { v: SK('v.ss'), val: 5, say: '' }, { v: SK('v.sc'), val: 1.2, say: '' }, { v: SK('v.se'), val: 30, say: '' }, { v: SK('v.el'), val: 40, say: '' },
            { c: SBB('feComposite'), say: '🪄 3 : 빛을 글자 안에만' }, { pick: SK('v.in2', 'select'), opt: 'SourceAlpha', say: '' }, { pick: SK('v.op', 'select'), opt: 'in', say: '' },
            { c: SBB('feMerge'), say: '🪄 4 : 글자 위에 빛 얹기' }, { pick: SK('v.a', 'select'), opt: 'SourceGraphic', say: '' }, { pick: SK('v.b', 'select'), opt: 'prev', say: '' }, { pick: SK('v.c', 'select'), opt: 'prev', say: '완성!' }] },
        { m: 's', g: 'svg', lv: 3, e: '💗', n: '말랑 젤리 스티커', d: '빛을 비춰 볼록하게', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 하트' }, { v: SF('v.d'), val: () => HT(W() / 2, H() * .32, W() * .3), say: '' },
            { c: SBB('fill'), say: '🎨' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' },
            { c: SBB('feGaussianBlur'), say: '🪄 1 : 가장자리를 둥글게 흐린 높이 지도' }, { pick: SK('v.in', 'select'), opt: 'SourceAlpha', say: '' }, { v: SK('v.s'), val: 12, say: '' },
            { c: SBB('feSpecularLighting'), say: '🪄 2 : 전구 빛을 비춰요' }, { v: SK('v.ss'), val: 9, say: '볼록하게' }, { v: SK('v.sc'), val: 1.1, say: '' }, { v: SK('v.se'), val: 18, say: '' },
            { pick: SK('v.lt', 'select'), opt: 'point', say: '점 빛 (전구)' }, { v: SK('v.lx'), val: () => W() * .36, say: '' }, { v: SK('v.ly'), val: () => H() * .24, say: '' }, { v: SK('v.lz'), val: 260, say: '' },
            { c: SBB('feComposite'), say: '🪄 3 : 빛을 하트 안에만' }, { pick: SK('v.in2', 'select'), opt: 'SourceAlpha', say: '' }, { pick: SK('v.op', 'select'), opt: 'in', say: '' },
            { c: SBB('feMerge'), say: '🪄 4 : 하트 위에 빛' }, { pick: SK('v.a', 'select'), opt: 'SourceGraphic', say: '' }, { pick: SK('v.b', 'select'), opt: 'prev', say: '' }, { pick: SK('v.c', 'select'), opt: 'prev', say: '말랑 젤리 완성!' }] },
        { m: 's', g: 'mix', lv: 2, e: '🩷', n: '체크무늬 하트 스티커', d: 'CSS 무늬를 SVG 하트로 오리고 칼선', s: [
            { c: M('svg'), say: '🌀 먼저 SVG 로 하트 모양과 칼선 필터를 만들어요' },
            { c: SBE('path'), say: '✒️ 하트' }, { v: SF('v.d'), val: () => HT(W() / 2, H() * .3, W() * .3), say: '' },
            { c: SBB('fill'), say: '🎨 하양으로 (가리개로 쓸 때 밝은 곳이 보여요)' }, { v: SK('v.c.c'), val: '#ffffff', say: '' },
            { c: SBB('feMorphology'), say: '🪄 1 : 모양을 두껍게' }, { pick: SK('v.in', 'select'), opt: 'SourceAlpha', say: '' }, { v: SK('v.r'), val: 14, say: '' },
            { c: SBB('feFlood'), say: '🪄 2 : 하양 붓기' },
            { c: SBB('feComposite'), say: '🪄 3 : 두꺼운 모양 안에만 하양 = 칼선' }, { pick: SK('v.in', 'select'), opt: 'prev', say: '' }, { pick: SK('v.in2', 'select'), opt: 'r1', say: '' }, { pick: SK('v.op', 'select'), opt: 'in', say: '' },
            { c: SBB('feDropShadow'), say: '🪄 4 : 그림자' }, { v: SK('v.dy'), val: 8, say: '' },
            { c: SBB('feMerge'), say: '🪄 5 : 칼선 위에 원래 그림' }, { pick: SK('v.a', 'select'), opt: 'prev', say: '' }, { pick: SK('v.b', 'select'), opt: 'SourceGraphic', say: '' }, { pick: SK('v.c', 'select'), opt: 'SourceGraphic', say: '' },
            { c: eye('svg'), say: '👁 SVG 레이어는 숨겨요 (모양 · 필터만 빌려요)' },
            { c: M('css'), say: '🧩 이제 CSS 로 깅엄 무늬' }, TAB, { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#ffffff', say: '' },
            ...GINGHAM,
            { c: CBT('m-url'), say: '🎭 가리기 · 그림 (CSS → SVG)' }, { pick: '#ppProp .pp-cbk.open select[data-cbly]', opt: 'SVG', say: '🗂️ 아까 그린 SVG 하트 모양으로' },
            { c: CBT('svg-filter'), say: '🌀 SVG 필터 쓰기' }, { pick: CF('v.ref', 'select'), opt: 1, say: '하얀 칼선 필터 · 완성!' }] },
        { m: 's', g: 'mix', lv: 3, e: '📷', n: '밤하늘 폴라로이드', d: 'CSS 상자 나무 (사진 · 글씨 · 테이프) + SVG 별', s: [
            { c: M('css'), say: '🧩 CSS 로 폴라로이드 종이' }, TAB, FOLD, BOX('w', 46), BOX('h', () => Math.round(46 * W() / H() * 1.26)), BOX('x', 27), BOX('y', 20),
            { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#fffdf8', say: '크림색 종이' },
            { c: CBT('padding'), say: '🔳 안쪽 여백' }, { v: CF('v.v.n'), val: 22, say: '' },
            { c: CBT('shadow'), say: '🌑 그림자' }, { v: CF('v.y.n'), val: 16, say: '' }, { v: CF('v.b.n'), val: 34, say: '' }, { v: CF('v.c.a'), val: 30, say: '' },
            { c: CBT('rotate'), say: '🔄 살짝 기울여요 (안에 든 것도 같이)' }, { v: CF('v.v'), val: 3, say: '' },
            { c: CBT('flex-direction'), say: '🌳 안에 든 상자를 위아래로' }, { pick: CF('v.m', 'select'), opt: 'column', say: '' },
            { c: CBT('justify-content'), say: '' }, { pick: CF('v.m', 'select'), opt: 'flex-start', say: '위에서부터' },
            TIN, NM('사진'),
            { c: CNM('폭'), say: '사진 폭' }, { v: CF('v.v.n'), val: 100, say: '' }, { c: CNM('높이'), say: '사진 높이' }, { v: CF('v.v.n'), val: 76, say: '' },
            { c: CBT('linear-gradient'), say: '🌈 밤하늘' }, { v: CF('v.ang'), val: 180, say: '' }, ...STOP(CF, 0, '#2b2a5c'), ...STOP(CF, 1, '#ff9eb8'),
            { c: CBT('radial-gradient'), say: '🔆 별빛 점' }, { pick: CF('v.size', 'select'), opt: 'closest-side', say: '' }, ...STOP(CF, 0, '#ffffff'), ...STOP(CF, 1, '#ffffff', 22), ADDST(), ...STOP(CF, 2, '#ffffff', 26, 0),
            { c: '#ppProp .pp-cbk.open summary[data-cblay]', say: '🧭 놓는 방법' }, { pick: CF('L.sz', 'select'), opt: 'w h', say: '' }, { v: CF('L.w.n'), val: 30, say: '' }, { v: CF('L.h.n'), val: 30, say: '반복 = 별빛' },
            ROOT, TIN, NM('글씨'), NTX('별 보던 밤 ✦'),
            { c: CNM('바탕색'), say: '' }, { v: CF('v.c.a'), val: 0, say: '바탕은 투명' }, { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 100, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 22, say: '' },
            { c: CBT('font-family'), say: '🔤 손글씨 글꼴' }, { pick: CF('v.f', 'select'), opt: 'Gaegu', say: '' },
            { c: CBT('font-size'), say: '' }, { v: CF('v.s.n'), val: 46, say: '' }, { c: CBT('color'), say: '' }, { v: CF('v.c.c'), val: '#6b4a5a', say: '' },
            ROOT, TIN, NM('테이프'),
            { c: CBT('repeating-linear-gradient'), say: '🔁 하늘 줄무늬 마테' }, ...STOP(CF, 0, '#b3e5ff'), ...STOP(CF, 1, '#b3e5ff', 12), ...STOP(CF, 2, '#e6f6ff', 12), ...STOP(CF, 3, '#e6f6ff', 24),
            { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 34, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 8, say: '' },
            { c: CBT('position'), say: '📍 직접 자리 (absolute)' }, { c: CBT('left'), say: '' }, { v: CF('v.v.n'), val: 0, say: '' }, { c: CBT('top'), say: '' }, { v: CF('v.v.n'), val: 0, say: '' },
            { c: CBT('translateX'), say: '' }, { v: CF('v.v.n'), val: -35, say: '' }, { c: CBT('rotate'), say: '🔄 비스듬히' }, { v: CF('v.v'), val: -38, say: '' },
            TSIB, NM('테이프2'), { c: CNM('왼쪽에서'), say: '오른쪽 아래로' }, { v: CF('v.v.n'), val: 80, say: '' }, { c: CNM('위에서'), say: '' }, { v: CF('v.v.n'), val: 93, say: '' },
            { c: M('svg'), say: '🌀 SVG 로 별 스티커' },
            { c: SBE('path'), say: '⭐' }, { v: SF('v.d'), val: () => ST(W() * .38, H() * .3, W() * .04), say: '' }, { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#fff6c8', say: '' },
            { c: SBE('use'), say: '🪞 복사해 찍기' }, { v: SF('v.x'), val: () => W() * .13, say: '' }, { v: SF('v.y'), val: () => H() * .025, say: '' },
            { c: SBE('use'), say: '🪞 한 번 더' }, { v: SF('v.x'), val: () => W() * .1, say: '' }, { v: SF('v.y'), val: () => -H() * .04, say: '완성!' }] },
        /* ---------- 🎬 움직이는 예시 (실험용 · 도련 개인) ---------- */
        { m: 'a', g: 'css', lv: 1, e: '🍭', n: '빙글빙글 막대사탕', d: '상자 나무 (사탕 · 막대) + 부채꼴 + 돌기', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, FOLD, BOX('w', 40), BOX('h', () => Math.round(40 * W() / H() * 1.7)), BOX('x', 30), BOX('y', 18),
            { c: OPEN1, say: '' }, { v: CF('v.c.a'), val: 0, say: '맨 위 상자는 투명하게' },
            { c: CBT('flex-direction'), say: '🌳 사탕 · 막대를 위아래로' }, { pick: CF('v.m', 'select'), opt: 'column', say: '' },
            TIN, NM('사탕'),
            { c: CNM('바탕색'), say: '' }, { v: CF('v.c.c'), val: '#ffffff', say: '' }, { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 100, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 59, say: '' },
            { c: CBT('border-radius'), say: '⬜ 동그랗게' }, { pick: CF('v.r.u', 'select'), opt: '%', say: '' }, { v: CF('v.r.n'), val: 50, say: '' },
            { c: CBT('repeating-conic-gradient'), say: '🌞 되풀이 부채꼴' }, ...STOP(CF, 0, '#ff7aa8', 0), ...STOP(CF, 1, '#ff7aa8', 45), ...STOP(CF, 2, '#ffffff', 45), ...STOP(CF, 3, '#ffffff', 90),
            { c: CBT('shadow'), say: '🌑 살짝 그림자' }, { v: CF('v.y.n'), val: 6, say: '' }, { v: CF('v.c.a'), val: 20, say: '' },
            { c: CBT('animation'), say: '🎬 사탕만 움직여요' }, { pick: CF('v.ease', 'select'), opt: 'linear', say: '같은 빠르기' }, { pick: CF('v.dir', 'select'), opt: 'normal', say: '한 방향으로' }, { v: CF('v.dur'), val: 3, say: '' },
            { v: CF('v.kf.0.v'), val: 0, say: '처음 0°' }, { v: CF('v.kf.1.v'), val: 360, say: '끝 360° = 빙글빙글' },
            ROOT, TIN, NM('막대'),
            { c: CNM('바탕색'), say: '' }, { v: CF('v.c.c'), val: '#d9c2a0', say: '' }, { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 7, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 40, say: '' },
            { c: CBT('border-radius'), say: '' }, { v: CF('v.r.n'), val: 8, say: '완성! (막대는 가만히)' }] },
        { m: 'a', g: 'svg', lv: 1, e: '✍️', n: '손글씨처럼 그려지는 하트', d: '점선 밀기를 움직여요', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 하트' }, { v: SF('v.d'), val: () => HT(W() / 2, H() * .3, W() * .3), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.a'), val: 0, say: '속은 비워요' },
            { c: SBB('stroke'), say: '🖍' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: 14, say: '' }, { c: SBB('stroke-linecap'), say: '⏺ 둥근 끝' },
            { c: SBB('stroke-dasharray'), say: '┅ 아주 긴 점선 하나' }, { v: SK('v.a'), val: 2600, say: '' }, { v: SK('v.b'), val: 2600, say: '' },
            { c: SBB('animate'), say: '🎞 점선을 밀며 움직이기' }, { pick: SK('v.at', 'select'), opt: 'stroke-dashoffset', say: '' }, { v: SK('v.from'), val: '2600', say: '' }, { v: SK('v.to'), val: '0', say: '' }, { v: SK('v.dur'), val: 3, say: '그려지는 하트!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '💡', n: '네온사인 글씨', d: '흐림 겹치기 + 깜빡', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('rect'), say: '⬛ 밤 배경' }, { v: SF('v.x'), val: 0, say: '' }, { v: SF('v.y'), val: 0, say: '' }, { v: SF('v.width'), val: () => W(), say: '' }, { v: SF('v.height'), val: () => H(), say: '' }, { v: SF('v.rx'), val: 0, say: '' }, { v: SF('v.ry'), val: 0, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#2b2240', say: '' },
            { c: SBE('text'), say: '🔤' }, { v: SF('v.t', 'textarea'), val: 'LOVE', say: '' }, { c: SBB('font-size'), say: '' }, { v: SK('v.v'), val: () => W() / 4.2, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ff8fd0', say: '' },
            { c: SBB('feGaussianBlur'), say: '🪄 흐리게 = 빛 번짐' }, { v: SK('v.s'), val: 10, say: '' },
            { c: SBB('feMerge'), say: '🪄 번짐 두 번 + 글자' }, { pick: SK('v.a', 'select'), opt: 'prev', say: '' }, { pick: SK('v.b', 'select'), opt: 'prev', say: '' }, { pick: SK('v.c', 'select'), opt: 'SourceGraphic', say: '' },
            { c: SBB('animate'), say: '🎞 진하기 깜빡' }, { v: SK('v.to'), val: '0.45', say: '' }, { v: SK('v.dur'), val: 1.2, say: '네온 완성!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '🌈', n: '홀로그램 반짝 별', d: '그라데이션 움직이기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '⭐' }, { v: SF('v.d'), val: () => ST(W() / 2, H() * .4, W() * .3), say: '' },
            { c: SBB('linearGradient'), say: '🌈 무지갯빛' }, { pick: SK('v.sp', 'select'), opt: 'reflect', say: '바깥은 거울 반복' },
            ADDST(1), ADDST(1), ADDST(1), ...STOP(SK, 0, '#ffb3d9', 0), ...STOP(SK, 1, '#b3e5ff', 25), ...STOP(SK, 2, '#d9b3ff', 50), ...STOP(SK, 3, '#b3ffd9', 75), ...STOP(SK, 4, '#ffb3d9', 100),
            { c: SBB('stroke'), say: '🖍' }, { v: SK('v.c.c'), val: '#ffffff', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: 16, say: '' }, { c: SBB('stroke-linejoin'), say: '' },
            { c: SBB('animate-gradient'), say: '🌈 그라데이션 움직이기 = 흐르는 홀로그램!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '🫧', n: '떠오르는 비눗방울', d: '원형 그라데이션 + 길 따라', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪' }, { v: SF('v.cy'), val: () => H() * .92, say: '아래에서' }, { v: SF('v.r'), val: () => W() * .07, say: '' },
            { c: SBB('radialGradient'), say: '🔆 비눗방울 빛' }, ...STOP(SK, 0, '#ffffff', 0), ...STOP(SK, 1, '#9fd8ff', 100, 75),
            { c: SBB('animateMotion'), say: '🛤 위로 올라가는 길' }, { v: SK('v.d'), val: () => `M 0 0 C ${R(-W() * .1)} ${R(-H() * .3)} ${R(W() * .1)} ${R(-H() * .6)} 0 ${R(-H())}`, say: '' },
            SDUP, { v: SF('v.cx'), val: () => W() * .25, say: '왼쪽에 하나 더' }, { v: SF('v.r'), val: () => W() * .045, say: '' },
            SDUP, { v: SF('v.cx'), val: () => W() * .76, say: '오른쪽에도' }, { v: SF('v.r'), val: () => W() * .055, say: '' },
            { c: SKN('길 따라'), say: '' }, { v: SK('v.dur'), val: 5.5, say: '빠르기를 다르게 · 완성!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '💓', n: '두근두근 심장 + 파동', d: 'CSS 움직임 두 개 · 고리 셋 · 시간차', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪ 파동 고리' }, { v: SF('v.cy'), val: () => H() * .4, say: '' }, { v: SF('v.r'), val: () => W() * .17, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.a'), val: 0, say: '' }, { c: SBB('stroke'), say: '' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: 5, say: '' },
            { c: SBB('css-animation'), say: '🎬 커지면서' }, { v: SK('v.a'), val: .4, say: '' }, { v: SK('v.b'), val: 1.6, say: '' }, { v: SK('v.dur'), val: 1.8, say: '' }, { pick: SK('v.dir', 'select'), opt: 'normal', say: '' }, { pick: SK('v.ease', 'select'), opt: 'ease-out', say: '' },
            { c: SBB('css-animation'), say: '🎬 옅어지기' }, { pick: SK('v.p', 'select'), opt: 'opacity', say: '' }, { v: SK('v.a'), val: .9, say: '' }, { v: SK('v.b'), val: 0, say: '' }, { v: SK('v.dur'), val: 1.8, say: '' }, { pick: SK('v.dir', 'select'), opt: 'normal', say: '' }, { pick: SK('v.ease', 'select'), opt: 'ease-out', say: '' },
            SDUP, { c: SKNI('CSS 움직임', 0), say: '두 번째 고리 = 0.6초 늦게' }, { v: SK('v.delay'), val: .6, say: '' }, { c: SKNI('CSS 움직임', 1), say: '' }, { v: SK('v.delay'), val: .6, say: '' },
            SDUP, { c: SKNI('CSS 움직임', 0), say: '세 번째 고리 = 1.2초 늦게' }, { v: SK('v.delay'), val: 1.2, say: '' }, { c: SKNI('CSS 움직임', 1), say: '' }, { v: SK('v.delay'), val: 1.2, say: '' },
            { c: SBE('path'), say: '✒️ 심장' }, { v: SF('v.d'), val: () => HT(W() / 2, H() * .4 - W() * .1, W() * .11), say: '' }, { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' },
            { c: SBB('css-animation'), say: '🎬 두근두근' }, { v: SK('v.b'), val: 1.12, say: '' }, { v: SK('v.dur'), val: .45, say: '완성!' }] },
        { m: 'a', g: 'svg', lv: 3, e: '🌸', n: '빙글 도는 꽃 만다라', d: '꽃잎 하나를 돌려 찍기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('ellipse'), say: '🥚 꽃잎 하나' }, { v: SF('v.cy'), val: () => H() * .4 - W() * .17, say: '' }, { v: SF('v.rx'), val: () => W() * .065, say: '' }, { v: SF('v.ry'), val: () => W() * .16, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffb3c9', say: '' }, { v: SK('v.c.a'), val: 85, say: '' },
            { c: SBB('animateTransform'), say: '🔄 종이 가운데를 돌아요' }, { v: SK('v.from'), val: () => `0 ${R(W() / 2)} ${R(H() * .4)}`, say: '' }, { v: SK('v.to'), val: () => `360 ${R(W() / 2)} ${R(H() * .4)}`, say: '' }, { v: SK('v.dur'), val: 9, say: '' },
            ...[1, 2, 3, 4, 5].flatMap(i => [{ c: SBE('use'), say: i === 1 ? '🪞 복사해 찍기' : '' }, { v: SF('v.x'), val: 0, say: '' }, { c: SBB('rotate'), say: i === 1 ? '🔄 60° 돌려 놓기' : '' }, { v: SK('v.a'), val: 60, say: '' }, { v: SK('v.cy'), val: () => H() * .4, say: '' }]),
            { c: SBE('circle'), say: '⚪ 꽃 가운데' }, { v: SF('v.cy'), val: () => H() * .4, say: '' }, { v: SF('v.r'), val: () => W() * .06, say: '' }, { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffd23f', say: '완성!' }] },
        { m: 'a', g: 'svg', lv: 3, e: '🌊', n: '일렁이는 물결', d: '묶기 (g) + 필터 움직이기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('rect'), say: '⬛' }, { v: SF('v.x'), val: () => W() * .17, say: '' }, { v: SF('v.y'), val: () => H() * .3, say: '' }, { v: SF('v.width'), val: () => W() * .66, say: '' }, { v: SF('v.height'), val: () => H() * .28, say: '' }, { v: SF('v.rx'), val: 60, say: '' }, { v: SF('v.ry'), val: 60, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#7cc8ff', say: '' },
            { c: SBE('text'), say: '🔤 글자' }, { v: SF('v.t', 'textarea'), val: '말랑', say: '' }, { v: SF('v.y'), val: () => H() * .44, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffffff', say: '' }, { c: SBB('font-size'), say: '' }, { v: SK('v.v'), val: () => W() / 5, say: '' }, { c: SBB('dominant-baseline'), say: '' },
            { c: SBE('g'), say: '📦 묶기 = 네모 + 글자를 한 덩어리로' },
            { c: SBB('feTurbulence'), say: '🪄 노이즈' }, { pick: SK('v.ty', 'select'), opt: 'fractalNoise', say: '부드러운 구름 노이즈' }, { v: SK('v.bf'), val: .02, say: '' },
            { c: SBB('feDisplacementMap'), say: '🪄 일렁이기 (묶음 전체)' }, { v: SK('v.sc'), val: 30, say: '' },
            { c: SBB('animate-filter'), say: '🌊 필터 움직이기 = 물결!' }] },
        { m: 'a', g: 'svg', lv: 3, e: '🕯️', n: '일렁이는 촛불', d: '그라데이션 불꽃 + 필터 움직이기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 불꽃 모양' }, { v: SF('v.d'), val: FLAME, say: '' },
            { c: SBB('linearGradient'), say: '🌈' }, { v: SK('v.x2'), val: 0, say: '' }, { v: SK('v.y1'), val: 100, say: '아래에서 위로' }, { v: SK('v.y2'), val: 0, say: '' },
            ADDST(1), ...STOP(SK, 0, '#ff6a00', 0), ...STOP(SK, 1, '#ffb000', 60), ...STOP(SK, 2, '#fff2a8', 100),
            { c: SBB('feTurbulence'), say: '🪄 노이즈' }, { pick: SK('v.ty', 'select'), opt: 'fractalNoise', say: '' }, { v: SK('v.bf'), val: .03, say: '' },
            { c: SBB('feDisplacementMap'), say: '🪄 일렁이기' }, { v: SK('v.sc'), val: 45, say: '' },
            { c: SBB('animate-filter'), say: '🌊 필터 움직이기' }, { pick: SK('v.at', 'select'), opt: 'seed', say: '노이즈 모양을 계속 바꿔요' }, { v: SK('v.vals'), val: '1;2;3;4;5;6;7;8', say: '' }, { v: SK('v.dur'), val: 1, say: '촛불 완성!' }] }
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
    async function get(t) { for (let k = 0; k < 80; k++) { const el = find(t); if (el && el.offsetParent !== null) return el; await new Promise(r => setTimeout(r, 50)); } return find(t); }
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
            if (el.type === 'checkbox') { el.checked = !!val; el.dispatchEvent(new Event('input', { bubbles: true })); return wait(s.say ? 900 : 350).then(() => true); }
            let E2 = el; if (el.type === 'range' && (+val < +el.min || +val > +el.max)) { const nb = el.nextElementSibling; if (nb && nb.classList.contains('nb')) E2 = nb; }   // 범위 밖 = 숫자 칸에
            if (E2 !== el) { setVal(E2, val); }
            else if (el.type === 'range' && !T.fast) { const a = +el.value, b = +val, n = 12; for (let k = 1; k <= n; k++) { setVal(el, Math.round((a + (b - a) * k / n) * 100) / 100); await wait(35); } const nb = el.nextElementSibling; if (nb && nb.classList.contains('nb')) nb.value = el.value; }
            else if (el.type === 'text' && !T.fast && String(val).length < 24) { for (let k = 1; k <= String(val).length; k++) { setVal(el, String(val).slice(0, k)); await wait(60); } }
            else setVal(el, val);
            if (el.type === 'range' && E2 === el) { const nb = el.nextElementSibling; if (nb && nb.classList.contains('nb')) nb.value = el.value; } }
        else if (s.drag) { const st = $('#ppStage'), cv = $('#ppCv'); if (!st || !cv) return true; const r = cv.getBoundingClientRect(), pt = ([fx, fy]) => ({ clientX: r.left + r.width * fx, clientY: r.top + r.height * fy });
            const ev = (k, q) => st.dispatchEvent(new PointerEvent(k, Object.assign({ bubbles: true, pointerId: 77, pointerType: 'mouse', button: 0, buttons: k === 'pointerup' ? 0 : 1, isPrimary: true }, q)));
            const c = $('#ptCur'), A = pt(s.drag[0]), B = pt(s.drag[s.drag.length - 1]); c.style.transitionDuration = (T.fast ? 0 : 500 / T.speed) + 'ms'; c.style.left = A.clientX + 'px'; c.style.top = A.clientY + 'px'; await wait(550);
            ev('pointerdown', A); const n = T.fast ? 2 : 16; c.style.transitionDuration = '0ms';
            for (let k = 1; k <= n; k++) { const q = { clientX: A.clientX + (B.clientX - A.clientX) * k / n, clientY: A.clientY + (B.clientY - A.clientY) * k / n }; ev('pointermove', q); c.style.left = q.clientX + 'px'; c.style.top = q.clientY + 'px'; await wait(30); }
            ev('pointerup', B); }
        if (s.pause) await new Promise(r => setTimeout(r, s.pause));   // 그림판이 칸을 다시 그릴 때까지 (이름 바꾸기 = 0.5초 뒤)
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
        m.innerHTML = `<b>🎉 완성!</b><small>${T.ex.e} ${T.ex.n}</small><button type="button" data-pd="close">✕ 닫기</button><button type="button" data-pd="again">↺ 다시</button><button type="button" data-pd="more">🎓 다른 예시</button>`; const bar = document.getElementById('ptBar'); if (bar) bar.style.display = 'none'; bub('');
        document.body.appendChild(m);
        m.onclick = e => { const b = e.target.closest('[data-pd]'); if (!b) return; m.remove(); const bar = document.getElementById('ptBar'); if (bar) bar.style.display = ''; const k = b.dataset.pd;
            if (k === 'close') finish(false); if (k === 'again') restart(); if (k === 'more') { finish(false); open(); } };
    }
    function restart() { const ex = T.ex; if (!ex) return; const d = $('#ptDone'); if (d) d.remove(); ppTourHook.end(false); ppTourHook.begin(); T.pause = false; const b = $('#ptBar [data-pt="play"]'); if (b) b.textContent = '⏸'; play(ex); }
    function start(ex) {
        if (!window.ppTourHook || !ppTourHook.on) return; if (ppTourHook.busy) ppTourHook.end(false);
        if (!ppTourHook.begin()) return; T.on = true; T.pause = false; T.done = false; T.err = ''; ui(); document.body.classList.add('pt-on'); play(ex);
    }
    function finish() { T.run++; const d = $('#ptDone'); if (d) d.remove(); T.on = false; gone(); document.body.classList.remove('pt-on'); if (window.ppTourHook && ppTourHook.busy) ppTourHook.end(false); }   // 따라 보기 결과는 가져가지 않아요 (도련 11-19 · 늘 원래 그림으로)
    /* ---------- 고르는 창 ---------- */
    function open() {
        const old = $('#ptPick'); if (old) old.remove();
        const m = document.createElement('div'); m.id = 'ptPick'; m.className = 'pt-pick';
        const grid = mm => `<div class="pt-grid"><span></span>${[1, 2, 3].map(l => `<b class="pt-lv l${l}">${LV[l]}</b>`).join('')}
            ${['css', 'svg', 'mix'].map(g => `<b class="pt-g">${GN[g]}</b>` + [1, 2, 3].map(l => `<div class="pt-cell">${TOUR.filter(x => x.m === mm && x.g === g && x.lv === l).map(x => `<button type="button" class="pt-card" data-ex="${TOUR.indexOf(x)}"><i>${x.e}</i><b>${x.n}</b><small>${x.d}</small></button>`).join('') || '<span class="pt-none">·</span>'}</div>`).join('')).join('')}</div>`;
        m.innerHTML = `<div class="pt-box"><button type="button" class="pt-x" data-pp="x">✕</button><h3>🎓 따라 보기<em>예시를 누르면 마우스가 움직이며 만들어요 · 지금 그림은 그대로 두고 연습 종이에서</em></h3>
            <h4 class="pt-sec">✨ 픽셀 · 벡터로는 어려운 것</h4>${grid('s')}
            ${window.ppTourHook && ppTourHook.still ? '' : `<details class="pt-anim"><summary>🎬 움직이는 예시 (실험)</summary>${grid('a')}</details>`}
            <p class="pt-tip">⏸ 멈춤 · ⏭ 한 걸음씩 · 🐢 🐇 빠르기 · ✋ 따라 하기 = 반짝이는 곳을 내가 눌러요</p></div>`;
        document.body.appendChild(m);
        m.onclick = e => { if (e.target === m || e.target.closest('[data-pp="x"]')) { m.remove(); return; } const c = e.target.closest('[data-ex]'); if (c) { m.remove(); start(TOUR[+c.dataset.ex]); } };
    }
    window.padTour = { open, start: i => start(TOUR[i]), finish, TOUR, get state() { return { on: T.on, i: T.i, done: !!T.done, err: T.err || '' }; }, set fast(v) { T.fast = !!v; }, set speed(v) { T.speed = +v || 1; } };
})();
