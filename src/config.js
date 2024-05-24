let httpRoutesURL;
let prod;
let retweeterURL;
let tweetGetterURL;
let buildStorageMediaURL;

export function build(firebase) {
  prod = process.env.NODE_ENV === 'production';

  httpRoutesURL = (prod) ?
    `https://us-central1-${firebase.projectId}.cloudfunctions.net/httpRoutes` :
    `http://localhost:5000/${firebase.projectId}/us-central1/httpRoutes`;
  retweeterURL = (prod) ?
    `https://us-central1-${firebase.projectId}.cloudfunctions.net/retweeter` :
    `http://localhost:5000/${firebase.projectId}/us-central1/retweeter`;
  tweetGetterURL = (prod) ?
    `https://us-central1-${firebase.projectId}.cloudfunctions.net/tweetGetter` :
    `http://localhost:5000/${firebase.projectId}/us-central1/tweetGetter`;
  buildStorageMediaURL = (mediaName) => {
    return `https://firebasestorage.googleapis.com/v0/b/` +
      `${firebase.projectId}.appspot.com/o/${mediaName}?alt=media`;
  };

  return {
    httpRoutesURL,
    prod,
    retweeterURL,
    tweetGetterURL,
    buildStorageMediaURL,
  }
}

export {
  httpRoutesURL,
  prod,
  retweeterURL,
  tweetGetterURL,
  buildStorageMediaURL,
}
