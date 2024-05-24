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
                    <div v-bind:key="tweet.count" v-for="tweet in tweets" class="row">
                        <div class="col-md-10">
                            <base-input ref="textarea-container" inputGroupClasses="textarea-container" alternative>
                              <textarea @keyup.ctrl.enter="(isCurrentPageComposer) ? saveAsADraft() : (timeFromParent ? scheduleThread(false) : addToQueue())"
                                        rows="3"
                                        style="overflow: hidden; resize: none;"
                                        class="form-control text-default"
                                        ref="tweet"
                                        v-model="tweet.status"
                                        @input="onInputChange"
                                        autofocus
                                        @paste="onPaste"
                                        :data-tweet-count="tweet.count"
                                        :placeholder="statusPlaceholder(tweet)"></textarea>

                                <a @click="deleteTweet(tweet)"
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
                                             class="image-preview text-center add-image-icon d-flex align-items-center justify-content-center flex-wrap">
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

                                    <div class="tweet-info-box">
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
                                            <i class="far fa-star" v-if="!isFavorite"></i>
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
                                         class="ni ni-fat-add col-md-12"
                                         @click="addTweetBox(tweet)"></base-button>
                        </div>
                    </div>

                    <div class="row">
                        <div v-if="!timeFromParent"
                             class="d-none d-sm-none d-md-none d-xl-block d-lg-block
                                    col-lg-6 col-xl-6 col-xs-12 col-sm-12 col-md-12"></div>
                        <div v-else class="col-lg-6 col-xl-6 col-xs-12 col-sm-12 col-md-12
                                           d-flex align-items-center flex-wrap float-left">
                            <div class="w-100">
                                <span v-if="!showTimeBox">
                                    Time:

                                    <b>{{ formatTimeForDisplay(timeFromParent) }}</b>

                                    <base-button size="sm"
                                                 class="ml-3 mt--1"
                                                 type="secondary"
                                                 @click="toggleTimeBox()">
                                        Edit
                                    </base-button>
                                </span>

                                <div class="mt--1 mb--2" v-if="!isCurrentPageComposer && showTimeBox">
                                    <div class="row">
                                        <div class="time-picker col-10 col-xs-10 col-sm-10 col-md-10 col-lg-11 col-xl-11">
                                            <base-input type="datetime-local"
                                                        :min="getMinDateForDateInput()"
                                                        v-model="time"
                                                        :error="getTimeError()"
                                                        :valid="isTimeValid()"
                                                        successMessage=""
                                                        @keyup.ctrl.enter="scheduleThread(false)"
                                                        name="time" />
                                        </div>
                                        <div class="col-2 col-xs-2 col-sm-2 col-md-2 col-lg-1 col-xl-1">
                                            <div class="form-group mb-0 ml--2 ml-sm--1 ml-md--1">
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

                        <div class="col-lg-6 col-xl-6 col-xs-12 col-sm-12 col-md-12
                                    container-fluid
                                    text-right">
                            <div class="row" v-if="isCurrentPageComposer">
                                <div class="btn-group w-100">
                                    <base-button type="primary"
                                                 class="px-1"
                                                 :class="{'pointer': canFormBeSubmittedIgnoreTime()}"
                                                 @click="saveAsADraft"
                                                 style="width: 100%;"
                                                 :disabled="!canFormBeSubmittedIgnoreTime()">
                                        <span>Save</span>
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
                                           href="javascript:;">Post now</a>
                                    </div>
                                </div>
                            </div>
                            <div class="row" v-if="!isCurrentPageComposer">
                                <div class="col-6 pl-md-0 pl-lg-0 pl-xl-0">
                                    <base-button type="default"
                                                 class="px-1"
                                                 :class="{'pointer': canFormBeSubmittedIgnoreTime()}"
                                                 @click="saveAsADraft"
                                                 style="width: 100%;"
                                                 :disabled="!canFormBeSubmittedIgnoreTime()">
                                        <div>
                                            <span>Save as a draft</span>
                                        </div>
                                    </base-button>
                                </div>
                                <div class="col-6 pr-md-0 pr-lg-0 pr-xl-0">
                                    <div class="btn-group w-100">
                                        <base-button v-if="!isCurrentPageComposer"
                                                     type="primary"
                                                     class="px-1"
                                                     :class="{'pointer': canFormBeSubmitted()}"
                                                     @click="timeFromParent ? scheduleThread(false) : addToQueue()"
                                                     style="width: 100%;"
                                                     :disabled="!canFormBeSubmitted()">
                                            <span v-if="isSpecificTimeLocal">Schedule</span>
                                            <span v-else>Add to queue</span>
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
                                               href="javascript:;">Post now</a>
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
  import moment from 'moment';
  import 'moment-timezone';
  import swal from 'sweetalert2';
  import { mapState } from 'vuex';
  import '@/assets/css/highlight-within-textarea.css';
  import '@/assets/sass/custom/thread-mixin.scss';
  import {Thread} from "../../models/Thread";
  import {DraftThread} from "../../models/DraftThread";
  import CustomerStatusMixin from "@/views/Mixins/CustomerStatusMixin";
  import ThreadMixin from "../Mixins/ThreadMixin";
  import { setUnfinishedPost, getUnfinishedPost, removeUnfinishedPost } from '@/util/unfinishedPosts';
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
      isSpecificTime: Boolean,
      show: Boolean,
      timeFromParent: {
        type: Object,
      },
      isCurrentPageComposer: {
        type: Boolean,
        default: false,
      },
      schedule: {
        type: Object,
      },
    },
    watch: {
      isSpecificTime: function (val) {
        this.isSpecificTimeLocal = val;
      },
      time: function (val) {
        const time = moment.tz(val, this.userProfile.timezone);
        this.isSpecificTimeLocal = time.diff(this.timeFromParent) !== 0;
      },
      timeFromParent: function (val) {
        if (!val) return;
        this.time = this.formatTimeForInput(val);
        this.focusOnLastTweetBox(this);
        const that = this;
        setTimeout(function () {that.$emit('new-thread-modal-mounted')}, 1000);
      },
      show: function (show) {
        if (!show) return;
        this.setTime();
        this.focusOnLastTweetBox()
      },
    },
    methods: {
      addToQueue() {
        const time = this.schedule.getNextTimeSlot();
        const thread = Thread.newThread(
          time,
          this.tweets,
          fb.usersCollection.doc(this.currentUser.uid),
          this.isFavorite,
        );
        return this.prepareThreadForSaving(thread, false)
          .then(thread => {
            this.$emit('scroll-to-thread', thread.id);
          });
      },
      canFormBeSubmitted() {
        const tweetsOver280Chars = this.tweets.filter(t => this.tweetLength(t.status) > 280);
        return tweetsOver280Chars.length === 0 && !this.submitting && this.isTimeValid() &&
          this.tweets.filter(t => t.status === '' && t.media === null).length === 0;
      },
      canFormBeSubmittedIgnoreTime() {
        const tweetsOver280Chars = this.tweets.filter(t => this.tweetLength(t.status) > 280);
        return tweetsOver280Chars.length === 0 && !this.submitting &&
          this.tweets.filter(t => t.status === '' && t.media === null).length === 0;
      },
      close() {
        ThreadMixin.methods.close.bind(this)();
        this.showTimeBox = false;
      },
      postNow() {
        const postNow = true;
        this.scheduleThread(postNow);
      },
      resetModal() {
        Object.assign(this.$data, this.initialState());
      },
      initialState() {
        return {
          time: null,
          tweets: getUnfinishedPost() ? getUnfinishedPost().tweets : [this.emptyTweet(0)],
          files: {},
          isSpecificTimeLocal: null,
          submitting: false,
          timezone: null,
          shortTimezone: null,
          isFavorite: getUnfinishedPost() ? getUnfinishedPost().isFavorite : false,
        };
      },
      scheduleThread: function (postNow) {
        const thread = Thread.newThread(
          moment.tz(this.time, this.userProfile.timezone).toDate(),
          this.tweets,
          fb.usersCollection.doc(this.currentUser.uid),
          this.isFavorite,
          postNow,
        );
        return this.prepareThreadForSaving(thread, false);
      },
      saveAsADraft: function () {
        const thread = new DraftThread(
          false,
          this.tweets,
          fb.usersCollection.doc(this.currentUser.uid),
          this.isFavorite,
        );
        return this.prepareThreadForSaving(thread, true);
      },
      prepareThreadForSaving(thread, saveAsADraft) {
        const canFormBeSubmitted = !saveAsADraft && !this.canFormBeSubmitted() || saveAsADraft && !this.canFormBeSubmittedIgnoreTime();
        if (canFormBeSubmitted) return;
        this.submitting = true;
        return this.postThread(thread, this);
      },
      postThread: (thread, that) => {
        const uploadMedia = () => Promise.all(thread.tweets.map(tweet => {
          return that.uploadMedia(tweet, tweet => tweet.media);
        }));

        return uploadMedia()
          .then(tweets => {
            thread.tweets = tweets;
            return saveThread(thread);
          })
          .catch(error => {
            console.error(error);
            alert('An error has occurred while uploading the media.')
          });

        function saveThread(thread) {
          removeUnfinishedPost();
          return thread.saveToFirestore(that.userProfile.timezone)
            .then(result => {
              that.close();
              const threadOrTweet = thread.tweets.length > 1 ? 'Thread' : 'Tweet';
              const message = thread.postNow ?
                threadOrTweet + ' on its way!' :
                (thread instanceof DraftThread) ?
                  'Draft saved.' :
                  threadOrTweet + ' successfully scheduled!';
              that.$notify({type: 'success', message });

              thread.id = result.id;

              that.$emit('reopen-new-thread-modal', that.time);

              that.resetModal();

              return thread;
            })
            .catch(error => {
              console.error(error);
              alert('An error has occurred while saving the thread.')
            });
        }
      },
      triggerFileUpload: function (tweetIndex) {
        if (!this.$refs.uploadBtn[tweetIndex]) return;
        this.$refs.uploadBtn[tweetIndex].click();
      },
      // TODO: This is duplicated in NewThreadModal
      filesChange: function (tweet, file, event) {
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

        if (event) this.resetFile(event);
        this.$forceUpdate();
      },
      toggleFavorite() {
        this.isFavorite = !this.isFavorite;
      },
      setTime: function() {
        this.shortTimezone = moment().tz(this.userProfile.timezone).format('z');
        // Done here instead of in data() because this.userProfile.timezone is needed
        this.time = this.timeFromParent ? this.formatTimeForInput(this.timeFromParent) : this.now();
      },
      onInputChange() {
        setUnfinishedPost(this.tweets, this.isFavorite);
      },
      adjustModalHeight() {
        const tweetRef = this.$refs.tweet;
        tweetRef.map(tweet => {
          tweet.style.height = '';
          tweet.style.height = tweet.scrollHeight + 'px';
        })
      },
    },
    mounted() {
      this.setTime();
      this.focusOnLastTweetBox();
      this.initOverflowHighlighting(this.$refs.tweet[0]);
    },
    updated() {
      this.adjustModalHeight();
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
    mixins: [CustomerStatusMixin, ThreadMixin],
  }
</script>

<style type="scss">
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
    .pointer {
      cursor: pointer;
    }
    video {
        width: 100%;
        height: 100%;
    }
    .time-picker {
        max-width: 300px;
    }
    .overlay {
      position: absolute;
      width: 100%;
      top: 0;
      left: 0;
      height: 100%;
      z-index: 2000 !important;
      display: flex;
      align-items: center;
      background-color: rgb(155, 155, 154, 0.4);
    }
    .short-timezone {
        pointer-events: none;
    }
    .modal-body {
        overflow: visible !important;
    }
    .modal-content {
        overflow: visible !important;
    }
    .post-now-link {
        font-weight: bold;
        font-size: 0.9em;
    }
</style>
