import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    loggedIn: true,
    roles: [] as string[]
  }),
  actions: {
    login() { this.loggedIn = true },
    logout() { this.loggedIn = false }
  }
})
