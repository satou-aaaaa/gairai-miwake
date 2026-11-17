# AGENTS.md

外来生物みわけ：身近な生き物の名前と手がかりを見て、法律での区分（在来種・外来種（指定なし）・特定外来生物・条件付特定外来生物）を当てる1日5問の学習ゲーム。正解したら「どこから来た？」（もとの産地：北アメリカ・中南米・アジア・ヨーロッパ・もとから日本）も選ぶ。`index.html` と `data.js`（問題の種類）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 問題（46種類×3000問：選び肢・答えは1つ・答えと産地が区分の表どおり・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 区分は環境省「特定外来生物等一覧」（<https://www.env.go.jp/nature/intro/2outline/list.html>。2026-11-06 現在のものを 2026-11-17 に読んだ）、きまりは環境省「何が禁止されているのか」「条件付特定外来生物」「外来種被害予防三原則」、産地と見た目の手がかりは国立環境研究所「侵入生物データベース」で確かめたことだけ。種類を足すときも資料を読み、`src` に付け、`qa/run.mjs` の `TB`（別に書いた区分の表）にも足す。資料で確かめられない見た目は書かない（空のまま）。
- 特定外来生物の一覧は新しい指定で変わる。巡回のときに一覧を読み直し、区分が変わった種類は直す（`KINDS` から消さず、区分を直す）。
- 生き物の絵・写真は出さない（作り話の絵で見分けを教えない。QA が見る）。駆除をすすめる遊びにしない。
- 法律の助言にしない：遊び方と「このゲームについて」と README に、法律の助言・公式の情報の代わりではないこと、正しい一覧は環境省で確かめることを置く（QA が見る）。
- 問題は、やさしいが選び肢3つ、ふつう・むずかしいが4つ（区分の4つから）。2回目のヒントはまちがいを消して2つにしぼり、区分の決め手（`key`）も見せる。2段目は「どこから来た？」（5つ）で、種類（`grp`）で決まる。
- 今日の5問（やさしい2・ふつう2・むずかしい1、種類は重ねない）・上級（むずかしい3、今日のむずかしいと別）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`T`（種類の表）・言い回しの並びは最後に足すだけ（QA の `PIN` が第1回の1問目を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「どこから来た？」・復習（1→3→7日後）。記録 `gai-v1`・文字 `gai-fs`・復習 `gai-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は憲法のしくみ（kenpo-shikumi）から写した。写し元の言葉が残っていないかを QA が見る。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
