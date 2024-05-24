<template>
    <div class="col-3 image-container text-center" v-if="tweet.media && tweet.media[0]">
        <div v-if="tweet.media[0].type.includes('video')">
            <video disabledRemotePlayback>
                <source :src="buildStorageMediaURL(tweet.media[0].name)">
            </video>
        </div>
        <div v-else>
            <img class="media-thumbnail" :src="buildStorageMediaURL(tweet.media[0].name)" />
        </div>
    </div>
</template>

<script>
  const config = require('@/config');

  export default {
    data() {
      return {
        buildStorageMediaURL: config.buildStorageMediaURL,
      };
    },
    name: "queue-thumbnail",
    props: {
      tweet: Object,
    }
  }
</script>

<style scoped>
    .image-container img {
        max-width: 100%;
    }
    video {
        width: 100%;
    }
    video::-internal-media-controls-overlay-cast-button {
        display: none;
    }
    .media-thumbnail {
        border-radius: 4px;
    }
</style>
