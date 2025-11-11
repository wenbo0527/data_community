// 短信用户相关 API

import { smsPresetUsers, getAllSmsPresetUsers, getSmsUsersByRole, getSmsUsersByDepartment, searchSmsUsers } from '../mock/smsUsers.js'

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 获取所有预设短信用户
export const getSmsPresetUsers = async (params = {}) => {
  await delay()
  const { role, department, search } = params
  
  let users = getAllSmsPresetUsers()
  
  // 按角色筛选
  if (role) {
    users = getSmsUsersByRole(role)
  }
  
  // 按部门筛选
  if (department) {
    users = getSmsUsersByDepartment(department)
  }
  
  // 搜索
  if (search) {
    users = searchSmsUsers(search)
  }
  
  return {
    success: true,
    data: users
  }
}

// 获取短信用户角色列表
export const getSmsUserRoles = async () => {
  await delay()
  const roles = [
    { value: 'manager', label: '管理员' },
    { value: 'operator', label: '操作员' },
    { value: 'observer', label: '观察员' }
  ]
  
  return {
    success: true,
    data: roles
  }
}

// 获取短信用户部门列表
export const getSmsUserDepartments = async () => {
  await delay()
  const departments = [
    { value: '市场营销部', label: '市场营销部' },
    { value: '运营管理部', label: '运营管理部' },
    { value: '技术部', label: '技术部' },
    { value: '客服部', label: '客服部' },
    { value: '产品部', label: '产品部' },
    { value: '数据分析部', label: '数据分析部' }
  ]
  
  return {
    success: true,
    data: departments
  }
}