<template>
  <section>
    <quote>De hol a Távol, hol a Közel, s hol vannak köztük Állomások?</quote>

    <div class='columns'>
      <div class='column'>
        <highcharts :options="stationFrequencyChart" />
      </div>
      <div class='column'>
        <highcharts :options="stationDependencyGraph" />
      </div>
    </div>
    <div class="box">
      <b-table
        :data="ridesByStations"
        :hoverable="true"
        :striped="true"
        default-sort-direction="desc"
        default-sort="num"
        :paginated="ridesByStations.length > 10"
        :per-page="10"
        :pagination-rounded='true'
        pagination-size="is-small"
        detailed
        detail-key="station"
      >
        <b-table-column field="station" label="Állomás" sortable :custom-sort="sortByString((a) => a.station.name, defaultSorting)" v-slot="props">
          {{ props.row.station.name }}
        </b-table-column>
        <b-table-column field='num' label="Érintve" sortable :custom-sort="sortBy((a) => a.wasDestination + a.wasOrigin, defaultSorting)" numeric v-slot="props">
          {{ props.row.wasOrigin + props.row.wasDestination  }}
        </b-table-column>
        <b-table-column field='wasOrigin' label="Indulás" sortable :custom-sort="sortBy((a) => a.wasOrigin, defaultSorting)" numeric v-slot="props">
          {{ props.row.wasOrigin }}
        </b-table-column>
        <b-table-column field='wasDestination' label="Célállomás" sortable :custom-sort="sortBy((a) => a.wasDestination, defaultSorting)" numeric v-slot="props">
          {{ props.row.wasDestination }}
        </b-table-column>

        <template #detail='props'>
          <ride-list :rides='props.row.rideIndices.map( n => ride(n))' :compact="true" />
        </template>
      </b-table>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import HasRides from './HasRides'
import SortingMixin from './SortingMixin'
import Quote from "./components/Quote.vue"
import BubiRides from "./BubiRides.vue";
import { Ride } from "./model"
import { getStationByCode, Station } from './station-service'

type StationStat = {
  station: Station,
  wasOrigin: number,
  wasDestination: number,
  rideIndices: number[]
}

const groupByStation = (rides: Ride[]): StationStat[] => {
  return Array.from(rides.reduce((accumulator: Map<string, StationStat>, ride: Ride, rideIndex: number): Map<string, StationStat> => {
    [ride.from, ride.to].forEach(station => {
      let val = accumulator.get(station)
      if (!val) {
        val = {
          station: getStationByCode(station),
          wasOrigin: 0,
          wasDestination: 0,
          rideIndices: []
        }
        accumulator.set(station, val)
      }

      if (station == ride.from) {
        ++val.wasOrigin
      } else {
        ++val.wasDestination
      }
      val.rideIndices.push(rideIndex)
    });

    return accumulator
  }, new Map()).values())
}

const stationFrequency = (stationStat: StationStat[]): number[][] => {
  return Array.from(stationStat.reduce((accumulator: Map<number, number>, stat: StationStat): Map<number, number> => {
    return accumulator.set(stat.wasOrigin + stat.wasDestination, (accumulator.get(stat.wasOrigin + stat.wasDestination) || 0) + 1)
  }, new Map).entries()).sort((a: number[], b: number[]) => a[0] - b[0])
}

const stationDependency = (rides: Ride[]): any[] => {
  return Array.from(rides.reduce((accumulator: Map<string, Map<string, number>>, ride: Ride): Map<string, Map<string, number>> => {
    let val = accumulator.get(ride.from)
    if (!val) {
      val = new Map()
      accumulator.set(ride.from, val)
    }

    val.set(ride.to, (val.get(ride.to) || 0) + 1)
    return accumulator
  }, new Map).entries())
  .map((a: any[2]) => {
    return Array.from(a[1]).map((val: any[2]) => [ getStationByCode(a[0]).name, getStationByCode(val[0]).name, val[1] ])
  })
  .reduce((memo, it) => memo.concat(it))
  .sort((a: any[3], b: any[3]) => {
    return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1])
  })
}

export default Vue.extend({
  components: {
    'ride-list': BubiRides,
    'quote': Quote
  },
  computed: {
    ridesByStations() {
      return groupByStation(this.rides)
    },
    stationFrequencyChart() {
      return {
        series: [{
          type: 'column',
          data: stationFrequency(this.ridesByStations),
          name: 'Állomás'
        }],
        yAxis: {
          title: {
            text: null
          }
        },
        credits: {
          enabled: false
        },
        title: {
          text: 'Kedvenc állomások'
        },
        legend: {
          enabled: false
        }
      }
    },
    stationDependencyGraph() {
      return {
        series: [{
          type:'dependencywheel',
          keys: ['from', 'to', 'weight'],
          data: stationDependency(this.rides),
          dataLabels: {
            enabled: false
          },
          name: ''
        }],
        credits: {
          enabled: false
        },
        title: {
          text: 'Bubigráf'
        },

      }
    }
  },
  mixins: [ HasRides, SortingMixin ],
  methods: {
    defaultSorting(a: StationStat, b: StationStat) {
      return (a.wasOrigin + a.wasDestination) - (b.wasOrigin + b.wasDestination)
        || b.wasOrigin - a.wasOrigin
        || b.wasDestination - a.wasDestination
        || a.station.name.localeCompare(b.station.name)
    }
  }
})
</script>
