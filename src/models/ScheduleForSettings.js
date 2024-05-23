import moment from 'moment';
import 'moment-timezone';
import lodash from 'lodash';
import {formatHourOrMinute} from '@/util/formatHourOrMinute';

class ScheduleForSettings {
  #rawTimeSlotsForEachDay;
  #timeSlotsForEachDay;

  constructor(timeSlotsForEachDay) {
    this.#rawTimeSlotsForEachDay = timeSlotsForEachDay;
    this.#timeSlotsForEachDay = timeSlotsForEachDay.map(s => {
      if (s === '') return [];
      return s.split(',').map(s => {
        const split = s.split(':');
        return {hour: parseInt(split[0]), minute: parseInt(split[1])};
      })
    });
  }

  getScheduleForView() {
    const result = {};
    for (let i = 1; i <= 7; i++) {
      const dayNumber = i % 7;
      const timeSlots = this.#timeSlotsForEachDay[dayNumber];
      const day = moment().day(dayNumber).format('dddd');
      result[day] = [];
      timeSlots.forEach(timeSlot => {
        const amOrPM = timeSlot.hour >= 12 ? 'PM' : 'AM';
        const hour = timeSlot.hour > 12 ? timeSlot.hour - 12 : timeSlot.hour;
        timeSlot.day = dayNumber;
        timeSlot.formatted = `${formatHourOrMinute(hour)}:${formatHourOrMinute(timeSlot.minute)} ${amOrPM}`;
        timeSlot.id = `${day}-${formatHourOrMinute(timeSlot.hour)}-${formatHourOrMinute(timeSlot.minute)}`;
        result[day].push(timeSlot);
      });
      result[day] = lodash.sortBy(result[day], ['hour', 'minute']);
    }
    return result;
  }

  getScheduleForDB() {
    return this.#timeSlotsForEachDay.map(timeSlots => {
      return timeSlots.map(timeSlot => {
        return formatHourOrMinute(timeSlot.hour) + ':' + formatHourOrMinute(timeSlot.minute);
      }).join(',');
    });
  }

  add(timeSlot) {
    if (timeSlot.day === 'Every day') {
      for (let i = 0; i < 7; i++) {
        this.#addTimeInSlot(timeSlot.hour, timeSlot.minute, i);
      }
    } else if (timeSlot.day === 'Weekdays') {
      for (let i = 1; i < 6; i++) {
        this.#addTimeInSlot(timeSlot.hour, timeSlot.minute, i);
      }
    } else if (timeSlot.day === 'Weekends') {
      this.#addTimeInSlot(timeSlot.hour, timeSlot.minute, 0);
      this.#addTimeInSlot(timeSlot.hour, timeSlot.minute, 6);
    } else {
      this.#addTimeInSlot(timeSlot.hour, timeSlot.minute, timeSlot.day);
    }
  }

  remove(timeSlot) {
    if (this.#timeSlotsForEachDay[timeSlot.day].length === 1) {
      throw new Error('Cannot remove the last slot of the schedule.');
    }
    this.#timeSlotsForEachDay[timeSlot.day] = this.#timeSlotsForEachDay[timeSlot.day].filter(slot => {
      return slot.hour !== timeSlot.hour || slot.minute !== timeSlot.minute;
    });
  }

  getNumberOfPostsPerWeek() {
    return lodash.flatten(this.#timeSlotsForEachDay).length;
  }

  naturalize() {
    function f(existingTimes, newTimes) {
      if (existingTimes.length === 0) {
        return newTimes;
      }

      const firstTime = existingTimes.shift();
      const time = firstTime.clone();
      const minuteDiff = Math.floor(Math.random() * 5) + 1;
      let beforeOrAfter = Math.floor(Math.random() * 2) === 1 ? 1 : -1;
      time.add({ minutes: minuteDiff * beforeOrAfter });

      const areDaysDifferent = firstTime.day() !== time.day();
      const areTimesTheSame = firstTime.hour() === time.hour() && firstTime.minute() === time.minute();
      const hourIsRound = time.minute() === 0;
      if (areDaysDifferent || areTimesTheSame || hourIsRound) {
        existingTimes.unshift(firstTime);
        return f(existingTimes, newTimes);
      }

      const maybeSameTime = lodash.find(existingTimes, t =>
        t.hour() === time.hour() && t.minute() === time.minute()
      );
      if (maybeSameTime) {
        existingTimes.push(firstTime);
        return f(existingTimes, newTimes);
      }

      newTimes.push(time);
      return f(existingTimes, newTimes)
    }

    const oldTimeSlots = this.#rawTimeSlotsForEachDay;
    const newTimeSlots = oldTimeSlots.map(day => {
      const times = day.split(',').map(t => moment.utc(t, 'HH:mm'));
      const newTimes = f(times, []);
      return newTimes.map(t => t.format('HH:mm')).join(',');
    });
    return new ScheduleForSettings(newTimeSlots);
  }

  #addTimeInSlot = (hour, minute, slot) => {
    const maybeSameSlot = this.#timeSlotsForEachDay[slot].filter(timeSlot => {
      return timeSlot.hour === hour && timeSlot.minute === minute;
    });
    if (maybeSameSlot.length > 0) return;
    this.#timeSlotsForEachDay[slot].push(
      {hour: parseInt(hour), minute: parseInt(minute)});
  };
}

export { ScheduleForSettings };
