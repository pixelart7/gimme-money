import { useStorage as vueUseStorage } from '@vueuse/core'

export function useStore() {
  const vue2Migration1 = vueUseStorage('vuex_store', undefined, localStorage)
  const vue2Migration2 = vueUseStorage('vuex', undefined, localStorage)

  const store = vueUseStorage('gimme_store', {
    version: 1,
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
  }, localStorage)

  onMounted(() => {
    if (vue2Migration1.value && store.value.version === 1) {
      store.value = {
        version: 2,
        ...JSON.parse(vue2Migration1.value)
      }
      vue2Migration1.value = undefined
    } else if (vue2Migration2.value && store.value.version === 1) {
      store.value = {
        version: 2,
        ...JSON.parse(vue2Migration2.value)
      }
      vue2Migration2.value = undefined
    } else {
      store.value.version = 2
    }
  })

  return {
    store
  }
}