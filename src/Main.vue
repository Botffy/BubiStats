<template>
  <rides v-if="$root.isLoggedIn" />
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  components: {
    'rides': () => import('./BubiRides.vue'),
    'info-page': () => import('./InfoPage.vue')
  }
})
</script>
