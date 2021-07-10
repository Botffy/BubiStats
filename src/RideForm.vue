<template>
  <form action=''>
    <b-field>
      <b-datetimepicker
        placeholder='Mikor'
        v-model='model.when'
        icon='calendar'
        :timepicker='timepickerProps'
        :datepicker='datepickerProps'
        :datetime-formatter='datetimeFormatter'
      />
    </b-field>
    <b-field>
      <b-input
        placeholder='Bicaj'
        v-model='model.bike'
        icon='bicycle'
        pattern='86[0-9]{4}'
        maxlength="6"
        :has-counter='false'
        validation-message='A bicajok kódja 6 számjegyből áll, és 86-tal kezdődik.'
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
        :min='1'
        v-model='model.minutes'
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
import { addRide, editRide } from './ride-service'
import { getStationByCode, Station } from './station-service'
import StationSelect from "./StationSelect.vue"
import { Ride } from './model'

type FormRide = {
  when: Date,
  bike: string,
  fromStation: Station,
  toStation: Station,
  minutes: number
}

const defaultRide = (): FormRide => {
  return {
      when: DateTime.now().minus({ minutes: 10 }).toJSDate(),
      bike: null,
      fromStation: null,
      toStation: null,
      minutes: 10,
  }
}

const toFormRide = (ride: Ride): FormRide => {
  return {
    when: ride.when.toJSDate(),
    bike: ride.bike.toString(),
    fromStation:  getStationByCode(ride.from),
    toStation: getStationByCode(ride.to),
    minutes: ride.duration.minutes
  }
}

const toRide = (ride: FormRide): Ride => {
  return {
    when: DateTime.fromJSDate(ride.when),
    duration: Duration.fromObject({ minutes: ride.minutes }),
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
        fromStation: null,
        toStation: null
      },
      timepickerProps: {
        hourFormat: '24'
      },
      datepickerProps: {
        minDate: DateTime.fromISO("2021-05-24T00:00:00.000+02:00").toJSDate(),
        maxDate: new Date(),
        nearbySelectableMonthDays: true
      },
      datetimeFormatter: (date: Date) => {
        return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd HH:mm')
      }
    }
  },
  methods: {
    isFilled() {
      return !Object.values(this.model).some(x => x === null || x === '')
    },
    addRide() {
      const loading = this.$buefy.loading.open()

      const ride = toRide(this.model)
      addRide(this.$root.$data.user.uid, ride)
        .then(() => {
          this.model = defaultRide()

          this.$buefy.toast.open({
            duration: 2000,
            message: 'Az utat felvettük',
            position: 'is-bottom',
            type: 'is-success'
          })

          this.$emit('added', ride)
          loading.close()
        })
    },
    editRide() {
      const loading = this.$buefy.loading.open()
      const ride = toRide(this.model)
      editRide(this.$root.$data.user.uid, this.originalRideTime, ride)
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
