const firebase = require('@firebase/testing');
const fs = require('fs');

const projectId = `firestore-emulator-example-${Date.now()}`;

function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}

beforeEach(async () => {
  await firebase.clearFirestoreData({ projectId });
});

beforeAll(async () => {
  const rules = fs.readFileSync("firestore.rules", "utf8");
  await firebase.loadFirestoreRules({ projectId, rules });
});

afterAll(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('Operations on users', () => {
  test('prevents non logged in users from creating users', async () => {
    const db = authedApp(null);
    const profile = db.collection('users').doc('samy');
    await firebase.assertFails(profile.set({name: 'Samy'}));
  });

  test('prevents non logged in users from updating users', async () => {
    const db = authedApp(null);
    const users = db.collection('users').doc('test');
    await firebase.assertFails(users.update({}));
  });

  test('prevents non logged in users from reading users', async () => {
    const db = authedApp(null);
    const users = db.collection('users');
    await firebase.assertFails(users.get());
  });

  test('prevents users from deleting users', async () => {
    const db = authedApp({uid : 'test'});
    const users = db.collection('users').doc('test');
    await firebase.assertFails(users.delete());
  });

  test('prevents users from creating users without the same uid as them', async () => {
    const db = authedApp({uid: 'ladjsflkasdjfl'});
    const profile = db.collection('users').doc('samy');
    await firebase.assertFails(profile.set({name: 'Samy'}));
  });

  test('prevents users from updating users without the same uid as them', async () => {
    const db = authedApp({uid: 'lskdjfsadfl'});
    const users = db.collection('users').doc('test');
    await firebase.assertFails(users.update({}));
  });

  test('prevents users from reading users without the same uid as them', async () => {
    const db = authedApp({uid: 'lskdjfsadfl'});
    const users = db.collection('users').doc('test');
    await firebase.assertFails(users.get());
  });

  test('allows logged in users to create their profile', async () => {
    const db = authedApp({uid: 'samy'});
    const profile = db.collection('users').doc('samy');
    await firebase.assertSucceeds(profile.set({name: 'Samy'}));
  });

  test('allows logged in users to read their profile', async () => {
    const db = authedApp({uid: 'samy'});
    const profile = db.collection('users').doc('samy');
    await firebase.assertSucceeds(profile.get());
  });

  test('allows logged in users to updating their profile', async () => {
    const db = authedApp({uid: 'samy'});
    await db.collection('users').doc('samy').set({}).then(() => {
      const profile = db.collection('users').doc('samy');
      firebase.assertSucceeds(profile.update({}));
    });
  });
});

describe('Operations on threads', () => {
  function validPost(user) {
    return {
      scheduled: true,
      time: new Date(),
      tweets: [],
      user,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      tweetIds: [],
      deleted: false,
      type: 'post',
      publishingError: null,
      isFavorite: false,
      postNow: false,
    }
  }

  function validRetweet(user) {
    return {
      tweetId: '123',
      time: new Date(),
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      scheduled: false,
      user,
      type: 'retweet',
      originalTweetInfo: {
        text: 'Hello, world!',
        userDisplayName: 'Sasha Koss',
        userProfilePictureURL: 'https://example.com/',
        userTwitterId: '123',
        username: 'kossnocorp'
      },
      deleted: false,
      publishingError: null,
      postNow: false,
    }
  }

  describe('create', () => {
    test('allow users to create thread posts', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      await firebase.assertSucceeds(
        db.collection('threads').add(validPost(owner))
      );
    });

    test('allow users to create draft thread posts', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const payload = validPost(owner)
      payload.time = null;
      await firebase.assertSucceeds(
        db.collection('threads').add(payload)
      );
    });

    test('allow users to create thread retweets', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      await firebase.assertSucceeds(
        db.collection('threads').add(validPost(owner))
      );
    });

    test('prevents users from creating invalid thread posts', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const payload = Object.assign(
        validPost(owner),
        { time: 'Hacked!' }
      )
      await firebase.assertFails(
        db.collection('threads').add(payload)
      );
    });

    test('prevents users from creating invalid thread retweets', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const payload = Object.assign(
        validRetweet(owner),
        { time: 'Hacked!' }
      )
      await firebase.assertFails(
        db.collection('threads').add(payload)
      );
    });

    test('prevents users from creating thread posts for others', async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      db = await authedApp({ uid: 'hacker' });
      await firebase.assertFails(
        db.collection('threads').add(validPost(owner))
      );
    });

    test('prevents users from creating thread retweets for others', async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      db = await authedApp({ uid: 'hacker' });
      await firebase.assertFails(
        db.collection('threads').add(validRetweet(owner))
      );
    });

    test('prevents non logged in users from creating threads', async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      db = await authedApp(null);
      await firebase.assertFails(db.collection('threads').add(validPost(owner)));
    });
  });

  describe('read', () => {
    test("allow users to read their threads", async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const ownerUser = db.collection('users').doc(ownerId);
      await ownerUser.set({});
      const thread = await db.collection('threads').add(validPost(ownerUser));
      await firebase.assertSucceeds(db.collection('threads').doc(thread.id).get());
    });

    test("prevents users to read threads that aren't theirs", async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const ownerUser = db.collection('users').doc(ownerId);
      await ownerUser.set({});
      const thread = await db.collection('threads').add(validPost(ownerUser));
      db = await authedApp({ uid: 'hacker' });
      await firebase.assertFails(db.collection('threads').doc(thread.id).get());
    });

    test('prevents non logged in users from reading threads', async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const ownerUser = db.collection('users').doc(ownerId);
      await ownerUser.set({});
      const thread = await db.collection('threads').add(validPost(ownerUser));
      db = await authedApp(null);
      await firebase.assertFails(db.collection('threads').doc(thread.id).get());
    });
  });

  describe('update', () => {
    function validPostUpdate() {
      return {
        scheduled: true,
        time: new Date(),
        tweets: [],
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        publishingError: 'Error!',
        isFavorite: true,
        postNow: true,
        deleted: false
      }
    }

    function validRetweetUpdate() {
      return {
        tweetId: '123',
        time: new Date(),
        scheduled: false,
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        deleted: true,
        originalTweetInfo: {
          text: 'Hello, world!',
          userDisplayName: 'Sasha Koss',
          userProfilePictureURL: 'https://example.com/',
          userTwitterId: '123',
          username: 'kossnocorp'
        },
        publishingError: 'Error!',
        postNow: true
      }
    }

    test('allows users to update their post threads', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const thread = await db.collection('threads').add(validPost(owner))
      await firebase.assertSucceeds(
        db.collection('threads').doc(thread.id).update(validPostUpdate())
      );
    });

    test('allows users to update their retweet threads', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const thread = await db.collection('threads').add(validRetweet(owner))
      await firebase.assertSucceeds(
        db.collection('threads').doc(thread.id).update(validRetweetUpdate())
      );
    });

    test('prevents users from updating thread posts with invalid data', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const thread = await db.collection('threads').add(validPost(owner))
      const payload = Object.assign(
        validPostUpdate(),
        { created_at: firebase.firestore.FieldValue.serverTimestamp() }
      )
      await firebase.assertFails(
        db.collection('threads').doc(thread.id).update(payload)
      );
    });

    test('prevents users from updating thread retweets with invalid data', async () => {
      const ownerId = 'owner';
      const db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const thread = await db.collection('threads').add(validRetweet(owner))
      const payload = Object.assign(
        validRetweetUpdate(),
        { created_at: firebase.firestore.FieldValue.serverTimestamp() }
      )
      await firebase.assertFails(
        db.collection('threads').doc(thread.id).update(payload)
      );
    });

    test("prevents users from updating others' threads", async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const thread = await db.collection('threads').add(validPost(owner))
      db = authedApp({ uid: 'hacker' });
      await firebase.assertFails(
        db.collection('threads').doc(thread.id).update(validPostUpdate())
      );
    });

    test("prevents non logged from updating threads", async () => {
      const ownerId = 'owner';
      let db = authedApp({ uid: ownerId });
      const owner = db.collection('users').doc(ownerId);
      await owner.set({});
      const thread = await db.collection('threads').add(validPost(owner))
      db = authedApp(null);
      await firebase.assertFails(
        db.collection('threads').doc(thread.id).update(validPostUpdate())
      );
    });
  });

  describe('delete', () => {
    test('allow logged in users to delete their threads', async () => {
      const db = authedApp({ uid: 'samy' });
      const user = db.collection('users').doc('samy');
      await user.set({});
      const thread = db.collection('threads').doc('thread123');
      await thread.set(validPost(user));
      await firebase.assertSucceeds(thread.delete());
    });

    test("prevents logged in users to delete threads that aren't theirs", async () => {
      const db = authedApp({ uid: 'samy' });
      const loggedInUser = db.collection('users').doc('samy');
      await loggedInUser.set({});
      const thread = db.collection('threads').doc('thread123');
      await thread.set(validPost(loggedInUser));

      const db2 = authedApp({ uid: 'askldjfasdf' });
      const sameThread = db2.collection('threads').doc('thread123');
      await firebase.assertFails(sameThread.delete());
    });

    test('prevents non logged in users from deleting threads', async () => {
      const db = authedApp(null);
      const users = db.collection('threads').doc('test');
      await firebase.assertFails(users.delete());
    });
  })
});
