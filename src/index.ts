import Vue from "vue";
import VueRouter from 'vue-router';
import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts'
import HighchartsSankey from "highcharts/modules/sankey";
import HighchartsDependencyWheel from "highcharts/modules/dependency-wheel";
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import { getFirebaseApp, onUserChange } from "./firebase"
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, useFunctionsEmulator } from "firebase/functions";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, getAdditionalUserInfo } from "firebase/auth";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import StatPage from "./StatPage.vue";
import InfoPage from "./InfoPage.vue";
import PrivacyPage from "./Privacy.vue";
import SettingsPage from "./Settings.vue";
import BubiRides from "./BubiRides.vue";
import Bikes from "./Bikes.vue"
import FilterComponent from "./FilterComponent.vue"
import StationsPage from "./Stations.vue"
import TimePage from "./TimePage.vue"

HighchartsSankey(Highcharts)
HighchartsDependencyWheel(Highcharts)

Vue.use(VueRouter)
Vue.use(HighchartsVue, Highcharts, HighchartsSankey, HighchartsDependencyWheel)
Vue.use(Buefy, { defaultIconPack: 'fas' })

const firebaseApp = getFirebaseApp()
getAnalytics()
const db = getFirestore()
useFirestoreEmulator(db, 'localhost', 8080)
const functions = getFunctions(firebaseApp, "europe-central2")
useFunctionsEmulator(functions, "localhost", 5001)

const auth = getAuth(firebaseApp)
auth.useDeviceLanguage()

const router = new VueRouter({ routes: [
  { path: '/info', component: InfoPage },
  { path: '/privacy', component: PrivacyPage },
  { path: '/settings', component: SettingsPage },
  {
    path: '/*',
    component: StatPage,
    props: true,
    children: [
      { path: '/rides', component: BubiRides },
      { path: '/bikes', component: Bikes },
      { path: '/stations', component: StationsPage },
      { path: '/time', component: TimePage }
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
  components: {
    'filter-component': FilterComponent
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
