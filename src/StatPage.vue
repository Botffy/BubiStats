<template>
  <div class="section" v-if="this.$root.isLoggedIn">
    <div class="container">
      <div class="columns">
        <div class='column is-3'>
          <add-ride></add-ride>
        </div>
        <div class="column">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import AddRide from "./AddRide.vue";
import InfoPage from "./InfoPage.vue"

export default Vue.extend({
  components: {
    'info-page': InfoPage,
    'add-ride': AddRide
  }
});
</script>
