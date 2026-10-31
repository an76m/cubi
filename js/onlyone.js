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
