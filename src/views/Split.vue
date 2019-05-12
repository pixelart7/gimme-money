<template lang="pug">
#split.page-region.fit-content
  h2 Split The Bill
  .overlay(:class="{'is-active': activeBillView !== -1}")
  Bill(v-if="activeBillEditingIndex !== -1", :bill="activeBillEditing", :key="activeBillEditingIndex", viewStatus="editing", @viewChangeRequest="editingBillChangeView($event, activeBillEditingIndex)")
  .bills-container
    template(v-for="(bill, i) in $store.getters.bills")
      Bill(:bill="bill", :key="i", :viewStatus="(activeBillView === i)? 'detailed': 'simple'", @viewChangeRequest="billChangeView($event, i)")
      .bill-pusher(:class="{'is-active': activeBillView === i}")
  .new-bill-pusher
  Bill(:bill="newBillObj", :viewStatus="newBillView", @viewChangeRequest="newBillChangeView")
</template>

<script>
import Bill from '@/components/Bill'

export default {
  data: () => ({
    activeBillView: -1,
    activeBillEditing: {},
    activeBillEditingIndex: -1,
    newBillView: 'new',
    newBillObj: {
      note: 'New Bill',
      amount: '',
      peopleNames: ['$'],
      numsOfPeople: -1,
      datetime: {
        created: ''
      },
      payers: [],
      entries: []
    }
  }),
  methods: {
    editingBillChangeView (viewTo, i) {
      if (viewTo === 'reset') {
        this.activeBillEditingIndex = -1
        this.activeBillEditing = {}
        this.activeBillView = i
      } else if (viewTo === 'new') {
        this.activeBillEditingIndex = -1
        this.activeBillEditing = {}
        this.activeBillView = i
      }
    },
    billChangeView (newView , i) {
      if (newView === 'detailed') this.activeBillView = i
      if (newView === 'simple') this.activeBillView = -1
      if (newView === 'editing') {
        this.activeBillEditingIndex = i
        this.activeBillEditing = this.$store.getters.bills[i]
        this.activeBillView = -1
      }
      if (newView === 'delete') {
        this.activeBillView = -1
        this.$store.dispatch('updateBills', this.$store.state.bills.splice(i, 1))
        this.$forceUpdate()
      }
    },
    newBillChangeView (viewTo) {
      if (viewTo === 'reset') {
        this.newBillObj = {
          note: 'New Bill',
          amount: '',
          peopleNames: ['$'],
          numsOfPeople: -1,
          datetime: {
            created: ''
          },
          payers: [],
          entries: []
        };
        this.newBillView = 'new'
      } else {
        this.newBillView = viewTo
      }
    }
  },
  components: {
    Bill
  }
}
</script>

<style lang="scss">
@import '../_variables.scss';

#split {
  position: relative;
  padding-bottom: 0;
  .new-bill-pusher {
    height: 112px;
  }
  .overlay {
    position: fixed;
    z-index: 2;
    opacity: 0;
    top: 0; right: 0; left: 0; bottom: 0;
    pointer-events: none;
    &.is-active {
      opacity: 1;
      background: rgba(#555, 1);
      pointer-events: auto;
    }
  }
  .bill-pusher {
    // background: $subtle-white;
    height: 0px;
    transition: height 0s;
    &.is-active {
      height: 112px;
    }
  }
}
</style>
