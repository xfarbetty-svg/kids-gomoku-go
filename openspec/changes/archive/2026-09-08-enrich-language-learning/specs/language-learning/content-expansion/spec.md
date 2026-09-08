## Purpose

英日雙語教材庫擴充功能（Content Expansion）旨在提供豐富、貼近生活實用情境與兒童趣味的分級字庫、實用高頻例句與對話劇本，解決先前內容過於簡略的問題，提供完整實用的沉浸式語言學習體驗。

## ADDED Requirements

### Requirement: Enriched Vocabulary and Collocation Examples
系統 SHALL 提供涵蓋常見等級（英文 A1-C1、日文 N5-N2）的單字擴充庫，且每個單字均須包含實用生活例句、繁體中文翻譯與單字詞性標記。

#### Scenario: Browsing Enriched Words
- **WHEN** 使用者在單字庫選擇特定的分類或等級（如「飲食生活」或「JLPT N5」）
- **THEN** 系統展示擴充後的多組單字卡，每張卡片皆能點擊發音，並展示清晰的生活例句與中文翻譯。

### Requirement: Real-Life Dialogue Scenarios with Rich Script
系統 SHALL 在情境實境對話中提供至少 12 組涵蓋各生活情境的劇本（包括餐廳點餐、便利商店購物、問路、看醫生、搭電車、學校生活等），每組劇本提供 4 到 6 句雙向互動對話。

#### Scenario: Starting a Scenario Dialogue
- **WHEN** 使用者在情境對話中選擇一個劇本（例如「日本便利商店結帳」）
- **THEN** 系統加載完整的對話角色、台詞、假名、繁體中文翻譯以及互動式語音跟讀確認流程。
