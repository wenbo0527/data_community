<template>
  <div class="create-external-data-evaluation-page">
    <a-page-header
      title="新建分析报告"
      @back="handleBack"
      style="background: var(--color-bg-2); border-radius: 4px; margin-bottom: 16px;"
    />
    
    <div class="content-wrapper">
      <!-- 步骤条 -->
      <a-steps :current="currentStep" style="margin-bottom: 30px">
        <a-step>选择模板和上传样本数据</a-step>
        <a-step>字段映射</a-step>
        <a-step>配置分析详情</a-step>
        <a-step>提交任务</a-step>
      </a-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 第一步：选择模板和上传样本数据 -->
        <div v-show="currentStep === 0">
          <a-card :bordered="false">
            <a-form :model="form" :rules="rules" ref="formRef">
              <a-form-item field="templateType" label="展示配置模板">
                <a-select
                  v-model="form.templateType"
                  :style="{ width: '320px' }"
                  placeholder="请选择模板类型"
                  disabled
                >
                  <a-option value="风险外数效果评估模板">风险外数效果评估模板</a-option>
                </a-select>
                <div class="template-note">当前仅支持风险外数效果评估模板</div>
              </a-form-item>

              <a-form-item field="sampleFile" label="样本文件">
                <a-upload
                  :custom-request="customUpload"
                  :limit="1"
                  :auto-upload="false"
                  v-model:file-list="fileList"
                  :accept="'.csv,.xlsx,.xls'"
                  @change="handleFileChange"
                  @before-upload="beforeUpload"
                >
                  <template #upload-button>
                    <div
                      style="
                        background-color: var(--color-fill-2);
                        border: 1px dashed var(--color-fill-4);
                        border-radius: 4px;
                        padding: 20px;
                        text-align: center;
                        cursor: pointer;
                      "
                    >
                      <div>
                        <icon-upload />
                        <div style="margin-top: 10px">点击上传样本文件</div>
                      </div>
                    </div>
                  </template>
                </a-upload>
                <div class="file-note">支持.csv/.xlsx/.xls格式，最大100MB</div>
                <div class="file-note" style="color: #165DFF; margin-top: 8px;">Demo模式：您可以跳过文件上传，直接点击下一步</div>
              </a-form-item>
            </a-form>
          </a-card>
        </div>

        <!-- 第二步：字段映射 -->
        <div v-show="currentStep === 1">
          <a-alert
            type="info"
            message="字段映射说明"
            description="请为上传的样本文件定义字段类型。样本日期字段用于确定分析时间跨度，平台产品字段用于识别数据来源，变量字段用于后续的分析计算。在Demo模式下，您可以跳过文件上传直接进入此步骤。"
            show-icon
            style="margin-bottom: 16px"
          />
          
          <div class="field-mapping-container">
            <!-- 文件信息 -->
            <div class="file-info">
              <h4>文件信息</h4>
              <p><strong>检测到字段数:</strong> {{ detectedFields.length }}</p>
            </div>

            <!-- 字段映射配置 -->
            <div class="field-mapping-section">
              <h4>字段映射配置</h4>
              
              <!-- 必填字段配置 -->
              <div class="required-fields">
                <h5>必填字段配置</h5>
                
                <a-row :gutter="16" style="margin-bottom: 16px">
                  <a-col :span="12">
                    <a-form-item label="样本日期字段" required>
                      <a-select
                        v-model="fieldMapping.dateField"
                        placeholder="请选择样本日期字段"
                        :allow-clear="true"
                      >
                        <a-option v-for="field in detectedFields" :key="field" :value="field">
                          {{ field }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  
                  <a-col :span="12">
                    <a-form-item label="平台产品字段" required>
                      <a-select
                        v-model="fieldMapping.platformField"
                        placeholder="请选择平台产品字段"
                        :allow-clear="true"
                      >
                        <a-option v-for="field in detectedFields" :key="field" :value="field">
                          {{ field }}
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>

              <!-- 变量字段配置 -->
              <div class="variable-fields">
                <h5>变量字段配置</h5>
                <div class="field-selection">
                  <a-select
                    v-model="fieldMapping.variableFields"
                    placeholder="请选择变量字段"
                    multiple
                    :max-tag-count="3"
                  >
                    <a-option 
                      v-for="field in availableVariableFields" 
                      :key="field" 
                      :value="field"
                    >
                      {{ field }}
                    </a-option>
                  </a-select>
                </div>
              </div>

              <!-- 字段预览 -->
              <div class="field-preview">
                <h5>字段预览 (currentStep: {{ currentStep }}, detectedFields.length: {{ detectedFields.length }})</h5>
                <a-table
                  :data="previewData"
                  :columns="tableColumns"
                  :pagination="false"
                  :scroll="{ x: '100%', y: 200 }"
                  size="small"
                  table-layout="auto"
                />
              </div>

              <!-- 映射结果预览 -->
              <div class="mapping-result" v-if="hasValidMapping">
                <h5>映射结果预览</h5>
                <a-descriptions :column="2" size="small" bordered>
                  <a-descriptions-item label="样本日期字段">
                    <a-tag color="blue">{{ fieldMapping.dateField || '未设置' }}</a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="平台产品字段">
                    <a-tag color="green">{{ fieldMapping.platformField || '未设置' }}</a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="变量字段数量">
                    <a-tag color="orange">{{ fieldMapping.variableFields.length }} 个</a-tag>
                  </a-descriptions-item>
                  <a-descriptions-item label="变量字段列表">
                    <div class="variable-fields-list">
                      <a-tag 
                        v-for="field in fieldMapping.variableFields" 
                        :key="field" 
                        size="small"
                        style="margin: 2px"
                      >
                        {{ field }}
                      </a-tag>
                    </div>
                  </a-descriptions-item>
                </a-descriptions>
              </div>
            </div>
          </div>
        </div>

        <!-- 第三步：配置分析详情 -->
        <div v-show="currentStep === 2">
          <a-card :bordered="false">
            <a-form :model="form" :rules="rules" ref="formRef">


              <a-form-item field="analysisPeriod" label="分析时间跨度">
                <a-range-picker
                  v-model="form.analysisPeriod"
                  :style="{ width: '320px' }"
                  format="YYYYMMDD"
                  value-format="YYYYMMDD"
                />
              </a-form-item>

              <a-form-item field="reportName" label="报告名称">
                <a-input
                  v-model="form.reportName"
                  :style="{ width: '320px' }"
                  placeholder="请输入报告名称"
                />
                <div class="report-name-note">请输入自定义报告名称</div>
              </a-form-item>

              <a-form-item field="description" label="分析说明">
                <a-textarea
                  v-model="form.description"
                  :style="{ width: '320px' }"
                  placeholder="请输入分析说明（可选）"
                  :max-length="500"
                  allow-clear
                  show-word-limit
                />
              </a-form-item>
            </a-form>
          </a-card>
        </div>

        <!-- 第四步：提交任务 -->
        <div v-show="currentStep === 3">
          <a-card :bordered="false">
            <a-descriptions :column="1" bordered>
              <a-descriptions-item label="模板类型">{{ form.templateType }}</a-descriptions-item>
              <a-descriptions-item label="样本文件">{{ currentFileInfo.name }}</a-descriptions-item>
              <a-descriptions-item label="分析时间跨度">{{ form.analysisPeriod[0] }} 至 {{ form.analysisPeriod[1] }}</a-descriptions-item>
              <a-descriptions-item label="报告名称">{{ form.reportName }}</a-descriptions-item>
              <a-descriptions-item label="分析说明">{{ form.description || '无' }}</a-descriptions-item>
              <a-descriptions-item label="字段映射">
                <div v-if="fieldMapping">
                  <p>样本日期字段: {{ fieldMapping.dateField }}</p>
                  <p>平台产品字段: {{ fieldMapping.platformField }}</p>
                  <p>变量字段: {{ fieldMapping.variableFields.join(', ') }}</p>
                </div>
                <div v-else>未配置</div>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>
      </div>
    </div>
    
    <div class="step-navigation">
      <a-button v-if="currentStep > 0" @click="prevStep" style="margin-right: 10px">上一步</a-button>
      <a-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</a-button>
      <a-button v-if="currentStep === 3" type="primary" @click="handleSubmit">提交任务</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { goBack } from '@/router/utils';
import {
  PageHeader as APageHeader,
  Card as ACard,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Textarea as ATextarea,
  Select as ASelect,
  Option as AOption,
  RangePicker as ARangePicker,
  Button as AButton,
  Upload as AUpload,
  Message as AMessage,
  Steps as ASteps,
  Step as AStep,
  Alert as AAlert,
  Descriptions as ADescriptions,
  DescriptionsItem as ADescriptionsItem,
  Row as ARow,
  Col as ACol,
  CheckboxGroup as ACheckboxGroup,
  Checkbox as ACheckbox,
  Table as ATable,
  TableColumn as ATableColumn,
  Tag as ATag
} from '@arco-design/web-vue';
import { IconUpload } from '@arco-design/web-vue/es/icon';
import type { FileItem } from '@arco-design/web-vue/es/upload/interfaces';

const router = useRouter();
const formRef = ref();

// 返回上一页
const handleBack = () => {
  goBack(router, '/exploration/external-data-evaluation/list');
};

// 当前步骤
const currentStep = ref(0);

// 下一步
const nextStep = async () => {
  // 在第一步和第二步之间进行表单验证
  if (currentStep.value === 0) {
    // 在Demo模式下，允许跳过文件上传验证
    if (fileList.value.length === 0) {
      // 如果没有上传文件，显示提示信息并直接进入下一步
      AMessage.info('当前处于Demo模式，将使用默认数据进行演示');
      // 设置默认的字段数据用于演示
      setupDemoData();
      // 显式更新currentStep为1，确保字段预览区域能够显示
      console.log('设置演示数据完成，更新currentStep为1');
      currentStep.value = 1;
      console.log('currentStep更新为:', currentStep.value);
    } else {
      // 验证模板类型和样本文件
      const res = await formRef.value?.validate(['templateType', 'sampleFile']);
      if (!res) {
        currentStep.value++;
      }
    }
  } else if (currentStep.value === 1) {
    // 确保字段映射已完成
    if (isValidMapping.value) {
      currentStep.value++;
    } else {
      AMessage.warning('请先完成字段映射配置');
    }
  } else if (currentStep.value < 3) {
    currentStep.value++;
  }
};

// 设置默认的字段数据用于演示
const setupDemoData = () => {
  console.log('开始设置演示数据');
  // 设置演示用的字段数据
  detectedFields.value = ['date', 'product', 'value', 'count', 'rate'];
  console.log('设置的字段数据:', detectedFields.value);
  
  // 设置演示用的样本数据
  sampleData.value = [
    { date: '2023-01-01', product: 'Product A', value: 100, count: 10, rate: '0.1' },
    { date: '2023-01-02', product: 'Product B', value: 200, count: 20, rate: '0.15' },
    { date: '2023-01-03', product: 'Product C', value: 150, count: 15, rate: '0.12' },
    { date: '2023-01-04', product: 'Product A', value: 300, count: 30, rate: '0.2' },
    { date: '2023-01-05', product: 'Product B', value: 250, count: 25, rate: '0.18' }
  ];
  console.log('设置的样本数据:', sampleData.value);
  
  // 设置演示用的文件信息
  currentFileInfo.value = {
    name: 'demo_data.csv',
    size: 1024
  };
  
  // 自动进行智能推荐字段映射
  smartRecommendMapping();
  console.log('演示数据设置完成');
};

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 已注册产品列表
const registeredProducts = ref([
  { id: 1, name: '产品A' },
  { id: 2, name: '产品B' },
  { id: 3, name: '产品C' }
]);

// 表单数据
const form = reactive({
  analysisPeriod: [],
  reportName: '',
  templateType: '风险外数效果评估模板',
  description: ''
});

// 文件列表
const fileList = ref([]);

// 字段映射相关数据
const currentFileInfo = ref({ name: '', size: 0 });
const detectedFields = ref<string[]>([]);
const sampleData = ref<any[]>([]);
const fieldMapping = ref({
  dateField: '',
  platformField: '',
  variableFields: []
});

// 字段映射接口
interface FieldMapping {
  dateField: string;
  platformField: string;
  variableFields: string[];
}

// 可用的变量字段（排除已选择的日期和平台字段）
const availableVariableFields = computed(() => {
  return detectedFields.value.filter((field: string) => 
    field !== fieldMapping.value.dateField && 
    field !== fieldMapping.value.platformField
  );
});

// 检查映射是否有效
const isValidMapping = computed(() => {
  return fieldMapping.value.dateField && 
         fieldMapping.value.platformField && 
         fieldMapping.value.variableFields.length > 0;
});

// 检查是否有有效映射
  const hasValidMapping = computed(() => {
    // 在demo模式下，即使没有字段映射也显示预览
    console.log('检查是否有有效映射:', fileList.value.length === 0 && detectedFields.value.length > 0);
    console.log('fileList长度:', fileList.value.length);
    console.log('detectedFields长度:', detectedFields.value.length);
    console.log('currentStep:', currentStep.value);
    if (fileList.value.length === 0 && detectedFields.value.length > 0) {
      console.log('返回true');
      return true;
    }
    
    return fieldMapping.value.dateField && 
           fieldMapping.value.platformField && 
           fieldMapping.value.variableFields.length > 0;
  });
  
  // 预览数据计算属性
  const previewData = computed(() => {
    console.log('previewData计算属性被调用');
    console.log('sampleData:', sampleData.value);
    console.log('currentStep:', currentStep.value);
    console.log('detectedFields:', detectedFields.value);
    const data = sampleData.value.slice(0, 5);
    console.log('previewData:', data);
    return data;
  });

  // 表格列定义
  const tableColumns = computed(() => {
    return detectedFields.value.map((field: string) => ({
      title: field,
      dataIndex: field,
      key: field,
      width: 150
    }));
  });



// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 监听字段变化，自动清理冲突并更新时间跨度
watch(() => fieldMapping.value.dateField, (newVal: string, oldVal: string) => {
  if (newVal && fieldMapping.value.variableFields.includes(newVal)) {
    fieldMapping.value.variableFields = fieldMapping.value.variableFields.filter((f: string) => f !== newVal);
  }
  if (newVal && newVal === fieldMapping.value.platformField) {
    fieldMapping.value.platformField = '';
  }
  
  // 更新时间跨度
  if (newVal) {
    updateTimeSpanFromDateField(newVal);
  }
});

watch(() => fieldMapping.value.platformField, (newVal: string, oldVal: string) => {
  if (newVal && fieldMapping.value.variableFields.includes(newVal)) {
    fieldMapping.value.variableFields = fieldMapping.value.variableFields.filter((f: string) => f !== newVal);
  }
  if (newVal && newVal === fieldMapping.value.dateField) {
    fieldMapping.value.dateField = '';
  }
});

// 智能推荐字段映射
const smartRecommendMapping = () => {
  const fields = detectedFields.value;
  
  // 推荐日期字段
  const dateKeywords = ['date', 'time', '日期', '时间', 'created', 'updated'];
  const dateField = fields.find((field: string) => 
    dateKeywords.some((keyword: string) => field.toLowerCase().includes(keyword))
  );
  if (dateField) {
    fieldMapping.value.dateField = dateField;
    // 更新时间跨度
    updateTimeSpanFromDateField(dateField);
  }

  // 推荐平台字段
  const platformKeywords = ['platform', 'channel', '平台', '渠道', 'source', 'os'];
  const platformField = fields.find((field: string) => 
    platformKeywords.some((keyword: string) => field.toLowerCase().includes(keyword))
  );
  if (platformField && platformField !== dateField) {
    fieldMapping.value.platformField = platformField;
  }

  // 推荐变量字段（数值型字段）
  const numericKeywords = ['count', 'amount', 'value', 'rate', 'ratio', '数量', '金额', '比率'];
  const variableFields = fields.filter((field: string) => 
    field !== dateField && 
    field !== platformField &&
    (numericKeywords.some((keyword: string) => field.toLowerCase().includes(keyword)) ||
     /\d/.test(field)) // 包含数字的字段名
  );
  
  fieldMapping.value.variableFields = variableFields.slice(0, 5); // 最多推荐5个
};

// 表单规则
const rules = {
  reportName: [
    { required: true, message: '请输入报告名称' }
  ],
  analysisPeriod: [
    { required: true, message: '请选择分析时间跨度' }
  ],
  templateType: [
    { required: true, message: '请选择模板类型' }
  ],
  sampleFile: [
    { required: true, message: '请上传样本文件', validator: (value: any, callback: (error?: string) => void) => {
      // 在demo模式下，允许没有上传文件
      if (fileList.value.length === 0 && detectedFields.value.length === 0) {
        callback('请上传样本文件或使用Demo模式');
      } else {
        callback();
      }
    }}
  ]
};

// 监听时间范围变化，自动更新报告名称
watch([() => form.analysisPeriod], () => {
  updateReportNameWithDate();
});

// 根据日期字段更新时间跨度
const updateTimeSpanFromDateField = (dateField: string) => {
  try {
    const dates = sampleData.value
      .map((row: Record<string, string>) => row[dateField])
      .filter((date: string) => date && date.trim())
      .map((date: string) => new Date(date))
      .filter((date: Date) => !isNaN(date.getTime()))
      .sort((a: Date, b: Date) => a.getTime() - b.getTime());
    
    if (dates.length >= 2) {
      const startDate = dates[0].toISOString().split('T')[0].replace(/-/g, '');
      const endDate = dates[dates.length - 1].toISOString().split('T')[0].replace(/-/g, '');
      
      form.analysisPeriod = [startDate, endDate];
      updateReportNameWithDate();
      
      AMessage.success(`已根据样本日期字段更新时间跨度：${startDate} 至 ${endDate}`);
    }
  } catch (error) {
    console.error('更新时间跨度失败:', error);
  }
};

// 更新报告名称（仅包含日期）
const updateReportNameWithDate = () => {
  if (form.analysisPeriod.length === 2) {
    const startDate = form.analysisPeriod[0];
    const endDate = form.analysisPeriod[1];
    
    // 如果报告名称为空或之前是自动生成的，则更新为新的默认名称
    if (!form.reportName || form.reportName.includes('-产品级评估-')) {
      form.reportName = `产品级评估-${startDate}-${endDate}`;
    }
  } else {
    // 如果时间跨度为空且报告名称是自动生成的，则清空报告名称
    if (!form.reportName || form.reportName.includes('-产品级评估-')) {
      form.reportName = '';
    }
  }
};

// 解析文件字段和样本数据
const parseFileFields = (file: File): Promise<{ fields: string[], sampleData: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          // 解析CSV文件
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            reject(new Error('文件内容为空'));
            return;
          }
          
          // 获取字段名（第一行）
          const fields = lines[0].split(',').map(field => field.trim().replace(/"/g, ''));
          
          // 获取样本数据（前5行）
          const sampleData = lines.slice(1, 6).map((line: string) => {
            const values = line.split(',').map((value: string) => value.trim().replace(/"/g, ''));
            const row: Record<string, string | number> = {};
            fields.forEach((field, index) => {
              // 尝试转换为数字，如果失败则保持字符串
              const value = values[index] || '';
              if (value !== '' && !isNaN(Number(value))) {
                row[field] = Number(value);
              } else {
                row[field] = value;
              }
            });
            return row;
          });
          
          resolve({ fields, sampleData });
        } else {
          // 对于Excel文件，这里简化处理，实际项目中需要使用专门的Excel解析库
          // 模拟Excel解析结果
          const mockFields = ['date', 'product', 'value', 'count', 'rate'];
          const mockSampleData = [
            { date: '2023-01-01', product: 'Product A', value: 100, count: 10, rate: '0.1' },
            { date: '2023-01-02', product: 'Product B', value: 200, count: 20, rate: '0.15' },
            { date: '2023-01-03', product: 'Product C', value: 150, count: 15, rate: '0.12' },
            { date: '2023-01-04', product: 'Product A', value: 300, count: 30, rate: '0.2' },
            { date: '2023-01-05', product: 'Product B', value: 250, count: 25, rate: '0.18' }
          ];
          resolve({ fields: mockFields, sampleData: mockSampleData });
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

// 处理文件上传
const handleFileUpload = async (file: File) => {
  try {
    // 解析文件字段
    const { fields, sampleData: parsedSampleData } = await parseFileFields(file);
    
    // 设置文件信息和字段数据
    currentFileInfo.value = {
      name: file.name,
      size: file.size
    };
    detectedFields.value = fields;
    sampleData.value = parsedSampleData;
    
    // 自动进行智能推荐字段映射
    smartRecommendMapping();
    
    AMessage.success('文件解析成功');
  } catch (error) {
    AMessage.error('文件解析失败，请检查文件格式');
    console.error('文件解析错误:', error);
  }
};

// 处理文件变更
  const handleFileChange = (fileListNew: FileItem[], fileListOld: FileItem[]) => {
    if (fileListNew.length > 0) {
      const file = fileListNew[0];
      if (file.file) {
        handleFileUpload(file.file);
        // 自动进入下一步（字段映射步骤）
        if (currentStep.value === 0) {
          currentStep.value = 1;
        }
      }
    } else {
      form.analysisPeriod = [];
      updateReportNameWithDate();
      // 清空字段映射相关数据
      detectedFields.value = [];
      sampleData.value = [];
      fieldMapping.value = {
        dateField: '',
        platformField: '',
        variableFields: []
      };
    }
    fileList.value = fileListNew;
  };





// 文件上传前验证
const beforeUpload = (file: File) => {
  const isCsvOrExcel = file.type === 'text/csv' || 
                  file.type === 'application/vnd.ms-excel' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (!isCsvOrExcel) {
    AMessage.error('请上传CSV或Excel格式的文件');
    return false;
  }
  
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    AMessage.error('文件大小不能超过100MB');
    return false;
  }
  
  return true;
};

interface UploadOptions {
  file: File;
  onProgress: (progress: number) => void;
  onSuccess: (response: any) => void;
  onError: (error: Error) => void;
}

// 自定义上传处理
const customUpload = (options: UploadOptions) => {
  // 这里应该实现实际的文件上传逻辑
  console.log('文件上传:', options);
  return new Promise((resolve) => {
    setTimeout(() => {
      options.onSuccess({ url: 'mock-upload-url' });
    }, 1000);
  });
};

// 导入任务API服务
import { createTask } from '@/api/external/task.ts';

// 表单提交
const handleSubmit = async () => {
  const res = await formRef.value?.validate();
  if (!res) {
    // 验证通过，提交数据
    try {
      // 准备任务数据
      const taskData = {
        taskName: form.reportName,
        config: {
          productName: form.reportName,
          reportType: form.templateType || '外部数据评估',
          analysisPeriod: form.analysisPeriod.length > 0 ? `${form.analysisPeriod[0]}-${form.analysisPeriod[1]}` : ''
        }
      };
      
      // 调用任务创建API
      const response = await createTask(taskData);
      
      AMessage.success('任务创建成功');
      // 跳转到进度页面
      router.push({
        path: '/exploration/external-data-evaluation/progress',
        query: {
          taskId: response.data.id,
          taskName: form.reportName
        }
      });
    } catch (error) {
      AMessage.error('任务创建失败，请重试');
      console.error('提交失败:', error);
    }
  }
};

// 组件挂载时加载已注册产品列表
onMounted(() => {
  // 这里应该从API获取已注册产品列表
  console.log('已加载已注册产品列表');
  
  // 在demo模式下初始化演示数据
  console.log('组件挂载时的fileList:', fileList.value);
  if (fileList.value.length === 0) {
    console.log('初始化演示数据');
    setupDemoData();
    // 显式更新currentStep为1，确保字段预览区域能够显示
    currentStep.value = 1;
  }
});
</script>

<style scoped>
.create-external-data-evaluation-page {
  padding: 20px;
  background-color: var(--color-fill-2);
  min-height: calc(100vh - 60px);
}

.content-wrapper {
  background: var(--color-bg-2);
  border-radius: 4px;
  padding: 24px;
  margin-bottom: 20px;
}

.product-note,
.report-name-note,
.file-note,
.template-note {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
}

.step-navigation {
  text-align: center;
  padding: 20px;
  background: var(--color-bg-2);
  border-radius: 4px;
}

.field-mapping-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-mapping-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-preview {
  margin-top: 20px;
}

.field-preview h5 {
  margin-bottom: 12px;
  font-weight: 500;
}

.mapping-result {
  margin-top: 20px;
}

.mapping-result h5 {
  margin-bottom: 12px;
  font-weight: 500;
}

.variable-fields-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
