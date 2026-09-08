# 📚 內容包任務書 — 預載 VOA + BBC 逐字稿

## 一、 目標

在 `SHADOWING_DATA`（`learn.html` 行 5000–5460）中新增三大內容包，擴充大人模式的英語跟讀素材：

| 內容包 | 對象 | 篇數 | CEFR |
|--------|------|------|------|
| VOA Beginner Stories | 初學者/小朋友 | 10 篇 | A1–A2 |
| BBC 6 Minute English | 大人中級 | 10 篇 | B1–B2 |
| VOA Everyday Grammar | 大人進階 | 5 篇 | B2–C1 |

---

## 二、 內容規格

每篇故事格式與現有 `SHADOWING_DATA` 完全一致：

```javascript
{
  id: 'voa-beginner-01',
  title: 'A Day at the Market',
  titleZh: '菜市場的一天',
  level: 'A1',           // CEFR 分級（新增欄位）
  source: 'VOA',         // 來源標記（新增欄位）
  sentences: [
    {
      text: 'I go to the market every Saturday.',
      ruby: null,         // 英語無假名
      phonetic: '/aɪ ɡoʊ tuː ðə ˈmɑːrkɪt ˈɛvri ˈsætərdeɪ/',
      zh: '我每個星期六都去菜市場。',
      pauseHint: 'I go to ↓the market ↑every Saturday.'
    },
    // ... 更多句子
  ]
}
```

### 新增欄位
- `level`：CEFR 分級（A1 / A2 / B1 / B2 / C1）
- `source`：內容來源（VOA / BBC）

---

## 三、 內容包 A：VOA Beginner Stories（10 篇）

放在 `SHADOWING_DATA.adult.en` 陣列中（行 5239–5356 後追加）。

### 篇目清單

| # | ID | 標題 | 中文標題 | 句數 | 主題 |
|---|-----|------|---------|------|------|
| 1 | voa-beg-01 | A Day at the Market | 菜市場的一天 | 8 | 日常生活 |
| 2 | voa-beg-02 | My Favorite Food | 我最喜歡的食物 | 8 | 飲食 |
| 3 | voa-beg-03 | The Weather Today | 今天的天氣 | 7 | 天氣 |
| 4 | voa-beg-04 | Going to School | 上學去 | 8 | 教育 |
| 5 | voa-beg-05 | A Visit to the Doctor | 看醫生 | 8 | 健康 |
| 6 | voa-beg-06 | Cooking Dinner | 做晚餐 | 8 | 家庭 |
| 7 | voa-beg-07 | My Pet Cat | 我的寵物貓 | 7 | 動物 |
| 8 | voa-beg-08 | At the Bus Stop | 在公車站 | 8 | 交通 |
| 9 | voa-beg-09 | A Rainy Day | 下雨天 | 7 | 天氣 |
| 10 | voa-beg-10 | Shopping for Clothes | 買衣服 | 8 | 購物 |

### 內容原則
- **語速**：每篇控制在 1~2 分鐘朗讀長度
- **字彙**：僅使用 A1–A2 常用字（300 字以內）
- **句型**：簡單句為主，SVO 結構
- **逐字稿**：每句附音標（IPA）+ 繁中翻譯 + 發音提示

### 範例（voa-beg-01：A Day at the Market）

```javascript
{
  id: 'voa-beg-01',
  title: 'A Day at the Market',
  titleZh: '菜市場的一天',
  level: 'A1',
  source: 'VOA',
  sentences: [
    { text: 'I wake up early on Saturday morning.', ruby: null, phonetic: '/aɪ weɪk ʌp ˈɜːrli ɒn ˈsætərdeɪ ˈmɔːrnɪŋ/', zh: '我星期六早起。', pauseHint: 'I wake up ↓early on Saturday morning.' },
    { text: 'I want to go to the market.', ruby: null, phonetic: '/aɪ wɑːnt tuː ɡoʊ tuː ðə ˈmɑːrkɪt/', zh: '我想去菜市場。', pauseHint: 'I want to ↓go to the market.' },
    { text: 'The market is near my house.', ruby: null, phonetic: '/ðə ˈmɑːrkɪt ɪz nɪr maɪ haʊs/', zh: '菜市場在我家附近。', pauseHint: 'The market is ↓near my house.' },
    { text: 'I buy fresh fruits and vegetables.', ruby: null, phonetic: '/aɪ baɪ frɛʃ fruːts ænd ˈvɛdʒtəblz/', zh: '我買新鮮的水果和蔬菜。', pauseHint: 'I buy ↓fresh fruits and ↑vegetables.' },
    { text: 'The apples are very sweet.', ruby: null, phonetic: '/ðiː ˈæplz ɑːr ˈvɛri swiːt/', zh: '蘋果很甜。', pauseHint: 'The apples are ↓very sweet.' },
    { text: 'I also buy some bread.', ruby: null, phonetic: '/aɪ ˈɔːlsoʊ baɪ sʌm brɛd/', zh: '我還買了一些麵包。', pauseHint: 'I also buy ↓some bread.' },
    { text: 'The seller is very friendly.', ruby: null, phonetic: '/ðə ˈsɛlər ɪz ˈvɛri ˈfrɛndli/', zh: '老闆很友善。', pauseHint: 'The seller is ↓very friendly.' },
    { text: 'I go home with my bags.', ruby: null, phonetic: '/aɪ ɡoʊ hoʊm wɪð maɪ bæɡz/', zh: '我提著袋子回家。', pauseHint: 'I go ↓home with my bags.' }
  ]
}
```

---

## 四、 內容包 B：BBC 6 Minute English（10 篇）

放在 `SHADOWING_DATA.adult.en` 陣列中。

### 篇目清單

| # | ID | 標題 | 中文標題 | 句數 | 主題 |
|---|-----|------|---------|------|------|
| 1 | bbc-6me-01 | The Power of Habits | 習慣的力量 | 10 | 自我成長 |
| 2 | bbc-6me-02 | Food Waste Around the World | 全球食物浪費 | 10 | 環境 |
| 3 | bbc-6me-03 | The Rise of Remote Work | 遠距工作崛起 | 10 | 職場 |
| 4 | bbc-6me-04 | Learning a Musical Instrument | 學樂器 | 10 | 文化 |
| 5 | bbc-6me-05 | The Science of Sleep | 睡眠科學 | 10 | 健康 |
| 6 | bbc-6me-06 | Sustainable Travel | 永續旅行 | 10 | 旅行 |
| 7 | bbc-6me-07 | The Future of Artificial Intelligence | AI 的未來 | 10 | 科技 |
| 8 | bbc-6me-08 | Why We Dream | 我們為什麼做夢 | 10 | 心理 |
| 9 | bbc-6me-09 | The History of Tea | 茶的歷史 | 10 | 文化 |
| 10 | bbc-6me-10 | Urban Gardening | 都市園藝 | 10 | 生活 |

### 內容原則
- **語速**：中速（B1–B2 水平）
- **字彙**：使用 B1–B2 常用字，附較難字的簡要說明
- **句型**：混合句型，含被動語態、關係子句
- **風格**：BBC 6 Minute English 的對話式教學風格

---

## 五、 內容包 C：VOA Everyday Grammar（5 篇）

放在 `SHADOWING_DATA.adult.en` 陣列中。

### 篇目清單

| # | ID | 標題 | 中文標題 | 句數 | 語法重點 |
|---|-----|------|---------|------|---------|
| 1 | va-eg-01 | Present Perfect vs Past Simple | 現在完成式 vs 過去式 | 10 | 時態 |
| 2 | va-eg-02 | Conditionals: If I Were... | 條件句：如果我是... | 10 | 假設語氣 |
| 3 | va-eg-03 | Passive Voice in Daily Life | 日常被動語態 | 10 | 被動語態 |
| 4 | va-eg-04 | Reported Speech | 間接引述 | 10 | 引述句 |
| 5 | va-eg-05 | Gerunds and Infinitives | 動名詞與不定詞 | 10 | 動詞變化 |

### 內容原則
- **語速**：中偏快（B2–C1 水平）
- **字彙**：使用 B2–C1 常用字
- **句型**：聚焦特定語法結構，每篇以對話+解說形式
- **風格**：VOA Everyday Grammar 的教學風格

---

## 六、 修改位置

### HTML 改動
無（純 JS 資料擴充）。

### JS 改動

**位置**：`SHADOWING_DATA` 定義（行 5000–5460）

在 `adult.en` 陣列（行 5239–5356）末尾追加 25 篇故事物件。

**預估新增行數**：~350 行（每篇約 14 行 × 25 篇 + 結構空行）

### sw.js 改動
快取版本推進至 `v22`（因為 `learn.html` 行數大幅增加）。

---

## 七、 驗收標準

| # | 檢查項 | 驗證方式 |
|---|--------|---------|
| 1 | `SHADOWING_DATA.adult.en` 包含 25 篇新故事 | `node -e "..."` 檢查陣列長度 |
| 2 | 每篇含 `level` 和 `source` 欄位 | 腳本掃描 |
| 3 | 每篇句子含 `text`、`phonetic`、`zh`、`pauseHint` | 腳本掃描 |
| 4 | CEFR 分級正確（A1/C1 對應） | 人工抽查 |
| 5 | 切換大人模式 → 英語，下拉選單顯示新故事 | 手動測試 |
| 6 | 選擇新故事後，focus card 正確渲染 | 手動測試 |
| 7 | `node VERIFY_RELAY.js` 全數通過 | CLI 驗證 |
| 8 | `sw.js` 版本更新至 v22 | 手動檢查 |

---

## 八、 執行順序建議

1. 先完成 `SHADOWING_DATA` 資料擴充（純新增，不改現有）
2. 執行語法檢查確認無 syntax error
3. 更新 `sw.js` 快取版本
4. 手動測試：切換到大人模式 → 英語 → 確認新故事可選取並正常渲染
