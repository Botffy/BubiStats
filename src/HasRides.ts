import { Ride } from './model'

export default {
  props: {
    rides: {
      type: Array as () => Array<Ride>,
      required: true
    }
  },
  methods: {
    ride(index: number): Ride {
      return this.rides[index]
    }
  }
}
