# language-learning/shadowing-studio Specification

## Purpose
TBD - created by archiving change enrich-language-learning. Update Purpose after archive.

## Requirements

### Requirement: Japanese Shadowing Story Library
系統 SHALL 提供分級的日語影子跟讀篇章庫，包含「初級（日常會話）」、「中級（民間故事，如桃太郎、鶴的報恩）」與「高級（文化演說與實用短講）」，每篇皆須提供句切分、漢字標音（Furigana）與繁體中文翻譯對照。

#### Scenario: Switching to Japanese Shadowing
- **WHEN** 使用者在影子跟讀訓練室點擊語言切換按鈕並選擇「日語（日本語）」
- **THEN** 篇章清單立即更新為日語分級教材，並加載第一篇日語篇章的所有分句內容與假名標音。

#### Scenario: Furigana and Translation Display
- **WHEN** 使用者在日語篇章中進入精讀或視讀階段
- **THEN** 系統於日文句子上方顯示正確之日文假名發音輔助標記，並於下方顯示繁體中文翻譯。

### Requirement: Japanese Speech Recognition and Accurate Evaluation
系統 SHALL 支援日語（ja-JP）語音辨識，並依據使用者錄音辨識之文字與標準原文進行文字相似度計算，給予 1 至 5 顆星評分與精準回饋。

#### Scenario: Japanese Shadowing Voice Scoring
- **WHEN** 使用者在日語模式下朗讀當前句子並點擊結束錄音
- **THEN** 系統以日語語音模型辨識朗讀結果，計算 Levenshtein 相似度，並顯示獲得的星星數（>=85% 為 3 星、>=65% 為 2 星、其餘為 1 星）與發音建議。

### Requirement: Dual-Track Audio Playback for English and Japanese
系統 SHALL 支援原音示範音訊與使用者錄音的雙軌 A/B 切換播放，讓使用者能直觀比對自己的語調與母語者發音。

#### Scenario: A/B Track Comparison
- **WHEN** 使用者完成錄音後點擊「聽聽自己」或「示範原音」按鈕
- **THEN** 系統流暢播放對應音軌，並提供重播與逐句比對操作。
