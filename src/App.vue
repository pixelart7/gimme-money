<template lang="pug">
#app
  .app-region
    .bg(:class="bgClass")
      .topbar
        a(href="https://github.com/pixelart7/gimme-money", target="_blank")
          font-awesome-icon(:icon="['fab', 'github']", size="2x")
    router-view
    Navbar(v-if="$route.name !== 'billNew' && $route.name !== 'billView' && $route.name !== 'billEdit'")
</template>

<script>
import Navbar from '@/components/Navbar'

export default {
  data: () => ({
    bgClass: {}
  }),
  methods: {
    bgChooser () {
      if (this.$route.name === 'split') this.bgClass = { 'pos-2': true }
      else if (this.$route.name === 'info') this.bgClass = { 'pos-3': true }
      else if (this.$route.name === 'billNew') this.bgClass = { 'pos-4': true }
      else this.bgClass = {}
    }
  },
  created () {
    this.bgChooser()
  },
  watch: {
    '$route' (to, from) {
      this.bgChooser()
    }
  },
  components: {
    Navbar
  }
}
</script>

<style lang="scss" src="./App.scss"></style>
