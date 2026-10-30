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
