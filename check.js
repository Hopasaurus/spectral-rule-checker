const fs = require('fs');
const {Spectral, isOpenApiv2} = require('@stoplight/spectral');
const {join} = require('path');
const diff = require('variable-diff');

// compare results to filename.result
fs.readdir('./rules', processRuleFiles);

function processRuleFiles(err, files) {
  const interestingFiles = files.filter(isInterestingFile);
  console.log(`1..N`); // oops gotta think this over ${interestingFiles.length}`);
  interestingFiles.forEach(processRuleFile);
}

function splitFileName(fileName) {
  // todo: figure out how to just split on the last or use fs.something.
  return fileName.split('.');
}

function isInterestingFile(fileName) {
  const split = splitFileName(fileName);
  return split.length > 1 && ['json', 'yaml', 'yml'].includes(split[1].toLowerCase());
}

function processRuleFile(rulesetFile) {
  // TODO: will need to fix for files with multiple dots
  const rulesetName = splitFileName(rulesetFile)[0];
  fs.readdir(`./rules/examples/${rulesetName}`, processExamples.bind({rulesetName, rulesetFile}));
}

function processExamples(err, files) {
  files.filter(isInterestingFile).forEach(processExample.bind(this));
}

function processResult(expected, result, exampleJsonFile) {
  const diffResult = diff(expected, result);
  if (diffResult.changed) {
    console.log(`not ok - ${exampleJsonFile}`);
    console.log('# ' + diffResult.text.split('\n').join('\n# '));
  } else {
    console.log(`ok - ${exampleJsonFile}`);
  }
}

function processExample(exampleName) {
  const {exampleJsonFile, example} = loadExample(this.rulesetName, exampleName);
  const expected = loadExpectedResult(this.rulesetName, exampleName);

  const done = result => {
    writeActualResult(this.rulesetName, exampleName, result);
    processResult(expected, result, exampleJsonFile);
  };
  runExample.call(this, example, done);
}

function runExample(example, done) {
  const spectral = new Spectral();
  spectral.registerFormat('oas2', isOpenApiv2);
  spectral.loadRuleset(join(__dirname, 'rules', this.rulesetFile))
    .then(() => spectral.run(example))
    .then(done)
    .catch(error => console.log('error: ', error));
}

function loadExample(rulesetName, exampleName) {
  const exampleJsonFile = `rules/examples/${rulesetName}/${splitFileName(exampleName)[0]}.json`;
  const example = fs.readFileSync(exampleJsonFile).toString();
  return {exampleJsonFile, example};
}

function loadExpectedResult(rulesetName, exampleName) {
  // load the expected file, return empty placeholder if not existing
  const expectedJsonFile = makeResultFilename(rulesetName, exampleName, 'expected');
  try {
    return JSON.parse(fs.readFileSync(expectedJsonFile).toString());
  } catch (e) {
    if (e.code === "ENOENT") {
      return [];
    }
    throw e;
  }
}

function makeResultFilename(rulesetName, exampleName, type) {
  const actualJsonFile = `rules/examples/${rulesetName}/results/${splitFileName(exampleName)[0]}.${type}.json`;
  return actualJsonFile;
}

function writeActualResult(rulesetName, exampleName, result) {
  const actualJson = JSON.stringify(result, null, 2);
  const actualJsonFile = makeResultFilename(rulesetName, exampleName, 'actual');
  fs.writeFileSync(actualJsonFile, actualJson);
}
