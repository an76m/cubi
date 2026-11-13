/* 말랑달콤 다이어리 - js/util.js
   🧰 공용 도구 (도련 10-30 : 같은 걸 파일마다 또 만들지 않기 · 새 기능도 여기 것을 써요)
   - htmlEsc(글) : 화면에 넣는 글을 안전하게 (& < > " ')
   - josa(낱말, 받침 있을 때, 없을 때) : 낱말 + 조사 (예 josa('바구니', '으로', '로') = '바구니로') · josaOf = 조사만
   - lsGet(키, 없을 때) · lsSet(키, 값) : 이 기기 저장(localStorage)에 JSON 으로 (막혀 있어도 멈추지 않아요)
   - 🕘 tzDay · tzNow · tzText (시계 한 곳 · DIARY_TZ) · waitMs · clampN · buzz · calmMotion · mkCanvas · tintCanvas · rrPath · loadImgP
   - ✨ rePop (톡 다시) · popFor (잠깐 보이기) · 💬 bubbleAt (말풍선) · ✋ tipPlace (든 도구 끝 = 마우스) · 🔊 scrubSound (떼는 소리) · 💬 hintPop (떼기 화면 안내 한 줄)
   ※ index.html 에서 맨 먼저 (features.js 다음) 읽어요 */
const htmlEsc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const josaOf = (w, a, b) => { w = String(w == null ? '' : w); const c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c < 11172 && c % 28 ? a : b; };
const josa = (w, a, b) => String(w == null ? '' : w) + josaOf(w, a, b);
function lsGet(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

/* 🕘 시계 한 곳 (도련 11-13 · 🌏 해외 서비스 때 여기 한 곳만 고치면 다 같이) : 다이어리의 '오늘 · 하루 한 번' 기준 시간대 = DIARY_TZ
   - 지금 = 🇰🇷 한국 (자정에 하루가 바뀌어요) · 선물 · 캡슐 · 공지 · 기간 상품 · 백업 하루 한 번 … 모두 이것만 써요
   - 다이어리 페이지 날짜(오늘 페이지 · 달력)는 기기 시계 그대로 (그 나라 날짜 · 해외도 맞아요)
   - tzNow() = 그 시간대의 지금 (getUTC… 로 읽어요) · tzDay() = 'YYYY-MM-DD' · tzMD() = 'MM-DD' · tzText(시각, 꼴) = 그 시간대 글자 */
const DIARY_TZ = { name: 'Asia/Seoul', h: 9 };
const tzNow = () => new Date(Date.now() + DIARY_TZ.h * 3600000);
const tzDay = () => tzNow().toISOString().slice(0, 10);
const tzMD = () => tzDay().slice(5);
const tzText = (t, o) => new Date(t).toLocaleString('ko-KR', Object.assign({}, o, { timeZone: DIARY_TZ.name }));
const ymd = (d, sep = '-') => { d = d || new Date(); const z = n => String(n).padStart(2, '0'); return d.getFullYear() + sep + z(d.getMonth() + 1) + sep + z(d.getDate()); };   // 📅 기기 날짜 글자 (다이어리 페이지 날짜 · 'YYYY-MM-DD' · sep 로 '.' '. ')

/* 🧰 자잘한 공용 도구 (도련 11-13 · 파일마다 같은 걸 만들지 않기 · 파일 안 옛 이름은 이것을 가리키기만 해요) */
const waitMs = ms => new Promise(r => setTimeout(r, ms));                      // ⏳ 기다리기
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));                        // 범위 안으로
function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }   // 📳 떨림 (안 되는 기기는 그냥 지나가요)
const calmMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;   // ✨ 움직임 줄이기 켰나요
function mkCanvas(w, h, up) { const c = document.createElement('canvas'), f = up ? Math.ceil : Math.round; c.width = Math.max(1, f(w)); c.height = Math.max(1, f(h)); return c; }   // 🖼 빈 그림판 (up = 올림)
function tintCanvas(src, fill) { const c = mkCanvas(src.width, src.height), d = c.getContext('2d'); d.drawImage(src, 0, 0); d.globalCompositeOperation = 'source-in'; d.fillStyle = fill; d.fillRect(0, 0, c.width, c.height); return c; }   // 🎨 그림 모양대로 한 색
function rrPath(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }   // ▢ 둥근 네모 길
const loadImgP = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });   // 🖼 그림 불러오기 (실패 = 거절)

/* 🔊 떼는 소리 하나 (도련 11-13 · 🏷️ 씰 · 🧩 조각봉투 · 🍡 떡메가 같이 써요) : 사각사각 이어지는 잡음 · 돌려주는 함수(v) = 크기 (0 = 조용)
   o = { hz: 소리 높이, q, hit: 굵은 알갱이 비율, lo: 나머지 알갱이 크기 } · 소리 설정을 따라요 (js/sound.js sndFx · sndOut) */
function scrubSound(o) {
    let g = null;
    return v => {
        if (!g && !v) return;
        const ac = typeof sndFx === 'function' ? sndFx() : null;
        if (!ac) { if (g) g.gain.value = 0; return; }
        if (!g) {
            const buf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < o.hit ? 1 : o.lo);
            const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
            const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = o.hz; bp.Q.value = o.q;
            g = ac.createGain(); g.gain.value = 0; src.connect(bp).connect(g).connect(sndOut()); src.start();
        }
        g.gain.setTargetAtTime(v, ac.currentTime, .03);
    };
}
/* ✋ 손에 든 도구 = 끝(tip)이 마우스 자리에 (도련 11-13 · 🪑 공중에 뜬 문구 · ✏️ 다이어리 위 문구 같이) : el 의 left · top 을 정해요
   tip = 그림 왼쪽 위에서 끝까지 [x, y] · deg = 그림이 돌아간 각도 (돌아간 만큼 끝 자리도 돌려서 맞춰요) */
function tipPlace(el, x, y, tip, deg) {
    const a = (deg || 0) * Math.PI / 180, t = tip || [0, 0], ox = t[0] * Math.cos(a) - t[1] * Math.sin(a), oy = t[0] * Math.sin(a) + t[1] * Math.cos(a);
    el.style.left = (x - ox) + 'px'; el.style.top = (y - oy) + 'px';
}
/* ✨ 톡 다시 (CSS 움직임을 처음부터 다시 · 깜박 · 톡 튀기) */
function rePop(el, cls = 'pop') { if (!el) return el; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); return el; }
/* ✨ 잠깐 보이기 (말풍선 · 알림이 같이 써요) : cls 를 다시 붙여 톡 튀게 → ms 뒤에 빼요 (다시 부르면 시간은 처음부터) */
function popFor(el, ms, cls = 'on') { rePop(el, cls); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove(cls), ms); return el; }
/* 💬 말풍선 하나 (도련 11-13 · 🪡 핀셋 · 🕳️ 펀칭기 · 🪑 책상 문구가 같이 써요 · 모양은 각자 클래스 그대로)
   id = 말풍선 자리 (없으면 만들어요) · cls = 모양 · (x, y) = 가리킬 곳 · 화면 밖으로 안 나가게
   o = { min: 반너비 최소 (말 길이를 재요) · half: 반너비 고정 · dy: 위로 띄우기 · top: 맨 위 한계 (함수면 말풍선을 받아요) · ms: 떠 있는 시간 · noTop: 높이는 그대로 } */
function bubbleAt(id, cls, t, x, y, o) {
    o = o || {}; let b = document.getElementById(id);
    if (!b) { b = document.createElement('div'); b.id = id; b.className = cls; document.body.appendChild(b); }
    b.textContent = t;
    const hw = o.half != null ? o.half : Math.max(o.min || 0, b.offsetWidth / 2 + 8), top = typeof o.top === 'function' ? o.top(b) : (o.top || 0);
    b.style.left = Math.max(hw, Math.min(innerWidth - hw, x)) + 'px'; if (!o.noTop) b.style.top = Math.max(top, y - (o.dy || 0)) + 'px';
    return popFor(b, o.ms || 1600);
}
/* 💬 안내 한 줄 톡 (떼기 화면들 · 같은 글이면 그대로) : e = 글 자리 · S = 그 화면 상태 (S.hint 에 지금 글) */
function hintPop(e, S, h) { if (!e || S.hint === h) return; S.hint = h; e.innerHTML = h; rePop(e); }

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

/* 🧹 1161~1162 임시 멈춤 기록(js/dbg.js · 지움)이 이 기기에 남긴 두 칸을 지워요 (도련 11-13 · 그때 앱을 연 모든 기기 · 몇 주 뒤 이 줄도 지워도 돼요) */
try { localStorage.removeItem('malang_dbg'); localStorage.removeItem('malang_dbg_prev'); } catch (e) {}
