/* 말랑달콤 다이어리 - js/dkguide.js
   🩷 처음 쓰는 사람용 '다꾸하는 법' 메모 (도련 10-26 · 시안 A)
   - 다이어리를 펼치면 빈 페이지 위에 테이프로 붙인 메모 한 장 : 바구니에 받고 → 꺼내고 → 핀셋으로 붙여요
   - 막지 않아요 (메모는 눌리지 않고 ✕ 만 눌려요) · 아래 ✨ 스티커 버튼이 살짝 빛나요
   - 스티커를 처음 페이지에 붙이면(own.js ownOp) 또는 ✕ 를 누르면 사라지고 다시 안 떠요 (이 기기 localStorage)
   - 예전 '스티커는 핀셋으로 집어서 옮겨요' 첫 알림은 이 메모가 대신해요 (손으로 스티커를 만지면 뜨는 핀셋 알림은 그대로 · js/skins.js twzSay)
   ※ 메모는 #innerPage 안 · #canvasArea 밖 (일기로 저장되지 않게) */

        const DG_LS = 'malang_dg_done';
        const dgIsDone = () => { try { return !!localStorage.getItem(DG_LS); } catch (e) { return false; } };
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
        function dgShow() {
            if (dgIsDone() || document.getElementById('dgNote')) return;
            const host = document.getElementById('innerPage');
            if (!host || !document.getElementById('canvasArea')) return;
            const el = document.createElement('div');
            el.id = 'dgNote'; el.className = 'dg-note';
            el.innerHTML = `<i class="dg-tape"></i>
                <button type="button" class="dg-x" aria-label="안내 닫기" onclick="dgDone()"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg></button>
                <b class="dg-h">말랑달콤 다꾸하는 법</b>
                <div class="dg-step"><span class="dg-ic"><svg viewBox="0 0 28 24" aria-hidden="true"><rect x="8" y="2" width="7" height="8" rx="1.5" fill="#ffd6e4" stroke="#c2457a" stroke-width="1.2"/><rect x="13" y="3.5" width="7" height="8" rx="1.5" fill="#fff3c4" stroke="#c2457a" stroke-width="1.2"/><path d="M3 10h22l-2.5 12h-17z" fill="#f0c48a" stroke="#a8743c" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 14h14M8 18h12" stroke="#a8743c" stroke-width="1" stroke-linecap="round"/></svg></span><span>스티커를 <em>바구니</em>에 받고</span></div>
                <i class="dg-line"></i>
                <div class="dg-step"><span class="dg-ic"><svg viewBox="0 0 28 26" aria-hidden="true"><path d="M2 16h18l-2 8H4z" fill="#f0c48a" stroke="#a8743c" stroke-width="1.3" stroke-linejoin="round"/><rect x="11" y="2" width="12" height="13" rx="2" transform="rotate(12 17 8)" fill="#fff" stroke="#c2457a" stroke-width="1.3"/><circle cx="15.5" cy="7" r="2" fill="#ffb3c9"/><circle cx="19.5" cy="10" r="2" fill="#ffe08a"/><path d="M24 4l2-2M25 8h2" stroke="#e98aab" stroke-width="1.3" stroke-linecap="round"/></svg></span><span><em>바구니</em>에서 스티커를 꺼내고</span></div>
                <i class="dg-line"></i>
                <div class="dg-step"><span class="dg-ic"><svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 3l13 15M8 2l10 15" stroke="#e2557f" stroke-width="2.6" stroke-linecap="round"/><path d="M17 17l3 3" stroke="#e2557f" stroke-width="3.4" stroke-linecap="round"/><rect x="15" y="18" width="10" height="8" rx="1.5" transform="rotate(-8 20 22)" fill="#fff3c4" stroke="#c2457a" stroke-width="1.2"/><path d="M18.5 22.5l1.2 1.2 2.6-2.6" stroke="#c2457a" stroke-width="1.1" fill="none" stroke-linecap="round"/></svg></span><span><em>핀셋</em>으로 스티커를<br>페이지에 붙여요</span></div>
                <div class="dg-foot">아래 <b>스티커</b>를 눌러 시작해요</div>`;
            host.appendChild(el);
            dgPlace();
            document.body.classList.add('dg-on');
            requestAnimationFrame(() => el.classList.add('on'));
        }
        function dgDone() {
            try { localStorage.setItem(DG_LS, '1'); } catch (e) {}
            document.body.classList.remove('dg-on');
            const el = document.getElementById('dgNote'); if (!el) return;
            el.classList.remove('on'); setTimeout(() => el.remove(), 300);
        }
        window.addEventListener('resize', () => requestAnimationFrame(dgPlace));
        window.dgWill = () => !dgIsDone(); window.dgShow = dgShow; window.dgDone = dgDone; window.dgPlace = dgPlace;
