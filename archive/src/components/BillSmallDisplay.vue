<template lang="pug">
.bill-small-display
  .bill-title
    h4 {{bill.note}}
    h5 ฿{{bill.amount}}
  p.people
    span.person(v-for="(person, i) in bill.peopleNames")
      | {{person | name}}
      template(v-if="i < bill.peopleNames.length - 1")
        | ,
        |
    |
    | joined
  p.datetime Created on: {{bill.datetime.created | date}}
</template>

<script>
import dayjs from 'dayjs'

import store from '@/store'

export default {
  filters: {
    name (name) {
      if (name === '$') return `${store.state.userinfo.name} (me)`
      return name
    },
    date (input) {
      const day = dayjs(input)
      // return `${dayjs(input).from(dayjs())} (${dayjs(input).format('MMM D, YYYY [at] HH:mm')})`
      return `${dayjs(input).format('MMM D, YYYY [at] HH:mm')}`
    }
  },
  props: ['bill']
}
</script>

<style lang="scss">
@import '../_variables.scss';

.bill-small-display {
  border: 1px solid darken($subtle-white, 8);
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
    font-family: $branding-font;
  }
  .datetime {
    color: $subtle-grey;
  }
}
</style>
