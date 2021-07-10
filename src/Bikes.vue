<template>
  <section>
    <b-table
      :data="ridesByBikes"
      :hoverable="true"
      :striped="true"
      default-sort-direction="desc"
      default-sort="rides"
    >
      <b-table-column field="bike" label="Bicaj" sortable v-slot="props">
        {{ props.row.bike }}
      </b-table-column>
      <b-table-column field="rides" label="Utak" sortable v-slot="props">
        {{ props.row.rides }}
      </b-table-column>
      <b-table-column field="totalTime" label="Idő" sortable v-slot="props">
        {{ formatDuration(props.row.totalTime) }}
      </b-table-column>
    </b-table>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { Ride } from "./model"
import { Duration } from "luxon"

type BikeStat = {
  bike: number,
  rides: number,
  totalTime: Duration,
  rideIndices: number[]
}

const groupByBikes = (rides: Ride[]): BikeStat[] => {
  return Array.from(rides.reduce((accumulator: Map<number, BikeStat>, ride: Ride, rideIndex: number): Map<number, BikeStat> => {
    let val = accumulator.get(ride.bike)
    if (!val) {
      val = {
        bike: ride.bike,
        rideIndices: [],
        rides: 0,
        totalTime: Duration.fromMillis(0)
      }
      accumulator.set(ride.bike, val)
    }

    ++val.rides
    val.totalTime = val.totalTime.plus(ride.duration)
    val.rideIndices.push(rideIndex)

    return accumulator
  }, new Map()).values())
}

const formatDuration = (duration: Duration): string => {
  return Math.round(duration.shiftTo('minutes').minutes) + ' perc'
}

export default Vue.extend({
  props: {
    rides: {
      type: Array as () => Array<Ride>,
      required: true
    }
  },
  data: function() {
    return {
      ridesByBikes: groupByBikes(this.rides)
    }
  },
  methods: {
    formatDuration
  },
  watch: {
    rides() {
      this.ridesByBikes = groupByBikes(this.rides)
    }
  }
})
</script>
