<template lang="pug">
BillEditor(
  :initialBill="newBill"
  mode="new"
  @save="handleSave"
  @discard="handleDiscard"
)
</template>

<script setup lang="ts">
const router = useRouter()
const { store } = useStore()

const newBill = ref({
  note: 'New Bill',
  amount: '',
  peopleNames: ['$'],
  numsOfPeople: -1,
  datetime: {
    created: new Date().toISOString()
  },
  info: {
    paidPeople: []
  },
  payers: [],
  entries: []
})

const handleSave = (savedBill) => {
  const updatedBills = [...store.value.bills, savedBill]
  store.value.bills = updatedBills
  const newBillIndex = updatedBills.length - 1
  router.push(`/bill/view/${newBillIndex}`)
}

const handleDiscard = () => {
  router.go(-1)
}
</script>
  