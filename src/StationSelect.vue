<template>
  <b-autocomplete
    v-model="station"
    :data='filteredStationArray'
    field='displayName'
    :placeholder='placeholder'
    :open-on-focus='true'
    @select='option => (selected = option)'
    @blur='onBlur()'
  >
    <template #empty>
      Nincs ilyen állomás
    </template>
  </b-autocomplete>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Station, listStations } from './station-service'

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
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    value: {
      type: Object as PropType<Station>,
      required: false,
      default: null
    }
  },
  data() {
    return {
      stations: stations,
      station: '',
      selected: null
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
    value: function(val: Station) {
      this.setStation(val)
    },
    selected: function(val) {
      this.$emit('error', '')
      this.$emit('input', val)
    }
  },
  created() {
    this.setStation(this.value)
  },
  methods: {
    setStation(val: Station) {
      if (val == null) {
        this.station = ''
        this.selected = null
        return
      }

      const matching = this.stations.filter((option: DisplayStation) => {
        return option.code === val.code
      })

      this.station = matching[0].displayName
      this.selected = matching[0]
    },
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
      })
      if (matching.length == 0) {
        this.$emit('error', 'Nincs ilyen állomás :(')
      } else if (matching.length == 1) {
        this.station = matching[0].displayName
        this.selected = matching[0]
      } else {
        this.$emit('error', 'Több állomás passzol a megadott névhez. Melyikre gondoltál?')
      }
    }
  }
})

</script>
