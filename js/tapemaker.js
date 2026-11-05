/* 말랑달콤 다이어리 - js/tapemaker.js
   🎀 마스킹테이프 만들기 : 내가 직접 그린 그림, 또는 내 사진으로 나만의 마스킹테이프를 만들어요 (하단메뉴 ✨ 스티커 → ✂️ 스티커만들기 → 🎀 마스킹테이프 만들기)
   - ✏️ 그리기 : 네모 한 칸에 그리면 테이프에 쭉 이어 붙어요 = ✏️ 그리기 판 (js/maker.js MK.draw · 상품공방 직접 그리기 · 그려서 배경지와 같은 판 · 도련 11-05)
   - 🖼️ 내 사진으로 : 사진 가운데를 네모로 잘라 테이프에 이어 붙여요 (사진은 이 기기에서만 줄여서, 완성된 테이프만 저장돼요)
   - 🧵 무늬로 : js/maker.js 무늬 메이커 (상품공방 마스킹테이프와 같은 칸 · 도련 11-05) · 한 칸으로 그려 이어 붙여요
   - 🎒 만든 테이프 = 🧺 바구니에 한 롤 (10-25 · js/own.js) : 📌 바로 꺼내 붙이기 · 🧺 바구니에 넣기 · 붙인 길이만큼 롤이 줄어요 (또 쓰려면 또 만들어요)
   - 테이프 그림은 js/tape.js 의 tapeSvg 를 그대로 써요 (끝 톱니 · 반투명 · 길이 늘이기 손잡이가 같아요)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (마스킹테이프 만들기 · 내 마스킹테이프만 '준비 중') */

        const TPM_MAX = Infinity, TPM_PHOTO_PX = 96;
        const TPM_PAD = 240, TPM_OUT = 120;                              // 그리는 칸(안쪽 해상도) · 저장되는 그림 크기
        const TPM_SIZE = { d: [16, 60, 30], i: [16, 60, 30], p: [16, 60, 30] };            // 크기 막대 : [가장 작게, 가장 크게, 처음 값] (그리기 · 사진)
        const tpmS = { built: false, m: 'd', bg: '#ffc9d9', dw: null, sd: 30, si: 30, sp: 30, dimg: '', img: '', pimg: '', pk: 1, prec: null };
        const tpmq = id => document.getElementById(id);
        const tpmR = n => Math.round(n * 100) / 100;

        /* 저장해 둔 모양(o) → tape.js 의 tapeSvg 가 읽는 모양 (그림 · 사진 모두 '한 칸 그림'을 이어 붙여요) */
        function tpmDef(o) {
            const w = o.w || o.s;                                       // w : 글씨가 든 무늬 칸은 옆으로 길어요 (🧵 무늬로 · 도련 11-05)
            return { id: 'my-' + o.id, name: '내 마스킹테이프', bg: o.bg, w, h: o.s, p: o.img ? `<image href="${o.img}" width="${w}" height="${o.s}" preserveAspectRatio="xMidYMid slice"/>` : '' };
        }
        const tpmUrl = o => tapeUrl(tpmDef(o));
        /* 드라이브 · 기기에서 읽은 것은 정해진 모양만 통과 (그림 안에 들어가는 글자라서 꼼꼼히 확인) */
        function tpmClean(o) {
            if (!o || typeof o !== 'object') return null;
            const col = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v), s = +o.s;
            if (!/^[\w-]{1,20}$/.test(o.id || '') || !col(o.bg) || !(s >= 8 && s <= 60)) return null;
            const re = o.m === 'd' || o.m === 'p' ? /^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/ : o.m === 'i' ? /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/ : null;
            const w = o.w == null ? 0 : +o.w;
            if (w && !(o.m === 'p' && w >= s && w <= s * 12)) return null;
            return re && re.test(o.img || '') ? Object.assign({ id: o.id, m: o.m, bg: o.bg, s, img: o.img }, w ? { w } : {}) : null;
        }

        /* 목록에 보일 작은 테이프 (그림만 48px 로 줄여요) */

        /* ---------- 화면 (스티커 만들기 화면의 모양을 같이 써요 : css .smk-*) ---------- */
        function tpmBuild() {
            if (tpmS.built) return;
            tpmS.built = true;
            const el = document.createElement('div');
            el.id = 'tpmRoom'; el.className = 'smk-room';
            el.innerHTML = `
              <div class="smk-bar"><span class="smk-x"></span><b>🎀 마스킹테이프 만들기</b><button class="smk-x" type="button" onclick="closeTapeMaker()" aria-label="닫기">✕</button></div>
              <div class="smk-wrap">
                <input type="file" id="tpmFile" accept="image/*" hidden onchange="tpmPickFile(this)">
                <section class="smk-step">
                  <div class="tpm-top"><div class="tpm-stage"><span class="tpm-tape" id="tpmTape"></span></div>
                  <label class="smk-zoom tpm-zoom">🔍 <small>크기</small> <input type="range" id="tpmSize" oninput="tpmSetSize(+this.value)"></label>
                  </div>
                  <div class="smk-chips" id="tpmTabs"><button type="button" data-m="d" onclick="tpmSetMode('d')">✏️ 그리기</button><button type="button" data-m="i" onclick="tpmSetMode('i')">🖼️ 내 사진으로</button><button type="button" data-m="p" onclick="tpmSetMode('p')">🧵 무늬로</button></div>
                  <div id="tpmPatOpts" class="smk-step" hidden><div id="tpmMk"></div></div>
                  <div id="tpmDrawOpts" class="smk-step">
                    <p class="tpm-lead">✏️ 네모 한 칸에 그려 보세요 · 위 테이프에 쭉 이어져요</p>
                    <div id="tpmDw"></div>
                  </div>
                  <div id="tpmPhotoOpts" class="smk-step" hidden>
                    <button type="button" class="smk-go smk-sub" onclick="tpmq('tpmFile').click()">🖼️ 사진 고르기</button>
                    <p class="smk-hint">사진 가운데를 네모로 잘라서 테이프에 쭉 이어 붙여요</p>
                  </div>
                  <button type="button" class="smk-go" onclick="tpmFinish(true,this)">📌 다이어리에 붙이기</button>
                  <button type="button" class="smk-go smk-sub" onclick="tpmFinish(false,this)">🧺 바구니에 넣기</button>
                </section>
              </div>`;
            document.body.appendChild(el);
            tpmS.dw = MK.draw(tpmq('tpmDw'), { W: TPM_PAD, H: TPM_PAD, wrap: true, bg: tpmS.bg, view: 260, onChange: d => { tpmS.bg = d.bg; tpmExport(); } });
        }
        function tpmCur() {                                            // 지금 만들고 있는 테이프 (저장 모양)
            const o = { id: Date.now().toString(36), m: tpmS.m, bg: tpmS.bg };
            if (tpmS.m === 'i') { o.s = tpmS.si; o.img = tpmS.img; } else if (tpmS.m === 'p') { o.s = tpmS.sp; o.img = tpmS.pimg; o.bg = (tpmS.prec || {}).bg || tpmS.bg; if (tpmS.pk > 1) o.w = Math.round(o.s * tpmS.pk * 100) / 100; } else { o.s = tpmS.sd; o.img = tpmS.dimg; }
            return o;
        }
        function tpmDraw() {
            const t = tpmq('tpmTape'); if (!t) return;
            t.style.backgroundImage = (tpmS.m === 'i' && !tpmS.img) || (tpmS.m === 'p' && !tpmS.pimg) ? 'none' : `url("${tpmUrl(tpmCur())}")`;
            document.querySelectorAll('#tpmTabs button').forEach(b => b.classList.toggle('on', b.dataset.m === tpmS.m));
            tpmq('tpmDrawOpts').hidden = tpmS.m !== 'd'; tpmq('tpmPhotoOpts').hidden = tpmS.m !== 'i'; tpmq('tpmPatOpts').hidden = tpmS.m !== 'p';
            const z = tpmq('tpmSize'), r = TPM_SIZE[tpmS.m];
            z.min = r[0]; z.max = r[1]; z.step = 1; z.value = tpmS.m === 'i' ? tpmS.si : tpmS.m === 'p' ? tpmS.sp : tpmS.sd;
        }
        function tpmSetMode(m) { tpmS.m = m; tpmDraw(); if (m === 'i' && !tpmS.img) tpmq('tpmFile').click(); if (m === 'p') tpmPat(); }
        /* 🧵 무늬로 (js/maker.js · 상품공방 마스킹테이프와 같은 칸) : 레시피 → 이어지는 한 칸 (무늬 칸 크기의 배수) → 그림
           글씨 : 한 칸 가운데에 (진짜 마테처럼 글씨가 되풀이돼요) · 글씨가 길면 칸이 옆으로 길어져요 (무늬 칸 크기의 배수라 이음매가 안 보여요 · pk = 가로 ÷ 세로) */
        function tpmPat() {
            const host = tpmq('tpmMk'); if (!host || !window.MK) return;
            if (!host.firstChild) MK.form(host, 'tape', tpmS.prec || { bg: '#ffc9d9', L: [{ p: 'dot', c: '#ffffff', s: 20 }] }, r => { tpmS.prec = r; tpmPatPaint(); }, { only: ['bg', 'L', 'im', 'text', 'tc'], imgPx: 200 });
        }
        let tpmPatT = 0;
        function tpmPatPaint() {
            clearTimeout(tpmPatT); tpmPatT = setTimeout(async () => {
                const r = tpmS.prec; if (!r) return;
                const s0 = r.L.length ? r.L[0].s : r.im ? r.im.s + r.im.g : 40, C = s0 * Math.max(1, Math.round(60 / s0));
                const t = String(r.text || '').trim(), fs = TPM_OUT * .42, cv = document.createElement('canvas'), x = cv.getContext('2d');
                x.font = `700 ${fs}px sans-serif`;
                const k = t ? Math.min(12, Math.max(1, Math.ceil((x.measureText(t).width + fs * 1.6) / TPM_OUT * C / s0) * s0 / C)) : 1, W = Math.round(TPM_OUT * k);
                try {
                    const bg = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = MK.url(MK.tileSvg(r, C * k, C)); });
                    cv.width = W; cv.height = TPM_OUT; x.drawImage(bg, 0, 0, W, TPM_OUT);
                    if (t) { x.font = `700 ${fs}px sans-serif`; x.fillStyle = /^#[0-9a-f]{6}$/i.test(r.tc || '') ? r.tc : '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, W / 2, TPM_OUT / 2); }
                    tpmS.pimg = cv.toDataURL('image/png'); tpmS.pk = k;
                } catch (e) { tpmS.pimg = ''; tpmS.pk = 1; }
                tpmDraw();
            }, 60);
        }
        function tpmSetSize(v) { if (tpmS.m === 'i') tpmS.si = v; else if (tpmS.m === 'p') tpmS.sp = v; else tpmS.sd = v; tpmDraw(); }

        /* ---------- ✏️ 그리기 (MK.draw 판) ---------- */
        function tpmExport() {                                         // 그린 것 → 작은 투명 그림 (cvSmall · 비었으면 '')
            const d = tpmS.dw; if (!d) return;
            if (!d.drawn()) tpmS.dimg = '';
            else { const c = document.createElement('canvas'); c.width = c.height = TPM_OUT; c.getContext('2d').drawImage(d.cv, 0, 0, TPM_OUT, TPM_OUT); tpmS.dimg = cvSmall(c); }   // 🗜 크롬 WebP 0.9 · 사파리 PNG (도련 11-04)
            tpmDraw();
        }

        /* ---------- 사진 ---------- */
        function tpmPickFile(inp) {
            const f = inp.files && inp.files[0]; inp.value = '';
            if (!f || !/^image\//.test(f.type)) return;
            const im = new Image();
            im.onload = () => {
                const c = document.createElement('canvas'), n = TPM_PHOTO_PX, k = Math.max(n / im.width, n / im.height);
                c.width = c.height = n;
                c.getContext('2d').drawImage(im, (n - im.width * k) / 2, (n - im.height * k) / 2, im.width * k, im.height * k);
                URL.revokeObjectURL(im.src);
                tpmS.img = c.toDataURL('image/jpeg', .82); tpmS.m = 'i'; tpmDraw();
            };
            im.onerror = () => showMsg('사진을 열지 못했어요. 다른 사진을 골라 주세요.');
            im.src = URL.createObjectURL(f);
        }

        /* ---------- 완성 ---------- */
        function tpmFinish(stick, btn) { return smkRun(btn, stick ? '📌 붙이는 중…' : '🧺 넣는 중…', () => tpmDoFinish(stick)); }
        async function tpmDoFinish(stick) {
            if (tpmS.m === 'i' && !tpmS.img) { showMsg('🖼️ 사진을 먼저 골라 주세요.'); return; }
            if (tpmS.m === 'p' && !tpmS.pimg) { showMsg('🧵 무늬를 먼저 골라 주세요.'); return; }
            if (tpmS.m === 'd') { tpmExport(); if (!tpmS.dimg) { showMsg('✏️ 먼저 네모 칸에 그려 주세요.'); return; } }
            const o = tpmCur(), u = tpmUrl(o);                                // 🎒 만든 테이프 = 🧺 바구니에 한 롤 (붙인 길이만큼 줄어요 · js/own.js)
            let id = '';
            try { id = await ownTake({ k: 'tape', from: 'mine', imgs: [u], th: u }); }
            catch (e) { showMsg('⚠ 테이프를 바구니에 넣지 못했어요.<br>' + (window.ownErrText ? ownErrText(e) : '')); return; }
            closeTapeMaker();
            if (stick) { if (window.bkOpenSheet) bkOpenSheet(id); return; }
            showMsg('🎀 만든 테이프를 <b>🧺 바구니</b>에 넣었어요!<br><span style="font-size:12px;color:#777;">하단메뉴 ✨ 스티커 → 바구니에서 꺼내 붙여요.</span>');
        }

        function openTapeMaker() {
            tpmBuild();
            if (!tpmS.img && tpmS.m === 'i') tpmS.m = 'd';
            tpmDraw();
            tpmq('tpmRoom').classList.add('show'); tpmq('tpmRoom').querySelector('.smk-wrap').scrollTop = 0;
            document.body.classList.add('fc-lock');
        }
        function closeTapeMaker() {
            const r = tpmq('tpmRoom'); if (r) r.classList.remove('show');
            document.body.classList.remove('fc-lock');
        }
        /* 스티커 창의 다른 칸을 누르면 '내 마스킹테이프' 표시 지우기 */
        document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.cat-btn'); if (b) { const g = tpmq('stickerGrid'); if (g) delete g.dataset.mytape; } }, true);
        window.openTapeMaker = openTapeMaker;
