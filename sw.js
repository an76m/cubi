/* 말랑달콤 다이어리 - sw.js (서비스 워커 · 도련 11-08 : 앱을 열 때만 새 버전 · 쓰는 동안엔 아무것도 안 바꿔요)
   ▶ 앱을 열 때 (첫 화면 열기 = navigate 요청 하나만 살펴봐요)
     1) version.txt (사이트 맨 위 · 숫자 한 줄 · 예 20261009-1238) 를 늘 새로 물어봐요 (몇십 바이트)
     2) 기기 보관함(코드 보관함 = 'malang-code-<버전>')이 그 버전과 같으면 → 깃허브에 묻지 않고 보관함에서 바로 열어요 (코드 126개를 다시 묻지 않아요)
        다르거나 없으면 → 깃허브에서 새 첫 화면을 받아 열고 · 조금 뒤 뒤에서 새 보관함을 만들어요 (다 받은 뒤에만 바꾸고 · 하나라도 못 받으면 안 바꿔요)
     3) 보관함에서 열었어도 뒤에서 첫 화면이 바뀌었는지 한 번 더 물어봐요 (version.txt 를 빼먹고 올려도 다음 열 때 새것 · 갇히지 않게)
   ▶ 쓰는 동안 : 아무것도 확인하지 않아요 · 보관함 안의 파일(?v= 붙은 코드 · 그림)만 꺼내 줘요 · 일기 · 드라이브 · 스티커 그림은 보관하지 않아요 (늘 원래대로)
   ▶ 🚨 비상구 : version.txt 에 'off' 라고 쓰면 모든 기기가 보관함을 지우고 예전처럼 깃허브에서 바로 열어요 · 설정의 '브라우저 저장 지우기'도 보관함 · 서비스 워커를 지워요
   ▶ 인터넷이 느려도 version.txt 답을 끝까지 기다려요 (도련 11-12 · 예전 2.5초에서 그만두면 폰에서 옛 버전이 열렸어요)
   ▶ 첫 화면(index.html)은 늘 '?t=지금' 을 붙여 받아요 (도련 11-12 : 깃허브 앞의 중간 서버가 첫 화면을 10분까지 들고 있어서 · 올린 직후에도 새것)
   ▶ 인터넷이 끊기면 : 보관함이 있으면 그것으로 · 없으면 안내 화면
   ※ 이 파일은 꼭 index.html 과 같은 폴더(맨 위)에 있어야 해요 */

const CODE = 'malang-code-';                                     // 보관함 이름 = CODE + 버전
const OK_KEY = '__ok__';                                        // 다 받은 보관함 표시
const VER_RE = /<meta name="app-version" content="([^"]+)"/;
const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>말랑달콤 다이어리</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#ffe6f0;font-family:sans-serif;color:#7a4a5a;text-align:center">
<div style="background:#fff;border:2px solid #ffb6c1;border-radius:20px;padding:28px 24px;max-width:300px">
<div style="font-size:42px">📔</div><h2 style="margin:10px 0;color:#ff6b81">인터넷 연결이 끊겼어요</h2>
<p style="line-height:1.6;margin:0 0 16px">일기는 구글 드라이브에 저장돼서<br>인터넷이 연결되어야 열 수 있어요.</p>
<button onclick="location.reload()" style="border:0;border-radius:12px;background:#ff8fab;color:#fff;font-size:16px;padding:10px 22px">다시 열기</button>
</div></body></html>`;
const HTML_H = { 'Content-Type': 'text/html; charset=utf-8' };
const BASE = new URL('./', self.location).href;                 // 사이트 맨 위
const INDEX_KEY = BASE + 'index.html';
const freshIndex = () => fetch(INDEX_KEY + '?t=' + Date.now(), { cache: 'no-store' });   // 첫 화면은 늘 깃허브 원본에서 (도련 11-12 : 기기 보관 · 중간 서버(CDN) 10분 보관을 모두 건너뛰어요)

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.delete('malang-kit-v1').then(() => self.clients.claim()).then(() => {   // 예전 그림 보관함(10-25) 치우기
    e.waitUntil(askVersion().then(v => v === 'off' ? offAll() : readyVersion().then(h => h ? null : freshIndex().then(x => x.ok ? x.text() : '').then(t => t && build(t)))).catch(() => {}));   // 처음 설치 = 다음에 열 때 바로 보관함에서 열리게 지금 만들어 둬요
})));

async function askVersion() {                                    // version.txt : 답이 올 때까지 기다려요 (느려도 · 도련 11-12 : 버전 확인은 꼭 한 번 성공) · 인터넷이 아예 끊겼을 때만 ''
    try { const r = await fetch(BASE + 'version.txt?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return ''; const t = (await r.text()).trim(); return t.length < 40 ? t : ''; } catch (e) { return ''; }
}
async function codeCaches() { return (await caches.keys()).filter(k => k.startsWith(CODE)); }
async function readyVersion() {                                  // 다 받은 보관함 중 가장 새 것의 버전
    let best = '';
    for (const k of await codeCaches()) { const c = await caches.open(k); if (await c.match(OK_KEY)) { const v = k.slice(CODE.length); if (!best || newer(v, best)) best = v; } }
    return best;
}
function newer(a, b) { const p = s => s.split('-').map(n => parseInt(n, 10) || 0); const [a1, a2] = p(a), [b1, b2] = p(b); return a1 !== b1 ? a1 > b1 : a2 > b2; }
async function cachedIndex(v) { const c = await caches.open(CODE + v); return c.match(INDEX_KEY); }
const isApp = u => { const url = new URL(u); return url.origin === self.location.origin && (url.href.split(/[?#]/)[0] === BASE || url.href.split(/[?#]/)[0] === INDEX_KEY); };

/* 📦 새 보관함 만들기 : 첫 화면 글에 적힌 ?v= 파일 모두 (같은 사이트만) · 다 받아야만 '다 받음' 표시 → 다른 버전 보관함 지우기 */
let building = '';
async function build(html) {
    const m = VER_RE.exec(html), v = m && m[1]; if (!v || building === v) return;
    const name = CODE + v, c0 = await caches.open(name);
    if (await c0.match(OK_KEY)) { await sweep(v); return; }
    building = v;
    try {
        await new Promise(r => setTimeout(r, 6000));               // 첫 화면이 파일을 다 받은 뒤에 (브라우저가 막 받은 것을 그대로 써서 두 번 받지 않게)
        const urls = [...new Set([...html.matchAll(/(?:src|href)="([^"]+\?v=[^"]+)"/g)].map(x => new URL(x[1].replace(/&amp;/g, '&'), BASE).href).filter(u => u.startsWith(self.location.origin)))];
        const got = [];
        for (let i = 0; i < urls.length; i += 6) {                   // 6개씩
            const part = await Promise.all(urls.slice(i, i + 6).map(async u => { let r = await fetch(u); if (!r.ok) r = await fetch(u, { cache: 'reload' }); if (!r.ok) throw new Error('miss ' + u); return [u, r]; }));   // 브라우저가 기억한 '없음'이면 깃허브에 다시
            got.push(...part);
        }
        const c = await caches.open(name);
        for (const [u, r] of got) await c.put(u, r);
        await c.put(INDEX_KEY, new Response(html, { headers: HTML_H }));
        await c.put(OK_KEY, new Response(v));                       // ✔ 다 받았어요 (이 표시가 있어야 이 보관함을 써요)
        await sweep(v);
    } catch (e) { await caches.delete(name); }                       // 하나라도 못 받으면 = 이 보관함은 버려요 (다음에 열 때 다시)
    finally { building = ''; }
}
async function sweep(keep) { for (const k of await codeCaches()) if (k !== CODE + keep) await caches.delete(k); }
async function offAll() { for (const k of await codeCaches()) await caches.delete(k); }

self.addEventListener('fetch', e => {
    const req = e.request; if (req.method !== 'GET') return;
    if (req.mode === 'navigate') { e.respondWith(openPage(e)); return; }
    const u = new URL(req.url);
    if (u.origin !== self.location.origin || !u.searchParams.has('v')) return;   // 보관함에 있을 수 있는 것 = 같은 사이트의 ?v= 파일만 (나머지는 브라우저가 그대로)
    e.respondWith(caches.match(req.url).then(r => r || fetch(req)));
});

async function openPage(e) {
    const req = e.request;
    if (!isApp(req.url)) return fetch(req).catch(() => new Response(OFFLINE_HTML, { headers: HTML_H }));   // 다른 쪽 (녹화 · 안내 페이지 …) = 예전 그대로
    const want = await askVersion();
    if (want === 'off') { await offAll(); return fetch(req, { cache: 'no-cache' }).catch(() => new Response(OFFLINE_HTML, { headers: HTML_H })); }   // 🚨 비상구
    const have = await readyVersion();
    if (have && (want === have || !want)) {                         // 같은 버전 (또는 version.txt 를 못 물었어요 = 인터넷이 끊김) → 보관함
        const r = await cachedIndex(have);
        if (r) {
            if (want) e.waitUntil(freshIndex().then(x => x.ok ? x.text() : '').then(t => { const m = VER_RE.exec(t); if (m && m[1] !== have) return build(t); }).catch(() => {}));   // 🛟 첫 화면이 바뀌었으면 다음 열 때 새것
            return r;
        }
    }
    try {                                                            // 새 버전 (또는 보관함 없음) = 깃허브에서 바로
        const r = await freshIndex();
        if (!r.ok) return r;
        const html = await r.text();
        e.waitUntil(build(html));
        return new Response(html, { status: r.status, headers: HTML_H });
    } catch (err) {
        const r = have && await cachedIndex(have);
        return r || new Response(OFFLINE_HTML, { headers: HTML_H });
    }
}
