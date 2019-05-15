<template lang="pug">
#bill-view
  AccountsDisplay(
    @close="dialog.active = false",
    :request="gimme",
    :userinfo="myInfo",
    :active="dialog.active"
  )
  button.close-btn.small.not-important(@click="$router.go(-1)") Close
  BillSmallDisplay(:bill="bill")
  hr.mt-0.mb-16
  template(v-if="validationResult")
    .navigator
      h4.mt-0 Jump to:
      button(@click="scrollTo('.by-menu')") Menu Summary
      button(@click="scrollTo('.scroll-point-for-by-payer')") Payer(s) & Change
      button(@click="scrollTo('.scroll-point-for-by-group')") Separated by Group
    //- .section-separator
    .by-menu
      h4.section-title 
        | Menu Summary
        | 
        button.small.not-important.stealth(@click="scrollTo('body')")
          font-awesome-icon(icon="caret-up")
          |
          | top
      .section-title-pusher
      .single-menu(v-for="menu in bill.entries")
        .menu-detail
          .name {{menu.note}}
          .people {{menu.people.map(pKey => filterName(bill.peopleNames[pKey])).join(', ')}}
        .amount
          .sum {{menu.amount | money}}
          .each ÷{{menu.people.length}} = {{menu.amount / menu.people.length | money}}
      .single-menu(v-if="sumEntries() < bill.amount")
        .menu-detail
          .name Shared Menu(s)
          .people everyone
        .amount
          .sum {{bill.amount - sumEntries() | money}}
          .each ÷{{bill.peopleNames.length}} = {{(bill.amount - sumEntries()) / bill.peopleNames.length | money}}
      .grand-total.mt-32
        h5.mb-0.text-align-right.subtext Grand Total
        h3.m-0.text-align-right {{bill.amount | money}}
    .section-separator.scroll-point-for-by-payer
    .by-payer
      h4.section-title
        | Payer(s) & Change
        | 
        button.small.not-important.stealth(@click="scrollTo('body')")
          font-awesome-icon(icon="caret-up")
          |
          | top
      .section-title-pusher
      .single-payer(v-for="payer in bill.payers")
        .payer-detail
          .name {{bill.peopleNames[payer.person] | name}}
        .amount
          .paid Paid {{payer.amount | money}}
          .change(:class="{'is-important': result.changeFromStore[payer.person] !== 0}") Change: {{result.changeFromStore[payer.person] | money}}
    .section-separator.scroll-point-for-by-group
    .by-group
      h4.section-title
        | Separated by Group
        | 
        button.small.not-important.stealth(@click="scrollTo('body')")
          font-awesome-icon(icon="caret-up")
          |
          | top
      .section-title-pusher
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
                span.payment-each(
                  v-if="payTo !== -1",
                  :class="{'qr-available': bill.peopleNames[paytoPeopleKey] === '$'}",
                  @click="determineShowQR($event, bill.peopleNames[person.peopleKey], bill.peopleNames[paytoPeopleKey], groupElm, payTo)"
                  )
                  span.name {{bill.peopleNames[paytoPeopleKey] | name}}
                  |
                  | for
                  |
                  span.amount {{payTo | money}}
                  span.qr-indicator(v-if="bill.peopleNames[paytoPeopleKey] === '$'")
                    font-awesome-icon(icon="qrcode", size="sm")
                  //- button.btn-inline.small.not-important(
                  //-   v-if="bill.peopleNames[paytoPeopleKey] === '$'",
                  //-   @click="prepareShowQR($event, bill.peopleNames[person.peopleKey], bill.peopleNames[paytoPeopleKey], groupElm, payTo)"
                  //- ) QR
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
  .editor.page-control
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
    scrollTo (query) {
      document.querySelector(query).scrollIntoView({ behavior: 'smooth' })
    },
    sumEntries () {
      let sum = 0
      this.bill.entries.forEach((elm) => {
        sum += parseFloat(elm.amount)
      })
      return sum
    },
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
    filterName (name) {
      if (name === '$') return `${store.state.userinfo.name} (me)`
      return name
    },
    determineShowQR ($event, name, payto, groupElm, amount) {
      if (payto === '$') this.prepareShowQR($event, name, payto, groupElm, amount)
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
  position: relative;
  z-index: 2;
  .close-btn {
    position: absolute;
    right: 12px;
    top: -42px;
  }
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
  h4.section-title {
    margin-top: 0px;
    display: inline-block;
    padding: 8px;
    margin: -8px;
    // margin-bottom: 16px;
    background: rgba(darken($subtle-white, 4), 1);
    border-radius: 6px;
    color: darken($subtle-grey, 4);
    position: sticky;
    top: 8px;
    right: 0;
    // box-shadow: 0 0 0 4px rgba(#ffffff, 0.99);
    box-shadow: 0 0 0 4px rgba(#ffffff, 1), -2px -2px 0 8px rgba(#ffffff, 1);
    > button {
      margin: -2px;
      margin-left: 4px;
    }
  }
  .section-title-pusher {
    height: 24px;
  }
  .section-separator {
    height: 1px;
    margin: 16px 8px;
    background: lighten($subtle-grey, 38);
  }
  .navigator {
    padding: 16px;
    margin: 8px;
    margin-bottom: 16px;
    background: $subtle-white;
    border-radius: 6px;
    border: 1px solid lighten($subtle-grey, 42);
    & > span {
      margin-bottom: 8px;
      font-family: $branding-font;
      display: block;
    }
    button {
      display: block;
      margin-top: 8px;
    }
  }
  .by-menu {
    padding: 16px;
    .single-menu {
      display: flex;
      justify-content: space-between;
      font-family: $branding-font;
      margin-bottom: 12px;
      .menu-detail {
        .name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .people {
          font-size: 12px;
          color: $subtle-grey;
        }
      }
      .amount {
        flex-shrink: 0;
        flex-basis: 128px;
        text-align: right;
        .sum {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .each {
          font-size: 12px;
        }
      }
    }
  }
  .by-payer {
    padding: 16px;
    .single-payer {
      display: flex;
      justify-content: space-between;
      font-family: $branding-font;
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
      .payer-detail {
        flex-shrink: 0;
        flex-basis: 128px;
        font-size: 16px;
        font-weight: 700;
      }
      .amount {
        text-align: right;
        .paid {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .change {
          font-size: 14px;
          color: $subtle-grey;
          &.is-important {
            color: $branding-color;
            font-weight: 700;
          }
        }
      }
    }
  }
  .by-group {
    padding: 8px;
    padding-top: 16px;
    & > h4 {
      margin-left: 0px;
    }
    .group-summary {
      padding: 12px 8px;
      padding-bottom: 0;
      margin-bottom: 8px;
      border-radius: 6px;
      border: 1px dashed darken($subtle-white, 8);
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
          border-radius: 6px 6px 6px 0;
        }
        .pay-to {
          border-left: 2px solid darken($subtle-white, 8);
          font-size: 14px;
          font-family: $branding-font;
          padding-left: 6px;
          min-height: 18px;
          line-height: 26px;
          .payment-each::after {
            content: ', ';
          }
          .payment-each:last-child::after {
            content: '';
          }
          .qr-available {
            border-bottom: 1px solid $subtle-grey;
          }
          .name, .amount {
            font-size: 16px;
            font-weight: 700;
          }
          .qr-indicator {
            padding: 0 4px;
            margin-left: 2px;
            display: inline-flex;
            flex-direction: column;
            svg path {
              color: lighten($subtle-grey, 16);
            }
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
