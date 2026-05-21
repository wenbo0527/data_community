import { NotificationType } from '@/types/community';
import {
  IconNotification,
  IconSafe,
  IconBulb,
  IconBook,
  IconUserGroup
} from '@arco-design/web-vue/es/icon';

/**
 * 通知类型显示名称映射 (二级分类)
 */
export const NOTICE_TYPE_MAP: Record<string, string> = {
  [NotificationType.GENERAL]: '普通通知',
  [NotificationType.DATA_SERVICE]: '数据服务',
  [NotificationType.ANNOUNCEMENT]: '公告',
  [NotificationType.ACTIVITY]: '活动资讯',
  [NotificationType.UPDATE]: '更新',
  [NotificationType.POLICY_NOTICE]: '政策通知',
  [NotificationType.PRODUCT_NEWS]: '产品消息',
  [NotificationType.TENCENT_CLOUD_DYNAMIC]: '腾讯云动态',
  [NotificationType.PERSONNEL_DYNAMIC]: '人事动态',
  // 新增二级分类
  'policy-law': '法律法规',
  'policy-management': '管理办法',
  'policy-standard': '标准规范',
  'cases-analytics': '数据分析',
  'cases-ml': '机器学习',
  'cases-visualization': '数据可视化',
  'guide-basic': '基础操作',
  'guide-advanced': '高级功能',
  'guide-troubleshooting': '故障排除',
  'news-announcement': '公告通知',
  'news-activity': '活动资讯',
  'news-update': '更新日志',
  'data_asset_change': '数据资产变更',
  'other': '其他'
};

/**
 * 归档分类树形结构 (一、二级分类)
 */
export const ARCHIVE_CATEGORY_TREE = [
  {
    value: 'policy',
    label: '政策制度',
    children: [
      { value: 'policy-law', label: '法律法规' },
      { value: 'policy-management', label: '管理办法' },
      { value: 'policy-standard', label: '标准规范' }
    ]
  },
  {
    value: 'cases',
    label: '实践案例',
    children: [
      { value: 'cases-analytics', label: '数据分析' },
      { value: 'cases-ml', label: '机器学习' },
      { value: 'cases-visualization', label: '数据可视化' }
    ]
  },
  {
    value: 'guide',
    label: '操作指南',
    children: [
      { value: 'guide-basic', label: '基础操作' },
      { value: 'guide-advanced', label: '高级功能' },
      { value: 'guide-troubleshooting', label: '故障排除' }
    ]
  },
  {
    value: 'news',
    label: '社区动态',
    children: [
      { value: 'news-announcement', label: '公告通知' },
      { value: 'news-activity', label: '活动资讯' },
      { value: 'news-update', label: '更新日志' }
    ]
  },
  {
    value: 'data_service',
    label: '数据服务',
    children: [
      { value: 'data_asset_change', label: '数据资产变更' },
      { value: 'other', label: '其他' }
    ]
  }
];

/**
 * 一级分类映射
 */
export const CATEGORY_MAP: Record<string, string> = {
  'policy': '政策制度',
  'cases': '实践案例',
  'guide': '操作指南',
  'news': '社区动态',
  'data_service': '数据服务'
};

/**
 * 通知类型颜色映射
 */
export const NOTICE_TYPE_COLOR_MAP: Record<string, string> = {
  [NotificationType.GENERAL]: 'gray',
  [NotificationType.DATA_SERVICE]: 'arcoblue',
  [NotificationType.ANNOUNCEMENT]: 'orange',
  [NotificationType.ACTIVITY]: 'red',
  [NotificationType.UPDATE]: 'green',
  [NotificationType.POLICY_NOTICE]: 'purple',
  [NotificationType.PRODUCT_NEWS]: 'blue',
  [NotificationType.TENCENT_CLOUD_DYNAMIC]: 'orange',
  [NotificationType.PERSONNEL_DYNAMIC]: 'cyan'
};

/**
 * 通知类型图标映射
 */
export const NOTICE_TYPE_ICON_MAP: Record<string, any> = {
  [NotificationType.GENERAL]: IconNotification,
  [NotificationType.DATA_SERVICE]: IconSafe,
  [NotificationType.ANNOUNCEMENT]: IconBulb,
  [NotificationType.ACTIVITY]: IconBulb,
  [NotificationType.UPDATE]: IconBook,
  [NotificationType.POLICY_NOTICE]: IconSafe,
  [NotificationType.PRODUCT_NEWS]: IconBulb,
  [NotificationType.TENCENT_CLOUD_DYNAMIC]: IconBulb,
  [NotificationType.PERSONNEL_DYNAMIC]: IconUserGroup
};

/**
 * 通知类型选项列表
 */
export const NOTICE_TYPE_OPTIONS = Object.entries(NOTICE_TYPE_MAP).map(([value, label]) => ({
  value,
  label
}));

/**
 * 获取一级分类显示名称
 */
export const getCategoryLabel = (id: string): string => {
  return CATEGORY_MAP[id] || id || '未知分类';
};

/**
 * 获取通知类型显示名称
 */
export const getNoticeTypeLabel = (type: string): string => {
  return NOTICE_TYPE_MAP[type] || type || '未知';
};

/**
 * 获取通知类型对应的颜色
 */
export const getNoticeTypeColor = (type: string): string => {
  return NOTICE_TYPE_COLOR_MAP[type] || 'gray';
};

/**
 * 获取通知类型对应的图标
 */
export const getNoticeTypeIcon = (type: string): any => {
  return NOTICE_TYPE_ICON_MAP[type] || IconNotification;
};
