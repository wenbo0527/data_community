<template>
  <div class="credit-product-step">
    <div class="credit-product-selection">
      <h3 class="section-title">信贷产品选择</h3>
      <div class="selection-controls">
        <a-select
          v-model="selectedCreditProducts"
          multiple
          placeholder="请选择信贷产品"
          class="credit-product-select"
        >
          <a-option v-for="product in creditProductOptions" :key="product.value" :value="product.value">
            {{ product.label }}
          </a-option>
        </a-select>
        <a-button type="primary" @click="handleAutoAllocation" class="auto-btn">
          自动分配
        </a-button>
      </div>
    </div>

    <div class="configuration-details" v-if="selectedCreditProducts.length > 0">
      <h3 class="section-title">配置明细</h3>
      <div v-for="(dataProduct, index) in formData.dataProducts" class="data-product-section">
        <div class="data-product-header">
          <span class="data-product-name">{{ dataProduct.name }}</span>
          <div class="summary-info">
            <span>已分配总量: {{ calculateAssignedTotal(dataProduct) }}</span>
            <span>待分配陪跑量: {{ dataProduct.totalAmount - calculateAssignedTotal(dataProduct) }}</span>
            <span>分配进度: {{ calculateAllocationProgress(dataProduct) }}%</span>
          </div>
        </div>
        <div v-for="scene in dataProduct.scenes" :key="scene.sceneValue" class="scene-section">
          <div class="scene-header">
            <span class="scene-name">{{ scene.sceneName }}</span>
          </div>
          <a-table 
            :data="getTableData(dataProduct)" 
            :columns="columns"
            :pagination="false"
            class="credit-product-table"
            :row-class="getRowClass">
            <template #scene="{ record }">
              {{ record.sceneName }}
            </template>
            <template #creditProduct="{ record }">
              {{ record.creditProductName }}
            </template>
            <template #amount="{ record }">
              <a-input-number
                v-model="record.amount"
                :min="0"
                :max="record.sceneValueAmount || 0"
                placeholder="请输入陪跑量"
                @change="updateAmount(record, record.sceneValue)"
              />
            </template>
            <template #recommendedAmount="{ record }">
              {{ calculateRecommendedAmount(record) }}
            </template>
            <template #weeklyRatio="{ record }">
              {{ calculateWeeklyRatio(record) }}%
            </template>
            <template #submissionRatio="{ record }">
              {{ calculateSubmissionRatio(record) }}%
            </template>
            <template #totalRatio="{ record }">
              {{ calculateRatio(record.amount, dataProduct.totalAmount) }}%
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <div class="form-footer">
      <a-space>
        <a-button size="large" @click="handlePrev">上一步</a-button>
        <a-button type="primary" size="large" @click="handleNext">下一步</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormData, Scene } from '../../types/accompany'
import { calculateTotalRatio } from '../../utils/calculations'

interface CreditProductAllocation {
  creditProductValue: string;
  amount: number;
  dataProductId: string;
  sceneValue: string;
}

const props = defineProps<{
  formData: FormData
}>()

const emit = defineEmits(['next', 'prev'])

const selectedCreditProducts = ref<string[]>([])

console.log('初始化selectedCreditProducts:', selectedCreditProducts.value)

// 模拟信贷产品数据
const creditProductOptions = [
  { 
    label: '信贷产品A', 
    value: 'credit_a',
    weeklyRatio: 25.5,
    submissionRatio: 18.2,
    recommendedRate: 0.35
  },
  {
    label: '信贷产品B',
    value: 'credit_b',
    weeklyRatio: 18.0,
    submissionRatio: 12.5,
    recommendedRate: 0.28
  },
  {
    label: '信贷产品C',
    value: 'credit_c',
    weeklyRatio: 22.3,
    submissionRatio: 15.8,
    recommendedRate: 0.32
  }
]



const getSelectedScenes = (dataProduct: { scenes?: any[] }): any[] => {
  const scenes = dataProduct.scenes || []
  console.log('获取选中场景数据:', scenes)
  return scenes
}

const getCreditProductData = (dataProduct: any, scene: { sceneValue: string; sceneName: string; amount: number; ratio: number; creditProducts?: any[] }) => {
  console.log('获取信贷产品数据，场景信息:', scene)
  const creditProducts = selectedCreditProducts.value.map(creditProductValue => {
    const creditProductName = creditProductOptions.find(option => option.value === creditProductValue)?.label || ''
    const product = {
      creditProductValue,
      creditProductName,
      amount: 0,
      dataProductId: dataProduct.id,
      sceneValue: scene.sceneValue
    }
    console.log('生成信贷产品数据:', product)
    return product
  })
  return creditProducts
}

const calculateRatio = (amount: number, total: number) => {
  if (typeof amount !== 'number' || typeof total !== 'number' || total <= 0) {
    console.warn('计算比例参数无效:', { amount, total })
    return '0.00'
  }
  const validAmount = Math.max(0, amount)
  const ratio = ((validAmount / total) * 100).toFixed(2)
  console.log('计算比例:', { amount: validAmount, total, ratio })
  return ratio
}

const updateAmount = (record: {
  amount: number;
  creditProductValue: string;
  dataProductId: string;
  sceneValue: string;
  sceneValueAmount?: number;
}, sceneName: string) => {
  console.log('updateAmount调用，传入的record:', record, '场景名称:', sceneName)
  
  if (!record || typeof record.amount !== 'number' || !record.creditProductValue || !record.sceneValue) {
    console.warn('无效的记录数据:', record)
    return
  }

  const dataProduct = props.formData.dataProducts.find(dp => dp.id === record.dataProductId)
  if (!dataProduct) {
    console.warn('未找到对应的数据产品:', record.dataProductId)
    return
  }

  if (!Array.isArray(dataProduct.scenes)) {
    dataProduct.scenes = []
  }

  let scene = dataProduct.scenes.find(s => s.sceneValue === record.sceneValue)
  if (!scene) {
    scene = {
      sceneValue: record.sceneValue,
      sceneName: sceneName,
      amount: record.sceneValueAmount || 0,
      ratio: 0,
      totalAmount: dataProduct.totalAmount || 0,
      allocatedAmount: 0,
      remainingAmount: dataProduct.totalAmount || 0,
      weeklyAvgAmount: 0,
      weeklyAvgRatio: '0',
      submissionRatio: '0',
      creditProducts: []
    }
    dataProduct.scenes.push(scene)
  }

  if (!Array.isArray(scene.creditProducts)) {
    scene.creditProducts = []
  }

  let creditProduct = scene.creditProducts.find(cp => cp.creditProductValue === record.creditProductValue)
  if (creditProduct) {
    creditProduct.amount = Math.min(record.amount, scene.amount || 0)
  } else {
    creditProduct = {
      creditProductValue: record.creditProductValue,
      creditProductName: creditProductOptions.find(p => p.value === record.creditProductValue)?.label || '',
      amount: Math.min(record.amount, scene.amount || 0),
      recommendedAmount: calculateRecommendedAmount(record),
      weeklyRatio: Number(calculateWeeklyRatio(record)),
      submissionRatio: Number(calculateSubmissionRatio(record)),
      totalRatio: Number(calculateRatio(record.amount, dataProduct.totalAmount)),
      dataProductId: record.dataProductId,
      sceneValue: record.sceneValue,
      sceneValueAmount: scene.amount || 0
    }
    scene.creditProducts.push(creditProduct)
  }

  scene.allocatedAmount = scene.creditProducts.reduce((sum, cp) => sum + (cp.amount || 0), 0)
  scene.remainingAmount = Math.max(0, scene.amount - scene.allocatedAmount)
  scene.ratio = Number(calculateRatio(scene.allocatedAmount, dataProduct.totalAmount))

  console.log('更新后的场景数据:', scene)
};

const handleNext = () => {
  emit('next')
}

const handlePrev = () => {
  emit('prev')
}

const columns = [
  { title: '信贷产品', slotName: 'creditProduct', width: 160 },
  { title: '分配条数', slotName: 'amount', width: 140 },
  { title: '建议分配量', slotName: 'recommendedAmount', width: 140 },
  { title: '周均转化率', slotName: 'weeklyRatio', width: 120 },
  { title: '提交转化率', slotName: 'submissionRatio', width: 120 },
  { title: '总占比', slotName: 'totalRatio', width: 100 }
]

const getTableData = (dataProduct: any) => {
  console.log('获取表格数据，数据产品:', dataProduct)
  if (!dataProduct || !Array.isArray(dataProduct.scenes)) {
    console.warn('数据产品或场景数据无效')
    return []
  }

  const scenes = dataProduct.scenes
  console.log('场景数据:', scenes)
  
  const tableData = scenes.map((scene: Scene) => {
    if (!scene) return []
    console.log('处理场景数据:', scene)

    const sceneName = sceneOptions.find(option => option.value === scene.sceneValue)?.label || scene.sceneName || ''

    // 为每个场景的每个信贷产品创建数据行
    return selectedCreditProducts.value.map(creditProductValue => {
      const product = creditProductOptions.find(p => p.value === creditProductValue)
      const existingProduct = scene.creditProducts?.find(cp => cp.creditProductValue === creditProductValue)

      return {
        sceneName,
        sceneValue: scene.sceneValue,
        creditProductValue,
        creditProductName: product?.label || '',
        amount: existingProduct?.amount || 0,
        recommendedAmount: calculateRecommendedAmount({ creditProductValue, sceneValueAmount: scene.amount || 0 }),
        weeklyRatio: Number(calculateWeeklyRatio({ creditProductValue })),
        submissionRatio: Number(calculateSubmissionRatio({ creditProductValue })),
        totalRatio: Number(calculateRatio(existingProduct?.amount || 0, dataProduct.totalAmount)),
        dataProductId: dataProduct.id,
        sceneValueAmount: scene.amount || 0
      }
    })
  }).flat().filter(Boolean)
  
  console.log('生成的表格数据:', tableData)
  return tableData
}

const getRowClass = (record: any) => {
  return {
    'scene-row': true
  }
}

const calculateAssignedTotal = (dataProduct: any) => {
  let total = 0
  dataProduct.scenes?.forEach((scene: any) => {
    scene.creditProducts?.forEach((cp: any) => {
      total += cp.amount || 0
    })
  })
  return total
}

const calculateAllocationProgress = (dataProduct: any) => {
  const assignedTotal = calculateAssignedTotal(dataProduct)
  return dataProduct.totalAmount ? ((assignedTotal / dataProduct.totalAmount) * 100).toFixed(2) : 0
}

const selectedScenes = ref<string[]>(['credit_apply', 'credit_pass'])

const sceneConfig = ref<Record<string, Array<{
  sceneValue: string;
  creditProductValue: string;
  creditProductName: string;
  amount: number;
  dataProductId: string;
  sceneValueAmount?: number;
}>>>({});

const sceneOptions = [
  { label: '授信申请', value: 'credit_apply' },
  { label: '授信通过', value: 'credit_pass' },
  { label: '信贷产品B', value: 'credit_b' },
  { label: '信贷产品C', value: 'credit_c' }
]

// 修改calculateSceneTotal方法
const calculateSceneTotal = (sceneValue: string): number => {
  return props.formData.dataProducts.reduce((total, product) => {
    const scene = product.scenes?.find((s: any) => s.sceneValue === sceneValue)
    return total + (scene?.amount || 0)
  }, 0)
}

const handleAutoAllocation = () => {
  console.log('开始自动分配，当前选中的信贷产品:', selectedCreditProducts.value)
  selectedScenes.value.forEach(sceneValue => {
    const totalPerScene = props.formData.dataProducts.reduce((sum, dp) => {
      const sceneData = dp.scenes?.find((s: any) => s.sceneValue === sceneValue)
      return sum + (sceneData?.amount || 0)
    }, 0)
    
    const avgAmount = Math.floor(totalPerScene / selectedCreditProducts.value.length)
    sceneConfig.value[sceneValue] = selectedCreditProducts.value.map(creditProductValue => ({
      sceneValue: sceneValue,
      creditProductValue,
      amount: avgAmount,
      dataProductId: props.formData.dataProducts[0]?.id,
      creditProductName: creditProductOptions.find(p => p.value === creditProductValue)?.label || ''
    }))
  })
}

// 更新计算函数
const calculateRecommendedAmount = (record: { creditProductValue: string; sceneValueAmount?: number }) => {
  const product = creditProductOptions.find(p => p.value === record.creditProductValue);
  return product && record.sceneValueAmount ? Math.round(record.sceneValueAmount * (product.recommendedRate || 0)) : 0;
};

const calculateWeeklyRatio = (record: { creditProductValue: string }) => {
  const product = creditProductOptions.find(p => p.value === record.creditProductValue);
  return product ? product.weeklyRatio?.toFixed(2) || '0.00' : '0.00';
};

const calculateSubmissionRatio = (record: { creditProductValue: string }) => {
  const product = creditProductOptions.find(p => p.value === record.creditProductValue);
  return product ? product.submissionRatio?.toFixed(2) || '0.00' : '0.00';
};

// 在script setup中添加
import { onMounted } from 'vue'
onMounted(() => {
  initializeSceneConfig(true)
})

const initializeSceneConfig = (forceUpdate = false) => {
  console.log('初始化场景配置开始，forceUpdate:', forceUpdate)
  selectedScenes.value = ['credit_apply', 'credit_pass'];
  props.formData.dataProducts.forEach((dataProduct) => {
    console.log('处理数据产品:', dataProduct)
    selectedScenes.value.forEach((sceneValue) => {
      console.log('处理场景:', sceneValue)
      sceneConfig.value[sceneValue] = selectedCreditProducts.value.map(creditProductValue => {
        const existing = sceneConfig.value[sceneValue]?.find(
          (item: { creditProductValue: string; dataProductId: string }) => 
            item.creditProductValue === creditProductValue && 
            item.dataProductId === dataProduct.id
        );
        const newConfig = existing || {
          sceneValue,
          creditProductValue,
          creditProductName: creditProductOptions.find(p => p.value === creditProductValue)?.label || '',
          amount: 0,
          dataProductId: dataProduct.id,
          sceneValueAmount: dataProduct.scenes?.find(s => s.sceneValue === sceneValue)?.amount || 0
        };
        console.log('场景配置项:', newConfig)
        return newConfig;
      });
    });
  });
  console.log('初始化场景配置完成，当前配置:', sceneConfig.value)
};

// 监听信贷产品选择变化
watch(selectedCreditProducts, (newValue) => {
  console.log('信贷产品选择变化，新值:', newValue)
  console.log('当前表格数据:', getTableData(props.formData.dataProducts[0]))
  initializeSceneConfig(true)
}, { deep: true })
</script>

<style scoped>
.credit-product-step {
  padding: 24px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.credit-product-select {
  width: 100%;
  margin-bottom: 24px;
}

.data-product-section {
  margin-bottom: 24px;
}

.data-product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.scene-header {
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 12px;
  border-left: 4px solid #165DFF;
}

.scene-name {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

.scene-section {
  margin-top: 16px;
}

.scene-title {
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.form-footer {
  margin-top: 40px;
  text-align: center;
}

.form-footer :deep(.arco-btn) {
  min-width: 120px;
  height: 40px;
  font-size: 16px;
}

.summary-info {
  margin-left: 16px;
  font-size: 14px;
  color: #666;
}

.summary-info span {
  margin-right: 16px;
}

.selection-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.auto-btn {
  min-width: 100px;
  height: 36px;
}

.scene-table {
  margin: 16px 0;
  :deep(.arco-table) {
    margin: 12px 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    
    .arco-table-th {
      background: #f8f9fb;
      font-weight: 500;
    }
    
    .arco-table-tr {
      transition: background 0.2s;
      &:hover {
        background: #f8f9fb !important;
      }
    }
    
    .arco-input-number {
      width: 120px;
    }
  }
  
  .nested-table {
    margin: 12px 24px;
    :deep(.arco-table) {
      box-shadow: none;
      background: #f8fafc;
      
      .arco-table-th {
        background: #f1f3f5;
      }
    }
  }
}
</style>
