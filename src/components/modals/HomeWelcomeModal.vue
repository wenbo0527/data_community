<template>
    <a-modal :visible="visible" @update:visible="(val) => $emit('update:visible', val)" :title="modalTitle"
        :mask-closable="false" :footer="false" width="800px">
        <!-- 新人引导内容 -->
        <div v-if="isNewUser" class="quick-start-guide">
            <div class="welcome-section" v-if="currentStep === 0 && !guideStarted">
                <h2 class="welcome-title">欢迎加入数据社区</h2>
                <div class="quick-start-card">
                    <p class="welcome-desc">快速了解数据社区的核心功能</p>
                    <a-button type="primary" size="large" @click="startGuide">开始体验</a-button>
                </div>
            </div>

            <div v-else class="guide-steps-container">
                <a-steps :current="currentStep" class="guide-steps">
                    <a-step title="认识数字社区" />
                    <a-step title="如何找数" />
                    <a-step title="如何看数" />
                    <a-step title="用数指引" />
                    <a-step title="常见问题" />
                </a-steps>

                <div class="guide-content">
                    <div class="step-content">
                        <div class="step-detail">
                            <h3>{{ currentStepContent.title }}</h3>
                            <div class="step-description">{{ currentStepContent.description }}</div>
                            <div class="step-features">
                                <div v-for="(feature, index) in currentStepContent.features" :key="index"
                                    class="feature-item">
                                    <icon-check-circle class="feature-icon" />
                                    <span>{{ feature }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="step-actions">
                        <a-button v-if="currentStep > 0" @click="prevStep">上一步</a-button>
                        <a-button type="primary" @click="nextStep">
                            下一步
                        </a-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 常用员工内容 -->
        <div v-else class="regular-user-content">
            <!-- 待办提醒 -->
            <a-row>
                <a-col :span="24">
                    <a-card title="待办提醒" :bordered="false">
                        <a-list :data="todoList" :max-height="300">
                            <template #item="{ item }">
                                <a-list-item>
                                    <a-space direction="vertical" style="width: 100%">
                                        <div class="todo-item-header">
                                            <span class="ticket-id">#{{ item.ticketId }}</span>
                                            <span class="ticket-title">{{ item.title }}</span>
                                            <a-space>
                                                <a-tag>{{ item.type }}</a-tag>
                                                <a-tag :color="item.priority === '高' ? 'red' : item.priority === '中' ? 'orange' : 'blue'">
                                                    {{ item.priority }}
                                                </a-tag>
                                                <a-tag :color="item.status === '待处理' ? 'orange' : item.status === '待评审' ? 'blue' : 'cyan'">
                                                    {{ item.status }}
                                                </a-tag>
                                            </a-space>
                                        </div>
                                        <div class="todo-item-content">
                                            <a-typography-paragraph type="secondary" :ellipsis="{ rows: 2 }">
                                                {{ item.description }}
                                            </a-typography-paragraph>
                                            <a-typography-text type="secondary">截止时间：{{ item.deadline }}</a-typography-text>
                                        </div>
                                    </a-space>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-card>
                </a-col>
            </a-row>
        </div>
    </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { IconArrowRise, IconArrowFall, IconCheckCircle } from '@arco-design/web-vue/es/icon'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/store'

// 定义getDepartmentFeatures函数
const getDepartmentFeatures = () => {
    console.log('当前用户部门:', userStore.userInfo.department);
    let features;
    switch (userStore.userInfo.department) {
        case 'risk':
            features = [
                '风控场景：变量查询/外数管理/模型部署',
                '风险评估：实时风控/反欺诈',
                '监控预警：指标看板/异常告警',
                '效果分析：策略评估/场景复盘'
            ];
            break;
        case 'marketing':
            features = [
                '营销场景：精准营销/活动策划',
                '客群管理：圈选客群/策略执行',
                '渠道分析：触达效果/转化分析',
                '活动监控：实时监控/效果评估'
            ];
            break;
        case 'data':
            features = [
                '数据治理：质量监控/数据标准',
                '资产管理：元数据/数据地图',
                '数据服务：API管理/权限控制',
                '运维监控：性能分析/容量规划'
            ];
            break;
        default:
            features = [
                '场景概览：常用场景/最佳实践',
                '功能导览：核心功能/操作指南',
                '工具集成：分析工具/开发环境',
                '协作支持：团队协作/技术支持'
            ];
    }
    console.log('返回的场景指引内容:', features);
    return features;
};

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    isNewUser: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:visible'])

// 获取用户store
const userStore = useUserStore()

// 模态框标题
const modalTitle = computed(() => {
    return props.isNewUser ? '欢迎加入数据社区' : '数据社区工作台'
})

// 新人引导相关
const currentStep = ref(0)
const guideStarted = ref(false)

// 计算当前显示的步骤内容
const currentStepContent = computed(() => {
    return stepContent[currentStep.value]
})

// 在组件挂载时输出currentStep的值
onMounted(() => {
    console.log('组件挂载时的currentStep值:', currentStep.value)
})

// 监听visible变化，当弹窗打开时重置步骤
watch(() => props.visible, (newVal) => {
    if (newVal && props.isNewUser) {
        currentStep.value = 0
        guideStarted.value = false
        console.log('弹窗打开时重置currentStep值:', currentStep.value)
    }
})

// 步骤内容
const stepContent = [
    {
        title: '认识数字社区',
        description: '数字社区是一个统一的数据应用门户入口，主要分为五大核心模块，你可以在此找到数据应用相关的所有功能',
        features: [
            '数据资产：查找和管理数据资产',
            '数据探索：数据查询与分析的工具包',
            '数字授信：变量中心与模型服务',
            '数字营销：营销策略与权益管理',
            '数字管理：数据服务与权限申请'
        ]
    },
    {
        title: '如何找数',
        description: '数据发现：全局数据资产管理，快速定位和使用所需数据。',
        features: [
            '数据地图：表/外部数据/CDP元素/风控变量',
            '搜索筛选：标签与关键词检索',
            '资产收藏：快速查询常用资产',
        ]
    },
    {
        title: '如何看数',
        description: '数据探索：多维度自助分析工具，支持深度数据洞察。',
        features: [
            'SQL分析：统一查询平台',
            '报表调取：智能报表库',
            '客群洞察：特征分析与人群比对',
            '模型开发：一站式开发部署'
        ]
    },
    {
        title: '用数指引',
        description: '基于部门角色的场景化应用指引。',
        features: getDepartmentFeatures()
    }
    ,
    {
        title: '常见问题',
        description: '全方位的数据安全保障与支持服务。',
        features: [
            '资产问题：直接联系数据责任人',
            '权限申请：标准化审批流程',
            '紧急支持：专人对接服务',
            '安全合规：数据使用规范'
        ]
    }
]

const startGuide = () => {
    // 设置guideStarted为true，触发视图切换
    guideStarted.value = true
    currentStep.value = 0
    console.log('点击开始体验后的currentStep值:', currentStep.value)
    // 确保显示认识数字社区的内容
    console.log('当前显示的步骤内容:', stepContent[currentStep.value])
}

const prevStep = () => {
    currentStep.value = Math.max(0, currentStep.value - 1)
}

const nextStep = () => {
    if (currentStep.value < stepContent.length - 1) {  // 根据stepContent数组长度判断
        const nextStepValue = currentStep.value + 1
        currentStep.value = nextStepValue
        console.log('切换到下一步:', nextStepValue)
    } else {
        Message.success('恭喜您完成新手引导！')
        emit('update:visible', false)
    }
}

// 待办列表数据
const todoList = ref([
    {
        title: '陪跑计划审批',
        priority: '高',
        deadline: '2024-01-16 18:00'
    },
    {
        title: '数据表权限申请',
        priority: '中',
        deadline: '2024-01-17 12:00'
    },
    {
        title: '监控指标X异常',
        priority: '低',
        deadline: '2024-01-18 15:00'
    }
])
</script>

<style scoped>
.quick-start-guide {
    padding: 32px;
}

.welcome-section {
    text-align: center;
}

.welcome-title {
    font-size: 32px;
    color: var(--color-text-1);
    margin-bottom: 24px;
}

.welcome-desc {
    font-size: 16px;
    color: var(--color-text-2);
    margin-bottom: 24px;
}

.quick-start-card {
    max-width: 400px;
    margin: 0 auto;
    padding: 32px;
    background: var(--color-bg-2);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-list {
    list-style: none;
    padding: 0;
    margin: 24px 0;
    text-align: left;
}

.feature-list li {
    margin: 12px 0;
    padding-left: 24px;
    position: relative;
}

.feature-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--color-primary);
}

.guide-steps-container {
    padding: 24px;
}

.guide-steps {
    margin-bottom: 40px;
}

:deep(.arco-steps-item-title) {
    white-space: nowrap;
    font-size: 14px;
}

.guide-content {
    margin-top: 32px;
}

.step-content {
    margin-bottom: 32px;
    overscroll-behavior: contain;
    touch-action: pan-y;
}

.step-description {
    font-size: 16px;
    color: var(--color-text-2);
    margin-bottom: 24px;
    line-height: 1.6;
}

.step-detail {
    flex: 1;
    padding-top: 8px;
}

.step-detail h3 {
    font-size: 24px;
    color: var(--color-text-1);
    margin-bottom: 24px;
}

.step-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
}

.feature-icon {
    color: var(--color-primary);
    font-size: 18px;
}

.step-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
}

.regular-user-content {
    padding: 16px;
}

.todo-item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
}

.ticket-id {
    color: var(--color-text-3);
    font-size: 14px;
}

.ticket-title {
    flex: 1;
    font-weight: 500;
    color: var(--color-text-1);
}

.todo-item-content {
    padding-left: 4px;
}

.a-list {
    overscroll-behavior: contain;
    scroll-behavior: smooth;
}

:deep(.arco-list-item) {
    padding: 16px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

:deep(.arco-list-item:hover) {
    background-color: var(--color-fill-2);
}
</style>