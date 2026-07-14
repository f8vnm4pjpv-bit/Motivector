const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const picturesDir = path.join(root, "pictures");
const desires = JSON.parse(fs.readFileSync(path.join(root, "data", "desires.json"), "utf8"));
const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, "js", "resultPictures.js"), "utf8"),
  context
);

const resultPictures = context.window.MotivectorResultPictures;
const internalIds = desires.map((desire) => desire.id);
const mappedIds = internalIds.map((id) => resultPictures.idMap[id]);
const expectedImageIds = [...new Set(mappedIds)].sort();
const filePattern = /^character_([a-z]+)__effect_([a-z]+)\.png$/;
const files = fs.readdirSync(picturesDir)
  .filter((fileName) => fileName.toLowerCase().endsWith(".png"))
  .sort();
const combinations = new Map();
const characterIds = new Set();
const effectIds = new Set();
const errors = [];

function validatePng(fileName) {
  const buffer = fs.readFileSync(path.join(picturesDir, fileName));
  const signature = "89504e470d0a1a0a";
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== signature) {
    errors.push(`${fileName}: valid PNG signature or IHDR is missing`);
    return;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width === 0 || height === 0) {
    errors.push(`${fileName}: image dimensions must be greater than zero`);
  }
}

files.forEach((fileName) => {
  const match = filePattern.exec(fileName);
  if (!match) {
    errors.push(`${fileName}: unexpected file name`);
    return;
  }

  const characterId = match[1];
  const effectId = match[2];
  const key = `${characterId}::${effectId}`;
  characterIds.add(characterId);
  effectIds.add(effectId);
  combinations.set(key, (combinations.get(key) || 0) + 1);
  validatePng(fileName);
});

if (files.length !== 121) {
  errors.push(`image count is ${files.length}, expected 121`);
}
if (internalIds.length !== 11 || new Set(internalIds).size !== 11) {
  errors.push("desire IDs must contain 11 unique values");
}
if (mappedIds.some((id) => !id)) {
  errors.push("every desire ID must have a result picture ID mapping");
}
if (JSON.stringify([...characterIds].sort()) !== JSON.stringify(expectedImageIds)) {
  errors.push("character IDs do not match the JavaScript ID mapping");
}
if (JSON.stringify([...effectIds].sort()) !== JSON.stringify(expectedImageIds)) {
  errors.push("effect IDs do not match the JavaScript ID mapping");
}

internalIds.forEach((primaryId) => {
  internalIds.forEach((secondaryId) => {
    const imagePath = resultPictures.buildPath(primaryId, secondaryId);
    const displayName = resultPictures.buildDisplayName(primaryId, secondaryId);
    if (!displayName) {
      errors.push(`${primaryId} + ${secondaryId}: display name is missing`);
    }

    const fileName = path.basename(imagePath);
    const match = filePattern.exec(fileName);

    if (!match) {
      errors.push(`${primaryId} + ${secondaryId}: invalid generated path ${imagePath}`);
      return;
    }

    const key = `${match[1]}::${match[2]}`;
    const count = combinations.get(key) || 0;
    if (count !== 1) {
      errors.push(`${primaryId} + ${secondaryId}: expected one image, found ${count}`);
    }
  });
});

const displayNameCases = [
  ["stability", "growth", "一歩ずつ育つ「よりどころヤドカリ」"],
  ["creation", "stimulation", "変化を楽しむ「かたちタコ」"],
  ["meaning", "relationship", "つながりを大切にする「ものがたりクジラ」"]
];

displayNameCases.forEach(([primaryId, secondaryId, expected]) => {
  const actual = resultPictures.buildDisplayName(primaryId, secondaryId);
  if (actual !== expected) {
    errors.push(`${primaryId} + ${secondaryId}: display name ${actual}, expected ${expected}`);
  }
});

if (errors.length) {
  console.error("Result picture validation failed:");
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`Result pictures: ${files.length} valid PNG files`);
console.log(`Character IDs: ${[...characterIds].sort().join(", ")}`);
console.log(`Effect IDs: ${[...effectIds].sort().join(", ")}`);
console.log("All 11 x 11 result picture combinations, ID mappings, and display names are valid.");
