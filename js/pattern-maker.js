/* 말랑달콤 다이어리 - js/pattern-maker.js
   ✏️ 배경지 만들기 · 📂 내 배경지
   - 🧵 무늬 메이커     : js/maker.js 엔진 (상품공방 배경지 · 벽지와 같은 칸 · 도련 11-05) : 무늬 15가지 · 두 겹 · 칸 크기 · 굵기 · 기울기 · 진하기 · 내 사진 반복(바둑판 · 엇갈림 · 간격)
   - 🖌 그려서 만들기   : ✏️ 그리기 판 (MK.draw) · 한 칸을 그리면 이어 붙인 모습이 바로 보임 (이어그리기로 경계가 자연스럽게 연결)
   - 내 배경지 : 말랑달콤 / 배경지 / 내-목록N (작은 그림 100개씩) · 내-<id> (레시피 하나에 파일 하나) (js/coll.js)
       목록 칸은 작은 그림으로 그리고, 고를 때 원본을 읽어요 · 지금 고른 배경지 원본은 로그인할 때 먼저 읽어요
   - 이름 · 만든 사람은 없어요 (스티커처럼 썸네일만)
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → patterns → pattern-recipe → skins → pattern-maker → service */

        /* =====================================================================
           📂 내 배경지 (저장 · 불러오기 · 삭제)
           ===================================================================== */
        const MY_PATTERN_MAX = Infinity;           // 개수 제한 없음 (끝없이 저장)
        const patColl = () => collOf(dirPath(DIRS.pattern), '내-');   // 말랑달콤 / 배경지 / 내-… (폴더 한 줄 · 10-26)
        let myPatterns = [];                       // 원본을 읽어 온 것만 [{ uid, r }] (지금 고른 것 · 눌러서 고른 것)
        const patView = { mine: null };            // 목록 칸에 보이는 것 : { C, lists, next, items[] }

        /* 원본 읽기 (이미 있으면 바로) : 성공하면 true */
        async function patEnsure(uid) {
            if (myPatterns.some(m => m.uid === uid)) return true;
            let r = null;
            try { r = sanitizeRecipe(await collItem(patColl(), uid)); } catch (e) {}
            if (r) myPatterns.push({ uid, r });
            return !!r;
        }
        /* 로그인할 때 · 다른 기기에서 고른 배경지가 바뀌었을 때 : 지금 고른 배경지 원본 먼저 */
        async function patPrepare() {
            let v = null;
            try { v = JSON.parse(store.getItem(BG_PATTERN_KEY)); } catch (e) {}
            if (v && typeof v.id === 'string' && v.id.startsWith('my:')) await patEnsure(v.id.slice(3));
        }
        if (typeof COLL !== 'undefined') COLL.loginHooks.push(() => { myPatterns = []; patView.mine = null; return patPrepare(); });

        function getMyPatternItems() {
            return myPatterns.map(m => ({ id: 'my:' + m.uid, uid: m.uid, tier: 'my', name: '내 배경지', css: recipeToCss(m.r), recipe: m.r }))
                .filter(p => p.css);
        }
        /* 목록 칸 (🌈 배경지 → 내가만든) : 읽은 묶음까지의 작은 그림들 · more = 아직 안 읽은 묶음이 있어요 */
        function patListItems(tab) {
            const v = patView[tab];
            if (!v) return { items: [], more: true };
            return { items: v.items, more: v.next >= 0 };
        }
        /* 묶음 하나 더 읽기 (처음이면 가장 새 묶음부터) → 다 읽으면 다시 그려요 */
        async function patListMore(tab) {
            const C = patColl();
            let v = patView[tab];
            if (v && v.busy) return;
            if (!v) {
                v = patView[tab] = { C, lists: null, next: 0, items: [], busy: true };
                C.onChange = () => { patView[tab] = null; if (typeof renderPatternList === 'function') renderPatternList(); };
                const live = () => patView[tab] === v && ktShown(document.getElementById('patternModal'));   // 🔁 배경지 창이 열려 있는 동안 받을 때까지 다시
                try { v.lists = await keepTrying(() => collIndex(C), { alive: live }); } catch (e) { v.busy = false; v.next = -1; return; }
                v.next = v.lists.length - 1;
                v.items = C.pend.slice().reverse().map(patCell);
            }
            v.busy = true;
            try {
                while (v.next >= 0) {
                    const L = v.lists[v.next--], arr = await keepTrying(() => collLoad(C, L), { alive: () => patView[tab] === v && ktShown(document.getElementById('patternModal')) });
                    v.items = v.items.concat(arr.slice().reverse().filter(e => !C.gone.has(e.id)).map(patCell).filter(p => p.css));
                    if (arr.length) break;
                }
            } catch (e) { v.next = -1; }
            v.busy = false;
            if (collOnline() && !C.checked) collCheck(C);
        }
        const patCell = e => ({ id: 'my:' + e.id, uid: e.id, tier: 'my', name: '내 배경지', css: recipeToCss(e.th) });
        async function patThumb(r) { return r.kind === 'tile' && /^data:/.test(r.src) ? Object.assign({}, r, { src: await collThumb(r.src) || r.src }) : r; }

        /* 넣기 → uid (이미 있으면 그 uid) · 실패 null */
        async function addMyPattern(r) {
            const clean = sanitizeRecipe(r);
            if (!clean) { showMsg('⚠ 배경지를 저장하지 못했어요.<br>다시 만들어 주세요.'); return null; }
            const h = collHash(JSON.stringify(clean)), C = patColl();
            try {
                const same = (await collAll(C)).find(e => e.x && e.x.h === h);
                if (same) return same.id;                    // 같은 배경지를 두 번 누르면 하나만
                const uid = await collAdd(C, clean, await patThumb(clean), { h });   // 화면은 바로 · 드라이브는 뒤에서
                myPatterns.push({ uid, r: clean });
                patView.mine = null;
                return uid;
            } catch (e) { showMsg('⚠ 배경지를 저장하지 못했어요.<br><span style="font-size:12px;color:#777;">인터넷 연결을 확인한 뒤 다시 해 주세요.</span>'); return null; }
        }

        async function deleteMyPattern(uid) {
            if (!(await showMsg('이 배경지를 지울까요?', true))) return;
            try { await collRemove(patColl(), uid); } catch (e) { showMsg('⚠ 지우지 못했어요. 잠시 뒤 다시 해 주세요.'); return; }
            myPatterns = myPatterns.filter(x => x.uid !== uid);
            patView.mine = null;
            if (bgPattern && bgPattern.id === 'my:' + uid) clearBgPattern();
            renderPatternList();
        }

        /* =====================================================================
           ✏️ 만들기 창 공통
           ===================================================================== */
        let makerMode = 'weave';
        let makerRecipe = null;          // 지금 미리보기 중인 레시피 (이미지·그림은 미리보기용 큰 이미지)

        const MAKER_TITLES = { weave: '🧵 무늬 메이커', draw: '🖌️ 그려서 배경지' };

        function openMaker(mode) {
            makerMode = mode === 'draw' ? 'draw' : 'weave';
            closeModal('skinModal');
            document.getElementById('makerTitle').textContent = MAKER_TITLES[makerMode];
            ['weave', 'draw'].forEach(m => { document.getElementById('maker-' + m).style.display = m === makerMode ? 'block' : 'none'; });
            openModal('makerModal');
            if (makerMode === 'weave') setupWeaveUI();
            if (makerMode === 'draw') { setupDrawUI(); updateDrawPreview(); }
        }

        function backToSkinMenuFromMaker() { closeModal('makerModal'); openModal('patMakeModal'); }   // ← 🖌️ 배경지 만들기 (10-24)

        function showMakerPreview(recipe) {
            makerRecipe = recipe;
            const el = document.getElementById('makerPreview');
            const css = recipe && recipeToCss(recipe);
            paintPatternInto(el, css ? { css } : null);
            document.getElementById('makerPreviewEmpty').style.display = css ? 'none' : 'flex';
        }

        /* 저장용 최종 레시피 (이미지·그림은 용량에 맞게 다시 압축) */
        function finalMakerRecipe() {
            if (makerMode === 'weave') { const r = mkW && sanitizeRecipe(Object.assign({ kind: 'mk' }, mkW)); if (!r) showMsg('🧵 무늬나 그림을 하나 골라 주세요.'); return r; }
            if (makerMode === 'draw') {
                if (!mkD || !mkD.drawn()) { showMsg('🖌 먼저 칸 안에 그림을 그려 주세요.'); return null; }
                const src = encodeTile(mkD.cv, mkD.bg, 2), t = mkD.cv.width / DRAW_SCALE;
                if (!src) { showMsg('⚠ 그림이 너무 복잡해서 저장할 수 없어요.<br>칸 크기를 줄여서 다시 그려 주세요.'); return null; }
                return sanitizeRecipe({ v: 1, kind: 'tile', src, w: t, h: t, bg: mkD.bg, from: 'draw' });
            }
            return null;
        }

        async function makerSave(apply) {
            const r = finalMakerRecipe();
            if (!r) return;
            const uid = await addMyPattern(r);
            if (!uid) return;
            if (apply) selectBgPattern('my:' + uid);
            else showMsg('🌈 배경지 → 내가만든 칸에 저장했어요!');
        }

        /* 이미지·그림 한 칸을 레시피 용량(RECIPE_MAX_SRC) 안에 들어가도록 압축
           PNG(투명 유지) → WEBP(투명 유지) → JPEG(바탕색을 칠해서) 순서로, 안 되면 해상도를 낮춰 다시 시도 */
        function encodeTile(canvas, bg, scale) {
            const tries = [canvas];
            if (scale > 1) {
                const small = document.createElement('canvas');
                small.width = Math.max(1, Math.round(canvas.width / scale));
                small.height = Math.max(1, Math.round(canvas.height / scale));
                small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
                tries.push(small);
            }
            const ok = s => s && s.length <= RECIPE_MAX_SRC;
            for (const c of tries) {
                const png = c.toDataURL('image/png');
                if (ok(png)) return png;
                for (const q of [0.92, 0.85, 0.75, 0.6, 0.45]) {
                    const w = c.toDataURL('image/webp', q);
                    if (w.startsWith('data:image/webp') && ok(w)) return w;
                }
            }
            for (const c of tries) {
                const flat = document.createElement('canvas');
                flat.width = c.width; flat.height = c.height;
                const fx = flat.getContext('2d');
                fx.fillStyle = bg || '#ffffff'; fx.fillRect(0, 0, flat.width, flat.height);
                fx.drawImage(c, 0, 0);
                for (const q of [0.9, 0.8, 0.65, 0.5, 0.4]) {
                    const j = flat.toDataURL('image/jpeg', q);
                    if (ok(j)) return j;
                }
            }
            return null;
        }

        /* =====================================================================
           🧵 무늬 메이커 = js/maker.js 만들기 칸 그대로 (상품공방 배경지와 같아요 · 도련 11-05)
           ===================================================================== */
        let mkW = null;                                                        // 지금 만드는 레시피 (창을 닫았다 열어도 그대로)
        function setupWeaveUI() {
            const host = document.getElementById('mkWeave'); if (!host || !window.MK) return;
            MK.form(host, 'tile', mkW || { bg: '#fff6f9', L: [{ p: 'dot', c: '#f9cfdd', s: 40 }] }, r => { mkW = r; showMakerPreview(sanitizeRecipe(Object.assign({ kind: 'mk' }, r))); }, { imgPx: 400 });
        }

        /* =====================================================================
           🖌 그려서 만들기 = ✏️ 그리기 판 (js/maker.js MK.draw · 상품공방 직접 그리기와 같은 판 · 도련 11-05)
           펜 · 붓 · 지우개 · 선 · 도형 · 도장 · 채우기 · 글씨 · 스포이드 · 이어그리기 · 바탕색 · 칸 크기 · 되돌리기
           ===================================================================== */
        const DRAW_SCALE = 2, DRAW_TILES = [40, 60, 80, 100, 120, 160];
        let mkD = null;                                                  // 그리기 판 (처음 열 때 한 번)
        function setupDrawUI() {
            if (mkD) return;
            mkD = MK.draw(document.getElementById('mkDraw'), { W: 80 * DRAW_SCALE, H: 80 * DRAW_SCALE, wrap: true, bg: '#fff8fb', view: 220,
                sizes: DRAW_TILES.map(t => [t + 'px', t * DRAW_SCALE, t * DRAW_SCALE]), onChange: updateDrawPreview });
        }
        function updateDrawPreview() {
            if (!mkD) return;
            const t = mkD.cv.width / DRAW_SCALE;
            paintPatternInto(document.getElementById('makerPreview'), { css: { backgroundColor: mkD.bg, backgroundImage: `url("${mkD.url()}")`, backgroundSize: `${t}px ${t}px` } });
            document.getElementById('makerPreviewEmpty').style.display = 'none';
        }

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['pattern-maker'] = true;
