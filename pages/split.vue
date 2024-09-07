<template lang="pug">
#split.page-region.fit-content
  h2.mb-8 Split The Bill
  .new-bill.mb-16: button.block(@click="$router.push({ name: 'billNew' })") 🧾 Add New Bill
  .bills-container    
    NuxtLink.bill-container(v-for="(bill, i) in store.bills", :to="'/bill/view/' + i")
      BillSmallDisplay(:bill="bill")
</template>

<script setup lang="ts">
const { store } = useStore()
</script>

<style lang="scss">
#split {
  position: relative;
  padding-bottom: 0;
  .bills-container {
    display: flex;
    flex-direction: column-reverse;
    .bill-container {
      margin-bottom: 12px;
      text-decoration: none;
      .bill-small-display {
        box-shadow: 0 4px 12px 0 rgba(#000000, 0.25);
        transform: translateY(-1px);
        &:hover {
          background: darken(#ffffff, 2);
          box-shadow: 0 4px 16px 0 rgba(#000000, 0.2);
          transform: translateY(-2px);
        }
        &:active {
          box-shadow: 0 2px 2px 0 rgba(#000000, 0.15);
          transform: translateY(0px) scale(0.98);
          background: darken(#ffffff, 8);
        }
      }
    }
  }
}
</style>
