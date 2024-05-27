import ThreadMixin from '@/views/Mixins/ThreadMixin';

describe('ThreadMixin', () => {
  test('addTweetBox', () => {
    const that = {
      tweets: [
        { status: '1', count: 0, published: 1, media: 1 },
        { status: '2', count: 1, published: 2, media: 2 },
        { status: '3', count: 2, published: 3, media: 3 },
        { status: '4', count: 3, published: 4, media: 4 },
      ],
      focusOnTweetBox: () => {},
      emptyTweet: (count) => {
        return {
          status: '',
          count: count,
          media: null,
          published: false,
        };
      },
      refreshOverflowHighlighting: () => {},
    };
    const f = ThreadMixin.methods.addTweetBox.bind(that);
    f(that.tweets[0]);
    expect(that.tweets.length).toBe(5);
    expect(that.tweets[0]).toStrictEqual({ status: '1', count: 0, published: 1, media: 1 });
    expect(that.tweets[1]).toStrictEqual({ status: '', count: 1, published: false, media: null });
    expect(that.tweets[2]).toStrictEqual({ status: '2', count: 2, published: 2, media: 2 });
    expect(that.tweets[3]).toStrictEqual({ status: '3', count: 3, published: 3, media: 3 });
    expect(that.tweets[4]).toStrictEqual({ status: '4', count: 4, published: 4, media: 4 });
  });
});
