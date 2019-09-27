<template>
  <div id="app">
    <AppHeader />
    <div id="app-content">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import * as types from '@/store/types'
export default {
  name: 'app',
  methods: {
    ...mapMutations('app', [types.APP_CHANGE_TITLE])
  },
  watch: {
    '$route' (val) {
      this[types.APP_CHANGE_TITLE]({
        title: val.meta ? val.meta.desc : ''
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  // text-align: center;

  #nav {
    padding: 30px;
    a {
      font-weight: bold;
      color: #2c3e50;
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }

  #app-content {
    overflow: hidden;
    flex: 1;

    padding: 20px 20px;
  }
}
</style>
