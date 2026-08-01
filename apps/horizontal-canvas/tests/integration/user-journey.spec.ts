import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * 用户旅程集成测试
 * 说明：用依赖注入 + 内存化的 Tracker / TaskStorage / Message / Modal / 模拟 graph，
 *      完整跑通：保存草稿 → 发布 → 提交审批 → 漏斗归因。
 * 边界：纯算法与状态组合，不依赖 Vue 渲染；不接 DOM/X6。
 */

const STORAGE_KEY = 'horizontal_canvas_tasks'
const TRACKER_KEY = 'horizontal_canvas_tracker_events'
const FUNNEL_KEY = 'horizontal_canvas_tracker_funnel'
const SESSION_KEY = 'horizontal_canvas_tracker_session'

function clearAll() {
  for (const k of [STORAGE_KEY, TRACKER_KEY, FUNNEL_KEY, SESSION_KEY]) {
    try { localStorage.removeItem(k) } catch {}
  }
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function readObj(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

function makeTracker() {
  return {
    _events: [],
    track(event, payload = {}) {
      this._events.push({ event, ts: Date.now(), ...payload })
      const all = readJson(TRACKER_KEY)
      all.push({ event, ts: Date.now(), ...payload })
      localStorage.setItem(TRACKER_KEY, JSON.stringify(all))
    },
    trackFunnelStep(funnelId, stepKey, payload = {}) {
      const all = readObj(FUNNEL_KEY)
      const k = `${sessionStorage.getItem(SESSION_KEY) || 'sess_default'}|${funnelId}`
      const cur = all[k] || { firstTs: Date.now(), steps: {} }
      if (!cur.steps[stepKey]) cur.steps[stepKey] = { ts: Date.now(), payload }
      all[k] = cur
      localStorage.setItem(FUNNEL_KEY, JSON.stringify(all))
    },
    clearEvents() { localStorage.removeItem(TRACKER_KEY); this._events = [] },
    clearFunnelState() { localStorage.removeItem(FUNNEL_KEY) }
  }
}

function makeMessage() {
  const calls = { success: [], error: [], warning: [], loading: [] }
  return {
    success: (...a) => calls.success.push(a),
    error: (...a) => calls.error.push(a),
    warning: (...a) => calls.warning.push(a),
    loading: (...a) => calls.loading.push(a),
    calls
  }
}

function makeTaskStorage(initial = []) {
  return {
    list: [...initial],
    getTaskById(id) { return this.list.find(t => String(t.id) === String(id)) || null },
    createTask(meta) {
      const id = Date.now()
      const task = {
        id: String(id),
        version: meta.version || 1,
        status: meta.status || 'draft',
        ...meta,
        versions: [{ version: meta.version || 1, status: meta.status || 'draft', approvalStatus: null, approvalFlow: [], canvasData: meta.canvasData || { nodes: [], connections: [] } }]
      }
      this.list.push(task)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
      return task
    },
    updateTask(id, patch) {
      const t = this.list.find(x => String(x.id) === String(id))
      if (!t) return null
      Object.assign(t, patch)
      const v = t.versions?.find(v => Number(v.version) === Number(patch.version || t.version))
      if (v && patch.canvasData) v.canvasData = patch.canvasData
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
      return t
    },
    submitApproval(id, version, by, remark) {
      const t = this.list.find(x => String(x.id) === String(id))
      if (!t) return false
      const v = t.versions?.find(v => Number(v.version) === Number(version))
      if (!v) return false
      t.status = 'pending_approval'
      v.approvalStatus = 'pending_approval'
      v.approvalFlow = v.approvalFlow || []
      v.approvalFlow.push({ action: 'submit', by, at: new Date().toISOString(), remark: remark || '' })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.list))
      return true
    }
  }
}

function makeGraph() {
  const cells = new Map()
  return {
    addNode: vi.fn((spec) => { const c = { id: spec.id, ...spec }; cells.set(c.id, c); return c }),
    removeEdge: vi.fn(),
    getNodes: () => Array.from(cells.values()),
    getOutgoingEdges: () => [],
    pageToLocal: (x, y) => ({ x, y }),
    cleanSelection: vi.fn(),
    clearCells: vi.fn(),
    freeze: vi.fn(), unfreeze: vi.fn(),
    _cells: cells
  }
}

describe('用户旅程 集成测试', () => {
  beforeEach(() => { clearAll() })

  it('J1: 完整画布任务生命周期（新建→保存→发布）', async () => {
    const tracker = makeTracker()
    const Message = makeMessage()
    const TaskStorage = makeTaskStorage()
    const graph = makeGraph()
    const saveTaskSvc = vi.fn((meta, canvasData) => TaskStorage.createTask({ ...meta, canvasData }))
    const publishTaskSvc = vi.fn((meta, canvasData) => TaskStorage.createTask({ ...meta, canvasData, status: 'published' }))

    const state = { taskName: 'test', taskDescription: '', taskVersion: 1, isEditMode: false, editingTaskId: null, currentUser: 'tester' }
    const setters = {
      setTaskStatus: (v) => { state.taskStatus = v },
      setIsDirty: (v) => { state.isDirty = v },
      setPublishReady: () => {},
      setPublishMessages: () => {},
      setApprovalStatus: () => {},
      setIsEditMode: (v) => { state.isEditMode = v },
      setEditingTaskId: (v) => { state.editingTaskId = v },
      setTaskVersion: (v) => { state.taskVersion = v }
    }
    const getters = {
      getGraph: () => graph,
      getTaskName: () => state.taskName,
      getTaskDescription: () => state.taskDescription,
      getTaskVersion: () => state.taskVersion,
      getIsEditMode: () => state.isEditMode,
      getEditingTaskId: () => state.editingTaskId,
      getEditingTaskVersion: () => state.taskVersion,
      getCurrentUser: () => state.currentUser
    }

    const validateForPublish = vi.fn(() => ({ pass: true, messages: [], details: [] }))
    const collectCanvasData = vi.fn(() => ({ nodes: [{ id: 'start', type: 'start' }], connections: [] }))
    const router = { replace: vi.fn() }
    const onShowValidation = vi.fn()

    const { useCanvasPersistence } = await import('../../src/composables/canvas/useCanvasPersistence.js')
    const p = useCanvasPersistence({
      ...getters, ...setters,
      Message, validateForPublish, collectCanvasData,
      TaskStorage, saveTaskSvc, publishTaskSvc,
      tracker, router, onShowValidation
    })

    // 1) 保存草稿（新建路径）
    const saved = await p.saveDraft()
    expect(saved).toBe(true)
    expect(state.editingTaskId).toBeTruthy()
    expect(state.isEditMode).toBe(true)
    expect(state.taskStatus).toBe('draft')
    expect(Message.calls.success.length).toBe(1)
    expect(router.replace).toHaveBeenCalled()
    expect(TaskStorage.list.length).toBe(1)

    // 2) 发布
    const published = await p.publish()
    expect(published).toBe(true)
    expect(state.taskStatus).toBe('published')
    expect(TaskStorage.list[0].status).toBe('published')

    // 3) 漏斗：save_draft + publish 触发（canvas_open 由 index.vue 在 loadTaskData 阶段发，本 composable 路径不发）
    const funnel = readObj(FUNNEL_KEY)
    const k = Object.keys(funnel)[0]
    expect(funnel[k].steps).toHaveProperty('save_draft')
    expect(funnel[k].steps).toHaveProperty('publish')

    // 4) tracker 含关键事件
    const events = readJson(TRACKER_KEY).map(e => e.event)
    expect(events).toContain('save_draft')
    expect(events).toContain('publish')
  })

  it('J2: 拖拽节点 → 漏斗 first_node_drop 触发', async () => {
    clearAll()
    const tracker = makeTracker()
    const Message = makeMessage()
    const graph = makeGraph()

    const { useCanvasDrop } = await import('../../src/composables/canvas/useCanvasDrop.js')
    const drop = useCanvasDrop({
      getGraph: () => graph,
      getIsViewMode: () => false,
      createVueShapeNode: (spec) => spec,
      getNodeLabel: (t) => `LABEL_${t}`,
      insertTouchComboNodes: () => [],
      highlightNodes: vi.fn(),
      setPendingCreatePoint: vi.fn(),
      setPendingInsertionEdge: vi.fn(),
      Message, log: { warn: vi.fn() },
      tracker,
      getEditingTaskId: () => '1001',
      getEditingTaskVersion: () => 1,
      TOUCH_COMBOS: {}
    })

    drop.onCanvasDrop({
      preventDefault: vi.fn(),
      pageX: 100, pageY: 100, offsetX: 0, offsetY: 0,
      dataTransfer: { getData: (k) => k === 'nodeType' ? 'sms' : '' }
    })

    const events = readJson(TRACKER_KEY).map(e => e.event)
    expect(events).toContain('node_drop')
    const funnel = readObj(FUNNEL_KEY)
    const k = Object.keys(funnel)[0]
    expect(funnel[k].steps).toHaveProperty('first_node_drop')
  })

  it('J3: 校验失败阻断发布 → 触发 validate_fail + showValidation', async () => {
    clearAll()
    const tracker = makeTracker()
    const Message = makeMessage()
    const TaskStorage = makeTaskStorage()
    const graph = makeGraph()
    const state = { taskName: 'test', taskVersion: 1, isEditMode: false, editingTaskId: null, currentUser: 'tester' }
    const setters = {
      setTaskStatus: (v) => { state.taskStatus = v },
      setIsDirty: (v) => { state.isDirty = v },
      setPublishReady: (v) => { state.publishReady = v },
      setPublishMessages: (v) => { state.publishMessages = v },
      setApprovalStatus: () => {},
      setIsEditMode: () => {},
      setEditingTaskId: () => {},
      setTaskVersion: () => {}
    }
    const getters = {
      getGraph: () => graph,
      getTaskName: () => state.taskName,
      getTaskDescription: () => '',
      getTaskVersion: () => state.taskVersion,
      getIsEditMode: () => state.isEditMode,
      getEditingTaskId: () => state.editingTaskId,
      getEditingTaskVersion: () => state.taskVersion,
      getCurrentUser: () => state.currentUser
    }
    const validateForPublish = vi.fn(() => ({ pass: false, messages: ['缺少开始节点'], details: [{ kind: 'no-start' }] }))
    const collectCanvasData = vi.fn(() => ({ nodes: [], connections: [] }))
    const router = { replace: vi.fn() }
    const onShowValidation = vi.fn()

    const { useCanvasPersistence } = await import('../../src/composables/canvas/useCanvasPersistence.js')
    const p = useCanvasPersistence({
      ...getters, ...setters,
      Message, validateForPublish, collectCanvasData,
      TaskStorage, saveTaskSvc: vi.fn(), publishTaskSvc: vi.fn(),
      tracker, router, onShowValidation
    })

    const ok = await p.publish()
    expect(ok).toBe(false)
    expect(onShowValidation).toHaveBeenCalledWith(['缺少开始节点'], [{ kind: 'no-start' }])
    const events = readJson(TRACKER_KEY).map(e => e.event)
    expect(events).toContain('validate_fail')
    // 不应该发布，TaskStorage 仍空
    expect(TaskStorage.list.length).toBe(0)
  })

  it('J4: 提交审批后状态联动', async () => {
    clearAll()
    const tracker = makeTracker()
    const Message = makeMessage()
    const TaskStorage = makeTaskStorage([{
      id: '5',
      name: 'preexisting',
      version: 1,
      status: 'draft',
      versions: [{ version: 1, status: 'draft', approvalStatus: null, approvalFlow: [], canvasData: { nodes: [], connections: [] } }]
    }])
    const graph = makeGraph()
    const validateForPublish = vi.fn(() => ({ pass: true, messages: [], details: [] }))
    const collectCanvasData = vi.fn(() => ({ nodes: [{ id: 'start', type: 'start' }], connections: [] }))
    const setters = {
      setTaskStatus: () => {}, setIsDirty: () => {},
      setPublishReady: () => {}, setPublishMessages: () => {},
      setApprovalStatus: (v) => { },
      setIsEditMode: () => {}, setEditingTaskId: () => {}, setTaskVersion: () => {}
    }
    const getters = {
      getGraph: () => graph,
      getTaskName: () => 'preexisting',
      getTaskDescription: () => '',
      getTaskVersion: () => 1, getIsEditMode: () => true,
      getEditingTaskId: () => '5', getEditingTaskVersion: () => 1,
      getCurrentUser: () => 'tester'
    }

    const { useCanvasPersistence } = await import('../../src/composables/canvas/useCanvasPersistence.js')
    const p = useCanvasPersistence({
      ...getters, ...setters,
      Message, validateForPublish, collectCanvasData,
      TaskStorage, saveTaskSvc: vi.fn(), publishTaskSvc: vi.fn(),
      tracker, router: { replace: vi.fn() }, onShowValidation: vi.fn()
    })
    const ok = await p.submitApproval()
    expect(ok).toBe(true)
    expect(TaskStorage.list[0].status).toBe('pending_approval')
    expect(TaskStorage.list[0].versions[0].approvalStatus).toBe('pending_approval')
    expect(TaskStorage.list[0].versions[0].approvalFlow.length).toBe(1)
    const events = readJson(TRACKER_KEY).map(e => e.event)
    expect(events).toContain('submit_approval')
  })

  it('J5: 埋点 + 漏斗聚合计算正确', async () => {
    clearAll()
    const { computeFunnel, computeBasicMetrics } = await import('../../src/utils/canvasFunnel.js')
    const { track, trackFunnelStep, resetSession } = await import('../../src/utils/trackerService.js')

    // 会话 1：完整漏斗
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')
    trackFunnelStep('canvas_creation', 'first_node_saved')
    trackFunnelStep('canvas_creation', 'validate_pass')
    trackFunnelStep('canvas_creation', 'save_draft')
    trackFunnelStep('canvas_creation', 'publish')

    // 重置 session 进入第二个会话（仅到 first_node_drop）
    resetSession()
    trackFunnelStep('canvas_creation', 'canvas_open')
    trackFunnelStep('canvas_creation', 'first_node_drop')

    const funnel = computeFunnel()
    expect(funnel.totalSessions).toBe(2)
    expect(funnel.steps[0].count).toBe(2) // canvas_open
    expect(funnel.steps[5].count).toBe(1) // publish
    expect(funnel.steps[5].conversion).toBe(0.5)

    track('save_draft', { taskId: 1, version: 1 })
    track('publish', { taskId: 1, version: 1 })
    track('save_draft', { taskId: 2, version: 1 })
    track('validate_fail', { taskId: 2, version: 1 })
    track('combo_insert', { taskId: 3, version: 1 })
    track('drawer_save', { taskId: 1, version: 1 })
    track('drawer_save_fail', { taskId: 1, version: 1 })

    const m = computeBasicMetrics(JSON.parse(localStorage.getItem('horizontal_canvas_tracker_events')))
    expect(m.totalSaves).toBe(2)
    expect(m.totalPublish).toBe(1)
    expect(m.validateFailCount).toBe(1)
    expect(m.comboInsertCount).toBe(1)
    expect(m.drawerSaveFailRate).toBe(0.5)
  })
})
/*
用途：用户旅程集成测试
说明：覆盖 5 个核心用户旅程：完整生命周期 / 拖拽漏斗 / 校验失败 / 审批 / 漏斗聚合。
边界：使用依赖注入模拟 Vue/Message/Modal/Tracker；不依赖浏览器 DOM。
*/