import { ErrorHandler } from './ErrorHandler.js'

/**
 * 数据转换工具类
 * 提供统一的数据转换、坐标计算、格式化等功能，消除重复的转换逻辑
 */
export class DataTransformUtils {
  /**
   * 坐标转换相关方法
   */
  static coordinates = {
    /**
     * 将屏幕坐标转换为画布坐标
     * @param {Object} graph - 图形实例
     * @param {number} clientX - 屏幕X坐标
     * @param {number} clientY - 屏幕Y坐标
     * @returns {Object} 画布坐标 {x, y}
     */
    screenToCanvas(graph, clientX, clientY) {
      try {
        if (!graph || typeof graph.clientToLocal !== 'function') {
          throw new Error('无效的图形实例')
        }
        return graph.clientToLocal(clientX, clientY)
      } catch (error) {
        ErrorHandler.handleError(error, 'COORDINATE_TRANSFORM_ERROR')
        return { x: 0, y: 0 }
      }
    },

    /**
     * 将画布坐标转换为屏幕坐标
     * @param {Object} graph - 图形实例
     * @param {number} x - 画布X坐标
     * @param {number} y - 画布Y坐标
     * @returns {Object} 屏幕坐标 {x, y}
     */
    canvasToScreen(graph, x, y) {
      try {
        if (!graph || typeof graph.localToClient !== 'function') {
          throw new Error('无效的图形实例')
        }
        return graph.localToClient(x, y)
      } catch (error) {
        ErrorHandler.handleError(error, 'COORDINATE_TRANSFORM_ERROR')
        return { x: 0, y: 0 }
      }
    },

    /**
     * 计算两点之间的距离
     * @param {Object} point1 - 第一个点 {x, y}
     * @param {Object} point2 - 第二个点 {x, y}
     * @returns {number} 距离
     */
    distance(point1, point2) {
      const dx = point2.x - point1.x
      const dy = point2.y - point1.y
      return Math.sqrt(dx * dx + dy * dy)
    },

    /**
     * 计算点到矩形的最短距离
     * @param {Object} point - 点坐标 {x, y}
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {number} 最短距离
     */
    pointToRect(point, rect) {
      const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.width))
      const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.height))
      return Math.sqrt(dx * dx + dy * dy)
    },

    /**
     * 标准化坐标（确保坐标为有效数值）
     * @param {Object} coords - 坐标对象 {x, y}
     * @returns {Object} 标准化后的坐标
     */
    normalize(coords) {
      return {
        x: isNaN(coords.x) ? 0 : Number(coords.x),
        y: isNaN(coords.y) ? 0 : Number(coords.y)
      }
    },

    /**
     * 计算矩形的中心点
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {Object} 中心点坐标 {x, y}
     */
    getRectCenter(rect) {
      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
      }
    }
  }

  /**
   * 数据格式化相关方法
   */
  static format = {
    /**
     * 格式化节点数据
     * @param {Object} nodeData - 原始节点数据
     * @returns {Object} 格式化后的节点数据
     */
    nodeData(nodeData) {
      try {
        // 🔧 修复：使用nodeTypes.js中的配置获取正确的形状
        let nodeShape = 'circle' // 默认形状
        try {
          const { getNodeConfig } = require('../../../../utils/nodeTypes.js')
          const nodeConfig = getNodeConfig(nodeData.type || 'start')
          if (nodeConfig && nodeConfig.shape) {
            nodeShape = nodeConfig.shape
          }
        } catch (error) {
          console.warn('[DataTransformUtils] 获取节点形状失败，使用默认值:', error)
        }

        const formatted = {
          id: nodeData.id || DataTransformUtils.utils.generateId(),
          shape: nodeData.shape || nodeShape, // 使用从nodeTypes.js获取的形状
          type: nodeData.type || 'start',
          x: Number(nodeData.x) || 0,
          y: Number(nodeData.y) || 0,
          width: Number(nodeData.width) || 120,
          height: Number(nodeData.height) || 60,
          label: String(nodeData.label || nodeData.data?.label || nodeData.type || ''),
          data: nodeData.data || {},
          attrs: nodeData.attrs || {},
          ports: nodeData.ports || []
        }

        // 确保必要的属性存在
        if (!formatted.attrs.body) {
          formatted.attrs.body = {}
        }
        if (!formatted.attrs.label) {
          formatted.attrs.label = {}
        }

        return formatted
      } catch (error) {
        ErrorHandler.handleError(error, 'DATA_FORMAT_ERROR')
        return DataTransformUtils.utils.getDefaultNodeData()
      }
    },

    /**
     * 格式化连接数据
     * @param {Object} edgeData - 原始连接数据
     * @returns {Object} 格式化后的连接数据
     */
    edgeData(edgeData) {
      try {
        const formatted = {
          id: edgeData.id || DataTransformUtils.utils.generateId(),
          shape: edgeData.shape || 'edge',
          source: edgeData.source || '',
          target: edgeData.target || '',
          sourcePort: edgeData.sourcePort,
          targetPort: edgeData.targetPort,
          label: String(edgeData.label || ''),
          data: edgeData.data || {},
          attrs: edgeData.attrs || {},
          vertices: edgeData.vertices || []
        }

        // 验证必要字段
        if (!formatted.source || !formatted.target) {
          throw new Error('连接必须有源节点和目标节点')
        }

        return formatted
      } catch (error) {
        ErrorHandler.handleError(error, 'DATA_FORMAT_ERROR')
        return DataTransformUtils.utils.getDefaultEdgeData()
      }
    },

    /**
     * 格式化导出数据
     * @param {Object} graphData - 图形数据
     * @param {string} format - 导出格式 ('json' | 'svg' | 'png')
     * @returns {Object} 格式化后的导出数据
     */
    exportData(graphData, format = 'json') {
      try {
        const baseData = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          format: format,
          metadata: {
            nodeCount: graphData.nodes?.length || 0,
            edgeCount: graphData.edges?.length || 0
          }
        }

        switch (format) {
          case 'json':
            return {
              ...baseData,
              nodes: graphData.nodes || [],
              edges: graphData.edges || []
            }
          case 'svg':
            return {
              ...baseData,
              content: graphData.svg || '',
              viewBox: graphData.viewBox || '0 0 800 600'
            }
          case 'png':
            return {
              ...baseData,
              dataUrl: graphData.dataUrl || '',
              width: graphData.width || 800,
              height: graphData.height || 600
            }
          default:
            throw new Error(`不支持的导出格式: ${format}`)
        }
      } catch (error) {
        ErrorHandler.handleError(error, 'EXPORT_FORMAT_ERROR')
        return { error: '导出数据格式化失败' }
      }
    }
  }

  /**
   * 数据验证相关方法
   */
  static validate = {
    /**
     * 验证节点数据
     * @param {Object} nodeData - 节点数据
     * @returns {Object} 验证结果 {isValid, errors}
     */
    nodeData(nodeData) {
      const errors = []

      if (!nodeData) {
        errors.push('节点数据不能为空')
        return { isValid: false, errors }
      }

      if (!nodeData.id) {
        errors.push('节点必须有ID')
      }

      if (typeof nodeData.x !== 'number' || isNaN(nodeData.x)) {
        errors.push('节点X坐标必须是有效数字')
      }

      if (typeof nodeData.y !== 'number' || isNaN(nodeData.y)) {
        errors.push('节点Y坐标必须是有效数字')
      }

      if (nodeData.width && (typeof nodeData.width !== 'number' || nodeData.width <= 0)) {
        errors.push('节点宽度必须是正数')
      }

      if (nodeData.height && (typeof nodeData.height !== 'number' || nodeData.height <= 0)) {
        errors.push('节点高度必须是正数')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    },

    /**
     * 验证连接数据
     * @param {Object} edgeData - 连接数据
     * @returns {Object} 验证结果 {isValid, errors}
     */
    edgeData(edgeData) {
      const errors = []

      if (!edgeData) {
        errors.push('连接数据不能为空')
        return { isValid: false, errors }
      }

      if (!edgeData.source) {
        errors.push('连接必须有源节点')
      }

      if (!edgeData.target) {
        errors.push('连接必须有目标节点')
      }

      if (edgeData.source === edgeData.target) {
        errors.push('连接的源节点和目标节点不能相同')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    },

    /**
     * 验证坐标数据
     * @param {Object} coords - 坐标数据 {x, y}
     * @returns {boolean} 是否有效
     */
    coordinates(coords) {
      return coords && 
             typeof coords.x === 'number' && !isNaN(coords.x) &&
             typeof coords.y === 'number' && !isNaN(coords.y)
    }
  }

  /**
   * 数据转换相关方法
   */
  static convert = {
    /**
     * 将X6节点数据转换为自定义格式
     * @param {Object} x6Node - X6节点对象
     * @returns {Object} 自定义格式节点数据
     */
    x6NodeToCustom(x6Node) {
      try {
        const position = x6Node.getPosition()
        const size = x6Node.getSize()
        
        return {
          id: x6Node.id,
          type: x6Node.shape,
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          label: x6Node.getAttrByPath('label/text') || '',
          data: x6Node.getData() || {},
          style: x6Node.getAttrs() || {}
        }
      } catch (error) {
        ErrorHandler.handleError(error, 'NODE_CONVERT_ERROR')
        return null
      }
    },

    /**
     * 将X6连接数据转换为自定义格式
     * @param {Object} x6Edge - X6连接对象
     * @returns {Object} 自定义格式连接数据
     */
    x6EdgeToCustom(x6Edge) {
      try {
        return {
          id: x6Edge.id,
          type: x6Edge.shape,
          source: x6Edge.getSourceCellId(),
          target: x6Edge.getTargetCellId(),
          sourcePort: x6Edge.getSourcePortId(),
          targetPort: x6Edge.getTargetPortId(),
          label: x6Edge.getAttrByPath('label/text') || '',
          data: x6Edge.getData() || {},
          style: x6Edge.getAttrs() || {},
          vertices: x6Edge.getVertices() || []
        }
      } catch (error) {
        ErrorHandler.handleError(error, 'EDGE_CONVERT_ERROR')
        return null
      }
    },

    /**
     * 将自定义格式转换为X6节点数据
     * @param {Object} customNode - 自定义格式节点数据
     * @returns {Object} X6节点数据
     */
    customToX6Node(customNode) {
      try {
        return {
          id: customNode.id,
          shape: customNode.type || 'circle',
          x: customNode.x,
          y: customNode.y,
          width: customNode.width,
          height: customNode.height,
          label: customNode.label,
          data: customNode.data,
          attrs: customNode.style
        }
      } catch (error) {
        ErrorHandler.handleError(error, 'NODE_CONVERT_ERROR')
        return null
      }
    },

    /**
     * 将自定义格式转换为X6连接数据
     * @param {Object} customEdge - 自定义格式连接数据
     * @returns {Object} X6连接数据
     */
    customToX6Edge(customEdge) {
      try {
        return {
          id: customEdge.id,
          shape: customEdge.type || 'edge',
          source: customEdge.source,
          target: customEdge.target,
          sourcePort: customEdge.sourcePort,
          targetPort: customEdge.targetPort,
          label: customEdge.label,
          data: customEdge.data,
          attrs: customEdge.style,
          vertices: customEdge.vertices
        }
      } catch (error) {
        ErrorHandler.handleError(error, 'EDGE_CONVERT_ERROR')
        return null
      }
    }
  }

  /**
   * 工具方法
   */
  static utils = {
    /**
     * 生成唯一ID
     * @param {string} prefix - ID前缀
     * @returns {string} 唯一ID
     */
    generateId(prefix = 'item') {
      try {
        console.log('[DataTransformUtils] 生成ID，前缀:', prefix)
        
        if (typeof prefix !== 'string') {
          console.warn('[DataTransformUtils] 前缀不是字符串，使用默认值:', prefix)
          prefix = 'item'
        }
        
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substr(2, 9)
        const id = `${prefix}_${timestamp}_${randomStr}`
        
        console.log('[DataTransformUtils] 生成的ID:', id)
        return id
      } catch (error) {
        console.error('[DataTransformUtils] 生成ID时发生错误:', error)
        ErrorHandler.handleError(error, 'ID_GENERATION_ERROR')
        // 返回一个简单的备用ID
        return `item_${Date.now()}`
      }
    },

    /**
     * 深度克隆对象
     * @param {Object} obj - 要克隆的对象
     * @returns {Object} 克隆后的对象
     */
    deepClone(obj) {
      try {
        return JSON.parse(JSON.stringify(obj))
      } catch (error) {
        ErrorHandler.handleError(error, 'CLONE_ERROR')
        return {}
      }
    },

    /**
     * 合并对象（深度合并）
     * @param {Object} target - 目标对象
     * @param {Object} source - 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge(target, source) {
      const result = this.deepClone(target)
      
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            result[key] = this.deepMerge(result[key] || {}, source[key])
          } else {
            result[key] = source[key]
          }
        }
      }
      
      return result
    },

    /**
     * 获取默认节点数据
     * @returns {Object} 默认节点数据
     */
    getDefaultNodeData() {
      try {
        console.log('[DataTransformUtils] 获取默认节点数据')
        
        const nodeId = DataTransformUtils.utils.generateId('node')
        
        if (!nodeId) {
          console.error('[DataTransformUtils] 无法生成节点ID')
          throw new Error('无法生成节点ID')
        }
        
        // 🔧 修复：使用nodeTypes.js中的配置获取正确的形状和样式
        let nodeConfig = { shape: 'circle', width: 120, height: 60 } // 默认配置
        let nodeAttrs = {
          body: { fill: '#ffffff', stroke: '#333333' },
          label: { text: '新节点', fill: '#333333' }
        } // 默认样式
        
        try {
          const { getNodeConfig, getNodeAttrs } = require('../../../../utils/nodeTypes.js')
          const config = getNodeConfig('start') // 默认使用start类型
          const attrs = getNodeAttrs('start')
          
          if (config) nodeConfig = config
          if (attrs) nodeAttrs = attrs
        } catch (error) {
          console.warn('[DataTransformUtils] 获取节点配置失败，使用默认值:', error)
        }

        const defaultData = {
          id: nodeId,
          shape: nodeConfig.shape,
          x: 0,
          y: 0,
          width: nodeConfig.width || 120,
          height: nodeConfig.height || 60,
          label: '新节点',
          data: {},
          attrs: nodeAttrs
        }
        
        console.log('[DataTransformUtils] 默认节点数据:', defaultData)
        return defaultData
      } catch (error) {
        console.error('[DataTransformUtils] 获取默认节点数据时发生错误:', error)
        ErrorHandler.handleError(error, 'DEFAULT_NODE_DATA_ERROR')
        
        // 返回一个最基本的节点数据
        return {
          id: `node_${Date.now()}`,
          shape: 'circle',
          x: 0,
          y: 0,
          width: 120,
          height: 60,
          label: '新节点',
          data: {},
          attrs: {}
        }
      }
    },

    /**
     * 获取默认连接数据
     * @returns {Object} 默认连接数据
     */
    getDefaultEdgeData() {
      return {
        id: DataTransformUtils.utils.generateId('edge'),
        shape: 'edge',
        source: '',
        target: '',
        label: '',
        data: {},
        attrs: {
          line: { stroke: '#333333', strokeWidth: 2 }
        }
      }
    }
  }
}

// 导出常用方法的快捷访问
export const {
  coordinates,
  format,
  validate,
  convert,
  utils
} = DataTransformUtils