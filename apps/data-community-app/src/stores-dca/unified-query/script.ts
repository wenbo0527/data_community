/**
 * 统一查询 · 脚本域 store(F13-F20)
 *
 * 之所以放 Pinia 而不是组件本地状态:
 *  F11 在 SQL 编辑页保存脚本 → 脚本管理页立即可见,
 *  F15/F20 在脚本管理页打开/运行 → SQL 编辑页拿到内容,
 *  两个路由页必须共享同一份数据源(设计文档 §7.1 数据联动)。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { MY_SCRIPT_FOLDERS, NEW_SCRIPT_TEMPLATE, SEED_SCRIPTS, SHARED_SCRIPT_FOLDERS } from '@/mock/unified-query/scripts'
import type { DataSourceKey, ScriptFolder, ScriptRecord, ScriptScope } from '@/mock/unified-query/types'

let seq = SEED_SCRIPTS.length

function nextId(): string {
  seq += 1
  return `SC${(900 + seq).toString().padStart(3, '0')}`
}

function now(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const useUqScriptStore = defineStore('uqScript', () => {
  const list = ref<ScriptRecord[]>(SEED_SCRIPTS.map(s => ({ ...s })))
  const folders = ref<ScriptFolder[]>([...MY_SCRIPT_FOLDERS, ...SHARED_SCRIPT_FOLDERS])

  /** 当前登录人(Mock,不做真实登录) */
  const currentOwner = '张文博'

  const getById = (id: string) => list.value.find(s => s.id === id) ?? null

  const byScope = (scope: ScriptScope) => list.value.filter(s => s.scope === scope)

  /** 关键字搜索(F14):命中脚本名或 SQL 正文 */
  function search(keyword: string, scope?: ScriptScope): ScriptRecord[] {
    const kw = keyword.trim().toLowerCase()
    const base = scope ? byScope(scope) : list.value
    if (!kw) return base
    return base.filter(s => s.name.toLowerCase().includes(kw) || s.sql.toLowerCase().includes(kw))
  }

  /** 某个目录下的脚本;folderKey 传 null 取根目录脚本 */
  function inFolder(scope: ScriptScope, folderKey: string | null): ScriptRecord[] {
    return byScope(scope).filter(s => s.folderKey === folderKey)
  }

  function add(payload: {
    name: string
    datasource: DataSourceKey
    sql: string
    scope?: ScriptScope
    folderKey?: string | null
  }): ScriptRecord {
    const record: ScriptRecord = {
      id: nextId(),
      name: payload.name,
      datasource: payload.datasource,
      scope: payload.scope ?? 'mine',
      folderKey: payload.folderKey ?? null,
      sql: payload.sql,
      owner: currentOwner,
      updatedAt: now()
    }
    list.value.unshift(record)
    return record
  }

  /** 同名则覆盖(F17 保存),返回是否走了新建分支 */
  function saveAs(payload: {
    name: string
    datasource: DataSourceKey
    sql: string
    scope?: ScriptScope
    folderKey?: string | null
  }): { record: ScriptRecord; created: boolean } {
    const exist = list.value.find(
      s => s.name === payload.name && s.scope === (payload.scope ?? 'mine')
    )
    if (exist) {
      exist.sql = payload.sql
      exist.datasource = payload.datasource
      exist.folderKey = payload.folderKey ?? exist.folderKey
      exist.updatedAt = now()
      return { record: exist, created: false }
    }
    return { record: add(payload), created: true }
  }

  function update(id: string, patch: Partial<ScriptRecord>) {
    const item = getById(id)
    if (item) {
      Object.assign(item, patch, { updatedAt: now() })
    }
  }

  function remove(id: string) {
    const idx = list.value.findIndex(s => s.id === id)
    if (idx > -1) list.value.splice(idx, 1)
  }

  function addFolder(scope: ScriptScope, title: string) {
    const key = `${scope === 'mine' ? 'mine' : 'shared'}/${title}`
    if (folders.value.some(f => f.key === key)) return null
    const folder: ScriptFolder = { key, title }
    folders.value.push(folder)
    return folder
  }

  /** 目录树(F13):共享脚本 / 我的脚本 两个根,下挂文件夹与脚本 */
  const scopeOf = (folderKey: string | null | undefined): ScriptScope =>
    folderKey?.startsWith('shared/') ? 'shared' : 'mine'

  const tree = computed(() => {
    const buildScope = (scope: ScriptScope) => {
      const scopeFolders = folders.value.filter(f => scopeOf(f.key) === scope)
      return {
        key: scope,
        title: scope === 'shared' ? '共享脚本' : '我的脚本',
        children: [
          ...scopeFolders.map(f => ({
            key: f.key,
            title: f.title,
            children: list.value
              .filter(s => s.scope === scope && s.folderKey === f.key)
              .map(s => ({ key: `script:${s.id}`, title: s.name, raw: s }))
          })),
          ...list.value
            .filter(s => s.scope === scope && !s.folderKey)
            .map(s => ({ key: `script:${s.id}`, title: s.name, raw: s }))
        ]
      }
    }
    return [buildScope('shared'), buildScope('mine')]
  })

  return {
    list,
    folders,
    tree,
    currentOwner,
    getById,
    byScope,
    search,
    inFolder,
    add,
    saveAs,
    update,
    remove,
    addFolder,
    template: NEW_SCRIPT_TEMPLATE
  }
})
