/* 말랑달콤 다이어리 - js/deskpaint.js
   🎨 책상 소품 꾸미기 (도련 10-27 · 🛠 책상 꾸미기에서 소품을 고르고 🎨 꾸미기)
   - 소품 그림(PNG 투명한 곳 = 마스크) 안에서만 칠해져요 : 🖌 붓 (색 · 굵기) · 🧽 지우개 (이번에 칠한 것만) · 🖼 이미지 (내 컴퓨터 그림을 올려 크기 · 회전 · 위치 → 📌 붙이기)
   - 외곽선(어두운 선)은 칠 위에 그대로 다시 얹어서 진짜 칠한 것처럼 보여요
   - 닫기 = 칠한 모습을 그림 한 장으로 합쳐 책상에 미리 보여 줘요 (어울리는지 전체로 보기 · 다시 열면 이어서 칠해요 · 도련 10-28)
     🛠 책상 꾸미기 하단 ✔ 완료 = 그 소품의 원래 파일에 덮어써요 (js/desk.js dkArtDraft · dkArtCommit) · ✕ 취소 = 처음 그림
       종류 폴더 / 받은-<c>.json 의 item = 🔐 { s: 암호 } → 열면 { u, id, from, img } (스티커처럼 계정마다 다른 열쇠) · 🎁 기본세트 소품은 처음 칠할 때 선물.json 에서 빠져 종류 폴더에 자기 파일이 생겨요
       목록(배치.json)에는 p: 1 (칠함) 만 · 그림은 그 파일에서 읽어요 (js/desk.js dkArtLoad)
   - 창마다 완료는 없어요 : 완료는 하단 하나 · 닫기 = 오른쪽 위 ✕ 하나 (도련 10-28) */

        const DP = { o: null, W: 0, H: 0, base: null, ink: null, paint: null, tmp: null, view: null, tool: 'brush', color: '#ff9fbd', size: 22, decal: null, dirty: false, last: null, k: 1 };
        const DP_COLORS = ['#ff9fbd', '#ffd36b', '#9bd9b5', '#9ccfee', '#c9b3f2', '#ffffff', '#f6e6d0', '#8a5a3c', '#5e4250', '#e2557f'];
        const dpCv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

        function dpOpen(u) {
            const o = DK.items.find(x => x.u === u); if (!o) return;
            const im = new Image();
            im.onload = () => dpBuild(o, im);
            im.onerror = () => { if (window.showMsg) showMsg('⚠ 소품 그림을 불러오지 못했어요.'); };
            im.src = dkSrc(o);
        }
        function dpBuild(o, im) {
            const W = im.naturalWidth, H = im.naturalHeight;
            Object.assign(DP, { o, W, H, decal: null, dirty: false, tool: 'brush' });
            DP.base = dpCv(W, H); DP.base.getContext('2d').drawImage(im, 0, 0);
            DP.paint = dpCv(W, H); DP.tmp = dpCv(W, H);
            DP.ink = dpCv(W, H);                                                  // 외곽선 = 어두운 곳 (어두울수록 진하게)
            const src = DP.base.getContext('2d').getImageData(0, 0, W, H), d = src.data, ink = new ImageData(W, H), e = ink.data;
            for (let i = 0; i < d.length; i += 4) {
                const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255, dk = Math.max(0, Math.min(1, (0.62 - lum) / 0.3));
                e[i] = d[i]; e[i + 1] = d[i + 1]; e[i + 2] = d[i + 2]; e[i + 3] = d[i + 3] * dk;
            }
            DP.ink.getContext('2d').putImageData(ink, 0, 0);
            let w = document.getElementById('dpWrap');
            if (!w) { w = document.createElement('div'); w.id = 'dpWrap'; w.className = 'dp-wrap'; document.body.appendChild(w); }
            w.innerHTML = `<div class="dp-card" role="dialog" aria-label="소품 꾸미기"><button type="button" class="dp-x" data-a="ok" aria-label="닫기">✕</button>
                <div class="dp-head"><b>🎨 ${dkName(o)} 꾸미기</b><small>소품 모양 안에만 칠해져요 · 닫고 책상에서 어울리는지 봐요</small></div>
                <div class="dp-stage"><canvas id="dpView"></canvas></div>
                <div class="dp-tabs"><button type="button" data-t="brush">🖌 붓</button><button type="button" data-t="erase">🧽 지우개</button><button type="button" data-t="img">🖼 이미지</button></div>
                <div class="dp-row dp-pen"><span class="dp-sw">${DP_COLORS.map(c => `<button type="button" style="--c:${c}" data-c="${c}" aria-label="색 ${c}"></button>`).join('')}<label class="dp-more" title="다른 색"><input type="color" value="${DP.color}"></label></span></div>
                <div class="dp-row dp-sz"><small>굵기</small><input type="range" min="2" max="90" value="${DP.size}" data-k="size"></div>
                <div class="dp-row dp-im" hidden><label class="btn dp-file">📁 이미지 고르기<input type="file" accept="image/*" hidden></label>
                    <small>크기</small><input type="range" min="5" max="300" value="100" data-k="ds"><small>회전</small><input type="range" min="-180" max="180" value="0" data-k="dr">
                    <button type="button" class="btn dp-stick" disabled>📌 붙이기</button></div></div>`;
            DP.view = w.querySelector('#dpView'); DP.view.width = W; DP.view.height = H;
            const k = Math.min((Math.min(innerWidth, 680) - 56) / W, (innerHeight * .5) / H, 3); DP.k = k;
            DP.view.style.width = Math.round(W * k) + 'px'; DP.view.style.height = Math.round(H * k) + 'px';
            w.querySelectorAll('.dp-tabs button').forEach(b => b.onclick = () => dpTool(b.dataset.t));
            w.querySelectorAll('.dp-sw [data-c]').forEach(b => b.onclick = () => dpColor(b.dataset.c));
            w.querySelector('.dp-more input').oninput = e => dpColor(e.target.value);
            w.querySelector('[data-k="size"]').oninput = e => { DP.size = +e.target.value; };
            w.querySelector('[data-k="ds"]').oninput = e => { if (DP.decal) { DP.decal.s = DP.decal.s0 * e.target.value / 100; dpRender(); } };
            w.querySelector('[data-k="dr"]').oninput = e => { if (DP.decal) { DP.decal.r = e.target.value * Math.PI / 180; dpRender(); } };
            w.querySelector('.dp-file input').onchange = e => dpPick(e.target.files && e.target.files[0]);
            w.querySelector('.dp-stick').onclick = dpStick;
            w.querySelector('[data-a="ok"]').onclick = dpDone;
            dpWire(DP.view);
            dpTool('brush'); dpColor(DP.color); dpRender();
            w.classList.add('on');
        }
        function dpTool(t) {
            DP.tool = t; const w = document.getElementById('dpWrap'); if (!w) return;
            w.querySelectorAll('.dp-tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
            w.querySelector('.dp-pen').hidden = t !== 'brush'; w.querySelector('.dp-sz').hidden = t === 'img'; w.querySelector('.dp-im').hidden = t !== 'img';
            DP.view.style.cursor = t === 'img' ? 'move' : 'crosshair';
        }
        function dpColor(c) { DP.color = c; document.querySelectorAll('#dpWrap .dp-sw [data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === c)); }
        /* 화면 그리기 : 소품 → (칠 + 올린 이미지를 소품 모양으로 자르기) → 외곽선 */
        function dpCompose(ctx, withDecal) {
            const t = DP.tmp.getContext('2d');
            t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, DP.W, DP.H);
            t.drawImage(DP.paint, 0, 0);
            if (withDecal && DP.decal) dpDecalDraw(t);
            t.globalCompositeOperation = 'destination-in'; t.drawImage(DP.base, 0, 0); t.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, DP.W, DP.H);
            ctx.drawImage(DP.base, 0, 0); ctx.drawImage(DP.tmp, 0, 0); ctx.drawImage(DP.ink, 0, 0);
        }
        function dpRender() { if (DP.view) dpCompose(DP.view.getContext('2d'), true); }
        function dpDecalDraw(ctx) {
            const d = DP.decal; ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.r); ctx.scale(d.s, d.s);
            ctx.drawImage(d.img, -d.img.naturalWidth / 2, -d.img.naturalHeight / 2); ctx.restore();
        }
        const dpPt = (cv, ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * DP.W / r.width, (ev.clientY - r.top) * DP.H / r.height]; };
        function dpWire(cv) {
            let on = null;
            cv.addEventListener('pointerdown', ev => {
                ev.preventDefault(); try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
                const p = dpPt(cv, ev);
                if (DP.tool === 'img') { if (DP.decal) on = { id: ev.pointerId, p, x: DP.decal.x, y: DP.decal.y }; return; }
                on = { id: ev.pointerId }; DP.last = p; dpDot(p, p);
            });
            cv.addEventListener('pointermove', ev => {
                if (!on || ev.pointerId !== on.id) return; const p = dpPt(cv, ev);
                if (DP.tool === 'img') { DP.decal.x = on.x + p[0] - on.p[0]; DP.decal.y = on.y + p[1] - on.p[1]; dpRender(); return; }
                dpDot(DP.last, p); DP.last = p;
            });
            const up = ev => { if (on && ev.pointerId === on.id) on = null; };
            cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
        }
        function dpDot(a, b) {                                                    // 붓 · 지우개 한 획 (지우개는 이번에 칠한 것만 지워요)
            const c = DP.paint.getContext('2d'), w = DP.size / DP.k;
            c.save(); c.lineCap = c.lineJoin = 'round'; c.lineWidth = w;
            c.globalCompositeOperation = DP.tool === 'erase' ? 'destination-out' : 'source-over';
            c.strokeStyle = DP.color; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0] + .01, b[1]); c.stroke(); c.restore();
            DP.dirty = true; dpRender();
        }
        function dpPick(f) {
            if (!f) return; const r = new FileReader();
            r.onload = () => { const im = new Image(); im.onload = () => {
                const s0 = Math.min(DP.W / im.naturalWidth, DP.H / im.naturalHeight) * .6;
                DP.decal = { img: im, x: DP.W / 2, y: DP.H / 2, s: s0, s0, r: 0 };
                const w = document.getElementById('dpWrap'); w.querySelector('[data-k="ds"]').value = 100; w.querySelector('[data-k="dr"]').value = 0; w.querySelector('.dp-stick').disabled = false;
                dpRender();
            }; im.src = r.result; };
            r.readAsDataURL(f);
        }
        function dpStick() {                                                      // 📌 올린 이미지를 칠 위에 붙여요 (그다음 다른 이미지도 또)
            if (!DP.decal) return; dpDecalDraw(DP.paint.getContext('2d')); DP.decal = null; DP.dirty = true;
            const b = document.querySelector('#dpWrap .dp-stick'); if (b) b.disabled = true; dpRender();
        }
        function dpClose() { const w = document.getElementById('dpWrap'); if (w) { w.classList.remove('on'); w.innerHTML = ''; } DP.o = null; DP.view = null; }
        async function dpDone() {                                                 // ✕ 닫기 = 책상에 미리 보기 (저장은 하단 ✔ 완료)
            if (!DP.dirty && !DP.decal) { dpClose(); return; }
            const out = dpCv(DP.W, DP.H); dpCompose(out.getContext('2d'), true);
            let url = out.toDataURL('image/webp', .9); if (!/^data:image\/webp/.test(url)) url = out.toDataURL('image/png');
            const o = DP.o; dpClose();
            try { await dkArtDraft(o, url); } catch (e) { console.warn(e); if (window.showMsg) showMsg('⚠ 꾸민 소품을 저장하지 못했어요.'); }
        }
        /* 저장 : 그 소품의 종류 폴더 파일에 덮어쓰기 (🎁 선물이면 처음 한 번 선물.json 에서 빼고 파일 만들기) */
        async function dpSave(o, url) {
            const C = dkColl(o.id); if (!C) throw new Error('coll');
            const gift = !!o.g;
            DK.art[o.u] = url; dkArtPaint(o.u);
            if (o.c && !gift) {                                                   // 그림만 바꾸고 나머지(받은 곳 · 나중에 붙을 정보)는 그대로 · 🔐 다시 암호화
                let old = null; try { old = await dkUnseal(await collItem(C, o.c)); } catch (e) { console.warn(e); }
                const item = Object.assign({}, old && old.u === o.u ? old : { u: o.u, id: o.id, from: 'basic' }, { img: url, painted: Date.now() });
                await collSet(C, o.c, await dkSeal(item), '', { id: o.id });
            } else { delete o.g; o.c = await collAdd(C, await dkSeal({ u: o.u, id: o.id, from: 'gift', img: url, painted: Date.now() }), '', { id: o.id }); }
            o.p = 1;
            dkPersist(o);
            if (gift) giftWrite();
            if (window.deskBoxRender) deskBoxRender(); if (window.deskEditPaint) deskEditPaint();
        }
        window.dpOpen = dpOpen; window.dpSave = dpSave;
