/* 말랑달콤 다이어리 - js/cssblocks.js
   🧩 블록 레이어 엔진 (도련 11-18 · 시안 13 그대로) : 블록 하나 = css 공식 기능 하나 · 쌓아서 꾸며요
   - AI 가 미리 조합한 블록(줄무늬 · 땡땡이 · 하트 오리기 ...)은 없어요 · 움직임(애니메이션) · 수학(calc · var) · 내 블록 만들기 없음 (도련 11-18)
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
    const KO = { solid: '실선', dashed: '점선', dotted: '땡땡', double: '이중', groove: '홈', ridge: '솟음', inset: '안쪽', outset: '바깥', circle: '원', ellipse: '타원', 'farthest-corner': '먼 모서리까지', 'closest-side': '가까운 변까지', 'closest-corner': '가까운 모서리까지', 'farthest-side': '먼 변까지',
        auto: '원래대로', cover: '꽉 채우기', contain: '다 보이게', 'w h': '직접 정하기', repeat: '반복', 'no-repeat': '한 번만', 'repeat-x': '가로로만', 'repeat-y': '세로로만', space: '띄워서 반복', round: '맞춰서 반복',
        normal: '보통', multiply: '곱하기', screen: '스크린', overlay: '오버레이', darken: '어둡게', lighten: '밝게', 'color-dodge': '닷지', 'color-burn': '번', difference: '차이', exclusion: '제외', hue: '색상', saturation: '채도', color: '색', luminosity: '밝기',
        'border-box': '테두리까지', 'padding-box': '테두리 안쪽', 'content-box': '내용만', text: '글자 안에만', left: '왼쪽', center: '가운데', right: '오른쪽', justify: '양쪽',
        '400': '보통', '700': '굵게', '900': '아주 굵게', Jua: '주아', 'Gowun Dodum': '고운돋움', Gaegu: '개구', 'Nanum Pen Script': '나눔손글씨 펜', 'Do Hyeon': '도현', 'Hi Melody': '하이멜로디', 'Poor Story': '푸어스토리', 'Single Day': '싱글데이', 'Gamja Flower': '감자꽃', 'Yeon Sung': '연성',
        'Black Han Sans': '검은고딕', Dongle: '동글', 'Cute Font': '귀여운', 'Nanum Myeongjo': '나눔명조', Sunflower: '해바라기', Stylish: '스타일리시', 'Song Myung': '송명', Gugi: '구기' };
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
        tshadow: { g: 'text-shadow', e: '💬', n: '글자 그림자', f: [['x', '옆으로', 'len', ['px', -20, 20]], ['y', '아래로', 'len', ['px', -20, 20]], ['b', '번짐', 'len', ['px', 0, 20]], ['c', '색', 'col']], d: () => ({ x: LN(3), y: LN(3), b: LN(0), c: CO('#3d3552') }), css: v => `${len(v.x)} ${len(v.y)} ${len(v.b)} ${col(v.c)}` }
    };
    const LIST = { 'background-image': { g: 'img', sep: ', ' }, 'box-shadow': { g: 'box-shadow', sep: ', ' }, 'text-shadow': { g: 'text-shadow', sep: ', ' }, filter: { g: 'filter', sep: ' ' }, transform: { g: 'transform', sep: ' ' }, 'clip-path': { g: 'clip', one: 1 } };
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
        '-webkit-text-stroke': { e: '✒️', n: '글자 테두리', f: [['w', '굵기', 'len', ['px', 0, 12]], ['c', '색', 'col']], d: () => ({ w: LN(2), c: CO('#ffffff') }), css: v => `${len(v.w)} ${col(v.c)}` }
    };
    const GROUPS = [['🎨 바탕', ['background-color', 'linear-gradient', 'radial-gradient', 'conic-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient', 'repeating-conic-gradient', 'url', 'background-blend-mode', 'background-clip']],
        ['🔷 모양', ['border-radius', 'border', 'outline', 'outline-offset', 'shadow', 'opacity']], ['✂️ 오리기', ['circle', 'ellipse', 'inset', 'polygon']],
        ['🔄 바꿔 놓기', ['rotate', 'scale', 'scaleX', 'scaleY', 'skewX', 'skewY', 'translateX', 'translateY']],
        ['🪄 필터', ['blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'sepia', 'hue-rotate', 'invert', 'f-opacity', 'drop-shadow']],
        ['🔤 글자', ['color', 'font-size', 'font-weight', 'font-family', 'letter-spacing', 'line-height', 'text-align', '-webkit-text-stroke', 'tshadow']]];
    const DEF = k => FN[k] || SIMPLE[k];
    const OFF = k => FN[k] ? (FN[k].o || (FN[k].g === 'box-shadow' ? 'box-shadow' : FN[k].g === 'text-shadow' ? 'text-shadow' : k + '()')) : k;
    const clone = o => JSON.parse(JSON.stringify(o));
    let seq = 1; const nid = () => Date.now().toString(36) + (seq++);
    function fresh(t) { const D = DEF(t); if (!D) return null; const o = { id: nid(), t, on: true, v: D.d() }; if (FN[t] && FN[t].g === 'img') o.L = FN[t].L ? FN[t].L() : LDEF(); return o; }
    const ok = c => !!c && !c.call && !!DEF(c.t);
    /* 길 : 'v.stops.s.0.c' 처럼 */
    const get = (o, path) => path.split('.').reduce((a, k) => a == null ? a : a[k], o);
    const set = (o, path, val) => { const ks = path.split('.'), last = ks.pop(), t = ks.reduce((a, k) => a[k], o); t[last] = val; };

    /* ---------- css 만들기 ---------- */
    const expand = cards => (cards || []).filter(c => c && c.on && DEF(c.t));
    function decls(cards, show) {                                             // [[속성, 값]] · 위 블록이 앞 (바탕 목록 앞) · 같은 속성 하나짜리는 위 블록이 이겨요
        const M = new Map(), lay = [];
        expand(cards).forEach(c => {
            if (FN[c.t]) { const p = GOF(FN[c.t].g), L = LIST[p]; let v = FN[c.t].css(c.v); if (show && c.t === 'url') v = c.v.src ? 'url(내-그림)' : 'none';
                if (p === 'background-image') lay.push(c.L || LDEF());
                if (L.one) { if (!M.has(p)) M.set(p, v); } else M.set(p, M.has(p) ? M.get(p) + L.sep + v : v); }
            else if (!M.has(c.t)) M.set(c.t, String(SIMPLE[c.t].css(c.v)));
        });
        if (lay.length && lay.some(L => L.sz !== 'auto' || +L.x || +L.y || L.rep !== 'repeat')) {
            M.set('background-size', lay.map(L => L.sz === 'w h' ? `${len(L.w)} ${len(L.h)}` : L.sz).join(', '));
            M.set('background-position', lay.map(L => `${L.x}% ${L.y}%`).join(', '));
            M.set('background-repeat', lay.map(L => L.rep).join(', '));
        }
        if (M.get('background-clip') === 'text') M.set('-webkit-background-clip', 'text');
        return [...M];
    }
    const BASE = "box-sizing:border-box;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-wrap;overflow-wrap:anywhere;font-family:'Gowun Dodum',sans-serif;font-size:48px;line-height:1.2;color:#5b3f4a;";
    function cssText(L) { const d = decls(L.blocks, true); return '.내-디자인 {\n' + d.map(([k, v]) => `  ${k}: ${v};`).join('\n') + '\n}' + (L.text ? `\n/* 상자 안 글자 : ${String(L.text).replace(/\*\//g, '')} */` : ''); }

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
    async function bake(L, key, w, h) {
        const D = decls(L.blocks), M = Math.ceil(Math.max(w, h) * .5) + 80, SW = Math.ceil(w + M * 2), SH = Math.ceil(h + M * 2);
        const fam = ((D.find(([k]) => k === 'font-family') || [])[1] || "'Gowun Dodum'").replace(/'/g, ''), text = String(L.text || '');
        const fonts = text.trim() ? await faceCss(fam, text) : '';
        const rule = BASE + `width:${w}px;height:${h}px;` + D.map(([k, v]) => `${k}:${v};`).join('');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}" viewBox="0 0 ${SW} ${SH}"><foreignObject x="0" y="0" width="${SW}" height="${SH}"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${SW}px;height:${SH}px;margin:0;padding:0;"><style>${xml(fonts)} .cbx{position:absolute;left:${M}px;top:${M}px;${xml(rule)}}</style><div class="cbx">${xml(text)}</div></div></foreignObject></svg>`;
        const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        let im = await loadImg(src);
        if (/url\(|@font-face/.test(rule + fonts)) { await new Promise(r => setTimeout(r, 60)); im = await loadImg(src); }   // 사파리 : 안의 그림 · 글꼴이 두 번째에 확실히
        const c = mkCv(SW, SH), x = c.getContext('2d'); x.drawImage(im, 0, 0);
        try { x.getImageData(0, 0, 1, 1); } catch (e) { tainted = true; if (onErr) onErr('taint'); return null; }
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
        const key = w + 'x' + h + '|' + (L.text || '') + '|' + JSON.stringify(L.blocks || []), r = L._cbr;
        if (r) { if (r.key === key) ox.drawImage(r.c, a - r.M, b - r.M); else { const kx = w / r.w, ky = h / r.h; ox.drawImage(r.c, a - r.M * kx, b - r.M * ky, r.c.width * kx, r.c.height * ky); } }
        if (!r || r.key !== key) { L._cbWw = w; L._cbWh = h; queue(L, key, w, h); }
    }
    async function settle(ms = 8000) { const t0 = Date.now(); while (pend > 0 && Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 40)); }

    window.CB = { FN, SIMPLE, GROUPS, LAYER, KO, FONTS, DEF, OFF, fresh, ok, get, set, clone, decls, cssText, paint, settle, expand,
        get busy() { return pend; }, get tainted() { return tainted; },
        set onImg(f) { onImg = f; }, set onErr(f) { onErr = f; } };
})();
