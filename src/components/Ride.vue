<template>
  <span>
    {{ ride.when.toFormat('yyyy-MM-dd') }}
    {{ station(ride.from) }}
    <b-icon
      pack="fas"
      icon="arrow-right"
      size="is-small"
    />
    {{ station(ride.to) }}
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Ride } from '../model'
import { getStationByCode } from '../station-service'

export default Vue.extend({
  props: {
    ride: {
      type: Object as PropType<Ride>,
      required: true
    },
  },
  methods: {
    station(code: string): string {
      return getStationByCode(code).name
    }
  }
})
</script>
