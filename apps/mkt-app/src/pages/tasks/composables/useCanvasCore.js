/**
 * 画布核心逻辑组合函数
 * 负责X6图实例的创建、配置和核心插件的初始化
 */
import { ref, nextTick } from 'vue'
import { Graph, Shape } from '@antv/x6'
import { Scroller } from '@antv/x6-plugin-scroller'
import { History } from '@antv/x6-plugin-history'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { Selection } from '@antv/x6-plugin-selection'
import { Transform } from '@antv/x6-plugin-transform'
import { MiniMap } from '@antv/x6-plugin-minimap'

export function useCanvasCore() {
  // 核心状态
  const graph = ref(null)
  const isGraphReady = ref(false)
  const graphContainer = ref(null)
  const minimapContainer = ref(null)

  /**
   * 初始化X6图实例 - 同步版本
   * @param {Object} options - 初始化选项
   * @param {HTMLElement} options.container - 画布容器元素
   * @param {HTMLElement} options.minimapContainer - 小地图容器元素
   * @param {Object} options.config - 画布配置
   */
  const initializeGraph = (options = {}) => {
    const { container, minimapContainer: minimap, config = {} } = options

    if (!container) {
      throw new Error('[useCanvasCore] 画布容器元素不能为空')
    }

    try {
      console.log('[useCanvasCore] 开始同步初始化X6图实例')

      // 创建X6图实例
      const graphInstance = new Graph({
        container,
        width: config.width || 1200,
        height: config.height || 800,
        
        // 背景配置
        background: {
          color: '#f5f5f5'
        },
        
        // 网格配置
        grid: {
          visible: true,
          type: 'doubleMesh',
          args: [
            {
              color: '#eee',
              thickness: 1
            },
            {
              color: '#ddd',
              thickness: 1,
              factor: 4
            }
          ]
        },
        
        // 选择配置
        selecting: {
          enabled: true,
          multiple: true,
          rubberband: true,
          movable: true,
          showNodeSelectionBox: true
        },
        
        // 连接配置
        connecting: {
          router: {
            name: 'orth',
            args: {
              padding: 15,
              step: 10,
              startDirections: ['bottom'],
              endDirections: ['top']
            }
          },
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
          highlight: true,
          snap: {
            radius: 20
          },
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: '#1890ff',
                  strokeWidth: 2,
                  targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8
                  }
                }
              },
              zIndex: 0
            })
          },
          validateConnection({ targetMagnet }) {
            // 🔧 禁用所有端口拖拽连接，连接线应仅通过预览线转换生成
            return false
          }
        },
        
        // 高亮配置
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: {
                fill: '#5F95FF',
                stroke: '#5F95FF'
              }
            }
          }
        },
        
        // 缩放配置
        scaling: {
          min: 0.1,
          max: 3
        },
        
        // 旋转配置
        rotating: {
          enabled: false
        },
        
        // 交互配置
        interacting: {
          nodeMovable: true,
          edgeMovable: false,
          edgeLabelMovable: false,
          arrowheadMovable: false,
          vertexMovable: false,
          vertexAddable: false,
          vertexDeletable: false
        },
        
        // 鼠标滚轮配置
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: 'ctrl',
          minScale: 0.1,
          maxScale: 3
        },
        
        // 对齐线配置
        snapline: true,
        
        // 键盘配置
        keyboard: true,
        
        // 剪贴板配置
        clipboard: true,
        
        // 历史记录配置
        history: {
          enabled: true,
          beforeAddCommand: (event, args) => {
            if (args.key === 'tools') {
              return false
            }
          }
        }
      })

      // 注册自定义边形状
      registerCustomEdgeShapes(graphInstance)

      // 同步初始化插件
      initializePlugins(graphInstance, { minimapContainer: minimap })

      // 设置图实例
      graph.value = graphInstance
      graphContainer.value = container
      minimapContainer.value = minimap
      isGraphReady.value = true

      console.log('[useCanvasCore] X6图实例同步初始化完成')
      return graphInstance

    } catch (error) {
      console.error('[useCanvasCore] X6图实例初始化失败:', error)
      throw new Error(`[useCanvasCore] 图实例初始化失败: ${error.message}`)
    }
  }

  /**
   * 注册自定义边形状
   * @param {Graph} graphInstance - 图实例
   */
  const registerCustomEdgeShapes = (graphInstance) => {
    try {
      console.log('[useCanvasCore] 开始注册自定义边形状')

      // 检查边形状是否已注册，避免重复注册
      const registeredEdges = Graph.registry?.edge?.data || {}
      
      // 注册统一预览线边形状
      try {
        if (!registeredEdges['unified-preview-line']) {
          Graph.registerEdge('unified-preview-line', {
            inherit: 'edge',
            attrs: {
              line: {
                stroke: '#1890ff',
                strokeWidth: 2,
                strokeDasharray: '5 5',
                targetMarker: {
                  name: 'block',
                  width: 8,
                  height: 6,
                  fill: '#1890ff'
                }
              }
            },
            zIndex: 1000
          })
          console.log('[useCanvasCore] 注册 unified-preview-line 边形状')
        } else {
          console.log('[useCanvasCore] unified-preview-line 边形状已存在，跳过注册')
        }
      } catch (edgeError) {
        if (edgeError.message.includes('already registered')) {
          console.log('[useCanvasCore] unified-preview-line 边形状已注册，跳过')
        } else {
          throw edgeError
        }
      }

      // 注册持久预览线边形状
      try {
        if (!registeredEdges['persistent-preview-line']) {
          Graph.registerEdge('persistent-preview-line', {
            inherit: 'edge',
            attrs: {
              line: {
                stroke: '#52c41a',
                strokeWidth: 2,
                strokeDasharray: '3 3',
                targetMarker: {
                  name: 'block',
                  width: 8,
                  height: 6,
                  fill: '#52c41a'
                }
              }
            },
            zIndex: 999
          })
          console.log('[useCanvasCore] 注册 persistent-preview-line 边形状')
        } else {
          console.log('[useCanvasCore] persistent-preview-line 边形状已存在，跳过注册')
        }
      } catch (edgeError) {
        if (edgeError.message.includes('already registered')) {
          console.log('[useCanvasCore] persistent-preview-line 边形状已注册，跳过')
        } else {
          throw edgeError
        }
      }

      console.log('[useCanvasCore] 自定义边形状注册完成')
    } catch (error) {
      console.error('[useCanvasCore] 自定义边形状注册失败:', error)
      throw new Error(`[useCanvasCore] 边形状注册失败: ${error.message}`)
    }
  }

  /**
   * 初始化插件 - 同步版本
   * @param {Graph} graphInstance - 图实例
   * @param {Object} options - 插件配置选项
   */
  const initializePlugins = (graphInstance, options = {}) => {
    try {
      console.log('[useCanvasCore] 开始初始化插件')

      // 初始化滚动插件
      if (options.enableScroller !== false) {
        graphInstance.use(new Scroller({
          enabled: true,
          pageVisible: false,
          pageBreak: false,
          pannable: true,
          className: 'x6-graph-scroller',
          autoResize: true,
          padding: 50
        }))
        console.log('[useCanvasCore] Scroller插件初始化完成')
      }

      // 初始化历史记录插件
      if (options.enableHistory !== false) {
        graphInstance.use(new History({
          enabled: true,
          beforeAddCommand: (event, args) => {
            // 过滤掉工具相关的命令
            if (args.key === 'tools') {
              return false
            }
            return true
          }
        }))
        console.log('[useCanvasCore] History插件初始化完成')
      }

      // 初始化对齐线插件
      if (options.enableSnapline !== false) {
        graphInstance.use(new Snapline({
          enabled: true,
          sharp: true
        }))
        console.log('[useCanvasCore] Snapline插件初始化完成')
      }

      // 初始化键盘插件
      if (options.enableKeyboard !== false) {
        graphInstance.use(new Keyboard({
          enabled: true,
          global: false
        }))
        console.log('[useCanvasCore] Keyboard插件初始化完成')
      }

      // 初始化剪贴板插件
      if (options.enableClipboard !== false) {
        graphInstance.use(new Clipboard({
          enabled: true,
          useLocalStorage: true
        }))
        console.log('[useCanvasCore] Clipboard插件初始化完成')
      }

      // 初始化选择插件
      if (options.enableSelection !== false) {
        graphInstance.use(new Selection({
          enabled: true,
          multiple: true,
          rubberband: true,
          movable: true,
          showNodeSelectionBox: true,
          showEdgeSelectionBox: false
        }))
        console.log('[useCanvasCore] Selection插件初始化完成')
      }

      // 初始化变换插件
      if (options.enableTransform !== false) {
        graphInstance.use(new Transform({
          resizing: {
            enabled: false
          },
          rotating: {
            enabled: false
          }
        }))
        console.log('[useCanvasCore] Transform插件初始化完成')
      }

      // 初始化小地图
      if (options.minimapContainer) {
        initializeMinimap(graphInstance, options.minimapContainer)
      }

      console.log('[useCanvasCore] 所有插件初始化完成')
    } catch (error) {
      console.error('[useCanvasCore] 插件初始化失败:', error)
      throw new Error(`[useCanvasCore] 插件初始化失败: ${error.message}`)
    }
  }

  /**
   * 初始化小地图 - 同步版本
   * @param {Graph} graphInstance - 图实例
   * @param {HTMLElement} container - 小地图容器
   */
  const initializeMinimap = (graphInstance, container) => {
    try {
      console.log('[useCanvasCore] 开始同步初始化小地图')

      if (!container) {
        console.warn('[useCanvasCore] 小地图容器不存在，跳过初始化')
        return
      }

      // 同步导入小地图插件
        graphInstance.use(new MiniMap({
        container,
        width: 200,
        height: 150,
        padding: 10,
        scalable: true,
        minScale: 0.01,
        maxScale: 16,
        graphOptions: {
          async: true,
          getCellView(cell) {
            // 简化小地图中的节点显示
            if (cell.isNode()) {
              return null
            }
          },
          createCellView(cell) {
            // 为小地图创建简化的视图
            if (cell.isEdge()) {
              return null
            }
          }
        }
      }))

      console.log('[useCanvasCore] 小地图初始化完成')
    } catch (error) {
      console.error('[useCanvasCore] 小地图初始化失败:', error)
      // 小地图初始化失败不应该阻止整个画布的初始化
      console.warn('[useCanvasCore] 小地图初始化失败，继续画布初始化')
    }
  }

  /**
   * 计算连接点位置
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @returns {Object} 连接点配置
   */
  const calculateConnectionPoints = (sourceNode, targetNode) => {
    if (!sourceNode || !targetNode) {
      return {
        sourceAnchor: 'center',
        targetAnchor: 'center',
        sourceConnectionPoint: 'anchor',
        targetConnectionPoint: 'anchor'
      }
    }

    const sourcePos = sourceNode.getPosition()
    const targetPos = targetNode.getPosition()
    const sourceSize = sourceNode.getSize()
    const targetSize = targetNode.getSize()

    // 计算节点中心点
    const sourceCenterX = sourcePos.x + sourceSize.width / 2
    const sourceCenterY = sourcePos.y + sourceSize.height / 2
    const targetCenterX = targetPos.x + targetSize.width / 2
    const targetCenterY = targetPos.y + targetSize.height / 2

    // 根据相对位置确定连接点
    const deltaX = targetCenterX - sourceCenterX
    const deltaY = targetCenterY - sourceCenterY

    let sourceAnchor = 'bottom'
    let targetAnchor = 'top'

    // 如果目标节点在源节点左侧或右侧
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        sourceAnchor = 'right'
        targetAnchor = 'left'
      } else {
        sourceAnchor = 'left'
        targetAnchor = 'right'
      }
    } else {
      // 如果目标节点在源节点上方或下方
      if (deltaY > 0) {
        sourceAnchor = 'bottom'
        targetAnchor = 'top'
      } else {
        sourceAnchor = 'top'
        targetAnchor = 'bottom'
      }
    }

    return {
      sourceAnchor,
      targetAnchor,
      sourceConnectionPoint: 'anchor',
      targetConnectionPoint: 'anchor'
    }
  }

  /**
   * 销毁图实例
   */
  const destroyGraph = () => {
    try {
      if (graph.value) {
        console.log('[useCanvasCore] 开始销毁图实例')
        graph.value.dispose()
        graph.value = null
        isGraphReady.value = false
        graphContainer.value = null
        minimapContainer.value = null
        console.log('[useCanvasCore] 图实例销毁完成')
      }
    } catch (error) {
      console.error('[useCanvasCore] 图实例销毁失败:', error)
    }
  }

  /**
   * 重置图实例
   */
  const resetGraph = () => {
    try {
      if (graph.value) {
        console.log('[useCanvasCore] 开始重置图实例')
        graph.value.clearCells()
        graph.value.resetSelection()
        graph.value.cleanHistory()
        console.log('[useCanvasCore] 图实例重置完成')
      }
    } catch (error) {
      console.error('[useCanvasCore] 图实例重置失败:', error)
    }
  }

  return {
    // 状态
    graph,
    isGraphReady,
    graphContainer,
    minimapContainer,

    // 方法
    initializeGraph,
    calculateConnectionPoints,
    destroyGraph,
    resetGraph
  }
}