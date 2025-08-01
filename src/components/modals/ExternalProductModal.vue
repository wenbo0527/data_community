<template>
  <a-modal :visible="visible" @cancel="handleCancel" :footer="false" width="80%">
    <div class="product-modal">
      <h3>{{ selectedProducts.length > 1 ? '多产品对比' : productData.product + ' 详细信息' }}</h3>
      
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" title="成本及消耗">
          <div class="modal-section">
            <h4>定价变化趋势</h4>
            <div ref="priceChartRef" style="width: 100%; height: 300px"></div>
          </div>
          
          <div class="modal-section">
            <h4>实际消耗趋势</h4>
            <div ref="costChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="2" title="性能指标">
          <div class="modal-section">
            <h4>性价比趋势 (KS/单价)</h4>
            <div ref="valueChartRef" style="width: 100%; height: 300px"></div>
          </div>
          
          <div class="modal-section">
            <h4>IV指标趋势</h4>
            <div ref="ivChartRef" style="width: 100%; height: 300px"></div>
          </div>
          
          <div class="modal-section">
            <h4>KS指标趋势</h4>
            <div ref="ksChartRef" style="width: 100%; height: 300px"></div>
          </div>
        </a-tab-pane>
        
        <a-tab-pane key="3" title="稳定性指标">
          <div class="modal-section">
            <h4>PSI指标趋势</h4>
            <div ref="psiChartRef" style="width: 100%; height: 300px"></div>
          </div>
         
        </a-tab-pane>
      </a-tabs>
      
      <div class="modal-actions">
        <a-button type="primary" @click="exportChartData">导出数据</a-button>
        <a-button type="primary" @click="toggleEditMode" style="margin-left: 8px;">{{ isEditing ? '保存' : '编辑' }}</a-button>
      </div>
      
      <a-modal v-model:visible="editModalVisible" title="编辑接口信息" @ok="handleSave" @cancel="cancelEdit">
        <a-form :model="editForm">
          <a-form-item label="数源种类">
            <a-input v-model="editForm.dataSourceType" />
          </a-form-item>
          <a-form-item label="数源分类">
            <a-input v-model="editForm.dataSourceCategory" />
          </a-form-item>
          <a-form-item label="供应商">
            <a-input v-model="editForm.supplier" />
          </a-form-item>
          <a-form-item label="单价">
            <a-input-number v-model="editForm.price" />
          </a-form-item>
          <a-form-item label="产品描述">
            <a-textarea v-model="editForm.description" />
          </a-form-item>
          <a-form-item label="落库表名">
            <a-input v-model="editForm.tableName" />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { generateExternalProductData } from '@/mock/external-data'

const props = defineProps({
  visible: Boolean,
  productData: {
    type: Object,
    default: () => ({})
  },
  selectedProducts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'update:productData'])

// 编辑状态
const isEditing = ref(false)
const editModalVisible = ref(false)
const editForm = ref({
  dataSourceType: '',
  dataSourceCategory: '',
  supplier: '',
  price: 0,
  description: '',
  tableName: ''
})

// 图表引用
const priceChartRef = ref()
const costChartRef = ref()
const valueChartRef = ref()
const ivChartRef = ref()
const ksChartRef = ref()
const psiChartRef = ref()
let priceChart: echarts.ECharts | null = null
let costChart: echarts.ECharts | null = null
let valueChart: echarts.ECharts | null = null
let ivChart: echarts.ECharts | null = null
let ksChart: echarts.ECharts | null = null
let psiChart: echarts.ECharts | null = null

// 更新图表
const updatePriceChart = (data: any[]) => {
  console.log('更新价格图表，数据长度:', data?.length)
  if (priceChartRef.value && priceChart && data?.length) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => {
            return `${param.seriesName}: ${param.value}元/条`
          }).join('<br/>')
        }
      },
      legend: {
        data: ['单次调用价格'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '单次调用价格（元/条）'
      },
      series: [
        {
          name: '单次调用价格',
          type: 'line',
          data: data.map(item => item.pricePerCall),
          itemStyle: {
            color: '#165DFF'
          },
          smooth: true,
          symbol: 'circle'
        }
      ]
    }
    priceChart.setOption(option)
    priceChart.resize()
  }
}

const updateCostChart = (data: any[]) => {
  console.log('更新成本图表，数据长度:', data?.length)
  if (costChartRef.value && costChart && data?.length) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => {
            return `${param.seriesName}: ${param.value}元`
          }).join('<br/>')
        }
      },
      legend: {
        data: ['预算', '实际消耗'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '金额（元）'
      },
      series: [
        {
          name: '预算',
          type: 'line',
          data: data.map(item => item.budget),
          itemStyle: {
            color: '#14C9C9'
          },
          smooth: true,
          symbol: 'circle'
        },
        {
          name: '实际消耗',
          type: 'line',
          data: data.map(item => item.actualCost),
          itemStyle: {
            color: '#722ED1'
          },
          smooth: true,
          symbol: 'circle'
        }
      ]
    }
    costChart.setOption(option)
    costChart.resize()
  }
}

const updateValueChart = (data: any[]) => {
  if (valueChartRef.value && valueChart && data?.length) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => {
            return `${param.seriesName}: ${param.value}`
          }).join('<br/>')
        }
      },
      legend: {
        data: ['性价比'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'KS/单价'
      },
      series: [
        {
          name: '性价比',
          type: 'line',
          data: data.map(item => item.valuePerPrice),
          itemStyle: {
            color: '#14C9C9'
          },
          smooth: true,
          symbol: 'circle'
        }
      ]
    }
    valueChart.setOption(option)
    valueChart.resize()
  }
}

const updateIvChart = (data: any[]) => {
  if (ivChartRef.value && ivChart && data?.length) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => {
            return `${param.seriesName}: ${param.value}`
          }).join('<br/>')
        }
      },
      legend: {
        data: ['IV'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'IV值'
      },
      series: [
        {
          name: 'IV',
          type: 'line',
          data: data.map(item => item.iv),
          itemStyle: {
            color: '#722ED1'
          },
          smooth: true,
          symbol: 'circle'
        }
      ]
    }
    ivChart.setOption(option)
    ivChart.resize()
  }
}

const updateKsChart = (data: any[]) => {
  if (ksChartRef.value && ksChart && data?.length) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => {
            return `${param.seriesName}: ${param.value}`
          }).join('<br/>')
        }
      },
      legend: {
        data: ['KS'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'KS值'
      },
      series: [
        {
          name: 'KS',
          type: 'line',
          data: data.map(item => item.ks),
          itemStyle: {
            color: '#F7BA1E'
          },
          smooth: true,
          symbol: 'circle'
        }
      ]
    }
    ksChart.setOption(option)
    ksChart.resize()
  }
}

const updatePsiChart = (data: any[]) => {
  if (psiChartRef.value && psiChart && data?.length) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          return params.map(param => {
            return `${param.seriesName}: ${param.value}`
          }).join('<br/>')
        }
      },
      legend: {
        data: ['PSI'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.month),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'PSI值'
      },
      series: [
        {
          name: 'PSI',
          type: 'line',
          data: data.map(item => item.psi),
          itemStyle: {
            color: '#D91AD9'
          },
          smooth: true,
          symbol: 'circle'
        }
      ]
    }
    psiChart.setOption(option)
    psiChart.resize()
  }
}

// 初始化图表
const initCharts = () => {
  console.log('初始化图表...')
  
  const checkAndInit = () => {
    if (priceChartRef.value && priceChartRef.value.clientWidth > 0 && priceChartRef.value.clientHeight > 0) {
      console.log('价格图表容器尺寸:', priceChartRef.value.clientWidth, 'x', priceChartRef.value.clientHeight)
      priceChart = echarts.init(priceChartRef.value)
      console.log('价格图表初始化成功')
    }
    
    if (costChartRef.value && costChartRef.value.clientWidth > 0 && costChartRef.value.clientHeight > 0) {
      console.log('成本图表容器尺寸:', costChartRef.value.clientWidth, 'x', costChartRef.value.clientHeight)
      costChart = echarts.init(costChartRef.value)
      console.log('成本图表初始化成功')
    }
    
    if (valueChartRef.value && valueChartRef.value.clientWidth > 0 && valueChartRef.value.clientHeight > 0) {
      valueChart = echarts.init(valueChartRef.value)
      console.log('性价比图表初始化成功')
    }
    
    if (ivChartRef.value && ivChartRef.value.clientWidth > 0 && ivChartRef.value.clientHeight > 0) {
      ivChart = echarts.init(ivChartRef.value)
      console.log('IV图表初始化成功')
    }
    
    if (ksChartRef.value && ksChartRef.value.clientWidth > 0 && ksChartRef.value.clientHeight > 0) {
      ksChart = echarts.init(ksChartRef.value)
      console.log('KS图表初始化成功')
    }
    
    if (psiChartRef.value && psiChartRef.value.clientWidth > 0 && psiChartRef.value.clientHeight > 0) {
      psiChart = echarts.init(psiChartRef.value)
      console.log('PSI图表初始化成功')
    }
    
    if (!priceChart || !costChart || !valueChart || !ivChart || !ksChart || !psiChart) {
      requestAnimationFrame(checkAndInit)
    }
  }
  
  checkAndInit()
}

const handleCancel = () => {
  emit('update:visible', false)
}

const exportChartData = () => {
  // 导出图表数据逻辑
}

const toggleEditMode = () => {
  if (!isEditing.value) {
    // 进入编辑模式，填充表单数据
    editForm.value = {
      dataSourceType: props.productData.dataSourceType || '',
      dataSourceCategory: props.productData.dataSourceCategory || '',
      supplier: props.productData.supplier || '',
      price: props.productData.price || 0,
      description: props.productData.description || '',
      tableName: props.productData.tableName || ''
    }
    editModalVisible.value = true
  } else {
    // 保存编辑
    handleSave()
  }
  isEditing.value = !isEditing.value
}

const handleSave = () => {
  // 更新产品数据
  const updatedData = {
    ...props.productData,
    ...editForm.value
  }
  emit('update:productData', updatedData)
  editModalVisible.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editModalVisible.value = false
}

const getLevelColor = (level: string) => {
  switch(level) {
    case '高': return 'green'
    case '中': return 'orange'
    case '低': return 'red'
    default: return 'gray'
  }
}

// 监听props变化
watch(() => props.productData, (newVal: any) => {
  if (newVal) {
    // 模拟数据
    const mockData = props.selectedProducts.length > 1 ? 
  props.selectedProducts.map(product => generateExternalProductData(product as string)).flat() :
  generateExternalProductData(props.productData.product || '产品A')
    
    console.log('生成的产品数据:', mockData)
    console.log('产品名称:', props.productData.product)
    console.log('selectedProducts:', props.selectedProducts)
    if (!mockData || mockData.length === 0) {
      console.error('生成的产品数据为空!')
      return
    }
    
    nextTick(() => {
      initCharts()
      nextTick(() => {
        updatePriceChart(mockData)
        updateCostChart(mockData)
        updateValueChart(mockData)
        updateIvChart(mockData)
        updateKsChart(mockData)
        updatePsiChart(mockData)
      })
    })
  }
}, { immediate: true })

// 初始化
onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})
</script>

<style scoped>
.product-modal {
  padding: 16px;
}

.modal-section {
  margin-bottom: 24px;
}

.stats-row {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>