<template lang="pug">
#bill-editor.page-region.fit-content
  .top-bar-title(style="opacity: 0.5;")
    h5 {{bill.note}}
    h6 {{bill.datetime.created | date}}
  .editor
    button.close-btn.small.not-important(@click="discard()") Discard
    h3.mb-8 {{bill.note}}
    .input
      label Title / Note
      input(type="text", v-model="bill.note", @click="selectAllIf($event, 'New Bill')")
    .input
      label People who joined
      PeopleChooserVertical(
        :peopleNames="bill.peopleNames",
        :options="{initMode: 'edit', allowedModes: ['edit'], showControl: false}",
        @updated="peopleListEditorUpdated"
        )
    hr
    .menus
      h3.mb-0 Menu List
      h5.subtext.mb-16 You may skip menu that everyone shares.
      MenuEditor(
        v-for="(entry, i) in bill.entries",
        :key="'menu-entry-' + i",
        :peopleNames="bill.peopleNames",
        :entry="entry",
        :initMode="process.menuEditorSize",
        @updated="subMenuUpdated($event, i)",
        @deleted="subMenuDeleted($event, i)"
      )
      button.block(@click="pushSubMenu()") + Add menu
      h4.mt-32.mb-0.text-align-right.subtext Sum of the listed menu
      h2.mt-0.mb-0.text-align-right = {{sumEntries() | money}}
    hr
    h3.mb-8 Bill Total
    .input
      label 'Grand Total' in Bill
      .input-row
        span.branding-font.left ฿
        input(type="number", min=0, v-model="bill.amount")
        //- button.small(style="flex-shrink: 0", @click="bill.payers[i].amount = bill.amount") I entered all menus
      span.help-text.left Final price that was paid to the store. (ie. including all menus above, all-shared menus, VAT, taxes, service charge, etc.)
    .msg.mb-8(v-if="sumEntries() < bill.amount && bill.entries.length > 0")
      | The rest of the bill ({{bill.amount - sumEntries() | money}}) will be shared among everyone.
    .msg.warning.mb-8(v-if="sumEntries() > bill.amount")
      | The total paid to store ({{bill.amount | money}}) is under the sum price of the menu ({{sumEntries() | money}}); this value should be equal or higher.
    hr
    h3.mb-8 Payer(s)
    .input
      label Who helped paid the store?
      PeopleChooserVertical(
        :peopleNames="bill.peopleNames",
        :selected="process.payersSelected",
        :options="{initMode: 'select', allowedModes: ['select'], showControl: false}",
        @updated="peopleListPayerUpdated"
        )
    h5.mt-8.mb-8(v-if="bill.payers.length > 0") How much?
    .input.input-flex(v-for="(person, i) in bill.payers", :key="i + '-paid-amount'")
      label
        | {{bill.peopleNames[person.person] | name}}
        br
        small paid
      .input-row
        span.branding-font.left ฿
        input(type="number", min=0, v-model.number="bill.payers[i].amount")
        button(v-if="bill.payers.length === 1", style="flex-shrink: 0", @click="bill.payers[i].amount = bill.amount") All
    h4.mt-32.mb-0.text-align-right.subtext Paid to store
    h2.mt-0.mb-0.text-align-right = {{sumPaid() | money}}
    hr
    .msg.warning.mb-8(v-if="sumPaid() < bill.amount && bill.payers.length > 0") Your total paid (฿{{sumPaid()}}) is under the amount of the bill (฿{{bill.amount}})
    .btn-flex
      button.not-important(@click="discard()") Discard
      button.block.primary(@click="saveAndNavigate()") Save
    //- button.block.mb-16.primary(@click="DEBUGSAVE()") Save Debug Data
</template>

<script>
import dayjs from 'dayjs'

import store from '@/store.js'

import PeopleChooserVertical from '@/components/PeopleChooserVertical'
import MenuEditor from '@/components/MenuEditor'

export default {
  data: () => ({
    process: {
      payersSelected: [],
      menuEditorSize: 'small'
    },
    bill: {
      note: 'New Bill',
      amount: '',
      peopleNames: ['$'],
      numsOfPeople: -1,
      datetime: {
        created: ''
      },
      info: {
        paidPeople: []
      },
      payers: [],
      entries: []
    }
  }),
  created () {
    if (this.$route.name === 'billNew') {
      this.process.menuEditorSize = 'big'
      this.bill.datetime.created = this.$dayjs()
    } else { // Update payersSelected from stored data
    this.process.menuEditorSize = 'small'
      this.bill = this.$store.getters.bills[this.$route.params.index]
      const ppSelected = []
      this.bill.payers.forEach((elm) => {
        ppSelected.push(elm.person)
      })
      this.process.payersSelected = ppSelected
      this.updatePayer()
    }
  },
  filters: {
    date (input) {
      const day = dayjs(input)
      // return `${dayjs(input).from(dayjs())} (${dayjs(input).format('MMM D, YYYY [at] HH:mm')})`
      return `${dayjs(input).format('MMM D, YYYY [at] HH:mm')}`
    },
    name (name) {
      if (name === '$') return `${store.state.userinfo.name} (me)`
      return name
    },
    money (amount) {
      var text = amount.toString()
      var index = text.indexOf('.')
      const precision = (index == -1) ? 0 : (text.length - index - 1) // https://stackoverflow.com/a/53739569
      if (precision > 3) return `฿${amount.toFixed(2)}`
      else return `฿${amount}`
    }
  },
  methods: {
    DEBUGSAVE () {
      const obj = JSON.parse('{"note":"2gether, May 3rd","amount":2154,"peopleNames": ["$","Art","Eynda","Son","P\'Mook","P\'Praew","P\'Turbo","Kong","Game","Anonymous","Mai"],"numsOfPeople":11,"datetime":{"created":"2019-05-12T11:17:21.672Z"},"payers":[{"person":0,"amount":2154}],"entries":[{"note":"1st pro","amount":414,"people":[0,1,2,3,4]},{"note":"2nd pro","amount":414,"people":[0,1,2,3,4,5,6,7,8,9,10]},{"note":"3rd pro","amount":414,"people":[0,1,2,3,4,5,6,7,8,9]},{"note":"4th pro","amount":414,"people":[0,1,2,3,4,5,6,7,8,9]},{"note":"Ice","amount":150,"people":[0,1,2,3,4,5,6,7,8,9,10]},{"note":"After Party","amount":348,"people":[0,1,2,3,4,6,7,8,9]}]}')
      this.$store.dispatch('updateBills', [].concat(this.$store.state.bills).concat([obj]))
      this.$router.push({ name: 'split' })
    },
    discard () {
      // TODO: better confirmation
      if (confirm('Are you sure to leave this page?')) this.$router.go(-1)
    },
    saveAndNavigate () {
      this.saveBill()
      if (this.$route.name === 'billNew') {
        const atIndex = this.$store.state.bills.length - 1
        this.$router.replace({ path: `/bill/view/${atIndex}` })
      } else {
        this.$router.replace({ path: `/bill/view/${this.$route.params.index}` })
      }
    },
    saveBill () {
      this.bill.amount = parseFloat(this.bill.amount)
      this.bill.entries.forEach((elm, i) => {
        this.bill.entries[i].amount = parseFloat(this.bill.entries[i].amount)
      })
      if (this.$route.name !== 'billNew') { // EXISTED ALREADY
        const bills = this.$store.state.bills
        bills[this.$vnode.key] = this.bill // maybe get from route
        this.$store.dispatch('updateBills', bills)
      } else {
        this.$store.dispatch('updateBills', [].concat(this.$store.state.bills).concat([this.bill]))
      }
    },
    sumEntries () {
      let sum = 0
      this.bill.entries.forEach((elm) => {
        sum += parseFloat(elm.amount)
      })
      if (isNaN(sum)) return '?'
      return sum
    },
    sumPaid () {
      let sum = 0
      this.bill.payers.forEach((elm, i) => {
        sum += parseFloat(elm.amount)
      })
      if (isNaN(sum)) return '?'
      return sum
    },
    selectAllIf ($event, text) {
      if ($event.target.value === text) $event.target.select()
    },
    selectSubMenuLastInput () {
      setTimeout(() => {
        const lastInput = document.querySelectorAll('.sub-menu-input')
        lastInput[lastInput.length - 1].focus()
      }, 1)
    },
    peopleListEditorUpdated (payload) { // No need to set selected as this allow only editing
      this.bill.peopleNames = payload.peopleNames
    },
    peopleListPayerUpdated (payload) { // No need to set name
      this.process.payersSelected = payload.selected
      this.updatePayer()
    },
    updatePayer () {
      const selected = this.process.payersSelected
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
      })
      this.bill.payers = newPayers
    },
    pushSubMenu () {
      this.bill.entries.push({
        note: '',
        amount: '',
        people: []
      })
      this.selectSubMenuLastInput()
    },
    subMenuUpdated (newEntry, i) {
      this.bill.entries[i] = newEntry
    },
    subMenuDeleted ($event, i) {
      const newEntries = this.bill.entries
      newEntries.splice(i, 1)
      this.bill.entries = newEntries
    }
  },
  components: {
    PeopleChooserVertical,
    MenuEditor
  }
}
</script>

<style lang="scss">
@import '../_variables.scss';

#bill-editor {
  position: relative;
  padding-bottom: 0;
  z-index: 2;
  .close-btn {
    position: absolute;
    right: 12px;
    top: -42px;
  }
  hr {
    border: none;
    border-top: 2px dashed rgba(#000000, 0.1);
    margin: 24px 0;
  }
  .editor {
    padding-top: 4px;
  }
  .menus .is-big:only-of-type {
    box-shadow: 0 2px 12px 0 rgba(#000000, 0.15);
  }
}
</style>
