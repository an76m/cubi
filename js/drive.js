/* 말랑달콤 다이어리 - js/drive.js
   ☁ 구글 로그인 · 드라이브 저장/불러오기 · 화면 꺼짐 자동 저장  ⚠ 저장의 핵심 - 꼭 필요할 때만 수정
   ※ 파일 불러오는 순서: drive → app → page → elements → settings → service (index.html 참고) */
        /* =====================================================================
           ☁ 구글 드라이브 저장소 : 내 드라이브의 '말랑달콤' 폴더 하나에 모두 모여요
           📁 폴더 구조 (도련 10-26 · 10-28 고침) : 말랑달콤 바로 아래에 '종류' 폴더만 한 줄로 · 무료 · 유료 · 이벤트 · 공유 모두 종류가 같으면 같은 폴더 (받은 곳은 파일 안 · 목록에)
              - 상품 하나 = 따로 하나 (현실처럼 · 같은 것도 또 받아요) : 파일이 여러 개인 상품(📔 다이어리)은 한 개에 폴더 하나 · 파일 하나인 상품(🪑 소품 · ✏️ 문구)은 한 개에 파일 하나
              - 🏷️ 스티커는 예외 (바구니 ↔ 스티커첩으로 옮겨 다녀서 목록 하나 · js/own.js)
              - 새 종류 = DIRS · DESK_DIRS · GD_DIRS 에 한 줄 · 작은 기록은 비슷한 것끼리 한 파일 (카페기록 · 설정)
             말랑달콤 / 날짜바인더 / 2026 분홍 1 / 2026-10-28.json · 검색.json   📔 날짜형 바인더 1년치 (기본으로 주는 것 · 한 권 = 폴더 · '해 디자인 번호' · js/dyyear.js)
                      / 날짜노트 / 2027 딸기 1 / …                       📔 날짜형 노트 1년치 (나중 · 유료)
                      / 페이지바인더 · 페이지노트 / <권 id>-다이어리.json · <권 id>-3페이지.json …   📕 페이지형 30장 (지금 숨김 · 팔 때 한 권 = 폴더로)
                      / 페이지꾸밈 · 배경지 · 노트표지 · 바인더표지 · 바인더내지 / 내-<id>.json · 받은-<id>.json · 내-목록1.json · 받은-목록1.json   📚 모음 (js/coll.js)
                      / 스티커목록 / 목록.json · 스티커첩.json · 백업          🎒 유한 스티커 (js/own.js)
                      / 씰 · 조각 · 모조지 · 마테 · 떡메 · 메모지 · 속지 / <id>.json (내 종이 · 암호화) · 내-/받은- (공유하기 · 보류)
                      / 서랍장 · 시계 · 책꽂이 … 소품바구니 … (DESK_DIRS) / 받은-<id>.json · 받은-목록N.json   🪑 책상 소품 하나에 파일 하나
                      / 핀셋 · 가위 · 펀칭기 … (GD_DIRS) / 같은 방식                      ✏️ 문구 하나에 파일 하나 (js/coll.js 모음)
                      / 기본세트 / 선물.json                            🎁 처음 한 번 받는 서비스 (책상 소품 + 문구 · 한 파일 · 버리면 여기서 빠져요 · 예외 · js/desk.js)
                      / 책상배치 / 배치.json · 배치_백업.json             🪑 책상 위 · 보관함 · 자리 · 기능 연결 · 커스텀 · 가진 문구 목록 (js/desk.js · js/skins.js)
                      / 인형 · 인형극 / <이름>.json                     👧 🎭 (js/doll-store.js · js/puppet.js)
                      / 카페기록 / 카페.json                            ☕ 출석 · 화분 · 달력 · D-day · 심리 · 오락실 · 행운
                      / 설정 / 설정.json                                ⚙ 설정 탭 값 · 받은 다이어리 · 펼친 권 · 🗑 버린 상품 목록 (js/bin.js)
                      / 휴지통 / …                                      🗑 덮어쓰기 전 모습 (js/trash.js · 구글은 드라이브 휴지통)
           - 폴더가 없으면 저장할 때 자동으로 만들어요 · 같은 이름 폴더가 둘이면 먼저 만든 쪽으로 합쳐요
           - 두 기기에서 같이 써도 : 덮어쓰기 전에 드라이브 파일의 '마지막 수정 시각'을 보고
             바뀌었으면 다른 기기 내용 위에 내가 고친 것만 얹어요 (같은 날 일기는 물어봐요)
           - 개발 중이라 예전 폴더(다꾸 · 스티커 · 다이어리 · 카페 …)에서 옮기는 코드는 없어요
           ===================================================================== */
        const GOOGLE_CLIENT_ID = '1020129080030-42dun4pqvve1pjg9r21m62dd71h6hui5.apps.googleusercontent.com'; // ← 본인 OAuth 클라이언트 ID로 교체
        const TOP_FOLDER_NAME = '말랑달콤';                         // 최상위 폴더
        /* 📁 폴더 이름은 여기 한 곳에서만 (도련 10-26 · 새 폴더 = 한 줄 추가) · 스티커 종류 폴더는 js/own.js OWN_KIND */
        const DIRS = {
            day: '날짜바인더', note: '페이지노트', binder: '페이지바인더',   // 📔 다이어리 종류 (도련 10-28 · 나중 날짜노트)
            pageDeco: '페이지꾸밈', pattern: '배경지', noteCover: '노트표지', binderCover: '바인더표지', refill: '바인더내지',
            stkList: '스티커목록', doll: '인형', puppet: '인형극', cafe: '카페기록', settings: '설정', trash: '휴지통', deskLayout: '책상배치', starter: '기본세트'
        };
        /* 🪑 ✏️ 물건 종류 폴더 (도련 10-27 : 무료 · 유료 · 이벤트 · 공유받은 것 · 내가 만든 것 모두 종류가 같으면 같은 폴더) · 가질 때 생겨요 */
        const DESK_DIRS = { drawer: '서랍장', clock: '시계', bookshelf: '책꽂이', pencup: '연필꽂이', riser: '받침대', wallshelf: '벽선반', board: '게시판', photo: '벽사진', basket: '소품바구니', lamp: '조명', doll: '인형' };   // 🆕 조명 · 인형 (도련 10-28 · 소품 종류가 늘면 칸만 더해요)
        const GD_DIRS = { tweez: '핀셋', scissors: '가위', punch: '펀칭기', tape: '양면테이프', clip: '집게', knife: '칼', ruler: '자' };
        const dirPath = n => [TOP_FOLDER_NAME, n];                   // 늘 말랑달콤 바로 아래 한 칸
        const DAY_PATH = dirPath(DIRS.day);                         // 📔 날짜형 바인더 : 말랑달콤 / 날짜바인더 / 2026 분홍 1 / 2026-10-28.json
        const DK_KINDS = ['노트', '바인더'];                         // 📕 페이지형 : 말랑달콤 / 페이지노트 · 페이지바인더 / <권 id>-…json
        const bookPath = kind => dirPath(kind === '바인더' ? DIRS.binder : DIRS.note);
        const SETTINGS_PATH = dirPath(DIRS.settings), SETTINGS_FILE_NAME = '설정.json';
        const DESK_PATH = dirPath(DIRS.deskLayout), DESK_FILE_NAME = '배치.json';
        const CAFE_PATH = dirPath(DIRS.cafe), CAFE_FILE_NAME = '카페.json';
        const ROOT_PATH_TEXT = DAY_PATH.join(' / ');
        const USE_APP_DATA_FOLDER = false; // false: 내 드라이브에 '말랑달콤' 폴더가 보임 / true: 사용자에게 안 보이는 앱 전용 공간
        const DRIVE_SCOPE = USE_APP_DATA_FOLDER
            ? 'https://www.googleapis.com/auth/drive.appdata'
            : 'https://www.googleapis.com/auth/drive.file';
        const AUTH_FLAG_KEY = 'gdrive_authed';   // 이 기기에서 이전에 로그인했는지 (자동 로그인 시도용)
        const UPLOAD_DEBOUNCE_MS = 3000;         // 변경 후 이 시간이 지나면 자동으로 드라이브에 저장
        const UPLOAD_MAX_WAIT_MS = 30000;        // ⏱ 3초도 안 쉬고 계속 바꿔도 첫 변경부터 이 시간 안에는 한 번 올려요 (아무것도 안 바꾸면 저장 안 함 · 도련 10-20)
        const PENDING_KEY = 'gdrive_pending_backup'; // 화면이 꺼질 때 업로드가 끝나기 전에 앱이 멈출 경우를 대비한 임시 보관본
        const KEEPALIVE_MAX_BYTES = 60000;       // fetch keepalive 옵션은 본문 64KB 이하만 가능
        const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
        const FOLDER_MIME = 'application/vnd.google-apps.folder';
        /* 📔 날짜 다이어리 = 한 권에 폴더 하나 (도련 10-28 · js/dyyear.js) : 권 id '2026mint2' = 해 · 바인더 색 · 그 해 그 색 몇 번째 (지워도 번호는 다시 안 써요)
             diary_2026mint2_2026_10_28 → 말랑달콤 / 날짜바인더 / 2026 녹색 2 / 2026-10-28.json · 검색 목록 = 그 폴더 / 검색.json */
        const DAY_KEY_RE = /^diary_(\d{4}(?:pink|mint|purple|yellow)\d+)_(\d{4})_(\d{2})_(\d{2})$/;
        const DYB_RE = /^(\d{4})(pink|mint|purple|yellow)(\d+)$/, DYB_COLOR = { pink: '분홍', mint: '녹색', purple: '보라', yellow: '노랑' };
        function dyBookName(b) { const r = DYB_RE.exec(b || ''); return r ? `${r[1]} ${DYB_COLOR[r[2]]} ${r[3]}` : ''; }   // 폴더 이름 '2026 녹색 2'
        function dyBookOfName(n) { const r = /^(\d{4}) (분홍|녹색|보라|노랑) (\d+)$/.exec(n || ''); return r ? r[1] + Object.keys(DYB_COLOR).find(k => DYB_COLOR[k] === r[2]) + r[3] : ''; }
        const dyBookDir = b => DAY_PATH.concat([dyBookName(b)]);
        const PAGE_KEY_RE = /^dkp_(dk[0-9a-z]+)_(\d+)$/, BOOK_KEY_RE = /^dkb_(dk[0-9a-z]+)$/;   // 📕 유한 다이어리 : 장 · 다이어리.json (js/skins.js dk…)
        const DK_INFO = '다이어리.json', dkInfoName = id => `${id}-${DK_INFO}`;   // 📕 권 정보 파일 : <권 id>-다이어리.json

        /* 메모리 저장소: 화면이 쓰는 값은 여기(문자열)에 두고, 변경된 것만 드라이브에 올립니다.
           - 날짜 데이터  : diary_2026pink1_2026_09_10  → 말랑달콤/날짜바인더/2026 분홍 1/2026-09-10.json (다이어리 한 권 = 폴더 하나 · 다이어리끼리 기록을 나누지 않아요)
           - 📕 유한 다이어리 : dkp_<권 id>_3 → 말랑달콤/페이지바인더/<권 id>-3페이지.json · dkb_<권 id> → <권 id>-다이어리.json
           - 설정 데이터  : diary_ui_font 등  → 말랑달콤/설정/설정.json  (카페 기록은 말랑달콤/카페기록/카페.json) */
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
            local: false,      // 📁 로그인 없이 이 기기 폴더 (js/devsave.js) : 드라이브와 똑같이 움직여요
            guest: false, uploading: false, needAuth: false, error: false, lastSaved: null,
            rootId: null, wiped: false,   // 🗑 이 창이 본 말랑달콤 폴더 · 지워진 걸 알아챈 뒤 (rootGone · rootReset : 더 올리지 않고 처음 상태로 다시 열기)
            gen: 0,            // 다시 불러오기 할 때마다 증가 (예전 요청의 결과가 뒤늦게 섞이는 것 방지)
            inflight: null,    // 지금 업로드 중인 키
            settingsFile: null, cafeFile: null, deskFile: null,   // { id, modifiedTime } : 마지막으로 읽거나 쓴 때의 드라이브 파일 (두 기기 확인용)
            cafeBase: new Map(),         // ☕ 카페 기록 : 마지막으로 드라이브에서 읽거나 올린 값 (두 기기가 같은 항목을 고쳤을 때 합치는 기준)
            dayMeta: new Map(),          // 'diary_2026_10_09' → 읽거나 쓴 때의 드라이브 파일 수정 시각 ('' = 그때 파일이 없었음)
            full: false,                 // 구글 저장공간이 꽉 참
            dirtyKeys: new Set(),        // 아직 드라이브에 올리지 못한 변경 (날짜/설정 키)
            loadedDays: new Set(),       // 드라이브에서 이미 읽어 온 날짜 (없는 날짜도 '읽음' 처리)
            dayLoads: new Map(),         // 읽는 중인 날짜 요청
            folderIds: new Map(),        // 폴더 경로 → 폴더 id 캐시
            folderBusy: new Map(),
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
                        if (!google.accounts.oauth2.hasGrantedAllScopes(r, DRIVE_SCOPE)) return reject({ type: 'scope' });
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
            if (drive.local) { const er = new Error('auth'); er.code = 'auth'; throw er; }   // 📁 이 기기 폴더 : 구글 계정이 필요한 서버 기능은 로그인해야 해요
            if (drive.token && Date.now() < drive.expiresAt) return;
            try { await requestToken('none'); }
            catch (e) {
                drive.needAuth = true; updateBadge();
                const err = new Error('auth'); err.code = 'auth'; throw err;
            }
        }

        async function gfetch(url, opts = {}, retried = false) {
            if (drive.local && window.vfsFetch) return vfsFetch(url, opts);        // 📁 로그인 없이 이 기기 폴더 : 드라이브 대신 (js/devsave.js)
            await ensureToken();
            const res = await fetch(url, Object.assign({}, opts, {
                headers: Object.assign({}, opts.headers || {}, { Authorization: 'Bearer ' + drive.token })
            }));
            if (res.status === 401 && !retried) { drive.token = null; return gfetch(url, opts, true); }
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
           말랑달콤 / 날짜바인더 / 2026 분홍 1 / 2026-09-10.json   (하루에 파일 1개, 같은 날은 항상 덮어쓰기) */
        const pad2 = n => String(n).padStart(2, '0');
        const dayFileName = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}.json`;   // 권 폴더 안 (dyBookDir)
        const DAY_FILE_RE = /^(\d{4})-(\d{2})-(\d{2})\.json$/;
        function parseDayFile(n) { const r = DAY_FILE_RE.exec(n); return r ? { y: +r[1], m: +r[2], d: +r[3] } : null; }
        function dayKeyOf(y, m, d, b) { return `diary_${b}_${y}_${String(m).padStart(2, '0')}_${String(d).padStart(2, '0')}`; }   // b : 권 id
        function parseDayKey(k) { const r = DAY_KEY_RE.exec(k); return r ? { b: r[1], y: +r[2], m: +r[3], d: +r[4] } : null; }
        function isDayKey(k) { return DAY_KEY_RE.test(k); }
        function parsePageKey(k) { const r = PAGE_KEY_RE.exec(k); return r ? { b: r[1], n: +r[2] } : null; }
        const isPageKey = k => PAGE_KEY_RE.test(k), isBookKey = k => BOOK_KEY_RE.test(k);
        const isOwnFile = k => isDayKey(k) || isPageKey(k) || isBookKey(k);    // 키 하나가 드라이브 파일 하나 (하루 · 장 · 다이어리.json)
        function keyLabel(k) { const d = parseDayKey(k); if (d) return `${d.m}월 ${d.d}일`; const p = parsePageKey(k); return p ? (p.n ? `${p.n}페이지` : '표지') : '다이어리'; }
        function isSettingKey(k) { return (k.startsWith('diary_') || VAULT_KEYS.includes(k)) && !isDayKey(k); }
        /* 설정 키가 드라이브의 어느 파일로 가는지 : 'cafe' · 'split' · 'settings' */
        function keyFile(k) { return CAFE_KEYS.includes(k) ? 'cafe' : DESK_KEYS.includes(k) ? 'desk' : 'settings'; }
        /* 설정 파일 2개 : 어디에 · 무슨 이름으로 · drive 의 어느 칸에 기억 */
        const KEY_FILES = {
            settings: { path: SETTINGS_PATH, name: SETTINGS_FILE_NAME, prop: 'settingsFile' },
            cafe: { path: CAFE_PATH, name: CAFE_FILE_NAME, prop: 'cafeFile' },
            desk: { path: DESK_PATH, name: DESK_FILE_NAME, prop: 'deskFile' }   // 🪑 책상배치 / 배치.json
        };

        /* 🔐 암호 보관 : 출석 · 화분 기록은 설정.json 에서 무엇인지 알아볼 수 없게 저장해요
           - 이름도 뜻 없는 글자 (VAULT_KEYS) · 내용은 뒤섞은 글자 + 앞 7자리 확인 표시
           - 누가 글자를 하나라도 고치면 확인 표시가 맞지 않아서 그 기록은 버리고 처음부터 (고칠 이유가 없게) */
        const VAULT_KEYS = ['zq7k2m', 'xr4p9w'];
        const DESK_KEYS = ['diary_desk_items', 'diary_desk_fn', 'diary_gd_own', 'diary_share_got'];   // + 📥 이미 불러온 공유 파일 번호 (js/itemshare.js)   // 🪑 책상배치 / 배치.json 으로 가는 키
        const CAFE_KEYS = VAULT_KEYS.concat(['diary_cycle', 'diary_dday', 'diary_psy', 'diary_arcade_best', 'diary_luck_seed']);   // ☕ 카페.json 으로 가는 키
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
            try { const raw = sync ? store.getItem(key) : localStorage.getItem(key); return raw ? vaultOpen(JSON.parse(raw)) : null; } catch (e) { return null; }
        }
        function vaultPut(key, obj, sync) {
            const t = JSON.stringify(vaultSeal(obj));
            try { if (sync) store.setItem(key, t); else localStorage.setItem(key, t); } catch (e) {}
        }
        /* ☁ 설정 값 하나 (JSON) : 로그인 → 설정.json 의 key · 이 기기 local 에도 같이 (드라이브를 읽기 전 · 게스트는 이 기기 값)
           쓰는 곳 : 🗂 고르는 창 칸 · 🎵 배경음악 · 🔮 토정비결 생일 · ✏️ 닉네임 */
        /* ☁ 로그인 중에는 드라이브(설정.json) 것만 믿어요 : 드라이브에 없으면 처음 상태 (도련 10-20 · 말랑달콤 폴더를 지우면 모든 기기가 처음부터)
           브라우저 기억(local)은 게스트 · 드라이브를 읽기 전에 화면을 빨리 띄울 때만 */
        function prefGet(key, local) {
            let v = null;
            if (drive.ready && !drive.guest) { try { v = store.getItem(key); } catch (e) {} }
            else { try { v = localStorage.getItem(local); } catch (e) {} }
            if (v === null) return null;
            try { return JSON.parse(v); } catch (e) { return v; }
        }
        function prefSet(key, local, val) {
            const t = JSON.stringify(val);
            try { if (drive.ready && !drive.guest) store.setItem(key, t); } catch (e) {}
            try { localStorage.setItem(local, t); } catch (e) {}
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
            return `${dyBookDir(k.b).slice(1).join('/')}/${dayFileName(k.y, k.m, k.d)}`;
        }
        function corruptError(what) { const er = new Error('corrupt'); er.type = 'corrupt'; er.what = what; return er; }

        /* ---------- 드라이브 기본 동작 ---------- */
        const DRIVE_PARENT_DEFAULT = USE_APP_DATA_FOLDER ? 'appDataFolder' : 'root';
        const DRIVE_SPACE = USE_APP_DATA_FOLDER ? '&spaces=appDataFolder' : '';

        async function driveList(query, fields) {
            let files = [], pageToken = '';
            do {
                const url = `${DRIVE_API}?q=${encodeURIComponent(query)}${DRIVE_SPACE}&orderBy=createdTime&pageSize=1000`
                    + `&fields=${encodeURIComponent('nextPageToken,files(' + fields + ')')}` + (pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : '');
                const res = await gfetch(url);
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
            return await res.text();
        }
        /* 파일 정보만 (내용 X) : 휴지통에 있거나 없어졌으면 null */
        async function driveMeta(id) {
            const res = await gfetch(`${DRIVE_API}/${id}?fields=id,name,modifiedTime,trashed,size`);
            if (res.status === 404) return null;
            if (!res.ok) throw await driveFail(res, 'meta');
            const f = await res.json();
            return f.trashed ? null : f;
        }
        /* 폴더 안에서 이름으로 파일 찾기 (같은 이름이 여럿이면 먼저 만든 것) */
        async function findFile(folderId, name) {
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
            const files = await driveList(`name='${qName(name)}' and mimeType='${FOLDER_MIME}' and '${parentId || DRIVE_PARENT_DEFAULT}' in parents and trashed=false`, 'id,name');
            if (files.length > 1) mergeFolders(files[0].id, files.slice(1).map(f => f.id));   // 두 기기가 동시에 만든 같은 폴더 → 먼저 만든 쪽으로 합치기 (기다리지 않음)
            return files[0] ? files[0].id : null;
        }
        /* 같은 이름 폴더 합치기 : 나중 폴더 안의 것을 모두 먼저 폴더로 옮기고, 빈 폴더는 휴지통으로
           (옮긴 것 중 또 같은 이름 폴더가 생기면 그 폴더를 열 때 다시 합쳐져요) */
        const folderMerging = new Set();
        async function mergeFolders(keepId, otherIds) {
            for (const id of otherIds) {
                if (folderMerging.has(id)) continue;
                folderMerging.add(id);
                try {
                    const kids = await driveList(`'${id}' in parents and trashed=false`, 'id');
                    for (const k of kids) {
                        const res = await gfetch(`${DRIVE_API}/${k.id}?addParents=${keepId}&removeParents=${id}&fields=id`, {
                            method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: '{}'
                        });
                        if (!res.ok) throw await driveFail(res, 'move');
                    }
                    await driveTrash(id);
                    drive.monthIndex.clear();                               // 옮겨진 일기가 다시 보이도록
                } catch (e) { console.warn('같은 이름 폴더를 합치지 못했어요:', e); }
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

        /* names = ['말랑달콤','설정'] / ['말랑달콤','날짜바인더'] … (늘 말랑달콤 바로 아래 한 칸 · 도련 10-26)
           create=false : 있으면 찾기만 (읽을 때) / create=true : 없으면 만들기 (저장할 때) */
        async function getFolder(names, create) {
            const key = names.join('/');
            if (drive.folderIds.has(key)) return drive.folderIds.get(key);
            const busyKey = key + '|' + (create ? 1 : 0);
            if (drive.folderBusy.has(busyKey)) return drive.folderBusy.get(busyKey);
            const p = (async () => {
                let parentId = null;
                if (names.length > 1) {
                    parentId = await getFolder(names.slice(0, -1), create);
                    if (!parentId) return null;
                }
                const name = names[names.length - 1];
                let id = await findFolder(name, parentId);
                if (!id && create) {
                    id = await createFolder(name, parentId);
                    const again = await findFolder(name, parentId);                // 그 사이 다른 기기도 만들었으면 먼저 만든 쪽을 써요
                    if (again) id = again;
                }
                if (id) drive.folderIds.set(key, id);
                if (id && key === TOP_FOLDER_NAME) drive.rootId = id;          // 🗑 말랑달콤 폴더가 지워졌는지 볼 때 (rootGone)
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
        /* 그날 파일만 드라이브에서 다시 보기 (다른 기기 변경 확인 · 폴더를 통째로 다시 읽지 않아요) */
        async function dayRefresh(key) {
            const d = parseDayKey(key), idx = d && drive.monthIndex.get('all:' + d.b);
            if (!idx || !d) return;
            const name = dayFileName(d.y, d.m, d.d), fs = await driveList(`name='${qName(name)}' and '${idx.folderId}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime,size');
            if (!fs.length) { idx.files.delete(name); return; }
            idx.files.set(name, fs[0]);
            if (fs.length > 1) idx.dups.set(name, fs); else idx.dups.delete(name);
        }

        function resetDriveCaches() {
            drive.folderIds.clear(); drive.folderBusy.clear();
            drive.monthIndex.clear(); drive.monthBusy.clear();
            drive.books.clear(); drive.bookBusy.clear();
            drive.settingsFile = null; drive.cafeFile = null; drive.deskFile = null;
        }

        /* ---------- 읽기 : 설정 / 하루치 ---------- */
        /* 설정.json · 카페.json : 내용(없으면 null) · 파일 정보는 drive.settingsFile / cafeFile 에 */
        async function fetchKeyFile(which) {
            const F = KEY_FILES[which];
            drive[F.prop] = null;
            const dir = await getFolder(F.path, false);
            const f = dir && await findFile(dir, F.name);
            if (!f) return null;
            drive[F.prop] = f;
            return parseJsonObject(await keyFileText(which, f.id), which);
        }
        /* 🔐 책상배치 / 배치.json 은 스티커처럼 계정마다 다른 열쇠로 암호화 (도련 10-27 · 복사해도 하나 · 남의 것은 못 열어요 · js/own.js ownLock / ownUnlock)
           못 열면 (다른 계정 · 깨짐) 읽기 실패 → 아무것도 바꾸지 않고 덮어쓰지도 않아요 */
        async function keyFileText(which, id) {
            const t = await readFileText(id);
            if (which !== 'desk' || !t.trim()) return t;
            try { return JSON.stringify(await ownUnlock(t, COLL.who)); } catch (e) { throw corruptError(which); }
        }
        const keyFileSeal = async (which, body) => which === 'desk' ? ownLock(JSON.parse(body), COLL.who) : body;

        /* 키 → 그 파일이 든 폴더 목록 · 파일 이름 (하루 : 날짜바인더 / 그 권 · 📕 장 · 다이어리.json : 페이지노트 · 페이지바인더 안 그 권 것만) */
        function idxOfKey(key, create) {
            const d = parseDayKey(key); if (d) return getMonthIndex(d.y, d.m, create, d.b);
            const p = parsePageKey(key), b = BOOK_KEY_RE.exec(key);
            return p || b ? getBookIndex(p ? p.b : b[1], create) : Promise.resolve(null);
        }
        function fileOfKey(key) {
            const d = parseDayKey(key); if (d) return dayFileName(d.y, d.m, d.d);
            const p = parsePageKey(key); if (p) return `${p.b}-${p.n ? p.n + '페이지' : '표지'}.json`;   // 0장 = 📕 표지
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
        const fetchDay = (date, meta) => fetchKey(getDateKey(date), meta);

        /* 📕 페이지형 한 권 = 페이지노트 · 페이지바인더 폴더 안 '<권 id>-' 로 시작하는 파일들 (도련 10-26 · 권 폴더 없음)
           - 종류(노트 · 바인더)는 다이어리.json 정보로 · 모르면 두 폴더 모두 봐요
           - create=true 면 없을 때 <권 id>-다이어리.json 을 만들어요 (첫 장을 저장할 때) */
        function dkIdxOf(folderId, kind, files, id) {
            const pre = id + '-', e = dayIdxOf(folderId, files.filter(f => f.name.startsWith(pre)));
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
                const info = typeof dkInfoOf === 'function' ? dkInfoOf(id) : { kind: '' };
                const kinds = DK_KINDS.includes(info.kind) ? [info.kind].concat(DK_KINDS.filter(k => k !== info.kind)) : DK_KINDS.slice();
                for (const kind of kinds) {                                // 정보 파일이 있는 폴더 = 그 권의 자리
                    const dir = await getFolder(bookPath(kind), false); if (!dir) continue;
                    const files = await driveList(`'${dir}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,modifiedTime,size');
                    if (files.some(f => f.name === dkInfoName(id))) return dkIdxOf(dir, kind, files, id);
                }
                if (!create) return null;
                const kind = DK_KINDS.includes(info.kind) ? info.kind : DK_KINDS[0], dir = await getFolder(bookPath(kind), true);
                const saved = await driveUpsert(dir, dkInfoName(id), null, JSON.stringify(info));
                return dkIdxOf(dir, kind, [{ id: saved.id, name: dkInfoName(id), modifiedTime: saved.modifiedTime }], id);
            })();
            drive.bookBusy.set(id, p);
            try { return await p; } finally { drive.bookBusy.delete(id); }
        }

        /* 📄📄 같은 날 일기 파일이 2개 이상 (두 기기가 거의 동시에 처음 만든 경우) → 하나로 정리
           - 내용이 모두 같으면 묻지 않고 나머지를 휴지통으로
           - 다르면 "어느 쪽을 남길까요?" → 고른 내용을 가장 먼저 만든 파일에 두고 나머지는 휴지통으로 (30일 안에 되살릴 수 있어요) */
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
                for (let i = 1; i < list.length; i++) {
                    const a = texts[win], b = texts[i];
                    if (b === null || b === 'null' || b === a) continue;
                    if (a === null || a === 'null') { win = i; continue; }
                    const tm = f => new Date(f.modifiedTime).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    const first = await showAsk(`📄 <b>${keyLabel(key)}</b> 일기 파일이 두 개 있어요.<br>(두 기기에서 거의 동시에 처음 저장한 것 같아요)<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 드라이브 휴지통으로 가요.</span>`, `🕐 ${tm(list[win])} 저장한 것`, `🕑 ${tm(list[i])} 저장한 것`);
                    if (!first) win = i;
                }
                const keep = list[0];
                let meta = keep;
                if (win !== 0 && texts[win] !== null) meta = Object.assign({}, keep, await driveUpsert(idx.folderId, name, keep.id, texts[win]));
                for (let i = 1; i < list.length; i++) await driveTrash(list[i].id);
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
            resetDriveCaches(); drive.rootId = null;
            await changesStart();                                            // 🔔 읽기 전에 표시를 받아 둬요 (읽는 사이 바뀐 것도 다음 확인에 잡혀요)
            const [settings, cafe] = await Promise.all([fetchKeyFile('settings'), fetchKeyFile('cafe')]);   // 읽지 못하면 여기서 에러 → 아무것도 바꾸지 않음
            if (typeof collWhoami === 'function') await collWhoami();        // 🔐 계정을 먼저 알아야 배치.json 을 열 수 있어요 (js/coll.js)
            let desk = null; drive.deskLocked = false;
            try { desk = await fetchKeyFile('desk'); }
            catch (e) { if (e && e.type === 'corrupt') drive.deskLocked = true; else throw e; }   // 🔐 못 여는 배치.json (다른 계정 것 · 깨짐) : 일기는 그대로 열고 · 내 선물.json · 백업이 열리면 되살려 새로 쓰고 (js/desk.js giftEnsure) · 아니면 절대 덮어쓰지 않아요
            clearTimeout(uploadTimer);
            drive.gen++;
            store.clear();
            drive.dirtyKeys.clear(); drive.loadedDays.clear(); drive.dayLoads.clear(); drive.dayMeta.clear();
            if (settings) Object.keys(settings).forEach(k => { if (isSettingKey(k) && keyFile(k) === 'settings') store.putLoaded(k, JSON.stringify(settings[k])); });
            drive.cafeBase = new Map();
            if (cafe) Object.keys(cafe).forEach(k => { if (keyFile(k) === 'cafe') { store.putLoaded(k, JSON.stringify(cafe[k])); drive.cafeBase.set(k, JSON.stringify(cafe[k])); } });
            if (desk) Object.keys(desk).forEach(k => { if (keyFile(k) === 'desk') store.putLoaded(k, JSON.stringify(desk[k])); });
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

        /* fileId가 있으면 그 파일을 덮어쓰고, 없으면 folderId 안에 새로 만듭니다 */
        async function driveUpsert(folderId, name, fileId, body) {
            if (fileId) {
                const res = await gfetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&fields=id,modifiedTime`, Object.assign({
                    method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body
                }, keepaliveFor(body)));
                if (res.ok) return mineWrote(await res.json());
                throw await driveFail(res, 'update');                           // 404 'gone' : 그 사이 지워짐 → 캐시를 비우고 다시 시도
            }
            /* 새 파일을 만들기 전에 폴더가 살아 있는지 드라이브에 직접 확인 : 휴지통에 들어간 폴더에 만들면 일기가 안 보이게 돼요
               → 폴더가 없거나 휴지통이면 기억해 둔 폴더를 모두 잊고 'gone' (부른 쪽이 폴더를 다시 찾아서 다시 저장해요) */
            if (!(await driveMeta(folderId))) {
                resetDriveCaches();
                const er = new Error('folder gone'); er.code = 'gone'; throw er;
            }
            const b = 'diary_boundary_' + Math.random().toString(36).slice(2);
            const meta = { name, mimeType: 'application/json', parents: [folderId] };
            const multipart =
                `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
                `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${body}\r\n--${b}--`;
            const res = await gfetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime', Object.assign({
                method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body: multipart
            }, keepaliveFor(multipart)));
            if (!res.ok) throw await driveFail(res, 'create');                 // 404 'gone' : 폴더가 지워짐
            return mineWrote(await res.json());
        }

        async function driveTrash(fileId) {
            const res = await gfetch(`${DRIVE_API}/${fileId}?fields=id`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ trashed: true })
            });
            if (!res.ok && res.status !== 404) throw await driveFail(res, 'trash');
        }

        /* 설정 값은 모두 JSON 글자 · 잘못된 값이 하나 섞여도 설정.json 전체가 깨지지 않게 그 값만 빼고 저장 */
        function settingsBody(file) {
            return '{' + store.keys().filter(k => isSettingKey(k) && keyFile(k) === (file || 'settings')).map(k => {
                const v = store.getItem(k);
                try { JSON.parse(v); } catch (e) { console.warn('설정 값이 JSON 이 아니라서 저장하지 않았어요:', k); return ''; }
                return JSON.stringify(k) + ':' + v;
            }).filter(Boolean).join(',') + '}';
        }

        /* 다른 기기가 고친 설정 파일 내용을 지금 메모리에 합치기
           mine : 이 기기에서 고쳤는데 아직 못 올린 키 → 그건 내 것 그대로 · 나머지는 드라이브 것으로 */
        async function mergeKeyFile(which, cur, mine) {
            const obj = parseJsonObject(await keyFileText(which, cur.id), which) || {};
            const keep = k => mine.has(k) || drive.dirtyKeys.has(k);
            let changed = false;
            Object.keys(obj).forEach(k => {
                if (!isSettingKey(k) || keyFile(k) !== which) return;
                const v = JSON.stringify(obj[k]);
                if (keep(k)) {                                                  // 이 기기에서도 고친 값
                    if (which === 'cafe' && v !== drive.cafeBase.get(k)) {       // ☕ 다른 기기도 고쳤어요 → 한쪽만 남기지 않고 합쳐요
                        const mv = store.getItem(k), merged = cafeMerge(k, drive.cafeBase.get(k), mv, v);
                        if (merged !== mv) { store.putLoaded(k, merged); changed = true; }
                    }
                    return;
                }
                if (store.getItem(k) !== v) { store.putLoaded(k, v); changed = true; }
            });
            store.keys().forEach(k => {
                if (isSettingKey(k) && keyFile(k) === which && !(k in obj) && !keep(k)) { store.putLoaded(k, null); changed = true; }   // 다른 기기에서 지운 값
            });
            drive[KEY_FILES[which].prop] = cur;
            if (which === 'cafe') { drive.cafeBase = new Map(); Object.keys(obj).forEach(k => { if (keyFile(k) === 'cafe') drive.cafeBase.set(k, JSON.stringify(obj[k])); }); }
            if (changed) { applyRemoteSettings(); if (which === 'cafe') cafeShownAgain(); }
        }
        /* ☕ 열려 있는 카페 창이 옛 기록을 들고 있지 않게 : 합친 기록으로 다시 읽어서 다시 그려요
           (창을 연 채로 고치면 창이 들고 있던 옛 기록이 그대로 저장되어, 다른 기기가 더한 것이 빠질 수 있어서) */
        function cafeShownAgain() {
            const open = id => { const e = document.getElementById(id); return !!e && e.classList.contains('show'); };
            try { if (typeof atRead === 'function' && open('attendRoom')) { atS.d = atRead(); atRender(); } } catch (e) { console.warn(e); }
            try { if (typeof cyRead === 'function' && open('cycleRoom')) { cy.d = cyRead(); cyRender(); } } catch (e) { console.warn(e); }
            try { if (typeof arReadBest === 'function' && open('arcadeRoom')) ar.best = arReadBest(); } catch (e) { console.warn(e); }
        }

        /* ☕ 카페 기록 합치기 : 두 기기가 같은 항목을 고쳤을 때 한쪽 기록이 사라지지 않게
           base = 마지막으로 드라이브에서 읽거나 올린 값 · mine = 이 기기 · theirs = 지금 드라이브 (모두 JSON 글자)
           - 출석 도장 : 양쪽 도장을 모두 (도장은 지우는 기능이 없어요)
           - 오락실 최고 점수 : 게임마다 더 높은 점수
           - 생리 달력 · 심리테스트 결과 : 날짜(테스트)마다 바뀐 쪽 · 둘 다 바꿨으면 이 기기 것
           - D-day : 양쪽에서 더한 것은 모두 · 한쪽에서 지운 것은 지워요
           - 행운 번호 : 드라이브에 있는 번호 (기기마다 다르면 안 돼요)
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
                if (k === 'diary_luck_seed') return P(theirs) ? theirs : mine;
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
                if (typeof pgPrepare === 'function') await pgPrepare();        // 고른 페이지 · 배경지가 바뀌었으면 그 원본부터 (js/settings.js · js/pattern-maker.js)
                if (typeof patPrepare === 'function') await patPrepare();
                loadCustomSkins();                                              // 페이지 · 배경지 다시 적용
                loadUIFont();
                if (typeof showApply === 'function') showApply();
                if (typeof ddRefresh === 'function') ddRefresh();
                if (typeof noticeRefresh === 'function') noticeRefresh();      // 📢 다른 기기에서 본 공지는 여기서도 그만 흔들려요 (js/service.js)
            } catch (e) { console.warn(e); }
        }

        /* 설정.json · 카페.json 올리기 : 덮어쓰기 전에 드라이브 파일이 바뀌었는지 보고, 바뀌었으면 합친 뒤에 */
        async function writeKeyFile(which, mine) {
            const F = KEY_FILES[which];
            if (which === 'desk' && drive.deskLocked) return;                   // 🔐 못 연 배치.json 은 덮어쓰지 않아요
            const dir = await getFolder(F.path, true);
            const known = drive[F.prop];
            let cur = known ? await driveMeta(known.id) : null;
            if (!cur) cur = await findFile(dir, F.name);                              // 처음이거나 지워졌으면 이름으로 한 번 더 찾기
            if (cur && (!known || cur.id !== known.id || cur.modifiedTime !== known.modifiedTime)) await mergeKeyFile(which, cur, mine);
            let body = settingsBody(which);
            let saved = await driveUpsert(dir, F.name, cur && cur.id, await keyFileSeal(which, body));
            if (!cur) {                                                             // 📄📄 다른 기기가 거의 동시에 같은 파일을 먼저 만들었으면 : 그 파일에 합쳐서 하나로
                const first = await findFile(dir, F.name);
                if (first && first.id !== saved.id) {
                    await mergeKeyFile(which, first, mine);
                    body = settingsBody(which);
                    const fin = await driveUpsert(dir, F.name, first.id, await keyFileSeal(which, body));
                    await driveTrash(saved.id);
                    saved = fin;
                }
            }
            drive[F.prop] = { id: saved.id, name: F.name, modifiedTime: saved.modifiedTime };
            if (which === 'cafe') { const o = JSON.parse(body); drive.cafeBase = new Map(Object.keys(o).map(k => [k, JSON.stringify(o[k])])); }
        }

        /* 일기 하루 올리기 : 다른 기기가 그 사이 같은 날을 고쳤으면 물어봐요 */
        async function writeDay(key) {
            const val = store.getItem(key);
            const name = fileOfKey(key), lab = keyLabel(key);
            const idx = await idxOfKey(key, val !== null);                          // 올릴 때만 폴더 (📕 권 정보 파일) 를 만들어요
            if (!idx) return;                                                       // 지울 날인데 폴더도 없음
            await dayDupFix(idx, name, key);
            const f = idx.files.get(name);
            let cur = f ? await driveMeta(f.id) : null;
            if (!cur) cur = await findFile(idx.folderId, name);
            const base = drive.dayMeta.has(key) ? drive.dayMeta.get(key) : (f ? f.modifiedTime || '' : '');
            if (cur && cur.modifiedTime !== base) {                                 // 다른 기기가 고쳤어요
                let theirs = null;
                try { theirs = JSON.stringify(parseJsonObject(await readFileText(cur.id), key)); } catch (e) { if (e.type !== 'corrupt') throw e; }
                if (theirs !== val && theirs !== null && theirs !== 'null') {
                    const mineWins = await showAsk(`📱 다른 기기에서 <b>${lab}</b> 일기를 고쳤어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 사라져요.</span>`, '📝 내 것 저장', '📱 다른 기기 것');
                    if (!mineWins) {
                        idx.files.set(name, cur); drive.dayMeta.set(key, cur.modifiedTime);
                        if (!drive.dirtyKeys.has(key)) { store.putLoaded(key, theirs); dayShownAgain(key); }
                        return;
                    }
                    if (window.trashKeepDay) await trashKeepDay(key, theirs);           // 🗑 다른 기기 것은 휴지통에 (js/trash.js)
                }
            }
            if (val === null) {                                                     // 내용을 모두 지운 날 → 파일은 휴지통으로
                if (cur) await driveTrash(cur.id);
                idx.files.delete(name); drive.dayMeta.set(key, '');
                return;
            }
            const saved = await driveUpsert(idx.folderId, name, cur && cur.id, val);    // 있으면 덮어쓰기, 없으면 새 파일
            if (!cur) {                                                             // 📄📄 새로 만들었으면 : 다른 기기가 거의 동시에 같은 날 파일을 먼저 만들었는지 바로 확인
                const first = await findFile(idx.folderId, name);
                if (first && first.id !== saved.id) {
                    let theirs = null;
                    try { theirs = JSON.stringify(parseJsonObject(await readFileText(first.id), key)); } catch (e) { if (e.type !== 'corrupt') throw e; }
                    let mine = true;
                    if (theirs !== null && theirs !== 'null' && theirs !== val)
                        mine = await showAsk(`📱 다른 기기에서도 방금 <b>${lab}</b> 일기를 처음 저장했어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 드라이브 휴지통으로 가요.</span>`, '📝 내 것 저장', '📱 다른 기기 것');
                    let fin = first;
                    if (mine && theirs !== val) { if (window.trashKeepDay) await trashKeepDay(key, theirs); fin = Object.assign({}, first, await driveUpsert(idx.folderId, name, first.id, val)); }
                    await driveTrash(saved.id);                                     // 내가 만든 쪽은 휴지통으로 (가장 먼저 만든 파일 하나만 남겨요)
                    idx.files.set(name, { id: first.id, name, modifiedTime: fin.modifiedTime });
                    drive.dayMeta.set(key, fin.modifiedTime);
                    if (!mine && !drive.dirtyKeys.has(key)) { store.putLoaded(key, theirs); dayShownAgain(key); }
                    return;
                }
            }
            idx.files.set(name, { id: saved.id, name, modifiedTime: saved.modifiedTime });
            drive.dayMeta.set(key, saved.modifiedTime);
        }
        /* 📕 다이어리.json 올리기 : 다른 기기가 고쳤으면 묻지 않고 합쳐요 (장마다 처음 꾸민 날 = 더 이른 날) */
        async function writeBook(key) {
            const id = BOOK_KEY_RE.exec(key)[1];
            let val = store.getItem(key);
            if (val === null) return;
            const idx = await getBookIndex(id, true), nm = dkInfoName(id);
            const f = idx.files.get(nm);
            let cur = f ? await driveMeta(f.id) : null;
            if (!cur) cur = await findFile(idx.folderId, nm);
            if (cur && cur.modifiedTime !== (drive.dayMeta.get(key) || '')) {
                let theirs = null; try { theirs = parseJsonObject(await readFileText(cur.id), key); } catch (e) { if (e.type !== 'corrupt') throw e; }
                if (theirs) { val = JSON.stringify(dkInfoMerge(JSON.parse(val), theirs)); store.putLoaded(key, val); }
            }
            const saved = await driveUpsert(idx.folderId, nm, cur && cur.id, val);
            idx.files.set(nm, { id: saved.id, name: nm, modifiedTime: saved.modifiedTime });
            drive.dayMeta.set(key, saved.modifiedTime);
        }
        /* 그날이 지금 펼쳐 둔 페이지면 다시 그리기 · 검색 목록도 */
        function dayShownAgain(key) {
            try {
                if (typeof isCoverOpen !== 'undefined' && isCoverOpen && !turn && getDateKey(currentDate) === key) loadData();
                if (typeof searchTouch === 'function') searchTouch(key);
            } catch (e) { console.warn(e); }
        }

        /* 변경된 키 하나(또는 같은 설정 파일의 키 묶음)를 드라이브에 반영 */
        async function driveWriteKey(key, retried, mine) {
            try {
                if (isBookKey(key)) await writeBook(key);
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
            drive.wiped = true; clearTimeout(uploadTimer);
            drive.dirtyKeys.clear(); clearPending();
            const { forget } = await readAllPending(); await forget();
            await showMsg('☁ 구글 드라이브의 <b>말랑달콤</b> 폴더가 지워졌어요.<br>처음 상태로 다시 열게요.');
            location.reload();
        }
        function flushUpload(opts) {
            const force = !!(opts && opts.force);
            clearTimeout(uploadTimer); dirtySince = 0;
            uploadChain = uploadChain.then(async () => {
                if (!drive.ready || drive.guest) return false;
                if (force && isCoverOpen) {                                 // 💾 저장 버튼: 지금 보고 있는 날짜 파일을 한 번 더 덮어씀
                    const k = getDateKey(currentDate);
                    if (drive.loadedDays.has(k) && store.getItem(k) !== null) drive.dirtyKeys.add(k);
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
                } else if (!authFail) {
                    if (full) savePending();
                    uploadTimer = setTimeout(() => flushUpload(), full ? 5 * 60000 : 30000);
                }
                if (sent.length) driveTell({ t: 'saved', keys: sent });   // 같은 기기의 다른 탭에도 알려요
                updateBadge(); updateStorageInfo();
                return allOk;
            });
            return uploadChain;
        }

        /* ---------- 전체 목록 (백업 / 용량 확인용) ---------- */
        async function driveEnumerateAll(only) {                           // 📔 권 폴더마다 (only = 그 권만 · 🗂 꾸민 페이지만 보기)
            const rootId = await getFolder(DAY_PATH, false);
            const out = new Map();
            if (!rootId) return [];
            for (const dir of await driveList(`'${rootId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`, 'id,name')) {
                const b = dyBookOfName(dir.name); if (!b || (only && b !== only)) continue;
                (await driveList(`'${dir.id}' in parents and mimeType!='${FOLDER_MIME}' and trashed=false`, 'id,name,size')).forEach(f => {
                    const r = parseDayFile(f.name); if (!r) return;
                    const key = dayKeyOf(r.y, r.m, r.d, b);
                    if (!out.has(key)) out.set(key, { key, id: f.id, size: +f.size || 0 });
                });
            }
            return Array.from(out.values());
        }

        /* 아직 읽지 않은 모든 날짜를 메모리로 읽기 (전체 백업용). 읽지 못한 파일 수를 돌려줌 */
        async function loadAllDays() {
            const all = await driveEnumerateAll();
            const todo = all.filter(f => !drive.loadedDays.has(f.key));
            const gen = drive.gen;
            let i = 0, failed = 0;
            await Promise.all(Array.from({ length: 5 }, async () => {
                while (i < todo.length) {
                    const f = todo[i++];
                    try {
                        const obj = parseJsonObject(await readFileText(f.id), f.key);
                        if (gen !== drive.gen) return;
                        if (!drive.dirtyKeys.has(f.key)) store.putLoaded(f.key, obj ? JSON.stringify(obj) : null);
                        drive.loadedDays.add(f.key);
                    } catch (e) { failed++; }
                }
            }));
            return failed;
        }

        async function postLoginTasks() {
            await recoverPendingBackup();
            if (window.dfFix) dfFix();                                       // 🗂 꾸민 페이지만 보기 : 꾸민 날 목록 (js/skins.js)
        }

        /* 드라이브에서 불러온 데이터를 화면에 반영 */
        function applyLoadedData() {
            loadCustomSkins();
            loadUIFont();
            if (isCoverOpen) loadData();
            updateStorageInfo();
            if (typeof lockAfterLoad === 'function') lockAfterLoad();       // 🔒 다이어리 잠금 (js/lock.js)
            if (typeof showApply === 'function') showApply();               // 👀 페이지에 보이는 것 (js/show.js)
            if (typeof ddRefresh === 'function') ddRefresh();               // ⏳ D-day (js/dday.js)
            if (typeof bgmLoadPref === 'function') bgmLoadPref();           // 🎵 배경음악 음량 · 반복 · 섞기 (js/bgm.js)
            handLoad();                                                      // ✋ 쓰는 손
            if (typeof dyLoad === 'function') dyLoad();                     // 📒 고른 다이어리 (js/skins.js)
            if (typeof dyySync === 'function') dyySync();                   // 📔 처음 온 다꾸러 = 그 해 기본 다이어리 선물 (js/dyyear.js)
            if (typeof bgoSync === 'function') bgoSync();                   // 🌈 처음 온 다꾸러 = 분홍 단색 배경지 (js/bgown.js)
            if (typeof nwRefresh === 'function') nwRefresh();               // ✨ NEW 표시 (☁ diary_new · js/arrival.js)
            if (typeof svcDailyBadges === 'function') svcDailyBadges();     // 🔔 오늘 이미 본 알림 (☁ diary_daily_seen · js/service.js)
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
            if (g.dataset.state !== state || m.innerHTML !== msg) { c.classList.remove('gate-swap'); void c.offsetWidth; c.classList.add('gate-swap'); }   // 같은 카드 안에서 스르륵 바뀌어요
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
        const deskWide = () => Math.min(innerWidth, innerHeight) >= 600;
        /* 🪑 화면 고르기 (도련 10-27 · ⚙️ 설정 📖 다이어리 칸 · 💻 PC · 아이패드만) : 책상 = 하단 메뉴 없이 책상 소품을 눌러 열기 (기본) · 하단 메뉴 = 책상 없이 배경지 + 아래 버튼 (폰과 같아요)
           저장 : 설정.json 'diary_desk_mode' ('desk' | 'menu') · 게스트는 이 기기 'malang_desk_mode' · 📱 폰은 늘 하단 메뉴 */
        const DESK_MODE_KEY = 'diary_desk_mode', DESK_MODE_LOCAL = 'malang_desk_mode';
        const deskModeGet = () => prefGet(DESK_MODE_KEY, DESK_MODE_LOCAL) === 'menu' ? 'menu' : 'desk';
        const deskUse = () => deskWide() && deskModeGet() === 'desk';
        function deskSync() {
            const H = document.documentElement, on = deskUse();
            H.classList.toggle('desk-wide', deskWide());
            if (!on && H.classList.contains('desk-show')) { H.classList.remove('desk-show'); const m = document.getElementById('deskDiary'); if (m) m.style.visibility = ''; }   // 하단 메뉴로 바꾸면 펴 둔 다이어리는 그대로 보여요
            if (on && !H.classList.contains('desk-on') && window.deskMiniPaint) deskMiniPaint();   // 책상으로 바꾸면 책상 위 다이어리는 지금 겉표지
            H.classList.toggle('desk-on', on);
            if (on && window.deskMiniSync) deskMiniSync();                     // 책상 위 다이어리 크기를 지금 다이어리에 맞춰요
        }
        function deskModeSet(v) { prefSet(DESK_MODE_KEY, DESK_MODE_LOCAL, v === 'menu' ? 'menu' : 'desk'); deskSync(); if (window.deskModeRender) deskModeRender(); }
        function hideGate() {
            const g = document.getElementById('driveGate');
            if (window.deskMiniSync) requestAnimationFrame(() => deskMiniSync());   // 📔 다이어리를 다 불러온 뒤 책상 위 다이어리를 맞춰요
            if (gateOpened || !deskUse() || g.style.display === 'none' || matchMedia('(prefers-reduced-motion: reduce)').matches) { gateOpened = true; g.classList.remove('leave'); g.style.display = 'none'; return; }
            gateOpened = true;
            g.classList.add('leave');
            setTimeout(() => { if (!g.classList.contains('leave')) return; g.classList.remove('leave'); g.style.display = 'none'; }, 2200);
        }
        window.addEventListener('resize', deskSync); deskSync();
        /* 🪑 다이어리를 펴 둔 동안 책상 빈 곳을 톡 = 다이어리를 책상에 다시 내려놓아요 (js/desk.js deskCloseDiary · 펴기는 책상 위 다이어리를 톡) */
        let deskDownXY = null;
        document.addEventListener('pointerdown', ev => { deskDownXY = [ev.clientX, ev.clientY]; }, true);
        document.addEventListener('pointerup', ev => {
            const H = document.documentElement;
            if (!H.classList.contains('desk-on') || !H.classList.contains('desk-show') || !deskDownXY) return;
            if (Math.hypot(ev.clientX - deskDownXY[0], ev.clientY - deskDownXY[1]) > 8) return;   // 끌기는 아니에요
            const t = ev.target;
            if (t.closest && t.closest('.diary-book, .toolbar, .modal, .drive-gate, #dskLayer, button, input, textarea, select, a, [contenteditable]')) return;
            if (t !== document.body && t !== H && !(t.classList && (t.classList.contains('diary-wrapper') || t.classList.contains('desk-bg') || t.classList.contains('desk-stage')))) return;
            if (window.deskTapAt && deskTapAt(ev.clientX, ev.clientY)) return;   // 다이어리 옆으로 보이는 소품을 톡 = 그 소품의 기능 (js/desk.js)
            if (window.deskCloseDiary) deskCloseDiary();
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
                const yes = await showMsg('구글 계정으로 로그인할까요?<br><span style="font-size:12px;color:#777;">' + (window.dvOn && dvOn() ? '이 기기 폴더에 쓴 일기는' : '게스트로 쓴 일기는') + ' 로그인한 뒤 내 드라이브로 옮길지 물어볼게요.</span>', true);
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
            if (t === 'scope') return '드라이브 파일 권한을 허용해야 일기를 저장할 수 있어요. 다시 시도해 주세요.';
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
            if (window.dvAuto && await dvAuto()) return;                    // 📁 로그인 없이 이 기기 폴더에 쓰기로 했으면 바로 열어요 (js/devsave.js)
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
            if (drive.local && window.dvLogin) return dvLogin();                   // 📁 이 기기 폴더로 쓰다가 구글로 (js/devsave.js)
            const guestDays = drive.guest ? guestSnapshot() : null;               // 👤 게스트로 쓴 일기 (로그인하면 메모리가 드라이브 것으로 바뀌어서 먼저 챙겨요)
            if (!drive.client && !driveClientMake() && await waitForGoogle(10000)) driveClientMake();   // 이 기기 폴더로 열었으면 구글 준비가 아직이에요
            showGate('wait', '☁ 구글 로그인 중이에요…<br>잠시만 기다려 주세요');      // 계정을 고른 뒤에도 보이는 글이라 '고르세요' 대신 (도련 10-21)
            try { await requestToken('select_account'); showGate('wait', '☁ 다이어리를 불러오는 중이에요…<br>잠시만 기다려 주세요'); await loadFromDrive(); hideGate(); await postLoginTasks(); }
            catch (e) { showGate('login', driveErrorText(e)); if (guestDays) guestHold = guestDays; return; }
            if (window.dvAfterLogin) dvAfterLogin();                              // 📁 폴더 모드를 쓰던 기기도 이제 드라이브로 열려요
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
                    if (cur !== null && !(await showAsk(`📅 <b>${dk.m}월 ${dk.d}일</b>은 드라이브에도 일기가 있어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 사라져요.</span>`, '👤 게스트로 쓴 것', '☁ 드라이브 것'))) continue;
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
            if (typeof dyySync === 'function') dyySync();                   // 📔 그 해 기본 다이어리 (js/dyyear.js)
            if (typeof bgoSync === 'function') bgoSync();                   // 🌈 분홍 단색 배경지 (js/bgown.js)
            hideGate(); updateBadge();
        }

        async function reloadFromDrive() {
            if (!drive.ready) { showMsg('먼저 구글 드라이브에 연결해 주세요.'); return; }
            const yes = await showMsg((drive.local ? '이 기기 폴더에' : '드라이브에') + ' 저장된 내용으로 현재 내용을 바꿔서 다시 불러올까요?<br><span style="font-size:12px;color:#777;">아직 저장되지 않은 변경은 사라져요.</span>', true);
            if (!yes) return;
            try { await loadFromDrive(); clearPending(); showMsg(drive.local ? '🔄 이 기기 폴더에서 다시 불러왔어요!' : '🔄 드라이브에서 다시 불러왔어요!'); }
            catch (e) { showMsg('⚠ ' + driveErrorText(e)); }
        }

        async function driveLogout() {
            if (drive.local && window.dvStop) return dvStop();                     // 📁 이 기기 폴더 그만 쓰기
            const yes = await showMsg('로그아웃할까요?<br><span style="font-size:12px;color:#777;">구글 드라이브에 저장된 일기는 그대로 남아 있어요.</span>', true);
            if (!yes) return;
            if (drive.ready && drive.dirty) await flushUpload();
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
        /* 임시 보관본은 그것을 만든 곳(구글 계정 · 이 기기 폴더)에서만 복구해요 : 다른 계정 · 하드 폴더로 섞여 들어가지 않게 (도련 · 2026-10-13) */
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
            try { if (!turn) saveData(false); } catch (err) {}      // 편집 중인 글/스티커를 메모리(store)에 반영
            if (!drive.ready || drive.guest || drive.wiped) return;  // 로그인 전 · 게스트면 저장할 곳이 없음 · 🗑 폴더가 지워졌으면 올리지 않음
            if (drive.dirty || drive.uploading) {
                savePending();                                       // 업로드 전에 먼저 이 기기에 안전하게 보관
                if (drive.dirty) flushUpload();                      // 디바운스(3초) 기다리지 않고 즉시 업로드
            }
        }

        /* 다음에 열었을 때, 업로드되지 못한 임시 보관본(변경된 날짜만)이 있으면 복구
           - 기기 시계는 믿지 않아요 : 보관할 때 적어 둔 '그때 드라이브 파일의 수정 시각'과 지금 수정 시각을 비교해요
             · 같으면 그 사이 아무도 안 고친 것 → 한 번에 "복구할까요?"
             · 다르면 그 사이 다른 기기가 고친 것 → 일기는 날마다 "어느 쪽을 남길까요?" · 설정은 한 번에 물어요
             · ☕ 카페 기록은 묻지 않고 양쪽을 합쳐요 (cafeMerge)
           - 지금 드라이브 내용이 보관본과 같으면 (이미 올라감) 아무것도 안 해요 */
        async function recoverPendingBackup() {
            const { p, forget } = await readAllPending();
            if (!p) { await forget(); return; }
            if (!drive.local && !(await getFolder([TOP_FOLDER_NAME], false).catch(() => 'x'))) { await forget(); return; }   // 🗑 말랑달콤 폴더가 없으면 옛 보관본은 버려요 (처음 상태)
            const B = p.b && typeof p.b === 'object' ? p.b : {}, BV = p.bv && typeof p.bv === 'object' ? p.bv : {};
            const safe = [], cafe = [], askDays = [], askSet = [];
            for (const k of Object.keys(p.items)) {
                const v = p.items[k];
                if (!k.startsWith('diary_') && !VAULT_KEYS.includes(k) && !isPageKey(k) && !isBookKey(k)) continue;
                if (!(v === null || typeof v === 'string')) continue;
                const dk = isOwnFile(k);
                let now;
                if (dk) {
                    await ensureKeyLoaded(k);
                    if (!drive.loadedDays.has(k)) continue;                             // 드라이브 내용을 읽지 못하면 건드리지 않음
                    if (isBookKey(k)) { if (v) store.setItem(k, JSON.stringify(dkInfoMerge(JSON.parse(v), JSON.parse(store.getItem(k) || '{}')))); continue; }   // 📕 다이어리.json 은 묻지 않고 합쳐요
                    const idx = await idxOfKey(k, false);
                    const f = idx && idx.files.get(fileOfKey(k));
                    now = f ? f.modifiedTime || '' : '';
                } else if (isSettingKey(k)) {
                    const sf = drive[KEY_FILES[keyFile(k)].prop];
                    now = sf && sf.modifiedTime || '';
                } else continue;
                if (store.getItem(k) === v) continue;                                   // 내용이 같음 (이미 올라갔어요)
                if (!dk && keyFile(k) === 'cafe') cafe.push(k);
                else if (k in B && B[k] === now) safe.push(k);                          // 그 사이 아무도 안 고쳤어요
                else (dk ? askDays : askSet).push(k);                                   // 그 사이 다른 기기가 고쳤어요
            }
            await forget();
            if (!safe.length && !cafe.length && !askDays.length && !askSet.length) return;
            const put = k => { const v = p.items[k]; if (v === null) store.removeItem(k); else store.setItem(k, v); };
            let any = false;
            const when = new Date(p.savedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            try {
                if (safe.length || cafe.length) {
                    const yes = await showMsg('📴 ' + when + ' 화면이 꺼질 때의 변경 내용이<br>드라이브에 저장되지 못했어요. (' + (safe.length + cafe.length) + '건)<br>이 기기에 보관된 내용으로 복구할까요?<br><span style="font-size:12px;color:#777;">취소를 누르면 드라이브의 현재 내용을 유지해요.</span>', true);
                    if (yes) {
                        safe.forEach(put);
                        cafe.forEach(k => { const m = cafeMerge(k, BV[k], p.items[k], store.getItem(k)); if (m !== store.getItem(k)) store.setItem(k, m); });
                        any = true;
                    }
                }
                for (const k of askDays) {
                    const mine = await showAsk(`📴 ${when} 화면이 꺼질 때 고친 <b>${keyLabel(k)}</b> 일기가 저장되지 못했는데,<br>그 사이 📱 다른 기기에서 이 날을 고쳤어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 사라져요.</span>`, '📝 이 기기 것', '📱 다른 기기 것');
                    if (mine) { if (window.trashKeepDay) await trashKeepDay(k, store.getItem(k)); put(k); any = true; }   // 🗑 다른 기기 것은 휴지통에
                }
                if (askSet.length) {
                    const mine = await showAsk(`📴 ${when} 화면이 꺼질 때 바꾼 <b>설정 ${askSet.length}개</b>가 저장되지 못했는데,<br>그 사이 📱 다른 기기에서 설정을 바꿨어요.<br>어느 쪽을 남길까요?`, '📝 이 기기 것', '📱 다른 기기 것');
                    if (mine) { askSet.forEach(put); any = true; }
                }
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
           📱💻 두 기기 · 두 탭에서 같이 쓸 때
           - 앱으로 돌아올 때 · 켜 둔 동안 1분마다 : 설정 · 카페 파일과 펼쳐 둔 날(앞 · 뒤 포함 3일)이
             다른 기기에서 바뀌었는지 '마지막 수정 시각'만 보고, 바뀌었으면 그것만 다시 읽어요
           - 같은 기기의 다른 탭이 저장하면 BroadcastChannel 로 바로 알려 줘요
           ===================================================================== */
        let lastRemoteCheck = 0, remoteChecking = null;
        const driveBC = (() => { try { return 'BroadcastChannel' in window ? new BroadcastChannel('mallang-drive') : null; } catch (e) { return null; } })();
        function driveTell(msg) { try { if (driveBC) driveBC.postMessage(msg); } catch (e) {} }
        if (driveBC) driveBC.onmessage = (e) => {
            const m = e.data || {};
            if (m.t === 'saved') checkRemote(true);
            else if (m.t === 'coll' && typeof collRemote === 'function') collRemote(m.path);   // 스티커 · 페이지 목록 (js/coll.js)
        };
        /* 🔔 다른 기기 확인을 가볍게 : 구글 드라이브 changes = "지난번 이후 이 앱이 만든 파일 중 바뀐 것" (도련 10-20)
           - 1분마다 요청 1개 · 바뀐 게 없으면 거기서 끝 · 있으면 아래 checkRemote 자세히 보기(폴더 지움 · 설정 · 카페 · 보는 날짜)
           - 내가 방금 올린 파일(mineWrote 로 기억한 id · 수정 시각 그대로)은 바뀐 걸로 안 쳐요
           - 표시(changeTok)는 이 창 메모리에만 · 모르겠으면(처음 · 실패) 늘 자세히 봐요 → 놓치는 일은 없어요 */
        let changeTok = null;
        const mineAt = new Map();                                            // 파일 id → 내가 올린 수정 시각
        function mineWrote(f) { if (f && f.id && f.modifiedTime) { mineAt.set(f.id, f.modifiedTime); if (mineAt.size > 300) mineAt.delete(mineAt.keys().next().value); } return f; }
        async function changesStart() {
            changeTok = null;
            if (drive.local) return;
            try { const res = await gfetch('https://www.googleapis.com/drive/v3/changes/startPageToken'); if (res.ok) changeTok = (await res.json()).startPageToken || null; } catch (e) {}
        }
        async function changesAny() {                                       // true = 바뀐 게 있거나 모름 → 자세히 보기
            if (drive.local) return true;
            if (!changeTok) { await changesStart(); return true; }
            let tok = changeTok, any = false;
            try {
                for (let i = 0; i < 20 && tok; i++) {
                    const res = await gfetch(`https://www.googleapis.com/drive/v3/changes?pageToken=${encodeURIComponent(tok)}&pageSize=200&spaces=drive&fields=nextPageToken,newStartPageToken,changes(fileId,removed,file(modifiedTime,trashed))`);
                    if (!res.ok) { changeTok = null; return true; }
                    const j = await res.json();
                    if ((j.changes || []).some(c => c.removed || !c.file || c.file.trashed || mineAt.get(c.fileId) !== c.file.modifiedTime)) any = true;
                    if (j.newStartPageToken) { changeTok = j.newStartPageToken; return any; }
                    tok = j.nextPageToken;
                }
            } catch (e) { return true; }
            changeTok = null; return true;
        }
        function checkRemote(force) {
            if (!drive.ready || drive.guest || document.hidden || drive.needAuth || drive.wiped) return Promise.resolve();
            if (!force && Date.now() - lastRemoteCheck < 50000) return Promise.resolve();
            if (remoteChecking) return remoteChecking;
            lastRemoteCheck = Date.now();
            remoteChecking = (async () => {
                const gen = drive.gen;
                if (!force && !(await changesAny())) return;               // 🔔 바뀐 게 없으면 요청 1개로 끝 (바뀐 게 있을 때만 아래처럼 자세히 봐요)
                if (await rootGone()) { rootReset(); return; }              // 🗑 다른 기기에서 말랑달콤 폴더를 지웠으면 이 창도 처음 상태로
                try { if (!turn) saveData(false); } catch (e) {}           // 쓰던 글을 먼저 메모리에 (고친 것은 지키려고)
                for (const which of Object.keys(KEY_FILES)) {
                    const F = KEY_FILES[which], known = drive[F.prop];
                    if (Array.from(drive.dirtyKeys).some(k => !isOwnFile(k) && keyFile(k) === which)) continue;   // 올릴 때 합쳐요
                    if (which === 'desk' && drive.deskLocked) continue;
                    const dir = await getFolder(F.path, false);
                    const cur = dir && (known && await driveMeta(known.id) || await findFile(dir, F.name));
                    if (gen !== drive.gen) return;
                    if (cur && (!known || cur.modifiedTime !== known.modifiedTime)) await mergeKeyFile(which, cur, new Set());
                }
                const keys = isCoverOpen ? [currentDate, addDays(currentDate, -1), addDays(currentDate, 1)].map(getDateKey) : [];
                const bk = keys.map(parsePageKey).find(Boolean);
                if (bk) { keys.unshift('dkb_' + bk.b); drive.books.delete(bk.b); }       // 📕 권 폴더 목록을 새로 · 다이어리.json 도
                for (const k of keys) if (parseDayKey(k)) { try { await dayRefresh(k); } catch (e) {} }   // 그날 파일만 새로 (수정 시각이 들어 있어요)
                let any = false;
                for (const key of keys) {
                    if (!drive.loadedDays.has(key) || drive.dirtyKeys.has(key) || drive.inflight === key) continue;
                    const idx = await idxOfKey(key, false);
                    const f = idx && idx.files.get(fileOfKey(key));
                    const t = f ? f.modifiedTime || '' : '';
                    if (gen !== drive.gen || t === (drive.dayMeta.get(key) || '')) continue;
                    const meta = {}, text = await fetchKey(key, meta);
                    if (gen !== drive.gen || drive.dirtyKeys.has(key)) continue;
                    store.putLoaded(key, text); drive.dayMeta.set(key, meta.t);
                    dayShownAgain(key); any = true;
                }
                if (any && typeof srRemote === 'function') srRemote();     // 🔍 검색 목록도 다시 맞춰 보게
                if (typeof collRemote === 'function') collRemote();         // 스티커 · 페이지 목록
            })().catch(e => console.warn('다른 기기 변경 확인 실패:', e)).finally(() => { remoteChecking = null; });
            return remoteChecking;
        }
        setInterval(() => checkRemote(), 60 * 1000);                     // 화면을 보는 동안 1분마다 (숨겨져 있으면 쉬어요)

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
