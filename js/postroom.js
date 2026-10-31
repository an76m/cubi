/* 말랑달콤 다이어리 - js/postroom.js
   📮 우체통 (도련 10-31) : 💻 PC · 📲 아이패드에서 '우체통' 칸을 누르면 (📱 폰은 예전 카페 칸 그대로 · calRoomUse)
   - 별밤 거리 (하늘 · 별 · 달 · 가로등) 가운데 큰 우체통 그림(img/post-box.webp) · 우체통 안 창에서 한 가지씩
       처음 = 무엇을 할까요? → 💌 익명 편지함 / 💬 건의함 (‹ 처음으로 = 다시 고르기)
   - 기능은 원래 창 그대로 (새로 만들지 않아요) : 고를 때 원래 창의 부분을 이 창으로 옮겨 오고 · 처음으로 / 떠날 때 제자리로
       💌 익명 편지함 (js/letter.js) = 받은 편지 · 편지 쓰기 · 보낸 편지 · 읽기 (로그인 · 서버 확인도 원래 그대로)
       💬 건의함 (js/service.js) = 적는 칸 · 글자 수 · 보내기 (전송 중 창 · 실패 안내도 원래 그대로)
   - 닫기 없음 = 오른쪽 위 '이동' (달력처럼 한 장소) · 그림 1672 × 941 을 화면에 맞게 줄여요 */

        const PR_W = 1672, PR_H = 941, PR_GROUND = 801;                         // 땅이 시작하는 높이 (그림 안)
        const pr0 = { moved: [], view: 'cats' };
        const prq = id => document.getElementById(id);
        const prOn = () => !!prq('postRoom') && prq('postRoom').classList.contains('show');

        function prBuild() {
            let el = prq('postRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'postRoom'; el.className = 'pr-room';
            let stars = '';
            for (let i = 0; i < 90; i++) stars += `<i class="pr-star" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 62).toFixed(2)}%;--d:${(Math.random() * 3).toFixed(2)}s;opacity:${(.45 + Math.random() * .55).toFixed(2)}"></i>`;
            el.innerHTML = `<div class="pr-stars">${stars}</div>
                <div class="pr-stage" id="prStage">
                    <i class="pr-moon"></i>
                    <i class="pr-lamp" style="left:330px"></i><i class="pr-lamph" style="left:307px"></i>
                    <i class="pr-lamp" style="left:1330px"></i><i class="pr-lamph" style="left:1307px"></i>
                    <img class="pr-bg" src="img/post-box.webp?v=20261009-1001" alt="" draggable="false">
                    <div class="pr-slot">✉️ 편지는 여기로 쏙</div>
                    <div class="pr-win">
                        <div class="pr-view" id="prCats">
                            <div class="pr-ask">무엇을 할까요?</div>
                            <div class="pr-cats">
                                <button type="button" class="pr-cat" onclick="prGo('lb')"><i>💌</i><span><b>익명 편지함</b><small>어딘가의 다꾸러와 편지 주고받기</small></span><em>›</em></button>
                                <button type="button" class="pr-cat" onclick="prGo('fb')"><i>💬</i><span><b>건의함</b><small>제작자에게 의견 보내기</small></span><em>›</em></button>
                            </div>
                        </div>
                        <div class="pr-view" id="prLb" hidden>
                            <div class="pr-top"><button type="button" class="pr-bk" onclick="prGo('cats')">‹ 처음으로</button><b>💌 익명 편지함</b><span class="pr-back" id="prLbBack"></span></div>
                            <div class="pr-in pr-zoom" id="prLbIn"></div>
                        </div>
                        <div class="pr-view" id="prFb" hidden>
                            <div class="pr-top"><button type="button" class="pr-bk" onclick="prGo('cats')">‹ 처음으로</button><b>💬 건의함</b></div>
                            <div class="pr-in" id="prFbIn"><div class="pr-hd">불편한 점, 바라는 기능, 응원의 한마디 · 제작자에게 바로 전해져요</div></div>
                        </div>
                    </div>
                    <button type="button" class="pr-go desk-shop-go" onclick="deskMoveOpen()">이동</button>   <!-- 🚪 닫기 대신 이동 (달력과 같은 틀) -->
                </div>`;
            document.body.appendChild(el);
            addEventListener('resize', () => { if (prOn()) prFit(); });
            el.addEventListener('click', e => { if (e.target.closest('#lbTabs button, #lbBack')) { const s = prq('prLbIn'); if (s) s.scrollTop = 0; } });   // 탭을 바꾸면 창 맨 위로
            return el;
        }
        /* 원래 창의 부분을 이리로 (달력 calroom.js 와 같은 방법) */
        function prBorrow(host, room, sels) {
            sels.forEach(s => { const n = room && room.querySelector(s); if (!n) return; pr0.moved.push([n, n.parentNode, n.nextSibling]); host.appendChild(n); });
        }
        function prGiveBack() { pr0.moved.reverse().forEach(([n, p, nx]) => { if (p) p.insertBefore(n, nx && nx.parentNode === p ? nx : null); }); pr0.moved = []; }
        function prFit() {
            const st = prq('prStage'), el = prq('postRoom'); if (!st) return;
            const s = Math.min(innerWidth / PR_W, innerHeight / PR_H), x = (innerWidth - PR_W * s) / 2, y = (innerHeight - PR_H * s) / 2;
            st.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
            el.style.setProperty('--gy', (y + PR_GROUND * s) + 'px');           // 🌙 땅 = 화면 끝까지 (그림 밖도)
        }
        function prShow(v) {
            pr0.view = v;
            ['cats', 'lb', 'fb'].forEach(k => { prq({ cats: 'prCats', lb: 'prLb', fb: 'prFb' }[k]).hidden = k !== v; });
        }
        function prGo(v) {
            if (pr0.view === 'fb' && typeof feedbackSending !== 'undefined' && feedbackSending) return;             // 전송 중엔 그대로
            if (v === 'lb') {
                if (!LB_API_URL) { comingSoon('💌 익명 편지함'); return; }      // 로그인 · 서버 확인 = openLetterBox 와 같아요
                if (!lbLogged()) { showMsg('💌 익명 편지함은 구글 로그인을 해야 쓸 수 있어요.<br><span style="font-size:12px;color:#777;">편지를 주고받으려면 진짜 다꾸러인지 확인이 필요해요.<br>(이메일이나 이름은 보내지 않아요)</span>'); return; }
            }
            prGiveBack();
            if (v === 'lb') {
                lbBuild();
                const r = prq('lbRoom');
                prBorrow(prq('prLbBack'), r, ['#lbBack']);
                prBorrow(prq('prLbIn'), r, ['#lbTabs', '#lbIn', '#lbWrite', '#lbSent', '#lbRead']);
                lbTab('in'); lbLoad();
            }
            if (v === 'fb') {
                if (typeof warmServer === 'function' && typeof FEEDBACK_SCRIPT_URL !== 'undefined') warmServer(FEEDBACK_SCRIPT_URL);
                prBorrow(prq('prFbIn'), prq('feedbackModal'), ['#feedbackInput', '.feedback-count', '#feedbackSendBtn']);
            }
            prShow(v);
            const s = v === 'lb' ? prq('prLbIn') : prq('prFbIn'); if (s) s.scrollTop = 0;
            if (v === 'fb') prq('feedbackInput').focus();
        }
        function openPostRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.closeCalRoom) closeCalRoom();
            const el = prBuild();
            prGiveBack(); prShow('cats');
            prFit(); el.classList.add('show'); document.body.classList.add('cal-on', 'post-on');   // cal-on = 장소에 있어요 (이동 창 · 책상 버튼 숨김)
        }
        function closePostRoom() {
            const el = prq('postRoom'); if (!el || !el.classList.contains('show')) return;
            el.classList.remove('show'); document.body.classList.remove('cal-on', 'post-on');
            prGiveBack(); pr0.view = 'cats';
        }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && prOn() && !document.querySelector('.modal[style*="flex"]') && !(prq('feedbackSending') && !prq('feedbackSending').hidden)) { if (window.deskGoRoom) deskGoRoom(); else closePostRoom(); } });   // Esc = 🚪 내 방으로
        window.openPostRoom = openPostRoom; window.closePostRoom = closePostRoom; window.prGo = prGo;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['postroom'] = true;
