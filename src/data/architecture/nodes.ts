export type NodeDetails = {
  description: string
  metrics?: Array<{ label: string; value: string }>
  links?: Array<{ text: string; route?: string; url?: string }>
}
export type NodeStyle = {
  color?: string
  icon?: string           // SVG 图标路径或名称
  iconType?: 'svg' | 'img' // 图标渲染类型
  animate?: 'pulse' | 'float' | 'none'
  opacity?: number
}
export type Node = {
  id: string
  name: string
  layerIndex: number
  xPct: number
  yPct: number
  zWeight?: number
  brief: string
  details: NodeDetails
  style?: NodeStyle
}
export const nodes: Node[] = [
  { 
    id: 'platform', 
    name: '数据源', 
    layerIndex: 0, 
    xPct: 21.1, 
    yPct: 16.6, 
    brief: '统一平台', 
    details: { description: '平台入口', links: [{ text: '管理', route: '/management/service' }] }, 
    style: { color: '#3B82F6', animate: 'pulse', icon: new URL('../../../assets/2_5d/nodes/source.png', import.meta.url).href } 
  },
  { 
    id: 'dws', 
    name: 'DWS', 
    layerIndex: 1, 
    xPct: 21.7, 
    yPct: 43.0, 
    brief: '数据仓库分层', 
    details: { description: '数据服务层' }, 
    style: { color: '#8B5CF6', animate: 'float', icon: new URL('../../../assets/2_5d/nodes/dws.png', import.meta.url).href } 
  },
  { 
    id: 'dwd', 
    name: 'DWD', 
    layerIndex: 1, 
    xPct: 34.1, 
    yPct: 30.9, 
    brief: '明细层', 
    details: { description: '主题明细' }, 
    style: { color: '#8B5CF6', animate: 'float', icon: new URL('../../../assets/2_5d/nodes/dwd.png', import.meta.url).href } 
  },
  { 
    id: 'ods', 
    name: 'ODS', 
    layerIndex: 1, 
    xPct: 45.1, 
    yPct: 18.4, 
    brief: '操作数据层', 
    details: { description: '源数据' }, 
    style: { color: '#8B5CF6', animate: 'float', icon: new URL('../../../assets/2_5d/nodes/ods.png', import.meta.url).href } 
  },
  { 
    id: 'ltv', 
    name: 'LTV', 
    layerIndex: 2, 
    xPct: 71.3, 
    yPct: 23.6, 
    brief: '生命周期价值', 
    details: { description: '模型输出' }, 
    style: { color: '#10B981', icon: new URL('../../../assets/2_5d/nodes/ltv.png', import.meta.url).href } 
  },
  { 
    id: 'feature', 
    name: '特征集市', 
    layerIndex: 2, 
    xPct: 26.5, 
    yPct: 70.8, 
    brief: '特征集', 
    details: { description: '特征管理' }, 
    style: { color: '#10B981', icon: new URL('../../../assets/2_5d/nodes/feature.png', import.meta.url).href } 
  },
  { 
    id: 'risk', 
    name: '风险集市', 
    layerIndex: 2, 
    xPct: 34.8, 
    yPct: 62.1, 
    brief: '风控数据', 
    details: { description: '风险标签' }, 
    style: { color: '#10B981', icon: new URL('../../../assets/2_5d/nodes/risk.png', import.meta.url).href } 
  },
  { 
    id: 'labelMarket', 
    name: '标签集市', 
    layerIndex: 2, 
    xPct: 44.2, 
    yPct: 52.6, 
    brief: '标签市场', 
    details: { description: '统一标签' }, 
    style: { color: '#10B981', icon: new URL('../../../assets/2_5d/nodes/label-market.png', import.meta.url).href } 
  },
  { 
    id: 'report', 
    name: '报表集市', 
    layerIndex: 2, 
    xPct: 52.8, 
    yPct: 43.3, 
    brief: '报表与看板', 
    details: { description: '报表与看板' }, 
    style: { color: '#10B981', icon: new URL('../../../assets/2_5d/nodes/report.png', import.meta.url).href } 
  },
  { 
    id: 'credit', 
    name: '贷后集市', 
    layerIndex: 2, 
    xPct: 62.7, 
    yPct: 32.8, 
    brief: '贷后管理', 
    details: { description: '催收与监控数据' }, 
    style: { color: '#10B981', icon: new URL('../../../assets/2_5d/nodes/credit.png', import.meta.url).href } 
  },
  { 
    id: 'variable', 
    name: '变量', 
    layerIndex: 3, 
    xPct: 48.0, 
    yPct: 78.0, 
    brief: '变量管理', 
    details: { description: '变量库' }, 
    style: { color: '#F59E0B', icon: new URL('../../../assets/2_5d/nodes/variable.png', import.meta.url).href } 
  },
  { 
    id: 'label', 
    name: '标签', 
    layerIndex: 3, 
    xPct: 58.5, 
    yPct: 68.5, 
    brief: '标签使用', 
    details: { description: '标签服务' }, 
    style: { color: '#F59E0B', icon: new URL('../../../assets/2_5d/nodes/label.png', import.meta.url).href } 
  },
  { 
    id: 'viz', 
    name: '可视化', 
    layerIndex: 3, 
    xPct: 69.0, 
    yPct: 59.0, 
    brief: '图表与看板', 
    details: { description: '可视化展示' }, 
    style: { color: '#F59E0B', icon: new URL('../../../assets/2_5d/nodes/viz.png', import.meta.url).href } 
  },
  { 
    id: 'api', 
    name: 'API', 
    layerIndex: 3, 
    xPct: 79.5, 
    yPct: 49.5, 
    brief: '接口输出', 
    details: { description: '服务化输出' }, 
    style: { color: '#F59E0B', icon: new URL('../../../assets/2_5d/nodes/api.png', import.meta.url).href } 
  },
  { 
    id: 'marketing', 
    name: '数字营销', 
    layerIndex: 4, 
    xPct: 75.0, 
    yPct: 92.0, 
    brief: '营销场景', 
    details: { description: '营销编排' }, 
    style: { color: '#EF4444', animate: 'pulse', icon: new URL('../../../assets/2_5d/nodes/marketing.png', import.meta.url).href } 
  },
  { 
    id: 'creditControl', 
    name: '数字授信', 
    layerIndex: 4, 
    xPct: 88.0, 
    yPct: 78.0, 
    brief: '控信场景', 
    details: { description: '风控应用' }, 
    style: { color: '#EF4444', animate: 'pulse', icon: new URL('../../../assets/2_5d/nodes/credit-control.png', import.meta.url).href } 
  }
]
