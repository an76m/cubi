/* 말랑달콤 다이어리 - js/settings.js
   PC 백업/불러오기 · PNG 저장 · 용량 확인 · 페이지 · 창 열기/닫기
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        /* 💾 데이터 관리 버튼 글씨 : 로그인 없이(이 브라우저) 쓰는 중이면 그에 맞게 (js/devsave.js) */
        function dmLabels() {
            const L = !!(typeof drive !== 'undefined' && drive.local), set = (id, t) => { const b = document.getElementById(id); if (b && b.textContent !== t) b.textContent = t; };
            set('dmLogoutBtn', L ? '☁ 구글로 이동' : '🚪 로그아웃');   // 🚚 로그인 없이 → 구글 (js/devsave.js dvLogin · 도련 11-09)
            const lb = document.getElementById('dmLogoutBtn'); if (lb) lb.onclick = L ? () => driveLogin() : () => driveLogout();
            const q = document.getElementById('dmQuotaLabel'); if (q) q.innerHTML = L ? '💾 이 브라우저 저장공간 <span style="font-size:11px; color:#999;">(브라우저가 다이어리에 내어 준 칸)</span>' : '☁ 내 구글 저장공간 <span style="font-size:11px; color:#999;">(지메일·구글 포토와 함께 써요)</span>';
        }

        function roundedRectPath(ctx, x, y, w, h, radii) {
            const [tl, tr, br, bl] = radii;
            ctx.beginPath();
            ctx.moveTo(x + tl, y);
            ctx.lineTo(x + w - tr, y);
            ctx.arcTo(x + w, y, x + w, y + tr, tr);
            ctx.lineTo(x + w, y + h - br);
            ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
            ctx.lineTo(x + bl, y + h);
            ctx.arcTo(x, y + h, x, y + h - bl, bl);
            ctx.lineTo(x, y + tl);
            ctx.arcTo(x, y, x + tl, y, tl);
            ctx.closePath();
        }

        function exportToPNG() {
            if (!isCoverOpen) { showMsg('먼저 다이어리를 열어주세요!'); return; }
            if (turn) return;
            if (selectedElement) selectedElement.classList.remove('selected');

            const navButtons = document.querySelectorAll('.page-nav-btn');
            navButtons.forEach(btn => btn.style.visibility = 'hidden');

            const innerPage = document.getElementById('innerPage');
            const prevShadow = innerPage.style.boxShadow;
            innerPage.style.boxShadow = 'none';
            innerPage.classList.add('png-mode');

            const restore = () => {
                innerPage.style.boxShadow = prevShadow;
                innerPage.classList.remove('png-mode');
                navButtons.forEach(btn => btn.style.visibility = 'visible');
                if (selectedElement) selectedElement.classList.add('selected');
            };

            return html2canvas(innerPage, {
                backgroundColor: null,
                useCORS: true,
                scale: 2
            }).then(canvas => {
                const s = canvas.width / innerPage.offsetWidth;
                const out = document.createElement('canvas');
                out.width = canvas.width;
                out.height = canvas.height;
                const ctx = out.getContext('2d');
                roundedRectPath(ctx, 0, 0, out.width, out.height, [15 * s, 22 * s, 22 * s, 15 * s]);
                ctx.clip();
                ctx.drawImage(canvas, 0, 0);

                const link = document.createElement('a');
                link.download = `${getDateKey(currentDate)}.png`;
                link.href = out.toDataURL('image/png');
                link.click();
                restore(); if (window.saveBusy) saveBusy(false);
            }).catch(() => {
                restore(); if (window.saveBusy) saveBusy(false);
                showMsg('⚠ PNG 저장에 실패했습니다.');
            });
        }

        /* 💾 저장 용량 : 내 구글 저장공간 게이지 + 말랑달콤 전체(다이어리 + 인형) 크기 (설정창을 열 때 갱신)
           - 구글 저장공간은 지금 받는 권한(drive.file) 그대로 읽을 수 있어요 (about.storageQuota · 추가 허락 없음)
           - 회사·학교 계정처럼 용량 제한이 없으면 게이지 없이 숫자만 */
        let storageStats = null;   // { days, diaryBytes, dolls, dollBytes, plays, playBytes, quota: { used, limit } | null }
        const fmtBytes = b => !b ? '0KB' : b >= 1073741824 ? (b / 1073741824).toFixed(b >= 107374182400 ? 0 : 1) + 'GB'
            : b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1024)) + 'KB';

        async function folderFileStats(names) {
            const id = await getFolder(names, false);
            if (!id) return { n: 0, bytes: 0 };
            const files = await driveList(`'${id}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,size');
            return { n: files.length, bytes: files.reduce((s, f) => s + (parseInt(f.size, 10) || 0), 0) };
        }
        async function readDriveQuota() {
            try {
                const res = await gfetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota');
                if (!res.ok) return null;
                const q = (await res.json()).storageQuota || {};
                return { used: parseInt(q.usage, 10) || 0, limit: parseInt(q.limit, 10) || 0 };   // limit 0 = 제한 없음
            } catch (e) { return null; }
        }

        async function refreshStorageStats() {
            if (!drive.ready || drive.guest) { storageStats = null; updateStorageInfo(); return; }
            const none = { n: 0, bytes: 0 };
            const dollStats = key => (typeof DOLL_FOLDERS !== 'undefined' && DOLL_FOLDERS[key])
                ? folderFileStats(DOLL_FOLDERS[key]).catch(() => none) : Promise.resolve(none);
            try {
                const [all, quota, dolls, plays] = await Promise.all([driveEnumerateAll(), readDriveQuota(), dollStats('deco'), dollStats('play')]);
                storageStats = {
                    days: all.length, diaryBytes: all.reduce((s, f) => s + f.size, 0),
                    dolls: dolls.n, dollBytes: dolls.bytes, plays: plays.n, playBytes: plays.bytes, quota
                };
            } catch (e) {}
            updateStorageInfo();
        }

        function updateStorageInfo() {
            dmLabels();
            const t = document.getElementById('lsText');
            const d = document.getElementById('lsDetail');
            const gauge = document.getElementById('lsGauge');
            const warn = document.getElementById('lsWarn');
            if (gauge) gauge.style.display = 'none';
            if (warn) warn.style.display = 'none';
            if (storageStats) {
                const S = storageStats, q = S.quota;
                if (q && q.limit > 0) {
                    const pct = Math.min(100, q.used / q.limit * 100);
                    if (gauge) {
                        gauge.style.display = 'block';
                        const bar = gauge.querySelector('.ls-gauge-fill');
                        bar.style.width = Math.max(pct, 1) + '%';
                        bar.className = 'ls-gauge-fill' + (pct >= 90 ? ' full' : pct >= 70 ? ' warn' : '');
                    }
                    if (t) t.innerText = `${fmtBytes(q.used)} / ${fmtBytes(q.limit)} (${pct < 1 ? pct.toFixed(1) : Math.round(pct)}%)`;
                    if (warn && pct >= 90) {
                        warn.style.display = 'block';
                        warn.innerHTML = pct >= 99
                            ? '⚠ 구글 저장공간이 <b>가득 찼어요!</b> 이대로면 일기를 저장할 수 없어요.<br>지메일·구글 포토 등에서 필요 없는 파일을 지워 주세요.'
                            : '⚠ 구글 저장공간이 거의 찼어요. 가득 차면 일기를 저장할 수 없어요.';
                    }
                } else if (t) {
                    t.innerText = q ? `${fmtBytes(q.used)} 사용 중 (용량 제한 없는 계정)` : '구글 저장공간을 읽지 못했어요';
                }
                const mine = S.diaryBytes + S.dollBytes + S.playBytes;
                if (d) d.innerHTML = `└ 그중 <b>다이어리</b> : ${fmtBytes(mine)}<br>`
                    + `<span style="color:#999;">(📔 일기 ${S.days}일치 ${fmtBytes(S.diaryBytes)}` + (S.dolls ? ` · 👧 인형 ${S.dolls}개 ${fmtBytes(S.dollBytes)}` : '')
                    + (S.plays ? ` · 🎭 인형극 ${S.plays}개 ${fmtBytes(S.playBytes)}` : '') + ')</span>';
            } else {
                if (t) t.innerText = drive.guest ? '로그인하면 볼 수 있어요' : drive.ready ? '계산 중…' : '-';
                if (d) d.innerText = '';
            }
            const st = document.getElementById('driveStatusText');
            if (st) st.textContent = drive.guest && typeof LOCAL_TEST !== 'undefined' && LOCAL_TEST ? '💻 로컬 테스트 · 이 브라우저에만 저장 (처음부터 : 주소 뒤에 ?reset)'
                : drive.guest ? '☁ 구글 드라이브에 연결되지 않음 (저장 안 됨)'
                : drive.local ? `💾 로그인 없이 · 이 브라우저에 저장 중 (브라우저 기록을 지우면 사라져요 · 지키려면 ☁ 구글로 이동)`
                : drive.ready ? `☁ 연결됨 · 구글 드라이브에 저장 중 (다이어리 / 2026 분홍 1 / 년-월-일.json)` : '☁ 연결 안 됨';
        }

        /* 🐷 말랑달콤 저금통 : 마음을 넣어 준 사람에게만 보이는 선물 (🎀 마스킹테이프)
           - 선물은 두 가지 : '전체'(저금 확인 때 · 그 종류 전부가 열려요) 와 '디자인 하나하나'(🎁 아이템 주기 · 캡슐 스티커처럼 디자인마다 따로 기간)
             한 디자인의 끝나는 날 = 전체와 그 디자인 중 더 늦은 날
           - 사람들이 만들어 나눈 페이지 · 배경지(카페에서 등록)은 만든 사람의 고운 마음이라 언제나 누구나 써요
           - 화면에서 class="tape-only" 는 🎀 이 하나라도 열린 사람에게만 보여요 (css : body.tape-on)
           - 이미 다이어리에 붙인 테이프는 기간이 끝나도 그대로 둬요 (새로 고르는 것만 막아요)
           - 끝나는 날은 '말랑달콤 사람들' 서버가 접속 신호의 답으로 알려 줘요 → setGift(전체🎀, {테이프id: 날}) (js/presence.js)
             그 날(한국 시간)까지 열려요 · 빈 값이면 닫혀요 · 🐷 저금통 창 : js/piggy.js */
        const GIFT_LOCAL = 'malang_gift';      // 이 기기에 마지막으로 받은 선물 → 다이어리를 열자마자 바로 보여 줘요 (서버 답이 오면 고쳐요)
        let giftBox = { ta: '', tp: {} };      // ta : 🎀 전체 끝나는 날 / tp : 디자인별 끝나는 날
        const giftToday = tzDay;   // 🕘 시계 한 곳 (js/util.js)
        const giftOk = d => !!d && d >= giftToday();
        const giftLeft = d => giftOk(d) ? Math.round((Date.parse(d) - Date.parse(giftToday())) / 864e5) : -1;   // 0 = 오늘이 마지막 날 · 닫혔으면 -1
        const dLabel = n => n < 0 ? '' : n ? 'D-' + n : 'D-day';
        const giftAlive = (all, map) => giftOk(all) || Object.keys(map).some(k => giftOk(map[k]));
        const tapeOn = () => giftAlive(giftBox.ta, giftBox.tp);
        const giftCount = map => Object.keys(map).filter(k => giftOk(map[k])).length;
        function setGift(ta, tp) {
            const day = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '';
            const map = o => { const r = {}; if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (/^[\w-]{1,30}$/.test(k) && day(o[k])) r[k] = o[k]; }); return r; };
            giftBox = { ta: day(ta), tp: map(tp) };
            document.body.classList.toggle('tape-on', tapeOn());
            try { if (tapeOn()) localStorage.setItem(GIFT_LOCAL, JSON.stringify(giftBox)); else localStorage.removeItem(GIFT_LOCAL); } catch (e) {}
            if (typeof pigThanks === 'function') pigThanks();
        }
        const giftRefresh = () => setGift(giftBox.ta, giftBox.tp);      // 기간이 끝난 건 닫기
        /* 🎁 선물 도착 신호(g = { t: { all|이름: [끝나는 날, 늘어남] } })를 지금 가진 것에 합치기 */
        function giftApply(g) {
            let ta = giftBox.ta; const tp = Object.assign({}, giftBox.tp);
            Object.keys(g.t || {}).forEach(k => { const u = g.t[k] && g.t[k][0]; if (k === 'all') ta = u; else tp[k] = u; });
            setGift(ta, tp);
        }
        try { const g = JSON.parse(localStorage.getItem(GIFT_LOCAL) || 'null') || {}; setGift(g.ta, g.tp); } catch (e) {}
        /* ---------- 창 제목 줄 : 왼쪽 ‹ 앞 화면 이름 · 가운데 제목 리본 · 오른쪽 ✕ (닫기) · 모양은 css/dakku.css ----------
           창 아래에 있던 '닫기' · '← …' 버튼은 숨기고, 제목 줄 버튼이 그 버튼을 대신 눌러 줘요. (원래 버튼의 동작 · 막힘 상태를 그대로 따라요)
           나중에 만들어지는 창(배경음악 · 인형 등)도 처음 열 때 똑같이 바꿔요. */
        function mtDecorate(modal) {
            if (!modal || modal.dataset.mt || modal.id === 'customAlertModal') return;
            const box = modal.querySelector('.modal-content'); if (!box) return;
            const title = [...box.children].find(c => c.classList.contains('modal-title')); if (!title) return;
            modal.dataset.mt = '1';
            if (title.classList.contains('mt-bar')) return;                                   // 이미 직접 만든 제목 줄 (카페)
            const btns = [...box.querySelectorAll('button')];
            const closeBtn = btns.filter(b => b.textContent.trim() === '닫기').pop();
            const backBtn = btns.find(b => /^←/.test(b.textContent.trim()));
            const mk = (txt, label, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'mt-btn ' + cls; b.textContent = txt === '<' ? '‹ ' + label.replace(/ 메뉴$/, '') : txt; b.setAttribute('aria-label', label); b.onclick = e => { e.stopPropagation(); fn(); }; return b; };
            const span = document.createElement('span'); span.className = 'mt-text';
            while (title.firstChild) span.appendChild(title.firstChild);
            if (title.id) { span.id = title.id; title.removeAttribute('id'); }
            const back = mk('<', backBtn ? backBtn.textContent.replace('←', '').trim() || '뒤로' : '뒤로', 'mt-back' + (backBtn ? '' : ' mt-none'), () => backBtn && backBtn.click());
            const x = mk('✕', '닫기', 'mt-x', () => closeBtn ? closeBtn.click() : closeModal(modal.id));
            title.classList.add('mt-bar');
            title.append(back, span, x);
            [closeBtn, backBtn].forEach(b => {
                if (!b) return;
                b.classList.add('mt-moved');
                const p = b.parentElement;
                if (p && p !== box && ![...p.children].some(c => !c.classList.contains('mt-moved') && !c.hidden && c.tagName !== 'INPUT')) p.classList.add('mt-moved');
            });
        }
        /* 제목이 ‹ · ✕ 사이에 다 안 들어가면 글씨를 조금씩 줄여 한 줄에 맞춰요 (제목이 바뀔 때도) */
        function mtFit(modal) {
            const t = modal && modal.querySelector('.modal-title.mt-bar .mt-text'); if (!t || !t.offsetWidth) return;
            t.style.fontSize = ''; t.style.paddingLeft = t.style.paddingRight = ''; t.style.whiteSpace = t.style.lineHeight = '';
            const bar = t.parentElement.getBoundingClientRect(), bk = t.parentElement.querySelector('.mt-back:not(.mt-none)'), x = t.parentElement.querySelector('.mt-x');
            const side = Math.max(bk ? bk.getBoundingClientRect().right - bar.left : 0, x ? bar.right - x.getBoundingClientRect().left : 0) + 6;
            t.style.maxWidth = Math.max(60, bar.width - side * 2) + 'px';                 // 가운데 리본이 ‹ · ✕ 와 안 겹치게
            let fs = parseFloat(getComputedStyle(t).fontSize) || 15;
            if (t.scrollWidth > t.clientWidth + 1) t.style.paddingLeft = t.style.paddingRight = '16px';
            while (t.scrollWidth > t.clientWidth + 1 && fs > 12) { fs -= .5; t.style.fontSize = fs + 'px'; }
            if (t.scrollWidth > t.clientWidth + 1) { t.style.whiteSpace = 'normal'; t.style.lineHeight = '1.15'; }   // 그래도 길면 리본 안에서 두 줄로
        }
        document.querySelectorAll('.modal').forEach(mtDecorate);
        function openModal(id) {
            if (id === 'stickerToolModal' && window.openCraft) { openCraft(); return; }   // 🎨 스티커 만들기 = 다꾸 작업실 (js/craft.js · 도련 11-02)
            if (id === 'patMakeModal' && window.openCraft) { openCraft('bg'); return; }    // 🖌️ 배경지 만들기 = 다꾸 작업실 배경지 칸
            if (id === 'settingsModal') { saveData(false); updateStorageInfo(); refreshStorageStats(); if (typeof sndRenderSettings === 'function') sndRenderSettings(); }
            /* ☕ 서버 미리 깨우기는 그 기능을 열 때 그 서버 하나만 (포춘카드 · 오락실 → 명예의 전당 · 건의 보내기) · 랜덤박스 · 편지함은 열자마자 진짜 요청을 보내서 따로 안 깨워요 */
            if (id === 'serviceModal' && typeof wlPrefetch === 'function') wlPrefetch();     // 📱 배경화면 목록 미리 받아 두기 (js/wall.js · 받아 둔 건 한동안 다시 안 받아요)
            if (id === 'serviceModal' && typeof svcShowCats === 'function') svcShowCats();
            const m = document.getElementById(id);
            mtDecorate(m);       // 카페는 늘 카테고리부터
            m.style.display = 'flex';
            mtFit(m);
            const t = m.querySelector('.modal-title.mt-bar .mt-text');
            if (t && !t.dataset.fit) { t.dataset.fit = 1; new MutationObserver(() => mtFit(m)).observe(t, { childList: true, characterData: true, subtree: true }); }
        }
        function closeModal(id) { const m = document.getElementById(id); if (m) m.style.display = 'none'; }
        /* 🪟 창은 늘 하나만 (도련 10-21) : 새 창이 뜨면 먼저 떠 있던 창은 그 창의 ✕ 로 닫아요 (최신 창만 보여요)
           - 알림 · 확인 창(customAlertModal · showMsg)은 그 위에 떠요 (밑의 창을 닫지 않아요)
           - 스티커를 떼는 창(🏷️ 흰 종이 · 🧩 조각 봉투 · 📄 모조지 · 🧻 떡메)도 새 창이 뜨면 닫아요
           - 옛 창의 ✕ 가 다른 창을 다시 띄우면(스티커 창으로 돌아가기 등) 0.35초 안에 뜬 그 창은 바로 접어요 → 새 창이 그대로 맨 위
           - 🗄️ 문구함은 스티커를 붙일 때만 써서 ✨ 스티커 창(스티커 · 고르는 창 · 메모지 · 떡메 · 속지)하고만 같이 떠요 (도련 10-21)
             그 밖의 창(📒 다이어리 · ⚙ 설정 · 카페 …)이 뜨면 문구함도 닫히고 · 문구함을 열면 그 밖의 창은 닫혀요
           - 가장 나중에 뜬 창이 맨 위 (z 1001) */
        (function winOne() {
            const KEEP = new Set(['customAlertModal']), CAB = 'gdCabModal';
            const STK = new Set(['basketModal', 'basketKindModal', 'shelfKindModal']);   // 문구함과 같이 뜨는 스티커 창 (🧺 바구니 · 🏪 기본상품 샵 · 10-25)
            const pair = (a, b) => (a === CAB && STK.has(b)) || (b === CAB && STK.has(a));
            const ROOMS = [['pelRoom', 'closeStickerPeel'], ['pcbRoom', 'closePieceBag'], ['pmRoom', 'closePaperSheet'], ['tkRoom', 'closeTteokRoom']];
            const vis = m => m.style.display === 'flex' || m.style.display === 'block';
            const seen = new WeakMap(); let busy = false, last = null, lastAt = 0;
            function shut(m) {
                const x = m.querySelector('.modal-title .mt-x'), c = [...m.querySelectorAll('.modal-content button')].filter(b => b.textContent.trim() === '닫기').pop();
                try { (x || c) ? (x || c).click() : null; } catch (e) {}
                if (vis(m)) m.style.display = 'none';
            }
            function opened(m) {
                if (busy || KEEP.has(m.id)) return;
                document.querySelectorAll('.modal').forEach(o => { if (o !== m && o.style.zIndex === '1001') o.style.zIndex = ''; }); m.style.zIndex = '1001';   // 나중에 뜬 창이 위
                if (last && last !== m && vis(last) && performance.now() - lastAt < 350) { m.style.display = 'none'; return; }   // 옛 창을 닫다가 다시 뜬 창
                busy = true; last = m; lastAt = performance.now();
                try {
                    const trial = document.documentElement.classList.contains('dk-trial');   // 🏪 적용해보기 기능 창 = 숨은 샵 창은 그대로 (닫으면 샵으로 돌아가요)
                    document.querySelectorAll('.modal').forEach(o => { if (o !== m && !KEEP.has(o.id) && !pair(m.id, o.id) && vis(o) && !(trial && /^shelf/.test(o.id))) shut(o); });
                    if (m.id !== CAB) ROOMS.forEach(([id, fn]) => { const r = document.getElementById(id); if (r && r.classList.contains('show') && typeof window[fn] === 'function') window[fn](); });
                } finally { busy = false; }
            }
            function watch(m) {
                if (seen.has(m)) return; seen.set(m, vis(m));
                new MutationObserver(() => { const v = vis(m), was = seen.get(m); seen.set(m, v); if (v && !was) opened(m); }).observe(m, { attributes: true, attributeFilter: ['style'] });
            }
            document.querySelectorAll('.modal').forEach(watch);
            /* 🔁 하단 메뉴 다이어리 · 스티커 · 문구함 : 그 창이 떠 있을 때 다시 누르면 닫혀요 (⚙ 설정처럼 · 도련 10-22) */
            const TOG = { 'tb-skin': ['skinModal'], 'tb-sticker': ['basketModal', 'basketKindModal', 'shelfKindModal'], 'tb-gd': ['gdCabModal'], 'tb-move': ['moveModal'] };   // ✨ 스티커 = 스티커 창 바로 (도련 10-26 · 스티커 창 없앰)
            document.addEventListener('click', e => {
                const b = e.target.closest && e.target.closest('.toolbar .tb-btn'); if (!b) return;
                const k = Object.keys(TOG).find(c => b.classList.contains(c)); if (!k) return;
                const m = TOG[k].map(id => document.getElementById(id)).find(x => x && vis(x)); if (!m) return;
                e.preventDefault(); e.stopPropagation(); shut(m);
            }, true);
            new MutationObserver(ms => ms.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (n.classList.contains('modal')) watch(n); if (n.querySelectorAll) n.querySelectorAll('.modal').forEach(watch); }))).observe(document.body, { childList: true, subtree: true });
        })();
        /* ⚙️ 설정 창 칸 : 📖 다이어리 · ✋ 도구 · 🔊 소리·글꼴 · 💾 저장 (다시 열면 마지막에 본 칸) */
        function stSet(k) {
            document.querySelectorAll('#stTabs .stk-tab').forEach(b => b.classList.toggle('on', b.dataset.st === k));
            document.querySelectorAll('#settingsModal .st-pane').forEach(p => p.classList.toggle('on', p.dataset.st === k));
            const box = document.querySelector('#settingsModal .modal-content'); if (box) box.scrollTop = 0;
        }
        /* 창 밖(배경 · 페이지)을 누르면 닫혀요 : 그 창의 ✕ 를 눌러 준 것과 같아요 (창마다 닫을 때 하는 일을 그대로)
           - 알림 · 확인 창은 대답해야 해서 안 닫혀요 · 🎀 페이지꾸미기 창은 창 밖에서 다이어리를 꾸며야 해서 그대로 (창 밖이 눌려요) */
        let mdDown = null;
        document.addEventListener('pointerdown', e => { mdDown = e.target; }, true);
        document.addEventListener('click', e => {
            const m = e.target;
            if (!m.classList || !m.classList.contains('modal') || mdDown !== m || m.id === 'customAlertModal') return;
            if (window.dkDrawerOwns && dkDrawerOwns(m)) { if (!(window.deskTapAt && deskTapAt(e.clientX, e.clientY))) dkDrawerShut(true); return; }   // 🗄 서랍에서 내려온 창 밖 = 그 자리 책상 톡 (같은 서랍 = 창이 올라가며 서랍 닫힘 · 다른 서랍 = 그 서랍) · 빈 곳 = 서랍 닫듯이 (도련 11-08)
            const x = m.querySelector('.mt-x'); if (x) x.click(); else closeModal(m.id);
        });

        /* ▤ 하단 메뉴 모드 (💻 📲 📱 · html 에 desk-on 이 없을 때) : 떠 있는 창(뒤 페이지가 눌리는 창 · 스티커 · 다이어리 · 문구함 · 서랍 …) 도 창 밖을 톡 = 닫기 (도련 11-09 폰 · 11-10 💻 📲 하단 메뉴도 · 🪑 책상 모드는 그대로)
           닫기만 하고 뒤의 버튼 · 페이지는 안 눌려요 · 아래 메뉴줄 · 떼는 화면 · 꺼낸 종이 · 페이지꾸미기 창(skin-float)은 빼요 */
        let mdEat = 0;
        document.addEventListener('pointerdown', e => {
            if (UI.desk()) return;   // 🪑 책상 모드 = 창 밖 = 책상 (그대로)
            const t = e.target; if (!t || !t.closest || t.closest('.modal, .toolbar, #pelRoom, #pcbRoom, #pmRoom, .dsk')) return;
            const open = [...document.querySelectorAll('.modal')].filter(m => m.id !== 'customAlertModal' && !m.classList.contains('skin-float') && getComputedStyle(m).display !== 'none' && getComputedStyle(m).pointerEvents === 'none');
            if (!open.length) return;
            open.forEach(m => { const x = m.querySelector('.mt-x, .gdc-x, .win-x'); if (x) x.click(); else closeModal(m.id); });
            e.preventDefault(); e.stopPropagation(); mdEat = Date.now();
        }, true);
        ['pointerup', 'click'].forEach(ev => document.addEventListener(ev, e => { if (mdEat && Date.now() - mdEat < 700) { e.preventDefault(); e.stopPropagation(); if (ev === 'click') mdEat = 0; } }, true));

        /* ---------- ⚙ 설정 메뉴 : ⚙️ 설정 · 💌 건의함 · 🔒 잠금 · 📲 앱 설치 ---------- */
        function openSettingsMenu() { openModal('settingsMenuModal'); }
        function openFromSettingsMenu(id) {
            closeModal('settingsMenuModal');
            if (id === 'feedbackModal') { openFeedback(); return; }
            openModal(id);
        }
        function backToSettingsMenu(fromId) {
            closeModal(fromId);
            openModal('settingsMenuModal');
        }


        /* 🧹 브라우저 지우기 목록 (도련 11-06 · 11-09 목록에서 골라서 지우기) : ⚙ 설정 → 💾 저장 → 🗑 휴지통 옆
           - 누르면 이 기기 브라우저에 남은 것을 종류별 목록으로 보여 줘요 → 고른 것만 지우고 새로고침
           - 안전한 것(다시 받아 오는 것)은 처음부터 골라져 있고, ⚠ 되살릴 수 없는 것은 처음엔 안 골라져 있어요
           - ☁ 구글 드라이브의 파일은 그대로예요 (지우지 않아요)
           - 지우기 전에 아직 못 올린 것을 먼저 올려요 · ⚠ 칸을 골랐으면 한 번 더 물어요 */
        const BC_LOGIN = ['gdrive_authed', 'malang_dev_mode'];
        const BC_PEND = ['malang_arrive', 'malang_arrive_n', 'malang_own_pend'];
        function bcLsKind(k) {
            if (k.startsWith('gdrive_pending_backup') || BC_PEND.includes(k)) return 'pend';
            if (BC_LOGIN.includes(k)) return 'login';
            if (k === 'malang_diag_q') return 'diag';
            if (k.startsWith('diary_')) return 'guest';
            return 'pref';
        }
        const bcWait = (p, ms) => Promise.race([Promise.resolve(p).catch(() => {}), new Promise(r => setTimeout(r, ms || 3000))]);
        function bcIdb(name, fn, mode) {                                          // 있는 DB 만 열어요 (없는 이름을 열면 빈 DB 가 생겨서)
            return bcWait(new Promise(ok => {
                let made = false, q;
                try { q = indexedDB.open(name); } catch (e) { ok(null); return; }
                q.onupgradeneeded = () => { made = true; };
                q.onerror = q.onblocked = () => ok(null);
                q.onsuccess = async () => {
                    const db = q.result;
                    if (made) { db.close(); try { indexedDB.deleteDatabase(name); } catch (e) {} ok(null); return; }
                    let r = null; try { r = await fn(db); } catch (e) {}
                    db.close(); ok(r);
                };
            }), 4000);
        }
        const bcTx = (db, st, mode, fn) => new Promise(ok => {
            if (!db.objectStoreNames.contains(st)) { ok(0); return; }
            const t = db.transaction(st, mode), q = fn(t.objectStore(st));
            t.oncomplete = () => ok(q && q.result); t.onerror = t.onabort = () => ok(0);
        });
        const bcCount = (db, st) => bcTx(db, st, 'readonly', o => o.count());
        async function bcScan() {
            const G = {};
            const add = (id, n, sz) => { const g = G[id] || (G[id] = { n: 0, sz: 0 }); g.n += n || 0; g.sz += sz || 0; };
            try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) add(bcLsKind(k), 1, (k.length + (localStorage.getItem(k) || '').length) * 2); } } catch (e) {}
            try { if (sessionStorage.length) add('login', sessionStorage.length, 0); } catch (e) {}
            let names = ['mallang-coll', 'mallang-pending', 'malang-device', 'malang-localtest'];
            try { if (indexedDB.databases) { const L = await bcWait(indexedDB.databases(), 2000); if (Array.isArray(L)) names = [...new Set(names.concat(L.map(d => d.name).filter(Boolean)))]; } } catch (e) {}
            G.dbs = names;
            for (const n of names) {
                if (n === 'mallang-coll') await bcIdb(n, async db => { add('cache', (await bcCount(db, 'orig')) + (await bcCount(db, 'list'))); add('pend', await bcCount(db, 'outbox')); add('gcoll', await bcCount(db, 'local')); });
                else if (n === 'mallang-pending') await bcIdb(n, async db => { for (const st of db.objectStoreNames) add('pend', await bcCount(db, st)); });
                else if (n === 'malang-device') await bcIdb(n, async db => { add('dev', await bcCount(db, 'vmeta')); });
                else add('etc', 1);
            }
            try { if (window.caches) add('app', (await caches.keys()).length); } catch (e) {}
            try { if (navigator.serviceWorker) { const S = await bcWait(navigator.serviceWorker.getRegistrations(), 2000); if (Array.isArray(S)) add('app', S.length); } } catch (e) {}
            try { if (navigator.storage && navigator.storage.getDirectory) { const R = await navigator.storage.getDirectory(); let c = 0; for await (const x of R.keys()) c++; if (c) add('etc', c); } } catch (e) {}
            return G;
        }
        const BC_KINDS = [
            { id: 'cache', ic: '🖼', t: '읽어 둔 스티커 · 그림 · 목록', s: '드라이브에서 다시 읽어 와요', on: 1 },
            { id: 'app', ic: '📦', t: '앱 파일 · 업데이트 장치', s: '다음에 열 때 앱을 새로 받아요', on: 1 },
            { id: 'pref', ic: '⚙', t: '이 기기 설정 · 화면 기억', s: '자리 · 보기 방식 같은 이 기기 기억 (드라이브 설정은 그대로)', on: 1 },
            { id: 'login', ic: '🔑', t: '로그인 · 저장 방식 기억', s: '처음 화면에서 구글 · 로그인 없이를 다시 골라요', on: 1 },
            { id: 'diag', ic: '🧾', t: '아직 안 올린 문제 기록', s: '', on: 1 },
            { id: 'etc', ic: '🧪', t: '그 밖의 브라우저 저장', s: '시험용 · 예전 저장 칸', on: 1 },
            { id: 'pend', ic: '⏳', t: '아직 드라이브에 못 올린 것', s: '지우면 그 바뀐 내용 · 도착 알림이 사라져요', warn: 1 },
            { id: 'dev', ic: '🏠', t: '로그인 없이 쓴 다이어리', s: '이 브라우저에 저장한 일기 · 스티커 전부예요', warn: 1 },
            { id: 'guest', ic: '👤', t: '게스트로 쓴 일기 · 설정', s: '', warn: 1 },
            { id: 'gcoll', ic: '👤', t: '게스트로 만든 스티커 · 페이지', s: '', warn: 1 }
        ];
        const BC_SEL = {};
        function bcToggle(el) { const id = el.dataset.k; BC_SEL[id] = !BC_SEL[id]; el.classList.toggle('on', BC_SEL[id]); el.setAttribute('aria-checked', BC_SEL[id] ? 'true' : 'false'); }
        window.bcToggle = bcToggle;
        /* ⏳ 진행 창 (도련 11-11 : 누르고 나서 되는 건지 알 수 없어요 → 무엇을 하는지 · 몇 번째 · 막대 · 닫지 마세요) : 화면 전체를 덮어 다른 걸 못 눌러요 */
        const BCP = { el: null, leave: e => { e.preventDefault(); e.returnValue = ''; } };
        function bcProg(title, text, i, n) {
            let el = BCP.el;
            if (!el) {
                el = BCP.el = document.createElement('div'); el.className = 'bc-prog'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-live', 'polite');
                el.innerHTML = '<div class="bc-pcard"><b class="bc-ptt"></b><p class="bc-ptx"></p><div class="bc-pbar"><i></i></div><small class="bc-pn"></small><small class="bc-pwarn">⚠ 끝날 때까지 창을 닫거나 새로고침하지 마세요</small></div>';
                document.body.appendChild(el); addEventListener('beforeunload', BCP.leave);
            }
            el.querySelector('.bc-ptt').textContent = title; el.querySelector('.bc-ptx').textContent = text || '';
            const bar = el.querySelector('.bc-pbar'), done = n ? Math.min(1, (i + (i < n ? .5 : 0)) / n) : 0;   // 하고 있는 단계는 반만큼 채워 보여요
            bar.classList.toggle('wait', !n); bar.firstChild.style.width = n ? Math.round(done * 100) + '%' : '';
            el.querySelector('.bc-pn').textContent = n ? `${Math.min(i + 1, n)} / ${n} 단계` : '';
        }
        function bcProgOff() { if (BCP.el) { BCP.el.remove(); BCP.el = null; } removeEventListener('beforeunload', BCP.leave); }
        async function clearBrowserStore() {
            bcProg('🧹 살펴보는 중', '이 브라우저에 남은 것을 세고 있어요');
            let G; try { G = await bcScan(); } finally { bcProgOff(); }
            const kinds = BC_KINDS.filter(k => G[k.id] && G[k.id].n);
            if (!kinds.length) { showMsg('🧹 이 기기 브라우저에 지울 것이 없어요.'); return; }
            Object.keys(BC_SEL).forEach(k => delete BC_SEL[k]);
            const kb = n => n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : n >= 1024 ? Math.round(n / 1024) + 'KB' : '';
            const row = k => { BC_SEL[k.id] = !!k.on; const g = G[k.id], sz = kb(g.sz); return `<div class="bc-row${k.on ? ' on' : ''}${k.warn ? ' warn' : ''}" data-k="${k.id}" role="checkbox" aria-checked="${k.on ? 'true' : 'false'}" tabindex="0" onclick="bcToggle(this)"><i class="bc-box"></i><span class="bc-ic">${k.ic}</span><span class="bc-t"><b>${k.t}</b> <small>${g.n}개${sz ? ' · ' + sz : ''}</small>${k.s ? `<em>${k.s}</em>` : ''}</span></div>`; };
            const safe = kinds.filter(k => !k.warn), warn = kinds.filter(k => k.warn);
            const ok = await showAsk(`🧹 <b>이 기기 브라우저에 남은 것</b><br><small style="color:#888">지울 것을 골라 주세요 · ☁ 구글 드라이브의 파일은 그대로예요</small>
                <div class="bc-list">${safe.map(row).join('')}${warn.length ? `<div class="bc-sep">⚠ 지우면 되살릴 수 없어요</div>${warn.map(row).join('')}` : ''}</div>`, '고른 것 지우기', '취소');
            if (!ok) return;
            const sel = kinds.filter(k => BC_SEL[k.id]);
            if (!sel.length) { showMsg('고른 것이 없어서 지우지 않았어요.'); return; }
            const S = id => !!BC_SEL[id] && !!(G[id] && G[id].n);
            try { if (typeof drive !== 'undefined' && drive.ready && !drive.guest && drive.dirty && typeof flushUpload === 'function') { bcProg('☁ 드라이브에 먼저 올리는 중', '바뀐 내용을 잃지 않게 올리고 지워요 (최대 15초)'); await Promise.race([flushUpload(), new Promise(r => setTimeout(r, 15000))]); } } catch (e) {} finally { bcProgOff(); }
            const bad = sel.filter(k => k.warn);
            if (bad.length && !await showAsk(`⚠ 아래 것은 지우면 <b>되살릴 수 없어요</b>.<br><br>${bad.map(k => k.ic + ' ' + k.t).join('<br>')}<br><br>그래도 지울까요?`, '지우기', '취소')) return;
            if (!S('pend') && typeof drive !== 'undefined' && drive.dirty && !await showMsg('⚠ 아직 드라이브에 올리지 못한 것이 있어요.<br>새로고침하면 다음에 다시 올려요. 계속할까요?', true)) return;
            const delDb = n => bcWait(new Promise(r => { const q = indexedDB.deleteDatabase(n); q.onsuccess = q.onerror = q.onblocked = () => r(); }), 3000);
            const clr = (db, sts) => Promise.all(sts.map(st => bcTx(db, st, 'readwrite', o => o.clear())));
            const T = [];                                                         // [보여 줄 글, 할 일] 차례로
            T.push(['⚙ 이 기기 기억 지우는 중', () => { try { const K = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && S(bcLsKind(k))) K.push(k); } K.forEach(k => localStorage.removeItem(k)); } catch (e) {} if (S('login')) try { sessionStorage.clear(); } catch (e) {} }]);
            const DBN = { 'mallang-coll': '🖼 읽어 둔 스티커 · 그림 · 목록', 'mallang-pending': '⏳ 못 올린 것', 'malang-device': '🏠 로그인 없이 쓴 다이어리' };
            for (const n of G.dbs) {
                if (n === 'mallang-coll') {
                    const sts = [].concat(S('cache') ? ['orig', 'list'] : [], S('pend') ? ['outbox'] : [], S('gcoll') ? ['local'] : []);
                    if (sts.length) T.push([DBN[n] + ' 지우는 중', () => sts.length === 4 ? delDb(n) : bcIdb(n, db => clr(db, sts))]);
                } else if (n === 'mallang-pending') { if (S('pend')) T.push([DBN[n] + ' 지우는 중', () => delDb(n)]); }
                else if (n === 'malang-device') { if (S('dev')) T.push([DBN[n] + ' 지우는 중', () => delDb(n)]); }
                else if (S('etc')) T.push(['🧪 그 밖의 브라우저 저장 지우는 중', () => delDb(n)]);
            }
            if (S('app')) T.push(['📦 앱 파일 · 업데이트 장치 지우는 중', async () => {
                try { if (window.caches) { const K = await caches.keys(); await Promise.all(K.map(k => bcWait(caches.delete(k)))); } } catch (e) {}
                try { if (navigator.serviceWorker) { const R = await bcWait(navigator.serviceWorker.getRegistrations(), 2000); if (Array.isArray(R)) await Promise.all(R.map(r => bcWait(r.unregister()))); } } catch (e) {}
            }]);
            if (S('etc')) T.push(['🧪 그 밖의 브라우저 파일 지우는 중', async () => { try { if (navigator.storage && navigator.storage.getDirectory) { const R = await navigator.storage.getDirectory(); for await (const [n] of R.entries()) await bcWait(R.removeEntry(n, { recursive: true })); } } catch (e) {} }]);
            for (let i = 0; i < T.length; i++) { bcProg('🧹 지우는 중', T[i][0], i, T.length); try { await T[i][1](); } catch (e) {} await new Promise(r => setTimeout(r, 120)); }   // 너무 빨라도 무엇을 했는지 보이게 잠깐
            bcProg('✅ 다 지웠어요', '앱을 새로 여는 중이에요', T.length, T.length);
            await new Promise(r => setTimeout(r, 700));
            removeEventListener('beforeunload', BCP.leave);                      // 새로 열 때는 묻지 않아요
            location.reload();
        }
        window.clearBrowserStore = clearBrowserStore;
        /* 🧾 문제 기록 보기 (도련 11-06) : 말랑달콤 / 설정 / _기록.json + 이 창에서 아직 안 올린 것 · 새것부터 · 📋 복사 = Claude 에게 붙여 넣기 */
        const DIAG_TXT = { start: '▶ 앱 시작', mkdir: '📁 폴더 만듦', dup: '📁📁 같은 이름 폴더가 여러 개', merge: '📁 폴더 합침 → 빈 폴더 휴지통', mergeFail: '⚠ 폴더 합치기 멈춤', trash: '🗑 휴지통으로', kill: '🔥 완전 삭제 (다 쓴 종이)', twrite: '⚠ 휴지통 파일에 쓰려다 새로 만듦', stale: '⚠ 기억한 파일이 휴지통에 있음', gone: '⚠ 폴더가 없어져서 다시 찾음', root: '🗑 말랑달콤 폴더가 지워진 걸 알아챔', rescue: '🛟 목록 되살림', rescueWait: '⏳ 목록이 없지만 방금 받은 종이라 기다림', noList: '📄 목록 없음 → 빈 목록', shrink: '⚠ 목록이 한꺼번에 줄었음' };
        let diagLast = '';
        async function openDiag() {
            if (!window.diagRead) { showMsg('기록 장치를 불러오지 못했어요.'); return; }
            const all = await diagRead(); diagLast = JSON.stringify(all.slice(-400));
            const esc = htmlEsc;   // 🧰 js/util.js
            const when = t => { const d = new Date(t); return isNaN(d) ? '' : d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
            const rest = r => Object.entries(r).filter(([k]) => !['t', 'd', 'v', 'e', 'who'].includes(k)).map(([k, v]) => `${k}=${v}`).join(' ');
            const rows = all.slice(-150).reverse().map(r => `<div style="padding:4px 0;border-bottom:1px dashed #f1d3dd"><b>${esc(DIAG_TXT[r.e] || r.e)}</b> <small style="color:#999">${esc(when(r.t))} · 기기 ${esc(r.d)} · v${esc(r.v)}</small><br><small style="color:#777;word-break:break-all">${esc(rest(r))}${r.who ? ' · ' + esc(r.who) : ''}</small></div>`).join('');
            showMsg(`🧾 <b>문제 기록</b> <small style="color:#999">(최근 ${Math.min(150, all.length)}줄 · 모두 ${all.length}줄)</small>
                <div style="max-height:46vh;overflow:auto;text-align:left;font-size:12px;margin:8px 0;padding:0 4px">${rows || '<p style="color:#999">아직 기록이 없어요.</p>'}</div>
                <button type="button" class="btn" onclick="diagCopy(this)">📋 기록 복사 (Claude 에게 붙여 넣기)</button>`);
        }
        async function diagCopy(b) { try { await navigator.clipboard.writeText(diagLast); if (b) b.textContent = '✅ 복사했어요'; } catch (e) { if (b) b.textContent = '⚠ 복사하지 못했어요'; } }
        window.openDiag = openDiag; window.diagCopy = diagCopy;


/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['settings'] = true;
