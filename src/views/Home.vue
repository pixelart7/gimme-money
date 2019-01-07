<template lang="pug">
#home(:class="{'push-2': isEditingYourinfo}")
  .overlay-close(@click="isShowAccounts = false", :class="{'is-active': isShowAccounts}")
  AccountsDisplay(:request="request", :userinfo="userinfo", :class="{'is-active': isShowAccounts, 'is-upside-down': isShowAccountsUpSideDown}")
  .container#request-container(:class="{'is-active': !isEditingYourinfo}")
    .username-row
      h3.username {{userinfo.name}}
      button.small.not-important(@click="isEditingYourinfo = true") Edit
    h2 Requesting
    form(@submit.prevent="attemptFormSubmit")
      .input
        label Amount
        .input-row
          span.branding-font.left ฿
          input(type="number", v-model.number="request.amount", @focus="$event.target.select()")
      .input
        label Note
        input(type="text", maxlength="50", v-model="request.note", @focus="$event.target.select()")
        span.help-text {{request.note.length}}/50
      .submission.btn-inline
        button(@click="isShowAccounts = true; isShowAccountsUpSideDown = true;") 💁‍♂️ For Show
        button(@click="isShowAccounts = true; isShowAccountsUpSideDown = false;") 📷 For Screenshot
  .container#yourinfo-container(:class="{'is-active': isEditingYourinfo}")
    h2 Your Info
    h3 PromptPay
    .input
      label Name
      input(type="text", maxlength="50", v-model="userinfo.name")
    .input
      label PromptPay ID
      input(type="number", maxlength="50", v-model="userinfo.promptpay.id")
      span.help-text Phone number or national ID
    //- h3 Secondary Accounts
    //- template(v-for="secondary in userinfo.secondary")
      .input
        label Type
        select(v-model="secondary.category")
          option(value="") Select...
          option(v-for="singleType in allowedTypes", :value="singleType.value") {{singleType.name}}
          option(value="other") Other
      .input
        label Account Number / Account ID
        input(type="text", maxlength="50", v-model="secondary.id")
      .input
        label Account Name
        input(type="text", maxlength="50", v-model="secondary.name")
      .input
        label Other Info
        input(type="text", maxlength="50", v-model="secondary.info")
        span.help-text For example, branch name, branch ID.
    .btn-inline
        button(v-if="isInit", @click="isEditingYourinfo = false; isInit = false") Start!
        button(v-else, @click="isEditingYourinfo = false") ← Go Back
</template>

<script>
import RequestEditor from '@/components/RequestEditor'
import UserInfoEditor from '@/components/UserInfoEditor'

import AccountsDisplay from '@/components/AccountsDisplay'

export default {
  data: () => ({
    isInit: false,
    isEditingYourinfo: false,
    isShowAccounts: false,
    isShowAccountsUpSideDown: false,
    allowedTypes: [
      { name: 'K-Bank', value: 'kbank' }
    ],
    request: {
      amount: 0,
      note: ''
    },
    userinfo: {
      name: '',
      promptpay: {
        id: ''
      },
      secondary: []
    }
  }),
  created() {
    if (window.localStorage.getItem('gm-request') === null && window.localStorage.getItem('gm-userinfo') === null) {
      window.localStorage.setItem('gm-request', JSON.stringify(this.request));
      window.localStorage.setItem('gm-userinfo', JSON.stringify(this.userinfo));
    } else {
      const req = JSON.parse(window.localStorage.getItem('gm-request'));
      const user = JSON.parse(window.localStorage.getItem('gm-userinfo'));
      this.$set(this.request, 'amount', req.amount);
      this.$set(this.request, 'note', req.note);
      this.$set(this.userinfo, 'name', user.name);
      this.$set(this.userinfo.promptpay, 'id', user.promptpay.id);
      this.$set(this.userinfo, 'secondary', user.secondary);
    }
    if (this.userinfo.name === '' || this.userinfo.promptpay.id === '') {
      this.isEditingYourinfo = true;
      this.isInit = true;
    }
  },
  watch: {
    request: {
      handler() {
        window.localStorage.setItem('gm-request', JSON.stringify(this.request));
      }, deep: true
    },
    userinfo: {
      handler() {
        window.localStorage.setItem('gm-userinfo', JSON.stringify(this.userinfo));
      }, deep: true
    }
  },
  // { category: '', id: '', name: '', info: '' }
  methods: {
    attemptFormSubmit () {
      document.activeElement.blur()
    }
  },
  components: {
    RequestEditor,
    UserInfoEditor,
    AccountsDisplay
  }
}
</script>

<style lang="scss">
#home {
  position: fixed;
  bottom: 24px;
  left: 0px;
  right: 0px;
  display: flex;
  align-items: flex-end;
  width: 200vw;
  &.push-2 {
    margin-left: calc(-100vw);
  }
  .container {
    width: calc(200vw - 48px);
  }
  .username-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    .username {
      margin: 0px;
      margin-right: 8px;
    }
  }
  & > .container > h2 {
    margin-top: 0;
  }
  .submission {
    margin-top: 32px;
  }
  .overlay-close {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: #777;
    opacity: 0;
    pointer-events: none;
    transition: all 0.25s;
    &.is-active {
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
