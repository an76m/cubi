/* 말랑달콤 다이어리 - js/roomexit.js
   🚪 내 방 나가기 (도련 11-23 · 책상 오른쪽 위 '이동 ▾' → [내 방 나가기] · js/desk.js DKG_ITEMS)
   ① 로그인 때 보던 문 화면 (그림만 · 로그인 창 · 글씨 없이 · css/roomexit.css 가 같은 그림을 써요 · #driveGate 는 건드리지 않아요)
   ② 저장 못 한 것을 드라이브에 모두 올리며 게이지 (설정 · 책상 · 목록 = drive.js flushUpload · 모음 = coll.js collPump
      · 스티커 목록 = own.js ownSerial · 못 쓴 칸 ownReplay · 실물 목록 = mine.js mineFlush) · 기다리던 것만 올려요 (새 요청을 만들지 않아요)
      · ✅ 완료 전 다이어리 · 그림판 임시저장은 규칙대로 이 기기에만 (드라이브에 안 올려요 · 도련 11-15)
      · 못 올렸으면 묻기 [다시 저장] [그대로 나가기 = 이 기기에 보관 → 다음에 켜면 올려요 (drive.js savePending · recoverPendingBackup)]
   ③ 다 되면 카메라가 문에서 뒤로 빠지며 (멀어지고 어두워져요) → 앱 끄기 (window.close)
      · 브라우저 탭은 스스로 못 닫을 수 있어요 → 어두운 화면에 남고 · 톡 = 다시 들어오기 (새로 열기)
   💗 버튼 없이 끈 다음 = 이동 ▾ 를 가리키는 화살표 (도련 11-23 · 1414) : 💻 📲 책상이 보이면 이 기기에 '켜 둠' 표시 (localStorage malang_rx_open)
      · 내 방 나가기 = 표시 지움 · 다음에 켤 때 표시가 남아 있으면 = 지난번엔 버튼 없이 껐어요 → 화살표 + 한 줄 (이동 ▾ 를 누르거나 · 화살표 톡 · 20초 = 사라져요)
      · 드라이브 요청 0 (이 기기 한 칸) · 새로고침 · 업데이트로 다시 열어도 버튼 없이 나간 것으로 봐요 · 📱 폰(하단 메뉴)은 버튼이 없어서 안 해요 */
(function () {
    let busy = false;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const calm = () => typeof calmMotion === 'function' && calmMotion();
    const D = () => (typeof drive !== 'undefined' ? drive : null);

    function build() {
        const el = document.createElement('div');
        el.id = 'roomExit'; el.className = 'rx';
        el.innerHTML = '<div class="rx-scene"><div class="rx-gauge" role="progressbar" aria-label="저장" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i><u></u></i></div></div>';
        document.body.appendChild(el);
        return el;
    }
    function setP(el, p) {
        p = Math.max(0, Math.min(100, Math.round(p)));
        const g = el.querySelector('.rx-gauge'); g.setAttribute('aria-valuenow', p);
        g.querySelector('u').style.width = p + '%';
    }

    /* 💾 기다리던 것 모두 올리기 → 다 올렸으면 true */
    async function saveAll(el) {
        const d = D(), t0 = Date.now();
        setP(el, 6);
        try { if (typeof saveOnScreenOff === 'function') saveOnScreenOff(); } catch (e) { console.warn('🚪 정리', e); }   // 편집 중인 것 → 메모리 · ⏸ 미뤄 둔 것 · 이 기기 보관 · 올리기 시작
        await wait(250); setP(el, 12);
        if (!d || d.guest || !d.ready || d.wiped) { await wait(700); setP(el, 100); return true; }   // 👀 구경 · 로그인 전 = 올릴 곳이 없어요
        /* ☁ 설정 · 책상 · 목록 (dirtyKeys 가 줄어드는 만큼 게이지) */
        const n0 = Math.max(1, d.dirtyKeys.size);
        const tick = setInterval(() => setP(el, 12 + 58 * (1 - d.dirtyKeys.size / n0)), 200);
        try { if (typeof flushUpload === 'function') await flushUpload(); } catch (e) { console.warn('🚪 올리기', e); }
        clearInterval(tick); setP(el, 70);
        /* 📚 모음 (내 도안 · 배경지 …) */
        try { if (window.collPump) await Promise.race([collPump(), wait(30000)]); } catch (e) { console.warn('🚪 모음', e); }
        setP(el, 80);
        /* 🎀 스티커 목록 · 스티커첩 · 다 못 쓴 칸 */
        try {
            if (typeof ownPendGet === 'function' && typeof ownReplay === 'function' && ownPendGet().some(p => !p.h)) await Promise.race([ownReplay(), wait(30000)]);
            if (typeof ownSerial === 'function') await Promise.race([ownSerial(() => {}), wait(30000)]);
        } catch (e) { console.warn('🚪 스티커', e); }
        setP(el, 90);
        /* 📦 받은 상품 실물 목록 */
        try { if (window.mineFlush) await Promise.race([mineFlush(), wait(30000)]); } catch (e) { console.warn('🚪 실물', e); }
        /* 그 사이 또 바뀐 것 (스티커 · 실물이 목록을 고쳤으면) */
        if (d.dirty) { try { await flushUpload(); } catch (e) {} }
        const left = 1200 - (Date.now() - t0); if (left > 0) { setP(el, 94); await wait(left); }   // 너무 빨리 끝나도 게이지가 차오르는 게 보이게 (1.2초쯤)
        setP(el, 100);
        return !d.dirty;
    }

    /* 🎥 카메라 아웃 → 앱 끄기 */
    async function leave(el) {
        el.classList.add('out');
        await wait(calm() ? 300 : 2300);
        el.classList.add('end');
        try { window.close(); } catch (e) {}                                      // 💻 설치한 앱 창 · 앱이 연 창 = 닫혀요
        await wait(400);
        el.classList.add('stay');                                               // 🌐 브라우저 탭은 스스로 못 닫아요 → 어두운 화면 그대로 · 톡 = 다시 들어오기
        el.addEventListener('pointerup', () => location.reload(), { once: true });
    }

    async function roomExit() {
        if (busy || document.getElementById('roomExit')) return;
        busy = true;
        try {
            if (window.deskReset) { try { deskReset(); } catch (e) {} }         // 🧹 떠 있던 창 · 꺼낸 것 제자리 (다른 곳에 갈 때와 같아요)
            const el = build();
            await wait(30); el.classList.add('on');                             // 🚪 문 화면이 스르르
            await wait(calm() ? 100 : 700);
            for (;;) {
                if (await saveAll(el)) break;
                el.classList.add('wait');
                const again = await showAsk('☁ 아직 저장하지 못한 게 있어요.<br><span style="font-size:12px;color:#777;">그대로 나가면 이 기기에 보관했다가 다음에 켤 때 저장해요.</span>', '다시 저장', '그대로 나가기');
                el.classList.remove('wait');
                if (!again) { try { if (typeof savePending === 'function') savePending(); } catch (e) {} break; }
                setP(el, 0);
            }
            try { localStorage.removeItem(RX_OPEN); } catch (e) {}              // 💗 잘 나갔어요 (다음에 켤 때 화살표 없음)
            await wait(450);
            el.classList.add('done');                                           // 게이지 스르르 사라짐
            await wait(calm() ? 50 : 450);
            await leave(el);
        } finally { busy = false; }
    }
    window.roomExit = roomExit;

    /* 💗 지난번에 버튼 없이 껐으면 = 이동 ▾ 를 가리키는 화살표 */
    const RX_OPEN = 'malang_rx_open';
    function rxHint() {
        const m = document.getElementById('deskMoveMenu'); if (!m || m.querySelector('.rx-hint')) return;
        const h = document.createElement('div'); h.className = 'rx-hint'; h.setAttribute('role', 'note');
        h.innerHTML = '<svg class="rx-arw" viewBox="0 0 40 48" aria-hidden="true"><path d="M20 3 L35 21 L26 21 L26 42 Q26 45 23 45 L17 45 Q14 45 14 42 L14 21 L5 21 Z" fill="#ffb3cd" stroke="#c8457a" stroke-width="2.6" stroke-linejoin="round"/><path d="M17.5 25 L17.5 39" stroke="#ffe3ee" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="34" r="3.2" fill="#fff" stroke="#c8457a" stroke-width="1.6"/><circle cx="9" cy="31" r="2.2" fill="#ffe28a" stroke="#c8457a" stroke-width="1.4"/></svg>'
            + '<span class="rx-tip">앱을 끌 땐 꼭 <b>내 방 나가기</b>로 나가 주세요 💗</span>';
        m.appendChild(h);
        const off = () => { if (!h.isConnected) return; h.classList.add('bye'); setTimeout(() => h.remove(), 350); };
        h.addEventListener('click', off);
        const b = document.getElementById('deskShopGo'); if (b) b.addEventListener('click', off, { once: true });
        setTimeout(off, 20000);
    }
    async function rxBoot() {
        for (let i = 0; i < 600; i++) {                                         // 로그인해서 책상이 보일 때까지 (5분까지)
            await wait(500);
            const d = D(), g = document.getElementById('driveGate'), b = document.getElementById('deskShopGo');
            if (!d || !(d.ready || d.local) || d.guest) continue;               // 👀 구경은 빼요
            if (!window.UI || !UI.desk() || (g && g.style.display !== 'none')) continue;
            if (!b || !b.getBoundingClientRect().width) continue;
            let was = false; try { was = localStorage.getItem(RX_OPEN) === '1'; localStorage.setItem(RX_OPEN, '1'); } catch (e) { return; }
            if (was) setTimeout(rxHint, 900);                                   // 문이 열리고 책상이 자리 잡은 뒤
            return;
        }
    }
    window.rxHint = rxHint;                                                    // 🔎 시험 · 점검
    rxBoot();
})();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['roomexit'] = true;
