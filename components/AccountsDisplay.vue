<template lang="pug">
.account-display-container(:class="{'is-active': active, 'is-upside-down': upsideDown}")
  .overlay(@click="$emit('close')")
  .account-display
    .info
      .first-row
        h2.text-base
          span Pay To
          br
          span.text-2xl {{userinfo?.name}}
        h2.text-xl.mt-0 ฿{{request.amount}}
      h4(v-if="request.note.length > 0") Note: {{request.note}}
    ClientOnly
      AccountsPromptpay(:amount="parseFloat(request.amount)" :id="userinfo?.promptpay?.id")
</template>

<script setup>
defineProps({
  request: { type: Object, required: true },
  userinfo: { type: Object, required: true },
  active: { type: Boolean, required: true },
  upsideDown: { type: Boolean, default: false }
});
</script>

<style lang="scss">
.account-display-container.is-active {
  .account-display {
    top: 0px;
  }
  .overlay {
    opacity: 1;
    background: rgba(#555, 1);
    pointer-events: auto;
  }
  &.is-upside-down {
    .account-display {
      transform: rotate(180deg);
    }
  }
}

.overlay {
  position: fixed;
  z-index: 2;
  opacity: 0;
  top: 0; right: 0; left: 0; bottom: 0;
  pointer-events: none;
}

.account-display {
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  max-width: 420px;
  position: fixed;
  z-index: 3;
  top: -100vh;
  left: 0px;
  right: 0px;
  background: #ffffff;
  transition: all 0.4s, transform 0s;
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
