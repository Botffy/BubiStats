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
          <div v-if="rides === null" class="cen">
            <b-icon
              pack="fas"
              icon="spinner"
              size="is-large"
              custom-class="fa-spin"
            />
          </div>
          <div v-else-if='rides === 0'>Még nem vettél fel utakat.</div>
          <router-view :rides='this.rides' v-else></router-view>
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
import { subscribe, unsubscribe } from "./ride-service"

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
    this.subscription = subscribe((rides) => {
      this.rides = rides
    })
  },
  destroyed() {
    unsubscribe(this.subscription)
  }
});
</script>
