<template>
  <section class="hero is-small">
    <div class="hero-body">
      <p class="title">
        Mi ez, mire jó?
      </p>
      <div class="content">
        <p>
          A <a href='https://molbubi.hu/'>Bubi a budapesti közbringarendszer</a>, 2021-es megújulása óta
          jó alternatívája a tömegközlekedésnek, autózásnak a tágan vett belvárosban.
        </p>

        <p>
          A BubiStats alkalmazásban nyilvántarthatod a bubis útjaidat, hogy érdekes statisztikákat ismerhess meg a bubizásodról.
          <ul>
            <li>Vajon melyik bringát használtad a legtöbbet?</li>
            <li>Melyik állomást érintetted a legtöbbször?</li>
            <li>Hány bringával mentél összesen?</li>
            <li>Hány egymást követő napon használtad a Bubit?</li>
          </ul>
        </p>
      </div>
    </div>

    <div class="hero-box">
      <b-carousel-list
        :data="screenshots"
        :items-to-show="4"
        :has-drag="false"
        icon-size='is-large'
      >
        <template
          slot="item"
          slot-scope="props"
        >
          <div class="block">
            <div class="box">
              <img
                :src="props.list.image"
                @click="enlargeImage(props.list.image)"
              />
            </div>
          </div>
        </template>
      </b-carousel-list>
      <b-modal v-model="isImageModalActive">
        <div class='box'>
          <p class="image">
            <img :src="selectedImage" />
          </p>
        </div>
      </b-modal>
    </div>

    <div class="hero-body">
      <p class="title">
        Hogy működik?
      </p>
      <div class="content">
        <p>
          A Bubi appból nem lehet automatikusan kinyerni a felhasználói előzményeket, ezért neked kell az útjaid adatait bevinni.
          Az adatokat megadhatod egy űrlapon, ami persze kicsit kényelmetlen, ezért van egy másik lehetőség is: csinálj a Bubi appban a bérlés adatairól képernyőmentést, és töltsd fel, mi szövegfelismeréssel automatikusan kinyerjük a megfelelő adatokat.
          <a
            href="https://youtu.be/wZxY_1l9c3I"
            target="_blank"
          >
            Ezen a videón
          </a>
          megnézheted, hogyan működik ez mobilon.
        </p>
      </div>
    </div>

    <div class="hero-body">
      <p class="title">
        Ennyi az egész?
      </p>
      <div class="content">
        <p>
          Sok tervünk van, igyekszünk gyorsan fejleszteni az applikációt.
        </p>
        <p>
          A távlati terv, hogy megcsináljuk a Strava integrációt, ami lehetővé teszi majd, hogy a Stravára feltett bubizásaidat automatikusan megjelöljük, ami elég menő.
        </p>
      </div>
    </div>

    <div class="hero-body">
      <p class="title">
        Ingyen van? Biztonságos? Ki csinálja?
      </p>
      <div class="content">
        <p>
          Ingyen van és biztonságos.
          Olvasd el az
          <router-link :to="{ path: '/privacy' }">
            adatkezelési tájékoztatónkat
          </router-link>.
          A lényeg az, hogy az adataidat titkosítva tároljuk, harmadik félnek nem adjuk át.
        </p>
        <p>
          A BubiStatsot <a href="https://github.com/Botffy" target="_blank">Scipiades Ármin</a> készítette, mert akart egy ilyent.
          Ha kérdésed vagy kívánságod van, nyugodtan <a href='mailto:armin@bubistats.hu'>írj neki az armin@bubistats.hu címre</a>, örülni fog.
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import ScreenRides from './assets/screenshots/01_rides.png'
import ScreenBikes from './assets/screenshots/02_bikes.png'
import ScreenStations from './assets/screenshots/03_stations.png'
import ScreenTime1 from './assets/screenshots/04_time_1.png'
import ScreenTime2 from './assets/screenshots/05_time_2.png'


export default Vue.extend({
  data() {
    return {
      'isImageModalActive': false,
      'selectedImage': null,
      'screenshots': [
        {
          image: ScreenRides
        },
        {
          image: ScreenBikes
        },
        {
          image: ScreenStations
        },
        {
          image: ScreenTime1
        },
        {
          image: ScreenTime2
        }
      ]
    }
  },
  methods: {
    enlargeImage(image: string) {
      this.selectedImage = image
      this.isImageModalActive = true
    }
  }
})
</script>
