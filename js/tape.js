/* 말랑달콤 다이어리 - js/tape.js
   🎀 마스킹테이프 : 반투명 종이테이프를 다이어리에 붙여요 (✏️ 스티커 창 → 🎀 마스킹테이프)
   - 사진 모서리나 글 위에 붙이면 '다꾸' 느낌이 나요
   - 붙인 뒤 ↔ 손잡이를 끌면 무늬는 그대로, 길이만 늘었다 줄었다 해요 (🔄 돌리기 · ↘ 크기는 다른 그림과 같아요)
   - 테이프는 그림(SVG)으로 일기에 담겨요 → 파일 없음 · 나중에 무늬를 고쳐도 이미 붙인 테이프는 그대로
   - 🎒 유한 스티커 (10-25) : 🧺 바구니의 테이프 한 롤 = placeTape(그림, own) · 붙인 길이만큼 롤이 줄어요 (js/own.js ownQty)
     ↔ 로 늘이면 늘인 만큼 더 줄고 · 줄여도 돌아오지 않아요(뜯어낸 테이프) · 롤이 남은 만큼만 늘어나요 · 다시 열었을 때(저장된 테이프)는 줄이기만 돼요 (js/elements.js)
   ※ 이 파일이 없어도 다이어리는 정상 동작 (마스킹테이프 칸만 안 보여요) */

        const TAPE_MARK = 'malang-tape';
        /* 🧁 테이프 무늬는 모두 서버 상품이에요 (상품공방 · 도련 11-02 : 예전 TAPES · TAPES_FREE 는 기본상품샵/마스킹테이프/00_AI기본 으로 옮겼어요 · 선물 테이프 = 상품 속성 '선물')
           이 파일 = 테이프 한 칸 그림(t.p)을 늘어나는 테이프 그림으로 (tapeSvg) + 페이지에 붙이기 (placeTape) */
        /* 테이프 그림 : 크기를 정하지 않은 SVG → 길이를 늘리면 무늬가 늘어나지 않고 더 이어져요 */
        function tapeSvg(t) {
            const pat = (t.p ? `<pattern id="p" width="${t.w}" height="${t.h}" patternUnits="userSpaceOnUse">${t.p}</pattern>` : '')
                + (t.grad ? '<linearGradient id="r" x2="0" y2="1">' + t.grad.map((c, i, a) => `<stop offset="${i / a.length}" stop-color="${c}"/><stop offset="${(i + 1) / a.length}" stop-color="${c}"/>`).join('') + '</linearGradient>' : '');
            return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><!--${TAPE_MARK}:${t.id}--><defs>${pat}`
                + '<pattern id="z" width="6" height="8" patternUnits="userSpaceOnUse"><path d="M0 0 L6 4 L0 8Z" fill="#000"/></pattern>'
                + '<pattern id="z2" width="6" height="8" patternUnits="userSpaceOnUse"><path d="M6 0 L0 4 L6 8Z" fill="#000"/></pattern>'
                + '<pattern id="g" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".5" fill="#fff" opacity=".35"/></pattern>'
                + '<mask id="m"><rect width="100%" height="100%" fill="#fff"/><rect width="6" height="100%" fill="url(#z)"/>'
                + '<svg x="100%" overflow="visible"><rect x="-6" width="6" height="100%" fill="url(#z2)"/></svg></mask></defs>'
                + `<g mask="url(#m)" opacity=".86"><rect width="100%" height="100%" fill="${t.bg}"/>${t.p ? '<rect width="100%" height="100%" fill="url(#p)"/>' : ''}${t.grad ? '<rect width="100%" height="100%" fill="url(#r)"/>' : ''}${t.extra || ''}`
                + '<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="1.5" fill="#fff" opacity=".45"/><rect y="100%" width="100%" height="1.5" transform="translate(0 -1.5)" fill="#000" opacity=".06"/></g></svg>';
        }
        const tapeUrl = t => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(tapeSvg(t));
        function isTapeSrc(src) { return String(src || '').indexOf(TAPE_MARK) >= 0; }

        /* 테이프 그림 하나를 다이어리에 붙이기 (🎀 마스킹테이프 · 🎀 내 마스킹테이프 공용) */
        function placeTape(url, own, at) {                                   // own = { id } : 🎒 내 테이프 롤 (붙인 길이만큼 줄어요) · at = { x1, y1, x2, y2 } 화면 자리 : 롤에서 뽑은 그대로 (js/basket.js dsPull)
            const left = own && window.ownQtyLeft ? ownQtyLeft(own.id) : 0;
            if (own && left < 20) { showMsg('🎀 이 테이프는 다 썼어요.'); return false; }
            if (!addImage(url)) return false;
            const el = document.querySelector('#canvasArea .element-box:last-child');
            const cv = document.getElementById('canvasArea'), cr = cv.getBoundingClientRect(), k = cr.width / (cv.offsetWidth || cr.width) || 1;
            const want = at ? Math.hypot(at.x2 - at.x1, at.y2 - at.y1) / k : 170, deg = at ? Math.round(Math.atan2(at.y2 - at.y1, at.x2 - at.x1) * 180 / Math.PI) : -8;
            const w = Math.round(own ? Math.min(want, left) : want);
            if (el) {
                el.style.width = w + 'px'; el.style.height = '30px'; el.dataset.rotation = deg; el.style.transform = el.style.transform.replace(/rotate\([^)]*\)/, `rotate(${deg}deg)`);
                if (at) {                                                        // 뽑은 테이프의 가운데에 (돌려도 가운데는 그대로)
                    const put = (x, y) => { el.dataset.posX = x; el.dataset.posY = y; el.style.transform = `translate(${x}px, ${y}px) scale(${el.dataset.scale || 1}) rotate(${deg}deg)`; };
                    put(0, 0); const b = el.getBoundingClientRect();
                    put(Math.round(((at.x1 + at.x2) / 2 - (b.left + b.width / 2)) / k), Math.round(((at.y1 + at.y2) / 2 - (b.top + b.height / 2)) / k));
                }
                selectElement(el);
            }
            if (own && el && window.ownQty) {
                el.dataset.own = own.id; el.dataset.ownUsed = w; el.dataset.ownMax = left;   // 이 테이프가 늘어날 수 있는 끝 = 롤에 남아 있던 만큼
                if (typeof saveData === 'function') saveData(false);
                ownQty(own.id, w, el).catch(er => console.warn('테이프 길이를 아직 못 줄였어요 (다시 해요) :', er));
            }
            if (window.stkBlink) stkBlink();
            return true;
        }

        window.isTapeSrc = isTapeSrc;
        window.placeTape = placeTape;
