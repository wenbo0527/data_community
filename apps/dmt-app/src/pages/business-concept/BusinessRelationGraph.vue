<template>
  <div class="relation-graph-page">
    <div class="page-header">
      <h2>业务图谱管理</h2>
      <div class="header-actions">
        <a-button type="primary" @click="showCreateModal">
          <template #icon><IconPlus /></template>
          新建关系
        </a-button>
        <a-radio-group v-model="viewMode" type="button">
          <a-radio value="list">列表视图</a-radio>
          <a-radio value="graph">图谱视图</a-radio>
        </a-radio-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-show="viewMode === 'list'" class="list-view">
      <div class="search-bar">
        <a-input-search placeholder="搜索源实体或目标实体" style="width: 300px" />
        <a-select placeholder="关系类型" style="width: 150px; margin-left: 16px" allow-clear>
          <a-option value="组成">组成 (Composition)</a-option>
          <a-option value="关联">关联 (Association)</a-option>
          <a-option value="继承">继承 (Inheritance)</a-option>
        </a-select>
      </div>
      <a-table :data="relations" :bordered="false" style="margin-top: 16px">
        <template #columns>
          <a-table-column title="关系名称" data-index="name" />
          <a-table-column title="源实体">
            <template #cell="{ record }">
              <a-tag color="blue">{{ getEntityName(record.sourceEntityCode) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="关系类型" align="center">
            <template #cell="{ record }">
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeLabel(record.type) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="目标实体">
            <template #cell="{ record }">
              <a-tag color="purple">{{ getEntityName(record.targetEntityCode) }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewGraphFromNode(record.sourceEntityCode)">查看图谱</a-button>
                <a-button type="text" size="small" status="danger">删除</a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <!-- 图谱视图 (复用血缘分析样式的容器) -->
    <div v-show="viewMode === 'graph'" class="graph-view">
      <div class="graph-toolbar">
        <a-select v-model="filterLayer" placeholder="实体层级筛选" style="width: 150px; margin-right: 16px" @change="renderGraph">
          <a-option value="">全部层级</a-option>
          <a-option value="client">客户层</a-option>
          <a-option value="account">账户层</a-option>
          <a-option value="business">业务层</a-option>
        </a-select>
        <a-select v-model="centerNode" placeholder="选择中心实体" style="width: 200px" @change="renderGraph">
          <a-option v-for="entity in filteredEntities" :key="entity.code" :value="entity.code">{{ entity.name }}</a-option>
        </a-select>
        <a-button style="margin-left: 16px" @click="renderGraph">
          <template #icon><IconRefresh /></template>刷新
        </a-button>
        <a-button style="margin-left: 16px" @click="zoomIn">
          <template #icon><IconPlus /></template>放大
        </a-button>
        <a-button style="margin-left: 16px" @click="zoomOut">
          <template #icon><IconMinus /></template>缩小
        </a-button>
        <a-button style="margin-left: 16px" @click="fitView">
          <template #icon><IconExpand /></template>自适应
        </a-button>
      </div>
      
      <!-- X6 图谱容器 -->
      <div class="x6-graph-container" ref="graphContainer"></div>
    </div>

    <!-- 新建关系弹窗 -->
    <a-modal v-model:visible="createModalVisible" title="新建业务关系" @ok="handleCreateSubmit">
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="关系名称" required>
          <a-input v-model="createForm.name" placeholder="如：客户包含账户" />
        </a-form-item>
        <a-form-item label="源实体" required>
          <a-select v-model="createForm.source" placeholder="选择源实体">
            <a-option v-for="entity in entities" :key="entity.code" :value="entity.code">{{ entity.name }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关系类型" required>
          <a-select v-model="createForm.type" placeholder="选择关系类型">
            <a-option value="组成">组成 (Composition)</a-option>
            <a-option value="关联">关联 (Association)</a-option>
            <a-option value="继承">继承 (Inheritance)</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标实体" required>
          <a-select v-model="createForm.target" placeholder="选择目标实体">
            <a-option v-for="entity in entities" :key="entity.code" :value="entity.code">{{ entity.name }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { IconArrowRight, IconPlus, IconRefresh, IconExpand, IconMinus } from '@arco-design/web-vue/es/icon';
import { BusinessConceptStore } from '@/mock/shared/business-concept-store';
import { Message } from '@arco-design/web-vue';
import { Graph, Shape } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';
import dagre from '@dagrejs/dagre';
import BusinessNode from './components/BusinessNode.vue';

// 注册自定义节点
register({
  shape: 'business-node',
  width: 260,
  height: 120,
  component: BusinessNode,
});

const viewMode = ref('list');
const relations = ref(BusinessConceptStore.getRelations());
const entities = ref(BusinessConceptStore.getEntities());
const graphContainer = ref<HTMLElement | null>(null);
const graph = ref<Graph | null>(null);
const filterLayer = ref('');

const getEntityName = (code: string) => entities.value.find(e => e.code === code)?.name || code;

const getEntityLayer = (domainCode: string) => {
  if (domainCode === 'DOM001') return 'client';
  if (domainCode === 'DOM002') return 'account';
  return 'business';
};

const getLayerName = (layer: string) => {
  if (layer === 'client') return '客户层';
  if (layer === 'account') return '账户层';
  if (layer === 'business') return '业务层';
  return '未知';
};

const filteredEntities = computed(() => {
  if (!filterLayer.value) return entities.value;
  return entities.value.filter(e => getEntityLayer(e.domainCode) === filterLayer.value);
});

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    'association': 'green',
    'behavior': 'blue',
    'derivative': 'purple',
    'dependency': 'red',
    'composition': 'arcoblue',
    'inheritance': 'orange',
    '组成': 'arcoblue',
    '关联': 'green',
    '继承': 'orange'
  };
  return map[type] || 'gray';
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'association': '关联',
    'behavior': '行为',
    'derivative': '衍生',
    'dependency': '依赖',
    'composition': '组成',
    'inheritance': '继承'
  };
  return map[type] || type;
};

// 监听视图模式切换，确保图谱在可见时渲染
watch(viewMode, (newVal) => {
  if (newVal === 'graph') {
    nextTick(() => {
      // 这里的延时是为了确保容器已有尺寸
      setTimeout(() => {
        if (!graph.value) {
          initGraph();
        }
        renderGraph();
        // 确保图谱适应容器大小
        graph.value?.resize();
        fitView();
      }, 100);
    });
  }
});

onMounted(() => {
  // 默认选中第一个实体
  if (entities.value.length > 0) {
    centerNode.value = entities.value[0].code;
  }
});

onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose();
  }
});

// 新建弹窗
const createModalVisible = ref(false);
const createForm = reactive({
  name: '',
  source: '',
  type: '',
  target: ''
});

const showCreateModal = () => {
  createForm.name = '';
  createForm.source = '';
  createForm.type = '';
  createForm.target = '';
  createModalVisible.value = true;
};

const handleCreateSubmit = () => {
  if (!createForm.source || !createForm.target || !createForm.type) {
    Message.warning('请填写完整信息');
    return false;
  }
  Message.success('创建关系成功');
  createModalVisible.value = false;
};

// 图谱视图逻辑
const centerNode = ref('');

const viewGraphFromNode = (code: string) => {
  viewMode.value = 'graph';
  centerNode.value = code;
  nextTick(() => {
    renderGraph();
  });
};

const initGraph = () => {
  if (!graphContainer.value) return;
  if (graph.value) graph.value.dispose();

  graph.value = new Graph({
    container: graphContainer.value,
    grid: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'boundary',
      allowBlank: false,
    },
    panning: {
      enabled: true,
    },
    background: {
      color: 'var(--subapp-bg-secondary)',
    },
  });
};

const renderGraph = () => {
  if (!graph.value) {
    initGraph();
  }
  
  if (!graph.value) return;

  const nodes: any[] = [];
  const edges: any[] = [];
  
  // 构建全量图谱数据
  // 1. 添加所有实体节点 (应用筛选)
  const targetEntities = filterLayer.value 
    ? entities.value.filter(e => getEntityLayer(e.domainCode) === filterLayer.value)
    : entities.value;

  targetEntities.forEach(entity => {
    const domainName = BusinessConceptStore.getDomains().find(d => d.code === entity.domainCode)?.name || entity.domainCode;
    const layer = getEntityLayer(entity.domainCode);
    const layerName = getLayerName(layer);
    
    nodes.push({
      id: entity.code,
      shape: 'business-node',
      data: {
        ...entity,
        domainName,
        layer,
        layerName
      }
    });
  });

  // 2. 添加所有关系连线
  // 仅添加 source 和 target 都在当前 nodes 列表中的关系
  const nodeIds = new Set(nodes.map(n => n.id));
  
  relations.value.forEach(rel => {
    if (nodeIds.has(rel.sourceEntityCode) && nodeIds.has(rel.targetEntityCode)) {
      edges.push({
        source: rel.sourceEntityCode,
        target: rel.targetEntityCode,
        label: getTypeLabel(rel.type),
        attrs: {
          line: {
            stroke: getTypeColor(rel.type) === 'gray' ? 'var(--subapp-text-quaternary)' : getTypeColor(rel.type), // 简单映射颜色
            strokeWidth: 2,
            targetMarker: 'classic',
          },
          text: {
            fill: '#666',
            fontSize: 12,
          }
        }
      });
    }
  });

  // 使用 dagre 进行布局
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 260, height: 120 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  nodes.forEach((node) => {
    const pos = g.node(node.id);
    node.x = pos.x;
    node.y = pos.y;
  });

  graph.value.fromJSON({ nodes, edges });
  
  // 聚焦到中心节点（如果指定）
  if (centerNode.value) {
    const cell = graph.value.getCellById(centerNode.value);
    if (cell) {
      graph.value.scrollToCell(cell, { animation: { duration: 300 } });
      graph.value.select(cell);
    } else {
       graph.value.centerContent();
    }
  } else {
    graph.value.centerContent();
  }
};

const fitView = () => {
  graph.value?.zoomToFit({ padding: 40 });
  graph.value?.centerContent();
};

const zoomIn = () => {
  graph.value?.zoom(0.2);
};

const zoomOut = () => {
  graph.value?.zoom(-0.2);
};

</script>

<style scoped>
.relation-graph-page {
  padding: 20px;
  background: var(--color-bg-1);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--color-fill-2);
  border-radius: 4px;
}

/* 图谱视图样式 */
.graph-view {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 20px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.graph-toolbar {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.x6-graph-container {
  flex: 1;
  background: var(--subapp-bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--color-border-2);
  overflow: hidden;
  min-height: 600px;
}

</style>
