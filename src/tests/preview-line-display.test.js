import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('预览线显示逻辑测试', () => {
  let mockEdge
  let mockGraph

  beforeEach(() => {
    // 创建模拟的边对象
    mockEdge = {
      id: 'preview_node_1758007854880_1758007856496',
      getData: vi.fn(() => ({
        type: 'preview-line',
        sourceNodeId: 'node_1758007854880',
        branchLabel: '黑名单'
      })),
      getSourceCellId: vi.fn(() => 'node_1758007854880'),
      getTargetCellId: vi.fn(() => undefined),
      getLabels: vi.fn(() => [
        {
          attrs: {
            text: {
              text: '黑名单'
            }
          },
          position: 0.8
        }
      ])
    }

    // 创建模拟的图对象
    mockGraph = {
      getEdges: vi.fn(() => [mockEdge]),
      getCellById: vi.fn((id) => {
        if (id === 'node_1758007854880') {
          return {
            id: 'node_1758007854880',
            getData: () => ({
              type: 'audience-split',
              config: {
                branches: [
                  { id: '1758007856496im86h6pbv', label: '黑名单' },
                  { id: '1758007856496edu84lywj', label: '低响应客群' },
                  { id: 'unmatch_default', label: '未命中人群' }
                ]
              }
            }),
            getPosition: () => ({ x: 390, y: 360 })
          }
        }
        return null
      })
    }
  })

  describe('预览线源节点显示测试', () => {
    it('应该显示源节点ID而不是undefined', () => {
      const edgeData = mockEdge.getData()
      const sourceId = mockEdge.getSourceCellId()
      const targetId = mockEdge.getTargetCellId()

      // 测试显示逻辑
      const displaySourceId = edgeData.sourceNodeId || sourceId || 'unknown'
      const displayTargetId = targetId || '坐标'

      expect(displaySourceId).toBe('node_1758007854880')
      expect(displayTargetId).toBe('坐标')
      expect(displaySourceId).not.toBe('undefined')
    })

    it('应该正确识别预览线类型', () => {
      const edgeData = mockEdge.getData()
      const isPreviewLine = edgeData.type === 'preview-line'

      expect(isPreviewLine).toBe(true)
    })

    it('应该正确格式化预览线显示信息', () => {
      const edgeData = mockEdge.getData()
      const sourceId = mockEdge.getSourceCellId()
      const targetId = mockEdge.getTargetCellId()

      const displaySourceId = edgeData.sourceNodeId || sourceId || 'unknown'
      const displayTargetId = targetId || '坐标'
      const displayText = `${displaySourceId} -> ${displayTargetId}`

      expect(displayText).toBe('node_1758007854880 -> 坐标')
    })
  })

  describe('预览线标签显示测试', () => {
    it('应该正确解析标签文本', () => {
      const labels = mockEdge.getLabels()
      expect(labels).toHaveLength(1)

      const label = labels[0]
      let labelText = 'empty'

      // 测试标签文本解析逻辑
      if (label.attrs && label.attrs.text && label.attrs.text.text) {
        labelText = label.attrs.text.text
      } else if (label.markup) {
        labelText = label.markup
      } else if (label.text) {
        labelText = label.text
      }

      expect(labelText).toBe('黑名单')
      expect(labelText).not.toBe('empty')
    })

    it('应该处理空标签的情况', () => {
      // 创建一个没有标签文本的边
      const emptyLabelEdge = {
        getLabels: vi.fn(() => [
          {
            position: 0.8
            // 没有text属性
          }
        ])
      }

      const labels = emptyLabelEdge.getLabels()
      const label = labels[0]
      let labelText = 'empty'

      if (label.attrs && label.attrs.text && label.attrs.text.text) {
        labelText = label.attrs.text.text
      } else if (label.markup) {
        labelText = label.markup
      } else if (label.text) {
        labelText = label.text
      }

      expect(labelText).toBe('empty')
    })

    it('应该正确显示标签位置信息', () => {
      const labels = mockEdge.getLabels()
      const label = labels[0]

      expect(label.position).toBe(0.8)
    })
  })

  describe('预览线统计信息测试', () => {
    it('应该正确统计预览线数量', () => {
      const edges = mockGraph.getEdges()
      const previewLines = edges.filter(edge => {
        const edgeData = edge.getData()
        return edgeData.type === 'preview-line'
      })

      expect(previewLines).toHaveLength(1)
    })

    it('应该正确统计标签数量', () => {
      const labels = mockEdge.getLabels()
      expect(labels).toHaveLength(1)
    })

    it('应该生成正确的日志格式', () => {
      const edgeData = mockEdge.getData()
      const sourceId = mockEdge.getSourceCellId()
      const targetId = mockEdge.getTargetCellId()
      const labels = mockEdge.getLabels()

      const displaySourceId = edgeData.sourceNodeId || sourceId || 'unknown'
      const displayTargetId = targetId || '坐标'
      const logMessage = `[预览线] ${displaySourceId} -> ${displayTargetId}, 类型: ${edgeData.type}, 标签数: ${labels.length}`

      expect(logMessage).toBe('[预览线] node_1758007854880 -> 坐标, 类型: preview-line, 标签数: 1')
    })
  })

  describe('节点分支信息测试', () => {
    it('应该正确获取节点分支数据', () => {
      const sourceNode = mockGraph.getCellById('node_1758007854880')
      const nodeData = sourceNode.getData()
      const branches = nodeData.config.branches

      expect(branches).toHaveLength(3)
      expect(branches[0].label).toBe('黑名单')
      expect(branches[1].label).toBe('低响应客群')
      expect(branches[2].label).toBe('未命中人群')
    })

    it('应该正确显示节点位置信息', () => {
      const sourceNode = mockGraph.getCellById('node_1758007854880')
      const position = sourceNode.getPosition()

      expect(position.x).toBe(390)
      expect(position.y).toBe(360)
    })

    it('应该生成正确的节点信息日志', () => {
      const sourceNode = mockGraph.getCellById('node_1758007854880')
      const nodeData = sourceNode.getData()
      const position = sourceNode.getPosition()
      const branches = nodeData.config.branches

      const logMessage = `节点ID: ${sourceNode.id}, 类型: ${nodeData.type}, 位置: (${position.x}, ${position.y}), 分支数: ${branches.length}`

      expect(logMessage).toBe('节点ID: node_1758007854880, 类型: audience-split, 位置: (390, 360), 分支数: 3')
    })
  })
})