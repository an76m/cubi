/* 말랑달콤 다이어리 - js/sharebox.js
   💾 파일로 저장 공통 : 파일 이름 · 만든 사람 묻기 (shxAsk) · .json 내려받기 (shxDownload)
   - 쓰는 곳 : 📤 공유 파일 (js/itemshare.js) · 💾 인형 파일 (js/doll-room.js) · 🎭 인형극 제목 (js/puppet.js)
   - 예전 스티커 · 배경지 공유 파일(malang_sticker · malang_pattern)과 공유받은 칸은 없앴어요 (도련 11-05 · 공유는 js/itemshare.js 하나) */

        const shxq = id => document.getElementById(id);
        const shxEsc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
        const shxTxt = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);

        /* 파일 이름 · 만든 사람 묻기 → { name, by } 또는 null */
        function shxAsk(title, defName, defBy, noBy, hint) {            // noBy : 만든 사람 칸 없이 (🎭 인형극 제목 묻기) · hint : 만든 사람 칸 아래 안내 
            return new Promise(resolve => {
                let nick = defBy || '';
                if (!nick) nick = nickGet();                                // ✏️ 지난번 닉네임 (js/drive.js)
                const el = document.createElement('div');
                el.className = 'shx-pop';
                el.innerHTML = `<div class="alert-card shx-card"><b class="shx-t">${shxEsc(title)}</b>
                    <label>파일 이름<input type="text" id="shxName" maxlength="40" value="${shxEsc(defName)}" enterkeyhint="next"></label>
                    ${noBy ? '<small>카페에 올릴 때 보이는 파일 이름이에요</small>' : `<label>만든 사람<input type="text" id="shxBy" maxlength="12" value="${shxEsc(nick)}" placeholder="닉네임 (안 써도 돼요)" enterkeyhint="done"></label>
                    <small>${hint || ''}</small>`}
                    <div class="alert-btns"><button type="button" class="btn btn-primary" data-ok>💾 저장</button><button type="button" class="btn" data-no>취소</button></div></div>`;
                document.body.appendChild(el);
                const done = ok => {
                    const name = shxTxt(shxq('shxName').value, 40).replace(/[\\/:*?"|.]/g, '').trim(), by = noBy ? '' : shxTxt(shxq('shxBy').value, 12);
                    if (ok && !name) { shxq('shxName').focus(); return; }
                    el.remove();
                    if (ok) nickSet(by);
                    resolve(ok ? { name, by } : null);
                };
                el.querySelector('[data-ok]').onclick = () => done(true);
                el.querySelector('[data-no]').onclick = () => done(false);
                shxq('shxName').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); if (noBy) done(true); else shxq('shxBy').focus(); } };
                if (!noBy) shxq('shxBy').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
            });
        }
        function shxDownload(obj, name) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([JSON.stringify(obj)], { type: 'application/json' }));
            a.download = name + '.json';
            document.body.appendChild(a); a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        }

        window.shxAsk = shxAsk; window.shxDownload = shxDownload;
