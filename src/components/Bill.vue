<template lang="pug">
.bill-container(:class="{'is-editing': viewStatus === 'editing', 'is-new': viewStatus === 'new', 'is-view': viewStatus === 'simple' || viewStatus === 'detailed', 'is-simple': viewStatus === 'simple', 'is-detailed': viewStatus === 'detailed'}")
  .bill
    .view
      .simple(@click="viewSimpleSectionClickHandler()")
        .title
          h4 {{bill.note}}
          h4 {{bill.amount | moneyFilter}}
        h5.date-subtext Created
        h5.date {{$dayjs(bill.datetime.created).from($dayjs())}} ({{$dayjs(bill.datetime.created).format('MMM D, YYYY [at] HH:mm')}})
      .detailed(v-if="Object.keys(result).length > 0")
        hr
        .horizontal-scroller
          .card.actions(ref="card-action"): .card-inner
            h3 Actions
            hr
            button(@click="$emit('viewChangeRequest', 'editing')") Edit
            br
            button(@click="$emit('viewChangeRequest', 'delete')") Delete
            br
            p Export to JSON
            textarea(:value="JSON.stringify(bill)", style="width: 100%; height: 120px; border: 1px solid black")
          .card.summary(ref="card-summary"): .card-inner()
            //- div {{result.people}}
            .group-summary(v-for="(groupElm, i) in result.info.groupBasedPriority")
              //- h5.group-name For People who joined:
              //- div {{result.info.groupInfo}}
              hr(v-if="i !== 0 && i !== result.info.groupBasedPriority.length")
              .group-entries
                span.group-entry-note(v-for="(entry, eI) in result.info.groupInfo[groupElm.group].entries")
                  | {{entry.note}}
                  template(v-if="eI < result.info.groupInfo[groupElm.group].entries.length - 1") &nbsp;+&nbsp;
              .amount-sum
                span.group-entry-each(v-for="(entry, eI) in result.info.groupInfo[groupElm.group].entries")
                  | {{entry.amount | moneyFilter}}÷{{entry.people.length}}
                  template(v-if="eI < result.info.groupInfo[groupElm.group].entries.length - 1") &nbsp;+&nbsp;
                span.sum &nbsp;=&nbsp;{{result.info.groupInfo[groupElm.group].amount | moneyFilter}}
              .names
                template(v-for="person in result.people.filter((person) => person.group === groupElm.group && bill.peopleNames[person.peopleKey] !== '')")
                  .person-summary
                    | {{bill.peopleNames[person.peopleKey] | nameFilter($store.state.userinfo.name)}}
                  .pay-to(v-if="result.people[person.peopleKey].payTo.filter(elm => elm !== -1).length > 0")
                    | Pay to
                    |
                    template(v-for="(payTo, paytoPeopleKey) in result.people[person.peopleKey].payTo")
                      span(v-if="payTo !== -1")
                        span.name {{bill.peopleNames[paytoPeopleKey] | nameFilter($store.state.userinfo.name)}}
                        |
                        | for
                        |
                        span.amount {{payTo | moneyFilter}}&nbsp;
                  .pay-to.no-need-to-pay(v-else)
                    | No need to pay (already paid)
                .name-topic(v-if="result.people.filter((person) => person.group === groupElm.group && bill.peopleNames[person.peopleKey] === '').length > 0")
                  | The rest - {{result.people.filter((person) => person.group === groupElm.group && bill.peopleNames[person.peopleKey] === '').length}} person(s)
                template(v-for="person in result.people.filter((person) => person.group === groupElm.group && bill.peopleNames[person.peopleKey] === '')")
                  .person-summary
                  .pay-to(v-if="result.people[person.peopleKey].payTo.filter(elm => elm !== -1).length > 0")
                    | Pay to
                    |
                    template(v-for="(payTo, paytoPeopleKey) in result.people[person.peopleKey].payTo")
                      span(v-if="payTo !== -1")
                        span.name {{bill.peopleNames[paytoPeopleKey] | nameFilter($store.state.userinfo.name)}}
                        |
                        | for
                        |
                        span.amount {{payTo | moneyFilter}}
                        template(v-if="payTo !== result.people[person.peopleKey].payTo.filter(elm => elm !== -1).pop()") ,&nbsp;
                        template(v-else) &nbsp;
                    //- span each&nbsp;
                  .pay-to(v-else)
                    | No need to pay (already paid)
          .card-pusher
    .new-bill
      h3
        | New
        br
        | Bill
      form.total-container(@submit.prevent="createNewBill()")
        .input-container
          //- label Total
          .input
            .input-row
              span.branding-font.left ฿
              input(type="number", v-model.number="bill.amount")
        .input
          .button-container(:class="{'is-shown': bill.amount.toString().length > 0}")
            button(@click="createNewBill()") 🧾 Create
          label.help-text.left
            | Total paid to store amount
            br
            small (VAT, service charge, etc. included)
    .editor
      button.close-btn.small.not-important(@click="close()") 🗑 Discard
      form.new-bill-stuff(@submit.prevent="updateNumOfPeople()")
        .input.input-lg
          label Title / Note
          input(type="text", v-model="bill.note", @click="($event) => {if ($event.target.value === 'New Bill') $event.target.select();}")
        .input.input-flex.input-lg
          label Total paid
          .input-row
            span.branding-font.left ฿
            input(type="number", v-model.number="bill.amount")
        .input.input-flex.input-lg
          label
            | Number of people
            br
            small: span.help-text.left (Include you, if you join)
          .input-row.input-row-col
            input(ref="inputNumberOfPeople", type="number", v-model.number="process.people", min=1)
        button(@click="updateNumOfPeople()", v-if="(process.people !== bill.numsOfPeople)")
          template(v-if="bill.numsOfPeople === -1") Next
          template(v-else-if="process.people !== bill.numsOfPeople") Update Number of People
      hr
      .paid-to-store(ref="paidToStoreSection", :class="{'is-disabled': process.people !== bill.numsOfPeople}")
        h4.mb-0 Who paid the store?
        h5.subtext Can be more than 1
        .input
          PeopleChooser(
            :numsOfPeople="bill.numsOfPeople",
            :peopleNamesArray="bill.peopleNames",
            :selected="process.peopleSelected",
            @updated="peopleChooserPayerUpdated")
        h5.mt-32.mb-8(v-if="bill.payers.length > 0") How much?
        .input.input-flex(v-for="(person, i) in bill.payers", :key="i + '-paid-amount'")
          label
            | {{bill.peopleNames[person.person].replace('$', $store.state.userinfo.name)}}
            small(v-if="bill.peopleNames[person.person].includes('$')")  (me)
            br
            small paid
          .input-row
            span.branding-font.left ฿
            input(type="number", v-model.number="bill.payers[i].amount")
            button(v-if="bill.payers.length === 1", style="flex-shrink: 0", @click="bill.payers[i].amount = bill.amount") All
        //- .msg.warning(v-if="totalPaidSum() < bill.amount && bill.payers.length !== 0")
          | It looks like it doesn't add up to the amount that you paid to the store
        //- DEPRECRETED: .msg.warning(v-if="Object.keys(bill.payers).filter((elm) => bill.payers[elm] === 0).length > 0")
        .msg.warning(v-if="bill.payers.filter((elm) => elm === 0).length > 0")
          | The list is intended only for people who paid to the store directly. Consider remove the people who didn't paid directly (paid 0).
          //- button Remove people who didn't paid to the store directly
      hr
      .non-shared-menu
        h4.mb-0 Any menu that wasn't all shared?
        h5.subtext.mb-0 For example, drink that only some people drank, menu that only some people ate.
        h6.subtext (The price must already included in the total amount)
        .single-menu(v-for="(entry, i) in bill.entries", :key="i")
          .single-menu-title
            .input
              input(type="text", v-model="entry.note")
            button.small.not-important() Remove
          .input
            label Price
            .input-row
              span.branding-font.left ฿
              input(type="number", v-model.number="entry.amount")
          .input
            label Who joined this menu?
            PeopleChooser(
              :numsOfPeople="bill.numsOfPeople",
              :peopleNamesArray="bill.peopleNames",
              :selected="entry.people",
              @updated="peopleChooserPayerSubMenuUpdated($event, i)")
        button.add-menu-btn(@click="pushSubMenu()") + Add menu
      //- .sticky-summary
        p Summary
      hr
    .summary
        //(:class="{'is-disabled': process.people !== bill.numsOfPeople || totalPaidSum() < bill.amount || bill.payers.length === 0}")
        .msg.mb-16(v-if="totalPaidSum() < bill.amount") Your total paid ({{totalPaidSum()}}) is still under the amount of the bill ({{bill.amount}})
        button.block.mb-16(@click="saveAndClose()", v-if="process.people !== bill.numsOfPeople || totalPaidSum() < bill.amount || bill.payers.length === 0") Save
        button.block.mb-16.primary(@click="saveAndShow()", v-else) Save & Show Summary
</template>

<script>
import PeopleChooser from '@/components/PeopleChooser'
import Cal from '../calculator.js'

export default {
  data: () => ({
    result: {
      changeFromStore: [],
      people: [],
      info: {
        groupBasedPriority: []
      }
    },
    process: {
      people: '',
      peopleSelected: []
    }
  }),
  filters: {
    nameFilter (name, username) {
      if (name === '$') return `${username} (device owner)`
      return name
    },
    moneyFilter (amount) {
      var text = amount.toString()
      var index = text.indexOf('.')
      const precision = (index == -1) ? 0 : (text.length - index - 1) // https://stackoverflow.com/a/53739569
      if (precision > 3) return `฿${amount.toFixed(2)}`
      else return `฿${amount}`
    }
  },
  created () {
    // this.currentProcessHandler()
    if (this.bill.numsOfPeople !== -1) { this.process.people = this.bill.numsOfPeople }
    const ppSelected = []
    this.bill.payers.forEach((elm) => {
      ppSelected.push(elm.person)
    })
    this.process.peopleSelected = ppSelected
    this.updatePayer(this.process.peopleSelected)
  },
  watch: {
    viewStatus () {
      this.viewChangedHandler()
    },
    bill: {
      handler () {
        if (Cal.validate(this.bill)) {
          this.result = Cal.calculate(this.bill)
        } else {
          this.result = {}
        }
      },
      deep: true
    }
  },
  methods: {
    viewSimpleSectionClickHandler () {
      if (this.viewStatus === 'simple') this.$emit('viewChangeRequest', 'detailed')
      else this.$emit('viewChangeRequest', 'simple')
    },
    currentProcessHandler () {
      if (this.bill.numsOfPeople !== -1) {
        this.peopleSelected = this.bill.payers.map((elm) => elm.person)
        this.people = this.bill.numsOfPeople
        this.updatePayer(this.peopleSelected)
      }
    },
    viewChangedHandler () {
      if (this.viewStatus === 'simple' || this.viewStatus === 'detailed') {
        if (Cal.validate(this.bill)) { // validate passed
          this.result = Cal.calculate(this.bill)
        }
        if (this.viewStatus === 'detailed') {
          setTimeout(() => {
            this.$refs['card-summary'].scrollIntoView({ behavior: 'smooth' })
          }, 300)
        }
      }
    },
    saveAndShow () {
      this.saveBill()
      // SHOW
    },
    saveAndClose () {
      this.saveBill()
      // CLOSE
    },
    saveBill () {
      if (this.$vnode.key !== undefined) { // EXISTED ALREADY
        const bills = this.$store.state.bills
        bills[this.$vnode.key] = this.bill
        this.$store.dispatch('updateBills', bills)
        this.$emit('viewChangeRequest', 'reset')
      } else {
        this.$store.dispatch('updateBills', [].concat(this.$store.state.bills).concat([this.bill]))
        this.$emit('viewChangeRequest', 'reset') // WORKS ONLY ON NEW BILL
      }
    },
    totalPaidSum () {
      let sum = 0
      this.bill.payers.forEach((elm, i) => {
        sum += elm.amount
      })
      // this.bill.payers.forEach((elm, i) => {
      //   const key = elm.person
      //   if (sum !== undefined || sum !== '') sum += parseFloat(this.bill.payers[key])
      // })
      if (isNaN(sum)) sum = -1
      return sum
    },
    createNewBill () {
      if (this.bill.amount.toString().length === 0) return
      this.bill.datetime.created = this.$dayjs()
      this.$emit('viewChangeRequest', 'editing')
      this.$forceUpdate()
      setTimeout(() => { // genius
        this.$refs.inputNumberOfPeople.focus()
        this.$refs.inputNumberOfPeople.select()
      }, 1)
    },
    close () {
      this.$emit('viewChangeRequest', 'new')
    },
    peopleChooserPayerUpdated (obj) {
      this.bill.peopleNames = obj.peopleNames
      this.process.peopleSelected = obj.selected
      this.updatePayer(obj.selected)
    },
    peopleChooserPayerSubMenuUpdated (eventObj, i) {
      this.bill.peopleNames = eventObj.peopleNames
      this.bill.entries[i].people = eventObj.selected
      // this.bill.peopleNames = obj.peopleNames
    },
    updatePayer (selected) {
      const newPayers = []
      selected.forEach((key) => {
        let indexAt = -1
        this.bill.payers.forEach((elm, i) => {
          if (key === elm.person) {
            indexAt = i
          }
        })
        if (indexAt === -1) {
          newPayers.push({
            person: key,
            amount: ''
          })
        } else {
          newPayers.push(this.bill.payers[indexAt])
        }
        // // if selected's key has
        // // DEPRECRETED: if (Object.keys(this.bill.payers).map(x => parseInt(x, 10)).indexOf(key) !== -1) {
        // if (this.bill.payers.map(x => x.person).indexOf(key) !== -1) {
        //   newPayers[key] = this.bill.payers[key]
        // } else {
        //   newPayers[key] = ''
        // }
      })
      this.bill.payers = newPayers
    },
    pushSubMenu () {
      this.bill.entries.push({
        note: 'Menu',
        amount: '',
        people: []
      })
    },
    updateNumOfPeople () {
      if (this.bill.numsOfPeople === -1) {
        this.$refs.paidToStoreSection.scrollIntoView({ behavior: 'smooth' })
      }
      this.bill.numsOfPeople = this.process.people
      const newPeopleNames = [];
      [...Array(this.bill.numsOfPeople).keys()].forEach((key, i) => {
        if (this.bill.peopleNames.length > i) newPeopleNames.push(this.bill.peopleNames[i])
        else newPeopleNames.push('')
      })
      this.bill.peopleNames = newPeopleNames
    }
  },
  components: {
    PeopleChooser
  },
  props: ['bill', 'viewStatus']
}
</script>

<style lang="scss">
@import '../_variables.scss';

.bills-container {
  .bill-container {
    margin-bottom: 16px;
    .bill {
      box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.1);
    }
  }
}

.bill-container.is-view {
  bottom: -24px;
  .bill {
    margin: 0;
    width: 100%;
  }
  .view { display: block; }
  .new-bill { display: none; }
  .summary { display: none; }
  .editor { display: none; }
  .summary { display: none; }
  &.is-simple {
    .view .simple { display: block; }
    .view .detailed {
      height: 0;
      overflow-y: hidden;
    }
  }
  &.is-detailed {
    position: fixed;
    z-index: 3;
    top: 16px; right: 16px; left: 16px; bottom: 32px;
    // height: calc(100vh - 32px);
    .bill, .view {
      height: 100%;
      padding-bottom: 0;
    }
    .view {
      display: flex;
      flex-direction: column;
      .detailed {
        flex: 1;
      }
    }
    .view .simple { display: block; }
    .view .detailed {
      // overflow-y: scroll;
      display: flex;
      flex-direction: column;
      position: relative;
      .horizontal-scroller {
        overflow-y: scroll;
        position: absolute;
        bottom: 0;
        top: 32px;
        left: -32px;
        right: -32px;
        flex: 1;
        display: flex;
        padding: 16px 24px;
        padding-top: 4px;
        scroll-snap-type: x mandatory;
        .card {
          scroll-snap-align: center;
          flex-shrink: 0;
          width: calc(100vw - 40px);
          height: 100%;
          display: inline-flex;
          padding: 8px;
          .card-inner {
            width: 100%;
            height: 100%;
            box-shadow: 0 2px 8px 2px rgba(#000000, 0.15);
            background: #ffffff;
            border-radius: 6px;
            padding: 20px 16px 16px 16px;
            overflow-y: scroll;
          }
        }
        .card-pusher {
          flex-shrink: 0;
          display: inline-flex;
          width: 24px;
          height: 100%;
        }
      }
    }
  }
}

.bill .view {
  .simple {
    h4, h5 { margin: 0; }
    h4 { margin-top: 8px; margin-bottom: 8px; }
    h5.date-subtext {
      margin-bottom: 0px;
      font-weight: 400;
      color: $subtle-grey;
    }
    h5.date {
      margin-bottom: 4px;
      font-weight: 400;
    }
    .title {
      display: flex;
      justify-content: space-between;
    }
  }
  .detailed {
    .group-summary {
      margin-bottom: 12px;
      .group-name {
        margin: 0;
        margin-bottom: 4px;
        color: lighten($subtle-grey, 24);
      }
      .group-entries {
        font-size: 14px;
      }
      .amount-sum {
        font-size: 12px;
        font-family: $branding-font;
        margin-bottom: 4px;
      }
      .pay-to {
        margin-bottom: 4px;
        border-left: 2px solid lighten($subtle-grey, 24);
        padding-left: 6px;
        .name {
          font-weight: 600;
        }
        .amount {
          font-weight: 600;
          font-size: 20px;
        }
      }
      .person-summary, .name-topic {
        font-size: 16px;
        font-weight: 700;
      }
      .no-need-to-pay {
        color: lighten($subtle-grey, 16);
      }
    }
  }
}

.bill-container.is-new {
  .bill {
    position: fixed;
    bottom: 56px;
    margin-top: 200vh;
  }
  .view { display: none; }
  .new-bill { display: flex; }
  .summary { display: none; }
  .editor { display: none; }
  .summary { display: none; }
}

.bill-container.is-editing {
  .view { display: none; }
  .new-bill { display: none; }
  .summary { display: block; }
  .editor { display: block; }
  .summary { display: block; }
}

.bill {
  box-shadow: 0 8px 8px 0 rgba(#000000, 0.25);
  // border-radius: 6px 6px 0 0;
  border: 1px solid rgba(#000000, 0.1);
  border-top: 2px dashed rgba(#000000, 0.05);
  padding: 12px;
  background: #ffffff;
  position: relative;
  bottom: -1px;
  margin: 0 -12px;
  width: calc(100vw - 8px);
  transition: all 0.25s, margin 0s;
  .editor { display: none;}
  .new-bill {
    display: flex;
  }
  h3 {
    margin: 0;
    margin-right: 8px;
    align-self: center;
  }
  .total-container {
    flex: 1;
    .help-text {
      display: block;
      margin-top: 4px;
    }
    .input {
      margin: 0;
      position: relative;
      .button-container {
        display: none;
        position: absolute;
        width: 100%;
        padding: 4px 0;
        background: #ffffff;
        text-align: right;
        &.is-shown {
          display: block;
        }
      }
    }
  }
  .input-container {
    display: flex;
    align-items: center;
    flex: 1;
    label {
      margin-right: 8px;
      flex-shrink: 0;
    }
    .input {
      flex: 1;
      .input-row input { flex: 1; }
    }
  }
}

.single-menu {
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid rgba($subtle-grey, 0.15);
  margin-bottom: 16px;
  .single-menu-title {
    display: flex;
    height: 64px;
    align-items: center;
    justify-content: space-between;
    .input { margin-bottom: 0; }
    .input {
      flex: 1;
      margin: 0;
      margin-right: 4px;
      max-width: 128px;
    }
  }
}

.bill-container {
  hr {
    border: none;
    border-top: 2px dashed rgba(#000000, 0.15);
    margin: 48px 0;
    // box-shadow: 0 2px 8px 2px rgba(#000000, 0.1);
  }
  &.is-view {
    hr { margin: 16px 0; }
  }
  &.is-editing {
    position: fixed;
    z-index: 3;
    overflow-y: scroll;
    top: 0; right: 0; left: 0; bottom: 0;
    .editor {
      position: relative;
      .close-btn {
        position: absolute;
        right: 0px;
        top: -88px;
      }
    }
    .bill {
      border-top: 4px dashed rgba(#000000, 0.15);
      box-shadow: 0 0 96px 64px rgba(#000, 0.35);
      left: 4px;
      right: 4px;
      bottom: -55px;
      margin: 0;
      margin-top: 30vh;
      min-height: 60vh;
      padding-top: 36px;
      padding-bottom: 36px;
    }
  }
}

.sticky-summary {
  background: greenyellow;
  margin: 0 -12px;
  position: sticky;
  bottom: 0;
  margin-top: 36px;
}

.summary {

}

.non-shared-menu, .paid-to-store {
  opacity: 1;
  &.is-disabled {
    opacity: 0.15;
    pointer-events: none;
  }
}
</style>
