/**
 * X6画布测试工具类
 * 提供真实的X6画布测试环境和验证工具
 */

import { Graph } from '@antv/x6'
import { Scroller } from '@antv/x6-plugin-scroller'
import { History } from '@antv/x6-plugin-history'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { Selection } from '@antv/x6-plugin-selection'
import { Transform } from '@antv/x6-plugin-transform'
import { MiniMap } from '@antv/x6-plugin-minimap'
import { createRealDOMContainer, cleanupDOM, waitForDomUpdate } from '../setup/real-environment.js'

/**
 * X6画布测试工具类
 */
export class X6CanvasTestUtils {
  constructor() {
    this.graph = null
    this.container = null
    this.minimapContainer = null
    this.plugins = new Map()
  }

  /**
   * 创建真实的X6画布实例
   * @param {Object} options - 配置选项
   * @returns {Graph} X6图实例
   */
  async createRealCanvas(options = {}) {
    // 创建真实DOM容器
    this.container = createRealDOMContainer()
    this.container.id = 'test-canvas-container'
    
    // 创建小地图容器
    this.minimapContainer = document.createElement('div')
    this.minimapContainer.style.width = '200px'
    this.minimapContainer.style.height = '150px'
    document.body.appendChild(this.minimapContainer)

    // 基础配置
    const defaultConfig = {
      container: this.container,
      autoResize: true,
      background: {
        color: '#f8f9fa'
      },
      grid: {
        size: 20,
        visible: true,
        type: 'dot',
        args: {
          color: '#e5e5e5',
          thickness: 1
        }
      },
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown', 'mouseWheel']
      },
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        factor: 1.1,
        maxScale: 3,
        minScale: 0.1
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8
          }
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        allowEdge: false,
        allowMulti: false,
        createEdge() {
          return new Graph.Edge({
            attrs: {
              line: {
                stroke: '#5F95FF',
                strokeWidth: 1,
                targetMarker: {
                  name: 'classic',
                  size: 8
                }
              }
            }
          })
        }
      },
      ...options
    }

    // 创建图实例
    this.graph = new Graph(defaultConfig)

    // 初始化插件
    await this.initializePlugins()

    // 等待DOM更新
    await waitForDomUpdate(100)

    return this.graph
  }

  /**
   * 初始化X6插件
   */
  async initializePlugins() {
    if (!this.graph) {
      throw new Error('Graph instance not created')
    }

    // 滚动插件
    const scroller = new Scroller({
      enabled: true,
      pannable: true,
      pageVisible: false,
      pageBreak: false
    })
    this.graph.use(scroller)
    this.plugins.set('scroller', scroller)

    // 历史记录插件
    const history = new History({
      enabled: true
    })
    this.graph.use(history)
    this.plugins.set('history', history)

    // 对齐线插件
    const snapline = new Snapline({
      enabled: true
    })
    this.graph.use(snapline)
    this.plugins.set('snapline', snapline)

    // 键盘快捷键插件
    const keyboard = new Keyboard({
      enabled: true
    })
    this.graph.use(keyboard)
    this.plugins.set('keyboard', keyboard)

    // 剪贴板插件
    const clipboard = new Clipboard({
      enabled: true
    })
    this.graph.use(clipboard)
    this.plugins.set('clipboard', clipboard)

    // 选择插件
    const selection = new Selection({
      enabled: true,
      multiple: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true
    })
    this.graph.use(selection)
    this.plugins.set('selection', selection)

    // 变换插件
    const transform = new Transform({
      resizing: true,
      rotating: true
    })
    this.graph.use(transform)
    this.plugins.set('transform', transform)

    // 小地图插件
    if (this.minimapContainer) {
      const minimap = new MiniMap({
        container: this.minimapContainer,
        width: 200,
        height: 150,
        padding: 10,
        graphOptions: {
          async: true,
          getCellView(cell) {
            if (cell.isNode()) {
              return null
            }
          },
          createCellView(cell) {
            if (cell.isEdge()) {
              return null
            }
          }
        }
      })
      this.graph.use(minimap)
      this.plugins.set('minimap', minimap)
    }
  }

  /**
   * 创建测试节点
   * @param {Object} nodeData - 节点数据
   * @returns {Node} 创建的节点
   */
  createTestNode(nodeData = {}) {
    const defaultNodeData = {
      id: `test-node-${Date.now()}`,
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      shape: 'rect',
      attrs: {
        body: {
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: 'rgba(95,149,255,0.05)'
        },
        text: {
          fontSize: 12,
          fill: '#262626'
        }
      },
      label: 'Test Node',
      ...nodeData
    }

    return this.graph.addNode(defaultNodeData)
  }

  /**
   * 创建测试连接
   * @param {string} sourceId - 源节点ID
   * @param {string} targetId - 目标节点ID
   * @param {Object} edgeData - 连接数据
   * @returns {Edge} 创建的连接
   */
  createTestEdge(sourceId, targetId, edgeData = {}) {
    const defaultEdgeData = {
      id: `test-edge-${Date.now()}`,
      source: sourceId,
      target: targetId,
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 1,
          targetMarker: {
            name: 'classic',
            size: 8
          }
        }
      },
      ...edgeData
    }

    return this.graph.addEdge(defaultEdgeData)
  }

  /**
   * 模拟节点拖拽
   * @param {string} nodeId - 节点ID
   * @param {Object} startPos - 起始位置
   * @param {Object} endPos - 结束位置
   */
  async simulateNodeDrag(nodeId, startPos, endPos) {
    const node = this.graph.getCellById(nodeId)
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`)
    }

    // 触发拖拽开始事件
    this.graph.trigger('node:mousedown', {
      e: new MouseEvent('mousedown', { clientX: startPos.x, clientY: startPos.y }),
      node,
      x: startPos.x,
      y: startPos.y
    })

    // 模拟拖拽过程
    this.graph.trigger('node:mousemove', {
      e: new MouseEvent('mousemove', { clientX: endPos.x, clientY: endPos.y }),
      node,
      x: endPos.x,
      y: endPos.y
    })

    // 触发拖拽结束事件
    this.graph.trigger('node:mouseup', {
      e: new MouseEvent('mouseup', { clientX: endPos.x, clientY: endPos.y }),
      node,
      x: endPos.x,
      y: endPos.y
    })

    // 等待DOM更新
    await waitForDomUpdate(50)
  }

  /**
   * 模拟连接创建
   * @param {string} sourceId - 源节点ID
   * @param {string} targetId - 目标节点ID
   */
  async simulateConnection(sourceId, targetId) {
    const sourceNode = this.graph.getCellById(sourceId)
    const targetNode = this.graph.getCellById(targetId)

    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found')
    }

    // 模拟连接开始
    this.graph.trigger('node:port:mousedown', {
      e: new MouseEvent('mousedown'),
      node: sourceNode,
      port: 'out'
    })

    // 模拟连接结束
    this.graph.trigger('node:port:mouseup', {
      e: new MouseEvent('mouseup'),
      node: targetNode,
      port: 'in'
    })

    await waitForDomUpdate(50)
  }

  /**
   * 验证节点是否存在
   * @param {string} nodeId - 节点ID
   * @returns {boolean} 是否存在
   */
  hasNode(nodeId) {
    return !!this.graph.getCellById(nodeId)
  }

  /**
   * 验证连接是否存在
   * @param {string} edgeId - 连接ID
   * @returns {boolean} 是否存在
   */
  hasEdge(edgeId) {
    const edge = this.graph.getCellById(edgeId)
    return edge && edge.isEdge()
  }

  /**
   * 获取节点位置
   * @param {string} nodeId - 节点ID
   * @returns {Object} 节点位置 {x, y}
   */
  getNodePosition(nodeId) {
    const node = this.graph.getCellById(nodeId)
    if (!node) return null
    return node.getPosition()
  }

  /**
   * 获取画布中所有节点
   * @returns {Array} 节点数组
   */
  getAllNodes() {
    return this.graph.getNodes()
  }

  /**
   * 获取画布中所有连接
   * @returns {Array} 连接数组
   */
  getAllEdges() {
    return this.graph.getEdges()
  }

  /**
   * 清空画布
   */
  clearCanvas() {
    if (this.graph) {
      this.graph.clearCells()
    }
  }

  /**
   * 销毁画布实例
   */
  destroy() {
    if (this.graph) {
      this.graph.dispose()
      this.graph = null
    }
    
    this.plugins.clear()
    
    if (this.minimapContainer && this.minimapContainer.parentNode) {
      this.minimapContainer.parentNode.removeChild(this.minimapContainer)
    }
    
    cleanupDOM()
    
    this.container = null
    this.minimapContainer = null
  }

  /**
   * 等待画布渲染完成
   * @param {number} timeout - 超时时间
   */
  async waitForRender(timeout = 1000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkRender = () => {
        if (this.graph && this.container.children.length > 0) {
          resolve()
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Canvas render timeout'))
        } else {
          setTimeout(checkRender, 50)
        }
      }
      
      checkRender()
    })
  }

  /**
   * 获取画布截图（用于视觉回归测试）
   * @returns {string} Base64编码的图片数据
   */
  async getCanvasSnapshot() {
    if (!this.graph) {
      throw new Error('Graph instance not available')
    }

    return new Promise((resolve) => {
      this.graph.toPNG((dataUri) => {
        resolve(dataUri)
      }, {
        backgroundColor: '#ffffff',
        padding: 10
      })
    })
  }
}

// 导出单例实例
export const canvasTestUtils = new X6CanvasTestUtils()

// 导出便捷方法
export function createTestCanvas(options = {}) {
  return canvasTestUtils.createRealCanvas(options)
}

export function destroyTestCanvas() {
  canvasTestUtils.destroy()
}