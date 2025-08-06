import { defineComponent, h, ref } from 'vue'
import { Graph, Node } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import * as echarts from 'echarts'

// 指标节点组件
const MetricNode = defineComponent({
  props: ['node'],
  setup(props) {
    const nodeData = props.node.getData()
    const chartRef = ref<HTMLDivElement>()
    let chartInstance: echarts.ECharts | null = null
    
    const initChart = () => {
      if (chartRef.value && !chartInstance) {
        chartInstance = echarts.init(chartRef.value)
        const option = {
          grid: { 
            top: 2, 
            bottom: 2, 
            left: 2, 
            right: 2 
          },
          xAxis: { 
            show: false, 
            type: 'category', 
            data: ['', '', '', '', ''] 
          },
          yAxis: { 
            show: false 
          },
          series: [{
            type: 'line',
            data: nodeData.trendData || [1, 3, 2, 4, 3],
            smooth: true,
            symbol: 'none',
            lineStyle: { 
              width: 2, 
              color: '#fff' 
            },
            areaStyle: { 
              opacity: 0.2,
              color: '#fff'
            }
          }]
        }
        chartInstance.setOption(option)
      }
    }

    // 获取状态图标
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'certified': return '✅'
        case 'pending': return '⚠️'
        case 'offline': return '❌'
        default: return '📊'
      }
    }

    return () => h('div', { 
      class: 'metric-node-container',
      style: {
        width: '120px',
        height: '80px',
        borderRadius: '8px',
        padding: '8px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }
    }, [
      // 状态徽章
      h('div', {
        class: 'status-badge',
        style: {
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '12px'
        }
      }, getStatusIcon(nodeData.status)),
      
      // 指标名称
      h('div', { 
        class: 'metric-name',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '4px',
          textAlign: 'center'
        }
      }, nodeData.name),
      
      // 当前值
      h('div', {
        class: 'metric-value',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '4px'
        }
      }, `${nodeData.value}${nodeData.unit || ''}`),
      
      // 迷你趋势图容器
      h('div', {
        ref: chartRef,
        style: { 
          width: '100%', 
          height: '24px' 
        },
        onVnodeMounted: initChart
      })
    ])
  }
})

// 注册自定义节点
export function registerMetricNode() {
  register({
    shape: 'metric-node',
    width: 120,
    height: 80,
    component: MetricNode,
    inherit: 'vue-shape'
  })
}

// 导出节点类型定义
export interface MetricNodeData {
  id: string
  name: string
  value: number
  unit?: string
  status: 'certified' | 'pending' | 'offline'
  line: string
  lineColor: string
  isTransfer?: boolean
  trendData?: number[]
  x: number
  y: number
}