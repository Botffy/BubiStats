<template>
  <div class="section" v-if="this.$root.isLoggedIn">
    <div class="container">
      <div class="columns">
        <div class='column is-3'>
          <div class='box'>
            <ride-form></ride-form>
          </div>
        </div>
        <div class="column">
          <router-view :rides='this.rides'></router-view>
        </div>
      </div>
    </div>
  </div>
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import RideForm from "./RideForm.vue";
import InfoPage from "./InfoPage.vue"
import { subscribe } from "./ride-service"

export default Vue.extend({
  data() {
    return {
      subscription: null,
      rides: []
    }
  },
  components: {
    'info-page': InfoPage,
    'ride-form': RideForm
  },
  created() {
    if (this.$root.isLoggedIn) {
      this.subscription = subscribe(this.$root.user.uid, (rides) => {
        this.rides = rides
      })
    }

    this.$eventBus.$on('login', (ev: any) => {
      this.subscription = subscribe(ev.uid, (rides) => {
        this.rides = rides
      })
    })
    this.$eventBus.$on('logout', (ev: any) => {
      this.subscription.unsubscribe()
      this.rides = []
    })
  }
});
</script>
