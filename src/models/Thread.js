import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';
import 'moment-timezone';
import lodash from 'lodash';
import {Post} from './Post';

const config = require('../config');
const fb = require('../firebase');

class Thread extends Post {
  constructor(id, time, tweets, scheduled,
              user, publishingError, lastAutoRTTime, isFavorite,
              deleted, tweetIds, postNow) {
    super(id, time, scheduled, user, publishingError, deleted);
    this.tweets = tweets;
    this.user = user;
    this.lastAutoRTTime = lastAutoRTTime;
    this.isFavorite = isFavorite || false;
    this.type = 'post';
    this.tweetIds = tweetIds;
    this.postNow = postNow ? postNow : false;
  }

  static newThread(time, tweets, user, isFavorite, postNow) {
    return new Thread(null, time, tweets, false,
      user, null, null, isFavorite,
      null, null, postNow);
  }

  deleteFromFirestore() {
    return super.deleteFromFirestore()
      .then(() => {
        if (!this.scheduled) {
          const media = lodash.flatten(this.tweets.map(t => t.media).filter(m => m !== null));
          return Promise.all(media.map(media => {
            return fb.storageRoot.child(media.name).delete();
          }));
        }
      });
  }

  retweet(user) {
    return Promise.all([this.user.get(), user.getIdToken()])
      .then(([doc, token]) => {
        if (!doc.data()) throw new Error('User not found');

        const url = `${config.retweeterURL}/${this.id}`;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'twitterAccessTokenKey': doc.data().twitterAccessTokenKey,
          'twitterAccessTokenSecret': doc.data().twitterAccessTokenSecret,
        };

        return axios.post(url, {}, { headers });
      });
  }

  saveToFirestore(timezone) {
    // TODO: maybeUpdatedThread is useless, we can use this instead
    const maybeUpdatedThread = this._delayThreadPostingTimeIfItIsTooClose(timezone);
    // FYI: this is used in functions/src/csv-publisher.js too
    return fb.threadsCollection.add({
      scheduled: maybeUpdatedThread.scheduled,
      time: this._timeForFirestore(),
      tweets: maybeUpdatedThread.tweets,
      user: maybeUpdatedThread.user,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      tweetIds: [],
      deleted: false,
      type: 'post',
      publishingError: null,
      isFavorite: maybeUpdatedThread.isFavorite,
      postNow: maybeUpdatedThread.postNow,
    });
  }

  _delayThreadPostingTimeIfItIsTooClose(timezone) {
    const now = moment.tz();
    const threadTime = moment.tz(this.time, timezone);
    if (threadTime.diff(now, 'seconds') < 10) {
      now.add(60 + 10, 'seconds').startOf('minute');
      this.time = now.toDate();
    }
    return this;
  }

  _timeForFirestore(timezone) {
    if (this.postNow) return new Date();
    return moment.tz(this.time, timezone).toDate();
  }

  postingTimeData(timezone) {
    const {day, time} = super.postingTimeData(timezone);
    const threadOrTweet = this.tweets.length > 1 ? 'thread' : 'tweet';
    return {threadOrTweet, day, time};
  }

  lastAutoRTTimeDifference(timezone) {
    if (!this.lastAutoRTTime) return null;

    const threadTime = moment.tz(this.lastAutoRTTime.toDate(), timezone);
    const midnightOfToday = moment.tz(timezone).startOf('day');
    const midnightOfTime = threadTime.startOf('day');
    if (midnightOfToday.diff(midnightOfTime, 'day') === 0) {
      return 'today';
    } else if (midnightOfToday.diff(midnightOfTime, 'day') === 1) {
      return 'yesterday';
    } else {
      return `${midnightOfToday.diff(midnightOfTime, 'day')} days ago`;
    }
  }

  update(timezone) {
    if (!this.id) throw Error('This thread wasn\'t saved, so it can\'t be updated.');
    const threadWithMaybeUpdatedTime = this._delayThreadPostingTimeIfItIsTooClose(timezone);
    const updateMap = {
      scheduled: this.scheduled,
      time: this.time ? threadWithMaybeUpdatedTime._timeForFirestore() : null,
      tweets: this.tweets.map(t => {delete t.mediaFile; return t;}),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      publishingError: this.publishingError ? this.publishingError : null,
      isFavorite: this.isFavorite,
      postNow: this.postNow,
    };
    return fb.threadsCollection.doc(this.id).update(updateMap)
      .catch(error => {
        console.error(error);
        alert('An error has occurred while deleting the thread.')
      });
  }

  isEmpty() {
    return false;
  }

  delayByMinutes(minutes) {
    this.time.add(minutes, 'minutes');
  }

  hasErrors() {
    if (!this.scheduled) return false;

    if (this.publishingError) return true;

    const tweetsWithErrors = this.tweets.filter(t => !t.published);
    if (tweetsWithErrors.length > 0) return true;

    return false;
  }

  toggleFavorite() {
    return fb.threadsCollection.doc(this.id).update({
      isFavorite: !this.isFavorite,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    })
      .catch(error => {
        console.error(`An error has occurred while toggling the favorite status of post ${this.id}.`, error);
        throw error;
      });
  }

  doPostNow() {
    if (!this.id) throw Error('This thread wasn\'t saved, so it can\'t be updated.');
    this.postNow = true;
    const updateMap = {
      time: this._timeForFirestore(),
      postNow: this.postNow,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    };
    return fb.threadsCollection.doc(this.id).update(updateMap)
      .catch(error => {
        console.error(error);
        alert('An error has occurred while instantly posting the thread.')
      });
  }

  static buildFromFirestore(doc, timezone) {
    return new Thread(doc.id,
      moment.tz(doc.data().time.seconds * 1000, timezone),
      doc.data().tweets,
      doc.data().scheduled,
      doc.data().user,
      doc.data().publishingError,
      doc.data().lastAutoRTTime,
      doc.data().isFavorite,
      doc.data().deleted,
      doc.data().tweetIds,
      doc.data().postNow);
  }
}

export { Thread };
