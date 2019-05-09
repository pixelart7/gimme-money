import Vue from 'vue'
import Router from 'vue-router'
import Gimme from './views/Gimme.vue'
import Info from './views/Info.vue'
import Split from './views/Split.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gimme',
      component: Gimme
    },
    {
      path: '/info',
      name: 'info',
      component: Info
    },
    {
      path: '/split',
      name: 'split',
      component: Split
    }
  ]
})
