interface Entry {
  amount: number
  people: number[]
  note?: string
}

interface Payer {
  person: number
  amount: number
}

interface Bill {
  peopleNames: string[]
  amount: number
  payers: Payer[]
  entries: Entry[]
}

interface Person {
  peopleKey: number
  payTo: number[]
  getFrom: number[]
  group: string
}

interface GroupInfo {
  amount: number
  entries: Entry[]
}

interface Result {
  changeFromStore: number[]
  people: Person[]
  info: {
    groupBasedPriority: { group: string; amount: number }[]
    groupInfo: Record<string, GroupInfo>
  }
}

export default function useBillCalculator() {
  function _sumEntries(bill: Bill) {
    return bill.entries.reduce((sum, entry) => sum + parseFloat(entry.amount.toString()), 0)
  }

  function _sumPaid(bill: Bill) {
    return bill.payers.reduce((sum, payer) => sum + parseFloat(payer.amount.toString()), 0)
  }

  function validate(bill: Bill) {
    if (bill.peopleNames.length <= 0) return false
    if (bill.amount < 0) return false
    if (bill.payers.length <= 0) return false
    if (bill.amount > _sumPaid(bill)) return false
    if (bill.amount < _sumEntries(bill)) return false
    console.log(bill.amount)
    console.log(_sumEntries(bill))
    return true
  }

  function calculate(bill: Bill): Result {
    let result: Result = {
      changeFromStore: [],
      people: [],
      info: {
        groupBasedPriority: [],
        groupInfo: {}
      }
    }

    const each = new Array(bill.peopleNames.length).fill(0)

    // Populate result object
    each.forEach((_, i) => {
      result.changeFromStore[i] = -1
      result.people[i] = {
        peopleKey: i,
        payTo: new Array(bill.peopleNames.length).fill(-1),
        getFrom: new Array(bill.peopleNames.length).fill(-1),
        group: '1'
      }
    })

    // Populate menu group for each person
    bill.entries.forEach((entry) => {
      bill.peopleNames.forEach((_, pIndex) => {
        if (entry.people.indexOf(pIndex) !== -1) {
          result.people[pIndex].group += '1'
        } else {
          result.people[pIndex].group += '0'
        }
      })
    })

    // Assign group-based priority
    let groupBasedPriorityTemp: Record<string, number> = {}
    result.people.forEach((person) => {
      if (person.group in groupBasedPriorityTemp) {
        groupBasedPriorityTemp[person.group]++
      } else {
        groupBasedPriorityTemp[person.group] = 1
      }
    })
    result.info.groupBasedPriority = Object.entries(groupBasedPriorityTemp)
      .map(([group, amount]) => ({ group, amount }))
      .sort((a, b) => a.amount - b.amount)

    // Calculate change from store
    const realPaid: Record<number, number> = {}
    let tempAmountToCalculateChange = bill.amount
    bill.payers.forEach((person) => {
      const personKey = person.person
      if (tempAmountToCalculateChange === 0) {
        result.changeFromStore[personKey] = person.amount
      } else if (tempAmountToCalculateChange - person.amount > 0) {
        result.changeFromStore[personKey] = 0
        tempAmountToCalculateChange -= person.amount
        realPaid[personKey] = person.amount
      } else if (tempAmountToCalculateChange - person.amount <= 0) {
        result.changeFromStore[personKey] = Math.abs(tempAmountToCalculateChange - person.amount)
        realPaid[personKey] = tempAmountToCalculateChange
        tempAmountToCalculateChange = 0
      }
    })

    // Subtract submenu from all amount
    const subMenuSum = bill.entries.reduce((sum, entry) => sum + entry.amount, 0)
    const amountWithoutSubmenu = bill.amount - subMenuSum

    // Calculate and add base price for each
    const baseEach = amountWithoutSubmenu / bill.peopleNames.length
    each.forEach((_, i) => {
      each[i] += baseEach
    })

    // Loop in extra menu to add price of each extras
    bill.entries.forEach((entry) => {
      const extraEach = entry.amount / entry.people.length
      entry.people.forEach((personKey) => {
        each[personKey] += extraEach
      })
    })

    // Set group price and menus for each group
    result.people.forEach((person, i) => {
      if (person.group in result.info.groupInfo) return
      result.info.groupInfo[person.group] = {
        amount: each[i],
        entries: [{
          note: 'Shared Menu(s)',
          amount: amountWithoutSubmenu,
          people: [...bill.peopleNames.keys()]
        }]
      }
      person.group.split('').slice(1).forEach((char, menuIndex) => {
        if (char === '0') return
        result.info.groupInfo[person.group].entries.push(bill.entries[menuIndex])
      })
    })

    // Subtract store-paid people
    Object.keys(realPaid).forEach((personKey) => {
      const personKeyInt = parseInt(personKey, 10)
      const eachBefore = each[personKeyInt]
      each[personKeyInt] = Math.max(0, each[personKeyInt] - realPaid[personKeyInt])
      realPaid[personKeyInt] = realPaid[personKeyInt] - eachBefore
      if (realPaid[personKeyInt] < 0) {
        each[personKeyInt] = Math.abs(realPaid[personKeyInt])
        realPaid[personKeyInt] = 0
      }
    })

    each.forEach((ePerson, ePersonKey) => {
      Object.keys(realPaid).forEach((pPersonKey) => {
        const pPerson = realPaid[parseInt(pPersonKey, 10)]
        const pPersonKeyInt = parseInt(pPersonKey, 10)
        if (pPerson === 0 || ePerson === 0) return
        if (ePersonKey === pPersonKeyInt) {
          // Same eat and pay person logic remains commented out as in the original
        } else {
          let paid = ePerson
          realPaid[pPersonKey] = pPerson - ePerson
          if (realPaid[pPersonKey] < 0) {
            paid = ePerson - Math.abs(realPaid[pPersonKey])
            realPaid[pPersonKey] = 0
          }
          each[ePersonKey] -= paid
          result.people[ePersonKey].payTo[pPersonKeyInt] = paid
          result.people[pPersonKeyInt].getFrom[ePersonKey] = paid
        }
      })
    })

    return result
  }

  return {
    validate,
    calculate
  }
}