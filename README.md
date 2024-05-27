# hypefury

## Important note
While the app uses Firebase's Twitter Authentication to work, it's not necessary (nor is the app setup) for the app to post real tweets on the Twitter account that you connect to complete the test. While you use the app and create/update threads, these will be saved in Firestore and anything you might need to check behaviours in the app you can get by tweaking the threads' document data or the user's document data.

## Required
Make sure you're using Node 16 and Python 2.7 while installing packages, e.g `npm i`.

## Usage

### Update configuration files with your Firebase testing project configuration
In the files `.firebaserc` and `src/firebase.js`.

### Google cloud configuration
Install `gcloud`, then authenticate yourself with `gcloud auth login` and set your default project with your Firebase project ID.

`npm install -g firebase-tools`

And then setup the Firebase project with `firebase init`.

### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build && firebase deploy
```

Most of the times, you want to deploy with the `firebase deploy --only hosting` option.

### Run your tests
```
firebase emulators:start --only firestore
```

```
FIRESTORE_EMULATOR_HOST=localhost:8082 npm run test:unit
```
