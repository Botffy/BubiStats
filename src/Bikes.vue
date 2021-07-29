<template>
  <section v-if="rides && rides.length">
    <quote>...amikor a lovak oldalnézetben felsorakoznak...</quote>

    <div class='columns'>
      <div class='column'>
        <highcharts :options="bikeFrequencyChart" />
      </div>
      <div class='column'>
        <highcharts :options="bikeTimeChart" />
      </div>
    </div>

    <div class="box">
      <b-table
        :data="ridesByBikes"
        :hoverable="true"
        :striped="true"
        default-sort-direction="desc"
        default-sort="rides"
        :paginated="ridesByBikes.length > 10"
        :per-page="10"
        :pagination-rounded='true'
        pagination-size="is-small"
        detailed
        detail-key="bike"
      >
        <b-table-column field="bike" label="Bicaj" sortable :custom-sort="sortBy((stat) => stat.bike, defaultSorting)" v-slot="props">
          {{ props.row.bike }}
        </b-table-column>
        <b-table-column field="rides" label="Utak" sortable :custom-sort="sortBy((stat) => stat.rides, defaultSorting)" v-slot="props" numeric>
          {{ props.row.rides }}
        </b-table-column>
        <b-table-column field="totalTime" label="Idő" sortable :custom-sort="sortBy((stat) => stat.totalTime.shiftTo('milliseconds').toMillis(), defaultSorting)" v-slot="props" numeric>
          {{ rideMinutes(props.row) }} perc
        </b-table-column>
        <b-table-column label="Átlag idő" sortable :custom-sort="sortBy((stat) => averageRideMinutes(stat), defaultSorting)" v-slot="props" numeric>
          {{ averageRideMinutes(props.row) }} perc
        </b-table-column>

        <template #detail='props'>
          <ride-list
            :rides='props.row.rideIndices.map(n => ride(n))'
            :compact='true'
          />
        </template>
      </b-table>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Quote from './components/Quote.vue'
import SortingMixin from './SortingMixin'
import HasRides from './HasRides'
import BubiRides from './BubiRides.vue'
import { Ride } from './model'
import { Duration } from 'luxon'

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
  }, new Map).entries()).sort((a: number[], b: number[]) => a[0] - b[0])
}

const bikeByTime = (bikeStats: BikeStat[], slotSize = 5): number[][] => {
  const slot = (stat: BikeStat) => Math.floor(stat.totalTime.shiftTo('minutes').minutes / slotSize)

  return Array.from(bikeStats.reduce((accumulator: Map<number, number>, stat: BikeStat): Map<number, number> => {
    return accumulator.set(slot(stat), (accumulator.get(slot(stat)) || 0) + 1)
  }, new Map).entries())
  .sort((a: number[], b: number[]) => a[0] - b[0])
}

export default Vue.extend({
  components: {
    'ride-list': BubiRides,
    'quote': Quote
  },
  mixins: [ HasRides, SortingMixin ],
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
        xAxis: {
          title: {
            text: 'A bicajjal megtett utak száma'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key} út</span><table>',
          pointFormat: '<tr><td style="padding:0"><b>{point.y:.0f} bicaj</b></td></tr>',
          footerFormat: '</table>',
          useHTML: true
        },
        credits: {
          enabled: false
        },
        title: {
          text: 'Bicajok a velük megtett utak függvényében'
        },
        legend: {
          enabled: false
        }
      }
    },
    bikeByTime() {
      return bikeByTime(this.ridesByBikes)
    },
    bikeByTimeCategories() {
      let maxMin = Duration.fromMillis(0)
      for (let i = 0; i < this.ridesByBikes.length; ++i) {
        if (this.ridesByBikes[i].totalTime > maxMin) {
          maxMin = this.ridesByBikes[i].totalTime
        }
      }

      return Array.from(Array(Math.ceil(maxMin.shiftTo('minutes').minutes / 5) + 1).keys())
        .map((val) => val * 5 + '-' + (val+1) * 5)
    },
    bikeTimeChart() {
      return {
        series: [{
          type: 'column',
          data: this.bikeByTime,
          name: 'Bicajok száma'
        }],
        yAxis: {
          title: {
            text: 'Bicajok'
          }
        },
        xAxis: {
          categories: this.bikeByTimeCategories,
          min: 0,
          max: this.bikeByTimeCategories.length - 1,
          title: {
            text: 'A bicajjal töltött percek'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key} perc</span><table>',
          pointFormat: '<tr><td style="padding:0"><b>{point.y:.0f} bicaj</b></td></tr>',
          footerFormat: '</table>',
          useHTML: true
        },
        credits: {
          enabled: false
        },
        title: {
          text: 'Bicajok a velük töltött idő függvényében'
        },
        legend: {
          enabled: false
        }
      }
    }
  },
  methods: {
    rideMinutes(stat: BikeStat): number {
      return Math.round(stat.totalTime.shiftTo('minutes').minutes)
    },
    averageRideMinutes(stat: BikeStat): number {
      return Math.round(this.rideMinutes(stat) / stat.rides)
    },
    defaultSorting(a: BikeStat, b: BikeStat) {
      return b.rides - a.rides
        || b.totalTime.shiftTo('milliseconds').toMillis() - a.totalTime.shiftTo('milliseconds').toMillis()
        || this.averageRideMinutes(b) - this.averageRideMinutes(a)
        || b.bike - a.bike
    }
  }
})
</script>
