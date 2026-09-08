# 🎙️ 影子跟讀擴充任務書 (V3) — 《わらしべ長者（稻草富翁）》篇

## 任務背景
使用者希望引入 YouTube「OYASUMI JAPANESE CHANNEL」的經典日語民間故事：
**《わらしべ長者》（The Straw Millionaire / 稻草富翁・JLPT N5 經典童話）** 到影子跟讀訓練室教材庫中。

---

## 篇章資料規格（日語長篇影子跟讀故事）

將此篇章加入 `learn.html` 中的 `SHADOWING_DATA.kids.ja` 與 `SHADOWING_DATA.adult.ja`，使其在大人與小孩模式下皆可選讀。

```javascript
{
  id: 'ja-story-warashibe',
  title: '🌾 わらしべ長者',
  titleZh: '稻草富翁（好心有好報的奇蹟）',
  level: 'N5',
  sentences: [
    {
      text: "むかし むかし、あるところに、とても まじめで まずしい わかものが いました。",
      ruby: "むかし むかし、あるところに、とても まじめで <ruby>貧<rt>まず</rt></ruby>しい <ruby>若者<rt>わかもの</rt></ruby>が いました。",
      phonetic: "mukashi mukashi, aru tokoro ni, totemo majime de mazushii wakamono ga imashita.",
      zh: "很久很久以前，在一個地方，住著一位非常認真卻很貧窮的年輕人。",
      pauseHint: "經典開頭、語調平緩"
    },
    {
      text: "わかものは かんのんさまの おてらへ おまいりに いきました。",
      ruby: "<ruby>若者<rt>わかもの</rt></ruby>は <ruby>観音様<rt>かんのんさま</rt></ruby>の お<ruby>寺<rt>てら</rt></ruby>へ お<ruby>参<rt>まい</rt></ruby>りに <ruby>行<rt>い</rt></ruby>きました。",
      phonetic: "wakamono wa kannon-sama no otera e omairi ni ikimashita.",
      zh: "年輕人前往觀音菩薩的寺廟虔誠參拜。",
      pauseHint: "安詳、虔誠"
    },
    {
      text: "かんのんさまは「てらから でて、さいしょに つかんだものを はなすな」と いいました。",
      ruby: "<ruby>観音様<rt>かんのんさま</rt></ruby>は「<ruby>寺<rt>てら</rt></ruby>から <ruby>出<rt>で</rt></ruby>て、<ruby>最初<rt>さいしょ</rt></ruby>に つかんだものを <ruby>離<rt>はな</rt></ruby>すな」と <ruby>言<rt>い</rt></ruby>いました。",
      phonetic: "kannon-sama wa 'tera kara dete, saisho ni tsukanda mono o hanasu na' to iimashita.",
      zh: "菩薩對他說：「走出寺廟後，抓在手中的第一樣東西，絕對不可放手。」",
      pauseHint: "神聖開示"
    },
    {
      text: "てらを でた わかものは、ころんで いっぽんの わらしべを つかみました。",
      ruby: "<ruby>寺<rt>てら</rt></ruby>を <ruby>出<rt>で</rt></ruby>た <ruby>若者<rt>わかもの</rt></ruby>は、ころんで <ruby>一本<rt>いっぽん</rt></ruby>の わらしべを つかみました。",
      phonetic: "tera o deta wakamono wa, koronde ippon no warashibe o tsukamashita.",
      zh: "走出寺廟的年輕人不小心跌了一跤，手中抓起了一根稻草。",
      pauseHint: "意外情節"
    },
    {
      text: "とんできた アブを つかまえて、わらしべの さきに むすびつけました。",
      ruby: "<ruby>飛<rt>と</rt></ruby>んできた アブを つかまえて、わらしべの <ruby>先<rt>さき</rt></ruby>に むすびつけました。",
      phonetic: "tondekita abu o tsukamaete, warashibe no saki ni musubitsukemashita.",
      zh: "他抓住了飛來的牛虻，將牠綁在稻草的一端嗡嗡打轉。",
      pauseHint: "輕快活潑"
    },
    {
      text: "みちで であった こどもが それを みて、とても よろこびました。",
      ruby: "<ruby>道<rt>みち</rt></ruby>で <ruby>出会<rt>であ</rt></ruby>った <ruby>子供<rt>こども</rt></ruby>が それを <ruby>見<rt>み</rt></ruby>て、とても <ruby>喜<rt>よろこ</rt></ruby>びました。",
      phonetic: "michi de deatta kodomo ga sore o mite, totemo yorokobimashita.",
      zh: "路上遇到的小朋友看見了，開心地拍手笑了起來。",
      pauseHint: "童趣笑聲"
    },
    {
      text: "こどもの おかあさんは、おれいに みかんを みっつ くれました。",
      ruby: "<ruby>子供<rt>こども</rt></ruby>の お<ruby>母<rt>かあ</rt></ruby>さんは、お<ruby>礼<rt>れい</rt></ruby>に みかんを <ruby>三<rt>みっ</rt></ruby>つ くれました。",
      phonetic: "kodomo no okaasan wa, orei ni mikan o mittsu kuremashita.",
      zh: "孩子的母親為了答謝，送給他三顆香甜的橘子。",
      pauseHint: "感謝語氣"
    },
    {
      text: "つぎに、のどが かわいて たおれそうな ひとに、みかんを あげました。",
      ruby: "<ruby>次<rt>つぎ</rt></ruby>に、のどが かわいて <ruby>倒<rt>たお</rt></ruby>れそうな <ruby>人<rt>ひと</rt></ruby>に、みかんを あげました。",
      phonetic: "tsugi ni, nodo ga kawaite taoresō na hito ni, mikan o agemashita.",
      zh: "接著，年輕人遇見一位口渴得快昏倒的旅人，毫不猶豫地把橘子送給對方。",
      pauseHint: "善心助人"
    },
    {
      text: "そのひとは だいかんしゃして、うつくしい ぬのを くれました。",
      ruby: "<ruby>其<rt>そ</rt></ruby>の<ruby>人<rt>ひと</rt></ruby>は <ruby>大感謝<rt>だいかんしゃ</rt></ruby>して、<ruby>美<rt>うつく</rt></ruby>しい <ruby>布<rt>ぬの</rt></ruby>を くれました。",
      phonetic: "sono hito wa daikansha shite, utsukushii nuno o kuremashita.",
      zh: "那個人感激涕零，回贈給他三匹華美上等的綢緞。",
      pauseHint: "驚喜回饋"
    },
    {
      text: "そのぬのを、うまを つれた さむらいの こまった うまと こうかんしました。",
      ruby: "その<ruby>布<rt>ぬの</rt></ruby>を、<ruby>馬<rt>うま</rt></ruby>を <ruby>連<rt>つ</rt></ruby>れた <ruby>侍<rt>さむらい</rt></ruby>の <ruby>困<rt>こま</rt></ruby>った <ruby>馬<rt>うま</rt></ruby>と <ruby>交換<rt>こうかん</rt></ruby>しました。",
      phonetic: "sono nuno o, uma o tsureta samurai no komatta uma to kōkan shimashita.",
      zh: "後來，他用綢緞向一位急著趕路的武士換得了一匹因疲累倒地的病馬。",
      pauseHint: "轉折點"
    },
    {
      text: "わかものが てあつく かんびょうすると、うまは げんきな めいばに なりました。",
      ruby: "<ruby>若者<rt>わかもの</rt></ruby>が <ruby>手厚<rt>てあつ</rt></ruby>く <ruby>看病<rt>かんびょう</rt></ruby>すると、<ruby>馬<rt>うま</rt></ruby>は <ruby>元気<rt>げんき</rt></ruby>な <ruby>名馬<rt>めいば</rt></ruby>に なりました。",
      phonetic: "wakamono ga teatsuku kanbyō suru to, uma wa genki na meiba ni narimashita.",
      zh: "在年輕人悉心照料餵水後，這匹馬恢復元氣，成為一匹神駿好馬。",
      pauseHint: "充滿希望"
    },
    {
      text: "さいごに やしきの あるじが うまを みこみ、わかものは やしきを ゆずりうけました。",
      ruby: "<ruby>最後<rt>さいご</rt></ruby>に <ruby>屋敷<rt>やしき</rt></ruby>の <ruby>主<rt>あるじ</rt></ruby>が <ruby>馬<rt>うま</rt></ruby>を <ruby>見込<rt>みこ</rt></ruby>み、<ruby>若者<rt>わかもの</rt></ruby>は <ruby>屋敷<rt>やしき</rt></ruby>を <ruby>譲<rt>ゆず</rt></ruby>り<ruby>受<rt>う</rt></ruby>けました。",
      phonetic: "saigo ni yashiki no aruji ga uma o mikomi, wakamono wa yashiki o yuzuriukemashita.",
      zh: "最後，大富豪看中這匹駿馬，並欣賞年輕人的品格，將大宅邸與田地託付給他。",
      pauseHint: "大團圓"
    },
    {
      text: "いっぽんの わらしべから、わかものは おおがねもちの『わらしべちょうじゃ』に なったのです。",
      ruby: "<ruby>一本<rt>いっぽん</rt></ruby>の わらしべから、<ruby>若者<rt>わかもの</rt></ruby>は お<ruby>金持<rt>かねも</rt></ruby>ちの『わらしべ<ruby>長者<rt>ちょうじゃ</rt></ruby>』に なったのです。",
      phonetic: "ippon no warashibe kara, wakamono wa okanemochi no 'warashibe chōja' ni natta no desu.",
      zh: "只憑一根小小的稻草，善良的年輕人最終成為了人盡皆知的「稻草富翁」。",
      pauseHint: "寓意深遠、圓滿結尾"
    }
  ]
}
```

---

## 執行步驟
1. 在 `learn.html` 中的 `SHADOWING_DATA.kids.ja` 與 `SHADOWING_DATA.adult.ja` 中加入這篇《🌾 わらしべ長者》。
2. 檢查 `sw.js` 快取版本（維持或更新）。
3. 修改完成後，將 `RELAY_STATUS.json` 的 `"status"` 改為 `"CODE_DONE"`。
