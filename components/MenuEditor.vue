<template lang="pug">
.menu(:class="{'is-big': mode === 'big'}")
  template(v-if="mode === 'small'")
    .menu-title.summary.branding-font
      .note-and-people
        .note {{entry.note}}
        p.people
          span.person(v-for="(pKey, i) in entry.people")
            | {{filterName(peopleNames[pKey])}}
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
      button.small.not-important.danger(@click="$emit('deleted')", tabindex="-1")
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

<script setup lang="ts">
interface Entry {
  note: string;
  amount: string | number;
  people: number[];
}

interface Props {
  peopleNames: string[];
  entry: Entry;
  initMode: 'small' | 'big';
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'updated', entry: Entry): void
}>()

const { store } = useStore()

const mode = ref<'small' | 'big'>('small')

onMounted(() => {
  mode.value = props.initMode
})

function filterName(name: string) {
  if (name === '$') return `${store.value.userinfo.name} (me)`
  return name
}

const inputNoteUpdated = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newEntry = { ...props.entry, note: target.value }
  emit('updated', newEntry)
}

const inputAmountUpdated = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newEntry = { ...props.entry, amount: target.value }
  emit('updated', newEntry)
}

const peopleListSubMenuUpdated = (eventObj: { selected: number[] }) => {
  const newEntry = { ...props.entry, people: eventObj.selected }
  emit('updated', newEntry)
}
</script>

<style lang="scss">
.menu {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid darken(#fafafa, 8);
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
    border-top: 1px solid darken(#fafafa, 8);
    padding-top: 8px;
  }
}
</style>
