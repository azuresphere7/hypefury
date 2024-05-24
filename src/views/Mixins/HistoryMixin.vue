<template>
  <div>
  </div>
</template>

<script>
  import lodash from 'lodash';
  import ScheduleRetweetModal from '@/views/Modals/ScheduleRetweetModal';
  import ScheduleRetweetRecurrentlyModal from '@/views/Modals/ScheduleRetweetRecurrentlyModal';
  import {buildPostFromFirestore} from "@/util/buildPostFromFirestore";
  import {isBottomOfPage} from "@/util/isBottomOfPage";

  export default {
    components: {
      ScheduleRetweetModal,
      ScheduleRetweetRecurrentlyModal,
    },
    computed: {
      threads: {
        cache: false,
        get() {
          if (!this.postsFromCursors[this.filter]) return;
          const posts = this.postsFromCursors[this.filter].map(docs => {
            return docs
              .filter(d => !lodash.isNil(d.data().time))
              .map(d => buildPostFromFirestore(d, this.userProfile.timezone));
          });
          const postsMap = {};
          const flattenedPosts = lodash.flatten(posts);
          flattenedPosts.forEach(p => postsMap[p.id] = p);
          return Object.values(postsMap);
        }
      },
    },
    created () {
      this.filter = 'all';
    },
    data() {
      return {
        filter: null,
        firstBatchOfPostsLoaded: false,
        isScheduleRetweetModalVisible: false,
        isScheduleRetweetRecurrentlyModalVisible: false,
        postsFromCursors: { all: [] },
        retweetToSchedule: null,
        schedule: null,
      };
    },
    methods: {
      closeScheduleRetweetModal: function () {
        this.isScheduleRetweetModalVisible = false;
        this.isScheduleRetweetRecurrentlyModalVisible = false;
      },
      onScroll() {
        window.onscroll = () => {
          if (isBottomOfPage() && !this.loadingMorePosts) {
            this.loadMorePosts();
          }
        }
      },
      loadMorePosts() {
        this.loadingMorePosts = true;

        if (!this.filter.startsWith('search:')) {
          const cursorsCount = this.postsFromCursors[this.filter].length;
          const lastRetrievedDoc = lodash.last(this.postsFromCursors[this.filter][cursorsCount - 1]);

          if (!lastRetrievedDoc) return;

          this.postsQuery()[this.filter]
            .startAfter(lastRetrievedDoc)
            .onSnapshot(doc => {
              this.loadingMorePosts = false;
              if (lodash.isNil(this.postsFromCursors[this.filter][cursorsCount])) this.postsFromCursors[this.filter].push([]);
              this.$set(this.postsFromCursors[this.filter], cursorsCount, doc.docs);
            });
        } else {
          this.postsQuery()[this.filter].then(queries => {
            queries.map((query, i) => {
              if (query.processed) {
                this.loadingMorePosts = false;
                return;
              }

              query.query.onSnapshot(result => {
                this.loadingMorePosts = false;
                this.$set(this.postsFromCursors[this.filter], i, result.docs);
                query.processed = true;
                this.$forceUpdate();
              });
            });
          })
        }
      },
      postsQuery: {},
      retweet(thread) {
        const self = this;
        return thread.retweet(this.currentUser)
          .then(() => {
            self.$notify({type: 'success', message: 'Tweet successfully retweeted!'});
          })
          .catch(error => {
            if (error.response.status === 404) {
              self.$notify({type: 'warning', message: 'Tweet not found. Did you maybe delete it from Twitter?'});
            } else {
              self.$notify({type: 'danger', message: 'An unknown error has occurred. Couldn\'t retweet.'});
            }
          });
      },
      scheduleRetweet(post) {
        this.retweetToSchedule = post;
        this.isScheduleRetweetModalVisible = true;
      },
      scheduleRetweetRecurrently(post) {
        this.retweetToSchedule = post;
        this.isScheduleRetweetRecurrentlyModalVisible = true;
      },
    },
    name: 'history-mixin',
    watch: {
      isScheduleRetweetModalVisible () {
        this.$forceUpdate();
      },
      filter (filter) {
        if (!filter.startsWith('search:')) {
          if (this.postsFromCursors[filter].length === 0) {
            this.firstBatchOfPostsLoaded = false;
            this.postsQuery()[filter].onSnapshot(doc => {
              this.firstBatchOfPostsLoaded = true;
              if (lodash.isNil(this.postsFromCursors[filter][0])) this.postsFromCursors[filter].push([]);
              this.$set(this.postsFromCursors[filter], 0, doc.docs)
            });
          }
        } else {
          this.firstBatchOfPostsLoaded = false;
          this.postsQuery()[filter].then(queries => {
            if (queries[0].processed) {
              return;
            }
            queries[0].query.onSnapshot(result => {
              this.firstBatchOfPostsLoaded = true;
              if (lodash.isNil(this.postsFromCursors[filter][0])) this.postsFromCursors[filter].push([]);
              this.$set(this.postsFromCursors[filter], 0, result.docs);
              queries[0].processed = true;
              this.$forceUpdate();
            });
          })
        }
      },
    },
  };
</script>

<style scoped>
</style>
