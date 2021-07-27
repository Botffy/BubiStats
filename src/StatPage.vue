<template>
  <div v-if="$root.isLoggedIn">
    <div class="container">
      <div v-if="rides === null">
        <b-icon
          pack="fas"
          icon="spinner"
          size="is-large"
          custom-class="fa-spin"
        />
      </div>
      <router-view
        v-else
        :rides='rides'
      />
    </div>
  </div>
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import InfoPage from './InfoPage.vue'
import { subscribe, unsubscribe } from './ride-service'

export default Vue.extend({
  components: {
    'info-page': InfoPage
  },
  data() {
    return {
      subscription: null,
      rides: []
    }
  },
  created() {
    this.subscription = subscribe((rides) => {
      this.rides = rides
    })
  },
  destroyed() {
    if (this.subscription) {
      unsubscribe(this.subscription)
    }
  }
})
</script>
