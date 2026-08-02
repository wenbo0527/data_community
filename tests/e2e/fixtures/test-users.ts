/**
 * 测试用户 Fixtures(E2E)
 */

import type { CustomerProfileSummary } from '../../../src/mock/shared/customer-directory'

export const TEST_USERS = [
  { userId: 'user-zhangsan', userName: '张三', department: '数据团队', role: 'data_engineer' },
  { userId: 'user-zhaosi', userName: '赵六', department: '数据团队', role: 'data_engineer' },
  { userId: 'user-wangwu', userName: '王五', department: '数据团队', role: 'data_engineer' },
  { userId: 'user-fengkong', userName: '风控值班', department: '风控团队', role: 'risk_analyst' },
  { userId: 'user-xindai', userName: '信贷经理', department: '信贷团队', role: 'loan_manager' },
  { userId: 'user-yunying', userName: '王运营', department: '运营团队', role: 'operation_lead' },
  { userId: 'user-yingxiao', userName: '营销经理', department: '营销团队', role: 'marketing_lead' },
  { userId: 'user-chanpin', userName: '产品经理', department: '产品团队', role: 'product_manager' },
  { userId: 'user-caiwu', userName: '财务主管', department: '财务团队', role: 'finance_lead' },
  { userId: 'user-system', userName: '系统账户', department: 'IT 团队', role: 'admin' }
]

/**
 * 测试客户 ID(供客户 360 测试用)
 */
export const TEST_CUSTOMERS = ['C001', 'C005', 'C008', 'C020']

/**
 * 测试表名
 */
export const TEST_TABLES = ['dim_user', 'fact_loan_apply', 'fact_user_event', 'dws_user_value']