/* 말랑달콤 다이어리 - js/util.js
   🧰 공용 도구 (도련 10-30 : 같은 걸 파일마다 또 만들지 않기 · 새 기능도 여기 것을 써요)
   - htmlEsc(글) : 화면에 넣는 글을 안전하게 (& < > " ')
   - josa(낱말, 받침 있을 때, 없을 때) : 낱말 + 조사 (예 josa('바구니', '으로', '로') = '바구니로') · josaOf = 조사만
   - lsGet(키, 없을 때) · lsSet(키, 값) : 이 기기 저장(localStorage)에 JSON 으로 (막혀 있어도 멈추지 않아요)
   ※ index.html 에서 맨 먼저 (features.js 다음) 읽어요 */
const htmlEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const josaOf = (w, a, b) => { w = String(w == null ? '' : w); const c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 ? a : b; };
const josa = (w, a, b) => String(w == null ? '' : w) + josaOf(w, a, b);
function lsGet(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

/* 🖼 장소 그림 = 화면을 꽉 채워요 (도련 10-31 · 기본상품 샵처럼 · 남는 곳 · 흐린 배경 없이) : 넘치는 쪽은 잘라요
   focus = [왼, 오른, 위, 아래] 꼭 보여야 하는 곳 (그림 px) → 잘리는 자리를 그쪽으로 밀어요 · 화면이 focus 보다 좁으면 focus 가운데
   돌려주는 것 { s: 배율, x, y: 그림 왼쪽 위의 화면 자리 } */
function coverFit(W, H, focus) {
    const s = Math.max(innerWidth / W, innerHeight / H), vw = innerWidth / s, vh = innerHeight / s;
    const pick = (len, v, a, b) => { let o = (len - v) / 2; if (a != null) { if (b - a <= v) o = Math.min(Math.max(o, b - v), a); else o = (a + b - v) / 2; } return Math.max(0, Math.min(len - v, o)); };
    const f = focus || [];
    return { s, x: -pick(W, vw, f[0], f[1]) * s, y: -pick(H, vh, f[2], f[3]) * s };
}
/* 🏘️ 장소로 들어가는 연출 하나 (도련 11-10 · 땜질 말고 한 곳 · 예전엔 장소마다 같은 코드를 따로 가졌어요)
   길 → 그 자리로 빨려 들어가며 빛 (📅 달력 · 🎁 캡슐기계 · 💌 우체통 · 📸 포토부스) · 문 → 문 안으로 (🔮 타로카페 · 🕹️ 오락실) · 방은 뒤에서 미리 열어 둬요
   o = { id, cls (바깥 클래스 · 첫 이름 + '-in' = 안쪽 · 연출 = 각 css), step ('go' 길 · 'enter' 문), wait (그림을 보여 주는 ms), snd (소리 함수 이름),
         sign: { cls, text } (문 위 글자), land / port = { img, W, H, focus: [x0, x1, y0, y1] (늘 보일 곳), at: [x, y] (들어갈 곳), sign: [x, y, 글자 크기] } }
   💻 📲 = land (가로 그림) · 📱 = port (세로 그림 · js/uimode.js UI.pick) · ✨ 움직임 줄이기면 안 해요 */
const placeBusy = {};
function placeGo(o) {
    if (placeBusy[o.id] || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let d = document.getElementById(o.id);
    if (!d) {
        d = document.createElement('div'); d.id = o.id; d.className = o.cls;
        d.innerHTML = `<div class="${o.cls.split(' ')[0]}-in"><img alt="" draggable="false">${o.sign ? `<div class="${o.sign.cls}">${o.sign.text}</div>` : ''}</div>`;
        document.body.appendChild(d);
    }
    placeBusy[o.id] = true;
    const v = UI.pick(o.land, o.port), im = d.querySelector('img'), inn = d.firstElementChild, step = o.step || 'go';
    if (im.getAttribute('src') !== v.img) im.setAttribute('src', v.img);
    const { s, x, y } = coverFit(v.W, v.H, v.focus);
    Object.assign(im.style, { width: v.W * s + 'px', height: v.H * s + 'px', left: x + 'px', top: y + 'px' });
    const ox = x + v.at[0] * s, oy = y + v.at[1] * s;
    inn.style.transformOrigin = `${ox}px ${oy}px`; inn.style.setProperty('--lx', ox + 'px'); inn.style.setProperty('--ly', oy + 'px');   // 빛도 그 자리에서 번져요
    if (o.sign && v.sign) Object.assign(inn.lastElementChild.style, { left: x + v.sign[0] * s + 'px', top: y + v.sign[1] * s + 'px', fontSize: v.sign[2] * s + 'px' });
    d.classList.remove(step, 'leave'); d.classList.add('on');
    const go = () => {
        if (o.snd && window[o.snd]) window[o.snd]();
        d.classList.add(step);
        setTimeout(() => { d.classList.add('leave'); setTimeout(() => { d.classList.remove('on', step, 'leave'); placeBusy[o.id] = false; }, 400); }, 1700);
    };
    const start = () => setTimeout(go, o.wait || 750);
    if (im.complete) start(); else im.addEventListener('load', start, { once: true });
}
window.placeGo = placeGo;
/* 🏘️ 장소 틀 공용 (도련 11-10 · 📅 달력 · 🔮 타로 · 💌 우체통 · 🕹️ 오락실 · 📸 포토부스 · 🎁 캡슐기계) : 장소 파일은 placeAdd 로 자기 값만 알려 줘요
   - 들어갈 때 placeIn('cal-on', 'tarot-on') = 이동 · 카페 창을 닫고 body 표시 (cal-on = 장소에 있어요 · 이동 창 · 책상 버튼 숨김) · 나올 때 placeOut(같은 것)
   - 화면 크기가 바뀌면 지금 장소의 fit · Esc = 장소가 먼저 쓰지 않으면 🚪 내 방(다이어리)으로 (예전엔 장소마다 따로 가졌어요)
   p = { on: () => 지금 이 장소, fit, close, esc: () => true = Esc 를 장소가 썼어요 (안쪽 창 닫기 · 그 장소는 Esc 안 받기) } */
const PLACES = [];
function placeAdd(p) { PLACES.push(p); }
function placeIn(...cls) { if (typeof closeModal === 'function') { closeModal('serviceModal'); closeModal('moveModal'); } if (cls.length) document.body.classList.add(...cls); }
function placeOut(...cls) { document.body.classList.remove(...cls); }
addEventListener('resize', () => PLACES.forEach(p => { if (p.on()) p.fit(); }));
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || document.querySelector('.modal[style*="flex"]')) return;
    const p = PLACES.find(x => x.on()); if (!p || (p.esc && p.esc())) return;
    if (window.deskGoRoom) deskGoRoom(); else p.close();
});
window.placeAdd = placeAdd; window.placeIn = placeIn; window.placeOut = placeOut;
