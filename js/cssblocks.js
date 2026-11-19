/* 말랑달콤 다이어리 - js/cssblocks.js
   🧩 블록 레이어 엔진 (도련 11-18 · 시안 13 그대로 · 1296 css 거의 전부 + 애니메이션) : 블록 하나 = css 공식 기능 하나 · 쌓아서 꾸며요
   - AI 가 미리 조합한 블록(줄무늬 · 땡땡이 · 하트 오리기 ...)은 없어요 · 수학(calc · var) · 내 블록 만들기 없음
   - 세 부분 : ▣ 상자 (L.blocks) · ✨ ::before (L.pb) · ✨ ::after (L.pa) · 🎬 애니메이션 = @keyframes (굽는 그림은 첫 장면 · 그림판에선 움직여요)
   - 블록 레이어 = 상자 하나 (box = 종이 안 자리 · 크기 비율) + 블록 목록 (위 = 앞 · 같은 속성이면 위 블록이 이겨요) + 상자 안 글자 (L.text)
   - 블록 = { id, t, on, v, L? }  (L = 그 그림의 background-size · position · repeat)
   - 그리기 = 브라우저가 진짜 css 로 (svg foreignObject → 그림) · 상자 크기마다 한 번 굽고 옮기기는 그대로 · 글꼴은 그 글자만 담아요
   - CB.cssText(L) = 👩‍💻 코드 보기 (진짜 css) · CB.settle() = 굽는 중인 것 기다리기 (✅ 완료 전) */
(function () {
    'use strict';
    const HX = n => Math.round(Math.max(0, Math.min(100, n)) * 2.55).toString(16).padStart(2, '0');
    const col = v => (v.a == null || v.a >= 100) ? v.c : v.c + HX(v.a), len = v => v.n + v.u;
    const CO = (c, a = 100) => ({ c, a }), LN = (n, u = 'px') => ({ n, u });
    const STOP = (u, ...s) => ({ u, s: s.map(([c, p, a]) => ({ c: CO(c, a == null ? 100 : a), p })) });
    const stops = v => v.s.map(x => `${col(x.c)} ${x.p}${v.u}`).join(', ');
    const KO = { stretch: '늘이기', 'padding-box': '테두리 안쪽', underline: '밑줄', overline: '윗줄', 'line-through': '취소선', wavy: '물결', visible: '보이게', hidden: '자르기', clip: '딱 자르기', 'horizontal-tb': '가로쓰기', 'vertical-rl': '세로쓰기 (오른쪽부터)', 'vertical-lr': '세로쓰기 (왼쪽부터)', mixed: '섞어서', upright: '세워서', sideways: '눕혀서',
        'filled dot': '● 점', 'filled circle': '● 동그라미', 'filled double-circle': '◉ 겹동그라미', 'filled triangle': '▲ 세모', 'filled sesame': '﹅ 깨', 'open dot': '○ 점', 'open circle': '○ 동그라미', 'open triangle': '△ 세모', 'stroke fill': '테두리 먼저 (바깥)', 'fill stroke': '칠 먼저 (보통)',
        add: '더하기', subtract: '빼기', intersect: '겹친 곳만', exclude: '겹친 곳 빼기', isolate: '따로 섞기', flat: '평평하게', 'preserve-3d': '입체 그대로', infinite: '계속', linear: '같은 빠르기', ease: '부드럽게', 'ease-in': '천천히 시작', 'ease-out': '천천히 끝', 'ease-in-out': '천천히 시작 · 끝', 'steps(4)': '뚝뚝 4번', 'steps(8)': '뚝뚝 8번',
        reverse: '거꾸로', alternate: '왔다 갔다', 'alternate-reverse': '거꾸로 왔다 갔다', none: '없음', forwards: '끝 장면 그대로', backwards: '첫 장면 먼저', both: '둘 다', italic: '기울임', oblique: '비스듬히', 'soft-light': '부드럽게', 'hard-light': '강하게', 'plus-lighter': '더 밝게', reverse2: '', 'border-box2': '',
        rotate: '돌리기', scale: '크기', translateX: '가로 옮기기', translateY: '세로 옮기기', opacity: '진하기', 'background-color': '바탕색', 'hue-rotate': '색 돌리기', blur: '흐리게', 'border-radius': '둥글기', 'offset-distance': '길 따라 가기 %', 'letter-spacing': '글자 사이', auto: '원래대로', ' ': '', solid: '실선', dashed: '점선', dotted: '땡땡', double: '이중', groove: '홈', ridge: '솟음', inset: '안쪽', outset: '바깥', circle: '원', ellipse: '타원', 'farthest-corner': '먼 모서리까지', 'closest-side': '가까운 변까지', 'closest-corner': '가까운 모서리까지', 'farthest-side': '먼 변까지',
        auto: '원래대로', cover: '꽉 채우기', contain: '다 보이게', 'w h': '직접 정하기', repeat: '반복', 'no-repeat': '한 번만', 'repeat-x': '가로로만', 'repeat-y': '세로로만', space: '띄워서 반복', round: '맞춰서 반복',
        normal: '보통', multiply: '곱하기', screen: '스크린', overlay: '오버레이', darken: '어둡게', lighten: '밝게', 'color-dodge': '닷지', 'color-burn': '번', difference: '차이', exclusion: '제외', hue: '색상', saturation: '채도', color: '색', luminosity: '밝기',
        'border-box': '테두리까지', 'padding-box': '테두리 안쪽', 'content-box': '내용만', text: '글자 안에만', left: '왼쪽', center: '가운데', right: '오른쪽', justify: '양쪽',
        '400': '보통', '700': '굵게', '900': '아주 굵게', Jua: '주아', 'Gowun Dodum': '고운돋움', Gaegu: '개구', 'Nanum Pen Script': '나눔손글씨 펜', 'Do Hyeon': '도현', 'Hi Melody': '하이멜로디', 'Poor Story': '푸어스토리', 'Single Day': '싱글데이', 'Gamja Flower': '감자꽃', 'Yeon Sung': '연성',
        'Black Han Sans': '검은고딕', Dongle: '동글', 'Cute Font': '귀여운', 'Nanum Myeongjo': '나눔명조', Sunflower: '해바라기', Stylish: '스타일리시', 'Song Myung': '송명', Gugi: '구기' };
    Object.assign(KO, { uppercase: '모두 대문자', lowercase: '모두 소문자', capitalize: '첫 글자만 대문자', 'full-width': '전각', 'keep-all': '낱말 지키기 (한글)', 'break-all': '아무 데서나', nowrap: '안 바꿈', pre: '그대로', 'pre-line': '줄만 그대로', 'pre-wrap': '그대로 + 바꿈', manual: '직접', wrap: '보통', balance: '고르게', pretty: '예쁘게',
        'small-caps': '작은 대문자', 'all-small-caps': '모두 작은 대문자', pixelated: '픽셀 그대로', 'crisp-edges': '또렷하게', smooth: '부드럽게', scroll: '보통', local: '안쪽', fixed: '고정', slice: '이어서', clone: '줄마다', 'margin-box': '바깥 여백까지', 'match-source': '그림대로', alpha: '투명도', luminance: '밝기',
        'view-box': '종이', 'fill-box': '칠 상자', 'stroke-box': '선 상자',
        row: '가로로', column: '세로로', 'row-reverse': '가로 거꾸로', 'column-reverse': '세로 거꾸로', 'flex-start': '앞쪽', 'flex-end': '뒤쪽', 'space-between': '양 끝 맞춰 고르게', 'space-around': '둘레 고르게', 'space-evenly': '사이 똑같이', baseline: '글자 바닥', 'wrap-reverse': '거꾸로 다음 줄',
        flex: '나란히 (flex)', grid: '바둑판 (grid)', block: '위아래', 'inline-block': '글자처럼', 'inline-flex': '글자처럼 나란히', static: '흐름대로', relative: '흐름대로 + 살짝 옮기기', absolute: '직접 자리', '1fr': '똑같이 나눠', 'min-content': '가장 좁게', 'max-content': '내용만큼',
        srgb: '보통 (srgb)', oklab: '자연스럽게 (oklab)', oklch: '선명하게 (oklch)', hsl: '색상환 (hsl)', lab: 'lab', below: '아래', above: '위', '"liga" 0': '이어 쓰기 끄기', '"smcp"': '작은 대문자', '"tnum"': '숫자 폭 같게', '"frac"': '분수', '"ss01"': '다른 글자 모양 1', '"swsh"': '꼬리 장식', '"salt"': '다른 모양', condensed: '좁게', expanded: '넓게', 'ultra-expanded': '아주 넓게',
        'cubic-bezier(.68,-0.6,.32,1.6)': '통통 튀게', 'cubic-bezier(.34,1.56,.64,1)': '살짝 넘쳤다 돌아오기', 'cubic-bezier(.7,0,.3,1)': '느리게 · 빠르게 · 느리게', 'steps(2)': '뚝뚝 2번',
        skewX: '가로 기울이기', skewY: '세로 기울이기', width: '폭', height: '높이', 'background-position-x': '무늬 가로 흐르기', 'background-position-y': '무늬 세로 흐르기', brightness: '밝기', saturate: '채도', grayscale: '흑백', 'outline-offset': '바깥 테두리 띄우기' });
    const FONTS = ['Gowun Dodum', 'Jua', 'Gaegu', 'Nanum Pen Script', 'Do Hyeon', 'Hi Melody', 'Poor Story', 'Single Day', 'Gamja Flower', 'Yeon Sung', 'Black Han Sans', 'Dongle', 'Cute Font', 'Nanum Myeongjo', 'Sunflower', 'Stylish', 'Song Myung', 'Gugi'];
    const LP = [['px', '%'], 0, 200];
    // 칸 = [키, 이름, 종류, 범위] · 종류 : col · len · ang · pct · num · sel · bool · stops · pts · img
    const LAYER = [['sz', '크기', 'sel', ['auto', 'cover', 'contain', 'w h']], ['w', '가로', 'len', [['px', '%'], 1, 400]], ['h', '세로', 'len', [['px', '%'], 1, 400]], ['x', '가로 자리', 'pct', [0, 100]], ['y', '세로 자리', 'pct', [0, 100]], ['rep', '반복', 'sel', ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round']]];
    const LDEF = () => ({ sz: 'auto', w: LN(40), h: LN(40), x: 0, y: 0, rep: 'repeat' });
    const LIN = [['ang', '방향', 'ang'], ['stops', '색', 'stops', ['%', 'px']]], RAD = [['shape', '모양', 'sel', ['circle', 'ellipse']], ['size', '퍼지는 끝', 'sel', ['farthest-corner', 'closest-side', 'closest-corner', 'farthest-side']], ['x', '가운데 가로', 'pct', [0, 100]], ['y', '가운데 세로', 'pct', [0, 100]], ['stops', '색', 'stops', ['%', 'px']]],
        CON = [['from', '시작 방향', 'ang'], ['x', '가운데 가로', 'pct', [0, 100]], ['y', '가운데 세로', 'pct', [0, 100]], ['stops', '색', 'stops', ['%', 'deg']]];
    /* css 공식 함수 (값 목록에 들어가요) */
    const FN = {
        'linear-gradient': { g: 'img', e: '🌈', n: '직선 그라데이션', f: LIN, d: () => ({ ang: 135, stops: STOP('%', ['#ffc6d6', 0], ['#c4b2f2', 100]) }), css: v => `linear-gradient(${v.ang}deg, ${stops(v.stops)})` },
        'radial-gradient': { g: 'img', e: '🔆', n: '원형 그라데이션', f: RAD, d: () => ({ shape: 'circle', size: 'farthest-corner', x: 50, y: 50, stops: STOP('%', ['#ffffff', 0], ['#ffb3c9', 100]) }), css: v => `radial-gradient(${v.shape} ${v.size} at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        'conic-gradient': { g: 'img', e: '🥧', n: '부채꼴 그라데이션', f: CON, d: () => ({ from: 0, x: 50, y: 50, stops: STOP('%', ['#ffd479', 0], ['#ff8fb1', 50], ['#ffd479', 100]) }), css: v => `conic-gradient(from ${v.from}deg at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        'repeating-linear-gradient': { g: 'img', e: '🔁', n: '되풀이 직선', f: LIN, d: () => ({ ang: 45, stops: STOP('px', ['#ffd6e2', 0], ['#ffd6e2', 12], ['#ffffff', 12], ['#ffffff', 24]) }), css: v => `repeating-linear-gradient(${v.ang}deg, ${stops(v.stops)})` },
        'repeating-radial-gradient': { g: 'img', e: '🎯', n: '되풀이 원형', f: RAD, d: () => ({ shape: 'circle', size: 'farthest-corner', x: 50, y: 50, stops: STOP('px', ['#ffd6e2', 0], ['#ffd6e2', 10], ['#ffffff', 10], ['#ffffff', 20]) }), css: v => `repeating-radial-gradient(${v.shape} ${v.size} at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        'repeating-conic-gradient': { g: 'img', e: '🌞', n: '되풀이 부채꼴', f: CON, d: () => ({ from: 0, x: 50, y: 50, stops: STOP('deg', ['#fff1a8', 0], ['#fff1a8', 15], ['#ffffff', 15], ['#ffffff', 30]) }), css: v => `repeating-conic-gradient(from ${v.from}deg at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        url: { g: 'img', e: '🖼️', n: '그림 깔기', f: [['src', '그림', 'img']], d: () => ({ src: '' }), L: () => ({ sz: 'cover', w: LN(100, '%'), h: LN(100, '%'), x: 50, y: 50, rep: 'no-repeat' }), css: v => v.src ? `url("${v.src}")` : 'none' },
        shadow: { g: 'box-shadow', e: '🌑', n: '그림자', f: [['inset', '안쪽으로', 'bool'], ['x', '옆으로', 'len', ['px', -60, 60]], ['y', '아래로', 'len', ['px', -60, 60]], ['b', '번짐', 'len', ['px', 0, 80]], ['s', '퍼짐', 'len', ['px', -30, 60]], ['c', '색', 'col']], d: () => ({ inset: false, x: LN(0), y: LN(10), b: LN(24), s: LN(0), c: CO('#3d3552', 33) }), css: v => `${v.inset ? 'inset ' : ''}${len(v.x)} ${len(v.y)} ${len(v.b)} ${len(v.s)} ${col(v.c)}` },
        circle: { g: 'clip', e: '⚪', n: '원으로 오리기', f: [['r', '반지름', 'pct', [0, 100]], ['x', '가운데 가로', 'pct', [0, 100]], ['y', '가운데 세로', 'pct', [0, 100]]], d: () => ({ r: 50, x: 50, y: 50 }), css: v => `circle(${v.r}% at ${v.x}% ${v.y}%)` },
        ellipse: { g: 'clip', e: '🥚', n: '타원으로 오리기', f: [['rx', '가로 반지름', 'pct', [0, 100]], ['ry', '세로 반지름', 'pct', [0, 100]], ['x', '가운데 가로', 'pct', [0, 100]], ['y', '가운데 세로', 'pct', [0, 100]]], d: () => ({ rx: 50, ry: 35, x: 50, y: 50 }), css: v => `ellipse(${v.rx}% ${v.ry}% at ${v.x}% ${v.y}%)` },
        inset: { g: 'clip', e: '🔲', n: '안쪽 네모로 오리기', f: [['t', '위', 'pct', [0, 50]], ['r', '오른쪽', 'pct', [0, 50]], ['b', '아래', 'pct', [0, 50]], ['l', '왼쪽', 'pct', [0, 50]], ['rd', '모서리', 'len', LP]], d: () => ({ t: 10, r: 10, b: 10, l: 10, rd: LN(30) }), css: v => `inset(${v.t}% ${v.r}% ${v.b}% ${v.l}% round ${len(v.rd)})` },
        polygon: { g: 'clip', e: '🔺', n: '점 이어 오리기', f: [['pts', '점', 'pts']], d: () => ({ pts: [[50, 0], [100, 100], [0, 100]] }), css: v => `polygon(${v.pts.map(p => `${p[0]}% ${p[1]}%`).join(', ')})` },
        rotate: { g: 'transform', e: '🔄', n: '돌리기', f: [['v', '각도', 'ang', [-180, 180]]], d: () => ({ v: 8 }), css: v => `rotate(${v.v}deg)` },
        scale: { g: 'transform', e: '🔍', n: '크기', f: [['v', '배', 'num', [0, 2, 0.01]]], d: () => ({ v: 0.9 }), css: v => `scale(${v.v})` },
        scaleX: { g: 'transform', e: '↔️', n: '가로 늘리기', f: [['v', '배', 'num', [-2, 2, 0.01]]], d: () => ({ v: 1.2 }), css: v => `scaleX(${v.v})` },
        scaleY: { g: 'transform', e: '↕️', n: '세로 늘리기', f: [['v', '배', 'num', [-2, 2, 0.01]]], d: () => ({ v: 0.8 }), css: v => `scaleY(${v.v})` },
        skewX: { g: 'transform', e: '⏩', n: '가로 기울이기', f: [['v', '각도', 'ang', [-60, 60]]], d: () => ({ v: 10 }), css: v => `skewX(${v.v}deg)` },
        skewY: { g: 'transform', e: '⏫', n: '세로 기울이기', f: [['v', '각도', 'ang', [-60, 60]]], d: () => ({ v: 10 }), css: v => `skewY(${v.v}deg)` },
        translateX: { g: 'transform', e: '➡️', n: '가로 옮기기', f: [['v', '만큼', 'len', [['px', '%'], -150, 150]]], d: () => ({ v: LN(20) }), css: v => `translateX(${len(v.v)})` },
        translateY: { g: 'transform', e: '⬇️', n: '세로 옮기기', f: [['v', '만큼', 'len', [['px', '%'], -150, 150]]], d: () => ({ v: LN(20) }), css: v => `translateY(${len(v.v)})` },
        blur: { g: 'filter', e: '🌫️', n: '흐리게', f: [['r', '흐림', 'len', ['px', 0, 20]]], d: () => ({ r: LN(2) }), css: v => `blur(${len(v.r)})` },
        brightness: { g: 'filter', e: '🌞', n: '밝기', f: [['v', '밝기', 'pct', [0, 300]]], d: () => ({ v: 120 }), css: v => `brightness(${v.v}%)` },
        contrast: { g: 'filter', e: '◐', n: '대비', f: [['v', '대비', 'pct', [0, 300]]], d: () => ({ v: 120 }), css: v => `contrast(${v.v}%)` },
        saturate: { g: 'filter', e: '🍭', n: '채도', f: [['v', '채도', 'pct', [0, 300]]], d: () => ({ v: 150 }), css: v => `saturate(${v.v}%)` },
        grayscale: { g: 'filter', e: '🩶', n: '흑백', f: [['v', '정도', 'pct', [0, 100]]], d: () => ({ v: 100 }), css: v => `grayscale(${v.v}%)` },
        sepia: { g: 'filter', e: '📜', n: '세피아', f: [['v', '정도', 'pct', [0, 100]]], d: () => ({ v: 80 }), css: v => `sepia(${v.v}%)` },
        'hue-rotate': { g: 'filter', e: '🎡', n: '색 돌리기', f: [['v', '각도', 'ang', [0, 360]]], d: () => ({ v: 90 }), css: v => `hue-rotate(${v.v}deg)` },
        invert: { g: 'filter', e: '🔃', n: '색 뒤집기', f: [['v', '정도', 'pct', [0, 100]]], d: () => ({ v: 100 }), css: v => `invert(${v.v}%)` },
        'f-opacity': { o: 'opacity()', g: 'filter', e: '👻', n: '필터 투명', f: [['v', '진하기', 'pct', [0, 100]]], d: () => ({ v: 70 }), css: v => `opacity(${v.v}%)` },
        'drop-shadow': { g: 'filter', e: '🫥', n: '모양 그림자', f: [['x', '옆으로', 'len', ['px', -40, 40]], ['y', '아래로', 'len', ['px', -40, 40]], ['b', '번짐', 'len', ['px', 0, 40]], ['c', '색', 'col']], d: () => ({ x: LN(4), y: LN(6), b: LN(6), c: CO('#3d3552', 50) }), css: v => `drop-shadow(${len(v.x)} ${len(v.y)} ${len(v.b)} ${col(v.c)})` },
        tshadow: { g: 'text-shadow', e: '💬', n: '글자 그림자', f: [['x', '옆으로', 'len', ['px', -20, 20]], ['y', '아래로', 'len', ['px', -20, 20]], ['b', '번짐', 'len', ['px', 0, 20]], ['c', '색', 'col']], d: () => ({ x: LN(3), y: LN(3), b: LN(0), c: CO('#3d3552') }), css: v => `${len(v.x)} ${len(v.y)} ${len(v.b)} ${col(v.c)}` },
        path: { g: 'clip', e: '✒️', n: '패스로 오리기', f: [['d', '길 d (상자 px · M 이동 L 직선 Q C 곡선 Z 닫기)', 'txt']], d: () => ({ d: 'M 20 20 L 220 20 L 120 200 Z' }), css: v => `path('${String(v.d).replace(/'/g, '')}')` },
        rotateX: { g: 'transform', e: '🔃', n: '앞뒤로 돌리기 (3D)', f: [['v', '각도', 'ang', [-180, 180]]], d: () => ({ v: 30 }), css: v => `rotateX(${v.v}deg)` },
        rotateY: { g: 'transform', e: '🔁', n: '좌우로 돌리기 (3D)', f: [['v', '각도', 'ang', [-180, 180]]], d: () => ({ v: 30 }), css: v => `rotateY(${v.v}deg)` },
        rotateZ: { g: 'transform', e: '🔄', n: '평면 돌리기 (3D)', f: [['v', '각도', 'ang', [-180, 180]]], d: () => ({ v: 15 }), css: v => `rotateZ(${v.v}deg)` },
        'perspective()': { o: 'perspective()', g: 'transform', e: '🧊', n: '원근 (3D)', f: [['v', '거리', 'len', ['px', 50, 2000]]], d: () => ({ v: LN(600) }), css: v => `perspective(${len(v.v)})` },
        translateZ: { g: 'transform', e: '⤴️', n: '앞으로 나오기 (3D)', f: [['v', '만큼', 'len', ['px', -300, 300]]], d: () => ({ v: LN(40) }), css: v => `translateZ(${len(v.v)})` },
        'm-linear-gradient': { o: 'mask: linear-gradient()', g: 'mask', e: '🌗', n: '가리기 · 직선', f: LIN, d: () => ({ ang: 180, stops: STOP('%', ['#000000', 40], ['#000000', 100, 0]) }), css: v => `linear-gradient(${v.ang}deg, ${stops(v.stops)})` },
        'm-radial-gradient': { o: 'mask: radial-gradient()', g: 'mask', e: '🌕', n: '가리기 · 원형', f: RAD, d: () => ({ shape: 'circle', size: 'closest-side', x: 50, y: 50, stops: STOP('%', ['#000000', 60], ['#000000', 100, 0]) }), css: v => `radial-gradient(${v.shape} ${v.size} at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        'm-conic-gradient': { o: 'mask: conic-gradient()', g: 'mask', e: '🥧', n: '가리기 · 부채꼴', f: CON, d: () => ({ from: 0, x: 50, y: 50, stops: STOP('%', ['#000000', 0], ['#000000', 75, 0]) }), css: v => `conic-gradient(from ${v.from}deg at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        'm-repeating-linear-gradient': { o: 'mask: repeating-linear-gradient()', g: 'mask', e: '🦓', n: '가리기 · 되풀이 직선', f: LIN, d: () => ({ ang: 45, stops: STOP('px', ['#000000', 0], ['#000000', 10], ['#000000', 10, 0], ['#000000', 20, 0]) }), css: v => `repeating-linear-gradient(${v.ang}deg, ${stops(v.stops)})` },
        'm-repeating-radial-gradient': { o: 'mask: repeating-radial-gradient()', g: 'mask', e: '🎯', n: '가리기 · 되풀이 원형', f: RAD, d: () => ({ shape: 'circle', size: 'farthest-corner', x: 50, y: 50, stops: STOP('px', ['#000000', 0], ['#000000', 8], ['#000000', 8, 0], ['#000000', 16, 0]) }), css: v => `repeating-radial-gradient(${v.shape} ${v.size} at ${v.x}% ${v.y}%, ${stops(v.stops)})` },
        'm-url': { o: 'mask: url()', g: 'mask', e: '🖼️', n: '가리기 · 그림', f: [['src', '그림 (투명한 곳이 가려져요)', 'img']], d: () => ({ src: '' }), L: () => ({ sz: 'contain', w: LN(100, '%'), h: LN(100, '%'), x: 50, y: 50, rep: 'no-repeat' }), css: v => v.src ? `url("${v.src}")` : 'none' },
        'b-blur': { o: 'backdrop-filter: blur()', g: 'backdrop', e: '🫥', n: '뒤 흐리게', f: [['r', '흐림', 'len', ['px', 0, 30]]], d: () => ({ r: LN(6) }), css: v => `blur(${len(v.r)})` },
        'b-brightness': { o: 'backdrop-filter: brightness()', g: 'backdrop', e: '🔆', n: '뒤 밝기', f: [['v', '밝기', 'pct', [0, 300]]], d: () => ({ v: 130 }), css: v => `brightness(${v.v}%)` },
        'b-saturate': { o: 'backdrop-filter: saturate()', g: 'backdrop', e: '🍬', n: '뒤 채도', f: [['v', '채도', 'pct', [0, 300]]], d: () => ({ v: 180 }), css: v => `saturate(${v.v}%)` },
        'b-grayscale': { o: 'backdrop-filter: grayscale()', g: 'backdrop', e: '🩶', n: '뒤 흑백', f: [['v', '정도', 'pct', [0, 100]]], d: () => ({ v: 100 }), css: v => `grayscale(${v.v}%)` },
        'b-hue-rotate': { o: 'backdrop-filter: hue-rotate()', g: 'backdrop', e: '🎡', n: '뒤 색 돌리기', f: [['v', '각도', 'ang', [0, 360]]], d: () => ({ v: 90 }), css: v => `hue-rotate(${v.v}deg)` },
        'b-invert': { o: 'backdrop-filter: invert()', g: 'backdrop', e: '🔃', n: '뒤 색 뒤집기', f: [['v', '정도', 'pct', [0, 100]]], d: () => ({ v: 100 }), css: v => `invert(${v.v}%)` },
        'b-contrast': { o: 'backdrop-filter: contrast()', g: 'backdrop', e: '◐', n: '뒤 대비', f: [['v', '대비', 'pct', [0, 300]]], d: () => ({ v: 140 }), css: v => `contrast(${v.v}%)` },
        'b-sepia': { o: 'backdrop-filter: sepia()', g: 'backdrop', e: '📜', n: '뒤 세피아', f: [['v', '정도', 'pct', [0, 100]]], d: () => ({ v: 80 }), css: v => `sepia(${v.v}%)` },
        animation: { o: 'animation + @keyframes', g: 'anim', e: '🎬', n: '움직임 (키프레임)', f: [['dur', '한 번 걸리는 시간 (초)', 'num', [0.1, 20, 0.1]], ['ease', '빠르기 변화', 'sel', ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(.68,-0.6,.32,1.6)', 'cubic-bezier(.34,1.56,.64,1)', 'cubic-bezier(.7,0,.3,1)', 'steps(2)', 'steps(4)', 'steps(8)']], ['delay', '기다렸다 시작 (초)', 'num', [0, 10, 0.1]], ['count', '몇 번', 'sel', ['infinite', '1', '2', '3', '5']], ['dir', '방향', 'sel', ['normal', 'reverse', 'alternate', 'alternate-reverse']], ['fill', '끝난 뒤', 'sel', ['none', 'forwards', 'backwards', 'both']], ['kf', '장면 (@keyframes)', 'kf']],
            d: () => ({ dur: 2, ease: 'ease-in-out', delay: 0, count: 'infinite', dir: 'alternate', fill: 'none', kf: [{ at: 0, p: 'rotate', v: -8 }, { at: 100, p: 'rotate', v: 8 }] }), css: (v, c) => `cbk${c.id} ${v.dur}s ${v.ease} ${v.delay}s ${v.count} ${v.dir} ${v.fill}` },
    };
    const LIST = { 'background-image': { g: 'img', sep: ', ' }, 'mask-image': { g: 'mask', sep: ', ' }, 'backdrop-filter': { g: 'backdrop', sep: ' ' }, animation: { g: 'anim', sep: ', ' }, 'box-shadow': { g: 'box-shadow', sep: ', ' }, 'text-shadow': { g: 'text-shadow', sep: ', ' }, filter: { g: 'filter', sep: ' ' }, transform: { g: 'transform', sep: ' ' }, 'clip-path': { g: 'clip', one: 1 } };
    const KP = { rotate: ['ang', v => `rotate(${v}deg)`, 'transform', 0], scale: ['num', v => `scale(${v})`, 'transform', 1], translateX: ['px', v => `translateX(${v}px)`, 'transform', 0], translateY: ['px', v => `translateY(${v}px)`, 'transform', 0],
        opacity: ['num', v => v, 'opacity', 1], 'background-color': ['col', v => col(v), 'background-color', CO('#ffd6e5')], color: ['col', v => col(v), 'color', CO('#5b3f4a')], 'hue-rotate': ['ang', v => `hue-rotate(${v}deg)`, 'filter', 0], blur: ['px', v => `blur(${v}px)`, 'filter', 0],
        skewX: ['ang', v => `skewX(${v}deg)`, 'transform', 0], skewY: ['ang', v => `skewY(${v}deg)`, 'transform', 0], width: ['px', v => v + 'px', 'width', 100], height: ['px', v => v + 'px', 'height', 100],
        'background-position-x': ['px', v => v + 'px', 'background-position-x', 0], 'background-position-y': ['px', v => v + 'px', 'background-position-y', 0],
        brightness: ['pct', v => `brightness(${v * 2}%)`, 'filter', 50], saturate: ['pct', v => `saturate(${v * 3}%)`, 'filter', 33], grayscale: ['pct', v => `grayscale(${v}%)`, 'filter', 0], 'outline-offset': ['px', v => v + 'px', 'outline-offset', 0],
        'border-radius': ['px', v => v + 'px', 'border-radius', 0], 'letter-spacing': ['px', v => v + 'px', 'letter-spacing', 0], 'offset-distance': ['pct', v => v + '%', 'offset-distance', 0] };
    const GOF = g => Object.keys(LIST).find(p => LIST[p].g === g);
    const BLEND = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'], BST = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];
    /* css 공식 속성 (값 하나) */
    const SIMPLE = {
        'background-color': { e: '🎨', n: '바탕색', f: [['c', '색', 'col']], d: () => ({ c: CO('#ffe7ee') }), css: v => col(v.c) },
        'background-blend-mode': { e: '🫧', n: '바탕끼리 섞기', f: [['m', '방법', 'sel', BLEND]], d: () => ({ m: 'multiply' }), css: v => v.m },
        'background-clip': { e: '✂️', n: '바탕 그릴 곳', f: [['m', '어디까지', 'sel', ['border-box', 'padding-box', 'content-box', 'text']]], d: () => ({ m: 'text' }), css: v => v.m },
        'border-radius': { e: '⬜', n: '둥근 모서리', f: [['r', '둥글기', 'len', LP]], d: () => ({ r: LN(40) }), css: v => len(v.r) },
        border: { e: '🖍', n: '테두리', f: [['w', '굵기', 'len', ['px', 0, 40]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(6), s: 'dashed', c: CO('#ffffff') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        outline: { e: '⭕', n: '바깥 테두리', f: [['w', '굵기', 'len', ['px', 0, 40]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(4), s: 'solid', c: CO('#ff8fb1') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        'outline-offset': { e: '↔', n: '바깥 테두리 띄우기', f: [['o', '띄우기', 'len', ['px', -40, 40]]], d: () => ({ o: LN(6) }), css: v => len(v.o) },
        opacity: { e: '👻', n: '투명도', f: [['v', '진하기', 'num', [0, 1, 0.01]]], d: () => ({ v: 0.8 }), css: v => v.v },
        color: { e: '🖌', n: '글자색', f: [['c', '색', 'col']], d: () => ({ c: CO('#5b3f4a') }), css: v => col(v.c) },
        'font-size': { e: '🔠', n: '글자 크기', f: [['s', '크기', 'len', ['px', 8, 300]]], d: () => ({ s: LN(64) }), css: v => len(v.s) },
        'font-weight': { e: '🅱️', n: '글자 굵기', f: [['w', '굵기', 'sel', ['400', '700', '900']]], d: () => ({ w: '700' }), css: v => v.w },
        'font-family': { e: '🔤', n: '글꼴', f: [['f', '글꼴', 'sel', FONTS]], d: () => ({ f: 'Jua' }), css: v => `'${v.f}'` },
        'letter-spacing': { e: '↔️', n: '글자 사이', f: [['s', '사이', 'len', ['px', -10, 40]]], d: () => ({ s: LN(2) }), css: v => len(v.s) },
        'line-height': { e: '↕', n: '줄 간격', f: [['v', '배', 'num', [0.6, 3, 0.05]]], d: () => ({ v: 1.3 }), css: v => v.v },
        'text-align': { e: '📏', n: '줄 맞춤', f: [['a', '맞춤', 'sel', ['left', 'center', 'right', 'justify']]], d: () => ({ a: 'center' }), css: v => v.a },
        '-webkit-text-stroke': { e: '✒️', n: '글자 테두리', f: [['w', '굵기', 'len', ['px', 0, 12]], ['c', '색', 'col']], d: () => ({ w: LN(2), c: CO('#ffffff') }), css: v => `${len(v.w)} ${col(v.c)}` },
        'background-origin': { e: '📍', n: '바탕 시작 자리', f: [['m', '어디부터', 'sel', ['border-box', 'padding-box', 'content-box']]], d: () => ({ m: 'border-box' }), css: v => v.m },
        'mask-composite': { e: '🎭', n: '가리기끼리 합치기', f: [['m', '방법', 'sel', ['add', 'subtract', 'intersect', 'exclude']]], d: () => ({ m: 'intersect' }), css: v => v.m },
        'border-image': { e: '🖼', n: '테두리 그림', f: [['ang', '방향', 'ang'], ['stops', '색', 'stops', ['%']], ['w', '굵기', 'len', ['px', 1, 60]], ['rep', '채우기', 'sel', ['stretch', 'repeat', 'round', 'space']]], d: () => ({ ang: 90, stops: STOP('%', ['#ff8fb1', 0], ['#ffd36e', 50], ['#9fd3ea', 100]), w: LN(12), rep: 'stretch' }), css: v => `linear-gradient(${v.ang}deg, ${stops(v.stops)}) 1 / ${len(v.w)} / 0 ${v.rep}` },
        'border-top': { e: '⬆️', n: '위 테두리', f: [['w', '굵기', 'len', ['px', 0, 40]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(8), s: 'solid', c: CO('#ff8fb1') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        'border-right': { e: '➡️', n: '오른쪽 테두리', f: [['w', '굵기', 'len', ['px', 0, 40]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(8), s: 'solid', c: CO('#ffd36e') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        'border-bottom': { e: '⬇️', n: '아래 테두리', f: [['w', '굵기', 'len', ['px', 0, 40]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(8), s: 'solid', c: CO('#9fd3ea') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        'border-left': { e: '⬅️', n: '왼쪽 테두리', f: [['w', '굵기', 'len', ['px', 0, 40]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(8), s: 'solid', c: CO('#b9a3ee') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        'border-radius-4': { p: 'border-radius', e: '◰', n: '모서리 따로', f: [['a', '왼쪽 위', 'len', LP], ['b', '오른쪽 위', 'len', LP], ['c', '오른쪽 아래', 'len', LP], ['d', '왼쪽 아래', 'len', LP]], d: () => ({ a: LN(60), b: LN(10), c: LN(60), d: LN(10) }), css: v => `${len(v.a)} ${len(v.b)} ${len(v.c)} ${len(v.d)}` },
        'border-radius-e': { p: 'border-radius', e: '🥚', n: '모서리 타원', f: [['h', '가로 둥글기', 'len', LP], ['v', '세로 둥글기', 'len', LP]], d: () => ({ h: LN(50, '%'), v: LN(30, '%') }), css: v => `${len(v.h)} / ${len(v.v)}` },
        padding: { e: '🔳', n: '안쪽 여백', f: [['v', '여백', 'len', ['px', 0, 120]]], d: () => ({ v: LN(20) }), css: v => len(v.v) },
        overflow: { e: '🪟', n: '넘치는 것', f: [['v', '어떻게', 'sel', ['visible', 'hidden', 'clip']]], d: () => ({ v: 'hidden' }), css: v => v.v },
        'mix-blend-mode': { e: '🫐', n: '아래와 섞기', f: [['m', '방법', 'sel', BLEND.concat(['plus-lighter'])]], d: () => ({ m: 'multiply' }), css: v => v.m },
        isolation: { e: '🫙', n: '섞기 따로', f: [['m', '방법', 'sel', ['auto', 'isolate']]], d: () => ({ m: 'isolate' }), css: v => v.m },
        perspective: { e: '🧊', n: '원근 (속 3D)', f: [['v', '거리', 'len', ['px', 50, 2000]]], d: () => ({ v: LN(600) }), css: v => len(v.v) },
        'transform-origin': { e: '📌', n: '돌리는 기준점', f: [['x', '가로', 'pct', [0, 100]], ['y', '세로', 'pct', [0, 100]]], d: () => ({ x: 50, y: 50 }), css: v => `${v.x}% ${v.y}%` },
        'transform-style': { e: '🧱', n: '3D 그대로', f: [['m', '방법', 'sel', ['flat', 'preserve-3d']]], d: () => ({ m: 'preserve-3d' }), css: v => v.m },
        'backface-visibility': { e: '🔙', n: '뒷면 보이기', f: [['m', '뒷면', 'sel', ['visible', 'hidden']]], d: () => ({ m: 'hidden' }), css: v => v.m },
        'z-index': { e: '🗂', n: '앞뒤 순서', f: [['v', '숫자 (클수록 앞)', 'num', [-10, 10, 1]]], d: () => ({ v: -1 }), css: v => v.v },
        width: { e: '↔️', n: '폭', f: [['v', '폭', 'len', [['%', 'px'], 0, 400]]], d: () => ({ v: LN(60, '%') }), css: v => len(v.v) },
        height: { e: '↕️', n: '높이', f: [['v', '높이', 'len', [['%', 'px'], 0, 400]]], d: () => ({ v: LN(60, '%') }), css: v => len(v.v) },
        left: { e: '⇥', n: '왼쪽에서', f: [['v', '만큼', 'len', [['%', 'px'], -200, 400]]], d: () => ({ v: LN(20, '%') }), css: v => len(v.v) },
        top: { e: '⤓', n: '위에서', f: [['v', '만큼', 'len', [['%', 'px'], -200, 400]]], d: () => ({ v: LN(20, '%') }), css: v => len(v.v) },
        content: { e: '💬', n: '장식 글자 (content)', f: [['t', '글자 · 이모지', 'txt']], d: () => ({ t: '♥' }), css: v => `"${String(v.t).replace(/["\\\n]/g, '')}"` },
        'offset-path': { e: '🛤', n: '움직일 길', f: [['d', '길 d (상자 px)', 'txt']], d: () => ({ d: 'M 0 0 C 120 -80 240 80 360 0' }), css: v => `path('${String(v.d).replace(/'/g, '')}')` },
        'offset-rotate': { e: '🧭', n: '길 따라 돌기', f: [['m', '방법', 'sel', ['auto', '0deg']]], d: () => ({ m: 'auto' }), css: v => v.m },
        'font-style': { e: '𝑰', n: '기울임', f: [['m', '방법', 'sel', ['normal', 'italic', 'oblique']]], d: () => ({ m: 'italic' }), css: v => v.m },
        'text-decoration': { e: '〰', n: '밑줄 · 취소선', f: [['l', '줄', 'sel', ['underline', 'overline', 'line-through']], ['s', '모양', 'sel', ['solid', 'double', 'dotted', 'dashed', 'wavy']], ['c', '색', 'col'], ['w', '굵기', 'len', ['px', 1, 20]]], d: () => ({ l: 'underline', s: 'wavy', c: CO('#ff8fb1'), w: LN(3) }), css: v => `${v.l} ${v.s} ${col(v.c)} ${len(v.w)}` },
        'text-underline-offset': { e: '⤵', n: '밑줄 띄우기', f: [['v', '띄우기', 'len', ['px', -10, 40]]], d: () => ({ v: LN(6) }), css: v => len(v.v) },
        'word-spacing': { e: '⇔', n: '단어 사이', f: [['v', '사이', 'len', ['px', -10, 60]]], d: () => ({ v: LN(10) }), css: v => len(v.v) },
        'writing-mode': { e: '📜', n: '세로쓰기', f: [['m', '방향', 'sel', ['horizontal-tb', 'vertical-rl', 'vertical-lr']]], d: () => ({ m: 'vertical-rl' }), css: v => v.m },
        'text-orientation': { e: '🔠', n: '세로쓰기 글자 방향', f: [['m', '방향', 'sel', ['mixed', 'upright', 'sideways']]], d: () => ({ m: 'upright' }), css: v => v.m },
        'text-emphasis': { e: '◌', n: '드러냄표', f: [['s', '모양', 'sel', ['filled dot', 'filled circle', 'filled double-circle', 'filled triangle', 'filled sesame', 'open dot', 'open circle', 'open triangle']], ['c', '색', 'col']], d: () => ({ s: 'filled dot', c: CO('#ff6f91') }), css: v => `${v.s} ${col(v.c)}` },
        'paint-order': { e: '🖊', n: '글자 테두리 바깥으로', f: [['m', '순서', 'sel', ['stroke fill', 'fill stroke']]], d: () => ({ m: 'stroke fill' }), css: v => v.m },
        '-webkit-text-fill-color': { e: '🫗', n: '글자 속 색', f: [['c', '색', 'col']], d: () => ({ c: CO('#ffffff', 0) }), css: v => col(v.c) },
        /* ➕ 11-19 빠진 css 채우기 */
        'text-transform': { e: '🔡', n: '영문 대소문자', f: [['m', '방법', 'sel', ['none', 'uppercase', 'lowercase', 'capitalize', 'full-width']]], d: () => ({ m: 'uppercase' }), css: v => v.m },
        'text-indent': { e: '⇥', n: '첫 줄 들여쓰기', f: [['v', '만큼', 'len', [['px', 'em'], -60, 200]]], d: () => ({ v: LN(24) }), css: v => len(v.v) },
        'word-break': { e: '✂', n: '줄 바꿈 자리', f: [['m', '방법', 'sel', ['normal', 'keep-all', 'break-all']]], d: () => ({ m: 'keep-all' }), css: v => v.m },
        'white-space': { e: '␣', n: '빈칸 · 줄 그대로', f: [['m', '방법', 'sel', ['pre-wrap', 'normal', 'nowrap', 'pre', 'pre-line']]], d: () => ({ m: 'nowrap' }), css: v => v.m },
        hyphens: { e: '‐', n: '낱말 끊기 (영문)', f: [['m', '방법', 'sel', ['manual', 'auto', 'none']]], d: () => ({ m: 'auto' }), css: v => v.m },
        'text-wrap': { e: '⚖', n: '줄 길이 고르게', f: [['m', '방법', 'sel', ['wrap', 'balance', 'pretty', 'nowrap']]], d: () => ({ m: 'balance' }), css: v => v.m },
        'font-variant': { e: '🔤', n: '작은 대문자', f: [['m', '방법', 'sel', ['normal', 'small-caps', 'all-small-caps']]], d: () => ({ m: 'small-caps' }), css: v => v.m },
        columns: { e: '📰', n: '단 나누기', f: [['n', '단 수', 'num', [1, 6, 1]]], d: () => ({ n: 2 }), css: v => v.n },
        'column-gap': { e: '↔', n: '단 사이', f: [['v', '사이', 'len', ['px', 0, 120]]], d: () => ({ v: LN(24) }), css: v => len(v.v) },
        'column-rule': { e: '┃', n: '단 사이 선', f: [['w', '굵기', 'len', ['px', 0, 20]], ['s', '선', 'sel', BST], ['c', '색', 'col']], d: () => ({ w: LN(2), s: 'dashed', c: CO('#ff8fb1') }), css: v => `${len(v.w)} ${v.s} ${col(v.c)}` },
        'image-rendering': { e: '👾', n: '그림 확대 방법', f: [['m', '방법', 'sel', ['auto', 'pixelated', 'crisp-edges', 'smooth']]], d: () => ({ m: 'pixelated' }), css: v => v.m },
        'background-attachment': { e: '📌', n: '바탕 붙이는 곳', f: [['m', '방법', 'sel', ['scroll', 'local', 'fixed']]], d: () => ({ m: 'local' }), css: v => v.m },
        'box-decoration-break': { e: '🧷', n: '줄마다 꾸밈', f: [['m', '방법', 'sel', ['slice', 'clone']]], d: () => ({ m: 'clone' }), css: v => v.m },
        'outline-style': { e: '⭕', n: '바깥 테두리 모양', f: [['s', '선', 'sel', BST.concat(['auto'])]], d: () => ({ s: 'dotted' }), css: v => v.s },
        'accent-color': { e: '🎯', n: '강조색', f: [['c', '색', 'col']], d: () => ({ c: CO('#ff8fb1') }), css: v => col(v.c) },
        'caret-color': { e: '▏', n: '글자 커서 색', f: [['c', '색', 'col']], d: () => ({ c: CO('#ff8fb1') }), css: v => col(v.c) },
        'clip-path-box': { p: 'clip-path', e: '📦', n: '상자 모양으로 오리기', f: [['m', '어느 상자', 'sel', ['border-box', 'padding-box', 'content-box', 'margin-box']]], d: () => ({ m: 'padding-box' }), css: v => v.m },
        'mask-mode': { e: '🎭', n: '가리기 기준', f: [['m', '기준', 'sel', ['match-source', 'alpha', 'luminance']]], d: () => ({ m: 'luminance' }), css: v => v.m },
        'transform-box': { e: '📐', n: '돌리는 기준 상자', f: [['m', '상자', 'sel', ['view-box', 'border-box', 'fill-box', 'content-box', 'stroke-box']]], d: () => ({ m: 'border-box' }), css: v => v.m },
        /* ➕ 11-19 2차 : 상자 나무 배치 · 색 섞기 · 거울 · 글꼴 세부 · 테두리 그림 */
        display: { e: '🧱', n: '안에 든 상자 놓는 법', f: [['m', '방법', 'sel', ['flex', 'grid', 'block', 'inline-block', 'inline-flex', 'none']]], d: () => ({ m: 'flex' }), css: v => v.m },
        'flex-direction': { e: '↔', n: '나란히 방향', f: [['m', '방향', 'sel', ['row', 'column', 'row-reverse', 'column-reverse']]], d: () => ({ m: 'row' }), css: v => v.m },
        'justify-content': { e: '⇔', n: '줄 방향 맞춤', f: [['m', '맞춤', 'sel', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']]], d: () => ({ m: 'space-evenly' }), css: v => v.m },
        'align-items': { e: '⇕', n: '가로지르는 맞춤', f: [['m', '맞춤', 'sel', ['stretch', 'flex-start', 'center', 'flex-end', 'baseline']]], d: () => ({ m: 'center' }), css: v => v.m },
        'align-content': { e: '☰', n: '여러 줄 맞춤', f: [['m', '맞춤', 'sel', ['stretch', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around']]], d: () => ({ m: 'center' }), css: v => v.m },
        'flex-wrap': { e: '↩', n: '넘치면 다음 줄', f: [['m', '방법', 'sel', ['nowrap', 'wrap', 'wrap-reverse']]], d: () => ({ m: 'wrap' }), css: v => v.m },
        gap: { e: '⇹', n: '상자 사이', f: [['v', '사이', 'len', ['px', 0, 120]]], d: () => ({ v: LN(12) }), css: v => len(v.v) },
        'grid-template-columns': { e: '▦', n: '바둑판 가로 칸', f: [['n', '칸 수', 'num', [1, 12, 1]], ['w', '칸 폭', 'sel', ['1fr', 'auto', 'min-content', 'max-content']]], d: () => ({ n: 3, w: '1fr' }), css: v => `repeat(${v.n}, ${v.w})` },
        'grid-template-rows': { e: '▤', n: '바둑판 세로 칸', f: [['n', '칸 수', 'num', [1, 12, 1]], ['w', '칸 높이', 'sel', ['1fr', 'auto', 'min-content', 'max-content']]], d: () => ({ n: 2, w: '1fr' }), css: v => `repeat(${v.n}, ${v.w})` },
        'grid-column': { e: '⬌', n: '바둑판 가로 몇 칸 차지', f: [['n', '칸', 'num', [1, 12, 1]]], d: () => ({ n: 2 }), css: v => `span ${v.n}` },
        'grid-row': { e: '⬍', n: '바둑판 세로 몇 칸 차지', f: [['n', '칸', 'num', [1, 12, 1]]], d: () => ({ n: 2 }), css: v => `span ${v.n}` },
        'flex-grow': { e: '⤢', n: '남는 자리 차지', f: [['v', '몫', 'num', [0, 10, 1]]], d: () => ({ v: 1 }), css: v => v.v },
        'align-self': { e: '⇳', n: '나만 맞춤', f: [['m', '맞춤', 'sel', ['auto', 'flex-start', 'center', 'flex-end', 'stretch']]], d: () => ({ m: 'flex-end' }), css: v => v.m },
        order: { e: '🔢', n: '놓이는 차례', f: [['v', '차례 (작을수록 먼저)', 'num', [-10, 10, 1]]], d: () => ({ v: -1 }), css: v => v.v },
        position: { e: '📍', n: '자리 잡는 법', f: [['m', '방법', 'sel', ['static', 'relative', 'absolute']]], d: () => ({ m: 'absolute' }), css: v => v.m },
        right: { e: '⇤', n: '오른쪽에서', f: [['v', '만큼', 'len', [['%', 'px'], -200, 400]]], d: () => ({ v: LN(10, '%') }), css: v => len(v.v) },
        bottom: { e: '⤒', n: '아래에서', f: [['v', '만큼', 'len', [['%', 'px'], -200, 400]]], d: () => ({ v: LN(10, '%') }), css: v => len(v.v) },
        margin: { e: '⬚', n: '바깥 여백', f: [['v', '여백', 'len', ['px', -60, 120]]], d: () => ({ v: LN(8) }), css: v => len(v.v) },
        'aspect-ratio': { e: '📐', n: '가로세로 비율', f: [['m', '비율', 'sel', ['1 / 1', '4 / 3', '3 / 4', '16 / 9', '9 / 16', '3 / 2', '2 / 3']]], d: () => ({ m: '1 / 1' }), css: v => v.m },
        'bg-mix': { p: 'background-color', e: '🧪', n: '바탕색 섞기 (color-mix)', f: [['a', '색 1', 'col'], ['b', '색 2', 'col'], ['p', '색 1 몫', 'pct', [0, 100]], ['sp', '섞는 방식', 'sel', ['srgb', 'oklab', 'oklch', 'hsl', 'lab']]], d: () => ({ a: CO('#ff8fb1'), b: CO('#7cc8ff'), p: 50, sp: 'oklab' }), css: v => `color-mix(in ${v.sp}, ${col(v.a)} ${v.p}%, ${col(v.b)})` },
        'color-mix': { p: 'color', e: '🧪', n: '글자색 섞기 (color-mix)', f: [['a', '색 1', 'col'], ['b', '색 2', 'col'], ['p', '색 1 몫', 'pct', [0, 100]], ['sp', '섞는 방식', 'sel', ['srgb', 'oklab', 'oklch', 'hsl', 'lab']]], d: () => ({ a: CO('#ff5d8f'), b: CO('#a37cff'), p: 50, sp: 'oklab' }), css: v => `color-mix(in ${v.sp}, ${col(v.a)} ${v.p}%, ${col(v.b)})` },
        '-webkit-box-reflect': { e: '🪞', n: '거울 반사', f: [['d', '어느 쪽', 'sel', ['below', 'above', 'left', 'right']], ['o', '띄우기', 'len', ['px', -20, 60]], ['f', '멀수록 흐리게', 'bool']], d: () => ({ d: 'below', o: LN(4), f: true }), css: v => `${v.d} ${len(v.o)}${v.f ? ` linear-gradient(to ${({ below: 'bottom', above: 'top', left: 'left', right: 'right' })[v.d]}, transparent 40%, #00000066)` : ''}` },
        'font-feature-settings': { e: '🔣', n: '글꼴 세부 기능', f: [['m', '기능', 'sel', ['"liga" 0', '"smcp"', '"tnum"', '"frac"', '"ss01"', '"swsh"', '"salt"', 'normal']]], d: () => ({ m: '"smcp"' }), css: v => v.m },
        'font-variation-settings': { e: '🎚', n: '글꼴 굵기 바늘 (가변 글꼴)', f: [['w', '굵기 wght', 'num', [100, 900, 10]]], d: () => ({ w: 650 }), css: v => `"wght" ${v.w}` },
        'font-stretch': { e: '↔', n: '글자 폭', f: [['m', '폭', 'sel', ['condensed', 'normal', 'expanded', 'ultra-expanded']]], d: () => ({ m: 'expanded' }), css: v => v.m },
        'border-image-url': { p: 'border-image', e: '🖼', n: '테두리에 그림', f: [['src', '그림', 'img'], ['sl', '자르는 자리 (px)', 'num', [1, 200, 1]], ['w', '테두리 굵기', 'len', ['px', 1, 80]], ['rep', '채우기', 'sel', ['round', 'repeat', 'stretch', 'space']]], d: () => ({ src: '', sl: 30, w: LN(24), rep: 'round' }), css: v => v.src ? `url("${v.src}") ${v.sl} fill / ${len(v.w)} ${v.rep}` : 'none' },
        'mask-border': { e: '🎭', n: '테두리 모양으로 가리기', f: [['src', '그림 (투명한 곳이 가려져요)', 'img'], ['sl', '자르는 자리 (px)', 'num', [1, 200, 1]], ['rep', '채우기', 'sel', ['round', 'repeat', 'stretch', 'space']]], d: () => ({ src: '', sl: 30, rep: 'round' }), css: v => v.src ? `url("${v.src}") ${v.sl} ${v.rep}` : 'none' },
        'initial-letter': { e: '🅰', n: '첫 글자 크게 (줄 수)', f: [['n', '몇 줄 높이', 'num', [1, 6, 1]]], d: () => ({ n: 3 }), css: v => v.n },
        'svg-filter': { p: '--svg-filter', e: '🌀', n: 'SVG 필터 쓰기 (filter: url())', f: [['ref', 'SVG 레이어의 필터', 'sfx']], d: () => ({ ref: '' }), css: v => v.ref ? `url(#${String(v.ref).split(':').pop()}f)` : 'none' },
    };
    const GROUPS = [['🎨 바탕', ['background-color', 'linear-gradient', 'radial-gradient', 'conic-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient', 'repeating-conic-gradient', 'url', 'background-blend-mode', 'background-clip', 'background-origin', 'background-attachment', 'image-rendering', 'bg-mix']],
        ['🔷 모양 · 테두리', ['border-radius', 'border-radius-4', 'border-radius-e', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-image', 'outline', 'outline-offset', 'shadow', 'opacity', 'padding', 'overflow', 'aspect-ratio', 'margin', 'border-image-url', 'mask-border', '-webkit-box-reflect', 'outline-style', 'box-decoration-break', 'accent-color', 'caret-color']],
        ['✂️ 오리기 · 가리기', ['circle', 'ellipse', 'inset', 'polygon', 'path', 'm-linear-gradient', 'm-radial-gradient', 'm-conic-gradient', 'm-repeating-linear-gradient', 'm-repeating-radial-gradient', 'm-url', 'mask-composite', 'mask-mode', 'clip-path-box']],
        ['🔄 바꿔 놓기 · 3D', ['rotate', 'scale', 'scaleX', 'scaleY', 'skewX', 'skewY', 'translateX', 'translateY', 'rotateX', 'rotateY', 'rotateZ', 'translateZ', 'perspective()', 'perspective', 'transform-origin', 'transform-box', 'transform-style', 'backface-visibility']],
        ['🪄 필터', ['blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'sepia', 'hue-rotate', 'invert', 'f-opacity', 'drop-shadow', 'svg-filter']],
        ['🫧 뒤 필터 · 섞기', ['b-blur', 'b-brightness', 'b-saturate', 'b-grayscale', 'b-hue-rotate', 'b-invert', 'b-contrast', 'b-sepia', 'mix-blend-mode', 'isolation']],
        ['🔤 글자', ['color', 'font-size', 'font-weight', 'font-style', 'font-family', 'letter-spacing', 'word-spacing', 'line-height', 'text-align', '-webkit-text-stroke', 'paint-order', '-webkit-text-fill-color', 'tshadow', 'text-decoration', 'text-underline-offset', 'text-emphasis', 'writing-mode', 'text-orientation', 'color-mix', 'font-feature-settings', 'font-variation-settings', 'font-stretch', 'initial-letter', 'text-transform', 'font-variant', 'text-indent', 'word-break', 'white-space', 'hyphens', 'text-wrap', 'columns', 'column-gap', 'column-rule']],
        ['🌳 상자 놓기 (안에 든 상자 · 상자 나무)', ['display', 'flex-direction', 'justify-content', 'align-items', 'align-content', 'flex-wrap', 'gap', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'flex-grow', 'align-self', 'order']],
        ['✨ 자리 · 크기 (장식 · 안에 든 상자)', ['content', 'width', 'height', 'position', 'left', 'top', 'right', 'bottom', 'z-index']],
        ['🎬 애니메이션', ['animation', 'offset-path', 'offset-rotate']]];
    const DEF = k => FN[k] || SIMPLE[k], PROP = k => (SIMPLE[k] && SIMPLE[k].p) || k;
    const OFF = k => FN[k] ? (FN[k].o || (FN[k].g === 'box-shadow' ? 'box-shadow' : FN[k].g === 'text-shadow' ? 'text-shadow' : k + '()')) : PROP(k);
    const clone = o => JSON.parse(JSON.stringify(o));
    let seq = 1; const nid = () => Date.now().toString(36) + (seq++);
    function fresh(t) { const D = DEF(t); if (!D) return null; const o = { id: nid(), t, on: true, v: D.d() }; if (FN[t] && (FN[t].g === 'img' || FN[t].g === 'mask')) o.L = FN[t].L ? FN[t].L() : (FN[t].g === 'mask' ? { sz: 'auto', w: LN(40), h: LN(40), x: 0, y: 0, rep: 'no-repeat' } : LDEF()); return o; }
    const ok = c => !!c && !c.call && !!DEF(c.t);
    /* 길 : 'v.stops.s.0.c' 처럼 */
    const get = (o, path) => path.split('.').reduce((a, k) => a == null ? a : a[k], o);
    const set = (o, path, val) => { const ks = path.split('.'), last = ks.pop(), t = ks.reduce((a, k) => a[k], o); t[last] = val; };

    /* ---------- css 만들기 ---------- */
    const expand = cards => (cards || []).filter(c => c && c.on && DEF(c.t));
    function decls(cards, show) {                                             // [[속성, 값]] · 위 블록이 앞 (바탕 · 가리기 목록 앞) · 같은 속성 하나짜리는 위 블록이 이겨요
        const M = new Map(), lay = { 'background-image': [], 'mask-image': [] };
        expand(cards).forEach(c => {
            if (FN[c.t]) { const p = GOF(FN[c.t].g), L = LIST[p]; let v = FN[c.t].css(c.v, c); if (show && (c.t === 'url' || c.t === 'm-url')) v = c.v.src ? 'url(내-그림)' : 'none';
                if (lay[p]) lay[p].push(c.L || LDEF());
                if (L.one) { if (!M.has(p)) M.set(p, v); } else M.set(p, M.has(p) ? M.get(p) + L.sep + v : v); }
            else { const p = PROP(c.t); if (!M.has(p)) M.set(p, String(SIMPLE[c.t].css(c.v))); }
        });
        [['background-image', 'background'], ['mask-image', 'mask']].forEach(([k, pre]) => { const A = lay[k];
            if (A.length && (pre === 'mask' || A.some(L => L.sz !== 'auto' || +L.x || +L.y || L.rep !== 'repeat'))) {
                M.set(pre + '-size', A.map(L => L.sz === 'w h' ? `${len(L.w)} ${len(L.h)}` : L.sz).join(', '));
                M.set(pre + '-position', A.map(L => `${L.x}% ${L.y}%`).join(', '));
                M.set(pre + '-repeat', A.map(L => L.rep).join(', ')); } });
        if (M.get('background-clip') === 'text') M.set('-webkit-background-clip', 'text');
        if (M.has('mask-border')) M.set('-webkit-mask-box-image', M.get('mask-border')); if (M.has('initial-letter')) M.set('-webkit-initial-letter', M.get('initial-letter'));
        ['mask-image', 'mask-size', 'mask-position', 'mask-repeat', 'mask-composite', 'backdrop-filter', 'text-emphasis'].forEach(k => { if (M.has(k)) M.set('-webkit-' + k, k === 'mask-composite' ? ({ add: 'source-over', subtract: 'source-out', intersect: 'source-in', exclude: 'xor' })[M.get(k)] : M.get(k)); });
        return [...M];
    }
    function keyframes(cards) {                                               // 🎬 @keyframes (움직임 블록마다)
        return expand(cards).filter(c => c.t === 'animation').map(c => { const at = {};
            (c.v.kf || []).forEach(k => { const D = KP[k.p]; if (!D) return; const A = at[k.at] = at[k.at] || {}; const val = D[1](k.v); A[D[2]] = D[2] === 'transform' || D[2] === 'filter' ? ((A[D[2]] ? A[D[2]] + ' ' : '') + val) : val; if (k.e) A['animation-timing-function'] = k.e; });
            return `@keyframes cbk${c.id}{` + Object.keys(at).sort((a, b) => a - b).map(p => `${p}%{${Object.entries(at[p]).map(([k, v]) => `${k}:${v}`).join(';')}}`).join('') + '}'; }).join('');
    }
    const PART = [['blocks', ''], ['pb', '::before'], ['pa', '::after'], ['pfl', '::first-letter'], ['pfn', '::first-line']];
    /* 🌳 상자 나무 (11-19) : L = 맨 위 상자 (본체) · L.kids = [{ id, name, text, kids }] · 이름(class)마다 기능 L.cls[이름] = { blocks, pb, pa, pfl, pfn } (같은 이름 = 같은 기능) */
    const cname = n => String(n || '').replace(/[^\w가-힣-]/g, '') || '상자';
    const walk = (L, f) => { const go = A => (A || []).forEach(n => { f(n); go(n.kids); }); go(L.kids); };
    const partsOf = (L, n) => !n || n === 'root' ? L : ((L.cls = L.cls || {})[n.name] = L.cls[n.name] || { blocks: [], pb: [], pa: [], pfl: [], pfn: [] });
    const usedCls = L => { const u = new Set(); walk(L, n => u.add(n.name)); return [...u]; };
    function htmlOf(L) { const go = A => (A || []).map(n => `<div class="c-${cname(n.name)}">${xml(String(n.text || ''))}${go(n.kids)}</div>`).join(''); return xml(String(L.text || '')) + go(L.kids); }
    const PBASE = "content:'';position:absolute;left:0;top:0;width:100%;height:100%;box-sizing:border-box;";
    function rules(P0, sel, base) {                                          // 상자 하나 (그 이름) 의 규칙들
        let out = ''; PART.forEach(([k, ps]) => { const cards = P0[k] || []; if (ps && !expand(cards).length) return; const D = decls(cards);
            out += `${sel}${ps}{${ps ? (ps === '::before' || ps === '::after' ? PBASE : '') : base}${D.map(([a, b]) => `${a}:${b};`).join('')}}`; });
        return out + PART.map(([k]) => keyframes(P0[k])).join('');
    }
    const KBASE = 'box-sizing:border-box;position:relative;';
    function styleText(L, sel, w, h, extra) {                                // 진짜 css 글 (상자 나무 · ::before · ::after · 첫 글자 · 첫 줄 · @keyframes)
        let out = rules(L, sel, BASE + `width:${w}px;height:${h}px;` + (extra || ''));
        usedCls(L).forEach(nm => { out += rules(partsOf(L, { name: nm }), `${sel} .c-${cname(nm)}`, KBASE); });
        return out;
    }
    const hasAnim = L => PART.some(([k]) => expand(L[k]).some(c => c.t === 'animation'));
    const hasAnimAll = L => hasAnim(L) || usedCls(L).some(nm => hasAnim(partsOf(L, { name: nm })));
    const BASE = "box-sizing:border-box;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-wrap;overflow-wrap:anywhere;font-family:'Gowun Dodum',sans-serif;font-size:48px;line-height:1.2;color:#5b3f4a;";
    function cssText(L) {
        const one = (P0, nm) => { let out = ''; PART.forEach(([k, ps]) => { const cards = P0[k] || []; if (ps && !expand(cards).length) return; const d = decls(cards, true);
            out += `.${nm}${ps} {\n` + (ps === '::before' || ps === '::after' ? "  content: ''; position: absolute; inset: 0;\n" : '') + d.map(([a, b]) => `  ${a}: ${b};`).join('\n') + '\n}\n'; });
            const kf = PART.map(([k]) => keyframes(P0[k])).join(''); if (kf) out += kf.replace(/@keyframes/g, '\n@keyframes').replace(/}}/g, '}\n}').replace(/%{/g, '% { ').replace(/;/g, '; ') + '\n'; return out; };
        let out = one(L, '내-디자인'); usedCls(L).forEach(nm => { out += one(partsOf(L, { name: nm }), cname(nm)); });
        const tree = (A, d) => (A || []).map(n => `${'  '.repeat(d)}<div class="${cname(n.name)}">${n.text ? String(n.text).replace(/</g, '&lt;') : ''}${n.kids && n.kids.length ? '\n' + tree(n.kids, d + 1) + '\n' + '  '.repeat(d) : ''}</div>`).join('\n');
        const html = `<div class="내-디자인">${L.text ? String(L.text).replace(/</g, '&lt;') : ''}${(L.kids || []).length ? '\n' + tree(L.kids, 1) + '\n' : ''}</div>`;
        return `<!-- 👩‍💻 HTML -->\n${html}\n\n/* 🎨 CSS */\n${out}`;
    }

    /* ---------- 글꼴 (그 글자만 · 구글 글꼴 조각을 그림 안에 담아요) ---------- */
    const GCSS = new Map(), GBIN = new Map();
    const tmo = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('time')), ms))]);
    const inRange = (cp, ur) => ur.split(',').some(r => { r = r.trim().replace(/^U\+/i, ''); if (r.includes('?')) { const a = parseInt(r.replace(/\?/g, '0'), 16), b = parseInt(r.replace(/\?/g, 'F'), 16); return cp >= a && cp <= b; } const [a, b] = r.split('-'); return b ? cp >= parseInt(a, 16) && cp <= parseInt(b, 16) : cp === parseInt(a, 16); });
    async function faceCss(fam, text) {
        if (!fam || !text || !FONTS.includes(fam)) return '';
        try {
            if (!GCSS.has(fam)) GCSS.set(fam, tmo(fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam).replace(/%20/g, '+')}:wght@400;700&display=swap`).then(r => r.ok ? r.text() : fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam).replace(/%20/g, '+')}&display=swap`).then(q => q.text())), 5000).catch(() => ''));
            const css = await GCSS.get(fam); if (!css) return '';
            const cps = [...new Set([...text].map(ch => ch.codePointAt(0)))], out = [];
            for (const m of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
                const body = m[1], u = (body.match(/url\((['"]?)([^)'"]+)\1\)/) || [])[2], ur = (body.match(/unicode-range:\s*([^;]+);/) || [])[1];
                if (!u) continue; if (ur && !cps.some(cp => inRange(cp, ur))) continue;
                if (!GBIN.has(u)) GBIN.set(u, tmo(fetch(u).then(r => r.blob()).then(b => new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => ok(''); fr.readAsDataURL(b); })), 6000).catch(() => ''));
                const data = await GBIN.get(u); if (!data) continue;
                out.push('@font-face{' + body.replace(/src:[^;]+;/, `src:url(${data}) format('woff2');`) + '}');
            }
            return out.join('');
        } catch (e) { return ''; }
    }

    /* ---------- 그리기 : 브라우저 css → 그림 (상자 크기마다 한 번) ---------- */
    let onImg = null, onErr = null, pend = 0, tainted = false;
    const mkCv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
    const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const loadImg = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
    async function bake(L, key, w, h, extra) {
        const D = decls(L.blocks), M = Math.ceil(Math.max(w, h) * .5) + 80, SW = Math.ceil(w + M * 2), SH = Math.ceil(h + M * 2);
        let alltx = ''; walk(L, n => { alltx += n.text || ''; }); [L].concat(usedCls(L).map(nm => partsOf(L, { name: nm }))).forEach(P0 => { alltx += PART.map(([k]) => expand(P0[k]).filter(c => c.t === 'content').map(c => c.v.t).join('')).join(''); });
        const fam = ((D.find(([k]) => k === 'font-family') || [])[1] || "'Gowun Dodum'").replace(/'/g, ''), text = String(L.text || '') + alltx;
        const fonts = text.trim() ? await faceCss(fam, text) : '';
        const rule = styleText(L, '.cbx', w, h, `position:absolute;left:${M}px;top:${M}px;`) + '.cbx,.cbx *,.cbx::before,.cbx::after,.cbx *::before,.cbx *::after{animation-play-state:paused!important;animation-delay:0s!important}' + (extra || '');   // 🎬 구운 그림 = 첫 장면
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}" viewBox="0 0 ${SW} ${SH}"><foreignObject x="0" y="0" width="${SW}" height="${SH}"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${SW}px;height:${SH}px;margin:0;padding:0;"><style>${xml(fonts)} ${xml(rule)}</style><div class="cbx">${htmlOf(L)}</div></div></foreignObject></svg>`;
        const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        let im = await loadImg(src);
        if (/url\(|@font-face/.test(rule + fonts)) { await new Promise(r => setTimeout(r, 60)); im = await loadImg(src); }   // 사파리 : 안의 그림 · 글꼴이 두 번째에 확실히
        const c = mkCv(SW, SH), x = c.getContext('2d'); x.drawImage(im, 0, 0);
        try { x.getImageData(0, 0, 1, 1); } catch (e) { tainted = true; if (onErr) onErr('taint'); return null; }
        const sf = expand(L.blocks).find(q => q.t === 'svg-filter' && q.v.ref), fm = sf && CB.filterOf ? CB.filterOf(sf.v.ref) : null;   // 🌀 css → svg : 구운 상자에 svg 블록 레이어의 필터를 입혀요 (순수 svg 라 아이패드도 같아요 · 11-19)
        if (fm) { const s2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}"><defs>${fm.svg}</defs><image width="${SW}" height="${SH}" href="${c.toDataURL('image/png')}" filter="url(#${fm.id})"/></svg>`;
            try { const u2 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s2); let i2 = await loadImg(u2); await new Promise(r => setTimeout(r, 40)); i2 = await loadImg(u2); x.clearRect(0, 0, SW, SH); x.drawImage(i2, 0, 0); } catch (e) { console.warn('🌀 svg 필터 쓰기', e); } }
        return { key, c, M, w, h };
    }
    function queue(L, key, w, h) {
        if (L._cbWant === key) return; L._cbWant = key;
        if (L._cbT) return;
        pend++;
        L._cbT = setTimeout(async () => {
            let r = null; const k = L._cbWant;
            try { r = await bake(L, k, L._cbWw, L._cbWh); } catch (e) { console.warn('🧩 블록 그리기', e); }
            L._cbT = 0; pend--;
            if (r && r.key === L._cbWant) { L._cbr = r; if (onImg) onImg(); }
            else if (L._cbWant !== k) { const kk = L._cbWant; L._cbWant = null; queue(L, kk, L._cbWw, L._cbWh); }
        }, 30);
    }
    function paint(out, W, H, L) {
        const ox = out.getContext('2d'); ox.clearRect(0, 0, W, H);
        const bx = L.box || { x: .15, y: .15, w: .7, h: .7 }, a = bx.x * W, b = bx.y * H, w = Math.max(2, Math.round(bx.w * W)), h = Math.max(2, Math.round(bx.h * H));
        const sf = expand(L.blocks).find(q => q.t === 'svg-filter' && q.v.ref), key = w + 'x' + h + '|' + (L.text || '') + '|' + JSON.stringify([L.blocks || [], L.pb || [], L.pa || [], L.pfl || [], L.pfn || [], L.kids || [], L.cls || {}]) + (sf && CB.filterOf ? '|' + ((CB.filterOf(sf.v.ref) || {}).svg || '') : ''), r = L._cbr;
        if (r) { if (r.key === key) ox.drawImage(r.c, a - r.M, b - r.M); else { const kx = w / r.w, ky = h / r.h; ox.drawImage(r.c, a - r.M * kx, b - r.M * ky, r.c.width * kx, r.c.height * ky); } }
        if (!r || r.key !== key) { L._cbWw = w; L._cbWh = h; queue(L, key, w, h); }
    }
    async function settle(ms = 8000) { const t0 = Date.now(); while (pend > 0 && Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 40)); }

    const bakeWith = (L, w, h, extra) => bake(L, 'x', w, h, extra);   // 🎬 안에 든 상자 움직임 저장용 (그 상자만 · 그 상자 빼고 · padpaint cssSvg · 1324)
    window.CB = { filterOf: null, bakeWith, cname, walk, partsOf, usedCls, htmlOf, hasAnimAll, PART, faceCss, FN, SIMPLE, GROUPS, LAYER, KO, FONTS, KP, DEF, OFF, PROP, fresh, ok, get, set, clone, decls, cssText, styleText, hasAnim, keyframes, paint, settle, expand,
        get busy() { return pend; }, get tainted() { return tainted; },
        set onImg(f) { onImg = f; }, set onErr(f) { onErr = f; } };
})();
