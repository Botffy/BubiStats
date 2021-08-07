<template>
  <b-navbar class="is-warning">
    <template #brand>
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/' }"
      >
        <img :src="logo" />
      </b-navbar-item>
    </template>

    <template
      v-if='$root.isLoggedIn && $root.hasRides'
      #start
    >
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/' }"
      >
        Bérlések
      </b-navbar-item>
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/bikes' }"
      >
        Bicajok
      </b-navbar-item>
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/stations' }"
      >
        Állomások
      </b-navbar-item>
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/time' }"
      >
        Idő
      </b-navbar-item>
      <filter-component />
    </template>

    <template
      v-if='!$root.loading'
      #end
    >
      <b-navbar-dropdown
        v-if='$root.isLoggedIn'
        :label='$root.user.email'
      >
        <b-navbar-item
          tag="router-link"
          :to="{ path: '/settings' }"
        >
          Beállítások
        </b-navbar-item>
        <b-navbar-item tag="div">
          <div class="buttons has-text-right">
            <a
              class="button is-primary"
              @click='logout'
            >
              <strong>Kilépés</strong>
            </a>
          </div>
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item
        v-else
        tag="div"
      >
        <div class="buttons">
          <a
            class="button is-primary"
            @click='login'
          >
            <strong>Belépés</strong>
          </a>
        </div>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script lang="ts">
import Vue from 'vue'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import Logo from './assets/logos/transparent.png'

export default Vue.extend({
  components: {
    'filter-component': () => import('./FilterComponent.vue'),
  },
  data() {
    return {
      logo: Logo,
    }
  },
  methods: {
    logout() {
      signOut(getAuth())
        .then(() => {
          this.$router.push('/')
        })
        .catch((error) => {
          console.error(error)
        })
    },
    login() {
      const provider = new GoogleAuthProvider()
      let loadingScreen = this.$buefy.loading.open()
      signInWithPopup(getAuth(), provider)
        .then(() => {
          this.$router.push('/')
          loadingScreen.close()
        })
        .catch((error) => {
          loadingScreen.close()
          console.error(error)
        })
    }
  }
})
</script>
