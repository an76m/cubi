/* 말랑달콤 다이어리 - js/world.js
   🌳 말랑 광장 = 👭 말랑달콤 다꾸러 모임방 (도련 11-02 · 임시 2.5D 월드)
   - 이동 창 · 카페 창의 '👭 말랑달콤 다꾸러 모임방' 칸 (data-place="world" · 네이버 카페 링크 대신)
   - 땅 2400 × 1600 (img/world/ground.svg) 위에 나무 · 벤치 · 분수 · 꽃 · 가게 · 가로등 그림 (img/world/*.svg · 같은 이름으로 바꾸면 그림만 바뀌어요)
       물건은 발끝(아래 가운데) 기준 · 아래쪽에 있는 것이 앞에 그려져요 (y 순서) · 분수 물 · 가게 벽 · 나무 줄기는 못 지나가요
   - 캐릭터 = 인형방의 내 첫 인형 (없으면 기본 마네킹) · 이름표 = 내 닉네임(없으면 인형 이름) · 왼쪽으로 가면 뒤집기 · 걸을 때 콩콩
   - 움직이기 : 💻 방향키 · WASD · 땅 클릭 / 📱 왼쪽 아래 조이스틱 · 땅 톡 · Enter = 말하기 칸
   - 👭 같이 걷기 (2단계 · 도련 11-02) : 광장 서버(도구/광장서버 · Cloudflare Durable Objects) 에 WebSocket 으로
       WORLD_URL 이 비어 있으면 = 예전처럼 혼자 걷기 (말풍선 나만)
       🔒 로그인한 다꾸러만 (게스트 · 이 기기 폴더 저장 = 못 들어와요) · 한 방 30명 · 꽉 차면 2번 방 …
       보내는 것 : 내 이름 · 인형 그림(작은 그림 한 장) · 위치(움직일 때 1초에 6번쯤) · 말풍선(60자)
       말풍선은 서버에 저장하지 않아요 · 걸러내기 없음 (도련 11-02 : 분위기를 보고 하나씩)
   - 🧭 아끼는 방식 (도련 11-06) : 위치를 1초에 6번 보내던 것 → '가는 곳'이 바뀔 때만 go { x, y, tx, ty, s, f } (땅 톡 = 목적지 · 방향키 · 조이스틱 = 방향이 바뀔 때 · 걷는 중엔 1.5초마다 한 번 맞추기)
       다른 다꾸러는 각자 화면에서 그 목적지로 걸어가요 (못 지나가는 곳도 똑같이) · 무료 한도 · 집 업로드를 몇십 배 아껴요 · 예전 앱의 mv 도 그대로 받아요
       인형 그림은 키 96px 작은 그림 (9KB 까지) · 묶음 b { m: [[id, x, y, tx, ty, s, f] …] } 도 받아요 (집 PC 서버)
   - 🎉 이벤트 광장 (도련 11-06) : openWorld({ url, name }) = 그 서버로 (집 PC + Cloudflare Tunnel · 도구/광장서버_집PC) · 입구는 notice.json 'ev' (js/service.js evPaint)
       서버가 looks (이벤트옷 그림 주소) 를 주면 인형 대신 그 옷 (l = 몇 번 옷) · 나가면 내 인형으로 돌아와요
   - 닫기 없음 = 오른쪽 위 '이동' (다른 장소처럼) · Esc = 내 방 */
    (function () {
        const WORLD_URL = 'https://malang-world.podcast20260131.workers.dev';                                                   // 🌐 광장 서버 주소 (https://malang-world.○○○.workers.dev · 도련이 올린 뒤 넣어요)
        const W = 2400, H = 1600, V = '?v=20261009-1119', DIR = 'img/world/';
        const SPEED = 260, CH_H = 140, CH_R = 18, SAY_MAX = 60, SAY_MS = 7000;  // 걷는 빠르기 (땅 px / 초) · 인형 키 · 발 둘레 · 말풍선 글자 · 보이는 시간
        /* 물건 : [그림, 발끝 x, 발끝 y, 크기 배율, 못 지나가는 타원 [가로 반지름, 세로 반지름, 위로 올리기]] */
        const OBJ = [
            ['fountain', 1260, 950, 1, [150, 64, 50]],
            ['shop1', 800, 650, 1, [150, 40, 20]], ['shop2', 1720, 650, 1, [150, 40, 20]],
            ['bench', 990, 1130, .9, [90, 18, 6]], ['bench', 1530, 1130, .9, [90, 18, 6]],
            ['lamp', 1100, 560, 1, [14, 8, 0]], ['lamp', 1420, 560, 1, [14, 8, 0]], ['lamp', 1080, 1250, 1, [14, 8, 0]], ['lamp', 1440, 1250, 1, [14, 8, 0]],
            ['tree', 300, 420, 1, [34, 14, 4]], ['tree', 540, 300, .9, [30, 12, 4]], ['tree', 2000, 330, 1, [34, 14, 4]], ['tree', 2230, 560, .9, [30, 12, 4]],
            ['tree', 180, 700, .85, [30, 12, 4]], ['tree', 360, 1260, 1, [34, 14, 4]], ['tree', 660, 1420, .9, [30, 12, 4]], ['tree', 900, 1300, .8, [28, 12, 4]],
            ['tree', 1650, 1260, .85, [30, 12, 4]], ['tree', 1920, 1330, 1, [34, 14, 4]], ['tree', 2170, 1160, .9, [30, 12, 4]], ['tree', 2280, 1480, .8, [28, 12, 4]],
            ['tree', 900, 220, .8, [28, 12, 4]], ['tree', 1600, 240, .85, [30, 12, 4]],
            ['flower', 620, 560], ['flower', 1900, 560], ['flower', 520, 1100], ['flower', 2040, 1080], ['flower', 1000, 1460], ['flower', 1560, 1460],
            ['flower', 200, 1500], ['flower', 2200, 260], ['flower', 760, 1040, .8], ['flower', 1760, 1020, .8]
        ];
        const NAMES = ['ground', 'tree', 'bench', 'fountain', 'flower', 'shop1', 'shop2', 'lamp'];
        const person = o => Object.assign({ x: 1260, y: 1160, tx: 1260, ty: 1160, ar: 208 / 470, face: 1, walk: 0, t: Math.random() * 9, img: null, ras: null, name: '나', say: '', sayT: 0 }, o);
        const S = { on: false, built: false, img: {}, ras: {}, z: 1, dpr: 1, vw: 0, vh: 0, cam: { x: 1260, y: 1100 },
            me: person({ me: true }), ppl: new Map(), key: {}, joy: null, goal: null, raf: 0, last: 0,
            net: { ws: null, st: 'off', room: 0, max: 30, sent: 0, sx: 0, sy: 0, sf: 1, retry: 0, timer: 0, ping: 0, myImg: '' } };
        const q = id => document.getElementById(id);
        const wOn = () => S.on;
        const local = () => typeof FT_LOCAL !== 'undefined' && FT_LOCAL;
        const wUrl = () => (S.ev && S.ev.url) || (local() && window.WORLD_URL_TEST) || WORLD_URL;   // 🎉 이벤트 광장 · 🧪 로컬 시험 서버
        const online = () => !!wUrl();
        const loggedIn = () => (local() && !!window.WORLD_TOK_TEST) || (typeof drive !== 'undefined' && drive.ready && !drive.guest && !drive.local);

        /* 그림 읽기 · 화면 배율에 맞게 미리 그려 두기 (매번 SVG 를 그리면 느려요) */
        const load = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
        async function loadAll() { await Promise.all(NAMES.map(async n => { if (!S.img[n]) S.img[n] = await load(DIR + n + '.svg' + V); })); }
        function raster(img, w, h) {
            const k = Math.min(S.z * S.dpr, 2), c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            return c;
        }
        const pRas = p => { if (p.img) p.ras = raster(p.img, CH_H * p.ar, CH_H); };
        function rasterAll() {
            S.ras = {};
            NAMES.forEach(n => { const i = S.img[n]; if (!i) return; const w = n === 'ground' ? W : i.naturalWidth || i.width, h = n === 'ground' ? H : i.naturalHeight || i.height; S.ras[n] = { c: raster(i, w, h), w, h }; });
            pRas(S.me); S.ppl.forEach(pRas); if (S.mq) pRas(S.mq);
        }
        /* 🧸 내 인형 (인형방 첫 인형 · 없으면 기본 마네킹) */
        async function myDoll() {
            let D = null, name = '';
            try { const L = typeof listDolls === 'function' ? await Promise.race([listDolls(), new Promise(r => setTimeout(() => r([]), 4000))]) : []; if (L && L[0]) { D = L[0].doll; name = L[0].name || ''; } } catch (e) { console.warn('🌳 인형', e); }
            if (typeof dollNewMannequin === 'function' && typeof dollDataUrl === 'function') { const i = await load(dollDataUrl(dollNewMannequin(), { pfx: 'wq', bg: false, crop: true })); if (i) { S.mq = person({ img: i, ar: (i.naturalWidth || 208) / (i.naturalHeight || 470) }); pRas(S.mq); } }
            if (!D && typeof dollNewMannequin === 'function') D = dollNewMannequin();
            let nick = ''; try { nick = typeof nickGet === 'function' ? nickGet() : ''; } catch (e) {}
            S.me.name = String(nick || name || '다꾸러').trim().slice(0, 12) || '다꾸러';
            if (D && typeof dollDataUrl === 'function') { const i = await load(dollDataUrl(D, { pfx: 'wd', bg: false, crop: true })); if (i) { S.me.img = i; S.me.ar = (i.naturalWidth || 208) / (i.naturalHeight || 470); pRas(S.me); } }   // 배경 없이 · 인형 둘레만
            S.net.myImg = '';
            S.me.img0 = S.me.img; S.me.ar0 = S.me.ar;                            // 🎉 이벤트옷을 입었다가 나오면 다시 이 인형
            try {                                                                // 👭 다른 다꾸러에게 보낼 작은 그림 한 장 (키 96px · 9KB 까지 · 도련 11-06 집 업로드 아끼기)
                if (S.me.img) {
                    const c = document.createElement('canvas'); c.height = 96; c.width = Math.round(96 * S.me.ar);
                    c.getContext('2d').drawImage(S.me.img, 0, 0, c.width, c.height);
                    for (const qv of [.75, .55, .35]) { let u = c.toDataURL('image/webp', qv); if (!/^data:image\/webp/.test(u)) u = c.toDataURL('image/png'); if (u.length <= 9000) { S.net.myImg = u; break; } }
                }
            } catch (e) { console.warn('🌳 인형 그림', e); }                        // (그림을 못 만들면 다른 사람에게는 기본 모습)
        }

        /* 🚧 못 지나가는 곳 */
        const COLL = OBJ.filter(o => o[4]).map(o => ({ x: o[1], y: o[2] - o[4][2] * (o[3] || 1), rx: o[4][0] * (o[3] || 1) + CH_R, ry: o[4][1] * (o[3] || 1) + CH_R * .5 }));
        const blocked = (x, y) => x < 70 || x > W - 70 || y < 120 || y > H - 50 || COLL.some(c => ((x - c.x) / c.rx) ** 2 + ((y - c.y) / c.ry) ** 2 < 1);
        function spawn() {                                                      // 광장 둘레 아무 데나 (겹치지 않게)
            for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, r = 200 + Math.random() * 80, x = 1260 + Math.cos(a) * r * 1.3, y = 900 + Math.sin(a) * r * .8 + 80; if (!blocked(x, y)) { S.me.x = x; S.me.y = y; return; } }
            S.me.x = 1260; S.me.y = 1160;
        }

        function fit() {
            const c = q('wdCanvas'); if (!c) return;
            S.vw = innerWidth; S.vh = innerHeight; S.dpr = Math.min(2, devicePixelRatio || 1);
            const z = Math.max(.55, Math.min(1.25, Math.min(S.vw, S.vh) / 700));
            c.width = Math.round(S.vw * S.dpr); c.height = Math.round(S.vh * S.dpr);
            if (z !== S.z || !S.ras.ground) { S.z = z; rasterAll(); }
        }
        function camClamp() {
            const hw = S.vw / S.z / 2, hh = S.vh / S.z / 2;
            S.cam.x = W <= hw * 2 ? W / 2 : Math.max(hw, Math.min(W - hw, S.cam.x));
            S.cam.y = H <= hh * 2 ? H / 2 : Math.max(hh, Math.min(H - hh, S.cam.y));
        }

        /* 한 번 움직이기 */
        function step(dt) {
            const m = S.me; let dx = 0, dy = 0;
            const k = S.key;
            if (k.ArrowLeft || k.a) dx -= 1; if (k.ArrowRight || k.d) dx += 1; if (k.ArrowUp || k.w) dy -= 1; if (k.ArrowDown || k.s) dy += 1;
            if (S.joy && S.joy.on) { dx = S.joy.dx; dy = S.joy.dy; }
            if (dx || dy) S.goal = null;
            else if (S.goal) { dx = S.goal.x - m.x; dy = S.goal.y - m.y; if (Math.hypot(dx, dy) < 6) { S.goal = null; dx = dy = 0; } }
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                const sp = SPEED * Math.min(1, S.joy && S.joy.on ? len : 1) * dt, ux = dx / len * sp, uy = dy / len * sp;
                let moved = false;
                if (!blocked(m.x + ux, m.y)) { m.x += ux; moved = true; }
                if (!blocked(m.x, m.y + uy)) { m.y += uy; moved = true; }
                if (!moved) S.goal = null;
                if (Math.abs(dx) > .15 * len) m.face = dx < 0 ? -1 : 1;
                m.walk = moved ? Math.min(1, m.walk + dt * 8) : Math.max(0, m.walk - dt * 6);
            } else m.walk = Math.max(0, m.walk - dt * 6);
            m.t += dt * (m.walk ? 1 : .35);
            S.ppl.forEach(p => {                                                // 👭 다른 다꾸러
                const ddx = p.tx - p.x, ddy = p.ty - p.y, d = Math.hypot(ddx, ddy);
                let moving = d > 2;
                if (p.sp != null) {                                             // 🧭 go = 그 목적지로 내 화면에서 걸어가요 (못 지나가는 곳도 나처럼 미끄러져요)
                    moving = false;
                    if (p.sp > 0 && d > 4) {
                        const sp = Math.min(d, SPEED * p.sp * dt), ux = ddx / d * sp, uy = ddy / d * sp;
                        if (!blocked(p.x + ux, p.y)) { p.x += ux; moving = true; }
                        if (!blocked(p.x, p.y + uy)) { p.y += uy; moving = true; }
                        if (!moving && d < 60) { p.x = p.tx; p.y = p.ty; }
                        if (Math.abs(ddx) > .15 * d) p.face = ddx < 0 ? -1 : 1;
                    }
                }
                else if (d > 500) { p.x = p.tx; p.y = p.ty; }                   // 예전 앱 (mv) = 받은 자리로 부드럽게 따라가기
                else if (d > 1) { const sp = Math.min(d, SPEED * 1.25 * dt * (d > 80 ? 1.6 : 1)); p.x += ddx / d * sp; p.y += ddy / d * sp; }
                p.walk = moving ? Math.min(1, p.walk + dt * 8) : Math.max(0, p.walk - dt * 6);
                p.t += dt * (p.walk ? 1 : .35);
                if (p.say && performance.now() > p.sayT) p.say = '';
            });
            S.cam.x += (m.x - S.cam.x) * Math.min(1, dt * 6); S.cam.y += (m.y - 40 - S.cam.y) * Math.min(1, dt * 6);
            camClamp();
            if (m.say && performance.now() > m.sayT) m.say = '';
            netMove();
        }

        /* 그리기 */
        function draw() {
            const c = q('wdCanvas'), g = c.getContext('2d'), z = S.z * S.dpr;
            g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#c9edc0'; g.fillRect(0, 0, c.width, c.height);
            const ox = S.vw / S.z / 2 - S.cam.x, oy = S.vh / S.z / 2 - S.cam.y;
            g.setTransform(z, 0, 0, z, ox * z, oy * z);
            const gr = S.ras.ground; if (gr) g.drawImage(gr.c, 0, 0, W, H);
            if (S.goal) { g.strokeStyle = 'rgba(255,143,177,.8)'; g.lineWidth = 4; g.beginPath(); g.ellipse(S.goal.x, S.goal.y, 18, 8, 0, 0, 7); g.stroke(); }
            const L = OBJ.map(o => ({ y: o[2], o })).concat([{ y: S.me.y, p: S.me }]);
            S.ppl.forEach(p => L.push({ y: p.y, p }));
            L.sort((a, b) => a.y - b.y);
            const vx0 = -ox - 200, vx1 = -ox + S.vw / S.z + 200, vy0 = -oy - 50, vy1 = -oy + S.vh / S.z + 400;
            L.forEach(it => {
                if (it.p) { if (it.p.x > vx0 && it.p.x < vx1 && it.p.y > vy0 && it.p.y < vy1) drawP(g, it.p); return; }
                const [n, x, y, sc = 1] = it.o, r = S.ras[n]; if (!r || x < vx0 || x > vx1 || y < vy0 || y > vy1) return;
                const w = r.w * sc, h = r.h * sc, m = S.me;
                const cover = y > m.y && Math.abs(x - m.x) < w / 2 + 20 && y - h < m.y - 20;   // 내 인형이 뒤에 숨으면 앞 물건을 살짝 비치게
                if (cover) g.globalAlpha = .5;
                g.drawImage(r.c, x - w / 2, y - h, w, h);
                g.globalAlpha = 1;
            });
            S.ppl.forEach(p => drawSay(g, p)); drawSay(g, S.me);                 // 말풍선은 맨 앞 (내 것이 제일 위)
        }
        const hopOf = p => p.walk * Math.abs(Math.sin(p.t * 11)) * 14;
        function drawP(g, p) {
            const hop = hopOf(p), sq = 1 + p.walk * .05 * Math.cos(p.t * 22);
            g.fillStyle = 'rgba(90,60,70,.18)'; g.beginPath(); g.ellipse(p.x, p.y, 28 - hop * .6, 9 - hop * .2, 0, 0, 7); g.fill();
            const h = CH_H * sq, w = CH_H * p.ar / sq;
            g.save(); g.translate(p.x, p.y - hop); g.scale(p.face, 1);
            if (p.ras) g.drawImage(p.ras, -w / 2, -h, w, h);
            else if (S.mq && S.mq.ras && !p.imgWant) g.drawImage(S.mq.ras, -CH_H * S.mq.ar / 2, -h, CH_H * S.mq.ar, h);   // 그림이 없는 다꾸러 = 기본 마네킹
            else { g.fillStyle = '#ffd6e2'; g.strokeStyle = '#7b5a63'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -h / 2, w / 2.4, h / 2.2, 0, 0, 7); g.fill(); g.stroke(); }
            g.restore();
            /* 이름표 (나 = 분홍) */
            const ty = p.y - CH_H - hop - 10;
            g.font = '800 15px "Pretendard", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            const tw = g.measureText(p.name).width + 18;
            g.fillStyle = p.me ? 'rgba(255,214,226,.95)' : 'rgba(255,255,255,.9)'; rr(g, p.x - tw / 2, ty - 12, tw, 24, 12); g.fill();
            g.fillStyle = p.me ? '#c2457a' : '#7b5a63'; g.fillText(p.name, p.x, ty + 1);
        }
        function drawSay(g, p) {
            if (!p.say) return;
            g.font = '700 16px "Pretendard", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            const lines = wrap(g, p.say, 220), lh = 21, bw = Math.max(...lines.map(s => g.measureText(s).width)) + 26, bh = lines.length * lh + 16;
            const hop = hopOf(p), bx = p.x - bw / 2, by = p.y - CH_H - hop - 34 - bh;
            g.fillStyle = '#fff'; g.strokeStyle = p.me ? '#ff9fbd' : '#c9b6e8'; g.lineWidth = 3;
            rr(g, bx, by, bw, bh, 14); g.fill(); g.stroke();
            g.beginPath(); g.moveTo(p.x - 8, by + bh - 1); g.lineTo(p.x, by + bh + 10); g.lineTo(p.x + 8, by + bh - 1); g.fill();
            g.beginPath(); g.moveTo(p.x - 8, by + bh); g.lineTo(p.x, by + bh + 10); g.lineTo(p.x + 8, by + bh); g.stroke();
            g.fillStyle = '#5b3f4a'; lines.forEach((s, i) => g.fillText(s, p.x, by + 8 + lh / 2 + i * lh));
        }
        function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
        function wrap(g, s, max) { const out = []; let cur = ''; for (const ch of s) { if (g.measureText(cur + ch).width > max && cur) { out.push(cur); cur = ''; } cur += ch; } if (cur) out.push(cur); return out.slice(0, 4); }

        function loop(t) {
            if (!S.on) return;
            const dt = Math.min(.05, (t - (S.last || t)) / 1000); S.last = t;
            step(dt); draw();
            S.raf = requestAnimationFrame(loop);
        }

        /* ========== 👭 광장 서버 (같이 걷기 · 말풍선) ========== */
        const N = S.net;
        function status() {
            const el = q('wdSt'); if (!el) return;
            const n = S.ppl.size + 1;
            el.textContent = !online() ? '임시 · 혼자 걷기'
                : N.st === 'on' ? (S.ev ? `${n}명 · 최대 ${N.max}명` : `${N.room}번 방 · ${n}명`) : N.st === 'again' ? '다른 창에서 들어갔어요' : N.st === 'login' ? '로그인이 필요해요' : N.st === 'full' ? '방이 모두 꽉 찼어요' : N.st === 'soon' ? '아직 안 열렸어요' : N.st === 'ended' ? '끝났어요' : '연결하는 중…';
            const inp = q('wdSayIn'); if (inp) inp.placeholder = !online() ? '말풍선 (지금은 나만 보여요)' : N.st === 'on' ? '말하기 (방 사람들에게 보여요)' : '연결되면 말할 수 있어요';
        }
        const send = o => { try { if (N.ws && N.ws.readyState === 1) { N.ws.send(JSON.stringify(o)); return true; } } catch (e) {} return false; };
        async function netOpen() {
            if (!online() || !S.on) return;
            netClose(true);
            N.st = 'wait'; status();
            let tok = '';
            try {
                if (local() && window.WORLD_TOK_TEST) tok = window.WORLD_TOK_TEST;
                else { await ensureToken(); tok = drive.token; }
            } catch (e) { N.st = 'login'; status(); return; }
            if (!S.on) return;
            const ws = new WebSocket(wUrl().replace(/^http/, 'ws').replace(/\/$/, '') + '/ws?tok=' + encodeURIComponent(tok) + '&room=' + (N.room || 1));
            N.ws = ws;
            ws.onopen = () => {
                if (N.ws !== ws) return;
                N.retry = 0;
                send({ t: 'me', n: S.me.name, img: N.myImg, x: Math.round(S.me.x), y: Math.round(S.me.y), f: S.me.face });
                N.sx = S.me.x; N.sy = S.me.y; N.sf = S.me.face; N.lg = null;
                clearInterval(N.ping); N.ping = setInterval(() => { try { ws.readyState === 1 && ws.send('ping'); } catch (e) {} }, 30000);   // 살아 있어요 (서버를 깨우지 않는 신호)
            };
            ws.onmessage = e => { if (N.ws === ws && e.data !== 'pong') { try { netMsg(JSON.parse(e.data)); } catch (er) { console.warn('🌳', er); } } };
            ws.onclose = e => {
                if (N.ws !== ws) return;
                N.ws = null; clearInterval(N.ping); S.ppl.clear();
                if (e.code === 4001) { N.st = 'again'; status(); return; }               // 같은 계정이 다른 창 · 기기에서 들어갔어요
                if (e.code === 4401) { N.st = 'login'; status(); return; }
                if (e.code === 4409) { N.st = 'full'; status(); return; }
                if (e.code === 4423 || e.code === 4410) { N.st = e.code === 4423 ? 'soon' : 'ended'; status(); return; }   // 📅 예약 : 아직 · 끝 (다시 연결하지 않아요)
                if (!S.on) return;
                N.st = 'wait'; status();
                N.retry = Math.min(N.retry + 1, 6);
                clearTimeout(N.timer); N.timer = setTimeout(() => { if (S.on && !document.hidden) netOpen(); }, 1000 * Math.min(15, 2 ** N.retry));   // 끊기면 조금 기다렸다 다시
            };
        }
        function netClose(quiet) {
            clearTimeout(N.timer); clearInterval(N.ping);
            const ws = N.ws; N.ws = null;
            if (ws) { try { ws.close(1000, 'bye'); } catch (e) {} }
            S.ppl.clear();
            if (!quiet) { N.st = 'off'; status(); }
        }
        function addP(o) {
            if (!o || !o.id || o.id === N.id) return;
            const old = S.ppl.get(o.id);
            const p = old || person({ id: o.id, x: o.x, y: o.y });
            Object.assign(p, { name: String(o.n || '다꾸러').slice(0, 12), tx: +o.x || 1260, ty: +o.y || 1160, face: o.f === -1 ? -1 : 1 });
            if (!old) { p.x = p.tx; p.y = p.ty; }
            if (o.tx != null) { p.sp = +o.s || 0; if (p.sp > 0) { p.tx = +o.tx; p.ty = +o.ty; } }   // 🧭 걷는 중에 들어왔으면 그 목적지로
            const look = S.looks && o.l != null ? S.looks[o.l] : '';                  // 🎉 이벤트옷 (상품 서버 그림)
            if (look) o = Object.assign({}, o, { img: look });
            if (o.img && o.img !== p.src) {
                p.src = o.img; p.imgWant = true;
                load(o.img).then(i => { if (i && p.src === o.img) { p.img = i; p.ar = (i.naturalWidth || 96) / (i.naturalHeight || 150); pRas(p); } });
            } else if (!o.img) { p.src = ''; p.imgWant = false; p.img = p.ras = null; }
            S.ppl.set(o.id, p);
        }
        function netMsg(m) {
            if (!m || typeof m !== 'object') return;
            if (m.t === 'hi') { N.id = m.id; N.room = m.room; N.max = m.max; N.v2 = m.v >= 2; N.st = 'on'; S.ppl.clear(); lookSet(m); (m.ppl || []).forEach(addP); status(); }
            else if (m.t === 'in' || m.t === 're') { addP(m); status(); }
            else if (m.t === 'go') goApply([m.id, m.x, m.y, m.tx, m.ty, m.s, m.f]);
            else if (m.t === 'b') (Array.isArray(m.m) ? m.m : []).forEach(goApply);     // 📦 묶음 (집 PC 서버)
            else if (m.t === 'mv') { const p = S.ppl.get(m.id); if (p) { p.sp = null; p.tx = m.x; p.ty = m.y; p.face = m.f === -1 ? -1 : 1; } }
            else if (m.t === 'say') { const p = S.ppl.get(m.id); if (p) { p.say = String(m.s || '').slice(0, 100); p.sayT = performance.now() + SAY_MS; } }
            else if (m.t === 'out') { S.ppl.delete(m.id); status(); }
            else if (m.t === 'end') { N.st = 'ended'; status(); if (window.showMsg) showMsg(String(m.s || '🎆 파티가 끝났어요!').slice(0, 80)); }   // 📅 끝 시간 (서버가 내보내요)
            else if (m.t === 'err') { N.st = m.e === 'login' ? 'login' : m.e === 'full' ? 'full' : m.e === 'soon' ? 'soon' : m.e === 'ended' ? 'ended' : 'wait'; status();
                if ((m.e === 'soon' || m.e === 'ended') && window.showMsg) showMsg(m.e === 'soon' ? `🎉 아직 안 열렸어요.<br><b>${new Date(+m.from || Date.now()).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Seoul' })}</b>에 열려요.` : '🎆 파티가 끝났어요!<br>다음에 또 만나요.'); if (m.e === 'login' && window.showMsg) showMsg('🔒 로그인이 확인되지 않았어요.<br>다시 로그인한 뒤 들어와 주세요.'); }
        }
        function netMoveOld() {
            const m = S.me, now = performance.now();
            if ((Math.abs(m.x - N.sx) < 1 && Math.abs(m.y - N.sy) < 1 && m.face === N.sf) || now - N.sent < 160) return;
            if (send({ t: 'mv', x: Math.round(m.x), y: Math.round(m.y), f: m.face })) { N.sent = now; N.sx = m.x; N.sy = m.y; N.sf = m.face; }
        }
        /* 🧭 받은 '가는 곳' : [id, 지금 x, y, 목적지 tx, ty, 빠르기 s (0 = 멈춤), 방향 f] */
        function goApply(a) {
            if (!Array.isArray(a)) return;
            const p = S.ppl.get(a[0]); if (!p) return;
            const x = +a[1], y = +a[2], s = +a[5] || 0;
            if (Math.hypot(p.x - x, p.y - y) > 120) { p.x = x; p.y = y; }       // 너무 어긋났으면 그 자리로
            if (s > 0) { p.tx = +a[3]; p.ty = +a[4]; p.sp = s; } else { p.tx = x; p.ty = y; p.sp = 1; }   // 멈춤 = 멈춘 자리까지 걸어가서 서요
            p.face = a[6] === -1 ? -1 : 1;
        }
        /* 🎉 이벤트옷 : 서버가 looks 를 주면 내 인형도 그 옷으로 (나가면 내 인형) */
        function lookSet(m) {
            S.looks = Array.isArray(m.looks) && m.looks.length ? m.looks.filter(u => typeof u === 'string' && /^https:\/\//.test(u)) : null;
            const u = S.looks && m.l != null ? S.looks[m.l] : '';
            if (!u) { lookOff(); return; }
            load(u).then(i => { if (i && S.on && S.looks) { S.me.img = i; S.me.ar = (i.naturalWidth || 208) / (i.naturalHeight || 470); pRas(S.me); } });
        }
        function lookOff() { if (S.me.img0 && S.me.img !== S.me.img0) { S.me.img = S.me.img0; S.me.ar = S.me.ar0 || S.me.ar; pRas(S.me); } }
        /* 🧭 내가 가는 곳 : 땅 톡 = 목적지 · 방향키 · 조이스틱 = 그 방향 멀리 · 아무것도 아니면 멈춤 */
        function intent() {
            const m = S.me, k = S.key; let dx = 0, dy = 0, s = 1;
            if (k.ArrowLeft || k.a) dx -= 1; if (k.ArrowRight || k.d) dx += 1; if (k.ArrowUp || k.w) dy -= 1; if (k.ArrowDown || k.s) dy += 1;
            if (S.joy && S.joy.on) { dx = S.joy.dx; dy = S.joy.dy; s = Math.min(1, Math.hypot(dx, dy)); }
            const len = Math.hypot(dx, dy);
            if (len > 0) { const ux = dx / len, uy = dy / len; return { k: 'd', a: Math.atan2(uy, ux), s, tx: Math.max(0, Math.min(W, m.x + ux * 900)), ty: Math.max(0, Math.min(H, m.y + uy * 900)) }; }
            if (S.goal) return { k: 'g', s: 1, tx: S.goal.x, ty: S.goal.y };
            return { k: 's', s: 0, tx: m.x, ty: m.y };
        }
        function netMove() {                                                     // 🧭 가는 곳이 바뀔 때만 (걷는 중엔 1.5초마다 한 번 맞추기 · 도련 11-06)
            if (N.st !== 'on') return;
            if (!N.v2) return netMoveOld();                                      // 예전 서버 (go 를 모르면) = 1초에 6번쯤 자리
            const m = S.me, now = performance.now(), it = intent(), L = N.lg;
            if (it.k === 's' && m.walk > .05) return;                            // 멈추는 중 (마지막 자리가 정해지면 보내요)
            let need = !L;
            if (L) {
                if ((it.s > 0) !== (L.s > 0)) need = true;
                else if (it.s > 0) {
                    if (it.k === 'g') need = L.k !== 'g' || Math.hypot(it.tx - L.tx, it.ty - L.ty) > 30;
                    else { const da = Math.abs(Math.atan2(Math.sin(it.a - L.a), Math.cos(it.a - L.a))); need = L.k !== 'd' || da > .21 || Math.abs(it.s - L.s) > .25; }
                    if (now - N.sent > 1500) need = true;
                } else need = Math.hypot(m.x - L.x, m.y - L.y) > 2 || m.face !== L.f;
            }
            if (!need || now - N.sent < 120) return;
            const o = { t: 'go', x: Math.round(m.x), y: Math.round(m.y), tx: Math.round(it.tx), ty: Math.round(it.ty), s: Math.round(it.s * 100) / 100, f: m.face };
            if (send(o)) { N.sent = now; N.lg = Object.assign({}, it, { x: m.x, y: m.y, f: m.face }); }
        }

        /* 화면 */
        function build() {
            let el = q('worldRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'worldRoom'; el.className = 'wd-room';
            el.innerHTML = `<canvas id="wdCanvas"></canvas>
                <div class="wd-title">🌳 말랑 광장 <small id="wdSt" onclick="worldTapSt()"></small></div>
                <button type="button" class="wd-go desk-shop-go" onclick="deskMoveOpen()">이동</button>
                <div class="wd-joy" id="wdJoy"><i></i></div>
                <form class="wd-say" id="wdSay" autocomplete="off"><input id="wdSayIn" maxlength="${SAY_MAX}" enterkeyhint="send"><button type="submit" class="btn">말하기</button></form>`;
            document.body.appendChild(el);
            const cv = el.querySelector('canvas');
            cv.addEventListener('pointerdown', e => {                                // 땅 톡 · 클릭 = 그곳으로 걸어가기
                if (document.activeElement === q('wdSayIn')) q('wdSayIn').blur();
                const x = S.cam.x + (e.clientX - S.vw / 2) / S.z, y = S.cam.y + (e.clientY - S.vh / 2) / S.z;
                S.goal = { x: Math.max(70, Math.min(W - 70, x)), y: Math.max(120, Math.min(H - 50, y)) };
            });
            const joy = q('wdJoy'), knob = joy.querySelector('i');
            joy.addEventListener('pointerdown', e => {
                e.preventDefault(); joy.setPointerCapture(e.pointerId);
                const r = joy.getBoundingClientRect(); S.joy = { on: true, id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2, dx: 0, dy: 0 };
                jmove(e);
            });
            const jmove = e => {
                const j = S.joy; if (!j || !j.on || e.pointerId !== j.id) return;
                let dx = e.clientX - j.cx, dy = e.clientY - j.cy; const d = Math.hypot(dx, dy), mx = j.R * .8;
                if (d > mx) { dx = dx / d * mx; dy = dy / d * mx; }
                knob.style.transform = `translate(${dx}px, ${dy}px)`;
                j.dx = dx / mx; j.dy = dy / mx; if (Math.hypot(j.dx, j.dy) < .15) j.dx = j.dy = 0;
            };
            const jend = e => { if (S.joy && e.pointerId === S.joy.id) { S.joy = null; knob.style.transform = ''; } };
            joy.addEventListener('pointermove', jmove); joy.addEventListener('pointerup', jend); joy.addEventListener('pointercancel', jend);
            q('wdSay').addEventListener('submit', e => {
                e.preventDefault(); const i = q('wdSayIn'), s = i.value.replace(/\s+/g, ' ').trim().slice(0, SAY_MAX);
                if (!s) return;
                if (online() && N.st !== 'on') return;                               // 연결되기 전에는 그대로 (지우지 않아요)
                S.me.say = s; S.me.sayT = performance.now() + SAY_MS; i.value = '';
                if (online()) send({ t: 'say', s });
            });
            return el;
        }
        async function openWorld(opt) {
            if (online() && !loggedIn()) {                                       // 🔒 로그인한 다꾸러만 (도련 11-02)
                if (window.showMsg) showMsg('🔒 말랑달콤 다꾸러 모임방은<br>로그인한 다꾸러만 들어올 수 있어요.<br><span style="font-size:12px;color:#777;">구글 로그인 뒤에 다시 와 주세요.</span>');
                return;
            }
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.deskLeave) deskLeave();
            const el = build();
            el.classList.add('show'); document.body.classList.add('cal-on', 'world-on');
            S.on = true; S.key = {}; S.goal = null; N.room = 0;
            S.ev = opt && typeof opt.url === 'string' && /^(https?|wss?):\/\//.test(opt.url) ? { url: opt.url, name: String(opt.name || '🎉 이벤트 광장').slice(0, 30) } : null;   // 🎉 이벤트 광장 (js/service.js openEventWorld)
            const tt = el.querySelector('.wd-title'); if (tt && tt.firstChild) tt.firstChild.textContent = (S.ev ? S.ev.name : '🌳 말랑 광장') + ' ';
            el.classList.toggle('wd-ev', !!S.ev);
            status();
            if (!S.built) { el.classList.add('loading'); await Promise.all([loadAll(), myDoll()]); S.built = true; el.classList.remove('loading'); }
            if (!S.on) return;
            spawn();
            S.ras = {}; fit(); S.cam.x = S.me.x; S.cam.y = S.me.y; camClamp();
            cancelAnimationFrame(S.raf); S.last = 0; S.raf = requestAnimationFrame(loop);
            netOpen();
        }
        function closeWorld() {
            const el = q('worldRoom'); if (!el || !S.on) return;
            S.on = false; cancelAnimationFrame(S.raf); S.joy = null; S.key = {};
            netClose();
            S.ev = null; S.looks = null; lookOff();                              // 🎉 이벤트에서 나오면 평소 광장 · 내 인형
            el.classList.remove('show'); document.body.classList.remove('cal-on', 'world-on');
        }
        const typing = () => document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
        const modalUp = () => !!document.querySelector('.modal[style*="flex"]');
        document.addEventListener('keydown', e => {
            if (!S.on || modalUp()) return;
            if (e.key === 'Escape') { if (typing()) document.activeElement.blur(); else if (window.deskGoRoom) deskGoRoom(); else closeWorld(); return; }
            if (typing()) return;
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'].includes(k)) { S.key[k] = true; e.preventDefault(); }
            else if (e.key === 'Enter') { q('wdSayIn').focus(); e.preventDefault(); }
        });
        document.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; delete S.key[k]; });
        addEventListener('blur', () => { S.key = {}; });
        addEventListener('resize', () => { if (S.on && S.built) fit(); });
        document.addEventListener('visibilitychange', () => {
            if (!S.on) return;
            if (document.hidden) cancelAnimationFrame(S.raf);
            else { S.last = 0; S.raf = requestAnimationFrame(loop); if (online() && !N.ws && N.st !== 'again') netOpen(); }   // 돌아오면 끊긴 연결 다시
        });
        window.WORLD_BASE = () => (local() && window.WORLD_URL_TEST) || WORLD_URL;   // 🎉 이벤트 알림판 = 평소 광장 서버 /event (js/service.js evLiveCheck)
        window.openWorld = openWorld; window.closeWorld = closeWorld; window.worldOn = wOn; window.WORLD = S;
        window.worldReconnect = () => { N.retry = 0; netOpen(); };
        window.worldTapSt = () => { if (online() && S.on && N.st !== 'on' && N.st !== 'login') worldReconnect(); };   // '다른 창에서 들어갔어요' · '꽉 찼어요' 를 누르면 다시 들어가기
    })();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['world'] = true;
