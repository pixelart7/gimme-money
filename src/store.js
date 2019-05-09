import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage
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
    }
  },
  plugins: [vuexLocal.plugin]
})
