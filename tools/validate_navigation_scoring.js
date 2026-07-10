const fs = require("fs");
const vm = require("vm");

const datasets = {
  production: "data/questions.json",
  sample: "data/questions_sample.json",
  draft: "data/questions_draft_v1.json",
  unknown: "data/questions.json",
};

const desires = JSON.parse(fs.readFileSync("data/desires.json", "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/scoring.js", "utf8"), context);
const scoring = context.window.MotivectorScoring;

function answer(state, choiceIndex) {
  state.answers[state.currentIndex] = choiceIndex;
  state.currentIndex += 1;
}

function back(state) {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
  }
}

function toChoices(questions, answerIndexes) {
  return answerIndexes.map((choiceIndex, questionIndex) => questions[questionIndex].choices[choiceIndex]);
}

function resultSnapshot(questions, answerIndexes) {
  const scores = scoring.scoreAnswers(desires, questions, toChoices(questions, answerIndexes));
  const model = scoring.buildResultModel(desires, scores);
  return {
    raw_score: scores.raw_score,
    normalized_score: scores.normalized_score,
    component_ratio: scores.component_ratio,
    topThreeNeedIds: model.topThreeNeedIds,
    bottomTwoNeedIds: model.bottomTwoNeedIds,
    rankedBars: model.rankedNeeds.map((need) => [need.id, need.normalized_score]),
  };
}

function assertEqual(name, actual, expected) {
  const actualText = JSON.stringify(actual);
  const expectedText = JSON.stringify(expected);
  if (actualText !== expectedText) {
    throw new Error(`${name} mismatch\nactual: ${actualText}\nexpected: ${expectedText}`);
  }
}

function validateDataset(name, path) {
  const questions = JSON.parse(fs.readFileSync(path, "utf8"));
  const finalAnswers = questions.map((question, index) => index % question.choices.length);
  const directSnapshot = resultSnapshot(questions, finalAnswers);
  const state = { answers: [], currentIndex: 0 };

  answer(state, finalAnswers[0]);
  if (state.currentIndex !== 1 || state.answers[0] !== finalAnswers[0]) {
    throw new Error(`${name}: first answer did not auto-advance or persist`);
  }
  back(state);
  if (state.currentIndex !== 0 || state.answers[0] !== finalAnswers[0]) {
    throw new Error(`${name}: back removed the first answer`);
  }
  answer(state, (finalAnswers[0] + 1) % questions[0].choices.length);
  if (state.answers[0] === finalAnswers[0]) {
    throw new Error(`${name}: changed answer was not overwritten`);
  }
  back(state);
  answer(state, finalAnswers[0]);

  for (let i = state.currentIndex; i < Math.min(5, questions.length); i += 1) {
    answer(state, (finalAnswers[i] + 1) % questions[i].choices.length);
  }
  while (state.currentIndex > 1) {
    back(state);
  }
  if (state.answers[state.currentIndex] === undefined) {
    throw new Error(`${name}: previous answer was not restored after multiple backs`);
  }
  while (state.currentIndex < questions.length) {
    answer(state, finalAnswers[state.currentIndex]);
  }

  assertEqual(`${name} answers`, state.answers, finalAnswers);
  assertEqual(`${name} score snapshot`, resultSnapshot(questions, state.answers), directSnapshot);

  const choiceCount = questions.reduce((total, question) => total + question.choices.length, 0);
  console.log(`${name}: ${questions.length} questions, ${choiceCount} choices, navigation score check passed`);
}

Object.entries(datasets).forEach(([name, path]) => validateDataset(name, path));
