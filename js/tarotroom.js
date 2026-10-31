/* 말랑달콤 다이어리 - js/tarotroom.js
   🔮 타로카페 (도련 10-31 · 시안 A) : 💻 PC · 📲 아이패드에서 '타로카페' 칸을 누르면 (📱 폰은 예전 카페 칸 그대로 · calRoomUse)
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
        const troq = id => document.getElementById(id);
        const troOn = () => !!troq('tarotRoom') && troq('tarotRoom').classList.contains('show');

        function troBuild() {
            let el = troq('tarotRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'tarotRoom'; el.className = 'tro-room';
            el.innerHTML = `<img class="tro-blur" src="img/tarot-room.webp?v=20261009-1018" alt="" draggable="false">
                <div class="tro-stage" id="trStage"><img class="tro-bg" src="img/tarot-room.webp?v=20261009-1018" alt="" draggable="false">
                    <div class="tro-ttl">🔮 타로카페<small>오늘은 어떤 카드를 뒤집어 볼까요?</small></div>
                    <svg class="tro-cards" viewBox="0 0 ${TRO_W} ${TRO_H}" aria-hidden="true">${TRO_CARDS.map((c, i) => `<polygon class="tro-card" data-i="${i}" points="${c[3]}"/>`).join('')}</svg>
                    ${TRO_CARDS.map((c, i) => `<button type="button" class="tro-tag" data-i="${i}" style="left:${c[4][0]}px;top:${c[4][1]}px">${c[0]}<small>${c[1]}</small></button>`).join('')}
                    <button type="button" class="tro-go desk-shop-go" onclick="deskMoveOpen()">이동</button>
                </div>`;
            document.body.appendChild(el);
            const hov = (i, on) => el.querySelectorAll(`[data-i="${i}"]`).forEach(x => x.classList.toggle('hov', on));
            el.querySelectorAll('[data-i]').forEach(x => {
                const i = +x.dataset.i;
                x.addEventListener('pointerenter', () => hov(i, true));
                x.addEventListener('pointerleave', () => hov(i, false));
                x.addEventListener('click', () => { hov(i, false); TRO_CARDS[i][2](); });
            });
            addEventListener('resize', () => { if (troOn()) troFit(); });
            return el;
        }
        function troFit() {
            const st = troq('trStage'); if (!st) return;
            const s = Math.min(innerWidth / TRO_W, innerHeight / TRO_H);
            st.style.transform = `translate(${(innerWidth - TRO_W * s) / 2}px, ${(innerHeight - TRO_H * s) / 2}px) scale(${s})`;
        }
        function openTarotRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.deskLeave) deskLeave();                                   // 달력 · 우체통에 있었으면 떠나요
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
