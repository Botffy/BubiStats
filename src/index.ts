import Vue from "vue";
import VueRouter, { RouteConfig } from 'vue-router';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import Rides from "./BubiRides.vue";

Vue.use(VueRouter)
Vue.use(Buefy)

const routes = [
  { path: '/rides', component: Rides }
]

const router = new VueRouter({routes: routes})

const v = new Vue({
  router
}).$mount('#app')
