<template lang="pug">
  #bill-editor.page-region.fit-content
    .top-bar-title(style="opacity: 0.5;")
      h5 {{ bill.note }}
      h6.text-xs.leading-none {{ filterDate(bill.datetime.created) }}
    .editor
      button.close-btn.small.not-important(@click="discard()") Discard
      h3.mb-8 {{ bill.note }}
      .input
        label Title / Note
        input(type="text", v-model="bill.note", @click="selectAllIf($event, 'New Bill')")
      .input
        label People who joined
        PeopleChooserVertical(
          :peopleNames="bill.peopleNames",
          :options="{ initMode: 'edit', allowedModes: ['edit'], showControl: false }",
          @updated="peopleListEditorUpdated"
          )
      hr
      .menus
        .flex.items-center
          h3.mb-0.flex-1 Menu List
          input(
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          )
          button.mb-2.transition(@click="triggerFileUpload" v-if="isEnableAi" :class="{ 'opacity-60 pointer-events-none': isAIProcessing }")
            template(v-if="isAIProcessing") Processing...
            template(v-else) ✨ Upload Receipt
        h5.subtext.mb-16 You may skip menu that everyone shares.
        MenuEditor(
          v-for="(entry, i) in bill.entries",
          :key="'menu-entry-' + i",
          :peopleNames="bill.peopleNames",
          :entry="entry",
          :initMode="determineEditorInitMode(i)",
          @updated="subMenuUpdated($event, i)",
          @deleted="subMenuDeleted($event, i)"
        )
        button.block(@click="pushSubMenu()") + Add menu
      hr
      h3.mb-8 Bill Total
      .input
        label 'Grand Total' in Bill
        .input-row
          span.branding-font.left ฿
          input(type="number", min=0, v-model="bill.amount")
        span.help-text.left Final price that was paid to the store. (ie. including all menus above, all-shared menus, VAT, taxes, service charge, etc.)
      .msg.mb-8(v-if="sumEntries < bill.amount && bill.entries.length > 0")
        | The rest of the bill ({{ filterMoney(bill.amount - sumEntries) }}) will be shared among everyone.
      .msg.warning.mb-8(v-if="sumEntries > bill.amount")
        | The total paid to store ({{ filterMoney(bill.amount) }}) is under the sum price of the listed menu ({{ filterMoney(sumEntries) }}); this value should be equal or higher.
      hr
      h3.mb-8 Payer(s)
      .input
        label Who helped paid the store?
        PeopleChooserVertical(
          :peopleNames="bill.peopleNames",
          :selected="process.payersSelected",
          :options="{ initMode: 'select', allowedModes: ['select'], showControl: false }",
          @updated="peopleListPayerUpdated"
          )
      h5.mt-8.mb-8(v-if="bill.payers.length > 0") How much?
      .input.input-flex(v-for="(person, i) in bill.payers", :key="i + '-paid-amount'")
        label
          | {{ filterName(bill.peopleNames[person.person]) }}
          br
          small paid
        .input-row
          span.branding-font.left ฿
          input(type="number", min=0, v-model.number="bill.payers[i].amount")
          button(v-if="bill.payers.length === 1", style="flex-shrink: 0", @click="bill.payers[i].amount = bill.amount") All
      h4.mt-32.mb-0.text-align-right.subtext Paid to store
      h2.mt-0.mb-0.text-align-right = {{ filterMoney(sumPaid) }}
      hr
      .msg.warning.mb-8(v-if="sumPaid < bill.amount && bill.payers.length > 0") Your total paid (฿{{ sumPaid }}) is under the amount of the bill (฿{{ bill.amount }})
      .btn-flex
        button.not-important(@click="discard()") Discard
        button.block.primary(@click="saveAndNavigate()") Save
  </template>

<script setup lang="ts">
interface Bill {
  note: string;
  amount: string | number;
  peopleNames: string[];
  numsOfPeople: number;
  datetime: {
    created: string;
  };
  info: {
    paidPeople: any[];
  };
  payers: Array<{ person: number; amount: string | number }>;
  entries: Array<{ note: string; amount: string | number; people: number[] }>;
}

interface Process {
  payersSelected: number[];
  menuEditorSize: 'small' | 'big';
}

const props = defineProps<{
  initialBill: Bill
  mode: 'edit' | 'new'
}>()

const emit = defineEmits<{
  (e: 'save', bill: Bill): void
  (e: 'discard'): void
}>()

const dayjs = useDayjs()
const { store } = useStore()
const fileInput = ref<HTMLInputElement | null>(null)

const process = ref<Process>({
  payersSelected: [],
  menuEditorSize: 'small'
})

const bill = ref<Bill>(props.initialBill)

onMounted(() => {
  if (props.mode === 'new') {
    process.value.menuEditorSize = 'big'
    bill.value.datetime.created = dayjs().toISOString()
  } else {
    process.value.menuEditorSize = 'small'
    const ppSelected = bill.value.payers.map(elm => elm.person)
    process.value.payersSelected = ppSelected
    updatePayer()
  }
})

function filterDate(input: string) {
  return dayjs(input).format('MMM D, YYYY [at] HH:mm')
}

function filterName(name: string) {
  if (name === '$') return `${store.value.userinfo.name} (me)`
  return name
}

function filterMoney(amount = 0) {
  const text = (amount || 0).toString()
  const index = text.indexOf('.')
  const precision = (index == -1) ? 0 : (text.length - index - 1)
  if (precision > 3) return `฿${amount.toFixed(2)}`
  else return `฿${amount}`
}

const determineEditorInitMode = (i: number) => {
  if (i === bill.value.entries.length - 1) return 'big'
  if (!isFinite(Number(bill.value.entries[i].amount) / bill.value.entries[i].people.length)) return 'big'
  return process.value.menuEditorSize
}

const discard = () => {
  if (confirm('Are you sure to leave this page?')) emit('discard')
}

const saveAndNavigate = () => {
  saveBill()
  emit('save', bill.value)
}

const saveBill = () => {
  bill.value.amount = parseFloat(bill.value.amount as string)
  bill.value.entries.forEach((elm, i) => {
    bill.value.entries[i].amount = parseFloat(bill.value.entries[i].amount as string)
  })
}

const sumEntries = computed(() => {
  let sum = 0
  bill.value.entries.forEach((elm) => {
    sum += parseFloat(elm.amount as string)
  })
  return isNaN(sum) ? '?' : sum
})

const sumPaid = computed(() => {
  let sum = 0
  bill.value.payers.forEach((elm) => {
    sum += parseFloat(elm.amount as string)
  })
  return isNaN(sum) ? '?' : sum
})

const selectAllIf = (event: Event, text: string) => {
  const target = event.target as HTMLInputElement
  if (target.value === text) target.select()
}

const selectSubMenuLastInput = () => {
  setTimeout(() => {
    const lastInput = document.querySelectorAll('.sub-menu-input')
      ; (lastInput[lastInput.length - 1] as HTMLElement).focus()
  }, 1)
}

const peopleListEditorUpdated = (payload: { peopleNames: string[] }) => {
  bill.value.peopleNames = payload.peopleNames
}

const peopleListPayerUpdated = (payload: { selected: number[] }) => {
  process.value.payersSelected = payload.selected
  updatePayer()
}

const updatePayer = () => {
  const selected = process.value.payersSelected
  const newPayers = selected.map(key => {
    const existingPayer = bill.value.payers.find(elm => key === elm.person)
    return existingPayer || { person: key, amount: '' }
  })
  bill.value.payers = newPayers
}

const pushSubMenu = () => {
  bill.value.entries.push({
    note: '',
    amount: '',
    people: []
  })
  selectSubMenuLastInput()
}

const subMenuUpdated = (newEntry: Bill['entries'][0], i: number) => {
  bill.value.entries[i] = newEntry
}

const subMenuDeleted = (event: Event, i: number) => {
  bill.value.entries.splice(i, 1)
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    onSubmitReceipt(file)
  }
}

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result as string
      // Remove the data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const isEnableAi = computed(() => store.value.userinfo.openaiKey)
const isAIProcessing = ref(false)
const onSubmitReceipt = async (file: File) => {
  isAIProcessing.value = true
  try {
    const base64Image = await convertFileToBase64(file)
    const apiKey = store.value.userinfo.openaiKey

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', // Note: gpt-4.1-mini doesn't exist, using gpt-4-turbo instead
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a helper to convert a menu list into a JSON format. The input will always be an image of a receipt / screen displaying menu that they ordered. If in a case which the attached image is not a parsable, answer only \"1\". The output should be a parsable JSON formatted-string (without any markdown) with structure like this:\n\n{\n  \"amount\": <total_amount>,\n  \"entries\": [{\n    \"amount\": <entry_amount>,\n    \"note\": <entry_menu_name>\n  }, ... ],\n}\n\nFor total_amount, that's the total paid amount. This should include any VAT,  taxes, service charge, basically, the final number to pay.\n\nFor \"entries\" key, this is an array containing each menu. <entry_amount> is the amount of money for that menu. This is usually noted on the right side of the bill. Some restaurant may have sub-menu (more spicy, less spicy) in following rows, try to guess and combine those sub-row that is intended to be an explanation to the main row together. Ignore any rows with 0. <entry_menu_name> is a string from the bill, keep it in the language of the bill. Sometimes the user ordered more than one quantity, add the number of quantity at the entry menu name.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2048
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    let content = result.choices[0]?.message?.content
    if (content) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      try {
        const parsedData = JSON.parse(content)
        console.log('Parsed Receipt Data:', parsedData)

        // Auto-populate the bill with extracted data
        if (parsedData.amount && parsedData.entries) {
          // Set the total amount
          bill.value.amount = parsedData.amount

          // Add entries to the bill
          parsedData.entries.forEach(entry => {
            if (entry.note && entry.amount) {
              bill.value.entries.push({
                note: entry.note,
                amount: entry.amount,
                people: [] // Empty array - user will need to assign people later
              })
            }
          })

          console.log('Bill updated with receipt data')
        }

      } catch (parseError) {
        console.error('Error parsing JSON:', parseError)
        console.log('Content that failed to parse:', content)
      }
    }

  } catch (error) {
    console.error('Error processing receipt:', error)
    alert('Error processing receipt. Please try again.')
  } finally {
    isAIProcessing.value = false
  }
}
</script>

<style lang="scss">
#bill-editor {
  position: relative;
  padding-bottom: 0;
  z-index: 2;

  .close-btn {
    position: absolute;
    right: 12px;
    top: -42px;
  }

  hr {
    border: none;
    border-top: 2px dashed rgba(#000000, 0.1);
    margin: 24px 0;
  }

  .editor {
    padding-top: 4px;
  }

  .menus .is-big:only-of-type {
    box-shadow: 0 2px 12px 0 rgba(#000000, 0.15);
  }
}
</style>