/**
 * 统一查询 · SQL 编辑器 store(F02 / F11 / F15 / F20)
 *
 * Tab 列表放 store 而非组件本地状态,原因:
 *  脚本管理页 F15「打开」/ F20「运行」需要跨路由把脚本内容送进编辑器,
 *  两页必须共享同一份 tab 数据。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { NEW_SCRIPT_TEMPLATE } from '@/mock/unified-query/scripts'
import type { DataSourceKey, ScriptRecord } from '@/mock/unified-query/types'

export interface QueryTab {
  key: string
  title: string
  sql: string
  datasource: DataSourceKey
  /** 关联脚本 id;null 表示尚未保存(F11 保存后回填) */
  scriptId: string | null
  /** 编辑后有未保存改动 */
  dirty: boolean
}

let tabSeq = 0

export const useUqEditorStore = defineStore('uqEditor', () => {
  const tabs = ref<QueryTab[]>([])
  const activeKey = ref('')

  const activeTab = computed(() => tabs.value.find(t => t.key === activeKey.value) ?? null)

  function newTab(title?: string, sql = NEW_SCRIPT_TEMPLATE): QueryTab {
    tabSeq += 1
    const tab: QueryTab = {
      key: `tab-${tabSeq}`,
      title: title ?? `查询-${tabSeq}`,
      sql,
      datasource: 'doris',
      scriptId: null,
      dirty: false
    }
    tabs.value.push(tab)
    activeKey.value = tab.key
    return tab
  }

  /** 保证至少有一个可用 Tab,并返回它 */
  function ensureTab(): QueryTab {
    if (!tabs.value.length) return newTab()
    if (!tabs.value.some(t => t.key === activeKey.value)) activeKey.value = tabs.value[0].key
    return tabs.value.find(t => t.key === activeKey.value)!
  }

  function closeTab(key: string) {
    const idx = tabs.value.findIndex(t => t.key === key)
    if (idx < 0) return
    tabs.value.splice(idx, 1)
    if (!tabs.value.length) {
      newTab()
      return
    }
    if (activeKey.value === key) activeKey.value = tabs.value[Math.min(idx, tabs.value.length - 1)].key
  }

  function setActive(key: string) {
    if (tabs.value.some(t => t.key === key)) activeKey.value = key
  }

  function patch(key: string, data: Partial<QueryTab>) {
    const tab = tabs.value.find(t => t.key === key)
    if (tab) Object.assign(tab, data)
  }

  /** F15 打开脚本:同名 Tab 已存在则激活,否则新建 */
  function openScript(script: ScriptRecord): QueryTab {
    const exist = tabs.value.find(t => t.scriptId === script.id)
    if (exist) {
      activeKey.value = exist.key
      return exist
    }
    tabSeq += 1
    const tab: QueryTab = {
      key: `tab-${tabSeq}`,
      title: script.name,
      sql: script.sql,
      datasource: script.datasource,
      scriptId: script.id,
      dirty: false
    }
    tabs.value.push(tab)
    activeKey.value = tab.key
    return tab
  }

  return { tabs, activeKey, activeTab, newTab, ensureTab, closeTab, setActive, patch, openScript }
})
