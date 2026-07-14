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

  function buildResultPicturePath(primaryNeedId, secondaryNeedId) {
    var characterId = RESULT_PICTURE_ID_MAP[primaryNeedId];
    var effectId = RESULT_PICTURE_ID_MAP[secondaryNeedId];

    if (!characterId || !effectId) {
      return "";
    }

    return "pictures/character_" + characterId
      + "__effect_" + effectId + ".png";
  }

  window.MotivectorResultPictures = {
    idMap: RESULT_PICTURE_ID_MAP,
    buildPath: buildResultPicturePath
  };
})();
