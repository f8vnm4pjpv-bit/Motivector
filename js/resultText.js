(function () {
  "use strict";

  var TOP_MESSAGES = {
    stability: "安心できる見通しや無理のない状態が、行動を選ぶきっかけになりやすいようです。",
    autonomy: "自分で選び、自分のペースで進められることを重視しやすい傾向があります。",
    growth: "できることを増やし、前進を実感できることが行動のきっかけになりやすいようです。",
    exploration: "未知のことを知り、仕組みを理解することを重視しやすい傾向があります。",
    relationship: "人とのつながりや、互いに動きやすい関係を重視しやすい傾向があります。",
    recognition: "努力や価値をきちんと見てもらえることが、行動の力になりやすいようです。",
    influence: "自分の働きかけで周囲や状況が良くなることを重視しやすい傾向があります。",
    order: "情報や手順を整理し、見通しを立てることが行動のきっかけになりやすいようです。",
    stimulation: "新しさや変化、面白さに触れることを重視しやすい傾向があります。",
    creation: "考えや感覚を自分なりの形にすることが、行動の力になりやすいようです。",
    meaning: "行動の意味や背景に納得できることを重視しやすい傾向があります。"
  };

  function buildTopIntroduction(topThree) {
    if (!topThree.length) {
      return "十分な回答がないため、上位成分を表示できない状態です。";
    }
    return "今回の回答では、" + topThree.map(function (need) { return need.name; }).join("、") + "が比較的強く表れています。これらは、今の行動を選ぶときに優先されやすかった成分です。";
  }

  function buildTopNeedText(need) {
    return TOP_MESSAGES[need.id] || "状況によって表れ方は変わる傾向があります。";
  }

  function buildBottomIntroduction() {
    return "ほかの成分より前面に出にくかった成分です。必要性がないという意味ではなく、状況によって優先度は変わります。";
  }

  function buildResultText(topDesires) {
    return buildTopIntroduction(topDesires || []);
  }

  window.MotivectorResultText = {
    buildTopIntroduction: buildTopIntroduction,
    buildTopNeedText: buildTopNeedText,
    buildBottomIntroduction: buildBottomIntroduction,
    buildResultText: buildResultText
  };
})();
