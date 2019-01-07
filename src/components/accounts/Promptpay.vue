<template lang="pug">
.promptpay
  .header: h3 PromptPay
  QRCodeVue.qrcode(:value="qrstring", size="420")
  .footer
    h4.name {{this.id}}
    h4.amount ฿{{this.amount}}
</template>

<script>
import QRPromptpay from 'promptpay-qr'
import QRCodeVue from 'qrcode.vue'

export default {
  data: () => ({
    qrstring: ''
  }),
  created () {
    this.generateQRString()
  },
  watch: {
    amount () {
      this.generateQRString()
    },
    id () {
      this.generateQRString()
    }
  },
  methods: {
    generateQRString () {
      const qrstring = QRPromptpay(this.id, { amount: this.amount })
      this.qrstring = qrstring
    }
  },
  props: ['amount', 'id'],
  components: {
    QRCodeVue
  }
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
    }
  }
}
</style>
