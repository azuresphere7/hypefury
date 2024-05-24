import {UserProfile} from "./models/UserProfile";
import Vue from 'vue';
import Vuex from 'vuex';
const fb =  require('./firebase');

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    currentUser: null,
    userProfile: {},
  },
  mutations: {
    setCurrentUser (state, val) {
      state.currentUser = val;
    },
    setUserProfile (state, val) {
      state.userProfile = val;
    },
  },
  getters: {
    getUserProfile (state) {
      return state.userProfile;
    }
  },
  actions: {
    fetchUserProfile({ commit, state }) {
      return new Promise((resolve, reject) => {
        fb.usersCollection.doc(state.currentUser.uid).onSnapshot(doc => {
          const userExists = doc.data();
          if (!userExists) return;
          resolve(store.commit('setUserProfile', new UserProfile(doc.data())));
        }, (err) => {
          reject(err);
        });
      });
    },
  },
});
