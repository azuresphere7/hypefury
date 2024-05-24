import 'firebase/auth';
import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from './routes';
const fb =  require('../firebase');

Vue.use(VueRouter);

function beforeEach(requiresAuth, currentUser, to, store) {
  const isHypefurySetup = () => {
    return store.getters.getUserProfile ?
      store.getters.getUserProfile.timezone && store.getters.getUserProfile.email :
      null;
  };
  if (requiresAuth && to.path !== '/setup' && currentUser && !isHypefurySetup()) {
    return '/setup';
  }
  if (requiresAuth && to.path === '/setup' && currentUser && isHypefurySetup()) {
    return '/';
  }
  if (currentUser && to.path === '/login') {
    return '/';
  }
  if (requiresAuth && !currentUser) {
    return '/login';
  }
  return undefined;
}

function router(store) {
  const router = new VueRouter({
    mode: 'history',
    routes: routes(store),
    linkActiveClass: 'active',
    scrollBehavior: (to, from ,savedPosition) => {
      if (savedPosition) {
        return savedPosition;
      }
      if (to.hash) {
        return { selector: to.hash };
      }
      return { x: 0, y: 0 };
    }
  });

  router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(x => x.meta.requiresAuth);
    const currentUser = fb.auth.currentUser;
    return next(beforeEach(requiresAuth, currentUser, to, store));
  });

  return router;
}

export { router, beforeEach };
