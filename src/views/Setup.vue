<template>
  <div>
    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8 card-wrapper">
          <card :no-body="true">
              <div class="card-body">
                <base-input group class="mb-3"
                            label="We tried to guess your time zone. If it's not correct,
                           please type in the name of your city or continent and we'll find it for you.">
                  <input type="text"
                         @keyup.enter="submitForm"
                         autofocus
                         class="form-control"
                         :class="{'border-danger': !isTimezoneFieldValid}"
                         placeholder="Time zone"
                         aria-label="Recipient's username"
                         aria-describedby="button-addon2"
                         list="timezones"
                         ref="timezone"
                         v-model="selectedTimeZone">

                  <datalist id="timezones">
                    <option v-bind:key="tz"
                            v-for="tz in allTimeZones">{{ tz.replace('_', ' ') }}</option>
                  </datalist>
                </base-input>

                <base-input :required="true"
                            @keyup.enter="submitForm"
                            :inputClasses="!isEmailAddressFieldValid ? 'border-danger' : ''"
                            :error="emailError"
                            type="email"
                            label="What is your email address?"
                            placeholder="Email address"
                            ref="emailAddress"
                            v-model="emailAddress">
                </base-input>

                <div class="input-group-append justify-content-end">
                  <button class="btn btn-primary"
                          type="button"
                          :disabled="loading"
                          @click="submitForm">
                    <span v-if="!loading">I am ready!</span>
                    <span v-else><i class='fa fa-spinner fa-spin '></i> Loading...</span>
                  </button>
                </div>
              </div>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import firebase from 'firebase/app';
  import 'firebase/auth';
  import 'firebase/firestore';
  import moment from 'moment';
  import 'moment-timezone';
  import swal from 'sweetalert2';
  import { mapState } from 'vuex';
  import {isThereAnotherUserWithTheSameEmailAddress} from '@/util/isThereAnotherUserWithTheSameEmailAddress';

  export default {
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    data() {
      return {
        allTimeZones: [],
        emailAddress: null,
        emailError: null,
        isTimezoneFieldValid: true,
        isEmailAddressFieldValid: true,
        loading: false,
        selectedTimeZone: null,
      };
    },
    created() {
      if (moment.tz.guess()) this.selectedTimeZone = moment.tz.guess().replace('_', ' ');
      this.allTimeZones = moment.tz.names();
      this.emailAddress = this.userProfile.email;
    },
    methods: {
      submitForm: function () {
        this.loading = true;

        const systemTz = this.selectedTimeZone.replace(' ', '_');

        let errorFound = false;

        if (!moment.tz.names().includes(systemTz)) {
          swal('Please select a time zone from the list!', '', 'error');
          this.isTimezoneFieldValid = false;
          errorFound = true;
          this.$nextTick(() => {
            this.$refs.timezone.focus();
          });
        } else {
          this.isTimezoneFieldValid = true;
        }

        if (!this.emailAddress || !this.validEmail(this.emailAddress)) {
          this.isEmailAddressFieldValid = false;
          errorFound = true;
          this.$nextTick(() => {
            this.$refs.emailAddress.$el.querySelector('input').focus()
          });
        } else {
          this.isEmailAddressFieldValid = true;
        }

        if (errorFound) {
          this.loading = false;
          return;
        }

        isThereAnotherUserWithTheSameEmailAddress(this.currentUser, this.emailAddress).then(yesThereIs => {
          if (yesThereIs) {
            this.isEmailAddressFieldValid = false;
            this.$nextTick(() => {
              this.$refs.emailAddress.$el.querySelector('input').focus();
              this.emailError = 'Email address already in use';
            });
            this.loading = false;
          } else {
            firebase.firestore().collection('users')
              .doc(this.currentUser.uid)
              .update({ email: this.emailAddress, timezone: systemTz })
              .then(() => {
                this.$router.push('/');
              })
              .catch(() => alert('An error occurred. Please reload the page.'))
          }
        });
      },
      validEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      },
    },
    components: {
    },
  };
</script>

<style>
  [list]::-webkit-calendar-picker-indicator {
    display: none;
  }
</style>
