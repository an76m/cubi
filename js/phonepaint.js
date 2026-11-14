/* 말랑달콤 다이어리 - js/phonepaint.js
   🎨 폰 그림판 (도련 11-14 : '폰 스티커 만들기 다듬기 · 속지 · 떡메 · 마테 · 씰 · 조각 · 모조지 다 동일한 규칙')
   - 📱 ✂️ 작업실 → 종류 → ＋ 새로 만들기 → 🎨 그려서 만들기 (js/craft.js CRAFT_WAYS.paint · 폰에서만)
   - 그림판 = 📱 태블릿 그림판 그대로 (js/padpaint.js ppOpen) · 화면만 한 손 크기로
       위 : ‹ · 제목 · 💾 저장 상태 / 그림판 막대 (🖌️ 픽셀 · ✒️ 벡터 · 종류마다 다른 칸 · ↶ ↷ · 옆으로 밀어요)
       가운데 : 종이 (화면 거의 전체) / 아래 한 줄 : 🎨 도구 · 🗂 레이어 · 📔 붙여 보기 · 💾 · ✅ 완료
       🎨 도구 · 🗂 레이어 = 누를 때만 아래에서 올라오는 판 (도련 11-15 · 폰 전용 화면 · 판 밖 톡 · ✕ · ‹ · 같은 버튼 다시 = 닫기 · 도구 · 색을 골라도 열린 채)
       판의 탭 = 🎨 도구 / 🗂 레이어 · 더보기 (🧩 담은 조각 · 🎀 미리보기 · 💗 풀칠 띠도 거기) · 🎨 버튼 = 지금 도구 그림 + 지금 색 점
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
    const PH = { on: false, k: '', tok: 0, obs: null, t: 'L' };
    const q = id => document.getElementById(id);

    function build(k) {
        let el = q('phPaint'); if (el) el.remove();
        const [ic, nm] = KIND[k];
        el = document.createElement('div'); el.id = 'phPaint'; el.className = 'phw';
        el.innerHTML = `<div class="phw-top"><button type="button" class="phw-back" id="phwBack" aria-label="나가기">‹</button><span class="phw-t"><b>${ic} ${nm} 그리기</b><small id="phwSub">📱 이 기기에 임시저장 (자동)</small></span></div>
            <div class="phw-bar shm-bar" id="phwBar"></div>
            <div class="phw-c" id="phwC"></div>
            <div class="phw-dim" id="phwDim"></div>
            <div class="phw-sheet" id="phwSheet" aria-hidden="true">
                <div class="phw-sh-h"><div class="phw-tabs"><button type="button" data-t="L" class="on">🎨 도구</button><button type="button" data-t="R">🗂 레이어 · 더보기<em id="phwPc"></em></button></div><button type="button" class="phw-sh-x win-x" id="phwShX" aria-label="닫기">✕</button></div>
                <div class="phw-pane on" id="phwL"></div><div class="phw-pane" id="phwR"></div>
            </div>
            <div class="phw-bot"><div class="phw-act">
                <button type="button" class="phw-ic" data-open="L" id="phwOpL"><i id="phwTool">🖌️</i><span>도구</span><em class="phw-dot" id="phwDot"></em></button>
                <button type="button" class="phw-ic" data-open="R" id="phwOpR"><i>🗂</i><span>레이어</span></button>
                ${k === 'piece' ? '<button type="button" class="phw-ic phw-add" id="phwAdd"><i>➕</i><span>담기</span></button>' : ''}
                <button type="button" class="phw-ic" id="phwTry"><i>📔</i><span>${k === 'leaf' ? '끼워 보기' : k === 'paper' ? '놓아 보기' : '붙여 보기'}</span></button>
                <button type="button" class="phw-ic phw-sv" id="phwSave" aria-label="임시저장"><i>💾</i><span>저장</span></button>
                <button type="button" class="phw-go" id="phwGo">✅ 완료</button>
            </div></div>`;
        document.body.appendChild(el);
        el.querySelector('.phw-tabs').onclick = e => { const b = e.target.closest('[data-t]'); if (b) tab(b.dataset.t); };
        el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { const t = b.dataset.open; if (sheetOn() && PH.t === t) sheet(false); else { tab(t); sheet(true); } });
        q('phwDim').onclick = () => sheet(false);                                 // 종이 쪽 톡 = 닫기 (그 톡으로 그리지는 않아요)
        q('phwShX').onclick = () => sheet(false);
        q('phwBack').onclick = () => { if (sheetOn()) { sheet(false); return; } closePhonePaint(); };
        q('phwGo').onclick = () => { sheet(false); const b = q('ppGo'); if (b) b.click(); };
        q('phwSave').onclick = () => { const b = q('ppTmp'); if (b) b.click(); };
        q('phwTry').onclick = () => { sheet(false); const b = document.querySelector('#ppBarX [data-q="spec"]'); if (b) b.click(); };
        if (q('phwAdd')) q('phwAdd').onclick = () => { const b = q('ppPcAdd'); if (b) b.click(); };   // 🧩 ➕ 담기
        return el;
    }
    /* 🎨 도구 · 🗂 레이어 = 아래에서 올라오는 판 (도련 11-15 : 늘 펼쳐 둔 아래 칸이 화면 반을 써서 종이가 작았어요 → 누를 때만) */
    const sheetOn = () => { const s = q('phwSheet'); return !!(s && s.classList.contains('on')); };
    function sheet(on) {
        const s = q('phwSheet'), d = q('phwDim'); if (!s) return;
        s.classList.toggle('on', !!on); d.classList.toggle('on', !!on); s.setAttribute('aria-hidden', on ? 'false' : 'true');
        document.querySelectorAll('#phPaint [data-open]').forEach(b => b.classList.toggle('on', !!on && b.dataset.open === PH.t));
        mirror();
    }
    function tab(t) {
        PH.t = t;
        document.querySelectorAll('#phPaint .phw-tabs [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === t));
        q('phwL').classList.toggle('on', t === 'L'); q('phwR').classList.toggle('on', t === 'R');
        document.querySelectorAll('#phPaint [data-open]').forEach(b => b.classList.toggle('on', sheetOn() && b.dataset.open === t));
    }
    function mirror() {                                                        // 💾 저장 상태 · 🧩 담은 조각 수 · 지금 도구 · 색 = 위 · 아래 버튼에 보여요
        const s = q('ppTmpT'), sub = q('phwSub'), n = q('ppPcN');
        const put = (e, t) => { if (e && e.textContent !== t) e.textContent = t; };   // 같으면 그대로 (지켜보기가 다시 불리지 않게)
        if (s) put(sub, s.textContent);
        put(q('phwPc'), n ? ' · 🧩 ' + n.textContent : '');
        const go = q('ppGo'), g2 = q('phwGo'); if (go && g2) { if (g2.disabled !== go.disabled) g2.disabled = go.disabled; put(g2, go.disabled ? go.textContent : '✅ 완료'); }
        const tb = document.querySelector('#ppTools button.on'); if (tb) put(q('phwTool'), (tb.firstChild && tb.firstChild.textContent || '').trim() || '🎨');
        const now = q('ppNow'), dot = q('phwDot'); if (now && dot) { const c = now.style.background || ''; if (dot.style.background !== c) dot.style.background = c; }
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
        tab(k === 'piece' ? 'R' : 'L');                                         // 🧩 조각은 담은 조각 칸부터 (판은 닫힌 채 · 누르면 그 칸)
        if (PH.obs) PH.obs.disconnect();
        PH.obs = new MutationObserver(mirror); ['ppTmpT', 'ppPcN', 'ppGo'].forEach(id => { const e = q(id); if (e) PH.obs.observe(e, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['disabled'] }); });   // 💾 상태 · 🧩 개수 · ✅ 만 지켜봐요
        [['ppTools', ['class']], ['ppNow', ['style']]].forEach(([id, a]) => { const e = q(id); if (e) PH.obs.observe(e, { subtree: true, childList: true, attributes: true, attributeFilter: a }); });   // 지금 도구 · 색 = 아래 🎨 버튼
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
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && PH.on && !document.querySelector('.modal[style*="flex"]') && !document.querySelector('.pp-pop')) { if (sheetOn()) sheet(false); else closePhonePaint(); } });
    window.openPhonePaint = openPhonePaint; window.closePhonePaint = closePhonePaint; window.phonePaintOn = () => PH.on;
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['phonepaint'] = true;
