<template lang="pug">
.people-chooser
  .people-row(:class="{'is-name-editing': state.editing}")
    .people(v-for="(name, i) in peopleNamesArray", v-if="name !== ''", :class="{'is-editing': i === state.editingIndex}")
      .icon(@click="toggle(i)", :class="{'is-active': selected.find(elm => elm === i) !== undefined}"): PhUserBold
      .name(v-if="name.substr(0, 1) === '$'", @click="toggleEdit(i)")
        | {{$store.state.userinfo.name}}
        br
        small
          | (me)
          PhPencilDuotone
      .name(v-else, @click="toggleEdit(i)")
        | {{name}}
        small: PhPencilDuotone
    .people.single-pull(v-if="peopleNamesArray.filter(elm => elm === '').length > 0")
      .icon(@click="singlePullHandler()"): PhUserPlusBold.text-lg
      .name
        | From
        br
        small {{peopleNamesArray.filter(elm => elm === '').length}} people
    .people.the-rest(v-if="peopleNamesArray.filter(elm => elm === '').length > 1")
      .icon(
        @click="theRestHandler()",
        :class="{'is-active': shouldTheRestBeActive()}")
        PhUsersBold.inline.text-lg
      .name
        | All remaining
        br
        small ({{peopleNamesArray.filter(elm => elm === '').length}} people)
  .editing-row(v-if="state.editing")
    template(v-if="peopleNamesArray[state.editingIndex] !== '$'")
      button.me-btn.not-important(@click="setCurrentEditingNameTo('$')") Me
    template(v-else)
      button.me-btn.is-toggled(@click="setCurrentEditingNameTo('Name')") Me
    form.input(@submit.prevent="toggleEdit(-1)")
      input(ref="inputEditName", v-if="peopleNamesArray[state.editingIndex] !== '$'", v-model="peopleNamesArray[state.editingIndex]", @click="$event.target.select()")
      input.is-disabled(v-else, :value="$store.state.userinfo.name")
    button.primary.done-btn(@click="toggleEdit(-1)") Done
  .helper-row(v-if="!state.editing")
    button(@click="selectAll()") All
    button(@click="selectInverse()") Inverse
    button(@click="selectNone()") None
    .counter
      span {{selected.length}}
      PhUsersBold.inline
</template>

<script>
import PhUsersBold from '~icons/ph/users-bold'
import PhPencilDuotone from '~icons/ph/pencil-duotone'
import PhUserBold from '~icons/ph/user-bold'
import PhUserPlusBold from '~icons/ph/user-plus-bold'

export default {
  data: () => ({
    state: {
      editing: false,
      editingIndex: -1
    }
  }),
  methods: {
    selectAll () {
      this.$emit('updated', {
        peopleNames: this.peopleNamesArray,
        selected: [...this.peopleNamesArray.keys()]
      })
    },
    selectInverse () {
      const newInversed = []
      this.peopleNamesArray.forEach((name, i) => {
        if (this.selected.indexOf(i) === -1) newInversed.push(i)
      })
      this.$emit('updated', {
        peopleNames: this.peopleNamesArray,
        selected: newInversed
      })
    },
    selectNone () {
      this.$emit('updated', {
        peopleNames: this.peopleNamesArray,
        selected: []
      })
    },
    theRestHandler () {
      if (this.shouldTheRestBeActive()) {
        this.$emit('updated', {
          peopleNames: this.peopleNamesArray,
          selected: this.selected.filter(name => name !== '')
        })
      } else {
        const indexesOfEmpty = []
        this.peopleNamesArray.forEach((name, i) => {
          if (name === '') indexesOfEmpty.push(i)
        })
        this.$emit('updated', {
          peopleNames: this.peopleNamesArray,
          selected: this.selected.concat(indexesOfEmpty)
        })
      }
    },
    shouldTheRestBeActive () {
      let shouldItBe = true
      this.peopleNamesArray.forEach((name, i) => {
        if (!shouldItBe || name !== '') return
        if (this.selected.indexOf(i) === -1) {
          shouldItBe = false
        }
      })
      return shouldItBe
    },
    updateName (i, newName) {
      const newPeopleNames = [...this.peopleNamesArray]
      newPeopleNames[i] = newName
      this.$emit('updated', {
        peopleNames: newPeopleNames,
        selected: this.selected
      })
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
        peopleNames: this.peopleNamesArray,
        selected: newSelected
      })
    },
    toggleEdit (i) {
      if (this.state.editing) {
        this.state.editing = false
        this.state.editingIndex = -1
      } else {
        this.state.editing = true
        this.state.editingIndex = i
        this.focusInputEditName()
      }
    },
    focusInputEditName () {
      this.$forceUpdate()
      setTimeout(() => { // genius
        this.$refs.inputEditName.focus()
        this.$refs.inputEditName.select()
        setTimeout(() => {
          this.$refs.inputEditName.scrollIntoView()
        }, 500)
      }, 1)
    },
    setCurrentEditingNameTo (name) {
      this.peopleNamesArray[this.state.editingIndex] = name
      this.$forceUpdate()
      if (name === 'Name') this.focusInputEditName()
    },
    singlePullHandler () {
      const index = this.peopleNamesArray.indexOf('')
      this.updateName(index, 'Name')
      this.toggleEdit(index)
      setTimeout(() => {
        this.toggle(index)
      }, 1)
    }
  },
  props: ['numsOfPeople', 'peopleNamesArray', 'selected']
}
</script>

<style lang="scss">
@import '../_variables.scss';

.people-chooser {
  background: $subtle-white;
  border-bottom: 2px solid $subtle-black;
  border-radius: 6px 6px 0 0;
  .people-row {
    height: 120px;
    display: flex;
    align-items: center;
    border-radius: 6px 6px 0 0;
    // border: 1px solid darken($subtle-white, 4);
    border-bottom: none;
    overflow-x: scroll;
    .people {
      width: 56px + 24px;
      .icon {
        width: 56px;
        height: 56px;
        margin: 0 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: darken($subtle-white, 6);
        border-radius: 56px;
        border: 1px solid darken($subtle-white, 10);
        svg path {
          color: $subtle-grey;
        }
        &.is-active {
          border-color: $branding-color;
          background: lighten($branding-color, 35);
          svg path {
            color: $subtle-white;
          }
        }
      }
      .name {
        font-family: $branding-font;
        font-size: 12px;
        text-align: center;
        height: 42px;
        padding: 4px;
        margin-top: 2px;
        border-radius: 4px;
        font-family: sans-serif;
        .edit-icon {
          margin-left: 4px;
          path {
            color: $subtle-grey;
          }
        }
      }
      &.is-editing {
        position: relative;
        .name {
          background: $subtle-black;
          color: #ffffff;
          opacity: 1;
          pointer-events: unset;
          small { color: #ffffff; }
          .edit-icon {
            display: none;
          }
        }
        &::after {
            content: '▼';
            position: absolute;
            color: $subtle-black;
            margin-top: -10px;
            width: 100%;
            text-align: center;
          }
      }
    }
    &.is-name-editing {
      .icon, .name {
        opacity: 0.25;
        pointer-events: none;
      }
    }
  }
  .helper-row, .editing-row {
    border-top: 1px dashed darken($subtle-white, 8);
    // border-right: 1px solid darken($subtle-white, 4);
    // border-left: 1px solid darken($subtle-white, 4);
    display: flex;
    align-items: center;
    height: 48px;
  }
  .editing-row {
    // background: darken($subtle-white, 2);
    border-color: $subtle-black;
    border-top: 1px dashed $subtle-black;
    padding: 0 8px;
    height: 56px;
    span {
      font-family: $branding-color;
      margin-right: 8px;
    }
    .input {
      margin-bottom: 0;
      flex: 1;
      width: 96px;
    }
    .me-btn { margin-right: 4px; }
    .done-btn { margin-left: 4px; }
  }
  .helper-row {
    button {
      border: none;
      background: none;
      border-right: 1px solid darken($subtle-white, 6);
      border-radius: 0;
      height: 100%;
    }
    .counter {
      flex: 1;
      margin: 0 8px;
      font-family: $branding-font;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      span { color: $subtle-grey; }
      svg {
        margin-left: 8px;
        path {
          color: $subtle-grey;
        }
      }
    }
  }
}
</style>
