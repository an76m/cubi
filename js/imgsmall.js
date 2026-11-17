/* 말랑달콤 다이어리 - js/imgsmall.js · 🗜 그림 굽기 엔진 하나 (IMGS v1 · 도련 11-17)
   "원본 모습은 그대로 · 용량은 가장 작게 · 크기는 다꾸하기 좋게 (페이지 안)" = 그림이 들어오는 세 길이 같은 규칙
     ✂️ 앱 = 다꾸러가 만드는 스티커 · 페이지에 굽는 그림 (js/elements.js cvSmall → imgBake)
     🧁 상품공방 = 🗜 그림 가볍게 ✅ 자동 (상품공방에 이 파일을 통째로 넣어 둬요 · <script id="imgEngine"> · 버전 IMGS.v 가 같아야 해요)
     🤖 AI = 도구/스티커정리/말랑스티커.py small_auto (같은 규칙 · 같은 숫자를 파이썬으로)
   규칙 (01 인수인계서 2번 규칙 17 · 9-3)
     ① 크기 : 줄이기만 (절대 키우지 않아요) · max 를 주면 그 안으로 (스티커 = 📔 A6 한 쪽 IMGS.PAGE)
     ② 색이 96개 이하 = 원본 그대로 무손실
     ③ 96색으로 줄여 봐요 (진한 색 = 입술 · 볼이 바래지 않게 · 아주 옅은 무늬 디더 = 말랑스티커.py q96 과 같은 방법)
        → 눈에 띄게 바뀐 점(색 거리 12 넘게)이 20% 이하면 = 96색 무손실 (도련 11-04 : 스티커 = 96색 · 눈으로 견줘 정했어요)
        → 넘으면 사진 같은 그림 = 투명 없으면 JPG 0.9 와 WebP 0.9 중 작은 것 · 투명 있으면 WebP 0.9 (사파리 = JPG · 원본 PNG)
     ④ (imgBakeBest · 기다려도 되는 곳) 손실 압축 JPG 0.9 · WebP 0.9 가 더 작고 바뀐 점이 10% 이하면 그것 = 가장 작은 것
     무손실 = 크롬 WebP (toDataURL webp 1.0 = 무손실 · 11-17 재 봤어요 : 픽셀 그대로 · 반투명 점만 브라우저 계산으로 1~2 차이) · WebP 를 못 굽는 브라우저 (사파리 · 아이폰 · 아이패드) = PNG
     ⚠ 크롬 무손실 WebP 는 파이썬(Pillow method 6)보다 20%쯤 커요 → 🤖 AI 는 파이썬으로 굽고 (같은 규칙) · 앱 · 상품공방은 이 엔진
   ⚠ 받은 서버 그림은 다시 굽지 않아요 (규칙 17 그대로 · 이 엔진은 '굽는' 곳만) */
(function () {
    const IMGS = {
        v: 1,
        COL: 96,             // 🎨 색 수
        AMP: 6,              // 무늬 디더 세기 (0 = 없음)
        LOSS_D: 12,          // 📉 이만큼(색 거리) 넘게 바뀐 점 = 눈에 띄게 바뀐 점
        QUANT_MAX: 20,       // 96색으로 줄여 눈에 띄게 바뀐 점이 이 % 넘으면 = 사진 같은 그림 (96색은 안 써요 · 자세한 일러스트 96색 = 보통 3~10%)
        LOSS_MAX: 10,        // 손실 압축(JPG · WebP 0.9)은 바뀐 점이 이 % 이하일 때만 (작은 스티커 깅엄 · 리본이 뭉개지면 15~20% = 안 골라져요)
        JPG: .9,             // 투명 없는 사진 같은 그림
        LOSSY: .9,           // 투명 있는 사진 같은 그림 (크롬)
        SAMPLE: 40000,       // 색 고르기 · 먼저 견줘 보기에 쓰는 점 수 (큰 그림도 빠르게)
        PAGE: [457, 644]     // 📔 A6 한 쪽 = 105 × 148mm × 스티커 그림 1mm 4.35px (js/maker.js MK.STK_MM) · 스티커 크기 상한
    };
    const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - .5);   // 4×4 무늬 디더 (말랑스티커.py B4)
    const WD = [1, 1.2, 1, 2.5];                                               // 색 거리 무게 (r g b a · 말랑스티커.py 와 같아요)
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    let webpOk = null;
    function canWebp() {                                                       // 이 브라우저가 WebP 를 구울 수 있나 (사파리 = 못 해요)
        if (webpOk === null) { try { webpOk = mk(2, 2).toDataURL('image/webp', 1).startsWith('data:image/webp'); } catch (e) { webpOk = false; } }
        return webpOk;
    }
    /* ① 크기 : max = 긴 변 숫자 또는 [가로, 세로] 상자 · 줄이기만 (많이 줄일 땐 반씩 = 부드럽게) */
    function imgFit(c, max) {
        if (!max) return c;
        const W = Array.isArray(max) ? max[0] : max, H = Array.isArray(max) ? max[1] : max;
        const k = Math.min(1, W / c.width, H / c.height); if (k >= 1) return c;
        const tw = Math.max(1, Math.round(c.width * k)), th = Math.max(1, Math.round(c.height * k));
        let src = c, w = c.width, h = c.height;
        while (w / 2 >= tw && h / 2 >= th) { const d = mk(Math.round(w / 2), Math.round(h / 2)), x = d.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, d.width, d.height); src = d; w = d.width; h = d.height; }
        const o = mk(tw, th), x = o.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, tw, th); return o;
    }
    /* 🎨 색 고르기 : 중간 자르기로 시작 → 무게 k-means (진한 색일수록 무겁게 = 1 + 6 × 채도²) */
    function palette(d, idx, n) {
        const S = idx.map(i => [d[i], d[i + 1], d[i + 2], d[i + 3]]), Wt = S.map(v => { const s = (Math.max(v[0], v[1], v[2]) - Math.min(v[0], v[1], v[2])) / 255; return 1 + 6 * s * s; });
        let B = [S.map((_, i) => i)];
        while (B.length < n) {
            let bi = -1, bc = 0, br = 0;
            B.forEach((b, i) => { if (b.length < 2) return; for (let ch = 0; ch < 4; ch++) { let lo = 255, hi = 0; for (const j of b) { const v = S[j][ch]; if (v < lo) lo = v; if (v > hi) hi = v; } const r = (hi - lo) * Math.sqrt(b.length); if (r > br) { br = r; bi = i; bc = ch; } } });
            if (bi < 0 || br === 0) break;
            const b = B[bi].sort((p, q) => S[p][bc] - S[q][bc]), m = b.length >> 1; B.splice(bi, 1, b.slice(0, m), b.slice(m));
        }
        let P = B.map(b => { const s = [0, 0, 0, 0]; let w = 0; b.forEach(j => { const v = S[j], q = Wt[j]; for (let ch = 0; ch < 4; ch++) s[ch] += v[ch] * q; w += q; }); return s.map(v => v / w); });
        const near = v => { let bi = 0, bd = 1e12; for (let i = 0; i < P.length; i++) { const p = P[i], a = v[0] - p[0], b = v[1] - p[1], e = v[2] - p[2], f = v[3] - p[3], dd = a * a * WD[0] + b * b * WD[1] + e * e * WD[2] + f * f * WD[3]; if (dd < bd) { bd = dd; bi = i; } } return bi; };
        for (let it = 0; it < 5; it++) {
            const s = P.map(() => [0, 0, 0, 0, 0]);
            S.forEach((v, j) => { const q = s[near(v)], w = Wt[j]; q[0] += v[0] * w; q[1] += v[1] * w; q[2] += v[2] * w; q[3] += v[3] * w; q[4] += w; });
            P = P.map((p, i) => s[i][4] ? s[i].slice(0, 4).map(v => v / s[i][4]) : p);
        }
        return P.map(p => p.map(v => Math.max(0, Math.min(255, Math.round(v)))));
    }
    /* 점 하나 → 가장 가까운 색 (디더 = 자리마다 아주 조금 밝게 · 어둡게 · 같은 색 · 같은 자리 무늬는 기억해요) */
    function mapper(P, amp) {
        const memo = new Map();
        return (r, g, b, a, x, y) => {
            const t = B4[(y & 3) * 4 + (x & 3)] * amp, key = (((r << 24) | (g << 16) | (b << 8) | a) >>> 0) * 16 + (y & 3) * 4 + (x & 3);
            let j = memo.get(key);
            if (j === undefined) {
                const R = r + t, G = g + t, Bb = b + t; let bd = 1e12; j = 0;
                for (let i = 0; i < P.length; i++) { const p = P[i], q = R - p[0], w = G - p[1], e = Bb - p[2], f = a - p[3], dd = q * q * WD[0] + w * w * WD[1] + e * e * WD[2] + f * f * WD[3]; if (dd < bd) { bd = dd; j = i; } }
                memo.set(key, j);
            }
            return P[j];
        };
    }
    const far = (r, g, b, a, p) => { const q = r - p[0], w = g - p[1], e = b - p[2], f = a - p[3]; return q * q + w * w + e * e + f * f > IMGS.LOSS_D * IMGS.LOSS_D; };
    /* ③ 96색 : → { c: 96색 그림, loss } · null = 이미 96색 이하 · 'photo' = 사진 같은 그림 (먼저 견줘 보면 10% 넘어요) */
    function quant(c, n) {
        n = n || IMGS.COL;
        const w = c.width, h = c.height, x = c.getContext('2d'), D = x.getImageData(0, 0, w, h), d = D.data, N = w * h;
        const seen = new Set(); let vis = 0;
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 8) continue; vis++; if (seen.size <= n) seen.add(((d[i] << 24) | (d[i + 1] << 16) | (d[i + 2] << 8) | d[i + 3]) >>> 0); }
        if (seen.size <= n || vis < n * 4) return null;
        const step = Math.max(1, Math.floor(N / IMGS.SAMPLE)), idx = [];
        for (let p = 0; p < N; p += step) if (d[p * 4 + 3] >= 8) idx.push(p * 4);
        const P = palette(d, idx, n - 1), M = mapper(P, IMGS.AMP);
        let sv = 0, sb = 0;                                                      // 먼저 견줘 보기 (고른 점만)
        for (const i of idx) { const p = i >> 2, q = M(d[i], d[i + 1], d[i + 2], d[i + 3], p % w, (p / w) | 0); sv++; if (far(d[i], d[i + 1], d[i + 2], d[i + 3], q)) sb++; }
        if (sv && sb / sv * 100 > IMGS.QUANT_MAX * 1.25) return 'photo';
        const o = mk(w, h), ox = o.getContext('2d'), E = ox.createImageData(w, h), e = E.data;
        let bad = 0, all = 0;
        for (let i = 0, p = 0; i < d.length; i += 4, p++) {
            if (d[i + 3] < 8) { e[i] = e[i + 1] = e[i + 2] = e[i + 3] = 0; if (d[i + 3]) { all++; } continue; }
            const q = M(d[i], d[i + 1], d[i + 2], d[i + 3], p % w, (p / w) | 0);
            e[i] = q[0]; e[i + 1] = q[1]; e[i + 2] = q[2]; e[i + 3] = q[3]; all++;
            if (far(d[i], d[i + 1], d[i + 2], d[i + 3], q)) bad++;
        }
        ox.putImageData(E, 0, 0);
        return { c: o, loss: all ? bad / all * 100 : 0 };
    }
    function opaque(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return false; return true; }
    const lossless = c => canWebp() ? c.toDataURL('image/webp', 1) : c.toDataURL('image/png');
    const jpg = c => { const j = mk(c.width, c.height), x = j.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, j.width, j.height); x.drawImage(c, 0, 0); return j.toDataURL('image/jpeg', IMGS.JPG); };
    const small = L => L.filter(v => v && v[1]).sort((a, b) => a[1].length - b[1].length)[0];
    /* 🗜 굽기 (바로 · 손으로 자르고 뜯는 곳 = js/elements.js cvSmall) : 캔버스 → { url, how, loss, w, h, cv }
       o.max = 크기 상한 (긴 변 숫자 · [가로, 세로]) · o.col = 색 수 (0 = 줄이지 않기) · 손실 압축은 사진 같은 그림에만 (눈에 띄게 바뀐 점을 재려면 기다려야 해서 · imgBakeBest 가 재요) */
    function imgBakeInfo(c, o) {
        o = o || {}; c = imgFit(c, o.max);
        let op = false; try { op = opaque(c); } catch (e) { return { url: c.toDataURL('image/png'), how: 'png', loss: 0, w: c.width, h: c.height, cv: c }; }
        let r; try { r = o.col === 0 ? 'photo0' : quant(c, o.col); } catch (e) { r = 'photo'; }
        let best;
        if (r === null) best = ['원본', lossless(c), 0];
        else if (r === 'photo0') best = ['원본', lossless(c), 0];                              // o.col = 0 : 색을 줄이지 않아요 (🧁 상품공방 '원본 색')
        else if (r !== 'photo' && r.loss <= IMGS.QUANT_MAX) best = [(o.col || IMGS.COL) + '색', lossless(r.c), r.loss];
        else if (op) best = small([['jpg', jpg(c), -1], canWebp() && ['webp', c.toDataURL('image/webp', IMGS.LOSSY), -1]]);   // 📸 사진 같은 그림 = JPG 0.9 · 크롬은 WebP 0.9 와 견줘 작은 것
        else best = canWebp() ? ['webp', c.toDataURL('image/webp', IMGS.LOSSY), -1] : ['png', c.toDataURL('image/png'), 0];
        return { url: best[1], how: best[0], loss: best[2], w: c.width, h: c.height, cv: c, op };
    }
    /* 📉 구운 그림이 원본과 얼마나 다른가 (눈에 띄게 바뀐 점 %) */
    async function lossOf(c, url) {
        const im = new Image(); im.src = url; await im.decode();
        const d = mk(c.width, c.height), dx = d.getContext('2d'); dx.drawImage(im, 0, 0, c.width, c.height);
        const A = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, B = dx.getImageData(0, 0, c.width, c.height).data;
        let v = 0, bad = 0;
        for (let i = 0; i < A.length; i += 4) { if (!A[i + 3] && !B[i + 3]) continue; v++; if (far(A[i], A[i + 1], A[i + 2], A[i + 3], [B[i], B[i + 1], B[i + 2], B[i + 3]])) bad++; }
        return v ? bad / v * 100 : 0;
    }
    /* 🗜 가장 작게 (기다려도 되는 곳 = ✅ 완료 · 🧁 상품공방 자동) : 위 결과 + 손실 압축(JPG 0.9 · 크롬 WebP 0.9)도 견줘 봐요
       → 더 작고 · 눈에 띄게 바뀐 점이 10% 이하인 것 (손실 WebP 가 작은 스티커 깅엄 · 리본을 뭉개면 10% 를 넘어 안 골라져요) */
    async function imgBakeBest(c, o) {
        const r = imgBakeInfo(c, o);
        const L = [];
        if (canWebp() && r.how !== 'webp') L.push(['webp', r.cv.toDataURL('image/webp', IMGS.LOSSY)]);
        if (r.op && r.how !== 'jpg') L.push(['jpg', jpg(r.cv)]);
        let best = r;
        for (const [how, url] of L.sort((a, b) => a[1].length - b[1].length)) {
            if (url.length >= best.url.length) continue;
            let loss = 100; try { loss = await lossOf(r.cv, url); } catch (e) {}
            if (loss <= IMGS.LOSS_MAX) { best = Object.assign({}, r, { url, how, loss }); break; }
        }
        return best;
    }
    const imgBake = (c, o) => imgBakeInfo(c, o).url;
    IMGS.fit = imgFit; IMGS.quant = quant; IMGS.webp = canWebp; IMGS.loss = lossOf;
    window.IMGS = IMGS; window.imgBake = imgBake; window.imgBakeInfo = imgBakeInfo; window.imgBakeBest = imgBakeBest;
})();
