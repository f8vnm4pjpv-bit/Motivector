# Motivector / ココロの成分表

Motivectorは、行動の選び方から欲求の傾向を仮に可視化する静的Webアプリである。

## 現在の開発段階

HTML、CSS、JavaScriptのみで動く初期構成である。質問と欲求定義は仮データであり、診断精度を検証する段階ではない。

## 実行方法

`index.html` をブラウザで開くと実行できる。GitHub Pages上では `data/` 配下のJSONを読み込む構成である。

## 公開方針

GitHub Pagesで公開予定である。自前サーバーやサーバーサイド処理は使わない方針である。

## データファイルの役割

`data/desires.json` は11欲求の定義を管理するファイルである。`id`、`name`、`description`を持つ。`id`は採点と表示の接続点であるため、変更時は質問データも同時に確認する必要がある。

`data/questions.json` は質問と選択肢を管理するファイルである。各質問は `id`、`text`、`choices`を持ち、各選択肢は `text` と `scores` を持つ。`scores` のキーは `desires.json` の `id` と一致する必要がある。

## 採点方式

`raw_score` は回答で得た点数の合計である。`max_possible_score` は各欲求が理論上取りうる最大点である。`normalized_score` は `raw_score / max_possible_score` である。`component_ratio` は `normalized_score / sum(normalized_score)` であり、最終的なメイン表示の想定値である。

## 検証方針

本番質問を投入する前に、`js/validation.js` でデータ構造、未定義の欲求id、選択肢ごとの配点先数、合計配点、`max_possible_score` の偏りを確認する必要がある。現在は起動時にコンソールへ検証結果を出力する。

## ディレクトリ構成

```text
index.html
README.md
.gitignore
css/
  style.css
js/
  app.js
  scoring.js
  resultText.js
  validation.js
data/
  desires.json
  questions.json
docs/
  仕様書、CSV、Excel資料
```

## 今後の作業候補

- 仕様書に基づく本番用質問への置き換え
- 欲求ごとの説明文と結果文の調整
- 採点ロジックの検証用テストデータ作成
- GitHub Pages公開設定
- レーダーチャートなどの可視化追加

## 質問候補データの生成

`tools/convert_questions_csv_to_json.py` は、`docs/motivector_question_draft_v1_long.csv` を読み込み、`data/questions_draft_v1.json` を生成する変換スクリプトである。`question_id` ごとに選択肢をまとめ、`data/questions.json` と互換のある構造へ変換する。CSV内の日本語欲求名は、スクリプト内の固定マッピングで `data/desires.json` の英語idへ変換する。

実行例は以下である。

```bash
python tools/convert_questions_csv_to_json.py
```

この環境で `python` が使えない場合は、利用可能なPython実行ファイルに置き換える。

## 質問候補データの検証

`tools/validate_questions_json.py` は、`data/questions_draft_v1.json` を読み込み、質問数、選択肢数、必須フィールド、未定義の欲求id、配点先数、合計配点、`max_possible_score`、欲求間の偏りを検証するスクリプトである。エラーがある場合は終了コード1を返す。警告のみの場合は終了コード0である。

実行例は以下である。

```bash
python tools/validate_questions_json.py
```

`data/questions_draft_v1.json` は本番投入前の候補データである。アプリ本体が読み込む `data/questions.json` へ反映する前に、必ず変換結果と検証結果を確認する必要がある。

