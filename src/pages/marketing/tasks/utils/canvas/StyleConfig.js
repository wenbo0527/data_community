/**
 * 样式配置工具类
 * 统一管理节点和连接的样式配置，消除重复的样式定义
 */
export class StyleConfig {
  // 默认节点样式
  static DEFAULT_NODE_STYLE = {
    body: {
      fill: '#f0f0f0',
      stroke: '#d9d9d9',
      strokeWidth: 1,
      rx: 4,
      ry: 4
    },
    label: {
      fontSize: 12,
      fill: '#333',
      fontFamily: 'Arial, sans-serif',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle'
    }
  }

  // 默认连接样式
  static DEFAULT_CONNECTION_STYLE = {
    line: {
      stroke: '#666',
      strokeWidth: 2,
      strokeDasharray: '',
      targetMarker: {
        name: 'classic',
        size: 8,
        fill: '#666'
      }
    }
  }

  // 节点类型样式映射
  static NODE_TYPE_STYLES = {
    start: {
      body: {
        fill: '#e6f7ff',
        stroke: '#1890ff'
      },
      label: {
        fill: '#1890ff'
      }
    },
    end: {
      body: {
        fill: '#fff2e8',
        stroke: '#fa8c16'
      },
      label: {
        fill: '#fa8c16'
      }
    },
    condition: {
      body: {
        fill: '#f6ffed',
        stroke: '#52c41a'
      },
      label: {
        fill: '#52c41a'
      }
    },
    action: {
      body: {
        fill: '#fff1f0',
        stroke: '#ff4d4f'
      },
      label: {
        fill: '#ff4d4f'
      }
    },
    delay: {
      body: {
        fill: '#f9f0ff',
        stroke: '#722ed1'
      },
      label: {
        fill: '#722ed1'
      }
    }
  }

  // 连接类型样式映射
  static CONNECTION_TYPE_STYLES = {
    normal: {
      line: {
        stroke: '#666',
        strokeWidth: 2
      }
    },
    success: {
      line: {
        stroke: '#52c41a',
        strokeWidth: 2
      }
    },
    error: {
      line: {
        stroke: '#ff4d4f',
        strokeWidth: 2
      }
    },
    condition: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      }
    }
  }

  // 选中状态样式
  static SELECTED_STYLE = {
    node: {
      body: {
        stroke: '#1890ff',
        strokeWidth: 2,
        shadowBlur: 10,
        shadowColor: '#1890ff'
      }
    },
    connection: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 3
      }
    }
  }

  // 悬停状态样式
  static HOVER_STYLE = {
    node: {
      body: {
        stroke: '#40a9ff',
        strokeWidth: 2
      }
    },
    connection: {
      line: {
        stroke: '#40a9ff',
        strokeWidth: 3
      }
    }
  }

  /**
   * 获取节点样式
   * @param {string} nodeType - 节点类型
   * @param {string} state - 状态 (normal, selected, hover)
   * @returns {Object} 样式对象
   */
  static getNodeStyle(nodeType = 'default', state = 'normal') {
    let baseStyle = { ...this.DEFAULT_NODE_STYLE }
    
    // 应用节点类型样式
    if (this.NODE_TYPE_STYLES[nodeType]) {
      baseStyle = this.mergeStyles(baseStyle, this.NODE_TYPE_STYLES[nodeType])
    }
    
    // 应用状态样式
    if (state === 'selected') {
      baseStyle = this.mergeStyles(baseStyle, this.SELECTED_STYLE.node)
    } else if (state === 'hover') {
      baseStyle = this.mergeStyles(baseStyle, this.HOVER_STYLE.node)
    }
    
    return baseStyle
  }

  /**
   * 获取连接样式
   * @param {string} connectionType - 连接类型
   * @param {string} state - 状态 (normal, selected, hover)
   * @returns {Object} 样式对象
   */
  static getConnectionStyle(connectionType = 'normal', state = 'normal') {
    let baseStyle = { ...this.DEFAULT_CONNECTION_STYLE }
    
    // 应用连接类型样式
    if (this.CONNECTION_TYPE_STYLES[connectionType]) {
      baseStyle = this.mergeStyles(baseStyle, this.CONNECTION_TYPE_STYLES[connectionType])
    }
    
    // 应用状态样式
    if (state === 'selected') {
      baseStyle = this.mergeStyles(baseStyle, this.SELECTED_STYLE.connection)
    } else if (state === 'hover') {
      baseStyle = this.mergeStyles(baseStyle, this.HOVER_STYLE.connection)
    }
    
    return baseStyle
  }

  /**
   * 深度合并样式对象
   * @param {Object} target - 目标样式对象
   * @param {Object} source - 源样式对象
   * @returns {Object} 合并后的样式对象
   */
  static mergeStyles(target, source) {
    const result = { ...target }
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeStyles(result[key] || {}, source[key])
        } else {
          result[key] = source[key]
        }
      }
    }
    
    return result
  }

  /**
   * 获取节点尺寸配置
   * @param {string} nodeType - 节点类型
   * @returns {Object} 尺寸配置
   */
  static getNodeSize(nodeType = 'default') {
    const sizeMap = {
      start: { width: 100, height: 50 },
      end: { width: 100, height: 50 },
      condition: { width: 140, height: 70 },
      action: { width: 120, height: 60 },
      delay: { width: 110, height: 55 },
      default: { width: 120, height: 60 }
    }
    
    return sizeMap[nodeType] || sizeMap.default
  }

  /**
   * 获取网格配置
   * @returns {Object} 网格配置
   */
  static getGridConfig() {
    return {
      size: 10,
      visible: true,
      type: 'dot',
      args: {
        color: '#e0e0e0',
        thickness: 1
      }
    }
  }

  /**
   * 获取画布背景配置
   * @returns {Object} 背景配置
   */
  static getBackgroundConfig() {
    return {
      color: '#ffffff',
      image: null,
      repeat: 'no-repeat',
      position: 'center'
    }
  }
}