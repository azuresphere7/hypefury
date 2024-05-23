import App from './App.vue';
import DashboardPlugin from './plugins/dashboard-plugin';
import initServerWorker from './server-worker-settings';
import { router as routerBuilder } from './routes/router';
import { store } from './store';
import 'sweetalert2/dist/sweetalert2.css'
import Vue from 'vue';
import BackToTop from 'vue-backtotop';
import LoadScript from 'vue-plugin-load-script';

import fetchFirebaseConfig from './firebase';

fetchFirebaseConfig.then(firebaseConfig => {
const config =  require('./config').build(firebaseConfig);

Vue.use(BackToTop);
Vue.use(DashboardPlugin);
Vue.use(LoadScript);

const router = routerBuilder(store);

let app;
const initApp = () => {
  if (config.prod) {
  }

  if (app) return;

  app = new Vue({
    el: '#app',
    render: h => h(App),
    store,
    router,
    created: function () {
      initServerWorker(config.prod, this);
    },
  });
};

firebaseConfig.auth.onAuthStateChanged(user => {
  if (user) {
    store.commit('setCurrentUser', user);
    store.dispatch('fetchUserProfile').then(() => {
      initApp();
    });
  } else {
    initApp();
  }
});
});
