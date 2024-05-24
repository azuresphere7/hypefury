import axios from 'axios';
const config = require('@/config');

export function getTweet(tweetId, user, profile) {
  return user.getIdToken()
    .then(token => {
      const url = `${config.tweetGetterURL}/${tweetId}`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'twitterAccessTokenKey': profile.twitterAccessTokenKey,
        'twitterAccessTokenSecret': profile.twitterAccessTokenSecret,
      };

      return axios.post(url, {}, { headers });
    });
}
