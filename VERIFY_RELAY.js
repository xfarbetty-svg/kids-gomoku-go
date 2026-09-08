const fs = require('fs');
const html = fs.readFileSync('learn.html', 'utf8');

let pass = 0, fail = 0;
function check(label, ok) {
  if (ok) { pass++; console.log('✅', label); }
  else    { fail++; console.log('❌', label); }
}

// 1. API 方法暴露
check('onModeChange 暴露', html.includes('onModeChange()') && html.includes('return {'));
check('setShadowingLang 暴露', /return\s*\{[\s\S]*?setShadowingLang\s*\(/.test(html));
check('onTabOpen 暴露', html.includes('onTabOpen()'));
check('stopAllAudio 暴露', html.includes('stopAllAudio'));

// 2. switchTab 呼叫 onTabOpen
const switchTabShadow = html.match(/tabId\s*===\s*'shadowing'[\s\S]{0,300}/);
check('switchTab 呼叫 onTabOpen', switchTabShadow && switchTabShadow[0].includes('onTabOpen()'));

// 3. UI.init() 呼叫 applyMode → ShadowingStudio.onModeChange（原本就有，確認沒被改壞）
check('applyMode 內有 ShadowingStudio.onModeChange 呼叫', html.includes('ShadowingStudio.onModeChange()'));

// 4. 語法檢查
const scripts = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
let syntaxOk = true;
scripts.forEach((m, i) => {
  try { new Function(m[1]); }
  catch(e) { syntaxOk = false; console.error(`❌ Script ${i} 語法錯誤:`, e.message); }
});
check('所有 script 語法正確', syntaxOk);

// 5. 總行數
const lines = html.split('\n').length;
check(`行數合理（5995~6005）: ${lines}`, lines >= 5995 && lines <= 6005);

console.log(`\n📊 結果：${pass} 通過 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
