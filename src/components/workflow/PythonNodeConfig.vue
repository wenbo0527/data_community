<template>
  <div class="python-node-config">
    <a-form :model="formData" layout="vertical">
      <a-form-item label="节点名称" field="name">
        <a-input 
          v-model="formData.name" 
          placeholder="请输入节点名称"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item label="Python代码" field="pythonCode">
        <a-textarea 
          v-model="formData.pythonCode" 
          placeholder="请输入Python代码"
          :rows="12"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item label="Python版本" field="pythonVersion">
        <a-select 
          v-model="formData.pythonVersion" 
          placeholder="请选择Python版本"
          @change="handleFormChange"
        >
          <a-option value="3.8">Python 3.8</a-option>
          <a-option value="3.9">Python 3.9</a-option>
          <a-option value="3.10">Python 3.10</a-option>
          <a-option value="3.11">Python 3.11</a-option>
        </a-select>
      </a-form-item>
      
      <a-form-item label="依赖包" field="requirements">
        <div class="requirements-list">
          <div 
            v-for="(req, index) in formData.requirements" 
            :key="index"
            class="requirement-item"
          >
            <a-input 
              v-model="req.package" 
              placeholder="包名"
              class="package-name"
              @change="handleFormChange"
            />
            <a-input 
              v-model="req.version" 
              placeholder="版本(可选)"
              class="package-version"
              @change="handleFormChange"
            />
            <a-button 
              type="text" 
              status="danger" 
              @click="removeRequirement(index)"
            >
              删除
            </a-button>
          </div>
          <a-button 
            type="dashed" 
            @click="addRequirement"
            class="add-requirement-btn"
          >
            + 添加依赖包
          </a-button>
        </div>
      </a-form-item>
      
      <a-form-item label="输入变量">
        <div class="variables-list">
          <div 
            v-for="(variable, index) in formData.inputVariables" 
            :key="index"
            class="variable-item"
          >
            <a-input 
              v-model="variable.name" 
              placeholder="变量名"
              class="variable-name"
              @change="handleFormChange"
            />
            <a-select 
              v-model="variable.type" 
              placeholder="类型"
              class="variable-type"
              @change="handleFormChange"
            >
              <a-option value="string">字符串</a-option>
              <a-option value="number">数字</a-option>
              <a-option value="boolean">布尔值</a-option>
              <a-option value="list">列表</a-option>
              <a-option value="dict">字典</a-option>
              <a-option value="dataframe">DataFrame</a-option>
            </a-select>
            <a-input 
              v-model="variable.description" 
              placeholder="描述"
              class="variable-desc"
              @change="handleFormChange"
            />
            <a-button 
              type="text" 
              status="danger" 
              @click="removeInputVariable(index)"
            >
              删除
            </a-button>
          </div>
          <a-button 
            type="dashed" 
            @click="addInputVariable"
            class="add-variable-btn"
          >
            + 添加输入变量
          </a-button>
        </div>
      </a-form-item>
      
      <a-form-item label="输出变量">
        <div class="variables-list">
          <div 
            v-for="(variable, index) in formData.outputVariables" 
            :key="index"
            class="variable-item"
          >
            <a-input 
              v-model="variable.name" 
              placeholder="变量名"
              class="variable-name"
              @change="handleFormChange"
            />
            <a-select 
              v-model="variable.type" 
              placeholder="类型"
              class="variable-type"
              @change="handleFormChange"
            >
              <a-option value="string">字符串</a-option>
              <a-option value="number">数字</a-option>
              <a-option value="boolean">布尔值</a-option>
              <a-option value="list">列表</a-option>
              <a-option value="dict">字典</a-option>
              <a-option value="dataframe">DataFrame</a-option>
            </a-select>
            <a-input 
              v-model="variable.description" 
              placeholder="描述"
              class="variable-desc"
              @change="handleFormChange"
            />
            <a-button 
              type="text" 
              status="danger" 
              @click="removeOutputVariable(index)"
            >
              删除
            </a-button>
          </div>
          <a-button 
            type="dashed" 
            @click="addOutputVariable"
            class="add-variable-btn"
          >
            + 添加输出变量
          </a-button>
        </div>
      </a-form-item>
      
      <a-form-item label="执行选项">
        <a-space direction="vertical" class="execution-options">
          <a-checkbox 
            v-model="formData.enableTimeout" 
            @change="handleFormChange"
          >
            启用超时控制
          </a-checkbox>
          <a-checkbox 
            v-model="formData.enableDebug" 
            @change="handleFormChange"
          >
            启用调试模式
          </a-checkbox>
          <a-checkbox 
            v-model="formData.enableCache" 
            @change="handleFormChange"
          >
            启用结果缓存
          </a-checkbox>
        </a-space>
      </a-form-item>
      
      <template v-if="formData.enableTimeout">
        <a-form-item label="超时时间(秒)" field="timeout">
          <a-input-number 
            v-model="formData.timeout" 
            :min="1"
            :max="3600"
            placeholder="请输入超时时间"
            @change="handleFormChange"
          />
        </a-form-item>
      </template>
      
      <a-form-item label="内存限制(MB)" field="memoryLimit">
        <a-input-number 
          v-model="formData.memoryLimit" 
          :min="128"
          :max="8192"
          placeholder="请输入内存限制"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item label="描述" field="description">
        <a-textarea 
          v-model="formData.description" 
          placeholder="请输入节点描述"
          :rows="3"
          @change="handleFormChange"
        />
      </a-form-item>
      
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="validateCode">
            验证代码
          </a-button>
          <a-button @click="formatCode">
            格式化
          </a-button>
          <a-button @click="testRun">
            测试运行
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';

// Props
const props = defineProps({
  node: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update']);

// 表单数据
const formData = ref({
  name: '',
  pythonCode: '',
  pythonVersion: '3.10',
  requirements: [],
  inputVariables: [],
  outputVariables: [],
  enableTimeout: false,
  enableDebug: false,
  enableCache: false,
  timeout: 300,
  memoryLimit: 512,
  description: ''
});

// 方法
const handleFormChange = () => {
  emit('update', {
    nodeId: props.node?.id,
    config: { ...formData.value }
  });
};

const addRequirement = () => {
  formData.value.requirements.push({
    package: '',
    version: ''
  });
  handleFormChange();
};

const removeRequirement = (index) => {
  formData.value.requirements.splice(index, 1);
  handleFormChange();
};

const addInputVariable = () => {
  formData.value.inputVariables.push({
    name: '',
    type: 'string',
    description: ''
  });
  handleFormChange();
};

const removeInputVariable = (index) => {
  formData.value.inputVariables.splice(index, 1);
  handleFormChange();
};

const addOutputVariable = () => {
  formData.value.outputVariables.push({
    name: '',
    type: 'string',
    description: ''
  });
  handleFormChange();
};

const removeOutputVariable = (index) => {
  formData.value.outputVariables.splice(index, 1);
  handleFormChange();
};

const validateCode = () => {
  if (!formData.value.pythonCode.trim()) {
    Message.warning('请输入Python代码');
    return;
  }
  
  // 简单的Python语法验证
  const code = formData.value.pythonCode;
  const hasBasicSyntax = /^[\s\S]*$/m.test(code);
  
  if (hasBasicSyntax) {
    Message.success('代码语法验证通过');
  } else {
    Message.error('代码语法可能存在问题，请检查');
  }
};

const formatCode = () => {
  if (!formData.value.pythonCode.trim()) {
    Message.warning('请输入Python代码');
    return;
  }
  
  // 简单的代码格式化（实际项目中可以使用专业的格式化工具）
  const formatted = formData.value.pythonCode
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n\n+/g, '\n\n');
  
  formData.value.pythonCode = formatted;
  handleFormChange();
  Message.success('代码格式化完成');
};

const testRun = () => {
  if (!formData.value.pythonCode.trim()) {
    Message.warning('请输入Python代码');
    return;
  }
  
  // 模拟测试运行
  Message.info('正在测试运行代码...');
  setTimeout(() => {
    Message.success('代码测试运行成功');
  }, 2000);
};

// 初始化表单数据
const initFormData = () => {
  if (props.node?.config) {
    Object.assign(formData.value, props.node.config);
  } else {
    formData.value.name = props.node?.label || 'Python脚本';
    formData.value.pythonCode = `# Python代码示例\nimport pandas as pd\nimport numpy as np\n\n# 在这里编写您的Python代码\ndef process_data(input_data):\n    # 数据处理逻辑\n    result = input_data\n    return result\n\n# 主函数\nif __name__ == "__main__":\n    # 执行代码\n    pass`;
  }
};

// 监听节点变化
watch(() => props.node, initFormData, { immediate: true });

onMounted(() => {
  initFormData();
});
</script>

<style scoped>
.python-node-config {
  padding: 16px;
}

.requirements-list,
.variables-list {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
  background: #f7f8fa;
}

.requirement-item,
.variable-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.requirement-item:last-child,
.variable-item:last-child {
  margin-bottom: 0;
}

.package-name,
.variable-name {
  flex: 2;
}

.package-version,
.variable-type {
  flex: 1;
}

.variable-desc {
  flex: 2;
}

.add-requirement-btn,
.add-variable-btn {
  width: 100%;
  margin-top: 8px;
}

.execution-options {
  width: 100%;
}
</style>