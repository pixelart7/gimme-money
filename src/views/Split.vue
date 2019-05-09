<template lang="pug">
#split.page-region.fit-content
  h2 Split The Bill
  .bills-container
    Bill(v-for="bill in $store.state.bills", :bill="bill", viewStatus="simple")
  Bill(:bill="newBillObj", :viewStatus="newBillView", @viewChangeRequest="newBillChangeView")
</template>

<script>
import Bill from '@/components/Bill'

export default {
  data: () => ({
    newBillView: 'new',
    newBillObj: {
      note: 'New Bill',
      amount: '',
      peopleNames: ['$'],
      numsOfPeople: -1,
      datetime: {
        created: '',
        edited: ''
      },
      payers: {},
      entries: []
    }
  }),
  methods: {
    newBillChangeView (viewTo) {
      this.newBillView = viewTo
    }
  },
  components: {
    Bill
  }
}
</script>

<style lang="scss">
#split {
  position: relative;
  padding-bottom: 0;
}
</style>
