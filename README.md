# Motivector / ココロの成分表

Motivectorは、行動の選び方から欲求の傾向を仮に可視化する静的Webアプリである。

## 現在の開発段階

HTML、CSS、JavaScriptのみで動く初期構成である。質問と欲求定義は仮データであり、診断精度を検証する段階ではない。

## 実行方法

`index.html` をブラウザで開くと実行できる。GitHub Pages上では `data/` 配下のJSONを読み込む構成である。

## 公開方針

GitHub Pagesで公開予定である。自前サーバーやサーバーサイド処理は使わない方針である。

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
