/* 말랑달콤 다이어리 - js/gdtry.js
   🏪 문구 사용해보기 = 가상 연습장 (도련 11-12)
   - 샵의 문구 [사용해보기] → 화면 가득 펼친 연습장 · 그 문구를 손에 들고 바로 써 봐요 (버튼 없이 · 한 줄 안내)
   - 진짜와 가상은 따로예요 : 진짜 다이어리 · 문구함 · 드라이브 · 스티커 서랍과 아무 상관이 없어요 · 저장 없음 · 닫으면 다 사라져요
   - 크기 = 진짜 다이어리 페이지와 같은 비율 (페이지 440 × 640 · 문구는 🧁 상품공방 크기 그대로 · js/gdpic.js)
   - 문구마다 준비물 : ✏️ 필기구 · 🖍 형광펜 = 빈 종이 · 🧽 지우개 = 미리 쓴 글씨 · 📏 자 = 자 + 검정 펜 (자 옆을 따라 곧게) + 샘플 스티커 + 칼 (자에 대고 반듯하게 자르기 · 도련 11-13 : 자를 만든 까닭)
     🔪 칼 = 샘플 스티커 (끌어서 자르기) · ✂️ 가위 = '모조지스티커' 샘플 모조지 (빙 둘러 오리기) + 🪡 핀셋 (떼어 붙이기) + 사용법 쪽지 (도련 11-13) · 🪡 핀셋 = 샘플 스티커 셋 (집어 옮기기)
     📎 집게 = 종이 가장자리에 꽂기 · 🩹 양면테이프 = 끌어서 바르기 · 🕳️ 펀칭기 = 구멍 막힌 바인더 속지 (왼쪽 구멍 자리)
   - 🏠 공간 나누기 (도련 11-12 · js/space.js) : 연습장 = '저장하지 않는 공간' · 문구 기능은 진짜 다이어리와 같은 함수를 빌려 써요
     ✏️ 필기구 · 🖍 형광펜 · 🧽 지우개 · 📏 자 = js/draw.js · js/ruler.js 그대로 (펜꽂이 · 손 · 자에 붙이기 · 꽂으면 그림 하나)
     🩹 양면테이프 · 📎 집게 · 🕳️ 펀칭기 = js/skins.js 문구 그대로 (들기 · 바르기 · 테두리에 꽂기 · 바인더 구멍 12칸)
     🔪 칼 = js/stkcut.js 그대로 (샘플 스티커를 끝에서 끝까지 그으면 두 조각) · ✂️ 가위 = js/skins.js 가위 + js/papermaker.js 모조지 그대로 (샘플 모조지를 빙 둘러 오려요)
     🪡 핀셋 = js/elements.js 스티커 옮기기 그대로 (샘플 스티커 셋 · 씰처럼 떼어 옮기고 · 돌리기)
   - 붙이기도 진짜와 하나 (js/elements.js addImage = 지금 공간의 종이에) · 이 파일엔 가상 종이 · 샘플 · 여닫기만 있어요 (문구 기능은 없어요)
   ※ 이 파일이 없어도 샵은 예전처럼 확대로 보여요 (js/basket.js shZoom) */
(function () {
    const PW = 439, PH = 644;                                                     // 다이어리 한 쪽 = 진짜 다이어리 페이지 크기 그대로 (#canvasArea 878 × 644 의 반 · 도련 11-12 : 실제보다 크면 안 돼요)
    const TIP = {
        pen: '✏️ 종이 위를 끌어서 써 보세요', hi: '🖍 끌어서 칠해 보세요', erase: '🧽 쓴 글씨를 문질러 지워 보세요',
        ruler: '📏 자를 대고 그어 보세요 · 🔪 칼로 스티커도 반듯하게', knife: '🔪 스티커 위를 끌어서 잘라 보세요', scissors: '✂️ 모조지 위를 빙 둘러 오려 보세요',
        tweez: '🪡 스티커를 집어서 옮겨 보세요', clip: '📎 종이 가장자리에 꽂아 보세요', tape: '🩹 끌어서 테이프를 발라 보세요', punch: '🕳️ 가운데 구멍 자리를 눌러 뚫어 보세요'
    };
    const PENS = { pen: 1, hi: 1, erase: 1, ruler: 1 };                           // 그중 펜꽂이 필기구
    let G = null;                                                                 // 지금 연습장 (닫으면 null · 아무것도 남지 않아요)

    /* 🎀 샘플 그림 (앱 안에서 바로 그려요 · 받을 것 없음) */
    const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    const STK = [
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110"><path d="M60 104C20 76 4 54 4 32 4 15 17 4 32 4c12 0 22 7 28 18C66 11 76 4 88 4c15 0 28 11 28 28 0 22-16 44-56 72z" fill="#ff9ec1" stroke="#fff" stroke-width="7"/><circle cx="42" cy="46" r="5" fill="#5a3a44"/><circle cx="78" cy="46" r="5" fill="#5a3a44"/><path d="M50 60q10 9 20 0" stroke="#5a3a44" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="60" r="7" fill="#ffd0e0"/><circle cx="88" cy="60" r="7" fill="#ffd0e0"/></svg>'),
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><path d="M60 6l15 33 36 4-27 24 8 36-32-19-32 19 8-36L9 43l36-4z" fill="#ffd36b" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><circle cx="48" cy="58" r="4.5" fill="#6a4a2a"/><circle cx="72" cy="58" r="4.5" fill="#6a4a2a"/><path d="M53 70q7 6 14 0" stroke="#6a4a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>'),
        svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 130"><ellipse cx="42" cy="34" rx="13" ry="30" fill="#fff" stroke="#f3b6c8" stroke-width="5"/><ellipse cx="78" cy="34" rx="13" ry="30" fill="#fff" stroke="#f3b6c8" stroke-width="5"/><circle cx="60" cy="82" r="42" fill="#fff" stroke="#f3b6c8" stroke-width="6"/><circle cx="46" cy="78" r="5" fill="#4a3a40"/><circle cx="74" cy="78" r="5" fill="#4a3a40"/><circle cx="36" cy="92" r="7" fill="#ffd0e0"/><circle cx="84" cy="92" r="7" fill="#ffd0e0"/><path d="M54 92q6 6 12 0" stroke="#4a3a40" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>')
    ];
    function paperDraw(c) {                                                       // ✂️ 샘플 모조지 (분홍 바탕 · 하얀 물방울 · 작은 하트)
        const x = c.getContext('2d'), W = c.width, H = c.height;
        x.fillStyle = '#ffc9dc'; x.fillRect(0, 0, W, H);
        for (let j = 0; j < H / 22 + 1; j++) for (let i = 0; i < W / 22 + 1; i++) {
            const cx = i * 22 + (j % 2 ? 11 : 0), cy = j * 22;
            if ((i + j) % 3) { x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, 4, 0, 7); x.fill(); }
            else { x.fillStyle = '#ff7aa8'; x.font = '12px sans-serif'; x.fillText('♥', cx - 5, cy + 4); }
        }
        rrPath(x, W / 2 - 92, 22, 184, 42, 14); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 3; x.strokeStyle = '#ff8fb4'; x.stroke();   // 🏷 '모조지스티커' 이름 (도련 11-13 : 가위로 오리는 건 모조지스티커)
        x.fillStyle = '#e0507f'; x.font = 'bold 22px "Jua", "Gowun Dodum", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('모조지스티커', W / 2, 44);
    }

    /* 🧭 여는 곳 (js/basket.js shZoom) */
    function gdTry(id) {
        const p = window.gdPic && gdPic(id); if (!p) return false;
        const g = p.g;
        gdTryOff();
        if (window.penOn && penOn()) penDone(); if (window.gdLetGo) gdLetGo();      // ✏️ 다이어리에서 쓰던 것 · 든 문구는 다이어리에 두고 (연습장과 섞이지 않게)
        const one = g !== 'punch' && UI.phone();                                  // 📱 폰 = 한 쪽 · 🕳️ 펀칭 = 바인더를 연 두 쪽 (가운데 구멍 자리)
        const W = one ? PW : PW * 2;
        const r = document.createElement('div'); r.id = 'gdTry'; r.className = 'gdt';
        r.innerHTML = `<div class="gdt-st" style="width:${W}px;height:${PH}px">
                <div class="gdt-book${one ? ' one' : ''}">${one ? '<i class="gdt-pg"></i>' : '<i class="gdt-pg l"></i><i class="gdt-pg r"></i>'}</div>
                <div class="gdt-page"></div>${g === 'punch' ? `<span class="dy-holes">${'<i></i>'.repeat(12)}</span>` : ''}
            </div>
            <div class="gdt-tip"${g === 'knife' || g === 'scissors' ? ' hidden' : ''}>${TIP[g] || '✨ 써 보세요'}</div><button type="button" class="desk-shop-go gdt-x">닫기</button>`;   // 🔪 ✂️ 진짜 칼 · 모조지가 위에 제 안내를 한 줄 띄워요 (안내는 하나만)
        document.body.appendChild(r);
        const st = r.querySelector('.gdt-st');
        G = { id, g, W, one, r, st, page: r.querySelector('.gdt-page'), k: 1, z0: typeof zIndexCounter !== 'undefined' ? zIndexCounter : null };
        if (g === 'punch') st.classList.add('dy-bdl', 'dy-bo');                    // 바인더 링을 연 두 쪽 = 가운데 구멍 자리 12칸 (js/skins.js gdHoles)
        document.body.classList.add('gdt-on');
        r.querySelector('.gdt-x').onclick = gdTryOff;
        st.addEventListener('pointerdown', down);
        fit();
        G.sp = { page: () => G.page, host: () => G.st, book: () => G.st, open: () => true, rect: p => p.getBoundingClientRect(), keep: false };
        spUse(G.sp);                                                              // 🏠 연습장 = 저장하지 않는 공간 (닫으면 진짜 다이어리로)
        start();
        return true;
    }
    function gdTryOff() {                                                         // 🧹 닫으면 다 사라져요 (가상)
        if (G) {
            if (penOn()) penClose(); gdLetGo(); if (window.skKindNow && skKindNow()) skClose(); if (typeof pmS !== 'undefined' && pmS.on) closePaperSheet(); if (G.rl && rlOn()) rlEnd();
            if (typeof selectedElement !== 'undefined' && selectedElement && G.page.contains(selectedElement)) { selectedElement = null; if (typeof updateTextPanel === 'function') updateTextPanel(); }
            if (G.z0 != null) zIndexCounter = G.z0;                               // 🧱 진짜 다이어리 겹침 번호 그대로
            spUse(null);                                                          // 🏠 다시 진짜 다이어리 공간으로
        }
        const r = document.getElementById('gdTry'); if (r) r.remove(); G = null; document.body.classList.remove('gdt-on', 'gdt-rk');
    }
    /* 📦 문구마다 준비물 → 그 문구를 손에 (진짜 기능 그대로) */
    function start() {
        const g = G.g, b0 = G.page.getBoundingClientRect(), mx = b0.left + b0.width * (G.one ? .5 : .75), my = b0.top + b0.height * .5;   // 보이는 오른쪽 쪽 가운데
        const cx = G.one ? PW / 2 : PW * 1.5;                                     // 오른쪽 쪽 가운데 (종이 자리)
        if (g === 'knife') {                                                      // 🔪 샘플 스티커 하나 → 칼을 손에 (js/stkcut.js · 문구함 '칼' 서랍과 같게)
            stick(STK[0], cx - 95, PH / 2 - 100, 190);
            G.again = () => { skKnife(mx + 90, my - 40, G.id.slice(6)); skHold(true); }; G.again(); return;
        }
        if (!PENS[g]) {                                                           // 🪡 📎 🕳️ 🩹 ✂️ = 판에 놓고 바로 손에 (js/skins.js gdPick · gdHold)
            if (g === 'tweez') STK.forEach((u, i) => stick(u, (G.one ? 40 : PW + 30) + i * 125, 220 + (i % 2) * 110, 100));   // 🎀 샘플 스티커 셋
            gdPick(G.id); gdHold(G.id, b0.left + b0.width * (G.one ? .5 : .62), b0.top + b0.height * .55);
            if (g === 'scissors') { const c = document.createElement('canvas'); c.width = 360; c.height = 420; paperDraw(c); openPaperSheet(c.toDataURL()); scsMore(); }   // ✂️ 샘플 모조지 (js/papermaker.js) + 🪡 핀셋 · 사용법
            return;
        }
        const pen = g === 'ruler' ? (gdPicOf('pen').find(x => /333|000|black/i.test(x.id)) || gdPicOf('pen')[0] || {}).id : G.id;   // 📏 자 = 검정 펜과 함께
        const one = window.pkCupOne && pkCupOne(pen); if (!one) return;
        G.sp.cup = [one]; G.again = e => { if (!penOn()) drawWith(pen, e.clientX, e.clientY); };   // ✏️ 펜꽂이 = 써 볼 것 하나
        if (g === 'erase') penAttach(SCRIBBLE(G.one ? [70] : [70, PW + 70]));   // 🧽 미리 쓴 글씨 (진짜 펜 그림 그대로)
        if (g === 'ruler') { G.rl = !rlOn(); rlShow(b0.left + b0.width / 2, b0.top + b0.height * .4, G.id.replace(/^ruler:/, '')); }   // 📏 진짜 cm 길이 = 펼친 두 쪽 가운데
        drawWith(pen, mx + 40, my + 120);
        if (g === 'ruler') rulerKnife(b0);
    }
    /* ✂️ + 🪡 가위로 오린 모조지스티커는 핀셋으로 떼어 붙여요 (도련 11-13) : 페이지에 핀셋을 놓고 (톡 = 손에 · js/skins.js gdPick) · 왼쪽 쪽에 사용법 쪽지 */
    function scsMore() {
        const tw = ((window.gdPicOf ? gdPicOf('tweez') : [])[0] || {}).id;
        if (tw && !gdEl(tw)) { gdPick(tw); const el = gdEl(tw); if (el) gdCenter(el, G.one ? PW * .2 : PW * .22, PH * .8); }   // 🪡 왼쪽 아래 (모조지에 안 가리게)
        const n = document.createElement('div'); n.className = 'gdt-note' + (G.one ? ' one' : '');
        n.innerHTML = '<b>✂️ 가위 사용법</b><span>① 가위로 모조지 위를 빙 둘러 그려 처음 자리로 돌아오면 오려져요</span><span>② 🪡 핀셋을 톡 해서 들어요</span><span>③ 오린 조각을 핀셋으로 집어 떼어 페이지에 붙여요</span>';
        G.st.insertBefore(n, G.page);                                            // 붙인 스티커가 쪽지 위로
    }
    /* 📏 + 🔪 자를 만든 까닭 (도련 11-13) : 칼만으로는 스티커가 똑바로 안 잘려요 → 자를 대고 반듯하게
       샘플 스티커 하나 + 놓인 칼 (✏️ 펜을 든 채 시작 · 칼을 톡 = 칼을 들어요 · 펜꽂이 톡 = 다시 펜 · js/stkcut.js 자에 붙이기 그대로) */
    function rulerKnife(b0) {
        const kn = (window.gdPicOf ? gdPicOf('knife') : [])[0]; if (!kn || !window.skKnife) return;
        const sx = PW * .6, sy = PH * .5;                                         // 스티커 = 왼쪽 쪽 · 자 아래쪽 가장자리가 스티커 위를 지나가요 (📱 한 쪽이면 그 쪽)
        stick(STK[0], sx - 85, sy - 80, 170);
        const k = b0.width / G.W;                                                  // 화면에 줄어든 만큼
        skKnife(b0.left + (sx + 120) * k, b0.top + (sy + 130) * k, kn.id.slice(6));   // 🔪 스티커 옆에 놓인 칼 (톡 = 손에)
        document.body.classList.add('gdt-rk');                                      // 안내는 아래 한 줄만 (칼 안내 띠는 숨겨요 · css/gdtry.css)
    }
    function stick(src, x, y, w) {                                                // 🎀 샘플 스티커 붙이기 (진짜 붙이기 그대로 · js/elements.js addImage · 저장 없는 공간)
        if (!addImage(src)) return;
        const el = G.page.lastElementChild;
        el.style.width = w + 'px'; Object.assign(el.dataset, { posX: x, posY: y, scale: 1, rotation: 0 });
        el.style.transform = `translate(${x}px, ${y}px) scale(1) rotate(0deg)`; el.classList.remove('selected');
    }
    const SCRIBBLE = xs => xs.flatMap(x0 => [180, 250, 320].map((y0, j) => {   // 꼬불꼬불 손글씨 세 줄
        const pts = []; for (let i = 0; i <= 70; i++) { const x = x0 + i * 4.2; pts.push([x, y0 + Math.sin(x / 7 + j) * 9 + Math.sin(x / 23) * 5]); }
        return { tool: 'pen', color: '#3a3a4a', w: 3, pts };
    }));
    function fit() {
        if (!G) return;
        const k = Math.min(1, (innerWidth - 24) / G.W, (innerHeight - 110) / PH);   // 진짜 크기 그대로 · 화면이 작으면 그만큼만 줄여요 (위 닫기 · 아래 안내 자리)
        G.k = k; G.st.style.transform = `translate(${(innerWidth - G.W * k) / 2}px, ${Math.max(46, (innerHeight - PH * k) / 2 - 10)}px) scale(${k})`;
    }
    addEventListener('resize', fit);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && G) gdTryOff(); });
    function down(e) {                                                            // ✏️ 꽂고 나서 · 🔪 ✕ 로 내려놓고 종이를 누르면 다시 손에 (나머지는 놓인 문구를 누르면 들어요 · js/skins.js gdDown)
        if (!G || e.button > 0 || !G.again || (G.g === 'knife' && skKindNow()) || document.body.classList.contains('sk-held')) return;   // 🔪 칼을 든 동안은 칼이 (📏 자 연습장)
        G.again(e);
    }

    window.gdTry = gdTry; window.gdTryOff = gdTryOff;
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['gdtry'] = true;
