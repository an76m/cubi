/* 말랑달콤 다이어리 - js/stickerpeel.js
   🏷️ 씰스티커 떼어 붙이기 : 내스티커에서 고르거나 만들기에서 📌 붙이기를 누르면 페이지 앞에 스티커가 나와요 (🧩 조각스티커는 봉투 연출 js/piecebag.js)
   - 🏷️ 씰 : 하얀 네모(스티커 종이) 위에 씰이 있어요 → 가장자리를 잡고 떼어 원하는 곳에 놓으면 붙어요
             종이는 배경(화면) 한가운데에 나와요 · 사진고르기로 여러 장을 고르면 한 장의 종이에 씰이 여러 개 붙어 나와요 → 마지막 씰을 떼면 하얀 종이가 사라져요
             하얀 종이의 빈 곳을 누른 채 끌면 종이째 화면 안에서 옮겨져요 · 종이 바깥 날짜바를 끌면 페이지가 옮겨져요
             소리 : 떼어 낼 때 '찌익' 소리만
   - pelBake(src) : 📸 포토부스 사진처럼 네모난 그림 둘레에 하얀 칼선 테두리를 둘러요 (원본 크기 그대로 PNG)
                    ⚙ 설정 '🏷️ 씰 하얀 테두리'가 꺼져 있으면(기본) 테두리 없이 크기만 맞춰요 (js/show.js showOn('die'))
   - 소리는 ⚙ 설정의 '✨ 연출 소리'를 따라요 (js/sound.js)
   - 🎒 유한 스티커 (10-25) : opt.own = { id, wh } 로 열면 내 종이 (js/own.js) · 그림 자리가 null 이면 이미 쓴 칸 → 뗀 자국만 보여요
     붙어서 저장되는 순간 ownUse(종이, 칸) → 그 칸은 영원히 사라져요 · 페이지 요소에 data-own = '종이:칸'
   - 🤍 이형지북 모드 (10-25 · opt.rel) : 정리 책상에서 종이를 고르면 그 자리(rel.at)에 한 줄로 나와요 (옆으로 밀어 넘겨요)
     핀셋으로 떼어 이형지북(rel.target) 위에 놓으면 rel.drop(칸, { x, y, r }) · 이형지북 밖에 놓으면 종이로 돌아가요 · 종이 밖을 누르면 그 아래 버튼이 눌려요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (스티커가 바로 붙어요) */

        const PEL_GRAB = 28, PEL_GRAB_OUT = 10, PEL_PAD = 22, PEL_M = 7, PEL_EDGE = 6;
        /* items : 종이 위 스티커들 [{ a, src, st }] · a · st · src 는 지금 손에 잡은 스티커 */
        const pelS = { on: false, cv: null, ctx: null, fl: null, items: [], a: null, st: null, drag: null, board: null, mv: { x: 0, y: 0 }, gone: 0, src: '', W: 0, H: 0, DPR: 1, raf: 0, hint: '' };
        const pelq = id => document.getElementById(id);
        const pelMk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
        const pelLoad = src => new Promise((ok, no) => { const im = new Image(); if (/^https?:/i.test(src)) im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = no; im.src = src; });   // 주소 그림은 하얀 테두리를 그리려고 CORS 로
        function pelTint(src, fill) { const c = pelMk(src.width, src.height), d = c.getContext('2d'); d.drawImage(src, 0, 0); d.globalCompositeOperation = 'source-in'; d.fillStyle = fill; d.fillRect(0, 0, c.width, c.height); return c; }
        function pelGrow(src, r, step) { const c = pelMk(src.width, src.height), d = c.getContext('2d'); for (const k of [1, .66, .33]) for (let a = 0; a < 360; a += step) d.drawImage(src, Math.cos(a * Math.PI / 180) * r * k, Math.sin(a * Math.PI / 180) * r * k); d.drawImage(src, 0, 0); return c; }

        /* ---------- 하얀 칼선 테두리 두르기 ---------- */
        async function pelBake(src) {
            const im = await pelLoad(src);
            const iw = im.width, ih = im.height;                               // 🖼️ 원본 크기 그대로 (줄이지 않아요)
            const die = typeof showOn !== 'function' || showOn('die');
            const b = die ? PEL_EDGE + 2 : 0, c = pelMk(iw + b * 2, ih + b * 2), x = c.getContext('2d');   // 테두리를 끄면 그림 크기 그대로
            const one = pelMk(c.width, c.height); one.getContext('2d').drawImage(im, b, b, iw, ih);
            if (die) x.drawImage(pelTint(pelGrow(pelTint(one, '#fff'), PEL_EDGE, 10), '#fff'), 0, 0);
            x.drawImage(one, 0, 0);
            return c.toDataURL('image/png');
        }

        /* ---------- 떼기용 그림 (앞면 · 뒷면 · 가장자리 점) ---------- */
        function pelAsset(img) {
            const m = PEL_M, w = img.width + m * 2, h = img.height + m * 2;
            const front = pelMk(w, h); front.getContext('2d').drawImage(img, m, m);
            const back = pelTint(front, '#f4efe9'), bk = back.getContext('2d');
            bk.globalCompositeOperation = 'source-atop'; bk.globalAlpha = .25;
            for (let i = 0; i < w * h / 120; i++) { bk.fillStyle = Math.random() < .5 ? '#fff' : '#e4dcd3'; bk.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
            const data = front.getContext('2d').getImageData(0, 0, w, h).data, edge = [];
            const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : data[(y * w + x) * 4 + 3];
            const st = Math.max(2, Math.round(Math.max(w, h) / 160));
            for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st)
                if (A(x, y) > 128 && (A(x - st, y) <= 128 || A(x + st, y) <= 128 || A(x, y - st) <= 128 || A(x, y + st) <= 128)) edge.push([x - w / 2, y - h / 2]);
            return { w, h, m, front, back, edge, alpha: (lx, ly) => A(Math.round(lx + w / 2), Math.round(ly + h / 2)) };
        }

        /* ---------- 화면 ---------- */
        function pelBuild() {
            if (pelq('pelRoom')) return;
            const el = document.createElement('div');
            el.id = 'pelRoom'; el.className = 'pel-room';
            el.innerHTML = `<canvas id="pelCv"></canvas><p class="pel-hint" id="pelHint"></p><button type="button" class="pel-x pel-bx" id="pelX" onclick="closeStickerPeel()" aria-label="닫기">✕</button>`;
            document.body.appendChild(el);
            const cv = pelq('pelCv');
            cv.addEventListener('pointerdown', pelDown); cv.addEventListener('pointermove', pelMove);
            cv.addEventListener('pointerup', pelUp); cv.addEventListener('pointercancel', pelUp);
            window.addEventListener('resize', () => { if (pelS.on) pelLayout(); });
        }
        const pelPage = () => document.getElementById('canvasArea');
        function pelLayout() {
            const S = pelS, cv = S.cv;
            S.DPR = Math.min(window.devicePixelRatio || 1, 3); S.W = window.innerWidth; S.H = window.innerHeight;
            cv.width = S.W * S.DPR; cv.height = S.H * S.DPR; S.fl = pelMk(cv.width, cv.height);
            /* 배경(화면) 가운데 하얀 종이 한 장 (크기는 페이지에 맞춰요) : 한 장이면 그 크기, 여러 장이면 칸을 나눠 나란히 */
            const pg = pelPage(), r = pg ? pg.getBoundingClientRect() : { left: 0, top: 0, width: S.W, height: S.H };
            if (S.rel) return pelRelLayout();
            let cx = S.W / 2, cy = S.H / 2;
            cx += S.mv.x; cy += S.mv.y;                                          // 종이를 옮긴 만큼
            const it = S.items, n = it.length, pw = Math.min(r.width, S.W);
            if (n === 1 && it[0].a) {
                const a = it[0].a, s = Math.min(pw * .42 / a.w, S.H * .4 / a.h, 1);
                if (it[0].st.state === 'on') Object.assign(it[0].st, { cx, cy, s, rot: 0 });
                it[0].slot = { cx, cy, w: (a.w - a.m * 2) * s, h: (a.h - a.m * 2) * s };
                S.board = { cx, cy, w: (a.w - a.m * 2) * s + PEL_PAD * 2, h: (a.h - a.m * 2) * s + PEL_PAD * 2 };
                return pelKeep();
            }
            const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), G = 12;
            const cs = Math.min(150, (pw * .86 - PEL_PAD * 2 - G * (cols - 1)) / cols, (S.H * .6 - PEL_PAD * 2 - G * (rows - 1)) / rows);
            S.board = { cx, cy, w: cols * cs + G * (cols - 1) + PEL_PAD * 2, h: rows * cs + G * (rows - 1) + PEL_PAD * 2 };
            it.forEach((o, i) => {
                const [iw, ih] = o.a ? [o.a.w - o.a.m * 2, o.a.h - o.a.m * 2] : (o.wh || [cs, cs]), s = Math.min(1, cs / Math.max(iw || cs, ih || cs, 1));
                const inRow = Math.min(cols, n - Math.floor(i / cols) * cols), sx = (cols - inRow) * (cs + G) / 2;   // 마지막 줄은 가운데로
                const sc = { cx: cx - S.board.w / 2 + PEL_PAD + sx + (i % cols) * (cs + G) + cs / 2, cy: cy - S.board.h / 2 + PEL_PAD + Math.floor(i / cols) * (cs + G) + cs / 2 };
                o.slot = { cx: sc.cx, cy: sc.cy, w: (iw || cs) * s, h: (ih || cs) * s };   // 🎒 뗀 자국 자리
                if (o.st.state === 'on') Object.assign(o.st, sc, { s, rot: 0 });
            });
            pelKeep();
        }
        /* 🤍 이형지북 모드 : 정한 자리에 한 줄로 (넘치면 옆으로 밀어요) */
        function pelRelLayout() {
            const S = pelS, A = S.rel.at(), it = S.items, n = it.length, G = 10;
            const cs = Math.max(48, Math.min(110, A.height - PEL_PAD * 2)), w = n * cs + (n - 1) * G + PEL_PAD * 2, h = cs + PEL_PAD * 2;
            const cx = w <= A.width ? A.left + A.width / 2 : A.left + w / 2 + S.mv.x, cy = A.top + A.height / 2;
            S.board = { cx, cy, w, h };
            it.forEach((o, i) => {
                const [iw, ih] = o.a ? [o.a.w - o.a.m * 2, o.a.h - o.a.m * 2] : (o.wh || [cs, cs]), sc = Math.min(1, cs / Math.max(iw || cs, ih || cs, 1));
                const p = { cx: cx - w / 2 + PEL_PAD + i * (cs + G) + cs / 2, cy };
                o.slot = { cx: p.cx, cy: p.cy, w: (iw || cs) * sc, h: (ih || cs) * sc };
                if (o.st.state === 'on') Object.assign(o.st, p, { s: sc, rot: 0 });
            });
            S.mv.y = 0; pelKeep();
        }
        /* 하얀 종이 옮기기 : 종이와 종이 위 스티커를 같이 dx · dy 만큼 (화면 밖으로 안 나가게) */
        function pelShift(dx, dy) {
            const S = pelS, B = S.board;
            if (S.rel) {                                                         // 🤍 옆으로만 밀어요 (정한 자리 안에서)
                const A = S.rel.at(); dy = 0;
                if (B.w <= A.width) dx = A.left + A.width / 2 - B.cx;
                else { const L = B.cx - B.w / 2 + dx; if (L > A.left) dx = A.left - (B.cx - B.w / 2); if (L + B.w < A.left + A.width) dx = A.left + A.width - (B.cx + B.w / 2); }
                B.cx += dx; S.mv.x += dx;
                for (const o of S.items) { if (o.st.state === 'on') o.st.cx += dx; if (o.slot) o.slot.cx += dx; }
                return;
            }
            dx = Math.max(B.w / 2 - B.cx, Math.min(S.W - B.w / 2 - B.cx, dx)); dy = Math.max(B.h / 2 - B.cy, Math.min(S.H - B.h / 2 - B.cy, dy));
            if (B.w > S.W) dx = S.W / 2 - B.cx; if (B.h > S.H) dy = S.H / 2 - B.cy;
            B.cx += dx; B.cy += dy; S.mv.x += dx; S.mv.y += dy;
            for (const o of S.items) { if (o.st.state === 'on') { o.st.cx += dx; o.st.cy += dy; } if (o.slot) { o.slot.cx += dx; o.slot.cy += dy; } }
        }
        const pelKeep = () => pelShift(0, 0);
        /* 📱 폰 (화면 폭 700 미만) : 스티커 창 · 하얀 종이 · 페이지가 늘 겹쳐서, 뗀 스티커를 붙일 동안 하얀 종이가 비켜 줘요
           💻 PC · 아이패드는 하얀 종이가 그대로 있어요 (진짜처럼) · 도련 · 2026-10-10 */
        const pelPhone = () => innerWidth < 700;
        const pelLeft = () => pelS.items.filter(o => o.st.state === 'on').length;
        function pelPick(o) { const S = pelS; S.a = o.a; S.st = o.st; S.src = o.src; }

        /* src : 그림 하나 또는 여러 개 [src, …] */
        async function openStickerPeel(src, opt) {                       // opt.ts : 🔤 글씨스티커 (붙인 뒤 📷 사진 꾸미기 창이 안 떠요)
            if (typeof isCoverOpen !== 'undefined' && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return false; }
            const list = Array.isArray(src) ? src : [src], own = (opt && opt.own) || null;
            let imgs;
            try { imgs = await Promise.all(list.map(u => u ? pelLoad(u) : null)); } catch (e) { showMsg('스티커를 열지 못했어요.'); return false; }
            if (!imgs.some(Boolean)) return false;
            pelBuild();
            const S = pelS;
            S.cv = pelq('pelCv'); S.ctx = S.cv.getContext('2d');
            S.items = imgs.map((im, i) => im ? { a: pelAsset(im), src: list[i], st: { state: 'on' } } : { a: null, src: '', st: { state: 'used' }, wh: own && own.wh && own.wh[i] });   // 🎒 null = 이미 쓴 칸
            pelPick(S.items.find(o => o.st.state === 'on'));
            S.rel = (opt && opt.rel) || null; S.relA = null; pelq('pelRoom').classList.toggle('pel-rel', !!S.rel);
            S.own = own; S.ts = !!(opt && opt.ts); S.drag = null; S.gone = 0; S.back = 0; S.mv = { x: 0, y: 0 }; S.on = true;
            pelLayout();
            if (opt && opt.at && S.board && !S.rel) pelShift(opt.at.x - S.board.cx, opt.at.y - S.board.cy);   // 🗂️ 꺼내 둔 종이를 열면 그 자리에서 (basket.js dsOpen)
            pelq('pelRoom').classList.add('show'); document.body.classList.add('fc-lock');
            S.hint = '';
            pelSay(S.rel ? '🪡 핀셋으로 <b>가장자리</b>를 집어 떼어 <b>이형지북</b> 위에 놓아요' : pelLeft() > 1 ? `씰이 <b>${pelLeft()}개</b> 있어요! <b>가장자리</b>를 집어 하나씩 떼어 보세요` : '스티커 <b>가장자리</b>를 손톱으로 집듯이 잡고 천천히 떼어 보세요');
            cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(pelFrame);
            return true;
        }
        function closeStickerPeel() {
            const S = pelS, rel = S.rel; S.on = false; S.drag = null; S.rel = null; pelNoise(0); cancelAnimationFrame(S.raf);
            const r = pelq('pelRoom'); if (r) r.classList.remove('show', 'pel-rel');
            document.body.classList.remove('fc-lock');
            if (rel) { if (rel.close) rel.close(); return; }                     // 🤍 정리 책상은 그대로
            if (window.stkReturn) stkReturn();                                // ✨ 스티커 창에서 왔으면 다시 떠요
        }
        function pelRelayout() { if (pelS.on && pelS.rel) pelLayout(); }       // 🤍 정리 책상 화면이 바뀌면 자리 다시
        function pelSay(h) { const e = pelq('pelHint'); if (!e || pelS.hint === h) return; pelS.hint = h; e.innerHTML = h; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); }

        /* ---------- 좌표 ---------- */
        const pelToStage = (st, lx, ly) => { const c = Math.cos(st.rot), s = Math.sin(st.rot); return [st.cx + (lx * c - ly * s) * st.s, st.cy + (lx * s + ly * c) * st.s]; };
        const pelToLocal = (st, x, y) => { const dx = (x - st.cx) / st.s, dy = (y - st.cy) / st.s, c = Math.cos(-st.rot), s = Math.sin(-st.rot); return [dx * c - dy * s, dx * s + dy * c]; };

        /* ---------- 그리기 ---------- */
        function pelDraw(ctx, img, st, extra = 1, flip = 1, sh = null) {
            ctx.save();
            if (sh) { ctx.shadowColor = sh.c; ctx.shadowBlur = sh.b; ctx.shadowOffsetY = sh.y; ctx.shadowOffsetX = sh.x || 0; }
            ctx.translate(st.cx, st.cy); ctx.rotate(st.rot); ctx.scale(st.s * extra * flip, st.s * extra);
            ctx.drawImage(img, -img.width / 2, -img.height / 2); ctx.restore();
        }
        function pelHalf(c, M, n, sign) {
            const p = [-n[1], n[0]], L = 4000; c.beginPath();
            c.moveTo(M[0] + p[0] * L, M[1] + p[1] * L); c.lineTo(M[0] - p[0] * L, M[1] - p[1] * L);
            c.lineTo(M[0] - p[0] * L + n[0] * L * sign, M[1] - p[1] * L + n[1] * L * sign); c.lineTo(M[0] + p[0] * L + n[0] * L * sign, M[1] + p[1] * L + n[1] * L * sign); c.closePath();
        }
        const PEL_FLAT = { c: 'rgba(90,60,70,.12)', b: 2, y: 1 }, PEL_UP = { c: 'rgba(80,50,60,.25)', b: 18, y: 12 };
        /* 잡은 점(C)과 손가락(F) 사이를 접는 선으로, 들린 쪽은 뒤집어 뒷면을 그려요 (씰스티커 R&D 와 같은 방법) */
        function pelDrawPeel(ctx, o, C, F) {
            const S = pelS, a = o.a, st = o.st, base = PEL_FLAT;
            const dx = F[0] - C[0], dy = F[1] - C[1], len = Math.hypot(dx, dy);
            if (len < .5) { pelDraw(ctx, a.front, st, 1, 1, base); return; }
            const n = [dx / len, dy / len], M = [(C[0] + F[0]) / 2, (C[1] + F[1]) / 2];
            ctx.save(); pelHalf(ctx, M, n, 1); ctx.clip(); pelDraw(ctx, a.front, st, 1, 1, base); ctx.restore();
            const md = M[0] * n[0] + M[1] * n[1];
            const A = 1 - 2 * n[0] * n[0], B = -2 * n[0] * n[1], D = 1 - 2 * n[1] * n[1], E = 2 * md * n[0], Fv = 2 * md * n[1], R = S.DPR;
            const L = S.fl.getContext('2d'); L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, S.fl.width, S.fl.height);
            L.setTransform(R * A, R * B, R * B, R * D, R * E, R * Fv);
            L.save(); pelHalf(L, M, n, -1); L.clip();
            L.translate(st.cx, st.cy); L.rotate(st.rot); L.scale(st.s, st.s); L.drawImage(a.back, -a.w / 2, -a.h / 2, a.w, a.h); L.restore();
            L.setTransform(R, 0, 0, R, 0, 0); L.globalCompositeOperation = 'source-atop';                               // 말린 느낌 음영
            const span = Math.max(20, len / 2), g = L.createLinearGradient(M[0], M[1], M[0] + n[0] * span, M[1] + n[1] * span);
            g.addColorStop(0, 'rgba(110,80,90,.35)'); g.addColorStop(.18, 'rgba(255,255,255,.25)'); g.addColorStop(.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(150,120,130,.15)');
            L.fillStyle = g; L.fillRect(0, 0, S.W, S.H); L.globalCompositeOperation = 'source-over';
            ctx.save(); ctx.shadowColor = 'rgba(80,50,60,.28)'; ctx.shadowBlur = 10 + Math.min(14, len / 12); ctx.shadowOffsetX = n[0] * 4; ctx.shadowOffsetY = 4 + n[1] * 3;
            ctx.drawImage(S.fl, 0, 0, S.W, S.H); ctx.restore();
        }
        function pelRR(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
        function pelFrame(t) {
            const S = pelS; if (!S.on) return;
            if (S.rel) {                                                         // 🤍 정리 책상 : 창이 닫혔으면 같이 닫고 · 자리가 움직였으면 따라가요
                if (S.rel.alive && !S.rel.alive()) { closeStickerPeel(); return; }
                if (!S.drag || S.drag.mode === 'win') { const A = S.rel.at(), o = S.relA; if (!o || Math.abs(A.top - o.top) > .5 || Math.abs(A.left - o.left) > .5 || Math.abs(A.width - o.width) > .5) { S.relA = { top: A.top, left: A.left, width: A.width }; pelLayout(); } }
            }
            const ctx = S.ctx, st = S.st, a = S.a;
            ctx.setTransform(S.DPR, 0, 0, S.DPR, 0, 0); ctx.clearRect(0, 0, S.W, S.H);
            const bo = S.gone ? Math.max(0, 1 - (t - S.gone) / 260)              // 마지막 스티커를 떼어 내면 스르르 사라져요 (📱 폰은 뗄 때마다)
                : S.back ? Math.min(1, (t - S.back) / 260) : 1;                  // 📱 붙이고 나면 남은 스티커와 같이 다시 스르르
            if (bo > 0 && !S.rel) { ctx.save(); ctx.globalAlpha = bo; ctx.fillStyle = 'rgba(90,60,70,.10)'; ctx.fillRect(0, 0, S.W, S.H); ctx.restore(); }   // 어둡게 깔기 (🤍 정리 책상은 안 깔아요)
            if (S.rel) { const A = S.rel.at(); ctx.save(); ctx.beginPath(); ctx.rect(A.left, A.top - 6, A.width, A.height + 12); ctx.clip(); }   // 🤍 종이는 정한 자리 안에서만 보여요 (옆으로 밀어 넘겨요)
            if (bo > 0) {                                                        // 🏷️ 하얀 네모 (스티커 종이)
                const B = S.board, bx = B.cx - B.w / 2, by = B.cy - B.h / 2;
                ctx.save(); ctx.globalAlpha = bo; ctx.shadowColor = 'rgba(120,80,95,.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
                pelRR(ctx, bx, by, B.w, B.h, 14); const g = ctx.createLinearGradient(bx, by, bx + B.w, by + B.h);
                g.addColorStop(0, '#fdfdff'); g.addColorStop(.5, '#f4f6fb'); g.addColorStop(1, '#fbfcff'); ctx.fillStyle = g; ctx.fill(); ctx.restore();
            }
            if (bo > 0 && S.items.length > 1 && !S.rel) { ctx.save(); ctx.globalAlpha = bo; pelDrawTape(ctx); ctx.restore(); }   // 여러 개 씰 종이 : 위쪽 '✋ 잡고 옮겨요'
            const bx = pelq('pelX');                                             // ✕ : 하얀 종이 오른쪽 위 끝 (모조지스티커처럼 · 종이를 따라 다녀요)
            if (bx) { const B = S.rel ? (A => ({ cx: A.left + A.width / 2, w: A.width, cy: A.top + A.height / 2, h: A.height }))(S.rel.at()) : S.board; bx.style.left = (B.cx + B.w / 2 - 26) + 'px'; bx.style.top = (B.cy - B.h / 2) + 'px'; bx.style.opacity = bo; bx.style.visibility = bo > 0 ? '' : 'hidden'; }
            const d = S.drag, cur = S.items.find(o => o.st === st);
            if (bo > 0) for (const o of S.items) if (o.st.state !== 'on' && o.slot) pelResidue(ctx, o.slot, bo);   // 🎒 뗀 자국 (빈 자리)
            for (const o of S.items) {                                           // 종이 위에 남은 스티커들 (잡은 건 맨 위에)
                if (o.st.state !== 'on') continue;
                if (o === cur && ((d && d.mode === 'peel') || o.st.snap)) continue;
                if (bo < 1) { if (bo <= 0) continue; ctx.save(); ctx.globalAlpha = bo; }
                if (o.st.snap) pelSnap(ctx, o, t); else pelDraw(ctx, o.a.front, o.st, 1, 1, PEL_FLAT);
                if (bo < 1) ctx.restore();
            }
            if (S.rel) ctx.restore();
            if (cur && d && d.mode === 'peel') pelDrawPeel(ctx, cur, d.C, d.F);
            else if (cur && st.state === 'on' && st.snap) pelSnap(ctx, cur, t);
            else if (cur && st.state === 'free') {
                pelGrow(t);
                const fp = Math.min(1, (t - st.t0) / 220), flip = Math.cos(Math.PI * (1 - fp));                // 뒷면 → 앞면으로 뒤집혀요
                pelDraw(ctx, flip < 0 ? a.back : a.front, st, 1.07, Math.max(.05, Math.abs(flip)) * (flip < 0 ? -1 : 1), PEL_UP);
            }
            S.raf = requestAnimationFrame(pelFrame);
        }
        /* 🎒 뗀 자국 : 스티커가 있던 자리에 살짝 끈적한 흔적만 */
        function pelResidue(ctx, sl, bo) {
            ctx.save(); ctx.globalAlpha = bo * .9;
            pelRR(ctx, sl.cx - sl.w / 2, sl.cy - sl.h / 2, sl.w, sl.h, Math.min(14, sl.w / 4, sl.h / 4));
            ctx.fillStyle = 'rgba(214,206,222,.30)'; ctx.fill();
            ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(190,178,200,.55)'; ctx.stroke();
            ctx.restore();
        }
        /* 덜 떼다 놓으면 제자리로 착 붙어요 */
        function pelSnap(ctx, o, t) {
            const sn = o.st.snap, q = Math.min(1, (t - sn.t0) / 260), e = 1 - Math.pow(1 - q, 3);
            pelDrawPeel(ctx, o, sn.C, [sn.F[0] + (sn.C[0] - sn.F[0]) * e, sn.F[1] + (sn.C[1] - sn.F[1]) * e]);
            if (q >= 1) o.st.snap = null;
        }

        /* ---------- 손가락 ---------- */
        function pelPeeled(st, C, F) {
            const dx = F[0] - C[0], dy = F[1] - C[1], len = Math.hypot(dx, dy); if (len < 1) return 0;
            const n = [dx / len, dy / len], M = [(C[0] + F[0]) / 2, (C[1] + F[1]) / 2]; let off = 0;
            for (const [lx, ly] of pelS.a.edge) { const [x, y] = pelToStage(st, lx, ly); if ((x - M[0]) * n[0] + (y - M[1]) * n[1] < 0) off++; }
            return off / pelS.a.edge.length;
        }
        /* ✋ 잡고 옮겨요 테이프 (여러 개 씰 종이 위쪽 가운데) : 잡고 끌면 하얀 종이째 옮겨요 */
        function pelTape() { const B = pelS.board, w = 112, h = 24; return { x: B.cx - w / 2, y: B.cy - B.h / 2 - h / 2 - 2, w, h }; }
        function pelDrawTape(c) {
            const t = pelTape(); c.save(); c.translate(t.x + t.w / 2, t.y + t.h / 2); c.rotate(-.03);
            const w = t.w / 2, h = t.h / 2; c.beginPath(); c.moveTo(-w, -h);
            for (let i = 0; i <= 6; i++) c.lineTo(w - (i % 2) * 4, -h + i * t.h / 6);
            for (let i = 0; i <= 6; i++) c.lineTo(-w + ((i + 1) % 2) * 4, h - i * t.h / 6);
            c.closePath(); c.shadowColor = 'rgba(90,60,70,.18)'; c.shadowBlur = 3; c.shadowOffsetY = 1;
            c.fillStyle = 'rgba(255,198,214,.92)'; c.fill(); c.shadowBlur = 0; c.shadowOffsetY = 0;
            c.fillStyle = 'rgba(255,255,255,.35)'; for (let x = -w + 8; x < w - 4; x += 12) c.fillRect(x, -h, 5, t.h);
            c.fillStyle = '#9b5a6e'; c.font = "700 12px 'Jua', sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('✋ 잡고 옮겨요', 0, 1);
            c.restore();
        }
        function pelDown(e) {
            const S = pelS; if (!S.on || S.drag || S.st.state === 'free') return;
            e.preventDefault(); const P = [e.clientX, e.clientY];
            if (S.items.length > 1 && S.board && !S.gone && !S.rel) {          // ✋ 테이프를 잡으면 종이 옮기기
                const t = pelTape();
                if (P[0] > t.x - 8 && P[0] < t.x + t.w + 8 && P[1] > t.y - 8 && P[1] < t.y + t.h + 8) {
                    S.drag = { mode: 'board', last: P, lt: performance.now() };
                    try { S.cv.setPointerCapture(e.pointerId); } catch (er) {}
                    pelSay('씰 종이를 옮기는 중… ✋'); return;
                }
            }
            let best = 1e12, bp = null, bo = null, hit = null;                   // 손가락에서 가장 가까운 스티커 가장자리
            for (const o of S.items) {
                if (o.st.state !== 'on') continue;
                const [lx, ly] = pelToLocal(o.st, P[0], P[1]);
                for (const q of o.a.edge) { const dd = ((q[0] - lx) ** 2 + (q[1] - ly) ** 2) * o.st.s * o.st.s; if (dd < best) { best = dd; bp = q; bo = o; } }
                if (!hit && o.a.alpha(lx, ly) > 128) hit = o;
            }
            /* 스티커 안쪽 가장자리는 넉넉히(PEL_GRAB) · 바깥(종이 빈 곳)은 조금만(PEL_GRAB_OUT) → 나머지 빈 곳은 종이 옮기기 */
            if (bp && Math.sqrt(best) < (hit === bo ? PEL_GRAB : PEL_GRAB_OUT)) {
                if (window.gdTwz && !gdTwz()) { if (window.twzSay) twzSay(P[0], P[1]); return; }   // 🪡 하얀 창에서 떼기는 핀셋으로 (도련 10-21)
                pelPick(bo); const st = S.st, C = pelToStage(st, bp[0], bp[1]); st.snap = null;
                S.drag = { mode: 'peel', C, F: C.slice(), start: P, last: P, lt: performance.now() };
                try { S.cv.setPointerCapture(e.pointerId); } catch (er) {}
                pelSay('살살… 천천히 당겨요'); return;
            }
            if (hit) { pelSay('가운데 말고 <b>가장자리</b>를 집어야 떨어져요'); pelWiggle(hit.st); return; }
            const B = S.board;                                                   // 하얀 종이 빈 곳 → 종이 옮기기
            if (B && Math.abs(P[0] - B.cx) <= B.w / 2 && Math.abs(P[1] - B.cy) <= B.h / 2) {
                S.drag = { mode: 'board', last: P, lt: performance.now() };
                try { S.cv.setPointerCapture(e.pointerId); } catch (er) {}
                return;
            }
            if (S.rel) {                                                         // 🤍 종이 밖 = 그 아래 버튼 (쪽 넘기기 · 다른 종이 고르기 …)
                const room = pelq('pelRoom'), hid = [room, S.cv, ...room.children];
                hid.forEach(el => { el.dataset.pe = el.style.pointerEvents; el.style.pointerEvents = 'none'; });
                const under = document.elementFromPoint(P[0], P[1]);
                hid.forEach(el => { el.style.pointerEvents = el.dataset.pe || ''; delete el.dataset.pe; });
                const ri = under && under.closest('#abRel .ab-it');
                if (ri && window.abItGrab) { abItGrab(ri, e); return; }       // ✋ 이형지에 놓은 스티커 = 자리 옮기기 (js/basket.js)
                const sc = under && under.closest('.ab-sc');
                if (sc && window.abTapSheet) { abTapSheet(sc.dataset.id); return; }   // 위 줄의 다른 종이
                const tt = under && !under.closest('button') && under.closest('.modal-title'), box = tt && tt.closest('.modal-content');
                if (box) {                                                       // ✋ 창 제목 줄 = 창 옮기기 (떼는 판이 떠 있어도 · 도련 10-25 · js/skins.js setupSkinWindows 와 같게)
                    S.drag = { mode: 'win', box, last: P, x: P[0], y: P[1], ox: parseFloat(box.style.left) || 0, oy: parseFloat(box.style.top) || 0 };
                    try { S.cv.setPointerCapture(e.pointerId); } catch (er) {}
                    return;
                }
                const btn = under && under.closest('button, input, label');
                if (btn) { if (btn.matches('input')) btn.focus(); else btn.click(); }
                return;
            }
            if (window.pgmOnBar && pgmOnBar(P[0], P[1])) pgmBegin(e);                // 종이 바깥 날짜바 위 → 페이지 옮기기 (js/page.js)
        }
        function pelMove(e) {
            const S = pelS, d = S.drag; if (!d) return;
            const P = [e.clientX, e.clientY], now = performance.now();
            if (P[0] === d.last[0] && P[1] === d.last[1]) return;              // ✏️ 펜슬은 제자리에서 누르는 힘만 바뀌어도 움직임이 와요 → 무시 (소리가 끊기지 않게)
            if (d.mode === 'board') { pelShift(P[0] - d.last[0], P[1] - d.last[1]); d.last = P; return; }
            if (d.mode === 'win') {                                              // ✋ 창 옮기기 (화면 밖으로는 못 나가요)
                const b = d.box, r = b.getBoundingClientRect(), px = parseFloat(b.style.left) || 0, py = parseFloat(b.style.top) || 0, bl = r.left - px, bt = r.top - py;
                b.style.position = 'relative';
                b.style.left = Math.max(-bl, Math.min(Math.max(-bl, innerWidth - r.width - bl), d.ox + P[0] - d.x)) + 'px';
                b.style.top = Math.max(-bt, Math.min(Math.max(-bt, innerHeight - r.height - bt), d.oy + P[1] - d.y)) + 'px';
                b.dispatchEvent(new Event('dk-move')); d.last = P; return;
            }
            const sp = Math.hypot(P[0] - d.last[0], P[1] - d.last[1]) / Math.max(1, now - d.lt); d.last = P; d.lt = now;
            if (d.mode === 'peel') {
                const dx = P[0] - d.start[0], dy = P[1] - d.start[1], k = Math.min(1, .45 + Math.hypot(dx, dy) / 220);   // 끈적임
                d.F = [d.C[0] + dx * k, d.C[1] + dy * k];
                pelNoise(Math.min(.35, sp * .25));
                const fr = pelPeeled(S.st, d.C, d.F);
                if (fr > .55 && !d.half) { d.half = 1; pelSay('거의 다 됐어요… 조금만 더!'); }
                if (fr >= .78) pelDetach(P);
            } else {
                const st = S.st, nx = P[0] - d.off[0], ny = P[1] - d.off[1];
                st.rot = Math.max(-.35, Math.min(.35, st.rot + (nx - st.cx) * .004 - (st.rot - d.baseRot) * .08)); st.cx = nx; st.cy = ny;
            }
        }
        function pelDetach(P) {
            const S = pelS, st = S.st, d = S.drag, [lx, ly] = pelToLocal(st, d.C[0], d.C[1]);
            st.state = 'free'; st.t0 = performance.now();
            if (!S.rel && (!pelLeft() || pelPhone())) { S.gone = performance.now(); S.back = 0; }   // 마지막 스티커면 하얀 종이도 사라져요 · 📱 폰은 페이지가 가려서 뗄 때마다 비켜 줘요
            const [gx, gy] = pelToStage(st, lx, ly);
            S.drag = { mode: 'free', off: [gx - st.cx, gy - st.cy], baseRot: st.rot, last: P, lt: performance.now() };
            st.cx = P[0] - S.drag.off[0]; st.cy = P[1] - S.drag.off[1];
            const pg = pelPage(), pr = pg && pg.getBoundingClientRect();                  // 📏 하얀 종이에서 완전히 떨어지는 순간 진짜 크기로 (페이지 배율 · 도련 · 10-18)
            if (pr && pr.width && !S.rel) st.grow = { goal: pr.width / (pg.offsetWidth || pr.width), s0: st.s, t0: performance.now(), off: S.drag.off.slice() };
            pelNoise(0); if (navigator.vibrate) navigator.vibrate(15);
            pelSay(S.rel ? '톡! 떼어졌어요 ✨ <b>이형지북</b> 위에 놓아요' : '톡! 떼어졌어요 ✨ 원하는 곳에 놓아 보세요');
        }
        /* 📏 진짜 크기로 스르르 (잡은 자리는 손가락 끝 그대로) */
        function pelGrow(t) {
            const S = pelS, st = S.st, g = st.grow; if (!g) return;
            const k = Math.min(1, (t - g.t0) / 240), e = 1 - Math.pow(1 - k, 3);
            st.s = g.s0 + (g.goal - g.s0) * e;
            const d = S.drag; if (d && d.mode === 'free') { const z = st.s / g.s0; d.off = [g.off[0] * z, g.off[1] * z]; st.cx = d.last[0] - d.off[0]; st.cy = d.last[1] - d.off[1]; }
            if (k >= 1) st.grow = null;
        }
        function pelUp() {
            const S = pelS, d = S.drag; if (!d) return;
            if (d.mode === 'win') { S.drag = null; return; }
            const st = S.st; pelNoise(0); S.drag = null;
            if (st.grow) { st.s = st.grow.goal; st.grow = null; }                    // 다 커지기 전에 놓으면 진짜 크기로
            if (d.mode === 'board') return;
            if (d.mode === 'peel') {
                st.snap = { C: d.C, F: d.F, t0: performance.now() };
                if (Math.hypot(d.F[0] - d.C[0], d.F[1] - d.C[1]) > 20) pelSay('앗, 다시 붙어버렸어요 🫣 가장자리를 잡고 다시 떼어 보세요');
                return;
            }
            if (navigator.vibrate) navigator.vibrate(8);
            if (S.rel) pelRelDrop(); else pelStick();
        }
        /* 🤍 이형지북 위에 놓으면 그 자리에 · 밖이면 종이로 돌아가요 */
        function pelRelDrop() {
            const S = pelS, st = S.st, k = S.items.findIndex(o => o.st === st), R0 = S.rel.target();
            if (!R0 || st.cx < R0.left || st.cx > R0.right || st.cy < R0.top || st.cy > R0.bottom) {
                st.state = 'on'; st.snap = null; pelLayout();
                S.hint = ''; pelSay('🤍 <b>이형지북</b> 위에 놓아야 붙어요'); return;
            }
            st.state = 'done';
            S.rel.drop(k, { x: (st.cx - R0.left) / R0.width, y: (st.cy - R0.top) / R0.height, r: Math.round(st.rot * 180 / Math.PI) });
            const left = S.items.filter(o => o.st.state === 'on');
            if (!left.length) { closeStickerPeel(); return; }
            pelPick(left[0]); pelLayout();
            S.hint = ''; pelSay(`붙었어요 ✨ 종이에 <b>${left.length}개</b> 남았어요`);
        }
        function pelWiggle(st) { const r = st.rot, t0 = performance.now(); (function w() { const q = (performance.now() - t0) / 300; st.rot = r + Math.sin(q * Math.PI * 4) * .04 * (1 - q); if (q < 1) requestAnimationFrame(w); else st.rot = r; })(); }

        /* 놓은 자리에 붙이기 : 화면에 보이던 크기 · 기울기 그대로 페이지에 붙어요 */
        function pelStick() {
            const S = pelS, st = S.st, a = S.a, pg = pelPage();
            const r = pg.getBoundingClientRect(), k = r.width / (pg.offsetWidth || r.width) || 1;
            const cx = Math.min(r.right, Math.max(r.left, st.cx)), cy = Math.min(r.bottom, Math.max(r.top, st.cy));
            if (!addImage(S.src)) { closeStickerPeel(); return; }
            const el = pg.querySelector('.element-box:last-child');
            if (el && S.ts) el.dataset.ts = 1;
            if (el) {
                const w = (a.w - a.m * 2) * st.s / k, h = (a.h - a.m * 2) * st.s / k, PADB = 14;     // .element-box 안쪽 여백 6px · 테두리 1px (양쪽)
                const deg = Math.round(st.rot * 180 / Math.PI * 10) / 10;
                const put = (px, py) => { el.dataset.posX = px; el.dataset.posY = py; el.style.transform = `translate(${px}px, ${py}px) scale(1) rotate(${deg}deg)`; };
                el.style.width = w + 'px'; el.style.height = h + 'px'; el.dataset.rotation = deg;
                if (window.elOrig) elOrig(el);                                    // 🖼️ 원본 크기로 (js/elements.js)
                const x = Math.round((cx - r.left) / k - (w + PADB) / 2), y = Math.round((cy - r.top) / k - (h + PADB) / 2);
                put(x, y);
                const b = el.getBoundingClientRect();                                  // 페이지 안 다른 것들 때문에 생기는 차이까지 맞춰요
                put(Math.round(x + (cx - (b.left + b.width / 2)) / k), Math.round(y + (cy - (b.top + b.height / 2)) / k));
            }
            st.state = 'done';
            if (typeof saveData === 'function') saveData(false);
            if (S.own && el && window.ownUse) {                                  // 🎒 붙어서 저장된 순간 그 칸은 영원히 사라져요 (js/own.js)
                const k = S.items.findIndex(o => o.st === st);
                el.dataset.own = S.own.id + ':' + k;
                ownUse(S.own.id, k, el).catch(e => console.warn('스티커 칸을 아직 못 지웠어요 (다시 해요) :', e));
            }
            const left = S.items.filter(o => o.st.state === 'on');
            if (!left.length) { closeStickerPeel(); return; }
            if (S.gone) { S.gone = 0; S.back = performance.now(); }              // 📱 하얀 종이가 남은 스티커와 다시 나타나요
            pelPick(left[0]);                                                    // 종이에 남은 스티커는 계속 떼어 붙여요
            S.hint = ''; pelSay(`붙었어요 ✨ 종이에 <b>${left.length}개</b> 남았어요`);
        }

        /* ---------- 소리 : 🏷️ 씰을 떼어 낼 때 '찌익'만 ---------- */
        let pelGain = null;
        function pelNoise(v) {
            if (!pelGain && !v) return;
            const ac = typeof sndFx === 'function' ? sndFx() : null;
            if (!ac) { if (pelGain) pelGain.gain.value = 0; return; }
            if (!pelGain) {
                const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < .3 ? 1 : .3);
                const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
                const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = .7;
                pelGain = ac.createGain(); pelGain.gain.value = 0; src.connect(bp).connect(pelGain).connect(sndOut()); src.start();
            }
            pelGain.gain.setTargetAtTime(v, ac.currentTime, .03);
        }

        window.openStickerPeel = openStickerPeel; window.pelBake = pelBake; window.closeStickerPeel = closeStickerPeel; window.pelRelayout = pelRelayout;
