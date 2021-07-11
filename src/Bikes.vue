<template>
  <section>
    <div class='columns'>
      <div class='column'>
        <highcharts :options="bikeFrequencyChart" />
      </div>
      <div class='column'>
        <highcharts :options="bikeTimeChart" />
      </div>
    </div>

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

const bikeFrequency = (bikeStats: BikeStat[]): number[][] => {
  return Array.from(bikeStats.reduce((accumulator: Map<number, number>, stat: BikeStat): Map<number, number> => {
    return accumulator.set(stat.rides, (accumulator.get(stat.rides) || 0) + 1)
  }, new Map).entries()).sort()
}

const bikeByTime = (bikeStats: BikeStat[], slotSize: number = 5): number[][] => {
  const slot = (stat: BikeStat) => Math.floor(stat.totalTime.shiftTo('minutes').minutes / slotSize)

  return Array.from(bikeStats.reduce((accumulator: Map<number, number>, stat: BikeStat): Map<number, number> => {
    return accumulator.set(slot(stat), (accumulator.get(slot(stat)) || 0) + 1)
  }, new Map).entries()).map((val) => {
    return [val[0]*5, val[1]]
  }).sort()
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
  computed: {
    ridesByBikes() {
      return groupByBikes(this.rides)
    },
    bikeFrequencyChart() {
      return {
        series: [{
          type: 'column',
          data: bikeFrequency(this.ridesByBikes),
          name: 'Bicajok száma'
        }],
        yAxis: {
          title: {
            text: 'Bicajok'
          }
        },
        credits: {
          enabled: false
        },
        title: {
          text: 'Bicajok a velük megtett utak függvényében'
        }
      }
    },
    bikeTimeChart() {
      return {
        series: [{
          type: 'column',
          data: bikeByTime(this.ridesByBikes),
          name: 'Bicajok száma'
        }],
        yAxis: {
          title: {
            text: 'Bicajok'
          }
        },
        credits: {
          enabled: false
        },
        title: {
          text: 'Bicajok a velük töltött idő függvényében'
        }
      }
    }
  },
  methods: {
    formatDuration
  }
})
</script>
