<template>
  <b-autocomplete
    v-model="station"
    :data='filteredStationArray'
    field='displayName'
    @select='option => (selected = option)'
    @blur='onBlur()'
    :placeholder='placeholder'
    :open-on-focus='true'
  >
    <template #empty>Nincs ilyen állomás</template>
  </b-autocomplete>

</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Station, listStations } from "./station-service"

interface DisplayStation extends Station {
  displayName: string
}

const stations: DisplayStation[] = listStations().map((station: Station) => {
  return {
    code: station.code,
    name: station.name,
    displayName: station.code + ' ' + station.name
  }
})

const matches = (option: DisplayStation, inputValue: string): boolean => {
  return option.displayName
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) >= 0
}

export default Vue.extend({
  props: {
    placeholder: String,
    value: {
      type: Object as PropType<Station>
    }
  },
  data() {
    return {
      stations: stations,
      station: '',
      selected: null
    }
  },
  methods: {
    onBlur() {
      if (this.selected) {
        return
      }

      if (!this.station) {
        this.$emit('error', 'Adj meg egy állomást!')
        return
      }

      const matching = this.stations.filter((option: DisplayStation) => {
        return matches(option, this.station)
      });
      if (matching.length == 0) {
        this.$emit('error', 'Nincs ilyen állomás :(')
      } else if (matching.length == 1) {
        this.station = matching[0].displayName
      } else {
        this.$emit('error', 'Több állomás passzol a megadott névhez. Melyikre gondoltál?')
      }
    }
  },
  computed: {
    filteredStationArray(): string[] {
      return this.stations.filter((option: DisplayStation) => {
        return matches(option, this.station)
      })
    },
  },
  watch: {
    selected: function(val) {
      this.$emit('error', null)
      this.$emit('input', val)
    }
  }
})

</script>
