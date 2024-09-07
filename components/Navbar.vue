<template lang="pug">
.navbar
  .pusher
  nav
    router-link(to="/") Gimme
    router-link(to="/split") Split w/ Me
    router-link(to="/info") Me
</template>

<script>
export default {
}
</script>

<style lang="scss">
.navbar {
  .pusher {
    height: calc(48px + (env(safe-area-inset-bottom) / 2));
  }
  nav {
    height: calc(48px + (env(safe-area-inset-bottom) / 2));
    padding-bottom: calc((env(safe-area-inset-bottom) / 2));
    background: white;
    box-shadow: 0 -2px 8px 2px rgba(#000, 0.1);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    a {
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 92px;
      height: 56px;
      font-family: 'Roboto Mono', monospace; // TODO:
      text-decoration: none;
      font-size: 12px;
      &.router-link-exact-active {
        text-decoration: underline;
      }
    }
  }
}
</style>
