<template lang="pug">
.bill-small-display
  .bill-title
    h4 {{bill.note}}
    h5 ฿{{bill.amount}}
  p.people
    span.person(v-for="(person, i) in bill.peopleNames")
      | {{ filterName(person) }}
      template(v-if="i < bill.peopleNames.length - 1")
        | ,
        |
    |
    | joined
  p.datetime Created on: {{ filterDate(bill.datetime.created || '') }}
</template>

<script setup lang="ts">
const { store } = useStore()
const dayjs = useDayjs()

defineProps({
  bill: { type: Object, required: true }
})

function filterName(name: string) {
  if (name === '$') return `${store.value.userinfo.name} (me)`
  return name
}

function filterDate(input: string) {
  const day = dayjs(input)
  return `${day.format('MMM D, YYYY [at] HH:mm')}`
}
</script>

<style lang="scss">
.bill-small-display {
  border: 1px solid darken(#fafafa, 8);
  padding: 16px;
  border-radius: 6px;
  .bill-title {
    display: flex;
    justify-content: space-between;
    h4, h5 {
      margin: 0;
    }
  }
  .people, .datetime {
    margin-top: 4px;
    margin-bottom: 0;
    font-size: 12px;
    font-family: 'Roboto Mono', monospace;
  }
  .datetime {
    color: #757575;
  }
}
</style>
