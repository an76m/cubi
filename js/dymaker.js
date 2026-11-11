/* 말랑달콤 다이어리 - js/dymaker.js
   📓 노트 만들기 (완제품) · 🗂️ 바인더 (조립식) (도련 · 10-18 · 다이어리 창 → 📓 노트 · 🗂️ 바인더 → 내가만든 칸)
   - 📓 노트 = 완제품 : 이름 · 크기 · 묶음 · 표지 색 · 페이지 수 · 내지(페이지 구간마다)를 한 번에 정해서 한 권 → 바로 📚 다이어리 / _목록.json 한 줄 (from mine · js/dyown.js)
   - 🗂️ 바인더 = 조립품 (도련 10-18 · 11-07 · 981) : 표지와 내지는 🧩 재료 (다이어리 / _바인더재료목록.json 두 칸) → 🧩 바인더 조립에서 끼우면 다이어리 목록에 한 줄
       바인더 표지 만들기 : 이름 · 크기 · 표지 색 (6공 링)  → 바인더표지 재료 (from mine)
       내지 만들기        : 이름 · 크기 · 페이지 수 · 내지 구간 → 바인더내지 재료 (from mine)
       📑 하나 더 : 같은 표지 · 내지를 또 하나 (재료는 쓰면 빠지니까)
       🧩 바인더 조립 : 표지 하나 + 같은 크기 내지를 원하는 만큼 (순서대로) = 쓸 수 있는 바인더 한 권 · 끼운 표지 · 내지는 재료에서 빠져요 (현실처럼)
         · 끼울 때의 모양을 그대로 담아요 · 빼면 (꾸민 페이지가 없는 내지만) 재료로 돌아와요 · 표지를 바꾸면 예전 표지도 돌아와요
         · 📅 날짜형바인더 = 해가 적힌 표지(샵 · 첫 선물) + 날짜 내지 하나 (해 없음 · 표지의 해를 따라가요) · 해가 지난 표지는 조립 못 해요 · 조립하면 내지를 빼지 않아요 (js/dyyear.js dyyAssemble)
   - 만든 노트 · 조립한 바인더 = 다이어리 종류 하나 (js/skins.js DY_TYPES 와 같은 모양 + my · pg · lv) → 고르면 그 권이 열려요
   - 꾸민 내용 : 다이어리 / <권 id> / 1페이지.json … (js/drive.js)
   - 내지 : 구간에 없는 페이지는 줄노트 · 그 페이지에서 속지를 바꾸면 그 페이지만 바뀌어요 (js/elements.js · js/leafpad.js dkLeafOf)
   - 📐 상품공방 다이어리와 같은 설계도 (도련 11-05) : 크기 · 묶음 · 내지 · 고를 색 = js/maker.js 값 표 (MK.SPECS · BINDS · LEAFS · COLORS)
       색 = 4색 (표지 · 테두리 · 강조 · 속지 · cols) · 표지 색 하나를 고르면 나머지가 저절로 (MK.dyAuto) · 🎨 세부 색에서 하나씩 바꿔요 · 펼치면 그 권 색 (js/dyyear.js dyyColorPaint)
       🗂️ 상품 페이지바인더도 표지로 골라 조립 (처음 끼워진 내지 + 내 내지 더 끼우기) */

        const DMK_SZ = MK.SPECS.map(([n, w, h]) => [n, `${w}×${h}`, h / w]);   // 📐 상품공방과 같은 규격 표 (js/maker.js)
        const DMK_SIZES = { '노트': DMK_SZ, '바인더': DMK_SZ };
        const DMK_BINDS = { '노트': MK.BINDS.filter(b => b[0] !== 'ring'), '바인더': MK.BINDS.filter(b => b[0] === 'ring') };
        const DMK_COLORS = MK.COLORS.slice(0, 10);
        const DMK_LEAFS = MK.LEAFS;
        const DMK_CN = [['표지색', '표지'], ['테두리색', '테두리'], ['강조색', '강조'], ['속지색', '속지']];
        const dmkCols = (v, c) => v && typeof v === 'object' && String(v.표지색 || '') && ['테두리색', '강조색', '속지색'].every(n => /^#[0-9a-f]{6}$/i.test(v[n] || '')) ? { 표지색: String(v.표지색).slice(0, 120), 테두리색: v.테두리색, 강조색: v.강조색, 속지색: v.속지색 } : MK.dyAuto(c);
        const DMK_PG = { min: 10, max: 200, def: 30 }, DMK_BIND_MAX = 600;     // 바인더 한 권에 끼울 수 있는 페이지
        /* 종류 : note 노트 · binder 조립한 바인더 (= 📚 다이어리 목록) · cover 바인더 표지 · refill 내지 · dcover 해가 적힌 날짜 표지 · drefill 날짜 내지 (= 🧩 재료 목록 · js/dyown.js) */
        const DMK_T = {
            note: { k: '노트', name: '노트', icon: '📓' },
            cover: { k: '바인더', name: '바인더 표지', icon: '🗂️' },
            refill: { k: '바인더', name: '내지', icon: '📄' },
            dcover: { k: '바인더', name: '날짜형 바인더 표지', icon: '📅' },
            drefill: { k: '바인더', name: '날짜형 바인더 내지', icon: '📅' },
            dnote: { k: '노트', name: '날짜형노트', icon: '📓' },              // ✏️ 내가 만드는 날짜형 (도련 11-11 · 만들기 창에서만 · 저장은 dmkSaveDated)
            binder: { k: '바인더', name: '바인더', icon: '🗂️' }
        };
        const dmkEsc = htmlEsc;   // 🧰 js/util.js
        const dmkQ = id => document.getElementById(id);
        const dmkShut = (...ids) => ids.forEach(id => { if (dmkQ(id)) closeModal(id); });
        const dmkLeafName = v => (DMK_LEAFS.find(l => l[0] === v) || DMK_LEAFS[0])[1];

        /* ---------- 만든 것 목록 (바로 꺼내 쓰는 쪽) ---------- */
        function dmkMap() { const m = {}; dyoAll().filter(x => x.t !== 'date').concat(dymAll('cover'), dymAll('refill')).forEach(x => { m[x.id] = x; }); return m; }   // 📚 권 + 🧩 재료
        const dmkPg = v => Math.max(DMK_PG.min, Math.min(DMK_PG.max, Math.round(+v) || DMK_PG.def));
        function dmkLv(lv, pg) {                                               // 내지 구간 [[처음, 끝, 내지] …] 확인
            return (Array.isArray(lv) ? lv : []).map(r => Array.isArray(r) ? [Math.max(1, Math.round(+r[0]) || 1), Math.min(pg, Math.round(+r[1]) || pg), DMK_LEAFS.some(l => l[0] === r[2]) ? r[2] : 'line'] : null).filter(r => r && r[0] <= r[1]);
        }
        function dmkClean(d) {                                                  // 드라이브 · 설정에서 읽은 것 확인
            if (!d || typeof d !== 'object' || !/^my[\w-]{1,30}$/.test(d.id || '')) return null;
            const t = DMK_T[d.t] ? d.t : d.k === '바인더' ? 'binder' : 'note', k = DMK_T[t].k;
            const sz = DMK_SIZES[k].find(s => s[0] === d.n) || DMK_SIZES[k].find(s => s[0] === 'A5');
            const o = { id: d.id, t, k, g: String(d.g || '').slice(0, 20) || '내 ' + DMK_T[t].name, n: sz[0], mm: sz[1], r: sz[2], from: dyoFrom(d.from, 'mine') };
            if (d.start) o.start = 1;                                            // 🎁 처음받기 (도련 11-09)
            if (t === 'dcover') { const D = window.dyyDesignOf ? dyyDesignOf(d.d) : null; return Object.assign(o, { y: Math.round(+d.y) || new Date().getFullYear(), d: String(d.d || ''), n: D ? D.n : o.n, mm: D ? D.mm : o.mm, r: D ? D.r : o.r, c: D ? D.c : DMK_COLORS[6], b: 'ring' }, d.md && typeof d.md === 'object' ? { md: d.md } : {}); }   // 📅 해가 적힌 표지 = 그 디자인 그대로 · ✏️ 내가 만든 표지 = md (도련 11-11)
            if (d.pid) o.pid = String(d.pid).slice(0, 60);                      // 🏪 받은 상품 id
            if (t === 'drefill') return Object.assign(o, { lf: DMK_LEAFS.some(l => l[0] === d.lf) ? d.lf : 'line' });   // 📅 날짜 내지 (해 없음 · 크기 n = 같은 크기 표지에만)
            const color = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : DMK_COLORS[k === '바인더' ? 6 : 0];
            if (t === 'note') { const pg = dmkPg(d.pg); return Object.assign(o, { my: 1, b: DMK_BINDS[k].some(x => x[0] === d.b) ? d.b : DMK_BINDS[k][0][0], c: color(d.c), cols: dmkCols(d.cols, color(d.c)), cw: !!(d.cw && d.cols), pg, lv: dmkLv(d.lv, pg) }); }
            if (t === 'cover') return Object.assign(o, { b: 'ring', c: color(d.c), cols: dmkCols(d.cols, color(d.c)), cw: !!(d.cw && d.cols) });
            if (t === 'refill') { const pg = dmkPg(d.pg); return Object.assign(o, { pg, lv: dmkLv(d.lv, pg) }); }
            /* 조립한 바인더 : 끼운 내지(rf · 끼울 때 모양 그대로)를 이어 붙여 페이지 · 내지 구간 */
            const rf = (Array.isArray(d.rf) ? d.rf : []).map(x => { if (!x || typeof x !== 'object') return null; const pg = dmkPg(x.pg); return { id: String(x.id || ''), g: String(x.g || '').slice(0, 20) || '내지', pg, lv: dmkLv(x.lv, pg), from: dyoFrom(x.from, 'mine') }; }).filter(Boolean);   // from = 그 내지를 어디서 (빼면 그대로 재료로)
            let at = 0; const lv = [];
            rf.forEach(x => { lv.push([at + 1, at + x.pg, 'line']); x.lv.forEach(r => lv.push([at + r[0], at + r[1], r[2]])); at += x.pg; });   // 내지마다 줄노트로 깔고 그 위에 구간 (뒤에 넣은 게 먼저 찾아지게 아래서 뒤집어요)
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
        function dmkCvThumb(c, r, H) { return `<span class="dmk-cvth" style="--c:${c};width:${Math.round(H / r)}px;height:${H}px"></span>`; }
        function dmkRfThumb(lv, r, H) { return `<span class="lf-pick dmk-rfth" style="width:${Math.round(H / r)}px;height:${H}px"><i class="lf-sw lf-${(lv[0] || [0, 0, 'line'])[2]}"></i></span>`; }
        const dmkLvText = (lv, pg) => { const l = lv.length ? lv : [[1, pg, 'line']]; return l.length === 1 ? dmkLeafName(l[0][2]) : l.map(r => `${r[0]}~${r[1]} ${dmkLeafName(r[2])}`).join(' · '); };

        /* ---------- 만들기 창 : 📓 노트 · 🗂️ 바인더 표지 · 📄 내지 (한 창을 같이 써요) ---------- */
        let dmk = null;                                                         // 지금 만드는 것 { t, k, id(고칠 때), g, n, b, c, pg, lv }
        function dmkOpen(kind, id) {                                           // js/skins.js 내가만든 칸 : 노트 → 만들기 · 바인더 → 🧩 조립
            if (kind === '바인더') return dmkRoomOpen(id || '');
            dmkForm('note', id);
        }
        /* 🗂️ 바인더 만들기 (도련 11-11 · 다이어리 창 '바인더 만들기' → 표지만 · 내지만) : 만들면 🧩 재료로 보관만 (조립 창을 열지 않아요 · 조립은 '바인더 조립') */
        let dmkSolo = false;
        function dmkMakeBinder(t) { dmkSolo = true; dmkForm(['refill', 'dcover', 'drefill'].includes(t) ? t : 'cover'); }
        /* 📓 노트 만들기 (도련 11-11) : 날짜형노트 · 페이지노트 · 🗂️ 바인더 만들기 : 날짜형 · 페이지 표지와 내지 */
        const DMK_DATED = ['dnote', 'dcover', 'drefill'];
        function dmkMakeNote(t) { if (t === 'dnote') { dmkSolo = true; dmkForm('dnote'); } else dmkForm('note'); }
        function dmkForm(t, id) {
            const T = DMK_T[t], k = T.k, old = id ? dmkGet(id) : null;
            dmk = old ? JSON.parse(JSON.stringify(old)) : { t, k, g: '', n: dmkRm && dmkRmN() && t !== 'note' && t !== 'dnote' ? dmkRmN() : 'A5', b: DMK_BINDS[k][0][0], c: DMK_COLORS[t === 'note' || t === 'dnote' ? 0 : 6], pg: DMK_PG.def, lv: [[1, DMK_PG.def, 'line']], y: new Date().getFullYear(), lf: 'line' };
            if (!dmk.lv || !dmk.lv.length) dmk.lv = [[1, dmk.pg || DMK_PG.def, 'line']];
            dmkBuild();
            dmkQ('dmkModal').dataset.t = t;
            dmkQ('dmkTitle').textContent = T.icon + ' ' + (old ? T.name + ' 고치기' : '새 ' + T.name + ' 만들기');
            dmkQ('dmkName').value = dmk.g; dmkQ('dmkName').placeholder = '내 ' + T.name;
            dmkQ('dmkDel').hidden = !old; dmkQ('dmkDup').hidden = !old || t === 'note';
            dmkQ('dmkOk').textContent = old ? '💾 저장' : t === 'note' || t === 'dnote' ? '✨ 만들기' : '📤 보관하기';
            dmkQ('dmkHint').textContent = { cover: '페이지 바인더 표지만 만들어요 · 🧩 바인더 조립에서 같은 크기 페이지 내지를 끼워요', refill: '페이지 바인더 내지만 만들어요 · 같은 크기 페이지 바인더 표지에 끼워 써요', dcover: '해가 적힌 날짜형 바인더 표지예요 · 🧩 바인더 조립에서 같은 크기 날짜형 내지를 끼워요', drefill: '날짜형 바인더 내지예요 · 해가 없어요 (끼운 표지의 해를 따라가요) · 같은 크기 날짜형 표지에 끼워요', dnote: '1월 1일 ~ 12월 31일 하루 한 쪽 날짜형노트예요 · 완제품이라 바로 써요' }[t] || '';
            dmkRender();
            dmkShut('dyModal', 'dmkRoom'); openModal('dmkModal');
        }
        function dmkBuild() {
            if (dmkQ('dmkModal')) return;
            document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="dmkModal">
        <div class="modal-content dmk-win">
            <div class="modal-title" id="dmkTitle">📓 새 노트 만들기</div>
            <div class="dmk-hint" id="dmkHint"></div>
            <div class="dmk-prev" id="dmkPrev"></div>
            <label class="dmk-row"><b>이름</b><input id="dmkName" class="dmk-name" maxlength="20" autocomplete="off" oninput="dmk.g = this.value; dmkPrevDraw()"></label>
            <div class="dmk-row"><b>크기</b><div class="dmk-chips" id="dmkSize"></div></div>
            <div class="dmk-row" data-on="note dnote"><b>묶음</b><div class="dmk-chips" id="dmkBind"></div></div>
            <div class="dmk-row" data-on="dnote dcover"><b>해</b><div class="dmk-chips" id="dmkYear"></div></div>
            <div class="dmk-row" data-on="note cover dnote dcover"><b>표지 색</b><div class="dmk-sw" id="dmkColor"></div></div>
            <details class="dmk-row dmk-col" data-on="note cover dnote dcover"><summary><b>🎨 세부 색</b> <small>표지 · 테두리 · 강조 · 속지 (표지 색을 고르면 저절로 · 하나씩 바꿀 수 있어요)</small></summary><div class="dmk-cols" id="dmkCols"></div></details>
            <div class="dmk-row" data-on="note refill"><b>페이지 수</b><div class="dmk-pg"><button type="button" class="dmk-step" onclick="dmkPages(-10)">−</button><input id="dmkPg" type="number" inputmode="numeric" min="${DMK_PG.min}" max="${DMK_PG.max}" onchange="dmkPages(0, this.value)"><button type="button" class="dmk-step" onclick="dmkPages(10)">＋</button><small>${DMK_PG.min}~${DMK_PG.max}페이지</small></div></div>
            <div class="dmk-row dmk-col" data-on="dnote drefill"><b>내지 <small>모든 날 같은 내지</small></b><div class="dmk-lv-pick" id="dmkLf1"></div></div>
            <div class="dmk-row dmk-col" data-on="note refill"><b>내지 <small>페이지 구간마다 골라요</small></b><div id="dmkLeaf"></div>
                <button type="button" class="dmk-add" onclick="dmkLeafAdd()">✂️ 구간 나누기</button></div>
            <div class="sub-modal-btns">
                <button class="btn" id="dmkDel" type="button" onclick="dmkDelete()">🗑 지우기</button>
                <button class="btn" id="dmkDup" type="button" onclick="dmkDup()" title="같은 것을 하나 더 (재료는 끼우면 빠져요)">📑 하나 더</button>
                <button class="btn" type="button" onclick="dmkClose()">취소</button>
                <button class="btn dmk-ok" id="dmkOk" type="button" onclick="dmkSave()">✨ 만들기</button>
            </div>
        </div>
    </div>`);
        }
        const dmkDesign = () => dmkClean(Object.assign({ id: dmk.id || 'my-new' }, dmk, { g: dmk.g || '내 ' + DMK_T[dmk.t].name }));
        function dmkPrevDraw() {
            if (DMK_DATED.includes(dmk.t)) {                                     // ✏️ 날짜형 (도련 11-11)
                const sz = DMK_SIZES[dmk.k].find(s => s[0] === dmk.n) || DMK_SIZES[dmk.k][0], r = sz[2], H = 96, cols = dmk.cw && dmk.cols ? dmk.cols : MK.dyAuto(dmk.c);
                const pic = dmk.t === 'dcover' ? dmkCvThumb(dmk.c, r, H) : dmk.t === 'drefill' ? dmkRfThumb([[1, 1, dmk.lf || 'line']], r, H) : `<span class="dy-th" data-b="${dmk.b}" style="--dy-c:${cols.테두리색};--dy-p:${cols.속지색};width:${Math.round(H / r * 2)}px;height:${H}px"><i></i><i></i></span>`;
                dmkQ('dmkPrev').innerHTML = `${pic}<span class="dmk-prev-n">${dmkEsc(dmk.g || '내 ' + DMK_T[dmk.t].name)}<small>${sz[0]} · ${sz[1]}mm${dmk.t === 'drefill' ? ' · 해 없음' : ' · 📅 ' + dmk.y + '년'}${dmk.t === 'dcover' ? ' · 6공 링' : ''}</small></span>`;
                return;
            }
            const t = dmkDesign(), H = 96;
            const pic = t.t === 'cover' ? dmkCvThumb(t.c, t.r, H) : t.t === 'refill' ? dmkRfThumb(t.lv, t.r, H) : `<span class="dy-th" data-b="${t.b}" style="--dy-c:${t.cols.테두리색};--dy-p:${t.cols.속지색};width:${Math.round(H / t.r * 2)}px;height:${H}px"><i></i><i></i></span>`;
            const sub = t.t === 'cover' ? `${t.n} · ${t.mm}mm · 6공 링` : `${t.n} · ${t.mm}mm · ${t.pg}페이지`;
            dmkQ('dmkPrev').innerHTML = `${pic}<span class="dmk-prev-n">${dmkEsc(t.g)}<small>${sub}</small></span>`;
        }
        function dmkRender() {
            const k = dmk.k, t = dmk.t;
            dmkQ('dmkModal').querySelectorAll('[data-on]').forEach(el => { el.hidden = !el.dataset.on.split(' ').includes(t); });
            dmkQ('dmkSize').innerHTML = DMK_SIZES[k].map(([n, mm]) => `<button type="button" class="dmk-chip${dmk.n === n ? ' on' : ''}" onclick="dmk.n='${n}'; dmkRender()">${n}<small>${mm}</small></button>`).join('');
            dmkQ('dmkBind').innerHTML = DMK_BINDS[k].map(([v, n]) => `<button type="button" class="dmk-chip${dmk.b === v ? ' on' : ''}" onclick="dmk.b='${v}'; dmkRender()">${n}</button>`).join('');
            dmkQ('dmkColor').innerHTML = DMK_COLORS.map(c => `<button type="button" class="dmk-c${dmk.c === c ? ' on' : ''}" style="--c:${c}" title="${c}" onclick="dmk.c='${c}'; dmk.cw = false; dmkRender()"></button>`).join('') + `<input type="color" class="dmk-cpick" value="${dmk.c}" title="다른 색" oninput="dmk.c=this.value; dmk.cw = false; dmkRender()">`;
            if (!dmk.cw) dmk.cols = MK.dyAuto(dmk.c);                           // 🎨 세부 색을 직접 바꾸기 전에는 표지 색을 따라가요
            const hx = v => (String(v).match(/#[0-9a-f]{6}/i) || ['#ffffff'])[0];
            dmkQ('dmkCols').innerHTML = DMK_CN.map(([k, n]) => `<label class="dmk-cl"><input type="color" value="${hx(dmk.cols[k])}" oninput="dmkColSet('${k}', this.value)"><span>${n}</span></label>`).join('') + `<button type="button" class="dmk-chip" onclick="dmk.cw = false; dmkRender()">↺ 저절로</button>`;
            const Y = new Date().getFullYear();
            dmkQ('dmkYear').innerHTML = [Y, Y + 1].map(y => `<button type="button" class="dmk-chip${+dmk.y === y ? ' on' : ''}" onclick="dmk.y=${y}; dmkRender()">${y}</button>`).join('');   // 📅 올해 · 내년
            dmkQ('dmkLf1').innerHTML = DMK_LEAFS.map(([v, n]) => `<button type="button" class="lf-pick dmk-lf${(dmk.lf || 'line') === v ? ' on' : ''}" onclick="dmk.lf='${v}'; dmkRender()"><i class="lf-sw lf-${v}"></i>${n}</button>`).join('');
            dmkQ('dmkPg').value = dmk.pg;
            const many = dmk.lv.length > 1;
            dmkQ('dmkLeaf').innerHTML = dmk.lv.map((r, i) => `<div class="dmk-lv">
                <div class="dmk-lv-r"><input type="number" inputmode="numeric" value="${r[0]}" ${i ? '' : 'disabled'} onchange="dmkLeafEdge(${i}, 0, this.value)"><span>~</span><input type="number" inputmode="numeric" value="${r[1]}" ${i === dmk.lv.length - 1 ? 'disabled' : ''} onchange="dmkLeafEdge(${i}, 1, this.value)"><span>페이지</span>${many ? `<button type="button" class="dmk-x" title="이 구간 빼기" onclick="dmkLeafDel(${i})">✕</button>` : ''}</div>
                <div class="dmk-lv-pick">${DMK_LEAFS.map(([v, n]) => `<button type="button" class="lf-pick dmk-lf${r[2] === v ? ' on' : ''}" onclick="dmkLeafSet(${i}, '${v}')"><i class="lf-sw lf-${v}"></i>${n}</button>`).join('')}</div></div>`).join('');
            dmkQ('dmkLeaf').closest('.dmk-row').querySelector('.dmk-add').hidden = dmk.lv[dmk.lv.length - 1][1] - dmk.lv[dmk.lv.length - 1][0] < 1 || dmk.lv.length >= 10;
            dmkPrevDraw();
        }
        /* 페이지 수 : 마지막 구간이 늘거나 줄어요 (노트를 고칠 때는 이미 꾸민 페이지보다 적게 못 해요) */
        function dmkPages(step, val) {
            let pg = val != null ? Math.round(+val) || dmk.pg : dmk.pg + step;
            const lo = Math.max(DMK_PG.min, dmk.t === 'note' ? dmkFilledMax(dmk.id) : 0, dmk.lv.length > 1 ? dmk.lv[dmk.lv.length - 1][0] : 1);
            pg = Math.max(lo, Math.min(DMK_PG.max, pg));
            dmk.pg = pg; dmk.lv[dmk.lv.length - 1][1] = pg;
            dmkRender();
        }
        function dmkLeafSet(i, v) { dmk.lv[i][2] = v; dmkRender(); }
        function dmkColSet(k, v) { dmk.cols = Object.assign({}, dmk.cols, { [k]: k === '표지색' ? `linear-gradient(135deg, ${v} 0%, ${MK.mix(v, '#ffffff', .55)} 99%)` : v }); dmk.cw = true; dmkPrevDraw(); }   // 🎨 하나씩 (표지 = 그 색 그라데이션)
        function dmkLeafAdd() {                                                 // 마지막 구간을 반으로 나눠요
            const r = dmk.lv[dmk.lv.length - 1]; if (r[1] - r[0] < 1) return;
            const mid = Math.floor((r[0] + r[1]) / 2);
            dmk.lv.push([mid + 1, r[1], r[2] === 'grid' ? 'line' : 'grid']); r[1] = mid;
            dmkRender();
        }
        function dmkLeafDel(i) {                                                // 빼면 앞 구간(맨 앞이면 뒤 구간)이 그 자리를 채워요
            if (dmk.lv.length < 2) return;
            const [r] = dmk.lv.splice(i, 1);
            if (i > 0) dmk.lv[i - 1][1] = r[1]; else dmk.lv[0][0] = 1;
            dmkRender();
        }
        function dmkLeafEdge(i, side, val) {                                    // 구간 끝을 옮기면 옆 구간도 같이
            const lv = dmk.lv, v = Math.round(+val);
            if (side === 1) { const lo = lv[i][0], hi = lv[i + 1][1] - 1; lv[i][1] = Math.max(lo, Math.min(hi, v || lo)); lv[i + 1][0] = lv[i][1] + 1; }
            else { const lo = lv[i - 1][0] + 1, hi = lv[i][1]; lv[i][0] = Math.max(lo, Math.min(hi, v || hi)); lv[i - 1][1] = lv[i][0] - 1; }
            dmkRender();
        }
        function dmkClose() {
            closeModal('dmkModal');
            if (dmk && dmk.t === 'dnote') { dmkSolo = false; return openModal('noteMkModal'); }   // 📓 노트 만들기로 돌아가요 (도련 11-11)
            if (dmk && dmk.t !== 'note' && dmkSolo) { dmkSolo = false; return openModal('bindMkModal'); }   // 🗂️ 바인더 만들기로 돌아가요 (도련 11-11)
            if (dmk && dmk.t !== 'note') return dmkRoomOpen(null);             // 표지 · 내지는 🧩 조립으로 돌아가요
            dyOpen('노트'); dyTabSet('mine');
        }
        /* ✏️ 날짜형 만들기 저장 (도련 11-11) : 📓 날짜형노트 = 바로 한 권 · 📅 날짜형 표지 · 내지 = 🧩 재료로 보관 */
        async function dmkSaveDated() {
            const t = dmk.t, T = DMK_T[t], sz = DMK_SIZES[dmk.k].find(s => s[0] === dmk.n) || DMK_SIZES[dmk.k][0];
            const g = (dmkQ('dmkName').value || '').trim().replace(/\s+/g, ' ').slice(0, 20) || '내 ' + T.name, y = Math.round(+dmk.y) || new Date().getFullYear();
            const cols = dmk.cw && dmk.cols ? dmk.cols : MK.dyAuto(dmk.c);
            const md = { id: dymNewId() + (t === 'dnote' ? '노트' : ''), ch: t === 'dnote' ? 'n' : 'b', name: g, n: sz[0], mm: sz[1], r: sz[2], b: t === 'dnote' ? dmk.b : 'ring', cols, lf: dmk.lf || 'line' };   // 노트 디자인 이름 끝 = 노트 (폴더 이름으로 되살릴 때)
            if (t === 'dnote') {
                const id = window.dyyMakeNote ? dyyMakeNote(md, y) : '';
                closeModal('dmkModal'); dmkSolo = false;
                if (!id) { showMsg('⚠ 만들지 못했어요. 잠시 뒤 다시 해 주세요.'); return; }
                showMsg(`📓 날짜형노트 <b>${dmkEsc(g)}</b>를 만들었어요.<br><small>📒 다이어리 → 📓 날짜형노트에 있어요</small>`);
                return;
            }
            try { if (!await dymReady()) return; } catch (e) { showMsg('⚠ 지금은 저장하지 못했어요. 잠시 뒤 다시 해 주세요.'); return; }
            if (t === 'dcover') { dymPut({ id: dymNewId(), t: 'dcover', y, d: md.id, g: `${y} ${g}`, from: 'mine', md }); if (window.dyoMy) dyoMy({ md }); }
            else dymPut({ id: dymNewId(), t: 'drefill', n: sz[0], lf: dmk.lf || 'line', g, from: 'mine' });
            closeModal('dmkModal'); dmkSolo = false;
            showMsg(`${t === 'dcover' ? '📅 날짜형 바인더 표지' : '📅 날짜형 바인더 내지'} <b>${dmkEsc(t === 'dcover' ? y + ' ' + g : g)}</b>를 보관했어요.<br><small>🧩 바인더 조립에서 같은 크기 표지 · 내지를 골라 한 권으로 만들어요</small>`);
        }
        async function dmkSave() {
            if (DMK_DATED.includes(dmk.t)) return dmkSaveDated();
            const T = DMK_T[dmk.t], fresh = !dmk.id;
            dmk.g = (dmkQ('dmkName').value || '').trim().replace(/\s+/g, ' ') || '내 ' + T.name;
            if (!dmk.id) dmk.id = dymNewId();
            const d = dmkClean(dmk); if (!d) return;
            if (dymIs(d.t)) { try { if (!await dymReady()) return; } catch (e) { showMsg('⚠ 지금은 저장하지 못했어요. 잠시 뒤 다시 해 주세요.'); return; } }   // 🧩 재료 목록을 먼저 읽고
            dmkPut(d);                                                          // 📓 노트 = 다이어리 목록 한 줄 · 🧩 표지 · 내지 = 재료 목록 한 줄
            closeModal('dmkModal');
            if (d.t !== 'note' && dmkSolo) {                                   // 🗂️ 바인더 만들기 = 보관만 (도련 11-11)
                dmkSolo = false;
                showMsg(`${d.t === 'cover' ? '🗂️ 바인더 표지' : '📄 바인더 내지'} <b>${dmkEsc(d.g)}</b>를 보관했어요.<br><small>🧩 바인더 조립에서 마음에 드는 표지 · 내지를 골라 한 권으로 만들어요</small>`);
                return;
            }
            if (d.t !== 'note') {                                              // 새로 만든 표지는 바로 골라 두고 · 새 내지는 바로 끼워 둬요
                if (dmkRm && fresh) { if (d.t === 'cover') dmkRmPick(d.id); else dmkRmAdd(d.id); }
                return dmkRoomOpen(null);
            }
            dmkUse(d);
        }
        /* 📑 하나 더 : 지금 고치는 표지 · 내지를 하나 더 (같은 모양 · 새 하나) */
        async function dmkDup() {
            const d = dmk && dmk.id && dmkGet(dmk.id); if (!d || !dymIs(d.t)) return;
            try { if (!await dymReady()) return; } catch (e) { return; }
            dmkPut(Object.assign({}, d, { id: dymNewId(), from: 'mine' }));
            showMsg(`📑 ${dmkEsc(d.g)} 하나 더 만들었어요.`);
            if (dmkRm) dmkRoomRender();
        }
        function dmkUse(d) {                                                   // 만든 노트 · 조립한 바인더 열기
            const cur = dyNow().id === d.id;
            if (!cur) dySet(d.id);
            else { if (typeof refreshLayout === 'function') refreshLayout(); if (isCoverOpen && !turn) loadData(); dkCoverPaint(); }   // 고친 크기 · 색 · 내지를 바로
            if (!isCoverOpen && !turn) openCoverAnimated();
        }
        async function dmkDelete() {
            const d = dmkGet(dmk.id); if (!d) return;
            const what = d.t === 'note' ? `노트를 목록에서 지울까요?<br><span style="font-size:12px;color:#777;">꾸민 페이지는 드라이브 다이어리 폴더에 그대로 남아요.</span>` : `${DMK_T[d.t].name}을(를) 지울까요?<br><span style="font-size:12px;color:#777;">이미 조립한 바인더는 그대로예요.</span>`;
            if (!(await showMsg(`🗑 <b>${dmkEsc(d.g)}</b> ${what}`, true))) return;
            if (dymIs(d.t)) { try { if (!await dymReady()) return; } catch (e) { return; } }
            if (dyNow().id === d.id) dySet(DY_DEF);
            dmkPut({ id: d.id, del: true });
            if (dmkRm && dmkRm.cv && dmkRm.cv.id === d.id) dmkRm.cv = null;
            dmkClose();
        }

        /* 🎁 처음 선물 📓 페이지노트 · 🗂️ 페이지바인더 (도련 11-06 · 상품공방 '처음받기' 체크 · 앱이 정하지 않아요 · js/desk.js giftEnsure)
           그 상품 모양 그대로 한 권씩 📚 다이어리 목록에 (from gift · 바인더 = 상품 표지 + 처음 끼워진 내지 · 조립된 채로 · 재료 목록에는 없어요) → 준 권 수 */
        function dmkGiftRefill(p) {                                            // 🎁 첫 선물 페이지바인더에 끼울 내지 = 표지 상품 '처음내지' (없으면 같은 크기 페이지 내지 · 그것도 없으면 줄노트 100쪽)
            const R = (typeof DY_REFILLS !== 'undefined' ? DY_REFILLS : []).filter(r => r.t === 'page' && r.n === p.n), r = R.find(x => x.id === p.rf0) || R[0];
            return r ? { id: 'p:' + r.id, g: r.g, pg: r.pg, lv: r.lv, from: 'basic' } : { id: 'p:' + p.id, g: p.g + ' 내지', pg: 100, lv: [[1, 100, 'line']], from: 'basic' };
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
        function dmkRmInit(id) {                                               // 조립 시작 ('' = 새 바인더 · 권 id = 고치기) · 🧩 책상 바인더 조립(js/binderroom.js)도 같이 써요
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
            dmkQ('dmkRoomOk').textContent = dmkRm.id ? '💾 저장' : '🧩 조립하기';
            dmkRoomRender();
            dmkShut('dyModal', 'dmkModal'); openModal('dmkRoom');
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
            dymAll(k).concat(back).forEach(x => { const c = dmkClean(x); if (c && !seen.has(c.id) && !inNow.has(c.id)) { seen.add(c.id); L.push(c); } });
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
            else {
                if (r.t !== 'refill' || r.n !== dmkRmN()) return;
                if (dmkRm.rf.reduce((s, x) => s + x.pg, 0) + r.pg > DMK_BIND_MAX) { showMsg(`바인더 한 권에는 ${DMK_BIND_MAX}페이지까지 끼울 수 있어요.`); return; }
                dmkRm.rf.push(r);
            }
            dmkRmRedraw();
        }
        function dmkRmOut(i) { if (!dmkRmDate()) { const st = dmkRm.rf.slice(0, i).reduce((s, x) => s + x.pg, 0); if (st < dmkRmFilled()) return; } dmkRm.rf.splice(i, 1); dmkRmRedraw(); }
        const dmkRfPg = x => x.t === 'drefill' ? 0 : x.pg;
        function dmkRoomPrev() {
            const cv = dmkRm.cv && dmkClean(dmkRm.cv), H = 96;
            if (!cv) { dmkQ('dmkRoomPrev').innerHTML = `<span class="dmk-prev-n">표지를 먼저 골라 주세요<small>표지가 없으면 📒 다이어리 → 🗂️ 바인더 만들기에서 만들거나 🏪 샵에서 받아요</small></span>`; return; }
            const pg = dmkRm.rf.reduce((s, x) => s + dmkRfPg(x), 0);
            const sub = cv.t === 'dcover' ? `📅 ${cv.y}년 · ${cv.n} · ${cv.mm}mm · ${dmkRm.rf.length ? '날짜 내지 끼움' : '날짜 내지를 끼워요'}` : `${cv.n} · ${cv.mm}mm · 내지 ${dmkRm.rf.length}묶음 · ${pg}페이지`;
            dmkQ('dmkRoomPrev').innerHTML = `<span class="dmk-stack">${dmkCvThumb(cv.c, cv.r, H)}${pg ? `<span class="dmk-stack-n">${pg}</span>` : ''}</span><span class="dmk-prev-n">${dmkEsc(dmkRm.g || cv.g || '내 바인더')}<small>${sub}</small></span>`;
        }
        function dmkRoomRender() {
            if (!dmkQ('dmkRoomCv') || !dmkRm) return;
            const lock = dmkRmLock(), filled = dmkRmFilled(), date = dmkRmDate(), n = dmkRmN(), yr = new Date().getFullYear();
            const covers = dmkRmPool('cover').filter(c => !(dmkRm.id && c.t === 'dcover'));
            const cur = dmkRm.cv ? [dmkClean(dmkRm.cv)] : [];
            const ed = (t, id) => `<span class="dy-ed" role="button" tabindex="0" title="고치기" onclick="event.stopPropagation(); dmkForm('${t}', '${id}')">✏️</span>`;
            const cvCard = (c, on) => {
                const old = c.t === 'dcover' && c.y < yr, off = !on && (old || (lock && c.n !== n));
                return `<button type="button" class="dmk-card${on ? ' on' : ''}" ${off ? 'disabled' : ''} onclick="dmkRmPick('${c.id}')" title="${old ? '해가 지난 표지예요' : ''}">${dmkCvThumb(c.c, c.r, 56)}<span>${dmkEsc(c.g)}</span><small>${c.t === 'dcover' ? '📅 ' + c.y : c.n}</small>${!on && c.t === 'cover' && c.from === 'mine' && dymGet(c.id) ? ed('cover', c.id) : ''}</button>`;
            };
            dmkQ('dmkRoomCv').innerHTML = cur.map(c => cvCard(c, true)).join('') + covers.map(c => cvCard(c, false)).join('');
            let at = 0;
            dmkQ('dmkRoomIn').innerHTML = dmkRm.rf.length ? dmkRm.rf.map((x0, i) => {
                const x = dmkClean(x0) || x0;
                if (x.t === 'drefill') return `<div class="dmk-in"><span class="dmk-in-n">📅</span><span class="dmk-in-g">${dmkEsc(x.g)}<small>${dmkRm.cv ? dmkClean(dmkRm.cv).y + '년 날짜로 · ' : ''}${x.lf ? dmkLeafName(x.lf) : ''}</small></span><button type="button" class="dmk-x" title="빼기" onclick="dmkRmOut(${i})">✕</button></div>`;
                const a = at + 1; at += x.pg; const keep = a - 1 < filled;
                return `<div class="dmk-in"><span class="dmk-in-n">${a}~${at}</span><span class="dmk-in-g">${dmkEsc(x.g)}<small>${dmkLvText(x.lv, x.pg)}</small></span>${keep ? '<span class="dmk-in-lock" title="꾸민 페이지가 있어서 뺄 수 없어요">🔒</span>' : `<button type="button" class="dmk-x" title="빼기" onclick="dmkRmOut(${i})">✕</button>`}</div>`;
            }).join('') : `<div class="dmk-empty">아직 끼운 내지가 없어요. 아래에서 눌러 끼워요.</div>`;
            dmkQ('dmkRoomPg').textContent = dmkRm.rf.length && !date ? `${at}페이지` : '';
            dmkQ('dmkRoomRfHint').textContent = date ? '날짜 내지 하나 · 표지의 해를 따라가요' : '누르면 맨 뒤에 끼워요';
            const refills = dmkRmPool('refill').filter(r => (date ? r.t === 'drefill' : r.t === 'refill') && (!n || r.n === n));   // 같은 크기만
            dmkQ('dmkRoomRf').innerHTML = refills.map(r => r.t === 'drefill'
                ? `<button type="button" class="dmk-card" onclick="dmkRmAdd('${r.id}')">${dmkRfThumb([[1, 1, r.lf || 'line']], (dmkRm.cv && dmkClean(dmkRm.cv).r) || 1.4, 56)}<span>${dmkEsc(r.g)}</span><small>📅 날짜</small></button>`
                : `<button type="button" class="dmk-card" ${n ? '' : 'disabled'} onclick="dmkRmAdd('${r.id}')">${dmkRfThumb(r.lv, r.r, 56)}<span>${dmkEsc(r.g)}</span><small>${r.n} · ${r.pg}p</small>${r.from === 'mine' && dymGet(r.id) ? ed('refill', r.id) : ''}</button>`).join('')
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
        async function dmkRoomDelete() {
            const d = dmkGet(dmkRm.id); if (!d) return;
            if (!(await showMsg(`🗑 <b>${dmkEsc(d.g)}</b> 바인더를 버릴까요?<br><span style="font-size:12px;color:#777;">끼운 표지 · 내지도 함께 버려져요. 꾸민 페이지는 드라이브 다이어리 폴더에 그대로 남아요.</span>`, true))) return;
            if (dyNow().id === d.id) dySet(DY_DEF);
            dmkPut({ id: d.id, del: true });
            dmkRoomClose();
        }

        window.dmkOpen = dmkOpen; window.dmkMakeBinder = dmkMakeBinder; window.dmkMakeNote = dmkMakeNote; window.dmkForm = dmkForm; window.dmkSave = dmkSave; window.dmkDelete = dmkDelete; window.dmkDup = dmkDup; window.dmkClose = dmkClose; window.dmkPages = dmkPages; window.dmkLeafSet = dmkLeafSet; window.dmkColSet = dmkColSet; window.dmkLeafAdd = dmkLeafAdd; window.dmkLeafDel = dmkLeafDel; window.dmkLeafEdge = dmkLeafEdge;
        window.dmkRender = dmkRender; window.dmkPrevDraw = dmkPrevDraw; window.dmkAll = dmkAll; window.dmkParts = dmkParts; window.dmkGet = dmkGet; window.dmkSync = dmkSync; window.dmkEsc = dmkEsc; window.dkLeafOf = dkLeafOf;
        window.dmkRoomOpen = dmkRoomOpen; window.dmkRmInit = dmkRmInit; window.dmkRmPool = dmkRmPool; window.dmkRmDate = dmkRmDate; window.dmkRmN = dmkRmN; window.dmkRmFilled = dmkRmFilled; window.dmkRmLock = dmkRmLock; window.dmkRmState = () => dmkRm; window.dmkClean = dmkClean; window.dmkCvThumb = dmkCvThumb; window.dmkRfThumb = dmkRfThumb; window.dmkLvText = dmkLvText; window.dmkLeafName = dmkLeafName; window.dmkRoomSave = dmkRoomSave; window.dmkRoomClose = dmkRoomClose; window.dmkRoomDelete = dmkRoomDelete; window.dmkRoomPrev = dmkRoomPrev; window.dmkRmPick = dmkRmPick; window.dmkRmAdd = dmkRmAdd; window.dmkRmOut = dmkRmOut;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dymaker'] = true;
