const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(label, ok) {
  if (ok) { pass++; console.log('✅', label); }
  else    { fail++; console.log('❌', label); }
}

// ═══════════════════════════════════════════════════
// 1. 協作機制檔案檢查
// ═══════════════════════════════════════════════════
console.log('\n📋 協作機制檔案');

check('RELAY_PIPELINE.md 存在', fs.existsSync('RELAY_PIPELINE.md'));
check('RELAY_QUEUE.json 存在', fs.existsSync('RELAY_QUEUE.json'));
check('TRIGGER.md 存在', fs.existsSync('TRIGGER.md'));
check('RELAY_STATUS.json 存在', fs.existsSync('RELAY_STATUS.json'));

if (fs.existsSync('RELAY_QUEUE.json')) {
  try {
    const q = JSON.parse(fs.readFileSync('RELAY_QUEUE.json', 'utf8'));
    check('RELAY_QUEUE.json 格式正確（有 version）', typeof q.version === 'number');
    check('RELAY_QUEUE.json 有 queue 陣列', Array.isArray(q.queue));
    check('RELAY_QUEUE.json 有 completed 陣列', Array.isArray(q.completed));
  } catch (e) {
    check('RELAY_QUEUE.json 可解析', false);
  }
}

if (fs.existsSync('RELAY_STATUS.json')) {
  try {
    const s = JSON.parse(fs.readFileSync('RELAY_STATUS.json', 'utf8'));
    check('RELAY_STATUS.json 有 status 欄位', typeof s.status === 'string');
    check('RELAY_STATUS.json 有 current_turn 欄位', typeof s.current_turn === 'string');
  } catch (e) {
    check('RELAY_STATUS.json 可解析', false);
  }
}

// ═══════════════════════════════════════════════════
// 2. learn.html 基礎檢查
// ═══════════════════════════════════════════════════
console.log('\n📋 learn.html 基礎');

const html = fs.existsSync('learn.html') ? fs.readFileSync('learn.html', 'utf8') : '';

check('learn.html 存在', html.length > 0);

if (html) {
  // API 方法暴露
  check('onModeChange 暴露', html.includes('onModeChange()') && html.includes('return {'));
  check('setShadowingLang 暴露', /return\s*\{[\s\S]*?setShadowingLang\s*\(/.test(html));
  check('onTabOpen 暴露', html.includes('onTabOpen()'));
  check('stopAllAudio 暴露', html.includes('stopAllAudio'));

  // switchTab 呼叫 onTabOpen
  const switchTabShadow = html.match(/tabId\s*===\s*'shadowing'[\s\S]{0,300}/);
  check('switchTab 呼叫 onTabOpen', switchTabShadow && switchTabShadow[0].includes('onTabOpen()'));

  // applyMode → ShadowingStudio.onModeChange
  check('applyMode 內有 ShadowingStudio.onModeChange 呼叫', html.includes('ShadowingStudio.onModeChange()'));

  // 語法檢查
  const scripts = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
  let syntaxOk = true;
  scripts.forEach((m, i) => {
    try { new Function(m[1]); }
    catch(e) { syntaxOk = false; console.error(`❌ Script ${i} 語法錯誤:`, e.message); }
  });
  check('所有 script 語法正確', syntaxOk);
}

// ═══════════════════════════════════════════════════
// 3. Shadowing V2 功能檢查（選擇性）
// ═══════════════════════════════════════════════════
console.log('\n📋 Shadowing V2 功能（若已實作）');

if (html) {
  // Task 1: 四階段 UI
  const hasApplyStepUI = html.includes('applyStepUI');
  console.log(`   ${hasApplyStepUI ? '✅' : '⏭️'} applyStepUI 函式 ${hasApplyStepUI ? '存在' : '尚未實作（跳過）'}`);
  if (hasApplyStepUI) pass++; else { /* skip */ }

  // Task 2: 可調間隔
  const hasSilenceSelect = html.includes('shadowSilenceSelect');
  console.log(`   ${hasSilenceSelect ? '✅' : '⏭️'} 間隔選擇器 ${hasSilenceSelect ? '存在' : '尚未實作（跳過）'}`);
  if (hasSilenceSelect) pass++; else { /* skip */ }

  // Task 3: 聽寫模式
  const hasDictate = html.includes('dictateCurrentSentence');
  console.log(`   ${hasDictate ? '✅' : '⏭️'} 聽寫模式 ${hasDictate ? '存在' : '尚未實作（跳過）'}`);
  if (hasDictate) pass++; else { /* skip */ }

  // Task 4: 寬容評分
  const hasMetaphone = html.includes('metaphoneMatch');
  console.log(`   ${hasMetaphone ? '✅' : '⏭️'} 寬容評分 ${hasMetaphone ? '存在' : '尚未實作（跳過）'}`);
  if (hasMetaphone) pass++; else { /* skip */ }

  // Task 5: Tap-to-Lookup
  const hasWordPopup = html.includes('showWordPopup');
  console.log(`   ${hasWordPopup ? '✅' : '⏭️'} Tap-to-Lookup ${hasWordPopup ? '存在' : '尚未實作（跳過）'}`);
  if (hasWordPopup) pass++; else { /* skip */ }

  // Task 6: 進度持久化
  const hasSaveProgress = html.includes('saveProgress');
  console.log(`   ${hasSaveProgress ? '✅' : '⏭️'} 進度持久化 ${hasSaveProgress ? '存在' : '尚未實作（跳過）'}`);
  if (hasSaveProgress) pass++; else { /* skip */ }
}

// ═══════════════════════════════════════════════════
// 4. 內容包檢查（選擇性）
// ═══════════════════════════════════════════════════
console.log('\n📋 內容包（若已實作）');

if (html) {
  const hasVOA = html.includes('voa-beg-01');
  const hasBBC = html.includes('bbc-6me-01');
  console.log(`   ${hasVOA ? '✅' : '⏭️'} VOA Beginner 內容包 ${hasVOA ? '存在' : '尚未實作（跳過）'}`);
  if (hasVOA) pass++; else { /* skip */ }

  console.log(`   ${hasBBC ? '✅' : '⏭️'} BBC 6 Minute English 內容包 ${hasBBC ? '存在' : '尚未實作（跳過）'}`);
  if (hasBBC) pass++; else { /* skip */ }

  // 檢查 level / source 欄位
  if (hasVOA) {
    const hasLevel = html.includes("level: 'A1'") || html.includes('level: "A1"');
    check('內容包含 CEFR level 欄位', hasLevel);
    const hasSource = html.includes("source: 'VOA'") || html.includes('source: "VOA"');
    check('內容包含 source 欄位', hasSource);
  }
}

// ═══════════════════════════════════════════════════
// 5. 總行數（寬鬆範圍，因新功能會增加行數）
// ═══════════════════════════════════════════════════
console.log('\n📋 檔案規格');

if (html) {
  const lines = html.split('\n').length;
  console.log(`   📏 行數：${lines}`);
  check(`行數合理（5995~7000）: ${lines}`, lines >= 5995 && lines <= 7000);
}

// ═══════════════════════════════════════════════════
// 結果
// ═══════════════════════════════════════════════════
console.log(`\n📊 結果：${pass} 通過 / ${fail} 失敗`);
process.exit(fail > 0 ? 1 : 0);
