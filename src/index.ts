import Vue from "vue";
import VueRouter, { RouteConfig } from 'vue-router';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import { Duration, DateTime } from "luxon"
import { Ride, BubiData } from "./model";
import RidesPage from "./BubiRides.vue";

Vue.use(VueRouter)
Vue.use(Buefy, { defaultIconPack: 'fas' })

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

const routes = [
  { path: '/rides', component: RidesPage, props: { rides: bubiData.rides } }
]
const router = new VueRouter({ routes: routes })

new Vue({
  router
}).$mount('#app')
