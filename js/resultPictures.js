(function () {
  "use strict";

  var RESULT_PICTURE_ID_MAP = Object.freeze({
    stability: "stability",
    autonomy: "autonomy",
    growth: "growth",
    exploration: "inquiry",
    relationship: "connection",
    recognition: "recognition",
    influence: "influence",
    order: "order",
    stimulation: "stimulation",
    creation: "creation",
    meaning: "meaning"
  });

  var RESULT_CHARACTER_NAME_MAP = Object.freeze({
    stability: "よりどころヤドカリ",
    autonomy: "みちえらびキツネ",
    growth: "えだづのジカ",
    inquiry: "ほしめフクロウ",
    connection: "わっかラッコ",
    recognition: "ひかりばねクジャク",
    influence: "なみあとゾウ",
    order: "ますめビーバー",
    stimulation: "いろはねカメレオン",
    creation: "かたちタコ",
    meaning: "ものがたりクジラ"
  });

  var RESULT_EFFECT_MODIFIER_MAP = Object.freeze({
    stability: "安心をまとった",
    autonomy: "自分の道を選ぶ",
    growth: "一歩ずつ育つ",
    inquiry: "未知を見つめる",
    connection: "つながりを大切にする",
    recognition: "努力が光る",
    influence: "波紋を広げる",
    order: "すっきり整える",
    stimulation: "変化を楽しむ",
    creation: "ひらめきを形にする",
    meaning: "物語をつなぐ"
  });

  function buildResultPicturePath(primaryNeedId, secondaryNeedId) {
    var characterId = RESULT_PICTURE_ID_MAP[primaryNeedId];
    var effectId = RESULT_PICTURE_ID_MAP[secondaryNeedId];

    if (!characterId || !effectId) {
      return "";
    }

    return "pictures/character_" + characterId
      + "__effect_" + effectId + ".png";
  }

  function buildResultDisplayName(primaryNeedId, secondaryNeedId) {
    var characterId = RESULT_PICTURE_ID_MAP[primaryNeedId];
    var effectId = RESULT_PICTURE_ID_MAP[secondaryNeedId];
    var characterName = RESULT_CHARACTER_NAME_MAP[characterId];
    var modifier = RESULT_EFFECT_MODIFIER_MAP[effectId];

    if (!characterName || !modifier) {
      return "";
    }

    return modifier + "「" + characterName + "」";
  }

  window.MotivectorResultPictures = {
    idMap: RESULT_PICTURE_ID_MAP,
    characterNames: RESULT_CHARACTER_NAME_MAP,
    effectModifiers: RESULT_EFFECT_MODIFIER_MAP,
    buildPath: buildResultPicturePath,
    buildDisplayName: buildResultDisplayName
  };
})();
