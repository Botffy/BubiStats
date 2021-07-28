<template>
  <div v-if="$root.isLoggedIn">
    <div class="container">
      <div v-if="rides === null">
        <b-icon
          pack="fas"
          icon="spinner"
          size="is-large"
          custom-class="fa-spin"
        />
      </div>
      <!-- <div class="columns" v-else-if='rides.length === 0'>
        <div class='column is-3'>
          <div class='box'>
            <screenshot-upload />
            <hr />
            <ride-form />
          </div>
        </div>
        <div class="column">
          <section>
            Még nem vettél fel utakat.
            Írd be kézzel az adatokat, vagy tölts fel egy képernyőképet a bérlés részleteiről (a Bubi appban a "Használati előzmények" menüpont alatt keresd)
          </section>
        </div>
      </div> -->
      <router-view :rides='this.rides' v-else></router-view>
    </div>
  </div>
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import RideForm from './RideForm.vue'
import AddByScreenshot from './RideFormByScreenshot.vue'
import InfoPage from './InfoPage.vue'
import { subscribe, unsubscribe } from './ride-service'

export default Vue.extend({
  components: {
    'info-page': InfoPage,
    'ride-form': RideForm,
    'screenshot-upload': AddByScreenshot
  },
  data() {
    return {
      subscription: null,
      rides: []
    }
  },
  created() {
    this.subscription = subscribe((rides) => {
      this.rides = rides
    })
  },
  destroyed() {
    if (this.subscription) {
      unsubscribe(this.subscription)
    }
  }
})
</script>
