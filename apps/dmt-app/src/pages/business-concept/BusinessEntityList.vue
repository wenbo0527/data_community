<template>
  <div class="entity-list">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="业务域" :bordered="false" class="full-height">
          <a-tree
            :data="domainTreeData"
            block-node
            v-model:selected-keys="selectedDomainKeys"
            @select="handleDomainSelect"
          />
        </a-card>
      </a-col>
      <a-col :span="18">
        <a-card :bordered="false" class="full-height">
          <template #title>
            <div class="entity-header">
              <span>{{ currentDomainName }} - 实体列表</span>
              <a-input-search placeholder="搜索实体..." style="width: 200px" />
            </div>
          </template>
          
          <a-table :data="filteredEntities" :pagination="false" :bordered="false">
            <template #columns>
              <a-table-column title="实体编码" data-index="code" width="120" />
              <a-table-column title="实体名称" data-index="name" width="150" />
              <a-table-column title="描述" data-index="description" />
              <a-table-column title="核心关系" width="200">
                <template #cell="{ record }">
                  <a-tag v-for="rel in record.coreRelations" :key="rel" size="small" style="margin-right: 4px">
                    {{ rel }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="操作" width="120" align="center">
                <template #cell="{ record }">
                  <a-button type="text" size="small" @click="viewEntityDetail(record)">详情</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 实体详情抽屉 -->
    <a-drawer v-model:visible="drawerVisible" width="800px" :title="currentEntity?.name + ' - 实体详情'">
      <div v-if="currentEntity">
        <a-descriptions :column="2" title="基础信息">
          <a-descriptions-item label="实体编码">{{ currentEntity.code }}</a-descriptions-item>
          <a-descriptions-item label="所属业务域">{{ getDomainName(currentEntity.domainCode) }}</a-descriptions-item>
          <a-descriptions-item label="描述" :span="2">{{ currentEntity.description }}</a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <div class="section-title">属性定义</div>
        <a-table :data="currentEntity.attributes" size="small" :pagination="false">
          <template #columns>
            <a-table-column title="属性编码" data-index="code" />
            <a-table-column title="属性名称" data-index="name" />
            <a-table-column title="类型">
              <template #cell="{ record }">
                <a-tag :color="record.type === 'general' ? 'blue' : 'orange'">
                  {{ record.type === 'general' ? '通用' : '扩展' }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="数据类型" data-index="dataType" />
            <a-table-column title="扩展配置" data-index="extendedConfig" />
          </template>
        </a-table>

        <a-divider />

        <div class="section-title">关联数据要素</div>
        <a-table :data="relatedElements" size="small" :pagination="false">
          <template #columns>
            <a-table-column title="要素编码" data-index="code" width="100" />
            <a-table-column title="要素名称" data-index="name" width="150" />
            <a-table-column title="类型" width="100">
              <template #cell="{ record }">
                <a-tag :color="getElementTypeColor(record.type)">
                  {{ getElementTypeName(record.type) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="物理映射 (表/字段)" width="250">
              <template #cell="{ record }">
                <div v-if="record.relatedResource">
                  <a-tag size="small" color="arcoblue">{{ record.relatedResource.table }}</a-tag>
                  <span style="margin: 0 4px;">.</span>
                  <a-tag size="small" color="cyan">{{ record.relatedResource.field }}</a-tag>
                </div>
                <span v-else class="text-gray">暂无映射</span>
              </template>
            </a-table-column>
            <a-table-column title="关联数据资产" data-index="relatedAsset" />
          </template>
        </a-table>

        <a-divider />

        <div class="section-title">底层物理表清单 (自动汇总)</div>
        <a-alert v-if="relatedTables.length === 0" type="warning">该实体下的要素暂未映射任何物理表</a-alert>
        <a-list v-else size="small" :bordered="false">
          <a-list-item v-for="table in relatedTables" :key="table.name">
            <a-list-item-meta
              :title="table.name"
              :description="table.description"
            >
              <template #avatar>
                <icon-storage />
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-tag color="green">{{ table.type }}</a-tag>
              <a-tag>{{ table.owner }}</a-tag>
            </template>
          </a-list-item>
        </a-list>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IconStorage } from '@arco-design/web-vue/es/icon';
import { BusinessConceptStore, type BusinessEntity } from '@/mock/shared/business-concept-store';

const domains = BusinessConceptStore.getDomains();
const allEntities = BusinessConceptStore.getEntities();

const selectedDomainKeys = ref(['ALL']);
const drawerVisible = ref(false);
const currentEntity = ref<BusinessEntity | null>(null);
const relatedTables = ref<any[]>([]);
const relatedElements = ref<any[]>([]);

const getElementTypeColor = (type: string) => {
  const map: Record<string, string> = {
    metric: 'purple',
    tag: 'green',
    variable: 'orange',
    caliber: 'blue'
  };
  return map[type] || 'gray';
};

const getElementTypeName = (type: string) => {
  const map: Record<string, string> = {
    metric: '指标',
    tag: '标签',
    variable: '变量',
    caliber: '口径'
  };
  return map[type] || type;
};

const domainTreeData = computed(() => [
  {
    title: '全部业务域',
    key: 'ALL',
    children: domains.map(d => ({
      title: d.name,
      key: d.code
    }))
  }
]);

const currentDomainName = computed(() => {
  if (selectedDomainKeys.value[0] === 'ALL') return '全部';
  return domains.find(d => d.code === selectedDomainKeys.value[0])?.name || '未知';
});

const filteredEntities = computed(() => {
  if (selectedDomainKeys.value[0] === 'ALL') return allEntities;
  return allEntities.filter(e => e.domainCode === selectedDomainKeys.value[0]);
});

const handleDomainSelect = (keys: string[]) => {
  if (keys.length === 0) return;
  selectedDomainKeys.value = keys;
};

const getDomainName = (code: string) => domains.find(d => d.code === code)?.name;

const viewEntityDetail = (entity: BusinessEntity) => {
  currentEntity.value = entity;
  // 获取关联的数据要素
  relatedElements.value = BusinessConceptStore.getEntityRelatedElements(entity.code);
  // 获取关联的物理表
  relatedTables.value = BusinessConceptStore.getEntityRelatedTables(entity.code);
  drawerVisible.value = true;
};
</script>

<style scoped>
.full-height {
  height: calc(100vh - 140px);
  overflow-y: auto;
}
.entity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 12px;
}
</style>
