import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  supportCircular: true
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userinfo: {
      name: '',
      promptpay: {
        id: ''
      },
      secondary: []
    },
    gimme: {
      amount: 0,
      note: ''
    },
    bills: []
  },
  mutations: {
    'UPDATE_GIMME' (state, payload) {
      state.gimme = payload
    },
    'UPDATE_USERINFO' (state, payload) {
      state.userinfo = payload
    },
    'UPDATE_BILLS' (state, payload) {
      state.bills = payload
    }
  },
  actions: {
    updateGimme (context, payload) {
      context.commit('UPDATE_GIMME', payload)
    },
    updateUserinfo (context, payload) {
      context.commit('UPDATE_USERINFO', payload)
    },
    updateBills (context, payload) {
      context.commit('UPDATE_BILLS', payload)
      // const bills = payload
      // bills.forEach((elm, i) => {
      //   let newPayers = ''
      //   Object.keys(bills[i].payers).forEach((pKey) => {
      //     const amount = bills[i].payers[pKey]
      //     newPayers += `${pKey},${amount}/`
      //   })
      //   newPayers = newPayers.substring(0, newPayers.length - 1)
      //   bills[i].payers = newPayers
      // })
      // context.commit('UPDATE_BILLS', bills)
    }
  },
  getters: {
    bills (state) {
      return state.bills
      // const bills = state.bills
      // bills.forEach((bill, i) => {
      //   let newPayers = {}
      //   console.log(bill)
      //   bill.payers.split('/').forEach((str) => {
      //     const person = str.split(',')
      //     newPayers['' + person[0]] = person[1]
      //   })
      //   bills[i].payers = newPayers
      // })
      // return bills
    }
  },
  plugins: [vuexLocal.plugin]
})
