import {httpRoutesURL} from '@/config';
import axios from "axios";

export function isThereAnotherUserWithTheSameEmailAddress(firebaseUser, emailAddress) {
  return firebaseUser.getIdToken()
    .then(token => {
      const headers = { 'Authorization': `Bearer ${token}` };
      const config = { headers };
      const encodedEmailAddress = encodeURIComponent(emailAddress);
      const url = `${httpRoutesURL}/isThereAnotherUserWithTheSameEmailAddress/${encodedEmailAddress}`;
      return axios.get(url, config)
        .then(r => r.status === 200)
        .catch(() => false);
    });
}
