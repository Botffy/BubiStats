<template>
  <form class='box' action=''>
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

    <div class="box has-text-centered">
      <b-button
        type="button is-success"
        native-type="submit"
        @click.prevent="onSubmit"
        :disabled='!isFilled()'
      >
        Út hozzáadása
      </b-button>
    </div>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import { DateTime, Duration } from 'luxon'
import { addRide } from './ride-service'
import StationSelect from "./StationSelect.vue"

export default Vue.extend({
  components: {
    'station-select': StationSelect
  },
  data() {
    return {
      error: {
        when: null
      },
      model: {
        when: DateTime.now().minus({ minutes: 10 }).toJSDate(),
        bike: null,
        fromStation: null,
        toStation: null,
        minutes: 10,
      },
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
    onSubmit() {
      addRide(this.$root.$data.user.uid, {
        when: DateTime.fromJSDate(this.model.when),
        duration: Duration.fromObject({ minutes: this.model.minutes }),
        bike: parseInt(this.model.bike),
        from: this.model.fromStation.code,
        to: this.model.toStation.code
      });
    },
    onError(el: string, errorMessage: string) {
      this.errors[el] = errorMessage;
    }
  },
  created() {
    this.$eventBus.$on('login', (ev: any) => {

    })
    this.$eventBus.$on('logout', (ev: any) => {

    })
  }
})
</script>
