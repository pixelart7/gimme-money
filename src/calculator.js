export default {
  validate (bill) {
    if (bill.numsOfPeople <= 0) return false
    if (bill.amount < 0) return false
    if (bill.payers.length <= 0) return false
    return true
  },
  calculate (bill) {
    let result = {
      changeFromStore: [],
      people: [],
      info: {
        groupBasedPriority: [],
        groupInfo: {}
      }
    }

    const each = (new Array(bill.numsOfPeople)).fill(0) // store amount of money that the person ate/joined

    // POPULATE RESULT OBJECT
    each.forEach((e, i) => {
      result.changeFromStore[i] = -1
      result.people[i] = {
        peopleKey: i, // for easy access when view
        payTo: (new Array(bill.numsOfPeople)).fill(-1),
        getFrom: (new Array(bill.numsOfPeople)).fill(-1),
        group: '1'
      }
    })

    // POPULATE MENU GROUP FOR EACH PEOPLE; index 0 always 1, the rest, entries participation
    bill.entries.forEach((entry, i) => {
      bill.peopleNames.forEach((name, pIndex) => {
        if (entry.people.indexOf(pIndex) !== -1) {
          result.people[pIndex].group = `${result.people[pIndex].group}1`
        } else {
          result.people[pIndex].group = `${result.people[pIndex].group}0`
        }
      })
    })

    // ASSIGN GROUP-BASED PRIORITY
    let groupBasedPriorityTemp = {}
    result.people.forEach((elm, i) => {
      if (elm.group in groupBasedPriorityTemp) {
        groupBasedPriorityTemp[elm.group] += 1
      } else {
        groupBasedPriorityTemp[elm.group] = 1
      }
    })
    groupBasedPriorityTemp = Object.keys(groupBasedPriorityTemp).map((gKey) => {
      return {
        group: gKey,
        amount: groupBasedPriorityTemp[gKey]
      }
    })
    result.info.groupBasedPriority = groupBasedPriorityTemp.sort((a, b) => a.amount - b.amount)

    // CALCULATE CHANGE FROM STORE
    const realPaid = {}
    let tempAmountToCalculateChange = bill.amount
    bill.payers.forEach((person, i) => { // calculate based from the first person
      const personKey = person.person
      if (tempAmountToCalculateChange === 0) { // why did you pay when it's all add up omg
        result.changeFromStore[personKey] = person.amount
      } else if (tempAmountToCalculateChange - person.amount > 0) { // left over continue iterate
        result.changeFromStore[personKey] = 0
        tempAmountToCalculateChange -= person.amount
        realPaid[personKey] = person.amount
      } else if (tempAmountToCalculateChange - person.amount <= 0) { // meaning that this person paid more than store needed
        result.changeFromStore[personKey] = Math.abs(tempAmountToCalculateChange - person.amount)
        realPaid[personKey] = tempAmountToCalculateChange
        tempAmountToCalculateChange = 0
      }
    })

    // SUBSTRACT SUBMENU FROM ALL AMOUNT
    let subMenuSum = 0
    bill.entries.forEach((elm) => {
      subMenuSum += elm.amount
    })
    const amountWithoutSubmenu = bill.amount - subMenuSum

    // CALCULATE AND ADD BASE PRICE FOR EACH
    const baseEach = amountWithoutSubmenu / bill.numsOfPeople
    each.forEach((elm, i) => {
      if (elm !== 0) console.log('SUMTINGWONG')
      each[i] = elm + baseEach
    })

    // LOOP IN EXTRA MENU TO ADD PRICE OF EACH EXTRAS
    bill.entries.forEach((entry) => {
      const extraEach = entry.amount / entry.people.length
      entry.people.forEach((personKey) => {
        each[personKey] += extraEach
      })
    })

    // SET GROUP PRICE AND MENUS FOR EACH GROUP
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

    // Redundant?
    // SUBSTRACT STORE-PAID PEOPLE
    Object.keys(realPaid).forEach((personKey) => {
      const eachBefore = each[parseInt(personKey, 10)] // 60
      each[parseInt(personKey, 10)] = Math.max(0, each[parseInt(personKey, 10)] - realPaid[personKey]) // 60-500 = -440
      realPaid[personKey] = realPaid[personKey] - eachBefore
      if (realPaid[personKey] < 0) {
        each[parseInt(personKey, 10)] = Math.abs(realPaid[personKey])
        realPaid[personKey] = 0
      }
    })

    each.forEach((ePerson, ePersonKey) => {
      Object.keys(realPaid).forEach((pPersonKey) => { // Find unsatisfied paid person (!= 0)
        const ePerson = each[ePersonKey]
        const pPerson = realPaid[pPersonKey]
        const pPersonKeyInt = parseInt(pPersonKey, 10)
        if (pPerson === 0 || ePerson === 0) return // Already got from all others / paid, skip this one
        if (parseInt(ePersonKey, 10) === parseInt(pPersonKey, 10)) { // Same eat and pay person
          // realPaid[pPersonKeyInt] = pPerson - ePerson // Substract the paid amount that they paid
          // each[ePersonKey] = 0 // = Paid themselves
          // result.people[ePersonKey].payTo[pPersonKeyInt] = -1
          // result.people[pPersonKeyInt].getFrom[ePersonKey] = -1
        } else { // Different
          let paid = ePerson // 180
          realPaid[pPersonKey] = pPerson - ePerson // 100 - 180 = -80
          if (realPaid[pPersonKey] < 0) {
            paid = ePerson - Math.abs(realPaid[pPersonKey]) // Restore substracted value // 80
            realPaid[pPersonKey] = 0
          } // Carry the unpaid to the next one
          each[ePersonKey] -= paid // e = 100, paid = 80
          result.people[ePersonKey].payTo[pPersonKeyInt] = paid // Substract down
          result.people[pPersonKeyInt].getFrom[ePersonKey] = paid
        }
      })
    })

    // SUMMARY GENERATOR

    return result
  }
}
