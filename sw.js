/* 말랑달콤 다이어리 - sw.js (앱 설치용 서비스 워커)
   - 파일을 미리 저장(캐시)하지 않아요 → 깃허브에 올리면 설치한 앱도 바로 최신
   - 🖼️ 기본스티커 그림(Cloudflare /k/ · /t/ · 이름 = 그림 지문이라 내용이 절대 안 바뀌어요)만 이 기기에 오래 보관 → 두 번째부터 바로 떠요 (도련 10-25)
     · 앱이 새 기본스티커 목록을 받으면 목록에 없는 그림은 바로 지워요 (message 'kit-keep')
   - 인터넷이 끊겼을 때 페이지를 열면 하얀 화면 대신 안내 화면을 보여 줘요
   ※ 이 파일은 꼭 index.html 과 같은 폴더(맨 위)에 있어야 해요 */

const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>말랑달콤 다이어리</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#ffe6f0;font-family:sans-serif;color:#7a4a5a;text-align:center">
<div style="background:#fff;border:2px solid #ffb6c1;border-radius:20px;padding:28px 24px;max-width:300px">
<div style="font-size:42px">📔</div><h2 style="margin:10px 0;color:#ff6b81">인터넷 연결이 끊겼어요</h2>
<p style="line-height:1.6;margin:0 0 16px">일기는 구글 드라이브에 저장돼서<br>인터넷이 연결되어야 열 수 있어요.</p>
<button onclick="location.reload()" style="border:0;border-radius:12px;background:#ff8fab;color:#fff;font-size:16px;padding:10px 22px">다시 열기</button>
</div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
const KIT = 'https://malang-img.pages.dev/', KIT_CACHE = 'malang-kit-v1', KIT_RE = /\/(k|t)\/([0-9a-f]{16})\.(png|jpg|gif|webp|svg)$/;
async function kitGet(req) {
    const c = await caches.open(KIT_CACHE), url = req.url.split('?')[0];
    const hit = await c.match(url); if (hit) return hit;
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (res.ok) c.put(url, res.clone()).catch(() => {});
    return res;
}
self.addEventListener('message', e => {                       // 🖼️ 목록에 없는 그림은 바로 지워요
    const d = e.data; if (!d || d.type !== 'kit-keep' || !Array.isArray(d.keep)) return;
    const keep = new Set(d.keep);
    e.waitUntil(caches.open(KIT_CACHE).then(c => c.keys().then(ks => Promise.all(ks.map(r => { const m = KIT_RE.exec(new URL(r.url).pathname); return !m || !keep.has(m[2]) ? c.delete(r) : null; })))));
});
self.addEventListener('fetch', e => {
    const u = e.request.url;
    if (e.request.method === 'GET' && u.startsWith(KIT) && KIT_RE.test(new URL(u).pathname)) { e.respondWith(kitGet(e.request).catch(() => fetch(e.request))); return; }
    if (e.request.mode !== 'navigate') return;               // 페이지 열기만 살펴보고, 나머지는 브라우저가 그대로 처리
    e.respondWith(fetch(e.request).catch(() => new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
