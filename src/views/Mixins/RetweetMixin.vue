<template>
</template>

<script>
  import {mapState} from 'vuex';
  import {canRetweetBeMade} from "@/util/canRetweetBeMade";

  export default {
    computed: {
      ...mapState(['userProfile', 'currentUser']),
    },
    methods: {
      shouldNotTheSameUserWarningBeDisplayed(originalTweetInfo) {
        return !canRetweetBeMade(originalTweetInfo, this.userProfile);
      },
    },
    name: 'retweet-mixin',
  }
</script>

<style scoped>

</style>
