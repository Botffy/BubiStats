<template>
  <div class="columns">
    <div
      v-if="!compact"
      class='column is-3'
    >
      <div class='box'>
        <screenshot-upload />
        <hr />
        <ride-form />
      </div>
    </div>
    <div class="column">
      <section v-if="rides.length > 0">
        <b-table
          :data="rides"
          :hoverable="true"
          :striped="true"
          default-sort-direction="desc"
          default-sort="when"
          :paginated="rides.length > (compact ? 10 : 15)"
          :per-page="compact ? 10 : 15"
          :bordered='compact'
          :narrowed='compact'
          :pagination-rounded='true'
          pagination-size="is-small"
        >
          <b-table-column field="when" label="Mikor" sortable :custom-sort="sortBy((ride) => ride.when.toMillis(), defaultSorting)" v-slot="props">
            {{ formatTime(props.row.when) }}
          </b-table-column>

          <b-table-column field="bike" label="Bicaj" :custom-sort="sortBy((ride) => ride.bike, defaultSorting)" sortable v-slot="props">
            {{ props.row.bike }}
          </b-table-column>

          <b-table-column field="from" label="Honnan" :custom-sort="sortByString((ride) => stationName(ride.from), defaultSorting)" sortable v-slot="props">
            {{ stationName(props.row.from) }}
          </b-table-column>

          <b-table-column field="to" label="Hova" :custom-sort="sortByString((ride) => stationName(ride.to), defaultSorting)" sortable v-slot="props">
            {{ stationName(props.row.to) }}
          </b-table-column>

          <b-table-column field="duration" label="Idő" :custom-sort="sortBy((ride) => ride.duration.shiftTo('milliseconds').toMillis(), defaultSorting)" sortable v-slot="props">
            {{ props.row.duration.shiftTo('minutes', 'seconds').minutes }} perc
          </b-table-column>

          <b-table-column
            v-if="!compact"
            v-slot="props"
          >
            <div class="buttons">
              <b-tooltip
                type="is-info"
                label="Módosítás"
                :delay='500'
              >
                <b-button
                  size="is-small"
                  type="is-info"
                  outlined
                  icon-left="fas fa-edit"
                  @click="editRide(props.row)"
                />
              </b-tooltip>
            &nbsp;
              <b-tooltip
                type='is-danger'
                label="Törlés"
                :delay='500'
              >
                <b-button
                  size="is-small"
                  type="is-danger"
                  outlined
                  icon-left="fas fa-trash"
                  @click="deleteRide(props.row)"
                />
              </b-tooltip>
            </div>
          </b-table-column>
        </b-table>

        <b-modal
          v-model="isEditModalActive"
          scroll="keep"
        >
          <div class="modal-card">
            <header class='modal-card-head'>
              <p class='modal-card-title'>
                Út szerkesztése
              </p>
            </header>
            <section class='modal-card-body'>
              <ride-form
                :edit='true'
                :ride='editData'
                @edited='doneEditing()'
              />
            </section>
          </div>
        </b-modal>
      </section>
      <section v-else>
        <div class="recommendation">
          <img :src="icons.UndrawIconContent" />
          <h2>Még nincsenek útjaid a rendszerben</h2>

          <p class="is-hidden-mobile">
            <b-icon
              pack="far"
              icon="hand-point-left"
              size="is-large"
            />
            Vedd fel a Bubi bérlésed adatait a baloldali űrlapon.
          </p>
          <p class="is-hidden-tablet">
            <b-icon
              pack="far"
              icon="hand-point-up"
              size="is-large"
            />
            Vedd fel a Bubi bérlésed adatait a fenti űrlapon.
          </p>

          <p>
            A legkényelmesebben a bérlés adatairól készített képernyőkép feltöltésével tudsz adatot felvinni.
            Hogy azt hogyan kell?
            <a
              href='https://youtu.be/wZxY_1l9c3I'
              target="_blank"
            >
              Nézd meg ezt a videót!
            </a>
          </p>

          <p>
            A képernyőképes megadás helyett kézzel is megadhatod a bérlés adatait.
            Add meg, mikor indultál, melyik bicajjal mentél honnan hova, írd be a bérlés hosszát.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
.recommendation {
  padding: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.recommendation img {
  display: block;
  max-width: 250px;
}

.recommendation h2 {
  display: block;
  font-size: 1.4em;
  font-weight: bold;
  margin-top: 24px;
}

.recommendation p {
  display: block;
  font-size: 1em;
  line-height: 1.5em;
  margin-top: 12px;
}

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
import SortingMixin from './SortingMixin'
import RideForm from './RideForm.vue'
import AddByScreenshot from './RideFormByScreenshot.vue'
import { DateTime } from 'luxon'
import { Ride } from './model'
import { deleteRide } from './ride-service'
import { stationName } from './station-service'

import UndrawIconContent from './assets/undraw_icons/content.svg'

const formatTime = (time: DateTime): string => {
  return time.toFormat('yyyy-MM-dd HH:mm')
}

export default Vue.extend({
  metaInfo: {
    title: 'Bérlések'
  },
  components: {
    'ride-form': RideForm,
    'screenshot-upload': AddByScreenshot
  },
  mixins: [ SortingMixin ],
  props: {
    compact: {
      type: Boolean,
      required: false,
      default: false
    },
    rides: {
      type: Array as () => Array<Ride>,
      required: true
    }
  },
  data: function() {
    return {
      isEditModalActive: false,
      editData: null,
      icons: { UndrawIconContent }
    }
  },
  methods: {
    stationName,
    formatTime,
    defaultSorting(a: Ride, b: Ride) {
      return b.when.toMillis() - a.when.toMillis()
        || b.bike - a.bike
        || b.duration.shiftTo('milliseconds').toMillis() - a.duration.shiftTo('milliseconds').toMillis()
        || this.stationName(b.from).localeCompare(this.stationName(a.from))
        || this.stationName(b.to).localeCompare(this.stationName(a.to))
    },
    deleteRide(row: Ride) {
      this.$buefy.dialog.confirm({
        title: 'Bubiút törlése',
        message: 'Egész biztos, hogy törölni akarod?',
        confirmText: 'Igen, biztos',
        cancelText: 'Mégsem',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          let loading = this.$buefy.loading.open()
          deleteRide(row.when)
            .then(() => {
              this.$buefy.toast.open({
                duration: 2000,
                message: 'Az utat töröltük',
                position: 'is-bottom',
                type: 'is-success'
              })
              loading.close()
            })
            .catch((error) => {
              loading.close()
              console.log(error)
              this.$buefy.dialog.alert({
                title: 'Hiba',
                message: 'Nem sikerült törölni az utat. Nem a te hibád, én voltam, elnézést. Esetleg próbáld meg később.',
                type: 'is-danger',
                hasIcon: true,
                icon: 'times-circle',
                iconPack: 'fas',
                ariaRole: 'alertdialog',
                ariaModal: true
              })
            })
        }
      })
    },
    editRide(row: Ride) {
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
