<template>
  <a-modal
    v-bind="modalProps"
    :visible="visible"
    :title="title"
    :width="width"
    :mask-closable="maskClosable"
    :esc-to-close="escToClose"
    :closable="closable"
    :align-center="alignCenter"
    :draggable="draggable"
    :full-screen="fullScreen"
    :mask="mask"
    :simple="simple"
    :hide-cancel="hideCancel"
    :hide-title="hideTitle"
    :footer="computedFooter"
    :ok-text="okText"
    :cancel-text="cancelText"
    :ok-loading="okLoading"
    :ok-button-props="okButtonProps"
    :cancel-button-props="cancelButtonProps"
    :body-style="bodyStyle"
    :modal-class="modalClass"
    :modal-style="modalStyle"
    @ok="handleOk"
    @cancel="handleCancel"
    @open="handleOpen"
    @close="handleClose"
    @before-ok="handleBeforeOk"
    @before-cancel="handleBeforeCancel"
  >
    <!-- 标题插槽 -->
    <template v-if="$slots.title" #title>
      <slot name="title"></slot>
    </template>
    
    <!-- 内容区域 -->
    <div class="modal-content">
      <!-- 描述信息 -->
      <div v-if="description" class="modal-description">
        {{ description }}
      </div>
      
      <!-- 主要内容 -->
      <div class="modal-body">
        <slot></slot>
      </div>
      
      <!-- 表单内容 -->
      <BaseForm
        v-if="formItems && formItems.length > 0"
        ref="formRef"
        v-model="formData"
        :form-items="formItems"
        :rules="formRules"
        :layout="formLayout"
        :size="formSize"
        :label-col-props="formLabelColProps"
        :wrapper-col-props="formWrapperColProps"
        :label-align="formLabelAlign"
        :disabled="formDisabled"
        :show-actions="false"
        @submit="handleFormSubmit"
      >
        <!-- 表单插槽透传 -->
        <template v-for="(_, name) in formSlots" #[name]="slotData">
          <slot :name="name" v-bind="slotData"></slot>
        </template>
      </BaseForm>
    </div>
    
    <!-- 底部插槽 -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :ok="handleOk" :cancel="handleCancel"></slot>
    </template>
  </a-modal>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { Modal as AModal } from '@arco-design/web-vue'
import BaseForm from './BaseForm.vue'
import { businessMessage } from '@/utils/message'

export default {
  name: 'BaseModal',
  components: {
    AModal,
    BaseForm
  },
  props: {
    // 显示状态
    visible: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 描述信息
    description: {
      type: String,
      default: ''
    },
    // 宽度
    width: {
      type: [String, Number],
      default: 520
    },
    // 点击遮罩层是否可以关闭
    maskClosable: {
      type: Boolean,
      default: false
    },
    // 按ESC键是否可以关闭
    escToClose: {
      type: Boolean,
      default: true
    },
    // 是否显示关闭按钮
    closable: {
      type: Boolean,
      default: true
    },
    // 是否居中显示
    alignCenter: {
      type: Boolean,
      default: true
    },
    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: false
    },
    // 是否全屏
    fullScreen: {
      type: Boolean,
      default: false
    },
    // 是否显示遮罩层
    mask: {
      type: Boolean,
      default: true
    },
    // 是否为简单模式
    simple: {
      type: Boolean,
      default: false
    },
    // 是否隐藏取消按钮
    hideCancel: {
      type: Boolean,
      default: false
    },
    // 是否隐藏标题
    hideTitle: {
      type: Boolean,
      default: false
    },
    // 是否显示底部
    footer: {
      type: Boolean,
      default: true
    },
    // 确定按钮文本
    okText: {
      type: String,
      default: '确定'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取消'
    },
    // 确定按钮加载状态
    okLoading: {
      type: Boolean,
      default: false
    },
    // 确定按钮属性
    okButtonProps: {
      type: Object,
      default: () => ({})
    },
    // 取消按钮属性
    cancelButtonProps: {
      type: Object,
      default: () => ({})
    },
    // 内容区域样式
    bodyStyle: {
      type: Object,
      default: () => ({})
    },
    // 模态框类名
    modalClass: {
      type: String,
      default: ''
    },
    // 模态框样式
    modalStyle: {
      type: Object,
      default: () => ({})
    },
    // 表单数据
    formData: {
      type: Object,
      default: () => ({})
    },
    // 表单项配置
    formItems: {
      type: Array,
      default: () => []
    },
    // 表单验证规则
    formRules: {
      type: Object,
      default: () => ({})
    },
    // 表单布局
    formLayout: {
      type: String,
      default: 'horizontal'
    },
    // 表单大小
    formSize: {
      type: String,
      default: 'medium'
    },
    // 表单标签列属性
    formLabelColProps: {
      type: Object,
      default: () => ({ span: 6 })
    },
    // 表单包装列属性
    formWrapperColProps: {
      type: Object,
      default: () => ({ span: 18 })
    },
    // 表单标签对齐方式
    formLabelAlign: {
      type: String,
      default: 'right'
    },
    // 表单是否禁用
    formDisabled: {
      type: Boolean,
      default: false
    },
    // 是否在确定前验证表单
    validateBeforeOk: {
      type: Boolean,
      default: true
    },
    // 其他模态框属性
    modalProps: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'update:visible',
    'update:formData',
    'ok',
    'cancel',
    'open',
    'close',
    'before-ok',
    'before-cancel',
    'form-submit'
  ],
  setup(props, { emit, slots }) {
    const formRef = ref()
    
    // 计算属性
    const computedFooter = computed(() => {
      return props.footer
    })
    
    // 表单插槽
    const formSlots = computed(() => {
      const slotNames = Object.keys(slots)
      const formSlotNames = slotNames.filter(name => 
        name !== 'default' && 
        name !== 'title' && 
        name !== 'footer'
      )
      return formSlotNames.reduce((acc, name) => {
        acc[name] = slots[name]
        return acc
      }, {})
    })
    
    // 事件处理
    const handleOk = async () => {
      try {
        // 如果有表单且需要验证
        if (props.formItems.length > 0 && props.validateBeforeOk) {
          const valid = await formRef.value?.validate()
          if (!valid) {
            businessMessage.error('请完善表单信息')
            return false
          }
        }
        
        emit('ok', props.formData)
        return true
      } catch (error) {
        console.error('Modal ok validation failed:', error)
        return false
      }
    }
    
    const handleCancel = () => {
      emit('cancel')
      emit('update:visible', false)
    }
    
    const handleOpen = () => {
      emit('open')
    }
    
    const handleClose = () => {
      emit('close')
      emit('update:visible', false)
    }
    
    const handleBeforeOk = (done) => {
      emit('before-ok', done)
    }
    
    const handleBeforeCancel = (done) => {
      emit('before-cancel', done)
    }
    
    const handleFormSubmit = (data) => {
      emit('form-submit', data)
    }
    
    // 监听表单数据变化
    watch(
      () => props.formData,
      (newData) => {
        emit('update:formData', newData)
      },
      { deep: true }
    )
    
    // 暴露表单方法
    const validateForm = () => {
      return formRef.value?.validate()
    }
    
    const resetForm = () => {
      formRef.value?.resetFields()
    }
    
    const clearValidate = (field) => {
      formRef.value?.clearValidate(field)
    }
    
    return {
      formRef,
      computedFooter,
      formSlots,
      handleOk,
      handleCancel,
      handleOpen,
      handleClose,
      handleBeforeOk,
      handleBeforeCancel,
      handleFormSubmit,
      validateForm,
      resetForm,
      clearValidate
    }
  }
}
</script>

<style scoped>
.modal-content {
  min-height: 60px;
}

.modal-description {
  color: #86909c;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f7f8fa;
  border-radius: 4px;
  border-left: 3px solid #165dff;
}

.modal-body {
  min-height: 40px;
}

/* 全局样式覆盖 */
:deep(.arco-modal) {
  border-radius: 8px;
}

:deep(.arco-modal-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 24px;
}

:deep(.arco-modal-title) {
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

:deep(.arco-modal-body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.arco-modal-footer) {
  border-top: 1px solid #f0f0f0;
  padding: 12px 24px;
  text-align: right;
}

:deep(.arco-modal-footer .arco-btn) {
  margin-left: 12px;
}

:deep(.arco-modal-footer .arco-btn:first-child) {
  margin-left: 0;
}

/* 模态框通用样式优化 */
:deep(.arco-modal) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.arco-modal-header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border-2);
  background: var(--color-bg-2);
}

:deep(.arco-modal-title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

:deep(.arco-modal-body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.arco-modal-footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--color-border-2);
  background: var(--color-bg-2);
}

/* 大尺寸模态框 */
:deep(.arco-modal.modal-large) {
  width: 800px;
}

:deep(.arco-modal.modal-large .arco-modal-body) {
  max-height: 70vh;
}

/* 小尺寸模态框 */
:deep(.arco-modal.modal-small) {
  width: 400px;
}

/* 全屏模态框 */
:deep(.arco-modal.modal-fullscreen) {
  width: 100vw;
  height: 100vh;
  top: 0;
  margin: 0;
  max-width: none;
  border-radius: 0;
}

:deep(.arco-modal.modal-fullscreen .arco-modal-body) {
  height: calc(100vh - 120px);
  max-height: none;
  overflow-y: auto;
}

/* 按钮样式优化 */
:deep(.arco-modal-footer .arco-btn) {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 20px;
  height: 36px;
}

:deep(.arco-modal-footer .arco-btn-primary) {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

:deep(.arco-modal-footer .arco-btn-primary:hover) {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.arco-modal) {
    width: 90vw !important;
    margin: 20px auto;
  }
  
  :deep(.arco-modal-header),
  :deep(.arco-modal-body),
  :deep(.arco-modal-footer) {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>