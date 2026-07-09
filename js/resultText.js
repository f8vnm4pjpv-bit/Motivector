(function () {
  "use strict";

  function buildResultText(topDesires) {
    if (!topDesires.length) {
      return "まだ十分な結果を表示できない状態である。";
    }

    var first = topDesires[0];
    var second = topDesires[1];
    var third = topDesires[2];

    if (!second || !third) {
      return first.name + "が比較的強く表れている。";
    }

    return "今回の仮診断では、" + first.name + "を中心に、" + second.name + "と" + third.name + "も表れている。行動の選び方に、これらの欲求が影響している可能性がある。";
  }

  window.MotivectorResultText = {
    buildResultText: buildResultText
  };
})();
