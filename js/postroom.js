/* 말랑달콤 다이어리 - js/postroom.js
   📮 우체통 (도련 10-31) : 💻 PC · 📲 아이패드에서 '우체통' 칸을 누르면 (📱 폰 = 11-09 세로 그림 · PR_PH)
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

        /* 📱 폰 (도련 11-09) : 세로 우체통 그림(img/post-box-m.webp · 941 × 1672 · 투명 배경) 이 화면 가로를 거의 채워요 · 안 창 · 글씨는 그림과 함께 줄지 않게 화면 크기로 (prFit)
           들어갈 때 = 세로 밤 강변 길(img/post-street-m.webp) → 빨간 우체통 쪽으로 (💻 📲 와 같은 전환) */
        const PR_PH = { W: 941, H: 1672, box: [9, 164, 930, 1496], win: [78, 462, 863, 1242], slotY: 362, street: { cx: 548, cy: 1010 } };
        const prPh = () => UI.tall();
        function prBuild() {
            const ph = prPh();
            let el = prq('postRoom'); if (el && el.classList.contains('ph') === ph) return el;
            if (el) { prGiveBack(); el.remove(); }
            el = document.createElement('div'); el.id = 'postRoom'; el.className = 'pr-room' + (ph ? ' ph' : '');
            let stars = '';
            for (let i = 0; i < 90; i++) stars += `<i class="pr-star" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 62).toFixed(2)}%;--d:${(Math.random() * 3).toFixed(2)}s;opacity:${(.45 + Math.random() * .55).toFixed(2)}"></i>`;
            el.innerHTML = `<div class="pr-stars">${stars}</div>
                <div class="pr-stage" id="prStage">
                    <i class="pr-moon"></i>
                    <i class="pr-lamp" style="left:330px"></i><i class="pr-lamph" style="left:307px"></i>
                    <i class="pr-lamp" style="left:1330px"></i><i class="pr-lamph" style="left:1307px"></i>
                    <img class="pr-bg" src="${ph ? 'img/post-box-m.webp?v=20261009-1041' : 'img/post-box.webp?v=20261009-1001'}" alt="" draggable="false">
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
            if (ph) { const room = el; room.appendChild(room.querySelector('.pr-slot')); room.appendChild(room.querySelector('.pr-win')); room.appendChild(room.querySelector('.pr-go')); room.querySelectorAll('.pr-lamp, .pr-lamph').forEach(x => x.remove()); }   // 📱 안 창 · 글씨 · 이동 = 화면 크기 (그림 밖으로 꺼내요)
            if (!prBuild.rs) { prBuild.rs = 1; addEventListener('resize', () => { if (prOn()) { if (prq('postRoom').classList.contains('ph') !== prPh()) { const v = pr0.view; prBuild().classList.add('show'); prShow('cats'); } prFit(); } }); }
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
            if (el.classList.contains('ph')) {                                   // 📱 우체통 = 가로 94% · 아래쪽에 서 있어요 (위 = 별밤 하늘)
                const P = PR_PH, [bl, bt, br, bb] = P.box, s = Math.min(innerWidth * .94 / (br - bl), innerHeight * .8 / (bb - bt));
                const x = (innerWidth - (bl + br) * s) / 2, y = innerHeight * .93 - bb * s;
                st.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
                el.style.setProperty('--gy', (y + (bb - 8) * s) + 'px');
                const [wl, wt, wr, wb] = P.win;
                Object.assign(el.querySelector('.pr-win').style, { left: x + wl * s + 'px', top: y + wt * s + 'px', width: (wr - wl) * s + 'px', height: (wb - wt) * s + 'px' });
                el.style.setProperty('--fbh', Math.max(48, Math.min(110, (wb - wt) * s - 200)) + 'px');   // 💬 건의함 적는 칸 = 남는 높이만큼 (전송 버튼까지 한 화면에)
                Object.assign(el.querySelector('.pr-slot').style, { left: x + (bl + br) / 2 * s + 'px', top: y + P.slotY * s + 'px' });
                return;
            }
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
        /* 🌙 강변 우체통 전환 (도련 11-01 · 타로카페 · 오락실 · 캡슐기계와 같은 전환) : 밤 강변 길(img/post-street.webp) → 가로등 아래 빨간 우체통 쪽으로 커지며 노란 · 보랏빛 → 우체통 · 동작 줄이기면 바로 */
        let prGoBusy = false;
        function prApproach() {
            if (prGoBusy || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            let d = prq('prGo');
            if (!d) { d = document.createElement('div'); d.id = 'prGo'; d.className = 'pr-walk'; d.innerHTML = '<div class="pr-walk-in"><img alt="" draggable="false"></div>'; document.body.appendChild(d); }
            prGoBusy = true;
            const ph = prPh(), W = ph ? PR_PH.W : PR_W, H = ph ? PR_PH.H : PR_H, im = d.querySelector('img'), src = ph ? 'img/post-street-m.webp?v=20261009-1041' : 'img/post-street.webp?v=20261009-1041';
            if (im.getAttribute('src') !== src) im.setAttribute('src', src);
            const { s, x, y } = ph ? coverFit(W, H, [380, 760, 850, 1150]) : coverFit(PR_W, PR_H, [700, 1420, 100, 700]);
            Object.assign(im.style, { width: W * s + 'px', height: H * s + 'px', left: x + 'px', top: y + 'px' });
            const inn = d.querySelector('.pr-walk-in'), ox = x + (ph ? PR_PH.street.cx : 1062) * s, oy = y + (ph ? PR_PH.street.cy : 450) * s;   // 빨간 우체통 (그림 px)
            inn.style.transformOrigin = `${ox}px ${oy}px`; inn.style.setProperty('--lx', ox + 'px'); inn.style.setProperty('--ly', oy + 'px');   // 빛도 우체통에서 번져요
            d.classList.remove('go', 'leave'); d.classList.add('on');
            const go = () => { d.classList.add('go'); setTimeout(() => { d.classList.add('leave'); setTimeout(() => { d.classList.remove('on', 'go', 'leave'); prGoBusy = false; }, 400); }, 1700); };
            const img = d.querySelector('img'), start = () => setTimeout(go, 750);
            if (img.complete) start(); else img.addEventListener('load', start, { once: true });
        }
        function openPostRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.closeCalRoom) closeCalRoom();
            prApproach();                                                        // 🌙 강변 길 → 우체통 (우체통은 뒤에서 미리 열어 둬요)
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
