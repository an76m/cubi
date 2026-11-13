/* 말랑달콤 다이어리 - js/maker.js · MK v3 (도련 11-05)
   🧵 만들기 엔진 하나 = 앱 다꾸 작업실 · 🛠 상품공방이 똑같이 써요 (상품공방에는 이 파일을 통째로 넣어 둬요 · 버전 MK.v 가 같아야 해요)
   - 개발자가 상품공방에서 만드는 것 = 다꾸러가 앱에서 만드는 것 (기능 · 고를 거리 · 저장 모양이 같아요)
   - 무늬 (PATS) : 한 줄 = 한 무늬 · 새 무늬 = 여기 한 줄 → 배경지 · 벽지 · 마스킹테이프 · 떡메 · 메모지 · 속지 바탕에 저절로
   - 레시피 (다시 열어 고칠 수 있는 설정값) → 그림(svg) : tileSvg(배경지 · 벽지) · tapeSvg(마스킹테이프) · paperSvg(떡메 · 메모지 · 속지) · deskSvg(책상판)
       무늬 겹 L = [{ p 무늬, c 색, s 칸 크기 px, w 굵기·크기 %, r 기울기 °, o 진하기 }] (두 겹까지) · 그림 겹 im = { src, s 크기 px, m 'grid' 바둑판 | 'brick' 엇갈림 }
   - 값 표 : SPECS 다이어리 규격 · BINDS 묶는 방식 · LEAFS 내지 종류 · COLORS 고를 색 → 상품공방 · 앱이 같은 표를 써요
   - 👀 보기 그림 : leafSvg(내지) · diarySvg(다이어리 4색 · 묶음 · 내지) · specSvg(규격 실제 비율) · roomSvg(벽지 · 책상판을 방 한 장에) → 상품공방이 눈으로 고르고 · 앱 책상도 roomSvg
   - form(host, kind, rec, onChange) = 만들기 칸 (색 · 무늬 · 크기 …) · draw(host, opt) = ✏️ 그리기 판 · 상품공방 · 앱 모두 이 칸 그대로
   ※ 다른 파일 없이 혼자 동작해요 (상품공방은 앱 파일 없이 열려요) */
(function () {
    const MK = { v: 3 };
    const NS = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
    const hex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
    const num = (v, a, b, d) => { const n = parseFloat(v); return isNaN(n) ? d : Math.max(a, Math.min(b, Math.round(n * 100) / 100)); };
    const esc = htmlEsc;   // 🧰 js/util.js
    const img = v => typeof v === 'string' && /^(data:image\/(png|jpeg|webp|svg\+xml)[;,]|https?:\/\/|\/|[\w.-]+\/)/.test(v) && !/["<>]/.test(v) ? v : '';

    /* ---------- 값 표 (상품공방 · 앱 같이) ---------- */
    MK.SPECS = [['A7', 74, 105], ['A6', 105, 148], ['B6', 128, 182], ['A5', 148, 210], ['B5', 182, 257], ['미니6공', 80, 126], ['바이블', 95, 171], ['슬림', 110, 210], ['라지', 130, 210], ['한달', 85, 165], ['패스포트', 89, 124]];
    MK.BINDS = [['ring', '링'], ['thin', '실 제본'], ['tn', '고무 밴드'], ['spread', '책갈피 끈'], ['hard', '하드커버']];
    MK.LEAFS = [['plain', '무지'], ['line', '줄노트'], ['grid', '모눈'], ['dot', '도트'], ['gingham', '깅엄'], ['kraft', '크라프트']];   // 내지 = 페이지 그리는 법 (css .lf-종류)
    MK.COLORS = ['#ff9dbb', '#ffb3c7', '#f4a582', '#ffd479', '#8fd0b7', '#9fd3ea', '#c4b2f2', '#d9c2a6', '#a3714f', '#5a4652', '#ffffff', '#fff6cf', '#fff0f5', '#eefaf4', '#eef5ff', '#f6f0ff', '#e9d5b3', '#333333'];
    MK.spec = n => { const s = MK.SPECS.find(x => x[0] === n); return s ? { n: s[0], mm: `${s[1]}×${s[2]}`, r: Math.round(s[2] / s[1] * 1e6) / 1e6 } : null; };

    /* ---------- 색 ---------- */
    const mix = (a, b, p) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - p) + parseInt(b.substr(i, 2), 16) * p).toString(16).padStart(2, '0')).join('');
    MK.mix = mix;
    /* 📔 다이어리 4색 : 표지 색 하나 → 표지 · 테두리 · 강조 · 속지 (다꾸러가 하나씩 바꿀 수도 있어요) */
    MK.dyAuto = c => { c = hex(c) ? c.toLowerCase() : '#ff9dbb'; return { 표지색: `linear-gradient(135deg, ${c} 0%, ${mix(c, '#ffffff', .55)} 99%)`, 테두리색: mix(c, '#ffffff', .3), 강조색: mix(c, '#000000', .18), 속지색: mix(c, '#ffffff', .9) }; };

    /* ---------- 무늬 (한 줄 = 한 무늬 · s = 칸 크기 · k = 굵기·크기 배율) ---------- */
    MK.PATS = [
        ['dot', '물방울', (c, s, k) => `<circle cx="${s * .28}" cy="${s * .28}" r="${s * .17 * k}" fill="${c}"/><circle cx="${s * .78}" cy="${s * .78}" r="${s * .17 * k}" fill="${c}"/>`],
        ['pdot', '작은 점', (c, s, k) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * .1 * k}" fill="${c}"/>`],
        ['stripe', '줄무늬', (c, s, k) => `<rect width="${s * .5 * k}" height="${s}" fill="${c}"/>`],
        ['hstripe', '가로 줄', (c, s, k) => `<rect width="${s}" height="${s * .5 * k}" fill="${c}"/>`],
        ['diag', '사선', (c, s, k) => `<path d="M${-s / 4} ${s / 4} L${s / 4} ${-s / 4} M0 ${s} L${s} 0 M${s * .75} ${s * 1.25} L${s * 1.25} ${s * .75}" stroke="${c}" stroke-width="${s * .28 * k}"/>`],
        ['check', '깅엄', (c, s, k) => `<rect width="${s * .5 * k}" height="${s}" fill="${c}" opacity=".5"/><rect width="${s}" height="${s * .5 * k}" fill="${c}" opacity=".5"/>`],
        ['grid', '격자', (c, s, k) => `<path d="M${s} 0 V${s} M0 ${s} H${s}" stroke="${c}" stroke-width="${Math.max(.8, s / 14) * k}"/>`],
        ['heart', '하트', (c, s, k) => `<path transform="translate(${s / 2} ${s / 2}) scale(${s / 24 * k}) translate(-10 -10.5)" d="M10 17 C2 11 3 4 7 4 C9 4 10 6 10 7 C10 6 11 4 13 4 C17 4 18 11 10 17Z" fill="${c}"/>`],
        ['star', '별', (c, s, k) => `<path transform="translate(${s / 2} ${s / 2}) scale(${s / 20 * k}) translate(-8 -7.5)" d="M8 1 l2 4.4 4.8.5 -3.6 3.2 1 4.7 -4.2 -2.4 -4.2 2.4 1 -4.7 -3.6 -3.2 4.8 -.5z" fill="${c}"/>`],
        ['flower', '꽃', (c, s, k) => { const h = s / 2; return `<g transform="translate(${h} ${h}) scale(${k}) translate(${-h} ${-h})"><g fill="${c}">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${h}" cy="${h * .55}" rx="${s * .11}" ry="${s * .19}" transform="rotate(${a} ${h} ${h})"/>`).join('')}</g><circle cx="${h}" cy="${h}" r="${s * .1}" fill="#fff"/></g>`; }],
        ['wave', '물결', (c, s, k) => { const h = s / 2; return `<path d="M0 ${h} q${s / 4} ${-s / 4} ${h} 0 t${h} 0" stroke="${c}" stroke-width="${Math.max(1.2, s / 10) * k}" fill="none"/>`; }],
        ['scallop', '스캘럽', (c, s, k) => { const h = s / 2; return `<path d="M0 ${h} a${h / 2} ${h / 2} 0 0 0 ${h} 0 a${h / 2} ${h / 2} 0 0 0 ${h} 0" stroke="${c}" stroke-width="${Math.max(1.2, s / 12) * k}" fill="none"/>`; }],
        ['stitch', '바느질 선', (c, s, k) => `<path d="M0 ${s * .3} H${s * .6} M0 ${s * .8} H${s * .6}" stroke="${c}" stroke-width="${Math.max(1, s / 14) * k}" stroke-linecap="round"/>`],
        ['cloud', '구름', (c, s, k) => `<path transform="translate(${s / 2} ${s / 2}) scale(${s / 26 * k}) translate(-12 -8)" d="M6 14 a4 4 0 0 1 0-8 a5 5 0 0 1 9-2 a4 4 0 0 1 5 4 a3 3 0 0 1 -1 6z" fill="${c}"/>`],
        ['cherry', '체리', (c, s, k) => `<g transform="translate(${s / 2} ${s / 2}) scale(${s / 26 * k}) translate(-12 -12)"><path d="M12 3 Q11 9 7 14 M12 3 Q14 9 17 14" stroke="#6aa86b" stroke-width="1.4" fill="none"/><circle cx="7" cy="16" r="4" fill="${c}"/><circle cx="17" cy="16" r="4" fill="${c}"/></g>`]
    ];
    const pat = id => MK.PATS.find(p => p[0] === id);

    /* ---------- 레시피 확인 (정해진 모양만 통과) ---------- */
    const cleanL = L => (Array.isArray(L) ? L : []).slice(0, 2).map(l => l && pat(l.p) ? { p: l.p, c: hex(l.c) ? l.c : '#f9cfdd', s: num(l.s, 6, 240, 40), w: num(l.w, 20, 300, 100), r: num(l.r, 0, 180, 0), o: num(l.o, .1, 1, 1) } : null).filter(Boolean);
    const cleanIm = m => m && img(m.src) ? { src: m.src, s: num(m.s, 8, 600, 80), g: num(m.g, 0, 200, 0), o: num(m.o, .1, 1, 1), m: m.m === 'brick' ? 'brick' : 'grid' } : null;
    MK.clean = (kind, r) => {
        r = r && typeof r === 'object' ? r : {};
        const base = { bg: hex(r.bg) ? r.bg : (kind === 'paper' ? '#ffffff' : '#fff6f9'), L: cleanL(r.L) };
        const im = cleanIm(r.im); if (im) base.im = im;
        if (kind === 'paper') Object.assign(base, { g: ['plain', 'line', 'grid', 'dot'].includes(r.g) ? r.g : 'plain', lc: hex(r.lc) ? r.lc : '#f6d5df', gap: num(r.gap, 8, 60, 26), top: num(r.top, 0, 200, 0), rad: num(r.rad, 0, 40, 0), bd: !!r.bd, bw: num(r.bw, 1, 14, 3), bc: hex(r.bc) ? r.bc : '#ff9dbb', head: String(r.head || '').replace(/[<>]/g, '').slice(0, 20), glue: hex(r.glue) ? r.glue : '' });
        if (kind === 'tape') Object.assign(base, { text: String(r.text || '').replace(/[<>]/g, '').slice(0, 24), tc: hex(r.tc) ? r.tc : '#ffffff' });
        if (kind === 'desk') return { c: hex(r.c) ? r.c : '#f0d2ab', grain: r.grain !== false };
        return base;
    };

    /* ---------- 그리기 ---------- */
    function defsOf(r, id) {                                                     // 무늬 겹 · 그림 겹 → <pattern>
        let d = '', fill = '';
        r.L.forEach((l, i) => {
            const k = l.w / 100, s = l.s, off = i ? ` x="${s / 2}" y="${s / 2}"` : '';
            d += `<pattern id="${id}${i}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"${off}${l.r ? ` patternTransform="rotate(${l.r})"` : ''}><g opacity="${l.o}">${pat(l.p)[2](l.c, s, k)}</g></pattern>`;
            fill += `<rect width="100%" height="100%" fill="url(#${id}${i})"/>`;
        });
        if (r.im) {
            const s = r.im.s, g = r.im.g, P = s + g, b = r.im.m === 'brick', u = esc(r.im.src), at = (x, y) => `<image href="${u}" xlink:href="${u}" x="${x}" y="${y}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid meet"/>`;
            d += `<pattern id="${id}m" width="${P}" height="${b ? P * 2 : P}" patternUnits="userSpaceOnUse"><g opacity="${r.im.o}">${at(g / 2, g / 2)}${b ? at(g / 2 + P / 2, g / 2 + P) + at(g / 2 - P / 2, g / 2 + P) : ''}</g></pattern>`;
            fill = `<rect width="100%" height="100%" fill="url(#${id}m)"/>` + fill;
        }
        return { d, fill };
    }
    /* 🌈 배경지 · 🧱 벽지 : W · H 없으면 = 크기 없는 그림 (css 배경으로 깔면 어디든 끊김 없이 · 기울여도) */
    MK.tileSvg = (r, W, H) => {
        r = MK.clean('tile', r); const { d, fill } = defsOf(r, 'k');
        const sz = W ? ` width="${W}" height="${H || W}" viewBox="0 0 ${W} ${H || W}"` : ' width="100%" height="100%"';
        return `<svg ${NS}${sz} preserveAspectRatio="none"><defs>${d}</defs><rect width="100%" height="100%" fill="${r.bg}"/>${fill}</svg>`;
    };
    /* 🎀 마스킹테이프 한 칸 (W × H · 이어 붙여 써요) */
    MK.tapeSvg = (r, W, H) => {
        r = MK.clean('tape', r); W = W || 120; H = H || 30; const { d, fill } = defsOf(r, 't');
        const tx = r.text ? `<text x="${W / 2}" y="${H / 2}" dominant-baseline="central" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${H * .42}" fill="${r.tc}">${esc(r.text)}</text>` : '';
        return `<svg ${NS} width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${d}</defs><rect width="${W}" height="${H}" fill="${r.bg}"/>${fill}${tx}</svg>`;
    };
    /* 🧻 떡메 · 📝 메모지 · 📃 속지 : 종이 + 무늬 바탕 + 줄 + 테두리 + 머리글 + 풀칠 띠 */
    MK.paperSvg = (r, W, H) => {
        r = MK.clean('paper', r); const { d, fill } = defsOf(r, 'p'), g = r.gap, t = r.top + (r.glue ? H * .06 : 0); let lines = '';
        if (r.g === 'line') for (let y = t + g; y < H - 6; y += g) lines += `<path d="M12 ${y} H${W - 12}" stroke="${r.lc}" stroke-width="1.2"/>`;
        if (r.g === 'grid') { for (let y = t; y <= H; y += g) lines += `<path d="M0 ${y} H${W}" stroke="${r.lc}" stroke-width="1"/>`; for (let x = 0; x <= W; x += g) lines += `<path d="M${x} ${t} V${H}" stroke="${r.lc}" stroke-width="1"/>`; }
        if (r.g === 'dot') for (let y = t + g / 2; y < H; y += g) for (let x = g / 2; x < W; x += g) lines += `<circle cx="${x}" cy="${y}" r="1.6" fill="${r.lc}"/>`;
        const bw = r.bd ? r.bw : 0;
        return `<svg ${NS} width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${d}<clipPath id="pk"><rect x="${bw / 2}" y="${bw / 2}" width="${W - bw}" height="${H - bw}" rx="${r.rad}"/></clipPath></defs><g clip-path="url(#pk)"><rect width="${W}" height="${H}" fill="${r.bg}"/>${fill}${lines}`
            + (r.glue ? `<rect width="${W}" height="${H * .06}" fill="${r.glue}"/>` : '')
            + (r.head ? `<text x="${W / 2}" y="${(r.glue ? H * .06 : 0) + Math.max(18, r.top * .55)}" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="${Math.max(14, W * .06)}" fill="${r.lc}">${esc(r.head)}</text>` : '')
            + `</g>${bw ? `<rect x="${bw / 2}" y="${bw / 2}" width="${W - bw}" height="${H - bw}" rx="${r.rad}" fill="none" stroke="${r.bc}" stroke-width="${bw}"/>` : ''}</svg>`;
    };
    /* 🪵 책상판 (색 하나 → 윗면 · 그늘 · 앞 3단 · 나뭇결) */
    MK.deskShades = c => [c, mix(c, '#000000', .1), mix(c, '#ffffff', .55), mix(c, '#000000', .08), mix(c, '#000000', .2), mix(c, '#000000', .06)];
    MK.deskSvg = r => { r = MK.clean('desk', r); const t = MK.deskShades(r.c); return `<svg ${NS} width="240" height="22" viewBox="0 0 240 22"><rect width="240" height="22" fill="${t[0]}"/>${r.grain ? `<path d="M0 7 Q60 4 120 8 T240 6 M0 17 Q80 14 150 18 T240 16" fill="none" stroke="${t[5]}" stroke-width="1.2"/>` : ''}</svg>`; };
    MK.url = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    MK.css = r => { r = MK.clean('tile', r); return { backgroundColor: r.bg, backgroundImage: `url("${MK.url(MK.tileSvg(r))}")`, backgroundSize: '100% 100%' }; };   // 크기 없는 그림 = 칸 크기 그대로 이어져요
    /* svg → png (캔버스 · 그림 겹이 있어도) */
    MK.png = (svg, W, H) => new Promise((ok, no) => { const i = new Image(); i.onload = () => { try { const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(i, 0, 0, W, H); ok(c.toDataURL('image/png')); } catch (e) { no(e); } }; i.onerror = no; i.src = MK.url(svg); });

    /* ---------- 👀 보기 그림 (도련 11-05 · 상품공방에서 눈으로 고르기 · 앱과 같은 모습) ---------- */
    const hx1 = (v, d) => (String(v || '').match(/#[0-9a-f]{6}/ig) || [d]);
    const uid = () => 'v' + Math.random().toString(36).slice(2, 8);
    /* 📃 내지 : 앱 css .lf-종류 와 같은 모습 (u = 쪽 폭의 1% · chip = 고르는 칸처럼 무늬를 크게) · cols = 다이어리 4색 */
    MK.leafSvg = (lf, W, H, cols, chip) => {
        cols = cols || {}; const bd = hx1(cols.테두리색, '#f6c9d6')[0], ac = hx1(cols.강조색, '#c8457a')[0], pg = hx1(cols.속지색, '#fffaf2')[0];
        const u = W / 100 * (chip ? 1.9 : 1), k = uid(), P = (w, h, b, y) => `<pattern id="${k}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${y ? ` y="${y}"` : ''}>${b}</pattern>`;
        let bg = pg, d = '';
        if (lf === 'line') { const g = 7 * u; d = P(W, g, `<rect y="${g - 1}" width="${W}" height="1" fill="${bd}" opacity=".45"/>`, 2 * u); }
        else if (lf === 'grid') { const g = 5 * u, c = mix(ac, '#ffffff', .83); bg = '#fffefc'; d = P(g, g, `<path d="M0 .5 H${g} M.5 0 V${g}" stroke="${c}"/>`); }
        else if (lf === 'dot') { const g = 4.6 * u, c = mix(ac, '#ffffff', .62); bg = '#fffdfb'; d = P(g, g, `<circle cx="${g / 2}" cy="${g / 2}" r="${.45 * u}" fill="${c}"/>`); }
        else if (lf === 'gingham') { const g = 7.4 * u; bg = '#ffffff'; d = P(g, g, `<rect width="${g / 2}" height="${g}" fill="${ac}" opacity=".16"/><rect width="${g}" height="${g / 2}" fill="${ac}" opacity=".16"/>`); }
        else if (lf === 'kraft') { bg = '#e2cba6'; d = `<filter id="${k}n"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3"/><feColorMatrix values="0 0 0 0 .42 0 0 0 0 .3 0 0 0 0 .18 0 0 0 .22 0"/></filter>`; }
        const top = lf === 'kraft' ? `<rect width="${W}" height="${H}" filter="url(#${k}n)"/>` : d ? `<rect width="${W}" height="${H}" fill="url(#${k})"/>` : '';
        return `<svg ${NS} width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${d}</defs><rect width="${W}" height="${H}" fill="${bg}"/>${top}</svg>`;
    };
    /* 📔 다이어리 : 덮은 표지 + 펼친 두 쪽 (o = { r 세로÷가로 · b 묶음 · lf 내지 · 표지색 · 테두리색 · 강조색 · 속지색 · H 높이 }) */
    MK.diarySvg = o => {
        o = o || {}; const H = o.H || 150, r = +o.r > .3 ? +o.r : 1.41, w = Math.round(H / r), k = uid();
        const cv = hx1(o.표지색, '#ffc6d6'), c0 = cv[0], c1 = cv[1] || mix(c0, '#ffffff', .5), bd = hx1(o.테두리색, '#f6c9d6')[0], ac = hx1(o.강조색, '#c8457a')[0], b = o.b, band = '#e7768f';
        const leaf = MK.url(MK.leafSvg(o.lf || 'plain', w, H, o));
        /* 표지 (x 0) */
        let cov = `<rect x="2" y="2" width="${w}" height="${H}" rx="6" fill="url(#${k}c)" stroke="${bd}" stroke-width="2.5"/>`;
        if (b === 'ring') for (let y = 14; y < H - 8; y += 12) cov += `<ellipse cx="7" cy="${y + 2}" rx="4" ry="2.4" fill="#fff" stroke="#c9b6bd"/>`;
        if (b === 'hard') cov += `<rect x="2" y="2" width="9" height="${H}" rx="4" fill="#000" opacity=".16"/>`;
        if (b === 'thin') cov += `<path d="M7 8 V${H - 4}" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 3"/>`;
        if (b === 'tn') cov += `<rect x="${w * .78}" y="0" width="4" height="${H + 4}" rx="2" fill="${band}"/>`;
        if (b === 'spread') cov += `<rect x="${w * .55}" y="${H - 6}" width="4" height="14" rx="1.5" fill="${band}"/>`;
        cov += `<rect x="${w * .25}" y="${H * .3}" width="${w * .5}" height="${H * .16}" rx="4" fill="#fff" opacity=".75"/><rect x="${w * .32}" y="${H * .36}" width="${w * .36}" height="3" rx="1.5" fill="${ac}"/>`;
        /* 펼친 두 쪽 (x0 = 표지 오른쪽 + 사이) */
        const x0 = w + 22, F = 5, sw = w * 2 + F * 2;
        let sp = `<rect x="${x0}" y="2" width="${sw}" height="${H}" rx="6" fill="url(#${k}b)"/>`
            + `<image href="${leaf}" x="${x0 + F}" y="${2 + F}" width="${w}" height="${H - F * 2}" preserveAspectRatio="none"/><image href="${leaf}" x="${x0 + F + w}" y="${2 + F}" width="${w}" height="${H - F * 2}" preserveAspectRatio="none"/>`
            + `<rect x="${x0 + F + w - 10}" y="${2 + F}" width="20" height="${H - F * 2}" fill="url(#${k}s)"/>`;
        const mx = x0 + F + w;
        if (b === 'ring') for (let y = 12; y < H - 8; y += 12) sp += `<ellipse cx="${mx}" cy="${y + 2}" rx="6" ry="2.6" fill="#fff" stroke="#c9b6bd" stroke-width="1.2"/>`;
        if (b === 'thin') sp += `<path d="M${mx} ${F + 6} V${H - F - 2}" stroke="${bd}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
        if (b === 'tn') sp += `<rect x="${mx - 1.5}" y="0" width="3" height="${H + 4}" rx="1.5" fill="${band}"/>`;
        if (b === 'hard') sp += `<rect x="${x0 + sw - 9}" y="0" width="4" height="${H + 4}" rx="2" fill="#4a3a44"/>`;
        if (b === 'spread') sp += `<rect x="${mx + w * .12}" y="${F}" width="3" height="${H + 6}" rx="1.5" fill="${band}"/>`;
        const W = x0 + sw + 4;
        return `<svg ${NS} width="${W}" height="${H + 12}" viewBox="0 0 ${W} ${H + 12}"><defs><linearGradient id="${k}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>`
            + `<linearGradient id="${k}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(bd, '#ffffff', .38)}"/><stop offset="1" stop-color="${bd}"/></linearGradient>`
            + `<linearGradient id="${k}s"><stop offset="0" stop-color="#785a5f" stop-opacity="0"/><stop offset=".5" stop-color="#785a5f" stop-opacity=".22"/><stop offset="1" stop-color="#785a5f" stop-opacity="0"/></linearGradient></defs>${cov}${sp}</svg>`;
    };
    /* 📐 규격 : 실제 크기 비율 (mm × k) */
    MK.specSvg = (n, k) => { const s = MK.SPECS.find(x => x[0] === n); if (!s) return ''; k = k || .24; const w = s[1] * k, h = s[2] * k; return `<svg ${NS} width="${w + 4}" height="${h + 4}" viewBox="0 0 ${w + 4} ${h + 4}"><rect x="2" y="2" width="${w}" height="${h}" rx="3" fill="#fffaf2" stroke="#d9a9bb" stroke-width="1.5"/></svg>`; };
    /* 🪟 방 한 장 (그림 px 1672 × 941 · 앱 책상 화면과 같은 선) : wall = { c 단색 | img · iw · ih } · top = { t 책상색 5 · img · iw · ih 나뭇결 } · sw = 견본 · ol = 선 색 */
    MK.roomSvg = (wall, top, sw, ol) => {
        if (!wall && !top) return '';
        const k = sw ? 'm' + Math.random().toString(36).slice(2, 7) : 'dk', t = top && top.t;
        const pat = (c, pid, tf) => { const T = tf ? ` patternTransform="${tf}"` : '', P = (w, h, b) => `<pattern id="${pid}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${T}>${b}</pattern>`;
            return c.c ? P(40, 40, `<rect width="40" height="40" fill="${c.c}"/>`) : c.img ? P(c.iw, c.ih, `<image href="${c.img}" width="${c.iw}" height="${c.ih}"/>`) : ''; };
        let defs = '', body = '';
        if (wall) {
            defs += pat(wall, k + 'W') + pat(wall, k + 'L', 'skewY(-21) scale(0.42 1)') + pat(wall, k + 'R', 'skewY(21) scale(0.42 1)');
            body += `<polygon points="140,0 1538,0 1538,720 140,720" fill="url(#${k}W)"/>`
                + `<polygon points="0,0 140,0 140,720 0,776" fill="url(#${k}L)"/><polygon points="1538,0 1672,0 1672,773 1538,720" fill="url(#${k}R)"/>`
                + '<polygon points="0,0 140,0 140,720 0,776" style="fill:rgba(150,90,120,.07)"/><polygon points="1538,0 1672,0 1672,773 1538,720" style="fill:rgba(150,90,120,.07)"/>';   // 옆벽은 조금 그늘
        }
        if (t) {
            if (top.img) defs += pat(top, k + 'T');
            body += `<polygon points="0,776 140,720 1538,720 1672,773 1672,866 0,866" fill="${top.img ? `url(#${k}T)` : t[0]}"/>`
                + `<polygon points="140,721 1538,721 1585,740 1585,746 95,746 95,740" fill="${t[1]}"/>`   // 벽 아래 안쪽 그늘
                + `<rect x="0" y="866" width="1672" height="13" fill="${t[2]}"/><rect x="0" y="879" width="1672" height="25" fill="${t[3]}"/><rect x="0" y="904" width="1672" height="37" fill="${t[4]}"/>`;
        }
        const ln = `stroke="${ol || '#5b3f4a'}" stroke-width="3" fill="none" stroke-linejoin="round"`;
        body += `<g ${ln}><path d="M140 0 V720 M1538 0 V720"/><polyline points="0,776 140,720 1538,720 1672,773"/><path d="M0 866 H1672 M0 904.5 H1672"/></g>`;
        const vb = !sw ? '0 0 1672 941' : sw === 'all' ? '0 0 1672 941' : wall ? '0 0 1672 700' : '0 712 1672 229';   // 견본 = 벽만 · 책상만 · all = 방 전체
        return `<svg ${sw ? 'class="ds-sw"' : 'class="desk-skin"'} ${NS} data-an="1" viewBox="${vb}" preserveAspectRatio="${sw ? 'xMidYMid slice' : 'none'}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
    };

    /* ---------- 만들기 칸 (form) ---------- */
    const CSS = `.mk{display:flex;flex-direction:column;gap:10px;font-size:13px;color:#5a3d4a}.mk-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.mk-row>label{flex:none;width:72px;font-weight:700;font-size:12.5px}
.mk-cols{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.mk-cols button{width:22px;height:22px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #e3cdd6;cursor:pointer;padding:0}.mk-cols button.on{box-shadow:0 0 0 2.5px #c2457a}.mk-cols input[type=color]{width:28px;height:24px;border:0;padding:0;background:none;cursor:pointer}
.mk-pats{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:5px;flex:1}.mk-pats button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:3px;border:1.5px solid #f0d7e1;border-radius:9px;background:#fff;cursor:pointer;font-size:10.5px;color:#7a5a68}.mk-pats button.on{border-color:#c2457a;background:#fff0f5;color:#b1407a;font-weight:800}.mk-pats i{display:block;width:40px;height:30px;border-radius:6px;border:1px solid #f3e3ea}
.mk-range{flex:1;display:flex;align-items:center;gap:6px}.mk-range input{flex:1;min-width:80px}.mk-range b{min-width:34px;text-align:right;font-size:12px}.mk-chips{display:flex;flex-wrap:wrap;gap:4px}.mk-chips button{padding:4px 10px;border:1.5px solid #f0d7e1;border-radius:999px;background:#fff;cursor:pointer;font:inherit;font-size:12px;color:#7a5a68}.mk-chips button.on{border-color:#c2457a;background:#fff0f5;color:#b1407a;font-weight:800}
.mk-sec{border:1.5px dashed #f0d7e1;border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:8px}.mk-sec>h5{margin:0;font-size:12.5px;display:flex;align-items:center;gap:6px}.mk-sec.off>:not(h5){display:none}.mk input[type=text]{flex:1;min-width:0;padding:5px 8px;border:1.5px solid #f0d7e1;border-radius:8px;font:inherit}.mk-img{display:flex;align-items:center;gap:8px}.mk-img img{width:44px;height:44px;object-fit:cover;border-radius:8px;border:1px solid #eee}`;
    function style() { if (document.getElementById('mkCss')) return; const s = document.createElement('style'); s.id = 'mkCss'; s.textContent = CSS; document.head.appendChild(s); }
    const swatch = (p, c, bg) => `background:url("${MK.url(MK.tileSvg({ bg: hex(bg) ? bg : '#ffffff', L: [{ p, c, s: 16 }] }))}") 0 0/100% 100%`;   // 무늬 고르기 칸 = 지금 바탕색 위에
    /* 칸 정의 : [키, 이름, 종류, 처음 값, 더] · 종류 = color · range [최소, 최대, 단위] · chips [[값, 이름]] · check · text · img · layer(무늬 겹) */
    const LAYER = i => ['L' + i, i ? '두 번째 무늬 (겹치기)' : '무늬', 'layer', null];
    MK.FIELDS = {
        tile: [['bg', '바탕색', 'color', '#fff6f9'], LAYER(0), LAYER(1), ['im', '그림으로 (내 사진 · 그림 반복)', 'img', null]],
        tape: [['bg', '바탕색', 'color', '#ffc9d9'], LAYER(0), LAYER(1), ['im', '그림으로 (사진 · 그림)', 'img', null], ['text', '글씨', 'text', ''], ['tc', '글씨 색', 'color', '#ffffff']],
        paper: [['bg', '종이 색', 'color', '#ffffff'], ['g', '줄', 'chips', 'plain', [['plain', '무지'], ['line', '줄'], ['grid', '모눈'], ['dot', '도트']]], ['lc', '줄 색', 'color', '#f6d5df'], ['gap', '줄 간격', 'range', 26, [8, 60, 'px']], ['top', '위 여백', 'range', 0, [0, 200, 'px']],
            LAYER(0), LAYER(1), ['im', '그림 바탕 (사진)', 'img', null], ['bd', '테두리', 'check', false], ['bw', '테두리 굵기', 'range', 3, [1, 14, 'px']], ['bc', '테두리 색', 'color', '#ff9dbb'], ['rad', '모서리 둥글게', 'range', 0, [0, 40, 'px']], ['head', '머리글', 'text', ''], ['glue', '풀칠 띠 (떡메)', 'color', '']],
        desk: [['c', '책상 색', 'color', '#f0d2ab'], ['grain', '나뭇결', 'check', true]]
    };
    /* host 에 만들기 칸 · onChange(레시피) · opt.only = 보일 키만 · opt.size(px) = 그림 크기 기본 */
    MK.form = (host, kind, rec, onChange, opt) => {
        style(); opt = opt || {};
        let r = MK.clean(kind, rec); const F = MK.FIELDS[kind].filter(f => !opt.only || opt.only.includes(f[0]) || (f[2] === 'layer' && opt.only.includes('L')));
        const pnt = [];                                                        // 바탕색 · 무늬 색이 바뀌면 무늬 고르기 칸도 다시
        const fire = () => { r = MK.clean(kind, r); pnt.forEach(f => f()); onChange(r); };
        const box = document.createElement('div'); box.className = 'mk';
        const cols = (val, set, allowNone) => { const w = document.createElement('div'); w.className = 'mk-cols';
            w.innerHTML = (allowNone ? `<button type="button" data-c="" title="없음" style="background:repeating-linear-gradient(45deg,#fff 0 3px,#f3c1d1 3px 5px)" class="${val ? '' : 'on'}"></button>` : '') + MK.COLORS.map(c => `<button type="button" data-c="${c}" style="background:${c}" class="${c === val ? 'on' : ''}"></button>`).join('') + `<input type="color" value="${hex(val) ? val : '#ffffff'}" title="다른 색">`;
            w.onclick = e => { const b = e.target.closest('button'); if (!b) return; w.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); set(b.dataset.c); };
            w.querySelector('input').oninput = e => { w.querySelectorAll('button').forEach(x => x.classList.remove('on')); set(e.target.value); };
            return w; };
        const range = (val, [a, b, u], set) => { const w = document.createElement('div'); w.className = 'mk-range'; w.innerHTML = `<input type="range" min="${a}" max="${b}" value="${val}"><b>${val}${u}</b>`; const i = w.querySelector('input'); i.oninput = () => { w.querySelector('b').textContent = i.value + u; set(+i.value); }; return w; };
        const row = (name, el) => { const d = document.createElement('div'); d.className = 'mk-row'; d.innerHTML = `<label>${name}</label>`; d.appendChild(el); return d; };
        F.forEach(([k, name, t, def, more]) => {
            if (t === 'color') box.appendChild(row(name, cols(r[k], v => { r[k] = v; fire(); }, k === 'glue')));
            else if (t === 'range') box.appendChild(row(name, range(r[k], more, v => { r[k] = v; fire(); })));
            else if (t === 'text') { const i = document.createElement('input'); i.type = 'text'; i.value = r[k] || ''; i.maxLength = 24; i.oninput = () => { r[k] = i.value; fire(); }; box.appendChild(row(name, i)); }
            else if (t === 'check') { const i = document.createElement('input'); i.type = 'checkbox'; i.checked = !!r[k]; i.onchange = () => { r[k] = i.checked; fire(); }; box.appendChild(row(name, i)); }
            else if (t === 'chips') { const w = document.createElement('div'); w.className = 'mk-chips'; w.innerHTML = more.map(([v, n]) => `<button type="button" data-v="${v}" class="${v === r[k] ? 'on' : ''}">${n}</button>`).join(''); w.onclick = e => { const b = e.target.closest('button'); if (!b) return; w.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); r[k] = b.dataset.v; fire(); }; box.appendChild(row(name, w)); }
            else if (t === 'img') {
                const sec = document.createElement('div'); sec.className = 'mk-sec' + (r.im ? '' : ' off');
                sec.innerHTML = `<h5><input type="checkbox"${r.im ? ' checked' : ''}> ${name}</h5><div class="mk-img"><img alt="" src="${r.im ? esc(r.im.src) : ''}"><button type="button" class="btn">🖼️ 사진 고르기</button><input type="file" accept="image/*" hidden></div>`;
                const on = sec.querySelector('h5 input'), file = sec.querySelector('input[type=file]'), pv = sec.querySelector('img');
                const im = () => r.im || (r.im = { src: '', s: 80, g: 0, o: 1, m: 'grid' });
                sec.appendChild(row('크기', range(r.im ? r.im.s : 80, [20, 400, 'px'], v => { im().s = v; fire(); })));
                if (kind !== 'paper') sec.appendChild(row('간격', range(r.im ? r.im.g : 0, [0, 200, 'px'], v => { im().g = v; fire(); })));
                sec.appendChild(row('진하기', range(r.im ? Math.round(r.im.o * 100) : 100, [10, 100, '%'], v => { im().o = v / 100; fire(); })));
                const lay = document.createElement('div'); lay.className = 'mk-chips'; lay.innerHTML = `<button type="button" data-v="grid" class="${!r.im || r.im.m === 'grid' ? 'on' : ''}">바둑판</button><button type="button" data-v="brick" class="${r.im && r.im.m === 'brick' ? 'on' : ''}">엇갈림</button>`;
                lay.onclick = e => { const b = e.target.closest('button'); if (!b) return; lay.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); im().m = b.dataset.v; fire(); };
                if (kind !== 'paper') sec.appendChild(row('놓기', lay));
                on.onchange = () => { sec.classList.toggle('off', !on.checked); if (!on.checked) { delete r.im; fire(); } else if (!(r.im && r.im.src)) file.click(); };
                sec.querySelector('button.btn').onclick = () => file.click();
                file.onchange = () => { const f = file.files && file.files[0]; file.value = ''; if (!f) return; const fr = new FileReader(); fr.onload = () => shrink(fr.result, opt.imgPx || 512).then(u => { im().src = u; pv.src = u; on.checked = true; sec.classList.remove('off'); fire(); }); fr.readAsDataURL(f); };
                box.appendChild(sec);
            }
            else if (t === 'layer') {
                const i = +k.slice(1), has = !!r.L[i], sec = document.createElement('div'); sec.className = 'mk-sec' + (has ? '' : ' off');
                const L = () => r.L[i] || (r.L[i] = { p: 'dot', c: i ? '#ffffff' : '#f9cfdd', s: 40, w: 100, r: 0, o: 1 });
                const cur = r.L[i] || { p: 'dot', c: i ? '#ffffff' : '#f9cfdd', s: 40, w: 100, r: 0, o: 1 };
                sec.innerHTML = `<h5><input type="checkbox"${has ? ' checked' : ''}> ${name}</h5>`;
                const pats = document.createElement('div'); pats.className = 'mk-pats';
                let pk = '';
                const paintPats = () => { const c = (r.L[i] || cur).c, k = c + r.bg + (r.L[i] || cur).p; if (k === pk) return; pk = k; pats.innerHTML = MK.PATS.map(p => `<button type="button" data-p="${p[0]}" class="${p[0] === (r.L[i] || cur).p ? 'on' : ''}"><i style='${swatch(p[0], c, r.bg)}'></i>${p[1]}</button>`).join(''); };
                paintPats(); pnt.push(paintPats);
                pats.onclick = e => { const b = e.target.closest('button'); if (!b) return; pats.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); L().p = b.dataset.p; fire(); };
                sec.appendChild(pats);
                sec.appendChild(row('색', cols(cur.c, v => { L().c = v; fire(); })));
                sec.appendChild(row('칸 크기', range(cur.s, [6, 240, 'px'], v => { L().s = v; fire(); })));
                sec.appendChild(row('굵기·크기', range(cur.w, [20, 300, '%'], v => { L().w = v; fire(); })));
                sec.appendChild(row('기울기', range(cur.r, [0, 180, '°'], v => { L().r = v; fire(); })));
                sec.appendChild(row('진하기', range(Math.round(cur.o * 100), [10, 100, '%'], v => { L().o = v / 100; fire(); })));
                const on = sec.querySelector('h5 input');
                on.onchange = () => { sec.classList.toggle('off', !on.checked); if (on.checked) { r.L[i] = Object.assign({}, cur, r.L[i]); if (i && !r.L[0]) r.L[0] = Object.assign({}, cur); } else r.L.splice(i, 1); fire(); };
                box.appendChild(sec);
            }
        });
        host.innerHTML = ''; host.appendChild(box); fire();
        return { get: () => MK.clean(kind, r) };
    };
    /* ---------- ✏️ 그리기 판 (draw) : 상품공방 직접 그리기 · 앱 그려서 배경지 · 마테 그리기가 같은 판 (도련 11-05) ----------
       도구 : 펜 · 붓 · 지우개 · 선 · 네모 · 동그라미 · 하트 · 별 · 도장 · 채우기 · 글씨 · 스포이드 · 되돌리기 · 다시 · 비우기
       opt = { W, H 판 크기 px · base 바탕 그림 주소 · vector (svg 바탕은 판 크기까지 키워요) · wrap 이어그리기 (true · false = 칸만 · 없으면 칸 없이 늘 꺼짐)
               bg 바탕색 (색이면 바탕색 칸이 생겨요 · 그림은 투명 · 바탕색은 따로) · sizes [[이름, W, H]] 판 크기 고르기 (그린 것은 늘이고 줄여요) · resize 판 크기 숫자로
               white 흰 바탕 칸 (상품공방) · view 판이 보이는 최대 너비 px · onChange(판) }
       돌려주는 판 = { cv 캔버스 · bg · wrap · drawn() · blob() · url(type) · size(W, H) } */
    MK.STAMPS = ['🌸', '⭐', '💖', '🍓', '🍀', '🎀', '🐰', '☁️', '🌙', '🍒', '🌷', '🐾', '🧸', '🍰', '🦋', '✨'];
    const DTOOLS = [['pen', '✏️ 펜'], ['brush', '🖌 붓'], ['erase', '🧽 지우개'], ['line', '╱ 선'], ['rect', '▭ 네모'], ['ellipse', '◯ 동그라미'], ['heart', '♡ 하트'], ['star', '☆ 별'], ['stamp', '💮 도장'], ['fill', '🪣 채우기'], ['text', '🅰 글씨'], ['pick', '💧 스포이드']];
    const SHAPES = ['line', 'rect', 'ellipse', 'heart', 'star'];
    const DCSS = `.mk-dw{display:flex;flex-direction:column;gap:8px}.mk-dw-stage{position:relative;line-height:0;align-self:center;max-width:100%;border-radius:10px;overflow:hidden;box-shadow:0 0 0 1.5px #f0d7e1;background:repeating-conic-gradient(#f4eef1 0 25%,#fff 0 50%) 0 0/16px 16px;touch-action:none}.mk-dw-stage canvas{display:block;width:100%;height:auto}.mk-dw-stage canvas+canvas{position:absolute;inset:0;pointer-events:none}
.mk-dw-tools{display:flex;flex-wrap:wrap;gap:4px}.mk-dw-tools button{padding:4px 9px;border:1.5px solid #f0d7e1;border-radius:999px;background:#fff;cursor:pointer;font:inherit;font-size:12px;color:#7a5a68}.mk-dw-tools button.on{border-color:#c2457a;background:#fff0f5;color:#b1407a;font-weight:800}.mk-dw-stamps button{font-size:18px;padding:2px 6px}.mk-dw [hidden]{display:none!important}`;
    MK.draw = (host, opt) => {
        style(); opt = opt || {};
        if (!document.getElementById('mkDwCss')) { const s = document.createElement('style'); s.id = 'mkDwCss'; s.textContent = DCSS; document.head.appendChild(s); }
        const S = { tool: 'pen', col: '#ff6b81', size: 6, op: 100, fill: true, out: false, oc: '#5b3f4a', stamp: MK.STAMPS[0], text: '', wrap: opt.wrap === true, bg: hex(opt.bg) ? opt.bg : '', white: false, hist: [], redo: [], down: null, drawn: !!opt.base };
        const box = document.createElement('div'); box.className = 'mk mk-dw';
        const chips = (list, cls) => `<div class="mk-dw-tools ${cls || ''}">${list.map(([k, n]) => `<button type="button" data-k="${esc(k)}">${n}</button>`).join('')}</div>`;
        box.innerHTML = `<div class="mk-dw-stage"${opt.view ? ` style="width:${opt.view}px"` : ''}><canvas></canvas><canvas></canvas></div>
            ${chips(DTOOLS, 'mk-dw-t')}${chips(MK.STAMPS.map(s => [s, s]), 'mk-dw-stamps')}
            <div class="mk-row mk-dw-txt"><label>글씨</label><input type="text" maxlength="40" placeholder="쓰고 판을 톡"></div>
            <div class="mk-row"><label>색</label><div class="mk-cols mk-dw-col"></div></div>
            <div class="mk-row"><label>굵기·크기</label><div class="mk-range"><input type="range" min="1" max="80" value="${S.size}" data-v="size"><b>${S.size}</b></div></div>
            <div class="mk-row"><label>진하기</label><div class="mk-range"><input type="range" min="5" max="100" value="100" data-v="op"><b>100%</b></div></div>
            <div class="mk-row mk-dw-sh"><label>도형</label><label style="width:auto;font-weight:400"><input type="checkbox" data-c="fill" checked> 안 채우기</label><label style="width:auto;font-weight:400"><input type="checkbox" data-c="out"> 테두리</label><input type="color" data-c="oc" value="${S.oc}" title="테두리 색"></div>
            ${opt.wrap == null ? '' : `<div class="mk-row"><label>이어그리기</label><label style="width:auto;font-weight:400"><input type="checkbox" data-c="wrap"${S.wrap ? ' checked' : ''}> 판 밖으로 나간 곳이 반대쪽에 이어져요 (반복 무늬)</label></div>`}
            ${S.bg ? '<div class="mk-row"><label>바탕색</label><div class="mk-cols mk-dw-bg"></div></div>' : ''}
            ${opt.white ? '<div class="mk-row"><label>흰 바탕</label><label style="width:auto;font-weight:400"><input type="checkbox" data-c="white"> 저장할 때 흰 바탕 (끄면 투명)</label></div>' : ''}
            ${opt.sizes ? `<div class="mk-row"><label>판 크기</label>${chips(opt.sizes.map(z => [z[1] + 'x' + z[2], z[0]]), 'mk-dw-z')}</div>` : ''}
            ${opt.resize ? '<div class="mk-row"><label>판 크기</label><input type="number" data-n="W" style="width:64px"> × <input type="number" data-n="H" style="width:64px"><button type="button" class="btn" data-a="rs">바꾸기</button></div>' : ''}
            <div class="mk-dw-tools"><button type="button" data-a="undo">↶ 되돌리기</button><button type="button" data-a="redo">↷ 다시</button><button type="button" data-a="clear">🗑 비우기</button></div>`;
        host.innerHTML = ''; host.appendChild(box);
        const q = s => box.querySelector(s), [cv, ov] = box.querySelectorAll('canvas'), x = cv.getContext('2d', { willReadFrequently: true }), o = ov.getContext('2d');
        const api = { cv, get bg() { return S.bg; }, get wrap() { return S.wrap; }, drawn: () => S.drawn };
        let tm = 0; const changed = now => { S.drawn = true; clearTimeout(tm); if (!opt.onChange) return; if (now) opt.onChange(api); else tm = setTimeout(() => opt.onChange(api), 90); };
        const setSize = (w, h, how) => {                                       // how : 'keep' 그대로 · 'scale' 늘이고 줄여요
            const old = how && cv.width ? (() => { const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.getContext('2d').drawImage(cv, 0, 0); return c; })() : null;
            cv.width = ov.width = w; cv.height = ov.height = h;
            if (old) how === 'scale' ? x.drawImage(old, 0, 0, w, h) : x.drawImage(old, 0, 0);
            box.querySelectorAll('[data-n]').forEach(i => { i.value = i.dataset.n === 'W' ? w : h; });
            box.querySelectorAll('.mk-dw-z button').forEach(b => b.classList.toggle('on', b.dataset.k === w + 'x' + h));
        };
        setSize(opt.W || 400, opt.H || 400);
        if (opt.base) { const im = new Image(); im.onload = () => { const nw = im.naturalWidth || cv.width, nh = im.naturalHeight || cv.height, k = opt.vector ? Math.max(1, Math.max(opt.W, opt.H) / Math.max(nw, nh)) : 1; setSize(Math.round(nw * k), Math.round(nh * k)); x.drawImage(im, 0, 0, cv.width, cv.height); changed(true); }; im.src = opt.base; }
        const paintCols = (sel, val, set) => { const w = q(sel); if (!w) return; w.innerHTML = MK.COLORS.map(c => `<button type="button" data-c="${c}" style="background:${c}" class="${c === val ? 'on' : ''}"></button>`).join('') + `<input type="color" value="${val}" title="다른 색">`;
            w.onclick = e => { const b = e.target.closest('button'); if (!b) return; w.querySelectorAll('button').forEach(z => z.classList.toggle('on', z === b)); w.querySelector('input').value = b.dataset.c; set(b.dataset.c); };
            w.querySelector('input').oninput = e => { w.querySelectorAll('button').forEach(z => z.classList.remove('on')); set(e.target.value); }; };
        const setCol = c => { S.col = c; paintCols('.mk-dw-col', c, v => { S.col = v; }); };
        setCol(S.col);
        paintCols('.mk-dw-bg', S.bg, v => { S.bg = v; stageBg(); changed(true); });
        const stageBg = () => { q('.mk-dw-stage').style.background = S.bg || ''; };
        stageBg();
        const ui = () => {
            box.querySelectorAll('.mk-dw-t button').forEach(b => b.classList.toggle('on', b.dataset.k === S.tool));
            box.querySelectorAll('.mk-dw-stamps button').forEach(b => b.classList.toggle('on', b.dataset.k === S.stamp));
            q('.mk-dw-stamps').hidden = S.tool !== 'stamp'; q('.mk-dw-txt').hidden = S.tool !== 'text'; q('.mk-dw-sh').hidden = !SHAPES.includes(S.tool) || S.tool === 'line';
        };
        ui();
        box.onclick = e => {
            const b = e.target.closest('button'); if (!b) return;
            const p = b.parentElement;
            if (p.classList.contains('mk-dw-t')) { S.tool = b.dataset.k; ui(); }
            else if (p.classList.contains('mk-dw-stamps')) { S.stamp = b.dataset.k; ui(); }
            else if (p.classList.contains('mk-dw-z')) { const [w, h] = b.dataset.k.split('x').map(Number); snap(); setSize(w, h, 'scale'); changed(true); }
            else if (b.dataset.a === 'undo') undo(); else if (b.dataset.a === 'redo') redo();
            else if (b.dataset.a === 'clear') { snap(); x.clearRect(0, 0, cv.width, cv.height); changed(true); S.drawn = false; }
            else if (b.dataset.a === 'rs') { const n = k => Math.max(8, Math.min(4000, +q(`[data-n="${k}"]`).value || cv[k === 'W' ? 'width' : 'height'])); snap(); setSize(n('W'), n('H'), 'keep'); changed(true); }
        };
        box.querySelectorAll('input[type=range]').forEach(i => i.oninput = () => { S[i.dataset.v] = +i.value; i.nextElementSibling.textContent = i.value + (i.dataset.v === 'op' ? '%' : ''); });
        box.querySelectorAll('[data-c]').forEach(i => { if (i.tagName !== 'INPUT') return; i.oninput = i.onchange = () => { S[i.dataset.c] = i.type === 'checkbox' ? i.checked : i.value; }; });
        q('.mk-dw-txt input').oninput = e => { S.text = e.target.value; };
        /* 되돌리기 */
        const snap = () => { S.hist.push(x.getImageData(0, 0, cv.width, cv.height)); if (S.hist.length > 40) S.hist.shift(); S.redo = []; };
        const put = im => { if (im.width !== cv.width || im.height !== cv.height) setSize(im.width, im.height); x.putImageData(im, 0, 0); changed(true); };
        const undo = () => { if (!S.hist.length) return; S.redo.push(x.getImageData(0, 0, cv.width, cv.height)); put(S.hist.pop()); };
        const redo = () => { if (!S.redo.length) return; S.hist.push(x.getImageData(0, 0, cv.width, cv.height)); put(S.redo.pop()); };
        const key = e => { if (!box.isConnected) { document.removeEventListener('keydown', key); return; } if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !/INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) { e.preventDefault(); e.shiftKey ? redo() : undo(); } };
        document.addEventListener('keydown', key);
        /* 그리기 (이어그리기 = 아홉 군데에 같이) */
        const each = (c, fn) => { const ox = S.wrap ? [-cv.width, 0, cv.width] : [0], oy = S.wrap ? [-cv.height, 0, cv.height] : [0]; ox.forEach(dx => oy.forEach(dy => { c.save(); c.translate(dx, dy); fn(c); c.restore(); })); };
        const pen = c => { c.globalAlpha = S.op / 100; c.lineCap = c.lineJoin = 'round'; c.lineWidth = S.size; c.strokeStyle = c.fillStyle = S.col; if (S.tool === 'erase') c.globalCompositeOperation = 'destination-out'; if (S.tool === 'brush') { c.shadowColor = S.col; c.shadowBlur = S.size * .8; } };
        const path = (c, k, x0, y0, x1, y1) => {
            const l = Math.min(x0, x1), t = Math.min(y0, y1), w = Math.abs(x1 - x0), h = Math.abs(y1 - y0); c.beginPath();
            if (k === 'rect') c.rect(l, t, w, h); else if (k === 'ellipse') c.ellipse(l + w / 2, t + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); else if (k === 'line') { c.moveTo(x0, y0); c.lineTo(x1, y1); }
            else if (k === 'heart') { c.moveTo(l + w / 2, t + h * .95); c.bezierCurveTo(l - w * .1, t + h * .55, l + w * .02, t - h * .05, l + w / 2, t + h * .28); c.bezierCurveTo(l + w * .98, t - h * .05, l + w * 1.1, t + h * .55, l + w / 2, t + h * .95); c.closePath(); }
            else if (k === 'star') { const cx = l + w / 2, cy = t + h / 2; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .4 : 1; c[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * w / 2 * r, cy + Math.sin(a) * h / 2 * r); } c.closePath(); }
        };
        const shape = (c, p) => each(c, c => { pen(c); path(c, S.tool, S.down[0], S.down[1], p[0], p[1]); if (S.tool === 'line') { c.stroke(); return; } if (S.fill) c.fill(); if (S.out) { c.strokeStyle = S.oc; c.stroke(); } });
        const flood = (sx, sy) => {
            const W = cv.width, H = cv.height, im = x.getImageData(0, 0, W, H), d = im.data; sx = Math.floor(sx); sy = Math.floor(sy); if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
            const at = (sy * W + sx) * 4, t = [d[at], d[at + 1], d[at + 2], d[at + 3]], c = [1, 3, 5].map(i => parseInt(S.col.substr(i, 2), 16)).concat(255);
            if (t.every((v, i) => v === c[i])) return;
            const same = i => Math.abs(d[i] - t[0]) <= 40 && Math.abs(d[i + 1] - t[1]) <= 40 && Math.abs(d[i + 2] - t[2]) <= 40 && Math.abs(d[i + 3] - t[3]) <= 40;
            const seen = new Uint8Array(W * H), st = [[sx, sy]], nx = (a, b) => S.wrap ? [(a + W) % W, (b + H) % H] : [a, b];   // 이어그리기면 가장자리 너머로도 채워요
            while (st.length) { const [px, py] = st.pop(); if (px < 0 || py < 0 || px >= W || py >= H) continue; const i = py * W + px; if (seen[i] || !same(i * 4)) continue; seen[i] = 1; d.set(c, i * 4); st.push(nx(px + 1, py), nx(px - 1, py), nx(px, py + 1), nx(px, py - 1)); }
            x.putImageData(im, 0, 0);
        };
        const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height]; };
        cv.style.touchAction = 'none';
        cv.onpointerdown = e => {
            e.preventDefault(); const p = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
            if (S.tool === 'pick') { const d = x.getImageData(Math.floor(p[0]), Math.floor(p[1]), 1, 1).data; if (d[3]) { setCol('#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('')); S.tool = 'pen'; ui(); } return; }
            snap();
            if (S.tool === 'fill') { flood(p[0], p[1]); changed(true); return; }
            if (S.tool === 'stamp' || S.tool === 'text') {
                const t = S.tool === 'stamp' ? S.stamp : S.text.trim(); if (!t) { S.hist.pop(); q('.mk-dw-txt input').focus(); return; }
                each(x, c => { pen(c); c.font = S.tool === 'stamp' ? `${S.size * 3 + 14}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif` : `700 ${Math.max(10, S.size * 3)}px "Jua","Malgun Gothic",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, p[0], p[1]); });
                changed(true); return;
            }
            S.down = S.last = p;
            if (!SHAPES.includes(S.tool)) { each(x, c => { pen(c); c.beginPath(); c.arc(p[0], p[1], S.size / 2, 0, Math.PI * 2); c.fill(); }); changed(); }
        };
        cv.onpointermove = e => {
            if (!S.down) return; const p = pos(e);
            if (!SHAPES.includes(S.tool)) { const a = S.last; each(x, c => { pen(c); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(p[0], p[1]); c.stroke(); }); S.last = p; changed(); return; }
            o.clearRect(0, 0, ov.width, ov.height); shape(o, p);
        };
        cv.onpointerup = cv.onpointercancel = e => { if (!S.down) return; if (SHAPES.includes(S.tool)) { o.clearRect(0, 0, ov.width, ov.height); shape(x, pos(e)); } S.down = null; changed(true); };
        const out = () => { if (!S.white) return cv; const c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; const y = c.getContext('2d'); y.fillStyle = '#fff'; y.fillRect(0, 0, c.width, c.height); y.drawImage(cv, 0, 0); return c; };
        api.blob = () => new Promise(ok => out().toBlob(ok, 'image/png'));
        api.url = t => out().toDataURL(t || 'image/png');
        api.size = (w, h) => setSize(w, h, 'scale');
        return api;
    };
    /* 사진 줄이기 (긴 쪽 px · png 투명 그대로 · 사진은 jpg) */
    function shrink(src, px) {
        return new Promise(ok => { const i = new Image(); i.onload = () => { const k = Math.min(1, px / Math.max(i.naturalWidth, i.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(i.naturalWidth * k)); c.height = Math.max(1, Math.round(i.naturalHeight * k)); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); ok(/^data:image\/png/.test(src) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .88)); }; i.onerror = () => ok(src); i.src = src; });
    }
    MK.shrink = shrink;
    window.MK = MK;
})();
