/* 말랑달콤 다이어리 - js/app.js
   공통 상태값 · 알림창 · 글꼴 목록 · 페이지 목록 · 시작(window.onload)
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        let currentDate = new Date();                                       // 📍 지금 보는 곳 = 날짜 또는 쪽 (BookSpot · js/book.js) · 바꿀 땐 curSet
        function curSet(v) { currentDate = isSpot(v) ? bookSpot(v.n) : new Date(+v); }
        let isCoverOpen = false;
        let selectedElement = null;
        let zIndexCounter = 10;

        /* 페이지 크기 : 다이어리마다 정해져요 (js/skins.js dySize) */
        const PAGE_BORDER = 4, PAGE_HEADER_H = 48;
        let liveSize = null;
        let layoutDirty = false;

        /* 커스텀 예쁜 메시지 모달 로직 (alert / confirm 대체) */
        let msgResolve = null;
        function showMsg(msg, isConfirm = false) {
            return new Promise((resolve) => {
                msgResolve = resolve;
                document.getElementById('customAlertMsg').innerHTML = msg;
                document.getElementById('customAlertCancelBtn').style.display = isConfirm ? 'block' : 'none';
                document.getElementById('customAlertModal').style.display = 'flex';
            });
        }
        /* 🚨 경고 = 하트 대신 경광등 (노란빛이 깜박 · 도련 11-23 · 📱 다른 기기가 켜져 있을 때 js/drive.js openTell) : 닫으면 다시 하트 */
        async function showWarn(msg) {
            const c = document.querySelector('#customAlertModal .alert-card');
            if (!c.querySelector('.dk-siren')) c.insertAdjacentHTML('beforeend', '<span class="dk-siren" aria-hidden="true"><svg viewBox="0 0 72 80"><defs><linearGradient id="dkSrDome" x1="0" x2="1"><stop offset="0" stop-color="#b3121f"/><stop offset=".35" stop-color="#ff3b45"/><stop offset=".6" stop-color="#ff6a70"/><stop offset="1" stop-color="#a80f1b"/></linearGradient><linearGradient id="dkSrBase" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4a4048"/><stop offset="1" stop-color="#231c22"/></linearGradient><radialGradient id="dkSrCore" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".3" stop-color="#fff27a"/><stop offset=".62" stop-color="#ffc400"/><stop offset="1" stop-color="#ff8a00" stop-opacity="0"/></radialGradient><clipPath id="dkSrClip"><path d="M14 58 L16 22 Q17 8 36 8 Q55 8 56 22 L58 58 Z"/></clipPath></defs><path d="M14 58 L16 22 Q17 8 36 8 Q55 8 56 22 L58 58 Z" fill="url(#dkSrDome)" stroke="#7a0c16" stroke-width="2"/><g clip-path="url(#dkSrClip)"><ellipse class="dk-sr-core" cx="36" cy="36" rx="15" ry="15" fill="url(#dkSrCore)"/><path d="M16 30 Q36 24 56 30" stroke="#c81825" stroke-width="1.4" fill="none" opacity=".6"/><path d="M15 44 Q36 38 57 44" stroke="#c81825" stroke-width="1.4" fill="none" opacity=".6"/></g><path d="M21 18 Q24 12 31 11" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/><rect x="10" y="56" width="52" height="18" rx="6" fill="url(#dkSrBase)" stroke="#120d11" stroke-width="2"/><rect x="31" y="61" width="10" height="8" rx="2" fill="#120d11"/><rect x="33" y="62.5" width="3" height="5" rx="1" fill="#6b5f68"/></svg></span>');
            c.classList.add('is-warn');
            try { return await showMsg(msg); } finally { c.classList.remove('is-warn'); }
        }
        /* 버튼 글자를 바꿔서 묻기 (확인 → ok · 취소 → no) : 결과 true / false */
        async function showAsk(msg, ok, no) {
            const a = document.getElementById('customAlertConfirmBtn'), b = document.getElementById('customAlertCancelBtn');
            const oa = a.textContent, ob = b.textContent;
            a.textContent = ok; b.textContent = no;
            try { return await showMsg(msg, true); } finally { a.textContent = oa; b.textContent = ob; }
        }
        /* 버튼 셋으로 묻기 [no] [ok] [extra] (도련 10-30 · 🛍️ 소품에 두 번째 상품 : 취소 · 바꾸기 · 추가) : 결과 false / true / 'extra' */
        async function showAsk3(msg, ok, no, extra) {
            const box = document.querySelector('#customAlertModal .alert-btns'), a = document.getElementById('customAlertConfirmBtn');
            const x = document.createElement('button'); x.className = 'btn'; x.type = 'button'; x.textContent = extra; x.style.cssText = 'flex:1; justify-content:center;'; x.onclick = () => closeMsg('extra');
            box.appendChild(x);
            try { return await showAsk(msg, ok, no); } finally { x.remove(); }
        }
        /* 버튼 여러 개로 고르기 (도련 11-16 · 📃 속지 끼울 쪽) : opts = ['왼쪽', …] → 고른 번호 · 취소 = -1 */
        async function showPick(msg, opts) {
            const box = document.querySelector('#customAlertModal .alert-btns'), a = document.getElementById('customAlertConfirmBtn');
            const bs = opts.map((t, i) => { const x = document.createElement('button'); x.className = 'btn'; x.type = 'button'; x.textContent = t; x.style.cssText = 'flex:1; justify-content:center;'; x.onclick = () => closeMsg('p' + i); box.appendChild(x); return x; });
            a.style.display = 'none';
            try { const r = await showMsg(msg, true); return /^p\d+$/.test(r) ? +r.slice(1) : -1; } finally { bs.forEach(x => x.remove()); a.style.display = ''; }
        }
        function closeMsg(res) {
            document.getElementById('customAlertModal').style.display = 'none';
            if (msgResolve) {
                msgResolve(res);
                msgResolve = null;
            }
        }

/* 폰트 목록 (기본 web/google fonts 및 기본 로컬 폰트) */
const SYSTEM_FONT = "system-ui, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif";

let fontList = [
    { id: 'sys',           name: '기기 기본 폰트', css: SYSTEM_FONT },

    /* --- 로컬 폰트 (Windows / Mac / OS 공통) --- */
    { id: 'malgun',        name: '맑은 고딕 (Local)', css: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" },
    { id: 'gulim',         name: '굴림 (Local)', css: "'Gulim', 'GulimChe', sans-serif" },
    { id: 'dotum',         name: '돋움 (Local)', css: "'Dotum', 'DotumChe', sans-serif" },
    { id: 'batang',        name: '바탕 (Local)', css: "'Batang', 'AppleMyungjo', serif" },
    { id: 'gungsuh',       name: '궁서 (Local)', css: "'Gungsuh', 'GungsuhChe', serif" },
    { id: 'pyunji',        name: '휴먼편지체 (Local)', css: "'HMDodum', 'Pyunji R', sans-serif" },
    { id: 'headline',      name: '헤드라인 (Local)', css: "'HYHeadLine-Medium', 'HeadLine', sans-serif" },
    { id: 'arial',         name: 'Arial (Local)', css: "Arial, Helvetica, sans-serif" },
    { id: 'comic_sans',    name: 'Comic Sans MS (Local)', css: "'Comic Sans MS', 'Chalkboard SE', cursive" },
    { id: 'courier_new',   name: 'Courier New (Local)', css: "'Courier New', Courier, monospace" },
    { id: 'georgia',       name: 'Georgia (Local)', css: "Georgia, serif" },
    { id: 'impact',        name: 'Impact (Local)', css: "Impact, Charcoal, sans-serif" },
    { id: 'times_roman',   name: 'Times New Roman (Local)', css: "'Times New Roman', Times, serif" },
    { id: 'verdana',       name: 'Verdana (Local)', css: "Verdana, Geneva, sans-serif" },
    { id: 'segoe',         name: 'Segoe UI (Local)', css: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { id: 'tahoma',        name: 'Tahoma (Local)', css: "Tahoma, Geneva, sans-serif" },
    { id: 'trebuchet',     name: 'Trebuchet MS (Local)', css: "'Trebuchet MS', 'Lucida Sans Unicode', sans-serif" },
    { id: 'palatino',      name: 'Palatino (Local)', css: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
    { id: 'garamond',      name: 'Garamond (Local)', css: "Garamond, Baskerville, 'Baskerville Old Face', serif" },
    { id: 'consolas',      name: 'Consolas (Local)', css: "Consolas, 'Courier New', monospace" },
    { id: 'apple_sd',      name: '애플 SD 산돌고딕 (Apple)', css: "'Apple SD Gothic Neo', sans-serif" },
    { id: 'apple_myungjo', name: '애플 명조 (Apple)', css: "'AppleMyungjo', serif" },
    { id: 'helvetica',     name: 'Helvetica (Apple)', css: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { id: 'chalkboard',    name: 'Chalkboard (Apple)', css: "'Chalkboard SE', 'Comic Sans MS', cursive" },

    /* --- 초인기 표준 웹폰트 (CDN 필요) --- */
    { id: 'pretendard',    name: '프리텐다드 [대표 고딕]', css: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif" },
    { id: 'suit',          name: '수트 (SUIT) [모던 고딕]', css: "'SUIT', sans-serif" },
    { id: 'gmarket',       name: 'Gmarket Sans [제목용]', css: "'GmarketSansMedium', sans-serif" },
    { id: 'tmon',          name: '티몬 몬소리체 [제목용]', css: "'TmonMonsori', sans-serif" },

    /* --- Google Fonts (고딕/Sans-Serif) --- */
    { id: 'nk',            name: '노토산스 KR [Google Fonts]', css: "'Noto Sans KR', sans-serif" },
    { id: 'gd',            name: '고운돋움 [Google Fonts]', css: "'Gowun Dodum', sans-serif" },
    { id: 'nanum_gothic',  name: '나눔고딕 [Google Fonts]', css: "'Nanum Gothic', sans-serif" },
    { id: 'nanum_square',  name: '나눔스퀘어 네오 [Google Fonts]', css: "'NanumSquareNeo', sans-serif" },
    { id: 'jua',           name: '주아 [Google Fonts]', css: "'Jua', sans-serif" },
    { id: 'dh',            name: '도현 [Google Fonts]', css: "'Do Hyeon', sans-serif" },
    { id: 'sf',            name: '해바라기 [Google Fonts]', css: "'Sunflower', sans-serif" },
    { id: 'bh',            name: '블랙한산스 [Google Fonts]', css: "'Black Han Sans', sans-serif" },
    { id: 'dg',            name: '동글 [Google Fonts]', css: "'Dongle', sans-serif" },
    { id: 'sty',           name: '스타일리쉬 [Google Fonts]', css: "'Stylish', sans-serif" },
    { id: 'ibm_sans',      name: 'IBM Plex Sans KR [Google Fonts]', css: "'IBM Plex Sans KR', sans-serif" },
    { id: 'orbit',         name: '오르빗 [Google Fonts]', css: "'Orbit', sans-serif" },
    { id: 'gothic_a1',     name: '고딕 A1 [Google Fonts]', css: "'Gothic A1', sans-serif" },

    /* --- Google Fonts (명조/Serif) --- */
    { id: 'nm',            name: '나눔명조 [Google Fonts]', css: "'Nanum Myeongjo', serif" },
    { id: 'noto_serif',    name: '노토세리프 KR [Google Fonts]', css: "'Noto Serif KR', serif" },
    { id: 'gowun_batang',  name: '고운바탕 [Google Fonts]', css: "'Gowun Batang', serif" },
    { id: 'sm',            name: '송명 [Google Fonts]', css: "'Song Myung', serif" },
    { id: 'diphylleia',    name: '산들바람 [Google Fonts]', css: "'Diphylleia', serif" },
    { id: 'hahmlet',       name: '함렛 [Google Fonts]', css: "'Hahmlet', serif" },

    /* --- Google Fonts (손글씨/Cursive/Display) --- */
    { id: 'nps',           name: '나눔펜 스크립트 [Google Fonts]', css: "'Nanum Pen Script', cursive" },
    { id: 'nanum_brush',   name: '나눔붓 스크립트 [Google Fonts]', css: "'Nanum Brush Script', cursive" },
    { id: 'gaegu',         name: '개구 [Google Fonts]', css: "'Gaegu', cursive" },
    { id: 'hm',            name: '하이멜로디 [Google Fonts]', css: "'Hi Melody', cursive" },
    { id: 'ps',            name: '푸어스토리 [Google Fonts]', css: "'Poor Story', cursive" },
    { id: 'sd',            name: '싱글데이 [Google Fonts]', css: "'Single Day', cursive" },
    { id: 'gj',            name: '감자꽃 [Google Fonts]', css: "'Gamja Flower', cursive" },
    { id: 'ys',            name: '연성 [Google Fonts]', css: "'Yeon Sung', cursive" },
    { id: 'ed',            name: '동해 독도 [Google Fonts]', css: "'East Sea Dokdo', cursive" },
    { id: 'cute',          name: '귀여운폰트 [Google Fonts]', css: "'Cute Font', cursive" },
    { id: 'kh',            name: '기랑해랑 [Google Fonts]', css: "'Kirang Haerang', cursive" },
    { id: 'gugi',          name: '구기 [Google Fonts]', css: "'Gugi', cursive" },
    { id: 'dokdo',         name: '독도 [Google Fonts]', css: "'Dokdo', cursive" },
    { id: 'black_fancy',   name: '흑백영화 [Google Fonts]', css: "'Black And White Fancy', cursive" },
    { id: 'bagel_fat',     name: '베이글 팻 One [Google Fonts]', css: "'Bagel Fat One', cursive" }
];

        function fontIdOf(css) { const f = fontList.find(x => x.css === css); return f ? f.id : 'sys'; }
        const DEFAULT_UI_FONT = fontList[0].css;
        const DEFAULT_TEXT_FONT = "'Gaegu', cursive";                      // ✍️ 새 메모 기본 글씨체 = 개구 (도련 · 2026-10-13 · 화면 글씨체는 그대로)
        const DEFAULT_TEXT_COLOR = '#444444';
        const DEFAULT_TEXT_SIZE = 18;

        const emojiRanges = {
            faces: [[0x1F600, 0x1F64F], [0x1F970, 0x1F9A2]],
            animals: [[0x1F400, 0x1F4D3], [0x1F980, 0x1F9AE]],
            food: [[0x1F347, 0x1F37B], [0x1F950, 0x1F96B]],
            activities: [[0x1F380, 0x1F3C4], [0x1F940, 0x1F94B]],
            travel: [[0x1F680, 0x1F6C5], [0x1F300, 0x1F320]],
            objects: [[0x1F4A0, 0x1F4FF], [0x1F321, 0x1F346]],
            symbols: [[0x2702, 0x27B0], [0x1F300, 0x1F5FF]]
        };

        /* 📔 날짜형 다이어리 디자인 = 서버 상품 (상품공방 '날짜형바인더' · '날짜형노트' · 도련 11-04 : 상품 하나 = 디자인 하나 · 디자인이 늘어도 코드는 그대로)
           속성 : 이름 · 규격(n) · mm · r(세로÷가로) · b(묶는 방식) · 표지색 · 테두리색 · 강조색 · 속지색 · 내지(🗒️ 그 폴더의 내지 그림 이름 · js/prod.js leafOf · 모든 날 같은 내지 · 도련 11-05 · 11-28) · 처음받기
           DY_DESIGNS = 날짜형 디자인 모두 (권 · 가게 · 책상) · DY_COL = 디자인 id → 그 권 색 { cover, page, border, accent } (펼친 권 = 다이어리에만 칠해요 · js/dyyear.js dyyColorPaint · 도련 11-05) */
        const DY_COL = {}, DY_DESIGNS = [];
        const DY_DKINDS = [['날짜형바인더', '바인더', 'b'], ['날짜형노트', '노트', 'n']];   // [상품 종류, 모양, 권 id 글자 (2026b-dyb-20261104090000-1)]
        function dyColorsBuild() {                                             // 🧁 서버 상품 그대로 (js/prod.js)
            Object.keys(DY_COL).forEach(k => delete DY_COL[k]); DY_DESIGNS.length = 0;
            const okC = v => /^#[0-9a-f]{6}$/i.test(v || '');
            DY_DKINDS.forEach(([K, kind, ch]) => (window.prodList ? prodList(K) : []).forEach(x0 => {   // 🔎 상품 그대로 (빠지면 안 나와요 · 상품공방이 검수)
                const bad = x => { const P = x.P || {}; return !String(P.표지색 || '') || !['테두리색', '강조색', '속지색'].every(n => okC(P[n])) || !String(P.이름 || '') || !String(P.규격 || '') || !String(P.mm || '') || !(+P.r > 0) || !['ring', 'tn', 'spread', 'hard', 'thin'].includes(P.b) || (ch === 'n' && !leafOf(x, P.내지)); };
                const x = window.prodFix ? prodFix(K, x0, y => !bad(y)) : (bad(x0) ? null : x0), P = (x && x.P) || {};   // 🛟 받은 그때 모습이 걸리면 서버 지금 모습 (도련 11-19)
                if (!x) { console.warn('🧁 날짜형 다이어리 속성이 모자라요 :', K, x0.id); return; }
                DY_COL[x.id] = { cover: String(P.표지색), page: P.속지색, border: P.테두리색, accent: P.강조색 };
                DY_DESIGNS.push({ id: x.id, K, kind, ch, name: String(P.이름), n: String(P.규격), mm: String(P.mm), r: +P.r, b: P.b, c: P.테두리색, lf: leafOf(x, P.내지), rf0: String(P.처음내지 || ''), off: !!P.숨김, gift: !!P.처음받기, desk: P.처음책상, float: !!P.처음띄움, ntOn: !!P.공지, cvOk: !!P.표지꾸미기 });   // 📢 📕 공지 카드 · 표지 꾸미기 = 상품공방 체크 (도련 11-06 · js/skins.js dyNtOn · dyCvOk)   // 🎁 처음 책상 자리 · 처음 떠 있는 권 = 상품공방 (도련 11-06 · js/desk.js deskVolInit)
            }));
        }
        dyColorsBuild();
        /* 📁 다이어리 부품 = 상품 폴더의 코드 파일 (도련 11-18 · 2단계) : 표지.svg (겉 · 펼친 둘레 · 책상 위 권) · 링.svg (링 바인더 링 한 개)
           앱은 그 파일을 제자리에 깔기만 · 디자인(상품) id → { face, ring } 주소 · 날짜형 · 페이지형 바인더 · 노트 */
        const DY_FILES = {};
        function dyFilesBuild() {
            Object.keys(DY_FILES).forEach(k => delete DY_FILES[k]);
            ['날짜형바인더', '날짜형노트', '페이지바인더', '페이지노트'].forEach(K => (window.prodList ? prodList(K) : []).forEach(x => { const u = x.u || {}, wh = (x.wh && x.wh.표지) || []; if (u.표지 || u.링) DY_FILES[x.id] = { face: u.표지 || '', fw: +wh[0] || 0, fh: +wh[1] || 0, ring: u.링 || '' }; }));
        }
        dyFilesBuild();
        window.dyFaceCss = (id, u) => { const f = DY_FILES[id]; if (!(f && f.face && f.fw > 0 && f.fh > 0)) return 'none'; return u === 'px' && f.fw >= 100 ? `url("${f.face}") center / 100% 100% no-repeat` : `url("${f.face}") 0 0 / ${f.fw}${u || 'cqw'} ${f.fh}${u || 'cqw'} repeat`; };   // 📐 표지 = 규격 크기 한 장 (도련 11-28 · 그림 1 = 종이 폭 1% · 가로 100 = 한 장) : 다이어리 겉 · 펼친 둘레 (cqw) = 그대로 · 책상 위 권 · 견본 (px) = 그 칸에 한 장 · 작은 한 칸 = 이어 깔기
        window.dyRingCss = id => { const f = DY_FILES[id]; return f && f.ring ? `url("${f.ring}") center / 100% 100% no-repeat` : ''; };   // 링 한 개 (css --dy-ring · 없으면 '' = 앱 기본 링)
        /* 📅 📄 바인더 내지 = 서버 상품 (상품공방 '날짜형내지' · '페이지내지' · 도련 11-07 · 종류 = 폴더) : date 날짜 내지 (해 없음 · 끼운 표지의 해를 따라가요) · page 페이지 내지 (쪽수 · 내지 구간)
           규격 = 같은 크기 표지에만 끼워요 · 🧩 받으면 바인더내지 재료 (js/dyyear.js dyyShopList · js/dymaker.js) */
        const DY_REFILLS = [];
        function dyRefillsBuild() {
            DY_REFILLS.length = 0;
            [['날짜형내지', 'date'], ['페이지내지', 'page']].forEach(([K, t]) => (window.prodList ? prodList(K) : []).forEach(x => {
                const P = x.P || {}, pg = Math.round(+P.쪽수), lf = v => leafOf(x, v);   // 🗒️ 그 폴더의 내지 그림 (js/prod.js)
                if (!String(P.이름 || '') || !String(P.규격 || '') || !String(P.mm || '') || !(+P.r > 0) || !lf(P.내지) || (t === 'page' && !(pg > 0))) { console.warn('🧁 바인더 내지 속성이 모자라요 :', x.id); return; }
                const lv = t === 'page' ? [[1, pg, lf(P.내지)]].concat((Array.isArray(P.내지구간) ? P.내지구간 : []).filter(r => Array.isArray(r) && +r[0] >= 1 && +r[1] >= +r[0] && +r[1] <= pg && lf(r[2])).map(r => [+r[0], +r[1], lf(r[2])])) : [];
                DY_REFILLS.push({ id: x.id, K, t, g: String(P.이름), n: String(P.규격), mm: String(P.mm), r: +P.r, lf: lf(P.내지), pg: t === 'page' ? pg : 0, lv, off: !!P.숨김 });
            }));
        }
        dyRefillsBuild();
        if (window.prodHook) prodHook(() => { dyColorsBuild(); dyFilesBuild(); dyRefillsBuild(); });   // 📦 내 실물이 바뀌면 다이어리 디자인 · 내지 다시 (js/mine.js)

        window.onload = () => oneReady(() => {                                  // 🔒 이 창이 다이어리를 맡았을 때만 시작 (한 기기에 하나 · js/onlyone.js)
            setupCurlDrag();
            if (typeof loadBgPattern === 'function') loadBgPattern();   // 🌈 전체 배경지 (js/skins.js)
            if (typeof seasonRestore === 'function') seasonRestore();   // 🌸 계절 테마 (js/season.js · 닫혀 있으면 아무것도 안 해요)
            setupFontSelects();
            setupPanelDrag();
            loadUIFont();
            setupLayout();
            setupPageMove();
            initDrive();
            loadCoverNotice();
        });


/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['app'] = true;
