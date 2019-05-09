<template lang="pug">
#gimme.page-region.fit-content
  AccountsDisplay(@close="dialog.active = false", :request="gimme", :userinfo="userinfo", :active="dialog.active", :upsideDown="dialog.upsideDown")
  .username-row
    h3.username {{userinfo.name}}
    button.small.not-important(@click="$router.push('/info')") Edit
  h2.mt-0 Requesting
  form(@submit.prevent="attemptFormSubmit")
    .input
      label Amount
      .input-row
        span.branding-font.left ฿
        input(type="number", v-model.number="gimme.amount", @input="updateGimme", @click="$event.target.select()")
    .input
      label Note
      input(type="text", maxlength="50", v-model="gimme.note", @input="updateGimme", @click="$event.target.select()")
      span.help-text {{gimme.note.length}}/50
    .submission.btn-inline
      button(@click="showUpsidedown()") 💁‍♂️ For Show
      button(@click="show()") 📷 For Screenshot
</template>

<script>
import AccountsDisplay from '@/components/AccountsDisplay'

export default {
  data: () => ({
    dialog: {
      active: false,
      upsideDown: false
    }
  }),
  computed: {
    gimme () {
      return this.$store.state.gimme
    },
    userinfo () {
      return this.$store.state.userinfo
    }
  },
  methods: {
    updateGimme () {
      this.$store.dispatch('updateGimme', this.gimme)
    },
    show () {
      this.dialog.upsideDown = false
      this.dialog.active = true
    },
    showUpsidedown () {
      this.dialog.upsideDown = true
      this.dialog.active = true
    },
    attemptFormSubmit () {
      document.activeElement.blur()
    }
  },
  components: {
    AccountsDisplay
  }
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
