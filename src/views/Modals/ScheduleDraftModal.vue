<template>
    <modal :show="show"
           @close="close"
           body-classes="h-100 container-fluid"
           :header-classes="{ 'pb-0': true, 'header-c': submitting }"
           id="schedule-draft-modal"
           modal-classes="modal-xlg">
        <template slot="header">
            <h1 class="modal-title" id="">Please choose an option</h1>
        </template>
        <div class="overlay" v-if="submitting">
            <half-circle-spinner
                    :size="72"
                    :color="'#3f51b5'"
                    style="margin: auto;" />
        </div>
        <div class="row h-100">
            <div class="schedule-time-container col-xs-12 col-sm-12 col-md-5 col-lg-5 col-xl-5">
                <card body-classes="shadow pb-0">
                    <h4 class="card-title">Schedule at a specific time</h4>
                    <template>
                        <form role="form">
                            <base-input type="datetime-local"
                                        class="mb-0"
                                        v-model="time"
                                        :min="getMinDateForDateInput()"
                                        :error="getTimeError()"
                                        :valid="isTimeValid()"
                                        successMessage=""
                                        @keyup.ctrl.enter="scheduleAtSpecificTime()"
                                        name="time" />
                            <div class="text-center">
                                <base-button type="primary"
                                             :disabled="!isTimeValid()"
                                             :class="{'disabled': submitting}"
                                             @click="scheduleAtSpecificTime()"
                                             class="mt-2 mb-3">Schedule</base-button>
                            </div>
                        </form>
                    </template>
                </card>
            </div>
            <div class="h-100 col-xs-12 col-sm-12 col-md-7 col-lg-7 col-xl-7">
                <card body-classes="shadow pb-0" class="buffer-container ">
                    <div class="buffer-card">

                        <h4 class="card-title">Add to the queue</h4>

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
                                            @click="scheduleToBuffer(slot.time)"
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
  import { mapState } from 'vuex';
  import ThreadMixin from "../Mixins/ThreadMixin";

  export default {
    components: {
      HalfCircleSpinner,
    },
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    data() {
      return {
        hoveredSlot: null,
        time: null,
        submitting: false
      };
    },
    filters: {
      formatNameOfDay: function (time, timezone) {
        const midnightOfToday = moment().startOf('day');
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
      isTimeValid() {
        switch (this.getTimeStatus()) {
          case 'valid': return true;
          default: return false;
        }
      },
      now: function () {
        return this.formatTimeForInput(moment().add(10, 'minute').startOf('minute'));
      },
      scheduleToBuffer(time) {
        this.scheduleDraft(time);
      },
      scheduleAtSpecificTime() {
        this.scheduleDraft(moment(this.time).tz(this.userProfile.timezone));
      },
      scheduleDraft(time) {
        this.submitting = true;
        this.thread.toScheduledThread(time).update(this.userProfile.timezone)
          .then(() => {
            this.submitting = false;
            this.close();
            this.$notify({type: 'success', message: 'Draft successfully scheduled.' });
          })
          .catch(error => {
            this.submitting = false;
            console.error(error);
            alert('An error has occurred while scheduling the draft.');
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
      thread: {
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
        .schedule-time-container {
            height: 35%;
        }
        .buffer-container {
            height: 65%;
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
            @media (max-width: 1200px) {
                height: calc(100% - 1rem);
                min-width: 90%;
            }
            @media (min-width: 1200px) {
                height: calc(100% - 3.5rem);
                min-width: 60%;
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
