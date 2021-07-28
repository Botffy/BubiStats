<template>
  <form action=''>
    <b-field
      :type="errors['when'] ? 'is-danger' : ''"
      :message="errors['when']"
    >
      <b-datetimepicker
        v-model='model.when'
        placeholder='Mikor'
        icon='calendar'
        locale="hu-HU"
        :timepicker="{ hourFormat: '24', enableSeconds: true }"
        :datepicker="{ nearbySelectableMonthDays: true }"
        :datetime-parser="datetimeParser"
        :datetime-formatter='datetimeFormatter'
        @input='validateWhen'
      />
    </b-field>
    <b-field>
      <b-input
        v-model='model.bike'
        placeholder='Bicaj'
        icon='bicycle'
        inputmode='numeric'
        pattern='86[0-1][0-9]{3}'
        maxlength="6"
        :has-counter='false'
        validation-message='A bicajok kódja hat számjegyből áll, 860-val vagy 861-gyel kezdődik.'
      />
    </b-field>
    <b-field
      :type="errors['fromStation'] ? 'is-danger' : ''"
      :message="errors['fromStation']"
    >
      <station-select
        v-model='model.fromStation'
        placeholder='Honnan'
        @error="onError('fromStation', $event)"
      />
    </b-field>
    <b-field
      :type="errors['toStation'] ? 'is-danger' : ''"
      :message="errors['toStation']"
    >
      <station-select
        v-model='model.toStation'
        placeholder='Hová'
        @error="onError('toStation', $event)"
      />
    </b-field>

    <b-field
      label='Perc'
      label-position='on-border'
    >
      <b-numberinput
        v-model='model.minutes'
        inputmode='numeric'
        expanded
        min='0'
        controls-position="compact"
        controls-rounded
      />
    </b-field>
    <b-field
      label='Másodperc'
      label-position='on-border'
    >
      <b-numberinput
        v-model='model.seconds'
        inputmode='numeric'
        expanded
        min='0'
        max='59'
        controls-position="compact"
        controls-rounded
      />
    </b-field>

    <div class="has-text-centered">
      <div v-if="!edit">
        <b-button
          type="button is-success"
          native-type="submit"
          :disabled='!isFilled()'
          @click.prevent="addRide"
        >
          Út hozzáadása
        </b-button>
      </div>
      <div v-else>
        <b-button
          type="button is-success"
          native-type="submit"
          :disabled='!isFilled()'
          @click.prevent="editRide"
        >
          Módosítások mentése
        </b-button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { DateTime, Duration } from 'luxon'
import { addRide, editRide } from './ride-service'
import OnAddRideMixin from './OnAddRideMixin'
import { getStationByCode, Station } from './station-service'
import StationSelect from './StationSelect.vue'
import { Ride } from './model'

type FormRide = {
  when: Date,
  bike: string,
  fromStation: Station,
  toStation: Station,
  minutes: number,
  seconds: number
}

const defaultRide = (): FormRide => {
  return {
      when: null,
      bike: null,
      fromStation: null,
      toStation: null,
      minutes: 10,
      seconds: 0
  }
}

const toFormRide = (ride: Ride): FormRide => {
  return {
    when: ride.when.toJSDate(),
    bike: ride.bike.toString(),
    fromStation:  getStationByCode(ride.from),
    toStation: getStationByCode(ride.to),
    minutes: ride.duration.shiftTo('minutes', 'seconds').minutes,
    seconds: ride.duration.shiftTo('minutes', 'seconds').seconds
  }
}

const toRide = (ride: FormRide): Ride => {
  return {
    when: DateTime.fromJSDate(ride.when),
    duration: Duration.fromObject({ minutes: ride.minutes, seconds: ride.seconds }),
    bike: parseInt(ride.bike),
    from: ride.fromStation.code,
    to: ride.toStation.code
  }
}

export default Vue.extend({
  components: {
    'station-select': StationSelect
  },
  mixins: [ OnAddRideMixin ],
  props: {
    edit: {
      type: Boolean,
      required: false,
      default: false
    },
    ride: {
      type: Object,
      required: false,
      default: null
    },
  },
  data() {
    return {
      originalRideTime: this.ride?.when,
      model: this.ride == null ? defaultRide() : toFormRide(this.ride),
      errors: {
        when: null,
        fromStation: null,
        toStation: null
      },
      datetimeFormatter: (date: Date) => DateTime.fromJSDate(date).toFormat('yyyy-MM-dd HH:mm:ss'),
      datetimeParser: (input: string): Date => DateTime.fromFormat(input, 'yyyy-MM-dd HH:mm:ss').toJSDate(),
      minDatetime: DateTime.fromISO('2021-05-24T00:00:00.000+02:00').toJSDate()
    }
  },
  methods: {
    isFilled() {
      return !Object.values(this.model).some(x => x === null || x === '')
    },
    validateWhen() {
      this.errors.when = this.model.when ? null : 'Add meg, mikor indult az út'
    },
    addRide() {
      const loading = this.$buefy.loading.open()

      const ride = toRide(this.model)
      addRide(ride)
        .then(this.celebrate)
        .then(() => {
          this.model = defaultRide()
          this.errors = {
            fromStation: null,
            toStation: null
          }
          this.$emit('added', ride)
          loading.close()
        })
        .catch((error) => {
          this.handleError(error)
          loading.close()
        })
    },
    editRide() {
      const loading = this.$buefy.loading.open()
      const ride = toRide(this.model)
      editRide(this.originalRideTime, ride)
        .then(() => {
          this.$emit('edited', this.originalRideTime, ride)
          loading.close()
        })
    },
    onError(el: string, errorMessage: string) {
      this.errors[el] = errorMessage
    }
  },
})
</script>
