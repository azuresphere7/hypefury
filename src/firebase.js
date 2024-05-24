import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebaseui/dist/firebaseui.css'

/**
 * Many things are happening here:
 * 1) Because we load Firebase's configuration from /__/firebase/init.json,
 * We must wait for the fetch to finish because we load the app,
 * hence why we export the promise to main.js (that will load the app after
 * the promise resolves).
 * 2) Because we need the firebase "components", such as storage and auth, in
 * the app, we export them separately.
 */

let firestore;
let auth;
let storageRoot;
let threadsCollection;
let usersCollection;

let defaultExport;

const isNotTestEnv = process.env.JEST_WORKER_ID === undefined;

if (isNotTestEnv) {
  let json;

  defaultExport = new Promise((resolve, reject) => {
    axios.get('/__/firebase/init.json', {}, {})
      .then(result => json = result.data)
      .catch(error => {
        if (error.response.status) {
          const firebaseProjectId = 'TODO';
          json = {
            "apiKey": "TODO",
            "appId": "TODO",
            "authDomain": `${firebaseProjectId}.firebaseapp.com`,
            "databaseURL": `https://${firebaseProjectId}.firebaseio.com`,
            "messagingSenderId": "TODO",
            "projectId": firebaseProjectId,
            "storageBucket": `${firebaseProjectId}.appspot.com`
          }
        } else {
          reject(error);
        }
      })
      .finally(() => {
        const app = firebase.initializeApp(json);

        firestore = firebase.firestore();
        auth = firebase.auth();
        storageRoot = firebase.storage().ref();
        threadsCollection = firestore.collection('threads');
        usersCollection = firestore.collection('users');

        resolve({
          auth,
          firebase,
          firestore,
          projectId: app.options.projectId,
          storageRoot,
          threadsCollection,
          usersCollection,
        });
      });
  });
}

export default defaultExport;

export {
  auth,
  firebase,
  firestore,
  storageRoot,
  threadsCollection,
  usersCollection,
}
