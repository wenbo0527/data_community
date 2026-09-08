/**
 * 权限申请模块的类型定义
 */

// 资源类型枚举
export const ResourceType = {
  TABLE: 'table',
  METRIC: 'metric',
  VARIABLE: 'variable',
  EXTERNAL_DATA: 'external_data',
  COLLECTION: 'collection',
  SERVICE: 'service'
};

// 权限类型枚举
export const PermissionType = {
  VIEW: 'view',      // 查看
  EDIT: 'edit',      // 编辑
  CALL: 'call',      // 调用
  SUBSCRIBE: 'subscribe' // 订阅
};

// 数据权限类型枚举
export const DataPermissionType = {
  SELECT: 'SELECT',
  UPDATE: 'UPDATE',
  INSERT: 'INSERT',
  DELETE: 'DELETE',
  EXECUTE: 'EXECUTE'
};

// 敏感等级枚举
export const SensitivityLevel = {
  NORMAL: 'normal',    // 普通
  SENSITIVE: 'sensitive', // 敏感
  CORE: 'core'      // 核心
};

// 申请状态枚举
export const ApplicationStatus = {
  PENDING: 'pending',    // 待审批
  APPROVED: 'approved',  // 已通过
  REJECTED: 'rejected',  // 已拒绝
  PROCESSING: 'processing', // 审批中
  EXPIRED: 'expired'    // 已过期
};

// 审批级别枚举
export const ApprovalLevel = {
  LEVEL_1: 1, // 一级审批（直属上级）
  LEVEL_2: 2, // 二级审批（直属上级→数据管理员）
  LEVEL_3: 3, // 三级审批（直属上级→业务负责人→数据管理员）
  DUAL: 'dual' // 双审批（直属上级→技术负责人）
};

// 申请期限类型
export const ApplicationDuration = {
  PERMANENT: 'permanent', // 永久
  TEMPORARY: 'temporary' // 临时
};

// 资源基础信息
export class ResourceInfo {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.type = data.type || ResourceType.TABLE;
    this.databaseType = data.databaseType || '';
    this.businessModule = data.businessModule || '';
    this.sensitivityLevel = data.sensitivityLevel || SensitivityLevel.NORMAL;
    this.businessTerms = data.businessTerms || [];
    this.description = data.description || '';
    this.owner = data.owner || '';
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }
}

// 权限申请信息
export class PermissionApplication {
  constructor(data = {}) {
    this.id = data.id || '';
    this.applicantId = data.applicantId || '';
    this.applicantName = data.applicantName || '';
    this.resources = data.resources || [];
    this.permissionTypes = data.permissionTypes || [];
    this.duration = data.duration || ApplicationDuration.PERMANENT;
    this.expireDate = data.expireDate || null;
    this.reason = data.reason || '';
    this.status = data.status || ApplicationStatus.PENDING;
    this.approvalLevel = data.approvalLevel || ApprovalLevel.LEVEL_1;
    this.currentApprover = data.currentApprover || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.approvalHistory = data.approvalHistory || [];
  }
}

// 审批记录
export class ApprovalRecord {
  constructor(data = {}) {
    this.id = data.id || '';
    this.applicationId = data.applicationId || '';
    this.approverId = data.approverId || '';
    this.approverName = data.approverName || '';
    this.approverRole = data.approverRole || '';
    this.action = data.action || '';
    this.comment = data.comment || '';
    this.createdAt = data.createdAt || null;
  }
}

// 权限信息
export class PermissionInfo {
  constructor(data = {}) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.resourceId = data.resourceId || '';
    this.resourceType = data.resourceType || ResourceType.TABLE;
    this.permissionType = data.permissionType || PermissionType.VIEW;
    this.grantedAt = data.grantedAt || null;
    this.expireAt = data.expireAt || null;
    this.grantedBy = data.grantedBy || '';
    this.applicationId = data.applicationId || '';
  }
}

// 冲突检测类型
export const ConflictType = {
  DUPLICATE: 'duplicate',      // 重复申请
  ALREADY_HAS_PERMISSION: 'already_has_permission', // 已拥有权限
  PERMISSION_CONFLICT: 'permission_conflict', // 权限互斥
  RESOURCE_NOT_EXIST: 'resource_not_exist'   // 资源不存在
};

// 冲突信息
export class ConflictInfo {
  constructor(data = {}) {
    this.type = data.type || ConflictType.DUPLICATE;
    this.resourceId = data.resourceId || '';
    this.resourceName = data.resourceName || '';
    this.conflictReason = data.conflictReason || '';
    this.suggestion = data.suggestion || '';
  }
}