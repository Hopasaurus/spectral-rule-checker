const fs = require('fs');
const { Spectral, isOpenApiv2 } = require('@stoplight/spectral');
const { join } = require('path');
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

function ensureExpected(expectedJsonFile) {
  // load the expected file, return empty placeholder if not existing
  try {
    return JSON.parse(fs.readFileSync(expectedJsonFile).toString());
  } catch (e) {
    if (e.code === "ENOENT") {
      return [];
    }
    throw e;
  }
}

function processExample(exampleName) {
  const exampleJsonFile = `rules/examples/${this.rulesetName}/${splitFileName(exampleName)[0]}.json`;

  const expectedJsonFile = `rules/examples/${this.rulesetName}/results/${splitFileName(exampleName)[0]}.expected.json`;
  const actualJsonFile = `rules/examples/${this.rulesetName}/results/${splitFileName(exampleName)[0]}.actual.json`;

  const expected = ensureExpected(expectedJsonFile);
  const example = fs.readFileSync(exampleJsonFile).toString();

  const spectral = new Spectral();
  spectral.registerFormat('oas2', isOpenApiv2);
  spectral.loadRuleset(join(__dirname, 'rules', this.rulesetFile))
    .then(() => spectral.run(example))
    .then(result => {
      const actualJson = JSON.stringify(result, null, 2);
      fs.writeFileSync(actualJsonFile, actualJson);

      const diffResult = diff(expected, result);
      if (diffResult.changed) {
        console.log(`not ok - ${exampleJsonFile}`);
        console.log('# ' + diffResult.text.split('\n').join('\n# '));
      } else {
        console.log(`ok - ${exampleJsonFile}`);
      }
    })
    .catch(error => console.log('error', error));
}