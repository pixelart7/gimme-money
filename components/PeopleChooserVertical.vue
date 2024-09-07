<template lang="pug">
.people-chooser-vertical
  .people-list
    .people(v-for="(person, pKey) in peopleNames", @click="toggleSelection(pKey)", :class="{'is-active': selected.indexOf(pKey) !== -1, 'mode-select': mode === 'select'}")
      .control(v-if="mode === 'edit' || mode === 'select'")
        .delete(v-if="mode === 'edit'")
          button.danger.stealth(tabindex="-1", @click="removePersonButtonClicked(pKey)", :class="{'is-disabled': peopleNames.length === 1}")
            .flex.items-center.justify-center: PhTrashBold
        .tick(v-if="mode === 'select'")
          .psuedo-tick-box
            PhCheckBold.normal.text-sm
            PhCheckBold.active.text-sm
      .name
        .edit(v-if="mode === 'edit'")
          input.person-list-input(
            :value="filterNameInput(person)", @input="updateName($event, pKey)",
            @keydown.enter="determineAddPersonFromEnter(pKey)",
            @keydown.delete="determineRemovePersonFromDelete(pKey)")
          .me-badge.branding-font(v-if="person === '$'") me
        .display.branding-font(v-else) {{filterName(person)}}
    .people.add(v-if="mode === 'edit'")
      button.block(@click="addPerson") + Add
  .people-list-control(v-if="options.showControl")
    span.branding-font Select:
    button.small.not-important(@click="selectAll()") All
    button.small.not-important(@click="selectInverse()") Invert
    button.small.not-important(@click="selectNone()") None
  span.help-text.left(v-if="mode === 'edit'") Press enter at the last person to insert a new person. Press delete at the last person to delete
</template>

<script setup lang="ts">
import PhTrashBold from '~icons/ph/trash-bold'
import PhCheckBold from '~icons/ph/check-bold'

interface Options {
  initMode?: 'view' | 'select';
  allowedModes?: ('view' | 'select')[];
  showControl?: boolean;
}

interface Props {
  peopleNames: string[];
  selected?: number[];
  options?: Options;
}

const props = withDefaults(defineProps<Props>(), {
  selected: () => [],
  options: () => ({
    initMode: 'view',
    allowedModes: ['view'],
    showControl: false
  })
})

const emit = defineEmits<{
  (e: 'updated', payload: { peopleNames: string[]; selected: number[] }): void
}>()

const { store } = useStore()

const mode = ref<'view' | 'select'>('view')
const allowedModes = ref<('view' | 'select')[]>(['view'])

onMounted(() => {
  mode.value = props.options.initMode || 'view'
  allowedModes.value = props.options.allowedModes || ['view']
})

const filterName = (name: string): string => {
  if (name === '$') return `${store.value.userinfo.name} (me)`
  return name
}

const filterNameInput = (name: string): string => {
  if (name === '$') return store.value.userinfo.name
  return name
}

const selectAll = () => {
  emit('updated', {
    peopleNames: props.peopleNames,
    selected: [...props.peopleNames.keys()]
  })
}

const selectInverse = () => {
  const newInversed = props.peopleNames.reduce((acc: number[], _, i) => {
    if (!props.selected.includes(i)) acc.push(i)
    return acc
  }, [])
  emit('updated', {
    peopleNames: props.peopleNames,
    selected: newInversed
  })
}

const selectNone = () => {
  emit('updated', {
    peopleNames: props.peopleNames,
    selected: []
  })
}

const determineAddPersonFromEnter = (pKey: number) => {
  if (pKey === props.peopleNames.length - 1) addPerson()
}

const addPerson = () => {
  emit('updated', {
    peopleNames: [...props.peopleNames, ''],
    selected: props.selected
  })
  selectLastInput()
}

const determineRemovePersonFromDelete = (pKey: number) => {
  if (props.peopleNames.length === 1) return
  if (pKey === props.peopleNames.length - 1 && props.peopleNames[pKey] === '') {
    removePerson(pKey)
    selectLastInput()
  }
}

const removePersonButtonClicked = (i: number) => {
  if (!confirm(`Remove '${props.peopleNames[i]}' from the list?`)) return
  removePerson(i)
}

const removePerson = (i: number) => {
  const newPeopleNames = [...props.peopleNames]
  newPeopleNames.splice(i, 1)
  emit('updated', {
    peopleNames: newPeopleNames,
    selected: props.selected
  })
}

const selectLastInput = () => {
  setTimeout(() => {
    const lastInput = document.querySelectorAll('.person-list-input')
    ;(lastInput[lastInput.length - 1] as HTMLElement).focus()
  }, 1)
}

const updateName = (event: Event, i: number) => {
  const target = event.target as HTMLInputElement
  const newPeopleNames = [...props.peopleNames]
  newPeopleNames[i] = target.value
  if (newPeopleNames[i] === store.value.userinfo.name) newPeopleNames[i] = '$'
  emit('updated', {
    peopleNames: newPeopleNames,
    selected: props.selected
  })
}

const toggleSelection = (pKey: number) => {
  if (mode.value === 'select') toggle(pKey)
}

const toggle = (i: number) => {
  const newSelected = props.selected.includes(i)
    ? props.selected.filter(elm => elm !== i)
    : [...props.selected, i]
  newSelected.sort((x, y) => x - y)
  emit('updated', {
    peopleNames: props.peopleNames,
    selected: newSelected
  })
}
</script>

<style lang="scss">
.people-chooser-vertical {
  .people-list {
    padding: 4px;
    border-radius: 6px;
    background: #fafafa;
    // border-bottom: 2px solid $subtle-black;
    .people {
      height: 48px;
      margin: 4px;
      display: inline-block;
      width: calc(100% - 8px);
      padding: 4px;
      border-radius: 6px;
      background: darken(#fafafa, 4);
      border: 1px solid darken(#fafafa, 6);
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
          box-shadow: inset 0 2px 2px 0 rgba(#000000, 0.05), 0 0 0 2px #212121;
          transform: translateY(1px);
          &:hover {
            box-shadow: 0 0 0 2px lighten(#212121, 24);
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
            background: darken(#fafafa, 8);
            border: 1px solid darken(#fafafa, 24);
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
    background: #fafafa;
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
