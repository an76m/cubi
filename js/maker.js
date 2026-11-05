/* 말랑달콤 다이어리 - js/maker.js · MK v1 (도련 11-05)
   🧵 만들기 엔진 하나 = 앱 다꾸 작업실 · 🛠 상품공방이 똑같이 써요 (상품공방에는 이 파일을 통째로 넣어 둬요 · 버전 MK.v 가 같아야 해요)
   - 개발자가 상품공방에서 만드는 것 = 다꾸러가 앱에서 만드는 것 (기능 · 고를 거리 · 저장 모양이 같아요)
   - 무늬 (PATS) : 한 줄 = 한 무늬 · 새 무늬 = 여기 한 줄 → 배경지 · 벽지 · 마스킹테이프 · 떡메 · 메모지 · 속지 바탕에 저절로
   - 레시피 (다시 열어 고칠 수 있는 설정값) → 그림(svg) : tileSvg(배경지 · 벽지) · tapeSvg(마스킹테이프) · paperSvg(떡메 · 메모지 · 속지) · deskSvg(책상판)
       무늬 겹 L = [{ p 무늬, c 색, s 칸 크기 px, w 굵기·크기 %, r 기울기 °, o 진하기 }] (두 겹까지) · 그림 겹 im = { src, s 크기 px, m 'grid' 바둑판 | 'brick' 엇갈림 }
   - 값 표 : SPECS 다이어리 규격 · BINDS 묶는 방식 · LEAFS 내지 종류 · COLORS 고를 색 → 상품공방 · 앱이 같은 표를 써요
   - form(host, kind, rec, onChange) = 만들기 칸 (색 · 무늬 · 크기 …) · 상품공방 · 앱 모두 이 칸 그대로
   ※ 다른 파일 없이 혼자 동작해요 (상품공방은 앱 파일 없이 열려요) */
(function () {
    const MK = { v: 1 };
    const NS = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
    const hex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
    const num = (v, a, b, d) => { const n = parseFloat(v); return isNaN(n) ? d : Math.max(a, Math.min(b, Math.round(n * 100) / 100)); };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    /* 사진 줄이기 (긴 쪽 px · png 투명 그대로 · 사진은 jpg) */
    function shrink(src, px) {
        return new Promise(ok => { const i = new Image(); i.onload = () => { const k = Math.min(1, px / Math.max(i.naturalWidth, i.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(i.naturalWidth * k)); c.height = Math.max(1, Math.round(i.naturalHeight * k)); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); ok(/^data:image\/png/.test(src) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .88)); }; i.onerror = () => ok(src); i.src = src; });
    }
    MK.shrink = shrink;
    window.MK = MK;
})();
