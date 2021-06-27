<template>
  <div class="section">
    <div class="container">
      <b-table
        :data="rides"
        :hoverable="true"
        :striped="true"
        default-sort-direction="desc"
        default-sort="when"
      >
        <b-table-column field="when" label="Mikor" sortable v-slot="props">
          {{ formatTime(props.row.when) }}
        </b-table-column>

        <b-table-column field="bike" label="Bicaj" sortable v-slot="props">
          {{ props.row.bike }}
        </b-table-column>

        <b-table-column field="from" label="Honnan" sortable v-slot="props">
          {{ stationName(props.row.from) }}
        </b-table-column>

        <b-table-column field="to" label="Hova" sortable v-slot="props">
          {{ stationName(props.row.to) }}
        </b-table-column>

        <b-table-column field="duration" label="Hossz" sortable v-slot="props">
          {{ props.row.duration.minutes }} perc
        </b-table-column>
      </b-table>
    </div>
  </div>
</template>

<style>
</style>

<script lang="ts">
import { DateTime } from 'luxon';
import { Ride } from "./model"
import { stationName } from './station-service'

const formatTime = (time: DateTime): string => {
  return time.toFormat('yyyy-mm-dd HH:mm')
}

export default {
  props: {
    rides: {
      type: Array as () => Array<Ride>,
      required: true
    }
  },
  methods: {
    stationName,
    formatTime
  }
};
</script>
