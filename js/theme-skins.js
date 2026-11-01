/* 말랑달콤 다이어리 - js/theme-skins.js
   🎁 테마 페이지 목록 (판매 · 보상용) — 🎁 테마 보관함에 보여요
   - 한 줄 = 테마 하나 : { id, name, desc, how, free, skin }
       id   : 영어 · 숫자 · - _ (한 번 정하면 바꾸지 말기 · 사용자 보관함에 이 id 가 저장돼요 · 페이지 id 는 'th:id')
       how  : 못 받았을 때 보이는 안내 글
       free : true 면 누구나 보관함에서 바로 써요 (⚠ 지금은 시험용으로 전부 true → 판매 · 보상으로 바꿀 때 true 를 지우기)
       skin : 색 5개(bg cover page border accent · 필수) + 하단메뉴 · 팝업메뉴 · 창 색(선택) + deco · icons (js/skinstudio.js 설명 참고)
   - 테마 하나 더 만들기 : 🎀 페이지꾸미기로 꾸민 뒤 🎨 페이지 → 내 페이지 코드를 복사해 상품공방 '테마' 의 skin 속성에 넣으면 돼요 (⚠ 내 이미지는 용량이 커서 테마에는 기본 꾸밈 · 이모지 권장)
   - 서버 선물로 줄 때는 themeGrant('id') 를 불러요 (다음 단계) */

/* 🧁 테마 = 서버 상품 (상품공방 '테마' · js/prod.js · 도련 11-02 : 예전 4개는 기본상품샵/테마 로 옮겼어요) · 속성 = desc · how · free · skin (위 설명 그대로) */
const THEME_SKINS = [];
function themeBuild() {                                                       // 🧁 서버 + 📦 내 사본 (가진 테마는 서버에서 숨겨도 그대로)
    const mine = typeof currentSkinId === 'string' && currentSkinId.startsWith('th:') ? currentSkinId.slice(3) : '';
    THEME_SKINS.length = 0;
    (window.prodList ? prodList('테마') : []).filter(x => x.P.skin && typeof x.P.skin === 'object' && (!x.P.숨김 || x.id === mine))
        .forEach(x => THEME_SKINS.push({ id: x.id, name: String(x.P.이름 || ''), desc: String(x.P.desc || ''), how: String(x.P.how || ''), free: !!x.P.free, skin: x.P.skin }));
}
themeBuild();
if (window.prodHook) prodHook(themeBuild);
(window.SNAP_OWN = window.SNAP_OWN || {})['테마'] = () => (typeof currentSkinId === 'string' && currentSkinId.startsWith('th:') ? [currentSkinId.slice(3)] : []);   // 📦 사본 (지금 쓰는 테마)

