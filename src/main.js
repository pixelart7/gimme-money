import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock, faUser, faUserPlus, faUsers, faPencilAlt } from '@fortawesome/free-solid-svg-icons'
// import { faUser } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

library.add(faLock, faGithub, faUser, faUserPlus, faUsers, faPencilAlt)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
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
