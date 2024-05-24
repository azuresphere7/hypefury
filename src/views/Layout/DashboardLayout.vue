<template>
  <div class="wrapper">
    <notifications></notifications>
    <side-bar>
      <template slot="links">
        <sidebar-item
                :link="{
            name: 'Queue',
            icon: 'ni ni-send text-primary',
            path: '/queue'
          }">
        </sidebar-item>
        <sidebar-item
                :link="{
            name: 'Evergreen Posts',
            icon: 'fa fa-infinity text-primary',
            path: '/evergreen-posts'
          }">
        </sidebar-item>
        <sidebar-item
                :link="{
            name: 'Composer',
            icon: 'fas fa-align-left text-primary',
            path: '/composer'
          }">
        </sidebar-item>
        <sidebar-item
                :link="{
            name: 'History',
            icon: 'fas fa-history text-primary',
            path: '/history'
          }">
        </sidebar-item>
      </template>

      <ul class="navbar-nav mt-auto" slot="links-after">
        <li class="nav-item">
          <a href="/school" class="nav-link">
            <i class="fa fa-book-open text-primary"></i>
            <span class="nav-link-text">Hypefury School</span>
          </a>
        </li>
        <li class="nav-item">
          <a @click="openFeatureRequestModal" href="javascript:;" class="nav-link">
            <i class="fa fa-lightbulb text-primary"></i>
            <span class="nav-link-text">Request a feature</span>
          </a>
        </li>
      </ul>
    </side-bar>
    <div class="main-content">
      <dashboard-navbar :type="$route.meta.navbarType"></dashboard-navbar>

      <base-header class="pb-4 pb-sm-5 pb-md-5 pb-lg-5 pb-xl-5 bg-gradient-primary" type="default">
        <div class="row align-items-center py-3 py-sm-4 py-md-4 py-lg-4 py-xl-4">
          <div class="col-lg-6 col-7">
            <h6 class="h1 text-white d-inline-block mb-0">{{$route.name}}</h6>
          </div>
        </div>
      </base-header>

      <div @click="$sidebar.displaySidebar(false)">
        <fade-transition :duration="200" origin="center top" mode="out-in">
          <!-- your content here -->
          <router-view></router-view>
        </fade-transition>
      </div>
      <!--<content-footer v-if="!$route.meta.hideFooter"></content-footer>-->
    </div>
  </div>
</template>
<script>
  /* eslint-disable no-new */
  import PerfectScrollbar from 'perfect-scrollbar';
  import 'perfect-scrollbar/css/perfect-scrollbar.css';

  function hasElement(className) {
    return document.getElementsByClassName(className).length > 0;
  }

  function initScrollbar(className) {
    if (hasElement(className)) {
      new PerfectScrollbar(`.${className}`);
    } else {
      // try to init it later in case this component is loaded async
      setTimeout(() => {
        initScrollbar(className);
      }, 100);
    }
  }

  import DashboardNavbar from './DashboardNavbar.vue';
  import ContentFooter from './ContentFooter.vue';
  import DashboardContent from './Content.vue';
  import { FadeTransition } from 'vue2-transitions';

  export default {
    components: {
      DashboardNavbar,
      ContentFooter,
      DashboardContent,
      FadeTransition
    },
    methods: {
      initScrollbar() {
        let isWindows = navigator.platform.startsWith('Win');
        if (isWindows) {
          initScrollbar('scrollbar-inner');
        }
      },
      openFeatureRequestModal() {
        window.Acute('openModal');
      },
    },
    mounted() {
      this.initScrollbar()
    },
  };
</script>
<style lang="scss">
  .navbar-inner {
    height: calc(100% - 78px);
  }
</style>
