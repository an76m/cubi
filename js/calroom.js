/* 말랑달콤 다이어리 - js/calroom.js
   📅 달력 (도련 10-31) : 💻 PC · 📲 아이패드에서 '달력' 칸을 누르면 (📱 폰은 예전 카페 칸 그대로 · calRoomUse)
   - 벽에 건 달력 그림(img/cal-room.webp) 아래 빈 곳에 한 달 칸을 그려요 : 출석 도장 · 🩸 생리 · 예정 · 가임기 · 배란 · 📌 D-day
   - 기능은 원래 창 그대로 (새로 만들지 않아요) : 열 때 원래 창의 부분을 이 화면으로 옮겨 오고 · 닫을 때 제자리로
       📅 출석 도장판 (js/attend.js) = 오늘 도장 꾹 · 연속 · 가장 긴 연속 · 모은 도장 · 🪙 코인 뒤집기 연출
       🩷 생리 달력 (js/cycle.js) = 지금 상태 · 고른 날(생리 중 · 양 · 몸 상태) · 평균 주기 · 기간 · 안내
       ⏳ D-day (js/dday.js) = 목록 (📌 페이지에 보이기 · 📔 일기에 붙이기 · ✏️ 고치기 · 🗑️ 지우기) · ＋ 만들기
   - 달력 칸을 누르면 = 그날 고르기 (생리 기록할 날 · 만들던 D-day 날짜)
   - '달력에 보기' 켜고 끄기 = 설정 'diary_cal_show' · 그림 1672 × 941 을 화면에 맞게 줄여요 (책상처럼) */

        const CR_W = 1672, CR_H = 941, CR_GRID = [366, 446, 1305, 876];          // 그림 아래 빈 곳 [왼 · 위 · 오른 · 아래]
        const CR_SHOW = 'diary_cal_show', CR_SHOW_L = 'malang_cal_show';
        const CR_ITEMS = [['att', '🐾', '출석 도장'], ['per', '<i class="cr-sw"></i>', '생리'], ['pre', '<i class="cr-sw pre"></i>', '예정 · 가임기'], ['dd', '📌', 'D-day']];
        const CR_WD = ['일', '월', '화', '수', '목', '금', '토'];
        const cr = { y: 0, m: 0, moved: [], t: 0 };
        const crq = id => document.getElementById(id);
        const crKey = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const crShow = () => Object.assign({ att: 1, per: 1, pre: 1, dd: 1 }, prefGet(CR_SHOW, CR_SHOW_L) || {});
        const crOn = () => !!crq('calRoom') && crq('calRoom').classList.contains('show');
        const crDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

        function crBuild() {
            let el = crq('calRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'calRoom'; el.className = 'cr-room';
            el.innerHTML = `<div class="cr-stage" id="crStage"><img class="cr-bg" src="img/cal-room.webp?v=20261009-999" alt="" draggable="false">
                <div class="cr-ttl"><button type="button" class="cr-nav" onclick="crMove(-1)" aria-label="지난달">‹</button><span id="crTitle"></span><button type="button" class="cr-nav" onclick="crMove(1)" aria-label="다음 달">›</button></div>
                <div class="cr-grid" id="crGrid"></div>
                <div class="cr-side cr-l">
                    <div class="cr-box" id="crCy"></div>
                    <div class="cr-card cr-show"><div class="cr-h">달력에 보기</div><div id="crShowList"></div></div>
                </div>
                <div class="cr-side cr-r">
                    <div class="cr-box" id="crAt"><div class="cr-h">📅 출석 도장</div></div>
                    <div class="cr-box" id="crDd"><div class="cr-h">⏳ D-day</div></div>
                </div>
                <button type="button" class="cr-go desk-shop-go" onclick="deskMoveOpen()">이동</button>   <!-- 🚪 닫기 대신 이동 (도련 10-31 · 벽 달력도 한 장소) -->
            </div>`;
            document.body.appendChild(el);
            addEventListener('resize', () => { if (crOn()) crFit(); });
            el.addEventListener('click', e => { if (e.target.closest('.cr-side')) { clearTimeout(cr.t); cr.t = setTimeout(crRender, 60); } });   // 옮겨 온 원래 창에서 고치면 달력 칸도 다시
            el.addEventListener('input', e => { if (e.target.id === 'ddDate') crRender(); });
            return el;
        }
        /* 원래 창의 부분을 이리로 (닫을 때 제자리로 · 📱 하단 메뉴 화면에서는 원래 창 그대로 써요) */
        function crBorrow(host, room, sels) {
            sels.forEach(s => { const n = room && room.querySelector(s); if (!n) return; cr.moved.push([n, n.parentNode, n.nextSibling]); host.appendChild(n); });
        }
        function crGiveBack() { cr.moved.reverse().forEach(([n, p, nx]) => { if (p) p.insertBefore(n, nx && nx.parentNode === p ? nx : null); }); cr.moved = []; }
        function crFit() {
            const st = crq('crStage'); if (!st) return;
            const s = Math.min(innerWidth / CR_W, innerHeight / CR_H);
            st.style.transform = `translate(${(innerWidth - CR_W * s) / 2}px, ${(innerHeight - CR_H * s) / 2}px) scale(${s})`;
        }
        function crRender() {
            if (!crOn()) return;
            const y = cr.y, m = cr.m, S = crShow(), T = new Date(), tk = crKey(T.getFullYear(), T.getMonth(), T.getDate()), first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
            const at = attendInfo(y, m), C = cycleInfo(), dds = ddayList(), dd = {};
            dds.forEach((x, i) => {                                              // 그 달 어느 날에 깃발 (🎂 매년 = 해마다 그날)
                const t = crDate(x.d), k = x.k === 'yearly' ? crKey(y, t.getMonth(), t.getDate()) : x.d;
                (dd[k] = dd[k] || []).push(x);
            });
            crq('crTitle').innerHTML = `<small>${y}</small>${m + 1}월`;
            const rows = Math.ceil((first + n) / 7), [gl, gt, gr, gb] = CR_GRID, cw = (gr - gl) / 7, hh = 26, rh = (gb - gt - hh) / rows;
            let h = CR_WD.map((w, i) => `<span class="cr-wd${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}" style="left:${i * cw}px;width:${cw}px">${w}</span>`).join('');
            for (let i = 0; i < rows * 7; i++) {
                const d = i - first + 1, c = i % 7, r = Math.floor(i / 7), box = `left:${c * cw}px;top:${hh + r * rh}px;width:${cw}px;height:${rh}px`;
                if (d < 1 || d > n) { h += `<div class="cr-c cr-empty" style="${box}"></div>`; continue; }
                const k = crKey(y, m, d), mk = C.mark[k], p = S.per && mk === 'p', pp = S.pre && mk === 'pp', fe = S.pre && (mk === 'fe' || mk === 'ov');
                const run = t => [crKey(y, m, d - 1), crKey(y, m, d + 1)].map(q => C.mark[q] === t);
                let bar = '';
                if (p || pp) { const [a, b] = run(mk); bar = `<i class="cr-per${pp ? ' pre' : ''}${!a || c === 0 ? ' s' : ''}${!b || c === 6 ? ' e' : ''}"></i>`; }
                else if (fe) bar = `<i class="cr-fe${mk === 'ov' ? ' ov' : ''}" title="${mk === 'ov' ? '배란 예정일' : '가임기 예상'}"></i>`;
                const flag = S.dd && dd[k] ? `<span class="cr-flag">${dd[k][0].e || '⭐'} ${htmlEsc(dd[k][0].n)}${dd[k].length > 1 ? ' +' + (dd[k].length - 1) : ''}</span>` : '';
                const st = S.att && at.days.includes(d) ? (s => `<em class="cr-stamp" style="--c:${s.c}">${s.e}</em>`)(at.stamp(d)) : '';
                h += `<button type="button" class="cr-c${c === 0 ? ' sun' : c === 6 ? ' sat' : ''}${k === tk ? ' today' : ''}${k === C.sel ? ' sel' : ''}${k > tk ? ' fut' : ''}" style="${box}" onclick="crPick('${k}')"><span class="cr-n">${d}</span>${C.sym(k) ? '<i class="cr-sym"></i>' : ''}${bar}${flag}${st}</button>`;
            }
            crq('crGrid').innerHTML = h;
            crq('crShowList').innerHTML = CR_ITEMS.map(([k, ic, nm]) => `<button type="button" class="cr-row${S[k] ? ' on' : ''}" onclick="crToggle('${k}')"><span class="cr-ic">${ic}</span>${nm}<i class="cr-tg"></i></button>`).join('');
        }
        function crToggle(k) { const S = crShow(); S[k] = S[k] ? 0 : 1; prefSet(CR_SHOW, CR_SHOW_L, S); crRender(); }
        function crMove(d) { let m = cr.m + d, y = cr.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } cr.y = y; cr.m = m; crRender(); }
        function crPick(k) {                                                     // 그날 고르기 = 🩷 생리 기록할 날 · ⏳ 만들던 D-day 날짜
            if (window.cyPick) cyPick(k);
            if (window.ddayFormDate) ddayFormDate(k);
            crRender();
        }
        function openCalRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            if (window.closePostRoom) closePostRoom();
            const el = crBuild(), T = new Date(); cr.y = T.getFullYear(); cr.m = T.getMonth();
            if (!cr.moved.length) {
                crBorrow(crq('crAt'), attendPrep(), ['#atGo', '.at-stats', '.at-tip']);
                crBorrow(el, crq('attendRoom'), ['#atFlipWrap']);                // 🪙 코인 뒤집기 = 화면 전체 (그림처럼 줄지 않게)
                crBorrow(crq('crCy'), cyclePrep(), ['#cyNow', '#cyDay', '#cyStats', '.cy-note']);
                crBorrow(crq('crDd'), ddayPrep(), ['#ddList', '#ddAddBtn', '#ddFormBox', '.dd-note']);
            }
            crFit(); el.classList.add('show'); document.body.classList.add('cal-on'); crRender();
            el.querySelectorAll('.cr-side').forEach(x => { x.scrollTop = 0; });
        }
        function closeCalRoom() {
            const el = crq('calRoom'); if (!el || !el.classList.contains('show')) return;
            const fw = crq('atFlipWrap'); if (fw) fw.hidden = true;
            el.classList.remove('show'); document.body.classList.remove('cal-on');
            crGiveBack();
        }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && crOn() && !(crq('atFlipWrap') && !crq('atFlipWrap').hidden) && !document.querySelector('.modal[style*="flex"]')) { if (window.deskGoRoom) deskGoRoom(); else closeCalRoom(); } });   // Esc = 🚪 내 방으로 (문 연출)
        window.openCalRoom = openCalRoom; window.closeCalRoom = closeCalRoom; window.crMove = crMove; window.crToggle = crToggle; window.crPick = crPick;
        window.calRoomUse = () => Math.min(innerWidth, innerHeight) >= 600;      // 💻 📲 만 (📱 폰 = 예전 카페 칸)

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['calroom'] = true;
