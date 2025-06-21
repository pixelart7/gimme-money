<template lang="pug">
BillEditor(
  v-if="bill"
  :initialBill="bill"
  mode="edit"
  @save="handleSave"
  @discard="handleDiscard"
)
.loading(v-else) Loading...
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { store } = useStore()

const bill = ref(null)

onMounted(() => {
  const billIndex = Number(route.params.billIndex)
  if (isNaN(billIndex) || billIndex < 0 || billIndex >= store.value.bills.length) {
    console.error('Invalid bill index')
    router.push({ name: 'home' })
    return
  }
  bill.value = JSON.parse(JSON.stringify(store.value.bills[billIndex]))
})

const handleSave = (updatedBill) => {
  const billIndex = Number(route.params.billIndex)
  const updatedBills = [...store.value.bills]
  updatedBills[billIndex] = updatedBill
  store.value.bills = updatedBills
  router.replace(`/bill/view/${billIndex}`)
}

const handleDiscard = () => {
  router.go(-1)
}
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
}
</style>
  