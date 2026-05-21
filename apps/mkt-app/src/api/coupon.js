// 优惠券相关API接口

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 券模板相关API
export const templateAPI = {
  // 获取券模板列表
  async getTemplateList(params = {}) {
    await delay(500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        list: [
          {
            id: 'TPL001',
            name: '新人专享券',
            type: 'interest_free',
            status: 'online',
            createTime: '2024-01-15 10:30:00',
            creator: '张三',
            validityPeriod: ['2024-01-01', '2024-12-31'],
            applicableScope: '全产品'
          }
        ],
        total: 1,
        current: params.current || 1,
        pageSize: params.pageSize || 10
      },
      message: 'success'
    }
  },

  // 创建券模板
  async createTemplate(data) {
    await delay(1000)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        id: 'TPL' + Date.now(),
        ...data
      },
      message: '创建成功'
    }
  },

  // 更新券模板
  async updateTemplate(id, data) {
    await delay(800)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: { id, ...data },
      message: '更新成功'
    }
  },

  // 删除券模板
  async deleteTemplate(id) {
    await delay(500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      message: '删除成功'
    }
  },

  // 上线/下线券模板
  async toggleTemplateStatus(id, status) {
    await delay(600)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: { id, status },
      message: status === 'online' ? '上线成功' : '下线成功'
    }
  }
}

// 券库存相关API
export const inventoryAPI = {
  // 获取库存列表
  async getInventoryList(params = {}) {
    await delay(800)
    
    const mockData = [
      {
        id: '1',
        userId: 'U001',
        couponId: 'CPN001',
        templateId: 'TPL001',
        couponName: '新用户专享免息券',
        couponType: 'interest_free',
        startTime: '2024-01-15 00:00:00',
        endTime: '2024-12-31 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '张三',
        applicantDept: '营销部',
        applyTime: '2024-01-15 10:30:00',
        approver: '李四',
        priority: 'high',
        reason: '新用户获客活动需要，预计发放1万张券'
      },
      {
        id: '2',
        userId: 'U002',
        couponId: 'CPN002',
        templateId: 'TPL002',
        couponName: '老用户回馈折扣券',
        couponType: 'discount',
        startTime: '2024-01-20 00:00:00',
        endTime: '2024-06-30 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '王五',
        applicantDept: '客户部',
        applyTime: '2024-01-20 14:20:00',
        approver: '赵六',
        approvalTime: '2024-01-21 09:15:00',
        priority: 'medium',
        reason: '老用户回馈活动'
      },
      {
        id: '3',
        userId: 'U003',
        couponId: 'CPN003',
        templateId: 'TPL003',
        couponName: '节日特惠券',
        couponType: 'reduction',
        startTime: '2024-02-01 00:00:00',
        endTime: '2024-02-29 23:59:59',
        status: 'expired',
        approvalStatus: 'rejected',
        applicant: '孙七',
        applicantDept: '运营部',
        applyTime: '2024-02-01 09:00:00',
        approver: '周八',
        approvalTime: '2024-02-01 16:30:00',
        priority: 'low',
        reason: '节日促销活动',
        rejectReason: '当前库存充足，暂不需要新增'
      },
      {
        id: '4',
        userId: 'U004',
        couponId: 'CPN004',
        templateId: 'TPL004',
        couponName: '生日专属券',
        couponType: 'interest_free',
        startTime: '2024-03-01 00:00:00',
        endTime: '2024-12-31 23:59:59',
        status: 'received',
        approvalStatus: 'none'
      },
      // 新增待审批数据
      {
        id: '5',
        userId: 'U005',
        couponId: 'CPN005',
        templateId: 'TPL005',
        couponName: '春季促销免息券',
        couponType: 'interest_free',
        startTime: '2024-03-15 00:00:00',
        endTime: '2024-05-31 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '陈九',
        applicantDept: '营销部',
        applyTime: '2024-03-10 14:30:00',
        approver: '刘十',
        priority: 'high',
        reason: '春季促销活动，预计发放5000张免息券提升用户活跃度'
      },
      {
        id: '6',
        userId: 'U006',
        couponId: 'CPN006',
        templateId: 'TPL006',
        couponName: '会员专享8折券',
        couponType: 'discount',
        startTime: '2024-03-20 00:00:00',
        endTime: '2024-06-20 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴十一',
        applicantDept: '会员部',
        applyTime: '2024-03-18 11:20:00',
        approver: '郑十二',
        priority: 'medium',
        reason: '会员权益升级，为VIP会员提供专属折扣优惠'
      },
      {
        id: '7',
        userId: 'U007',
        couponId: 'CPN007',
        templateId: 'TPL007',
        couponName: '复借用户立减券',
        couponType: 'reduction',
        startTime: '2024-03-25 00:00:00',
        endTime: '2024-07-25 23:59:59',
        status: 'locked',
        approvalStatus: 'pending',
        applicant: '王十三',
        applicantDept: '风控部',
        applyTime: '2024-03-22 16:45:00',
        approver: '李十四',
        priority: 'medium',
        reason: '复借用户激励计划，通过立减优惠提升复借率'
      },
      {
        id: '8',
        userId: 'U008',
        couponId: 'CPN008',
        templateId: 'TPL008',
        couponName: '新手体验免息券',
        couponType: 'interest_free',
        startTime: '2024-04-01 00:00:00',
        endTime: '2024-09-30 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '张十五',
        applicantDept: '产品部',
        applyTime: '2024-03-28 09:30:00',
        approver: '赵十六',
        priority: 'high',
        reason: '新手引导体验优化，降低新用户使用门槛'
      },
      {
        id: '9',
        userId: 'U009',
        couponId: 'CPN009',
        templateId: 'TPL009',
        couponName: '周年庆特惠券',
        couponType: 'discount',
        startTime: '2024-04-10 00:00:00',
        endTime: '2024-04-30 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '孙十七',
        applicantDept: '市场部',
        applyTime: '2024-04-05 13:15:00',
        approver: '周十八',
        priority: 'high',
        reason: '公司周年庆活动，大力度优惠回馈用户'
      },
      {
        id: '10',
        userId: 'U010',
        couponId: 'CPN010',
        templateId: 'TPL010',
        couponName: '学生专属优惠券',
        couponType: 'reduction',
        startTime: '2024-04-15 00:00:00',
        endTime: '2024-08-31 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴十九',
        applicantDept: '教育事业部',
        applyTime: '2024-04-12 10:45:00',
        approver: '郑二十',
        priority: 'medium',
        reason: '学生群体专项服务，支持教育普惠政策'
      },
      {
        id: '11',
        userId: 'U011',
        couponId: 'CPN011',
        templateId: 'TPL011',
        couponName: '企业客户专享券',
        couponType: 'interest_free',
        startTime: '2024-04-20 00:00:00',
        endTime: '2024-10-20 23:59:59',
        status: 'locked',
        approvalStatus: 'pending',
        applicant: '王二十一',
        applicantDept: '企业服务部',
        applyTime: '2024-04-18 15:20:00',
        approver: '李二十二',
        priority: 'high',
        reason: '企业客户合作深化，提供专属金融服务支持'
      },
      {
        id: '12',
        userId: 'U012',
        couponId: 'CPN012',
        templateId: 'TPL012',
        couponName: '限时闪购券',
        couponType: 'discount',
        startTime: '2024-04-25 00:00:00',
        endTime: '2024-05-05 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '张二十三',
        applicantDept: '电商部',
        applyTime: '2024-04-23 11:30:00',
        approver: '赵二十四',
        priority: 'medium',
        reason: '五一假期限时促销活动，刺激短期消费增长'
      },
      // 新增更多mock数据
      {
        id: '13',
        userId: 'U013',
        couponId: 'CPN013',
        templateId: 'TPL013',
        couponName: '母亲节感恩券',
        couponType: 'reduction',
        startTime: '2024-05-01 00:00:00',
        endTime: '2024-05-31 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '孙二十五',
        applicantDept: '营销部',
        applyTime: '2024-04-28 14:20:00',
        approver: '周二十六',
        approvalTime: '2024-04-29 10:15:00',
        priority: 'medium',
        reason: '母亲节主题活动，感恩回馈'
      },
      {
        id: '14',
        userId: 'U014',
        couponId: 'CPN014',
        templateId: 'TPL014',
        couponName: '青年节专属免息券',
        couponType: 'interest_free',
        startTime: '2024-05-04 00:00:00',
        endTime: '2024-07-04 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴二十七',
        applicantDept: '青年事业部',
        applyTime: '2024-05-02 09:30:00',
        approver: '郑二十八',
        priority: 'high',
        reason: '青年节特别活动，支持年轻用户群体'
      },
      {
        id: '15',
        userId: 'U015',
        couponId: 'CPN015',
        templateId: 'TPL015',
        couponName: '夏季清凉折扣券',
        couponType: 'discount',
        startTime: '2024-06-01 00:00:00',
        endTime: '2024-08-31 23:59:59',
        status: 'locked',
        approvalStatus: 'pending',
        applicant: '王二十九',
        applicantDept: '季节营销部',
        applyTime: '2024-05-25 16:45:00',
        approver: '李三十',
        priority: 'medium',
        reason: '夏季主题促销，提升夏日消费热度'
      },
      {
        id: '16',
        userId: 'U016',
        couponId: 'CPN016',
        templateId: 'TPL016',
        couponName: '端午节特惠券',
        couponType: 'reduction',
        startTime: '2024-06-08 00:00:00',
        endTime: '2024-06-12 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '张三十一',
        applicantDept: '传统节日部',
        applyTime: '2024-06-01 11:20:00',
        approver: '赵三十二',
        approvalTime: '2024-06-02 14:30:00',
        priority: 'high',
        reason: '端午节传统节日营销活动'
      },
      {
        id: '17',
        userId: 'U017',
        couponId: 'CPN017',
        templateId: 'TPL017',
        couponName: '毕业季纪念券',
        couponType: 'interest_free',
        startTime: '2024-06-15 00:00:00',
        endTime: '2024-09-15 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '孙三十三',
        applicantDept: '教育合作部',
        applyTime: '2024-06-10 13:15:00',
        approver: '周三十四',
        priority: 'medium',
        reason: '毕业季特别关怀，助力毕业生就业创业'
      },
      {
        id: '18',
        userId: 'U018',
        couponId: 'CPN018',
        templateId: 'TPL018',
        couponName: '父亲节感谢券',
        couponType: 'discount',
        startTime: '2024-06-16 00:00:00',
        endTime: '2024-06-30 23:59:59',
        status: 'expired',
        approvalStatus: 'rejected',
        applicant: '吴三十五',
        applicantDept: '家庭服务部',
        applyTime: '2024-06-12 10:45:00',
        approver: '郑三十六',
        approvalTime: '2024-06-13 15:20:00',
        priority: 'low',
        reason: '父亲节主题活动',
        rejectReason: '与母亲节活动重复，建议合并执行'
      },
      {
        id: '19',
        userId: 'U019',
        couponId: 'CPN019',
        templateId: 'TPL019',
        couponName: '中考加油券',
        couponType: 'reduction',
        startTime: '2024-06-20 00:00:00',
        endTime: '2024-07-20 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '王三十七',
        applicantDept: '教育支持部',
        applyTime: '2024-06-15 14:30:00',
        approver: '李三十八',
        approvalTime: '2024-06-16 09:45:00',
        priority: 'high',
        reason: '中考期间学生家庭支持计划'
      },
      {
        id: '20',
        userId: 'U020',
        couponId: 'CPN020',
        templateId: 'TPL020',
        couponName: '夏日狂欢免息券',
        couponType: 'interest_free',
        startTime: '2024-07-01 00:00:00',
        endTime: '2024-08-31 23:59:59',
        status: 'locked',
        approvalStatus: 'pending',
        applicant: '张三十九',
        applicantDept: '夏季活动部',
        applyTime: '2024-06-25 11:30:00',
        approver: '赵四十',
        priority: 'high',
        reason: '夏日狂欢节大型活动配套优惠'
      },
      {
        id: '21',
        userId: 'U021',
        couponId: 'CPN021',
        templateId: 'TPL021',
        couponName: '建党节纪念券',
        couponType: 'discount',
        startTime: '2024-07-01 00:00:00',
        endTime: '2024-07-07 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '孙四十一',
        applicantDept: '党建办',
        applyTime: '2024-06-28 16:20:00',
        approver: '周四十二',
        approvalTime: '2024-06-29 08:30:00',
        priority: 'medium',
        reason: '建党节主题纪念活动'
      },
      {
        id: '22',
        userId: 'U022',
        couponId: 'CPN022',
        templateId: 'TPL022',
        couponName: '高考志愿填报券',
        couponType: 'reduction',
        startTime: '2024-07-10 00:00:00',
        endTime: '2024-08-10 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴四十三',
        applicantDept: '教育咨询部',
        applyTime: '2024-07-05 12:15:00',
        approver: '郑四十四',
        priority: 'medium',
        reason: '高考后志愿填报服务支持'
      },
      {
        id: '23',
        userId: 'U023',
        couponId: 'CPN023',
        templateId: 'TPL023',
        couponName: '暑假旅游券',
        couponType: 'interest_free',
        startTime: '2024-07-15 00:00:00',
        endTime: '2024-08-31 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '王四十五',
        applicantDept: '旅游合作部',
        applyTime: '2024-07-12 09:45:00',
        approver: '李四十六',
        priority: 'low',
        reason: '暑假旅游季节性促销活动'
      },
      {
        id: '24',
        userId: 'U024',
        couponId: 'CPN024',
        templateId: 'TPL024',
        couponName: '奥运加油折扣券',
        couponType: 'discount',
        startTime: '2024-07-26 00:00:00',
        endTime: '2024-08-11 23:59:59',
        status: 'locked',
        approvalStatus: 'approved',
        applicant: '张四十七',
        applicantDept: '体育营销部',
        applyTime: '2024-07-20 15:30:00',
        approver: '赵四十八',
        approvalTime: '2024-07-21 10:20:00',
        priority: 'high',
        reason: '奥运会期间体育主题营销'
      },
      {
        id: '25',
        userId: 'U025',
        couponId: 'CPN025',
        templateId: 'TPL025',
        couponName: '八一建军节券',
        couponType: 'reduction',
        startTime: '2024-08-01 00:00:00',
        endTime: '2024-08-07 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '孙四十九',
        applicantDept: '军民融合部',
        applyTime: '2024-07-28 14:10:00',
        approver: '周五十',
        approvalTime: '2024-07-29 11:25:00',
        priority: 'medium',
        reason: '建军节向军人致敬活动'
      },
      {
        id: '26',
        userId: 'U026',
        couponId: 'CPN026',
        templateId: 'TPL026',
        couponName: '立秋养生券',
        couponType: 'interest_free',
        startTime: '2024-08-07 00:00:00',
        endTime: '2024-09-07 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴五十一',
        applicantDept: '健康生活部',
        applyTime: '2024-08-05 13:40:00',
        approver: '郑五十二',
        priority: 'low',
        reason: '立秋节气养生主题活动'
      },
      {
        id: '27',
        userId: 'U027',
        couponId: 'CPN027',
        templateId: 'TPL027',
        couponName: '开学季学习券',
        couponType: 'discount',
        startTime: '2024-08-15 00:00:00',
        endTime: '2024-09-30 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '王五十三',
        applicantDept: '教育服务部',
        applyTime: '2024-08-12 10:20:00',
        approver: '李五十四',
        priority: 'high',
        reason: '开学季学生用品采购支持'
      },
      {
        id: '28',
        userId: 'U028',
        couponId: 'CPN028',
        templateId: 'TPL028',
        couponName: '七夕情人节券',
        couponType: 'reduction',
        startTime: '2024-08-22 00:00:00',
        endTime: '2024-08-25 23:59:59',
        status: 'expired',
        approvalStatus: 'rejected',
        applicant: '张五十五',
        applicantDept: '情感营销部',
        applyTime: '2024-08-18 16:50:00',
        approver: '赵五十六',
        approvalTime: '2024-08-19 14:15:00',
        priority: 'medium',
        reason: '七夕节情侣消费促销',
        rejectReason: '预算超支，建议调整优惠力度'
      },
      {
        id: '29',
        userId: 'U029',
        couponId: 'CPN029',
        templateId: 'TPL029',
        couponName: '处暑清凉券',
        couponType: 'interest_free',
        startTime: '2024-08-23 00:00:00',
        endTime: '2024-09-23 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '孙五十七',
        applicantDept: '节气营销部',
        applyTime: '2024-08-20 12:35:00',
        approver: '周五十八',
        approvalTime: '2024-08-21 09:40:00',
        priority: 'low',
        reason: '处暑节气主题活动'
      },
      {
        id: '30',
        userId: 'U030',
        couponId: 'CPN030',
        templateId: 'TPL030',
        couponName: '开学第一课券',
        couponType: 'discount',
        startTime: '2024-09-01 00:00:00',
        endTime: '2024-09-30 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴五十九',
        applicantDept: '教育推广部',
        applyTime: '2024-08-28 15:25:00',
        approver: '郑六十',
        priority: 'high',
        reason: '新学期开学第一课教育支持'
      },
      {
        id: '31',
        userId: 'U031',
        couponId: 'CPN031',
        templateId: 'TPL031',
        couponName: '教师节感恩券',
        couponType: 'reduction',
        startTime: '2024-09-10 00:00:00',
        endTime: '2024-09-15 23:59:59',
        status: 'locked',
        approvalStatus: 'approved',
        applicant: '王六十一',
        applicantDept: '教师关怀部',
        applyTime: '2024-09-05 11:10:00',
        approver: '李六十二',
        approvalTime: '2024-09-06 14:45:00',
        priority: 'medium',
        reason: '教师节向教育工作者致敬'
      },
      {
        id: '32',
        userId: 'U032',
        couponId: 'CPN032',
        templateId: 'TPL032',
        couponName: '中秋团圆券',
        couponType: 'interest_free',
        startTime: '2024-09-15 00:00:00',
        endTime: '2024-09-18 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '张六十三',
        applicantDept: '传统文化部',
        applyTime: '2024-09-12 13:20:00',
        approver: '赵六十四',
        priority: 'high',
        reason: '中秋节家庭团圆主题活动'
      },
      {
        id: '33',
        userId: 'U033',
        couponId: 'CPN033',
        templateId: 'TPL033',
        couponName: '秋分养生券',
        couponType: 'discount',
        startTime: '2024-09-22 00:00:00',
        endTime: '2024-10-22 23:59:59',
        status: 'received',
        approvalStatus: 'none'
      },
      {
        id: '34',
        userId: 'U034',
        couponId: 'CPN034',
        templateId: 'TPL034',
        couponName: '国庆黄金周券',
        couponType: 'reduction',
        startTime: '2024-10-01 00:00:00',
        endTime: '2024-10-07 23:59:59',
        status: 'received',
        approvalStatus: 'approved',
        applicant: '孙六十五',
        applicantDept: '假日营销部',
        applyTime: '2024-09-25 16:30:00',
        approver: '周六十六',
        approvalTime: '2024-09-26 10:15:00',
        priority: 'high',
        reason: '国庆黄金周旅游消费促销'
      },
      {
        id: '35',
        userId: 'U035',
        couponId: 'CPN035',
        templateId: 'TPL035',
        couponName: '重阳敬老券',
        couponType: 'interest_free',
        startTime: '2024-10-23 00:00:00',
        endTime: '2024-10-30 23:59:59',
        status: 'received',
        approvalStatus: 'pending',
        applicant: '吴六十七',
        applicantDept: '老年服务部',
        applyTime: '2024-10-20 14:45:00',
        approver: '郑六十八',
        priority: 'medium',
        reason: '重阳节敬老爱老主题活动'
      }
    ]
    
    // 应用过滤条件
    let filteredData = mockData
    
    // 根据搜索条件过滤数据
    if (params.couponId) {
      filteredData = filteredData.filter(item => 
        item.couponId.toLowerCase().includes(params.couponId.toLowerCase())
      )
    }
    
    if (params.templateId) {
      filteredData = filteredData.filter(item => 
        item.templateId.toLowerCase().includes(params.templateId.toLowerCase())
      )
    }
    
    if (params.userId) {
      filteredData = filteredData.filter(item => 
        item.userId.toLowerCase().includes(params.userId.toLowerCase())
      )
    }
    
    if (params.status) {
      filteredData = filteredData.filter(item => item.status === params.status)
    }
    
    if (params.approvalStatus) {
      filteredData = filteredData.filter(item => item.approvalStatus === params.approvalStatus)
    }
    
    // 分页处理
    const page = params.page || 1
    const pageSize = params.pageSize || 50
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: paginatedData,
        total: filteredData.length,
        page: page,
        pageSize: pageSize
      }
    }
  },

  // 批量撤回券
  async batchWithdraw(couponIds) {
    await delay(1000)
    
    // 模拟撤回操作
    console.log('撤回券ID:', couponIds)
    
    return {
      code: 200,
      message: '撤回成功',
      data: {
        successCount: couponIds.length,
        failedCount: 0
      }
    }
  },

  // 批量审批券库存
  async batchApproveInventory(params = {}) {
    await delay(1500)
    
    // 获取当前库存数据
    const inventoryResponse = await this.getInventoryList({ approvalStatus: 'pending' })
    const pendingItems = inventoryResponse.data.list
    
    console.log('批量审批券库存:', {
      pendingCount: pendingItems.length,
      params
    })
    
    // 模拟批量审批操作
    const results = pendingItems.map(item => ({
      id: item.id,
      couponId: item.couponId,
      couponName: item.couponName,
      status: 'success',
      message: '审批通过'
    }))
    
    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.length - successCount
    
    return {
      code: 200,
      message: `批量审批完成，成功审批 ${successCount} 个券库存`,
      data: {
        results,
        summary: {
          total: results.length,
          successCount,
          failedCount
        },
        approvalTime: new Date().toISOString()
      }
    }
  },

  // 导出券数据
  async exportCouponData(params = {}) {
    await delay(2000)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        downloadUrl: 'https://example.com/export/coupons.xlsx',
        fileName: `券库存数据_${new Date().toISOString().split('T')[0]}.xlsx`
      },
      message: '导出成功'
    }
  },

  // 批量创建券库存
  async batchCreateInventory(data) {
    await delay(2000)
    console.log('批量创建券库存请求:', data)
    
    // 模拟批量创建结果
    const results = data.templateIds.map((templateId, index) => ({
      templateId,
      inventoryId: `INV${Date.now()}_${index}`,
      status: Math.random() > 0.1 ? 'success' : 'failed', // 90%成功率
      message: Math.random() > 0.1 ? '创建成功' : '创建失败：库存配置错误'
    }))
    
    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.length - successCount
    
    return {
      code: 200,
      data: {
        batchId: `BATCH${Date.now()}`,
        results,
        summary: {
          total: results.length,
          successCount,
          failedCount
        },
        approvalId: `AP${Date.now()}` // 审批ID
      },
      message: `批量创建完成，成功${successCount}个，失败${failedCount}个`
    }
  },

  // 获取批量创建历史
  async getBatchCreateHistory(params = {}) {
    await delay(800)
    
    const mockHistory = [
      {
        id: 'BATCH001',
        usageScenario: 'batch_distribute',
        configMode: 'unified',
        templateCount: 5,
        totalInventory: 50000,
        successCount: 5,
        failedCount: 0,
        status: 'completed',
        approvalStatus: 'approved',
        operator: '张三',
        createTime: '2024-01-15 10:30:00',
        completeTime: '2024-01-15 11:00:00',
        remark: '春节活动券库存'
      },
      {
        id: 'BATCH002',
        usageScenario: 'telesales',
        configMode: 'individual',
        templateCount: 3,
        totalInventory: 15000,
        successCount: 2,
        failedCount: 1,
        status: 'partial_success',
        approvalStatus: 'approved',
        operator: '李四',
        createTime: '2024-01-20 14:20:00',
        completeTime: '2024-01-20 14:45:00',
        remark: '电销专用券库存'
      },
      {
        id: 'BATCH003',
        usageScenario: 'batch_distribute',
        configMode: 'unified',
        templateCount: 8,
        totalInventory: 80000,
        successCount: 0,
        failedCount: 8,
        status: 'failed',
        approvalStatus: 'rejected',
        operator: '王五',
        createTime: '2024-02-01 09:00:00',
        completeTime: '2024-02-01 09:30:00',
        remark: '节日特惠券库存'
      }
    ]
    
    return {
      code: 200,
      data: {
        list: mockHistory,
        total: mockHistory.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      },
      message: 'success'
    }
  },

  // 获取批量创建详情
  async getBatchCreateDetail(batchId) {
    await delay(600)
    
    return {
      code: 200,
      data: {
        id: batchId,
        usageScenario: 'batch_distribute',
        configMode: 'unified',
        templateIds: ['TPL001', 'TPL002', 'TPL003'],
        unifiedConfig: {
          quantity: 10000,
          validFrom: '2024-01-01',
          validTo: '2024-12-31'
        },
        batchSettings: {
          createTime: '2024-01-15T10:00:00Z',
          remark: '春节活动券库存',
          operator: '张三'
        },
        results: [
          {
            templateId: 'TPL001',
            templateName: '新人专享券',
            inventoryId: 'INV001',
            status: 'success',
            quantity: 10000,
            message: '创建成功'
          },
          {
            templateId: 'TPL002',
            templateName: '老用户回馈券',
            inventoryId: 'INV002',
            status: 'success',
            quantity: 10000,
            message: '创建成功'
          }
        ],
        approvalInfo: {
          approvalId: 'AP001',
          status: 'approved',
          approver: '李四',
          approvalTime: '2024-01-15 10:45:00',
          comment: '活动需求合理，批准创建'
        }
      },
      message: 'success'
    }
  }
}

// 审批相关API
export const approvalAPI = {
  // 提交审批申请
  async submitApproval(data) {
    await delay(1500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        id: 'AP' + Date.now(),
        ...data,
        status: 'pending',
        createTime: new Date().toISOString()
      },
      message: '审批申请已提交'
    }
  },

  // 获取审批列表
  async getApprovalList(params = {}) {
    await delay(600)
    
    // 首先获取库存数据
    const inventoryResponse = await inventoryAPI.getInventoryList()
    const inventoryData = inventoryResponse.data.list
    
    // 从库存数据中筛选出需要审批的记录，并转换为审批列表格式
    const approvalRecords = inventoryData
      .filter(item => item.approvalStatus === 'pending' || item.approvalStatus === 'approved' || item.approvalStatus === 'rejected')
      .map(item => ({
        id: `AP${item.id}`,
        batchId: `BATCH${item.id}`,
        type: 'coupon_inventory',
        title: `${item.couponName} - 券库存审批`,
        applicant: item.applicant || '系统用户',
        department: item.applicantDept || '营销部',
        templateCount: 1,
        totalInventory: 1000,
        usageScenario: 'batch_distribute',
        configMode: 'unified',
        status: item.approvalStatus,
        priority: item.priority || 'medium',
        createTime: item.applyTime || item.startTime,
        approvalTime: item.approvalTime || null,
        approver: item.approver || null,
        expectedTime: item.endTime,
        reason: item.reason || '券库存创建申请',
        comment: item.rejectReason || '',
        remark: `${item.couponName} 券库存`,
        // 添加原始券信息
        couponInfo: {
          couponId: item.couponId,
          couponName: item.couponName,
          couponType: item.couponType,
          startTime: item.startTime,
          endTime: item.endTime,
          status: item.status
        }
      }))
    
    // 添加一些额外的审批记录以丰富数据
    const additionalApprovals = [
      {
        id: 'AP_BATCH001',
        batchId: 'BATCH_SPRING_2024',
        type: 'batch_create',
        title: '春季营销活动券批量创建',
        applicant: '营销经理',
        department: '营销部',
        templateCount: 5,
        totalInventory: 50000,
        usageScenario: 'batch_distribute',
        configMode: 'unified',
        status: 'pending',
        priority: 'high',
        createTime: '2024-04-01 09:00:00',
        expectedTime: '2024-04-02 18:00:00',
        reason: '春季营销活动需要大量券库存支持',
        remark: '春季营销活动券'
      },
      {
        id: 'AP_BATCH002',
        batchId: 'BATCH_VIP_2024',
        type: 'batch_create',
        title: 'VIP客户专享券批量创建',
        applicant: 'VIP运营',
        department: '客户部',
        templateCount: 3,
        totalInventory: 20000,
        usageScenario: 'telesales',
        configMode: 'individual',
        status: 'pending',
        priority: 'high',
        createTime: '2024-04-02 14:30:00',
        expectedTime: '2024-04-03 17:00:00',
        reason: 'VIP客户权益升级，需要专属券支持',
        remark: 'VIP专享券'
      }
    ]
    
    // 合并所有审批记录
    const allApprovals = [...approvalRecords, ...additionalApprovals]
    
    // 根据筛选条件过滤
    let filteredList = allApprovals
    
    if (params.status) {
      filteredList = filteredList.filter(item => item.status === params.status)
    }
    
    if (params.priority) {
      filteredList = filteredList.filter(item => item.priority === params.priority)
    }
    
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredList = filteredList.filter(item => 
        item.applicant.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.batchId.toLowerCase().includes(keyword)
      )
    }
    
    if (params.usageScenario) {
      filteredList = filteredList.filter(item => item.usageScenario === params.usageScenario)
    }
    
    if (params.configMode) {
      filteredList = filteredList.filter(item => item.configMode === params.configMode)
    }
    
    // 按创建时间倒序排列
    filteredList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    return {
      code: 200,
      data: {
        list: filteredList,
        total: filteredList.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      },
      message: 'success'
    }
  },

  // 获取审批历史
  async getApprovalHistory(params = {}) {
    await delay(600)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: {
        list: [
          {
            id: 'AP001',
            templateName: '新人专享券',
            couponCount: 1000,
            applicant: '张三',
            approver: '李四',
            priority: 'high',
            status: 'approved',
            createTime: '2024-01-15 10:30:00',
            approvalTime: '2024-01-15 14:20:00',
            approvalReason: '新用户拉新活动需要',
            rejectReason: ''
          }
        ],
        total: 50,
        current: params.current || 1,
        pageSize: params.pageSize || 10
      },
      message: 'success'
    }
  },

  // 获取审批详情
  async getApprovalDetail(id) {
    await delay(500)
    
    return {
      code: 200,
      data: {
        id,
        type: 'batch_create',
        title: '春节活动券库存批量创建',
        applicant: '张三',
        department: '营销部',
        status: 'pending',
        priority: 'high',
        createTime: '2024-01-15 10:30:00',
        reason: '为春节营销活动准备券库存，预计发放5万张券',
        batchInfo: {
          usageScenario: 'batch_distribute',
          configMode: 'unified',
          templateIds: ['TPL001', 'TPL002', 'TPL003'],
          templateCount: 3,
          totalInventory: 30000,
          unifiedConfig: {
            quantity: 10000,
            validFrom: '2024-01-01',
            validTo: '2024-12-31'
          },
          batchSettings: {
            createTime: '2024-01-15T10:00:00Z',
            remark: '春节活动券库存',
            operator: '张三'
          }
        },
        attachments: [],
        approvalFlow: [
          {
            step: 1,
            approver: '李四',
            department: '风控部',
            status: 'pending',
            comment: '',
            time: ''
          },
          {
            step: 2,
            approver: '王五',
            department: '财务部',
            status: 'waiting',
            comment: '',
            time: ''
          }
        ]
      },
      message: 'success'
    }
  },

  // 处理审批
  async processApproval(params) {
    await delay(1000)
    console.log('处理审批请求:', params)
    
    return {
      code: 200,
      data: {
        id: params.id,
        status: params.action,
        processTime: new Date().toISOString()
      },
      message: params.action === 'approved' ? '审批通过成功' : '审批拒绝成功'
    }
  },

  // 批量处理审批
  async batchProcessApproval(params) {
    await delay(1500)
    console.log('批量处理审批请求:', params)
    
    const results = params.ids.map(id => ({
      id,
      status: params.action,
      processTime: new Date().toISOString(),
      success: Math.random() > 0.1 // 90%成功率
    }))
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount
    
    return {
      code: 200,
      data: {
        results,
        summary: {
          total: params.ids.length,
          success: successCount,
          failed: failCount
        }
      },
      message: `批量审批完成，成功 ${successCount} 条，失败 ${failCount} 条`
    }
  },

  // 撤销审批申请
  async cancelApproval(id) {
    await delay(500)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: { id, status: 'cancelled' },
      message: '申请已撤销'
    }
  },

  // 获取审批人列表
  async getApproverList() {
    await delay(300)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: [
        { id: 'user001', name: '张三', department: '营销部' },
        { id: 'user002', name: '李四', department: '风控部' },
        { id: 'user003', name: '王五', department: '产品部' },
        { id: 'user004', name: '赵六', department: '运营部' }
      ],
      message: 'success'
    }
  }
}

// 用户相关API
export const userAPI = {
  // 获取用户群体列表
  async getUserGroups() {
    await delay(400)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: [
        { value: 'new_users', label: '新用户', count: 1250 },
        { value: 'active_users', label: '活跃用户', count: 8900 },
        { value: 'vip_users', label: 'VIP用户', count: 450 },
        { value: 'custom', label: '自定义用户群', count: 0 }
      ],
      message: 'success'
    }
  },

  // 获取产品列表
  async getProductList() {
    await delay(300)
    // TODO: 替换为真实API调用
    return {
      code: 200,
      data: [
        { value: 'SELF_APP', label: '自营APP' },
        { value: 'PARTNER_LOAN', label: '合作贷款' },
        { value: 'CREDIT_CARD', label: '信用卡' }
      ],
      message: 'success'
    }
  }
}

// 统一错误处理
export const handleAPIError = (error) => {
  console.error('API Error:', error)
  
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response
    switch (status) {
      case 400:
        return { message: data.message || '请求参数错误' }
      case 401:
        return { message: '未授权，请重新登录' }
      case 403:
        return { message: '权限不足' }
      case 404:
        return { message: '请求的资源不存在' }
      case 500:
        return { message: '服务器内部错误' }
      default:
        return { message: data.message || '请求失败' }
    }
  } else if (error.request) {
    // 网络错误
    return { message: '网络连接失败，请检查网络' }
  } else {
    // 其他错误
    return { message: error.message || '未知错误' }
  }
}

// API响应拦截器
export const responseInterceptor = (response) => {
  const { code, data, message } = response.data
  
  if (code === 200) {
    return { success: true, data, message }
  } else {
    return { success: false, message: message || '请求失败' }
  }
}

// 单独导出的函数，用于兼容现有的导入方式
export const createCouponTemplate = (data) => templateAPI.createTemplate(data)
export const updateCouponTemplate = (id, data) => templateAPI.updateTemplate(id, data)
export const getCouponTemplateDetail = (id) => templateAPI.getTemplateDetail ? templateAPI.getTemplateDetail(id) : Promise.resolve({ code: 200, data: {}, message: 'success' })

// 导出默认配置
export default {
  templateAPI,
  inventoryAPI,
  approvalAPI,
  userAPI,
  handleAPIError,
  responseInterceptor
}