(function () {
  "use strict";

  var app = document.getElementById("app");
  var DATASETS = {
    production: "data/questions.json",
    sample: "data/questions_sample.json",
    draft: "data/questions_draft_v1.json"
  };
  var state = {
    desires: [],
    questions: [],
    answers: [],
    currentIndex: 0,
    dataset: "production",
    requestedDataset: "production",
    validationReport: null,
    dataWarning: ""
  };

  // file://でJSON fetchが制限される環境向けのsampleフォールバックである。productionとdraftの30問は二重管理しない。
  var fallbackData = {
  "desires": [
    {
      "id": "stability",
      "name": "\u5b89\u5b9a\u6b32\u6c42",
      "description": "\u4e0d\u5b89\u5b9a\u3055\u3084\u55aa\u5931\u3092\u907f\u3051\u3001\u5b89\u5fc3\u3057\u3066\u3044\u3089\u308c\u308b\u72b6\u614b\u3092\u4fdd\u3061\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "autonomy",
      "name": "\u81ea\u5f8b\u6b32\u6c42",
      "description": "\u81ea\u5206\u306e\u610f\u601d\u3067\u9078\u3073\u3001\u81ea\u5206\u306e\u30da\u30fc\u30b9\u3067\u52d5\u304d\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "growth",
      "name": "\u6210\u9577\u6b32\u6c42",
      "description": "\u3067\u304d\u308b\u3053\u3068\u3092\u5897\u3084\u3057\u3001\u80fd\u529b\u3084\u6210\u679c\u3092\u9ad8\u3081\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "exploration",
      "name": "\u63a2\u7a76\u6b32\u6c42",
      "description": "\u672a\u77e5\u306e\u3082\u306e\u3092\u77e5\u308a\u3001\u4ed5\u7d44\u307f\u3092\u7406\u89e3\u3057\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "relationship",
      "name": "\u95a2\u4fc2\u6b32\u6c42",
      "description": "\u4eba\u3068\u306e\u3064\u306a\u304c\u308a\u3092\u4fdd\u3061\u3001\u53d7\u3051\u5165\u308c\u3089\u308c\u3066\u3044\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "recognition",
      "name": "\u8a55\u4fa1\u6b32\u6c42",
      "description": "\u81ea\u5206\u306e\u4fa1\u5024\u3084\u52aa\u529b\u3092\u8a8d\u3081\u3089\u308c\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "influence",
      "name": "\u5f71\u97ff\u6b32\u6c42",
      "description": "\u81ea\u5206\u306e\u50cd\u304d\u304b\u3051\u306b\u3088\u3063\u3066\u3001\u5468\u56f2\u3084\u72b6\u6cc1\u306b\u5909\u5316\u3092\u8d77\u3053\u3057\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "order",
      "name": "\u79e9\u5e8f\u6b32\u6c42",
      "description": "\u60c5\u5831\u3084\u74b0\u5883\u3092\u6574\u7406\u3057\u3001\u898b\u901a\u3057\u306e\u3088\u3044\u72b6\u614b\u306b\u3057\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "stimulation",
      "name": "\u523a\u6fc0\u6b32\u6c42",
      "description": "\u65b0\u3057\u3055\u3001\u9762\u767d\u3055\u3001\u5909\u5316\u3001\u697d\u3057\u3055\u3092\u6c42\u3081\u308b\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "creation",
      "name": "\u5275\u9020\u6b32\u6c42",
      "description": "\u8003\u3048\u3084\u611f\u899a\u3092\u5f62\u306b\u3057\u3001\u4f55\u304b\u3092\u751f\u307f\u51fa\u3057\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    },
    {
      "id": "meaning",
      "name": "\u610f\u5473\u6b32\u6c42",
      "description": "\u51fa\u6765\u4e8b\u3084\u884c\u52d5\u306b\u3001\u7269\u8a9e\u3001\u7f8e\u5b66\u3001\u601d\u60f3\u3001\u5b58\u5728\u7406\u7531\u3092\u898b\u51fa\u3057\u305f\u3044\u6b32\u6c42\u3067\u3059\u3002"
    }
  ],
  "questions": [
    {
      "id": "q001",
      "text": "\u4f11\u65e5\u306e\u5348\u524d\u4e2d\u306b\u4e88\u5b9a\u304c\u7a7a\u3044\u305f\u3068\u304d\u3001\u307e\u305a\u4f55\u3092\u3059\u308b\u304b\u3002",
      "choices": [
        {
          "text": "\u90e8\u5c4b\u3084\u6301\u3061\u7269\u3092\u6574\u3048\u3066\u3001\u843d\u3061\u7740\u3044\u3066\u904e\u3054\u305b\u308b\u72b6\u614b\u306b\u3059\u308b\u3002",
          "scores": {
            "stability": 0.6,
            "order": 0.4
          }
        },
        {
          "text": "\u6c17\u306b\u306a\u3063\u3066\u3044\u305f\u5834\u6240\u3078\u884c\u304d\u3001\u521d\u3081\u3066\u306e\u5e97\u3084\u9053\u3092\u8a66\u3059\u3002",
          "scores": {
            "stimulation": 0.6,
            "exploration": 0.4
          }
        },
        {
          "text": "\u4f5c\u308a\u304b\u3051\u306e\u6587\u7ae0\u3001\u7d75\u3001\u97f3\u697d\u3001\u4f01\u753b\u306a\u3069\u306b\u624b\u3092\u5165\u308c\u308b\u3002",
          "scores": {
            "creation": 0.7,
            "meaning": 0.3
          }
        },
        {
          "text": "\u5bb6\u65cf\u3084\u53cb\u4eba\u306b\u9023\u7d61\u3057\u3066\u3001\u4e00\u7dd2\u306b\u904e\u3054\u3059\u4e88\u5b9a\u3092\u8efd\u304f\u76f8\u8ac7\u3059\u308b\u3002",
          "scores": {
            "relationship": 0.6,
            "autonomy": 0.2,
            "stability": 0.2
          }
        }
      ]
    },
    {
      "id": "q002",
      "text": "\u65b0\u3057\u3044\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u306b\u53c2\u52a0\u3057\u305f\u76f4\u5f8c\u3001\u6700\u521d\u306b\u53d6\u308a\u305f\u3044\u884c\u52d5\u306f\u3069\u308c\u304b\u3002",
      "choices": [
        {
          "text": "\u76ee\u7684\u3001\u671f\u9650\u3001\u5f79\u5272\u3092\u78ba\u8a8d\u3057\u3066\u3001\u5168\u4f53\u306e\u6d41\u308c\u3092\u6574\u7406\u3059\u308b\u3002",
          "scores": {
            "order": 0.6,
            "stability": 0.2,
            "influence": 0.2
          }
        },
        {
          "text": "\u81ea\u5206\u304c\u4f38\u3070\u305b\u305d\u3046\u306a\u6280\u8853\u3084\u77e5\u8b58\u3092\u898b\u3064\u3051\u3001\u7df4\u7fd2\u306e\u4e88\u5b9a\u3092\u4f5c\u308b\u3002",
          "scores": {
            "growth": 0.7,
            "exploration": 0.3
          }
        },
        {
          "text": "\u4e00\u7dd2\u306b\u9032\u3081\u308b\u4eba\u306b\u58f0\u3092\u304b\u3051\u3001\u4e92\u3044\u306e\u5f97\u610f\u306a\u3053\u3068\u3092\u805e\u304f\u3002",
          "scores": {
            "relationship": 0.7,
            "recognition": 0.3
          }
        },
        {
          "text": "\u95a2\u4fc2\u8005\u306b\u5c0f\u3055\u306a\u6539\u5584\u6848\u3092\u51fa\u3057\u3001\u307e\u305a\u4e00\u3064\u8a66\u3057\u3066\u307f\u308b\u3002",
          "scores": {
            "influence": 0.6,
            "creation": 0.2,
            "growth": 0.2
          }
        }
      ]
    },
    {
      "id": "q003",
      "text": "\u610f\u898b\u304c\u5206\u304b\u308c\u305f\u4f1a\u8b70\u3067\u3001\u81ea\u5206\u304c\u81ea\u7136\u306b\u3057\u3084\u3059\u3044\u3053\u3068\u306f\u3069\u308c\u304b\u3002",
      "choices": [
        {
          "text": "\u5224\u65ad\u6750\u6599\u3092\u96c6\u3081\u3001\u306a\u305c\u9055\u3044\u304c\u51fa\u3066\u3044\u308b\u306e\u304b\u3092\u78ba\u8a8d\u3059\u308b\u3002",
          "scores": {
            "exploration": 0.6,
            "order": 0.4
          }
        },
        {
          "text": "\u81ea\u5206\u306e\u6848\u304c\u3069\u3046\u5f79\u7acb\u3064\u304b\u3092\u8aac\u660e\u3057\u3001\u5834\u3092\u524d\u306b\u9032\u3081\u308b\u3002",
          "scores": {
            "influence": 0.7,
            "recognition": 0.3
          }
        },
        {
          "text": "\u305d\u308c\u305e\u308c\u306e\u4e0d\u5b89\u3084\u671f\u5f85\u3092\u805e\u304d\u3001\u8a71\u3057\u3084\u3059\u3044\u7a7a\u6c17\u3092\u4f5c\u308b\u3002",
          "scores": {
            "relationship": 0.6,
            "stability": 0.4
          }
        },
        {
          "text": "\u3044\u3063\u305f\u3093\u81ea\u5206\u306e\u8003\u3048\u3092\u6301\u3061\u5e30\u308a\u3001\u7d0d\u5f97\u3067\u304d\u308b\u5f62\u306b\u6574\u7406\u3059\u308b\u3002",
          "scores": {
            "autonomy": 0.5,
            "meaning": 0.3,
            "order": 0.2
          }
        }
      ]
    },
    {
      "id": "q004",
      "text": "\u307e\u3068\u307e\u3063\u305f\u6642\u9593\u3092\u4f7f\u3063\u3066\u4f55\u304b\u3092\u6539\u5584\u3067\u304d\u308b\u306a\u3089\u3001\u3069\u308c\u3092\u9078\u3076\u304b\u3002",
      "choices": [
        {
          "text": "\u6bce\u65e5\u306e\u4f5c\u696d\u624b\u9806\u3092\u898b\u76f4\u3057\u3001\u8ff7\u308f\u305a\u9032\u3081\u3089\u308c\u308b\u5f62\u306b\u3059\u308b\u3002",
          "scores": {
            "order": 0.5,
            "growth": 0.3,
            "stability": 0.2
          }
        },
        {
          "text": "\u81ea\u5206\u3067\u6c7a\u3081\u305f\u30c6\u30fc\u30de\u3092\u6df1\u6398\u308a\u3057\u3001\u7d0d\u5f97\u3067\u304d\u308b\u307e\u3067\u8abf\u3079\u308b\u3002",
          "scores": {
            "autonomy": 0.4,
            "exploration": 0.4,
            "meaning": 0.2
          }
        },
        {
          "text": "\u4eba\u306b\u898b\u305b\u3089\u308c\u308b\u6210\u679c\u7269\u3068\u3057\u3066\u3001\u5f62\u3084\u8868\u73fe\u3092\u78e8\u304d\u8fbc\u3080\u3002",
          "scores": {
            "creation": 0.5,
            "recognition": 0.3,
            "growth": 0.2
          }
        },
        {
          "text": "\u65b0\u3057\u3044\u9053\u5177\u3084\u8868\u73fe\u65b9\u6cd5\u3092\u8a66\u3057\u3066\u3001\u4f5c\u696d\u306b\u5909\u5316\u3092\u5165\u308c\u308b\u3002",
          "scores": {
            "stimulation": 0.4,
            "creation": 0.4,
            "exploration": 0.2
          }
        }
      ]
    },
    {
      "id": "q005",
      "text": "\u6b21\u306e\u4e00\u9031\u9593\u3092\u81ea\u5206\u3089\u3057\u304f\u904e\u3054\u3059\u305f\u3081\u306b\u3001\u6700\u3082\u8fd1\u3044\u884c\u52d5\u306f\u3069\u308c\u304b\u3002",
      "choices": [
        {
          "text": "\u4e88\u5b9a\u3092\u8a70\u3081\u8fbc\u307f\u3059\u304e\u305a\u3001\u4f11\u3080\u6642\u9593\u3068\u5b89\u5fc3\u3067\u304d\u308b\u5834\u6240\u3092\u78ba\u4fdd\u3059\u308b\u3002",
          "scores": {
            "stability": 0.7,
            "autonomy": 0.3
          }
        },
        {
          "text": "\u8ab0\u304b\u306e\u5f79\u306b\u7acb\u3064\u5c0f\u3055\u306a\u50cd\u304d\u304b\u3051\u3092\u6c7a\u3081\u3001\u5b9f\u969b\u306b\u52d5\u3044\u3066\u307f\u308b\u3002",
          "scores": {
            "influence": 0.5,
            "relationship": 0.3,
            "meaning": 0.2
          }
        },
        {
          "text": "\u666e\u6bb5\u9078\u3070\u306a\u3044\u4e88\u5b9a\u3092\u4e00\u3064\u5165\u308c\u3001\u6c17\u5206\u304c\u52d5\u304f\u4f53\u9a13\u3092\u4f5c\u308b\u3002",
          "scores": {
            "stimulation": 0.7,
            "autonomy": 0.3
          }
        },
        {
          "text": "\u4e00\u9031\u9593\u306e\u4e2d\u3067\u3001\u81ea\u5206\u306e\u8003\u3048\u3084\u6c17\u6301\u3061\u3092\u5f62\u306b\u3059\u308b\u6642\u9593\u3092\u4f5c\u308b\u3002",
          "scores": {
            "creation": 0.5,
            "meaning": 0.3,
            "autonomy": 0.2
          }
        }
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

  function formatPercent(value) {
    return Math.round(Math.max(0, Number(value) || 0) * 100) + "%";
  }

  function getRequestedDataset() {
    var params = new URLSearchParams(window.location.search);
    var dataset = params.get("dataset") || "production";
    if (!Object.prototype.hasOwnProperty.call(DATASETS, dataset)) {
      console.warn("Unknown dataset '" + dataset + "'. Falling back to production.");
      return "production";
    }
    return dataset;
  }

  function fetchJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error(path + "を読み込めない状態です。");
      }
      return response.json();
    });
  }

  function loadData() {
    var requestedDataset = getRequestedDataset();
    return Promise.all([
      fetchJson("data/desires.json"),
      fetchJson(DATASETS[requestedDataset])
    ]).then(function (results) {
      return {
        desires: results[0],
        questions: results[1],
        dataset: requestedDataset,
        requestedDataset: requestedDataset,
        warning: ""
      };
    }).catch(function (error) {
      if (window.location.protocol !== "file:") {
        console.error("Failed to load Motivector dataset over HTTP(S).", error);
        throw error;
      }
      var warning = "質問データのfetchに失敗したため、sampleフォールバックを使っています。";
      console.warn(warning, error);
      return {
        desires: fallbackData.desires,
        questions: fallbackData.questions,
        dataset: "sample fallback",
        requestedDataset: requestedDataset,
        warning: warning
      };
    });
  }

  function runValidation(data) {
    if (!window.MotivectorValidation) {
      return null;
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
      console.info("検証エラーはありません。");
    }
    console.groupEnd();
    return report;
  }

  function renderStatus() {
    var errors = state.validationReport ? state.validationReport.errors.length : 0;
    var warnings = state.validationReport ? state.validationReport.warnings.length : 0;
    var requestedHtml = state.requestedDataset !== state.dataset
      ? "<span>Requested: " + escapeHtml(state.requestedDataset) + "</span>"
      : "";
    var warningHtml = state.dataWarning
      ? '<span class="status-warning">' + escapeHtml(state.dataWarning) + "</span>"
      : "";
    return [
      '<div class="status-strip">',
      "<span>Dataset: " + escapeHtml(state.dataset) + "</span>",
      requestedHtml,
      "<span>Validation: " + errors + " errors, " + warnings + " warnings</span>",
      warningHtml,
      "</div>"
    ].join("");
  }

  function resetAppClass() {
    app.className = "card";
  }

  function renderTitle() {
    var isSample = state.dataset === "sample" || state.dataset === "sample fallback";
    var questionLabel = (isSample ? "動作確認用" : "全") + state.questions.length + "問";
    var timeHtml = isSample ? "" : '<span class="intro-fact">所要時間の目安: 約10〜15分</span>';
    resetAppClass();
    app.innerHTML = [
      renderStatus(),
      '<p class="eyebrow">Motivector</p>',
      "<h1>ココロの成分表</h1>",
      '<div class="intro-facts"><span class="intro-fact">' + escapeHtml(questionLabel) + "</span>" + timeHtml + "</div>",
      '<p class="lead">深く考えすぎず、今の自分に近い選択肢を選んでください。</p>',
      '<p class="notice">この結果は性格や能力を断定するものではなく、今回の回答から欲求の表れ方を整理したものです。</p>',
      '<p class="start-caution">Motivectorは、独自の分類に基づく自己理解支援コンテンツです。医学的・心理学的診断や、学術的に確立された心理検査ではありません。</p>',
      '<button class="primary-button" type="button" id="start-button">診断を開始する</button>'
    ].join("");
    document.getElementById("start-button").addEventListener("click", function () {
      state.answers = [];
      state.currentIndex = 0;
      renderQuestion();
    });
  }

  function buildSelectedAnswers() {
    return state.answers.map(function (choiceIndex, questionIndex) {
      var question = state.questions[questionIndex];
      return question && question.choices[choiceIndex];
    }).filter(Boolean);
  }

  function renderQuestion() {
    var question = state.questions[state.currentIndex];
    var selectedAnswerIndex = state.answers[state.currentIndex];
    var choiceHtml = question.choices.map(function (choice, index) {
      var isSelected = selectedAnswerIndex === index;
      var selectedLabel = isSelected ? '<span class="selected-label">選択中</span>' : "";
      return [
        '<button class="choice-button' + (isSelected ? " is-selected" : "") + '" type="button" data-choice-index="' + index + '" aria-pressed="' + (isSelected ? "true" : "false") + '">',
        selectedLabel,
        "<span>" + escapeHtml(choice.text) + "</span>",
        "</button>"
      ].join("");
    }).join("");
    var canGoBack = state.currentIndex > 0;
    resetAppClass();
    app.innerHTML = [
      renderStatus(),
      '<div class="question-meta">',
      "<span>質問 " + (state.currentIndex + 1) + " / " + state.questions.length + "</span>",
      "<span>" + escapeHtml(question.id) + "</span>",
      "</div>",
      "<h2>" + escapeHtml(question.text) + "</h2>",
      '<div class="question-actions"><button class="back-button" type="button" id="back-button"' + (canGoBack ? "" : " disabled") + ">前の問題へ戻る</button></div>",
      '<div class="choices">' + choiceHtml + "</div>"
    ].join("");
    document.getElementById("back-button").addEventListener("click", function () {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        renderQuestion();
      }
    });
    app.querySelectorAll(".choice-button").forEach(function (button) {
      button.addEventListener("click", function () {
        state.answers[state.currentIndex] = Number(button.getAttribute("data-choice-index"));
        state.currentIndex += 1;
        if (state.currentIndex >= state.questions.length) {
          renderResult();
        } else {
          renderQuestion();
        }
      });
    });
  }
  function renderTopNeeds(topThree) {
    return topThree.map(function (need, index) {
      return [
        '<article class="top-need-card">',
        '<div class="need-heading"><span class="rank-badge">' + (index + 1) + "位</span>",
        "<h3>" + escapeHtml(need.name) + "</h3>",
        '<strong class="need-score">今回の回答での表れ方: ' + formatPercent(need.normalized_score) + "</strong></div>",
        '<p class="need-description">' + escapeHtml(need.description) + "</p>",
        '<p class="need-result-text">' + escapeHtml(window.MotivectorResultText.buildTopNeedText(need)) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderBottomNeeds(bottomTwo) {
    return bottomTwo.map(function (need) {
      return [
        '<article class="low-need-item">',
        '<div class="need-heading compact"><h3>' + escapeHtml(need.name) + "</h3>",
        '<strong class="need-score">今回の回答での表れ方: ' + formatPercent(need.normalized_score) + "</strong></div>",
        '<p class="need-description">' + escapeHtml(need.description) + "</p>",
        '<p class="need-result-text">' + escapeHtml(window.MotivectorResultText.buildBottomNeedText(need)) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderBalanceBars(rankedNeeds) {
    return rankedNeeds.map(function (need) {
      var percent = Math.max(0, Math.min(100, need.normalized_score * 100));
      var percentText = formatPercent(need.normalized_score);
      return [
        '<div class="balance-row">',
        '<div class="balance-label"><span>' + escapeHtml(need.name) + "</span><strong>" + percentText + "</strong></div>",
        '<div class="balance-track" role="img" aria-label="' + escapeHtml(need.name + " " + percentText) + '">',
        '<span class="balance-fill" style="width: ' + percent.toFixed(1) + '%"></span></div></div>'
      ].join("");
    }).join("");
  }

  function renderScoreDetails(rankedNeeds) {
    return rankedNeeds.map(function (need) {
      return [
        '<div class="score-detail-item"><h3>' + escapeHtml(need.name) + "</h3><dl>",
        "<div><dt>raw_score</dt><dd>" + formatDecimal(need.raw_score) + "</dd></div>",
        "<div><dt>max_possible_score</dt><dd>" + formatDecimal(need.max_possible_score) + "</dd></div>",
        "<div><dt>normalized_score</dt><dd>" + formatDecimal(need.normalized_score) + "</dd></div>",
        "<div><dt>component_ratio</dt><dd>" + formatDecimal(need.component_ratio) + " (" + formatPercent(need.component_ratio) + ")</dd></div>",
        "</dl></div>"
      ].join("");
    }).join("");
  }

  function renderResultVisual(primaryNeed, secondaryNeed) {
    if (!primaryNeed || !secondaryNeed) {
      return "";
    }

    var altText = primaryNeed.name + "を主成分、" + secondaryNeed.name
      + "を副成分としたMotivectorキャラクター";

    return [
      '<figure class="result-visual">',
      '<div class="result-visual-stage">',
      '<img class="result-visual-image" id="result-visual-image" alt="' + escapeHtml(altText) + '">',
      '<p class="result-visual-fallback" id="result-visual-fallback" hidden>組み合わせ画像を表示できませんでした。</p>',
      "</div>",
      '<figcaption class="result-visual-caption">',
      "<span><strong>1位：</strong>" + escapeHtml(primaryNeed.name) + "のキャラクター</span>",
      '<span class="result-visual-separator" aria-hidden="true">＋</span>',
      "<span><strong>2位：</strong>" + escapeHtml(secondaryNeed.name) + "のエフェクト</span>",
      "</figcaption>",
      "</figure>"
    ].join("");
  }

  function setupResultVisual(primaryNeed, secondaryNeed, imagePath) {
    var image = document.getElementById("result-visual-image");
    var fallback = document.getElementById("result-visual-fallback");

    if (!image || !imagePath) {
      return;
    }

    image.addEventListener("error", function () {
      console.warn("結果画像を読み込めませんでした。", {
        primaryNeedId: primaryNeed.id,
        secondaryNeedId: secondaryNeed.id,
        imagePath: imagePath
      });
      image.hidden = true;
      if (fallback) {
        fallback.hidden = false;
      }
    });
    image.src = imagePath;
  }

  function renderResult() {
    var scores = window.MotivectorScoring.scoreAnswers(state.desires, state.questions, buildSelectedAnswers());
    var model = window.MotivectorScoring.buildResultModel(state.desires, scores);
    var primaryNeed = model.topThree[0];
    var secondaryNeed = model.topThree[1];
    var resultPicturePath = window.MotivectorResultPictures.buildPath(primaryNeed.id, secondaryNeed.id);
    app.className = "card result-view";
    app.innerHTML = [
      renderStatus(),
      '<header class="result-header"><p class="eyebrow">診断結果</p><h1>今回のココロの成分表</h1>',
      '<p class="lead">' + escapeHtml(window.MotivectorResultText.buildTopIntroduction(model.topThree)) + "</p></header>",
      renderResultVisual(primaryNeed, secondaryNeed),
      '<section class="result-section" aria-labelledby="top-needs-title"><h2 id="top-needs-title">あなたを動かしやすい3つの成分</h2>',
      '<div class="top-needs">' + renderTopNeeds(model.topThree) + "</div></section>",
      '<section class="result-section low-needs-section" aria-labelledby="low-needs-title"><h2 id="low-needs-title">今回、前面には出にくかった成分</h2>',
      '<p class="section-note">' + escapeHtml(window.MotivectorResultText.buildBottomIntroduction()) + "</p>",
      '<div class="low-needs">' + renderBottomNeeds(model.bottomTwo) + "</div></section>",
      '<section class="result-section" aria-labelledby="balance-title"><h2 id="balance-title">11成分のバランス</h2>',
      '<p class="section-note">棒の長さは、今回の設問の中で各成分がどの程度表れたかを示しています。ほかの人との比較ではなく、回答をこの診断内で整理した値です。</p>',
      '<div class="balance-chart">' + renderBalanceBars(model.rankedNeeds) + "</div></section>",
      '<details class="score-details"><summary>詳しいスコアを見る</summary>',
      '<p class="section-note">成分比率は、11成分のnormalized_scoreを合計1として見たときの相対的な割合です。</p>',
      '<div class="score-detail-list">' + renderScoreDetails(model.rankedNeeds) + "</div></details>",
      '<section class="result-caution" aria-labelledby="result-caution-title"><h2 id="result-caution-title">結果についての注意</h2>',
      '<p>結果は、回答時点で表れた傾向を示す参考情報です。欲求の高低は、人としての優劣や能力の有無を示すものではありません。結果は、状況、環境、経験、気分などによって変化する可能性があります。</p></section>',
      '<button class="secondary-button restart-button" type="button" id="restart-button">もう一度診断する</button>'
    ].join("");
    setupResultVisual(primaryNeed, secondaryNeed, resultPicturePath);
    document.getElementById("restart-button").addEventListener("click", function () {
      state.answers = [];
      state.currentIndex = 0;
      renderTitle();
    });
  }

  function renderError(error) {
    resetAppClass();
    app.innerHTML = '<p class="error">データの読み込みに失敗しました。' + escapeHtml(error.message) + "</p>";
  }

  loadData().then(function (data) {
    state.dataset = data.dataset;
    state.requestedDataset = data.requestedDataset;
    state.dataWarning = data.warning;
    state.validationReport = runValidation(data);
    state.desires = data.desires;
    state.questions = data.questions;
    renderTitle();
  }).catch(renderError);
})();
