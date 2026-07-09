(function () {
  "use strict";

  function createScoreMap(desires, initialValue) {
    return desires.reduce(function (scores, desire) {
      scores[desire.id] = initialValue;
      return scores;
    }, {});
  }

  function calculateMaxPossibleScores(desires, questions) {
    var maxScores = createScoreMap(desires, 0);

    questions.forEach(function (question) {
      var choices = Array.isArray(question.choices) ? question.choices : [];
      desires.forEach(function (desire) {
        var questionMax = choices.reduce(function (max, choice) {
          var scores = choice.scores || {};
          var score = Number(scores[desire.id]) || 0;
          return Math.max(max, score);
        }, 0);
        maxScores[desire.id] += questionMax;
      });
    });

    return maxScores;
  }

  function calculateRawScores(desires, answers) {
    var rawScores = createScoreMap(desires, 0);

    answers.forEach(function (choice) {
      var scores = choice.scores || {};
      Object.keys(scores).forEach(function (desireId) {
        if (Object.prototype.hasOwnProperty.call(rawScores, desireId)) {
          rawScores[desireId] += Number(scores[desireId]) || 0;
        }
      });
    });

    return rawScores;
  }

  function normalizeScores(desires, rawScores, maxScores) {
    return desires.reduce(function (normalized, desire) {
      var maxScore = maxScores[desire.id];
      normalized[desire.id] = maxScore > 0 ? rawScores[desire.id] / maxScore : 0;
      return normalized;
    }, {});
  }

  function calculateComponentRatios(desires, normalizedScores) {
    var sum = desires.reduce(function (total, desire) {
      return total + normalizedScores[desire.id];
    }, 0);

    return desires.reduce(function (ratios, desire) {
      ratios[desire.id] = sum > 0 ? normalizedScores[desire.id] / sum : 0;
      return ratios;
    }, {});
  }

  function getTopDesires(desires, componentRatios, limit) {
    return desires
      .map(function (desire) {
        return {
          id: desire.id,
          name: desire.name,
          description: desire.description,
          component_ratio: componentRatios[desire.id] || 0
        };
      })
      .sort(function (a, b) {
        return b.component_ratio - a.component_ratio;
      })
      .slice(0, limit);
  }

  function scoreAnswers(desires, questions, answers) {
    var rawScores = calculateRawScores(desires, answers);
    var maxScores = calculateMaxPossibleScores(desires, questions);
    var normalizedScores = normalizeScores(desires, rawScores, maxScores);
    var componentRatios = calculateComponentRatios(desires, normalizedScores);

    return {
      raw_score: rawScores,
      max_possible_score: maxScores,
      normalized_score: normalizedScores,
      component_ratio: componentRatios,
      top_desires: getTopDesires(desires, componentRatios, 3)
    };
  }

  window.MotivectorScoring = {
    scoreAnswers: scoreAnswers
  };
})();
