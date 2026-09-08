import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventService } from '../../../pages/marketing/tasks/horizontal/services/EventService.js'

describe('EventService', () => {
  let graph
  let listeners
  let openConfigDrawer
  let setShowNodeSelector
  let setNodeSelectorPosition
  let setNodeSelectorSourceNode
  let setPendingCreatePoint
  let setPendingInsertionEdge
  let deleteNodeCascade
  let getContainerRect
  let setNodeMenuButton
  let setNodeActionsMenu

  beforeEach(() => {
    listeners = new Map()
    graph = {
      on: vi.fn((evt, handler) => listeners.set(evt, handler)),
      removeEdge: vi.fn(),
      localToClient: vi.fn((x, y) => ({ x, y }))
    }
    openConfigDrawer = vi.fn()
    setShowNodeSelector = vi.fn()
    setNodeSelectorPosition = vi.fn()
    setNodeSelectorSourceNode = vi.fn()
    setPendingCreatePoint = vi.fn()
    setPendingInsertionEdge = vi.fn()
    deleteNodeCascade = vi.fn()
    getContainerRect = vi.fn(() => ({ left: 10, top: 20 }))
    setNodeMenuButton = vi.fn()
    setNodeActionsMenu = vi.fn()

    const service = new EventService({
      graph,
      openConfigDrawer,
      setShowNodeSelector,
      setNodeSelectorPosition,
      setNodeSelectorSourceNode,
      setPendingCreatePoint,
      setPendingInsertionEdge,
      deleteNodeCascade,
      getContainerRect,
      setNodeMenuButton,
      setNodeActionsMenu
    })
    service.bindGraphEvents(graph)
  })

  it('node:click 打开抽屉', () => {
    const node = { getData: () => ({ type: 'sms' }) }
    listeners.get('node:click')({ node })
    expect(openConfigDrawer).toHaveBeenCalledWith('sms', node, { type: 'sms' })
  })

  it('edge:contextmenu 删除边', () => {
    const edge = { id: 'e1' }
    listeners.get('edge:contextmenu')({ edge })
    expect(graph.removeEdge).toHaveBeenCalledWith('e1')
  })

  it('blank:click 打开选择器并设置位置', () => {
    listeners.get('blank:click')({ x: 100, y: 200 })
    expect(setPendingCreatePoint).toHaveBeenCalledWith({ x: 100, y: 200 })
    expect(setNodeSelectorPosition).toHaveBeenCalledWith({ x: 100, y: 200 })
    expect(setNodeSelectorSourceNode).toHaveBeenCalledWith(null)
    expect(setShowNodeSelector).toHaveBeenCalledWith(true)
    expect(setNodeActionsMenu).toHaveBeenCalled()
  })

  it('node:contextmenu 触发级联删除', () => {
    const node = { id: 'n1' }
    listeners.get('node:contextmenu')({ node })
    expect(deleteNodeCascade).toHaveBeenCalledWith('n1')
  })

  it('node:mouseenter 显示菜单按钮', () => {
    const node = {
      id: 'n2',
      getBBox: () => ({ x: 50, y: 60, width: 100, height: 40 })
    }
    listeners.get('node:mouseenter')({ node })
    expect(setNodeMenuButton).toHaveBeenCalled()
    const arg = setNodeMenuButton.mock.calls[0][0]
    expect(arg.visible).toBe(true)
    expect(arg.nodeId).toBe('n2')
  })

  it('edge:mouseenter 插入按钮触发选择器', () => {
    const added = { tools: null }
    const edge = {
      getBBox: () => ({ x: 10, y: 20, width: 60, height: 20 }),
      addTools: t => { added.tools = t }
    }
    listeners.get('edge:mouseenter')({ edge })
    const btn = added.tools.find(t => t.name === 'button')
    btn.args.onClick()
    expect(setPendingInsertionEdge).toHaveBeenCalledWith(edge)
    expect(setShowNodeSelector).toHaveBeenCalledWith(true)
  })
})