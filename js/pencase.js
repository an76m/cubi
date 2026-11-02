/* 말랑달콤 다이어리 - js/pencase.js
   👝 보관함 : 가진 필기구를 모두 보관하는 틴 케이스 → 연필꽂이에 꽂을 것만 골라요 (도련 · 2026-10-15 · 10-19 필통 → 보관함)
   - ✏️ 연필꽂이 앞 '보관함' 버튼(js/draw.js pc-box)을 누르면 보이는 쪽(📱 폰 = 오른쪽) 한가운데에 열린 채로 나와요 · 뚜껑 · 고무밴드 · ✕ 없음
   - 안에는 필기구가 한 줄로 세로로 서 있어요 · 안쪽 어디든 좌우로 밀면 끝없이 빙글빙글 넘어가요 (끝에 닿으면 처음 것이 다시 와요 · 휠 · ← → 키도)
     위 이름표(🗂 색연필 · 형광펜 · 지우개)를 누르면 그 종류로 휙 · 가운데 있는 종류에 불 · 숫자 = 그 종류에서 꽂은 개수
     톡 누르면 연필꽂이에 꽂기 / 빼기 (꽂은 것은 쏙 올라오고 하트 꼬리표) · 도구가 늘어도 줄만 길어져요
   - ✂️ 칼 · 📏 자는 연필꽂이 · 보관함에 없어요 → 🗄️ 문구함 서랍에서 펀칭기 · 가위처럼 꺼내 써요 (js/skins.js · 도련 10-19)
   - 도구 종류는 PK_KINDS 한 곳 · 새 색을 넣으면 저절로 나와요
   - '닫기' 를 누르면 저장 → 연필꽂이에는 고른 것만 다시 꽂혀요 (js/draw.js pcList · penSetTool)
   - 연필꽂이에는 1 ~ 24 개 (너무 많으면 고르기 어려워요)
   저장 : 'diary_pencase'(설정.json) · 게스트는 이 기기 'malang_pencase' · 값 = 꽂은 도구 이름 목록 ['pen:#333333', 'hi:#ffe14d', 'erase:0', …]
   ※ 이 파일이 없어도 다이어리는 정상 동작 (기본 필기구 그대로) */

        const PK_KEY = 'diary_pencase', PK_LOCAL = 'malang_pencase', PK_MAX = 24;
        /* 🧁 필기구 = 서버 상품 (상품공방 '문구' · 문구종류 pen 색연필 · hi 형광펜 · erase 지우개 · 도련 11-02) : 색 · 지우개 크기(틀.size) · 그림은 앱이 색으로 그려요 */
        const pkOf = k => (window.prodList ? prodList('문구') : []).filter(x => x.P.문구종류 === k);   // 📦 내 사본이 있으면 사본 (js/prod.js)
        /* 🗂 보관함 칸 (보이는 순서) · list = 그 종류 도구들 */
        const PK_KINDS = [
            { k: 'pen', lb: '색연필', list: () => pkOf('pen').map(x => ({ id: x.id, tool: 'pen', color: x.P.색 || x.id.slice(4), size: 1, off: !!x.P.숨김 })) },
            { k: 'hi', lb: '형광펜', list: () => pkOf('hi').map(x => ({ id: x.id, tool: 'hi', color: x.P.색 || x.id.slice(3), size: 1, off: !!x.P.숨김 })) },
            { k: 'erase', lb: '지우개', list: () => pkOf('erase').map(x => ({ id: x.id, tool: 'erase', size: +((x.P.틀 || {}).size) || 0, name: String(x.P.이름 || '지우개'), off: !!x.P.숨김 })) }
        ];
        let pkAllC = null;
        if (window.prodHook) prodHook(() => { pkAllC = null; });                // 사본을 읽으면 다시 만들어요
        const pkAll = () => pkAllC || (pkAllC = PK_KINDS.reduce((a, g) => a.concat(g.list()), []));   // 처음 쓸 때 만들어요
        /* ✏️ 가진 필기구 (도련 11-01 : 처음엔 🎁 5개 · js/skins.js GD_STARTER · 더는 🏪 기본상품 샵 '문구 → 필기구'에서 받아요) = 내 문구 목록 'diary_gd_own' 안의 필기구 (js/skins.js gdGive) */
        const pkIsId = id => pkAll().some(t => t.id === id);
        const pkOwnIds = () => { const L = window.gdOwnList ? gdOwnList() : null, H = window.deskBagHold ? deskBagHold() : null; return (L || []).map(o => o.id).filter(id => pkIsId(id) && !(H && H.g.has(id))); };   // 🛍️ 봉투 속 필기구는 꺼낼 때까지 없어요
        const pkName = t => t.name || (t.tool === 'pen' ? '색연필' : '형광펜');
        const pkq = id => document.getElementById(id);
        const pk = { on: false, pick: null, busy: false, tab: 'pen', x: 0, w: 1, v: 0, raf: 0, go: null, drag: null, moved: false };   // x = 민 거리(px) · w = 한 바퀴 길이

        function pkRead() {
            let v = null;
            v = prefGet(PK_KEY, PK_LOCAL);                                   // 💾 js/drive.js
            const own = pkOwnIds(), ok = Array.isArray(v) ? v.filter(id => own.includes(id)) : [];
            if (Array.isArray(v) && v.includes('∅')) return ok;                 // ✏️ 일부러 다 뺐어요 (책상 연필꽂이 · js/deskgd.js)
            return ok.length ? ok : own.slice(0, PK_MAX);                       // 고른 게 없으면 = 가진 것 모두 (24개까지)
        }
        function pkWrite(ids) {
            prefSet(PK_KEY, PK_LOCAL, ids.length ? ids.filter(id => id !== '∅') : ['∅']);   // 하나도 없으면 '∅' (= 가진 것 모두로 돌아가지 않게)
        }
        /* 연필꽂이에 꽂을 순서 : 색연필 · 형광펜 · 지우개를 번갈아 섞고 (부채꼴로 기대면 고르기 쉬워요)  */
        function pkCupList() {
            const on = new Set(pkRead()), g = k => pkAll().filter(t => t.tool === k && on.has(t.id)).map(t => ({ id: t.id, tool: t.tool, color: t.color, size: t.size, kind: t.kind, tip: pkTip(t) }));
            const pens = g('pen'), his = g('hi'), ers = g('erase'), out = [];
            while (pens.length || his.length) { if (pens.length) out.push(pens.shift()); if (pens.length) out.push(pens.shift()); if (his.length) out.push(his.shift()); }
            ers.forEach((e, i) => out.splice(Math.round((i + 1) * out.length / (ers.length + 1)) + i, 0, e));
            return out;
        }


        /* ---------- 필통 그리기 ---------- */
        const pkSvg = t => window.gdPicSvg ? gdPicSvg(t.id) : '';             // 🎬 상품공방 그림 그대로 (js/gdpic.js · 도련 11-02 · 연필꽂이 · 보관함 · 손에 든 것 모두)
        /* 그림 안 닿는 점 = 쓰는끝 (그림 px) → 30 × 150 상자 (손에 든 필기구 · js/draw.js pcTipOf) · 없으면 위 가운데 */
        function pkTip(t) {
            const p = window.gdPic && gdPic(t.id); if (!p) return [15, 2];
            return gdPicAt(p, p.tip || [p.w / 2, t.tool === 'erase' ? p.h * 37 / 150 : p.h * .02], 30, 150);
        }
        function pkTool(t, copy) {
            const nm = pkName(t);   // 그림은 바닥에 맞춰 세워요 (모두 같은 줄에 서요)
            return `<button type="button" class="pk-t pk-${t.tool}" data-id="${t.id}" aria-pressed="false" aria-label="${nm}" title="${nm}"${copy ? ' tabindex="-1" aria-hidden="true"' : ''}><span class="pk-ti">${pkSvg(t).replace('<svg ', '<svg preserveAspectRatio="xMidYMax meet" ')}</span><i class="pk-tag">♥</i></button>`;
        }
        /* 한 바퀴 = 종류마다 한 묶음 (묶음 사이는 살짝 띄워요) · 끝없이 넘기려고 같은 바퀴를 몇 번 이어 붙여요 (첫 바퀴만 키보드로 가요) */
        const pkLap = (kinds, copy) => { const own = new Set(pkOwnIds()); return kinds.map(g => `<span class="pk-grp" data-k="${g.k}">${pkAll().filter(t => t.tool === g.k && own.has(t.id)).map(t => pkTool(t, copy)).join('')}</span>`).join(''); };   // 가진 것만
        function pkBuild() {
            let r = pkq('pkRoom'); const sig = pkOwnIds().join(',');
            if (r && r.dataset.own === sig) return r;
            if (r) r.remove();                                                   // 가진 필기구가 바뀌었으면 다시 그려요
            r = document.createElement('div'); r.id = 'pkRoom'; r.className = 'pk-room'; r.hidden = true;
            r.setAttribute('role', 'dialog'); r.setAttribute('aria-label', '보관함');
            r.dataset.own = sig;
            const own = new Set(pkOwnIds()), kinds = PK_KINDS.filter(g => g.list().some(t => own.has(t.id)));
            r.innerHTML = `<div class="pk-case" id="pkCase">
                <div class="pk-body"><button type="button" class="x-only pk-x" id="pkDone" aria-label="닫기">✕</button>
                    <div class="pk-in">
                        <p class="pk-tip" id="pkTip"></p>
                        <div class="pk-tabs" role="tablist">${kinds.map(g => `<button type="button" class="pk-tab" role="tab" data-k="${g.k}">${g.lb}<b data-n="${g.k}"></b></button>`).join('')}<button type="button" class="pk-tab pk-bin" id="pkBin" aria-pressed="false" title="버리기">🗑</button></div>
                        <div class="pk-tray" id="pkTray"><div class="pk-strip" id="pkStrip">${pkLap(kinds, false)}${pkLap(kinds, true).repeat(3)}</div></div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(r);
            addEventListener('resize', () => { if (pk.on) pkPlace(); });
            r.querySelectorAll('.pk-t').forEach(b => b.onclick = () => pkToggle(b));
            r.querySelectorAll('.pk-tab[data-k]').forEach(b => b.onclick = () => pkTab(b.dataset.k));
            pkq('pkBin').onclick = () => { pk.bin = !pk.bin; pkRender(); };       // 🗑 버리기 (도련 11-02 · 톡 = 휴지통 30일 · js/skins.js gdBin)
            pkBand(pkq('pkTray'));
            pkq('pkDone').onclick = pkClose; r.addEventListener('click', e => { if (e.target === r) pkClose(); });   // ✕ 또는 창 밖 (도련 10-28)
            r.addEventListener('keydown', e => { if (e.key === 'Escape') pkClose(); });
            return r;
        }
        /* 좌우로 밀어 넘기기 : x 를 한 바퀴(w)로 나눈 나머지만큼 줄을 옮겨요 → 끝이 없어요 */
        function pkSet(x) {
            const st = pkq('pkStrip'), tr = pkq('pkTray'); if (!st) return;
            pk.w = st.children[st.children.length / 4].offsetLeft || 1;          // 두 번째 바퀴가 시작하는 자리 = 한 바퀴 길이
            pk.x = x; const m = ((x % pk.w) + pk.w) % pk.w;
            st.style.transform = `translateX(${-m.toFixed(1)}px)`;
            const mid = m + tr.clientWidth / 2;                                // 가운데 있는 종류에 불
            let k = pk.tab; st.querySelectorAll('.pk-grp').forEach(g => { if (g.offsetLeft <= mid) k = g.dataset.k; });
            if (k !== pk.tab) pkTabOn(k);
        }
        function pkStop() { cancelAnimationFrame(pk.raf); pk.raf = 0; pk.go = null; pk.v = 0; }
        function pkRun() {                                                    // 미끄러지기 · 이름표로 휙 가기
            pk.raf = 0;
            if (pk.go != null) { const d = pk.go - pk.x; if (Math.abs(d) < .6) { pkSet(pk.go); pk.go = null; return; } pkSet(pk.x + d * .2); }
            else { if (Math.abs(pk.v) < .3) { pk.v = 0; return; } pkSet(pk.x + pk.v); pk.v *= .93; }
            pk.raf = requestAnimationFrame(pkRun);
        }
        function pkBand(tr) {
            tr.addEventListener('pointerdown', e => {
                if (!e.isPrimary || e.button > 0) return;
                pkStop(); pk.moved = false;
                pk.drag = { id: e.pointerId, x0: e.clientX, x: e.clientX, t: performance.now(), s: e.currentTarget.getBoundingClientRect().width / tr.offsetWidth || 1 };
            });
            tr.addEventListener('pointermove', e => {
                const d = pk.drag; if (!d || d.id !== e.pointerId) return;
                if (!pk.moved && Math.abs(e.clientX - d.x0) < 6) return;
                if (!pk.moved) { pk.moved = true; try { tr.setPointerCapture(e.pointerId); } catch (er) {} tr.classList.add('drag'); }
                const dx = (e.clientX - d.x) / d.s, now = performance.now();
                pk.v = -dx / Math.max(1, (now - d.t) / 16.7); d.x = e.clientX; d.t = now;
                pkSet(pk.x - dx);
            });
            const end = e => {
                const d = pk.drag; if (!d || d.id !== e.pointerId) return;
                pk.drag = null; tr.classList.remove('drag');
                if (pk.moved && performance.now() - d.t < 80 && !pk.raf) pk.raf = requestAnimationFrame(pkRun); else pk.v = 0;
            };
            tr.addEventListener('pointerup', end); tr.addEventListener('pointercancel', end);
            tr.addEventListener('click', e => { if (pk.moved) { e.stopPropagation(); e.preventDefault(); pk.moved = false; } }, true);   // 밀었으면 고르지 않아요
            tr.addEventListener('wheel', e => { e.preventDefault(); pkStop(); pkSet(pk.x + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)); }, { passive: false });
            tr.addEventListener('focusin', e => { const b = e.target.closest('.pk-t'); if (b && !pk.drag) pkTo(b.offsetLeft + b.parentNode.offsetLeft + b.offsetWidth / 2 - tr.clientWidth / 2); });
            tr.addEventListener('keydown', e => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                const all = [...pkq('pkStrip').querySelectorAll('.pk-t:not([tabindex])')], i = all.indexOf(e.target); if (i < 0) return;
                e.preventDefault(); all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length].focus({ preventScroll: true });
            });
        }
        function pkTo(x) {                                                    // 가장 가까운 쪽으로 돌아서 가요
            const m = ((pk.x % pk.w) + pk.w) % pk.w; let d = x - m;
            if (d > pk.w / 2) d -= pk.w; if (d < -pk.w / 2) d += pk.w;
            pkStop(); pk.go = pk.x + d; pk.raf = requestAnimationFrame(pkRun);
        }
        /* 🗂 이름표 : 그 종류로 휙 넘어가요 */
        function pkTabOn(k) {
            pk.tab = k;
            pkq('pkRoom').querySelectorAll('.pk-tab').forEach(b => { const v = b.dataset.k === k; b.classList.toggle('on', v); b.setAttribute('aria-selected', v); });
        }
        function pkTab(k, now) {
            const g = pkq('pkStrip').querySelector(`.pk-grp[data-k="${k}"]`); if (!g) return;
            pkTabOn(k);
            if (now) { pkStop(); pkSet(g.offsetLeft - 6); } else pkTo(g.offsetLeft - 6);
        }
        function pkRender() {
            const on = pk.pick, r = pkq('pkRoom');
            r.classList.toggle('binning', !!pk.bin); { const bb = pkq('pkBin'); if (bb) { bb.classList.toggle('on', !!pk.bin); bb.setAttribute('aria-pressed', !!pk.bin); bb.textContent = pk.bin ? '✓' : '🗑'; } }
            r.querySelectorAll('.pk-t').forEach(b => { const v = on.has(b.dataset.id); b.classList.toggle('on', v); b.setAttribute('aria-pressed', v); });
            r.querySelectorAll('[data-n]').forEach(n => { const c = [...on].filter(id => id.split(':')[0] === n.dataset.n).length; n.textContent = c || ''; });
            if (pk.bin) { pkq('pkTip').innerHTML = `🗑 <b>버릴 필기구를 톡</b><small>휴지통에 30일 보관했다가 지워져요 · 다 했으면 ✓</small>`; return; }
            pkq('pkTip').innerHTML = `필기구를 <b>좌우로 밀어</b> 넘기고 <b>톡</b> 골라요 · <b>${on.size}</b> / ${PK_MAX}개<small>♥ 고른 것만 연필꽂이에 꽂혀요</small>`;
        }
        function pkToggle(b) {
            const id = b.dataset.id, on = pk.pick;
            if (pk.bin) { pkBinTap(id); return; }
            if (on.has(id)) { if (![...on].some(v => v !== id && /^(pen|hi):/.test(v)) && /^(pen|hi):/.test(id)) { pkSay('쓸 색연필 · 형광펜 하나는 꼭 꽂아 둬요 ✏️'); return; } on.delete(id); }
            else { if (on.size >= PK_MAX) { pkSay(`연필꽂이에는 ${PK_MAX}개까지 꽂을 수 있어요`); return; } on.add(id); }
            b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
            if (window.sfx) try { sfx('tick'); } catch (e) {}
            pkRender();
        }
        async function pkBinTap(id) {                                          // 🗑 버리면 보관함을 새로 (가진 필기구가 바뀌었어요)
            if (!window.gdBin || pk.busy || !await gdBin(id)) return;
            pk.pick.delete(id); pkWrite([...pk.pick]); pkStop();
            const r = pkq('pkRoom'); pk.on = false; if (r) r.remove();
            openPencase(true);
        }
        function pkSay(t) { const p = pkq('pkTip'); p.innerHTML = t; p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); clearTimeout(pk.tm); pk.tm = setTimeout(pkRender, 1600); }

        /* 보이는 쪽 한가운데에 맞춰요 (📱 폰 = 오른쪽 쪽) · 페이지 안에 들어오게 줄여요 */
        function pkPlace() {
            const c = pkq('pkCase'), pg = document.getElementById('canvasArea'); if (!c) return;
            const r0 = pg ? pg.getBoundingClientRect() : { left: 0, top: 0, right: innerWidth, bottom: innerHeight, width: innerWidth, height: innerHeight }, r = window.dyVisRect ? dyVisRect(r0) : r0;
            const W = c.offsetWidth, H = c.offsetHeight;
            const s = Math.min(1, (r.width - 12) / W, (r.height - 12) / H, (innerHeight - 16) / H);
            const x = r.left + (r.width - W * s) / 2, y = Math.max(8, r.top + (r.height - H * s) / 2);
            c.style.setProperty('--s', s.toFixed(3)); c.style.setProperty('--x', Math.round(x) + 'px'); c.style.setProperty('--y', Math.round(y) + 'px');
        }

        /* ---------- 열고 닫기 (✏️ 연필꽂이 '보관함' 버튼) ---------- */
        function openPencase(keepBin) {
            if (pk.on || pk.busy) return;
            if (keepBin !== true) pk.bin = false;
            const r = pkBuild(); pk.on = true; pk.pick = new Set(pkRead());
            pkRender();
            const c = pkq('pkCase'); c.classList.remove('shut');
            r.hidden = false; pkPlace(); pkTab(pk.tab, true); requestAnimationFrame(() => r.classList.add('show'));
            setTimeout(() => { const b = r.querySelector('.pk-tab.on'); if (b) b.focus({ preventScroll: true }); }, 50);
        }
        function pkClose() {
            if (!pk.on || pk.busy) return;
            pk.busy = true;
            const r = pkq('pkRoom'), c = pkq('pkCase');
            pkWrite([...pk.pick]); pkStop();
            if (window.pcRefill) pcRefill();                                     // 연필꽂이 · 아래 창 색 줄 다시
            c.classList.add('shut');
            setTimeout(() => {
                r.classList.remove('show');
                setTimeout(() => { r.hidden = true; pk.on = false; pk.busy = false; }, 220);
            }, 60);
        }
        /* 🏪 기본상품 샵 '문구 → 필기구' (js/skins.js gdShopList · gdGive) */
        const pkShopList = () => pkAll().filter(t => !t.off).map(t => ({ id: t.id, g: 'pen', kind: '필기구', name: pkName(t), art: pkSvg(t) }));
        function pkAdd(id) {                                                    // 받은 필기구 = 연필꽂이에도 (고른 목록이 있을 때 · 24개까지)
            const v = prefGet(PK_KEY, PK_LOCAL);
            if (Array.isArray(v) && v.length && !v.includes(id) && v.filter(x => x !== '∅').length + (window.dkwCupToolN ? dkwCupToolN() : 0) < PK_MAX) pkWrite(v.filter(x => x !== '∅').concat([id]));   // ✏️ 책상 연필꽂이의 다른 도구까지 24개
            if (window.pcRefill) pcRefill();
        }
        window.openPencase = openPencase; window.pkCupList = pkCupList;
        window.pkIsId = pkIsId; window.pkRead = pkRead; window.pkWrite = pkWrite; window.pkSvg = pkSvg; window.pkOwnIds = pkOwnIds; window.pkHas = () => pkOwnIds().length > 0; window.pkShopList = pkShopList; window.pkAdd = pkAdd;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['pencase'] = true;
