/* 말랑달콤 다이어리 - js/craft.js
   🎨 다꾸 작업실 (도련 11-02 · 다꾸러용 상품공방) : 만드는 기능을 한 장소에 · 창이 뜨는 게 아니라 작업실로 들어가요 (스티커 정리 · 오늘 쓸 스티커처럼 화면 전체)
   - 들어오기 : 책상 오른쪽 위 메뉴 ✂️ 스티커 만들기 · 예전 ✂️ 스티커만들기 · 🖌️ 배경지 만들기 창을 여는 곳은 모두 여기로 (js/settings.js openModal)   (카페 · 이동 창 칸은 없어요 · 도련 11-02)
   - 왼쪽 = 무엇을 만들까요 (CRAFT_KINDS) · 가운데 = 새로 만들기 (그 종류에서 쓸 수 있는 방법만) · 오른쪽 = 📐 내 도안 (도련 11-09 · 만들면 저절로 생기는 원본 · 📄 한 장 더 찍기 · js/own.js ownDesigns) · 고르면 가운데에 📌 꺼내 쓰기 · 🧺 · 🗑 버리기 (✕ = 다시 방법)
       ＋ 새로 만들기 카드는 📱 폰에서만 (💻 📲 은 가운데 칸이 늘 보여요 · 도련 11-02)
       📱 폰 = 위 종류 칩 · 가운데 내가 만든 것 · 오른쪽 칸은 아래에서 올라와요
   - 만드는 화면은 지금 것을 그대로 열어요 (📸 포토부스 · 📷 사진 · 🖼️ 앨범 · 🔤 글씨 · 🎀 테이프 · 📃 속지 · 🧻 떡메 · 🧵 🖼 🖌 배경지) → 작업실은 뒤에 그대로 · 다 만들면 가운데가 저절로 새로
   - 🧩 새 종류 · 새 방법 = CRAFT_KINDS · CRAFT_WAYS 한 줄 (ft = 기능 공개 스위치 · js/features.js)
   - 닫기 없음 = 오른쪽 위 '이동' (💻 📲 책상) · 📱 '나가기' · Esc */
    (function () {
        /* 만드는 방법 : [아이콘, 이름, 설명, 여는 일(종류), 기능 스위치] */
        const smGo = (k, fn) => { if (window.smPickKind) { smPickKind(k); closeModal('stickerSrcModal'); } if (window[fn]) window[fn](); };   // 📷 · 🖼️ = 그 종류로 정해 두고 바로
        const CRAFT_WAYS = {
            booth: ['📸', '포토부스', '네컷 · 2×2 · 한 컷 · 필터 · 글씨 · 반짝이', () => window.openBooth && openBooth(), 'stkmake'],
            cam: ['📷', '사진 찍어 만들기', '📷 말랑 디카로 찍거나 골라 모양대로 (하트 · 별 … · ✂️ 손으로)', k => window.openDigicam ? openDigicam({ kind: k, el: window.dcActEl && dcActEl('camera') }) : smGo(k, 'smOpenCam'), 'stkmake'],   // 📷 js/digicam.js (도련 11-08)
            album: ['🖼️', '앨범에서 골라 만들기', '🖨️ 스티커 프린터 · 한 장 · 여러 장 · 모양 고르기 · 늘 씰', k => window.openStickerPrinter ? openStickerPrinter({ kind: k, el: window.dcActEl && dcActEl('print') }) : smGo(k, 'smOpenFile'), 'stkmake'],   // 🖨️ js/stickerprinter.js (도련 11-08)
            sheet: ['🗂️', '시트 꾸미기', '그림 여러 개를 한 장에 · 끌어서 자리 · 기본 씰처럼', () => window.openSheetMaker && openSheetMaker(), 'stkmake'],   // 🗂️ js/sheetmaker.js (도련 11-06)
            text: ['🔤', '글씨 스티커', '🏷️ 라벨 기계 자판으로 쓰기', () => window.openLabeler ? openLabeler(window.dcLabelerEl && dcLabelerEl()) : window.smOpenText && smOpenText(), 'stkmake'],   // 🏷️ 라벨 스티커 기계 (js/labeler.js · 도련 11-08) · 책상에 있으면 거기서 떠올라요
            tape: ['🎀', '마스킹테이프 만들기', '✏️ 한 칸을 그리면 쭉 이어져요 · 🖼️ 내 사진으로', () => window.openTapeMaker && openTapeMaker(), 'stkmake'],
            leaf: ['📃', '속지 만들기', '🖼️ 사진 불러오기 · ✏️ 종이 색 · 밑줄 위에 그리기', async () => { if (await diaryReady() && window.openLeafMaker) openLeafMaker(); }, 'stkmake'],      // 📔 속지 · 떡메 = 다이어리 쪽 크기로 만들어서 먼저 펴 둬요 (작업실 뒤에서)
            memo: ['📝', '메모지 만들기', '🧵 종이 색 · 줄 · 무늬 · 테두리 · ✏️ 그리기 · 🖼️ 사진', async () => { if (await diaryReady() && window.openMemoMaker) openMemoMaker(); }, 'stkmake'],
            tk: ['🧻', '떡메모지 만들기', '🖼️ 사진 · ✏️ 그리기 · 🩷 풀칠 띠 색', async () => { if (await diaryReady() && window.openTteokMaker) openTteokMaker(); }, 'stkmake'],
            weave: ['🧵', '무늬 메이커', '무늬 15가지 · 두 겹 겹치기 · 기울기 · 내 사진 반복', () => window.openMaker && openMaker('weave'), 'patmake'],
            pdraw: ['🖌', '그려서 배경지', '한 칸을 그리면 이어 붙인 모습이 바로', () => window.openMaker && openMaker('draw'), 'patdraw']
        };
        /* 종류 : g = 묶음 제목 · own = 🎒 내 것 종류 (가운데 '내가 만든 것') · to = 저장되는 곳 · soon = 아직 */
        const CRAFT_KINDS = [
            { g: '스티커', k: 'seal', ic: '🏷️', n: '씰스티커', own: 'seal', ways: ['sheet', 'booth', 'cam', 'album', 'text'],   // 🗂️ 시트 꾸미기 맨 앞 · 🔤 글씨 스티커 = 씰스티커로 저장돼서 여기 (도련 11-06 · js/stickermaker.js smDoFinish)
            to: '🗄️ 서랍 · 🏷️ 씰' },
            { k: 'piece', ic: '🧩', n: '조각스티커', own: 'piece', ways: ['booth', 'cam'], to: '🗄️ 서랍 · 🧩 조각 봉투' },
            { k: 'paper', ic: '📄', n: '모조지스티커', own: 'paper', ways: ['booth', 'cam'], to: '🗄️ 서랍 · 📄 모조지 (가위로 오려 써요)' },
            { g: '종이', k: 'leaf', ic: '📃', n: '속지', own: 'leaf', ways: ['leaf'], to: '🗄️ 서랍 · 📃 속지' },
            { k: 'tk', ic: '🧻', n: '떡메모지', own: 'tk', ways: ['tk'], to: '🗄️ 서랍 · 🧻 떡메 한 묶음' },
            { k: 'memo', ic: '📝', n: '메모지', own: 'memo', ways: ['memo'], to: '🗄️ 서랍 · 📝 메모지 한 묶음' },
            { g: '꾸미기', k: 'tape', ic: '🎀', n: '마스킹테이프', own: 'tape', ways: ['tape'], to: '🗄️ 서랍 · 🎀 한 롤' },
            { k: 'bg', ic: '🌈', n: '배경지', ways: ['weave', 'pdraw'], to: '🌈 배경지 창 · 내가만든 칸', ft: 'pattern' }
        ];
        const C = { on: false, k: 'seal', sel: null, mine: [], loading: false, sheet: false, off: null };
        const cq = id => document.getElementById(id);
        const ftOk = f => !f || !window.ftOn || f.split(' ').every(x => ftOn(x));
        const kinds = () => CRAFT_KINDS.filter(K => ftOk(K.ft));
        const kindOf = k => CRAFT_KINDS.find(K => K.k === k) || kinds()[0];
        const waysOf = K => K.ways.filter(w => CRAFT_WAYS[w] && ftOk(CRAFT_WAYS[w][4]));
        const narrow = () => innerWidth < 760;
        const desk = () => document.documentElement.classList.contains('desk-on');

        function build() {
            let el = cq('craftRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'craftRoom'; el.className = 'cr8-room';
            el.innerHTML = `<div class="cr8-wall"><div class="cr8-sign">✂️ 스티커 만들기<small>내가 쓸 꾸미기를 직접 만들어요</small></div>
                    <div class="cr8-garland" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
                    <button type="button" class="cr8-go desk-shop-go" id="crGo"></button></div>
                <div class="cr8-mat">
                    <div class="cr8-panel cr8-kinds"><h3>무엇을 만들까요</h3><div class="cr8-klist" id="crKinds"></div></div>
                    <div class="cr8-panel cr8-work" id="crWorkBox"><h3><span id="crWorkT"></span><button type="button" class="cr8-x" id="crSheetX" aria-label="닫기">✕</button></h3><div class="cr8-wk" id="crWork"></div></div>   <!-- 💻 📲 종류 → 새로 만들기 → 내가 만든 것 (도련 11-02 · 흐름대로) -->
                    <div class="cr8-panel cr8-mine"><h3><span id="crMineT"></span><small id="crMineN"></small></h3><div class="cr8-grid" id="crGrid"></div></div>
                </div>`;
            document.body.appendChild(el);
            cq('crGo').onclick = () => closeCraft();   // 🖥 책상 = '닫기' (이동 메뉴 대신 그대로 책상으로 · 도련 11-06)
            cq('crSheetX').onclick = () => { C.sheet = false; C.sel = null; paint(); };   // 📱 아래 칸 닫기 · 💻 고른 것 풀고 만드는 방법으로
            return el;
        }
        /* 📐 내 도안 (도련 11-09 · 만든 스티커의 원본 · 쓰면 안 사라져요) */
        async function loadMine() {
            const K = kindOf(C.k); C.mine = []; if (!K.own || !window.ownDesigns) { paintMine(); return; }
            C.loading = true; paintMine();
            try { C.mine = await ownDesigns(K.own); } catch (e) { console.warn('📐 내 도안', e); }
            C.loading = false; paintMine(); if (C.sel != null) paintWork();
        }
        function paintKinds() {
            cq('crKinds').innerHTML = kinds().map(K => `${K.g ? `<div class="cr8-g">${K.g}</div>` : ''}<button type="button" class="cr8-k${K.k === C.k ? ' on' : ''}" data-k="${K.k}"><span>${K.ic} ${K.n}</span>${K.soon ? '<em>곧</em>' : ''}</button>`).join('');
            cq('crKinds').querySelectorAll('[data-k]').forEach(b => b.onclick = () => { C.k = b.dataset.k; C.sel = null; C.sheet = false; paint(); loadMine(); });
        }
        function paintMine() {
            const K = kindOf(C.k), g = cq('crGrid'); if (!g) return;
            cq('crMineT').textContent = K.own ? '📐 내 도안' : `${K.ic} 내가 만든 ${K.n}`;
            cq('crMineN').textContent = K.own && !C.loading ? `${C.mine.length}개` : '';
            const nw = `<button type="button" class="cr8-card cr8-new" data-new="1"><i>＋</i>새로 만들기</button>`;
            let body;
            if (K.soon) body = `<div class="cr8-empty">🚧 ${K.n} 만들기는 곧 생겨요</div>`;
            else if (!K.own) body = `<div class="cr8-empty">만든 ${K.n}은 <b>🌈 배경지</b> 창의 <b>내가만든</b> 칸에 있어요<br><button type="button" class="cr8-b" id="crBgList">🌈 내 배경지 보기</button></div>`;
            else if (C.loading) body = '<div class="cr8-empty">꺼내는 중…</div>';
            else body = C.mine.length ? C.mine.map((e, i) => `<button type="button" class="cr8-card${C.sel === i ? ' on' : ''}" data-i="${i}">${e.th ? `<img src="${htmlEsc(e.th)}" alt="">` : `<span class="cr8-ph">${K.ic}</span>`}<b>${htmlEsc((e.x && e.x.nm) || K.n)}</b></button>`).join('')
                : `<div class="cr8-empty">아직 ${K.n} 도안이 없어요<br>${narrow() ? '＋ 새로 만들기' : '← 새로 만들기'}로 만들면 도안이 저절로 생겨요</div>`;
            g.innerHTML = (K.soon ? '' : nw) + body;
            g.querySelectorAll('.cr8-card').forEach(c => c.onclick = () => { C.sel = c.dataset.new ? null : +c.dataset.i; C.sheet = true; paintMine(); paintWork(); });
            if (cq('crBgList')) cq('crBgList').onclick = () => { closeCraft(); if (window.openPatternList) openPatternList('mine'); else if (window.openModal) openModal('patternModal'); };
        }
        function paintWork() {
            const K = kindOf(C.k), w = cq('crWork'), box = cq('crWorkBox'); if (!w) return;
            box.classList.toggle('sheet', C.sheet);
            const e = C.sel != null ? C.mine[C.sel] : null;
            box.classList.toggle('detail', !!e);
            if (e) {                                                              // 📐 도안 하나
                const nm = (e.x && e.x.nm) || K.n;
                cq('crWorkT').textContent = `📐 ${nm} 도안`;
                w.innerHTML = `<div class="cr8-pv">${e.th ? `<img src="${htmlEsc(e.th)}" alt="">` : K.ic}</div>
                    <button type="button" class="cr8-b main" id="crPrint">📄 한 장 더 찍기</button>
                    <button type="button" class="cr8-b" id="crBasket">🗄️ 서랍에서 보기</button>
                    <button type="button" class="cr8-b cr8-del" id="crDel">🗑 도안 버리기</button>
                    <p class="cr8-hint">도안은 써도 안 사라져요 · 찍은 종이는 ${K.to}</p>`;
                cq('crPrint').onclick = async ev => {
                    const b = ev.currentTarget; if (b.disabled) return; b.disabled = true; b.textContent = '찍는 중…';
                    let sid = null; try { sid = await ownDesignPrint(e.id); } catch (er) { console.warn('📄 한 장 더', er); }
                    b.disabled = false; b.textContent = '📄 한 장 더 찍기';
                    if (!sid) { showMsg('⚠ 찍지 못했어요.<br><span style="font-size:12px;color:#777;">잠시 후 다시 해 주세요.</span>'); return; }
                    if (navigator.vibrate) try { navigator.vibrate(10); } catch (x) {}
                    if (await showAsk(`📄 <b>${htmlEsc(nm)}</b> 한 장을 찍었어요!<br><span style="font-size:12px;color:#777;">🗄️ 서랍에 넣었어요</span>`, '📌 바로 꺼내 쓰기', '닫기')) useMine(sid);
                };
                cq('crBasket').onclick = () => { closeCraft(); if (window.openBasket) openBasket(); };
                cq('crDel').onclick = async () => {
                    if (!await showAsk(`🗑 <b>${htmlEsc(nm)}</b> 도안을 버릴까요?<br><span style="font-size:12px;color:#777;">버리면 다시 찍을 수 없어요 · 서랍의 종이는 그대로예요</span>`, '버리기', '취소')) return;
                    try { await ownDesignDrop(e.id); } catch (er) { console.warn(er); }
                    C.sel = null; C.sheet = false; paintWork(); loadMine();
                };
                return;
            }
            cq('crWorkT').textContent = `${K.ic} 새 ${K.n} 만들기`;
            const ws = waysOf(K);
            w.innerHTML = (ws.length ? ws.map(id => { const [ic, n, d] = CRAFT_WAYS[id]; return `<button type="button" class="cr8-way" data-w="${id}"><i>${ic}</i><span><b>${n}</b><small>${d}</small></span></button>`; }).join('')
                : `<p class="cr8-hint">🚧 ${K.n} 만들기는 곧 생겨요</p>`) + (K.to && ws.length ? `<p class="cr8-hint">만들면 : ${K.to} · 내 드라이브에만 저장돼요</p>` : '');
            w.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { const f = CRAFT_WAYS[b.dataset.w][3]; C.sheet = false; paintWork(); Promise.resolve().then(() => f(K.own || K.k)).catch(er => console.warn('🎨', er)); });
        }
        function paint() { paintKinds(); paintMine(); paintWork(); cq('crGo').textContent = desk() ? '닫기' : '✕ 나가기'; cq('craftRoom').classList.toggle('narrow', narrow()); }
        async function diaryReady() {                                            // 📔 다이어리 펴기 (💻 📲 책상 = js/deskgd.js dkwReady · 📱 표지 열기)
            if (desk() && window.dkwReady) return dkwReady();
            if (typeof isCoverOpen !== 'undefined' && !isCoverOpen && window.openCoverAnimated) { openCoverAnimated(); for (let i = 0; i < 40 && !isCoverOpen; i++) await new Promise(r => setTimeout(r, 80)); }
            return typeof isCoverOpen === 'undefined' || isCoverOpen;
        }
        async function useMine(id) {                                             // 📌 꺼내 쓰기 = 다이어리를 펴고 그 종이를 꺼내요 (🧺 바구니와 같은 일 · js/basket.js bkOpenSheet)
            closeCraft();
            if (!await diaryReady()) return;
            if (window.bkOpenSheet) bkOpenSheet(id);
        }
        function openCraft(k) {
            ['stickerToolModal', 'stickerSrcModal', 'patMakeModal', 'serviceModal', 'moveModal', 'basketModal'].forEach(id => { const m = cq(id); if (m && m.style.display === 'flex' && window.closeModal) closeModal(id); });
            if (window.deskLeave) deskLeave();
            if (typeof k === 'string' && kindOf(k).k === k) C.k = k;
            if (!kinds().some(K => K.k === C.k)) C.k = kinds()[0].k;
            const el = build(); C.on = true; C.sel = null; C.sheet = false;
            el.classList.add('show'); document.body.classList.add('cal-on', 'craft-on');
            paint(); loadMine();
            if (!C.off && window.ownOnChange) C.off = ownOnChange(() => { if (C.on) loadMine(); });   // 다 만들면 가운데가 저절로 새로
        }
        function closeCraft() {
            const el = cq('craftRoom'); if (!el || !C.on) return;
            C.on = false; el.classList.remove('show'); document.body.classList.remove('cal-on', 'craft-on');
        }
        addEventListener('resize', () => { if (C.on) cq('craftRoom').classList.toggle('narrow', narrow()); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && C.on && !document.querySelector('.modal[style*="flex"]')) closeCraft(); });   // Esc = 닫기와 같아요 (도련 11-06)
        window.openCraft = openCraft; window.closeCraft = closeCraft; window.craftOn = () => C.on;
        window.CRAFT_KINDS = CRAFT_KINDS; window.CRAFT_WAYS = CRAFT_WAYS;
    })();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['craft'] = true;
