<template>
    <modal :show="show"
           @close="close"
           body-classes="h-100 container-fluid"
           :header-classes="{ 'pb-0': true, 'header-c': submitting }"
           id="schedule-draft-modal"
           modal-classes="modal-xlg">
        <div class="overlay" v-if="submitting">
            <half-circle-spinner
                    :size="72"
                    :color="'#3f51b5'"
                    style="margin: auto;" />
        </div>
        <div class="row h-100">
            <div class="h-100 col-12">
                <card body-classes="shadow pb-0" class="buffer-container">
                    <div class="buffer-card">
                        <div v-if="schedule">
                            <div class="row justify-content-center"
                                 v-bind:key=midnight
                                 v-for="(threads, midnight, index) in schedule.getThreadsByDate()">
                                <div class="col-lg-12 justify-content-center">
                                    <!-- Name of the day -->
                                    <div class="day-placeholder row mb-2 px-4">
                                        <div class="col-12">
                                            <h5>
                                                <span class="name-of-day bold mr-3">{{ midnight | formatNameOfDay(userProfile.timezone) }}</span>
                                                <small v-if="index !== 0">
                                                    <span class="date-of-day text-uppercase">{{ midnight | formatDateOfDay(userProfile.timezone) }}</span>
                                                </small>
                                            </h5>
                                        </div>
                                    </div>

                                    <ul class="list-group mb-3">
                                        <li v-bind:key="slot.id"
                                            class="list-group-item text-center"
                                            :class="[hoveredSlot === slot.time ? 'active' : '']"
                                            @mouseover="hoveredSlot = slot.time"
                                            @mouseout="hoveredSlot = null"
                                            @click="scheduleRetweet(slot.time)"
                                            v-if="slot.isEmpty()"
                                            v-for="slot in threads">
                                            {{ slot.time.format('hh:mm A') }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
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
  import swal from 'sweetalert2';
  import { mapState } from 'vuex';
  import {Retweet} from '@/models/Retweet';
  import ThreadMixin from "../Mixins/ThreadMixin";

  export default {
    components: {
      HalfCircleSpinner,
    },
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    data() {
      return this.initialState();
    },
    filters: {
      formatNameOfDay: function (time, timezone) {
        const midnightOfToday = moment.tz(timezone).startOf('day');
        const midnightOfTime = moment.tz(time, timezone).startOf('day');

        if (midnightOfToday.diff(midnightOfTime, 'day') === 0) return 'Today';
        if (midnightOfToday.diff(midnightOfTime, 'day') === -1) return 'Tomorrow';
        return midnightOfTime.format('dddd');
      },
      formatDateOfDay: function (time, timezone) {
        return moment.tz(time, timezone).format('MMMM DD');
      },
    },
    methods: {
      close() {
        this.$emit('close');
      },
      // todo: refactor
      formatTimeForInput (time) {
        return time.format('YYYY-MM-DDTHH:mm:ss');
      },
      // todo: refactor
      getDiffBetweenLocalTZAndOtherTZ: function (tz1) {
        const now = moment();
        const localOffset = now.utcOffset();
        now.tz(tz1);
        const otherOffset = now.utcOffset();
        return localOffset - otherOffset;
      },
      // todo: refactor
      getTimeError () {
        switch (this.getTimeStatus()) {
          case 'invalid': return 'Invalid date';
          case 'past': return 'The selected date is in the past';
          default: return '';
        }
      },
      // todo: refactor
      getTimeStatus() {
        const chosenTime = moment(this.time);
        if (!chosenTime._isValid) {
          return 'invalid';
        }

        const minutesDifference = this.getDiffBetweenLocalTZAndOtherTZ(this.userProfile.timezone);
        chosenTime.add(minutesDifference, 'minute');

        const now = moment().add(minutesDifference, 'minutes');
        now.set({ second:0,millisecond:0 });
        const diff = chosenTime.diff(now, 'minutes');
        if (diff + minutesDifference < 0 || (diff + minutesDifference === 0 && chosenTime.minutes() === now.minutes())) {
          return 'past';
        }

        return 'valid';
      },
      // todo: refactor
      initialState() {
        return {
          hoveredSlot: null,
          time: null,
          submitting: false
        };
      },
      isTimeValid() {
        switch (this.getTimeStatus()) {
          case 'valid': return true;
          default: return false;
        }
      },
      now: function () {
        return this.formatTimeForInput(moment().add(10, 'minute').startOf('minute'));
      },
      resetModal() {
        Object.assign(this.$data, this.initialState());
      },
      scheduleRetweet(time) {
        this.submitting = true;
        const originalTweetInfo = {
          username: this.userProfile.username,
          userDisplayName: this.userProfile.name,
          userProfilePictureURL: this.userProfile.photoURL,
          userTwitterId: this.userProfile.twitterId,
          text: this.post.tweets[0].status,
        };
        const retweet = Retweet.newRetweet(this.post.tweetIds[0],
          time,
          this.currentUser,
          originalTweetInfo);
        retweet.saveToFirestore()
          .then(() => {
            this.submitting = false;
            this.close();
            this.resetModal();
            this.$notify({type: 'success', message: 'Retweet successfully scheduled.' });
          })
          .catch(error => {
            this.submitting = false;
            console.error(error);
            swal('Could not schedule this retweet.', '', 'error');
          });
      },
      // todo: refactor
      setTime: function() {
        this.time = this.now();
      },
    },
    mixins: [ThreadMixin],
    mounted() {
      this.setTime();
    },
    name: 'schedule-draft-modal',
    props: {
      show: Boolean,
      post: {
        type: Object,
      },
      schedule: {
        type: Object,
      },
    },
    watch: {
      show: function (show) {
        if (!show) return;
        this.setTime();
      },
    },
  }
</script>

<style lang="scss">
    #schedule-draft-modal {
        .modal-content {
            height: 100%;
        }
        .list-group-item {
            cursor: pointer;
        }
        .buffer-container {
            height: 100%;
            overflow-y: scroll;
        }
        @media (min-width: 720px) {
            .buffer-container {
                height: 100%;
            }
        }
        .buffer-card {
            overflow-y: hidden;
        }
        .modal-xlg {
            min-height: 0;
            min-width: 250px;
            @media (max-width: 1200px) {
                height: calc(100% - 3.5rem);
            }
            @media (min-width: 1200px) {
                height: calc(100% - 3.5rem);
            }
            @media (max-width: 576px) {
                height: calc(100% - 1rem);
                padding: 1em;
            }
        }
    }
</style>

<style>
    .disabled {
        pointer-events: none;
        cursor: default;
    }
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
    .header-c {
        background-color: rgb(155, 155, 154, 0.4);
        -webkit-user-select: none; /* Safari */
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE10+/Edge */
        user-select: none; /* Standard */
    }
</style>
