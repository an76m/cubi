/* 말랑달콤 다이어리 - js/stickermaker.js
   ✂️ 스티커 만들기 : 내 사진이나 글씨로 하얀 테두리 '다이컷 스티커'를 만들어요 (하단메뉴 ✨ 스티커 → ✂️ 스티커만들기 → 📷 사진찍기 · 🖼️ 사진고르기 · 🔤 글씨 스티커)
   - 🖼 사진고르기로 여러 장(최대 SM_MANY)을 고르면 : 위쪽 사진 줄에서 한 장씩 골라 모양 · 자리 · 크기를 따로 맞춰요 (🔁 버튼 = 지금 모양 · 크기를 모든 사진에)
     📌 붙이기 → 🏷️ 씰 내스티커에 '한 칸'으로 저장 → 한 장의 하얀 종이에 씰이 여러 개 붙어 페이지 가운데 나와요 (js/stickerpeel.js)
     여러 장 한 칸 : { id, src : 종이 미리보기, ss : [스티커 그림들], k } → 누르면 종이째 다시 나와요 (11장부터는 알림 후 앞의 SM_MANY장만)
     🧩 · 🏷️ 만들기 → 모두 그 종류 내스티커에 저장 · 📄 모조지스티커는 고른 사진들이 모조지스티커 한 장에 나란히 인쇄돼요 (js/papermaker.js)
   - 사진 스티커 : 📷 찍기 · 🖼 고르기(한 장) → 모양(🖼 원본 그대로 · 동그라미 · 하트 · 별 · 둥근네모 · 구름) 또는 ✂️ 손으로 오리기 → 끌어서 자리 · 크기 조절
     결과 버튼 : 🏷️ 씰스티커로 다이어리에 붙이기 (씰로 저장 → 하얀 종이에서 떼어 원하는 곳에 · js/stickerpeel.js)
               🧩 조각스티커로 다이어리에 붙이기 (조각 봉투로 저장 → 봉투를 뜯어 원하는 곳에 · js/piecebag.js)
               📄 모조지스티커로 다이어리에 붙이기 (모조지스티커 한 장으로 저장 → 가운데 나온 종이에서 칼집을 내고 떼어 원하는 곳에 · js/papermaker.js)
                 🧩 조각스티커 만들기 · 🏷️ 씰스티커 만들기 (하얀 테두리를 둘러 그 종류 내스티커에 저장) · 📄 모조지스티커 만들기 (모조지스티커 한 장으로 저장)
   - 글씨 스티커 : 1단계 글자 쓰기 → (다음 단계) 2단계 글꼴 · 색 · 하얀 테두리 고르고 붙이기 · 💾 저장만 → 🧩 내스티커
   - 🎒 유한 스티커 (10-25) : 만든 🏷️ 씰은 종이 한 장으로 🧺 바구니에 들어가요 (js/own.js ownTakeMine) → 한 칸씩 떼어 붙이면 영원히 사라져요 (또 쓰려면 또 만들어요)
     📌 붙이기 = 바구니에 넣고 그 종이를 바로 열어요 · 만들기 = 바구니에만
     🧩 조각(봉투 하나) · 📄 모조지(종이 한 장)도 바구니로 · 🎀 테이프 · 📃 속지 · 🧻 떡메 만들기는 js/tapemaker.js · js/leafmaker.js
   ※ 사진은 이 기기에서만 오려서, 완성한 스티커 그림만 저장돼요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (세 버튼만 '준비 중') */

        const SM_SIZE = 300, SM_OUT = 260, SM_MANY = 10;
        const SM_SHAPES = [['orig', '🖼️ 원본 그대로'], ['circle', '동그라미'], ['heart', '하트'], ['star', '별'], ['round', '둥근네모'], ['cloud', '구름'], ['free', '✂️ 손으로']];
        const SM_DEF_FONT = "'Jua', sans-serif";                      // 처음 글꼴 (고르는 목록은 설정창과 같은 fontList · js/app.js)
        const SM_COLORS = ['#ff6b8b', '#ff9f43', '#ffd23f', '#4caf7a', '#3d9be0', '#8a6be0', '#5a3d4a', '#ffffff'];
        const smS = { built: false, mode: 'photo', img: null, shape: 'circle', zoom: 1, ox: 0, oy: 0, path: [], drawing: false, border: true,
            text: '', font: SM_DEF_FONT, color: SM_COLORS[0], out: '', outDie: '', die: false,
            many: null, cur: 0 };                                       // many : 여러 장 [{ img, shape, zoom, ox, oy, path }] · cur : 지금 고친 사진
        const smq = id => document.getElementById(id);

        /* ---------- 화면 ---------- */
        function smBuild() {
            if (smS.built) return;
            smS.built = true;
            const el = document.createElement('div');
            el.id = 'smRoom'; el.className = 'smk-room';
            el.innerHTML = `
              <div class="smk-bar"><span class="smk-x"></span><b>✂️ 스티커 만들기</b><button class="smk-x" type="button" onclick="closeStickerMaker()" aria-label="닫기">✕</button></div>
              <div class="smk-wrap">
                <input type="file" id="smCam" accept="image/*" capture="environment" hidden onchange="smPickFile(this)">
                <input type="file" id="smFile" accept="image/*" multiple hidden onchange="smPickFile(this)">
                <section id="smStep2" class="smk-step">
                  <div class="smk-strip" id="smStrip" hidden></div>
                  <div class="smk-stage"><canvas id="smCanvas" width="${SM_SIZE}" height="${SM_SIZE}"></canvas></div>
                  <p class="smk-hint" id="smHint"></p>
                  <div id="smPhotoOpts">
                    <div class="smk-chips" id="smShapes">${SM_SHAPES.map(s => `<button type="button" data-s="${s[0]}" onclick="smSetShape('${s[0]}')">${s[1]}</button>`).join('')}</div>
                    <label class="smk-zoom">🔍 <input type="range" id="smZoom" min="0.4" max="3" step="0.02" value="1" oninput="smS.zoom=+this.value;smDraw()"></label>
                    <button type="button" class="smk-all" id="smAll" hidden onclick="smAllSame()">🔁 이 모양 · 크기를 모든 사진에</button>
                  </div>
                  <div id="smTextA" class="smk-col" hidden>
                    <input id="smText" maxlength="12" placeholder="스티커 글씨 (예: 오늘도 화이팅!)" oninput="smS.text=this.value;smDraw()" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">
                  </div>
                  <div id="smTextB" class="smk-col" hidden>
                    <div class="smk-chips smk-fonts" id="smFonts"></div>
                    <div class="smk-colors" id="smColors">${SM_COLORS.map(c => `<button type="button" data-c="${c}" style="--c:${c}" onclick="smSetColor('${c}')" aria-label="색"></button>`).join('')}</div>
                    <label class="smk-zoom smk-tsz">글씨 크기 <small>작게</small><input type="range" id="smTsz" min="0.5" max="1.6" step="0.05" value="1" oninput="smS.tsz=+this.value;smDraw()"><small>크게</small></label>
                  </div>
                  <div id="smFinal" class="smk-col">
                    <label class="smk-border"><input type="checkbox" id="smBorder" checked onchange="smS.border=this.checked;smDraw()"> 하얀 테두리</label>
                    <div id="smPhotoGo" class="smk-col">
                      <div class="smk-two">
                        <button type="button" class="smk-go" id="smGoStick" onclick="smKindGo(true,this)"></button>
                        <button type="button" class="smk-go smk-sub" id="smGoMake" onclick="smKindGo(false,this)"></button>
                      </div>
                    </div>
                    <div id="smTextGo" class="smk-col">
                      <button type="button" class="smk-go" onclick="smFinish('text',this)">📌 다이어리에 붙이기</button>
                      <button type="button" class="smk-go smk-sub" onclick="smFinish('keep',this)">💾 씰스티커 내가만든에 저장만</button>
                    </div>
                  </div>
                </section>
              </div>`;
            document.body.appendChild(el);
            const cv = smq('smCanvas');
            cv.addEventListener('pointerdown', smDown); cv.addEventListener('pointermove', smMove);
            cv.addEventListener('pointerup', smUp); cv.addEventListener('pointercancel', smUp);
            cv.addEventListener('wheel', e => { if (smS.mode !== 'photo') return; e.preventDefault(); smS.zoom = Math.max(.4, Math.min(3, smS.zoom * (e.deltaY < 0 ? 1.06 : .94))); smq('smZoom').value = smS.zoom; smDraw(); }, { passive: false });
        }

        /* ---------- 사진 ---------- */
        function smPickFile(inp) {
            const fs = [...(inp.files || [])].filter(f => /^image\//.test(f.type)); inp.value = '';
            if (fs.length > 1) return smPickMany(fs);
            const f = fs[0];
            if (!f) return;
            const im = new Image();
            im.onload = () => {
                const c = document.createElement('canvas'), k = Math.min(1, 1000 / Math.max(im.width, im.height));
                c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
                c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(im.src);
                smS.mode = 'photo'; smS.img = c; smS.zoom = 1; smS.ox = 0; smS.oy = 0; smS.path = []; smS.many = null;
                smq('smZoom').value = 1; smPhase();
                smShow(); smSetShape(smS.shape === 'free' ? 'circle' : smS.shape);
            };
            im.onerror = () => showMsg('사진을 열지 못했어요. 다른 사진을 골라 주세요.');
            im.src = URL.createObjectURL(f);
        }
        /* 여러 장 : 스티커 만들기 창에서 사진 줄로 한 장씩 골라 고쳐요 */
        const smImg = f => new Promise(ok => {
            const im = new Image();
            im.onload = () => {
                const c = document.createElement('canvas'), k = Math.min(1, 1000 / Math.max(im.width, im.height));
                c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
                c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(im.src); ok(c);
            };
            im.onerror = () => { URL.revokeObjectURL(im.src); ok(null); };
            im.src = URL.createObjectURL(f);
        });
        async function smPickMany(fs) {
            if (fs.length > SM_MANY) showMsg(`사진은 한 번에 <b>${SM_MANY}장까지</b> 고를 수 있어요.<br><span style="font-size:12px;color:#777;">고른 ${fs.length}장 중 앞의 ${SM_MANY}장만 가져올게요.</span>`);
            const imgs = (await Promise.all(fs.slice(0, SM_MANY).map(smImg))).filter(Boolean);
            if (!imgs.length) { showMsg('사진을 열지 못했어요. 다른 사진을 골라 주세요.'); return; }
            const shape = smS.shape === 'free' ? 'circle' : smS.shape;
            smS.many = imgs.map(img => ({ img, shape, zoom: 1, ox: 0, oy: 0, path: [] })); smS.cur = 0;
            smS.mode = 'photo'; smPhase();
            smShow(); smGo(0);
            smStripDraw();
        }
        /* 사진 줄 그리기 · 사진 바꾸기 (지금 사진의 모양 · 자리 · 크기는 그 사진에 남아요) */
        function smStripDraw() {
            const el = smq('smStrip'); if (!el || !smS.many) return;
            el.innerHTML = smS.many.map((m, i) => `<button type="button" class="${i === smS.cur ? 'on' : ''}" onclick="smGo(${i})" aria-label="${i + 1}번째 사진"><img src="${m.th || (m.th = smThumb(m.img))}" alt=""><span>${i + 1}</span></button>`).join('');
        }
        function smThumb(img) { const c = document.createElement('canvas'), k = 112 / Math.min(img.width, img.height); c.width = c.height = 112; c.getContext('2d').drawImage(img, (112 - img.width * k) / 2, (112 - img.height * k) / 2, img.width * k, img.height * k); return c.toDataURL('image/jpeg', .8); }
        function smKeep() { const m = smS.many && smS.many[smS.cur]; if (m) Object.assign(m, { shape: smS.shape, zoom: smS.zoom, ox: smS.ox, oy: smS.oy, path: smS.path }); }
        function smLoadPhoto(i) {
            const m = smS.many[i]; smS.cur = i;
            Object.assign(smS, { img: m.img, shape: m.shape, zoom: m.zoom, ox: m.ox, oy: m.oy, path: m.path });
        }
        function smGo(i) {
            if (!smS.many) return;
            smKeep(); smLoadPhoto(i);
            smq('smZoom').value = smS.zoom;
            document.querySelectorAll('#smShapes button').forEach(b => b.classList.toggle('on', b.dataset.s === smS.shape));
            smq('smHint').textContent = smS.shape === 'free' ? '✂️ 손가락(마우스)으로 오리고 싶은 모양을 한 번에 빙 둘러 그려요' : `${i + 1}번째 사진 · 위 줄에서 다른 사진을 골라 따로 맞출 수 있어요`;
            smDraw(); smStripDraw();
        }
        function smAllSame() {
            if (!smS.many) return;
            if (smS.shape === 'free') { showMsg('✂️ 손으로 오리기는 사진마다 따로 그려 주세요.'); return; }
            smKeep(); smS.many.forEach(m => { m.shape = smS.shape; m.zoom = smS.zoom; m.path = []; });
            showMsg(`🔁 ${smS.many.length}장 모두 같은 모양 · 크기로 맞췄어요.<br><span style="font-size:12px;color:#777;">자리는 사진마다 그대로예요.</span>`);
        }
        /* 여러 장 완성 : 'stick' 씰로 붙이기(한 장 종이) · 'pstick' 조각으로 붙이기(봉투 하나) · 'pastick' 모조지스티커로 붙이기(모조지스티커 한 장) · 'piece' · 'seal' · 'paper' 만들기 */
        async function smManyFinish(act) {
            smKeep();
            const back = smS.cur, k = SM_STICK[act] || act;
            let out = [];
            for (let i = 0; i < smS.many.length; i++) {
                smLoadPhoto(i); smS.out = ''; smS.outDie = '';
                const src = smMake(k === 'paper' ? smS.border : true);
                if (!src) { smGo(i); showMsg(`✂️ ${i + 1}번째 사진의 모양을 먼저 그려 주세요.`); return; }
                out.push(src);
            }
            smLoadPhoto(back); smS.out = ''; smS.outDie = '';
            if (k === 'paper') out = await smPaperSheet(out); if (!out) return;
            const r = await smAdd(out, k);
            if (SM_STICK[act]) return smStickAs(k, out, r);
            if (r === 'ok') closeStickerMaker();
            smAddMsg(r, k, false);
        }
        function smSetShape(s) {
            smS.shape = s; smS.path = [];
            document.querySelectorAll('#smShapes button').forEach(b => b.classList.toggle('on', b.dataset.s === s));
            smq('smHint').textContent = s === 'free' ? '✂️ 손가락(마우스)으로 오리고 싶은 모양을 한 번에 빙 둘러 그려요' : s === 'orig' ? '🖼️ 사진 모양 그대로 스티커가 돼요 · 🔍 막대로 크기를 바꿔요' : '사진을 끌어서 자리를 맞추고, 🔍 막대로 크기를 바꿔요';
            smDraw();
        }
        /* 모양 길 (가운데 기준, 반지름 r) */
        function smShapePath(ctx, s, cx, cy, r) {
            ctx.beginPath();
            if (s === 'circle') ctx.arc(cx, cy, r, 0, Math.PI * 2);
            else if (s === 'heart') { ctx.moveTo(cx, cy + r * .9); ctx.bezierCurveTo(cx - r * 1.35, cy + r * .05, cx - r * .95, cy - r * 1.05, cx, cy - r * .42); ctx.bezierCurveTo(cx + r * .95, cy - r * 1.05, cx + r * 1.35, cy + r * .05, cx, cy + r * .9); }
            else if (s === 'star') { for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .5 : r, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } }
            else if (s === 'round') { const w = r * 1.7, h = r * 1.7, x = cx - w / 2, y = cy - h / 2, q = r * .35; ctx.moveTo(x + q, y); ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q); ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q); }
            else if (s === 'orig') { const R = smPhotoRect(), q = Math.min(10, R.w / 4, R.h / 4); ctx.moveTo(R.x + q, R.y); ctx.arcTo(R.x + R.w, R.y, R.x + R.w, R.y + R.h, q); ctx.arcTo(R.x + R.w, R.y + R.h, R.x, R.y + R.h, q); ctx.arcTo(R.x, R.y + R.h, R.x, R.y, q); ctx.arcTo(R.x, R.y, R.x + R.w, R.y, q); }   // 🖼 원본 그대로 : 사진 네모 (모서리만 살짝 둥글게)
            else if (s === 'cloud') { [[-.5, .15, .45], [0, -.2, .58], [.5, .1, .48], [-.15, .35, .5], [.3, .38, .45]].forEach(([a, b, c]) => { ctx.moveTo(cx + a * r + c * r, cy + b * r); ctx.arc(cx + a * r, cy + b * r, c * r, 0, Math.PI * 2); }); }
            ctx.closePath();
        }
        function smFreePath(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
        function smPhotoRect() {
            const im = smS.img, base = smS.shape === 'orig' ? SM_SIZE * .86 / Math.max(im.width, im.height) : SM_SIZE / Math.min(im.width, im.height), k = base * smS.zoom;   // 원본 그대로는 사진 전체가 보이게
            const w = im.width * k, h = im.height * k;
            return { x: (SM_SIZE - w) / 2 + smS.ox, y: (SM_SIZE - h) / 2 + smS.oy, w, h };
        }
        /* 스티커 한 장 그리기 (ctx : SM_SIZE 크기) · guide = 편집 중 안내선 */
        function smRender(ctx, guide) {
            const S = SM_SIZE, c = S / 2, r = S * .42;
            ctx.clearRect(0, 0, S, S);
            if (smS.mode === 'text') { smRenderText(ctx); return; }
            const R = smPhotoRect();
            const free = smS.shape === 'free', pts = smS.path, closed = free && pts.length > 8 && !smS.drawing;
            const clip = () => free ? smFreePath(ctx, pts) : smShapePath(ctx, smS.shape, c, c, r);
            if (free && !closed) {                                      // 오리기 전 : 사진 전체 + 그리는 선
                ctx.globalAlpha = .9; ctx.drawImage(smS.img, R.x, R.y, R.w, R.h); ctx.globalAlpha = 1;
                if (pts.length > 1) { ctx.save(); ctx.setLineDash([6, 5]); ctx.lineWidth = 3; ctx.strokeStyle = '#ff6b8b'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore(); }
                return;
            }
            if (guide) { ctx.save(); ctx.globalAlpha = .22; ctx.drawImage(smS.img, R.x, R.y, R.w, R.h); ctx.restore(); }
            if (smS.border || smS.die) {                                    // 🏷️ 씰 · 🧩 조각은 하얀 칼선이 늘 있어요 (그림자 없이 · 떼는 화면이 그림자를 그려요)
                ctx.save(); clip(); ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#fff';
                if (!smS.die) { ctx.shadowColor = 'rgba(0,0,0,.22)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; }
                ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
            }
            ctx.save(); clip(); ctx.clip(); ctx.drawImage(smS.img, R.x, R.y, R.w, R.h); ctx.restore();
        }
        function smRenderText(ctx) {
            const S = SM_SIZE, t = smS.text || '오늘도 말랑!';
            let size = Math.round(64 * (smS.tsz || 1)); ctx.font = `${size}px ${smS.font}`;   // 🔠 글씨 크기 (작게 0.5 ~ 크게 1.6 · 10-23 도련) · 줄에 안 들어가면 들어갈 만큼 줄여요
            while (size > 12 && ctx.measureText(t).width > S - 50) { size -= 2; ctx.font = `${size}px ${smS.font}`; }
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
            if (smS.border) { ctx.lineWidth = size * .42; ctx.strokeStyle = '#fff'; ctx.strokeText(t, S / 2, S / 2); }   // 🔤 글씨스티커는 그림자 없이
            ctx.lineWidth = size * .12; ctx.strokeStyle = smS.color === '#ffffff' ? '#ff9ab3' : 'rgba(0,0,0,.18)'; ctx.strokeText(t, S / 2, S / 2);
            ctx.fillStyle = smS.color; ctx.fillText(t, S / 2, S / 2);
        }
        function smDraw() { const cv = smq('smCanvas'); if (cv) smRender(cv.getContext('2d'), true); smS.out = ''; smS.outDie = ''; }

        /* 끌기 : 사진 옮기기 · 손으로 오리기 */
        function smPt(e) { const cv = smq('smCanvas'), r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * SM_SIZE / r.width, (e.clientY - r.top) * SM_SIZE / r.height]; }
        function smDown(e) {
            if (smS.mode !== 'photo') return;
            e.preventDefault(); try { smq('smCanvas').setPointerCapture(e.pointerId); } catch (er) {}
            const p = smPt(e);
            if (smS.shape === 'free') { smS.drawing = true; smS.path = [p]; }
            else smS.drag = { x: p[0], y: p[1], ox: smS.ox, oy: smS.oy };
            smDraw();
        }
        function smMove(e) {
            if (!smS.drawing && !smS.drag) return;
            const p = smPt(e);
            if (smS.drawing) { const l = smS.path[smS.path.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 2) smS.path.push(p); }
            else { smS.ox = smS.drag.ox + p[0] - smS.drag.x; smS.oy = smS.drag.oy + p[1] - smS.drag.y; }
            smDraw();
        }
        function smUp() {
            if (smS.drawing) { smS.drawing = false; if (smS.path.length < 9) { smS.path = []; smq('smHint').textContent = '✂️ 조금 더 크게 빙 둘러 그려 주세요'; } else smq('smHint').textContent = '✂️ 다시 그리면 새로 오려요'; }
            smS.drag = null; smDraw();
        }

        /* ---------- 글씨 스티커 ---------- */
        function smStartText() {
            smS.mode = 'text'; smPhase();
            smq('smText').value = smS.text;
            const tz = smq('smTsz'); if (tz) tz.value = smS.tsz || 1;
            if (!smS.fontsBuilt) { smS.fontsBuilt = true; smFillFonts(); }
            smShow(); smSetFont(smS.font); smSetColor(smS.color);
            if (window.matchMedia && matchMedia('(pointer: fine)').matches) setTimeout(() => smq('smText').focus(), 50);   // 📱 터치 기기는 키보드가 저절로 올라와 화면이 움직이지 않게 직접 눌러서 써요
        }
        /* 글씨 스티커는 한 화면 : 미리보기 · 글 쓰기 · 글꼴 · 색 · 테두리를 고르고 바로 붙이기 (사진 스티커도 한 화면) */
        function smPhase() {
            const t = smS.mode === 'text';
            smq('smPhotoOpts').hidden = t;
            smq('smTextA').hidden = !t; smq('smTextB').hidden = !t;
            smq('smPhotoGo').hidden = t; smq('smTextGo').hidden = !t;
            smq('smGoStick').innerHTML = smKindBtn(true); smq('smGoMake').innerHTML = smKindBtn(false);
            const many = !t && !!smS.many;                            // 여러 장 : 사진 줄 · 🔁 버튼이 보여요
            smq('smStrip').hidden = !many; smq('smAll').hidden = !many;
            if (t) smq('smHint').innerHTML = '⌨️ 글씨를 다 쓰면 키보드의 <b>엔터(↵)</b>를 눌러 주세요<br><small>아이패드의 \'키보드 내리기\' 버튼으로 내리면 버튼 누르는 자리가 어긋날 수 있어요</small>';
        }
        /* 글꼴 후보 : 설정창 글꼴 목록(fontList · js/app.js) 중 웹폰트 전부 (기기마다 다른 (Local) · (Apple) 글꼴은 빼요) */
        function smFillFonts() {
            const L = fontList.filter(f => /\[/.test(f.name)), box = smq('smFonts'); if (!box) return;
            box.innerHTML = '';
            L.forEach(f => {
                const b = document.createElement('button');
                b.type = 'button'; b.dataset.f = f.css; b.style.fontFamily = f.css; b.textContent = f.name.replace(/\s*\[.*\]\s*/, '');
                b.onclick = () => smSetFont(f.css); box.appendChild(b);
            });
        }
        function smSetFont(f) {
            smS.font = f; document.querySelectorAll('#smFonts button').forEach(b => b.classList.toggle('on', b.dataset.f === f));
            smDraw();
            if (document.fonts && document.fonts.load) document.fonts.load(`40px ${f}`).then(() => { if (smS.font === f) smDraw(); }).catch(() => {});   // 웹폰트가 늦게 오면 다시 그림
        }
        function smSetColor(c) { smS.color = c; document.querySelectorAll('#smColors button').forEach(b => b.classList.toggle('on', b.dataset.c === c)); smDraw(); }

        /* ---------- 완성 ---------- */
        function smMake(die) {                                         // 투명 바탕 PNG · 빈 곳은 잘라내기 (die : 🏷️ · 🧩 하얀 칼선을 늘 둘러요)
            const key = die ? 'outDie' : 'out';
            if (smS[key]) return smS[key];
            if (smS.mode === 'photo' && smS.shape === 'free' && smS.path.length < 9) return '';
            const c = document.createElement('canvas'); c.width = c.height = SM_SIZE;
            const x = c.getContext('2d'); smS.die = !!die; smRender(x, false); smS.die = false;
            const d = x.getImageData(0, 0, SM_SIZE, SM_SIZE).data;
            let x0 = SM_SIZE, y0 = SM_SIZE, x1 = 0, y1 = 0;
            for (let y = 0; y < SM_SIZE; y++) for (let i = 0; i < SM_SIZE; i++) if (d[(y * SM_SIZE + i) * 4 + 3] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
            if (x1 <= x0 || y1 <= y0) return '';
            const w = x1 - x0 + 1, h = y1 - y0 + 1, k = Math.min(1, SM_OUT / Math.max(w, h));
            const o = document.createElement('canvas'); o.width = Math.round(w * k); o.height = Math.round(h * k);
            o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, o.width, o.height);
            return (smS[key] = o.toDataURL('image/png'));
        }
        /* 보관 창 칸 5개 (모든 보관 창 공통 · 속지 · 떡메 창도 같은 이름 js/leafpad.js)
           기본 = 처음부터 있는 것 · 내가만든 = 내가 만든 것 · 공유받은 = 다른 사람이 공유한 것 · 이벤트 = 개발자가 이벤트로 준 기간 있는 선물 · 문구점 = 🛍️ 문구점 */
        const STK_TABS = [['free', '기본'], ['mine', '내가만든'], ['share', '공유받은'], ['event', '이벤트'], ['shop', '문구점']];
        const stkTabName = tab => STK_TABS.find(x => x[0] === tab)[1];
        /* 🆓 지금은 무료 앱으로 : 앱 전체(스티커 · 속지 · 떡메 · 페이지 · 배경지 창)의 🎁 이벤트 · 🛍️ 문구점 칸은 숨겨 둬요 (이 줄을 비우면 다시 보여요 · 도련 · 2026-10-10)
           has(칸) : 이미 받은 게 든 칸은 보여요 (받은 걸 쓸 곳이 없어지지 않게) */
        const STK_HIDE = ['event', 'shop'];
        /* 🔓 숨긴 기능의 칸 (js/features.js) : 스티커 · 속지 · 떡메 창(win 'stk')의 '내가만든' (✂️ 스티커 만들기) · 모든 창의 '공유받은' (카페로 주고받기)
           has(칸) : 든 게 있는 칸은 보여요 (🌟 등록된 모두의 페이지 등) */
        function stkOff(v, win) {
            if (typeof ftOn !== 'function') return false;
            return (v === 'mine' && win === 'stk' && !ftOn('stkmake')) || (v === 'share' && !ftOn('share'));
        }
        const stkTabsOn = (has, win) => STK_TABS.filter(([v]) => (STK_HIDE.includes(v) || stkOff(v, win)) ? !!(has && has(v)) : true);

        /* 💾/📌 버튼을 누르면 '저장하는 중…'으로 바뀌고 끝날 때까지 다시 못 눌러요 (눌렸는지 바로 보이고 두 번 저장도 막음) */
        let smkLock = false;
        async function smkRun(btn, label, fn) {
            if (smkLock) return;
            smkLock = true;
            const all = [...document.querySelectorAll('.smk-room .smk-go')], old = btn ? btn.textContent : '';
            all.forEach(b => { b.disabled = true; });
            if (btn) { btn.classList.add('busy'); btn.textContent = label; }
            try { await fn(); }
            finally { smkLock = false; all.forEach(b => { b.disabled = false; }); if (btn) { btn.classList.remove('busy'); btn.textContent = old; } }
        }
        function smFinish(act, btn) { return smkRun(btn, SM_STICK[act] || act === 'text' ? '📌 붙이는 중…' : '💾 저장하는 중…', () => smDoFinish(act)); }
        /* 🎒 만든 씰 → 🧺 바구니에 종이 한 장 (js/own.js) · smAdd.last = 넣은 종이 id (📌 붙이기는 그 종이를 바로 열어요) */
        async function smAdd(src, k, t) {
            smAdd.last = '';
            if (!window.ownTakeMine) return 'fail';
            try {
                const srcs = (Array.isArray(src) ? src : [src]).filter(Boolean);
                if (k === 'piece') smAdd.last = await ownTake({ k: 'piece', from: 'mine', imgs: srcs, baked: true, nm: '내가 만든 조각' });   // 🧩 봉투 하나
                else if (k === 'paper') smAdd.last = await ownTake({ k: 'paper', from: 'mine', imgs: [srcs[0]] });              // 📄 인쇄된 모조지 한 장
                else smAdd.last = await ownTakeMine(srcs, { ts: !!t, nm: (t || '').slice(0, 20) });                              // 🏷️ 씰 종이 한 장
                return 'ok';
            }
            catch (e) { console.warn(e); smAdd.err = e; return 'fail'; }
        }
        /* 저장 결과 안내 (stick : 붙이는 중이면 실패만 알려요) */
        function smAddMsg(r, k, stick) {
            if (r === 'fail') showMsg('⚠ 스티커를 바구니에 넣지 못했어요.<br>' + (window.ownErrText ? ownErrText(smAdd.err) : ''));
            else if (r === 'ok' && !stick) showMsg('✂️ 만든 스티커를 <b>🧺 바구니</b>에 넣었어요!<br><span style="font-size:12px;color:#777;">하단메뉴 ✨ 스티커 → 🗄️ 내 서랍에서 떼어 붙여요.<br>한 번 붙이면 사라지니 또 쓰려면 또 만들어요.</span>');
        }
        /* act : 'stick' 씰로 붙이기 · 'pstick' 조각으로 붙이기 · 'piece' · 'seal' · 'paper' 만들기 / 글씨 스티커는 'text' 붙이기 · 'keep' 저장만 */
        const SM_STICK = { stick: 'seal', pstick: 'piece', pastick: 'paper' };
        /* 🧩 · 🏷️ · 📄 스티커 만들기 (도련 10-21) : ✂️ 스티커만들기 창에서 종류를 먼저 고르고 → 📸 포토부스 · 📷 사진찍기 · 🖼️ 앨범
           → 결과창 버튼은 고른 종류의 2개 : 다이어리에 붙이기 · 만들기(🧺 바구니에 넣기) (📸 포토부스도 같아요 · js/photobooth.js) */
        const SM_KIND = { piece: ['🧩', '조각스티커', 'pstick'], seal: ['🏷️', '씰스티커', 'stick'], paper: ['📄', '모조지스티커', 'pastick'] };
        let smKind = 'seal';
        function smPickKind(k) {
            smKind = SM_KIND[k] ? k : 'seal';
            const t = smq('stickerSrcTitle'); if (t) t.textContent = SM_KIND[smKind][0] + ' ' + SM_KIND[smKind][1] + ' 만들기';
            openModal('stickerSrcModal');
        }
        const smKindAct = stick => stick ? SM_KIND[smKind][2] : smKind;            // 붙이기 : 'pstick' · 'stick' · 'pastick' / 만들기 : 'piece' · 'seal' · 'paper'
        const smKindBtn = stick => { const [i, n] = SM_KIND[smKind]; return stick ? `${i}<br>${n}로<br>다이어리에 붙이기` : `${i}<br>${n}<br>만들기`; };
        function smKindGo(stick, btn) { return smFinish(smKindAct(stick), btn); }
        /* 📄 모조지스티커 : 오린 그림들 → 모조지스티커 한 장 [src] (js/papermaker.js) */
        async function smPaperSheet(srcs) {
            if (!window.pmMakeSheet) { comingSoon('📄 모조지스티커'); return null; }
            try { return [await pmMakeSheet(srcs)]; } catch (e) { showMsg('모조지스티커를 만들지 못했어요.'); return null; }
        }
        function smStickAs(k, srcs, r) {                                  // 🎒 바구니에 넣은 종이를 바로 열어 떼어 붙여요 (js/basket.js bkOpenSheet)
            smAddMsg(r, k, true);
            if (r !== 'ok') return;
            closeStickerMaker();
            if (window.bkOpenSheet && smAdd.last) bkOpenSheet(smAdd.last);
        }
        async function smDoFinish(act) {
            if (smS.many && smS.mode === 'photo') return smManyFinish(act);
            if (smS.mode === 'text' && !(smS.text || '').trim()) { showMsg('스티커에 쓸 글씨를 먼저 써 주세요.'); return; }
            const k = SM_STICK[act] || (act === 'piece' || act === 'seal' || act === 'paper' ? act : '') || (smS.mode === 'text' ? 'seal' : '');   // 🔤 글씨스티커는 🏷️ 씰스티커 → 내가만든에 보관
            let src = smMake(k === 'paper' ? smS.border : !!k);
            if (!src) { showMsg(smS.shape === 'free' ? '✂️ 오리고 싶은 모양을 먼저 그려 주세요.' : '스티커를 만들지 못했어요.'); return; }
            if (k === 'paper') { const o = await smPaperSheet([src]); if (!o) return; src = o[0]; }
            const r = await smAdd(src, k, smS.mode === 'text' ? smS.text : '');
            if (SM_STICK[act]) return smStickAs(k, [src], r);
            if (act === 'text') return smStickAs('seal', [src], r);      // 🔤 글씨스티커도 하얀 스티커 대지째 나와서 떼어 붙여요
            if (r === 'ok') closeStickerMaker();
            smAddMsg(r, k, false);
        }
        /* ---------- ↩️ 바구니로 다시 : 🧺 바구니에서 종이를 열면 바구니는 비켜 주고, 떼는 창(🏷️ 흰 종이 …)이 닫히면 다시 떠요 ---------- */
        const STK_BLINK = 700;
        let stkBackOn = false;
        function stkLeave() {                                              // 🧺 바구니 → 떼는 창으로 (바구니가 떠 있을 때만 돌아올 자리로 기억)
            const m = smq('basketKindModal'); if (!m || m.style.display !== 'flex') return;
            closeModal('basketKindModal'); stkBackOn = true;
        }
        function stkReturn(delay) {
            if (!stkBackOn) return; stkBackOn = false;
            setTimeout(() => {
                if (document.body.classList.contains('fc-lock') || [...document.querySelectorAll('.modal')].some(m => m.style.display === 'flex')) return;   // 그사이 다른 창이 떴으면 그대로
                if (window.bkReopen) bkReopen(); else if (window.openBasket) openBasket();   // 보던 종류 바구니로
            }, delay || 280);
        }
        function stkBlink() { stkLeave(); stkReturn(STK_BLINK); }
        window.stkLeave = stkLeave; window.stkReturn = stkReturn; window.stkBlink = stkBlink;

        /* ✂️ 스티커만들기 창의 📷 · 🖼️ · 🔤 버튼 (사진 고르는 창은 눌렀을 때 바로 열려야 해서 화면을 먼저 만들어 둬요) */
        function smOpenCam() { smBuild(); smq('smCam').click(); }
        function smOpenFile() { smBuild(); smq('smFile').click(); }
        function smOpenText() { smBuild(); smStartText(); }
        function smShow() {
            smBuild();
            smq('smRoom').classList.add('show'); smq('smRoom').querySelector('.smk-wrap').scrollTop = 0;
            document.body.classList.add('fc-lock');
        }
        function closeStickerMaker() {
            const r = smq('smRoom'); if (r) r.classList.remove('show');
            document.body.classList.remove('fc-lock');
        }
        window.smPickKind = smPickKind; window.smKindGo = smKindGo; window.smKindAct = smKindAct; window.smKindBtn = smKindBtn;
        window.smGo = smGo; window.smAllSame = smAllSame; window.smOpenCam = smOpenCam; window.smOpenFile = smOpenFile; window.smOpenText = smOpenText;
        window.smAdd = smAdd; window.smAddMsg = smAddMsg;
