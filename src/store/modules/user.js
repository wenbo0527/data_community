import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户角色信息
    isNewUser: false,
    userInfo: {
      username: '张三',
      avatar: '',
      role: 'regular', // 'new' | 'regular'
      department: 'risk', // 'risk' | 'marketing' | 'data'
      token: 'mock-token-123456' // 添加token字段，避免路由守卫跳转到登录页
    },
    // 新人数据
    newUserData: {
      currentStep: 0,
      guideProgress: 0,
      lastLoginTime: null
    },
    // 常规用户数据
    regularUserData: {
      coreMetrics: [
        {
          title: '本月数据调用量',
          value: 12345,
          trend: 'up'
        },
        {
          title: '数据覆盖率',
          value: 95.8,
          trend: 'up'
        },
        {
          title: '数据质量分',
          value: 92.5,
          trend: 'down'
        }
      ],
      todoList: [
        {
          ticketId: 'T2024011601',
          title: '数据质量异常处理',
          type: '质量管理',
          priority: '高',
          status: '待处理',
          deadline: '2024-01-16 18:00',
          description: '数据质量监控发现异常，需要及时处理'
        },
        {
          ticketId: 'T2024011602',
          title: '数据接口变更评审',
          type: '变更管理',
          priority: '中',
          status: '待评审',
          deadline: '2024-01-17 12:00',
          description: '新增数据接口需要进行安全评审'
        },
        {
          ticketId: 'T2024011603',
          title: '权限申请审批',
          type: '权限管理',
          priority: '低',
          status: '待审批',
          deadline: '2024-01-18 15:00',
          description: '用户申请数据访问权限，需要进行审批'
        }
      ]
    }
  }),
  
  actions: {
    // 设置用户角色
    setUserRole(role) {
      this.userInfo.role = role
      this.isNewUser = role === 'new'
    },

    // 设置用户部门
    setUserDepartment(department) {
      this.userInfo.department = department
    },
    
    // 更新新人引导进度
    updateGuideProgress(step) {
      if (this.isNewUser) {
        this.newUserData.currentStep = step
        this.newUserData.guideProgress = Math.min(100, (step / 4) * 100)
      }
    },
    
    // 模拟登录后的角色判断
    async checkUserRole() {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟新用户判断逻辑：根据最后登录时间
      const lastLoginTime = localStorage.getItem('lastLoginTime')
      const isNewUser = !lastLoginTime
      
      this.setUserRole(isNewUser ? 'new' : 'regular')
      
      // 更新最后登录时间
      const currentTime = new Date().toISOString()
      localStorage.setItem('lastLoginTime', currentTime)
      this.newUserData.lastLoginTime = currentTime
      
      return this.isNewUser
    }
  }
})