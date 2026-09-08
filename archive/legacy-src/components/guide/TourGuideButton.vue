<template>
  <div class="tour-guide-button-container">
    <a-button
      type="primary"
      shape="circle"
      class="tour-guide-button"
      @click="startTour"
    >
      <template #icon>
        <IconQuestionCircle />
      </template>
    </a-button>

    <TourGuide
      v-model:visible="tourVisible"
      :steps="tourSteps"
      @finish="handleTourFinish"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { IconQuestionCircle } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import TourGuide from './TourGuide.vue'

// 引导步骤配置
const tourSteps = [
  {
    element: '.data-assets',
    title: '数据资产',
    description: '在这里你可以查找和管理数据资产，包括数据表、外部数据、CDP元素和风控变量等。',
    position: 'right'
  },
  {
    element: '.data-exploration',
    title: '数据探索',
    description: '提供多维度自助分析工具，支持SQL分析、报表调取、客群洞察和模型开发等功能。',
    position: 'bottom'
  },
  {
    element: '.digital-credit',
    title: '数字授信',
    description: '变量中心与模型服务，支持实时风控和反欺诈等功能。',
    position: 'left'
  },
  {
    element: '.digital-marketing',
    title: '数字营销',
    description: '营销策略与权益管理，支持精准营销和活动策划等功能。',
    position: 'top'
  },
  {
    element: '.digital-management',
    title: '数字管理',
    description: '数据服务与权限申请，提供API管理和权限控制等功能。',
    position: 'left'
  }
]

// 引导状态
const tourVisible = ref(false)

// 开始引导
const startTour = () => {
  tourVisible.value = true
}

// 处理引导完成
const handleTourFinish = () => {
  Message.success('引导完成！')
}
</script>

<style scoped>
.tour-guide-button-container {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
}

.tour-guide-button {
  width: 48px;
  height: 48px;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.tour-guide-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>