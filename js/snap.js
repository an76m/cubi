/* 말랑달콤 다이어리 - js/snap.js
   📦 받은 상품 사본 (도련 11-02) : 이모지만 빼고 받은 모든 상품(무료 · 유료)은 다꾸러 드라이브에 그림 · 속성째 사본을 둬요
   - 그래서 도련이 서버(Cloudflare)에서 상품을 지우거나 · 고치거나 · 실수해도 이미 가진 다꾸러 것은 그대로예요
   - 스티커 · 종이류(씰 · 조각 · 모조지 · 테이프 · 떡메 · 속지 · 메모지 · 계절 · 캡슐)는 원래 받을 때 그림째 저장돼요 (js/own.js) → 여기는 그 밖의 종류
       🪑 책상소품 · ✂️ 문구 · 🌈 배경지 · 🧱 벽지 · 🪵 책상판 · 📔 날짜형바인더 · 날짜형노트 · 페이지바인더 · 페이지노트 · 📒 스티커바인더 · 🤍 이형지북 (도련 11-04 · 🎨 테마는 11-05 없앴어요)
   - 드라이브 : 말랑달콤 / 설정 / 상품-<번호>.json (상품 하나에 파일 하나 · 🔐 스티커처럼 계정 열쇠로 · js/coll.js 모음 '상품-' · 게스트는 이 기기)
       내용 { v, k: 종류, id, h: 모습 번호, P: 속성, f: { 역할: data 주소 }, wh }
   - 언제 만들어요 : 가진 상품 id 를 종류마다 모아서(snapOwn · 각 파일이 등록) 사본이 없는 것을 서버에서 받아 저장 (로그인 뒤 · 받기 뒤 · 30초마다)
   - ✨ 새 모습 : 서버 모습 번호(h)가 내 사본과 다르면 소품함 · 문구함에 '✨ 새 모습' → 다꾸러가 고르면 바꿔요 (snapWin)
       🚑 꼭 고침 (상품 속성 '꼭고침') : 앱을 켤 때 저절로 조용히 바꿔요 (알림 없음 · 도련 11-02) (도련의 실수 고치기 · 다꾸러가 칠한 색 같은 자기 꾸밈은 그대로)
   - 서버에서 사라진 상품 = 가진 다꾸러에게는 사본으로 그대로 (js/prod.js prodList) */
    (function () {
        const SNAP = { C: null, own: (window.SNAP_OWN = window.SNAP_OWN || {}), busy: false, again: false, timer: 0, told: false };   // own = 가진 id 목록 (각 파일이 window.SNAP_OWN[종류] = fn · 이 파일보다 먼저 읽는 파일도 있어서)
        const KINDS = ['책상소품', '문구', '배경지', '벽지', '책상판', '날짜형바인더', '날짜형노트', '페이지바인더', '페이지노트', '스티커바인더', '이형지북'];
        const coll = () => SNAP.C || (SNAP.C = collOf(dirPath(DIRS.settings), '상품-'));
        const live = () => typeof drive !== 'undefined' && (drive.ready || drive.guest);
        function snapOwn(kind, fn) { SNAP.own[kind] = fn; }                        // 가진 상품 id 목록 (각 파일이 등록)
        const toData = async u => {
            if (/^data:/.test(u)) return u;
            const r = await fetch(u); if (!r.ok) throw new Error('snap ' + r.status);
            const b = await r.blob();
            return await new Promise((ok, no) => { const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = no; f.readAsDataURL(b); });
        };
        const seal = async o => { try { return { s: await ownLock(o) }; } catch (e) { return { o }; } };   // 🔐 (열쇠가 아직 없으면 그대로)
        const open = async it => { if (!it) return null; if (it.o) return it.o; try { return await ownUnlock(it.s); } catch (e) { return null; } };
        const okSnap = o => o && typeof o === 'object' && KINDS.includes(o.k) && typeof o.id === 'string' && o.P && typeof o.P === 'object' && o.f && typeof o.f === 'object';
        function put(o, cid) { PROD_SNAP.set(o.k + '|' + o.id, { id: o.id, P: o.P, u: o.f, wh: o.wh || {}, h: o.h || '', cid }); }

        /* 서버 상품 하나 → 사본 (cid 가 있으면 그 파일을 고쳐요 = 새 모습) */
        async function make(k, x, cid) {
            const f = {}; for (const r of Object.keys(x.u || {})) f[r] = await toData(x.u[r]);
            const o = { v: 1, k, id: x.id, h: x.h || '', P: x.P || {}, f, wh: x.wh || {} };
            const it = await seal(o), ex = { k, id: x.id, h: o.h };
            if (cid) await collSet(coll(), cid, it, '', ex); else cid = await collAdd(coll(), it, '', ex);
            put(o, cid);
            return cid;
        }

        /* 로그인 · 게스트 시작 뒤 : 내 사본 모두 읽기 → 🚑 꼭 고침 → 목록 다시 만들기 → 없는 사본 만들기 */
        async function snapLogin() {
            PROD_SNAP.clear(); SNAP.C = null; SNAP.told = false;
            let L = []; try { L = await collAll(coll()); } catch (e) { console.warn('📦 사본 목록', e); }
            const seen = new Set();
            for (let i = 0; i < L.length; i += 6) {
                await Promise.all(L.slice(i, i + 6).map(async e => {
                    let o = null; try { o = await open(await collItem(coll(), e.id)); } catch (er) { console.warn('📦 사본', er); }
                    if (!okSnap(o) || seen.has(o.k + '|' + o.id)) return;             // 두 기기가 같은 상품 사본을 만들었으면 하나만
                    seen.add(o.k + '|' + o.id); put(o, e.id);
                }));
            }
            for (const [key, s] of PROD_SNAP) {                                     // 🚑 꼭 고침 (알림 없이 조용히 · 도련 11-02)
                const k = key.split('|')[0], x = prodServer(k).find(y => y.id === s.id);
                if (x && x.P.꼭고침 && x.h && x.h !== s.h) { try { await make(k, x, s.cid); } catch (e) { console.warn('📦 꼭 고침', e); } }
            }
            prodRebuild();
            snapSoon();
            snapBadge();
        }
        /* 가진 상품 중 사본이 없는 것 → 만들기 */
        async function snapEnsure() {
            if (!live() || !prodOn()) return;
            if (SNAP.busy) { SNAP.again = true; return; }
            SNAP.busy = true; let made = 0;
            try {
                for (const k of Object.keys(SNAP.own)) {
                    let ids = []; try { ids = [...new Set((SNAP.own[k]() || []).filter(id => typeof id === 'string' && id))]; } catch (e) { continue; }
                    for (const id of ids) {
                        if (prodSnapOf(k, id)) continue;
                        const x = prodServer(k).find(y => y.id === id); if (!x) continue;
                        try { await make(k, x); made++; } catch (e) { console.warn('📦 사본 만들기', k, id, e); }
                    }
                }
            } finally { SNAP.busy = false; }
            if (made) { prodRebuild(); snapBadge(); }
            if (SNAP.again) { SNAP.again = false; snapSoon(); }
        }
        function snapSoon() { clearTimeout(SNAP.timer); SNAP.timer = setTimeout(() => snapEnsure().catch(e => console.warn('📦', e)), 1500); }
        setInterval(() => { if (live()) snapEnsure().catch(() => {}); }, 30000);

        /* ✨ 새 모습 : 서버 번호가 내 사본과 다른 것 */
        function snapNews() {
            const out = [];
            PROD_SNAP.forEach((s, key) => {
                const k = key.split('|')[0], x = prodServer(k).find(y => y.id === s.id);
                if (x && x.h && s.h !== x.h) out.push({ k, id: s.id, name: String(x.P.이름 || s.P.이름 || s.id), old: s.u.디자인 || '', neu: x.u.디자인 || '' });
            });
            return out;
        }
        async function snapUpdate(k, id) {
            const s = prodSnapOf(k, id), x = prodServer(k).find(y => y.id === id); if (!s || !x) return false;
            await make(k, x, s.cid); prodRebuild(); snapBadge(); return true;
        }
        /* 소품함 · 문구함 위 '✨ 새 모습 N' (있을 때만) */
        function snapBadge() {
            const n = snapNews().length;
            document.querySelectorAll('.snap-new').forEach(b => { b.hidden = !n; const i = b.querySelector('b'); if (i) i.textContent = n; });
        }
        const snapBtnHtml = () => { const n = snapNews().length; return `<button type="button" class="btn snap-new"${n ? '' : ' hidden'} style="background:linear-gradient(135deg,#ffd36b,#ff9fbd);color:#5b3f4a" onclick="snapWin()">✨ 새 모습 <b>${n}</b></button>`; };
        const KIC = { 책상소품: '🪑', 문구: '✂️', 배경지: '🌈', 벽지: '🧱', 책상판: '🪵', 다이어리: '📔', 스티커첩: '📒', 다이어리모양: '📐' };
        function snapWin() {
            let m = document.getElementById('snapModal');
            if (!m) { m = document.createElement('div'); m.className = 'modal'; m.id = 'snapModal'; m.innerHTML = '<div class="modal-content snap-win"><div class="modal-title">✨ 새 모습</div><div class="snap-hint">말랑달콤이 상품 모습을 새로 고쳤어요 · 바꿀지는 다꾸러 마음이에요 (안 바꾸면 받은 모습 그대로)</div><div id="snapList"></div><button type="button" class="btn" onclick="closeModal(\'snapModal\')">닫기</button></div>'; document.body.appendChild(m); }
            const L = snapNews(), box = document.getElementById('snapList');
            box.innerHTML = L.length ? L.map((x, i) => `<div class="snap-row"><span class="snap-k">${KIC[x.k] || '🧁'}</span><img src="${htmlEsc(x.old)}" alt=""><i>→</i><img src="${htmlEsc(x.neu)}" alt="" crossorigin="anonymous"><b>${htmlEsc(x.name)}</b><button type="button" class="btn" data-i="${i}">바꾸기</button></div>`).join('') : '<p class="snap-hint">새 모습이 없어요.</p>';
            box.querySelectorAll('[data-i]').forEach(b => b.onclick = async () => {
                const x = L[+b.dataset.i]; b.disabled = true; b.textContent = '바꾸는 중…';
                try { await snapUpdate(x.k, x.id); b.textContent = '✔ 바꿨어요'; } catch (e) { console.warn(e); b.disabled = false; b.textContent = '다시'; if (window.showMsg) showMsg('⚠ 새 모습을 받지 못했어요.<br>인터넷 연결을 확인해 주세요.'); }
            });
            openModal('snapModal');
        }
        window.snapOwn = snapOwn; window.snapLogin = snapLogin; window.snapSoon = snapSoon; window.snapEnsure = snapEnsure; window.snapNews = snapNews; window.snapUpdate = snapUpdate;
        window.snapWin = snapWin; window.snapBtnHtml = snapBtnHtml; window.snapBadge = snapBadge;
    })();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['snap'] = true;
