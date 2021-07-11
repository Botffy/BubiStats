<template>
  <section>
    <highcharts :options="stationFrequencyChart" />

    <b-table
      :data="ridesByStations"
      :hoverable="true"
      :striped="true"
      default-sort-direction="desc"
      default-sort="num"
    >
      <b-table-column field="station" label="Állomás" sortable v-slot="props">
        {{ props.row.station }}
      </b-table-column>
      <b-table-column field='num' label="Érintve" sortable :custom-sort="sortByAllStops" numeric v-slot="props">
        {{ props.row.wasOrigin + props.row.wasDestination  }}
      </b-table-column>
      <b-table-column field='wasOrigin' label="Indulás" sortable numeric v-slot="props">
        {{ props.row.wasOrigin }}
      </b-table-column>
      <b-table-column field='wasDestination' label="Célállomás" sortable numeric v-slot="props">
        {{ props.row.wasDestination }}
      </b-table-column>

    </b-table>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { Ride } from "./model"
import { getStationByCode, Station } from './station-service'
import { Duration } from "luxon"

type StationStat = {
  station: string,
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
          station: getStationByCode(station).name,
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
  }, new Map).entries()).sort()
}


export default Vue.extend({
  props: {
    rides: {
      type: Array as () => Array<Ride>,
      required: true
    }
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
        }
      }
    }
  },
  methods: {
    sortByAllStops(a: StationStat, b: StationStat, isAsc: boolean) {
      return ((a.wasOrigin + a.wasDestination) - (b.wasOrigin + b.wasDestination)) * (isAsc ? 1 : -1)
    }
  }
})
</script>
