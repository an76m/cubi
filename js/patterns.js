/* 말랑달콤 다이어리 - js/patterns.js
   🌈 배경지 목록 = 서버 상품 (🧁 상품공방 '배경지' · 도련 11-02 : 예전에 이 파일에 적어 두던 단색 · 무늬는 기본상품샵/배경지 로 옮겼어요)
   - 상품 하나 → { id, tier: 'free', name, css, g } · css = 상품 폴더의 디자인(svg · 그림) 한 칸을 제 크기(wh)로 이어 깔기 (도련 11-18 · 단색 · 무늬 모양은 모두 디자인 파일 안 · 앱에 무늬 코드 없음)
   - 분류 '단색' = 🎨 단색 칸 · 그 밖 = ☁️ 패턴 칸 · 
   - 목록 = js/prod.js prodList (앱이 켜질 때 바로) · 숨긴 상품 = tier 'off' (진열 · 받기에서 빠지고 이미 쓰는 배경은 그대로) · 꾸미기 상품이라 디자인을 고치면 모두 새 모습
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → patterns → skins → service (index.html 참고) */
const BG_PATTERNS = [];
function bgBuild() {                                                         // 🧁 서버 상품 그대로 (js/prod.js)
    BG_PATTERNS.length = 0;
    (window.prodList ? prodList('배경지') : []).forEach(x0 => {
        const okx = y => { const v = y.u && y.u.디자인, w = y.wh && y.wh.디자인; return !!(v && Array.isArray(w) && +w[0] > 0 && +w[1] > 0 && String((y.P || {}).이름 || '')); };
        const x = window.prodFix ? (prodFix('배경지', x0, okx) || x0) : x0;   // 🛟 받은 그때 모습이 걸리면 서버 지금 모습 (도련 11-19)
        const P = x.P || {}, u = x.u && x.u.디자인, wh = x.wh && x.wh.디자인;
        const css = u && Array.isArray(wh) && +wh[0] > 0 && +wh[1] > 0 ? { backgroundImage: `url('${u}')`, backgroundSize: `${+wh[0]}px ${+wh[1]}px` } : null;   // 📁 디자인 한 칸을 제 크기로 이어 깔아요 (도련 11-18 · 모양은 상품 폴더의 코드 파일 · 앱은 깔기만)
        if (css && String(P.이름 || '')) BG_PATTERNS.push({ id: x.id, tier: P.숨김 ? 'off' : 'free', name: String(P.이름), css, g: P.분류 === '단색' ? 'solid' : 'pat', gift: !!P.처음받기 && !P.스토어 });   // 🎁 처음 선물 = 상품공방 체크 (도련 11-06)
        else console.warn('🧁 배경지 속성이 모자라요 :', x.id);
    });
}
bgBuild();
if (window.prodHook) prodHook(() => { bgBuild(); if (typeof loadBgPattern === 'function') loadBgPattern(); });   // 📦 내 실물이 바뀌면 다시 (js/mine.js)

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['patterns'] = true;
