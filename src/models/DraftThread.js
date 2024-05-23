import firebase from 'firebase/app';
import 'firebase/firestore';
import {Thread} from "./Thread";

const fb = require('../firebase');

class DraftThread extends Thread {
  constructor(id, tweets, user, isFavorite) {
    super(id, null, tweets, false, user, null, null, isFavorite, null, null);
  }

  _delayThreadPostingTimeIfItIsTooClose() {
    return this;
  }

  _timeForFirestore() {
    return null;
  }

  toScheduledThread(time) {
    return new Thread(this.id, time, this.tweets, false, this.user,
      false, null, this.isFavorite, null, null);
  }

  update() {
    if (!this.id) throw Error('This draft wasn\'t saved, so it can\'t be updated.');
    const updateMap = {
      tweets: this.tweets,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      isFavorite: this.isFavorite,
    };
    return fb.threadsCollection.doc(this.id).update(updateMap)
      .catch(error => {
        console.error(error);
        alert('An error has occurred while deleting the thread.')
      });
  }
}

export { DraftThread };
