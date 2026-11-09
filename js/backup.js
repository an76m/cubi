/* 말랑달콤 다이어리 - js/backup.js
   📦 백업 · 📥 불러오기 : 구글 로그인이든 🏠 로그인 없이(이 브라우저)든 똑같이 zip 하나 (도련 · 2026-10-13)
   - 백업 = 말랑달콤 폴더를 json 파일 그대로 zip 에 묶어요 (압축 없이 담기) → 풀면 드라이브와 같은 모양의 말랑달콤 폴더 → 다운로드 폴더에 저장
     (일기 · 설정 · 카페 · 내가 만든 스티커 · 페이지 · 인형 · 인형극 · 검색 목록 · 다른 사람이 공유해 준 스티커)
   - 불러오기 = zip 안의 말랑달콤 폴더를 지금 쓰는 곳(구글 드라이브 / 이 브라우저)의 같은 자리에 얹어요 (지우지 않아요)
     · 같은 날짜 · 같은 파일은 백업 것으로 덮어써요 (덮기 전 것은 🗑 휴지통) · 설정 · 카페 · 검색 목록은 합쳐요 · 나머지는 그대로
     · 구글 드라이브에서 '말랑달콤' 폴더를 내려받은 zip 도 돼요
   - 로그인 없이 → 구글 로그인으로 옮길 때도 이 기능으로 폴더를 통째로 옮겨요 (js/devsave.js dvCarry)
   - 🚫 되살아나면 안 되는 것은 백업 · 불러오기 · 옮기기에서 빼요 (도련 11-09 확인)
     · 🎒 쓰면 줄어드는 것 = 스티커 종이 (스티커목록 전부 · 씰 · 조각 … 종류 폴더의 내 종이 · 빈스티커첩) · 종류 폴더 안 공유하기 파일(내- · 받은-)만 넣어요
     · 🔐 받았다는 증거 (계정 열쇠) = 가진 상품 목록 _목록 · 받은- 상품 파일 · 책상배치 폴더 · 휴지통
   - 🚚 무료 상품 · 책상 자리는 따라가요 (도련 11-09) = zip 안 말랑달콤 / _옮기기.json (잠그지 않은 글 · BK_MV)
     · 백업 때 : 가진 상품 목록에서 무료(basic) · 본인(mine) 줄만 + 책상 위 자리 · 문구의 집 · 다이어리 자리 · 고른 벽지 · 책상판
     · 불러올 때 : 무료 줄은 지금 샵에 있는 무료 상품일 때만 받아요 (zip 을 고쳐 선물 · 유료 상품을 넣어도 안 받아져요)
       이미 가진 것(첫 선물처럼 같은 번호)은 건너뛰고 · 자리는 옛 자리로 · 다 넣으면 새로고침
     · 선물(gift) · 공유(share) · 유료(paid)는 절대 안 옮겨요 · 🎒 스티커도 안 옮겨요 (샵에서 다시 받아요)
   - 드라이브와 말하는 함수(getFolder · driveList · readFileText · driveUpsert)만 써요 → 구글이든 이 브라우저든 같은 코드 (js/drive.js · js/devsave.js vfsFetch)
   ※ 예전 json 백업(📂 PC로 백업)은 없앴어요 : 1년치를 글자 하나에 담다가 폰이 멈추거나 한 글자만 깨져도 전부 못 읽어서 */

        const BK_TOP = '말랑달콤';   // drive.js 보다 먼저 불러와서 글자로 (TOP_FOLDER_NAME 과 같아요)
        const BK_DAY_RE = /\/다이어리\/\d{4} [^/]+\/\d{4}-\d{2}-\d{2}\.json$/;   // 📔 다이어리 / 날짜형 권 폴더의 하루 파일 = 일기 몇 일치 (📕 표지.json 은 세지 않아요)
        /* 백업에서 빼는 것 (path = 말랑달콤/폴더/파일) : 휴지통 · 스티커목록 · 스티커 종류 폴더의 내 종이 (공유하기 내-/받은- 파일만 넣어요) */
        function bkSkip(path) {
            const parts = path.split('/'), dir = parts[1] || '', file = parts[parts.length - 1] || '';
            if (dir === DIRS.trash || dir === DIRS.stkList) return true;
            if (dir === DIRS.settings && file !== '설정.json') return true;
            if (dir === DIRS.emptyBook) return true;   // 📥 빈스티커첩 = 목록 · 받은- 모두 🔐 (도련 11-08 · 🧩 바인더 재료는 다이어리 / _바인더재료목록 = 아래 다이어리 줄)   // 📥 받은 스티커바인더 · 이형지북 목록도 🔐 (도련 11-08)   // 🧩 바인더 재료 목록도 🔐 (981)
            if (dir === DIRS.diary && parts.length === 3 && /^_/.test(file)) return true;   // 📔 다이어리 / _목록 · _목록_백업 = 🔐 계정 열쇠 (예전 설정의 _다이어리목록처럼 빼요 · 도련 11-07)   // ⚙ 설정 폴더 = 설정.json 만 (🔐 책상 · 가진 것 목록 · 선물 · 백업은 스티커처럼 계정 열쇠라 빼요 · 도련 11-06)
            if (dir === DIRS.desk || dir === DIRS.gd || Object.values(DESK_DIRS).includes(dir) || (window.dkDirs && dkDirs().includes(dir)) || Object.values(GD_DIRS).includes(dir) || Object.values(SKIN_DIRS).includes(dir)) return true;   // 🪑 ✏️ 책상 소품 · 문구 · 배치 · 기본세트도 스티커처럼 백업에서 빼요 (불러오기로 버린 것이 되살아나지 않게 · 도련 10-27)
            if (typeof OWN_KIND !== 'undefined' && Object.values(OWN_KIND).includes(dir)) return !/^(내|받은)-/.test(file);
            if (dir === DIRS.pattern && /^받은-/.test(file)) return true;      // 🌈 샵에서 받은 배경지 파일 = 🔐 계정 열쇠 (책상 소품처럼 빼요 · 내가 만든 배경지 내- 는 넣어요 · 도련 11-05)
            return false;
        }

        /* ---------- zip 만들기 · 읽기 (압축 없이 담기 · 읽기는 압축 0 · 8 둘 다) ---------- */
        const BK_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
        function bkCrc(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = BK_CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
        function bkZip(files) {                                            // files : [[경로, Uint8Array]]
            const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
            const d = new Date(), dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
            for (const [name, data] of files) {
                const nb = enc.encode(name), crc = bkCrc(data), h = new DataView(new ArrayBuffer(30));
                h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
                h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
                h.setUint16(26, nb.length, true);
                parts.push(new Uint8Array(h.buffer), nb, data);
                const c = new DataView(new ArrayBuffer(46));
                c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
                c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
                c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
                cen.push(new Uint8Array(c.buffer), nb);
                off += 30 + nb.length + data.length;
            }
            const cs = cen.reduce((s, a) => s + a.length, 0), e = new DataView(new ArrayBuffer(22));
            e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
            return new Blob(parts.concat(cen, [new Uint8Array(e.buffer)]), { type: 'application/zip' });
        }
        /* zip 안의 말랑달콤 폴더 파일들 : [{ path: '말랑달콤/…', text() }] (내용은 넣을 때 하나씩 꺼내요) */
        async function bkUnzip(file) {
            const buf = await file.arrayBuffer(), v = new DataView(buf), u8 = new Uint8Array(buf);
            let e = -1; for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { e = i; break; }
            if (e < 0) throw new Error('zip');
            const n = v.getUint16(e + 10, true), utf = new TextDecoder('utf-8'), out = [];
            let p = v.getUint32(e + 16, true);
            for (let i = 0; i < n; i++) {
                if (v.getUint32(p, true) !== 0x02014b50) throw new Error('zip');
                const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true);
                const name = utf.decode(u8.subarray(p + 46, p + 46 + nl)).replace(/\\/g, '/');
                p += 46 + nl + xl + cl;
                const at = name.indexOf(BK_TOP + '/');
                if (name.endsWith('/') || at < 0) continue;
                const path = name.slice(at).split('/').filter(s => s && s !== '.' && s !== '..').join('/');
                if (path.length <= BK_TOP.length || !/\.json$/i.test(path) || bkSkip(path)) continue;   // 🗑 휴지통 · 🎒 유한 스티커는 넣지 않아요
                out.push({ path, text: async () => {
                    const ds = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true), raw = u8.subarray(ds, ds + csize);
                    if (method === 0) return utf.decode(raw);
                    if (method === 8 && typeof DecompressionStream === 'function') return utf.decode(new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()));
                    throw new Error('zip-method');
                } });
            }
            return out;
        }


        /* ---------- 🚚 무료 상품 · 책상 자리 옮기기 (도련 11-09) : 말랑달콤 / _옮기기.json ----------
           [설정 키, 그 키가 사는 파일(KEY_FILES), 같은 것 찾는 칸, 상품 번호, 종류] · 첫 선물은 계정이 달라도 번호(u · id)가 같아서 두 개가 되지 않아요 */
        const BK_MOVE = '_옮기기.json';
        const BK_MV = [
            ['diary_desk_own', 'dkown', 'u', o => o.id, 'desk'],      // 🪑 소품
            ['diary_skin_own', 'dkown', 'u', o => o.id, 'skin'],      // 🧱 벽지 · 🪵 책상판
            ['diary_gd_own', 'gdown', 'u', o => o.id, 'gd'],          // ✏️ 문구 · 필기구
            ['diary_bg_own', 'bgown', 'u', o => o.p, 'bg'],           // 🌈 배경지
            ['diary_own', 'dyown', 'id', o => o, 'dy'],               // 📔 다이어리 (권 하나에 한 줄)
            ['diary_cover_own', 'bmown', 'id', o => o, 'mat'],        // 🧩 바인더 표지 재료
            ['diary_refill_own', 'bmown', 'id', o => o, 'mat'],       // 🧩 바인더 내지 재료
            ['diary_sbd_own', 'esown', 'id', o => o.pid, 'bd'],       // 📒 빈 스티커바인더
            ['diary_rlb_own', 'esown', 'id', o => o.pid, 'rl']        // 🤍 빈 이형지북
        ];
        const BK_MV_AT = ['diary_desk_pos', 'diary_gd_at', 'diary_desk_dy', 'diary_desk_skin', 'diary_book_n'];   // 📍 자리 (배치.json · 책상설정.json) · 📔 권 번호
        const BK_MV_DROP = ['c', 'f'];                                   // c = 받은- 파일 번호 · f = 권 폴더 만듦 (그 계정 것이라 새 곳에서 다시 만들어요)
        const bkMvOk = o => o && typeof o === 'object' && ['basic', 'mine'].includes(o.from || 'basic');   // 🎁 선물 · 🤝 공유 · 💎 유료는 빼요
        const bkMvGet = k => { try { const v = prefGet(k, ''); return v == null ? null : v; } catch (e) { return null; } };
        async function bkMvLoad() { for (const w of new Set(BK_MV.map(m => m[1]).concat(['desk', 'deskset']))) { try { await keyFileLoad(w); } catch (e) {} } }
        async function bkMoveMake() {
            await bkMvLoad();
            const L = {}, A = {};
            BK_MV.forEach(([k, , , , kind]) => {
                const v = bkMvGet(k); if (!Array.isArray(v)) return;
                L[k] = v.filter(bkMvOk).map(o => { const x = Object.assign({}, o); BK_MV_DROP.forEach(d => delete x[d]); if (kind === 'desk') delete x.p; return x; });   // 🖌 칠한 소품 그림(p)은 받은- 파일에 있어서 안 따라가요
            });
            BK_MV_AT.forEach(k => { const v = bkMvGet(k); if (v != null) A[k] = v; });
            return { v: 1, at: Date.now(), lists: L, spots: A };
        }
        /* 지금 샵에 있는 무료 상품만 (서버 상품공방 그대로) */
        function bkMvShop() {
            const ids = (f, g) => { try { return new Set((window[f] ? window[f]() : []).map(g).filter(Boolean)); } catch (e) { return new Set(); } };
            const dy = ids('dyyShopList', x => x.dc);
            const pc = new Set((typeof DY_TYPES !== 'undefined' ? DY_TYPES : []).filter(p => p.cvOnly && !p.off).map(p => p.id));
            const rf = new Set((typeof DY_REFILLS !== 'undefined' ? DY_REFILLS : []).filter(r => !r.off && prodList(r.K).some(x => x.id === r.id && !x.P.스토어)).map(r => r.id));
            const ab = window.abShopIds ? abShopIds() : { bd: [], rl: [] };
            return {
                desk: ids('deskShopList', x => x.id), skin: ids('dsShopList', x => x.sid), gd: ids('gdShopList', x => x.id), bg: ids('bgoShopList', x => x.pid),
                bd: new Set(ab.bd), rl: new Set(ab.rl),
                dy: o => { const m = /^\d{4}[a-z]*-(.+)-\d+$/.exec(String(o.id || '')); return o.t === 'date' && !!m && dy.has(m[1]); },
                mat: o => o.t === 'dcover' ? dy.has(o.d) : o.t === 'cover' ? pc.has(o.pid) : (o.t === 'refill' || o.t === 'drefill') ? rf.has(o.pid) : false
            };
        }
        /* 불러온 뒤 : 지금 목록에 없는 것만 더하고 · 자리는 옛 자리로 → 돌려줌 = 더한 상품 수 */
        async function bkMoveTake(text) {
            let M; try { M = JSON.parse(text); } catch (e) { return 0; }
            if (!M || typeof M !== 'object' || !M.lists || typeof M.lists !== 'object') return 0;
            await bkMvLoad();
            const shop = bkMvShop(), fin = {}; let added = 0;
            for (const [k, , uk, idOf, kind] of BK_MV) {
                const cur = Array.isArray(bkMvGet(k)) ? bkMvGet(k) : [], have = new Set(cur.map(o => o && o[uk]).filter(Boolean));
                const inc = Array.isArray(M.lists[k]) ? M.lists[k] : [];
                const add = inc.filter(o => {
                    if (!bkMvOk(o) || typeof o[uk] !== 'string' || have.has(o[uk])) return false;
                    if ((o.from || 'basic') === 'mine') return true;                                   // ✂️ 내가 만들거나 조립한 것
                    const t = shop[kind], id = idOf(o);
                    return typeof t === 'function' ? t(id) : t.has(id);                             // 🛍️ 샵의 무료 상품일 때만
                }).map(o => { const x = Object.assign({}, o); BK_MV_DROP.forEach(d => delete x[d]); if (kind === 'desk') delete x.p; have.add(x[uk]); return x; });
                if (add.length) { prefSet(k, '', cur.concat(add)); added += add.length; }
                fin[k] = new Set(cur.concat(add).map(o => o && o[uk]).filter(Boolean));
            }
            const S = M.spots && typeof M.spots === 'object' ? M.spots : {}, obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : null, cur = k => obj(bkMvGet(k)) || {};
            const pick = (o, ok) => { const r = {}; Object.keys(o).forEach(k => { if (ok(k)) r[k] = o[k]; }); return r; };
            if (obj(S.diary_desk_pos)) prefSet('diary_desk_pos', '', Object.assign({}, cur('diary_desk_pos'), pick(S.diary_desk_pos, u => fin.diary_desk_own.has(u))));   // 🪑 소품 자리
            if (obj(S.diary_gd_at)) prefSet('diary_gd_at', '', Object.assign({}, cur('diary_gd_at'), S.diary_gd_at));                                                  // ✏️ 문구의 집
            if (obj(S.diary_desk_dy)) {                                                                                                                                  // 📔 다이어리 자리 · 봉투 속
                const c = cur('diary_desk_dy'), n = Object.assign({}, c, pick(S.diary_desk_dy, id => id !== '_bag' && fin.diary_own.has(id)));
                const bag = [...new Set([].concat(c._bag || [], S.diary_desk_dy._bag || []))].filter(id => fin.diary_own.has(id) && !(id in n));
                if (bag.length) n._bag = bag; else delete n._bag;
                prefSet('diary_desk_dy', '', n);
            }
            const sk = obj(S.diary_desk_skin);                                                                                                                           // 🧱 🪵 고른 벽지 · 책상판
            if (sk) {
                const c = Object.assign({}, cur('diary_desk_skin'));
                if (sk.wall && fin.diary_skin_own.has(sk.wall)) { c.wall = sk.wall; if (sk.wi) c.wi = sk.wi; }
                if (sk.top && fin.diary_skin_own.has(sk.top)) { c.top = sk.top; if (sk.ti) c.ti = sk.ti; }
                prefSet('diary_desk_skin', '', c);
            }
            if (obj(S.diary_book_n)) { const c = Object.assign({}, cur('diary_book_n')); Object.keys(S.diary_book_n).forEach(k => { c[k] = Math.max(+c[k] || 0, +S.diary_book_n[k] || 0); }); prefSet('diary_book_n', '', c); }   // 📔 새 권 번호가 겹치지 않게
            return added;
        }
        window.bkDays = paths => paths.filter(p => BK_DAY_RE.test(p)).length;

        /* ---------- 진행 표시 (첫 화면 덮개 재사용) ---------- */
        function bkBusy(msg) { if (msg == null) { hideGate(); return; } showGate('wait', msg); }

        /* ---------- 지금 쓰는 곳(구글 / 이 브라우저)의 말랑달콤 폴더 → [[경로, 글]] + 🚚 _옮기기.json ---------- */
        async function bkReadTree(tell) {
            const top = await getFolder([BK_TOP], false);
            if (!top) return [];
            const files = [];
            const walk = async (id, path) => {
                for (const f of await driveList(`'${id}' in parents and trashed=false`, 'id,name,mimeType')) {
                    if (f.mimeType === FOLDER_MIME && path === BK_TOP && (f.name === DIRS.trash || f.name === DIRS.stkList)) continue;   // 🗑 휴지통 · 🎒 스티커목록은 통째로 빼요
                    if (f.mimeType === FOLDER_MIME) await walk(f.id, path + '/' + f.name);
                    else if (/\.json$/i.test(f.name) && !bkSkip(path + '/' + f.name)) files.push({ id: f.id, path: path + '/' + f.name });   // 🎒 스티커 종류 폴더의 내 종이는 빼요 (불러오기로 쓴 스티커가 되살아나지 않게)
                }
            };
            await walk(top, BK_TOP);
            const out = []; let i = 0, done = 0;
            await Promise.all(Array.from({ length: 4 }, async () => {
                while (i < files.length) {
                    const f = files[i++];
                    out.push([f.path, await readFileText(f.id)]);
                    if (tell) tell(++done, files.length);
                }
            }));
            out.sort((a, b) => a[0] < b[0] ? -1 : 1);
            try { out.push([BK_TOP + '/' + BK_MOVE, JSON.stringify(await bkMoveMake())]); } catch (e) { console.warn('🚚 옮기기 목록', e); }   // 🚚 무료 상품 · 책상 자리 (맨 끝)
            return out;
        }
        /* [{ path, text() }] → 지금 쓰는 곳의 같은 자리에 (있으면 덮어쓰기) */
        /* 하나로 모인 파일은 통째로 덮지 않고 합쳐요 (도련 · 2026-10-13 · 경우의 수 점검)
           - 설정.json · 카페.json : 키마다 (같은 키는 넣는 쪽) → 받는 쪽에만 있던 설정 · 카페 기록이 사라지지 않게
           - 검색-*.json (해마다 · 권마다 검색 목록) : 날짜(장)마다 합치기
           - 모음 목록(내-목록N.json · 받은-목록N.json) : 넣지 않아요 → 원본은 모두 들어가고, 모음을 처음 열 때 원본을 보고 목록을 다시 맞춰요 (js/coll.js collCheck)
             (목록 안에는 그쪽 저장소의 파일 번호가 들어 있어서 다른 곳에 그대로 넣으면 맞지 않아요) */
        const bkKind = p => /\/설정\/설정\.json$|\/카페기록\/카페\.json$/.test(p) ? 'keys' : /\/검색(-[^/]+)?\.json$/.test(p) ? 'search' : /\/(내|받은)-목록\d+\.json$/.test(p) || p === BK_TOP + '/' + BK_MOVE ? 'skip' : '';   // 🚚 _옮기기.json 은 파일로 넣지 않고 bkMoveTake 로
        function bkMerge(kind, curText, body) {
            let a, b; try { a = JSON.parse(curText); b = JSON.parse(body); } catch (e) { return body; }
            if (!a || typeof a !== 'object' || !b || typeof b !== 'object') return body;
            if (kind === 'keys') return JSON.stringify(Object.assign({}, a, b));
            if (kind === 'search') return JSON.stringify(Object.assign({}, a, b, { d: Object.assign({}, a.d || {}, b.d || {}) }));
            return body;
        }
        /* 들어가지 못한 것만 돌려줘요 */
        async function bkPutTree(items, tell) {
            let done = 0; const failed = [];
            for (const it of items) {
                const parts = it.path.split('/'), name = parts.pop(), kind = bkKind(it.path);
                const put = async body => {
                    const dir = await getFolder(parts, true), cur = await findFile(dir, name);
                    if (cur) {
                        const old = await readFileText(cur.id);
                        if (kind) body = bkMerge(kind, old, body);
                        if (old === body) return;                                      // 같으면 그대로
                        await trashKeep(it.path, old);                                 // 🗑 덮어쓰기 전 모습은 휴지통에 (js/trash.js)
                    }
                    await driveUpsert(dir, name, cur && cur.id, body);
                };
                if (kind !== 'skip') try {
                    const body = await it.text();
                    try { await put(body); }
                    catch (e) { if (e && e.code === 'gone') { resetDriveCaches(); await put(body); } else throw e; }   // 그 사이 폴더가 바뀌었으면 다시 찾아서 한 번 더
                } catch (e) { console.warn('넣지 못한 파일:', it.path, e); failed.push(it); }
                if (tell) tell(++done, items.length);
            }
            return failed;
        }
        /* 아직 기다리는 저장(모음 · 검색 목록)까지 먼저 끝내요 */
        async function bkSettle() {
            try { if (isCoverOpen && !turn) saveData(false); } catch (e) {}
            await flushUpload({ force: true });
            try { if (typeof collPump === 'function') await collPump(); } catch (e) {}
            try { if (typeof srUpload === 'function') await srUpload(); } catch (e) {}
        }

        /* ---------- 📦 백업 파일 받기 ---------- */
        async function bkBackup() {
            if (!drive.ready || drive.guest) { showMsg('📦 백업은 구글로 로그인했거나 🏠 로그인 없이 다꾸할 때 받을 수 있어요.<br><span style="font-size:12px;color:#777;">구경만 할 때는 저장된 일기가 없어요.</span>'); return; }
            bkBusy('📦 백업 파일을 만드는 중…');
            try {
                await bkSettle();
                const list = await bkReadTree((n, all) => bkBusy(`📦 백업 파일을 만드는 중… <b>${n} / ${all}</b>`));
                bkBusy(null);
                if (!list.length) { showMsg('아직 저장된 일기가 없어요.'); return; }
                const enc = new TextEncoder(), days = list.filter(f => BK_DAY_RE.test(f[0])).length, nf = list.filter(f => f[0] !== BK_TOP + '/' + BK_MOVE).length;
                const d = new Date(), stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const a = document.createElement('a'); a.href = URL.createObjectURL(bkZip(list.map(([p, t]) => [p, enc.encode(t)]))); a.download = `다이어리_백업_${stamp}.zip`;
                document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
                showMsg(`📦 백업 파일을 만들었어요!<br>일기 <b>${days}일치</b> · 파일 ${nf}개<br><span style="font-size:12px;color:#777;">다운로드 폴더에 저장돼요.<br>새 기기 · 새 브라우저에서 구글로 로그인하거나 로그인 없이 다꾸하기로 연 뒤<br>⚙ 설정 → 📥 백업 불러오기로 이 파일을 골라요.</span>`);
            } catch (e) { console.warn(e); bkBusy(null); showMsg('⚠ 백업 파일을 만들지 못했어요.<br>잠시 후 다시 해 주세요.'); }
        }

        /* ---------- 📥 백업 불러오기 ---------- */
        function bkPickFile(then) {
            let inp = document.getElementById('bkInput');
            if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.id = 'bkInput'; inp.accept = '.zip,application/zip,application/x-zip-compressed'; inp.hidden = true; document.body.appendChild(inp); }
            inp.onchange = () => { const f = inp.files[0]; inp.value = ''; if (f) then(f); };
            inp.click();
        }
        async function bkOpen(file) {                                      // 읽기 + 몇 일치인지
            let items;
            try { items = await bkUnzip(file); } catch (e) { showMsg('⚠ 백업 파일을 읽지 못했어요.<br><span style="font-size:12px;color:#777;">다이어리 백업(.zip) 파일인지 확인해 주세요.</span>'); return null; }
            if (!items.length) { showMsg('⚠ 이 파일 안에 다이어리 백업 내용이 없어요.'); return null; }
            return { items, days: items.filter(f => BK_DAY_RE.test(f.path)).length };
        }
        /* 지금 쓰는 곳에 넣고 다시 읽기 (진행 표시) */
        async function bkApply(b, where) {
            bkBusy(`📥 ${where}에 넣는 중…`);
            try {
                await bkSettle();
                let items = b.items, failed = [];
                for (;;) {
                    failed = await bkPutTree(items, (n, all) => bkBusy(`📥 ${where}에 넣는 중… <b>${n} / ${all}</b>`));
                    if (!failed.length) break;
                    bkBusy(null);
                    if (!(await showMsg(`⚠ <b>${failed.length}개</b>를 넣지 못했어요.<br>인터넷 · 저장공간을 확인하고 다시 시도할까요?`, true))) break;
                    items = failed; bkBusy(`📥 ${where}에 넣는 중…`);
                }
                await loadFromDrive();
                const mv = b.items.find(it => it.path === BK_TOP + '/' + BK_MOVE);   // 🚚 무료 상품 · 책상 자리
                let got = 0;
                if (mv) {
                    bkBusy(`📥 ${where}에 상품 · 책상 자리를 넣는 중…`);
                    try { got = await bkMoveTake(await mv.text()); } catch (e) { console.warn('🚚 옮기기', e); }
                    try { await flushUpload({ force: true }); } catch (e) {}
                }
                bkBusy(null);
                const n = b.items.filter(it => it !== mv).length;
                await showMsg(failed.length ? `⚠ ${n - failed.length}개는 넣었지만 <b>${failed.length}개</b>는 넣지 못했어요.` : `📥 ${where}에 넣었어요! 일기 <b>${b.days}일치</b>${got ? `<br><span style="font-size:12px;color:#777;">🛍️ 무료 상품 ${got}개 · 🪑 책상 자리도 옮겼어요</span>` : ''}`);
                if (mv) { bkBusy('🔄 다시 여는 중…'); location.reload(); }      // 화면 속 소품 · 문구 · 다이어리를 새 목록으로 다시 그려요
                return !failed.length;
            } catch (e) { console.warn(e); bkBusy(null); showMsg('⚠ 다 넣지 못했어요.<br>잠시 후 다시 해 주세요.'); return false; }
        }
        /* ⚙ 설정 → 📥 백업 불러오기 */
        function bkRestore() {
            if (!drive.ready || drive.guest) { showMsg('📥 백업은 구글로 로그인했거나 🏠 로그인 없이 다꾸할 때 불러올 수 있어요.<br><span style="font-size:12px;color:#777;">첫 화면에서 둘 중 하나로 연 뒤 ⚙ 설정 → 📥 백업 불러오기를 눌러 주세요.</span>'); return; }
            bkPickFile(async file => {
                const b = await bkOpen(file); if (!b) return;
                const google = !drive.local, where = google ? '구글 드라이브' : '이 브라우저', nf = b.items.filter(it => it.path !== BK_TOP + '/' + BK_MOVE).length;
                const ok = await showMsg(`📥 백업 파일에 일기 <b>${b.days}일치</b> · 파일 ${nf}개가 있어요.<br><b>${where}</b>에 넣을까요?<br><span style="font-size:12px;color:#777;">같은 날짜 · 같은 파일은 백업 것으로 덮어써요 (덮기 전 것은 🗑 휴지통).<br>지금 있는 것은 지우지 않아요 · 무료 상품 · 책상 자리도 따라가요.</span>`, true);
                if (ok) bkApply(b, where);
            });
        }

        window.bkBackup = bkBackup; window.bkRestore = bkRestore; window.bkPickFile = bkPickFile; window.bkOpen = bkOpen; window.bkApply = bkApply; window.bkReadTree = bkReadTree;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['backup'] = true;
