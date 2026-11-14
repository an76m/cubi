/* 말랑달콤 다이어리 - js/onlyone.js
   🔒 한 기기에서 다이어리는 하나만 (도련 10-31)
   - 두 창(탭 · 앱 창)에서 같이 저장하다 한쪽 내용이 덮이지 않게 : 먼저 연 창만 다이어리를 써요
   - 나중에 연 창 = 다이어리를 시작하지 않고 '이미 다른 창에서 열려 있어요' 안내만 (로그인 · 불러오기 · 저장 모두 안 해요)
   - 먼저 창을 닫으면 = 기다리던 창에서 그대로 다이어리가 시작돼요
   - 브라우저의 잠금(navigator.locks · 창을 닫으면 저절로 풀려요)을 써요 · 잠금을 모르는 옛 브라우저 = 그냥 시작
   - 설치한 앱 아이콘을 다시 누르면 새 창 대신 열린 창으로 (manifest.json launch_handler · 크롬 · 엣지) */

        const ONE_LOCK = 'malang-diary-one';
        let oneStart = null, oneGo = null;                                       // oneGo = 앱 시작 함수 (app.js window.onload 가 넘겨줘요)
        const oneHold = () => new Promise(() => {});                            // 창이 열려 있는 동안 잠금을 쥐고 있어요
        function oneRun() { if (oneStart && oneGo) { const f = oneGo; oneGo = null; f(); } }
        function oneBlock() {
            if (document.getElementById('oneBlock')) return;
            const el = document.createElement('div'); el.id = 'oneBlock'; el.className = 'sending-overlay one-block';
            el.innerHTML = `<div class="sending-card" role="alert">
                <div class="sending-title">📔 다이어리가 이미 열려 있어요</div>
                <div class="sending-msg">다른 창(탭)에서 말랑달콤 다이어리를 쓰고 있어요.<br>그 창에서 이어서 써 주세요.<br><span style="font-size:12px;color:#999;">그 창을 닫으면 여기서 바로 열려요.</span></div>
            </div>`;
            document.body.appendChild(el);
        }
        function oneWait() {                                                     // 먼저 창이 닫힐 때까지 기다렸다가 여기서 시작
            navigator.locks.request(ONE_LOCK, () => {
                const el = document.getElementById('oneBlock'); if (el) el.remove();
                oneStart = true; oneRun();
                return oneHold();
            });
        }
        if (navigator.locks && navigator.locks.request) {
            navigator.locks.request(ONE_LOCK, { ifAvailable: true }, lock => {
                if (!lock) {
                    oneStart = false;
                    if (document.body) oneBlock(); else document.addEventListener('DOMContentLoaded', oneBlock);
                    oneWait();
                    return;
                }
                oneStart = true; oneRun();
                return oneHold();
            }).catch(() => { oneStart = true; oneRun(); });
        } else oneStart = true;
        /* app.js 의 시작 = 여기를 거쳐요 : 이 창이 다이어리를 맡았을 때만 시작 */
        window.oneReady = go => { oneGo = go; oneRun(); };

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['onlyone'] = true;

/* 🖥️ PC 설치 앱 = 처음 열 때 창 안쪽 1920×1080 (도련 11-14 · 책상 새 기준과 같게 · 예전 1700×990)
   - 창 바깥(제목 막대 · 테두리)만큼 더해서 안쪽이 딱 1920×1080 · 화면이 더 작으면 화면만큼 · 가운데로
   - 이 기기에서 처음 한 번만 (malang_win_size2 · 예전 1700×990 으로 맞춘 사람도 한 번 더) · 그 뒤는 사용자가 바꾼 크기 그대로
   - 설치한 앱 창(standalone)에서만 · 브라우저 탭 · 폰 · 패드는 그대로 */
(function () {
    const K = 'malang_win_size2';
    try {
        if (localStorage.getItem(K)) return;
        const app = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches;
        const pc = matchMedia('(pointer: fine)').matches && !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
        if (!app || !pc) return;
        localStorage.setItem(K, '1');
        const fit = () => {
            const ew = Math.max(0, outerWidth - innerWidth), eh = Math.max(0, outerHeight - innerHeight);   // 창 테두리 · 제목 막대
            const W = Math.min(1920 + ew, screen.availWidth), H = Math.min(1080 + eh, screen.availHeight);
            window.resizeTo(W, H);
            window.moveTo((screen.availLeft || 0) + Math.max(0, Math.round((screen.availWidth - W) / 2)), (screen.availTop || 0) + Math.max(0, Math.round((screen.availHeight - H) / 2)));
        };
        if (document.readyState === 'complete') fit(); else addEventListener('load', fit, { once: true });   // 창이 다 열린 뒤에 (테두리 크기를 알 수 있게)
    } catch (e) {}
})();
