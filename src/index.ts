import Vue from "vue";
import VueRouter from 'vue-router';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import * as firebase from "firebase/app";
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

import { Duration, DateTime } from "luxon"
import { BubiData } from "./model";
import StatPage from "./StatPage.vue";
import InfoPage from "./InfoPage.vue";
import PrivacyPage from "./Privacy.vue";
import BubiRides from "./BubiRides.vue";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyBxbbNWjnS-2Cq1t9qGe5Fb8tb8_sG4bo0",
  authDomain: "bubistats.firebaseapp.com",
  projectId: "bubistats",
  storageBucket: "bubistats.appspot.com",
  messagingSenderId: "1067199753170",
  appId: "1:1067199753170:web:4bbf892a8814fc699f360b",
  measurementId: "G-4BWS5RENSM"
})
const analytics = getAnalytics()

Vue.use(VueRouter)
Vue.use(Buefy, { defaultIconPack: 'fas' })

const auth = getAuth(firebaseApp)
auth.useDeviceLanguage()

const bubiData: BubiData = {
  rides: [
    {
      when: DateTime.fromISO("2021-06-25T22:18:42.000+02:00"),
      bike: 860602,
      from: "0303",
      to: "0207",
      duration: Duration.fromObject({ minutes: 12 })
    },
    {
      when: DateTime.fromISO("2021-06-25T19:18:20.000+02:00"),
      bike: 860101,
      from: "0102",
      to: "0306",
      duration: Duration.fromObject({ minutes: 17 })
    },
    {
      when: DateTime.fromISO("2021-06-24T13:01:00.000+02:00"),
      bike: 860780,
      from: "0102",
      to: "0305",
      duration: Duration.fromObject({ minutes: 16 })
    }
  ]
}

const router = new VueRouter({ routes: [
  { path: '/info', component: InfoPage },
  { path: '/privacy', component: PrivacyPage },
  {
    path: '/*',
    component: StatPage,
    children: [
      { path: '/rides', component: BubiRides, props: { rides: bubiData.rides } }
    ]
  }
]})

const app = new Vue({
  el: '#app',
  router,
  data() {
    return {
      user: auth.currentUser
    }
  },
  methods: {
    logout() {
      signOut(auth).catch((error) => {
        console.error(error)
      })
    },
    login() {
      const provider = new GoogleAuthProvider();

      signInWithPopup(auth, provider)
        .then((result) => {
          this.user = result.user
        })
        .catch((error) => {
          console.error(error)
        })
    }
  },
  computed: {
    isLoggedIn() {
      return this.user;
    }
  }
});

onAuthStateChanged(auth, (user) => {
  app.user = user;
})
