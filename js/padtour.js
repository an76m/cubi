/* 말랑달콤 다이어리 - js/padtour.js
   🎓 그림판 예시 보기 (도련 11-19 · 1305 · 1306 예시 바꿈 : ✨ 가만히 9 (픽셀 · 벡터로는 어려운 것) + 🎬 움직이는 9 (실험)) : 글 대신 · 예시를 고르면 진짜 그림판에서 마우스가 움직이며 메뉴를 눌러 만드는 과정을 보여 줘요
   - 🧩 CSS · 🌀 SVG · 🔗 섞기 × 초급 · 중급 · 고급 (예시 = 공식 기능을 이렇게 쓴다는 순서 · 기능 목록에는 안 섞여요)
   - 연습 종이 (js/padpaint.js ppTourHook) : 지금 그림은 보관 → 빈 종이에서 만들고 → 끝나면 늘 원래 그림으로 (결과는 가져가지 않아요 · 도련 11-19)
   - 조절 : ⏸ 멈춤 · ▶ 이어서 · ⏭ 다음 한 걸음 · ↺ 처음부터 · 🐢 🐇 빠르기 · ✋ 따라 하기 (반짝이는 곳을 내가 눌러요)
   - 걸음 = { c: 누를 곳 } · { v: 칸, val: 값 } · { pick: 고르는 칸, opt: 글자 } · { drag: [[가로, 세로] 비율 …] 또는 함수 } · { tap: 칸, at: [가로, 세로] 비율 = 색 띠 · 밝기 판 } · { say: 말풍선 }
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
    /* 📐 스티커 종류마다 종이 크기가 달라요 (도련 11-19 · 1313) : 예시는 속지(900 × 1269) 기준으로 만들고 · 지금 종이에 맞게 줄여 가운데에 놓아요
       S = 줄이는 비율 · D / DH = 크기 (속지 폭 · 높이의 몇 배) · X / Y = 자리 (속지에서 몇 %) · Z = CSS px 값 · 상자 자리 (BOX) 도 같이 */
    const LW = 900, LH = 1269, CY = .45;
    const S = () => Math.min(W() / LW, H() / (LH * .55), 1);
    const D = f => LW * S() * f, DH = f => LH * S() * f;
    const X = f => W() / 2 + (f - .5) * LW * S(), Y = f => H() / 2 + (f - CY) * LH * S();
    const Z = n => () => Math.round(n * S() * 10) / 10, ZF = n => () => Math.round(n / S() * 1000) / 1000;   // ZF = 노이즈 촘촘함 (작은 종이일수록 촘촘하게)
    const BOXF = { w: p => p * LW * S() / W(), h: p => p * LH * S() / H(), x: p => X(p / 100) / W() * 100, y: p => Y(p / 100) / H() * 100 };
    const star = () => { const w = W(), h = H(), cx = X(.5), cy = Y(.4), R = D(.28), r = R * .45, p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; p.push(`${Math.round(cx + Math.cos(a) * q)} ${Math.round(cy + Math.sin(a) * q)}`); } return 'M ' + p.join(' L ') + ' Z'; };
    const heart = () => { const w = W(), h = H(), cx = X(.5), y = Y(.28), s = D(.3), R = n => Math.round(n); return `M ${R(cx)} ${R(y + s * 1.25)} C ${R(cx - s * 1.6)} ${R(y + s * .4)} ${R(cx - s * .9)} ${R(y - s * .6)} ${R(cx)} ${R(y + s * .15)} C ${R(cx + s * .9)} ${R(y - s * .6)} ${R(cx + s * 1.6)} ${R(y + s * .4)} ${R(cx)} ${R(y + s * 1.25)} Z`; };

    const R = Math.round, HT = (cx, cy, k) => `M ${R(cx)} ${R(cy + k * 1.25)} C ${R(cx - k * 1.6)} ${R(cy + k * .4)} ${R(cx - k * .9)} ${R(cy - k * .6)} ${R(cx)} ${R(cy + k * .15)} C ${R(cx + k * .9)} ${R(cy - k * .6)} ${R(cx + k * 1.6)} ${R(cy + k * .4)} ${R(cx)} ${R(cy + k * 1.25)} Z`;
    const ST = (cx, cy, Ro) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? Ro * .45 : Ro; p.push(`${R(cx + Math.cos(a) * q)} ${R(cy + Math.sin(a) * q)}`); } return 'M ' + p.join(' L ') + ' Z'; };
    const CIR = (cx, cy, r) => `M ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx + r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx - r)} ${R(cy)}`;
    const TAB = { c: '#ppRTab [data-rt="bk"]', say: '오른쪽 🧩 기능 탭을 열어요' }, FOLD = { c: '#ppProp summary[data-cbfold]', say: '📐 상자 자리 · 글자를 펼쳐요' };
    const BOX = (k, v) => ({ v: `#ppProp input[data-cbx="${k}"]`, val: () => Math.round(BOXF[k](typeof v === 'function' ? v() : v)), say: { x: '상자 가로 자리', y: '상자 세로 자리', w: '상자 폭', h: '상자 높이' }[k] });
    const BOXR = (k, v) => ({ v: `#ppProp input[data-cbx="${k}"]`, val: v, say: { x: '상자 가로 자리', y: '상자 세로 자리', w: '상자 폭', h: '상자 높이' }[k] });   // 종이 그대로 (가득 채우기)
    const TXT = t => ({ v: '#ppProp textarea[data-cbtext]', val: t, say: '상자 안 글자를 써요' });
    const PART = (k, say) => ({ c: `#ppProp [data-cbpart="${k}"]`, say });
    const SKN = n => () => [...document.querySelectorAll('#ppProp .pp-cbk.sb .nm')].filter(b => b.textContent.includes(n)).pop();   // 🌀 이름으로 기능 칸 열기
    const CNM = n => () => [...document.querySelectorAll('#ppProp .pp-cbk .nm')].find(b => b.textContent.includes(n) && !b.closest('.pp-cbk').classList.contains('open'));   // 🧩 이름으로 닫힌 기능 칸 열기
    const SKNI = (n, i) => () => [...document.querySelectorAll('#ppProp .pp-cbk.sb .nm')].filter(b => b.textContent.includes(n))[i];   // 🌀 같은 이름 중 i 번째
    const NODE = i => () => [...document.querySelectorAll('#ppProp .pp-cbtree [data-cbnode]')][i];   // 🌳 나무 i 번째 줄 (0 = 맨 위 상자)
    const TIN = { c: '#ppProp [data-cbt="in"]', say: '🌳 ＋ 안에 상자' }, TSIB = { c: '#ppProp [data-cbt="sib"]', say: '🌳 ＋ 옆에 상자 (같은 이름)' }, ROOT = { c: '#ppProp [data-cbnode="root"]', say: '맨 위 상자를 골라요' };
    const NM = (n, say) => ({ v: '#ppProp input[data-cbnm]', val: n, say: say || `🏷️ 이름 (class) = ${n}`, pause: 750 }), NTX = t => ({ v: '#ppProp textarea[data-cbntext]', val: t, say: '이 상자 안 글자' });
    const SDUP = { c: '#ppProp .pp-cbk.sbe.picked [data-sba="dup"][data-k="e"]', say: '⧉ 도형 복제' };
    const CDUP = { c: '#ppProp .pp-cbk.open [data-cba="dup"]', say: '⧉ 같은 기능 한 장 더 (복제)' };
    const ADDST = (sb) => ({ c: `#ppProp .pp-cbk${sb ? '.sb' : ''}.open [data-cbst]`, say: '색을 하나 더 넣어요' });
    const STOP = (F, i, c, p, a) => [{ v: F(`v.stops.s.${i}.c.c`), val: c, say: '' }].concat(p == null ? [] : [{ v: F(`v.stops.s.${i}.p`), val: p, say: '' }]).concat(a == null ? [] : [{ v: F(`v.stops.s.${i}.c.a`), val: a, say: '' }]);
    const GINGHAM = [
        { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 직선 = 줄무늬 한 장' },
        { v: CF('v.ang'), val: 0, say: '가로 줄무늬로' },
        ...STOP(CF, 0, '#ff8fb1', null, 55), ...STOP(CF, 1, '#ff8fb1', null, 55), ...STOP(CF, 2, '#ffffff', null, 0), ...STOP(CF, 3, '#ffffff', null, 0),
        CDUP, { v: CF('v.ang'), val: 90, say: '하나는 세로로 = 겹친 곳이 진해져서 깅엄!' }];

    /* 🐾 동물 예시 (도련 11-19) : 시안 300 × 300 칸 좌표 → 종이 px (가운데 = 속지 50% · 40% · 300칸 = 속지 폭의 60%) */
    const U = () => D(.002), MX = x => X(.5) + (x - 150) * U(), MY = y => Y(.4) + (y - 150) * U(), MF = (x, y) => [MX(x) / W(), MY(y) / H()];
    const TP = d => { let k = 0; return d.replace(/-?\d+(\.\d+)?/g, n => (k++ % 2 ? R(MY(+n)) : R(MX(+n))) + ''); };   // 시안 길 → 종이 길 (절대 좌표 M L C Q Z 만)
    function SAMP(d, n) {                                                       // 시안 길 → 점 n 개 (〰️ 곡선으로 그어요)
        const NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path'); sv.setAttribute('style', 'position:fixed;left:-9999px;width:10px;height:10px'); p.setAttribute('d', d); sv.appendChild(p); document.body.appendChild(sv);
        const L = p.getTotalLength(), out = []; for (let i = 0; i <= n; i++) { const q = p.getPointAtLength(L * i / n); out.push(MF(q.x, q.y)); } sv.remove(); return out;
    }
    const CRV = (d, say) => [{ c: PT('curve'), say: '' }, { drag: () => SAMP(d, 60), say }];
    const ELLS = (x0, y0, x1, y1, say) => [{ c: PT('ellipse'), say: '' }, { drag: () => [MF(x0, y0), MF(x1, y1)], say }];   // ◯ 하나 그리면 ↖️ 선택으로 바뀌어서 또 골라요
    const PEN = (pts, say) => [{ c: PT('pen'), say }, ...pts.concat([pts[0]]).map(q => ({ drag: () => [MF(q[0], q[1]), MF(q[0], q[1])], say: '' }))];
    const TAPV = (x, y, say) => ({ drag: () => [MF(x, y), MF(x, y)], say });                         // 🪣 그 모양 누르기
    const SWC = (c, say) => ({ c: `#ppSw [data-c="${c}"]`, say });                                  // 🎨 색 칸
    const COL = (h, sa, va, say) => [{ tap: '#ppHue', at: [h / 360, .5], say: '' }, { tap: '#ppSv', at: [sa, 1 - va], say }];   // 🎨 색 고르기 (색상 띠 → 밝기 판)
    const DESEL = [{ c: PT('select'), say: '' }, { drag: () => [MF(4, 4), MF(4, 4)], say: '' }];   // ↖️ 빈 곳 = 고른 모양 풀기 (선 굵기를 바꿔도 그린 모양은 그대로)
    const OP1 = { v: '#ppOpt input[data-k="op"]', val: 1, say: '투명도 100%' };
    const BSIDE = (k, n, c, say) => [{ c: CBT('border-' + k), say: say || '' }, { v: CF('v.w.n'), val: () => R(n * U()), say: '' }, { pick: CF('v.s', 'select'), opt: 'solid', say: '' }, { v: CF('v.c.c'), val: c, say: '' }];
    const VSW = (n, say) => ({ v: '#ppOpt input[data-k="vsw"]', val: () => n ? Math.max(1, R(n * U())) : 0, say: say || '선 굵기' });
    const PCT = v => R(v / 3 * 10) / 10;                                                            // 시안 칸 → 상자 안 %
    const SZ = (w, h) => [{ c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: w, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: h, say: '' }];
    const RD = r => [{ c: CBT('border-radius'), say: '' }, { pick: CF('v.r.u', 'select'), opt: '%', say: '' }, { v: CF('v.r.n'), val: r, say: '' }];
    const AT = (x, y, say) => [{ c: CBT('position'), say: '📍 직접 자리' }, { c: CBT('left'), say: '' }, { v: CF('v.v.n'), val: x, say: '' }, { c: CBT('top'), say: '' }, { v: CF('v.v.n'), val: y, say: say || '' }];
    const KID = (nm, col, x, y, w, h, rd, say) => [ROOT, TIN, NM(nm), { c: CNM('바탕색'), say: say || '' }, { v: CF('v.c.c'), val: col, say: '' }, ...SZ(PCT(w), PCT(h)), ...(rd ? RD(rd) : []), ...AT(PCT(x), PCT(y))];
    const TW = (nm, x) => [TSIB, NM(nm), { c: CNM('왼쪽에서'), say: '같은 것 하나 더 · 옆으로' }, { v: CF('v.v.n'), val: PCT(x), say: '' }];
    const KF = (i, p, at, v) => [{ pick: CF(`v.kf.${i}.p`, 'select'), opt: p, say: '' }, { v: CF(`v.kf.${i}.at`), val: at, say: '' }, { v: CF(`v.kf.${i}.v`), val: v, say: '' }];
    const ADDKF = { c: '#ppProp .pp-cbk.open [data-cbst]', say: '＋ 장면 더하기' };
    const BR = {   // 🐻 시안 길 (벡터)
        earL: 'M96 84 C 72 84, 66 116, 88 126 C 108 134, 120 96, 96 84 Z', earR: 'M204 84 C 228 84, 234 116, 212 126 C 192 134, 180 96, 204 84 Z',
        body: 'M98 220 C 90 266, 108 284, 150 284 C 192 284, 210 266, 202 220 Z', head: 'M150 90 C 210 90, 236 128, 232 168 C 228 210, 192 226, 150 226 C 108 226, 72 210, 68 168 C 64 128, 90 90, 150 90 Z',
        inL: 'M92 96 C 82 98, 82 114, 92 116 C 100 112, 102 100, 92 96 Z', inR: 'M208 96 C 218 98, 218 114, 208 116 C 200 112, 198 100, 208 96 Z',
        muz: 'M150 158 C 176 158, 188 172, 186 186 C 184 200, 168 206, 150 206 C 132 206, 116 200, 114 186 C 112 172, 124 158, 150 158 Z', bel: 'M150 238 C 172 238, 180 252, 178 264 C 176 274, 164 278, 150 278 C 136 278, 124 274, 122 264 C 120 252, 128 238, 150 238 Z' };
    const PG = {   // 🐧 시안 길 (벡터 · SVG)
        flL: 'M80 160 C 54 180, 50 216, 64 224 C 76 216, 84 196, 86 178 Z', flR: 'M220 160 C 246 180, 250 216, 236 224 C 224 216, 216 196, 214 178 Z',
        body: 'M150 70 C 205 70, 228 140, 226 200 C 224 250, 196 270, 150 270 C 104 270, 76 250, 74 200 C 72 140, 95 70, 150 70 Z',
        bel: 'M150 112 C 192 112, 204 168, 200 210 C 196 248, 176 258, 150 258 C 124 258, 104 248, 100 210 C 96 168, 108 112, 150 112 Z',
        footL: 'M116 264 C 104 280, 126 286, 142 274 Z', footR: 'M184 264 C 196 280, 174 286, 158 274 Z',
        tail: 'M178 176 L 192 228 L 172 224 Z', tail2: 'M178 176 L 206 222 L 186 228 Z', scarf: 'M88 160 C 120 174, 180 174, 212 160 L 214 178 C 180 192, 120 192, 86 178 Z' };
    const SCARF = [{ c: SBB('linearGradient'), say: '🌈 분홍 → 주황 → 분홍' }, ADDST(1), ...STOP(SK, 0, '#ff6f91', 0), ...STOP(SK, 1, '#ff9a6b', 50), ...STOP(SK, 2, '#ff6f91', 100),
        { c: SBB('stroke'), say: '' }, { v: SK('v.c.c'), val: '#6b4438', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: () => R(4 * U() * 10) / 10, say: '' }];
    /* 🌐 웹디자이너 방법 (도련 11-23 · 1444 · 시안 작업_1123_예시보기웹기법시안) : ✏️ 픽셀 · ✒️ 벡터로 그린 것을 🧩 CSS · 🌀 SVG 가 '🗂️ 그림판 레이어 그림으로' 가져가요 */
    const BXC = (x0, y0, x1, y1) => [BOX('w', (x1 - x0) * .2), BOX('h', () => (y1 - y0) * .2 * LW / LH), BOX('x', 50 + (x0 - 150) * .2), BOX('y', () => 40 + (y0 - 150) * .2 * LW / LH)];   // 시안 칸 → CSS 상자
    const PXL = (d, say) => ({ drag: () => SAMP(d, 50), say });                                    // ✏️ 그 길을 따라 그어요
    const DOT = (x, y, say) => ({ drag: () => [MF(x, y), MF(x + 1, y + 1)], say });                 // ✏️ 톡 (점)
    const LYP = (opt, say, sel) => ({ pick: (sel || '#ppProp .pp-cbk.open') + ' select[data-cbly]', opt, say: say || '' });   // 🗂️ 그림판 레이어 그림으로
    const LAY = { c: '#ppProp .pp-cbk.open summary[data-cblay]', say: '🧭 놓는 방법' };
    const SZPX = { v: '#ppOpt input[data-k="size"]', val: () => Math.max(2, R(5 * U())), say: '굵기' };
    const BUNP = {   // 🐰 시안 길 (벡터)
        earL: 'M118 140 C 104 96, 108 74, 121 74 C 134 74, 140 98, 136 138 Z', earR: 'M182 140 C 196 96, 192 74, 179 74 C 166 74, 160 98, 164 138 Z',
        body: 'M89 202 C 83 150, 110 132, 150 132 C 190 132, 217 150, 211 202 C 207 232, 185 236, 150 236 C 115 236, 93 232, 89 202 Z',
        inL: 'M121 88 C 114 104, 118 124, 126 134 C 130 118, 128 100, 121 88 Z', inR: 'M179 88 C 186 104, 182 124, 174 134 C 170 118, 172 100, 179 88 Z', mouth: 'M144 194 Q 150 200 156 194' };
    const CATP = { head: 'M103 60 L 111 26 L 133 48 Q 150 42 167 48 L 189 26 L 197 60 Q 215 90 203 124 Q 187 170 150 172 Q 113 170 97 124 Q 85 90 103 60 Z', string: 'M150 172 C 146 200, 158 222, 150 258', mouth: 'M143 120 Q 150 128 157 120' };   // 🎈
    const FLOAT = [{ c: SBB('animateTransform'), say: '' }, { pick: SK('v.ty', 'select'), opt: 'translate', say: '' }, { v: SK('v.from'), val: () => `0 ${R(8 * U())}`, say: '' }, { v: SK('v.to'), val: () => `0 ${R(-8 * U())}`, say: '' },
        { v: SK('v.dur'), val: 2, say: '' }, { v: SK('v.alt'), val: true, say: '' }, { pick: SK('v.ease', 'select'), opt: 'ease-in-out', say: '' }];   // 🎬 둥실 (위아래 왔다 갔다)
    const SNOW = [[34, 5, 8, 6, 0], [262, 4, -6, 5, 1.5], [70, 3, 6, 7, 3], [236, 6, -8, 6.5, 4], [150, 3.5, 4, 5.5, 2.2]];   // ❄️ [가로, 크기, 옆으로, 시간, 기다림]

    /* ---------- ✨ 예시 (가만히 · 서비스용) ---------- */
    const TOUR = [
        { m: 's', g: 'css', lv: 1, e: '🧺', k: 'gingham', n: '깅엄 체크 천', d: '되풀이 줄무늬를 가로 한 장 · 세로 한 장 겹치면 겹친 곳이 진해져 체크가 돼요', s: [
            { c: M('css'), say: '🧩 CSS 로 가요 · 상자 하나가 생겨요' }, TAB, FOLD, BOX('w', 60), BOX('h', () => Math.round(60 * LW / LH * .85)), BOX('x', 20), BOX('y', 30),
            { c: OPEN1, say: '바탕색을 열어요' }, { v: CF('v.c.c'), val: '#ffffff', say: '하얀 천' },
            { c: CBT('border-radius'), say: '⬜ 둥근 모서리' }, { v: CF('v.r.n'), val: Z(56), say: '' },
            { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 직선 = 줄무늬 한 장' },
            { v: CF('v.ang'), val: 0, say: '가로 줄무늬로' },
            ...STOP(CF, 0, '#ff8fb1', Z(0), 50), ...STOP(CF, 1, '#ff8fb1', Z(50), 50), ...STOP(CF, 2, '#ffffff', Z(50), 0), ...STOP(CF, 3, '#ffffff', Z(100), 0),
            CDUP, { v: CF('v.ang'), val: 90, say: '하나는 세로로 = 겹친 곳이 진해져서 깅엄!' }] },
        { m: 's', g: 'css', lv: 2, e: '🌈', k: 'cliptext', n: '글자 안에 무늬', d: '줄무늬를 깔고 바탕 오리기를 글자로 → 무늬가 글자 모양으로만 남아요', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, { c: OPEN1, say: '바탕색' }, { v: CF('v.c.a'), val: 0, say: '상자는 투명하게' }, FOLD, TXT('말랑'),
            { c: CBT('font-size'), say: '🔠 글자 크기' }, { v: CF('v.s.n'), val: Z(260), say: '아주 크게' },
            { c: CBT('font-weight'), say: '🅱️ 글자 굵기' }, { pick: CF('v.w', 'select'), opt: '900', say: '아주 굵게' },
            { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 줄무늬 (45°)' },
            ...STOP(CF, 0, '#ff5d8f', Z(0)), ...STOP(CF, 1, '#ff5d8f', Z(34)), ...STOP(CF, 2, '#ffd23f', Z(34)), ...STOP(CF, 3, '#ffd23f', Z(68)),
            ADDST(), ...STOP(CF, 4, '#7cc8ff', Z(68)), ADDST(), ...STOP(CF, 5, '#7cc8ff', Z(102)),
            { c: CBT('background-clip'), say: '✂️ 바탕 그릴 곳 = 글자 안에만' },
            { c: CBT('-webkit-text-fill-color'), say: '🫗 글자 속은 투명하게 = 무늬가 보여요 · 완성!' }] },
        { m: 's', g: 'css', lv: 2, e: '🍭', k: 'pop', n: '겹테두리 팝 글씨', d: '글자 테두리를 두르고 글자 그림자를 색만 바꿔 세 번 비껴 쌓아요', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB,
            { c: OPEN1, say: '바탕색을 열어요' }, { v: CF('v.c.a'), val: 0, say: '상자는 투명하게 (글씨만)' },
            FOLD, TXT('말랑'),
            { c: CBT('font-size'), say: '🔠 글자 크기' }, { v: CF('v.s.n'), val: Z(210), say: '' },
            { c: CBT('font-weight'), say: '🅱️ 굵게' }, { pick: CF('v.w', 'select'), opt: '900', say: '' },
            { c: CBT('color'), say: '🖌 글자색' }, { v: CF('v.c.c'), val: '#ffffff', say: '하양' },
            { c: CBT('-webkit-text-stroke'), say: '✒️ 글자 테두리' }, { v: CF('v.w.n'), val: Z(10), say: '' }, { v: CF('v.c.c'), val: '#ff5d8f', say: '분홍 테두리' },
            { c: CBT('paint-order'), say: '🖊 테두리를 글자 바깥으로' },
            { c: CBT('tshadow'), say: '💬 글자 그림자 1 (맨 아래)' }, { v: CF('v.x.n'), val: Z(20), say: '' }, { v: CF('v.y.n'), val: Z(20), say: '' }, { v: CF('v.c.c'), val: '#a37cff', say: '보라' },
            { c: CBT('tshadow'), say: '💬 그림자 2' }, { v: CF('v.x.n'), val: Z(14), say: '' }, { v: CF('v.y.n'), val: Z(14), say: '' }, { v: CF('v.c.c'), val: '#7cc8ff', say: '하늘' },
            { c: CBT('tshadow'), say: '💬 그림자 3 (맨 위)' }, { v: CF('v.x.n'), val: Z(7), say: '' }, { v: CF('v.y.n'), val: Z(7), say: '' }, { v: CF('v.c.c'), val: '#ffd23f', say: '노랑 · 완성!' }] },
        { m: 's', g: 'css', lv: 3, e: '🎀', k: 'ribbon', n: '새틴 리본 라벨', d: '세로 그라데이션으로 광택 · 바깥 테두리 점선 = 바느질 · 장식 둘로 리본 꼬리', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, FOLD, BOX('w', 60), BOX('h', 10), BOX('x', 20), BOX('y', 42), TXT('MALANG'),
            { c: CBT('linear-gradient'), say: '🌈 광택 그라데이션' }, { v: CF('v.ang'), val: 180, say: '위에서 아래로' }, ADDST(), ADDST(),
            ...STOP(CF, 0, '#ff9cbb', 0), ...STOP(CF, 1, '#ff6f97', 45), ...STOP(CF, 2, '#f25485', 55), ...STOP(CF, 3, '#ff86a8', 100),
            { c: CBT('color'), say: '🖌 글자색' }, { v: CF('v.c.c'), val: '#ffffff', say: '' },
            { c: CBT('font-size'), say: '🔠' }, { v: CF('v.s.n'), val: Z(54), say: '' },
            { c: CBT('letter-spacing'), say: '↔️ 글자 사이' }, { v: CF('v.s.n'), val: Z(5), say: '' },
            { c: CBT('tshadow'), say: '💬 글자 그림자' }, { v: CF('v.x.n'), val: Z(0), say: '' }, { v: CF('v.y.n'), val: Z(2), say: '' }, { v: CF('v.c.c'), val: '#b8325a', say: '' },
            { c: CBT('outline'), say: '⭕ 바깥 테두리 = 바느질' }, { pick: CF('v.s', 'select'), opt: 'dashed', say: '점선' }, { v: CF('v.w.n'), val: Z(2), say: '' }, { v: CF('v.c.c'), val: '#ffffff', say: '' }, { v: CF('v.c.a'), val: 75, say: '' },
            { c: CBT('outline-offset'), say: '↔ 안쪽으로 당기기' }, { v: CF('v.o.n'), val: Z(-9), say: '' },
            PART('pb', '✨ 장식 1 = 왼쪽 리본 꼬리'),
            { c: CBT('border-top'), say: '⬆️ 위 테두리' }, { v: CF('v.w.n'), val: Z(52), say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-bottom'), say: '⬇️ 아래 테두리' }, { v: CF('v.w.n'), val: Z(52), say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-left'), say: '⬅️ 왼쪽 테두리를 투명하게 = V 홈' }, { v: CF('v.w.n'), val: Z(40), say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            { c: CBT('height'), say: '↕️ 높이 0 = 테두리만 남아요' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(0), say: '' }, { c: CBT('width'), say: '↔️ 꼬리 폭' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(140), say: '' },
            { c: CBT('left'), say: '⇥ 왼쪽 밖으로' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(-96), say: '' },
            { c: CBT('top'), say: '⤓ 조금 아래로' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(36), say: '' },
            { c: CBT('z-index'), say: '🗂 본체 뒤로' }, { v: CF('v.v'), val: -1, say: '' },
            PART('pa', '✨ 장식 2 = 오른쪽 꼬리'),
            { c: CBT('border-top'), say: '' }, { v: CF('v.w.n'), val: Z(52), say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-bottom'), say: '' }, { v: CF('v.w.n'), val: Z(52), say: '' }, { v: CF('v.c.c'), val: '#e2456f', say: '' },
            { c: CBT('border-right'), say: '➡️ 오른쪽을 투명하게' }, { v: CF('v.w.n'), val: Z(40), say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            { c: CBT('height'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(0), say: '' }, { c: CBT('width'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(140), say: '' },
            { c: CBT('left'), say: '⇥ 오른쪽 끝에 붙여요' }, { v: CF('v.v.n'), val: 92, say: '' },
            { c: CBT('top'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: Z(36), say: '' },
            { c: CBT('z-index'), say: '' }, { v: CF('v.v'), val: -1, say: '완성!' }] },
        { m: 's', g: 'svg', lv: 1, e: '🔴', k: 'stamp', n: '동그란 도장 로고', d: '원 길 위에 글자 (길 따라 글자) + 원 테두리 두 겹 + 가운데 하트', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪ 원' }, { v: SF('v.r'), val: () => D(.34), say: '크게' },
            { c: SBB('fill'), say: '🎨 칠' }, { v: SK('v.c.a'), val: 0, say: '속은 비워요' },
            { c: SBB('stroke'), say: '🖍 선 색' }, { v: SK('v.c.c'), val: '#d64b6e', say: '도장 빨강' },
            { c: SBB('stroke-width'), say: '📏 선 굵기' }, { v: SK('v.v'), val: Z(9), say: '' },
            SDUP, { v: SF('v.r'), val: () => D(.19), say: '안쪽 원' },
            { c: SKN('선 굵기'), say: '선 굵기를 열어요' }, { v: SK('v.v'), val: Z(4), say: '얇게' },
            { c: SBE('textPath'), say: '➰ 길 따라 글자' }, { v: SF('v.d'), val: () => CIR(X(.5), Y(.5), D(.265)), say: '원 모양 길' },
            { v: SF('v.t'), val: 'MALANG DALKOM · DIARY · 2026 · ', say: '둘러쓸 글자' },
            { c: SBB('fill'), say: '🎨 글자색' }, { v: SK('v.c.c'), val: '#d64b6e', say: '' },
            { c: SBB('font-size'), say: '🔠' }, { v: SK('v.v'), val: () => D(1 / 13), say: '' },
            { c: SBB('letter-spacing'), say: '↔️ 글자 사이' }, { v: SK('v.v'), val: Z(8), say: '' },
            { c: SBE('path'), say: '✒️ 가운데 하트' }, { v: SF('v.d'), val: () => HT(X(.5), Y(.5) - D(.07), D(.16)), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#d64b6e', say: '완성!' }] },
        { m: 's', g: 'svg', lv: 2, e: '🥇', k: 'gold', n: '금박 글씨', d: '금색 그라데이션 글자에 빛 비추기 필터 → 반짝이는 곳만 하얗게', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('text'), say: '🔤 글자' }, { v: SF('v.t', 'textarea'), val: 'Gold', say: '' },
            { c: SBB('font-size'), say: '🔠' }, { v: SK('v.v'), val: () => D(1 / 3.4), say: '' },
            { c: SBB('font-family'), say: '🅰️ 글꼴' }, { pick: SK('v.v', 'select'), opt: 'serif', say: '명조' },
            { c: SBB('linearGradient'), say: '🌈 금색 그라데이션' }, { v: SK('v.x2'), val: 0, say: '위에서 아래로' }, { v: SK('v.y2'), val: 100, say: '' },
            ADDST(1), ADDST(1), ...STOP(SK, 0, '#fff3b0', 0), ...STOP(SK, 1, '#e2a93b', 45), ...STOP(SK, 2, '#b8791f', 55), ...STOP(SK, 3, '#ffe08a', 100),
            { c: SBB('feGaussianBlur'), say: '🪄 1 : 모양을 살짝 흐리게 (높이 지도)' }, { pick: SK('v.in', 'select'), opt: 'SourceAlpha', say: '' }, { v: SK('v.s'), val: Z(3), say: '' },
            { c: SBB('feSpecularLighting'), say: '🪄 2 : 반짝 빛 비추기' }, { v: SK('v.ss'), val: 5, say: '' }, { v: SK('v.sc'), val: 1.2, say: '' }, { v: SK('v.se'), val: 30, say: '' }, { v: SK('v.el'), val: 40, say: '' },
            { c: SBB('feComposite'), say: '🪄 3 : 빛을 글자 안에만' }, { pick: SK('v.in2', 'select'), opt: 'SourceAlpha', say: '' }, { pick: SK('v.op', 'select'), opt: 'in', say: '' },
            { c: SBB('feMerge'), say: '🪄 4 : 글자 위에 빛 얹기' }, { pick: SK('v.a', 'select'), opt: 'SourceGraphic', say: '' }, { pick: SK('v.b', 'select'), opt: 'prev', say: '' }, { pick: SK('v.c', 'select'), opt: 'prev', say: '완성!' }] },
        { m: 's', g: 'svg', lv: 3, e: '💗', k: 'jelly', n: '말랑 젤리 스티커', d: '하트를 흐려 높이 지도로 쓰고 점 빛을 비추면 볼록한 젤리처럼', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 하트' }, { v: SF('v.d'), val: () => HT(X(.5), Y(.32), D(.3)), say: '' },
            { c: SBB('fill'), say: '🎨' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' },
            { c: SBB('feGaussianBlur'), say: '🪄 1 : 가장자리를 둥글게 흐린 높이 지도' }, { pick: SK('v.in', 'select'), opt: 'SourceAlpha', say: '' }, { v: SK('v.s'), val: Z(12), say: '' },
            { c: SBB('feSpecularLighting'), say: '🪄 2 : 전구 빛을 비춰요' }, { v: SK('v.ss'), val: 9, say: '볼록하게' }, { v: SK('v.sc'), val: 1.1, say: '' }, { v: SK('v.se'), val: 18, say: '' },
            { pick: SK('v.lt', 'select'), opt: 'point', say: '점 빛 (전구)' }, { v: SK('v.lx'), val: () => X(.36), say: '' }, { v: SK('v.ly'), val: () => Y(.24), say: '' }, { v: SK('v.lz'), val: Z(260), say: '' },
            { c: SBB('feComposite'), say: '🪄 3 : 빛을 하트 안에만' }, { pick: SK('v.in2', 'select'), opt: 'SourceAlpha', say: '' }, { pick: SK('v.op', 'select'), opt: 'in', say: '' },
            { c: SBB('feMerge'), say: '🪄 4 : 하트 위에 빛' }, { pick: SK('v.a', 'select'), opt: 'SourceGraphic', say: '' }, { pick: SK('v.b', 'select'), opt: 'prev', say: '' }, { pick: SK('v.c', 'select'), opt: 'prev', say: '말랑 젤리 완성!' }] },
        { m: 's', g: 'mix', lv: 2, e: '🩷', k: 'checkheart', n: '체크무늬 하트 스티커', d: 'SVG 하트를 가리개로 · CSS 깅엄 무늬를 하트 모양으로 오리고 두꺼운 테두리로 칼선', s: [
            { c: M('svg'), say: '🌀 먼저 SVG 로 하트 모양과 칼선 필터를 만들어요' },
            { c: SBE('path'), say: '✒️ 하트' }, { v: SF('v.d'), val: () => HT(X(.5), Y(.3), D(.3)), say: '' },
            { c: SBB('fill'), say: '🎨 하양으로 (가리개로 쓸 때 밝은 곳이 보여요)' }, { v: SK('v.c.c'), val: '#ffffff', say: '' },
            { c: SBB('feMorphology'), say: '🪄 1 : 모양을 두껍게' }, { pick: SK('v.in', 'select'), opt: 'SourceAlpha', say: '' }, { v: SK('v.r'), val: Z(14), say: '' },
            { c: SBB('feFlood'), say: '🪄 2 : 하양 붓기' },
            { c: SBB('feComposite'), say: '🪄 3 : 두꺼운 모양 안에만 하양 = 칼선' }, { pick: SK('v.in', 'select'), opt: 'prev', say: '' }, { pick: SK('v.in2', 'select'), opt: 'r1', say: '' }, { pick: SK('v.op', 'select'), opt: 'in', say: '' },
            { c: SBB('feDropShadow'), say: '🪄 4 : 그림자' }, { v: SK('v.dy'), val: Z(8), say: '' },
            { c: SBB('feMerge'), say: '🪄 5 : 칼선 위에 원래 그림' }, { pick: SK('v.a', 'select'), opt: 'prev', say: '' }, { pick: SK('v.b', 'select'), opt: 'SourceGraphic', say: '' }, { pick: SK('v.c', 'select'), opt: 'SourceGraphic', say: '' },
            { c: eye('svg'), say: '👁 SVG 레이어는 숨겨요 (모양 · 필터만 빌려요)' },
            { c: M('css'), say: '🧩 이제 CSS 로 깅엄 무늬' }, TAB, { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#ffffff', say: '' },
            ...GINGHAM,
            { c: CBT('m-url'), say: '🎭 가리기 · 그림 (CSS → SVG)' }, { pick: '#ppProp .pp-cbk.open select[data-cbly]', opt: 'SVG', say: '🗂️ 아까 그린 SVG 하트 모양으로' },
            { c: CBT('svg-filter'), say: '🌀 SVG 필터 쓰기' }, { pick: CF('v.ref', 'select'), opt: 1, say: '하얀 칼선 필터 · 완성!' }] },
        { m: 's', g: 'mix', lv: 3, e: '📷', k: 'polaroid', n: '밤하늘 폴라로이드', d: 'CSS 상자 안에 상자 (사진 칸 · 글씨 · 테이프) + SVG 별 · 상자째 살짝 돌려요', s: [
            { c: M('css'), say: '🧩 CSS 로 폴라로이드 종이' }, TAB, FOLD, BOX('w', 46), BOX('h', () => Math.round(46 * LW / LH * 1.26)), BOX('x', 27), BOX('y', 20),
            { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#fffdf8', say: '크림색 종이' },
            { c: CBT('padding'), say: '🔳 안쪽 여백' }, { v: CF('v.v.n'), val: Z(22), say: '' },
            { c: CBT('shadow'), say: '🌑 그림자' }, { v: CF('v.y.n'), val: Z(16), say: '' }, { v: CF('v.b.n'), val: Z(34), say: '' }, { v: CF('v.c.a'), val: 30, say: '' },
            { c: CBT('rotate'), say: '🔄 살짝 기울여요 (안에 든 것도 같이)' }, { v: CF('v.v'), val: 3, say: '' },
            { c: CBT('flex-direction'), say: '🌳 안에 든 상자를 위아래로' }, { pick: CF('v.m', 'select'), opt: 'column', say: '' },
            { c: CBT('justify-content'), say: '' }, { pick: CF('v.m', 'select'), opt: 'flex-start', say: '위에서부터' },
            TIN, NM('사진'),
            { c: CNM('폭'), say: '사진 폭' }, { v: CF('v.v.n'), val: 100, say: '' }, { c: CNM('높이'), say: '사진 높이' }, { v: CF('v.v.n'), val: 76, say: '' },
            { c: CBT('linear-gradient'), say: '🌈 밤하늘' }, { v: CF('v.ang'), val: 180, say: '' }, ...STOP(CF, 0, '#2b2a5c'), ...STOP(CF, 1, '#ff9eb8'),
            { c: CBT('radial-gradient'), say: '🔆 별빛 점' }, { pick: CF('v.size', 'select'), opt: 'closest-side', say: '' }, ...STOP(CF, 0, '#ffffff'), ...STOP(CF, 1, '#ffffff', 22), ADDST(), ...STOP(CF, 2, '#ffffff', 26, 0),
            { c: '#ppProp .pp-cbk.open summary[data-cblay]', say: '🧭 놓는 방법' }, { pick: CF('L.sz', 'select'), opt: 'w h', say: '' }, { v: CF('L.w.n'), val: Z(30), say: '' }, { v: CF('L.h.n'), val: Z(30), say: '반복 = 별빛' },
            ROOT, TIN, NM('글씨'), NTX('별 보던 밤 ✦'),
            { c: CNM('바탕색'), say: '' }, { v: CF('v.c.a'), val: 0, say: '바탕은 투명' }, { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 100, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 22, say: '' },
            { c: CBT('font-family'), say: '🔤 손글씨 글꼴' }, { pick: CF('v.f', 'select'), opt: 'Gaegu', say: '' },
            { c: CBT('font-size'), say: '' }, { v: CF('v.s.n'), val: Z(46), say: '' }, { c: CBT('color'), say: '' }, { v: CF('v.c.c'), val: '#6b4a5a', say: '' },
            ROOT, TIN, NM('테이프'),
            { c: CBT('repeating-linear-gradient'), say: '🔁 하늘 줄무늬 마테' }, ...STOP(CF, 0, '#b3e5ff'), ...STOP(CF, 1, '#b3e5ff', Z(12)), ...STOP(CF, 2, '#e6f6ff', Z(12)), ...STOP(CF, 3, '#e6f6ff', Z(24)),
            { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 34, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 8, say: '' },
            { c: CBT('position'), say: '📍 직접 자리 (absolute)' }, { c: CBT('left'), say: '' }, { v: CF('v.v.n'), val: 0, say: '' }, { c: CBT('top'), say: '' }, { v: CF('v.v.n'), val: 0, say: '' },
            { c: CBT('translateX'), say: '' }, { v: CF('v.v.n'), val: -35, say: '' }, { c: CBT('rotate'), say: '🔄 비스듬히' }, { v: CF('v.v'), val: -38, say: '' },
            TSIB, NM('테이프2'), { c: CNM('왼쪽에서'), say: '오른쪽 아래로' }, { v: CF('v.v.n'), val: 80, say: '' }, { c: CNM('위에서'), say: '' }, { v: CF('v.v.n'), val: 93, say: '' },
            { c: M('svg'), say: '🌀 SVG 로 별 스티커' },
            { c: SBE('path'), say: '⭐' }, { v: SF('v.d'), val: () => ST(X(.38), Y(.3), D(.04)), say: '' }, { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#fff6c8', say: '' },
            { c: SBE('use'), say: '🪞 복사해 찍기' }, { v: SF('v.x'), val: () => D(.13), say: '' }, { v: SF('v.y'), val: () => DH(.025), say: '' },
            { c: SBE('use'), say: '🪞 한 번 더' }, { v: SF('v.x'), val: () => D(.1), say: '' }, { v: SF('v.y'), val: () => -DH(.04), say: '완성!' }] },
        /* ---------- 📃 🎀 그 스티커 전용 (도련 11-19 · 1313 "속지 · 마테에서 써먹을 예시") : ks = 볼 수 있는 스티커 ---------- */
        { m: 's', g: 'mix', lv: 1, e: '🎁', k: 'doodlewrap', n: '내 낙서 포장지', d: '작은 낙서를 그림 깔기로 반복 · 한 장 더 깔아 반 칸 비끼면 엇갈린 포장지', s: [
            { c: M('px'), say: '✏️ 픽셀로 작은 낙서부터' }, { c: PT('pencil'), say: '✏️ 연필' }, SZPX,
            ...COL(345, .55, 1, '🎨 분홍'), PXL(HT(124, 132, 16), '하트 하나'),
            ...COL(205, .6, .92, '🎨 하늘색'), PXL(ST(174, 170, 17), '별 하나'),
            ...COL(46, .75, 1, '🎨 노랑'), DOT(102, 104, '콕 (낙서 칸 왼쪽 위)'), DOT(198, 198, '콕 (오른쪽 아래)'),
            { c: M('css'), say: '🧩 CSS 로 포장지 한 장' }, TAB, FOLD, BOXR('w', 100), BOXR('h', 100), BOXR('x', 0), BOXR('y', 0),
            { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#fff3c9', say: '크림 노랑' },
            { c: CBT('url'), say: '🖼️ 그림 깔기' }, LYP('픽셀', '🗂️ 그림판 레이어 그림으로 → 아까 그린 낙서'),
            LAY, { pick: CF('L.sz', 'select'), opt: 'w h', say: '' }, { pick: CF('L.w.u', 'select'), opt: 'px', say: '' }, { v: CF('L.w.n'), val: () => R(D(.16)), say: '' }, { pick: CF('L.h.u', 'select'), opt: 'px', say: '' }, { v: CF('L.h.n'), val: () => R(D(.16)), say: '작게' },
            { pick: CF('L.rep', 'select'), opt: 'repeat', say: '🔁 반복 = 포장지!' },
            CDUP, LAY, { v: CF('L.x'), val: () => R(D(.08) / (W() - D(.16)) * 100), say: '' }, { v: CF('L.y'), val: () => R(D(.08) / (H() - D(.16)) * 100), say: '한 장 더 · 반 칸 비껴 놓아 엇갈리게' },
            { c: eye('px'), say: '👁 낙서 레이어는 숨겨요 · 완성!' }] },
        { m: 's', g: 'css', lv: 1, e: '📒', k: 'notegrid', ks: ['leaf'], n: '모눈 노트 속지', d: '가는 줄 두 장으로 모눈 · 장식(::before) 한 줄로 왼쪽 여백 선', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, FOLD, BOXR('w', 100), BOXR('h', 100), BOXR('x', 0), BOXR('y', 0),
            { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#fffdf6', say: '크림색 종이' },
            { c: CBT('repeating-linear-gradient'), say: '🔁 되풀이 줄 = 가로줄' }, { v: CF('v.ang'), val: 0, say: '' },
            ...STOP(CF, 0, '#bfe0f5', 0), ...STOP(CF, 1, '#bfe0f5', 2), ...STOP(CF, 2, '#ffffff', 2, 0), ...STOP(CF, 3, '#ffffff', 36, 0),
            CDUP, { v: CF('v.ang'), val: 90, say: '하나는 세로로 = 모눈!' },
            PART('pb', '✨ 장식 1 = 왼쪽 여백 선'),
            { c: CBT('background-color'), say: '🎨 선 색' }, { v: CF('v.c.c'), val: '#ff8fb1', say: '' },
            { c: CBT('width'), say: '↔️ 가늘게' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 4, say: '' },
            { c: CBT('height'), say: '↕️ 위에서 아래 끝까지' }, { pick: CF('v.v.u', 'select'), opt: '%', say: '' }, { v: CF('v.v.n'), val: 100, say: '' },
            { c: CBT('left'), say: '⇥ 왼쪽에서 조금' }, { pick: CF('v.v.u', 'select'), opt: '%', say: '' }, { v: CF('v.v.n'), val: 12, say: '' },
            { c: CBT('top'), say: '' }, { pick: CF('v.v.u', 'select'), opt: 'px', say: '' }, { v: CF('v.v.n'), val: 0, say: '완성! 속지 한 장' }] },
        { m: 's', g: 'css', lv: 1, e: '🎀', k: 'dottape', ks: ['tape'], n: '땡땡이 마스킹테이프', d: '원형 그라데이션 점을 종이 폭에 딱 맞게 반복 · 위아래 점선 테두리', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, FOLD, BOXR('w', 100), BOXR('h', 100), BOXR('x', 0), BOXR('y', 0),
            { c: OPEN1, say: '바탕색' }, { v: CF('v.c.c'), val: '#a8e2d0', say: '민트' }, { v: CF('v.c.a'), val: 85, say: '살짝 비치게 (테이프 느낌)' },
            { c: CBT('radial-gradient'), say: '🔆 동그란 점' }, { pick: CF('v.size', 'select'), opt: 'closest-side', say: '' }, ...STOP(CF, 0, '#ffffff'), ...STOP(CF, 1, '#ffffff', 40), ADDST(), ...STOP(CF, 2, '#ffffff', 46, 0),
            { c: '#ppProp .pp-cbk.open summary[data-cblay]', say: '🧭 놓는 방법' }, { pick: CF('L.sz', 'select'), opt: 'w h', say: '' }, { v: CF('L.w.n'), val: () => W() / 8, say: '' }, { v: CF('L.h.n'), val: () => H() / 4, say: '폭을 딱 나누는 크기 = 이어 붙여도 점이 안 잘려요' },
            { c: CBT('border-top'), say: '⬆️ 위 점선' }, { v: CF('v.w.n'), val: 3, say: '' }, { pick: CF('v.s', 'select'), opt: 'dashed', say: '점선' }, { v: CF('v.c.c'), val: '#ffffff', say: '' },
            { c: CBT('border-bottom'), say: '⬇️ 아래 점선' }, { v: CF('v.w.n'), val: 3, say: '' }, { pick: CF('v.s', 'select'), opt: 'dashed', say: '' }, { v: CF('v.c.c'), val: '#ffffff', say: '완성! 오른쪽 미리보기에서 이어지는 모습' }] },
        /* ---------- 🎬 움직이는 예시 (실험용 · 도련 개인) ---------- */
        { m: 'a', g: 'css', lv: 1, e: '🍭', k: 'lollipop', n: '빙글빙글 막대사탕', d: '상자 안에 사탕 · 막대 · 사탕에 되풀이 부채꼴 + 돌리기 움직임', s: [
            { c: M('css'), say: '🧩 CSS 로 가요' }, TAB, FOLD, BOX('w', 40), BOX('h', () => Math.round(40 * LW / LH * 1.7)), BOX('x', 30), BOX('y', 18),
            { c: OPEN1, say: '' }, { v: CF('v.c.a'), val: 0, say: '맨 위 상자는 투명하게' },
            { c: CBT('flex-direction'), say: '🌳 사탕 · 막대를 위아래로' }, { pick: CF('v.m', 'select'), opt: 'column', say: '' },
            TIN, NM('사탕'),
            { c: CNM('바탕색'), say: '' }, { v: CF('v.c.c'), val: '#ffffff', say: '' }, { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 100, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 59, say: '' },
            { c: CBT('border-radius'), say: '⬜ 동그랗게' }, { pick: CF('v.r.u', 'select'), opt: '%', say: '' }, { v: CF('v.r.n'), val: 50, say: '' },
            { c: CBT('repeating-conic-gradient'), say: '🌞 되풀이 부채꼴' }, ...STOP(CF, 0, '#ff7aa8', 0), ...STOP(CF, 1, '#ff7aa8', 45), ...STOP(CF, 2, '#ffffff', 45), ...STOP(CF, 3, '#ffffff', 90),
            { c: CBT('shadow'), say: '🌑 살짝 그림자' }, { v: CF('v.y.n'), val: Z(6), say: '' }, { v: CF('v.c.a'), val: 20, say: '' },
            { c: CBT('animation'), say: '🎬 사탕만 움직여요' }, { pick: CF('v.ease', 'select'), opt: 'linear', say: '같은 빠르기' }, { pick: CF('v.dir', 'select'), opt: 'normal', say: '한 방향으로' }, { v: CF('v.dur'), val: 3, say: '' },
            { v: CF('v.kf.0.v'), val: 0, say: '처음 0°' }, { v: CF('v.kf.1.v'), val: 360, say: '끝 360° = 빙글빙글' },
            ROOT, TIN, NM('막대'),
            { c: CNM('바탕색'), say: '' }, { v: CF('v.c.c'), val: '#d9c2a0', say: '' }, { c: CNM('폭'), say: '' }, { v: CF('v.v.n'), val: 7, say: '' }, { c: CNM('높이'), say: '' }, { v: CF('v.v.n'), val: 40, say: '' },
            { c: CBT('border-radius'), say: '' }, { v: CF('v.r.n'), val: Z(8), say: '완성! (막대는 가만히)' }] },
        { m: 'a', g: 'svg', lv: 1, e: '✍️', k: 'drawheart', n: '손글씨처럼 그려지는 하트', d: '하트 선을 긴 점선으로 만들고 점선 밀기를 움직이면 그려지듯 나타나요', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '✒️ 하트' }, { v: SF('v.d'), val: () => HT(X(.5), Y(.3), D(.3)), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.a'), val: 0, say: '속은 비워요' },
            { c: SBB('stroke'), say: '🖍' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: Z(14), say: '' }, { c: SBB('stroke-linecap'), say: '⏺ 둥근 끝' },
            { c: SBB('stroke-dasharray'), say: '┅ 아주 긴 점선 하나' }, { v: SK('v.a'), val: 2600, say: '' }, { v: SK('v.b'), val: 2600, say: '' },
            { c: SBB('animate'), say: '🎞 점선을 밀며 움직이기' }, { pick: SK('v.at', 'select'), opt: 'stroke-dashoffset', say: '' }, { v: SK('v.from'), val: '2600', say: '' }, { v: SK('v.to'), val: '0', say: '' }, { v: SK('v.dur'), val: 3, say: '그려지는 하트!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '💡', k: 'neon', n: '네온사인 글씨', d: '글자를 흐리게 두 번 겹쳐 번지게 + 진하기를 깜빡깜빡 움직여요', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('rect'), say: '⬛ 밤 배경' }, { v: SF('v.x'), val: 0, say: '' }, { v: SF('v.y'), val: 0, say: '' }, { v: SF('v.width'), val: () => W(), say: '' }, { v: SF('v.height'), val: () => H(), say: '' }, { v: SF('v.rx'), val: 0, say: '' }, { v: SF('v.ry'), val: 0, say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#2b2240', say: '' },
            { c: SBE('text'), say: '🔤' }, { v: SF('v.t', 'textarea'), val: 'LOVE', say: '' }, { c: SBB('font-size'), say: '' }, { v: SK('v.v'), val: () => D(1 / 4.2), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ff8fd0', say: '' },
            { c: SBB('feGaussianBlur'), say: '🪄 흐리게 = 빛 번짐' }, { v: SK('v.s'), val: Z(10), say: '' },
            { c: SBB('feMerge'), say: '🪄 번짐 두 번 + 글자' }, { pick: SK('v.a', 'select'), opt: 'prev', say: '' }, { pick: SK('v.b', 'select'), opt: 'prev', say: '' }, { pick: SK('v.c', 'select'), opt: 'SourceGraphic', say: '' },
            { c: SBB('animate'), say: '🎞 진하기 깜빡' }, { v: SK('v.to'), val: '0.45', say: '' }, { v: SK('v.dur'), val: 1.2, say: '네온 완성!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '🌈', k: 'holo', n: '홀로그램 반짝 별', d: '무지개 그라데이션을 거울 반복으로 · 그라데이션 움직이기로 흘러요', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('path'), say: '⭐' }, { v: SF('v.d'), val: () => ST(X(.5), Y(.4), D(.3)), say: '' },
            { c: SBB('linearGradient'), say: '🌈 무지갯빛' }, { pick: SK('v.sp', 'select'), opt: 'reflect', say: '바깥은 거울 반복' },
            ADDST(1), ADDST(1), ADDST(1), ...STOP(SK, 0, '#ffb3d9', 0), ...STOP(SK, 1, '#b3e5ff', 25), ...STOP(SK, 2, '#d9b3ff', 50), ...STOP(SK, 3, '#b3ffd9', 75), ...STOP(SK, 4, '#ffb3d9', 100),
            { c: SBB('stroke'), say: '🖍' }, { v: SK('v.c.c'), val: '#ffffff', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: Z(16), say: '' }, { c: SBB('stroke-linejoin'), say: '' },
            { c: SBB('animate-gradient'), say: '🌈 그라데이션 움직이기 = 흐르는 홀로그램!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '🫧', k: 'bubble', n: '떠오르는 비눗방울', d: '원형 그라데이션 원 셋 · 길 따라 움직이기로 위로 올라가요 (빠르기만 다르게)', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪' }, { v: SF('v.cy'), val: () => Y(.92), say: '아래에서' }, { v: SF('v.r'), val: () => D(.07), say: '' },
            { c: SBB('radialGradient'), say: '🔆 비눗방울 빛' }, ...STOP(SK, 0, '#ffffff', 0), ...STOP(SK, 1, '#9fd8ff', 100, 75),
            { c: SBB('animateMotion'), say: '🛤 위로 올라가는 길' }, { v: SK('v.d'), val: () => `M 0 0 C ${R(-D(.1))} ${R(-DH(.3))} ${R(D(.1))} ${R(-DH(.6))} 0 ${R(-DH(1))}`, say: '' },
            SDUP, { v: SF('v.cx'), val: () => X(.25), say: '왼쪽에 하나 더' }, { v: SF('v.r'), val: () => D(.08), say: '' },
            SDUP, { v: SF('v.cx'), val: () => X(.76), say: '오른쪽에도' }, { v: SF('v.r'), val: () => D(.055), say: '' },
            { c: SKN('길 따라'), say: '' }, { v: SK('v.dur'), val: 5.5, say: '빠르기를 다르게 · 완성!' }] },
        { m: 'a', g: 'svg', lv: 2, e: '💓', k: 'pulse', n: '두근두근 심장 + 파동', d: '같은 고리 셋에 커지기 · 옅어지기 움직임 · 기다렸다 시작만 0 · 0.6 · 1.2초', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('circle'), say: '⚪ 파동 고리' }, { v: SF('v.cy'), val: () => Y(.4), say: '' }, { v: SF('v.r'), val: () => D(.17), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.a'), val: 0, say: '' }, { c: SBB('stroke'), say: '' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: Z(5), say: '' },
            { c: SBB('css-animation'), say: '🎬 커지면서' }, { v: SK('v.a'), val: .4, say: '' }, { v: SK('v.b'), val: 1.6, say: '' }, { v: SK('v.dur'), val: 1.8, say: '' }, { pick: SK('v.dir', 'select'), opt: 'normal', say: '' }, { pick: SK('v.ease', 'select'), opt: 'ease-out', say: '' },
            { c: SBB('css-animation'), say: '🎬 옅어지기' }, { pick: SK('v.p', 'select'), opt: 'opacity', say: '' }, { v: SK('v.a'), val: .9, say: '' }, { v: SK('v.b'), val: 0, say: '' }, { v: SK('v.dur'), val: 1.8, say: '' }, { pick: SK('v.dir', 'select'), opt: 'normal', say: '' }, { pick: SK('v.ease', 'select'), opt: 'ease-out', say: '' },
            SDUP, { c: SKNI('CSS 움직임', 0), say: '두 번째 고리 = 0.6초 늦게' }, { v: SK('v.delay'), val: .6, say: '' }, { c: SKNI('CSS 움직임', 1), say: '' }, { v: SK('v.delay'), val: .6, say: '' },
            SDUP, { c: SKNI('CSS 움직임', 0), say: '세 번째 고리 = 1.2초 늦게' }, { v: SK('v.delay'), val: 1.2, say: '' }, { c: SKNI('CSS 움직임', 1), say: '' }, { v: SK('v.delay'), val: 1.2, say: '' },
            { c: SBE('path'), say: '✒️ 심장' }, { v: SF('v.d'), val: () => HT(X(.5), Y(.4) - D(.1), D(.11)), say: '' }, { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ff5d8f', say: '' },
            { c: SBB('css-animation'), say: '🎬 두근두근' }, { v: SK('v.b'), val: 1.12, say: '' }, { v: SK('v.dur'), val: .45, say: '완성!' }] },
        { m: 'a', g: 'svg', lv: 3, e: '🌸', k: 'flower', n: '빙글 도는 꽃 만다라', d: '꽃잎 하나를 복사해 찍기(use)로 60°씩 다섯 번 · 통째로 돌기', s: [
            { c: M('svg'), say: '🌀 SVG 로 가요' },
            { c: SBE('ellipse'), say: '🥚 꽃잎 하나' }, { v: SF('v.cy'), val: () => Y(.4) - D(.17), say: '' }, { v: SF('v.rx'), val: () => D(.065), say: '' }, { v: SF('v.ry'), val: () => D(.16), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffb3c9', say: '' }, { v: SK('v.c.a'), val: 85, say: '' },
            { c: SBB('animateTransform'), say: '🔄 종이 가운데를 돌아요' }, { v: SK('v.from'), val: () => `0 ${R(X(.5))} ${R(Y(.4))}`, say: '' }, { v: SK('v.to'), val: () => `360 ${R(X(.5))} ${R(Y(.4))}`, say: '' }, { v: SK('v.dur'), val: 9, say: '' },
            ...[1, 2, 3, 4, 5].flatMap(i => [{ c: SBE('use'), say: i === 1 ? '🪞 복사해 찍기' : '' }, { v: SF('v.x'), val: 0, say: '' }, { c: SBB('rotate'), say: i === 1 ? '🔄 60° 돌려 놓기' : '' }, { v: SK('v.a'), val: 60, say: '' }, { v: SK('v.cy'), val: () => Y(.4), say: '' }]),
            { c: SBE('circle'), say: '⚪ 꽃 가운데' }, { v: SF('v.cy'), val: () => Y(.4), say: '' }, { v: SF('v.r'), val: () => D(.06), say: '' }, { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffd23f', say: '완성!' }] },
        /* ---------- 🐾 동물 캐릭터 (도련 11-19 · 시안 = outputs 예시보기_동물스티커_시안.html 과 같게) : 시안 300 × 300 칸 → 지금 종이 (MX · MY · U)
           ✒️ 벡터 = 〰️ 곡선을 시안 길 그대로 따라 그어요 (CRV) · 부리 = ✒️ 점 찍기 · 눈 = ◯ · 🪣 칠하기 / 🧩 CSS = 상자 나무 (시안 칸 → 상자 안 %) / 🌀 SVG = 시안 길 그대로 (TP) ---------- */
        { m: 'a', g: 'mix', lv: 3, e: '🐻', k: 'bear', n: '코코아 곰돌이', d: '벡터로 몸을 그리고 칠하기 · 얼굴 · 머그 · 김은 CSS 상자로 얹어 깜빡 · 피어오르기', s: [
            { c: M('vec'), say: '✒️ 벡터로 몸부터 그려요' }, OP1, ...COL(14, .48, .42, '🎨 진한 갈색 = 선'), VSW(5),
            ...CRV(BR.earL, '〰️ 곡선으로 귀를 따라 그려요'), ...CRV(BR.earR, ''), ...CRV(BR.body, '몸'), ...CRV(BR.head, '머리 (귀 위로)'),
            ...COL(27, .465, .85, '🎨 곰 갈색'), { c: PT('paint'), say: '🪣 칠하기' }, TAPV(84, 104, '귀'), TAPV(216, 104, ''), TAPV(110, 252, '몸'), TAPV(150, 122, '머리'),
            ...DESEL, VSW(0, '선 없이 (굵기 0)'), ...CRV(BR.inL, '귀 안'), ...CRV(BR.inR, ''), ...CRV(BR.muz, '주둥이'), ...CRV(BR.bel, '배'),
            ...COL(26, .325, .965, '🎨 귀 안 살구색'), { c: PT('paint'), say: '' }, TAPV(89, 106, ''), TAPV(211, 106, ''),
            ...COL(31, .22, .965, '🎨 크림색'), TAPV(150, 184, '주둥이'), TAPV(150, 262, '배'),
            { c: M('css'), say: '🧩 CSS 로 얼굴 · 머그 · 김' }, TAB, FOLD, BOX('w', 60), BOX('h', () => 60 * LW / LH), BOX('x', 20), BOX('y', () => 40 - 30 * LW / LH),
            { c: OPEN1, say: '' }, { v: CF('v.c.a'), val: 0, say: '맨 위 상자 = 투명한 곰 칸' },
            ...KID('눈', '#6b4438', 118, 150, 12, 15, 50, '👀 눈'),
            { c: CBT('animation'), say: '🎬 깜빡 (높이를 잠깐 줄여요)' }, { v: CF('v.dur'), val: 4, say: '' }, { pick: CF('v.dir', 'select'), opt: 'normal', say: '' }, { pick: CF('v.ease', 'select'), opt: 'linear', say: '' },
            ...KF(0, 'height', 0, () => R(15 * U())), ...KF(1, 'height', 90, () => R(15 * U())), ADDKF, ...KF(2, 'height', 95, () => R(2 * U())), ADDKF, ...KF(3, 'height', 100, () => R(15 * U())),
            TIN, NM('반짝'), { c: CNM('바탕색'), say: '✨ 눈 반짝이 (눈 안에 상자)' }, { v: CF('v.c.c'), val: '#ffffff', say: '' }, ...SZ(33, 27), ...RD(50), ...AT(25, 20),
            { c: NODE(1), say: '눈을 다시 골라요' }, ...TW('눈2', 170), TIN, NM('반짝', '같은 이름 = 같은 반짝이'),
            ...KID('볼', '#ff9fb8', 92, 172, 28, 15, 50, '🌸 볼터치'), { c: CNM('바탕색'), say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            { c: CBT('radial-gradient'), say: '🔆 가운데만 진하게' }, ...STOP(CF, 0, '#ff9fb8', 40), ...STOP(CF, 1, '#ff9fb8', 72, 0), ...TW('볼2', 180),
            ...KID('코', '#6b4438', 140, 168, 20, 13, 50, '코'),
            ...KID('입', '#6b4438', 138, 182, 12, 9, 50, '입 (아래 테두리만)'), { c: CNM('바탕색'), say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            ...BSIDE('bottom', 3, '#6b4438', '🖍 아래 · 왼쪽 · 오른쪽 테두리 = ∪'), ...BSIDE('left', 3, '#6b4438'), ...BSIDE('right', 3, '#6b4438'), ...TW('입2', 150),
            ...KID('김', '#ffffff', 200, 160, 10, 26, 0, '♨️ 김 한 줄'), { c: CNM('바탕색'), say: '' }, { v: CF('v.c.a'), val: 0, say: '' },
            { c: CBT('border-left'), say: '왼쪽 테두리 = 김' }, { v: CF('v.w.n'), val: () => R(4 * U()), say: '' }, { v: CF('v.c.c'), val: '#d8c3cb', say: '' },
            { c: CBT('border-radius'), say: '' }, { v: CF('v.r.n'), val: () => R(10 * U()), say: '' },
            { c: CBT('animation'), say: '🎬 피어오르며 사라져요' }, { v: CF('v.dur'), val: 2.4, say: '' }, { pick: CF('v.dir', 'select'), opt: 'normal', say: '' }, { pick: CF('v.ease', 'select'), opt: 'ease-in', say: '' },
            ...KF(0, 'translateY', 0, () => R(20 * U())), ...KF(1, 'translateY', 100, () => R(-22 * U())), ADDKF, ...KF(2, 'opacity', 0, 0), ADDKF, ...KF(3, 'opacity', 30, 1), ADDKF, ...KF(4, 'opacity', 100, 0),
            ...TW('김2', 214), { c: CNM('움직임'), say: '0.8초 늦게' }, { v: CF('v.delay'), val: .8, say: '' },
            ...TW('김3', 228), { c: CNM('움직임'), say: '1.6초 늦게' }, { v: CF('v.delay'), val: 1.6, say: '' },
            ...KID('머그', '#ff9dbb', 186, 206, 62, 58, 0, '☕ 머그컵'),
            { c: CBT('linear-gradient'), say: '🌈 위는 하양 · 아래는 분홍' }, { v: CF('v.ang'), val: 180, say: '' }, ...STOP(CF, 0, '#ffffff', 22), ...STOP(CF, 1, '#ff9dbb', 22),
            { c: CBT('border'), say: '🖍 테두리' }, { v: CF('v.w.n'), val: () => R(4 * U()), say: '' }, { pick: CF('v.s', 'select'), opt: 'solid', say: '' }, { v: CF('v.c.c'), val: '#6b4438', say: '' },
            { c: CBT('border-radius'), say: '' }, { v: CF('v.r.n'), val: () => R(12 * U()), say: '' },
            NTX('♥'), { c: CBT('color'), say: '하얀 하트' }, { v: CF('v.c.c'), val: '#ffffff', say: '' }, { c: CBT('font-size'), say: '' }, { v: CF('v.s.n'), val: () => R(20 * U()), say: '' },
            { c: CBT('display'), say: '' }, { c: CBT('justify-content'), say: '' }, { pick: CF('v.m', 'select'), opt: 'center', say: '가운데로' }, { c: CBT('align-items'), say: '' },
            TIN, NM('손잡이'), { c: CNM('바탕색'), say: '손잡이 (머그 안 상자 · 오른쪽 밖으로)' }, { v: CF('v.c.a'), val: 0, say: '' }, ...SZ(29, 41),
            ...BSIDE('top', 4, '#6b4438'), ...BSIDE('right', 4, '#6b4438'), ...BSIDE('bottom', 4, '#6b4438'), { c: CBT('border-radius'), say: '' }, { v: CF('v.r.n'), val: () => R(14 * U()), say: '' }, ...AT(100, 21, '완성!')] },
        { m: 'a', g: 'mix', lv: 3, e: '🐧', k: 'penguin', n: '눈 오는 날 펭귄', d: '벡터로 몸을 그리고 칠하기 · 볼 · 목도리 · 눈송이는 SVG 로 얹어 펄럭 · 내려오기', s: [
            { c: M('vec'), say: '✒️ 벡터로 몸부터 그려요' }, OP1, ...COL(253, .34, .31, '🎨 진한 보라 남색 = 선'), VSW(5),
            ...CRV(PG.flL, '〰️ 곡선으로 날개를 따라 그려요'), ...CRV(PG.flR, ''), ...CRV(PG.body, '몸'),
            ...COL(220, .39, .48, '🎨 남색'), { c: PT('paint'), say: '🪣 칠하기' }, TAPV(66, 196, '날개'), TAPV(234, 196, ''), TAPV(150, 90, '몸'),
            ...DESEL, VSW(0, '선 없이 (굵기 0)'), ...CRV(PG.bel, '하얀 배'), SWC('#ffffff', '하양'), { c: PT('paint'), say: '' }, TAPV(150, 200, ''),
            ...DESEL, ...COL(253, .34, .31, ''), VSW(5), ...CRV(PG.footL, '발'), ...CRV(PG.footR, ''),
            ...PEN([[138, 138], [162, 138], [150, 154]], '✒️ 점 세 개 = 부리 (처음 점을 누르면 닫혀요)'),
            ...COL(35, .72, 1, '🎨 주황'), { c: PT('paint'), say: '🪣' }, TAPV(126, 275, '발'), TAPV(174, 275, ''), TAPV(150, 144, '부리'),
            ...DESEL, VSW(0, '눈은 선 없이'), ...ELLS(121, 117, 135, 131, '◯ 눈'), ...ELLS(165, 117, 179, 131, ''), ...COL(253, .34, .31, ''), { c: PT('paint'), say: '' }, TAPV(128, 124, ''), TAPV(172, 124, ''),
            ...ELLS(127.5, 118.5, 132.5, 123.5, '✨ 눈 반짝이'), ...ELLS(171.5, 118.5, 176.5, 123.5, ''), SWC('#ffffff', ''), { c: PT('paint'), say: '' }, TAPV(130, 121, ''), TAPV(174, 121, ''),
            { c: M('svg'), say: '🌀 SVG 로 볼 · 목도리 · 눈송이' },
            { c: SBE('ellipse'), say: '🌸 볼' }, { v: SF('v.cx'), val: () => MX(114), say: '' }, { v: SF('v.cy'), val: () => MY(144), say: '' }, { v: SF('v.rx'), val: () => 14 * U(), say: '' }, { v: SF('v.ry'), val: () => 8 * U(), say: '' },
            { c: SBB('radialGradient'), say: '🔆 가운데만 진하게' }, ...STOP(SK, 0, '#ffa3bd'), ...STOP(SK, 1, '#ffa3bd', 100, 0),
            SDUP, { v: SF('v.cx'), val: () => MX(186), say: '오른쪽 볼' },
            { c: SBE('path'), say: '🧣 목도리 끝자락 (길)' }, { v: SF('v.d'), val: () => TP(PG.tail), say: '' }, ...SCARF,
            { c: SBB('animate'), say: '🎬 길 모양을 바꾸며 펄럭' }, { pick: SK('v.at', 'select'), opt: 'd', say: '' }, { v: SK('v.from'), val: () => TP(PG.tail), say: '' }, { v: SK('v.to'), val: () => TP(PG.tail2), say: '' }, { v: SK('v.dur'), val: .8, say: '' }, { v: SK('v.alt'), val: true, say: '왔다 갔다' },
            { c: SBE('path'), say: '🧣 목도리' }, { v: SF('v.d'), val: () => TP(PG.scarf), say: '' }, ...SCARF,
            ...SNOW.flatMap((f, i) => i ? [SDUP, { v: SF('v.cx'), val: () => MX(f[0]), say: '' }, { v: SF('v.r'), val: () => f[1] * U(), say: '' }, { c: SKN('돌기'), say: '' }, { v: SK('v.to'), val: () => `${R(f[2] * U())} ${R(310 * U())}`, say: '' }, { v: SK('v.dur'), val: f[3], say: '' }, { v: SK('v.begin'), val: f[4], say: i === SNOW.length - 1 ? '완성!' : '' }]
                : [{ c: SBE('circle'), say: '❄️ 눈송이' }, { v: SF('v.cx'), val: () => MX(f[0]), say: '' }, { v: SF('v.cy'), val: () => MY(0), say: '' }, { v: SF('v.r'), val: () => f[1] * U(), say: '' },
                    { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffffff', say: '' }, { c: SBB('stroke'), say: '' }, { v: SK('v.c.c'), val: '#a9c8ff', say: '' }, { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: () => R(2 * U() * 10) / 10, say: '' },
                    { c: SBB('animateTransform'), say: '🎬 아래로 내려와요' }, { pick: SK('v.ty', 'select'), opt: 'translate', say: '' }, { v: SK('v.from'), val: () => `0 ${R(-10 * U())}`, say: '' }, { v: SK('v.to'), val: () => `${R(f[2] * U())} ${R(310 * U())}`, say: '' }, { v: SK('v.dur'), val: f[3], say: '' }])] },
        { m: 'a', g: 'mix', lv: 2, e: '🎈', k: 'catballoon', n: '둥실 풍선 고양이', d: '벡터 그림을 CSS 그림 깔기로 가져와 흔들기 움직임 + 색 돌리기 움직임', s: [
            { c: M('vec'), say: '✒️ 벡터로 고양이 풍선' }, OP1, ...COL(14, .48, .42, '🎨 진한 갈색 = 선'), VSW(5),
            ...CRV(CATP.head, '〰️ 곡선으로 귀 달린 얼굴'), ...CRV(CATP.string, '풍선 줄'), ...CRV(CATP.mouth, '입'),
            ...ELLS(124, 99, 138, 113, '◯ 눈'), ...ELLS(162, 99, 176, 113, ''),
            ...COL(345, .3, 1, '🎨 연분홍'), { c: PT('paint'), say: '🪣 칠하기' }, TAPV(150, 150, '얼굴'),
            ...COL(14, .48, .42, '🎨 눈은 진한 갈색'), TAPV(131, 106, ''), TAPV(169, 106, ''),
            { c: M('css'), say: '🧩 CSS 로 가져와요' }, TAB, FOLD, ...BXC(85, 26, 215, 258),
            { c: OPEN1, say: '' }, { v: CF('v.c.a'), val: 0, say: '바탕은 투명' },
            { c: CBT('url'), say: '🖼️ 그림 깔기' }, LYP('벡터', '🗂️ 그림판 레이어 그림으로 → 벡터 (선명한 그대로)'),
            LAY, { pick: CF('L.sz', 'select'), opt: 'contain', say: '상자에 쏙' },
            { c: CBT('animation'), say: '🎬 움직임 = 좌우로 흔들 (처음 장면이 돌리기예요)' }, { v: CF('v.dur'), val: 2.6, say: '' },
            ADDKF, ...KF(2, 'translateY', 0, () => R(8 * U())), ADDKF, ...KF(3, 'translateY', 100, () => R(-8 * U())),
            { c: CBT('animation'), say: '🎬 움직임 하나 더 = 🎡 색 돌리기' }, { pick: CF('v.ease', 'select'), opt: 'linear', say: '' }, { pick: CF('v.dir', 'select'), opt: 'normal', say: '' }, { v: CF('v.dur'), val: 6, say: '' },
            ...KF(0, 'hue-rotate', 0, 0), ...KF(1, 'hue-rotate', 100, 360),
            { c: eye('vec'), say: '👁 벡터 레이어는 숨겨요 · 완성!' }] },
        { m: 'a', g: 'mix', lv: 2, e: '🐰', k: 'bunnyhop', n: '통통 튀는 토끼', d: '벡터 토끼를 꽉 늘여 깔고 폭 · 높이 · 세로 옮기기를 움직이면 찌그러졌다 콩', s: [
            { c: M('vec'), say: '✒️ 벡터로 토끼' }, OP1, ...COL(14, .48, .42, '🎨 진한 갈색 = 선'), VSW(5),
            ...CRV(BUNP.earL, '〰️ 귀'), ...CRV(BUNP.earR, ''), ...CRV(BUNP.body, '몸 (귀 위로)'),
            ...COL(30, .02, 1, '🎨 하양'), { c: PT('paint'), say: '🪣 칠하기' }, TAPV(124, 100, ''), TAPV(176, 100, ''), TAPV(150, 160, ''),
            ...DESEL, VSW(0, '선 없이'), ...CRV(BUNP.inL, '귀 안'), ...CRV(BUNP.inR, ''),
            ...ELLS(105, 192, 125, 204, '볼'), ...ELLS(175, 192, 195, 204, ''),
            ...COL(345, .35, 1, '🎨 분홍'), { c: PT('paint'), say: '' }, TAPV(124, 112, ''), TAPV(176, 112, ''), TAPV(115, 198, ''), TAPV(185, 198, ''),
            ...COL(14, .48, .42, '🎨 진한 갈색'), ...ELLS(125, 174, 137, 186, '◯ 눈'), ...ELLS(163, 174, 175, 186, ''),
            { c: PT('paint'), say: '' }, TAPV(131, 180, ''), TAPV(169, 180, ''),
            VSW(4, '입은 선으로'), ...CRV(BUNP.mouth, ''),
            { c: M('css'), say: '🧩 CSS 로 가져와요' }, TAB, FOLD, ...BXC(70, 40, 230, 260),
            { c: OPEN1, say: '' }, { v: CF('v.c.a'), val: 0, say: '바탕은 투명' },
            { c: CBT('display'), say: '🌳 안의 상자를 바닥 가운데에' }, { c: CBT('justify-content'), say: '' }, { pick: CF('v.m', 'select'), opt: 'center', say: '' }, { c: CBT('align-items'), say: '' }, { pick: CF('v.m', 'select'), opt: 'flex-end', say: '아래로' },
            { c: CBT('radial-gradient'), say: '🔆 바닥 그림자' }, ...STOP(CF, 0, '#6b4438', 0, 22), ...STOP(CF, 1, '#6b4438', 70, 0),
            LAY, { pick: CF('L.sz', 'select'), opt: 'w h', say: '' }, { pick: CF('L.w.u', 'select'), opt: '%', say: '' }, { v: CF('L.w.n'), val: 70, say: '' }, { pick: CF('L.h.u', 'select'), opt: '%', say: '' }, { v: CF('L.h.n'), val: 10, say: '' }, { v: CF('L.y'), val: 100, say: '' }, { pick: CF('L.rep', 'select'), opt: 'no-repeat', say: '' },
            TIN, NM('토끼'), { c: CNM('바탕색'), say: '' }, { v: CF('v.c.a'), val: 0, say: '' }, ...SZ(80, 70),
            { c: CBT('url'), say: '🖼️ 그림 깔기' }, LYP('벡터', '🗂️ 그림판 레이어 그림으로 → 토끼'), LAY, { pick: CF('L.sz', 'select'), opt: 'w h', say: '꽉 늘이기 (100% · 100%) = 상자 따라 찌그러져요' },
            { c: CBT('animation'), say: '🎬 통통' }, { v: CF('v.dur'), val: 1, say: '' }, { pick: CF('v.dir', 'select'), opt: 'normal', say: '' }, { pick: CF('v.ease', 'select'), opt: 'cubic-bezier(.34,1.56,.64,1)', say: '' },
            ...KF(0, 'width', 0, () => R(160 * .9 * U())), ...KF(1, 'width', 100, () => R(160 * .9 * U())), ADDKF, ...KF(2, 'width', 45, () => R(160 * .72 * U())),
            ADDKF, ...KF(3, 'height', 0, () => R(220 * .62 * U())), ADDKF, ...KF(4, 'height', 45, () => R(220 * .8 * U())), ADDKF, ...KF(5, 'height', 100, () => R(220 * .62 * U())),
            ADDKF, ...KF(6, 'translateY', 45, () => R(-55 * U())),
            { c: eye('vec'), say: '👁 벡터 레이어는 숨겨요 · 완성!' }] },
        { m: 'a', g: 'mix', lv: 3, e: '🫧', k: 'bubblebear', n: '비눗방울 속 곰돌이', d: '벡터 곰을 SVG 그림으로 넣고 노이즈 → 일렁이기 · 원형 그라데이션 방울 · 둥실', s: [
            { c: M('vec'), say: '✒️ 벡터로 곰 얼굴' }, OP1, ...COL(14, .48, .42, '🎨 진한 갈색 = 선'), VSW(5),
            ...CRV(BR.earL, '〰️ 귀'), ...CRV(BR.earR, ''), ...CRV(BR.head, '얼굴 (귀 위로)'),
            ...COL(27, .465, .85, '🎨 곰 갈색'), { c: PT('paint'), say: '🪣 칠하기' }, TAPV(84, 104, ''), TAPV(216, 104, ''), TAPV(150, 122, ''),
            ...DESEL, VSW(0, '선 없이'), ...CRV(BR.inL, '귀 안'), ...CRV(BR.inR, ''), ...CRV(BR.muz, '주둥이'),
            ...COL(26, .325, .965, '🎨 살구색'), { c: PT('paint'), say: '' }, TAPV(89, 106, ''), TAPV(211, 106, ''), ...COL(31, .22, .965, '🎨 크림색'), TAPV(150, 184, ''),
            ...ELLS(120, 140, 134, 154, '◯ 눈'), ...ELLS(166, 140, 180, 154, ''), ...ELLS(140, 164, 160, 176, '코'),
            ...COL(14, .48, .42, '🎨 진한 갈색'), { c: PT('paint'), say: '' }, TAPV(127, 147, ''), TAPV(173, 147, ''), TAPV(150, 170, ''),
            { c: M('svg'), say: '🌀 SVG 로 가져와요' },
            { c: SBE('image'), say: '🖼️ 그림' }, LYP('벡터', '🗂️ 그림판 레이어 그림으로 → 곰', '#ppProp .pp-cbk.sbe.picked'),
            { v: SF('v.x'), val: () => MX(80), say: '' }, { v: SF('v.y'), val: () => MY(80), say: '' }, { v: SF('v.width'), val: () => 140 * U(), say: '' }, { v: SF('v.height'), val: () => 150 * U(), say: '방울 안 자리' },
            { c: SBB('feTurbulence'), say: '🌀 노이즈 만들기' }, { pick: SK('v.ty', 'select'), opt: 'fractalNoise', say: '' }, { v: SK('v.bf'), val: .02, say: '' },
            { c: SBB('feDisplacementMap'), say: '🌊 일렁이기 = 노이즈대로 살짝 밀어요' }, { v: SK('v.sc'), val: Z(8), say: '' },
            ...FLOAT,
            { c: SBE('circle'), say: '⚪ 방울' }, { v: SF('v.cx'), val: () => MX(150), say: '' }, { v: SF('v.cy'), val: () => MY(155), say: '' }, { v: SF('v.r'), val: () => 112 * U(), say: '' },
            { c: SBB('radialGradient'), say: '🔆 가운데는 투명 · 가장자리 분홍' }, ADDST(1), ...STOP(SK, 0, '#ffffff', 0, 85), ...STOP(SK, 1, '#dff1ff', 60, 20), ...STOP(SK, 2, '#ffc4dc', 100, 65),
            { c: SBB('linearGradient'), say: '🌈 테두리 무지갯빛' }, { pick: SK('v.to', 'select'), opt: 'stroke', say: '' }, ADDST(1), ADDST(1), ...STOP(SK, 0, '#ffb3c8', 0), ...STOP(SK, 1, '#fff2a8', 35), ...STOP(SK, 2, '#a8e6cf', 65), ...STOP(SK, 3, '#a9c9ff', 100),
            { c: SBB('stroke-width'), say: '' }, { v: SK('v.v'), val: Z(6), say: '' },
            { c: SBB('animate-gradient'), say: '🌈 그라데이션 움직이기' }, { pick: SK('v.k', 'select'), opt: 'rotate', say: '' },
            ...FLOAT,
            { c: SBE('ellipse'), say: '✨ 반짝' }, { v: SF('v.cx'), val: () => MX(108), say: '' }, { v: SF('v.cy'), val: () => MY(92), say: '' }, { v: SF('v.rx'), val: () => 20 * U(), say: '' }, { v: SF('v.ry'), val: () => 11 * U(), say: '' },
            { c: SBB('fill'), say: '' }, { v: SK('v.c.c'), val: '#ffffff', say: '' }, { v: SK('v.c.a'), val: 90, say: '' },
            ...FLOAT,
            { c: eye('vec'), say: '👁 벡터 레이어는 숨겨요 · 둥실 완성!' }] },
    ];
    const GN = { css: '🧩 CSS', svg: '🌀 SVG', mix: '🔗 섞기' };

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
        else if (s.tap) { const el = await get(s.tap); if (!el) throw new Error('없음 ' + s.tap); el.scrollIntoView({ block: 'nearest' }); const r = el.getBoundingClientRect(), q = { clientX: r.left + r.width * s.at[0], clientY: r.top + r.height * s.at[1] };   // 🎨 그 자리 누르기 (색 띠 · 밝기 판)
            const c = $('#ptCur'); if (c) { c.style.transitionDuration = (T.fast ? 0 : 500 / T.speed) + 'ms'; c.style.left = q.clientX + 'px'; c.style.top = q.clientY + 'px'; } await wait(550); await tap();
            const o = Object.assign({ bubbles: true, pointerId: 78, pointerType: 'mouse', button: 0, isPrimary: true }, q); el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({ buttons: 1 }, o))); el.dispatchEvent(new PointerEvent('pointerup', Object.assign({ buttons: 0 }, o))); window.dispatchEvent(new PointerEvent('pointerup', Object.assign({ buttons: 0 }, o))); }
        else if (s.drag) { const st = $('#ppStage'), cv = $('#ppCv'); if (!st || !cv) return true; const r = cv.getBoundingClientRect(), pt = ([fx, fy]) => ({ clientX: r.left + r.width * fx, clientY: r.top + r.height * fy }), DR = typeof s.drag === 'function' ? s.drag() : s.drag;
            const ev = (k, q) => st.dispatchEvent(new PointerEvent(k, Object.assign({ bubbles: true, pointerId: 77, pointerType: 'mouse', button: 0, buttons: k === 'pointerup' ? 0 : 1, isPrimary: true }, q)));
            const c = $('#ptCur'), A = pt(DR[0]), B = pt(DR[DR.length - 1]); c.style.transitionDuration = (T.fast ? 0 : 500 / T.speed) + 'ms'; c.style.left = A.clientX + 'px'; c.style.top = A.clientY + 'px'; await wait(550);
            ev('pointerdown', A); const n = T.fast ? 2 : 16; c.style.transitionDuration = '0ms';
            if (DR.length > 2) { for (const f of DR.slice(1)) { const q = pt(f); ev('pointermove', q); c.style.left = q.clientX + 'px'; c.style.top = q.clientY + 'px'; if (T.fast) await new Promise(r => requestAnimationFrame(r)); else await wait(25); } }   /* 그림판은 한 화면에 한 번만 받아요 (빠르게도 한 점씩) */   // 〰️ 길 따라 (점 여러 개)
            else for (let k = 1; k <= n; k++) { const q = { clientX: A.clientX + (B.clientX - A.clientX) * k / n, clientY: A.clientY + (B.clientY - A.clientY) * k / n }; ev('pointermove', q); c.style.left = q.clientX + 'px'; c.style.top = q.clientY + 'px'; await wait(30); }
            ev('pointerup', B); }
        if (s.pause) await new Promise(r => setTimeout(r, s.pause));   // 그림판이 칸을 다시 그릴 때까지 (이름 바꾸기 = 0.5초 뒤)
        await wait(s.say ? 900 : 350); return true;
    }
    async function play(ex) {
        const run = ++T.run; T.ex = ex; T.i = 0; $('#ptT').textContent = `${GN[ex.g]} · ${ex.e} ${ex.n}`;
        try {
            for (; T.i < ex.s.length; T.i++) { if (!T.on || run !== T.run) return; $('#ptN').textContent = `${T.i + 1} / ${ex.s.length}`; if (!(await doStep(ex.s[T.i], run))) return; }
        } catch (e) { console.warn('🎓 예시 보기', e); bub('⚠ 메뉴를 찾지 못했어요 · ✕ 끝내기를 눌러요'); T.err = String(e.message || e); return; }
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
        if (!window.ppTourHook || !ppTourHook.on) return; if (!canRun(ex)) { noRun(ex); return; } if (ppTourHook.busy) ppTourHook.end(false);
        if (!ppTourHook.begin()) return; T.on = true; T.pause = false; T.done = false; T.err = ''; ui(); document.body.classList.add('pt-on'); play(ex);
    }
    function finish() { T.run++; const d = $('#ptDone'); if (d) d.remove(); T.on = false; gone(); document.body.classList.remove('pt-on'); if (window.ppTourHook && ppTourHook.busy) ppTourHook.end(false); }   // 예시 보기 결과는 가져가지 않아요 (도련 11-19 · 늘 원래 그림으로)
    /* ---------- 고르는 창 ---------- */
    const KN = { leaf: '속지', tk: '떡메모지', tape: '마스킹테이프', paper: '모조지', seal: '씰', piece: '조각' };   // 🏷️ 스티커 종류 (js/tablet.js APPS 차례)
    const KALL = Object.keys(KN), KANIM = ['seal', 'piece'];                    // 🎬 움직이는 예시 = 씰 · 조각만 (속지 · 떡메 · 마테 · 모조지는 움직임 기능이 없어요 · 1311)
    const UN = { px: '✏️ 픽셀', vec: '✒️ 벡터', css: '🧩 CSS', svg: '🌀 SVG' };
    const usedOf = ex => Object.keys(UN).filter(m => ex.s.some(st => st.c === M(m)));   // 🏷️ 예시가 쓴 것 = 걸음 속 모드 버튼 (따로 적지 않아요)
    const kindsOf = ex => ex.ks || (ex.m === 'a' ? KANIM : KALL);   // 📃 🎀 전용 예시 = ks
    const nowKind = () => (window.ppTourHook && ppTourHook.kind) || 'leaf';
    const canRun = ex => ex.ks ? ex.ks.includes(nowKind()) : !(ex.m === 'a' && window.ppTourHook && ppTourHook.still);
    function noRun(ex) {                                                        // 이 스티커에서 볼 수 없는 예시 (도련 11-19)
        const o = $('#ptNo'); if (o) o.remove();
        const m = document.createElement('div'); m.id = 'ptNo'; m.className = 'pt-no';
        m.innerHTML = `<div><b>🙅 ${KN[nowKind()] || '이 스티커'}에서는 볼 수 없는 예시예요</b><small>${ex.e} ${ex.n} = ${ex.ks ? '' : '움직이는 예시라 '}${kindsOf(ex).map(k => KN[k]).join(' · ')} 스티커에서 볼 수 있어요</small><button type="button">알겠어요</button></div>`;
        document.body.appendChild(m); m.onclick = e => { if (e.target === m || e.target.closest('button')) m.remove(); };
    }
    /* ---------- 고르는 창 (미리보기 = js/padtourview.js 진짜 코드) ---------- */
    function open() {
        const old = $('#ptPick'); if (old) old.remove();
        const m = document.createElement('div'); m.id = 'ptPick'; m.className = 'pt-pick'; const cur = nowKind();
        const card = x => `<button type="button" class="pt-card${canRun(x) ? '' : ' no'}" data-ex="${TOUR.indexOf(x)}"><span class="pt-view">${window.PT_VIEW ? PT_VIEW.get(x.k) : ''}</span><b>${x.e} ${x.n}</b>
            <span class="pt-tags">${usedOf(x).map(m => `<em class="pt-tg ${m}">${UN[m]}</em>`).join('')}</span><small class="pt-tip">${x.d}</small></button>`;   // 🏷️ 쓴 것 + 💡 어떻게 (도련 11-23 · 1444 '카테고리와 팁만 봐도 머리에 그려지게')
        m.innerHTML = `<div class="pt-box"><button type="button" class="pt-x" data-pp="x">✕</button><h3>🎓 예시 보기<em>예시를 누르면 마우스가 움직이며 만들어요 · 지금 그림은 그대로 두고 연습 종이에서 · 지금 스티커 = <b>${KN[cur] || ''}</b></em></h3>
            <div class="pt-cards">${TOUR.map(card).join('')}</div>
            <p class="pt-tip">⏸ 멈춤 · ⏭ 한 걸음씩 · 🐢 🐇 빠르기 · ✋ 따라 하기 = 반짝이는 곳을 내가 눌러요</p></div>`;
        document.body.appendChild(m);
        m.onclick = e => { if (e.target === m || e.target.closest('[data-pp="x"]')) { m.remove(); return; } const c = e.target.closest('[data-ex]'); if (!c) return; const ex = TOUR[+c.dataset.ex]; if (!canRun(ex)) { noRun(ex); return; } m.remove(); start(ex); };
    }
    window.padTour = { open, start: i => start(TOUR[i]), finish, TOUR, get state() { return { on: T.on, i: T.i, done: !!T.done, err: T.err || '' }; }, set fast(v) { T.fast = !!v; }, set speed(v) { T.speed = +v || 1; } };
})();
