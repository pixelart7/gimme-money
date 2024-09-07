<template lang="pug">
#gimme.page-region.fit-content
  AccountsDisplay(@close="dialog.active = false" :request="store.gimme" :userinfo="store.userinfo" :active="dialog.active" :upsideDown="dialog.upsideDown")
  .username-row
    h3.username {{store.userinfo.name}}
    button.small.not-important(@click="$router.push('/info')") Edit
  h2.mt-0.mb-2 Requesting
  form(@submit.prevent="attemptFormSubmit")
    .input
      label Amount
      .input-row
        span.branding-font.left ฿
        input(type="number" v-model.number="store.gimme.amount" @click="$event.target.select()")
    .input
      label Note
      input(type="text", maxlength="50" v-model="store.gimme.note" @click="$event.target.select()")
      span.help-text {{store.gimme.note.length}}/50
    .submission.btn-inline
      button(@click="showUpsidedown()") 💁‍♂️ For Show
      button(@click="show()") 📷 For Screenshot
</template>

<script setup lang="ts">
const dialog = ref({
  active: false,
  upsideDown: false
});

const { store } = useStore()

function show() {
  dialog.value.upsideDown = false;
  dialog.value.active = true;
}

function showUpsidedown() {
  dialog.value.upsideDown = true;
  dialog.value.active = true;
}

function attemptFormSubmit() {
  document.activeElement.blur();
}
</script>

<style lang="scss">
.username-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  margin-top: 12px;
  .username {
    margin: 0px;
    margin-right: 8px;
  }
}
</style>
