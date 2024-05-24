<template>
    <div>
        <back-to-top-custom />

        <div class="container-fluid mt--4" v-if="threads">
            <div class="row justify-content-center" v-if="firstBatchOfPostsLoaded && threads.length === 0">
                <div class="col-lg-8 card-wrapper">
                    <div class="row align-items-center">
                        <div class="p-5">
                            <p>
                                This is the curated list of your best posts.
                            </p>
                            <p>
                                When Auto Retweets are enabled (from the
                                <router-link to="/settings">Settings</router-link> page),
                                Hypefury will retweet a random evergreen post
                                whenever a slot of your schedule is empty.
                            </p>
                            <p>
                                This way, your timeline will stay active even when you are busy or away.
                            </p>
                            <p class="mb-0">
                                You have no evergreen posts.<br>
                                Add some posts from the
                                <router-link to="/history">History page</router-link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row justify-content-center">
                <div class="col-lg-8 justify-content-center">
                    <div v-bind:key="thread.id" :ref="thread.id" v-for="thread in threads">
                        <card :no-body="true" v-if="thread.tweets !== undefined">
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

                            <div slot="footer">
                                <div class="row mt--3">
                                    <div class="col-6 d-flex align-items-center">
                                        <base-button class="favorite-btn px-0"
                                                     type="transparent"
                                                     @click="addToEvergreenQueue(thread)">
                                            <span>
                                                <i class="fas fa-angle-double-left"></i>
                                                Take out of the EQ
                                            </span>
                                        </base-button>
                                    </div>

                                    <div v-if="thread.tweets[0].retweetCount >= 0 && (customerStatus === 'trial' || customerStatus === 'premium')"
                                         class="col-6 text-right">
                                        <base-button class="analytics-btn" type="transparent">
                                            <span>{{thread.tweets[0].retweetCount}}</span>
                                            <i class="fas fa-retweet"></i>
                                        </base-button>
                                        <base-button class="mr-2 mr-sm-0 analytics-btn" type="transparent">
                                            <span>{{thread.tweets[0].favoriteCount}}</span>
                                            <i class="fa fa-heart"></i>
                                        </base-button>
                                    </div>
                                </div>

                                <hr class="analytics-separator my-0 mb-2" v-if="thread.tweets[0].retweetCount >= 0">

                                <div class="row">
                                    <div class="col-7">
                                        <p class="mb-0">
                                            <small :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                                                Posted
                                                <a target="_blank"
                                                   :href="`https://twitter.com/${userProfile.username}/status/${thread.tweets[0].tweetId}`">
                                                    {{postingTime.day}} at {{postingTime.time}}.
                                                </a>
                                            </small>
                                        </p>
                                    </div>
                                    <div class="text-right col-5">
                                        <p class="mb-0">
                                            <small>
                                                <base-dropdown v-if="!thread.hasErrors()" menuClasses="dropdown-menu-right">
                                                    <base-button size="sm"
                                                                 type="secondary"
                                                                 slot="title-container"
                                                                 class="dropdown-toggle"
                                                                 :disabled="customerStatus === 'none'"
                                                                 href="javascript:;">
                                                        Retweet
                                                    </base-button>
                                                    <a class="dropdown-item" @click="retweet(thread)">Now</a>
                                                    <a class="dropdown-item" @click="scheduleRetweet(thread)">Schedule once</a>
                                                    <a class="dropdown-item" @click="scheduleRetweetRecurrently(thread)">Schedule multiple times</a>
                                                </base-dropdown>
                                                <base-button href="javascript:;"
                                                             size="sm"
                                                             type="secondary"
                                                             class="ml-4"
                                                             :disabled="customerStatus === 'none'"
                                                             @click="deleteThread(thread)">
                                                    Delete
                                                </base-button>
                                            </small>
                                        </p>
                                    </div>
                                </div>
                                <div class="row" v-if="thread.lastAutoRTTime">
                                    <div class="col-7">
                                        <p class="mb-0">
                                            <small :set="lastAutoRTTimeData = thread.lastAutoRTTimeDifference(userProfile.timezone)">
                                                Last retweeted {{lastAutoRTTimeData}}.
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </card>
                    </div>
                </div>
            </div>
        </div>

        <schedule-retweet-modal :post="retweetToSchedule"
                                :schedule="schedule"
                                @close="closeScheduleRetweetModal"
                                :show="isScheduleRetweetModalVisible" />

        <div v-if="isScheduleRetweetRecurrentlyModalVisible">
            <schedule-retweet-recurrently-modal :post="retweetToSchedule"
                                                @close="closeScheduleRetweetModal"
                                                :show="isScheduleRetweetRecurrentlyModalVisible" />
        </div>
    </div>
</template>

<script>
  import {mapState} from 'vuex';
  import {TimeLine, TimeLineItem} from '../components';
  import QueueThumbnail from './QueueThumbnail';
  import {Schedule} from '@/models/Schedule';
  import CustomerStatusMixin from "@/views/Mixins/CustomerStatusMixin";
  import DeletePostMixin from "@/views/Mixins/DeletePostMixin";
  import RetweetMixin from "@/views/Mixins/HistoryMixin";
  import BackToTopCustom from "@/views/Widgets/BackToTopCustom";
  import {buildPostFromFirestore} from "../util/buildPostFromFirestore";
  import {scrollToElement} from "../util/scrollToElement";

  const fb = require('../firebase');

  export default {
    name: 'EvergreenQueue',
    mounted () {
      this.updateSchedule();
      this.onScroll();
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
    components: {
      BackToTopCustom,
      QueueThumbnail,
      TimeLine,
      TimeLineItem,
    },
    methods: {
      addToEvergreenQueue: function (thread) {
        thread.toggleFavorite();
      },
      postsQuery () {
        const all = fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', fb.usersCollection.doc(this.currentUser.uid))
          .where('isFavorite', '==', true)
          .orderBy('time', 'desc')
          .limit(10);
        return {all};
      },
      scrollToHighlightedThreadId: function () {
        const highlightedThreadId = this.$route.params.threadId;
        if (!highlightedThreadId) return;

        this.$nextTick(() => {
          const element = this.$refs[highlightedThreadId];
          if (!element || !element[0]) return;
          scrollToElement(element[0]);
        });
      },
      updateSchedule() {
        const that = this;

        fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', fb.usersCollection.doc(that.currentUser.uid))
          .where('isFavorite', '==', true)
          .orderBy('time', 'desc')
          .onSnapshot(function(doc) {
            const threads = doc.docs
              .map(d => buildPostFromFirestore(d, that.userProfile.timezone));

            that.schedule = new Schedule(30,
              that.userProfile.timezone,
              threads,
              that.userProfile.schedule);
          });
      },
    },
    mixins: [CustomerStatusMixin, DeletePostMixin, RetweetMixin],
  }
</script>

<style scoped>
    .white-space-pre {
        white-space: pre-wrap;
    }
    .timeline-one-side {
        max-width: 100%;
    }
    .timeline-one-side .timeline-content {
        max-width: 100%;
    }
    .analytics-separator {
        border-top: 1px solid rgba(0, 0, 0, 0.04);
    }
    .analytics-btn:hover {
        text-decoration: none;
        box-shadow: none;
        transform: none;
    }
    .favorite-btn {
        text-decoration: none;
        box-shadow: none;
        transform: none;
    }
    .favorite-btn:hover {
        text-decoration: none;
        box-shadow: none;
        transform: none;
    }
</style>
