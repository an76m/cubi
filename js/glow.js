/* 말랑달콤 다이어리 - js/glow.js
   ✨ 빛 번짐 (도련 10-28 · 애니메이션 촬영의 '디퓨전' 느낌) : 밝은 곳이 살짝 번져서 애니 안에 있는 느낌 · 앱 전체에 걸려요
   - 화면 맨 위에 터치가 안 되는 막 하나 : 뒤 화면을 흐리게(blur) 한 것을 screen 으로 살짝 겹쳐요 (backdrop-filter)
   - ⚙ 설정 → 🔊 소리·글꼴 → ✨ 빛 번짐 (0 = 끄기 ~ 100) · 기기마다 따로 (폰 · 컴퓨터 성능 · 화면이 달라서) localStorage 'malang_glow'
   - 0 이면 막을 아예 빼요 (느려질 일 없음) */

        const GLOW_LOCAL = 'malang_glow', GLOW_DEF = 0;
        function glowGet() { let n = NaN; try { n = Number(localStorage.getItem(GLOW_LOCAL)); } catch (e) {} return isFinite(n) && n >= 0 ? Math.min(100, Math.round(n)) : GLOW_DEF; }
        function glowApply(n) {
            n = n == null ? glowGet() : n;
            let el = document.getElementById('animeGlow');
            if (!n) { if (el) el.remove(); return; }
            if (!el) { el = document.createElement('div'); el.id = 'animeGlow'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
            const f = `blur(${(3 + n * 0.06).toFixed(1)}px) brightness(1.05) saturate(1.25)`;
            el.style.backdropFilter = f; el.style.webkitBackdropFilter = f;
            el.style.opacity = (n / 100 * 0.6).toFixed(3);
        }
        function glowSet(n, save) {
            n = Math.max(0, Math.min(100, Math.round(Number(n)) || 0));
            glowApply(n);
            const b = document.getElementById('glowVal'); if (b) b.textContent = n ? n : '끄기';
            if (save) try { localStorage.setItem(GLOW_LOCAL, String(n)); } catch (e) {}
        }
        function glowRender() {
            const r = document.getElementById('glowRange'), n = glowGet(); if (r) r.value = n;
            const b = document.getElementById('glowVal'); if (b) b.textContent = n ? n : '끄기';
        }
        if (document.body) glowApply(); else document.addEventListener('DOMContentLoaded', () => glowApply());

        window.glowGet = glowGet; window.glowSet = glowSet; window.glowRender = glowRender; window.glowApply = glowApply;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['glow'] = true;
