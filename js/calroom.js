/* 말랑달콤 다이어리 - js/calroom.js
   📅 달력 (도련 10-31 · 시안 A-2) : 💻 PC · 📲 아이패드에서 '달력' 칸을 누르면 (📱 폰은 예전 카페 칸 그대로)
   - 벽에 건 달력 그림(img/cal-room.webp) 위에 한 달 : 🐾 출석 도장 · 🩸 생리(띠) · 생리 예정(점선 띠) · 📌 D-day(노란 깃발)
   - 오른쪽 : '달력에 보기' 카드(켜고 끄기 · 설정 'diary_cal_show') · 오늘 도장 찍기 · 이번 달 출석 · 다음 생리 예정 · D-day
   - 왼쪽 : 그 밖에 (오늘의 질문 · 오늘의 행운 · 랜덤박스 · 화분)
   - 기록은 원래 기능 그대로 (📅 출석 js/attend.js · 🩷 생리 js/cycle.js · ⏳ D-day js/dday.js) · 고치는 창도 그 창 → 닫으면 달력을 다시 그려요
   - 그림 크기 1672 × 941 를 화면에 맞게 줄여요 (책상처럼) · 달력 칸은 그림 칸 위에 새로 그려요 (6줄 달도 들어가게) */

        const CR_W = 1672, CR_H = 941, CR_GRID = [367, 550, 1305, 865];          // 그림 속 달력 칸 자리 [왼 · 위 · 오른 · 아래]
        const CR_SHOW = 'diary_cal_show', CR_SHOW_L = 'malang_cal_show';
        const CR_ITEMS = [['att', '🐾', '출석 도장'], ['per', '<i class="cr-sw"></i>', '생리'], ['pre', '<i class="cr-sw pre"></i>', '생리 예정'], ['dd', '📌', 'D-day']];
        const CR_WD = ['일', '월', '화', '수', '목', '금', '토'];
        const cr = { y: 0, m: 0, watch: 0 };
        const crq = id => document.getElementById(id);
        const crKey = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const crShow = () => Object.assign({ att: 1, per: 1, pre: 1, dd: 1 }, prefGet(CR_SHOW, CR_SHOW_L) || {});
        const crOn = () => !!crq('calRoom') && crq('calRoom').classList.contains('show');
        const crDays = (a, b) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
        const crDate = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

        function crBuild() {
            let el = crq('calRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'calRoom'; el.className = 'cr-room';
            el.innerHTML = `<div class="cr-stage" id="crStage"><img class="cr-bg" src="img/cal-room.webp?v=20261009-996" alt="" draggable="false">
                <div class="cr-ttl"><button type="button" class="cr-nav" onclick="crMove(-1)" aria-label="지난달">‹</button><span id="crTitle"></span><button type="button" class="cr-nav" onclick="crMove(1)" aria-label="다음 달">›</button></div>
                <div class="cr-grid" id="crGrid"></div>
                <div class="cr-side cr-r">
                    <div class="cr-card cr-show"><div class="cr-h">달력에 보기</div><div id="crShowList"></div></div>
                    <div id="crRight"></div>
                </div>
                <div class="cr-side cr-l" id="crLeft"></div>
                <button type="button" class="cr-x" aria-label="닫기" onclick="closeCalRoom()">✕</button>
            </div>`;
            document.body.appendChild(el);
            addEventListener('resize', () => { if (crOn()) crFit(); });
            return el;
        }
        function crFit() {
            const st = crq('crStage'); if (!st) return;
            const s = Math.min(innerWidth / CR_W, innerHeight / CR_H);
            st.style.transform = `translate(${(innerWidth - CR_W * s) / 2}px, ${(innerHeight - CR_H * s) / 2}px) scale(${s})`;
        }
        function crRender() {
            const y = cr.y, m = cr.m, S = crShow(), T = new Date(), first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
            const at = window.attendInfo ? attendInfo(y, m) : { days: [], streak: 0, today: false };
            const cyI = window.cycleInfo ? cycleInfo() : { per: [], pre: [], next: '', late: 0, has: false };
            const dds = window.ddayList ? ddayList() : [];
            const per = new Set(cyI.per), pre = new Set(cyI.pre), dd = {};
            dds.forEach(x => { if (x && x.d) (dd[x.d] = dd[x.d] || []).push(x); });
            crq('crTitle').innerHTML = `<small>${y}</small>${m + 1}월`;
            const rows = Math.ceil((first + n) / 7), [gl, gt, gr, gb] = CR_GRID, cw = (gr - gl) / 7, hh = 22, rh = (gb - gt - hh) / rows;
            let h = CR_WD.map((w, i) => `<span class="cr-wd${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}" style="left:${i * cw}px;width:${cw}px">${w}</span>`).join('');
            for (let i = 0; i < rows * 7; i++) {
                const d = i - first + 1, c = i % 7, r = Math.floor(i / 7), box = `left:${c * cw}px;top:${hh + r * rh}px;width:${cw}px;height:${rh}px`;
                if (d < 1 || d > n) { h += `<div class="cr-c cr-empty" style="${box}"></div>`; continue; }
                const k = crKey(y, m, d), today = crKey(T.getFullYear(), T.getMonth(), T.getDate()) === k;
                const isP = S.per && per.has(k), isPre = S.pre && pre.has(k) && !per.has(k);
                const prev = crKey(y, m, d - 1), next = crKey(y, m, d + 1);
                const bar = isP ? `<i class="cr-per${!per.has(prev) || c === 0 ? ' s' : ''}${!per.has(next) || c === 6 ? ' e' : ''}"></i>` : isPre ? `<i class="cr-per pre${!pre.has(prev) || c === 0 ? ' s' : ''}${!pre.has(next) || c === 6 ? ' e' : ''}"></i>` : '';
                const flag = S.dd && dd[k] ? `<span class="cr-flag" title="${htmlEsc(dd[k].map(x => x.n).join(' · '))}">${htmlEsc(crDdLabel(k, T))} ${htmlEsc(dd[k][0].n)}${dd[k].length > 1 ? ' +' + (dd[k].length - 1) : ''}</span>` : '';
                const stamp = S.att && at.days.includes(d) && !flag ? '<span class="cr-stamp">🐾</span>' : '';
                h += `<div class="cr-c${c === 0 ? ' sun' : c === 6 ? ' sat' : ''}${today ? ' today' : ''}" style="${box}"><span class="cr-n">${d}</span>${bar}${flag}${stamp}</div>`;
            }
            crq('crGrid').innerHTML = h;
            crq('crShowList').innerHTML = CR_ITEMS.map(([k, ic, nm]) => `<button type="button" class="cr-row${S[k] ? ' on' : ''}" onclick="crToggle('${k}')"><span class="cr-ic">${ic}</span>${nm}<i class="cr-tg"></i></button>`).join('');
            /* 오른쪽 아래 : 오늘 도장 · 이번 달 · 다음 생리 · D-day */
            const thisMonth = y === T.getFullYear() && m === T.getMonth();
            const nx = cyI.next ? crDate(cyI.next) : null, left = nx ? crDays(T, nx) : 0;
            const perTxt = !cyI.has ? '아직 기록이 없어요<br><small>눌러서 생리한 날을 기록해요</small>'
                : cyI.late ? `예정일이 <b>${cyI.late}일</b> 지났어요` : `<b>${nx.getMonth() + 1}월 ${nx.getDate()}일</b> · ${left ? left + '일 남았어요' : '오늘이에요'}`;
            const up = dds.filter(x => x && x.d && crDays(T, crDate(x.d)) >= 0).sort((a, b) => a.d < b.d ? -1 : 1)[0];
            crq('crRight').innerHTML = (at.today ? '<button type="button" class="cr-btn done" onclick="crOpen(\'att\')">✔ 오늘 도장 찍었어요</button>' : '<button type="button" class="cr-btn" onclick="crOpen(\'att\')">🐾 오늘 도장 찍기</button>')
                + `<button type="button" class="cr-card" onclick="crOpen('att')"><div class="cr-h">${thisMonth ? '이번 달' : (m + 1) + '월'}</div>출석 <b>${at.days.length}일</b>${thisMonth && at.streak ? ` · 연속 <b>${at.streak}일</b>` : ''}</button>`
                + `<button type="button" class="cr-card" onclick="crOpen('per')"><div class="cr-h">다음 생리 예정</div>${perTxt}</button>`
                + `<button type="button" class="cr-card" onclick="crOpen('dd')"><div class="cr-h">D-day</div>${up ? `<b>${htmlEsc(crDdLabel(up.d, T))}</b> · ${htmlEsc(up.n)}` : '아직 없어요<br><small>눌러서 D-day를 만들어요</small>'}</button>`;
            crq('crLeft').innerHTML = `<div class="cr-card cr-more"><div class="cr-h">그 밖에</div>`
                + [['💬', '오늘의 질문', 'openQuestion'], ['🍀', '오늘의 행운', 'openLuck'], ['🎁', '랜덤박스', 'openRandomBox'], ['🌷', '화분 키우기', 'openPlant']]
                    .filter(x => typeof window[x[2]] === 'function').map(([ic, nm, fn]) => `<button type="button" class="cr-row" onclick="crOther('${fn}')"><span class="cr-ic">${ic}</span>${nm}<span class="cr-go">›</span></button>`).join('') + '</div>';
        }
        function crDdLabel(k, T) { const n = crDays(T, crDate(k)); return n === 0 ? 'D-day' : n > 0 ? 'D-' + n : 'D+' + -n; }
        function crToggle(k) { const S = crShow(); S[k] = S[k] ? 0 : 1; prefSet(CR_SHOW, CR_SHOW_L, S); crRender(); }
        function crMove(d) { let m = cr.m + d, y = cr.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } cr.y = y; cr.m = m; crRender(); }
        /* 고치는 창 = 원래 기능 창 (달력 위에 떠요) → 닫히면 달력을 다시 그려요 */
        function crOpen(k) {
            const fn = { att: 'openAttend', per: 'openCycle', dd: 'openDday' }[k];
            if (typeof window[fn] !== 'function') return;
            window[fn]();
            clearInterval(cr.watch);
            cr.watch = setInterval(() => { if (!document.querySelector('#attendRoom.show, #cycleRoom.show, #ddayRoom.show')) { clearInterval(cr.watch); if (crOn()) crRender(); } }, 400);
        }
        function crOther(fn) { closeCalRoom(); window[fn](); }                    // 그 밖에 = 달력을 닫고 그 창으로
        function openCalRoom() {
            if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); }
            const el = crBuild(), T = new Date(); cr.y = T.getFullYear(); cr.m = T.getMonth();
            crFit(); crRender(); el.classList.add('show'); document.body.classList.add('cal-on');
        }
        function closeCalRoom() { const el = crq('calRoom'); if (el) el.classList.remove('show'); document.body.classList.remove('cal-on'); clearInterval(cr.watch); }
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && crOn() && !document.querySelector('#attendRoom.show, #cycleRoom.show, #ddayRoom.show, .modal[style*="flex"]')) closeCalRoom(); });
        window.openCalRoom = openCalRoom; window.closeCalRoom = closeCalRoom; window.crMove = crMove; window.crToggle = crToggle; window.crOpen = crOpen; window.crOther = crOther;
        window.calRoomUse = () => Math.min(innerWidth, innerHeight) >= 600;      // 💻 📲 만 (📱 폰 = 예전 카페 칸)

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['calroom'] = true;
