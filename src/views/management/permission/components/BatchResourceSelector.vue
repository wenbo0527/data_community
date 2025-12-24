<template>
  <div class="batch-resource-selector">
    <!-- 添加方式选择 -->
    <div class="add-method-section">
      <a-radio-group v-model:value="addMethod" button-style="solid">
        <a-radio-button value="file">文件导入</a-radio-button>
        <a-radio-button value="manual">手动添加</a-radio-button>
        <a-radio-button value="recommend">系统推荐</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 文件导入 -->
    <div v-if="addMethod === 'file'" class="file-import-section">
      <a-upload-dragger
        v-model:fileList="fileList"
        :multiple="false"
        :accept="'.xlsx,.xls,.csv'"
        :before-upload="beforeUpload"
        @change="handleFileChange"
        class="upload-area"
      >
        <p class="ant-upload-drag-icon">
          <inbox-outlined />
        </p>
        <p class="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p class="ant-upload-hint">
          支持 Excel (.xlsx, .xls) 和 CSV 格式，文件大小不超过 10MB
        </p>
      </a-upload-dragger>

      <div class="template-section">
        <a-space>
          <a-button @click="downloadTemplate">
            <template #icon><download-outlined /></template>
            下载模板
          </a-button>
          <a-button @click="showTemplateHelp = true">
            <template #icon><question-circle-outlined /></template>
            查看说明
          </a-button>
        </a-space>
      </div>

      <!-- 文件解析结果 -->
      <div v-if="parsedData.length > 0" class="parse-result">
        <a-alert
          :message="`成功解析 ${parsedData.length} 条资源记录`"
          type="success"
          show-icon
          closable
          @close="clearParsedData"
        />
      </div>
    </div>

    <!-- 手动添加 -->
    <div v-if="addMethod === 'manual'" class="manual-add-section">
      <div class="search-add-area">
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索资源名称、类型或标签"
          style="width: 400px"
          @search="handleSearch"
          allow-clear
        />
        <a-button type="primary" @click="showResourceModal = true">
          浏览资源库
        </a-button>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <span>搜索结果（{{ searchResults.length }}）</span>
          <a-button size="small" @click="addAllSearchResults">
            全部添加
          </a-button>
        </div>
        <div class="results-list">
          <div
            v-for="resource in searchResults"
            :key="resource.id"
            class="result-item"
          >
            <div class="result-info">
              <h4>{{ resource.name }}</h4>
              <div class="result-meta">
                <sensitivity-label :level="resource.sensitivityLevel" />
                <a-tag size="small">{{ getResourceTypeText(resource.type) }}</a-tag>
                <span class="database">{{ resource.databaseType }}</span>
              </div>
            </div>
            <a-button
              size="small"
              @click="addResource(resource)"
              :disabled="isAlreadyAdded(resource)"
            >
              {{ isAlreadyAdded(resource) ? '已添加' : '添加' }}
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统推荐 -->
    <div v-if="addMethod === 'recommend'" class="recommend-section">
      <div class="recommend-tabs">
        <a-tabs v-model:activeKey="recommendTab">
          <a-tab-pane key="history" tab="历史申请">
            <div class="recommend-description">
              基于您过往的权限申请记录，推荐可能需要的资源
            </div>
            <div class="recommend-list">
              <div
                v-for="resource in historyRecommendations"
                :key="resource.id"
                class="recommend-item"
              >
                <div class="recommend-info">
                  <h4>{{ resource.name }}</h4>
                  <p class="recommend-reason">{{ resource.recommendReason }}</p>
                  <div class="recommend-meta">
                    <sensitivity-label :level="resource.sensitivityLevel" />
                    <a-tag size="small">{{ getResourceTypeText(resource.type) }}</a-tag>
                  </div>
                </div>
                <a-space>
                  <a-button size="small" @click="addResource(resource)">
                    添加
                  </a-button>
                  <a-button size="small" @click="viewResourceDetail(resource)">
                    详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="similar" tab="相似用户">
            <div class="recommend-description">
              与您的职责相似的用户正在申请这些资源
            </div>
            <div class="recommend-list">
              <div
                v-for="resource in similarUserRecommendations"
                :key="resource.id"
                class="recommend-item"
              >
                <div class="recommend-info">
                  <h4>{{ resource.name }}</h4>
                  <p class="recommend-reason">{{ resource.recommendReason }}</p>
                  <div class="recommend-meta">
                    <sensitivity-label :level="resource.sensitivityLevel" />
                    <a-tag size="small">{{ getResourceTypeText(resource.type) }}</a-tag>
                  </div>
                </div>
                <a-space>
                  <a-button size="small" @click="addResource(resource)">
                    添加
                  </a-button>
                  <a-button size="small" @click="viewResourceDetail(resource)">
                    详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="department" tab="部门常用">
            <div class="recommend-description">
              您所在部门的其他成员经常申请这些资源
            </div>
            <div class="recommend-list">
              <div
                v-for="resource in departmentRecommendations"
                :key="resource.id"
                class="recommend-item"
              >
                <div class="recommend-info">
                  <h4>{{ resource.name }}</h4>
                  <p class="recommend-reason">{{ resource.recommendReason }}</p>
                  <div class="recommend-meta">
                    <sensitivity-label :level="resource.sensitivityLevel" />
                    <a-tag size="small">{{ getResourceTypeText(resource.type) }}</a-tag>
                  </div>
                </div>
                <a-space>
                  <a-button size="small" @click="addResource(resource)">
                    添加
                  </a-button>
                  <a-button size="small" @click="viewResourceDetail(resource)">
                    详情
                  </a-button>
                </a-space>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <!-- 资源选择弹窗 -->
    <a-modal
      v-model:visible="showResourceModal"
      title="选择资源"
      width="80%"
      :footer="null"
    >
      <resource-selector
        v-model="modalSelectedResources"
        :resources="availableResources"
        :loading="modalLoading"
        :total-count="modalTotalCount"
        @search="handleModalSearch"
        @page-change="handleModalPageChange"
      />
      <div class="modal-actions">
        <a-space>
          <a-button type="primary" @click="confirmModalSelection">
            确认选择 ({{ modalSelectedResources.length }})
          </a-button>
          <a-button @click="showResourceModal = false">
            取消
          </a-button>
        </a-space>
      </div>
    </a-modal>

    <!-- 模板说明弹窗 -->
    <a-modal
      v-model:visible="showTemplateHelp"
      title="文件模板说明"
      :footer="null"
    >
      <div class="template-help-content">
        <h4>Excel/CSV 文件格式要求：</h4>
        <ul>
          <li>第一行为表头，包含以下列：</li>
          <li>资源名称（必填）</li>
          <li>资源类型（必填：table, metric, variable, external_data, collection, service）</li>
          <li>数据库类型（可选）</li>
          <li>业务模块（可选）</li>
          <li>敏感等级（可选：normal, sensitive, core）</li>
          <li>业务术语（可选，多个用逗号分隔）</li>
          <li>描述（可选）</li>
        </ul>
        <a-divider />
        <h4>示例数据：</h4>
        <pre>
资源名称,资源类型,数据库类型,业务模块,敏感等级,业务术语,描述
用户行为数据表,table,MySQL,用户分析,normal,"用户行为,数据分析",记录用户行为数据
订单统计指标,metric,ClickHouse,电商业务,sensitive,"订单,统计",订单统计指标
        </pre>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  InboxOutlined,
  DownloadOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue';
import SensitivityLabel from './SensitivityLabel.vue';
import ResourceSelector from './ResourceSelector.vue';

export default {
  name: 'BatchResourceSelector',
  components: {
    SensitivityLabel,
    ResourceSelector,
    InboxOutlined,
    DownloadOutlined,
    QuestionCircleOutlined
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    availableResources: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'file-import', 'resource-add'],
  setup(props, { emit }) {
    const addMethod = ref('file');
    const fileList = ref([]);
    const parsedData = ref([]);
    const searchText = ref('');
    const searchResults = ref([]);
    const recommendTab = ref('history');
    const showResourceModal = ref(false);
    const showTemplateHelp = ref(false);
    const modalSelectedResources = ref([]);
    const modalLoading = ref(false);
    const modalTotalCount = ref(0);

    const selectedResources = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    // 模拟推荐数据
    const historyRecommendations = ref([
      {
        id: 'rec1',
        name: '用户行为分析表',
        type: 'table',
        sensitivityLevel: 'normal',
        recommendReason: '您之前申请过类似的用户数据资源'
      },
      {
        id: 'rec2',
        name: '业务指标看板',
        type: 'metric',
        sensitivityLevel: 'sensitive',
        recommendReason: '基于您的业务分析需求推荐'
      }
    ]);

    const similarUserRecommendations = ref([
      {
        id: 'sim1',
        name: '客户画像数据',
        type: 'table',
        sensitivityLevel: 'core',
        recommendReason: '与您同岗位的其他用户正在申请'
      },
      {
        id: 'sim2',
        name: '营销效果指标',
        type: 'metric',
        sensitivityLevel: 'sensitive',
        recommendReason: '相似职责用户的热门申请'
      }
    ]);

    const departmentRecommendations = ref([
      {
        id: 'dept1',
        name: '部门业绩报表',
        type: 'metric',
        sensitivityLevel: 'sensitive',
        recommendReason: '您所在部门的常用资源'
      },
      {
        id: 'dept2',
        name: '团队管理数据',
        type: 'table',
        sensitivityLevel: 'normal',
        recommendReason: '部门内部协作常用'
      }
    ]);

    const beforeUpload = (file) => {
      const isExcelOrCsv = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                          file.type === 'application/vnd.ms-excel' ||
                          file.name.endsWith('.csv');
      
      if (!isExcelOrCsv) {
        message.error('只能上传 Excel 或 CSV 文件!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB!');
        return false;
      }
      
      return false; // 手动处理上传
    };

    const handleFileChange = (info) => {
      const file = info.file;
      if (file) {
        parseFile(file);
      }
    };

    const parseFile = (file) => {
      // 模拟文件解析
      modalLoading.value = true;
      setTimeout(() => {
        // 模拟解析结果
        parsedData.value = [
          {
            id: 'file1',
            name: '导入资源1',
            type: 'table',
            databaseType: 'MySQL',
            businessModule: '业务模块1',
            sensitivityLevel: 'normal',
            businessTerms: ['术语1', '术语2'],
            description: '从文件导入的资源1'
          },
          {
            id: 'file2',
            name: '导入资源2',
            type: 'metric',
            databaseType: 'ClickHouse',
            businessModule: '业务模块2',
            sensitivityLevel: 'sensitive',
            businessTerms: ['术语3'],
            description: '从文件导入的资源2'
          }
        ];
        
        modalLoading.value = false;
        message.success(`成功解析 ${parsedData.value.length} 条资源记录`);
        emit('file-import', parsedData.value);
        
        // 添加到已选择资源
        parsedData.value.forEach(resource => {
          if (!isAlreadyAdded(resource)) {
            addResource(resource);
          }
        });
      }, 1000);
    };

    const clearParsedData = () => {
      parsedData.value = [];
      fileList.value = [];
    };

    const downloadTemplate = () => {
      // 模拟下载模板
      message.success('模板下载已开始');
    };

    const handleSearch = () => {
      if (!searchText.value) {
        searchResults.value = [];
        return;
      }
      
      // 模拟搜索
      const results = props.availableResources.filter(resource =>
        resource.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchText.value.toLowerCase()) ||
        (resource.businessTerms && resource.businessTerms.some(term => 
          term.toLowerCase().includes(searchText.value.toLowerCase())
        ))
      );
      
      searchResults.value = results.slice(0, 10); // 最多显示10个结果
    };

    const addAllSearchResults = () => {
      searchResults.value.forEach(resource => {
        if (!isAlreadyAdded(resource)) {
          addResource(resource);
        }
      });
      message.success(`已添加 ${searchResults.value.length} 个资源`);
    };

    const addResource = (resource) => {
      if (!isAlreadyAdded(resource)) {
        selectedResources.value = [...selectedResources.value, resource];
        emit('resource-add', resource);
        message.success(`已添加资源：${resource.name}`);
      } else {
        message.warning(`资源 "${resource.name}" 已添加`);
      }
    };

    const isAlreadyAdded = (resource) => {
      return selectedResources.value.some(item => item.id === resource.id);
    };

    const viewResourceDetail = (resource) => {
      message.info(`查看资源详情：${resource.name}`);
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

    const handleModalSearch = (params) => {
      // 模拟模态框搜索
      modalLoading.value = true;
      setTimeout(() => {
        modalTotalCount.value = props.availableResources.length;
        modalLoading.value = false;
      }, 500);
    };

    const handleModalPageChange = (params) => {
      handleModalSearch(params);
    };

    const confirmModalSelection = () => {
      modalSelectedResources.value.forEach(resource => {
        if (!isAlreadyAdded(resource)) {
          addResource(resource);
        }
      });
      showResourceModal.value = false;
      message.success(`已添加 ${modalSelectedResources.value.length} 个资源`);
    };

    // 监听搜索文本变化
    watch(searchText, (newVal) => {
      if (newVal) {
        handleSearch();
      } else {
        searchResults.value = [];
      }
    });

    return {
      addMethod,
      fileList,
      parsedData,
      searchText,
      searchResults,
      recommendTab,
      showResourceModal,
      showTemplateHelp,
      modalSelectedResources,
      modalLoading,
      modalTotalCount,
      historyRecommendations,
      similarUserRecommendations,
      departmentRecommendations,
      beforeUpload,
      handleFileChange,
      clearParsedData,
      downloadTemplate,
      handleSearch,
      addAllSearchResults,
      addResource,
      isAlreadyAdded,
      viewResourceDetail,
      getResourceTypeText,
      handleModalSearch,
      handleModalPageChange,
      confirmModalSelection
    };
  }
};
</script>

<style lang="less" scoped>
.batch-resource-selector {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.add-method-section {
  margin-bottom: 24px;
  text-align: center;
}

.file-import-section {
  .upload-area {
    margin-bottom: 16px;
  }
  
  .template-section {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .parse-result {
    margin-top: 16px;
  }
}

.manual-add-section {
  .search-add-area {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    align-items: center;
  }
  
  .search-results {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .results-list {
      .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #f0f0f0;
        border-radius: 6px;
        margin-bottom: 8px;
        
        .result-info {
          flex: 1;
          
          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
          }
          
          .result-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .database {
              color: #8c8c8c;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

.recommend-section {
  .recommend-description {
    color: #595959;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 6px;
  }
  
  .recommend-list {
    .recommend-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      margin-bottom: 12px;
      
      .recommend-info {
        flex: 1;
        
        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }
        
        .recommend-reason {
          color: #595959;
          font-size: 12px;
          margin: 0 0 8px 0;
        }
        
        .recommend-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.template-help-content {
  padding: 16px;
  
  h4 {
    margin-bottom: 12px;
  }
  
  ul {
    margin-bottom: 16px;
    
    li {
      margin-bottom: 4px;
    }
  }
  
  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
  }
}
</style>