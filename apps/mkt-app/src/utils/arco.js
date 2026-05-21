/**
 * Arco Design 组件统一导出
 * 遵循企业后台设计原则，提供常用组件的统一导入
 */

// 基础组件
export {
  Button,
  Input,
  InputNumber,
  InputPassword,
  Textarea,
  Select,
  Option,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  DatePicker,
  TimePicker,
  RangePicker,
  Upload
} from '@arco-design/web-vue'

// 数据展示组件
export {
  Table,
  TableColumn,
  Pagination,
  Tag,
  Badge,
  Avatar,
  Card,
  Descriptions,
  DescriptionsItem,
  Empty,
  List,
  ListItem,
  ListItemMeta,
  Statistic,
  Tree,
  TreeNode
} from '@arco-design/web-vue'

// 反馈组件
export {
  Alert,
  Drawer,
  Modal,
  Popconfirm,
  Popover,
  Tooltip,
  Notification,
  Progress,
  Result,
  Skeleton,
  Spin,
  BackTop
} from '@arco-design/web-vue'

// 导航组件
export {
  Affix,
  Breadcrumb,
  BreadcrumbItem,
  Dropdown,
  DropdownButton,
  DropdownOption,
  Menu,
  MenuItem,
  MenuItemGroup,
  SubMenu,
  PageHeader,
  Pagination as PaginationNav,
  Steps,
  Step,
  Tabs,
  TabPane
} from '@arco-design/web-vue'

// 布局组件
export {
  Layout,
  LayoutHeader,
  LayoutSider,
  LayoutContent,
  LayoutFooter,
  Grid,
  Row,
  Col,
  Space,
  Divider
} from '@arco-design/web-vue'

// 表单组件
export {
  Form,
  FormItem,
  AutoComplete,
  Cascader,
  ColorPicker,
  InputTag,
  Mention,
  Rate,
  Slider,
  Transfer,
  TreeSelect
} from '@arco-design/web-vue'

// 图标组件（常用图标）
export {
  IconSearch,
  IconPlus,
  IconEdit,
  IconDelete,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconEye,
  IconEyeInvisible,
  IconClose,
  IconCheck,
  IconExclamationCircle,
  IconInfoCircle,
  IconCheckCircle,
  IconCloseCircle,
  IconLoading,
  IconLeft,
  IconRight,
  IconUp,
  IconDown,
  IconMore,
  IconSettings,
  IconUser,
  IconHome,
  IconDashboard,
  IconFile,
  IconFolder,
  IconCopy,
  IconSave,
  IconPrint,
  IconExport,
  IconImport,
  IconFilter,
  IconSort,
  IconCalendar,
  IconClock,
  IconLocation,
  IconPhone,
  IconEmail,
  IconLink,
  IconTag,
  IconStar,
  IconHeart,
  IconThumbUp,
  IconMessage,
  IconNotification,
  IconBell,
  IconQuestion,
  IconExclamation,
  IconWarning
} from '@arco-design/web-vue/es/icon'

// 消息提示（从我们的工具文件导入）
export { default as message, success, error, warning, info, loading, clear, businessMessage } from './message'

/**
 * 企业后台常用配置
 */
export const arcoConfig = {
  // 表格默认配置
  table: {
    size: 'medium',
    bordered: { wrapper: true, cell: true },
    stripe: true,
    hoverable: true,
    pagination: {
      showTotal: true,
      showJumper: true,
      showPageSize: true,
      pageSizeOptions: [10, 20, 50, 100]
    }
  },
  
  // 表单默认配置
  form: {
    layout: 'vertical',
    size: 'medium',
    autoLabelWidth: true,
    validateTrigger: 'blur'
  },
  
  // 按钮默认配置
  button: {
    size: 'medium'
  },
  
  // 输入框默认配置
  input: {
    size: 'medium',
    allowClear: true
  },
  
  // 选择器默认配置
  select: {
    size: 'medium',
    allowClear: true,
    allowSearch: true,
    filterOption: true
  },
  
  // 模态框默认配置
  modal: {
    width: 520,
    maskClosable: false,
    escToClose: true
  },
  
  // 抽屉默认配置
  drawer: {
    width: 520,
    maskClosable: false,
    escToClose: true
  }
}

/**
 * 主题色彩配置
 */
export const themeColors = {
  primary: '#165DFF',
  success: '#00B42A',
  warning: '#FF7D00',
  danger: '#F53F3F',
  info: '#909399',
  
  // 中性色
  text: {
    primary: '#1D2129',
    regular: '#4E5969',
    secondary: '#86909C',
    placeholder: '#C9CDD4',
    disabled: '#C9CDD4'
  },
  
  // 背景色
  bg: {
    primary: '#FFFFFF',
    secondary: '#F7F8FA',
    tertiary: '#F2F3F5',
    quaternary: '#E5E6EB'
  },
  
  // 边框色
  border: {
    primary: '#E5E6EB',
    secondary: '#F2F3F5',
    tertiary: '#C9CDD4'
  }
}