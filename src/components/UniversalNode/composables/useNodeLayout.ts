import { computed, ref, Ref } from 'vue'
import { useNodeSpacing, SpacingConfig } from './useNodeSpacing'

/**
 * 节点布局系统 - 使用Flexbox替代绝对定位
 * 确保布局稳定性，支持内容自动换行
 */

export interface NodeLayoutConfig {
  // 布局方向
  direction: 'row' | 'column'
  
  // 主轴对齐
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  
  // 交叉轴对齐
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  
  // 换行设置
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse'
  
  // 间距配置
  spacing: SpacingConfig
  
  // 尺寸限制
  minWidth: string
  maxWidth: string
  minHeight: string
  
  // 定位基准
  position: 'relative' | 'static'
  
  // 流式布局配置
  flowLayout: {
    enabled: boolean
    autoWrap: boolean
    maxItemsPerRow: number
    itemMinWidth: string
  }
}

export interface PortLayoutConfig {
  // 端口布局方向
  direction: 'horizontal' | 'vertical'
  
  // 端口对齐方式
  alignment: 'start' | 'center' | 'end' | 'space-between'
  
  // 端口间距
  gap: string
  
  // 端口容器配置
  container: {
    display: 'flex' | 'grid'
    flexDirection: 'row' | 'column'
    justifyContent: string
    alignItems: string
    minHeight: string
    padding: string
  }
  
  // 端口绑定配置
  binding: {
    bindToContent: boolean
    rowSpacing: string
    minRowHeight: string
  }
}

/**
 * 节点布局系统
 */
export function useNodeLayout() {
  const { calculateSpacing, calculatePortSpacing } = useNodeSpacing()
  
  /**
   * 创建节点布局配置
   */
  const createNodeLayout = (
    size: 'S' | 'M' | 'L' | 'XL',
    nodeType: string,
    hasPorts: boolean = true
  ): NodeLayoutConfig => {
    const spacing = calculateSpacing(size)
    
    // 基础布局配置
    const baseLayout: NodeLayoutConfig = {
      direction: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      spacing,
      minWidth: '240px', // 最小宽度240px
      maxWidth: '480px', // 最大宽度480px
      minHeight: 'auto',
      position: 'relative', // 组件整体设置position: relative作为定位基准
      flowLayout: {
        enabled: true,
        autoWrap: true,
        maxItemsPerRow: 2, // 每行最多2个元素
        itemMinWidth: '120px' // 每个元素最小宽度120px
      }
    }
    
    // 根据节点类型调整布局
    const typeSpecificLayout = adjustLayoutForNodeType(nodeType, baseLayout)
    
    // 根据是否有端口调整布局
    if (hasPorts) {
      return adjustLayoutForPorts(typeSpecificLayout)
    }
    
    return typeSpecificLayout
  }
  
  /**
   * 创建端口布局配置
   * 端口应该和内容行绑定，间距取决于行间距
   */
  const createPortLayout = (
    portCount: number,
    portType: 'input' | 'output' | 'both',
    size: 'S' | 'M' | 'L' | 'XL'
  ): PortLayoutConfig => {
    const portSpacing = calculatePortSpacing(portCount, size)
    
    // 确定端口布局方向
    const direction = portCount <= 2 ? 'horizontal' : 'vertical'
    
    // 基础端口布局配置
    const basePortLayout: PortLayoutConfig = {
      direction,
      alignment: 'center',
      gap: portSpacing.gap,
      container: {
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: portSpacing.minHeight,
        padding: portSpacing.padding
      },
      binding: {
        bindToContent: true, // 端口应该和内容行绑定
        rowSpacing: portSpacing.gap,
        minRowHeight: portSpacing.minHeight
      }
    }
    
    // 根据端口类型调整布局
    return adjustPortLayoutForType(basePortLayout, portType)
  }
  
  /**
   * 根据节点类型调整布局
   */
  const adjustLayoutForNodeType = (nodeType: string, layout: NodeLayoutConfig): NodeLayoutConfig => {
    const nodeTypeLayouts = {
      // 数据输入节点
      'data-input': {
        ...layout,
        alignItems: 'flex-start',
        flowLayout: {
          ...layout.flowLayout,
          maxItemsPerRow: 1
        }
      },
      
      // 数据处理节点
      'data-process': {
        ...layout,
        alignItems: 'center',
        justifyContent: 'center'
      },
      
      // 数据输出节点
      'data-output': {
        ...layout,
        alignItems: 'flex-end',
        flowLayout: {
          ...layout.flowLayout,
          maxItemsPerRow: 1
        }
      },
      
      // 条件节点
      'condition': {
        ...layout,
        direction: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      
      // 循环节点
      'loop': {
        ...layout,
        direction: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      },
      
      // 默认布局
      'default': layout
    }
    
    return nodeTypeLayouts[nodeType] || nodeTypeLayouts.default
  }
  
  /**
   * 为有端口的节点调整布局
   */
  const adjustLayoutForPorts = (layout: NodeLayoutConfig): NodeLayoutConfig => {
    return {
      ...layout,
      // 确保有足够的空间容纳端口
      minHeight: '120px',
      flowLayout: {
        ...layout.flowLayout,
        // 端口区域需要额外的间距
        itemMinWidth: '140px'
      }
    }
  }
  
  /**
   * 根据端口类型调整端口布局
   */
  const adjustPortLayoutForType = (layout: PortLayoutConfig, portType: string): PortLayoutConfig => {
    const portTypeLayouts = {
      'input': {
        ...layout,
        alignment: 'start',
        container: {
          ...layout.container,
          justifyContent: 'flex-start'
        }
      },
      
      'output': {
        ...layout,
        alignment: 'end',
        container: {
          ...layout.container,
          justifyContent: 'flex-end'
        }
      },
      
      'both': {
        ...layout,
        alignment: 'space-between',
        container: {
          ...layout.container,
          justifyContent: 'space-between'
        }
      }
    }
    
    return portTypeLayouts[portType] || layout
  }
  
  /**
   * 生成CSS样式对象
   */
  const generateLayoutStyles = (config: NodeLayoutConfig) => {
    return {
      display: 'flex',
      flexDirection: config.direction,
      justifyContent: config.justifyContent,
      alignItems: config.alignItems,
      flexWrap: config.flexWrap,
      position: config.position,
      minWidth: config.minWidth,
      maxWidth: config.maxWidth,
      minHeight: config.minHeight,
      padding: config.spacing.contentPadding,
      gap: config.spacing.contentGap,
      borderRadius: config.spacing.borderRadius
    }
  }
  
  /**
   * 生成端口CSS样式对象
   */
  const generatePortStyles = (config: PortLayoutConfig) => {
    return {
      display: config.container.display,
      flexDirection: config.container.flexDirection,
      justifyContent: config.container.justifyContent,
      alignItems: config.container.alignItems,
      gap: config.gap,
      minHeight: config.container.minHeight,
      padding: config.container.padding
    }
  }
  
  /**
   * 流式布局计算
   * 支持内容自动换行
   */
  const calculateFlowLayout = (
    items: any[],
    containerWidth: number,
    config: NodeLayoutConfig
  ) => {
    const { flowLayout } = config
    
    if (!flowLayout.enabled) {
      return {
        rows: [items],
        itemWidth: '100%'
      }
    }
    
    const itemMinWidth = parseInt(flowLayout.itemMinWidth)
    const maxItemsPerRow = Math.min(
      flowLayout.maxItemsPerRow,
      Math.floor(containerWidth / itemMinWidth)
    )
    
    const rows = []
    for (let i = 0; i < items.length; i += maxItemsPerRow) {
      rows.push(items.slice(i, i + maxItemsPerRow))
    }
    
    const itemWidth = maxItemsPerRow === 1 ? '100%' : `${Math.floor(100 / maxItemsPerRow)}%`
    
    return {
      rows,
      itemWidth
    }
  }
  
  /**
   * 响应式布局调整
   */
  const getResponsiveLayout = (
    config: NodeLayoutConfig,
    viewportWidth: number
  ): NodeLayoutConfig => {
    // 断点系统
    const breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1440
    }
    
    let adjustedConfig = { ...config }
    
    if (viewportWidth < breakpoints.mobile) {
      // 小屏幕调整
      adjustedConfig = {
        ...adjustedConfig,
        flowLayout: {
          ...adjustedConfig.flowLayout,
          maxItemsPerRow: 1
        }
      }
    } else if (viewportWidth < breakpoints.tablet) {
      // 中等屏幕调整
      adjustedConfig = {
        ...adjustedConfig,
        flowLayout: {
          ...adjustedConfig.flowLayout,
          maxItemsPerRow: Math.min(adjustedConfig.flowLayout.maxItemsPerRow, 2)
        }
      }
    }
    
    return adjustedConfig
  }
  
  /**
   * 布局验证
   */
  const validateLayout = (config: NodeLayoutConfig): boolean => {
    // 验证尺寸限制
    const minWidth = parseInt(config.minWidth)
    const maxWidth = parseInt(config.maxWidth)
    
    if (minWidth < 240 || maxWidth > 480) {
      console.warn(`节点尺寸超出限制范围: ${minWidth}px - ${maxWidth}px`)
      return false
    }
    
    // 验证流式布局配置
    if (config.flowLayout.enabled) {
      if (config.flowLayout.maxItemsPerRow < 1) {
        console.warn('流式布局每行最大项目数必须大于0')
        return false
      }
      
      if (parseInt(config.flowLayout.itemMinWidth) < 120) {
        console.warn('流式布局项目最小宽度不能小于120px')
        return false
      }
    }
    
    return true
  }
  
  return {
    createNodeLayout,
    createPortLayout,
    generateLayoutStyles,
    generatePortStyles,
    calculateFlowLayout,
    getResponsiveLayout,
    validateLayout
  }
}