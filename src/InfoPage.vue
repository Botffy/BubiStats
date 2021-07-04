<template>
  <section class="hero is-small">
    <div class="hero-body">
      <p class="title">
        Mi ez, mire jó?
      </p>
      <p>
        A <a href='https://molbubi.hu/'>BuBi a budapesti közbringarendszer</a>, 2021-es megújulása óta
        jó alternatívája a tömegközlekedésnek, autózásnak a tágan vett belvárosban.
      </p>

      <p>
        Ebben az appban nyilvántarthatod a bubis útjaidat, hogy érdekes statisztikákat ismerhess meg a bubizásodról.
        Vajon melyik bringát használtad a legtöbbet?
        Melyik állomást érintetted a legtöbbször?
        Hány bringával mentél összesen?
      </p>
    </div>

    <div class="hero-body">
      <p class="title">
        Hogy működik?
      </p>
      <p>
        A BuBi appból nem lehet automatikusan kinyerni a felhasználói előzményeket, ezért neked kell az útjaid adatait kézzel bevinni - de nyugi, ez egész fájdalommentes.
      </p>
    </div>

    <div class="hero-body">
      <p class="title">
        Ennyi az egész?
      </p>
      <p>
        Egyelőre igen.
        De tervezzük, hogy megcsináljuk a Strava integrációt, ami lehetővé teszi majd, hogy a Stravára feltett bubizásaidat automatikusan megjelöljük, ami elég menő.
      </p>
    </div>

    <div class="hero-body">
      <p class="title">
        Ingyen van? Biztonságos? Ki csinálja?
      </p>
        Ingyen van és biztonságos.
        Olvasd el az <router-link :to="{ path: '/privacy' }">adatkezelési tájékoztatónkat</router-link>.
        A lényeg az, hogy az adataidat titkosítva tároljuk, harmadik félnek nem adjuk át.
      <p>
      </p>
      <p>
        A BubiStatot <a href="mailto:scipiades.armin@gmail.com">Scipiades Ármin</a> készítette, mert akart egy ilyent.
        Ha kérdésed vagy kívánságod van, nyugodtan írj neki, örülni fog.
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
})
</script>
