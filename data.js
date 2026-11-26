// 外来生物みわけの問題を作る（ブラウザと node の両方で使う）。
// 中身は、環境省「日本の外来種対策」（特定外来生物等一覧・何が禁止されているのか・条件付特定外来生物・外来種被害予防三原則）と、
// 国立環境研究所「侵入生物データベース」で確かめたことだけ（2026-11-17 に読んだ。要点は README の出典）。
// 1問は、生き物の名前と手がかりを見て、法律での区分（在来種・外来種（指定なし）・特定外来生物・条件付特定外来生物）を選ぶ。
// 正解したら2段目「どこから来た？」（もとの産地）を選ぶ。生き物の絵は出さない。見た目の手がかりは侵入生物データベースの形態の欄の要約だけ。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];
  const ENV = "https://www.env.go.jp/nature/intro/";
  const DB = "https://www.nies.go.jp/biodiversity/invasive/DB/detail/";

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    list: ["環境省「特定外来生物等一覧」", ENV + "2outline/list.html"],
    kisei: ["環境省「何が禁止されているのか」", ENV + "1law/regulation.html"],
    joken: ["環境省「アカミミガメ・アメリカザリガニ（条件付特定外来生物）」", ENV + "2outline/regulation/jokentsuki.html"],
    gensoku: ["環境省「外来種被害予防三原則」", ENV + "2outline/invasive.html"],
    iaslist: ["環境省「生態系被害防止外来種リスト」", ENV + "2outline/iaslist.html"],
    gokegumo: ["環境省「セアカゴケグモ等のゴケグモ類」", ENV + "2outline/attention/gokegumo.html"],
    hiari: ["環境省「ヒアリに関する諸情報」", ENV + "2outline/attention/hiari.html"],
  };
  const db = (id, nm) => { SRC["db" + id] = [`国立環境研究所 侵入生物データベース「${nm}」`, DB + id + ".html"]; return "db" + id; };

  // 選び肢になる「区分」
  const ORGS = ["在来種", "外来種（指定なし）", "特定外来生物", "条件付特定外来生物"];
  const [ZAI, SHITEI, TOKU, JOKEN] = ORGS;

  // 2段目「どこから来た？」の5つの分け方
  const GROUPS = {
    kita: { name: "北アメリカ", sub: "アメリカ合衆国・カナダ・メキシコなど" },
    minami: { name: "中南米", sub: "中央アメリカ・南アメリカ" },
    asia: { name: "アジア", sub: "中国・台湾・東南アジア・南アジアなど" },
    europe: { name: "ヨーロッパ", sub: "ヨーロッパの国々" },
    nihon: { name: "もとから日本", sub: "在来種" },
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const MEDIA = ["観察メモ", "理科の授業", "自然観察会", "生き物しらべ"];

  // 区分を当てる問題。ans：答え、sit：手がかりの言い方。やさしいは選び肢3つ、ふつう・むずかしいは4つ
  function which(ans, sit) {
    return (R, lv) => {
      const si = ri(R, 0, sit.length - 1), mi = ri(R, 0, MEDIA.length - 1);
      const others = ORGS.filter((o) => o !== ans), n = lv === 0 ? 2 : 3, ds = pickN(R, others, n);
      const q = sit[si] + "　法律では、どの区分？";
      return { type: "kubun", media: MEDIA[mi], q, opts: shuffle(R, [ans, ...ds]), ans, rev: false, v: `${si}:${mi}` };
    };
  }

  // 区分ごとの「ヒント1」「ヒント2」「なぜ」の決まった文
  const LOOK = {
    [ZAI]: "もとから日本にすんでいる生き物です。",
    [SHITEI]: "人が海外から持ちこんだ生き物です。法律で飼うことが禁じられているかを考えます。",
    [TOKU]: "人が海外から持ちこんだ生き物です。法律で飼うことが禁じられているかを考えます。",
    [JOKEN]: "人が海外から持ちこんだ生き物です。家で飼っている人がとても多い生き物です。",
  };
  const KEY = {
    [ZAI]: "外来種ではありません。もとから日本にいる「在来種」です。",
    [SHITEI]: "外来種ですが、環境省の「特定外来生物等一覧」には入っていません。",
    [TOKU]: "環境省の「特定外来生物等一覧」に入っています。",
    [JOKEN]: "2023年6月1日から、アカミミガメとアメリカザリガニの2種だけが「条件付特定外来生物」です。",
  };
  const RULE = {
    [ZAI]: "在来種でも、本来いない別の地域へ移すと、その地域では「国内由来の外来種」になります。",
    [SHITEI]: "特定外来生物ではないので、飼うことは法律で禁じられていません。ただし「入れない・捨てない・拡げない」（外来種被害予防三原則）を守ります。",
    [TOKU]: "特定外来生物は、許可なく飼う・生きたまま運ぶ・野外に放す・売ることが法律で禁止です。野外で捕まえて持ち帰るのも「運搬」で禁止です。",
    [JOKEN]: "家で飼い続けるのは手続きなしでできますが、野外に放す・逃がす、売る・買うことは法律で禁止です。飼えなくなったら、無償で引き取ってくれる人をさがします。",
  };
  const RSRC = { [ZAI]: ["iaslist"], [SHITEI]: ["list", "gensoku"], [TOKU]: ["list", "kisei"], [JOKEN]: ["joken"] };

  const HOME = { kita: "北アメリカ", minami: "中南米", asia: "アジア", europe: "ヨーロッパ" };
  const PLACE = {
    mammal: ["山のふもとの畑で", "町の公園で", "林の中で"],
    bird: ["雑木林で", "公園の木の上で", "山道で"],
    reptile: ["池のほとりで", "川の岸で", "庭先で"],
    frog: ["田んぼのわきで", "池のほとりで", "水路で"],
    fish: ["池で", "川で", "湖で"],
    insect: ["公園で", "庭の植え木で", "空き地で"],
    water: ["川で", "池で", "水路で"],
    plant: ["河原で", "空き地で", "道ばたで"],
    wplant: ["池で", "川で", "水路で"],
  };

  // 種類：[id, lv, 区分, 2段目, 名前, なかま, 見た目の手がかり（侵入生物データベースの要約）, 産地の一言, 出典]
  const T = [
    // ---- やさしい ----
    ["araiguma", 0, TOKU, "kita", "アライグマ", "mammal", "", "北アメリカ・中米から", ["iaslist"]],
    ["akamimi", 0, JOKEN, "kita", "アカミミガメ（ミドリガメ）", "reptile", "頭の両側に橙赤色の模様があるカメ。子ガメは「ミドリガメ」とよばれる", "アメリカ合衆国南部〜メキシコ北東部から", [db(30050, "ミシシッピアカミミガメ")]],
    ["amezari", 0, JOKEN, "kita", "アメリカザリガニ", "water", "大人は赤色〜赤褐色の、最大15cmほどのザリガニ", "アメリカ合衆国南部から", [db(70320, "アメリカザリガニ")]],
    ["okuchi", 0, TOKU, "kita", "オオクチバス（ブラックバス）", "fish", "上あごの後ろのはしが、目の後ろより後ろまでとどく魚", "北アメリカから", [db(50330, "オオクチバス")]],
    ["burugiru", 0, TOKU, "kita", "ブルーギル", "fish", "えらぶたの後ろのはしが濃い紺色〜黒の魚", "北アメリカ東部から", [db(50310, "ブルーギル")]],
    ["ushigaeru", 0, TOKU, "kita", "ウシガエル", "frog", "体長11〜18cmほどの大きなカエル。水かきがよく発達", "北アメリカ東部・中部から", [db(40020, "ウシガエル")]],
    ["hiari", 0, TOKU, "minami", "ヒアリ", "insect", "体長2.5〜6mm、赤褐色で腹が黒っぽいアリ", "南アメリカから", [db(60290, "ヒアリ"), "hiari"]],
    ["seiyotanpopo", 0, SHITEI, "europe", "セイヨウタンポポ", "plant", "花の下の外側の総苞片が、下にそり返るタンポポ", "ヨーロッパから", [db(80640, "セイヨウタンポポ")]],
    ["seitaka", 0, SHITEI, "kita", "セイタカアワダチソウ", "plant", "高さ1〜2.5m。黄色の小さな花をたくさんつける", "北アメリカから", [db(80600, "セイタカアワダチソウ")]],
    ["tanuki", 0, ZAI, "nihon", "タヌキ", "mammal", "", "北海道・本州・四国・九州にもとからいる", ["iaslist"]],
    ["medaka", 0, ZAI, "nihon", "メダカ", "fish", "田んぼや小川の小さな魚。外来のカダヤシと似ている", "もとから日本の小川にいる", [db(50230, "カダヤシ")]],
    ["amagaeru", 0, ZAI, "nihon", "ニホンアマガエル", "frog", "背中が緑色〜灰褐色で、鼻から目・肩へ黒いすじがある小さなカエル", "もとから日本列島にいる", [db(40320, "ニホンアマガエル")]],
    ["tonosama", 0, ZAI, "nihon", "トノサマガエル", "frog", "オスは金色〜緑色。メスは黒いまだらがある", "本州・四国・九州にもとからいる", [db(40070, "トノサマガエル")]],
    // ---- ふつう ----
    ["nutoria", 1, TOKU, "minami", "ヌートリア", "mammal", "", "南アメリカから", ["iaslist"]],
    ["kurihara", 1, TOKU, "asia", "クリハラリス（タイワンリス）", "mammal", "", "台湾・中国・東南アジアから", ["iaslist"]],
    ["mangusu", 1, TOKU, "asia", "フイリマングース", "mammal", "", "中東・南アジア・東南アジアなどから", ["iaslist"]],
    ["gabicho", 1, TOKU, "asia", "ガビチョウ", "bird", "全体が黄褐色で、目のまわりに白い帯がある鳥", "中国南部・台湾などから", [db(20150, "ガビチョウ")]],
    ["kadayashi", 1, TOKU, "kita", "カダヤシ", "fish", "メダカに似るが、体が青みがかり、尾びれが丸い魚", "アメリカ合衆国ミシシッピ川流域などから", [db(50230, "カダヤシ")]],
    ["aruzen", 1, TOKU, "minami", "アルゼンチンアリ", "insect", "体長2.5mmほどの黒褐色のアリ", "南アメリカから", [db(60090, "アルゼンチンアリ")]],
    ["tsumaaka", 1, TOKU, "asia", "ツマアカスズメバチ", "insect", "体が黒っぽく、腹の先が赤褐色のスズメバチ", "中国・台湾・東南アジアなどから", [db(60550, "ツマアカスズメバチ")]],
    ["kubiaka", 1, TOKU, "asia", "クビアカツヤカミキリ", "insect", "つやのある黒い体で、首の背中側が明るい赤色のカミキリムシ", "中国・朝鮮半島・台湾などから", [db(60560, "クビアカツヤカミキリ")]],
    ["ookinkei", 1, TOKU, "kita", "オオキンケイギク", "plant", "", "北アメリカから", ["iaslist"]],
    ["arechiuri", 1, TOKU, "kita", "アレチウリ", "plant", "", "北アメリカから", ["iaslist"]],
    ["hakubishin", 1, SHITEI, "asia", "ハクビシン", "mammal", "額から鼻にかけて白い線がある、灰褐色のけもの", "ヒマラヤ・中国南部・台湾・東南アジアから", [db(10200, "ハクビシン")]],
    ["sukumi", 1, SHITEI, "minami", "スクミリンゴガイ（ジャンボタニシ）", "water", "殻の高さ5cm以上の大きな巻き貝。殻に赤褐色の帯がある", "南アメリカから", [db(70310, "スクミリンゴガイ")]],
    ["hotei", 1, SHITEI, "minami", "ホテイアオイ", "wplant", "水に浮かぶ草。葉の柄がふくらんで浮き袋になり、淡い紫の花がさく", "南アメリカから", [db(80810, "ホテイアオイ")]],
    ["nihonzari", 1, ZAI, "nihon", "ニホンザリガニ", "water", "北海道と東北の一部にすむザリガニ", "もとから北海道・東北にいる", ["joken"]],
    ["nihonrisu", 1, ZAI, "nihon", "ニホンリス", "mammal", "", "もとから日本にいる", ["list"]],
    ["himejoon", 1, SHITEI, "kita", "ヒメジョオン", "plant", "高さ50〜130cm。白い花びらの小さな花がさく。茎の中がつまっている", "北アメリカから", [db(80630, "ヒメジョオン")]],
    ["maruhana", 1, TOKU, "europe", "セイヨウオオマルハナバチ", "insect", "腹が黒・黄・黒・白のしまもようのハチ", "ヨーロッパから", [db(60080, "セイヨウオオマルハナバチ")]],
    ["anoru", 1, TOKU, "kita", "グリーンアノール", "reptile", "背中が緑色のことが多いトカゲ。オスはのどを広げる", "アメリカ合衆国南東部から", [db(30100, "グリーンアノール")]],
    ["kyon", 1, TOKU, "asia", "キョン", "mammal", "", "中国・台湾から", ["iaslist"]],
    // ---- むずかしい ----
    ["taiwanzaru", 2, TOKU, "asia", "タイワンザル", "mammal", "ニホンザルより尾が長いサル（頭と胴の長さの約7割）", "台湾から", [db(10030, "タイワンザル")]],
    ["soshicho", 2, TOKU, "asia", "ソウシチョウ", "bird", "暗い緑色で顔が黄色、胸がオレンジ色、くちばしが赤い鳥", "中国南部・ベトナム北部などから", [db(20160, "ソウシチョウ")]],
    ["kanadagan", 2, TOKU, "kita", "カナダガン", "bird", "頭と首が黒く、のどから頬に白いもようがある大きな鳥（日本では根絶）", "北アメリカから", [db(20430, "カナダガン")]],
    ["minku", 2, TOKU, "kita", "アメリカミンク", "mammal", "野生のものは褐色が多い、細長いけもの", "北アメリカから", [db(10190, "アメリカミンク")]],
    ["masukuratto", 2, TOKU, "kita", "マスクラット", "mammal", "茶〜黒褐色の毛で、たてに平たい尾にほとんど毛がないけもの", "北アメリカから", [db(10090, "マスクラット")]],
    ["chaneru", 2, TOKU, "kita", "チャネルキャットフィッシュ", "fish", "ひげが4対あり、尾びれが深く2つに分かれたナマズのなかま", "北アメリカから", [db(50120, "チャネルキャットフィッシュ")]],
    ["kokuchi", 2, TOKU, "kita", "コクチバス", "fish", "オオクチバスに似るが、上あごの後ろのはしが目の後ろまでとどかない魚", "北アメリカから", [db(50320, "コクチバス")]],
    ["uchida", 2, TOKU, "kita", "ウチダザリガニ", "water", "暗い緑色で、はさみの付け根に青白い点があるザリガニ", "北アメリカ（カナダ南西部〜アメリカ合衆国北西部）から", [db(70050, "ウチダザリガニ")]],
    ["akaboshi", 2, TOKU, "asia", "アカボシゴマダラ", "insect", "黒地に白いもようのチョウ。夏の型は後ろのはねに赤いもようがある", "中国・朝鮮半島などから", [db(60400, "アカボシゴマダラ")]],
    ["nagaetsuru", 2, TOKU, "minami", "ナガエツルノゲイトウ", "wplant", "茎の中が空洞で、白い球のような花がさく水辺の草", "南アメリカから", [db(81140, "ナガエツルノゲイトウ")]],
    ["oohangon", 2, TOKU, "kita", "オオハンゴンソウ", "plant", "高さ0.5〜3m。黄色い花びらの、直径5〜6cmの花がさく", "北アメリカから", [db(80580, "オオハンゴンソウ")]],
    ["mizuhimawari", 2, TOKU, "minami", "ミズヒマワリ", "wplant", "水辺に生える高さ0.5〜2mの草。白い花がさく", "中央・南アメリカから", [db(81120, "ミズヒマワリ")]],
    ["shirohitori", 2, SHITEI, "kita", "アメリカシロヒトリ", "insect", "全体が白い、小さなガ", "北アメリカから", [db(60010, "アメリカシロヒトリ")]],
    ["tanago", 2, SHITEI, "asia", "タイリクバラタナゴ", "fish", "体が平たく高い小さな魚。産卵期のオスは胸やおなかが赤くなる", "中国（揚子江のあたり）などアジア大陸東部から", [db(50080, "タイリクバラタナゴ")]],
  ];

  const EXTRA = {
    hiari: "見つけたら、環境省のヒアリ相談ダイヤルなどに相談します。",
    tanuki: "奥尻島や屋久島などのタヌキは、人が島へ持ちこんだ「国内由来の外来種」として扱われます。",
    medaka: "見た目がにた外来のカダヤシは、特定外来生物です。",
    akamimi: "「ミドリガメ」はアカミミガメの子ガメで、同じ決まりです。",
    amezari: "アメリカザリガニ以外の外国のザリガニは、全種が特定外来生物です。",
    nihonzari: "在来のニホンザリガニは、外国のザリガニとちがって特定外来生物ではありません。",
    nihonrisu: "リスのなかまの一覧の中で、ニホンリスは外されています。",
    kanadagan: "カナダガンは、日本の野外ではいなくなった（根絶した）とされています。",
    maruhana: "畑の受粉のために、許可を受けてハウスの中だけで使われています。",
    sukumi: "生態系被害防止外来種リストでは、重点的に対策する外来種です。",
  };

  const KINDS = T.map(([id, lv, ans, grp, nm, kind, look, from, src]) => {
    const pl = PLACE[kind], sit = [`${pl[0]}「${nm}」を見つけた。`, `${pl[1]}「${nm}」を見かけた。`, `${pl[2]}見つけた「${nm}」。`];
    for (const p of pl) sit.push(`${p}「${nm}」を見たと、友だちが言う。`, `${p}「${nm}」が${/plant/.test(kind) ? "生えている" : "いる"}と、ニュースで聞いた。`, `${p}「${nm}」を見つけ、図鑑で名前を調べた。`);
    if (look) sit.push(`「${nm}」：${look}。`);
    const fromTxt = grp === "nihon" ? `${nm}は、${from}在来種です。` : `${nm}は、${from}人が持ちこんだ外来種です。`;
    return { id, lv, grp, ans, name: nm.replace(/（.*$/, ""), src: [...new Set([...src, ...RSRC[ans]])],
      look: LOOK[ans], key: KEY[ans],
      why: `${fromTxt}区分は「${ans}」です。${RULE[ans]}${EXTRA[id] ? EXTRA[id] : ""}`,
      make: which(ans, sit) };
  });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」（例 "araiguma|2026-11-17:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = BY[kind];
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, why: k.why, grp: k.grp, src: k.src.map((s) => SRC[s]), ...p };
  }
  // 同じ問題かを見分ける鍵（種類・言い方・選び肢の組）
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const GMW = { KINDS, BY, GROUPS, LV, SRC, ORGS, T, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = GMW; else root.GMW = GMW;
})(typeof self !== "undefined" ? self : this);
