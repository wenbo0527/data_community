<template>
  <div class="asset-guide-page">
    <a-page-header title="资产指南" sub-title="新人入门、查找方法、最佳实践">
      <template #extra>
        <a-button @click="goWorkbench">返回工作台</a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="16">
        <a-card :bordered="false" title="快速开始">
          <a-steps :current="2" direction="vertical" size="small">
            <a-step description="了解数据社区的四大核心模块:数据发现、数据管理、数据探索。" title="认识平台">
              <template #icon><icon-storage /></template>
            </a-step>
            <a-step description="根据业务域找到你的表,了解表的字段、口径、更新频率。" title="查找资产">
              <template #icon><icon-search /></template>
            </a-step>
            <a-step description="申请字段权限,获得授权后可查询或下载数据。" title="申请权限">
              <template #icon><icon-safe /></template>
            </a-step>
            <a-step description="在工作台收藏常用表,实时跟踪指标变化。" title="开始工作">
              <template #icon><icon-star /></template>
            </a-step>
          </a-steps>
        </a-card>

        <a-card :bordered="false" title="最佳实践" style="margin-top: 16px">
          <a-collapse :default-active-key="['1']">
            <a-collapse-item header="如何选择数据源?" key="1">
              <p>1. <strong>优先使用 DWS 汇总表</strong>:已经过清洗和聚合,性能更好</p>
              <p>2. <strong>明确业务域</strong>:通过业务域筛选,避免误用</p>
              <p>3. <strong>检查质量分</strong>:≥90 优先,60-89 谨慎,&lt;60 避免</p>
            </a-collapse-item>
            <a-collapse-item header="如何申请字段权限?" key="2">
              <p>1. 进入"数据管理 > 字段权限申请"</p>
              <p>2. 选择需要访问的表和字段</p>
              <p>3. 填写使用场景和数据范围</p>
              <p>4. 等待审批(通常 1-2 个工作日)</p>
            </a-collapse-item>
            <a-collapse-item header="如何阅读血缘图?" key="3">
              <p>1. <strong>上游</strong>:数据从哪里来(ODS → DWD → DWS → ADS)</p>
              <p>2. <strong>下游</strong>:数据被谁使用</p>
              <p>3. <strong>影响分析</strong>:如果修改某字段,会影响到哪些下游</p>
            </a-collapse-item>
            <a-collapse-item header="数据更新频率说明" key="4">
              <p><strong>T+0</strong>:实时(秒级延迟) · <strong>T+1</strong>:每日更新 · <strong>T+7</strong>:每周更新</p>
              <p>业务报表建议使用 T+1,实时大屏使用 T+0,趋势分析使用 T+7</p>
            </a-collapse-item>
          </a-collapse>
        </a-card>
      </a-col>

      <a-col :span="8">
        <a-card :bordered="false" title="常用入口">
          <a-list>
            <a-list-item v-for="(e, i) in quickEntries" :key="i">
              <a-list-item-meta>
                <template #avatar>
                  <a-avatar :style="{ background: e.color }">{{ e.icon }}</a-avatar>
                </template>
                <template #title>
                  <a-link @click="goTo(e.path)">{{ e.name }}</a-link>
                </template>
                <template #description>{{ e.desc }}</template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>

        <a-card :bordered="false" title="帮助文档" style="margin-top: 16px">
          <a-list size="small">
            <a-list-item v-for="(d, i) in docs" :key="i">
              <a-link>{{ d.title }}</a-link>
              <div style="color: #86909c; font-size: 12px; margin-top: 4px">{{ d.summary }}</div>
            </a-list-item>
          </a-list>
        </a-card>

        <a-card :bordered="false" title="联系支持" style="margin-top: 16px">
          <a-list size="small">
            <a-list-item><strong>数据 BP:</strong>张数据</a-list-item>
            <a-list-item><strong>反馈邮箱:</strong>data@company.com</a-list-item>
            <a-list-item><strong>Slack 群:</strong>#data-community</a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const quickEntries = ref([
  { name: '数据地图', desc: '浏览所有表和字段', icon: '📊', color: '#165dff', path: 'discovery/data-map' },
  { name: '客户 360', desc: '客户全景画像', icon: '👤', color: '#00b42a', path: 'exploration/customer360' },
  { name: '指标地图', desc: '业务指标体系', icon: '🎯', color: '#ff7d00', path: 'discovery/indicator-dict' },
  { name: '字段权限申请', desc: '申请数据访问权限', icon: '🔒', color: '#f53f3f', path: 'management/permission/data-permission/apply' },
  { name: '我的收藏', desc: '常用表快捷入口', icon: '⭐', color: '#722ed1', path: 'management/favorites' }
])

const docs = ref([
  { title: '数据社区用户手册', summary: '完整使用指南,适合所有用户' },
  { title: '数据建模规范 V2.0', summary: '表命名、字段命名、命名空间' },
  { title: '数据质量评估标准', summary: '6 大维度评估方法' },
  { title: 'API 调用最佳实践', summary: '性能优化、限流处理' }
])

function goTo(path: string) {
  router.push(path)
}

const goWorkbench = () => router.push('workbench')
</script>

<style lang="scss" scoped>
.asset-guide-page {
  padding: 24px;
  max-width: 1500px;
  margin: 0 auto;
}
</style>