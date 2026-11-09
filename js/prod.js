/* 말랑달콤 다이어리 - js/prod.js
   🧁 상품 목록 (도련 11-02 · 상품공방) : 이모지만 빼고 모든 상품은 서버(Cloudflare malang-img)에 있어요 · 코드에는 상품이 없어요
   - index.html 이 바로 앞에서 https://malang-img.pages.dev/prod.js 를 읽어요 → window.MALANG_PROD = { v, prod: { 종류: [{ id, P, f: { 역할: 지문 이름 }, wh: { 역할: [가로, 세로] }, h: 모습 번호 }] } }
   - 🔁 상품 모습 = 늘 서버 그대로 (도련 11-05 · 사본 없음) : 도련이 상품공방에서 고치면 받은 다꾸러 것도 모두 저절로 새 모습
       ⚠ 상품은 지우지 말고 '숨김' (숨김 = 샵에서만 빠지고 가진 다꾸러는 그대로 · 서버에서 지우면 그 디자인을 그릴 수 없어서 가진 다꾸러 화면에서도 사라져요)
       prodList(종류) = 서버 상품 모두 (숨김 포함 · 가진 것 그리기) · prodShelf(종류) = 진열할 것만 (🏪 샵)
   - P = 상품공방 속성 (이름 · 분류 · 순서 · 숨김 · 신상 · 스토어 · 종류별 값) · 🎁 기본 = 무료 · 💎 스토어 = 유료 (P.스토어 · 무료 샵 · 처음 선물에서 빠져요) · 숨김 상품도 목록에 있어요 (진열만 빼요 prodShelf)
   - 받지 못했으면 다이어리를 시작하지 않아요 (index.html 파일 누락 확인 · '다시 열기') */
const PROD_BASE = 'https://malang-img.pages.dev';
const prodList = (() => {
    const okF = f => typeof f === 'string' && /^[0-9a-f]{16}\.(png|jpg|gif|webp|svg)$/.test(f);
    const raw = (window.MALANG_PROD && window.MALANG_PROD.prod && typeof window.MALANG_PROD.prod === 'object') ? window.MALANG_PROD.prod : {};
    const cache = {};
    return k => {
        if (cache[k]) return cache[k];
        return (cache[k] = (Array.isArray(raw[k]) ? raw[k] : []).map(x => {
            if (!x || typeof x.id !== 'string' || !x.f || typeof x.f !== 'object') return null;
            const u = {}; Object.keys(x.f).forEach(r => { if (okF(x.f[r])) u[r] = PROD_BASE + '/k/' + x.f[r]; });
            let P = x.P && typeof x.P === 'object' && !Array.isArray(x.P) ? x.P : {};
            if (P.스토어) P = Object.assign({}, P, { 숨김: true, 처음받기: false });   // 💎 스토어(유료) 상품 = 아직 무료 샵 · 처음 선물에 안 나와요 (말랑달콤 스토어가 생기면 거기서 · 가진 사람은 그대로)
            return { id: x.id.slice(0, 60), P, u, wh: x.wh && typeof x.wh === 'object' ? x.wh : {}, h: typeof x.h === 'string' ? x.h : '' };
        }).filter(Boolean).sort((a, b) => (+a.P.순서 || 0) - (+b.P.순서 || 0)));
    };
})();
const prodShelf = k => prodList(k).filter(x => !x.P.숨김);                    // 🏪 진열할 것만
const prodOn = () => !!(window.MALANG_PROD && window.MALANG_PROD.prod);
window.prodList = prodList; window.prodShelf = prodShelf; window.prodOn = prodOn;
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['prod'] = prodOn();   // 🛡 목록을 못 받았으면 다이어리를 시작하지 않아요 (index.html 아래 확인)
