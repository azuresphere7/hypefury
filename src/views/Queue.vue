<template>
  <div>
    <back-to-top-custom />

    <div class="container-fluid mt--4">
      <div class="row justify-content-center">
        <div class="col-xs-12 col-sm-10 col-md-10 col-xl-7 col-lg-7 card-wrapper">
          <card :no-body="true" style="cursor: pointer;">
            <div class="card-body" @click="openModalWithTimeOfNextFreeSlot()">
              <div class="row align-items-center">
                <div class="col-sm-9">
                  <p class="mb-0">What would you like to share?</p>
                </div>
              </div>
            </div>
          </card>
        </div>
        <div class="d-none d-sm-block d-md-block d-lg-block d-xl-block col-sm-2 col-md-2 col-xl-1 col-lg-1 card-wrapper">
          <base-button class="w-100 align-center"
                       type="secondary"
                       size="lg"
                       @click="openCSVUploadModal">
            <i class="ni ni-cloud-upload-96 mr-0"></i>
            <br>
            CSV
          </base-button>
        </div>
      </div>
    </div>

    <div class="container-fluid">
      <div class="row justify-content-center" v-if="customerStatus === 'none'">
        <div class="col-xs-12 col-sm-12 col-md-12 col-xl-8 col-lg-8 card-wrapper">
          <card :no-body="true">
            <div class="bg-danger text-white card-body container-fluid retweet-container rounded border border-secondary">
              <div class="row">
                <div class="col-sm-10">
                  Your trial period is over or you have canceled your subscription.<br>
                  You can schedule posts, but they will not be published
                  until you <a href="/billing">update your subscription</a>.
                </div>
              </div>
            </div>
          </card>
        </div>
      </div>
    </div>

    <div class="container-fluid" v-if="schedule">
      <div class="row justify-content-center" v-if="queueLoaded && schedule.isEmpty()">
        <div class="col-lg-6 card-wrapper">
          <div class="row align-items-center">
            <div class="col-sm-9 p-5">
              <p class="mb-0">Your queue is empty.<br>Schedule a thread or a tweet to see it appear here!</p>
            </div>
          </div>
        </div>
      </div>

      <transition-group name="fade" mode="out-in">
      <div class="row justify-content-center"
           v-bind:key=midnight
           v-for="(threads, midnight, index) in schedule.getThreadsByDate()">
        <div class="col-lg-8 justify-content-center">
          <div class="day-placeholder container-fluid row mb-2 px-4 mx-0">
            <div class="px-0" :class="index === 0 ? 'col-4' : 'col-12'">
              <h2>
                <span class="name-of-day bold mr-3">{{ midnight | formatNameOfDay(userProfile.timezone) }}</span>
                <small v-if="index !== 0">
                  <span class="date-of-day text-uppercase">{{ midnight | formatDateOfDay(userProfile.timezone) }}</span>
                </small>
              </h2>
            </div>
            <div class="col-8 pt-1 text-right px-0">
              <fade-transition>
                <p class="small mb-0" v-if="index === 0 && currentTime">
                  Time zone: {{ getShortTimezone().replace(/_/, ' ') }}
                  ({{currentTime}})
                </p>
              </fade-transition>
            </div>
          </div>

          <div class="row scheduling-slot-row" :ref="thread.id" v-bind:key="thread.id" v-for="thread in threads">
          <!--Tweet-->
          <div class="col-12" v-if="thread.tweets !== undefined">
            <div class="card droppable"
                 ref="slot"
                 draggable="true"
                 @dragstart="dragStart(thread, $event)"
                 @dragend="dragEnd(thread, $event)"
                 @dragover="dragOver(thread, $event)"
                 v-on:dragster:leave="dragLeaveNonEmptySlot(thread, $event)"
                 v-on:dragster:enter="dragEnterNonEmptySlot(thread, $event)"
                 @drop="dropNonEmptySlot(thread, $event)">
              <div class="card-body" v-if="thread.tweets.length > 1">
                <time-line type="one-side">
                  <time-line-item v-bind:key="tweet.id"
                                  v-for="tweet in thread.tweets"
                                  badge-type="info"
                                  additionalClasses="row"
                                  :title="String(tweet.count + 1)" >
                    <div :class="(thread.tweets[0].media && thread.tweets[0].media[0]) ? 'col-9' : 'col-12'">
                      <p class="lead card-text white-space-pre">{{ tweet.status }}</p>
                    </div>
                    <queue-thumbnail :tweet="tweet" />
                  </time-line-item>
                </time-line>
              </div>

              <div class="card-body container-fluid" v-if="thread.tweets.length === 1">
                <div class="row">
                  <div :class="(thread.tweets[0].media && thread.tweets[0].media[0]) ? 'col-9' : 'col-12'">
                    <p class="lead mt-0 card-text white-space-pre">{{ thread.tweets[0].status }}</p>
                  </div>
                  <queue-thumbnail :tweet="thread.tweets[0]" />
                </div>
              </div>

              <div class="card-footer">
                <div class="row">
                  <div class="col-8">
                    <p class="mb-0">
                      <small :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                        This {{postingTime.threadOrTweet}} will be posted
                        {{postingTime.day}} at {{postingTime.time}}.
                      </small>
                    </p>
                  </div>
                  <div class="text-right col-4">
                    <div class="row mb-0 justify-content-end">
                      <div class="col-auto mb-1 justify-content-center">
                        <base-button size="sm"
                                     type="secondary"
                                     class=""
                                     href="javascript:"
                                     :disabled="customerStatus === 'none'"
                                     @click="postNow(thread)">
                          Post now
                        </base-button>
                      </div>
                      <div class="col-auto justify-content-center">
                        <base-button size="sm"
                                     type="secondary"
                                     class="mr-2 fas fa-edit"
                                     href="javascript:"
                                     @click="editThread(thread)">
                        </base-button>
                        <base-button size="sm"
                                     type="secondary"
                                     class="fas fa-trash"
                                     href="javascript:"
                                     @click="deleteThread(thread)">
                        </base-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!--Retweet-->
          <div class="col-12" v-if="thread.type === 'retweet'">
            <div class="card droppable"
                 ref="slot"
                 draggable="true"
                 @dragstart="dragStart(thread, $event)"
                 @dragend="dragEnd(thread, $event)"
                 @dragover="dragOver(thread, $event)"
                 v-on:dragster:leave="dragLeaveNonEmptySlot(thread, $event)"
                 v-on:dragster:enter="dragEnterNonEmptySlot(thread, $event)"
                 @drop="dropNonEmptySlot(thread, $event)">
              <div v-if="shouldNotTheSameUserWarningBeDisplayed(thread.originalTweetInfo)"
                   class="text-white row px-3 pt-3 pb-0 mb-0">
                <div class="col-12 mb-0 pb-0">
                  <base-alert type="warning" class="mb-0">
                    Only the Premium plan permits that you schedule retweets of other users.<br>
                    This retweet won't be published unless you
                    <a href="/billing">upgrade your subscription</a> to the Premium plan.
                  </base-alert>
                </div>
              </div>

              <div style="position: relative">
                <div class="retweet-badge icon icon-shape bg-primary text-white rounded-circle shadow">
                <i class="fas fa-retweet"></i>
              </div>

              <div class="card-body container-fluid">
                <div class="row mb-3" v-if="thread.originalTweetInfo">
                  <div class="col-auto">
                    <a :href="'https://twitter.com/' + thread.originalTweetInfo.username"
                       target="_blank"
                       class="avatar avatar-md rounded-circle">
                      <img :alt="thread.originalTweetInfo.userDisplayName + '\'s profile picture'"
                           :src="thread.originalTweetInfo.userProfilePictureURL">
                    </a>
                  </div>
                  <div class="col-auto">
                    Retweeting
                    <h4 class="mb-0">
                      <a :href="'https://twitter.com/' + thread.originalTweetInfo.username"
                        target="_blank">
                        {{ thread.originalTweetInfo.userDisplayName }}
                      </a>
                    </h4>
                  </div>
                </div>

                <div class="row">
                  <div class="col-12">
                    <p class="lead mt-0 card-text white-space-pre">{{ thread.originalTweetInfo.text }}</p>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="row">
                <div class="col-8">
                  <p class="mb-0">
                    <small :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                      This
                      <a target="_blank"
                         :href="`https://twitter.com/${thread.originalTweetInfo.username}/status/${thread.tweetId}`">
                        tweet
                      </a>
                      will be retweeted
                      {{postingTime.day}} at {{postingTime.time}}.
                    </small>
                  </p>
                </div>
                <div class="text-right col-4">
                  <div class="mb-0">
                    <base-button size="sm"
                                 type="secondary"
                                 href="javascript:"
                                 @click="deleteThread(thread)">
                      Delete
                    </base-button>
                  </div>
                </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          <!--Empty slot (click to schedule tweet) -->
          <div class="col-8 col-sm-9 col-md-10 col-lg-10 col-xl-10" v-if="!thread.tweets && thread.type !== 'retweet'">
            <div v-on:dragster:leave="dragLeaveEmptySlot(thread, $event)"
                 v-on:dragster:enter="dragEnterEmptySlot(thread, $event)"
                 @dragover="dragOver(thread, $event)"

                 v-show="!thread.tweets"
                 class="card"
                 ref="slot"
                 @drop="dropEmptySlot(thread, $event)"
                 :class="[hoveredTweetSlot !== thread.time ? 'bg-secondary' : '']">
              <div class="card-body droppable empty-schedule-slot py-3 py-sm-4 py-md-4 py-lg-4 py-xl-4"
                   @mouseover="hoveredTweetSlot = thread.time"
                   @mouseout="hoveredTweetSlot = null"
                   @click="openModalWithSpecificTime(thread.time)">
                <p class="text-center mb-0" v-if="hoveredTweetSlot !== thread.time">
                  {{ thread.time.format('hh:mm A') }}
                </p>
                <p class="text-center mb-0" v-else>
                  <i class="fab fa-twitter"></i>
                  Schedule a thread or tweet
                </p>
              </div>
            </div>
            </div>

            <!--Empty slot (click to schedule RT) -->
            <div class="col-4 col-sm-3 col-md-2 col-lg-2 col-xl-2" v-if="!thread.tweets && thread.type !== 'retweet'">
              <div class="card" :class="[hoveredRetweetSlot !== thread.time ? 'bg-secondary' : '']">
                <div class="card-body empty-schedule-slot py-3 py-sm-4 py-md-4 py-lg-4 py-xl-4"
                     @mouseover="hoveredRetweetSlot = thread.time"
                     @mouseout="hoveredRetweetSlot = null"
                     @click="openRetweetModal(thread.time)">
                  <p class="text-center mb-0">
                    <i class="fas fa-retweet"></i>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </transition-group>
    </div>

    <div>
      <new-thread-modal :timeFromParent="timeForModal"
                        :schedule="schedule"
                        :isSpecificTime="isSpecificTime"
                        @scroll-to-thread="function (id) {threadToScrollTo = id}"
                        @reopen-new-thread-modal="previousTime => reOpenModalWithTimeOfNextFreeSlot(previousTime)"
                        @close="closePublishModal"
                        :show="isPublishModalVisible" />
      <edit-thread-modal :threadToEdit="threadToEdit"
                         @close="closeEditModal"
                         :show="isEditModalVisible" />
      <UploadCSVModal :show="isCSVUploadModalVisible"
                      @close="closeCSVUploadModal" />
      <retweet-modal :timeFromParent="timeForModal"
                     :show="isRetweetModalVisible"
                     @close="closeRetweetModal" />
    </div>
  </div>
</template>

<script>
  import 'dragster';
  import firebase from 'firebase/app';
  import 'firebase/auth';
  import 'firebase/firestore';
  import lodash from 'lodash';
  import moment from 'moment';
  import swal from 'sweetalert2';
  import FadeTransition from "vue2-transitions/src/Fade/FadeTransition";
  import {mapState} from 'vuex';
  import CustomerStatusMixin from "@/views/Mixins/CustomerStatusMixin";
  import DragAndDropMixin from "./Mixins/DragAndDropMixin";
  import RetweetMixin from "./Mixins/RetweetMixin";
  import EditThreadModal from './Modals/EditThreadModal';
  import NewThreadModal from './Modals/NewThreadModal';
  import RetweetModal from './Modals/RetweetModal';
  import UploadCSVModal from './Modals/UploadCSVModal';
  import QueueThumbnail from './QueueThumbnail';
  import {Retweet} from '@/models/Retweet';
  import {Schedule} from '@/models/Schedule';
  import {Thread} from '@/models/Thread';
  import {TimeLine, TimeLineItem} from '@/components';
  import DeletePostMixin from "@/views/Mixins/DeletePostMixin";
  import BackToTopCustom from "@/views/Widgets/BackToTopCustom";
  import {buildPostFromFirestore} from "../util/buildPostFromFirestore";
  import {isBottomOfPage} from "../util/isBottomOfPage";
  import {scrollToElement} from "../util/scrollToElement";

  const fb = require('../firebase');

  export default {
    data() {
      return {
        isSpecificTime: null,
        isPublishModalVisible: false,
        isRetweetModalVisible: false,
        isEditModalVisible: false,
        isCSVUploadModalVisible: false,
        loadingMorePosts: false,
        queueLoaded: false,
        postsFromCursors: [],
        hoveredTweetSlot: null,
        hoveredRetweetSlot: null,
        timeForModal: null,
        threadToEdit: null,
        draggedThread: null,
        currentTime: null,
        pageLoaded: false,
        threadToScrollTo: null,
      };
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
      schedule() {
        const posts = lodash.flatten(this.postsFromCursors.map(docs => {
          return docs.map(d => buildPostFromFirestore(d, this.userProfile.timezone));
        }));

        const postsMap = {};
        const flattenedPosts = lodash.flatten(posts);
        flattenedPosts.forEach(p => postsMap[p.id] = p);

        setTimeout(() => this.pageLoaded = true, 400); // todo: don't use setTimeout

        return new Schedule(this.postsFromCursors.length * 7,
          this.userProfile.timezone,
          Object.values(postsMap),
          this.userProfile.schedule);
      },
    },
    created() {
      window.setInterval(() => this.updateCurrentTime(), 1000);
    },
    mounted () {
      this.updateSchedule();
      this.onScroll();
    },
    methods: {
      editThread(thread) {
        this.threadToEdit = thread;
        this.isEditModalVisible = true;
      },
      postNow(post) {
        const that = this;
        swal({
          title: `Post on Twitter now?`,
          type: 'question',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: true,
          confirmButtonText: 'Yes',
          preConfirm: () => {
            post.doPostNow()
              .then(() => {
                const threadOrTweet = post.tweets.length > 1 ? 'Thread' : 'Tweet';
                const message = `${threadOrTweet} on its way!`;
                that.$notify({type: 'success', message: message});
              })
              .catch(error => {
                swal('An error has occurred while deleting the post.', '', 'error');
                console.error(error);
              });
          }
        });
      },
      updateSchedule() {
        const that = this;

        this.postsQuery()
          .onSnapshot(doc => {
            this.queueLoaded = true;
            if (lodash.isNil(this.postsFromCursors[0])) this.postsFromCursors.push([]);
            this.$set(this.postsFromCursors, 0, doc.docs);

            that.scrollToNewThread();
          });
      },
      loadMorePosts() {
        this.loadingMorePosts = true;

        const cursorsCount = this.postsFromCursors.length;
        const lastRetrievedDoc = lodash.last(this.postsFromCursors[cursorsCount - 1]);

        const query = this.postsQuery();
        if (lastRetrievedDoc) query.startAfter(lastRetrievedDoc);
        query.onSnapshot(result => {
          this.loadingMorePosts = false;
          if (lodash.isNil(this.postsFromCursors[cursorsCount])) this.postsFromCursors.push([]);
          this.$set(this.postsFromCursors, cursorsCount, result.docs);
        });
      },
      showPublishModal() {
        this.isPublishModalVisible = true;
      },
      closeCSVUploadModal: function () {
        this.isCSVUploadModalVisible = false;
      },
      closeEditModal: function () {
        this.isEditModalVisible = false;
        this.threadToEdit = null;
      },
      closePublishModal: function () {
        this.isPublishModalVisible = false;
        this.timeForModal = null;
      },
      closeRetweetModal: function () {
        this.isRetweetModalVisible = false;
        this.timeForModal = null;
      },
      getShortTimezone() {
        const split = this.userProfile.timezone.split('/');
        return split[split.length - 1];
      },
      onScroll() {
        window.onscroll = () => {
          if (isBottomOfPage() && !this.loadingMorePosts) {
            this.loadMorePosts();
          }
        }
      },
      openCSVUploadModal() {
        this.isCSVUploadModalVisible = true;
      },
      openModalWithSpecificTime: function (time) {
        this.isSpecificTime = true;
        this.timeForModal = time;
        this.showPublishModal();
      },
      openModalWithTimeOfNextFreeSlot: function (previousTime) {
        this.isSpecificTime = false;
        this.timeForModal = this.schedule.getNextTimeSlot(previousTime);
        this.showPublishModal();
      },
      openRetweetModal: function (time) {
        this.timeForModal = time;
        this.showRetweetModal();
      },
      postsQuery () {
        const userRef = fb.usersCollection.doc(this.currentUser.uid);
        const oneWeekLater = moment.tz(this.userProfile.timezone);
        oneWeekLater.add(this.postsFromCursors.length + 1, 'week');
        return fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', userRef)
          .where('time', '>=', new Date())
          .where('time', '<=', oneWeekLater.toDate())
          .where('postNow', '==', false)
          .where('scheduled', '==', false);
      },
      reOpenModalWithTimeOfNextFreeSlot: function (previousTime) {
        if (!previousTime) throw new Error('No previousTime specified.');
        setTimeout(() => this.openModalWithTimeOfNextFreeSlot(previousTime), 400);
      },
      scrollToNewThread: function () {
        if (!this.threadToScrollTo) return;
        this.$nextTick(() => {
          const element = this.$refs[this.threadToScrollTo];
          if (!element || !element[0]) return;
          scrollToElement(element[0]);
          this.threadToScrollTo = null;
        });
      },
      showRetweetModal() {
        this.isRetweetModalVisible = true;
      },
      updateCurrentTime() {
        this.currentTime = moment().tz(this.userProfile.timezone).format('HH:mm');
      },
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
    components: {
      BackToTopCustom,
      FadeTransition,
      EditThreadModal,
      NewThreadModal,
      QueueThumbnail,
      RetweetModal,
      TimeLine,
      TimeLineItem,
      UploadCSVModal,
    },
    mixins: [CustomerStatusMixin, DeletePostMixin, DragAndDropMixin, RetweetMixin],
    watch: {
      pageLoaded(loaded) {
        if (loaded && this.$route.hash === '#new') {
          this.openModalWithTimeOfNextFreeSlot();
        }
      }
    },
  };
</script>

<style>
  .white-space-pre {
    white-space: pre-wrap;
  }
  .empty-schedule-slot {
    cursor: pointer;
  }
  .timeline-one-side {
    max-width: 100%;
  }
  .timeline-one-side .timeline-content {
    max-width: 100%;
  }
  /* Put the new thread modal over the HelpCrunch icon, and the alerts over the new thread modal */
  .drag-hovered-slot {
    border-style: solid;
    border-width: 2px !important;
  }
  .retweet-badge {
    position: absolute;
    top: 1em;
    right: 1em;
  }
</style>
