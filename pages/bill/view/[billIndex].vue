<template lang="pug">
#bill-view
  AccountsDisplay(
    @close="dialog.active = false"
    :request="gimme"
    :userinfo="store.userinfo"
    :active="dialog.active"
  )
  button.close-btn.small.not-important(@click="router.go(-1)") Close
  BillSmallDisplay(:bill="bill")
  hr.mt-0.mb-16
  template(v-if="validationResult")
    .navigator
      h4.mt-0.mb-16 Jump to:
      button.stealth.block.text-align-left(@click="scrollTo('.by-menu')") - Menu Summary
      button.stealth.block.text-align-left(@click="scrollTo('.scroll-point-for-by-payer')") - Payer(s) & Change
      button.stealth.block.text-align-left(@click="scrollTo('.scroll-point-for-by-group')") - Separated by Group
    //- .section-separator
    .by-menu
      h4.section-title 
        | Menu Summary
        | 
        button.small.not-important.stealth(@click="scrollTo('body')")
          //- font-awesome-icon(icon="caret-up") // TODO:
          |
          | top
      .section-title-pusher
      .single-menu(v-for="menu in bill.entries")
        .menu-detail
          .name {{menu.note}}
          .people {{menu.people.map(pKey => filterName(bill.peopleNames[pKey])).join(', ')}}
        .amount
          .sum {{filterMoney(menu.amount)}}
          .each ÷{{menu.people.length}} = {{filterMoney(menu.amount / menu.people.length)}}
      .single-menu(v-if="sumEntries() < bill.amount")
        .menu-detail
          .name Shared Menu(s)
          .people everyone
        .amount
          .sum {{filterMoney(bill.amount - sumEntries())}}
          .each ÷{{bill.peopleNames.length}} = {{(filterMoney((bill.amount - sumEntries()) / bill.peopleNames.length))}}
      .grand-total.mt-32
        h5.mb-0.text-align-right.subtext Grand Total
        h3.m-0.text-align-right {{filterMoney(bill.amount)}}
    .section-separator.scroll-point-for-by-payer
    .by-payer
      h4.section-title
        | Payer(s) & Change
        | 
        button.small.not-important.stealth(@click="scrollTo('body')")
          //- font-awesome-icon(icon="caret-up") // TODO:
          |
          | top
      .section-title-pusher
      .single-payer(v-for="payer in bill.payers")
        .payer-detail
          .name {{filterName(bill.peopleNames[payer.person])}}
        .amount
          .paid Paid {{filterMoney(payer.amount)}}
          .change(:class="{'is-important': result.changeFromStore[payer.person] !== 0}") Change: {{filterMoney(result.changeFromStore[payer.person])}}
    .section-separator.scroll-point-for-by-group
    .by-group
      h4.section-title
        | Separated by Group
        | 
        button.small.not-important.stealth(@click="scrollTo('body')")
          //- font-awesome-icon(icon="caret-up") // TODO:
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
            .person-summary(@click="determineStateSet(person.peopleKey)")
              | {{filterName(bill.peopleNames[person.peopleKey])}}
            .pay-to(v-if="result.people[person.peopleKey].payTo.filter(elm => elm !== -1).length > 0")
              | Pay to
              |
              template(v-for="(payTo, paytoPeopleKey) in result.people[person.peopleKey].payTo")
                span.payment-each(
                  v-if="payTo !== -1",
                  :class="{'qr-available': bill.peopleNames[paytoPeopleKey] === '$'}",
                  @click="determineShowQR($event, bill.peopleNames[person.peopleKey], bill.peopleNames[paytoPeopleKey], groupElm, payTo)"
                  )
                  span.name {{filterName(bill.peopleNames[paytoPeopleKey])}}
                  |
                  | for
                  |
                  span.amount {{filterMoney(payTo)}}
                  span.qr-indicator(v-if="bill.peopleNames[paytoPeopleKey] === '$'")
                    //- font-awesome-icon(icon="qrcode", size="sm") // TODO:
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

<script setup lang="ts">
const dayjs = useDayjs()

// Store
const { store } = useStore()
const route = useRoute()
const router = useRouter()

const { validate, calculate } = useGimmeCalculator()

// Data
const dialog = ref({ active: false })
const gimme = ref({ amount: 0, note: '' })

const bill = ref({
  note: 'New Bill',
  amount: '',
  peopleNames: ['$'],
  numsOfPeople: -1,
  datetime: { created: '' },
  info: { paidPeople: [] },
  payers: [],
  entries: []
})

const result = ref({
  changeFromStore: [],
  people: [],
  info: { groupBasedPriority: [] }
})

const validationResult = ref(false)

// Lifecycle hooks
onMounted(() => {
  bill.value = store.value.bills[Number(route.params.billIndex)]
  console.log(bill.value)
  validationResult.value = validate(bill.value)
  if (validationResult.value) result.value = calculate(bill.value)
  console.log(result.value)
})

// Methods
const scrollTo = (query: string) => {
  document.querySelector(query)?.scrollIntoView({ behavior: 'smooth' })
}

const sumEntries = () => {
  return bill.value.entries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0)
}

const determineStateSet = (pKey: string) => {
  console.log(pKey)
}

const groupEntriesNameRender = (groupElm: any) => {
  let entries = result.value.info.groupInfo[groupElm.group].entries
  entries = entries.filter((elm: any, i: number) => !(i === 0 && elm.amount === 0))
  entries = entries.map((elm: any) => elm.note)
  return entries.join(' + ')
}

const groupEntriesAmountRender = (groupElm: any) => {
  let entries = result.value.info.groupInfo[groupElm.group].entries
  entries = entries.filter((elm: any, i: number) => !(i === 0 && elm.amount === 0))
  let resultStr = ''
  let sum = 0
  entries.forEach((elm: any, i: number) => {
    resultStr += `${filterMoney(elm.amount)}÷${elm.people.length}`
    if (i !== entries.length - 1) resultStr += ' + '
    sum += elm.amount / elm.people.length
  })
  resultStr += ` = ${filterMoney(sum)}`
  return resultStr
}

const filterMoney = (amount: number) => {
  const text = amount.toString()
  const index = text.indexOf('.')
  const precision = (index == -1) ? 0 : (text.length - index - 1)
  if (precision > 3) return `฿${amount.toFixed(2)}`
  else return `฿${amount}`
}

const filterName = (name: string) => {
  if (name === '$') return `${store.value.userinfo.name} (me)`
  return name
}

const determineShowQR = ($event: Event, name: string, payto: string, groupElm: any, amount: number) => {
  if (payto === '$') prepareShowQR($event, name, payto, groupElm, amount)
}

const prepareShowQR = ($event: Event, name: string, payto: string, groupElm: any, amount: number) => {
  gimme.value = {
    amount: parseFloat(amount.toString()).toFixed(2),
    note: `${bill.value.note} - for ${name} (${groupEntriesNameRender(groupElm)})`
  }
  dialog.value.active = true
}

const deleteThisBill = () => {
  if (confirm('Are you sure to delete this entry? This change cannot be undone!')) {
    const bills = store.value.bills
    bills.splice(Number(route.params.billIndex), 1)
    store.value.bills = [...bills]
    router.replace({ path: '/split' })
  }
}

const navigateToEdit = () => {
  router.push({ path: `/bill/edit/${route.params.billIndex}` })
}
</script>

<style lang="scss">
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
    color: #757575;
    font-family: 'Roboto Mono', monospace;
    ul {
      padding-left: 24px;
      margin-bottom: 0;
    }
    li {
      color: #757575;
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
    background: rgba(darken(#fafafa, 4), 1);
    border-radius: 6px;
    color: darken(#757575, 4);
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
    background: lighten(#757575, 38);
  }
  .navigator {
    padding: 16px;
    margin: 8px;
    margin-bottom: 16px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid lighten(#757575, 42);
    display: inline-block;
    & > span {
      margin-bottom: 8px;
      font-family: 'Roboto Mono', monospace;
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
      font-family: 'Roboto Mono', monospace;
      margin-bottom: 12px;
      .menu-detail {
        .name {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .people {
          font-size: 12px;
          color: #757575;
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
      font-family: 'Roboto Mono', monospace;
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
          color: #757575;
          &.is-important {
            color: #2196F3;
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
      border: 1px dashed darken(#fafafa, 8);
      background: linear-gradient(90% #fff, #fafafa);
      .group-entries {
        font-size: 14px;
        font-family: 'Roboto Mono', monospace;
      }
      .amount-sum {
        font-size: 11px;
        font-family: 'Roboto Mono', monospace;
        margin-bottom: 8px;
        span {
          color: lighten(#757575, 8);
        }
      }
      .names {
        .one-person {
          margin-bottom: 12px;
        }
        .person-summary {
          font-size: 16px;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
          min-width: 48px;
          // color: darken($branding-color, 8);
          border-bottom: 2px solid darken(#fafafa, 8);
          display: inline-block;
          padding: 4px 8px;
          background: darken(#fafafa, 8);
          border-radius: 6px 6px 6px 0;
        }
        .pay-to {
          border-left: 2px solid darken(#fafafa, 8);
          font-size: 14px;
          font-family: 'Roboto Mono', monospace;
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
            border-bottom: 1px solid #757575;
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
              color: lighten(#757575, 16);
            }
          }
        }
        .no-need-to-pay {
          color: darken(#fafafa, 24);
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
  