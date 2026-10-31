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
