<template>
  <span>{{ this.ago }}</span>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { DateTime } from 'luxon'

const units = ['day', 'hour', 'minute']
const translation_ago = new Map([
   ['day', 'napja'],
   ['hour', 'órája'],
   ['minute', 'perce']
])
const translation_later = new Map([
   ['day', 'nap múlva'],
   ['hour', 'óra múlva'],
   ['minute', 'perc múlva']
])

export default Vue.extend({
  props: {
    date: {
      type: Object as PropType<DateTime>,
      required: true
    },
  },
  computed: {
    ago() {
      let diff = this.date.diffNow().shiftTo(...units)
      let unit = units.find((unit) => diff.get(unit)) || 'minute'
      let value = Math.ceil(diff.as(unit))

      return Math.abs(value) + ' ' + (value < 0 ? translation_ago : translation_later).get(unit)
    }
  }
})
</script>
