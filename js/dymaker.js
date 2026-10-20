/* 말랑달콤 다이어리 - js/dymaker.js
   📓 노트 만들기 (완제품) · 🗂️ 바인더 (조립식) (도련 · 10-18 · 다이어리 창 → 📓 노트 · 🗂️ 바인더 → 내가만든 칸)
   - 📓 노트 = 완제품 : 이름 · 크기 · 묶음 · 표지 색 · 페이지 수 · 내지(페이지 구간마다)를 한 번에 정해서 한 권
   - 🗂️ 바인더 = 조립식 (도련 10-18) : 표지와 내지를 따로 만들어 내보내고 → 🧩 바인더 조립에서 표지 하나에 내지를 원하는 만큼 끼워요
       바인더 표지 만들기 : 이름 · 크기 · 표지 색 (6공 링)            → 다이어리 / 바인더 / 내바인더 / 목록 · 원본
       내지 만들기        : 이름 · 크기 · 페이지 수 · 내지 구간       → 다이어리 / 바인더 / 내지 / 목록 · 원본
       🧩 바인더 조립      : 표지 고르기 + 같은 크기 내지 끼우기 (순서대로 · 같은 내지를 여러 번도) = 쓸 수 있는 바인더 한 권
         · 끼울 때의 표지 · 내지 모양을 그대로 담아요 (나중에 표지 · 내지 디자인을 고쳐도 이미 조립한 바인더는 그대로 · 실물처럼)
         · 꾸민 페이지가 있는 내지는 뺄 수 없고, 꾸민 페이지가 있으면 표지는 같은 크기로만 바꿔요 · 뒤에 내지를 더 끼우는 건 언제나
   - 만든 노트 · 조립한 바인더 = 다이어리 종류 하나 (js/skins.js DY_TYPES 와 같은 모양 + my · pg · lv) → 고르면 그 권이 열려요
   - 바로 꺼내 쓰려고 설정.json 'diary_mine' 에 모두 (게스트는 이 기기 'malang_diary_mine') · 조립한 바인더는 여기에만
   - 꾸민 내용 : 다꾸 / 노트 · 바인더 / <이름(크기)> / 1페이지.json … (js/drive.js · 이름은 빈칸 없이)
   - 내지 : 구간에 없는 페이지는 줄노트 · 그 페이지에서 속지를 바꾸면 그 페이지만 바뀌어요 (js/elements.js · js/leafpad.js dkLeafOf)
   - 지우기는 목록에서만 (꾸민 내용은 드라이브에 그대로) */

        const DMK_KEY = 'diary_mine', DMK_LOCAL = 'malang_diary_mine';
        const DMK_SIZES = {
            '노트': [['A5', '148×210', 210 / 148], ['B6', '128×182', 182 / 128], ['A6', '105×148', 148 / 105], ['슬림', '110×210', 210 / 110]],
            '바인더': [['A5', '148×210', 210 / 148], ['B6', '128×182', 182 / 128], ['A6', '105×148', 148 / 105]]
        };
        const DMK_BINDS = { '노트': [['thin', '실 제본'], ['tn', '고무 밴드'], ['hard', '하드커버'], ['spread', '책갈피 끈']], '바인더': [['ring', '6공 링']] };
        const DMK_COLORS = ['#ff9dbb', '#ffb3c7', '#f4a582', '#ffd479', '#8fd0b7', '#9fd3ea', '#c4b2f2', '#d9c2a6', '#a3714f', '#5a4652'];
        const DMK_LEAFS = [['line', '줄노트'], ['grid', '모눈'], ['dot', '도트'], ['gingham', '깅엄'], ['kraft', '크라프트'], ['plain', '무지']];
        const DMK_PG = { min: 10, max: 200, def: 30 }, DMK_BIND_MAX = 600;     // 바인더 한 권에 끼울 수 있는 페이지
        /* 종류 : note 노트 · cover 바인더 표지 · refill 내지 · binder 조립한 바인더 (모음 폴더가 없어요 · 설정에만) */
        const DMK_T = {
            note: { k: '노트', path: ['노트', '내노트'], name: '노트', icon: '📓' },
            cover: { k: '바인더', path: ['바인더', '내바인더'], name: '바인더 표지', icon: '🗂️' },
            refill: { k: '바인더', path: ['바인더', '내지'], name: '내지', icon: '📄' },
            binder: { k: '바인더', path: null, name: '바인더', icon: '🗂️' }
        };
        const dmkEsc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const dmkColl = t => collOf(PAGE_PATH.concat(DMK_T[t].path));
        const dmkQ = id => document.getElementById(id);
        const dmkShut = (...ids) => ids.forEach(id => { if (dmkQ(id)) closeModal(id); });
        const dmkLeafName = v => (DMK_LEAFS.find(l => l[0] === v) || DMK_LEAFS[0])[1];

        /* ---------- 만든 것 목록 (바로 꺼내 쓰는 쪽) ---------- */
        function dmkMap() { const m = prefGet(DMK_KEY, DMK_LOCAL); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; }
        const dmkPg = v => Math.max(DMK_PG.min, Math.min(DMK_PG.max, Math.round(+v) || DMK_PG.def));
        function dmkLv(lv, pg) {                                               // 내지 구간 [[처음, 끝, 내지] …] 확인
            return (Array.isArray(lv) ? lv : []).map(r => Array.isArray(r) ? [Math.max(1, Math.round(+r[0]) || 1), Math.min(pg, Math.round(+r[1]) || pg), DMK_LEAFS.some(l => l[0] === r[2]) ? r[2] : 'line'] : null).filter(r => r && r[0] <= r[1]);
        }
        function dmkClean(d) {                                                  // 드라이브 · 설정에서 읽은 것 확인
            if (!d || typeof d !== 'object' || !/^my[\w-]{1,30}$/.test(d.id || '')) return null;
            const t = DMK_T[d.t] ? d.t : d.k === '바인더' ? 'binder' : 'note', k = DMK_T[t].k;
            const sz = DMK_SIZES[k].find(s => s[0] === d.n) || DMK_SIZES[k][0];
            const o = { id: d.id, t, u: typeof d.u === 'string' ? d.u : '', k, g: String(d.g || '').slice(0, 20) || '내 ' + DMK_T[t].name, n: sz[0], mm: sz[1], r: sz[2] };
            const color = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : DMK_COLORS[k === '바인더' ? 6 : 0];
            if (t === 'note') { const pg = dmkPg(d.pg); return Object.assign(o, { my: 1, b: DMK_BINDS[k].some(x => x[0] === d.b) ? d.b : DMK_BINDS[k][0][0], c: color(d.c), pg, lv: dmkLv(d.lv, pg) }); }
            if (t === 'cover') return Object.assign(o, { b: 'ring', c: color(d.c) });
            if (t === 'refill') { const pg = dmkPg(d.pg); return Object.assign(o, { pg, lv: dmkLv(d.lv, pg) }); }
            /* 조립한 바인더 : 끼운 내지(rf · 끼울 때 모양 그대로)를 이어 붙여 페이지 · 내지 구간 */
            const rf = (Array.isArray(d.rf) ? d.rf : []).map(x => { if (!x || typeof x !== 'object') return null; const pg = dmkPg(x.pg); return { id: String(x.id || ''), g: String(x.g || '').slice(0, 20) || '내지', pg, lv: dmkLv(x.lv, pg) }; }).filter(Boolean);
            let at = 0; const lv = [];
            rf.forEach(x => { lv.push([at + 1, at + x.pg, 'line']); x.lv.forEach(r => lv.push([at + r[0], at + r[1], r[2]])); at += x.pg; });   // 내지마다 줄노트로 깔고 그 위에 구간 (뒤에 넣은 게 먼저 찾아지게 아래서 뒤집어요)
            return Object.assign(o, { my: 1, b: 'ring', c: color(d.c), cv: String(d.cv || ''), cg: String(d.cg || '').slice(0, 20), rf, pg: Math.max(1, at), lv: lv.reverse() });
        }
        const dmkSel = t => t === 'note' || t === 'binder';                    // 다이어리 창에서 고르는 것 (권)
        function dmkAll() { return Object.values(dmkMap()).map(dmkClean).filter(d => d && dmkSel(d.t)).sort((a, b) => a.id < b.id ? 1 : -1); }   // 새것 먼저
        function dmkParts(t) { return Object.values(dmkMap()).map(dmkClean).filter(d => d && d.t === t).sort((a, b) => a.id < b.id ? 1 : -1); }
        function dmkGet(id) { const d = dmkMap()[id]; return d ? dmkClean(d) : null; }
        function dmkPut(d) { const m = Object.assign({}, dmkMap()); if (d.del) delete m[d.id]; else m[d.id] = dmkClean(d); prefSet(DMK_KEY, DMK_LOCAL, m); }

        /* 드라이브(모음)와 맞추기 : 다른 기기에서 만든 것 넣기 · 다른 기기에서 지운 것 빼기 */
        let dmkSyncing = {};
        async function dmkSyncT(t) {
            if (dmkSyncing[t] || typeof collAll !== 'function' || !DMK_T[t].path) return false;
            dmkSyncing[t] = true;
            let changed = false;
            try {
                const ents = await collAll(dmkColl(t)), m = Object.assign({}, dmkMap()), seen = new Set();
                ents.forEach(e => {
                    const d = dmkClean(Object.assign({}, e.x, { u: e.id, t })); if (!d || d.t !== t) return;
                    seen.add(d.id);
                    if (JSON.stringify(dmkClean(m[d.id])) !== JSON.stringify(d)) { m[d.id] = d; changed = true; }
                });
                if (typeof collOnline === 'function' && collOnline()) Object.keys(m).forEach(id => { const d = dmkClean(m[id]); if (d && d.t === t && d.u && !seen.has(id)) { delete m[id]; changed = true; } });
                if (changed) prefSet(DMK_KEY, DMK_LOCAL, m);
            } catch (e) { console.warn(e); }
            finally { dmkSyncing[t] = false; }
            return changed;
        }
        async function dmkSync(kind) {                                         // js/skins.js 내가만든 칸을 열 때
            if (kind === '노트') { if (await dmkSyncT('note') && dyKind === kind && dyTab === 'mine' && dmkQ('dyModal').style.display !== 'none') dyTabSet('mine'); }
            else { const a = await dmkSyncT('cover'), b = await dmkSyncT('refill'); if ((a || b) && dmkQ('dmkRoom') && dmkQ('dmkRoom').style.display !== 'none') dmkRoomRender(); }
        }

        /* ---------- 내지 : 이 페이지의 기본 속지 (js/elements.js · js/leafpad.js) ---------- */
        function dkLeafOf(date) {
            const t = typeof dkType === 'function' && dkType(); if (!t || !t.lv || !date || !dkIs(date)) return '';
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
        function dmkForm(t, id) {
            const T = DMK_T[t], k = T.k, old = id ? dmkGet(id) : null;
            dmk = old ? JSON.parse(JSON.stringify(old)) : { t, k, g: '', n: dmkRm && dmkRm.n && t !== 'note' ? dmkRm.n : DMK_SIZES[k][0][0], b: DMK_BINDS[k][0][0], c: DMK_COLORS[t === 'note' ? 0 : 6], pg: DMK_PG.def, lv: [[1, DMK_PG.def, 'line']] };
            if (!dmk.lv || !dmk.lv.length) dmk.lv = [[1, dmk.pg || DMK_PG.def, 'line']];
            dmkBuild();
            dmkQ('dmkModal').dataset.t = t;
            dmkQ('dmkTitle').textContent = T.icon + ' ' + (old ? T.name + ' 고치기' : '새 ' + T.name + ' 만들기');
            dmkQ('dmkName').value = dmk.g; dmkQ('dmkName').placeholder = '내 ' + T.name;
            dmkQ('dmkDel').hidden = !old;
            dmkQ('dmkOk').textContent = old ? '💾 저장' : t === 'note' ? '✨ 만들기' : '📤 내보내기';
            dmkQ('dmkHint').textContent = t === 'cover' ? '표지만 만들어요 · 내지는 🧩 바인더 조립에서 끼워요' : t === 'refill' ? '내지만 만들어요 · 같은 크기 바인더 표지에 끼워 써요' : '';
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
            <div class="dmk-row" data-on="note"><b>묶음</b><div class="dmk-chips" id="dmkBind"></div></div>
            <div class="dmk-row" data-on="note cover"><b>표지 색</b><div class="dmk-sw" id="dmkColor"></div></div>
            <div class="dmk-row" data-on="note refill"><b>페이지 수</b><div class="dmk-pg"><button type="button" class="dmk-step" onclick="dmkPages(-10)">−</button><input id="dmkPg" type="number" inputmode="numeric" min="${DMK_PG.min}" max="${DMK_PG.max}" onchange="dmkPages(0, this.value)"><button type="button" class="dmk-step" onclick="dmkPages(10)">＋</button><small>${DMK_PG.min}~${DMK_PG.max}페이지</small></div></div>
            <div class="dmk-row dmk-col" data-on="note refill"><b>내지 <small>페이지 구간마다 골라요</small></b><div id="dmkLeaf"></div>
                <button type="button" class="dmk-add" onclick="dmkLeafAdd()">✂️ 구간 나누기</button></div>
            <div class="sub-modal-btns">
                <button class="btn" id="dmkDel" type="button" onclick="dmkDelete()">🗑 지우기</button>
                <button class="btn" type="button" onclick="dmkClose()">취소</button>
                <button class="btn dmk-ok" id="dmkOk" type="button" onclick="dmkSave()">✨ 만들기</button>
            </div>
        </div>
    </div>`);
        }
        const dmkDesign = () => dmkClean(Object.assign({ id: dmk.id || 'my-new' }, dmk, { g: dmk.g || '내 ' + DMK_T[dmk.t].name }));
        function dmkPrevDraw() {
            const t = dmkDesign(), H = 96;
            const pic = t.t === 'cover' ? dmkCvThumb(t.c, t.r, H) : t.t === 'refill' ? dmkRfThumb(t.lv, t.r, H) : `<span class="dy-th" data-b="${t.b}" style="--dy-c:${t.c};width:${Math.round(H / t.r * 2)}px;height:${H}px"><i></i><i></i></span>`;
            const sub = t.t === 'cover' ? `${t.n} · ${t.mm}mm · 6공 링` : `${t.n} · ${t.mm}mm · ${t.pg}페이지`;
            dmkQ('dmkPrev').innerHTML = `${pic}<span class="dmk-prev-n">${dmkEsc(t.g)}<small>${sub}</small></span>`;
        }
        function dmkRender() {
            const k = dmk.k, t = dmk.t;
            dmkQ('dmkModal').querySelectorAll('[data-on]').forEach(el => { el.hidden = !el.dataset.on.split(' ').includes(t); });
            dmkQ('dmkSize').innerHTML = DMK_SIZES[k].map(([n, mm]) => `<button type="button" class="dmk-chip${dmk.n === n ? ' on' : ''}" onclick="dmk.n='${n}'; dmkRender()">${n}<small>${mm}</small></button>`).join('');
            dmkQ('dmkBind').innerHTML = DMK_BINDS[k].map(([v, n]) => `<button type="button" class="dmk-chip${dmk.b === v ? ' on' : ''}" onclick="dmk.b='${v}'; dmkRender()">${n}</button>`).join('');
            dmkQ('dmkColor').innerHTML = DMK_COLORS.map(c => `<button type="button" class="dmk-c${dmk.c === c ? ' on' : ''}" style="--c:${c}" title="${c}" onclick="dmk.c='${c}'; dmkRender()"></button>`).join('');
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
            if (dmk && dmk.t !== 'note') return dmkRoomOpen(null);             // 표지 · 내지는 🧩 조립으로 돌아가요
            dyOpen('노트'); dyTabSet('mine');
        }
        async function dmkSave() {
            const T = DMK_T[dmk.t], fresh = !dmk.id;
            dmk.g = (dmkQ('dmkName').value || '').trim().replace(/\s+/g, ' ') || '내 ' + T.name;
            if (!dmk.id) dmk.id = 'my' + Date.now().toString(36);
            const d = dmkClean(dmk), C = dmkColl(d.t);
            const item = Object.assign({}, d); delete item.u;
            dmkPut(d);                                                          // 화면은 바로 · 드라이브는 뒤에서 (js/coll.js)
            try {
                if (d.u) await collSet(C, d.u, item, '', item);
                else { d.u = await collAdd(C, item, '', item); dmkPut(d); }
            } catch (e) { console.warn(e); }
            closeModal('dmkModal');
            if (d.t !== 'note') {                                              // 새로 만든 표지는 바로 골라 두고 · 새 내지는 바로 끼워 둬요
                if (dmkRm && fresh) { if (d.t === 'cover') dmkRmPick(d.id); else dmkRmAdd(d.id); }
                return dmkRoomOpen(null);
            }
            dmkUse(d);
        }
        function dmkUse(d) {                                                   // 만든 노트 · 조립한 바인더 열기
            const cur = dyNow().id === d.id;
            if (!cur) dySet(d.id);
            else { if (typeof refreshLayout === 'function') refreshLayout(); if (isCoverOpen && !turn) loadData(); dkCoverPaint(); }   // 고친 크기 · 색 · 내지를 바로
            if (!isCoverOpen && !turn) openCoverAnimated();
        }
        async function dmkDelete() {
            const d = dmkGet(dmk.id); if (!d) return;
            const what = d.t === 'note' ? `노트를 목록에서 지울까요?<br><span style="font-size:12px;color:#777;">꾸민 페이지는 드라이브 다꾸 / 노트 폴더에 그대로 남아요.</span>` : `${DMK_T[d.t].name}을(를) 지울까요?<br><span style="font-size:12px;color:#777;">이미 조립한 바인더는 그대로예요.</span>`;
            if (!(await showMsg(`🗑 <b>${dmkEsc(d.g)}</b> ${what}`, true))) return;
            if (dyNow().id === d.id) dySet(DY_DEF);
            dmkPut({ id: d.id, del: true });
            if (dmkRm && dmkRm.cv === d.id) dmkRm.cv = '';
            try { if (d.u) await collRemove(dmkColl(d.t), d.u); } catch (e) { console.warn(e); }
            dmkClose();
        }

        /* ---------- 🧩 바인더 조립 : 표지 하나 + 같은 크기 내지를 차례로 끼워요 ---------- */
        let dmkRm = null;                                                      // { id(고칠 때), g, cv, c, cg, n, rf:[{ id, g, pg, lv }] }
        function dmkRoomOpen(id) {
            if (id !== null) {                                                 // null = 표지 · 내지 만들기에서 돌아올 때 (하던 그대로)
                const old = id ? dmkGet(id) : null;
                dmkRm = old ? { id: old.id, g: old.g, cv: old.cv, c: old.c, cg: old.cg, n: old.n, rf: JSON.parse(JSON.stringify(old.rf)) } : { id: '', g: '', cv: '', c: '', cg: '', n: '', rf: [] };
            }
            dmkRoomBuild();
            dmkQ('dmkRoomName').value = dmkRm.g;
            dmkQ('dmkRoomDel').hidden = !dmkRm.id;
            dmkQ('dmkRoomOk').textContent = dmkRm.id ? '💾 저장' : '🧩 조립하기';
            dmkRoomRender();
            dmkShut('dyModal', 'dmkModal'); openModal('dmkRoom');
            dmkSync('바인더');
        }
        function dmkRoomBuild() {
            if (dmkQ('dmkRoom')) return;
            document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="dmkRoom">
        <div class="modal-content dmk-win">
            <div class="modal-title">🧩 바인더 조립</div>
            <div class="dmk-hint">바인더 표지를 고르고, 같은 크기 내지를 원하는 만큼 끼워요</div>
            <div class="dmk-prev" id="dmkRoomPrev"></div>
            <label class="dmk-row"><b>이름</b><input id="dmkRoomName" class="dmk-name" maxlength="20" autocomplete="off" placeholder="내 바인더" oninput="dmkRm.g = this.value; dmkRoomPrev()"></label>
            <div class="dmk-row dmk-col"><b>① 표지 고르기</b><div class="dmk-shelf" id="dmkRoomCv"></div></div>
            <div class="dmk-row dmk-col"><b>② 끼운 내지 <small id="dmkRoomPg"></small></b><div id="dmkRoomIn"></div></div>
            <div class="dmk-row dmk-col"><b>③ 내지 끼우기 <small>누르면 맨 뒤에 끼워요</small></b><div class="dmk-shelf" id="dmkRoomRf"></div></div>
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
        function dmkRmCover(c) { dmkRm.cv = c.id; dmkRm.c = c.c; dmkRm.cg = c.g; dmkRm.n = c.n; }
        function dmkRmPick(id) {
            const c = dmkGet(id); if (!c) return;
            if (dmkRmLock() && c.n !== dmkRm.n) return;
            if (dmkRm.rf.length && c.n !== dmkRm.n) dmkRm.rf = [];             // 크기가 다르면 끼운 내지는 빠져요 (꾸민 페이지가 없을 때만 여기까지 와요)
            dmkRmCover(c); dmkRoomRender();
        }
        function dmkRmAdd(id) {
            const r = dmkGet(id); if (!r || (dmkRm.n && r.n !== dmkRm.n)) return;
            if (dmkRm.rf.reduce((s, x) => s + x.pg, 0) + r.pg > DMK_BIND_MAX) { showMsg(`바인더 한 권에는 ${DMK_BIND_MAX}페이지까지 끼울 수 있어요.`); return; }
            dmkRm.rf.push({ id: r.id, g: r.g, pg: r.pg, lv: r.lv });
            if (dmkQ('dmkRoom') && dmkQ('dmkRoom').style.display !== 'none') dmkRoomRender();
        }
        function dmkRmOut(i) { const st = dmkRm.rf.slice(0, i).reduce((s, x) => s + x.pg, 0); if (st < dmkRmFilled()) return; dmkRm.rf.splice(i, 1); dmkRoomRender(); }
        function dmkRoomPrev() {
            const pg = dmkRm.rf.reduce((s, x) => s + x.pg, 0), sz = DMK_SIZES['바인더'].find(s => s[0] === dmkRm.n), H = 96;
            dmkQ('dmkRoomPrev').innerHTML = sz
                ? `<span class="dmk-stack">${dmkCvThumb(dmkRm.c, sz[2], H)}${dmkRm.rf.length ? `<span class="dmk-stack-n">${pg}</span>` : ''}</span><span class="dmk-prev-n">${dmkEsc(dmkRm.g || '내 바인더')}<small>${sz[0]} · ${sz[1]}mm · 내지 ${dmkRm.rf.length}묶음 · ${pg}페이지</small></span>`
                : `<span class="dmk-prev-n">표지를 먼저 골라 주세요<small>표지가 없으면 ＋ 새 표지로 만들어요</small></span>`;
        }
        function dmkRoomRender() {
            const lock = dmkRmLock(), filled = dmkRmFilled(), covers = dmkParts('cover');
            if (dmkRm.cv && !covers.some(c => c.id === dmkRm.cv) && dmkRm.n) covers.unshift({ id: dmkRm.cv, g: dmkRm.cg || '표지', c: dmkRm.c, n: dmkRm.n, r: DMK_SIZES['바인더'].find(s => s[0] === dmkRm.n)[2], gone: 1 });   // 지운 표지도 끼워 둔 건 보여요
            const ed = (t, id) => `<span class="dy-ed" role="button" tabindex="0" title="고치기" onclick="event.stopPropagation(); dmkForm('${t}', '${id}')">✏️</span>`;
            dmkQ('dmkRoomCv').innerHTML = `<button type="button" class="dmk-card dmk-new" onclick="dmkForm('cover')"><b>＋</b><span>새 표지</span></button>` + covers.map(c => {
                const off = lock && c.n !== dmkRm.n;
                return `<button type="button" class="dmk-card${dmkRm.cv === c.id ? ' on' : ''}" ${off ? 'disabled' : ''} onclick="dmkRmPick('${c.id}')">${dmkCvThumb(c.c, c.r, 56)}<span>${dmkEsc(c.g)}</span><small>${c.n}</small>${c.gone ? '' : ed('cover', c.id)}</button>`;
            }).join('');
            let at = 0;
            dmkQ('dmkRoomIn').innerHTML = dmkRm.rf.length ? dmkRm.rf.map((x, i) => {
                const a = at + 1; at += x.pg; const keep = a - 1 < filled;
                return `<div class="dmk-in"><span class="dmk-in-n">${a}~${at}</span><span class="dmk-in-g">${dmkEsc(x.g)}<small>${dmkLvText(x.lv, x.pg)}</small></span>${keep ? '<span class="dmk-in-lock" title="꾸민 페이지가 있어서 뺄 수 없어요">🔒</span>' : `<button type="button" class="dmk-x" title="빼기" onclick="dmkRmOut(${i})">✕</button>`}</div>`;
            }).join('') : `<div class="dmk-empty">아직 끼운 내지가 없어요. 아래에서 눌러 끼워요.</div>`;
            dmkQ('dmkRoomPg').textContent = dmkRm.rf.length ? `${at}페이지` : '';
            const refills = dmkParts('refill').filter(r => !dmkRm.n || r.n === dmkRm.n);
            dmkQ('dmkRoomRf').innerHTML = `<button type="button" class="dmk-card dmk-new" onclick="dmkForm('refill')"><b>＋</b><span>새 내지</span></button>` + refills.map(r =>
                `<button type="button" class="dmk-card" ${dmkRm.n ? '' : 'disabled'} onclick="dmkRmAdd('${r.id}')">${dmkRfThumb(r.lv, r.r, 56)}<span>${dmkEsc(r.g)}</span><small>${r.n} · ${r.pg}p</small>${ed('refill', r.id)}</button>`).join('')
                + (dmkRm.n && !refills.length ? `<div class="dmk-empty">${dmkRm.n} 크기 내지가 아직 없어요.</div>` : '');
            dmkQ('dmkRoomOk').disabled = !(dmkRm.cv && dmkRm.rf.length);
            dmkRoomPrev();
        }
        function dmkRoomClose() { closeModal('dmkRoom'); dyOpen('바인더'); dyTabSet('mine'); }
        function dmkRoomSave() {
            if (!dmkRm.cv || !dmkRm.rf.length) return;
            dmkRm.g = (dmkQ('dmkRoomName').value || '').trim().replace(/\s+/g, ' ') || '내 바인더';
            if (!dmkRm.id) dmkRm.id = 'my' + Date.now().toString(36);
            const d = dmkClean({ id: dmkRm.id, t: 'binder', g: dmkRm.g, n: dmkRm.n, c: dmkRm.c, cv: dmkRm.cv, cg: dmkRm.cg, rf: dmkRm.rf });
            dmkPut(d);
            closeModal('dmkRoom');
            dmkUse(d);
        }
        async function dmkRoomDelete() {
            const d = dmkGet(dmkRm.id); if (!d) return;
            if (!(await showMsg(`🗑 <b>${dmkEsc(d.g)}</b> 바인더를 목록에서 지울까요?<br><span style="font-size:12px;color:#777;">꾸민 페이지는 드라이브 다꾸 / 바인더 폴더에 그대로 남아요. 표지 · 내지 디자인도 그대로예요.</span>`, true))) return;
            if (dyNow().id === d.id) dySet(DY_DEF);
            dmkPut({ id: d.id, del: true });
            dmkRoomClose();
        }

        window.dmkOpen = dmkOpen; window.dmkForm = dmkForm; window.dmkSave = dmkSave; window.dmkDelete = dmkDelete; window.dmkClose = dmkClose; window.dmkPages = dmkPages; window.dmkLeafSet = dmkLeafSet; window.dmkLeafAdd = dmkLeafAdd; window.dmkLeafDel = dmkLeafDel; window.dmkLeafEdge = dmkLeafEdge;
        window.dmkRender = dmkRender; window.dmkPrevDraw = dmkPrevDraw; window.dmkAll = dmkAll; window.dmkParts = dmkParts; window.dmkGet = dmkGet; window.dmkSync = dmkSync; window.dmkEsc = dmkEsc; window.dkLeafOf = dkLeafOf;
        window.dmkRoomOpen = dmkRoomOpen; window.dmkRoomSave = dmkRoomSave; window.dmkRoomClose = dmkRoomClose; window.dmkRoomDelete = dmkRoomDelete; window.dmkRoomPrev = dmkRoomPrev; window.dmkRmPick = dmkRmPick; window.dmkRmAdd = dmkRmAdd; window.dmkRmOut = dmkRmOut;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dymaker'] = true;
