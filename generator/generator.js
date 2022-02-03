/* eslint-disable no-console */
const SpellChecker = require('simple-spellchecker');
const thesaurus = require('thesaurus');
const dictionary = require('./dictionary');
const pronouncing = require('./pronouncing/pronouncing');
const { xmur3, sfc32 } = require('./prng');

dictionary.initialize();

let spellchecker = null;
// eslint-disable-next-line consistent-return
SpellChecker.getDictionary('en-US', (err, dict) => {
  if (err) { return console.log(err); }
  spellchecker = dict;
});

exports.syllableMin = 10;

const validateAndAddNextWord = (nextWord, line, syllables) => {
  if (nextWord != null) {
    const cleanWord = dictionary.cleanStr(nextWord.toLowerCase());

    let phone = pronouncing.phonesForWord(cleanWord)[0];
    // console.log('Word: ' + cleanWord + ', Phone: ' + phone);
    const cleanWordSyllables = pronouncing.syllableCount(phone);

    if (syllables + cleanWordSyllables > exports.syllableMin && spellchecker !== null) {
      let word = cleanWord;
      if (!spellchecker.spellCheck(cleanWord)) {
        const suggestions = spellchecker.getSuggestions(cleanWord, 1);

        if (suggestions.length > 0) {
          [word] = suggestions;
        }
      }
      const possibleWords = thesaurus.find(word);

      if (possibleWords.length > 0) {
        for (let wordIndex = 0; wordIndex < possibleWords.length; wordIndex += 1) {
          [phone] = pronouncing.phonesForWord(possibleWords[wordIndex]);
          const possibleWordSyllables = pronouncing.syllableCount(phone);
          if (syllables + possibleWordSyllables === exports.syllableMin) {
            line.push(possibleWords[wordIndex]);
            return possibleWordSyllables;
          }
        }
      }
      line.push(nextWord);
      return cleanWordSyllables || 1;
    }
    line.push(nextWord);
    return cleanWordSyllables || 1;
  }
  return 1;
};

const generateLine = (rand) => {
  const startingWords = dictionary.getRandomLineStart(rand());
  const line = [];
  let syllables = 0;
  for (let i = -2; syllables < exports.syllableMin; i += 1) {
    let nextWord;
    if (i < 0) {
      nextWord = startingWords[i + 2];
    } else {
      const word1 = dictionary.cleanStr(line[i].toLowerCase());
      const word2 = dictionary.cleanStr(line[i + 1].toLowerCase());
      nextWord = dictionary.getRandomNextWord(`${word1} ${word2}`, rand());
    }
    syllables += validateAndAddNextWord(nextWord, line, syllables);
  }
  let lineStr = line.join(' ').toLowerCase();
  lineStr = lineStr.charAt(0).toUpperCase() + lineStr.slice(1);
  lineStr = lineStr.replace(/(\.\s[a-z]|\si[.,'\s])/g, (txt) => txt.replace(/[a-z]/, (char) => char.toUpperCase()));
  console.log(lineStr, syllables);
  return lineStr;
};

const reverseArray = (arr) => {
  const output = [];
  for (let i = 0; i < arr.length; i += 1) {
    output[i] = arr[arr.length - 1 - i];
  }
  return output;
};

let rhymingWordIndex = -1;

const generateReverseLine = (rand) => {
  let startingWords;
  if (rhymingWordIndex < 0) {
    startingWords = dictionary.getRandomLineEnd(rand(), rand());
    const rhymingWord = dictionary.cleanStr(startingWords[0]).toLowerCase();
    const list = pronouncing.rhymes(rhymingWord);

    let rhymingIndex = -1;
    for (let i = 0; i < list.length; i += 1) {
      rhymingIndex = dictionary.findLineEnding(list[i]);
      if (rhymingIndex > -1) {
        rhymingWordIndex = rhymingIndex;
        break;
      }
    }

    if (rhymingIndex < 0) {
      rhymingWordIndex = Math.floor(2000 * rand());
    }
  } else {
    startingWords = dictionary.getLineEnding(rhymingWordIndex);
    rhymingWordIndex = -1;
  }
  const line = [];
  let syllables = 0;
  for (let i = -2; syllables < exports.syllableMin; i += 1) {
    let nextWord;
    if (i < 0) {
      nextWord = startingWords[i + 2];
    } else {
      const word1 = dictionary.cleanStr(line[i].toLowerCase());
      const word2 = dictionary.cleanStr(line[i + 1].toLowerCase());
      nextWord = dictionary.getRandomLastWord(`${word1} ${word2}`, rand());
    }
    syllables += validateAndAddNextWord(nextWord, line, syllables);
  }
  let lineStr = reverseArray(line).join(' ').toLowerCase();
  lineStr = lineStr.charAt(0).toUpperCase() + lineStr.slice(1);
  lineStr = lineStr.replace(/(\.\s[a-z]|\si[.,'\s])/g, (txt) => txt.replace(/[a-z]/, (char) => char.toUpperCase()));
  console.log(lineStr, syllables);
  return lineStr;
};

exports.generateSonnet = (seed = Math.random().toString(16).slice(2)) => {
  // if (seed === null) {
  //   seed = Math.random().toString(16).slice(2);
  // }
  const seedFn = xmur3(seed);
  const rand = sfc32(seedFn(), seedFn(), seedFn(), seedFn());

  const sonnetLines = [];
  for (let i = 0; i < 12; i += 1) {
    let line;
    if (i % 2) {
      line = generateReverseLine(rand);
    } else {
      line = generateLine(rand);
    }
    sonnetLines.push(line);
  }

  const sonnet = sonnetLines.join('\n');

  return { seed, sonnet };
};
