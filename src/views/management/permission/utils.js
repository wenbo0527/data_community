/**
 * 权限申请模块的工具函数
 */

import {
  SensitivityLevel,
  ApprovalLevel,
  PermissionType,
  DataPermissionType,
  ApplicationDuration,
  ConflictType
} from './types';
import DateUtils from '@/utils/dateUtils';

/**
 * 根据敏感等级确定审批级别
 * @param {string} sensitivityLevel - 敏感等级
 * @param {string} resourceType - 资源类型
 * @returns {number|string} 审批级别
 */
export function getApprovalLevel(sensitivityLevel, resourceType) {
  if (resourceType === 'service') {
    return ApprovalLevel.DUAL;
  }
  
  switch (sensitivityLevel) {
    case SensitivityLevel.NORMAL:
      return ApprovalLevel.LEVEL_1;
    case SensitivityLevel.SENSITIVE:
      return ApprovalLevel.LEVEL_2;
    case SensitivityLevel.CORE:
      return ApprovalLevel.LEVEL_3;
    default:
      return ApprovalLevel.LEVEL_1;
  }
}

/**
 * 获取审批级别描述
 * @param {number|string} approvalLevel - 审批级别
 * @returns {string} 描述文本
 */
export function getApprovalLevelDescription(approvalLevel) {
  switch (approvalLevel) {
    case ApprovalLevel.LEVEL_1:
      return '一级审批（直属上级）';
    case ApprovalLevel.LEVEL_2:
      return '二级审批（直属上级→数据管理员）';
    case ApprovalLevel.LEVEL_3:
      return '三级审批（直属上级→业务负责人→数据管理员）';
    case ApprovalLevel.DUAL:
      return '双审批（直属上级→技术负责人）';
    default:
      return '一级审批（直属上级）';
  }
}

/**
 * 应用权限到数据权限的映射
 * @param {string} appPermission - 应用权限类型
 * @returns {string[]} 对应的数据权限类型数组
 */
export function mapAppPermissionToDataPermission(appPermission) {
  const mapping = {
    [PermissionType.VIEW]: [DataPermissionType.SELECT],
    [PermissionType.EDIT]: [DataPermissionType.SELECT, DataPermissionType.UPDATE, DataPermissionType.INSERT],
    [PermissionType.CALL]: [DataPermissionType.EXECUTE],
    [PermissionType.SUBSCRIBE]: [DataPermissionType.SELECT]
  };
  
  return mapping[appPermission] || [DataPermissionType.SELECT];
}

/**
 * 数据权限到应用权限的映射
 * @param {string[]} dataPermissions - 数据权限类型数组
 * @returns {string} 应用权限类型
 */
export function mapDataPermissionToAppPermission(dataPermissions) {
  if (dataPermissions.includes(DataPermissionType.UPDATE) || 
      dataPermissions.includes(DataPermissionType.INSERT)) {
    return PermissionType.EDIT;
  }
  if (dataPermissions.includes(DataPermissionType.EXECUTE)) {
    return PermissionType.CALL;
  }
  if (dataPermissions.includes(DataPermissionType.SELECT)) {
    return PermissionType.VIEW;
  }
  return PermissionType.VIEW;
}

/**
 * 获取敏感等级标签配置
 * @param {string} sensitivityLevel - 敏感等级
 * @returns {object} 标签配置
 */
export function getSensitivityLabelConfig(sensitivityLevel) {
  const configs = {
    [SensitivityLevel.NORMAL]: {
      text: '普通',
      color: 'green',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    [SensitivityLevel.SENSITIVE]: {
      text: '敏感',
      color: 'orange',
      bgColor: '#fff7e6',
      borderColor: '#ffd591'
    },
    [SensitivityLevel.CORE]: {
      text: '核心',
      color: 'red',
      bgColor: '#fff1f0',
      borderColor: '#ffa39e'
    }
  };
  
  return configs[sensitivityLevel] || configs[SensitivityLevel.NORMAL];
}

/**
 * 获取申请状态标签配置
 * @param {string} status - 申请状态
 * @returns {object} 标签配置
 */
export function getStatusLabelConfig(status) {
  const configs = {
    pending: {
      text: '待审批',
      color: 'orange',
      bgColor: '#fff7e6',
      borderColor: '#ffd591'
    },
    approved: {
      text: '已通过',
      color: 'green',
      bgColor: '#f6ffed',
      borderColor: '#b7eb8f'
    },
    rejected: {
      text: '已拒绝',
      color: 'red',
      bgColor: '#fff1f0',
      borderColor: '#ffa39e'
    },
    processing: {
      text: '审批中',
      color: 'blue',
      bgColor: '#e6f7ff',
      borderColor: '#91d5ff'
    },
    expired: {
      text: '已过期',
      color: 'gray',
      bgColor: '#fafafa',
      borderColor: '#d9d9d9'
    }
  };
  
  return configs[status] || configs.pending;
}

/**
 * 格式化申请期限
 * @param {string} duration - 期限类型
 * @param {Date|null} expireDate - 到期日期
 * @returns {string} 格式化文本
 */
export function formatDuration(duration, expireDate) {
  if (duration === ApplicationDuration.PERMANENT) {
    return '永久';
  }
  
  if (expireDate) {
    return `临时（至 ${DateUtils.formatDate(expireDate)}）`;
  }
  
  return '临时';
}

/**
 * 检测权限冲突
 * @param {Array} resources - 申请的资源列表
 * @param {Array} existingPermissions - 已有权限列表
 * @returns {Array} 冲突信息数组
 */
export function detectPermissionConflicts(resources, existingPermissions) {
  const conflicts = [];
  
  resources.forEach(resource => {
    // 检测重复申请
    const duplicateApplications = resources.filter(r => 
      r.id === resource.id && r !== resource
    );
    
    if (duplicateApplications.length > 0) {
      conflicts.push({
        type: ConflictType.DUPLICATE,
        resourceId: resource.id,
        resourceName: resource.name,
        conflictReason: '同一资源被多次申请',
        suggestion: '请移除重复的资源申请'
      });
    }
    
    // 检测已拥有权限
    const existingPermission = existingPermissions.find(p => 
      p.resourceId === resource.id
    );
    
    if (existingPermission) {
      conflicts.push({
        type: ConflictType.ALREADY_HAS_PERMISSION,
        resourceId: resource.id,
        resourceName: resource.name,
        conflictReason: '您已拥有该资源的权限',
        suggestion: '无需重复申请，可直接使用'
      });
    }
  });
  
  return conflicts;
}

/**
 * 生成申请编号
 * @returns {string} 申请编号
 */
export function generateApplicationNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `APP${timestamp}${random}`;
}

/**
 * 验证申请理由
 * @param {string} reason - 申请理由
 * @returns {object} 验证结果
 */
export function validateApplicationReason(reason) {
  if (!reason || reason.trim().length === 0) {
    return {
      valid: false,
      message: '申请理由不能为空'
    };
  }
  
  if (reason.trim().length < 10) {
    return {
      valid: false,
      message: '申请理由至少需要10个字符'
    };
  }
  
  if (reason.trim().length > 500) {
    return {
      valid: false,
      message: '申请理由不能超过500个字符'
    };
  }
  
  return {
    valid: true,
    message: ''
  };
}

/**
 * 获取权限申请模板
 * @returns {Array} 申请理由模板列表
 */
export function getApplicationReasonTemplates() {
  return [
    {
      id: 'business_analysis',
      name: '业务分析',
      content: '因业务分析需要，申请访问相关数据资源，用于制作业务报表和分析报告。'
    },
    {
      id: 'data_development',
      name: '数据开发',
      content: '因数据开发需要，申请访问相关数据资源，用于数据清洗、转换和建模工作。'
    },
    {
      id: 'system_integration',
      name: '系统集成',
      content: '因系统集成需要，申请访问相关数据资源，用于接口开发和数据同步。'
    },
    {
      id: 'compliance_audit',
      name: '合规审计',
      content: '因合规审计需要，申请访问相关数据资源，用于审计检查和合规验证。'
    },
    {
      id: 'emergency_response',
      name: '应急响应',
      content: '因应急响应需要，申请访问相关数据资源，用于问题排查和故障处理。'
    }
  ];
}

/**
 * 格式化时间戳
 * @param {number|string} timestamp - 时间戳
 * @returns {string} 格式化时间
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 计算剩余有效期
 * @param {Date|string} expireAt - 到期时间
 * @returns {object} 剩余时间信息
 */
export function calculateRemainingTime(expireAt) {
  if (!expireAt) return { days: -1, text: '永久有效' };
  
  const now = new Date();
  const expire = new Date(expireAt);
  const diffTime = expire - now;
  
  if (diffTime <= 0) {
    return { days: 0, text: '已过期' };
  }
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    return { days: diffDays, text: `${diffDays}天后过期`, urgent: true };
  } else if (diffDays <= 30) {
    return { days: diffDays, text: `${Math.ceil(diffDays / 7)}周后过期` };
  } else {
    return { days: diffDays, text: `${Math.ceil(diffDays / 30)}个月后过期` };
  }
}
