import {flatten} from 'lodash';

const splitSentences = require('sentence-splitter');

const TWEET_SIZE = 280;

export function splitTextIntoTweets(text) {
  let tweetCount = 0;
  const result = [''];

  const split = splitSentences.split(text.trim()).map(s => {
    const sWithLineBreakMarkers = s.raw.replace(/\n/g, '$LINEBREAK$\n');
    const sentences = sWithLineBreakMarkers.split('\n').map(s => s.replace(/\$LINEBREAK\$/, '\n'));
    if (sentences[sentences.length - 1] && sentences[sentences.length - 1].endsWith('\n')) {
      sentences[sentences.length - 1] = sentences[sentences.length - 1].trim();
    }
    return sentences;
  });

  const sentences = flatten(split);

  sentences.forEach(sentence => {
    const value = sentence;

    if (value.length > TWEET_SIZE) {
      const words = value.split(' ');
      words.forEach(word => {
        if (result[tweetCount].length + word.length + 1 > TWEET_SIZE) {
          tweetCount++;
          result[tweetCount] = '';
        }
        result[tweetCount] += word + ' ';
      });
    } else {
      if (result[tweetCount].length + value.length > TWEET_SIZE) {
        tweetCount++;
        result[tweetCount] = '';
      }

      result[tweetCount] += value;
    }
  });

  return result.map(t => {
    return t.trim().replace(/ \n/g, '\n');
  });
}
