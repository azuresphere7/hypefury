<template>
    <modal :show="show"
           @close="close"
           body-classes="container-fluid"
           :header-classes="{ 'pb-0': true, 'header-c': submitting }"
           id="schedule-draft-modal"
           modal-classes="">
        <div class="overlay" v-if="submitting">
            <half-circle-spinner
                    :size="72"
                    :color="'#3f51b5'"
                    style="margin: auto;" />
        </div>

        <div class="row">
            <div class="col-12">
                <card body-classes="shadow" class="mb-0">
                    <div class="row">
                        <label style="width: 170px;" class="col-auto col-form-label form-control-label">Retweet everyday at</label>
                        <base-input class="col-auto" type="time" v-model="timeForInput" />
                    </div>
                    <div class="row">
                        <label style="width: 170px;" class="col-auto col-form-label form-control-label">Until</label>
                        <base-input class="col-auto" type="date" v-model="dateForInput" />
                    </div>
                    <div class="row float-right">
                        <base-button type="primary"
                                     :disabled="!isTimeValid()"
                                     :class="{'disabled': submitting}"
                                     @click="scheduleRetweet()"
                                     class="mx-3">{{ recurrenceMessage }}</base-button>
                    </div>
                </card>
            </div>
        </div>
    </modal>
</template>

<script>
  import { HalfCircleSpinner } from 'epic-spinners'
  import moment from 'moment';
  import 'moment-timezone';
  import { mapState } from 'vuex';
  import {Retweet} from '@/models/Retweet';
  import ThreadMixin from "../Mixins/ThreadMixin";

  const SAFETY_SECONDS = 10;

  export default {
    components: {
      HalfCircleSpinner,
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
      dateForInput: {
        get() {
          return this.date.format('YYYY-MM-DD');
        },
        set(dateForInput) {
          const split = dateForInput.split('-');
          this.date = moment.tz(`${split[0]}-${split[1]}-${split[2]}`, this.userProfile.timezone);
        },
      },
      recurrenceMessage() {
        if (!this.datetime) return;
        const now = moment.tz(this.userProfile.timezone);
        const diffDays = this.datetime.diff(now, 'seconds');
        if (diffDays < SAFETY_SECONDS) return 'Please select a time in the future.';
        if (diffDays < 24 * 3600) return 'Retweet once';
        if (diffDays < 48 * 3600) return 'Retweet twice';
        const count = parseInt(diffDays / 24 / 3600 + 1);
        return isNaN(count) ? 'Retweet' : 'Retweet ' + count + ' times';
      },
      timeForInput: {
        get() {
          const {hours, minutes} = this.time;
          return `${this.padNumber(hours, 2)}:${this.padNumber(minutes, 2)}:00`;
        },
        set(timeForInput) {
          const split = timeForInput.split(':');
          this.time = {hours: parseInt(split[0]), minutes: parseInt(split[1])};
        },
      },
    },
    created() {
      this.time = {hours: 10, minutes: 10};
      const now = moment.tz(this.userProfile.timezone);
      const date = moment.tz(this.userProfile.timezone);
      date.set(this.time);
      const diffSeconds = date.diff(now, 'seconds');
      const daysToAdd = diffSeconds > 0 ? 6 : 7; // Depending on whether "now" is before or
                                                 // after 10:10, the number of days that must
                                                 // be added is different
      date.add(daysToAdd, 'days');
      this.date = date;
    },
    data() {
      return this.initialState();
    },
    methods: {
      close() {
        this.$emit('close');
      },
      forceRefreshSubmitButton() {
        const datetime = this.datetime;
        this.$set(this.datetime, null);
        this.$set(this.datetime, datetime);
      },
      initialState() {
        return {
          time: null,
          date: null,
          datetime: null,
          submitting: false
        };
      },
      isTimeValid() {
        if (!this.datetime) return;
        const now = moment.tz(this.userProfile.timezone);
        const diffDays = this.datetime.diff(now, 'seconds');
        return diffDays > SAFETY_SECONDS;
      },
      padNumber(num, size){
        return ('000000000' + num).substr(-size);
      },
      resetModal() {
        Object.assign(this.$data, this.initialState());
      },
      scheduleRetweet() {
        if (!this.isTimeValid()) {
          this.forceRefreshSubmitButton();
          return;
        }

        this.submitting = true;

        const now = moment.tz(this.userProfile.timezone);
        const diffDays = parseInt(this.datetime.diff(now, 'hours') / 24) + 1;

        const times = [];
        for (let i = diffDays - 1; i >= 0; i--) {
            const time = this.datetime.clone();
            time.add(-1 * i, 'days');
            times.push(time);
        }

        const originalTweetInfo = {
          username: this.userProfile.username,
          userDisplayName: this.userProfile.name,
          userProfilePictureURL: this.userProfile.photoURL,
          userTwitterId: this.userProfile.twitterId,
          text: this.post.tweets[0].status,
        };

        const retweets = times.map(time => Retweet.newRetweet(this.post.tweetIds[0],
          time,
          this.currentUser,
          originalTweetInfo));

        const promises = retweets.map(r => r.saveToFirestore());

        return Promise.all(promises)
          .then(() => {
            this.close();
            this.resetModal();
            this.$notify({type: 'success', message: 'Retweets successfully scheduled.' });
          })
          .catch(error => {
            console.error(error);
            alert('An error has occurred while scheduling the retweet.');
          })
          .finally(() => {
            this.submitting = false;
          });
      },
      updateDatetime() {
        const datetime = moment.tz(this.date, this.userProfile.timezone);
        datetime.set(this.time);
        this.datetime = datetime;
      },
    },
    mixins: [ThreadMixin],
    name: 'schedule-draft-modal',
    props: {
      show: Boolean,
      post: {
        type: Object,
      },
    },
    watch: {
      date: function () {
        this.updateDatetime();
      },
      time: function () {
        this.updateDatetime();
      },
    },
  }
</script>

<style>
    .overlay {
        position: absolute;
        width: 100%;
        top: 0px;
        left: 0px;
        height: 100%;
        z-index: 2;
        display: flex;
        align-items: center;
        background-color: rgb(155, 155, 154, 0.4);
    }
</style>
