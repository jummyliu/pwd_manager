import * as types from '../types'

const state = {
  isMaximized: false,
  title: ''
}

const mutations = {
  [types.APP_CHANGE_MAXIMIZED] (state, payload = false) {
    state.isMaximized = payload
  },
  [types.APP_CHANGE_TITLE] (state, payload = {}) {
    state.title = payload.title || ''
  }
}

const actions = {}

const getters = {}

export default {
  state,
  mutations,
  actions,
  getters,
  namespaced: true
}
