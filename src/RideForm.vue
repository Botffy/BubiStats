<template>
  <form action=''>
    <b-field
      :type="errors['when'] ? 'is-danger' : ''"
      :message="errors['when']"
    >
      <b-datetimepicker
        placeholder='Mikor'
        v-model='model.when'
        icon='calendar'
        :timepicker='timepickerProps'
        :datepicker='datepickerProps'
        :datetime-formatter='datetimeFormatter'
        :min-dateTime='minDatetime'
        :max-datetime='new Date()'
        @blur='validateWhen'
        editable
      />
    </b-field>
    <b-field>
      <b-input
        placeholder='Bicaj'
        v-model='model.bike'
        icon='bicycle'
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
        placeholder='Honnan'
        v-model='model.fromStation'
        v-on:error="onError('fromStation', $event)"
      />
    </b-field>
    <b-field
      :type="errors['toStation'] ? 'is-danger' : ''"
      :message="errors['toStation']"
    >
      <station-select
        placeholder='Hová'
        v-model='model.toStation'
        v-on:error="onError('toStation', $event)"
      />
    </b-field>

    <b-field label='Perc' label-position='on-border'>
      <b-numberinput
        expanded
        min='0'
        v-model='model.minutes'
        controls-position="compact"
        controls-rounded
      />
    </b-field>
    <b-field label='Másodperc' label-position='on-border'>
      <b-numberinput
        expanded
        min='0'
        max='59'
        v-model='model.seconds'
        controls-position="compact"
        controls-rounded
      />
    </b-field>

    <div class="has-text-centered">
      <div v-if="!edit">
        <b-button
          type="button is-success"
          native-type="submit"
          @click.prevent="addRide"
          :disabled='!isFilled()'
        >
          Út hozzáadása
        </b-button>
      </div>
      <div v-else>
        <b-button
          type="button is-success"
          native-type="submit"
          @click.prevent="editRide"
          :disabled='!isFilled()'
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
import { addRide, editRide, ValidationError } from './ride-service'
import { getStationByCode, Station } from './station-service'
import StationSelect from "./StationSelect.vue"
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
      timepickerProps: {
        hourFormat: '24',
        enableSeconds: true
      },
      datepickerProps: {
        nearbySelectableMonthDays: true
      },
      datetimeFormatter: (date: Date) => DateTime.fromJSDate(date).toFormat('yyyy-MM-dd HH:mm:ss'),
      minDatetime: DateTime.fromISO("2021-05-24T00:00:00.000+02:00").toJSDate()
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
        .then(() => {
          this.model = defaultRide()
          this.errors = {
            fromStation: null,
            toStation: null
          }

          this.$buefy.toast.open({
            duration: 2000,
            message: 'Az utat felvettük',
            position: 'is-bottom',
            type: 'is-success'
          })

          this.$emit('added', ride)
          loading.close()
        })
        .catch((error) => {
          let message
          if (error.details) {
            console.error(error.details)
            let validationErrors = error.details as ValidationError[]

            if (validationErrors.length == 1) {
              message = validationErrors[0].message;
            }
            else if (validationErrors.length > 1) {
              message = 'Nem sikerült felvenni az utat: <ul>'
                + validationErrors.map((validationError) => '<li>' + validationError.message + '</li>').join('')
                + '</ul>'
            } else {
              message = 'Nem sikerült felvenni az utat. És valami nem stimmel.'
            }
          } else {
            console.error(error)
            message = 'Nem sikerült felvenni az utat. Ez nem a te hibád, én voltam, bocs. Próbáld meg később.'
          }

          this.$buefy.dialog.alert({
            title: 'Hiba',
            message: message,
            type: 'is-danger',
            hasIcon: true,
            icon: 'times-circle',
            iconPack: 'fas',
            ariaRole: 'alertdialog',
            ariaModal: true
          })

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
      this.errors[el] = errorMessage;
    }
  },
})
</script>
