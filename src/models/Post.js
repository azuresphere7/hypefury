import moment from 'moment';
import 'moment-timezone';
import firebase from "firebase";

const fb = require('@/firebase');

class Post {
  midnight;

  constructor(id, time, scheduled, user, publishingError, deleted) {
    this.id = id;
    this.time = time;
    this.scheduled = scheduled;
    this.user = user;
    this.publishingError = publishingError;
    this.midnight = moment(time).startOf('day').toISOString();
    this.deleted = deleted || false;
  }

  postingTimeData(timezone) {
    const threadTime = moment.tz(this.time, timezone);

    const time = threadTime.format('h:mm A');
    let day = 'today';

    const midnightOfToday = moment.tz(timezone).startOf('day');
    const midnightOfTime = threadTime.startOf('day');
    if (midnightOfToday.diff(midnightOfTime, 'day') === 0) {
      day = 'today';
    } else if (midnightOfToday.diff(midnightOfTime, 'day') === -1) {
      day = 'tomorrow';
    } else if (midnightOfToday.diff(midnightOfTime, 'day') === 1) {
      day = 'yesterday';
    } else {
      day = threadTime.format('dddd');
      day += ' ' + threadTime.format('MMMM Do');
    }

    return {day, time};
  }

  deleteFromFirestore() {
    const deleteQuery = this.scheduled ?
      fb.threadsCollection.doc(this.id).update({deleted: true, updated_at: firebase.firestore.FieldValue.serverTimestamp()}) :
      fb.threadsCollection.doc(this.id).delete();

    return deleteQuery
      .catch(error => {
        console.error(`An error has occurred while deleting the post ${this.id}.`, error);
        throw error;
      });
  }

  getTwitterPublishingError() {
    if (this.publishingError && this.publishingError[0].code) {
      return this.publishingError[0].message;
    }
    return null;
  }

  wasNotPublishedBecauseOfNotACustomer() {
    return this.publishingError && this.publishingError.includes('trial period');
  }

  minutesSincePosting(timezone) {
    const now = moment.tz(timezone);
    return now.diff(this.time, 'minutes');
  }
}

export { Post };
