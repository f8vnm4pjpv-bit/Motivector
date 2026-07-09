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
