/* 말랑달콤 다이어리 - js/arcroom.js
   🕹️ 뿅뿅오락실 장소 (도련 11-01 · 타로카페처럼) : 💻 PC · 📲 아이패드에서 '뿅뿅오락실' 칸을 누르면 (📱 폰은 예전 카페 칸 그대로 · calRoomUse)
   - 🚪 들어갈 때 = 분홍 유리문(img/arcade-door.webp) → 🔔 띠리링~ (✨ 연출 소리 · sndArcadeDoor) → 손잡이 사이로 다가가며 분홍 · 노랑 빛 → 오락실
   - 오락실 그림(img/arcade-room.webp) 속 오락기 화면마다 게임 하나 (화면 기울기 그대로 · 네 모서리에 맞춰 늘여요)
       가운데 섬 + 왼쪽 앞 = 🕹️ 오락실 게임 6 · 뒤쪽 벽 + 오른쪽 줄 = 🧠 두뇌 게임 7 · 왼쪽 줄 끝 = 🏆 명예의 전당 · 남는 화면 = INSERT COIN
       화면 톡 = 그 게임 바로 (js/arcade.js arcadePlay · 끝나고 '오락실로' · ✕ = 이 장소로) · 마우스를 올리면 화면이 밝아지고 설명
   - ✨ 연출 : 화면 깜빡임 · 떠오르는 픽셀 하트 · 별 · 바닥 반짝이 · 분홍 불빛 숨쉬기 (CSS 만 · 동작 줄이기면 멈춰요)
   - 그림 = 화면 꽉 (coverFit · 섬 · 오른쪽 줄이 보이게) · 닫기 없이 '이동' (data-place="game" · body.arc-on) */

        const ARO_W = 1672, ARO_H = 941;
        /* [게임 id, 화면 네 모서리 (그림 px · 왼위 · 오른위 · 오른아래 · 왼아래)] · '' = INSERT COIN */
        const ARO_SCR = [
            ['shooter', [[509, 482], [618, 405], [684, 539], [585, 628]]], ['breakout', [[647, 387], [703, 329], [765, 438], [714, 500]]],
            ['maze', [[730, 318], [774, 270], [827, 365], [788, 415]]], ['mole', [[796, 279], [835, 219], [881, 305], [848, 347]]],
            ['snake', [[81, 195], [177, 167], [218, 261], [122, 295]]], ['runner', [[217, 155], [300, 132], [335, 217], [254, 245]]],
            ['hof', [[331, 122], [397, 105], [428, 181], [363, 203]]],
            ['memory', [[535, 77], [628, 81], [615, 158], [519, 148]]], ['slide', [[901, 87], [995, 94], [979, 171], [885, 156]]],
            ['stroop', [[1028, 98], [1130, 102], [1118, 181], [1015, 167]]], ['math', [[1167, 105], [1265, 114], [1250, 196], [1151, 181]]],
            ['digits', [[1454, 172], [1484, 219], [1431, 304], [1399, 245]]], ['flash', [[1504, 239], [1537, 298], [1472, 397], [1444, 329]]],
            ['simon', [[1559, 321], [1598, 393], [1521, 514], [1486, 431]]],
            ['', [[1625, 430], [1671, 538], [1582, 671], [1541, 562]]]
        ];
        const ARO_HOF = { id: 'hof', name: '명예의 전당', icon: '🏆', color: '#f0b429', desc: '이번 주 · 역대 순위를 봐요' };
        const aroq = id => document.getElementById(id);
        const aroOn = () => !!aroq('arcRoom') && aroq('arcRoom').classList.contains('show');
        /* 200 × 150 네모 → 화면 네 모서리 (원근 그대로 · matrix3d) */
        function aroH(q) {
            const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, w = 200, h = 150;
            const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1;
            const g = (sx * dy2 - dx2 * sy) / den, k = (dx1 * sy - sx * dy1) / den;
            const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3, d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
            return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${k / h},0,0,1,0,${x0},${y0},0,1)`;
        }
        function aroFx() {                                                         // ✨ 떠오르는 픽셀 하트 · 별 · 바닥 반짝이
            const R = (a, b) => a + Math.random() * (b - a), P = ['♥', '★', '✦', '♥', '✚'], C = ['#ff7eb6', '#ffd75e', '#c9a7ff', '#7fd3ff'];
            let up = '', tw = '';
            for (let i = 0; i < 26; i++) up += `<i class="aro-px" style="left:${R(40, 1630).toFixed(0)}px;top:${R(420, 920).toFixed(0)}px;color:${C[i % 4]};--d:${R(8, 14).toFixed(1)}s;--l:-${R(0, 14).toFixed(1)}s;--x:${R(-50, 50).toFixed(0)}px">${P[i % 5]}</i>`;
            for (let i = 0; i < 18; i++) tw += `<i class="aro-tw" style="left:${R(20, 1650).toFixed(0)}px;top:${R(560, 930).toFixed(0)}px;--d:${R(2.2, 4.5).toFixed(1)}s;--l:-${R(0, 4).toFixed(1)}s"></i>`;
            return `<div class="aro-fx aro-glow"></div><div class="aro-fx aro-ups">${up}</div><div class="aro-fx aro-tws">${tw}</div>`;
        }
        function aroBuild() {
            let el = aroq('arcRoom'); if (el) return el;
            const G = window.arcadeGames ? arcadeGames() : [], gOf = id => id === 'hof' ? ARO_HOF : G.find(g => g.id === id);
            el = document.createElement('div'); el.id = 'arcRoom'; el.className = 'aro-room';
            el.innerHTML = `<div class="aro-stage" id="aroStage"><img class="aro-bg" src="img/arcade-room.webp?v=20261009-1035" alt="" draggable="false">
                    ${ARO_SCR.map(([id, q], i) => { const g = gOf(id);
                        return g ? `<button type="button" class="aro-scr" data-i="${i}" style="--c:${g.color};transform:${aroH(q)}" aria-label="${g.name}"><i>${g.icon}</i><b>${g.name}</b></button>`
                            : `<div class="aro-scr deco" style="transform:${aroH(q)}"><b>INSERT COIN</b></div>`; }).join('')}
                    ${aroFx()}
                    <span class="aro-sign" style="left:430px;top:270px;rotate:-8deg">🕹️ 오락실 게임</span>
                    <span class="aro-sign" style="left:1010px;top:40px">🧠 두뇌 게임<small>기억력 · 집중력 · 계산력</small></span>
                    <span class="aro-sign" style="left:300px;top:52px;rotate:-6deg">🏆 명예의 전당</span>
                    <div class="aro-tip" id="aroTip" hidden></div>
                </div>
                <div class="aro-ttl">🕹️ 뿅뿅오락실</div>
                <button type="button" class="aro-go desk-shop-go" onclick="deskMoveOpen()">이동</button>`;
            document.body.appendChild(el);
            const tip = aroq('aroTip');
            el.querySelectorAll('.aro-scr[data-i]').forEach(b => {
                const [id, q] = ARO_SCR[+b.dataset.i], g = gOf(id);
                b.addEventListener('pointerenter', () => {
                    const top = q.reduce((m, p) => p[1] < m[1] ? p : m, q[0]);
                    Object.assign(tip.style, { left: Math.max(150, Math.min(ARO_W - 150, top[0])) + 'px', top: Math.max(120, top[1] - 12) + 'px' });
                    tip.innerHTML = `<b>${g.icon} ${g.name}</b><small>${g.desc || ''}</small><em>${id === 'hof' ? '🏆 순위 보기' : '▶ 게임 시작'}</em>`; tip.hidden = false;
                });
                b.addEventListener('pointerleave', () => { tip.hidden = true; });
                b.addEventListener('click', () => { tip.hidden = true; if (id === 'hof') { if (window.openHof) openHof(); } else if (window.arcadePlay) arcadePlay(id); });
            });
            addEventListener('resize', () => { if (aroOn()) aroFit(); });
            return el;
        }
        function aroFit() {
            const st = aroq('aroStage'); if (!st) return;
            const { s, x, y } = coverFit(ARO_W, ARO_H, [60, 1620, 60, 640]);
            st.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
        }
        /* 🚪 오락실 문 (기본상품 샵 · 타로카페처럼) */
        let aroDoorBusy = false;
        function aroDoor() {
            if (aroDoorBusy || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            let d = aroq('aroDoor');
            if (!d) { d = document.createElement('div'); d.id = 'aroDoor'; d.className = 'aro-door'; d.innerHTML = '<div class="aro-door-in"><img src="img/arcade-door.webp?v=20261009-1035" alt="" draggable="false"><div class="aro-door-sign">뿅뿅오락실</div></div>'; document.body.appendChild(d); }
            aroDoorBusy = true;
            const { s, x, y } = coverFit(ARO_W, ARO_H, [500, 1170, 80, 800]);
            Object.assign(d.querySelector('img').style, { width: ARO_W * s + 'px', height: ARO_H * s + 'px', left: x + 'px', top: y + 'px' });
            Object.assign(d.querySelector('.aro-door-sign').style, { left: x + 836 * s + 'px', top: y + 150 * s + 'px', fontSize: 46 * s + 'px' });
            d.querySelector('.aro-door-in').style.transformOrigin = `${x + 836 * s}px ${y + 600 * s}px`;
            d.classList.remove('enter', 'leave'); d.classList.add('on');
            const go = () => { if (window.sndArcadeDoor) sndArcadeDoor(); d.classList.add('enter'); setTimeout(() => { d.classList.add('leave'); setTimeout(() => { d.classList.remove('on', 'enter', 'leave'); aroDoorBusy = false; }, 400); }, 1700); };
            const img = d.querySelector('img'), start = () => setTimeout(go, 750);
            if (img.complete) start(); else img.addEventListener('load', start, { once: true });
        }
        function openArcRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.deskLeave) deskLeave();
            if (typeof warmServer === 'function' && typeof HOF_API_URL !== 'undefined' && HOF_API_URL) warmServer(HOF_API_URL);   // 🏆 명예의 전당 서버 미리 깨우기
            aroDoor();
            const el = aroBuild();
            aroFit(); el.classList.add('show'); document.body.classList.add('cal-on', 'arc-on');   // cal-on = 장소에 있어요
        }
        function closeArcRoom() {
            const el = aroq('arcRoom'); if (!el || !el.classList.contains('show')) return;
            el.classList.remove('show'); document.body.classList.remove('cal-on', 'arc-on');
            const t = aroq('aroTip'); if (t) t.hidden = true;
        }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && aroOn() && !document.querySelector('.modal[style*="flex"]') && !document.querySelector('#arcadeRoom.show, #hofRoom.show, .hof-room.show')) { if (window.deskGoRoom) deskGoRoom(); else closeArcRoom(); } });
        window.openArcRoom = openArcRoom; window.closeArcRoom = closeArcRoom;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['arcroom'] = true;
