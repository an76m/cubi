/* 말랑달콤 다이어리 - js/dkguide.js
   🩷 처음 쓰는 사람용 '다꾸하는 법' 메모 (도련 10-26 · 시안 A)
   - 다이어리를 펼치면 빈 페이지 위에 테이프로 붙인 메모 한 장 : 한 줄 = 스티커는 🪑 이동 / 📱 아래 스티커 → 기본상품 샵에서 받아 와요 (도련 11-05 · 예전 5단계 할 일 목록은 없앴어요)
   - 막지 않아요 (메모는 눌리지 않고 ✕ 만 눌려요) · 아래 ✨ 스티커 버튼이 살짝 빛나요 (🪑 책상 화면이면 스티커가 붙은 소품)
   - 스티커를 처음 페이지에 붙이면(own.js ownOp) 또는 ✕ 를 누르면 사라지고 다시 안 떠요 (설정 'diary_dg_done' · 폴더를 지우면 다시)
   - 예전 '스티커는 핀셋으로 집어서 옮겨요' 첫 알림은 이 메모가 대신해요 (손으로 스티커를 만지면 뜨는 핀셋 알림은 그대로 · js/skins.js twzSay)
   ※ 메모는 #innerPage 안 · #canvasArea 밖 (일기로 저장되지 않게) */

        const DG_KEY = 'diary_dg_done', DG_LS = 'malang_dg_done';             // 💾 본 표시 = 로그인 → 드라이브 설정 · 게스트 → 이 기기 (도련 10-31 : 말랑달콤 폴더를 지우면 다시 떠요 · js/drive.js prefGet)
        const dgIsDone = () => !!prefGet(DG_KEY, DG_LS);
        function dgPlace() {                                                     // 보이는 쪽 가운데 위 (📱 한쪽 보기면 그 쪽 · 💻 펼친 두 쪽이면 왼쪽 쪽 : 오른쪽엔 핀셋이 있어요)
            const el = document.getElementById('dgNote'), cv = document.getElementById('canvasArea');
            if (!el || !cv || !el.parentElement) return;
            const r0 = cv.getBoundingClientRect(), r = window.dyVisRect ? dyVisRect(r0) : r0, hr = el.parentElement.getBoundingClientRect();
            const L = Math.max(r.left, 0), R = Math.min(r.right, innerWidth), w = R - L;
            if (w <= 0) return;
            const x = L + w * (w > r.height * .9 ? .27 : .5);
            el.style.left = (x - hr.left) + 'px';
            el.style.top = (r.top - hr.top + Math.max(20, r.height * .12)) + 'px';
        }
        /* 🩷 메모 내용 = 한 줄 (도련 11-05 : 할 일 목록처럼 길면 외워야 해요 → 스티커를 어디서 받는지만) · 💻 📲 📱 모두 = 이동 → 기본상품 샵 (도련 11-10) */
        const DG_SHOP = '<span class="dg-ic"><svg viewBox="0 0 28 28" aria-hidden="true"><rect x="7" y="3" width="14" height="22" rx="2" fill="#ffd6e4" stroke="#c2457a" stroke-width="1.4"/><rect x="10" y="6" width="8" height="7" rx="1.5" fill="#fff" stroke="#c2457a" stroke-width="1.1"/><circle cx="17.5" cy="16" r="1.3" fill="#c2457a"/><path d="M3 25h22" stroke="#a8743c" stroke-width="1.6" stroke-linecap="round"/></svg></span>';
        const DG_DESK = `<div class="dg-step">${DG_SHOP}<span>다꾸를 하려면 스티커를<br><em>이동</em> → <em>기본상품&nbsp;샵</em>에서<br>받아 와야 해요.</span></div>`;
        const dgDesk = () => document.documentElement.classList.contains('desk-on');
        function dgShow() {
            if (dgIsDone() || document.getElementById('dgNote')) return;
            const host = document.getElementById('innerPage');
            if (!host || !document.getElementById('canvasArea')) return;
            const el = document.createElement('div');
            el.id = 'dgNote'; el.className = 'dg-note';
            el.innerHTML = `<i class="dg-tape"></i>
                <button type="button" class="dg-x" aria-label="안내 닫기" onclick="dgDone()"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg></button>
                <b class="dg-h">말랑달콤 다꾸하는 법</b>
                ${DG_DESK}`;   /* 📱 폰도 💻 📲 와 같은 글 = 이동 → 기본상품 샵 (도련 11-10 · 폰 아래 메뉴에도 🚪 이동이 생겼어요) */   // 🎁 처음부터 있는 것 · 시작 안내 줄은 뺐어요 (도련 11-05)
            host.appendChild(el);
            dgPlace();
            document.body.classList.add('dg-on');
            requestAnimationFrame(() => el.classList.add('on'));
        }
        function dgDone() {
            prefSet(DG_KEY, DG_LS, 1);
            document.body.classList.remove('dg-on');
            const el = document.getElementById('dgNote'); if (!el) return;
            el.classList.remove('on'); setTimeout(() => el.remove(), 300);
        }
        window.addEventListener('resize', () => requestAnimationFrame(dgPlace));
        window.dgWill = () => !dgIsDone(); window.dgShow = dgShow; window.dgDone = dgDone; window.dgPlace = dgPlace;
