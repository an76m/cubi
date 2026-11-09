/* 말랑달콤 다이어리 - js/pattern-recipe.js
   🧾 사용자가 만든 배경지의 "레시피" (다이어리 · 배경지 등록 도구 공용)
   - 사용자가 만든 배경지는 CSS 코드가 아니라 짧은 설정값(레시피)으로 저장·전송해요.
       무늬 메이커 : {"v":2,"kind":"mk","bg":"#fff6f9","L":[{"p":"dot","c":"#f9cfdd","s":40,"w":100,"r":0,"o":1}],"im":{…}} (js/maker.js MK · 상품공방 배경지 레시피와 같은 모양)
       그려서     : {"v":1,"kind":"tile","src":"data:image/png;base64,...","w":80,"h":80,"bg":"#ffffff","from":"draw"}
                     (등록된 배경지는 이미지를 patterns 폴더 파일로 떼어 내서 "src":"patterns/12.webp" 처럼 저장)
   - 다이어리는 레시피를 받을 때마다 sanitizeRecipe()로 검사한 뒤 recipeToCss()로 그려요.
     정해진 항목만 통과하므로 이상한 코드가 들어와도 화면을 망가뜨릴 수 없어요.
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → patterns → pattern-recipe → skins → pattern-maker → service */

        const RECIPE_KINDS = ['mk', 'tile'];   // mk = 🧵 무늬 메이커 (js/maker.js · 상품공방과 같은 엔진 · 도련 11-05) · tile = 🖌 그려서 만든 한 칸
        const RECIPE_MAX_SRC = Infinity;       // 이미지 배경지 한 칸 용량 제한 없음
        const RECIPE_MAX_LEN = Infinity;       // 레시피 전체 용량 제한 없음
        const RECIPE_LIMITS = { tileW: [8, 600], tileH: [8, 1200] };

        function recipeNum(v, lim, def) {
            const n = parseFloat(v);
            if (isNaN(n)) return def;
            return Math.max(lim[0], Math.min(lim[1], Math.round(n * 100) / 100));
        }
        function recipeColor(v, def) {
            return (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) ? v.toLowerCase() : def;
        }

        /* 레시피 검사 : 알려진 항목만 골라 범위 안으로 맞춰서 돌려줌 (문제 있으면 null) */
        function sanitizeRecipe(input) {
            let r = input;
            if (typeof r === 'string') {
                if (r.length > RECIPE_MAX_LEN) return null;
                try { r = JSON.parse(r); } catch (e) { return null; }
            }
            if (!r || typeof r !== 'object' || Array.isArray(r)) return null;
            const kind = RECIPE_KINDS.includes(r.kind) ? r.kind : null;
            if (!kind) return null;
            const L = RECIPE_LIMITS;
            if (kind === 'tile') {
                const src = typeof r.src === 'string' ? r.src : '';
                const isData = src.length <= RECIPE_MAX_SRC && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(src);
                const isFile = /^patterns\/[A-Za-z0-9_-]{1,40}\.(png|webp|jpg)$/.test(src);      // 등록된 배경지의 이미지 파일
                if (!isData && !isFile) return null;
                return {
                    v: 1, kind, src,
                    w: recipeNum(r.w, L.tileW, 80), h: recipeNum(r.h, L.tileH, 80),
                    bg: recipeColor(r.bg, '#ffffff'),
                    from: 'draw'
                };
            }
            const m = window.MK ? MK.clean('tile', r) : null;                   // 🧵 무늬 메이커 (js/maker.js)
            return m && (m.L.length || m.im) ? Object.assign({ v: 2, kind }, m) : null;
        }

        /* 레시피 → 배경 CSS 값 (backgroundColor / backgroundImage / backgroundSize) */
        function recipeToCss(input) {
            const r = sanitizeRecipe(input);
            if (!r) return null;
            if (r.kind === 'tile') return { backgroundColor: r.bg, backgroundImage: `url("${r.src}")`, backgroundSize: `${r.w}px ${r.h}px` };
            return MK.css(r);
        }

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['pattern-recipe'] = true;
