import Vue from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock, faUser, faUserPlus, faUsers, faPencilAlt, faCheck, faQrcode, faChevronUp, faChevronDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { faTimesCircle, faSquare, faCheckSquare, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

library.add(faLock, faGithub, faUser, faUserPlus, faUsers, faPencilAlt, faTimesCircle, faSquare, faCheckSquare, faTrashAlt, faCheck, faQrcode, faChevronUp, faChevronDown, faCaretUp)

Vue.component('font-awesome-icon', FontAwesomeIcon)

dayjs.extend(relativeTime)

Sentry.init({
  dsn: 'https://fa136f664b104ebdb5c20e9662e1950d@sentry.io/1509489',
  integrations: [new Integrations.Vue({ Vue, attachProps: true })]
})

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
