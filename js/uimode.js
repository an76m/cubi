/* 말랑달콤 다이어리 - js/uimode.js
   🧭 화면 모드 한 곳 (도련 11-10 : 땜질 말고 한 곳에서) · 다른 파일보다 먼저 읽어요
   앱은 두 갈래 : 🪑 책상 모드 (💻 📲 · html.desk-on) · ▤ 하단 메뉴 모드 (💻 📲 📱 · html:not(.desk-on))
   - 기능(함수)은 두 모드가 같아요 · 다른 건 값 두 가지뿐
       1. 📖 페이지 보기 = ⚙ 설정에서 기기마다 (📱 폰 · 📲 패드 · 💻 컴퓨터 · js/skins.js dvCfg · UI.dev())
       2. 🏘️ 장소 그림 (이동 → 달력 · 타로 · 우체통 · 오락실 · 캡슐 · 포토부스 · 샵 · 문) = 💻 📲 가로 · 📱 세로 (UI.tall() · UI.pick(가로, 세로))
   - 창 동작 (✕ · 창 밖 톡 = 닫기 · 서랍 머리) = 모드로만 나눠요 (UI.desk() · UI.menu() · css html.desk-on / html:not(.desk-on))
   - 📱 폰만의 것 = 크기 · 손가락 조작뿐 (UI.phone() · css html.is-phone · 톡 = 꺼내기)
   ⚠ 새 코드는 classList.contains('desk-on') · matchMedia · innerWidth 로 따로 재지 말고 여기 것을 써요 */
(() => {
    const H = document.documentElement;
    const phone = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;   // 📱 손가락 + 짧은 변 600 미만 (아이패드 = 768 이상)
    H.classList.toggle('is-phone', phone);
    const UI = {
        phone: () => phone,                                                   // 📱 이 기기가 폰
        dev: () => phone ? 'phone' : navigator.maxTouchPoints > 0 && matchMedia('(any-pointer: coarse)').matches ? 'pad' : 'pc',   // 📖 페이지 보기 설정 칸 (폰 · 패드 · 컴퓨터)
        wide: () => Math.min(innerWidth, innerHeight) >= 600,                 // 🪑 책상을 펼 수 있는 화면 (책상 모드를 고를 수 있어요)
        desk: () => H.classList.contains('desk-on'),                          // 🪑 책상 모드 (js/drive.js deskSync 가 켜고 꺼요)
        menu: () => !H.classList.contains('desk-on'),                         // ▤ 하단 메뉴 모드
        tall: () => phone,                                                    // 🏘️ 장소 그림 = 📱 세로 · 💻 📲 가로
        pick: (land, port) => phone ? port : land                             // 🏘️ 가로 값 · 세로 값 중 이 기기 것
    };
    window.UI = UI;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['uimode'] = true;
