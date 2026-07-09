(function () {
  "use strict";

  function createReport() {
    return { errors: [], warnings: [], summary: {} };
  }

  function pushIssue(list, code, message, path) {
    list.push({ code: code, message: message, path: path });
  }

  function calculateMaxPossibleScores(desires, questions) {
    var maxScores = desires.reduce(function (scores, desire) {
      scores[desire.id] = 0;
      return scores;
    }, {});

    questions.forEach(function (question) {
      if (!Array.isArray(question.choices)) {
        return;
      }

      desires.forEach(function (desire) {
        var questionMax = question.choices.reduce(function (max, choice) {
          var scores = choice && choice.scores ? choice.scores : {};
          var score = Number(scores[desire.id]) || 0;
          return Math.max(max, score);
        }, 0);
        maxScores[desire.id] += questionMax;
      });
    });

    return maxScores;
  }

  function validateData(desires, questions) {
    var report = createReport();
    var desireIds = new Set();

    if (!Array.isArray(desires)) {
      pushIssue(report.errors, "desires_not_array", "desires.jsonは配列である必要がある。", "desires");
      desires = [];
    }

    if (!Array.isArray(questions)) {
      pushIssue(report.errors, "questions_not_array", "questions.jsonは配列である必要がある。", "questions");
      questions = [];
    }

    desires.forEach(function (desire, index) {
      var path = "desires[" + index + "]";
      if (!desire.id || !desire.name || !desire.description) {
        pushIssue(report.errors, "desire_required_field", "欲求定義にid、name、descriptionが必要である。", path);
      }
      if (desireIds.has(desire.id)) {
        pushIssue(report.errors, "duplicate_desire_id", "欲求idが重複している。", path + ".id");
      }
      desireIds.add(desire.id);
    });

    questions.forEach(function (question, questionIndex) {
      var questionPath = "questions[" + questionIndex + "]";
      if (!question.id || !question.text || !Array.isArray(question.choices)) {
        pushIssue(report.errors, "question_required_field", "各質問にid、text、choicesが必要である。", questionPath);
        return;
      }

      if (!question.choices.length) {
        pushIssue(report.errors, "question_without_choices", "質問に選択肢が必要である。", questionPath + ".choices");
      }

      question.choices.forEach(function (choice, choiceIndex) {
        var choicePath = questionPath + ".choices[" + choiceIndex + "]";
        if (!choice.text || !choice.scores || typeof choice.scores !== "object" || Array.isArray(choice.scores)) {
          pushIssue(report.errors, "choice_required_field", "各選択肢にtextとscoresが必要である。", choicePath);
          return;
        }

        var scoreIds = Object.keys(choice.scores);
        var total = scoreIds.reduce(function (sum, desireId) {
          var score = Number(choice.scores[desireId]);
          if (!desireIds.has(desireId)) {
            pushIssue(report.errors, "unknown_score_id", "scoresの欲求idがdesires.jsonに存在しない。", choicePath + ".scores." + desireId);
          }
          if (!Number.isFinite(score) || score < 0) {
            pushIssue(report.errors, "invalid_score_value", "scoresの値は0以上の数値である必要がある。", choicePath + ".scores." + desireId);
            return sum;
          }
          return sum + score;
        }, 0);

        if (scoreIds.length < 2 || scoreIds.length > 3) {
          pushIssue(report.warnings, "score_target_count", "選択肢の配点先は2〜3欲求程度が望ましい。", choicePath + ".scores");
        }

        if (total < 0.8 || total > 1.2) {
          pushIssue(report.warnings, "score_total_range", "選択肢の合計配点が1.0から大きく離れている。", choicePath + ".scores");
        }
      });
    });

    var maxScores = calculateMaxPossibleScores(desires, questions);
    var values = Object.keys(maxScores).map(function (id) { return maxScores[id]; });
    var positiveValues = values.filter(function (value) { return value > 0; });
    var average = positiveValues.length ? positiveValues.reduce(function (sum, value) { return sum + value; }, 0) / positiveValues.length : 0;

    Object.keys(maxScores).forEach(function (desireId) {
      var value = maxScores[desireId];
      if (value === 0) {
        pushIssue(report.warnings, "max_score_zero", "欲求のmax_possible_scoreが0である。", "max_possible_score." + desireId);
      } else if (average > 0 && (value > average * 1.6 || value < average * 0.4)) {
        pushIssue(report.warnings, "max_score_imbalance", "欲求のmax_possible_scoreに偏りが大きい可能性がある。", "max_possible_score." + desireId);
      }
    });

    report.summary = {
      desire_count: desires.length,
      question_count: questions.length,
      error_count: report.errors.length,
      warning_count: report.warnings.length,
      max_possible_score: maxScores
    };

    return report;
  }

  window.MotivectorValidation = {
    validateData: validateData
  };
})();
