<template>
  <div>
    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-10">
          <div class="col-xs-12 col-sm-6 col-md-3 col-lg-3 col-xl-3 px-0">
            <h3>Time zone</h3>
            <base-input label=""
                        placeholder=""
                        v-model="timezone"
                        list="timezones"
                        autocomplete="timezone"
                        @change="updateTimezone"/>
            <datalist id="timezones">
              <option v-bind:key="tz"
                      v-for="tz in allTimeZones">{{ tz.replace('_', ' ') }}</option>
            </datalist>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-10">
          <div>
            <h3>Auto retweets</h3>
            <p class="text-black">
              Keep your timeline active, even when you're busy or away.<br>
              When Auto Retweets are enabled, Hypefury will retweet a random evergreen post
              whenever a slot of your schedule is empty.
            </p>
            <base-switch v-model="autoRT"></base-switch>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-10">
          <div>
            <h3>Long text splitting into a thread</h3>
            <p>
              Disable this to prevent Hypefury from splitting long texts into a thread
              when you paste them into a new posting box.
            </p>
            <base-switch v-model="shouldSplitLongText"></base-switch>
          </div>
        </div>
      </div>
    </div>

    <schedule />
  </div>
</template>

<script>
  import firebase from 'firebase/app';
  import 'firebase/auth';
  import 'firebase/firestore';
  import moment from 'moment';
  import 'moment-timezone';
  import swal from 'sweetalert2';
  import Schedule from '@/components/Schedule';
  import BaseSwitch from '@/components/BaseSwitch';
  import dao from '@/dao';
  import { mapState } from 'vuex';
  const fb = require('@/firebase');

  export default {
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    data() {
      return {
        allTimeZones: [],
        autoRT: null,
        timezone: null,
        shouldSplitLongText: null,
      };
    },
    watch: {
      autoRT(val, old) {
        if (old === null) return;
        fb.usersCollection
          .doc(this.currentUser.uid)
          .update({ autoRT: val })
          .catch(error => {
            console.error(error);
            swal('An error has occurred while toggling the auto RT feature.');
          });
      },
      shouldSplitLongText(val, old) {
        if (old === null) return;
        dao.userProfile.updateShouldSplitLongText(this.currentUser.uid, val)
          .catch(error => {
            console.error(error);
            swal('An error has occurred while toggling this feature.');
          });
      },
      userProfile(val) {
        // The time zone should always be a 'clone' of the profile's time zone
        this.timezone = val.timezone.replace(/_/g, ' ');
      },
    },
    created() {
      this.allTimeZones = moment.tz.names();
      this.timezone = this.userProfile.timezone.replace(/_/g, ' ');
      this.autoRT = this.userProfile.autoRT;
      this.shouldSplitLongText = this.userProfile.settings.shouldSplitLongText;
    },
    methods: {
      updateTimezone: function () {
        const systemTz = this.timezone.replace(/ /g, '_');
        if (!moment.tz.names().includes(systemTz)) {
          return;
        }

        const that = this;
        firebase.firestore().collection('users')
          .doc(this.currentUser.uid)
          .update({timezone: systemTz})
          .then(() => {
            that.$notify({type: 'success', message: 'Time zone updated.'});
          })
          .catch(() => alert('An error has occurred while updating the time zone.'));
      },
      firestore: function () {
        return firebase.firestore()
      },
    },
    components: {
      BaseSwitch,
      Schedule,
    },
  };
</script>

<style>
  [list]::-webkit-calendar-picker-indicator {
    display: none;
  }
</style>
