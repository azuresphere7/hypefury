<template>
    <div>
        <back-to-top-custom />

        <div class="container-fluid mt--4" v-if="threads">
            <div class="row justify-content-center">
                <div class="col-lg-8 justify-content-center">
                    <card :no-body="true"
                          class="bg-gradient-primary">
                        <div class="card-body container-fluid retweet-container rounded border border-secondary">
                            <div class="row">
                                <div class="col-6 d-flex justify-content-start">
                                    <base-input class="w-100 mb-0"
                                                placeholder="Search…"
                                                input-classes="form-control-sm"
                                                :append-icon="searchKeyword ? 'm--1 fa fa-times' : ''"
                                                :append-icon-click-event-handler="clearSearch"
                                                v-model="searchKeyword">
                                    </base-input>
                                </div>
                                <div class="col d-flex justify-content-end">
                                    <base-dropdown class="d-flex align-content-center">
                                        <base-button type="secondary"
                                                     size="sm"
                                                     slot="title-container"
                                                     class="dropdown-toggle filters-dropdown">
                                            <span v-if="filter === 'all'">Display all posts</span>
                                            <span v-else-if="filter === 'deleted'">Display deleted posts</span>
                                            <span v-else-if="filter === 'retweets'">Sort posts by retweets</span>
                                            <span v-else-if="filter === 'likes'">Sort posts by likes</span>
                                            <span v-else>Search</span>
                                        </base-button>
                                        <a :class="filter === 'all' ? 'font-weight-bold' : ''" @click="filter = 'all'" class="dropdown-item" href="javascript:;">Display all posts</a>
                                        <a :class="filter === 'deleted' ? 'font-weight-bold' : ''" @click="filter = 'deleted'" class="dropdown-item" href="javascript:;">Display deleted posts</a>
                                        <a :class="filter === 'retweets' ? 'font-weight-bold' : ''" @click="filter = 'retweets'" class="dropdown-item" href="javascript:;"
                                           v-if="customerStatus === 'trial' || customerStatus === 'premium'">Sort posts by retweets</a>
                                        <a :class="filter === 'likes' ? 'font-weight-bold' : ''" @click="filter = 'likes'" class="dropdown-item" href="javascript:;"
                                           v-if="customerStatus === 'trial' || customerStatus === 'premium'">Sort posts by likes</a>
                                    </base-dropdown>
                                </div>
                            </div>
                        </div>
                    </card>
                </div>
            </div>

            <div class="row justify-content-center" v-if="firstBatchOfPostsLoaded && threads.length === 0">
                <div class="col-lg-6 card-wrapper">
                    <div class="row align-items-center">
                        <div class="col-sm-9">
                            <p class="mb-0" v-if="filter === 'deleted'">
                                No posts have been deleted.
                            </p>
                            <p class="mb-0" v-else-if="filter.startsWith('deleted')">
                                No results found.
                            </p>
                            <p class="mb-0" v-else>
                                Your history is empty.<br>
                                <router-link to="/queue#new">Schedule a thread or a tweet</router-link>
                                to see it appear here!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row justify-content-center">
                <div class="col-lg-8 justify-content-center">
                    <div v-bind:key="thread.id" class="post-card" :ref="thread.id" v-for="thread in threads">
                        <card :no-body="true" v-if="thread.type === 'retweet'">
                            <div class="card-header container-fluid bg-gradient-danger"
                                 v-if="thread.hasErrors() && thread.minutesSincePosting(userProfile.timezone) >= 1">
                                <div class="row">
                                    <div class="col-12 h3 text-white mb-0">
                                        <div v-if="thread.publishingError[0] && thread.publishingError[0].message === '404'">
                                            Tweet not found.
                                        </div>
                                        <div v-else>
                                            This tweet couldn't be retweeted.
                                            <div v-if="!thread.couldNotBePostedBecauseNotPremium() && !thread.wasNotPublishedBecauseOfNotACustomer() && (!thread.publishingError || !thread.getTwitterPublishingError())">
                                              Please contact the support for more information.
                                            </div>
                                            <div v-if="thread.couldNotBePostedBecauseNotPremium()">
                                              Only premium users can retweet tweets that aren't theirs.
                                            </div>
                                            <div v-if="thread.wasNotPublishedBecauseOfNotACustomer()">
                                                You don't or didn't have an active subscription.
                                            </div>
                                            <div v-if="thread.getTwitterPublishingError()">
                                                Message from Twitter: <i>{{thread.getTwitterPublishingError()}}</i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-body container-fluid retweet-container">
                                <div class="row mb-3">
                                    <div class="col-auto">
                                        <a :href="'https://twitter.com/' + thread.originalTweetInfo.username"
                                           target="_blank"
                                           class="avatar avatar-md rounded-circle">
                                            <img alt="Image placeholder"
                                                 :src="thread.originalTweetInfo.userProfilePictureURL">
                                        </a>
                                    </div>
                                    <div class="col-auto">
                                        Retweeted
                                        <h4 class="mb-0">{{ thread.originalTweetInfo.userDisplayName }}</h4>
                                    </div>
                                </div>

                                <div class="retweet-badge icon icon-shape bg-primary text-white rounded-circle shadow">
                                    <i class="fas fa-retweet"></i>
                                </div>

                                <div class="row">
                                    <div class="col-12">
                                        <p class="lead mt-0 card-text white-space-pre">{{ thread.originalTweetInfo.text }}</p>
                                    </div>
                                </div>
                            </div>

                            <div slot="footer">
                                <div class="row">
                                    <div class="col-7">
                                        <p class="mb-0">
                                            <small v-if="!thread.hasErrors()"
                                                   :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                                                Retweeted
                                                <a target="_blank"
                                                   :href="`https://twitter.com/${userProfile.username}/status/${thread.retweetId}`">
                                                    {{postingTime.day}} at {{postingTime.time}}.
                                                </a>
                                            </small>
                                            <small v-else
                                                   :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                                                <a :href="`https://twitter.com/${thread.originalTweetInfo.username}/status/${thread.tweetId}`">This retweet</a> was scheduled for
                                                {{postingTime.day}} at {{postingTime.time}}.
                                            </small>
                                        </p>
                                    </div>
                                    <div class="text-right col-5" v-if="filter !== 'deleted'">
                                        <p class="mb-0">
                                            <small>
                                                <base-button size="sm"
                                                             type="secondary"
                                                             href="javascript:;"
                                                             class="ml-4"
                                                             :disabled="customerStatus === 'none'"
                                                             @click="deleteThread(thread)">
                                                    Undo retweet
                                                </base-button>
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </card>

                        <card :no-body="true" v-if="thread.tweets !== undefined">
                            <div class="card-header container-fluid bg-gradient-danger"
                                 v-if="thread.hasErrors() && thread.minutesSincePosting(userProfile.timezone) >= 1">
                                <div class="row">
                                    <div class="col-9 h3 text-white mb-0">
                                        This post couldn't be published.
                                        <div v-if="!thread.wasNotPublishedBecauseOfNotACustomer() && (!thread.publishingError || !thread.getTwitterPublishingError())">
                                            Please try again or contact the support
                                            (error <i>{{thread.id}}</i>).
                                        </div>
                                        <div v-if="thread.wasNotPublishedBecauseOfNotACustomer()">
                                            You don't or didn't have an active subscription.
                                        </div>
                                        <div v-if="thread.getTwitterPublishingError()">
                                            Message from Twitter: <i>{{thread.getTwitterPublishingError()}}</i>
                                        </div>
                                    </div>

                                    <div class="col-3 text-right">
                                        <button @click="editThread(thread)" class="btn btn-secondary">
                                            Try again
                                        </button>
                                    </div>
                                </div>
                            </div>

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
                                <div class="row mt--3" v-if="filter !== 'deleted'">
                                    <div class="col-6 d-flex align-items-center">
                                        <base-button class="favorite-btn px-0"
                                                     type="transparent"
                                                     @click="addToEvergreenQueue(thread)">
                                            <span v-if="!thread.isFavorite">
                                                <i class="far fa-star"></i>
                                                Set as an Evergreen Post
                                            </span>
                                            <span v-else>
                                                <i class="fas fa-star"></i>
                                                Remove from the Evergreen Posts
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

                                <hr class="analytics-separator my-0 mb-2" v-if="filter !== 'deleted'">

                                <div class="row">
                                    <div class="col-7">
                                        <p class="mb-0">
                                            <small v-if="!thread.hasErrors()"
                                                   :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                                                Posted
                                                <a target="_blank"
                                                   v-if="!thread.deleted"
                                                   :href="`https://twitter.com/${userProfile.username}/status/${thread.tweets[0].tweetId}`">
                                                    {{postingTime.day}} at {{postingTime.time}}.
                                                </a>
                                                <span v-else>
                                                    {{postingTime.day}} at {{postingTime.time}}.
                                                </span>
                                            </small>
                                            <small v-else
                                                   :set="postingTime = thread.postingTimeData(userProfile.timezone)">
                                                This {{postingTime.threadOrTweet}} was scheduled for
                                                {{postingTime.day}} at {{postingTime.time}}.
                                            </small>
                                        </p>
                                    </div>
                                    <div class="text-right col-5" v-if="filter !== 'deleted'">
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
                            </div>
                        </card>
                    </div>
                </div>
            </div>
        </div>

        <div>
        <edit-thread-modal :threadToEdit="threadToEdit"
                           @close="closeEditModal"
                           :editingFailedPost="true"
                           :show="isEditModalVisible" />

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
    </div>
</template>

<script>
  import lodash from 'lodash';
  import {mapState} from 'vuex';
  import {TimeLine, TimeLineItem} from '../components';
  import QueueThumbnail from './QueueThumbnail';
  import {Retweet} from '@/models/Retweet';
  import {Schedule} from '@/models/Schedule';
  import {Thread} from '@/models/Thread';
  import CustomerStatusMixin from "@/views/Mixins/CustomerStatusMixin";
  import DeletePostMixin from "@/views/Mixins/DeletePostMixin";
  import EditThreadModal from '@/views/Modals/EditThreadModal';
  import RetweetMixin from "@/views/Mixins/HistoryMixin";
  import BackToTopCustom from "@/views/Widgets/BackToTopCustom";
  import {buildPostFromFirestore} from "../util/buildPostFromFirestore";
  import {scrollToElement} from "../util/scrollToElement";

  const fb = require('../firebase');

  export default {
    name: 'History',
    data() {
      return {
        isEditModalVisible: false,
        loadingMorePosts: false,
        postsFromCursors: { all: [], deleted: [], retweets: [], likes: [] },
        searchKeyword: '',
        searchQueries: {},
        threadToEdit: null,
      };
    },
    mounted () {
      this.updateSchedule();
      this.onScroll();
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
    components: {
      BackToTopCustom,
      EditThreadModal,
      QueueThumbnail,
      TimeLine,
      TimeLineItem,
    },
    methods: {
      addToEvergreenQueue: function (thread) {
        thread.toggleFavorite();
      },
      clearSearch() {
        this.filter = 'all';
        this.searchKeyword = '';
      },
      closeEditModal: function () {
        this.isEditModalVisible = false;
        this.threadToEdit = null;
      },
      editThread(thread) {
        this.threadToEdit = thread;
        this.isEditModalVisible = true;
      },
      postsQuery() {
        const all = fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', fb.usersCollection.doc(this.currentUser.uid))
          .where('scheduled', '==', true)
          .orderBy('time', 'desc')
          .limit(10);
        const deleted = fb.threadsCollection
          .where('deleted', '==', true)
          .where('publishingError', '==', null)
          .where('user', '==', fb.usersCollection.doc(this.currentUser.uid))
          .orderBy('time', 'desc')
          .limit(10);
        const retweets = fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', fb.usersCollection.doc(this.currentUser.uid))
          .where('scheduled', '==', true)
          .where('publishingError', '==', null)
          .orderBy('retweetCountOfTheFirstTweet', 'desc')
          .limit(10);
        const likes = fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', fb.usersCollection.doc(this.currentUser.uid))
          .where('scheduled', '==', true)
          .where('publishingError', '==', null)
          .orderBy('favoriteCountOfTheFirstTweet', 'desc')
          .limit(10);
        const queries = {all, deleted, retweets, likes};
        lodash.mapValues(this.searchQueries, (value, key) => {
          queries[key] = value;
        });
        return queries;
      },
      scrollToHighlightedThreadId: function () { // Note: this will not work if
                                                 // the post is too far back in the history
        const highlightedThreadId = this.$route.params.threadId;
        if (!highlightedThreadId) return;

        this.$nextTick(() => {
          const element = this.$refs[highlightedThreadId];
          if (!element || !element[0]) return;
          scrollToElement(element[0]);
        });
      },
      searchQuery(kw) {
        throw new Error('Not implemented.');
      },
      updateSchedule() {
        fb.threadsCollection
          .where('user', '==', fb.usersCollection.doc(this.currentUser.uid))
          .where('scheduled', '==', false)
          .where('time', '>=', new Date())
          .orderBy('time', 'desc')
          .onSnapshot(doc => {
            const threads = doc.docs
              .map(d => buildPostFromFirestore(d, this.userProfile.timezone));

            this.schedule = new Schedule(30,
              this.userProfile.timezone,
              threads,
              this.userProfile.schedule);
          });
      },
    },
    mixins: [CustomerStatusMixin, DeletePostMixin, RetweetMixin],
    watch: {
      filter(val) {
        if (!val.startsWith('search')) {
          this.searchQueries = {};
        }
      },
      threads(newVal, oldVal) {
        const firstLoad = lodash.isEmpty(oldVal) && !lodash.isEmpty(newVal);
        if (firstLoad) {
          this.scrollToHighlightedThreadId();
        }
      },
      searchKeyword(val) {
        if (val.length < 3) {
          this.filter = 'all';
          return;
        }
        const filter = `search:${val}`;
        this.searchQueries[filter] = this.searchQuery(val);
        this.postsFromCursors[filter] = [];
        this.filter = filter;
      },
    },
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
    .retweet-badge {
        position: absolute;
        top: 1em;
        right: 1em;
    }
    .retweet-container {
        position: relative;
    }
</style>
