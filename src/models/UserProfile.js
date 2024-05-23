import firebase from 'firebase/app';
import 'firebase/firestore';
import {isNil} from 'lodash';
import moment from 'moment';
import 'moment-timezone';
import {ScheduleForSettings} from "./ScheduleForSettings";

class UserProfile {
  created_at;
  email;
  name;
  photoURL;
  schedule;
  #scheduleRaw;
  twitterAccessTokenKey;
  twitterAccessTokenSecret;
  twitterId;
  uid;
  username;
  autoRT;
  subscriptionCustomerId;
  subscriptionFirstDate;
  subscriptionInterval;
  subscriptionStatus;
  subscriptionTierName;
  followersCount;
  followingCount;
  settings;

  static DEFAULT_SCHEDULE = [
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
    '08:00,09:00,10:00,11:00,13:00,14:00,16:00,17:00,19:00',
  ];

  static DEFAULT_SETTINGS = {
    shouldSplitLongText: true,
  };

  constructor(user) {
    this.created_at = user.created_at;
    this.email = user.email;
    this.name = user.name;
    this.photoURL = user.photoURL;
    this.#scheduleRaw = user.schedule;
    this.schedule = new ScheduleForSettings(this.#scheduleRaw);
    this.twitterAccessTokenKey = user.twitterAccessTokenKey;
    this.twitterAccessTokenSecret = user.twitterAccessTokenSecret;
    this.twitterId = user.twitterId;
    this.uid = user.uid;
    this.username = user.username;
    this.timezone = user.timezone;
    this.autoRT = !isNil(user.autoRT) ? user.autoRT : true;
    this.subscriptionCustomerId = user.subscriptionCustomerId;
    this.subscriptionFirstDate = user.subscriptionFirstDate;
    this.subscriptionInterval = user.subscriptionInterval;
    this.subscriptionTierName = user.subscriptionTierName;
    this.subscriptionStatus = user.subscriptionStatus;
    this.followersCount = user.followersCount;
    this.followingCount = user.followingCount;
    this.settings = user.settings;
  }

  static createFromAuth(authResult) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    return new UserProfile({
      created_at: timestamp,
      email: authResult.additionalUserInfo.profile.email,
      name: authResult.additionalUserInfo.profile.name,
      photoURL: authResult.additionalUserInfo.profile.profile_image_url_https,
      schedule: new ScheduleForSettings(UserProfile.DEFAULT_SCHEDULE).naturalize().getScheduleForDB(),
      twitterAccessTokenKey: authResult.credential.accessToken,
      twitterAccessTokenSecret: authResult.credential.secret,
      twitterId: authResult.additionalUserInfo.profile.id_str,
      uid: authResult.user.uid,
      username: authResult.additionalUserInfo.profile.screen_name,
      autoRT: true,
      subscriptionCustomerId: null,
      subscriptionFirstDate: null,
      subscriptionInterval: null,
      subscriptionTierName: null,
      subscriptionStatus: null,
      followersCount: null,
      followingCount: null,
      settings: this.DEFAULT_SETTINGS,
    });
  }

  toObject() {
    const o = {
      created_at: this.created_at,
      name: this.name,
      photoURL: this.photoURL,
      schedule: this.#scheduleRaw,
      twitterAccessTokenKey: this.twitterAccessTokenKey,
      twitterAccessTokenSecret: this.twitterAccessTokenSecret,
      twitterId: this.twitterId,
      uid: this.uid,
      username: this.username,
      autoRT: this.autoRT,
      subscriptionCustomerId: this.subscriptionCustomerId,
      subscriptionFirstDate: this.subscriptionFirstDate,
      subscriptionInterval: this.subscriptionInterval,
      subscriptionTierName: this.subscriptionTierName,
      subscriptionStatus: this.subscriptionStatus,
      followersCount: this.followersCount,
      followingCount: this.followingCount,
      settings: this.settings,
    };
    if (this.email) o.email = this.email;
    return o;
  }

  createdAt() {
    return moment.tz(this.created_at.toDate(), this.timezone);
  }
}

export { UserProfile };
