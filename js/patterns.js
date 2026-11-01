/* 말랑달콤 다이어리 - js/patterns.js
   🌈 배경지 목록 = 서버 상품 (🧁 상품공방 '배경지' · 도련 11-02 : 예전에 이 파일에 적어 두던 단색 · 무늬는 기본상품샵/배경지 로 옮겼어요)
   - 상품 하나 → { id, tier: 'free', name, css, g } · 속성 css 가 있으면 그대로 · 없으면 디자인 그림을 무늬로 깔아요 (크기 = 그림 크기 · 속성 '무늬크기' px 로 바꿀 수 있어요)
   - 분류 '단색' = 🎨 단색 칸 · 그 밖 = ☁️ 패턴 칸 · 
   - 목록 = js/prod.js prodList (앱이 켜질 때 바로) · 숨긴 상품 = tier 'off' (진열 · 받기에서 빠지고 이미 쓰는 배경은 그대로) · 꾸미기 상품이라 디자인을 고치면 모두 새 모습
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → patterns → skins → service (index.html 참고) */
const BG_PATTERNS = (window.prodList ? prodList('배경지') : []).map(x => {
    const P = x.P || {}, u = x.u && x.u.디자인, css = P.css && typeof P.css === 'object' ? P.css
        : u ? { backgroundColor: '#ffffff', backgroundImage: `url('${u}')`, backgroundSize: (+P.무늬크기 > 0 ? +P.무늬크기 + 'px' : 'auto') } : null;
    return css ? { id: x.id, tier: P.숨김 ? 'off' : 'free', name: String(P.이름 || ''), css, g: P.분류 === '단색' ? 'solid' : 'pat' } : null;
}).filter(Boolean);

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['patterns'] = true;
