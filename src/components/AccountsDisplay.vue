<template lang="pug">
.account-display
  .info
    .first-row
      h2 
        span.small Pay To
        br 
        | {{userinfo.name}}
      h2 ฿{{request.amount}}
    h4(v-if="request.note.length > 0") Note: {{request.note}}
  Promptpay(:amount="request.amount", :id="userinfo.promptpay.id")
</template>

<script>
import Promptpay from '@/components/accounts/Promptpay'

export default {
  props: ['request', 'userinfo'],
  components: {
    Promptpay
  }
}
</script>

<style lang="scss">
.account-display {
  width: 100%;
  max-height: calc(100vh - 64px);
  overflow-y: scroll;
  max-width: 420px;
  position: fixed;
  top: -100vh;
  left: 0px;
  right: 0px;
  background: #ffffff;
  transition: all 0.4s, transform 0s;
  &.is-active {
    top: 0px;
  }
  &.is-upside-down {
    transform: rotate(180deg);
  }
  .info {
    padding: 24px;
    padding-top: 18px;
    h2 {
      margin-bottom: 8px;
      span.small {
        font-size: 12px;
      }
    }
    h4 {
      opacity: 0.75;
    }
    h2, h4 {
      margin: 0;
    }
    .first-row {
      display: flex;
      align-items: center;
      h2:first-child {
        flex: 1;
      }
      h2:last-child {
        margin-top: 8px;
      }
    }
  }
}
</style>
