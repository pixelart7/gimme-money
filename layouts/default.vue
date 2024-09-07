<template lang="pug">
#app
  .app-region
    .bg(:class="bgClass")
      .topbar
        a(href="https://github.com/pixelart7/gimme-money", target="_blank")
          //- font-awesome-icon(:icon="['fab', 'github']", size="2x") // TODO:
    slot
    Navbar(v-if="route.path !== '/bill/new' && route.path !== '/bill/view' && route.path !== '/bill/edit' && !route.path.startsWith('/bill/view')")
</template>

<script setup lang="ts">
interface RouteName {
  billNew: string
  billView: string
  billEdit: string
  split: string
  info: string
}

const route = useRoute()
const bgClass = computed(() => {
  if (route.path === '/split') return { 'pos-2': true }
  else if (route.path === '/info') return { 'pos-3': true }
  else if (route.path === '/bill/new') return { 'pos-4': true }
  return undefined
})
</script>

  