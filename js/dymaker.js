/* 말랑달콤 다이어리 - js/dymaker.js
   🗂️ 바인더 조립 · 🎁 처음 선물 다이어리 · 내가 가진 권 · 재료 목록 (도련 11-28 : 다꾸러는 스티커 말고 다이어리를 만들지 않아요 → 📓 노트 만들기 · 🗂️ 바인더 만들기 창은 영구 삭제)
   - 🧩 재료 = 받은 바인더 표지 · 내지 (다이어리 / _바인더재료목록.json · js/dyown.js) · 권 = 조립한 바인더 · 받은 노트 (_목록.json)
   - 🧩 바인더 조립 : 표지 하나 + 같은 크기 내지 하나 (📄 페이지 · 📅 날짜 모두 · 도련 11-23 · 1418) = 쓸 수 있는 바인더 한 권 · 끼운 표지 · 내지는 재료에서 빠져요 (현실처럼)
       · 끼울 때의 모양을 그대로 담아요 · 빼면 (꾸민 페이지가 없는 내지만) 재료로 돌아와요 · 표지를 바꾸면 예전 표지도 돌아와요
       · 📅 날짜형바인더 = 해가 적힌 표지(샵 · 첫 선물) + 날짜 내지 하나 (해 없음 · 표지의 해를 따라가요) · 해가 지난 표지는 조립 못 해요 (js/dyyear.js dyyAssemble)
   - 꾸민 내용 : 다이어리 / <권 id> / 1페이지.json … (js/drive.js)
   - 내지 : 그 쪽의 내지 = 상품 폴더의 내지 그림 (상품id:내지 · js/prod.js leafCss · js/leafpad.js dkLeafOf) · 구간에 없는 쪽 = 속지색만 */

        const DMK_SZ = MK.SPECS.map(([n, w, h]) => [n, `${w}×${h}`, h / w]);   // 📐 상품공방과 같은 규격 표 (js/maker.js)
        const DMK_SIZES = { '노트': DMK_SZ, '바인더': DMK_SZ };
        const DMK_BINDS = { '노트': MK.BINDS.filter(b => b[0] !== 'ring'), '바인더': MK.BINDS.filter(b => b[0] === 'ring') };
        const DMK_COLORS = MK.COLORS.slice(0, 10);
        const dmkCols = (v, c) => v && typeof v === 'object' && String(v.표지색 || '') && ['테두리색', '강조색', '속지색'].every(n => /^#[0-9a-f]{6}$/i.test(v[n] || '')) ? { 표지색: String(v.표지색).slice(0, 120), 테두리색: v.테두리색, 강조색: v.강조색, 속지색: v.속지색 } : MK.dyAuto(c);
        const DMK_PG = { min: 10, max: 200, def: 30 }, DMK_BIND_MAX = 600;     // 바인더 한 권에 끼울 수 있는 페이지
        /* 종류 : note 노트 · binder 조립한 바인더 (= 📚 다이어리 목록) · cover 바인더 표지 · refill 내지 · dcover 해가 적힌 날짜 표지 · drefill 날짜 내지 (= 🧩 재료 목록 · js/dyown.js) */
        const DMK_T = {
            note: { k: '노트', name: '노트', icon: '📓' },
            cover: { k: '바인더', name: '바인더 표지', icon: '🗂️' },
            refill: { k: '바인더', name: '내지', icon: '📄' },
            dcover: { k: '바인더', name: '날짜형 바인더 표지', icon: '📅' },
            drefill: { k: '바인더', name: '날짜형 바인더 내지', icon: '📅' },
            binder: { k: '바인더', name: '바인더', icon: '🗂️' }
        };
        const dmkEsc = htmlEsc;   // 🧰 js/util.js
        const dmkQ = id => document.getElementById(id);
        const dmkShut = (...ids) => ids.forEach(id => { if (dmkQ(id)) closeModal(id); });

        /* ---------- 만든 것 목록 (바로 꺼내 쓰는 쪽) ---------- */
        function dmkMap() { const m = {}; dyoAll().filter(x => x.t !== 'date').concat(dymAll('cover'), dymAll('refill')).forEach(x => { m[x.id] = x; }); return m; }   // 📚 권 + 🧩 재료
        const dmkPg = v => Math.max(DMK_PG.min, Math.min(DMK_PG.max, Math.round(+v) || DMK_PG.def));
        function dmkLv(lv, pg) {                                               // 내지 구간 [[처음, 끝, 내지] …] 확인
            return (Array.isArray(lv) ? lv : []).map(r => Array.isArray(r) ? [Math.max(1, Math.round(+r[0]) || 1), Math.min(pg, Math.round(+r[1]) || pg), leafOk(r[2]) ? r[2] : ''] : null).filter(r => r && r[0] <= r[1]);
        }
        function dmkClean(d) {                                                  // 드라이브 · 설정에서 읽은 것 확인
            if (!d || typeof d !== 'object' || !/^my[\w-]{1,30}$/.test(d.id || '')) return null;
            const t = DMK_T[d.t] ? d.t : d.k === '바인더' ? 'binder' : 'note', k = DMK_T[t].k;
            const sz = DMK_SIZES[k].find(s => s[0] === d.n) || DMK_SIZES[k].find(s => s[0] === 'A5');
            const o = { id: d.id, t, k, g: String(d.g || '').slice(0, 20) || '내 ' + DMK_T[t].name, n: sz[0], mm: sz[1], r: sz[2], from: dyoFrom(d.from, 'mine') };
            if (d.start) o.start = 1;                                            // 🎁 처음받기 (도련 11-09)
            if (t === 'dcover') { const D = window.dyyDesignOf ? dyyDesignOf(d.d) : null; return Object.assign(o, { y: Math.round(+d.y) || new Date().getFullYear(), d: String(d.d || ''), n: D ? D.n : o.n, mm: D ? D.mm : o.mm, r: D ? D.r : o.r, c: D ? D.c : DMK_COLORS[6], b: 'ring' }, d.md && typeof d.md === 'object' ? { md: d.md } : {}); }   // 📅 해가 적힌 표지 = 그 디자인 그대로 · ✏️ 내가 만든 표지 = md (도련 11-11)
            if (d.pid) o.pid = String(d.pid).slice(0, 60);                      // 🏪 받은 상품 id
            if (t === 'drefill') return Object.assign(o, { lf: leafOk(d.lf) ? d.lf : '' });   // 📅 날짜 내지 (해 없음 · 크기 n = 같은 크기 표지에만)
            const color = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : DMK_COLORS[k === '바인더' ? 6 : 0];
            if (t === 'note') { const pg = dmkPg(d.pg); return Object.assign(o, { my: 1, b: DMK_BINDS[k].some(x => x[0] === d.b) ? d.b : DMK_BINDS[k][0][0], c: color(d.c), cols: dmkCols(d.cols, color(d.c)), cw: !!(d.cw && d.cols), pg, lv: dmkLv(d.lv, pg) }); }
            if (t === 'cover') return Object.assign(o, { b: 'ring', c: color(d.c), cols: dmkCols(d.cols, color(d.c)), cw: !!(d.cw && d.cols) });
            if (t === 'refill') { const pg = dmkPg(d.pg); return Object.assign(o, { pg, lv: dmkLv(d.lv, pg) }); }
            /* 조립한 바인더 : 끼운 내지(rf · 끼울 때 모양 그대로)를 이어 붙여 페이지 · 내지 구간 */
            const rf = (Array.isArray(d.rf) ? d.rf : []).map(x => { if (!x || typeof x !== 'object') return null; const pg = dmkPg(x.pg); return { id: String(x.id || ''), g: String(x.g || '').slice(0, 20) || '내지', pg, lv: dmkLv(x.lv, pg), from: dyoFrom(x.from, 'mine') }; }).filter(Boolean);   // from = 그 내지를 어디서 (빼면 그대로 재료로)
            let at = 0; const lv = [];
            rf.forEach(x => { lv.push([at + 1, at + x.pg, '']); x.lv.forEach(r => lv.push([at + r[0], at + r[1], r[2]])); at += x.pg; });   // 내지마다 빈 속지로 깔고 그 위에 구간 (뒤에 넣은 게 먼저 찾아지게 아래서 뒤집어요)
            return Object.assign(o, { my: 1, b: 'ring', c: color(d.c), cols: dmkCols(d.cols, color(d.c)), cv: String(d.cv || ''), cg: String(d.cg || '').slice(0, 20), cvf: dyoFrom(d.cvf, 'mine'), cvw: !!d.cvw, rf, pg: Math.max(1, at), lv: lv.reverse() });   // cvf · cvw = 끼운 표지의 from · 세부 색
        }
        const dmkSel = t => t === 'note' || t === 'binder';                    // 다이어리 창에서 고르는 것 (권)
        function dmkAll() { return Object.values(dmkMap()).map(dmkClean).filter(d => d && dmkSel(d.t)).sort((a, b) => a.id < b.id ? 1 : -1); }   // 새것 먼저
        function dmkParts(t) { return Object.values(dmkMap()).map(dmkClean).filter(d => d && d.t === t).sort((a, b) => a.id < b.id ? 1 : -1); }
        function dmkGet(id) { const d = dmkMap()[id]; return d ? dmkClean(d) : null; }
        /* 📚 권(노트 · 바인더) = 다이어리 목록 · 🧩 표지 · 내지 = 재료 목록 (재료는 dymReady 뒤에) */
        function dmkPut(d) {
            if (d.del) { dyoDel(d.id); dymDel(d.id); return; }
            const c = dmkClean(d); if (!c) return;
            if (dymIs(c.t)) dymPut(c); else dyoPut(c);
        }

        /* 🧩 재료 목록 준비 (💤 쓸 때 읽어요 · js/dyown.js dymReady) → 조립 창이 떠 있으면 다시 그려요 */
        async function dmkSync(kind) {
            if (kind === '노트') return;
            try { await dymReady(); } catch (e) { return; }
            if (dmkQ('dmkRoom') && dmkQ('dmkRoom').style.display !== 'none') dmkRoomRender();
        }

        /* ---------- 내지 : 이 페이지의 기본 속지 (js/elements.js · js/leafpad.js) ---------- */
        function dkLeafOf(date) {
            if (date && typeof dkIs === 'function' && dkIs(date) && !dkNo(date)) return '';   // 📕 표지엔 내지가 없어요
            const t = typeof dkType === 'function' && dkType(); if (!t) return window.dyyLeafNow ? dyyLeafNow() : '';   // 📔 날짜형 = 그 디자인 내지 (모든 날 같은 내지)
            if (!t.lv || !date || !dkIs(date)) return '';
            const n = dkNo(date); if (n < 1) return '';
            const r = t.lv.find(x => n >= x[0] && n <= x[1]);
            return r ? r[2] : '';
        }
        function dmkFilledMax(id) {                                            // 그 권에서 꾸민 마지막 페이지
            if (!id || typeof dkFilled !== 'function') return 0;
            const m = window.dkMap ? dkMap() : {}, bid = m[id]; if (!bid) return 0;
            const f = dkFilled(dkInfoOf(bid)); return f.length ? f[f.length - 1] : 0;
        }

        /* ---------- 작은 그림 ---------- */
        function dmkCvThumb(c, r, H, fid) { const f = fid && window.dyFaceCss ? dyFaceCss(fid, 'px') : 'none'; return `<span class="dmk-cvth" style="--c:${c};--cf:${htmlEsc(f)};width:${Math.round(H / r)}px;height:${H}px"></span>`; }   // 📁 fid = 그 표지 상품 (표지.svg · 도련 11-18)
        function dmkRfThumb(lv, r, H) { const id = (lv[0] || [0, 0, ''])[2]; return `<span class="lf-pick dmk-rfth" style="width:${Math.round(H / r)}px;height:${H}px"><i class="lf-sw" style="background:var(--lf-holes), ${htmlEsc(leafBg(id, H / 148 * 1.6))}, var(--page-bg, #fff)"></i></span>`; }   // 🗒️ 그 내지무늬 상품 디자인 (도련 11-18)

        function dmkOpen(kind, id) { if (kind === '바인더') return dmkRoomOpen(id || ''); }   // 🧩 바인더 조립 (폰 · js/skins.js)
        function dmkUse(d) {                                                   // 만든 노트 · 조립한 바인더 열기
            const cur = dyNow().id === d.id;
            if (!cur) dySet(d.id);
            else { if (typeof refreshLayout === 'function') refreshLayout(); if (isCoverOpen && !turn) loadData(); dkCoverPaint(); }   // 고친 크기 · 색 · 내지를 바로
            if (!isCoverOpen && !turn) openCoverAnimated();
        }

        /* 🎁 처음 선물 📓 페이지노트 · 🗂️ 페이지바인더 (도련 11-06 · 상품공방 '처음받기' 체크 · 앱이 정하지 않아요 · js/desk.js giftEnsure)
           그 상품 모양 그대로 한 권씩 📚 다이어리 목록에 (from gift · 바인더 = 상품 표지 + 처음 끼워진 내지 · 조립된 채로 · 재료 목록에는 없어요) → 준 권 수 */
        function dmkGiftRefill(p) {                                            // 🎁 첫 선물 페이지바인더에 끼울 내지 = 표지 상품 '처음내지' (없으면 같은 크기 페이지 내지 · 그것도 없으면 줄노트 100쪽)
            const R = (typeof DY_REFILLS !== 'undefined' ? DY_REFILLS : []).filter(r => r.t === 'page' && r.n === p.n), r = R.find(x => x.id === p.rf0) || R[0];
            return r ? { id: 'p:' + r.id, g: r.g, pg: r.pg, lv: r.lv, from: 'basic' } : { id: 'p:' + p.id, g: p.g + ' 내지', pg: 100, lv: [[1, 100, '']], from: 'basic' };
        }
        async function dmkStarter() {
            const gs = (typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).filter(p => p.gift && DMK_SZ.some(s => s[0] === p.n));
            if (!gs.length) return 0;
            const t0 = Date.now(), ds = gs.map((p, i) => {
                const id = 'my' + (t0 + i).toString(36);
                return p.k === '노트'
                    ? dmkClean({ id, t: 'note', g: p.g, n: p.n, b: p.b, c: p.c, cols: p.cols, cw: 1, pg: p.pg, lv: p.lv, from: 'basic', start: 1 })
                    : dmkClean({ id, t: 'binder', g: p.g, n: p.n, c: p.c, cols: p.cols, cv: 'p:' + p.id, cg: p.g, cvf: 'basic', cvw: 1, rf: [dmkGiftRefill(p)], from: 'basic', start: 1 });   // 🧩 조립한 것과 같은 모양 (표지 + 처음 끼울 내지)
            }).filter(Boolean);
            const ids = new Set(ds.map(d => d.id)); dyoSet(dyoAll().filter(x => !ids.has(x.id)).concat(ds));   // 📚 한 번에
            if (window.deskVolInit) deskVolInit(ds.map((d, i) => ({ id: d.id, spot: gs[i].desk, n: d.g })));   // 🎁 처음 책상 자리 = 상품공방 '처음책상' (없으면 봉투 · 도련 11-06)
            const fl = ds.find((d, i) => gs[i].float);                          // 🎈 처음에 떠 있는 권 = 상품공방 '처음띄움'
            if (fl && window.dkGiftFloat === 'pg') { window.dkGiftFloat = undefined; dySet(fl.id); if (UI.desk() && window.deskOpenDiary) { if (window.dkDeskBooks) dkDeskBooks(); requestAnimationFrame(() => deskOpenDiary()); } }
            return ds.length;
        }
        window.dmkStarter = dmkStarter;
        /* 🛟 다이어리 목록이 없어지면 = js/dyyear.js dyySync 가 권마다 한 줄 그대로 (노트 · 바인더도 · 981) */
        window.dmkRescue = () => {};

        /* ---------- 🧩 바인더 조립 : 표지 하나 + 내지 (🧩 재료 목록에서 · 끼우면 빠지고 · 빼면 돌아와요 · 981) ---------- */
        let dmkRm = null;                                                      // { id(고칠 때), g, from, cv: 표지 재료, rf: [내지 재료], o0: { cv, rf } (고치기 전 · 돌려줄 것) }
        const dmkBkCover = b => ({ id: /^my/.test(b.cv) ? b.cv : dymNewId(), t: 'cover', g: b.cg || '표지', n: b.n, c: b.c, cols: b.cols, cw: b.cvw, from: b.cvf || 'mine' });   // 바인더에 끼운 표지 → 재료 모양
        const dmkBkRefill = (b, x) => ({ id: /^my/.test(x.id) ? x.id : dymNewId(), t: 'refill', g: x.g, n: b.n, pg: x.pg, lv: x.lv, from: x.from || 'mine' });
        const dmkRmDate = () => !!(dmkRm && dmkRm.cv && dmkRm.cv.t === 'dcover');
        /* 🔒 다꾸를 완료한 바인더 = 아무것도 못 바꿔요 (도련 11-17 : 쓰기 전엔 고칠 수 있지만 다이어리에서 ✅ 완료한 순간부터 표지 · 내지 바꾸기 · 더하기 · 빼기 모두 안 돼요)
             표시 = 다이어리 목록 그 줄 lk (완료한 시각 · js/pagedone.js done → dmkLockPage · 페이지와 같은 올리기에 같이) */
        const dmkLocked = id => { const l = id && typeof dyoGet === 'function' ? dyoGet(id) : null; return !!(l && l.t === 'binder' && l.lk); };
        function dmkLockPage(key) {
            try {
                const p = typeof parsePageKey === 'function' ? parsePageKey(key) : null; if (!p || !p.b || !window.dkMap) return;
                const m = dkMap(), id = Object.keys(m).find(k => m[k] === p.b), l = id ? dyoGet(id) : null;
                if (l && l.t === 'binder' && !l.lk) dyoPut(Object.assign({}, l, { lk: Date.now() }));
            } catch (e) { console.warn('🔒 바인더 잠그기', e); }
        }
        function dmkRmInit(id) {                                               // 조립 시작 ('' = 새 바인더 · 권 id = 고치기) · 🧩 책상 바인더 조립(js/binderroom.js)도 같이 써요
            if (id && dmkLocked(id)) { if (window.showMsg) showMsg('🔒 다꾸를 완료한 바인더예요.<br><span style="font-size:12px;color:#777;">표지 · 내지를 바꾸거나 더하거나 뺄 수 없어요</span>'); id = ''; }
            const old = id ? dmkGet(id) : null;
            dmkRm = old && old.t === 'binder' ? { id: old.id, g: old.g, from: old.from, cv: dmkBkCover(old), rf: old.rf.map(x => dmkBkRefill(old, x)) } : { id: '', g: '', from: 'mine', cv: null, rf: [] };
            dmkRm.o0 = { cv: dmkRm.cv, rf: dmkRm.rf.slice() };
            return dmkRm;
        }
        const dmkRoomOn = () => !!(dmkQ('dmkRoom') && dmkQ('dmkRoom').style.display !== 'none');
        function dmkRmRedraw() { if (dmkRoomOn()) dmkRoomRender(); if (window.bndRender) bndRender(); }
        async function dmkRoomOpen(id) {
            if (window.bndIsOpen && bndIsOpen()) { if (id !== null) dmkRmInit(id); bndRender(); return; }   // 🧩 책상 바인더 조립 중이면 그 화면에서
            if (id !== null) dmkRmInit(id);                                    // null = 표지 · 내지 만들기에서 돌아올 때 (하던 그대로)
            dmkRoomBuild();
            dmkQ('dmkRoomName').value = dmkRm.g;
            dmkQ('dmkRoomDel').hidden = !dmkRm.id;
            dmkQ('dmkRoomOk').textContent = '🧩 조립하기';   // 버튼 = 조립하기 하나 (저장 없음 · 도련 11-21)
            dmkRoomRender();
            dmkShut('dyModal'); openModal('dmkRoom');
            dmkSync('바인더');                                                  // 💤 재료 목록 (처음이면 읽고 다시 그려요)
        }
        function dmkRoomBuild() {
            if (dmkQ('dmkRoom')) return;
            document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="dmkRoom">
        <div class="modal-content dmk-win">
            <div class="modal-title">🧩 바인더 조립</div>
            <div class="dmk-hint">바인더 표지를 고르고, 내지를 끼워요 · 끼운 표지 · 내지는 재료에서 빠져요</div>
            <div class="dmk-prev" id="dmkRoomPrev"></div>
            <label class="dmk-row"><b>이름</b><input id="dmkRoomName" class="dmk-name" maxlength="20" autocomplete="off" placeholder="내 바인더" oninput="dmkRm.g = this.value; dmkRoomPrev()"></label>
            <div class="dmk-row dmk-col"><b>① 표지 고르기</b><div class="dmk-shelf" id="dmkRoomCv"></div></div>
            <div class="dmk-row dmk-col"><b>② 끼운 내지 <small id="dmkRoomPg"></small></b><div id="dmkRoomIn"></div></div>
            <div class="dmk-row dmk-col"><b>③ 내지 끼우기 <small id="dmkRoomRfHint">누르면 맨 뒤에 끼워요</small></b><div class="dmk-shelf" id="dmkRoomRf"></div></div>
            <div class="sub-modal-btns">
                <button class="btn" id="dmkRoomDel" type="button" onclick="dmkRoomDelete()">🗑 지우기</button>
                <button class="btn" type="button" onclick="dmkRoomClose()">취소</button>
                <button class="btn dmk-ok" id="dmkRoomOk" type="button" onclick="dmkRoomSave()">🧩 조립하기</button>
            </div>
        </div>
    </div>`);
        }
        const dmkRmFilled = () => dmkRm && dmkRm.id ? dmkFilledMax(dmkRm.id) : 0;
        const dmkRmLock = () => dmkRmFilled() > 0;                             // 꾸민 페이지가 있으면 표지는 같은 크기로만
        const dmkRmN = () => dmkRm && dmkRm.cv ? dmkClean(dmkRm.cv).n : '';
        /* 고를 수 있는 것 = 재료 목록 + 고치기 전에 끼워 있던 것 (아직 돌려주기 전) − 지금 끼운 것 */
        function dmkRmPool(k) {
            const inNow = new Set([dmkRm.cv && dmkRm.cv.id].concat(dmkRm.rf.map(x => x.id)).filter(Boolean));
            const back = k === 'cover' ? [dmkRm.o0.cv].filter(Boolean) : dmkRm.o0.rf;
            const seen = new Set(), L = [], H = window.deskBagHold ? deskBagHold() : null;   // 🛍️ 봉투 속 재료는 꺼낼 때까지 없어요 (도련 11-11)
            if (H) H.d.forEach(id => seen.add(id));
            dymAll(k).concat(back).forEach(x => { const c = dmkClean(x); if (c && !seen.has(c.id) && !inNow.has(c.id)) { seen.add(c.id); L.push(c); } });   // 🗄️ 🧩 서랍 속 재료도 바구니에 (도련 11-21 · ✔ 완료 전까지는 서랍에도 그대로 · 완료하면 서랍에서 빠져요 dbkMatGone)
            return L;
        }
        function dmkRmPick(id) {
            const c = dmkRmPool('cover').find(x => x.id === id); if (!c) return;
            if (c.t === 'dcover' && dmkRm.id) return;                          // 📅 날짜 표지는 새로 조립할 때만
            if (dmkRmLock() && c.n !== dmkRmN()) return;
            const wasDate = dmkRmDate();
            if ((c.t === 'dcover') !== wasDate || (dmkRm.rf.length && c.n !== dmkRmN())) dmkRm.rf = [];   // 크기 · 종류가 다르면 끼운 내지는 빠져요 (꾸민 페이지가 없을 때만 여기까지 와요)
            dmkRm.cv = c;
            if (c.t === 'dcover') { dmkRm.g = c.g; if (dmkQ('dmkRoomName')) dmkQ('dmkRoomName').value = c.g; }   // 📅 이름 = 그 해 디자인
            dmkRmRedraw();
        }
        function dmkRmAdd(id) {
            const r = dmkRmPool('refill').find(x => x.id === id); if (!r || !dmkRm.cv) return;
            if (dmkRmDate()) { if (r.t !== 'drefill' || r.n !== dmkRmN()) return; dmkRm.rf = [r]; }   // 📅 날짜 내지는 하나 (같은 크기)
            else {                                                               // 📄 페이지 내지도 하나 (도련 11-23 · 1418 · 예전 = 600페이지까지 여러 묶음 이어서) · 다른 내지를 끼우면 바뀌고 먼저 것은 바구니로
                if (r.t !== 'refill' || r.n !== dmkRmN()) return;
                if (dmkRm.rf.length && dmkRmLock()) { showMsg('꾸민 페이지가 있어서 내지를 바꿀 수 없어요.'); return; }
                dmkRm.rf = [r];
            }
            dmkRmRedraw();
        }
        function dmkRmOut(i) { if (!dmkRmDate()) { const st = dmkRm.rf.slice(0, i).reduce((s, x) => s + x.pg, 0); if (st < dmkRmFilled()) return; } dmkRm.rf.splice(i, 1); dmkRmRedraw(); }
        const dmkRfPg = x => x.t === 'drefill' ? 0 : x.pg;
        function dmkRoomPrev() {
            const cv = dmkRm.cv && dmkClean(dmkRm.cv), H = 96;
            if (!cv) { dmkQ('dmkRoomPrev').innerHTML = `<span class="dmk-prev-n">표지를 먼저 골라 주세요<small>표지가 없으면 📒 다이어리 → 🗂️ 바인더 만들기에서 만들거나 🏪 샵에서 받아요</small></span>`; return; }
            const pg = dmkRm.rf.reduce((s, x) => s + dmkRfPg(x), 0);
            const sub = cv.t === 'dcover' ? `📅 ${cv.y}년 · ${cv.n} · ${cv.mm}mm · ${dmkRm.rf.length ? '날짜 내지 끼움' : '날짜 내지를 끼워요'}` : `${cv.n} · ${cv.mm}mm · 내지 ${dmkRm.rf.length}묶음 · ${pg}펼침면`;
            dmkQ('dmkRoomPrev').innerHTML = `<span class="dmk-stack">${dmkCvThumb(cv.c, cv.r, H, cv.pid || cv.d)}${pg ? `<span class="dmk-stack-n">${pg}</span>` : ''}</span><span class="dmk-prev-n">${dmkEsc(dmkRm.g || cv.g || '내 바인더')}<small>${sub}</small></span>`;
        }
        function dmkRoomRender() {
            if (!dmkQ('dmkRoomCv') || !dmkRm) return;
            const lock = dmkRmLock(), filled = dmkRmFilled(), date = dmkRmDate(), n = dmkRmN(), yr = new Date().getFullYear();
            const covers = dmkRmPool('cover').filter(c => !(dmkRm.id && c.t === 'dcover'));
            const cur = dmkRm.cv ? [dmkClean(dmkRm.cv)] : [];
            const cvCard = (c, on) => {
                const old = c.t === 'dcover' && c.y < yr, off = !on && (old || (lock && c.n !== n));
                return `<button type="button" class="dmk-card${on ? ' on' : ''}" ${off ? 'disabled' : ''} onclick="dmkRmPick('${c.id}')" title="${old ? '해가 지난 표지예요' : ''}">${dmkCvThumb(c.c, c.r, 56, c.pid || c.d)}<span>${dmkEsc(c.g)}</span><small>${c.t === 'dcover' ? '📅 ' + c.y : c.n}</small></button>`;
            };
            dmkQ('dmkRoomCv').innerHTML = cur.map(c => cvCard(c, true)).join('') + covers.map(c => cvCard(c, false)).join('');
            let at = 0;
            dmkQ('dmkRoomIn').innerHTML = dmkRm.rf.length ? dmkRm.rf.map((x0, i) => {
                const x = dmkClean(x0) || x0;
                if (x.t === 'drefill') return `<div class="dmk-in"><span class="dmk-in-n">📅</span><span class="dmk-in-g">${dmkEsc(x.g)}<small>${dmkRm.cv ? dmkClean(dmkRm.cv).y + '년 날짜로' : ''}</small></span><button type="button" class="dmk-x" title="빼기" onclick="dmkRmOut(${i})">✕</button></div>`;
                const a = at + 1; at += x.pg; const keep = a - 1 < filled;
                return `<div class="dmk-in"><span class="dmk-in-n">${a}~${at}</span><span class="dmk-in-g">${dmkEsc(x.g)}<small>${x.pg}펼침면</small></span>${keep ? '<span class="dmk-in-lock" title="꾸민 페이지가 있어서 뺄 수 없어요">🔒</span>' : `<button type="button" class="dmk-x" title="빼기" onclick="dmkRmOut(${i})">✕</button>`}</div>`;
            }).join('') : `<div class="dmk-empty">아직 끼운 내지가 없어요. 아래에서 눌러 끼워요.</div>`;
            dmkQ('dmkRoomPg').textContent = dmkRm.rf.length && !date ? `${at}펼침면` : '';
            dmkQ('dmkRoomRfHint').textContent = date ? '날짜 내지 하나 · 표지의 해를 따라가요' : '누르면 맨 뒤에 끼워요';
            const refills = dmkRmPool('refill').filter(r => (date ? r.t === 'drefill' : r.t === 'refill') && (!n || r.n === n));   // 같은 크기만
            dmkQ('dmkRoomRf').innerHTML = refills.map(r => r.t === 'drefill'
                ? `<button type="button" class="dmk-card" onclick="dmkRmAdd('${r.id}')">${dmkRfThumb([[1, 1, r.lf || '']], (dmkRm.cv && dmkClean(dmkRm.cv).r) || 1.4, 56)}<span>${dmkEsc(r.g)}</span><small>📅 날짜</small></button>`
                : `<button type="button" class="dmk-card" ${n ? '' : 'disabled'} onclick="dmkRmAdd('${r.id}')">${dmkRfThumb(r.lv, r.r, 56)}<span>${dmkEsc(r.g)}</span><small>${r.n} · ${r.pg}펼침면</small></button>`).join('')
                + (dmkRm.cv && !refills.length && !(date && dmkRm.rf.length) ? `<div class="dmk-empty">${date ? n + ' 크기 날짜 내지가 없어요. 🏪 기본상품 샵 → 📅 날짜 내지에서 받아요.' : n + ' 크기 내지가 아직 없어요.'}</div>` : '');
            dmkQ('dmkRoomOk').disabled = !(dmkRm.cv && dmkRm.rf.length);
            dmkRoomPrev();
        }
        function dmkRoomClose() { closeModal('dmkRoom'); dyOpen('바인더'); dyTabSet('mine'); }
        async function dmkRoomSave(opt) {                                       // opt.quiet = 🧩 책상 바인더 조립 (다 되면 책상 위에 · 펼치지 않아요) → 권 id
            const quiet = !!(opt && opt.quiet);
            if (!dmkRm || !dmkRm.cv || !dmkRm.rf.length) return null;
            if (!quiet && dmkQ('dmkRoomName')) dmkRm.g = dmkQ('dmkRoomName').value;
            try { if (!await dymReady()) return; } catch (e) { showMsg('⚠ 지금은 조립하지 못했어요. 잠시 뒤 다시 해 주세요.'); return; }
            const cv = dmkClean(dmkRm.cv);
            if (cv.t === 'dcover') {                                           // 📅 날짜형바인더 = 그 해 권 (js/dyyear.js)
                const r = window.dyyAssemble ? dyyAssemble(cv, dmkClean(dmkRm.rf[0])) : null;
                if (r === 'old') { showMsg(`📅 ${cv.y}년 표지는 해가 지나서 조립할 수 없어요.`); return null; }
                if (!r) { showMsg('⚠ 조립하지 못했어요.'); return null; }
                closeModal('dmkRoom'); dmkRm = null; return r;
            }
            dmkRm.g = String(dmkRm.g || '').trim().replace(/\s+/g, ' ') || '내 바인더';
            if (!dmkRm.id) dmkRm.id = dymNewId();
            const rf = dmkRm.rf.map(dmkClean).filter(Boolean);
            const d = dmkClean({ id: dmkRm.id, t: 'binder', g: dmkRm.g, n: cv.n, c: cv.c, cols: cv.cols, cv: cv.id, cg: cv.g, cvf: cv.from, cvw: cv.cw, rf: rf.map(x => ({ id: x.id, g: x.g, pg: x.pg, lv: x.lv, from: x.from })), from: dmkRm.from || 'mine' });
            const used = new Set([cv.id].concat(rf.map(x => x.id)));
            [dmkRm.o0.cv].concat(dmkRm.o0.rf).filter(Boolean).forEach(x => { if (!used.has(x.id)) dymPut(dmkClean(x)); });   // 뺀 표지 · 내지 = 재료로 돌아와요
            const had = new Set([dmkRm.o0.cv && dmkRm.o0.cv.id].concat(dmkRm.o0.rf.map(x => x.id)).filter(Boolean));
            used.forEach(id => { if (!had.has(id)) dymDel(id); });              // 새로 끼운 것 = 재료에서 빠져요
            dyoPut(d);
            closeModal('dmkRoom'); dmkRm = null;
            if (quiet) { if (window.dkDeskBooks) dkDeskBooks(); } else dmkUse(d);
            return d.id;
        }
        /* 🧩 바인더 풀기 (도련 11-21 '조립된 표지 · 내지를 바구니로 옮길 수 있게') : 고치는 중인 바인더 = 표지 · 끼운 내지 모두 재료 바구니로 · 그 권은 없어져요
           꾸민 페이지가 있으면 못 풀어요 (쓴 바인더) · 조립할 때 재료로 돌려놓는 것과 같은 길 (dmkRoomSave 의 '뺀 것 = 재료로') */
        function dmkRmUnbind() {
            if (!dmkRm || !dmkRm.id) return false;
            const d = dmkGet(dmkRm.id); if (!d || dmkFilledMax(d.id) > 0) return false;
            [dmkRm.o0.cv].concat(dmkRm.o0.rf).filter(Boolean).forEach(x => { const c = dmkClean(x); if (c) dymPut(c); });   // 표지 · 내지 = 재료로 돌아와요
            if (window.dyNow && dyNow().id === d.id && window.dySet) dySet(DY_DEF);
            dyoDel(d.id); dmkRm = null; dmkRmInit('');
            if (window.dkDeskBooks) dkDeskBooks();
            return true;
        }
        async function dmkRoomDelete() {
            const d = dmkGet(dmkRm.id); if (!d) return;
            if (!(await showMsg(`🗑 <b>${dmkEsc(d.g)}</b> 바인더를 버릴까요?<br><span style="font-size:12px;color:#777;">끼운 표지 · 내지도 함께 버려져요. 꾸민 페이지는 드라이브 다이어리 폴더에 그대로 남아요.</span>`, true))) return;
            if (dyNow().id === d.id) dySet(DY_DEF);
            dmkPut({ id: d.id, del: true });
            dmkRoomClose();
        }

        window.dmkOpen = dmkOpen; window.dmkAll = dmkAll; window.dmkParts = dmkParts; window.dmkGet = dmkGet; window.dmkSync = dmkSync; window.dmkEsc = dmkEsc; window.dkLeafOf = dkLeafOf;
        window.dmkRoomOpen = dmkRoomOpen; window.dmkRmInit = dmkRmInit; window.dmkRmUnbind = dmkRmUnbind; window.dmkFilledMax = dmkFilledMax; window.dmkLockPage = dmkLockPage; window.dmkLocked = dmkLocked; window.dmkRmPool = dmkRmPool; window.dmkRmDate = dmkRmDate; window.dmkRmN = dmkRmN; window.dmkRmFilled = dmkRmFilled; window.dmkRmLock = dmkRmLock; window.dmkRmState = () => dmkRm; window.dmkClean = dmkClean; window.dmkCvThumb = dmkCvThumb; window.dmkRfThumb = dmkRfThumb; window.dmkRoomSave = dmkRoomSave; window.dmkRoomClose = dmkRoomClose; window.dmkRoomDelete = dmkRoomDelete; window.dmkRoomPrev = dmkRoomPrev; window.dmkRmPick = dmkRmPick; window.dmkRmAdd = dmkRmAdd; window.dmkRmOut = dmkRmOut;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dymaker'] = true;
