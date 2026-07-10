# Motivector / ココロの成分表

Motivectorは、行動の選び方から11の欲求成分の表れ方を整理する静的Webアプリである。

## 現在の開発段階

HTML、CSS、JavaScriptのみで動く本番候補版である。通常版には、試験回答と文面レビューを経た30問・各4択を反映している。診断結果は性格、能力、人口平均との差を断定するものではなく、今回の回答を診断内で整理した値である。

キャラクターやタイプ名を使った表示は将来候補であり、現時点では未実装である。

## 実行方法

GitHub Pages上では `data/` 配下のJSONを読み込む。ローカルでは、ブラウザのfetch制限を避けるためHTTPサーバーを使う。

```bash
python -m http.server 8000
```

この環境で `python` が使えない場合は、`py`、`python3`、または利用可能なPython実行ファイルへ置き換える。

通常版は以下で確認する。

```text
http://localhost:8000/index.html
http://localhost:8000/index.html?dataset=production
```

## 公開方針

GitHub Pagesで公開予定である。自前サーバーやサーバーサイド処理、npm、外部ビルドツールは使用しない。

## データファイルの役割

- `data/desires.json`: 11欲求の `id`、名称、説明を管理する。
- `data/questions.json`: 通常版の30問・120選択肢である。
- `data/questions_sample.json`: UIと動作確認用の5問・20選択肢である。
- `data/questions_draft_v1.json`: 元CSVから再生成した本番候補の確認用データである。

各質問は `id`、`text`、`choices` を持つ。各選択肢は `text` と `scores` を持ち、`scores` のキーは `desires.json` の欲求idと一致する必要がある。

## データセット切り替え

| URL | dataset | 読み込み先 | 内容 |
| --- | --- | --- | --- |
| `index.html` | production | `data/questions.json` | 通常版30問 |
| `index.html?dataset=production` | production | `data/questions.json` | 通常版30問 |
| `index.html?dataset=sample` | sample | `data/questions_sample.json` | 動作確認用5問 |
| `index.html?dataset=draft` | draft | `data/questions_draft_v1.json` | CSV再生成後の確認用30問 |

未知の `dataset` はproductionへフォールバックし、コンソールへ警告を出す。`file://` 直開きでJSONのfetchに失敗した場合は、`js/app.js` 内の5問sampleフォールバックを使う。この場合、画面には実際のdatasetと要求されたdatasetを表示する。productionとdraftの30問は `app.js` へ埋め込まない。

## 採点方式

- `raw_score`: 回答で得た点数の合計である。
- `max_possible_score`: 各欲求が理論上取りうる最大点である。
- `normalized_score`: `raw_score / max_possible_score` である。
- `component_ratio`: `normalized_score / sum(normalized_score)` である。

一般利用者向けの主要表示と11成分の横棒には `normalized_score` を使う。`component_ratio` は、11成分のnormalized scoreを合計1として見た相対比率として、折りたたみ式の詳細スコア内だけに補助表示する。

結果画面は、上位3成分、相対的に前面へ出にくかった2成分、11成分すべての横棒、折りたたみ式の詳細スコアの順で表示する。11成分は値が近くなりやすいため、円グラフは採用していない。

上位3と下位2は `normalized_score` で選出する。同点の場合は `data/desires.json` の定義順を優先し、上位と下位が重複しないようにする。

## 本番質問への昇格

`tools/promote_questions.py` は、`data/questions_draft_v1.json` を `data/desires.json` と照合し、質問構造と配点を検証する。エラーがない場合だけ `data/questions.json` へコピーし、質問数、選択肢数、出力一致を報告する。

```bash
python tools/promote_questions.py
```

`data/questions_sample.json` は昇格対象ではなく、動作確認用として保持する。

## 質問候補データの生成

`tools/convert_questions_csv_to_json.py` は、正本である `docs/motivector_question_draft_v1_long.csv` を読み込み、`data/questions_draft_v1.json` を生成する。

```bash
python tools/convert_questions_csv_to_json.py
```

生成後は検証とブラウザ確認を行い、問題がなければ昇格スクリプトを実行する。

## 質問候補データの検証

`tools/validate_questions_json.py` は、質問数、選択肢数、必須フィールド、未定義の欲求id、配点先数、合計配点、`max_possible_score` の偏りを検証する。エラーがある場合は終了コード1を返す。

```bash
python tools/validate_questions_json.py
```

アプリ起動時にも `js/validation.js` が読み込んだdatasetを検証し、結果を画面とコンソールへ出力する。

## draft質問レビュー

`docs/question_review_notes.md` は、人がブラウザで確認して見つけた文面上の違和感と反映状況を記録する。`data/questions_draft_v1.json` は生成物であるため直接修正せず、正本のCSVへ反映して再生成する。

`tools/generate_question_review_sheet.py` は、元CSVから全30問のレビュー用 `docs/question_review_sheet.md` を生成する。

```bash
python tools/generate_question_review_sheet.py
```

## ディレクトリ構成

```text
index.html
README.md
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
  questions_sample.json
  questions_draft_v1.json
tools/
  convert_questions_csv_to_json.py
  generate_question_review_sheet.py
  promote_questions.py
  validate_questions_json.py
docs/
  元CSV、Excel、仕様書、レビュー記録
```

## 今後の作業候補

- 回答サンプルを増やした質問・配点バランスの検証
- 欲求説明と結果文の継続的な文面調整
- 上位・下位の組み合わせを使うキャラクター機能の設計
- GitHub Pages公開設定
