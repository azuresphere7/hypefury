import moment from 'moment';
import 'moment-timezone';

// Careful: used util.js in functions/
export function trialPeriodCalculator(userProfile) {
  let startDate = userProfile.createdAt();
  const diffStartDate = startDate.diff(moment('2019-11-17T00:00:00.000Z'), 'seconds');
  if (diffStartDate < 0) {
    startDate = moment('2019-11-17T00:00:00.000Z');
  }
  const diff = moment().diff(startDate, 'second');
  const days = 14 - secondsToDays(diff);
  const daysLeft = (days < 0) ? 0 : days;
  const percentage = Math.floor((14 - daysLeft) / 14 * 100);
  return { daysLeft, percentage };
}

function secondsToDays(seconds) {
  return Math.floor(seconds / 3600 / 24);
}
