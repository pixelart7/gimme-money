<template lang="pug">
.people-chooser-vertical
  .people-list
    .people(v-for="(person, pKey) in peopleNames", @click="toggleSelection(pKey)", :class="{'is-active': selected.indexOf(pKey) !== -1, 'mode-select': mode === 'select'}")
      .control(v-if="mode === 'edit' || mode === 'select'")
        .delete(v-if="mode === 'edit'")
          button.danger.stealth(tabindex="-1", @click="removePersonButtonClicked(pKey)", :class="{'is-disabled': peopleNames.length === 1}")
            font-awesome-icon(:icon="['far', 'trash-alt']")
        .tick(v-if="mode === 'select'")
          .psuedo-tick-box
            font-awesome-icon.normal(:icon="['fas', 'check']", size="sm")
            font-awesome-icon.active(:icon="['fas', 'check']", size="sm")
      .name
        .edit(v-if="mode === 'edit'")
          input.person-list-input(
            :value="person | nameInput", @input="updateName($event, pKey)",
            @keydown.enter="determineAddPersonFromEnter(pKey)",
            @keydown.delete="determineRemovePersonFromDelete(pKey)")
          .me-badge.branding-font(v-if="person === '$'") me
        .display.branding-font(v-else) {{person | name}}
    .people.add(v-if="mode === 'edit'")
      button.block(@click="addPerson") + Add
  .people-list-control(v-if="options.showControl")
    span.branding-font Select:
    button.small.not-important(@click="selectAll()") All
    button.small.not-important(@click="selectInverse()") Invert
    button.small.not-important(@click="selectNone()") None
  span.help-text.left(v-if="mode === 'edit'") Press enter at the last person to insert a new person. Press delete at the last person to delete
</template>

<script>
import store from '@/store.js'

export default {
  data: () => ({
    mode: 'view',
    allowedModes: ['view']
  }),
  created () {
    this.mode = this.options.initMode
    this.modallowedModese = this.options.allowedModes
  },
  filters: {
    name (name) {
      if (name === '$') return `${store.state.userinfo.name} (me)`
      return name
    },
    nameInput (name) {
      if (name === '$') return store.state.userinfo.name
      return name
    }
  },
  methods: {
    selectAll () {
      this.$emit('updated', {
        peopleNames: this.peopleNames,
        selected: [...this.peopleNames.keys()]
      })
    },
    selectInverse () {
      const newInversed = []
      this.peopleNames.forEach((name, i) => {
        if (this.selected.indexOf(i) === -1) newInversed.push(i)
      })
      this.$emit('updated', {
        peopleNames: this.peopleNames,
        selected: newInversed
      })
    },
    selectNone () {
      this.$emit('updated', {
        peopleNames: this.peopleNames,
        selected: []
      })
    },
    determineAddPersonFromEnter (pKey) {
      if (pKey === this.peopleNames.length - 1) this.addPerson()
    },
    addPerson () {
      this.$emit('updated', {
        peopleNames: [].concat(...this.peopleNames, ''),
        selected: this.selected
      })
      this.selectLastInput()
    },
    determineRemovePersonFromDelete (pKey) {
      if (this.peopleNames.length === 1) return
      if (pKey === this.peopleNames.length - 1 && this.peopleNames[pKey] === '') {
        this.removePerson(pKey)
        this.selectLastInput()
      }
    },
    removePersonButtonClicked (i) {
      // TODO: Add better confirm dialog
      if (!confirm(`Remove '${this.peopleNames[i]}' from the list?`)) return
      this.removePerson(i)
    },
    removePerson (i) {
      // TODO: Add selected handler, remove it too, watch on change I hope
      const newPeopleNames = [...this.peopleNames]
      newPeopleNames.splice(i, 1)
      this.$emit('updated', {
        peopleNames: newPeopleNames,
        selected: this.selected
      })
    },
    selectLastInput () {
      setTimeout(() => {
        const lastInput = document.querySelectorAll('.person-list-input')
        lastInput[lastInput.length - 1].focus()
      }, 1)
    },
    updateName ($event, i) {
      const newPeopleNames = [...this.peopleNames]
      newPeopleNames[i] = $event.target.value
      if (newPeopleNames[i] === this.$store.state.userinfo.name) newPeopleNames[i] = '$'
      this.$emit('updated', {
        peopleNames: newPeopleNames,
        selected: this.selected
      })
    },
    toggleSelection (pKey) {
      if (this.mode === 'select') this.toggle(pKey)
    },
    toggle (i) {
      const index = this.selected.indexOf(i)
      let newSelected = []
      if (index === -1) {
        newSelected = this.selected.concat(i)
      } else {
        newSelected = this.selected.filter(elm => elm !== i)
      }
      newSelected.sort((x, y) => x - y)
      this.$emit('updated', {
        peopleNames: this.peopleNames,
        selected: newSelected
      })
    }
  },
  props: {
    peopleNames: {
      type: Array
    },
    selected: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({
        mode: 'view',
        allowedModes: ['view'],
        showControl: false
      })
    }
  }
}
</script>

<style lang="scss">
@import '../_variables.scss';

.people-chooser-vertical {
  .people-list {
    padding: 4px;
    border-radius: 6px;
    background: $subtle-white;
    // border-bottom: 2px solid $subtle-black;
    .people {
      height: 48px;
      margin: 4px;
      display: inline-block;
      width: calc(100% - 8px);
      padding: 4px;
      border-radius: 6px;
      background: darken($subtle-white, 4);
      border: 1px solid darken($subtle-white, 6);
      display: inline-flex;
      align-items: center;
      &.is-active {
        .control .tick .psuedo-tick-box {
          transform: scale(1);
          opacity: 1;
          .normal {
            display: none;
          }
          .active {
            display: block;
          }
        }
      }
      &.mode-select {
        cursor: pointer;
        box-shadow: 0 4px 6px 0 rgba(#000000, 0.25);
        &:hover {
          box-shadow: 0 4px 8px 0 rgba(#000000, 0.2);
          transform: translateY(-1px);
        }
        &.is-active {
          box-shadow: inset 0 2px 2px 0 rgba(#000000, 0.05), 0 0 0 2px $subtle-black;
          transform: translateY(1px);
          &:hover {
            box-shadow: 0 0 0 2px lighten($subtle-black, 24);
            transform: translateY(0px);
          }
        }
      }
      @media screen and (min-width: 375px) {
        width: calc(50% - 8px);
      }
      @media screen and (min-width: 750px) {
        width: calc(25% - 8px);
      }
      .control {
        width: 32px;
        margin-right: 4px;
        .tick {
          display: flex;
          justify-content: center;
          align-items: center;
          .psuedo-tick-box {
            transform: scale(0) rotateZ(-45deg);
            opacity: 0.85;
            .normal {
              display: block;
            }
            .active {
              display: none;
            }
          }
        }
        .delete {
          button {
            width: 100%;
            padding: 8px 2px;
          }
        }
      }
      .name {
        flex: 1;
        .edit {
          position: relative;
          .me-badge {
            position: absolute;
            right: 4px;
            top: -8px;
            font-size: 12px;
            background: darken($subtle-white, 8);
            border: 1px solid darken($subtle-white, 24);
            border-radius: 8px;
            padding: 1px 6px;
          }
          input {
            width: 100%;
          }
        }
      }
    }
  }
  .people-list-control {
    padding: 8px;
    border-radius: 6px;
    background: $subtle-white;
    margin-top: 2px;
    text-align: right;
    span, button {
      margin-left: 4px;
    }
    button {
      width: 64px;
    }
  }
}
</style>
