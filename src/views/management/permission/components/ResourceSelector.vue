<template>
  <div class="resource-selector">
    <!-- 搜索区域 -->
    <div class="search-section">
      <a-input-search
        v-model:value="searchText"
        placeholder="请输入资源名称、类型或标签"
        style="width: 300px"
        @search="handleSearch"
        allow-clear
      />
      <a-select
        v-model:value="selectedType"
        placeholder="选择资源类型"
        style="width: 150px; margin-left: 16px"
        allow-clear
      >
        <a-select-option value="table">数据表</a-select-option>
        <a-select-option value="metric">指标</a-select-option>
        <a-select-option value="variable">变量</a-select-option>
        <a-select-option value="external_data">外部数据</a-select-option>
        <a-select-option value="collection">集合</a-select-option>
        <a-select-option value="service">服务</a-select-option>
      </a-select>
      <a-select
        v-model:value="selectedSensitivity"
        placeholder="选择敏感等级"
        style="width: 150px; margin-left: 16px"
        allow-clear
      >
        <a-select-option value="normal">普通</a-select-option>
        <a-select-option value="sensitive">敏感</a-select-option>
        <a-select-option value="core">核心</a-select-option>
      </a-select>
      <a-button type="primary" @click="handleSearch" style="margin-left: 16px">
        搜索
      </a-button>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list">
      <a-spin :spinning="loading">
        <a-empty v-if="filteredResources.length === 0 && !loading" />
        <div v-else class="resource-grid">
          <div
            v-for="resource in filteredResources"
            :key="resource.id"
            class="resource-card"
            :class="{ selected: isSelected(resource) }"
            @click="toggleSelection(resource)"
          >
            <div class="resource-header">
              <div class="resource-title">
                <h4>{{ resource.name }}</h4>
                <SensitivityLabel :level="resource.sensitivityLevel" />
              </div>
              <a-checkbox
                :checked="isSelected(resource)"
                @click.stop="toggleSelection(resource)"
              />
            </div>
            <div class="resource-info">
              <div class="info-item">
                <span class="label">类型：</span>
                <span class="value">{{ getResourceTypeText(resource.type) }}</span>
              </div>
              <div class="info-item">
                <span class="label">数据库：</span>
                <span class="value">{{ resource.databaseType || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">业务模块：</span>
                <span class="value">{{ resource.businessModule || '-' }}</span>
              </div>
              <div class="info-item" v-if="resource.businessTerms && resource.businessTerms.length > 0">
                <span class="label">业务术语：</span>
                <span class="value">
                  <a-tag
                    v-for="term in resource.businessTerms.slice(0, 2)"
                    :key="term"
                    size="small"
                  >
                    {{ term }}
                  </a-tag>
                  <span v-if="resource.businessTerms.length > 2">+{{ resource.businessTerms.length - 2 }}</span>
                </span>
              </div>
            </div>
            <div class="resource-description" v-if="resource.description">
              {{ resource.description }}
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="totalCount > pageSize">
      <a-pagination
        v-model:current="currentPage"
        :total="totalCount"
        :page-size="pageSize"
        show-size-changer
        :page-size-options="['12', '24', '48']"
        @change="handlePageChange"
        @showSizeChange="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import SensitivityLabel from './SensitivityLabel.vue';

export default {
  name: 'ResourceSelector',
  components: {
    SensitivityLabel
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: true
    },
    resources: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    totalCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'search', 'page-change', 'page-size-change'],
  setup(props, { emit }) {
    const searchText = ref('');
    const selectedType = ref(undefined);
    const selectedSensitivity = ref(undefined);
    const currentPage = ref(1);
    const pageSize = ref(12);

    const selectedResources = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    const filteredResources = computed(() => {
      let filtered = [...props.resources];
      
      if (searchText.value) {
        const searchLower = searchText.value.toLowerCase();
        filtered = filtered.filter(resource =>
          resource.name.toLowerCase().includes(searchLower) ||
          resource.type.toLowerCase().includes(searchLower) ||
          (resource.businessTerms && resource.businessTerms.some(term => 
            term.toLowerCase().includes(searchLower)
          ))
        );
      }
      
      if (selectedType.value) {
        filtered = filtered.filter(resource => resource.type === selectedType.value);
      }
      
      if (selectedSensitivity.value) {
        filtered = filtered.filter(resource => resource.sensitivityLevel === selectedSensitivity.value);
      }
      
      return filtered;
    });

    const isSelected = (resource) => {
      return selectedResources.value.some(item => item.id === resource.id);
    };

    const toggleSelection = (resource) => {
      if (props.multiple) {
        const index = selectedResources.value.findIndex(item => item.id === resource.id);
        if (index > -1) {
          selectedResources.value = selectedResources.value.filter(item => item.id !== resource.id);
        } else {
          selectedResources.value = [...selectedResources.value, resource];
        }
      } else {
        selectedResources.value = [resource];
      }
    };

    const getResourceTypeText = (type) => {
      const typeMap = {
        table: '数据表',
        metric: '指标',
        variable: '变量',
        external_data: '外部数据',
        collection: '集合',
        service: '服务'
      };
      return typeMap[type] || type;
    };

    const handleSearch = () => {
      emit('search', {
        searchText: searchText.value,
        type: selectedType.value,
        sensitivity: selectedSensitivity.value,
        page: currentPage.value,
        pageSize: pageSize.value
      });
    };

    const handlePageChange = (page, pageSize) => {
      currentPage.value = page;
      emit('page-change', { page, pageSize });
    };

    const handlePageSizeChange = (current, size) => {
      pageSize.value = size;
      currentPage.value = 1;
      emit('page-size-change', { current, size });
    };

    return {
      searchText,
      selectedType,
      selectedSensitivity,
      currentPage,
      pageSize,
      selectedResources,
      filteredResources,
      isSelected,
      toggleSelection,
      getResourceTypeText,
      handleSearch,
      handlePageChange,
      handlePageSizeChange
    };
  }
};
</script>

<style lang="less" scoped>
.resource-selector {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.resource-list {
  min-height: 400px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.resource-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.selected {
    border-color: #1890ff;
    background-color: #f0f9ff;
  }
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.resource-title {
  display: flex;
  align-items: center;
  gap: 8px;
  
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.resource-info {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  margin-bottom: 4px;
  
  .label {
    color: #8c8c8c;
    width: 80px;
    flex-shrink: 0;
  }
  
  .value {
    color: #262626;
    flex: 1;
  }
}

.resource-description {
  color: #595959;
  font-size: 12px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>