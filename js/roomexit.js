/* 말랑달콤 다이어리 - js/roomexit.js
   🚪 내 방 나가기 (도련 11-23 · 책상 오른쪽 위 '이동 ▾' → [내 방 나가기] · js/desk.js DKG_ITEMS)
   ① 로그인 때 보던 문 화면 (그림만 · 로그인 창 · 글씨 없이 · css/roomexit.css 가 같은 그림을 써요 · #driveGate 는 건드리지 않아요)
   ② 저장 못 한 것을 드라이브에 모두 올리며 게이지 (설정 · 책상 · 목록 = drive.js flushUpload · 모음 = coll.js collPump
      · 스티커 목록 = own.js ownSerial · 못 쓴 칸 ownReplay · 실물 목록 = mine.js mineFlush) · 기다리던 것만 올려요 (새 요청을 만들지 않아요)
      · ✅ 완료 전 다이어리 · 그림판 임시저장은 규칙대로 이 기기에만 (드라이브에 안 올려요 · 도련 11-15)
      · 못 올렸으면 묻기 [다시 저장] [그대로 나가기 = 이 기기에 보관 → 다음에 켜면 올려요 (drive.js savePending · recoverPendingBackup)]
   ② 게이지 양옆 = 로그인 화면 요정 둘 (#gateLoginBtn · #gateGuestBtn 의 .gf-fy 를 그대로 복사 · 파랑은 거울로 마주 봐요 · 1416)
   ③ 다 되면 게이지가 사라지고 다정한 인사 (요정 = 웃는 눈 · 요술봉 흔들기) → 문 화면 페이드아웃 → 🌙 어두운 화면 '불 꺼진 문' (팻말 살랑 · 하트 수면등 · 별 깜빡 · 글씨 없음 · 1416 도련 11-23 시안 C)
      → 4초 뒤 앱 끄기 (window.close) · 💻 설치한 앱 창 = 닫혀요 · 🌐 브라우저 탭은 못 닫아서 그 그림이 그대로 · 톡 = 다시 들어오기 (새로 열기)
      · 시안 = 인수인계 작업_1123_방나가기시안/ (예전 1413 카메라 아웃은 없앴어요)
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
        const fy = sel => { const g = document.querySelector(sel + ' .gf-fy'); return g ? g.outerHTML : ''; };   // 🧚 로그인 화면 요정 그대로 (index.html)
        el.innerHTML = '<div class="rx-scene"><div class="rx-mid">'
            + '<div class="rx-fy l"><svg viewBox="-1 -3 26 25" data-an="1" aria-hidden="true">' + fy('#gateLoginBtn') + '</svg></div>'
            + '<div class="rx-fy r"><svg viewBox="-1 -3 26 25" data-an="1" aria-hidden="true"><g transform="translate(24 0) scale(-1 1)"><g transform="translate(-51 0)">' + fy('#gateGuestBtn') + '</g></g></svg></div>'
            + '<div class="rx-gauge" role="progressbar" aria-label="저장" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i><u></u></i></div>'
            + '<div class="rx-hi"><b>오늘도 다꾸해 줘서 고마워요</b><small>푹 쉬고 또 만나요 <span>💗</span></small></div>'
            + '</div></div><div class="rx-night"></div>';
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

    /* 🌙 어두운 화면 '불 꺼진 문' (셀 애니 · 단색 + 진한 선 · 글씨 없음 · 도련 11-23 시안 C) */
    const NIGHT = '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" data-an="1" aria-hidden="true">'
        + '<rect width="1600" height="900" fill="#1d1724"/>'
        + '<g transform="translate(1110 470)"><circle class="rx-glow" r="150" fill="#5a3550"/><circle class="rx-glow g2" r="100" fill="#7a4467"/>'
        + '<path d="M0 40 C-50 5 -62 -18 -45 -36 -30 -50 -10 -44 0 -28 10 -44 30 -50 45 -36 62 -18 50 5 0 40Z" fill="#ffb3cd" stroke="#c8457a" stroke-width="7" stroke-linejoin="round"/>'
        + '<rect x="-14" y="38" width="28" height="22" rx="6" fill="#e8d4ee" stroke="#8a6aa8" stroke-width="5"/></g>'
        + '<path d="M560 860 V260 Q560 170 650 170 H890 Q980 170 980 260 V860" fill="#3b2d47" stroke="#5f4b72" stroke-width="10"/>'
        + '<rect x="610" y="250" width="320" height="250" rx="18" fill="none" stroke="#54426a" stroke-width="8"/><rect x="610" y="540" width="320" height="270" rx="18" fill="none" stroke="#54426a" stroke-width="8"/>'
        + '<g transform="translate(770 172)"><path d="M0 0 C-40 -36 -70 -10 -50 14 Z M0 0 C40 -36 70 -10 50 14 Z" fill="#e996b6" stroke="#b9577f" stroke-width="6" stroke-linejoin="round"/><circle r="12" fill="#f7b6cd" stroke="#b9577f" stroke-width="6"/></g>'
        + '<rect x="890" y="540" width="70" height="16" rx="8" fill="#d9b45e" stroke="#8f7232" stroke-width="5"/><circle cx="900" cy="548" r="16" fill="#e9c874" stroke="#8f7232" stroke-width="5"/>'
        + '<g class="rx-sway"><path d="M900 548 L862 610 M900 548 L938 610" stroke="#c9a3d6" stroke-width="4"/><rect x="826" y="606" width="148" height="104" rx="20" fill="#fff4e0" stroke="#9a6eaa" stroke-width="6"/>'
        + '<path d="M916 632 a28 28 0 1 0 20 46 a22 22 0 1 1 -20 -46z" fill="#ffe6a3" stroke="#d9b45e" stroke-width="4"/><path d="M866 648 l5 11 11 5 -11 5 -5 11 -5 -11 -11 -5 11 -5z" fill="#ffb3cd" stroke="#c8457a" stroke-width="2.5"/></g>'
        + '<rect x="0" y="860" width="1600" height="40" fill="#2a2236"/>'
        + '<g fill="#ffe9a8" stroke="#c9a85a" stroke-width="3"><path class="rx-tw" d="M300 220 l9 20 20 9 -20 9 -9 20 -9 -20 -20 -9 20 -9z"/><path class="rx-tw d1" d="M1350 180 l7 16 16 7 -16 7 -7 16 -7 -16 -16 -7 16 -7z"/><path class="rx-tw d2" d="M380 560 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6z"/></g>'
        + '</svg>';
    /* 💗 인사 → 페이드아웃 → 🌙 불 꺼진 문 → 앱 끄기 */
    async function leave(el) {
        el.classList.add('hi');                                                 // 인사 (요정 웃는 눈 · 요술봉)
        await wait(calm() ? 1500 : 2800);
        el.querySelector('.rx-night').innerHTML = NIGHT;
        el.classList.add('fade');                                               // 문 화면 페이드아웃
        await wait(calm() ? 400 : 1400);
        el.classList.add('night');                                              // 🌙 불 꺼진 문 (계속)
        el.addEventListener('pointerup', () => location.reload(), { once: true });   // 톡 = 다시 들어오기
        await wait(4000);
        try { window.close(); } catch (e) {}                                      // 💻 설치한 앱 창 = 닫혀요 · 🌐 탭은 그림 그대로
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
        h.innerHTML = '<svg class="rx-arw" viewBox="0 0 40 48" aria-hidden="true"><path d="M20 3 L35 21 L26 21 L26 42 Q26 45 23 45 L17 45 Q14 45 14 42 L14 21 L5 21 Z" fill="#ffb3cd" stroke="#c8457a" stroke-width="2.6" stroke-linejoin="round"/><path d="M17.5 25 L17.5 39" stroke="#ffe3ee" stroke-width="3" stroke-linecap="round"/></svg>'
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
