/* 말랑달콤 다이어리 - js/tarotroom.js
   🔮 타로카페 (도련 10-31 · 시안 A) : 💻 PC · 📲 아이패드 · 📱 폰(11-09 · 세로 그림 TRO_PH)에서 '타로카페' 칸을 누르면
   - 그림(img/tarot-room.webp · 도련 그림) 탁자 위 카드 다섯 장 = 메뉴 다섯 : 카드나 아래 이름표를 톡 = 그 메뉴 (원래 창을 그대로 열어요)
       🌙 달 카드 = 꿈해몽 · ⭐ 별 카드 = 포춘카드 · ☀️ 해와 달 카드 = 토정비결 · 👁️ 눈 카드 = 심리테스트 · 🦉 부엉이 두 마리 = 이름 궁합
   - 마우스를 올리면 그 카드가 금빛으로 빛나요 · 닫기 없음 = 오른쪽 위 '이동' (달력 · 우체통과 같은 틀)
   - 결과를 📌 다이어리에 붙이면 이 화면도 닫고 책상으로 (각 창의 붙이기 · closeTarotRoom) */

        const TRO_W = 1672, TRO_H = 941;
        /* [이름, 작은 설명, 여는 함수, 카드 네 모서리(그림 좌표), 이름표 자리] */
        const TRO_CARDS = [
            ['🌙 꿈해몽', '어젯밤 꿈 풀기', () => window.openDream ? openDream() : comingSoon('🌙 꿈해몽'), '368,655 548,662 522,845 312,836', [432, 860]],
            ['⭐ 포춘카드', '오늘의 한 장', () => openFortune(), '565,642 720,638 713,820 528,815', [632, 836]],
            ['☀️ 토정비결', '올해의 운세', () => window.openTojeong ? openTojeong() : comingSoon('🎍 토정비결'), '738,627 918,627 930,802 722,802', [826, 820]],
            ['👁️ 심리테스트', '나도 몰랐던 나', () => window.openPsyTest ? openPsyTest() : comingSoon('🧠 심리테스트'), '935,635 1092,642 1130,825 948,822', [1036, 836]],
            ['🦉 이름 궁합', '둘의 이름으로', () => window.openNameMatch ? openNameMatch() : comingSoon('💕 이름 궁합'), '1108,658 1282,662 1338,858 1148,850', [1236, 862]]
        ];
        /* 📱 폰 = 세로 그림 (도련 11-09 · img/tarot-room-m.webp · tarot-door-m.webp · 941 × 1672) : 카드 다섯 장 그대로 · 이름표는 탁자 아래 두 줄 (3 + 2)
           그림은 가로를 맞춰 카드가 다 보이게 · 남는 위쪽은 하늘색으로 채워요 */
        const TRO_PH = { W: 941, H: 1672,
            cards: ['50,1236 122,1047 256,1047 215,1217', '225,1211 270,1040 392,1029 375,1200', '385,1197 404,1024 539,1024 556,1197', '567,1201 549,1029 670,1040 715,1212', '729,1225 684,1050 805,1065 891,1237'],
            tags: [[180, 1290], [470, 1290], [760, 1290], [325, 1418], [615, 1418]], ttl: [470, 70], door: { cx: 472, cy: 537, sy: 890 } };
        const troPh = () => UI.tall();
        const troq = id => document.getElementById(id);
        /* ✨ 신비 연출 (도련 10-31 · 시안에서 고른 것 · 배경음악 없음) : 별 반짝 · 달빛 · 촛불 일렁임 · 수정구슬 소용돌이 · 빛가루 · 카드 금빛 스침 · 가장자리 어둠 숨쉬기
           모두 CSS 움직임 (그림 위에 얹기만 · 누르는 것 없음) · 동작 줄이기 설정이면 멈춰요 (css/tarotroom.css) */
        function troFx(ph) {
            const R = (a, b) => a + Math.random() * (b - a);
            let tw = '', du = '';
            if (ph) {                                                            // 📱 세로 그림 : 하늘 = 위 (구름 위) · 빛가루 = 탁자 둘레
                for (let i = 0; i < 40; i++) { const x = R(0, 941), y = R(0, 520); if (Math.abs(x - 470) < 110 && Math.abs(y - 295) < 110) continue; tw += `<i class="tro-tw${Math.random() < .3 ? ' x' : ''}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--d:${R(2, 5).toFixed(1)}s;--l:-${R(0, 5).toFixed(1)}s"></i>`; }
                for (let i = 0; i < 30; i++) du += `<i class="tro-dust" style="left:${R(60, 880).toFixed(0)}px;top:${R(700, 1500).toFixed(0)}px;--d:${R(7, 13).toFixed(1)}s;--l:-${R(0, 13).toFixed(1)}s;--x:${R(-60, 60).toFixed(0)}px"></i>`;
            } else {
            for (let i = 0; i < 46; i++) { const x = R(0, 1672), y = R(0, 560); if (x > 250 && x < 460 && y > 150) continue; tw += `<i class="tro-tw${Math.random() < .3 ? ' x' : ''}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--d:${R(2, 5).toFixed(1)}s;--l:-${R(0, 5).toFixed(1)}s"></i>`; }
            for (let i = 0; i < 34; i++) du += `<i class="tro-dust" style="left:${R(150, 1550).toFixed(0)}px;top:${R(500, 930).toFixed(0)}px;--d:${R(7, 13).toFixed(1)}s;--l:-${R(0, 13).toFixed(1)}s;--x:${R(-60, 60).toFixed(0)}px"></i>`;
            }
            return `<div class="tro-fx tro-vig"></div><div class="tro-fx tro-moon"></div><div class="tro-fx tro-stars">${tw}</div>
                <div class="tro-fx tro-cglow"></div><div class="tro-fx tro-flame"></div>
                <div class="tro-fx tro-ball"><i></i><b></b></div>
                <div class="tro-fx tro-sheen"><i></i></div><div class="tro-fx tro-dusts">${du}</div>`;
        }
        const troOn = () => !!troq('tarotRoom') && troq('tarotRoom').classList.contains('show');

        function troBuild() {
            const ph = troPh();
            let el = troq('tarotRoom'); if (el && el.classList.contains('ph') === ph) return el;
            if (el) el.remove();                                                 // 💻 ↔ 📱 가 바뀌었어요 (창 크기) → 그 그림으로 다시
            const W = ph ? TRO_PH.W : TRO_W, H = ph ? TRO_PH.H : TRO_H;
            el = document.createElement('div'); el.id = 'tarotRoom'; el.className = 'tro-room' + (ph ? ' ph' : '');
            el.innerHTML = `<div class="tro-stage" id="trStage"><img class="tro-bg" src="${ph ? 'img/tarot-room-m.webp?v=20261009-1035' : 'img/tarot-room.webp?v=20261009-1018'}" alt="" draggable="false">
                    ${troFx(ph)}
                    <svg class="tro-cards" viewBox="0 0 ${W} ${H}" aria-hidden="true">${TRO_CARDS.map((c, i) => `<polygon class="tro-card" data-i="${i}" points="${ph ? TRO_PH.cards[i] : c[3]}"/>`).join('')}</svg>
                </div>
                <div class="tro-ttl">🔮 타로카페<small>오늘은 어떤 카드를 뒤집어 볼까요?</small></div>
                ${ph ? '<div class="tro-tags">' : ''}${TRO_CARDS.map((c, i) => `<button type="button" class="tro-tag" data-i="${i}">${c[0]}<small>${c[1]}</small></button>`).join('')}${ph ? '</div>' : ''}
                <button type="button" class="tro-go desk-shop-go" onclick="deskMoveOpen()">이동</button>`;   // 제목 · 이름표 · 이동 = 화면 위 (그림이 잘려도 화면 안에)
            document.body.appendChild(el);
            const hov = (i, on) => el.querySelectorAll(`[data-i="${i}"]`).forEach(x => x.classList.toggle('hov', on));
            el.querySelectorAll('[data-i]').forEach(x => {
                const i = +x.dataset.i;
                x.addEventListener('pointerenter', () => hov(i, true));
                x.addEventListener('pointerleave', () => hov(i, false));
                x.addEventListener('click', () => { hov(i, false); TRO_CARDS[i][2](); });
            });
            if (!troBuild.rs) { troBuild.rs = 1; addEventListener('resize', () => { if (troOn()) { const ph = troPh(); if (troq('tarotRoom').classList.contains('ph') !== ph) { troBuild().classList.add('show'); } troFit(); } }); }
            return el;
        }
        function troFit() {                                                      // 그림 = 화면 꽉 (coverFit · 카드 쪽이 보이게) · 제목 · 이름표는 그림 자리를 따라가되 화면 밖이면 안으로
            const st = troq('trStage'), el = troq('tarotRoom'); if (!st) return;
            if (el.classList.contains('ph')) {                                   // 📱 가로를 맞춰 카드 다섯 장이 다 보이게 (cover 보다 크지 않게) · 그림은 아래에 붙이고 남는 위는 하늘색
                const P = TRO_PH, s = Math.min(Math.max(innerWidth / P.W, innerHeight / P.H), innerWidth / 880), x = (innerWidth - P.W * s) / 2, y = innerHeight - P.H * s;
                st.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
                const t = el.querySelector('.tro-ttl'); Object.assign(t.style, { left: innerWidth / 2 + 'px', top: Math.max(54, y + P.ttl[1] * s) + 'px', scale: '' });
                const g = el.querySelector('.tro-tags');                         // 📱 이름표 상자 = 카드 바로 아래 · 줄 바꿈으로 겹치지 않아요 · 화면 아래로 넘치면 위로
                if (g) g.style.top = Math.max(0, Math.min(y + P.tags[0][1] * s, innerHeight - (g.offsetHeight || 110) - 10)) + 'px';
                return;
            }
            const { s, x, y } = coverFit(TRO_W, TRO_H, [290, 1370, 300, 905]);
            st.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
            const t = el.querySelector('.tro-ttl'); Object.assign(t.style, { left: x + 836 * s + 'px', top: Math.max(10, y + 92 * s) + 'px', scale: String(s) });
            el.querySelectorAll('.tro-tag').forEach(b => { const [tx, ty] = TRO_CARDS[+b.dataset.i][4], h = (b.offsetHeight || 54) * s, w = (b.offsetWidth || 120) * s / 2 + 8; Object.assign(b.style, { left: Math.max(w, Math.min(innerWidth - w, x + tx * s)) + 'px', top: Math.min(y + ty * s, innerHeight - h - 8) + 'px', scale: String(s) }); });
        }
        /* 🚪 타로카페 문 (도련 10-31 · 기본상품 샵 들어갈 때처럼) : 보라 나무문(img/tarot-door.webp) 이 화면을 채우고 → 🔔 스르릉~ (✨ 연출 소리)
           → 둥근 달 창 쪽으로 다가가며 보랏빛 · 금빛 → 타로카페 (문 뒤에서 미리 열어 둬요) · 동작 줄이기면 바로 */
        const TRO_DOOR = { cx: 836, cy: 290, sy: 668 };                             // 달 창 가운데 · 문 위 '타로카페' 글자 자리 (그림 px)
        let troDoorBusy = false;
        function troDoorFit(d) {
            const ph = troPh(), W = ph ? TRO_PH.W : TRO_W, H = ph ? TRO_PH.H : TRO_H, D = ph ? TRO_PH.door : TRO_DOOR;   // 📱 세로 문 그림
            const im = d.querySelector('img'), src = ph ? 'img/tarot-door-m.webp?v=20261009-1035' : 'img/tarot-door.webp?v=20261009-1024';
            if (im.getAttribute('src') !== src) im.setAttribute('src', src);
            const s = Math.max(innerWidth / W, innerHeight / H), x = (innerWidth - W * s) / 2, y = (innerHeight - H * s) / 2;
            Object.assign(im.style, { width: W * s + 'px', height: H * s + 'px', left: x + 'px', top: y + 'px' });
            Object.assign(d.querySelector('.tro-door-sign').style, { left: x + D.cx * s + 'px', top: y + D.sy * s + 'px', fontSize: (ph ? 60 : 64) * s + 'px' });
            d.querySelector('.tro-door-in').style.transformOrigin = `${x + D.cx * s}px ${y + D.cy * s}px`;
        }
        function troDoor() {
            if (troDoorBusy || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            let d = troq('troDoor');
            if (!d) { d = document.createElement('div'); d.id = 'troDoor'; d.className = 'tro-door'; d.innerHTML = '<div class="tro-door-in"><img src="img/tarot-door.webp?v=20261009-1024" alt="" draggable="false"><div class="tro-door-sign">✦ 타로카페 ✦</div></div>'; document.body.appendChild(d); }
            troDoorBusy = true; troDoorFit(d);
            d.classList.remove('enter', 'leave'); d.classList.add('on');
            const go = () => { if (window.sndTarotDoor) sndTarotDoor(); d.classList.add('enter'); setTimeout(() => { d.classList.add('leave'); setTimeout(() => { d.classList.remove('on', 'enter', 'leave'); troDoorBusy = false; }, 400); }, 1700); };
            const img = d.querySelector('img'), start = () => setTimeout(go, 750);   // 문을 잠깐 보여 주고
            if (img.complete) start(); else img.addEventListener('load', start, { once: true });
        }
        function openTarotRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.deskLeave) deskLeave();                                   // 달력 · 우체통에 있었으면 떠나요
            troDoor();                                                           // 🚪 문을 지나 들어가요 (방은 문 뒤에서 미리 열어 둬요)
            const el = troBuild();
            troFit(); el.classList.add('show'); document.body.classList.add('cal-on', 'tarot-on');   // cal-on = 장소에 있어요 (이동 창 · 책상 버튼 숨김)
        }
        function closeTarotRoom() {
            const el = troq('tarotRoom'); if (!el || !el.classList.contains('show')) return;
            el.classList.remove('show'); document.body.classList.remove('cal-on', 'tarot-on');
            el.querySelectorAll('.hov').forEach(x => x.classList.remove('hov'));
        }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && troOn() && !document.querySelector('.modal[style*="flex"]') && !document.querySelector('#fortuneRoom.show, #dreamRoom.show, #tojeongRoom.show, #nmRoom.show, #psyRoom.show')) { if (window.deskGoRoom) deskGoRoom(); else closeTarotRoom(); } });   // Esc = 🚪 내 방으로
        window.openTarotRoom = openTarotRoom; window.closeTarotRoom = closeTarotRoom;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['tarotroom'] = true;
