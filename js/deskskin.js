/* 말랑달콤 다이어리 - js/deskskin.js
   🧱 벽지 · 🪵 책상 = 책상 화면의 상품 (도련 10-28 · 배경지와는 다른 것)
   - 🏪 기본상품 샵 → 🪑 책상 소품 → 🧱 벽지 · 🪵 책상 칸에서 받아요 (같은 것도 또 · 받아야 내 것)
   - 🛠 책상 꾸미기 → 📦 소품함 → 🧱 벽지 · 🪵 책상 칸에서 톡 = 바로 바뀌어 보여요 · 하단 ✔ 완료 때 저장 · ✕ 취소 = 처음대로 (🗑 버리기도)
       꾸미기 밖(▤ 하단 메뉴 소품함)에서 바꾸면 바로 저장
   - 벽지 = 뒷벽 + 양쪽 옆벽 전체 (옆벽은 원근대로 비스듬히 · 그늘 그대로) · 책상 = 그 아래 전부 (상판 · 앞면 두께 · 안쪽 그늘)
       방 그림(img/desk-wide.webp)은 그대로 두고 위에 그림(SVG)을 얹어요 · 선은 그림과 같은 자리에 다시 그어요 · 기본이면 안 얹어요
   - 처음 온 다꾸러 = 기본 벽지 · 기본 책상 하나씩 (한 번만 · 지금 그림 그대로)
   - 저장 : 설정 / 🔐 책상설정.json 'diary_desk_skin' { own: [{ u, id, c }], wall: u, top: u } (게스트는 이 기기 malang_desk_skin)
       🗂 하나에 파일 하나 (도련 11-05) : 말랑달콤 / 소품 / 받은-<c>.json 🔐 (js/coll.js ofAdd · 도련 11-07 소품 폴더 하나 · SKIN_DIRS 는 이름 표) · 🎁 처음 선물(g: 1)은 목록 한 줄만 (파일 없음 · 03_저장지도 0)
       배치.json 이 없어지면 = 종류 폴더 파일로 되살려요 (쓰던 것 = _백업.json) · 🚛 버리면 바로 영구 삭제 (js/bin.js · BIN_KINDS.ds · 도련 11-11)
   ※ js/desk.js · js/bin.js 다음에 읽어요 (deskBoxRender · deskEditOpen · deskEditEnd · deskBuild 가 여기 함수를 불러요 · js/basket.js 샵) */

        const DS_KEY = 'diary_desk_skin', DS_LOCAL = 'malang_desk_skin';
        /* 🧁 상품 = 서버 (상품공방 '벽지' · '책상판' · 도련 11-02) → { id, k: 'wall' | 'top', n, c(단색), t(책상색 5), grain, img · iw · ih(무늬 그림) }
           목록 = js/prod.js prodList (켜질 때 바로 · 무늬 그림 크기 = wh) · 꾸미기 상품이라 디자인을 고치면 모두 새 모습 · 기본 벽지 · 책상 = 그림 그대로(얹지 않아요) · 숨김 = 샵에서만 빠져요 */
        const DS_CAT = [];
        function dsBuild() {                                                       // 🧁 서버 상품 그대로 (js/prod.js)
            DS_CAT.length = 0;
            [['벽지', 'wall'], ['책상판', 'top']].forEach(([kind, k]) => (window.prodList ? prodList(kind) : []).forEach(x => {
                const P = x.P || {}, c = { id: x.id, k, n: String(P.이름 || ''), off: !!P.숨김, basic: !!P.기본, gift: !!P.처음받기 };   // 🔎 상품 그대로 (도련 11-02 · 빠지면 안 나와요 · 상품공방이 검수)
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
        const DS_OL = '#a080a5';                                                // 방 그림(앱 배경) 선 색 · 기본 = 상품 '기본' (그림 그대로 · 얹지 않아요)
        const dsBasic = id => !!(dsCat(id) || {}).basic;
        const dsCat = id => DS_CAT.find(x => x.id === id) || null;
        const dsU = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const DS = { edit: null, gone: [] };
        /* 💾 프론트 · 백 (도련 11-07) : 지금 고른 벽지 · 책상판 = 책상설정.json 'diary_desk_skin' { wall, top : u · wi, ti : 상품 id } (앱을 켜면 이것만으로 그려요)
                                        가진 벽지 · 책상판 = 소품 / _목록N.json 'diary_skin_own' [{ u, id, c, g }] (💤 소품함 · 꾸미기 · 받기 때 · js/desk.js dkOwnReady) */
        const DSO_KEY = 'diary_skin_own', DSO_LOCAL = 'malang_skin_own';
        const dsLazy = () => typeof drive !== 'undefined' && drive.ready && !drive.guest && typeof keyFileOn === 'function' && !keyFileOn('dkown');
        const dsOk = x => x && x.u && typeof x.id === 'string';
        const dsG = x => { const y = Object.assign({}, x), g = !!(y.g || y.start); delete y.g; delete y.start; delete y.from; return g ? Object.assign(y, { g: 1 }) : y; };   // 🎁 처음받기 = 그 줄의 start: 1 (앱 안에서는 g · 도련 11-09)
        function dsRead() {
            const v = prefGet(DS_KEY, DS_LOCAL), f = v && typeof v === 'object' && !Array.isArray(v) ? v : null, o = prefGet(DSO_KEY, DSO_LOCAL);
            if (Array.isArray(o)) return { own: o.filter(dsOk).map(dsG), wall: (f && f.wall) || '', top: (f && f.top) || '' };
            if (f && dsLazy()) { const own = []; if (f.wall && f.wi) own.push(dsG({ u: f.wall, id: f.wi })); if (f.top && f.ti) own.push(dsG({ u: f.top, id: f.ti })); return { own, wall: f.wall || '', top: f.top || '', part: 1 }; }   // 💤 아직 안 읽음 = 지금 고른 것만
            return null;
        }
        const dsReady = () => window.deskOwnReady ? deskOwnReady() : Promise.resolve(true);
        const dsCur = () => (typeof DK !== 'undefined' && DK.edit && DS.edit) || dsRead() || { own: [], wall: '', top: '' };
        function dsSave(s, mem) {
            prefSet(DS_KEY, DS_LOCAL, { wall: s.wall || '', top: s.top || '', wi: dsOn(s, 'wall'), ti: dsOn(s, 'top') });
            if (s.part) return;                                                    // 💤 가진 것을 모르면 고른 것만
            const own = s.own.map(x => { const y = Object.assign({}, x, { from: 'basic' }); if (y.g) y.start = 1; delete y.g; return y; });   // 🎁 처음받기 = from: 'basic' + start: 1 (도련 11-09)
            if (mem && dsOnline()) store.putLoaded(DSO_KEY, JSON.stringify(own)); else prefSet(DSO_KEY, DSO_LOCAL, own);   // 💤 mem = 처음 선물 그대로 (목록 파일은 바뀔 때)
        }
        const dsOn = (s, k) => { const it = s.own.find(x => x.u === s[k]); return it ? it.id : ''; };   // 지금 쓰는 것 (없으면 '' = 그림 그대로)

        /* 🗂 종류 폴더 파일 (도련 11-05) : 벽지 · 책상판 하나에 파일 하나 */
        const dsDir = id => dsCat(id) ? DIRS.desk : '';   // 🪑 소품 폴더 (도련 11-07)
        const dsOnline = () => typeof drive !== 'undefined' && drive.ready && !drive.guest;
        async function dsFile(it, from) {                                         // 파일을 만들고 목록 칸에 c
            if (it.c || !dsDir(it.id)) return;
            const c = await ofAdd(dsDir(it.id), { u: it.u, id: it.id, from }); if (!c) return;
            it.c = c;
            const s = dsRead(); if (s && !s.part) { const t = s.own.find(x => x.u === it.u); if (t && !t.c) { t.c = c; dsSave(s); } }
            if (DS.edit) { const t = DS.edit.own.find(x => x.u === it.u); if (t) t.c = c; }
        }
        let dsBusy = false;
        async function dsFilesFill() {                                            // 파일이 아직 없는 것 → 종류 폴더에 (드라이브를 읽은 뒤 · 예전에 받은 것도)
            const s = dsRead(); if (!s || s.part || !dsOnline()) return;
            for (const it of s.own.filter(x => !x.c && !x.g)) await dsFile(it, 'basic');   // 🎁 선물은 목록 한 줄만 (파일 없음)
        }
        /* 🎁 처음 온 다꾸러 = 상품 '처음받기' 벽지 · 책상판 (상품공방 · 도련 11-02 · 한 번만 · 다 버려도 다시 주지 않아요)
           🛟 로그인했는데 목록이 없으면 = 먼저 종류 폴더를 봐요 (파일이 있으면 되살리기 · 없으면 처음 선물 · 도련 11-05) */
        window.dsGiftOwn = () => { const s = dsRead(); return !s || s.part ? null : s.own.filter(x => x.g).map(x => ({ u: x.u, id: x.id })); };   // null = 아직 몰라요
        function dsGift() {
            const own = DS_CAT.filter(c => c.gift).map(c => ({ u: c.id, id: c.id, g: 1 })), first = k => (own.find(o => dsCat(o.id).k === k) || {}).u || '';   // 🎁 선물 u = 상품 id
            dsSave({ own, wall: first('wall'), top: first('top') });
        }
        async function dsRescue() {                                              // 🛟 가진 것 · 고른 것 중 없어진 쪽 (가진 것을 읽은 뒤에)
            const had = window.deskGiftRead ? await deskGiftRead() : null;        // 🎁 백업 속 처음 선물 (못 읽으면 에러 → 선물을 또 주지 않아요 · js/desk.js giftRead)
            const bk = window.deskBackupRead ? await deskBackupRead().catch(() => null) : null;
            let own = prefGet(DSO_KEY, DSO_LOCAL), lost = false;
            if (!Array.isArray(own)) {
                lost = keyMade('dkown') || dkBkReal(bk, DSO_KEY) || !!(window.giftGiven && giftGiven());                   // 📝 목록 파일을 만든 적이 있어요 = 없어진 것 · 아니면 처음 선물 그대로 (폴더를 안 뒤져요 · 도련 11-07)
                const F = lost ? (await ofScan(DIRS.desk)).filter(f => dsCat(f.id)) : [];   // 🪑 소품 폴더의 벽지 · 책상판 (못 읽으면 에러 → 다음에 다시)
                if (Array.isArray(prefGet(DSO_KEY, DSO_LOCAL))) return;               // 그사이 다른 기기에서
                const gone = window.goneHeal ? goneHeal('ds', bk) : new Set();   // 🚛 영구삭제 번호는 되살리지 않아요 (도련 11-11)
                own = F.filter(f => !gone.has(f.u)).map(f => ({ u: f.u, id: f.id, c: f.c }))
                    .concat((had && Array.isArray(had.ds) ? had.ds : []).filter(g => g && g.u && dsCat(g.id) && !gone.has(g.u) && !F.some(f => f.u === g.u)).map(g => ({ u: g.u, id: g.id, g: 1 })));
                if (!own.length && (!had || !Array.isArray(had.ds))) { dsGift(); return; }   // 백업에 벽지 칸이 있는데 비었으면 = 다 버린 사람
            }
            const f = prefGet(DS_KEY, DS_LOCAL) || {}, was = f.wall || f.top ? f : (bk && bk.diary_desk_skin && typeof bk.diary_desk_skin === 'object' ? bk.diary_desk_skin : {});
            const pick = k => (own.find(o => o.u === was[k] && dsCat(o.id).k === k) || own.find(o => dsCat(o.id).k === k) || {}).u || '';
            dsSave({ own, wall: pick('wall'), top: pick('top') });
            if (lost) diag('rescue', { w: 'ds', n: own.length });
        }
        function dsSync() {
            const locked = typeof drive !== 'undefined' && drive.deskLocked;          // 🔐 배치.json 을 못 열었으면 손대지 않아요 (js/desk.js 가 되살려요)
            const s0 = dsRead();
            if (s0 && s0.part) { dsPaint(); return; }                              // 💤 지금 고른 것만으로 그려요 (가진 것은 소품함을 열 때)
            if (!s0 && !locked) {
                if (!dsOnline() || drive.newbie) dsGift();                           // 👤 게스트 = 이 기기 목록만 · 🆕 말랑달콤 폴더가 없던 처음 온 다꾸러 = 뒤지지 않고 바로 선물
                else if (dsLazy()) dsReady().catch(() => {});                       // 고른 것도 없어요 → 가진 것을 읽고 (읽은 뒤 dsAfterLoad)
                else if (!dsBusy) {
                    dsBusy = true;
                    dsRescue().catch(e => console.warn('🧱 벽지 · 책상판 되살리기', e))
                        .finally(() => { dsBusy = false; dsPaint(); if (window.deskBoxRender) deskBoxRender(); });
                }
                dsPaint(); return;
            }
            dsPaint();
            if (dsOnline() && !locked && !dsBusy) { dsBusy = true; dsFilesFill().catch(e => console.warn('🧱 파일', e)).finally(() => { dsBusy = false; }); }
        }

        /* 방 그림 위에 얹는 그림 = js/maker.js MK.roomSvg (상품공방 미리보기와 같은 그림 · 도련 11-05) · 선 색은 방 그림 선 (css --dsk-ol) */
        function dsSvg(wall, top, sw) { return MK.roomSvg(wall && dsCat(wall), top && dsCat(top), sw, `var(--dsk-ol, ${DS_OL})`); }
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
            if (ok && e) { dsSave(e); for (const g of gone) await binAdd(Object.assign({ k: 'ds', id: g.u, s: g.id }, g.c ? { c: g.c } : {}, g.g ? { g: 1 } : {})); }
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
            try { await dsReady(); } catch (e) { return; }                      // 💤 먼저 가진 것
            const s = dsCur(), it = s.own.find(x => x.u === u); if (!it) return;
            if (!await binAsk(dsCat(it.id).n)) return;
            s.own = s.own.filter(x => x.u !== u); ['wall', 'top'].forEach(k => { if (s[k] === u) s[k] = ''; });
            if (typeof DK !== 'undefined' && DK.edit && DS.edit) { DS.gone.push(it); dsPaint(); if (window.deskBoxRender) deskBoxRender(); if (window.showMsg) showMsg('🚛 버릴게요.<br><small>하단 ✔ 완료를 누르면 영구 삭제돼요 (✕ 취소 = 그대로)</small>'); return; }
            dsSave(s); await binAdd(Object.assign({ k: 'ds', id: u, s: it.id }, it.c ? { c: it.c } : {}, it.g ? { g: 1 } : {})); 
            dsPaint(); if (window.deskBoxRender) deskBoxRender();
            await binTold(s.own.length ? '' : '벽지 · 책상은 🏪 기본상품 샵 → 🪑 책상 소품에서 받을 수 있어요');
        }
        BIN_KINDS.ds = {
            name: e => { const c = dsCat(e.s); return c ? (c.k === 'wall' ? '🧱 ' : '🪵 ') + c.n : '🪑 책상 꾸밈'; },
            restore: async e => { await dsReady(); const s = dsRead() || { own: [], wall: '', top: '' }, it = Object.assign({ u: e.id, id: e.s }, e.c ? { c: e.c } : {}, e.g ? { g: 1 } : {}); if (dsCat(e.s) && !s.own.some(x => x.u === e.id)) s.own.push(it); dsSave(s); if (DS.edit && !DS.edit.own.some(x => x.u === e.id)) DS.edit.own.push(Object.assign({}, it)); if (window.deskBoxRender) deskBoxRender(); },
            purge: e => ofDel(DIRS.desk, e.c)       // 🗂 종류 폴더 파일 (도련 11-05)
        };
        /* 🏪 받기 (js/basket.js) : 같은 것도 또 */
        async function dsGive(id) {
            if (!dsCat(id)) return 'fail';
            try { await dsReady(); } catch (e) { return 'fail'; }               // 💤 먼저 가진 것
            const it = { u: dsU(), id }, s = dsRead() || { own: [], wall: '', top: '' };
            s.own.push(it); dsSave(s); window.dsLastGiven = { u: it.u, t: Date.now() };   // 🛍️ 봉투 카드가 기억해요
            if (DS.edit) DS.edit.own.push(it);
            if (window.deskBoxRender) deskBoxRender();
            dsFile(it, 'basic');                                               // 🗂 종류 폴더에 파일 하나 (도련 11-05)
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

        window.dsGiftIds = () => DS_CAT.filter(c => c.gift).map(c => c.id);   // 🎁 상품공방 처음받기 (되살리기 · js/desk.js giftRead)
        window.dsAfterLoad = () => {                                              // 💤 가진 것을 읽은 뒤 (js/desk.js dkOwnReady) : 없어진 쪽이 있으면 되살리기 · 아니면 파일이 아직 없는 것
            if (dsBusy || (typeof drive !== 'undefined' && drive.deskLocked)) return;
            dsBusy = true;
            const need = !Array.isArray(prefGet(DSO_KEY, DSO_LOCAL)) || !prefGet(DS_KEY, DS_LOCAL);
            (need ? dsRescue() : dsFilesFill()).catch(e => console.warn('🧱 벽지 · 책상판', e)).finally(() => { dsBusy = false; dsPaint(); if (window.deskBoxRender) deskBoxRender(); });
        };
        window.dsSync = dsSync; window.dsPaint = dsPaint; window.dsEditStart = dsEditStart; window.dsEditEnd = dsEditEnd; window.dsUse = dsUse; window.dsDiscard = dsDiscard;
        window.dsGive = dsGive; window.dsShopList = dsShopList; window.dsSwatch = dsSwatch; window.dsBoxCells = dsBoxCells; window.dsCount = dsCount; window.dsName = dsName;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['deskskin'] = true;
