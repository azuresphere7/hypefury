import {splitTextIntoTweets} from '@/util/splitTextIntoTweets';

describe('splitTextIntoTweets', () => {
  const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut' +
    ' labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' +
    ' aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore' +
    ' eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt' +
    ' mollit anim id est laborum.';

  test('splits a long text', () => {
    const splitText = splitTextIntoTweets(loremIpsum);
    expect(splitText.length).toBe(2);
    expect(splitText[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt' +
      ' ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' +
      ' aliquip ex ea commodo consequat.');
    expect(splitText[1]).toBe('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat' +
      ' nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit' +
      ' anim id est laborum.');
  });

  test('splits a long text with ?', () => {
    const splitText = splitTextIntoTweets(loremIpsum.replace(/\./g, '?'));
    expect(splitText.length).toBe(2);
    expect(splitText[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt' +
      ' ut labore et dolore magna aliqua? Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' +
      ' aliquip ex ea commodo consequat?');
    expect(splitText[1]).toBe('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat' +
      ' nulla pariatur? Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit' +
      ' anim id est laborum?');
  });

  test('splits a long text with !', () => {
    const splitText = splitTextIntoTweets(loremIpsum.replace(/\./g, '!'));
    expect(splitText.length).toBe(2);
    expect(splitText[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt' +
      ' ut labore et dolore magna aliqua! Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' +
      ' aliquip ex ea commodo consequat!');
    expect(splitText[1]).toBe('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat' +
      ' nulla pariatur! Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit' +
      ' anim id est laborum!');
  });

  test('splits a long text with line breaks', () => {
    const splitText = splitTextIntoTweets(loremIpsum.replace(/\. /g, '. \n'));
    expect(splitText.length).toBe(2);
    expect(splitText[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt' +
      ' ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut' +
      ' aliquip ex ea commodo consequat.');
    expect(splitText[1]).toBe('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat' +
      ' nulla pariatur.\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit' +
      ' anim id est laborum.');
  });

  test('support texts that are too long', () => {
    const text = 'Lorem ipsum dolor sit amet  consectetur adipiscing elit  sed do eiusmod tempor incididunt ut ' +
      'labore et dolore magna aliqua Ut enim ad minim veniam  quis nostrud exercitation ullamco laboris nisi ut ' +
      'aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore ' +
      'eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident  sunt in culpa qui officia deserunt ' +
      'mollit anim id est laborum';
    const splitText = splitTextIntoTweets(text);
    expect(splitText.length).toBe(2);
    expect(splitText[0]).toBe('Lorem ipsum dolor sit amet  consectetur adipiscing elit  sed do eiusmod tempor' +
      ' incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam  quis nostrud exercitation ullamco' +
      ' laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit in');
    expect(splitText[1]).toBe('voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat' +
      ' cupidatat non proident  sunt in culpa qui officia deserunt mollit anim id est laborum');
  });

  test('support line breaks', () => {
    const text = `https://gum.co/0000
https://gum.co/0001
https://gum.co/0002
https://gum.co/0003
https://gum.co/0004
https://gum.co/0005
https://gum.co/0006
https://gum.co/0007
https://gum.co/0008
https://gum.co/0009
https://gum.co/0010
https://gum.co/1111
https://gum.co/0012
https://gum.co/0013
https://gum.co/0014
https://gum.co/0015
https://gum.co/0016
https://gum.co/0017
https://gum.co/0018
https://gum.co/0019
https://gum.co/0020
https://gum.co/0021`;
    const splitText = splitTextIntoTweets(text);
    expect(splitText.length).toBe(2);
    expect(splitText[0]).toBe(`https://gum.co/0000
https://gum.co/0001
https://gum.co/0002
https://gum.co/0003
https://gum.co/0004
https://gum.co/0005
https://gum.co/0006
https://gum.co/0007
https://gum.co/0008
https://gum.co/0009
https://gum.co/0010
https://gum.co/1111
https://gum.co/0012
https://gum.co/0013`);
    expect(splitText[1]).toBe(`https://gum.co/0014
https://gum.co/0015
https://gum.co/0016
https://gum.co/0017
https://gum.co/0018
https://gum.co/0019
https://gum.co/0020
https://gum.co/0021`);
  });
});
