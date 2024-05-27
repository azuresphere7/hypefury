import moment from 'moment';
import 'moment-timezone';
import sinon from 'sinon';
import { ScheduleForSettings } from '@/models/ScheduleForSettings';

describe('ScheduleForSettings', () => {
  describe('new', () => {
    test('ignores duplicates', () => {
      const timeSlots = [
        '08:00,08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(schedule.getScheduleForView().Monday.length).toEqual(2);
    });
  });

  describe('remove()', () => {
    test('removes the specified time slot', () => {
      const timeSlots = [
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];

      const schedule = new ScheduleForSettings(timeSlots);
      schedule.remove({day: 2, hour: 12, minute: 15});
      const updatedSchedule = schedule.getScheduleForView();

      expect(updatedSchedule.Monday.length).toBe(2);
      expect(updatedSchedule.Tuesday.length).toBe(2);
      expect(updatedSchedule.Wednesday.length).toBe(4);
      expect(updatedSchedule.Thursday.length).toBe(5);
      expect(updatedSchedule.Friday.length).toBe(6);
      expect(updatedSchedule.Saturday.length).toBe(7);
      expect(updatedSchedule.Sunday.length).toBe(1);
    });

    test('doesn\'t remove the last slot', () => {
      const timeSlots = [ '08:00', '08:00', '08:00', '08:00', '08:00', '08:00', '08:00' ];

      const schedule = new ScheduleForSettings(timeSlots);
      expect(() => schedule.remove({day: 0, hour: 8, minute: 0})).toThrow();
      expect(() => schedule.remove({day: 1, hour: 8, minute: 0})).toThrow();
      expect(() => schedule.remove({day: 2, hour: 8, minute: 0})).toThrow();
      expect(() => schedule.remove({day: 3, hour: 8, minute: 0})).toThrow();
      expect(() => schedule.remove({day: 4, hour: 8, minute: 0})).toThrow();
      expect(() => schedule.remove({day: 5, hour: 8, minute: 0})).toThrow();
      expect(() => schedule.remove({day: 6, hour: 8, minute: 0})).toThrow();
    });
  });

  describe('getScheduleForView()', () => {
    test('returns Monday first', () => {
      const timeSlots = [
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(Object.keys(schedule.getScheduleForView())[0]).toEqual('Monday');
    });

    test('returns time slots sorted', () => {
      const timeSlots = [
        '08:00',
        '12:15,08:00,',
        '18:30,08:00,12:15',
        '18:30,08:00,12:15,23:45',
        '23:45,08:00,12:15,18:30',
        '08:00,18:30,12:15,23:45',
        '08:00,12:15,18:30,23:45',
      ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(schedule.getScheduleForView().Monday[0].hour).toEqual(8);
      expect(schedule.getScheduleForView().Monday[0].minute).toEqual(0);
      expect(schedule.getScheduleForView().Monday[1].hour).toEqual(12);
      expect(schedule.getScheduleForView().Monday[1].minute).toEqual(15);
    });

    test('returns the right AM/PM value for 12:00', () => {
      const timeSlots = [ '12:15', '12:15', '12:15', '12:15', '12:15', '12:15', '12:15' ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(schedule.getScheduleForView().Monday[0].formatted).toEqual('12:15 PM');
    });
  });

  describe('getScheduleForDB()', () => {
    test('returns an object for firebase storage', () => {
      const timeSlots = [
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(schedule.getScheduleForDB()).toEqual(timeSlots);
    });

    test('works with empty schedules', () => {
      const timeSlots = [
        '',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(schedule.getScheduleForDB()).toEqual(timeSlots);
    });
  });

  describe('add()', () => {
    test('works with days', () => {
      const timeSlots = [
        '08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];

      const schedule = new ScheduleForSettings(timeSlots);

      schedule.add({day: '0', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Sunday.length).toBe(2);
      expect(schedule.getScheduleForView().Sunday[1].hour).toBe(14);
      expect(schedule.getScheduleForView().Sunday[1].minute).toBe(13);

      schedule.add({day: '1', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Monday.length).toBe(3);
      expect(schedule.getScheduleForView().Monday[2].hour).toBe(14);
      expect(schedule.getScheduleForView().Monday[2].minute).toBe(13);

      schedule.add({day: '2', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Tuesday.length).toBe(4);
      expect(schedule.getScheduleForView().Tuesday[2].hour).toBe(14);
      expect(schedule.getScheduleForView().Tuesday[2].minute).toBe(13);

      schedule.add({day: '3', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Wednesday.length).toBe(5);
      expect(schedule.getScheduleForView().Wednesday[2].hour).toBe(14);
      expect(schedule.getScheduleForView().Wednesday[2].minute).toBe(13);

      schedule.add({day: '4', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Thursday.length).toBe(6);
      expect(schedule.getScheduleForView().Thursday[2].hour).toBe(14);
      expect(schedule.getScheduleForView().Thursday[2].minute).toBe(13);

      schedule.add({day: '5', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Friday.length).toBe(7);
      expect(schedule.getScheduleForView().Friday[2].hour).toBe(14);
      expect(schedule.getScheduleForView().Friday[2].minute).toBe(13);

      schedule.add({day: '6', hour: 14, minute: 13});
      expect(schedule.getScheduleForView().Saturday.length).toBe(8);
      expect(schedule.getScheduleForView().Saturday[2].hour).toBe(14);
      expect(schedule.getScheduleForView().Saturday[2].minute).toBe(13);
    });
  });

  test('works with \'Every day\'', () => {
    const timeSlots = [
      '08:00',
      '08:00,12:15',
      '08:00,12:15,18:30',
      '08:00,12:15,18:30,23:45',
      '08:00,12:15,18:30,23:45,23:46',
      '08:00,12:15,18:30,23:45,23:46,23:47',
      '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
    ];

    const schedule = new ScheduleForSettings(timeSlots);

    schedule.add({day: 'Every day', hour: 14, minute: 13});
    expect(schedule.getScheduleForView().Sunday.length).toBe(2);
    expect(schedule.getScheduleForView().Monday.length).toBe(3);
    expect(schedule.getScheduleForView().Tuesday.length).toBe(4);
    expect(schedule.getScheduleForView().Wednesday.length).toBe(5);
    expect(schedule.getScheduleForView().Thursday.length).toBe(6);
    expect(schedule.getScheduleForView().Friday.length).toBe(7);
    expect(schedule.getScheduleForView().Saturday.length).toBe(8);
  });

  test('works with \'Weekdays\'', () => {
    const timeSlots = [
      '08:00',
      '08:00,12:15',
      '08:00,12:15,18:30',
      '08:00,12:15,18:30,23:45',
      '08:00,12:15,18:30,23:45,23:46',
      '08:00,12:15,18:30,23:45,23:46,23:47',
      '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
    ];

    const schedule = new ScheduleForSettings(timeSlots);

    schedule.add({day: 'Weekdays', hour: 14, minute: 13});
    expect(schedule.getScheduleForView().Sunday.length).toBe(1);
    expect(schedule.getScheduleForView().Monday.length).toBe(3);
    expect(schedule.getScheduleForView().Tuesday.length).toBe(4);
    expect(schedule.getScheduleForView().Wednesday.length).toBe(5);
    expect(schedule.getScheduleForView().Thursday.length).toBe(6);
    expect(schedule.getScheduleForView().Friday.length).toBe(7);
    expect(schedule.getScheduleForView().Saturday.length).toBe(7);
  });

  test('works with \'Weekends\'', () => {
    const timeSlots = [
      '08:00',
      '08:00,12:15',
      '08:00,12:15,18:30',
      '08:00,12:15,18:30,23:45',
      '08:00,12:15,18:30,23:45,23:46',
      '08:00,12:15,18:30,23:45,23:46,23:47',
      '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
    ];

    const schedule = new ScheduleForSettings(timeSlots);

    schedule.add({day: 'Weekends', hour: 14, minute: 13});
    expect(schedule.getScheduleForView().Sunday.length).toBe(2);
    expect(schedule.getScheduleForView().Monday.length).toBe(2);
    expect(schedule.getScheduleForView().Tuesday.length).toBe(3);
    expect(schedule.getScheduleForView().Wednesday.length).toBe(4);
    expect(schedule.getScheduleForView().Thursday.length).toBe(5);
    expect(schedule.getScheduleForView().Friday.length).toBe(6);
    expect(schedule.getScheduleForView().Saturday.length).toBe(8);
  });

  test('ignores duplicates', () => {
    const timeSlots = [
      '08:00',
      '08:00,12:15',
      '08:00,12:15,18:30',
      '08:00,12:15,18:30,23:45',
      '08:00,12:15,18:30,23:45,23:46',
      '08:00,12:15,18:30,23:45,23:46,23:47',
      '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
    ];
    const schedule = new ScheduleForSettings(timeSlots);
    schedule.add({day: 'Every day', hour: 8, minute: 0});
    expect(schedule.getScheduleForView().Sunday.length).toBe(1);
    expect(schedule.getScheduleForView().Monday.length).toBe(2);
    expect(schedule.getScheduleForView().Tuesday.length).toBe(3);
    expect(schedule.getScheduleForView().Wednesday.length).toBe(4);
    expect(schedule.getScheduleForView().Thursday.length).toBe(5);
    expect(schedule.getScheduleForView().Friday.length).toBe(6);
    expect(schedule.getScheduleForView().Saturday.length).toBe(7);
  });

  describe('getNumberOfPostsPerWeek', () => {
    test('returns the right number of posts per week', () => {
      const timeSlots = [
        '08:00,08:00',
        '08:00,12:15',
        '08:00,12:15,18:30',
        '08:00,12:15,18:30,23:45',
        '08:00,12:15,18:30,23:45,23:46',
        '08:00,12:15,18:30,23:45,23:46,23:47',
        '08:00,12:15,18:30,23:45,23:46,23:47,23:48',
      ];
      const schedule = new ScheduleForSettings(timeSlots);
      expect(schedule.getNumberOfPostsPerWeek()).toEqual(29);
    });
  });

  describe('naturalize', () => {
    test('randomize each time within 5 minutes', () => {
      const timeSlots = [
        '00:00', // S
        '23:58', // M
        '10:00,12:15,18:30', // T
        '11:00,12:15,18:30,23:45', // W
        '12:00,12:15,18:30,22:46,23:45', // T
        '08:00,12:15,18:30,21:47,22:46,23:45', // F
        '09:00,12:15,18:30,21:47,22:46,23:45,23:54', // S
      ];

      // Due to the randomness of this feature, we run these tests 200 times
      // to maximize the chances of catching a bug
      for (let i = 0; i < 200; i++) {
        const schedule = new ScheduleForSettings(timeSlots).naturalize();
        const data = schedule.getScheduleForView();

        expect(data.Sunday[0].formatted).not.toBe('00:00 AM');
        expect(data.Sunday[0].hour).toBe(0);
        expect(data.Sunday[0].minute).toBeGreaterThan(0);
        expect(data.Sunday[0].minute).toBeLessThanOrEqual(5);

        expect(data.Monday[0].formatted).not.toBe('11:58 PM');
        expect(data.Monday[0].hour).toBe(23);
        expect(data.Monday[0].minute).toBeGreaterThanOrEqual(53);
        expect(data.Monday[0].minute).toBeLessThanOrEqual(59);

        expect(['09:55 AM', '09:56 AM', '09:57 AM', '09:58 AM', '09:59 AM',
          '10:01 AM', '10:02 AM', '10:03 AM', '10:04 AM', '10:05 AM']).toContain(data.Tuesday[0].formatted);
        expect(data.Tuesday[0].formatted).not.toBe('10:00 AM');
        expect(data.Tuesday[0].hour).toBeGreaterThanOrEqual(9);
        expect(data.Tuesday[0].hour).toBeLessThanOrEqual(10);
        expect(['12:10 PM', '12:11 PM', '12:12 PM', '12:13 PM', '12:14 PM',
          '12:16 PM', '12:17 PM', '12:18 PM', '12:19 PM', '12:20 PM']).toContain(data.Tuesday[1].formatted);
        expect(data.Tuesday[1].formatted).not.toBe('12:15 PM');
        expect(data.Tuesday[1].hour).toBe(12);
        expect(data.Tuesday[1].minute).toBeGreaterThanOrEqual(10);
        expect(data.Tuesday[1].minute).toBeLessThanOrEqual(20);
        expect(['06:25 PM', '06:26 PM', '06:27 PM', '06:28 PM', '06:29 PM',
          '06:31 PM', '06:32 PM', '06:33 PM', '06:34 PM', '06:35 PM']).toContain(data.Tuesday[2].formatted);
        expect(data.Tuesday[2].formatted).not.toBe('06:30 PM');
        expect(data.Tuesday[2].hour).toBe(18);
        expect(data.Tuesday[2].minute).toBeGreaterThanOrEqual(25);
        expect(data.Tuesday[2].minute).toBeLessThanOrEqual(35);

        expect(['10:55 AM', '10:56 AM', '10:57 AM', '10:58 AM', '10:59 AM',
          '11:01 AM', '11:02 AM', '11:03 AM', '11:04 AM', '11:05 AM']).toContain(data.Wednesday[0].formatted);
        expect(['12:10 PM', '12:11 PM', '12:12 PM', '12:13 PM', '12:14 PM',
          '12:16 PM', '12:17 PM', '12:18 PM', '12:19 PM', '12:20 PM']).toContain(data.Wednesday[1].formatted);
        expect(data.Wednesday[1].formatted).not.toBe('12:15 PM');
        expect(['06:25 PM', '06:26 PM', '06:27 PM', '06:28 PM', '06:29 PM',
          '06:31 PM', '06:32 PM', '06:33 PM', '06:34 PM', '06:35 PM']).toContain(data.Wednesday[2].formatted);
        expect(data.Wednesday[2].formatted).not.toBe('06:30 PM');
        expect(['11:40 PM', '11:41 PM', '11:42 PM', '11:43 PM', '11:44 PM',
          '11:46 PM', '11:47 PM', '11:48 PM', '11:49 PM', '11:50 PM']).toContain(data.Wednesday[3].formatted);
        expect(data.Wednesday[3].formatted).not.toBe('11:45 PM');

        expect(['11:55 AM', '11:56 AM', '11:57 AM', '11:58 AM', '11:59 AM',
          '12:01 PM', '12:02 PM', '12:03 PM', '12:04 PM', '12:05 PM']).toContain(data.Thursday[0].formatted);
        expect(data.Thursday[0].formatted).not.toBe('12:00 PM');
        expect(['12:10 PM', '12:11 PM', '12:12 PM', '12:13 PM', '12:14 PM',
          '12:16 PM', '12:17 PM', '12:18 PM', '12:19 PM', '12:20 PM']).toContain(data.Thursday[1].formatted);
        expect(data.Thursday[1].formatted).not.toBe('12:15 PM');
        expect(['06:25 PM', '06:26 PM', '06:27 PM', '06:28 PM', '06:29 PM',
          '06:31 PM', '06:32 PM', '06:33 PM', '06:34 PM', '06:35 PM']).toContain(data.Thursday[2].formatted);
        expect(data.Thursday[2].formatted).not.toBe('06:30 PM');
        expect(['11:40 PM', '11:41 PM', '11:42 PM', '11:43 PM', '11:44 PM',
          '11:46 PM', '11:47 PM', '11:48 PM', '11:49 PM', '11:50 PM']).toContain(data.Thursday[4].formatted);
        expect(data.Thursday[3].formatted).not.toBe('11:45 PM');
        expect(['10:41 PM', '10:42 PM', '10:43 PM', '10:44 PM', '10:45 PM',
          '10:47 PM', '10:48 PM', '10:49 PM', '10:50 PM', '10:51 PM']).toContain(data.Thursday[3].formatted);
        expect(data.Thursday[3].formatted).not.toBe('10:46 PM');

        expect(['07:55 AM', '07:56 AM', '07:57 AM', '07:58 AM', '07:59 AM',
          '08:01 AM', '08:02 AM', '08:03 AM', '08:04 AM', '08:05 AM']).toContain(data.Friday[0].formatted);
        expect(data.Friday[0].formatted).not.toBe('08:00 AM');
        expect(['12:10 PM', '12:11 PM', '12:12 PM', '12:13 PM', '12:14 PM',
          '12:16 PM', '12:17 PM', '12:18 PM', '12:19 PM', '12:20 PM']).toContain(data.Friday[1].formatted);
        expect(data.Friday[1].formatted).not.toBe('12:15 PM');
        expect(['06:25 PM', '06:26 PM', '06:27 PM', '06:28 PM', '06:29 PM',
          '06:31 PM', '06:32 PM', '06:33 PM', '06:34 PM', '06:35 PM']).toContain(data.Friday[2].formatted);
        expect(data.Friday[2].formatted).not.toBe('06:30 PM');
        expect(['11:40 PM', '11:41 PM', '11:42 PM', '11:43 PM', '11:44 PM',
          '11:46 PM', '11:47 PM', '11:48 PM', '11:49 PM', '11:50 PM']).toContain(data.Friday[5].formatted);
        expect(data.Friday[3].formatted).not.toBe('11:45 PM');
        expect(['10:41 PM', '10:42 PM', '10:43 PM', '10:44 PM', '10:45 PM',
          '10:47 PM', '10:48 PM', '10:49 PM', '10:50 PM', '10:51 PM']).toContain(data.Friday[4].formatted);
        expect(data.Friday[4].formatted).not.toBe('10:46 PM');
        expect(['09:42 PM', '09:43 PM', '09:44 PM', '09:45 PM', '09:46 PM',
          '09:48 PM', '09:49 PM', '09:50 PM', '09:51 PM', '09:52 PM']).toContain(data.Friday[3].formatted);
        expect(data.Friday[5].formatted).not.toBe('09:47 PM');

        expect(['08:55 AM', '08:56 AM', '08:57 AM', '08:58 AM', '08:59 AM',
          '09:01 AM', '09:02 AM', '09:03 AM', '09:04 AM', '09:05 AM']).toContain(data.Saturday[0].formatted);
        expect(data.Saturday[0].formatted).not.toBe('09:00 AM');
        expect(['12:10 PM', '12:11 PM', '12:12 PM', '12:13 PM', '12:14 PM',
          '12:16 PM', '12:17 PM', '12:18 PM', '12:19 PM', '12:20 PM']).toContain(data.Saturday[1].formatted);
        expect(data.Saturday[1].formatted).not.toBe('12:15 PM');
        expect(['06:25 PM', '06:26 PM', '06:27 PM', '06:28 PM', '06:29 PM',
          '06:31 PM', '06:32 PM', '06:33 PM', '06:34 PM', '06:35 PM']).toContain(data.Saturday[2].formatted);
        expect(data.Saturday[2].formatted).not.toBe('06:30 PM');
        expect(['11:40 PM', '11:41 PM', '11:42 PM', '11:43 PM', '11:44 PM',
          '11:46 PM', '11:47 PM', '11:48 PM', '11:49 PM', '11:50 PM']).toContain(data.Saturday[5].formatted);
        expect(data.Saturday[3].formatted).not.toBe('11:45 PM');
        expect(['10:41 PM', '10:42 PM', '10:43 PM', '10:44 PM', '10:45 PM',
          '10:47 PM', '10:48 PM', '10:49 PM', '10:50 PM', '10:51 PM']).toContain(data.Saturday[4].formatted);
        expect(data.Saturday[4].formatted).not.toBe('10:46 PM');
        expect(['09:42 PM', '09:43 PM', '09:44 PM', '09:45 PM', '09:46 PM',
          '09:48 PM', '09:49 PM', '09:50 PM', '09:51 PM', '09:52 PM']).toContain(data.Saturday[3].formatted);
        expect(data.Saturday[5].formatted).not.toBe('09:47 PM');
        expect(['11:49 PM', '11:50 PM', '11:51 PM', '11:52 PM', '11:53 PM',
          '11:55 PM', '11:56 PM', '11:57 PM', '11:58 PM', '11:59 PM']).toContain(data.Saturday[6].formatted);
        expect(data.Saturday[6].formatted).not.toBe('11:54 PM');
      }
    });

    test('correctly randomize the first and last hour of the day', () => {
      const timeSlots = [
        '00:25', // S
        '23:35', // M
        '10:00,12:15,18:30', // T
        '11:00,12:15,18:30,23:45', // W
        '12:00,12:15,18:30,22:46,23:45', // T
        '08:00,12:15,18:30,21:47,22:46,23:45', // F
        '09:00,12:15,18:30,21:47,22:46,23:45,23:54', // S
      ];

      const resultsOfMidnightSet = new Set();
      for (let i = 0; i < 200; i++) {
        const schedule = new ScheduleForSettings(timeSlots).naturalize();
        const data = schedule.getScheduleForView();
        resultsOfMidnightSet.add(data.Sunday[0].formatted);
      }
      const resultsOfMidnight = Array.from(resultsOfMidnightSet);
      expect(resultsOfMidnight).toContain('00:20 AM');
      expect(resultsOfMidnight).toContain('00:21 AM');
      expect(resultsOfMidnight).toContain('00:22 AM');
      expect(resultsOfMidnight).toContain('00:23 AM');
      expect(resultsOfMidnight).toContain('00:24 AM');
      expect(resultsOfMidnight).not.toContain('00:25 AM');
      expect(resultsOfMidnight).toContain('00:26 AM');
      expect(resultsOfMidnight).toContain('00:27 AM');
      expect(resultsOfMidnight).toContain('00:28 AM');
      expect(resultsOfMidnight).toContain('00:29 AM');
      expect(resultsOfMidnight).toContain('00:30 AM');

      const resultsOf11PMSet = new Set();
      for (let i = 0; i < 200; i++) {
        const schedule = new ScheduleForSettings(timeSlots).naturalize();
        const data = schedule.getScheduleForView();
        resultsOf11PMSet.add(data.Monday[0].formatted);
      }
      const resultsOf11PM = Array.from(resultsOf11PMSet);
      expect(resultsOf11PM).toContain('11:30 PM');
      expect(resultsOf11PM).toContain('11:31 PM');
      expect(resultsOf11PM).toContain('11:32 PM');
      expect(resultsOf11PM).toContain('11:33 PM');
      expect(resultsOf11PM).toContain('11:34 PM');
      expect(resultsOf11PM).not.toContain('11:35 PM');
      expect(resultsOf11PM).toContain('11:36 PM');
      expect(resultsOf11PM).toContain('11:37 PM');
      expect(resultsOf11PM).toContain('11:38 PM');
      expect(resultsOf11PM).toContain('11:39 PM');
      expect(resultsOf11PM).toContain('11:40 PM');
    });

    test('handle the case where times are too close to each other', () => {
      const timeSlots = [
        '00:00,00:01,00:02,00:03,00:04,00:05', // S
        '23:58', // M
        '10:00', // T
        '11:00', // W
        '12:00', // T
        '08:00', // F
        '09:00', // S
      ];

      const schedule = new ScheduleForSettings(timeSlots).naturalize();
      const data = schedule.getScheduleForView();

      data.Sunday.forEach(time => {
        expect(time.hour).toBe(0);
        expect(time.minute).toBeGreaterThan(0);
        expect(time.minute).toBeLessThanOrEqual(10);
      });
      expect(schedule.getScheduleForDB()[0].split(',').length).toBe(6);
    });
  });
});
