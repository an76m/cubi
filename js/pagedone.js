/* ✅ 다이어리 페이지 완료 (도련 11-14 : 드라이브 요청 줄이기 + "다 하면 완료를 누른다" 습관)
   - 꾸미는 동안(완료 전)은 드라이브에 올리지 않아요 : 페이지는 메모리 + 이 기기(IndexedDB)에만 · 쓴 스티커 칸도 이 기기에만 (js/own.js h = 페이지 키)
   - ✅ 완료 = 쓴 스티커(종이마다 한 번) → 페이지(done 표시) 를 차례로 올려요 · 게이지 · 다 올라가면 이 기기 보관본을 지워요
     인터넷이 끊겨 못 올리면 : 페이지는 기존 '못 올린 것 보관(savePending)' · 스티커 칸은 '이어서 지우기(ownReplay)' 로 넘겨서 다음에 마저 올려요
   - 완료한 페이지 = 고칠 수 없어요 : 옮기기 · 글 고치기 · 지우기 · 덧붙이기 · 도장 · 속지 모두 안 돼요 (js/elements.js elLocked · saveData)
     예전 페이지(done 이 없는 것) : 붙인 것 중 하루 넘게 손대지 않은 게 있으면 완료한 것으로 봐요 (예전 24시간 고정 규칙 · 그 규칙은 없앴어요)
   - 앱이 갑자기 꺼졌다 다시 열면 : 다이어리를 펼칠 때 "꾸미던 페이지가 있어요 [이어서 하기] [처음부터]"
     처음부터 = 이 기기 보관본을 지우고 쓴 스티커는 시트로 돌아가요 (드라이브는 원래 그대로라 저절로)
   - 완료하지 않고 다른 날로 넘기면 : 그 페이지는 이 기기에 그대로 (돌아오면 이어서) · 짧게 알려요
   💾 임시저장 = 이 기기 전체에서 한 페이지만 (도련 11-14 · 스티커 만들기 임시저장처럼)
   - 아래 가운데 [💾 임시저장] [✅ 완료] · '📱 이 기기에 임시저장 · 오후 3:12' (자동으로도 계속 저장 · 버튼은 '이 기기에만 · 한 페이지만'을 알려 주는 몫)
   - 로그인 뒤 다이어리가 떠오르면 (표지 덮인 채) : "꾸미던 중이었어요 [이어서 하기] [지우고 새로 하기]" · 이어서 = 그 권 · 그 페이지로
   - 다른 페이지 · 다른 다이어리에 처음 뭔가를 하면 : "꾸미던 중이에요 [그 페이지로 가기] [지우고 여기서 시작]" (넘기기 · 구경만은 그냥 돼요)
   - 지우기는 한 번 더 물어요 (붙인 스티커는 서랍으로 돌아가요 · 되돌릴 수 없어요) */
(function () {
    const PG = { key: '', done: false, orig: new Map(), drafts: new Map(), saved: null, asked: false, busy: false, warned: '', at: 0, gating: false, mute: '' };
    const q = id => document.getElementById(id);
    const on = () => typeof drive !== 'undefined' && !!drive.ready && !drive.guest;
    const who = () => (window.pendWho ? pendWho() : 'g:');
    const curKey = () => (typeof currentDate !== 'undefined' && typeof getDateKey === 'function') ? getDateKey(currentDate) : '';
    const coverOpen = () => typeof isCoverOpen !== 'undefined' && isCoverOpen;
    const curVol = () => { try { return window.dkyCur ? dkyCur() : (window.dyyBookId ? dyyBookId() : ''); } catch (e) { return ''; } };   // 지금 펼친 권 (js/desk.js)
    const floating = () => document.documentElement.classList.contains('desk-show');                       // 다이어리가 떠 있어요 (표지 덮인 채여도)
    const wait = ms => new Promise(r => setTimeout(r, ms));
    async function until(f, ms) { const t = Date.now() + ms; while (Date.now() < t) { try { if (f()) return true; } catch (e) {} await wait(80); } return false; }
    const hm = t => new Date(t).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

    /* ---------- 💾 이 기기 보관 (IndexedDB · 계정마다) ---------- */
    let dbP = null;
    function db() {
        if (!dbP) dbP = new Promise(ok => {
            try { const r = indexedDB.open('mallang-pgdraft', 1); r.onupgradeneeded = () => r.result.createObjectStore('d'); r.onsuccess = () => ok(r.result); r.onerror = r.onblocked = () => ok(null); }
            catch (e) { ok(null); }
        });
        return dbP;
    }
    async function tx(mode, fn) {
        const d = await db(); if (!d) return null;
        return new Promise(ok => { try { const t = d.transaction('d', mode), r = fn(t.objectStore('d')); t.oncomplete = () => ok(r ? r.result : true); t.onerror = t.onabort = () => ok(null); } catch (e) { ok(null); } });
    }
    const idKey = key => who() + '|' + key;
    const draftPut = (key, txt) => { PG.at = Date.now(); return tx('readwrite', st => st.put({ who: who(), key, txt, at: PG.at, vol: curVol(), ds: typeof currentDate !== 'undefined' ? +currentDate : 0 }, idKey(key))); };   // vol · ds = 그 권 · 그 페이지로 가려고
    const draftGet = key => tx('readonly', st => st.get(idKey(key)));
    const draftDel = key => tx('readwrite', st => st.delete(idKey(key)));
    async function draftsMine() { const all = await tx('readonly', st => st.getAll()); return (all || []).filter(r => r && r.who === who() && r.key); }

    /* ---------- 완료한 페이지인가 ---------- */
    function pgDoneOf(txt) {
        if (!txt) return false;
        let d; try { d = JSON.parse(txt); } catch (e) { return false; }
        if (!d || typeof d !== 'object') return false;
        if ('done' in d) return !!d.done;
        return Array.isArray(d.i) && d.i.some(it => it && typeof it === 'object' && (!it.lt || Date.now() - it.lt > 864e5));   // 🔒 예전 페이지
    }
    const held = key => !!(window.ownHeld && ownHeld(key).length);
    const dirty = key => PG.drafts.has(key) || held(key);
    window.pgHeld = key => PG.orig.has(key) || PG.drafts.has(key);
    window.pgDoneNow = () => on() && coverOpen() && PG.done && PG.key === curKey();
    window.pgHoldKey = () => (on() && coverOpen() && !PG.done ? curKey() : '');
    window.pgBlock = (x, y) => {
        if (!window.pgDoneNow()) return false;
        if (window.elLockSay) elLockSay(x, y); else if (window.showMsg) showMsg('✅ 완료한 페이지예요 · 고칠 수 없어요');
        return true;
    };

    /* ---------- 저장 (js/elements.js saveData) : 완료 전 = 메모리 + 이 기기만 ---------- */
    window.pgSave = (key, txt) => {
        if (!on() || PG.busy) return false;
        if (PG.done && PG.key === key) return true;
        if (PG.mute === key) return true;                                     // '그 페이지로 가기'를 고른 페이지 = 떠나는 중 (다시 담지 않아요)
        const cur = store.getItem(key);
        if (txt === cur) return true;
        if (!PG.orig.has(key)) PG.orig.set(key, cur);                         // 드라이브에 있는 원래 모습
        store.putLoaded(key, txt);                                            // '바뀜' 표시 없이 (자동 업로드 안 해요)
        if (txt === PG.orig.get(key) && !held(key)) { PG.drafts.delete(key); draftDel(key); }
        else { PG.drafts.set(key, txt); draftPut(key, txt); }
        if (others(key).length) setTimeout(gate, 0);                          // 💾 임시저장은 한 페이지만 : 다른 페이지에 처음 손댔어요
        ui();
        return true;
    };

    /* ---------- 불러오기 (js/elements.js loadData) ---------- */
    window.pgBeforeLoad = key => {
        if (!on() || !PG.drafts.has(key)) return;
        const cur = store.getItem(key), d = PG.drafts.get(key);
        if (cur !== d) { PG.orig.set(key, cur); store.putLoaded(key, d); }   // 다른 기기에서 바뀐 걸 다시 읽었어도 꾸미던 모습으로
    };
    window.pgAfterLoad = key => {
        const prev = PG.key;
        PG.key = key;
        if (PG.mute && PG.mute !== key) PG.mute = '';
        PG.done = on() && pgDoneOf(PG.orig.has(key) ? PG.orig.get(key) : store.getItem(key)) && !PG.drafts.has(key);
        mo && mo.takeRecords();                                               // 불러온 것은 '새로 붙인 것'이 아니에요
        if (prev && prev !== key && dirty(prev) && PG.warned !== prev && window.showMsg) {
            PG.warned = prev;
            showMsg('✏️ 꾸미던 페이지는 <b>아직 완료 전</b>이에요.<br><span style="font-size:12px;color:#777;">이 기기에만 있어요 · 다시 펼쳐서 ✅ 완료를 눌러야 저장돼요</span>');
        }
        ui();
        if (!PG.asked) ask();
    };

    /* ---------- 💾 임시저장은 한 페이지만 ---------- */
    const heldKeys = () => { try { return window.ownPendGet ? ownPendGet().filter(p => p && p.h).map(p => p.h) : []; } catch (e) { return []; } };
    const others = key => [...new Set([...PG.drafts.keys(), ...heldKeys()])].filter(k => k && k !== key);
    function label(key, r) {
        const d = typeof parseDayKey === 'function' && parseDayKey(key), p = !d && typeof parsePageKey === 'function' && parsePageKey(key);
        const nm = d ? `${d.m}월 ${d.d}일` : p ? (p.n ? `${p.n}페이지` : '표지') : '페이지';
        return (r && r.vol && r.vol !== curVol() ? '다른 다이어리의 ' : '') + nm;
    }
    async function recOf(key) { const r = await draftGet(key); return r || { key, txt: PG.drafts.get(key) }; }
    function drop(key) {                                                      // 🗑 그 페이지 임시저장 지우기 (드라이브는 원래 그대로 · 쓴 스티커는 서랍으로)
        PG.drafts.delete(key); draftDel(key);
        if (PG.orig.has(key)) { store.putLoaded(key, PG.orig.get(key)); PG.orig.delete(key); }
        if (window.ownDropHeld) ownDropHeld([key]);
    }
    const askDrop = nm => typeof showAsk === 'function'
        ? showAsk(`🗑 <b>${nm}</b> 페이지에 꾸민 것을 지울까요?<br><span style="font-size:12px;color:#777;">붙인 스티커는 서랍으로 돌아가요 · 되돌릴 수 없어요</span>`, '지우기', '아니요')
        : Promise.resolve(true);
    async function goDraft(key, r) {                                          // ➡️ 그 권 · 그 페이지 펼치기
        const vol = r && r.vol, ds = r && r.ds;
        if (vol && vol !== curVol() && window.dkVolOpen) {
            if (floating() && window.deskCloseDiary) { deskCloseDiary(); await until(() => !floating() && !(typeof turn !== 'undefined' && turn), 6000); await wait(150); }
            dkVolOpen(vol); await until(() => floating(), 3000); await wait(900);
        } else if (!floating() && !coverOpen() && window.deskOpenDiary) { deskOpenDiary(); await until(floating, 3000); await wait(900); }
        if (!coverOpen()) { await until(() => !(typeof turn !== 'undefined' && turn), 3000); if (!coverOpen() && typeof openCoverAnimated === 'function') openCoverAnimated(); await until(coverOpen, 5000); }
        await until(() => !(typeof turn !== 'undefined' && turn), 3000);
        if (curKey() === key) { if (typeof loadData === 'function') loadData(); }
        else if (ds && typeof goToDate === 'function') goToDate(new Date(ds));
        else if (window.showMsg) showMsg(`📖 <b>${label(key, r)}</b> 페이지를 펼치면 이어서 꾸밀 수 있어요.`);
    }
    async function gate() {                                                   // 다른 페이지에 처음 손댔어요 → 그 페이지로 가기 / 지우고 여기서 시작
        const key = curKey();
        if (PG.gating || PG.busy || !on() || !dirty(key)) return;
        const L = others(key); if (!L.length) return;
        PG.gating = true;
        try {
            const o = L[0], r = await recOf(o), nm = label(o, r);
            for (;;) {
                const go = typeof showAsk === 'function'
                    ? await showAsk(`✏️ <b>${nm}</b> 페이지를 꾸미던 중이에요.<br><span style="font-size:12px;color:#777;">💾 임시저장은 한 페이지만 돼요<br>그 페이지를 ✅ 완료하거나 지워야 여기서 꾸밀 수 있어요</span>`, '그 페이지로 가기', '지우고 여기서 시작')
                    : true;
                if (go) {                                                     // 여기 방금 한 것은 없던 일로 (쓴 스티커도 서랍으로)
                    PG.mute = key; drop(key);
                    if (typeof loadData === 'function') { try { await loadData(); } catch (e) {} }
                    await goDraft(o, r);
                    break;
                }
                if (await askDrop(nm)) { L.forEach(drop); try { if (typeof saveData === 'function') await saveData(false); } catch (e) {} break; }
            }
        } finally { PG.gating = false; ui(); }
    }

    /* ---------- 🔁 로그인 뒤 다이어리가 떠오르면 : 꾸미던 페이지가 있어요 (임시저장 = 한 페이지) ---------- */
    async function ask() {
        if (!on() || PG.asked || !(coverOpen() || floating())) return;
        PG.asked = true;
        let L = (await draftsMine()).filter(r => !PG.drafts.has(r.key)).sort((a, b) => (b.at || 0) - (a.at || 0));
        if (!L.length) return;
        if (L.length > 1) { const old = L.slice(1); old.forEach(r => draftDel(r.key)); if (window.ownDropHeld) ownDropHeld(old.map(r => r.key)); L = [L[0]]; }   // 예전에 여러 개 남은 것 = 가장 최근 것만
        const r = L[0], nm = label(r.key, r);
        for (;;) {
            const go = typeof showAsk === 'function'
                ? await showAsk(`✏️ <b>${nm}</b> 페이지를 꾸미던 중이었어요.<br><span style="font-size:12px;color:#777;">📱 이 기기에 임시저장되어 있어요 (${hm(r.at || Date.now())})<br>✅ 완료해야 다이어리에 저장돼요</span>`, '이어서 하기', '지우고 새로 하기')
                : true;
            if (go) { PG.drafts.set(r.key, r.txt); PG.at = r.at || Date.now(); ui(); await goDraft(r.key, r); return; }
            if (await askDrop(nm)) { drop(r.key); ui(); return; }
        }
    }

    /* ---------- ✅ 완료 ---------- */
    async function done() {
        const key = curKey();
        if (PG.busy || !on() || PG.done || !dirty(key)) return;
        const ok = typeof showAsk === 'function'
            ? await showAsk('✅ 이 페이지를 <b>완료</b>할까요?<br><span style="font-size:12px;color:#777;">완료하면 이 페이지는 <b>고칠 수 없어요</b><br>스티커를 더 붙이거나 글을 고칠 수도 없어요</span>', '완료', '조금 더 꾸미기')
            : true;
        if (!ok || curKey() !== key) return;
        try { await saveData(false); } catch (e) {}                           // 마지막 손길까지 (이 기기에)
        PG.busy = true; ui();
        gauge(4, '✏️ 완료 준비 중…');
        let stickersOk = false;
        try {
            gauge(10, '🗄️ 쓴 스티커 정리 중…');
            if (window.ownCommit) await ownCommit(key, p => gauge(10 + p * 50, '🗄️ 쓴 스티커 정리 중…'));
            stickersOk = true;
            gauge(65, '📖 페이지 저장 중…');
            mark(key);
            const up = typeof flushUpload === 'function' ? await flushUpload({ force: true }) : true;
            if (!up) throw new Error('upload');
            gauge(100, '✅ 완료!');
            await draftDel(key); PG.drafts.delete(key);
            await wait(650); gaugeOff();
            if (window.showMsg) showMsg('✅ 완료했어요!<br><span style="font-size:12px;color:#777;">이 페이지는 이제 고칠 수 없어요</span>');
        } catch (e) {
            console.warn('✅ 완료 저장', e);
            if (!stickersOk && window.ownUnhold) ownUnhold(key);                 // 스티커 칸은 '이어서 지우기'로 (인터넷이 되면)
            if (PG.drafts.has(key) || PG.orig.has(key)) mark(key);              // 페이지는 '못 올린 것 보관'으로 (savePending · 다음에 열면 마저)
            try { if (typeof savePending === 'function') savePending(); } catch (er) {}
            await draftDel(key); PG.drafts.delete(key);
            gaugeOff();
            if (window.showMsg) showMsg('📶 지금은 드라이브에 다 올리지 못했어요.<br><span style="font-size:12px;color:#777;">완료한 페이지는 이 기기에 안전하게 보관했어요 · 인터넷이 되면 마저 올려요</span>');
        } finally {
            PG.busy = false; PG.done = true; PG.key = key; ui();
        }
    }
    function mark(key) {                                                     // 완료 표시를 달고 보통 저장(드라이브로)
        let d = null; try { d = JSON.parse(store.getItem(key) || 'null'); } catch (e) {}
        d = d && typeof d === 'object' ? d : { v: 3, i: [] };
        d.done = Date.now();
        PG.orig.delete(key);
        store.setItem(key, JSON.stringify(d));                                // markDirty → 올리기
        try { if (window.deskLastDeco) deskLastDeco(); } catch (e) {}
        try { if (window.dkMark) dkMark(key, true); } catch (e) {}
        try { if (typeof searchTouch === 'function') searchTouch(key); } catch (e) {}
    }

    /* ---------- 💾 임시저장 버튼 (자동으로도 늘 저장 · 누르면 지금 저장하고 알려 줘요) ---------- */
    async function saveNow() {
        const key = curKey();
        if (PG.busy || !on() || PG.done) return;
        try { if (typeof saveData === 'function') await saveData(false); } catch (e) {}
        if (!PG.drafts.has(key) && !held(key)) { if (window.showMsg) showMsg('💾 아직 꾸민 것이 없어요.'); return; }
        await draftPut(key, PG.drafts.has(key) ? PG.drafts.get(key) : store.getItem(key)); ui();
        if (window.showMsg) showMsg(`💾 이 기기에 임시저장했어요 (${hm(PG.at)})<br><span style="font-size:12px;color:#777;">다른 기기에서는 보이지 않아요 · 임시저장은 한 페이지만 돼요<br>✅ 완료해야 다이어리에 저장돼요</span>`);
    }

    /* ---------- 게이지 ---------- */
    function gauge(p, t) {
        let g = q('pgGauge');
        if (!g) { g = document.createElement('div'); g.id = 'pgGauge'; g.className = 'pg-gauge'; g.innerHTML = '<div class="pg-gbox"><b id="pgGT"></b><i><u id="pgGB"></u></i><small>창을 닫지 말고 잠깐 기다려 주세요</small></div>'; document.body.appendChild(g); }
        q('pgGT').textContent = t; q('pgGB').style.width = Math.max(0, Math.min(100, p)) + '%';
    }
    function gaugeOff() { const g = q('pgGauge'); if (g) g.remove(); }

    /* ---------- 아래 가운데 : ✅ 완료 버튼 · 완료한 페이지 표시 ---------- */
    function ui() {
        let b = q('pgBar');
        if (!b) {
            b = document.createElement('div'); b.id = 'pgBar'; b.className = 'pg-bar';
            b.innerHTML = '<button type="button" class="pg-sv" id="pgSv">💾 임시저장</button><button type="button" class="pg-go" id="pgGo">✅ 완료</button><small class="pg-t" id="pgT"></small>';
            document.body.appendChild(b);
            q('pgGo').addEventListener('click', done);
            q('pgSv').addEventListener('click', saveNow);
        }
        const key = curKey(), show = on() && coverOpen() && !(typeof turn !== 'undefined' && turn) && PG.key === key;
        const mode = !show ? '' : PG.done ? 'done' : dirty(key) ? 'go' : '';
        b.className = 'pg-bar' + (mode ? ' on ' + mode : '') + (PG.busy ? ' busy' : '');
        q('pgGo').hidden = q('pgSv').hidden = mode !== 'go';
        q('pgT').innerHTML = mode === 'done' ? '✅ 완료한 페이지 · 고칠 수 없어요'
            : `<span>📱 이 기기에 임시저장${PG.at ? ' · ' + hm(PG.at) : ''}</span><span>완료하면 고칠 수 없어요</span>`;
        if (show && !PG.gating && !PG.busy && mode === 'go' && others(key).length) gate();   // 스티커만 쓰고 아직 저장 전이어도
    }
    setInterval(() => { ui(); if (!PG.asked && on() && (coverOpen() || floating())) ask(); }, 700);   // 다이어리를 덮거나 넘기는 중엔 숨겨요 · 로그인 뒤 떠오르면 물어봐요                                                     // 다이어리를 덮거나 넘기는 중엔 숨겨요

    /* ---------- 완료한 페이지에 새로 붙은 것 = 바로 떼요 (어느 길로 붙였든 · 마지막 안전망) ---------- */
    let mo = null;
    function watch() {
        const c = q('canvasArea'); if (!c || mo) return;
        mo = new MutationObserver(recs => {
            if (!window.pgDoneNow()) return;
            let saved = 0; try { const d = JSON.parse(store.getItem(curKey()) || 'null'); saved = d && Array.isArray(d.i) ? d.i.length : 0; } catch (e) {}
            const boxes = c.querySelectorAll(':scope > .element-box').length;
            if (boxes <= saved) return;                                       // 불러온 것 (저장된 수만큼) 은 그대로
            let hit = false;
            recs.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList && n.classList.contains('element-box') && !n.classList.contains('el-peel-back') && n.isConnected) { n.remove(); hit = true; } }));
            if (hit) window.pgBlock();
        });
        mo.observe(c, { childList: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
    window.pgDone = done; window.pgDoneOf = pgDoneOf;
    window.pgTest = () => ({ key: PG.key, done: PG.done, drafts: [...PG.drafts.keys()], orig: [...PG.orig.keys()], busy: PG.busy, at: PG.at, gating: PG.gating });
    window.pgSaveNow = saveNow;
})();
