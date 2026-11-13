/* 말랑달콤 다이어리 - js/own.js
   🎒 유한 스티커 공통 시스템 (도련 10-25 · 모든 스티커 종류가 같이 써요)
   - 스티커는 '내 것'(소장 종이)이어야만 붙일 수 있어요 → 🏪 기본상품 샵에서 받거나 · ✂️ 직접 만들거나 · (나중에) 🛍️ 사거나
   - 종이 한 장 = 파일 하나 (씰 종이 한 장 · 나중에 테이프 한 롤 · 떡메 한 묶음 …) · 받을 때마다 새 종이 (같은 스티커도 따로 · 고유 id)
   - 한 칸을 떼어 페이지에 붙이고 일기가 저장되는 순간 그 칸은 영원히 사라져요
       · 그 칸의 그림을 지운 새 파일을 만들고 옛 파일은 완전 삭제 (구글 드라이브 휴지통 · 옛 버전 기록에도 안 남아요)
       · 마지막 칸을 쓰면 종이 파일도 완전 삭제 → 🧺 바구니에서 사라져요
   - 다른 기기에서 이미 쓴 칸이면 : 붙이려던 스티커를 페이지에서 빼고 알려 줘요 (늘 드라이브의 지금 모습을 다시 읽고 고쳐요)
   - 저장 (도련 10-26 · 폴더 한 줄 확정 · 11-05 목록도 종류마다) : 말랑달콤 / 씰 · 조각 · 모조지 · 마테 · 떡메 · 메모지 · 속지 /
                       _목록.json (그 종류 바구니 목록) · _스티커첩.json (그 종류 바인더 · 이형지북) · _목록_백업.json · _스티커첩_백업.json · <id>.json (종이 한 장씩)
       · 목록을 종류마다 나눈 까닭 (도련 11-05) : 스티커가 몇 년 쌓여도 한 칸 쓸 때 그 종류 목록만 읽고 써요 (한 파일이면 1,000장 = 약 1MB 를 매번) · 깨져도 그 종류만
       · 종류는 받을 때 정해지고 바뀌지 않아요 → 파일이 폴더 사이를 옮겨 다니지 않아요 · 바구니 · 바인더 · 이형지도 종류마다라 목록 사이를 옮길 일이 없어요
       · 목록 · 스티커첩 · 백업은 이름이 _ 로 시작 → 종이 파일(무작위 영문 · 숫자 이름)과 섞이지 않아요 (되살리기 · 백업에서 빼기)
       · 받은 곳(기본 · 만든 것 · 선물 …)도 폴더로 나누지 않아요 (종이 파일 안 from)
       · 예전 '스티커목록' 폴더(목록.json 하나)는 안 써요 (개발 중이라 옮기는 코드 없음) · 공유하기는 같은 종류 폴더에 내-/받은- 이름으로 (js/coll.js stkColl · 보류)
       · 🛟 백업 : 종류마다 그날 그 종류 목록을 처음 잘 읽었을 때 3초 뒤 하루 한 번 _백업 으로 복사 → 그 종류 목록이 없어지거나 깨지면 백업 + 그 폴더의 종이 파일로 되살려요 (ownRescue)
       · 화면 쪽은 종류를 알려 줘요 : ownOpen(force, 종류) · ownList(force, 종류) · ownPeek(종류) · ownAlbumGet(force, 종류) (종류를 안 주면 모든 종류) · O.idx · O.album = 읽어 둔 종류를 합친 모습
       · 모두 암호화(AES-GCM · 계정마다 다른 열쇠) → 드라이브에서 열어 봐도 그림이 아니고, 다른 계정으로 옮겨도 못 열어요
       · ☁ 구글로 이동할 때는 종이까지 100% 그대로 옮겨요 (js/devsave.js dvLogin · 도련 11-09 · 백업 zip 은 없앴어요)
       · 말랑달콤 폴더를 지우면 모두 사라지고 되돌릴 수 없어요 (진짜 문구를 불태운 것과 같아요 · 도련)
   - 📁 로그인 없이 폴더에 저장 = 드라이브와 똑같이 (js/devsave.js vfsFetch) · 👀 구경만 = 이 창을 닫으면 사라져요 (일기처럼)
   - 줄어드는 방식 (도련 10-25) : 칸 = 🏷️ 씰(😀 이모지 포함) · 🧩 조각 (뗀 칸만 비어요)
                               수량 = 🎀 테이프 (붙인 길이만큼 · 한 롤 = 상품 롤길이 px (내가 만든 것 OWN_MINE_Q)) · 🧻 떡메 · 📝 메모지 (한 장씩 · 한 묶음 50장) · 📃 속지 (깔면 끝)
                               종이 = 📄 모조지 (오린 자리만 비고 남은 종이는 계속 · 거의 다 오리면 끝)
   - 목록 한 칸 : { id, f : 종이 파일 id, k : 종류, n : 칸 수, u : [쓴 칸 번호] · q0 · q : 처음 · 남은 수량, at : 받은 때, from : 'basic' 무료(기본상품 샵 · 처음받기) · 'gift' 선물(캡슐 …) · 'mine' 내가 만든 · 'share' 공유로 받은 · 'paid' 산 것 (도련 11-09 · 상품 분류 다섯) · start : 1 = 처음받기 · via = 선물 종류 · rel : 1 = 이형지에서 떼어 낸 종이 (분류는 원래 종이 것),
                   nm : 이름, us : [기본스티커 그림 주소] (바구니 미리보기) · th : 작은 그림 · ts : 🔤 글씨스티커 }
   - 종이 파일 : { v, id, k, from, nm, ts, baked : 하얀 테두리를 이미 둘렀는지, imgs : [그림 data · 쓴 칸은 null], wh : [[가로, 세로]], gh : [쓴 칸의 모양 실루엣 PNG · 11-09], q0 · q, x : 종류마다 정보 }
   ※ 파일 불러오는 순서 : drive → coll → … → own → basket (index.html) */

        const OWN_SALT = 'malang-own|v1|softsweetdiary';
        const OWN_KIND = { seal: '씰', piece: '조각', paper: '모조지', tape: '마테', tk: '떡메', memo: '메모지', leaf: '속지' };   // 종이 파일이 사는 종류 폴더 (말랑달콤 바로 아래)
        const ownKindPath = k => dirPath(OWN_KIND[k] || '기타');
        const OWN_KS = Object.keys(OWN_KIND);
        /* 📋 종류마다 목록 (도련 11-05) : 그 종류 폴더 안에 · _ 로 시작해서 종이 파일(무작위 이름)과 섞이지 않아요 */
        const OWN_IDX = '_목록.json', OWN_ALB = '_스티커첩.json', OWN_IDX_BK = '_목록_백업.json', OWN_ALB_BK = '_스티커첩_백업.json', OWN_BK_LS = 'malang_own_bk2';
        const OWN_PEND = 'malang_own_pend', OWN_FRESH = 15000;
        const OWN_MINE_Q = { tape: 2000, tk: 50, memo: 50, leaf: 1 };       // ✂️ 내가 만든 것만 (상품이 아니라 앱 규칙 · 🧁 상품은 상품공방 값 q0 = 롤길이 · 묶음장수 · 도련 11-02)            // 🎀 한 롤 길이(px · 한 번에 170 쯤 → 열 번 남짓) · 🧻 📝 한 묶음 장 수 (실제 떡메 50 · 100매 중 · 도련 10-25) · 📃 한 장
        const ownHas = e => e.q0 ? e.q > 0 : e.u.length < e.n;                  // 아직 남았어요
        const ownAlive = e => !e.bin && ownHas(e);                                 // 🗑 버린 종이(bin = 버린 때)는 바구니 · 만든 것 어디에도 안 보여요 (js/bin.js · 30일 뒤 영구 삭제)
        const O = { kw: '', key: null, kd: {}, idx: null, album: null, noR: new Set(), mem: null, q: Promise.resolve(), subs: new Set(), replayed: '', spent: new Set() };   // spent = 이 창에서 다 쓴 종이 (도련 11-09 · 꺼내 둔 스티커창이 바구니의 옛 목록을 보고 다시 그리지 않게 · basket.js dsEntry)   // kd = 종류마다 (ownK) · idx · album = 모든 종류를 합친 모습 (ownMerge)

        /* ---------- 어디에 (드라이브 · 이 브라우저 = 'drive' / 구경만 = 'mem' / 아직 = '') ---------- */
        const ownMode = () => typeof drive === 'undefined' ? '' : drive.guest ? 'mem' : drive.ready ? 'drive' : '';
        const ownWho = () => ownMode() === 'mem' ? 'guest' : ((typeof COLL !== 'undefined' && COLL.who) || 'me');
        function ownReset() {
            const w = ownWho();
            if (O.kw === w) return;
            O.kw = w; O.key = null; O.kd = {}; O.idx = null; O.album = null;
            if (ownMode() === 'mem') O.mem = { idx: {}, files: new Map(), alb: {}, gone: {} };   // 종류마다
        }

        /* ---------- 🔐 암호화 (계정마다 다른 열쇠 · 압축 → AES-GCM) ---------- */
        const ownEnc = s => new TextEncoder().encode(s), ownDec = b => new TextDecoder().decode(b);
        async function ownKey() {
            ownReset();
            if (O.key) return O.key;
            const raw = await crypto.subtle.digest('SHA-256', ownEnc(OWN_SALT + '|' + O.kw));
            O.key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
            return O.key;
        }
        const OWN_KEYS = new Map();                                          // 계정을 정해서 열 때 (🔐 배치.json 은 로그인하는 중에 열어요 · 아직 구경 모드일 때도 그 계정 열쇠로)
        async function ownKeyOf(who) {
            if (!who) return ownKey();
            if (!OWN_KEYS.has(who)) OWN_KEYS.set(who, crypto.subtle.digest('SHA-256', ownEnc(OWN_SALT + '|' + who)).then(raw => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])));
            return OWN_KEYS.get(who);
        }
        const ownZip = async (b, how) => new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(how)).arrayBuffer());
        const ownB64 = u8 => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).slice(String(r.result).indexOf(',') + 1)); r.onerror = no; r.readAsDataURL(new Blob([u8])); });
        function ownUnB64(s) { const t = atob(s), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u; }
        async function ownLock(obj, who) {
            let b = ownEnc(JSON.stringify(obj)), z = 0;
            if (window.CompressionStream) { b = await ownZip(b, new CompressionStream('gzip')); z = 1; }
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await ownKeyOf(who), b));
            const out = new Uint8Array(13 + ct.length); out[0] = z; out.set(iv, 1); out.set(ct, 13);
            return JSON.stringify({ v: 1, d: await ownB64(out) });
        }
        /* 🔐 드라이브에 저장되는 모든 json (도련 11-11) : 글 그대로 통째로 잠가요 = {"mlk":1,"d":…} (ownLock 과 같은 열쇠 · 같은 방식 · 모양만 달라요)
             js/drive.js driveUpsert 가 올릴 때 잠그고 · readFileText 가 읽을 때 열어요 → 부르는 쪽은 예전처럼 글을 주고받아요 */
        async function ownSealText(text, who) {
            let b = ownEnc(String(text)), z = 0;
            if (window.CompressionStream) { b = await ownZip(b, new CompressionStream('gzip')); z = 1; }
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await ownKeyOf(who), b));
            const out = new Uint8Array(13 + ct.length); out[0] = z; out.set(iv, 1); out.set(ct, 13);
            return JSON.stringify({ mlk: 1, d: await ownB64(out) });
        }
        async function ownOpenText(text, who) {
            let o; try { o = JSON.parse(text); } catch (e) { o = null; }
            if (!o || o.mlk !== 1 || typeof o.d !== 'string') { const er = new Error('corrupt'); er.code = er.type = 'corrupt'; throw er; }
            const u = ownUnB64(o.d);
            let b;
            try { b = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(1, 13) }, await ownKeyOf(who), u.slice(13))); }
            catch (e) { const er = new Error('locked'); er.code = er.type = 'corrupt'; throw er; }   // 다른 계정 열쇠 · 깨진 파일 → 절대 덮어쓰지 않아요
            if (u[0]) b = await ownZip(b, new DecompressionStream('gzip'));
            return ownDec(b);
        }
        window.ownSealText = ownSealText; window.ownOpenText = ownOpenText;
        async function ownUnlock(text, who) {
            let o; try { o = JSON.parse(text); } catch (e) { o = null; }
            if (!o || typeof o.d !== 'string') { const er = new Error('corrupt'); er.code = 'corrupt'; throw er; }
            const u = ownUnB64(o.d);
            let b;
            try { b = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(1, 13) }, await ownKeyOf(who), u.slice(13))); }
            catch (e) { const er = new Error('locked'); er.code = 'corrupt'; throw er; }   // 다른 계정 열쇠 · 깨진 파일 → 절대 덮어쓰지 않아요
            if (u[0]) b = await ownZip(b, new DecompressionStream('gzip'));
            return JSON.parse(ownDec(b));
        }

        /* ---------- 저장소 (드라이브 · 이 브라우저는 js/drive.js 함수 그대로 · 구경만은 메모리) ---------- */
        const ownRid = () => Date.now().toString(36) + crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
        /* 📁 종류 폴더 찾기 (말랑달콤 / 씰 · 마테 …) : 찾은 폴더는 drive.folderIds 가 기억해요 · 없는 종류 폴더는 잠깐(15초) 다시 찾지 않아요 (책상이 모든 종류 스티커첩을 볼 때 요청이 늘지 않게) */
        const OWN_MISS = new Map();
        const ownDirKey = k => ownKindPath(k).join('/');
        async function ownKindDir(k, create) {
            const key = ownDirKey(k);
            if (drive.folderIds.has(key)) return drive.folderIds.get(key);
            const mk = O.kw + '|' + k, t = OWN_MISS.get(mk);
            if (!create && t && performance.now() - t < OWN_FRESH) return null;
            const id = await getFolder(ownKindPath(k), create);
            if (id) OWN_MISS.delete(mk); else OWN_MISS.set(mk, performance.now());
            return id;
        }
        /* ⚡ 여러 종류 폴더를 요청 한 번으로 찾아요 (말랑달콤 바로 아래 · 이름 여러 개) · 못 하면 그냥 하나씩 찾게 둬요 */
        async function ownKindDirs(ks) {
            if (ownMode() !== 'drive') return;
            const now = performance.now();
            const need = ks.filter(k => !drive.folderIds.has(ownDirKey(k)) && !(OWN_MISS.get(O.kw + '|' + k) && now - OWN_MISS.get(O.kw + '|' + k) < OWN_FRESH));
            if (need.length < 2) return;
            try {
                const top = await getFolder([TOP_FOLDER_NAME], false);
                const fs = top ? await driveList(`'${top}' in parents and trashed=false and mimeType='${FOLDER_MIME}' and (${need.map(k => `name='${qName(OWN_KIND[k])}'`).join(' or ')})`, 'id,name') : [];
                need.forEach(k => {
                    const hit = fs.find(f => f.name === OWN_KIND[k]);                 // 먼저 만든 폴더 (driveList = 만든 순서)
                    if (hit) { drive.folderIds.set(ownDirKey(k), hit.id); drive.alive.set(hit.id, Date.now()); OWN_MISS.delete(O.kw + '|' + k); }
                    else OWN_MISS.set(O.kw + '|' + k, performance.now());
                });
            } catch (e) { console.warn('📁 종류 폴더 한 번에 찾기', e); }
        }
        /* 종류마다 기억 (O.kd[종류]) : live = 남은 종이 목록 · at = 읽은 때 · f = 목록 파일 · txt = 잘 읽힌 목록 글 · alb = 스티커첩 · albF · albTxt */
        const ownGoneClean = v => { const seen = new Set(); return (Array.isArray(v) ? v : []).filter(x => x && typeof x.u === 'string' && !seen.has(x.u) && seen.add(x.u)); };
        const ownK = k => O.kd[k] || (O.kd[k] = { live: null, at: 0, f: null, txt: '', alb: null, albF: null, albTxt: '' });
        const ownKs = ks => (ks == null ? OWN_KS : (Array.isArray(ks) ? ks : [ks])).filter(k => OWN_KIND[k]);
        const ownAlbEmpty = () => ({ bd: [], rl: [], g: {} });
        const ownAlbJoin = parts => { const o = ownAlbEmpty(); parts.forEach(a => { if (!a) return; o.bd.push(...(a.bd || [])); o.rl.push(...(a.rl || [])); Object.assign(o.g, a.g || {}); }); return o; };
        const ownAlbPart = (a, k) => ({ bd: (a.bd || []).filter(b => b.k === k), rl: (a.rl || []).filter(r => r.k === k), g: a.g && a.g[k] ? { [k]: 1 } : {} });
        const ownPick = ks => [].concat(...ks.map(k => (O.kd[k] && O.kd[k].live) || []));
        const ownAlbPick = ks => ownAlbJoin(ks.map(k => O.kd[k] && O.kd[k].alb));
        function ownMerge() {                                                     // 모든 종류를 합친 모습 (O.idx · O.album) = 화면 · ownQtyLeft · ownPeek 가 써요
            const L = OWN_KS.filter(k => O.kd[k] && O.kd[k].live), A = OWN_KS.filter(k => O.kd[k] && O.kd[k].alb);
            O.idx = L.length ? ownPick(L) : null;
            O.album = A.length ? ownAlbPick(A) : null;
        }
        /* 🧾 아직 드라이브에 다 못 지운 칸 · 수량(ownPendGet)을 얹은 모습 (도련 11-09 · 구글은 한 장 지우는 데 몇 초 걸려요)
           → 9개를 빨리 붙이면 1개 지운 목록이 먼저 와서 '8개 남음'으로 되살아나 보이던 것 · 얹어서 보면 늘 이 화면에서 쓴 만큼 */
        function ownPendFix(e) {
            const P = ownPendGet().filter(p => p.s === e.id); if (!P.length) return e;
            const x = Object.assign({}, e, { u: (e.u || []).slice() });
            P.forEach(p => { if (p.q) x.q = Math.max(0, (x.q || 0) - p.q); else if (!x.u.includes(p.k)) x.u.push(p.k); });
            return x;
        }
        function ownSetKind(k, list) {
            const d = ownK(k), L = list.map(ownPendFix);
            L.forEach(e => { if (!ownHas(e)) O.spent.add(e.id); });                 // 다 쓴 종이 = 기억 (basket.js dsEntry)
            d.live = L.filter(ownAlive); d.at = performance.now(); ownMerge();
        }
        function ownKindOf(id) {                                                  // 종이 id → 종류 (읽어 둔 목록에서)
            for (const k of OWN_KS) { const d = O.kd[k]; if (d && d.live && d.live.some(e => e.id === id)) return k; }
            return '';
        }
        async function ownFindKind(id) {                                          // 모르면 모든 종류 목록을 읽어 찾아요 (드물어요)
            const k = ownKindOf(id); if (k) return k;
            await ownKindDirs(OWN_KS);
            for (const kk of OWN_KS) { const list = await ownIdxRead(kk); ownSetKind(kk, list); if (list.some(e => e.id === id)) return kk; }
            return '';
        }

        const ownIdxClean = (arr, k) => (Array.isArray(arr) ? arr : []).filter(e => e && /^[\w-]{4,40}$/.test(e.id || '') && e.f).map(e => Object.assign(e, { k: e.k || k, u: Array.isArray(e.u) ? e.u.filter(Number.isInteger) : [] }, e.q0 ? { q: Math.max(0, +e.q || 0) } : {}));
        /* 🗑 브라우저에 기억해 둔 파일 번호가 휴지통에 들어갔는지 (폴더를 지웠거나 · 같은 이름 폴더 합치기) : 번호로는 읽고 써져서 앱에선 멀쩡해 보이지만 드라이브 폴더에는 없어요 (도련 11-06)
           → 이번에 처음 쓰는 기억 번호만 한 번 확인 · 휴지통이면 그 번호는 잊고 지금 폴더에서 다시 찾아요 (내용은 읽지 않아요 · 도련 11-11 : 휴지통 = 사용자가 ⚙ 🗑 휴지통에서 직접 되살리는 곳) */
        const OWN_LIVE = new Set();
        async function ownLive(id) {
            if (!id || OWN_LIVE.has(id)) return true;
            const m = await driveMeta(id).catch(() => undefined);
            if (m === undefined) return true;                                    // 확인을 못 하면 (인터넷) 예전처럼
            if (m) { OWN_LIVE.add(id); return true; }
            return false;
        }
        async function ownIdxRead(k, pre) {                                      // pre : 이미 찾은 목록 파일 (ownOpenKind · null = 없음)
            ownReset();
            if (ownMode() === 'mem') { ownK(k).gone = (O.mem.gone[k] || []).slice(); return (O.mem.idx[k] || []).map(e => Object.assign({}, e, { u: e.u.slice() })); }
            const d = ownK(k);
            const find = async () => { const dir = await ownKindDir(k, false); return dir ? findFile(dir, OWN_IDX) : null; };
            let f = pre;
            if (f === undefined) {
                const m = d.f ? d.f.id : (ownFilesGet(k) || {}).i;
                if (m && (d.f || await ownLive(m))) f = { id: m };              // ⚡ 아는 번호면 찾지 않고 바로 (도련 10-25)
                else {
                    if (m) { console.warn('🗑 기억한 목록 파일이 휴지통에 있어요 → 그 번호는 잊고 지금 폴더에서 다시 찾아요 :', k); if (window.diag) diag('stale', { k, f: '목록', id: m }); }   // 🗑 휴지통 안 내용은 읽지 않아요 (도련 11-11 : 휴지통은 사용자가 직접 되살리는 곳 · 예전 내용을 몰래 섞으면 판단이 헷갈려요)
                    f = await find();
                }
            }
            d.f = f;
            if (!f) return ownRescue(k, 'missing');
            let t;
            try { t = await readFileText(f.id); } catch (e) {
                if (!(e && e.code === 'gone')) throw e;
                f = d.f = await find(); if (!f) return ownRescue(k, 'missing');  // 기억한 번호가 없어졌으면 다시 찾아요 (빈 목록으로 덮어쓰지 않게)
                t = await readFileText(f.id);
            }
            if (!t.trim()) return ownRescue(k, 'missing');
            let o; try { o = await ownUnlock(t); } catch (e) { const r = await ownRescue(k, 'corrupt'); if (r) return r; throw e; }
            d.txt = t;                                                           // 🛟 잘 읽힌 목록만 백업해요 (ownBackup)
            d.gone = ownGoneClean(window.ledgerMix ? ledgerMix('own:' + k, o.gone) : o.gone);   // 🚛 영구삭제 칸 (그 종류 목록 안 · 도련 11-11) + 📒 장부 한 벌 (예전 파일로 바꿔치기해도 · js/drive.js)
            const gs = new Set(d.gone.map(x => x.u)), L0 = ownIdxClean(o.list, k).filter(e => !gs.has(e.id)); d.n = L0.length;
            return L0;
        }
        /* 🛟 목록 되살리기 (도련 10-26 · 11-05 종류마다) : 그 종류 목록 파일이 없어졌거나 깨졌을 때만
           - 그 종류 폴더의 백업 목록(받은 때 · 바구니 미리보기 · 이름)을 바탕으로, 그 폴더에 실제로 남은 종이 파일을 모두 읽어 맞춰요 (_ 로 시작하는 목록 · 스티커첩 · 백업 파일은 빼요)
           - 백업 뒤에 받은 종이도 폴더에 있으니 다시 들어가요 · 다 써서 지운 종이는 폴더에 없으니 안 들어가요 · 쓴 칸 · 남은 수량은 종이 파일 그대로
           - 같은 종이 파일이 둘이면(옛 파일을 못 지운 채) 나중 것만 · 다른 계정 파일이라 하나도 못 풀면 되살리지 않아요 (null → 'corrupt')
           - 바인더 · 이형지 자리는 그 종류 스티커첩(또는 그 백업)이 기억해요
           - 목록이 없고 백업도 없으면 처음 쓰는 종류 → [] (한 번 보고 나면 다시 찾지 않아요) · 목록이 깨졌으면 백업이 없어도 종이 파일로 되살려요 */
        async function ownRescue(k, why) {
            const nk = O.kw + '|' + k;
            const none = () => { if (why === 'missing') { O.noR.add(nk); if (window.diag) diag('noList', { k }); return []; } return null; };   // 🧾 목록 없음 = 빈 목록으로 (처음 쓰는 종류)
            if (why === 'missing' && O.noR.has(nk)) return [];
            const dir = await ownKindDir(k, false); if (!dir) return none();
            let base = [], bkOk = false;
            const bk = await findFile(dir, OWN_IDX_BK), d0 = ownK(k);
            if (bk) {
                try { const bo = await ownUnlock(await readFileText(bk.id)); base = ownIdxClean(bo.list, k); bkOk = true; d0.gone = ownGoneClean((d0.gone || []).concat(ownGoneClean(bo.gone))); }   // 🚛 백업 속 영구삭제 칸도
                catch (e) { if (e && e.code === 'corrupt') return none(); throw e; }
            }
            const bkReal = bkOk, tb0 = d0.tBase;                                                  // 이 폴더의 진짜 백업이 있는지 (휴지통 목록은 빼고 · 아래 '방금 만든 종이뿐' 기다림에 써요 · 11-11)
            if (Array.isArray(d0.tBase)) { const tb = ownIdxClean(d0.tBase, k); tb.forEach(e => { if (!base.some(b => b.id === e.id)) base.push(e); }); if (tb.length) bkOk = true; d0.tBase = null; }   // 🗑 휴지통에 들어간 목록도 바탕으로 (받은 때 · 이름 · 바구니 미리보기)
            /* 백업도 없으면 : 그 폴더에 종이 파일이 있을 때만 종이로 되살려요 (예전엔 '처음 쓰는 종류'로 보고 빈 목록 → 종이는 남았는데 안 보이던 것 · 도련 11-06) */
            const files = (await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}'`, 'id,name,modifiedTime,createdTime')).filter(x => /^[a-z0-9]+\.json$/i.test(x.name));   // 내 종이만 (_ 목록 · 스티커첩 · 백업 · 공유하기 내-/받은- 파일은 빼요)
            if (!bkOk && !files.length) return none();                          // 종이도 없으면 = 정말 처음 쓰는 종류
            if (!bkReal && why === 'missing' && !files.some(x => Date.now() - Date.parse(x.createdTime || 0) > 10 * 60 * 1000)) { d0.tBase = tb0; if (window.diag) diag('rescueWait', { k, papers: files.length }); return none(); }   // 방금 만든 종이뿐 = 첫 종이를 받는 중 (목록이 곧 생겨요 · 10분 넘은 종이가 있을 때만 되살려요)
            if (window.ledgerMix) d0.gone = ownGoneClean(ledgerMix('own:' + k, d0.gone || []));   // 📒 장부의 영구삭제도
            const goneS = new Set((d0.gone || []).map(x => x.u)); base = base.filter(e => !goneS.has(e.id));   // 🚛 영구삭제 번호는 되살리지 않아요
            const got = new Map(); let i = 0;
            await Promise.all(Array.from({ length: 4 }, async () => {
                while (i < files.length) {
                    const x = files[i++];
                    let s; try { s = await ownUnlock(await readFileText(x.id)); } catch (e) { continue; }
                    if (!s || !Array.isArray(s.imgs) || !/^[\w-]{4,40}$/.test(s.id || '')) continue;
                    const was = got.get(s.id);
                    if (goneS.has(s.id)) continue;                                // 🚛 (못 지운 종이 파일이 남았어도)
                    if (!was || String(x.modifiedTime) > String(was.x.modifiedTime)) got.set(s.id, { x, s });
                }
            }));
            if (!bkOk && !got.size) return none();
            const list = [];
            for (const [id, { x, s }] of got) {
                const b = base.find(e => e.id === id), sx = s.x || {};
                const e = b ? Object.assign({}, b) : { id, at: Date.parse(x.createdTime) || Date.now(), from: s.from || 'basic', nm: s.nm || '' };
                e.f = x.id; e.k = s.k || e.k || k; e.n = s.imgs.length || 1;
                e.u = s.imgs.map((v, j) => v == null ? j : -1).filter(j => j >= 0);
                if (s.q0) { e.q0 = s.q0; e.q = Math.max(0, +s.q || 0); }
                if (!b) {
                    if (s.ts) e.ts = 1;
                    if (s.b) e.b = s.b;
                    if (s.start) e.start = 1; if (s.via) e.via = s.via; if (s.rel) e.rel = 1;   // 🛟 종이 파일에서 되살릴 때 표시도 (도련 11-09)
                    if (sx.pad || sx.lf || sx.pp || sx.glue || sx.bg) e.x = { pad: sx.pad, lf: sx.lf, pp: sx.pp, glue: sx.glue, bg: sx.bg, w: sx.w, h: sx.h, tc: sx.tc };   // w · h · tc = 그림 메모지 크기 · 글자색
                    if (e.k === 'tape') e.th = s.imgs.find(Boolean) || '';            // 🎀 테이프 = 테이프 그림 그대로 (받을 때처럼 · 정사각형 미리보기면 책상 롤이 하얗게 보여요 · 11-11)
                    else if (e.k === 'tk' && sx.pad === 'my') e.th = s.imgs[0] || '';
                    else if (!(e.k === 'memo' && sx.pp && sx.pp !== 'img')) e.th = await ownThumb(s.imgs).catch(() => '');
                } else if (e.k === 'tape') { const u = s.imgs.find(Boolean); if (u && /^data:image\/svg/.test(u)) e.th = u; }   // 🎀 (11-11)
                else if (e.th && !e.us && e.k !== 'tk' && e.k !== 'memo') e.th = await ownThumb(s.imgs).catch(() => e.th);   // 뗀 자리가 비게
                if (ownHas(e)) list.push(e);                                      // 🗑 버린 종이도 그대로 (백업의 bin 표시째)
            }
            list.sort((p, q) => (p.at || 0) - (q.at || 0));
            if (window.diag) diag('rescue', { k, why, n: list.length, papers: files.length, bk: bk ? 1 : 0, base: base.length });   // 🧾
            await ownIdxWrite(k, list);
            O.noR.delete(nk); ownRescueSay();
            return list;
        }
        let ownSaidT = 0;
        function ownRescueSay() {
            clearTimeout(ownSaidT);
            ownSaidT = setTimeout(() => { if (typeof showMsg === 'function') showMsg('🛟 스티커 목록 파일이 없어졌거나 깨져서 <b>백업으로 되살렸어요.</b><br><span style="font-size:12px;color:#777;">스티커는 그대로예요. 바인더 · 이형지 자리는 백업한 날로 돌아갔을 수 있어요.</span>'); }, 300);
        }
        /* 🛟 하루 한 번 목록 · 스티커첩 백업 (종류마다 · 그날 그 종류를 처음 열고 잘 읽혔을 때 · 3초 뒤 · 뒤에서 · 바구니 여는 속도에 영향 없어요) */
        async function ownBackupNow(k) {                                          // 🚛 영구 삭제한 뒤 바로 (도련 11-11 · 하루 한 번 백업이 예전 줄을 들고 있지 않게)
            if (ownMode() !== 'drive') return;
            try {
                const d = ownK(k); if (!d.f) return;
                const t = await readFileText(d.f.id), dir = await ownKindDir(k, false); if (!dir || !t) return;
                const f = await findFile(dir, OWN_IDX_BK); await driveUpsert(dir, OWN_IDX_BK, f && f.id, t);
            } catch (e) { console.warn('🛟 스티커 목록 백업 (다음에 다시)', k, e); }
        }
        async function ownBackup(k) {
            const d = ownK(k);
            if (ownMode() !== 'drive' || !d.txt) return;
            const it = d.txt, at = d.albTxt, kw = O.kw, day = new Date().toLocaleDateString('sv'), key = kw + '|' + k;
            let o = lsGet(OWN_BK_LS, {}) || {};   /* 🧰 js/util.js */
            if (o[key] === day) return;
            try {
                const dir = await ownKindDir(k, false); if (!dir || kw !== O.kw) return;
                const put = async (name, txt) => { if (!txt) return; const f = await findFile(dir, name); await driveUpsert(dir, name, f && f.id, txt); };
                await Promise.all([put(OWN_IDX_BK, it), put(OWN_ALB_BK, at)]);
                o[key] = day; localStorage.setItem(OWN_BK_LS, JSON.stringify(o));
            } catch (e) { console.warn('스티커 목록 백업을 못 했어요 (다음에 다시) :', k, e); }
        }
        async function ownIdxWrite(k, list) {
            if (ownMode() === 'mem') { O.mem.idx[k] = list.map(e => Object.assign({}, e, { u: e.u.slice() })); O.mem.gone[k] = (ownK(k).gone || []).slice(); return; }
            const d = ownK(k), body = await ownLock(Object.assign({ v: 1, k, list }, d.gone && d.gone.length ? { gone: d.gone } : {}));   // 🚛 영구삭제 칸도 같은 파일에 (영원히)
            let saved;
            try { saved = await driveUpsert(await ownKindDir(k, true), OWN_IDX, d.f && d.f.id, body); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; d.f = null; saved = await driveUpsert(await ownKindDir(k, true), OWN_IDX, null, body); }
            d.f = { id: saved.id, modifiedTime: saved.modifiedTime }; ownFilesNow(k);
            if (window.diag && d.n != null && list.length < d.n - 1) diag('shrink', { k, from: d.n, to: list.length });   // 🧾 목록이 한꺼번에 줄었어요 (다 쓴 종이 하나씩은 괜찮아요)
            d.n = list.length;
        }
        async function ownFileNew(sheet) {
            const body = await ownLock(sheet);
            if (ownMode() === 'mem') { const id = 'm' + ownRid(); O.mem.files.set(id, body); return id; }
            const dir = () => ownKindDir(sheet.k || 'seal', true);   // 종류 폴더 (말랑달콤 / 씰 …)
            let saved;
            try { saved = await driveUpsert(await dir(), ownRid() + '.json', null, body); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; drive.folderIds.delete(ownDirKey(sheet.k || 'seal')); saved = await driveUpsert(await dir(), ownRid() + '.json', null, body); }
            return saved.id;
        }
        async function ownFileRead(fid) {
            if (ownMode() === 'mem') { const t = O.mem.files.get(fid); if (t == null) { const er = new Error('gone'); er.code = 'gone'; throw er; } return ownUnlock(t); }
            return ownUnlock(await readFileText(fid));
        }
        /* 🔥 완전 삭제 : 휴지통 · 옛 버전 기록에도 남지 않아요 (DELETE) */
        async function ownFileKill(fid) {
            if (!fid) return;
            if (window.diag && ownMode() !== 'mem') diag('kill', { id: fid });   // 🧾 완전 삭제 (js/drive.js diag)
            if (ownMode() === 'mem') { O.mem.files.delete(fid); return; }
            const res = await gfetch(`${DRIVE_API}/${fid}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 404) throw await driveFail(res, 'delete');
        }

        /* ---------- 차례대로 (한 기기 안에서 겹치지 않게) ---------- */
        function ownSerial(fn) { const p = O.q.then(fn, fn); O.q = p.catch(() => {}); return p; }
        /* 🎀 테이프 무늬 고치기 (11-11 · 도련 : 책상 마테 롤이 어느 순간 하얗게) : 예전 되살리기(ownRescue)가 테이프 th 를 정사각형 미리보기로 바꿔 저장했어요
           → 테이프 th 가 테이프 그림(svg)이 아니면 그 종이 파일의 그림으로 되돌려 목록에 저장 (계정마다 한 번 · js/desktape.js 가 불러요) */
        let ownTapeFixed = '';
        async function ownTapeFix() {
            const key = O.kw + '|' + ownMode(); if (!O.kw || ownTapeFixed === key) return 0; ownTapeFixed = key;
            return ownSerial(async () => {
                await ownKindDirs(['tape']);
                const list = await ownIdxRead('tape'); if (!Array.isArray(list)) return 0;
                let n = 0;
                for (const e of list) {
                    if (e.k !== 'tape' || !e.f || /^data:image\/svg/.test(e.th || '') || !ownAlive(e)) continue;
                    let sh; try { sh = await ownFileRead(e.f); } catch (er) { continue; }
                    const u = sh && Array.isArray(sh.imgs) && sh.imgs.find(Boolean);
                    if (u && /^data:image\/svg/.test(u) && u !== e.th) { e.th = u; n++; }
                }
                if (!n) return 0;
                await ownIdxWrite('tape', list); ownIdxApply('tape', list);
                if (window.diag) diag('tapeTh', { n });                               // 🧾 몇 롤을 고쳤는지
                setTimeout(ownTell, 0);
                return n;
            }).catch(e => { ownTapeFixed = ''; console.warn('🎀 테이프 무늬 고치기', e); return 0; });
        }
        function ownTell() { O.subs.forEach(fn => { try { fn(); } catch (e) {} }); }
        function ownOnChange(fn) { O.subs.add(fn); return () => O.subs.delete(fn); }
        function ownReady() {
            const m = ownMode();
            if (!m) { const er = new Error('ready'); er.code = 'ready'; throw er; }
            if (!window.crypto || !crypto.subtle) { const er = new Error('crypto'); er.code = 'crypto'; throw er; }
            ownReset();
        }

        /* ---------- 📋 바구니 목록 (새것 먼저 · 쓰는 중인 칸은 이 기기에서 바로 빠져 보여요) ----------
           ks = 읽을 종류 (한 종류 · 여러 종류 · 없으면 모든 종류) · 결과 = 그 종류들의 남은 종이 */
        async function ownList(force, ks) {
            ownReady(); ks = ownKs(ks);
            const fresh = k => O.kd[k] && O.kd[k].live && performance.now() - O.kd[k].at < OWN_FRESH;
            if (!force && ks.every(fresh)) return ownPick(ks);
            return ownSerial(async () => {
                await ownKindDirs(ks);
                await Promise.all(ks.map(async k => ownIdxApply(k, await ownIdxRead(k))));
                return ownPick(ks);
            });
        }
        function ownIdxApply(k, list) {                                          // 이 기기에서 쓰는 중인 칸 · 수량을 빼고 기억해요 (ownSetKind 가 얹어요)
            const pend = ownPendGet();
            ownSetKind(k, list);
            if (pend.length && O.replayed !== O.kw) { O.replayed = O.kw; setTimeout(ownReplay, 0); }   // 지난번에 다 못 지운 칸 이어서
            return O.kd[k].live;
        }
        /* ⚡ 목록 · 스티커첩 파일 번호를 기억해요 (계정 · 종류마다 · 도련 10-25) : 다음에 열 때 폴더 찾기 · 파일 찾기 없이 바로 읽어요
           그다음 뒤에서 한 번 찾아 보고, 다른 기기에서 새로 만들었거나 바뀌었으면 다시 읽어 바구니를 고쳐 그려요 (ownTell) */
        const OWN_FILES_LS = 'malang_own_files4';                           // 4 : 종류마다 (11-05 · 예전 번호를 쓰지 않게)
        const ownFilesGet = k => { try { const o = (JSON.parse(localStorage.getItem(OWN_FILES_LS) || '{}') || {})[O.kw]; return (o && o[k]) || null; } catch (e) { return null; } };
        function ownFilesSet(k, v) { try { const all = JSON.parse(localStorage.getItem(OWN_FILES_LS) || '{}') || {}; const o = all[O.kw] && typeof all[O.kw] === 'object' ? all[O.kw] : (all[O.kw] = {}); o[k] = v; localStorage.setItem(OWN_FILES_LS, JSON.stringify(all)); } catch (e) {} }
        const ownFilesNow = k => { const d = ownK(k); ownFilesSet(k, { i: d.f ? d.f.id : '', a: d.albF ? d.albF.id : '' }); };
        async function ownFilesCheck(k, mem) {                                   // 뒤에서 : 기억한 번호가 아직 맞는지
            try {
                const dir = await ownKindDir(k, false); if (!dir) return;
                const fs = await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}' and (name='${OWN_IDX}' or name='${OWN_ALB}')`, 'id,name');
                const i = (fs.find(x => x.name === OWN_IDX) || {}).id || '', a = (fs.find(x => x.name === OWN_ALB) || {}).id || '';
                if (i === mem.i && a === mem.a) return;
                const d = ownK(k);
                if (mem.i && i && mem.i !== i) await ownSerial(async () => {   /* 살아 있는 목록이 없으면 합치지 않아요 = 처음부터 (도련 10-30 · 드라이브가 기준) */      // 🛟 기억한 목록이 휴지통 · 다른 파일이 된 사이에 거기에 받은 종이를 썼을 수 있어요 (도련 10-29)
                    let old = []; try { old = ownIdxClean((await ownUnlock(await readFileText(mem.i))).list, k); } catch (e) { return; }   // → 살아 있는 목록에 합쳐요 (없는 것만 더해요)
                    let live = []; if (i) { try { live = ownIdxClean((await ownUnlock(await readFileText(i))).list, k); } catch (e) { return; } }
                    const have = new Set(live.map(e => e.id)), add = old.filter(e => !have.has(e.id));
                    if (!add.length) return;
                    d.f = i ? { id: i } : null; await ownIdxWrite(k, live.concat(add));
                });
                ownFilesSet(k, { i: d.f && d.f.id !== mem.i ? d.f.id : i, a }); d.at = 0; await ownOpen(true, [k]); ownTell();
            } catch (e) { console.warn(e); }
        }
        /* ⚡ 바구니 열기 : 그 종류의 목록 파일 · 스티커첩 파일을 동시에 읽어요 · ks = 열 종류 (없으면 모든 종류 · 🍽 오늘 쓸 스티커처럼) */
        async function ownOpen(force, ks) {
            ownReady(); ks = ownKs(ks);
            const fresh = k => { const d = O.kd[k]; return d && d.live && d.alb && performance.now() - d.at < OWN_FRESH; };
            if (!force && ks.every(fresh)) return { list: ownPick(ks), album: ownAlbPick(ks) };
            return ownSerial(async () => {
                await ownKindDirs(ks);
                await Promise.all(ks.map(ownOpenKind));
                return { list: ownPick(ks), album: ownAlbPick(ks) };
            });
        }
        async function ownOpenKind(k) {
            const d = ownK(k);
            const mem = ownMode() !== 'mem' ? ownFilesGet(k) : null;
            if (mem && mem.i) {                                                  // ⚡ 기억한 번호로 바로 (둘 다 동시에)
                const [list, alb, live] = await Promise.all([ownIdxRead(k, { id: mem.i }), ownAlbRead(k, mem.a ? { id: mem.a } : null), driveMeta(mem.i).catch(() => true)]).catch(() => [null, null, true]);
                if (!live) { ownFilesSet(k, { i: '', a: '' }); d.f = d.albF = null; }   /* 🗑 기억한 목록이 휴지통 (말랑달콤 · 종류 폴더를 지웠어요) = 기억을 버리고 살아 있는 폴더에서 (도련 11-04) */
                else if (list && d.f && (!mem.a || d.albF)) {
                    d.alb = ownAlbumClean(alb, null); ownIdxApply(k, list);
                    setTimeout(() => ownFilesCheck(k, mem), 0); setTimeout(() => ownBackup(k), 3000);
                    return;
                }
            }
            let pi, pa;                                                          // 목록 · 스티커첩 파일을 한 번에 찾아요
            if (ownMode() !== 'mem') {
                const dir = await ownKindDir(k, false);
                if (!dir) { pi = pa = null; }
                else {
                    const fs = await driveList(`'${dir}' in parents and trashed=false and mimeType!='${FOLDER_MIME}' and (name='${OWN_IDX}' or name='${OWN_ALB}')`, 'id,name,modifiedTime,size');
                    pi = fs.find(x => x.name === OWN_IDX) || null; pa = fs.find(x => x.name === OWN_ALB) || null;
                }
            }
            const [list, alb] = await Promise.all([ownIdxRead(k, pi), ownAlbRead(k, pa)]);   // 동시에 읽어요
            d.alb = ownAlbumClean(alb, null); ownIdxApply(k, list);
            if (ownMode() !== 'mem') { ownFilesNow(k); setTimeout(() => ownBackup(k), 3000); }
        }
        const ownLeft = e => e.q0 ? e.q : e.n - e.u.length;
        const ownQtyLeft = id => { const e = O.idx && O.idx.find(x => x.id === id); return e ? (e.q0 ? e.q : ownLeft(e)) : 0; };

        /* ---------- ➕ 새 종이 넣기 (받기 · 만들기 · 나중에 사기) ----------
           sheet : { k, from, nm, ts, baked, imgs, wh } · meta : { us (kit 그림 주소) · th (작은 그림) } → id */
        /* 📦 여러 장을 한 번에 (도련 11-04 · 처음 선물 테이프 10롤 = 하나씩이면 드라이브 30번 · 10초 넘게) : 종이 파일은 동시에 만들고 · 종류마다 목록은 한 번만 읽고 써요 → [id …] */
        async function ownAddMany(items) {
            ownReady();
            const built = items.map(([sheet, meta]) => ownBuild(sheet, meta));
            return ownSerial(async () => {
                const one = b => ownFileNew(b.full).catch(e => { console.warn('📦 종이 만들기', e); return ''; });
                const ks = [...new Set(built.map(b => b.ent.k))];
                const firsts = ks.map(k => built.find(b => b.ent.k === k));             // 종류마다 첫 장 = 종류 폴더를 만들어요 (동시에 만들면 폴더가 둘 생겨요)
                const f0 = await Promise.all(firsts.map(one));
                firsts.forEach((b, i) => { b.ent.f = f0[i]; });
                await Promise.all(built.filter(b => !firsts.includes(b)).map(async b => { b.ent.f = await one(b); }));
                const ok = built.filter(b => !!b.ent.f);
                const done = new Set();
                try {
                    for (const k of ks) {
                        const mine = ok.filter(b => b.ent.k === k); if (!mine.length) continue;
                        const list = await ownIdxRead(k), have = new Set(mine.map(b => b.ent.id));
                        const out = list.filter(x => !have.has(x.id)).concat(mine.map(b => b.ent));
                        await ownIdxWrite(k, out);
                        ownSetKind(k, out); done.add(k);
                    }
                } catch (e) { ok.filter(b => !done.has(b.ent.k)).forEach(b => ownFileKill(b.ent.f).catch(() => {})); if (done.size) ownTell(); throw e; }   // 목록에 못 넣은 종류의 종이 파일만 치워요
                ownTell();
                return built.map(b => b.ent.f ? b.id : null);
            });
        }
        async function ownTakeMany(ds) {                                         // ownTake 여러 장 (같은 모양)
            const items = [];
            for (const d of ds) {
                const imgs = (d.imgs || []).slice(), th = d.th || (d.us || d.noTh ? '' : await ownThumb(imgs.filter(Boolean), d.thSize));
                items.push([{ k: d.k, from: d.from || 'basic', start: d.start, via: d.via, by: d.by, nm: d.nm, ts: d.ts, baked: d.baked, imgs, wh: d.wh || (d.k === 'seal' || d.k === 'piece' ? await ownSizes(imgs) : []), x: d.x, q0: d.q0, b: d.b, L: d.L }, Object.assign({}, d.us ? { us: d.us } : {}, th ? { th } : {})]);
            }
            return ownAddMany(items);
        }
        function ownBuild(sheet, meta) {                                         // 종이 · 목록 한 칸 만들기 (저장 전)
            const id = ownRid(), imgs = sheet.imgs.slice(0, 150);   // 시트 하나 = 그림 150장까지 (elements.js KIT_MAX 와 같게 · 도련 11-04)
            const full = { v: 1, id, k: sheet.k || 'seal', from: sheet.from || 'basic', nm: sheet.nm || '', ts: sheet.ts ? 1 : 0, baked: !!sheet.baked, imgs, wh: sheet.wh || [], x: sheet.x || {} };
            const L = sheet.L && Array.isArray(sheet.L.b) && sheet.L.b.length === imgs.length ? { r: +sheet.L.r, b: sheet.L.b.map(v => v.map(n => Math.round(n * 1e5) / 1e5)) } : null;   // 🗺️ 시트 배치 그대로 (도련 10-29)
            if (L) full.L = L;
            const ent = { id, f: '', k: full.k, n: imgs.length, u: [], at: Date.now(), from: full.from, nm: full.nm };
            const q0 = sheet.q0 || (full.from === 'mine' ? OWN_MINE_Q[full.k] : 0);
            if (q0) { full.q0 = full.q = q0; ent.q0 = ent.q = q0; }
            if (full.ts) ent.ts = 1;
            if (sheet.start) full.start = ent.start = 1;                          // 🎁 처음받기 (도련 11-09 · 분류는 basic)
            if (sheet.via) full.via = ent.via = String(sheet.via);
            if (sheet.by) full.by = ent.by = String(sheet.by).slice(0, 40);      // 📥 공유로 준 사람 (닉네임)                // 🎁 선물 종류 (capsule · season · event · person · all)
            if (sheet.b) full.b = sheet.b;                                        // 🛟 되살릴 때 들어갈 바구니 (😀 이모지)
            if (meta && meta.us) ent.us = meta.us.slice(0, 150);
            if (L) ent.L = L;                                                     // 바구니 카드도 배치 그대로
            if (meta && meta.th) ent.th = meta.th;
            if (sheet.b) ent.b = sheet.b;                                         // 들어갈 바구니 (😀 이모지는 씰이지만 이모지 바구니로)
            if (sheet.x && (sheet.x.pad || sheet.x.lf || sheet.x.pp || sheet.x.glue || sheet.x.bg)) ent.x = { pad: sheet.x.pad, lf: sheet.x.lf, pp: sheet.x.pp, glue: sheet.x.glue, bg: sheet.x.bg, w: sheet.x.w, h: sheet.x.h, tc: sheet.x.tc };
            return { id, full, ent };
        }
        async function ownAdd(sheet, meta) {
            ownReady();
            const { id, full, ent } = ownBuild(sheet, meta);
            return ownSerial(async () => {
                ent.f = await ownFileNew(full);
                try {
                    const list = await ownIdxRead(ent.k);                         // 다른 기기가 고친 목록 위에 더해요 (그 종류 목록만)
                    const at = list.findIndex(x => x.id === ent.id);              // 🛟 되살리면서 이미 들어갔으면 바꿔 끼워요
                    if (at >= 0) list.splice(at, 1);
                    list.push(ent);
                    await ownIdxWrite(ent.k, list);
                    ownSetKind(ent.k, list);
                } catch (e) { ownFileKill(ent.f).catch(() => {}); throw e; }   // 목록에 못 넣었으면 종이 파일도 치워요
                ownTell();
                if (sheet.from === 'mine' && !(meta && meta.noDesign)) ownDesignSave(sheet, meta).then(() => ownTell(), e => console.warn('📐 도안', e));   // ✂️ 만든 것 = 도안도 저절로 (도련 11-09)
                return id;
            });
        }

        /* ---------- 📐 내 도안 (도련 11-09) : 작가는 틀을 가지고 있어요
           - ✂️ 내가 만든 스티커(from 'mine')는 만들 때 도안이 저절로 하나 생겨요 → 말랑달콤 / 도안 / 내-<시각>.json (js/coll.js 모음 · 내-목록N.json)
           - 도안은 쓰는 물건이 아니라 안 사라져요 · 🧺 서랍의 종이만 쓰면 사라져요 (현실 : 원본 파일은 남고 인쇄한 스티커는 쓰면 끝)
           - 📄 한 장 더 찍기 = 도안 그대로 새 종이 한 장 (수량 = 처음 만든 것과 같아요 · OWN_MINE_Q) · 🗑 도안 버리기 = 다시 못 찍어요 (서랍의 종이는 그대로)
           - 📤 공유는 종이만 (받은 사람은 도안이 없어요 · 다 쓰면 끝) · ☁ 구글로 이동 때는 따라가요 (말랑달콤 폴더째)
           - 한 칸 : { id, th, x: { k 종류, nm 이름 } } · 원본 : { v: 1, sheet : ownAdd 에 넣은 종이 (수량 · 쓴 칸 없이), meta : { th } } */
        const ownDesignColl = () => window.collOf && typeof DIRS !== 'undefined' ? collOf(dirPath(DIRS.design), '내-') : null;
        async function ownDesignSave(sheet, meta) {
            const C = ownDesignColl(); if (!C) return '';
            const s = { k: sheet.k || 'seal', from: 'mine', nm: sheet.nm || '', ts: sheet.ts ? 1 : 0, baked: !!sheet.baked, imgs: (sheet.imgs || []).slice(0, 150), wh: sheet.wh || [], x: sheet.x || {} };
            ['L', 'b', 'q0'].forEach(k => { if (sheet[k] != null) s[k] = sheet[k]; });
            const th = (meta && meta.th) || '';
            return collAdd(C, { v: 1, sheet: s, meta: th ? { th } : {} }, th, { k: s.k, nm: s.nm });
        }
        async function ownDesigns(k) {                                           // 그 종류의 도안 (새것부터)
            const C = ownDesignColl(); if (!C) return [];
            return (await collAll(C)).filter(e => e && e.x && (!k || e.x.k === k)).sort((a, b) => (+b.id || 0) - (+a.id || 0));
        }
        async function ownDesignPrint(id) {                                      // 📄 한 장 더 찍기 → 새 종이 id
            const C = ownDesignColl(); if (!C) throw new Error('ready');
            const it = await collItem(C, id); if (!it || !it.sheet) throw new Error('gone');
            return ownAdd(Object.assign({}, it.sheet, { from: 'mine', imgs: (it.sheet.imgs || []).slice() }), Object.assign({}, it.meta || {}, { noDesign: 1 }));
        }
        async function ownDesignDrop(id, keep) { const C = ownDesignColl(); if (C) await collRemove(C, id, false, keep); }   // keep = 사용자가 도안을 버림 → 🗑 앱 휴지통
        window.ownDesigns = ownDesigns; window.ownDesignPrint = ownDesignPrint; window.ownDesignDrop = ownDesignDrop;

        /* ---------- 📂 종이 한 장 열기 : 늘 드라이브의 지금 모습 (다른 기기에서 쓴 칸은 비어 있어요) ---------- */
        async function ownSheet(id) {
            ownReady();
            return ownSerial(async () => {
                const k = await ownFindKind(id); if (!k) { ownTell(); return null; }
                const list = await ownIdxRead(k);
                ownSetKind(k, list);
                const e = list.find(x => x.id === id);
                if (!e || !ownAlive(e)) { ownTell(); return null; }
                let s;
                try { s = await ownFileRead(e.f); } catch (er) { if (er && er.code === 'gone') { ownTell(); return null; } throw er; }
                for (const p of ownPendGet()) { if (p.s !== id) continue; if (p.q) s.q = Math.max(0, (s.q || 0) - p.q); else if (s.imgs[p.k] != null) { s.gh = s.gh || []; if (!s.gh[p.k]) s.gh[p.k] = await ownGhost(s.imgs[p.k], !s.baked); s.imgs[p.k] = null; } }   // 이 기기에서 쓰는 중인 칸 · 수량
                if (s.q0 && s.q <= 0) return null;
                return { e, s };
            });
        }

        /* ---------- ✂️ 한 칸 쓰기 (페이지에 붙고 저장된 순간) ----------
           el : 붙은 페이지 요소 (다른 기기에서 이미 쓴 칸이면 페이지에서 빼요) */
        function ownPendGet() { try { const o = JSON.parse(localStorage.getItem(OWN_PEND) || '{}'); return Array.isArray(o[O.kw || ownWho()]) ? o[O.kw || ownWho()] : []; } catch (e) { return []; } }
        function ownPendSet(arr) {
            if (ownMode() === 'mem') return;                                    // 👀 구경만은 남기지 않아요
            try { const o = JSON.parse(localStorage.getItem(OWN_PEND) || '{}'); if (arr.length) o[O.kw] = arr; else delete o[O.kw]; localStorage.setItem(OWN_PEND, JSON.stringify(o)); } catch (e) {}
        }
        function ownUse(id, k, el) { return ownOp(id, { k }, el); }                     // 칸 하나
        function ownQty(id, q, el) { return ownOp(id, { q: Math.max(1, Math.round(q)) }, el); }   // 수량 (테이프 길이 · 떡메 · 메모지 · 속지)
        function ownPaper(id, img, th, left, el, a0) { return ownOp(id, { img, th, left, a0 }, el); }   // 📄 모조지 : 남은 종이 그림으로 바꾸기 (left : 남은 비율)
        function ownOp(id, op, el) {
            ownReset();
            if (window.dgDone) dgDone();                                             // 🩷 처음 붙였으면 다꾸하는 법 메모는 끝 (js/dkguide.js)
            if (op.img == null) {                                                 // 칸 · 수량은 끊겨도 다음에 이어서 지워요 (이 기기에 기억)
                const pend = ownPendGet();
                const kk = ownKindOf(id);                                          // 종류도 기억해요 (이어서 지울 때 그 종류 목록만 읽게)
                if (op.q) pend.push({ s: id, q: op.q, t: Date.now(), n: ownRid(), kk });
                else if (!pend.some(p => p.s === id && p.k === op.k)) pend.push({ s: id, k: op.k, t: Date.now(), kk });
                ownPendSet(pend); op.n = op.q ? pend[pend.length - 1].n : '';
            }
            if (O.idx) {                                                          // 이 기기에서는 바로 빠져 보여요
                const e = O.idx.find(x => x.id === id);
                if (e) { if (op.q) e.q = Math.max(0, e.q - op.q); else if (op.img != null) { if (op.th) e.th = op.th; if (op.left <= OWN_PAPER_END) { e.q0 = 1; e.q = 0; } } else if (!e.u.includes(op.k)) e.u.push(op.k); if (!ownHas(e)) O.spent.add(id); }
                OWN_KS.forEach(k => { const d = O.kd[k]; if (d && d.live) d.live = d.live.filter(ownAlive); }); ownMerge(); ownTell();
            }
            const kk = ownKindOf(id);
            return ownSerial(() => ownSpend(id, op, el, kk));
        }
        const OWN_PAPER_END = .04;                                                // 📄 남은 종이가 이만큼보다 적으면 다 쓴 종이
        async function ownSpend(id, op, el, kk) {
            const done = () => ownPendSet(ownPendGet().filter(p => !(p.s === id && (op.q ? p.n === op.n : p.k === op.k))));
            let list, k = kk && OWN_KIND[kk] ? kk : '';
            try { if (!k) k = await ownFindKind(id); list = k ? await ownIdxRead(k) : []; }
            catch (e) { ownRetryLater(); throw e; }                              // 인터넷이 끊겼어요 → 나중에 이어서 (이 기기에서는 이미 빠져 보여요)
            const e = list.find(x => x.id === id);
            let s = null;
            if (e) { try { s = await ownFileRead(e.f); } catch (er) { if (!(er && er.code === 'gone')) { ownRetryLater(); throw er; } } }
            const gone = !e || !s || (op.q ? !(s.q > 0) : op.img != null ? false : s.imgs[op.k] == null);
            if (gone) {                                                          // 📱 다른 기기에서 이미 쓴 칸 · 다 쓴 묶음
                done(); ownGone(el); if (!e || !s || op.q) O.spent.add(id);
                if (k) ownSetKind(k, list); ownTell();
                return false;
            }
            let end;
            if (op.q) { s.q = Math.max(0, s.q - op.q); e.q = s.q; end = s.q <= 0; }
            else if (op.img != null) { s.imgs = [op.img]; if (op.th) e.th = op.th; s.x = Object.assign({}, s.x, { grained: 1 }, op.a0 && !(s.x && s.x.a0) ? { a0: op.a0 } : {}); end = op.left <= OWN_PAPER_END; }   // a0 : 처음 종이의 잉크 양 (남은 비율 재기)
            else {
                if (!(s.gh && s.gh[op.k])) { s.gh = s.gh || []; s.gh[op.k] = await ownGhost(s.imgs[op.k], !s.baked); }   // 👻 뗀 자리 = 그림 모양 그대로 (모양만 · 도련 11-09)
                s.imgs[op.k] = null;
                e.u = s.imgs.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
                end = e.u.length >= e.n;
            }
            const old = e.f;
            try {
                if (end) { list.splice(list.indexOf(e), 1); O.spent.add(id); }   // 마지막 칸 · 다 쓴 묶음 → 종이째 사라져요
                else {
                    if (op.k != null && e.th && !e.us) e.th = await ownThumb(s.imgs, 0, s.gh);   // 바구니 미리보기도 뗀 자리가 비게
                    e.f = await ownFileNew(s);                                   // 새 파일로 바꿔 쓰고 옛 것은 완전 삭제 (옛 버전 기록으로 되살릴 수 없게)
                }
                await ownIdxWrite(k, list);
            } catch (er) { if (e.f !== old) ownFileKill(e.f).catch(() => {}); ownRetryLater(); throw er; }
            await ownFileKill(old).catch(er => console.warn('옛 종이 파일을 지우지 못했어요 (다음에 다시) :', er));
            done();
            ownSetKind(k, list); ownTell();
            return true;
        }
        function ownGone(el) {
            if (!el) return;                                                     // 이어서 지우기(ownReplay) : 이미 지운 칸이면 조용히
            if (el.isConnected) {
                el.remove();
                if (typeof saveData === 'function') saveData(false);
            }
            if (typeof showMsg === 'function') showMsg('📱 이 스티커는 <b>다른 기기에서 이미 썼어요.</b><br><span style="font-size:12px;color:#777;">스티커는 한 번만 쓸 수 있어서 페이지에서 뺐어요.</span>');
        }
        let ownRetryT = 0;
        function ownRetryLater() { clearTimeout(ownRetryT); ownRetryT = setTimeout(ownReplay, 30000); }
        async function ownReplay() {
            if (!ownMode()) return;
            for (const p of ownPendGet()) { try { await ownSerial(() => ownSpend(p.s, p.q ? { q: p.q, n: p.n } : { k: p.k }, null, p.kk)); } catch (e) { return; } }
        }
        window.addEventListener('online', () => { if (ownPendGet().length) ownReplay(); });

        /* ---------- 🖼️ 종이 미리보기 (만든 스티커 : 바구니 칸 · 뗀 자리는 비워요) ---------- */
        const ownImg = src => new Promise(ok => { if (!src) { ok(null); return; } const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
        /* 👻 뗀 자리 실루엣 : 그림은 버리고 모양(투명도)만 · 긴 쪽 128px PNG (하얀 테두리째 · 다 쓰면 종이와 함께 지워져요) */
        async function ownGhost(src, bake) {
            if (!src) return null;
            if (bake && window.pelBake) src = await pelBake(src).catch(() => src);
            const im = await ownImg(src); if (!im || !im.width) return null;
            const k = Math.min(1, 128 / Math.max(im.width, im.height)), c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
            const x = c.getContext('2d'); x.drawImage(im, 0, 0, c.width, c.height);
            x.globalCompositeOperation = 'source-in'; x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
            try { return c.toDataURL('image/png'); } catch (e) { return null; }
        }
        async function ownThumb(imgs, size, gh) {
            size = size || 120;
            const ims = await Promise.all(imgs.map(ownImg)), gs = await Promise.all(imgs.map((u, i) => u ? null : ownImg(gh && gh[i]))), n = ims.length, cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
            const P = 8, G = 4, cs = (size - P * 2 - G * (cols - 1)) / cols, c = document.createElement('canvas');
            c.width = size; c.height = Math.round(P * 2 + rows * cs + G * (rows - 1));
            const x = c.getContext('2d');
            ims.forEach((im, i) => {
                const cx = P + (i % cols) * (cs + G), cy = P + Math.floor(i / cols) * (cs + G);
                if (!im && gs[i]) {                                              // 👻 뗀 자리 모양
                    const g = gs[i], k = Math.min(cs / g.width, cs / g.height), w = g.width * k, h = g.height * k, t = document.createElement('canvas');
                    t.width = Math.max(1, Math.round(w)); t.height = Math.max(1, Math.round(h));
                    const y = t.getContext('2d'); y.drawImage(g, 0, 0, t.width, t.height); y.globalCompositeOperation = 'source-in'; y.fillStyle = 'rgba(200,190,205,.4)'; y.fillRect(0, 0, t.width, t.height);
                    x.drawImage(t, cx + (cs - w) / 2, cy + (cs - h) / 2, w, h); return;
                }
                if (!im) { x.fillStyle = 'rgba(200,190,205,.22)'; x.beginPath(); x.arc(cx + cs / 2, cy + cs / 2, cs * .3, 0, Math.PI * 2); x.fill(); return; }   // 뗀 자리
                const k = Math.min(cs / im.width, cs / im.height), w = im.width * k, h = im.height * k;
                x.drawImage(im, cx + (cs - w) / 2, cy + (cs - h) / 2, w, h);
            });
            let u = ''; try { u = c.toDataURL('image/webp', .8); } catch (e) {}
            return /^data:image\/webp/.test(u) ? u : c.toDataURL('image/png');
        }
        /* 그림 크기 [[가로, 세로]] */
        async function ownSizes(imgs) { return (await Promise.all(imgs.map(ownImg))).map(im => im ? [im.naturalWidth, im.naturalHeight] : [0, 0]); }

        /* ---------- 🏪 기본스티커 받기 : 그림을 받아 그대로 내 종이로 (us : 기본스티커 그림 주소들) ---------- */
        async function ownBlobUrl(u) {
            const res = await fetch(u, { cache: 'force-cache' });
            if (!res.ok) throw new Error('kit ' + res.status);
            const b = await res.blob();
            return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsDataURL(b); });
        }
        /* 🎁 처음 선물 씰 (도련 11-06 · 상품공방 '처음받기') : 씰 시트 → ownTakeMany 에 넘길 종이 (ownTakeKit 과 같은 모양) */
        async function ownKitDesc(us, nm, L) { return { k: 'seal', from: 'basic', nm, baked: !!L, imgs: await Promise.all(us.map(ownBlobUrl)), us, L }; }
        async function ownTakeKit(us, nm, L) {
            const imgs = await Promise.all(us.map(ownBlobUrl));
            return ownAdd({ k: 'seal', from: 'basic', nm, baked: !!L, imgs, wh: await ownSizes(imgs), L }, { us });   // 🗺️ 배치 시트는 하얀 테두리째 잘라서 더 두르지 않아요
        }
        /* ✂️ 만든 씰 : 하얀 테두리를 이미 두른 그림들 → 내 종이로 */
        async function ownTakeMine(srcs, opt) {
            const imgs = (Array.isArray(srcs) ? srcs : [srcs]).filter(Boolean);
            return ownAdd({ k: 'seal', from: 'mine', nm: (opt && opt.nm) || '', ts: opt && opt.ts, baked: true, imgs, wh: await ownSizes(imgs) }, { th: await ownThumb(imgs) });
        }

        /* 🎒 아무 종류나 새 종이로 (기본상품 샵 · 만들기 · 선물) : d = { k, from, nm, imgs, baked, ts, x, q0, us, th } · th 가 없으면 그림으로 만들어요 */
        async function ownTake(d) {
            const imgs = (d.imgs || []).slice();
            const th = d.th || (d.us || d.noTh ? '' : await ownThumb(imgs.filter(Boolean), d.thSize));   // noTh : 바구니가 모양을 직접 그려요 (그린 떡메 · 속지 · 메모지)
            return ownAdd({ k: d.k, from: d.from || 'basic', start: d.start, via: d.via, by: d.by, nm: d.nm, ts: d.ts, baked: d.baked, imgs, wh: d.wh || (d.k === 'seal' || d.k === 'piece' ? await ownSizes(imgs) : []), x: d.x, q0: d.q0, b: d.b },
                Object.assign({}, d.us ? { us: d.us } : {}, th ? { th } : {}));
        }
        /* ---------- 📒 스티커첩 (도련 10-25) : 바인더 = 종이째 포켓에 · 이형지 = 낱개로 떼어 모으기
           album = { bd : [{ id, k : 종류, lb : 라벨, pid : 바인더 디자인 상품 id, n : 시트 수, p : { 포켓 번호 : 종이 id } }],
                     rl : [{ id, k, lb, pid : 이형지북 디자인 상품 id, n : 쪽 수, it : [{ s : 종이 id(한 칸짜리), pg : 쪽, x, y : 0~1 자리, r : 기울기 }] }] (🤍 이형지북), g : { 종류 : 1 (처음 선물 받음) } }
           · 바인더 1권 = 상품 시트 수(장수) · 한 쪽 포켓 · 이형지북 1권 = 상품 쪽수 (한 쪽에 이형지북 상품 '포켓' 개) · 기본상품 샵 기본스티커처럼 몇 권이든 공짜로 더 받아요 (도련 10-25)
           · 정리한 종이는 바구니에서 빠져 보여요 · 다 쓴 종이는 저절로 빠져요 · 목록과 같은 파일(암호화)이라 다른 기기에서도 그대로 ---------- */
        const ownRelCap = r => window.abRelCap ? abRelCap(r) : 0;               // 이형지 한 쪽에 붙는 수 = 🧁 이형지북 상품 '포켓' (js/basket.js · 도련 11-02)
        function ownAlbumClean(a, list) {
            const alive = list ? new Set(list.filter(ownAlive).map(e => e.id)) : null;   // list 없으면 다 쓴 종이 거르기는 안 해요 (화면에서 걸러요)
            const ok = id => !alive || alive.has(id);
            const o = { bd: [], rl: [], g: {} };
            if (a && typeof a === 'object') {
                if (a.g && typeof a.g === 'object') Object.keys(a.g).forEach(k => { if (a.g[k]) o.g[k] = 1; });
                (Array.isArray(a.bd) ? a.bd : []).forEach(b => {
                    if (!b || !b.id) return;
                    const p = {}; Object.keys(b.p || {}).forEach(i => { if (ok(b.p[i])) p[i] = b.p[i]; });
                    o.bd.push({ id: String(b.id), k: String(b.k || 'seal'), lb: String(b.lb || '').slice(0, 12), pid: String(b.pid || '').slice(0, 60), n: Math.max(1, Math.min(400, +b.n || 1)), p });   // pid = 바인더 상품 id (색 = 서버 상품)
                });
                (Array.isArray(a.rl) ? a.rl : []).forEach(r => {
                    if (!r || !r.id) return;
                    const n = Math.max(1, Math.min(200, +r.n || 1));   // 📒 🤍 크기 = 받을 때 상품 값 (📒 바인더 = 장수 · 🤍 이형지북 = 쪽수)
                    o.rl.push({ id: String(r.id), k: String(r.k || 'seal'), lb: String(r.lb || '').slice(0, 12), pid: String(r.pid || '').slice(0, 60), n, it: (Array.isArray(r.it) ? r.it : []).filter(t => t && ok(t.s)).map(t => ({ s: t.s, pg: Math.max(0, Math.min(n - 1, Math.floor(+t.pg || 0))), x: Math.max(0, Math.min(1, +t.x || 0)), y: Math.max(0, Math.min(1, +t.y || 0)), r: +t.r || 0, ...(+t.w > 0 && +t.h > 0 ? { w: Math.round(+t.w), h: Math.round(+t.h) } : {}) })) });   // w · h = 스티커 진짜 크기 (다이어리에 붙였을 때 · 도련 10-29)
                });
            }
            return o;
        }
        /* ⚡ 마지막으로 읽은 목록 · 스티커첩 (드라이브를 기다리지 않고 바로 그려요 · 그 뒤 새로 읽어 바뀐 게 있으면 다시 그려요 · 도련 10-25)
           ks = 볼 종류 (없으면 모든 종류) · 그 종류를 아직 안 읽었으면 null */
        function ownPeek(ks) {
            if (!ownMode() || O.kw !== ownWho()) return null;
            ks = ownKs(ks);
            if (!ks.every(k => O.kd[k] && O.kd[k].live && O.kd[k].alb)) return null;
            return { list: ownPick(ks), album: ownAlbPick(ks) };
        }
        /* 📒 스티커첩은 종류마다 작은 파일 하나 (그 종류 폴더 / _스티커첩.json · 암호화) : 바인더에 꽂을 때 목록 파일을 건드리지 않아서 빨라요 (도련 10-25) */
        async function ownAlbRead(k, pre) {                                      // pre : 이미 찾은 스티커첩 파일 (ownOpenKind · null = 없음)
            if (ownMode() === 'mem') return O.mem.alb[k] ? JSON.parse(JSON.stringify(O.mem.alb[k])) : null;
            const d = ownK(k);
            const find = async () => { const dir = await ownKindDir(k, false); return dir ? findFile(dir, OWN_ALB) : null; };
            let f = pre;
            if (f === undefined) {
                const m = d.albF ? d.albF.id : (ownFilesGet(k) || {}).a;
                if (m && (d.albF || await ownLive(m))) f = { id: m };            // ⚡ 아는 번호면 바로
                else {
                    if (m) { if (window.diag) diag('stale', { k, f: '스티커첩', id: m }); }   // 🗑 휴지통 안 내용은 읽지 않아요 (도련 11-11)
                    f = await find();
                }
            }
            d.albF = f;
            if (!f) return ownAlbRescue(k, 'missing');
            let t; try { t = await readFileText(f.id); } catch (e) {
                if (!(e && e.code === 'gone')) throw e;
                f = d.albF = await find(); if (!f) return ownAlbRescue(k, 'missing');
                t = await readFileText(f.id);
            }
            if (!t.trim()) return ownAlbRescue(k, 'missing');
            let o; try { o = await ownUnlock(t); } catch (e) { const r = await ownAlbRescue(k, 'corrupt'); if (r) return r; throw e; }
            d.albTxt = t;
            return o && o.album && typeof o.album === 'object' ? ownAlbPart(o.album, k) : null;
        }
        /* 🛟 스티커첩 되살리기 : 그 종류 파일이 없어졌거나 깨졌을 때 백업이 있으면 (바인더를 한 번도 안 만든 종류는 백업도 없어서 null) */
        async function ownAlbRescue(k, why) {
            const nk = O.kw + '|alb|' + k;
            if (why === 'missing' && O.noR.has(nk)) return null;
            const dir = await ownKindDir(k, false), bk = dir ? await findFile(dir, OWN_ALB_BK) : null, d0 = ownK(k), tA = d0.tAlb; d0.tAlb = null;
            if (!bk && !tA) { if (why === 'missing') O.noR.add(nk); return null; }
            let a = null;
            if (bk) { try { const o = await ownUnlock(await readFileText(bk.id)); a = o && o.album && typeof o.album === 'object' ? ownAlbPart(o.album, k) : null; }
                catch (e) { if (!(e && e.code === 'corrupt')) throw e; } }
            if (!a && tA) a = ownAlbPart(tA, k);                                 // 🗑 휴지통에 들어간 스티커첩 (도련 11-06)
            if (window.diag) diag('rescue', { k, f: '스티커첩', why, bk: bk ? 1 : 0, ok: a ? 1 : 0 });
            if (!a) return null;
            await ownAlbWrite(k, ownAlbumClean(a, null));
            O.noR.delete(nk); ownRescueSay();
            return a;
        }
        async function ownAlbWrite(k, a) {
            a = ownAlbPart(a, k);                                                 // 그 종류 것만 (다른 종류 바인더가 섞이지 않게)
            if (ownMode() === 'mem') { O.mem.alb[k] = JSON.parse(JSON.stringify(a)); return; }
            const d = ownK(k), body = await ownLock({ v: 1, k, album: a });
            let saved;
            try { saved = await driveUpsert(await ownKindDir(k, true), OWN_ALB, d.albF && d.albF.id, body); }
            catch (e) { if (!(e && e.code === 'gone')) throw e; d.albF = null; saved = await driveUpsert(await ownKindDir(k, true), OWN_ALB, null, body); }
            d.albF = { id: saved.id, modifiedTime: saved.modifiedTime }; ownFilesNow(k);
        }
        /* 스티커첩 (ks = 종류 · 없으면 모든 종류 · 📒 🤍 책상에 놓는 스티커첩은 모든 종류) */
        async function ownAlbumGet(force, ks) {
            ownReady(); ks = ownKs(ks);
            if (!force && ks.every(k => O.kd[k] && O.kd[k].alb)) return ownAlbPick(ks);
            return ownSerial(async () => {
                await ownKindDirs(ks.filter(k => force || !(O.kd[k] && O.kd[k].alb)));
                await Promise.all(ks.map(async k => { if (force || !(O.kd[k] && O.kd[k].alb)) ownK(k).alb = ownAlbumClean(await ownAlbRead(k), null); }));
                ownMerge();
                return ownAlbPick(ks);
            });
        }
        /* 스티커첩 고치기 : fn(album) 이 album 을 고쳐요 (차례대로 · 드라이브의 지금 모습 위에 · 바뀐 종류의 스티커첩 파일만)
           ks = 고칠 종류 (없으면 이 기기에서 연 종류들) · fn 이 다른 종류 바인더를 더하면 그 종류 파일도 읽어서 합쳐 써요 */
        async function ownAlbum(fn, ks) {
            ownReady();
            if (ks == null) { const open = OWN_KS.filter(k => O.kd[k] && O.kd[k].alb); ks = open.length ? open : OWN_KS; }
            ks = ownKs(ks);
            return ownSerial(async () => {
                const parts = await Promise.all(ks.map(async k => ownAlbumClean(await ownAlbRead(k), null)));
                const a = ownAlbJoin(parts), before = new Map(ks.map((k, i) => [k, JSON.stringify(ownAlbPart(parts[i], k))]));
                const r = await fn(a, O.idx || []);
                const c = ownAlbumClean(a, null);
                const touched = [...new Set(ks.concat(c.bd.map(b => b.k), c.rl.map(x => x.k), Object.keys(c.g)))].filter(k => OWN_KIND[k]);
                for (const k of touched) {
                    let part = ownAlbPart(c, k);
                    if (!before.has(k)) {                                         // 안 읽은 종류 = 그 종류 스티커첩에 더해요 (덮어써서 잃지 않게)
                        const cur = ownAlbumClean(await ownAlbRead(k), null), ids = new Set(cur.bd.map(b => b.id).concat(cur.rl.map(x => x.id)));
                        part = { bd: cur.bd.concat(part.bd.filter(b => !ids.has(b.id))), rl: cur.rl.concat(part.rl.filter(x => !ids.has(x.id))), g: Object.assign({}, cur.g, part.g) };
                    } else if (JSON.stringify(part) === before.get(k)) { ownK(k).alb = part; continue; }   // 그대로면 쓰지 않아요
                    await ownAlbWrite(k, part);
                    ownK(k).alb = part;
                }
                ownMerge();
                ownTell();
                return r;
            });
        }
        /* 🤍 이형지로 옮기기 : 종이의 한 칸을 떼어 → 한 칸짜리 새 종이 (이형지 위 그 자리) · 옮기는 건 쓴 게 아니에요 (다이어리에 붙일 때 사라져요) */
        async function ownRelMove(srcId, slot, relId, pos) {
            ownReady();
            return ownSerial(async () => {
                const k = await ownFindKind(srcId); if (!k) return '';
                const [list, alb0] = await Promise.all([ownIdxRead(k), ownAlbRead(k)]), a = ownAlbumClean(alb0, list);   // 동시에 읽어요 (그 종류만)
                const rel = a.rl.find(r => r.id === relId);
                if (!rel) { const er = new Error('gone'); er.code = 'gone'; throw er; }
                const pg = Math.max(0, Math.min(rel.n - 1, Math.floor(+pos.pg || 0)));
                if (rel.it.filter(t => t.pg === pg).length >= ownRelCap(rel)) { const er = new Error('relfull'); er.code = 'relfull'; throw er; }
                const e = list.find(x => x.id === srcId);
                if (!e || !ownAlive(e) || e.q0 || ownPendGet().some(p => p.s === srcId && p.k === slot)) return '';
                let s; try { s = await ownFileRead(e.f); } catch (er) { if (er && er.code === 'gone') return ''; throw er; }
                const img = s.imgs[slot]; if (img == null) return '';
                const nid = ownRid();
                const one = { v: 1, id: nid, k: e.k, from: e.from || s.from || 'basic', rel: 1, nm: s.nm || '', ts: s.ts ? 1 : 0, baked: !!s.baked, imgs: [img], wh: [(s.wh || [])[slot] || [0, 0]], x: {} };
                if (e.b) one.b = e.b;
                const ne = { id: nid, f: '', k: e.k, n: 1, u: [], at: Date.now(), from: one.from, rel: 1, nm: one.nm, th: await ownThumb([img], 96) };
                if (e.b) ne.b = e.b; if (s.ts) ne.ts = 1;
                ne.f = await ownFileNew(one);
                s.imgs[slot] = null;
                e.u = s.imgs.map((v, i) => v == null ? i : -1).filter(i => i >= 0);
                const end = e.u.length >= e.n, old = e.f;
                try {
                    if (end) list.splice(list.indexOf(e), 1);
                    else { if (e.th && !e.us) e.th = await ownThumb(s.imgs); e.f = await ownFileNew(s); }
                    list.push(ne);
                    rel.it.push({ s: nid, pg, x: Math.max(0, Math.min(1, +pos.x || 0)), y: Math.max(0, Math.min(1, +pos.y || 0)), r: +pos.r || 0 });
                    await ownIdxWrite(k, list);
                } catch (er) { ownFileKill(ne.f).catch(() => {}); if (e.f !== old) ownFileKill(e.f).catch(() => {}); throw er; }
                await ownFileKill(old).catch(er => console.warn('옛 종이 파일을 지우지 못했어요 :', er));
                ownSetKind(k, list);
                const c = ownAlbumClean(a, list);
                try { await ownAlbWrite(k, c); ownK(k).alb = ownAlbPart(c, k); ownMerge(); } catch (er) { ownK(k).alb = null; ownMerge(); ownTell(); throw er; }   // 스티커첩 저장이 안 되면 새 종이는 바구니에 남아요 (잃어버리지 않아요)
                ownTell();
                return nid;
            });
        }
        /* 🤍 이형지북으로 여러 장 한 번에 (도련 10-25 · 붙일 때마다 저장하지 않고 모아서) : ops = [{ s : 종이, k : 칸, rl : 이형지북, pos : { x, y, r, pg } }]
           → 종류마다 목록 · 스티커첩은 한 번씩만 쓰고 · 같은 종이는 한 번만 바꿔 써요 · 결과 = 칸마다 새 종이 id ('' = 이미 썼거나 자리가 없어요) */
        async function ownRelBatch(ops) {
            ownReady();
            return ownSerial(async () => {
                const ks = [];
                for (const op of ops) { const k = await ownFindKind(op.s); if (k && !ks.includes(k)) ks.push(k); }
                const out = ops.map(() => '');
                if (!ks.length) return out;
                const got = await Promise.all(ks.map(k => Promise.all([ownIdxRead(k), ownAlbRead(k)])));   // 동시에 읽어요
                const lists = new Map(ks.map((k, i) => [k, got[i][0]]));
                const a = ownAlbumClean(ownAlbJoin(got.map(g => g[1])), [].concat(...got.map(g => g[0]))), pend = ownPendGet();
                const made = [], bySrc = new Map(), changedK = new Set();
                ops.forEach((op, i) => { if (!bySrc.has(op.s)) bySrc.set(op.s, []); bySrc.get(op.s).push(i); });
                const changed = [], jobs = [];
                try {
                    for (const [src, idxs] of bySrc) {
                        let k = '', e = null;
                        for (const [kk, L] of lists) { const hit = L.find(x => x.id === src); if (hit) { k = kk; e = hit; break; } }
                        if (!e || !ownAlive(e) || e.q0) continue;
                        const list = lists.get(k);
                        let sh; try { sh = await ownFileRead(e.f); } catch (er) { if (er && er.code === 'gone') continue; throw er; }
                        let any = false;
                        for (const i of idxs) {
                            const op = ops[i], rel = a.rl.find(r => r.id === op.rl); if (!rel) continue;
                            const pg = Math.max(0, Math.min(rel.n - 1, Math.floor(+op.pos.pg || 0)));
                            if (rel.it.filter(t => t.pg === pg).length >= ownRelCap(rel)) continue;
                            const img = sh.imgs[op.k]; if (img == null || pend.some(p => p.s === src && p.k === op.k)) continue;
                            const nid = ownRid();
                            const one = { v: 1, id: nid, k: e.k, from: e.from || sh.from || 'basic', rel: 1, nm: sh.nm || '', ts: sh.ts ? 1 : 0, baked: !!sh.baked, imgs: [img], wh: [(sh.wh || [])[op.k] || [0, 0]], x: {} };
                            if (e.b) one.b = e.b;
                            const ne = { id: nid, f: '', k: e.k, n: 1, u: [], at: Date.now(), from: one.from, rel: 1, nm: one.nm, th: await ownThumb([img], 96) };
                            if (e.b) ne.b = e.b; if (sh.ts) ne.ts = 1;
                            jobs.push(ownFileNew(one).then(f => { ne.f = f; made.push(f); }));   // ⚡ 새 종이 파일은 한꺼번에 올려요
                            sh.imgs[op.k] = null; any = true;
                            list.push(ne);
                            rel.it.push(Object.assign({ s: nid, pg, x: Math.max(0, Math.min(1, +op.pos.x || 0)), y: Math.max(0, Math.min(1, +op.pos.y || 0)), r: +op.pos.r || 0 }, +op.pos.w > 0 && +op.pos.h > 0 ? { w: Math.round(+op.pos.w), h: Math.round(+op.pos.h) } : {}));
                            out[i] = nid;
                        }
                        if (!any) continue;
                        changedK.add(k);
                        e.u = sh.imgs.map((v, j) => v == null ? j : -1).filter(j => j >= 0);
                        const old = e.f;
                        if (e.u.length >= e.n) list.splice(list.indexOf(e), 1);
                        else { if (e.th && !e.us) e.th = await ownThumb(sh.imgs); jobs.push(ownFileNew(sh).then(f => { e.f = f; made.push(f); })); }
                        changed.push(old);
                    }
                    await Promise.all(jobs);
                    if (!made.length) return out;
                    for (const k of changedK) await ownIdxWrite(k, lists.get(k));
                } catch (er) { made.forEach(fid => ownFileKill(fid).catch(() => {})); throw er; }
                changedK.forEach(k => ownSetKind(k, lists.get(k)));
                const c = ownAlbumClean(a, [].concat(...[...lists.values()]));
                try { for (const k of changedK) { await ownAlbWrite(k, c); ownK(k).alb = ownAlbPart(c, k); } ownMerge(); }
                catch (er) { changedK.forEach(k => { ownK(k).alb = null; }); ownMerge(); ownTell(); throw er; }   // 스티커첩 저장이 안 되면 새 종이는 바구니에 남아요
                changed.forEach(old => ownFileKill(old).catch(er => console.warn('옛 종이 파일을 지우지 못했어요 :', er)));   // ⚡ 옛 파일 지우기는 기다리지 않아요 (목록에 없어서 안 보여요)
                ownTell();
                return out;
            });
        }
        /* 종이의 그림들 (정리 책상에서 낱개로 보여 주기 · 쓰는 중인 칸은 비어요) */
        async function ownSheetImgs(id) { const r = await ownSheet(id); return r ? { imgs: r.s.imgs.slice(), baked: !!r.s.baked, L: r.s.L || null, sb: (r.s.x && r.s.x.sb) || '' } : null; }   // 🗂️ sb = 내가 꾸민 시트 바탕 (js/sheetmaker.js)

        /* 실패 이유 → 알림 글 */
        function ownErrText(e) {
            const c = e && e.code;
            if (c === 'ready') return '구글 계정으로 로그인하거나 🏠 로그인 없이 다꾸할 때 쓸 수 있어요.';
            if (c === 'crypto') return '이 브라우저에서는 스티커를 열 수 없어요.';
            if (c === 'corrupt') return '스티커 목록을 읽을 수 없어요.<br><span style="font-size:12px;color:#777;">다른 계정의 말랑달콤 폴더이거나 파일이 깨졌어요.</span>';
            if (c === 'full') return '☁ 구글 드라이브 저장공간이 가득 찼어요.';
            if (c === 'auth') return '다시 로그인해 주세요.';
            if (c === 'relfull') return '이 쪽은 가득 찼어요. 다른 쪽에 붙여 주세요.';
            if (c === 'gone') return '스티커첩이 바뀌었어요. 다시 열어 주세요.';
            return '인터넷 연결을 확인한 뒤 다시 해 주세요.';
        }

        /* ---------- 🗑 버리기 (도련 11-02 · 현실처럼 모든 상품) : 목록에 bin 표시만 → 30일 휴지통 (js/bin.js) → 되살리기 = 표시 빼기 · 영구 삭제 = 목록에서 빼고 종이 파일 완전 삭제 ---------- */
        /* kk = 종류 (휴지통 기록에 있어요) · 모르면 바구니에 읽어 둔 목록에서 찾아요 (버린 종이는 바구니에 안 보여서 모든 종류를 읽어요) */
        async function ownKindsFor(ids, kk) {
            if (kk && OWN_KIND[kk]) return [kk];
            const ks = [...new Set(ids.map(ownKindOf).filter(Boolean))];
            if (ks.length && ids.every(id => ownKindOf(id))) return ks;
            await ownKindDirs(OWN_KS);
            return OWN_KS;
        }
        function ownPurge(id, f, kk) {
            ownReady();
            return ownSerial(async () => {
                let fid = f;
                for (const k of await ownKindsFor([id], kk)) {
                    const list = await ownIdxRead(k), i = list.findIndex(e => e.id === id);
                    if (i < 0) continue;
                    fid = list[i].f;                                                // 버린 뒤 칸을 쓰면 파일 번호가 바뀌어요 → 목록의 지금 번호
                    const d = ownK(k); d.gone = ownGoneClean((d.gone || []).concat([{ u: id, at: Date.now() }]));   // 🚛 영구삭제 칸 (영원히 · 도련 11-11)
                    if (window.ledgerMix) ledgerMix('own:' + k, d.gone);           // 📒 장부에도 바로
                    list.splice(i, 1); await ownIdxWrite(k, list); ownSetKind(k, list);
                    ownBackupNow(k);                                   // 🛟 백업에도 바로 (예전 백업으로 되살아나지 않게)
                    break;
                }
                await ownFileKill(fid);
                ownTell();
            });
        }
        /* 🚛 버리기 (여러 장 한 번에 · 묻기 · 알리기까지) : 🧺 바구니 · ✂️ 스티커 만들기 · 도련 11-11 상품 = 바로 영구 삭제 (종이 파일 + 영구삭제 칸) */
        async function ownDiscard(ids, name) {
            if (!ids.length || !window.binAsk || !await binAsk(name)) return false;
            let bad = 0;
            for (const id of ids) { try { await ownPurge(id); } catch (e) { console.warn('🚛', e); bad++; } }
            if (bad === ids.length) { showMsg('⚠ 버리지 못했어요. 잠시 후 다시 해 주세요.'); return false; }
            binTold(bad ? `⚠ ${bad}개는 버리지 못했어요. 잠시 후 다시 해 주세요.` : '');
            return true;
        }
        if (window.BIN_KINDS) BIN_KINDS.own = { purge: e => ownPurge(e.id, e.f, e.kk) };   // 예전 휴지통 목록 옮기기 (js/bin.js binMigrate)
        window.ownDiscard = ownDiscard;
        window.ownTapeFix = ownTapeFix; window.ownList = ownList; window.ownAdd = ownAdd; window.ownSheet = ownSheet; window.ownUse = ownUse; window.ownLeft = ownLeft;
        window.ownQty = ownQty; window.ownPaper = ownPaper; window.ownQtyLeft = ownQtyLeft; window.ownTake = ownTake; window.ownTakeMany = ownTakeMany; window.ownThumb = ownThumb; window.OWN_KIND = OWN_KIND;
        window.ownOnChange = ownOnChange; window.ownPendGet = ownPendGet; window.ownTakeKit = ownTakeKit; window.ownKitDesc = ownKitDesc; window.ownTakeMine = ownTakeMine; window.ownErrText = ownErrText; window.ownMode = ownMode;
        window.ownAlbum = ownAlbum; window.ownAlbumGet = ownAlbumGet; window.ownPeek = ownPeek; window.ownSeen = () => (O.idx || []).slice(); window.ownSpent = id => O.spent.has(id); window.ownPendOn = e => e ? ownPendFix(e) : e;   // 읽어 둔 모든 종류 window.ownOpen = ownOpen; window.ownRelMove = ownRelMove; window.ownRelBatch = ownRelBatch; window.ownSheetImgs = ownSheetImgs;
