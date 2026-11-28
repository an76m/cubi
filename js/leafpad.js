/* 말랑달콤 다이어리 - js/leafpad.js
   📃 속지 · 🧻 떡메모지 (🧁 샵 상품은 모두 그림 · 상품공방)
   - 📄 내지 · 📃 속지 : 종이 한 쪽 엔진 (아래 설명 · 쪽마다 · 날짜 파일에 sj 로 저장 · 바탕 위에 붙인 것들은 그대로)
   - 🧻 떡메모지 : 묶음을 톡 누르면 맨 윗장이 북 뜯겨서 테이프와 함께 페이지에 붙어요
               뜯긴 한 장은 그림(SVG)으로 붙어서 다른 스티커처럼 옮기고 돌릴 수 있어요 (그날 파일 안에 같이 저장)
   - 🎒 유한 스티커 (10-25) : 🧺 바구니의 떡메 한 묶음(50장) = tkOwnOpen(종류, 내 그림, own) · 한 장 뜯어 붙일 때마다 한 장씩 줄어요 · 마지막 장이면 묶음이 사라져요 (js/own.js)
               📃 속지는 끼운 쪽마다 한 장씩 줄어요 (js/basket.js)
   ※ 색은 펼친 다이어리의 강조 색을 따라가요 (떡메는 뜯는 순간의 색으로 남아요) */

        const lfq = id => document.getElementById(id);

        /* ---------- 종이 소리 (설정의 '연출 소리'를 따라요 · js/sound.js) ---------- */
        function lfNoise(dur, o) {
            const ac = typeof sndFx === 'function' ? sndFx() : null; if (!ac) return;
            try {
                const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
                for (let i = 0; i < n; i++) { let v = Math.random() * 2 - 1; if (o.crackle && Math.random() < o.crackle) v *= 4; d[i] = v * (1 - i / n); }
                const s = ac.createBufferSource(); s.buffer = buf;
                const fl = ac.createBiquadFilter(); fl.type = o.type || 'bandpass'; fl.frequency.value = o.f; fl.Q.value = o.q || .8;
                if (o.f2) fl.frequency.linearRampToValueAtTime(o.f2, ac.currentTime + dur);
                const g = ac.createGain(); g.gain.value = o.gain;
                s.connect(fl).connect(g).connect((typeof sndOut === 'function' && sndOut()) || ac.destination); s.start();
            } catch (e) {}
        }
        const lfSlideSnd = () => lfNoise(.4, { f: 900, f2: 2400, q: .5, gain: .2 });

        /* =====================================================================
           📃 속지
           ===================================================================== */
        /* 📄 내지 · 📃 속지 = 종이 한 쪽 엔진 (도련 11-16 : 둘은 다른 제품 · 엔진만 같이 · 쪽마다 따로 · 규격 mm 그대로 · 늘이지 않아요)
           - 📄 내지 = 그 다이어리의 바탕 종이 (바인더 내지 · 노트 · 상품공방 '내지' · 정해진 수량 · 날짜 · 페이지 기능) : 내지 값 '상품id:내지' · 늘 양쪽 (상품 속성 양쪽 = 펼침면 그림 → 왼쪽 반 · 오른쪽 반 · js/prod.js leafCss)
           - 📃 속지 = 그날 그 쪽 내지 위에 붙이는 종이 (노트 · 바인더 모두 · 수량 · 날짜와 상관없이 디자인만) : 쪽마다 { i 그림, h 반쪽 } · h '' = 한 쪽 그림 통째 · 'l' · 'r' = 양쪽 디자인(펼친 두 쪽 그림)의 왼쪽 · 오른쪽 반
           - 그리기 = css ::before (왼쪽 쪽) · ::after (오른쪽 쪽) · 내지 무늬 --nj-l · --nj-r (🗒️ 그 다이어리 폴더의 내지 그림 · js/prod.js leafCss) · 속지 --sj-l · --sj-r · 그 위에 붙인 것들
           - 하루 파일 = sj { l, r } (r.s = 왼쪽과 같은 그림 · 그림을 두 번 적지 않게) · 내지는 적지 않아요 (그 다이어리 내지 상품에서 · js/dymaker.js dkLeafOf) */
        const lfOne = x => leafOk(x) ? x : '';   // 🗒️ 그 상품 폴더의 내지 (상품id:내지 · js/prod.js) · 모르면 '' = 속지색만 (도련 11-28)
        const lfPair = v => { const k = lfOne(v); return [k, k]; };   // 내지 = 늘 양쪽 (펼침면 그림이면 leafCss 가 반씩 · js/prod.js)
        let pageNj = ['', ''], pageSj = { l: null, r: null };      // 지금 페이지의 내지 · 속지 (js/elements.js 저장 · 불러오기)
        const lfMyOk = img => /^data:image\/(jpeg|png|webp|svg)/.test(img || '');
        /* 📏 속지 규격 (도련 11-16) : 만들 때 규격을 적어요 (sz = { n 이름, mm '가로×세로', r 한 쪽 세로 ÷ 가로 }) → 같은 규격 다이어리에만 끼워요 (늘이지 않아요) */
        const lfSz = mm => { const m = window.MK && MK.mmOf(mm); if (!m) return null; const s = MK.SPECS.find(x => x[1] === m[0] && x[2] === m[1]); return { n: s ? s[0] : '', mm: `${m[0]}×${m[1]}`, r: +(m[1] / m[0]).toFixed(4) }; };
        const lfFits = sz => !sz || !sz.mm || !window.dyLook || sz.mm === dyLook().mm;   // 규격을 적지 않은 속지 = 지금 다이어리에 만든 것
        const lfNo = sz => `📃 <b>${htmlEsc(sz.n || sz.mm)}</b> (${htmlEsc(sz.mm)}mm) 속지예요.<br><span style="font-size:12px;color:#777;">이 다이어리(${htmlEsc(dyLook().n || dyLook().mm)})와 규격이 달라서 끼울 수 없어요.</span>`;
        const sjBg = t => t && lfMyOk(t.i) ? `url("${t.i}") ${t.h === 'r' ? 'right' : t.h === 'l' ? 'left' : 'center'} center / ${t.h ? '200%' : '100%'} 100% no-repeat` : '';
        const sjPack = sj => { const o = {}; if (sj.l) o.l = { i: sj.l.i, h: sj.l.h || '' }; if (sj.r) o.r = sj.l && sj.r.i === sj.l.i ? { s: 1, h: sj.r.h || '' } : { i: sj.r.i, h: sj.r.h || '' }; return o; };
        const sjUnpack = o => { const l = o && o.l && lfMyOk(o.l.i) ? { i: o.l.i, h: o.l.h || '' } : null, ri = o && o.r ? (o.r.s ? l && l.i : o.r.i) : ''; return { l, r: lfMyOk(ri) ? { i: ri, h: o.r.h || '' } : null }; };

        /* 내지 · 속지 입히기 (오늘 페이지 · 넘길 때 보이는 옆 페이지 · 끼우는 그림 모두) */
        function lfApply(c, nj, sj) {
            const pr = lfPair(nj);
            c.style.setProperty('--nj-l', leafCss(pr[0], 'l')); c.style.setProperty('--nj-r', leafCss(pr[1], 'r'));   // 🗒️ 그 상품의 디자인 한 칸
            ['l', 'r'].forEach(sd => { const b = sjBg(sj && sj[sd]); if (b) c.style.setProperty('--sj-' + sd, b); else c.style.removeProperty('--sj-' + sd); });
            return pr;
        }
        function setPageLeaf(nj, sj) {
            const c = lfq('canvasArea'); pageSj = { l: (sj && sj.l) || null, r: (sj && sj.r) || null };
            pageNj = c ? lfApply(c, nj, pageSj) : lfPair(nj);
        }
        const lfPageNj = date => (window.dkLeafOf && dkLeafOf(date)) || '';   // 📄 그 날 · 그 페이지의 내지 (js/dymaker.js)
        /* 그날 파일에서 읽어 입히기 (js/page.js 넘기는 페이지) */
        function lfStatic(c, date) {
            let raw = null; try { raw = JSON.parse(store.getItem(getDateKey(date))); } catch (e) {}
            lfApply(c, lfPageNj(date), sjUnpack(raw && raw.sj));
        }
        /* 📃 속지 끼우기 : t = { i 그림, two 양쪽 디자인 } · sd = 'l' · 'r' · 'lr' → 그 쪽에 스르륵 끼워져요 (붙인 것들은 그 위에 그대로 · 🎒 🧺 바구니 js/basket.js) */
        function pickLeaf(t, sd) {
            if (!isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return false; }
            if (window.pgBlock && pgBlock()) return false;                      // ✅ 완료한 페이지 (js/pagedone.js)
            const c = lfq('canvasArea'), next = { l: pageSj.l, r: pageSj.r };
            [...sd].forEach(x => { next[x] = { i: t.i, h: t.two ? x : '' }; });
            lfSlideSnd();
            const sls = [...sd].map(x => {
                const sl = document.createElement('div'); sl.className = 'lf-slide ' + x;
                sl.style.setProperty('--sjb', sjBg(next[x])); sl.style.setProperty('--njb', leafCss(pageNj[x === 'l' ? 0 : 1], x));
                c.appendChild(sl); return sl;
            });
            const done = () => { sls.forEach(x => x.remove()); setPageLeaf(pageNj.join('/'), next); if (typeof saveData === 'function') saveData(false); };
            try { sls.forEach((sl, n) => { const a = sl.animate([{ transform: 'translateX(104%) rotate(2deg)', opacity: .4 }, { transform: 'none', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.3,.8,.3,1)' }); if (n === sls.length - 1) a.onfinish = done; }); }
            catch (e) { done(); }
            return true;
        }
        /* 🗑️ 그 쪽 속지 떼기 → 내지가 다시 보여요 */
        function lfOff(sd) {
            if (!pageSj[sd]) return;
            if (window.pgBlock && pgBlock()) return;
            const next = { l: pageSj.l, r: pageSj.r }; next[sd] = null;
            setPageLeaf(pageNj.join('/'), next); if (typeof saveData === 'function') saveData(false);
        }
        const lfSideAt = x => { const c = lfq('canvasArea'); return c && x >= c.offsetWidth / 2 ? 'r' : 'l'; };   // 캔버스 안 x (px) → 쪽
        /* 📍 빈 곳 메뉴(js/tapmenu.js)의 📃 속지 칸 : 🎨 속지 다듬기 (숨김) · 🗑️ 그 쪽 속지 떼기 */
        const lfMenu = sd => ({ edit: !!pageSj[sd] && !!window.openStickerEdit, off: !!pageSj[sd] });
        async function lfEdit(sd) {
            const t = pageSj[sd]; if (!t || !window.openStickerEdit) return;
            if (window.pgBlock && pgBlock()) return;
            const out = await openStickerEdit(t.i, { tools: ['color'], max: 1000, trim: false, jpeg: !/^data:image\/(png|webp)/.test(t.i) });   // webp = 투명일 수 있어요 (도련 11-04)
            if (!out || pageSj[sd] !== t) return;
            const next = { l: pageSj.l, r: pageSj.r }; next[sd] = { i: out, h: t.h }; setPageLeaf(pageNj.join('/'), next); if (typeof saveData === 'function') saveData(false);
        }
        window.lfSjNow = () => pageSj; window.lfPackNow = () => sjPack(pageSj); window.lfUnpack = sjUnpack; window.lfPageNj = lfPageNj; window.setPageLeaf = setPageLeaf; window.lfOff = lfOff; window.lfSideAt = lfSideAt; window.lfPair = lfPair;
        window.pickLeaf = pickLeaf; window.lfSz = lfSz; window.lfFits = lfFits; window.lfNo = lfNo; window.lfStatic = lfStatic; window.lfMenu = lfMenu; window.lfEdit = lfEdit;

        /* =====================================================================
           🧻 떡메모지
           ===================================================================== */
        /* 🧻 떡메 = 모두 그림('my' · 🏪 상품공방 상품 · 🧻 떡메 만들기 · 도련 11-02 : 예전에 제가 CSS · SVG 로 그린 메모 · 체크 · 하늘 · 투두는 상품공방으로 옮겼어요) */
        let TW = 150, TH = 150;                                            // 지금 묶음의 한 장 크기 (📏 크기를 정한 떡메 = 실제 mm → 지금 다이어리 페이지 px · 도련 11-14)
        /* 📏 떡메 한 장 크기 (페이지 px) : my.mm = [가로, 세로] mm × MM_PX (js/skins.js 한 곳) · 크기를 안 정한 떡메 = PAPER_MM.tk */
        function tkDim(my) {
            const mm = my && Array.isArray(my.mm) && +my.mm[0] > 0 && +my.mm[1] > 0 ? my.mm : PAPER_MM.tk;
            return [Math.round(mm[0] * MM_PX), Math.round(mm[1] * MM_PX)];
        }
        const tkVars = (w, h) => `--tw:${w}px;--th:${h}px`;
        const tk = { pad: 'my', edge: 'top', my: null };              // my : 🧻 내가만든 · 공유받은 떡메 { src(앞면 그림 JPG), glue(풀칠 띠 색 · 빈 값 = 다이어리 강조 색) } (js/leafmaker.js)
        const tkR = (a, b) => a + Math.random() * (b - a);

        function tkHex(c) {
            c = String(c || '').trim();
            if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + c.slice(1).split('').map(x => x + x).join('');
            const m = /^#([0-9a-f]{6})$/i.exec(c); if (m) return [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16));
            const r = /rgba?\(([^)]+)\)/.exec(c); return r ? r[1].split(',').slice(0, 3).map(v => parseFloat(v)) : [255, 107, 129];
        }
        const tkMix = (a, p, b = [255, 255, 255]) => 'rgb(' + a.map((v, i) => Math.round(v * p + b[i] * (1 - p))).join(',') + ')';
        const tkAcc = () => tkHex(getComputedStyle(document.documentElement).getPropertyValue('--dy-accent'));

        /* 묶음 위에 보이는 맨 윗장 (HTML) */
        function tkSheetHtml(id, my = tk.my) {
            return `<div class="tk-sheet tk-my" style="background-image:url('${my && my.src || ''}')"></div>`;
        }
        /* 작은 떡메 묶음 그림 (목록 칸) · glue : 풀칠 띠 색 */
        function tkMiniHtml(id, my) {
            const [w, h] = tkDim(my), f = Math.min(1, 150 / Math.max(w, h)), v = tkVars(Math.round(w * f), Math.round(h * f));   // 목록 칸 = 긴 쪽 150 안으로
            const g = ` style="${v}${my && /^#[0-9a-f]{6}$/i.test(my.glue || '') ? `;--tk-glue:${my.glue}` : ''}"`;
            return `<span class="tk-mini"><span class="tk-pad"${g}><span class="tk-stack"></span><span class="tk-top">${tkSheetHtml(id, my)}</span><span class="tk-glue"></span></span></span>`;
        }
        /* ✏️ 톡 누르기 : 애플펜슬로 누르면 펜 끝이 살짝 밀려 click 이 안 올 때가 있어서, 누른 자리에서 조금만 움직이고 떼면 눌린 걸로 */
        function tkTap(el, fn) {
            let at = null;
            el.addEventListener('pointerdown', e => { at = [e.clientX, e.clientY]; e.stopPropagation(); });
            el.addEventListener('pointerup', e => { if (at && Math.hypot(e.clientX - at[0], e.clientY - at[1]) < 16) { e.preventDefault(); fn(); } at = null; });
            el.addEventListener('pointercancel', () => { at = null; });
        }
        /* 찢긴 선 : 종이 끝을 따라 잔물결 + 자잘한 톱니 */
        function tkJag(len, amp) {
            const pts = [], ph = tkR(0, 6), ph2 = tkR(0, 6); let t = 0;
            while (t < len) { pts.push([t, Math.max(0, amp * (.55 + .35 * Math.sin(t / 17 + ph) + .2 * Math.sin(t / 5.3 + ph2)) + tkR(-amp * .4, amp * .4))]); t += tkR(2.2, 4.2); }
            pts.push([len, tkR(0, amp)]); return pts;
        }
        /* 한 장 모양 : 겉(하얀 종이 속살) + 안(인쇄면) · 찢긴 변은 인쇄면이 살짝 안쪽 */
        function tkShape(mode, w, h) {
            const T = mode !== 'straight', A = mode === 'all', amp = 4, flat = n => [[0, 0], [n, 0]];
            const edges = { top: T ? tkJag(w, amp) : flat(w), right: A ? tkJag(h, amp * .8) : flat(h), bottom: A ? tkJag(w, amp * .8) : flat(w), left: A ? tkJag(h, amp * .8) : flat(h) };
            const torn = { top: T, right: A, bottom: A, left: A }, outer = [], inner = [];
            for (const side of ['top', 'right', 'bottom', 'left']) for (const [t, o] of edges[side]) {
                const ins = torn[side] ? tkR(1.2, 2.8) : 0, m = { top: [t, o, 0, 1], right: [w - o, t, -1, 0], bottom: [w - t, h - o, 0, -1], left: [o, h - t, 1, 0] }[side];
                outer.push([m[0], m[1]]); inner.push([m[0] + m[2] * ins, m[1] + m[3] * ins]);
            }
            return { outer, inner, top: edges.top };
        }
        const tkPts = p => p.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
        const tkCss = p => 'polygon(' + p.map(([x, y]) => x.toFixed(1) + 'px ' + y.toFixed(1) + 'px').join(',') + ')';

        /* 페이지에 붙는 한 장 (SVG 그림 · 위쪽 12px 은 묶음에 붙어 있던 자리라 잘려 나가요) */
        function tkPieceSvg(id, sh, tape = true) {
            const acc = tkAcc(), W = TW, H = TH;
            const face = `<rect width="${W}" height="${H}" fill="#fff"/><image href="${tk.my && tk.my.src || ''}" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
            const tr = tkR(-7, 7).toFixed(1), ta = tkMix(acc, .4), tb = tkMix(acc, .22);
            const tp = `<g transform="translate(${W / 2} 0) rotate(${tr})" opacity=".82"><defs><pattern id="tkt" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="${tb}"/><rect width="6" height="12" fill="${ta}"/></pattern></defs>`
                + `<polygon points="-29,-7.6 -26.7,-9 -24.4,-7.2 -22,-9 29,-9 26.7,-6.8 29,-4.5 26.7,-1.8 29,.9 26.7,3.6 29,6.3 27.3,9 -29,9 -26.7,6.3 -29,3.6 -26.7,.9 -29,-1.8 -26.7,-4.5" fill="url(#tkt)"/></g>`;
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -12 ${W + 12} ${H + 20}" width="${W + 12}" height="${H + 20}">`
                + `<defs><filter id="tkd" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="1.5" stdDeviation=".7" flood-color="#5a3c32" flood-opacity=".22"/><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#5a3c32" flood-opacity=".1"/></filter><clipPath id="tki"><polygon points="${tkPts(sh.inner)}"/></clipPath></defs>`
                + `<g filter="url(#tkd)"><polygon points="${tkPts(sh.outer)}" fill="#fffdf6"/><g clip-path="url(#tki)">${face}</g></g>${tape ? tp : ''}</svg>`;
        }

        /* =====================================================================
           🧻 떡메 뜯어 붙이기 : 🏷️ 씰스티커처럼 페이지 앞(배경 한가운데)에 묶음이 나와요
           - 맨 윗장을 잡고 왼쪽→오른쪽(또는 오른쪽→왼쪽)으로 쭉 당기면 풀칠된 윗변이 그쪽으로 찢겨 나가요
             (반대쪽 윗모서리에 매달린 채 따라오다가 끝까지 찢기면 손에 들려요) → 원하는 곳에 놓으면 테이프로 붙어요
           - 덜 당기고 놓으면 제자리로 · 분홍 풀칠 띠를 끌면 묶음째 옮겨져요 · 날짜바를 끌면 페이지가 옮겨져요
           - 묶음은 ✕ 를 누를 때까지 남아 있어서 여러 장 뜯을 수 있어요 · 소리 : 찢는 동안 '찌이익'만
           ===================================================================== */
        const TK_PULL = 120;                                                  // 이만큼(화면 px) 옆으로 당기면 다 찢겨요
        const tkS = { on: false, k: 1, mv: [0, 0], drag: null, fly: null, hint: '', own: null };
        function tkBuild() {
            if (lfq('tkRoom')) return;
            const el = document.createElement('div');
            el.id = 'tkRoom'; el.className = 'pel-room tk-room';
            el.innerHTML = `<div class="tk-rpad" id="tkRPad"><div class="tk-stack"></div><div class="tk-top" id="tkRTop"></div><div class="tk-stubs" id="tkRStubs"></div><div class="tk-glue"></div><button type="button" class="tk-x win-x" aria-label="닫기">✕</button></div>`
                + `<p class="pel-hint" id="tkHint"></p>`;
            document.body.appendChild(el);
            tkTap(el.querySelector('.tk-x'), closeTteokRoom);                    // ✕ = 묶음을 🧺 바구니에 다시 넣어요 (남은 장은 그대로)
            el.addEventListener('pointerdown', tkDown); el.addEventListener('pointermove', tkMove);
            el.addEventListener('pointerup', tkUp); el.addEventListener('pointercancel', tkUp);
            window.addEventListener('resize', () => { if (tkS.on) tkLayout(); });
        }
        /* 묶음 자리 : 배경(화면) 한가운데 + 옮긴 만큼 · 크기는 페이지에 붙을 크기 그대로 (페이지 확대 · 축소 비율 k) */
        function tkLayout() {
            const pg = lfq('canvasArea'), pad = lfq('tkRPad');
            tkS.k = pg && pg.offsetWidth ? pg.getBoundingClientRect().width / pg.offsetWidth : 1;
            const k = tkS.k, W = TW * k, H = (TH + 24) * k, VW = window.innerWidth, VH = window.innerHeight;
            tkS.mv[0] = Math.max(W / 2 - VW / 2, Math.min(VW / 2 - W / 2, tkS.mv[0])); tkS.mv[1] = Math.max(H / 2 - VH / 2, Math.min(VH / 2 - H / 2, tkS.mv[1]));
            tkS.x = VW / 2 + tkS.mv[0] - W / 2; tkS.y = VH / 2 + tkS.mv[1] - H / 2;
            pad.style.transform = `translate(${tkS.x}px, ${tkS.y}px) scale(${k})`;
        }
        function spawnTteok() {
            if (!isCoverOpen) { showMsg('먼저 다이어리를 열어 주세요!'); return; }
            tkBuild();
            [TW, TH] = tkDim(tk.pad === 'my' ? tk.my : null); lfq('tkRPad').style.setProperty('--tw', TW + 'px'); lfq('tkRPad').style.setProperty('--th', TH + 'px');   // 📏 이 묶음의 한 장 크기
            lfq('tkRTop').innerHTML = tkSheetHtml(tk.pad); lfq('tkRStubs').innerHTML = '';
            const g = tk.pad === 'my' && tk.my && /^#[0-9a-f]{6}$/i.test(tk.my.glue || '') ? tk.my.glue : '';
            lfq('tkRPad').style.setProperty('--tk-glue', g || 'initial');
            Object.assign(tkS, { on: true, mv: [0, 0], drag: null, hint: '' });
            const room = lfq('tkRoom');
            tkLayout();
            room.classList.add('show');
            document.body.classList.add('fc-lock');
            try { lfq('tkRPad').animate([{ opacity: 0, translate: '0 30px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'cubic-bezier(.25,.7,.3,1)' }); } catch (e) {}
            tkSay('맨 윗장을 잡고 <b>옆으로 쭉</b> 당겨서 뜯어 보세요');
        }
        /* 🎒 내 떡메 묶음 꺼내기 (js/basket.js) */
        function tkOwnOpen(pad, my, own) { tk.pad = pad; tk.my = my || null; tkS.own = own || null; spawnTteok(); }
        function closeTteokRoom() {
            const back = !!tkS.own; tkS.own = null;
            if (back && window.stkReturn) setTimeout(stkReturn, 0);              // 🧺 바구니에서 왔으면 다시 떠요
            tkS.on = false; tkS.drag = null; clearTimeout(tkS.hush); tkNoise(0); if (tkS.fly) { tkS.fly.remove(); tkS.fly = null; }
            const r = lfq('tkRoom'); if (r) r.classList.remove('show');
            document.body.classList.remove('fc-lock');
        }
        function tkSay(h) { hintPop(lfq('tkHint'), tkS, h); }   // 💬 js/util.js
        /* 화면 → 묶음 안 좌표 (TW × (TH + 24) 기준) */
        const tkLocal = P => [(P[0] - tkS.x) / tkS.k, (P[1] - tkS.y) / tkS.k];

        function tkDown(e) {
            if (!tkS.on || tkS.drag || e.target.closest('.tk-x')) return;
            const P = [e.clientX, e.clientY], [lx, ly] = tkLocal(P);
            const cap = () => { try { lfq('tkRoom').setPointerCapture(e.pointerId); } catch (er) {} };
            if (lx >= -4 && lx <= TW + 4 && ly >= -6 && ly <= 16) { tkS.drag = { mode: 'pad', last: P }; cap(); return; }          // 분홍 풀칠 띠 → 묶음 옮기기 (📒 수첩 안에서는 수첩 제목 줄로 옮겨요)
            if (lx >= 0 && lx <= TW && ly > 16 && ly <= TH + 20) { tkS.drag = { mode: 'tear', start: P, last: P, lt: performance.now(), p: 0 }; cap(); tkSay('살살… 옆으로 쭉 당겨요'); return; }
            if (window.pgmOnBar && pgmOnBar(P[0], P[1])) pgmBegin(e);                // 날짜바 → 페이지 옮기기 (js/page.js)
        }
        /* 당기기 시작한 쪽이 정해지면 : 떼어질 한 장(테이프 없는 그림)을 묶음 위에 똑같이 겹쳐 띄워요 · 아래엔 다음 장이 그대로 */
        function tkLift(d, dir) {
            const k = tkS.k, sh = tkShape(tk.edge, TW, TH), im = new Image();
            im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tkPieceSvg(tk.pad, sh, false));
            im.className = 'tk-fly'; im.draggable = false;
            const px = dir > 0 ? TW : 0;                                        // 매달린 쪽 윗모서리 (찢김이 끝나는 쪽)
            Object.assign(im.style, { width: (TW + 12) * k + 'px', left: tkS.x + -6 * k + 'px', top: tkS.y + 0 * k + 'px', transformOrigin: `${(px + 6) * k}px ${12 * k}px` });
            lfq('tkRoom').insertBefore(im, lfq('tkHint'));
            tkS.fly = im; tkS.sh = sh; d.dir = dir;
            const st = lfq('tkRStubs'); st.innerHTML = ''; st.style.clipPath = dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
            if (tk.edge !== 'straight') {                                        // 묶음에 남는 뜯긴 자국 (찢긴 만큼만 보여요)
                const o = [[TW, 0], [0, 0], ...sh.top.map(([t, v]) => [t, 12 + v])], i = [[TW, 0], [0, 0], ...sh.top.map(([t, v]) => [t, 12 + v - tkR(1.2, 2.6)])];
                st.innerHTML = `<div class="tk-stub"><div class="rim" style="clip-path:${tkCss(o)}"></div><div class="face" style="clip-path:${tkCss(i)}">${tkSheetHtml(tk.pad)}</div></div>`;
            }
        }
        function tkMove(e) {
            const d = tkS.drag; if (!d) return;
            const P = [e.clientX, e.clientY], now = performance.now();
            if (P[0] === d.last[0] && P[1] === d.last[1]) return;              // ✏️ 펜슬은 제자리에서 누르는 힘만 바뀌어도 움직임이 와요 → 무시 (소리가 끊기지 않게)
            if (d.mode === 'pad') { tkS.mv[0] += P[0] - d.last[0]; tkS.mv[1] += P[1] - d.last[1]; d.last = P; tkLayout(); return; }
            const sp = Math.hypot(P[0] - d.last[0], P[1] - d.last[1]) / Math.max(1, now - d.lt); d.last = P; d.lt = now;
            if (d.mode === 'free') {
                const f = tkS.fly; d.rot += ((P[0] - d.px) * .25 - (d.rot - d.base)) * .2; d.px = P[0];
                f.style.left = P[0] - d.off[0] + 'px'; f.style.top = P[1] - d.off[1] + 'px';
                f.style.transform = `rotate(${Math.max(-25, Math.min(25, d.rot))}deg)`; return;
            }
            const dx = P[0] - d.start[0], dy = P[1] - d.start[1];
            if (!d.dir) { if (Math.abs(dx) < 6) return; tkLift(d, Math.sign(dx)); }
            const p = Math.max(0, Math.min(1, d.dir * dx / TK_PULL));
            if (p > d.p) { tkNoise(Math.min(.4, .1 + sp * .3)); clearTimeout(tkS.hush); tkS.hush = setTimeout(() => tkNoise(0), 120); }   // 멈추면 조용히
            else if (p < d.p) tkNoise(0);
            d.p = p;
            const rot = -d.dir * p * 24, ty = Math.max(-10, Math.min(24, dy * .25)) + p * 8, tx = d.dir * p * 14;
            tkS.fly.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
            lfq('tkRStubs').style.clipPath = d.dir > 0 ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(0 0 0 ${(1 - p) * 100}%)`;
            if (p > .6 && !d.half) { d.half = 1; tkSay('거의 다 찢겼어요… 조금만 더!'); }
            if (p >= 1) tkFree(P, rot);
        }
        /* 끝까지 찢김 → 손에 들려요 (가운데 기준으로 바꿔서 손가락을 따라와요) */
        function tkFree(P, rot) {
            const f = tkS.fly, b = f.getBoundingClientRect(), w = f.offsetWidth, h = f.offsetHeight;
            const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
            f.style.transformOrigin = '50% 50%'; f.style.left = cx - w / 2 + 'px'; f.style.top = cy - h / 2 + 'px'; f.style.transform = `rotate(${rot}deg)`;
            tkS.drag = { mode: 'free', off: [P[0] - (cx - w / 2), P[1] - (cy - h / 2)], rot, base: -tkS.drag.dir * 6, px: P[0], last: P, lt: performance.now() };
            tkNoise(0); buzz(15);
            tkSay('북! 뜯겼어요 ✨ 원하는 곳에 놓아 보세요');
        }
        function tkUp() {
            const d = tkS.drag; if (!d) return;
            tkS.drag = null; clearTimeout(tkS.hush); tkNoise(0);
            if (d.mode === 'pad') return;
            const f = tkS.fly;
            if (d.mode === 'tear') {
                if (!d.dir) { tkSay('톡 누르면 안 뜯겨요 · <b>옆으로 쭉</b> 당겨 보세요'); try { lfq('tkRTop').animate([{ rotate: '0deg' }, { rotate: '1.5deg' }, { rotate: '-1.5deg' }, { rotate: '0deg' }], { duration: 300 }); } catch (e) {} return; }
                tkS.fly = null; const st = lfq('tkRStubs');                      // 덜 찢겼으면 제자리로 붙어요
                f.style.transition = 'transform .22s ease-out'; f.style.transform = 'none'; st.style.transition = 'clip-path .22s ease-out'; st.style.clipPath = d.dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
                setTimeout(() => { f.remove(); st.style.transition = ''; st.innerHTML = ''; }, 240);
                if (d.p > .15) tkSay('앗, 다시 붙어 버렸어요 🫣 끝까지 쭉 당겨 보세요');
                return;
            }
            buzz(8);
            tkStick(f, Math.max(-25, Math.min(25, d.rot)));
        }
        /* 놓은 자리에 붙이기 : 화면에 보이던 크기 · 기울기 그대로 · 테이프가 붙은 그림으로 */
        function tkStick(f, rot) {
            const pg = lfq('canvasArea'), P = pageK(pg), b = f.getBoundingClientRect(), [cx, cy] = pageIn(P.r, b.left + b.width / 2, b.top + b.height / 2);   // 📄 페이지에 놓기 하나 (js/elements.js)
            tkS.fly = null; f.remove();
            const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tkPieceSvg(tk.pad, tkS.sh));
            if (!isCoverOpen) { closeTteokRoom(); return; }
            addText();                                                           // 떡메는 메모도 돼요 : 글상자 + 뒤에 떡메 그림 (짧게 톡 → 글쓰기)
            const el = pg.querySelector('.element-box:last-child'); if (!el) return;
            tkNoteDress(el, tk.pad, src);
            elPlace(el, P, cx, cy, TW + 12, TH + 20, Math.round(rot * 10) / 10);
            el.classList.remove('selected'); if (selectedElement === el) { selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel(); }   // 그냥 놓이기만 · 톡 누르면 그때 골라져서 글쓰기
            if (typeof saveData === 'function') saveData(false);
            if (tkS.own && window.ownQty) {                                      // 🎒 한 장 뜯어 붙이면 묶음이 한 장 줄어요 (js/own.js)
                el.dataset.own = tkS.own.id;
                ownQty(tkS.own.id, 1, el).catch(er => console.warn('떡메를 아직 못 줄였어요 (다시 해요) :', er));
                const left = window.ownQtyLeft ? ownQtyLeft(tkS.own.id) : 1;
                if (left <= 0) { tkSay('마지막 장이었어요 ✨'); setTimeout(closeTteokRoom, 700); return; }
                return;                                                          // 붙인 뒤 메시지 없음 (도련 11-26 · 버튼을 가려요)
            }
        }

        /* 📝 페이지에 붙은 떡메 = 글상자(textarea) + 뒤에 깔린 떡메 그림 · 일기에는 글 + 떡메 종류(tk) + 그림 그대로(tb) 저장 (js/elements.js)
           옮길 때는 메모지처럼 살짝 떠서 · 짧게 톡 누르면 골라지면서 글쓰기 */
        function tkNoteDress(el, pad, src) {
            pad = 'my';
            el.classList.add('tk-note', 'tk-note-' + pad); el.dataset.tk = pad; el.dataset.tkSrc = src;
            const im = document.createElement('img'); im.className = 'tk-bg'; im.alt = ''; im.draggable = false; im.src = src;
            el.insertBefore(im, el.firstChild);
            const ta = el.querySelector('textarea'); if (ta) ta.placeholder = '메모를 입력하세요...';
        }

        /* ---------- 소리 : 찢는 동안 '찌이익'만 (당기는 빠르기만큼) ---------- */
        const tkNoise = scrubSound({ hz: 2100, q: .8, hit: .12, lo: .25 });   // 🔊 떼는 소리 (js/util.js 하나)
        window.spawnTteok = spawnTteok; window.closeTteokRoom = closeTteokRoom; window.tkNoteDress = tkNoteDress;
        window.tkMiniHtml = tkMiniHtml;

/* 📃 그림 속지(lf-my) 칸 : 그림의 가로:세로를 --lf-r 로 (도련 10-24 · 🏪 기본상품 샵 · 🧺 바구니 칸) */
(function () {
    const seen = new WeakSet();
    const fit = el => {
        if (seen.has(el)) return; seen.add(el);
        const m = /url\(["']?(.*?)["']?\)/.exec(el.style.getPropertyValue('--lf-img') || ''); if (!m) return;
        const im = new Image();
        im.onload = () => { if (im.naturalWidth && im.naturalHeight) (el.closest('.lf-pick') || el).style.setProperty('--lf-r', (im.naturalWidth / im.naturalHeight).toFixed(4)); };
        im.src = m[1];
    };
    const scan = root => { if (root.querySelectorAll) root.querySelectorAll('.lf-sw.lf-my').forEach(fit); };
    new MutationObserver(ms => ms.forEach(r => r.addedNodes.forEach(scan))).observe(document.documentElement, { childList: true, subtree: true });
    scan(document);
})();
