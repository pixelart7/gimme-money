<template lang="pug">
.menu(:class="{'is-big': mode === 'big'}")
  template(v-if="mode === 'small'")
    .menu-title.summary.branding-font
      .note-and-people
        .note {{entry.note}}
        p.people
          span.person(v-for="(pKey, i) in entry.people")
            | {{peopleNames[pKey] | name}}
            template(v-if="i < entry.people.length - 1")
              | ,
              |
          |
          | joined
      .amount ฿{{entry.amount}}
  template(v-if="mode === 'big'")
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
  .control
    button.block.stealth.small(v-if="mode === 'small'", @click="mode = 'big'")
      font-awesome-icon(icon="chevron-down")
      //- | &nbsp;Expand to edit
    button.block.stealth.small(v-if="mode === 'big'", @click="mode = 'small'")
      font-awesome-icon(icon="chevron-up")
      //- | &nbsp;Collapse
    //- button.small(v-if="mode === 'small'", @click="mode = 'big'")
    //-   font-awesome-icon(icon="chevron-down")
    //-   | &nbsp;Expand to edit
    //- button.small(v-if="mode === 'big'", @click="mode = 'small'")
    //-   font-awesome-icon(icon="chevron-up")
    //-   | &nbsp;Collapse
</template>

<script>
import store from '@/store'

import PeopleChooserVertical from '@/components/PeopleChooserVertical'

export default {
  data: () => ({
    mode: 'small'
  }),
  filters: {
    name (name) {
      if (name === '$') return `${store.state.userinfo.name} (me)`
      return name
    }
  },
  created () {
    this.mode = this.initMode
  },
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
  props: ['peopleNames', 'entry', 'initMode'],
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
    &.summary {
      margin: 8px 0;
      .note {
        font-weight: 700;
      }
      .people {
        font-size: 12px;
        margin-top: 2px;
        margin-bottom: 6px;
      }
      .amount {
        flex-shrink: 0;
        flex-basis: 64px;
        text-align: right;
      }
    }
    button {
      flex-shrink: 0;
    }
  }
  & > .control {
    text-align: right;
    border-top: 1px solid darken($subtle-white, 8);
    padding-top: 8px;
  }
}
</style>
