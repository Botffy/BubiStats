<template>
  <div v-if="$root.isLoggedIn">
    <div class="block">
      <section class="hero is-link">
        <div class="hero-body">
          <p class="title">
            Adatok letöltése
          </p>

          <p>A BubiStats a te adataidat tárolja. Jogod van ezeket az adatokat letölteni, és azt csinálni velük, amit akarsz.</p>

          <p class="mt-5 has-text-centered	">
            <b-button
              size='is-medium'
              inverted
              outlined
              icon-left="download"
              @click='downloadData'
            >
              Letöltés JSON formátumban
            </b-button>
          </p>
        </div>
      </section>
    </div>

    <div class="block">
      <section class="hero is-danger">
        <div class="hero-body">
          <p class="title">
            Felhasználói fiók törlése
          </p>

          <p class="mt-5 has-text-centered	">
            <b-button
              size='is-medium'
              inverted
              outlined
              icon-left="ban"
              @click='deleteAccount'
            >
              Törlés
            </b-button>
          </p>
        </div>
      </section>
    </div>
  </div>
  <info-page v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import { getAuth, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { saveAs } from 'file-saver'
import { getRides } from './ride-service'
import { getStationByCode } from './station-service'
import InfoPage from './InfoPage.vue'

export default Vue.extend({
  metaInfo: {
    title: 'Beállítások'
  },
  components: {
    'info-page': InfoPage
  },
  methods: {
    downloadData() {
      const exported = getRides().map(ride => Object({
        when: ride.when.toISO(),
        bike: ride.bike,
        from: ride.from + ' ' + getStationByCode(ride.from).name,
        to: ride.to + ' ' + getStationByCode(ride.to).name,
        duration: ride.duration.toISO()
      }))

      let blob = new Blob([JSON.stringify(exported)], { type: 'application/json;charset=utf-8' })
      saveAs(blob, `bubistats-export-${Date.now()}.json`)
    },
    deleteAccount() {
      this.$buefy.dialog.confirm({
        title: 'Felhasználói fiók törlése',
        message: 'Biztos vagy bennne, hogy <b>törölni</b> szeretnéd a fiókodat? Minden adatod el fog veszni. A törlés előtt újra be kell majd lépned.',
        confirmText: 'Igen, töröljetek ki!',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          const user = getAuth()?.currentUser
          const provider = new GoogleAuthProvider()
          reauthenticateWithPopup(user, provider)
          .then(() => deleteUser(user))
          .then(() => {
            this.$buefy.toast.open('Töröltünk! Az adataid hamarosan törlődnek.')
          }).catch((error) => {
            console.error(error)
            this.$buefy.toast.open('Nem tudtuk törölni a felhasználói fiókodat :s. Írj nekünk és megoldjuk.')
          })
        }
      })
    },
  }
})
</script>
