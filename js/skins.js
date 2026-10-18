/* 말랑달콤 다이어리 - js/skins.js
   🎨 페이지 메뉴 (기본페이지 · 말랑배경지) · 전체 배경지 적용/저장/불러오기
   - 고른 배경지는 설정값 'diary_bg_pattern' 으로 저장 → 구글 드라이브 설정.json 에 함께 저장돼요
       예) "diary_bg_pattern": {"id":"tomato","scale":1}
   - 배경지 해제 시 이 값을 지워요 (설정.json 에서도 빠짐)
   - 목록 배치(한 줄에 몇 개·몇 줄·크기)는 기기마다 화면이 달라서 이 기기(localStorage)에만 기억
   - 배경지 출처 : 기본 제공(js/patterns.js) · 내 배경지('my:번호') · 등록된 사용자 배경지('cm:번호', 관리자가 승인한 것)
       등록된 사용자 배경지는 레시피를 함께 저장해서 {"id":"cm:3","scale":1,"r":{...}} 처럼 기록 → 목록에서 빠져도 배경은 유지
   - 🌟 모두의 페이지(js/community-skins.js) 목록도 여기서 읽어요. 페이지 고르기·저장은 js/settings.js
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → patterns → community-patterns → community-skins → pattern-recipe → skins → pattern-maker → service */

        const BG_PATTERN_KEY = 'diary_bg_pattern';
        const PATTERN_SCALE_MIN = 0.5, PATTERN_SCALE_MAX = 2;

        let bgPattern = null;              // 지금 적용된 배경지 { id, scale, r? } (없으면 null)

        /* id로 패턴 찾기 → { id, tier, name, css, by? } */
        function findBgPattern(id, inlineRecipe) {
            if (typeof id !== 'string') return null;
            if (id.startsWith('my:')) {
                return (typeof getMyPatternItems === 'function' ? getMyPatternItems() : []).find(p => p.id === id) || null;
            }
            if (id.startsWith('cm:')) {
                const hit = (typeof getCommunityItems === 'function' ? getCommunityItems() : []).find(p => p.id === id);
                if (hit) return hit;
                const css = inlineRecipe ? recipeToCss(inlineRecipe) : null;   // 목록을 아직 못 받았으면 저장된 레시피로 그리기
                return css ? { id, tier: 'free', name: '사용자 배경지', css } : null;
            }
            return BG_PATTERNS.find(p => p.id === id) || null;
        }
        function currentBgPattern() { return bgPattern ? findBgPattern(bgPattern.id, bgPattern.r) : null; }
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
                if (bgPattern.r) v.r = bgPattern.r;
                if (bgPattern.g) v.g = 1;                                      // 받은배경지 칸 것 (다음에 열 때 어디서 읽을지 · js/pattern-maker.js)
                store.setItem(BG_PATTERN_KEY, JSON.stringify(v));
            }
            else if (store.getItem(BG_PATTERN_KEY) !== null) store.removeItem(BG_PATTERN_KEY);
        }

        /* ---------- 불러오기 : 드라이브 설정을 읽은 뒤 / PC 백업 불러온 뒤 호출 ----------
           값이 없거나, 깨졌거나, 목록에 없는 배경지가면 배경지 없이 표시 (저장된 값은 건드리지 않음) */
        function loadBgPattern() {
            let v = null;
            try { v = JSON.parse(store.getItem(BG_PATTERN_KEY)); } catch (e) { v = null; }
            const r = v && v.r ? sanitizeRecipe(v.r) : null;
            bgPattern = (v && typeof v === 'object' && findBgPattern(v.id, r))
                ? { id: v.id, scale: clampPatternScale(v.scale) } : null;
            if (bgPattern && r) bgPattern.r = r;
            renderBgPattern();
        }

        async function selectBgPattern(id, got) {
            if (id.startsWith('my:') && !findBgPattern(id) && !(typeof patEnsure === 'function' && await patEnsure(id.slice(3), got == null ? null : !!got))) {
                showMsg('⚠ 이 배경지를 불러오지 못했어요.<br><span style="font-size:12px;color:#777;">인터넷 연결을 확인해 주세요.</span>'); return;
            }
            const p = findBgPattern(id);
            if (!p) return;
            bgPattern = { id, scale: bgPattern ? bgPattern.scale : 1 };
            if (p.recipe && id.startsWith('cm:')) bgPattern.r = p.recipe;      // 등록된 사용자 배경지는 레시피도 같이 저장
            if (p.got) bgPattern.g = 1;
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

        /* ---------- 스킨 메뉴 ---------- */
        function openSkinBasic() {
            closeModal('skinModal');
            updatePatternUI();
            openModal('skinBasicModal');
        }

        /* ---------- 🌟 모두의 스킨 (카페에서 받아 관리자가 등록 : js/community-skins.js) ----------
           목록 한 줄 : {"no":1,"name":"봄날","by":"닉네임","skin":{색 5개}}  →  id 'cs:번호'
           파일이 없거나 깨져도 다이어리는 정상 동작 (모두의 페이지만 안 보임) */
        let communitySkinItems = null;
        function getCommunitySkins() {
            if (communitySkinItems) return communitySkinItems;
            communitySkinItems = [];
            const list = (typeof COMMUNITY_SKINS !== 'undefined' && Array.isArray(COMMUNITY_SKINS)) ? COMMUNITY_SKINS : [];
            list.forEach(row => {
                const no = parseInt(row && row.no, 10);
                const skin = row && sanitizeSkin(row.skin);
                if (!no || !skin || communitySkinItems.some(x => x.id === 'cs:' + no)) return;
                communitySkinItems.push({
                    id: 'cs:' + no, no,
                    name: recipeText(row.name, 20) || '모두의 페이지', by: recipeText(row.by, 12), skin
                });
            });
            return communitySkinItems;
        }

        /* ---------- 스킨 창 : 제목을 끌어서 옮기기 · 👀 꾹 눌러 다이어리 보기 ----------
           페이지 색을 바꾸면서 뒤의 다이어리가 어떻게 바뀌는지 볼 수 있게 */
        (function setupSkinWindows() {
            const posOf = {};
            const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
            document.querySelectorAll('.modal.skin-float').forEach(modal => {
                const box = modal.querySelector('.modal-content');
                const title = box && box.querySelector('.modal-title');
                if (!title) return;
                title.classList.add('drag-title');
                title.title = '끌어서 창을 옮길 수 있어요';
                let start = null;
                title.addEventListener('pointerdown', e => {
                    if (e.button > 0 || e.target.closest('button')) return;      // 제목 줄의 ← · ✕ · 👀 버튼은 끌기 아님
                    const p = posOf[modal.id] || { x: 0, y: 0 };
                    start = { x: e.clientX, y: e.clientY, ox: p.x, oy: p.y };
                    title.setPointerCapture(e.pointerId);
                    e.preventDefault();
                });
                title.addEventListener('pointermove', e => {
                    if (!start) return;
                    const r = box.getBoundingClientRect(), p = posOf[modal.id] || { x: 0, y: 0 };
                    /* 창이 화면 밖으로 나가지 않게 (창 전체가 화면 안에) */
                    const baseL = r.left - p.x, baseT = r.top - p.y;
                    const x = clamp(start.ox + e.clientX - start.x, -baseL, Math.max(-baseL, window.innerWidth - r.width - baseL));
                    const y = clamp(start.oy + e.clientY - start.y, -baseT, Math.max(-baseT, window.innerHeight - r.height - baseT));
                    posOf[modal.id] = { x, y };
                    box.style.position = 'relative'; box.style.left = x + 'px'; box.style.top = y + 'px';   // transform 이 아니라 left · top : 창이 따로 겹 층을 만들지 않아야 ← · ✕ 버튼이 테이프 위에 나와요
                    box.dispatchEvent(new Event('dk-move'));                   // 모서리 테이프도 창을 따라가게 (js/dakku.js dkTapes)
                });
                const end = () => { start = null; };
                title.addEventListener('pointerup', end);
                title.addEventListener('pointercancel', end);
            });
            /* 화면 크기가 바뀌면(폰 돌리기 등) 옮겨 둔 창은 가운데로 */
            window.addEventListener('resize', () => {
                Object.keys(posOf).forEach(id => { delete posOf[id]; const b = document.querySelector('#' + id + ' .modal-content'); if (b) { b.style.left = b.style.top = ''; b.dispatchEvent(new Event('dk-move')); } });
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

        /* ---------- 📔 페이지 목록 (썸네일만 · 스티커 창과 같은 칸 5개 · 10-18 '기본' 칸 4색만 보여요 · 기본 다이어리에만 적용) ----------
           기본 = 기본 페이지 4종 · 내가만든 = 🎨 색상설정 · 🎀 꾸미기에서 저장한 것 · 공유받은 = 📥 파일로 받은 것 + 🌟 모두의 페이지
           이벤트 = 🌸 계절 테마 등 · 문구점 = 🎁 테마 페이지 + 🛍️ 문구점 가기
           썸네일은 따로 저장하지 않고, 페이지에 저장된 색 5개 · 꾸밈 위치로 작은 다이어리를 바로 그려요 (요청 없음) */
        let sklTab = 'free';
        function openPageList(tab) {
            closeModal('skinModal');
            const bar = document.getElementById('pageTabs');
            bar.innerHTML = stkTabsOn(v => sklItems(v).length, 'page').filter(([v]) => v === 'free').map(([v, n]) => `<button type="button" class="stk-tab" data-tab="${v}" onclick="sklSetTab('${v}')">${n}</button>`).join('');   // 🆓 이벤트 · 문구점은 받은 게 있을 때만 (js/stickermaker.js STK_HIDE)
            sklTab = tab || sklTabOf(currentSkinId);
            if (!bar.querySelector(`[data-tab="${sklTab}"]`)) sklTab = 'free';
            renderPageList();
            openModal('pageListModal');
        }
        /* 지금 쓰는 페이지가 들어 있는 칸 */
        function sklTabOf(id) {
            if (hasOwn(skinPresets, id)) return 'free';
            if (String(id).startsWith('cs:')) return 'share';
            if (String(id).startsWith('th:')) return 'shop';
            if (hasOwn(customSkins, id)) return customSkins[id].got ? 'share' : 'mine';
            return 'free';
        }
        function sklSetTab(tab) { sklTab = tab; renderPageList(); const g = document.getElementById('pageGrid'); if (g) g.scrollTop = 0; }
        function sklIsOpen() { const m = document.getElementById('pageListModal'); return !!m && m.style.display === 'flex'; }
        /* 칸에 보일 페이지들 [{ id, skin, own(지울 수 있음) }] */
        function sklItems(tab) {
            if (tab === 'free') return Object.keys(skinPresets).map(k => ({ id: k, skin: skinPresets[k] }));
            if (tab === 'share') return skinCommunity().map(c => ({ id: c.id, skin: c.skin }));     // 📥 받은페이지는 모음에서 따로 (renderPageList)
            if (tab === 'shop') return (typeof stuThemeList === 'function' ? stuThemeList() : []).filter(t => stuHasTheme(t.id))
                .map(t => { const th = themeSkinOf(t.id); return th ? { id: 'th:' + t.id, skin: th.skin } : null; }).filter(Boolean);
            return [];
        }
        function renderPageList() {
            const g = document.getElementById('pageGrid');
            if (!g) return;
            document.querySelectorAll('#pageTabs .stk-tab').forEach(b => b.classList.toggle('on', b.dataset.tab === sklTab));
            const items = sklItems(sklTab);
            let head = typeof dkType === 'function' && dkType() ? '<div class="cs-empty skl-wide">📒 지금은 기본 다이어리가 아니라서 색이 안 보여요.<br>고른 색은 기본 다이어리에서 보여요.</div>' : '';
            if (sklTab === 'share' && (typeof ftOn !== 'function' || ftOn('share'))) head = '<div class="shx-bar in"><button type="button" class="shx-btn go" onclick="document.getElementById(\'skinFileInput\').click()">📥 파일 불러오기</button><small>카페에서 받은 페이지 파일을 골라요</small></div>';
            if (sklTab === 'event' && typeof SEASON_OPEN !== 'undefined' && SEASON_OPEN) head = '<div class="season-card skl-wide" id="seasonCard"></div>';
            const empty = {
                mine: '아직 만든 페이지가 없어요.<br>🎨 페이지 색상설정이나 🎀 페이지 꾸미기에서 저장해 보세요!',
                share: '아직 공유받은 페이지가 없어요.<br>카페에서 받은 파일을 📥 파일 불러오기로 넣어 보세요.',
                event: '🎁 아직 받은 이벤트 페이지가 없어요.<br>이벤트 페이지가 오면 여기에 들어와요!'
            }[sklTab];
            const shop = sklTab === 'shop' ? `<button type="button" class="stk-go" onclick="openShop('#/c/페이지')"><span>🛍️</span><b>문구점에서 페이지 보기</b><small>새 창으로 열려요</small></button>` : '';
            const cell = (it, got, by) => {
                const on = it.id === currentSkinId, safe = String(it.id).replace(/[\\'"<>&]/g, c => '&#' + c.charCodeAt(0) + ';');
                const acts = it.own ? `<span class="skl-acts">${got || (typeof ftOn === 'function' && !ftOn('share')) ? '' : `<button type="button" title="파일로 저장 (카페에 올리기용)" onclick="downloadSkinFile('${safe}')">💾</button>`}<button type="button" title="지우기" onclick="deleteSkin('${safe}', ${got ? 1 : 0})">🗑</button></span>` : '';
                return `<div class="skl-it${on ? ' on' : ''}" data-id="${safe}"><button type="button" class="skl-pick" aria-pressed="${on}" onclick="sklPick('${safe}'${it.own ? (got ? ', 1' : ', 0') : ''})">${sklThumb(it.skin)}${on ? '<span class="skl-on">✔ 사용 중</span>' : ''}</button>${by ? `<small class="shx-by">by ${String(by).replace(/[<>&"']/g, c => '&#' + c.charCodeAt(0) + ';')}</small>` : ''}${acts}</div>`;
            };
            const coll = sklTab === 'mine' || sklTab === 'share';                    // 🎨 내가만든 · 📥 받은 페이지 : 모음에서 작은 그림으로 (js/coll.js)
            g.innerHTML = head + (coll ? '<div class="cg-host"></div>' : '') + items.map(it => cell(it)).join('')
                + (!coll && !items.length && !shop && empty && !(sklTab === 'event' && head) ? `<div class="cs-empty">${empty}</div>` : '') + shop;
            if (coll) {
                const got = sklTab === 'share', C = pgColl(got), tab = sklTab;
                C.onChange = () => { if (sklIsOpen() && sklTab === tab) renderPageList(); };
                collGrid(g.querySelector('.cg-host'), C, e => cell({ id: e.id, skin: e.th, own: true }, got, got && e.x && e.x.by), got && items.length ? '' : `<div class="cs-empty">${empty}</div>`);
            }
            if (head.includes('seasonCard') && typeof seasonRenderCard === 'function') seasonRenderCard();
        }
        /* 고르기 : 내 페이지는 원본을 읽은 뒤에 (got : 받은페이지 칸) */
        async function sklPick(id, got) {
            if ((got != null) && !hasOwn(customSkins, id) && !(await pgEnsure(id, !!got))) { showMsg('⚠ 이 페이지를 불러오지 못했어요.<br><span style="font-size:12px;color:#777;">인터넷 연결을 확인해 주세요.</span>'); return; }
            if (applySkinPreset(id)) renderPageList();
        }
        /* 작은 다이어리 그림 : 바탕 · 겉표지 · 속지(테두리) · 하단메뉴 + 놓아 둔 꾸밈 (속지 · 머리 · 하단메뉴 자리) */
        function sklThumb(skin) {
            /* 기본 페이지 겉표지는 그라데이션이라 sanitizeSkin(색 #rrggbb 만)을 지나도록 잠깐 바꿨다가 돌려놓아요 */
            const okCol = v => typeof v === 'string' && /^(#[0-9a-f]{3,8}|linear-gradient\([#0-9a-z%,.\s]+\))$/i.test(v);
            const raw = skin && typeof skin === 'object' ? skin : {}, tmp = Object.assign({}, raw);
            ['bg', 'cover', 'page', 'border', 'accent'].forEach(k => { if (okCol(raw[k]) && !/^#[0-9a-f]{6}$/i.test(raw[k])) tmp[k] = '#ffffff'; });
            const c = typeof sanitizeSkin === 'function' ? sanitizeSkin(tmp) : null;
            if (!c) return '<span class="skl-mini"></span>';
            ['bg', 'cover', 'page', 'border', 'accent'].forEach(k => { if (okCol(raw[k])) c[k] = raw[k]; });
            const pw = (document.getElementById('innerPage') || {}).offsetWidth || 340;
            const bw = (document.querySelector('.toolbar') || {}).offsetWidth || 340;
            const deco = where => (c.deco || []).filter(d => where.includes(d.a)).map(d => {
                const ref = d.a === 'paper' || d.a === 'pill' ? pw : bw;
                const x = /^b[1-4]$/.test(d.a) ? (+d.a[1] - .5) * 25 : d.x;
                const w = Math.max(4, d.s / ref * 100);
                return `<span class="skl-d" style="left:${x}%;top:${/^b[1-4]$/.test(d.a) ? 50 : d.y}%;width:${w}%;font-size:${(w * .8).toFixed(1)}cqw;transform:translate(-50%,-50%) rotate(${d.r || 0}deg)${d.f ? ' scaleX(-1)' : ''}">${typeof stuImgHtml === 'function' ? stuImgHtml(d.i, c.imgs || {}) : ''}</span>`;
            }).join('');
            return `<span class="skl-mini" style="background:${c.bg}">
                <span class="skl-cv" style="background:${c.cover}"><span class="skl-pp" style="background:${c.page};border-color:${c.border}"><i class="skl-pill" style="background:${c.accent}"></i>${deco(['paper', 'pill'])}</span></span>
                <span class="skl-bar" style="background:${c.page};border-color:${c.menu || c.border}">${[1, 2, 3, 4].map(n => `<i style="background:${c['mf' + n] || c.accent}"></i>`).join('')}${deco(['bar', 'b1', 'b2', 'b3', 'b4'])}</span></span>`;
        }
        window.openPageList = openPageList; window.sklSetTab = sklSetTab; window.sklPick = sklPick;

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
        function patItems() {
            const cm = typeof getCommunityItems === 'function' ? getCommunityItems() : [];
            const my = tab => typeof patListItems === 'function' ? patListItems(tab).items : [];   // 🌈 내가만든 · 받은 : 모음의 작은 그림 (js/pattern-maker.js)
            if (patTier === 'mine') return my('mine');
            if (patTier === 'share') return my('share').concat(cm);
            if (patTier === 'free') return BG_PATTERNS.filter(p => p.tier === 'free');
            return [];
        }
        function patPerPage() { return patLayout.rows * patLayout.cols; }
        /* 내가만든 · 공유받은 칸 : 아직 안 읽은 묶음이 있어요 */
        function patMore() { return (patTier === 'mine' || patTier === 'share') && typeof patListItems === 'function' && patListItems(patTier).more; }
        function patPageCount() { const n = patItems().length; return n ? Math.ceil(n / patPerPage()) : 0; }

        function openPatternList(tier) {
            tier = { my: 'mine' }[tier] || tier;
            if (!STK_TABS.some(t => t[0] === tier)) {                                  // 칸을 안 정했으면 지금 쓰는 배경지가 있는 칸부터
                const id = bgPattern ? String(bgPattern.id) : '';
                const mine = id.startsWith('my:') && (getMyPatternItems().find(p => p.id === id) || {});
                tier = id.startsWith('cm:') ? 'share' : mine ? (mine.got ? 'share' : 'mine') : 'free';
            }
            const bar = document.getElementById('patTabs');
            if (bar) bar.innerHTML = stkTabsOn().filter(([v]) => v !== 'mine' || ftOn('patmake')).map(([v, n]) => `<button type="button" class="stk-tab" data-tab="${v}" onclick="setPatTab('${v}')">${n}</button>`).join('');   // 🆓 이벤트 · 문구점은 받은 게 있을 때만 (js/stickermaker.js STK_HIDE)
            if (bar && !bar.querySelector(`[data-tab="${tier}"]`)) tier = 'free';
            closeModal('skinModal');
            setPatTab(tier);
            openModal('patternModal');
        }
        function setPatTab(tier) {
            patTier = tier;
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
            grid.innerHTML = '';
            const items = patItems(), per = patPerPage(), pages = patPageCount(), more = patMore();
            if (more && items.length < (patPage + 1) * per) {                 // 이 쪽을 채울 만큼 아직 안 읽었으면 다음 묶음을 읽고 다시 그려요
                const tier = patTier;
                patListMore(tier).then(() => { if (patTier === tier) renderPatternList(); });
            }
            const nickRow = document.getElementById('patNickRow');
            if (nickRow) {
                nickRow.style.display = patTier === 'share' && window.pickPatternFile ? 'flex' : 'none';   // 📥 파일 불러오기 (js/pattern-maker.js)
            }
            document.getElementById('patStatus').textContent = items.length
                ? `배경지 ${items.length}${more ? '개 넘게' : '개'} · 누르면 전체 배경에 적용돼요`
                : more ? '불러오는 중…'
                : ({ mine: '아직 만든 배경지가 없어요. 🖼️ 이미지로 · 🖌️ 그려서 배경지에서 만들어 보세요!', share: '아직 공유받은 배경지가 없어요.', event: '🎁 아직 받은 이벤트 배경지가 없어요.', shop: '' }[patTier] ?? '아직 준비된 배경지가 없어요.');
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
                card.append(sw);                                               // 썸네일 (+ 공유받은 것은 by 만든 사람)
                if (p.by) { const by = document.createElement('small'); by.className = 'shx-by'; by.textContent = 'by ' + p.by; card.append(by); }
                card.onclick = () => { if (!patSwiped) selectBgPattern(p.id, p.tier === 'my' ? p.got : null); };
                if (p.tier === 'my') {                                         // 내가만든 · 공유받은 : 파일 저장(내가만든만) · 삭제
                    const wrap = document.createElement('div');
                    wrap.className = 'pat-item-wrap';
                    const acts = document.createElement('div');
                    acts.className = 'pat-actions';
                    const send = document.createElement('button');
                    send.type = 'button'; send.className = 'btn'; send.textContent = '💾'; send.title = '파일로 저장 (카페에 올리기용)';
                    send.onclick = () => downloadMyPattern(p.uid);
                    const del = document.createElement('button');
                    del.type = 'button'; del.className = 'btn'; del.textContent = '🗑'; del.title = '삭제';
                    del.onclick = () => deleteMyPattern(p.uid, p.got);
                    if (p.got) acts.append(del); else acts.append(send, del);
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

        /* 지금 쓰는 패턴 이름 · 패턴 크기 · 해제 버튼 · 기본스킨 창 안내문 */
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
            const note = document.getElementById('skinPatternNote');
            if (note) note.style.display = p ? 'flex' : 'none';
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
        const DY_TYPES = [
            { id: 'basic', k: '다이어리', g: '기본', n: '기본', mm: '85×165', b: 'thin', r: 165 / 85, c: '#f7a8c0' },
            { id: 'ring-a5', k: '바인더', g: '6공 바인더', n: 'A5', mm: '148×210', b: 'ring', r: 210 / 148, c: '#ff9dbb' },
            { id: 'ring-a6', k: '바인더', g: '6공 바인더', n: 'A6', mm: '105×148', b: 'ring', r: 148 / 105, c: '#c4b2f2' },
            { id: 'leather-slim', k: '노트', g: '가죽 노트', n: '슬림', mm: '110×210', b: 'tn', r: 210 / 110, c: '#a3714f' },
            { id: 'pocket-a6', k: '노트', g: '문고판 노트', n: 'A6', mm: '105×148', b: 'spread', r: 148 / 105, c: '#ffb3c7' },
            { id: 'hard-a5', k: '노트', g: '하드커버 노트', n: '라지', mm: '130×210', b: 'hard', r: 210 / 130, c: '#5a4652' },
            { id: 'month', k: '노트', g: '한 달 노트', n: '데일리 한 달', mm: '85×165', b: 'thin', r: 165 / 85, c: '#8fd0b7' }
        ];
        const DY_DEF = 'basic';                                                // 처음 설치하면 기본 다이어리
        const DY_TAB = ['다이어리', '노트', '바인더'];                         // 고르기 창 위 카테고리 = k (도련 · 10-18 : 실물 모양으로 · 저장 폴더는 나누지 않아요 · 다이어리.json kind)
        /* 📕 유한 다이어리 저장 규칙 (도련 · 10-17) : 말랑달콤 / 다꾸 / 디자인 (규격) [n권] / …
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
        const dyNow = () => dyFind(prefGet(DY_KEY, DY_LOCAL)) || DY_TYPES.find(t => t.id === DY_DEF);
        /* 📖 펼침면 (도련 · 10-17) : 모든 다이어리는 펼친 두 쪽이 하루예요
           - 저장은 늘 두 쪽짜리 종이 하나 (getPageSize = 두 쪽 크기) · 보는 방법만 기기마다 설정에서 골라요 (📖 양쪽 · 📄 한쪽)
           - spread : 💻 컴퓨터 · 📲 패드 양쪽 = 두 쪽이 다 보여요 (다이어리를 열면 #diaryWrapper 왼쪽에 한 쪽만큼 자리를 비워 가운데로)
           - swipe  : 📱 폰 양쪽 = 반쪽씩 · 밀면 같은 날 왼쪽 ↔ 오른쪽 · 끝에서 한 번 더 밀면 장이 넘어가요 (다음 날은 왼쪽부터 · 전날은 오른쪽부터)
           - right  : 한쪽 = 오른쪽 쪽만 · 예전 한 쪽 다이어리처럼 바로 다음 날 · 전날로 넘어가요 (왼쪽 쪽은 안 보여요)
           - #diaryBook 은 한 쪽 크기 그대로 · #innerPage 가 두 배로 넓어져 왼쪽으로 한 쪽만큼 나가요 (css #diaryBook.dy-sp) → 책은 오른쪽 쪽 자리 */
        const DV_KEY = 'diary_view', DV_LOCAL = 'malang_view', DV_DEF = { phone: 'one', pad: 'two', pc: 'two' };   // 📱 폰은 한쪽이 기본 (도련 · 10-17)
        function dvDev() {                                                     // 이 기기 : 폰(화면 짧은 쪽 600 미만) · 패드(손가락 화면) · 컴퓨터
            if (Math.min(screen.width, screen.height) < 600) return 'phone';
            return navigator.maxTouchPoints > 0 && matchMedia('(any-pointer: coarse)').matches ? 'pad' : 'pc';
        }
        function dvCfg() { const v = prefGet(DV_KEY, DV_LOCAL); return Object.assign({}, DV_DEF, v && typeof v === 'object' ? v : {}); }
        function dvSet(k, v) { const c = dvCfg(); c[k] = v === 'one' ? 'one' : 'two'; prefSet(DV_KEY, DV_LOCAL, c); dvRender(); if (k === dvDev()) dyLoad(); }
        function dvRender() {
            const c = dvCfg(), me = dvDev();
            document.querySelectorAll('#dvPick [data-k]').forEach(row => {
                row.classList.toggle('me', row.dataset.k === me);
                row.querySelectorAll('[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === c[row.dataset.k]));
            });
        }
        const dyMode = () => dkCv() || dvCfg()[dvDev()] === 'one' ? 'right' : dvDev() === 'phone' ? 'swipe' : 'spread';   // 📕 표꾸 중엔 접힌 겉표지처럼 앞표지 한 쪽만
        let dyView = 'l';                                                      // 📱 지금 보는 쪽 (l 왼쪽 · r 오른쪽)
        function dySize() {                                                    // 📐 한 쪽 크기 (js/page.js refreshLayout) · two = 두 쪽이 다 보여요
            const t = dyNow(), ch = DY_H - PAGE_BORDER * 2 - PAGE_HEADER_H;
            return { w: Math.round(ch / t.r) + PAGE_BORDER * 2, h: DY_H, two: dyMode() === 'spread' };
        }
        const dyUnderR = (dir, cover) => dyMode() === 'right' || (dyMode() === 'swipe' && !cover && dir === -1);   // 넘길 때 밑에 보일 장이 오른쪽 쪽인지 (js/page.js beginCurl)
        function dyViewSet(v, anim) {                                          // 📱 왼쪽 · 오른쪽 쪽 보기 (한쪽 보기는 늘 오른쪽)
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
        /* 📎 집게 (도련 10-18) : 노트로 다꾸하는 사람들이 뜬 페이지를 집게로 눌러 둬요
           - 노트용 장식이에요 (페이지 들림 연출은 도련이 뺐어요 · 기본 다이어리 · 바인더엔 안 꽂아요) · 크기는 노트 크기와 상관없이 늘 같아요 · 골라 쓰는 것
           - 기본집게 = 같은 모양 색만 다르게 (평범한 더블 클립) · 📓 노트 창 → 📎 기본집게 칸 · 왼쪽 쪽 위 종이 끝을 물어요
           - 설정.json 'diary_clip' (게스트는 이 기기) = 고른 색 id · '' = 안 써요 · 나중에 키링 같은 꾸미기 문구류도 이 칸 옆에 (정해진 자리에 설치) */
        const CLIP_KEY = 'diary_clip', CLIP_LOCAL = 'malang_diary_clip';
        const CLIPS = [['black', '검정', '#3f3b42'], ['pink', '분홍', '#ff8fb1'], ['sky', '하늘', '#7cc4ea'], ['yellow', '노랑', '#f7c948'], ['mint', '민트', '#6fcca8'], ['purple', '보라', '#b39ddb']];
        const clipId = () => { const v = prefGet(CLIP_KEY, CLIP_LOCAL); return CLIPS.some(c => c[0] === v) ? v : ''; };
        const clipNow = () => CLIPS.find(c => c[0] === clipId()) || null;
        let clipN = 0;
        function clipSvg(c) {                                                  // 평범한 더블 클립 (앞에서 본 모양 · 쇠 손잡이는 뒤로 젖혀서 위로 조금만 · 몸통은 고른 색)
            const w = 'clipW' + (++clipN);                                     // 그라데이션 id 는 그림마다 따로 (숨은 창의 것을 빌리면 안 보여요)
            return `<svg viewBox="0 0 64 50" aria-hidden="true"><defs><linearGradient id="${w}" x1="0" x2="1"><stop offset="0" stop-color="#8e949e"/><stop offset=".45" stop-color="#f4f5f8"/><stop offset="1" stop-color="#9aa0aa"/></linearGradient></defs>`
                + `<path d="M15 10 Q14 1 22 1 H42 Q50 1 49 10" fill="none" stroke="url(#${w})" stroke-width="3.2" stroke-linejoin="round"/>`
                + `<path d="M20 10 Q20 5 25 5 H39 Q44 5 44 10" fill="none" stroke="url(#${w})" stroke-width="2.6"/>`
                + `<path d="M9 9 H55 L60 45 Q60 48 57 48 H7 Q4 48 4 45 Z" fill="${c}"/>`
                + `<path d="M9 9 H55 L56.6 21 H7.4 Z" fill="#fff" fill-opacity=".22"/><path d="M4.6 40 H59.4 L60 45 Q60 48 57 48 H7 Q4 48 4 45 Z" fill="#000" fill-opacity=".18"/>`
                + `<rect x="7" y="7" width="50" height="5" rx="2.5" fill="url(#${w})"/></svg>`;
        }
        /* 📎 집게 옮기기 (도련 10-18) : 집게를 누른 채 끌면 종이 테두리를 레일처럼 따라가요 (모서리는 둥글게 돌면서 · 테두리 밖으로는 못 나가요)
           - 자리 = 테두리 한 바퀴 중 어디쯤 (0~1 · 위 왼쪽 모서리 끝에서 시계 방향) · 설정 'diary_clip_at' · 노트 크기가 달라도 같은 자리
           - 집게 아랫입(종이를 무는 곳)이 테두리 위 · 몸통은 늘 바깥쪽을 봐요 */
        const CLIP_AT_KEY = 'diary_clip_at', CLIP_AT_LOCAL = 'malang_diary_clip_at', CLIP_GX = 59, CLIP_GY = 66;   // 집게 그림에서 종이를 무는 곳
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
        function clipBox() {
            const fr = document.getElementById('dyFront'), cv = document.getElementById('canvasArea'), el = fr && fr.querySelector('.dy-clip');
            if (!el || !cv) return null;
            return { fr, el, rail: clipRail(fr.offsetWidth, fr.offsetHeight, parseFloat(getComputedStyle(cv).borderTopLeftRadius) || 12) };
        }
        let clipF = null;                                                      // 끄는 동안의 자리
        function clipF0(b) { const v = prefGet(CLIP_AT_KEY, CLIP_AT_LOCAL); return typeof v === 'number' && v >= 0 && v < 1 ? v : (b.fr.offsetWidth * .03 + CLIP_GX) / b.rail.L; }   // 처음 = 왼쪽 쪽 위
        function clipPlace(f) {
            const b = clipBox(); if (!b) return;
            if (f == null) f = clipF != null ? clipF : clipF0(b);
            const [x, y, deg] = b.rail.at(f * b.rail.L);
            Object.assign(b.el.style, { left: (x - CLIP_GX) + 'px', top: (y - CLIP_GY) + 'px', transform: `rotate(${deg}deg)` });
        }
        function clipDown(e) {
            const b = clipBox(); if (!b) return;
            e.preventDefault(); e.stopPropagation();
            const el = b.el; el.setPointerCapture && el.setPointerCapture(e.pointerId); el.classList.add('drag');
            clipF = clipF0(b);
            const move = ev => {                                               // 손가락에서 가장 가까운 테두리 자리 (지금 자리 근처에서만 찾아 건너뛰지 않아요)
                ev.preventDefault();
                const bb = clipBox(); if (!bb) return;
                const rc = bb.fr.getBoundingClientRect(), sx = rc.width / bb.fr.offsetWidth || 1, px = (ev.clientX - rc.left) / sx, py = (ev.clientY - rc.top) / sx, L = bb.rail.L;
                let best = clipF * L, bd = Infinity;
                for (let d = -L * .2; d <= L * .2; d += 3) { const [x, y] = bb.rail.at(clipF * L + d), dd = (x - px) ** 2 + (y - py) ** 2; if (dd < bd) { bd = dd; best = clipF * L + d; } }
                clipF = (((best / L) % 1) + 1) % 1; clipPlace(clipF);
            };
            const up = () => {
                el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
                el.classList.remove('drag');
                prefSet(CLIP_AT_KEY, CLIP_AT_LOCAL, Math.round(clipF * 10000) / 10000); clipF = null;
            };
            el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        }
        function clipPick(id) {
            prefSet(CLIP_KEY, CLIP_LOCAL, CLIPS.some(c => c[0] === id) ? id : '');
            dyDeco(); dyRender();
        }
        /* 페이지 둘레 꾸밈 : 커버(뒤) · 가운데 접힘 · 링 · 밴드 · 책갈피 끈(앞) */
        function dyParts(t) {
            const back = [], front = [];
            const rings = n => { let h = ''; for (let i = 0; i < n; i++) h += '<i></i>'; return h; };
            back.push('<b class="dy-cov"></b>');
            front.push(t.b === 'ring' ? '<span class="dy-gap"></span>' : '<span class="dy-fold"></span>');   // 🗂️ 바인더는 링 때문에 두 속지가 떨어져 있어요 (가운데로 표지 안쪽이 보여요)
            if (t.b === 'ring') front.push(`<span class="dy-rings">${rings(6)}</span>`);
            if (t.b === 'tn') front.push('<span class="dy-band"></span>');
            if (t.b === 'spread') front.push('<span class="dy-rib"></span>');
            if (t.b === 'hard') front.push('<span class="dy-band hard"></span>');
            if (t.k === '노트') { const c = clipNow(); if (c) front.push(`<span class="dy-clip" title="끌어서 옮겨요" onpointerdown="clipDown(event)">${clipSvg(c[2])}</span>`); }   // 📎 집게 = 노트용 장식 (기본 다이어리 · 바인더엔 안 꽂아요)
            return [back.join(''), front.join('')];
        }
        function dyDeco() {                                                    // js/page.js refreshLayout 끝에서 불러요
            const page = document.getElementById('innerPage'), cv = document.getElementById('canvasArea'), book = document.getElementById('diaryBook'), wr = document.getElementById('diaryWrapper');
            if (!page || !cv || !book) return;
            const t = dyNow(), mode = dyMode();
            book.classList.add('dy-sp'); book.classList.toggle('dy-one', mode !== 'spread');
            book.style.setProperty('--dy-w', book.clientWidth + 'px');
            if (mode !== 'swipe') dyViewSet(mode === 'right' ? 'r' : 'l');
            if (wr) wr.style.marginLeft = mode === 'spread' && isCoverOpen ? book.clientWidth + 'px' : '';   // 💻 펼침면을 화면 가운데로
            let bk = document.getElementById('dyBack'), fr = document.getElementById('dyFront');
            if (!bk) { bk = document.createElement('div'); bk.id = 'dyBack'; bk.className = 'dy-deco'; bk.setAttribute('aria-hidden', 'true'); page.prepend(bk); }
            if (!fr) { fr = document.createElement('div'); fr.id = 'dyFront'; fr.className = 'dy-deco'; fr.setAttribute('aria-hidden', 'true'); page.appendChild(fr); }
            const dk = t.id + '|' + (t.k === '노트' ? clipId() : ''); if (bk.dataset.k !== dk) { const [b, f] = dyParts(t); bk.innerHTML = b; fr.innerHTML = f; bk.dataset.k = fr.dataset.k = dk; }
            [bk, fr].forEach(el => Object.assign(el.style, { left: cv.offsetLeft + 'px', top: cv.offsetTop + 'px', width: cv.offsetWidth + 'px', height: cv.offsetHeight + 'px' }));
            page.dataset.dy = t.b; page.style.setProperty('--dy-c', t.id === DY_DEF ? 'var(--border-color)' : t.c);   // 📔 기본 다이어리 테두리는 고른 페이지 색을 따라가요 (10-18)
            page.classList.add('dy-noholes');                                  // 펼침면은 링 구멍 대신 가운데 묶음 (링 · 밴드 · 실)
            if (typeof skinBookSync === 'function') skinBookSync();            // 📔 페이지 색은 기본 다이어리에만 (js/settings.js)
            dkCoverPaint();
            clipPlace();
        }
        /* 📕 표지 꾸미기 (표꾸 · 도련 10-18) : 노트 · 바인더만 (기본 다이어리 표지는 못 꾸며요 · 다이어리를 살 이유)
           - 표지 = 0장 (dkDate(0) · 키 dkp_<권 id>_0 · 권 폴더 표지.json) → 속지처럼 스티커 메뉴로 그대로 꾸며요
           - 표꾸 화면 : 로그인 때 겉표지처럼 접힌 앞표지 한 쪽 (펼친 면의 오른쪽 쪽 자리) · 다음 장으로 넘기면 1장이에요
           - 닫힌 겉표지 : 그 다이어리 색 + 앞표지(오른쪽 쪽)에 붙인 것 (#cvDeco · 눌러도 그대로 열려요) */
        function dkCoverEdit() {
            closeModal('skinModal');
            if (!dkType()) { showMsg('📕 기본 다이어리 표지는 꾸밀 수 없어요.<br><span style="font-size:12px;color:#777;">노트 · 바인더는 표지에 스티커를 붙여 꾸밀 수 있어요.</span>'); return; }
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
            const cv = document.getElementById('coverPage'), t = dkType(); if (!cv) return;
            cv.classList.toggle('cv-book', !!t);
            let box = document.getElementById('cvDeco');
            if (!t) { if (box) box.remove(); return; }
            cv.style.setProperty('--dy-c', t.c);
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
           - 첫 장을 저장할 때 드라이브에 권 폴더가 생겨요 (고르기만 하면 안 생겨요) · 장을 처음 꾸민 날을 다이어리.json days 에 (고쳐도 안 바뀜 · 다 지우면 빠짐)
           - 열면 : 켜고 끄기와 상관없이 마지막으로 꾸민 장 (없으면 1장)
           - 위 바 가운데 : 페이지 수가 기본 · 누르면 그 장을 처음 꾸민 날 (빈 장은 '새 장') ↔ 다시 누르면 페이지 수 (이 기기 · malang_bkview)
           - 📅 달력 : 꾸민 날만 누를 수 있고 나머지는 회색 · 누르면 그날 처음 꾸민 장 · 여러 장이면 작은 숫자 (js/month.js)
           - 🔍 검색 : 이 다이어리 장들에서 찾아요 (js/search.js)
           - 마지막 장에서 더 넘기면 "기본 다이어리로 넘어갈까요?" */
        const DK_KEY = 'diary_books', DK_LOCAL = 'malang_books', DK_VIEW = 'malang_bkview', DK_PAGES = 30, DK_Y = 2000;
        const dkType = () => { const t = dyNow(); return t.id === DY_DEF ? null : t; };
        function dkId(make) {                                                  // 지금 고른 규격의 권 id (make : 없으면 새로)
            const t = dkType(); if (!t) return null;
            const m = prefGet(DK_KEY, DK_LOCAL), o = m && typeof m === 'object' ? Object.assign({}, m) : {};
            if (o[t.id] || !make) return o[t.id] || null;
            o[t.id] = dkInfo({}).id;
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
            const m = prefGet(DK_KEY, DK_LOCAL) || {}, t = DY_TYPES.concat(typeof dmkAll === 'function' ? dmkAll() : []).find(x => m[x.id] === id) || dkType() || {};
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
        const dkView = () => { try { return localStorage.getItem(DK_VIEW) === 'date' ? 'date' : 'page'; } catch (e) { return 'page'; } };
        function dkLabel(date) {                                               // 위 바 가운데 글 (js/page.js formatDate)
            if (!dkIs(date) || !dkType()) return '';
            const o = dkNow(), n = dkNo(date);
            if (!n) return '📕 표지 꾸미기';
            if (dkView() === 'date') return o.days[n] ? formatDate(dkDayOf(o.days[n])) : '새 장';
            return `${n} / ${o.pages} 페이지`;
        }
        function dkTap() {                                                     // 위 바 가운데를 누르면 : 유한은 페이지 수 ↔ 날짜 · 기본은 한 달 모아보기
            if (!dkType()) { if (window.openMonth) openMonth(); return; }
            try { localStorage.setItem(DK_VIEW, dkView() === 'date' ? 'page' : 'date'); } catch (e) {}
            document.getElementById('pageDateDisplay').innerText = formatDate(currentDate);
        }
        function dkPath(date) {                                                // 💾 저장 알림에 보여 줄 자리
            if (!dkIs(date) || !dkType()) return '';
            const id = dkId(true), o = dkInfoOf(id), b = drive.books && drive.books.get(id);
            return `다꾸/${b ? b.kind : o.kind}/${b ? b.name : dkFolderName(o.design, o.spec)}/${dkNo(date) ? dkNo(date) + '페이지' : '표지'}.json`;
        }
        function dkCv() { return !!dkType() && typeof isCoverOpen !== 'undefined' && isCoverOpen && dkIs(currentDate) && dkNo(currentDate) === 0; }   // 📕 지금 표지를 꾸미는 중
        function dkCvSync() { const ip = document.getElementById('innerPage'), cv = dkCv(); if (ip && ip.classList.contains('dk-cover') !== cv) { ip.classList.toggle('dk-cover', cv); dyDeco(); } const b = document.getElementById('diaryBook'); if (b) b.classList.toggle('dk-cv', cv); }   // 📕 표꾸 중 : 접힌 겉표지 모양 (앞표지 한 쪽)
        /* 고른 다이어리와 지금 펼친 날짜가 맞는지 (유한인데 진짜 날짜 · 기본인데 장 날짜 · 페이지 수를 넘음) → 맞는 곳으로 */
        function dkSync(load) {
            const bk = !!dkType(), on = dkIs(currentDate);
            if (bk !== on || (bk && dkNo(currentDate) > dkNow().pages)) {
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
            if (dir < 0 || !dkType() || !dkIs(currentDate) || dkNo(currentDate) < dkNow().pages || performance.now() - dkEndAt < 2500) return;
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
        let dfList = null, dfGen = -1, dfLoading = null;
        const dfOn = () => prefGet(DF_KEY, DF_LOCAL) === 'on';
        function dfSet(on) { prefSet(DF_KEY, DF_LOCAL, on ? 'on' : 'off'); dfRender(); if (on) dfFix(); }
        function dfRender() { const s = document.getElementById('dyFillSw'); if (s) s.checked = dfOn(); }
        function dfLoad() {
            if (dfGen !== drive.gen) { dfList = null; dfGen = drive.gen; }
            if (dfList || dfLoading || !dfOn() || drive.guest || !drive.ready) return dfLoading;
            const gen = drive.gen;
            dfLoading = driveEnumerateAll().then(a => { if (gen === drive.gen) dfList = new Set(a.map(f => f.key)); }).catch(() => {}).finally(() => { dfLoading = null; });
            return dfLoading;
        }
        function dfHas(k) {                                                    // 읽었거나 고친 날은 지금 내용으로 · 아니면 드라이브 목록으로
            if (drive.guest || drive.loadedDays.has(k) || drive.dirtyKeys.has(k)) return store.getItem(k) !== null;
            return !!(dfList && dfList.has(k));
        }
        /* 넘길 날 : 꺼져 있으면 하루 앞 · 뒤 / 켜져 있으면 꾸민 날 중 가장 가까운 날 (없으면 null = 안 넘어가요) */
        function dyStep(date, dir) {
            if (dkType() && dkIs(date)) {                                      // 📕 유한 : 1장 ~ 마지막 장
                const o = dkNow(), n = dkNo(date), f = dkFilled(o);
                if (!dfOn()) { const to = n + dir; return to >= 1 && to <= o.pages ? dkDate(to) : null; }
                const nx = (f.length ? f[f.length - 1] : 0) + 1, list = f.concat(nx <= o.pages ? [nx] : []).filter(x => dir > 0 ? x > n : x < n);
                return list.length ? dkDate(dir > 0 ? list[0] : list[list.length - 1]) : null;
            }
            if (!dfOn()) return addDays(date, dir);
            dfLoad();
            if (!dfList && !drive.guest) return addDays(date, dir);           // 목록을 받기 전에는 하루씩
            const cur = getDateKey(date), list = dfDays().filter(k => dir > 0 ? k > cur : k < cur);
            return list.length ? dfDate(dir > 0 ? list[0] : list[list.length - 1]) : null;
        }
        function dfDays() {                                                    // 꾸민 날 (오래된 날부터)
            const keys = new Set(dfList || []);
            store.keys().forEach(k => { if (DAY_KEY_RE.test(k)) keys.add(k); });
            return [...keys].filter(dfHas).sort();
        }
        const dfDate = k => { const p = parseDayKey(k); return new Date(p.y, p.m - 1, p.d); };
        /* 다이어리를 열 때 갈 날 : 켜져 있으면 마지막으로 꾸민 날 (목록을 아직 못 받았거나 하나도 없으면 null = 그대로) */
        function dyOpenDate() {
            if (dkType()) { const f = dkFilled(dkNow()); return dkDate(f.length ? f[f.length - 1] : 1); }   // 📕 유한 : 마지막으로 꾸민 장
            if (!dfOn()) return null;
            dfLoad();
            if (!dfList && !drive.guest) return null;
            const d = dfDays(); return d.length ? dfDate(d[d.length - 1]) : null;
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
        function dyThumb(t, sk) {                                              // sk : 기본다이어리 4색 (테두리 · 속지 색)
            const H = 56, W = Math.round(H / t.r * 2);                             // 모두 펼친 두 쪽 그대로 (실제 비율)
            return `<span class="dy-th" data-b="${t.b}" style="--dy-c:${sk ? sk.border : t.c};${sk ? `--dy-p:${sk.page};` : ''}width:${W}px;height:${H}px"><i></i><i></i></span>`;
        }
        /* 다이어리 창의 📔 기본다이어리 · 📓 노트 · 🗂 바인더 버튼 (도련 10-18 · 스티커 창처럼 종류 버튼 → 칸 기본 · 내가만든 · 공유받은 · 이벤트 · 문구점)
           기본다이어리 = 칸 없이 4색만 (js/app.js skinPresets · 고르면 기본 다이어리로 바꾸고 그 색 · id 'basic:색')
           노트 · 바인더 = 기본 칸 없음 · 내가만든 (➕ 만들기 + 만든 것 · js/dymaker.js · 10-18 확정) · 공유받은 · 이벤트 · 문구점은 든 게 생기면
           규격 6종은 DY_TYPES 에 그대로 (나중에 문구점 바탕) */
        const DY_ICON = { '다이어리': '📔', '노트': '📓', '바인더': '🗂️' }, DY_NAME = { '다이어리': '기본다이어리' };
        const DY_COLORS = [['pink', '분홍'], ['mint', '녹색'], ['purple', '보라'], ['yellow', '노랑']];
        let dyKind = '다이어리', dyTab = 'free';
        const dyItems = (kind, tab) => tab === 'clip' ? ['noclip'].concat(CLIPS.map(c => ({ clip: c }))) : kind === '다이어리' ? DY_COLORS : tab === 'mine' ? ['new'].concat(typeof dmkAll === 'function' ? dmkAll().filter(t => t.k === kind) : []) : tab === 'shop' ? DY_TYPES.filter(t => t.k === kind) : [];   // 📓 내가만든 = ➕ 만들기 + 만든 것 (js/dymaker.js) · 규격 6종은 나중에 문구점 바탕
        const dyHide = (kind, v) => kind === '다이어리' || v === 'free';
        function dyOpen(kind) {
            dyKind = DY_TAB.includes(kind) ? kind : dyNow().k;
            document.getElementById('dyTitle').textContent = DY_ICON[dyKind] + ' ' + (DY_NAME[dyKind] || dyKind);
            const bar = document.getElementById('dyTabs');
            const tabs = stkTabsOn(null, 'dy').filter(([v]) => !dyHide(dyKind, v)).concat(dyKind === '노트' ? [['clip', '📎 기본집게']] : []);   // 📓 노트 창 맨 뒤 = 노트용 기본집게 칸 (나중에 키링 같은 꾸미기 문구류도)                          // 칸에 든 게 생기면 has 로 보여 주기 (지금은 공유받은 · 이벤트 · 문구점이 다 비어 있어요)
            bar.innerHTML = tabs.map(([v, n]) => `<button type="button" class="stk-tab" data-g="${v}" onclick="dyTabSet('${v}')">${n}</button>`).join('');   // 🆓 이벤트 · 문구점은 든 게 있을 때만 (js/stickermaker.js STK_HIDE)
            bar.hidden = bar.children.length < 2;
            dyTabSet(tabs.length ? tabs[0][0] : '');
            openModal('dyModal');
        }
        function dyTabSet(g) {
            dyTab = g;
            document.querySelectorAll('#dyTabs .stk-tab').forEach(b => b.classList.toggle('on', b.dataset.g === g));
            const list = dyItems(dyKind, g), base = DY_TYPES.find(t => t.id === DY_DEF), empty = { mine: `아직 만든 ${dyKind}가 없어요.<br>나중에 다이어리 만들기에서 만든 ${dyKind}가 여기에 들어와요.`, share: `아직 공유받은 ${dyKind}가 없어요.`, event: `아직 받은 이벤트 ${dyKind}가 없어요.`, shop: `문구점에서 산 ${dyKind}가 여기에 들어와요.` }[g] || `아직 가진 ${dyKind}가 없어요.<br>나중에 문구점에서 산 ${dyKind}가 여기에 들어와요.`;
            const cell = it => it === 'noclip'
                ? `<button type="button" class="dy-it" data-id="clip:" onclick="clipPick('')"><span class="dy-stage"><span class="dy-clipth none">🚫</span></span><span class="dy-n">안 써요</span><small>집게 빼기</small></button>`
                : it && it.clip
                ? `<button type="button" class="dy-it" data-id="clip:${it.clip[0]}" onclick="clipPick('${it.clip[0]}')"><span class="dy-stage"><span class="dy-clipth">${clipSvg(it.clip[2])}</span></span><span class="dy-n">${it.clip[1]}</span><small>기본집게</small></button>`
                : it === 'new'
                ? `<button type="button" class="dy-it dy-new" onclick="dmkOpen('${dyKind}')"><span class="dy-stage"><b>＋</b></span><span class="dy-n">${dyKind === '바인더' ? '🧩 바인더 조립' : '새 ' + dyKind + ' 만들기'}</span><small>${dyKind === '바인더' ? '표지 만들기 · 내지 만들기 · 끼우기' : '크기 · 표지 · 내지 · 페이지 수'}</small></button>`
                : it.my
                ? `<button type="button" class="dy-it" data-id="${it.id}" onclick="dySet('${it.id}')"><span class="dy-stage">${dyThumb(it)}</span><span class="dy-n">${dmkEsc(it.g)}</span><small>${it.n} · ${it.pg}페이지</small><span class="dy-ed" role="button" tabindex="0" title="고치기" onclick="event.stopPropagation(); dmkOpen('${dyKind}', '${it.id}')">✏️</span></button>`
                : Array.isArray(it)
                ? `<button type="button" class="dy-it" data-id="${DY_DEF}:${it[0]}" onclick="dyPickColor('${it[0]}')"><span class="dy-stage">${dyThumb(base, skinPresets[it[0]])}</span><span class="dy-n">${it[1]}</span><small>${base.mm}</small></button>`
                : `<button type="button" class="dy-it" data-id="${it.id}" onclick="dySet('${it.id}')"><span class="dy-stage">${dyThumb(it)}</span><span class="dy-n">${it.g}</span><small>${it.g === it.n ? '' : it.n + ' · '}${it.mm}</small></button>`;
            document.getElementById('dyPickList').innerHTML = list.length ? `<div class="dy-row">${list.map(cell).join('')}</div>` : `<div class="cs-empty">${empty}</div>`;
            const ps = document.querySelector('#dyModal .dy-pick-s'); if (ps) ps.textContent = g === 'clip' ? '📎 노트용 꾸미기 집게 · 왼쪽 쪽 위 종이 끝을 물어요' : '펼친 두 쪽이 한 장 (기본 다이어리는 하루) · 실제 비율 그대로';
            dyRender();
            if (g === 'mine' && dyKind !== '다이어리' && typeof dmkSync === 'function') dmkSync(dyKind);   // 드라이브의 내노트 · 내바인더 목록과 맞추기
        }
        function dyPickColor(c) {                                              // 기본다이어리 4색 : 기본 다이어리로 바꾸고 그 색 (js/settings.js applySkinPreset)
            if (dyNow().id !== DY_DEF) dySet(DY_DEF);
            applySkinPreset(c);
            dyRender();
        }
        function dyClose() { closeModal('dyModal'); }
        function dyRender() { const t = dyNow(), id = t.id === DY_DEF ? DY_DEF + ':' + currentSkinId : t.id, cid = 'clip:' + clipId(); document.querySelectorAll('#dyModal .dy-it').forEach(b => b.classList.toggle('on', b.dataset.id === id || b.dataset.id === cid)); }
        window.dySize = dySize; window.dyDeco = dyDeco; window.dyHalf = dyHalf; window.dyEdgeRect = dyEdgeRect; window.dyViewSet = dyViewSet; window.dyUnderR = dyUnderR; window.dyTabSet = dyTabSet; window.dyPickColor = dyPickColor; window.clipPick = clipPick; window.clipDown = clipDown; window.clipPlace = clipPlace; window.dvSet = dvSet; window.dvRender = dvRender; window.dyLoad = dyLoad; window.dyOpen = dyOpen; window.dyClose = dyClose; window.dySet = dySet; window.dfSet = dfSet; window.dfRender = dfRender; window.dyStep = dyStep; window.dfLoad = dfLoad; window.dyOpenDate = dyOpenDate; window.dfFix = dfFix; window.dkFolderName = dkFolderName; window.dkInfo = dkInfo;
        window.dkType = dkType; window.dkId = dkId; window.dkCoverEdit = dkCoverEdit; window.dkUnfold = dkUnfold; window.dkRefold = dkRefold; window.dkCoverPaint = dkCoverPaint; window.dkKey = dkKey; window.dkIs = dkIs; window.dkNo = dkNo; window.dkDate = dkDate; window.dkNow = dkNow; window.dkFilled = dkFilled; window.dkDayOf = dkDayOf;
        window.dkMark = dkMark; window.dkReal = dkReal; window.dkLabel = dkLabel; window.dkTap = dkTap; window.dkPath = dkPath; window.dkSync = dkSync; window.dkEnd = dkEnd; window.dkInfoOf = dkInfoOf; window.dkInfoMerge = dkInfoMerge;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['skins'] = true;
