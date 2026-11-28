/* 말랑달콤 다이어리 - js/prod.js
   🧁 상품 목록 (도련 11-02 · 상품공방) : 이모지만 빼고 모든 상품은 서버(Cloudflare malang-img)에 있어요 · 코드에는 상품이 없어요
   - index.html 이 바로 앞에서 https://malang-img.pages.dev/prod.js 를 읽어요 → window.MALANG_PROD = { v, prod: { 종류: [{ id, P, f: { 역할: 지문 이름 }, wh: { 역할: [가로, 세로] }, h: 모습 번호 }] } }
   - 📦 받은 상품 = 받은 그때 모습 (도련 11-16 · js/mine.js 내 실물) : 🪑 소품 · ✏️ 문구는 받는 순간 다꾸러 드라이브에 실물(속성 + 그림)이 생겨요
       → 서버에서 고치거나 지워도 가진 다꾸러 것은 그대로 · 바꿔 주려면 나중에 업데이트 기능 · 아직 실물이 없는 종류(스티커 디자인 · 벽지 · 다이어리 …)는 서버 그대로
       prodList(종류) = 서버 + 내 실물 (숨김 포함 · 가진 것 그리기) · prodShelf(종류) = 진열할 것만 (🏪 샵 · 늘 서버) · prodSrv = 서버 그대로
   - P = 상품공방 속성 (이름 · 분류 · 순서 · 숨김 · 신상 · 스토어 · 종류별 값) · 🎁 기본 = 무료 · 💎 스토어 = 유료 (P.스토어 · 무료 샵 · 처음 선물에서 빠져요) · 숨김 상품도 목록에 있어요 (진열만 빼요 prodShelf)
   - 받지 못했으면 다이어리를 시작하지 않아요 (index.html 파일 누락 확인 · '다시 열기') */
const PROD_BASE = 'https://malang-img.pages.dev';
/* 🧁 진짜 목록을 빠르게 (도련 11-17 "기기 것은 가짜 목록 · 버전 확인으로 최신인지") :
     - index.html 이 이 기기에 둔 목록(localStorage malang_prod_last)을 먼저 넣어요 (PROD_FROM 'dev') → 여기서 바로 서버 조각표 prod-i.json (몇 KB · 같으면 304) 를 물어요
       같은 버전 = 그대로 진짜 목록 · 다르면 = 바뀐 조각만 받아 바꾸고 다시 그려요 (prodParts → prodRebuild · 1442) · 조각표가 없는 서버면 prod.js 를 통째로 받아 비교
     - 🛑 못 받으면 (한 번에 3초) 1 · 2 · 4초 쉬고 다시 (모두 4번 · util.js retryN) → 그래도 안 되면 PROD_FAIL = 다이어리를 열지 않고 멈춤 화면 (도련 11-25 · 예전 '지난 목록으로 비상' 은 없앴어요)
     - window.PROD_READY = 확인이 끝나면 (로그인 · 처음 선물은 이것을 기다려요 · js/drive.js loadFromDrive)
     - 처음 기기 = index.html 이 서버 prod.js 를 기다려서 받은 것 → 이 기기에 둬요 */
const PROD_LS = 'malang_prod_last';
const prodGood = p => !!(p && p.prod && typeof p.prod === 'object' && Object.values(p.prod).some(a => Array.isArray(a) && a.length));
const prodKeep = p => { try { const t = JSON.stringify(p); if (localStorage.getItem(PROD_LS) !== t) localStorage.setItem(PROD_LS, t); } catch (e) { console.warn('🧁 이 기기에 상품 목록을 못 뒀어요 (다음에 켤 때 서버에서 다시)', e); } };
if (window.PROD_FROM !== 'dev' && prodGood(window.MALANG_PROD)) prodKeep(window.MALANG_PROD);
const PROD_OKF = f => typeof f === 'string' && /^[0-9a-f]{16}\.(png|jpg|gif|webp|svg)$/.test(f);
let PROD_RAW = (window.MALANG_PROD && window.MALANG_PROD.prod && typeof window.MALANG_PROD.prod === 'object') ? window.MALANG_PROD.prod : {};
const prodOne = (x, srv) => {                                                // 서버 줄 하나 → 앱 모양 (srv = 같은 id 서버 것 · 📦 내 실물일 때)
    if (!x || typeof x.id !== 'string' || !x.f || typeof x.f !== 'object') return null;
    const u = {}; Object.keys(x.f).forEach(r => { const f = x.f[r]; if (!PROD_OKF(f)) return; u[r] = (srv === undefined || (srv && srv.f && srv.f[r] === f)) ? PROD_BASE + '/k/' + f : ((window.mineUrl && mineUrl(f)) || PROD_BASE + '/k/' + f); });   // 📦 같은 그림 = 서버 주소 그대로 · 다르거나 서버에 없으면 내 드라이브 그림
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
/* 🛟 받은 그때 모습이 지금 앱 검사에 걸리면 (예전 모양 · 도련 11-19 : 옛 노트 = 내지 값이 지금 없어서 디자인이 빠지고 다른 다이어리 크기로 펼쳐졌어요) → 서버 지금 모습으로 · 그것도 안 되면 null */
const prodFix = (k, x, ok) => { if (ok(x)) return x; const s = prodSrv(k).find(y => y.id === x.id); if (s && s !== x && ok(s)) { if (window.diag) diag('prodFix', { k, id: x.id }); return s; } return null; };
const prodShelf = k => prodSrv(k).filter(x => !x.P.숨김);                    // 🏪 진열할 것만 (늘 서버)
const prodOn = () => !!(window.MALANG_PROD && window.MALANG_PROD.prod);
/* 🔁 내 실물이 바뀌면 목록을 다시 만들어요 : 각 파일이 prodHook(다시 만들기) 로 등록 (읽는 순서대로) */
const PROD_HOOKS = [];
const prodHook = fn => { if (typeof fn === 'function') PROD_HOOKS.push(fn); };
function prodRebuild() { PROD_C.all = {}; PROD_HOOKS.forEach(fn => { try { fn(); } catch (e) { console.warn('🧁 다시 만들기', e); } }); }
const prodRawOf = (k, id) => (Array.isArray(PROD_RAW[k]) ? PROD_RAW[k] : []).find(x => x && x.id === id) || null;   // 서버 줄 그대로 (📦 받을 때 내 실물로)
/* 📦 상품 목록 조각 (도련 11-23 · 1442 '버전이 다른 것만 받기') : 서버(상품공방 포장)는 목록을 조각마다 d/<지문>.json 으로 올리고 · prod-i.json = { v, p: { 조각 이름: 지문 } } (몇 KB)
     조각 이름 = 'prod:종류' (상품 줄) · 'rules' (제작 규칙) · 'kit:images' · 'kit:sheets' · 'kit:종류' (기본스티커 목록 · js/elements.js)
     지문이 같은 조각 = 이 기기 것 그대로 · 다른 조각만 받아요 (d/ 는 내용이 바뀌면 이름이 바뀌어서 브라우저가 한 번 받으면 다시 묻지 않아요)
   prodParts(ix, 이름들, have = { 이름: 지문 } 이 기기 것, old = 이름 → 이 기기 값) → { 이름: 값 } · prodIndex() = 서버 조각표 (확인 때 받은 것 · 없으면 지금 받아요) */
const PROD_GET = (u, ms, how) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms); return fetch(u, { cache: how || 'no-store', signal: c.signal }).finally(() => clearTimeout(t)); };
const prodIxGood = ix => !!(ix && ix.v && ix.p && typeof ix.p === 'object' && Object.values(ix.p).every(h => /^[0-9a-f]{16}$/.test(h)));
const prodIxGet = () => PROD_GET(PROD_BASE + '/prod-i.json', 3000, 'no-cache').then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))).then(ix => { if (!prodIxGood(ix)) throw new Error('bad'); return ix; });   // no-cache = 같으면 304 (몇 바이트)
async function prodParts(ix, names, have, old) {
    const out = {};
    await Promise.all(names.map(async n => {
        const h = ix.p[n]; if (!h) return;
        const o = have && have[n] === h ? old(n) : undefined;
        out[n] = o !== undefined ? o : await PROD_GET(PROD_BASE + '/d/' + h + '.json', 8000, 'default').then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))));
    }));
    return out;
}
let PROD_IX = null;
const prodPick = (ix, f) => Object.keys(ix.p).filter(f).reduce((o, n) => (o[n] = ix.p[n], o), {});   // 조각표 중 일부
async function prodIndex() { await window.PROD_READY; if (!PROD_IX) PROD_IX = await prodIxGet(); return PROD_IX; }
window.prodParts = prodParts; window.prodIndex = prodIndex;
/* 🔎 버전 확인 (기기 목록으로 시작했을 때만 · 처음 기기 = 서버 prod.js 를 막 받았어요 · 그 안 i = 상품 조각표) */
window.PROD_READY = (function () {
    if (window.PROD_FROM !== 'dev') return Promise.resolve('srv');
    const cur = window.MALANG_PROD, get = (u, ms) => PROD_GET(u, ms);
    const swap = p => { window.MALANG_PROD = p; PROD_RAW = p.prod; PROD_C.srv = {}; PROD_C.all = {}; prodKeep(p); prodRebuild(); };
    const stop = why => { window.PROD_FAIL = why; console.warn('🛑 서버 상품 목록을 확인 못 했어요 (' + why + ') → 다이어리를 열지 않고 멈춰요'); return 'fail'; };   // 🛑 도련 11-25 : 지난 목록으로 열지 않아요 (js/drive.js loadFromDrive → bootStop)
    const full = () => get(PROD_BASE + '/prod.js?v=' + Date.now(), 8000).then(r => r.ok ? r.text() : Promise.reject(r.status)).then(t => { const p = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); if (!prodGood(p)) throw new Error('bad'); if (prodSig(p) !== prodSig(cur)) { swap(p); return 'new'; } return 'same'; });   // 받은 김에 내용까지 비교
    const prodSig = x => JSON.stringify([String(x.v), x.prod, x.rules === undefined ? null : x.rules]);   // 버전 · 상품 · 규칙 (조각표 i 는 빼고)
    const isP = n => n === 'rules' || n.startsWith('prod:');
    const pull = ix => prodParts(ix, Object.keys(ix.p).filter(isP), cur.i || {}, n => n === 'rules' ? (cur.rules === undefined ? null : cur.rules) : (cur.prod || {})[n.slice(5)]).then(got => {   // 규칙이 없던 서버 = null 조각   // 📦 바뀐 조각만
        const p = { v: ix.v, prod: {}, rules: got.rules, i: prodPick(ix, isP) };
        Object.keys(ix.p).forEach(n => { if (n !== 'rules' && n in got) p.prod[n.slice(5)] = got[n]; });   // 서버 차례 그대로
        if (!prodGood(p)) throw new Error('bad'); swap(p); return 'new';
    });
    const no404 = e => !(e && e.message === '404');                       // 404 = 조각표가 없는 서버 (다시 하지 않아요)
    return retryN(() => prodIxGet(), no404).then(ix => { PROD_IX = ix; return String(ix.v) === String(cur.v) ? 'same' : retryN(() => pull(ix)); }, e => e && e.message === '404' ? retryN(full) : Promise.reject(e))   // 🔁 못 받으면 1 · 2 · 4초 쉬고 다시 · 조각표가 없는 서버 = 목록 통째로 받아 비교
        .catch(e => stop(e && e.name === 'AbortError' ? '시간 초과' : String(e && e.message || e)));
})();
/* 🗒️ 내지 = 그 다이어리 상품 폴더 안 그림 1개 (도련 11-28 '폴더 하나 = 온전한 상품 · 속지와 같은 방식') : 내지.svg = 규격 크기 한 장 (작은 한 칸이면 이어 깔기 · 그림 1 = 1mm)
   - 상품 속성 '양쪽' = 그림이 펼침면 크기 → 왼쪽 반 = 왼쪽 쪽 · 오른쪽 반 = 오른쪽 쪽 (없으면 = 반쪽 그림 하나를 양쪽에 같이) · 내지는 늘 양쪽 모두 깔려요 (바탕 종이)
   - 상품 속성 '내지' · '내지구간' 값 = 그 폴더의 파일 이름 하나 ('내지' · 구간 '내지2' …) → leafOf(상품, 값) = 앱 안 내지 값 '상품id:내지'
   - 쪽 = leafCss(값, 'l' | 'r') · 모르는 값 = 속지색만 */
const LEAF_PK = ['날짜형바인더', '날짜형노트', '페이지바인더', '페이지노트', '날짜형내지', '페이지내지'];
function leafSrc(v) {                                                         // 내지 값 → { u 그림 주소, wh [가로, 세로] mm, two 펼침면 그림 }
    const k = String(v || ''), i = k.indexOf(':'); if (i < 0) return null;
    const id = k.slice(0, i), r = k.slice(i + 1);
    for (const K of LEAF_PK) { const x = prodList(K).find(p => p.id === id); if (x) return x.u && x.u[r] && x.wh && x.wh[r] ? { u: x.u[r], wh: x.wh[r], two: !!(x.P && x.P.양쪽) } : null; }
    return null;
}
function leafOf(x, v) { const r = String(v || ''); return x && r && !r.includes('/') && x.u && x.u[r] && x.wh && x.wh[r] ? x.id + ':' + r : ''; }   // 상품 속성 값 → 앱 내지 값 ('' = 그 폴더에 그림이 없어요)
function leafOk(v) { return !!leafSrc(v); }
const leafPage = wh => +wh[0] > 50;                                           // 쪽 크기만 한 그림
function leafCss(id, side) {                                                  // side 'l' · 'r' = 펼침면 그림이면 그 반 (없으면 왼쪽)
    const s = leafSrc(id); if (!s) return 'var(--page-bg)';
    if (s.two) return `url("${s.u}") ${side === 'r' ? '100%' : '0'} 0 / 200% 100% no-repeat, var(--page-bg)`;
    return leafPage(s.wh) ? `url("${s.u}") 0 0 / 100% 100% no-repeat, var(--page-bg)` : `url("${s.u}") 0 0 / calc(${+s.wh[0]} * var(--mm)) calc(${+s.wh[1]} * var(--mm)) repeat, var(--page-bg)`;
}
function leafBg(id, k) {                                                      // 작은 견본 (샵 카드) : 1mm = k px · 펼침면 그림 = 왼쪽 반
    const s = leafSrc(id); if (!s) return 'none';
    if (s.two) return `url("${s.u}") 0 0 / 200% 100% no-repeat`;
    return leafPage(s.wh) ? `url("${s.u}") 0 0 / 100% 100% no-repeat` : `url("${s.u}") 0 0 / ${(+s.wh[0] * k).toFixed(2)}px ${(+s.wh[1] * k).toFixed(2)}px repeat`;
}
window.leafOk = leafOk; window.leafOf = leafOf; window.leafCss = leafCss; window.leafBg = leafBg;
window.prodList = prodList; window.prodFix = prodFix; window.prodShelf = prodShelf; window.prodOn = prodOn; window.prodSrv = prodSrv;
window.prodHook = prodHook; window.prodRebuild = prodRebuild; window.prodRawOf = prodRawOf; window.PROD_OKF = PROD_OKF;
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['prod'] = prodOn();   // 🛡 목록을 못 받았으면 다이어리를 시작하지 않아요 (index.html 아래 확인)
