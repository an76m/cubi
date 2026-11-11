/* 말랑달콤 다이어리 - js/trash.js
   🗑 휴지통 : 지운 것 · 덮어쓰기 전 모습을 30일 동안 보관하고 되살려요 (도련 · 2026-10-13)
   - ⚙ 설정 → 💾 데이터 관리 → 🗑 휴지통 : 목록 · 되살리기 · 휴지통 비우기 (구글 · 🏠 로그인 없이 같은 화면)
   - 들어가는 것 : 앱이 지운 것 (그날 일기를 다 비움 · 스티커 · 페이지 · 배경지 · 인형 · 인형극)
                  + 덮어쓰기 직전 모습 ("어느 쪽을 남길까요?"에서 바뀐 쪽) · 내용이 같으면 넣지 않아요
   - ⭐ 규칙 (도련 11-11) : 앱에서 지운 건 무엇이든 앱 휴지통으로 · 구글 드라이브 휴지통 · 브라우저 휴지통에 넘기지 않아요 · 30일이 지나면 앱이 영구 삭제
       → 지운 파일 = 말랑달콤 / 휴지통 / 휴지-<지운 시각>-<u 사용자 · a 앱 정리>-<글자>.json { v, path : 원래 자리, at, old : 덮어쓰기 전 모습, text : 내용 } 을 만들고 원래 파일은 영구 삭제 (appTrash)
       → 사용자가 지운 것은 🗑 버린 목록(js/bin.js 'diary_bin')에 종류 'file' 한 줄 = 상품과 같은 목록 · 같은 화면 · 같은 30일 (binSweep)
       → 앱이 혼자 정리한 중복 파일(두 기기가 동시에 만든 것 …)은 a = 화면에 안 보여요 · 30일 뒤 폴더 청소(trSweep)가 지워요 (목록에 없는 u 도 같이)
       → 구글 · 🏠 로그인 없이(js/devsave.js) 같은 코드 (휴지통 폴더도 보통 폴더)
   - 되살릴 자리에 그새 새로 쓴 게 있으면 "어느 쪽을 남길까요?" → 안 고른 쪽은 휴지통으로 */

        const TR_TOP = '말랑달콤';   // drive.js 보다 먼저 불러와서 글자로 (TOP_FOLDER_NAME 과 같아요)
        const trq = id => document.getElementById(id);
        const trEsc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

        /* ---------- 🗑 앱 휴지통에 넣기 ---------- */
        const TR_DAYS = 30, TR_NAME = /^휴지-(\d{10,})-([ua])-/;
        const trKill = id => gfetch(`${DRIVE_API}/${id}`, { method: 'DELETE' }).then(r => { if (!r.ok && r.status !== 404) throw new Error('delete ' + r.status); });   // 🔥 영구 삭제 (구글 휴지통을 거치지 않아요)
        async function trPut(path, text, why, old) {                        // why : 'u' 사용자가 지운 것 (🗑 화면) · 'a' 앱이 정리한 것 (숨김)
            if (text == null || text === '' || text === 'null') return null;
            const at = Date.now(), name = `휴지-${at}-${why === 'a' ? 'a' : 'u'}-${Math.random().toString(36).slice(2, 7)}.json`;
            const dir = await getFolder(dirPath(DIRS.trash), true);
            const saved = await driveUpsert(dir, name, null, JSON.stringify({ v: 1, path: path || '', at, old: old ? 1 : 0, text }));
            if (why !== 'a' && window.binAdd) await binAdd({ k: 'file', id: saved.id, path: String(path || '').slice(0, 200), old: old ? 1 : 0 });
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
        /* 🧹 30일 청소 : 휴지통 폴더에서 이름의 시각이 30일 지난 것 (목록에 남은 u 는 binSweep 이 먼저 지워요 · 목록이 어긋나 남은 것 · a 앱 정리는 여기서) */
        let trSweepAt = 0;
        async function trSweep() {
            if (!drive.ready || drive.guest || Date.now() - trSweepAt < 6 * 3600e3) return;
            trSweepAt = Date.now();
            try {
                const dir = await getFolder(dirPath(DIRS.trash), false); if (!dir) return;
                const keep = new Set(window.binList ? binList().filter(e => e.k === 'file').map(e => e.id) : []), old = Date.now() - TR_DAYS * 864e5;
                for (const f of await driveList(`'${dir}' in parents and trashed=false`, 'id,name')) {
                    const m = TR_NAME.exec(f.name || ''); if (!m || +m[1] > old || keep.has(f.id)) continue;
                    await trKill(f.id).catch(() => {});
                }
            } catch (e) { console.warn('🗑 휴지통 청소 (다음에 다시)', e); }
        }
        /* 🗑 버린 목록의 '파일' 종류 (js/bin.js 가 화면 · 30일 · 되살리기 · 비우기를 해요) */
        (window.BIN_PRE = window.BIN_PRE || {}).file = {
            name: e => trLabel(e.path || '') + (e.old ? ' · 덮어쓰기 전 모습' : ''),
            restore: async e => {
                let o = null; try { o = JSON.parse(await readFileText(e.id)); } catch (x) {}
                if (!o || o.text == null) throw new Error('휴지통 파일을 읽지 못했어요');
                const path = o.path || e.path || ''; if (!path) throw new Error('원래 자리를 몰라요');
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

        /* ---------- 이름 : 경로 → 사람이 알아보는 말 ---------- */
        function trLabel(path) {
            let m = /\/(?:다이어리|날짜형(?:바인더|노트))\/(\d{4} .+ \d+)\/(\d{4})-(\d{2})-(\d{2})\.json$/.exec(path);   // 📔 다이어리 / 2026 분홍 2 / … (도련 11-07)   // 📔 말랑달콤 / 날짜형바인더 · 날짜형노트 / 2026 분홍 2 / 2026-10-28.json
            if (m) return `📔 ${m[2]}년 ${+m[3]}월 ${+m[4]}일 일기 (${m[1]})`;
            if (/\/설정\/설정\.json$/.test(path)) return '⚙ 설정';
            if (/\/카페기록\/카페\.json$/.test(path)) return '☕ 카페 기록';
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
        const trSize = b => b >= 1048576 ? (b / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(b / 1024)) + 'KB';

        async function trEmpty() {
            if (window.binList) for (const e of binList()) await binPurge(e);   // 🗑 버린 것 모두 영구 삭제 (상품 · 파일 · js/bin.js)
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
                <p class="tr-tip">앱에서 버리거나 지운 것을 30일 동안 보관해요.<br>되살리면 원래 자리로 돌아가요. 30일이 지나면 앱이 영구 삭제해요.</p>
                <div class="tr-list" id="trList"></div>
                <div class="tr-foot"><span id="trTotal"></span><button type="button" class="btn tr-empty" id="trEmpty">휴지통 비우기</button></div></div>`;
            document.body.appendChild(m);
        }
        async function openTrash() {
            if (!drive.ready || drive.guest) { showMsg('🗑 휴지통은 구글로 로그인했거나 🏠 로그인 없이 다꾸할 때 쓸 수 있어요.'); return; }
            trBuild(); openModal('trashModal');
            const box = trq('trList'), tot = trq('trTotal'), emp = trq('trEmpty');
            box.innerHTML = '<div class="tr-empty-msg">⏳ 불러오는 중…</div>'; tot.textContent = ''; emp.disabled = true;
            const goods = window.binList ? binList().filter(e => BIN_KINDS[e.k]).sort((a, b) => b.at - a.at) : [];   // 🗑 버린 것 하나의 목록 (상품 · 지운 파일 · js/bin.js · 도련 11-11)
            const n = goods.length;
            tot.textContent = n ? `${n}개` : '';
            emp.disabled = !n;
            if (!n) { box.innerHTML = '<div class="tr-empty-msg">휴지통이 비어 있어요.</div>'; return; }
            box.textContent = '';
            goods.forEach(e => {
                const row = document.createElement('div'); row.className = 'tr-row tr-goods';
                row.innerHTML = `<span class="tr-what"><b></b><small>${trWhen(e.at)}에 ${e.k === 'file' ? '지움' : '버림'} · ${binLeft(e)}일 뒤 영구 삭제</small></span><button type="button" class="btn tr-back">되살리기</button>`;
                row.querySelector('b').textContent = BIN_KINDS[e.k].name(e);
                row.querySelector('.tr-back').onclick = async ev => {
                    ev.currentTarget.disabled = true;
                    try { if (!await binRestore(e)) { ev.currentTarget.disabled = false; return; } if (e.k === 'file') { await trReload(); if (binList().some(x => x.k === 'file' && x.id === e.id)) prefSet('diary_bin', 'malang_bin', binList().filter(x => !(x.k === 'file' && x.id === e.id))); }   /* 다시 읽으면 아직 안 올린 버린 목록이 드라이브 것으로 돌아올 수 있어요 → 되살린 줄은 다시 빼요 */ showMsg(`<b>${trEsc(BIN_KINDS[e.k].name(e))}</b><br>되살렸어요!`); openTrash(); }
                    catch (x) { console.warn(x); showMsg('⚠ 되살리지 못했어요. 잠시 후 다시 해 주세요.'); ev.currentTarget.disabled = false; }
                };
                box.appendChild(row);
            });
            emp.onclick = async () => {
                if (!(await showMsg(`휴지통의 ${goods.length}개를 모두 지울까요?<br><span style="font-size:12px;color:#777;">비우면 다시 살릴 수 없어요.</span>`, true))) return;
                emp.disabled = true;
                try { await trEmpty(); } catch (x) { console.warn(x); }
                openTrash();
            };
        }

        window.trashKeep = trashKeep; window.trashKeepDay = trashKeepDay; window.openTrash = openTrash;
        window.appTrash = appTrash; window.appTrashDay = appTrashDay; window.trSweep = trSweep; window.trDayPath = dayPathOf;

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['trash'] = true;
