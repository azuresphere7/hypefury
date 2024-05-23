import moment from 'moment';
import 'moment-timezone';
import lodash from 'lodash';
import {EmptySlot} from "./EmptySlot";

class Schedule {
  #timeSlotsForEachDay;
  #size;
  #timezone;
  #threads;
  #state = {};

  constructor(size, timezone, threads, timeSlotsForEachDay) {
    this.#threads = threads;
    this.#size = size;
    this.#timezone = timezone;
    this.#timeSlotsForEachDay = timeSlotsForEachDay.getScheduleForDB().map(s => {
      if (!s) return null;
      return s.split(',').map(s => {
        const split = s.split(':');
        return {hour: parseInt(split[0]), minute: parseInt(split[1])};
      })
    });

    this.#computeState();
  }

  getThreadsByDate(date) {
    if (!date) return this.#state;

    const midnight = date.startOf('day').toISOString();
    return this.#state[midnight];
  }

  getAllSlots() {
    return lodash.sortBy(lodash.flatten(Object.values(this.#state)), t => t.time.unix());
  }

  #computeState = () => {
    const daySlots = this.#fillDaySlots(this.#size);
    const sortedDays = daySlots.sort((d1, d2) => {
      moment.tz(d1, this.#timezone).diff(moment.tz(d2, this.#timezone))
    });

    sortedDays.forEach(daySlot => {
      const day = moment.tz(daySlot, this.#timezone).day();
      const timeSlotsForDay = this.#timeSlotsForEachDay[day];
      if (!timeSlotsForDay) return;
      const daySlotString = daySlot;

      this.#state[daySlotString] = [];

      timeSlotsForDay.forEach(timeSlot => {
        const time = moment.tz(daySlot, this.#timezone).set({hour: timeSlot.hour, minute: timeSlot.minute});

        const now = moment.tz(this.#timezone);
        if (time.diff(now, 'seconds') <= 0) return;

        this.#state[daySlotString].push(new EmptySlot(time));
      })
    });

    const latestDayOfSchedule = moment.tz(this.#timezone).add(this.#size - 1, 'days').startOf('day');
    this.#threads.forEach(thread => {
      if (latestDayOfSchedule.diff(moment(thread.midnight)) < 0) return;
      if (!this.#state[thread.midnight]) this.#state[thread.midnight] = [];
      this.#state[thread.midnight] = this.#state[thread.midnight].filter(t => t.time.diff(thread.time) !== 0);
      this.#state[thread.midnight].push(thread);
    });

    Object.keys(this.#state).map(key => {
      this.#state[key] = this.#state[key].sort((t1, t2) => t1.time.diff(t2.time));
    });

    Object.keys(this.#state).map(key => {
      if (this.#state[key].length === 0) {
        delete this.#state[key];
      }
    });
  };

  #fillDaySlots = (size) => {
    const daySlots = [];
    [...Array(size).keys()].forEach(x => {
      daySlots.push(moment.tz(this.#timezone).startOf('day').add(x, 'days').toISOString());
    });
    return daySlots;
  };

  isEmpty() {
    return Object.keys(this.#state).length === 0;
  }

  changeTimeOfThread(thread, time) {
    this.#threads
      .filter(t => t.id === thread.id)
      .forEach(t => t.time = time);

    this.#computeState();
  }

  getNextTimeSlot(time) {
    const now = moment.tz(this.#timezone);
    const slots = this.getThreadsByDate();
    const sortedTimes = lodash.flatten(Object.values(slots))
      .filter(slot => {
        const timeFilter = !time ? true : slot.time.diff(time) > 1;
        return slot.isEmpty() && timeFilter;
      })
      .map(s => s.time)
      .sort((a, b) => moment(a).valueOf() - moment(b).valueOf())
      .filter(time => time.diff(now) > 0);
    return sortedTimes[0];
  }
}

export { Schedule };
