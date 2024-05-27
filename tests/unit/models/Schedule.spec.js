import lodash from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import sinon from 'sinon';
import { Retweet } from '@/models/Retweet';
import { Schedule } from '@/models/Schedule';
import { ScheduleForSettings } from '@/models/ScheduleForSettings';
import { Thread } from '@/models/Thread';

describe('Schedule', () => {
  describe('getThreadsByDate', () => {
    sinon.useFakeTimers(moment.tz('2019-08-25 00:00', 'Europe/Paris').toDate());

    function now(timezone) {
      return moment.tz(timezone);
    }

    test('new creates a new schedule with the specified number of dates', () => {
      const timezone = 'Europe/London';
      const clock = sinon.useFakeTimers(moment.tz('2019-08-25 00:00', timezone).toDate());
      const size = 7;
      const timeSlots = new ScheduleForSettings([
        '0:01','0:0','0:0','0:0','0:0','0:0','0:0'
      ]);
      const schedule = new Schedule(size, timezone, [], timeSlots);
      try {
        expect(Object.keys(schedule.getThreadsByDate()).length).toBe(size);
      } finally {
        clock.restore();
      }
    });

    test('new creates a new schedule with dates from today to today+size day', () => {
      const timezone = 'Europe/Paris';
      const size = 28;
      const timeSlots = new ScheduleForSettings([
        '1:01','0:0','0:0','0:0','0:0','0:0','0:0'
      ]);
      const schedule = new Schedule(size, timezone, [], timeSlots);
      for (let i = 0; i < size; i++) {
        expect(schedule.getThreadsByDate(now(timezone).add(i, 'day'))).toBeDefined();
      }
    });

    test('new creates a new schedule with the right number of slots', () => {
      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ]);
      const schedule = new Schedule(size, timezone, [], timeSlotsForEachDay);

      for (let i = 0; i < size; i++) {
        expect(schedule.getThreadsByDate(now(timezone).add(i, 'day')).length).toBe(i % 7 + 1);
      }
    });

    test('new creates a new schedule with the threads included', () => {
      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ]);
      const threads = [
        Thread.newThread(moment.tz(timezone), [], {}),
      ];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);
      expect(schedule.getThreadsByDate(moment.tz(timezone)).length).toBe(2);
    });

    test('new creates a new schedule with the threads included', () => {
      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '08:00', '08:00,12:15', '00:00', '00:00', '00:00', '00:00', '00:00'
        ]);
      const threads = [
        Thread.newThread(moment.tz(timezone), [], {}),
        Thread.newThread(moment.tz(timezone).add(1, 'day').set('hour', 8), [], {}),
      ];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      expect(schedule.getThreadsByDate(now(timezone)).length).toBe(2);
      expect(schedule.getThreadsByDate(now(timezone).add(1, 'day')).length).toBe(2);
    });

    test('new creates a new schedule but skip the threads too far in time', () => {
      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '08:00', '00:00', '00:00', '00:00', '00:00', '00:00', '00:00'
      ]);
      const _27daysFromNow = moment.tz(timezone).add(size - 1, 'day');
      const _28daysFromNow = moment.tz(timezone).add(size, 'day');
      const threads = [
        Thread.newThread(_27daysFromNow, [], {}),
        Thread.newThread(_28daysFromNow, [], {}),
      ];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      expect(schedule.getThreadsByDate(_27daysFromNow)).toBeDefined();
      expect(schedule.getThreadsByDate(_28daysFromNow)).toBeUndefined();
    });

    test('new creates a new schedule with threads sorted by time', () => {
      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '08:00', '00:00', '00:00', '00:00', '00:00', '00:00', '00:00'
      ]);
      const threads = [
        Thread.newThread(moment.tz(timezone).add(1, 'hour').set('hour', 8), ['2'], {}),
        Thread.newThread(moment.tz(timezone), ['1'], {}),
      ];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      expect(schedule.getThreadsByDate(now(timezone))[0].tweets[0]).toBe('1');
      expect(schedule.getThreadsByDate(now(timezone))[1].tweets[0]).toBe('2');
    });

    test('new creates a new schedule with threads sorted by time', () => {
      const clock = sinon.useFakeTimers(moment.tz('2019-08-25 13:00', 'Europe/Paris').toDate());

      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45',
        '00:00',
        '00:00',
        '00:00',
      ]);
      const threads = [];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      const today = now(timezone);
      const tomorrow = now(timezone).add(1, 'day');

      try {
        expect(schedule.getThreadsByDate(today).length).toBe(2);
        expect(schedule.getThreadsByDate(tomorrow).length).toBe(4);
      } finally {
        clock.restore();
      }
    });

    test('sort dates', () => {
      const size = 28;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '12:15,08:00,18:30,23:45',
        '08:00,18:30,12:15,23:45',
        '08:00,12:15,23:45,18:30',
        '23:45,12:15,18:30,08:00',
        '00:00',
        '00:00',
        '00:00',
      ]);
      const threads = [];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      const today = now(timezone);
      const tomorrow = now(timezone).add(1, 'day');

      expect(schedule.getThreadsByDate(today)[0].time.hour()).toBe(8);
      expect(schedule.getThreadsByDate(today)[0].time.minute()).toBe(0);
      expect(schedule.getThreadsByDate(today)[1].time.hour()).toBe(12);
      expect(schedule.getThreadsByDate(today)[1].time.minute()).toBe(15);
      expect(schedule.getThreadsByDate(today)[2].time.hour()).toBe(18);
      expect(schedule.getThreadsByDate(today)[2].time.minute()).toBe(30);
      expect(schedule.getThreadsByDate(today)[3].time.hour()).toBe(23);
      expect(schedule.getThreadsByDate(today)[3].time.minute()).toBe(45);

      expect(schedule.getThreadsByDate(tomorrow)[0].time.hour()).toBe(8);
      expect(schedule.getThreadsByDate(tomorrow)[0].time.minute()).toBe(0);
      expect(schedule.getThreadsByDate(tomorrow)[1].time.hour()).toBe(12);
      expect(schedule.getThreadsByDate(tomorrow)[1].time.minute()).toBe(15);
      expect(schedule.getThreadsByDate(tomorrow)[2].time.hour()).toBe(18);
      expect(schedule.getThreadsByDate(tomorrow)[2].time.minute()).toBe(30);
      expect(schedule.getThreadsByDate(tomorrow)[3].time.hour()).toBe(23);
      expect(schedule.getThreadsByDate(tomorrow)[3].time.minute()).toBe(45);
    });

    test('sort dates even when the schedule is not empty', () => {
      const timezone = 'Europe/Paris';
      const size = 28;
      const timeSlotsForEachDay = new ScheduleForSettings([
        '12:15,08:00,18:30,23:45',
        '08:00,18:30,12:15,23:45',
        '08:00,12:15,23:45,18:30',
        '23:45,12:15,18:30,08:00',
        '00:00',
        '00:00',
        '00:00',
      ]);
      const threads = [
        Thread.newThread(moment.tz(timezone).set({hour: 5, minute: 56}), [], {}),
        Thread.newThread(moment.tz(timezone).add(1, 'day').set({hour: 21, minute: 29}), [], {}),
      ];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      const today = now(timezone);
      const tomorrow = now(timezone).add(1, 'day');

      expect(schedule.getThreadsByDate(today)[0].time.hour()).toBe(5);
      expect(schedule.getThreadsByDate(today)[0].time.minute()).toBe(56);
      expect(schedule.getThreadsByDate(today)[1].time.hour()).toBe(8);
      expect(schedule.getThreadsByDate(today)[1].time.minute()).toBe(0);
      expect(schedule.getThreadsByDate(today)[2].time.hour()).toBe(12);
      expect(schedule.getThreadsByDate(today)[2].time.minute()).toBe(15);
      expect(schedule.getThreadsByDate(today)[3].time.hour()).toBe(18);
      expect(schedule.getThreadsByDate(today)[3].time.minute()).toBe(30);
      expect(schedule.getThreadsByDate(today)[4].time.hour()).toBe(23);
      expect(schedule.getThreadsByDate(today)[4].time.minute()).toBe(45);

      expect(schedule.getThreadsByDate(tomorrow)[0].time.hour()).toBe(8);
      expect(schedule.getThreadsByDate(tomorrow)[0].time.minute()).toBe(0);
      expect(schedule.getThreadsByDate(tomorrow)[1].time.hour()).toBe(12);
      expect(schedule.getThreadsByDate(tomorrow)[1].time.minute()).toBe(15);
      expect(schedule.getThreadsByDate(tomorrow)[2].time.hour()).toBe(18);
      expect(schedule.getThreadsByDate(tomorrow)[2].time.minute()).toBe(30);
      expect(schedule.getThreadsByDate(tomorrow)[3].time.hour()).toBe(21);
      expect(schedule.getThreadsByDate(tomorrow)[3].time.minute()).toBe(29);
      expect(schedule.getThreadsByDate(tomorrow)[4].time.hour()).toBe(23);
      expect(schedule.getThreadsByDate(tomorrow)[4].time.minute()).toBe(45);
    });

    test('hide days that have no date', () => {
      const timezone = 'Europe/Paris';
      sinon.useFakeTimers(moment.tz('2019-08-25 00:00', timezone).toDate());

      const size = 7;
      const timeSlotsForEachDay = new ScheduleForSettings([
        '',
        '',
        '08:00,12:15,23:45,18:30',
        '23:45,12:15,18:30,08:00',
        '00:00',
        '00:00',
        '00:00',
      ]);
      const threads = [];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      expect(schedule.getThreadsByDate()['2019-08-24T22:00:00.000Z']).toBeUndefined();
      expect(schedule.getThreadsByDate()['2019-08-25T22:00:00.000Z']).toBeUndefined();
      expect(schedule.getThreadsByDate()['2019-08-26T22:00:00.000Z']).toBeDefined();
    });

    test('works even if the schedule is empty', () => {
      const timezone = 'Europe/Paris';
      sinon.useFakeTimers(moment.tz('2019-08-25 00:00', timezone).toDate());

      const size = 7;
      const timeSlotsForEachDay = new ScheduleForSettings(['', '', '', '', '', '', '']);
      const threads = [
        Thread.newThread(moment.tz(timezone), ['1'], {}),
      ];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      expect(schedule.getThreadsByDate()['2019-08-24T22:00:00.000Z']).toBeDefined();
    });

    test('works for retweets', () => {
      const timezone = 'Europe/Paris';
      sinon.useFakeTimers(moment.tz('2019-08-25 00:00', timezone).toDate());

      const size = 7;
      const timeSlotsForEachDay = new ScheduleForSettings(['', '', '', '', '', '', '']);
      const posts = [
        Retweet.newRetweet('123', moment.tz(timezone), {}, false),
      ];
      const schedule = new Schedule(size, timezone, posts, timeSlotsForEachDay);

      expect(schedule.getThreadsByDate()['2019-08-24T22:00:00.000Z']).toBeDefined();
    });
  });

  describe('getAllSlots', () => {
    test('returns all the slots in an array', () => {
      const size = 14;
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '12:15,08:00,18:30,23:45',
        '08:00,18:30,12:15,23:45',
        '08:00,12:15,23:45,18:30',
        '23:45,12:15,18:30,08:00',
        '00:00',
        '00:00',
        '00:00',
      ]);
      const threads = [];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      expect(schedule.getAllSlots().length).toBe(19 * 2);
    });

    test('returns all the slots in an array', () => {
      const size = 36;
      const timezone = 'America/Phoenix';
      const timeSlotsForEachDay = new ScheduleForSettings([
        '12:30,10:15,08:00,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
        '12:30,10:15,08:00,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
        '12:30,08:00,10:15,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
        '12:30,10:15,08:00,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
        '12:30,10:15,08:00,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
        '12:30,10:15,08:00,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
        '12:30,10:15,08:00,12:31,12:32,12:33,12:34,12:35,12:36,12:37,12:38',
      ]);
      const threads = [];
      const schedule = new Schedule(size, timezone, threads, timeSlotsForEachDay);

      const allSlots = schedule.getAllSlots().map(s => s.time);

      const allSlotsSorted = lodash.sortBy(allSlots, (t) => t.unix());

      for (let i = 0; i < allSlots.length; i++) {
        expect(allSlots[i]).toBe(allSlotsSorted[i]);
      }
    });
  });

  describe('isEmpty', () => {
    test('returns true if the schedule is empty', () => {
      const timeSlotsForEachDay = new ScheduleForSettings(['', '', '', '', '', '', '']);
      const schedule = new Schedule(666, 'Europe/Paris', [], timeSlotsForEachDay);
      expect(schedule.isEmpty()).toBe(true);
    });

    test('returns false if the schedule has days', () => {
      const timeSlotsForEachDay = new ScheduleForSettings(['08:00', '', '', '', '', '', '']);
      const schedule = new Schedule(666, 'Europe/Paris', [], timeSlotsForEachDay);
      expect(schedule.isEmpty()).toBe(false);
    });

    test('returns false if the schedule has no days but has threads', () => {
      const timezone = 'Europe/Paris';
      const timeSlotsForEachDay = new ScheduleForSettings(['08:00', '', '', '', '', '', '']);
      const threads = [ Thread.newThread(moment.tz(timezone), ['1'], {}) ];
      const schedule = new Schedule(666, timezone, threads, timeSlotsForEachDay);
      expect(schedule.isEmpty()).toBe(false);
    });
  });

  describe('nextTimeSlot', () => {
    const timezone = 'Europe/Paris';

    test('returns the next time slot', () => {
      const timeSlots = [
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];

      const scheduleForSettings = new ScheduleForSettings(timeSlots);
      const schedule = new Schedule(8, timezone, [], scheduleForSettings);

      sinon.useFakeTimers(moment.tz('2019-08-26 09:00', timezone).toDate());
      const nextTimeSlot1 = schedule.getNextTimeSlot();
      expect(nextTimeSlot1.hour()).toBe(12);
      expect(nextTimeSlot1.minute()).toBe(15);

      sinon.useFakeTimers(moment.tz('2019-08-25 07:00', timezone).toDate());
      const nextTimeSlot2 = schedule.getNextTimeSlot();
      expect(nextTimeSlot2.hour()).toBe(8);
      expect(nextTimeSlot2.minute()).toBe(0);

      sinon.useFakeTimers(moment.tz('2019-08-25 09:00', timezone).toDate());
      const nextTimeSlot3 = schedule.getNextTimeSlot();
      expect(nextTimeSlot3.hour()).toBe(8);
      expect(nextTimeSlot3.minute()).toBe(0);

      sinon.useFakeTimers(moment.tz('2019-08-31 23:49', timezone).toDate());
      const nextTimeSlot4 = schedule.getNextTimeSlot();
      expect(nextTimeSlot4.hour()).toBe(8);
      expect(nextTimeSlot4.minute()).toBe(0);
    });

    test('skips non empty slots', () => {
      const timeSlots = [
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];

      const scheduleForSettings = new ScheduleForSettings(timeSlots);

      sinon.useFakeTimers(moment.tz('2019-08-26 09:00', timezone).toDate());
      const threads1 = [Thread.newThread(moment.tz('2019-08-26 12:15', timezone), [])];
      const schedule1 = new Schedule(8, timezone, threads1, scheduleForSettings);
      const nextTimeSlot1 = schedule1.getNextTimeSlot();
      expect(nextTimeSlot1.date()).toBe(27);
      expect(nextTimeSlot1.hour()).toBe(8);
      expect(nextTimeSlot1.minute()).toBe(0);

      sinon.useFakeTimers(moment.tz('2019-08-27 09:00', timezone).toDate());
      const threads2 = [Thread.newThread(moment.tz('2019-08-27 12:15', timezone), [])];
      const schedule2 = new Schedule(8, timezone, threads2, scheduleForSettings);
      const nextTimeSlot2 = schedule2.getNextTimeSlot();
      expect(nextTimeSlot2.date()).toBe(27);
      expect(nextTimeSlot2.hour()).toBe(18);
      expect(nextTimeSlot2.minute()).toBe(30);
    });

    test('returns the next time slot after the specified time slot', () => {
      sinon.useFakeTimers(moment.tz('2019-08-25 23:49', timezone).toDate());

      const timeSlots = [
        '08:00', // 25
        '08:00,12:15', // 26
        '08:00,12:15,18:30', // 27
        '08:00,12:15,18:30,23:45', // 28
        '08:00,12:15,18:30,23:45,23:46', // 29
        '08:00,12:15,18:30,23:45,23:46,23:47', // 30
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48', //31
      ];

      const scheduleForSettings = new ScheduleForSettings(timeSlots);
      const schedule = new Schedule(8, timezone, [], scheduleForSettings);

      const nextTimeSlot4 = schedule.getNextTimeSlot(moment.tz('2019-08-26 08:00', timezone));
      expect(nextTimeSlot4.hour()).toBe(12);
      expect(nextTimeSlot4.minute()).toBe(15);
    });
  });
});

