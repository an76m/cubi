/* 말랑달콤 다이어리 - js/piecebag.js
   🧩 조각스티커 봉투 : 내스티커(👜 내 봉투)에서 봉투를 누르면 배경(화면) 한가운데에 봉투가 나와요 (조각스티커 R&D 와 같은 연출)
   1) 봉투 윗부분 점선을 옆으로 쓱 밀어 뜯어요 → 조각들이 와르르 쏟아져요 (내스티커에서 꺼낼 때도 늘 새 봉투로 나와요)
   2) 조각을 톡 누르면 집어 올려요 → 가장자리를 손톱으로 밀어 뒷종이를 벗겨요 (가끔 반쯤에서 걸려요 · 놓으면 반쯤 벗겨진 채로 남아요)
   3) 벗긴 스티커는 손가락을 따라와요 → 페이지에 놓으면 붙어요 · 작은 봉투 위에 놓으면 봉투에 다시 쏙
   - 작은 봉투를 누르거나 ✕ 를 누르면 남은 조각은 봉투로 돌아가요 · 다 붙이면 저절로 닫혀요
   - 봉투를 잡고 끌면 봉투가 화면 안에서 옮겨져요 (쏟아진 조각은 그 자리에) · 날짜바를 끌면 페이지가 옮겨져요 (js/page.js pgmBegin)
   - 소리 : 봉투를 옆으로 뜯을 때 · 뒷종이를 벗길 때 '찌이익' (⚙ 설정의 '✨ 연출 소리' · js/sound.js)
   - 🎒 유한 스티커 (10-25) : 🧺 바구니의 봉투 = label.own { id, slots : 조각마다 원래 칸 번호 } · 남은 조각만 들어 있어요 · 붙이면 그 조각은 영원히 사라져요 (js/own.js)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (조각이 바로 붙어요 · js/stickermaker.js) */

        const PCB_PAD = 6, PCB_LINER = 3, PCB_GRAB = 30;
        const pcbS = { on: false, cv: null, ctx: null, fl: null, W: 0, H: 0, DPR: 1, raf: 0, hint: '', assets: [], pieces: [], fallers: [], drag: null, z: 10, bag: null,
            PR: null, BIG: null, SMALL: null, HOLD: null, SL: .5, SH: 1, SP: .5, closing: 0, used: null, mv: { x: 0, y: 0 } };   // mv : 봉투를 옮긴 만큼   // used : 이번에 붙인 조각 (봉투 속에 안 그려요)
        const pcbq = id => document.getElementById(id);
        const pcbMk = stkMk, pcbGrow = stkGrow;                              // 🏷️ 스티커 엔진 (js/sticker.js)
        const pcbLoad = src => stkLoad(src);
        const pcbTint = tintCanvas;   // 🧰 js/util.js
        const pcbNow = () => performance.now();
        const pcbOut = q => 1 - Math.pow(1 - q, 3), pcbBack = q => { const c = 1.6; return 1 + (c + 1) * Math.pow(q - 1, 3) + c * Math.pow(q - 1, 2); };
        const pcbDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
        const pcbIn = (P, r, m = 0) => P[0] > r.x - m && P[0] < r.x + r.w + m && P[1] > r.y - m && P[1] < r.y + r.h + m;

        /* ---------- 그림 재료 : 앞면(유광) · 뒷면(접착면) · 뒷종이 · 봉투 속 모습 · 가장자리 점 ---------- */
        function pcbAsset(img) {                                             // 🧩 그림 재료 = 스티커 엔진 (js/sticker.js) + 조각만의 뒷종이 · 조각
            const a = stkAsset(img, PCB_PAD, { paper: ['#f2eee8', '#e1d8ce'], gloss: (f, w, h) => {   // ✨ 유광 빛
                f.globalCompositeOperation = 'source-atop';
                const g = f.createLinearGradient(0, 0, w, h);
                g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.32, 'rgba(255,255,255,0)'); g.addColorStop(.40, 'rgba(255,255,255,.34)');
                g.addColorStop(.46, 'rgba(255,255,255,.08)'); g.addColorStop(.52, 'rgba(255,255,255,.2)'); g.addColorStop(.58, 'rgba(255,255,255,0)');
                f.fillStyle = g; f.fillRect(0, 0, w, h);
            } }), { w, h, front } = a;
            const shape = pcbGrow(pcbTint(front, '#fff'), PCB_LINER, 15), liner = pcbMk(w, h), l = liner.getContext('2d');
            l.drawImage(pcbTint(pcbGrow(shape, 1.2, 30), 'rgba(175,150,160,.75)'), 0, 0);
            const lc = pcbTint(shape, '#fff'), lx = lc.getContext('2d'); lx.globalCompositeOperation = 'source-atop';
            const lg = lx.createLinearGradient(0, 0, w, h); lg.addColorStop(0, '#f3f6fb'); lg.addColorStop(.5, '#ffffff'); lg.addColorStop(1, '#e8edf5'); lx.fillStyle = lg; lx.fillRect(0, 0, w, h);
            l.drawImage(lc, 0, 0);
            const cut = pcbTint(pcbGrow(front, 1.5, 20), 'rgba(170,140,150,.45)'), cx = cut.getContext('2d'); cx.globalCompositeOperation = 'destination-out'; cx.drawImage(front, 0, 0);
            l.drawImage(cut, 0, 0);
            const piece = pcbMk(w, h), p = piece.getContext('2d'); p.drawImage(liner, 0, 0); p.drawImage(front, 0, 0);
            return Object.assign(a, { liner, piece });
        }

        /* ---------- 화면 ---------- */
        function pcbBuild() {
            stkRoom({ id: 'pcbRoom', cls: 'pel-room', hit: 'pcbCv', down: pcbDown, move: pcbMove, up: pcbUp, resize: () => { if (pcbS.on) { const o = [pcbS.W, pcbS.H]; pcbLayout(); pcbReflow(o); } },   // 🪟 종이 화면 = 스티커 엔진
                html: `<canvas id="pcbCv"></canvas><p class="pel-hint" id="pcbHint"></p><button type="button" class="pel-x pcb-bx win-x" id="pcbX" onclick="closePieceBag()" aria-label="닫기">✕</button>` });
        }
        function pcbLayout() {
            const S = pcbS;
            stkScreen(S, true);
            /* 봉투는 배경(화면) 한가운데 (PR 가운데) · 조각은 봉투가 있는 곳 둘레에 쏟아져요 (pcbSpill) · 붙일 크기(SP)는 페이지에 맞춰요 */
            const pg = pcbq('canvasArea'), r = pg ? pg.getBoundingClientRect() : { left: 0, top: 0, width: S.W, height: S.H };
            const pw = Math.min(S.W - 24, 520), ph = Math.min(S.H - 84, 720), PR = S.PR = { x: (S.W - pw) / 2, y: Math.max(70, (S.H - ph) / 2), w: pw, h: ph };
            const bw = Math.min(PR.w - 60, 230), bh = Math.min(PR.h - 40, bw * 1.13);
            S.BIG = { x: PR.x + PR.w / 2 - bw / 2, y: PR.y + (PR.h - bh) / 2, w: bw, h: bh };
            S.SMALL = { x: S.BIG.x + bw / 2 - 31, y: S.BIG.y + bh / 2 - 38, w: 62, h: 76 };   // 뜯으면 그 자리에서 작아져요
            const m = Math.max(1, ...S.assets.map(a => Math.max(a.w, a.h)));
            S.SP = stkPageScale() || Math.min(1, Math.min(r.width, S.W) * .32 / m);   // 📏 💻 📱 모든 기기 = 실제 크기 (도련 11-16 · 페이지에 붙을 크기 그대로 · 페이지가 없을 때만 화면 비율)
            S.SL = S.SH = S.SP;                                                   // 쏟아진 조각 · 집은 조각도 같은 크기 (보이는 그대로 붙어요)
            for (const q of [S.BIG, S.SMALL]) { q.x += S.mv.x; q.y += S.mv.y; pcbClampR(q); }
            const hh = m * S.SH / 2;                                              // ✋ 집은 조각 = 열린 봉투 바로 위 (실제 크기라 작은 조각이 봉투 · ✕ 를 가리지 않게 · 도련 11-16)
            S.HOLD = { cx: S.SMALL.x + S.SMALL.w / 2, cy: Math.max(70 + hh, S.SMALL.y - 18 - hh) };
        }
        /* 화면이 바뀌면 (아이패드 돌리기 등) 흩어진 조각도 새 화면 안으로 : 화면에서 같은 비율 자리로 옮기고, 화면 밖이면 안쪽으로 */
        const pcbInScreen = (x, y, half) => { const S = pcbS, hx = Math.min(half, S.W / 2), hy = Math.min(half, (S.H - 78) / 2);
            return [Math.max(8 + hx, Math.min(S.W - 8 - hx, x)), Math.max(70 + hy, Math.min(S.H - 8 - hy, y))]; };
        function pcbReflow(o) {
            const S = pcbS, [ow, oh] = o;
            for (const st of S.pieces) {
                if (st.state === 'free') continue;                                   // 손가락에 붙어 있는 건 그대로
                const a = S.assets[st.k], g = st.anim ? st.anim.to : st, half = Math.max(a.w, a.h) * g.s / 2;
                const [nx, ny] = st.state === 'held' ? [S.HOLD.cx, S.HOLD.cy] : pcbInScreen(g.cx / ow * S.W, g.cy / oh * S.H, half);
                const dx = nx - g.cx, dy = ny - g.cy, mv = q => { if (q) { q[0] += dx; q[1] += dy; } };
                st.cx += dx; st.cy += dy;
                if (st.anim) { st.anim.from.cx += dx; st.anim.from.cy += dy; st.anim.to.cx += dx; st.anim.to.cy += dy; }
                if (st.home) [st.home.cx, st.home.cy] = pcbInScreen(st.home.cx / ow * S.W, st.home.cy / oh * S.H, Math.max(a.w, a.h) * S.SL / 2);
                for (const h of [st.half, st.snap]) if (h) { mv(h.C); mv(h.F); }
            }
            const d = S.drag; if (d && d.mode === 'peel') S.drag = null;            // 벗기던 중이면 손을 뗀 것처럼
        }
        /* 봉투 옮기기 : 큰 봉투 · 작은 봉투가 같이 움직여요 (지금 보이는 봉투가 화면 밖으로 안 나가게) */
        function pcbClampR(q) { const M = 8; q.x = Math.max(M, Math.min(pcbS.W - M - q.w, q.x)); q.y = Math.max(M, Math.min(pcbS.H - M - q.h, q.y)); }
        function pcbShift(dx, dy) {
            const S = pcbS, r = S.bag.state === 'closed' ? S.BIG : S.SMALL;
            [dx, dy] = stkKeep(r.x, r.y, r.w, r.h, dx, dy, { l: 8, t: 8, r: 8, b: 8 });   // 화면 밖으로 안 나가게 (스티커 엔진)
            for (const q of [S.BIG, S.SMALL]) { q.x += dx; q.y += dy; pcbClampR(q); }
            S.mv.x += dx; S.mv.y += dy;
        }
        /* srcs : 봉투에 든 조각 그림들 */
        async function openPieceBag(srcs, label) {                   // label : { t: 봉투 이름, s: 작은 글 } (🆓 기본 봉투 js/stk-basic.js · 없으면 내가 만든 봉투)
            if (!isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return false; }
            let imgs;
            try { imgs = await Promise.all(srcs.map(pcbLoad)); } catch (e) { showMsg('조각스티커를 열지 못했어요.'); return false; }
            if (!imgs.length) return false;
            pcbBuild();
            const S = pcbS;
            S.cv = pcbq('pcbCv'); S.ctx = S.cv.getContext('2d');
            S.assets = imgs.map((im, i) => Object.assign(pcbAsset(im), { src: srcs[i] }));
            S.label = label && label.t ? { t: String(label.t).slice(0, 14), s: String(label.s || '').slice(0, 14) } : null;
            S.own = label && label.own || null;
            S.pieces = []; S.fallers = []; S.drag = null; S.closing = 0; S.used = new Set(); S.mv = { x: 0, y: 0 }; S.on = true;
            pcbLayout();
            S.bag = { state: 'closed', tear: 0, dir: 1, wig: 0, move: null, strip: null, busy: false,
                preview: S.assets.map((a, k) => ({ k, u: .2 + Math.random() * .6, v: .42 + Math.random() * .42, rot: (Math.random() - .5) * 1.2 })) };
            S.hint = '';
            pcbSay('봉투 윗부분 <b>점선</b>을 옆으로 쓱 밀어서 뜯어 보세요 ✂️');
            stkShow(S, 'pcbRoom', pcbFrame);
            return true;
        }
        function closePieceBag() {
            const S = pcbS; stkHide(S, 'pcbRoom'); pcbNoise(0);
            if (window.stkReturn) stkReturn();                                // ✨ 스티커 창에서 왔으면 다시 떠요
        }
        function pcbSay(h) { hintPop(pcbq('pcbHint'), pcbS, h); }   // 💬 js/util.js

        /* ---------- 좌표 · 움직임 ---------- */
        const pcbToStage = stkToStage, pcbToLocal = stkToLocal;             // ✋ 핀셋 손길 = 스티커 엔진 (js/sticker.js)
        function pcbAnim(st, to, dur, o = {}) { st.anim = { from: { cx: st.cx, cy: st.cy, rot: st.rot, s: st.s }, to: Object.assign({ cx: st.cx, cy: st.cy, rot: st.rot, s: st.s }, to), t0: pcbNow() + (o.delay || 0), dur, ease: o.ease || pcbOut, arc: o.arc || 0, hide: o.hide, done: o.done }; }
        function pcbStep(st, t) {
            const a = st.anim; if (!a) return;
            const q = Math.max(0, Math.min(1, (t - a.t0) / a.dur)), e = a.ease(q);
            for (const k of ['cx', 'cy', 'rot', 's']) st[k] = a.from[k] + (a.to[k] - a.from[k]) * e;
            st.cy -= Math.sin(q * Math.PI) * a.arc; st.hidden = a.hide && t < a.t0;
            if (q >= 1) { st.anim = null; st.hidden = false; if (a.done) a.done(); }
        }
        function pcbBagRect(t) {
            const S = pcbS, b = S.bag;
            if (b.state === 'closed' || !b.move) return S.BIG;
            const q = pcbOut(Math.max(0, Math.min(1, (t - b.move.t0) / b.move.dur))), L = (x, y) => x + (y - x) * q;
            return { x: L(S.BIG.x, S.SMALL.x), y: L(S.BIG.y, S.SMALL.y), w: L(S.BIG.w, S.SMALL.w), h: L(S.BIG.h, S.SMALL.h) };
        }

        /* ---------- 그리기 ---------- */
        const pcbRR = rrPath;   // 🧰 js/util.js
        function pcbDrawBag(t) {
            const S = pcbS, ctx = S.ctx, b = S.bag, r = pcbBagRect(t), k = r.w / S.BIG.w, hh = r.h * .24, cut = r.y + hh * .34, open = b.state !== 'closed';
            const BC = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#ffb6c1', FONT = getComputedStyle(document.body).fontFamily;
            ctx.save();
            if (b.wig) { const q = (t - b.wig) / 420; if (q < 1) { const a = Math.sin(q * Math.PI * 5) * .05 * (1 - q); ctx.translate(r.x + r.w / 2, r.y + r.h); ctx.rotate(a); ctx.translate(-r.x - r.w / 2, -r.y - r.h); } else b.wig = 0; }
            const body = () => {
                ctx.beginPath();
                if (open) { ctx.moveTo(r.x, cut); for (let x = r.x, i = 0; x <= r.x + r.w; x += 6 * k, i++) ctx.lineTo(Math.min(x, r.x + r.w), cut + (i % 2 ? 2.5 : -1.5) * k); }
                else { ctx.moveTo(r.x + 6 * k, r.y); ctx.lineTo(r.x + r.w - 6 * k, r.y); ctx.quadraticCurveTo(r.x + r.w, r.y, r.x + r.w, r.y + 6 * k); }
                ctx.lineTo(r.x + r.w, r.y + r.h - 8 * k); ctx.quadraticCurveTo(r.x + r.w, r.y + r.h, r.x + r.w - 8 * k, r.y + r.h); ctx.lineTo(r.x + 8 * k, r.y + r.h); ctx.quadraticCurveTo(r.x, r.y + r.h, r.x, r.y + r.h - 8 * k);
                ctx.lineTo(r.x, open ? cut : r.y + 6 * k); if (!open) ctx.quadraticCurveTo(r.x, r.y, r.x + 6 * k, r.y); ctx.closePath();
            };
            ctx.save(); ctx.shadowColor = 'rgba(120,80,95,.18)'; ctx.shadowBlur = 10 * k; ctx.shadowOffsetY = 4 * k; body(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); ctx.restore();
            ctx.save(); body(); ctx.clip();                                       // 안에 든 조각들
            const pv = open ? b.preview.filter(p => !S.used.has(p.k) && !S.pieces.some(q => q.k === p.k)) : b.preview;
            for (const p of pv) { const a = S.assets[p.k], s = S.SL * .92 * k; ctx.save(); ctx.translate(r.x + r.w * p.u, r.y + r.h * p.v); ctx.rotate(p.rot); ctx.scale(s, s); ctx.drawImage(a.piece, -a.w / 2, -a.h / 2); ctx.restore(); }
            ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(r.x, r.y, r.w, r.h);                // 비닐 느낌
            const sg = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
            sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.18, 'rgba(255,255,255,.55)'); sg.addColorStop(.24, 'rgba(255,255,255,0)');
            sg.addColorStop(.62, 'rgba(255,255,255,0)'); sg.addColorStop(.7, 'rgba(255,255,255,.4)'); sg.addColorStop(.74, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(r.x, r.y, r.w, r.h);
            ctx.restore();
            body(); ctx.strokeStyle = BC; ctx.lineWidth = 1.6; ctx.stroke();
            const lx = r.x + 10 * k, ly = cut + 8 * k, lw = r.w - 20 * k, lh = hh * .78;            // 라벨
            pcbRR(ctx, lx, ly, lw, lh, 6 * k); ctx.fillStyle = '#ffd9e4'; ctx.fill(); ctx.strokeStyle = BC; ctx.lineWidth = 1.2; ctx.stroke();
            if (k > .5) {
                ctx.fillStyle = '#9b6676'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
                ctx.font = `700 ${Math.round(16 * k)}px ${FONT}`; ctx.fillText(S.label ? S.label.t : '말랑 조각스티커', r.x + r.w / 2, ly + lh * .5);
                ctx.font = `${Math.round(12 * k)}px ${FONT}`; ctx.fillText((S.label ? S.label.s : '내가 만든 조각') + ' · ' + S.assets.length + 'pcs', r.x + r.w / 2, ly + lh * .88); ctx.textAlign = 'left';
            }
            if (!open) {                                                         // 뜯는 띠 (점선 위쪽) · 오른쪽부터 뜯으면 거울처럼 뒤집어 그려요
                const flip = b.tear > 0 && b.dir < 0;
                if (flip) { ctx.save(); ctx.translate(r.x + r.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-r.x - r.w / 2, 0); }
                const tx = r.x + r.w * b.tear;
                ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(170,130,145,.7)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(tx, cut); ctx.lineTo(r.x + r.w, cut); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = 'rgba(243,223,230,.95)'; for (const x of [r.x, r.x + r.w]) { ctx.beginPath(); ctx.moveTo(x, cut - 5); ctx.lineTo(x + (x === r.x ? 6 : -6), cut); ctx.lineTo(x, cut + 5); ctx.fill(); }
                if (b.tear > 0) {
                    ctx.save(); ctx.beginPath(); ctx.rect(r.x - 30, r.y - 80, tx - r.x + 30, cut - r.y + 80); ctx.clip();
                    ctx.translate(tx, cut); ctx.rotate(-.12 - .25 * b.tear); ctx.translate(-tx, -cut - 3);
                    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillRect(r.x, r.y, r.w, cut - r.y); ctx.strokeStyle = BC; ctx.strokeRect(r.x, r.y, r.w, cut - r.y); ctx.restore();
                    ctx.strokeStyle = 'rgba(170,130,145,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(r.x, cut);
                    for (let x = r.x, i = 0; x < tx; x += 5, i++) ctx.lineTo(x, cut + (i % 2 ? 2 : -1)); ctx.stroke();
                } else { ctx.fillStyle = '#b98a9a'; ctx.font = `12px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('◀ 여기를 쭉 뜯어요 ▶', r.x + r.w / 2, cut - 5); ctx.textAlign = 'left'; }
                if (flip) ctx.restore();
            }
            ctx.restore();
            if (b.strip) {                                                       // 날아가는 띠
                const q = (t - b.strip.t0) / 700;
                if (q < 1) { const s = b.strip; ctx.save(); ctx.globalAlpha = 1 - q; ctx.translate(s.x + s.w / 2 + q * 50 * b.dir, s.y - q * 40 + q * q * 160); ctx.rotate((-.4 - q * 1.2) * b.dir);
                    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h); ctx.strokeStyle = BC; ctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h); ctx.restore(); }
                else b.strip = null;
            }
        }
        const pcbImg = (st, img, sh, extra, flip) => stkImg(pcbS.ctx, img, st, sh, extra, flip);   // 📖 떼어지는 그림 = 스티커 엔진 (js/sticker.js)
        /* 잡은 점(C)과 손가락(F) 사이를 접는 선으로, 들린 쪽은 뒤집어 뒷면을 그려요 */
        const pcbPeel = (st, C, F, sh) => stkFold(pcbS, pcbS.ctx, pcbS.assets[st.k], st, C, F, sh);
        const PCB_DESK = { c: 'rgba(90,60,70,.2)', b: 3, y: 1.5 }, PCB_UP = { c: 'rgba(80,50,60,.3)', b: 18, y: 12 };
        function pcbDrawPiece(st, t) {
            if (st.hidden) return;
            const S = pcbS, a = S.assets[st.k], d = S.drag, peel = d && d.st === st && d.mode === 'peel';
            if (st.liner) {
                if (peel || st.half || st.snap) {
                    pcbImg(st, a.liner, PCB_UP);
                    if (peel) pcbPeel(st, d.C, d.F, null);
                    else if (st.half) pcbPeel(st, st.half.C, st.half.F, null);
                    else { pcbPeel(st, st.snap.C, stkSnap(st.snap, t), null); if (st.snap.end) st.snap = null; }   // 덜 벗기고 놓으면 제자리로 착 (스티커 엔진)
                    return;
                }
                pcbImg(st, a.piece, st.state === 'held' ? PCB_UP : PCB_DESK); return;
            }
            stkFlipIn(pcbS.ctx, a, st, t, PCB_UP, 1.06);                        // 뒷면 → 앞면으로 뒤집혀요 (스티커 엔진)
        }
        function pcbFallers(t) {
            const S = pcbS, ctx = S.ctx;
            S.fallers = S.fallers.filter(f => {
                const q = (t - f.t0) / 1100; if (q >= 1) return false;
                const a = S.assets[f.k]; ctx.save(); ctx.globalAlpha = 1 - q * q; ctx.translate(f.cx + f.vx * q * 120 + Math.sin(q * 7) * 10, f.cy + q * q * 260); ctx.rotate(f.rot + f.vr * q * 10);
                ctx.scale(f.s * Math.cos(q * 5) * (1 - q * .3), f.s * (1 - q * .3)); ctx.drawImage(a.liner, -a.w / 2, -a.h / 2); ctx.restore(); return true;
            });
        }
        const PCB_LAYER = { loose: 0, held: 3, free: 5 };
        const pcbHeld = () => pcbS.pieces.find(p => p.state === 'held');
        function pcbFrame() {
            const S = pcbS; if (!S.on) return;
            const t = pcbNow(), ctx = stkClear(S);                              // 🎞️ 스티커 엔진
            const fade = S.closing ? Math.max(0, Math.min(1, 1 - (t - S.closing) / 260)) : 1;   // 닫힐 때 스르르
            if (S.closing && fade <= 0) { closePieceBag(); return; }
            ctx.globalAlpha = fade;
            ctx.fillStyle = 'rgba(90,60,70,.10)'; ctx.fillRect(0, 0, S.W, S.H);
            for (const st of S.pieces) { pcbStep(st, t); if (st.sGoal != null) { st.s += (st.sGoal - st.s) * .2; if (Math.abs(st.sGoal - st.s) < .002) { st.s = st.sGoal; st.sGoal = null; } } }
            if (S.drag && S.drag.mode === 'free') pcbAnchor(S.drag.st, S.drag.last);
            pcbDrawBag(t);
            const bx = document.getElementById('pcbX');                          // ✕ : 뜯은 뒤 작아진 봉투 안쪽 오른쪽 위 (뜯기 전에는 안 보여요)
            if (bx) { const r = pcbBagRect(t), op = S.bag.state !== 'closed'; bx.style.left = (r.x + r.w - 20) + 'px'; bx.style.top = (r.y + 1) + 'px'; bx.style.opacity = fade; bx.style.visibility = op ? 'visible' : 'hidden'; }
            const order = [...S.pieces].sort((a, b) => (PCB_LAYER[a.state] - PCB_LAYER[b.state]) || (a.z - b.z));
            let dim = false;
            for (const st of order) {
                if (!dim && PCB_LAYER[st.state] >= 3) {                          // 집으면 뒤가 살짝 어두워져요
                    dim = true; const h = pcbHeld();
                    if (h) { const q = h.anim ? Math.min(1, Math.max(0, (t - h.anim.t0) / h.anim.dur)) : 1; ctx.fillStyle = `rgba(90,55,70,${.16 * q})`; ctx.fillRect(0, 0, S.W, S.H); }
                }
                if (st.state === 'free') pcbFallers(t);
                pcbDrawPiece(st, t);
            }
            if (!S.pieces.some(p => p.state === 'free')) pcbFallers(t);
            ctx.globalAlpha = 1;
            S.raf = requestAnimationFrame(pcbFrame);
        }

        /* ---------- 손가락 ---------- */
        const pcbEdge = (st, P) => stkEdge(pcbS.assets[st.k], st, P);        // 가장 가까운 가장자리 (스티커 엔진)
        const pcbPeeled = (st, C, F) => stkPeeled(pcbS.assets[st.k], st, C, F);   // 얼마나 벗겨졌는지 (스티커 엔진)
        function pcbStartPeel(st, C, P, base, resumed) { const S = pcbS; st.z = ++S.z; st.snap = null; st.half = null; S.drag = { st, mode: 'peel', C, F: base.slice(), base, start: P, last: P, lt: pcbNow(), resumed }; }
        function pcbDown(e) {
            const S = pcbS; if (!S.on || S.drag || S.closing) return;
            e.preventDefault(); const P = [e.clientX, e.clientY];
            const cap = () => stkCap(S.cv, e);
            const h = pcbHeld();
            const noTwz = () => !stkTwz(P[0], P[1]);   // 🪡 조각 집기 · 벗기기는 핀셋으로 (봉투 뜯기는 손으로 · 도련 10-21)
            if (h && !h.anim) {                                                  // 1) 손에 든 조각 : 뒷종이 벗기기
                if ((pcbEdge(h, P).d < PCB_GRAB || h.half) && noTwz()) return;
                const ei = pcbEdge(h, P);
                if (h.half && (pcbDist(P, h.half.F) < 56 || ei.inside || ei.d < PCB_GRAB)) { cap(); pcbStartPeel(h, h.half.C, P, h.half.F, true); pcbSay('그대로 쭉~ 마저 벗겨요'); return; }
                if (ei.d < PCB_GRAB) { cap(); const C = pcbToStage(h, ei.bp[0], ei.bp[1]); pcbStartPeel(h, C, P, C, false); pcbSay('살살… 뒷종이에서 떼어내는 중'); return; }
                if (ei.inside) { pcbSay('가운데 말고 <b>가장자리</b>를 손톱으로 밀어요 💅'); pcbWiggle(h); return; }
            }
            const b = S.bag;                                                     // 2) 봉투
            if (b.state === 'closed') {
                const B = S.BIG, cut = B.y + B.h * .24 * .34;
                if (P[1] > B.y - 24 && P[1] < cut + 22 && P[0] > B.x - 24 && P[0] < B.x + B.w + 24) { cap(); S.drag = { mode: 'tear', lastX: P[0], last: P, lt: pcbNow() }; pcbSay('찌이익…'); return; }
                if (pcbIn(P, B)) { cap(); S.drag = { mode: 'bag', start: P, last: P }; return; }   // 누르면 안내 · 끌면 옮기기
            } else if (!b.busy && pcbIn(P, S.SMALL, 10)) { cap(); S.drag = { mode: 'bag', start: P, last: P }; return; }
            for (const st of S.pieces.filter(p => p.state === 'loose' && !p.anim).sort((x, y) => y.z - x.z)) {   // 3) 조각 집기
                const ei = pcbEdge(st, P); if (ei.inside || ei.d < 8) { if (noTwz()) return; pcbLift(st); return; }
            }
            if (h && !h.anim) { pcbPutBack(h); return; }                         // 4) 빈 곳 : 들고 있던 걸 내려놓기
            stkBar(e, P);                                                       // 5) 날짜바 위 → 페이지 옮기기
        }
        function pcbMove(e) {
            const S = pcbS, d = S.drag; if (!d) return;
            const P = [e.clientX, e.clientY], t = pcbNow();
            if (d.mode === 'tear') {
                const sp = pcbDist(P, d.last) / Math.max(1, t - d.lt); d.lt = t;
                const b = S.bag, dx = P[0] - d.lastX;
                if (!b.tear && Math.abs(dx) < 3) return;                         // 처음 민 쪽이 뜯는 방향 (왼→오 · 오→왼 다 돼요)
                if (!b.tear) b.dir = dx > 0 ? 1 : -1;
                if (Math.abs(P[1] - (S.BIG.y + S.BIG.h * .08)) < 90 && dx * b.dir > 0) { b.tear = Math.min(1, b.tear + Math.abs(dx) / (S.BIG.w * .85)); pcbNoise(Math.min(.4, sp * .35)); }
                d.lastX = P[0]; d.last = P; if (S.bag.tear >= 1) pcbOpen(); return;
            }
            if (d.mode === 'bag') {
                if (!d.moved && pcbDist(P, d.start) > 8) { d.moved = true; pcbSay('봉투를 옮겨요 ✉️'); }
                if (d.moved) pcbShift(P[0] - d.last[0], P[1] - d.last[1]);
                d.last = P; return;
            }
            if (d.mode === 'free') { stkSway(d.st, P[0] - d.last[0], d.baseRot); d.last = P; return; }
            const sp = stkSpeed(d, P);
            const st = d.st, Fr = stkPull(d, P, !d.resumed);                     // 끈적임 (스티커 엔진 · 반쯤 벗긴 것을 마저 = 그대로)
            if (d.caught) {                                                      // 걸림 : 손가락은 가는데 스티커는 버텨요
                d.F = [d.catchF[0] + (Fr[0] - d.catchFr[0]) * .1, d.catchF[1] + (Fr[1] - d.catchFr[1]) * .1]; pcbNoise(Math.min(.12, sp * .08));
                if (pcbDist(Fr, d.catchFr) > 90) { d.caught = false; d.F = Fr; pcbBuzz(25); pcbSay('찌직! 넘어갔어요 ✨ 조금만 더!'); }
                return;
            }
            d.F = Fr; pcbNoise(Math.min(.35, sp * .25));
            const fr = pcbPeeled(st, d.C, d.F);
            if (st.liner && fr >= st.catchAt) { st.catchAt = 2; d.caught = true; d.catchF = Fr.slice(); d.catchFr = Fr.slice(); pcbBuzz(35); pcbSay('어? 걸렸어요! 🫣 <b>힘줘서 한 번 더</b> 당겨요'); return; }
            if (fr > .6 && !d.half) { d.half = 1; pcbSay('거의 다 됐어요… 조금만 더!'); }
            if (fr >= .9) pcbDetach(P);
        }
        function pcbDetach(P) {
            const S = pcbS, st = S.drag.st;
            if (st.liner) { S.fallers.push({ k: st.k, cx: st.cx, cy: st.cy, rot: st.rot, s: st.s, vx: Math.random() < .5 ? -1 : 1, vr: (Math.random() - .5) * .1, t0: pcbNow() }); st.liner = false; }
            const local = pcbToLocal(st, S.drag.C[0], S.drag.C[1]); pcbNoise(0);
            st.state = 'free'; st.t0 = pcbNow(); st.half = null; st.sGoal = stkPageScale() || S.SP; st.z = ++S.z;   // 📏 떨어지는 순간 페이지에 붙을 진짜 크기로 (원본 × 페이지 배율 · 도련 · 10-18)
            S.drag = { st, mode: 'free', local, baseRot: st.rot, last: P }; pcbAnchor(st, P);
            pcbBuzz(15); pcbSay('톡! 뒷종이가 벗겨졌어요 ✨ 원하는 곳에 붙여 보세요');
        }
        function pcbAnchor(st, P) { const [lx, ly] = pcbS.drag.local, c = Math.cos(st.rot), s = Math.sin(st.rot); st.cx = P[0] - (lx * c - ly * s) * st.s; st.cy = P[1] - (lx * s + ly * c) * st.s; }
        function pcbUp() {
            const S = pcbS, d = S.drag; if (!d) return;
            S.drag = null; pcbNoise(0);
            const st = d.st;
            if (d.mode === 'tear') { if (S.bag.state === 'closed' && S.bag.tear > 0) pcbSay('조금만 더 쭉~ 끝까지 뜯어요'); return; }
            if (d.mode === 'bag') {
                if (d.moved) pcbSay(S.bag.state === 'closed' ? '윗부분 <b>점선</b>을 옆으로 쓱 밀어서 뜯어요 ✂️' : '조각을 <b>톡</b> 눌러서 집어 보세요');
                else if (S.bag.state === 'closed') { pcbSay('윗부분 <b>점선</b>을 옆으로 쓱 밀어서 뜯어요 ✂️'); S.bag.wig = pcbNow(); }
                else if (!S.bag.busy) pcbShut('남은 조각은 봉투에 다시 넣었어요');
                return;
            }
            if (d.mode === 'peel') {
                const fr = pcbPeeled(st, d.C, d.F);
                if (st.liner && fr >= .12) { st.half = { C: d.C, F: [d.F[0] + (d.C[0] - d.F[0]) * .15, d.F[1] + (d.C[1] - d.F[1]) * .15] }; pcbSay('반쯤 벗겨졌어요. 들린 끝을 잡고 <b>마저</b> 당겨요'); }
                else { st.snap = { C: d.C, F: d.F, t0: pcbNow() }; if (pcbDist(d.F, d.C) > 20) pcbSay('앗, 다시 붙어버렸어요 🫣'); }
                return;
            }
            if (S.bag.state === 'open' && !S.bag.busy && pcbIn(d.last, S.SMALL, 14)) {   // 작은 봉투에 쏙
                st.liner = true; st.state = 'loose';
                pcbAnim(st, { cx: S.SMALL.x + S.SMALL.w / 2, cy: S.SMALL.y + S.SMALL.h * .6, s: .05 }, 260, { done: () => { S.pieces = S.pieces.filter(p => p !== st); pcbEnd(); } });
                pcbSay('봉투에 쏙 넣었어요'); return;
            }
            pcbBuzz(8); pcbStick(st);
        }
        const pcbWiggle = stkWiggle;
        const pcbBuzz = buzz;   // 🧰 js/util.js

        /* ---------- 봉투 열기 · 쏟기 · 집기 ---------- */
        function pcbOpen() {
            const S = pcbS, b = S.bag, r = S.BIG, hh = r.h * .24;
            pcbNoise(0); S.drag = null; b.state = 'open'; b.busy = true; pcbBuzz(20);
            b.strip = { x: r.x, y: r.y, w: r.w, h: hh * .34, t0: pcbNow() };
            pcbSpill(S.assets.map((a, k) => k), [r.x + r.w / 2, r.y + r.h * .45], 150);
            const t0 = pcbNow() + 150 + S.assets.length * 70 + 250; b.move = { t0, dur: 480 }; setTimeout(() => { b.busy = false; }, t0 - pcbNow() + 500);
            pcbSay('와르르~ 하나 <b>톡</b> 눌러서 집어 보세요');
        }
        function pcbSpill(ks, from, delay) {
            const S = pcbS, half = Math.max(...S.assets.map(a => Math.max(a.w, a.h))) * S.SL / 2, placed = [];
            const B = S.BIG, sw = Math.min(S.W - 16, Math.max(300, B.w * 1.9)), sh = Math.min(S.H - 78, Math.max(320, B.h * 1.6));   // 봉투 둘레 (화면 안)
            const PR = { x: Math.max(8, Math.min(S.W - 8 - sw, B.x + B.w / 2 - sw / 2)), y: Math.max(70, Math.min(S.H - 8 - sh, B.y + B.h / 2 - sh / 2)), w: sw, h: sh };
            ks.forEach((k, i) => {
                let best = null, bs = -1;                                        // 살짝 겹치게 흩어지되, 한곳에 몰리지 않게
                for (let j = 0; j < 10; j++) {
                    const c = [PR.x + half + 10 + Math.random() * Math.max(1, PR.w - 2 * half - 20), PR.y + half + 12 + Math.random() * Math.max(1, PR.h - 2 * half - 24)];
                    if (pcbIn(c, S.SMALL, half * .7)) continue;
                    const m = Math.min(999, ...placed.map(p => pcbDist(p, c))); if (m > bs) { bs = m; best = c; }
                }
                best = best || [PR.x + PR.w / 2, PR.y + PR.h / 2]; placed.push(best);
                const st = { k, cx: from[0], cy: from[1], rot: Math.random() - .5, s: S.SL * .6, state: 'loose', liner: true, z: ++S.z, catchAt: 2, hidden: true };
                pcbAnim(st, { cx: best[0], cy: best[1], rot: (Math.random() - .5) * 1.3, s: S.SL }, 460, { delay: delay + i * 70, arc: 30 + Math.random() * 30, hide: true });
                S.pieces.push(st);
            });
        }
        function pcbLift(st) {
            const S = pcbS, h = pcbHeld(); if (h) pcbPutBack(h, true);
            st.state = 'held'; st.home = { cx: st.cx, cy: st.cy, rot: st.rot, s: st.s }; st.z = ++S.z; st.half = null; st.snap = null;
            st.catchAt = Math.random() < .55 ? .32 + Math.random() * .22 : 2;  // 가끔 반쯤에서 걸려요
            pcbAnim(st, { cx: S.HOLD.cx, cy: S.HOLD.cy, rot: (Math.random() - .5) * .14, s: S.SH }, 340, { ease: pcbBack });
            pcbBuzz(6); pcbSay('집었어요! <b>가장자리</b>를 손톱으로 밀어 뒷종이를 벗겨요');
        }
        function pcbPutBack(st, quiet) {
            st.state = 'loose'; st.half = null; st.snap = null;
            pcbAnim(st, st.home || { s: pcbS.SL }, 280); if (!quiet) pcbSay('다시 내려놨어요. 다른 조각도 골라 보세요');
        }
        /* 남은 조각을 봉투에 넣고 닫기 */
        function pcbShut(msg) {
            const S = pcbS, c = [S.SMALL.x + S.SMALL.w / 2, S.SMALL.y + S.SMALL.h * .6];
            S.bag.wig = pcbNow(); S.bag.busy = true;
            for (const st of S.pieces) { st.state = 'loose'; st.half = null; st.snap = null; pcbAnim(st, { cx: c[0], cy: c[1], s: .05 }, 300); }
            pcbSay(msg); setTimeout(() => { S.closing = pcbNow(); }, 340);
        }
        /* 조각이 다 없어지면 (다 붙이거나 봉투에 넣으면) 닫혀요 */
        function pcbEnd() { const S = pcbS; if (!S.pieces.length && S.bag.state === 'open' && !S.closing) S.closing = pcbNow() + 200; }

        /* 놓은 자리에 붙이기 : 화면에 보이던 크기 · 기울기 그대로 페이지에 붙어요 (js/stickerpeel.js 와 같은 방법) */
        function pcbStick(st) {
            const S = pcbS, a = S.assets[st.k], s = st.sGoal != null ? st.sGoal : st.s;
            S.pieces = S.pieces.filter(p => p !== st); S.used.add(st.k);
            const el = stkStick({ src: a.src, cx: st.cx, cy: st.cy, w: (a.w - a.m * 2) * s, h: (a.h - a.m * 2) * s, deg: stkDeg(st.rot, .5), clamp: true, orig: true,   // 📄 붙이기 = 스티커 엔진 (js/sticker.js)
                own: S.own ? el => stkUse(S.own.id, S.own.slots ? S.own.slots[st.k] : st.k, el) : null });   // 🎒 그 조각은 영원히 사라져요
            if (!el) { pcbEnd(); return; }
            if (S.pieces.length) pcbSay(`꾹! 붙였어요 ✨ 조각이 <b>${S.pieces.length}개</b> 남았어요`);
            else { pcbSay('꾹! 다 붙였어요 ✨'); pcbEnd(); }
        }

        /* ---------- 소리 : 봉투를 뜯을 때 · 뒷종이를 벗길 때 '찌이익' (js/stickerpeel.js 와 같은 소리) ---------- */
        const pcbNoise = stkNoise;                                           // 🔊 떼는 소리 = 스티커 엔진 (js/sticker.js · 🏷️ 씰과 같은 소리 하나)

        window.openPieceBag = openPieceBag; window.closePieceBag = closePieceBag; window.pcbNoise = pcbNoise;   // 🧩 수첩 속 봉투 뜯는 소리도 같게 (js/stknote.js)
