<template>
  <div class="columns">
    <div class='column is-3'>
      <div class='box'>
        <screenshot-upload />
        <hr />
        <ride-form />
      </div>
    </div>
    <div class="column">
      <ride-list
        v-if="rides.length > 0"
        :rides='rides'
      />
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
import HasRides from './HasRides'
import RideForm from './RideForm.vue'
import AddByScreenshot from './RideFormByScreenshot.vue'
import UndrawIconContent from './assets/undraw_icons/content.svg'

export default Vue.extend({
  metaInfo: {
    title: 'Bérlések'
  },
  components: {
    'ride-form': RideForm,
    'ride-list': () => import('./RidesListing.vue'),
    'screenshot-upload': AddByScreenshot
  },
  mixins: [ HasRides ],
  data: function() {
    return {
      icons: { UndrawIconContent }
    }
  },
})
</script>
