<template lang="pug">
.bill-container(:class="{'is-editing': viewStatus === 'editing', 'is-new': viewStatus === 'new', 'is-view': viewStatus === 'simple' || viewStatus === 'detailed', 'is-simple': viewStatus === 'simple', 'is-detailed': viewStatus === 'detailed'}")
  .bill
    .view
      .simple {{result}}
      .detailed
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
        h5.mt-32.mb-8(v-if="Object.keys(bill.payers).length > 0") How much?
        .input.input-flex(v-for="amount, key in bill.payers", :key="key + '-paid-amount'")
          label
            | {{bill.peopleNames[key].replace('$', $store.state.userinfo.name)}}
            small(v-if="bill.peopleNames[key].includes('$')")  (me)
            br
            small paid
          .input-row
            span.branding-font.left ฿
            input(type="number", v-model.number="bill.payers[key]")
            button(v-if="Object.keys(bill.payers).length === 1", style="flex-shrink: 0", @click="bill.payers[key] = bill.amount") All
        //- .msg.warning(v-if="totalPaidSum() < bill.amount && Object.keys(bill.payers).length !== 0")
          | It looks like it doesn't add up to the amount that you paid to the store
        .msg.warning(v-if="Object.keys(bill.payers).filter((elm) => bill.payers[elm] === 0).length > 0")
          | The list is intended only for people who paid to the store directly. Consider remove the people who didn't paid directly (paid 0).
          //- button Remove people who didn't paid to the store directly
      hr
      .non-shared-menu(:class="{'is-disabled': process.people !== bill.numsOfPeople || totalPaidSum() < bill.amount || Object.keys(bill.payers).length === 0}")
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
        button.block.mb-16(@click="saveAndClose()", v-if="process.people !== bill.numsOfPeople || totalPaidSum() < bill.amount || Object.keys(bill.payers).length === 0") Save
        button.block.mb-16.primary(@click="saveAndShow()", v-else) Save & Show Summary
</template>

<script>
import PeopleChooser from '@/components/PeopleChooser'
import Cal from '../calculator.js'

export default {
  data: () => ({
    result: {},
    process: {
      people: '',
      peopleSelected: []
    },
  }),
  created () {
    this.updatePayer(this.process.peopleSelected)
  },
  watch: {
    viewStatus () {
      this.viewChangedHandler()
    },
    bill: {
      handler () {
        if (Cal.validate(this.bill)) {
          console.log(JSON.stringify(this.bill))
          this.result = Cal.calculate(this.bill)
        } else {
          this.result = {}
        }
      },
      deep: true
    }
  },
  methods: {
    viewChangedHandler () {
      if (this.viewStatus === 'simple' || this.viewStatus === 'detailed') {
        if (Cal.validate(this.bill)) { // validate passed
          this.result = Cal.calculate(this.bill);
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
      console.log([].concat(this.$store.state.bills).concat([this.bill]));
      console.log(JSON.stringify(this.bill));
      this.$store.dispatch('updateBills', [].concat(this.$store.state.bills).concat([this.bill]))
      console.log(JSON.stringify(this.$store.state.bills[this.$store.state.bills.length - 1]));
    },
    totalPaidSum () {
      let sum = 0
      Object.keys(this.bill.payers).forEach((key) => {
        if (sum !== undefined || sum !== '') sum += parseFloat(this.bill.payers[key])
      })
      if (isNaN(sum)) sum = -1
      return sum
    },
    createNewBill () {
      if (this.bill.amount.toString().length === 0) return
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
      const newPayers = {}
      selected.forEach((key) => {
        if (Object.keys(this.bill.payers).map(x => parseInt(x, 10)).indexOf(key) !== -1) {
          newPayers[key] = this.bill.payers[key]
        } else {
          newPayers[key] = ''
        }
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

.bill-container.is-view {
  .view { display: block; }
  .new-bill { display: none; }
  .summary { display: none; }
  .editor { display: none; }
  .summary { display: none; }
  &.is-simple {
    .view .simple { display: block; }
    .view .detailed { display: none; }
  }
  &.is-detailed {
    .view .simple { display: block; }
    .view .detailed { display: block; }
  }
}

.bill-container.is-new {
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
      hr {
        border: none;
        border-top: 2px dashed rgba(#000000, 0.15);
        margin: 48px 0;
        // box-shadow: 0 2px 8px 2px rgba(#000000, 0.1);
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
