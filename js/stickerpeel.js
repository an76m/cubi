/* 말랑달콤 다이어리 - js/stickerpeel.js
   🔕 떼는 창 위 안내 글(pelSay · #pelHint)은 없앴어요 (도련 11-13 : 뗄 때 화면 위 메세지 영구 삭제)
   🏷️ 씰스티커 떼어 붙이기 : 내스티커에서 고르거나 만들기에서 📌 붙이기를 누르면 페이지 앞에 스티커가 나와요 (🧩 조각스티커는 봉투 연출 js/piecebag.js)
   - 🏷️ 씰 : 하얀 네모(스티커 종이) 위에 씰이 있어요 → 가장자리를 잡고 떼어 원하는 곳에 놓으면 붙어요
             종이는 배경(화면) 한가운데에 나와요 · 사진고르기로 여러 장을 고르면 한 장의 종이에 씰이 여러 개 붙어 나와요 → 마지막 씰을 떼면 하얀 종이가 사라져요
             하얀 종이의 빈 곳을 누른 채 끌면 종이째 화면 안에서 옮겨져요 · 종이 바깥은 페이지 그대로 눌려요 (핀셋으로 붙인 스티커 옮기기 · 돌리기 · 날짜바 · 펜꽂이 · 도련 11-05 : 손가락은 #pelHit 만 받아요)
             소리 : 떼어 낼 때 '찌익' 소리만
   - pelBake(src) : 📸 포토부스 사진처럼 네모난 그림 둘레에 하얀 칼선 테두리를 둘러요 (원본 크기 그대로 PNG)
                    ⚙ 설정 '🏷️ 씰 하얀 테두리'가 꺼져 있으면(기본) 테두리 없이 크기만 맞춰요 (js/show.js showOn('die'))
   - 소리는 ⚙ 설정의 '✨ 연출 소리'를 따라요 (js/sound.js)
   - 🎒 유한 스티커 (10-25) : opt.own = { id, wh, gh, raw } 로 열면 내 종이 (js/own.js) · 그림 자리가 null 이면 이미 쓴 칸 → 뗀 자국만 보여요
     붙어서 저장되는 순간 ownUse(종이, 칸) → 그 칸은 영원히 사라져요 · 페이지 요소에 data-own = '종이:칸'
   - 🤍 이형지북 모드 (10-25 · opt.rel) : 정리 책상에서 종이를 고르면 그 자리(rel.at)에 한 줄로 나와요 (옆으로 밀어 넘겨요)
     핀셋으로 떼어 이형지북(rel.target) 위에 놓으면 rel.drop(칸, { x, y, r }) · 이형지북 밖에 놓으면 종이로 돌아가요 · 종이 밖을 누르면 그 아래 버튼이 눌려요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (스티커가 바로 붙어요) */

        const PEL_GRAB = 28, PEL_GRAB_OUT = 10, PEL_PAD = 22, PEL_M = 7, PEL_EDGE = 6;
        /* items : 종이 위 스티커들 [{ a, src, st }] · a · st · src 는 지금 손에 잡은 스티커 */
        const pelS = { on: false, cv: null, ctx: null, fl: null, items: [], a: null, st: null, drag: null, board: null, mv: { x: 0, y: 0 }, gone: 0, src: '', W: 0, H: 0, DPR: 1, raf: 0 };
        const pelq = id => document.getElementById(id);
        const pelMk = stkMk, pelLoad = src => stkLoad(src);                  // 🏷️ 스티커 엔진 (js/sticker.js)
        const pelTint = tintCanvas;   // 🧰 js/util.js

        /* ---------- 하얀 칼선 테두리 두르기 ---------- */
        async function pelBake(src) {
            const im = await pelLoad(src);
            const iw = im.width, ih = im.height;                               // 🖼️ 원본 크기 그대로 (줄이지 않아요)
            const die = typeof showOn !== 'function' || showOn('die');
            let sv = ''; try { sv = await pelSvgText(src); } catch (e) { }
            if (sv && /<svg/i.test(sv) && sv !== '<svg') {                      // 🎬 SVG 스티커 = 그림으로 굽지 않아요 (굽으면 멈춰요 · 손글씨 하트처럼 첫 장면이 비면 안 보여요 · 도련 11-19 1329) · 하얀 테두리도 svg 필터로
                if (!die) return src;
                const b = PEL_EDGE + 2, W = iw + b * 2, H = ih + b * 2, body = sv.replace(/^\s*<\?xml[^>]*>\s*/i, '').replace(/^\s*<!DOCTYPE[^>]*>\s*/i, ''), tag = (body.match(/<svg\b[^>]*>/i) || [''])[0];
                const nt = tag.replace(/\s(width|height|x|y)\s*=\s*("[^"]*"|'[^']*')/gi, '').replace(/<svg\b/i, `<svg x="${b}" y="${b}" width="${iw}" height="${ih}"${/viewBox\s*=/i.test(tag) ? '' : ` viewBox="0 0 ${iw} ${ih}"`}`), inner = body.replace(tag, nt);
                const out = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><filter id="peldie" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feMorphology in="SourceAlpha" operator="dilate" radius="${PEL_EDGE}" result="r"/><feFlood flood-color="#fff"/><feComposite in2="r" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#peldie)">${inner}</g></svg>`;
                return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(out);
            }
            const b = die ? PEL_EDGE + 2 : 0, c = pelMk(iw + b * 2, ih + b * 2), x = c.getContext('2d');   // 테두리를 끄면 그림 크기 그대로
            const one = pelMk(c.width, c.height); one.getContext('2d').drawImage(im, b, b, iw, ih);
            if (die) x.drawImage(pelTint(stkGrow(pelTint(one, '#fff'), PEL_EDGE, 10), '#fff'), 0, 0);
            x.drawImage(one, 0, 0);
            return cvSmall(c);                                                 // 🗜 크롬 WebP 0.9 · 사파리 PNG (elements.js · 도련 11-04)
        }

        /* ---------- 떼기용 그림 (앞면 · 뒷면 · 가장자리 점) ---------- */
        const pelAsset = img => stkAsset(img, PEL_M);                        // 🧩 그림 재료 = 스티커 엔진 (js/sticker.js)

        /* ---------- 화면 ---------- */
        function pelBuild() {
            stkRoom({ id: 'pelRoom', cls: 'pel-room', hit: 'pelHit', down: pelDown, move: pelMove, up: pelUp, resize: () => { if (pelS.on) pelLayout(); },   // 🪟 종이 화면 = 스티커 엔진 · 👆 손가락은 종이 자리(pelHit)만 · 그 밖은 페이지 그대로 (도련 11-05)
                html: `<canvas id="pelCv"></canvas><div class="pel-live" id="pelLive"></div><div class="pel-hit" id="pelHit"></div><button type="button" class="pel-x pel-bx win-x" id="pelX" onclick="closeStickerPeel()" aria-label="축소" title="축소">축소</button>` });
        }
        const pelPage = () => document.getElementById('canvasArea');
        /* 📔 붙일 페이지가 보여요 (덮였거나 🪑 책상에 놓여 있으면 아니에요 → 종이 크기는 보통 크기 · 뗀 스티커는 종이로 돌아가요) */
        const pelPageOn = () => { const pg = pelPage(), H = document.documentElement; return !!pg && isCoverOpen && !(UI.desk() && !H.classList.contains('desk-show')) && pg.getBoundingClientRect().width > 40; };
        function pelLayout() {
            const S = pelS;
            stkScreen(S, true);
            /* 배경(화면) 가운데 하얀 종이 한 장 (크기는 페이지에 맞춰요) : 한 장이면 그 크기, 여러 장이면 칸을 나눠 나란히 */
            const pg = pelPageOn() ? pelPage() : null, r = pg ? pg.getBoundingClientRect() : { left: 0, top: 0, width: Math.min(S.W, 1100), height: S.H };
            if (S.rel) return pelRelLayout();
            let cx = S.W / 2, cy = S.H / 2;
            cx += S.mv.x; cy += S.mv.y;                                          // 종이를 옮긴 만큼
            const it = S.items, n = it.length, pw = Math.min(r.width, S.W);
            if (S.L) {                                                          // 🗺️ 시트 그대로 : A6 시트 세로 148mm = 644px × 실제 크기 비율 (페이지가 보이는 크기 그대로 · 화면에 안 들어가면 같이 줄여요)
                const pk = pg && pg.offsetWidth ? r.width / pg.offsetWidth : 1, H0 = PEL_SHEET_H * pk * (window.dyImgK ? dyImgK() : 1),   /* 📏 시트도 실제 크기 비율 */ fit = Math.min(1, S.W * .94 / (H0 * S.L.r), (S.H - 40) * .94 / H0);
                pelLaySheet(cx, cy, H0 * fit, pk * fit); return pelKeep();
            }
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
        /* 🗺️ 시트 한 장 배치 그대로 (L.b = 그림마다 [x, y, w, h] 시트 대비 0~1) : 흰 종이 BH 높이 · 스티커 s 배 */
        const PEL_SHEET_H = 644;                                             // A6 시트 세로 148mm = 644px (스티커 그림 기준 · 도구/스티커정리/4_시트그대로.py 와 같아요 · 띄울 때 × dyImgK)
        function pelLaySheet(cx, cy, BH, s) {
            const S = pelS, BW = BH * S.L.r;
            S.board = { cx, cy, w: BW, h: BH, sheet: 1 };
            S.items.forEach((o, i) => {
                const b = S.L.b[i], p = { cx: cx - BW / 2 + (b[0] + b[2] / 2) * BW, cy: cy - BH / 2 + (b[1] + b[3] / 2) * BH };
                const [iw, ih] = o.a ? [o.a.w - o.a.m * 2, o.a.h - o.a.m * 2] : (o.wh || [b[2] * BW / s, b[3] * BH / s]);
                const sc = o.a ? Math.min(b[2] * BW / iw, b[3] * BH / ih) : s;   // 자리 칸에 꼭 맞게 (반올림 차이까지)
                o.slot = { cx: p.cx, cy: p.cy, w: iw * sc, h: ih * sc };
                if (o.st.state === 'on') Object.assign(o.st, p, { s: sc, rot: 0 });
            });
        }
        /* 🤍 이형지북 모드 : 정한 자리에 한 줄로 (넘치면 옆으로 밀어요) */
        function pelRelLayout() {
            const S = pelS, A = S.rel.at(), it = S.items, n = it.length, G = 10;
            if (A.height >= 220 && S.L) {                                       // 🗺️ 매트 위에도 시트 그대로 (이형지북에 붙을 크기 · 매트에 안 들어가면 같이 줄여요)
                const rk = (S.rel.scale && S.rel.scale()) || 1, H0 = PEL_SHEET_H * rk, fit = Math.min(1, (A.width - 8) / (H0 * S.L.r), (A.height - 8) / H0);
                S.mv.x = 0; S.mv.y = 0; pelLaySheet(A.left + A.width / 2, A.top + A.height / 2, H0 * fit, rk * fit); return pelKeep();
            }
            if (A.height >= 220) {                                              // 🟩 넓은 매트 (정리 공간 · 도련 10-29) : 종이를 크게 펼쳐요 (칸이 가장 커지게 줄을 나눠서)
                let best = null;
                for (let c = 1; c <= n; c++) { const r = Math.ceil(n / c), cs = Math.min((A.width - PEL_PAD * 2 - (c - 1) * G) / c, (A.height - PEL_PAD * 2 - (r - 1) * G) / r); if (!best || cs > best.cs) best = { c, r, cs }; }
                const rk = (S.rel.scale && S.rel.scale()) || 0;                  // 🤍 이형지북 배율 (다이어리 페이지 → 이형지북 페이지 · js/basket.js) · 매트에도 붙을 크기 그대로
                const nat = it.map(o => o.a ? Math.max(o.a.w - o.a.m * 2, o.a.h - o.a.m * 2) : Math.max(...(o.wh || [54, 54]), 1)), need = rk ? Math.max(...nat) * rk : 200;
                if (best.cs > need) { best.c = Math.max(1, Math.min(n, Math.floor((A.width - PEL_PAD * 2 + G) / (need + G)))); best.r = Math.ceil(n / best.c); }
                const cs = Math.max(30, Math.min(need, best.cs)), fit = rk ? cs / need : 0, w = best.c * cs + (best.c - 1) * G + PEL_PAD * 2, h = best.r * cs + (best.r - 1) * G + PEL_PAD * 2;
                const cx = A.left + A.width / 2, cy = A.top + A.height / 2;
                S.board = { cx, cy, w, h };
                it.forEach((o, i) => {
                    const [iw, ih] = o.a ? [o.a.w - o.a.m * 2, o.a.h - o.a.m * 2] : (o.wh || [cs, cs]), sc = rk ? rk * fit : cs / Math.max(iw || cs, ih || cs, 1);   // 매트가 좁으면 다 같이 조금 줄여요
                    const p = { cx: cx - w / 2 + PEL_PAD + (i % best.c) * (cs + G) + cs / 2, cy: cy - h / 2 + PEL_PAD + Math.floor(i / best.c) * (cs + G) + cs / 2 };
                    o.slot = { cx: p.cx, cy: p.cy, w: (iw || cs) * sc, h: (ih || cs) * sc };
                    if (o.st.state === 'on') Object.assign(o.st, p, { s: sc, rot: 0 });
                });
                S.mv.x = 0; S.mv.y = 0; pelKeep(); return;
            }
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
                const A = S.rel.at(); dy = A.height >= 220 ? A.top + A.height / 2 - B.cy : 0;
                if (B.w <= A.width) dx = A.left + A.width / 2 - B.cx;
                else { const L = B.cx - B.w / 2 + dx; if (L > A.left) dx = A.left - (B.cx - B.w / 2); if (L + B.w < A.left + A.width) dx = A.left + A.width - (B.cx + B.w / 2); }
                B.cx += dx; B.cy += dy; S.mv.x += dx;
                for (const o of S.items) { if (o.st.state === 'on') { o.st.cx += dx; o.st.cy += dy; } if (o.slot) { o.slot.cx += dx; o.slot.cy += dy; } }
                return;
            }
            [dx, dy] = stkKeep(B.cx - B.w / 2, B.cy - B.h / 2, B.w, B.h, dx, dy, { l: 0, t: 0, r: 0, b: 0 });   // 화면 밖으로 안 나가게 (스티커 엔진)
            B.cx += dx; B.cy += dy; S.mv.x += dx; S.mv.y += dy;
            for (const o of S.items) { if (o.st.state === 'on') { o.st.cx += dx; o.st.cy += dy; } if (o.slot) { o.slot.cx += dx; o.slot.cy += dy; } }
        }
        const pelKeep = () => pelShift(0, 0);
        /* 📱 폰 (화면 폭 700 미만) : 스티커 창 · 하얀 종이 · 페이지가 늘 겹쳐서, 뗀 스티커를 붙일 동안 하얀 종이가 비켜 줘요
           💻 PC · 아이패드는 하얀 종이가 그대로 있어요 (진짜처럼) · 도련 · 2026-10-10 */
        const pelPhone = () => innerWidth < 700;
        const pelLeft = () => pelS.items.filter(o => o.st.state === 'on').length;
        function pelPick(o) { const S = pelS; S.a = o.a; S.st = o.st; S.src = o.src; }

        /* 🎬 SVG 스티커 (도련 11-19 · 1326 "확대하면 멈추고 하나는 안 보여") : 종이(캔버스)는 한 장면만 그려요
           → 종이 위에 가만히 있는 동안은 진짜 그림(<img>)을 그 자리에 올려 움직이게 · 캔버스(떼는 연출)는 움직임을 뺀 모습 (첫 장면이 빈 손글씨 하트도 보여요) */
        const pelSvgText = async (u, o) => {                                   // 그림이 SVG 면 그 글 (아니면 '') · 어디서 왔든 내용으로 알아봐요 (드라이브 · 받은 상품 = blob 주소 · 이름에 .svg 가 없어요 · 1328)
            if (!u) return '';
            if (/^data:image\/svg\+xml/i.test(u)) { const i = u.indexOf(','), h = u.slice(0, i); if (o) o.lg = 'data-svg'; return /;base64/i.test(h) ? decodeURIComponent(escape(atob(u.slice(i + 1)))) : decodeURIComponent(u.slice(i + 1)); }
            if (/^data:/i.test(u)) { if (o) o.lg = u.slice(5, u.indexOf(';')); return ''; }
            try { const r = await fetch(u); if (!r.ok) throw new Error('http ' + r.status); const b = await r.blob(); if (o) o.lg = (u.split(':')[0]) + ' ' + (b.type || '?') + ' ' + b.size;
                if (/svg/i.test(b.type) || /\.svg(\?|#|$)/i.test(u)) return await b.text();
                if (b.size < 3e6 && !/^image\/(png|jpe?g|webp|gif|avif)/i.test(b.type)) { const t = await b.text(); return /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg/i.test(t.slice(0, 2000)) ? t : ''; }   // 종류 표시가 없어도 내용이 svg 면
                return '';
            } catch (e) { if (o) o.lg = (u.split(':')[0]) + ' 못 읽음 ' + String(e && e.message || e).slice(0, 40); return /\.svg(\?|#|$)/i.test(u) ? '<svg' : ''; }
        };
        async function pelLiveOf(o) {
            if (!o.a || !o.src) return;
            let t = ''; try { t = await pelSvgText(o.src, o); } catch (e) { o.lg = '오류 ' + String(e && e.message || e).slice(0, 40); } if (!t || !/<svg/i.test(t)) return;
            o.live = 1;
            if (!/<(animate|animateTransform|animateMotion|set)\b|animation\s*:/i.test(t)) return;
            o.anim = 1;
            const still = t.replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*\/>/g, '').replace(/<(animate|animateTransform|animateMotion|set)\b[^>]*>[\s\S]*?<\/\1>/g, '').replace(/animation\s*:[^;"}]*;?/g, '');
            try { const im = await pelLoad('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(still)); o.a = pelAsset(im); } catch (e) { }
        }
        function pelLive(bo, skip) {
            const S = pelS, box = pelq('pelLive'); if (!box) return;
            box.style.opacity = bo;
            if (S.rel) { const A = S.rel.at(); box.style.clipPath = `inset(${Math.max(0, A.top - 6)}px ${Math.max(0, S.W - A.left - A.width)}px ${Math.max(0, S.H - A.top - A.height - 6)}px ${Math.max(0, A.left)}px)`; } else box.style.clipPath = '';
            S.items.forEach(o => {
                if (!o.live) return;
                const on = bo > 0 && o.st.state === 'on' && !o.st.snap && o !== skip;
                if (!on) { if (o.img) o.img.style.display = 'none'; return; }
                if (!o.img) { const im = o.img = document.createElement('img'), k = S.items.indexOf(o) + 1; im.alt = ''; im.draggable = false;
                    im.onload = () => { if (window.diag) diag('peelLive', { i: k, ok: 1, nat: [im.naturalWidth, im.naturalHeight], box: [Math.round(parseFloat(im.style.width) || 0), Math.round(parseFloat(im.style.height) || 0)], anim: o.anim ? 1 : 0 }); };
                    im.onerror = () => { if (window.diag) diag('peelLive', { i: k, ok: 0, src: String(o.src).slice(0, 40) }); };
                    im.src = o.src; box.appendChild(im); }   // 🧾 1328
                const a = o.a, w = (a.w - a.m * 2) * o.st.s, h = (a.h - a.m * 2) * o.st.s, k = [o.st.cx - w / 2, o.st.cy - h / 2, w, h].map(v => Math.round(v * 10) / 10).join();
                o.img.style.display = '';
                if (o.img.dataset.k !== k) { o.img.dataset.k = k; Object.assign(o.img.style, { left: (o.st.cx - w / 2) + 'px', top: (o.st.cy - h / 2) + 'px', width: w + 'px', height: h + 'px' }); }
            });
        }
        function pelLiveClear() { const box = pelq('pelLive'); if (box) box.innerHTML = ''; pelS.items.forEach(o => { o.img = null; }); }

        /* src : 그림 하나 또는 여러 개 [src, …] */
        async function openStickerPeel(src, opt) {                       // opt.ts : 🔤 글씨스티커 (붙인 뒤 📷 사진 꾸미기 창이 안 떠요)
            if (!(opt && (opt.rel || opt.stay)) && !isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return false; }   // stay = 다이어리가 책상에 있어도 스티커창만 (js/basket.js dsOpen · 도련 11-05)
            const list = Array.isArray(src) ? src : [src], own = (opt && opt.own) || null;
            let imgs;
            try { imgs = await Promise.all(list.map(u => u ? pelLoad(u) : null)); } catch (e) { showMsg('스티커를 열지 못했어요.'); return false; }
            if (!imgs.some(Boolean)) return false;
            pelBuild();
            const S = pelS;
            S.cv = pelq('pelCv'); S.ctx = S.cv.getContext('2d'); pelLiveClear();
            S.items = imgs.map((im, i) => im ? { a: pelAsset(im), src: list[i], st: { state: 'on' } } : { a: null, src: '', st: { state: 'used' }, wh: pelUsedWh(own, i), g: (own && own.gh && own.gh[i]) || '' });   // 🎒 null = 이미 쓴 칸 · g = 뗀 자리 모양 (👻 js/own.js ownGhost)
            await Promise.all(S.items.map(async o => { if (o.g) try { o.gm = await pelLoad(o.g); } catch (e) {} }));
            await Promise.all(S.items.map(o => pelLiveOf(o)));   // 🎬 SVG 스티커 = 종이 위에서도 움직여요 (도련 11-19 · 1326)
            if (window.diag) diag('peel', { n: S.items.length, it: S.items.map((o, i) => `${i + 1}:${o.live ? (o.anim ? '🎬' : 'svg') : 'img'}·${o.lg || (o.src ? o.src.slice(0, 12) : '빈칸')}·${o.a ? (o.a.w - o.a.m * 2) + 'x' + (o.a.h - o.a.m * 2) : ''}`).join(' | ').slice(0, 900), sheet: opt && opt.L ? 1 : 0, win: [innerWidth, innerHeight] });   // 🧾 씰 종이 열 때 스티커마다 (어디서 · 종류 · 움직이나 · 크기) · 1328
            pelPick(S.items.find(o => o.st.state === 'on'));
            S.L = opt && opt.L && Array.isArray(opt.L.b) && opt.L.b.length === list.length ? opt.L : null;   // 🗺️ 시트 배치 그대로 (도련 10-29)
            S.sb = null; if (S.L && opt.sb) { try { S.sb = await pelLoad(opt.sb); } catch (e) {} }   // 🗂️ 내가 꾸민 시트의 바탕 (색 · 무늬 · 이름표 · js/sheetmaker.js)
            S.rel = (opt && opt.rel) || null; S.relA = null; pelq('pelRoom').classList.toggle('pel-rel', !!S.rel);
            S.own = own; S.ts = !!(opt && opt.ts); S.drag = null; S.gone = 0; S.back = 0; S.mv = { x: 0, y: 0 }; S.on = true;
            pelLayout();
            if (opt && opt.at && S.board && !S.rel) pelShift(opt.at.x - S.board.cx, opt.at.y - S.board.cy);   // 🗂️ 꺼내 둔 종이를 열면 그 자리에서 (basket.js dsOpen)
            stkShow(S, 'pelRoom', pelFrame);
            return true;
        }
        function closeStickerPeel() {
            const S = pelS, rel = S.rel; if (!rel && S.board && S.own) S.lastAt = { id: S.own.id, x: S.board.cx, y: S.board.cy };   // 🗂️ 꺼내 둔 종이로 돌아갈 자리 (basket.js dsMoveFromPeel)
            stkHide(S, 'pelRoom', 'pel-rel'); S.rel = null; pelNoise(0); pelLiveClear();
            if (rel) { if (rel.close) rel.close(); return; }                     // 🤍 정리 책상은 그대로
            if (window.stkReturn) stkReturn();                                // ✨ 스티커 창에서 왔으면 다시 떠요
        }
        function pelRelayout() { if (pelS.on && pelS.rel) pelLayout(); }       // 🤍 정리 책상 화면이 바뀌면 자리 다시

        /* ---------- 좌표 ---------- */
        const pelToStage = stkToStage, pelToLocal = stkToLocal;             // ✋ 핀셋 손길 = 스티커 엔진 (js/sticker.js)

        /* ---------- 그리기 ---------- */
        const pelDraw = (ctx, img, st, extra = 1, flip = 1, sh = null) => stkImg(ctx, img, st, sh, extra, flip);   // 📖 떼어지는 그림 = 스티커 엔진 (js/sticker.js)
        const PEL_FLAT = { c: 'rgba(90,60,70,.12)', b: 2, y: 1 }, PEL_UP = { c: 'rgba(80,50,60,.25)', b: 18, y: 12 };
        /* 잡은 점(C)과 손가락(F) 사이를 접는 선으로, 들린 쪽은 뒤집어 뒷면을 그려요 (씰스티커 R&D 와 같은 방법) */
        const pelDrawPeel = (ctx, o, C, F) => stkFold(pelS, ctx, o.a, o.st, C, F, PEL_FLAT);
        const pelRR = rrPath;   // 🧰 js/util.js
        function pelFrame(t) {
            const S = pelS; if (!S.on) return;
            if (S.rel) {                                                         // 🤍 정리 책상 : 창이 닫혔으면 같이 닫고 · 자리가 움직였으면 따라가요
                if (S.rel.alive && !S.rel.alive()) { closeStickerPeel(); return; }
                if (!S.drag || S.drag.mode === 'win') { const A = S.rel.at(), o = S.relA; if (!o || Math.abs(A.top - o.top) > .5 || Math.abs(A.left - o.left) > .5 || Math.abs(A.width - o.width) > .5) { S.relA = { top: A.top, left: A.left, width: A.width }; pelLayout(); } }
            }
            const ctx = stkClear(S), st = S.st, a = S.a;                         // 🎞️ 스티커 엔진
            const bo = stkAway(S, t);                                            // 마지막 스티커를 떼어 내면 스르르 사라져요 (📱 폰은 뗄 때마다) · 붙이고 나면 남은 스티커와 같이 다시 스르르
            /* 어둡게 깔기는 없앴어요 (도련 11-05 · 화면이 어두워지지 않게) */
            if (S.rel) { const A = S.rel.at(); ctx.save(); ctx.beginPath(); ctx.rect(A.left, A.top - 6, A.width, A.height + 12); ctx.clip(); }   // 🤍 종이는 정한 자리 안에서만 보여요 (옆으로 밀어 넘겨요)
            if (bo > 0) {                                                        // 🏷️ 하얀 네모 (스티커 종이)
                const B = S.board, bx = B.cx - B.w / 2, by = B.cy - B.h / 2;
                ctx.save(); ctx.globalAlpha = bo; ctx.shadowColor = 'rgba(120,80,95,.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
                pelRR(ctx, bx, by, B.w, B.h, 14);
                if (S.sb && B.sheet) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.clip(); ctx.drawImage(S.sb, bx, by, B.w, B.h); ctx.restore(); }   // 🗂️ 내가 꾸민 시트 바탕
                else { const g = ctx.createLinearGradient(bx, by, bx + B.w, by + B.h);
                g.addColorStop(0, '#fdfdff'); g.addColorStop(.5, '#f4f6fb'); g.addColorStop(1, '#fbfcff'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
            }
            if (bo > 0 && S.items.length > 1 && !S.rel) { ctx.save(); ctx.globalAlpha = bo; pelDrawTape(ctx); ctx.restore(); }   // 여러 개 씰 종이 : 위쪽 '✋ 잡고 옮겨요'
            const bx = pelq('pelX');                                             // ✕ : 하얀 종이 오른쪽 위 끝 (모조지스티커처럼 · 종이를 따라 다녀요)
            if (bx) { const B = S.rel ? (A => ({ cx: A.left + A.width / 2, w: A.width, cy: A.top + A.height / 2, h: A.height }))(S.rel.at()) : S.board; bx.style.left = (B.cx + B.w / 2 - 24) + 'px'; bx.style.top = (B.cy - B.h / 2 - 20) + 'px'; bx.style.opacity = bo; bx.style.visibility = bo > 0 ? '' : 'hidden'; }
            const d = S.drag, cur = S.items.find(o => o.st === st);
            if (bo > 0) for (const o of S.items) if (o.st.state !== 'on' && o.slot) pelResidue(ctx, o.slot, bo, o);   // 🎒 뗀 자국 (빈 자리)
            for (const o of S.items) {                                           // 종이 위에 남은 스티커들 (잡은 건 맨 위에)
                if (o.st.state !== 'on') continue;
                if (o === cur && ((d && d.mode === 'peel') || o.st.snap)) continue;
                if (bo < 1) { if (bo <= 0) continue; ctx.save(); ctx.globalAlpha = bo; }
                if (o.st.snap) pelSnap(ctx, o, t); else if (o.live && o !== (d && d.mode === 'peel' ? cur : null)) { } else pelDraw(ctx, o.a.front, o.st, 1, 1, PEL_FLAT);   // 🎬 SVG = 진짜 그림이 위에 (pelLive)
                if (bo < 1) ctx.restore();
            }
            if (S.rel) ctx.restore();
            if (cur && d && d.mode === 'peel') pelDrawPeel(ctx, cur, d.C, d.F);
            else if (cur && st.state === 'on' && st.snap) pelSnap(ctx, cur, t);
            else if (cur && st.state === 'free') {
                pelSizeUp(t);
                stkFlipIn(ctx, a, st, t, PEL_UP, 1.07);                          // 뒷면 → 앞면으로 뒤집혀요 (스티커 엔진)
            }
            pelLive(bo, d && d.mode === 'peel' ? cur : null);
            pelHitPlace(bo);
            S.raf = requestAnimationFrame(pelFrame);
        }
        /* 👆 손가락 받는 자리 : 🤍 이형지북 · 떼는 중 · 뗀 스티커를 들고 있으면 화면 전체 · 아니면 하얀 종이 (+ 위 ✋ 테이프) · 종이가 사라졌으면 없음 */
        function pelHitPlace(bo) {
            const S = pelS, h = pelq('pelHit'); if (!h) return;
            let r = null;
            if (S.rel || S.drag || (S.st && S.st.state === 'free')) r = [0, 0, S.W, S.H];
            else if (bo > 0 && S.board) { const B = S.board, m = PEL_GRAB; r = [B.cx - B.w / 2 - m, B.cy - B.h / 2 - m - 18, B.w + m * 2, B.h + m * 2 + 18]; }
            const k = r ? r.map(v => Math.round(v)).join() : '';
            if (h.dataset.r === k) return; h.dataset.r = k;
            if (!r) { h.style.display = 'none'; return; }
            h.style.display = ''; h.style.left = r[0] + 'px'; h.style.top = r[1] + 'px'; h.style.width = r[2] + 'px'; h.style.height = r[3] + 'px';
        }
        /* 🎒 뗀 자국 : 스티커가 있던 자리에 살짝 끈적한 흔적만 */
        /* 쓴 칸 크기 : 하얀 테두리를 이제 두르는 종이면 그만큼 크게 (pelBake 와 같이) */
        function pelUsedWh(own, i) {
            const w = own && own.wh && own.wh[i]; if (!w) return w;
            const b = own.raw && (typeof showOn !== 'function' || showOn('die')) ? (PEL_EDGE + 2) * 2 : 0;
            return [w[0] + b, w[1] + b];
        }
        /* 👻 뗀 자국 = 스티커 모양 그대로 (도련 11-09) : 옅은 끈적 자국 + 가는 테두리 · 방금 뗀 건 그 그림에서, 예전에 쓴 칸은 실루엣(gm)에서 */
        function pelGhost(o, sl) {
            const src = o.gm || (o.a && o.a.front); if (!src) return null;
            const R = Math.min(2, pelS.DPR || devicePixelRatio || 1), W = Math.max(2, Math.round(sl.w * R)), H = Math.max(2, Math.round(sl.h * R)), key = W + 'x' + H;
            if (o.gc && o.gk === key) return o.gc;
            const m = o.gm ? 0 : o.a.m, P = Math.ceil(2 * R);
            const sh = pelMk(W, H), y = sh.getContext('2d');
            y.drawImage(src, m, m, src.width - m * 2, src.height - m * 2, 0, 0, W, H);
            const edge = pelTint(sh, 'rgba(176,162,190,.55)'), fill = pelTint(sh, 'rgba(226,218,234,.62)');
            const c = pelMk(W + P * 2, H + P * 2), x = c.getContext('2d');
            for (let a = 0; a < 360; a += 30) x.drawImage(edge, P + Math.cos(a * Math.PI / 180) * 1.3 * R, P + Math.sin(a * Math.PI / 180) * 1.3 * R);
            x.drawImage(fill, P, P);
            x.globalCompositeOperation = 'source-atop';                       // 끈적한 자국이 살짝 (반짝 결 · 점)
            const g = x.createLinearGradient(0, 0, c.width, c.height); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.18)');
            x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
            x.fillStyle = 'rgba(255,255,255,.5)';
            for (let i = 0; i < W * H / (260 * R * R); i++) x.fillRect(Math.random() * c.width, Math.random() * c.height, R, R);
            o.gc = c; o.gk = key; o.gp = P / R; o.gr = R;
            return c;
        }
        function pelResidue(ctx, sl, bo, o) {
            const gc = o && pelGhost(o, sl);
            if (gc) { ctx.save(); ctx.globalAlpha = bo; ctx.drawImage(gc, sl.cx - sl.w / 2 - o.gp, sl.cy - sl.h / 2 - o.gp, gc.width / o.gr, gc.height / o.gr); ctx.restore(); return; }
            ctx.save(); ctx.globalAlpha = bo * .9;
            pelRR(ctx, sl.cx - sl.w / 2, sl.cy - sl.h / 2, sl.w, sl.h, Math.min(14, sl.w / 4, sl.h / 4));
            ctx.fillStyle = 'rgba(214,206,222,.30)'; ctx.fill();
            ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(190,178,200,.55)'; ctx.stroke();
            ctx.restore();
        }
        /* 덜 떼다 놓으면 제자리로 착 붙어요 */
        function pelSnap(ctx, o, t) {
            const sn = o.st.snap; pelDrawPeel(ctx, o, sn.C, stkSnap(sn, t));    // 스티커 엔진
            if (sn.end) o.st.snap = null;
        }

        /* ---------- 손가락 ---------- */
        const pelPeeled = (st, C, F) => stkPeeled(pelS.a, st, C, F);        // 얼마나 떼어졌는지 (스티커 엔진)
        /* ✋ 잡고 옮겨요 테이프 (여러 개 씰 종이 위쪽 가운데) : 잡고 끌면 하얀 종이째 옮겨요 */
        function pelTape() { const B = pelS.board, w = 112, h = 24; return { x: B.cx - w / 2, y: B.cy - B.h / 2 - h / 2 - 2, w, h }; }
        const pelDrawTape = c => stkTape(c, pelTape());                      // ✋ 잡고 옮겨요 테이프 (스티커 엔진)
        function pelDown(e) {
            const S = pelS; if (!S.on || S.drag || S.st.state === 'free') return;
            e.preventDefault(); const P = [e.clientX, e.clientY];
            if (S.items.length > 1 && S.board && !S.gone && !S.rel) {          // ✋ 테이프를 잡으면 종이 옮기기
                const t = pelTape();
                if (P[0] > t.x - 8 && P[0] < t.x + t.w + 8 && P[1] > t.y - 8 && P[1] < t.y + t.h + 8) {
                    S.drag = { mode: 'board', last: P, lt: performance.now() };
                    stkCap(pelq('pelHit'), e);
                    return;
                }
            }
            let best = 1e12, bp = null, bo = null, hit = null;                   // 손가락에서 가장 가까운 스티커 가장자리 (스티커 엔진 stkEdge)
            for (const o of S.items) {
                if (o.st.state !== 'on') continue;
                const g = stkEdge(o.a, o.st, P);
                if (g.d < best) { best = g.d; bp = g.bp; bo = o; }
                if (!hit && g.inside) hit = o;
            }
            /* 스티커 안쪽 가장자리는 넉넉히(PEL_GRAB) · 바깥(종이 빈 곳)은 조금만(PEL_GRAB_OUT) → 나머지 빈 곳은 종이 옮기기 */
            if (bp && best < (hit === bo ? PEL_GRAB : PEL_GRAB_OUT)) {
                if (!S.rel && !stkTwz(P[0], P[1])) return;   // 🤍 이형지북 정리는 핀셋이 늘 들려 있어요 (도련 10-29)   // 🪡 하얀 창에서 떼기는 핀셋으로 (도련 10-21)
                pelPick(bo); const st = S.st, C = pelToStage(st, bp[0], bp[1]); st.snap = null;
                S.drag = { mode: 'peel', C, F: C.slice(), start: P, last: P, lt: performance.now() };
                stkCap(pelq('pelHit'), e);
                return;
            }
            if (hit) { pelWiggle(hit.st); return; }
            const B = S.board;                                                   // 하얀 종이 빈 곳 → 종이 옮기기
            if (B && Math.abs(P[0] - B.cx) <= B.w / 2 && Math.abs(P[1] - B.cy) <= B.h / 2) {
                S.drag = { mode: 'board', last: P, lt: performance.now() };
                stkCap(pelq('pelHit'), e);
                return;
            }
            if (S.rel) {                                                         // 🤍 종이 밖 = 그 아래 버튼 (쪽 넘기기 · 다른 종이 고르기 …)
                const room = pelq('pelRoom'), hid = [room, S.cv, ...room.children];
                hid.forEach(el => { el.dataset.pe = el.style.pointerEvents; el.style.pointerEvents = 'none'; });
                const under = document.elementFromPoint(P[0], P[1]);
                hid.forEach(el => { el.style.pointerEvents = el.dataset.pe || ''; delete el.dataset.pe; });
                const gp = under && under.closest('.abs-grip');
                if (gp && window.abGripAt) { abGripAt(gp, e); return; }        // ✋ 정리 공간 이름표 = 바구니 · 정리북 옮기기 (떼는 판이 떠 있어도 · 도련 10-29)
                const ri = under && under.closest('#abRel .ab-it');
                if (ri && window.abItGrab) { abItGrab(ri, e); return; }       // ✋ 이형지에 놓은 스티커 = 자리 옮기기 (js/basket.js)
                const sc = under && under.closest('.ab-sc');
                if (sc && window.abSheetDown) { abSheetDown(sc, e); return; }   // 바구니의 다른 종이 : 톡 = 맨 위로 · 끌어서 매트에 놓기 (js/basket.js abUp)
                const tt = under && !under.closest('button') && under.closest('.modal-title'), box = tt && tt.closest('.modal-content');
                if (box) {                                                       // ✋ 창 제목 줄 = 창 옮기기 (떼는 판이 떠 있어도 · 도련 10-25 · js/skins.js setupSkinWindows 와 같게)
                    S.drag = { mode: 'win', box, last: P, x: P[0], y: P[1], ox: parseFloat(box.style.left) || 0, oy: parseFloat(box.style.top) || 0 };
                    stkCap(pelq('pelHit'), e);
                    return;
                }
                const btn = under && under.closest('button, input, label');
                if (btn) { if (btn.matches('input')) btn.focus(); else btn.click(); }
                return;
            }
            stkBar(e, P);                                                       // 종이 바깥 날짜바 위 → 페이지 옮기기
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
            const sp = stkSpeed(d, P);
            if (d.mode === 'peel') {
                d.F = stkPull(d, P);                                             // 끈적임 (스티커 엔진)
                pelNoise(Math.min(.35, sp * .25));
                const fr = pelPeeled(S.st, d.C, d.F);
                if (fr >= .78) pelDetach(P);
            } else {
                const st = S.st, nx = P[0] - d.off[0], ny = P[1] - d.off[1];
                stkSway(st, nx - st.cx, d.baseRot, .35); st.cx = nx; st.cy = ny;
            }
        }
        function pelDetach(P) {
            const S = pelS, st = S.st, d = S.drag, [lx, ly] = pelToLocal(st, d.C[0], d.C[1]);
            st.state = 'free'; st.t0 = performance.now();
            if (!S.rel && (!pelLeft() || pelPhone())) { S.gone = performance.now(); S.back = 0; }   // 마지막 스티커면 하얀 종이도 사라져요 · 📱 폰은 페이지가 가려서 뗄 때마다 비켜 줘요
            const [gx, gy] = pelToStage(st, lx, ly);
            S.drag = { mode: 'free', off: [gx - st.cx, gy - st.cy], baseRot: st.rot, last: P, lt: performance.now() };
            st.cx = P[0] - S.drag.off[0]; st.cy = P[1] - S.drag.off[1];
            const goal = stkPageScale();                                          // 📏 하얀 종이에서 완전히 떨어지는 순간 진짜 크기로 (페이지 배율 · 도련 · 10-18)
            if (goal && !S.rel) st.grow = { goal, s0: st.s, t0: performance.now(), off: S.drag.off.slice() };
            pelNoise(0); buzz(15);
            
        }
        /* 📏 진짜 크기로 스르르 (잡은 자리는 손가락 끝 그대로) */
        function pelSizeUp(t) {                                              // (예전 이름 pelGrow 가 하얀 칼선 pelGrow 와 겹쳐서 ⚙ 하얀 테두리가 안 둘러졌어요 · 1242 고침)
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
                return;
            }
            buzz(8);
            if (S.rel) pelRelDrop();
            else if (!pelPageOn()) { st.state = 'on'; st.snap = null; pelLayout(); }   // 붙일 페이지가 없으면 종이로 돌아가요
            else pelStick();
        }
        /* 🤍 이형지북 위에 놓으면 그 자리에 · 밖이면 종이로 돌아가요 */
        function pelRelDrop() {
            const S = pelS, st = S.st, k = S.items.findIndex(o => o.st === st), R0 = S.rel.target();
            if (!R0 || st.cx < R0.left || st.cx > R0.right || st.cy < R0.top || st.cy > R0.bottom) {
                st.state = 'on'; st.snap = null; pelLayout();
                return;
            }
            st.state = 'done';
            const a0 = S.items[k] && S.items[k].a;                               // 진짜 크기 (다이어리에 붙였을 때의 그림 크기)
            S.rel.drop(k, Object.assign({ x: (st.cx - R0.left) / R0.width, y: (st.cy - R0.top) / R0.height, r: Math.round(st.rot * 180 / Math.PI) }, a0 ? { w: a0.w - a0.m * 2, h: a0.h - a0.m * 2 } : {}));
            const left = S.items.filter(o => o.st.state === 'on');
            if (!left.length) { closeStickerPeel(); return; }
            pelPick(left[0]); pelLayout();
            
        }
        const pelWiggle = stkWiggle;

        /* 놓은 자리에 붙이기 : 화면에 보이던 크기 · 기울기 그대로 페이지에 붙어요 */
        function pelStick() {
            const S = pelS, st = S.st, a = S.a;
            const el = stkStick({ src: S.src, cx: st.cx, cy: st.cy, w: (a.w - a.m * 2) * st.s, h: (a.h - a.m * 2) * st.s, deg: stkDeg(st.rot), clamp: true, orig: true,   // 📄 붙이기 = 스티커 엔진 (js/sticker.js)
                mark: el => { if (S.ts) el.dataset.ts = 1; },
                own: S.own ? el => stkUse(S.own.id, S.items.findIndex(o => o.st === st), el) : null });   // 🎒 그 칸은 영원히 사라져요
            if (!el) { closeStickerPeel(); return; }
            st.state = 'done';
            const left = S.items.filter(o => o.st.state === 'on');
            if (!left.length) { closeStickerPeel(); return; }
            if (S.gone) { S.gone = 0; S.back = performance.now(); }              // 📱 하얀 종이가 남은 스티커와 다시 나타나요
            pelPick(left[0]);                                                    // 종이에 남은 스티커는 계속 떼어 붙여요
            
        }

        /* ---------- 소리 : 🏷️ 씰을 떼어 낼 때 '찌익'만 ---------- */
        const pelNoise = stkNoise;                                           // 🔊 떼는 소리 = 스티커 엔진 (js/sticker.js)

        window.openStickerPeel = openStickerPeel; window.pelBake = pelBake; window.closeStickerPeel = closeStickerPeel; window.pelRelayout = pelRelayout; window.pelLastAt = () => pelS.lastAt || null;
