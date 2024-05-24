import {Retweet} from "../models/Retweet";
import {Thread} from "../models/Thread";

export function buildPostFromFirestore(doc, timezone) {
  if (doc.data().type === 'retweet') {
    return Retweet.buildFromFirestore(doc, timezone);
  } else {
    return Thread.buildFromFirestore(doc, timezone);
  }
}
