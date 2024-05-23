import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';
import 'moment-timezone';
import {Post} from './Post';

const fb = require('../firebase');

class Retweet extends Post {
  constructor(id, tweetId, time, user, scheduled, createdAt, publishingError, retweetId,
              originalTweetInfo, deleted) {
    super(id, time, scheduled, user, publishingError, deleted);
    this.tweetId = tweetId;
    this.createdAt = createdAt;
    this.type = 'retweet';
    this.retweetId = retweetId;
    this.originalTweetInfo = originalTweetInfo;
  }

  static newRetweet(tweetId, time, user, originalTweetInfo) {
    return new Retweet(null, tweetId, time, user, null, null, null,
      null, originalTweetInfo, false);
  }

  saveToFirestore() {
    return fb.threadsCollection
      .add({
        tweetId: this.tweetId,
        time: this._timeForFirestore(),
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        scheduled: false,
        user: fb.usersCollection.doc(this.user.uid),
        type: 'retweet',
        originalTweetInfo: this.originalTweetInfo,
        deleted: false,
        publishingError: null,
        postNow: false,
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }

  _timeForFirestore() {
    return moment(this.time).toDate();
  }

  update() {
    if (!this.id) throw Error('This retweet wasn\'t saved, so it can\'t be updated.');

    const updateMap = {
      tweetId: this.tweetId,
      time: this._timeForFirestore(),
      scheduled: this.scheduled,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      deleted: this.deleted,
      originalTweetInfo: this.originalTweetInfo,
    };

    return fb.threadsCollection.doc(this.id).update(updateMap)
      .catch(error => {
        console.error(error);
        alert('An error has occurred while updating the retweet.')
      });
  }

  hasErrors() {
    if (this.publishingError) return true;

    return false;
  }

  isEmpty() {
    return false;
  }

  couldNotBePostedBecauseNotPremium() {
    return this.hasErrors() && this.publishingError[0].message &&
      this.publishingError[0].message.includes('Only premium');
  }

  static buildFromFirestore(doc, timezone) {
    return new Retweet(doc.id,
      doc.data().tweetId,
      moment.tz(doc.data().time.seconds * 1000, timezone),
      doc.data().user,
      doc.data().scheduled,
      doc.data().createdAt,
      doc.data().publishingError,
      doc.data().retweetId,
      doc.data().originalTweetInfo,
      doc.data().deleted)
  }
}

export { Retweet };
