<template>
    <div v-if="!subscriptionTierName" class="container-fluid trial-progress mx-auto">
        <div class="row justify-content-center">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <div class="">
                        <div>
                            <base-progress show-label
                                           animated
                                           type="info"
                                           :height="8"
                                           :value="progress.daysLeft"
                                           valueClasses="text-white"
                                           :percentage="String(progress.percentage)"
                                           width="100"
                                           :unit="progress.daysLeft === 1 ? ' day left' : ' days left'"
                                           :forTrialPeriod="true"
                                           label="Trial period"
                                           labelClasses="text-white"></base-progress>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div v-if="!isBillingPage" class="row justify-content-center mt--1">
            <base-button class=""
                         tag="a"
                         href="/billing"
                         size="sm"
                         type="danger">Join now</base-button>
        </div>
    </div>
</template>

<script>
  import moment from 'moment';
  import {mapState} from 'vuex';
  import BaseProgress from '@/components/BaseProgress';
  import {trialPeriodCalculator} from '@/util/trialPeriodCalculator';

  export default {
    name: "trial-progress",
    props: {
      now: {
        type: Object,
        default: () => moment(),
      },
    },
    data() {
      return {
        complete: false,
        percentage: 0,
        show: false,
        elements: null,
      };
    },
    computed: {
      ...mapState(['userProfile', 'currentUser']),
      isBillingPage() {
        return this.$route.meta.id === 'billing';
      },
      progress() {
        return trialPeriodCalculator(this.userProfile);
      },
      subscriptionTierName() {
        return this.userProfile.subscriptionTierName;
      }
    },
    created() {
    },
    mounted() {
    },
    methods: {
      closeModal: function () {
        this.show = false;
      },
    },
    components: {
      BaseProgress,
    }
  }
</script>

<style>
    .progress-percentage span {
        padding: 0 1em !important;
    }
</style>
