<template>
    <div>
        <back-to-top-custom />

        <div class="container-fluid mt--4">
            <div class="row justify-content-center">
                <div class="col-lg-8 card-wrapper">
                    <card :no-body="true" style="cursor: pointer;">
                        <div class="card-body" @click="showPublishModal">
                            <div class="row align-items-center">
                                <div class="col-sm-9">
                                    <p class="mb-0">Compose a draft here</p>
                                </div>
                            </div>
                        </div>
                    </card>
                </div>
            </div>
        </div>

        <div class="container-fluid" v-if="drafts">
            <div class="row justify-content-center" v-if="drafts.length === 0">
                <div class="col-lg-6 card-wrapper">
                    <div class="row align-items-center">
                        <div class="col-sm-9 p-5">
                            <p class="mb-0">
                                Your composer is empty.<br>
                                <a href="javascript:" @click="showPublishModal">Draft a thread or a tweet</a>
                                to see it appear here!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row justify-content-center">
                <div class="col-lg-8 justify-content-center">
                    <div v-bind:key="draft.id" class="" v-for="draft in drafts">
                        <card :no-body="true" v-if="draft.tweets !== undefined">
                            <div class="card-body" v-if="draft.tweets.length > 1">
                                <time-line type="one-side">
                                    <time-line-item v-bind:key="tweet.id"
                                                    v-for="tweet in draft.tweets"
                                                    badge-type="info"
                                                    additionalClasses="row"
                                                    :title="String(tweet.count + 1)" >
                                        <div :class="(draft.tweets[0].media && draft.tweets[0].media[0]) ? 'col-9' : 'col-12'">
                                            <p class="lead card-text white-space-pre">{{ tweet.status }}</p>
                                        </div>
                                        <queue-thumbnail :tweet="tweet" />
                                    </time-line-item>
                                </time-line>
                            </div>

                            <div class="card-body container-fluid" v-if="draft.tweets.length === 1">
                                <div class="row">
                                    <div :class="(draft.tweets[0].media && draft.tweets[0].media[0]) ? 'col-9' : 'col-12'">
                                        <p class="lead mt-0 card-text white-space-pre">{{ draft.tweets[0].status }}</p>
                                    </div>
                                    <queue-thumbnail :tweet="draft.tweets[0]" />
                                </div>
                            </div>

                            <div slot="footer" class="row">
                                <div class="text-right col-12">
                                    <p class="mb-0">
                                        <small>
                                            <base-button href="javascript:;"
                                                         class="mr-4"
                                                         size="sm"
                                                         type="secondary"
                                                         @click="editDraft(draft)">
                                                Edit
                                            </base-button>
                                            <base-button href="javascript:;"
                                                         size="sm"
                                                         type="secondary"
                                                         class="mr-4"
                                                         @click="scheduleDraft(draft)">
                                                Schedule
                                            </base-button>
                                            <base-button href="javascript:;"
                                                         size="sm"
                                                         type="secondary"
                                                         @click="deleteThread(draft)">
                                                Delete
                                            </base-button>
                                        </small>
                                    </p>
                                </div>
                            </div>
                        </card>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <new-thread-modal @close="closePublishModal"
                              :show="isPublishModalVisible"
                              @reopen-new-thread-modal="reOpenPublishModal"
                              :isCurrentPageComposer="true" />

            <schedule-draft-modal :thread="threadToSchedule"
                                  :schedule="schedule"
                                  @close="closeScheduleDraftModal"
                                  :show="isScheduleDraftModalVisible" />
            <edit-thread-modal :threadToEdit="draftToEdit"
                               @close="closeEditDraftModal"
                               :isCurrentPageComposer="true"
                               :show="isEditDraftModalVisible" />
        </div>
    </div>
</template>

<script>
  import moment from 'moment';
  import 'moment-timezone';
  import {mapState} from 'vuex';
  import {TimeLine, TimeLineItem} from '@/components';
  import EditThreadModal from "./Modals/EditThreadModal";
  import NewThreadModal from './Modals/NewThreadModal';
  import QueueThumbnail from './QueueThumbnail';
  import ScheduleDraftModal from './Modals/ScheduleDraftModal';
  import {DraftThread} from '@/models/DraftThread';
  import {Thread} from '@/models/Thread';
  import {Schedule} from '@/models/Schedule';
  import DeletePostMixin from "@/views/Mixins/DeletePostMixin";
  import BackToTopCustom from "@/views/Widgets/BackToTopCustom";
  const fb = require('../firebase');

  export default {
    name: 'Composer',
    components: {
      BackToTopCustom,
      EditThreadModal,
      NewThreadModal,
      QueueThumbnail,
      ScheduleDraftModal,
      TimeLine,
      TimeLineItem,
    },
    data() {
      return {
        drafts: null,
        isPublishModalVisible: this.$route.hash === '#new',
        isScheduleDraftModalVisible: false,
        threadToSchedule: null,
        isEditDraftModalVisible: false,
        draftToEdit: null,
        schedule: null,
      };
    },
    mounted () {
      this.updateDraftsList();
      this.updateSchedule();
    },
    computed: {
      ...mapState(['userProfile', 'currentUser'])
    },
    methods: {
      editDraft(thread) {
        this.draftToEdit = thread;
        this.isEditDraftModalVisible = true;
      },
      scheduleDraft(thread) {
        this.threadToSchedule = thread;
        this.isScheduleDraftModalVisible = true;
      },
      updateDraftsList() {
        const userRef = fb.usersCollection.doc(this.currentUser.uid);

        const that = this;

        fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', userRef)
          .where('time', '==', null)
          .orderBy('created_at', 'desc')
          .onSnapshot(function(doc) {
            that.drafts = doc.docs.map(d => {
              return new DraftThread(d.id,
                d.data().tweets,
                d.data().user,
                d.data().isFavorite);
            });
          });
      },
      showPublishModal() {
        this.isPublishModalVisible = true;
      },
      showEditModal() {
        this.isEditDraftModalVisible = true;
      },
      closePublishModal: function () {
        this.isPublishModalVisible = false;
      },
      closeScheduleDraftModal: function () {
        this.isScheduleDraftModalVisible = false;
      },
      closeEditDraftModal: function () {
        this.isEditDraftModalVisible = false;
      },
      reOpenPublishModal: function () {
        setTimeout(() => this.showPublishModal(), 400);
      },
      updateSchedule() {
        const userRef = fb.usersCollection.doc(this.currentUser.uid);

        const that = this;

        fb.threadsCollection
          .where('deleted', '==', false)
          .where('user', '==', userRef)
          .where('time', '>=', new Date())
          .where('scheduled', '==', false)
          .onSnapshot(function(doc) {
            const threads = [];
            doc.forEach(d => {
              threads.push(new Thread(d.id,
                moment.tz(d.data().time.seconds * 1000, that.userProfile.timezone),
                d.data().tweets,
                d.data().scheduled,
                d.data().user,
                d.data().publishingError,
                d.data().lastAutoRTTime,
                d.data().isFavorite,
                d.data().deleted));
            });

            that.schedule = new Schedule(60,
              that.userProfile.timezone,
              threads,
              that.userProfile.schedule);
          });
      },
    },
    mixins: [DeletePostMixin],
  }
</script>

<style scoped>
    .white-space-pre {
        white-space: pre-wrap;
    }
</style>
