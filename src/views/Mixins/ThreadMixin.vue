<template>
    <div></div>
</template>

<script>
  import {clone, isNil} from 'lodash';
  import moment from 'moment';
  import twitterText from 'twitter-text';
  import {v1 as uuidv1} from 'uuid';
  import {getSelectionText} from "@/util/getSelectionText";
  import HighlightWithinTextarea from '@/util/highlightWithinTextarea';
  import {splitTextIntoTweets} from '@/util/splitTextIntoTweets';
  const fb = require('../../firebase');

  export default {
    data() {
      return {
        isPostDropdownOpen: false,
        lastFocusedTweetBoxCount: null,
        showTimeBox: false,
      };
    },
    methods: {
      addTweetBox: function (tweet) {
        const tweets = clone(this.tweets);
        const position = tweet.count + 1;
        for (let i = tweets.length - 1; i >= position; i--) {
          tweets[i + 1] = tweets[i];
          tweets[i + 1].count++;
        }
        tweets[position] = this.emptyTweet(position);
        this.tweets = tweets;
        this.focusOnTweetBox(position); // This is pretty much useless because the focus will break
                                        // after the overflow highlighting elements are rebuilt
        this.lastFocusedTweetBoxCount = position;

        this.refreshOverflowHighlighting();
      },
      charactersLeftClass: function (tweet) {
        if (this.tweetLength(tweet.status) >= 280) return 'bg-danger';
        if (this.tweetLength(tweet.status) > 260) return 'characters-counter-warning';
        return 'bg-secondary';
      },
      charactersLeftCounter: function (tweet) {
        return this.tweetLength(tweet.status);
      },
      clearMediaSelection(tweet) {
        tweet.mediaFile = null;
        tweet.media = null;
        this.$forceUpdate();
      },
      close() {
        this.$emit('close');
      },
      closeDropDown() {
        this.isPostDropdownOpen = false;
      },
      emptyTweet(count) {
        return {
          status: '',
          count: count,
          media: null,
          mediaFile: null,
          published: false,
        };
      },
      formatTimeForDisplay(time) {
        return time.format('MMM DD, HH:mm A');
      },
      showAddBtn(tweet) {
        return this.tweets[tweet.count].media || this.tweets[tweet.count].status !== '';
      },
      getMinDateForDateInput () {
        return moment().format('YYYY-MM-DDTHH:mm');
      },
      deleteTweet(tweet) {
        let counter = 0;
        this.tweets = this.tweets
          .filter(t => t.count !== tweet.count)
          .map(t  => {
            t.count = counter++;
            return t;
          });
      },
      focusOnLastTweetBox: function () {
        this.focusOnTweetBox(this.$refs.tweet.length - 1);
      },
      focusOnTweetBox: function (position) {
        this.$nextTick(function () {
          this.$refs.tweet[position].focus();
        });
      },
      formatTimeForInput(time) {
        return time.format('YYYY-MM-DDTHH:mm:ss');
      },
      getDiffBetweenLocalTZAndOtherTZ: function (tz1) {
        const now = moment();
        const localOffset = now.utcOffset();
        now.tz(tz1);
        const otherOffset = now.utcOffset();
        return localOffset - otherOffset;
      },
      getTimeError() {
        switch (this.getTimeStatus()) {
          case 'invalid': return 'Invalid date';
          case 'past': return 'The selected date is in the past';
          default: return '';
        }
      },
      getTimeStatus() {
        const chosenTime = moment(this.time);
        if (!chosenTime._isValid) {
          return 'invalid';
        }

        const minutesDifference = this.getDiffBetweenLocalTZAndOtherTZ(this.userProfile.timezone);
        chosenTime.add(minutesDifference, 'minute');

        const now = moment().add(minutesDifference, 'minutes');
        now.set({ second:0, millisecond:0 });
        const diff = chosenTime.diff(now, 'minutes');
        if (diff + minutesDifference <= 0 || (diff + minutesDifference === 0 && chosenTime.minutes() === now.minutes())) {
          return 'past';
        }

        return 'valid';
      },
      initOverflowHighlighting(element) {
        this.$nextTick(function () {
          new HighlightWithinTextarea(element, {
            highlight: s => {
              let overflowingText = '';
              const diff = this.tweetLength(s) - 280;
              for (let i = s.length - diff; i < s.length; i++) {
                overflowingText += s[i];
              }
              return new RegExp(`${overflowingText}$`);
            },
          });
        });
      },
      isTimeValid() {
        switch (this.getTimeStatus()) {
          case 'valid': return true;
          default: return false;
        }
      },
      now: function () {
        return this.formatTimeForInput(moment().add(10, 'minute').startOf('minute').tz(this.userProfile.timezone));
      },
      onPaste (event) {
        if (!this.userProfile.settings.shouldSplitLongText) {
          return;
        }

        const clipboardData = event.clipboardData.getData('text');
        const targetTweetIndex = parseInt(event.target.dataset.tweetCount);
        const targetTweet = this.tweets[targetTweetIndex].status;
        const selectedText = getSelectionText();
        let text;
        if (!selectedText) {
          text = targetTweet + clipboardData;
        } else {
          const splitTargetTweet = targetTweet.split(selectedText);
          const canSplit = splitTargetTweet.length === 2;
          if (canSplit) {
            text = splitTargetTweet[0] + clipboardData + splitTargetTweet[1];
          } else {
            this.$notify({
              type: 'warning',
              message: 'Sorry, I am not smart enough to split this long text. :(\n' +
                'Please paste it again in a different tweet box.'});
            return;
          }
        }

        if (text.length < 280) {
          return;
        }

        event.preventDefault();

        const tweetsAfterCurrent = [];
        if (targetTweetIndex < this.tweets.length - 1) {
          tweetsAfterCurrent.push(...this.tweets.splice(targetTweetIndex + 1, this.tweets.length));
        }

        const statuses = splitTextIntoTweets(text);

        let positionOfTheLastPastedTweet = 0;

        this.tweets[targetTweetIndex].status = statuses[0];
        for (let i = 1; i < statuses.length; i++) {
          const newTweet = this.emptyTweet(this.tweets.length);
          newTweet.status = statuses[i];
          this.tweets.push(newTweet);
          positionOfTheLastPastedTweet = this.tweets.length - 1;
        }

        tweetsAfterCurrent.forEach(t => {
          t.count = this.tweets.length;
          this.tweets.push(t);
        });

        this.$nextTick(function () {
          this.$refs.tweet.map(box => {
            box.style.height = box.scrollHeight + 'px';
          });
          this.$refs.tweet[positionOfTheLastPastedTweet].focus();
        });

        this.$forceUpdate();
      },
      getMediaType(contentType) {
        return contentType.includes('image') ? 'image' : 'video';
      },
      refreshOverflowHighlighting() {
        this.$nextTick(function () {
          const elements = this.$refs['textarea-container']
            .map(ref => {
              return {
                container: ref.$el.querySelector('.textarea-container'),
                textarea: ref.$el.querySelector('textarea'),
              }
            })
            .filter(info => !isNil(info.container) && !isNil(info.textarea));

          Array.from(elements).forEach(({container, textarea}) => {
            container.removeChild(container.firstChild);
            container.prepend(textarea);
          });

          this.tweets.forEach((tweet, i) => {
            this.initOverflowHighlighting(this.$refs.tweet[i]);
          });

          if (this.lastFocusedTweetBoxCount) this.focusOnTweetBox(this.lastFocusedTweetBoxCount);
        });
      },
      resetFile(event) {
        // This is so every file selection is considered a change, even if the file is the same one
        // Because we want the checks below to run of every file change
        event.target.value = '';
      },
      statusPlaceholder(tweet) {
        const firstTweetPlaceholder = (Math.random() >= 0.5) ?
          'Tip: paste a long text and it will be turned into a thread!' :
          'What would you like to share?';
        if (tweet.count === 0) return firstTweetPlaceholder;
        else return "Tweet " + (tweet.count + 1);
      },
      toggleTimeBox: function () {
        this.showTimeBox = true;
      },
      tweetLength: function (status) {
        return twitterText.parseTweet(status).weightedLength;
      },
      uploadMedia(tweet, processingCondition) {
        if (!processingCondition(tweet)) {
          return new Promise((resolve) => resolve(tweet));
        }

        const newName = uuidv1();
        const mediaRef = fb.storageRoot.child(newName);

        const file = new File([this.files[tweet.media]],
          newName,
          { type: this.files[tweet.media].type });

        return mediaRef.put(file).then(r => {
          tweet.media = [{
            name: r.metadata.name,
            type: r.metadata.contentType,
          }];
          return tweet;
        })
      },
      updateFilesForTweet(tweet, file) {
        this.files[file.name] = file;
        tweet.media = file.name;
        tweet.mediaFile = { url: URL.createObjectURL(file), type: this.getMediaType(file.type) };
      },
      uploadSectionDragLeave(tweet, $event) {
        $event.preventDefault();
        this.$refs['upload-container'][0].classList.remove('bg-secondary');
        this.$refs['upload-container'][0].classList.add('bg-white');
      },
      uploadSectionDragOver(tweet, $event) {
        $event.preventDefault();
        this.$refs['upload-container'][0].classList.add('bg-secondary');
        this.$refs['upload-container'][0].classList.remove('bg-white');
      },
      uploadSectionDrop(tweet, $event) {
        $event.preventDefault();
        const file = $event.dataTransfer.files[0];
        this.uploadSectionDragLeave(tweet, $event);
        this.filesChange(tweet, file);
      },
    },
    name: 'thread-mixin',
  }
</script>

<style type="scss">
    .tweets-counter {
        cursor: default !important;
        text-decoration: none;
        box-shadow: none;
        transform: none;
        margin-top: 1px;
    }
    .characters-counter {
        cursor: default !important;
        text-decoration: none;
        box-shadow: none;
        margin-top: 1px;
        transform: none;
    }
    .characters-counter-warning {
        background-color: orange;
    }
    .tweet-info-box {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
    }
    .el-tooltip__popper {
      position: absolute;
      border-radius: 4px;
      padding: 10px;
      z-index: 2000;
      font-size: 12px;
      line-height: 1.2;
      min-width: 10px;
      word-wrap: break-word;
    }
    .el-tooltip__popper.is-dark {
      background-color: #303133;
      color: white;
    }
</style>
