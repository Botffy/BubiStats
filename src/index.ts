import Vue from "vue";
import VueRouter from 'vue-router';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import * as firebase from "firebase/app";
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import StatPage from "./StatPage.vue";
import InfoPage from "./InfoPage.vue";
import PrivacyPage from "./Privacy.vue";
import BubiRides from "./BubiRides.vue";

Vue.use(VueRouter)
Vue.use(Buefy, { defaultIconPack: 'fas' })

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
const db = getFirestore()
useFirestoreEmulator(db, 'localhost', 8080)

const auth = getAuth(firebaseApp)
auth.useDeviceLanguage()

const router = new VueRouter({ routes: [
  { path: '/info', component: InfoPage },
  { path: '/privacy', component: PrivacyPage },
  {
    path: '/*',
    component: StatPage,
    props: true,
    children: [
      { path: '/rides', component: BubiRides }
    ]
  }
]})

const eventBus = new Vue()
Vue.prototype.$eventBus = eventBus

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
      return this.user != null;
    },
    getUser() {
      return this.user.uid;
    }
  },
  watch: {
    async user() {
      if (!this.user) {
        this.$eventBus.$emit('logout')
      } else {
        this.$eventBus.$emit('login', { uid: this.user.uid })
      }
    }
  }
});

onAuthStateChanged(auth, (user) => {
  app.user = user;
})
