import { reactive, nextTick } from 'vue'
import { useStructuredLayout } from './useStructuredLayout.js'

const SUPPORTED_TYPES = ['start','crowd-split','event-split','ab-test','ai-call','sms','manual-call','wait','benefit']

export const useConfigDrawers = (getGraph, { updateNodeFromConfig }) => {
  const structuredLayout = useStructuredLayout(getGraph)
  const drawerStates = reactive({
    start: { visible: false, data: {}, instance: null, readOnly: false },
    'crowd-split': { visible: false, data: {}, instance: null, readOnly: false },
    'event-split': { visible: false, data: {}, instance: null, readOnly: false },
    'ab-test': { visible: false, data: {}, instance: null, readOnly: false },
    'ai-call': { visible: false, data: {}, instance: null, readOnly: false },
    sms: { visible: false, data: {}, instance: null, readOnly: false },
    'manual-call': { visible: false, data: {}, instance: null, readOnly: false },
    wait: { visible: false, data: {}, instance: null, readOnly: false },
    benefit: { visible: false, data: {}, instance: null, readOnly: false }
  })

  const normalizeType = (type) => {
    if (!type) return 'sms'
    const t = String(type)
    if (SUPPORTED_TYPES.includes(t)) return t
    // 简单映射
    if (t === 'audience-split') return 'crowd-split'
    return 'sms'
  }

  const closeAllDrawers = (exclude) => {
    Object.keys(drawerStates).forEach(key => {
      if (key !== exclude && drawerStates[key].visible) {
        drawerStates[key].visible = false
        drawerStates[key].data = {}
        drawerStates[key].instance = null
      }
    })
  }

  const openConfigDrawer = (type, node, data = {}) => {
    const drawerType = normalizeType(type)
    nextTick(() => {
      closeAllDrawers(drawerType)
      const payload = { ...data, nodeId: node?.id, nodeType: drawerType, isNewNode: !data || !Object.keys(data).length }
      drawerStates[drawerType].visible = true
      drawerStates[drawerType].data = payload
      drawerStates[drawerType].instance = node
      drawerStates[drawerType].readOnly = !!payload.__readOnly
    })
  }

  const closeConfigDrawer = (drawerType) => {
    const key = normalizeType(drawerType)
    nextTick(() => {
      drawerStates[key].visible = false
      drawerStates[key].data = {}
      drawerStates[key].instance = null
    })
  }

  const handleConfigConfirm = (drawerType, config) => {
    const key = normalizeType(drawerType)
    const g = getGraph && getGraph()
    const node = drawerStates[key].instance || (g?.getSelectedCells?.()?.[0])
    if (node && typeof updateNodeFromConfig === 'function') {
      const type = node.getData?.()?.nodeType || node.getData?.()?.type || key
      updateNodeFromConfig(node, type, config || {})
    }
    closeConfigDrawer(key)
  }

  const handleConfigCancel = (drawerType) => closeConfigDrawer(drawerType)

  const handleDrawerVisibilityChange = ({ drawerType, visible }) => {
    const key = normalizeType(drawerType)
    if (!visible) closeConfigDrawer(key)
  }

  return { drawerStates, openConfigDrawer, closeConfigDrawer, handleConfigConfirm, handleConfigCancel, handleDrawerVisibilityChange, structuredLayout }
}
