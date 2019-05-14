<template lang="pug">
.menu
  .menu-title
    .input
      label Note
      input.sub-menu-input(type="text", :value="entry.note", @input="inputNoteUpdated")
    button.small.not-important.danger(@click="$emit('deleted')")
      font-awesome-icon(:icon="['far', 'trash-alt']")
      | &nbsp;Remove
  .input
    label Price
    .input-row
      span.branding-font.left ฿
      input(type="number", min=0, :value="entry.amount", @input="inputAmountUpdated")
  .input
    label Who joined this menu?
    PeopleChooserVertical(
      :peopleNames="peopleNames",
      :selected="entry.people",
      :options="{initMode: 'select', allowedModes: ['select'], showControl: true}",
      @updated="peopleListSubMenuUpdated($event)")
</template>

<script>
import PeopleChooserVertical from '@/components/PeopleChooserVertical'

export default {
  methods: {
    inputNoteUpdated ($event) {
      const newEntry = this.entry
      newEntry.note = $event.target.value
      this.$emit('updated', newEntry)
    },
    inputAmountUpdated ($event) {
      const newEntry = this.entry
      newEntry.amount = $event.target.value
      this.$emit('updated', newEntry)
    },
    peopleListSubMenuUpdated (eventObj) {
      const newEntry = this.entry
      newEntry.people = eventObj.selected
      this.$emit('updated', newEntry)
    }
  },
  props: ['peopleNames', 'entry'],
  components: {
    PeopleChooserVertical
  }
}
</script>

<style lang="scss">
@import '../_variables.scss';

.menu {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid darken($subtle-white, 8);
  margin-bottom: 8px;
  .menu-title {
    display: flex;
    justify-content: space-between;
  }
}
</style>
