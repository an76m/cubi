/* 말랑달콤 다이어리 - js/phoneprint.js
   🖨 폰 프린터 (도련 11-14 : '폰에서 쓸 수 있는 프린트가 따로 필요 · 폰은 편리함이 1순위')
   - 📱 ✂️ 작업실 위 🖨 프린터 버튼 (숫자 = 지금 뽑을 수 있는 도안) → 화면 가득
   - 📐 내 도안 모두 (속지 · 떡메 · 메모지 · 마테 · 씰 · 조각 · 모조지) · 위 종류 칩으로 거르기
   - 줄마다 : 그림 · 이름 · 뽑으면 무엇이 몇 개 (제작 규칙 · js/own.js ownRuleText) · 🖨 뽑기 / 🗄️ 서랍에 있어요
   - 규칙 = 책상 프린터와 같아요 : 뽑은 것을 다 쓰거나 🗑 버려야 다시 뽑아요 (js/own.js ownPrintDesign · ownDesignBusy)
   - 뽑으면 위 프린터에서 종이가 나오고 '📌 바로 꺼내 쓰기' (js/craft.js craftUseMine)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (🖨 버튼만 없어요) */
(function () {
    const KN = { seal: ['🏷️', '씰'], piece: ['🧩', '조각'], paper: ['📄', '모조지'], leaf: ['📃', '속지'], tk: ['🧻', '떡메'], memo: ['📝', '메모지'], tape: ['🎀', '마테'] };
    const PR = { on: false, k: '', list: [], busy: new Set(), going: false, out: null };
    const q = id => document.getElementById(id);
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    function build() {
        let el = q('phPr'); if (el) return el;
        el = document.createElement('div'); el.id = 'phPr'; el.className = 'php-room';
        el.innerHTML = `<div class="php-top"><button type="button" class="php-back" id="phPrBack" aria-label="뒤로">‹</button><b>🖨 내 도안 프린터</b></div>
            <div class="php-box" id="phPrBox"><div class="php-mc"><span class="php-lcd" id="phPrLcd">뽑을 도안을 골라요</span><i class="php-led"></i><i class="php-slot"></i></div><div class="php-paper" id="phPrPaper"></div><div class="php-msg" id="phPrMsg"></div></div>
            <div class="php-fl" id="phPrFl"></div>
            <div class="php-list" id="phPrList"></div>
            <p class="php-hint">뽑은 것을 <b>다 쓰거나 🗑 버리면</b> 다시 뽑을 수 있어요 · 몇 개인지는 제작 규칙대로</p>`;
        document.body.appendChild(el);
        q('phPrBack').onclick = closePhonePrinter;
        q('phPrFl').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; PR.k = b.dataset.k; paint(); };
        q('phPrList').onclick = e => { const b = e.target.closest('[data-go]'); if (b && !b.disabled) print(b.dataset.go); };
        return el;
    }
    async function load() {
        PR.list = []; PR.busy = new Set();
        q('phPrList').innerHTML = '<p class="php-empty">꺼내는 중…</p>';
        try { PR.list = await ownDesigns(); } catch (e) { console.warn('🖨 내 도안', e); }
        for (const e of PR.list) { try { if (await ownDesignBusy(e.id)) PR.busy.add(String(e.id)); } catch (er) {} }
        paint();
    }
    function paint() {
        const ks = Object.keys(KN).filter(k => PR.list.some(e => e.x && e.x.k === k));
        if (PR.k && !ks.includes(PR.k)) PR.k = '';
        q('phPrFl').innerHTML = `<button type="button" data-k=""${PR.k ? '' : ' class="on"'}>전체 ${PR.list.length}</button>` + ks.map(k => `<button type="button" data-k="${k}"${PR.k === k ? ' class="on"' : ''}>${KN[k][0]} ${PR.list.filter(e => e.x && e.x.k === k).length}</button>`).join('');
        const L = PR.list.filter(e => !PR.k || (e.x && e.x.k === PR.k));
        q('phPrList').innerHTML = L.length ? L.map(e => {
            const k = (e.x && e.x.k) || '', busy = PR.busy.has(String(e.id)), nm = (e.x && e.x.nm) || (KN[k] ? KN[k][1] : '도안');
            return `<div class="php-it"><span class="php-th">${e.th ? `<img src="${esc(e.th)}" alt="">` : (KN[k] || ['📐'])[0]}</span><span class="php-nm"><b>${esc(nm)}</b><small>${esc(window.ownRuleText ? ownRuleText(k) : '')}</small></span>`
                + (busy ? '<span class="php-in">🗄️ 서랍에 있어요</span>' : `<button type="button" class="php-go" data-go="${esc(e.id)}">🖨 뽑기</button>`) + '</div>';
        }).join('') : '<p class="php-empty">아직 뽑을 도안이 없어요<br>＋ 새로 만들기로 만들면 📐 도안이 생겨요</p>';
    }
    async function print(id) {
        if (PR.going) return; PR.going = true;
        const e = PR.list.find(x => String(x.id) === String(id)), k = (e && e.x && e.x.k) || '';
        const box = q('phPrBox'), lcd = q('phPrLcd'), pap = q('phPrPaper'), msg = q('phPrMsg');
        box.classList.remove('done'); box.classList.add('go'); lcd.textContent = '뽑는 중…'; msg.innerHTML = '';
        pap.innerHTML = e && e.th ? `<img src="${esc(e.th)}" alt="">` : `<span>${(KN[k] || ['📐'])[0]}</span>`;
        q('phPrList').querySelectorAll('.php-go').forEach(b => { b.disabled = true; });
        const [sid] = await Promise.all([window.ownPrintDesign ? ownPrintDesign(id) : '', new Promise(r => setTimeout(r, 900))]);   // 지이잉 (종이가 나오는 동안)
        PR.going = false; box.classList.remove('go');
        if (!sid || sid === 'busy') {
            lcd.textContent = '뽑지 못했어요';
            msg.innerHTML = sid === 'busy' ? '이 도안으로 뽑은 것이 <b>서랍에 아직 있어요</b>' : '⚠ 잠시 후 다시 해 주세요';
            box.classList.add('done'); load(); return;
        }
        if (window.buzz) buzz(10);
        PR.out = sid; box.classList.add('done'); lcd.textContent = '다 뽑았어요';
        msg.innerHTML = `<b>🗄️ 서랍에 ${esc(window.ownRuleText ? ownRuleText(k) : '')} 들어갔어요</b><button type="button" id="phPrUse">📌 바로 꺼내 쓰기</button>`;
        q('phPrUse').onclick = () => { const s = PR.out; closePhonePrinter(); if (window.craftUseMine) craftUseMine(s); };
        if (window.craftRefresh) craftRefresh();
        load();
    }
    function openPhonePrinter(k) {
        if (!window.ownDesigns) { if (window.comingSoon) comingSoon('🖨 프린터'); return; }
        const el = build(); PR.on = true; PR.k = KN[k] ? k : ''; PR.out = null;
        const box = q('phPrBox'); box.classList.remove('go', 'done'); q('phPrLcd').textContent = '뽑을 도안을 골라요'; q('phPrMsg').innerHTML = ''; q('phPrPaper').innerHTML = '';
        el.classList.add('show'); load();
    }
    function closePhonePrinter() { const el = q('phPr'); if (el) el.classList.remove('show'); PR.on = false; if (window.craftRefresh) craftRefresh(); }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && PR.on && !document.querySelector('.modal[style*="flex"]')) closePhonePrinter(); });
    window.openPhonePrinter = openPhonePrinter; window.closePhonePrinter = closePhonePrinter; window.phonePrinterOn = () => PR.on;
})();
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['phoneprint'] = true;
