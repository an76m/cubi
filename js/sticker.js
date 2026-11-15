/* 말랑달콤 다이어리 - js/sticker.js
   🏷️ 스티커 엔진 (도련 11-16 · 책 엔진처럼 · 10년 쓸 기초) : 🪡 핀셋으로 떼어 쓰는 스티커가 같이 쓰는 것 = 여기 하나 · 스티커 종류는 '다른 점'만
   - 스티커 종류 : 🏷️ 씰스티커 (js/stickerpeel.js · 하얀 종이에서 떼기) · 🧩 조각스티커 (js/piecebag.js · 봉투 뜯기 · 뒷종이 벗기기) · 📄 모조지스티커 (js/papermaker.js · ✂️ 오리기 · 칼집 · 글씨 · 구김)
   - 엔진이 하는 일 (S-1)
       🪡 핀셋 = stkTwz(x, y) : 핀셋을 들었으면 true · 아니면 그 자리에 '🪡 핀셋을 사용해 주세요' 말풍선 + 핀셋 자리 깜박 (js/skins.js twzSay)
       🔊 떼는 소리 = stkNoise(v) : 사각사각 하나 (0 = 조용 · js/util.js scrubSound)
       📄 붙이기 = stkStick(o) : 페이지에 그림을 놓고 (자리 · 크기 · 돌기) → 저장 (공간이 정해요 · js/space.js spSave) → 내 종이에서 그 칸을 지워요 (o.own)
           o = { src 그림, cx · cy 화면 가운데, w · h 화면 크기(px), deg 돌기, clamp (가운데를 페이지 안으로), orig (붙은 뒤 원본 크기로 · js/elements.js elOrig),
                 mark(el) 놓기 전에 표시 · after(el) 놓은 뒤 · own(el) 칸 지우기 } → 붙은 요소 (못 붙이면 null · addImage 가 늘 하나를 붙여요)
           stkUse(id, slot, el) = 🎒 그 칸은 영원히 사라져요 (js/own.js ownUse · 요소에 data-own = '종이:칸')
       stkDeg(rad, lim) = 돌기 각도 (도 · 소수 한 자리 · lim = 이만큼까지만 기울어요)
   - 다음 단계 : 종이 화면 (띄우기 · 옮기기 · 크기) → 핀셋 손길 (누르기 · 끌기 · 떼어 내기) → 떼어지는 그림 → 문서
   ※ util.js · space.js · elements.js 다음 · 스티커 종류 파일보다 먼저 읽어요 */
const stkNoise = scrubSound({ hz: 3200, q: .7, hit: .3, lo: .3 });            // 🔊 🏷️ 씰 · 🧩 조각 '찌익' (예전엔 파일마다 같은 소리를 따로)
function stkTwz(x, y) {
    if (!window.gdTwz || gdTwz()) return true;
    if (window.twzSay) twzSay(x, y);
    return false;
}
const stkDeg = (rad, lim) => { if (lim != null) rad = Math.max(-lim, Math.min(lim, rad)); return Math.round(rad * 180 / Math.PI * 10) / 10; };
function stkUse(id, slot, el) {
    if (!window.ownUse) return;
    if (el) el.dataset.own = id + ':' + slot;
    ownUse(id, slot, el).catch(e => console.warn('스티커 칸을 아직 못 지웠어요 (다시 해요) :', e));
}
function stkStick(o) {
    const pg = spPage(); if (!pg) return null;
    const P = pageK(pg); let cx = o.cx, cy = o.cy;
    if (o.clamp) [cx, cy] = pageIn(P.r, cx, cy);
    if (!addImage(o.src)) return null;
    const el = pg.querySelector('.element-box:last-child');
    if (el) {
        if (o.mark) o.mark(el);
        elPlace(el, P, cx, cy, o.w / P.k, o.h / P.k, o.deg || 0);
        if (o.orig && window.elOrig) elOrig(el);                                // 🖼️ 원본 크기로 (가운데는 그대로)
        if (o.after) o.after(el, pg);
    }
    spSave(false);
    if (el && o.own) o.own(el);
    return el;
}

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['sticker'] = true;
