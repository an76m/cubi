/* 말랑달콤 다이어리 - js/world.js
   🌳 말랑 광장 (도련 11-02 · 임시 2.5D 월드 · 1단계 = 혼자 걸어 다니기 · 서버 없음)
   - 이동 창 · 카페 창의 '👭 말랑달콤 다꾸러 모임방' 칸 (data-place="world" · 11-02 네이버 카페 링크 대신 · 사이트에서도 보여요)
   - 땅 2400 × 1600 (img/world/ground.svg) 위에 나무 · 벤치 · 분수 · 꽃 · 가게 · 가로등 그림 (img/world/*.svg · 같은 이름으로 바꾸면 그림만 바뀌어요)
       물건은 발끝(아래 가운데) 기준 · 아래쪽에 있는 것이 앞에 그려져요 (y 순서) · 분수 물 · 가게 벽 · 나무 줄기는 못 지나가요
   - 캐릭터 = 인형방의 내 첫 인형 (없으면 기본 마네킹) · 왼쪽으로 가면 좌우로 뒤집기 · 걸을 때 콩콩 뛰기
   - 움직이기 : 💻 방향키 · WASD · 땅 클릭 / 📱 왼쪽 아래 조이스틱 · 땅 톡
   - 💬 말풍선 = 지금은 나만 보여요 (2단계 : Cloudflare Durable Objects 로 같은 방 다꾸러 20명까지 · 채팅 걸러내기)
   - 닫기 없음 = 오른쪽 위 '이동' (다른 장소처럼) · Esc = 내 방 */
    (function () {
        const W = 2400, H = 1600, V = '?v=20261009-1068', DIR = 'img/world/';
        const SPEED = 260, CH_H = 140, CH_R = 18;                                // 걷는 빠르기 (땅 px / 초) · 인형 키 · 발 둘레
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
        const S = { on: false, built: false, img: {}, ras: {}, z: 1, dpr: 1, vw: 0, vh: 0, cam: { x: 1260, y: 1100 },
            me: { x: 1260, y: 1160, ar: 208 / 470, face: 1, walk: 0, t: 0, img: null, name: '나', say: '', sayT: 0 },
            key: {}, joy: null, goal: null, raf: 0, last: 0 };
        const q = id => document.getElementById(id);
        const wOn = () => S.on;

        /* 그림 읽기 · 화면 배율에 맞게 미리 그려 두기 (매번 SVG 를 그리면 느려요) */
        const load = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
        async function loadAll() { await Promise.all(NAMES.map(async n => { if (!S.img[n]) S.img[n] = await load(DIR + n + '.svg' + V); })); }
        function raster(img, w, h) {
            const k = Math.min(S.z * S.dpr, 2), c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            return c;
        }
        function rasterAll() {
            S.ras = {};
            NAMES.forEach(n => { const i = S.img[n]; if (!i) return; const w = n === 'ground' ? W : i.naturalWidth || i.width, h = n === 'ground' ? H : i.naturalHeight || i.height; S.ras[n] = { c: raster(i, w, h), w, h }; });
            if (S.me.img) S.me.ras = raster(S.me.img, CH_H * S.me.ar, CH_H);
        }
        /* 🧸 내 인형 (인형방 첫 인형 · 없으면 기본 마네킹) */
        async function myDoll() {
            let D = null, name = '';
            try { const L = typeof listDolls === 'function' ? await Promise.race([listDolls(), new Promise(r => setTimeout(() => r([]), 4000))]) : []; if (L && L[0]) { D = L[0].doll; name = L[0].name || ''; } } catch (e) { console.warn('🌳 인형', e); }
            if (!D && typeof dollNewMannequin === 'function') D = dollNewMannequin();
            S.me.name = String(name || '나').slice(0, 12);
            if (D && typeof dollDataUrl === 'function') { const i = await load(dollDataUrl(D, { pfx: 'wd', bg: false, crop: true })); if (i) { S.me.img = i; S.me.ar = (i.naturalWidth || 208) / (i.naturalHeight || 470); S.me.ras = raster(i, CH_H * S.me.ar, CH_H); } }   // 배경 없이 · 인형 둘레만
        }

        /* 🚧 못 지나가는 곳 */
        const COLL = OBJ.filter(o => o[4]).map(o => ({ x: o[1], y: o[2] - o[4][2] * (o[3] || 1), rx: o[4][0] * (o[3] || 1) + CH_R, ry: o[4][1] * (o[3] || 1) + CH_R * .5 }));
        const blocked = (x, y) => x < 70 || x > W - 70 || y < 120 || y > H - 50 || COLL.some(c => ((x - c.x) / c.rx) ** 2 + ((y - c.y) / c.ry) ** 2 < 1);

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
            S.cam.x += (m.x - S.cam.x) * Math.min(1, dt * 6); S.cam.y += (m.y - 40 - S.cam.y) * Math.min(1, dt * 6);
            camClamp();
            if (m.say && performance.now() > m.sayT) m.say = '';
        }

        /* 그리기 */
        function draw() {
            const c = q('wdCanvas'), g = c.getContext('2d'), z = S.z * S.dpr;
            g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#c9edc0'; g.fillRect(0, 0, c.width, c.height);
            const ox = S.vw / S.z / 2 - S.cam.x, oy = S.vh / S.z / 2 - S.cam.y;
            g.setTransform(z, 0, 0, z, ox * z, oy * z);
            const gr = S.ras.ground; if (gr) g.drawImage(gr.c, 0, 0, W, H);
            if (S.goal) { g.strokeStyle = 'rgba(255,143,177,.8)'; g.lineWidth = 4; g.beginPath(); g.ellipse(S.goal.x, S.goal.y, 18, 8, 0, 0, 7); g.stroke(); }
            const L = OBJ.map(o => ({ y: o[2], o })).concat([{ y: S.me.y, me: true }]).sort((a, b) => a.y - b.y);
            const vx0 = -ox - 200, vx1 = -ox + S.vw / S.z + 200, vy0 = -oy - 50, vy1 = -oy + S.vh / S.z + 400;
            L.forEach(it => {
                if (it.me) return drawMe(g);
                const [n, x, y, sc = 1] = it.o, r = S.ras[n]; if (!r || x < vx0 || x > vx1 || y < vy0 || y > vy1) return;
                const w = r.w * sc, h = r.h * sc, m = S.me;
                const cover = y > m.y && Math.abs(x - m.x) < w / 2 + 20 && y - h < m.y - 20;   // 내 인형이 뒤에 숨으면 앞 물건을 살짝 비치게
                if (cover) g.globalAlpha = .5;
                g.drawImage(r.c, x - w / 2, y - h, w, h);
                g.globalAlpha = 1;
            });
            drawSay(g);
        }
        function drawMe(g) {
            const m = S.me, hop = m.walk * Math.abs(Math.sin(m.t * 11)) * 14, sq = 1 + m.walk * .05 * Math.cos(m.t * 22);
            g.fillStyle = 'rgba(90,60,70,.18)'; g.beginPath(); g.ellipse(m.x, m.y, 28 - hop * .6, 9 - hop * .2, 0, 0, 7); g.fill();
            const h = CH_H * sq, w = CH_H * S.me.ar / sq;
            g.save(); g.translate(m.x, m.y - hop); g.scale(m.face, 1);
            if (m.ras) g.drawImage(m.ras, -w / 2, -h, w, h);
            else { g.fillStyle = '#ffd6e2'; g.strokeStyle = '#7b5a63'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, -h / 2, w / 2.4, h / 2.2, 0, 0, 7); g.fill(); g.stroke(); }
            g.restore();
            /* 이름표 */
            const ty = m.y - CH_H - hop - 10;
            g.font = '800 15px "Pretendard", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            const tw = g.measureText(m.name).width + 18;
            g.fillStyle = 'rgba(255,255,255,.9)'; rr(g, m.x - tw / 2, ty - 12, tw, 24, 12); g.fill();
            g.fillStyle = '#7b5a63'; g.fillText(m.name, m.x, ty + 1);
        }
        function drawSay(g) {
            const m = S.me; if (!m.say) return;
            g.font = '700 16px "Pretendard", system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
            const lines = wrap(g, m.say, 200), lh = 21, bw = Math.max(...lines.map(s => g.measureText(s).width)) + 26, bh = lines.length * lh + 16;
            const hop = m.walk * Math.abs(Math.sin(m.t * 11)) * 14, bx = m.x - bw / 2, by = m.y - CH_H - hop - 34 - bh;
            g.fillStyle = '#fff'; g.strokeStyle = '#ff9fbd'; g.lineWidth = 3;
            rr(g, bx, by, bw, bh, 14); g.fill(); g.stroke();
            g.beginPath(); g.moveTo(m.x - 8, by + bh - 1); g.lineTo(m.x, by + bh + 10); g.lineTo(m.x + 8, by + bh - 1); g.fill();
            g.beginPath(); g.moveTo(m.x - 8, by + bh); g.lineTo(m.x, by + bh + 10); g.lineTo(m.x + 8, by + bh); g.stroke();
            g.fillStyle = '#5b3f4a'; lines.forEach((s, i) => g.fillText(s, m.x, by + 8 + lh / 2 + i * lh));
        }
        function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
        function wrap(g, s, max) { const out = []; let cur = ''; for (const ch of s) { if (g.measureText(cur + ch).width > max && cur) { out.push(cur); cur = ''; } cur += ch; } if (cur) out.push(cur); return out.slice(0, 3); }

        function loop(t) {
            if (!S.on) return;
            const dt = Math.min(.05, (t - (S.last || t)) / 1000); S.last = t;
            step(dt); draw();
            S.raf = requestAnimationFrame(loop);
        }

        /* 화면 */
        function build() {
            let el = q('worldRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'worldRoom'; el.className = 'wd-room';
            el.innerHTML = `<canvas id="wdCanvas"></canvas>
                <div class="wd-title">🌳 말랑 광장 <small>임시 · 혼자 걷기</small></div>
                <button type="button" class="wd-go desk-shop-go" onclick="deskMoveOpen()">이동</button>
                <div class="wd-joy" id="wdJoy"><i></i></div>
                <form class="wd-say" id="wdSay" autocomplete="off"><input id="wdSayIn" maxlength="40" placeholder="말풍선 (지금은 나만 보여요)" enterkeyhint="send"><button type="submit" class="btn">말하기</button></form>`;
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
                e.preventDefault(); const i = q('wdSayIn'), s = i.value.replace(/\s+/g, ' ').trim().slice(0, 40);
                if (!s) return; S.me.say = s; S.me.sayT = performance.now() + 6000; i.value = '';
            });
            return el;
        }
        async function openWorld() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.deskLeave) deskLeave();
            const el = build();
            el.classList.add('show'); document.body.classList.add('cal-on', 'world-on');
            S.on = true; S.key = {}; S.goal = null;
            if (!S.built) { el.classList.add('loading'); await Promise.all([loadAll(), myDoll()]); S.built = true; el.classList.remove('loading'); }
            if (!S.on) return;
            S.ras = {}; fit(); S.cam.x = S.me.x; S.cam.y = S.me.y; camClamp();
            cancelAnimationFrame(S.raf); S.last = 0; S.raf = requestAnimationFrame(loop);
        }
        function closeWorld() {
            const el = q('worldRoom'); if (!el || !S.on) return;
            S.on = false; cancelAnimationFrame(S.raf); S.joy = null; S.key = {};
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
        document.addEventListener('visibilitychange', () => { if (!S.on) return; if (document.hidden) cancelAnimationFrame(S.raf); else { S.last = 0; S.raf = requestAnimationFrame(loop); } });
        window.openWorld = openWorld; window.closeWorld = closeWorld; window.worldOn = wOn; window.WORLD = S;
    })();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['world'] = true;
