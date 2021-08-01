import Vue from 'vue'
import { Ride } from './model'
import { subscribe, unsubscribe } from './ride-service'

export default Vue.extend({
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
  },
  methods: {
    ride(index: number): Ride {
      return this.rides[index]
    }
  }
})
