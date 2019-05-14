import Vue from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock, faUser, faUserPlus, faUsers, faPencilAlt, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faTimesCircle, faSquare, faCheckSquare, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

library.add(faLock, faGithub, faUser, faUserPlus, faUsers, faPencilAlt, faTimesCircle, faSquare, faCheckSquare, faTrashAlt, faCheck)

Vue.component('font-awesome-icon', FontAwesomeIcon)

dayjs.extend(relativeTime)

Vue.use({
  install (V) {
    V.prototype.$dayjs = dayjs
  }
})

Vue.config.productionTip = false

store.subscribe((mutation, state) => {
  localStorage.setItem('vuex_store', JSON.stringify(state))
})

new Vue({
  router,
  store,
  // beforeCreate () {
  //   this.$store.commit('INIT_STORE')
  // },
  render: h => h(App)
}).$mount('#app')

window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
})

window.addEventListener('DOMContentLoaded', () => {
  let vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
})
