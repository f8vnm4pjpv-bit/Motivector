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

  function rankNeeds(desires, scores) {
    return desires
      .map(function (desire, order) {
        return {
          id: desire.id,
          name: desire.name,
          description: desire.description,
          order: order,
          raw_score: scores.raw_score[desire.id] || 0,
          max_possible_score: scores.max_possible_score[desire.id] || 0,
          normalized_score: scores.normalized_score[desire.id] || 0,
          component_ratio: scores.component_ratio[desire.id] || 0
        };
      })
      .sort(function (a, b) {
        return (b.normalized_score - a.normalized_score) || (a.order - b.order);
      });
  }

  function buildResultModel(desires, scores) {
    var rankedNeeds = rankNeeds(desires, scores);
    var topThree = rankedNeeds.slice(0, Math.min(3, rankedNeeds.length));
    var topIds = new Set(topThree.map(function (need) { return need.id; }));
    var bottomTwo = rankedNeeds
      .slice()
      .sort(function (a, b) {
        return (a.normalized_score - b.normalized_score) || (a.order - b.order);
      })
      .filter(function (need) { return !topIds.has(need.id); })
      .slice(0, Math.min(2, Math.max(0, rankedNeeds.length - topThree.length)));

    return {
      rankedNeeds: rankedNeeds,
      topThree: topThree,
      bottomTwo: bottomTwo,
      primaryNeedId: topThree[0] ? topThree[0].id : "",
      secondaryNeedId: topThree[1] ? topThree[1].id : "",
      bottomNeedId: bottomTwo[0] ? bottomTwo[0].id : "",
      topThreeNeedIds: topThree.map(function (need) { return need.id; }),
      bottomTwoNeedIds: bottomTwo.map(function (need) { return need.id; }),
      scores: scores
    };
  }

  function scoreAnswers(desires, questions, answers) {
    var rawScores = calculateRawScores(desires, answers);
    var maxScores = calculateMaxPossibleScores(desires, questions);
    var normalizedScores = normalizeScores(desires, rawScores, maxScores);
    var componentRatios = calculateComponentRatios(desires, normalizedScores);
    var scores = {
      raw_score: rawScores,
      max_possible_score: maxScores,
      normalized_score: normalizedScores,
      component_ratio: componentRatios
    };

    scores.top_desires = rankNeeds(desires, scores).slice(0, 3);
    return scores;
  }

  window.MotivectorScoring = {
    scoreAnswers: scoreAnswers,
    buildResultModel: buildResultModel
  };
})();
