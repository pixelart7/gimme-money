import Vue from 'vue'
import Router from 'vue-router'
import Gimme from './views/Gimme.vue'
import Info from './views/Info.vue'
import Split from './views/Split.vue'
import BillEditor from './views/BillEditor.vue'
import BillView from './views/BillView.vue'

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
    },
    {
      path: '/bill/new',
      name: 'billNew',
      component: BillEditor
    },
    {
      path: '/bill/edit/:index',
      name: 'billEdit',
      component: BillEditor
    },
    {
      path: '/bill/view/:index',
      name: 'billView',
      component: BillView
    }
  ]
})
