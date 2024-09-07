import { expect } from 'chai'
import Cal from '@/calculator.js'

describe('Calculator', () => {
  it('calculate change correctly with one payer', () => {
    const result = Cal.calculate({
      note: 'Evenly Bill',
      amount: 500,
      peopleNames: ['$', 'Foo', '', '', ''],
      numsOfPeople: 5,
      datetime: '', // doesn't matter
      payers: [
        { person: 0, amount: 500 }
      ],
      entries: []
    })

    expect(result.changeFromStore[0]).to.equal(0)
    expect(result.changeFromStore[1]).to.equal(-1)
    expect(result.changeFromStore[2]).to.equal(-1)
    expect(result.changeFromStore[3]).to.equal(-1)
    expect(result.changeFromStore[4]).to.equal(-1)
  })

  it('calculate change correctly with more than one payer', () => {
    const result = Cal.calculate({
      note: 'Evenly Bill',
      amount: 750,
      peopleNames: ['$', 'Foo', '', '', ''],
      numsOfPeople: 5,
      datetime: '', // doesn't matter
      payers: [
        { person: 0, amount: 500 },
        { person: 1, amount: 500 }
      ],
      entries: []
    })

    expect(result.changeFromStore[0]).to.equal(0)
    expect(result.changeFromStore[1]).to.equal(250)
    expect(result.changeFromStore[2]).to.equal(-1)
    expect(result.changeFromStore[3]).to.equal(-1)
    expect(result.changeFromStore[4]).to.equal(-1)
  })

  it('seperate price evenly', () => {
    const result = Cal.calculate({
      note: 'Evenly Bill',
      amount: 500,
      peopleNames: ['$', 'Foo', '', '', ''],
      numsOfPeople: 5,
      datetime: '', // doesn't matter
      payers: [
        { person: 0, amount: 500 }
      ],
      entries: []
    })

    expect(result.people[0].getFrom[0]).to.equal(-1)
    expect(result.people[0].getFrom[1]).to.equal(100)
    expect(result.people[0].getFrom[2]).to.equal(100)
    expect(result.people[0].getFrom[3]).to.equal(100)
    expect(result.people[0].getFrom[4]).to.equal(100)
    expect(result.people[0].payTo[0]).to.equal(-1)
    expect(result.people[0].payTo[1]).to.equal(-1)
    expect(result.people[0].payTo[2]).to.equal(-1)
    expect(result.people[0].payTo[3]).to.equal(-1)
    expect(result.people[0].payTo[4]).to.equal(-1)

    expect(result.people[1].getFrom[0]).to.equal(-1)
    expect(result.people[1].getFrom[1]).to.equal(-1)
    expect(result.people[1].getFrom[2]).to.equal(-1)
    expect(result.people[1].getFrom[3]).to.equal(-1)
    expect(result.people[1].getFrom[4]).to.equal(-1)
    expect(result.people[1].payTo[0]).to.equal(100)
    expect(result.people[1].payTo[1]).to.equal(-1)
    expect(result.people[1].payTo[2]).to.equal(-1)
    expect(result.people[1].payTo[3]).to.equal(-1)
    expect(result.people[1].payTo[4]).to.equal(-1)
  })

  it('separate price according to extras', () => {
    const result = Cal.calculate({
      note: 'Evenly Bill',
      amount: 500,
      peopleNames: ['$', 'Foo', 'Bar', '', ''], // 60, 160, 160, 60, 60
      numsOfPeople: 5,
      datetime: '', // doesn't matter
      payers: [
        { person: 0, amount: 500 }
      ],
      entries: [{
        note: 'Menu 1, Foo eat with Bar',
        amount: 200,
        people: [1, 2]
      }]
    })

    expect(result.people[0].getFrom[0]).to.equal(-1)
    expect(result.people[0].getFrom[1]).to.equal(160)
    expect(result.people[0].getFrom[2]).to.equal(160)
    expect(result.people[0].getFrom[3]).to.equal(60)
    expect(result.people[0].getFrom[4]).to.equal(60)
    expect(result.people[0].payTo[0]).to.equal(-1)
    expect(result.people[0].payTo[1]).to.equal(-1)
    expect(result.people[0].payTo[2]).to.equal(-1)
    expect(result.people[0].payTo[3]).to.equal(-1)
    expect(result.people[0].payTo[4]).to.equal(-1)

    expect(result.people[1].getFrom[0]).to.equal(-1)
    expect(result.people[1].getFrom[1]).to.equal(-1)
    expect(result.people[1].getFrom[2]).to.equal(-1)
    expect(result.people[1].getFrom[3]).to.equal(-1)
    expect(result.people[1].getFrom[4]).to.equal(-1)
    expect(result.people[1].payTo[0]).to.equal(160)
    expect(result.people[1].payTo[1]).to.equal(-1)
    expect(result.people[1].payTo[2]).to.equal(-1)
    expect(result.people[1].payTo[3]).to.equal(-1)
    expect(result.people[1].payTo[4]).to.equal(-1)
  })

  it('separate price according to extras but with two payers', () => {
    const result = Cal.calculate({
      note: 'Evenly Bill but with Two Payers',
      amount: 500,
      peopleNames: ['$', 'Foo', 'Bar', '', ''], // 60, 160, 160, 60, 60
      numsOfPeople: 5,
      datetime: '', // doesn't matter
      payers: [ // 300, 200
        { person: 0, amount: 300 },
        { person: 1, amount: 200 }
      ], // Get -> 240, 40, 0, 0, 0
      entries: [{
        note: 'Menu 1, Foo eat with Bar',
        amount: 200,
        people: [1, 2]
      }]
    })

    expect(result.people[0].getFrom[0]).to.equal(-1)
    expect(result.people[0].getFrom[1]).to.equal(-1)
    expect(result.people[0].getFrom[2]).to.equal(160)
    expect(result.people[0].getFrom[3]).to.equal(60)
    expect(result.people[0].getFrom[4]).to.equal(20)
    expect(result.people[0].payTo[0]).to.equal(-1)
    expect(result.people[0].payTo[1]).to.equal(-1)
    expect(result.people[0].payTo[2]).to.equal(-1)
    expect(result.people[0].payTo[3]).to.equal(-1)
    expect(result.people[0].payTo[4]).to.equal(-1)

    expect(result.people[1].getFrom[0]).to.equal(-1)
    expect(result.people[1].getFrom[1]).to.equal(-1)
    expect(result.people[1].getFrom[2]).to.equal(-1)
    expect(result.people[1].getFrom[3]).to.equal(-1)
    expect(result.people[1].getFrom[4]).to.equal(40)
    expect(result.people[1].payTo[0]).to.equal(-1)
    expect(result.people[1].payTo[1]).to.equal(-1)
    expect(result.people[1].payTo[2]).to.equal(-1)
    expect(result.people[1].payTo[3]).to.equal(-1)
    expect(result.people[1].payTo[4]).to.equal(-1)
  })
})
