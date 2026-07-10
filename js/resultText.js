(function () {
  "use strict";

  var TOP_MESSAGES = {
    stability: "安心できる見通しや無理のない状態が、行動を選ぶきっかけになりやすいようである。",
    autonomy: "自分で選び、自分のペースで進められることを重視しやすい傾向がある。",
    growth: "できることを増やし、前進を実感できることが行動のきっかけになりやすいようである。",
    exploration: "未知のことを知り、仕組みを理解することを重視しやすい傾向がある。",
    relationship: "人とのつながりや、互いに動きやすい関係を重視しやすい傾向がある。",
    recognition: "努力や価値をきちんと見てもらえることが、行動の力になりやすいようである。",
    influence: "自分の働きかけで周囲や状況が良くなることを重視しやすい傾向がある。",
    order: "情報や手順を整理し、見通しを立てることが行動のきっかけになりやすいようである。",
    stimulation: "新しさや変化、面白さに触れることを重視しやすい傾向がある。",
    creation: "考えや感覚を自分なりの形にすることが、行動の力になりやすいようである。",
    meaning: "行動の意味や背景に納得できることを重視しやすい傾向がある。"
  };

  function buildTopIntroduction(topThree) {
    if (!topThree.length) {
      return "十分な回答がないため、上位成分を表示できない状態である。";
    }
    return "今回の回答では、" + topThree.map(function (need) { return need.name; }).join("、") + "が比較的強く表れた。これらは、今の行動を選ぶときに優先されやすかった成分である。";
  }

  function buildTopNeedText(need) {
    return "今回の回答で比較的強く表れた成分である。" + (TOP_MESSAGES[need.id] || "状況によって表れ方は変わる傾向である。");
  }

  function buildBottomIntroduction() {
    return "ここに表示される成分は、存在しない、能力が低い、短所であるという意味ではない。今回の設問では、ほかの成分より相対的に優先されにくかったものであり、状況や役割によって表れ方は変わる。";
  }

  function buildBottomNeedText(need) {
    return "今回の回答では、" + need.name + "はほかの成分より前面に出にくかった。必要性がないという意味ではなく、状況によって優先度は変わる。";
  }

  function buildResultText(topDesires) {
    return buildTopIntroduction(topDesires || []);
  }

  window.MotivectorResultText = {
    buildTopIntroduction: buildTopIntroduction,
    buildTopNeedText: buildTopNeedText,
    buildBottomIntroduction: buildBottomIntroduction,
    buildBottomNeedText: buildBottomNeedText,
    buildResultText: buildResultText
  };
})();
