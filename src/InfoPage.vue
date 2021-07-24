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
          Ebben az appban nyilvántarthatod a bubis útjaidat, hogy érdekes statisztikákat ismerhess meg a bubizásodról.
          <ul>
            <li>Vajon melyik bringát használtad a legtöbbet?</li>
            <li>Melyik állomást érintetted a legtöbbször?</li>
            <li>Hány bringával mentél összesen?</li>
            <li>Hány egymást követő napon használtad a Bubit?</li>
          </ul>
        </p>
      </div>
    </div>

    <div class="hero-body">
      <p class="title">
        Hogy működik?
      </p>
      <div class="content">
        <p>
          A BuBi appból nem lehet automatikusan kinyerni a felhasználói előzményeket, ezért neked kell az útjaid adatait kézzel bevinni - de nyugi, ez egész fájdalommentes.
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
          Olvasd el az <router-link :to="{ path: '/privacy' }">adatkezelési tájékoztatónkat</router-link>.
          A lényeg az, hogy az adataidat titkosítva tároljuk, harmadik félnek nem adjuk át.
        </p>
        <p>
          A BubiStatot <a href="https://github.com/Botffy" target="_blank">Scipiades Ármin</a> készítette, mert akart egy ilyent.
          Ha kérdésed vagy kívánságod van, nyugodtan <a href='mailto:armin@bubistats.hu'>írj neki az armin@bubistats.hu címre</a>, örülni fog.
        </p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
})
</script>
