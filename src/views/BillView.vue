<template lang="pug">
#bill-view
  AccountsDisplay(
    @close="dialog.active = false",
    :request="gimme",
    :userinfo="myInfo",
    :active="dialog.active"
  )
  BillSmallDisplay(:bill="bill")
  hr.mt-0.mb-16
  template(v-if="validationResult")
    .by-group
      .group-summary(v-for="(groupElm, i) in result.info.groupBasedPriority")
        .group-entries
          span.group-entry-note {{groupEntriesNameRender(groupElm)}}
        .amount-sum
          span.group-entry-each {{groupEntriesAmountRender(groupElm)}}
        .names
          .one-person(v-for="person in result.people.filter((person) => person.group === groupElm.group && bill.peopleNames[person.peopleKey] !== '')")
            .person-summary
              | {{bill.peopleNames[person.peopleKey] | name}}
            .pay-to(v-if="result.people[person.peopleKey].payTo.filter(elm => elm !== -1).length > 0")
              | Pay to
              |
              template(v-for="(payTo, paytoPeopleKey) in result.people[person.peopleKey].payTo")
                span.payment-each(v-if="payTo !== -1")
                  span.name {{bill.peopleNames[paytoPeopleKey] | name}}
                  |
                  | for
                  |
                  span.amount {{payTo | money}}
                  | &nbsp;
                  button.btn-inline.small.not-important(
                    v-if="bill.peopleNames[paytoPeopleKey] === '$'",
                    @click="prepareShowQR($event, bill.peopleNames[person.peopleKey], bill.peopleNames[paytoPeopleKey], groupElm, payTo)"
                  ) Show QR
            .pay-to.no-need-to-pay(v-else)
              | No need to pay (already paid)
  template(v-else)
    .insuff-data
      | Some data is missing, edit to view the result. Possibly from:
      ul
        li Total paid is not filled
        li No payer(s) in this bill
        li Total paid amount is less than the sum of menus
  hr.mt-8
  .page-control
    .btn-flex
      button.danger.mb-0(@click="deleteThisBill()") Delete
      button.block.mb-0(@click="navigateToEdit()") Edit
  hr
  .page-control
    .btn-flex
      button.block.primary(@click="$router.push({name: 'split'})") Close
</template>

<script>
import dayjs from 'dayjs'
import Cal from '@/calculator.js'

import store from '@/store'

import BillSmallDisplay from '@/components/BillSmallDisplay'
import AccountsDisplay from '@/components/AccountsDisplay'

export default {
  data: () => ({
    dialog: {
      active: false
    },
    gimme: {
      amount: 0,
      note: ''
    },
    bill: {
      note: 'New Bill',
      amount: '',
      peopleNames: ['$'],
      numsOfPeople: -1,
      datetime: {
        created: ''
      },
      payers: [],
      entries: []
    },
    result: {
      changeFromStore: [],
      people: [],
      info: {
        groupBasedPriority: []
      }
    },
    validationResult: false
  }),
  computed: {
    myInfo () {
      return this.$store.state.userinfo
    }
  },
  filters: {
    money (amount) {
      var text = amount.toString()
      var index = text.indexOf('.')
      const precision = (index == -1) ? 0 : (text.length - index - 1) // https://stackoverflow.com/a/53739569
      if (precision > 3) return `฿${amount.toFixed(2)}`
      else return `฿${amount}`
    },
    name (name) {
      if (name === '$') return `${store.state.userinfo.name} (me)`
      return name
    },
    date (input) {
      const day = dayjs(input)
      // return `${dayjs(input).from(dayjs())} (${dayjs(input).format('MMM D, YYYY [at] HH:mm')})`
      return `${dayjs(input).format('MMM D, YYYY [at] HH:mm')}`
    }
  },
  created () {
    this.bill = this.$store.getters.bills[this.$route.params.index]
    console.log(this.bill)
    this.validationResult = Cal.validate(this.bill)
    if (this.validationResult) this.result = Cal.calculate(this.bill)
    console.log(this.result)
  },
  methods: {
    groupEntriesNameRender (groupElm) {
      let entries = this.result.info.groupInfo[groupElm.group].entries
      entries = entries.filter((elm, i) => !(i === 0 && elm.amount === 0))
      entries = entries.map((elm) => elm.note)
      const notes = entries.join(' + ')
      return notes
    },
    groupEntriesAmountRender (groupElm) {
      let entries = this.result.info.groupInfo[groupElm.group].entries
      entries = entries.filter((elm, i) => !(i === 0 && elm.amount === 0))
      let result = ''
      let sum = 0
      entries.forEach((elm, i) => {
        result += `${this.filterMoney(elm.amount)}÷${elm.people.length}`
        if (i !== entries.length - 1) result += ' + '
        sum += elm.amount / elm.people.length
      })
      result += ` = ${this.filterMoney(sum)}`
      return result
    },
    filterMoney (amount) {
      var text = amount.toString()
      var index = text.indexOf('.')
      const precision = (index == -1) ? 0 : (text.length - index - 1) // https://stackoverflow.com/a/53739569
      if (precision > 3) return `฿${amount.toFixed(2)}`
      else return `฿${amount}`
    },
    prepareShowQR ($event, name, payto, groupElm, amount) {
      this.gimme = {
        amount: parseFloat(amount.toString()).toFixed(2),
        note: `${this.bill.note} - for ${name} (${this.groupEntriesNameRender(groupElm)})`
      }
      this.dialog.active = true;
    },
    deleteThisBill () {
      if (confirm('Are you sure to delete this entry? This change cannot be undone!')) {
        const bills = this.$store.getters.bills
        bills.splice(this.$route.params.index, 1)
        this.$store.dispatch('updateBills', bills)
        this.$router.replace({
          path: '/split'
        })
      }
    },
    navigateToEdit () {
      this.$router.push({
        path: `/bill/edit/${this.$route.params.index}`
      })
    }
  },
  components: {
    BillSmallDisplay,
    AccountsDisplay
  }
}
</script>

<style lang="scss">
@import '../_variables.scss';

#bill-view {
  .bill-small-display {
    border: none;
  }
  .insuff-data {
    padding: 16px;
    font-size: 14px;
    color: $subtle-grey;
    font-family: $branding-font;
    ul {
      padding-left: 24px;
      margin-bottom: 0;
    }
    li {
      color: $subtle-grey;
    }
  }
  hr {
    border: none;
    border-top: 2px dashed rgba(#000000, 0.1);
    margin: 24px 0;
  }
  .by-group {
    padding: 8px;
    .group-summary {
      padding: 12px;
      padding-bottom: 0;
      margin-bottom: 8px;
      border-radius: 6px;
      border: 1px dashed darken($subtle-white, 16);
      background: linear-gradient(90% #fff, #fafafa);
      .group-entries {
        font-size: 14px;
        font-family: $branding-font;
      }
      .amount-sum {
        font-size: 11px;
        font-family: $branding-font;
        margin-bottom: 8px;
        span {
          color: lighten($subtle-grey, 8);
        }
      }
      .names {
        .one-person {
          margin-bottom: 12px;
        }
        .person-summary {
          font-size: 16px;
          font-weight: 700;
          font-family: $branding-font;
          color: darken($branding-color, 8);
          border-bottom: 2px solid darken($subtle-white, 8);
          display: inline-block;
          padding: 4px 8px;
          background: darken($subtle-white, 8);
          border-radius: 6px 6px 0 0;
        }
        .pay-to {
          border-left: 2px solid darken($subtle-white, 8);
          font-size: 14px;
          font-family: $branding-font;
          padding-left: 6px;
          min-height: 18px;
          .payment-each::after {
            content: ', ';
          }
          .payment-each:last-child::after {
            content: '';
          }
          .name, .amount {
            font-size: 16px;
            font-weight: 700;
            border-bottom: 1px solid $subtle-grey;
          }
        }
        .no-need-to-pay {
          color: darken($subtle-white, 24);
          line-height: 18px;
        }
      }
    }
  }
  .page-control {
    padding: 0 8px;
  }
}
</style>
