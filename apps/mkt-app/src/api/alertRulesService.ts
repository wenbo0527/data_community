/**
 * AlertRules Service 模块
 * 为 @/api/alertRulesService 路径提供导出
 */
import { alertRulesAPI } from './alert'

export const createAlertRule = alertRulesAPI.create
export const updateAlertRule = alertRulesAPI.update
export const getRuleById = alertRulesAPI.getById

export default {
  createAlertRule,
  updateAlertRule,
  getRuleById
}
