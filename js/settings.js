/* 말랑달콤 다이어리 - js/settings.js
   PC 백업/불러오기 · PNG 저장 · 용량 확인 · 페이지 · 창 열기/닫기
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        /* 💾 데이터 관리 버튼 글씨 : 📁 이 기기 폴더로 쓰는 중이면 그에 맞게 (js/devsave.js) */
        function dmLabels() {
            const L = !!(typeof drive !== 'undefined' && drive.local), set = (id, t) => { const b = document.getElementById(id); if (b && b.textContent !== t) b.textContent = t; };
            const D = L && window.dvIsDir && dvIsDir();
            set('dmReloadBtn', D ? '📁 폴더 바꾸기' : L ? '🔄 폴더에서 다시 불러오기' : '🔄 드라이브에서 다시 불러오기');
            const rb = document.getElementById('dmReloadBtn'); if (rb) rb.onclick = D ? () => dvChangeFolder() : () => reloadFromDrive();
            set('dmLogoutBtn', L ? '☁ 구글로 로그인' : '🚪 로그아웃');
            const lb = document.getElementById('dmLogoutBtn'); if (lb) lb.onclick = L ? () => driveLogin() : () => driveLogout();
            const q = document.getElementById('dmQuotaLabel'); if (q) q.innerHTML = L ? '📁 이 기기 저장공간 <span style="font-size:11px; color:#999;">(브라우저가 다이어리에 내어 준 칸)</span>' : '☁ 내 구글 저장공간 <span style="font-size:11px; color:#999;">(지메일·구글 포토와 함께 써요)</span>';
        }
        /* 💾 백업 · 불러오기 : 구글 로그인이든 📁 이 기기 폴더든 zip 하나 (js/backup.js) */
        function exportJSON() { bkBackup(); }
        function triggerImportJSON() { bkRestore(); }

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
                : drive.local ? `📁 로그인 없이 · ${dvWhere()}에 저장 중 (날짜형바인더 / 2026 분홍 1 / 년-월-일.json)`
                : drive.ready ? `☁ 연결됨 · 구글 드라이브에 저장 중 (날짜형바인더 / 2026 분홍 1 / 년-월-일.json)` : '☁ 연결 안 됨';
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
        const giftToday = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
        const giftOk = d => !!d && d >= giftToday();
        const giftLeft = d => giftOk(d) ? Math.round((Date.parse(d) - Date.parse(giftToday())) / 864e5) : -1;   // 0 = 오늘이 마지막 날 · 닫혔으면 -1
        const dLabel = n => n < 0 ? '' : n ? 'D-' + n : 'D-day';
        const giftEnd = (all, one) => [all, one].filter(giftOk).sort().pop() || '';      // 전체와 디자인 하나 중 더 늦은 날 · 없으면 ''
        const tapeUntil = id => giftEnd(giftBox.ta, giftBox.tp[id]);
        const tapeHas = id => !!tapeUntil(id);
        const tapeLeft = id => giftLeft(tapeUntil(id));
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
            const STK = new Set(['basketModal', 'basketKindModal', 'shelfModal', 'shelfKindModal']);   // 문구함과 같이 뜨는 스티커 창 (🧺 바구니 · 🏪 기본상품 샵 · 10-25)
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
                    document.querySelectorAll('.modal').forEach(o => { if (o !== m && !KEEP.has(o.id) && !pair(m.id, o.id) && vis(o)) shut(o); });
                    if (m.id !== CAB) ROOMS.forEach(([id, fn]) => { const r = document.getElementById(id); if (r && r.classList.contains('show') && typeof window[fn] === 'function') window[fn](); });
                } finally { busy = false; }
            }
            function watch(m) {
                if (seen.has(m)) return; seen.set(m, vis(m));
                new MutationObserver(() => { const v = vis(m), was = seen.get(m); seen.set(m, v); if (v && !was) opened(m); }).observe(m, { attributes: true, attributeFilter: ['style'] });
            }
            document.querySelectorAll('.modal').forEach(watch);
            document.addEventListener('click', e => {                           // ☕ 카페 마을은 창(.modal)이 아니라서 떠 있던 창(문구함 포함)을 직접 닫아요
                if (!e.target.closest || !e.target.closest('.toolbar .tb-cafe')) return;
                document.querySelectorAll('.modal').forEach(o => { if (!KEEP.has(o.id) && vis(o)) shut(o); });
                ROOMS.forEach(([id, fn]) => { const r = document.getElementById(id); if (r && r.classList.contains('show') && typeof window[fn] === 'function') window[fn](); });   // 🚪 스티커 떼는 창도
            }, true);
            /* ☕ 카페에 있는 동안은 손에 든 문구(핀셋 · 가위 · 칼 · 필기구 …)를 숨겨요 → 카페 창이 다 닫히면 다시 (도련 10-21 · css body.cafe-on)
               - 카페에서 연 창(배경화면 · 포춘카드 …)도 카페 · 다른 하단 메뉴를 누르면 카페 끝 */
            /* 🔁 하단 메뉴 다이어리 · 스티커 · 문구함 : 그 창이 떠 있을 때 다시 누르면 닫혀요 (⚙ 설정처럼 · 도련 10-22) */
            const TOG = { 'tb-skin': ['skinModal'], 'tb-sticker': ['basketModal', 'basketKindModal', 'shelfModal', 'shelfKindModal'], 'tb-gd': ['gdCabModal'] };   // ✨ 스티커 = 스티커 창 바로 (도련 10-26 · 스티커 창 없앰)
            document.addEventListener('click', e => {
                const b = e.target.closest && e.target.closest('.toolbar .tb-btn'); if (!b) return;
                const k = Object.keys(TOG).find(c => b.classList.contains(c)); if (!k) return;
                const m = TOG[k].map(id => document.getElementById(id)).find(x => x && vis(x)); if (!m) return;
                e.preventDefault(); e.stopPropagation(); shut(m);
            }, true);
            let cafeT = 0;
            const cafeOff = () => { clearInterval(cafeT); cafeT = 0; document.body.classList.remove('cafe-on'); };
            const cafeUp = () => { const t = document.getElementById('cafeTown'); return (t && t.style.display !== 'none' && t.getClientRects().length > 0) || [...document.querySelectorAll('.modal')].some(o => !KEEP.has(o.id) && vis(o)); };
            document.addEventListener('click', e => {
                const b = e.target.closest && e.target.closest('.toolbar .tb-btn'); if (!b) return;
                if (!b.classList.contains('tb-cafe')) { cafeOff(); return; }
                document.body.classList.add('cafe-on'); clearInterval(cafeT);
                let seenUp = false;
                cafeT = setInterval(() => { const up = cafeUp(); if (up) seenUp = true; else if (seenUp) cafeOff(); }, 250);
                setTimeout(() => { if (cafeT && !seenUp && !cafeUp()) cafeOff(); }, 2000);   // 카페가 안 열렸으면 (다이어리를 아직 안 열었을 때 등)
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
            const x = m.querySelector('.mt-x'); if (x) x.click(); else closeModal(m.id);
        });

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


        /* 🧹 브라우저 저장 지우기 (도련 11-06 · 시험할 때 남은 기억이 방해돼서) : ⚙ 설정 → 💾 데이터 관리 → 🗑 휴지통 옆
           - 이 기기 브라우저에 남은 것만 지워요 : localStorage · sessionStorage · IndexedDB 전부 · 캐시(Cache Storage) · OPFS · 서비스워커 → 새로고침
           - ☁ 구글 드라이브 · 📁 내 폴더의 파일은 그대로예요 (지우지 않아요)
           - 지우기 전에 아직 못 올린 것을 먼저 올려요 (mallang-pending 도 지워지니까) · 못 올렸으면 한 번 더 물어요
           - 📁 폴더 저장은 폴더를 다시 골라야 해요 (폴더 열쇠 = malang-device) · 로그인도 다시 */
        async function clearBrowserStore() {
            if (!await showMsg('🧹 <b>이 기기 브라우저에 남은 기억</b>을 모두 지울까요?<br><span style="font-size:12px;color:#777;">☁ 구글 드라이브 · 📁 내 폴더의 파일은 그대로예요.<br>지운 뒤 새로고침되고, 로그인 · 폴더 고르기를 다시 해요.</span>', true)) return;
            try { if (typeof drive !== 'undefined' && drive.ready && !drive.guest && drive.dirty && typeof flushUpload === 'function') await Promise.race([flushUpload(), new Promise(r => setTimeout(r, 15000))]); } catch (e) {}
            if (typeof drive !== 'undefined' && drive.dirty && !await showMsg('⚠ 아직 드라이브에 올리지 못한 것이 있어요.<br>지우면 그 바뀐 내용은 사라져요. 그래도 지울까요?', true)) return;
            const wait = (p, ms) => Promise.race([Promise.resolve(p).catch(() => {}), new Promise(r => setTimeout(r, ms || 3000))]);
            try { localStorage.clear(); } catch (e) {}
            try { sessionStorage.clear(); } catch (e) {}
            try {
                let names = ['mallang-coll', 'mallang-pending', 'malang-device', 'malang-localtest'];
                if (indexedDB.databases) { const L = await wait(indexedDB.databases(), 2000); if (Array.isArray(L)) names = names.concat(L.map(d => d.name).filter(Boolean)); }
                await Promise.all([...new Set(names)].map(n => wait(new Promise(r => { const q = indexedDB.deleteDatabase(n); q.onsuccess = q.onerror = q.onblocked = () => r(); }), 3000)));
            } catch (e) {}
            try { if (window.caches) { const K = await caches.keys(); await Promise.all(K.map(k => wait(caches.delete(k)))); } } catch (e) {}
            try { if (navigator.storage && navigator.storage.getDirectory) { const R = await navigator.storage.getDirectory(); for await (const [n] of R.entries()) await wait(R.removeEntry(n, { recursive: true })); } } catch (e) {}
            try { if (navigator.serviceWorker) { const S = await wait(navigator.serviceWorker.getRegistrations(), 2000); if (Array.isArray(S)) await Promise.all(S.map(r => wait(r.unregister()))); } } catch (e) {}
            location.reload();
        }
        window.clearBrowserStore = clearBrowserStore;


/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['settings'] = true;
