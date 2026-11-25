/* 말랑달콤 다이어리 - js/tempsave.js
   💾 임시보관 공통 (도련 11-15) : 📔 다이어리 · 🎨 태블릿 그림판 앱 6개 (📱 폰 그림판도) 가 같이 써요
   - 임시보관 = 이 기기 브라우저 저장공간(IndexedDB)에만 · 구글 드라이브는 ✅ 완료 때만
   - ⏱ 자동 임시보관 = TS.ms 마다 (바뀐 게 있을 때만) + 앱을 내릴 때 · 💾 임시보관 버튼 = 지금 바로 · 둘 다 같은 '저장'
   - ✕ 닫기 = 물어봐요 [💾 임시보관] [그냥 닫기] (tsCloseAsk)
       💾 임시보관 = 지금 모습을 이 기기에 저장하고 닫기 (다시 열면 이어서)
       그냥 닫기 = 마지막 저장(수동 · 자동) 뒤에 한 것은 버리고 닫기 (새 창 = 아무것도 안 남아요 · 쓴 스티커 · 종이도 저장한 때로 돌아가요)
       버튼 말고 물음 창이 닫히면 = 그대로 (닫지 않아요)
   - 화면마다 : tsAuto({ dirty, save }) 로 자동 저장을 맡기고 · 닫을 때 tsClose({ title, dirty, save, drop }) 하나로 물어보고 처리해요
   ※ util.js 다음 · 다이어리 · 그림판 코드보다 먼저 읽어요 */
const TS = { ms: 60000, hide: true };                                        // ⏱ 자동 임시보관 간격 (여기 한 곳만 고치면 세 곳 모두) · hide = 앱을 내릴 때도
const TS_ASK = '💾 임시보관 = 이 기기에만 저장하고 닫아요';   // 나머지 설명은 뺐어요 (도련 11-22)
function tsAuto(o) {                                                         // o = { dirty: () => 바뀐 게 있나, save: () => 이 기기에 저장 }
    const run = () => { try { if (o.dirty()) o.save(); } catch (e) { console.warn('💾 자동 임시보관', e); } };
    setInterval(run, TS.ms);
    if (TS.hide) { document.addEventListener('visibilitychange', () => { if (document.hidden) run(); }); addEventListener('pagehide', run); }
    return run;
}
async function tsCloseAsk(title) {                                           // → 'save' · 'drop' · '' (물음 창이 그냥 닫혔어요 = 닫지 않기)
    if (typeof showAsk !== 'function') return 'save';
    const a = await showAsk(`${title}<br><span style="font-size:12px;color:#777;">${TS_ASK}</span>`, '💾 임시보관', '그냥 닫기');
    return a === true ? 'save' : a === false ? 'drop' : '';
}
async function tsClose(o) {                                                  // o = { title, dirty, save (→ false = 못 했어요), drop } → true = 닫아도 돼요
    if (!(await o.dirty())) return true;
    const a = await tsCloseAsk(o.title);
    if (a === 'save') {
        let ok = true; try { ok = (await o.save()) !== false; } catch (e) { ok = false; }
        if (ok) return true;
        return typeof showAsk === 'function' ? !!(await showAsk('⚠ 임시보관하지 못했어요.<br><span style="font-size:12px;color:#777;">나가면 마지막으로 저장한 뒤에 한 것은 사라져요</span>', '나가기', '계속하기')) : true;
    }
    if (a === 'drop') { await o.drop(); return true; }
    return false;
}
const tsHm = t => new Date(t).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
const tsAt = t => `📱 이 기기에 임시보관${t ? ' · ' + tsHm(t) : ''}`;        // 상태 한 줄 (다이어리 막대)
function tsSaved(t, note) {                                                 // 💾 버튼을 눌렀어요 = 언제 · 어디에 저장했는지 알려 줘요 (다이어리)
    if (window.showMsg) showMsg(`💾 이 기기에 임시보관했어요 (${tsHm(t || Date.now())})<br><span style="font-size:12px;color:#777;">다른 기기에서는 보이지 않아요${note ? '<br>' + note : ''}</span>`);
}
window.TS = TS; window.tsSaved = tsSaved; window.tsAuto = tsAuto; window.tsCloseAsk = tsCloseAsk; window.tsClose = tsClose; window.tsAt = tsAt; window.tsHm = tsHm;
