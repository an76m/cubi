/* 말랑달콤 다이어리 - js/sound.js
   🔊 연출 소리 : 카페 연출의 효과음을 한곳에서 켜고 꺼요 (모든 소리는 파일 없이 브라우저가 만들어요)
   - 쓰는 곳 : 포춘카드 · 꿈해몽 · 토정비결 · 심리테스트 · 이름 궁합 · 익명 편지함 · 랜덤박스 · 오락실 · 🏪 기본상품 샵 문 종소리 (sndShopBell · js/shopscene.js)
   - 연출 화면 첫 화면의 🔊 버튼 = 설정의 '✨ 연출 소리' 스위치 (하나를 끄면 모두 꺼져요)
   - 소리 크기 : 연출 소리의 크기
   - 설정 저장 : 내 드라이브 설정.json 'diary_sound' (이 기기에도 같이 기억 → 로그인 전에도 바로 적용)
   - 아이폰 · 아이패드 무음 모드에서도 들리게 (audioSession 'playback' · 예전 기기는 무음 소리 한 번 재생)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (소리만 나지 않아요) */

        const SND_KEY = 'diary_sound', SND_LOCAL = 'malang_sound';
        const SND_DEF = { fx: true, vol: 70 };
        const snd = { ac: null, out: null, unlocked: false };

        /* ---------- 설정 ---------- */
        function sndPref() {
            const o = prefGet(SND_KEY, SND_LOCAL);                               // 💾 js/drive.js
            return Object.assign({}, SND_DEF, o || {});
        }
        function sndSet(k, v) {
            const o = sndPref(); o[k] = v;
            prefSet(SND_KEY, SND_LOCAL, { fx: o.fx, vol: o.vol });
            if (k === 'vol' && snd.out) snd.out.gain.value = sndGain(o);
            if (k === 'fx' && !v) document.dispatchEvent(new Event('snd-fx-off'));
            sndMark();
        }
        const sndGain = o => Math.pow((o.vol || 0) / 100, 1.6) * 1.4;
        function sndOn() { const o = sndPref(); return !!o.fx && o.vol > 0; }

        /* ---------- 소리 길 ---------- */
        function sndCtx() {
            try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
            if (!snd.ac) {
                try { snd.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
                snd.out = snd.ac.createGain(); snd.out.gain.value = sndGain(sndPref()); snd.out.connect(snd.ac.destination);
            }
            if (snd.ac.state !== 'running') { try { const p = snd.ac.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
            return snd.ac;
        }
        const sndOut = () => snd.out;
        /* 연출 소리를 쓰는 곳은 이걸로 소리 길을 받아요 (꺼져 있으면 null → 소리 없음) */
        function sndFx() { return sndOn() ? sndCtx() : null; }
        /* 화면을 처음 누를 때 소리 깨우기 (아이폰 · 아이패드 무음 모드 대비) */
        function sndUnlock() {
            const ac = sndCtx(); if (!ac || (snd.unlocked && ac.state === 'running')) return;   // 아직 안 깨어났으면 다음에 누를 때 또 깨워요
            snd.unlocked = true;
            try {
                const n = 1600, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
                const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
                w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
                v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
                for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
                const el = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
                el.setAttribute('playsinline', ''); const pr = el.play(); if (pr && pr.catch) pr.catch(() => { snd.unlocked = false; });
            } catch (e) { snd.unlocked = false; }
            try { const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); } catch (e) {}
        }

        ['pointerdown', 'pointerup', 'touchend'].forEach(t => document.addEventListener(t, sndUnlock, true));   // ✏️ 애플펜슬은 누를 때가 아니라 뗄 때 소리를 깨울 수 있어요
        /* 켜졌을 때 · 크기를 바꿀 때 들려주는 반짝 소리 */
        function sndChime() {
            const ac = sndFx(); if (!ac) return;
            [1568, 2093].forEach((f, i) => {
                const t = ac.currentTime + i * .05, o = ac.createOscillator(), g = ac.createGain();
                o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .006); g.gain.exponentialRampToValueAtTime(0.0001, t + .25);
                o.connect(g).connect(snd.out); o.start(t); o.stop(t + .27);
            });
        }

        /* 🔔 기본상품 샵 문 종소리 '딸랑~' (도련 10-27 · 시안 1번 · 작은 놋쇠 종 : 크게 한 번 + 작게 두 번 · 비정수 배음 · 높은 배음은 빨리 · 짧은 방 울림) */
        function sndShopBell() {
            const ac = sndFx(); if (!ac) return;                                 // ✨ 연출 소리를 끄면 조용히
            const t0 = ac.currentTime + .02, bus = ac.createGain(); bus.gain.value = .1; bus.connect(snd.out);
            const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 4.5; lg.gain.value = .006; lfo.connect(lg).connect(bus.gain); lfo.start(t0); lfo.stop(t0 + 1.7);   // 살짝 흔들리는 맥놀이
            [[.023, .22], [.041, .16], [.067, .1], [.093, .07]].forEach(([d, g]) => { const dl = ac.createDelay(.2), gg = ac.createGain(); dl.delayTime.value = d; gg.gain.value = g; bus.connect(dl).connect(gg).connect(snd.out); });
            const P = [[1, 1, 1.6], [2.32, .55, 2.6], [3.97, .38, 4.2], [5.86, .22, 6.5], [8.1, .12, 9]], DET = [.0009, -.0012, .0005, -.0007, .0011];
            [[0, 1, 1, 1], [.11, .55, 1.03, .9], [.24, .3, .98, .8]].forEach(([at, a, df, br]) => {
                const t = t0 + at;
                P.forEach(([r, pa, k], i) => {
                    const o = ac.createOscillator(), g = ac.createGain();
                    o.frequency.value = 2100 * df * r * (1 + DET[i]);
                    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a * pa * (i ? br : 1), t + .002); g.gain.setTargetAtTime(0, t + .002, 1 / k);
                    o.connect(g).connect(bus); o.start(t); o.stop(t + 1.6);
                });
                const len = Math.floor(ac.sampleRate * .012), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0), ns = ac.createBufferSource(), ng = ac.createGain();
                for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * Math.exp(-j / ac.sampleRate * 900) * .25;   // 딱 부딪히는 소리
                ns.buffer = buf; ng.gain.value = a; ns.connect(ng).connect(bus); ns.start(t);
            });
        }
        /* 🔮 타로카페 문 '스르릉~' (도련 10-31 · 신비한 풍경 : 높은 방울 다섯이 차례로 · 길게 남는 울림 · ✨ 연출 소리를 끄면 조용히) */
        function sndTarotDoor() {
            const ac = sndFx(); if (!ac) return;
            const t0 = ac.currentTime + .03, bus = ac.createGain(); bus.gain.value = .09; bus.connect(snd.out);
            const dl = ac.createDelay(1), fb = ac.createGain(); dl.delayTime.value = .27; fb.gain.value = .35; bus.connect(dl).connect(fb).connect(dl); fb.connect(snd.out);   // 길게 남는 울림
            [1760, 1318.5, 1568, 2093, 2637].forEach((f, i) => {
                const t = t0 + i * .13, o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain();
                o.frequency.value = f; o2.frequency.value = f * 2.76; g2.gain.value = .18;
                g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9 - i * .1, t + .004); g.gain.setTargetAtTime(0, t + .004, .5);
                o.connect(g); o2.connect(g2).connect(g); g.connect(bus); o.start(t); o2.start(t); o.stop(t + 2.4); o2.stop(t + 2.4);
            });
        }
        /* 🛍️ 상품을 담았어요 '띠링~' (도련 10-29 · 소리 시안 C 의 방울 두 번만) : 1760 → 2349 Hz · 배음 2 · 3 배 · 0.18초쯤 스르르 */
        function sndBag() {
            const ac = sndFx(); if (!ac) return;
            const t0 = ac.currentTime + .02;
            [[0, 1760, .6], [.1, 2349, .45]].forEach(([at, f, a]) => {
                const t = t0 + at;
                [[1, 1], [2, .3], [3, .12]].forEach(([m, pa]) => {
                    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f * m;
                    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.16 * a * pa, t + .005); g.gain.setTargetAtTime(0.0001, t + .005, .175);
                    o.connect(g).connect(snd.out); o.start(t); o.stop(t + .9);
                });
            });
        }
        window.sndBag = sndBag;
        window.sndShopBell = sndShopBell; window.sndTarotDoor = sndTarotDoor; window.sndCtx = sndCtx; window.sndOut = () => snd.out; window.sndOn = sndOn;   // 🪑 소품 소리 · 알람 (js/deskcustom.js)

        /* ---------- 🔊 연출 소리 켜고 끄기 (연출 화면의 버튼 · 설정 공용) ---------- */
        function sndToggleFx() {
            const on = !sndOn();
            if (on && sndPref().vol <= 0) sndSet('vol', 50);
            sndSet('fx', on);
            if (on) sndChime();
        }
        const sndFxBtn = cls => `<button type="button" class="snd-fx ${cls || ''}" onclick="sndToggleFx()" aria-label="연출 소리 켜고 끄기">${sndOn() ? '🔊' : '🔇'}</button>`;
        function sndMark() {
            const on = sndOn();
            document.querySelectorAll('.snd-fx').forEach(b => {
                b.classList.toggle('off', !on);
                b.textContent = b.classList.contains('snd-fx-text') ? (on ? '🔊 소리 켜짐' : '🔇 소리 꺼짐') : (on ? '🔊' : '🔇');
            });
            sndRenderSettings();
        }

        /* ---------- ⚙️ 설정 화면 ---------- */
        function sndRenderSettings() {
            const box = document.getElementById('sndSwitches'); if (!box) return;
            const o = sndPref();
            box.innerHTML = `<label class="show-row"><span><b>✨ 연출 소리</b><small>운세 · 테스트 · 궁합 · 편지 · 문방구 캡슐기계 · 뿅뿅오락실 · 가게 종소리</small></span><input type="checkbox" class="show-sw" ${o.fx ? 'checked' : ''} onchange="sndSet('fx', this.checked); if (this.checked) sndChime()"></label>`
                + `<div class="snd-vol"><span>🔈</span><input type="range" min="0" max="100" step="5" value="${o.vol}" oninput="sndVol(this.value)" onchange="sndVol(this.value, true)" aria-label="연출 소리 크기"><span>🔊</span><b id="sndVolNum">${o.vol}</b></div>`;
        }
        function sndVol(v, done) {
            v = +v; const o = sndPref(); o.vol = v;
            if (snd.out) snd.out.gain.value = sndGain(o);
            const n = document.getElementById('sndVolNum'); if (n) n.textContent = v;
            if (done) { sndSet('vol', v); sndChime(); }
        }
