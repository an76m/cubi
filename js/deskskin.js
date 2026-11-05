/* 말랑달콤 다이어리 - js/deskskin.js
   🧱 벽지 · 🪵 책상 = 책상 화면의 상품 (도련 10-28 · 배경지와는 다른 것)
   - 🏪 기본상품 샵 → 🪑 책상 소품 → 🧱 벽지 · 🪵 책상 칸에서 받아요 (같은 것도 또 · 받아야 내 것)
   - 🛠 책상 꾸미기 → 📦 소품함 → 🧱 벽지 · 🪵 책상 칸에서 톡 = 바로 바뀌어 보여요 · 하단 ✔ 완료 때 저장 · ✕ 취소 = 처음대로 (🗑 버리기도)
       꾸미기 밖(▤ 하단 메뉴 소품함)에서 바꾸면 바로 저장
   - 벽지 = 뒷벽 + 양쪽 옆벽 전체 (옆벽은 원근대로 비스듬히 · 그늘 그대로) · 책상 = 그 아래 전부 (상판 · 앞면 두께 · 안쪽 그늘)
       방 그림(img/desk-wide.webp)은 그대로 두고 위에 그림(SVG)을 얹어요 · 선은 그림과 같은 자리에 다시 그어요 · 기본이면 안 얹어요
   - 처음 온 다꾸러 = 기본 벽지 · 기본 책상 하나씩 (한 번만 · 지금 그림 그대로)
   - 저장 : 책상배치 / 배치.json 'diary_desk_skin' { own: [{ u, id }], wall: u, top: u } (게스트는 이 기기 malang_desk_skin)
       그림 파일이 없는 색 · 무늬라서 목록에만 적어요 · 🗑 버리면 휴지통 30일 (js/bin.js · BIN_KINDS.ds)
   ※ js/desk.js · js/bin.js 다음에 읽어요 (deskBoxRender · deskEditOpen · deskEditEnd · deskBuild 가 여기 함수를 불러요 · js/basket.js 샵) */

        const DS_KEY = 'diary_desk_skin', DS_LOCAL = 'malang_desk_skin';
        /* 🧁 상품 = 서버 (상품공방 '벽지' · '책상판' · 도련 11-02) → { id, k: 'wall' | 'top', n, c(단색), t(책상색 5), grain, img · iw · ih(무늬 그림) }
           목록 = js/prod.js prodList (켜질 때 바로 · 무늬 그림 크기 = wh) · 꾸미기 상품이라 디자인을 고치면 모두 새 모습 · 기본 벽지 · 책상 = 그림 그대로(얹지 않아요) · 숨김 = 샵에서만 빠져요 */
        const DS_CAT = [];
        function dsBuild() {                                                       // 🧁 서버 + 📦 내 사본 (js/prod.js · 사본을 읽으면 다시)
            DS_CAT.length = 0;
            [['벽지', 'wall'], ['책상판', 'top']].forEach(([kind, k]) => (window.prodList ? prodList(kind) : []).forEach(x => {
                const P = x.P || {}, c = { id: x.id, k, n: String(P.이름 || ''), off: !!P.숨김, basic: !!P.기본, gift: !!P.처음선물 };   // 🔎 상품 그대로 (도련 11-02 · 빠지면 안 나와요 · 상품공방이 검수)
                if (/^#[0-9a-f]{6}$/i.test(P.단색 || '')) c.c = P.단색;
                if (Array.isArray(P.책상색) && P.책상색.length >= 5) c.t = P.책상색.slice(0, 5);
                const u = x.u && x.u.디자인, wh = x.wh && x.wh.디자인;
                if (u && Array.isArray(wh) && !c.c && !P.기본 && (k === 'wall' || P.나뭇결)) { c.img = u; c.iw = +wh[0]; c.ih = +wh[1]; }
                if (k === 'wall' && !c.c && !P.기본 && P.레시피 && typeof P.레시피 === 'object' && window.MK) { c.img = MK.url(MK.tileSvg(P.레시피, 1672, 941)); c.iw = 1672; c.ih = 941; }   // 🧵 레시피 (js/maker.js · 상품공방 무늬 메이커) = 방 한 장 크기로 그려요 (기울여도 끊김 없이 · 도련 11-05)
                const ok = c.n && (P.기본 || (k === 'wall' ? c.c || c.img : c.t && (!P.나뭇결 || c.img)));
                if (ok) DS_CAT.push(c); else console.warn('🧁 벽지 · 책상판 속성이 모자라요 :', x.id);
            }));
        }
        dsBuild();
        if (window.prodHook) prodHook(dsBuild);
        document.addEventListener('prod-change', () => { try { const st = document.getElementById('deskStage'); if (st) st.dataset.ds = ''; dsPaint(); } catch (e) {} });
        const DS_OL = '#a080a5';                                                // 방 그림(앱 배경) 선 색 · 기본 = 상품 '기본' (그림 그대로 · 얹지 않아요)
        const dsBasic = id => !!(dsCat(id) || {}).basic;
        const dsCat = id => DS_CAT.find(x => x.id === id) || null;
        const dsU = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const DS = { edit: null, gone: [] };
        function dsRead() { const v = prefGet(DS_KEY, DS_LOCAL); return v && typeof v === 'object' && Array.isArray(v.own) ? { own: v.own.filter(x => x && x.u && typeof x.id === 'string'), wall: v.wall || '', top: v.top || '' } : null; }
        (window.SNAP_OWN = window.SNAP_OWN || {})['벽지'] = () => ((dsRead() || {}).own || []).map(x => x.id);   // 📦 사본 (js/snap.js)
        window.SNAP_OWN['책상판'] = window.SNAP_OWN['벽지'];
        const dsCur = () => (typeof DK !== 'undefined' && DK.edit && DS.edit) || dsRead() || { own: [], wall: '', top: '' };
        const dsSave = s => prefSet(DS_KEY, DS_LOCAL, { own: s.own, wall: s.wall, top: s.top });
        const dsOn = (s, k) => { const it = s.own.find(x => x.u === s[k]); return it ? it.id : ''; };   // 지금 쓰는 것 (없으면 '' = 그림 그대로)

        /* 🎁 처음 온 다꾸러 = 상품 '처음선물' 벽지 · 책상판 (상품공방 · 도련 11-02 · 한 번만 · 다 버려도 다시 주지 않아요) */
        function dsSync() {
            if (prefGet(DS_KEY, DS_LOCAL) === null) {
                const own = DS_CAT.filter(c => c.gift).map(c => ({ u: dsU(), id: c.id })), first = k => (own.find(o => dsCat(o.id).k === k) || {}).u || '';
                dsSave({ own, wall: first('wall'), top: first('top') });
            }
            dsPaint();
        }

        /* ---------- 무늬 (SVG pattern) : 뒷벽 · 왼쪽 옆벽 · 오른쪽 옆벽은 같은 무늬를 원근대로 눕혀요 ---------- */
        function dsPat(id, pid, tf) {
            const T = tf ? ` patternTransform="${tf}"` : '', c = dsCat(id) || {};
            const P = (w, h, body) => `<pattern id="${pid}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${T}>${body}</pattern>`;
            if (c.c) return P(40, 40, `<rect width="40" height="40" fill="${c.c}"/>`);
            if (c.img) return P(c.iw, c.ih, `<image href="${c.img}" width="${c.iw}" height="${c.ih}"/>`);   // 🧁 무늬 그림 한 칸 (벽지 · 책상 나뭇결)
            return '';
        }
        /* 방 그림 위에 얹는 그림 (그림 px 1672 × 941 · 선은 방 그림과 같은 자리) */
        function dsSvg(wall, top, sw) {
            if (!wall && !top) return '';
            const k = sw ? 'm' + Math.random().toString(36).slice(2, 7) : 'dk', d = top && dsCat(top), t = d && d.t;
            let defs = '', body = '';
            if (wall) {
                defs += dsPat(wall, k + 'W') + dsPat(wall, k + 'L', 'skewY(-21) scale(0.42 1)') + dsPat(wall, k + 'R', 'skewY(21) scale(0.42 1)');
                body += `<polygon points="140,0 1538,0 1538,720 140,720" fill="url(#${k}W)"/>`
                    + `<polygon points="0,0 140,0 140,720 0,776" fill="url(#${k}L)"/><polygon points="1538,0 1672,0 1672,773 1538,720" fill="url(#${k}R)"/>`
                    + '<polygon points="0,0 140,0 140,720 0,776" style="fill:rgba(150,90,120,.07)"/><polygon points="1538,0 1672,0 1672,773 1538,720" style="fill:rgba(150,90,120,.07)"/>';   // 옆벽은 조금 그늘
            }
            if (t) {
                if (d.img) defs += dsPat(top, k + 'T');
                body += `<polygon points="0,776 140,720 1538,720 1672,773 1672,866 0,866" fill="${d.img ? `url(#${k}T)` : t[0]}"/>`
                    + `<polygon points="140,721 1538,721 1585,740 1585,746 95,746 95,740" fill="${t[1]}"/>`   // 벽 아래 안쪽 그늘
                    + `<rect x="0" y="866" width="1672" height="13" fill="${t[2]}"/><rect x="0" y="879" width="1672" height="25" fill="${t[3]}"/><rect x="0" y="904" width="1672" height="37" fill="${t[4]}"/>`;
            }
            const ln = `stroke="var(--dsk-ol, ${DS_OL})" stroke-width="3" fill="none" stroke-linejoin="round"`;
            body += `<g ${ln}><path d="M140 0 V720 M1538 0 V720"/><polyline points="0,776 140,720 1538,720 1672,773"/><path d="M0 866 H1672 M0 904.5 H1672"/></g>`;
            const vb = !sw ? '0 0 1672 941' : wall ? '0 0 1672 700' : '0 712 1672 229';   // 견본 = 벽만 · 책상만
            return `<svg ${sw ? 'class="ds-sw"' : 'class="desk-skin"'} data-an="1" viewBox="${vb}" preserveAspectRatio="${sw ? 'xMidYMid slice' : 'none'}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
        }
        /* 책상 화면에 그리기 (기본이면 아무것도 안 얹어요) */
        function dsPaint() {
            const st = document.getElementById('deskStage'); if (!st) return;
            const s = dsCur(), w = dsOn(s, 'wall'), t = dsOn(s, 'top');
            const html = dsSvg(w && !dsBasic(w) ? w : '', t && !dsBasic(t) ? t : '');
            let el = st.querySelector(':scope > .desk-skin');
            if (st.dataset.ds === html) return; st.dataset.ds = html;
            if (el) el.remove();
            if (html) { const room = st.querySelector(':scope > .desk-room'); (room || st.firstChild).insertAdjacentHTML(room ? 'afterend' : 'beforebegin', html); }
        }
        /* 견본 (샵 카드 · 소품함 칸) : 방 한 장을 작게 */
        function dsSwatch(id) {
            const c = dsCat(id); if (!c) return '';
            if (c.k === 'wall') return dsBasic(id) ? '<span class="ds-sw basic w"></span>' : dsSvg(id, '', true);
            return dsBasic(id) ? '<span class="ds-sw basic t"></span>' : dsSvg('', id, true);
        }

        /* ---------- 🛠 책상 꾸미기 (js/desk.js) : 바꾸는 동안 들고 있다가 ✔ 완료 때 저장 · ✕ 취소 = 처음대로 ---------- */
        function dsEditStart() { DS.edit = JSON.parse(JSON.stringify(dsRead() || { own: [], wall: '', top: '' })); DS.gone = []; }
        async function dsEditEnd(ok) {
            const e = DS.edit, gone = DS.gone; DS.edit = null; DS.gone = [];
            if (ok && e) { dsSave(e); for (const g of gone) await binAdd({ k: 'ds', id: g.u, s: g.id }); }
            dsPaint();
            if (ok && gone.length) binTold(dsCur().own.length ? '' : '벽지 · 책상은 🏪 기본상품 샵 → 🪑 책상 소품에서 받을 수 있어요');
        }
        /* 소품함에서 톡 = 쓰기 (꾸미기 밖이면 바로 저장) */
        function dsUse(u) {
            const s = dsCur(), it = s.own.find(x => x.u === u); if (!it) return;
            s[dsCat(it.id).k] = u;
            if (!(typeof DK !== 'undefined' && DK.edit && DS.edit)) dsSave(s);
            dsPaint(); if (window.deskBoxRender) deskBoxRender();
        }
        /* 🗑 버리기 (마지막 하나도 · 쓰던 것이면 그림 그대로로) */
        async function dsDiscard(u) {
            const s = dsCur(), it = s.own.find(x => x.u === u); if (!it) return;
            if (!await binAsk(dsCat(it.id).n)) return;
            s.own = s.own.filter(x => x.u !== u); ['wall', 'top'].forEach(k => { if (s[k] === u) s[k] = ''; });
            if (typeof DK !== 'undefined' && DK.edit && DS.edit) { DS.gone.push(it); dsPaint(); if (window.deskBoxRender) deskBoxRender(); if (window.showMsg) showMsg('🗑 버릴게요.<br><small>하단 ✔ 완료를 누르면 휴지통으로 가요 (✕ 취소 = 그대로)</small>'); return; }
            dsSave(s); await binAdd({ k: 'ds', id: u, s: it.id });
            dsPaint(); if (window.deskBoxRender) deskBoxRender();
            await binTold(s.own.length ? '' : '벽지 · 책상은 🏪 기본상품 샵 → 🪑 책상 소품에서 받을 수 있어요');
        }
        BIN_KINDS.ds = {
            name: e => { const c = dsCat(e.s); return c ? (c.k === 'wall' ? '🧱 ' : '🪵 ') + c.n : '🪑 책상 꾸밈'; },
            restore: e => { const s = dsRead() || { own: [], wall: '', top: '' }; if (dsCat(e.s) && !s.own.some(x => x.u === e.id)) s.own.push({ u: e.id, id: e.s }); dsSave(s); if (DS.edit && !DS.edit.own.some(x => x.u === e.id)) DS.edit.own.push({ u: e.id, id: e.s }); if (window.deskBoxRender) deskBoxRender(); },
            purge: () => {}                                                    // 지울 파일이 없어요 (목록에서만)
        };
        /* 🏪 받기 (js/basket.js) : 같은 것도 또 */
        function dsGive(id) {
            if (!dsCat(id)) return 'fail';
            const it = { u: dsU(), id }, s = dsRead() || { own: [], wall: '', top: '' };
            s.own.push(it); dsSave(s); if (window.snapSoon) snapSoon(); window.dsLastGiven = { u: it.u, t: Date.now() };   // 🛍️ 봉투 카드가 기억해요
            if (DS.edit) DS.edit.own.push(it);
            if (window.deskBoxRender) deskBoxRender();
            return 'ok';
        }
        function dsShopList() { return DS_CAT.filter(c => !c.off).map(c => ({ cnt: c.n, look: 'dskin', sid: c.id, sec: c.k === 'wall' ? 'wallpaper' : 'desktop', give: () => dsGive(c.id), name: c.n })); }

        /* 📦 소품함 🧱 벽지 · 🪵 책상 칸 (js/desk.js deskBoxRender) : 가진 것 · ✔ = 지금 쓰는 것 · 톡 = 쓰기 · 🗑 버리기 */
        const dsBagged = x => { const H = window.deskBagHold ? deskBagHold() : null; return !!H && H.u.has(x.u); };   // 🛍️ 봉투 속 = 꺼낼 때까지 없어요 (js/desk.js)
        function dsBoxCells(kind) {
            const s = dsCur(), k = kind === 'wallpaper' ? 'wall' : 'top';
            return s.own.filter(x => dsCat(x.id) && dsCat(x.id).k === k && !dsBagged(x)).map(x => `<button type="button" class="iv-c ds${s[k] === x.u ? ' sel on' : ''}" title="${dsCat(x.id).n}" onclick="dsUse('${x.u}')">${dsSwatch(x.id)}${s[k] === x.u ? '<em>✔</em>' : ''}<span class="ds-del" role="button" tabindex="0" aria-label="휴지통" onclick="event.stopPropagation(); dsDiscard('${x.u}')">🗑</span></button>`);
        }
        const dsCount = kind => dsCur().own.filter(x => dsCat(x.id) && dsCat(x.id).k === (kind === 'wallpaper' ? 'wall' : 'top') && !dsBagged(x)).length;
        function dsName(kind) { const s = dsCur(), k = kind === 'wallpaper' ? 'wall' : 'top', id = dsOn(s, k); return id && dsCat(id) ? dsCat(id).n : (k === 'wall' ? '벽지 없음 (그림 그대로)' : '책상 꾸밈 없음 (그림 그대로)'); }

        window.dsSync = dsSync; window.dsPaint = dsPaint; window.dsEditStart = dsEditStart; window.dsEditEnd = dsEditEnd; window.dsUse = dsUse; window.dsDiscard = dsDiscard;
        window.dsGive = dsGive; window.dsShopList = dsShopList; window.dsSwatch = dsSwatch; window.dsBoxCells = dsBoxCells; window.dsCount = dsCount; window.dsName = dsName;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskskin'] = true;
