/* 말랑달콤 다이어리 - js/trash.js
   🗑 방 안 휴지통 : 기록(사용자가 만든 것)을 30일 보관하고 되살려요 (도련 · 2026-10-13 · 11-11 두 갈래)
   - ⚙ 설정 → 💾 데이터 관리 → 🗑 휴지통 : 목록 · 되살리기 · 휴지통 비우기 (구글 · 🏠 로그인 없이 같은 화면)
   - 들어가는 것 = 기록 : 지운 일기 페이지 · 표지 · 인형 · 인형극 · 내 도안 · 덮어쓰기 직전 모습 + 📔 쓴 다이어리 (js/dyyear.js 'diary_dy_bin')
     · 상품(스티커 · 마테 · 소품 · 문구 · 배경지 · 안 쓴 다이어리 …)은 여기 오지 않아요 = 🚛 바로 영구 삭제 (js/bin.js)
   - ⭐ 규칙 (도련 11-11) : 앱에서 지운 건 구글 드라이브 휴지통 · 브라우저 휴지통에 넘기지 않아요 · 30일이 지나면 앱이 영구 삭제
       → 지운 파일 = 말랑달콤 / 휴지통 / 휴지-<지운 시각>-<u 사용자 · o 덮어쓰기 전 모습 · a 앱 정리>-<글자>~<원래 자리>.json { v, path, at, old, text }
          · 원래 자리는 이름에도 (다이어리›2026 분홍 2›2026-10-28 · '/' 대신 '›' · .json 빼고) → 목록 파일 없이 이름만 읽어 휴지통 화면을 바로 만들어요
          · 목록 파일(예전 설정 / _휴지통목록.json)은 없어요 = 휴지통 폴더가 정답 · 예전 이름(~ 없음) 파일만 열어 봐요 (만드는 중… 표시)
       → a 앱이 혼자 정리한 중복 파일(두 기기가 동시에 만든 것 …) = 화면에 안 보여요 · 30일 뒤 폴더 청소(trSweep)
       → 구글 · 🏠 로그인 없이(js/devsave.js) 같은 코드 (휴지통 폴더도 보통 폴더)
   - 🔒 되살린 꾸민 페이지 · 표지는 볼 수만 (붙인 것 모두 고정 = 스티커 다시 쓰기 막기 · 도련 11-11) · 인형 · 인형극 · 도안 · 덮어쓰기 전 모습은 그대로
   - 📔 그 페이지의 다이어리가 휴지통에 있으면 = 다이어리를 먼저 되살려요 · 영구 삭제됐으면 = 되살릴 수 없어요
   - 되살릴 자리에 그새 새로 쓴 게 있으면 "어느 쪽을 남길까요?" → 안 고른 쪽은 휴지통으로 */

        const TR_TOP = '말랑달콤';   // drive.js 보다 먼저 불러와서 글자로 (TOP_FOLDER_NAME 과 같아요)
        const trq = id => document.getElementById(id);
        const trEsc = htmlEsc;   // 🧰 js/util.js

        /* ---------- 🗑 앱 휴지통에 넣기 ---------- */
        const TR_DAYS = 30, TR_NAME = /^휴지-(\d{10,})-([uao])-([a-z0-9]+)(?:~(.*))?\.json$/;
        const trEnc = path => String(path || '').replace(/^말랑달콤\//, '').replace(/\.json$/, '').split('/').join('›').slice(0, 200);   // 원래 자리 → 이름 (도련 11-11)
        function trParse(name) {                                             // 이름 → { at, w, path } (예전 이름은 path = null)
            const m = TR_NAME.exec(name || ''); if (!m) return null;
            return { at: +m[1], w: m[2], path: m[4] ? TR_TOP + '/' + m[4].split('›').join('/') + '.json' : null };
        }
        const trKill = id => gfetch(`${DRIVE_API}/${id}`, { method: 'DELETE' }).then(r => { if (!r.ok && r.status !== 404) throw new Error('delete ' + r.status); });   // 🔥 영구 삭제 (구글 휴지통을 거치지 않아요)
        async function trPut(path, text, why, old) {                        // why : 'u' 사용자가 지운 것 (🗑 화면) · 'a' 앱이 정리한 것 (숨김)
            if (text == null || text === '' || text === 'null') return null;
            const at = Date.now(), w = why === 'a' ? 'a' : old ? 'o' : 'u';
            const name = `휴지-${at}-${w}-${Math.random().toString(36).slice(2, 7)}~${trEnc(path)}.json`;   // 🏷 원래 자리도 이름에 (목록 파일 없이 · 도련 11-11)
            const dir = await getFolder(dirPath(DIRS.trash), true);
            const saved = await driveUpsert(dir, name, null, JSON.stringify({ v: 1, path: path || '', at, old: old ? 1 : 0, text }));
            return saved.id;
        }
        /* 파일 하나를 앱 휴지통으로 : 내용을 휴지통 폴더에 담고 → 원래 파일은 영구 삭제 (담지 못하면 지우지 않아요) */
        async function appTrash(id, path, why, old) {
            if (!id) return;
            let text = null;
            try { text = await readFileText(id); } catch (e) { if (e && (e.code === 'gone' || e.status === 404)) return; throw e; }
            if (text != null && text !== '' && text !== 'null') await trPut(path, text, why || 'u', old);
            await trKill(id);
        }
        /* 덮어쓰기 전 모습 보관 (부르는 곳 : drive.js · 되살리기) */
        async function trashKeep(path, oldText) {
            try { await trPut(path, oldText, 'u', true); }
            catch (e) { console.warn('덮어쓰기 전 모습을 휴지통에 넣지 못했어요 (저장은 그대로 해요):', path, e); }
        }
        const dayPathOf = key => { const d = parseDayKey(key); return d ? dyBookDir(d.b).concat(dayFileName(d.y, d.m, d.d)).join('/') : ''; };
        function trashKeepDay(key, oldText) { const p = dayPathOf(key); return p ? trashKeep(p, oldText) : Promise.resolve(); }
        const appTrashDay = (key, id) => appTrash(id, dayPathOf(key) || '', 'u');   // 📔 그날 내용을 모두 지웠을 때 (drive.js)
        /* 🧹 30일 청소 : 휴지통 폴더에서 이름의 시각이 30일 지난 것 모두 (u · o · a · 예전 이름도) */
        let trSweepAt = 0;
        async function trSweep() {
            if (!drive.ready || drive.guest || Date.now() - trSweepAt < 6 * 3600e3) return;
            trSweepAt = Date.now();
            try {
                const dir = await getFolder(dirPath(DIRS.trash), false); if (!dir) return;
                const old = Date.now() - TR_DAYS * 864e5;
                for (const f of await driveList(`'${dir}' in parents and trashed=false`, 'id,name')) {
                    const m = trParse(f.name); if (!m || m.at > old) continue;
                    await trKill(f.id).catch(() => {});
                }
            } catch (e) { console.warn('🗑 휴지통 청소 (다음에 다시)', e); }
        }
        /* 📔 그 권의 페이지 (다이어리를 영구 삭제할 때 같이 · 쓴 다이어리인지 볼 때) */
        const trBookPre = id => trEnc(dyBookDir(id).join('/') + '/');
        async function trBookFiles(id) {
            const dir = await getFolder(dirPath(DIRS.trash), false); if (!dir) return [];
            const pre = trBookPre(id);
            return (await driveList(`'${dir}' in parents and trashed=false`, 'id,name')).filter(f => { const m = TR_NAME.exec(f.name || ''); return m && m[4] && (m[4] + '›').startsWith(pre); });
        }
        const trHasBook = async id => (await trBookFiles(id)).some(f => trParse(f.name).w !== 'a');
        async function trKillBook(id) { for (const f of await trBookFiles(id)) await trKill(f.id).catch(() => {}); }
        /* 🗑 버린 목록의 '파일' 종류 (js/bin.js 가 화면 · 30일 · 되살리기 · 비우기를 해요) */
        (window.BIN_PRE = window.BIN_PRE || {}).file = {
            name: e => trLabel(e.path || '') + (e.old ? ' · 덮어쓰기 전 모습' : ''),
            restore: async e => {
                let o = null; try { o = JSON.parse(await readFileText(e.id)); } catch (x) {}
                if (!o || o.text == null) throw new Error('휴지통 파일을 읽지 못했어요');
                const path = o.path || e.path || ''; if (!path) throw new Error('원래 자리를 몰라요');
                const bk = trBookOf(path);                                           // 📔 그 페이지의 다이어리 (목록이 정답)
                if (bk) {
                    if (window.dyyBinList && dyyBinList().some(x => x.u === bk)) { showMsg(`📔 <b>${trEsc(dyyBinName({ u: bk }).replace(/^📔 /, ''))}</b>가 휴지통에 있어요.<br>다이어리를 먼저 되살려 주세요.`); return false; }
                    if (!(window.dyoGet && dyoGet(bk))) { showMsg('📔 이 페이지의 다이어리는 영구 삭제되어<br>되살릴 수 없어요.'); return false; }
                }
                o.text = trLockText(o.text);                                         // 🔒 꾸민 것은 볼 수만 (도련 11-11)
                const parts = path.split('/'), name = parts.pop();
                const dir = await getFolder(parts, true), cur = await findFile(dir, name);
                const now = cur ? await readFileText(cur.id) : null;
                if (now != null && now !== o.text && now !== '' && now !== 'null') {
                    const back = await showAsk(`<b>${trEsc(trLabel(path))}</b><br>그새 새로 쓴 것이 있어요.<br>어느 쪽을 남길까요?<br><span style="font-size:12px;color:#777;">고르지 않은 쪽은 휴지통으로 가요.</span>`, '🗑 휴지통 것', '📝 지금 것');
                    if (!back) return false;
                    await trashKeep(path, now);
                }
                await driveUpsert(dir, name, cur && cur.id, o.text);
                await trKill(e.id);
                return true;
            },
            purge: e => trKill(e.id)
        };
        /* 📔 경로 → 날짜형 다이어리 권 id (다이어리 / 2026 분홍 2 / 2026-10-28.json) · 아니면 '' */
        function trBookOf(path) {
            const p = String(path || '').split('/'); if (p.length < 3 || p.slice(0, -2).join('/') !== DIARY_PATH.join('/')) return '';
            return (typeof dyBookOfName === 'function' && dyBookOfName(p[p.length - 2])) || '';
        }
        /* 🔒 꾸민 페이지 · 표지 : 붙인 것 모두 고정 (lt = 1 · js/elements.js elLocked) · 꾸민 페이지가 아니면 그대로 */
        function trLockText(text) {
            let d = null; try { d = JSON.parse(text); } catch (e) { return text; }
            if (!d || typeof d !== 'object' || !Array.isArray(d.i)) return text;
            d.i.forEach(it => { if (it && typeof it === 'object') it.lt = 1; });
            return JSON.stringify(d);
        }

        /* ---------- 이름 : 경로 → 사람이 알아보는 말 ---------- */
        function trLabel(path) {
            let m = /\/(?:다이어리|날짜형(?:바인더|노트))\/(\d{4} .+ \d+)\/(\d{4})-(\d{2})-(\d{2})\.json$/.exec(path);   // 📔 다이어리 / 2026 분홍 2 / … (도련 11-07)   // 📔 말랑달콤 / 날짜형바인더 · 날짜형노트 / 2026 분홍 2 / 2026-10-28.json
            if (m) return `📔 ${m[2]}년 ${+m[3]}월 ${+m[4]}일 일기 (${m[1]})`;
            if (/\/설정\/설정\.json$/.test(path)) return '⚙ 설정';
            if (/\/설정\/기록\.json$/.test(path)) return '📒 놀이 기록';
            if (/\/검색(-[^/]*)?\.json$/.test(path)) return '🔍 검색 목록';
            const parts = path.split('/'), dir = parts.length > 2 ? parts[parts.length - 2] : '', file = parts[parts.length - 1] || '';
            if (/^(내|받은)-목록\d+\.json$/.test(file)) return '📋 모음 목록';
            if (dir === DIRS.design) return '📐 내 도안';                         // ✂️ 내가 만든 스티커 원본
            if (/^(내|받은)-/.test(file)) {
                const stk = typeof OWN_KIND !== 'undefined' && Object.values(OWN_KIND).includes(dir);
                return stk ? `🏷️ ${dir} 스티커` : dir === DIRS.pattern ? '🎨 배경지' : '📦 ' + dir;
            }
            if (parts.length > 3 && parts[parts.length - 3] === DIRS.diary && /^dk/.test(dir)) return '📕 ' + (/^(\d+)페이지\.json$/.test(file) ? file.replace(/^(\d+)페이지\.json$/, '$1페이지') : /^표지\.json$/.test(file) ? '표지' : '다이어리');   // 📕 다이어리 / dk… / 3페이지.json (도련 11-07)
            if (dir === DIRS.note || dir === DIRS.binder) return '📕 ' + (/-(\d+)페이지\.json$/.test(file) ? file.replace(/^.*-(\d+)페이지\.json$/, '$1페이지') : /-표지\.json$/.test(file) ? '표지' : '다이어리');
            if (/\/인형극\//.test(path)) return '🎭 인형극 ' + parts[parts.length - 1].replace(/\.json$/, '');
            if (/\/인형돌?\//.test(path)) return '👧 인형 ' + parts[parts.length - 1].replace(/\.json$/, '');
            if (/\/목록\//.test(path)) return '📋 모음 목록';
            return '📄 ' + parts.slice(1).join(' / ');
        }
        const trWhen = ms => { const d = new Date(ms); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

        async function trEmpty(items) {                                       // 🗑 보이는 것 모두 영구 삭제 (기록 파일 · 📔 쓴 다이어리 = 🚛)
            for (const e of items) { try { if (e.k === 'dy') await dyyBinPurge(e.id); else await trKill(e.id); } catch (x) { console.warn('🗑 비우기 (다음에 다시)', x); } }
        }
        /* 🗑 휴지통 화면 목록 = 휴지통 폴더 이름 + 📔 쓴 다이어리 칸 (목록 파일 없이 그때그때 · 예전 이름만 열어 봐요 · 도련 11-11) */
        async function trItems(prog) {
            const out = (window.dyyBinList ? dyyBinList() : []).map(x => ({ k: 'dy', id: x.u, at: +x.at || 0, name: dyyBinName(x) }));
            const dir = await getFolder(dirPath(DIRS.trash), false);
            if (dir) {
                const fs = await driveList(`'${dir}' in parents and trashed=false`, 'id,name'), old = [];
                fs.forEach(f => { const m = trParse(f.name); if (!m || m.w === 'a') return; if (m.path) out.push({ k: 'file', id: f.id, at: m.at, path: m.path, old: m.w === 'o' }); else old.push([f, m]); });
                for (let i = 0; i < old.length; i++) {                          // 예전 이름 = 열어서 원래 자리 (30일 지나면 사라져요)
                    prog(i + 1, old.length);
                    const [f, m] = old[i]; let o = null; try { o = JSON.parse(await readFileText(f.id)); } catch (e) {}
                    out.push({ k: 'file', id: f.id, at: m.at, path: (o && o.path) || '', old: !!(o && o.old) });
                }
            }
            out.forEach(e => { if (e.k === 'file') e.name = trLabel(e.path || '') + (e.old ? ' · 덮어쓰기 전 모습' : ''); });
            return out.sort((a, b) => b.at - a.at);
        }
        /* 되살린 뒤 : 화면 · 모음 목록을 다시 (모음은 원본을 보고 목록을 다시 맞춰요) */
        async function trReload() {
            await loadFromDrive();
            if (typeof COLL !== 'undefined') COLL.map.forEach(C => { C.checked = false; C.lists = null; });
        }

        /* ---------- 화면 ---------- */
        function trBuild() {
            if (trq('trashModal')) return;
            const m = document.createElement('div');
            m.className = 'modal'; m.id = 'trashModal';
            m.innerHTML = `<div class="modal-content tr-box">
                <div class="modal-title">🗑 휴지통</div>
                <p class="tr-tip">내가 꾸미고 만든 기록(지운 페이지 · 인형 · 인형극 · 내 도안 …)과 쓴 다이어리를 30일 동안 보관해요.<br>되살리면 원래 자리로 돌아가요 (꾸민 것은 🔒 볼 수만). 30일이 지나면 앱이 영구 삭제해요.<br><small>🚛 상품(스티커 · 소품 · 문구 …)은 버리면 바로 영구 삭제돼서 여기 없어요.</small></p>
                <div class="tr-list" id="trList"></div>
                <div class="tr-foot"><span id="trTotal"></span><button type="button" class="btn tr-empty" id="trEmpty">휴지통 비우기</button></div></div>`;
            document.body.appendChild(m);
        }
        async function openTrash() {
            if (!drive.ready || drive.guest) { showMsg('🗑 휴지통은 구글로 로그인했거나 🏠 로그인 없이 다꾸할 때 쓸 수 있어요.'); return; }
            trBuild(); openModal('trashModal');
            const box = trq('trList'), tot = trq('trTotal'), emp = trq('trEmpty');
            box.innerHTML = '<div class="tr-empty-msg">⏳ 불러오는 중…</div>'; tot.textContent = ''; emp.disabled = true;
            let items;
            try { items = await trItems((i, n) => { box.innerHTML = `<div class="tr-empty-msg">⏳ 휴지통 목록을 만드는 중… ${i} / ${n}</div>`; }); }
            catch (x) { console.warn(x); box.innerHTML = '<div class="tr-empty-msg">⚠ 휴지통을 읽지 못했어요. 잠시 후 다시 열어 주세요.</div>'; return; }
            const n = items.length;
            tot.textContent = n ? `${n}개` : '';
            emp.disabled = !n;
            if (!n) { box.innerHTML = '<div class="tr-empty-msg">휴지통이 비어 있어요.</div>'; return; }
            box.textContent = '';
            items.forEach(e => {
                const row = document.createElement('div'); row.className = 'tr-row tr-goods';
                row.innerHTML = `<span class="tr-what"><b></b><small>${trWhen(e.at)}에 ${e.k === 'dy' ? '버림' : '지움'} · ${binLeft(e.at)}일 뒤 영구 삭제</small></span><button type="button" class="btn tr-back">되살리기</button>`;
                row.querySelector('b').textContent = e.name;
                row.querySelector('.tr-back').onclick = async ev => {
                    const btn = ev.currentTarget; btn.disabled = true;
                    try {
                        if (e.k === 'dy') { if (!dyyBinRestore(e.id)) { openTrash(); return; } }
                        else { if (!await BIN_PRE.file.restore(e)) { btn.disabled = false; return; } await trReload(); }
                        showMsg(`<b>${trEsc(e.name)}</b><br>되살렸어요!${e.k === 'dy' || trBookOf(e.path) ? '<br><small>꾸민 것은 🔒 볼 수만 있어요</small>' : ''}`); openTrash();
                    } catch (x) { console.warn(x); showMsg('⚠ 되살리지 못했어요. 잠시 후 다시 해 주세요.'); btn.disabled = false; }
                };
                box.appendChild(row);
            });
            emp.onclick = async () => {
                if (!(await showMsg(`휴지통의 ${items.length}개를 모두 지울까요?<br><span style="font-size:12px;color:#777;">비우면 다시 살릴 수 없어요.</span>`, true))) return;
                emp.disabled = true;
                await trEmpty(items);
                openTrash();
            };
        }

        window.trashKeep = trashKeep; window.trashKeepDay = trashKeepDay; window.openTrash = openTrash;
        window.appTrash = appTrash; window.appTrashDay = appTrashDay; window.trSweep = trSweep; window.trDayPath = dayPathOf; window.trHasBook = trHasBook; window.trKillBook = trKillBook;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['trash'] = true;
