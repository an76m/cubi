/* 말랑달콤 다이어리 - js/dymaker.js
   📓 노트 만들기 · 🗂️ 바인더 만들기 (도련 · 10-18 · 다이어리 창 → 📓 노트 · 🗂️ 바인더 → 내가만든 칸의 ➕)
   - 정하는 것 : 이름 · 크기(규격) · 묶음 모양 · 표지 색 · 페이지 수 · 내지(페이지 구간마다 따로 · 예 1~5 줄노트 · 6~10 모눈)
   - 만든 디자인 = 다이어리 종류 하나 (js/skins.js DY_TYPES 와 같은 모양 + my · pg · lv) → 고르면 그 노트가 열려요 (디자인 하나 = 한 권)
   - 저장
       디자인 : 말랑달콤 / 다이어리 / 노트 / 내노트 / 목록 · 원본   ·   … / 바인더 / 내바인더 / 목록 · 원본 (js/coll.js)
       바로 꺼내 쓰려고 설정.json 'diary_mine' 에도 같이 (게스트는 이 기기 'malang_diary_mine')
       꾸민 내용 : 다꾸 / 노트 · 바인더 / <이름(크기)> / 1페이지.json … (js/drive.js · 이름은 빈칸 없이)
   - 내지 : 구간에 없는 페이지는 줄노트 · 그 페이지에서 속지를 바꾸면 그 페이지만 바뀌어요 (js/elements.js · js/leafpad.js dkLeafOf)
   - 고치기 : 만든 칸의 ✏️ · 이미 꾸민 페이지보다 페이지 수를 줄일 수는 없어요 · 지우기는 디자인만 (꾸민 내용은 드라이브에 그대로) */

        const DMK_KEY = 'diary_mine', DMK_LOCAL = 'malang_diary_mine';
        const DMK_SIZES = {
            '노트': [['A5', '148×210', 210 / 148], ['B6', '128×182', 182 / 128], ['A6', '105×148', 148 / 105], ['슬림', '110×210', 210 / 110]],
            '바인더': [['A5', '148×210', 210 / 148], ['B6', '128×182', 182 / 128], ['A6', '105×148', 148 / 105]]
        };
        const DMK_BINDS = { '노트': [['thin', '실 제본'], ['tn', '고무 밴드'], ['hard', '하드커버'], ['spread', '책갈피 끈']], '바인더': [['ring', '6공 링']] };
        const DMK_COLORS = ['#ff9dbb', '#ffb3c7', '#f4a582', '#ffd479', '#8fd0b7', '#9fd3ea', '#c4b2f2', '#d9c2a6', '#a3714f', '#5a4652'];
        const DMK_LEAFS = [['line', '줄노트'], ['grid', '모눈'], ['dot', '도트'], ['gingham', '깅엄'], ['kraft', '크라프트'], ['plain', '무지']];
        const DMK_PG = { min: 10, max: 200, def: 30 };
        const dmkEsc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const dmkColl = kind => collOf(PAGE_PATH.concat(kind, kind === '바인더' ? '내바인더' : '내노트'));
        const dmkQ = id => document.getElementById(id);

        /* ---------- 만든 디자인 목록 (바로 꺼내 쓰는 쪽) ---------- */
        function dmkMap() { const m = prefGet(DMK_KEY, DMK_LOCAL); return m && typeof m === 'object' && !Array.isArray(m) ? m : {}; }
        function dmkClean(d) {                                                  // 드라이브 · 설정에서 읽은 디자인 확인
            if (!d || typeof d !== 'object' || !/^my[\w-]{1,30}$/.test(d.id || '')) return null;
            const k = d.k === '바인더' ? '바인더' : '노트', sz = DMK_SIZES[k].find(s => s[0] === d.n) || DMK_SIZES[k][0];
            const b = DMK_BINDS[k].some(x => x[0] === d.b) ? d.b : DMK_BINDS[k][0][0];
            const pg = Math.max(DMK_PG.min, Math.min(DMK_PG.max, Math.round(+d.pg) || DMK_PG.def));
            const lv = (Array.isArray(d.lv) ? d.lv : []).map(r => [Math.max(1, Math.round(+r[0]) || 1), Math.min(pg, Math.round(+r[1]) || pg), DMK_LEAFS.some(l => l[0] === r[2]) ? r[2] : 'line']).filter(r => r[0] <= r[1]);
            return { id: d.id, my: 1, u: typeof d.u === 'string' ? d.u : '', k, g: String(d.g || '').slice(0, 20) || '내 ' + k, n: sz[0], mm: sz[1], r: sz[2], b, c: /^#[0-9a-f]{6}$/i.test(d.c || '') ? d.c : DMK_COLORS[0], pg, lv };
        }
        function dmkAll() { return Object.values(dmkMap()).map(dmkClean).filter(Boolean).sort((a, b) => a.id < b.id ? 1 : -1); }   // 새것 먼저
        function dmkGet(id) { const d = dmkMap()[id]; return d ? dmkClean(d) : null; }
        function dmkPut(d) { const m = Object.assign({}, dmkMap()); if (d.del) delete m[d.id]; else m[d.id] = dmkClean(d); prefSet(DMK_KEY, DMK_LOCAL, m); }

        /* 드라이브(모음)와 맞추기 : 다른 기기에서 만든 것 넣기 · 다른 기기에서 지운 것 빼기 */
        let dmkSyncing = {};
        async function dmkSync(kind) {
            if (dmkSyncing[kind] || typeof collAll !== 'function') return;
            dmkSyncing[kind] = true;
            try {
                const ents = await collAll(dmkColl(kind)), m = Object.assign({}, dmkMap()), seen = new Set();
                let changed = false;
                ents.forEach(e => {
                    const d = dmkClean(Object.assign({}, e.x, { u: e.id })); if (!d || d.k !== kind) return;
                    seen.add(d.id);
                    if (JSON.stringify(m[d.id]) !== JSON.stringify(d)) { m[d.id] = d; changed = true; }
                });
                if (typeof collOnline === 'function' && collOnline()) Object.keys(m).forEach(id => { const d = dmkClean(m[id]); if (d && d.k === kind && d.u && !seen.has(id)) { delete m[id]; changed = true; } });
                if (changed) {
                    prefSet(DMK_KEY, DMK_LOCAL, m);
                    if (dyKind === kind && dyTab === 'mine' && dmkQ('dyModal').style.display !== 'none') dyTabSet('mine');
                }
            } catch (e) { console.warn(e); }
            finally { dmkSyncing[kind] = false; }
        }

        /* ---------- 내지 : 이 페이지의 기본 속지 (js/elements.js · js/leafpad.js) ---------- */
        function dkLeafOf(date) {
            const t = typeof dkType === 'function' && dkType(); if (!t || !t.lv || !date || !dkIs(date)) return '';
            const n = dkNo(date); if (n < 1) return '';
            const r = t.lv.find(x => n >= x[0] && n <= x[1]);
            return r ? r[2] : '';
        }

        /* ---------- 만들기 창 ---------- */
        let dmk = null;                                                         // 지금 만드는 것 { k, id(고칠 때), g, n, b, c, pg, lv }
        function dmkOpen(kind, id) {
            const k = kind === '바인더' ? '바인더' : '노트', old = id ? dmkGet(id) : null;
            dmk = old ? JSON.parse(JSON.stringify(old)) : { k, g: '', n: DMK_SIZES[k][0][0], b: DMK_BINDS[k][0][0], c: DMK_COLORS[k === '바인더' ? 6 : 0], pg: DMK_PG.def, lv: [[1, DMK_PG.def, 'line']] };
            if (!dmk.lv.length) dmk.lv = [[1, dmk.pg, 'line']];
            dmkBuild();
            dmkQ('dmkTitle').textContent = (k === '바인더' ? '🗂️ ' : '📓 ') + (old ? k + ' 고치기' : '새 ' + k + ' 만들기');
            dmkQ('dmkName').value = dmk.g; dmkQ('dmkName').placeholder = '내 ' + k;
            dmkQ('dmkDel').hidden = !old;
            dmkQ('dmkOk').textContent = old ? '💾 저장' : '✨ 만들기';
            dmkRender();
            closeModal('dyModal'); openModal('dmkModal');
        }
        function dmkBuild() {
            if (dmkQ('dmkModal')) return;
            document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="dmkModal">
        <div class="modal-content dmk-win">
            <div class="modal-title" id="dmkTitle">📓 새 노트 만들기</div>
            <div class="dmk-prev" id="dmkPrev"></div>
            <label class="dmk-row"><b>이름</b><input id="dmkName" class="dmk-name" maxlength="20" autocomplete="off" oninput="dmk.g = this.value; dmkPrevDraw()"></label>
            <div class="dmk-row"><b>크기</b><div class="dmk-chips" id="dmkSize"></div></div>
            <div class="dmk-row"><b>묶음</b><div class="dmk-chips" id="dmkBind"></div></div>
            <div class="dmk-row"><b>표지 색</b><div class="dmk-sw" id="dmkColor"></div></div>
            <div class="dmk-row"><b>페이지 수</b><div class="dmk-pg"><button type="button" class="dmk-step" onclick="dmkPages(-10)">−</button><input id="dmkPg" type="number" inputmode="numeric" min="${DMK_PG.min}" max="${DMK_PG.max}" onchange="dmkPages(0, this.value)"><button type="button" class="dmk-step" onclick="dmkPages(10)">＋</button><small>${DMK_PG.min}~${DMK_PG.max}페이지</small></div></div>
            <div class="dmk-row dmk-col"><b>내지 <small>페이지 구간마다 골라요</small></b><div id="dmkLeaf"></div>
                <button type="button" class="dmk-add" onclick="dmkLeafAdd()">✂️ 구간 나누기</button></div>
            <div class="sub-modal-btns">
                <button class="btn" id="dmkDel" type="button" onclick="dmkDelete()">🗑 지우기</button>
                <button class="btn" type="button" onclick="dmkClose()">취소</button>
                <button class="btn dmk-ok" id="dmkOk" type="button" onclick="dmkSave()">✨ 만들기</button>
            </div>
        </div>
    </div>`);
        }
        const dmkDesign = () => dmkClean(Object.assign({ id: dmk.id || 'my-new' }, dmk, { g: dmk.g || '내 ' + dmk.k }));
        function dmkPrevDraw() {
            const t = dmkDesign(), H = 96, W = Math.round(H / t.r * 2);
            dmkQ('dmkPrev').innerHTML = `<span class="dy-th" data-b="${t.b}" style="--dy-c:${t.c};width:${W}px;height:${H}px"><i></i><i></i></span><span class="dmk-prev-n">${dmkEsc(t.g)}<small>${t.n} · ${t.mm}mm · ${t.pg}페이지</small></span>`;
        }
        function dmkRender() {
            const k = dmk.k;
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
        /* 페이지 수 : 마지막 구간이 늘거나 줄어요 (고칠 때는 이미 꾸민 페이지보다 적게 못 해요) */
        function dmkPages(step, val) {
            let pg = val != null ? Math.round(+val) || dmk.pg : dmk.pg + step;
            const lo = Math.max(DMK_PG.min, dmkFilledMax(), dmk.lv.length > 1 ? dmk.lv[dmk.lv.length - 1][0] : 1);
            pg = Math.max(lo, Math.min(DMK_PG.max, pg));
            dmk.pg = pg; dmk.lv[dmk.lv.length - 1][1] = pg;
            dmkRender();
        }
        function dmkFilledMax() {
            if (!dmk.id || typeof dkFilled !== 'function') return 0;
            const m = prefGet(DK_KEY, DK_LOCAL) || {}, bid = m[dmk.id]; if (!bid) return 0;
            const f = dkFilled(dkInfoOf(bid)); return f.length ? f[f.length - 1] : 0;
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
        function dmkClose() { closeModal('dmkModal'); dyOpen(dmk ? dmk.k : '노트'); dyTabSet('mine'); }
        async function dmkSave() {
            dmk.g = (dmkQ('dmkName').value || '').trim().replace(/\s+/g, ' ') || '내 ' + dmk.k;
            const isNew = !dmk.id;
            if (isNew) dmk.id = 'my' + Date.now().toString(36);
            const d = dmkClean(dmk), C = dmkColl(d.k);
            const item = Object.assign({}, d); delete item.u;
            dmkPut(d);                                                          // 화면은 바로 · 드라이브는 뒤에서 (js/coll.js)
            try {
                if (d.u) await collSet(C, d.u, item, '', item);
                else { d.u = await collAdd(C, item, '', item); dmkPut(d); }
            } catch (e) { console.warn(e); }
            closeModal('dmkModal');
            const cur = dyNow().id === d.id;
            if (!cur) dySet(d.id);
            else { if (typeof refreshLayout === 'function') refreshLayout(); if (isCoverOpen && !turn) loadData(); dkCoverPaint(); }   // 고친 크기 · 색 · 내지를 바로
            if (!isCoverOpen && !turn) openCoverAnimated();
        }
        async function dmkDelete() {
            const d = dmkGet(dmk.id); if (!d) return;
            if (!(await showMsg(`🗑 <b>${dmkEsc(d.g)}</b> ${d.k}를 목록에서 지울까요?<br><span style="font-size:12px;color:#777;">꾸민 페이지는 드라이브 다꾸 / ${d.k} 폴더에 그대로 남아요.</span>`, true))) return;
            if (dyNow().id === d.id) dySet(DY_DEF);
            dmkPut({ id: d.id, del: true });
            try { if (d.u) await collRemove(dmkColl(d.k), d.u); } catch (e) { console.warn(e); }
            dmkClose();
        }

        window.dmkOpen = dmkOpen; window.dmkSave = dmkSave; window.dmkDelete = dmkDelete; window.dmkClose = dmkClose; window.dmkPages = dmkPages; window.dmkLeafSet = dmkLeafSet; window.dmkLeafAdd = dmkLeafAdd; window.dmkLeafDel = dmkLeafDel; window.dmkLeafEdge = dmkLeafEdge;
        window.dmkRender = dmkRender; window.dmkPrevDraw = dmkPrevDraw; window.dmkAll = dmkAll; window.dmkGet = dmkGet; window.dmkSync = dmkSync; window.dmkEsc = dmkEsc; window.dkLeafOf = dkLeafOf;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['dymaker'] = true;
