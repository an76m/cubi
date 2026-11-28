/* 말랑달콤 다이어리 - js/page.js
   글꼴 적용 · 글씨체 패널 · 이모지 목록 · 날짜/페이지 넘기기 · 페이지 크기
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        function fillFontSelect(select) {
            if (!select) return;
            const currentVal = select.value;
            select.innerHTML = '';
            fontList.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.css;
                opt.textContent = f.name;
                opt.style.fontFamily = f.css;
                select.appendChild(opt);
            });
            if (currentVal && fontList.some(f => f.css === currentVal)) {
                select.value = currentVal;
            }
        }

        function setupFontSelects() {
            fillFontSelect(document.getElementById('uiFontSelect'));
            fillFontSelect(document.getElementById('textFontSelect'));
        }

        function applyUIFont(css, save) {
            if (!fontList.some(f => f.css === css)) css = DEFAULT_UI_FONT;
            document.documentElement.style.setProperty('--font-family', css);
            const sel = document.getElementById('uiFontSelect');
            if (sel) sel.value = css;
            if (save) store.setItem('diary_ui_font', JSON.stringify(css));
        }

        function loadUIFont() {
            let css = DEFAULT_UI_FONT;
            try {
                const saved = JSON.parse(store.getItem('diary_ui_font'));
                if (saved) css = saved;
            } catch (err) {}
            applyUIFont(css, false);
        }

        function styleTextarea(ta, font, color, size) {
            font = font || DEFAULT_TEXT_FONT;
            color = color || DEFAULT_TEXT_COLOR;
            size = parseInt(size) || DEFAULT_TEXT_SIZE;
            ta.dataset.font = font;
            ta.dataset.color = color;
            ta.dataset.size = size;
            ta.style.fontFamily = font;
            ta.style.color = color;
            ta.style.fontSize = size + 'px';
            if (ta.dataset.hl && window.mhlPaint) requestAnimationFrame(() => mhlPaint(ta));   // ✏️ 글씨체 · 크기가 바뀌면 형광펜 띠도 다시
        }

        function getSelectedTextarea() {
            return selectedElement ? selectedElement.querySelector('textarea') : null;
        }

        /* 📷 사진 틀을 씌울 수 있는 사진 (SVG 그림 · 스티커 · 테이프 · 펜 그림은 제외) */
        function photoOf(el) {
            const img = el && !el.querySelector('textarea') ? el.querySelector('img') : null;
            if (!img || typeof setFrame !== 'function' || el.dataset.ts) return null;   // 🔤 글씨스티커는 글씨가 이미 정해져 있어서 꾸미기 창이 안 떠요
            return /^data:image\/svg/i.test(img.dataset.src || '') ? null : img;
        }
        const getSelectedPhoto = () => photoOf(selectedElement);

        /* 📦 글씨체 · 사진 꾸미기 창 : 고르기만 해서는 안 떠요 → 꾹 누르기 · 오른쪽 클릭 메뉴의 ✥ 글씨체 · 사진 꾸미기 로 열어요 (도련 · 2026-10-15 · js/tapmenu.js)
           다른 것을 고르거나 선택을 풀면 닫혀요 · ▾ 로 접었다 폈다 */
        let panelFor = null, panelReq = null;
        function openTextPanel(el) {                                          // 메뉴에서 연 그 요소에만 창이 떠요
            if (!el || !el.isConnected) return;
            if (typeof selectElement === 'function') selectElement(el);
            panelReq = el; panelFor = null; updateTextPanel();
        }
        const panelKindOf = el => el ? (el.querySelector('textarea') ? 'text' : photoOf(el) ? 'photo' : '') : '';
        window.openTextPanel = openTextPanel; window.panelKindOf = panelKindOf;
        function setPanelFold(f) {
            const panel = document.getElementById('textPanel'), b = document.getElementById('textPanelFold');
            panel.classList.toggle('folded', f);
            if (b) { b.textContent = f ? '▾' : '▴'; }
            positionTextPanel();
        }
        function toggleTextPanelFold() { setPanelFold(!document.getElementById('textPanel').classList.contains('folded')); }
        function updateTextPanel() {
            const panel = document.getElementById('textPanel');
            const nowFor = selectedElement && selectedElement === panelReq && (getSelectedTextarea() || getSelectedPhoto()) ? selectedElement : null;
            if (!nowFor) { panelReq = null; panelFor = null; panel.style.display = 'none'; return; }
            if (nowFor !== panelFor) { panelFor = nowFor; setPanelFold(false); }   // 메뉴로 열면 펼친 채로
            const ta = getSelectedTextarea();
            if (!ta && getSelectedPhoto()) {                 // 사진 → 사진 꾸미기 (틀 · 글씨)
                panel.dataset.mode = 'photo';
                document.getElementById('textPanelTitle').textContent = '✥ 사진 꾸미기';
                if (typeof updateFrameChips === 'function') updateFrameChips();
                panel.style.display = 'flex';
                positionTextPanel();
                return;
            }
            if (!ta) { panel.style.display = 'none'; return; }
            panel.dataset.mode = 'text';
            document.getElementById('textPanelTitle').textContent = '✥ 글씨체';

            const fontSel = document.getElementById('textFontSelect');
            const font = ta.dataset.font || DEFAULT_TEXT_FONT;
            if (!fontList.some(f => f.css === font)) {
                fontSel.value = DEFAULT_TEXT_FONT;
            } else {
                fontSel.value = font;
            }
            document.getElementById('textColorInput').value = ta.dataset.color || DEFAULT_TEXT_COLOR;
            document.getElementById('textSizeInput').value = ta.dataset.size || DEFAULT_TEXT_SIZE;
            panel.style.display = 'flex';
            positionTextPanel();
        }

        let panelOffset = null;

        function clampPanelPos(l, t, pw, ph) {
            const m = 6;
            l = Math.max(m, Math.min(l, window.innerWidth - pw - m));
            t = Math.max(m, Math.min(t, window.innerHeight - ph - m));
            return { l, t };
        }

        function positionTextPanel() {
            const panel = document.getElementById('textPanel');
            if (!selectedElement || !(getSelectedTextarea() || getSelectedPhoto()) || panel.style.display === 'none') return;

            const er = selectedElement.getBoundingClientRect();
            const pw = panel.offsetWidth, ph = panel.offsetHeight;
            let l, t;

            if (panelOffset) {
                l = er.left + panelOffset.dx;
                t = er.top + panelOffset.dy;
            } else {
                l = er.left + er.width / 2 - pw / 2;
                t = er.bottom + 22;
                if (t + ph > window.innerHeight - 6) {
                    t = er.top - ph - 34;
                }
            }
            const p = clampPanelPos(l, t, pw, ph);
            panel.style.left = p.l + 'px';
            panel.style.top = p.t + 'px';
        }

        function closeTextPanel() {
            if (selectedElement) selectedElement.classList.remove('selected');
            selectedElement = null;
            updateTextPanel();
        }

        function setupPanelDrag() {
            const panel = document.getElementById('textPanel');
            const handle = document.getElementById('textPanelHandle');
            let dragging = false, moved = false, sx = 0, sy = 0, sl = 0, st = 0;

            handle.addEventListener('pointerdown', (e) => {
                if (e.target.closest('button')) return;
                dragging = true; moved = false;
                const r = panel.getBoundingClientRect();
                sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top;
                try { handle.setPointerCapture(e.pointerId); } catch (err) {}
                e.preventDefault();
                e.stopPropagation();
            });

            handle.addEventListener('pointermove', (e) => {
                if (!dragging) return;
                if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 6) return;      // 살짝 흔들린 건 '누름'
                moved = true;
                const p = clampPanelPos(sl + e.clientX - sx, st + e.clientY - sy, panel.offsetWidth, panel.offsetHeight);
                panel.style.left = p.l + 'px';
                panel.style.top = p.t + 'px';
                if (selectedElement) {
                    const er = selectedElement.getBoundingClientRect();
                    panelOffset = { dx: p.l - er.left, dy: p.t - er.top };
                }
            });

            const stop = () => { dragging = false; };
            /* 제목 줄 어디든(✕ 빼고) 한 번 누르면 접기 · 펴기 / 끌면 창 옮기기 */
            handle.addEventListener('pointerup', () => { const tap = dragging && !moved; stop(); if (tap) toggleTextPanelFold(); });
            handle.addEventListener('pointercancel', stop);
            window.addEventListener('resize', positionTextPanel);
        }

        function applyTextStyle() {
            const ta = getSelectedTextarea();
            if (!ta) return;
            const font = document.getElementById('textFontSelect').value;
            const color = document.getElementById('textColorInput').value;
            let size = parseInt(document.getElementById('textSizeInput').value);
            if (isNaN(size)) return;
            size = Math.max(8, Math.min(120, size));
            styleTextarea(ta, font, color, size);
        }


        function formatDate(date) {
            const dk = window.dkLabel && dkLabel(date); if (dk) return dk;   // 📕 유한 다이어리 장 : 페이지 수 · 날짜 (js/skins.js)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${year}. ${month}. ${day} (${days[date.getDay()]})`;
        }

        function getDateKey(date) {
            const dk = window.dkKey && dkKey(date); if (dk) return dk;       // 📕 유한 다이어리 장 (BookSpot) → dkp_권_장 (js/skins.js)
            const b = window.dyyBookId && dyyBookId(); if (!b) return 'nobook';   // 📔 다이어리가 없으면 어디에도 저장 안 되는 키 (펼치지도 못해요)
            if (isSpot(date)) return dayCoverKey(b);                          // 📔 날짜형 표지 = diary_<권 id>_cover → 그 권 표지.json (js/drive.js)
            return dayKeyOf(date.getFullYear(), date.getMonth() + 1, date.getDate(), b);   // 📔 펼친 권마다 따로 (js/dyyear.js)
        }

        let turn = null;

        /* =====================================================================
           🗜 SVG 그림 짧게 저장 : 페이지 그림은 언제나 그림 그대로 담아요 (주소 · 이름표 없음)
             sv:<SVG 글자> = SVG data 주소에서 %XX 로 부풀린 글자를 원래 글자로 (약 30~50% 작아짐)
           ✔ 저장할 때 '되돌린 결과가 원래 주소와 똑같은지' 확인해서 똑같을 때만 줄여요 → 그림이 깨질 일 없음
           ✔ 사진(png · jpg)은 그대로 */
        const SLIM_PFX = 'data:image/svg+xml;charset=utf-8,';
        function slimDec(c) {                                         // sv: → 원래 SVG data 주소 (아니면 그대로)
            if (typeof c !== 'string' || !c.startsWith('sv:')) return c;
            return SLIM_PFX + encodeURIComponent(c.slice(3));
        }
        function slimEnc(src) {                                       // SVG data 주소 → sv: (줄일 수 없으면 그대로)
            if (typeof src !== 'string' || !src.startsWith(SLIM_PFX)) return src;
            try { const ref = 'sv:' + decodeURIComponent(src.slice(SLIM_PFX.length)); if (slimDec(ref) === src) return ref; } catch (e) {}
            return src;
        }

        function normalizeItem(d) {
            const f = fontList.find(x => x.id === d.f);
            return { type: ({ i: 'image', t: 'text', s: 'sticker', d: 'doll' })[d.t] || 'sticker', content: d.t === 'i' ? slimDec(d.c) : d.c,
                side: d.p === 'r' ? 'r' : 'l', mx: +d.x || 0, my: +d.y || 0, mw: +d.W || 0, rotation: d.r || 0,
                width: d.w ? d.w + 'px' : '', height: d.h ? d.h + 'px' : '', zIndex: d.z || 1,
                boxW: d.bw || 0, boxH: d.bh || 0, fontFamily: f ? f.css : undefined, color: d.k, fontSize: d.fs, paper: d.pp, frame: d.fr, caption: d.cp, float: d.fm, ts: d.ts, ow: d.ow, bgp: d.bgp, ph: d.ph, cm: d.cm, sh: d.sh, tk: d.tk, tb: d.tb && slimDec(d.tb), hl: d.hl, pn: d.pn, lt: d.lt };
        }

        function readDayData(date) {
            let raw = null;
            try { raw = JSON.parse(store.getItem(getDateKey(date))); } catch (err) {}
            if (!raw) return [];
            const cv = pgCanvas();                                              // 📏 쪽 기준 mm → 지금 화면 자리 (pgFromMm)
            return (Array.isArray(raw.i) ? raw.i : []).map(normalizeItem).map(it => Object.assign(it, pgFromMm(it, cv)));
        }

        function buildStaticPage(date) {
            const page = document.createElement('div');
            page.className = 'page inner-page';
            page.style.zIndex = 2;
            page.style.pointerEvents = 'none';
            page.innerHTML =
                `<div class="page-header">
                    <button type="button" class="page-nav-btn page-side${dvCfg()[dvDev()].includes('l') ? ' on' : ''}" tabindex="-1">${dvSideSvg('l')}</button>
                    <button type="button" class="page-nav-btn page-arrow" tabindex="-1"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                    <span class="page-date-wrap"><button type="button" class="page-cal-btn" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.2" y="5" width="17.6" height="15.8" rx="4" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="2.2"/><path d="M3.2 10.4h17.6M8.2 2.8v4.4M15.8 2.8v4.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><g fill="currentColor"><circle cx="8" cy="14.4" r="1.2"/><circle cx="12" cy="14.4" r="1.2"/><circle cx="16" cy="14.4" r="1.2"/></g></svg></button><span class="page-date-btn">${formatDate(date)}</span><button type="button" class="page-search-btn" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.2" cy="10.2" r="6.3" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="2.4"/><line x1="15" y1="15" x2="20.6" y2="20.6" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></button></span>
                    <button type="button" class="page-nav-btn page-arrow" tabindex="-1"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                    <button type="button" class="page-nav-btn page-side${dvCfg()[dvDev()].includes('r') ? ' on' : ''}" tabindex="-1">${dvSideSvg('r')}</button>
                </div>
                <div class="canvas-area"></div>`;
            const canvas = page.querySelector('.canvas-area');
            if (typeof lfStatic === 'function') lfStatic(canvas, date);      // 📃 그날 속지 (js/leafpad.js)
            if (typeof psStaticHtml === 'function') page.insertAdjacentHTML('beforeend', psStaticHtml(date));
            if (typeof ddStaticHtml === 'function') page.insertAdjacentHTML('beforeend', ddStaticHtml(date));
            readDayData(date).forEach(d => canvas.appendChild(createElementFromData(d, false)));
            return page;
        }

        function beginCurl(isCover, dir, keepDate) {
            if (turn) return false;
            if (isCover && window.dyyNone && dyyNone()) return false;              // 📔 다이어리가 한 권도 없어요 → 알려 주고 안 펼쳐요 (js/dyyear.js)
            if (isCover && dir !== 1) return false;
            const keep = !isCover && dir === 1 && !!window.dkUnfold && dkUnfold();   // 📕 표꾸 화면에서 넘기면 겉표지를 여는 것처럼 (열리면서 가운데로 · js/skins.js)
            if (keep) isCover = true;

            const book = document.getElementById('diaryBook');
            const W = book.clientWidth;
            const pageEl = document.getElementById(isCover ? 'coverPage' : 'innerPage');

            if (isCover && !keep && !keepDate && window.dyOpenDate) { const od = dyOpenDate(); if (od) curSet(od); }   // 🗂 꾸민 페이지만 보기 : 열면 마지막으로 꾸민 날 (js/skins.js)
            let targetDate = spotCopy(currentDate);                                          // 📍 날짜 또는 쪽 (js/book.js BookSpot)
            if (!isCover) {
                const to = window.dyStep ? dyStep(currentDate, dir) : addDays(currentDate, dir);   // 🗂 꾸민 페이지만 보기면 빈 날은 건너뛰어요 (js/skins.js)
                if (!to) { if (window.dkEnd) dkEnd(dir); return false; }   // 📕 유한 다이어리 마지막 장 → 기본으로 넘어갈까요?
                saveData(false);
                targetDate = spotCopy(to);
            }

            const under = buildStaticPage(targetDate);
            if (dyUnderR(dir, isCover)) under.classList.add('dy-at-r');
            if (isCover) under.classList.add('ph-wait');                                       // 날짜바는 다 펼쳐진 뒤에 나와요                         // 📱 전날은 오른쪽 쪽부터 · 📄 한쪽 보기는 늘 오른쪽 쪽
            const ip = document.getElementById('innerPage');                                  // 📒 아래 장도 같은 다이어리 모양 (링 · 밴드 · 구멍 없음)
            if (ip.dataset.dy) { under.dataset.dy = ip.dataset.dy; under.style.setProperty('--dy-c', ip.style.getPropertyValue('--dy-c')); under.classList.toggle('dy-noholes', ip.classList.contains('dy-noholes'));
                ip.querySelectorAll(':scope > .dy-deco').forEach(n => { const c = n.cloneNode(true); c.removeAttribute('id'); c.classList.add(n.id === 'dyBack' ? 'dy-bk' : 'dy-fr'); n.id === 'dyBack' ? under.prepend(c) : under.appendChild(c); }); }
            const shadow = document.createElement('div');
            shadow.className = 'under-shadow ' + (dir === 1 ? 'dir-next' : 'dir-prev');
            under.appendChild(shadow);
            book.appendChild(under);
            const ucv = under.querySelector('.canvas-area');                                 // 📒 아래 장의 링 · 커버는 아래 장 종이 자리에 (로그인 뒤 처음 펼칠 땐 속 장이 숨어 있어 크기가 0 → 왼쪽 위에 잘린 링이 보였어요 · 도련 10-19)
            if (ucv) under.querySelectorAll(':scope > .dy-deco').forEach(c => Object.assign(c.style, { left: ucv.offsetLeft + 'px', top: ucv.offsetTop + 'px', width: ucv.offsetWidth + 'px', height: ucv.offsetHeight + 'px' }));

            const flapLayer = document.createElement('div');
            flapLayer.className = 'flap-layer';
            const flap = document.createElement('div');
            flap.className = 'flap ' + (dir === 1 ? 'dir-next' : 'dir-prev') + ' ' + (isCover ? 'cover-back' : 'page-back');
            flapLayer.appendChild(flap);
            book.appendChild(flapLayer);

            if (selectedElement) { selectedElement.classList.remove('selected'); selectedElement = null; }
            updateTextPanel();

            /* 💻 펼침면 : 넘기는 장(한 쪽)이 가운데 묶음을 축으로 반대쪽 쪽 위로 넘어가요 · 겉표지는 넘기는 만큼 다이어리가 가운데로 옮겨가요 */
            const two = book.classList.contains('dy-sp') && !book.classList.contains('dy-one');
            if (two) { flapLayer.style.left = -W + 'px'; flapLayer.style.width = 2 * W + 'px'; }
            const RB = el => DRT.a ? dyRect(el) : el.getBoundingClientRect(), bx = RB(book).left;   // 🔄 돌린 다이어리 = 안 돌린 자리로
            const uOff = (RB(under).left - bx) / DRT.s, fOff = two ? -W : 0;     // 아래 장 · 넘김 층이 책 왼쪽에서 얼마나 떨어져 있는지
            const edgeL = !isCover && two ? -W : 0;                                          // 전날로 넘길 때 잡는 왼쪽 끝 (펼침면은 왼쪽 쪽 끝)
            turn = { isCover, dir, to: targetDate, W, pageEl, under, shadow, flapLayer, flap, d: 0, two, uOff, fOff, edgeL, keep };
            updateCurl(0);
            return true;
        }

        function updateCurl(d) {                                              // 📖 넘어가는 그림 = 공통 계산 (js/book.js bookCurlAt · 📒 🤍 책 엔진과 같아요 · 도련 11-15 · 2-4)
            const t = turn;
            if (!t) return;
            const g = bookCurlAt(t.W, d, t.dir, t.edgeL);
            t.d = g.d;
            t.flap.style.display = t.shadow.style.display = g.show ? 'block' : 'none';
            t.flap.style.width = g.fw + 'px'; t.shadow.style.width = g.sw + 'px';
            t.pageEl.style.clipPath = g.clip;
            t.flap.style.left = (g.fx - t.fOff) + 'px';                         // 넘김 층 · 아래 장이 책 왼쪽에서 떨어진 만큼 빼요
            t.shadow.style.left = (g.sx - t.uOff) + 'px';
            if (t.dir === 1 && t.isCover && t.two) {                            // 💻 표지 : 넘긴 만큼 왼쪽 쪽이 드러나고 다이어리가 가운데로
                t.under.style.clipPath = `inset(0 0 0 ${Math.max(0, g.fx - t.uOff)}px)`;
                document.getElementById('diaryWrapper').style.marginLeft = g.d + 'px';
            }
        }

        /* ✋ 넘기는 손길 · 움직임 = 공통 (js/book.js bookTurner · 도련 11-15 · 2-2) · 넘어가는 그림만 다이어리 것 (종이 말림 · beginCurl · updateCurl · endCurl) */
        let CURL = null;
        const curlCtx = () => {
            const t = turn, book = document.getElementById('diaryBook');
            return { w: t.W, k: (t.isCover && t.two ? BOOK_COVER_K : 1) * DRT.s, get d() { return turn === t ? t.d : 0; }, set: d => { if (turn === t) updateCurl(d); }, done: ok => { if (turn === t) endCurl(ok); },   // 💻 표지는 다이어리도 같이 옮겨가니 손가락 따라가게 (k)
                out: (e, dir) => { const r = DRT.a ? dyRect(book) : book.getBoundingClientRect(); return dir === 1 ? e.clientX <= r.left : e.clientX >= r.right; } };
        };
        function animateCurlTo(target, complete, rev, after) {                // rev = 거꾸로 (여는 것을 그대로 되감아요 · 천천히 시작해 빨라져요) · after = 끝난 뒤
            if (!turn || !CURL) return;
            CURL.animate(curlCtx(), target, complete, rev, after);
        }

        function endCurl(complete) {
            const t = turn;
            if (!t) return;

            if (complete) {
                if (t.isCover) {
                    t.pageEl.style.display = 'none';
                    document.getElementById('innerPage').style.display = 'flex';
                    isCoverOpen = true; pgmPos = { x: 0, y: 0 };
                    turn = null; refreshLayout(); turn = t;                       // 📖 펼침면이면 두 쪽으로 펼쳐져요 (js/skins.js dyDeco)
                    pgmApply();   // 다이어리를 열면 늘 가운데에서 시작
                    const ip = document.getElementById('innerPage'); rePop(ip, 'ph-in');   // 날짜바가 스르륵 나타나요
                    setTimeout(() => ip.classList.remove('ph-in'), 600);
                    if (window.dfFix && !t.keep) setTimeout(dfFix, 0);                      // 🗂 목록을 받기 전에 열었으면 받은 뒤 마지막으로 꾸민 날로
                } else {
                    curSet(t.to);
                }
                selectedElement = null;
                if (window.dyViewSet) dyViewSet(t.isCover || t.dir === 1 ? 'l' : 'r');   // 📱 다음 날은 왼쪽 · 전날은 오른쪽 쪽부터
                document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
                loadData();
                if (t.isCover) prefetchInitial();          // 표지를 넘기면: 오늘 + 앞·뒤 3일치 (이미 읽었으면 바로 끝)
                else prefetchAfterTurn(t.dir);             // 한 장 넘기면: 넘긴 방향의 다음 하루치만
            }

            if (t.isCover && t.two && !complete) document.getElementById('diaryWrapper').style.marginLeft = '';
            if (t.keep && !complete && window.dkRefold) setTimeout(dkRefold, 0);             // 📕 덜 넘기고 놓으면 다시 표꾸 화면
            t.under.remove();
            t.flapLayer.remove();
            t.pageEl.style.clipPath = '';
            setTimeout(() => { if (layoutDirty) refreshLayout(); }, 0);
            turn = null;
            updateTextPanel();
        }

        /* 📅 원하는 날짜 페이지로 가기 (표지가 닫혀 있으면 열고, 다른 날짜면 저장한 뒤 그 날로) → 그날 일기를 다 불러온 뒤 done() */
        function goToDate(target, done) {
            if (window.dyyGuard && !dyyGuard(target)) return;                // 📔 그 해 기본 다이어리가 없으면 못 가요 (js/dyyear.js)
            const ready = () => {
                const key = getDateKey(currentDate); let n = 0;
                const w = () => {
                    if (!turn && (drive.guest || drive.loadedDays.has(key))) { if (done) done(); }
                    else if (n++ < 60) setTimeout(w, 150);
                };
                w();
            };
            const jump = () => {
                if (getDateKey(currentDate) !== getDateKey(target)) {
                    saveData(false);
                    curSet(target);
                    selectedElement = null;
                    if (window.dyViewSet) dyViewSet('l');
                    document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
                    loadData();
                    prefetchInitial();
                }
                ready();
            };
            if (isCoverOpen) { jump(); return; }
            if (getDateKey(currentDate) !== getDateKey(target)) curSet(target);
            openCoverAnimated();
            let n = 0;
            const w = () => { if (isCoverOpen && !turn) jump(); else if (n++ < 40) setTimeout(w, 100); };
            setTimeout(w, 100);
        }
        function goToToday(done) { goToDate(new Date(), done); }

        function changeDate(delta) {
            if (!isCoverOpen || turn) return;
            if (beginCurl(false, delta > 0 ? 1 : -1)) animateCurlTo(turn.W, true);
        }

        function openCoverAnimated() {
            if (isCoverOpen || turn) return;
            if (beginCurl(true, 1)) animateCurlTo(turn.W, true);
        }
        /* 📖 표지 덮기 = 표지 펼치기를 그대로 거꾸로 (도련 11-13 · 🪑 책상에 내려놓을 때) : shut = 덮인 모습으로 바꾸기 (js/desk.js dkFoldShut) → 다 펼친 표지 넘김에서 시작해 되감아요 · 펼친 그날 장 그대로 */
        function closeCoverAnimated(shut, done) {
            const fin = () => { if (done) done(); };
            if (!isCoverOpen || turn) { fin(); return; }
            drReset();                                                         // 🔄 덮으면 똑바로
            try { saveData(false); } catch (e) {}
            shut();
            if (calmMotion() || !beginCurl(true, 1, true)) { fin(); return; }
            turn.under.classList.remove('ph-wait');                               // 펼쳐 있던 모습 그대로 (날짜바도)
            updateCurl(turn.W);
            animateCurlTo(0, false, true, fin);
        }
        window.closeCoverAnimated = closeCoverAnimated;

        /* 📖 페이지 넘기기 : 다이어리를 연 뒤에는 페이지 양쪽 끝(가장자리)을 잡고 밀 때만 넘어가요
           - 오른쪽 끝 → 왼쪽으로 밀면 다음 날 · 왼쪽 끝 → 오른쪽으로 밀면 전날 (가운데에서 그림 · 글을 만질 때는 안 넘어가요)
           - 겉표지는 어디를 잡아도 열려요 */
        const CURL_EDGE = { ratio: 0.15, min: 36, max: 80 };      // 끝 영역 너비 : 페이지 너비의 15% (36~80px)
        function curlEdgeAt(x, book) {                                         // x = 안 돌린 자리 (dyIn)
            const r0 = window.dyEdgeRect && dyEdgeRect(), r = DRT.a ? dyRect(r0 ? document.getElementById('innerPage') : book) : r0 || book.getBoundingClientRect(), z = clampNum(r.width * CURL_EDGE.ratio, CURL_EDGE.min, CURL_EDGE.max);   // 💻 펼침면은 두 쪽 전체의 양쪽 끝
            return x >= r.right - z ? 1 : x <= r.left + z ? -1 : 0;
        }
        /* 🔄 다이어리 돌리기 (도련 11-28 '현실처럼 돌려서 다꾸' · 2D 툴처럼 보기만 돌려요 · 붙인 것 · 저장은 그대로)
           - 네 모서리(종이 밖 테두리 + 안쪽 조금 · .dr-h)를 잡고 끌면 돌아가요 → 놓으면 가까운 90도에 착 · 화면에 맞게 살짝 작아져요
           - 돌아가는 점 = 종이(#canvasArea) 가운데 · 화면 → 종이 바꾸기는 여기 하나 : dyIn(화면 점 → 안 돌린 점) · dyOut(거꾸로) · dyVec(움직인 거리 → 종이 px) · dyRect(상자 · 너비 ÷ offsetWidth = 배율)
           - 지금 맞춘 것 = 📌 스티커 붙이기 · 옮기기 · 늘이기 · ✏️ 펜 · 그 밖의 문구는 돌린 동안 막아요 (gdHold) · 페이지 넘기기 · 바인더 꺼내기도 쉬어요
           - 기억하지 않아요 (겉표지를 덮으면 바로 · 앱을 켜면 늘 똑바로) */
        const DRT = { a: 0, s: 1, t: [0, 0], drag: null };
        const drW = () => document.getElementById('diaryWrapper');
        function drVis() {                                                      // 돌아가는 상자 = 보이는 종이 (📱 한 쪽 보기 = 종이 ∩ 책 · 두 상자 모두 같이 돌아서 겹친 곳 가운데는 그대로)
            const c = document.getElementById('canvasArea'), b = document.getElementById('diaryBook'), r = c && c.getBoundingClientRect(); if (!r || !r.width) return null;
            if (!b || !b.classList.contains('dy-one')) return r;
            const o = b.getBoundingClientRect(), L = Math.max(r.left, o.left), T = Math.max(r.top, o.top), R = Math.min(r.right, o.right), B = Math.min(r.bottom, o.bottom);
            return R > L && B > T ? { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T } : r;
        }
        function drPivot() { const r = drVis(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 }; }
        function drMap(x, y, a, s, P) { const t = a * Math.PI / 180, dx = x - P.x, dy = y - P.y; return [P.x + s * (dx * Math.cos(t) - dy * Math.sin(t)), P.y + s * (dx * Math.sin(t) + dy * Math.cos(t))]; }
        function dyIn(x, y) { if (!DRT.a) return [x, y]; const P = drPivot(), t = -DRT.a * Math.PI / 180, dx = x - P.x, dy = y - P.y; return [P.x + dx * Math.cos(t) - dy * Math.sin(t), P.y + dx * Math.sin(t) + dy * Math.cos(t)]; }   // 돌리기만 풀어요 (작아진 크기는 그대로 → 상자 너비 ÷ offsetWidth = 화면 배율에 같이 들어가요)
        function dyOut(x, y) { return !DRT.a ? [x, y] : drMap(x, y, DRT.a, 1, drPivot()); }
        function dyVec(dx, dy) { if (!DRT.a && DRT.s === 1) return [dx, dy]; const t = -DRT.a * Math.PI / 180; return [(dx * Math.cos(t) - dy * Math.sin(t)) / DRT.s, (dx * Math.sin(t) + dy * Math.cos(t)) / DRT.s]; }
        function dyRect(el) {
            const r = el.getBoundingClientRect(); if (!DRT.a) return r;
            const Q = [[r.left, r.top], [r.right, r.top], [r.left, r.bottom], [r.right, r.bottom]].map(p => dyIn(p[0], p[1])), X = Q.map(p => p[0]), Y = Q.map(p => p[1]);
            const L = Math.min(...X), T = Math.min(...Y), R = Math.max(...X), B = Math.max(...Y);
            return { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T, x: L, y: T };
        }
        const dyRot = () => DRT.a, dyScale = () => DRT.s;
        function drApply(a, s, anim, t) {
            const w = drW(); if (!w) return; DRT.a = a; DRT.s = s; if (t) DRT.t = t;
            w.classList.toggle('dr-anim', !!anim); w.style.rotate = a ? a + 'deg' : ''; w.style.scale = s !== 1 ? String(s) : ''; w.style.translate = DRT.t[0] || DRT.t[1] ? `${DRT.t[0]}px ${DRT.t[1]}px` : '';
            document.documentElement.classList.toggle('dy-rot', !!(((a % 360) + 360) % 360));
            drHead();
        }
        /* 📅 날짜바는 똑바로 (도련 11-28 '날짜바는 고정') : 다이어리가 돌아도 날짜바는 서 있고 · 보이는 종이 위쪽 가운데 (돌리기 전과 같은 높이 차이)
           hy0 = 똑바로일 때 날짜바 가운데 - 종이 위 (px) · 날짜바 = 다이어리 안이라 반대로 돌리고(rotate) 옮겨요(translate · 원래 css translate 더하기) */
        function drHy0() {
            const hd = document.getElementById('pageHeader'), v = drVis(); if (!hd || !v || DRT.a) return;
            hd.style.translate = ''; hd.style.rotate = ''; const r = hd.getBoundingClientRect(); if (r.height) DRT.hy0 = { y: r.top + r.height / 2 - v.top, x: r.left + r.width / 2 - (v.left + v.width / 2) };
        }
        function drHead() {
            const hd = document.getElementById('pageHeader'); if (!hd) return;
            hd.style.translate = ''; hd.style.rotate = '';
            if (!(((DRT.a % 360) + 360) % 360) || !DRT.hy0) return;
            const v = drVis(); if (!v) return;
            const b = (getComputedStyle(hd).translate || '').split(/\s+/).map(parseFloat), bx = b[0] || 0, by = b[1] || 0;   // 📱 한 쪽 보기 css translate
            hd.style.rotate = -DRT.a + 'deg';
            const bk = document.getElementById('diaryBook'), up = dyVec(0, -1), cut = bk && bk.classList.contains('dy-one') && (bk.classList.contains('dy-r') ? up[0] < -.5 : up[0] > .5);   // 📱 한 쪽 보기 : 위쪽이 가려진 쪽(css clip)이면 아래에
            const ty = cut ? v.bottom - DRT.hy0.y * DRT.s : v.top + DRT.hy0.y * DRT.s;
            const r = hd.getBoundingClientRect(), [lx, ly] = dyVec(v.left + v.width / 2 + DRT.hy0.x * DRT.s - (r.left + r.width / 2), ty - (r.top + r.height / 2));
            hd.style.translate = `${(bx + lx).toFixed(1)}px ${(by + ly).toFixed(1)}px`;
        }
        function drOrigin() {                                                   // 돌아가는 점 = 종이 가운데 (wrapper 안 자리 · 안 돌린 채로 재요)
            const w = drW(), c = document.getElementById('canvasArea'); if (!w || !c) return;
            const a = DRT.a, s = DRT.s; w.style.rotate = ''; w.style.scale = ''; w.style.translate = '';
            const wr = w.getBoundingClientRect(), cr = drVis() || c.getBoundingClientRect();
            w.style.transformOrigin = `${(cr.left + cr.width / 2 - wr.left).toFixed(1)}px ${(cr.top + cr.height / 2 - wr.top).toFixed(1)}px`;
            drApply(a, s, false);
        }
        function drFit(a) {                                                     // 옆으로 눕히면 화면에 들어가게 (위 · 아래 메뉴 피해서 가운데로 · 작게) → { s, t: [x, y] 옮김 }
            if (!(((a % 180) + 180) % 180)) return { s: 1, t: [0, 0] };
            const ip = document.getElementById('innerPage'), cov = document.querySelector('#dyBack > .dy-cov'); if (!ip) return { s: 1, t: [0, 0] };
            const bk = document.getElementById('diaryBook'), one = bk && bk.classList.contains('dy-one');   // 📱 한 쪽 보기 = 한 쪽 너비만
            const W = one ? bk.offsetWidth + 40 : Math.max(ip.offsetWidth, cov ? cov.offsetWidth : 0), H = Math.max(ip.offsetHeight, cov ? cov.offsetHeight : 0), P = drPivot(), P0 = [P.x - DRT.t[0], P.y - DRT.t[1]];
            const tb = document.querySelector('.toolbar'), top = 20, bot = (tb && tb.offsetParent ? tb.getBoundingClientRect().top : window.innerHeight) - 12;
            const sc = Math.max(.3, Math.min(1, (window.innerWidth - 40) / H, (bot - top) / W)), cy = (top + bot) / 2, hw = H * sc / 2;
            const cx = Math.min(window.innerWidth - 20 - hw, Math.max(20 + hw, P0[0]));   // 가로는 그 자리 그대로 (화면 밖이면 안으로)
            return { s: sc, t: [Math.round(cx - P0[0]), Math.round(cy - P0[1])] };
        }
        function drPlace() {                                                    // 모서리 손잡이 = 다이어리 판(.dy-cov) 네 모서리
            const ip = document.getElementById('innerPage'); if (!ip || DRT.drag) return;
            let h = document.getElementById('drH');
            if (!h) { h = document.createElement('div'); h.id = 'drH'; h.className = 'dr-h'; h.setAttribute('aria-hidden', 'true'); h.innerHTML = ['tl', 'tr', 'bl', 'br'].map(c => `<i class="${c}"></i>`).join(''); h.addEventListener('pointerdown', drDown); }
            if (h.parentNode !== ip) ip.appendChild(h);
            drTwist();
            const cov = ip.querySelector('#dyBack > .dy-cov') || document.getElementById('canvasArea'); if (!cov) return;
            if (!DRT.a) { drOrigin(); drHy0(); }
            const a = dyRect(ip), k = a.width / (ip.offsetWidth || a.width) || 1; let b = dyRect(cov);
            const bk = document.getElementById('diaryBook'), cv = document.getElementById('canvasArea');
            if (bk && cv && bk.classList.contains('dy-one')) {                    // 📱 한 쪽 보기 = 보이는 쪽 (종이 ∩ 책) + 판 둘레만큼
                const c = dyRect(cv), o = dyRect(bk), L = Math.max(c.left, o.left), R = Math.min(c.right, o.right);
                b = { left: L - (c.left - b.left), right: R + (b.right - c.right), top: b.top, bottom: b.bottom }; b.width = b.right - b.left; b.height = b.bottom - b.top;
            }
            Object.assign(h.style, { left: ((b.left - a.left) / k).toFixed(1) + 'px', top: ((b.top - a.top) / k).toFixed(1) + 'px', width: (b.width / k).toFixed(1) + 'px', height: (b.height / k).toFixed(1) + 'px' });
        }
        function drLetGo() { try { if (window.gdLetGo) gdLetGo(); if (window.skLetGo) skLetGo(); if (window.penRest) penRest(); } catch (e) {} }
        function drDown(e) {
            if (!e.target.closest('.dr-h > i') || !isCoverOpen || turn || (e.pointerType === 'mouse' && e.button !== 0)) return;
            e.preventDefault(); e.stopPropagation(); drLetGo();
            if (!DRT.a) { drOrigin(); drHy0(); }
            const P = drPivot(); DRT.drag = { id: e.pointerId, P, a0: Math.atan2(e.clientY - P.y, e.clientX - P.x) * 180 / Math.PI, b0: DRT.a, el: e.target };
            try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
            drW().classList.add('dr-on');
            e.target.addEventListener('pointermove', drMove); e.target.addEventListener('pointerup', drUp); e.target.addEventListener('pointercancel', drUp);
        }
        function drMove(e) {
            const d = DRT.drag; if (!d || e.pointerId !== d.id) return;
            const a = Math.atan2(e.clientY - d.P.y, e.clientX - d.P.x) * 180 / Math.PI; let da = a - d.a0; da = ((da + 540) % 360) - 180;
            drApply(d.b0 + da, DRT.s, false);
        }
        function drUp(e) {
            const d = DRT.drag; if (!d || e.pointerId !== d.id) return;
            ['pointermove', 'pointerup', 'pointercancel'].forEach((t, i) => d.el.removeEventListener(t, [drMove, drUp, drUp][i]));
            DRT.drag = null; drW().classList.remove('dr-on');
            const to = d.b0 + Math.round((DRT.a - d.b0) / 90) * 90, n = ((to % 360) + 360) % 360, f = drFit(n);
            drApply(to, f.s, true, f.t);
            setTimeout(() => { if (DRT.drag) return; drApply(n, f.s, false); drPlace(); if (typeof positionTextPanel === 'function') positionTextPanel(); if (window.bdSync) bdSync(); }, 300);
        }
        /* 👆👆 두 손가락으로 비틀기 (빈 종이 · 판 위 · 스티커 · 문구 위는 그것만) : 15도 넘게 비틀면 돌기 시작 → 놓으면 90도 맞춤 */
        let drTw = null;
        const drAng = t => Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX) * 180 / Math.PI;
        function drTwist() {
            const w = drW(); if (!w || w._drTw) return; w._drTw = 1;
            w.addEventListener('touchstart', e => {
                if (!isCoverOpen || turn || e.touches.length !== 2 || DRT.drag) { if (e.touches.length !== 2) drTw = null; return; }
                if ([...e.touches].some(t => t.target.closest && t.target.closest('.element-box, .bd-tool, button, textarea, input, .dr-h'))) return;
                drTw = { a0: drAng(e.touches), b0: DRT.a, on: false };
            }, { passive: true });
            w.addEventListener('touchmove', e => {
                if (!drTw || e.touches.length !== 2) return;
                let da = drAng(e.touches) - drTw.a0; da = ((da + 540) % 360) - 180;
                if (!drTw.on && Math.abs(da) < 15) return;
                if (!drTw.on) { drTw.on = true; drLetGo(); if (!DRT.a) { drOrigin(); drHy0(); } }
                if (e.cancelable) e.preventDefault();
                drApply(drTw.b0 + da, DRT.s, false);
            }, { passive: false });
            const end = e => {
                if (!drTw || e.touches.length >= 2) return; const t = drTw; drTw = null; if (!t.on) return;
                const to = t.b0 + Math.round((DRT.a - t.b0) / 90) * 90, n = ((to % 360) + 360) % 360, f = drFit(n);
                drApply(to, f.s, true, f.t);
                setTimeout(() => { if (DRT.drag || drTw) return; drApply(n, f.s, false); drPlace(); if (typeof positionTextPanel === 'function') positionTextPanel(); if (window.bdSync) bdSync(); }, 300);
            };
            w.addEventListener('touchend', end); w.addEventListener('touchcancel', end);
        }
        function drReset() { if (DRT.a || DRT.s !== 1) { drApply(0, 1, false, [0, 0]); if (window.bdSync) bdSync(); } }
        window.dyRotSet = a => { if (!DRT.a) { drOrigin(); drHy0(); } const f = drFit(a); drApply(a, f.s, false, f.t); drPlace(); };   // 🧪 시험용 (바로 돌려 놓기)
        window.dyIn = dyIn; window.dyOut = dyOut; window.dyVec = dyVec; window.dyRect = dyRect; window.dyRot = dyRot; window.dyScale = dyScale; window.drPlace = drPlace;
        function setupCurlDrag() {
            const wrapper = document.getElementById('diaryWrapper');
            const book = document.getElementById('diaryBook');
            CURL = bookTurner({
                el: wrapper, pt: e => dyIn(e.clientX, e.clientY),   // 🔄 돌린 다이어리 = 종이 방향으로 끌어요
                grab: e => {                                                     // 펼친 뒤엔 끝을 잡아야 · 겉표지는 어디든 (그림 · 글 · 버튼 위는 안 넘겨요)
                    if (turn || DRT.drag || e.target.closest('.element-box, button, textarea, input, select, .dr-h')) return false;   // 🔄 모서리 손잡이는 안 넘겨요
                    const edge = isCoverOpen ? curlEdgeAt(dyIn(e.clientX, e.clientY)[0], book) : 0;   // 🔄 돌린 다이어리 = 종이 끝 기준 (현실처럼)
                    return isCoverOpen && !edge ? false : edge;
                },
                start: dir => {
                    if (!isCoverOpen && dir === -1) return null;
                    if (isCoverOpen && window.dyHalf && dyHalf(dir)) return null;   // 📱 펼침면 : 같은 날 왼쪽 ↔ 오른쪽 쪽 (js/skins.js)
                    return beginCurl(!isCoverOpen, dir) ? curlCtx() : null;
                }
            });                                                                  // 겉표지는 톡으로 안 열려요 · 밀어서만 (도련 10-31 : 현실처럼)
        }

        /* ✋ 페이지 옮기기 : 다이어리를 연 뒤 위쪽 날짜바(#pageHeader)를 누른 채 끌면 배경 안에서 마음대로 옮겨져요 (겉표지는 가운데 고정 · 페이지 여백을 끌면 안 옮겨져요)
           - 살짝 누르기(탭)는 그대로 날짜바 버튼 (BOOK_MOVE 8px 넘게 끌어야 옮겨져요 · js/book.js bookMover) · 양쪽 끝은 그대로 페이지 넘기기
           - 옮긴 자리는 기억하지 않아요 : 앱을 켜거나 로그인해서 다이어리를 열면 늘 가운데에서 시작 · 화면 크기가 바뀌어도 배경 밖으로 안 나가게 맞춰요
           - #diaryWrapper 의 left · top 만 바꿔요 (페이지 안 좌표 posX · posY 는 그대로라 스티커 자리는 안 바뀌어요)
           - 🏷️ 씰 종이 · 🧩 봉투 · 📄 모조지스티커가 떠 있을 때는 날짜바 위에서 누른 손가락을 그 화면이 pgmOnBar 로 보고 pgmBegin 으로 넘겨줘요 */
        let pgmPos = { x: 0, y: 0 };
        function pgmApply() {
            const w = document.getElementById('diaryWrapper');
            if (!isCoverOpen) { w.style.left = w.style.top = '0px'; return; }   // 겉표지는 늘 가운데 (옮긴 자리는 열고 나서부터)
            const r = w.getBoundingClientRect();
            const l = r.left - (parseFloat(w.style.left) || 0), t = r.top - (parseFloat(w.style.top) || 0);   // 옮기기 전 자리
            const cv = document.documentElement.classList.contains('desk-wide') && document.querySelector('#dyBack > .dy-cov');
            if (cv) {                                                              // 💻 📲 펼친 다이어리는 왼쪽 · 오른쪽 · 아래로 반까지 화면 밖으로 (스티커 바인더를 옆에 펴 두고 쓰기 좋게 · 도련 11-03) · 위는 날짜바가 보이게 그대로
                const F = cv.getBoundingClientRect(), fl = F.left - (parseFloat(w.style.left) || 0), ft = F.top - (parseFloat(w.style.top) || 0);
                pgmPos = { x: Math.round(clampNum(pgmPos.x, -fl - F.width / 2, window.innerWidth - fl - F.width / 2)), y: Math.round(clampNum(pgmPos.y, -t, window.innerHeight - ft - F.height / 2)) };
            } else pgmPos = { x: Math.round(clampNum(pgmPos.x, -l, window.innerWidth - l - r.width)), y: Math.round(clampNum(pgmPos.y, -t, window.innerHeight - t - r.height)) };
            w.style.left = pgmPos.x + 'px'; w.style.top = pgmPos.y + 'px';
        }
        function pgmOnBar(x, y) { const h = document.getElementById('pageHeader'), r = h && h.getBoundingClientRect(); return !!r && isCoverOpen && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
        let PGM = null;                                                       // ✋ 날짜바 끌기 = 공통 (js/book.js bookMover · 📒 🤍 책 엔진 막대와 같아요 · 도련 11-15 · 2-3)
        function pgmBegin(e) {
            if (!isCoverOpen || turn || !PGM) return false;
            return PGM.begin(e);
        }
        function setupPageMove() {
            const wrapper = document.getElementById('diaryWrapper'), book = document.getElementById('diaryBook');
            pgmApply();
            PGM = bookMover({ el: wrapper, from: () => pgmPos, to: (x, y) => { pgmPos = { x, y }; pgmApply(); positionTextPanel(); }, wait: () => !!turn,
                on: () => { wrapper.classList.add('pgm-on'); if (window.tmClose) tmClose(); }, off: () => wrapper.classList.remove('pgm-on') });
            wrapper.addEventListener('pointerdown', (e) => {
                if (!isCoverOpen || turn || PGM.busy()) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                if (!e.target.closest('#pageHeader') || e.target.closest('input, select, .tap-menu')) return;   // 날짜바만 (버튼 위에서 끌어도 옮겨져요 · 살짝 누르면 그대로 버튼)
                if (curlEdgeAt(dyIn(e.clientX, e.clientY)[0], book)) return;
                pgmBegin(e);
            });
            /* ✏️ 🪡 문구를 들고 있어도 (그리는 중 · 핀셋 · 가위 · 칼 …) 날짜바를 잡으면 다이어리가 옮겨져요 (도련 11-05)
               그리는 중엔 날짜바가 펜 판 아래라 손가락이 안 닿아요 → 자리로 보고 먼저 받아요 · 날짜바의 버튼 위면 톡은 그대로 버튼 */
            window.addEventListener('pointerdown', (e) => {
                if (!isCoverOpen || turn || PGM.busy() || (e.pointerType === 'mouse' && e.button !== 0) || !pgmOnBar(e.clientX, e.clientY)) return;
                const t = e.target && e.target.closest ? e.target : document.body;
                if (t.closest('input, select, .tap-menu, .modal, .dkw-room')) return;
                const held = document.body.classList.contains('draw-on') || document.querySelector('#innerPage > .bd-tool.held, .sk-knife.held, .pc-held:not([hidden]), .pin-cur, .scs-cur');
                if (!held || !pgmBegin(e)) return;
                if (!t.closest('button')) { e.stopPropagation(); e.preventDefault(); }
            }, true);
            wrapper.addEventListener('click', (e) => {                // 끌고 난 뒤의 클릭은 팝업메뉴 · 날짜 버튼으로 안 가요
                if (PGM.noClick()) { e.stopPropagation(); e.preventDefault(); }
            }, true);
        }

        const clampNum = clampN;   // 🧰 js/util.js

        function canvasOfPage(pw, ph) {
            return { w: pw - PAGE_BORDER * 2, h: ph - PAGE_BORDER * 2 - PAGE_HEADER_H };
        }
        function getPageSize() {
            const b = document.getElementById('diaryBook');
            return { w: b.clientWidth * 2, h: b.clientHeight };                // 📖 펼친 두 쪽이 한 장 (js/skins.js)
        }

        /* 📏 붙인 것 저장 = 쪽 기준 mm (도련 11-16 : 하루 = 펼친 두 쪽 = json 하나 · 기기 · 화면 크기와 상관없이 같은 자리 · 같은 크기)
           하나마다 p = 쪽 ('l' 왼쪽 · 'r' 오른쪽 · 가운데 점이 있는 쪽 · 📌 바인더 가운데 틈 근처는 놓인 쪽) · x, y = 그 쪽 종이 왼쪽 위 → 가운데 mm · W = 보이는 가로 mm (돌리기 전)
           화면 종이 (#canvasArea) : 1mm = 높이 ÷ 규격 세로 · 두 쪽 종이를 가운데에 맞붙인 자리 (링 바인더 = 링을 연 자리 · 끼운 동안은 css 가 틈의 반씩 비켜 보여요) */
        function pgCanvas() { const p = getPageSize(); return canvasOfPage(p.w, p.h); }
        function pgGeo(cv) { const mm = (window.dyMmOf && dyMmOf()) || [105, 148], k = cv.h / mm[1], lx = (cv.w - mm[0] * k * 2) / 2; return { k, mm, lx, rx: lx + mm[0] * k, gh: (window.dyGapMm ? dyGapMm() : 0) / 2 * k }; }   // lx · rx = 두 쪽 맞붙인 자리 (가운데 = 이음매) · gh = 링에 끼운 동안 바깥으로 비키는 만큼 (틈의 반)
        function pgToMm(g, cv, pin) {                                          // g = { posX, posY, scale, boxW, boxH } (화면) → { p, x, y, W }
            const G = pgGeo(cv), s = parseFloat(g.scale) || 1, cx = (parseFloat(g.posX) || 0) + g.boxW / 2, cy = (parseFloat(g.posY) || 0) + g.boxH / 2;
            const near = Math.abs(cx - cv.w / 2) < 8 * G.k, p = near && (pin === 'l' || pin === 'r') ? pin : cx < cv.w / 2 ? 'l' : 'r', r1 = v => Math.round(v * 10) / 10;   // 📌 놓인 쪽은 가운데 8mm 안에서만
            return { p, x: r1((cx - (p === 'r' ? G.rx : G.lx)) / G.k), y: r1(cy / G.k), W: Math.round(g.boxW * s / G.k * 100) / 100 };
        }
        function pgFromMm(d, cv) {                                             // { side, mx, my, mw, boxW, boxH } → { posX, posY, scale } (화면)
            const G = pgGeo(cv), cx = d.mx * G.k + (d.side === 'r' ? G.rx : G.lx), cy = d.my * G.k, s = d.boxW > 0 && d.mw > 0 ? d.mw * G.k / d.boxW : 1;
            return { posX: cx - d.boxW / 2, posY: cy - d.boxH / 2, scale: s };
        }
        window.pgToMm = pgToMm; window.pgFromMm = pgFromMm; window.pgCanvas = pgCanvas; window.pgGeo = pgGeo;
        /* 🖼 하루 장 미리보기 (도련 11-18 : 같은 날 파일이 둘일 때 두 장을 보여 주고 고르게 · 알아볼 수 있을 만큼 작게)
           day = 하루 장 json ({ v: 4, i, sj, mo, we }) · w = 펼친 두 쪽 그림 폭 px · 드라이브 요청 없음 (이미 받은 글로 그려요)
           그리기 = 붙인 것 자리 (쪽 · mm) · 크기 (W) · 돌기 · 겹침 순서 · 그림 · 글 · 속지 (정확한 다이어리 모습이 아니라 알아보기용) */
        function dayPreviewHtml(day, w) {
            const mm = (window.dyMmOf && dyMmOf()) || [105, 148], W = w || 300, k = W / (mm[0] * 2), H = Math.round(mm[1] * k);
            const esc = htmlEsc;   // 🧰 js/util.js (' 도 바꿔요 = 화면에 보이는 건 같아요)
            const sj = (day && day.sj) || {}, side = s => { const o = sj[s]; if (!o) return ''; const src = o.s ? (sj.l && sj.l.i) : o.i; return src ? `<img src="${esc(src)}" style="position:absolute;left:${s === 'r' ? '50%' : 0};top:0;width:50%;height:100%;object-fit:cover;opacity:.9">` : ''; };
            const font = id => { try { const f = (window.fontList || (typeof fontList !== 'undefined' ? fontList : [])).find(x => x.id === id); return f ? f.css : ''; } catch (e) { return ''; } };
            const items = ((day && day.i) || []).slice().sort((a, b) => (a.z || 0) - (b.z || 0)).map(it => {
                const cx = ((it.p === 'r' ? mm[0] : 0) + (+it.x || 0)) * k, cy = (+it.y || 0) * k, bw = +it.bw || +it.w || 100, bh = +it.bh || +it.h || 100;
                const ww = (+it.W || bw / 4) * k, hh = ww * bh / bw, s = ww / bw;
                const box = `position:absolute;left:${(cx - ww / 2).toFixed(1)}px;top:${(cy - hh / 2).toFixed(1)}px;width:${ww.toFixed(1)}px;height:${hh.toFixed(1)}px;transform:rotate(${+it.r || 0}deg);overflow:hidden`;
                if (it.t === 'i') return `<img src="${esc(typeof slimDec === 'function' ? slimDec(it.c) : it.c)}" style="${box};object-fit:contain">`;
                if (it.t === 't' || it.t === 's') {
                    const bg = it.tb ? `background:url('${esc(typeof slimDec === 'function' ? slimDec(it.tb) : it.tb)}') center/100% 100%;` : '';
                    return `<div style="${box};${bg}font-size:${Math.max(4, (+it.fs || 18) * s).toFixed(1)}px;line-height:1.2;color:${esc(it.k || '#444')};font-family:${esc(font(it.f) || 'inherit')};white-space:pre-wrap;word-break:break-all">${esc(it.c)}</div>`;
                }
                return `<div style="${box};display:grid;place-items:center;font-size:${Math.max(8, hh * .6).toFixed(0)}px">🧸</div>`;
            }).join('');
            return `<div class="dpv" style="position:relative;width:${W}px;height:${H}px;background:#fffdf8;border:1.5px solid #f1c6d6;border-radius:6px;overflow:hidden;box-sizing:content-box">${side('l')}${side('r')}<i style="position:absolute;left:50%;top:0;bottom:0;border-left:1px dashed #f1c6d6"></i>${items}</div>`;
        }
        window.dayPreviewHtml = dayPreviewHtml;
        /* 🖼 물음 창에 '그게 뭔지' 보여 주기 (도련 11-19 : 임시보관 · 이어서 하기 같은 물음은 글만 보면 뭔지 몰라요) : txt = 하루 장 글 · sub = 아래 작은 글 · 못 그리면 '' */
        function dayPreviewCard(txt, sub, w) {
            let d = null; try { d = typeof txt === 'string' ? JSON.parse(txt) : txt; } catch (e) { return ''; }
            if (!d || typeof d !== 'object') return '';
            const W = w || Math.max(160, Math.min(280, (window.innerWidth || 360) - 90)), n = Array.isArray(d.i) ? d.i.length : 0;
            return `<div class="dpv-card" style="display:flex;flex-direction:column;align-items:center;gap:4px;margin:10px 0 4px">${dayPreviewHtml(d, W)}${sub === false ? '' : `<span style="font-size:11px;color:#777">${sub ? sub + ' · ' : ''}붙인 것 ${n}개</span>`}</div>`;   // sub = false → 그림만 (아래 글 없이)
        }
        window.dayPreviewCard = dayPreviewCard;
        function convertGeometry(g, fromPage, toPage) {
            const a = canvasOfPage(fromPage.w, fromPage.h), b = canvasOfPage(toPage.w, toPage.h);
            if (a.w <= 0 || a.h <= 0 || b.w <= 0 || b.h <= 0) return g;
            const px = parseFloat(g.posX) || 0, py = parseFloat(g.posY) || 0;
            const sc = parseFloat(g.scale) || 1;
            const w = g.boxW || 0, h = g.boxH || 0;
            const k = Math.sqrt((b.w / a.w) * (b.h / a.h));                     // 크기 = 가로 · 세로 비율의 가운데 (찌그러지지 않게 · 갔다 오면 그대로 : 예전 '덜 바뀐 쪽'은 작은 화면을 다녀오면 조금씩 줄었어요 · 도련 11-10)
            const cx = (px + w / 2) * (b.w / a.w);
            const cy = (py + h / 2) * (b.h / a.h);
            return { posX: cx - w / 2, posY: cy - h / 2, scale: sc * k };
        }

        function rescaleLiveElements(fromPage, toPage) {
            document.querySelectorAll('#canvasArea .element-box').forEach(el => {
                const c = convertGeometry({ posX: el.dataset.posX, posY: el.dataset.posY, scale: el.dataset.scale,
                                            boxW: el.offsetWidth, boxH: el.offsetHeight }, fromPage, toPage);
                el.dataset.posX = c.posX; el.dataset.posY = c.posY; el.dataset.scale = c.scale;
                el.style.transform = `translate(${c.posX}px, ${c.posY}px) scale(${c.scale}) rotate(${el.dataset.rotation || 0}deg)`;
            });
        }

        function refreshLayout() {
            if (window.dkBgSync) dkBgSync();                                      // 📖 🪑 표지를 펼치면 책상 대신 바탕 · 덮으면 책상 (js/desk.js · 도련 11-12)
            if (turn) { layoutDirty = true; return; }
            const ae = document.activeElement;
            if (ae && ae.tagName === 'TEXTAREA') return;
            layoutDirty = false;

            const wrapper = document.getElementById('diaryWrapper');
            const toolbar = document.querySelector('.toolbar');
            const maxW = Math.floor(window.innerWidth * 0.92);
            const tbM = parseFloat(toolbar.style.marginTop) || 10, tbH = toolbar.offsetHeight + tbM - 10;   // 하단 메뉴 자리 (지난번에 늘린 여백은 빼고)
            const maxH = Math.floor(window.innerHeight - tbH - 8 - 24);
            const dy = dySize();                                                // 📒 고른 다이어리 한 쪽 크기 (비율 지키며 화면에 맞춰요 · js/skins.js)
            /* 📏 다이어리 뒤 표지판(.dy-cov · 바인더 테두리)이 종이 밖으로 나온 만큼도 화면 안에 (도련 11-10 : 하단 메뉴와 겹쳐요 · 어떤 크기든 메뉴는 다이어리 밑 · 폰도 화면 밖으로 안 나가게)
               나온 비율(종이 높이 대비)을 다이어리 모양마다 기억해요 → 덮개를 덮고 있어도 펼쳤을 때와 같은 자리 */
            const ip = document.getElementById('innerPage'), ovKey = (ip && ip.dataset.dy || '') + (dy.two ? '2' : '1') + (UI.phone() ? 'p' : '');
            const tbOn = !!toolbar.offsetParent, ov = (tbOn && (window.dyOvRat = window.dyOvRat || {})[ovKey]) || { t: 0, b: 0 };   // 🪑 책상(하단 메뉴 없음)은 그대로
            const fit = s => Math.min(1, maxW / (s.w * (dy.two ? 2 : 1)), maxH / (s.h * (1 + ov.t + ov.b)));   // 💻 양쪽 보기는 두 쪽이 화면에 들어가게
            const k = fit(dy);   // 📏 펼친 다이어리 = 실제 크기 (규격 mm × MM_PX · js/skins.js) · 그 다이어리가 화면에 닿을 때부터 줄어요 (도련 11-16 : 기준 A5 틀 없앰)
            const h = Math.round(dy.h * k);
            { const mm = (window.dyMmOf && dyMmOf()) || [105, 148]; wrapper.style.setProperty('--mm', (MM_PX * k).toFixed(4) + 'px'); wrapper.style.setProperty('--pmw', mm[0]); wrapper.style.setProperty('--pmh', mm[1]); const g = (window.dyGapMm ? dyGapMm() : 0) * MM_PX * k; wrapper.style.setProperty('--gap', g.toFixed(2) + 'px'); wrapper.style.setProperty('--gh', (g / 2).toFixed(2) + 'px'); }   // 📏 종이 위 1mm · 규격 (css 속지 · 내지 무늬)
            wrapper.style.width = Math.round(dy.w * k) + 'px'; wrapper.style.height = h + 'px';
            wrapper.style.marginTop = ov.t ? Math.round(ov.t * h) + 'px' : '';
            toolbar.style.marginTop = ov.b ? Math.round(10 + ov.b * h) + 'px' : '';

            const now = getPageSize();
            if (isCoverOpen && liveSize && (liveSize.w !== now.w || liveSize.h !== now.h)) {
                rescaleLiveElements(liveSize, now);
                positionTextPanel();
            }
            liveSize = now;
            pgmApply();
            if (window.dyDeco) dyDeco();
            const covs = tbOn && isCoverOpen && ip && ip.offsetParent ? [...wrapper.querySelectorAll('.dy-cov')].map(c => c.getBoundingClientRect()).filter(r => r.height) : [];   // 펼쳐 있을 때만 재요 (책 뒤판 #dyBack · 종이 뒤판)
            if (covs.length && h > 0) {
                const r = { top: Math.min(...covs.map(c => c.top)), bottom: Math.max(...covs.map(c => c.bottom)) }, w = wrapper.getBoundingClientRect();
                {
                    const n = { t: Math.max(0, (w.top - r.top) / h), b: Math.max(0, (r.bottom - w.bottom) / h) };
                    if (Math.abs(n.t - ov.t) > .004 || Math.abs(n.b - ov.b) > .004) { window.dyOvRat[ovKey] = n; if (!refreshLayout.again) { refreshLayout.again = true; try { refreshLayout(); } finally { refreshLayout.again = false; } } }
                }
            }
            dySizeDiag('lay');
            if (isCoverOpen) { if (DRT.a) { const f = drFit(DRT.a); drApply(DRT.a, f.s, false, f.t); } drPlace(); }   // 🔄 모서리 손잡이 · 돌린 채 화면이 바뀌면 다시 맞춤
        }
        /* 🧾 다이어리 크기 기록 (도련 11-19 · 1314 "창을 살짝 조절하니까 다이어리 규격이 바뀌었어" · 여기선 재현이 안 돼서) : 다이어리 모양 · 크기가 바뀔 때만 문제 기록에 한 줄 (js/drive.js diag 'dysize')
           📊 상황판 → 🧾 기록 → 📋 복사 → Claude 에게 · 원인을 찾으면 지워요 */
        let dyDiagKey = '', dyDiagT = 0;
        function dySizeDiag(why, force) {
            try {
                if (!window.diag) return;
                const w = document.getElementById('diaryWrapper'), cp = document.getElementById('coverPage'); if (!w) return;
                const R = el => { if (!el || !el.offsetParent) return null; const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
                const t = window.dyLook ? dyLook() : null, d = dySize(), wr = R(w), cr = R(cp), vo = document.querySelector('#deskStage .dk-vol.cur'), vr = vo && vo.offsetParent ? (r => [Math.round(r.width), Math.round(r.height)])(vo.getBoundingClientRect()) : null;
                const key = [t && t.id, t && t.mm, d.w, d.h, d.two, wr && (wr[0] / wr[1]).toFixed(2), cr && (cr[0] / cr[1]).toFixed(2), vr && (vr[0] / vr[1]).toFixed(2), document.documentElement.classList.contains('desk-show') ? 1 : 0].join('|');
                if (key === dyDiagKey && !force) return;
                const H = document.documentElement.classList, first = !dyDiagKey; dyDiagKey = key;
                diag('dysize', { why, first: first ? 1 : undefined, look: t ? `${t.id} ${t.n || ''} ${t.mm || ''}` : '-', dy: [d.w, d.h, d.two ? 2 : 1], css: [w.style.width, w.style.height], wrap: wr, cover: cr,
                    cvCls: cp ? cp.className : '', vol: vr ? vr.concat([vo.className.replace(/^dk-vol\s*/, ''), vo.style.width, vo.style.height, vo.dataset.b || '']) : null, win: [innerWidth, innerHeight], open: isCoverOpen ? 1 : 0, mode: ['desk-on', 'desk-wide', 'desk-show', 'dk-bgon', 'dk-landing'].filter(c => H.contains(c)).join(' ') });
            } catch (e) {}
        }
        function dySizeWatch() {                                                 // 다시 맞추지 않고 모양만 바뀌어도 (css) 잡아요 · 🪑 떠오르기 · 내려앉기 · 창 크기 (1327)
            let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => dySizeDiag('resize', 1), 500); });
            if (window.MutationObserver) { let had = document.documentElement.classList.contains('desk-show'); new MutationObserver(() => { const now = document.documentElement.classList.contains('desk-show'); if (now !== had) { had = now; setTimeout(() => dySizeDiag(now ? 'show' : 'down', 1), 900); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); }
            if (!window.ResizeObserver) return;
            const ro = new ResizeObserver(() => { clearTimeout(dyDiagT); dyDiagT = setTimeout(() => dySizeDiag('ro'), 400); });
            ['diaryWrapper', 'coverPage'].forEach(id => { const el = document.getElementById(id); if (el) ro.observe(el); });
            const vw = () => { const v = document.querySelector('#deskStage .dk-vol.cur'); if (v && !v._dyRo) { v._dyRo = 1; ro.observe(v); } };   // 🪑 책상 위 그 권 그림 (다시 그리면 새 것)
            vw(); const st = document.getElementById('deskStage'); if (st && window.MutationObserver) new MutationObserver(vw).observe(st, { childList: true });
        }

        function setupLayout() {
            dySizeWatch();
            window.addEventListener('resize', refreshLayout);
            document.addEventListener('focusout', () => setTimeout(refreshLayout, 300));
            if (window.ResizeObserver) new ResizeObserver(refreshLayout).observe(document.querySelector('.toolbar'));
            refreshLayout();
        }



/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['page'] = true;
