/* 말랑달콤 다이어리 - js/phonepaint.js
   🎨 폰 그림판 (도련 11-14 : '폰 스티커 만들기 다듬기 · 속지 · 떡메 · 마테 · 씰 · 조각 · 모조지 다 동일한 규칙')
   - 📱 ✂️ 작업실 → 종류 → ＋ 새로 만들기 → 🎨 그려서 만들기 (js/craft.js CRAFT_WAYS.paint · 폰에서만)
   - 그림판 = 📱 태블릿 그림판 그대로 (js/padpaint.js ppOpen) · 화면만 한 손 크기로
       위 : ‹ · 제목 · 💾 저장 상태 / 그림판 막대 (🖌️ 픽셀 · ✒️ 벡터 · 종류마다 다른 칸 · ↶ ↷ · 옆으로 밀어요)
       가운데 : 종이 / 아래 : 🎨 도구 · 🗂 레이어 · 더보기 (탭) + 📔 붙여 보기 · 💾 · ✅ 완료 (늘 보여요)
       레이어 = '🗂 레이어 · 더보기' 탭에 접어 둠 (그냥 그리면 몰라도 돼요 · 🧩 담은 조각 · 🎀 미리보기 · 💗 풀칠 띠도 거기)
   - 💾 임시저장 = 종류마다 하나 · 이 기기에만 (js/drive.js draftHas · 태블릿과 같은 것) → 열 때 '이어서 / 새로' (새로 = 한 번 더 물어요)
   - ✅ 완료 = 📐 내 도안 (js/own.js ownDesignOnly : 📱 폰 작업실) → '🖨 지금 바로 뽑기' (ownDzMsg) → 🗄️ 서랍
   ※ 이 파일이 없어도 다이어리는 정상 동작 (🎨 그려서 만들기만 안 보여요) */
(function () {
    const KIND = {
        leaf: ['📃', '속지', { bg: '#ffffff', mk: { g: 'plain', lc: '#f6d5df', gap: 56 } }],
        tk: ['🧻', '떡메', { bg: '#fff6cf', mk: { bg: '#fff6cf', g: 'line', lc: '#f1d58a', gap: 40 } }],
        tape: ['🎀', '테이프', { bg: '#ffc6d6', mk: { bg: '#ffc6d6', g: 'plain', lc: '#ffffff', gap: 24 } }],
        seal: ['🏷️', '씰스티커', { bg: '#ffffff', mk: { g: 'plain', lc: '#f6d5df', gap: 56 } }],
        piece: ['🧩', '조각', { bg: '#ffffff', mk: { g: 'plain', lc: '#f6d5df', gap: 56 } }],
        paper: ['📄', '모조지', { bg: '#fdfaf2', mk: { g: 'plain', lc: '#f6d5df', gap: 56 } }]
    };
    const PH = { on: false, k: '', tok: 0, obs: null };
    const q = id => document.getElementById(id);

    function build(k) {
        let el = q('phPaint'); if (el) el.remove();
        const [ic, nm] = KIND[k];
        el = document.createElement('div'); el.id = 'phPaint'; el.className = 'phw';
        el.innerHTML = `<div class="phw-top"><button type="button" class="phw-back" id="phwBack" aria-label="나가기">‹</button><span class="phw-t"><b>${ic} ${nm} 그리기</b><small id="phwSub">📱 이 기기에 임시저장 (자동)</small></span></div>
            <div class="phw-bar shm-bar" id="phwBar"></div>
            <div class="phw-c" id="phwC"></div>
            <div class="phw-bot">
                <div class="phw-tabs"><button type="button" data-t="L" class="on">🎨 도구</button><button type="button" data-t="R">🗂 레이어 · 더보기<em id="phwPc"></em></button></div>
                <div class="phw-pane on" id="phwL"></div><div class="phw-pane" id="phwR"></div>
                <div class="phw-act">${k === 'piece' ? '<button type="button" class="phw-add" id="phwAdd">➕ 담기</button>' : ''}<button type="button" id="phwTry">${k === 'leaf' ? '📔 끼워 보기' : k === 'paper' ? '📔 놓아 보기' : '📔 붙여 보기'}</button><button type="button" class="phw-sv" id="phwSave" aria-label="임시저장">💾</button><button type="button" class="phw-go" id="phwGo">✅ 완료</button></div>
            </div>`;
        document.body.appendChild(el);
        el.querySelector('.phw-tabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) tab(b.dataset.t); };
        q('phwBack').onclick = () => closePhonePaint();
        q('phwGo').onclick = () => { const b = q('ppGo'); if (b) b.click(); };
        q('phwSave').onclick = () => { const b = q('ppTmp'); if (b) b.click(); };
        q('phwTry').onclick = () => { const b = document.querySelector('#ppBarX [data-q="spec"]'); if (b) b.click(); };
        if (q('phwAdd')) q('phwAdd').onclick = () => { const b = q('ppPcAdd'); if (b) b.click(); };
        return el;
    }
    function tab(t) {
        document.querySelectorAll('#phPaint .phw-tabs [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === t));
        q('phwL').classList.toggle('on', t === 'L'); q('phwR').classList.toggle('on', t === 'R');
    }
    function mirror() {                                                        // 💾 저장 상태 · 🧩 담은 조각 수 = 위 · 탭에 보여요
        const s = q('ppTmpT'), sub = q('phwSub'), n = q('ppPcN'), pc = q('phwPc');
        const put = (e, t) => { if (e && e.textContent !== t) e.textContent = t; };   // 같으면 그대로 (지켜보기가 다시 불리지 않게)
        if (s) put(sub, s.textContent);
        put(pc, n ? ' · 🧩 ' + n.textContent : '');
        const go = q('ppGo'), g2 = q('phwGo'); if (go && g2) { if (g2.disabled !== go.disabled) g2.disabled = go.disabled; put(g2, go.disabled ? go.textContent : '✅ 완료'); }
    }
    async function openPhonePaint(k) {
        if (!KIND[k] || !window.ppOpen) { if (window.comingSoon) comingSoon('🎨 그려서 만들기'); return; }
        const tok = ++PH.tok;
        const DK = (window.PP_DRAFT_K || {})[k] || k;
        let draft = null, has = null;
        try { has = window.draftHas ? await draftHas(DK) : null; } catch (e) { console.warn('💾 그리던 것', e); }
        if (tok !== PH.tok) return;
        if (has) {
            const d = new Date(has.at), when = isNaN(d) ? '' : `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            const cont = await showAsk(`💾 그리던 <b>${KIND[k][1]}</b>가 있어요<br><span style="font-size:12px;color:#777;">📱 이 기기 · ${when}</span>`, '✏️ 이어서', '🆕 새로 시작');
            if (tok !== PH.tok) return;
            let fresh = !cont;
            if (fresh) fresh = await showAsk('🆕 새로 시작할까요?<br><span style="font-size:12px;color:#777;">⚠ 그리던 것은 지워져요</span>', '지우고 새로', '그만 (이어서)');   // 지우기는 한 번 더 물어요
            if (tok !== PH.tok) return;
            if (fresh) { try { await draftDrop(DK); } catch (e) { console.warn('💾 지우기', e); } }
            else { try { draft = await draftRead(DK); } catch (e) { console.warn('💾 읽기', e); } if (!draft) showMsg('⚠ 그리던 것을 열지 못했어요.<br>새로 시작해요.'); }
        }
        if (tok !== PH.tok) return;
        const el = build(k); PH.on = true; PH.k = k;
        document.body.classList.add('phw-on');
        el.classList.add('show');
        ppOpen(Object.assign({ kind: k, W: 900, H: 1395, bar: q('phwBar'), L: q('phwL'), C: q('phwC'), R: q('phwR'), draft,
            done: () => { closePhonePaint(true); if (window.craftRefresh) craftRefresh(); } }, KIND[k][2]));
        tab(k === 'piece' ? 'R' : 'L');                                         // 🧩 조각은 담은 조각 칸부터
        if (PH.obs) PH.obs.disconnect();
        PH.obs = new MutationObserver(mirror); ['ppTmpT', 'ppPcN', 'ppGo'].forEach(id => { const e = q(id); if (e) PH.obs.observe(e, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['disabled'] }); });   // 💾 상태 · 🧩 개수 · ✅ 만 지켜봐요
        mirror();
    }
    async function closePhonePaint(done) {
        if (!PH.on) return;
        if (!done && window.ppDirty && ppDirty() && window.ppSaveDraft) {      // ‹ 나가기 = 이 기기에 임시저장하고 (태블릿과 같아요 · 못 하면 물어요)
            let ok = false; try { ok = await ppSaveDraft(true); } catch (e) {}
            if (!ok && window.showAsk && !(await showAsk('임시저장을 하지 못했어요.<br>그래도 나갈까요?', '나가기', '계속 그리기'))) return;
        }
        PH.on = false; PH.tok++;
        if (PH.obs) { PH.obs.disconnect(); PH.obs = null; }
        if (window.ppClose) ppClose();
        const el = q('phPaint'); if (el) el.remove();
        document.querySelectorAll('#ppSpecPop, #ppSizePop, #ppMinePop').forEach(e => e.remove());
        document.body.classList.remove('phw-on');
        if (window.craftRefresh) craftRefresh();
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && PH.on && !document.querySelector('.modal[style*="flex"]') && !document.querySelector('.pp-pop')) closePhonePaint(); });
    window.openPhonePaint = openPhonePaint; window.closePhonePaint = closePhonePaint; window.phonePaintOn = () => PH.on;
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['phonepaint'] = true;
