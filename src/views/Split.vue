<template lang="pug">
#split.page-region.fit-content
  h2 Split The Bill
  .msg.mb-8
    | This feature is still in beta. Found a bug, or want to drop a suggestion?
    | 
    a(style="color: #ffffff" href="https://github.com/pixelart7/gimme-money/issues", target="_blank") Open Issue on Github
  .new-bill.mb-16: button.block(@click="$router.push({ name: 'billNew' })") 🧾 Add New Bill
  .bills-container
    router-link.bill-container(v-for="(bill, i) in $store.getters.bills", :to="'/bill/view/' + i")
      BillSmallDisplay(:bill="bill")
</template>

<script>
import BillSmallDisplay from '@/components/BillSmallDisplay'

export default {
  data: () => ({
  }),
  methods: {
  },
  components: {
    BillSmallDisplay
  }
}
</script>

<style lang="scss">
@import '../_variables.scss';

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
