<template>
  <base-nav
    container-classes="container-fluid"
    class="navbar-top bg-gradient-primary border-bottom navbar-expand"
    :class="{'bg-default navbar-dark': type === 'default'}"
  >
    <ul class="navbar-nav">
      <li class="nav-item d-xl-none">
        <!-- Sidenav toggler -->
        <div class="pr-3 sidenav-toggler"
             :class="{active: $sidebar.showSidebar, 'sidenav-toggler-dark': type === 'default', 'sidenav-toggler-light': type === 'light'}"
             @click="toggleSidebar">
          <div class="sidenav-toggler-inner sidenav-toggler-inner-small-screens">
            <i class="sidenav-toggler-line"></i>
            <i class="sidenav-toggler-line"></i>
            <i class="sidenav-toggler-line"></i>
          </div>
        </div>
      </li>
    </ul>

    <div class="mx-auto">
      <trial-progress :user="userProfile" />
    </div>

    <ul class="navbar-nav user-menu">
      <base-dropdown menu-on-right
                     class="nav-item"
                     tag="li"
                     title-tag="a"
                     title-classes="nav-link pr-0">
        <a href="#" class="nav-link pr-0" @click.prevent slot="title-container">
          <div class="media align-items-center">
                  <span class="avatar avatar-sm rounded-circle">
                    <img alt="Image placeholder" :src="userProfile.photoURL">
                  </span>
            <div class="media-body ml-2 d-none d-md-block">
              <span class="mb-0 text-sm font-weight-bold">{{ userProfile.username }}</span>
            </div>
          </div>
        </a>

        <template>
          <div class="dropdown-header noti-title">
            <h6 class="text-overflow m-0">Welcome!</h6>
          </div>
          <router-link to="/settings" class="dropdown-item">
            <i class="ni ni-settings"></i>
            <span>Settings</span>
          </router-link>
          <div class="dropdown-divider"></div>
          <a href="" @click="logout" class="dropdown-item">
            <i class="ni ni-user-run"></i>
            <span>Logout</span>
          </a>
        </template>
      </base-dropdown>
    </ul>
  </base-nav>
</template>
<script>
import firebase from 'firebase/app';
import 'firebase/auth';
import { mapState } from 'vuex';
import { BaseNav } from '@/components';
import TrialProgress from '@/components/TrialProgress';

export default {
  components: {
    BaseNav,
    TrialProgress,
  },
  props: {
    type: {
      type: String,
      default: 'default', // default|light
      description: 'Look of the dashboard navbar. Default (Green) or light (gray)'
    },
  },
  computed: {
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
    ...mapState(['userProfile', 'currentUser']),
  },
  data() {
    return {
    };
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toggleSidebar() {
      this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
    },
    logout() {
      firebase.auth().signOut().then(() => {
        localStorage.clear();
      });
    },
  }
};
</script>

<style lang="scss">
  .user-menu {
    @media (min-width: 720px) {
      position: absolute;
      right: 30px;
    }
  }
</style>
