/* 말랑달콤 다이어리 - js/skins.js
   🌈 전체 배경지 적용/저장/불러오기 · 📒 다이어리 창 · 📔 다이어리 (스킨 · 나만의 다이어리는 11-05 도련 : 없앴어요)
   - 고른 배경지는 설정값 'diary_bg_pattern' 으로 저장 → 구글 드라이브 설정.json 에 함께 저장돼요
       예) "diary_bg_pattern": {"id":"tomato","scale":1}
   - 배경지 해제 시 이 값을 지워요 (설정.json 에서도 빠짐)
   - 목록 배치(한 줄에 몇 개·몇 줄·크기)는 기기마다 화면이 달라서 이 기기(localStorage)에만 기억
   - 배경지 출처 : 받은 배경지(🌈 보관함 · js/bgown.js) · 내 배경지('my:번호' · js/pattern-maker.js)
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → patterns → pattern-recipe → skins → pattern-maker → service */

        const BG_PATTERN_KEY = 'diary_bg_pattern';
        const PATTERN_SCALE_MIN = 0.5, PATTERN_SCALE_MAX = 2;

        let bgPattern = null;              // 지금 적용된 배경지 { id, scale, r? } (없으면 null)

        /* id로 패턴 찾기 → { id, tier, name, css, by? } */
        function findBgPattern(id) {
            if (typeof id !== 'string') return null;
            if (id.startsWith('my:')) {
                return (typeof getMyPatternItems === 'function' ? getMyPatternItems() : []).find(p => p.id === id) || null;
            }
            return BG_PATTERNS.find(p => p.id === id) || null;
        }
        function currentBgPattern() { return bgPattern ? findBgPattern(bgPattern.id) : null; }
        function clampPatternScale(v) {
            const n = parseFloat(v);
            return isNaN(n) ? 1 : Math.max(PATTERN_SCALE_MIN, Math.min(PATTERN_SCALE_MAX, Math.round(n * 100) / 100));
        }

        /* ---------- 화면에 그리기 (저장은 하지 않음) ---------- */
        function paintPatternInto(el, p) {
            el.style.backgroundColor = ''; el.style.backgroundImage = '';
            el.style.backgroundSize = ''; el.style.backgroundPosition = '';
            if (p) Object.assign(el.style, p.css);
        }

        function renderBgPattern() {
            const layer = document.getElementById('bgPatternLayer');
            const inner = document.getElementById('bgPatternInner');
            const p = currentBgPattern();
            paintPatternInto(inner, p);
            layer.style.setProperty('--pat-s', p ? bgPattern.scale : 1);
            document.documentElement.classList.toggle('bg-pattern-on', !!p);
            updatePatternUI();
        }

        /* ---------- 저장 : 설정(설정.json)에 id와 크기만 저장 ---------- */
        function saveBgPattern() {
            if (bgPattern) {
                const v = { id: bgPattern.id, scale: bgPattern.scale };
                store.setItem(BG_PATTERN_KEY, JSON.stringify(v));
            }
            else if (store.getItem(BG_PATTERN_KEY) !== null) store.removeItem(BG_PATTERN_KEY);
        }

        /* ---------- 불러오기 : 드라이브 설정을 읽은 뒤 / PC 백업 불러온 뒤 호출 ----------
           값이 없거나, 깨졌거나, 목록에 없는 배경지가면 배경지 없이 표시 (저장된 값은 건드리지 않음) */
        function loadBgPattern() {
            let v = null;
            try { v = JSON.parse(store.getItem(BG_PATTERN_KEY)); } catch (e) { v = null; }
            bgPattern = (v && typeof v === 'object' && findBgPattern(v.id))
                ? { id: v.id, scale: clampPatternScale(v.scale) } : null;
            renderBgPattern();
        }

        async function selectBgPattern(id) {
            if (id.startsWith('my:') && !findBgPattern(id) && !(typeof patEnsure === 'function' && await patEnsure(id.slice(3)))) {
                showMsg('⚠ 이 배경지를 불러오지 못했어요.<br><span style="font-size:12px;color:#777;">인터넷 연결을 확인해 주세요.</span>'); return;
            }
            const p = findBgPattern(id);
            if (!p) return;
            bgPattern = { id, scale: bgPattern ? bgPattern.scale : 1 };
            renderBgPattern();
            saveBgPattern();
            renderPatternList();
        }

        function clearBgPattern() {
            if (!bgPattern) return;
            bgPattern = null;
            renderBgPattern();
            saveBgPattern();
            renderPatternList();
        }

        /* 패턴 크기 : 움직이는 동안은 미리보기만, 손을 떼면 저장 */
        function onPatternScaleInput(save) {
            if (!bgPattern) return;
            bgPattern.scale = clampPatternScale(document.getElementById('patScaleInput').value);
            renderBgPattern();
            if (save) saveBgPattern();
        }

        /* ---------- 스킨 창 : 제목을 끌어서 옮기기 · 👀 꾹 눌러 다이어리 보기 ----------
           페이지 색을 바꾸면서 뒤의 다이어리가 어떻게 바뀌는지 볼 수 있게 */
        (function setupSkinWindows() {
            const moved = new Set();
            const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
            /* ✋ 하단 메뉴 '다이어리' · '스티커' 에서 뜨는 창은 모두 위 제목 줄을 잡고 옮겨요 (도련 10-19 · 📒 수첩으로 뜬 창은 js/stknote.js snbMovable) */
            const WIN_IDS = ['skinModal', 'patternModal', 'makerModal', 'stickerToolModal', 'stickerSrcModal', 'leafMakeModal', 'basketModal', 'basketKindModal', 'shelfKindModal', 'paperModal', 'tteokModal', 'leafModal', 'deskBoxModal'];   /* 📦 소품함도 (도련 10-28) */
            document.querySelectorAll('.modal.skin-float, ' + WIN_IDS.map(id => '#' + id).join(', ')).forEach(modal => {
                const box = modal.querySelector('.modal-content');
                const title = box && box.querySelector('.modal-title');
                if (!title) return;
                title.classList.add('drag-title');
                title.title = '끌어서 창을 옮길 수 있어요';
                let start = null;
                box.addEventListener('pointerdown', e => {
                    if (e.button > 0 || modal.classList.contains('snb-on') || e.target.closest('button, input, select, textarea')) return;   // 제목 줄의 ← · ✕ · 👀 버튼은 끌기 아님
                    if (!title.contains(e.target) && !e.target.closest('.win-grip') && !(e.target === box && e.clientY <= title.getBoundingClientRect().bottom)) return;   // 제목 줄 · 그 위 빈 띠 · .win-grip = 제목 없는 창의 손잡이 (🗄️ 스티커 서랍 윗판 · 도련 11-05)
                    start = { x: e.clientX, y: e.clientY, ox: parseFloat(box.style.left) || 0, oy: parseFloat(box.style.top) || 0 };
                    box.setPointerCapture(e.pointerId);
                    e.preventDefault();
                });
                box.addEventListener('pointermove', e => {
                    if (!start) return;
                    const r = box.getBoundingClientRect(), px = parseFloat(box.style.left) || 0, py = parseFloat(box.style.top) || 0;
                    /* 창이 화면 밖으로 나가지 않게 (창 전체가 화면 안에) */
                    const baseL = r.left - px, baseT = r.top - py;
                    const x = clamp(start.ox + e.clientX - start.x, -baseL, Math.max(-baseL, window.innerWidth - r.width - baseL));
                    const y = clamp(start.oy + e.clientY - start.y, -baseT, Math.max(-baseT, window.innerHeight - r.height - baseT));
                    moved.add(modal.id);
                    box.style.position = 'relative'; box.style.left = x + 'px'; box.style.top = y + 'px';   // transform 이 아니라 left · top : 창이 따로 겹 층을 만들지 않아야 ← · ✕ 버튼이 테이프 위에 나와요
                    box.dispatchEvent(new Event('dk-move'));                   // 모서리 테이프도 창을 따라가게 (js/dakku.js dkTapes)
                });
                const end = () => { start = null; };
                box.addEventListener('pointerup', end);
                box.addEventListener('pointercancel', end);
            });
            /* 화면 크기가 바뀌면(폰 돌리기 등) 옮겨 둔 창은 가운데로 */
            window.addEventListener('resize', () => {
                moved.forEach(id => { const m = document.getElementById(id), b = m && m.querySelector('.modal-content'); if (b && !m.classList.contains('snb-on')) { b.style.left = b.style.top = ''; b.dispatchEvent(new Event('dk-move')); } });
                moved.clear();
            });
            /* 👀 버튼 : 누르고 있는 동안 창을 투명하게 */
            document.querySelectorAll('.skin-peek-btn').forEach(btn => {
                const box = btn.closest('.modal-content');
                const on = e => { e.preventDefault(); box.classList.add('peeking'); };
                const off = () => box.classList.remove('peeking');
                btn.addEventListener('pointerdown', on);
                ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, off));
                btn.addEventListener('contextmenu', e => e.preventDefault());
            });
        })();
        function backToSkinMenu(fromId) {
            closeModal(fromId);
            openModal('skinModal');
        }


        /* ---------- 🌈 배경지 목록 (라이브러리처럼 페이지 넘기기 + 배치 설정) ---------- */
        const PAT_LAYOUT_KEY = 'malang_pattern_layout';
        const PAT_DEFAULT_LAYOUT = { rows: 3, cols: 3, size: 100 };
        const PAT_LAYOUT_LIMITS = { rows: [1, 8], cols: [1, 8], size: [60, 180] };
        const PAT_GAP = 10;
        let patLayout = loadPatLayout();
        let patTier = 'free';
        let patPage = 0;
        let patSwiped = false;

        function loadPatLayout() {
            const out = Object.assign({}, PAT_DEFAULT_LAYOUT);
            let saved = null;
            try { saved = JSON.parse(localStorage.getItem(PAT_LAYOUT_KEY)); } catch (e) {}
            if (saved && typeof saved === 'object') {
                Object.keys(PAT_LAYOUT_LIMITS).forEach(k => {
                    const n = parseInt(saved[k], 10), lim = PAT_LAYOUT_LIMITS[k];
                    if (!isNaN(n)) out[k] = Math.max(lim[0], Math.min(lim[1], n));
                });
            }
            return out;
        }
        function savePatLayout() { try { localStorage.setItem(PAT_LAYOUT_KEY, JSON.stringify(patLayout)); } catch (e) {} }

        /* 배경지 칸 (스티커 창과 같은 이름) : 기본 = 페이지 4색 바탕 · 내가만든 (10-18 숨김) · 공유받은 = 📥 파일로 받은 것 + 🌟 등록된 사용자 배경지
           이벤트 = 앞으로 이벤트로 나눠 줄 배경지 (아직 없어서 칸이 숨어 있어요) · 문구점 = 🛍️ 문구점 가기 */
        /* 🎨 기본 칸 안의 카테고리 : 단색(페이지 4색 바탕 c-…) · 패턴(줄무늬 · 도트 · 체크) */
        const PAT_SUBS = [['solid', '단색'], ['pat', '패턴']];
        const patG = p => p.g || (/^c-/.test(String(p.id)) ? 'solid' : 'pat');
        let patSub = 'solid';
        function patCatsPaint() {
            const box = document.getElementById('patCats'); if (!box) return;
            box.hidden = patTier !== 'free';
            if (box.hidden) return;
            box.innerHTML = PAT_SUBS.map(([v, n]) => `<button type="button" class="lib-cat${v === patSub ? ' on' : ''}" onclick="setPatSub('${v}')">${n}<small>${window.bgoItems ? bgoItems(v).length : 0}</small></button>`).join('');
        }
        function setPatSub(v) { patSub = v; patPage = 0; renderPatternList(); }
        window.setPatSub = setPatSub;
        function patItems() {
            if (patTier === 'mine') return typeof patListItems === 'function' ? patListItems('mine').items : [];   // 🌈 내가만든 : 모음의 작은 그림 (js/pattern-maker.js)
            if (patTier === 'free') return window.bgoItems ? bgoItems(patSub) : [];   // 기본 칸 = 🌈 내 배경지 보관함 (받은 것만 · 🎨 단색 · ☁️ 패턴 · js/bgown.js · 도련 10-28)
            return [];
        }
        function patPerPage() { return patLayout.rows * patLayout.cols; }
        /* 내가만든 칸 : 아직 안 읽은 묶음이 있어요 */
        function patMore() { return patTier === 'mine' && typeof patListItems === 'function' && patListItems(patTier).more; }
        function patPageCount() { const n = patItems().length; return n ? Math.ceil(n / patPerPage()) : 0; }

        function openPatternList(tier) {
            tier = { my: 'mine' }[tier] || tier;
            if (!STK_TABS.some(t => t[0] === tier)) {                                  // 칸을 안 정했으면 지금 쓰는 배경지가 있는 칸부터
                const id = bgPattern ? String(bgPattern.id) : '';
                const mine = id.startsWith('my:') && (getMyPatternItems().find(p => p.id === id) || {});
                tier = mine ? 'mine' : 'free';
            }
            const bar = document.getElementById('patTabs');
            if (bar) bar.innerHTML = stkTabsOn().filter(([v]) => v !== 'share' && (v !== 'mine' || ftOn('patmine'))).map(([v, n]) => `<button type="button" class="stk-tab" data-tab="${v}" onclick="setPatTab('${v}')">${n}</button>`).join('');   // 🆓 이벤트 · 문구점은 받은 게 있을 때만 (js/stickermaker.js STK_HIDE)
            if (bar && !bar.querySelector(`[data-tab="${tier}"]`)) tier = 'free';
            closeModal('skinModal');
            setPatTab(tier);
            openModal('patternModal');
        }
        function setPatTab(tier) {
            patTier = tier;
            if (tier === 'free' && bgPattern) { const cur = BG_PATTERNS.find(p => p.id === bgPattern.id); if (cur) patSub = patG(cur); }   // 지금 쓰는 것이 있는 카테고리부터
            document.querySelectorAll('#patTabs .stk-tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tier));
            /* 지금 쓰는 패턴이 이 목록에 있으면 그 페이지부터 보여 주기 */
            const idx = bgPattern ? patItems().findIndex(p => p.id === bgPattern.id) : -1;
            patPage = idx >= 0 ? Math.floor(idx / patPerPage()) : 0;
            renderPatternList();
        }
        window.setPatTab = setPatTab;

        function applyPatLayoutStyle() {
            const { rows, cols, size } = patLayout;
            document.getElementById('patGrid').style.gridTemplateColumns = `repeat(${cols}, minmax(0, ${size}px))`;
            document.getElementById('patContent').style.setProperty('--pat-w', (cols * size + (cols - 1) * PAT_GAP + 48) + 'px');
            const fill = (sel, max, val) => {
                if (sel.options.length !== max) { sel.innerHTML = ''; for (let i = 1; i <= max; i++) sel.add(new Option(i, i)); }
                sel.value = val;
            };
            fill(document.getElementById('patRowsInput'), PAT_LAYOUT_LIMITS.rows[1], rows);
            fill(document.getElementById('patColsInput'), PAT_LAYOUT_LIMITS.cols[1], cols);
            document.getElementById('patSizeInput').value = size;
            document.getElementById('patSizeVal').textContent = size + 'px';

            /* 한눈에 보이게 : 작은 칸 그림 + '= 한 페이지 N개' */
            const mini = document.getElementById('patLayoutMini');
            if (mini) {
                mini.style.gridTemplateColumns = `repeat(${cols}, 5px)`;
                if (mini.childElementCount !== rows * cols) { mini.innerHTML = '<i></i>'.repeat(rows * cols); }
            }
            const sum = document.getElementById('patLayoutSum');
            if (sum) sum.textContent = `= 한 페이지 ${rows * cols}개`;
        }

        function renderPatternList() {
            const grid = document.getElementById('patGrid');
            if (!grid) return;
            applyPatLayoutStyle();
            updatePatternUI();
            patCatsPaint();
            grid.innerHTML = '';
            const items = patItems(), per = patPerPage(), pages = patPageCount(), more = patMore();
            if (more && items.length < (patPage + 1) * per) {                 // 이 쪽을 채울 만큼 아직 안 읽었으면 다음 묶음을 읽고 다시 그려요
                const tier = patTier;
                patListMore(tier).then(() => { if (patTier === tier) renderPatternList(); });
            }
            document.getElementById('patStatus').textContent = items.length
                ? `${patTier === 'free' && patSub === 'solid' ? '단색' : '패턴'} ${items.length}${more ? '개 넘게' : '개'} · 누르면 전체 배경에 적용돼요`
                : more ? '불러오는 중…'
                : ({ free: '아직 받은 배경지가 없어요. 🏪 기본상품 샵 → 🌈 배경지에서 받아요!', mine: '아직 만든 배경지가 없어요. 🖼️ 이미지로 · 🖌️ 그려서 배경지에서 만들어 보세요!', event: '🎁 아직 받은 이벤트 배경지가 없어요.', shop: '' }[patTier] ?? '아직 준비된 배경지가 없어요.');
            patPage = pages ? Math.max(0, Math.min(pages - (more ? 0 : 1), patPage)) : 0;
            const start = patPage * per;
            const frag = document.createDocumentFragment();
            items.slice(start, start + per).forEach(p => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'pat-item' + (bgPattern && bgPattern.id === p.id ? ' sel' : '');
                const sw = document.createElement('div');
                sw.className = 'pat-swatch';
                const inner = document.createElement('div');
                inner.className = 'pat-swatch-inner';
                paintPatternInto(inner, p);
                sw.appendChild(inner);
                if (bgPattern && bgPattern.id === p.id) { const c = document.createElement('span'); c.className = 'pat-check'; c.textContent = '✔ 사용 중'; sw.appendChild(c); }
                card.title = p.name || '';
                card.append(sw);
                card.onclick = () => { if (!patSwiped) selectBgPattern(p.id); };
                if (p.u) {                                                     // 🌈 받은 배경지 : 🗑 버리기 (휴지통 30일 · js/bgown.js)
                    const wrap = document.createElement('div'); wrap.className = 'pat-item-wrap';
                    const acts = document.createElement('div'); acts.className = 'pat-actions';
                    const del = document.createElement('button'); del.type = 'button'; del.className = 'btn'; del.textContent = '🗑'; del.title = '휴지통';
                    del.onclick = () => bgoDiscard(p.u);
                    acts.append(del); wrap.append(card, acts); frag.appendChild(wrap);
                } else if (p.tier === 'my') {                                  // 내가만든 : 🗑 삭제
                    const wrap = document.createElement('div');
                    wrap.className = 'pat-item-wrap';
                    const acts = document.createElement('div');
                    acts.className = 'pat-actions';
                    const del = document.createElement('button');
                    del.type = 'button'; del.className = 'btn'; del.textContent = '🗑'; del.title = '삭제';
                    del.onclick = () => deleteMyPattern(p.uid);
                    acts.append(del);
                    wrap.append(card, acts);
                    frag.appendChild(wrap);
                } else frag.appendChild(card);
            });
            for (let k = items.length - start; k < per && pages > 1; k++) {        // 마지막 페이지 빈칸 채우기
                const empty = document.createElement('div');
                empty.className = 'pat-item empty';
                frag.appendChild(empty);
            }
            if (patTier === 'shop') {                                          // 🛍️ 문구점 칸
                const go = document.createElement('button');
                go.type = 'button'; go.className = 'stk-go';
                go.innerHTML = '<span>🛍️</span><b>문구점에서 배경지 보기</b><small>새 창으로 열려요</small>';
                go.onclick = () => openShop('#/c/배경지');
                frag.appendChild(go);
            }
            grid.appendChild(frag);
            document.getElementById('patPageInfo').textContent = pages ? `${patPage + 1} / ${pages}${more ? '+' : ''}` : '0 / 0';
            document.getElementById('patPrevBtn').disabled = !pages || patPage <= 0;
            document.getElementById('patNextBtn').disabled = !pages || (patPage >= pages - 1 && !more);
        }

        function changePatPage(delta) {
            const pages = patPageCount();
            if (!pages) return;
            const next = Math.max(0, Math.min(pages - (patMore() ? 0 : 1), patPage + delta));   // 아직 안 읽은 묶음이 있으면 한 쪽 더 (그리면서 읽어요)
            if (next === patPage) return;
            patPage = next;
            renderPatternList();
        }

        function togglePatLayout() {
            const panel = document.getElementById('patLayoutPanel');
            const open = panel.style.display === 'none';
            panel.style.display = open ? 'flex' : 'none';
            document.getElementById('patLayoutBtn').classList.toggle('on', open);
        }

        function setPatLayout(next) {
            const firstIndex = patPage * patPerPage();
            patLayout = next;
            patPage = Math.floor(firstIndex / patPerPage());
            savePatLayout();
            renderPatternList();
        }
        function onPatLayoutChange() {
            const num = (id, k) => {
                const n = parseInt(document.getElementById(id).value, 10), lim = PAT_LAYOUT_LIMITS[k];
                return isNaN(n) ? patLayout[k] : Math.max(lim[0], Math.min(lim[1], n));
            };
            setPatLayout({ rows: num('patRowsInput', 'rows'), cols: num('patColsInput', 'cols'), size: num('patSizeInput', 'size') });
        }
        function resetPatLayout() { setPatLayout(Object.assign({}, PAT_DEFAULT_LAYOUT)); }

        /* 지금 쓰는 패턴 이름 · 패턴 크기 · 해제 버튼 */
        function updatePatternUI() {
            const p = currentBgPattern();
            const cur = document.getElementById('patCurrent');
            if (cur) { cur.hidden = !p; paintPatternInto(cur, p || null); }                 // 지금 배경지 : 이름 대신 작은 그림
            const none = document.getElementById('patCurrentNone');
            if (none) none.hidden = !!p;
            const sc = document.getElementById('patScaleInput');
            if (sc) {
                sc.disabled = !p;
                sc.value = p ? bgPattern.scale : 1;
                document.getElementById('patScaleVal').textContent = Math.round((p ? bgPattern.scale : 1) * 100) + '%';
            }
            const clr = document.getElementById('patClearBtn');
            if (clr) clr.disabled = !p;
        }

        /* 스마트폰 : 패턴 목록을 옆으로 밀어서 페이지 넘기기 */
        (function setupPatSwipe() {
            const grid = document.getElementById('patGrid');
            let sx = 0, sy = 0, tracking = false;
            grid.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) { tracking = false; return; }
                tracking = true; patSwiped = false;
                sx = e.touches[0].clientX; sy = e.touches[0].clientY;
            }, { passive: true });
            grid.addEventListener('touchend', (e) => {
                if (!tracking) return;
                tracking = false;
                const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    patSwiped = true;
                    changePatPage(dx < 0 ? 1 : -1);
                    setTimeout(() => { patSwiped = false; }, 400);
                }
            });
        })();

        /* 📒 다이어리 고르기 (도련 · 10-17 · 하단메뉴 📒 다이어리 → 📒 다이어리 고르기) : 실제 다이어리처럼 모양 · 크기를 골라요
           - 크기는 실제 다이어리 비율 그대로 (가로 : 세로) · 화면에 맞게 줄여도 비율은 지켜요 (js/page.js refreshLayout 이 dySize() 를 써요)
           - 모양 : 기본 · 6공 링 · 가죽 노트(가죽 + 고무줄) · 문고판 노트(책갈피 끈) · 하드커버(고무밴드) · 한 달 노트(얇은 실제본) · 모두 펼침면 (아래 📖)
           - 꾸밈은 페이지 둘레 그림만 (#dyBack 뒤 커버 · #dyFront 링 · 밴드) · 손으로 누르는 건 막지 않아요 (pointer-events: none)
           - 저장 : 설정.json 'diary_type' · 게스트는 이 기기 'malang_diary_type' */
        const DY_KEY = 'diary_type', DY_LOCAL = 'malang_diary_type';
        /* 📔 기본 다이어리 (도련 · 10-17) : 한 달 노트 크기 · 날짜 기준 · 끝없는 다이어리 · 고르기 창 맨 앞 '기본' 칸
           나머지는 페이지 수가 정해진 다이어리 (유한 · 늘 페이지 기준 · 도련 10-18) · 문구점 디자인이 생기면 그 규격으로 써요
           지금은 규격마다 한 권 (페이지 수 DK_PAGES) · 아래 📕 유한 다이어리
           다꾸러가 실제로 많이 쓰는 모양 · 크기만 (도련 · 10-17)
           ⚠ 브랜드 이름은 절대 쓰지 않아요 (도련 · 10-18 : 팔 때 큰일나요) → 종류 · 규격 이름으로만 (화면 · 폴더 이름 · 코드 모두) */
        /* 🧁 페이지형 다이어리 디자인 = 서버 상품 (상품공방 '페이지바인더' · '페이지노트' · 도련 11-04 : 상품 하나 = 디자인 하나 · 지금 숨김 · 팔 때) : { id, k 종류, g 이름, n 규격, mm, b 묶는 방식(ring · tn · spread · hard · thin), r 세로÷가로, c 색 }
           📔 날짜형(1년 · 기본)은 여기가 아니라 날짜형 디자인 (js/app.js DY_DESIGNS · js/dyyear.js) · 'basic' = 날짜형으로 쓰는 중 (dyNow 가 펼친 권의 모양을 줘요) */
        const DY_TYPES = [], DY_PKINDS = [['페이지바인더', '바인더'], ['페이지노트', '노트']];
        function dyTypesBuild() {                                              // 🧁 서버 상품 그대로
            DY_TYPES.length = 0;
            DY_PKINDS.forEach(([K, k]) => (window.prodList ? prodList(K) : []).forEach(x => {
                const P = x.P || {};                                           // 🔎 상품 그대로 (빠지면 안 나와요)
                const hx = v => /^#[0-9a-f]{6}$/i.test(v || ''), lf = v => window.MK && MK.LEAFS.some(l => l[0] === v), pg = Math.round(+P.쪽수);   // 📐 날짜형과 같은 설계도 (도련 11-05) : 4색 · 쪽수 · 내지(+ 구간)
                if (!(+P.r > 0) || !['ring', 'tn', 'spread', 'hard', 'thin'].includes(P.b) || !String(P.표지색 || '') || !['테두리색', '강조색', '속지색'].every(n => hx(P[n])) || (k === '노트' && (!(pg > 0) || !lf(P.내지))) ||   /* 🗂️ 페이지바인더 = 표지 (내지는 바인더내지 상품 · 981) */ !String(P.이름 || '') || !String(P.규격 || '') || !String(P.mm || '')) { console.warn('🧁 페이지형 다이어리 속성이 모자라요 :', K, x.id); return; }
                const lv = (Array.isArray(P.내지구간) ? P.내지구간 : []).filter(r => Array.isArray(r) && +r[0] >= 1 && +r[1] >= +r[0] && +r[1] <= pg && lf(r[2])).map(r => [+r[0], +r[1], r[2]]);
                const c = (String(P.표지색).match(/#[0-9a-f]{6}/i) || [P.테두리색])[0];   // 책 그림 색 = 표지 첫 색
                DY_TYPES.push({ id: x.id, k, g: String(P.이름), n: String(P.규격), mm: String(P.mm), b: P.b, r: +P.r, c, cols: { 표지색: String(P.표지색), 테두리색: P.테두리색, 강조색: P.강조색, 속지색: P.속지색 }, pg: k === '노트' ? pg : 0, lv: k === '노트' ? lv.reverse().concat([[1, pg, P.내지]]) : [], cvOnly: k === '바인더', rf0: String(P.처음내지 || ''), off: !!P.숨김, gift: !!P.처음받기 && !P.스토어, desk: P.처음책상, float: !!P.처음띄움, ntOn: !!P.공지, cvOk: !!P.표지꾸미기 });   // 🎁 처음 선물 = 상품공방 체크 (도련 11-06 · js/dymaker.js dmkStarter) · 📢 📕 = 상품공방 체크 (도련 11-06 · dyNtOn · dyCvOk)   // 구간 먼저 찾고 · 없으면 기본 내지
            }));
        }
        dyTypesBuild();
        const DY_DEF = 'basic';                                                // 처음 설치하면 기본 다이어리
        const DY_TAB = ['다이어리', '노트', '바인더'];                         // 고르기 창 위 카테고리 = k (도련 · 10-18 : 실물 모양으로 · 저장 폴더는 나누지 않아요 · 다이어리.json kind)
        /* 📕 유한 다이어리 저장 규칙 (도련 · 10-17 · 10-26 폴더 한 줄 : 말랑달콤 / 페이지노트 · 페이지바인더 / <권 id>-… · 아래 폴더 이름 규칙은 이제 안내용) : 말랑달콤 / 다꾸 / 디자인 (규격) [n권] / …
           - 한 권에 폴더 하나 · 그 안 '다이어리.json' 에 id · 디자인 · 규격 · 페이지 수 · 장마다 처음 꾸민 날 (days)
           - 앱은 폴더 이름이 아니라 다이어리.json 의 id 로 찾아요 → 폴더 이름은 사람이 드라이브에서 알아보는 용도
           - 이름 : 드라이브 · 폴더에 못 쓰는 글자는 빼고 · 디자인 이름은 20자까지 · 같은 이름이 있으면 2권, 3권 …
           - 늘 '(규격)' 이 붙어서 앱 폴더 (다꾸 / 기본 · 검색) 와 겹치지 않아요
           - 유한은 늘 페이지 기준 (도련 · 10-18 : 날짜 기준 유한 다이어리는 없앰 · 안 쓴 날이 손해처럼 느껴져서) : … / 1페이지.json
             유한이라 년 · 월 폴더 없이 권 폴더에 바로 (도련 · 10-17 : 폴더를 덜 찾아요)
           - days : { 3: '2026-10-18' } 처럼 장 번호 → 처음 꾸민 날 · 달력(꾸민 날만 · 나머지 회색)과 날짜 보기가 장 파일을 다 안 열고 이것만 읽어요 */
        function dkFolderName(design, spec, taken) {
            const clean = v => String(v || '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').replace(/\s+/g, '');   // 폴더 이름은 빈칸 없이 (도련 10-18 · 6공바인더(A5))
            const base = `${clean(design).slice(0, 20) || '다이어리'}(${clean(spec) || '규격'})`, has = new Set(taken || []);
            if (!has.has(base)) return base;
            for (let n = 2; ; n++) if (!has.has(`${base}${n}권`)) return `${base}${n}권`;
        }
        function dkInfo(o) {                                                    // 다이어리.json 내용
            return { id: o.id || 'dk' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), design: o.design || '', spec: o.spec || '', kind: o.kind || '노트', pages: o.pages || 0, days: o.days && typeof o.days === 'object' ? o.days : {} };
        }
        const DY_H = 700;                                                      // 페이지 높이 기준
        const dyFind = id => DY_TYPES.find(t => t.id === id) || (typeof dmkGet === 'function' ? dmkGet(id) : null);   // 📓 내가 만든 노트 · 바인더도 (js/dymaker.js)
        /* 📔 날짜형 = 'basic' (날짜 · 1년 · 보관소 = js/dyyear.js) · 모양 = 펼친 권의 디자인 (규격 · 묶음 · 도련 11-04 · js/dyyear.js dyyBookType) */
        const dyNow = () => dyFind(prefGet(DY_KEY, DY_LOCAL)) || (window.dyyBookType ? dyyBookType() : null);   // js/dyyear.js 가 이 파일 뒤라 처음엔 없어요
        const dyLook = dyNow;
        /* 📢 📕 공지 카드 · 표지 꾸미기 = 펼친 권의 상품 체크 (상품공방 '공지' · '표지꾸미기' · 도련 11-06 · 앱은 따르기만)
           - 공지 체크 : 평소에도 환영 카드 · 안 하면 평소엔 숨기고 새 공지(notice.json id 1 이상)가 오면 어느 다이어리든 보여요
           - 📓 내가 만든 노트 · 바인더 (상품이 아니에요) : 공지 숨김 · 표지 꾸미기 됨 · 다이어리가 아직 없으면 공지 보여요 */
        const dyNtOn = () => { const t = dyNow(); return !t || (!t.my && !!t.ntOn); };
        const dyCvOk = () => { const t = dyNow(); return !!t && (t.my ? true : !!t.cvOk); };
        window.dyNtOn = dyNtOn; window.dyCvOk = dyCvOk;
        /* 📖 펼침면 (도련 · 10-17) : 모든 다이어리는 펼친 두 쪽이 하루예요
           - 저장은 늘 두 쪽짜리 종이 하나 (getPageSize = 두 쪽 크기) · 보는 방법만 기기마다 설정 · 날짜바 스위치로 골라요 (⬅ 왼쪽 페이지 · ➡ 오른쪽 페이지)
           - spread : 💻 컴퓨터 · 📲 패드 양쪽 = 두 쪽이 다 보여요 (다이어리를 열면 #diaryWrapper 왼쪽에 한 쪽만큼 자리를 비워 가운데로)
           - swipe  : 📱 폰 양쪽 = 반쪽씩 · 밀면 같은 날 왼쪽 ↔ 오른쪽 · 끝에서 한 번 더 밀면 장이 넘어가요 (다음 날은 왼쪽부터 · 전날은 오른쪽부터)
           - right  : 오른쪽 페이지만 = 오른쪽 쪽만 · 바로 다음 날 · 전날로 넘어가요 (왼쪽 쪽은 안 보여요)
           - left   : 왼쪽 페이지만 = 왼쪽 쪽만 · 넘기는 건 right 와 같고 보이는 쪽만 왼쪽
           - #diaryBook 은 한 쪽 크기 그대로 · #innerPage 가 두 배로 넓어져 왼쪽으로 한 쪽만큼 나가요 (css #diaryBook.dy-sp) → 책은 오른쪽 쪽 자리 */
        /* 📖 보는 쪽 (도련 10-29) : 기기마다 ⬅ 왼쪽 페이지 · ➡ 오른쪽 페이지 스위치 두 개 (둘 다 켜면 양쪽) · 둘 다 끌 수는 없어요
           - 'lr' 양쪽 (💻 📲 = 펼쳐서 · 📱 = 밀어서) · 'l' 왼쪽 페이지만 · 'r' 오른쪽 페이지만 (한 쪽만 켜면 그 쪽이 날짜바 가운데 · 넘기면 바로 다음 날)
           - ⚙ 설정 📖 페이지 보기 (기기마다) + 날짜바 양 끝 스위치 (이 기기 · 작업하다 바로 접었다 펴기) · 같은 값이에요 */
        const DV_KEY = 'diary_view', DV_LOCAL = 'malang_view', DV_DEF = { phone: 'r', pad: 'lr', pc: 'lr' };   // 기본 = 📱 폰은 오른쪽 페이지만 · 📲 💻 는 둘 다 (도련 10-29)
        const DV_OK = ['lr', 'l', 'r'];
        const dvDev = UI.dev;                                                  // 이 기기 : 📱 폰 · 📲 패드 · 💻 컴퓨터 (js/uimode.js)
        function dvCfg() { const v = prefGet(DV_KEY, DV_LOCAL), c = Object.assign({}, DV_DEF, v && typeof v === 'object' ? v : {}); Object.keys(DV_DEF).forEach(k => { if (!DV_OK.includes(c[k])) c[k] = DV_DEF[k]; }); return c; }
        function dvSet(k, v) { const c = dvCfg(); c[k] = DV_OK.includes(v) ? v : 'lr'; prefSet(DV_KEY, DV_LOCAL, c); dvRender(); if (k === dvDev()) dyLoad(); }
        function dvToggle(k, side) {                                           // 스위치 하나 켜기 · 끄기 (남은 하나는 못 꺼요)
            const cur = dvCfg()[k], on = { l: cur.includes('l'), r: cur.includes('r') };
            on[side] = !on[side]; if (!on.l && !on.r) return;
            dvSet(k, (on.l ? 'l' : '') + (on.r ? 'r' : ''));
        }
        function dvRender() {
            const c = dvCfg(), me = dvDev();
            document.querySelectorAll('#dvPick [data-k]').forEach(row => {
                row.classList.toggle('me', row.dataset.k === me);
                row.querySelectorAll('[data-s]').forEach(b => { const on = c[row.dataset.k].includes(b.dataset.s); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
            });
            document.querySelectorAll('#pageHeader > .page-side').forEach(b => { const on = c[me].includes(b.dataset.s); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
        }
        /* 날짜바 양 끝 스위치 그림 : 펼친 두 쪽 중 그 쪽만 칠한 모양 (js/page.js 넘기는 장 복사본도 같은 모양) */
        const dvSideSvg = s => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="2.6" y="5" width="8.6" height="14" rx="1.8" fill="currentColor" fill-opacity="${s === 'l' ? '.9' : '0'}" stroke="currentColor" stroke-width="1.8"/><rect x="12.8" y="5" width="8.6" height="14" rx="1.8" fill="currentColor" fill-opacity="${s === 'r' ? '.9' : '0'}" stroke="currentColor" stroke-width="1.8"/></svg>`;
        const dyMode = () => { if (dkCv()) return 'right'; const v = dvCfg()[dvDev()]; return v === 'r' ? 'right' : v === 'l' ? 'left' : dvDev() === 'phone' ? 'swipe' : 'spread'; };   // 📕 표꾸 중엔 접힌 겉표지처럼 앞표지 한 쪽만
        let dyView = 'l';                                                      // 📱 지금 보는 쪽 (l 왼쪽 · r 오른쪽)
        /* 🗂️ 바인더 가운데 책등 폭 = 책 한 쪽 폭의 8% (도련 11-04 : 현실 바인더처럼 좁게 · 예전 17%) · css/anime.css · style.css .dy-gap 과 같게
           책등은 두 쪽 종이 위에 겹쳐 있어서, 좁아진 만큼 책 전체 가로도 줄여요 (보이는 종이 폭은 그대로) */
        const DY_SP_OLD = .17, DY_SP = .08;
        function dySize() {                                                    // 📐 한 쪽 크기 (js/page.js refreshLayout) · two = 두 쪽이 다 보여요 · pw = 책등과 상관없는 종이 한 쪽 폭
            const t = dyLook(), ch = DY_H - PAGE_BORDER * 2 - PAGE_HEADER_H, pw = Math.round(ch / t.r) + PAGE_BORDER * 2;
            const w = t.b === 'ring' ? Math.round(ch / t.r * (1 - DY_SP_OLD / 2) / (1 - DY_SP / 2)) + PAGE_BORDER * 2 : pw;
            return { w, pw, h: DY_H, two: dyMode() === 'spread' };
        }
        function dyVisX() {                                                    // 지금 보이는 쪽의 왼쪽 끝 (페이지 px) : 📱 한쪽 · 밀어 보기에서 오른쪽 쪽을 보고 있으면 반 장만큼
            const b = document.getElementById('diaryBook'), cv = document.getElementById('canvasArea');
            return b && cv && dyMode() !== 'spread' && b.classList.contains('dy-r') ? cv.offsetWidth / 2 : 0;
        }
        function dyVisRect(r) {                                                // 화면 위 '지금 보이는 쪽' (📱 한쪽 보기 = 책 테두리 안만) · 새로 놓을 자리를 여기 안으로
            const b = document.getElementById('diaryBook'); r = { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
            if (b && b.classList.contains('dy-one')) { const o = b.getBoundingClientRect(); r.left = Math.max(r.left, o.left); r.right = Math.min(r.right, o.right); r.width = r.right - r.left; }
            return r;
        }
        const dyUnderR = (dir, cover) => dyMode() === 'right' || (dyMode() === 'swipe' && !cover && dir === -1);   // 넘길 때 밑에 보일 장이 오른쪽 쪽인지 (js/page.js beginCurl)
        function dyViewSet(v, anim) {                                          // 📱 왼쪽 · 오른쪽 쪽 보기 (오른쪽 페이지만 = 늘 오른쪽 · 왼쪽 페이지만 = 늘 왼쪽)
            const m = dyMode(); dyView = m === 'right' || (m === 'swipe' && v === 'r') ? 'r' : 'l';
            const book = document.getElementById('diaryBook'); if (!book) return;
            book.classList.toggle('dy-anim', !!anim);
            book.classList.toggle('dy-r', dyView === 'r');
            const p = document.getElementById('innerPage'); if (p) p.classList.toggle('dy-at-r', dyView === 'r');
            if (anim) setTimeout(() => book.classList.remove('dy-anim'), 380);
        }
        function dyHalf(dir) {                                                 // 📱 밀기 : 같은 날 안에서 쪽 옮기기면 true (js/page.js setupCurlDrag)
            if (dyMode() !== 'swipe' || !isCoverOpen) return false;
            if (dir === 1 && dyView === 'l') { dyViewSet('r', true); dyHalfAt = performance.now(); return true; }
            if (dir === -1 && dyView === 'r') { dyViewSet('l', true); dyHalfAt = performance.now(); return true; }
            return false;
        }
        let dyHalfAt = 0;
        document.addEventListener('click', e => { if (performance.now() - dyHalfAt < 500) { e.stopPropagation(); e.preventDefault(); } }, true);   // 밀어서 쪽을 옮긴 뒤의 클릭은 메뉴로 안 가요
        function dyEdgeRect() {                                                // 💻 펼침면 : 넘기는 끝은 두 쪽 전체의 양쪽 끝
            if (dyMode() !== 'spread' || !isCoverOpen) return null;
            const p = document.getElementById('innerPage'); return p ? p.getBoundingClientRect() : null;
        }
        function dySet(id) {
            const t = dyFind(id) || dyNow();
            if (t.id !== dyNow().id) {
                if (isCoverOpen && !turn) saveData(false);                     // 지금 장을 먼저 저장 (다이어리가 바뀌면 저장 키가 바뀌어요)
                prefSet(DY_KEY, DY_LOCAL, t.id);
                if (dkType() && isCoverOpen) { currentDate.setTime(dyOpenDate().getTime()); selectedElement = null; }   // 📕 다른 노트 · 바인더로 바꾸면 그 권의 마지막으로 꾸민 장 (없으면 1장)
                if (typeof refreshLayout === 'function') refreshLayout(); else dyDeco();
                dkSync(true);
                dkFix();
            }
            dyRender();                                                        // 고른 칸에 색 · 페이지가 바로 바뀌어서 따로 알림은 없어요
        }
        function dyLoad() { if (typeof refreshLayout === 'function') refreshLayout(); else dyDeco(); }
        /* 📎 집게 (도련 10-18) : 다이어리 둘레(종이 테두리)를 물어요 · 다이어리 · 노트 · 바인더 모두 · 여러 개를 꺼내 원하는 만큼 꽂아요 (아래 ✂️ 문구함)
           - 기본집게 = 같은 모양 색만 다르게 (평범한 더블 클립) · 크기는 다이어리 크기와 상관없이 늘 같아요 */
        /* 🧁 문구 = 서버 상품 (상품공방 '문구' · js/prod.js · 도련 11-02) : 🎬 모양 = 상품공방 그림 그대로 (js/gdpic.js · 앱은 모양을 그리지 않아요 · 도련 11-02) · 종류(문구종류) · 이름 · 색 · 크기 · 쓰는 끝 · 처음받기 · 틀(칼 · 자 색) · 그림(속성 '그림' ✔ = 도련 그림으로 · 가위는 날이 움직여서 앱 모양)
           모양은 앱이 그려요 (집게 · 펀칭기 · 테이프 · 핀셋 · 가위 · 칼 · 자 · 필기구) · 상품이 정하는 건 어떤 디자인이 있는지 · 색 · 크기 */
        const CLIPS = [];                                                      // CLIPS = [색 이름, 이름] (📎 집게 id clip:색이름) · 서버 상품 그대로 (gdBuild) · 그림 = js/gdpic.js
        /* 📎 집게가 무는 테두리 : 테두리 한 바퀴 중 어디쯤 (0~1 · 위 왼쪽 모서리 끝에서 시계 방향) · 모서리는 둥글게 돌아요
           - 집게 아랫입(종이를 무는 곳 59, 66)이 테두리 위 · 몸통은 늘 바깥쪽을 봐요 */
        function clipRail(W, H, r) {                                           // 테두리 길이 · 길이 → [x, y, 바깥 방향(도)]
            r = Math.max(0, Math.min(r, W / 2, H / 2));
            const a = Math.PI * r / 2, seg = [W - 2 * r, a, H - 2 * r, a, W - 2 * r, a, H - 2 * r, a], L = seg.reduce((x, y) => x + y, 0);
            const at = d => {
                d = ((d % L) + L) % L;
                let i = 0; while (i < 7 && d > seg[i]) { d -= seg[i]; i++; }
                const k = seg[i] ? d / seg[i] : 0, arc = (cx, cy, a0) => { const t = (a0 + k * 90) * Math.PI / 180; return [cx + r * Math.sin(t), cy - r * Math.cos(t), a0 + k * 90]; };
                return [[r + d, 0, 0], arc(W - r, r, 0), [W, r + d, 90], arc(W - r, H - r, 90), [W - r - d, H, 180], arc(r, H - r, 180), [0, H - r - d, 270], arc(r, r, 270)][i];
            };
            return { L, at };
        }
        /* 📤 바인더 꺼내서 꾸미기 (도련 10-18) : 6공 바인더로 다꾸하는 사람들처럼
           - 📤 꺼내기 (펼침면 가운데 링 위 작은 버튼) : 링이 열리고 두 쪽이 빠져나와 가운데 틈이 닫혀 맞붙고 · 바인더(표지 · 링)는 빠지고 · 가운데에 테이프가 가로로 붙어요
             → 책상 위 종이 두 장 · 스티커가 가운데를 넘나들며 마음대로
           - 📥 끼우기 : 펀치를 꼭 거쳐요 (기본펀치는 처음부터 · ✂️ 문구함 → 🕳️ 펀치) · 6공 자리에 구멍이 뚫리고 (구멍에 걸친 꾸밈에도 구멍) · 테이프를 떼고 링에 끼워 닫아요
           - 장마다 상태 : 설정 'diary_binder' { 권 id : { 장(날짜형 = 'YYYY-MM-DD') : 1 꺼냄 | 2 구멍 뚫음 } } · 뚫은 구멍은 늘 남아요 (다시 꺼내도) */
        const BD_KEY = 'diary_binder', BD_LOCAL = 'malang_diary_binder';
        const PUNCHES = [['basic', '기본펀치', '#9aa0aa']];                      // 🕳️ 펀치 (나중에 문구점 · 예쁜 펀치)
        const PUNCH_KEY = 'diary_punch', PUNCH_LOCAL = 'malang_diary_punch';
        const punchNow = () => PUNCHES.find(p => p[0] === prefGet(PUNCH_KEY, PUNCH_LOCAL)) || PUNCHES[0];
        /* 📔 📕 날짜형 · 페이지형 바인더 모두 같은 기능 (도련 11-05 · 통합) : 권 = 페이지형 dyNow().id · 날짜형 펼친 권 id (2026b-분홍-1) · 장 = 페이지형 장 번호 · 날짜형 '2026-10-28'
           diary_binder · diary_free · diary_holes 모두 { 권 : { 장 : … } } 한 모양 · 📎 diary_clips { 권 : { 색 : 자리 } }
           💾 저장 = 그 권 폴더 / 상태.json 하나에 그 권 몫만 (도련 11-07 · 982 · 키 'dys_<권 폴더 id>' · js/drive.js STATE_KEY_RE) · 펼칠 때 그 권 것만 읽어요 · 버리면 폴더째 같이
           부르는 곳은 예전 모양 그대로 (bsGet · bsSet = 지금 권만 담은 { 권 : 값 }) · 게스트 = 이 기기 */
        const BS_LOCAL = { diary_clips: 'malang_diary_clips', diary_holes: 'malang_diary_holes', diary_free: 'malang_diary_free', diary_binder: 'malang_diary_binder' };
        const bsCloud = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        function bsFid(b, make) {                                              // 권 → 그 권 폴더 id (📔 날짜형 = 권 id · 📕 페이지형 = dk… · 기본 다이어리 = 펼친 날짜형 권)
            if (!b) return '';
            if (b === DY_DEF) return window.dyyBookId ? dyyBookId() : '';
            if (/^\d{4}[a-z]-.+-\d+$/.test(b)) return b;
            const m = dkMap(); if (m[b]) return m[b];
            return make && typeof dyNow === 'function' && dyNow().id === b ? dkId(true) || '' : '';
        }
        const bsWait = new Set();
        function bsRead(f) {
            const k = 'dys_' + f;
            if (bsCloud() && drive.newbie && !drive.loadedDays.has(k)) drive.loadedDays.add(k);   // 🆕 처음 온 다꾸러 = 아직 상태가 없어요 (찾지 않아요)
            if (bsCloud() && !drive.loadedDays.has(k) && !bsWait.has(k) && typeof ensureKeyLoaded === 'function') { bsWait.add(k); ensureKeyLoaded(k).then(ok => { bsWait.delete(k); if (ok) bsLoaded(); }); }   // 💤 처음 볼 때 그 권 상태.json 을 읽고 다시 그려요
            try { const v = JSON.parse(store.getItem(k) || 'null'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; }
        }
        function bsGet(K) {
            if (!bsCloud()) return prefGet(K, BS_LOCAL[K]) || {};
            const out = {};
            [bdBook(), typeof dyNow === 'function' ? (dyNow() || {}).id : ''].forEach(b => { const f = bsFid(b); if (f && !(b in out)) { const v = bsRead(f)[K]; if (v != null) out[b] = v; } });
            return out;
        }
        function bsSet(K, m) {
            if (!bsCloud()) { prefSet(K, BS_LOCAL[K], m); return; }
            Object.keys(m || {}).forEach(b => {
                const f = bsFid(b, true); if (!f) return;
                const o = Object.assign({}, bsRead(f)); if (JSON.stringify(o[K]) === JSON.stringify(m[b])) return;
                o[K] = m[b]; store.setItem('dys_' + f, JSON.stringify(o));
            });
        }
        function bsLoaded() { try { if (typeof gdSync === 'function') gdSync(); if (typeof gdHoleSync === 'function') gdHoleSync(); if (typeof bdSync === 'function') bdSync(); } catch (e) { console.warn('📔 상태 다시 그리기', e); } }
        const bdBook = () => dkIs(currentDate) ? (dyNow() || {}).id || '' : (window.dyyBookId ? dyyBookId() : '');
        const bdPg = () => { const d = currentDate; return dkIs(d) ? dkNo(d) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
        const bdLay = () => { const t = dyLook(); return !!t && t.b === 'ring' && isCoverOpen && !!bdBook() && (dkIs(currentDate) ? dkNo(currentDate) > 0 : !dkType()) && !(typeof dkCv === 'function' && dkCv()); };   // 6공 바인더 속지 (폰도)
        const bdOn = () => bdLay() && dvDev() !== 'phone';                     // 📱 폰에선 꺼내기를 못 해요 (도련 10-18 · 버튼도 안 생겨요)
        function bdGet() { if (!bdLay()) return 0; const m = bsGet(BD_KEY), b = m[bdBook()] || {}; return +b[bdPg()] || 0; }
        function bdPut(v) {
            const m = Object.assign({}, bsGet(BD_KEY)), id = bdBook(), b = Object.assign({}, m[id] || {});
            b[bdPg()] = v; m[id] = b; bsSet(BD_KEY, m);
        }
        let bdBusy = false;
        function bdSync() {
            const ip = document.getElementById('innerPage'); if (!ip || bdBusy) return;
            if (bdSt) { if (bdSt.at === bdAt()) return; bdStepEnd(); }        // ✋ 링을 연 채 : 같은 장이면 그대로 · 다른 장으로 가면 처음 모습으로
            const v = bdGet(), lay = bdLay(), on = bdOn();
            if (lay && !ip.classList.contains('dy-bdl')) { bdLayAt = Date.now(); bdArmed = false; }   // 표지를 막 펼쳤을 때 · 장을 막 넘겼을 때 (🖱 마우스가 그 자리를 한 번 벗어난 뒤부터 지나가기로 보여요)
            const cv = document.getElementById('canvasArea');
            if (lay && cv) {                                                   // 꺼낸 종이 바깥 끝도 처음 종이처럼 (둥근 모서리 · 테두리)
                const cs = getComputedStyle(cv), ring = cs.boxShadow.split(/,(?![^(]*\))/).map(x => x.trim()).filter(x => / 0px 0px 0px [\d.]+px$/.test(x));
                ip.style.setProperty('--bd-ring', ring.join(', ') || '0 0 0 4px #fff'); ip.style.setProperty('--bd-rad', cs.borderRadius);
            }
            ip.classList.toggle('dy-hand', bdMode() === 'hand');               // ✋ 수동 : 꺼내기 대신 🔓 링 열기 버튼
            ip.classList.toggle('dy-bdl', lay); ip.classList.toggle('dy-bd', on); ip.classList.toggle('dy-bo', on && bdMode() === 'auto' && (v & 1) > 0); ip.classList.toggle('dy-bh', lay && (v & 2) > 0);
            bdSides(); gdHoleSync();                                         // 🕳️ 하나씩 뚫은 구멍
            const fs = on && !bdSt && bdFreeGet();                             // ✋ 링을 연 채 그만둔 장이면 그 모습 그대로 (bdFreeSave)
            if (fs) { bdSt = { at: bdAt(), open: 1 }; ip.classList.add('dy-bo-go', 'dy-ring-open', 'dy-free-in'); bdFreeOn(fs); requestAnimationFrame(() => requestAnimationFrame(() => ip.classList.remove('dy-free-in'))); }
        }
        /* 📐 6공 바인더 속지 자리 (도련 10-18 · 꺼낼 때 종이가 늘어나지 않고 크기 그대로 미끄러져 와야 해서)
           - 저장된 자리 = 꺼내서 두 쪽을 아주 가까이 맞대 놓은 자리 (양쪽 바깥 6cqw 는 종이 밖)
           - 링에 끼운 동안은 두 쪽이 6cqw 씩 바깥으로 벌어져 있어요 → 왼쪽 쪽에 있는 것은 왼쪽으로 · 오른쪽 쪽에 있는 것은 오른쪽으로 (가운데 = 그것의 가운데 기준)
           - 꺼내면 두 쪽이 크기 그대로 가운데로 미끄러져 와요 (붙은 그림 · 종이 바깥 끝 · 틈 · 구멍이 같이) */
        let bdObs = null;
        function bdSides() {
            const cv = document.getElementById('canvasArea'), ip = document.getElementById('innerPage'); if (!cv || !ip) return;
            const on = ip.classList.contains('dy-bdl'), half = cv.offsetWidth / 2, bk = document.getElementById('diaryBook'), band = (bk ? bk.offsetWidth / 100 : 0) * 6.5;
            let moved = false;
            cv.querySelectorAll(':scope > .element-box').forEach(el => {
                const px = parseFloat(el.dataset.posX), c = (isFinite(px) ? px : 0) + el.offsetLeft + el.offsetWidth / 2;   // 자리는 transform(posX) 에 있어요
                let pin = el.dataset.bs; if (pin && Math.abs(c - half) > band) { delete el.dataset.bs; pin = ''; }   // 📌 가운데 틈 근처에 놓인 꾸밈은 놓인 쪽을 기억해요 (bdPin) · 멀리 옮기면 잊어요
                const r = on && (pin ? pin === 'r' : c >= half);
                if (el.classList.contains('bd-r') !== r) moved = true;
                el.classList.toggle('bd-l', on && !r); el.classList.toggle('bd-r', r);
            });
            if (moved && bdFree && !bdFree.ap) { bdFree.ap = 1; requestAnimationFrame(() => { if (bdFree) { bdFree.ap = 0; bdFreeApply(); } }); }   // 📄 쪽이 바뀐 꾸밈은 그 쪽 자리로 다시 (✂️ 자른 조각 · 옮긴 것이 튀지 않게)
            if (!bdObs && window.MutationObserver) {                           // 새로 붙이거나 옮기면 다시 (어느 쪽인지)
                bdObs = new MutationObserver(ms => { const p = document.getElementById('innerPage'); if (p && p.classList.contains('dy-bdl')) { bdSides(); if (bdFree && !bdFree.ap && ms.some(m => m.type === 'childList')) { bdFree.ap = 1; requestAnimationFrame(() => { if (bdFree) { bdFree.ap = 0; bdFreeApply(); } }); } } });   // 📄 쪽을 따로 움직이는 중에 새로 붙인 것도 그 쪽과 같이
                bdObs.observe(cv, { childList: true, subtree: false });
                bdObs.observe(cv, { attributes: true, attributeFilter: ['style'], subtree: true });
            }
        }
        /* 버튼은 평소엔 안 보여요 (도련 10-18)
           - 버튼 자리 = 가운데 링 자리 전부 (위에서 아래까지 · 꺼낸 뒤엔 맞댄 틈 둘레) · 그 위에 붙은 꾸밈은 꾸밈이 먼저
           - 보이기 : 🖱 마우스가 그 자리를 지나가면 · 🖱 그 자리를 클릭하면 · 👆 그 자리를 터치하면
           - 실행 : 보이는 동안 그 자리를 다시 클릭 · 터치 (마우스는 지나가서 한 번 클릭 또는 클릭 두 번 / 터치는 두 번)
           - 사라지기 : 설정 '자동으로 사라지는 시간'(clearSec · js/tapmenu.js)이 지나면 · 다른 곳을 누르면
           - 누르는 순간(pointerdown)만 봐요 → 표지를 펼치거나 장을 넘긴 손짓이 꺼내기로 이어지지 않아요 (📱 패드 10-18) */
        let bdShowT = 0, bdShowAt = 0, bdLayAt = 0, bdArmed = false;
        const bdShown = () => { const ip = document.getElementById('innerPage'); return !!ip && ip.classList.contains('dy-bo-show'); };
        function bdShow(on) {
            const ip = document.getElementById('innerPage'); if (!ip) return;
            clearTimeout(bdShowT); ip.classList.toggle('dy-bo-show', !!on); bdShowAt = on ? Date.now() : 0;
            if (on) ip.style.setProperty('--bdb-y', bdGrp === 'b' ? 'calc(100% - 15cqw)' : '15cqw');   // ✋ 수동 🔓 링 열기 버튼은 그 링 자리에
            if (on) bdShowT = setTimeout(() => bdShow(false), (window.clearSec ? clearSec() : 5) * 1000);
        }
        function bdHit(e, any) {                                                // 그 자리를 눌렀나 · 지나가나 (any : 표지를 막 펼친 때도)
            const ip = document.getElementById('innerPage'), bk = document.getElementById('diaryBook');
            if (!ip || !bk || !isCoverOpen || !ip.classList.contains('dy-bd') || (!any && Date.now() - bdLayAt < 700)) return false;
            const g = ip.querySelector('.dy-gap'); if (!g) return false;
            const t = e.target; if (t && t.closest && t.closest('.element-box, .bd-tool, .page-header, .page-stamps, .page-dday, .modal')) return false;
            if ([...document.querySelectorAll('.modal')].some(m => m.style.display === 'flex')) return false;   // 🪟 창이 떠 있는 동안은 뒤의 링이 안 열려요 (도련 10-19 · 창을 옮기려다 링이 열림)
            const r = g.getBoundingClientRect(), cx = r.left + r.width / 2, out = ip.classList.contains('dy-bo'), hw = out ? Math.max(bk.offsetWidth * .03, 28) : Math.max(r.width / 2, 28);
            if (Math.abs(e.clientX - cx) > hw || e.clientY < r.top || e.clientY > r.bottom) return false;
            if (out) return true;                                               // 📥 끼우기 = 가운데 틈 위아래 전부
            const cq = bk.getBoundingClientRect().width / 100, top = e.clientY <= r.top + 30 * cq, bot = e.clientY >= r.bottom - 30 * cq;
            if (bdMode() === 'hand') { if (!top && !bot) return false; bdGrp = top ? 't' : 'b'; return true; }   // ✋ 수동 🔓 링 열기 = 위 · 아래 링 자리 (도련 10-18)
            return !top && !bot;                                                // ⚡ 자동 📤 꺼내기 = 위아래 링 사이 (도련 10-18)
        }
        let bdGrp = 't';                                                        // ✋ 수동 : 위 링 · 아래 링 중 어디서
        let bdEat = 0;                                                          // 그 자리를 누른 손짓은 다른 데(메뉴 · 넘기기)로 안 가요
        window.addEventListener('pointerdown', e => {                         // window 에서 먼저 받아요 (js/tapmenu.js 의 빈 곳 톡 메뉴보다 먼저)
            if (gdDown(e)) return;                                            // ✂️ 문구함을 들고 있거나 놓인 문구함을 누르면 (아래 gdDown)
            if (bdFree && e.target.closest && e.target.closest('.bd-back')) { e.preventDefault(); e.stopPropagation(); bdEat = Date.now(); bdBack(); return; }   // 📥 바인더에 다시 끼우기
            if (bdFree) { bdFreeDown(e); return; }                          // 📄 두 쪽을 스티커처럼 (아래 bdFree)
            if (!bdHit(e)) { bdShow(false); return; }
            e.preventDefault(); e.stopPropagation(); bdEat = Date.now();
            if (bdBusy || bdSt) return;                                       // 🔓 링이 열린 채면 그 자리는 아무 일 없음
            if (bdMode() === 'hand' && !document.getElementById('innerPage').classList.contains('dy-bo')) { bdRingStart(e); return; }   // ✋ 수동 : 🔓 링 열기는 누를 것 없이 그 자리에서 바로 옆으로 끌어요 (도련 10-18)
            if (!bdShown()) { bdShow(true); return; }
            if (Date.now() - bdShowAt < 250) return;
            const k = document.getElementById('innerPage').classList.contains('dy-bo') ? 'in' : 'out';
            bdShow(false);
            if (k === 'in') bdIn(); else bdOut();
        }, true);
        ['pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'].forEach(k => window.addEventListener(k, e => { if (bdEat && (bdDg || (bdFree && bdFree.d) || gdG || bdBoxTap || Date.now() - bdEat < 900)) { e.stopPropagation(); if (k === 'click') bdEat = 0; } }, true));
        function bdGapAt(x, y) {                                                // 🗂️ 링에 끼운 두 쪽 사이 (종이가 아닌 곳 · 빈 곳 메뉴 없음 · 📱 폰도)
            const ip = document.getElementById('innerPage'); if (!ip || !isCoverOpen || !ip.classList.contains('dy-bdl') || ip.classList.contains('dy-bo') || ip.classList.contains('dy-free')) return false;
            const g = ip.querySelector('.dy-gap'), r = g && g.getBoundingClientRect(); return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        }
        window.bdGapAt = bdGapAt;
        document.addEventListener('pointermove', e => {                        // 🖱 지나가면 보여요 · 겉표지를 밀어 펼친 손(마우스)이 그 자리에 머물러 있으면 안 보여요 (도련 10-18)
            if (e.pointerType !== 'mouse' || e.buttons || bdBusy || bdSt || (gdHeld && !gdIsTwz(gdHeld))) return;   // ✂️ 문구함을 든 채면 안 보여요
            if (!bdHit(e, true)) { bdArmed = true; return; }
            if (!bdArmed || !bdHit(e)) return;
            if (!bdShown()) bdShow(true);
            else document.getElementById('innerPage').style.setProperty('--bdb-y', bdGrp === 'b' ? 'calc(100% - 15cqw)' : '15cqw');   // 위 링 ↔ 아래 링으로 옮겨 가면 버튼도
        }, { passive: true });
        /* ✋ 수동 · ⚡ 자동 (설정 '바인더 속지 빼기 · 끼우기' · 기본 수동 · 도련 10-18)
           - ⚡ 자동 : 한 번 누르면 끝까지 (bdOut · bdIn)
           - ✋ 수동 : 가운데 링 자리에서 바로 옆으로 끌면 끄는 만큼 🔓 링이 열려요 (반 넘게 끌고 놓으면 열림 · 덜 끌면 제자리)
             링 열기 다음 단계는 도련이 하나씩 정해서 만들어요 (10-18 · 예전 속지 빼기 · 모으기 · 테이프 · 수동 끼우기는 지웠어요) · 끼우기는 지금 ⚡ 자동 그대로
           - 끄는 동안 = innerPage 의 data-dg="ring" + --bs(0 닫힘 ~ 1 열림) · css 가 그대로 그려요 */
        const BDM_KEY = 'diary_binder_mode', BDM_LOCAL = 'malang_diary_binder_mode';
        function bdMode() { return (!window.ftOn || ftOn('bdauto')) && prefGet('diary_binder_mode', 'malang_diary_binder_mode') === 'auto' ? 'auto' : 'hand'; }   // ⚡ 자동은 숨김 동안 늘 ✋ 수동 (js/features.js bdauto · 10-19)   // BDM_KEY · BDM_LOCAL (bdSync 가 먼저 불러도 되게)
        function bdModeSet(v) { prefSet(BDM_KEY, BDM_LOCAL, v === 'auto' ? 'auto' : 'hand'); bdModeRender(); bdSync(); }
        function bdModeRender() { const m = bdMode(); document.querySelectorAll('#bdModePick [data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === m)); }
        const bdAt = () => bdBook() + '|' + bdPg();
        const BD_TMP = ['dy-bo-go', 'dy-bo-hold', 'dy-bo', 'dy-bo-back', 'dy-bo-tape', 'dy-bh-pop', 'dy-ring-open'];
        let bdSt = null, bdDg = null;                                          // bdSt { at : 그 장 · open : 링이 열렸음 } · bdDg = 끄는 중
        function bdStepEnd() {                                                  // 처음 모습으로 (다른 장으로 가면)
            bdFreeOff();
            const ip = document.getElementById('innerPage'); bdSt = null; bdDg = null;
            if (ip) { ip.classList.remove('dy-dg', ...BD_TMP); delete ip.dataset.dg; ip.style.removeProperty('--bs'); }
            bdShow(false);
        }
        function bdBsSet(s) { const ip = document.getElementById('innerPage'); if (ip) ip.style.setProperty('--bs', Math.max(0, Math.min(1, s)).toFixed(3)); }
        function bdRingStart(e) {                                               // 🔓 옆으로 끌기 시작
            const ip = document.getElementById('innerPage'), bk = document.getElementById('diaryBook'); if (!ip || !bk || bdBusy || !bdOn()) return;
            selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel();
            clearTimeout(bdShowT); ip.classList.add('dy-bo-show');
            bdSt = { at: bdAt(), open: 0 };
            bdDg = { x: e.clientX, D: Math.max(12 * bk.offsetWidth / 100, 60), p: 0, id: e.pointerId };
            ip.classList.add('dy-dg'); ip.dataset.dg = 'ring'; bdBsSet(0);
        }
        window.addEventListener('pointermove', e => {
            const d = bdDg; if (!d || d.id !== e.pointerId) return;
            d.p = Math.max(0, Math.min(1, Math.abs(e.clientX - d.x) / d.D)); bdBsSet(d.p);
        }, true);
        window.addEventListener('pointerup', e => bdDgEnd(e), true);
        window.addEventListener('pointercancel', e => bdDgEnd(e, true), true);
        function bdDgEnd(e, cancel) {
            const d = bdDg, ip = document.getElementById('innerPage'); if (!d || d.id !== e.pointerId || !ip) return;
            bdDg = null;
            const go = !cancel && d.p >= .5, from = d.p, to = go ? 1 : 0, t0 = performance.now(); bdBusy = true;
            const step = now => {                                                // 놓으면 끝까지 · 덜 끌었으면 제자리로
                const k = Math.min(1, (now - t0) / 220), p = from + (to - from) * k;
                bdBsSet(p);
                if (k < 1) { requestAnimationFrame(step); return; }
                ip.classList.remove('dy-dg'); delete ip.dataset.dg; ip.style.removeProperty('--bs'); bdBusy = false;
                if (go && bdSt) { bdSt.open = 1; gdClipAway(); ip.classList.add('dy-bo-go', 'dy-ring-open'); bdShow(false); bdFreeOn(); bdFreeSave(); }   // 🔓 링이 열리면 표지 · 링은 스르륵 사라지고 두 쪽은 스티커처럼 (도련 10-18)
                else { bdSt = null; bdShow(true); }                              // 덜 끌었으면 버튼만 보여요
            };
            requestAnimationFrame(step);
        }
        /* 📄 링을 연 뒤 : 왼쪽 쪽 · 오른쪽 쪽이 스티커처럼 (도련 10-18)
           - 쪽을 누르면 골라져요 (빨간 점선 네모) · 끌면 옮겨지고 · 네 모서리를 잡고 돌리면 돌아가요 · 다른 곳을 누르면 풀려요
           - 위 날짜바를 끌면 다이어리째(js/page.js 페이지 옮기기) → 두 쪽이 같이 따라와요 (날짜바가 부모 · 쪽이 자식)
           - 종이 = .bd-sheet 두 장 (#canvasArea 의 바탕을 그대로 옮겨 그려요) · 붙인 꾸밈 · 기분 · 날씨 도장도 그 쪽과 같이 옮겨지고 돌아가요 (translate · rotate)
           - 저장 : 링을 연 장만 (설정 'diary_free' { 권 id : { 장 : [왼 x, y, 각도, 오른 x, y, 각도] } } · x · y 는 cqw) · 다른 장에 갔다 오거나 다시 열어도 그대로
             📥 바인더에 끼우면 그 장 기록은 지워요 (평범한 다꾸 · 다른 다이어리엔 아무것도 안 남아요 · 도련 10-18)
           - 📥 바인더 버튼(위 날짜바 오른쪽 끝) : 구멍 12개 · 두 쪽이 떨어져 있고 · 구멍을 가린 것 없고 · 책상에 안 붙어야 끼워져요 (bdBlock) */
        function bdFreeGet() { const m = bsGet('diary_free'), b = m[bdBook()]; return (b && b[bdPg()]) || null; }
        function bdFreePut(v) {
            const m = Object.assign({}, bsGet('diary_free')), id = bdBook(), b = Object.assign({}, m[id] || {}), n = bdPg();
            if (v) b[n] = v; else delete b[n];
            if (Object.keys(b).length) m[id] = b; else delete m[id];
            bsSet('diary_free', m);
        }
        function bdFreeSave() {
            const bk = document.getElementById('diaryBook'); if (!bdFree || !bk) return;
            const cq = bk.offsetWidth / 100, f = v => Math.round(v * 100) / 100;
            bdFreePut(['l', 'r'].flatMap(x => { const h = bdFree.sh[x]; return [f(h.x / cq), f(h.y / cq), f(h.r)]; }));
        }
        const bdHolesAll = () => { const ip = document.getElementById('innerPage'); return !!ip && (ip.classList.contains('dy-bh') || (gdHoleMask() & 4095) === 4095); };
        /* 📥 바인더에 끼울 수 있나 (도련 10-19 · 현실처럼) : 구멍 12개가 다 뚫려 있고 · 두 쪽이 떨어져 있고 · 구멍을 가린 게 없고 · 책상에 붙지 않아야 해요
           - 두 쪽에 걸친 것 = 양면테이프 · 스티커 · 글 메모 무엇이든 (그 꾸밈의 네모가 두 쪽 종이에 다 닿으면)
           - 구멍을 가린 것 = 구멍 자리에 보이는 그림이 있으면 (투명한 곳 · 펀칭기로 같이 뚫은 자리는 괜찮아요) · 책상 = 양면테이프가 종이 밖까지 (bdTapeLinks pin)
           - 버튼은 늘 📥 바인더 · 누르면 걸린 꾸밈이 빨갛게 깜박이고 이유가 화면 가운데 떠요 (도련 10-19) */
        const BD_WHY = { holes: '🕳️ 구멍 12개를 먼저 뚫어 주세요', link: '✂️ 두 쪽에 걸쳐 붙은 걸 떼어 주세요', cover: '🙈 구멍을 가린 스티커는 펀칭기로 뚫어 주세요', desk: '🩹 책상에 붙은 테이프를 떼어 주세요' };
        const bdAlpha = new Map();                                              // 그림 src → 작은 알파 지도 (못 읽으면 null = 네모로 판단)
        function bdAlphaOf(img) {
            const k = img.currentSrc || img.src; if (!k || !img.complete || !img.naturalWidth) return null;
            if (bdAlpha.has(k)) return bdAlpha.get(k);
            let v = null;
            try {
                const s = Math.min(1, 160 / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * s)), h = Math.max(1, Math.round(img.naturalHeight * s));
                const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
                v = { w, h, d: g.getImageData(0, 0, w, h).data };
            } catch (e) { v = null; }
            bdAlpha.set(k, v); return v;
        }
        function bdBlock() {
            if (!bdFree) return null;
            if (!bdHolesAll()) return { k: 'holes', els: [] };
            const L = bdFree.sh.l, R = bdFree.sh.r, link = [], desk = [], cover = [];
            const holes = [...document.querySelectorAll('#innerPage .bd-hl .bd-hole')].map(h => { const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; });
            document.querySelectorAll('#canvasArea > .element-box').forEach(el => {
                const side = el.classList.contains('bd-r') ? 'r' : 'l', b = el.getBoundingClientRect(); if (!b.width) return;
                const c = gdTo(b.left + b.width / 2, b.top + b.height / 2), sc = parseFloat(el.dataset.scale) || 1, w = el.offsetWidth * sc / 2, h = el.offsetHeight * sc / 2;
                const a = ((parseFloat(el.dataset.rotation) || 0) + bdFree.sh[side].r) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
                const at = (u, v) => ({ x: c.x + u * cs - v * sn, y: c.y + u * sn + v * cs });
                const img = el.querySelector(':scope > img'), al = img && bdAlphaOf(img);
                const solid = (u, v) => {                                       // 꾸밈 안 (u, v) 자리가 보이는 그림인가
                    if (Math.abs(u) > w + .01 || Math.abs(v) > h + .01) return false;
                    if (!al) return true;
                    const x = u / sc + el.offsetWidth / 2 - img.offsetLeft, y = v / sc + el.offsetHeight / 2 - img.offsetTop;
                    const iw = img.offsetWidth, ih = img.offsetHeight; if (x < -.5 || y < -.5 || x > iw + .5 || y > ih + .5) return false;
                    const ax = Math.min(al.w - 1, Math.max(0, Math.floor(x / iw * al.w))), ay = Math.min(al.h - 1, Math.max(0, Math.floor(y / ih * al.h)));
                    return al.d[(ay * al.w + ax) * 4 + 3] > 60;
                };
                let nL = 0, nR = 0;                                             // 두 쪽에 걸쳤나 (보이는 그림만 · 투명한 곳은 빼고)
                for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) { const u = -w + 2 * w * i / 10, v = -h + 2 * h * j / 10; if (!solid(u, v)) continue; const p = at(u, v); if (bdSheetHas(L, p)) nL++; if (bdSheetHas(R, p)) nR++; }
                const isTape = img && String(img.dataset.src || '').includes('gd-tape');   // 🩹 테이프는 조금만 걸쳐도 붙어요 · ✂️ 손으로 조금 삐뚤게 자른 조각이 살짝 넘어간 건 괜찮아요 (도련 10-19)
                if (nL && nR && (isTape || Math.min(nL, nR) >= Math.max(4, (nL + nR) * .15))) link.push(el);
                if (holes.some(o => [[0, 0], ...[...Array(8)].map((_, i) => [Math.cos(i * Math.PI / 4) * .85, Math.sin(i * Math.PI / 4) * .85])].some(([a, b]) => { const p = bdLocal(el, o.x + a * o.r, o.y + b * o.r); return p && bdSolid(el, p); }))) cover.push(el);
                if (isTape) {   // 🩹 테이프 끝이 종이 밖(책상)으로 (두 쪽 사이 틈은 책상이 아니에요 · bdTapeLinks 와 같게)
                    const hit = []; for (let i = 0; i <= 16; i++) { const p = at(-w + 2 * w * i / 16, 0); hit.push(bdSheetHas(L, p) || bdSheetHas(R, p)); }
                    const f = hit.indexOf(true), z = hit.lastIndexOf(true); if (f > 0 || (z >= 0 && z < 16)) desk.push(el);
                }
            });
            if (link.length) return { k: 'link', els: link };
            if (cover.length) return { k: 'cover', els: cover };
            if (desk.length) return { k: 'desk', els: desk };
            return null;
        }
        let bdWhyT = 0;
        function bdWhySay(t) {                                                  // 📥 못 끼우는 이유 · 화면 가운데
            let m = document.getElementById('bdWhy'); if (!m) { m = document.createElement('div'); m.id = 'bdWhy'; m.className = 'bd-why'; document.body.appendChild(m); }
            m.textContent = t; m.classList.remove('on'); void m.offsetWidth; m.classList.add('on');
            clearTimeout(bdWhyT); bdWhyT = setTimeout(() => m.classList.remove('on'), 2200);
        }
        function bdBack() {                                                     // 📥 두 쪽이 제자리로 돌아가 링에 끼워지고 표지 · 링 · 집게가 다시
            const ip = document.getElementById('innerPage'); if (!bdFree || bdBusy || !ip) return;
            const why = bdBlock();
            if (why) {                                                          // 걸린 꾸밈이 빨갛게 깜박이고 이유가 가운데
                why.els.forEach(el => { el.classList.remove('bd-bad'); void el.offsetWidth; el.classList.add('bd-bad'); setTimeout(() => el.classList.remove('bd-bad'), 1300); });
                bdWhySay(BD_WHY[why.k]); return;
            }
            bdBusy = true; bdFreeSel(null);
            const st = ['l', 'r'].map(x => { const h = bdFree.sh[x]; return { h, x: h.x, y: h.y, r: h.r }; }), t0 = performance.now();
            const step = now => {
                const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3);
                if (bdFree) { st.forEach(o => { o.h.x = o.x * (1 - e); o.h.y = o.y * (1 - e); o.h.r = o.r * (1 - e); }); bdFreeApply(); }
                if (k < 1) { requestAnimationFrame(step); return; }
                bdFreePut(null); bdPut(2); bdBusy = false; bdStepEnd(); bdSync();
            };
            requestAnimationFrame(step);
        }
        let bdFree = null;                                                      // { k : 배율, sh : { l, r }, sel, d : 끄는 중 }
        function bdFreeOn(fs) {
            const ip = document.getElementById('innerPage'), cv = document.getElementById('canvasArea'), bk = document.getElementById('diaryBook'); if (!ip || !cv || !bk || bdFree) return;
            const ir = ip.getBoundingClientRect(), k = ir.width / (ip.offsetWidth || ir.width) || 1, cr = cv.getBoundingClientRect();
            const ox = (cr.left - ir.left) / k, oy = (cr.top - ir.top) / k, W = cv.offsetWidth, H = cv.offsetHeight, cqw = bk.offsetWidth / 100, sw = W / 2 - 6 * cqw;
            const cs = getComputedStyle(cv);
            const bgPos = off => cs.backgroundPosition.split(',').map(p => { const [x, y] = p.trim().split(/\s+/); return `calc(${x} - ${off}px) ${y || '0px'}`; }).join(', ');
            bdFree = { k, sh: {}, sel: null, d: null };
            ['l', 'r'].forEach(side => {
                const x = side === 'l' ? 0 : W - sw, el = document.createElement('div');
                el.className = 'bd-sheet ' + side;
                Object.assign(el.style, { left: (ox + x) + 'px', top: oy + 'px', width: sw + 'px', height: H + 'px', backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage, backgroundSize: cs.backgroundSize, backgroundRepeat: cs.backgroundRepeat, backgroundPosition: bgPos(x) });
                el.innerHTML = '<b class="bd-rot tl"></b><b class="bd-rot tr"></b><b class="bd-rot bl"></b><b class="bd-rot br"></b>';
                ip.insertBefore(el, cv);
                const hl = document.createElement('div'); hl.className = 'bd-hl ' + side;   // 🕳️ 구멍만 꾸밈 위에 (스티커째 뚫린 것처럼 · 종이와 같이 옮겨지고 돌아가요)
                Object.assign(hl.style, { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height });
                ip.insertBefore(hl, cv.nextSibling);
                bdFree.sh[side] = { el, hl, x: 0, y: 0, r: 0, cx: ox + x + sw / 2, cy: oy + H / 2 };
            });
            const hm = ip.classList.contains('dy-bh') ? 4095 : gdHoleMask();        // 6공 자리 (뚫은 구멍은 보이고 · 안 뚫은 자리는 🕳️ 펀칭기가 찾아요)
            ['l', 'r'].forEach(side => [7.5, 16.5, 25.5, -24.9, -15.9, -6.9].forEach((t, j) => {
                const i = (side === 'l' ? 0 : 6) + j, d = document.createElement('i'), s2 = 2.4 * cqw;
                d.className = 'bd-hole' + ((hm >> i & 1) ? ' on' : ''); d.dataset.i = i;
                Object.assign(d.style, { left: ((side === 'l' ? sw - 4.5 * cqw : 4.5 * cqw) - s2 / 2) + 'px', top: ((t > 0 ? t * cqw : H + t * cqw) - s2 / 2) + 'px', width: s2 + 'px', height: s2 + 'px' });
                bdFree.sh[side].hl.appendChild(d);
            }));
            if (fs) ['l', 'r'].forEach((x, j) => { const h = bdFree.sh[x]; h.x = (+fs[j * 3] || 0) * cqw; h.y = (+fs[j * 3 + 1] || 0) * cqw; h.r = +fs[j * 3 + 2] || 0; });
            const bb = document.createElement('button'); bb.type = 'button'; bb.className = 'bd-back'; bb.tabIndex = -1; bb.innerHTML = '📥<small>바인더</small>';
            (ip.querySelector('.page-header') || ip).appendChild(bb);           // 위 날짜바 오른쪽 끝 (도련 10-19)
            ip.classList.add('dy-free'); bdFreeApply();
        }
        function bdFreeOff() {
            const ip = document.getElementById('innerPage'); if (!bdFree) return;
            bdFree = null;
            if (!ip) return;
            ip.classList.remove('dy-free');
            ip.querySelectorAll('.bd-sheet, .bd-hl, .bd-back, .gd-slot').forEach(x => x.remove());
            ip.querySelectorAll('#canvasArea > .element-box, .page-stamps, .page-dday, .season-corner').forEach(x => { x.style.removeProperty('translate'); x.style.removeProperty('rotate'); });
        }
        function bdFreeApply() {                                                // 그 쪽에 붙은 것들도 같이 (쪽 가운데를 축으로)
            const ip = document.getElementById('innerPage'), cv = document.getElementById('canvasArea'), bk = document.getElementById('diaryBook'); if (!bdFree || !ip || !cv || !bk) return;
            const cqw = bk.offsetWidth / 100, L = bdFree.sh.l, Rr = bdFree.sh.r;
            [L, Rr].forEach(sh => [sh.el, sh.hl].forEach(x => { x.style.translate = `${sh.x}px ${sh.y}px`; x.style.rotate = sh.r + 'deg'; }));
            const ox = cv.offsetLeft, oy = cv.offsetTop;                       // #canvasArea 는 innerPage 안에 바로
            const move = (el, sh, shift, bx, by) => {                         // bx · by : 그 꾸밈의 바탕 자리 (innerPage 기준)
                const o = getComputedStyle(el).transformOrigin.split(' ').map(parseFloat);
                const Ox = bx + el.offsetLeft + o[0], Oy = by + el.offsetTop + o[1];
                const a = sh.r * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), vx = Ox + shift - sh.cx, vy = Oy - sh.cy;
                const tx = vx * c - vy * sn + sh.cx - Ox + sh.x, ty = vx * sn + vy * c + sh.cy - Oy + sh.y;
                el.style.translate = `${tx}px ${ty}px`; el.style.rotate = sh.r + 'deg';
            };
            cv.querySelectorAll(':scope > .element-box').forEach(el => {
                const r = el.classList.contains('bd-r'); move(el, r ? Rr : L, (r ? 6 : -6) * cqw, ox, oy);
            });
            ip.querySelectorAll(':scope > .page-stamps, :scope > .season-corner').forEach(el => move(el, Rr, 0, 0, 0));
            ip.querySelectorAll(':scope > .page-dday').forEach(el => move(el, L, 0, 0, 0));
        }
        function bdFreeSel(side) {
            if (!bdFree) return; bdFree.sel = side;
            ['l', 'r'].forEach(x => bdFree.sh[x].el.classList.toggle('sel', x === side));
        }
        function bdFreeBox(x, y) {                                              // 그 자리의 꾸밈 (스티커 · 🩹 바른 테이프 · 평소엔 종이처럼 못 눌러요)
            const cv = document.getElementById('canvasArea'); if (!cv) return null;
            cv.classList.add('bd-pick');
            try { const n = document.elementsFromPoint(x, y).find(n => n.closest && n.closest('#canvasArea > .element-box')); return n ? { box: n.closest('#canvasArea > .element-box'), rot: !!n.closest('.rot-zone') } : null; } finally { cv.classList.remove('bd-pick'); }
        }
        /* 🪡 링을 연 뒤에도 핀셋으로 꾸밈(스티커 · 🩹 테이프)을 (도련 10-18)
           - 톡 = 그 꾸밈 메뉴 (순서 · 삭제) · 끌기 = 옮기기 · 고른 꾸밈의 모서리(rot-zone)를 끌기 = 돌리기
           - 옮기고 돌린 쪽 위에서도 손가락 · 마우스를 그대로 따라와요 · 다른 쪽으로 넘어가면 그 쪽 것이 돼요 (보이는 자리 · 각도 그대로) */
        let bdBoxTap = null;
        const bdBoxC = el => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; };
        function bdPin(el, sd) {                                                // 📌 가운데 틈 근처(보이는 자리)에 놓이면 저장 자리로는 반대쪽 반이라 쪽이 바뀌어 튀어요 → 놓인 쪽을 기억 (그때만 · 저장 'bs')
            const cv = document.getElementById('canvasArea'); if (!cv || !el) return;
            const c = (parseFloat(el.dataset.posX) || 0) + el.offsetLeft + el.offsetWidth / 2;
            if ((c >= cv.offsetWidth / 2) !== (sd === 'r')) el.dataset.bs = sd; else delete el.dataset.bs;
        }
        window.bdPin = bdPin;
        window.bdAfterLoad = () => { const ip = document.getElementById('innerPage'); if (!ip || !ip.classList.contains('dy-bdl')) return; bdSides(); if (bdFree) bdFreeApply(); };   // 📄 장을 넘겨 불러온 꾸밈 (링을 연 채 저장된 장도 쪽 따라)
        function bdBoxPut(el, C, vis) {                                          // 화면 가운데 C · 보이는 각도 vis 로
            const sd = gdSide(C.x, C.y), m = gdCv(C.x, C.y, sd), x = m.x - el.offsetLeft - el.offsetWidth / 2, y = m.y - el.offsetTop - el.offsetHeight / 2, r = Math.round((vis - bdFree.sh[sd].r) * 10) / 10;
            el.dataset.posX = x; el.dataset.posY = y; el.dataset.rotation = r;
            el.style.transform = `translate(${x}px, ${y}px) scale(${el.dataset.scale || 1}) rotate(${r}deg)`;
            bdPin(el, sd); bdSides(); bdFreeApply();
        }
        window.addEventListener('pointermove', e => {
            const t = bdBoxTap; if (!t || t.id !== e.pointerId || !bdFree) return;
            if (!t.moved && !t.rot && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 8) return;
            t.moved = true; t.box.classList.add('lifting');
            if (t.rot) bdBoxPut(t.box, t.c0, t.vis + (Math.atan2(e.clientY - t.c0.y, e.clientX - t.c0.x) - t.a0) * 180 / Math.PI);
            else bdBoxPut(t.box, { x: t.c0.x + e.clientX - t.x, y: t.c0.y + e.clientY - t.y }, t.vis);
        }, true);
        ['pointerup', 'pointercancel'].forEach(k => window.addEventListener(k, e => {
            const t = bdBoxTap; if (!t || t.id !== e.pointerId) return; bdBoxTap = null; bdEat = Date.now(); t.box.classList.remove('lifting');
            if (t.moved) { if (typeof saveData === 'function') saveData(false); return; }
            if (k === 'pointerup' && !t.rot && t.box.isConnected) { if (typeof selectElement === 'function') selectElement(t.box); if (window.tmOpenElem) tmOpenElem(t.box, e.clientX, e.clientY, e.pointerType !== 'mouse'); }
        }, true));
        function bdFreeDown(e) {
            if (!e.target.closest || !e.target.closest('#innerPage')) { bdFreeSel(null); return; }   // 창 · 메뉴 · 🗑 핀셋 뜯기 화면은 그대로
            const hb = window.gdTwz && gdTwz() && bdFreeBox(e.clientX, e.clientY);
            if (hb) {
                e.preventDefault(); e.stopPropagation(); bdEat = Date.now();
                const box = hb.box, c0 = bdBoxC(box), sd = box.classList.contains('bd-r') ? 'r' : 'l';
                bdBoxTap = { id: e.pointerId, box, rot: hb.rot, x: e.clientX, y: e.clientY, c0, vis: (parseFloat(box.dataset.rotation) || 0) + bdFree.sh[sd].r, a0: Math.atan2(e.clientY - c0.y, e.clientX - c0.x), moved: false };
                return;
            }
            const sheet = e.target.closest && e.target.closest('.bd-sheet');
            if (!sheet) { bdFreeSel(null); return; }                          // 다른 곳 = 풀기 (날짜바 끌기 · 넘기기는 그대로)
            e.preventDefault(); e.stopPropagation(); bdEat = Date.now();
            const side = sheet.classList.contains('l') ? 'l' : 'r', sh = bdFree.sh[side];
            const tp = bdTapeLinks(), grp = tp.link ? ['l', 'r'] : [side], pins = [];   // 🩹 양면테이프 : 두 쪽에 걸치면 한 장처럼 · 종이 밖(책상)에 걸치면 그 자리가 축
            grp.forEach(x => tp.pin[x].forEach(p => { if (!pins.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 6)) pins.push(p); }));
            bdFreeSel(side); if (tp.link) ['l', 'r'].forEach(x => bdFree.sh[x].el.classList.add('sel'));
            const rot = e.target.classList.contains('bd-rot'), S = gdTo(e.clientX, e.clientY);
            const st = grp.map(x => ({ sh: bdFree.sh[x], x: bdFree.sh[x].x, y: bdFree.sh[x].y, r: bdFree.sh[x].r }));
            const P = pins.length === 1 ? pins[0] : { x: st.reduce((a, o) => a + o.sh.cx + o.x, 0) / st.length, y: st.reduce((a, o) => a + o.sh.cy + o.y, 0) / st.length };   // 돌리는 축 : 테이프 축 · 없으면 (묶인) 종이 가운데
            bdFree.d = { id: e.pointerId, sh, side, rot, x: e.clientX, y: e.clientY, S, st, P, pin: pins.length, a0: Math.atan2(S.y - P.y, S.x - P.x), moved: false };
            st.forEach(o => o.sh.el.classList.add('lift'));
        }
        /* 🩹 양면테이프가 실제처럼 (도련 10-18 · ✋ 수동 링을 연 뒤) : 테이프가 어디에 걸쳤는지를 누르는 순간 봐요
           - 두 쪽에 걸침 = 두 쪽이 한 장처럼 (어느 쪽을 잡아도 같이 옮겨지고 같이 돌아요)
           - 종이와 종이 밖(책상)에 걸침 = 그 테이프 가운데가 축 → 끌면 축을 중심으로 끄는 쪽으로 돌기만 해요 · 축이 두 곳 이상이면 꽉 잡혀서 안 움직여요
           - 핀셋으로 테이프를 떼면 다시 자유롭게 */
        function bdSheetHas(sh, p) {                                            // 그 자리가 이 쪽 종이 위인지 (다이어리 자리)
            const el = sh.el, l = parseFloat(el.style.left), t = parseFloat(el.style.top), w = el.offsetWidth, h = el.offsetHeight;
            const a = -sh.r * Math.PI / 180, vx = p.x - sh.cx - sh.x, vy = p.y - sh.cy - sh.y;
            const bx = vx * Math.cos(a) - vy * Math.sin(a) + sh.cx, by = vx * Math.sin(a) + vy * Math.cos(a) + sh.cy;
            return bx >= l && bx <= l + w && by >= t && by <= t + h;
        }
        function bdTapeLinks() {
            const out = { link: false, pin: { l: [], r: [] } }; if (!bdFree) return out;
            document.querySelectorAll('#canvasArea > .element-box').forEach(el => {
                const img = el.querySelector(':scope > img'); if (!img || !String(img.dataset.src || '').includes('gd-tape')) return;
                const side = el.classList.contains('bd-r') ? 'r' : 'l', b = el.getBoundingClientRect(), c = gdTo(b.left + b.width / 2, b.top + b.height / 2);
                const a = ((parseFloat(el.dataset.rotation) || 0) + bdFree.sh[side].r) * Math.PI / 180, hl = img.offsetWidth * (parseFloat(el.dataset.scale) || 1) / 2;
                const on = { l: false, r: false, out: false }, hit = [], N = 16;
                for (let i = 0; i <= N; i++) {
                    const t = -hl + 2 * hl * i / N, p = { x: c.x + Math.cos(a) * t, y: c.y + Math.sin(a) * t }, L = bdSheetHas(bdFree.sh.l, p), R = bdSheetHas(bdFree.sh.r, p);
                    if (L) on.l = true; if (R) on.r = true; hit.push(L || R);
                }
                const f = hit.indexOf(true), z = hit.lastIndexOf(true);
                on.out = f > 0 || (z >= 0 && z < N);                             // 종이 밖(책상) = 테이프 끝이 종이를 벗어난 곳만 (두 쪽 사이 틈은 책상이 아니에요)
                if (on.l && on.r) out.link = true;
                if (on.out) ['l', 'r'].forEach(x => { if (on[x]) out.pin[x].push(c); });
            });
            return out;
        }
        window.addEventListener('pointermove', e => {
            const d = bdFree && bdFree.d; if (!d || d.id !== e.pointerId) return;
            if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;   // 살짝 톡 = 메뉴
            d.moved = true;
            if (d.pin > 1) { if (!d.stuck) { d.stuck = 1; d.st.forEach(o => { o.sh.el.classList.remove('stuck'); void o.sh.el.offsetWidth; o.sh.el.classList.add('stuck'); }); } return; }   // 🩹 축이 두 곳 이상 = 꽉 잡혀서 안 움직여요 (살짝 버티기만)
            const Q = gdTo(e.clientX, e.clientY);
            if (d.rot || d.pin) {                                               // 돌리기 (축 = 테이프 · 없으면 종이 가운데)
                let da = Math.atan2(Q.y - d.P.y, Q.x - d.P.x) - d.a0; const c = Math.cos(da), sn = Math.sin(da);
                d.st.forEach(o => {
                    const vx = o.sh.cx + o.x - d.P.x, vy = o.sh.cy + o.y - d.P.y;
                    o.sh.x = d.P.x + vx * c - vy * sn - o.sh.cx; o.sh.y = d.P.y + vx * sn + vy * c - o.sh.cy; o.sh.r = o.r + da * 180 / Math.PI;
                });
            } else d.st.forEach(o => { o.sh.x = o.x + Q.x - d.S.x; o.sh.y = o.y + Q.y - d.S.y; });
            bdFreeApply();
        }, true);
        ['pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, e => {
            const d = bdFree && bdFree.d; if (!d || d.id !== e.pointerId) return;
            bdFree.d = null; d.st.forEach(o => o.sh.el.classList.remove('lift'));
            if (d.moved) bdFreeSave();
            if (!d.moved && !d.rot && e.type === 'pointerup') bdFreeMenu(e, d.side);   // 쪽을 톡 = 그 쪽에 빈 곳 메뉴 (펜꽂이 · 필통 … · 도련 10-18)
        }, true));
        function bdFreeMenu(e, side) {
            if (!window.tmOpen) return;
            tmOpen({ clientX: e.clientX, clientY: e.clientY });
            const ip = document.getElementById('innerPage'), cv = document.getElementById('canvasArea'), bk = document.getElementById('diaryBook');
            if (!bdFree || typeof tmAnchor === 'undefined' || !tmAnchor || !ip || !cv || !bk) return;
            const sh = bdFree.sh[side], ir = ip.getBoundingClientRect(), k = bdFree.k;   // 옮기고 돌린 쪽 위 자리 → 그 쪽의 원래 자리 (고른 게 그 쪽 눌린 자리에 놓이게)
            const vx = (e.clientX - ir.left) / k - sh.cx - sh.x, vy = (e.clientY - ir.top) / k - sh.cy - sh.y, a = -sh.r * Math.PI / 180;
            const px = vx * Math.cos(a) - vy * Math.sin(a) + sh.cx, py = vx * Math.sin(a) + vy * Math.cos(a) + sh.cy;
            tmAnchor.x = px - cv.offsetLeft - (side === 'r' ? 6 : -6) * bk.offsetWidth / 100; tmAnchor.y = py - cv.offsetTop;
        }
        function bdPunch() {                                                    // 🕳️ 펀치로 꾹 → 구멍
            const ip = document.getElementById('innerPage'), fr = document.getElementById('dyFront'); if (!ip || !fr) return;
            const pu = document.createElement('span'); pu.className = 'dy-punch'; pu.style.setProperty('--pc', punchNow()[2]);
            pu.innerHTML = '<i></i><i></i>'; fr.appendChild(pu);
            setTimeout(() => ip.classList.add('dy-bh', 'dy-bh-pop'), 620);
            setTimeout(() => pu.remove(), 1250);
        }
        function gdClipAway() { if (gdHeld && gdHeld.startsWith('clip:')) gdLet(); }   // 📎 링이 열리면 들고 있던 집게도 내려놓아요 (집게는 css 로 다 숨어요)
        function bdOut() {                                                      // 링 열림 → 두 쪽이 크기 그대로 가운데로 미끄러져 와서 아주 가까이 (붙어서 한 몸이 되지 않아요) → 반투명 테이프가 붙고 스윽 사라짐
            const ip = document.getElementById('innerPage'); if (!ip || bdBusy || !bdOn()) return;
            selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel();
            bdBusy = true; ip.classList.add('dy-bo-go'); gdClipAway();
            setTimeout(() => ip.classList.add('dy-bo'), 330);                  // 미끄러져 와요
            setTimeout(() => ip.classList.add('dy-bo-tape'), 1100);            // 테이프 (붙은 채 남아요 · 끼우기 때 떼어져요)
            setTimeout(() => { ip.classList.remove('dy-bo-go', 'dy-bo-tape'); bdBusy = false; bdPut((bdGet() & 2) | 1); bdSync(); }, 2700);
        }
        function bdIn() {                                                       // 펀치 → 구멍 → 테이프 떼기 → 링에 끼우기
            const ip = document.getElementById('innerPage'), fr = document.getElementById('dyFront'); if (!ip || !fr || bdBusy || !bdOn()) return;
            selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel();
            bdBusy = true; bdPunch();                                          // 꾹 누르는 순간 구멍
            setTimeout(() => { ip.classList.add('dy-bo-back'); ip.classList.remove('dy-bo'); }, 1250);   // 두 쪽이 크기 그대로 벌어져 링에 끼워져요
            setTimeout(() => { ip.classList.remove('dy-bo-back', 'dy-bh-pop'); bdBusy = false; bdPut(2); bdSync(); }, 2700);
        }
        /* ✂️ 문구함 = 손에 드는 도구 (도련 10-18 · 앞으로 더하는 문구함도 모두 이 규칙 · 쓰는 법만 문구함마다 조금씩)
           - 🗄️ 하단 메뉴 문구함 서랍에서 톡 = 페이지 위에 놓여요 · 한 번 더 톡 = 치워요
           - 놓인 문구함을 클릭 · 터치 = 손에 들어요 (🖱 마우스에 붙어 다니고 · 👆 터치는 누른 곳으로 순간 이동)
           - 들고 있는 채 다른 놓인 문구함을 클릭 · 터치하면 바꿔 들어요 (🖱 지나가기만 해선 안 바뀌어요 · 도련 10-18) · 들고 있던 것은 그 문구함이 있던 자리에 놓여요
           - 📎 집게는 바인더 링이 열려 표지가 사라지면 다 같이 사라지고 (⚡ 자동 · ✋ 수동) · 링에 다시 끼우면 다시 나와요
           - 들고 클릭 · 터치 = 쓰기 : 🪡 핀셋 집기(스티커 옮기기 · 돌리기 · 메뉴 · 원래대로) · 🕳️ 펀칭기 구멍 · 🩹 양면테이프 끌어서 바르기 · 📎 집게 테두리에 꽂기
             🕳️ · 📎 는 제자리 근처를 누르면 착 붙어요 (스냅) · 그 밖에선 옮겨지기만 해요
           - 다이어리(종이 둘레) 밖으로는 못 나가요 : 🖱 나가면 그 끝자리에 내려놓고 마우스 화살표로 · 👆 다이어리 밖을 누르면 내려놓아요 · 🪡 핀셋만 밖으로도 (스티커 창 등)
           - 🪡 핀셋을 안 들면 스티커를 못 만져요 (글 메모는 그대로) · 다이어리를 처음 열면 핀셋이 페이지에 하나 놓여 있어요
           - 저장 : 📎 집게는 권마다 (설정 'diary_clips' { 권 id : { 색 : { f 테두리 자리 } | { x, y 종이 위 자리(비율) } } })
             🕳️ 뚫은 구멍 (설정 'diary_holes' { 권 id : { 장 : 12칸 표시 } }) · 🩹 바른 테이프는 페이지 꾸밈(그림)이라 핀셋으로 옮기고 지울 수 있어요
             다른 문구함은 다이어리를 다시 열면 문구함 서랍으로 돌아가요 · ⚡ 자동 끼우기의 기본펀치(PUNCHES)는 목록에 없어요 (연출에만) */
        /* 🪡 핀셋 없이 스티커를 누르면 그 자리에 말풍선 '핀셋을 사용해 주세요' (도련 10-19 · 페이지 · 🪟 고르는 창 · 📒 수첩 js/stknote.js) */
        let twzSayT = 0;
        function twzSay(x, y, t, ms) {                                            // t : 다른 말 (✂️ 가위 · scsSay) · ms : 떠 있는 시간
            let b = document.getElementById('twzSay2');
            if (!b) { b = document.createElement('div'); b.id = 'twzSay2'; b.className = 'twz-say'; document.body.appendChild(b); }
            b.textContent = t || '🪡 핀셋을 사용해 주세요';
            const hw = Math.max(90, b.offsetWidth / 2 + 8); b.style.left = Math.max(hw, Math.min(innerWidth - hw, x)) + 'px';   // 말이 길어도 화면 안에 b.style.top = Math.max(40, y - 14) + 'px';
            b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
            clearTimeout(twzSayT); twzSayT = setTimeout(() => b.classList.remove('on'), ms || 1600);
            if (!t) gdNeed('tweez');                                            // 🩷 핀셋 있는 곳을 깜박여 알려 줘요
        }
        /* 🩷 이 문구가 필요해요 (도련 10-21) : 🪡 핀셋 없이 스티커를 만지거나 · ✂️ 가위 없이 모조지를 오리려 할 때 (twzSay · scsSay)
           - 그 문구가 페이지에 놓여 있으면 → 페이지의 그 문구 둘레가 핑크로 깜박 (안 보이는 쪽이면 먼저 페이지 안으로 소환 · gdHome)
           - 없으면 → 🗄️ 문구함이 뜨고 그 서랍이 핑크로 깜박 · 톡 하면 꺼내져요 */
        function gdNeed(g) {
            if (!isCoverOpen || !spKeep()) return;                              // 🏠 연습장(저장 안 하는 공간)에선 문구함을 열지 않아요
            const blink = el => { if (!el) return; el.classList.remove('need'); void el.offsetWidth; el.classList.add('need'); clearTimeout(el._needT); el._needT = setTimeout(() => el.classList.remove('need'), 2600); };
            const on = gdOnPage(g).map(gdEl).find(el => el && !el.classList.contains('held'));
            if (on) { gdHome(on); blink(on); return; }
            if (UI.desk() && window.dkwTrayOpen) { dkwTrayOpen(g); return; }   // 🪑 책상 = 서랍장 문구함 서랍이 열리고 그 문구가 깜박 (js/deskgd.js)
            const m = document.getElementById('gdCabModal');
            if (!m || m.style.display !== 'flex') openGdCab();
            blink(document.querySelector(`#gdCab .gdc-dr[data-g="${g}"]`));
        }
        window.twzSay = twzSay;
        window.scsSay = (x, y) => { twzSay(x, y, '✂️ 가위를 사용해 주세요'); gdNeed('scissors'); };   // 📄 모조지스티커를 가위 없이 오리려고 하면 (js/papermaker.js · 도련 10-19)
        const GD = {};                                                          // w · h : 크기 · hx · hy : 쓰는 끝 (손끝 = 포인터 · 가위 = 날이 종이를 무는 자리) · 🧁 서버 상품 그대로 (gdBuild)
        const gdInfo = id => GD[id] || null;   // 📐 크기 · 쓰는끝 = 상품 그대로 (gdBuild · 없으면 그 문구는 안 나와요)
        const gdArt = id => window.gdPicSvg ? gdPicSvg(id) : '';                 // 🎬 상품공방 그림 그대로 (js/gdpic.js)
        let gdHeld = null, gdG = null, gdInit = false, gdBook = null, gdClipSig = '';
        const gdScs = () => !!gdHeld && (gdInfo(gdHeld) || {}).g === 'scissors';           // gdHeld : 손에 든 문구함 id · gdG : 쓰는 중 (테이프 끌기 · 집게 테두리 끌기)
        const gdIp = () => spHost();                                             // 🏠 문구를 놓는 판 = 지금 공간 (진짜 = #innerPage · 연습장 = 연습장 판 · js/space.js)
        const gdFree = () => spKeep() ? bdFree : null;                           // 📄 링을 연 바인더 종이 = 진짜 다이어리에만
        const gdToolOf = n => { for (let t = n && n.closest && n.closest('.bd-tool'); t; t = t.parentElement && t.parentElement.closest('.bd-tool')) if (t.parentElement === gdIp()) return t; return null; };   // 판에 놓인 문구 (예전 '#innerPage > .bd-tool')
        const gdBoxOf = n => { const b = n && n.closest && n.closest('.element-box'); return b && b.parentElement === spPage() ? b : null; };   // 종이에 붙은 꾸밈 (예전 '#canvasArea > .element-box')
        const gdEl = id => { const ip = gdIp(); return ip ? [...ip.querySelectorAll(':scope > .bd-tool')].find(x => x.dataset.t === id) || null : null; };
        function gdK() { const ip = gdIp(), r = ip.getBoundingClientRect(); return { r, k: r.width / (ip.offsetWidth || r.width) || 1 }; }
        const gdTo = (x, y) => { const { r, k } = gdK(); return { x: (x - r.left) / k, y: (y - r.top) / k }; };   // 화면 → 다이어리(innerPage) 자리
        function gdArea() {                                                     // 다이어리 둘레 (집게가 물 자리만큼 조금 넉넉히) · 화면 안
            const cv = spPage(), r0 = cv && cv.getBoundingClientRect(); if (!r0 || !r0.width) return null;
            const r = { left: r0.left, top: r0.top, right: r0.right, bottom: r0.bottom };
            if (gdFree()) ['l', 'r'].forEach(x => { const b = bdFree.sh[x].el.getBoundingClientRect(); r.left = Math.min(r.left, b.left); r.top = Math.min(r.top, b.top); r.right = Math.max(r.right, b.right); r.bottom = Math.max(r.bottom, b.bottom); });   // 📄 옮긴 종이까지
            const m = 26; return { l: Math.max(0, r.left - m), t: Math.max(0, r.top - m), r: Math.min(innerWidth, r.right + m), b: Math.min(innerHeight, r.bottom + m) };
        }
        const gdIn = (x, y) => { const a = gdArea(); return !!a && x >= a.l && x <= a.r && y >= a.t && y <= a.b; };
        function gdMake(id) {
            const t = gdInfo(id), ip = gdIp(); if (!t || !ip) return null;
            const el = document.createElement('div'); el.className = 'bd-tool ' + t.g; el.dataset.t = id; el.innerHTML = gdArt(id, t);
            Object.assign(el.style, { width: t.w + 'px', height: t.h + 'px' }); if (t.g === 'clip') el.style.transformOrigin = `${t.hx}px ${t.hy}px`;   // 📐 상품 크기 · 📎 집게는 무는 자리에서 돌아요
            ip.appendChild(el); return el;
        }
        function gdCenter(el, x, y) {                                           // 가운데를 그 자리에 (다이어리 자리)
            const t = gdInfo(el.dataset.t); el.classList.remove('edge'); el.style.transform = ''; delete el.dataset.f;
            el.style.left = (x - t.w / 2) + 'px'; el.style.top = (y - t.h / 2) + 'px';
        }
        /* 📥 페이지로 소환 (도련 10-21) : 내려놓은 문구가 페이지 밖(배경지)에 있으면 보이는 페이지 안 가장 가까운 자리로 스르르
           - 🪡 핀셋 · ✂️ 가위를 페이지 밖에서 쓰다가 다른 문구를 고르거나 내려놓을 때 · 테두리에 꽂힌 📎 집게는 그대로 */
        function gdHome(el) {
            const cv = spPage(); if (!el || !cv || el.classList.contains('edge') || !window.dyVisRect) return;
            const v = spRect(), b = el.getBoundingClientRect(); if (!b.width) return;
            const l = Math.max(v.left, 0) + 8, r = Math.min(v.right, innerWidth) - 8, t = Math.max(v.top, 0) + 8, bt = Math.min(v.bottom, innerHeight) - 8;
            const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2, hw = Math.min(b.width / 2, (r - l) / 2), hh = Math.min(b.height / 2, (bt - t) / 2);
            const nx = Math.max(l + hw, Math.min(r - hw, cx)), ny = Math.max(t + hh, Math.min(bt - hh, cy));
            if (Math.abs(nx - cx) < 1 && Math.abs(ny - cy) < 1) return;
            const m = gdMid(el), p = gdTo(nx, ny), p0 = gdTo(cx, cy);
            el.classList.add('home'); gdCenter(el, m.x + p.x - p0.x, m.y + p.y - p0.y);
            setTimeout(() => el.classList.remove('home'), 520);
        }
        const gdMid = el => { const t = gdInfo(el.dataset.t); return { x: (parseFloat(el.style.left) || 0) + t.w / 2, y: (parseFloat(el.style.top) || 0) + t.h / 2 }; };
        function gdSpot(id) {                                                   // 처음 놓이는 자리 : 보이는 종이 가운데쯤 (문구함마다 조금씩 비켜서)
            const r = spRect(), t = gdInfo(id);
            const l = Math.max(r.left, 0), rt = Math.min(r.right, innerWidth), tp = Math.max(r.top, 0), b = Math.min(r.bottom, innerHeight);
            const o = { tweez: [.16, .04], punch: [.3, .2], tape: [-.28, .26], clip: [-.05, -.3], scissors: [-.3, -.04] }[t.g] || [0, 0],   /* 새 종류 = 가운데 */ n = gdIp().querySelectorAll(':scope > .bd-tool').length % 4;
            return gdTo((l + rt) / 2 + (rt - l) * o[0] + n * 18, (tp + b) / 2 + (b - tp) * o[1] + n * 18);
        }
        /* 🗄️ 문구함에 안 가리는 자리 (도련 10-21) : 문구함이 떠 있으면 꺼낸 문구가 그 밑에 깔리지 않게
           pref = 원래 자리(화면 가운데 [x, y]) · w, h = 화면에서의 크기 → 보이는 페이지 안 · 문구함(펜꽂이 포함)과 안 겹치는 가장 가까운 자리
           - 📱 폰처럼 자리가 없으면 맨 위 ✏️ 펜꽂이 자리 (위쪽이 삐죽 나와 보여서 나온 걸 알 수 있어요) */
        function cabFree(w, h, pref) {
            const m = document.getElementById('gdCabModal'), cab = document.getElementById('gdCab'), cv = document.getElementById('canvasArea');
            if (!m || m.style.display !== 'flex' || !cab || !cv || !window.dyVisRect) return pref;
            const v = dyVisRect(cv.getBoundingClientRect()), L = Math.max(v.left, 8), R = Math.min(v.right, innerWidth - 8), T = Math.max(v.top, 8), B = Math.min(v.bottom, innerHeight - 8);
            const a = cab.getBoundingClientRect(), cupEl = cab.querySelector('.gdc-cup'), u = cupEl ? cupEl.getBoundingClientRect() : a, M = 10;
            const c = { l: Math.min(a.left, u.left) - M, t: Math.min(a.top, u.top) - M, r: Math.max(a.right, u.right) + M, b: Math.max(a.bottom, u.bottom) + M };
            const hit = (x, y) => x - w / 2 < c.r && x + w / 2 > c.l && y - h / 2 < c.b && y + h / 2 > c.t;
            const fits = (x, y) => x - w / 2 >= L && x + w / 2 <= R && y - h / 2 >= T && y + h / 2 <= B;
            if (fits(pref[0], pref[1]) && !hit(pref[0], pref[1])) return pref;
            let best = null;
            for (let y = T + h / 2; y <= B - h / 2; y += 16) for (let x = L + w / 2; x <= R - w / 2; x += 16) {
                if (hit(x, y)) continue;
                const d = Math.hypot(x - pref[0], y - pref[1]); if (!best || d < best.d) best = { x, y, d };
            }
            if (best) return [best.x, best.y];
            const n = gdIp() ? gdIp().querySelectorAll(':scope > .bd-tool').length % 4 : 0;   // 여러 개면 조금씩 비켜서
            const p = [u.left + u.width / 2 + (n - 1.5) * 14, u.top]; p.cup = true;   // ✏️ 펜꽂이에 꽂힌 듯 (위쪽 반이 삐죽) · 문구함을 닫으면 페이지 안으로 (gdCabHome)
            return p;
        }
        (function gdCabHome() {                                                 // 🗄️ 문구함을 닫으면 펜꽂이 자리에 꺼내 둔 문구는 페이지 안으로 스르르 (gdHome)
            const m = document.getElementById('gdCabModal'); if (!m) return;
            new MutationObserver(() => {
                if (m.style.display === 'flex') return;
                document.querySelectorAll('#innerPage > .bd-tool[data-cup]').forEach(el => { delete el.dataset.cup; if (!el.classList.contains('held')) gdHome(el); });
            }).observe(m, { attributes: true, attributeFilter: ['style'] });
        })();
        const gdScr = p => { const { r, k } = gdK(); return [r.left + p.x * k, r.top + p.y * k]; };   // 다이어리 자리 → 화면
        function gdPick(id) {                                                   // 🗄️ 문구함 서랍 톡 : 놓기 ↔ 치우기 (아래 cabFlip)
            if (gdInfo(id) && !spOpen() && UI.desk()) { showMsg('📔 책상 위 다이어리를 펴면 문구를 꺼낼 수 있어요.'); return; }
            if (!gdInfo(id) || !gdIp() || !spOpen()) return;
            const el = gdEl(id);
            if (el) { if (gdHeld === id) gdLet(); el.remove(); }
            else {
                const t = gdInfo(id), k = gdK().k, s = cabFree(t.w * k, t.h * k, gdScr(gdSpot(id))), p = gdTo(s[0], s[1]);   // 🗄️ 문구함에 안 가리게
                const el = gdMake(id); gdCenter(el, p.x, p.y);
                if (s.cup) el.dataset.cup = 1;
                else {                                                          // 기울어진 문구(🪡 · ✂️)는 실제 차지하는 자리로 한 번 더
                    const r = el.getBoundingClientRect(), c = [(r.left + r.right) / 2, (r.top + r.bottom) / 2], s2 = cabFree(r.width, r.height, c);
                    if (s2.cup) el.dataset.cup = 1;
                    else if (s2[0] !== c[0] || s2[1] !== c[1]) { const q = gdTo(s2[0], s2[1]), q0 = gdTo(c[0], c[1]); gdCenter(el, p.x + q.x - q0.x, p.y + q.y - q0.y); }
                }
            }
            if (id.startsWith('clip:')) gdClipSave();
        }
        function gdHold(id, x, y, e) {                                             // 손에 들기 (들고 있던 것은 이것이 있던 자리에)
            const el = gdEl(id); if (!el) return;
            gdPenOff();
            const prev = gdHeld && gdHeld !== id && gdEl(gdHeld);
            if (prev) {
                const fl = e && e.pointerType === 'touch' && gdFloatAt(prev);  // 👆 터치 (✏️ 펜은 마우스처럼 바꿔 들어요) : 떠 있던 것은 그 자리에서 아래로 톡 떨어져요 (도련 10-19 · 누른 자리로 순간이동하지 않게)
                const m = fl || (el.classList.contains('edge') ? gdTo(x, y) : gdMid(el));   // 🖱 마우스 : 손에 든 채 따라오던 자리 = 누른 자리라 서로 바꿔요
                prev.classList.remove('held', 'rim-ok'); gdCenter(prev, m.x, m.y); if (!fl) prev.dataset.nh = 1;   // 🖱 포인터가 그 위를 벗어나기 전엔 눌러도 다시 바뀌지 않게 (👆 떨어진 자리는 누른 자리가 아니라 바로 다시 집어요)
                if (fl) { prev.classList.remove('drop'); void prev.offsetWidth; prev.classList.add('drop'); setTimeout(() => prev.classList.remove('drop'), 320); }
                gdHome(prev);                                                   // 📥 페이지 밖이었으면 페이지 안으로
            }
            if (window.skLetGo) skLetGo();                                   // ✂️ 들고 있던 칼은 그 자리에 (js/stkcut.js)
            gdHeld = id; el.classList.remove('edge'); el.style.transform = ''; delete el.dataset.f; delete el.dataset.nh; el.classList.add('held');
            gdFollow(x, y, e);
            if (gdIsTwz(id) && e && window.pinAt) pinAt(e);
            if (!gdIsTwz(id)) { if (gdScs()) { scs.ang = SCS_LAY; scs.to = SCS_REST; } setTimeout(() => toolGlow(gdScs() ? scs.el : el), 0); }   // ✂️ 놓인 모양에서 든 모양으로 스르르 돌아요 · ✨ 한 번 반짝                     // 🪡 집은 자리에 바로 핀셋이 떠요 (👆 터치는 그 자리에서 둥실)
            if (id.startsWith('clip:') || (prev && prev.dataset.t.startsWith('clip:'))) gdClipSave();
        }
        function gdFloatAt(el) {                                                // 떠 있는 문구함의 가운데 (다이어리 자리) : 🪡 핀셋 · ✂️ 가위는 화면 위에 따로 떠 있어요
            const f = gdIsTwz(el.dataset.t) ? document.querySelector('.twz.pin-cur') : gdInfo(el.dataset.t).g === 'scissors' ? scs.el : el;
            const r = f && !f.hidden && f.getBoundingClientRect(); if (!r || !r.width) return null;
            return gdTo(r.left + r.width / 2, r.top + r.height / 2);
        }
        function gdLetAir(keep) { const id = gdHeld, el = id && gdEl(id); if (el && !id.startsWith('clip:') && spKeep() && window.dkwAirPut && dkwAirPut(id, el, keep)) return; gdLet(); }   // 💻 📲 책상 = 다이어리 밖 공중에 내려놔요 (도련 11-12 · js/deskgd.js)
        function gdLet() {                                                      // 내려놓기 (지금 자리에)
            const el = gdHeld && gdEl(gdHeld), id = gdHeld; gdHeld = null; document.body.classList.remove('gd-on'); gdSlot(null); scsHide();
            if (!el) return;
            el.classList.remove('held', 'snap', 'rim-ok');
            gdHome(el);                                                         // 📥 페이지 밖이었으면 페이지 안으로
            if (id.startsWith('clip:')) gdClipSave();
        }
        function gdFollow(x, y, e) {                                            // 손끝(쓰는 끝) = 포인터
            const el = gdHeld && gdEl(gdHeld); if (!el) return;
            if (gdIsTwz(gdHeld)) { document.body.classList.remove('gd-on'); return; }   // 🪡 핀셋은 원래 핀셋 화살표가 따라와요 (js/elements.js pinMove)
            if (gdScs()) { document.body.classList.remove('gd-on'); scsPut(x, y, e, true); return; }   // ✂️ 가위는 화면 위에 떠서 따라와요 (📒 수첩 · 모조지 종이 위로도)
            const t = gdInfo(gdHeld), p = gdTo(x, y);
            el.style.left = (p.x - t.hx) + 'px'; el.style.top = (p.y - t.hy) + 'px';
            document.body.classList.toggle('gd-on', !e || e.pointerType === 'mouse');   // 💻 다이어리 위에선 화살표 대신 문구함
        }
        const gdEat = e => { e.preventDefault(); e.stopPropagation(); bdEat = Date.now(); };
        /* ✏️ 필기구 ↔ 다른 문구 자유롭게 (도련 10-21) : 다른 문구를 들면 필기구는 구석 펜꽂이에서 쉬어요 (끝은 구석 펜꽂이 톡만 · js/draw.js penRest) */
        /* ✨ 문구를 드는 순간 핑크빛으로 한 번 반짝 (도련 10-21 · 모든 문구 : 핀셋 · 가위 · 칼 · 필기구 · 펀칭기 · 테이프) */
        function toolGlow(el) { if (!el) return; el.classList.remove('pick-glow'); void el.offsetWidth; el.classList.add('pick-glow'); clearTimeout(el._glowT); el._glowT = setTimeout(() => el.classList.remove('pick-glow'), 900); }
        window.toolGlow = toolGlow;
        function gdPenOff() { if (window.penRest) penRest(); }
        /* 🪡 하얀 창(씰 종이 · 조각 봉투)이 떠 있어도 빈 곳 너머 페이지의 문구는 집을 수 있어요 (그 창에서 떼려면 핀셋이 필요해서 · 도련 10-21)
           화면 가득한 캔버스(#pelCv · #pcbCv)의 그 자리가 비어 있을 때만 (종이 · 스티커 · 봉투 위는 그 창이 받아요) */
        function gdUnderRoom(e) {
            const cv = e.target && e.target.id && (e.target.id === 'pelCv' || e.target.id === 'pcbCv') ? e.target : null; if (!cv) return null;
            try { const r = cv.getBoundingClientRect(), k = cv.width / (r.width || 1), a = cv.getContext('2d').getImageData(Math.round((e.clientX - r.left) * k), Math.round((e.clientY - r.top) * k), 1, 1).data[3]; if (a > 40) return null; /* 흐린 배경(알파 ~26)은 빈 곳 */ } catch (er) { return null; }
            return document.elementsFromPoint(e.clientX, e.clientY).map(gdToolOf).find(Boolean) || null;
        }
        /* ✋ 핀셋 없이 손으로도 만지는 것 (도련 11-03 · 현실처럼) : 🎀 마스킹테이프 (핀셋도 돼요 · 키즈컷처럼 핀셋만 쓰는 테이프가 생기면 여기서 빼요) */
        const gdHandOk = box => { const im = box && box.querySelector(':scope > img'); return !!im && typeof isTapeSrc === 'function' && isTapeSrc(im.dataset.src || im.getAttribute('src')); };
        function gdDown(e) {                                                    // 누르는 순간 (바인더 손짓 · 메뉴 · 스티커보다 먼저 · 아래 bd pointerdown 에서 불러요)
            if (!spOpen() || !e.target || !e.target.closest || (e.pointerType === 'mouse' && e.button !== 0)) return false;
            const ip = gdIp(); if (!ip || ip.offsetParent === null) return false;
            const inDy = ip.contains(e.target), tool = gdToolOf(e.target) || gdUnderRoom(e);
            if (tool && !tool.classList.contains('held') && !(tool.dataset.nh && gdHeld)) {   // 놓인 문구함 = 들기
                gdPenOff();                                                     // ✏️ 필기구를 쓰던 중이면 쓴 것은 붙이고 필기구는 펜꽂이에 → 이 문구를 들어요 (도련 10-21) · 꽂힌 집게는 끌면 테두리를 따라 · 톡 하면 들기 (🖱 방금 바꿔 내려놓은 것 위는 든 것을 써요)
                gdEat(e);
                if (tool.classList.contains('edge')) gdG = { k: 'rail', el: tool, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
                else gdHold(tool.dataset.t, e.clientX, e.clientY, e);
                return true;
            }
            if (gdScs()) {                                                      // ✂️ 가위 : 어디를 눌러도 손에 그대로 (모조지 종이 · 📒 수첩은 그쪽에서 오려요 js/papermaker.js)
                scsPut(e.clientX, e.clientY, e);
                if (!inDy || e.target.closest('.page-header, button, textarea, input, select')) return false;
                gdEat(e);
                const box = gdBoxOf(e.target);
                if (box && !box.querySelector('textarea')) twzSay(e.clientX, e.clientY);   // 스티커는 🪡 핀셋으로
                else scsSnip();                                                 // 빈 곳 = 허공에 싹둑
                return true;
            }
            if (gdHeld && !gdIsTwz(gdHeld)) {
                const rim = (gdInfo(gdHeld) || {}).g === 'clip' && gdIn(e.clientX, e.clientY) && !e.target.closest('.modal, .desk-tip, .dky-lbp, #deskStage .desk-item');   // 📎 집게는 종이 바로 바깥(테두리 둘레)을 눌러도 꽂혀요 (도련 10-30 : 왼쪽 · 아래는 바깥이 다이어리가 아니라 안 꽂혔어요)
                if ((!inDy && !rim) || !gdIn(e.clientX, e.clientY)) { gdLetAir(); return false; }   // 👆 다이어리 밖을 누르면 내려놓아요
                if (e.target.closest('.page-header, button, textarea, input, select')) return false;
                gdEat(e); gdFollow(e.clientX, e.clientY, e); gdUse(e); return true;
            }
            if (!gdIsTwz(gdHeld) && inDy) {                                     // 🪡 핀셋이 없으면 스티커를 못 만져요 (글 메모는 그대로 · 🎀 마스킹테이프는 손으로도 · 도련 11-03)
                const box = gdBoxOf(e.target);
                if (box && !box.querySelector('textarea') && !gdHandOk(box)) { gdEat(e); twzSay(e.clientX, e.clientY); return true; }
            }
            return false;
        }
        function gdUse(e) {
            const g = gdInfo(gdHeld).g;
            if (g === 'punch') gdPunch(e.clientX, e.clientY, e);
            else if (g === 'tape') { const pv = document.createElement('div'); pv.className = 'gd-tape-pv'; gdIp().appendChild(pv); gdG = { k: 'tape', id: e.pointerId, a: { x: e.clientX, y: e.clientY }, b: { x: e.clientX, y: e.clientY }, pv }; gdTapePv(); }
            else if (g === 'clip') gdClipSnap(e.clientX, e.clientY);
        }
        window.addEventListener('pointermove', e => {
            if (!spOpen()) return;
            const g = gdG;
            if (g && g.id === e.pointerId) {
                if (g.k === 'tape') { const a = gdArea(); g.b = { x: Math.max(a.l, Math.min(a.r, e.clientX)), y: Math.max(a.t, Math.min(a.b, e.clientY)) }; gdFollow(g.b.x, g.b.y, e); gdTapePv(); }
                else if (g.k === 'rail' && (g.moved || Math.hypot(e.clientX - g.x, e.clientY - g.y) > 6)) { g.moved = true; gdRailMove(g.el, e.clientX, e.clientY); if (gdHeld && !gdIsTwz(gdHeld)) gdFollow(e.clientX, e.clientY, e); }
                return;
            }
            if (!gdHeld) return;
            const t0 = gdToolOf(e.target), t = t0 && !t0.classList.contains('held') && !t0.classList.contains('edge') ? t0 : null;
            const ip0 = gdIp(); if (ip0) ip0.querySelectorAll(':scope > .bd-tool[data-nh]').forEach(x => { if (x !== t) delete x.dataset.nh; });
            if (gdIsTwz(gdHeld)) return;                                      // 🪡 핀셋은 밖으로도
            if (gdScs()) { scsPut(e.clientX, e.clientY, e); return; }           // ✂️ 가위도 밖으로 (📒 수첩 · 모조지 종이)
            if (!gdIn(e.clientX, e.clientY) && gdInfo(gdHeld).g !== 'clip') { gdLetAir(e.pointerType === 'mouse'); return; }   // 밖으로 = 그 끝자리에 내려놓고 마우스 화살표 · 📎 집게는 페이지 밖에서 무는 도구라 밖으로도 따라와요 (도련 10-30 · 내려놓기는 다이어리 밖을 누를 때)
            if (gdInfo(gdHeld).g === 'punch' && e.pointerType !== 'touch' && gdPunchHover(e.clientX, e.clientY)) { document.body.classList.add('gd-on'); return; }
            if (gdInfo(gdHeld).g === 'clip') gdClipHint(e.clientX, e.clientY);   // 📎 꽂히는 자리면 반짝   // 🕳️ 가장자리에 착
            gdFollow(e.clientX, e.clientY, e);
        }, true);
        ['pointerup', 'pointercancel'].forEach(k => window.addEventListener(k, e => {
            const g = gdG; if (!g || g.id !== e.pointerId) return;
            gdG = null; bdEat = Date.now();                                     // 뒤따르는 click 은 메뉴로 안 가요
            if (g.k === 'tape') { g.pv.remove(); if (k === 'pointerup') gdTapeAdd(g.a, g.b); }
            else if (g.k === 'rail') { if (g.moved) gdClipSave(); else if (k === 'pointerup') gdHold(g.el.dataset.t, e.clientX, e.clientY, e); }   // 꽂힌 집게를 톡 = 빼서 들기
        }, true));
        window.addEventListener('blur', () => { document.body.classList.remove('gd-on'); });
        /* ✂️ 가위 (도련 10-19) : 문구함 → 페이지에 놓고 → 누르면 손에 · 📄 모조지스티커는 가위로만 오려요 (js/papermaker.js)
           - 든 가위는 화면 위에 떠서 따라와요 (.scs-cur · 📒 수첩 · 모조지 종이 위로도) · 날은 벌린 채
           - 오리는 동안 : 조금 갈 때마다(SCS_STEP) 날이 싹둑 닫혔다 벌어져요 (소리 없음 · 도련 10-19) · 가위 끝이 오리는 방향으로 부드럽게 돌아요
           - 자른 선은 싹둑 한 번마다 한 토막씩 늘어나요 (papermaker 의 d.shown) · 페이지 빈 곳을 누르면 허공에 싹둑
           - 종이는 가만히 있어요 (칼선 없이 마음대로 오리니까 · 도련 10-19) */
        const SCS_STEP = 12, SCS_MAX = 14, SCS_REST = -62, SCS_LAY = -20;   // SCS_REST = 든 가위 기울기 (날이 왼쪽 위 · 도련 10-21) · SCS_LAY = 놓인 가위 (css .bd-tool.scissors)
                             // 싹둑 한 번 거리(px) · 가장 벌린 각도 · 쉬는 기울기(도) (10-21 : 더 자주 싹둑싹둑 · 도련)
        const SCS_WALK = 46, SCS_GAP = 120;                                     // 들고 다닐 때도 이만큼 가면 싹둑 · 싹둑 사이 최소 시간(ms)
        /* 🎯 가위 조준 (도련 10-21) : 누르는 자리(손가락 · 마우스) 위로 SCS_LIFT 만큼 띄워서 가위가 손에 안 가려져요
           - 진짜 자르는 자리 = 가위 날 끝 = 빨간 십자선 (.scs-aim · FPS 게임처럼) → 십자선이 지나간 대로 오려져요 (js/papermaker.js scsAim)
           - 💻 마우스는 화살표가 그대로 보여요 (누르는 자리) */
        const SCS_LIFT = 100;
        const scsSvg = id => window.gdPicSvg ? gdPicSvg(id, { parts: [['날1', 'scs-b'], ['날2', 'scs-a']] }) : '';   // ✂️ 상품공방 그림 (날1 · 날2 가 축에서 벌어져요 · 조각이 없으면 디자인 그대로)
        const scs = { el: null, x: 0, y: 0, ang: SCS_REST, to: SCS_REST, snip: -1e9, raf: 0, cut: null, on: false, gx: null, gy: 0, dodgeT: 0 };
        /* ✂️ 가위가 갈 수 있는 곳 = 🪡 핀셋과 같은 규칙 (도련 10-21 · js/elements.js pinOver · pinRel · pinBusy) + 📄 모조지 종이 위
           - 💻 마우스 : 갈 수 없는 곳(하단메뉴 · 창 · 버튼 · 메뉴 · 날짜바)으로 가면 그 끝자리에 멈추고 화살표 · 돌아오면 다시 따라와요
           - 📱 📲 터치 : 가위와 상관있는 곳을 누를 때만 그 자리로 · 나머지는 그 자리에
           - ✏️ 그리기 · ✂️ 칼 · 📏 자 · ✏️ 펜꽂이를 쓰는 동안은 안 따라와요 · 창 · 메뉴가 가리면 비켜요 (scsFrame · dodgeBy) */
        function scsRel(x, y, e) {
            const top = document.elementsFromPoint(x, y).find(n => !n.closest('.scs-cur, .pin-cur, .twz-say'));
            if (!top) return false;
            if (top.closest('.pm-z')) return !(window.pinBusy && pinBusy());      // 📄 모조지 종이 = 오리는 곳
            return e && e.pointerType === 'touch' ? !!(window.pinRel && pinRel(x, y)) : !!(window.pinOver && pinOver(x, y));   // ✏️ 펜은 마우스처럼 (닿기 전부터 따라와요)
        }
        let scsDown = 0;                                                        // 누르는 동안 : 비키지 않고 · 🎈 둥실도 멈춰요 (body.gd-press · css)
        window.addEventListener('pointerdown', () => { scsDown = 1; document.body.classList.add('gd-press'); }, true);
        ['pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, () => { scsDown = 0; document.body.classList.remove('gd-press'); }, true));
        function scsPut(x, y, e, force) {                                       // 따라가기 (force : 손에 든 순간) · x, y = 누르는 자리 → 가위는 SCS_LIFT 위
            if (!force && !scs.cut && !scsRel(x, y, e)) { document.body.classList.remove('scs-on'); return; }
            scs.gx = null;                                                      // 비키던 중이면 그만
            y -= SCS_LIFT;
            if (!scs.el) { scs.el = document.createElement('div'); scs.el.className = 'scs-cur'; document.body.appendChild(scs.el); }
            if (scs.id !== gdHeld) {                                            // 든 가위 그림 (가위마다) · 🎯 자르는 자리 = 쓰는끝 (그림 px → 54 × 126 상자)
                scs.id = gdHeld; scs.el.innerHTML = scsSvg(gdHeld);
                const p = window.gdPic && gdPic(gdHeld); scs.piv = gdPicTip(p);   // 📐 상품 크기 · 쓰는끝 (gdBuild 가 검수한 가위만 들 수 있어요)
                Object.assign(scs.el.style, { width: p.size[0] + 'px', height: p.size[1] + 'px', transformOrigin: `${scs.piv[0]}px ${scs.piv[1]}px` });
            }
            if (!scs.aim) { scs.aim = document.createElement('div'); scs.aim.className = 'scs-aim'; scs.aim.setAttribute('aria-hidden', 'true'); document.body.appendChild(scs.aim); }
            if (!scs.cut && scs.on) {                                           // 들고 다닐 때도 가끔 싹둑 (귀엽게)
                scs.walk = (scs.walk || 0) + Math.hypot(x - scs.x, y - scs.y);
                if (scs.walk >= SCS_WALK && performance.now() - scs.snip > SCS_GAP * 2) { scs.walk = 0; scsSnip(); }
            }
            if (scs.cut) {                                                      // ✂️ 오리는 중 : 간 거리만큼 싹둑 · 가는 방향으로 돌기
                const c = scs.cut, dx = x - c.x, dy = y - c.y, l = Math.hypot(dx, dy);
                if (l >= 6) { c.acc += l; c.x = x; c.y = y; scs.to = Math.atan2(dy, dx) * 180 / Math.PI + 90; }
                if (c.acc >= SCS_STEP && performance.now() - scs.snip > SCS_GAP) { c.acc = 0; scsSnip(); if (c.on) c.on(); }
            }
            scs.x = x; scs.y = y; scs.el.hidden = false; scs.aim.hidden = false; scs.on = true;
            document.body.classList.toggle('scs-on', !e || e.pointerType !== 'touch');   // 💻 ✏️ 따라오는 중 (마우스 · 펜)
            if (!scs.raf) scs.raf = requestAnimationFrame(scsFrame);
        }
        function scsHide() { scs.on = false; scs.cut = null; if (scs.el) scs.el.hidden = true; if (scs.aim) scs.aim.hidden = true; document.body.classList.remove('scs-on'); }
        function scsSnip() { scs.snip = performance.now(); try { if (navigator.vibrate) navigator.vibrate(4); } catch (e) {} }
        function scsFrame(t) {
            scs.raf = 0;
            if (!gdScs() || !spOpen()) { scsHide(); return; }
            if (!scs.on || !scs.el) return;
            if (scs.cut && scs.cut.acc >= 2 && t - scs.snip > SCS_GAP) { scs.cut.acc = 0; scsSnip(); if (scs.cut.on) scs.cut.on(); }   // ✂️ 손을 멈춰도 남은 만큼 싹둑 → 자른 선이 십자선까지 따라와요
            if (!scs.cut && !scsDown && !document.body.classList.contains('scs-on') && t - scs.dodgeT > 120 && window.dodgeBy) {   // 🚪 창 · 메뉴가 가리면 바로 옆 빈자리로 스르르 (🪡 핀셋 pinDodge 와 같아요)
                scs.dodgeT = t;
                if (scs.gx == null) { const c = dodgeBy(scs.el.getBoundingClientRect()); if (c) { scs.gx = scs.x + c[0]; scs.gy = scs.y + c[1]; } }
            }
            if (scs.gx != null) { scs.x += (scs.gx - scs.x) * .12; scs.y += (scs.gy - scs.y) * .12; if (Math.hypot(scs.gx - scs.x, scs.gy - scs.y) < .5) { scs.x = scs.gx; scs.y = scs.gy; scs.gx = null; } }
            let d = ((scs.to - scs.ang + 540) % 360) - 180; scs.ang += d * (scs.cut ? .22 : .1);   // 손떨림에 덜덜 떨지 않게 부드럽게
            const k = t - scs.snip, o = k < 45 ? 1 - .92 * k / 45 : k < 120 ? .08 + .92 * (k - 45) / 75 : 1;   // 싹둑 : 0.045초에 닫고 0.075초에 다시 벌려요 (10-21 빠르게)
            const a = (o * SCS_MAX).toFixed(2), g = scs.el.querySelectorAll('g.scs-a, g.scs-b'), pv = scs.piv;
            if (g.length === 2) { scs.el.querySelector('g.scs-b').style.transform = `rotate(${-a}deg)`; scs.el.querySelector('g.scs-a').style.transform = `rotate(${a}deg)`; }   // 날1 · 날2 = 축에서 (js/gdpic.js transform-origin)
            scs.el.style.transform = `translate(${scs.x - pv[0]}px, ${scs.y - pv[1]}px) rotate(${scs.ang.toFixed(2)}deg)`;   // 자르는 자리가 십자선 위에
            if (scs.aim) scs.aim.style.transform = `translate(${scs.x}px, ${scs.y}px)`;   // 🎯 십자선 = 날 끝 (돌지 않아요)
            scs.raf = requestAnimationFrame(scsFrame);
        }
        /* 📄 모조지 오리기 (js/papermaker.js) : 시작 · 끝 · 싹둑마다 on() (자른 선을 한 토막 늘려요) */
        function scsCutStart(x, y, on) { if (!gdScs()) return false; scs.cut = { x, y: y - SCS_LIFT, acc: 0, on }; scsPut(x, y, null, true); return true; }   // x, y = 누르는 자리 (자르는 자리는 십자선)
        function scsCutEnd(done) { if (!scs.cut) return; scs.cut = null; scs.to = SCS_REST; if (done) scsSnip(); }
        /* 🗄️ 하단 메뉴 '문구함' : 화면 가운데 세로 서랍장 (도련 10-19)
           - 서랍장 위에는 ✏️ 펜꽂이 (톡 = 그리기 · js/draw.js openDraw · 꽂을 필기구는 펜꽂이 앞 '보관함') · 서랍마다 이름표 : 핀셋 · 집게 · 펀칭기 · 양면테이프 · 가위 · 칼 · 자
           - 서랍 = 그 종류의 보관함 : 앞면 톡 = '주로 쓰는 것'을 바로 페이지에 (다시 톡 = 치우기 · 서랍이 빠끔 + '페이지에 ✓')
           - 손잡이 톡 · 서랍 꾹 = 서랍이 쭉 열려서 가진 디자인이 6개씩 보여요 (‹ › · 옆으로 밀어 넘기기 · 서랍 이름표에 몇 개인지) → 톡 = 그걸 '주로 쓰는 것'으로 + 페이지에 (다시 톡 = 치우기)
             집게처럼 여러 개 쓰는 것은 여러 개 꺼낼 수 있어요 (GD_MULTI) · 핀셋 · 가위처럼 하나만 쓰는 것은 놓인 것이 바뀌어요
           - 주로 쓰는 것 : 'diary_gd_main' { 종류: id } · 지금은 종류마다 기본 1개 (집게는 6색) · 나중에 📦 문구점에서 산 것을 gdOwn 에 더해요
           - ✂️ 칼 · 📏 자 서랍 (GD_TOOL · 도련 10-19 · 펀칭기 · 가위처럼 문구함에서 꺼내 써요) : 톡 = 보이는 쪽 가운데에 자를 놓아요 · 칼을 들어요 (js/ruler.js rlShow · js/stkcut.js skKnife) · 다시 톡 = 넣기 */
        /* 🗄️ 문구 종류 = 이 표 한 곳 (새 종류 = 한 줄 · 순서 = 서랍 순서) : [종류, 이름, 🪑 책상 모드 (js/deskgd.js)]
             🪑 { cup : ✏️ 책상 펜꽂이에 꽂을 수 있어요 (길쭉한 것 · 없으면 서랍에만) · hand : 꺼내면 바로 손에 들어요 (없으면 페이지에 놓여요)
                 sec : 🗄️ 문구함 서랍의 칸막이 이름 (같은 이름끼리 한 칸 · 없으면 종류 이름으로 한 칸) · len : 펜꽂이에 꽂힌 길이 (1 = 보통) }
             상품 하나만 다르게 = 상품공방 속성 '펜꽂이' (예 / 아니오 · js/deskgd.js dkwCanCup) */
        const GD_CAB = [['tweez', '핀셋', { hand: 1 }], ['clip', '집게', {}], ['punch', '펀칭기', {}], ['tape', '양면테이프', {}], ['scissors', '가위', { hand: 1 }], ['knife', '칼', { hand: 1 }], ['ruler', '자', {}]];   // 종류 = 하는 일 (hand = 꺼내면 손에) · 서랍칸 · 펜꽂이 · 꽂이길이 = 🧁 상품마다 (도련 11-02)
        const GD_MULTI = ['clip'], GD_TOOL = ['knife', 'ruler'];
        const cabHoldAgain = id => { if (id.startsWith('knife') && window.skHold) skHold(true); };   // ✋ 이미 꺼낸 도구를 다시 손에 (따로 그리는 도구 GD_TOOL · 새 도구 = 여기 한 줄)
        const cabTool = id => GD_TOOL.includes(id.split(':')[0]);
        const cabKinds = g => (g === 'knife' ? (window.skKinds ? skKinds() : []) : (window.rlKinds ? rlKinds() : []));
        const cabK = id => id.split(':')[1];
        const cabAll = g => GD_TOOL.includes(g) ? cabKinds(g).map(t => g + ':' + t.id) : gdOwn(g);   // 🏪 기본상품 샵에 있는 모든 디자인
        /* ✏️ 내 문구 (도련 10-27) : 처음엔 🎁 핀셋 + 필기구 5 (GD_STARTER · 도련 11-01) · 나머지는 🏪 기본상품 샵 '문구'에서 받고 · 서랍 속 🗑 버리기로 버려요 (→ 휴지통 30일 · gdBin)
           저장 : 문구 / 🔐 _목록1.json … 'diary_gd_own' [{u, id: 디자인, c: 받은- 파일 id} | {u, id, g: 1 = 🎁 처음 선물}] (03_저장지도 1-1) (없으면 = 아무것도 없음 · 예전에 쓰던 사람은 드라이브를 읽은 뒤 js/desk.js giftEnsure 가 되살려요) · 게스트는 이 기기 malang_gd_own
                  🎁 처음 선물 = 목록 한 줄만 (from 선물 · 받은- 파일 없음 · 버리면 목록에서 빠져요)
                  문구 / 받은-<c>.json = 가진 문구 하나에 파일 하나 (종류가 섞여요 · GD_DIRS 는 이름 표 · 도련 11-07) (js/coll.js · 기본 · 유료 · 이벤트 · 공유 모두 같은 폴더)
           페이지에 꺼내 둔 것은 못 버려요 (마지막 하나도 버릴 수 있어요) */
        const GD_OWN = 'diary_gd_own', GD_OWN_L = 'malang_gd_own';
        /* ✏️ 문구도 같은 것을 여러 개 (도련 11-07 · 현실처럼 · 10-28 에 정한 것) : 한 칸 = { u : 하나하나 id (처음 것 · 선물 = 디자인 id 그대로), id : 디자인, c : 파일, g : 선물 }
             문구함 · 페이지 · 문구의 집은 디자인마다 (같은 것은 한곳에 모여요 · 문구함에 ×2) · 버리면 하나씩 */
        const gdOwnList = () => { const v = prefGet(GD_OWN, GD_OWN_L), seen = new Set(); return Array.isArray(v) ? v.map(o => typeof o === 'string' ? { id: o } : Object.assign({}, o)).filter(o => o && typeof o.id === 'string').map(o => { const u = typeof o.u === 'string' && o.u ? o.u : o.id, g = !!(o.g || o.start); delete o.g; delete o.start; if (o.from === 'basic') delete o.from;   /* 무료 = 비워 둬요 · 공유 · 선물 … 은 그대로 */ return Object.assign(o, { u }, g ? { g: 1 } : {}); }).filter(o => !seen.has(o.u) && seen.add(o.u)) : null; };   // 🎁 선물 = 목록 한 줄 (from 선물)
        const gdCount = id => (gdOwnList() || []).filter(o => o.id === id).length;
        const gdNewU = id => id + '~' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);   // 받은 것 = 늘 새 번호 (선물 u = 디자인 id 와 안 겹쳐요)   // 같은 디자인은 하나만
        const gdOwnSet = () => { const L = gdOwnList(); return L ? new Set(L.map(o => o.id)) : null; };
        const gdColl = id => { const g = cabGOf(id); if (!(typeof collOf === 'function' && GD_DIRS[g])) return null; const C = collOf(dirPath(DIRS.gd), '받은-'); C.noIdx = true; return C; };   // ✏️ 문구 폴더 하나 (종류가 섞여요 · 원본 파일만 · 가진 것 = 문구 / _목록N · 도련 11-07)
        const gdAdding = new Set();                                            // 파일을 만드는 중인 디자인 (두 번 만들지 않게)
        async function gdFileAdd(o, from) {
            const u = o.u || o.id, C = gdColl(o.id); if (!C || o.c || gdAdding.has(u)) return;
            gdAdding.add(u);
            try { o.c = await collAdd(C, { s: await ownLock({ u, id: o.id, from }) }, '', { id: o.id }); } catch (e) { console.warn('문구 파일', e); }   // 🔐 스티커처럼 암호화 · 하나하나 u
            finally { gdAdding.delete(u); }
        }
        let gdFiling = false;
        const gdRec = o => Object.assign({ u: o.u || o.id, id: o.id, from: o.from || 'basic' }, o.c ? { c: o.c } : {}, o.g ? { start: 1 } : {});   // 🏷️ 무료상품 · 🎁 처음받기 = start: 1 (도련 11-09)
        async function gdFilesFill() {                                         // 선물이 아닌데 파일이 아직 없는 문구 → 종류 폴더에 (드라이브를 읽은 뒤에만 · js/desk.js 가 불러요)
            if (gdFiling || typeof drive === 'undefined' || !drive.ready || (window.deskGiftBusy && deskGiftBusy())) return;   // 🎁 선물을 정하는 중이면 기다려요
            const L = gdOwnList(); if (!L) return;
            const need = L.filter(o => !o.c && !o.g && !gdAdding.has(o.u));
            if (!need.length) return;
            gdFiling = true;
            try { for (const o of need) await gdFileAdd(o, 'basic'); }
            finally { gdFiling = false; }
            const now = gdOwnList() || [];
            prefSet(GD_OWN, GD_OWN_L, now.map(o => gdRec(o.c ? o : (need.find(x => x.u === o.u && x.c) || o))));   // 그사이 받거나 버린 것은 그대로
        }
        function gdSetList(L, mem) { const all = cabAllIds(), ok = id => all.includes(id) || !!(window.pkIsId && pkIsId(id)), v = L.filter(o => o && ok(o.id)).map(gdRec); if (mem && typeof drive !== 'undefined' && drive.ready && !drive.guest) store.putLoaded(GD_OWN, JSON.stringify(v)); else prefSet(GD_OWN, GD_OWN_L, v); }   // 💤 mem = 처음 선물 그대로 (문구 / _목록 은 바뀔 때 처음 · 도련 11-07)   // ✏️ 필기구도 (되살릴 때 빠지던 것)
        /* 🎁 처음 선물 문구 (도련 11-01) : 🪡 기본 핀셋(다이어리를 처음 열면 페이지에 놓여 있어요) + ✏️ 필기구 5 (검정 · 빨강 · 파랑 색연필 · 노랑 형광펜 · 지우개 = 펜꽂이에) · 나머지는 🏪 기본상품 샵 */
        const GD_STARTER = [];                                                // 🧁 서버 상품 속성 '처음받기' (지금 = 핀셋 · 검정 · 빨강 · 파랑 색연필 · 노랑 형광펜 · 지우개 · gdBuild)
        window.gdStarter = () => GD_STARTER.slice();   // 🛟 되살린 목록 (js/desk.js giftEnsure)
        window.gdFilesFill = gdFilesFill; window.gdOwnList = gdOwnList; window.gdSetList = gdSetList;
        const cabOwn = g => { const st = gdOwnSet(), all = cabAll(g), H = window.deskBagHold ? deskBagHold() : null; return st ? all.filter(id => st.has(id) && !(H && H.g.has(id))) : []; };   // 🛍️ 봉투 속 문구는 꺼낼 때까지 없어요 (💻 📲 · js/desk.js)   // 목록이 없으면 = 아무것도 없어요 (처음엔 문구 없음 · 도련 10-31)
        const gdIsTwz = id => !!id && cabGOf(id) === 'tweez';                    // 🪡 핀셋 (디자인이 여럿이어도 · 도련 11-02)
        const cabGOf = id => id.includes(':') ? id.split(':')[0] : (GD[id] || {}).g;
        const cabAllIds = () => GD_CAB.flatMap(([g]) => cabAll(g));
        const cabName = id => cabTool(id) ? (cabKinds(id.split(':')[0]).find(t => t.id === cabK(id)) || {}).name || '' : gdInfo(id).n;
        const cabArt = id => !cabTool(id) ? gdArt(id) : id.startsWith('knife') ? (window.skKnifeSvg ? skKnifeSvg(cabK(id)) : '') : (window.rlCupSvg ? rlCupSvg(cabK(id), 150) : '');
        const cabIsOn = id => !cabTool(id) ? !!gdEl(id) : id.startsWith('knife') ? !!(window.skKindNow && skKindNow() === cabK(id)) : !!(window.rlKindNow && rlKindNow() === cabK(id));
        const cabMid = () => { const b0 = document.getElementById('canvasArea').getBoundingClientRect(), b = window.dyVisRect ? dyVisRect(b0) : b0; return [b.left + b.width / 2, b.top + b.height / 2]; };   // 📱 폰 = 보이는 오른쪽 쪽
        const cabFlip = id => {
            if (!cabTool(id)) return gdPick(id);
            const on = cabIsOn(id), kn = id.startsWith('knife'), cv = document.getElementById('canvasArea');
            const [x, y] = cabFree(kn ? 40 : Math.min(600, cv ? cv.getBoundingClientRect().width : 600), kn ? 120 : 90, cabMid());   // 🗄️ 문구함에 안 가리게 (🔪 40×120 · 📏 긴 자)
            if (kn) { if (on) { if (window.skClose) skClose(); } else if (window.skKnife) { skKnife(x, y - 50, cabK(id)); if (window.skHold) skHold(true); } }   // 칼끝 = 가운데보다 위   // 꺼내면 바로 손에 (문구함은 그대로 · 도련 10-19)
            else if (on) { if (window.rlEnd) rlEnd(); } else if (window.rlShow) rlShow(x, y, cabK(id));
        };
        const GD_MAIN = 'diary_gd_main', GD_MAIN_L = 'malang_diary_gd_main';
        const gdOwn = g => g === 'clip' ? CLIPS.map(c => 'clip:' + c[0]) : Object.keys(GD).filter(id => GD[id].g === g);   // 가진 디자인 (📦 문구점이 생기면 여기에)
        function gdMain(g) { const own = cabOwn(g), m = (prefGet(GD_MAIN, GD_MAIN_L) || {})[g]; return own.includes(m) ? m : own[0]; }
        function gdMainSet(g, id) { const m = Object.assign({}, prefGet(GD_MAIN, GD_MAIN_L) || {}); if (m[g] === id) return; m[g] = id; prefSet(GD_MAIN, GD_MAIN_L, m); }
        const gdOnPage = g => cabAll(g).filter(cabIsOn);
        let cabOpen = null, cabPress = null, cabBin = null;                    // cabBin = 🗑 버리기 중인 서랍
        const CAB_PER = 6, cabPage = {};                                        // 서랍 속은 6개씩 칸을 넘겨 봐요 (📦 문구점에서 사서 아무리 많아져도 서랍장 길이는 그대로 · 도련 10-19)
        const CAB_CUP = `<svg viewBox="0 0 80 92" aria-hidden="true"><path d="M27 52 L22 8 Q22 3 26 4 L29 52" fill="#ffe27a" stroke="#d9aa2b" stroke-width="1.2"/><path d="M22.6 12 L24 4 L26 12z" fill="#7a5a3a"/>
            <path d="M37 52 V6 Q40 0 43 6 V52" fill="#9fd0f7" stroke="#5f9fd6" stroke-width="1.2"/><path d="M38.6 9 L40 2 L41.4 9z" fill="#3d6f9a"/>
            <path d="M49 52 L55 12 Q57 8 59 11 L54 52" fill="#ffb3c8" stroke="#e0729a" stroke-width="1.2"/><rect x="54.2" y="7" width="5" height="6" rx="1.5" transform="rotate(10 56 10)" fill="#fff" stroke="#e0729a"/>
            <path d="M31 52 L33 18 Q34 14 36 18 L35 52" fill="#bfe9c9" stroke="#6fbf8a" stroke-width="1.1"/>
            <path d="M14 46 H66 L62 88 Q61 91 58 91 H22 Q19 91 18 88 Z" fill="#ff9fbd" stroke="#e0729a" stroke-width="1.6"/><path d="M14 46 H66 V52 H14 Z" fill="#ffc2d4" stroke="#e0729a" stroke-width="1.4"/>
            <path d="M40 76 l-5.6 -5.3 a3.2 3.2 0 0 1 5.6 -3.8 a3.2 3.2 0 0 1 5.6 3.8 z" fill="#fff" opacity=".9"/><path d="M21 58 Q22 70 24 82" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".6"/></svg>`;
        function gdCabRender() {
            const cab = document.getElementById('gdCab'); if (!cab) return;
            const dr = ([g, n]) => {
                const main = gdMain(g), on = gdOnPage(g).length, open = cabOpen === g;
                const own = cabOwn(g), pages = Math.ceil(own.length / CAB_PER); if (!own.length) return '';
                if (open && cabPage[g] == null) cabPage[g] = Math.max(0, own.indexOf(main)) / CAB_PER | 0;   // 처음엔 주로 쓰는 것이 있는 칸
                const pg = Math.min(pages - 1, Math.max(0, cabPage[g] || 0));
                const tray = open ? `<div class="gdc-tray" data-g="${g}"><div class="gdc-grid">${own.slice(pg * CAB_PER, pg * CAB_PER + CAB_PER).map(id => `<button type="button" class="gdc-it${id === main ? ' main' : ''}${cabIsOn(id) ? ' on' : ''}${cabBin === g ? ' bin' : ''}" onclick="${cabBin === g ? `gdCabBinTap('${id}')` : `gdCabItem('${g}', '${id}')`}"><span class="gdc-ic ${g}">${cabArt(id)}</span><small>${cabName(id)}</small>${gdCount(id) > 1 ? `<b class="gdc-n">×${gdCount(id)}</b>` : ''}</button>`).join('')}</div>${pages > 1
                    ? `<div class="gdc-pg"><button type="button" aria-label="앞 칸" onclick="gdCabPage('${g}', -1)"${pg ? '' : ' disabled'}>‹</button>${Array.from({ length: pages }, (_, i) => `<i${i === pg ? ' class="on"' : ''}></i>`).join('')}<button type="button" aria-label="다음 칸" onclick="gdCabPage('${g}', 1)"${pg < pages - 1 ? '' : ' disabled'}>›</button></div>` : ''}`
                    + `<div class="gdc-binrow"><button type="button" class="gdc-bin${cabBin === g ? ' on' : ''}" onclick="gdCabBinMode('${g}')">${cabBin === g ? '✓ 다 했어요' : '🗑 휴지통'}</button><button type="button" class="gdc-shop" onclick="gdCabShop()">🏪 더 받기</button></div></div>` : '';
                return `<div class="gdc-row${open ? ' open' : ''}"><button type="button" class="gdc-dr${on ? ' out' : ''}" data-g="${g}">
                    <span class="gdc-in"><span class="gdc-ic ${g}">${cabArt(main)}</span></span>
                    <span class="gdc-tag">${n}${own.length > 1 ? `<small>${cabName(main).replace(/^기본\s*/, '')} · ${own.length}개</small>` : ''}</span>
                    <span class="gdc-pull" role="button" aria-label="서랍 열기">${open ? '▲' : '▼'}</span><em class="gdc-out">페이지에 ✓${on > 1 ? ' ' + on : ''}</em></button>${tray}</div>`;
            };
            cab.innerHTML = `<button type="button" class="gdc-x" aria-label="닫기" onclick="closeModal('gdCabModal')">✕</button>
                <button type="button" class="gdc-cup" aria-label="펜꽂이 (그리기)" onclick="gdCabCup()">${CAB_CUP}<small>펜꽂이</small></button>
                <div class="gdc-body">${GD_CAB.map(dr).join('') || '<div class="gdc-none">아직 문구가 없어요<br><button type="button" class="btn" onclick="gdCabShop()">🏪 기본상품 샵에서 받아 오기</button></div>'}</div>
                <p class="gdc-tip">톡 = 꺼내기 · 손잡이·꾹 = 골라 담기<br>잡고 끌면 서랍장이 옮겨져요</p>`;
            cab.querySelectorAll('.gdc-dr[data-g]').forEach(b => {
                const g = b.dataset.g;
                b.addEventListener('pointerdown', e => { if (e.button > 0) return; cabPress = { g, t: setTimeout(() => { cabPress = null; gdCabPull(g); }, 450) }; });
                ['pointerup', 'pointerleave', 'pointercancel'].forEach(k => b.addEventListener(k, () => { if (cabPress) clearTimeout(cabPress.t); }));
                b.addEventListener('click', e => { if (!cabPress || cabPress.g !== g) return; cabPress = null; if (e.target.closest('.gdc-pull')) gdCabPull(g); else gdCabTap(g); });
                b.addEventListener('contextmenu', e => e.preventDefault());
            });
            cab.querySelectorAll('.gdc-tray').forEach(t => {                    // 👆 서랍 속을 옆으로 밀어서 넘기기
                let sx = null;
                t.addEventListener('pointerdown', e => { sx = e.clientX; });
                t.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) { gdCabPage(t.dataset.g, dx < 0 ? 1 : -1); } });
            });
        }
        function openGdCab() {
            const onDesk = UI.desk();   // 🪑 책상에서는 다이어리를 띄우지 않고 문구함만 열어요 (도련 10-28)
            if (!onDesk && (!isCoverOpen)) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
            cabOpen = null; cabBin = null; gdCabRender(); openModal('gdCabModal');
        }
        /* ✋ 서랍장 옮기기 (도련 10-21) : 서랍장 아무 데나 잡고 8px 넘게 끌면 옮겨져요 · 짧게 톡 · 꾹은 그대로 서랍 (끌면 톡 · 꾹은 안 돼요)
           - 서랍 속(골라 담기 칸 · 옆으로 밀기)과 ✕ 는 끌기 아님 · 화면 밖으로는 못 나가요 · 닫았다 열어도 그 자리 · 화면 크기가 바뀌면 가운데로 */
        (function gdCabMovable() {
            const w = document.getElementById('gdCab'); if (!w) return;
            let d = null, swallow = false;
            w.addEventListener('pointerdown', e => {
                if (e.button > 0 || e.target.closest('.gdc-tray, .gdc-x')) return;
                d = { x: e.clientX, y: e.clientY, ox: parseFloat(w.style.left) || 0, oy: parseFloat(w.style.top) || 0, on: false, id: e.pointerId };
            });
            w.addEventListener('pointermove', e => {
                if (!d || e.pointerId !== d.id) return;
                const dx = e.clientX - d.x, dy = e.clientY - d.y;
                if (!d.on) {
                    if (Math.hypot(dx, dy) < 8) return;
                    d.on = true; w.setPointerCapture(e.pointerId); w.classList.add('moving');
                    if (cabPress) { clearTimeout(cabPress.t); cabPress = null; }        // 끌기 시작 = 서랍 톡 · 꾹 취소
                }
                const r = w.getBoundingClientRect(), bl = r.left - (parseFloat(w.style.left) || 0), bt = r.top - (parseFloat(w.style.top) || 0);
                const top = 56;                                                         // 위 펜꽂이도 화면 안에
                w.style.left = Math.max(8 - bl, Math.min(innerWidth - 8 - r.width - bl, d.ox + dx)) + 'px';
                w.style.top = Math.max(top - bt, Math.min(innerHeight - 8 - r.height - bt, d.oy + dy)) + 'px';
                e.preventDefault();
            });
            const end = () => { if (d && d.on) { swallow = true; setTimeout(() => { swallow = false; }, 0); w.classList.remove('moving'); } d = null; };
            w.addEventListener('pointerup', end); w.addEventListener('pointercancel', end);
            w.addEventListener('click', e => { if (swallow) { e.stopPropagation(); e.preventDefault(); swallow = false; } }, true);   // 끈 뒤 떨어지는 톡은 무시
            addEventListener('resize', () => { w.style.left = w.style.top = ''; });
        })();
        function gdCabTap(g) {                                                  // 앞면 톡 : 주로 쓰는 것 꺼내기 · 놓여 있으면 (그 종류 전부) 치우기
            const on = gdOnPage(g);
            if (on.length) on.forEach(cabFlip); else cabFlip(gdMain(g));
            gdCabRender();
        }
        function gdCabPull(g) { cabOpen = cabOpen === g ? null : g; cabBin = null; delete cabPage[g]; gdCabRender(); }   // 서랍 쭉 열기 · 닫기
        function gdCabPage(g, d) { const n = Math.ceil(cabOwn(g).length / CAB_PER); cabPage[g] = Math.min(n - 1, Math.max(0, (cabPage[g] || 0) + d)); gdCabRender(); }
        function gdCabItem(g, id) {                                             // 서랍 안 디자인 톡 : 주로 쓰는 것 + 페이지에 (다시 톡 = 치우기)
            const was = cabIsOn(id);
            if (!GD_MULTI.includes(g) && !was) gdOnPage(g).forEach(cabFlip);   // 하나만 쓰는 것은 바꿔 놓기
            cabFlip(id); if (!was) gdMainSet(g, id);
            gdCabRender();
        }
        /* 🗑 버리기 · 🏪 받기 (도련 10-27) */
        function gdCabBinMode(g) { cabBin = cabBin === g ? null : g; gdCabRender(); }
        async function gdCabBinTap(id) { if (await gdBin(id)) gdCabRender(); }
        /* 🚛 문구 버리기 → 바로 영구 삭제 (js/bin.js · 도련 11-11 · 📱 문구함 서랍 · 👝 보관함 · 🪑 책상 문구함 모두 여기로) */
        const gdBinName = id => String((((window.prodList ? prodList('문구') : []).find(v => v.id === id) || {}).P || {}).이름 || '');   // 상품 이름 그대로
        async function gdBin(id) {
            const all = (gdOwnList() || []).filter(x => x.id === id); if (!all.length) return false;
            const o = all.slice().reverse().find(x => !x.g) || all[all.length - 1], last = all.length === 1;   // 여럿이면 하나만 (나중에 받은 것부터 · 선물은 맨 나중에)
            const pen = !!(window.pkIsId && pkIsId(id));
            if (last && !pen && cabIsOn(id)) { showMsg('페이지에 꺼내 둔 것은 버릴 수 없어요.<br><small>먼저 문구함에 넣어 주세요</small>'); return false; }
            if (!window.binAsk || !await binAsk(gdBinName(id) + (last ? '' : ` 하나 (${all.length}개 중)`))) return false;
            prefSet(GD_OWN, GD_OWN_L, (gdOwnList() || []).filter(x => x.u !== o.u).map(gdRec));
            if (!pen && last) { const g = cabGOf(id); if (gdMain(g) === id) gdMainSet(g, cabOwn(g)[0]); }
            await binAdd({ k: 'gd', id: o.u, o: Object.assign(gdRec(o), o.g ? { g: 1 } : {}) });   // 🎁 휴지통엔 선물이었는지도 (되돌리면 다시 선물 주소에)
            gdBinAfter();
            binTold('');
            return true;
        }
        function gdBinAfter() { if (window.pcRefill) pcRefill(); if (window.dkwDeskSoon) dkwDeskSoon(); }   // ✏️ 펜꽂이 · 🪑 책상 문구 다시
        (window.BIN_PRE = window.BIN_PRE || {}).gd = {
            name: e => '✏️ ' + gdBinName((e.o && e.o.id) || e.id),
            restore: e => {
                const L = gdOwnList() || [], o = Object.assign({ u: e.o.u || e.o.id }, e.o);
                if (L.some(x => x.u === o.u)) return;                             // 이미 있어요 (같은 하나)
                L.push(o); prefSet(GD_OWN, GD_OWN_L, L.map(gdRec));
                gdBinAfter();
            },
            purge: e => { if (!e.o.g && e.o.c) { const C = gdColl(e.o.id || e.id); if (C) return collRemove(C, e.o.c); } }
        };
        window.gdBin = gdBin;
        function gdCabShop() { closeModal('gdCabModal'); if (window.openShelf) { openShelf(); shOpenKind('gd'); } }
        /* 🏪 기본상품 샵 '문구' (js/basket.js) : 모든 디자인 · 받기 = 'have' (이미 있어요) / 'ok' */
        const GD_OFF = new Set();                                              // 🧁 숨긴 문구 = 샵에서만 빠져요 (gdBuild)
        function gdBuild() {                                                   // 🧁 문구 목록 = 서버 상품 그대로 (js/prod.js)
            const L = window.prodList ? prodList('문구') : [];
            Object.keys(GD).forEach(k => delete GD[k]); CLIPS.length = 0; GD_STARTER.length = 0; GD_OFF.clear();
            L.forEach(x => {
                const P = x.P || {};
                if (['tweez', 'punch', 'tape', 'scissors', 'clip'].includes(P.문구종류)) {   // 📐 페이지에 놓일 크기 · 쓰는끝 (그림 px → 크기 상자 · js/gdpic.js) · 이름 · 하나라도 없으면 안 나와요 (🧁 상품공방이 검수)
                    const pic = window.gdPic && gdPic(x.id), tip = window.gdPicTip && gdPicTip(pic);
                    if (!tip || !String(P.이름 || '') || (P.문구종류 === 'clip' && !x.id.startsWith('clip:'))) { console.warn('🧁 문구 속성이 모자라요 :', x.id); return; }
                    GD[x.id] = { g: P.문구종류, n: String(P.이름), w: pic.size[0], h: pic.size[1], hx: tip[0], hy: tip[1] };
                    if (P.문구종류 === 'clip') CLIPS.push([x.id.slice(5), String(P.이름)]);
                }
            });
            L.forEach(x => { if (x.P.처음받기) GD_STARTER.push(x.id); if (x.P.숨김) GD_OFF.add(x.id); });
        }
        gdBuild();
        const gdShopList = () => GD_CAB.flatMap(([g, kind]) => cabAll(g).filter(id => !GD_OFF.has(id)).map(id => ({ id, g, kind, name: cabName(id), art: cabArt(id) }))).concat(window.pkShopList ? pkShopList() : []);   // + ✏️ 필기구 (도련 10-31 · js/pencase.js)
        function gdGive(id, force, from) {                                    // from = 상품 분류 (없으면 무료 basic · 📥 공유 = share · 도련 11-09)                                          // 'have' = 이미 있어요 (묻고 나서 force = 하나 더 · 도련 11-07 현실처럼)
            const L = gdOwnList() || [], had = L.some(o => o.id === id); if (had && !force) return 'have';
            const pen = !!(window.pkIsId && pkIsId(id));
            if (!pen && !cabAllIds().includes(id)) return 'no';
            const o = Object.assign({ u: gdNewU(id), id }, from && from !== 'basic' ? { from } : {}); L.push(o); prefSet(GD_OWN, GD_OWN_L, L.map(gdRec));
            gdFileAdd(o, from || 'basic').then(() => { if (!o.c) return; const now = gdOwnList() || []; const t = now.find(x => x.u === o.u); if (t) { t.c = o.c; prefSet(GD_OWN, GD_OWN_L, now.map(gdRec)); } });   // 🗂 문구 폴더에 파일 하나
            if (pen && !had && window.pkAdd) pkAdd(id);                        // ✏️ 펜꽂이에도 (처음 것만)
            if (document.getElementById('gdCabModal') && document.getElementById('gdCabModal').style.display !== 'none') gdCabRender();
            return 'ok';
        }
        window.gdCabBinMode = gdCabBinMode; window.gdCabBinTap = gdCabBinTap; window.gdCabShop = gdCabShop; window.gdShopList = gdShopList; window.gdGive = gdGive;
        function gdCabCup() { closeModal('gdCabModal'); if (window.gdLetGo) gdLetGo(); if (window.skLetGo) skLetGo(); if (window.openDraw) openDraw(); }   // ✏️ 펜꽂이 : 들고 있던 문구는 그 자리에 내려놓고 (도련 10-21)
        window.openGdCab = openGdCab; window.gdCabTap = gdCabTap; window.gdCabCup = gdCabCup; window.gdCabItem = gdCabItem; window.gdCabPage = gdCabPage;
        window.gdScs = gdScs; window.gdLetGo = () => { if (gdHeld) gdLet(); }; window.scsCutStart = scsCutStart; window.scsCutEnd = scsCutEnd;
        window.gdToolTap = (el, e) => { if (el && !el.classList.contains('edge')) gdHold(el.dataset.t, e.clientX, e.clientY, e); };   // 📄 모조지 손가락 칸이 덮은 페이지 문구를 눌렀을 때 (js/papermaker.js)
        window.scsAim = P => gdScs() ? [P[0], P[1] - SCS_LIFT] : P; window.scsLift = () => gdScs() ? SCS_LIFT : 0;   // 🎯 누르는 자리 → 자르는 자리 (js/papermaker.js)

        /* 🕳️ 펀칭기 (도련 10-19 · 진짜처럼 12번) : 구멍 자리 근처로 가면 그 자리에 착 붙고 → 누르면 철컥 하나 뚫려요
           - 💻 마우스 = 근처로 가면 붙어서 점선 동그라미(.gd-slot)가 보여요 (스티커에 가려도) · 👆 터치 = 근처를 누르면 붙으며 바로 뚫려요 · 빗나가면 "다시 눌러 주세요"
           - 구멍은 꾸밈 위로 보여요 = 스티커째 뚫린 것처럼 (.bd-hl) · 링을 연 뒤 꺼낸 종이에서만 */
        const GD_HOLE = 'diary_holes', GD_HOLE_L = 'malang_diary_holes';
        function gdHoleMask() {   // GD_HOLE · GD_HOLE_L (bdSync 가 먼저 불러도 되게)
            const m = bsGet('diary_holes'), b = m[bdBook()] || {}; return +b[bdPg()] || 0; }
        function gdHoleOn(bits) {                                                // bits : 뚫을 구멍 (1 << i)
            if (!spKeep()) return;                                              // 🏠 연습장 구멍은 기억하지 않아요
            const m = Object.assign({}, bsGet(GD_HOLE)), id = bdBook(), b = Object.assign({}, m[id] || {}), n = bdPg();
            b[n] = (+b[n] || 0) | bits; m[id] = b; bsSet(GD_HOLE, m);
        }
        function gdHoleSync() { const ip = gdIp(), v = bdLay() ? gdHoleMask() : 0; if (ip) ip.querySelectorAll('.dy-holes i').forEach((h, i) => h.classList.toggle('on', (v >> i & 1) > 0)); }
        function gdHoles() {
            const ip = gdIp(); if (!ip || !ip.classList.contains('dy-bdl') || (spKeep() && bdBusy)) return [];
            if (gdFree()) return [...ip.querySelectorAll('.bd-hl .bd-hole')].sort((a, b) => a.dataset.i - b.dataset.i);   // 0~5 왼쪽 · 6~11 오른쪽
            if (ip.classList.contains('dy-bo') && !ip.classList.contains('dy-bo-go')) return [...ip.querySelectorAll('.dy-holes i')];
            return [];
        }
        function gdNear(x, y) {                                                 // 화면 (x, y) 가장 가까운 구멍 자리 · 스냅 거리 밖이면 null
            const bk = spBook(); if (!bk) return null;
            const lim = Math.max(30, bk.getBoundingClientRect().width * .045);
            let best = null, bd = Infinity;
            gdHoles().forEach(h => { const r = h.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(cx - x, cy - y); if (r.width && d < bd) { bd = d; best = { h, i: h.dataset.i != null ? +h.dataset.i : [...h.parentNode.children].indexOf(h), x: cx, y: cy, d: r.width }; } });
            return best && bd <= lim ? best : null;
        }
        function gdSlot(c) {                                                    // 펀치가 뚫을 자리 (스티커에 가려도 보이는 점선 동그라미)
            const ip = gdIp(); let s = ip && ip.querySelector(':scope > .gd-slot');
            if (!c) { if (s) s.remove(); return; }
            if (!s) { s = document.createElement('div'); s.className = 'gd-slot'; ip.appendChild(s); }
            const { k } = gdK(), m = gdTo(c.x, c.y), w = c.d * 1.9 / k;
            Object.assign(s.style, { left: (m.x - w / 2) + 'px', top: (m.y - w / 2) + 'px', width: w + 'px', height: w + 'px' });
        }
        function gdPunchHover(x, y) {                                           // 💻 구멍 자리 근처면 착 붙어요
            const c = gdNear(x, y), el = gdEl(gdHeld); gdSlot(c);
            if (el) el.classList.toggle('snap', !!c);
            if (c) gdFollow(c.x, c.y);
            return !!c;
        }
        let gdSayT = 0;
        function gdSay(x, y, t) {                                               // 💬 펀칭기 말풍선 (핀셋 말풍선과 같은 모양)
            let b = document.getElementById('gdSay'); if (!b) { b = document.createElement('div'); b.id = 'gdSay'; b.className = 'twz-say'; document.body.appendChild(b); }
            b.textContent = t; b.style.left = Math.max(120, Math.min(innerWidth - 120, x)) + 'px'; b.style.top = Math.max(40, y - 30) + 'px';
            b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
            clearTimeout(gdSayT); gdSayT = setTimeout(() => b.classList.remove('on'), 1600);
        }
        /* 🕳️ 펀칭할 때 그 구멍 위에 있던 스티커에만 구멍 (도련 10-19 · 나중에 붙인 스티커는 구멍을 가려요)
           - el.dataset.ph = "x,y,r|…" (그 꾸밈 안 자리 · 돌리기 · 크기 전 px) → CSS mask 로 그 자리만 비워요 (저장 'ph') */
        function bdLocal(el, X, Y) {                                            // 화면 (X, Y) → 그 꾸밈 안 자리 (보이는 그대로 · 바인더 쪽 옮김 · 돌림까지)
            const b = el.getBoundingClientRect(); if (!b.width) return null;
            const cv = spPage(), k = cv.getBoundingClientRect().width / (cv.offsetWidth || 1) || 1, s = parseFloat(el.dataset.scale) || 1;
            const a = -((parseFloat(el.dataset.rotation) || 0) + (parseFloat(getComputedStyle(el).rotate) || 0)) * Math.PI / 180;
            const ux = (X - b.left - b.width / 2) / k, uy = (Y - b.top - b.height / 2) / k;
            return { x: (ux * Math.cos(a) - uy * Math.sin(a)) / s + el.offsetWidth / 2, y: (ux * Math.sin(a) + uy * Math.cos(a)) / s + el.offsetHeight / 2, s, k };
        }
        function bdSolid(el, p) {                                               // 그 꾸밈 안 자리 p 에 보이는 그림이 있나 (뚫린 자리는 없어요)
            if (p.x < 0 || p.y < 0 || p.x > el.offsetWidth || p.y > el.offsetHeight) return false;
            if (bdPh(el).some(h => Math.hypot(h[0] - p.x, h[1] - p.y) < h[2] * 1.05)) return false;
            const img = el.querySelector(':scope > img'), al = img && bdAlphaOf(img); if (!al) return true;
            const iw = img.offsetWidth, ih = img.offsetHeight, x = p.x - img.offsetLeft, y = p.y - img.offsetTop; if (x < 0 || y < 0 || x > iw || y > ih) return false;
            return al.d[(Math.min(al.h - 1, Math.floor(y / ih * al.h)) * al.w + Math.min(al.w - 1, Math.floor(x / iw * al.w))) * 4 + 3] > 60;
        }
        const bdPh = el => String(el.dataset.ph || '').split('|').filter(Boolean).map(t => t.split(',').map(Number));
        function bdPhPaint(el) {                                                // 뚫린 자리만 투명하게
            const hs = bdPh(el), m = hs.map(h => `radial-gradient(circle ${h[2]}px at ${h[0]}px ${h[1]}px, transparent ${h[2]}px, #000 ${h[2] + .6}px)`).join(', ');
            el.style.maskImage = el.style.webkitMaskImage = m;
            el.style.maskComposite = hs.length > 1 ? 'intersect' : ''; el.style.webkitMaskComposite = hs.length > 1 ? 'source-in' : '';
        }
        window.bdPhPaint = bdPhPaint;
        function bdPierce(h) {                                                  // 이 구멍(화면 원) 위에 있는 스티커마다 구멍
            let n = 0;
            spPage().querySelectorAll(':scope > .element-box').forEach(el => {
                const p = bdLocal(el, h.x, h.y); if (!p) return;
                const rr = h.d / 2 * .95, ring = [[0, 0], ...[...Array(12)].map((_, i) => [Math.cos(i * Math.PI / 6), Math.sin(i * Math.PI / 6)])];   // 구멍을 살짝만 덮어도 (가장자리까지)
                if (!ring.some(([a, b]) => { const q = bdLocal(el, h.x + a * rr, h.y + b * rr); return q && bdSolid(el, q); })) return;
                const r = Math.round(h.d / 2 / p.k / p.s * 10) / 10, v = [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10, r];
                el.dataset.ph = [...bdPh(el), v].map(a => a.join(',')).join('|'); bdPhPaint(el); n++;
            });
            if (n) spSave(false);
        }
        function gdPunchSnd() {                                                 // 🔊 철컥 (꾹 누르는 소리 + 종이 뚫리는 소리)
            const ac = typeof sndFx === 'function' ? sndFx() : null; if (!ac) return;
            const t = ac.currentTime, out = sndOut();
            const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle';
            o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(70, t + .09);
            g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .13);
            o.connect(g).connect(out); o.start(t); o.stop(t + .15);
            [0, .05].forEach((d, j) => {
                const n = Math.floor(ac.sampleRate * .05), buf = ac.createBuffer(1, n, ac.sampleRate), v = buf.getChannelData(0);
                for (let i = 0; i < n; i++) v[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
                const sr = ac.createBufferSource(), f = ac.createBiquadFilter(), gg = ac.createGain();
                sr.buffer = buf; f.type = 'bandpass'; f.frequency.value = j ? 2600 : 1500; f.Q.value = .9; gg.gain.value = j ? .35 : .55;
                sr.connect(f).connect(gg).connect(out); sr.start(t + d);
            });
        }
        function gdPunch(x, y, e) {
            const el = gdEl(gdHeld); if (!el) return;
            const c = gdNear(x, y);
            if (!c) {                                                           // 구멍 자리가 아니면 옮겨지기만 · 👆 터치로 종이를 눌렀으면 다시 하라고
                gdSlot(null); el.classList.remove('snap');
                if (e && e.pointerType === 'touch' && gdHoles().length && document.elementsFromPoint(x, y).some(n => n.classList && (n.classList.contains('bd-sheet') || n.classList.contains('element-box')))) gdSay(x, y, '🕳️ 구멍 자리가 안 맞았어요 · 다시 눌러 주세요');
                return;
            }
            gdFollow(c.x, c.y); gdSlot(c); el.classList.add('snap');
            el.classList.remove('press'); void el.offsetWidth; el.classList.add('press'); setTimeout(() => el.classList.remove('press'), 260);
            const sl = gdIp().querySelector(':scope > .gd-slot'); if (sl) { sl.classList.remove('press'); void sl.offsetWidth; sl.classList.add('press'); }
            gdPunchSnd();
            bdPierce(c);                                                        // 위에 있던 스티커도 같이 뚫려요
            setTimeout(() => {
                const ip = gdIp(); if (!ip) return;
                [ip.querySelectorAll('.dy-holes i')[c.i], ...[...ip.querySelectorAll('.bd-hl .bd-hole')].filter(h => +h.dataset.i === c.i)].forEach(h => { if (!h) return; h.classList.remove('pop'); void h.offsetWidth; h.classList.add('on', 'pop'); });
                gdHoleOn(1 << c.i);
            }, 110);
            if (!e || e.pointerType === 'touch') setTimeout(() => { const s = gdIp() && gdIp().querySelector(':scope > .gd-slot.press'); if (s) { s.remove(); const t = gdEl(gdHeld); if (t) t.classList.remove('snap'); } }, 600);   // 👆 뚫고 나면 점선 동그라미는 사라져요
        }
        /* 🩹 양면테이프 : 들고 끌면 끈 만큼 테이프가 발라져요 → 페이지 꾸밈(그림)으로 붙어요 (핀셋으로 옮기고 지울 수 있어요) */
        function gdTapePv() {
            const g = gdG, a = gdTo(g.a.x, g.a.y), b = gdTo(g.b.x, g.b.y), L = Math.hypot(b.x - a.x, b.y - a.y);
            Object.assign(g.pv.style, { left: a.x + 'px', top: (a.y - 6) + 'px', width: L + 'px', transform: `rotate(${Math.atan2(b.y - a.y, b.x - a.x)}rad)` });
        }
        function gdCv(x, y, f) {   // f : 이 쪽 기준으로 (테이프 양 끝을 같은 쪽 기준으로)                                                   // 화면 자리 → 페이지에 저장되는 자리 (바인더 쪽 벌어짐 · 링을 연 뒤 옮기고 돌린 쪽까지)
            const ip = gdIp(), cv = spPage(), bk = spBook(), cq = bk.offsetWidth / 100, { r, k } = gdK();
            if (gdFree()) {
                const s = document.elementsFromPoint(x, y).find(n => n.classList && n.classList.contains('bd-sheet')), side = f || (s ? (s.classList.contains('l') ? 'l' : 'r') : (x < innerWidth / 2 ? 'l' : 'r')), sh = bdFree.sh[side];
                const vx = (x - r.left) / k - sh.cx - sh.x, vy = (y - r.top) / k - sh.cy - sh.y, a = -sh.r * Math.PI / 180;
                return { x: vx * Math.cos(a) - vy * Math.sin(a) + sh.cx - cv.offsetLeft - (side === 'r' ? 6 : -6) * cq, y: vx * Math.sin(a) + vy * Math.cos(a) + sh.cy - cv.offsetTop };
            }
            const p = { x: (x - r.left) / k - cv.offsetLeft, y: (y - r.top) / k - cv.offsetTop };
            if (ip.classList.contains('dy-bdl') && !ip.classList.contains('dy-bo')) p.x += p.x < cv.offsetWidth / 2 ? 6 * cq : -6 * cq;   // 링에 끼운 동안 두 쪽은 6cqw 씩 바깥으로
            return p;
        }
        window.bdCvAt = (x, y) => {                                             // ✂️ 스티커 칼 조각 자리 (js/stkcut.js) : 화면 → 저장 자리 + 쪽 (그 뒤 bdPin) · 바인더가 아니면 null
            const ip = gdIp(), cv = spPage(), bk = spBook(); if (!ip || !cv || !bk || !ip.classList.contains('dy-bdl') || ip.classList.contains('dy-bo')) return null;
            if (bdFree) { const sd = gdSide(x, y), m = gdCv(x, y, sd); return { x: m.x, y: m.y, sd }; }
            const { r, k } = gdK(), cq = bk.offsetWidth / 100, vx = (x - r.left) / k - cv.offsetLeft, sd = vx < cv.offsetWidth / 2 ? 'l' : 'r';   // 링에 끼운 동안 : 보이는 쪽 그대로 (두 쪽은 6cqw 씩 바깥으로)
            return { x: vx + (sd === 'l' ? 6 : -6) * cq, y: (y - r.top) / k - cv.offsetTop, sd };
        };
        function gdSide(x, y) {                                                 // 📄 링을 연 뒤 그 자리(화면)에 놓일 꾸밈이 어느 쪽 것이 되는지 (저장 자리로 나뉘는 쪽과 같게)
            if (gdFree()) {                                                       // 그 종이 위면 그 쪽 · 틈(종이 밖)이면 가까운 종이 쪽 (틈 근처는 bdPin 이 기억)
                const d = side => { const r = bdFree.sh[side].el.getBoundingClientRect(); return Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom)); };
                const s = document.elementsFromPoint(x, y).find(n => n.classList && n.classList.contains('bd-sheet'));
                return s ? (s.classList.contains('l') ? 'l' : 'r') : d('l') <= d('r') ? 'l' : 'r';
            }
            const W = spPage().offsetWidth, ok = sd => { const m = gdCv(x, y, sd); return (m.x >= W / 2) === (sd === 'r'); };
            const first = gdCv(x, y).x >= W / 2 ? 'r' : 'l', other = first === 'l' ? 'r' : 'l';
            return ok(first) ? first : ok(other) ? other : first;
        }
        function gdTapeAdd(A, B) {
            if (Math.hypot(B.x - A.x, B.y - A.y) < 10) return;
            let a, b, sd = null;
            if (gdFree()) {                                                       // 📄 두 쪽에 걸쳐 바르면 : 가운데가 놓일 쪽 기준으로 양 끝을 (붙은 뒤 그 쪽과 같이 움직여도 제자리)
                sd = gdSide((A.x + B.x) / 2, (A.y + B.y) / 2);
                a = gdCv(A.x, A.y, sd); b = gdCv(B.x, B.y, sd);
            } else { a = gdCv(A.x, A.y); b = gdCv(B.x, B.y); }
            const L = Math.max(8, Math.round(Math.hypot(b.x - a.x, b.y - a.y))), TH = 12;
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="gd-tape" width="${L}" height="${TH}" viewBox="0 0 ${L} ${TH}"><rect y="1" width="${L}" height="${TH - 2}" rx="1.5" fill="#f3e6cf"/><rect y="1.6" width="${L}" height="2" fill="#fff" fill-opacity=".6"/><rect y="${TH - 3.4}" width="${L}" height="1.6" fill="#cdb894" fill-opacity=".55"/></svg>`;
            const el = createElementFromData({ type: 'image', content: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), width: L + 'px', height: TH + 'px', posX: 0, posY: 0, scale: 1, rotation: Math.round(Math.atan2(b.y - a.y, b.x - a.x) * 1800 / Math.PI) / 10, zIndex: zIndexCounter++ }, true);
            el.dataset.ts = 1;                                                  // 📷 사진 꾸미기 창이 안 떠요
            spPage().appendChild(el);
            const x = Math.round((a.x + b.x) / 2 - el.offsetWidth / 2 - el.offsetLeft), y = Math.round((a.y + b.y) / 2 - el.offsetHeight / 2 - el.offsetTop);
            el.dataset.posX = x; el.dataset.posY = y; el.style.transform = `translate(${x}px, ${y}px) scale(1) rotate(${el.dataset.rotation}deg)`;
            if (gdFree()) { bdPin(el, sd); bdSides(); bdFreeApply(); }           // 📄 링을 연 뒤엔 그 쪽과 같이 (바로)
            spSave(false);
        }
        /* 📎 집게 : 들고 다이어리 테두리 근처를 누르면 착 꽂혀요 · 꽂힌 집게는 끌면 테두리를 따라가고 (집게끼리 지나가요) · 톡 하면 빼서 들어요 */
        function gdRail() {
            const cv = spPage(); if (!cv) return null;
            return { cv, rail: clipRail(cv.offsetWidth, cv.offsetHeight, parseFloat(getComputedStyle(cv).borderTopLeftRadius) || 12) };
        }
        function gdClipPut(el, f) {
            const R = gdRail(); if (!R) return;
            const [x, y, deg] = R.rail.at(f * R.rail.L);
            el.classList.add('edge'); el.classList.remove('held', 'rim-ok'); el.dataset.f = f;
            const t = gdInfo(el.dataset.t); Object.assign(el.style, { left: (R.cv.offsetLeft + x - t.hx) + 'px', top: (R.cv.offsetTop + y - t.hy) + 'px', transform: `rotate(${deg}deg)` });
        }
        function gdRailNear(x, y, f0, span) {                                   // 그 자리에서 가장 가까운 테두리 자리 (f0 근처만 · 없으면 한 바퀴 전부)
            const R = gdRail(), p = gdTo(x, y), px = p.x - R.cv.offsetLeft, py = p.y - R.cv.offsetTop, L = R.rail.L;
            let best = 0, bd = Infinity; const c = f0 == null ? L / 2 : f0 * L, w = f0 == null ? L / 2 : L * span;
            for (let d = c - w; d <= c + w; d += 3) { const [rx, ry] = R.rail.at(d), dd = (rx - px) ** 2 + (ry - py) ** 2; if (dd < bd) { bd = dd; best = d; } }
            return { f: (((best / L) % 1) + 1) % 1, d: Math.sqrt(bd) };
        }
        function gdRailMove(el, x, y) { const n = gdRailNear(x, y, +el.dataset.f || 0, .2); gdClipPut(el, n.f); }
        /* 📎 꽂히는 자리 알려 주기 (도련 10-30 : 어디에 물리는지 몰라서 자꾸 헛누름) : 들고 테두리 가까이 가면 집게가 반짝 · 그때 누르면 꽂혀요 (gdClipSnap 과 같은 거리) */
        const GD_RIM = 34;
        function gdClipHint(x, y) {                                             // + 그 테두리 방향으로 미리 돌아가요 (도련 10-31 · 꽂힐 모습 그대로 · 아래 = 거꾸로 · 옆 = 옆으로)
            const el = gdHeld && gdEl(gdHeld), R = el && gdRail(); if (!R) return;
            const n = gdRailNear(x, y), { k } = gdK(), ok = n.d * k <= GD_RIM;
            el.classList.toggle('rim-ok', ok);
            el.style.transform = ok ? `rotate(${R.rail.at(n.f * R.rail.L)[2]}deg)` : '';
        }
        function gdClipSnap(x, y) {
            const el = gdEl(gdHeld), n = gdRailNear(x, y), { k } = gdK(); if (!el) return;
            if (n.d * k > GD_RIM) return;                                       // 테두리 근처가 아니면 옮겨지기만
            gdHeld = null; document.body.classList.remove('gd-on');
            gdClipPut(el, n.f); el.classList.add('snap'); setTimeout(() => el.classList.remove('snap'), 200);
            gdClipSave();
        }
        const GD_CLIP = 'diary_clips', GD_CLIP_L = 'malang_diary_clips';
        function gdClipSave() {
            const cv = spPage(); if (!cv || !gdBook || !spKeep()) return;        // 🏠 연습장 집게는 기억하지 않아요
            const o = {}, W = cv.offsetWidth || 1, H = cv.offsetHeight || 1;
            gdIp().querySelectorAll(':scope > .bd-tool.clip').forEach(el => {
                const c = el.dataset.t.slice(5);
                if (el.classList.contains('edge')) o[c] = { f: Math.round(+el.dataset.f * 1e4) / 1e4 };
                else { const m = gdMid(el); o[c] = { x: Math.round((m.x - cv.offsetLeft) / W * 1e4) / 1e4, y: Math.round((m.y - cv.offsetTop) / H * 1e4) / 1e4 }; }
            });
            const all = Object.assign({}, bsGet(GD_CLIP)); all[gdBook] = o; bsSet(GD_CLIP, all); gdClipSig = JSON.stringify(o);
        }
        function gdSync() {                                                     // dyDeco 끝에서 : 📎 그 권의 집게 · 🪡 처음 열면 핀셋
            if (!spKeep()) return;                                              // 🏠 연습장에선 진짜 다이어리 집게를 맞추지 않아요 (닫으면 다시)
            const ip = gdIp(), cv = spPage(); if (!ip || !cv) return;
            const book = dyNow().id === DY_DEF && window.dyyBookId ? dyyBookId() || DY_DEF : dyNow().id, saved = bsGet(GD_CLIP)[book] || bsGet(GD_CLIP)[dyNow().id] || {};   /* 📔 날짜형 = 권마다 (예전엔 모든 날짜형이 한 자리) */
            const sig = JSON.stringify(saved), busy = (gdHeld && gdHeld.startsWith('clip:')) || (gdG && gdG.k === 'rail');
            if (gdBook !== book || (sig !== gdClipSig && !busy)) {             // 다른 권 = 그 권의 집게로 · 드라이브를 읽은 뒤 저장이 달라졌어도 (도련 10-30 : 읽기 전 모습이 남지 않게)
                gdClipSig = sig;
                ip.querySelectorAll(':scope > .bd-tool.clip').forEach(el => { if (gdHeld === el.dataset.t) gdHeld = null; el.remove(); });
                gdBook = book;
                Object.keys(saved).forEach(c => { if (CLIPS.some(x => x[0] === c)) gdMake('clip:' + c); });
            }
            ip.querySelectorAll(':scope > .bd-tool.clip:not(.held)').forEach(el => {   // 크기가 바뀌어도 같은 자리
                const s = saved[el.dataset.t.slice(5)]; if (!s) return;
                if (typeof s.f === 'number') gdClipPut(el, s.f); else gdCenter(el, cv.offsetLeft + s.x * cv.offsetWidth, cv.offsetTop + s.y * cv.offsetHeight);
            });
            gdHoleSync();
            if (isCoverOpen && !gdInit) {                                       // 🪡 다이어리를 처음 열면 핀셋이 페이지에 하나 (📱 폰 · 💻 📲 책상은 펜꽂이 · 문구함에서 꺼내요 = 앱을 켜면 페이지에 꺼낸 문구가 없어요 · 도련 11-03)
                gdInit = true;
                setTimeout(() => {
                    const tw = UI.menu() && gdMain('tweez'); if (tw && !gdEl(tw)) { const el = gdMake(tw), p = gdSpot(tw); if (el) gdCenter(el, p.x, p.y + (window.dgWill && dgWill() ? cv.offsetHeight * .2 : 0)); }   // 🩷 메모가 뜰 거면 핀셋은 조금 아래 (안 가리게)
                    setTimeout(() => { if (isCoverOpen && window.dgShow) dgShow(); }, 450);   // 🩷 처음 쓰는 사람용 다꾸하는 법 메모 (js/dkguide.js · 예전 '핀셋으로 집어서 옮겨요' 첫 알림 대신 · 도련 10-26)
                }, 900);
            }
        }
        /* 페이지 둘레 꾸밈 : 커버(뒤) · 가운데 접힘 · 링 · 밴드 · 책갈피 끈(앞) */
        function dyParts(t) {
            const back = [], front = [];
            const rings = n => { let h = ''; for (let i = 0; i < n; i++) h += '<i></i>'; return h; };
            back.push('<b class="dy-cov"></b>');
            front.push(t.b === 'ring' ? '<span class="dy-gap"></span>' : '<span class="dy-fold"></span>');   // 🗂️ 바인더는 링 때문에 두 속지가 떨어져 있어요 (가운데로 표지 안쪽이 보여요)
            if (t.b === 'ring') front.push(`<span class="dy-rings">${rings(6)}</span><span class="dy-tape"></span><span class="dy-tape b"></span><span class="dy-seam"></span><span class="dy-edge-w"><i class="dy-edge-f"></i></span>`
                + ['out', 'in'].map(k => `<button type="button" class="dy-bo-btn ${k}" tabindex="-1">${k === 'out' ? '<span class="a">📤<small>꺼내기</small></span><span class="h">🔓<small><i class="dy-bo-ar">↔</i> 옆으로 끌어서<br>링 열기</small></span>' : '📥<small>끼우기</small>'}</button>`).join(''));   // 📤 꺼내서 꾸미기 (bdOut · bdIn)
            if (t.b === 'tn') front.push('<span class="dy-band"></span>');
            if (t.b === 'spread') front.push('<span class="dy-rib"></span>');
            if (t.b === 'hard') front.push('<span class="dy-band hard"></span>');
            return [back.join(''), front.join(''), t.b === 'ring' ? `<span class="dy-holes">${rings(12)}</span>` : ''];   // 🕳️ 구멍은 종이 위 · 스티커 아래 (#dyHoleL · 펀칭기로 뚫은 스티커에만 구멍 · bdPierce)
        }
        function dyDeco() {                                                    // js/page.js refreshLayout 끝에서 불러요
            const page = document.getElementById('innerPage'), cv = document.getElementById('canvasArea'), book = document.getElementById('diaryBook'), wr = document.getElementById('diaryWrapper');
            if (!page || !cv || !book) return;
            const t = dyLook(), mode = dyMode();
            book.classList.add('dy-sp'); book.classList.toggle('dy-one', mode !== 'spread');
            dvRender();                                                        // 📖 날짜바 양 끝 왼쪽 · 오른쪽 페이지 스위치
            book.style.setProperty('--dy-w', book.clientWidth + 'px');
            if (mode !== 'swipe') dyViewSet(mode === 'right' ? 'r' : 'l');
            if (wr) wr.style.marginLeft = mode === 'spread' && isCoverOpen ? book.clientWidth + 'px' : '';   // 💻 펼침면을 화면 가운데로
            let bk = document.getElementById('dyBack'), fr = document.getElementById('dyFront');
            if (!bk) { bk = document.createElement('div'); bk.id = 'dyBack'; bk.className = 'dy-deco'; bk.setAttribute('aria-hidden', 'true'); page.prepend(bk); }
            if (!fr) { fr = document.createElement('div'); fr.id = 'dyFront'; fr.className = 'dy-deco'; fr.setAttribute('aria-hidden', 'true'); page.appendChild(fr); }
            let hl = document.getElementById('dyHoleL'); if (!hl) { hl = document.createElement('div'); hl.id = 'dyHoleL'; hl.className = 'dy-deco'; hl.setAttribute('aria-hidden', 'true'); cv.after(hl); }
            const dk = t.id; if (bk.dataset.k !== dk) { const [b, f, h] = dyParts(t); bk.innerHTML = b; fr.innerHTML = f; hl.innerHTML = h; bk.dataset.k = fr.dataset.k = dk; }
            [bk, fr, hl].forEach(el => Object.assign(el.style, { left: cv.offsetLeft + 'px', top: cv.offsetTop + 'px', width: cv.offsetWidth + 'px', height: cv.offsetHeight + 'px' }));
            page.dataset.dy = book.dataset.dy = t.b; page.style.setProperty('--dy-c', t.id === DY_DEF ? 'var(--border-color)' : t.c);   /* 📔 날짜형 = 그 권 색 */   // 📔 기본 다이어리 테두리는 고른 페이지 색을 따라가요 (10-18)
            page.classList.add('dy-noholes');                                  // 펼침면은 링 구멍 대신 가운데 묶음 (링 · 밴드 · 실)
            if (window.dyyColorPaint) dyyColorPaint();                         // 🎨 펼친 권의 색 (날짜형만 · js/dyyear.js)
            dkCoverPaint();
            bdSync();
            gdSync();                                                          // ✂️ 📎 집게 · 🪡 핀셋
        }
        /* 📕 표지 꾸미기 (표꾸 · 도련 10-18) : 상품공방 '표지꾸미기' 를 체크한 다이어리만 (도련 11-06 · dyCvOk)
           - 표지 = 0장 (dkDate(0) = 1999-12-31) · 📓 🗂️ 페이지형 = 키 dkp_<권 id>_0 → <권 id>-표지.json · 📔 날짜형 = 그 권 1999-12-31 키 → 권 폴더 표지.json (js/drive.js dayFileName) → 속지처럼 스티커 메뉴로 그대로 꾸며요
           - 표꾸 화면 : 로그인 때 겉표지처럼 접힌 앞표지 한 쪽 (펼친 면의 오른쪽 쪽 자리) · 다음 장으로 넘기면 1장이에요
           - 닫힌 겉표지 : 그 다이어리 색 + 앞표지(오른쪽 쪽)에 붙인 것 (#cvDeco · 눌러도 그대로 열려요) */
        function dkCoverEdit() {
            closeModal('skinModal');
            if (!dyCvOk()) { showMsg('📕 이 다이어리 표지는 꾸밀 수 없어요.'); return; }   // 🧁 상품공방 '표지꾸미기'
            if (!isCoverOpen || turn || dkCv()) { goToDate(dkDate(0)); return; }
            dkFold(() => goToDate(dkDate(0)));
        }
        /* 📕 표꾸로 갈 때 연출 : 펼친 다이어리의 왼쪽 쪽(앞표지 안쪽)이 가운데 묶음을 축으로 넘어와 덮이면서 겉표지가 돼요
           - 넘어오는 장 뒷면 = 지금 왼쪽 쪽 그대로 (#innerPage 복사) · 앞면 = 겉표지 (다이어리 색 · 책등 · 앞표지에 붙인 것)
           - 📱 한 쪽씩 보는 화면은 먼저 오른쪽 쪽으로 옮긴 뒤 접어요 · 💻 접히는 동안 다이어리가 같이 화면 가운데로 */
        let dkFolding = false;
        function dkFold(done) {
            const book = document.getElementById('diaryBook'), ip = document.getElementById('innerPage'), wr = document.getElementById('diaryWrapper');
            if (dkFolding || !book || !ip) { done(); return; }
            dkFolding = true; selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel();
            saveData(false);
            const wait = dyMode() === 'swipe' && dyView === 'l' ? 400 : 0;
            if (wait) dyViewSet('r', true);
            setTimeout(() => {
                const flap = document.createElement('div'); flap.className = 'dk-fold';
                const back = document.createElement('div'); back.className = 'dk-fold-b';
                const page = ip.cloneNode(true); page.removeAttribute('id'); page.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
                page.classList.remove('dk-cover', 'dy-at-r'); Object.assign(page.style, { left: '0', transform: 'none', pointerEvents: 'none' });
                back.appendChild(page);
                const front = document.createElement('div'); front.className = 'dk-fold-f';
                const cv = document.getElementById('coverPage'), deco = document.getElementById('cvDeco');
                front.style.setProperty('--dy-c', cv ? cv.style.getPropertyValue('--dy-c') : '');
                if (deco) front.appendChild(deco.cloneNode(true)).removeAttribute('id');
                flap.append(back, front); book.appendChild(flap);
                ip.classList.add('dk-folding', 'ph-wait');
                void flap.offsetWidth; flap.classList.add('go');
                if (wr && wr.style.marginLeft) { wr.style.transition = 'margin-left .75s cubic-bezier(.45, .05, .3, 1)'; wr.style.marginLeft = ''; }   // 💻 접히면서 동시에 가운데로
                setTimeout(() => {
                    if (wr) wr.style.transition = '';
                    done();
                    flap.remove(); ip.classList.remove('dk-folding', 'ph-wait');
                    ip.classList.add('ph-in'); setTimeout(() => ip.classList.remove('ph-in'), 600);
                    dkFolding = false;
                }, 760);
            }, wait);
        }
        /* 📕 표꾸 화면에서 다음 장으로 : 닫힌 겉표지로 바꿔 놓고 1장을 펼쳐요 (js/page.js beginCurl · 💻 열리면서 다이어리가 가운데로) */
        function dkUnfold() {
            if (!dkCv() || dkFolding) return false;
            const to = dyStep(currentDate, 1); if (!to) return false;
            saveData(false);
            currentDate.setTime(to.getTime()); selectedElement = null;
            isCoverOpen = false;
            document.getElementById('innerPage').style.display = 'none';
            const cp = document.getElementById('coverPage'); cp.style.display = ''; cp.classList.add('cv-plain');   // 넘어가는 겉표지엔 공지 카드 · 밀어서 열기가 없어요
            dkCvSync(); dkCoverPaint();
            return true;
        }
        function dkRefold() {                                                  // 덜 넘기고 놓았을 때 : 다시 표꾸 화면
            currentDate.setTime(dkDate(0).getTime());
            isCoverOpen = true;
            const cp = document.getElementById('coverPage'); cp.style.display = 'none'; cp.classList.remove('cv-plain');
            document.getElementById('innerPage').style.display = 'flex';
            loadData();
        }
        function dkCoverPaint() {
            const cv = document.getElementById('coverPage'), t = dkType(), can = dyCvOk(); if (!cv) return;
            cv.classList.toggle('cv-book', !!t);
            cv.classList.toggle('cv-can', can);                                // 📕 꾸밀 수 있는 표지 (스티커가 밖으로 · css)
            cv.classList.toggle('cv-ntoff', !dyNtOn());                        // 📢 평소엔 공지 카드 숨김 (새 공지는 보여요 · css .cv-ntoff .nt-none)
            let box = document.getElementById('cvDeco');
            if (!can) { if (box) box.remove(); return; }
            cv.style.setProperty('--dy-c', t ? t.c : 'var(--border-color)');   // 📔 날짜형 = 그 권 테두리 색
            const key = getDateKey(dkDate(0));
            if (!drive.guest && drive.ready && !drive.loadedDays.has(key)) { if (box) box.innerHTML = ''; ensureKeyLoaded(key).then(ok => { if (ok && getDateKey(dkDate(0)) === key) dkCoverPaint(); }).catch(() => {}); return; }
            if (!box) { box = document.createElement('div'); box.id = 'cvDeco'; box.className = 'cv-deco'; box.setAttribute('aria-hidden', 'true'); cv.appendChild(box); }
            const ps = getPageSize(), c = canvasOfPage(ps.w, ps.h);
            Object.assign(box.style, { width: c.w + 'px', height: c.h + 'px', left: (2 - c.w / 2) + 'px', top: '2px' });   // 앞표지 = 펼친 표지의 오른쪽 쪽
            box.innerHTML = '';
            readDayData(dkDate(0)).forEach(d => box.appendChild(createElementFromData(d, false)));
        }
        /* 📕 유한 다이어리 (도련 · 10-18) : 기본이 아닌 다이어리 = 페이지 수가 정해진 다이어리 · 늘 페이지 기준 (날짜 기준 유한은 없앰)
           - 장 = 펼친 두 쪽 하나 · 저장 키 dkp_<권 id>_<장> · 다이어리.json = dkb_<권 id> (js/drive.js)
           - 화면 코드는 날짜(currentDate)로 움직여요 → 장은 '2000년 1월 n일' 날짜로 넣고 (dkDate) getDateKey 가 장 키로 바꿔요
             진짜 날짜 (오늘 · 달력 · 검색 · D-day) 는 늘 진짜 날짜예요 · 2000년 날짜는 장으로만 써요
           - 지금은 규격마다 한 권 (diary_books : 규격 id → 권 id) · 문구점 디자인이 생기면 디자인마다 권
           - ☁ 로그인 중에는 권 id 를 드라이브 설정.json 것만 따라요 (도련 10-20 · 기기 브라우저 기억 malang_books 은 로그인 전 · 게스트용)
             새 권 id 는 규격 id 로 정해요 (dk + 규격 id) → 두 기기가 따로 처음 꾸며도 같은 권 · 말랑달콤 폴더를 지우면 모든 기기가 같은 빈 권에서 다시 시작
           - 첫 장을 저장할 때 드라이브에 권 폴더가 생겨요 (고르기만 하면 안 생겨요) · 장을 처음 꾸민 날을 다이어리.json days 에 (고쳐도 안 바뀜 · 다 지우면 빠짐)
           - 열면 : 켜고 끄기와 상관없이 마지막으로 꾸민 장 (없으면 1장)
           - 위 바 가운데 : 페이지 수가 기본 · 누르면 그 장을 처음 꾸민 날 (빈 장은 '새 장') ↔ 다시 누르면 페이지 수 (☁ 설정.json diary_bkview · 기기마다 같아요)
           - 📅 달력 : 꾸민 날만 누를 수 있고 나머지는 회색 · 누르면 그날 처음 꾸민 장 · 여러 장이면 작은 숫자 (js/month.js)
           - 🔍 검색 : 이 다이어리 장들에서 찾아요 (js/search.js)
           - 마지막 장에서 더 넘기면 "기본 다이어리로 넘어갈까요?" */
        const DK_KEY = 'diary_books', DK_LOCAL = 'malang_books', DK_VIEW = 'malang_bkview', DK_VIEW_KEY = 'diary_bkview', DK_PAGES = 30, DK_Y = 2000;
        const dkType = () => { const t = dyNow(); return t.id === DY_DEF ? null : t; };
        function dkMap() { const m = prefGet(DK_KEY, DK_LOCAL); return m && typeof m === 'object' ? m : {}; }   // 규격 id → 권 id (☁ 로그인 중엔 드라이브 것만 · js/drive.js prefGet)
        function dkId(make) {                                                  // 지금 고른 규격의 권 id (make : 없으면 새로)
            const t = dkType(); if (!t) return null;
            const o = Object.assign({}, dkMap());
            if (o[t.id] || !make) return o[t.id] || null;
            o[t.id] = 'dk' + (String(t.id).toLowerCase().replace(/[^0-9a-z]/g, '') || Date.now().toString(36));   // 기기마다 같은 id
            prefSet(DK_KEY, DK_LOCAL, o);
            return o[t.id];
        }
        const dkIs = d => d.getFullYear() === DK_Y || +d === +dkDate(0);       // 장 날짜인지 (0장 = 📕 표지 · 1999-12-31)
        const dkNo = d => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(DK_Y, 0, 1)) / 864e5) + 1;
        const dkDate = n => new Date(DK_Y, 0, n);
        function dkKey(date) { if (!dkIs(date) || !dkType()) return null; const id = dkId(true); return `dkp_${id}_${dkNo(date)}`; }   // js/page.js getDateKey
        function dkInfoOf(id) {                                                // 다이어리.json 내용 (아직 없으면 그 규격으로 새로)
            let o = null; try { o = JSON.parse(store.getItem('dkb_' + id)); } catch (e) {}
            if (o && o.id) return dkInfo(o);
            const m = dkMap(), t = DY_TYPES.concat(typeof dmkAll === 'function' ? dmkAll() : []).find(x => m[x.id] === id) || dkType() || {};
            return dkInfo({ id, design: t.g, spec: t.n, kind: t.k, pages: t.pg || DK_PAGES });
        }
        const dkNow = () => dkType() ? dkInfoOf(dkId(true)) : null;
        const dkFilled = o => Object.keys(o.days).map(Number).filter(n => n > 0).sort((a, b) => a - b);
        function dkInfoMerge(a, b) {                                           // 두 기기 것 합치기 : 장마다 더 이른 날 (js/drive.js writeBook)
            const o = dkInfo(Object.assign({}, b, a)), bd = b && b.days && typeof b.days === 'object' ? b.days : {};
            o.days = Object.assign({}, o.days);
            Object.keys(bd).forEach(n => { if (!o.days[n] || bd[n] < o.days[n]) o.days[n] = bd[n]; });
            o.pages = Math.max(+a.pages || 0, +(b && b.pages) || 0);
            return o;
        }
        function dkMark(key, has) {                                            // 저장할 때 (js/elements.js saveData) : 처음 꾸민 날 적기 · 다 지운 장은 빼기
            const p = parsePageKey(key); if (!p || !p.n) return;              // 0장(표지)은 꾸민 장 목록에 안 넣어요
            const o = dkInfoOf(p.b), had = !!o.days[p.n];
            if (has === had) return;
            if (has) { const t = new Date(); o.days[p.n] = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; }
            else delete o.days[p.n];
            store.setItem('dkb_' + p.b, JSON.stringify(o));
        }
        const dkDayOf = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
        function dkReal(date) {                                                // 장 날짜 → 그 장을 처음 꾸민 날 (빈 장은 오늘) · D-day 같은 진짜 날짜용
            if (!dkIs(date) || !dkType()) return date;
            const s = dkNow().days[dkNo(date)]; return s ? dkDayOf(s) : new Date();
        }
        const dkView = () => prefGet(DK_VIEW_KEY, DK_VIEW) === 'date' ? 'date' : 'page';   // ☁ 설정.json (기기마다 같아요 · 도련 10-20)
        function dkLabel(date) {                                               // 위 바 가운데 글 (js/page.js formatDate)
            if (dkIs(date) && !dkNo(date) && !dkType()) return '📕 표지 꾸미기';   // 📔 날짜형 표지
            if (!dkIs(date) || !dkType()) return '';
            const o = dkNow(), n = dkNo(date);
            if (!n) return '📕 표지 꾸미기';
            if (dkView() === 'date') return o.days[n] ? formatDate(dkDayOf(o.days[n])) : '새 장';
            return `${n} / ${o.pages} 페이지`;
        }
        function dkTap() {                                                     // 위 바 가운데를 누르면 : 유한은 페이지 수 ↔ 날짜 · 기본은 한 달 모아보기
            if (!dkType()) { if (window.openMonth) openMonth(); return; }
            prefSet(DK_VIEW_KEY, DK_VIEW, dkView() === 'date' ? 'page' : 'date');
            document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
        }
        function dkPath(date) {                                                // 💾 저장 알림에 보여 줄 자리
            if (!dkIs(date) || !dkType()) return '';
            const id = dkId(true), o = dkInfoOf(id), b = drive.books && drive.books.get(id);
            return `${DIRS.diary}/${id}/${dkNo(date) ? dkNo(date) + '페이지' : '표지'}.json`;   // 📕 다이어리 / 그 권 폴더 (도련 11-07)
        }
        function dkCv() { return dyCvOk() && isCoverOpen && dkIs(currentDate) && dkNo(currentDate) === 0; }   // 📕 지금 표지를 꾸미는 중
        function dkCvSync() { const ip = document.getElementById('innerPage'), cv = dkCv(); if (ip && ip.classList.contains('dk-cover') !== cv) { ip.classList.toggle('dk-cover', cv); dyDeco(); } const b = document.getElementById('diaryBook'); if (b) b.classList.toggle('dk-cv', cv); bdSync(); }   // 📕 표꾸 중 : 접힌 겉표지 모양 (앞표지 한 쪽)
        /* 고른 다이어리와 지금 펼친 날짜가 맞는지 (유한인데 진짜 날짜 · 기본인데 장 날짜 · 페이지 수를 넘음) → 맞는 곳으로 */
        function dkSync(load) {
            const bk = !!dkType(), on = dkIs(currentDate), cvAt = on && dkNo(currentDate) === 0;   // 📕 표지(0장)는 꾸밀 수 있는 다이어리면 날짜형도 그대로
            if (cvAt ? !dyCvOk() : (bk !== on || (bk && dkNo(currentDate) > dkNow().pages))) {
                if (window.dyViewSet) dyViewSet('l');
                currentDate.setTime((bk ? dyOpenDate() : dyOpenDate() || new Date()).getTime());
                selectedElement = null;
            } else if (!load) return dkCvSync();
            dkCvSync();
            document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
            if (load && isCoverOpen && !turn) loadData();
        }
        /* 다이어리.json 을 읽은 뒤 : 빈 장을 보고 있으면 마지막으로 꾸민 장으로 */
        async function dkFix() {
            const id = dkId(false); if (!id) return;
            await ensureKeyLoaded('dkb_' + id);
            if (!dkType() || dkId(false) !== id || !isCoverOpen || turn || !dkIs(currentDate) || !dkNo(currentDate)) return;
            const o = dkNow(), f = dkFilled(o), n = dkNo(currentDate);
            if (f.length && !o.days[n] && f[f.length - 1] !== n) goToDate(dkDate(f[f.length - 1]));
            else document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
        }
        let dkEndAt = 0;
        async function dkEnd(dir) {                                            // 마지막 장에서 더 넘기려고 할 때 (js/page.js beginCurl)
            if (dkIs(currentDate) && !dkNo(currentDate)) return;               // 📕 표지에서 앞으로는 없어요
            if (!dkType()) { if (window.dyyEnd) dyyEnd(dir); return; }       // 📔 기본 다이어리 : 그 해 끝 (js/dyyear.js)
            if (dir < 0 || !dkIs(currentDate) || dkNo(currentDate) < dkNow().pages || performance.now() - dkEndAt < 2500) return;
            dkEndAt = performance.now();
            if (await showMsg('📕 이 다이어리의 <b>마지막 장</b>이에요.<br>📔 기본 다이어리로 넘어갈까요?', true)) dySet(DY_DEF);
            dkEndAt = performance.now();
        }
        /* 🗂 꾸민 페이지만 보기 (도련 · 10-17) : 켜면 넘길 때 빈 날은 건너뛰고 꾸민 날만 (5 · 6 · 9 → 7 · 8 은 안 보여요)
           - 켜면 빈 페이지는 절대 안 보여요 (오늘도) · 다이어리를 열면 마지막으로 꾸민 날 · 꾸민 날이 하나도 없을 때만 오늘
           - 처음 · 마지막 꾸민 날에서 더 넘기면 안 넘어가요 · 새 날은 날짜 바 달력으로 골라서 가요
           - 꺼져 있으면 열 때 그 날짜 (오늘) · 넘길 때 하루씩
           - 모든 다이어리 공통 (보는 방법이라서) · 저장은 그대로 · 설정.json 'diary_filled' · 게스트는 이 기기 'malang_filled'
           - 꾸민 날 목록 : 드라이브의 날짜 파일 목록 (켜져 있으면 처음 한 번 · driveEnumerateAll) + 이 기기에서 읽거나 고친 날
           - 📕 유한 다이어리 : 열면 켜고 끄기와 상관없이 마지막으로 꾸민 장 · 켜면 꾸민 장 + 마지막으로 꾸민 다음 빈 장 하나만 넘겨요 */
        const DF_KEY = 'diary_filled', DF_LOCAL = 'malang_filled';
        let dfList = null, dfGen = -1, dfLoading = null, dfBook = '';
        const dfOn = () => prefGet(DF_KEY, DF_LOCAL) === 'on';
        function dfSet(on) { prefSet(DF_KEY, DF_LOCAL, on ? 'on' : 'off'); dfRender(); if (on) dfFix(); }
        function dfRender() { const s = document.getElementById('dyFillSw'); if (s) s.checked = dfOn(); }
        function dfLoad() {
            const bk = window.dyyBookId ? dyyBookId() : '';                  // 📔 펼친 권 것만 (권이 바뀌면 다시)
            if (dfGen !== drive.gen || dfBook !== bk) { dfList = null; dfGen = drive.gen; dfBook = bk; }
            if (dfList || dfLoading || !dfOn() || drive.guest || !drive.ready || !bk) return dfLoading;
            const gen = drive.gen;
            dfLoading = driveEnumerateAll(bk).then(a => { if (gen === drive.gen && dfBook === bk) dfList = new Set(a.map(f => f.key)); }).catch(() => {}).finally(() => { dfLoading = null; });
            return dfLoading;
        }
        function dfHas(k) {                                                    // 읽었거나 고친 날은 지금 내용으로 · 아니면 드라이브 목록으로
            if (drive.guest || drive.loadedDays.has(k) || drive.dirtyKeys.has(k)) return store.getItem(k) !== null;
            return !!(dfList && dfList.has(k));
        }
        /* 넘길 날 : 꺼져 있으면 하루 앞 · 뒤 / 켜져 있으면 꾸민 날 중 가장 가까운 날 (없으면 null = 안 넘어가요) */
        function dyStep(date, dir) {
            if (!dkType() && dkIs(date) && !dkNo(date)) {                      // 📔 날짜형 표지 → 다음 = 오늘 (꾸민 날만 보기면 마지막으로 꾸민 날) · 앞 = 없음
                if (dir < 0) return null;
                const td = window.dyyClamp ? dyyClamp(new Date()) : new Date(), o = dfOn() ? dyOpenDate() : null;
                return o && !dkIs(o) ? o : td;
            }
            if (dkType() && dkIs(date)) {                                      // 📕 유한 : 1장 ~ 마지막 장
                const o = dkNow(), n = dkNo(date), f = dkFilled(o);
                if (!dfOn()) { const to = n + dir; return to >= 1 && to <= o.pages ? dkDate(to) : null; }
                const nx = (f.length ? f[f.length - 1] : 0) + 1, list = f.concat(nx <= o.pages ? [nx] : []).filter(x => dir > 0 ? x > n : x < n);
                return list.length ? dkDate(dir > 0 ? list[0] : list[list.length - 1]) : null;
            }
            const yin = d => window.dyyIn ? dyyIn(d) : d;                     // 📔 기본 다이어리는 펼친 해 안에서만 (js/dyyear.js · 넘어가면 null → dkEnd)
            if (!dfOn()) return yin(addDays(date, dir));
            dfLoad();
            if (!dfList && !drive.guest) return yin(addDays(date, dir));      // 목록을 받기 전에는 하루씩
            const cur = getDateKey(date), list = dfDays().filter(k => (dir > 0 ? k > cur : k < cur) && yin(dfDate(k)));
            return list.length ? dfDate(dir > 0 ? list[0] : list[list.length - 1]) : null;
        }
        function dfDays() {                                                    // 꾸민 날 (오래된 날부터)
            const keys = new Set(dfList || []);
            store.keys().forEach(k => { if (DAY_KEY_RE.test(k)) keys.add(k); });
            const bk = window.dyyBookId ? dyyBookId() : '';                   // 📔 펼친 권 것만 (js/dyyear.js)
            return [...keys].filter(k => parseDayKey(k).b === bk).filter(dfHas).sort();
        }
        const dfDate = k => { const p = parseDayKey(k); return new Date(p.y, p.m - 1, p.d); };
        /* 다이어리를 열 때 갈 날 : 켜져 있으면 마지막으로 꾸민 날 (목록을 아직 못 받았거나 하나도 없으면 null = 그대로) */
        function dyOpenDate() {
            if (dkType()) { const f = dkFilled(dkNow()); return dkDate(f.length ? f[f.length - 1] : 1); }   // 📕 유한 : 마지막으로 꾸민 장
            if (window.dyyOnOpen) dyyOnOpen();                                 // 📔 새해인데 올해 다이어리가 없으면 알려요 (js/dyyear.js)
            const yc = d => window.dyyClamp ? dyyClamp(d) : d;                 // 📔 펼친 해 안의 날 (js/dyyear.js dyyClamp)
            const keep = () => window.dyyClamp ? yc(new Date(currentDate)) : null;   // 그대로 (펼친 해 밖이면 그 해 안으로)
            if (!dfOn()) return keep();
            dfLoad();
            if (!dfList && !drive.guest) return keep();
            const d = dfDays().filter(k => !window.dyyIn || dyyIn(dfDate(k))); return d.length ? dfDate(d[d.length - 1]) : keep();
        }
        /* 목록을 받은 뒤 · 켰을 때 : 지금 빈 페이지를 보고 있으면 마지막으로 꾸민 날로 */
        async function dfFix() {
            if (dkType()) return dkFix();
            await dfLoad();
            if (!dfOn() || !isCoverOpen || turn) return;
            const cur = getDateKey(currentDate);
            if (dfHas(cur)) return;
            const d = dfDays(); if (d.length && d[d.length - 1] !== cur) goToDate(dfDate(d[d.length - 1]));
        }
        /* 📒 다이어리 고르기 창 */
        function dyThumb(t, sk) {                                              // sk : 다이어리 4색 (테두리 · 속지 색)
            const H = 56, W = Math.round(H / t.r * 2);                             // 모두 펼친 두 쪽 그대로 (실제 비율)
            return `<span class="dy-th" data-b="${t.b}" style="--dy-c:${sk ? sk.border : t.c};${sk ? `--dy-p:${sk.page};` : ''}width:${W}px;height:${H}px"><i></i><i></i></span>`;
        }
        /* 다이어리 창의 📔 다이어리 · 📓 노트 · 🗂 바인더 버튼 (도련 10-18 · 스티커 창처럼 종류 버튼 → 칸 기본 · 내가만든 · 공유받은 · 이벤트 · 문구점)
           다이어리 = 📔 다이어리 보관소 (받은 권 · js/dyyear.js dyyCells)
           노트 · 바인더 = 기본 칸 없음 · 내가만든 (➕ 만들기 + 만든 것 · js/dymaker.js · 10-18 확정) · 공유받은 · 이벤트 · 문구점은 든 게 생기면
           규격 6종은 DY_TYPES 에 그대로 (나중에 문구점 바탕) */
        const DY_ICON = { '다이어리': '📔', '노트': '📓', '바인더': '🗂️' };
        const DY_KNAME = { '다이어리': '다이어리', '노트': '페이지노트', '바인더': '페이지바인더' };   // 다꾸러에게 보이는 이름 (도련 11-04 : 현실 이름 페이지노트 · 페이지바인더 · 만년형은 다꾸용 아님 · 도련 11-04)
        let dyKind = '다이어리', dyTab = 'free';
        /* 📔 다이어리 = 받은 권 보관소 (11-05 도련 : 나만의 다이어리 · 내가만든 칸 없앴어요)
                       📓 노트 · 🗂️ 바인더 = 내가만든(만든 것만 · ➕ 만들기는 다이어리 창의 '페이지노트 만들기 · 페이지바인더 만들기' (11-05 들어가게)) */
        const dyNoteFree = t => t.k === '노트' && t.from !== 'mine' && !dyBagged(t.id);
        const dyBagged = id => { const H = window.deskBagHold ? deskBagHold() : null; return !!H && H.d.has(id); };   // 🛍️ 봉투 속 노트는 꺼낼 때까지 없어요 (도련 11-11)         // 📕 샵 · 선물로 받은 페이지노트 = '기본' 칸 (도련 11-11 · 내가 만든 것은 '내가만든')
        const dyItems = (kind, tab) => kind === '다이어리' ? [] : tab === 'free' ? (kind === '노트' && typeof dmkAll === 'function' ? dmkAll().filter(dyNoteFree) : []) : tab === 'mine' ? (typeof dmkAll === 'function' ? dmkAll().filter(t => t.k === kind && !dyBagged(t.id) && !(t.k === '노트' && t.from !== 'mine')) : []) : tab === 'shop' ? DY_TYPES.filter(t => t.k === kind && !t.off && !t.cvOnly) : [];   /* 🗂️ 바인더 표지는 권이 아니에요 (🧩 조립) */   // 규격 6종은 나중에 문구점 바탕
        const dyHide = (kind, v) => kind === '다이어리' ? v !== 'free' : v === 'free' && !(kind === '노트' && typeof dmkAll === 'function' && dmkAll().some(dyNoteFree));   // 📕 받은 페이지노트가 있으면 '기본' 칸도   // 📔 다이어리 = 기본 다이어리 보관소 하나 (도련 10-28)
        let dySub = '';                                                        // 📔 날짜형 : 'b' 날짜형바인더 · 'n' 날짜형노트 · '' 둘 다 (도련 11-11 : 다이어리 창 버튼 넷)
        function dyOpen(kind, sub) {
            dyKind = DY_TAB.includes(kind) ? kind : dyNow().k;
            dySub = dyKind === '다이어리' && (sub === 'b' || sub === 'n') ? sub : '';
            document.getElementById('dyTitle').textContent = dyKind === '다이어리' ? (dySub === 'b' ? '📔 날짜형바인더' : dySub === 'n' ? '📓 날짜형노트' : '📔 다이어리 보관소') : DY_ICON[dyKind] + ' ' + DY_KNAME[dyKind];
            const ps = document.getElementById('dyPickS'); if (ps) ps.textContent = dyKind === '다이어리' ? (dySub ? `받거나 만든 ${dySub === 'b' ? '날짜형바인더' : '날짜형노트'}가 여기 쌓여요 · 톡 하면 펼쳐요` : '해마다 받은 기본 다이어리가 여기 쌓여요 · 톡 하면 그 해 다이어리를 펼쳐요') : `내가 만든 ${DY_KNAME[dyKind]}가 여기 쌓여요 · 톡 하면 펼쳐요 · ✏️ 고치기`;
            const bar = document.getElementById('dyTabs');
            const tabs = stkTabsOn(null, 'dy').filter(([v]) => !dyHide(dyKind, v));   // ✂️ 문구함 = 꾸미기 문구 카테고리 (지금은 📎 집게 · 나중에 키링 …)                          // 칸에 든 게 생기면 has 로 보여 주기 (지금은 공유받은 · 이벤트 · 문구점이 다 비어 있어요)
            bar.innerHTML = tabs.map(([v, n]) => `<button type="button" class="stk-tab" data-g="${v}" onclick="dyTabSet('${v}')">${n}</button>`).join('');   // 🆓 이벤트 · 문구점은 든 게 있을 때만 (js/stickermaker.js STK_HIDE)
            bar.hidden = bar.children.length < 2;
            dyTabSet(tabs.length ? tabs[0][0] : '');
            openModal('dyModal');
        }
        function dyTabSet(g) {
            dyTab = g;
            const ps = document.getElementById('dyPickS'); if (ps && dyKind !== '다이어리') ps.textContent = g === 'free' ? `받은 ${DY_KNAME[dyKind]}가 여기 쌓여요 · 톡 하면 펼쳐요` : `내가 만든 ${DY_KNAME[dyKind]}가 여기 쌓여요 · 톡 하면 펼쳐요 · ✏️ 고치기`;   // 📕 칸마다 (도련 11-11)
            document.querySelectorAll('#dyTabs .stk-tab').forEach(b => b.classList.toggle('on', b.dataset.g === g));
            if (dyKind === '다이어리' && window.dyyCells) { document.getElementById('dyPickList').innerHTML = `<div class="dy-row">${dyyCells()}</div>`; dyRender(); return; }   // 📔 보관소 : 받은 해 (js/dyyear.js)
            const list = dyItems(dyKind, g), empty = { mine: `아직 만든 ${DY_KNAME[dyKind]}가 없어요.<br>📒 다이어리 창의 ${DY_ICON[dyKind]} ${DY_KNAME[dyKind]} 만들기로 만들어 보세요.`, share: `아직 공유받은 ${DY_KNAME[dyKind]}가 없어요.`, event: `아직 받은 이벤트 ${DY_KNAME[dyKind]}가 없어요.`, shop: `문구점에서 산 ${DY_KNAME[dyKind]}가 여기에 들어와요.` }[g] || `아직 가진 ${DY_KNAME[dyKind]}가 없어요.<br>나중에 문구점에서 산 ${DY_KNAME[dyKind]}가 여기에 들어와요.`;
            const cell = it => it === 'new'
                ? `<button type="button" class="dy-it dy-new" onclick="dmkOpen('${dyKind}')"><span class="dy-stage"><b>＋</b></span><span class="dy-n">${dyKind === '바인더' ? '🧩 바인더 조립' : '새 ' + DY_KNAME[dyKind] + ' 만들기'}</span><small>${dyKind === '바인더' ? '표지 만들기 · 내지 만들기 · 끼우기' : '크기 · 표지 · 내지 · 페이지 수'}</small></button>`
                : it.my
                ? `<button type="button" class="dy-it" data-id="${it.id}" onclick="dySet('${it.id}')"><span class="dy-stage">${dyThumb(it)}</span><span class="dy-n">${dmkEsc(it.g)}</span><small>${it.n} · ${it.pg}페이지</small>${dyNoteFree(it) ? '' : `<span class="dy-ed" role="button" tabindex="0" title="고치기" onclick="event.stopPropagation(); dmkOpen('${dyKind}', '${it.id}')">✏️</span>`}</button>`   /* 📕 받은 노트는 상품 모양 그대로 (✏️ 고치기 없음 · 도련 11-11) */
                : `<button type="button" class="dy-it" data-id="${it.id}" onclick="dySet('${it.id}')"><span class="dy-stage">${dyThumb(it)}</span><span class="dy-n">${it.g}</span><small>${it.g === it.n ? '' : it.n + ' · '}${it.mm}</small></button>`;
            document.getElementById('dyPickList').innerHTML = list.length ? `<div class="dy-row">${list.map(cell).join('')}</div>` : `<div class="cs-empty">${empty}</div>`;
            dyRender();
            if (g === 'mine' && dyKind !== '다이어리' && typeof dmkSync === 'function') dmkSync(dyKind);   // 드라이브의 내노트 · 내바인더 목록과 맞추기
        }
        function dyClose() { closeModal('dyModal'); }
        function dyRender() { const t = dyNow(), id = t.id === DY_DEF ? (window.dyyOnId ? dyyOnId() : DY_DEF) : t.id; document.querySelectorAll('#dyModal .dy-it').forEach(b => b.classList.toggle('on', b.dataset.id === id)); }
        window.dySubNow = () => dySub;
        window.dvToggle = dvToggle; window.dvSideSvg = dvSideSvg; window.dySize = dySize; window.dyLook = dyLook; window.dyDeco = dyDeco; window.dyHalf = dyHalf; window.dyEdgeRect = dyEdgeRect; window.dyViewSet = dyViewSet; window.dyVisX = dyVisX; window.dyVisRect = dyVisRect; window.dkMap = dkMap; window.dyUnderR = dyUnderR; window.dyTabSet = dyTabSet; window.gdTwz = () => gdIsTwz(gdHeld); window.gdTwzId = () => gdIsTwz(gdHeld) ? gdHeld : gdMain('tweez');   // 🪡 든 핀셋 (핀셋 그림 · js/elements.js pinSvg) window.bdOut = bdOut; window.bdIn = bdIn; window.bdModeSet = bdModeSet; window.bdModeRender = bdModeRender; window.bdSync = bdSync; window.dvSet = dvSet; window.dvRender = dvRender; window.dyLoad = dyLoad; window.dyOpen = dyOpen; window.dyClose = dyClose; window.dySet = dySet; window.dfSet = dfSet; window.dfRender = dfRender; window.dyStep = dyStep; window.dfLoad = dfLoad; window.dyOpenDate = dyOpenDate; window.dfFix = dfFix; window.dkFolderName = dkFolderName; window.dkInfo = dkInfo;
        window.dkType = dkType; window.dkId = dkId; window.dkCoverEdit = dkCoverEdit; window.dkUnfold = dkUnfold; window.dkRefold = dkRefold; window.dkCoverPaint = dkCoverPaint; window.dkKey = dkKey; window.dkIs = dkIs; window.dkNo = dkNo; window.dkDate = dkDate; window.dkNow = dkNow; window.dkFilled = dkFilled; window.dkDayOf = dkDayOf;
        window.dkMark = dkMark; window.dkReal = dkReal; window.dkLabel = dkLabel; window.dkTap = dkTap; window.dkPath = dkPath; window.dkSync = dkSync; window.dkEnd = dkEnd; window.dkInfoOf = dkInfoOf; window.dkInfoMerge = dkInfoMerge;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['skins'] = true;
