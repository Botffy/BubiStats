<template>
  <footer class="footer">
    <div class="content">
      <p>
        <a
          href='https://github.com/Botffy/BubiStats'
          class="has-text-black"
          target="_blank"
        >
          <span class="icon-text">
            <span class="icon">
              <i class="fab fa-github" />
            </span>
            <span>GitHub</span>
          </span>
        </a>
      </p>
      <p>
        <a
          href='https://www.instagram.com/bubistats/'
          class="has-text-black"
          target="_blank"
        >
          <span class="icon-text">
            <span class="icon">
              <i class="fab fa-instagram" />
            </span>
            <span>Instagram</span>
          </span>
        </a>
      </p>
      <p>
        <a
          href='mailto:info@bubistats.hu'
          class="has-text-black"
          target="_blank"
        >
          <span class="icon-text">
            <span class="icon">
              <i class="fas fa-envelope" />
            </span>
            <span>Kapcsolat</span>
          </span>
        </a>
      </p>
    </div>
    <nav class="level">
      <div
        class="level-item has-text-centered is-size-7"
        style="color: grey"
      >
        verzió: {{ version.version }} ({{ version.date.toFormat('yyyy-MM-dd HH:mm') }})
      </div>
    </nav>
  </footer>
</template>

<script lang="ts">
import Vue from 'vue'
import { DateTime } from 'luxon'

export default Vue.extend({
  data() {
    return {
      version: {
        version: BUBISTAT_VERSION,
        hash: BUBISTAT_COMMITHASH,
        date: DateTime.fromISO(BUBISTAT_LASTCOMMITDATETIME, { zone: 'Europe/Budapest' })
      }
    }
  }
})
</script>
