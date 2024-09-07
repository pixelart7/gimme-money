<template lang="pug">
#app
  .app-region
    .bg(:class="bgClass")
      .topbar
        a(href="https://github.com/pixelart7/gimme-money", target="_blank")
          PhGithubLogoDuotone.text-2xl
    slot
    Navbar(v-if="route.path !== '/bill/new' && route.path !== '/bill/view' && route.path !== '/bill/edit' && !route.path.startsWith('/bill/view') && !route.path.startsWith('/bill/edit')")
</template>

<script setup lang="ts">
import PhGithubLogoDuotone from '~icons/ph/github-logo-duotone'

const route = useRoute()
const bgClass = computed(() => {
  if (route.path === '/split') return { 'pos-2': true }
  else if (route.path === '/info') return { 'pos-3': true }
  else if (route.path === '/bill/new') return { 'pos-4': true }
  return undefined
})
</script>

  