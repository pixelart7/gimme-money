<template lang="pug">
#app
  router-view
</template>

<style lang="scss">
@import '~sanitize.css';
@import url('https://fonts.googleapis.com/css?family=Roboto+Mono:400,500,700');

$branding-font: 'Roboto Mono', monospace;
$subtle-black: #212121;
$subtle-grey: #757575;
$subtle-white: #fafafa;

* {
  color: $subtle-black;
  transition: all 0.15s;
}

textarea, select, input, button { outline: none; }

textarea { resize: none; }

h1, h2, h3, h4, h5, h6, button {
  font-family: $branding-font;
}

.branding-font {
  font-family: $branding-font;
}

.container {
  margin: 24px;
  margin-top: 48px;
  max-width: 420px;
}

button {
  border: 2px solid $subtle-black;
  background: #ffffff;
  padding: 8px 16px;
  font-weight: 500;
  border-radius: 6px;
  &:hover {
    background: darken(#ffffff, 4);
  }
  &.primary {
    color: #2196F3;
    border-color: #2196F3;
  }
  &.small {
    font-size: 12px;
    padding: 4px 8px;
    height: 32px;
  }
  &.not-important {
    color: $subtle-grey;
    border-color: $subtle-grey;
  }
}

.input {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  label {
    font-family: $branding-font;
    font-weight: 500;
    font-size: 16px;
    margin-bottom: 4px;
    color: $subtle-grey;
  }
  input, textarea, select {
    border: none;
    border-bottom: 2px solid $subtle-black;
    background: $subtle-white;
    padding: 8px;
    border-radius: 6px 6px 0 0;
    &:focus {
      background: darken($subtle-white, 2);
    }
  }
  select {
    height: 36px;
  }
  input {
    font-size: 16px;
  }
  span.help-text {
    display: flex;
    margin-top: 4px;
    font-family: $branding-font;
    justify-content: flex-end;
    color: $subtle-grey;
    font-size: 14px;
  }
  .input-row {
    input {
      margin: 0 4px;
    }
    & > span {
      &.left {
        margin-right: 4px;
      }
    }
  }
}

.btn-inline {
  margin-right: -8px;
  margin-bottom: -8px;
  button {
    margin-right: 8px;
    margin-bottom: 4px;
  }
}
</style>
