/* 말랑달콤 다이어리 - js/prod.js
   🧁 상품 목록 (도련 11-02 · 상품공방) : 이모지만 빼고 모든 상품은 서버(Cloudflare malang-img)에 있어요 · 코드에는 상품이 없어요
   - index.html 이 바로 앞에서 https://malang-img.pages.dev/prod.js 를 읽어요 → window.MALANG_PROD = { v, prod: { 종류: [{ id, P, f: { 역할: 지문 이름 }, wh: { 역할: [가로, 세로] }, h: 모습 번호 }] } }
   - 📦 받은 상품 = 받은 그때 모습 (도련 11-16 · js/mine.js 내 실물) : 🪑 소품 · ✏️ 문구는 받는 순간 다꾸러 드라이브에 실물(속성 + 그림)이 생겨요
       → 서버에서 고치거나 지워도 가진 다꾸러 것은 그대로 · 바꿔 주려면 나중에 업데이트 기능 · 아직 실물이 없는 종류(스티커 디자인 · 벽지 · 다이어리 …)는 서버 그대로
       prodList(종류) = 서버 + 내 실물 (숨김 포함 · 가진 것 그리기) · prodShelf(종류) = 진열할 것만 (🏪 샵 · 늘 서버) · prodSrv = 서버 그대로
   - P = 상품공방 속성 (이름 · 분류 · 순서 · 숨김 · 신상 · 스토어 · 종류별 값) · 🎁 기본 = 무료 · 💎 스토어 = 유료 (P.스토어 · 무료 샵 · 처음 선물에서 빠져요) · 숨김 상품도 목록에 있어요 (진열만 빼요 prodShelf)
   - 받지 못했으면 다이어리를 시작하지 않아요 (index.html 파일 누락 확인 · '다시 열기') */
const PROD_BASE = 'https://malang-img.pages.dev';
const PROD_OKF = f => typeof f === 'string' && /^[0-9a-f]{16}\.(png|jpg|gif|webp|svg)$/.test(f);
const PROD_RAW = (window.MALANG_PROD && window.MALANG_PROD.prod && typeof window.MALANG_PROD.prod === 'object') ? window.MALANG_PROD.prod : {};
const prodOne = (x, srv) => {                                                // 서버 줄 하나 → 앱 모양 (srv = 같은 id 서버 것 · 📦 내 실물일 때)
    if (!x || typeof x.id !== 'string' || !x.f || typeof x.f !== 'object') return null;
    const u = {}; Object.keys(x.f).forEach(r => { const f = x.f[r]; if (!PROD_OKF(f)) return; u[r] = srv === undefined || (srv && srv.f && srv.f[r] === f) ? PROD_BASE + '/k/' + f : ((window.mineUrl && mineUrl(f)) || PROD_BASE + '/k/' + f); });   // 📦 같은 그림 = 서버 주소 그대로 · 다르거나 서버에 없으면 내 드라이브 그림
    let P = x.P && typeof x.P === 'object' && !Array.isArray(x.P) ? x.P : {};
    if (srv !== undefined) { const S = (srv && srv.P) || {}; P = Object.assign({}, P, { 숨김: srv ? !!S.숨김 || !!S.스토어 : true, 처음받기: srv ? !!S.처음받기 : false, 순서: srv ? S.순서 : P.순서 }); }   // 📦 진열 · 처음 선물은 늘 서버가 정해요 (서버에 없으면 숨김 = 가진 사람만)
    if (P.스토어) P = Object.assign({}, P, { 숨김: true, 처음받기: false });   // 💎 스토어(유료) 상품 = 아직 무료 샵 · 처음 선물에 안 나와요 (말랑달콤 스토어가 생기면 거기서 · 가진 사람은 그대로)
    return { id: x.id.slice(0, 60), P, u, wh: x.wh && typeof x.wh === 'object' ? x.wh : {}, h: typeof x.h === 'string' ? x.h : '' };
};
const prodSort = L => L.sort((a, b) => (+a.P.순서 || 0) - (+b.P.순서 || 0));
const PROD_C = { srv: {}, all: {} };
const prodSrv = k => PROD_C.srv[k] || (PROD_C.srv[k] = prodSort((Array.isArray(PROD_RAW[k]) ? PROD_RAW[k] : []).map(x => prodOne(x)).filter(Boolean)));   // 🧁 서버 그대로
/* 📦 prodList = 서버 + 내 실물 (도련 11-16 · js/mine.js) : 내가 받은 상품은 받은 그때 모습 (서버에서 고치거나 지워도 그대로) · 서버와 같으면 서버 것 그대로 */
const prodList = k => {
    if (PROD_C.all[k]) return PROD_C.all[k];
    const S = prodSrv(k), D = window.mineDiff ? mineDiff(k) : null;           // D = 서버와 다른 내 실물만 { id: 서버 줄 모양 }
    if (!D || !Object.keys(D).length) return (PROD_C.all[k] = S);
    const raw = new Map((Array.isArray(PROD_RAW[k]) ? PROD_RAW[k] : []).filter(x => x && typeof x.id === 'string').map(x => [x.id, x]));
    const L = S.map(x => D[x.id] ? prodOne(D[x.id], raw.get(x.id)) || x : x);
    Object.keys(D).forEach(id => { if (!raw.has(id)) { const o = prodOne(D[id], null); if (o) L.push(o); } });
    return (PROD_C.all[k] = prodSort(L));
};
const prodShelf = k => prodSrv(k).filter(x => !x.P.숨김);                    // 🏪 진열할 것만 (늘 서버)
const prodOn = () => !!(window.MALANG_PROD && window.MALANG_PROD.prod);
/* 🔁 내 실물이 바뀌면 목록을 다시 만들어요 : 각 파일이 prodHook(다시 만들기) 로 등록 (읽는 순서대로) */
const PROD_HOOKS = [];
const prodHook = fn => { if (typeof fn === 'function') PROD_HOOKS.push(fn); };
function prodRebuild() { PROD_C.all = {}; PROD_HOOKS.forEach(fn => { try { fn(); } catch (e) { console.warn('🧁 다시 만들기', e); } }); }
const prodRawOf = (k, id) => (Array.isArray(PROD_RAW[k]) ? PROD_RAW[k] : []).find(x => x && x.id === id) || null;   // 서버 줄 그대로 (📦 받을 때 내 실물로)
window.prodList = prodList; window.prodShelf = prodShelf; window.prodOn = prodOn; window.prodSrv = prodSrv;
window.prodHook = prodHook; window.prodRebuild = prodRebuild; window.prodRawOf = prodRawOf; window.PROD_OKF = PROD_OKF;
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['prod'] = prodOn();   // 🛡 목록을 못 받았으면 다이어리를 시작하지 않아요 (index.html 아래 확인)
