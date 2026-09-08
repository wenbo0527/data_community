import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
export * from './modules/app'
export * from '../stores/user'
export * from './modules/model-offline'
export * from './modules/variable'
export { useRegistryStore } from './modules/registry'