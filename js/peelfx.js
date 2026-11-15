/* 말랑달콤 다이어리 - js/peelfx.js
   🏷️ 씰스티커처럼 떼어지는 연출 (짧게 저절로) : 페이지에 붙은 스티커를 옮길 때(js/elements.js makeTransformable)
   - 끄는 방향 뒤쪽 가장자리가 먼저 들려서 앞으로 접혀 넘어가요 (접힌 쪽은 크림색 뒷면 + 그림자)
   - pfxPeel(el, x, y, dx, dy, rotDeg, done) : 화면 좌표 (x, y)를 잡고 (dx, dy) 방향으로 떼기 · 끝나면 done() · 돌려준 함수를 부르면 바로 멈춰요
   - pfxSeal(o) : 📄 모조지 · 페이지에 붙은 스티커를 핀셋으로 떼기 = 🏷️ 스티커 엔진(js/sticker.js)의 좌표 · 접혀 떼어지는 그림 · 떼어진 정도 · 제자리로 착 · 살랑을 같이 써요 (도련 11-16 · 씰 · 조각과 같은 그림)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (연출 없이 바로 떠요) */

        const PFX_MS = 190, PFX_UPTO = .72;
        /* o (생략 가능) : { upto: 얼마나 들릴지(0~1) · ms: 들리는 시간 · flat: true 면 들렸다가 다시 평평해지며 끝나요 (페이지 스티커 옮길 때) }
           스티커가 움직이는 중이어도 접힌 쪽이 따라와요 (매 장면 el 의 transform 을 다시 읽어요) */
        function pfxPeel(el, x, y, dx, dy, rotDeg, done, o) {
            o = o || {};
            const UPTO = o.upto || PFX_UPTO, MS = o.ms || PFX_MS, FLAT = o.flat ? (o.flatMs || 150) : 0;
            const w = el.offsetWidth, h = el.offsetHeight, len = Math.hypot(dx, dy);
            if (!w || !h || !len) { done(); return () => {}; }
            /* 화면 → 스티커 안쪽 좌표 (회전 · 크기 되돌리기) */
            const r = el.getBoundingClientRect(), a = (rotDeg || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
            const S = r.width / (w * Math.abs(c) + h * Math.abs(s)) || 1;
            const qx = (x - (r.left + r.width / 2)) / S, qy = (y - (r.top + r.height / 2)) / S;
            const G = [w / 2 + qx * c + qy * s, h / 2 - qx * s + qy * c];
            const n = [(dx * c + dy * s) / len, (-dx * s + dy * c) / len];
            /* 잡은 곳에서 끄는 반대쪽으로 가장 먼 가장자리 = 처음 들리는 곳(C) · 그 맞은편까지 길이(span) */
            const hit = (p, d) => { let t = 1e9; if (d[0]) t = Math.min(t, ((d[0] > 0 ? w : 0) - p[0]) / d[0]); if (d[1]) t = Math.min(t, ((d[1] > 0 ? h : 0) - p[1]) / d[1]); return Math.max(0, t); };
            const P = [Math.min(w, Math.max(0, G[0])), Math.min(h, Math.max(0, G[1]))];
            const back = hit(P, [-n[0], -n[1]]), C = [P[0] - n[0] * back, P[1] - n[1] * back], span = hit(C, n);

            /* 접혀 넘어간 뒷면 : 감싸는 상자(뒤집기 + 그림자) 안에 똑같이 생긴 복사본(크림색 · 반쪽만) */
            const wrap = document.createElement('div'), cs = getComputedStyle(el);
            wrap.className = 'pfx-flap';
            Object.assign(wrap.style, { position: cs.position === 'fixed' ? 'fixed' : 'absolute', left: el.offsetLeft + 'px', top: el.offsetTop + 'px', width: w + 'px', height: h + 'px', zIndex: cs.zIndex });
            const cp = el.cloneNode(true);
            cp.querySelectorAll('.handle, .rot-zone').forEach(q => q.remove());
            cp.classList.remove('selected', 'lifting', 'drag', 'back');
            Object.assign(cp.style, { position: 'absolute', left: '0', top: '0', margin: '0', transform: 'none', width: w + 'px', height: h + 'px', boxSizing: 'border-box' });
            cp.classList.add('pfx-back');
            wrap.appendChild(cp);
            el.parentNode.insertBefore(wrap, el.nextSibling);

            const half = (M, sg) => { const p = [-n[1] * 4000, n[0] * 4000], q = [n[0] * 4000 * sg, n[1] * 4000 * sg];
                return `polygon(${M[0] + p[0]}px ${M[1] + p[1]}px, ${M[0] - p[0]}px ${M[1] - p[1]}px, ${M[0] - p[0] + q[0]}px ${M[1] - p[1] + q[1]}px, ${M[0] + p[0] + q[0]}px ${M[1] + p[1] + q[1]}px)`; };
            const t0 = performance.now();
            let raf = 0, over = false;
            const frame = now => {
                if (over) return;
                const tt = now - t0, k = Math.min(1, tt / MS);
                let e = 1 - Math.pow(1 - k, 2);
                if (FLAT && tt > MS) { const q = Math.min(1, (tt - MS) / FLAT); e = 1 - q * q; }   // 평평해지기
                const d = Math.max(.5, span * 2 * UPTO * e), base = el.style.transform;
                wrap.style.left = el.offsetLeft + 'px'; wrap.style.top = el.offsetTop + 'px';
                const M = [C[0] + n[0] * d / 2, C[1] + n[1] * d / 2], md = M[0] * n[0] + M[1] * n[1];
                el.style.clipPath = half(M, 1);                                       // 아직 붙어 있는 쪽
                cp.style.clipPath = half(M, -1);                                      // 들린 쪽 → 접는 선으로 뒤집어요
                const A = 1 - 2 * n[0] * n[0], B = -2 * n[0] * n[1], D = 1 - 2 * n[1] * n[1];
                wrap.style.transform = `${base} translate(${-w / 2}px, ${-h / 2}px) matrix(${A}, ${B}, ${B}, ${D}, ${2 * md * n[0]}, ${2 * md * n[1]}) translate(${w / 2}px, ${h / 2}px)`;
                if (tt < MS + FLAT) raf = requestAnimationFrame(frame); else { stop(); done(); }
            };
            const stop = () => { if (over) return; over = true; cancelAnimationFrame(raf); el.style.clipPath = ''; wrap.remove(); };
            frame(t0);
            return stop;
        }
        window.pfxPeel = pfxPeel;

/* =====================================================================
   🏷️ 손가락을 따라 떼어지는 씰스티커 (씰스티커_RnD/seal-sticker-test.html 의 drawPeel · peeledInfo · detach 를 그대로 옮겼어요)
   pfxSeal({ src, cx, cy, w, h, rot, x, y, onDetach, onDrop, onCancel })
   - src : img · canvas (그림) · cx, cy : 화면에 보이는 가운데 · w, h : 화면에 보이는 크기 · rot : 라디안 · (x, y) : 처음 누른 자리
   - 누른 자리에서 가장 가까운 가장자리(C)가 먼저 들려요 → 끄는 손가락(F)을 끈적하게 따라 접혀 넘어가요 (뒷면 크림색 + 말린 음영 + 그림자)
   - 가장자리가 78% 넘게 들리면 '톡' 떼어져서(onDetach) 뒷면 → 앞면으로 뒤집히며 1.07배로 떠서 손가락을 따라와요
   - 놓으면 : 다 뗐으면 onDrop(cx, cy, rot, baseRot, { w, h }) · 덜 뗐으면 제자리로 착 다시 붙고 onCancel()   ({ w, h } = 놓을 때 화면에 보이던 그림 크기)
   - real : 페이지에 붙을 진짜 크기 { w, h, src? } (화면 px · 함수로 줘도 돼요) → 하얀 창에서 완전히 떨어지는 순간 그 크기로 스르르 바뀌어요 (도련 · 10-18)
            src(원본 그림)를 주면 크게 바뀌어도 흐려지지 않아요 · 아직 못 읽었으면 읽히는 대로 바뀌어요
   - 돌려준 { move(x, y), up(), kill() } 로 손가락 움직임을 넘겨 줘요 (화면 맨 위 투명 캔버스에 그려요)
   ===================================================================== */
        const PFX_DETACH = .78, PFX_GRAB = 26;                               // PFX_GRAB : 가장자리에서 이만큼(화면 px) 안을 잡으면 잡은 자리부터 떼어져요
        function pfxMk(w, h) { return mkCanvas(w, h, true); }   // 🧰 js/util.js (올림)
        /* 앞면 · 뒷면(누런 흰 종이) · 가장자리 점들 */
        function pfxAsset(src, w, h) {
            const R = Math.min(3, window.devicePixelRatio || 1), m = 2, W = Math.ceil((w + m * 2) * R), H = Math.ceil((h + m * 2) * R);
            const front = pfxMk(W, H), f = front.getContext('2d'); f.drawImage(src, m * R, m * R, w * R, h * R);
            const back = pfxMk(W, H), bk = back.getContext('2d');
            bk.drawImage(front, 0, 0); bk.globalCompositeOperation = 'source-in'; bk.fillStyle = '#f4efe9'; bk.fillRect(0, 0, W, H);
            bk.globalCompositeOperation = 'source-atop'; bk.globalAlpha = .25;
            for (let i = 0; i < W * H / 300; i++) { bk.fillStyle = Math.random() < .5 ? '#fff' : '#e4dcd3'; bk.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
            const aw = w + m * 2, ah = h + m * 2, edge = [];
            let A = null;
            try { const d = f.getImageData(0, 0, W, H).data; A = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : d[(y * W + x) * 4 + 3]; } catch (e) { A = null; }   // 다른 곳 그림이라 못 읽으면 네모 가장자리
            if (A) {
                const st = Math.max(2, Math.round(Math.max(W, H) / 120));
                for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st)
                    if (A(x, y) > 128 && (A(x - st, y) <= 128 || A(x + st, y) <= 128 || A(x, y - st) <= 128 || A(x, y + st) <= 128)) edge.push([x / R - aw / 2, y / R - ah / 2]);
            }
            if (edge.length < 8) for (let i = 0; i <= 40; i++) { const q = i / 40; edge.push([-w / 2 + w * q, -h / 2], [-w / 2 + w * q, h / 2], [-w / 2, -h / 2 + h * q], [w / 2, -h / 2 + h * q]); }
            return { w: aw, h: ah, front, back, edge };
        }
        /* 떼는 동안 찌익 소리 (씰스티커 시트와 같은 소리 · 설정의 '연출 소리'를 따라요 · js/sound.js) */
        const pfxSnd = { ac: null, g: null };
        function pfxNoise(v) {
            if (!v && !pfxSnd.g) return;
            const ac = typeof sndFx === 'function' ? sndFx() : null; if (!ac) return;
            try {
                if (pfxSnd.ac !== ac) {
                    const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = buf.getChannelData(0);
                    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < .3 ? 1 : .3);
                    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
                    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = .7;
                    pfxSnd.g = ac.createGain(); pfxSnd.g.gain.value = 0; src.connect(bp).connect(pfxSnd.g).connect(sndOut() || ac.destination); src.start(); pfxSnd.ac = ac;
                }
                pfxSnd.g.gain.setTargetAtTime(v, ac.currentTime, .03);
            } catch (e) {}
        }
        function pfxSeal(o) {
            const DPR = Math.min(window.devicePixelRatio || 1, 3), VW = window.innerWidth, VH = window.innerHeight;
            const cv = pfxMk(VW * DPR, VH * DPR); cv.className = 'pfx-stage'; document.body.appendChild(cv);
            const ctx = cv.getContext('2d'), fl = pfxMk(VW * DPR, VH * DPR);
            let asset = pfxAsset(o.src, o.w, o.h); const st = { cx: o.cx, cy: o.cy, rot: o.rot || 0, s: 1, state: 'on' };
            const toStage = (lx, ly) => stkToStage(st, lx, ly), toLocal = (x, y) => stkToLocal(st, x, y);   // 🏷️ 스티커 엔진 (js/sticker.js · 씰 · 조각 · 📄 모조지 · 페이지 스티커가 같은 계산 · 도련 11-16)
            const PS = { fl, DPR, W: VW, H: VH }, FLAT = { c: 'rgba(90,60,70,.12)', b: 2, y: 1 };
            /* 들리는 가장자리 : 가장자리 가까이(PFX_GRAB)를 잡고 안쪽으로 끌면 🏷️ 하얀 스티커 창처럼 잡은 자리부터 바로 말려 올라와요
               가운데를 잡았으면 끄는 방향의 반대쪽 끝(손가락 줄 위)에서부터 접혀 넘어와요 · 스티커가 커도 손가락 한 뼘이면 떨어지게 */
            const pickEdge = (vx, vy) => {
                const v = Math.hypot(vx, vy) || 1, ux = vx / v, uy = vy / v; let best = 1e12, bp = null, lo = 1e9, hi = -1e9, near = null, nd = 1e12;
                const pts = asset.edge.map(q => toStage(q[0], q[1]));
                for (const [x, y] of pts) { const pr = x * ux + y * uy; lo = Math.min(lo, pr); hi = Math.max(hi, pr); const d = (x - o.x) ** 2 + (y - o.y) ** 2; if (d < nd) { nd = d; near = [x, y]; } }
                const gain = o.soft ? Math.min(1.7, Math.max(1.25, (hi - lo) / 160)) : Math.max(1.25, (hi - lo) / 75);   // 📄 큰 종이(soft)는 천천히 말려요 (한 번에 확 넘어가면 판때기 같아요)
                if (o.soft) {                                                                                    // 📄 큰 종이 : 끄는 방향 반대쪽 모서리(귀퉁이)부터 돌돌
                    let bc = null, bs = 1e12; for (const [x, y] of pts) { const sc = (x - o.x) * ux + (y - o.y) * uy; if (sc < bs) { bs = sc; bc = [x, y]; } }
                    return { C: bc, gain };
                }
                if (near && Math.sqrt(nd) < PFX_GRAB && (st.cx - near[0]) * ux + (st.cy - near[1]) * uy > 0) return { C: near, gain: Math.max(1, (hi - lo) / 95) };   // 가장자리를 잡고 안쪽으로
                for (const [x, y] of pts) { const pr = (x - o.x) * ux + (y - o.y) * uy, pp = Math.abs((x - o.x) * -uy + (y - o.y) * ux), sc = pr + pp * .6; if (sc < best) { best = sc; bp = [x, y]; } }
                return { C: bp, gain };
            };
            let drag = { mode: 'peel', C: null, F: null, start: [o.x, o.y], last: [o.x, o.y], lt: performance.now() }, snap = null, raf = 0, dead = false, grow = null;
            /* 📏 떨어지는 순간 진짜 크기로 : 그림을 그 크기로 다시 만들고(선명하게) 보이는 크기에서 1까지 키워요 · 잡은 자리는 손가락 끝에 그대로 */
            function realGo() {
                if (grow || !o.real || st.state !== 'free') return;
                let R = null; try { R = typeof o.real === 'function' ? o.real() : o.real; } catch (e) {}
                if (!R || !(R.w > 0) || !(R.h > 0)) return;
                let na; try { na = pfxAsset(R.src || o.src, R.w, R.h); } catch (e) { na = null; }
                if (!na) { grow = { done: 1 }; return; }
                const q = na.w / asset.w; asset = na; st.s /= q;
                grow = { t0: performance.now(), s0: st.s, off: drag && drag.off ? drag.off.slice() : null };
            }
            function realStep(t) {
                if (!grow || grow.done) return;
                const k = Math.min(1, (t - grow.t0) / 240), e = 1 - Math.pow(1 - k, 3);
                st.s = grow.s0 + (1 - grow.s0) * e;
                if (drag && drag.mode === 'free' && grow.off) { const z = st.s / grow.s0; drag.off = [grow.off[0] * z, grow.off[1] * z]; st.cx = drag.last[0] - drag.off[0]; st.cy = drag.last[1] - drag.off[1]; }
                if (k >= 1) grow.done = 1;
            }

            const drawSticker = (img, extra = 1, flip = 1, shadow = null) => stkImg(ctx, img, st, shadow, extra, flip, asset.w, asset.h);   // 📖 떼어지는 그림 = 스티커 엔진
            const drawPeel = (img, C, F) => stkFold(PS, ctx, asset, st, C, F, FLAT, o.soft);
            const peeledInfo = (C, F) => stkPeeled(asset, st, C, F);
            function frame(t) {
                if (dead) return;
                ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, VW, VH);
                if (drag && drag.mode === 'peel') { if (drag.C) drawPeel(asset.front, drag.C, drag.F); else drawSticker(asset.front, 1, 1, FLAT); }
                else if (snap) {
                    drawPeel(asset.front, snap.C, stkSnap(snap, t));                       // 덜 뗐으면 제자리로 착 (스티커 엔진)
                    if (snap.end) { kill(); if (o.onCancel) o.onCancel(); return; }
                } else if (st.state === 'free') {
                    realGo(); realStep(t);
                    stkFlipIn(ctx, asset, st, t, { c: 'rgba(80,50,60,.25)', b: 18, y: 12 }, 1.07, asset.w, asset.h);   // 뒷면 → 앞면 뒤집기 (스티커 엔진)
                }
                raf = requestAnimationFrame(frame);
            }
            function detach(P) {
                const [lx, ly] = toLocal(drag.C[0], drag.C[1]);
                st.state = 'free'; st.t0 = performance.now();
                const [gx, gy] = toStage(lx, ly);                                                           // 손가락 끝에 잡은 지점이 오도록
                drag = { mode: 'free', off: [gx - st.cx, gy - st.cy], baseRot: st.rot, last: P, lt: performance.now() };
                st.cx = P[0] - drag.off[0]; st.cy = P[1] - drag.off[1];
                pfxNoise(0);
                buzz(15);
                if (o.onDetach) o.onDetach();
                realGo();                                                                                   // 📏 이 순간 진짜 크기로
            }
            function move(x, y) {
                if (!drag || dead) return; const P = [x, y], now = performance.now();
                const sp = Math.hypot(P[0] - drag.last[0], P[1] - drag.last[1]) / Math.max(1, now - drag.lt); drag.last = P; drag.lt = now;
                if (drag.mode === 'peel') {
                    pfxNoise(Math.min(.35, sp * .25));
                    // 끈적임 : 처음엔 손가락보다 조금 덜 따라오다가 곧 같이 움직여요 (너무 끈적이면 끌어도 안 떼어지는 것 같아요)
                    const dx = P[0] - drag.start[0], dy = P[1] - drag.start[1], L = Math.hypot(dx, dy), k = Math.min(1, .75 + L / 160);
                    if (!drag.C) { if (L < 2) return; const e = pickEdge(dx, dy); drag.C = e.C; drag.gain = e.gain; }
                    drag.F = [drag.C[0] + dx * k * drag.gain, drag.C[1] + dy * k * drag.gain];
                    if (peeledInfo(drag.C, drag.F) >= PFX_DETACH) detach(P);
                } else if (drag.mode === 'free') {
                    const nx = P[0] - drag.off[0], ny = P[1] - drag.off[1];
                    stkSway(st, nx - st.cx, drag.baseRot); st.cx = nx; st.cy = ny;
                }
            }
            function up() {
                if (!drag || dead) return; const d = drag; drag = null;
                if (d.mode === 'peel') { pfxNoise(0); if (!d.C) { kill(); if (o.onCancel) o.onCancel(); return; } snap = { C: d.C, F: d.F, t0: performance.now() }; return; }      // 덜 뗐으면 착 다시 붙어요
                const r = Math.max(-.5, Math.min(.5, st.rot));
                buzz(8);
                if (grow && !grow.done) { st.s = 1; grow.done = 1; }                                       // 다 커지기 전에 놓으면 진짜 크기로
                const sz = { w: (asset.w - 4) * st.s, h: (asset.h - 4) * st.s };                         // pfxAsset 의 여백(m = 2) 양쪽을 빼요
                kill(); if (o.onDrop) o.onDrop(st.cx, st.cy, r, d.baseRot, sz);
            }
            function kill() { if (dead) return; dead = true; pfxNoise(0); cancelAnimationFrame(raf); cv.remove(); }
            raf = requestAnimationFrame(frame);
            return { move, up, kill, get free() { return st.state === 'free'; } };
        }
        window.pfxSeal = pfxSeal;
