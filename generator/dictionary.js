const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const dictionary = {};
const lineStarts = [];
const reverseDictionary = {};
const lineEnds = [];

exports.sonnetsDir = path.join(__dirname, '../data/sonnets.txt');

exports.cleanStr = (s) => s.replace(/[^A-Za-z0-9]/g, '').trim();

const readSonnets = () => fs.readFileAsync(exports.sonnetsDir, 'utf8')
  .then((sonnetData) => {
    const lines = sonnetData.split('\n');
    return lines;
  })
  .catch((err) => console.log(err));

const createDictionary = () => {
  readSonnets().then((lines) => {
    for (let lineIndex = 0; lineIndex < lines.length - 1; lineIndex += 1) {
      const words = lines[lineIndex].split(' ');
      const wordsLine2 = lines[lineIndex + 1].split(' ');
      words.push(...wordsLine2);
      lineStarts.push([words[0], words[1]]);
      for (let tupleStart = 0; tupleStart < words.length - 2; tupleStart += 1) {
        const tuple = `${exports.cleanStr(words[tupleStart].toLowerCase())} ${exports.cleanStr(words[tupleStart + 1].toLowerCase())}`;

        if (dictionary[tuple]) {
          dictionary[tuple].push(words[tupleStart + 2]);
        } else {
          dictionary[tuple] = [words[tupleStart + 2]];
        }
      }
    }
  });
};

const createReverseDictionary = () => {
  readSonnets().then((lines) => {
    for (let lineIndex = lines.length - 2; lineIndex > 1; lineIndex -= 1) {
      const words = lines[lineIndex - 1].split(' ');
      const wordsLine2 = lines[lineIndex].split(' ');
      words.push(...wordsLine2);
      lineEnds.push([words[words.length - 1], words[words.length - 2]]);
      for (let tupleStart = words.length - 1; tupleStart > 1; tupleStart -= 1) {
        const tuple = `${exports.cleanStr(words[tupleStart].toLowerCase())} ${exports.cleanStr(words[tupleStart - 1].toLowerCase())}`;

        if (reverseDictionary[tuple]) {
          reverseDictionary[tuple].push(words[tupleStart - 2]);
        } else {
          reverseDictionary[tuple] = [words[tupleStart - 2]];
        }
      }
    }
  });
};

exports.findLineEnding = (word) => {
  for (let endIndex = 0; endIndex < lineEnds; endIndex += 1) {
    if (word === exports.cleanStr(lineEnds[endIndex][0])) {
      return endIndex;
    }
  }
  return -1;
};

exports.getLineEnding = (index) => lineEnds[index];

exports.getRandomLineStart = (randFloat) => lineStarts[Math.floor(lineStarts.length * randFloat)];

exports.getRandomLineEnd = (randFloat, randFloat2) => {
  const sonnet = Math.floor((lineEnds.length / 14) * randFloat) * 14;
  const lines = [1, 3, 5, 7, 9, 11, 12, 13];
  return lineEnds[sonnet + lines[Math.floor(lines.length * randFloat2)]];
};

exports.getRandomNextWord = (tuple, randFloat) => {
  if (dictionary[tuple]) {
    return dictionary[tuple][Math.floor(dictionary[tuple].length * randFloat)];
  }
  return null;
};

exports.getRandomLastWord = (tuple, randFloat) => {
  if (reverseDictionary[tuple]) {
    return reverseDictionary[tuple][Math.floor(reverseDictionary[tuple].length * randFloat)];
  }
  return null;
};

exports.initialize = () => {
  createDictionary();
  createReverseDictionary();
};
