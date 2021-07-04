<template>
  <div class="section">
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
</template>

<script lang="ts">
import Vue from 'vue'
import AddRide from "./AddRide.vue";

export default Vue.extend({
  components: {
    'add-ride': AddRide
  }
});
</script>
