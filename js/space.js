/* 말랑달콤 다이어리 - js/space.js
   🏠 공간 (도련 11-12) : 문구 기능은 하나 · 어느 공간에서든 똑같이 일해요 · 저장은 공간이 정해요
   - 진짜 다이어리 = 저장하는 공간 (기본 · 지금까지와 똑같아요)
   - 🏪 샵 사용해보기 연습장 = 저장하지 않는 공간 (js/gdtry.js · 창을 닫으면 다 사라져요)
   - 문구 코드는 '어디에 · 저장할지'를 묻기만 해요 : spPage() 쓰는 종이 · spHost() 문구를 놓는 판 · spBook() 책 · spOpen() 펼쳤는지 · spRect() 보이는 종이 · spAdd() 붙이기 · spSave() 저장 · spCup() 펜꽂이에 꽂을 것
   ※ 저장 함수(saveData)는 그대로예요 · 저장하는 공간이면 예전처럼 부르고, 아니면 부르지 않아요 */
(function () {
    const REAL = {
        page: () => document.getElementById('canvasArea'),
        rect: p => window.dyVisRect ? dyVisRect(p.getBoundingClientRect()) : p.getBoundingClientRect(),
        add: src => addImage(src),
        host: () => document.getElementById('innerPage'),                       // 문구를 놓아 두는 판 (종이 + 둘레)
        book: () => document.getElementById('diaryBook'),                      // 책 (크기 단위 cqw)
        open: () => isCoverOpen,                                                // 펼쳐져 있는지
        keep: true
    };
    let now = REAL;
    window.spUse = s => { now = s || REAL; };                                     // 공간 바꾸기 (없으면 진짜 다이어리)
    window.spKeep = () => now.keep;                                               // 저장하는 공간인지
    window.spPage = () => now.page();
    window.spHost = () => now.host();
    window.spBook = () => now.book();
    window.spOpen = () => now.open();
    window.spRect = () => now.rect(now.page());
    window.spAdd = src => now.add(src);
    window.spSave = full => { if (now.keep && typeof saveData === 'function') saveData(full); };
    window.spCup = () => now.cup || null;                                         // 연습장 = 써 볼 것만 · 진짜 = 내 펜꽂이 (null)
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['space'] = true;
