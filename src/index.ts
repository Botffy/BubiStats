import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts'
import HighchartsSankey from 'highcharts/modules/sankey'
import HighchartsDependencyWheel from 'highcharts/modules/dependency-wheel'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import { getFirebaseApp } from './firebase'
import { getAnalytics } from 'firebase/analytics'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getAuth, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import router from './router'
import { subscribe } from './ride-service'
import { canonicalUrl } from './meta'
import { Settings as LuxonSettings } from 'luxon'

LuxonSettings.defaultLocale = 'hu'
LuxonSettings.defaultZoneName = 'Europe/Budapest'

HighchartsSankey(Highcharts)
HighchartsDependencyWheel(Highcharts)

Vue.use(VueRouter)
Vue.use(VueMeta)
Vue.use(HighchartsVue, Highcharts, HighchartsSankey, HighchartsDependencyWheel)
Vue.use(Buefy, { defaultIconPack: 'fas' })

const firebaseApp = getFirebaseApp()
getAnalytics()

const db = getFirestore()
const functions = getFunctions(firebaseApp, 'europe-central2')

if (process.env.NODE_ENV !== 'production') {
  console.log('Using emulators')
  connectAuthEmulator(getAuth(), 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectFunctionsEmulator(functions, 'localhost', 5001)
  connectStorageEmulator(getStorage(), 'localhost', 9199)
}

const auth = getAuth(firebaseApp)
auth.useDeviceLanguage()

document.querySelector('head link[rel="canonical"]').remove()
document.querySelector('head meta[property="og:url"]').remove()

new Vue({
  el: '#app',
  router,
  metaInfo() {
    return {
      title: null,
      titleTemplate: (titleChunk: string): string => {
        return titleChunk ? `BubiStats: ${titleChunk}` : 'BubiStats'
      },
      link: [ canonicalUrl('') ],
    }
  },
  components: {
    'bubistats-footer': () => import('./Footer.vue'),
    'bubistats-navbar': () => import('./Navbar.vue')
  },
  data() {
    return {
      loadingScreen: null,
      loading: null,
      loginModalActive: false,
      user: null,
      hasRides: false
    }
  },
  computed: {
    isLoggedIn() {
      return this.user != null
    },
    getUser() {
      return this.user.uid
    }
  },
  watch: {
    loading() {
      if (this.loading) {
        this.loadingScreen = this.$buefy.loading.open()
      } else {
        this.loadingScreen.close()
      }
    }
  },
  created() {
    this.loading = true
    onAuthStateChanged(auth, (user) => {
      this.user = user
      if (user) {
        subscribe(rides => {
          if (rides != null) {
            this.hasRides = rides.length > 0
            this.loading = false
          } else {
            this.hasRides = false
          }
        })
      } else {
        this.loading = false
      }
    })
  },
})
