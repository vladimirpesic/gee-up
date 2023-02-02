const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// remove old 'build' folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// put the content of GeeUp.sol file into the 'source' variable
const geeUpPath = path.resolve(__dirname, 'contracts', 'GeeUp.sol');
const source = fs.readFileSync(geeUpPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'GeeUp.sol': { content: source }
  },
  settings: {
    outputSelection: {
      '*': { '*': ['*'] }
    }
  }
};

// compile GeeUp.sol file and put the content into the 'output' variable
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['GeeUp.sol'];

// create a 'build' directory
fs.ensureDirSync(buildPath);

// extract GeeUp and GeeUpFactory builds into separate .json files
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + '.json'),
    output[contract]
  );
}
