/* 말랑달콤 다이어리 - js/stkv2.js
   🆕 스티커 고르는 창 v2 (도련 10-23 · ⚙️ 설정 → 📒 스티커 고르는 창 → v2) : 🏷️ 씰스티커 → 기본 칸부터
   🪟 고르는 창 v2 = 문구점 진열대
     - 맨 위 매대 : 🕘 최근 · ♡ 찜 · ✨ 새로 나온 · 🍂 지금 계절 (누르면 그것만 · 다시 누르면 전체)
     - 🔍 찾기 : 세트 이름 · 주제 · 찾기 단어 + 그림 하나하나의 검색어 (js/kit-meta.js img) → '토끼' 그림만 모아 보여 줘요 · 눌러서 그 그림 하나만 떼어 써요
       (📒 수첩은 찾은 그림을 모은 '🔍 찾은 그림' 장이 맨 앞에 · 그 뒤로 그 그림이 든 세트)
     - 주제 칩 : 전체 · 동물 · 꽃·식물 · 디저트 · 인물 · 소품 · 하늘 · 계절 (세트가 있는 것만)
     - 🕘 최근 쓴 세트 한 줄 + 전체 세트 카드 (새것부터) · 카드 = 세트 이름 · 개수 · NEW / 계절 딱지 · ♡ 찜
     - 카드를 누르면 예전처럼 하얀 씰 종이가 펼쳐져 🪡 핀셋으로 떼어 써요 (js/elements.js libPickSheet)
   📒 수첩 v2 = 내 스티커 바인더 (같은 카드를 수첩이 한 장씩 시트로 펼쳐요 · js/stknote.js snbMulti '.sv2-card')
     - 옆 📑 인덱스 탭 = 주제 · 위 📝 포스트잇 = NEW · 최근 · 🎀 리본 책갈피 = 찜 · 🔍 돋보기 = 찾기
     - 시트 아래 뒷종이 = 세트 이름 · 개수 · ♥ · 📎 클립 = 마지막에 쓴 세트
   - 찜 · 최근은 내 설정에 저장 (로그인하면 기기끼리 같이 · js/drive.js prefGet)
   - 세트 이름이 없는 그림(js/kit-meta.js 에 없음)은 '카테고리 이름 + 번호'로 보여요
   ※ 이 파일이 없어도 다이어리는 정상 동작 (v1 모양만) */
(function () {
    const TOPICS = ['동물', '꽃·식물', '디저트', '인물', '소품', '하늘', '계절'];
    const CAT_TOPIC = { '인물': '인물', '동물': '동물', '꽃식물': '꽃·식물', '꽃': '꽃·식물', '식물': '꽃·식물', '디저트': '디저트', '과일': '디저트', '소품': '소품', '기호': '소품', '여행': '소품', '동화': '소품', '하늘': '하늘', '파티': '계절', '계절': '계절' };
    const SEASON = (() => { const m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? ['봄', '🌸'] : m <= 8 && m >= 6 ? ['여름', '🌊'] : m >= 9 && m <= 11 ? ['가을', '🍂'] : ['겨울', '❄️']; })();
    const FAV = ['diary_stk_fav', 'malang_stk_fav'], REC = ['diary_stk_recent', 'malang_stk_recent'];
    const S = { sets: null, mode: '', topic: '', q: '', loading: false };
    const q = id => document.getElementById(id);
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const catName = c => String(c || '').replace(/^\d+\s*[.)_\-]?\s*/, '') || '기본';
    const pget = k => { try { const v = window.prefGet ? prefGet(k[0], k[1]) : JSON.parse(localStorage.getItem(k[1]) || 'null'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    const pset = (k, v) => { try { if (window.prefSet) prefSet(k[0], k[1], v); else localStorage.setItem(k[1], JSON.stringify(v)); } catch (e) {} };
    const favs = () => pget(FAV), recent = () => pget(REC);
    const on = () => typeof window.snbVer === 'function' && snbVer() === 2;
    window.stkV2On = on;

    /* 세트 목록 : 기본스티커 목록(basicKit) + 이름표(KIT_META) */
    async function sets() {
        if (S.sets) return S.sets;
        const kit = await basicKit(), M = (window.KIT_META && KIT_META.sets) || {}, IK = (window.KIT_META && KIT_META.img) || {};
        const byCat = {}; Object.keys(M).forEach(k => { const x = M[k]; if (x.c != null) byCat[x.c + '|' + x.i] = x; });
        const file = u => String(u).split('/').pop();
        const out = [], idx = {};
        kit.sheets.forEach(x => {
            const c = x.c || '기본', i = idx[c] = (idx[c] == null ? 0 : idx[c] + 1);
            let m = M[file(x.us[0])]; if (!m) { const b = byCat[catName(c) + '|' + i]; if (b && b.m === x.us.length) m = b; }
            out.push(mk(file(x.us[0]), x.us, c, m, i));
        });
        kit.images.forEach(x => out.push(mk(file(x.u), [x.u], x.c || '기본', M[file(x.u)], -1)));
        out.forEach(s => { s.ik = s.us.map(u => IK[file(u)] || ''); });      // 그림마다 검색어
        const dmax = out.reduce((a, s) => s.d > a ? s.d : a, '');
        const lim = dmax ? new Date(new Date(dmax).getTime() - 7 * 864e5).toISOString().slice(0, 10) : '';
        out.forEach((s, n) => { s.n0 = n; s.isNew = !!(dmax && s.d >= lim && s.d >= '2026-10-20'); });
        out.sort((a, b) => (b.d || '').localeCompare(a.d || '') || a.n0 - b.n0);    // 새것부터
        return (S.sets = out);
    }
    function mk(id, us, c, m, i) {
        const cn = catName(c);
        return { id, us, c, n: m ? m.n : cn + (i >= 0 ? ' ' + (i + 1) : ''), t: m ? m.t : CAT_TOPIC[cn] || '소품', s: (m && m.s) || [], k: (m && m.k) || '', d: (m && m.d) || '', one: us.length === 1 };
    }
    function view(list) {
        const F = favs(), R = recent();
        let v = list;
        if (S.mode === 'fav') v = v.filter(s => F.includes(s.id));
        else if (S.mode === 'recent') v = R.map(id => list.find(s => s.id === id)).filter(Boolean);
        else if (S.mode === 'new') v = v.filter(s => s.isNew);
        else if (S.mode === 'season') v = v.filter(s => s.s.includes(SEASON[0]));
        if (S.topic) v = v.filter(s => s.t === S.topic);
        const w = S.q.trim();
        if (w) { const ws = w.split(/\s+/); v = v.filter(s => ws.every(x => (s.n + ' ' + s.t + ' ' + s.k + ' ' + catName(s.c) + ' ' + s.s.join(' ')).includes(x)) || s.ik.some(k => k && ws.every(x => k.includes(x)))); }
        return v;
    }
    /* 🔍 찾은 그림 하나하나 (세트 속에서도) : [{ u, s(세트) }] */
    function hits(v) {
        const ws = S.q.trim().split(/\s+/).filter(Boolean); if (!ws.length) return [];
        const out = [];
        v.forEach(s => s.ik.forEach((k, i) => { if (k && ws.every(x => k.includes(x))) out.push({ u: s.us[i], s }); }));
        return out;
    }
    /* 한 장 카드 */
    function card(s, small) {
        const F = favs(), R = recent(), fav = F.includes(s.id), th = s.us.slice(0, 4).map(u => `<img alt="" loading="lazy" src="${window.kitSize ? kitSize(u, small ? 96 : 120) : u}">`).join('');
        const tag = s.isNew ? '<em class="new">NEW</em>' : s.s.includes(SEASON[0]) ? `<em class="ss">${SEASON[0]}</em>` : '';
        return `<button type="button" class="sv2-card${small ? ' sm' : ''}${s.one ? ' one' : ''}" data-id="${esc(s.id)}" data-n="${esc(s.n)}" data-us='${esc(JSON.stringify(s.us))}' data-fav="${fav ? 1 : ''}" data-clip="${R[0] === s.id ? 1 : ''}" data-new="${s.isNew ? 1 : ''}">`
            + `<span class="sv2-sheet"><i class="sv2-tape"></i>${th}<i class="sv2-hrt${fav ? ' on' : ''}" data-fav="${esc(s.id)}">${fav ? '♥' : '♡'}</i></span><b>${esc(s.n)}</b><small>씰 ${s.us.length}개</small>${tag}</button>`;
    }
    /* 🪟 고르는 창 v2 그리기 (📒 수첩 v2 도 이 카드를 읽어 장으로 펼쳐요) */
    async function render() {
        const box = q('sv2Box'); if (!box) return;
        if (!S.sets) { box.innerHTML = '<p class="sv2-wait">⏳ 스티커 목록을 불러오는 중...</p>'; try { await sets(); } catch (e) { box.innerHTML = '<p class="sv2-wait">⚠ 스티커 목록을 불러오지 못했어요.<br>인터넷 연결을 확인한 뒤 다시 열어 주세요.</p>'; return; } }
        const list = S.sets, v = view(list), R = recent(), H = hits(v), note = window.snbMode && snbMode() === 'note';
        const topics = TOPICS.filter(t => list.some(s => s.t === t));
        const shelf = [['recent', '🕘 최근'], ['fav', '♡ 찜'], ['new', '✨ 새로 나온'], ['season', SEASON[1] + ' ' + SEASON[0]]];
        const keepQ = document.activeElement && document.activeElement.id === 'sv2Q';
        const plain = !S.mode && !S.topic && !S.q.trim();
        const rec = plain ? R.map(id => list.find(s => s.id === id)).filter(Boolean).slice(0, 8) : [];
        const head = S.mode === 'fav' ? '♡ 찜한 세트' : S.mode === 'recent' ? '🕘 최근 쓴 세트' : S.mode === 'new' ? '✨ 새로 나온 세트' : S.mode === 'season' ? `${SEASON[1]} ${SEASON[0]} 세트` : S.q.trim() ? `'${esc(S.q.trim())}' 찾은 세트` : S.topic ? esc(S.topic) + ' 세트' : '전체 세트';
        const F = favs(), sig = [S.mode, S.topic, S.q, note, rec.map(s => s.id).join(','), v.map(s => s.id).join(',')].join('|');
        if (box._sig === sig && box.firstChild) {                                // 목록은 그대로 · ♡ · 📎 만 바꿔요 (📒 수첩이 첫 장으로 돌아가지 않게)
            box.querySelectorAll('.sv2-card').forEach(c => { const f = F.includes(c.dataset.id), h = c.querySelector('.sv2-hrt'); if (!!c.dataset.fav !== f) c.dataset.fav = f ? 1 : ''; if (h) { h.classList.toggle('on', f); h.textContent = f ? '♥' : '♡'; } const cl = R[0] === c.dataset.id ? 1 : ''; if (String(c.dataset.clip || '') !== String(cl)) c.dataset.clip = cl; });
            document.querySelectorAll('.snb-v2hrt[data-v2fav]').forEach(h => { const f = F.includes(h.dataset.v2fav); h.classList.toggle('on', f); h.textContent = f ? '♥' : '♡'; });
            deco(); return;
        }
        box._sig = sig;
        const empty = S.mode === 'fav' ? '♡ 아직 찜한 세트가 없어요<br><small>세트 이름 옆 ♡ 를 누르면 찜해요</small>' : S.mode === 'recent' ? '🕘 아직 쓴 세트가 없어요' : S.q.trim() ? '찾는 세트가 없어요<br><small>다른 말로 찾아 보세요 (예 : 토끼 · 꽃 · 케이크)</small>' : '세트가 없어요';
        box.innerHTML = `<div class="sv2-shelf">${shelf.map(([k, n]) => `<button type="button" class="sv2-sh ${k}${S.mode === k ? ' on' : ''}" data-mode="${k}">${n}</button>`).join('')}</div>`
            + `<label class="sv2-find${S.q ? ' on' : ''}">🔍 <input id="sv2Q" type="search" enterkeyhint="search" autocomplete="off" placeholder="토끼, 꽃, 케이크… 찾기" value="${esc(S.q)}">${S.q ? '<button type="button" class="sv2-x" data-x="1">✕</button>' : ''}</label>`
            + `<div class="sv2-topics">${['', ...topics].map(t => `<button type="button" class="lib-cat${S.topic === t ? ' on' : ''}" data-topic="${esc(t)}">${t || '전체'}<small>${(t ? list.filter(s => s.t === t) : list).length}</small></button>`).join('')}</div>`
            + (rec.length ? `<p class="sv2-sub">🕘 최근 쓴 세트 <small>밀어서 더 보기 ›</small></p><div class="sv2-strip">${rec.map(s => card(s, true)).join('')}</div>` : '')
            + (H.length && !note ? `<p class="sv2-sub">🔍 '${esc(S.q.trim())}' 그림 ${H.length}개 <small>세트 ${new Set(H.map(h => h.s.id)).size}개에서 · 누르면 그 그림만 떼어 써요</small></p><div class="sv2-hits">${H.slice(0, 120).map(h => `<button type="button" class="sv2-hit" data-u="${esc(h.u)}" data-id="${esc(h.s.id)}"><span><img alt="" loading="lazy" src="${window.kitSize ? kitSize(h.u, 120) : h.u}"></span><small>${esc(h.s.n)}</small></button>`).join('')}</div>` : '')
            + `<p class="sv2-sub">${H.length ? `'${esc(S.q.trim())}' 들어 있는 세트` : head} <small>${v.length}개${plain ? ' · 새것부터' : ''}</small></p>`
            + (v.length ? `<div class="sv2-grid">${H.length && note ? card({ id: 'q:' + S.q.trim(), us: H.map(h => h.u), n: `🔍 '${S.q.trim()}' 찾은 그림`, s: [], one: false, isNew: false }) : ''}${v.map(s => card(s)).join('')}</div>` : `<p class="sv2-empty">${empty}</p>`);
        if (keepQ) { const i = q('sv2Q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
        deco();
    }
    function used(id) { if (/^q:/.test(id)) return; const r = recent().filter(x => x !== id); r.unshift(id); pset(REC, r.slice(0, 12)); }
    function toggleFav(id) { const f = favs(), i = f.indexOf(id); if (i >= 0) f.splice(i, 1); else f.unshift(id); pset(FAV, f.slice(0, 200)); return i < 0; }
    window.v2Used = id => { used(id); if (on()) setTimeout(render, 400); };
    window.v2Fav = id => { const r = toggleFav(id); render(); return r; };
    document.addEventListener('click', e => {
        const box = q('sv2Box'); if (!box || !box.contains(e.target)) return;
        const h = e.target.closest('[data-fav]'); if (h && h.classList.contains('sv2-hrt')) { e.stopPropagation(); toggleFav(h.dataset.fav); render(); return; }
        const sh = e.target.closest('[data-mode]'); if (sh) { S.mode = S.mode === sh.dataset.mode ? '' : sh.dataset.mode; render(); return; }
        const tp = e.target.closest('[data-topic]'); if (tp) { S.topic = tp.dataset.topic; render(); return; }
        if (e.target.closest('[data-x]')) { S.q = ''; render(); return; }
        const ht = e.target.closest('.sv2-hit'); if (ht) { used(ht.dataset.id); if (window.libPick) libPick(ht.dataset.u); return; }   // 🔍 찾은 그림 하나만
        const c = e.target.closest('.sv2-card'); if (!c) return;
        const s = (S.sets || []).find(x => x.id === c.dataset.id); if (!s) return;
        used(s.id);
        if (s.one && window.libPick) libPick(s.us[0]); else if (window.libPickSheet) libPickSheet(s.us);
    });
    let qt = 0;
    document.addEventListener('input', e => { if (e.target && e.target.id === 'sv2Q') { S.q = e.target.value; clearTimeout(qt); qt = setTimeout(render, 250); } });

    /* 씰스티커 → 기본 칸을 열 때 (js/stickermaker.js stkLib) : v2 면 v1 그림 모음 대신 */
    window.stkV2Show = function (show) {
        let box = q('sv2Box');
        if (!box) { const lb = q('libBox'); if (!lb) return false; box = document.createElement('div'); box.id = 'sv2Box'; box.className = 'sv2'; box.hidden = true; lb.after(box); }
        box.hidden = !show;
        if (show) render(); else deco();
        return show;
    };

    /* 📒 수첩 v2 꾸밈 : 인덱스 탭 · 포스트잇 · 리본 · 돋보기 (수첩 몸통 밖 · 수첩일 때만) */
    function deco() {
        const m = q('stickerModal'); if (!m) return;
        const c = m.querySelector('.modal-content'), box = q('sv2Box');
        const show = m.classList.contains('snb-on') && box && !box.hidden && on() && c && c.querySelector(':scope > .snb-body');
        let d = c && c.querySelector(':scope > .sv2-deco');
        m.classList.toggle('sv2-note', !!show);
        if (!show) { if (d) d.remove(); return; }
        if (!d) { d = document.createElement('div'); d.className = 'sv2-deco'; c.appendChild(d); }
        const list = S.sets || [], topics = TOPICS.filter(t => list.some(s => s.t === t));
        const cols = { '동물': '#ffd27f', '꽃·식물': '#b9e4a8', '디저트': '#ffb3c7', '인물': '#ff9ec4', '소품': '#c9b6ff', '하늘': '#a9d6ff', '계절': '#ffc89a' };
        d.innerHTML = `<div class="sv2-posts"><button type="button" class="sv2-post new${S.mode === 'new' ? ' on' : ''}" data-dmode="new">NEW<small>새로 나온</small></button><button type="button" class="sv2-post rc${S.mode === 'recent' ? ' on' : ''}" data-dmode="recent">🕘<small>최근</small></button><button type="button" class="sv2-post ss${S.mode === 'season' ? ' on' : ''}" data-dmode="season">${SEASON[1]}<small>${SEASON[0]}</small></button></div>`
            + `<button type="button" class="sv2-ribbon${S.mode === 'fav' ? ' on' : ''}" data-dmode="fav" aria-label="찜한 장만">♥</button>`
            + `<button type="button" class="sv2-mag${S.q ? ' on' : ''}" data-dfind="1" aria-label="찾기">🔍</button>`
            + (d._find || S.q ? `<label class="sv2-dfind">🔍 <input id="sv2DQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="토끼, 꽃… 찾기" value="${esc(S.q)}"><button type="button" data-dx="1">✕</button></label>` : '')
            + `<div class="sv2-tabs">${topics.map(t => `<button type="button" class="sv2-tab${S.topic === t ? ' on' : ''}" style="--c:${cols[t] || '#eee'}" data-dtopic="${esc(t)}"><span>${t}</span></button>`).join('')}</div>`
            + (S.mode || S.topic || S.q ? `<button type="button" class="sv2-all" data-dall="1">전체 보기</button>` : '')
            + (box.querySelector('.sv2-empty') ? `<p class="sv2-dempty">${box.querySelector('.sv2-empty').innerHTML}</p>` : '');
        if (d._focus) { const i = d.querySelector('#sv2DQ'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } d._focus = 0; }
    }
    document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.sv2-deco')) e.stopPropagation(); }, true);
    document.addEventListener('pointerdown', e => {                         // 📒 수첩 시트 뒷종이의 ♥ = 찜 (떼기 · 장 넘기기 대신)
        const h = e.target.closest && e.target.closest('.snb-v2hrt'); if (!h) return;
        e.stopPropagation(); e.preventDefault(); toggleFav(h.dataset.v2fav); render();
    }, true);   // 수첩이 장 넘기기 · 옮기기로 가져가지 않게
    document.addEventListener('click', e => {
        const d = e.target.closest && e.target.closest('.sv2-deco'); if (!d) return;
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.dmode) { S.mode = S.mode === b.dataset.dmode ? '' : b.dataset.dmode; S.topic = ''; }      // 📒 수첩은 포스트잇 · 탭 중 하나만 (겹치면 빈 수첩이 되기 쉬워요)
        else if (b.dataset.dtopic) { S.topic = S.topic === b.dataset.dtopic ? '' : b.dataset.dtopic; S.mode = ''; }
        else if (b.dataset.dfind) { d._find = !d._find || !!S.q; d._focus = 1; deco(); return; }
        else if (b.dataset.dx) { S.q = ''; d._find = 0; }
        else if (b.dataset.dall) { S.mode = ''; S.topic = ''; S.q = ''; d._find = 0; }
        if (window.snbGoFirst) snbGoFirst();
        render();
    });
    document.addEventListener('input', e => { if (e.target && e.target.id === 'sv2DQ') { S.q = e.target.value; clearTimeout(qt); qt = setTimeout(() => { const d = document.querySelector('.sv2-deco'); if (d) d._focus = 1; if (window.snbGoFirst) snbGoFirst(); render(); }, 350); } });
    /* 수첩이 펴지고 접힐 때 꾸밈도 같이 */
    const mo = new MutationObserver(() => deco());
    const watch = () => { const m = q('stickerModal'); if (m) mo.observe(m, { attributes: true, attributeFilter: ['class', 'style'] }); else setTimeout(watch, 500); };
    watch();
    window.v2Render = render;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 (index.html에서 확인) */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['stkv2'] = true;
