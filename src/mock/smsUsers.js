// 预设短信用户数据
export const smsPresetUsers = [
  {
    id: 'user001',
    name: '张三',
    phone: '13800138000',
    department: '市场营销部',
    role: 'manager',
    email: 'zhangsan@company.com'
  },
  {
    id: 'user002',
    name: '李四',
    phone: '13900139000',
    department: '运营管理部',
    role: 'operator',
    email: 'lisi@company.com'
  },
  {
    id: 'user003',
    name: '王五',
    phone: '13700137000',
    department: '技术部',
    role: 'manager',
    email: 'wangwu@company.com'
  },
  {
    id: 'user004',
    name: '赵六',
    phone: '13600136000',
    department: '客服部',
    role: 'operator',
    email: 'zhaoliu@company.com'
  },
  {
    id: 'user005',
    name: '钱七',
    phone: '13500135000',
    department: '产品部',
    role: 'observer',
    email: 'qianqi@company.com'
  },
  {
    id: 'user006',
    name: '孙八',
    phone: '13400134000',
    department: '数据分析部',
    role: 'manager',
    email: 'sunba@company.com'
  }
]

// 获取所有预设用户
export const getAllSmsPresetUsers = () => {
  return [...smsPresetUsers]
}

// 根据角色筛选用户
export const getSmsUsersByRole = (role) => {
  if (!role) return getAllSmsPresetUsers()
  return smsPresetUsers.filter(user => user.role === role)
}

// 根据部门筛选用户
export const getSmsUsersByDepartment = (department) => {
  if (!department) return getAllSmsPresetUsers()
  return smsPresetUsers.filter(user => user.department === department)
}

// 搜索用户
export const searchSmsUsers = (keyword) => {
  if (!keyword) return getAllSmsPresetUsers()
  const lowerKeyword = keyword.toLowerCase()
  return smsPresetUsers.filter(user => 
    user.name.toLowerCase().includes(lowerKeyword) ||
    user.phone.includes(keyword) ||
    user.department.toLowerCase().includes(lowerKeyword)
  )
}