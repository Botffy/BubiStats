<template>
  <form action=''>
      <b-tooltip
        class="is-pulled-right"
        type="is-info"
        label="Készíts képernyőképet a bérlésről a Bubi app 'használati előzmények' oldalán. Legyen rajta a képen a kerékpár, a kezdés és a visszaadás rovat."
        multilined
      >
        <b-icon type='is-info' size="is-medium" icon="info-circle" custom-class="" />
      </b-tooltip>

      <b-field class="file" v-if="!file">
        <b-upload
          v-model="file"
          @input="onFile"
          accept="image/*"
        >
          <a class="button is-primary ">
            <b-icon icon="upload"></b-icon>
            <span>Képernyőkép</span>
          </a>
        </b-upload>
      </b-field>
      <b-field v-else>
        <a class="button is-primary" disabled>
          <b-icon icon="spinner" custom-class="fa-spin"></b-icon>
          <span>{{ stateMessage }}</span>
        </a>
      </b-field>
  </form>
</template>

<script lang="ts">
import Vue from 'vue'
import OnAddRideMixin from "./OnAddRideMixin"
import { addByScreenshot } from "./ride-service"

export default Vue.extend({
  mixins: [ OnAddRideMixin ],
  data() {
    return {
      file: null,
      stateMessage: null
    }
  },
  methods: {
    onFile() {
      addByScreenshot(this.file, this.onStateChange)
        .then(this.celebrate)
        .then(() => {
          this.onStateChange(null)
          this.file = null
        })
        .catch((error) => {
          this.onStateChange(null)
          this.file = null
          this.handleError(error)
        })
    },
    onStateChange(message: string) {
      this.stateMessage = message
    }
  }
})
</script>
