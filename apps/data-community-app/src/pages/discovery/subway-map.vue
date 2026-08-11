<template>
  <div class="subway-map-page">
    <a-page-header
      title="数据地图 · 指标地铁图"
      sub-title="指标体系的拓扑视图 · 层级化展示关键指标 · 监控大盘"
      :back="false"
    >
      <template #extra>
        <a-space>
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回数据地图
          </a-button>
          <a-button>
            <template #icon><icon-fullscreen /></template>
            全屏
          </a-button>
          <a-button>
            <template #icon><icon-download /></template>
            导出图
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-card :bordered="false">
        <a-row :gutter="16">
          <!-- 左侧:线路图 -->
          <a-col :span="18">
            <div class="map-canvas">
              <svg viewBox="0 0 1200 700" class="subway-svg" preserveAspectRatio="xMidYMid meet">
                <!-- 网格背景 -->
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f1f2" stroke-width="1"/>
                  </pattern>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#c9cdd4"/>
                  </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <!-- 规模线 (青绿) -->
                <path
                  d="M 100,200 Q 400,200 600,250 T 1100,300"
                  fill="none" stroke="#00B2A9" stroke-width="6" opacity="0.85"
                />
                <text x="100" y="190" fill="#00B2A9" font-size="13" font-weight="600">规模线</text>

                <!-- 效率线 (橙) -->
                <path
                  d="M 100,300 Q 400,330 600,350 T 1100,400"
                  fill="none" stroke="#FF7D00" stroke-width="6" opacity="0.85"
                />
                <text x="100" y="290" fill="#FF7D00" font-size="13" font-weight="600">效率线</text>

                <!-- 质量线 (红) -->
                <path
                  d="M 100,400 Q 400,420 600,450 T 1100,500"
                  fill="none" stroke="#F53F3F" stroke-width="6" opacity="0.85"
                />
                <text x="100" y="390" fill="#F53F3F" font-size="13" font-weight="600">质量线</text>

                <!-- 节点:规模线 -->
                <g v-for="node in nodes.scale" :key="node.id" class="subway-node" @click="selectNode(node)">
                  <circle
                    :cx="node.x" :cy="node.y" r="22"
                    :fill="selectedNode?.id === node.id ? '#fff' : '#fff'"
                    :stroke="node.color" stroke-width="3"
                    class="node-circle"
                    :class="{ active: selectedNode?.id === node.id }"
                  />
                  <text
                    :x="node.x" :y="node.y + 4"
                    text-anchor="middle" font-size="11" font-weight="600"
                    :fill="node.color"
                  >
                    {{ node.code }}
                  </text>
                  <text
                    :x="node.x" :y="node.y + 38"
                    text-anchor="middle" font-size="11"
                    fill="#4e5969"
                  >
                    {{ node.name }}
                  </text>
                  <text
                    v-if="node.value"
                    :x="node.x" :y="node.y + 52"
                    text-anchor="middle" font-size="10"
                    :fill="node.color"
                    font-weight="600"
                  >
                    {{ node.value }}
                  </text>
                </g>

                <!-- 节点:效率线 -->
                <g v-for="node in nodes.efficiency" :key="node.id" class="subway-node" @click="selectNode(node)">
                  <circle
                    :cx="node.x" :cy="node.y" r="22"
                    fill="#fff" :stroke="node.color" stroke-width="3"
                    class="node-circle"
                    :class="{ active: selectedNode?.id === node.id }"
                  />
                  <text :x="node.x" :y="node.y + 4" text-anchor="middle" font-size="11" font-weight="600" :fill="node.color">
                    {{ node.code }}
                  </text>
                  <text :x="node.x" :y="node.y + 38" text-anchor="middle" font-size="11" fill="#4e5969">
                    {{ node.name }}
                  </text>
                  <text v-if="node.value" :x="node.x" :y="node.y + 52" text-anchor="middle" font-size="10" :fill="node.color" font-weight="600">
                    {{ node.value }}
                  </text>
                </g>

                <!-- 节点:质量线 -->
                <g v-for="node in nodes.quality" :key="node.id" class="subway-node" @click="selectNode(node)">
                  <circle
                    :cx="node.x" :cy="node.y" r="22"
                    fill="#fff" :stroke="node.color" stroke-width="3"
                    class="node-circle"
                    :class="{ active: selectedNode?.id === node.id }"
                  />
                  <text :x="node.x" :y="node.y + 4" text-anchor="middle" font-size="11" font-weight="600" :fill="node.color">
                    {{ node.code }}
                  </text>
                  <text :x="node.x" :y="node.y + 38" text-anchor="middle" font-size="11" fill="#4e5969">
                    {{ node.name }}
                  </text>
                  <text v-if="node.value" :x="node.x" :y="node.y + 52" text-anchor="middle" font-size="10" :fill="node.color" font-weight="600">
                    {{ node.value }}
                  </text>
                </g>

                <!-- 换乘节点 -->
                <g v-for="t in transferNodes" :key="`t-${t.id}`" class="transfer-node" @click="selectNode(t)">
                  <rect :x="t.x - 12" :y="t.y - 12" width="24" height="24" fill="#fff" stroke="#165dff" stroke-width="3" rx="3"/>
                  <text :x="t.x" :y="t.y + 4" text-anchor="middle" font-size="11" font-weight="700" fill="#165dff">
                    {{ t.code }}
                  </text>
                </g>
              </svg>
            </div>
          </a-col>

          <!-- 右侧:详情 -->
          <a-col :span="6">
            <a-card :bordered="false" v-if="selectedNode">
              <template #title>
                <a-tag :color="selectedNode.color">{{ selectedNode.code }}</a-tag>
                {{ selectedNode.name }}
              </template>
              <a-descriptions :column="1" :bordered="true" size="small">
                <a-descriptions-item label="层级">{{ selectedNode.level }} 级指标</a-descriptions-item>
                <a-descriptions-item label="当前值">
                  <strong :style="{ color: selectedNode.color, fontSize: '16px' }">{{ selectedNode.value }}</strong>
                </a-descriptions-item>
                <a-descriptions-item label="同环比">
                  <span v-if="selectedNode.trend" :style="{ color: selectedNode.trend > 0 ? '#00b42a' : '#f53f3f' }">
                    {{ selectedNode.trend > 0 ? '↑' : '↓' }} {{ Math.abs(selectedNode.trend) }}%
                  </span>
                </a-descriptions-item>
                <a-descriptions-item label="Owner">{{ selectedNode.owner }}</a-descriptions-item>
                <a-descriptions-item label="更新频率">{{ selectedNode.frequency }}</a-descriptions-item>
                <a-descriptions-item label="定义" :span="1">{{ selectedNode.definition }}</a-descriptions-item>
                <a-descriptions-item label="关联指标">
                  <a-tag v-for="k in selectedNode.related" :key="k" color="arcoblue" size="small" style="margin: 2px">{{ k }}</a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </a-card>
            <a-card :bordered="false" v-else>
              <a-empty description="点击左侧节点查看指标详情" />
            </a-card>

            <!-- 图例 -->
            <a-card :bordered="false" title="线路图例" style="margin-top: 16px">
              <a-list size="small">
                <a-list-item>
                  <span class="legend-line" style="background: #00B2A9"></span>
                  <strong>规模线</strong>
                  <span style="margin-left: auto; color: #86909c; font-size: 12px">业务规模 / 资产</span>
                </a-list-item>
                <a-list-item>
                  <span class="legend-line" style="background: #FF7D00"></span>
                  <strong>效率线</strong>
                  <span style="margin-left: auto; color: #86909c; font-size: 12px">运营 / 转化</span>
                </a-list-item>
                <a-list-item>
                  <span class="legend-line" style="background: #F53F3F"></span>
                  <strong>质量线</strong>
                  <span style="margin-left: auto; color: #86909c; font-size: 12px">风控 / 合规</span>
                </a-list-item>
                <a-list-item>
                  <span class="legend-node" style="background: #165dff"></span>
                  <strong>换乘站</strong>
                  <span style="margin-left: auto; color: #86909c; font-size: 12px">跨业务核心指标</span>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selectedNode = ref<any>(null)

// 3 条线路 + 节点
const nodes = {
  scale: [
    { id: 'S1', code: 'S1', name: '新增用户', x: 200, y: 200, color: '#00B2A9', level: 1, value: '3,280', trend: 5.2, owner: '王运营', frequency: '日', definition: '每日新增注册并完成实名的用户数', related: ['M001', 'M002'] },
    { id: 'S2', code: 'S2', name: 'MAU', x: 450, y: 230, color: '#00B2A9', level: 2, value: '2.3M', trend: 8.5, owner: '王运营', frequency: '月', definition: '自然月内有任意活跃行为的去重用户数', related: ['M002', 'M003'] },
    { id: 'S3', code: 'S3', name: 'GMV', x: 700, y: 250, color: '#00B2A9', level: 1, value: '¥1,280万', trend: 12.3, owner: '李产品', frequency: '日', definition: '当日已支付订单的金额总和', related: ['M101', 'M102'] },
    { id: 'S4', code: 'S4', name: 'AUM', x: 950, y: 280, color: '#00B2A9', level: 1, value: '¥128亿', trend: 3.5, owner: '王运营', frequency: '日', definition: '管理资产规模', related: ['M201', 'M202'] }
  ],
  efficiency: [
    { id: 'E1', code: 'E1', name: '日活(DAU)', x: 200, y: 300, color: '#FF7D00', level: 3, value: '580K', trend: 3.2, owner: '王运营', frequency: '日', definition: '当日活跃用户数', related: ['M001'] },
    { id: 'E2', code: 'E2', name: '登录转化', x: 450, y: 340, color: '#FF7D00', level: 2, value: '85.5%', trend: 1.2, owner: '王运营', frequency: '日', definition: '访问到登录的转化率', related: ['M301'] },
    { id: 'E3', code: 'E3', name: '首单转化', x: 700, y: 370, color: '#FF7D00', level: 2, value: '12.8%', trend: 2.5, owner: '李产品', frequency: '周', definition: '新用户首单转化率', related: ['M302', 'M303'] },
    { id: 'E4', code: 'E4', name: 'ROI', x: 950, y: 400, color: '#FF7D00', level: 1, value: '3.5x', trend: 0.8, owner: '陈营销', frequency: '周', definition: '营销投入产出比', related: ['M301'] }
  ],
  quality: [
    { id: 'Q1', code: 'Q1', name: '授信通过率', x: 200, y: 400, color: '#F53F3F', level: 2, value: '68.5%', trend: 1.2, owner: '张风控', frequency: '日', definition: '通过申请 / 总申请数', related: ['M401'] },
    { id: 'Q2', code: 'Q2', name: 'Vintage 30+', x: 450, y: 430, color: '#F53F3F', level: 2, value: '2.35%', trend: -0.18, owner: '张风控', frequency: '月', definition: '放款30天后的逾期率', related: ['M402'] },
    { id: 'Q3', code: 'Q3', name: '首逾 FPD30', x: 700, y: 460, color: '#F53F3F', level: 2, value: '1.85%', trend: -0.05, owner: '张风控', frequency: '日', definition: '首次逾期30天比例', related: ['M403'] },
    { id: 'Q4', code: 'Q4', name: '回收率', x: 950, y: 500, color: '#F53F3F', level: 1, value: '92.5%', trend: 0.8, owner: '张风控', frequency: '日', definition: '逾期30天内回收率', related: ['M404'] }
  ]
}

// 换乘节点(跨业务核心)
const transferNodes = [
  { id: 'T1', code: 'T1', name: '用户活跃', x: 320, y: 260, color: '#165dff' },
  { id: 'T2', code: 'T2', name: '资金健康度', x: 820, y: 380, color: '#165dff' }
]

function selectNode(node: any) {
  selectedNode.value = node
}

const goBack = () => router.push('discovery/asset-catalog')
</script>

<style lang="scss" scoped>
.subway-map-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 0 24px 24px;
}

.map-canvas {
  background: white;
  border-radius: 4px;
  padding: 16px;
  min-height: 600px;
  position: relative;
  overflow: auto;
}

.subway-svg {
  width: 100%;
  height: auto;
  max-height: 700px;
  cursor: grab;
}

.subway-node {
  cursor: pointer;
  transition: all 0.2s;

  .node-circle {
    transition: all 0.2s;
  }

  &:hover .node-circle {
    r: 26;
  }
}

.transfer-node {
  cursor: pointer;

  &:hover rect {
    fill: #e8f3ff;
  }
}

.legend-line {
  display: inline-block;
  width: 24px;
  height: 4px;
  border-radius: 2px;
  margin-right: 12px;
  vertical-align: middle;
}

.legend-node {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #165dff;
  border-radius: 2px;
  margin-right: 12px;
  vertical-align: middle;
}
</style>