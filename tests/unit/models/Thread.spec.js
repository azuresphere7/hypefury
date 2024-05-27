import moment from 'moment';
import 'moment-timezone';
import { Thread } from '@/models/Thread';
import sinon from 'sinon';

describe('Thread', () => {
  describe('postingTimeData', () => {
    test('generates the correct day', () => {
      sinon.useFakeTimers(moment.tz('2019-08-25 00:00', 'Europe/Paris').toDate());
      const time = moment();
      const thread1 = Thread.newThread(time, [], null);
      expect(thread1.postingTimeData().day).toBe('today');

      time.add(1, 'day');
      const thread2 = Thread.newThread(time, [], null);
      expect(thread2.postingTimeData().day).toBe('tomorrow');

      time.add(-2, 'day');
      const thread3 = Thread.newThread(time, [], null);
      expect(thread3.postingTimeData().day).toBe('yesterday');
    });

    test('generates the correct day', () => {
      sinon.useFakeTimers(moment.tz('2019-08-25 02:00', 'Europe/Paris').toDate());
      const time = moment();
      const thread1 = Thread.newThread(time, [], null);
      expect(thread1.postingTimeData().time).toBe('12:00 AM');

      time.add(11, 'hours').add(14, 'minutes');
      const thread2 = Thread.newThread(time, [], null);
      expect(thread2.postingTimeData().time).toBe('11:14 AM');

      time.add(5, 'hours');
      const thread3 = Thread.newThread(time, [], null);
      expect(thread3.postingTimeData().time).toBe('4:14 PM');
    });

    test('says if it\'s a thread or tweet', () => {
      sinon.useFakeTimers(moment.tz('2019-08-25 02:00', 'Europe/Paris').toDate());
      const thread1 = Thread.newThread(moment(), [{}], null);
      expect(thread1.postingTimeData().threadOrTweet).toBe('tweet');

      const thread2 = Thread.newThread(moment(), [{}, {}], null);
      expect(thread2.postingTimeData().threadOrTweet).toBe('thread');
    });
  });

  describe('lastAutoRTTimeDifference', () => {
    test('generates the correct day', () => {
      sinon.useFakeTimers(moment.tz('2019-08-25 12:00', 'Europe/Paris').toDate());
      const timezone = 'Europe/Paris';
      const time = moment();

      const thread1 = Thread.newThread(time, [], null);
      time.add(-4, 'hours');
      thread1.lastAutoRTTime = time;
      expect(thread1.lastAutoRTTimeDifference(timezone)).toBe('today');

      time.add(-1, 'day');
      const thread2 = Thread.newThread(time, [], null);
      thread2.lastAutoRTTime = time;
      expect(thread2.lastAutoRTTimeDifference(timezone)).toBe('yesterday');

      time.add(-1, 'day');
      const thread3 = Thread.newThread(time, [], null);
      thread3.lastAutoRTTime = time;
      expect(thread3.lastAutoRTTimeDifference(timezone)).toBe('2 days ago');
    });
  });

  describe('hasErrors', () => {
    test('not scheduled', () => {
      const thread = new Thread('123', moment(), [], false, {}, null);
      expect(thread.hasErrors()).toBe(false);
    });

    test('scheduled with undefined publishingError but with a non published tweet', () => {
      const tweets = [
        { status: '', published: true },
        { status: '', published: false },
      ];
      const thread = new Thread('123', moment(), tweets, true, {}, null);
      expect(thread.hasErrors()).toBe(true);
    });

    test('scheduled with publishingError', () => {
      const thread = new Thread('123', moment(), [], true, {}, []);
      expect(thread.hasErrors()).toBe(true);
    });

    test('scheduled with undefined publishingError and no failed tweet', () => {
      const tweets = [
        { status: '', published: true },
        { status: '', published: true },
      ];
      const thread = new Thread('123', moment(), tweets, true, {}, null);
      expect(thread.hasErrors()).toBe(false);
    });
  });

  describe('getTwitterPublishingError', () => {
    test('when there is no error', () => {
      const thread = new Thread('123', moment(), [], true, {}, null);
      expect(thread.getTwitterPublishingError()).toBe(null);
    });

    test('when there is an error but it\'s not a twitter error', () => {
      const error = [{message: 'whatever'}];
      const thread = new Thread('123', moment(), [], true, {}, error);
      expect(thread.getTwitterPublishingError()).toBe(null);
    });

    test('when there is an error and it\'s a twitter error', () => {
      const error = [{message: 'hello', code: 123}];
      const thread = new Thread('123', moment(), [], true, {}, error);
      expect(thread.getTwitterPublishingError()).toBe('hello');
    });
  });
});
