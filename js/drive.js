/* 말랑달콤 다이어리 - js/drive.js
   ☁ 구글 로그인 · 드라이브 저장/불러오기 · 화면 꺼짐 자동 저장  ⚠ 저장의 핵심 - 꼭 필요할 때만 수정
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        /* =====================================================================
           ☁ 구글 드라이브 저장소 : 내 드라이브의 '말랑달콤' 폴더 하나에 모두 모여요
           📁 폴더 구조 (도련 10-26 · 10-28 고침) : 말랑달콤 바로 아래에 '종류' 폴더만 한 줄로 · 무료 · 유료 · 이벤트 · 공유 모두 종류가 같으면 같은 폴더 (받은 곳은 파일 안 · 목록에)
              - 상품 하나 = 따로 하나 (현실처럼 · 같은 것도 또 받아요) : 파일이 여러 개인 상품(📔 다이어리)은 한 개에 폴더 하나 · 파일 하나인 상품(🪑 소품 · ✏️ 문구)은 한 개에 파일 하나
              - 🏷️ 스티커는 예외 (바구니 ↔ 스티커첩으로 옮겨 다녀서 목록 하나 · js/own.js)
              - 새 종류 = DIRS · DESK_DIRS · GD_DIRS 에 한 줄 · 작은 기록은 비슷한 것끼리 한 파일 (설정 폴더 · 기록.json · 설정.json)
             ⭐ 저장 정리 (도련 11-20 · 1349~1353 · 03 저장지도 맨 위) : 목록은 모두 올리는 크기 55KB씩 _목록1.json … (도련 11-21 · 나눠 담기 공통 chunkPlace · 바뀐 파일만 올려요) · 배치N.json = 책상 위 + 서랍 속 · 백업 파일 없음
             말랑달콤 / 다이어리 / 🔐 _목록1.json …   📔 📕 쓸 수 있는 권 하나에 한 줄 (날짜형 · 페이지형 · from gift · basic · mine · 노트 = 바로 · 바인더 = 조립하면 · 도련 11-07 · js/dyown.js)
                      / 다이어리 / 2026 분홍 1 / 2026-10-28.json · 표지.json · 검색.json · 다이어리.json   📔 날짜형 한 권 = 폴더 (노트 = 2026 분홍노트 1)
                      / 다이어리 / dk… / 다이어리.json · 표지.json · 3페이지.json · 검색.json   📕 페이지형 한 권 = 폴더 (권 id)
                      / 빈스티커첩 / 🔐 _목록1.json … (📒 바인더 · 🤍 이형지북 두 칸) · 받은-<c>.json   📥 받았지만 아직 어느 스티커 정리에 쓸지 안 정한 책 (불러오면 그 종류 _스티커첩.json 으로 · 빈 책은 돌아와요 · 💤 · 도련 11-08)
                      / 다이어리 / 🔐 _바인더재료목록1.json … (표지 · 내지 두 칸)   🧩 바인더 재료 (받거나 만든 표지 · 내지 · 조립하면 빠져요 · 💤 쓸 때 읽어요 · 도련 11-08 폴더 둘을 합쳤어요)
                      / 배경지 / 내-<id>.json · 내-목록1.json   📚 내가 만든 배경지 모음 (js/coll.js)
                      / 씰 · 조각 · 모조지 · 마테 · 떡메 · 메모지 · 속지 / _목록1.json … (올리는 크기 55KB씩 · 글자만) · _목록1_썸네일.json … (그림 정보) · _스티커첩1.json … (올리는 크기 55KB씩) · <id>.json (내 종이 · 암호화) · 내-/받은- (공유하기 · 보류)   🎒 유한 스티커 (js/own.js · 목록도 종류마다 · 11-05)
                      / 소품 / 🔐 _목록1.json · _목록2.json … (올리는 크기 55KB씩 · 소품 + 벽지 · 책상판) · 받은-<id>.json   🪑 백 = 가진 소품 전부 (서랍장 · 시계 … 종류가 섞여요 · 도련 11-07 · 💤 소품함을 열 때 읽어요)
                      / 문구 / 🔐 _목록1.json … · 받은-<id>.json   ✏️ 백 = 가진 문구 전부 (같은 것도 여러 개 · 앱을 켤 때 읽어요 · 도련 11-07)
                      / 배경지 / 받은-<id>.json · 🔐 _목록1.json …           🌈 샵에서 받은 배경지 하나에 파일 하나 (내가 만든 배경지 = 내-) · _목록.json = 가진 배경지 (💤 창을 열 때 읽어요 · 바뀔 때 처음 생겨요 · 도련 11-07)
                      / 인형돌 · 인형극 / <이름>.json                   👧 꾸미기용 아바타 인형 · 🎭 인형극 (js/doll-store.js · js/puppet.js · 도련 11-04 : 책상 '인형' 과 다른 폴더)
                      / 설정 /                                          ⚙ 내 정보는 한 폴더에 (도련 11-06 · 예전 책상배치 · 기본세트 폴더를 합쳤어요 · 역할마다 파일 하나 · 바뀐 파일만 올라가요)
                              기록N.json       📒 출석 · 화분 · 달력 · D-day · 심리 · 오락실 (도련 11-13 · 예전 카페기록 / 카페.json)
                              (_문제기록.json   예전 · 1317 부터 안 만들어요 · 🧾 기록은 이 기기에만)
                              설정N.json       ⚙ 설정 탭 값 · 펼친 권 · 본 것 표시 (🗺 인수인계 03_저장지도.md) · 상품 모습은 늘 서버 그대로 (사본 없음 · js/prod.js)
                              책상설정N.json   ⚙ 🔐 기능 연결 · 벽지 · 책상판 · 이름표 · 받은 공유 번호
                              배치N.json       📍 🔐 소품 자리 · 펜꽂이 · 서랍 칸에 든 문구 · 책 · 책상 위 다이어리 · 스티커첩 (+ 그림 사본) · 봉투 (도련 11-21 · 서랍장 파일을 합쳤어요 · 올리는 크기 55KB씩)
                              (권마다 집게 · 구멍 · 링 · 꺼낸 장 = 그 권 폴더 / 상태.json · 982)
                              _내정보N.json    🔐 잠금 · 별명 · 생년월일 · 연락처 (개인정보)
                              (_백업.json      없앴어요 · 1272 · 목록이 없어지면 받은- · 종이 파일 · 장부로 되살려요)
                      / 휴지통 / …                                      🗑 앱 휴지통 : 지운 것 · 덮어쓰기 전 모습 (js/trash.js · 30일 뒤 앱이 영구 삭제 · 구글 휴지통 안 써요)
           - 폴더가 없으면 저장할 때 자동으로 만들어요 · 같은 이름 폴더가 둘이면 먼저 만든 쪽으로 합쳐요
           - 📱 한 기기 기준 (1275 · 도련 11-17) : 올리기 전에 다른 기기를 묻거나 합치지 않아요 · 다른 기기 것은 켤 때 · 돌아올 때 구글 changes 로 받아요
           - 개발 중이라 예전 폴더(다꾸 · 스티커 · 다이어리 · 카페 …)에서 옮기는 코드는 없어요
           ===================================================================== */
        const GOOGLE_CLIENT_ID = '1020129080030-42dun4pqvve1pjg9r21m62dd71h6hui5.apps.googleusercontent.com'; // ← 본인 OAuth 클라이언트 ID로 교체
        const TOP_FOLDER_NAME = '말랑달콤';                         // 최상위 폴더
        /* 📁 폴더 이름은 여기 한 곳에서만 (도련 10-26 · 새 폴더 = 한 줄 추가) · 스티커 종류 폴더는 js/own.js OWN_KIND */
        const DIRS = {
            day: '날짜형바인더', dayNote: '날짜형노트', note: '페이지노트', binder: '페이지바인더',   // 📔 다이어리 종류 (도련 10-28 · 나중 날짜형노트)
            desk: '소품', gd: '문구', diary: '다이어리',   /* 📔 📕 다이어리 = 폴더 하나 · 한 권 = 그 안의 폴더 하나 (날짜형 · 페이지형 모두 · 도련 11-07) */   /* 🪑 ✏️ 소품 · 문구 = 폴더 하나씩 (도련 11-07 · 종류가 섞여 있어요 · 종류는 파일 안 상품 id · 벽지 · 책상판도 소품) */
            pattern: '배경지', noteCover: '노트',   /* 📓 내가 만든 노트 한 권 설계도 (표지 + 내지 · 도련 11-07 이름 고침) */ emptyBook: '빈스티커첩',   /* 📥 받은 스티커바인더 · 이형지북 = 한 폴더 (종류 없이 · 도련 11-08 · 🧩 바인더 재료는 다이어리 / _바인더재료목록.json) */
            stkList: '스티커목록', design: '도안', doll: '인형돌', puppet: '인형극',   /* 📐 내 도안 = 내가 만든 스티커 원본 (쓰면 안 사라져요 · 한 장 더 찍기 · 도련 11-09 · js/own.js ownDesign*) */   /* 👧 꾸미기용 아바타 인형 = 인형돌 (책상 소품 인형 = DESK_DIRS.doll '인형' · 도련 11-04) */ settings: '설정', trash: '휴지통'
        };
        /* 🪑 ✏️ 물건 종류 폴더 (도련 10-27 : 무료 · 유료 · 이벤트 · 공유받은 것 · 내가 만든 것 모두 종류가 같으면 같은 폴더) · 가질 때 생겨요 */
        /* ⚠ pencup 폴더 = '연필꽂이' 그대로 (화면 이름만 펜꽂이 · 도련 11-03) */
        /* ⚠ DESK_DIRS · GD_DIRS · SKIN_DIRS = 종류 이름 표 (소품함 탭 이름 · 예전 폴더 이름) · 파일은 소품 / 문구 폴더 하나에 (도련 11-07) */
        const DESK_DIRS = { drawer: '서랍장', clock: '시계', bookshelf: '책꽂이', pencup: '연필꽂이', riser: '받침대', wallshelf: '벽선반', board: '게시판', basket: '소품바구니', lamp: '조명', doll: '인형', taperack: '마테정리함', lights: '전구줄', peg: '집게사진', tablet: '태블릿' };   // 🆕 조명 · 인형 (도련 10-28 · 소품 종류가 늘면 칸만 더해요)
        const GD_DIRS = { tweez: '핀셋', scissors: '가위', punch: '펀칭기', tape: '양면테이프', clip: '집게', knife: '칼', ruler: '자', pen: '색연필', hi: '형광펜', erase: '지우개' };   // ✏️ 필기구도 (도련 11-05 · 문구 상품 '문구종류' = 폴더)
        const SKIN_DIRS = { wall: '벽지', top: '책상판' };            // 🧱 🪵 책상 꾸밈 (도련 11-05 · js/deskskin.js)
        const dirPath = n => [TOP_FOLDER_NAME, n];                   // 늘 말랑달콤 바로 아래 한 칸
        const DIARY_PATH = dirPath(DIRS.diary);                     // 📔 말랑달콤 / 다이어리 / _목록.json · <권 폴더> / … (도련 11-07)
        const DK_KINDS = ['노트', '바인더'];                         // 📕 페이지형 : 말랑달콤 / 페이지노트 · 페이지바인더 / <권 id>-…json
        const SETTINGS_PATH = dirPath(DIRS.settings), SETTINGS_FILE_NAME = '설정';
        /* =====================================================================
           🧾 문제 기록 (도련 11-06 · 마테 목록이 사라졌을 때 원인을 알 수 없어서) : 파일을 지우거나 · 휴지통에 넣거나 · 폴더를 만들고 합치거나 · 되살릴 때마다 한 줄
           - 저장 : 이 기기 브라우저 (localStorage 'malang_diag_q' · 400줄까지) 만 · 드라이브 파일 (예전 말랑달콤 / 설정 / _문제기록.json) 은 만들지 않아요 (도련 11-19 · 1317 영구삭제)
           - 보기 : 💻 📊 백엔드 상황판 → 🧾 기록 탭 (📋 복사 → Claude 에게 붙여 넣기)
           - 일기 · 스티커 내용 · 계정은 적지 않아요 (언제 · 어느 기기 · 무엇을 · 어떤 파일 이름 · 번호 · 누가 불렀는지만)
           ===================================================================== */
        const DIAG_MAX = 400, DIAG_LS = 'malang_diag_q', DIAG = { q: [] };
        try { const L = JSON.parse(localStorage.getItem(DIAG_LS) || '[]'); if (Array.isArray(L)) DIAG.q = L.slice(-DIAG_MAX).map(r => { delete r.up; return r; }); } catch (e) {}
        const diagKeep = () => { try { localStorage.setItem(DIAG_LS, JSON.stringify(DIAG.q.slice(-DIAG_MAX))); } catch (e) {} };
        const diagDev = (() => { try { let d = localStorage.getItem('malang_dev_id'); if (!d) { d = Math.random().toString(36).slice(2, 7); localStorage.setItem('malang_dev_id', d); } return d; } catch (e) { return 'x'; } })();
        const diagVer = () => { try { const m = /[?&]v=([\w-]+)/.exec((document.querySelector('script[src*="js/drive.js"]') || {}).src || ''); return m ? m[1].replace(/^20261009-/, '') : ''; } catch (e) { return ''; } };
        function diagWho() {                                                     // 누가 불렀는지 (함수 이름 두 개)
            const L = String(new Error().stack || '').split('\n').slice(1).map(l => (/at (?:async )?([\w$.]+) /.exec(l) || [])[1]).filter(n => n && !/^(diag|diagWho|driveTrash|ownFileKill|Object\.|Promise|new |eval|async$)/.test(n));
            return L.slice(0, 2).join('<');
        }
        function diag(e, o) {
            try {
                const r = Object.assign({ t: new Date().toISOString(), d: diagDev, v: diagVer(), e }, o || {});
                if (!r.who && e !== 'start') r.who = diagWho();
                DIAG.q.push(r); if (DIAG.q.length > DIAG_MAX) DIAG.q.splice(0, DIAG.q.length - DIAG_MAX); diagKeep();
                console.info('🧾', e, o || '');
            } catch (x) {}
        }
        async function diagRead() { return DIAG.q.map(r => Object.assign({}, r)).sort((a, b) => (a.t < b.t ? -1 : 1)); }   // 보기 = 이 기기 기록
        window.diag = diag; window.diagRead = diagRead;
        const DESK_PATH = SETTINGS_PATH, DESK_FILE_NAME = '배치';   // 🪑 책상 · 가진 것 목록도 설정 폴더에 (도련 11-06)
        const CAFE_PATH = SETTINGS_PATH, CAFE_FILE_NAME = '기록';   // 📒 놀이 기록 = 설정 폴더 / 기록.json (도련 11-13 · 카페가 없어져서 예전 카페기록 / 카페.json 을 옮겼어요)
        const USE_APP_DATA_FOLDER = false; // false: 내 드라이브에 '말랑달콤' 폴더가 보임 / true: 사용자에게 안 보이는 앱 전용 공간
        const DRIVE_SCOPES = USE_APP_DATA_FOLDER                         // 📒 drive.appdata = 숨은 장부 칸 (도련 11-11 · 구글 콘솔 '데이터 액세스'에 두 줄 다 넣어 뒀어요)
            ? ['https://www.googleapis.com/auth/drive.appdata']
            : ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.appdata'];
        const DRIVE_SCOPE = DRIVE_SCOPES.join(' ');
        const AUTH_FLAG_KEY = 'gdrive_authed';   // 이 기기에서 이전에 로그인했는지 (자동 로그인 시도용)
        const UPLOAD_DEBOUNCE_MS = 60000;        // 변경 후 이 시간이 지나면 자동으로 드라이브에 저장 (3초 → 10초 · 도련 11-14 → 60초 · 도련 11-17 : 드라이브 요청 줄이기 · 화면이 꺼지면 · 앱을 내리면 바로)
        const UPLOAD_MAX_WAIT_MS = 60000;        // ⏱ (30초 → 1분 · 도련 11-14) 쉬지 않고 계속 바꿔도 첫 변경부터 이 시간 안에는 한 번 올려요 (11-17 : 쉬는 시간도 60초라 = 처음 바꾼 뒤 60초에 한 번) (아무것도 안 바꾸면 저장 안 함 · 도련 10-20)
        const PENDING_KEY = 'gdrive_pending_backup'; // 화면이 꺼질 때 업로드가 끝나기 전에 앱이 멈출 경우를 대비한 임시 보관본
        const KEEPALIVE_MAX_BYTES = 60000;       // fetch keepalive 옵션은 본문 64KB 이하만 가능
        const CHUNK_UP_BYTES = 55000;            // 📚 나눠 담는 파일 하나 = 올리는 크기 55KB 까지 (도련 11-21 · keepalive 60KB 안 · 비율이 조금 빗나가도 넘지 않게 여유)
        const CHUNK_WORST = 0.74;                // 하나도 안 줄어드는 글자 = 올리면 1.34배 (base64) → 글자 ÷ 올린 크기 = 0.74 · 비율을 모를 때 (어떤 글자든 안전)
        const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
        const FOLDER_MIME = 'application/vnd.google-apps.folder';
        /* 📔 날짜 다이어리 = 한 권에 폴더 하나 (도련 10-28 · js/dyyear.js) : 권 id '2026mint2' = 해 · 바인더 색 · 그 해 그 색 몇 번째 (지워도 번호는 다시 안 써요)
             diary_2026mint2_2026_10_28 → 말랑달콤 / 날짜형바인더 / 2026 녹색 2 / 2026-10-28.json · 검색 목록 = 그 폴더 / 검색.json */
        /* 📔 날짜형 권 id '2026b-dyb-20261104090000-2' = 해 · 종류 글자(b 날짜형바인더 · n 날짜형노트) · 디자인 id · 번호 (도련 11-04 · js/dyyear.js) · 디자인이 늘어도 코드는 그대로 */
        const DAY_KEY_RE = /^diary_(\d{4}[bn]-.+-\d+)_(?:(\d{4})_(\d{2})_(\d{2})|(cover))$/;   // 📕 그 권 표지 = diary_<권 id>_cover (도련 11-16 · ③ 가짜 날짜 없애기)
        const DYB_RE = /^(\d{4})([bn])-(.+)-(\d+)$/;
        function dyBookName(b) { const r = DYB_RE.exec(b || ''); return r ? `${r[1]} ${r[3]} ${r[4]}` : ''; }   // 폴더 이름 '2026 dyb-20261104090000 2' (해 · 디자인 id · 번호)
        function dyBookOfName(n, note) {                                   // 폴더 이름 → 권 id (노트인지 = 디자인으로 · 도련 11-07 다이어리 폴더 하나)
            const r = /^(\d{4}) (.+) (\d+)$/.exec(n || ''); if (!r) return '';
            if (note == null) { const d = (typeof DY_DESIGNS !== 'undefined' ? DY_DESIGNS : []).find(x => x.id === r[2]); note = d ? d.ch === 'n' : /^dyn-/.test(r[2]); }   // 디자인을 아직 못 읽었으면 = id 앞머리 (dyn 날짜형노트 · 도련 11-15)
            return `${r[1]}${note ? 'n' : 'b'}-${r[2]}-${r[3]}`;
        }
        const dyBookDir = b => DIARY_PATH.concat([dyBookName(b)]);         // 📔 다이어리 / 2026 분홍 1 (노트 = 2026 분홍노트 1 · 디자인 id 로 나뉘어요)
        const dkBookDir = id => DIARY_PATH.concat([id]);                   // 📕 다이어리 / dk… (페이지형 한 권 = 폴더 하나 · 도련 11-07)
        const PAGE_KEY_RE = /^dkp_(dk[0-9a-z]+)_(\d+)$/, BOOK_KEY_RE = /^dkb_(dk[0-9a-z]+)$/, STATE_KEY_RE = /^dys_(\d{4}[a-z]-.+-\d+|dk[0-9a-z]+)$/;   // 📔 📕 권마다 상태 = 그 권 폴더 / 상태.json (집게 · 구멍 · 링 · 꺼낸 장 · 도련 11-07 · 982 · js/skins.js bsGet)   // 📕 유한 다이어리 : 장 · 다이어리.json (js/skins.js dk…)
        const DK_INFO = '다이어리.json', dkInfoName = id => DK_INFO;   // 📕 권 정보 파일 : 그 권 폴더 / 다이어리.json (도련 11-07 · 날짜형과 같은 이름)

        /* 메모리 저장소: 화면이 쓰는 값은 여기(문자열)에 두고, 변경된 것만 드라이브에 올립니다.
           - 날짜 데이터  : diary_2026b-분홍-1_2026_09_10  → 말랑달콤/날짜형바인더/2026 분홍 1/2026-09-10.json (다이어리 한 권 = 폴더 하나 · 다이어리끼리 기록을 나누지 않아요)
           - 📕 유한 다이어리 : dkp_<권 id>_3 → 말랑달콤/페이지바인더/<권 id>-3페이지.json · dkb_<권 id> → <권 id>-다이어리.json
           - 설정 데이터  : diary_ui_font 등  → 말랑달콤/설정/설정.json  (놀이 기록은 말랑달콤/설정/기록.json) */
        const store = {
            _m: new Map(),
            _silent: false,
            keys() { return Array.from(this._m.keys()); },
            getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
            setItem(k, v) {
                v = String(v);
                if (v === 'undefined' || this._m.get(k) === v) return;
                this._m.set(k, v);
                if (!this._silent) markDirty(k);
            },
            removeItem(k) {
                if (this._m.delete(k) && !this._silent) markDirty(k);
            },
            /* 드라이브에서 읽어온 값을 '변경됨' 표시 없이 넣기 (null이면 비우기) */
            putLoaded(k, v) { if (v === null || v === undefined) this._m.delete(k); else this._m.set(k, String(v)); },
            clear() { this._m.clear(); },
            toJSONString() {
                return '{' + this.keys().map(k => JSON.stringify(k) + ':' + this._m.get(k)).join(',') + '}';
            }
        };

        const drive = {
            client: null, token: null, expiresAt: 0,
            ready: false,      // 설정을 성공적으로 불러온 상태 (이때부터만 업로드 허용)
            local: false,      // 🏠 로그인 없이 이 브라우저 (js/devsave.js) : 드라이브와 똑같이 움직여요
            guest: false, uploading: false, needAuth: false, error: false, lastSaved: null,
            rootId: null, wiped: false,   // 🗑 이 창이 본 말랑달콤 폴더 · 지워진 걸 알아챈 뒤 (rootGone · rootReset : 더 올리지 않고 처음 상태로 다시 열기)
            gen: 0,            // 다시 불러오기 할 때마다 증가 (예전 요청의 결과가 뒤늦게 섞이는 것 방지)
            inflight: null,    // 지금 업로드 중인 키
            settingsFile: null, cafeFile: null, deskFile: null, deskOwnFile: null, gdOwnFile: null, deskSetFile: null,   // { id, modifiedTime } : 마지막으로 읽거나 쓴 때의 드라이브 파일 (두 기기 확인용)
            cafeBase: new Map(),         // ☕ 카페 기록 : 마지막으로 드라이브에서 읽거나 올린 값 (두 기기가 같은 항목을 고쳤을 때 합치는 기준)
            dayMeta: new Map(),          // 'diary_2026_10_09' → 읽거나 쓴 때의 드라이브 파일 수정 시각 ('' = 그때 파일이 없었음)
            full: false,                 // 구글 저장공간이 꽉 참
            dirtyKeys: new Set(),        // 아직 드라이브에 올리지 못한 변경 (날짜/설정 키)
            lazyOn: new Set(), lazyBusy: new Map(), lazyBad: new Set(),   // 💤 쓸 때 읽는 목록 파일 (KEY_FILES lazy · 도련 11-07) : 읽음 · 읽는 중 · 못 연 것(덮어쓰지 않아요)
            loadedDays: new Set(),       // 드라이브에서 이미 읽어 온 날짜 (없는 날짜도 '읽음' 처리)
            dayLoads: new Map(),         // 읽는 중인 날짜 요청
            folderIds: new Map(),        // 폴더 경로 → 폴더 id 캐시
            alive: new Map(),            // 폴더 id → 살아 있다고 본 시각 (도련 11-05 · 30초 안에 또 확인하지 않아요 · 요청 줄이기)
            folderBusy: new Map(), folderMiss: new Map(),   // folderMiss = 방금 없다고 본 폴더 (15초 · 처음 온 다꾸러 말랑달콤 폴더를 여러 번 묻지 않게 · 도련 11-06)
            monthIndex: new Map(),       // 'all' → { folderId, files: Map(파일명 → 파일정보) } : 📔 권 폴더마다 ('all:<권 id>')
            monthBusy: new Map(),
            books: new Map(), bookBusy: new Map(),   // 📕 권 id → { folderId, files } (monthIndex 와 같은 모양)
            get dirty() { return this.dirtyKeys.size > 0; }
        };
        let uploadTimer = null, dirtySince = 0;   // dirtySince : 아직 안 올린 첫 변경 시각 (UPLOAD_MAX_WAIT_MS)
        let uploadChain = Promise.resolve(true);
        let pendingToken = null;

        function markDirty(key) {
            if (drive.guest) { if (typeof LOCAL_TEST !== 'undefined' && LOCAL_TEST && typeof localTestSave === 'function') localTestSave(); updateBadge(); return; }
            drive.dirtyKeys.add(key);
            if (drive.ready) {
                if (!dirtySince) dirtySince = Date.now();
                clearTimeout(uploadTimer);
                uploadTimer = setTimeout(() => flushUpload(), Math.min(UPLOAD_DEBOUNCE_MS, Math.max(0, dirtySince + UPLOAD_MAX_WAIT_MS - Date.now())));
            }
            updateBadge();
        }

        /* ---------- 로그인 / 토큰 ---------- */
        function requestToken(prompt) {
            return new Promise((resolve, reject) => {
                if (!drive.client) return reject({ type: 'no_client' });
                const timer = setTimeout(() => { pendingToken = null; reject({ type: 'timeout' }); }, prompt === 'none' ? 8000 : 180000);
                pendingToken = {
                    ok: (r) => {
                        clearTimeout(timer); pendingToken = null;
                        if (!google.accounts.oauth2.hasGrantedAllScopes(r, ...DRIVE_SCOPES)) return reject({ type: 'scope' });
                        drive.token = r.access_token;
                        drive.expiresAt = Date.now() + ((r.expires_in || 3600) - 120) * 1000;
                        drive.needAuth = false;
                        try { localStorage.setItem(AUTH_FLAG_KEY, '1'); } catch (e) {}
                        resolve();
                    },
                    err: (e) => { clearTimeout(timer); pendingToken = null; reject(e || {}); }
                };
                drive.client.requestAccessToken({ prompt });
            });
        }

        async function ensureToken() {
            if (drive.local) { const er = new Error('auth'); er.code = 'auth'; throw er; }   // 🏠 이 브라우저 : 구글 계정이 필요한 서버 기능은 로그인해야 해요
            if (drive.token && Date.now() < drive.expiresAt) return;
            try { await requestToken('none'); }
            catch (e) {
                drive.needAuth = true; updateBadge();
                const err = new Error('auth'); err.code = 'auth'; throw err;
            }
        }

        async function gfetch(url, opts = {}, retried = false) {
            if (drive.madeDirs && drive.madeDirs.size && opts.method && (opts.method === 'DELETE' || /addParents|removeParents/.test(url) || (opts.method === 'PATCH' && !/uploadType=media/.test(url) && /"(trashed|name|parents)"/.test(String(opts.body || ''))))) drive.madeDirs.clear();   // 📁 지우기 · 휴지통 · 이름 · 옮기기 = 방금 만든 폴더 안 기억도 버려요 (다시 찾아요)
            if (drive.local && window.vfsFetch) return vfsFetch(url, opts);        // 🏠 로그인 없이 이 브라우저 : 드라이브 대신 (js/devsave.js)
            const get = !opts.method || opts.method === 'GET';
            if (get && !opts.fresh && window.DRC && DRC.on) { const c = await DRC.serve(url); if (c) return c; }   // ⚡ 이 기기에 둔 것 (js/drcache.js · 바뀐 것은 changes 로 이미 잊었어요)
            await ensureToken();
            const res = await fetch(url, Object.assign({}, opts, {
                headers: Object.assign({}, opts.headers || {}, { Authorization: 'Bearer ' + drive.token })
            }));
            if (res.status === 401 && !retried) { drive.token = null; return gfetch(url, opts, true); }
            if (res.ok && opts.method && opts.method !== 'GET' && /googleapis\.com\/(upload\/)?drive\/v3\/files/.test(url)) {   // 📱 이 창이 손댄 파일 = 내 것 (checkRemote 가 다른 기기 것과 나눠요)
                const m = /\/files\/([^/?]+)/.exec(url); if (m) mineIds.add(m[1]);
                let nid = '', wj = null; try { wj = await res.clone().json(); } catch (e) {}
                if (!m && wj && wj.id) { mineIds.add(wj.id); nid = wj.id; }
                if (window.DRC) { try { await DRC.wrote(url, opts, nid, wj); } catch (e) {} }   // ⚡ 쓴 파일 · 그 폴더 목록은 기억에서 잊어요 (js/drcache.js)
            } else if (res.ok && get && window.DRC && !drive.local) DRC.keep(url, res.clone()).catch(() => {});   // ⚡ 읽은 그대로 이 기기에 (다음에 켤 때 바뀐 것만 받게)
            /* 너무 자주 요청했거나(429 · 403 rateLimit) 구글이 잠깐 아플 때(5xx) : 1 · 2 · 4 · 8초 쉬고 다시 */
            const tries = opts._tries || 0;
            if (tries < 4 && !opts.keepalive && (res.status === 429 || res.status >= 500 || (res.status === 403 && /rate/i.test(await driveReason(res))))) {
                await new Promise(r => setTimeout(r, 1000 * 2 ** tries + Math.random() * 400));
                return gfetch(url, Object.assign({}, opts, { _tries: tries + 1 }), retried);
            }
            return res;
        }
        /* 구글이 알려 준 실패 이유 (storageQuotaExceeded · rateLimitExceeded …) */
        async function driveReason(res) {
            try { const j = await res.clone().json(); return (j && j.error && j.error.errors && j.error.errors[0] && j.error.errors[0].reason) || ''; } catch (e) { return ''; }
        }
        /* 실패 응답 → 에러 (404 = 'gone' : 그 사이 지워짐 · 공간 꽉 참 = 'full') */
        async function driveFail(res, what) {
            const er = new Error(what + ' ' + res.status);
            if (res.status === 404) er.code = 'gone';
            else if (res.status === 403 && /quota/i.test(await driveReason(res))) er.code = 'full';
            return er;
        }
        /* 드라이브 검색 글 안의 ' \ 는 앞에 \ 를 붙여요 */
        const qName = n => String(n).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        /* ---------- 폴더 / 파일 이름 규칙 ----------
           말랑달콤 / 날짜형바인더 / 2026 분홍 1 / 2026-09-10.json   (하루에 파일 1개, 같은 날은 항상 덮어쓰기) */
        const pad2 = n => String(n).padStart(2, '0');
        const dayFileName = d => d.cover ? '표지.json' : `${d.y}-${pad2(d.m)}-${pad2(d.d)}.json`;   // d = parseDayKey · parseDayFile 결과 · 권 폴더 안 (dyBookDir) · 📕 표지 = 표지.json
        const DAY_FILE_RE = /^(\d{4})-(\d{2})-(\d{2})\.json$/;
        function parseDayFile(n) { if (n === '표지.json') return { cover: true }; const r = DAY_FILE_RE.exec(n); return r ? { y: +r[1], m: +r[2], d: +r[3] } : null; }
        function dayKeyOf(y, m, d, b) { return `diary_${b}_${y}_${String(m).padStart(2, '0')}_${String(d).padStart(2, '0')}`; }   // b : 권 id
        const dayCoverKey = b => `diary_${b}_cover`;                         // 📕 날짜형 권 표지 (js/page.js getDateKey)
        const dayKeyAt = (r, b) => r.cover ? dayCoverKey(b) : dayKeyOf(r.y, r.m, r.d, b);   // parseDayFile 결과 → 키
        const dayLabel = d => d.cover ? '표지' : `${d.m}월 ${d.d}일`;
        function parseDayKey(k) { const r = DAY_KEY_RE.exec(k); return !r ? null : r[5] ? { b: r[1], cover: true } : { b: r[1], y: +r[2], m: +r[3], d: +r[4] }; }
        function isDayKey(k) { return DAY_KEY_RE.test(k); }
        function parsePageKey(k) { const r = PAGE_KEY_RE.exec(k); return r ? { b: r[1], n: +r[2] } : null; }
        const isPageKey = k => PAGE_KEY_RE.test(k), isBookKey = k => BOOK_KEY_RE.test(k), isStateKey = k => STATE_KEY_RE.test(k);
        const STATE_FILE = '상태.json';
        const isOwnFile = k => isDayKey(k) || isPageKey(k) || isBookKey(k) || isStateKey(k);    // 키 하나가 드라이브 파일 하나 (하루 · 장 · 다이어리.json)
        function keyLabel(k) { if (isStateKey(k)) return '다이어리 상태'; const d = parseDayKey(k); if (d) return dayLabel(d); const p = parsePageKey(k); return p ? (p.n ? `${p.n}페이지` : '표지') : '다이어리'; }
        function isSettingKey(k) { return (k.startsWith('diary_') || VAULT_KEYS.includes(k)) && !isDayKey(k); }
        /* 설정 키가 드라이브의 어느 파일로 가는지 : 'cafe' · 'split' · 'settings' */
        function keyFile(k) { if (CAFE_KEYS.includes(k)) return 'cafe'; for (const w of DESK_WHICH) if (DESK_FILE_KEYS[w].includes(k)) return w; return 'settings'; }
        /* 설정 파일 2개 : 어디에 · 무슨 이름으로 · drive 의 어느 칸에 기억 */
        const KEY_FILES = {
            settings: { path: SETTINGS_PATH, name: SETTINGS_FILE_NAME, prop: 'settingsFile' },
            cafe: { path: CAFE_PATH, name: CAFE_FILE_NAME, prop: 'cafeFile' },
            desk: { path: DESK_PATH, name: DESK_FILE_NAME, prop: 'deskFile' },     // 🪑 설정 / 배치1.json … = 자리 (책상 위 · 서랍 속 · 문구의 집 · 다이어리 · 봉투 · 도련 11-21 서랍장 파일을 합쳤어요)
            dkown: { path: dirPath(DIRS.desk), name: '_목록', prop: 'deskOwnFile', lazy: 1 },   // 🪑 백 = 소품 / _목록1.json · _목록2.json … (올리는 크기 55KB씩 · 도련 11-07 · 벽지 · 책상판도) // 🔐 가진 소품 전부 (보관함 포함 · 이게 '가진 것' · 도련 11-06) · 💤 앱을 켤 때 안 읽어요 = 책상은 배치.json 만으로 · 소품함 · 꾸미기 · 받기 · 버리기 때 (도련 11-07 · js/desk.js dkOwnReady)
            gdown: { path: dirPath(DIRS.gd), name: '_목록', prop: 'gdOwnFile' },   // 🔐 가진 문구 전부 = 백 문구 / _목록1.json … (올리는 크기 55KB씩 · 앱을 켤 때 읽어요 = 필기구 · 문구의 집 · 도련 11-07)
            deskset: { path: DESK_PATH, name: '책상설정', prop: 'deskSetFile' },  // ⚙ 기능 연결 · 벽지 · 책상판 · 받은 공유 번호
            dyown: { path: DIARY_PATH, name: '_목록', prop: 'dyOwnFile' },   // 📚 _목록1.json … (올리는 크기 55KB씩 · 도련 11-20 · 권 번호 · 규격 표 = _목록1)   // 🔐 백 = 다이어리 / _목록.json : 쓸 수 있는 권 하나에 한 줄 (날짜형 · 페이지형 · from · 도련 11-07 · 981 · 앱을 켤 때 읽어요 · js/dyown.js)
            bmown: { path: DIARY_PATH, name: '_바인더재료목록', prop: 'bmOwnFile', lazy: 1 },   // 📚 _바인더재료목록1.json … (올리는 크기 55KB씩 · 도련 11-20)   // 🧩 🔐 다이어리 / _바인더재료목록.json : 가진 표지 · 내지 재료 (두 칸 · 💤 조립 · 만들기 · 받을 때 · 도련 11-08 폴더 둘을 합쳤어요)
            esown: { path: dirPath(DIRS.emptyBook), name: '_목록', prop: 'esOwnFile', lazy: 1 },   // 📚 _목록1.json … (올리는 크기 55KB씩 · 도련 11-20)   // 📥 🔐 빈스티커첩 / _목록.json : 받았지만 아직 어느 스티커 정리에 쓸지 안 정한 📒 바인더 · 🤍 이형지북 (두 칸 · 불러오면 그 종류 _스티커첩.json 으로 · 💤 · 도련 11-08 · js/basket.js FR)
            bgown: { path: dirPath(DIRS.pattern), name: '_목록', prop: 'bgOwnFile', lazy: 1 },   // 📚 _목록1.json … (올리는 크기 55KB씩 · 도련 11-20)  // 🔐 가진 배경지 = 배경지 / _목록.json (도련 11-07 · 💤 앱을 켤 때 안 읽어요 · 🌈 배경지 창 · 샵 · 휴지통에서 쓸 때 keyFileLoad · 처음 온 다꾸러는 바뀔 때 처음 생겨요)

            me: { path: DESK_PATH, name: '_내정보', prop: 'meFile' }              // 🔐 잠금 · 별명 · 생년월일 · 연락처 (도련 11-06 · 개인정보)
        };

        /* 🔐 암호 보관 : 출석 · 화분 기록은 설정.json 에서 무엇인지 알아볼 수 없게 저장해요
           - 이름도 뜻 없는 글자 (VAULT_KEYS) · 내용은 뒤섞은 글자 + 앞 7자리 확인 표시
           - 누가 글자를 하나라도 고치면 확인 표시가 맞지 않아서 그 기록은 버리고 처음부터 (고칠 이유가 없게) */
        const VAULT_KEYS = ['zq7k2m', 'xr4p9w'];
        /* 🪑 책상배치 폴더 = 역할마다 파일 하나 (도련 11-06 · 예전엔 배치.json 하나에 목록 · 자리 · 설정이 다 있었어요) · 모두 🔐 계정 열쇠 · 바뀐 파일만 올라가요 (소품을 옮기면 배치.json 만) */
        const DESK_FILE_KEYS = {
            desk: ['diary_desk_pos', 'diary_gd_at', 'diary_desk_tape', 'diary_pencase', 'diary_desk_dy', 'diary_desk_bags', 'diary_desk_home', 'diary_desk_rv'],   // 📍 배치.json : 책상 위 소품 자리 · ✏️ 문구의 집 · 🎀 정리함에 꽂힌 롤 · 👝 보관함에서 펜꽂이에 꽂은 필기구 (도련 11-06) · 📔 책상 위 다이어리 · 🛍️ 봉투 · 상품을 넣은 소품
            dkown: ['diary_desk_own', 'diary_skin_own', 'diary_dk_gone'],   /* 소품 + 🧱 🪵 벽지 · 책상판 (지금 고른 것은 책상설정.json 'diary_desk_skin') */                                                                        // 🔐 _소품목록.json
            gdown: ['diary_gd_own', 'diary_gd_gone'],                                                                          // 🔐 문구 / _목록N.json
            deskset: ['diary_desk_fn', 'diary_desk_skin', 'diary_share_got'],                                 // ⚙ 책상설정.json
            dyown: ['diary_own', 'diary_book_n', 'diary_books', 'diary_dy_gone', 'diary_dy_bin'],   /* diary_books = 페이지형 규격 → 권 (982 · 여러 권을 잇는 표라 목록에) */                                                              // 🔐 다이어리 / _목록.json : 권마다 한 줄 · 날짜형 권 번호 (펼친 권 'diary_year' 는 설정.json · js/dyown.js)
            bmown: ['diary_cover_own', 'diary_refill_own'],                                                   // 🧩 다이어리 / _바인더재료목록.json (표지 · 내지)
            esown: ['diary_sbd_own', 'diary_rlb_own'],                                                        // 📥 빈스티커첩 / _목록.json (📒 바인더 · 🤍 이형지북)
            bgown: ['diary_bg_own', 'diary_bg_gone'],                                                                          // 🔐 배경지 / _목록.json (💤 lazy)

            me: ['diary_lock', 'diary_nick', 'diary_tojeong_birth', 'diary_fp_contacts']                      // 🔐 _내정보.json : 🔒 잠금(해시) · 별명 · 생년월일 · 전화기 연락처
        };
        const DESK_WHICH = Object.keys(DESK_FILE_KEYS), DESK_KEYS = [].concat(...Object.values(DESK_FILE_KEYS));
        const isDeskFile = w => DESK_WHICH.includes(w);
        /* 🚛 영구삭제 칸 (도련 11-11 · 상품은 버리면 쓰레기차 = 바로 영구 삭제 · 되살리기 없음) : 그 종류 목록 파일 안 🔐 { u: 상품 번호, at } · 영원히 남아요
           - '목록이 정답' : 두 기기 목록을 합칠 때 영구삭제 칸은 늘 양쪽을 모두 (지워지지 않아요) → 그 번호가 가진 목록에 남아 있으면 빼요 (영구삭제 > 휴지통 > 사용 중)
           - 📔 쓴 다이어리의 휴지통 칸 diary_dy_bin 도 같은 파일 (쓴 다이어리 = 기록이 묶여 있어 30일 · js/dyyear.js) */
        const GONE_OF = { dkown: { g: ['diary_dk_gone'], l: ['diary_desk_own', 'diary_skin_own'] }, gdown: { g: ['diary_gd_gone'], l: ['diary_gd_own'] }, dyown: { g: ['diary_dy_gone', 'diary_dy_bin'], l: ['diary_own'] }, bgown: { g: ['diary_bg_gone'], l: ['diary_bg_own'] } };
        const GONE_KEYS = ['diary_dk_gone', 'diary_gd_gone', 'diary_dy_gone', 'diary_bg_gone'];
        const goneArr = v => { if (typeof v === 'string') { try { v = JSON.parse(v); } catch (e) { v = null; } } return Array.isArray(v) ? v.filter(x => x && typeof x.u === 'string') : []; };
        function goneUnion(k, theirs) {                                            // 이 기기가 고친 영구삭제 칸 + 다른 기기 것 = 모두
            if (!GONE_KEYS.includes(k)) return false;
            const m = goneArr(store.getItem(k)), t = goneArr(theirs), seen = new Set(m.map(x => x.u)), add = t.filter(x => !seen.has(x.u));
            if (!add.length) return false;
            store.putLoaded(k, JSON.stringify(m.concat(add))); drive.dirtyKeys.add(k);   // 합친 것을 올려요
            return true;
        }
        /* 📒 장부 (도련 11-11 · 구글 드라이브의 숨은 앱 데이터 칸 = 사람 눈에 안 보이고 · 버전 되돌리기 · 다운로드했다 다시 올리기가 없어요)
             드라이브 파일은 사람이 '예전 진짜 파일'로 바꿔치기할 수 있어요 (버전 관리 · 받아 둔 파일 다시 올리기 · 예전 폴더 이름 되돌리기) → 영구삭제가 풀려요
             → 장부 = { root : 지금 쓰는 말랑달콤 폴더 번호, retired : [은퇴시킨 예전 폴더 번호], gone : { 'diary_dk_gone' …, 'own:seal' … : [{ u, at }] } }
             - 켤 때 먼저 읽고 (loadFromDrive) · 목록을 읽을 때마다 장부의 영구삭제를 다시 더해요 (goneScrub · js/own.js ownIdxRead) · 목록에만 있는 것도 장부에 (예전 사용자 · 다른 기기)
             - 은퇴한 폴더는 이름이 '말랑달콤'이어도 쓰지 않아요 (findFolder) · 하나만 남아도 새 폴더로 처음부터
             - 장부가 없으면 (처음 · 사용자가 구글 설정에서 앱 데이터를 지움) 지금 드라이브를 믿고 새로 · 기기 둘 = 쓸 때마다 다시 읽어 합쳐요 (지워지지 않아요)
             - 🏠 로그인 없이 · 👀 구경 = 장부 없어요 */
        const LEDGER_NAME = '장부.json', LG = { d: null, f: null, ok: false, t: 0, q: Promise.resolve() };
        const lgClean = d => {
            const o = { v: 1, root: '', retired: [], gone: {} }; if (!d || typeof d !== 'object') return o;
            if (typeof d.root === 'string') o.root = d.root;
            if (Array.isArray(d.retired)) o.retired = [...new Set(d.retired.filter(x => typeof x === 'string' && x))];
            if (d.gone && typeof d.gone === 'object') Object.keys(d.gone).forEach(k => { const a = goneArr(d.gone[k]); if (a.length) o.gone[k] = a; });
            return o;
        };
        function lgMerge(a, b) {                                                   // 두 장부 = 모두 (영구삭제 · 은퇴는 늘기만 · root 는 a 쪽)
            const o = lgClean(a), B = lgClean(b);
            if (!o.root) o.root = B.root;
            o.retired = [...new Set(o.retired.concat(B.retired))].filter(x => x !== o.root);
            Object.keys(B.gone).forEach(k => { const s = new Set((o.gone[k] || []).map(x => x.u)); o.gone[k] = (o.gone[k] || []).concat(B.gone[k].filter(x => !s.has(x.u))); });
            return o;
        }
        async function lgRead() {                                                  // → { d, f } (장부가 여럿이면 = 합치고 · 나머지는 지워요)
            const q = `name='${qName(LEDGER_NAME)}' and 'appDataFolder' in parents and trashed=false`;
            const r = await gfetch(`${DRIVE_API}?spaces=appDataFolder&q=${encodeURIComponent(q)}&orderBy=createdTime&fields=${encodeURIComponent('files(id,name)')}`);
            if (!r.ok) throw await driveFail(r, 'ledger');
            const fs = (await r.json()).files || [];
            let d = null;
            for (const f of fs) {                                                   // 🔐 장부도 잠가요 (드라이브의 json 은 모두 · 못 열면 에러 = 이번엔 장부 없이 · 덮어쓰지 않아요)
                const t = await gfetch(`${DRIVE_API}/${f.id}?alt=media`); if (!t.ok) throw await driveFail(t, 'ledger');
                let x = await t.text(); if (SEAL_RE.test(x)) x = await sealOpen(x);
                const o = x.trim() ? JSON.parse(x) : null; d = d ? lgMerge(d, o) : lgClean(o);
            }
            fs.slice(1).forEach(f => gfetch(`${DRIVE_API}/${f.id}`, { method: 'DELETE' }).catch(() => {}));
            return { d: lgClean(d), f: fs[0] ? fs[0].id : null };
        }
        async function ledgerLoad() {
            LG.ok = false; LG.d = null; LG.f = null;
            if (drive.local || !drive.token) return;                           // (로그인하는 동안은 아직 guest 표시예요 · 토큰으로 봐요)
            try { const r = await lgRead(); LG.d = r.d; LG.f = r.f; LG.ok = true; diag('ledger', { have: r.f ? 1 : 0, root: LG.d.root ? 1 : 0, ret: LG.d.retired.length, gone: Object.values(LG.d.gone).reduce((n, a) => n + a.length, 0) }); }
            catch (e) { console.warn('📒 장부를 못 읽었어요 (이번엔 장부 없이 · 지우지 않아요)', e); diag('ledger', { bad: 'read' }); }
        }
        const lgLive = () => LG.ok && !drive.local && !!drive.token;             // 👀 구경 · 로그아웃 = 토큰 없음
        function ledgerSave() {                                                    // 다시 읽어 합친 뒤 올려요 (기기 둘이 서로 지우지 않게)
            if (!lgLive()) return; clearTimeout(LG.t);
            LG.t = setTimeout(() => { LG.q = LG.q.then(async () => {
                if (!lgLive()) return;
                try {
                    const r = await lgRead(); const me = lgMerge(LG.d, r.d); if (LG.d.root) me.root = LG.d.root;
                    LG.d = me; LG.f = r.f || LG.f;
                    const body = await bodySeal(LEDGER_NAME, JSON.stringify(me));   // 🔐
                    if (LG.f) { const u = await gfetch(`https://www.googleapis.com/upload/drive/v3/files/${LG.f}?uploadType=media&fields=id`, { method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body }); if (u.ok) return; if (u.status !== 404) throw await driveFail(u, 'ledger'); LG.f = null; }
                    const b = 'lg_' + Math.random().toString(36).slice(2), meta = { name: LEDGER_NAME, mimeType: 'application/json', parents: ['appDataFolder'] };
                    const c = await gfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n--${b}--` });
                    if (!c.ok) throw await driveFail(c, 'ledger'); LG.f = (await c.json()).id;
                } catch (e) { console.warn('📒 장부 저장 (다음에 다시)', e); diag('ledger', { bad: 'save' }); setTimeout(ledgerSave, 60000); }
            }); }, 1500);
        }
        /* 🆕 초기화 (도련 11-21 · 1369 '구글에서 말랑달콤 폴더를 지우면 = 모든 걸 초기화하고 다시 시작' · 1366 freshStart 를 넓혔어요)
           말랑달콤 폴더가 없다 = 초기화 → 이 계정의 것을 모두 지우고 로그인도 풀어 처음 화면부터 (첫 접속자와 똑같아요)
           부르는 곳 = loadFromDrive : 말랑달콤 폴더가 없고 (drive.newbie) 숨은 장부에 예전 폴더 번호가 있을 때 (= 폴더가 있었다가 없어졌어요)
             · 쓰는 중에 폴더가 지워지면 (rootGone → rootReset) = 다시 열려서 여기로 와요
             · 처음 온 다꾸러는 장부가 없어서 그대로 (폴더는 처음 저장할 때 생겨요 · 그 전에 다시 열어도 초기화되지 않아요)
           지우는 것 (차례대로 · 장부를 못 지우면 아무것도 안 지우고 읽기 실패로 · 다음에 다시)
             📒 숨은 장부(appDataFolder) 파일 통째로 (구글드라이브에서 사용자 눈에 안 보이는 유일한 파일)
             ⚡ 드라이브 읽기 기억 · 🎀 스티커 목록 파일 번호 · 쓴 흔적 · 📝 완료 전 임시저장 · 📦 내 실물 사본 · 📚 읽어 둔 스티커 · 목록 · ⏳ 못 올린 것 (이 계정 것만)
             🔑 로그인 기억 → 처음 화면 (구글 · 로그인 없이를 다시 골라요)
           남기는 것 (도련 11-21) : 🏠 로그인 없이 쓴 다이어리 · 👤 게스트 (그 브라우저가 원본) · 다른 구글 계정 것 · ⚙ 이 기기 화면 기억 · 📦 앱 파일 · 서버(문구점 · 편지함 …)는 앱이 지울 수 없어요 */
        async function freshStart() {
            const w = (typeof COLL !== 'undefined' && COLL.who) || ''; diag('fresh', {});
            await lgKill();                                                         // 📒 못 지우면 = 여기서 멈춰요 (읽기 실패 · 아무것도 안 지웠어요)
            LG.d = lgClean(null); LG.f = null;
            if (window.DRC) { try { await DRC.wipe(); } catch (e) {} }
            if (window.ownFresh) ownFresh();
            try { clearPending(); const { forget } = await readAllPending(); await forget(); } catch (e) {}   // ⏳ 못 올린 옛 내용 (새 폴더로 안 올라가요)
            if (w && w !== 'me') for (const n of ['mallang-pgdraft', 'mallang-ppdraft', 'mallang-absort', 'mallang-ownpaper', 'malang-mine', 'mallang-coll']) await idbForgetWho(n, w);
            try { ['gdrive_authed', 'malang_dev_mode'].forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); } catch (e) {}   // 🔑 로그인 기억 (js/settings.js BC_LOGIN 과 같아요)
            drive.wiped = true;                                                     // 더 올리지 않아요
            await showMsg('☁ 구글 드라이브에 <b>말랑달콤</b> 폴더가 없어서<br><b>처음 상태로 초기화</b>했어요.<br><span style="font-size:12px;color:#777;">다시 로그인하면 새로 시작해요</span>');
            location.reload();
            await new Promise(() => {});                                            // 다시 열릴 때까지 더 읽지 않아요 (폴더 · 처음 선물을 만들지 않게)
        }
        async function lgKill() {                                                   // 📒 숨은 장부 파일 모두 지우기 (여럿이어도) · 실패 = 에러
            const q = `name='${qName(LEDGER_NAME)}' and 'appDataFolder' in parents and trashed=false`;
            const r = await gfetch(`${DRIVE_API}?spaces=appDataFolder&q=${encodeURIComponent(q)}&fields=${encodeURIComponent('files(id)')}`, { fresh: 1 });   // 기억 말고 드라이브에 바로
            if (!r.ok) throw await driveFail(r, 'ledger');
            for (const f of ((await r.json()).files || [])) { const d = await gfetch(`${DRIVE_API}/${f.id}`, { method: 'DELETE' }); if (!d.ok && d.status !== 404) throw await driveFail(d, 'ledger'); }
        }
        function idbForgetWho(n, w) {                                               // 그 DB 에서 이 계정 것만 (열쇠 또는 값.who 에 계정 번호) · 없는 DB 는 만들지 않아요
            return new Promise(ok => {
                let r; try { r = indexedDB.open(n); } catch (e) { ok(); return; }
                r.onupgradeneeded = () => { try { r.transaction.abort(); } catch (e) {} };   // 처음 여는 DB = 없던 것 → 만들지 않고 그만
                r.onerror = r.onblocked = () => ok();
                r.onsuccess = () => {
                    const d = r.result, st = [...d.objectStoreNames].filter(x => n !== 'mallang-coll' || x !== 'local');   // 📚 모음 = 이 계정 것 모두 (👤 게스트 'local' 은 그대로)
                    if (!st.length) { d.close(); ok(); return; }
                    try {
                        const t = d.transaction(st, 'readwrite');
                        st.forEach(x => { const c = t.objectStore(x).openCursor(); c.onsuccess = () => { const q = c.result; if (!q) return; const v = q.value; if (String(q.key).includes(w) || (v && typeof v === 'object' && String(v.who || '').includes(w))) q.delete(); q.continue(); }; });
                        t.oncomplete = t.onerror = t.onabort = () => { d.close(); ok(); };
                    } catch (e) { d.close(); ok(); }
                };
            });
        }
        /* 영구삭제 칸 하나 ↔ 장부 : 장부에만 있는 것 = 돌려받고 · 칸에만 있는 것 = 장부에 → 합친 칸 */
        function ledgerMix(key, arr) {
            const a = goneArr(arr); if (!lgLive()) return a;
            const L = LG.d.gone[key] || [], s = new Set(a.map(x => x.u)), back = L.filter(x => !s.has(x.u)), sl = new Set(L.map(x => x.u)), add = a.filter(x => !sl.has(x.u));
            if (add.length) { LG.d.gone[key] = L.concat(add); ledgerSave(); }
            if (back.length) diag('ledgerBack', { k: key, n: back.length });       // 🧾 예전 파일로 바꿔치기 · 예전 폴더 (영구삭제를 다시 더해요)
            return back.length ? a.concat(back) : a;
        }
        function ledgerRoot(id) {                                                   // 지금 쓰는 말랑달콤 폴더
            if (!lgLive() || !id || LG.d.root === id) return;
            LG.d.root = id; LG.d.retired = LG.d.retired.filter(x => x !== id); ledgerSave();
        }
        function ledgerRetire(ids) { if (!lgLive()) return; LG.d.retired = [...new Set(LG.d.retired.concat(ids))].filter(x => x !== LG.d.root); ledgerSave(); }
        window.ledgerMix = ledgerMix; window.ledgerInfo = () => (LG.ok ? JSON.parse(JSON.stringify(LG.d)) : null);
        window.ledgerFlush = async () => { if (!LG.ok) return; ledgerSave(); await new Promise(ok => setTimeout(ok, 1700)); await LG.q; };   // 🧪 시험용 (기다렸다 저장까지)
        function goneScrub(which) {                                                // 가진 목록에 남은 영구삭제 · 휴지통 번호를 빼요 (오래된 기기가 덮어쓴 것)
            const G = GONE_OF[which]; if (!G) return;
            G.g.forEach(k => { if (!GONE_KEYS.includes(k) || !lgLive()) return; const cur = goneArr(store.getItem(k)), all = ledgerMix(k, cur); if (all.length > cur.length) goneUnion(k, all); });   // 📒 장부의 영구삭제도 (바꿔치기한 예전 파일)
            const ids = new Set(); G.g.forEach(k => goneArr(store.getItem(k)).forEach(x => ids.add(x.u)));
            if (!ids.size) return;
            G.l.forEach(k => {
                let v = null; try { v = JSON.parse(store.getItem(k)); } catch (e) {}
                if (!Array.isArray(v)) return;
                const n = v.filter(x => !(x && ids.has(typeof x.u === 'string' ? x.u : x.id)));
                if (n.length !== v.length) { store.setItem(k, JSON.stringify(n)); if (window.diag) diag('goneScrub', { k, n: v.length - n.length }); }
            });
        }
        const DESK_START = DESK_WHICH.filter(w => !KEY_FILES[w].lazy && KEY_FILES[w].path === DESK_PATH);   // 🪑 설정 폴더 = 한 번에 찾아요 (배치 · 책상설정 · 내정보)
        const DESK_START2 = DESK_WHICH.filter(w => !KEY_FILES[w].lazy && !DESK_START.includes(w));   // 🚀 켤 때 읽는 백 목록 (✏️ 문구 · 📔 다이어리 · 설정 폴더 밖 · 동시에)          // 🚀 앱을 켤 때 읽는 것 (설정 폴더 · 💤 lazy 는 빼요 · 도련 11-07)
        const CAFE_KEYS = VAULT_KEYS.concat(['diary_cycle', 'diary_dday', 'diary_psy', 'diary_arcade_best']);   // 📒 기록.json 으로 가는 키
        const VAULT_SALT = 'mL4q!z9Rw2';
        function vaultHash(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36).padStart(7, '0').slice(-7); }
        function vaultMix(bytes) {
            let s = parseInt(vaultHash(VAULT_SALT), 36) || 1;
            return bytes.map(b => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return b ^ (s & 255); });
        }
        function vaultSeal(obj) {
            const bytes = vaultMix(Array.from(new TextEncoder().encode(JSON.stringify(obj))));
            const b64 = btoa(String.fromCharCode.apply(null, bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            return vaultHash(VAULT_SALT + b64) + b64;
        }
        function vaultOpen(text) {
            if (typeof text !== 'string' || text.length < 8) return null;
            const chk = text.slice(0, 7), b64 = text.slice(7);
            if (vaultHash(VAULT_SALT + b64) !== chk) return null;                     // 누가 고쳤어요 → 버리기
            try {
                const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
                const bytes = vaultMix(Array.from(bin, c => c.charCodeAt(0)));
                return JSON.parse(new TextDecoder().decode(new Uint8Array(bytes)));
            } catch (e) { return null; }
        }
        /* 읽기 · 쓰기 (로그인 → 드라이브 설정 / 게스트 → 이 기기) */
        function vaultGet(key, sync) {
            try { const raw = sync ? store.getItem(key) : drive.guest ? localStorage.getItem(key) : null; /* 고르기 전엔 브라우저 옛 기억을 안 읽어요 */ return raw ? vaultOpen(JSON.parse(raw)) : null; } catch (e) { return null; }
        }
        function vaultPut(key, obj, sync) {
            const t = JSON.stringify(vaultSeal(obj));
            try { if (sync) store.setItem(key, t); else if (drive.guest) localStorage.setItem(key, t); } catch (e) {}
        }
        /* 💾 설정 하나 읽기 · 쓰기 (도련 10-30 · 인수인계서 '드라이브가 기준 · localStorage 는 게스트 · 기기 설정만')
           - 로그인 = 드라이브(설정.json · 배치.json …)만 · 브라우저에는 사본을 남기지 않아요 (드라이브를 지워도 옛 기억이 되살아나던 것)
           - 게스트 = 이 기기 브라우저만 · 로그인 · 게스트를 고르기 전에는 처음 값 (읽은 뒤 applyLoadedData 가 다시 그려요)
           - 앱이 갑자기 꺼져 못 올린 것은 따로 (gdrive_pending_backup · 계정 확인 · 올리면 지움) */
        function prefGet(key, local) {
            let v = null;
            if (drive.ready && !drive.guest) { try { v = store.getItem(key); } catch (e) {} }
            else if (drive.guest) { try { v = localStorage.getItem(local); } catch (e) {} }
            if (v === null) return null;
            try { return JSON.parse(v); } catch (e) { return v; }
        }
        function prefSet(key, local, val) {
            const t = JSON.stringify(val);
            try { if (drive.ready && !drive.guest) store.setItem(key, t); } catch (e) {}
            if (drive.guest) try { localStorage.setItem(local, t); } catch (e) {}
        }
        /* ✏️ 내 닉네임 (배경지 · 공유 · 인형 · 인형극 '만든 사람' 칸에 미리 채워요) */
        const NICK_KEY = 'diary_nick', NICK_LOCAL = 'malang_pattern_nick';
        function nickGet() { const v = prefGet(NICK_KEY, NICK_LOCAL); return typeof v === 'string' ? v : ''; }
        function nickSet(v) { if (v) prefSet(NICK_KEY, NICK_LOCAL, String(v)); }
        /* ✋ 쓰는 손 (도련 · 10-17) : 왼손 · 오른손 중 골라요 → 필기구 · 핀셋 · 🗑 삭제 · 스티커 칼이 그쪽 손에 든 모양으로 누워요 (끝 = 손끝은 그대로)
           저장: 설정.json 'diary_hand' ('left' | 'right') · 게스트는 이 기기 'malang_hand' */
        const HAND_KEY = 'diary_hand', HAND_LOCAL = 'malang_hand';
        let handL = null;
        function handLeft() { if (handL === null) handL = prefGet(HAND_KEY, HAND_LOCAL) === 'left'; return handL; }
        const handFlip = () => handLeft() ? ' scaleX(-1)' : '';                // 도구 끝을 기준으로 좌우를 뒤집어요
        function handSet(v) { prefSet(HAND_KEY, HAND_LOCAL, v === 'left' ? 'left' : 'right'); handL = v === 'left'; handRender(); }
        function handLoad() { handL = null; handRender(); }
        function handRender() { const l = handLeft(); document.querySelectorAll('#handPick [data-v]').forEach(b => b.classList.toggle('on', (b.dataset.v === 'left') === l)); }
        function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
        function dayPathText(date) {                                       // 안내문용 : 맨 위 폴더 이름은 빼요 (도련 · 2026-10-13)
            const dk = window.dkPath && dkPath(date); if (dk) return dk;     // 📕 유한 다이어리 장 (js/skins.js)
            const k = parseDayKey(getDateKey(date)); if (!k) return '';
            return `${dyBookDir(k.b).slice(1).join('/')}/${dayFileName(k)}`;
        }
        function corruptError(what) { const er = new Error('corrupt'); er.type = 'corrupt'; er.what = what; return er; }

        /* ---------- 드라이브 기본 동작 ---------- */
        const DRIVE_PARENT_DEFAULT = USE_APP_DATA_FOLDER ? 'appDataFolder' : 'root';
        const DRIVE_SPACE = USE_APP_DATA_FOLDER ? '&spaces=appDataFolder' : '';

        async function driveList(query, fields, fresh) {                      // fresh = 기억(js/drcache.js) 말고 드라이브에 바로 (두 기기 합치기 확인처럼 지금 모습이 꼭 필요할 때)
            let files = [], pageToken = '';
            do {
                const url = `${DRIVE_API}?q=${encodeURIComponent(query)}${DRIVE_SPACE}&orderBy=createdTime&pageSize=1000`
                    + `&fields=${encodeURIComponent('nextPageToken,files(' + fields + ')')}` + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
                const res = await gfetch(url, fresh ? { fresh: 1 } : {});
                if (!res.ok) throw await driveFail(res, 'list');
                const j = await res.json();
                files = files.concat(j.files || []);
                pageToken = j.nextPageToken || '';
            } while (pageToken);
            return files;
        }

        async function readFileText(id) {
            const res = await gfetch(`${DRIVE_API}/${id}?alt=media`);
            if (!res.ok) throw await driveFail(res, 'read');
            const t = await res.text();
            return SEAL_RE.test(t) ? sealOpen(t) : t;                         // 🔐 잠긴 json 은 열어서 글로 (도련 11-11)
        }
        /* 🔐 드라이브에 저장되는 모든 json 은 잠가요 (도련 11-11 · 사용자가 열어 보거나 고칠 수 없게) : 계정 열쇠 (🏠 로그인 없이 = 'device' · js/own.js ownSealText)
             - 올릴 때 (driveUpsert) 잠그고 · 읽을 때 (readFileText) 열어요 → 일기 · 휴지통 · 인형 · 인형극 · 도안 · 설정 · 검색 … 부르는 쪽은 그대로
             - 이미 잠긴 것 (ownLock {"v":1,"d"} · 스티커 · 목록 …) 은 그대로 · 못 열면 'corrupt' (덮어쓰지 않아요)
             - 예전에 글 그대로 저장한 파일은 sealOld 가 조금씩 잠가요 (잠근 뒤 다시 읽어 같은지 확인 · 다르면 원래대로) */
        const SEAL_RE = /^\{"mlk":1,"d":"/, LOCK_RE = /^\{"v":1,"d":"[A-Za-z0-9+/=]*"\}$/;
        async function sealWho() { if (typeof COLL !== 'undefined' && COLL.who && COLL.who !== 'guest') return COLL.who; return typeof collWhoami === 'function' ? collWhoami() : 'me'; }
        async function sealOpen(t) {
            try { return await ownOpenText(t, await sealWho()); }
            catch (e) {                                                            // 계정이 바뀐 사이일 수 있어요 → 한 번 다시 묻고
                if (typeof collWhoami !== 'function') throw e;
                const w = await collWhoami().catch(() => ''); if (!w) throw e;
                try { return await ownOpenText(t, w); } catch (x) { diag('sealBad', {}); throw x; }
            }
        }
        /* 🔐 예전 파일 잠그기 (도련 11-11) : 로그인한 뒤 뒤에서 조금씩 (한 번에 40개) · 앞 몇 글자만 보고 글 그대로인 json 만
             잠근 글이 열리는지 먼저 확인 → 올리기 → 다시 읽어 원래 글과 같은지 확인 (다르면 원래 글로 되돌려요 · 일기를 잃지 않게)
             그새 고친 파일 (수정 시각이 바뀜) · 이 기기에 아직 안 올린 것이 있으면 건너뛰어요 (다음에) · 다 잠근 뒤엔 30일에 한 번만 다시 봐요 */
        let sealOldBusy = false;
        async function sealOld() {
            if (sealOldBusy || !drive.ready || drive.guest || !window.ownSealText) return;
            const who = await sealWho(), LS = 'malang_sealold';
            let m = lsGet(LS, {}) || {};   /* 🧰 js/util.js */
            if (m[who] && Date.now() - m[who] < 30 * 864e5) return;
            sealOldBusy = true;
            let left = false, done = 0;
            try {
                const fs = (await driveList(`mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,parents,modifiedTime')).filter(f => /\.json$/i.test(f.name || ''));
                let i = 0;
                const peek = async f => { const r = await gfetch(`${DRIVE_API}/${f.id}?alt=media`, { headers: { Range: 'bytes=0-15' } }); if (!r.ok && r.status !== 206) return null; return (await r.text()).trim(); };
                const plain = [];
                await Promise.all(Array.from({ length: 4 }, async () => {
                    while (i < fs.length) { const f = fs[i++]; const h = await peek(f).catch(() => null); if (h && !/^\{"mlk":1/.test(h) && !/^\{"v":1,"d":"/.test(h)) plain.push(f); }
                }));
                for (const f of plain) {
                    if (done >= 40 || drive.dirtyKeys.size || !drive.ready || drive.guest) { left = true; break; }
                    const r = await gfetch(`${DRIVE_API}/${f.id}?alt=media`); if (!r.ok) continue;
                    const t = await r.text(); if (!t.trim() || SEAL_RE.test(t) || LOCK_RE.test(t)) continue;
                    const sealed = await ownSealText(t, who);
                    if (await ownOpenText(sealed, who) !== t) { diag('sealOld', { bad: 'open', name: f.name }); continue; }
                    const meta = await driveMeta(f.id); if (!meta || meta.modifiedTime !== f.modifiedTime) { left = true; continue; }   // 그새 고쳤어요 → 다음에
                    await driveUpsert((f.parents || [])[0], f.name, f.id, sealed, true);
                    let back = null; try { back = await readFileText(f.id); } catch (e) {}
                    if (back !== t) { await driveUpsert((f.parents || [])[0], f.name, f.id, t, true); diag('sealOld', { bad: 'back', name: f.name }); continue; }   // 🛟 원래 글로
                    done++;
                }
                if (!left) { m[who] = Date.now(); try { localStorage.setItem(LS, JSON.stringify(m)); } catch (e) {} }
                if (done) diag('sealOld', { n: done, left: left ? 1 : 0 });
            } catch (e) { console.warn('🔐 예전 파일 잠그기 (다음에 다시)', e); }
            finally { sealOldBusy = false; }
            if (left) setTimeout(sealOld, 60000);
        }
        async function bodySeal(name, body) {
            if (typeof body !== 'string' || !/\.json$/i.test(String(name || '')) || !window.ownSealText) return body;
            const t = body.trim(); if (!t || SEAL_RE.test(t) || LOCK_RE.test(t)) return body;
            return ownSealText(body, await sealWho());
        }
        /* 파일 정보만 (내용 X) : 휴지통에 있거나 없어졌으면 null */
        async function driveMeta(id, fresh) {                                    // fresh = 기억(js/drcache.js) 말고 드라이브에 바로 (새 파일을 만들 폴더가 살아 있는지)
            const res = await gfetch(`${DRIVE_API}/${id}?fields=id,name,modifiedTime,trashed,size`, fresh ? { fresh: 1 } : {});
            if (res.status === 404) return null;
            if (!res.ok) throw await driveFail(res, 'meta');
            const f = await res.json();
            return f.trashed ? null : f;
        }
        /* 폴더 안에서 이름으로 파일 찾기 (같은 이름이 여럿이면 먼저 만든 것) */
        async function findFile(folderId, name) {
            const made = drive.madeDirs && drive.madeDirs.get(folderId);         // 📁 이 창에서 방금 만든 폴더 = 안에 무엇이 있는지 알아요 (찾지 않아요 · 도련 11-18 요청 줄이기)
            if (made) return made.get(name) || null;
            const fs = await driveList(`name='${qName(name)}' and '${folderId}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime,size');
            return fs[0] || null;
        }

        /* 빈 파일이면 null, 읽을 수 없는 내용이면 corrupt 에러(→ 절대 덮어쓰지 않음) */
        function parseJsonObject(text, what) {
            if (!text.trim()) return null;
            let obj;
            try { obj = JSON.parse(text); } catch (e) { throw corruptError(what); }
            if (!obj || typeof obj !== 'object') throw corruptError(what);
            return obj;
        }

        async function findFolder(name, parentId) {
            let files = await driveList(`name='${qName(name)}' and mimeType='${FOLDER_MIME}' and '${parentId || DRIVE_PARENT_DEFAULT}' in parents and trashed=false`, 'id,name,createdTime');
            if (!parentId && name === TOP_FOLDER_NAME && LG.ok && LG.d.retired.length) {   // 📒 은퇴한 예전 폴더 = 이름을 '말랑달콤'으로 되돌려도 안 써요 (하나만 남아도 = 새 폴더로)
                const R = new Set(LG.d.retired), n = files.length; files = files.filter(f => !R.has(f.id));
                if (files.length < n) diag('rootRetired', { n: n - files.length });
            }
            if (files.length > 1 && !parentId && name === TOP_FOLDER_NAME) { const pick = await rootPick(files); if (pick) return pick; }   // 🗂 맨 위 말랑달콤이 둘 = 휴지통에서 되살린 예전 폴더일 수 있어요 (도련 11-11 · 아래)
            if (files.length > 1) { diag('dup', { name, n: files.length, ids: files.map(f => f.id).join(',') }); mergeFolders(files[0].id, files.slice(1).map(f => f.id)); }   // 두 기기가 동시에 만든 같은 폴더 → 먼저 만든 쪽으로 합치기 (기다리지 않음)
            return files[0] ? files[0].id : null;
        }
        /* 🗂 맨 위 '말랑달콤' 이 둘 이상 (도련 11-11 : 구글 드라이브 휴지통에서 예전 폴더를 '복원'하면 이름이 같아 섞여요 · 복원은 구글 버튼이라 못 막아요)
           - 몇 분 사이에 함께 생긴 폴더 = 두 기기가 동시에 만든 것 · 새 폴더가 방금(10분 안) 생겼다 = 드라이브가 늦어 실수로 만든 빈 폴더 → 예전처럼 먼저 만든 쪽으로 합쳐요 (null)
           - 새 폴더를 10분 넘게 써 왔는데 훨씬 오래된 폴더가 또 있다 = 되살린 예전 폴더 → 물어봐요 (앱 혼자 정하지 않아요 · 지우지 않아요)
             [지금 폴더만 쓰기] = 예전 폴더 이름을 '말랑달콤_예전_월일' 로 바꿔요 (안의 것은 그대로 · 앱은 더 안 봐요 · 이름을 되돌리면 원래대로)
             [둘을 합치기] → 한 번 더 확인 → 예전처럼 합치기 / 취소 · 창 닫기 = 이번엔 지금 폴더만 쓰고 아무것도 안 바꿔요 (다음에 또 물어요) */
        let rootPickP = null;
        function rootPick(files) {
            if (rootPickP) return rootPickP;
            const T = f => Date.parse(f.createdTime || 0) || 0, L = files.slice().sort((a, b) => T(a) - T(b)), M10 = 10 * 60 * 1000;
            const cur = (LG.ok && L.find(f => f.id === LG.d.root)) || L[L.length - 1], olds = L.filter(f => f !== cur);   // 📒 지금 폴더 = 장부에 적힌 폴더 (없으면 가장 나중에 만든 것)
            { const nw = L[L.length - 1]; if (T(nw) - T(L[0]) < M10 || Date.now() - T(nw) < M10) return Promise.resolve(null); }   // 쌍둥이 · 방금 생긴 폴더 = 합치기 (예전 그대로)
            rootPickP = (async () => {
                const day = d => { const x = new Date(d); return `${x.getFullYear()}.${x.getMonth() + 1}.${x.getDate()}`; };
                diag('rootDup', { n: files.length, cur: cur.id, olds: olds.map(f => f.id).join(',') });
                const ask = window.showAsk;
                let only = true;
                if (ask) {
                    only = await ask(`🗂 구글 드라이브에 <b>'말랑달콤' 폴더가 ${files.length}개</b> 있어요.<br><span style="font-size:13px;color:#777;">${olds.map(f => day(T(f))).join(' · ')}에 만든 예전 폴더가 있어요. 구글 드라이브 휴지통에서 되살린 폴더 같아요.</span><br><br>지금 쓰는 폴더(${day(T(cur))}에 만든 것)만 쓸까요?<br><span style="font-size:12px;color:#888;">예전 폴더는 지우지 않고 이름만 '말랑달콤_예전'으로 바꿔 따로 둬요.</span>`, '지금 폴더만 쓰기', '둘을 합치기');
                    if (!only && await ask('⚠ 둘을 합치면 <b>예전 폴더의 상품 · 일기가 지금 것과 섞여요.</b><br>그래도 합칠까요?', '합치기', '취소')) { diag('rootDup', { pick: 'merge' }); return null; }   // 이번엔 다시 묻지 않아요 (예전처럼 합쳐요)
                }
                if (only || !ask) {
                    const md = (() => { const x = new Date(); return String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0'); })();
                    for (let i = 0; i < olds.length; i++) {
                        const nm = TOP_FOLDER_NAME + '_예전_' + md + (olds.length > 1 ? '_' + (i + 1) : '');
                        ledgerRetire([olds[i].id]);                                  // 📒 은퇴 (이름을 되돌려도 다시 쓰지 않아요)
                        try { const r = await gfetch(`${DRIVE_API}/${olds[i].id}?fields=id`, { method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ name: nm }) }); if (!r.ok) throw await driveFail(r, 'rename'); diag('rootDup', { renamed: olds[i].id, to: nm }); }
                        catch (e) { console.warn('예전 말랑달콤 폴더 이름을 못 바꿨어요 (이번엔 지금 폴더만 써요):', e); }
                    }
                } else diag('rootDup', { pick: 'keepCur' });                   // 합치기 취소 = 이번엔 지금 폴더만 (아무것도 안 바꿔요)
                return cur.id;
            })();
            rootPickP.catch(() => { rootPickP = null; });
            return rootPickP;
        }
        /* 🗑 앱 휴지통 (도련 11-11 : 앱에서 지운 건 모두 앱 휴지통 · 구글 휴지통에 넘기지 않아요 · js/trash.js appTrash) : why 'u' 사용자 것 (🗑 화면) · 'a' 앱이 정리한 중복 (숨김) */
        const toTrash = (id, path, why, old) => window.appTrash ? appTrash(id, path || '', why || 'u', old) : driveTrash(id);
        const driveKill = id => gfetch(`${DRIVE_API}/${id}`, { method: 'DELETE' }).then(r => { if (!r.ok && r.status !== 404) throw new Error('delete ' + r.status); });   // 🔥 영구 삭제 (빈 폴더처럼 담을 게 없는 것)
        /* 같은 이름 폴더 합치기 : 나중 폴더 안의 것을 모두 먼저 폴더로 옮기고, 빈 폴더는 영구 삭제 (11-11)
           (옮긴 것 중 또 같은 이름 폴더가 생기면 그 폴더를 열 때 다시 합쳐져요) */
        const folderMerging = new Set();
        async function mergeFolders(keepId, otherIds) {
            for (const id of otherIds) {
                if (folderMerging.has(id)) continue;
                folderMerging.add(id);
                try {
                    /* 🛟 드라이브는 방금 만든 파일이 목록에 늦게 나올 때가 있어요 → 옮긴 뒤 조금 기다렸다 다시 보고, 두 번 연달아 비어 있을 때만 휴지통으로 (도련 11-06 · 목록 파일이 든 폴더째 휴지통에 들어가던 것) */
                    let empty = 0, diagMoved = 0;
                    for (let round = 0; round < 6 && empty < 2; round++) {
                        if (round) await new Promise(r => setTimeout(r, 4000));
                        const kids = await driveList(`'${id}' in parents and trashed=false`, 'id');
                        if (!kids.length) { empty++; continue; }
                        empty = 0;
                        for (const k of kids) {
                            const res = await gfetch(`${DRIVE_API}/${k.id}?addParents=${keepId}&removeParents=${id}&fields=id`, {
                                method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: '{}'
                            });
                            if (!res.ok) throw await driveFail(res, 'move');
                            diagMoved++;
                        }
                    }
                    if (empty < 2) throw new Error('folder not empty yet');           // 아직 남은 게 있으면 휴지통에 넣지 않아요 (다음에 열 때 다시 합쳐요)
                    diag('merge', { id, keep: keepId, moved: diagMoved, del: 1 });
                    await driveKill(id);                                        // 두 번 확인한 빈 폴더 = 담을 게 없어요
                    drive.monthIndex.clear();                               // 옮겨진 일기가 다시 보이도록
                } catch (e) { console.warn('같은 이름 폴더를 합치지 못했어요:', e); diag('mergeFail', { id, keep: keepId, err: String(e && e.message || e).slice(0, 60) }); }
                finally { folderMerging.delete(id); }
            }
        }

        async function createFolder(name, parentId) {
            const res = await gfetch(`${DRIVE_API}?fields=id,modifiedTime`, {
                method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId || DRIVE_PARENT_DEFAULT] })
            });
            if (!res.ok) throw await driveFail(res, 'mkdir');
            return mineWrote(await res.json()).id;
        }

        /* names = ['말랑달콤','설정'] / ['말랑달콤','날짜형바인더'] … (늘 말랑달콤 바로 아래 한 칸 · 도련 10-26)
           create=false : 있으면 찾기만 (읽을 때) / create=true : 없으면 만들기 (저장할 때) */
        async function getFolder(names, create) {
            const key = names.join('/');
            if (drive.folderIds.has(key)) return drive.folderIds.get(key);
            if (!create && drive.folderMiss.has(key) && Date.now() - drive.folderMiss.get(key) < 15000) return null;   // 🔁 방금 없던 폴더 (도련 11-06)
            const busyKey = key + '|' + (create ? 1 : 0);
            if (drive.folderBusy.has(busyKey)) return drive.folderBusy.get(busyKey);
            const p = (async () => {
                let parentId = null;
                if (names.length > 1) {
                    parentId = await getFolder(names.slice(0, -1), create);
                    if (!parentId) return null;
                }
                const name = names[names.length - 1];
                const miss = drive.folderMiss.has(key) && Date.now() - drive.folderMiss.get(key) < 15000;   // 방금 없던 폴더 = 바로 만들어요 (만든 뒤 한 번 더 찾아서 둘이 되지 않게 · 도련 11-06)
                let id = miss ? null : await findFolder(name, parentId);
                if (!id && create) {
                    id = await createFolder(name, parentId);
                    if (id) (drive.madeDirs = drive.madeDirs || new Map()).set(id, new Map());   // 빈 폴더 (그 안에 만드는 파일은 driveUpsert 가 적어요)
                    diag('mkdir', { p: key, id, miss: miss ? 1 : 0 });
                    /* 📱 한 기기 기준 (도련 11-17) : 만든 뒤 '다른 기기도 만들었나' 다시 찾기는 없앴어요 (폴더마다 요청 1번 · 처음 접속) · 그래도 둘이 되면 다음에 찾을 때 findFolder 가 먼저 만든 쪽으로 합쳐요 */
                }
                if (id) { drive.folderIds.set(key, id); drive.alive.set(id, Date.now()); drive.folderMiss.delete(key); }   // 방금 찾거나 만든 폴더 = 살아 있어요
                else if (!create) drive.folderMiss.set(key, Date.now());
                if (id && key === TOP_FOLDER_NAME) { drive.rootId = id; ledgerRoot(id); }   // 🗑 말랑달콤 폴더가 지워졌는지 볼 때 (rootGone) · 📒 장부에 지금 폴더
                return id || null;
            })();
            drive.folderBusy.set(busyKey, p);
            try { return await p; } finally { drive.folderBusy.delete(busyKey); }
        }

        /* 📔 그 권 폴더의 파일 목록을 한 번만 가져와 기억 (한 권에 모든 날) → 날짜마다 목록 조회 없이 바로 읽음
           - 예전 이름(getMonthIndex)은 그대로 · 어느 달을 물어도 같은 목록 (파일 이름에 날짜가 다 들어 있어요)
           - 이름으로 걸러 찾지 않고 폴더를 통째로 읽어요 (이름 검색은 빠뜨릴 수 있어서 · 빠뜨리면 같은 날 파일을 또 만들어요) */
        function dayIdxOf(folderId, files) {
            const e = { folderId, files: new Map(), dups: new Map() };
            files.forEach(f => {                                                         // 같은 이름이 여러 개면 가장 오래된 것을 쓰고, 나머지는 dups 에 (dayDupFix 가 하나로 정리)
                if (!e.files.has(f.name)) e.files.set(f.name, f);
                else { const a = e.dups.get(f.name) || [e.files.get(f.name)]; a.push(f); e.dups.set(f.name, a); }
            });
            return e;
        }
        async function getMonthIndex(y, m, create, b) {                    // b : 📔 권 id (없으면 지금 펼친 권) · 그 권 폴더의 모든 날
            b = b || (window.dyyBookId ? dyyBookId() : ''); if (!b) return null;
            const key = 'all:' + b;
            let entry = drive.monthIndex.get(key);
            if (entry) return entry;
            if (drive.monthBusy.has(key)) {
                entry = await drive.monthBusy.get(key);
                if (entry || !create) return entry;
            }
            const p = (async () => {
                const folderId = await getFolder(dyBookDir(b), create);
                if (!folderId) return null;
                const files = await driveList(`'${folderId}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime,size');
                const e = dayIdxOf(folderId, files);
                drive.monthIndex.set(key, e);
                return e;
            })();
            drive.monthBusy.set(key, p);
            try { return await p; } finally { drive.monthBusy.delete(key); }
        }

        function resetDriveCaches() {
            if (drive.madeDirs) drive.madeDirs.clear();
            drive.folderIds.clear(); drive.folderBusy.clear(); drive.folderMiss.clear(); drive.alive.clear();
            drive.monthIndex.clear(); drive.monthBusy.clear();
            drive.books.clear(); drive.bookBusy.clear();
            Object.values(KEY_FILES).forEach(F => { drive[F.prop] = null; });   // 설정 폴더 파일 모두 (도련 11-06 · 새 파일이 늘어도)
        }

        /* ---------- 읽기 : 설정 / 하루치 ---------- */
        /* 설정 · 목록 파일 읽기 : 내용(없으면 null) · 파일 정보는 drive[KEY_FILES[which].prop] 에 (모두 나눠 담기 · 도련 11-21) */
        function fetchKeyFile(which) { return fetchChunked(which); }
        /* 🪑 설정 폴더의 책상 · 목록 파일 : 폴더 안을 한 번에 찾아(요청 1번) 있는 것만 동시에 읽어요 · 못 여는 파일이 하나라도 있으면 drive.deskLocked (덮어쓰지 않아요) */
        async function fetchDeskFiles() {
            DESK_WHICH.forEach(w => { drive[KEY_FILES[w].prop] = null; });
            const dir = await getFolder(DESK_PATH, false);
            if (!dir) { DESK_START.forEach(w => { drive.chunks[w] = { files: new Map(), of: new Map() }; (drive.keyNone = drive.keyNone || new Set()).add(w); }); return DESK_START.map(() => null); }
            const fs = await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}' and (${DESK_START.map(w => `name contains '${qName(KEY_FILES[w].name)}'`).join(' or ')})`, 'id,name,modifiedTime,size');
            return Promise.all(DESK_START.map(async w => {
                try { return await fetchChunked(w, fs); }                           // 📚 배치1.json … (같은 목록으로 찾아요)
                catch (e) { if (e && e.type === 'corrupt') { drive.deskLocked = true; return null; } throw e; }
            }));
        }
        /* 📚 나눠 담기 공통 (도련 11-21 · 앱 전체가 이것 하나 : 소품 · 문구 · 다이어리 · 배치 · 스티커 목록 · 스티커첩 …)
             줄마다 어느 파일(번호)에 둘지 정해요 : 한 번 든 줄은 처음 파일 그대로 · 새 줄 = 마지막 파일 · 마지막 파일이 그 파일 기준 (chunkLim = 올리는 크기 55KB × 비율) 을 넘으면 다음 번호
             rows = 줄들 (순서대로) · keyOf = 줄 이름 · of = Map(줄 이름 → 번호 · 고쳐 둬요) · known = 이미 있는 파일 번호들 · sizeOf = 줄 크기 (글자 · 바이트)
             → Map(번호 → 그 파일의 줄들) · 물건이 줄어도 나뉜 파일을 다시 합치지 않아요 (도련 11-21 · 다 빠진 뒤쪽 파일만 지워요) */
        const chunkEnc = new TextEncoder(), chunkBytes = s => chunkEnc.encode(s).length;
        /* 📏 줄어드는 비율 (도련 11-21 '정해진 값 말고 계산') : 파일마다 = 글자 바이트 ÷ 올린 크기 (올릴 때 · 읽을 때 재요) · 4KB 보다 작은 파일은 앞머리 때문에 믿지 않아요
             기준 = 올리는 크기 55KB × 그 파일 비율 · 비율을 모르는 파일 (새 파일) = 같은 목록의 다른 파일 중 가장 덜 줄어드는 것 · 그것도 없으면 0.74 (어떤 글자든 안전) */
        const chunkRatio = (raw, up) => raw >= 4096 && up > 0 ? Math.min(8, Math.max(CHUNK_WORST, raw / up)) : 0;
        function chunkLim(files, over) {                                          // files = Map(번호 → { r }) · over = 이번에 새로 잰 비율 (빗나갔을 때)
            const r = n => (over && over.get(n)) || (files.get(n) || {}).r;
            const known = [...new Set([...files.keys(), ...(over ? over.keys() : [])])].map(r).filter(Boolean), fb = known.length ? Math.min(...known) : CHUNK_WORST;
            return n => CHUNK_UP_BYTES * (r(n) || fb);
        }
        /* 📏 빗나가면 그 자리에서 다시 (도련 11-21) : 나눈 파일을 올리기 전에 잠가서 크기를 재요 · 이번에 새로 넣은 줄이 든 파일이 60KB 를 넘으면
             (예전 글자와 전혀 다른 글자가 들어왔어요) 그 파일의 진짜 비율로 새 줄만 다시 나눠요 · 몇 번까지 · 한 번 든 줄은 그대로 */
        async function chunkFit(place, seal, of) {                                // place(over) → by (chunkPlace 결과) · seal(n, 줄들) → { raw, up } (올릴 글 · 바뀌지 않았으면 null)
            const over = new Map();
            for (let t = 0; ; t++) {
                const by = place(over), sealed = new Map(); let again = false;
                for (const [n, rs] of by) {
                    const x = await seal(n, rs); sealed.set(n, x);
                    if (x && t < 5 && x.up.length > KEEPALIVE_MAX_BYTES && (by.fresh.get(n) || []).length) { over.set(n, Math.max(CHUNK_WORST, Math.min(8, x.raw / x.up.length))); again = true; }
                }
                if (!again) return { by, sealed };
                by.fresh.forEach(ks => ks.forEach(k => of.delete(k)));            // 새 줄만 다시 (한 번 든 줄은 그대로)
            }
        }
        function chunkPlace(rows, keyOf, of, known, sizeOf, limOf) {              // limOf = 번호 → 그 파일 글자 기준 (chunkLim)
            const size = sizeOf || (r => chunkBytes(JSON.stringify(r))), lim = limOf || (() => CHUNK_UP_BYTES * CHUNK_WORST);
            const by = new Map(), sz = new Map(), add = (n, r, b) => { if (!by.has(n)) by.set(n, []); by.get(n).push(r); sz.set(n, (sz.get(n) || 0) + b + 1); };
            by.fresh = new Map();                                                   // 번호 → 이번에 새로 넣은 줄 이름 (chunkFit)
            const live = new Set(rows.map(keyOf)); [...of.keys()].forEach(k => { if (!live.has(k)) of.delete(k); });
            const fresh = [];
            rows.forEach(r => { const k = keyOf(r), b = size(r), n = of.get(k); if (n) add(n, r, b); else fresh.push([r, k, b]); });
            let last = Math.max(1, ...by.keys(), ...(known || []));
            fresh.forEach(([r, k, b]) => { if (sz.get(last) && sz.get(last) + b > lim(last)) last++; add(last, r, b); of.set(k, last); if (!by.fresh.has(last)) by.fresh.set(last, []); by.fresh.get(last).push(k); });   // 빈 파일에는 커도 한 줄은 넣어요
            return by;
        }
        window.chunkPlace = chunkPlace; window.chunkBytes = chunkBytes; window.chunkRatio = chunkRatio; window.chunkLim = chunkLim; window.chunkFit = chunkFit;
        /* 📚 설정 · 목록 파일 나눠 담기 (KEY_FILES chunk) : <이름>1.json · <이름>2.json … · 키마다 배열은 줄마다 · {} 는 칸마다 · 그 밖의 값은 파일 1 에
             바뀐 파일만 다시 올려요 · 읽을 때는 모두 동시에 · 🔐 파일마다 계정 열쇠 */
        const chunkRe = F => new RegExp('^' + F.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\d+)\\.json$');
        const chunkKey = e => e && typeof e === 'object' && typeof e.u === 'string' ? e.u : e && typeof e === 'object' && typeof e.id === 'string' ? 'id:' + e.id : JSON.stringify(e);   // 배열 줄 이름 = u (소품 · 문구 · 배경지 칸) 또는 id (📔 권 · 📥 빈스티커첩 · 🧩 재료) → 고쳐도 처음 파일 그대로
        const chunkObj = x => !!x && typeof x === 'object' && !Array.isArray(x);
        const chunkRows = (k, v) => Array.isArray(v) ? v.map(e => ({ k, e, key: k + '\n' + chunkKey(e) })) : Object.keys(v).map(p => ({ k, p, e: v[p], key: k + '\np:' + p }));   // 줄 = 배열 하나 · {} 칸 하나
        drive.chunks = {};                                                        // which → { files: Map(n → {id, modifiedTime, body}), of: Map(키\n줄 → n) }
        /* 그 파일의 키 : 책상 · 목록 파일 = DESK_FILE_KEYS 그대로 · ⚙ 설정 · 📒 기록 = 그 파일로 가는 키 모두 (keyFile · 이름 순) */
        const chunkFixed = which => !!DESK_FILE_KEYS[which];
        const chunkKeys = (which, o) => chunkFixed(which) ? DESK_FILE_KEYS[which] : [...new Set(Object.keys(o || {}).concat(o ? [] : store.keys().filter(isSettingKey)))].filter(k => keyFile(k) === which).sort();
        const chunkBody = (which, o) => { const r = {}; chunkKeys(which, o || {}).forEach(k => { if (o && o[k] != null) r[k] = o[k]; }); return JSON.stringify(r); };   // 키 순서를 늘 같게 (같은 내용이면 다시 안 올려요)
        function chunkPick(F, list) {
            const re = chunkRe(F), one = new Map();
            (list || []).forEach(f => { const m = re.exec(f.name); if (m && !one.has(+m[1])) one.set(+m[1], Object.assign({ n: +m[1] }, f)); });   // 같은 번호가 둘이면 먼저 만든 것
            return [...one.values()].sort((a, b) => a.n - b.n);
        }
        async function chunkList(which) {
            const F = KEY_FILES[which], dir = await getFolder(F.path, false); if (!dir) return [];
            return chunkPick(F, await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}' and name contains '${qName(F.name)}'`, 'id,name,modifiedTime,size'));
        }
        async function fetchChunked(which, listed) {                              // listed = 이미 찾은 폴더 목록 (🪑 설정 폴더는 한 번에)
            const F = KEY_FILES[which];
            drive[F.prop] = null; const C = drive.chunks[which] = { files: new Map(), of: new Map() };
            const fs = listed ? chunkPick(F, listed) : await chunkList(which);
            if (!fs.length) { (drive.keyNone = drive.keyNone || new Set()).add(which); return null; }
            const out = {}; let mt = '';
            const parts = await Promise.all(fs.map(async f => [f, parseJsonObject(await keyFileText(which, f.id), which) || {}]));
            parts.forEach(([f, o]) => {
                const body = chunkBody(which, o); C.files.set(f.n, { id: f.id, modifiedTime: f.modifiedTime, body, r: chunkRatio(chunkBytes(body), +f.size || 0) }); if ((f.modifiedTime || '') > mt) mt = f.modifiedTime || '';
                chunkKeys(which, o).forEach(k => {
                    const x = o[k]; if (x == null) return;
                    if (Array.isArray(x)) out[k] = (Array.isArray(out[k]) ? out[k] : []).concat(x);
                    else if (chunkObj(x)) out[k] = Object.assign(chunkObj(out[k]) ? out[k] : {}, x);
                    else { if (f.n === fs[0].n || !(k in out)) out[k] = x; return; }   // 그 밖의 값 = 첫 파일 것
                    chunkRows(k, x).forEach(r => C.of.set(r.key, f.n));
                });
            });
            drive[F.prop] = { id: fs[0].id, name: F.name, modifiedTime: mt };
            return out;
        }
        function chunkSplit(which, over) {                                         // 지금 메모리 → { n: {키: [...] | {...}} } · .fresh = 번호 → 새로 넣은 줄
            const keys = chunkKeys(which, null), fixed = chunkFixed(which), C = drive.chunks[which] || (drive.chunks[which] = { files: new Map(), of: new Map() });
            const B = new Map(), at = n => B.get(n) || (B.set(n, {}), B.get(n)), rows = [], kind = {};
            const inFiles = k => { const r = []; [...C.files.keys()].sort((a, b) => a - b).forEach(n => { let o = {}; try { o = JSON.parse(C.files.get(n).body) || {}; } catch (e) {} if (o[k] != null) r.push([n, o[k]]); }); return r; };
            keys.forEach(k => {
                let v = null; try { v = JSON.parse(store.getItem(k)); } catch (e) {}
                if (v == null && !fixed) return;                                    // ⚙ 설정 · 📒 기록 = 지운 키 · JSON 이 아닌 값은 빼요
                if (v == null) {                                                    // 아직 모르는 키 = 파일에 있던 그대로 (지우지 않아요)
                    inFiles(k).forEach(([n, x]) => { if (Array.isArray(x) || chunkObj(x)) { kind[k] = Array.isArray(x) ? 'a' : 'o'; rows.push(...chunkRows(k, x)); } else at(n)[k] = x; });
                    return;
                }
                if (!Array.isArray(v) && !chunkObj(v)) { at(1)[k] = v; return; }   // 그 밖의 값 (📔 권 번호 …) = 파일 1 에 통째로
                kind[k] = Array.isArray(v) ? 'a' : 'o'; rows.push(...chunkRows(k, v));
                at(1)[k] = Array.isArray(v) ? [] : {};                               // 빈 목록도 파일 1 에 (다 버렸어요)
            });
            const P = chunkPlace(rows, r => r.key, C.of, [...C.files.keys()], r => chunkBytes(JSON.stringify(r.e)) + (r.p != null ? chunkBytes(JSON.stringify(r.p)) + 1 : 0), chunkLim(C.files, over));
            P.forEach((rs, n) => {
                rs.forEach(r => { const b = at(n); if (kind[r.k] === 'a') (b[r.k] = Array.isArray(b[r.k]) ? b[r.k] : []).push(r.e); else (b[r.k] = chunkObj(b[r.k]) ? b[r.k] : {})[r.p] = r.e; });
            });
            B.fresh = P.fresh;
            if (!B.has(1) && C.files.has(1)) B.set(1, {});                         // 다 지웠어요 = 파일 1 을 비워요
            B.forEach((b, n) => { if (n > 1 && Object.keys(b).every(k => (Array.isArray(b[k]) ? !b[k].length : chunkObj(b[k]) && !Object.keys(b[k]).length))) B.delete(n); });
            return B;
        }
        async function writeChunked(which, mine) {
            const F = KEY_FILES[which];
            const dir = await getFolder(F.path, true), C = drive.chunks[which] || {};
            const fresh = drive.keyNone && drive.keyNone.has(which) && !(C.files && C.files.size);
            if (!fresh && !C.files) await fetchChunked(which);                    // 파일 번호를 아직 몰라요 (한 번만) · 📱 한 기기 기준 = 올리기 전에 다른 기기를 묻지 않아요 (도련 11-17)
            if (drive.keyNone) drive.keyNone.delete(which);
            goneScrub(which);                                                      // 🚛 목록이 정답
            const D = drive.chunks[which] || (drive.chunks[which] = { files: new Map(), of: new Map() }); let mt = '', made = false;
            const seal = async (n, o) => {                                         // 바뀐 파일만 잠가 봐요 (up = 올리는 그대로)
                const body = chunkBody(which, o || {}), cur = D.files.get(n); if (cur && cur.body === body) return null;
                const raw = chunkBytes(body); return { body, raw, up: await bodySeal(F.name + n + '.json', await keyFileSeal(which, body)) };
            };
            const { by: B, sealed } = await chunkFit(over => chunkSplit(which, over), seal, D.of);   // 📏 빗나가면 그 자리에서 다시 나눠요
            for (const n of [...new Set([...B.keys(), ...D.files.keys()])].sort((a, b) => a - b)) {
                const cur = D.files.get(n), x = sealed.get(n);
                if (!B.has(n)) { if (cur && n > 1) { await toTrash(cur.id, F.name + n + '.json', 'a'); D.files.delete(n); } continue; }   // 다 빠진 뒤쪽 파일 (앱 정리 · 숨김)
                if (!x) { if (cur && (cur.modifiedTime || '') > mt) mt = cur.modifiedTime; continue; }   // 그대로
                const name = F.name + n + '.json'; let saved;
                try { saved = await driveUpsert(dir, name, cur && cur.id, x.up, true); }
                catch (e) { if (!(e && e.code === 'gone' && cur)) throw e; const f = await findFile(dir, name); saved = await driveUpsert(dir, name, f ? f.id : null, x.up, true); }   // 그 사이 지워진 번호 → 이름으로 다시
                if (!cur) made = true;
                D.files.set(n, { id: saved.id, modifiedTime: saved.modifiedTime, body: x.body, r: chunkRatio(x.raw, x.up.length) }); if ((saved.modifiedTime || '') > mt) mt = saved.modifiedTime;
            }
            const first = D.files.get(Math.min(...D.files.keys()));
            drive[F.prop] = first ? { id: first.id, name: F.name, modifiedTime: mt } : null;
            if (made && KEY_MADE.includes(which)) { const m = Object.assign({}, prefGet(MADE_KEY, '') || {}); if (!m[which]) { m[which] = 1; prefSet(MADE_KEY, '', m); if (window.deskBackOne) deskBackOne(which); } }   // 🛟 처음 생긴 목록 = 바로 백업도
            if (which === 'cafe') drive.cafeBase = new Map(chunkKeys('cafe', null).map(k => { let v = null; try { v = JSON.parse(store.getItem(k)); } catch (e) {} return [k, v]; }).filter(([, v]) => v != null).map(([k, v]) => [k, JSON.stringify(v)]));   // ☕ 합칠 때 기준 = 올린 값
        }
        /* 💤 쓸 때 읽는 목록 파일 (도련 11-07 · 첫 접속자에게 필요한 파일만) : 그 창을 열거나 바꿀 때 한 번 · 없으면 그대로 (바뀔 때 처음 생겨요) · 못 열면 덮어쓰지 않아요
           → true = 읽었어요 (파일이 없어도) · 게스트 · 로그인 전 = 할 일 없음 · 못 닿으면 에러 (다음에 다시) */
        function keyFileLoad(which, mine) {                                    // mine = 올리는 중인 키 (dirtyKeys 에서 옮겨 둔 것 · 11-11 : 덮어쓰지 않게)
            const F = KEY_FILES[which];
            if (!F || !F.lazy || !drive.ready || drive.guest) return Promise.resolve(true);
            if (drive.lazyOn.has(which)) return Promise.resolve(true);
            if (drive.lazyBusy.has(which)) return drive.lazyBusy.get(which);
            const gen = drive.gen;
            const p = (async () => {
                let o = null;
                try { o = await fetchKeyFile(which); }
                catch (e) { if (!(e && e.type === 'corrupt')) throw e; if (gen === drive.gen) { drive.lazyBad.add(which); drive.lazyOn.add(which); } diag('lazyBad', { w: which }); return true; }   // 🔐 남의 것 · 깨짐 = 그대로 두고 안 써요
                if (gen !== drive.gen) return false;
                if (o) Object.keys(o).forEach(k => { if (keyFile(k) !== which) return; if (!drive.dirtyKeys.has(k) && !(mine && mine.has(k))) store.putLoaded(k, JSON.stringify(o[k])); else goneUnion(k, o[k]); });   // 🚛 먼저 적은 영구삭제 칸 + 파일 것
                drive.lazyOn.add(which); goneScrub(which);
                return true;
            })();
            drive.lazyBusy.set(which, p);
            p.then(() => { if (drive.lazyBusy.get(which) === p) drive.lazyBusy.delete(which); }, () => { if (drive.lazyBusy.get(which) === p) drive.lazyBusy.delete(which); });
            return p;
        }
        /* 📝 바뀔 때 처음 생기는 목록 (도련 11-07 · 첫 접속자에게 필요한 파일만) : 만든 적이 있으면 설정.json 'diary_made' 에 표시
           → 파일이 없는데 표시가 있으면 = 없어진 것 (되살리기 · 폴더를 뒤져요) · 표시가 없으면 = 처음 선물 그대로 (폴더를 안 뒤져요 · 요청 줄이기) */
        const MADE_KEY = 'diary_made', KEY_MADE = ['bgown', 'dyown', 'dkown', 'gdown', 'bmown', 'esown'];
        const keyMade = which => !!((prefGet(MADE_KEY, '') || {})[which]);
        const keyFileOn = which => { const F = KEY_FILES[which]; return !F || !F.lazy || !drive.ready || drive.guest || drive.lazyOn.has(which); };
        /* 🔐 설정 / 배치.json 은 스티커처럼 계정마다 다른 열쇠로 암호화 (도련 10-27 · 복사해도 하나 · 남의 것은 못 열어요 · js/own.js ownLock / ownUnlock)
           못 열면 (다른 계정 · 깨짐) 읽기 실패 → 아무것도 바꾸지 않고 덮어쓰지도 않아요 */
        async function keyFileText(which, id) {
            const t = await readFileText(id);
            if (!isDeskFile(which) || !t.trim()) return t;
            try { return JSON.stringify(await ownUnlock(t, COLL.who)); } catch (e) { throw corruptError(which); }
        }
        const keyFileSeal = async (which, body) => isDeskFile(which) ? ownLock(JSON.parse(body), COLL.who) : body;

        /* 키 → 그 파일이 든 폴더 목록 · 파일 이름 (하루 : 날짜형바인더 / 그 권 · 📕 장 · 다이어리.json : 페이지노트 · 페이지바인더 안 그 권 것만) */
        function idxOfKey(key, create) {
            const d = parseDayKey(key); if (d) return getMonthIndex(d.y, d.m, create, d.b);
            const st = STATE_KEY_RE.exec(key); if (st) return /^dk/.test(st[1]) ? getBookIndex(st[1], create) : getMonthIndex(0, 0, create, st[1]);   // 그 권 폴더
            const p = parsePageKey(key), b = BOOK_KEY_RE.exec(key);
            return p || b ? getBookIndex(p ? p.b : b[1], create) : Promise.resolve(null);
        }
        function fileOfKey(key) {
            const d = parseDayKey(key); if (d) return dayFileName(d);
            const p = parsePageKey(key); if (p) return `${p.n ? p.n + '페이지' : '표지'}.json`;   // 0장 = 📕 표지 (그 권 폴더 안)
            if (isStateKey(key)) return STATE_FILE;
            const b = BOOK_KEY_RE.exec(key); return b ? dkInfoName(b[1]) : '';
        }
        async function fetchKey(key, meta) {
            const idx = await idxOfKey(key, false), name = fileOfKey(key);
            if (idx) await dayDupFix(idx, name, key);
            const f = idx && idx.files.get(name);
            if (meta) meta.t = f ? f.modifiedTime || '' : '';
            if (!f) return null;                                   // 그날 (그 장) 쓴 게 없음
            const obj = parseJsonObject(await readFileText(f.id), key);
            return obj ? JSON.stringify(obj) : null;
        }

        /* 📕 페이지형 한 권 = 페이지노트 · 페이지바인더 폴더 안 '<권 id>-' 로 시작하는 파일들 (도련 10-26 · 권 폴더 없음)
           - 종류(노트 · 바인더)는 다이어리.json 정보로 · 모르면 두 폴더 모두 봐요
           - create=true 면 없을 때 <권 id>-다이어리.json 을 만들어요 (첫 장을 저장할 때) */
        function dkIdxOf(folderId, kind, files, id) {
            const e = dayIdxOf(folderId, files);
            e.name = id; e.kind = kind;
            drive.books.set(id, e);
            return e;
        }
        async function getBookIndex(id, create) {
            let entry = drive.books.get(id);
            if (entry) return entry;
            if (drive.bookBusy.has(id)) {
                entry = await drive.bookBusy.get(id);
                if (entry || !create) return entry;
            }
            const p = (async () => {
                const info = typeof dkInfoOf === 'function' ? dkInfoOf(id) : { kind: '' }, kind = DK_KINDS.includes(info.kind) ? info.kind : DK_KINDS[0];
                const has = await getFolder(dkBookDir(id), false);            // 📕 그 권 폴더 (다이어리 / dk…)
                if (has) { const files = await driveList(`'${has}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime,size'); return dkIdxOf(has, kind, files, id); }
                if (!create) return null;
                const dir = await getFolder(dkBookDir(id), true);
                const saved = await driveUpsert(dir, dkInfoName(id), null, JSON.stringify(info));
                return dkIdxOf(dir, kind, [{ id: saved.id, name: dkInfoName(id), modifiedTime: saved.modifiedTime }], id);
            })();
            drive.bookBusy.set(id, p);
            try { return await p; } finally { drive.bookBusy.delete(id); }
        }

        /* 📄📄 같은 날 일기 파일이 2개 이상 (올린 답을 못 받고 다시 올렸거나 · 두 기기가 거의 동시에 처음 만든 경우) → 하나로 정리 (도련 11-18)
           - 내용이 같거나 한쪽이 비었으면 · 한쪽이 다른 쪽을 다 품고 더 꾸민 것이면 = 묻지 않고 그쪽
           - 정말 다르면 = 두 장을 작게 나란히 보여 주고 골라요 (js/page.js dayPreviewHtml) · 고른 내용을 가장 먼저 만든 파일에 두고 나머지는 바로 영구 삭제 (휴지통에 남기지 않아요) */
        const dupFixing = new Map();
        function dayDupFix(idx, name, key) {
            const list = idx.dups && idx.dups.get(name);
            if (!list || list.length < 2) return Promise.resolve();
            const tk = idx.folderId + '/' + name;
            if (dupFixing.has(tk)) return dupFixing.get(tk);
            const p = (async () => {
                const texts = [];
                for (const f of list) { let t = null; try { t = JSON.stringify(parseJsonObject(await readFileText(f.id), key)); } catch (e) { if (e.type !== 'corrupt') throw e; } texts.push(t); }
                let win = 0;
                /* 한쪽이 다른 쪽을 다 품고 더 꾸민 것 = 나중 모습 (한 기기가 올린 답을 못 받고 더 꾸며 또 올렸어요) → 묻지 않고 그쪽 (도련 11-18) */
                const items = t => { try { const o = JSON.parse(t); return ((o && o.i) || []).map(x => { const y = Object.assign({}, x); delete y.lt; delete y.z; return JSON.stringify(y); }); } catch (e) { return []; } };
                const extra = t => { try { const o = JSON.parse(t) || {}; return JSON.stringify([o.mo || null, o.we || null, o.sj || null]); } catch (e) { return ''; } };
                const covers = (big, small) => {                                 // big 이 small 의 붙인 것을 모두 가지고 더 있어요 (도장 · 날씨 · 속지는 같거나 small 에 없어요)
                    const B = items(big), S = items(small), eb = extra(big), es = extra(small), none = JSON.stringify([null, null, null]);
                    if (!(es === eb || es === none)) return false;
                    const left = B.slice();
                    if (!S.every(x => { const n = left.indexOf(x); if (n < 0) return false; left.splice(n, 1); return true; })) return false;
                    return left.length > 0 || es !== eb;
                };
                for (let i = 1; i < list.length; i++) {
                    const a = texts[win], b = texts[i];
                    if (b === null || b === 'null' || b === a) continue;
                    if (a === null || a === 'null') { win = i; continue; }
                    if (covers(b, a)) { win = i; continue; }
                    if (covers(a, b)) continue;
                    /* 🖼 정말 다르면 = 두 장을 작게 나란히 보여 주고 골라요 (이미 받은 글로 그려요 · 요청 더 없음) */
                    const tm = f => new Date(f.modifiedTime).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const pw = Math.min(240, Math.floor(((window.innerWidth || 360) - 80) / 2)), n = t => items(t).length;
                    const card = (t, f, tag) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><b style="font-size:13px">${tag}</b>${window.dayPreviewHtml ? dayPreviewHtml(JSON.parse(t), pw) : ''}<span style="font-size:11px;color:#777">🕐 ${tm(f)} 저장 · 붙인 것 ${n(t)}개</span></div>`;
                    const first = await showAsk(`📄📄 <b>${keyLabel(key)}</b> 일기가 두 개 있어요.<br>남길 쪽을 골라 주세요<br><div style="display:flex;gap:10px;justify-content:center;margin:10px 0 4px;flex-wrap:wrap">${card(a, list[win], '🅰')}${card(b, list[i], '🅱')}</div><span style="font-size:12px;color:#777;">고르지 않은 쪽은 바로 지워져요 (되살릴 수 없어요)</span>`, '🅰 남기기', '🅱 남기기');   // 창이 좁으면 위아래로 놓여서 '왼쪽 · 오른쪽' 대신 🅰 🅱
                    if (!first) win = i;
                }
                const keep = list[0];
                let meta = keep;
                if (win !== 0 && texts[win] !== null) meta = Object.assign({}, keep, await driveUpsert(idx.folderId, name, keep.id, texts[win]));
                for (let i = 1; i < list.length; i++) await driveKill(list[i].id);   // 🔥 남기지 않은 쪽 = 바로 영구 삭제 (도련 11-18 : 앱 휴지통에 남기지 않아요 · 예전 = 다른 내용은 🗑 휴지통 30일 · 같은 내용은 숨김 정리)
                idx.files.set(name, meta); idx.dups.delete(name);
                if (drive.dayMeta.has(key)) drive.dayMeta.set(key, meta.modifiedTime || '');
            })();
            dupFixing.set(tk, p);
            return p.finally(() => dupFixing.delete(tk));
        }

        /* 하루치를 메모리로 읽어 오기 (이미 읽었으면 바로 끝, 읽는 중이면 그 요청을 같이 기다림) */
        const ensureDayLoaded = date => ensureKeyLoaded(getDateKey(date));
        function ensureKeyLoaded(key) {
            if (drive.guest || drive.loadedDays.has(key)) return Promise.resolve(true);
            if (drive.dayLoads.has(key)) return drive.dayLoads.get(key);
            const gen = drive.gen;
            const p = (async () => {
                try {
                    const pk = parsePageKey(key), meta = {};
                    const [okB, text] = await Promise.all([pk ? ensureKeyLoaded('dkb_' + pk.b) : true, fetchKey(key, meta)]);   // 📕 다이어리.json 과 장을 함께 읽고 (기다리는 왕복 1번 줄임)
                    if (!okB) return false;                                              //    다이어리.json 을 못 읽었으면 장도 넣지 않아요
                    if (gen !== drive.gen) return false;
                    if (!drive.dirtyKeys.has(key)) store.putLoaded(key, text);   // 고치는 중인 내용이 있으면 덮어쓰지 않음
                    if (!drive.dayMeta.has(key)) drive.dayMeta.set(key, meta.t);
                    drive.loadedDays.add(key);
                    return true;
                } catch (e) {
                    console.warn('일기 불러오기 실패:', key, e);
                    return false;
                } finally {
                    if (drive.dayLoads.get(key) === p) drive.dayLoads.delete(key);
                }
            })();
            drive.dayLoads.set(key, p);
            return p;
        }

        function prefetchDays(dates) {
            if (!drive.ready || drive.guest) return Promise.resolve([]);
            return Promise.all(dates.map(ensureDayLoaded));
        }
        /* 다이어리를 처음 열 때: 오늘 + 어제 + 내일 (3개) */
        function prefetchInitial() { const st = d => window.dyStep ? dyStep(currentDate, d) : addDays(currentDate, d); return prefetchDays([currentDate, st(-1), st(1)].filter(Boolean)); }
        /* 페이지를 한 장 넘긴 뒤: 넘긴 방향의 다음 하루치만 (1개) */
        function prefetchAfterTurn(dir) { const d = window.dyStep ? dyStep(currentDate, dir) : addDays(currentDate, dir); return prefetchDays(d ? [d] : []); }

        async function loadFromDrive() {
            if (window.PROD_READY) await PROD_READY;                       // 🧁 상품 목록 버전 확인이 끝난 뒤 (처음 선물 · 되살리기가 진짜 목록으로 · 늦어도 3초 · js/prod.js)
            resetDriveCaches(); drive.rootId = null; drive.keyNone = new Set();
            await drcBoot();                                                 // 🔔 읽기 전에 표시 (읽는 사이 바뀐 것도 다음 확인에 잡혀요) · ⚡ 지난번 표시가 있으면 바뀐 것만 잊고 나머지는 이 기기에 둔 것으로 (js/drcache.js · 도련 11-17)
            await ledgerLoad();                                              // 📒 장부 먼저 (은퇴한 예전 폴더는 쓰지 않아요 · 영구삭제 한 벌)
            const [settings, cafe] = await Promise.all([fetchKeyFile('settings'), fetchKeyFile('cafe')]);   // 읽지 못하면 여기서 에러 → 아무것도 바꾸지 않음
            drive.newbie = !drive.rootId; diag('start', { mode: drive.local ? 'folder' : 'google', newbie: drive.newbie ? 1 : 0 });   // 🆕 말랑달콤 폴더가 아직 없어요 = 처음 온 다꾸러 (되살리려고 폴더를 뒤지지 않아요 · 요청 줄이기 · 도련 11-05)
            if (typeof collWhoami === 'function') await collWhoami();        // 🔐 계정을 먼저 알아야 배치.json 을 열 수 있어요 (js/coll.js)
            if (drive.newbie && LG.ok && LG.d.root) await freshStart();      // 🆕 말랑달콤 폴더가 없는데 장부엔 예전 폴더가 있어요 = 폴더를 지우고 다시 왔어요 → 이 계정의 옛 기억을 버려요 (첫 접속자처럼 · 1366 · 처음 온 다꾸러는 장부가 없어서 그대로)
            drive.deskLocked = false;
            const [desks, backs] = await Promise.all([fetchDeskFiles(), drive.newbie ? Promise.resolve(DESK_START2.map(() => null)) : Promise.all(DESK_START2.map(w => fetchKeyFile(w).catch(e => { if (e && e.type === 'corrupt') { drive.deskLocked = true; return null; } throw e; })))]);   // ✏️ 백 문구 목록도 같이 (동시에)                            // 🪑 설정 폴더의 책상 · 목록 파일 (요청 한 번으로 찾고 동시에 읽어요)   // 🔐 못 여는 배치.json (다른 계정 것 · 깨짐) : 일기는 그대로 열고 · 내 백업이 열리면 되살려 새로 쓰고 (js/desk.js giftEnsure) · 아니면 절대 덮어쓰지 않아요
            clearTimeout(uploadTimer);
            drive.gen++;
            store.clear();
            drive.dirtyKeys.clear(); drive.loadedDays.clear(); drive.dayLoads.clear(); drive.dayMeta.clear();
            if (settings) Object.keys(settings).forEach(k => { if (isSettingKey(k) && keyFile(k) === 'settings') store.putLoaded(k, JSON.stringify(settings[k])); });
            drive.cafeBase = new Map();
            if (cafe) Object.keys(cafe).forEach(k => { if (keyFile(k) === 'cafe') { store.putLoaded(k, JSON.stringify(cafe[k])); drive.cafeBase.set(k, JSON.stringify(cafe[k])); } });
            DESK_START.forEach((w, i) => { const o = desks[i]; if (o) Object.keys(o).forEach(k => { if (keyFile(k) === w) store.putLoaded(k, JSON.stringify(o[k])); }); });
            DESK_START2.forEach((w, i) => { const o = backs[i]; if (o) Object.keys(o).forEach(k => { if (keyFile(k) === w) store.putLoaded(k, JSON.stringify(o[k])); }); });
            if (drive.newbie) DESK_START2.forEach(w => { (drive.keyNone = drive.keyNone || new Set()).add(w); drive.chunks[w] = null; });
            Object.keys(GONE_OF).filter(w => KEY_FILES[w] && !KEY_FILES[w].lazy).forEach(goneScrub);   // 📒 장부의 영구삭제를 다시 더하고 · 목록에서 빼요 (💤 lazy 는 읽을 때)
            drive.lazyOn = new Set(); drive.lazyBusy = new Map(); drive.lazyBad = new Set();   // 💤 쓸 때 다시 읽어요
            DESK_WHICH.filter(w => KEY_FILES[w].lazy).forEach(w => { delete drive.chunks[w]; });
            if (typeof collLogin === 'function') await collLogin();          // 🎨 지금 쓰는 내 페이지 · 배경지 원본 (js/coll.js)
            drive.ready = true; drive.guest = false;
            drive.needAuth = false; drive.error = false; drive.full = false;
            lastRemoteCheck = Date.now();
            applyLoadedData();
            updateBadge();
            prefetchInitial();                             // 기다리지 않고 백그라운드로 3일치 미리 읽기
        }

        /* ---------- 쓰기 : 하루 1파일 덮어쓰기 ---------- */
        /* 화면이 꺼지는 중에도 요청이 끝까지 전송되도록 keepalive 사용 (본문이 64KB 이하일 때만 가능) */
        function keepaliveFor(body) {
            try { return new Blob([body]).size <= KEEPALIVE_MAX_BYTES ? { keepalive: true } : {}; }
            catch (e) { return {}; }
        }

        /* 🔏 올린 내용 확인 (도련 11-17 · 백업 파일 대신) : 구글이 답장에 주는 내용 지문(md5Checksum)과 올린 글의 지문이 같은지 · 요청은 그대로 1번
             다르면 = 한 번 다시 올려요 · 그래도 다르면 에러 'md5' (올리지 못한 것으로 = 이 기기에 보관하고 다음에 다시 · 원래 파일은 구글 판 기록에) */
        function md5Hex(str) {
            const b = new TextEncoder().encode(str), n = b.length, words = new Uint32Array((((n + 8) >>> 6) + 1) * 16);
            for (let i = 0; i < n; i++) words[i >> 2] |= b[i] << ((i % 4) * 8);
            words[n >> 2] |= 0x80 << ((n % 4) * 8); words[words.length - 2] = (n * 8) >>> 0; words[words.length - 1] = Math.floor(n / 0x20000000);
            const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21], K = Array.from({ length: 64 }, (_, i) => (Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);
            let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
            for (let o = 0; o < words.length; o += 16) {
                let A = a0, B = b0, C = c0, D = d0;
                for (let i = 0; i < 64; i++) {
                    let F, g; const r = i >> 4;
                    if (r === 0) { F = (B & C) | (~B & D); g = i; } else if (r === 1) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; } else if (r === 2) { F = B ^ C ^ D; g = (3 * i + 5) % 16; } else { F = C ^ (B | ~D); g = (7 * i) % 16; }
                    const t = D; D = C; C = B; const x = (A + F + K[i] + words[o + g]) | 0, s = S[r * 4 + (i % 4)]; B = (B + ((x << s) | (x >>> (32 - s)))) | 0; A = t;
                }
                a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
            }
            return [a0, b0, c0, d0].map(v => Array.from({ length: 4 }, (_, i) => ((v >>> (i * 8)) & 255).toString(16).padStart(2, '0')).join('')).join('');
        }
        function md5Same(j, body) { return !j || !j.md5Checksum || j.md5Checksum === md5Hex(body); }   // 답장에 지문이 없으면 (예전 · 시험) 넘어가요
        function md5Bad(name) { diag('md5', { name }); const er = new Error('upload checksum'); er.code = 'md5'; return er; }

        /* fileId가 있으면 그 파일을 덮어쓰고, 없으면 folderId 안에 새로 만듭니다 */
        async function driveUpsert(folderId, name, fileId, body, raw) {
            if (!raw) body = await bodySeal(name, body);                             // 🔐 json 은 잠가서 (도련 11-11 · raw = 받은 글 그대로)
            if (fileId) {
                let j = null;
                for (let t = 0; t < 2; t++) {                                       // 🔏 지문이 다르면 한 번 더
                    const res = await gfetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,modifiedTime,trashed,md5Checksum`, Object.assign({
                        method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body
                    }, keepaliveFor(body)));
                    if (!res.ok) throw await driveFail(res, 'update');          // 404 'gone' : 그 사이 지워짐 → 캐시를 비우고 다시 시도
                    j = await res.json();
                    if (md5Same(j, body)) break;
                    if (t) throw md5Bad(name);
                }
                if (!j.trashed) { if (window.DRC) await DRC.keepBody(j.id || fileId, body, j.md5Checksum); return mineWrote(j); }   // ⚡ 올린 그대로 기억 (다시 받지 않아요)
                /* 🗑 휴지통에 들어간 파일 (폴더를 지웠거나 · 같은 이름 폴더 합치기로) : 번호로는 써지지만 드라이브 폴더에서는 안 보여요 (도련 11-06 마테 목록이 사라진 까닭)
                   → 그 파일은 그대로 두고 지금 폴더에 새로 만들어요 (폴더도 휴지통이면 'gone' → 부른 쪽이 폴더를 다시 찾아요) */
                console.warn('🗑 휴지통에 있는 파일에 쓰려고 했어요 → 지금 폴더에 새로 만들어요 :', name); diag('twrite', { name, id: fileId });
                drive.alive.delete(folderId);
            }
            /* 새 파일을 만들기 전에 폴더가 살아 있는지 드라이브에 직접 확인 : 휴지통에 들어간 폴더에 만들면 일기가 안 보이게 돼요
               → 폴더가 없거나 휴지통이면 기억해 둔 폴더를 모두 잊고 'gone' (부른 쪽이 폴더를 다시 찾아서 다시 저장해요) */
            const seen = drive.alive.get(folderId);                              // 🔁 이 창에서 한 번 확인한 폴더는 다시 묻지 않아요 (도련 11-17 · 예전 30초 · 휴지통 · 지워짐은 구글 changes 가 알려 줘요 = drcGone 이 잊어요)
            if (!seen && !(await driveMeta(folderId, true))) {
                diag('gone', { name, dir: folderId });
                resetDriveCaches();
                const er = new Error('folder gone'); er.code = 'gone'; throw er;
            }
            const b = 'diary_boundary_' + Math.random().toString(36).slice(2);
            const meta = { name, mimeType: 'application/json', parents: [folderId] };
            const multipart =
                `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
                `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n--${b}--`;
            const res = await gfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime,md5Checksum', Object.assign({
                method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: multipart
            }, keepaliveFor(multipart)));
            if (!res.ok) { drive.alive.delete(folderId); throw await driveFail(res, 'create'); }   // 404 'gone' : 폴더가 지워짐
            drive.alive.set(folderId, Date.now());
            const j = await res.json();
            if (drive.madeDirs && drive.madeDirs.has(folderId)) drive.madeDirs.get(folderId).set(name, { id: j.id, name, modifiedTime: j.modifiedTime, size: String(body.length) });   // 📁 방금 만든 폴더 안 (findFile 이 찾지 않아요)
            if (!md5Same(j, body)) return driveUpsert(folderId, name, j.id, body, true);   // 🔏 새로 만든 파일 지문이 달라요 → 그 파일에 한 번 더 (그래도 다르면 에러)
            if (window.DRC) await DRC.keepBody(j.id, body, j.md5Checksum);       // ⚡ 올린 그대로 기억
            return mineWrote(j);
        }

        async function driveTrash(fileId) {
            diag('trash', { id: fileId });
            const res = await gfetch(`${DRIVE_API}/${fileId}?fields=id`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ trashed: true })
            });
            if (!res.ok && res.status !== 404) throw await driveFail(res, 'trash');
        }



        /* ☕ 카페 기록 합치기 : 두 기기가 같은 항목을 고쳤을 때 한쪽 기록이 사라지지 않게
           base = 마지막으로 드라이브에서 읽거나 올린 값 · mine = 이 기기 · theirs = 지금 드라이브 (모두 JSON 글자)
           - 출석 도장 : 양쪽 도장을 모두 (도장은 지우는 기능이 없어요)
           - 오락실 최고 점수 : 게임마다 더 높은 점수
           - 생리 달력 · 심리테스트 결과 : 날짜(테스트)마다 바뀐 쪽 · 둘 다 바꿨으면 이 기기 것
           - D-day : 양쪽에서 더한 것은 모두 · 한쪽에서 지운 것은 지워요
           - 그 밖 : 한쪽만 바꿨으면 바꾼 쪽 · 둘 다 바꿨으면 이 기기 것 (예전과 같음)
           읽을 수 없는 값이 섞여 있으면 이 기기 것을 그대로 둬요 */
        function cafeMerge(k, base, mine, theirs) {
            if (mine === theirs || theirs == null) return mine;
            if (mine == null) return theirs;
            const P = t => { if (t == null) return undefined; try { return JSON.parse(t); } catch (e) { return null; } };
            const obj = x => x && typeof x === 'object' && !Array.isArray(x);
            const pick = () => (mine === base ? theirs : mine);
            const each3 = (b, m, t, both) => {                                 // 칸마다 : 한쪽만 바뀌었으면 바뀐 쪽
                const out = {};
                new Set([...Object.keys(b || {}), ...Object.keys(m), ...Object.keys(t)]).forEach(n => {
                    const bv = b && n in b ? JSON.stringify(b[n]) : undefined, mv = n in m ? JSON.stringify(m[n]) : undefined, tv = n in t ? JSON.stringify(t[n]) : undefined;
                    const r = mv === tv ? mv : mv === bv ? tv : tv === bv ? mv : both(m[n], t[n], mv);
                    if (r !== undefined) out[n] = JSON.parse(r);
                });
                return out;
            };
            try {
                if (k === VAULT_KEYS[0]) {                                     // 🔐 출석 도장 { "2026-10": [1, 2, 5] }
                    const m = vaultOpen(P(mine)), t = vaultOpen(P(theirs));
                    if (!obj(m) || !obj(t)) return mine;
                    const out = {};
                    new Set([...Object.keys(m), ...Object.keys(t)]).forEach(ym => {
                        const days = new Set([...(Array.isArray(m[ym]) ? m[ym] : []), ...(Array.isArray(t[ym]) ? t[ym] : [])].filter(d => Number.isInteger(d)));
                        if (days.size) out[ym] = [...days].sort((a, b) => a - b);
                    });
                    return JSON.stringify(vaultSeal(out));
                }
                if (k === 'diary_arcade_best') {
                    const m = P(mine), t = P(theirs);
                    if (!obj(m) || !obj(t)) return mine;
                    const out = Object.assign({}, t);
                    Object.keys(m).forEach(g => { const a = +m[g] || 0, b = +t[g] || 0; out[g] = Math.max(a, b); });
                    return JSON.stringify(out);
                }
                if (k === 'diary_psy') {
                    const m = P(mine), t = P(theirs), b = P(base);
                    if (!obj(m) || !obj(t)) return mine;
                    return JSON.stringify(each3(obj(b) ? b : {}, m, t, (x, y, mv) => mv));
                }
                if (k === 'diary_cycle') {
                    const m = P(mine), t = P(theirs), b = P(base);
                    if (!obj(m) || !obj(m.d) || !obj(t) || !obj(t.d)) return mine;
                    return JSON.stringify(Object.assign({}, m, { d: each3(obj(b) && obj(b.d) ? b.d : {}, m.d, t.d, (x, y, mv) => mv) }));
                }
                if (k === 'diary_dday') {
                    const m = P(mine), t = P(theirs), b = P(base);
                    if (!Array.isArray(m) || !Array.isArray(t)) return mine;
                    const S = a => a.map(x => JSON.stringify(x));
                    const bs = new Set(Array.isArray(b) ? S(b) : []), ms = new Set(S(m)), ts = S(t);
                    const out = ts.filter(x => !(bs.has(x) && !ms.has(x)));            // 드라이브 것 중 이 기기에서 지운 것은 빼고
                    S(m).forEach(x => { if (!bs.has(x) && !out.includes(x)) out.push(x); });   // 이 기기에서 더한 것
                    return '[' + out.join(',') + ']';
                }
            } catch (e) { console.warn('카페 기록을 합치지 못해서 이 기기 것으로 둬요:', k, e); return mine; }
            return pick();
        }
        /* 다른 기기 설정이 들어왔을 때 화면에 바로 보이는 것만 다시 (글꼴 · 페이지 · 보이는 것 · D-day) */
        async function applyRemoteSettings() {
            try {
                if (typeof patPrepare === 'function') await patPrepare();
                if (typeof loadBgPattern === 'function') loadBgPattern();       // 배경지 다시 적용 (js/skins.js)
                loadUIFont();
                if (typeof showApply === 'function') showApply();
                if (typeof ddRefresh === 'function') ddRefresh();
                if (typeof noticeRefresh === 'function') noticeRefresh();      // 📢 다른 기기에서 본 공지는 여기서도 그만 흔들려요 (js/service.js)
            } catch (e) { console.warn(e); }
        }

        /* 설정 · 목록 파일 올리기 (📱 한 기기 기준 · 도련 11-17 : 올리기 전에 드라이브를 묻거나 합치지 않아요 · 다른 기기 것은 돌아올 때 checkRemote) */
        async function writeKeyFile(which, mine) {
            const F = KEY_FILES[which];
            if (isDeskFile(which) && drive.deskLocked && !F.lazy) return;      // 🔐 못 연 책상배치 파일이 있으면 덮어쓰지 않아요
            if (F.lazy) { await keyFileLoad(which, mine); if (drive.lazyBad.has(which)) return; }   // 💤 아직 안 읽은 목록은 먼저 읽고 (고친 키는 그대로) · 못 연 목록은 덮어쓰지 않아요 (도련 11-07)
            return writeChunked(which, mine);                                     // 📚 나눠 담기 (모든 설정 · 목록 파일 · 도련 11-21)
        }

        /* 일기 하루 올리기 (📱 한 기기 기준 · 바로 덮어쓰기 · 도련 11-17) */
        async function writeDay(key) {
            const dk0 = parseDayKey(key);
            if (dk0 && dk0.b && window.dyyDead && dyyDead(dk0.b)) { drive.dirtyKeys.delete(key); if (window.dyyDeadSay) dyyDeadSay(dk0.b); return; }   // 🚛 🗑 버린 다이어리에는 저장하지 않아요 (폴더를 다시 만들지 않게 · 목록이 정답 · 도련 11-11)
            const val = store.getItem(key);
            const name = fileOfKey(key), lab = keyLabel(key);
            const idx = await idxOfKey(key, val !== null);                          // 올릴 때만 폴더 (📕 권 정보 파일) 를 만들어요
            if (!idx) return;                                                       // 지울 날인데 폴더도 없음
            await dayDupFix(idx, name, key);
            const f = idx.files.get(name);
            const cur = f && f.id ? f : null;                                       // 📱 한 기기 기준 (도련 11-17) : 아는 파일에 바로 (올리기 전에 다른 기기를 묻지 않아요 · 돌아올 때 checkRemote)
            if (val === null) {                                                     // 내용을 모두 지운 날 → 파일은 휴지통으로
                if (cur) await (window.appTrashDay ? appTrashDay(key, cur.id) : driveTrash(cur.id));   // 🗑 앱 휴지통 (그날 내용 · 30일)
                idx.files.delete(name); drive.dayMeta.set(key, '');
                return;
            }
            let saved;
            try { saved = await driveUpsert(idx.folderId, name, cur && cur.id, val); }    // 있으면 덮어쓰기, 없으면 새 파일
            catch (e) { if (!(e && e.code === 'gone' && cur)) throw e; idx.files.delete(name); saved = await driveUpsert(idx.folderId, name, null, val); }   // 그 사이 지워진 파일 → 새로
            if (dk0 && dk0.b && window.dyyUsedMark) dyyUsedMark(dk0.b);             // ✍️ 한 번 꾸미면 영원히 '쓴 다이어리' (도련 11-11 · 표지도)
            idx.files.set(name, { id: saved.id, name, modifiedTime: saved.modifiedTime });
            drive.dayMeta.set(key, saved.modifiedTime);
        }
        /* 📕 다이어리.json · 📔 상태.json 올리기 (📱 한 기기 기준 · 바로 덮어쓰기) */
        const stateMerge = (mine, theirs) => { const o = Object.assign({}, theirs || {}); Object.keys(mine || {}).forEach(k => { o[k] = mine[k] && typeof mine[k] === 'object' && !Array.isArray(mine[k]) ? Object.assign({}, (theirs || {})[k] || {}, mine[k]) : mine[k]; }); return o; };   // 못 올린 것 되살릴 때 (recoverPendingBackup)
        async function writeBook(key) {
            const st = isStateKey(key), id = st ? STATE_KEY_RE.exec(key)[1] : BOOK_KEY_RE.exec(key)[1];
            let val = store.getItem(key);
            if (val === null) return;
            const idx = await idxOfKey(key, true), nm = fileOfKey(key);
            const f = idx.files.get(nm), cur = f && f.id ? f : null;                // 📱 한 기기 기준 = 아는 파일에 바로 (합치지 않아요 · 도련 11-17)
            let saved;
            try { saved = await driveUpsert(idx.folderId, nm, cur && cur.id, val); }
            catch (e) { if (!(e && e.code === 'gone' && cur)) throw e; idx.files.delete(nm); saved = await driveUpsert(idx.folderId, nm, null, val); }
            idx.files.set(nm, { id: saved.id, name: nm, modifiedTime: saved.modifiedTime });
            drive.dayMeta.set(key, saved.modifiedTime);
        }

        /* 변경된 키 하나(또는 같은 설정 파일의 키 묶음)를 드라이브에 반영 */
        async function driveWriteKey(key, retried, mine) {
            try {
                if (isBookKey(key) || isStateKey(key)) await writeBook(key);
                else if (isOwnFile(key)) await writeDay(key);
                else await writeKeyFile(keyFile(key), mine || new Set([key]));
            } catch (e) {
                if (e && e.code === 'gone' && !retried) {
                    if (await rootGone()) { rootReset(); throw e; }           // 🗑 말랑달콤 폴더째 지워졌으면 새로 만들지 않고 처음 상태로 (평소 저장은 확인 없이 바로 올려요 · 도련 10-20)
                    resetDriveCaches(); return driveWriteKey(key, true, mine);
                }
                throw e;
            }
        }

        /* 업로드는 한 번에 하나씩(순서대로) 처리 → 같은 날짜 파일이 두 개 생기는 문제 방지 */
        /* 🗑 말랑달콤 폴더가 지워졌는지 (도련 10-20) : 이 창이 열려 있는 동안 본 폴더가 휴지통에 갔거나 없어졌으면 true
           (처음 쓰는 계정처럼 아직 폴더가 없던 건 아니에요 · 📁 이 기기 저장은 따로) */
        async function rootGone() {
            if (drive.local || !drive.rootId) return false;
            try { return !(await driveMeta(drive.rootId)); } catch (e) { return false; }
        }
        /* 지워졌으면 : 메모리 · 임시 보관본에 든 옛 내용을 올리지 않고 처음 상태로 다시 열어요 */
        async function rootReset() {
            drive.wiped = true; clearTimeout(uploadTimer); diag('root', {});
            drive.dirtyKeys.clear(); clearPending();
            const { forget } = await readAllPending(); await forget();
            location.reload();                                                  // 다시 열리면 = 초기화 (freshStart · 알림은 거기서 한 번)
        }
        function flushUpload(opts) {
            const force = !!(opts && opts.force);
            clearTimeout(uploadTimer); dirtySince = 0;
            uploadChain = uploadChain.then(async () => {
                if (!drive.ready || drive.guest) return false;
                if (force && isCoverOpen) {                                 // 💾 저장 버튼: 지금 보고 있는 날짜 파일을 한 번 더 덮어씀
                    const k = getDateKey(currentDate);
                    if (drive.loadedDays.has(k) && store.getItem(k) !== null && !(window.pgHeld && pgHeld(k))) drive.dirtyKeys.add(k);   // ✅ 완료 전 페이지는 올리지 않아요 (js/pagedone.js)
                }
                if (!drive.dirty || drive.wiped) return true;
                drive.uploading = true; updateBadge();
                let allOk = true, authFail = false, full = false;
                const sent = [];
                const done = new Set();
                for (const key of Array.from(drive.dirtyKeys)) {
                    if (done.has(key) || !drive.dirtyKeys.has(key)) continue;
                    /* 설정 키는 같은 파일 것을 한 번에 (파일 하나를 여러 번 올리지 않게) */
                    const group = isOwnFile(key) ? [key] : Array.from(drive.dirtyKeys).filter(k => !isOwnFile(k) && keyFile(k) === keyFile(key));
                    group.forEach(k => { drive.dirtyKeys.delete(k); done.add(k); });   // 올리는 도중 또 바뀌면 다시 표시됨
                    drive.inflight = key;
                    try { await driveWriteKey(key, false, new Set(group)); sent.push(isOwnFile(key) ? key : keyFile(key)); }
                    catch (e) {
                        group.forEach(k => drive.dirtyKeys.add(k)); allOk = false;
                        if (e && e.code === 'auth') { authFail = true; break; }
                        if (e && e.code === 'full') { full = true; break; }
                        console.warn('드라이브에 올리지 못했어요:', key, e);
                    }
                }
                drive.inflight = null; drive.uploading = false; drive.error = !allOk;
                if (full && !drive.full) {                                  // 💾 공간이 꽉 참 : 이 기기에 보관하고 알려요
                    drive.full = true; savePending();
                    showMsg('☁ 구글 드라이브 저장공간이 <b>가득 찼어요.</b><br>고친 내용은 이 기기에 보관해 둘게요.<br><span style="font-size:12px;color:#777;">지메일 · 구글 포토 등에서 필요 없는 파일을 지우면 자동으로 다시 저장해요.</span>');
                }
                if (allOk) {
                    drive.lastSaved = new Date(); drive.full = false;
                    if (!drive.dirty) clearPending();                       // 그 사이 새 변경이 없을 때만 임시 보관본 삭제
                } else {
                    savePending();                                          // 🛟 못 올렸으면 바로 이 기기에 보관 (도련 11-09 : 다시 하기를 기다리는 중에 앱이 갑자기 꺼져도 · 다음에 열면 복구 · 올리면 지워요)
                    if (!authFail) uploadTimer = setTimeout(() => flushUpload(), full ? 5 * 60000 : 30000);
                }
                updateBadge(); updateStorageInfo();
                return allOk;
            });
            return uploadChain;
        }

        /* ---------- 전체 목록 (백업 / 용량 확인용) ---------- */
        async function driveEnumerateAll(only) {                           // 📔 권 폴더마다 (only = 그 권만 · 🗂 꾸민 페이지만 보기)
            const out = new Map();
            for (const path of [DIARY_PATH]) {                                 // 📔 다이어리 폴더 하나 (날짜형 권 폴더만 · 페이지형 dk… 는 이름이 달라서 빠져요)
                const rootId = await getFolder(path, false); if (!rootId) continue;
                for (const dir of await driveList(`'${rootId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`, 'id,name')) {
                    const b = dyBookOfName(dir.name); if (!b || (only && b !== only)) continue;
                    (await driveList(`'${dir.id}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,size')).forEach(f => {
                        const r = parseDayFile(f.name); if (!r) return;
                        const key = dayKeyAt(r, b);
                        if (!out.has(key)) out.set(key, { key, id: f.id, size: +f.size || 0 });
                    });
                }
            }
            return Array.from(out.values());
        }

        /* 아직 읽지 않은 모든 날짜를 메모리로 읽기 (전체 백업용). 읽지 못한 파일 수를 돌려줌 */

        async function postLoginTasks() {
            await recoverPendingBackup();
            if (window.dfFix) dfFix();                                       // 🗂 꾸민 페이지만 보기 : 꾸민 날 목록 (js/skins.js)
            if (window.deskLoginShow) deskLoginShow();                       // 📔 로그인하면 늘 다이어리 겉표지 (js/desk.js)
            setTimeout(sealOld, 20000);                                      // 🔐 예전 파일 잠그기 (뒤에서 조금씩 · 도련 11-11)
        }
        window.sealOld = sealOld;
        /* 📱 태블릿 그림판 💾 임시저장 = 이 기기에만 (도련 11-14 · 다이어리 임시저장과 같게) : IndexedDB 'mallang-ppdraft' · 계정마다 · 종류마다 하나 · 자동으로도 저장 (js/padpaint.js)
           드라이브에는 임시저장 파일이 없어요 → 앱을 열 때 드라이브를 묻지 않아요 (예전 '도안/작업중-' 찾기는 없앴어요 · 도련 11-17 · 쓸데없는 요청 1번) */
        let ppdbP = null;
        const ppdb = () => ppdbP || (ppdbP = new Promise(ok => { try { const r = indexedDB.open('mallang-ppdraft', 1); r.onupgradeneeded = () => r.result.createObjectStore('d'); r.onsuccess = () => ok(r.result); r.onerror = r.onblocked = () => ok(null); } catch (e) { ok(null); } }));
        async function ppdTx(mode, fn) { const d = await ppdb(); if (!d) throw new Error('이 기기에 저장할 수 없어요'); return new Promise((ok, no) => { try { const t = d.transaction('d', mode), r = fn(t.objectStore('d')); t.oncomplete = () => ok(r ? r.result : true); t.onerror = t.onabort = () => no(t.error || new Error('idb')); } catch (e) { no(e); } }); }
        const ppdKey = k => pendWho() + '|' + k;
        async function draftRec(k) { return await ppdTx('readonly', st => st.get(ppdKey(k))) || null; }
        window.draftHas = async k => { const r = await draftRec(k); return r ? { at: r.at, size: 0 } : null; };
        window.draftRead = async k => { const r = await draftRec(k); return r ? r.obj : null; };
        window.draftWrite = async (k, obj) => { await ppdTx('readwrite', st => st.put({ k, at: Date.now(), obj }, ppdKey(k))); };
        window.draftDrop = async k => { await ppdTx('readwrite', st => st.delete(ppdKey(k))); };

        /* 드라이브에서 불러온 데이터를 화면에 반영 */
        function applyLoadedData() {
            if (typeof loadBgPattern === 'function') loadBgPattern();
            loadUIFont();
            if (isCoverOpen) loadData();
            updateStorageInfo();
            if (typeof lockAfterLoad === 'function') lockAfterLoad();       // 🔒 다이어리 잠금 (js/lock.js)
            if (typeof showApply === 'function') showApply();               // 👀 페이지에 보이는 것 (js/show.js)
            if (typeof ddRefresh === 'function') ddRefresh();               // ⏳ D-day (js/dday.js)
            if (typeof bgmLoadPref === 'function') bgmLoadPref();           // 🎵 배경음악 음량 · 반복 · 섞기 (js/bgm.js)
            handLoad();                                                      // ✋ 쓰는 손
            deskSync(); if (window.deskModeRender) deskModeRender();         // 🪑 책상 · 📖 다이어리 바탕 = 불러온 설정으로
            if (typeof dyLoad === 'function') dyLoad();                     // 📒 고른 다이어리 (js/skins.js)
            if (typeof dyySync === 'function') dyySync();                   // 📔 처음 온 다꾸러 = 그 해 기본 다이어리 선물 (js/dyyear.js)
            if (typeof bgoSync === 'function') bgoSync();                   // 🌈 처음 온 다꾸러 = 상품공방 '처음받기' 배경지 · 목록이 없으면 되살리기 (js/bgown.js)
            if (typeof dmkRescue === 'function') dmkRescue();               // 📓 🗂️ 내가 만든 노트 · 바인더 목록이 없으면 = 백업에서 (js/dymaker.js · 도련 11-06)
            if (typeof dsSync === 'function') dsSync();                     // 🧱 🪵 기본 벽지 · 기본 책상 (js/deskskin.js)
            if (typeof nwRefresh === 'function') nwRefresh();               // ✨ NEW 표시 (☁ diary_new · js/arrival.js)
            if (typeof svcDailyBadges === 'function') svcDailyBadges();     // 🔔 오늘 이미 본 알림 (☁ diary_daily_seen · js/service.js)
            if (window.mineSoon) mineSoon();                                 // 📦 내 실물 : 기기 것 → 바뀌었나 한 번 묻기 (js/mine.js · 30초에 한 번)
            const pd = document.getElementById('pageDateDisplay');          // 📅 날짜 바 페이지 수 ↔ 날짜 (☁ diary_bkview · js/skins.js)
            if (pd && isCoverOpen && typeof formatDate === 'function') pd.innerText = formatDate(currentDate);
        }

        /* ---------- 화면(UI) ---------- */
        function showGate(state, msg) {
            const g = document.getElementById('driveGate'), c = g.querySelector('.gate-card'), m = document.getElementById('gateMsg');
            if (!m) return;
            g.style.display = 'flex'; g.classList.remove('leave');
            if (state === 'login') gateOpened = false;                              // 🚪 로그인 화면을 봤으면 닫힐 때 문이 열려요
            msg = String(msg || '').replace(/^\s*☁\s*/, '');                    // 🎀 구름 글자 대신 하트 세 개가 기다려 줘요
            if (g.dataset.state !== state || m.innerHTML !== msg) { rePop(c, 'gate-swap'); }   // 같은 카드 안에서 스르륵 바뀌어요
            g.dataset.state = state;
            m.innerHTML = msg;
            const login = state === 'login';
            document.getElementById('gateLoginBtn').style.display = login ? 'flex' : 'none';
            document.getElementById('gateGuestBtn').style.display = login ? 'flex' : 'none';
            requestAnimationFrame(gateFit);
        }

        /* 🚪 → 🪑 (도련 10-26) : 💻 PC · 아이패드 = 로그인하면 문 쪽으로 다가가며 빛 → 빈 책상 위에 다이어리 (📱 폰은 지금 그대로)
           - 앱을 켜고 처음 한 번만 (백업 · 불러오기 진행 표시로 덮개를 다시 쓸 때는 그냥 닫혀요)
           - 폰 / 넓은 화면 = 화면의 짧은 쪽 600px (폰은 가로로 돌려도 폰) */
        let gateOpened = false;                                                  // showGate 보다 먼저 (처음 켤 때 'wait' → 자동 로그인도 문이 열려요)
        const deskWide = UI.wide;                                       // 🪑 책상을 펼 수 있는 화면 (js/uimode.js)
        /* 🪑 화면 = 기기로만 (도련 11-12 · 고르기 영구 삭제) : 💻 PC · 📲 패드 = 늘 책상 · 📱 폰 = 늘 하단 메뉴 (js/uimode.js UI.wide) */
        const deskUse = deskWide;
        function deskSync() {
            const H = document.documentElement, on = deskUse();
            H.classList.toggle('desk-wide', deskWide());
            H.classList.toggle('desk-on', on);
            if (window.dtrHome) dtrHome();                                     // 🍽 오늘 쓸 스티커 버튼 자리도 모드를 따라가요 (js/stktray.js)
        }
        function hideGate() {
            const g = document.getElementById('driveGate');
            if (gateOpened || !deskUse() || g.style.display === 'none' || calmMotion()) { gateOpened = true; g.classList.remove('leave'); g.style.display = 'none'; return; }
            gateOpened = true;
            g.classList.add('leave');
            setTimeout(() => { if (!g.classList.contains('leave')) return; g.classList.remove('leave'); g.style.display = 'none'; }, 2200);
        }
        window.addEventListener('resize', deskSync); deskSync();
        /* 🪑 다이어리를 펴 둔 동안 책상 빈 곳을 톡 = 다이어리를 책상에 다시 내려놓아요 (js/desk.js deskCloseDiary · 펴기는 책상 위 다이어리를 톡) */
        let deskDownXY = null;
        document.addEventListener('pointerdown', ev => { deskDownXY = [ev.clientX, ev.clientY]; }, true);
        document.addEventListener('pointerup', ev => {
            const H = document.documentElement, abUp = H.classList.contains('ab-up');   // 📒 🤍 책상에서 띄운 스티커첩도 다이어리와 같아요 (js/basket.js abUpLand · 도련 11-22)
            if (UI.menu() || !(H.classList.contains('desk-show') || abUp) || !deskDownXY) return;
            if (Math.hypot(ev.clientX - deskDownXY[0], ev.clientY - deskDownXY[1]) > 8) return;   // 끌기는 아니에요
            const t = ev.target;
            if (t.closest && t.closest('.diary-book, .toolbar, .modal, .drive-gate, #dskLayer, #abUpHost, button, input, textarea, select, a, [contenteditable]')) return;
            if (t !== document.body && t !== H && !(t.classList && (t.classList.contains('diary-wrapper') || t.classList.contains('desk-bg') || t.classList.contains('desk-stage')))) return;
            if (window.dkwAteAt && Date.now() - dkwAteAt < 450) return;           // ✋ 이 톡은 손에 든(마우스에 붙은) 문구 내려놓기였어요 (js/deskgd.js · 도련 11-12)
            if (!H.classList.contains('dk-bgon') && window.deskTapAt && deskTapAt(ev.clientX, ev.clientY)) return;   // 접힌 채 떠 있어 책상이 보이면 = 옆 소품 톡 = 그 소품의 기능 (js/desk.js)
            if (H.classList.contains('dk-bgon')) return;                         // 📔 다이어리모드 = 밖 톡으로는 안 나가요 · 오른쪽 위 ✕ 로만 (도련 11-15 · 묻고 닫기 js/desk.js dkModeExit)
            if (abUp && window.abUpLand) abUpLand();                             // 📒 🤍 덮인 스티커첩은 모두 내려앉아요 · 펼친 책은 그대로 (막대 ✕ 로만 · 다이어리처럼 · 여러 권 · 도련 11-22)
            if (H.classList.contains('desk-show') && window.deskCloseDiary) deskCloseDiary();
        });
        /* 🚪 로그인 화면 그림 속 레이스 알림판에 카드를 붙여요 (도련 10-26 · css .gate-art)
           그림은 화면을 꽉 채우고(cover) · 알림판 자리(그림 픽셀)를 화면 자리로 바꿔 카드 가운데를 맞추고 · 카드가 타원 안에 들어가게 줄여요 */
        const GATE_ART = {                                                      // ob : 레이스까지 포함한 알림판 바깥 (그림 픽셀) · 화면에 다 보이는 만큼 그림을 키워요 (커튼은 반쯤 잘려도 돼요 · 도련 10-26)
            wide: { w: 1672, h: 941, cx: 835, cy: 516, ow: 895, oh: 488, obw: 1150, bot: 850, z: .92 },   // z : 💻 가로는 조금 줌아웃 (커튼 묶은 리본까지 · 도련 10-26)
            tall: { w: 941, h: 1672, cx: 471, cy: 809, ow: 498, oh: 838, obw: 630, bot: 1310, z: 1 }
        };
        function gateFit() {
            const g = document.getElementById('driveGate'), c = g && g.querySelector('.gate-card');
            if (!c || g.style.display === 'none') return;
            g.classList.add('gate-art');
            const W = innerWidth, H = innerHeight, A = W / H < 1 ? GATE_ART.tall : GATE_ART.wide;
            const s = Math.max(W / A.w, H / A.h, Math.min(W / A.obw, H / A.bot) * A.z);   // 위 커튼부터 알림판 아래 레이스까지 화면에 (도련 10-26) · 꽉 채우기(cover)보다 작아지지는 않게
            const bx = Math.min(0, Math.max(W - A.w * s, W / 2 - A.cx * s)), by = Math.min(0, Math.max(H - A.h * s, H - A.bot * s));   // ↔ 알림판은 가로 가운데 · ↕ 그림 위(커튼)부터 · 알림판 아래가 잘리면 그만큼만 올려요
            g.style.backgroundSize = `${A.w * s}px ${A.h * s}px`; g.style.backgroundPosition = `${bx}px ${by}px`;
            const ow = A.ow * s, oh = A.oh * s;
            c.style.left = (bx + A.cx * s) + 'px'; c.style.top = (by + A.cy * s) + 'px'; g.style.transformOrigin = `${bx + A.cx * s}px ${by + (A.cy + 40) * s}px`;   // 🚪 문 열 때 다가가는 곳 (알림판 조금 아래 = 문 가운데)
            c.style.setProperty('--gs', 1);
            const cw = c.offsetWidth, ch = c.offsetHeight; if (!cw || !ch) return;
            const k = Math.min(1.8, Math.sqrt(1.25 / ((cw / ow) ** 2 + (ch / oh) ** 2)));   // 알림판 끝에 닿을 만큼 크게 (네모 카드의 모서리 = 타원 둘레)
            c.style.setProperty('--gs', k.toFixed(3));
        }
        window.addEventListener('resize', () => requestAnimationFrame(gateFit)); requestAnimationFrame(gateFit);

        /* ☁ 경고 알림 : 평소 저장은 알리지 않아요 · 게스트 · 로그인 만료 · 공간 꽉 참 · 저장 실패처럼 눌러야 하는 것만 떠요
           (로그인 만료 · 공간 · 실패 경고는 해결될 때까지 떠 있음) */
        let badgeLast = null, badgeTimer = null;
        function updateBadge() {
            const el = document.getElementById('driveBadge');
            if (!el) return;
            let text = '', warn = false, stay = false;
            if (drive.guest && typeof LOCAL_TEST !== 'undefined' && LOCAL_TEST) { text = ''; }   // 💻 로컬 테스트 : 이 브라우저에 저장 중이라 알림 없음 (녹화에도 안 찍혀요)
            else if (drive.guest) { text = '☁ 저장 안 됨 · 눌러서 로그인'; warn = true; }
            else if (!drive.ready) { return; }
            else if (drive.needAuth) { text = '⚠ 로그인이 만료됐어요 · 눌러서 다시 연결'; warn = true; stay = true; }
            else if (drive.full) { text = '⚠ 드라이브 공간이 꽉 찼어요 · 이 기기에 보관 중'; warn = true; stay = true; }
            else if (drive.error) { text = '⚠ 저장 실패 · 눌러서 다시 시도'; warn = true; stay = true; }
            /* 평소 저장(저장 중 · 대기 · 저장됨)은 알리지 않아요 : 몇 초마다 저장해서 자꾸 떠요 → 손이 필요한 문제만 보여요 */
            if (!text) { badgeLast = ''; clearTimeout(badgeTimer); el.classList.remove('show'); return; }
            if (text === badgeLast) return;                       // 바뀐 게 없으면 가만히
            badgeLast = text;
            el.textContent = text;
            el.classList.toggle('warn', warn);
            el.classList.add('show');
            clearTimeout(badgeTimer);
            if (!stay) badgeTimer = setTimeout(() => el.classList.remove('show'), warn ? 4000 : 2600);
        }

        async function onBadgeClick() {
            if (drive.guest) {
                const yes = await showMsg('구글 계정으로 로그인할까요?<br><span style="font-size:12px;color:#777;">' + (window.dvOn && dvOn() ? '이 브라우저에 쓴 일기는' : '게스트로 쓴 일기는') + ' 로그인한 뒤 내 드라이브로 옮길지 물어볼게요.</span>', true);
                if (yes) showGate('login', '☁ 구글 계정으로 로그인해 주세요.');
            } else if (drive.needAuth) {
                try { await requestToken('select_account'); await flushUpload({ force: true }); }
                catch (e) { showMsg('⚠ ' + driveErrorText(e)); }
            } else if (drive.error || drive.dirty) {
                flushUpload({ force: true });
            }
        }

        function driveErrorText(e) {
            const t = (e && (e.type || e.error || e.message)) || '';
            if (t === 'popup_closed') return '로그인 창이 닫혔어요. 다시 시도해 주세요.';
            if (t === 'popup_failed_to_open') return '팝업이 차단됐어요. 팝업을 허용한 뒤 다시 눌러 주세요.';
            if (t === 'scope') return '구글 허용 화면의 <b>드라이브 권한 두 칸을 모두</b> 체크해야 일기를 저장할 수 있어요. 다시 시도해 주세요.';
            if (t === 'access_denied') return '권한이 거부됐어요. 다시 시도해 주세요.';
            if (t === 'timeout') return '응답이 없어요. 다시 시도해 주세요.';
            if (t === 'corrupt') return '저장된 파일을 읽을 수 없어요. 데이터 보호를 위해 덮어쓰지 않았어요. 구글 드라이브 폴더를 확인해 주세요.';
            return '연결에 실패했어요. (' + t + ')';
        }

        /* ---------- 시작 / 로그인 / 로그아웃 ---------- */
        function waitForGoogle(ms) {
            return new Promise(resolve => {
                const t0 = Date.now();
                (function poll() {
                    if (window.google && google.accounts && google.accounts.oauth2) return resolve(true);
                    if (Date.now() - t0 > ms) return resolve(false);
                    setTimeout(poll, 100);
                })();
            });
        }

        function driveClientMake() {
            if (drive.client || !(window.google && google.accounts && google.accounts.oauth2)) return !!drive.client;
            drive.client = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: DRIVE_SCOPE,
                callback: (r) => { if (pendingToken) (r && r.error) ? pendingToken.err(r) : pendingToken.ok(r); },
                error_callback: (e) => { if (pendingToken) pendingToken.err(e); }
            });
            return true;
        }
        async function initDrive() {
            /* 🚪 첫 화면 (도련 11-09) : ☁ 구글로 로그인했던 기기 = 창 없이 바로 · 🏠 로그인 없이 쓰는 사람 = 열 때마다 첫 화면 (구글 로그인을 늘 권해요 · 이어 쓰기는 '로그인 없이 다꾸하기') */
            if (typeof LOCAL_TEST !== 'undefined' && LOCAL_TEST && typeof localTestStart === 'function') { await localTestStart(); return; }   // 💻 내 컴퓨터(localhost) : 로그인 없이 · 이 브라우저에 저장 (js/localtest.js)
            if (GOOGLE_CLIENT_ID.startsWith('YOUR_CLIENT_ID')) {
                showGate('config', '⚙ 코드 맨 위의 <b>GOOGLE_CLIENT_ID</b>에<br>발급받은 OAuth 클라이언트 ID를 넣어 주세요.');
                return;
            }
            showGate('wait', '☁ 구글 드라이브에 연결하는 중…');
            const fileHint = location.protocol === 'file:'
                ? '<br><br><span style="font-size:12px;color:#d6487f;">이 파일이 <b>file://</b>로 열려 있어요. 구글 로그인은 https 주소(GitHub Pages 등)나 localhost에서만 동작해요.</span>' : '';
            if (!(await waitForGoogle(10000))) {
                showGate('login', '구글 로그인 스크립트를 불러오지 못했어요.<br>인터넷 연결을 확인하고 새로고침해 주세요.' + fileHint);
                return;
            }
            driveClientMake();
            /* 이전에 로그인한 적이 있으면 창 없이 자동 로그인 시도 */
            let authed = false;
            try { authed = localStorage.getItem(AUTH_FLAG_KEY) === '1'; } catch (e) {}
            if (authed) {
                try { await requestToken('none'); await loadFromDrive(); hideGate(); postLoginTasks(); return; }
                catch (e) { if (e && e.type === 'corrupt') { showGate('login', driveErrorText(e)); return; } }
            }
            showGate('login', fileHint.replace(/^<br><br>/, ''));               // 설명은 두 버튼 안에 있어요
        }

        async function driveLogin() {
            if (drive.local && window.dvLogin) return dvLogin();                   // 🏠 이 브라우저로 쓰다가 구글로 (js/devsave.js)
            const guestDays = drive.guest ? guestSnapshot() : null;               // 👤 게스트로 쓴 일기 (로그인하면 메모리가 드라이브 것으로 바뀌어서 먼저 챙겨요)
            if (!drive.client && !driveClientMake() && await waitForGoogle(10000)) driveClientMake();   // 이 브라우저로 열었으면 구글 준비가 아직이에요
            showGate('wait', '☁ 구글 로그인 중이에요…<br>잠시만 기다려 주세요');      // 계정을 고른 뒤에도 보이는 글이라 '고르세요' 대신 (도련 10-21)
            try { await requestToken('select_account'); showGate('wait', '☁ 다이어리를 불러오는 중이에요…<br>잠시만 기다려 주세요'); await loadFromDrive(); hideGate(); await postLoginTasks(); }
            catch (e) { showGate('login', driveErrorText(e)); if (guestDays) guestHold = guestDays; return; }
            if (window.dvAfterLogin) dvAfterLogin();                              // 🏠 로그인 없이 쓰던 기기도 이제 드라이브로 열려요
            if (guestDays || guestHold) guestCarry(Object.assign({}, guestHold || {}, guestDays || {}));
        }
        /* 👤 게스트 일기 → 내 드라이브로 옮기기 (물어본 뒤 · 드라이브에도 있는 날은 "어느 쪽?") */
        let guestHold = null;                                                       // 로그인이 실패했을 때 다음 로그인까지 들고 있어요
        function guestSnapshot() {
            try { if (isCoverOpen && !turn) saveData(false); } catch (e) {}
            const o = {};
            store.keys().forEach(k => { if (isDayKey(k)) o[k] = store.getItem(k); });
            return Object.keys(o).length ? o : null;
        }
        async function guestCarry(days) {
            guestHold = null;
            const keys = Object.keys(days).filter(k => days[k] !== null).sort();
            if (!keys.length) return;
            if (!(await showMsg(`👤 게스트로 쓴 일기 <b>${keys.length}일치</b>가 있어요.<br>내 구글 드라이브에 옮길까요?<br><span style="font-size:12px;color:#777;">옮기지 않으면 게스트 일기는 사라져요.</span>`, true))) return;
            let moved = 0, left = keys.slice();
            for (let round = 0; left.length && round < 3; round++) {
                const next = [];
                for (const k of left) {
                    const dk = parseDayKey(k);
                    await ensureKeyLoaded(k);
                    if (!drive.loadedDays.has(k)) { next.push(k); continue; }         // 드라이브 것을 못 읽으면 덮지 않고 다시 시도
                    const cur = store.getItem(k), mine = days[k];
                    if (cur === mine) continue;
                    if (cur !== null && !(await showAsk(`📅 <b>${dayLabel(dk)}</b>은 드라이브에도 일기가 있어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 사라져요.</span>`, '👤 게스트로 쓴 것', '☁ 드라이브 것'))) continue;
                    if (cur !== null && cur !== mine && window.trashKeepDay) await trashKeepDay(k, cur);   // 🗑 드라이브 것은 휴지통에
                    store.setItem(k, mine); moved++;
                }
                left = next;
                if (left.length && round === 2) {
                    if (await showMsg(`⚠ ${left.length}일치는 드라이브를 읽지 못해서 아직 못 옮겼어요.<br>다시 시도할까요?<br><span style="font-size:12px;color:#777;">취소하면 그 날짜의 게스트 일기는 사라져요.</span>`, true)) round = -1;
                } else if (left.length) await new Promise(r => setTimeout(r, 1500));
            }
            if (!moved) return;
            applyLoadedData();
            const ok = await flushUpload({ force: true });
            showMsg(ok ? `☁ 게스트 일기 ${moved}일치를 내 드라이브에 옮겼어요!` : `☁ 게스트 일기 ${moved}일치를 옮기는 중이에요.<br><span style="font-size:12px;color:#777;">저장이 잠깐 실패해서 자동으로 다시 시도해요.</span>`);
        }

        function enterGuestMode() {
            drive.guest = true; drive.ready = false;
            if (typeof collGuestStart === 'function') collGuestStart();    // 게스트 모음은 이 기기에 (js/coll.js)
            applyLoadedData();                                              // 이 기기에 저장한 게스트 설정으로 다시 그려요 (고르기 전엔 처음 값이라 · 📔 다이어리 · 🌈 배경지 · 🧱 벽지도 여기서)
            hideGate(); updateBadge();
        }

        async function driveLogout() {
            window.__loClear = false;                                          // 🧹 이 기기 기록도 지우기 (도련 11-19 · 1318 · 공용 기기 · 고르면 js/settings.js logoutClear)
            const yes = await showMsg('로그아웃할까요?<br><span style="font-size:12px;color:#777;">구글 드라이브에 저장된 일기는 그대로 남아 있어요.</span>'
                + (window.logoutClear ? '<label style="display:flex;gap:6px;align-items:center;justify-content:center;margin-top:10px;font-size:13px;cursor:pointer"><input type="checkbox" id="loClearChk" onchange="window.__loClear = this.checked"> 이 기기에서 내 기록 지우기</label><span style="display:block;font-size:11px;color:#999;margin-top:2px">다른 사람과 같이 쓰는 기기라면 체크해 주세요</span>' : ''), true);
            if (!yes) return;
            if (drive.ready && drive.dirty) await flushUpload();
            if (window.__loClear && window.logoutClear) { try { await logoutClear(); } catch (e) { console.warn('🧹 로그아웃 지우기', e); } }
            try { localStorage.removeItem(AUTH_FLAG_KEY); } catch (e) {}
            location.reload();
        }

        /* =====================================================================
           📴 화면이 꺼지는 순간(잠금 / 홈 버튼 / 앱·탭 전환 / 창 닫기) 자동 저장
           - 아이폰·안드로이드·아이패드 모두 화면이 꺼지면 페이지가 '숨김' 상태가 되어
             visibilitychange(hidden) / pagehide / freeze 이벤트가 발생합니다.
           - 그 즉시 ① 편집 중인 내용을 메모리에 반영하고 ② 날짜별 json 파일로 업로드를 시작합니다.
           - 화면이 꺼지면 브라우저가 앱을 곧바로 멈출 수 있어서, 업로드가 끝나기 전에 멈추는 경우를
             대비해 이 기기에 임시 보관본도 함께 남기고, 다음에 열 때 자동으로 복구를 물어봅니다.
           ===================================================================== */
        /* 임시 보관 : 탭마다 따로 (탭 두 개가 서로 덮어쓰지 않게) · 두 곳에 같이 남겨요
           - localStorage : 바로 써져서 화면이 꺼지는 순간에도 안전 (약 5MB 까지)
           - IndexedDB    : 사진이 많은 날처럼 큰 내용도 담겨요 (수백 MB) */
        const PEND_TAB = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const PEND_LS = PENDING_KEY + ':' + PEND_TAB;
        let pendDbP = null;
        function pendDb() {
            if (!pendDbP) pendDbP = new Promise(ok => {
                try {
                    const r = indexedDB.open('mallang-pending', 1);
                    r.onupgradeneeded = () => r.result.createObjectStore('p');
                    r.onsuccess = () => ok(r.result); r.onerror = r.onblocked = () => ok(null);
                } catch (e) { ok(null); }
            });
            return pendDbP;
        }
        async function pendTx(mode, fn) {
            const db = await pendDb(); if (!db) return null;
            return new Promise(ok => {
                try {
                    const tx = db.transaction('p', mode), r = fn(tx.objectStore('p'));
                    tx.oncomplete = () => ok(r ? r.result : true); tx.onerror = tx.onabort = () => ok(null);
                } catch (e) { ok(null); }
            });
        }
        function savePending() {
            if (drive.wiped) return;
            try {
                const items = {}, b = {}, bv = {};
                drive.dirtyKeys.forEach(k => { items[k] = store.getItem(k); });          // null = 내용을 지운 날
                if (drive.inflight && !(drive.inflight in items)) items[drive.inflight] = store.getItem(drive.inflight);
                Object.keys(items).forEach(k => {                                         // 그때 드라이브 파일의 수정 시각 (기기 시계가 아니라 구글 시각)
                    if (isOwnFile(k)) { if (drive.dayMeta.has(k)) b[k] = drive.dayMeta.get(k); }
                    else if (isSettingKey(k)) {
                        const f = drive[KEY_FILES[keyFile(k)].prop]; b[k] = f && f.modifiedTime || '';
                        if (keyFile(k) === 'cafe' && drive.cafeBase.has(k)) bv[k] = drive.cafeBase.get(k);   // ☕ 합칠 때 기준
                    }
                });
                const rec = { savedAt: Date.now(), tab: PEND_TAB, who: pendWho(), items, b, bv };   // who : 어느 계정 · 어느 폴더 것인지
                try { localStorage.setItem(PEND_LS, JSON.stringify(rec)); }
                catch (e) { try { localStorage.removeItem(PEND_LS); } catch (x) {} }     // 너무 커서 못 담으면 옛 보관본이 남지 않게 지우고 IndexedDB 만
                pendTx('readwrite', st => st.put(rec, PEND_TAB));
            } catch (e) { /* 임시 보관은 포기하고 업로드만 시도 */ }
        }
        function clearPending() {
            try { localStorage.removeItem(PEND_LS); } catch (e) {}
            pendTx('readwrite', st => st.delete(PEND_TAB));
        }
        /* 이 기기에 남아 있는 모든 탭의 보관본 → 하나로 (같은 내용 칸은 가장 나중에 보관한 것) */
        /* 임시 보관본은 그것을 만든 곳(구글 계정 · 이 브라우저)에서만 복구해요 : 다른 계정 · 하드 폴더로 섞여 들어가지 않게 (도련 · 2026-10-13) */
        function pendWho() { return drive.local ? 'device' : 'g:' + ((typeof COLL !== 'undefined' && COLL.who) || ''); }
        async function readAllPending() {
            const recs = [], lsKeys = [], tabs = [], who = pendWho();
            const mine = r => r && r.items && r.who === who;
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(PENDING_KEY)) { try { const r = JSON.parse(localStorage.getItem(k)); if (mine(r)) { recs.push(r); lsKeys.push(k); } } catch (e) {} }
                }
            } catch (e) {}
            const vals = await pendTx('readonly', st => st.getAll());
            if (Array.isArray(vals)) vals.forEach(r => { if (mine(r)) { recs.push(r); if (r.tab) tabs.push(r.tab); } });
            const forget = async () => {
                lsKeys.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
                if (tabs.length) await pendTx('readwrite', st => { tabs.forEach(t => st.delete(t)); });
            };
            if (!recs.length) return { p: null, forget };
            recs.sort((a, b) => (a.savedAt || 0) - (b.savedAt || 0));               // 오래된 것부터 → 나중 것이 덮어요
            const p = { savedAt: 0, items: {}, b: {}, bv: {}, at: {} };
            recs.forEach(r => {
                if (typeof r.items !== 'object') return;
                Object.keys(r.items).forEach(k => {
                    p.items[k] = r.items[k]; p.at[k] = r.savedAt || 0;
                    if (r.b && k in r.b) p.b[k] = r.b[k]; else delete p.b[k];
                    if (r.bv && k in r.bv) p.bv[k] = r.bv[k]; else delete p.bv[k];
                });
                p.savedAt = Math.max(p.savedAt, r.savedAt || 0);
            });
            return { p, forget };
        }

        function saveOnScreenOff() {
            if (drive.reopening) return;                                        // ☁ 드라이브 것으로 새로 여는 중 = 버린 것을 남기지 않아요
            try { if (!turn) saveData(false); } catch (err) {}      // 편집 중인 글/스티커를 메모리(store)에 반영
            if (!drive.ready || drive.guest || drive.wiped) return;  // 로그인 전 · 게스트면 저장할 곳이 없음 · 🗑 폴더가 지워졌으면 올리지 않음
            if (drive.dirty || drive.uploading) {
                savePending();                                       // 업로드 전에 먼저 이 기기에 안전하게 보관
                if (drive.dirty) flushUpload();                      // 디바운스(3초) 기다리지 않고 즉시 업로드
            }
        }

        /* 다음에 열었을 때, 업로드되지 못한 임시 보관본(변경된 날짜만)이 있으면 복구
           - 기기 시계는 믿지 않아요 : 보관할 때 적어 둔 '그때 드라이브 파일의 수정 시각'과 지금 수정 시각을 비교해요
             · 같으면 그 사이 아무도 안 고친 것 → 이 기기 것을 그대로 올려요
             · 다르면 그 사이 다른 기기가 고친 것 → 일기 = 이 기기 것 (다른 기기 것은 🗑 휴지통) · 설정 = 나중에 바꾼 쪽
             · 🤫 묻지 않아요 (도련 11-22 : 사용자는 어떻게 할지 몰라요 · 앱이 알아서)
             · ☕ 카페 기록은 묻지 않고 양쪽을 합쳐요 (cafeMerge)
           - 지금 드라이브 내용이 보관본과 같으면 (이미 올라감) 아무것도 안 해요 */
        async function recoverPendingBackup() {
            const { p, forget } = await readAllPending();
            if (!p) { await forget(); return; }
            if (!drive.local && !(await getFolder([TOP_FOLDER_NAME], false).catch(() => 'x'))) { await forget(); return; }   // 🗑 말랑달콤 폴더가 없으면 옛 보관본은 버려요 (처음 상태)
            const B = p.b && typeof p.b === 'object' ? p.b : {}, BV = p.bv && typeof p.bv === 'object' ? p.bv : {};
            const safe = [], cafe = [], askDays = [], askSet = [];
            let keep = false;                                                           // 💤 목록을 못 읽어 비교 못 한 칸이 있으면 보관본을 지우지 않아요
            for (const k of Object.keys(p.items)) {
                const v = p.items[k];
                if (!k.startsWith('diary_') && !VAULT_KEYS.includes(k) && !isPageKey(k) && !isBookKey(k) && !isStateKey(k)) continue;
                if (!(v === null || typeof v === 'string')) continue;
                const dk = isOwnFile(k);
                let now;
                if (dk) {
                    await ensureKeyLoaded(k);
                    if (!drive.loadedDays.has(k)) continue;                             // 드라이브 내용을 읽지 못하면 건드리지 않음
                    if (isBookKey(k)) { if (v) store.setItem(k, JSON.stringify(dkInfoMerge(JSON.parse(v), JSON.parse(store.getItem(k) || '{}')))); continue; }
                    if (isStateKey(k)) { if (v) store.setItem(k, JSON.stringify(stateMerge(JSON.parse(v), JSON.parse(store.getItem(k) || '{}')))); continue; }   // 📔 상태.json 도 묻지 않고 합쳐요   // 📕 다이어리.json 은 묻지 않고 합쳐요
                    const idx = await idxOfKey(k, false);
                    const f = idx && idx.files.get(fileOfKey(k));
                    now = f ? f.modifiedTime || '' : '';
                } else if (isSettingKey(k)) {
                    const w = keyFile(k);
                    if (KEY_FILES[w].lazy) {                                            // 💤 쓸 때 읽는 목록 (소품 · 배경지 · 빈스티커첩 · 바인더 재료 …) = 비교하기 전에 먼저 읽어요 (도련 11-09 · 안 읽고 비교하면 아무도 안 고쳤는데 '다른 기기가 고쳤어요'로 물었어요)
                        try { await keyFileLoad(w); } catch (e) { keep = true; continue; }   // 못 닿으면 이 칸은 보관본을 남겨 두고 다음에 다시
                        if (drive.lazyBad.has(w)) continue;                             // 🔐 못 여는 목록 = 덮어쓰지 않아요
                    }
                    const sf = drive[KEY_FILES[w].prop];
                    now = sf && sf.modifiedTime || '';
                } else continue;
                if (store.getItem(k) === v) continue;                                   // 내용이 같음 (이미 올라갔어요)
                if (!dk && keyFile(k) === 'cafe') cafe.push(k);
                else if (k in B && B[k] === now) safe.push(k);                          // 그 사이 아무도 안 고쳤어요
                else (dk ? askDays : askSet).push(dk ? k : [k, now]);                   // 그 사이 다른 기기가 고쳤어요 (설정 = 드라이브 시각도)
            }
            if (!keep) await forget();
            if (!safe.length && !cafe.length && !askDays.length && !askSet.length) return;
            const put = k => { const v = p.items[k]; if (v === null) store.removeItem(k); else store.setItem(k, v); };
            let any = false;
            try {                                                               // 🤫 묻지 않고 앱이 알아서 (도련 11-22 '사용자는 이런 메세지가 나오면 어떻게 할지 몰라요')
                safe.forEach(put);                                              // 그 사이 아무도 안 고쳤어요 = 이 기기 것을 그대로 올려요
                cafe.forEach(k => { const m = cafeMerge(k, BV[k], p.items[k], store.getItem(k)); if (m !== store.getItem(k)) store.setItem(k, m); });   // ☕ 카페 기록 = 양쪽을 합쳐요
                for (const k of askDays) { if (window.trashKeepDay) await trashKeepDay(k, store.getItem(k)); put(k); }   // 📔 일기 = 이 기기 것 · 다른 기기 것은 🗑 휴지통에 (되살릴 수 있어요)
                for (const [k, now] of askSet) { if ((p.at[k] || 0) >= (Date.parse(now) || 0)) put(k); }   // ⚙ 설정 = 나중에 바꾼 쪽
                any = true;
                if (!any) return;
                applyLoadedData();
                await flushUpload({ force: true });
            } catch (e) { showMsg('⚠ 복구에 실패했어요.'); }
        }

        /* 로그인 토큰이 곧 만료되면 화면이 켜져 있을 때 미리 갱신 (꺼진 상태에서는 갱신이 안 될 수 있음) */
        async function refreshTokenIfNeeded() {
            if (!drive.ready || drive.guest || drive.uploading || document.hidden || !drive.client) return;
            if (drive.token && Date.now() < drive.expiresAt - 10 * 60 * 1000) return;
            try { await requestToken('none'); updateBadge(); } catch (e) {}
        }
        setInterval(refreshTokenIfNeeded, 5 * 60 * 1000);

        /* =====================================================================
           📱💻 다른 기기에서 바꾼 것 (📱 한 기기 기준 · 도련 11-17)
           - 켤 때 = drcBoot : 계정 1번 + 바뀐 것 묻기(changes) 1번 → 바뀐 것만 받고 나머지는 이 기기 기억 (js/drcache.js)
           - 앱 · 창으로 돌아올 때 = checkRemote : 바뀐 것 묻기 1번 → 바뀐 파일만 다시 받기 (refreshChanged) · 켜 둔 동안 저절로는 안 물어요
           ===================================================================== */
        let lastRemoteCheck = 0, remoteChecking = null;
        /* 🔔 다른 기기 확인 = 구글 changes 요청 1번 (도련 11-17 · 📱 한 기기 기준)
           - 사용자는 한 번에 한 기기만 써요 → 올릴 때 합치기 · 탭끼리 알림 · 매번 새로 받기는 없앴어요
           - 남긴 것 하나 : 화면만 꺼 둔 폰 · 패드 (또는 덮개 닫은 노트북) 로 돌아왔는데 그 사이 다른 기기에서 바꿨으면
               → 이 기기에 아직 안 올린 것이 없으면 = 알리고 드라이브 것으로 새로 열기
               → 있으면 = 물어봐요 [☁ 드라이브 것] (이 기기에서 바꾼 것은 버려요) · [📱 이 기기 것] (다른 기기에서 바꾼 것 위에 덮어써요)
           - 내 것 = 이 창이 올리거나 만들거나 지운 파일 (mineWrote · gfetch 가 기억 · 같은 지문 md5 / 같은 수정 시각) → 바뀐 걸로 안 쳐요
           - 한 번에 받을 수 있는 건 다 받아요 (changes(*) · 점수 같아요 · 상황판 기록용) · 표시(changeTok)는 이 창 메모리 (앱을 새로 열면 어차피 다 새로 읽어요) */
        let changeTok = null;
        const mineAt = new Map(), mineIds = new Set();                       // 파일 id → { mt, md5 } 내가 올린 모습 · 이 창이 손댄 파일 id
        function mineWrote(f) { if (f && f.id) { mineIds.add(f.id); if (f.modifiedTime || f.md5Checksum) mineAt.set(f.id, { mt: f.modifiedTime || '', md5: f.md5Checksum || '' }); if (mineAt.size > 500) mineAt.delete(mineAt.keys().next().value); } return f; }
        window.driveMineTouch = id => { if (id) mineIds.add(id); };          // 지우기 · 휴지통 · 폴더 만들기 (gfetch 가 저절로)
        async function changesStart() {
            changeTok = null;
            if (drive.local) return;
            try { const res = await gfetch('https://www.googleapis.com/drive/v3/changes/startPageToken'); if (res.ok) changeTok = (await res.json()).startPageToken || null; } catch (e) {}
        }
        const CH_SPACES = 'drive,appDataFolder';
        /* 🗑 휴지통 · 지워진 파일 = 기억해 둔 파일 번호에서 빼요 (js/own.js · 도련 11-17 · 예전 = 번호마다 살아 있나 물었어요) */
        function drcGone(chs) { const ids = new Set((chs || []).filter(c => c.removed || !c.file || c.file.trashed).map(c => c.fileId)); if (!ids.size) return; ids.forEach(id => drive.alive.delete(id)); if (window.ownForgetIds) ownForgetIds(ids); }   // 📁 살아 있다고 본 폴더도 (새 파일 만들기 전 다시 확인)                              // 📒 숨은 장부(앱 데이터 칸)도 같은 요청에 (도련 11-17)
        /* ⚡ 켤 때 (도련 11-17 "요청 1번으로 다 알아보고 바뀐 것만") : 계정 1번 + 지난번 표시부터 바뀐 것 1번 → 바뀐 것만 잊고 나머지는 이 기기 기억 (js/drcache.js)
           표시가 없거나 (처음 · 지웠어요) 구글이 안 받아 주면 = 기억을 버리고 예전처럼 다 읽어요 (읽은 것은 다음을 위해 기억해요) */
        async function drcBoot() {
            if (drive.local || !window.DRC) { drive.drcBoot = { n: -1, ch: null }; return changesStart(); }   // 🏠 = 기기 안이라 요청이 없어요 (js/mine.js 는 켤 때 한 번 맞춰 봐요)
            DRC.off();
            const AB = 'https://www.googleapis.com/drive/v3/about?fields=user(permissionId)';   // js/coll.js collWhoami 와 같은 주소 (그쪽은 이 창 기억에서 꺼내요)
            let who = '', at = '';
            try { const r = await gfetch(AB); if (r.ok) { at = await r.text(); who = ((JSON.parse(at) || {}).user || {}).permissionId || ''; } } catch (e) {}
            const tok = who ? await DRC.boot(who) : '';
            if (who && at) DRC.keep(AB, new Response(at)).catch(() => {});
            if (!who) { if (window.ownForgetAllIds) ownForgetAllIds(); drive.drcBoot = { n: -1, ch: null }; return changesStart(); }
            if (tok) {
                let t = tok, ok = false; const all = [];
                try {
                    for (let i = 0; i < 20 && t; i++) {
                        const res = await gfetch(`https://www.googleapis.com/drive/v3/changes?pageToken=${encodeURIComponent(t)}&pageSize=1000&spaces=${CH_SPACES}&fields=*`);
                        if (!res.ok) break;
                        const j = await res.json(); all.push(...(j.changes || []));
                        if (j.newStartPageToken) { changeTok = j.newStartPageToken; ok = true; break; }
                        t = j.nextPageToken;
                    }
                } catch (e) {}
                if (ok) { await DRC.apply(all); drcGone(all); await DRC.ready(changeTok); drive.drcBoot = { n: all.length, ch: all }; return; }
            }
            await DRC.wipe(); if (window.ownForgetAllIds) ownForgetAllIds();   // 바뀐 것을 모르는 사이가 생겼어요 → 기억한 파일 번호도 버리고 폴더에서 다시 찾아요
            await changesStart(); if (changeTok) await DRC.ready(changeTok); drive.drcBoot = { n: -1, ch: null };
        }
        const changeMine = c => { if (!mineIds.has(c.fileId)) return false; if (c.removed || !c.file || c.file.trashed) return true; const m = mineAt.get(c.fileId); return !m || (!!c.file.md5Checksum && c.file.md5Checksum === m.md5) || (!!m.mt && c.file.modifiedTime === m.mt) || c.file.mimeType === FOLDER_MIME; };
        async function changesForeign() {                                    // → 다른 기기가 바꾼 것들 [] · null = 모름 (처음 · 실패 → 안 물어요)
            if (drive.local) return [];
            if (!changeTok) { await changesStart(); return []; }
            let tok = changeTok; const out = [];
            try {
                for (let i = 0; i < 20 && tok; i++) {
                    const res = await gfetch(`https://www.googleapis.com/drive/v3/changes?pageToken=${encodeURIComponent(tok)}&pageSize=1000&spaces=${CH_SPACES}&fields=*`);
                    if (!res.ok) { changeTok = null; if (window.DRC) await DRC.wipe(); if (window.ownForgetAllIds) ownForgetAllIds(); return null; }   // 표시가 안 맞으면 기억도 버려요 (다음에 켤 때 다 읽어요)
                    const j = await res.json();
                    if (window.DRC) await DRC.apply(j.changes || []);              // ⚡ 바뀐 것은 기억에서 잊어요 (내 것 · 다른 기기 것 모두)
                    drcGone(j.changes);
                    (j.changes || []).forEach(c => { if (c.fileId && !changeMine(c) && !(c.file && ((c.file.spaces || []).includes('appDataFolder') || c.file.name === LEDGER_NAME))) out.push(c); });   // 📒 장부는 화면과 상관없어요 (다음에 쓸 때 다시 읽어요)
                    if (window.mineHint) (j.changes || []).forEach(c => { if (!changeMine(c)) mineHint(c.fileId); });   // 📦 내 실물 목록
                    if (j.newStartPageToken) { changeTok = j.newStartPageToken; drive.lastChanges = j.changes || []; if (window.DRC && DRC.on) await DRC.ready(changeTok); return out; }
                    tok = j.nextPageToken;
                }
            } catch (e) { return null; }
            changeTok = null; return null;
        }
        function checkRemote(force) {
            if (!drive.ready || drive.guest || document.hidden || drive.needAuth || drive.wiped || drive.reopening) return Promise.resolve();
            if (!force && Date.now() - lastRemoteCheck < 60000) return Promise.resolve();   // ⏱ 60초 안에 또는 안 물어요 (도련 11-17 · 예전 50초)
            if (remoteChecking) return remoteChecking;
            lastRemoteCheck = Date.now();
            remoteChecking = (async () => {
                const ch = await changesForeign();                             // 🔔 요청 1번 (바뀐 게 없으면 여기서 끝)
                if (!ch || !ch.length) return;
                drive.lastForeign = ch.map(c => ({ id: c.fileId, name: c.file ? c.file.name : '(지움)', at: c.time }));   // 📊 상황판 · 점검
                if (ch.some(c => c.fileId === drive.rootId && (c.removed || !c.file || c.file.trashed))) { rootReset(); return; }   // 🗑 다른 기기에서 말랑달콤 폴더를 지웠으면 이 창도 처음 상태로 (changes 안에 있어요 · 따로 묻지 않아요)
                diag('remote', { n: ch.length });
                try { if (!turn) saveData(false); } catch (e) {}           // 쓰던 글을 먼저 메모리에
                const mineN = drive.dirtyKeys.size;
                let useDrive = true;
                if (mineN) useDrive = await showAsk(`📱 다른 기기에서 바뀐 내용이 있어요.<br>이 기기에도 아직 드라이브에 못 올린 것이 <b>${mineN}개</b> 있어요.<br>어느 쪽을 쓸까요?<br><span style="font-size:12px;color:#777;">☁ 드라이브 것 = 이 기기에서 바꾼 것은 버려요<br>📱 이 기기 것 = 다른 기기에서 바꾼 것 위에 덮어써요</span>`, '☁ 드라이브 것', '📱 이 기기 것');
                if (!useDrive) { flushUpload({ force: true }); return; }
                if (!mineN && await refreshChanged(ch)) return;               // ⚡ 바뀐 파일만 다시 받아요 (도련 11-17 · 새로 열기 21번 → 바뀐 것만)
                driveReopen(mineN ? '' : '📱 다른 기기에서 바뀐 내용이 있어서 새로 불러올게요.');
            })().catch(e => console.warn('다른 기기 변경 확인 실패:', e)).finally(() => { remoteChecking = null; });
            return remoteChecking;
        }
        /* ⚡ 바뀐 파일만 다시 받기 (도련 11-17) : changes 에 나온 파일 = 설정 · 목록 파일 · 일기 장 · 스티커 · 소품 · 문구 폴더 → 그 파일만 다시 읽어서 바꿔 끼우고 다시 그려요
             모르는 파일이 하나라도 있으면 false (→ 예전처럼 새로 열기 · 가장 확실) · 폴더 · 📦 내 실물(js/mine.js 가 따로) · 지운 파일(목록이 바뀌어서 같이 와요)은 넘어가요 */
        async function refreshChanged(ch) {
            try {
                const pathOf = new Map([...drive.folderIds.entries()].map(([k, v]) => [v, k]));   // 폴더 번호 → 경로
                const keyWhich = (id, f) => {
                    for (const w of Object.keys(KEY_FILES)) {
                        const F = KEY_FILES[w], dir = drive.folderIds.get(F.path.join('/'));
                        if (drive.chunks[w] && [...drive.chunks[w].files.values()].some(x => x.id === id)) return w;
                        if (f && dir && (f.parents || []).includes(dir) && chunkRe(F).test(f.name)) return w;   // 다른 기기가 새로 만든 목록 파일
                    }
                    return '';
                };
                const reKeys = new Map(), reDays = new Set();                  // which → 바뀐 파일 (번호를 알면 찾지 않고 바로 읽어요)
                for (const c of ch) {
                    const f = c.file, gone = c.removed || !f || f.trashed;
                    if (f && f.mimeType === FOLDER_MIME) continue;
                    if (f && (/^_실물/.test(f.name) || f.name === '_문제기록.json')) continue;   // 📦 js/mine.js mineHint · 🧾 예전 문제기록 파일 (읽지 않아요 · 이제 안 만들어요)
                    const w = keyWhich(c.fileId, f); if (w) { reKeys.set(w, gone ? null : f); continue; }
                    const par = f && (f.parents || [])[0];
                    const idx = [...drive.monthIndex.values(), ...drive.books.values()].find(e => e && ((par && e.folderId === par) || [...e.files.values()].some(x => x.id === c.fileId)));
                    if (idx) {                                                   // 📔 일기 장 · 다이어리.json · 상태.json
                        const nm = f ? f.name : ([...idx.files.entries()].find(([, x]) => x.id === c.fileId) || [])[0];
                        if (nm) { if (gone) idx.files.delete(nm); else idx.files.set(nm, { id: c.fileId, name: nm, modifiedTime: f.modifiedTime, size: f.size }); }
                        [...drive.loadedDays].forEach(k => { if (fileOfKey(k) === nm) reDays.add(k); });
                        continue;
                    }
                    const pf = par && ch.find(x => x.fileId === par && x.file), pn = pf && pf.file.name;   // 새 권 폴더 이름 (같은 changes 안)
                    const bdir = k => { const pg = parsePageKey(k), d = !pg && parseDayKey(k); return pg ? dkBookDir(pg.b) : d ? dyBookDir(d.b) : null; };
                    const lk = f && !gone && pn && [...drive.loadedDays].filter(k => fileOfKey(k) === f.name && (bdir(k) || []).slice(-1)[0] === pn);
                    if (lk && lk.length) {                                       // 📔 이 기기가 '아직 없음'으로 본 장을 다른 기기가 처음 만들었어요 (새 권 폴더) → 그 폴더만 알려 주고 다시
                        lk.forEach(k => {
                            const pg = parsePageKey(k), d = !pg && parseDayKey(k);
                            if (pg) { drive.folderIds.set(dkBookDir(pg.b).join('/'), par); drive.books.delete(pg.b); }
                            else if (d) { drive.folderIds.set(dyBookDir(d.b).join('/'), par); drive.monthIndex.delete('all:' + d.b); }
                            reDays.add(k);
                        });
                        continue;
                    }
                    const pk = par && pathOf.get(par);
                    if (pk && window.ownForgetDir && ownForgetDir(pk, c.fileId)) continue;   // 🎀 스티커 (목록 · 스티커첩 · 종이)
                    if (par && window.collForgetDir && collForgetDir(par)) continue;          // 🪑 ✏️ 🌈 받은- · 모음 목록
                    if (gone) continue;                                          // 지운 것 = 목록이 같이 바뀌어요
                    diag('remote-unknown', { name: f && f.name }); return false;  // 모르는 파일 → 새로 열기
                }
                for (const w of reKeys.keys()) {                                   // 설정 · 목록 파일 (그 파일만)
                    const F = KEY_FILES[w];
                    if (F.lazy && !(drive.lazyOn && drive.lazyOn.has(w))) { delete drive.chunks[w]; drive[F.prop] = null; continue; }   // 💤 아직 안 읽은 것 = 쓸 때 새로
                    const o = await fetchKeyFile(w) || {};
                    const ks = new Set(Object.keys(o).concat(store.keys()).filter(k => keyFile(k) === w));
                    ks.forEach(k => { if (drive.dirtyKeys.has(k)) return; const v = k in o ? JSON.stringify(o[k]) : null; if (store.getItem(k) !== v) store.putLoaded(k, v); });
                    if (w === 'cafe') drive.cafeBase = new Map(Object.keys(o).map(k => [k, JSON.stringify(o[k])]));
                    if (GONE_OF[w]) goneScrub(w);
                }
                for (const k of reDays) { drive.loadedDays.delete(k); drive.dayMeta.delete(k); await ensureKeyLoaded(k); }   // 📔 읽어 둔 장만 다시
                diag('remote-part', { keys: reKeys.size, days: reDays.size });
                applyLoadedData(); updateBadge();
                return true;
            } catch (e) { console.warn('바뀐 파일만 받기 실패 → 새로 열기', e); return false; }
        }
        async function driveReopen(msg) {                                    // ☁ 드라이브 것으로 새로 열기 = 이 기기에서 못 올린 것은 버리고 앱을 다시 열어요 (가장 확실해요)
            drive.reopening = true; clearTimeout(uploadTimer);
            drive.dirtyKeys.clear(); try { clearPending(); } catch (e) {}
            if (msg && window.showMsg) await showMsg(msg);
            location.reload();
        }
        /* ⏱ 1분마다 확인은 없앴어요 (도련 11-13 : 두 기기를 동시에 켜 두고 쓰는 사람은 거의 없어요 · 구글 요청 아끼기)
           → 앱으로 돌아올 때(화면 켜기 · 앱 전환 = visibilitychange) · 💻 창으로 돌아올 때(focus)만 확인해요 (60초 안에 또는 안 물어요 · 도련 11-17)
           (예전 '같은 기기 다른 탭 알림' · '올리기 직전 확인 · 합치기'는 11-17 📱 한 기기 기준으로 없앴어요) */
        window.addEventListener('focus', () => checkRemote());

        /* 화면 꺼짐 / 앱 전환 (아이폰·안드로이드·아이패드 공통) */
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) saveOnScreenOff();
            else { refreshTokenIfNeeded(); checkRemote(); }
        });
        /* 아이폰 사파리·홈 화면 앱에서 페이지가 떠날 때 (visibilitychange 보완) */
        window.addEventListener('pagehide', saveOnScreenOff);
        /* 안드로이드 크롬 등에서 페이지가 동결될 때 */
        document.addEventListener('freeze', saveOnScreenOff);
        /* 데스크톱에서 창/탭을 닫을 때 */
        window.addEventListener('beforeunload', (e) => {
            saveOnScreenOff();
            if (drive.ready && !drive.guest && !drive.wiped && (drive.dirty || drive.uploading)) { e.preventDefault(); e.returnValue = ''; }
        });



/* 🔁 목록 받기 : 실패하면 받을 때까지 알아서 다시 해요 (모든 목록 창 공통 · 숨은 창까지)
   keepTrying(fn, { alive, onTry, max, stop })
   - fn : 목록을 받는 일 (실패하면 throw)
   - alive() : 그 창이 아직 열려 있는지 · 닫으면 그만둬요 (없으면 계속)
   - onTry(n) : n번째로 다시 하기 전에 안내 글씨 바꾸기
   - max : 최대 몇 번까지 (없으면 받을 때까지) · stop(e) : true 면 기다려도 소용없는 실패라 바로 그만둬요
   ⏱ 5초마다 한 번씩 : 한 번에 5초까지 기다리고(답이 없으면 실패) → 바로 다시 · 빨리 실패하면 5초를 채운 뒤 다시
      서버가 잠에서 깨느라 느릴 수 있어서 4번째부터는 한 번에 10초까지 기다려요 (도련 · 2026-10-13)
   인터넷이 끊겼으면 다시 연결될 때 바로 */
const KT_EVERY = 5000, KT_WAIT = 5000, KT_WAIT_SLOW = 10000;
const KT_MSG = n => `⏳ 다시 불러오는 중이에요… (${n}번째)`;
const ktShown = el => !!(el && el.isConnected && el.getClientRects().length);       // 화면에 보이는 칸인지 (창이 열려 있는지)
function ktWait(ms) {
    return new Promise(ok => {
        if (navigator.onLine === false) { const on = () => { removeEventListener('online', on); ok(); }; addEventListener('online', on); return; }
        setTimeout(ok, ms);
    });
}
async function keepTrying(fn, o) {
    o = o || {};
    for (let n = 1; ; n++) {
        const t0 = Date.now();
        let timer = 0;
        try {
            return await Promise.race([fn(), new Promise((_, no) => { timer = setTimeout(() => no(new Error('timeout')), n <= 3 ? KT_WAIT : KT_WAIT_SLOW); })]);
        } catch (e) {
            if ((o.stop && o.stop(e)) || (o.max && n >= o.max) || (o.alive && !o.alive())) throw e;
            if (o.onTry) try { o.onTry(n + 1, e); } catch (x) {}
            await ktWait(Math.max(0, KT_EVERY - (Date.now() - t0)));
            if (o.alive && !o.alive()) throw e;
        } finally { clearTimeout(timer); }
    }
}

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['drive'] = true;
