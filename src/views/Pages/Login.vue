<template>
  <div>
    <!-- Header -->
    <div class="header bg-gradient-success py-7 py-lg-8 pt-lg-9">
      <div class="container">
        <div class="header-body text-center mb-7">
          <div class="row justify-content-center">
            <div class="col-xl-5 col-lg-6 col-md-8 px-5">
              <h1 class="text-white">Welcome!</h1>
              <p class="text-lead text-white">Sign-in or sign-up for a free account.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="separator separator-bottom separator-skew zindex-100">
        <svg x="0" y="0" viewBox="0 0 2560 100" preserveAspectRatio="none" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <polygon class="fill-default" points="2560 0 2560 100 0 100"></polygon>
        </svg>
      </div>
    </div>
    <!-- Page content -->
    <div class="container mt--7 pb-9 align-middle">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7">
          <div class="card bg-secondary border-0 mb-0 pb-5 pt-5">
            <div class="bg-transparent">
              <div class="btn-wrapper text-center">
                <div id="firebaseui-auth-container">
                  <half-circle-spinner
                          :size="72"
                          :color="'#3f51b5'"
                          style="margin: auto;"
                          v-show="displaySpinner"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {HalfCircleSpinner} from 'epic-spinners'
  import firebase from 'firebase/app';
  import 'firebase/firestore';
  import * as firebaseui from 'firebaseui';
  import {UserProfile} from "../../models/UserProfile";
  const fb = require('../../firebase');

  export default {
    components: {
      HalfCircleSpinner,
    },
    data() {
      return {
        displaySpinner: true,
      };
    },
    mounted: function () {
      const authUI = new firebaseui.auth.AuthUI(firebase.auth());

      const that = this;

      authUI.start('#firebaseui-auth-container', {
        signInOptions: [
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
          uiShown: function () {
            that.displaySpinner = false;
          },
          signInSuccessWithAuthResult: function (authResult) {
            const ref = fb.usersCollection.doc(authResult.user.uid);

            ref.get().then(doc => {
              if (!doc.data()) {
                const user = UserProfile.createFromAuth(authResult, that.$store);
                ref.set(user.toObject())
                  .then(() => {
                    try {
                      $FPROM.trackSignup({
                        email: authResult.additionalUserInfo.profile.email,
                        uid: authResult.user.uid,
                      }, () => that.$router.push('/setup'));
                    } catch (e) {
                      console.error(e);
                      that.$router.push('/setup');
                    }
                  });
              } else {
                that.$store.watch(() => that.$store.getters.getUserProfile, () => {
                  that.updateUserProfileIfNecessary(authResult, doc).then(() => {
                    that.$router.push('/');
                  });
                });
              }
            });
          },
        }
      });
    },
    methods: {
      updateUserProfileIfNecessary: (authResult, doc) => {
        const update = {
          name: authResult.additionalUserInfo.profile.name,
          photoURL: authResult.additionalUserInfo.profile.profile_image_url_https,
          twitterAccessTokenKey: authResult.credential.accessToken,
          twitterAccessTokenSecret: authResult.credential.secret,
          twitterId: authResult.additionalUserInfo.profile.id_str,
          username: authResult.additionalUserInfo.profile.screen_name,
        };
        if (authResult.additionalUserInfo.profile.email) {
          update.email = authResult.additionalUserInfo.profile.email;
        }

        return doc.ref.update(update);
      },
    }
  };
</script>
