import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
export * from './modules/app'
export * from './modules/user'