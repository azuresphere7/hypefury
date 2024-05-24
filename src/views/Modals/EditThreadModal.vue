<template>
    <modal :show="show"
           @close="close"
           body-classes="p-0"
           modal-classes="modal-dialog-centered modal-xl">
        <card type="secondary" shadow
              header-classes="bg-white"
              body-classes=""
              class="border-0 mb-0">
            <div class="overlay" v-if="submitting">
                <half-circle-spinner
                        :size="72"
                        :color="'#3f51b5'"
                        style="margin: auto;"
                />
            </div>
            <template>
                <button type="button" class="close" @click="close">×</button>

                <form role="form" class="needs-validation">
                    <div class="row" v-if="this.thread && !isCurrentPageComposer && !this.editingFailedPost">
                        <div class="row col-lg-10 col-sm-12 col-md-12">
                            <div class="col-11">
                                <base-alert type="warning" v-if="postPlannedSoon && !postNow">
                                    This post is scheduled in less than two minutes!<br>
                                    <strong>
                                        <a href="javascript:" @click="delayThread(5)">Delay by 5 minutes!</a>
                                    </strong>
                                </base-alert>
                                <base-alert type="success" v-if="delaySuccessful">
                                    Post delayed!
                                </base-alert>
                            </div>
                        </div>
                    </div>

                    <div v-bind:key="tweet.count" v-for="tweet in tweets" class="row">
                        <div class="col-md-10">
                            <base-input ref="textarea-container" inputGroupClasses="textarea-container" alternative>
                              <textarea @keyup.ctrl.enter="updateThread(false)"
                                        rows="3"
                                        style="overflow: hidden; resize: none;"
                                        class="form-control text-default"
                                        ref="tweet"
                                        v-model="tweet.status"
                                        autofocus
                                        @paste="onPaste"
                                        :data-tweet-count="tweet.count"
                                        :placeholder="statusPlaceholder(tweet)"></textarea>

                                <a @click="deleteEditedTweet(tweet)"
                                   v-if="tweets.length > 1"
                                   class="delete-tweet fas fa-trash text-black-50"></a>

                                <div class="px-3 bg-white container pb-3"
                                     id="upload-container"
                                     ref="upload-container"
                                     @drop="uploadSectionDrop(tweet, $event)"
                                     @dragover="uploadSectionDragOver(tweet, $event)"
                                     @dragleave="uploadSectionDragLeave(tweet, $event)">
                                    <div class="upload-icon border">
                                        <div class="remove-chosen-image"
                                             v-if="tweet.mediaFile"
                                             @click="clearMediaSelection(tweet)">
                                            <i class="fas fa-times-circle"></i>
                                        </div>

                                        <div class="add-image-container" v-if="!tweet.mediaFile">
                                            <div class="add-image-icon d-flex align-items-center justify-content-center flex-wrap">
                                                <div class="fa fa-plus-circle fa-xs add-image-plus"></div>
                                                <div class="fa fa-image fa-lg"></div>
                                            </div>
                                        </div>

                                        <div @click="triggerFileUpload(tweet.count)"
                                             class="image-preview text-center add-image-icon d-flex justify-content-center flex-wrap">
                                            <img v-if="tweet.mediaFile && tweet.mediaFile.type === 'image'" :src="tweet.mediaFile.url" />
                                            <video v-if="tweet.mediaFile && tweet.mediaFile.type === 'video'" disabledRemotePlayback>
                                                <source :src="tweet.mediaFile.url">
                                            </video>
                                        </div>

                                        <input @change="filesChange(tweet, null, $event)"
                                               ref="uploadBtn"
                                               type="file"
                                               class="hidden-file-input" />
                                    </div>

                                    <div class="tweet-info-box" v-if="thread">
                                        <base-button size="sm"
                                                     type="secondary"
                                                     :class="charactersLeftClass(tweet)"
                                                     class="characters-counter">
                                            {{ charactersLeftCounter(tweet) }}
                                        </base-button>

                                        <base-button class="tweets-counter"
                                                     size="sm"
                                                     type="secondary"
                                                     v-if="tweets.length > 1">
                                            {{ tweet.count + 1 }} / {{ tweets.length }}
                                        </base-button>

                                        <el-tooltip content="Set as an Evergreen Post">
                                        <base-button class="evergreen-toggler"
                                                     @click="toggleFavorite()"
                                                     size="sm"
                                                     type="secondary"
                                                     v-if="tweet.count === 0">
                                            <i class="far fa-star" v-if="!thread.isFavorite"></i>
                                            <i class="fas fa-star" v-else></i>
                                        </base-button>
                                        </el-tooltip>
                                    </div>
                                </div>
                            </base-input>
                        </div>
                        <div class="col-md-2 pl-md-0 form-group"
                             v-show="showAddBtn(tweet)">
                            <base-button type="secondary"
                                         :class="{'disabled': submitting}"
                                         class="ni ni-fat-add col-md-12"
                                         @click="addTweetBox(tweet)"></base-button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-lg-6 col-xl-6 col-xs-12 col-sm-12 col-md-12 float-left
                                   d-flex align-items-center flex-wrap mt--1 mb--1">
                            <div class="w-100" v-if="thread && !editingFailedPost">
                                <span v-if="!showTimeBox && !isCurrentPageComposer">
                                    Time:

                                    <b>{{ formatTimeForDisplay(thread.time) }}</b>

                                    <base-button size="sm"
                                                 class="ml-3 mt--1"
                                                 type="secondary"
                                                 @click="toggleTimeBox()">
                                        Edit
                                    </base-button>
                                </span>

                                <div class="" v-if="!isCurrentPageComposer && showTimeBox">
                                    <div class="row">
                                        <div class="col-11">
                                            <base-input type="datetime-local"
                                                        :min="getMinDateForDateInput()"
                                                        v-model="time"
                                                        :error="getTimeError()"
                                                        :valid="isTimeValid()"
                                                        class="mb-0"
                                                        successMessage=""
                                                        @keyup.ctrl.enter="updateThread(false)"
                                                        name="time" />
                                        </div>

                                        <div class="col-1 p-0">
                                            <div class="form-group mb-0">
                                                <div>
                                                    <div class="short-timezone btn px-0">{{ shortTimezone }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr class="d-lg-none d-xl-none"/>

                        <div class="col-lg-6 col-xl-6 col-xs-12 col-sm-12 col-md-12 container-fluid text-right">
                            <div class="row">
                                <div class="col-6 pl-md-0 pl-lg-0 pl-xl-0" v-if="!isCurrentPageComposer">
                                    <base-button type="default"
                                                 class="px-1"
                                                 :class="{'pointer': canFormBeSubmittedIgnoreTime()}"
                                                 @click="updateThread(true)"
                                                 style="width: 100%;"
                                                 :disabled="!canFormBeSubmittedIgnoreTime()">
                                        Move to drafts
                                    </base-button>
                                </div>
                                <div class="pr-md-0 pr-lg-0 pr-xl-0"
                                     :class="isCurrentPageComposer ? 'col-12' : 'col-6'">
                                    <div class="btn-group w-100">
                                        <base-button v-if="!editingFailedPost"
                                                     type="primary"
                                                     class="w-100 pr-0"
                                                     :class="{'disabled': submitting}"
                                                     @click="updateThread(false)"
                                                     :disabled="!canFormBeSubmitted()">
                                            Update
                                        </base-button>
                                        <base-button type="primary"
                                                     class="w-100"
                                                     v-else
                                                     @click="addToQueue"
                                                     :disabled="!canFormBeSubmitted()">
                                            Add to queue
                                        </base-button>

                                        <button type="button"
                                                class="btn btn-primary dropdown-toggle dropdown-toggle-split"
                                                @click="isPostDropdownOpen = !isPostDropdownOpen"
                                                v-click-outside="closeDropDown"
                                                data-toggle="dropdown"
                                                aria-haspopup="true"
                                                :disabled="!canFormBeSubmittedIgnoreTime()"
                                                aria-expanded="false">
                                            <span class="sr-only">Toggle Dropdown</span>
                                        </button>
                                        <div class="dropdown-menu" :class="{show: isPostDropdownOpen}">
                                            <a class="dropdown-item post-now-link"
                                               @click="postNow"
                                               :class="customerStatus === 'none' ? 'disabled' : ''"
                                               href="javascript:;">Update and post now</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </template>
        </card>
    </modal>
</template>

<script>
  import { HalfCircleSpinner } from 'epic-spinners'
  import lodash from 'lodash';
  import moment from 'moment';
  import 'moment-timezone';
  import { mapState } from 'vuex';
  import swal from 'sweetalert2'
  import {DraftThread} from "../../models/DraftThread";
  import {Thread} from "../../models/Thread";
  import CustomerStatusMixin from "@/views/Mixins/CustomerStatusMixin";
  import ThreadMixin from "../Mixins/ThreadMixin";
  import {Schedule} from "../../models/Schedule";
  import '@/assets/sass/custom/thread-mixin.scss';
  const config = require('../../config');
  const fb = require('../../firebase');

  export default {
    components: {
      HalfCircleSpinner,
    },
    data() {
      return this.initialState();
    },
    name: "new-thread-modal",
    props: {
      show: Boolean,
      isCurrentPageComposer: {
        type: Boolean,
        default: false,
      },
      threadToEdit: Object,
      editingFailedPost: Boolean,
    },
    watch: {
      show: function (show) {
        if (!show) {
          return;
        }

        this.focusOnLastTweetBox();

        this.thread = this.threadToEdit;
        this.unsubscribeFromThreadWatcher = this.refreshThread();

        this.setTime();

        if (!this.isCurrentPageComposer) {
          this.$nextTick(function () {
            this.updatePostPlannedSoonIntervalID = window.setInterval(() => {
              this.updatePostPlannedSoon();
            }, 1000);
          });
        }

        this.delaySuccessful = false;

        if (!this.thread) return;

        if (this.thread.time) this.time = this.formatTimeForInput(this.thread.time);
        this.timezone = this.thread.timezone;
        this.tweets = this.thread.tweets.map(tweet => {
          if (tweet.media) {
            const media = tweet.media[0];
            const mediaName = media.name;
            const mediaType = media.type;
            tweet.mediaFile = {
              type: this.getMediaType(mediaType),
              url: config.buildStorageMediaURL(mediaName)
            };
          }

          return lodash.clone(tweet);
        });
      },
      thread: function (thread) {
        if (thread && thread.scheduled && !this.editingFailedPost) {
          this.disableModal();
        }
      },
      tweets: {
        handler() {
          this.$nextTick(function () {
            this.$refs.tweet.forEach(element => {
              element.style.height = element.scrollHeight + 'px';
            });
            this.$forceUpdate();
          });
        },
        deep: true,
      },
    },
    methods: {
      addToQueue() {
        this.updateThread(false);
      },
      canFormBeSubmitted() {
        const tweetsOver280Chars = this.tweets.filter(t => this.tweetLength(t.status) > 280);
        const isTimeValid = this.isCurrentPageComposer || this.editingFailedPost || (!this.isCurrentPageComposer && this.isTimeValid());
        return tweetsOver280Chars.length === 0 && !this.submitting &&
          this.tweets.filter(t => t.status === '' && t.media === null).length === 0 && isTimeValid;
      },
      canFormBeSubmittedIgnoreTime() {
        const tweetsOver280Chars = this.tweets.filter(t => this.tweetLength(t.status) > 280);
        return tweetsOver280Chars.length === 0 && !this.submitting &&
          this.tweets.filter(t => t.status === '' && t.media === null).length === 0;
      },
      clearMediaSelection(tweet) {
        this.mediaToDelete.push(tweet.media[0].name);
        tweet.mediaFile = null;
        tweet.media = null;
        this.$forceUpdate();
      },
      close() {
        ThreadMixin.methods.close.bind(this)();
        this.resetModal();
      },
      delayThread(minutes) {
        this.thread.delayByMinutes(minutes);
        this.thread.update(this.userProfile.timezone)
          .then(() => {
            this.delaySuccessful = true;
            if (this.thread.time) this.time = this.formatTimeForInput(this.thread.time)
          })
          .catch(error => {
            console.error(error);
            alert('An error has occurred while delaying the post.');
          });
      },
      deleteEditedTweet(tweet) {
        this.deleteTweet(tweet);
        if (tweet.media) this.mediaToDelete.push(tweet.media[0].name);
      },
      disableModal() {
        swal({
          text: 'This post has been scheduled for publishing.\nYou can\'t edit it anymore.',
          type: 'warning',
          onClose: () => {
            this.close();
          },
        });
      },
      initialState() {
        return {
          time: null,
          tweets: [this.emptyTweet(0)],
          files: {},
          submitting: false,
          timezone: null,
          shortTimezone: null,
          mediaToDelete: [],
          delaySuccessful: false,
          unsubscribeFromThreadWatcher: null,
          thread: null,
          postPlannedSoon: null,
          updatePostPlannedSoonIntervalID: null,
        };
      },
      triggerFileUpload: function (tweetIndex) {
        if (!this.$refs.uploadBtn[tweetIndex]) return;
        this.$refs.uploadBtn[tweetIndex].click();
      },
      // TODO: This is duplicated in NewThreadModal
      filesChange: function (tweet, file, event) {
        const previousMediaName = tweet.media ? tweet.media[0].name : null;
        if (!file) {
          file = event.target.files[0];
        }

        if (!file) {
          if (event) this.resetFile(event);
          return;
        }

        const fileType = file.type.toLowerCase();

        if (!fileType.includes('video') && !fileType.includes('image')) {
          swal('Unsupported file type.', '', 'error');
          tweet.media = null;
          tweet.mediaFile = null;
          if (event) this.resetFile(event);
          return;
        }

        if ((fileType.includes('video')) && file.size > 50 * 1024 * 1024) {
          swal('Videos should be less than 50MB.');
          tweet.media = null;
          tweet.mediaFile = null;
          if (event) this.resetFile(event);
          return;
        }

        if ((fileType.includes('image')) && file.size > 5 * 1024 * 1024) {
          swal('Images should be less than 5MB (as per Twitter limits).');
          tweet.media = null;
          tweet.mediaFile = null;
          if (event) this.resetFile(event);
          return;
        }

        this.updateFilesForTweet(tweet, file);
        if (previousMediaName) this.mediaToDelete.push(previousMediaName);

        if (event) this.resetFile(event);
        this.$forceUpdate();
      },
      postNow() {
        const postNow = true;
        this.updateThread(false, postNow);
      },
      updatePostPlannedSoon: function () {
        if (!this.thread.time) return; // time to null (sometimes) after it's moved to drafts
        const now = moment();
        const minutesDiff = this.thread.time.diff(now, 'minutes');
        this.postPlannedSoon = minutesDiff < 2;
      },
      setTime: function() {
        this.shortTimezone = moment().tz(this.userProfile.timezone).format('z');
      },
      updateThread: function (moveToDrafts, postNow) {
        const uploadNewMedia = () => Promise.all(this.tweets.map(tweet => {
          return this.uploadMedia(tweet, tweet => {
            const hasMediaChanged = !(typeof tweet.media === 'object');
            return hasMediaChanged;
          });
        }));

        const updateThread = (tweets) => {
          const threadToSave = this.isCurrentPageComposer && !postNow ?
            new DraftThread(this.thread.id,
              tweets,
              this.thread.user,
              this.thread.isFavorite) :
            new Thread(this.thread.id,
              moveToDrafts ? null : moment.tz(this.time, this.userProfile.timezone).toDate(),
              tweets,
              this.thread.scheduled,
              this.thread.user,
              this.thread.publishingError,
              this.thread.lastAutoRTTime,
              this.thread.isFavorite,
              this.thread.deleted,
              this.thread.tweetIds,
              postNow);

          const that = this;

          const maybeUpdatedThread = !this.editingFailedPost ?
            new Promise((resolve) => resolve(threadToSave)) :
            fb.threadsCollection
              .where('deleted', '==', false)
              .where('user', '==', fb.usersCollection.doc(that.currentUser.uid))
              .where('time', '>=', new Date())
              .where('scheduled', '==', false)
              .where('postNow', '==', false)
              .get()
              .then(function(snapshot) {
                const threads = [];

                snapshot.forEach(d => {
                  threads.push(new Thread(d.id,
                    moment.tz(d.data().time.seconds * 1000, that.userProfile.timezone),
                    d.data().tweets,
                    d.data().scheduled,
                    d.data().user,
                    d.data().publishingError,
                    d.data().lastAutoRTTime,
                    d.data().isFavorite,
                    d.data().deleted,
                    d.data().tweetIds,
                    d.data().postNow));
                });

                const schedule = new Schedule(60, that.userProfile.timezone, threads, that.userProfile.schedule);
                const nextTimeInQueue = schedule.getNextTimeSlot();
                threadToSave.scheduled = false;
                threadToSave.time = nextTimeInQueue;
                threadToSave.tweets = threadToSave.tweets.map(t => {
                  delete t.published;
                  return t;
                });
                delete threadToSave.publishingError;

                return threadToSave;
              });

          maybeUpdatedThread.then(thread => {
            thread.update(this.userProfile.timezone)
              .then(() => {
                this.close();
                this.resetModal();
                const threadOrTweet = thread.tweets.length > 1 ? 'Thread' : 'Tweet';
                const message = postNow ?
                  `${threadOrTweet} on its way!` :
                  this.editingFailedPost ?
                    `${threadOrTweet} re-queued!` :
                    (this.isCurrentPageComposer ? 'Draft' : threadOrTweet) + ' updated!';
                this.$notify({type: 'success', message: message});
              })
              .catch(error => {
                alert('An error has occurred while updating this thread.');
              });
          });
        };

        const deleteOldMedia = () => Promise.all(this.mediaToDelete.map(mediaName => {
          return fb.storageRoot.child(mediaName).delete();
        }));

        this.submitting = true;

        return uploadNewMedia()
          .then(updateThread)
          .then(deleteOldMedia)
          .catch(error => {
            console.error(error);
          });
      },
      refreshThread() {
        const that = this;
        return fb.threadsCollection
          .doc(this.thread.id)
          .onSnapshot(function(doc) {
            const data = doc.data();

            if (!data) return;

            that.thread = new Thread(doc.id,
              data.time ? moment.tz(data.time.seconds * 1000, that.userProfile.timezone) : null,
              data.tweets,
              data.scheduled,
              data.user,
              data.publishingError,
              data.lastAutoRTTime,
              data.isFavorite,
              data.deleted,
              data.tweetIds,
              data.postNow);
          });
      },
      resetModal() {
        clearInterval(this.updatePostPlannedSoonIntervalID);
        if (this.unsubscribeFromThreadWatcher) this.unsubscribeFromThreadWatcher();

        Object.assign(this.$data, this.initialState());
      },
      toggleFavorite() {
        this.thread.isFavorite = !this.thread.isFavorite;
      },
    },
    mixins: [CustomerStatusMixin, ThreadMixin],
    mounted() {
      this.setTime();
      this.initOverflowHighlighting(this.$refs.tweet[0]);
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
  }
</script>

<style scoped>
    .hidden-file-input {
        display: block;
        visibility: hidden;
        position: absolute;
        width: 6em;
        height: 6em;
        top: -1px;
        left: -1px;
    }
    #upload-container {
        position: relative;
        height: auto;
    }
    .upload-icon {
        cursor: pointer;
        border-style: dashed !important;
        width: 4.5em;
        height: 4.5em;
        position: relative;
    }
    .add-image-container {
        z-index: 10;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    .add-image-icon {
        display: flex;
        position: relative;
        padding: 5px;
        width: 100%;
        height: 100%;
    }
    .image-preview {
        z-index: 100;
        position: relative;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .image-preview img {
        max-width: 100%;
        max-height: 100%;
    }
    .add-image-plus {
        position: absolute;
        right: 15px;
        top: 20px;
        background: transparent;
        z-index: -1;
    }
    .remove-chosen-image {
        z-index: 1000;
        position: absolute;
        top: -11px;
        right: -9px;
    }
    .close {
        top: 0.6rem;
        right: 0.6rem;
        position: absolute;
    }
    .delete-tweet {
        cursor: pointer;
        position: absolute;
        top: 10px;
        right: 27px;
    }
    video {
        width: 100%;
        height: 100%;
    }
    .disabled {
      pointer-events: none;
      cursor: default;
    }
    .disabled-media {
      background-color: #e9ecef;
      pointer-events: none;
      cursor: default;
    }
    .overlay {
      position: absolute;
      width: 100%;
      top: 0px;
      left: 0px;
      height: 100%;
      z-index: 101;
      display: flex;
      pointer-events: none;
      align-items: center;
      background-color: rgb(155, 155, 154, 0.4);
    }
    .short-timezone {
        pointer-events: none;
    }
</style>
