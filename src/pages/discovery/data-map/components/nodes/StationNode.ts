import { defineComponent, h, ref, onMounted } from 'vue'
import { register } from '@antv/x6-vue-shape'
import * as echarts from 'echarts'

const StationNode = defineComponent({
  props: ['node'],
  setup(props: any) {
    const data = props.node.getData()
    const size = data.level === 1 ? 40 : (data.level === 2 ? 30 : 20)
    const isTransferStation = data.isTransfer || false
    const chartRef = ref<HTMLDivElement>()
    
    onMounted(() => {
      if (chartRef.value && data.miniTrend) {
        const chart = echarts.init(chartRef.value)
        chart.setOption({
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false, type: 'category', data: [0, 1, 2, 3] },
          yAxis: { show: false },
          series: [{
            type: 'line',
            data: data.miniTrend,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#fff', width: 1 }
          }]
        })
      }
    })
    
    return () => h('div', {
      style: {
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: data.lineColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: data.level === 1 ? '12px' : (data.level === 2 ? '10px' : '8px'),
        fontWeight: 'bold',
        position: 'relative',
        cursor: 'pointer',
        border: isTransferStation ? '3px solid #FFD04B' : (data.level === 1 ? '2px solid #FFD04B' : 'none'),
        boxShadow: data.level === 1 ? '0 0 10px rgba(255, 208, 75, 0.5)' : '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        zIndex: data.level === 1 ? 3 : (data.level === 2 ? 2 : 1)
      },
      onMouseenter: (e: MouseEvent) => {
        const target = e.target as HTMLElement
        target.style.transform = 'scale(1.1)'
        target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)'
      },
      onMouseleave: (e: MouseEvent) => {
        const target = e.target as HTMLElement
        target.style.transform = 'scale(1)'
        target.style.boxShadow = data.level === 1 ? '0 0 10px rgba(255, 208, 75, 0.5)' : '0 2px 8px rgba(0,0,0,0.15)'
      }
    }, [
      // 站点名称
      h('span', {
        style: {
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          lineHeight: '1',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }
      }, data.label),
      
      // 迷你趋势图背景
      data.miniTrend && h('div', {
        ref: chartRef,
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          opacity: '0.3',
          pointerEvents: 'none'
        }
      }),
      
      // 层级标识
      data.level === 1 && h('div', {
        style: {
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#FFD04B',
          color: '#333',
          fontSize: '10px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }
      }, 'L1')
    ])
  }
})

export function registerStationNode() {
  register({
    shape: 'station-node',
    width: 40,
    height: 40,
    component: StationNode
  })
}