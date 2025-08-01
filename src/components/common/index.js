// 基础组件统一导出
import BaseTable from './BaseTable.vue'
import BaseForm from './BaseForm.vue'
import BaseModal from './BaseModal.vue'

// 导出组件
export {
  BaseTable,
  BaseForm,
  BaseModal
}

// 默认导出
export default {
  BaseTable,
  BaseForm,
  BaseModal
}

// 组件安装函数（用于全局注册）
export const install = (app) => {
  app.component('BaseTable', BaseTable)
  app.component('BaseForm', BaseForm)
  app.component('BaseModal', BaseModal)
}

// 组件配置预设
export const componentPresets = {
  // 表格预设
  table: {
    // 标准数据表格
    standard: {
      showToolbar: true,
      showRefresh: true,
      showColumnSetting: true,
      showDensitySetting: true,
      size: 'medium',
      pagination: {
        showTotal: true,
        showJumper: true,
        showPageSize: true,
        pageSizeOptions: [10, 20, 50, 100]
      }
    },
    // 简单表格
    simple: {
      showToolbar: false,
      pagination: false,
      size: 'small'
    },
    // 查询结果表格
    query: {
      showToolbar: true,
      showRefresh: false,
      showColumnSetting: true,
      showDensitySetting: false,
      pagination: {
        showTotal: true,
        showJumper: true,
        showPageSize: true
      }
    }
  },
  
  // 表单预设
  form: {
    // 标准表单
    standard: {
      layout: 'horizontal',
      size: 'medium',
      labelColProps: { span: 6 },
      wrapperColProps: { span: 18 },
      labelAlign: 'right',
      showActions: true,
      showSubmit: true,
      showReset: true
    },
    // 查询表单
    query: {
      layout: 'inline',
      size: 'medium',
      showActions: true,
      showSubmit: true,
      showReset: true,
      submitText: '查询',
      resetText: '重置'
    },
    // 详情表单（只读）
    detail: {
      layout: 'horizontal',
      size: 'medium',
      labelColProps: { span: 6 },
      wrapperColProps: { span: 18 },
      labelAlign: 'right',
      disabled: true,
      showActions: false
    },
    // 弹窗表单
    modal: {
      layout: 'horizontal',
      size: 'medium',
      labelColProps: { span: 6 },
      wrapperColProps: { span: 18 },
      labelAlign: 'right',
      showActions: false
    }
  },
  
  // 模态框预设
  modal: {
    // 标准模态框
    standard: {
      width: 520,
      maskClosable: false,
      alignCenter: true,
      okText: '确定',
      cancelText: '取消'
    },
    // 大尺寸模态框
    large: {
      width: 800,
      maskClosable: false,
      alignCenter: true,
      modalClass: 'modal-large'
    },
    // 小尺寸模态框
    small: {
      width: 400,
      maskClosable: false,
      alignCenter: true,
      modalClass: 'modal-small'
    },
    // 确认对话框
    confirm: {
      width: 420,
      maskClosable: false,
      alignCenter: true,
      okText: '确定',
      cancelText: '取消'
    },
    // 表单模态框
    form: {
      width: 600,
      maskClosable: false,
      alignCenter: true,
      validateBeforeOk: true,
      formLayout: 'horizontal',
      formLabelColProps: { span: 6 },
      formWrapperColProps: { span: 18 }
    }
  }
}

// 常用表单项配置
export const formItemTemplates = {
  // 基础输入框
  input: (field, label, options = {}) => ({
    type: 'input',
    field,
    label,
    placeholder: `请输入${label}`,
    allowClear: true,
    ...options
  }),
  
  // 必填输入框
  requiredInput: (field, label, options = {}) => ({
    type: 'input',
    field,
    label,
    placeholder: `请输入${label}`,
    allowClear: true,
    required: true,
    rules: [{ required: true, message: `${label}不能为空` }],
    ...options
  }),
  
  // 文本域
  textarea: (field, label, options = {}) => ({
    type: 'textarea',
    field,
    label,
    placeholder: `请输入${label}`,
    allowClear: true,
    autoSize: { minRows: 3, maxRows: 6 },
    ...options
  }),
  
  // 数字输入框
  number: (field, label, options = {}) => ({
    type: 'number',
    field,
    label,
    placeholder: `请输入${label}`,
    min: 0,
    ...options
  }),
  
  // 选择器
  select: (field, label, options = [], selectOptions = {}) => ({
    type: 'select',
    field,
    label,
    placeholder: `请选择${label}`,
    options,
    allowClear: true,
    allowSearch: true,
    ...selectOptions
  }),
  
  // 必选选择器
  requiredSelect: (field, label, options = [], selectOptions = {}) => ({
    type: 'select',
    field,
    label,
    placeholder: `请选择${label}`,
    options,
    allowClear: true,
    allowSearch: true,
    required: true,
    rules: [{ required: true, message: `请选择${label}` }],
    ...selectOptions
  }),
  
  // 日期选择器
  date: (field, label, options = {}) => ({
    type: 'date',
    field,
    label,
    placeholder: `请选择${label}`,
    allowClear: true,
    format: 'YYYY-MM-DD',
    ...options
  }),
  
  // 日期时间选择器
  datetime: (field, label, options = {}) => ({
    type: 'datetime',
    field,
    label,
    placeholder: `请选择${label}`,
    allowClear: true,
    format: 'YYYY-MM-DD HH:mm:ss',
    ...options
  }),
  
  // 日期范围选择器
  daterange: (field, label, options = {}) => ({
    type: 'daterange',
    field,
    label,
    placeholder: ['开始日期', '结束日期'],
    allowClear: true,
    format: 'YYYY-MM-DD',
    ...options
  }),
  
  // 单选框组
  radio: (field, label, options = [], radioOptions = {}) => ({
    type: 'radio',
    field,
    label,
    options,
    direction: 'horizontal',
    ...radioOptions
  }),
  
  // 复选框组
  checkbox: (field, label, options = [], checkboxOptions = {}) => ({
    type: 'checkbox',
    field,
    label,
    options,
    direction: 'horizontal',
    ...checkboxOptions
  }),
  
  // 开关
  switch: (field, label, options = {}) => ({
    type: 'switch',
    field,
    label,
    ...options
  }),
  
  // 上传
  upload: (field, label, options = {}) => ({
    type: 'upload',
    field,
    label,
    action: '/api/upload',
    multiple: false,
    limit: 1,
    ...options
  })
}

// 常用表格列配置
export const tableColumnTemplates = {
  // 序号列
  index: (options = {}) => ({
    title: '序号',
    dataIndex: 'index',
    width: 80,
    align: 'center',
    render: ({ rowIndex }) => rowIndex + 1,
    ...options
  }),
  
  // 操作列
  action: (options = {}) => ({
    title: '操作',
    dataIndex: 'action',
    width: 150,
    align: 'center',
    fixed: 'right',
    slotName: 'action',
    ...options
  }),
  
  // 状态列
  status: (field = 'status', options = {}) => ({
    title: '状态',
    dataIndex: field,
    width: 100,
    align: 'center',
    slotName: 'status',
    ...options
  }),
  
  // 时间列
  time: (field, title, options = {}) => ({
    title,
    dataIndex: field,
    width: 180,
    align: 'center',
    render: ({ record }) => {
      const time = record[field]
      return time ? new Date(time).toLocaleString() : '-'
    },
    ...options
  }),
  
  // 文本列
  text: (field, title, options = {}) => ({
    title,
    dataIndex: field,
    ellipsis: true,
    tooltip: true,
    ...options
  })
}