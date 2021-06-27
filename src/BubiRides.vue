<template>
  <div class="section">
    <div class="container">
      <b-table
        :data="data"
        :hoverable="true"
        :striped="true"
        default-sort-direction="desc"
        default-sort="when"
      >
        <b-table-column field="when" label="Mikor" sortable v-slot="props">
          {{ props.row.when }}
        </b-table-column>

        <b-table-column field="bike" label="Bicaj" sortable v-slot="props">
          {{ props.row.bike }}
        </b-table-column>

        <b-table-column field="from" label="Honnan" sortable v-slot="props">
          {{ props.row.from }}
        </b-table-column>

        <b-table-column field="to" label="Hova" sortable v-slot="props">
          {{ props.row.to }}
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
import { Duration } from "luxon"
//import Ride from "./ride"

export default {
  data() {
    return {
      data: [
        {
          when: "2021.06.25 22:18:42",
          bike: 860602,
          from: "0303-Bécsi út - Óbudai Egyetem",
          to: "0207-Mechwart liget",
          duration: Duration.fromObject({ minutes: 12 })
        },
        {
          when: "2021.06.25 19:18:20",
          bike: 860101,
          from: "0102-Szilágyi Dezső tér",
          to: "0306-Kiscelli utca - Zápor utca",
          duration: Duration.fromObject({ minutes: 17 })
        },
        {
          when: "2021.06.24 13:01:00",
          bike: 860780,
          from: "0102-Szilágyi Dezső tér",
          to: "0305-Szent Margit Kórház",
          duration: Duration.fromObject({ minutes: 16 })
        }
      ]
    }
  }
};
</script>
