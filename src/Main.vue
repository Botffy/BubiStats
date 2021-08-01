<template>
  <rides v-if="$root.isLoggedIn" />
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  metaInfo() {
    return {
      title: this.$root.isLoggedIn ? 'Bérlések' : null
    }
  },
  components: {
    'rides': () => import('./BubiRides.vue'),
    'info-page': () => import('./InfoPage.vue')
  }
})
</script>
