<template>
  <div class="canvas-validation-test">
    <div class="test-header">
      <h2>画布校验功能测试</h2>
      <p>测试不同场景下的画布数据校验功能</p>
    </div>

    <div class="test-content">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-card title="测试场景" class="test-scenarios">
            <a-space direction="vertical" style="width: 100%">
              <a-button @click="testEmptyCanvas" type="primary">测试空画布</a-button>
              <a-button @click="testNoStartNode" type="primary">测试无开始节点</a-button>
              <a-button @click="testMultipleStartNodes" type="primary">测试多个开始节点</a-button>
              <a-button @click="testDisconnectedNodes" type="primary">测试孤立节点</a-button>
              <a-button @click="testIncompleteConfig" type="primary">测试配置不完整</a-button>
              <a-button @click="testValidCanvas" type="primary">测试有效画布</a-button>
              <a-button @click="testCanvasWithWarnings" type="primary">测试有警告的画布</a-button>
            </a-space>
          </a-card>
        </a-col>
        
        <a-col :span="12">
          <a-card title="校验结果" class="validation-results">
            <div v-if="validationResult">
              <a-alert 
                :type="validationResult.isValid ? 'success' : 'error'"
                :title="validationResult.isValid ? '校验通过' : '校验失败'"
                :description="formatValidationMessage(validationResult)"
                show-icon
              />
              
              <div class="result-details" style="margin-top: 16px;">
                <h4>详细信息：</h4>
                <pre>{{ JSON.stringify(validationResult, null, 2) }}</pre>
              </div>
            </div>
            <div v-else class="no-result">
              <a-empty description="请选择测试场景" />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { validateCanvasData, formatValidationMessage } from '../../utils/canvasValidation.js'

const validationResult = ref(null)

// 测试空画布
const testEmptyCanvas = () => {
  const canvasData = null
  validationResult.value = validateCanvasData(canvasData)
}

// 测试无开始节点
const testNoStartNode = () => {
  const canvasData = {
    nodes: [
      {
        id: 'node1',
        type: 'sms',
        label: '短信节点',
        position: { x: 100, y: 100 },
        data: { content: '测试短信' }
      }
    ],
    connections: []
  }
  validationResult.value = validateCanvasData(canvasData)
}

// 测试多个开始节点
const testMultipleStartNodes = () => {
  const canvasData = {
    nodes: [
      {
        id: 'start1',
        type: 'start',
        label: '开始节点1',
        position: { x: 100, y: 100 },
        data: {}
      },
      {
        id: 'start2',
        type: 'start',
        label: '开始节点2',
        position: { x: 300, y: 100 },
        data: {}
      }
    ],
    connections: []
  }
  validationResult.value = validateCanvasData(canvasData)
}

// 测试孤立节点
const testDisconnectedNodes = () => {
  const canvasData = {
    nodes: [
      {
        id: 'start1',
        type: 'start',
        label: '开始节点',
        position: { x: 100, y: 100 },
        data: {}
      },
      {
        id: 'sms1',
        type: 'sms',
        label: '短信节点',
        position: { x: 300, y: 100 },
        data: { content: '测试短信' }
      },
      {
        id: 'end1',
        type: 'end',
        label: '结束节点',
        position: { x: 500, y: 100 },
        data: {}
      }
    ],
    connections: []
  }
  validationResult.value = validateCanvasData(canvasData)
}

// 测试配置不完整
const testIncompleteConfig = () => {
  const canvasData = {
    nodes: [
      {
        id: 'start1',
        type: 'start',
        label: '开始节点',
        position: { x: 100, y: 100 },
        data: {}
      },
      {
        id: 'sms1',
        type: 'sms',
        label: '短信节点',
        position: { x: 300, y: 100 },
        data: {} // 缺少短信内容
      },
      {
        id: 'wait1',
        type: 'wait',
        label: '等待节点',
        position: { x: 500, y: 100 },
        data: { duration: 0 } // 无效的等待时长
      },
      {
        id: 'end1',
        type: 'end',
        label: '结束节点',
        position: { x: 700, y: 100 },
        data: {}
      }
    ],
    connections: [
      {
        id: 'conn1',
        source: 'start1',
        target: 'sms1'
      },
      {
        id: 'conn2',
        source: 'sms1',
        target: 'wait1'
      },
      {
        id: 'conn3',
        source: 'wait1',
        target: 'end1'
      }
    ]
  }
  validationResult.value = validateCanvasData(canvasData)
}

// 测试有效画布
const testValidCanvas = () => {
  const canvasData = {
    nodes: [
      {
        id: 'start1',
        type: 'start',
        label: '开始节点',
        position: { x: 100, y: 100 },
        data: { triggerType: 'manual' }
      },
      {
        id: 'sms1',
        type: 'sms',
        label: '短信节点',
        position: { x: 300, y: 100 },
        data: { 
          content: '欢迎使用我们的服务！',
          template: 'welcome_template'
        }
      },
      {
        id: 'wait1',
        type: 'wait',
        label: '等待节点',
        position: { x: 500, y: 100 },
        data: { duration: 3600 } // 1小时
      },
      {
        id: 'end1',
        type: 'end',
        label: '结束节点',
        position: { x: 700, y: 100 },
        data: {}
      }
    ],
    connections: [
      {
        id: 'conn1',
        source: 'start1',
        target: 'sms1'
      },
      {
        id: 'conn2',
        source: 'sms1',
        target: 'wait1'
      },
      {
        id: 'conn3',
        source: 'wait1',
        target: 'end1'
      }
    ]
  }
  validationResult.value = validateCanvasData(canvasData)
}

// 测试有警告的画布
const testCanvasWithWarnings = () => {
  const canvasData = {
    nodes: [
      {
        id: 'start1',
        type: 'start',
        label: '开始节点',
        position: { x: 100, y: 100 },
        data: {} // 缺少触发类型（警告）
      },
      {
        id: 'sms1',
        type: 'sms',
        label: '短信节点',
        position: { x: 300, y: 100 },
        data: { 
          content: '欢迎使用我们的服务！'
          // 缺少模板（警告）
        }
      }
      // 缺少结束节点（警告）
    ],
    connections: [
      {
        id: 'conn1',
        source: 'start1',
        target: 'sms1'
      }
    ]
  }
  validationResult.value = validateCanvasData(canvasData)
}
</script>

<style scoped>
.canvas-validation-test {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.test-header {
  text-align: center;
  margin-bottom: 32px;
}

.test-header h2 {
  color: #1d2129;
  margin-bottom: 8px;
}

.test-header p {
  color: #86909c;
}

.test-content {
  max-width: 1200px;
  margin: 0 auto;
}

.test-scenarios :deep(.arco-btn) {
  width: 100%;
  margin-bottom: 8px;
}

.validation-results {
  height: 600px;
}

.result-details {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  border: 1px solid #e5e6eb;
}

.result-details pre {
  margin: 0;
  font-size: 12px;
  color: #4e5969;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

:deep(.arco-card) {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

:deep(.arco-alert) {
  border-radius: 6px;
}
</style>