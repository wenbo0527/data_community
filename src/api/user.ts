/**
 * 用户 API(Mock 实现)
 *
 * 提供 ForwardModal 等页面需要的用户查询 API
 */
export async function getApproverUsers(params: { keyword?: string } = {}) {
  await new Promise(r => setTimeout(r, 100))
  return [
    { id: 'user-zhangsan', name: '张三', department: '数据团队', role: '数据 Owner' },
    { id: 'user-lisi', name: '李四', department: '风控中心', role: '风控 Owner' },
    { id: 'user-wangwu', name: '王五', department: '用户价值组', role: '数据 Owner' },
    { id: 'user-zhaosi', name: '赵六', department: '行为平台', role: '数据 Owner' },
    { id: 'user-yingxiao', name: '营销经理', department: '营销部', role: '业务 Owner' },
    { id: 'user-yunying', name: '王运营', department: '运营部', role: '业务 Owner' },
    { id: 'user-fengkong', name: '风控值班', department: '风控中心', role: '数据 Owner' },
    { id: 'user-caiwu', name: '财务主管', department: '财务部', role: '数据 Owner' },
    { id: 'user-xindai', name: '信贷经理', department: '信贷部', role: '数据 Owner' },
    { id: 'user-chanpin', name: '产品经理', department: '产品部', role: '业务 Owner' }
  ]
}

export async function getUserById(id: string) {
  const users = await getApproverUsers()
  return users.find(u => u.id === id)
}

export async function searchUsers(keyword: string) {
  const users = await getApproverUsers()
  if (!keyword) return users
  return users.filter(u =>
    u.name.includes(keyword) || u.department.includes(keyword) || u.role.includes(keyword)
  )
}

export default { getApproverUsers, getUserById, searchUsers }