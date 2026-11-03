/* 말랑달콤 다이어리 - js/stk-basic.js
   🏪 기본상품 샵 상품 (🎒 유한 스티커 10-25 · js/basket.js) : 처음부터 누구나 받는 기본 스티커
   - 🧁 모든 상품 = 서버 (도련 11-02 · 상품공방) · 이 파일엔 그림이 없어요 · 항목마다 P = 상품 속성 (P.선물 = 진열 안 함)
   - 🖼️ 개발자 그림 : Cloudflare 그림 보관함의 기본스티커 (js/elements.js basicKit) 중 씰 말고 나머지 종류
       🧩 조각 · 📄 모조지 = 숫자 폴더 1개가 한 묶음 (낱장 폴더는 그림 1개가 한 묶음) · 🎀 테이프 · 🧻 떡메 · 📃 속지 · 📝 메모지 = 그림 1장이 1종
       📄 모조지 = 받은 그림 한 장이 종이 한 장 (도련 10-29 · 모양 · 배경 구분 없음 · ✂️ 오리기 · 🪡 통째로 떼기 둘 다)
   - sbShelf(종류) → 기본상품 샵 칸 [{ cnt, look, thumbs, bigs, sec, take() }] · take() = 받을 때 그림을 받아 내 종이로 (js/own.js ownTake)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (기본 칸만 '준비 중') */

    (function () {                          // 이름이 다른 파일과 겹치지 않게 이 안에만
        /* 🧁 예전에 제가 그린 조각 봉투 · 모조지 그림(ICON · SB_BAGS · SB_SHEETS)은 상품공방으로 옮겼어요 (도련 11-02 · 기본상품샵/조각스티커 · 모조지스티커/00_AI기본) */
        /* 🖼️ 여러 개 묶음 미리보기 (씰 종이 · 조각 · 모조지스티커 같은 모양) : 작은 칸에 최대한 많이 · 2줄 · 넘치는 건 안 보여요 (개수는 카드 글씨가 총개수) */
        const SRV = { piece: null, paper: null, tape: null, tk: null, leaf: null, memo: null }, sbCache = new Map();   // 받은 목록 · 그림 (앱을 켠 동안)
        const kitCat = c => (window.kitName ? kitName(String(c || '')) : String(c || '')).slice(0, 24);   // '1. 동물' → '동물'
        const esc = htmlEsc;   // 🧰 js/util.js
        const kitAt = (u, w) => window.kitSize ? kitSize(u, w) : u;           // 크기에 맞는 주소 (js/elements.js)
        const thumb = (u, w) => kitAt(u, w || 160);
        async function sbList(kind) {                                   // [{ c, urls }] (묶음) · [{ c, url }] (1장) · c = 카테고리 (그대로 · 화면에는 앞 번호 뺀 이름)
            if (SRV[kind]) return SRV[kind];
            if (!window.basicKit) return [];
            const k = await basicKit(), a = Array.isArray(k.kits && k.kits[kind]) ? k.kits[kind] : [];
            return (SRV[kind] = a.map(x => {
                if (!x) return null;
                const c = String(x.c || '').slice(0, 40);
                if (Array.isArray(x.us)) return x.us.length ? { c, urls: x.us.slice(0, 30), pv: x.pv || null, P: x.P || {} } : null;
                return x.u ? { c, url: x.u, P: x.P || {} } : null;
            }).filter(Boolean));
        }
        /* 주소 그림 → data 주소 · 한 번 받은 건 기억
           🗜 png · jpg · webp = 받은 파일 그대로 (서버 그림은 스티커 도구가 이미 줄였어요 · 96색 무손실 WebP 를 다시 굽지 않아요 · 도련 11-04)
              svg 처럼 그대로 못 쓰는 것만 굽기 (cvSmall : 크롬 WebP 0.9 · 사파리 투명 PNG / 불투명 JPG) · jpeg = 예전 이름 (지금은 안 써요) */
        function sbData(url, jpeg) {
            if (sbCache.has(url)) return sbCache.get(url);
            const p = new Promise((ok, no) => {
                const im = new Image(); im.crossOrigin = 'anonymous';
                im.onload = () => {
                    const w = im.naturalWidth, h = im.naturalHeight;
                    const bake = () => {
                        try {
                            const c = document.createElement('canvas'); c.width = w; c.height = h;
                            c.getContext('2d').drawImage(im, 0, 0);
                            ok({ src: cvSmall(c), w, h });
                        } catch (e) { no(e); }
                    };
                    if (/\.svg(\?|$)/i.test(url)) { bake(); return; }
                    fetch(im.src).then(r => r.ok ? r.blob() : null).then(b => {
                        if (!b || !/^image\/(png|jpeg|webp)$/.test(b.type)) { bake(); return; }
                        const r = new FileReader(); r.onload = () => ok({ src: String(r.result), w, h }); r.onerror = bake; r.readAsDataURL(b);
                    }).catch(bake);
                };
                im.onerror = () => no(new Error('load'));
                im.src = url;
            });
            p.catch(() => sbCache.delete(url));
            sbCache.set(url, p);
            return p;
        }
        const sbDie = url => window.pelBake ? pelBake(url) : sbData(url).then(d => d.src);   // 하얀 다이컷 테두리 (js/stickerpeel.js)
        /* =====================================================================
           🏪 기본상품 샵 상품 (🎒 유한 스티커 10-25 · js/basket.js) : 기본스티커(Cloudflare) + 제가 그린 봉투 · 모조지
           kind = 'piece' · 'paper' · 'tape' · 'tk' · 'leaf' · 'memo' · 카테고리 · 이름 없이 (도련 10-25 : 현실 문구점도 그렇게 팔아요)
           → [{ cnt : 개수 글, look : 'grid' · 'tape' · 'tkimg' · 'leafimg' · 'memoimg' · 'sheet', thumbs : [작은 그림], bigs : [🔍 확대 그림], sec : 모조지 '모양' · '배경', take() → ownTake 에 넘길 종이 }]
           ===================================================================== */
        const sbOwnK = { piece: 'piece', paper: 'paper', tape: 'tape', tk: 'tk', leaf: 'leaf', memo: 'memo' };
        async function sbShelf(kind) {
            const out = [], k = sbOwnK[kind];
            let list = []; try { list = await sbList(kind); } catch (e) {}
            const okN = v => +v > 0, okC = v => /^#[0-9a-f]{6}$/i.test(v || '');   // 🔎 상품 값은 상품공방이 정해요 (도련 11-02 · 빠지면 그 상품은 안 나와요 · 앱은 짐작하지 않아요)
            const need = { tape: P => okN(P.롤길이) && okN(P.테이프폭), tk: P => okN(P.묶음장수) && okC(P.풀칠색), memo: P => okN(P.묶음장수) && okC(P.글자색), leaf: P => okN(P.묶음장수) }[kind];
            list.filter(x => !(x.P && (x.P.선물 || x.P.스토어))).filter(x => !need || need(x.P || {}) || (console.warn('🧁 상품 속성이 모자라요 :', kind, x.P && x.P.id), false)).reverse().forEach(x => {     // 🎁 선물 전용(이벤트 · 저금통) · 💎 스토어(유료)는 무료 샵에 진열 안 해요                              // 새로 들어온 것(뒤 번호)이 맨 앞 (신상 매대처럼 · 도련 10-25)
                const urls = x.urls || [x.url], bigs = urls.map(u => thumb(u, 360));
                if (kind === 'piece') out.push({ bigs, pv: x.pv, cnt: `조각 ${urls.length}개`, look: 'grid', thumbs: urls.map(u => thumb(u, 96)),
                    take: async () => ({ k, imgs: await Promise.all(urls.map(u => sbDie(kitAt(u, 600)))), baked: true }) });
                else if (kind === 'paper') out.push({ bigs, cnt: '모조지 한 장', look: 'sheet', thumbs: [thumb(urls[0], 240)],   // 📄 받은 그림 한 장 = 모조지 한 장 (도련 10-29 · 모양 · 배경 구분 없음 · 오릴지 통째로 뗄지는 다꾸러가)
                    take: async () => ({ k, imgs: [(await sbData(kitAt(urls[0], 1200))).src] }) });
                else if (kind === 'tape') out.push({ bigs, cnt: '한 롤', look: 'tape', thumbs: [thumb(x.url, 240)],   // 🎀 한 롤 길이 · 폭 = 상품 (롤길이 · 테이프폭)
                    take: async () => { const d = await sbData(kitAt(x.url, 'h120')), h = +x.P.테이프폭, w = Math.max(6, Math.round(h * d.w / d.h * 10) / 10);
                        const u = tapeUrl({ id: 'b-' + collHashS(x.url), name: '', bg: 'none', w, h, p: `<image href="${d.src}" width="${w}" height="${h}" preserveAspectRatio="none"/>` });
                        return { k, imgs: [u], th: u, q0: +x.P.롤길이 }; } });
                else if (kind === 'tk') out.push({ bigs, cnt: `${+x.P.묶음장수}장`, look: 'tkimg', thumbs: [thumb(x.url, 200)],   // 🧻 한 묶음 · 풀칠 띠 색 = 상품
                    take: async () => ({ k, imgs: [(await sbData(kitAt(x.url, 600))).src], q0: +x.P.묶음장수, x: { pad: 'my', glue: x.P.풀칠색 } }) });
                else if (kind === 'leaf') out.push({ bigs, cnt: `${+x.P.묶음장수}장`, look: 'leafimg', thumbs: [thumb(x.url, 240)],
                    take: async () => ({ k, imgs: [(await sbData(kitAt(x.url, 900), true)).src], q0: +x.P.묶음장수, x: { lf: 'my' } }) });
                else if (kind === 'memo') out.push({ bigs, cnt: `${+x.P.묶음장수}장`, look: 'memoimg', thumbs: [thumb(x.url, 120)],   // 📝 한 묶음 · 글자색 = 상품
                    take: async () => { const d = await sbData(kitAt(x.url, 600)); return { k, imgs: [d.src], q0: +x.P.묶음장수, x: { pp: 'img', w: d.w, h: d.h, tc: x.P.글자색 } }; } });
            });
            return out;
        }
        const collHashS = s => { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
        /* 🎁 선물 전용 테이프 (이벤트 · 저금통 · 상품공방 '선물') : [{ id, name, url }] */
        let sbGift = null;
        async function sbGiftTapes() { return (sbGift = (await sbList('tape')).filter(x => x.P && x.P.선물).map(x => ({ id: String(x.P.id || ''), name: String(x.P.이름 || ''), url: x.url }))); }
        const sbGiftTapesNow = () => sbGift || [];                                      // 받기 전이면 [] (이름 대신 id 가 보여요)
        window.sbShelf = sbShelf; window.sbDie = sbDie; window.sbGiftTapes = sbGiftTapes; window.sbGiftTapesNow = sbGiftTapesNow;
    })();

/* 이 파일을 끝까지 문제없이 읽었다는 표시 */
(window.MALLANG_LOADED = window.MALLANG_LOADED || {})['stk-basic'] = true;
