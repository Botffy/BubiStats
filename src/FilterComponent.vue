<template>
  <b-navbar-item type='div'>
    <span v-if="!isInitializing">
      <b-icon
        pack="fas"
        icon="filter"
        size="is-small"
      />
      <span>{{ dropdownLabel() }}</span>
    </span>
    <span v-else>
      <b-icon
        pack="fas"
        icon="spinner"
        size="is-small"
        custom-class="fa-spin"
      />
    </span>
  </b-navbar-item>
</template>

<script type='ts'>
import Vue from 'vue'
import { subscribe, unsubscribe } from './ride-service'

export default Vue.extend({
  data() {
    return {
      subscription: null,
      rideNum: null
    }
  },
  computed: {
    isInitializing() {
      return this.rideNum == null
    }
  },
  created() {
    this.subscription = subscribe((rides) => {
      this.rideNum = rides?.length
    })
  },
  destroyed() {
    if (this.subscription) {
      unsubscribe(this.subscription)
    }
  },
  methods: {
    dropdownLabel() {
      return this.rideNum + ' út'
    }
  },
})
</script>
