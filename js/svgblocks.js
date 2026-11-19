/* 말랑달콤 다이어리 - js/svgblocks.js
   🌀 svg 블록 레이어 엔진 (도련 11-18 · 1296) : css 블록 옆에 svg 블록 · 블록 하나 = svg 공식 기능 하나 · 써 보면서 css 와 svg 를 파악하기
   - 레이어 = svg 도화지 (종이 크기 그대로 · viewBox 0 0 W H) · 도형(요소) 목록 L.els (위 = 앞) · 도형마다 블록 b (속성 · 칠 재료 · 오리기 · 가리기 · 끝 장식 · 바꿔 놓기 · 필터 17종 + 빛)
   - 도형 = { id, t, on, v, mv: {x, y} (✋ 끌어서 옮긴 만큼 = translate), b: [{ id, t, on, v }] }
   - 필터 블록은 위에서부터 차례로 (1번 결과 · 2번 결과 … 를 다음 단계가 골라 써요) · 나머지 블록은 같은 속성이면 위 블록이 이겨요
   - 그리기 = 브라우저가 진짜 svg 로 (svg 그림 → 캔버스 · 글꼴은 css 블록 엔진 CB.faceCss 로 그 글자만 담아요) */
(function () {
    'use strict';
    const HX = n => Math.round(Math.max(0, Math.min(100, n)) * 2.55).toString(16).padStart(2, '0');
    const col = v => (v.a == null || v.a >= 100) ? v.c : v.c + HX(v.a), CO = (c, a = 100) => ({ c, a });
    const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const clone = o => JSON.parse(JSON.stringify(o));
    const N = (k, n, a, b, s = 1) => [k, n, 'num', [a, b, s]], C = (k, n) => [k, n, 'col'], S = (k, n, o) => [k, n, 'sel', o], T = (k, n) => [k, n, 'txt'], P = (k, n) => [k, n, 'pct', [0, 100]], IN = (k, n) => [k, n, 'sel', 'IN'];
    const KO = { butt: '각지게', round: '둥글게', square: '네모로', miter: '뾰족', bevel: '깎아서', 'arcs': '둥근 뾰족', start: '시작', middle: '가운데', end: '끝', pad: '끝색 늘이기', reflect: '거울 반복', repeat: '반복', nonzero: '모두 칠하기', evenodd: '겹친 곳 비우기',
        fill: '칠 (fill)', stroke: '선 (stroke)', 'fill-stroke': '칠 · 선 둘 다', saturate: '채도', hueRotate: '색 돌리기', luminanceToAlpha: '밝기 → 투명', dilate: '두껍게', erode: '얇게', turbulence: '소용돌이', fractalNoise: '구름 노이즈', stitch: '이어지게', noStitch: '그냥',
        over: '위에 얹기', in: '안쪽만', out: '바깥만', atop: '위에 붙이기', xor: '겹친 곳 빼기', arithmetic: '계산 (k1~k4)', normal: '보통', multiply: '곱하기', screen: '스크린', overlay: '오버레이', darken: '어둡게', lighten: '밝게', 'color-dodge': '닷지', 'color-burn': '번', 'hard-light': '강하게', 'soft-light': '부드럽게', difference: '차이', exclusion: '제외', hue: '색상', saturation: '채도', color: '색', luminosity: '밝기',
        R: '빨강', G: '초록', B: '파랑', A: '투명도', prev: '바로 앞 결과', SourceGraphic: '원래 모양', SourceAlpha: '원래 모양 그림자', linear: '직선', gamma: '감마', discrete: '계단', table: '표', identity: '그대로',
        distant: '멀리서 (해)', point: '점 (전구)', spot: '스포트라이트', circle: '원', ellipse: '타원', rect: '네모', polygon: '세모', path: '패스', arrow: '화살표', dot: '점', none: '없음', auto: '원래대로', crispEdges: '또렷하게', geometricPrecision: '매끈하게', optimizeSpeed: '빠르게',
        'xMidYMid meet': '다 보이게', 'xMidYMid slice': '꽉 채우기', 'none ': '늘이기', underline: '밑줄', overline: '윗줄', 'line-through': '취소선', italic: '기울임', 'horizontal-tb': '가로쓰기', 'vertical-rl': '세로쓰기', central: '가운데', alphabetic: '글자 바닥', hanging: '위에 매달기', 'stroke fill': '테두리 먼저 (바깥)', 'fill stroke': '칠 먼저',
        Jua: '주아', 'Gowun Dodum': '고운돋움', Gaegu: '개구', 'Nanum Pen Script': '나눔손글씨 펜', 'Do Hyeon': '도현', 'Black Han Sans': '검은고딕', serif: '명조', 'sans-serif': '고딕', '400': '보통', '700': '굵게', userSpaceOnUse: '종이 기준', objectBoundingBox: '도형 기준' };
    for (let i = 1; i <= 40; i++) KO['r' + i] = i + '번 결과';
    Object.assign(KO, { element: '🧩 내 도형', 'ease-in-out': '천천히 시작 · 끝', discrete: '뚝뚝', sRGB: '보통 (sRGB)', linearRGB: '빛 계산 (linearRGB)', d: '모양 (패스 d)', points: '점들', 'stroke-dasharray': '점선', baseFrequency: '촘촘함 (baseFrequency)', seed: '모양 번호 (seed)', scale: '세기 (scale)', stdDeviation: '흐림 (stdDeviation)', radius: '두께 (radius)', dx: '옆으로 (dx)', dy: '아래로 (dy)', surfaceScale: '볼록 높이', specularConstant: '반짝 세기', diffuseConstant: '빛 세기', 'non-scaling-stroke': '그대로', visible: '보이게', hidden: '숨기기', spacing: '사이만 늘이기', spacingAndGlyphs: '글자도 늘이기', rotate: '돌기', scale: '크기', translate: '옮기기', translateX: '가로 옮기기', translateY: '세로 옮기기', skewX: '가로 기울이기', skewY: '세로 기울이기',
        indefinite: '계속', remove: '처음으로', freeze: '끝 모습 그대로', '0': '안 돌기', 'auto-reverse': '거꾸로 돌기', 'fill-box': '도형 크기', 'view-box': '종이', 'stroke-box': '선까지', opacity: '진하기', 'fill-opacity': '칠 진하기', 'stroke-width': '선 굵기', 'stroke-dashoffset': '점선 밀기',
        blur: '흐리게', brightness: '밝기', contrast: '대비', grayscale: '흑백', sepia: '세피아', 'hue-rotate': '색 돌리기', invert: '색 뒤집기', infinite: '계속', linear: '같은 빠르기', ease: '부드럽게', 'ease-in': '천천히 시작', 'ease-out': '천천히 끝', 'ease-in-out': '천천히 시작 · 끝', 'steps(4)': '뚝뚝 4번',
        alternate: '왔다 갔다', reverse: '거꾸로', 'alternate-reverse': '거꾸로 왔다 갔다', 'font-size': '글자 크기', 'letter-spacing': '글자 사이', width: '폭', height: '높이' });
    const FONTS = ['Gowun Dodum', 'Jua', 'Gaegu', 'Nanum Pen Script', 'Do Hyeon', 'Black Han Sans', 'serif', 'sans-serif'];
    const STOPS = ['stops', '색', 'stops', ['%']], STOP2 = (a, b) => ({ u: '%', s: [{ c: CO(a), p: 0 }, { c: CO(b), p: 100 }] });
    /* ⬛ 도형 = svg 공식 요소 (W · H = 종이) */
    const EL = {
        rect: { e: '⬛', n: '네모', f: [N('x', 'x', 0, 'W'), N('y', 'y', 0, 'H'), N('width', '폭 width', 0, 'W'), N('height', '높이 height', 0, 'H'), N('rx', '모서리 rx', 0, 'W'), N('ry', '모서리 ry', 0, 'H')], d: (W, H) => ({ x: W * .2, y: H * .2, width: W * .6, height: H * .4, rx: 40, ry: 40 }) },
        circle: { e: '⚪', n: '원', f: [N('cx', '가운데 cx', 0, 'W'), N('cy', '가운데 cy', 0, 'H'), N('r', '반지름 r', 0, 'W')], d: (W, H) => ({ cx: W / 2, cy: H / 2, r: W * .2 }) },
        ellipse: { e: '🥚', n: '타원', f: [N('cx', '가운데 cx', 0, 'W'), N('cy', '가운데 cy', 0, 'H'), N('rx', '가로 rx', 0, 'W'), N('ry', '세로 ry', 0, 'H')], d: (W, H) => ({ cx: W / 2, cy: H / 2, rx: W * .3, ry: W * .18 }) },
        line: { e: '➖', n: '선', f: [N('x1', '시작 x1', 0, 'W'), N('y1', '시작 y1', 0, 'H'), N('x2', '끝 x2', 0, 'W'), N('y2', '끝 y2', 0, 'H')], d: (W, H) => ({ x1: W * .2, y1: H * .6, x2: W * .8, y2: H * .4 }) },
        polyline: { e: '〽️', n: '꺾은선', f: [['points', '점 (x · y)', 'pts', ['W', 'H']]], d: (W, H) => ({ points: [[W * .15, H * .6], [W * .35, H * .4], [W * .55, H * .58], [W * .8, H * .38]].map(p => p.map(Math.round)) }) },
        polygon: { e: '🔺', n: '다각형', f: [['points', '점 (x · y)', 'pts', ['W', 'H']]], d: (W, H) => ({ points: [[W * .5, H * .3], [W * .75, H * .62], [W * .25, H * .62]].map(p => p.map(Math.round)) }) },
        path: { e: '✒️', n: '패스', f: [T('d', '길 d (M 이동 · L 직선 · H · V · Q · C 곡선 · A 호 · Z 닫기)')], d: (W, H) => ({ d: `M ${Math.round(W * .2)} ${Math.round(H * .6)} Q ${Math.round(W * .5)} ${Math.round(H * .2)} ${Math.round(W * .8)} ${Math.round(H * .6)}` }) },
        text: { e: '🔤', n: '글자', f: [['t', '글자 (줄 바꿈 = 여러 줄)', 'txta'], N('x', 'x', 0, 'W'), N('y', 'y', 0, 'H')], d: (W, H) => ({ t: '말랑달콤', x: W / 2, y: H / 2 }) },
        textPath: { e: '➰', n: '길 따라 글자', f: [T('t', '글자'), T('d', '길 d'), P('off', '시작 자리 %')], d: (W, H) => ({ t: '말랑달콤 다이어리 말랑달콤', d: `M ${Math.round(W * .12)} ${Math.round(H * .55)} Q ${Math.round(W * .5)} ${Math.round(H * .25)} ${Math.round(W * .88)} ${Math.round(H * .55)}`, off: 0 }) },
        image: { e: '🖼️', n: '그림', f: [['src', '그림', 'img'], N('x', 'x', 0, 'W'), N('y', 'y', 0, 'H'), N('width', '폭', 1, 'W'), N('height', '높이', 1, 'H'), S('par', '맞추기', ['xMidYMid meet', 'xMidYMid slice', 'none '])], d: (W, H) => ({ src: '', x: W * .2, y: H * .2, width: W * .6, height: H * .4, par: 'xMidYMid meet' }) },
        g: { e: '📦', n: '묶기 (g)', f: [N('n', '바로 아래 도형 몇 개를 묶을까', 1, 30)], d: () => ({ n: 2 }) },
        use: { e: '🪞', n: '복사해 찍기 (use)', f: [S('ref', '무엇을', 'ELS'), N('x', '옆으로', '-W', 'W'), N('y', '아래로', '-H', 'H')], d: W => ({ ref: '', x: Math.round(W * .3), y: 0 }) }
    };
    /* 도형에 붙이는 블록 = svg 공식 속성 · 칠 재료 · 오리기 · 가리기 · 끝 장식 · transform · 필터 primitive */
    const LIGHT = [S('lt', '빛', ['distant', 'point', 'spot']), N('az', '해 방향 (distant)', 0, 360), N('el', '해 높이 (distant)', 0, 90), N('lx', '빛 x', '-W', 'W'), N('ly', '빛 y', '-H', 'H'), N('lz', '빛 높이 z', 0, 600), N('ca', '스포트 퍼짐 각도', 1, 90)];
    const LDEF = W => ({ lt: 'distant', az: 225, el: 45, lx: W / 2, ly: 0, lz: 200, ca: 30 });
    const BL = {
        fill: { g: '🎨 칠 · 선', e: '🎨', n: '칠', o: 'fill', f: [C('c', '색')], d: () => ({ c: CO('#ff8fb1') }) },
        stroke: { g: '🎨 칠 · 선', e: '🖍', n: '선 색', o: 'stroke', f: [C('c', '색')], d: () => ({ c: CO('#5b3f4a') }) },
        'stroke-width': { g: '🎨 칠 · 선', e: '📏', n: '선 굵기', o: 'stroke-width', f: [N('v', '굵기', 0, 80, .5)], d: () => ({ v: 8 }) },
        'stroke-dasharray': { g: '🎨 칠 · 선', e: '┅', n: '점선', o: 'stroke-dasharray', f: [N('a', '선 길이', 0, 120), N('b', '빈칸', 0, 120)], d: () => ({ a: 18, b: 10 }) },
        'stroke-dashoffset': { g: '🎨 칠 · 선', e: '⇢', n: '점선 밀기', o: 'stroke-dashoffset', f: [N('v', '밀기', -200, 200)], d: () => ({ v: 10 }) },
        'stroke-linecap': { g: '🎨 칠 · 선', e: '⏺', n: '선 끝', o: 'stroke-linecap', f: [S('v', '끝 모양', ['butt', 'round', 'square'])], d: () => ({ v: 'round' }) },
        'stroke-linejoin': { g: '🎨 칠 · 선', e: '📐', n: '꺾이는 곳', o: 'stroke-linejoin', f: [S('v', '모양', ['miter', 'round', 'bevel', 'arcs'])], d: () => ({ v: 'round' }) },
        'stroke-miterlimit': { g: '🎨 칠 · 선', e: '🔺', n: '뾰족 한계', o: 'stroke-miterlimit', f: [N('v', '한계', 1, 20, .5)], d: () => ({ v: 4 }) },
        'fill-rule': { g: '🎨 칠 · 선', e: '🍩', n: '겹친 곳 칠', o: 'fill-rule', f: [S('v', '방법', ['nonzero', 'evenodd'])], d: () => ({ v: 'evenodd' }) },
        opacity: { g: '🎨 칠 · 선', e: '👻', n: '투명도', o: 'opacity', f: [N('v', '진하기', 0, 1, .01)], d: () => ({ v: .8 }) },
        'paint-order': { g: '🎨 칠 · 선', e: '🖊', n: '칠 · 선 순서', o: 'paint-order', f: [S('v', '순서', ['stroke fill', 'fill stroke'])], d: () => ({ v: 'stroke fill' }) },
        'shape-rendering': { g: '🎨 칠 · 선', e: '🔲', n: '가장자리', o: 'shape-rendering', f: [S('v', '방법', ['auto', 'crispEdges', 'geometricPrecision', 'optimizeSpeed'])], d: () => ({ v: 'crispEdges' }) },
        'mix-blend-mode': { g: '🎨 칠 · 선', e: '🫐', n: '아래와 섞기', o: 'mix-blend-mode', f: [S('v', '방법', ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'])], d: () => ({ v: 'multiply' }) },
        linearGradient: { g: '🌈 칠 재료', e: '🌈', n: '직선 그라데이션', o: '<linearGradient>', f: [S('to', '어디에', ['fill', 'stroke']), P('x1', '시작 x1 %'), P('y1', '시작 y1 %'), P('x2', '끝 x2 %'), P('y2', '끝 y2 %'), S('sp', '바깥쪽', ['pad', 'reflect', 'repeat']), STOPS], d: () => ({ to: 'fill', x1: 0, y1: 0, x2: 100, y2: 100, sp: 'pad', stops: STOP2('#ffc6d6', '#c4b2f2') }) },
        radialGradient: { g: '🌈 칠 재료', e: '🔆', n: '원형 그라데이션', o: '<radialGradient>', f: [S('to', '어디에', ['fill', 'stroke']), P('cx', '가운데 cx %'), P('cy', '가운데 cy %'), P('r', '반지름 r %'), P('fx', '빛 fx %'), P('fy', '빛 fy %'), S('sp', '바깥쪽', ['pad', 'reflect', 'repeat']), STOPS], d: () => ({ to: 'fill', cx: 50, cy: 50, r: 50, fx: 35, fy: 35, sp: 'pad', stops: STOP2('#ffffff', '#ff8fb1') }) },
        pattern: { g: '🌈 칠 재료', e: '🔁', n: '무늬 (pattern)', o: '<pattern>', f: [S('to', '어디에', ['fill', 'stroke']), N('w', '한 칸 폭', 4, 300), N('h', '한 칸 높이', 4, 300), N('rot', '무늬 돌리기 (patternTransform)', -180, 180), C('bg', '칸 바탕'), S('sh', '칸 안 도형', ['circle', 'rect', 'polygon', 'path']), P('sz', '도형 크기 %'), C('c', '도형 색'), T('d', '패스 d (칸 0~100)'), S('ref', '또는 칸 안에 내 도형 (재료)', 'ELS'), N('ox', '내 도형 옮기기 가로', -400, 400), N('oy', '내 도형 옮기기 세로', -400, 400), N('ps', '내 도형 크기 배', .05, 3, .05)], d: () => ({ to: 'fill', w: 40, h: 40, rot: 0, bg: CO('#ffe7ee'), sh: 'circle', sz: 40, c: CO('#ffffff'), d: 'M 0 100 L 50 0 L 100 100 Z', ref: '', ox: 0, oy: 0, ps: 1 }) },
        clipPath: { g: '✂️ 오리기 · 가리기 · 끝 장식', e: '✂️', n: '모양으로 오리기 (clipPath)', o: '<clipPath>', f: [S('sh', '모양', ['circle', 'ellipse', 'rect', 'polygon', 'path', 'element']), P('sz', '크기 %'), T('d', '패스 d (도형 0~100)'), S('ref', '내 도형 (모양 = 내 도형)', 'ELS')], d: () => ({ sh: 'ellipse', sz: 100, d: 'M 0 0 L 100 0 L 100 70 L 50 100 L 0 70 Z', ref: '' }) },
        mask: { g: '✂️ 오리기 · 가리기 · 끝 장식', e: '🎭', n: '서서히 가리기 (mask)', o: '<mask>', f: [S('k', '모양', ['linear', 'circle', 'element']), N('ang', '방향 (직선)', 0, 360), P('a', '보이기 시작 %'), P('b', '다 가려짐 %'), S('ref', '내 도형 (밝은 곳이 보여요)', 'ELS')], d: () => ({ k: 'linear', ang: 90, a: 40, b: 100, ref: '' }) },
        marker: { g: '✂️ 오리기 · 가리기 · 끝 장식', e: '➤', n: '선 끝 장식 (marker)', o: '<marker>', f: [S('sh', '모양', ['arrow', 'dot', 'square', 'element']), S('ref', '내 도형 (끝 장식으로)', 'ELS'), N('sz', '크기', 2, 40), C('c', '색'), ['s', '처음', 'bool'], ['m', '중간 점마다', 'bool'], ['e', '끝', 'bool']], d: () => ({ sh: 'arrow', ref: '', sz: 10, c: CO('#5b3f4a'), s: false, m: false, e: true }) },
        translate: { g: '🔄 바꿔 놓기 (transform)', e: '➡️', n: '옮기기', o: 'translate()', f: [N('x', '가로', '-W', 'W'), N('y', '세로', '-H', 'H')], d: () => ({ x: 20, y: 0 }) },
        rotate: { g: '🔄 바꿔 놓기 (transform)', e: '🔄', n: '돌리기', o: 'rotate()', f: [N('a', '각도', -180, 180), N('cx', '도는 점 x', 0, 'W'), N('cy', '도는 점 y', 0, 'H')], d: (W, H) => ({ a: 15, cx: W / 2, cy: H / 2 }) },
        scale: { g: '🔄 바꿔 놓기 (transform)', e: '🔍', n: '크기', o: 'scale()', f: [N('x', '가로 배', -2, 2, .01), N('y', '세로 배', -2, 2, .01)], d: () => ({ x: .9, y: .9 }) },
        skewX: { g: '🔄 바꿔 놓기 (transform)', e: '⏩', n: '가로 기울이기', o: 'skewX()', f: [N('a', '각도', -60, 60)], d: () => ({ a: 10 }) },
        skewY: { g: '🔄 바꿔 놓기 (transform)', e: '⏫', n: '세로 기울이기', o: 'skewY()', f: [N('a', '각도', -60, 60)], d: () => ({ a: 10 }) },
        'font-size': { g: '🔤 글자', e: '🔠', n: '글자 크기', o: 'font-size', f: [N('v', '크기', 6, 400)], d: () => ({ v: 96 }) },
        'font-family': { g: '🔤 글자', e: '🅰️', n: '글꼴', o: 'font-family', f: [S('v', '글꼴', FONTS)], d: () => ({ v: 'Jua' }) },
        'font-weight': { g: '🔤 글자', e: '🅱️', n: '글자 굵기', o: 'font-weight', f: [S('v', '굵기', ['400', '700'])], d: () => ({ v: '700' }) },
        'font-style': { g: '🔤 글자', e: '𝑰', n: '기울임', o: 'font-style', f: [S('v', '방법', ['normal', 'italic'])], d: () => ({ v: 'italic' }) },
        'letter-spacing': { g: '🔤 글자', e: '↔️', n: '글자 사이', o: 'letter-spacing', f: [N('v', '사이', -20, 80)], d: () => ({ v: 6 }) },
        'word-spacing': { g: '🔤 글자', e: '⇔', n: '단어 사이', o: 'word-spacing', f: [N('v', '사이', -20, 120)], d: () => ({ v: 20 }) },
        'text-anchor': { g: '🔤 글자', e: '📏', n: '맞춤 기준', o: 'text-anchor', f: [S('v', '기준', ['start', 'middle', 'end'])], d: () => ({ v: 'middle' }) },
        'dominant-baseline': { g: '🔤 글자', e: '⎯', n: '줄 기준', o: 'dominant-baseline', f: [S('v', '기준', ['auto', 'central', 'alphabetic', 'hanging'])], d: () => ({ v: 'central' }) },
        'text-decoration': { g: '🔤 글자', e: '〰', n: '밑줄 · 취소선', o: 'text-decoration', f: [S('v', '줄', ['underline', 'overline', 'line-through'])], d: () => ({ v: 'underline' }) },
        'writing-mode': { g: '🔤 글자', e: '📜', n: '세로쓰기', o: 'writing-mode', f: [S('v', '방향', ['horizontal-tb', 'vertical-rl'])], d: () => ({ v: 'vertical-rl' }) },
        feGaussianBlur: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🌫️', n: '흐리게', o: '<feGaussianBlur>', f: [IN('in', '무엇에'), N('s', '흐림', 0, 40, .5)], d: () => ({ in: 'prev', s: 4 }) },
        feOffset: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '↘️', n: '밀기', o: '<feOffset>', f: [IN('in', '무엇에'), N('dx', '옆으로', -100, 100), N('dy', '아래로', -100, 100)], d: () => ({ in: 'prev', dx: 8, dy: 8 }) },
        feDropShadow: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🌑', n: '그림자', o: '<feDropShadow>', f: [IN('in', '무엇에'), N('dx', '옆으로', -100, 100), N('dy', '아래로', -100, 100), N('s', '번짐', 0, 40, .5), C('c', '색')], d: () => ({ in: 'prev', dx: 6, dy: 10, s: 8, c: CO('#3d3552', 40) }) },
        feFlood: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🪣', n: '색 붓기', o: '<feFlood>', f: [C('c', '색')], d: () => ({ c: CO('#ffffff') }) },
        feMorphology: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🫧', n: '두껍게 · 얇게', o: '<feMorphology>', f: [IN('in', '무엇에'), S('op', '방법', ['dilate', 'erode']), N('r', '얼마나', 0, 40)], d: () => ({ in: 'prev', op: 'dilate', r: 8 }) },
        feColorMatrix: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🎡', n: '색 바꾸기', o: '<feColorMatrix>', f: [IN('in', '무엇에'), S('ty', '종류', ['saturate', 'hueRotate', 'luminanceToAlpha']), N('v', '값 (채도 0~3 · 각도 0~360)', 0, 360, .1)], d: () => ({ in: 'prev', ty: 'hueRotate', v: 90 }) },
        feComponentTransfer: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🎚', n: '색 곡선', o: '<feComponentTransfer>', f: [IN('in', '무엇에'), S('ch', '어느 색', ['RGB', 'R', 'G', 'B', 'A']), S('ty', '종류', ['linear', 'gamma', 'discrete', 'table', 'identity']), N('slope', '기울기 (직선)', 0, 4, .05), N('icpt', '더하기 (직선 · 감마)', -1, 1, .05), N('amp', '세기 (감마)', 0, 4, .05), N('exp', '지수 (감마)', 0, 4, .05), T('tab', '표 값 (계단 · 표 · 0~1 띄어 쓰기)')], d: () => ({ in: 'prev', ch: 'RGB', ty: 'discrete', slope: 1, icpt: 0, amp: 1, exp: 1, tab: '0 0.33 0.66 1' }) },
        feConvolveMatrix: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🔍', n: '선명하게 · 테두리 따기', o: '<feConvolveMatrix>', f: [IN('in', '무엇에'), T('k', '커널 kernelMatrix (3 × 3 = 9개 숫자)'), N('div', '나누기 divisor', 0, 20, .5), N('bias', '더하기 bias', -1, 1, .05)], d: () => ({ in: 'prev', k: '0 -1 0 -1 5 -1 0 -1 0', div: 1, bias: 0 }) },
        feDiffuseLighting: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '💡', n: '빛 비추기 (볼록)', o: '<feDiffuseLighting>', f: [IN('in', '무엇에 (높이)'), N('ss', '볼록 높이 surfaceScale', -20, 20, .5), N('dc', '빛 세기 diffuseConstant', 0, 4, .05), C('c', '빛 색')].concat(LIGHT), d: W => Object.assign({ in: 'SourceAlpha', ss: 5, dc: 1, c: CO('#ffffff') }, LDEF(W)) },
        feSpecularLighting: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '✨', n: '반짝 광택', o: '<feSpecularLighting>', f: [IN('in', '무엇에 (높이)'), N('ss', '볼록 높이 surfaceScale', -20, 20, .5), N('sc', '반짝 세기 specularConstant', 0, 4, .05), N('se', '반짝 좁기 specularExponent', 1, 128, 1), C('c', '빛 색')].concat(LIGHT), d: W => Object.assign({ in: 'SourceAlpha', ss: 5, sc: 1, se: 20, c: CO('#ffffff') }, LDEF(W)) },
        feTurbulence: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🌀', n: '노이즈 만들기', o: '<feTurbulence>', f: [S('ty', '종류', ['turbulence', 'fractalNoise']), N('bf', '촘촘함', .001, .2, .001), N('oc', '겹 수', 1, 8), N('seed', '모양 번호', 0, 200), S('st', '가장자리', ['noStitch', 'stitch'])], d: () => ({ ty: 'turbulence', bf: .02, oc: 2, seed: 3, st: 'noStitch' }) },
        feDisplacementMap: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🌊', n: '일렁이기', o: '<feDisplacementMap>', f: [IN('in', '무엇을'), IN('in2', '어떤 무늬로'), N('sc', '세기', -150, 150), S('xc', '가로 기준', ['R', 'G', 'B', 'A']), S('yc', '세로 기준', ['R', 'G', 'B', 'A'])], d: () => ({ in: 'SourceGraphic', in2: 'prev', sc: 30, xc: 'R', yc: 'G' }) },
        feComposite: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🧩', n: '합치기', o: '<feComposite>', f: [IN('in', '위'), IN('in2', '아래'), S('op', '방법', ['over', 'in', 'out', 'atop', 'xor', 'arithmetic']), N('k1', 'k1', -2, 2, .05), N('k2', 'k2', -2, 2, .05), N('k3', 'k3', -2, 2, .05), N('k4', 'k4', -1, 1, .05)], d: () => ({ in: 'prev', in2: 'SourceGraphic', op: 'in', k1: 0, k2: 1, k3: 1, k4: 0 }) },
        feBlend: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🫐', n: '섞기', o: '<feBlend>', f: [IN('in', '위'), IN('in2', '아래'), S('m', '방법', ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'])], d: () => ({ in: 'prev', in2: 'SourceGraphic', m: 'multiply' }) },
        feMerge: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🥞', n: '겹쳐 쌓기', o: '<feMerge>', f: [IN('a', '맨 아래'), IN('b', '가운데'), IN('c', '맨 위')], d: () => ({ a: 'prev', b: 'SourceGraphic', c: 'SourceGraphic' }) },
        feTile: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🧱', n: '타일 반복', o: '<feTile>', f: [IN('in', '무엇을 (앞 단계 자리만큼)')], d: () => ({ in: 'prev' }) },
        /* ➕ 11-19 빠진 svg 채우기 */
        'fill-opacity': { g: '🎨 칠 · 선', e: '🫗', n: '칠 진하기', o: 'fill-opacity', f: [N('v', '진하기', 0, 1, .01)], d: () => ({ v: .5 }) },
        'stroke-opacity': { g: '🎨 칠 · 선', e: '🖍', n: '선 진하기', o: 'stroke-opacity', f: [N('v', '진하기', 0, 1, .01)], d: () => ({ v: .5 }) },
        visibility: { g: '🎨 칠 · 선', e: '🙈', n: '숨기기', o: 'visibility', f: [S('v', '보이기', ['visible', 'hidden'])], d: () => ({ v: 'hidden' }) },
        'vector-effect': { g: '🎨 칠 · 선', e: '📏', n: '크기 바꿔도 선 굵기 그대로', o: 'vector-effect', f: [S('v', '방법', ['none', 'non-scaling-stroke'])], d: () => ({ v: 'non-scaling-stroke' }) },
        textLength: { g: '🔤 글자', e: '↔', n: '글자 길이 맞추기', o: 'textLength · lengthAdjust', f: [N('v', '길이', 10, 'W'), S('adj', '방법', ['spacing', 'spacingAndGlyphs'])], d: W => ({ v: Math.round(W * .6), adj: 'spacing' }) },
        tspan: { g: '🔤 글자', e: '🖍', n: '글자 일부 꾸미기 (tspan)', o: '<tspan>', f: [N('a', '몇 번째 글자부터', 1, 300), N('n', '몇 글자', 1, 300), C('c', '색'), N('fs', '크기 (0 = 그대로)', 0, 400), S('fw', '굵기', ['', '400', '700']), N('dy', '위아래로', -100, 100)], d: () => ({ a: 1, n: 1, c: CO('#ff5d8f'), fs: 0, fw: '700', dy: 0 }) },
        'line-height': { g: '🔤 글자', e: '↕', n: '줄 간격 (여러 줄)', o: 'tspan dy', f: [N('v', '글자 크기의 몇 배', .5, 3, .05)], d: () => ({ v: 1.3 }) },
        defs: { g: '🎨 칠 · 선', e: '🫥', n: '그리지 않고 재료로만 (defs)', o: '<defs>', f: [], d: () => ({}) },
        'filter-region': { g: '🪄 필터 설정', e: '🖼', n: '필터 영역 · 색 계산', o: 'filter x · y · width · height', f: [N('m', '둘레 넓히기 %', 0, 300), S('ci', '색 계산', ['sRGB', 'linearRGB'])], d: () => ({ m: 80, ci: 'sRGB' }) },
        'fe-region': { g: '🪄 필터 설정', e: '🔳', n: '필터 단계 영역', o: 'fe… x · y · width · height', f: [N('n', '몇 번째 단계', 1, 20), P('x', '가로 자리 %'), P('y', '세로 자리 %'), P('w', '폭 %'), P('h', '높이 %')], d: () => ({ n: 1, x: 0, y: 0, w: 50, h: 100 }) },
        'baseline-shift': { g: '🔤 글자', e: '⤒', n: '글자 위아래 밀기', o: 'baseline-shift', f: [N('v', '만큼', -100, 100)], d: () => ({ v: 10 }) },
        animate: { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🎞', n: '속성 바꾸며 움직이기', o: '<animate>', f: [S('at', '무엇을', ['opacity', 'fill-opacity', 'fill', 'stroke', 'stroke-width', 'stroke-dashoffset', 'r', 'rx', 'ry', 'x', 'y', 'cx', 'cy', 'width', 'height', 'font-size', 'letter-spacing', 'd', 'points', 'stroke-dasharray']), T('from', '처음 값'), T('to', '끝 값'), N('dur', '한 번 시간 (초)', .1, 20, .1), N('begin', '기다렸다 시작 (초)', 0, 10, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5']), ['alt', '왔다 갔다', 'bool'], S('fill', '끝나면', ['remove', 'freeze']), S('ease', '빠르기 변화', ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'discrete']), S('after', '이 움직임이 끝나면 시작', 'ANS'), ['acc', '돌 때마다 쌓기 (accumulate)', 'bool']], d: () => ({ at: 'opacity', from: '1', to: '0.2', dur: 1.5, begin: 0, rep: 'indefinite', alt: true, fill: 'remove', ease: 'linear', after: '', acc: false }) },
        animateTransform: { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🔄', n: '돌기 · 커지기 · 옮기기', o: '<animateTransform>', f: [S('ty', '종류', ['rotate', 'scale', 'translate', 'skewX', 'skewY']), T('from', '처음 값 (돌기 = 각도)'), T('to', '끝 값'), ['cen', '도형 가운데를 축으로 (돌기)', 'bool'], N('dur', '한 번 시간 (초)', .1, 20, .1), N('begin', '기다렸다 시작 (초)', 0, 10, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5']), ['alt', '왔다 갔다', 'bool'], S('ease', '빠르기 변화', ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'discrete']), S('after', '이 움직임이 끝나면 시작', 'ANS'), ['acc', '돌 때마다 쌓기 (accumulate)', 'bool']], d: () => ({ ty: 'rotate', from: '0', to: '360', cen: true, dur: 3, begin: 0, rep: 'indefinite', alt: false, ease: 'linear', after: '', acc: false }) },
        animateMotion: { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🛤', n: '길 따라 움직이기', o: '<animateMotion>', f: [T('d', '길 d (도형 자리에서부터)'), S('ref', '또는 내 패스를 따라 (mpath)', 'ELS'), S('rot', '길 따라 돌기', ['0', 'auto', 'auto-reverse']), N('dur', '한 바퀴 시간 (초)', .1, 30, .1), N('begin', '기다렸다 시작 (초)', 0, 10, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5']), S('ease', '빠르기 변화', ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'discrete']), S('after', '이 움직임이 끝나면 시작', 'ANS')], d: () => ({ d: 'M 0 0 C 80 -60 160 60 240 0 S 80 60 0 0', ref: '', rot: '0', dur: 4, begin: 0, rep: 'indefinite', ease: 'linear', after: '' }) },
        set: { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '⏱', n: '때 되면 바꾸기', o: '<set>', f: [S('at', '무엇을', ['visibility', 'fill', 'stroke', 'opacity', 'stroke-width']), T('to', '바꿀 값'), N('begin', '몇 초 뒤', 0, 20, .1), S('after', '이 움직임이 끝나면', 'ANS')], d: () => ({ at: 'fill', to: '#ffd23f', begin: 1, after: '' }) },
        'animate-filter': { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🌊', n: '필터 움직이기', o: '<animate> (필터 안)', f: [N('n', '몇 번째 필터 단계', 1, 20), S('at', '무엇을', ['baseFrequency', 'seed', 'scale', 'stdDeviation', 'radius', 'dx', 'dy', 'surfaceScale', 'specularConstant', 'diffuseConstant']), T('vals', '값들 (; 로 나눠요)'), N('dur', '한 번 시간 (초)', .1, 20, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5'])], d: () => ({ n: 1, at: 'baseFrequency', vals: '0.02;0.04;0.02', dur: 4, rep: 'indefinite' }) },
        'animate-gradient': { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🌈', n: '그라데이션 움직이기', o: '<animateTransform> (그라데이션 안)', f: [S('k', '어떻게', ['translate', 'rotate']), N('d', '흐르는 거리 (도형 크기 배)', .1, 3, .1), N('dur', '한 번 시간 (초)', .1, 20, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5'])], d: () => ({ k: 'translate', d: 1, dur: 2.5, rep: 'indefinite' }) },
        'animate-stop': { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🎨', n: '그라데이션 색 하나 바꾸기', o: '<animate> (stop-color)', f: [N('i', '몇 번째 색', 1, 10), T('vals', '색들 (; 로 나눠요)'), N('dur', '한 번 시간 (초)', .1, 20, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5'])], d: () => ({ i: 1, vals: '#ffb3d9;#b3e5ff;#ffb3d9', dur: 3, rep: 'indefinite' }) },
        'animate-pattern': { g: '🎬 SVG 움직임 (SMIL)', an: 1, e: '🔁', n: '무늬 움직이기', o: '<animateTransform> (pattern 안)', f: [S('k', '어떻게', ['translate', 'rotate']), N('dur', '한 번 시간 (초)', .1, 20, .1), S('rep', '몇 번', ['indefinite', '1', '2', '3', '5'])], d: () => ({ k: 'translate', dur: 3, rep: 'indefinite' }) },
        'css-animation': { g: '🎨 CSS 효과 (SVG → CSS)', an: 1, e: '🎬', n: 'CSS 움직임 (@keyframes)', o: 'animation + @keyframes', f: [S('p', '무엇을', ['rotate', 'scale', 'translateX', 'translateY', 'skewX', 'opacity']), N('a', '처음 값', -360, 360, .05), N('b', '끝 값', -360, 360, .05), N('dur', '한 번 시간 (초)', .1, 20, .1), S('ease', '빠르기 변화', ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'steps(4)']), N('delay', '기다렸다 시작 (초)', 0, 10, .1), S('count', '몇 번', ['infinite', '1', '2', '3', '5']), S('dir', '방향', ['alternate', 'normal', 'reverse', 'alternate-reverse'])], d: () => ({ p: 'scale', a: 1, b: 1.2, dur: 1, ease: 'ease-in-out', delay: 0, count: 'infinite', dir: 'alternate' }) },
        'css-filter': { g: '🎨 CSS 효과 (SVG → CSS)', e: '🪄', n: 'CSS 필터', o: 'filter: …()', f: [S('fn', '종류', ['blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'sepia', 'hue-rotate', 'invert', 'opacity']), N('v', '값 (흐림 px · 각도 · %)', 0, 360)], d: () => ({ fn: 'saturate', v: 160 }) },
        'css-drop-shadow': { g: '🎨 CSS 효과 (SVG → CSS)', e: '🫥', n: 'CSS 모양 그림자', o: 'filter: drop-shadow()', f: [N('x', '옆으로', -60, 60), N('y', '아래로', -60, 60), N('b', '번짐', 0, 60), C('c', '색')], d: () => ({ x: 4, y: 8, b: 6, c: CO('#3d3552', 45) }) },
        'transform-origin': { g: '🎨 CSS 효과 (SVG → CSS)', e: '📌', n: '도는 기준점 (CSS)', o: 'transform-origin · transform-box', f: [P('x', '가로 %'), P('y', '세로 %'), S('box', '기준 상자', ['fill-box', 'view-box', 'stroke-box'])], d: () => ({ x: 50, y: 50, box: 'fill-box' }) },
        feImage: { g: '🪄 필터 (위에서부터 차례로)', fx: 1, e: '🖼️', n: '그림 넣기', o: '<feImage>', f: [['src', '그림', 'img'], S('ref', '또는 내 도형', 'ELS')], d: () => ({ src: '', ref: '' }) }
    };
    const GROUPS = [...new Set(Object.values(BL).map(b => b.g))].map(g => [g, Object.keys(BL).filter(k => BL[k].g === g)]);
    let seq = 1; const nid = () => 's' + Date.now().toString(36) + (seq++);
    const freshEl = (t, W, H) => EL[t] ? { id: nid(), t, on: true, v: EL[t].d(W, H), mv: { x: 0, y: 0 }, b: [] } : null;
    const freshB = (t, W, H) => BL[t] ? { id: nid(), t, on: true, v: BL[t].d(W, H) } : null;
    const okEl = e => !!e && !!EL[e.t] && Array.isArray(e.b);
    const r1 = n => Math.round(n * 100) / 100;

    let W0 = 0, H0 = 0;
    function cen(e) {                                                          // 도형 가운데 (돌기 축 · 대강)
        const v = e.v, n = s => (String(s).match(/-?\d*\.?\d+/g) || []).map(Number), avg = a => { let x = 0, y = 0, k = 0; for (let i = 0; i + 1 < a.length; i += 2) { x += a[i]; y += a[i + 1]; k++; } return k ? [x / k, y / k] : [0, 0]; };
        const p = e.t === 'g' ? [W0 / 2, H0 / 2] : e.t === 'rect' || e.t === 'image' ? [v.x + v.width / 2, v.y + v.height / 2] : e.t === 'circle' || e.t === 'ellipse' ? [v.cx, v.cy] : e.t === 'line' ? [(v.x1 + v.x2) / 2, (v.y1 + v.y2) / 2] : e.t === 'polyline' || e.t === 'polygon' ? avg([].concat(...v.points)) : e.t === 'path' || e.t === 'textPath' ? avg(n(v.d)) : [v.x || 0, v.y || 0];
        return p.map(r1);
    }
    async function fontsOf(L) {                                                // 글자에 쓴 글꼴 (그 글자만)
        let fonts = ''; if (!(window.CB && CB.faceCss)) return '';
        const fams = {}; (L.els || []).forEach(e => { if (!e.on || !(e.t === 'text' || e.t === 'textPath')) return; const f = (e.b.find(B => B.on && B.t === 'font-family') || { v: { v: 'Gowun Dodum' } }).v.v; fams[f] = (fams[f] || '') + e.v.t; });
        for (const f of Object.keys(fams)) fonts += await CB.faceCss(f, fams[f]); return fonts;
    }
    const hasAnim = L => (L.els || []).some(e => e.on && (e.b || []).some(B => B.on && BL[B.t] && BL[B.t].an));
    /* ---------- 진짜 svg 글 ---------- */
    function build(L, W, H, fonts) {
        W0 = W; H0 = H; const defs = [], body = [], css = [], els = (L.els || []).filter(e => e.on && EL[e.t]);
        [...els].reverse().forEach(e => {
            const v = e.v, id = e.id, on = (e.b || []).filter(B => B.on && BL[B.t]), one = t => on.find(B => B.t === t), at = [`id="${id}"`];
            if (e.t === 'rect' || e.t === 'image') ['x', 'y', 'width', 'height'].forEach(k => at.push(`${k}="${r1(v[k])}"`));
            if (e.t === 'rect') at.push(`rx="${r1(v.rx)}" ry="${r1(v.ry)}"`);
            if (e.t === 'circle') at.push(`cx="${r1(v.cx)}" cy="${r1(v.cy)}" r="${r1(v.r)}"`);
            if (e.t === 'ellipse') at.push(`cx="${r1(v.cx)}" cy="${r1(v.cy)}" rx="${r1(v.rx)}" ry="${r1(v.ry)}"`);
            if (e.t === 'line') at.push(`x1="${r1(v.x1)}" y1="${r1(v.y1)}" x2="${r1(v.x2)}" y2="${r1(v.y2)}"`);
            if (e.t === 'polyline' || e.t === 'polygon') at.push(`points="${v.points.map(p => p.map(r1).join(',')).join(' ')}"`);
            if (e.t === 'path') at.push(`d="${xml(v.d)}"`);
            if (e.t === 'text') at.push(`x="${r1(v.x)}" y="${r1(v.y)}"`);
            if (e.t === 'image') at.push(`href="${xml(v.src || '')}" preserveAspectRatio="${v.par.trim()}"`);
            if (e.t === 'use') { if (!v.ref || !els.some(x => x.id === v.ref && x.id !== id)) return; at.push(`href="#${v.ref}" x="${r1(v.x)}" y="${r1(v.y)}"`); }
            const noFill = e.t === 'line' || e.t === 'polyline' || (e.t === 'path' && !one('fill')), has = rid => !!rid && els.some(x => x.id === rid && x.id !== id);
            const paint = { fill: one('fill') ? col(one('fill').v.c) : (noFill ? 'none' : (e.t === 'use' || e.t === 'g' ? null : '#5b3f4a')), stroke: one('stroke') ? col(one('stroke').v.c) : ((e.t === 'line' || e.t === 'polyline' || e.t === 'path') && !one('fill') ? '#5b3f4a' : null) };
            const gaB = on.find(B => B.t === 'animate-gradient'), ga = '', xa = [];   // 🍎 그라데이션 흐르기 = 장면 24장을 차례로 바꿔 끼워요 (사파리는 gradientTransform 움직임을 안 그려요 · 도련 11-19 1330 아이패드)
            const asB = on.filter(B => B.t === 'animate-stop'), apB = on.find(B => B.t === 'animate-pattern');
            on.forEach((B, q) => { const g = B.v, gid = `${id}p${q}`;
                if (B.t === 'linearGradient' || B.t === 'radialGradient') { const st = g.stops.s.map((x, si) => { const sa = asB.filter(A => +A.v.i === si + 1).map(A => `<animate attributeName="stop-color" values="${xml(A.v.vals)}" dur="${A.v.dur}s" repeatCount="${A.v.rep}"/>`).join(''); return `<stop offset="${x.p}%" stop-color="${x.c.c}" stop-opacity="${(x.c.a == null ? 100 : x.c.a) / 100}"${sa ? `>${sa}</stop>` : '/>'}`; }).join('') + ga;
                    const gdef = (gi, tf) => B.t === 'linearGradient' ? `<linearGradient id="${gi}" x1="${g.x1}%" y1="${g.y1}%" x2="${g.x2}%" y2="${g.y2}%" spreadMethod="${g.sp}"${tf ? ` gradientTransform="${tf}"` : ''}>${st}</linearGradient>` : `<radialGradient id="${gi}" cx="${g.cx}%" cy="${g.cy}%" r="${g.r}%" fx="${g.fx}%" fy="${g.fy}%" spreadMethod="${g.sp}"${tf ? ` gradientTransform="${tf}"` : ''}>${st}</radialGradient>`;
                    defs.push(gdef(gid, gaB ? (gaB.v.k === 'rotate' ? 'rotate(0 .5 .5)' : `translate(-${gaB.v.d} -${gaB.v.d})`) : ''));
                    if (gaB && !paint['_' + g.to]) { const N = 24, ids = [];
                        for (let k = 0; k < N; k++) { const f = k / N, d = gaB.v.d, gi = `${gid}s${k}`; ids.push(gi); defs.push(gdef(gi, gaB.v.k === 'rotate' ? `rotate(${r1(360 * f)} .5 .5)` : `translate(${r1(-d + 2 * d * f)} ${r1(-d + 2 * d * f)})`)); }
                        xa.push({ at: g.to, ids, dur: +gaB.v.dur, rep: gaB.v.rep }); }
                    if (!paint['_' + g.to]) { paint[g.to] = `url(#${gid})`; paint['_' + g.to] = 1; } }
                if (B.t === 'pattern') { const w = g.w, h = g.h, s = g.sz / 100, cf = ` fill="${col(g.c)}"`;
                    const sh = g.sh === 'circle' ? `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * s / 2}"${cf}/>` : g.sh === 'rect' ? `<rect x="${w * (1 - s) / 2}" y="${h * (1 - s) / 2}" width="${w * s}" height="${h * s}"${cf}/>` : g.sh === 'polygon' ? `<polygon points="${w / 2},${h * (1 - s) / 2} ${w * (1 + s) / 2},${h * (1 + s) / 2} ${w * (1 - s) / 2},${h * (1 + s) / 2}"${cf}/>` : `<path d="${xml(g.d)}" transform="translate(${w * (1 - s) / 2} ${h * (1 - s) / 2}) scale(${w * s / 100} ${h * s / 100})"${cf}/>`;
                    const sh2 = has(g.ref) ? `<use href="#${g.ref}" transform="translate(${r1(g.ox)} ${r1(g.oy)}) scale(${g.ps})"/>` : sh, pa = apB ? `<animateTransform attributeName="patternTransform" type="${apB.v.k}" additive="sum" values="${apB.v.k === 'rotate' ? `0 ${w / 2} ${h / 2};360 ${w / 2} ${h / 2}` : `0 0;${w} ${h}`}" dur="${apB.v.dur}s" repeatCount="${apB.v.rep}"/>` : '';
                    defs.push(`<pattern id="${gid}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${g.rot})">${pa}<rect width="${w}" height="${h}" fill="${col(g.bg)}"/>${sh2}</pattern>`);
                    if (!paint['_' + g.to]) { paint[g.to] = `url(#${gid})`; paint['_' + g.to] = 1; } } });
            if (paint.fill) at.push(`fill="${paint.fill}"`); if (paint.stroke) at.push(`stroke="${paint.stroke}"`);
            const A = (k, f) => { const B = one(k); if (B) at.push(`${k}="${xml(f(B.v))}"`); };
            A('stroke-width', x => x.v); A('stroke-dasharray', x => `${x.a} ${x.b}`); A('stroke-dashoffset', x => x.v); A('stroke-linecap', x => x.v); A('stroke-linejoin', x => x.v); A('stroke-miterlimit', x => x.v); A('fill-rule', x => x.v); A('opacity', x => x.v); A('paint-order', x => x.v); A('shape-rendering', x => x.v);
            A('font-size', x => x.v); A('font-family', x => x.v); A('font-weight', x => x.v); A('font-style', x => x.v); A('letter-spacing', x => x.v); A('word-spacing', x => x.v); A('text-anchor', x => x.v); A('dominant-baseline', x => x.v); A('text-decoration', x => x.v); A('writing-mode', x => x.v);
            A('fill-opacity', x => x.v); A('stroke-opacity', x => x.v); A('visibility', x => x.v); A('vector-effect', x => x.v); A('baseline-shift', x => x.v);
            if (one('textLength') && (e.t === 'text' || e.t === 'textPath')) at.push(`textLength="${r1(one('textLength').v.v)}" lengthAdjust="${one('textLength').v.adj}"`);
            const sty = []; if (one('mix-blend-mode')) sty.push(`mix-blend-mode:${one('mix-blend-mode').v.v}`);
            const cf = on.filter(B => B.t === 'css-filter' || B.t === 'css-drop-shadow').map(B => B.t === 'css-drop-shadow' ? `drop-shadow(${B.v.x}px ${B.v.y}px ${B.v.b}px ${col(B.v.c)})` : `${B.v.fn}(${B.v.v}${B.v.fn === 'blur' ? 'px' : B.v.fn === 'hue-rotate' ? 'deg' : '%'})`);
            if (cf.length) sty.push(`filter:${cf.join(' ')}`);
            const ca = on.filter(B => B.t === 'css-animation'), to = one('transform-origin');
            if (ca.length || to) sty.push(`transform-box:${to ? to.v.box : 'fill-box'};transform-origin:${to ? `${to.v.x}% ${to.v.y}%` : 'center'}`);
            if (ca.length) { sty.push(`animation:${ca.map(B => `sbk${B.id} ${B.v.dur}s ${B.v.ease} ${B.v.delay}s ${B.v.count} ${B.v.dir}`).join(',')}`);
                ca.forEach(B => { const f = B.v.p === 'opacity' ? (n => `opacity:${n}`) : B.v.p === 'scale' ? (n => `transform:scale(${n})`) : B.v.p === 'rotate' || B.v.p === 'skewX' ? (n => `transform:${B.v.p}(${n}deg)`) : (n => `transform:${B.v.p}(${n}px)`); css.push(`@keyframes sbk${B.id}{from{${f(B.v.a)}}to{${f(B.v.b)}}}`); }); }
            if (sty.length) at.push(`style="${xml(sty.join(';'))}"`);
            if ((e.t === 'text' || e.t === 'textPath') && !one('font-family')) at.push(`font-family="Gowun Dodum"`);
            if ((e.t === 'text' || e.t === 'textPath') && !one('font-size')) at.push(`font-size="${Math.round(W / 9)}"`);
            if (e.t === 'text' && !one('text-anchor')) at.push('text-anchor="middle"');
            const cl = one('clipPath'); if (cl) { const g = cl.v, r = g.sz / 200, sh = g.sh === 'circle' ? `<circle cx=".5" cy=".5" r="${r}"/>` : g.sh === 'ellipse' ? `<ellipse cx=".5" cy=".5" rx="${r}" ry="${r}"/>` : g.sh === 'rect' ? `<rect x="${.5 - r}" y="${.5 - r}" width="${r * 2}" height="${r * 2}"/>` : g.sh === 'polygon' ? `<polygon points=".5,${.5 - r} ${.5 + r},${.5 + r} ${.5 - r},${.5 + r}"/>` : `<path d="${xml(g.d)}" transform="translate(${.5 - r} ${.5 - r}) scale(${r / 50})"/>`;
                defs.push(g.sh === 'element' && has(g.ref) ? `<clipPath id="${id}c" clipPathUnits="userSpaceOnUse"><use href="#${g.ref}"/></clipPath>` : `<clipPath id="${id}c" clipPathUnits="objectBoundingBox">${sh}</clipPath>`); at.push(`clip-path="url(#${id}c)"`); }
            const mk = one('mask'); if (mk) { const g = mk.v, a = g.ang * Math.PI / 180, gx = Math.cos(a) / 2, gy = Math.sin(a) / 2;
                if (g.k === 'element' && has(g.ref)) defs.push(`<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><use href="#${g.ref}"/></mask>`); else defs.push(`<mask id="${id}m" maskContentUnits="objectBoundingBox">${g.k === 'linear' ? `<linearGradient id="${id}mg" x1="${.5 - gx}" y1="${.5 - gy}" x2="${.5 + gx}" y2="${.5 + gy}">` : `<radialGradient id="${id}mg" cx=".5" cy=".5" r=".5">`}<stop offset="${g.a}%" stop-color="#fff"/><stop offset="${g.b}%" stop-color="#000"/>${g.k === 'linear' ? '</linearGradient>' : '</radialGradient>'}<rect x="-.5" y="-.5" width="2" height="2" fill="url(#${id}mg)"/></mask>`); at.push(`mask="url(#${id}m)"`); }
            const mr = one('marker'); if (mr) { const g = mr.v, z = g.sz, sh = g.sh === 'arrow' ? `<path d="M0,0 L10,5 L0,10 Z"/>` : g.sh === 'dot' ? `<circle cx="5" cy="5" r="5"/>` : `<rect width="10" height="10"/>`;
                const re = g.sh === 'element' && has(g.ref) ? els.find(x => x.id === g.ref) : null, rc = re ? cen(re) : null;
                defs.push(re ? `<marker id="${id}k" refX="${rc[0]}" refY="${rc[1]}" markerWidth="${W}" markerHeight="${H}" markerUnits="userSpaceOnUse" orient="auto-start-reverse" overflow="visible"><use href="#${g.ref}"/></marker>` : `<marker id="${id}k" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="${z}" markerHeight="${z}" markerUnits="userSpaceOnUse" orient="auto-start-reverse" fill="${col(g.c)}">${sh}</marker>`);
                if (g.s) at.push(`marker-start="url(#${id}k)"`); if (g.m) at.push(`marker-mid="url(#${id}k)"`); if (g.e) at.push(`marker-end="url(#${id}k)"`); }
            const tf = [`translate(${r1(e.mv.x)} ${r1(e.mv.y)})`].concat(on.filter(B => ['translate', 'rotate', 'scale', 'skewX', 'skewY'].includes(B.t)).map(B => B.t === 'translate' ? `translate(${B.v.x} ${B.v.y})` : B.t === 'rotate' ? `rotate(${B.v.a} ${r1(B.v.cx)} ${r1(B.v.cy)})` : B.t === 'scale' ? `scale(${B.v.x} ${B.v.y})` : `${B.t}(${B.v.a})`));
            at.push(`transform="${tf.join(' ')}"`);
            const F = on.filter(B => BL[B.t].fx); if (F.length) { let n = 0; const ref = x => x === 'prev' ? (n ? 'r' + n : 'SourceGraphic') : x;
                const pr = F.map(B => { const V = B.v, I = V.in ? ` in="${ref(V.in)}"` : '', I2 = V.in2 ? ` in2="${ref(V.in2)}"` : '', R = ` result="r${n + 1}"`, light = () => V.lt === 'distant' ? `<feDistantLight azimuth="${V.az}" elevation="${V.el}"/>` : V.lt === 'point' ? `<fePointLight x="${r1(V.lx)}" y="${r1(V.ly)}" z="${V.lz}"/>` : `<feSpotLight x="${r1(V.lx)}" y="${r1(V.ly)}" z="${V.lz}" pointsAtX="${W / 2}" pointsAtY="${H / 2}" pointsAtZ="0" limitingConeAngle="${V.ca}"/>`;
                    let o;
                    if (B.t === 'feGaussianBlur') o = `<feGaussianBlur${I} stdDeviation="${V.s}"${R}/>`;
                    else if (B.t === 'feOffset') o = `<feOffset${I} dx="${V.dx}" dy="${V.dy}"${R}/>`;
                    else if (B.t === 'feDropShadow') o = `<feDropShadow${I} dx="${V.dx}" dy="${V.dy}" stdDeviation="${V.s}" flood-color="${V.c.c}" flood-opacity="${V.c.a / 100}"${R}/>`;
                    else if (B.t === 'feFlood') o = `<feFlood flood-color="${V.c.c}" flood-opacity="${V.c.a / 100}"${R}/>`;
                    else if (B.t === 'feMorphology') o = `<feMorphology${I} operator="${V.op}" radius="${V.r}"${R}/>`;
                    else if (B.t === 'feColorMatrix') o = `<feColorMatrix${I} type="${V.ty}"${V.ty === 'luminanceToAlpha' ? '' : ` values="${V.ty === 'saturate' ? Math.min(V.v, 3) : V.v}"`}${R}/>`;
                    else if (B.t === 'feComponentTransfer') { const fn = `type="${V.ty}" slope="${V.slope}" intercept="${V.icpt}" amplitude="${V.amp}" exponent="${V.exp}" offset="${V.icpt}" tableValues="${xml(V.tab)}"`, chs = V.ch === 'RGB' ? ['R', 'G', 'B'] : [V.ch]; o = `<feComponentTransfer${I}${R}>${chs.map(c => `<feFunc${c} ${fn}/>`).join('')}</feComponentTransfer>`; }
                    else if (B.t === 'feConvolveMatrix') o = `<feConvolveMatrix${I} order="3" kernelMatrix="${xml(V.k)}"${V.div ? ` divisor="${V.div}"` : ''} bias="${V.bias}"${R}/>`;
                    else if (B.t === 'feDiffuseLighting') o = `<feDiffuseLighting${I} surfaceScale="${V.ss}" diffuseConstant="${V.dc}" lighting-color="${V.c.c}"${R}>${light()}</feDiffuseLighting>`;
                    else if (B.t === 'feSpecularLighting') o = `<feSpecularLighting${I} surfaceScale="${V.ss}" specularConstant="${V.sc}" specularExponent="${V.se}" lighting-color="${V.c.c}"${R}>${light()}</feSpecularLighting>`;
                    else if (B.t === 'feTurbulence') o = `<feTurbulence type="${V.ty}" baseFrequency="${V.bf}" numOctaves="${V.oc}" seed="${V.seed}" stitchTiles="${V.st}"${R}/>`;
                    else if (B.t === 'feDisplacementMap') o = `<feDisplacementMap${I}${I2} scale="${V.sc}" xChannelSelector="${V.xc}" yChannelSelector="${V.yc}"${R}/>`;
                    else if (B.t === 'feComposite') o = `<feComposite${I}${I2} operator="${V.op}"${V.op === 'arithmetic' ? ` k1="${V.k1}" k2="${V.k2}" k3="${V.k3}" k4="${V.k4}"` : ''}${R}/>`;
                    else if (B.t === 'feBlend') o = `<feBlend${I}${I2} mode="${V.m}"${R}/>`;
                    else if (B.t === 'feMerge') o = `<feMerge${R}>${['a', 'b', 'c'].map(k => `<feMergeNode in="${ref(V[k])}"/>`).join('')}</feMerge>`;
                    else if (B.t === 'feTile') o = `<feTile${I}${R}/>`;
                    else o = has(V.ref) ? `<feImage href="#${V.ref}"${R}/>` : V.src ? `<feImage href="${xml(V.src)}" preserveAspectRatio="xMidYMid slice"${R}/>` : `<feFlood flood-opacity="0"${R}/>`;
                    const fr = on.find(A => A.t === 'fe-region' && +A.v.n === n + 1); if (fr) o = o.replace(/^<(fe\w+)/, `<$1 x="${fr.v.x}%" y="${fr.v.y}%" width="${fr.v.w}%" height="${fr.v.h}%"`);
                    n++; return o; });
                /* 🍎 필터 움직이기 = 장면을 여러 장 만들어 차례로 바꿔 끼워요 (사파리는 필터 안 값 움직임을 안 그려요 · 도련 11-19 1330 아이패드 물결 · 촛불) */
                const FA = on.filter(A => A.t === 'animate-filter' && +A.v.n >= 1 && +A.v.n <= pr.length);
                const at1 = (o, k, v) => new RegExp(`^<fe\\w+[^>]*\\s${k}="`).test(o) ? o.replace(new RegExp(`^(<fe\\w+[^>]*?\\s${k}=")[^"]*"`), `$1${v}"`) : o.replace(/^<(fe\w+)/, `<$1 ${k}="${v}"`);
                const valAt = (A, t) => { const L = String(A.v.vals).split(';').map(x => x.trim()).filter(Boolean).map(x => x.split(/[\s,]+/).map(Number)); if (!L.length) return ''; if (L.length === 1) return L[0].join(' ');
                    const d = +A.v.dur || 1, u = ((t % d) / d) * (L.length - 1), i = Math.min(L.length - 2, Math.floor(u)), f = u - i, v = L[i].map((a, j) => a + ((L[i + 1][j] != null ? L[i + 1][j] : a) - a) * f);
                    return v.map(x => A.v.at === 'seed' ? Math.round(x) : +x.toFixed(4)).join(' '); };
                const rg = one('filter-region'), m = rg ? rg.v.m : 50, fh = fid => `<filter id="${fid}" x="-${m}%" y="-${m}%" width="${100 + m * 2}%" height="${100 + m * 2}%" color-interpolation-filters="${rg ? rg.v.ci : 'sRGB'}">`;
                defs.push(fh(`${id}f`) + pr.join('') + '</filter>'); at.push(`filter="url(#${id}f)"`);
                if (FA.length) { const T = Math.max(...FA.map(A => +A.v.dur || 1)), N = Math.max(8, Math.min(24, Math.round(T * 8))), ids = [];
                    for (let k = 0; k < N; k++) { const t = T * k / N, fid = `${id}f${k}`; ids.push(fid); defs.push(fh(fid) + pr.map((o, i) => FA.filter(A => +A.v.n === i + 1).reduce((q, A) => { const v = valAt(A, t); return v === '' ? q : at1(q, A.v.at, v); }, o)).join('') + '</filter>'); }
                    xa.push({ at: 'filter', ids, dur: T, rep: FA[0].v.rep }); } }
            const SPL = { ease: '0.25 0.1 0.25 1', 'ease-in': '0.42 0 1 1', 'ease-out': '0 0 0.58 1', 'ease-in-out': '0.42 0 0.58 1' };
            const kids = on.filter(B => BL[B.t].an && !['css-animation', 'animate-filter', 'animate-gradient', 'animate-stop', 'animate-pattern'].includes(B.t)).map(B => { const g = B.v, bg = g.after ? `a${g.after}.end+${g.begin || 0}s` : `${g.begin || 0}s`;
                const rp = ` id="a${B.id}" begin="${bg}"` + (B.t === 'set' ? '' : ` dur="${g.dur}s" repeatCount="${g.rep}"`) + (g.acc ? ' accumulate="sum"' : '');
                const vals = (A, Z) => { const V = g.alt ? [A, Z, A] : [A, Z]; if (g.ease && g.ease !== 'linear') { const kt = V.map((_, i) => +(i / (V.length - 1)).toFixed(3)).join(';'); return `values="${V.map(xml).join(';')}" keyTimes="${kt}"` + (g.ease === 'discrete' ? ' calcMode="discrete"' : ` calcMode="spline" keySplines="${V.slice(1).map(() => SPL[g.ease]).join(';')}"`); } return g.alt ? `values="${V.map(xml).join(';')}"` : `from="${xml(A)}" to="${xml(Z)}"`; };
                if (B.t === 'animate') return `<animate attributeName="${g.at}" ${vals(g.from, g.to)}${rp} fill="${g.fill}"/>`;
                if (B.t === 'animateTransform') { const c = g.cen && g.ty === 'rotate' ? ' ' + cen(e).join(' ') : '', A = String(g.from).trim() + (c && !/\s/.test(String(g.from).trim()) ? c : ''), Z = String(g.to).trim() + (c && !/\s/.test(String(g.to).trim()) ? c : '');
                    return `<animateTransform attributeName="transform" type="${g.ty}" additive="sum" ${vals(A, Z)}${rp}/>`; }
                if (B.t === 'animateMotion') { const ez = g.ease && g.ease !== 'linear' ? (g.ease === 'discrete' ? ' calcMode="discrete" keyPoints="0;1" keyTimes="0;1"' : ` calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines="${SPL[g.ease]}"`) : '';
                    return has(g.ref) ? `<animateMotion rotate="${g.rot}"${ez}${rp}><mpath href="#${g.ref}"/></animateMotion>` : `<animateMotion path="${xml(g.d)}" rotate="${g.rot}"${ez}${rp}/>`; }
                return `<set id="a${B.id}" attributeName="${g.at}" to="${xml(g.to)}" begin="${g.after ? `a${g.after}.end+${g.begin || 0}s` : g.begin + 's'}" fill="freeze"/>`; }).join('');
            if (xa.length) at.push(`data-sw="${xa[0].at}|${xa[0].ids.join(',')}|${xa[0].dur}|${xa[0].rep}"`);   // 🍎 장면 바꿔 끼우기 = 끝에서 복사본 여러 장 + 차례로 보이기 (expandUse)
            const txIn = (t, multi) => {                                       // 🖍 글자 일부 꾸미기 · ↕ 여러 줄
                const ts = on.filter(B => B.t === 'tspan'), lines = multi ? String(t).split('\n') : [String(t)]; if (lines.length < 2 && !ts.length) return xml(t);
                const lh = one('line-height') ? one('line-height').v.v : 1.25, fsz = one('font-size') ? one('font-size').v.v : Math.round(W / 9); let idx = 0;
                return lines.map((ln, li) => { const seg = []; let cu = null; [...ln].forEach(ch => { idx++; const st = ts.find(B => idx >= B.v.a && idx < B.v.a + B.v.n) || null; if (!cu || cu.st !== st) { cu = { st, t: '' }; seg.push(cu); } cu.t += ch; }); idx++;
                    const bd = seg.map(sg => { if (!sg.st) return xml(sg.t); const q = sg.st.v; return `<tspan fill="${col(q.c)}"${q.fs ? ` font-size="${q.fs}"` : ''}${q.fw ? ` font-weight="${q.fw}"` : ''}${q.dy ? ` dy="${q.dy}"` : ''}>${xml(sg.t)}</tspan>${q.dy ? `<tspan dy="${-q.dy}"></tspan>` : ''}`; }).join('');
                    return lines.length > 1 ? `<tspan x="${r1(v.x)}" dy="${li ? r1(fsz * lh) : r1(-(lines.length - 1) * fsz * lh / 2)}">${bd || ' '}</tspan>` : bd; }).join('');
            };
            const out = o => { if (one('defs')) defs.push(o); else body.push(o); };
            if (e.t === 'g') { const mem = body.splice(Math.max(0, body.length - Math.max(1, v.n || 1))); out(`<g ${at.join(' ')}>${kids}${mem.join('')}</g>`); return; }   // 📦 바로 아래 도형들을 묶어요
            if (e.t === 'text') out(`<text ${at.join(' ')}>${kids}${txIn(v.t, true)}</text>`);
            else if (e.t === 'textPath') { defs.push(`<path id="${id}t" d="${xml(v.d)}"/>`); out(`<text ${at.join(' ')}>${kids}<textPath href="#${id}t" startOffset="${v.off}%">${txIn(v.t, false)}</textPath></text>`); }
            else out(kids ? `<${e.t} ${at.join(' ')}>${kids}</${e.t}>` : `<${e.t} ${at.join(' ')}/>`);
        });
        return expandUse(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fonts || css.length ? `<style>${xml(fonts + css.join('')).replace(/&amp;/g, '&')}</style>` : ''}${defs.length ? `<defs>${defs.join('')}</defs>` : ''}${body.join('')}</svg>`);
    }
    /* 🍎 움직이는 도형을 <use> 로 복사한 것 = 진짜 복사본으로 펼쳐요 (사파리는 use 복사본 안의 움직임을 안 그려요 · 도련 11-19 1330 아이패드 꽃 만다라 · 크롬도 같은 모습) */
    function expandUse(svg) {
        if (!/data-sw=/.test(svg) && (!/<use\b/.test(svg) || !/<(animate|animateTransform|animateMotion|set)\b|animation:/.test(svg)) || typeof DOMParser === 'undefined') return svg;
        try {
            const doc = new DOMParser().parseFromString(svg, 'image/svg+xml'), root = doc.documentElement; if (root.querySelector('parsererror')) return svg;
            const isAnim = el => !!el && (el.matches('animate,animateTransform,animateMotion,set') || !!el.querySelector('animate,animateTransform,animateMotion,set') || /animation:/.test(el.getAttribute('style') || '') || [...el.querySelectorAll('[style]')].some(x => /animation:/.test(x.getAttribute('style'))));
            /* 🍎 장면 바꿔 끼우기 (그라데이션 흐르기 · 필터 움직이기) : 같은 도형 N 장 (장면마다 그라데이션 · 필터 하나씩) · 한 장씩 차례로 보여요 (visibility · 사파리 · 크롬 모두 · 칠/필터 주소를 움직이는 건 둘 다 안 돼요) */
            const NS = 'http://www.w3.org/2000/svg';
            for (const el of [...root.querySelectorAll('[data-sw]')]) {
                const [at, idl, dur, rep] = el.getAttribute('data-sw').split('|'), ids = idl.split(','), N = ids.length; el.removeAttribute('data-sw'); if (N < 2) continue;
                const g = doc.createElementNS(NS, 'g'), id = el.getAttribute('id'); if (id) { g.setAttribute('id', id); el.removeAttribute('id'); }
                const cs = ids.map((_, k) => k ? el.cloneNode(true) : el);   // 복사본은 먼저 (움직임을 넣기 전에 · 넣고 복사하면 첫 장면 움직임이 다 따라가요)
                ids.forEach((fid, k) => { const c = cs[k]; if (k) c.querySelectorAll('[id]').forEach(q => q.removeAttribute('id')); c.setAttribute(at, `url(#${fid})`);
                    const a = doc.createElementNS(NS, 'animate'); a.setAttribute('attributeName', 'visibility'); a.setAttribute('calcMode', 'discrete'); a.setAttribute('dur', dur + 's'); a.setAttribute('repeatCount', rep);
                    if (!k) { a.setAttribute('values', 'visible;hidden'); a.setAttribute('keyTimes', `0;${(1 / N).toFixed(4)}`); } else { a.setAttribute('values', 'hidden;visible;hidden'); a.setAttribute('keyTimes', `0;${(k / N).toFixed(4)};${((k + 1) / N).toFixed(4)}`); }
                    c.insertBefore(a, c.firstChild); if (k) g.appendChild(c); });
                el.replaceWith(g); g.insertBefore(el, g.firstChild);
            }
            let guard = 0;
            for (const u of [...root.querySelectorAll('use')]) {
                if (++guard > 200) break; if (u.closest('defs,clipPath,mask,pattern,marker,symbol')) continue;
                const ref = (u.getAttribute('href') || u.getAttribute('xlink:href') || '').replace(/^#/, ''), t = ref && doc.getElementById(ref); if (!t || !isAnim(t)) continue;
                const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g'), x = +u.getAttribute('x') || 0, y = +u.getAttribute('y') || 0;
                [...u.attributes].forEach(a => { if (!['href', 'xlink:href', 'x', 'y', 'width', 'height', 'transform'].includes(a.name)) g.setAttribute(a.name, a.value); });
                g.setAttribute('transform', `${u.getAttribute('transform') || ''}${x || y ? ` translate(${x} ${y})` : ''}`.trim());
                const c = t.cloneNode(true); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(q => q.removeAttribute('id')); g.appendChild(c); u.replaceWith(g);
            }
            return new XMLSerializer().serializeToString(root);
        } catch (e) { return svg; }
    }
    function svgText(L, W, H) { return build(L, W, H, '').replace(/href="data:[^"]{60,}"/g, 'href="(내-그림)"').replace(/></g, '>\n<'); }

    /* ---------- 그리기 : 브라우저 svg → 그림 ---------- */
    let onImg = null, pend = 0;
    const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
    const loadImg = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
    async function bake(L, key, W, H) {
        const fonts = await fontsOf(L);
        const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(build(L, W, H, fonts));
        let im = await loadImg(src); if (/href="data:|@font-face/.test(src.slice(0, 200000)) || fonts) { await new Promise(r => setTimeout(r, 60)); im = await loadImg(src); }
        const c = mkCv(W, H); c.getContext('2d').drawImage(im, 0, 0, W, H); return { key, c };
    }
    /* 🎬 움직임을 뺀 모습 (도련 11-19 · 1324 · 씰 시트에서 스티커 자리 찾기용) : 첫 장면이 비어 있는 움직임 (손글씨 하트처럼 점선이 밀려 나오는 것) 도 모양 그대로 */
    const stillSvg = t => t.replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*\/>/g, '').replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/animation:[^;"}]*;?/g, '');
    async function bakeStill(L, W, H) {
        const fonts = await fontsOf(L), src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(stillSvg(build(L, W, H, fonts)));
        let im = await loadImg(src); if (/@font-face/.test(src.slice(0, 200000)) || fonts) { await new Promise(r => setTimeout(r, 60)); im = await loadImg(src); }
        const c = mkCv(W, H); c.getContext('2d').drawImage(im, 0, 0, W, H); return c;
    }
    function queue(L, key, W, H) {
        if (L._sbWant === key) return; L._sbWant = key; if (L._sbT) return; pend++;
        L._sbT = setTimeout(async () => { let r = null; const k = L._sbWant;
            try { r = await bake(L, k, W, H); } catch (e) { console.warn('🌀 svg 블록 그리기', e); }
            L._sbT = 0; pend--;
            if (r && r.key === L._sbWant) { L._sbr = r; if (onImg) onImg(); }
            else if (L._sbWant !== k) { const kk = L._sbWant; L._sbWant = null; queue(L, kk, W, H); } }, 30);
    }
    function paint(out, W, H, L) {
        const x = out.getContext('2d'); x.clearRect(0, 0, W, H); const key = W + 'x' + H + '|' + JSON.stringify(L.els || []), r = L._sbr;
        if (r) x.drawImage(r.c, 0, 0); if (!r || r.key !== key) queue(L, key, W, H);
    }
    async function settle(ms = 8000) { const t0 = Date.now(); while (pend > 0 && Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 40)); }
    window.SB = { EL, BL, GROUPS, KO, FONTS, freshEl, freshB, okEl, build, svgText, fontsOf, hasAnim, paint, settle, clone, bakeStill, get busy() { return pend; }, set onImg(f) { onImg = f; } };
})();
