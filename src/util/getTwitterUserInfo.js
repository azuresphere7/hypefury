import axios from 'axios';
import {httpRoutesURL} from '@/config';

export function getTwitterUserInfo(firebaseUser) {
  return firebaseUser.getIdToken()
    .then(token => {
      const headers = { 'Authorization': `Bearer ${token}` };
      return axios.get(`${httpRoutesURL}/getTwitterUserInfo`, { headers }).then(r => r.data);
    });
}
