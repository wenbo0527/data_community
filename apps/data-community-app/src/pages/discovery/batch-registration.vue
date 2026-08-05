<template>
  <div class="batch-registration-page">
    <a-page-header
      title="批量注册"
      sub-title="通过 Excel / CSV 批量注册表和字段"
      :back="false"
    >
      <template #extra>
        <a-space>
          <a-button @click="goBack">
            <template #icon><icon-left /></template>
            返回
          </a-button>
          <a-button>
            <template #icon><icon-download /></template>
            下载模板
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-steps :current="currentStep - 1" class="wizard-steps">
        <a-step title="上传文件" description="支持 Excel / CSV" />
        <a-step title="字段映射" description="匹配系统字段" />
        <a-step title="数据预览" description="确认无误" />
        <a-step title="提交注册" description="完成" />
      </a-steps>

      <a-divider />

      <!-- Step 1: 上传 -->
      <a-card v-show="currentStep === 1" :bordered="false">
        <h3>上传文件</h3>
        <a-row :gutter="16">
          <a-col :span="14">
            <a-upload
              :auto-upload="false"
              :file-list="fileList"
              @change="onFileChange"
              accept=".xlsx,.xls,.csv"
              :limit="1"
            >
              <template #upload-button>
                <a-card class="upload-area" hoverable>
                  <icon-upload :style="uploadIconStyle" />
                  <p class="upload-title">点击或拖拽文件到此处</p>
                  <p class="upload-hint">支持 Excel (.xlsx, .xls) 和 CSV,单文件最大 50MB</p>
                </a-card>
              </template>
            </a-upload>
          </a-col>
          <a-col :span="10">
            <a-alert type="info" :show-icon="true">
              <template #title>使用说明</template>
              <ol style="margin: 0; padding-left: 20px; line-height: 1.8">
                <li>下载模板并按格式填写表/字段信息</li>
                <li>上传文件,系统自动解析</li>
                <li>确认字段映射关系</li>
                <li>预览无误后提交注册</li>
              </ol>
            </a-alert>
          </a-col>
        </a-row>
        <a-divider />
        <div style="text-align: right">
          <a-button type="primary" size="large" :disabled="fileList.length === 0" @click="nextStep">
            下一步:字段映射
            <template #icon><icon-right /></template>
          </a-button>
        </div>
      </a-card>

      <!-- Step 2: 字段映射 -->
      <a-card v-show="currentStep === 2" :bordered="false">
        <h3>字段映射</h3>
        <a-alert type="info" :show-icon="true" style="margin-bottom: 16px">
          系统已根据列名自动匹配字段映射,请确认或手动调整
        </a-alert>
        <a-table :data="fieldMapping" :pagination="false" row-key="key" size="medium">
          <template #columns>
            <a-table-column title="Excel 列名" data-index="excelColumn" :width="200" />
            <a-table-column title="示例数据" data-index="sample" :width="200" />
            <a-table-column title="系统字段" :width="200">
              <template #cell="{ record }">
                <a-select v-model="record.systemField" size="small" style="width: 180px">
                  <a-option v-for="f in systemFields" :key="f" :value="f">{{ f }}</a-option>
                </a-select>
              </template>
            </a-table-column>
            <a-table-column title="必填" :width="80">
              <template #cell="{ record }">
                <a-tag v-if="record.required" color="red" size="small">必填</a-tag>
                <a-tag v-else size="small">可选</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag v-if="record.systemField" color="green" size="small">已映射</a-tag>
                <a-tag v-else color="orange" size="small">待确认</a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <a-divider />
        <div style="text-align: right">
          <a-space>
            <a-button @click="prevStep">上一步</a-button>
            <a-button type="primary" size="large" @click="nextStep">下一步:数据预览</a-button>
          </a-space>
        </div>
      </a-card>

      <!-- Step 3: 预览 -->
      <a-card v-show="currentStep === 3" :bordered="false">
        <h3>数据预览</h3>
        <a-alert type="warning" :show-icon="true" style="margin-bottom: 16px">
          即将注册 <b>{{ previewData.length }}</b> 条数据,请确认无误后提交
        </a-alert>
        <a-table :data="previewData" :pagination="{ pageSize: 10 }" row-key="id" size="medium">
          <template #columns>
            <a-table-column title="表名" data-index="name" />
            <a-table-column title="数据库" data-index="database" :width="130" />
            <a-table-column title="字段数" data-index="fieldCount" :width="100" />
            <a-table-column title="Owner" data-index="owner" :width="100" />
            <a-table-column title="状态" :width="100">
              <template #cell>
                <a-tag color="green">待注册</a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
        <a-divider />
        <div style="text-align: right">
          <a-space>
            <a-button @click="prevStep">上一步</a-button>
            <a-button type="primary" size="large" @click="nextStep" :loading="submitting">
              下一步:提交注册
            </a-button>
          </a-space>
        </div>
      </a-card>

      <!-- Step 4: 完成 -->
      <a-card v-show="currentStep === 4" :bordered="false">
        <a-result status="success" title="批量注册完成">
          <template #icon>
            <icon-check-circle-fill :style="successIconStyle" />
          </template>
          <template #sub-title>共注册 {{ previewData.length }} 张表,{{ previewData.length * 12 }} 个字段</template>
          <template #extra>
            <a-space>
              <a-button @click="resetWizard">继续注册</a-button>
              <a-button type="primary" @click="goBack">返回数据发现</a-button>
            </a-space>
          </template>
        </a-result>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

const router = useRouter()

const currentStep = ref(1)
const submitting = ref(false)
const fileList = ref<any[]>([])

const uploadIconStyle = { fontSize: '48px', color: '#165dff' }
const successIconStyle = { color: '#00b42a' }

const systemFields = [
  'table_name', 'database', 'table_desc', 'owner',
  'field_name', 'field_type', 'field_desc', 'is_pk', 'is_nullable'
]

const fieldMapping = ref([
  { key: '1', excelColumn: '表名', sample: 'dim_user', systemField: 'table_name', required: true },
  { key: '2', excelColumn: '数据库', sample: 'user_center', systemField: 'database', required: true },
  { key: '3', excelColumn: '表描述', sample: '用户维表', systemField: 'table_desc', required: false },
  { key: '4', excelColumn: 'Owner', sample: '王运营', systemField: 'owner', required: true },
  { key: '5', excelColumn: '字段名', sample: 'user_id', systemField: 'field_name', required: true },
  { key: '6', excelColumn: '字段类型', sample: 'BIGINT', systemField: 'field_type', required: true },
  { key: '7', excelColumn: '字段描述', sample: '用户 ID', systemField: 'field_desc', required: false },
  { key: '8', excelColumn: '是否主键', sample: '是', systemField: 'is_pk', required: false },
  { key: '9', excelColumn: '是否可空', sample: '否', systemField: 'is_nullable', required: false }
])

const previewData = ref([
  { id: '1', name: 'dim_user', database: 'user_center', fieldCount: 15, owner: '王运营' },
  { id: '2', name: 'fact_loan_apply', database: 'core_trade', fieldCount: 22, owner: '李开发' },
  { id: '3', name: 'dws_risk_score', database: 'risk_decision', fieldCount: 12, owner: '张风控' },
  { id: '4', name: 'dim_product', database: 'product_center', fieldCount: 18, owner: '李产品' },
  { id: '5', name: 'dws_user_active_day', database: 'olap', fieldCount: 8, owner: '王运营' }
])

function onFileChange(_files: any[]) {
  if (fileList.value.length === 0 && _files.length > 0) {
    fileList.value = _files
  }
}

function nextStep() {
  if (currentStep.value === 3) {
    submitting.value = true
    setTimeout(() => {
      currentStep.value = 4
      submitting.value = false
      Message.success('注册成功')
    }, 1500)
  } else {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function resetWizard() {
  currentStep.value = 1
  fileList.value = []
}

const goBack = () => router.push('discovery')
</script>

<style lang="scss" scoped>
.batch-registration-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 0 24px 24px;
}

.wizard-steps {
  margin: 0 80px 24px;
}

.upload-area {
  text-align: center;
  padding: 40px 20px;
  border: 2px dashed #e5e6eb;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #165dff;
    background: #f0f7ff;
  }

  .upload-title {
    margin: 16px 0 8px;
    font-size: 16px;
    font-weight: 500;
  }
  .upload-hint {
    color: #86909c;
    font-size: 13px;
  }
}
</style>