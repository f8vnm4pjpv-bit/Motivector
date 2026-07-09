(function () {
  "use strict";

  var app = document.getElementById("app");
  var state = {
    desires: [],
    questions: [],
    answers: [],
    currentIndex: 0
  };

  // file://でJSON fetchが制限される環境向けの最小フォールバックである。GitHub Pagesではdata/*.jsonを読み込む。
  var fallbackData = {
    desires: [
      { id: "stability", name: "安定欲求", description: "不安定さや喪失を避け、安心していられる状態を保ちたい欲求である。" },
      { id: "autonomy", name: "自律欲求", description: "自分の意思で選び、自分のペースで動きたい欲求である。" },
      { id: "growth", name: "成長欲求", description: "できることを増やし、能力や成果を高めたい欲求である。" },
      { id: "exploration", name: "探究欲求", description: "未知のものを知り、仕組みを理解したい欲求である。" },
      { id: "relationship", name: "関係欲求", description: "人とのつながりを保ち、受け入れられていたい欲求である。" },
      { id: "recognition", name: "評価欲求", description: "自分の価値や努力を認められたい欲求である。" },
      { id: "influence", name: "影響欲求", description: "自分の働きかけによって、周囲や状況に変化を起こしたい欲求である。" },
      { id: "order", name: "秩序欲求", description: "情報や環境を整理し、見通しのよい状態にしたい欲求である。" },
      { id: "stimulation", name: "刺激欲求", description: "新しさ、面白さ、変化、楽しさを求める欲求である。" },
      { id: "creation", name: "創造欲求", description: "考えや感覚を形にし、何かを生み出したい欲求である。" },
      { id: "meaning", name: "意味欲求", description: "出来事や行動に、物語、美学、思想、存在理由を見出したい欲求である。" }
    ],
    questions: [
      {
        id: "q001",
        text: "休日の午前中に予定が空いたとき、まず何をするか。",
        choices: [
          { text: "部屋や持ち物を整えて、落ち着いて過ごせる状態にする。", scores: { stability: 0.6, order: 0.4 } },
          { text: "気になっていた場所へ行き、初めての店や道を試す。", scores: { stimulation: 0.6, exploration: 0.4 } },
          { text: "作りかけの文章、絵、音楽、企画などに手を入れる。", scores: { creation: 0.7, meaning: 0.3 } }
        ]
      },
      {
        id: "q002",
        text: "新しいプロジェクトに参加した直後、最初に取りたい行動はどれか。",
        choices: [
          { text: "目的、期限、役割を確認して、全体の流れを整理する。", scores: { order: 0.6, stability: 0.2, influence: 0.2 } },
          { text: "自分が伸ばせそうな技術や知識を見つけ、練習の予定を作る。", scores: { growth: 0.7, exploration: 0.3 } },
          { text: "一緒に進める人に声をかけ、互いの得意なことを聞く。", scores: { relationship: 0.7, recognition: 0.3 } }
        ]
      },
      {
        id: "q003",
        text: "意見が分かれた会議で、自分が自然にしやすいことはどれか。",
        choices: [
          { text: "判断材料を集め、なぜ違いが出ているのかを確認する。", scores: { exploration: 0.6, order: 0.4 } },
          { text: "自分の案がどう役立つかを説明し、場を前に進める。", scores: { influence: 0.7, recognition: 0.3 } },
          { text: "それぞれの不安や期待を聞き、話しやすい空気を作る。", scores: { relationship: 0.6, stability: 0.4 } }
        ]
      },
      {
        id: "q004",
        text: "まとまった時間を使って何かを改善できるなら、どれを選ぶか。",
        choices: [
          { text: "毎日の作業手順を見直し、迷わず進められる形にする。", scores: { order: 0.5, growth: 0.3, stability: 0.2 } },
          { text: "自分で決めたテーマを深掘りし、納得できるまで調べる。", scores: { autonomy: 0.4, exploration: 0.4, meaning: 0.2 } },
          { text: "人に見せられる成果物として、形や表現を磨き込む。", scores: { creation: 0.5, recognition: 0.3, growth: 0.2 } }
        ]
      },
      {
        id: "q005",
        text: "次の一週間を自分らしく過ごすために、最も近い行動はどれか。",
        choices: [
          { text: "予定を詰め込みすぎず、休む時間と安心できる場所を確保する。", scores: { stability: 0.7, autonomy: 0.3 } },
          { text: "誰かの役に立つ小さな働きかけを決め、実際に動いてみる。", scores: { influence: 0.5, relationship: 0.3, meaning: 0.2 } },
          { text: "普段選ばない予定を一つ入れ、気分が動く体験を作る。", scores: { stimulation: 0.7, autonomy: 0.3 } }
        ]
      }
    ]
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDecimal(value) {
    return Number(value || 0).toFixed(3);
  }

  function fetchJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error(path + "を読み込めない状態である。");
      }
      return response.json();
    });
  }

  function loadData() {
    if (window.location.protocol === "file:") {
      console.info("file://直開きのため、フォールバックデータを使う状態である。");
      return Promise.resolve(fallbackData);
    }

    return Promise.all([
      fetchJson("data/desires.json"),
      fetchJson("data/questions.json")
    ]).then(function (results) {
      return {
        desires: results[0],
        questions: results[1]
      };
    });
  }

  function runValidation(data) {
    if (!window.MotivectorValidation) {
      return;
    }

    var report = window.MotivectorValidation.validateData(data.desires, data.questions);
    console.groupCollapsed("Motivector data validation");
    console.log(report.summary);
    if (report.warnings.length) {
      console.warn(report.warnings);
    }
    if (report.errors.length) {
      console.error(report.errors);
    } else {
      console.info("検証エラーはない状態である。");
    }
    console.groupEnd();
  }

  function renderTitle() {
    app.innerHTML = [
      '<p class="eyebrow">Motivector</p>',
      "<h1>ココロの成分表</h1>",
      '<p class="lead">行動の選び方から、今どの欲求が表れやすいかを仮に見るための初期版である。</p>',
      '<button class="primary-button" type="button" id="start-button">診断を開始する</button>'
    ].join("");

    document.getElementById("start-button").addEventListener("click", function () {
      state.answers = [];
      state.currentIndex = 0;
      renderQuestion();
    });
  }

  function renderQuestion() {
    var question = state.questions[state.currentIndex];
    var choiceHtml = question.choices.map(function (choice, index) {
      return '<button class="choice-button" type="button" data-choice-index="' + index + '">' + escapeHtml(choice.text) + "</button>";
    }).join("");

    app.innerHTML = [
      '<div class="question-meta">',
      "<span>質問 " + (state.currentIndex + 1) + " / " + state.questions.length + "</span>",
      "<span>" + escapeHtml(question.id) + "</span>",
      "</div>",
      "<h2>" + escapeHtml(question.text) + "</h2>",
      '<div class="choices">' + choiceHtml + "</div>"
    ].join("");

    app.querySelectorAll(".choice-button").forEach(function (button) {
      button.addEventListener("click", function () {
        var choiceIndex = Number(button.getAttribute("data-choice-index"));
        state.answers.push(question.choices[choiceIndex]);
        state.currentIndex += 1;

        if (state.currentIndex >= state.questions.length) {
          renderResult();
        } else {
          renderQuestion();
        }
      });
    });
  }

  function renderResult() {
    var result = window.MotivectorScoring.scoreAnswers(state.desires, state.questions, state.answers);
    var resultText = window.MotivectorResultText.buildResultText(result.top_desires);

    var topHtml = result.top_desires.map(function (desire, index) {
      return [
        '<div class="result-card">',
        "<strong>" + (index + 1) + ". " + escapeHtml(desire.name) + " " + formatDecimal(desire.component_ratio * 100) + "%</strong>",
        "<span>" + escapeHtml(desire.description) + "</span>",
        "</div>"
      ].join("");
    }).join("");

    var scoreRows = state.desires.map(function (desire) {
      return [
        "<tr>",
        "<td>" + escapeHtml(desire.name) + "</td>",
        "<td>" + formatDecimal(result.raw_score[desire.id]) + "</td>",
        "<td>" + formatDecimal(result.max_possible_score[desire.id]) + "</td>",
        "<td>" + formatDecimal(result.normalized_score[desire.id]) + "</td>",
        "<td>" + formatDecimal(result.component_ratio[desire.id]) + "</td>",
        "</tr>"
      ].join("");
    }).join("");

    app.innerHTML = [
      '<p class="eyebrow">結果</p>',
      "<h1>ココロの成分表</h1>",
      '<p class="lead">' + escapeHtml(resultText) + "</p>",
      '<div class="top-list">' + topHtml + "</div>",
      '<table class="score-table">',
      "<thead><tr><th>欲求</th><th>raw</th><th>max</th><th>normalized</th><th>ratio</th></tr></thead>",
      "<tbody>" + scoreRows + "</tbody>",
      "</table>",
      '<button class="secondary-button" type="button" id="restart-button">もう一度診断する</button>'
    ].join("");

    document.getElementById("restart-button").addEventListener("click", renderTitle);
  }

  function renderError(error) {
    app.innerHTML = '<p class="error">データの読み込みに失敗した状態である。' + escapeHtml(error.message) + "</p>";
  }

  loadData()
    .then(function (data) {
      runValidation(data);
      state.desires = data.desires;
      state.questions = data.questions;
      renderTitle();
    })
    .catch(renderError);
})();
