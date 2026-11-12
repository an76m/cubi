/* 말랑달콤 다이어리 - js/labeler.js
   🏷️ 라벨 스티커 기계 (도련 11-08 · 예전 🔤 글씨 스티커를 기계로)
   - 책상 위 라벨기 소품(상품 '기능' label · js/deskcustom.js dcTap) 톡 → 기계가 책상에서 떠올라 화면 가운데 크게 (다이어리가 떠오르듯) · 닫으면 제자리로 내려가요
     ✂️ 스티커 만들기의 🔤 글씨 스티커(js/craft.js)도 여기로 (책상이 없으면 아래에서 쏙 올라와요)
   - 화면(LCD) = 쓰는 글씨 · 글꼴 · 크기 · 색 · 테두리 · 한/영 · 글자 수 / 기능 키 = 글꼴 · 크기 · 색 · 테두리 · 전체 지움 / 자판 = 한글(두벌식 · 글자가 모여요) · 영어 · 숫자 기호
     💻 키보드로 쳐도 돼요 (숨은 입력칸 · 한글 입력기 그대로) · 📱 📲 = 화면 자판만 (기기 키보드가 안 올라와요)
   - 🖨 인쇄 = 오른쪽 손잡이 틈에서 라벨이 찌이익 나와요 → 📌 다이어리에 붙이기 · 💾 씰스티커로 저장 · ✏️ 다시 쓰기
   - 그림 · 저장 = 예전 글씨 스티커와 같아요 (js/stickermaker.js smTextApi · 🏷️ 씰스티커 · 하얀 테두리 · 🗄️ 서랍 내가만든) */
    (function () {
        const MAXN = 12;
        const SIZES = [[0.75, '작게'], [1, '보통'], [1.3, '크게']];
        const L = { on: false, text: '', cur: null, mode: 'ko', shift: false, fi: 0, ci: 0, si: 1, border: true, src: null, busy: false, out: '' };
        const lq = id => document.getElementById(id);
        const quiet = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
        const api = () => window.smTextApi;
        const fonts = () => { const F = api() ? api().fonts() : []; return F.length ? F : [["'Jua', sans-serif", '주아']]; };
        const colors = () => api() ? api().colors : ['#ff6b8b'];

        /* ---------- ㄱ+ㅏ = 가 : 두벌식 한글 모으기 ---------- */
        const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
        const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const VC = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
        const JC = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
        const split = (T, x) => { const k = Object.keys(T).find(k => T[k] === x); return k ? [...k] : null; };
        const syl = c => !c ? '' : c.c && c.v ? String.fromCharCode(0xAC00 + (CHO.indexOf(c.c) * 21 + JUNG.indexOf(c.v)) * 28 + JONG.indexOf(c.j || '')) : (c.c || c.v || '');
        const full = () => L.text + syl(L.cur);
        const count = s => Array.from(s).length;
        function commit() { L.text += syl(L.cur); L.cur = null; }
        function koType(ch) {
            const c = L.cur, isV = JUNG.includes(ch);
            if (!isV) {
                if (!c) L.cur = { c: ch };
                else if (!c.v || !c.c) { commit(); L.cur = { c: ch }; }
                else if (!c.j) { if (JONG.includes(ch)) c.j = ch; else { commit(); L.cur = { c: ch }; } }
                else if (JC[c.j + ch]) c.j = JC[c.j + ch];
                else { commit(); L.cur = { c: ch }; }
            } else {
                if (!c) L.cur = { v: ch };
                else if (c.c && !c.v) c.v = ch;
                else if (!c.j) { if (VC[c.v + ch]) c.v = VC[c.v + ch]; else { commit(); L.cur = { v: ch }; } }
                else { const sp = split(JC, c.j), move = sp ? sp[1] : c.j; c.j = sp ? sp[0] : ''; commit(); L.cur = { c: move, v: ch }; }   // 받침이 다음 글자로 (갑 + ㅏ = 가바)
            }
        }
        function back() {
            const c = L.cur;
            if (c) {
                if (c.j) { const sp = split(JC, c.j); c.j = sp ? sp[0] : ''; }
                else if (c.v) { const sp = split(VC, c.v); if (sp) c.v = sp[0]; else { delete c.v; if (!c.c) L.cur = null; } }
                else L.cur = null;
            } else L.text = Array.from(L.text).slice(0, -1).join('');
        }
        function put(ch) {                                                      // 한 글자 넣기 (12자 넘으면 그대로 · 화면이 깜빡)
            const keep = [L.text, L.cur && Object.assign({}, L.cur)];
            if (L.mode === 'ko' && (CHO.includes(ch) || JUNG.includes(ch))) koType(ch); else { commit(); L.text += ch; }
            if (count(full()) > MAXN) { L.text = keep[0]; L.cur = keep[1]; blink(); }
        }

        /* ---------- 자판 ---------- */
        const KO = [['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'], ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', '⌫'], ['⇧', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '!', '?']];
        const KO_SH = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
        const EN = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '⌫'], ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '!', '?']];
        const NUM = [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], ['♥', '★', '♪', '~', '^', '.', ',', '-', '+', '⌫'], ['(', ')', ':', ';', '#', '&', '@', '*', '/', '=']];
        function kbPaint() {
            const rows = L.mode === 'en' ? EN : L.mode === 'num' ? NUM : KO;
            const lab = k => L.mode === 'ko' && L.shift && KO_SH[k] ? KO_SH[k] : L.mode === 'en' && L.shift && /^[a-z]$/.test(k) ? k.toUpperCase() : k;
            const cls = k => k === '⌫' ? ' lbm-k-del' : k === '⇧' ? ' lbm-k-sh' + (L.shift ? ' on' : '') : '';
            lq('lbmKb').innerHTML = rows.map(r => `<div class="lbm-row">${r.map(k => `<button type="button" class="lbm-k${cls(k)}" data-k="${k}">${lab(k)}</button>`).join('')}</div>`).join('')
                + `<div class="lbm-row lbm-row4"><button type="button" class="lbm-k lbm-k-fn" data-k="mode">${L.mode === 'ko' ? '한/<b>영</b>' : '<b>한</b>/영'}</button><button type="button" class="lbm-k lbm-k-fn" data-k="num">${L.mode === 'num' ? '가' : '123'}</button><button type="button" class="lbm-k lbm-k-sp" data-k=" ">띄어쓰기</button><button type="button" class="lbm-k lbm-k-print" data-k="print">인쇄 <i>🖨</i></button></div>`;
        }
        function key(k) {
            if (L.busy) return;
            if (k === '⌫') back();
            else if (k === '⇧') { L.shift = !L.shift; kbPaint(); }
            else if (k === 'mode') { commit(); L.mode = L.mode === 'ko' ? 'en' : 'ko'; L.shift = false; kbPaint(); }
            else if (k === 'num') { commit(); L.mode = L.mode === 'num' ? 'ko' : 'num'; L.shift = false; kbPaint(); }
            else if (k === 'print') { print(); return; }
            else if (k === 'font') { L.fi = (L.fi + 1) % fonts().length; flash(fonts()[L.fi][1]); }
            else if (k === 'size') { L.si = (L.si + 1) % SIZES.length; flash('크기 ' + SIZES[L.si][1]); }
            else if (k === 'color') { L.ci = (L.ci + 1) % colors().length; }
            else if (k === 'border') { L.border = !L.border; flash(L.border ? '하얀 테두리 ○' : '하얀 테두리 ✕'); }
            else if (k === 'clear') { L.text = ''; L.cur = null; }
            else {
                let ch = k; if (L.mode === 'ko' && L.shift && KO_SH[k]) ch = KO_SH[k]; if (L.mode === 'en' && L.shift && /^[a-z]$/.test(k)) ch = k.toUpperCase();
                put(ch); if (L.shift) { L.shift = false; kbPaint(); }                // ⇧ = 한 글자만
            }
            tick(); lcd();
        }
        /* 🔊 키 소리 (✨ 연출 소리를 끄면 조용히) */
        function snd(f, d, type, vol) { try { if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(vol || .035, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(sndOut()); o.start(t); o.stop(t + d + .02); } catch (e) {} }
        const tick = () => snd(1800 + Math.random() * 300, .03, 'square', .025);

        /* ---------- 📟 화면 ---------- */
        let flashT = 0, flashTx = '';
        function flash(t) { flashTx = t; clearTimeout(flashT); flashT = setTimeout(() => { flashTx = ''; lcd(); }, 1100); }
        function blink() { const d = lq('lbmLcd'); if (!d) return; d.classList.remove('blink'); void d.offsetWidth; d.classList.add('blink'); snd(220, .12, 'square', .04); }
        function lcd() {
            if (!lq('lbmLcd')) return; const F = fonts()[L.fi], C = colors()[L.ci];
            lq('lbmF').textContent = F[1]; lq('lbmS').textContent = SIZES[L.si][1]; lq('lbmC').style.background = C; lq('lbmB').classList.toggle('off', !L.border);
            lq('lbmM').textContent = L.mode === 'ko' ? '한' : L.mode === 'en' ? (L.shift ? 'A' : 'a') : '12';
            const t = lq('lbmTxt'), s = full();
            t.style.fontFamily = F[0];
            t.innerHTML = flashTx ? `<em>${htmlEsc(flashTx)}</em>` : s ? `${htmlEsc(L.text)}<u>${htmlEsc(syl(L.cur))}</u><i class="lbm-cur"></i>` : '<span class="lbm-ph">글씨를 써 보세요</span><i class="lbm-cur"></i>';
            t.style.fontSize = ''; const box = t.parentNode; let fs = parseFloat(getComputedStyle(t).fontSize);   // 화면에 들어가게 줄여요
            while (t.scrollWidth > box.clientWidth * .96 && fs > 8) { fs -= 1; t.style.fontSize = fs + 'px'; }
            lq('lbmN').textContent = `${count(s)}/${MAXN}`;
            const inp = lq('lbmIn'); if (inp && inp.value !== s && document.activeElement !== inp) inp.value = s;
            if (inp && document.activeElement === inp && !inp.dataset.typing) inp.value = s;
            if (document.fonts && document.fonts.load) document.fonts.load(`32px ${F[0]}`).then(() => { if (L.on) lcdFit(); }).catch(() => {});
        }
        function lcdFit() { const t = lq('lbmTxt'); if (!t) return; t.style.fontSize = ''; const box = t.parentNode; let fs = parseFloat(getComputedStyle(t).fontSize); while (t.scrollWidth > box.clientWidth * .96 && fs > 8) { fs -= 1; t.style.fontSize = fs + 'px'; } }

        /* ---------- 화면 만들기 ---------- */
        function build() {
            let el = lq('lbmRoom'); if (el) return el;
            el = document.createElement('div'); el.id = 'lbmRoom'; el.className = 'lbm-room';
            el.innerHTML = `<div class="lbm-back" id="lbmBack"></div>
                <img class="lbm-fly" id="lbmFly" alt="" draggable="false">
                <div class="lbm-wrap" id="lbmWrap">
                  <div class="lbm-mach" id="lbmMach">
                    <div class="lbm-handle"><i class="lbm-slit"></i></div>
                    <div class="lbm-out" id="lbmOut"><div class="lbm-tape"><img id="lbmOutImg" alt="" draggable="false"></div></div>
                    <div class="lbm-body">
                      <div class="lbm-head">
                        <div class="lbm-brand"><b>라벨기</b><small>글씨 스티커 만들기</small></div>
                        <div class="lbm-lcd" id="lbmLcd">
                          <div class="lbm-st"><span id="lbmF"></span><span id="lbmS"></span><i id="lbmC"></i><span id="lbmB">테두리</span><span id="lbmM"></span></div>
                          <div class="lbm-line"><div class="lbm-txt" id="lbmTxt"></div></div>
                          <div class="lbm-n" id="lbmN"></div>
                        </div>
                        <div class="lbm-pw"><button type="button" class="lbm-k lbm-k-off" id="lbmOff" aria-label="닫기">⏻<small>끄기</small></button></div>
                      </div>
                      <div class="lbm-fn">
                        <button type="button" class="lbm-k lbm-k-f" data-k="font">글꼴</button><button type="button" class="lbm-k lbm-k-f" data-k="size">크기</button><button type="button" class="lbm-k lbm-k-f" data-k="color">색</button><button type="button" class="lbm-k lbm-k-f" data-k="border">테두리</button><button type="button" class="lbm-k lbm-k-f lbm-k-clr" data-k="clear">전체 지움</button>
                      </div>
                      <div class="lbm-kb" id="lbmKb"></div>
                    </div>
                  </div>
                  <div class="lbm-acts" id="lbmActs" hidden>
                    <button type="button" class="lbm-a pk" data-a="text">📌 다이어리에 붙이기</button>
                    <button type="button" class="lbm-a" data-a="keep">💾 씰스티커로 저장</button>
                    <button type="button" class="lbm-a sub" data-a="again">✏️ 다시 쓰기</button>
                  </div>
                </div>
                <input id="lbmIn" class="lbm-in" maxlength="${MAXN}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="라벨 글씨">`;
            document.body.appendChild(el);
            const press = e => { const b = e.target.closest('.lbm-k[data-k]'); if (!b) return; e.preventDefault(); b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 110); key(b.dataset.k); };   // 누르자마자 (💻 입력칸 초점이 그대로)
            el.querySelector('.lbm-body').addEventListener('pointerdown', press);
            lq('lbmOff').onclick = () => close();
            lq('lbmBack').onclick = () => { if (!L.busy) close(); };
            lq('lbmActs').addEventListener('click', e => { const b = e.target.closest('.lbm-a'); if (b) act(b.dataset.a); });
            const inp = lq('lbmIn');                                                 // 💻 키보드로 쳐도 돼요 (한글 입력기 그대로)
            inp.addEventListener('compositionstart', () => { inp.dataset.typing = 1; });
            inp.addEventListener('compositionend', () => { delete inp.dataset.typing; });
            inp.addEventListener('input', () => { if (L.busy) return; L.text = Array.from(inp.value).slice(0, MAXN).join(''); L.cur = null; lcd(); });
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!e.isComposing) print(); } else if (e.key === 'Escape') { e.preventDefault(); close(); } });
            addEventListener('resize', () => { if (L.on) fit(); });
            return el;
        }
        /* 📐 기계 크기 (--u = 기계 너비의 1%) */
        function fit() {
            const W = Math.min(innerWidth * .94, 720, (innerHeight - 90) / .98), m = lq('lbmMach');   // 몸통 ≈ .7 + 위 라벨 자리 .22 + 단추
            m.style.setProperty('--u', W / 100 + 'px'); m.style.width = W + 'px';
            return m.getBoundingClientRect();
        }
        const FLY = 560, SWAP = 160;
        /* 그림이 진짜 기계와 꼭 겹치는 자리 : 책상 그림(디자인.png) = 이 기계를 그대로 찍은 것 (기계 둘레 3u · 위 손잡이 3.4u 까지 · 도련 11-08)
           → 그림 테두리를 기계 + 둘레에 맞춰 (가로세로 · 가운데 · 기울기 없이 반듯하게) */
        function toMach(S, R) {
            const m = lq('lbmMach'), w = m.offsetWidth, h = m.offsetHeight, u = w / 100;   // 기울기 전 크기 (getBoundingClientRect 는 기울어 조금 커요)
            const cx = R.left + R.width / 2, cy = R.top + R.height / 2 - 1.7 * u;
            return `translate(${cx - (S.left + S.width / 2)}px, ${cy - (S.top + S.height / 2)}px) scale(${(w + 6 * u) / S.width}, ${(h + 6.4 * u) / S.height})`;
        }
        /* 🛫 진짜 기계가 그대로 날아요 (도련 11-11 : 책상 그림 → 진짜 기계로 바꿔 끼면 예전 영어 글씨가 잠깐 보였어요 · 이제 그림을 띄우지 않아요)
           책상 그림 칸(S)에 진짜 기계를 줄여 겹쳐 두고 → 제자리로 (translate · scale 만 · 기울기는 그대로) */
        function machFrom(S, R, flipX) {
            const m = lq('lbmMach'), w = m.offsetWidth, h = m.offsetHeight, u = w / 100, sx = S.width / (w + 6 * u), sy = S.height / (h + 6.4 * u);
            return { t: `${S.left + S.width / 2 - (R.left + R.width / 2)}px ${S.top + S.height / 2 + 1.7 * u * sy - (R.top + R.height / 2)}px`, s: `${flipX ? -sx : sx} ${sy}` };
        }
        const machAt = (m, st, ms) => { m.style.transition = ms ? `translate ${ms}ms cubic-bezier(.22, .9, .3, 1), scale ${ms}ms cubic-bezier(.22, .9, .3, 1)` : 'none'; m.style.translate = st ? st.t : ''; m.style.scale = st ? st.s : ''; };
        function showNow(w) { w.style.transition = 'none'; w.classList.remove('hide'); void w.offsetWidth; w.style.transition = ''; }
        function hideNow(w) { w.style.transition = 'none'; w.classList.add('hide'); void w.offsetWidth; w.style.transition = ''; }
        const deskImg = el => el && (el.querySelector(':scope > img') || el);
        /* 🛫 책상에서 떠올라 가운데로 (다이어리처럼) · 책상이 없으면 아래에서 쏙 */
        function openLabeler(el) {
            if (L.on) return;
            if (!api()) { if (window.comingSoon) comingSoon('🏷️ 라벨 스티커 기계'); return; }
            if (typeof closeModal === 'function') ['stickerToolModal', 'stickerSrcModal', 'moveModal'].forEach(id => { const m = lq(id); if (m && m.style.display === 'flex') closeModal(id); });
            const room = build(); L.on = true; L.src = el || null; L.busy = false; L.out = '';
            if (!fonts().some((f, i) => i === L.fi)) L.fi = 0;
            const ji = fonts().findIndex(f => /Jua/.test(f[0])); if (!L.opened && ji >= 0) L.fi = ji; L.opened = true;
            room.classList.add('show'); document.body.classList.add('lbm-on');
            lq('lbmActs').hidden = true; lq('lbmOut').className = 'lbm-out';
            kbPaint(); const R = fit(); lcd();
            const img = deskImg(el), fly = lq('lbmFly'), wrap = lq('lbmWrap');
            const S = img && img.getBoundingClientRect ? img.getBoundingClientRect() : null;
            if (S && S.width > 4 && !quiet()) {
                const m = lq('lbmMach'); fly.style.opacity = 0;
                el.style.visibility = 'hidden'; room.classList.remove('lit');
                machAt(m, machFrom(S, R, el.classList.contains('dk-fl')), 0); showNow(wrap); void m.offsetWidth;   // 🛫 진짜 기계를 책상 자리에 작게
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    room.classList.add('lit'); machAt(m, null, FLY);
                    setTimeout(() => { m.style.transition = ''; if (!L.on) return; wrap.classList.add('land'); setTimeout(() => wrap.classList.remove('land'), 420); }, FLY);
                }));
            } else { fly.style.opacity = 0; wrap.classList.remove('hide'); room.classList.add('lit', 'pop'); setTimeout(() => room.classList.remove('pop'), 500); }
            if (matchMedia('(pointer: fine)').matches) setTimeout(() => { const i = lq('lbmIn'); if (L.on && i) i.focus({ preventScroll: true }); }, 400);   // 💻 키보드로도 (📱 📲 은 기기 키보드가 안 올라오게 안 해요)
        }
        /* 🛬 닫기 = 책상 제자리로 내려가요 */
        function close(after) {
            if (!L.on) return; L.on = false; L.busy = false;
            const room = lq('lbmRoom'), fly = lq('lbmFly'), wrap = lq('lbmWrap'), el = L.src, img = deskImg(el);
            const inp = lq('lbmIn'); if (inp) inp.blur();
            const done = () => { room.classList.remove('show', 'lit', 'bye'); document.body.classList.remove('lbm-on'); if (el) el.style.visibility = ''; wrap.classList.remove('hide'); if (after) after(); };
            const S0 = img && el.isConnected ? img.getBoundingClientRect() : null;
            if (S0 && S0.width > 4 && !quiet()) {
                const m = lq('lbmMach'), R = m.getBoundingClientRect();
                lq('lbmActs').hidden = true; room.classList.remove('lit');
                machAt(m, machFrom(S0, R, el.classList.contains('dk-fl')), 500);       // 🛬 진짜 기계가 그대로 책상 자리로 (도련 11-11)
                setTimeout(() => { done(); machAt(m, null, 0); }, 520);
            } else { room.classList.add('bye'); setTimeout(done, quiet() ? 0 : 300); }
        }

        /* ---------- 🖨 인쇄 = 오른쪽 틈에서 라벨이 찌이익 ---------- */
        const wait = ms => new Promise(r => setTimeout(r, ms));
        function zzz(ms) {                                                      // 찌이익 (연출 소리를 끄면 조용히)
            try {
                if (!(window.sndOn && sndOn()) || !window.sndCtx) return; const ac = sndCtx(), t0 = ac.currentTime, len = ms / 1000;
                const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * len), ac.sampleRate), d = buf.getChannelData(0);
                for (let i = 0; i < d.length; i++) { const t = i / ac.sampleRate; d[i] = (Math.random() * 2 - 1) * (.5 + .5 * Math.sign(Math.sin(t * 2 * Math.PI * 30))); }
                const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = .9;
                g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.06, t0 + .04); g.gain.setValueAtTime(.06, t0 + len - .08); g.gain.linearRampToValueAtTime(0, t0 + len);
                s.connect(f).connect(g).connect(sndOut()); s.start(t0); s.stop(t0 + len);
            } catch (e) {}
        }
        function sync() { api().set({ text: full().trim(), font: fonts()[L.fi][0], color: colors()[L.ci], tsz: SIZES[L.si][0], border: L.border }); }
        async function print() {
            if (L.busy || !L.on) return;
            if (!full().trim()) { flash('글씨를 먼저 써 주세요'); lcd(); blink(); return; }
            commit(); L.busy = true; lcd(); flash('인쇄 중 ···'); lcd();
            const F = fonts()[L.fi][0]; if (document.fonts && document.fonts.load) { try { await Promise.race([document.fonts.load(`64px ${F}`), wait(1500)]); } catch (e) {} }
            sync(); const src = api().make(true);
            if (!src) { L.busy = false; flash('다시 해 주세요'); lcd(); return; }
            L.out = src; lq('lbmOutImg').src = src; const o = lq('lbmOut');
            o.className = 'lbm-out on'; o.style.setProperty('--x', '-100%'); await wait(quiet() ? 0 : 450);
            if (!quiet()) { zzz(1500); for (let p = 0; p <= 1.0001; p += 1 / 18) { o.style.setProperty('--x', (-100 + p * 100) + '%'); await wait(60 + (Math.random() < .2 ? 90 : 0)); } }
            else o.style.setProperty('--x', '0%');
            snd(1320, .08, 'triangle', .05); o.classList.add('done'); flashTx = ''; lcd();
            const open = !(typeof isCoverOpen !== 'undefined' && !isCoverOpen), A = lq('lbmActs');   // 📌 = 다이어리가 펴져 있을 때만 (책상에서는 💾 서랍으로 · 다이어리를 펴고 꺼내 붙여요)
            A.querySelector('[data-a="text"]').hidden = !open; A.querySelector('[data-a="keep"]').classList.toggle('pk', !open);
            A.hidden = false;
        }
        async function act(a) {
            if (a === 'again') { lq('lbmActs').hidden = true; lq('lbmOut').className = 'lbm-out'; L.busy = false; L.out = ''; L.text = ''; L.cur = null; lcd(); return; }
            if (!L.out || L.saving) return;
            if (typeof DK !== 'undefined' && DK.trial) { if (window.showMsg) showMsg('🏪 적용해보기에서는 저장되지 않아요'); return; }   // 🏪 샵 적용해보기 = 만들어 보기만 (도련 11-12)
            L.saving = true; [...document.querySelectorAll('#lbmActs .lbm-a')].forEach(b => { b.disabled = true; });
            try {
                sync();
                if (a === 'text') { close(() => { api().finish('text'); }); }      // 📌 기계는 책상으로 → 하얀 대지째 나와서 떼어 붙여요 (예전 글씨 스티커와 같아요)
                else { await api().finish('keep'); act('again'); }                  // 💾 🗄️ 서랍 (🏷️ 씰 · 내가만든) · 알림은 예전 글씨 스티커와 같아요 · 기계는 그대로 (또 만들어요)
            } finally { L.saving = false; [...document.querySelectorAll('#lbmActs .lbm-a')].forEach(b => { b.disabled = false; }); }
        }
        document.addEventListener('keydown', e => {
            if (!L.on || document.activeElement === lq('lbmIn')) return;
            if (e.key === 'Escape' && !document.querySelector('.modal[style*="flex"]')) close();
        });
        window.openLabeler = openLabeler; window.closeLabeler = close;
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['labeler'] = true;
