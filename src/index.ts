import Vue from "vue";
import VueRouter from 'vue-router';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import { getFirebaseApp, onUserChange } from "./firebase"
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import StatPage from "./StatPage.vue";
import InfoPage from "./InfoPage.vue";
import PrivacyPage from "./Privacy.vue";
import BubiRides from "./BubiRides.vue";

Vue.use(VueRouter)
Vue.use(Buefy, { defaultIconPack: 'fas' })

const firebaseApp = getFirebaseApp()
getAnalytics()
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
      loadingScreen: null,
      loading: null,
      user: null
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
      this.loading = true
      signInWithPopup(auth, provider)
        .then((result) => {
          this.user = result.user
        })
        .catch((error) => {
          this.loading = false
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
  created() {
    this.loading = true
    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.loading = false
    })
  },
  watch: {
    loading() {
      if (this.loading) {
        this.loadingScreen = this.$buefy.loading.open()
      } else {
        this.loadingScreen.close()
      }
    },
    async user() {
      if (!this.user) {
        this.$eventBus.$emit('logout')
      } else {
        this.$eventBus.$emit('login', { uid: this.user.uid })
      }
    }
  }
});
