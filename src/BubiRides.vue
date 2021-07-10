<template>
  <section>
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

      <b-table-column field="duration" label="Idő" sortable v-slot="props">
        {{ props.row.duration.minutes }} perc
      </b-table-column>

      <b-table-column v-slot="props">
        <span class="icon is-clickable" v-on:click="editRide(props.row)">
          <i class="fas fa-edit" />
        </span>
      </b-table-column>
    </b-table>

    <b-modal v-model="isEditModalActive" scroll="keep">
      <div class="modal-card">
        <header class='modal-card-head'>
          <p class='modal-card-title'>Út szerkesztése</p>
        </header>
        <section class='modal-card-body'>
          <ride-form :edit='true' :ride='editData' v-on:edited='doneEditing()' />
        </section>
      </div>
    </b-modal>
  </section>
</template>

<style>
.modal.has-overflow {
  position: fixed !important;
  overflow: auto !important;
}

.modal .modal-background {
  position: fixed !important;
}
.modal .modal-content {
  overflow: visible !important;
}
.modal .modal-card {
  overflow: visible !important;
}
.modal .modal-card-body {
  overflow: visible !important;
}
</style>

<script lang="ts">
import Vue from 'vue'
import RideForm from "./RideForm.vue";
import { DateTime } from 'luxon';
import { Ride } from "./model"
import { stationName } from './station-service'

const formatTime = (time: DateTime): string => {
  return time.toFormat('yyyy-MM-dd HH:mm')
}

export default Vue.extend({
  components: {
    'ride-form': RideForm
  },
  props: {
    rides: {
      type: Array as () => Array<Ride>,
      required: true
    }
  },
  data: function() {
    return {
      isEditModalActive: false,
      editData: null
    }
  },
  methods: {
    stationName,
    formatTime,
    editRide(row: any) {
      this.editData = row
      this.isEditModalActive = true
    },
    doneEditing() {
      this.isEditModalActive = false
      this.$buefy.toast.open({
        duration: 2000,
        message: 'A módosításokat elmentettük',
        position: 'is-bottom',
        type: 'is-success'
      })
    }
  }
})
</script>
