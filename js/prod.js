/* 말랑달콤 다이어리 - js/prod.js
   🧁 상품 목록 (도련 11-02 · 상품공방) : 이모지만 빼고 모든 상품은 서버(Cloudflare malang-img)에 있어요 · 코드에는 상품이 없어요
   - index.html 이 바로 앞에서 https://malang-img.pages.dev/prod.js 를 읽어요 → window.MALANG_PROD = { v, prod: { 종류: [{ id, P, f: { 역할: 지문 이름 }, wh: { 역할: [가로, 세로] }, h: 모습 번호 }] } }
   - 📦 받은 상품 = 다꾸러 드라이브에 사본 (도련 11-02 · js/snap.js) : 사본이 있으면 사본, 없으면 서버 → 도련이 서버에서 지우거나 고쳐도 가진 것은 그대로
       prodList(종류) = 사본이 섞인 목록 (가진 것 = 사본 · 서버에서 사라진 것도 숨김으로 남아요) · prodServer(종류) = 서버 그대로 (🏪 샵 · ✨ 새 모습 비교)
       사본을 읽거나 바꾸면 prodHook 으로 등록한 목록 만들기를 다시 해요 (책상 소품 · 문구 · 배경지 … 각 파일이 등록)
   - P = 상품공방 속성 (이름 · 분류 · 순서 · 숨김 · 신상 · 꼭고침 · 스토어 · 종류별 값) · 🎁 기본 = 무료 · 💎 스토어 = 유료 (P.스토어 · 무료 샵 · 처음 선물에서 빠져요) · 숨김 상품도 목록에 있어요 (진열만 빼요 prodShelf)
   - 받지 못했으면 다이어리를 시작하지 않아요 (index.html 파일 누락 확인 · '다시 열기') */
const PROD_BASE = 'https://malang-img.pages.dev';
const PROD_SNAP = new Map();                                                 // '종류|id' → { id, P, u, wh, h, cid } (js/snap.js 가 채워요)
const PROD_HOOKS = [];
const prodServer = (() => {
    const okF = f => typeof f === 'string' && /^[0-9a-f]{16}\.(png|jpg|gif|webp|svg)$/.test(f);
    const raw = (window.MALANG_PROD && window.MALANG_PROD.prod && typeof window.MALANG_PROD.prod === 'object') ? window.MALANG_PROD.prod : {};
    const cache = {};
    return k => {
        if (cache[k]) return cache[k];
        return (cache[k] = (Array.isArray(raw[k]) ? raw[k] : []).map(x => {
            if (!x || typeof x.id !== 'string' || !x.f || typeof x.f !== 'object') return null;
            const u = {}; Object.keys(x.f).forEach(r => { if (okF(x.f[r])) u[r] = PROD_BASE + '/k/' + x.f[r]; });
            let P = x.P && typeof x.P === 'object' && !Array.isArray(x.P) ? x.P : {};
            if (P.스토어) P = Object.assign({}, P, { 숨김: true, 처음선물: false, 꼭고침: false });   // 💎 스토어(유료) 상품 = 아직 무료 샵 · 처음 선물에 안 나와요 (말랑달콤 스토어가 생기면 거기서 · 가진 사람은 그대로)
            return { id: x.id.slice(0, 60), P, u, wh: x.wh && typeof x.wh === 'object' ? x.wh : {}, h: typeof x.h === 'string' ? x.h : '' };
        }).filter(Boolean).sort((a, b) => (+a.P.순서 || 0) - (+b.P.순서 || 0)));
    };
})();
const prodSnapOf = (k, id) => PROD_SNAP.get(k + '|' + id) || null;
function prodList(k) {
    const srv = prodServer(k), seen = new Set();
    const out = srv.map(x => { seen.add(x.id); const s = prodSnapOf(k, x.id); return s ? Object.assign({}, s, { P: Object.assign({}, s.P, { 숨김: !!x.P.숨김, 순서: x.P.순서 }) }) : x; });   // 진열(숨김 · 순서)은 서버 그대로
    PROD_SNAP.forEach((s, key) => { if (key.startsWith(k + '|') && !seen.has(s.id)) out.push(Object.assign({}, s, { P: Object.assign({}, s.P, { 숨김: true }) })); });   // 서버에서 사라진 것 = 가진 사람만
    return out;
}
const prodShelf = k => prodServer(k).filter(x => !x.P.숨김);                  // 🏪 진열할 것만 (늘 서버 것)
const prodOn = () => !!(window.MALANG_PROD && window.MALANG_PROD.prod);
function prodHook(fn) { PROD_HOOKS.push(fn); }
function prodRebuild() { PROD_HOOKS.forEach(fn => { try { fn(); } catch (e) { console.warn('🧁 상품 목록 다시 만들기', e); } }); document.dispatchEvent(new Event('prod-change')); }
window.prodList = prodList; window.prodServer = prodServer; window.prodShelf = prodShelf; window.prodOn = prodOn; window.prodHook = prodHook; window.prodRebuild = prodRebuild; window.prodSnapOf = prodSnapOf;
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['prod'] = prodOn();   // 🛡 목록을 못 받았으면 다이어리를 시작하지 않아요 (index.html 아래 확인)
