/**
 * AlertRules API 模块
 * 为 @/api/alertRules 路径提供导出
 */
import { alertRulesAPI } from './alert'

export const {
  getAll,
  getActive,
  getById,
  create,
  update,
  delete: deleteRule,
  toggleStatus
} = alertRulesAPI

// 兼容函数别名
export const getAllAlertRules = alertRulesAPI.getAll
export const getActiveAlertRules = alertRulesAPI.getActive
export const getRuleById = alertRulesAPI.getById
export const createAlertRule = alertRulesAPI.create
export const updateAlertRule = alertRulesAPI.update
export const deleteAlertRule = alertRulesAPI.delete
export const toggleAlertRuleStatus = alertRulesAPI.toggleStatus
export const addAlertRule = alertRulesAPI.create

export default {
  getAllAlertRules,
  getActiveAlertRules,
  getRuleById,
  createAlertRule,
  updateAlertRule,
  deleteAlertRule,
  toggleAlertRuleStatus,
  addAlertRule
}
