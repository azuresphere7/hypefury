<template>
<div class="schedule-container">
    <div class="container-fluid mt-4 d-md-none d-xl-none d-lg-none d-block d-sm-block d-xs-block">
        <div class="row justify-content-center">
            <div class="col-10">
                <h3>Posting schedule</h3>
                <div>
                    <p>
                        Please login from a desktop, laptop or tablet to change the schedule.
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="mt-4 d-md-block d-xl-block d-lg-block d-none d-sm-none d-xs-none">
        <div class="container-fluid">
            <div class="row justify-content-center">
                <div class="col-10">
                    <h3>Add a new posting time</h3>

                    <div>
                        <div class="row">
                            <div class="col-3">
                                <base-input>
                                    <select v-model="newTimeSlotDay" class="form-control">
                                        <option value="Every day">Every day</option>
                                        <option value="Weekdays">Weekdays</option>
                                        <option value="Weekends">Weekends</option>
                                        <option value="1">Monday</option>
                                        <option value="2">Tuesday</option>
                                        <option value="3">Wednesday</option>
                                        <option value="4">Thursday</option>
                                        <option value="5">Friday</option>
                                        <option value="6">Saturday</option>
                                        <option value="0">Sunday</option>
                                    </select>
                                </base-input>

                            </div>

                            <div class="col-1 d-flex align-items-center flex-wrap pb-4">
                                at
                            </div>

                            <div class="col-3">
                                <base-input type="time"
                                            @keyup.enter="addTimeSlot"
                                            v-model="newTimeSlotTime"/>
                            </div>

                            <div class="col-3">
                                <base-button type="default"
                                             @click="addTimeSlot"
                                             :disabled="!isSelectedTimeSlotValid()">Add</base-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid mt-4">
            <div class="row justify-content-center">
                <div class="col-10">
                    <h3>Posting schedule</h3>

                    <div class="container">
                        <div class="card-group row">
                            <card v-bind:key="day" :no-body="true" v-for="(timeSlots, day) in userProfile.schedule.getScheduleForView()">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item text-center card-title">
                                        <h5 class="card-title m-0">
                                            <span v-if="day === 'Wednesday'" class="d-none d-xs-none d-sm-none d-md-none d-lg-block">Wednesday</span>
                                            <span v-if="day === 'Wednesday'" class="d-lg-none">Wed.</span>
                                            <span v-if="day !== 'Wednesday'">{{ day }}</span>
                                        </h5>
                                    </li>
                                </ul>
                                <div class="card-body p-1 text-center">
                                    <ul class="list-group list-group-flush">
                                        <li v-bind:key="timeSlot.id"
                                            v-for="timeSlot in timeSlots"
                                            class="list-group-item small p-2"
                                            :class="[compareSlots(hoveredSlot, timeSlot) ? 'hovered-li' : '']"
                                            @mouseover="hoveredSlot = timeSlot"
                                            @mouseout="hoveredSlot = null">
                                            {{ timeSlot.formatted }}
                                            <i class="delete-btn ni ni-fat-remove"
                                               @click="removeTime(timeSlot)"
                                               v-if="timeSlots.length > 1"
                                               :class="[compareSlots(hoveredSlot, timeSlot) ? 'hovered-remove-btn' : 'd-none']">
                                            </i>
                                        </li>
                                    </ul>
                                </div>
                            </card>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      <div class="container-fluid mt-4">
        <div class="row justify-content-center">
          <div class="col-10">
            <h3>Make your posting times more natural and less robotic</h3>

            <div>
              <div class="row">
                <div class="col-8">
                  <p>
                    If your schedule contains multiple round times, such as 9:00 AM, 1:30 PM and 7:00PM,
                    it lacks realness, and this will provide some variance and make it feel more authentic.<br>
                    It will also show your post outside of <i>rush hours</i> when everyone else schedules their tweets.
                  </p>
                  <p>
                    It will change every time slot of your schedule to a new time in a range of ± 5 minutes
                    of the original time.
                  </p>
                  <p>
                    Example: 1:00PM will be changed to a time between 12:55PM and 1:05PM.
                  </p>
                  <p>
                    Note that this will not change the time of your currently scheduled posts.
                  </p>
                </div>

                <div class="col-4">
                  <base-button class="w-100" @click="naturalizeSchedule()">
                    Make my schedule more natural
                  </base-button>
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
  import { mapState } from 'vuex';
  import dao from '@/dao';

  const fb = require('../firebase');

  export default {
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    name: 'schedule',
    data() {
      return {
        hoveredSlot: null,
        newTimeSlotTime: '12:30:00',
        newTimeSlotDay: 'Every day'
      };
    },
    methods: {
      compareSlots(s1, s2) {
        if (!s1) return false;
        return s1.id === s2.id;
      },
      naturalizeSchedule() {
        const naturalizedSchedule = this.userProfile.schedule.naturalize();
        dao.userProfile.updateSchedule(this.currentUser.uid, naturalizedSchedule);
      },
      isSelectedTimeSlotValid() {
        return this.newTimeSlotTime !== '';
      },
      removeTime(timeSlot) {
        this.userProfile.schedule.remove(timeSlot);

        const scheduleForDB = this.userProfile.schedule.getScheduleForDB();
        this.$forceUpdate();

        const that = this;

        fb.usersCollection
          .doc(this.currentUser.uid)
          .update({ schedule: scheduleForDB })
          .then(function () {
            that.$notify({type: 'success', message: 'Schedule updated.'});
          })
          .catch(() => alert('An error has occurred while updating the schedule.'));
      },
      addTimeSlot() {
        const split = this.newTimeSlotTime.split(':');
        const timeSlot = { day: this.newTimeSlotDay,
          hour: parseInt(split[0]),
          minute: parseInt(split[1]) };

        this.userProfile.schedule.add(timeSlot);
        this.$forceUpdate();

        const scheduleForDB = this.userProfile.schedule.getScheduleForDB();

        const that = this;
        fb.usersCollection
          .doc(this.currentUser.uid)
          .update({ schedule: scheduleForDB })
          .then(function () {
            that.$notify({type: 'success', message: 'Schedule updated.'});
          })
          .catch(() => alert('An error has occurred while updating the schedule.'));
      },
    },
  };
</script>

<style>
    .hovered-remove-btn {
        @extend d-inline;
        cursor: pointer;
    }
  .schedule-container {
    padding-bottom: 2em;
  }
</style>
