<template lang="pug">
.promptpay
  .header: h3 PromptPay
  .flex.items-center.justify-center
    QRCodeVue.qrcode(:value="qrstring", size="320")
  .footer
    h4.name {{this.id}}
    h4.amount ฿{{this.amount}}
</template>

<script setup lang="ts">
import QRPromptpay from 'promptpay-qr'
import QRCodeVue from 'qrcode.vue'

const props = defineProps(['amount', 'id'])
let qrstring = ref('')

watch(() => [props.amount, props.id], () => {
  generateQRString()
}, { immediate: true })

function generateQRString() {
  qrstring.value = QRPromptpay(props.id, { amount: props.amount })
}
</script>

<style lang="scss">
.promptpay {
  width: 100%;
  border: 8px solid #0A3E68;
  border-top: none;
  .header {
    height: 56px;
    background: #0A3E68;
    display: flex;
    justify-content: center;
    align-items: center;
    h3 {
      color: #ffffff;
      font-size: 18px;
      font-weight: 400;
    }
  }
  .footer {
    padding: 24px - 8px;
    padding-top: 0px;
    display: flex;
    align-items: flex-end;
    h4 { margin: 0; }
    .name {
      flex: 1;
    }
    .amount {
      flex: 1;
      text-align: right;
      font-size: 22px;
    }
  }
  .qrcode {
    padding: 24px - 8px;
    canvas {
      width: 100% !important;
      height: auto !important;
      max-width: 220px;
      position: relative;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>
