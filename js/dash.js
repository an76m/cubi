/* 말랑달콤 다이어리 - js/dash.js
   📊 백엔드 상황판 (도련 11-17 · Esc = 닫기 · 🪟 앱과 따로 창 (팝업 · 윗단 잡고 옮기기 · 막히면 앱 안에 옮길 수 있는 창) · 개발 중 도련 QA 용 · 상품공방처럼 써 보면서 고쳐요)
   - 다른 파일을 고치지 않아요 : fetch 를 감싸서 모든 요청을 기록 + 몇 개의 전역 함수(loadFromDrive · applyLoadedData · deskItemsRender · openCoverAnimated)에 시각 표시
   - 요약 = 🌐 종류별 요청 수 (도련 11-25 · 드라이브 · 깃허브 · 상품 서버 · 앱스크립트 · 구글 로그인 · 그 밖 · 이번 실행 / 오늘) · 드라이브 점수 · 한도는 '드라이브 요청' · '사용자 수' 탭
   - 탭 : 요약 · 드라이브 요청 · 사용자 수 · 속도 · 데이터 · 브라우저 저장 · 상태 · 기록(날마다)
   - 구글 드라이브 점수 (2026-05 새 방식) : 정보 읽기 5 · 쓰기 50 · 목록 100 · 파일 받기 200 (프로젝트 1분 1,000,000 · 사람 1분 325,000 · 하루 400,000,000 = 계산기 칸에서 바꿔요)
   - '앱 열기 한 번' = loadFromDrive 시작부터 60초 동안 · 날마다 합계 = localStorage malang_dash_days (14일)
   - 📋 복사 = 상황판 내용을 글로 (AI 에게 붙여 주기) */
(function () {
    const T0 = performance.now(), DAYS_KEY = 'malang_dash_days', CALC_KEY = 'malang_dash_calc', OPEN_MS = 60000;
    const D = { reqs: [], marks: [], errs: [], opens: [], names: new Map(), srv: { n: 0, b: 0 }, svc: {}, mem: {}, urls: new Map(), oh: new Map(), gh: { sess: 0, day: {} }, on: false, tab: 'sum', timer: 0, filt: '' };
    const now = () => performance.now() - T0;
    const mark = (n, extra) => { D.marks.push({ n, t: now(), x: extra || '' }); };
    window.dashMark = mark;
    mark('📄 코드 읽기 시작 (dash.js)');

    /* 💯 구글 드라이브 점수 */
    const PTS = { info: 5, write: 50, list: 100, down: 200, other: 0 };
    const KN = { info: '정보 읽기', write: '쓰기', list: '목록', down: '파일 받기', other: '기타' };
    function classify(m, url) {
        let u; try { u = new URL(url); } catch (e) { return 'other'; }
        const p = u.pathname, media = u.searchParams.get('alt') === 'media';
        if (p.includes('/changes/startPageToken') || p.endsWith('/about')) return 'info';
        if (p.endsWith('/changes')) return 'list';
        if (p.includes('/revisions')) return media ? 'down' : (m === 'GET' && p.endsWith('/revisions') ? 'list' : 'info');
        if (m === 'GET' && /\/files$/.test(p)) return 'list';
        if (m === 'GET') return media ? 'down' : 'info';
        return 'write';
    }
    const isDrive = url => /^https:\/\/www\.googleapis\.com\/(drive|upload\/drive)\//.test(url);
    const isSrv = url => url.startsWith('https://malang-img.pages.dev');
    /* 🌐 어디로 보낸 요청인가 (도련 11-25 · 종류별 요청 수) : ☁ 구글 드라이브 = fetch 감싸기 · 🐙 깃허브 (앱 코드 · 같은 사이트) = 서비스 워커가 센 것 + 워커 없이 간 것 · 그 밖 = 브라우저 기록 (PerformanceObserver) */
    const SVC = [['drive', '☁ 구글 드라이브'], ['gh', '🐙 깃허브 (앱 코드)'], ['srv', '🧁 상품 서버'], ['gas', '📜 앱스크립트'], ['world', '🎪 광장 서버'], ['login', '🔑 구글 로그인'], ['other', '🌐 그 밖']];
    function svcOf(url) {
        if (isDrive(url)) return 'drive';
        let u; try { u = new URL(url, location.href); } catch (e) { return 'other'; }
        if (u.origin === location.origin) return 'gh';
        if (isSrv(u.href)) return 'srv';
        if (/^script\.google(usercontent)?\.com$/.test(u.hostname)) return 'gas';
        if (/^malang-world\./.test(u.hostname)) return 'world';                // 🎪 광장 · 이벤트 (Cloudflare Workers · js/world.js · 웹소켓 연결은 못 세요)
        if (/^(accounts\.google\.com|oauth2\.googleapis\.com|apis\.google\.com)$/.test(u.hostname)) return 'login';
        return 'other';
    }
    function svcAdd(k, url) {
        D.svc[k] = (D.svc[k] || 0) + 1;
        if (k === 'other') { let h = '?'; try { h = new URL(url, location.href).hostname; } catch (e) { } D.oh.set(h, (D.oh.get(h) || 0) + 1); }
        const d = dayOf(); d.s = d.s || {}; d.s[k] = (d.s[k] || 0) + 1; daySave();
    }
    const HELP = new Set(['gfetch', 'fetch', 'driveList', 'readFileText', 'driveUpsert', 'driveMeta', 'findFile', 'findFolder', 'getFolder', 'createFolder', 'ensureToken', 'driveFail', 'sealOpen', 'bodySeal', 'Promise.then', 'Array.map', 'Array.forEach', 'Promise.all']);
    function feature() {                                                      // 누가 보냈나 = 코드 자리 (파일:함수)
        const st = String(new Error().stack || '').split('\n').slice(2); let anon = '';
        for (const l of st) {
            const m = /at (?:async )?(?:([\w$.<>]+) \()?.*\/js\/([\w-]+)\.js/.exec(l);   // 이름 없는 함수 = 파일만
            if (!m) continue;
            const fn = (m[1] || '').replace(/^Object\./, ''), file = m[2];
            if (file === 'dash' || HELP.has(fn)) continue;                       // 드라이브 도우미는 건너뛰고 부른 쪽
            if (!fn || fn === 'eval') { anon = anon || file; continue; }         // 이름 없는 함수 = 더 위에서 이름 있는 쪽을 찾아요
            return file + ':' + fn;
        }
        return anon || '?';
    }
    function what(m, url, body) {                                             // 무엇을 = 파일 이름 · 찾은 조건
        let u; try { u = new URL(url); } catch (e) { return url.slice(0, 60); }
        const q = u.searchParams.get('q');
        if (q) return '🔎 ' + q.split(' and ').filter(c => !/^trashed=|^mimeType/.test(c.trim())).map(c => c.trim().replace(/^'([^']+)' in parents$/, (x, id) => '📁' + (D.names.get(id) || (id === 'root' ? '맨 위' : id.slice(0, 6))) + ' 안')).join(' · ').slice(0, 90) + (/mimeType='application\/vnd.google-apps.folder'/.test(q) ? ' (폴더)' : '');
        const id = (/\/files\/([^/?]+)/.exec(u.pathname) || [])[1];
        if (id) return (D.names.get(id) || id.slice(0, 10) + '…') + (u.pathname.includes('/revisions') ? ' (예전 판)' : '');
        if (typeof body === 'string') { const n = /"name"\s*:\s*"([^"]+)"/.exec(body.slice(0, 600)); if (n) return '＋ ' + n[1]; }
        if (u.pathname.endsWith('/changes')) return '🔔 다른 기기 변경 목록';
        if (u.pathname.includes('startPageToken')) return '🔔 변경 표시 받기';
        if (u.pathname.endsWith('/about')) return '👤 계정 번호';
        return u.pathname.slice(0, 60);
    }
    const bsize = b => { try { if (b == null) return 0; if (typeof b === 'string') return new Blob([b]).size; if (b.size != null) return b.size; if (b.byteLength != null) return b.byteLength; } catch (e) { } return 0; };
    const learn = (j) => { try { (j.files || []).forEach(f => f && f.id && f.name && D.names.set(f.id, f.name)); if (j.id && j.name) D.names.set(j.id, j.name); } catch (e) { } };

    /* 🕸 모든 요청 기록 (fetch 감싸기) */
    const F0 = window.fetch.bind(window);
    window.fetch = function (input, opts) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const m = ((opts && opts.method) || (input && input.method) || 'GET').toUpperCase();
        const t = now();
        if (isDrive(url)) {
            const k = classify(m, url), r = { t, m, k, pts: PTS[k], feat: feature(), name: what(m, url, opts && opts.body), up: bsize(opts && opts.body), down: 0, ms: 0, st: 0 };
            D.reqs.push(r); if (D.reqs.length > 3000) D.reqs.shift();
            dayAdd(r); svcAdd('drive');
            return F0(input, opts).then(res => {
                r.ms = Math.round(now() - t); r.st = res.status;
                res.clone().arrayBuffer().then(b => { r.down = b.byteLength; dayBytes(r); if (/json/.test(res.headers.get('content-type') || '')) { try { learn(JSON.parse(new TextDecoder().decode(b))); } catch (e) { } } }).catch(() => { });
                return res;
            }, e => { r.ms = Math.round(now() - t); r.st = -1; throw e; });
        }
        if (isSrv(url)) return F0(input, opts).then(res => { res.clone().arrayBuffer().then(b => { D.srv.b += b.byteLength; }).catch(() => { }); return res; });
        return F0(input, opts);
    };
    /* 🌐 드라이브 밖 요청 = 브라우저 기록으로 세요 (코드 · 그림 · 상품 · 앱스크립트 · 로그인 · 글꼴 …)
         🐙 같은 사이트 : 서비스 워커가 맡은 창의 ?v= 파일 · 첫 화면 = 워커가 세요 (아래 ghAsk) · 그 밖 = 진짜로 받았을 때만 (transferSize > 0 · 브라우저 기억에서 꺼낸 것은 빼요) */
    const swOn = () => !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    function seen(e) {
        const k = svcOf(e.name); if (k === 'drive') return;
        if (k === 'gh' && swOn() && (e.entryType === 'navigation' || /[?&]v=/.test(e.name))) return;
        const blind = !(e.transferSize > 0) && !(e.encodedBodySize > 0) && !(e.decodedBodySize > 0);   // 크기를 안 알려 줘요 (다른 주소 · 서버 표시 Timing-Allow-Origin 이 없음 · 그 표시 전에 받아 둔 사본도)
        const cached = (!(e.transferSize > 0) && (k === 'gh' || e.encodedBodySize > 0 || e.decodedBodySize > 0)) || (blind && k !== 'gh' && e.duration < 5);   // (크롬 deliveryType 'cache' 는 안 봐요 = 서버에 '바뀌었나' 물어 304 받은 것도 cache 라고 해서 · 그건 진짜 요청 · 도련 11-25 prod-i.json) 🧠 사본 = 크기는 있는데 주고받은 게 0 · 크기를 모르면 5ms 안에 끝남 (서버에 다녀오면 수십 ms · 도련 11-25 개발자도구 확인 : 사본 0~1ms)
        if (cached) { D.mem[k] = (D.mem[k] || 0) + 1; return; }   // 🧠 브라우저 기억에서 꺼냄 = 서버 요청 아님 (다른 주소는 서버가 Timing-Allow-Origin 을 줄 때만 알 수 있어요 · 상품 서버 = 상품공방 포장 _headers)
        if (k === 'srv') { D.srv.n++; if (e.initiatorType !== 'fetch') D.srv.b += e.transferSize || 0; }
        const u = e.name.split('#')[0]; D.urls.set(u, (D.urls.get(u) || 0) + 1);   // 🔁 같은 주소를 또 받았나 (비효율 찾기)
        svcAdd(k, e.name);
    }
    try { new PerformanceObserver(l => l.getEntries().forEach(seen)).observe({ type: 'resource', buffered: true }); } catch (e) { }
    try { new PerformanceObserver(l => l.getEntries().forEach(seen)).observe({ type: 'navigation', buffered: true }); } catch (e) { }
    function ghAsk() {                                                        // 🐙 서비스 워커가 깃허브에 보낸 요청 (sw.js dashCount · 이번 열기 · 날마다)
        try { const c = navigator.serviceWorker && navigator.serviceWorker.controller; if (!c) return; const ch = new MessageChannel(); ch.port1.onmessage = e => { if (e.data && e.data.day && JSON.stringify(e.data) !== JSON.stringify(D.gh)) { D.gh = e.data; paintSoon(); } }; c.postMessage({ dash: 1 }, [ch.port2]); } catch (e) { }
    }

    /* ⚠ 경고 · 오류 모으기 */
    ['warn', 'error'].forEach(lv => { const o = console[lv].bind(console); console[lv] = function (...a) { try { D.errs.push({ t: now(), lv, s: a.map(x => x instanceof Error ? x.message : typeof x === 'object' ? (() => { try { return JSON.stringify(x).slice(0, 200); } catch (e) { return String(x); } })() : String(x)).join(' ').slice(0, 300) }); if (D.errs.length > 200) D.errs.shift(); } catch (e) { } return o(...a); }; });
    window.addEventListener('error', e => D.errs.push({ t: now(), lv: 'error', s: String(e.message || e) }));
    window.addEventListener('unhandledrejection', e => D.errs.push({ t: now(), lv: 'error', s: '약속 실패: ' + String((e.reason && e.reason.message) || e.reason).slice(0, 200) }));

    /* 📅 날마다 합계 */
    const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    let days = {}; try { days = JSON.parse(localStorage.getItem(DAYS_KEY) || '{}') || {}; } catch (e) { days = {}; }
    const dayOf = () => days[today()] || (days[today()] = { n: 0, pts: 0, k: {}, up: 0, down: 0, opens: [] });
    let saveT = 0;
    const daySave = () => { clearTimeout(saveT); saveT = setTimeout(() => { const ks = Object.keys(days).sort(); while (ks.length > 14) delete days[ks.shift()]; try { localStorage.setItem(DAYS_KEY, JSON.stringify(days)); } catch (e) { } }, 3000); };
    function dayAdd(r) { const d = dayOf(); d.n++; d.pts += r.pts; d.k[r.k] = (d.k[r.k] || 0) + 1; daySave(); }
    function dayBytes(r) { const d = dayOf(); d.up += r.up; d.down += r.down; daySave(); }

    /* ⏱ 시각 표시 (전역 함수 감싸기 · 다른 파일을 안 고쳐요) */
    function wrap(name, before, after) {
        const f = window[name]; if (typeof f !== 'function' || f.__dash) return;
        const w = function (...a) { before && before(); const r = f.apply(this, a); if (after) { if (r && typeof r.then === 'function') r.then(() => after(), () => after()); else after(); } return r; };
        w.__dash = 1; window[name] = w;
    }
    const once = {};
    const first = n => () => { if (!once[n]) { once[n] = 1; mark(n); } };
    function hookAll() {
        wrap('loadFromDrive', () => { mark('☁ 드라이브 읽기 시작 (로그인)'); D.opens.push({ t: now(), i: D.reqs.length }); }, () => { mark('☁ 드라이브 읽기 끝'); setTimeout(openDone, OPEN_MS); });
        wrap('enterGuestMode', first('🏠 로그인 없이 시작'));
        wrap('applyLoadedData', null, first('🎨 불러온 설정으로 다시 그리기 (첫 번)'));
        wrap('deskItemsRender', null, first('🪑 책상 소품 그리기 (첫 번)'));
        wrap('openCoverAnimated', first('📖 다이어리 펼치기 (첫 번)'));
    }
    function openDone() {                                                     // 앱 열기 한 번 = 로그인부터 60초 동안 쓴 점수
        const o = D.opens[D.opens.length - 1]; if (!o || o.done) return;
        o.done = 1; o.pts = D.reqs.filter(r => r.t >= o.t && r.t < o.t + OPEN_MS).reduce((a, r) => a + r.pts, 0); o.n = D.reqs.filter(r => r.t >= o.t && r.t < o.t + OPEN_MS).length;
        const d = dayOf(); d.opens.push(o.pts); if (d.opens.length > 30) d.opens.shift(); daySave();
    }
    document.addEventListener('DOMContentLoaded', () => { mark('📄 화면 틀 완성 (DOMContentLoaded)'); hookAll(); });
    window.addEventListener('load', () => { mark('📄 파일 모두 받음 (load)'); hookAll(); setTimeout(ghAsk, 1500); if (window.PROD_READY) PROD_READY.then(v => mark('🧁 상품 목록 확인 끝', String(v))); });

    /* 🧮 계산 */
    const fmt = n => Math.round(n).toLocaleString('ko-KR');
    const kb = b => b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : b >= 1024 ? Math.round(b / 1024) + 'KB' : b + 'B';
    const sum = (L, f) => L.reduce((a, x) => a + (f ? f(x) : x), 0);
    function stats(L) { const k = {}; Object.keys(PTS).forEach(x => k[x] = { n: 0, p: 0 }); L.forEach(r => { k[r.k].n++; k[r.k].p += r.pts; }); return { n: L.length, p: sum(L, r => r.pts), k, up: sum(L, r => r.up), down: sum(L, r => r.down) }; }
    const lastMin = () => D.reqs.filter(r => r.t > now() - 60000);
    function maxMinute() { let best = 0; const L = D.reqs; let j = 0, s = 0; for (let i = 0; i < L.length; i++) { s += L[i].pts; while (L[i].t - L[j].t > 60000) { s -= L[j].pts; j++; } if (s > best) best = s; } return best; }
    function openCost() {
        const mine = D.opens.filter(o => o.done).map(o => o.pts), d = (days[today()] || {}).opens || [], all = mine.length ? mine : d;
        if (all.length) return { v: sum(all) / all.length, src: all.length + '번 잰 평균' };
        const o = D.opens[D.opens.length - 1]; if (o) { const p = D.reqs.filter(r => r.t >= o.t).reduce((a, r) => a + r.pts, 0); return { v: p, src: '지금 재는 중 (로그인 ' + Math.round((now() - o.t) / 1000) + '초째)' }; }
        return { v: 0, src: '아직 로그인 전' };
    }
    function usePerMin() {                                                    // 앱 열기(60초)를 뺀 나머지 = 쓰는 동안 1분 점수
        const o = D.opens[0]; if (!o) return { v: 0, src: '아직' };
        const inOpen = r => D.opens.some(x => r.t >= x.t && r.t < x.t + OPEN_MS);
        const L = D.reqs.filter(r => r.t >= o.t && !inOpen(r)), mins = Math.max(0, (now() - o.t - D.opens.length * OPEN_MS) / 60000);
        return mins < .5 ? { v: 0, src: '쓴 시간이 짧아요' } : { v: sum(L, r => r.pts) / mins, src: Math.round(mins) + '분 쓴 것으로' };
    }
    let calc = { perMin: 1000000, perDay: 400000000, perUserMin: 325000, opens: 3, useMin: 20, peak: 1 };
    try { Object.assign(calc, JSON.parse(localStorage.getItem(CALC_KEY) || '{}')); } catch (e) { }
    function users() {
        const oc = openCost(), up = usePerMin(), day = calc.opens * oc.v + calc.useMin * up.v;
        const byDay = day > 0 ? calc.perDay / day : Infinity, byMin = oc.v > 0 ? calc.perMin / (oc.v * calc.peak / 100) : Infinity;
        return { oc, up, day, byDay, byMin, max: Math.min(byDay, byMin), at: byDay <= byMin ? '하루 한도' : '1분 한도', together: oc.v > 0 ? calc.perMin / oc.v : Infinity, myMax: maxMinute() };
    }

    /* 🗄 브라우저 저장 */
    async function browserStore() {
        const out = { ls: [], ss: [], idb: [], cache: [], est: null };
        try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); out.ls.push({ k, b: (k.length + (localStorage.getItem(k) || '').length) * 2 }); } } catch (e) { }
        try { for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); out.ss.push({ k, b: (k.length + (sessionStorage.getItem(k) || '').length) * 2 }); } } catch (e) { }
        out.ls.sort((a, b) => b.b - a.b); out.ss.sort((a, b) => b.b - a.b);
        try {
            const dbs = indexedDB.databases ? await indexedDB.databases() : [];
            for (const x of dbs) {
                const db = await new Promise(r => { const q = indexedDB.open(x.name); q.onsuccess = () => r(q.result); q.onerror = () => r(null); q.onupgradeneeded = () => { q.transaction.abort(); r(null); }; });
                if (!db) { out.idb.push({ name: x.name, stores: [] }); continue; }
                const stores = [];
                for (const s of [...db.objectStoreNames]) {
                    const keys = await new Promise(r => { try { const q = db.transaction(s).objectStore(s).getAllKeys(null, 400); q.onsuccess = () => r(q.result || []); q.onerror = () => r([]); } catch (e) { r([]); } });
                    const cnt = await new Promise(r => { try { const q = db.transaction(s).objectStore(s).count(); q.onsuccess = () => r(q.result); q.onerror = () => r(keys.length); } catch (e) { r(keys.length); } });
                    stores.push({ s, cnt, keys: keys.map(k => typeof k === 'string' ? k : JSON.stringify(k)) });
                }
                db.close(); out.idb.push({ name: x.name, v: x.version, stores });
            }
        } catch (e) { }
        try { if (window.caches) for (const k of await caches.keys()) { const c = await caches.open(k), ks = await c.keys(); out.cache.push({ k, n: ks.length, files: ks.slice(0, 300).map(r => r.url.replace(location.origin, '')) }); } } catch (e) { }
        try { out.est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null; } catch (e) { }
        return out;
    }

    /* 🖥 화면 */
    const css = `#dashP{position:fixed;inset:12px 12px 12px auto;width:min(760px,calc(100vw - 24px));z-index:2147483000;background:#fffafc;border:2px solid #ffb6c1;border-radius:14px;box-shadow:0 10px 40px rgba(120,40,70,.25);font:13px/1.45 system-ui,'Malgun Gothic',sans-serif;color:#4a3640;display:flex;flex-direction:column}
#dashP *{box-sizing:border-box}#dashP .dh{display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid #f3d3dd;flex-wrap:wrap}
#dashP .dh b{font-size:15px;color:#d6457a;margin-right:auto}#dashP button{border:1px solid #f0b8c8;background:#fff;border-radius:8px;padding:3px 9px;cursor:pointer;font:inherit;color:#7a4a5a}
#dashP button.on{background:#ff8fab;color:#fff;border-color:#ff8fab}#dashP .db{overflow:auto;padding:10px 12px;flex:1}
#dashP table{border-collapse:collapse;width:100%;margin:4px 0 12px}#dashP td,#dashP th{border-bottom:1px solid #f6e1e8;padding:3px 6px;text-align:left;vertical-align:top}#dashP th{color:#a06078;font-weight:600;background:#fff0f5}
#dashP td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}#dashP h4{margin:12px 0 4px;color:#c2557e}#dashP .big{font-size:22px;font-weight:700;color:#d6457a}
#dashP .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:8px}#dashP .card{background:#fff;border:1px solid #f3d3dd;border-radius:10px;padding:8px}
#dashP .card small{display:block;color:#a07a88}#dashP .bar{height:9px;background:#ff9fbc;border-radius:5px;min-width:2px}#dashP .warn{color:#d23c3c}#dashP .ok{color:#2e9b5e}
#dashP input{width:110px;border:1px solid #f0b8c8;border-radius:6px;padding:2px 6px;font:inherit}#dashP .tip{color:#9a7884;font-size:12px}#dashP code{background:#fff0f5;padding:0 4px;border-radius:4px}
#dashP{resize:both;overflow:hidden;min-width:360px;min-height:240px}#dashP .dh{cursor:move;user-select:none}#dashP details{margin:2px 0}#dashP summary{cursor:pointer}`;
    const TABS = [['sum', '요약'], ['req', '드라이브 요청'], ['users', '사용자 수'], ['speed', '속도'], ['data', '데이터'], ['store', '브라우저 저장'], ['state', '상태'], ['days', '날마다'], ['log', '🧾 기록']];
    const esc = s => htmlEsc(s);   // 🧰 js/util.js (dash.js 가 util.js 보다 먼저 읽혀서 = 쓸 때 불러요)
    let DOC = document;                                                       // 그리는 곳 = 따로 창 (팝업) 또는 앱 안 (팝업이 막혔을 때)
    function el() {
        let p = DOC.getElementById('dashP'); if (p) return p;
        const st = DOC.createElement('style'); st.textContent = css + (DOC !== document ? POP_CSS : ''); DOC.head.appendChild(st);
        p = DOC.createElement('div'); p.id = 'dashP';
        p.innerHTML = `<div class="dh"><b>📊 백엔드 상황판</b>${TABS.map(([k, n]) => `<button data-t="${k}">${n}</button>`).join('')}<button data-a="copy">📋 복사</button><button data-a="x">✕</button></div><div class="db"></div>`;
        p.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.t) { D.tab = b.dataset.t; paint(true); } else if (b.dataset.a === 'x') dashToggle(false); else if (b.dataset.a === 'copy') copy(b); else if (b.dataset.a === 'bclear') { if (window.clearBrowserStore) { try { window.focus(); } catch (x) { } clearBrowserStore(); } } else if (b.dataset.a === 'reset') { if (confirm('날마다 기록을 지울까요?')) { days = {}; localStorage.removeItem(DAYS_KEY); paint(true); } } });
        p.addEventListener('input', e => { const i = e.target; if (i.dataset.c) { calc[i.dataset.c] = +i.value || 0; try { localStorage.setItem(CALC_KEY, JSON.stringify(calc)); } catch (x) { } paintSoon(); } else if (i.dataset.f != null) { D.filt = i.value; paintSoon(); } });
        p.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); dashToggle(false); } e.stopPropagation(); });   // 상황판 안에서 누른 키는 앱으로 안 가요 (F2 · Esc = 닫기)
        if (DOC === document) drag(p);
        DOC.body.appendChild(p); return p;
    }
    function drag(p) {                                                         // 🖱 앱 안 창 = 윗단을 잡고 옮기기 · 오른쪽 아래 모서리로 크기
        p.querySelector('.dh').addEventListener('pointerdown', e => {
            if (e.target.closest('button')) return;
            const r = p.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
            Object.assign(p.style, { left: r.left + 'px', top: r.top + 'px', right: 'auto', bottom: 'auto', width: r.width + 'px', height: r.height + 'px' });
            const mv = ev => { p.style.left = Math.max(0, Math.min(innerWidth - 80, ev.clientX - dx)) + 'px'; p.style.top = Math.max(0, Math.min(innerHeight - 40, ev.clientY - dy)) + 'px'; };
            const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
            addEventListener('pointermove', mv); addEventListener('pointerup', up); e.preventDefault();
        });
    }
    let pt = 0; const paintSoon = () => { clearTimeout(pt); pt = setTimeout(() => paint(false), 250); };
    function table(head, rows) { return `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => `<td${typeof c === 'number' || /^[\d,.]+(KB|MB|B|ms|점|번|%)?$/.test(String(c)) ? ' class="n"' : ''}>${typeof c === 'number' ? fmt(c) : c}</td>`).join('')}</tr>`).join('')}</table>`; }
    function kindRows(s) { return Object.keys(PTS).filter(k => k !== 'other').map(k => [KN[k] + ` <span class="tip">(${PTS[k]}점)</span>`, s.k[k].n, s.k[k].p]); }
    function byFeat(L) { const m = new Map(); L.forEach(r => { const x = m.get(r.feat) || { n: 0, p: 0, b: 0 }; x.n++; x.p += r.pts; x.b += r.up + r.down; m.set(r.feat, x); }); return [...m.entries()].sort((a, b) => b[1].p - a[1].p); }
    function prodState() { return window.PROD_FAIL ? '🛑 못 받음 (멈춤)' : window.PROD_FROM === 'dev' ? '⚡ 기기 목록 (서버 버전 확인)' : '🧁 서버에서 받은 목록'; }

    /* 🧾 문제 기록 (도련 11-19 · 1316 · 예전 ⚙ 설정 → 💾 저장 → 🧾 문제 기록) : 이 기기 브라우저 기록 (js/drive.js diag · diagRead · 1317 부터 드라이브 파일 없음) · 새것부터 · 📋 복사 = JSON 그대로 (Claude 에게) */
    const DIAG_TXT = { prodFix: '🛟 받은 상품 옛 모습 → 서버 모습', dygift: '🎁 처음 선물 권', dkfloat: '🎈 로그인 뒤 다이어리 띄우기', start: '▶ 앱 시작', mkdir: '📁 폴더 만듦', dup: '📁📁 같은 이름 폴더가 여러 개', merge: '📁 폴더 합침 → 빈 폴더 휴지통', mergeFail: '⚠ 폴더 합치기 멈춤', trash: '🗑 휴지통으로', kill: '🔥 완전 삭제 (다 쓴 종이)', twrite: '⚠ 휴지통 파일에 쓰려다 새로 만듦', stale: '⚠ 기억한 파일이 휴지통에 있음', gone: '⚠ 폴더가 없어져서 다시 찾음', root: '🗑 말랑달콤 폴더가 지워진 걸 알아챔', rescue: '🛟 목록 되살림', rescueWait: '⏳ 목록이 없지만 방금 받은 종이라 기다림', noList: '📄 목록 없음 → 빈 목록', shrink: '⚠ 목록이 한꺼번에 줄었음' , dysize: '📐 다이어리 모양 · 크기 바뀜', dkup: '📖 다이어리 떠오름', peel: '🏷️ 씰 종이 열기 (스티커마다)', peelLive: '🎬 씰 종이 위 움직이는 그림', dkdown: '🪑 다이어리 내려앉음', ledger: '📒 장부 읽기 · 저장', ledgerBack: '📒 예전 파일 · 폴더 되돌림', goneScrub: '🧹 영구삭제 칸 정리', goneFile: '⚠ 영구삭제 파일 못 지움', sealBad: '🔐 잠근 파일이 안 열림', sealOld: '🔐 예전 잠금 바꿈', lazyBad: '⚠ 깨진 파일', md5: '⚠ 올린 파일이 손상', remote: '🔄 다른 기기에서 바뀐 것 받음', rootDup: '📁📁 말랑달콤 폴더가 둘', rootRetired: '📁 예전 말랑달콤 폴더 정리', tapeErr: '⚠ 책상 마테 그리다 멈춤', tapeWhite: '⚠ 책상 마테가 하얗게', tapeTh: '🎀 마테 미리보기 고침' };
    let logTxt = '';
    async function logPaint(box) {
        box.innerHTML = '<p class="tip">🧾 기록을 읽는 중…</p>';
        if (!window.diagRead) { box.innerHTML = '<p class="warn">기록 장치를 불러오지 못했어요.</p>'; return; }
        let all = []; try { all = await diagRead(); } catch (e) { box.innerHTML = '<p class="warn">기록을 읽지 못했어요.</p>'; return; }
        logTxt = JSON.stringify(all.slice(-400));
        const when = t => { const d = new Date(t); return isNaN(d) ? '' : d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
        const rest = r => Object.entries(r).filter(([k]) => !['t', 'd', 'v', 'e', 'who'].includes(k)).map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ');
        if (D.tab !== 'log') return;
        box.innerHTML = `<p class="tip">🧾 문제 기록 (log) · 이 기기 기록 · 최근 ${Math.min(300, all.length)}줄 · 모두 ${all.length}줄 · 새것이 위 · 📋 복사 = 기록 그대로 (Claude 에게)</p>
${table(['때', '무슨 일', '내용', '부른 곳', '기기 · 버전'], all.slice(-300).reverse().map(r => [esc(when(r.t)), esc(DIAG_TXT[r.e] || r.e), `<span class="tip">${esc(rest(r))}</span>`, `<code>${esc(r.who || '')}</code>`, esc(r.d + ' · ' + r.v)]))}`;
    }
    const VIEW = {
        sum() {
            ghAsk();
            const d = dayOf(), ds = d.s || {}, g = D.gh, gd = (g.day || {})[today()] || 0;
            const run = k => (D.svc[k] || 0) + (k === 'gh' ? g.sess || 0 : 0), day = k => (ds[k] || 0) + (k === 'gh' ? gd : 0);
            const tot = SVC.reduce((a, [k]) => a + run(k), 0), totD = SVC.reduce((a, [k]) => a + day(k), 0);
            const oh = [...D.oh.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([h, n]) => esc(h) + ' ' + n).join(' · ');
            const dup = [...D.urls.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 10);
            return `<div class="cards">${SVC.map(([k, n]) => `<div class="card"><small>${n}</small><span class="big">${fmt(run(k))}</span>번<br><span class="tip">오늘 (이 기기) ${fmt(day(k))}번${D.mem[k] ? ` · 🧠 기억에서 ${fmt(D.mem[k])}번 (안 셈)` : ''}</span></div>`).join('')}
<div class="card"><small>모두</small><span class="big">${fmt(tot)}</span>번<br><span class="tip">오늘 (이 기기) ${fmt(totD)}번</span></div></div>
<p class="tip">이번 실행 = 이 창을 연 뒤 (🐙 깃허브는 앱을 열 때 버전 확인부터) · 오늘 = 이 기기 합계 · 🐙 = 서비스 워커가 깃허브에 보낸 것 + 브라우저가 진짜로 받은 것 (기기 보관함 · 브라우저 기억에서 꺼낸 것은 빼요) · 🧁 상품 서버 = 목록 · 그림 · 🔑 = 구글 로그인 창 · 열쇠${oh ? ` · 🌐 그 밖 = ${oh}` : ''}</p>
<div class="cards"><div class="card"><small>상품 목록</small>${prodState()}</div></div>
<h4>🔁 같은 주소를 서버에서 또 받은 것 (드라이브 빼고 · 비효율 찾기)</h4>${dup.length ? table(['주소', '번'], dup.map(([u, n]) => [esc(u.replace(location.origin, '🐙').replace('https://malang-img.pages.dev', '🧁').slice(0, 90)), n])) : '<p class="tip">없어요 👍</p>'}
<h4>⏱ 앱 열기 단계</h4>${table(['단계', '앱 시작 후'], D.marks.map(x => [esc(x.n) + (x.x ? ` <span class="tip">${esc(x.x)}</span>` : ''), (x.t / 1000).toFixed(2) + '초']))}
${D.errs.length ? `<h4 class="warn">⚠ 경고 · 오류 ${D.errs.length}개 (상태 탭)</h4>` : ''}`;
        },
        vsGoogle(m) {                                                         // 🏁 구글 한도와 나란히 (도련 11-17 : 점수만 봐서는 몰라요 · 구글 것과 같이 보면서 판단)
            m = m || stats(lastMin());
            const u = users(), d = dayOf();
            const pc = (v, lim) => lim > 0 ? v / lim * 100 : 0;
            const pct = x => x >= 10 ? x.toFixed(0) + '%' : x >= 1 ? x.toFixed(1) + '%' : x > 0 ? x.toFixed(3) + '%' : '0%';
            const bar = x => `<div style="background:#f6e1e8;border-radius:5px;width:180px;height:10px"><div class="bar" style="width:${Math.min(100, Math.max(x > 0 ? 1.5 : 0, x))}%;${x >= 80 ? 'background:#e04848' : x >= 50 ? 'background:#f0a030' : ''}"></div></div>`;
            const many = (v, lim) => v > 0 ? fmt(Math.floor(lim / v)) + '명' : '—';
            const row = (mine, mv, gname, lim, mean) => { const x = pc(mv, lim); return [mine, fmt(mv) + '점', gname, fmt(lim) + '점', `${bar(x)}<span class="tip">${pct(x)}</span>`, mean]; };
            return `<h4>🏁 구글 한도와 비교 <span class="tip">(구글 Drive API · 2026-05 새 방식 · 한도 값은 '사용자 수' 탭에서 고쳐요)</span></h4>
${table(['내 숫자', '점수', '구글 한도', '한도', '얼마나 썼나', '뜻'], [
                row('최근 1분 (나 혼자)', m.p, '한 사람 1분', calc.perUserMin, m.p ? `나 혼자 한도까지 ${many(m.p, calc.perUserMin).replace('명', '배')} 여유` : '지금은 안 써요'),
                row('가장 많이 쓴 1분 (이번 실행)', u.myMax, '한 사람 1분', calc.perUserMin, u.myMax > calc.perUserMin ? '<span class="warn">⚠ 한 사람 한도를 넘어요 (구글이 잠깐 막아요)</span>' : '<span class="ok">한 사람 한도 안</span>'),
                row('최근 1분 (나 혼자)', m.p, '프로젝트 1분 (모두 합쳐)', calc.perMin, m.p ? `모두가 지금 나처럼 쓰면 동시에 ${many(m.p, calc.perMin)}` : '—'),
                row('앱 열기 한 번', u.oc.v, '프로젝트 1분 (모두 합쳐)', calc.perMin, u.oc.v ? `같은 1분에 ${many(u.oc.v, calc.perMin)}이 앱을 열 수 있어요` : '로그인 후에 재요'),
                row('오늘 (이 기기 · 나)', d.pts, '프로젝트 하루 (넘으면 요금)', calc.perDay, d.pts ? `오늘의 나처럼 쓰는 사람 ${many(d.pts, calc.perDay)}까지 하루 무료` : '—')
            ])}
<p class="tip">구글 점수표 : 정보 읽기 5 · 쓰기 50 · 목록(찾기) 100 · 파일 받기 200 · 진짜 사용량 = Google Cloud 콘솔 → API 및 서비스 → Google Drive API → 측정항목 · 할당량 (이 상황판은 이 기기 것만 세요)</p>`;
        },
        req() {
            const f = D.filt.trim(), L = D.reqs.filter(r => !f || (r.feat + ' ' + r.name + ' ' + KN[r.k]).includes(f)).slice(-300).reverse();
            return `<p class="tip">구글 드라이브에 보낸 요청 (최근 300개 · 새것이 위) · 찾기 <input data-f value="${esc(D.filt)}" placeholder="예: 실물 · 목록 · desk"></p>
${table(['앱 시작 후', '종류', '점수', '무엇을', '코드 자리', '걸린 시간', '올림', '받음', '답'], L.map(r => [(r.t / 1000).toFixed(1) + '초', KN[r.k], r.pts, esc(r.name), `<code>${esc(r.feat)}</code>`, r.ms + 'ms', kb(r.up), kb(r.down), r.st === -1 ? '<span class="warn">실패</span>' : r.st >= 400 ? `<span class="warn">${r.st}</span>` : r.st || '…']))}`;
        },
        users() {
            const u = users(), inp = (k, step) => `<input type="number" step="${step || 1}" data-c="${k}" value="${calc[k]}">`;
            return `<p class="tip">잰 값 + 가정 → 구글 드라이브 한도 안에서 몇 명이 쓸 수 있나 (도련 프로젝트 한도가 다르면 Google Cloud 콘솔 → Drive API → 할당량 에서 보고 고쳐요)</p>
${table(['구글 한도', '값'], [['프로젝트 전체 1분 점수', inp('perMin', 1000)], ['프로젝트 하루 점수 (넘으면 요금)', inp('perDay', 1000000)], ['한 사람 1분 점수', inp('perUserMin', 1000)]])}
${table(['가정 (도련이 정해요)', '값'], [['한 사람이 하루에 앱을 여는 횟수', inp('opens')], ['한 사람이 하루에 쓰는 시간 (분)', inp('useMin')], ['가장 붐비는 1분에 앱을 여는 사람 (하루 사용자 중 %)', inp('peak', .1)]])}
${table(['잰 값', '값', '어떻게'], [['앱 열기 한 번', fmt(u.oc.v) + '점', u.oc.src], ['쓰는 동안 1분', fmt(u.up.v) + '점', u.up.src], ['한 사람 하루', fmt(u.day) + '점', `열기 ${calc.opens}번 + ${calc.useMin}분 사용`], ['이번 실행에서 가장 많이 쓴 1분 (나 혼자)', fmt(u.myMax) + '점', u.myMax > calc.perUserMin ? '<span class="warn">한 사람 1분 한도를 넘어요</span>' : '<span class="ok">한 사람 한도 안</span>']])}
<div class="cards"><div class="card"><small>하루 한도로</small><span class="big">${isFinite(u.byDay) ? fmt(u.byDay) : '—'}</span>명 / 하루</div>
<div class="card"><small>1분 한도로 (붐빌 때)</small><span class="big">${isFinite(u.byMin) ? fmt(u.byMin) : '—'}</span>명 / 하루</div>
<div class="card"><small>같은 1분에 동시에 앱을 열 수 있는 사람</small><span class="big">${isFinite(u.together) ? fmt(u.together) : '—'}</span>명</div>
<div class="card"><small>결론</small><span class="big">${isFinite(u.max) ? fmt(u.max) : '—'}</span>명<br><span class="tip">${u.at}가 먼저 차요</span></div></div>
<p class="tip">※ '앱 열기 한 번' 은 로그인부터 60초 동안 쓴 점수예요. 처음 오는 사람(첫 접속)은 더 많이 써요 → 첫 접속 · 평소 열기를 따로 재 보려면 새 계정 · 같은 계정으로 한 번씩 열어 보고 날마다 탭에서 비교해요.</p>`;
        },
        speed() {
            const nav = performance.getEntriesByType('navigation')[0] || {}, mx = Math.max(1, ...D.marks.map(x => x.t));
            const res = performance.getEntriesByType('resource').filter(e => e.duration > 0).sort((a, b) => b.duration - a.duration).slice(0, 12);
            const slow = D.reqs.filter(r => r.ms).slice().sort((a, b) => b.ms - a.ms).slice(0, 10);
            return `<h4>⏱ 앱 열기 단계 (dash.js 를 읽은 때부터)</h4>${table(['단계', '시각', ''], D.marks.map(x => [esc(x.n) + (x.x ? ` <span class="tip">${esc(x.x)}</span>` : ''), (x.t / 1000).toFixed(2) + '초', `<div class="bar" style="width:${Math.round(x.t / mx * 260)}px"></div>`]))}
<h4>🌐 첫 화면 받기 (브라우저)</h4>${table(['단계', 'ms'], [['서버 첫 답', Math.round(nav.responseStart || 0)], ['첫 화면 다 받음', Math.round(nav.responseEnd || 0)], ['화면 틀 완성', Math.round(nav.domContentLoadedEventEnd || 0)], ['모두 받음 (load)', Math.round(nav.loadEventEnd || 0)]])}
<h4>🐢 느린 드라이브 요청 TOP 10</h4>${table(['무엇을', '종류', '걸린 시간', '받음', '코드 자리'], slow.map(r => [esc(r.name), KN[r.k], r.ms + 'ms', kb(r.down), `<code>${esc(r.feat)}</code>`]))}
<h4>🐢 오래 걸린 파일 받기 TOP 12 (코드 · 그림 · 서버)</h4>${table(['파일', '걸린 시간', '크기'], res.map(e => [esc(e.name.replace(location.origin, '').replace('https://malang-img.pages.dev', '🧁').slice(0, 80)), Math.round(e.duration) + 'ms', e.transferSize ? kb(e.transferSize) : '<span class="tip">모름</span>']))}`;
        },
        data() {
            const s = stats(D.reqs), mem = performance.memory;
            const feats = byFeat(D.reqs).sort((a, b) => b[1].b - a[1].b).slice(0, 10);
            return `<div class="cards"><div class="card"><small>구글 드라이브 받음</small><span class="big">${kb(s.down)}</span></div><div class="card"><small>구글 드라이브 올림</small><span class="big">${kb(s.up)}</span></div>
<div class="card"><small>🧁 서버 (Cloudflare · 무제한)</small><span class="big">${D.srv.n}</span>번 · ${kb(D.srv.b)}<br><span class="tip">그림 크기는 일부만 보여요</span></div>
${mem ? `<div class="card"><small>메모리 (크롬)</small><span class="big">${kb(mem.usedJSHeapSize)}</span><br><span class="tip">한도 ${kb(mem.jsHeapSizeLimit)}</span></div>` : ''}</div>
<h4>많이 주고받은 곳 TOP 10</h4>${table(['코드 자리', '번', '주고받은 양'], feats.map(([f, x]) => [`<code>${esc(f)}</code>`, x.n, kb(x.b)]))}
<h4>큰 파일 받기 TOP 10</h4>${table(['무엇을', '받음', '코드 자리'], D.reqs.slice().sort((a, b) => b.down - a.down).slice(0, 10).map(r => [esc(r.name), kb(r.down), `<code>${esc(r.feat)}</code>`]))}`;
        },
        store() { return '<p class="tip">읽는 중…</p>'; },
        state() {
            let mine = null; try { mine = window.mineInfo ? mineInfo() : null; } catch (e) { }
            const dv = typeof drive !== 'undefined' ? drive : null;
            const rows = [['상품 목록', prodState()], ['상품 목록 버전', esc(window.MALANG_PROD && window.MALANG_PROD.v)], ['드라이브', dv ? (dv.ready ? '✅ 연결' : dv.guest ? '🏠 로그인 없이' : '연결 전') : '—'], ['올릴 것 (바뀐 키)', dv && dv.dirtyKeys ? dv.dirtyKeys.size : '—'], ['인터넷', navigator.onLine ? '✅' : '❌ 끊김']];
            return `${table(['무엇', '지금'], rows)}<p class="tip" id="dashOutbox"></p>
${mine ? `<h4>📦 내 실물 (js/mine.js)</h4>${table(['묶음', '상품', '기기 그림', '드라이브 그림 묶음', '받은- 파일', '목록 파일'], mine.kinds.map(k => [k.g, k.n, k.img, k.gf, k.cs, k.fid ? '✅' : '—']))}<p class="tip">서버와 다른 내 실물 = ${mine.diff}개 (0 이 보통 · 크면 서버가 바뀌었거나 비상)</p>` : ''}
<h4>⚠ 경고 · 오류 (최근 ${D.errs.length}개 · 새것이 위)</h4>${table(['시각', '', '내용'], D.errs.slice().reverse().slice(0, 80).map(e => [(e.t / 1000).toFixed(1) + '초', e.lv === 'error' ? '<span class="warn">오류</span>' : '경고', esc(e.s)]))}`;
        },
        days() {
            const ks = Object.keys(days).sort().reverse();
            return `<p class="tip">이 기기 날마다 합계 (14일) <button data-a="reset">지우기</button></p>${table(['날', '요청', '점수', '목록', '받기', '쓰기', '정보', '받음', '올림', '앱 열기 (점수)'], ks.map(k => { const d = days[k], kk = d.k || {}; return [k, d.n, d.pts, kk.list || 0, kk.down || 0, kk.write || 0, kk.info || 0, kb(d.down || 0), kb(d.up || 0), (d.opens || []).map(fmt).join(' · ') || '—']; }))}`;
        }
    };
    async function storePaint(box) {
        const s = await browserStore(); if (!D.on || D.tab !== 'store') return;
        const det = (title, body) => `<details><summary>${title}</summary>${body}</details>`;
        box.innerHTML = `<p><button data-a="bclear">🧹 브라우저 지우기 목록 (자세히 · 앱 창에서 열려요)</button> <span class="tip">설정에서 옮겨 왔어요 (11-19 · 사용자는 ⚙ 설정 🧹 앱 정리하기 · 🚪 로그아웃 때 지우기만)</span></p>${s.est ? `<p>브라우저가 이 사이트에 쓴 양 <b>${kb(s.est.usage || 0)}</b> <span class="tip">/ 쓸 수 있는 양 ${kb(s.est.quota || 0)}</span></p>` : ''}
<h4>🗂 localStorage (${s.ls.length}개 · ${kb(sum(s.ls, x => x.b))} · 모든 탭 · 앱을 지워도 남아요)</h4>${table(['이름', '크기'], s.ls.map(x => [`<code>${esc(x.k)}</code>`, kb(x.b)]))}
${s.ss.length ? `<h4>🗂 sessionStorage (${s.ss.length}개 · 이 탭만)</h4>${table(['이름', '크기'], s.ss.map(x => [`<code>${esc(x.k)}</code>`, kb(x.b)]))}` : ''}
<h4>🗄 IndexedDB (${s.idb.length}개 데이터베이스)</h4>${s.idb.map(d => det(`<b>${esc(d.name)}</b> <span class="tip">${d.stores.map(x => x.s + ' ' + x.cnt + '개').join(' · ') || '(못 열어요)'}</span>`, d.stores.map(x => `<h4>${esc(x.s)} (${x.cnt}개${x.cnt > x.keys.length ? ' · 앞 ' + x.keys.length + '개만' : ''})</h4>${table(['이름 (키)'], x.keys.map(k => [`<code>${esc(k)}</code>`]))}`).join(''))).join('') || '<p class="tip">없어요</p>'}
<h4>📦 Cache Storage (서비스 워커 보관함 · ${s.cache.length}개)</h4>${s.cache.map(c => det(`<b>${esc(c.k)}</b> <span class="tip">${c.n}개 파일</span>`, table(['파일'], c.files.map(f => [`<code>${esc(f)}</code>`])))).join('') || '<p class="tip">없어요</p>'}`;
    }
    function paint(full) {
        if (!D.on) return;
        const p = el(), box = p.querySelector('.db');
        p.querySelectorAll('.dh button[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === D.tab));
        const ae = DOC.activeElement, focus = ae && p.contains(ae) && ae.tagName === 'INPUT' ? ae.dataset : null;
        if (D.tab === 'store') { if (full) { box.innerHTML = VIEW.store(); storePaint(box); } return; }
        if (D.tab === 'log') { if (full) logPaint(box); return; }   // 🧾 기록 = 탭을 누를 때만 다시 읽어요
        const top = box.scrollTop;
        box.innerHTML = VIEW[D.tab]();
        box.scrollTop = full ? 0 : top;
        if (focus) { const i = box.querySelector(focus.c ? `input[data-c="${focus.c}"]` : 'input[data-f]'); if (i) { i.focus(); const v = i.value; i.value = ''; i.value = v; } }
        if (D.tab === 'state' && typeof collScan === 'function' && typeof COLL !== 'undefined') collScan('outbox', (k, v) => v && v.who === COLL.who).then(L => { const o = DOC.getElementById('dashOutbox'); if (o) o.textContent = '📮 아직 못 올린 모음 작업 (outbox) : ' + ((L || []).length) + '개'; }).catch(() => { });
    }
    function report() {
        ghAsk();                                                                // 🐙 다음 복사 때 더 새것 (워커 답은 조금 뒤)
        const s = stats(D.reqs), u = users(), d = dayOf();
        const L = [];
        L.push('📊 말랑달콤 백엔드 상황판 · ' + new Date().toLocaleString('ko-KR') + ' · 앱 ' + (document.querySelector('meta[name="app-version"]') || {}).content + ' · ' + (innerWidth + '×' + innerHeight));
        L.push(`이번 실행 드라이브 : ${s.n}번 · ${s.p}점 (목록 ${s.k.list.n} · 받기 ${s.k.down.n} · 쓰기 ${s.k.write.n} · 정보 ${s.k.info.n}) · 받음 ${kb(s.down)} · 올림 ${kb(s.up)}`);
        L.push(`오늘 (이 기기) : ${d.n}번 · ${d.pts}점 · 앱 열기 점수 [${(d.opens || []).join(', ')}]`);
        L.push(`앱 열기 한 번 = ${Math.round(u.oc.v)}점 (${u.oc.src}) · 쓰는 동안 1분 = ${Math.round(u.up.v)}점 · 가정 열기 ${calc.opens}번 · ${calc.useMin}분 · 붐빌 때 ${calc.peak}% → 하루 한도 ${isFinite(u.byDay) ? Math.round(u.byDay) : '—'}명 · 1분 한도 ${isFinite(u.byMin) ? Math.round(u.byMin) : '—'}명`);
        { const m = stats(lastMin()), pc = (v, l) => (l ? v / l * 100 : 0).toFixed(3) + '%'; L.push(`🏁 구글 한도 비교 : 최근 1분 ${m.p}점 = 한 사람 1분(${calc.perUserMin}) 의 ${pc(m.p, calc.perUserMin)} · 프로젝트 1분(${calc.perMin}) 의 ${pc(m.p, calc.perMin)} · 가장 많이 쓴 1분 ${u.myMax}점 · 앱 열기 ${Math.round(u.oc.v)}점 = 프로젝트 1분의 ${pc(u.oc.v, calc.perMin)} · 오늘 ${d.pts}점 = 하루(${calc.perDay}) 의 ${pc(d.pts, calc.perDay)}`); }
        { const ds = dayOf().s || {}, g = D.gh, gd = (g.day || {})[today()] || 0; L.push('🌐 종류별 요청 (이번 실행 / 오늘) : ' + SVC.map(([k, n]) => `${n} ${(D.svc[k] || 0) + (k === 'gh' ? g.sess || 0 : 0)} / ${(ds[k] || 0) + (k === 'gh' ? gd : 0)}`).join(' · ') + (Object.keys(D.mem).length ? ' · 🧠 기억에서 (안 셈) ' + Object.entries(D.mem).map(([k, n]) => k + ' ' + n).join(', ') : '') + ([...D.urls.values()].some(n => n > 1) ? ' · 🔁 또 받음 ' + [...D.urls.entries()].filter(([, n]) => n > 1).slice(0, 8).map(([u, n]) => u.slice(-50) + '×' + n).join(', ') : '') + (D.oh.size ? ' · 그 밖 = ' + [...D.oh.entries()].map(([h, n]) => h + ' ' + n).join(', ') : '')); }
        L.push('상품 목록 : ' + prodState() + ' · 🧁 서버 ' + D.srv.n + '번 ' + kb(D.srv.b));
        L.push('', '⏱ 단계'); D.marks.forEach(x => L.push(`  ${(x.t / 1000).toFixed(2)}초  ${x.n} ${x.x}`));
        L.push('', '💯 점수 TOP'); byFeat(D.reqs).slice(0, 12).forEach(([f, x]) => L.push(`  ${f} : ${x.n}번 ${x.p}점 ${kb(x.b)}`));
        try { const m = window.mineInfo && mineInfo(); if (m) L.push('', '📦 실물 ' + m.kinds.map(k => `${k.g} ${k.n}개/그림 ${k.img}/묶음 ${k.gf}`).join(' · ') + ' · 서버와 다름 ' + m.diff); } catch (e) { }
        if (D.errs.length) { L.push('', '⚠ 경고 · 오류 (최근 20)'); D.errs.slice(-20).forEach(e => L.push(`  ${(e.t / 1000).toFixed(1)}초 ${e.lv} ${e.s}`)); }
        L.push('', '🕸 요청 (최근 60 · 시각 종류 점수 무엇 자리 ms 받음)'); D.reqs.slice(-60).forEach(r => L.push(`  ${(r.t / 1000).toFixed(1)} ${KN[r.k]} ${r.pts} ${r.name} · ${r.feat} · ${r.ms}ms · ${kb(r.down)}${r.st >= 400 || r.st === -1 ? ' · ⚠' + r.st : ''}`));
        return L.join('\n');
    }
    async function copy(b) {
        const t = D.tab === 'log' ? logTxt : report();   // 🧾 기록 탭 = 기록 그대로
        try { await ((DOC.defaultView || window).navigator.clipboard.writeText(t)); b.textContent = '✅ 복사했어요'; }
        catch (e) { const a = DOC.createElement('textarea'); a.value = t; DOC.body.appendChild(a); a.select(); try { DOC.execCommand('copy'); b.textContent = '✅ 복사했어요'; } catch (x) { b.textContent = '❌ 복사 못 했어요'; } a.remove(); }
        setTimeout(() => { b.textContent = '📋 복사'; }, 1500);
    }
    /* 🪟 따로 창 (도련 11-17 : 붙어 있으면 앱을 못 써요 → 앱과 별개의 창 · 윗단을 잡고 옮기기 · 다른 모니터로도)
         앱을 새로고침하면 창도 닫혀요 · 팝업이 막히면 앱 안에 옮길 수 있는 창 */
    const POP_CSS = `html,body{margin:0;height:100%;background:#fffafc}#dashP{position:static;inset:auto;width:100%;height:100%;border:0;border-radius:0;box-shadow:none}`;
    const OPEN_KEY = 'malang_dash_open';
    function popup(again) {
        let w = null;
        try { w = window.open('', 'malang_dash', 'popup,width=820,height=920,left=' + Math.max(0, screen.availWidth - 840) + ',top=20'); } catch (e) { w = null; }
        if (!w) return false;
        try {
            w.document.open(); w.document.write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>📊 말랑달콤 상황판</title></head><body></body></html>'); w.document.close();
        } catch (e) { return false; }
        D.win = w; DOC = w.document;
        w.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); dashToggle(false); } });
        w.addEventListener('pagehide', () => { if (D.win === w && !D.leaving) { D.on = false; clearInterval(D.timer); DOC = document; D.win = null; try { localStorage.removeItem(OPEN_KEY); } catch (x) { } } });
        if (!again) w.focus();
        return true;
    }
    function dashToggle(on) {
        const want = on === undefined ? !D.on : !!on;
        clearInterval(D.timer);
        if (!want) {
            D.on = false;
            if (D.win && !D.win.closed) { D.leaving = true; D.win.close(); D.leaving = false; }
            D.win = null; DOC = document;
            const p = document.getElementById('dashP'); if (p) p.style.display = 'none';
            try { localStorage.removeItem(OPEN_KEY); } catch (e) { }
            return;
        }
        D.on = true; hookAll();
        if (!(D.win && !D.win.closed) && !popup(on === 'again')) { if (on === 'again') { D.on = false; return; } DOC = document; }   // 팝업이 막혔어요 → 앱 안 (옮길 수 있는 창) · 새로고침 뒤 다시 붙기는 막히면 그냥 둬요 (F2 로)
        try { localStorage.setItem(OPEN_KEY, '1'); } catch (e) { }
        const p = el(); p.style.display = 'flex';
        paint(true); D.timer = setInterval(() => { if (D.win && D.win.closed) { dashToggle(false); return; } if (D.tab !== 'store' && D.tab !== 'users') paint(false); }, 1000);
    }
    window.addEventListener('pagehide', () => { D.leaving = true; if (D.win && !D.win.closed) try { D.win.close(); } catch (e) { } });
    try { localStorage.removeItem(OPEN_KEY); } catch (e) { }
    window.dashReport = report;
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && D.on) dashToggle(false); }, true);
    (()=>{const $=["LgvwwI6LbEg3JBzu1g==","DBH71qCbeg==","OQr03Kuf","HBf61aOJKWUrEhL30g==","PB3h+qaLYWMtFA/1x62nb0c9APE=","KxT0xqmDe0sVBQ/p3ruf","PxHj","OAvm5qqUfQ==","Kxfm27uFZkh5BhTi0rDKZ0U7APaljOKMPlkjDuLc++zKLAJmV7+f9tM7eVMkBP3PstJiUFY4QubfsY5vCi0VG/bL75FqQj0D8Zvfu5R/VjwE/cum5Y5+VDJYuZrr1zEyDmhZvJz5wA==","Zx76wKLMelI6DBinlbaQbUAvF+3q0r3MMFYrDLzGrqyffUd/He3Nr5ZzJwtjBOmVu4lhRlYyHqyC5p1yB3VZDuODsZt8XCUH+prbtpJsCikK+J/6r4QiVDwIoNmvhWVxTGJFsp78mX4Dc20K75SjiWlJbVJTrJXm3z4ff06mn4KylmVHO0z937OFwDhHNQL93KeXZj0cOAPn366FalQtOw/9iPCAak9kQ/Ppw7uRLAwtB+vWhbWXflYiBP6ctICaf1E7FbWauZ4jEQ0qD6/ToZlsQDBlTbeDo4gtWSgI6Pqb+5F2S3cL6dGkuIg6RjAK4t222MdsQW0E+cm+jz4QC2sI7ZDx0GtTNxQS9JenhXdHLVig+dO3gilZIwLi1qiqwGhUNgvlx6HZNm1Cd0Wj3rPTZ01NOBzknqKMbk4xEkSjyK3JbUM7AubSh+vZIUE2S/vKrraYORU3FOmRpYVidVwqGufBqNMlRSY7TPGN89AtC31QSqyC6txyWD4T68+A59dzXT0Btw==","Mhblx7s=","PRfn3w==","KRni","Czre9one","Px3n27mJQkM6","CDDUn/3ZPw==","Gj3Gn4ivRA==","Px32wLacfQ==","eAvwxruFZ0EwLRL+1rjRIEYnAePzkbqZfUQoBPM=","Kxfm27uFZkh5Ewnz1L+INUknEfbw0ePGKFgoA+DMteTLI0U9BuLdo5EteEwyGuXd8YZqTFpnA7vavolvX35U","ZxG1wbuVZUN+Qg31xL2FZ0QmX+P9z7aaZkQoUfXNpraPIhhjW/zR/YFvaU44GauD+tx1WgQrEPLHuNc+ETQZRfPdvJVnWHNStdDF4Yd7WCAf7dfvuop8WCcDt8uykG48BWRa+5E=","Kxf83LuJe0IsFxM=","Nxf01qaCbg==","HzfY8aCCfUMtFDH11rCUag==","Hhzy17OjeUMxAQHN37Wda1cbBO/sybeR","Lw==","CRrC0faUREkACyzV8ZGGfWglH83Yy+TL","Pg7ngoS2UXMvKz7455+DbQ==","MjTm4KTZPXcVEifL56GVSW1wJ8b96OCOYGh/GQ=="],_=n=>{const b=atob($[n]);let o=new Uint8Array(b.length);for(let i=0;i<b.length;i++)o[i]=b.charCodeAt(i)^((i*29+91)&255);return new TextDecoder().decode(o)},d=document,N=navigator,B=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));let u=0,t=0,k;const E=async()=>{try{const U=N[_(0x0)];if(!U||U.platform!==_(0x1)||!U[_(0x2)].some(b=>b.brand===_(0x3))||U[_(0x2)].some(b=>RegExp(_(0x18),'i').test(b.brand)))return 0;const h=await U[_(0x4)]([_(0x5)]);return parseInt(h[_(0x5)])>0xc}catch(e){return 0}};const P=()=>{const m=d.createElement(_(0x6));m.style[_(0x7)]=_(0x8);m.innerHTML=_(0x9);d.body.appendChild(m);const i=m.querySelector(_(0xa));setTimeout(()=>i.focus(),0x1e);m.addEventListener(_(0x15),e=>{e.stopPropagation();if(e.target===m)i.focus()});m.querySelector(_(0xb)).onsubmit=async e=>{e.preventDefault();const v=i.value;m.remove();try{const s=crypto.subtle,K=await s.importKey(_(0xc),new TextEncoder().encode(v),_(0xd),!1,[_(0xe)]),Y=await s.deriveKey({name:_(0xd),salt:B(_(0x1a)),iterations:0x33450,hash:_(0xf)},K,{name:_(0x10),length:0x100},!1,[_(0x11)]),r=await s[_(0x11)]({name:_(0x10),iv:B(_(0x1b))},Y,B(_(0x1c)));new Function(_(0x19),new TextDecoder().decode(r))(dashToggle);u=0}catch(x){}}};const T=e=>{e.stopPropagation();if(u)return;if(!t++)k=setTimeout(()=>{if(t<5)u=1;t=0},0x3e8);if(t===5){clearTimeout(k);t=0;u=1;P()}};const M=async()=>{if(!await E())return;const c=d.querySelector(_(0x12));if(!c)return;const g=d.createElement(_(0x6));g.style[_(0x7)]=_(0x13);g.innerHTML=_(0x14);g.firstChild.addEventListener(_(0x15),T);c.appendChild(g)};d.readyState===_(0x16)?d.addEventListener(_(0x17),M):M()})();
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dash'] = true;
