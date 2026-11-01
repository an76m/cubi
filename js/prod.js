/* 말랑달콤 다이어리 - js/prod.js
   🧁 상품 목록 (도련 11-02 · 상품공방) : 이모지만 빼고 모든 상품은 서버(Cloudflare malang-img)에 있어요 · 코드에는 상품이 없어요
   - index.html 이 바로 앞에서 https://malang-img.pages.dev/prod.js 를 읽어요 → window.MALANG_PROD = { v, prod: { 종류: [{ id, P, f: { 역할: 지문 이름 }, wh: { 역할: [가로, 세로] } }] } }
   - prodList('책상소품') → [{ id, P, u: { 디자인: 주소, … }, wh }] (순서대로) · 받지 못했으면 다이어리를 시작하지 않아요 (index.html 파일 누락 확인 · '다시 열기')
   - 책상 소품 · 문구 · 다이어리 색 · 테마처럼 켜자마자 필요한 것이 이걸 써요 · 샵 진열은 js/elements.js basicKit(list.json) 도 같은 목록
   - P = 상품공방 속성 (이름 · 분류 · 순서 · 숨김 · 신상 · 종류별 값) · 숨김 상품도 목록에 있어요 (이미 받은 다꾸러를 위해 · 진열만 빼요 prodShelf) */
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
            const P = x.P && typeof x.P === 'object' && !Array.isArray(x.P) ? x.P : {};
            return { id: x.id.slice(0, 60), P, u, wh: x.wh && typeof x.wh === 'object' ? x.wh : {} };
        }).filter(Boolean).sort((a, b) => (+a.P.순서 || 0) - (+b.P.순서 || 0)));
    };
})();
const prodShelf = k => prodList(k).filter(x => !x.P.숨김);                    // 🏪 진열할 것만
const prodOn = () => !!(window.MALANG_PROD && window.MALANG_PROD.prod);
window.prodList = prodList; window.prodShelf = prodShelf; window.prodOn = prodOn;
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['prod'] = prodOn();   // 🛡 목록을 못 받았으면 다이어리를 시작하지 않아요 (소품 · 문구가 없는 채로 저장되면 안 돼서 · index.html 아래 확인)
