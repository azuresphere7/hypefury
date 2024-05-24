<template>
    <modal :show="show"
           @close="close"
           body-classes="p-0"
           modal-classes="modal-dialog-centered modal-md">
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
                    <div class="row">
                        <div class="col-12">
                            <base-input ref="link"
                                        :error="error"
                                        v-model="link"
                                        class="mb-0 mb-sm-3 mb-md-3 mb-lg-3 mb-xl-3"
                                        placeholder="Tweet link or tweet ID"></base-input>
                        </div>
                    </div>

                    <SlideYDownTransition>
                        <div v-if="originalTweetInfo">
                        <div class="row">
                            <div class="col-12">
                                <card type="frame" class="mb-3">
                                    <div class="row mb-3" v-if="originalTweetInfo">
                                        <div class="col-auto">
                                            <a :href="'https://twitter.com/' + originalTweetInfo.username"
                                               target="_blank"
                                               class="avatar avatar-md rounded-circle">
                                                <img :alt="originalTweetInfo.userDisplayName + '\'s profile picture'"
                                                     :src="originalTweetInfo.userProfilePictureURL">
                                            </a>
                                        </div>
                                        <div class="col-auto">
                                            Posted by
                                            <h4 class="mb-0">
                                                <a :href="'https://twitter.com/' + originalTweetInfo.username"
                                                   target="_blank">
                                                    {{ originalTweetInfo.userDisplayName }}
                                                </a>
                                            </h4>
                                        </div>
                                    </div>
                                    <p class="mb-0">
                                        <div style="white-space: pre-wrap;">{{ originalTweetInfo.text }}</div>
                                    </p>
                                </card>
                            </div>
                        </div>

                        <div v-if="shouldNotTheSameUserWarningBeDisplayed(originalTweetInfo)"
                             class="text-white row">
                            <div class="col-12">
                                <card class="bg-warning mb-3" bodyClasses="p-3">
                                    Only the Premium plan permits that you schedule retweets of other users.<br>
                                    You can schedule this retweet but it won't be published unless you upgrade
                                    your subscription to the Premium plan.
                                </card>
                            </div>
                        </div>
                        </div>
                    </SlideYDownTransition>

                    <div class="row">
                        <div v-if="timeFromParent" class="col-lg-7 col-xl-7 col-12 col-sm-7 col-md-7
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

                                <div class="mt--1 mb--2" v-if="showTimeBox">
                                    <div class="row">
                                        <div class="time-picker col-10 col-xs-10 col-sm-10 col-md-10 col-lg-11 col-xl-11">
                                            <base-input type="datetime-local"
                                                        :min="getMinDateForDateInput()"
                                                        v-model="time"
                                                        :error="getTimeError()"
                                                        :valid="isTimeValid()"
                                                        successMessage=""
                                                        @keyup.ctrl.enter="scheduleRetweet()"
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

                        <hr class="d-lg-none d-xl-none d-md-none d-sm-none"/>

                        <div class="d-xl-none d-lg-none col-6 d-sm-none d-md-none"></div>
                        <div class="col-lg-5 col-xl-5 col-6 col-sm-5 col-md-5
                                    container-fluid
                                    text-right">
                            <div class="row">
                                <div class="col-2 px-0"></div>
                                <div class="col-9 px-0 pr-md-0 pr-lg-0 pr-xl-0">
                                    <base-button type="primary"
                                                 class="px-1"
                                                 size="sm"
                                                 :class="{'pointer': !canFormBeSubmitted}"
                                                 @click="scheduleRetweet()"
                                                 style="width: 100%;"
                                                 :loading="loading"
                                                 :disabled="!canFormBeSubmitted()">
                                        <span v-if="isSpecificTimeLocal">Schedule</span>
                                        <span v-else>Add to queue</span>
                                    </base-button>
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
  import {SlideYDownTransition} from 'vue2-transitions';
  import { mapState } from 'vuex';
  import {getTweet} from '@/controller';
  import RetweetMixin from "../Mixins/RetweetMixin";
  import ThreadMixin from "@/views/Mixins/ThreadMixin";
  import {Retweet} from '@/models/Retweet';

  export default {
    components: {
      HalfCircleSpinner,
      SlideYDownTransition,
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
    data () {
      return this.initialState();
    },
    methods: {
      canFormBeSubmitted() {
        return this.isFormValid && !this.submitting && this.isTimeValid() && this.link;
      },
      close() {
        Object.assign(this.$data, this.initialState());
        this.$emit('close');
      },
      getLinkFromTheClipboard() {
        navigator.clipboard.readText()
          .then(text => {
            const {link, isValid, error} = this.validateLink(text);

            if (!isValid) throw new Error(error);

            this.$nextTick(() => {
              this.link = link;
            });
          })
          .catch(error => {
            console.log('Error while fetching the link from the clipboard.', error);
          });
      },
      initialState() {
        return {
          error: null,
          link: null,
          loading: false,
          isSpecificTimeLocal: null,
          originalTweetInfo: null,
          shortTimezone: null,
          showTimeBox: false,
          submitting: false,
          time: null,
          tweet: null,
          isFormValid: false,
        };
      },
      resetModal() {
        Object.assign(this.$data, this.initialState());
      },
      scheduleRetweet: function () {
        if (!this.canFormBeSubmitted()) return;
        this.submitting = true;
        const tweetId = this.tweet.id_str;
        const time = moment.tz(this.time, this.userProfile.timezone);
        const retweet = Retweet.newRetweet(tweetId, time, this.currentUser, this.originalTweetInfo);
        retweet.saveToFirestore(this.currentUser)
          .then(() => {
            this.submitting = false;
            this.close();
            this.resetModal();
            this.$notify({type: 'success', message: 'Retweet successfully scheduled!' });
          })
          .catch(error => {
            swal('Could not schedule this retweet.', '', 'error');
          });
      },
      setTime: function() {
        this.shortTimezone = moment().tz(this.userProfile.timezone).format('z');
        // Done here instead of in data() because this.userProfile.timezone is needed
        this.time = this.formatTimeForInput(this.timeFromParent);
      },
      validateLink(s) {
        if (s.match(/\d{19}/)) {
          const tweetId = () => {
            const split = s.split('/');
            return split[split.length - 1];
          };
          return { link: s, tweetId: tweetId(), isValid: true, error: '' };
        } else {
          return { link: null, isValid: false, error: 'Not a valid tweet link or tweet ID.' }
        }
      },
    },
    mixins: [RetweetMixin, ThreadMixin],
    mounted() {
    },
    name: 'retweet-modal',
    props: {
      show: Boolean,
      timeFromParent: {
        type: Object,
      },
    },
    watch: {
      link: function (val) {
        this.tweet = null;
        this.isFormValid = false;
        this.error = null;
        this.loading = false;

        if (!val) return;

        const {_, tweetId, isValid, error} = this.validateLink(val);

        if (!isValid) {
          this.error = error;
          return;
        }

        this.loading = true;

        getTweet(tweetId, this.currentUser, this.userProfile)
          .then(result => {
            const linkHasChangedMeanwhile = this.link !== val;
            if (linkHasChangedMeanwhile) return;

            this.tweet = result.data;
            this.originalTweetInfo = {
              username: this.tweet.user.screen_name,
              userDisplayName: this.tweet.user.name,
              userProfilePictureURL: this.tweet.user.profile_image_url_https,
              userTwitterId: this.userProfile.twitterId,
              text: this.tweet.full_text,
            };
            this.isFormValid = true;
            this.loading = false;
          })
          .catch(error => {
            const linkHasChangedMeanwhile = this.link !== val;
            if (linkHasChangedMeanwhile) return;

            this.loading = false;

            if (error.response.status === 404) {
              this.error = 'Tweet not found';
            } else {
              console.error(error);

              // We don't want this failure to be blocking for the user
              this.isFormValid = true;
            }
          });
      },
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
      },
      show: function (show) {
        if (!show) return;
        this.setTime();
        this.$nextTick(() => {
          this.$refs.link.$el.firstElementChild.firstElementChild.focus();
        });
        this.getLinkFromTheClipboard();
      },
    },
  }
</script>

<style scoped>
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
</style>
