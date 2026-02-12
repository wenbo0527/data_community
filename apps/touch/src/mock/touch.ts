export default {
  blacklist: [
    { username: "用户1", phone: "13800138000", idCard: "110101199003077654", addTime: "2023-01-01 10:00:00", banTime: "2023-01-15 14:30:00", policy: "全局禁用", source: "短信系统" },
    { username: "用户2", phone: "13900139000", idCard: "310115198502128765", addTime: "2023-02-01 09:15:00", banTime: "2023-02-10 11:20:00", policy: "全局禁用", source: "AI外呼-九四" },
    { username: "用户4", phone: "13600136000", idCard: "510104199208156543", addTime: "2023-03-05 16:20:00", banTime: "2023-03-20 09:45:00", policy: "全局禁用", source: "AI外呼-百应" },
    { username: "用户5", phone: "13500135000", idCard: "330106199107189876", addTime: "2023-04-10 11:30:00", banTime: "2023-04-25 14:15:00", policy: "全局禁用", source: "人工电销" },
    { username: "用户6", phone: "13400134000", idCard: "420102199309123210", addTime: "2023-05-15 08:40:00", banTime: "2023-05-30 16:50:00", policy: "全局禁用", source: "AI外呼-百应" }
  ],
  unbanned: [
    { username: "用户3", phone: "13700137000", idCard: "440305199512123456", addTime: "2022-12-01 08:00:00", banTime: "2022-12-20 10:00:00", unbanTime: "2023-01-05 15:00:00", policy: "全局禁用", source: "客服系统" },
    { username: "用户7", phone: "13300133000", idCard: "320103199410154321", addTime: "2023-01-10 09:20:00", banTime: "2023-01-25 11:40:00", unbanTime: "2023-02-10 14:30:00", policy: "全局禁用", source: "人工电销" },
    { username: "用户8", phone: "13200132000", idCard: "130105199605167890", addTime: "2023-02-15 13:10:00", banTime: "2023-03-01 15:25:00", unbanTime: "2023-03-15 10:20:00", policy: "全局禁用", source: "AI外呼-百应" }
  ],
  channels: [
    { id: 1, name: "短信渠道", status: "启用", quota: 1000, used: 350 },
    { id: 2, name: "邮件渠道", status: "启用", quota: 500, used: 120 }
  ],
  dictionaries: [
    { category: "模板标签", key: "priority", value: "高", desc: "高优先级" },
    { category: "渠道", key: "sms", value: "短信", desc: "短信渠道" }
  ],
  rateLimit: { perMinute: 1000, perHour: 30000, perDay: 500000 },
  globalRateLimits: [
    { id: 1, channel: 'AI外呼', scene: '营销类', line: '经审冷-停催', rule: '7天内下发1次', status: '使用中', remark: '—', updatedAt: '2025-12-31 10:00:00' },
    { id: 2, channel: '短信', scene: '营销类', line: '经审冷-黑催', rule: '7天内下发2次', status: '使用中', remark: '—', updatedAt: '2025-12-31 10:00:00' },
    { id: 3, channel: 'AI外呼', scene: '营销类', line: '经催热-意向', rule: '7天内下发1次', status: '使用中', remark: '—', updatedAt: '2025-12-31 10:00:00' },
    { id: 4, channel: '短信', scene: '营销类', line: '经催热-激活', rule: '7天内下发2次', status: '使用中', remark: '—', updatedAt: '2025-12-31 10:00:00' },
    { id: 5, channel: 'AI外呼', scene: '营销类', line: '历史客户', rule: '7天内下发1次', status: '使用中', remark: '—', updatedAt: '2025-12-31 10:00:00' },
    { id: 6, channel: '人工外呼', scene: '营销类', line: '历史客户', rule: '7天内下发1次', status: '使用中', remark: '—', updatedAt: '2025-12-31 10:00:00' }
  ],
  alerts: [
    { id: 1, name: "短信失败率升高", level: "高", status: "进行中" },
    { id: 2, name: "AI外呼通话时长异常", level: "中", status: "已处理" }
  ],
  vendors: {
    ai: [
      { id: 1, name: "百应", status: "启用" },
      { id: 2, name: "九四", status: "停用" }
    ],
    sms: [
      { id: 10, name: "阿里云短信", status: "启用" },
      { id: 11, name: "腾讯云短信", status: "启用" }
    ]
  },
  manualCallTemplates: [
    { id: 1, name: "人工外呼脚本A", status: "启用" }
  ],
  smsTemplates: [
    {
      id: 1,
      templateId: "2601122006487765848108",
      smsType: "营销类",
      primaryScene: "苏实行券(苏宁主APP), Su营(苏宁小程序)",
      strategyTag: "Su营(苏宁主APP), Su营(苏宁小程序)",
      label: "促销券下发成功短信通知",
      template: "优惠券发放",
      content: "【苏银消金】亲爱的用户，您的利率优惠券已到账！请登录Su营APP并完成您名下任意在优惠券使快会员优惠快回来，拒收请回复R",
      status: "使用中"
    },
    {
      id: 2,
      templateId: "2501211448648175551156",
      smsType: "营销类",
      primaryScene: "Su营(苏宁易购小程序)",
      strategyTag: "Su营(苏宁易购小程序)",
      label: "优惠券下发成功短信通知",
      template: "优惠券发放",
      content: "【苏银消金】亲爱的用户，您的利率优惠券已到账！请登录Su营APP并完成您名下任意在优惠券使快会员优惠快回来，拒收请回复R",
      status: "使用中"
    },
    {
      id: 3,
      templateId: "2511228101960531071201",
      smsType: "营销类",
      primaryScene: "促销优惠",
      strategyTag: "Su营(苏宁(易购小程序))",
      label: "手机APP优惠本商用",
      template: "促销通知",
      content: "【苏银消金】您的的信用门户卡放，版次打开我获APP官，拒我打开jobchina.cny3s3c5zqq4，拒收请回复R",
      status: "使用中"
    }
  ],
  aiCallTemplates: [
    { id: 201, name: "AI外呼话术A", vendor: "百应" }
  ],
  templateStats: {
    total: 5,
    byScene: [
      { scene: "营销", count: 3 },
      { scene: "风控", count: 2 }
    ]
  },
  queryDetails: [
    { 
      id: 1, 
      recipient: "张三",
      phone: "13800138001", 
      type: "短信",
      templateId: "SMS_001",
      externalTemplateId: "EXT_SMS_001",
      callDuration: null,
      audioRecord: null,
      channel: "sms", 
      vendor: "阿里云",
      status: "success", 
      time: "2024-01-01 10:00:00" 
    },
    { 
      id: 2, 
      recipient: "李四",
      phone: "13900139002", 
      type: "AI外呼",
      templateId: "AI_CALL_001",
      externalTemplateId: "EXT_AI_001",
      callDuration: 120,
      audioRecord: "https://example.com/audio/001.mp3",
      channel: "ai_call", 
      vendor: "百应",
      status: "success", 
      time: "2024-01-01 11:00:00" 
    },
    { 
      id: 3, 
      recipient: "王五",
      phone: "13700137003", 
      type: "人工外呼",
      templateId: "MANUAL_CALL_001",
      externalTemplateId: "EXT_MANUAL_001",
      callDuration: 180,
      audioRecord: "https://example.com/audio/002.mp3",
      channel: "manual_call", 
      vendor: "自营",
      status: "success", 
      time: "2024-01-01 12:00:00" 
    },
    { 
      id: 4, 
      recipient: "赵六",
      phone: "13600136004", 
      type: "短信",
      templateId: "SMS_002",
      externalTemplateId: "EXT_SMS_002",
      callDuration: null,
      audioRecord: null,
      channel: "sms", 
      vendor: "腾讯云",
      status: "failed", 
      time: "2024-01-01 13:00:00" 
    },
    { 
      id: 5, 
      recipient: "孙七",
      phone: "13500135005", 
      type: "AI外呼",
      templateId: "AI_CALL_002",
      externalTemplateId: "EXT_AI_002",
      callDuration: 90,
      audioRecord: "https://example.com/audio/003.mp3",
      channel: "ai_call", 
      vendor: "九四",
      status: "pending", 
      time: "2024-01-01 14:00:00" 
    }
  ],
  smsRecords: [
    { 
      id: 1, 
      recipient: "张三", 
      phone: "13800138001", 
      templateId: "SMS_001", 
      content: "【测试】尊敬的用户，您的验证码为123456，5分钟内有效。", 
      vendor: "阿里云短信", 
      smsVendor: "阿里云短信",
      sendStatus: "success", 
      sendTime: "2024-01-01 10:30:00" 
    },
    { 
      id: 2, 
      recipient: "李四", 
      phone: "13900139002", 
      templateId: "SMS_002", 
      content: "【测试】您好，您的订单已发货，请注意查收。", 
      vendor: "腾讯云短信", 
      smsVendor: "腾讯云短信",
      sendStatus: "success", 
      sendTime: "2024-01-01 11:00:00" 
    },
    { 
      id: 3, 
      recipient: "王五", 
      phone: "13700137003", 
      templateId: "SMS_001", 
      content: "【测试】尊敬的用户，您的验证码为654321，5分钟内有效。", 
      vendor: "阿里云短信", 
      smsVendor: "阿里云短信",
      sendStatus: "failed", 
      sendTime: "2024-01-01 11:30:00" 
    },
    { 
      id: 4, 
      recipient: "赵六", 
      phone: "13600136004", 
      templateId: "SMS_003", 
      content: "【测试】您的会员即将到期，请及时续费。", 
      vendor: "腾讯云短信", 
      smsVendor: "腾讯云短信",
      sendStatus: "sending", 
      sendTime: "2024-01-01 12:00:00" 
    },
    { 
      id: 5, 
      recipient: "孙七", 
      phone: "13500135005", 
      templateId: "SMS_002", 
      content: "【测试】您好，您的订单已签收，感谢您的支持。", 
      vendor: "阿里云短信", 
      smsVendor: "阿里云短信",
      sendStatus: "success", 
      sendTime: "2024-01-01 12:30:00" 
    },
    { 
      id: 6, 
      recipient: "周八", 
      phone: "13400134006", 
      templateId: "SMS_004", 
      content: "【测试】恭喜您获得优惠券一张，请在15天内使用。", 
      vendor: "腾讯云短信", 
      smsVendor: "腾讯云短信",
      sendStatus: "success", 
      sendTime: "2024-01-01 13:00:00" 
    },
    { 
      id: 7, 
      recipient: "吴九", 
      phone: "13300133007", 
      templateId: "SMS_001", 
      content: "【测试】尊敬的用户，您的验证码为789012，5分钟内有效。", 
      vendor: "阿里云短信", 
      smsVendor: "阿里云短信",
      sendStatus: "success", 
      sendTime: "2024-01-01 13:30:00" 
    },
    { 
      id: 8, 
      recipient: "郑十", 
      phone: "13200132008", 
      templateId: "SMS_005", 
      content: "【测试】您的账户余额不足，请及时充值。", 
      vendor: "腾讯云短信", 
      smsVendor: "腾讯云短信",
      sendStatus: "failed", 
      sendTime: "2024-01-01 14:00:00" 
    }
  ],
  aiCallRecords: [
    { id: 1, user: "用户1", vendor: "百应", time: "2024-01-01 10:00:00" }
  ],
  aiSmsVendorRecords: [
    { id: 1, vendor: "百应", phone: "13800000000", time: "2024-01-01 10:00:00" }
  ],
  manualCallRecords: [
    { id: 1, agent: "坐席A", user: "用户1", time: "2024-01-01 10:00:00" }
  ],
  manualSmsVendorRecords: [
    { id: 1, vendor: "阿里云短信", phone: "13800000000", time: "2024-01-01 10:00:00" }
  ],
  marketingQuery: [
    { id: 1, title: "活动A", channel: "sms", time: "2024-01-01 10:00:00" }
  ],
  marketingList: [
    { id: 1, title: "活动A", channel: "sms", time: "2024-01-01 10:00:00" }
  ],
  overviewData: [
    {
      id: 'type_sms',
      type: '短信',
      vendor: '-',
      taskId: '-',
      batchId: '-',
      sendRate: 92.3,
      success: 6029,
      successRate: 78.2,
      fail: 1700,
      children: [
        {
          id: 'vendor_aliyun',
          type: '短信',
          vendor: '阿里云短信',
          taskId: '-',
          batchId: '-',
          sendRate: 94.1,
          success: 288,
          successRate: 73.6,
          fail: 236,
          children: [
            { id: 'task_1001', taskName: '双11营销通知', type: '短信', vendor: '阿里云短信', taskId: '1001', batchId: 'B001', sendRate: 100, success: 142, successRate: 81.2, fail: 9, time: '2026-01-01 10:00:00' },
            { id: 'task_1002', taskName: '双12回访短信', type: '短信', vendor: '阿里云短信', taskId: '1002', batchId: 'B002', sendRate: 100, success: 146, successRate: 78.8, fail: 12, time: '2026-01-02 10:00:00' }
          ]
        },
        {
          id: 'vendor_tencent',
          type: '短信',
          vendor: '腾讯云短信',
          taskId: '-',
          batchId: '-',
          sendRate: 90.4,
          success: 705,
          successRate: 74.5,
          fail: 96,
          children: [
            { id: 'task_2001', taskName: '新春大礼包', type: '短信', vendor: '腾讯云短信', taskId: '2001', batchId: 'B101', sendRate: 100, success: 382, successRate: 77.1, fail: 113, time: '2026-01-03 10:00:00' },
            { id: 'task_2002', taskName: '元旦促销', type: '短信', vendor: '腾讯云短信', taskId: '2002', batchId: 'B102', sendRate: 100, success: 323, successRate: 73.8, fail: 96, time: '2026-01-04 10:00:00' }
          ]
        }
      ]
    },
    {
      id: 'type_ai',
      type: 'AI外呼',
      vendor: '-',
      taskId: '-',
      batchId: '-',
      sendRate: 88.7,
      success: 2288,
      successRate: 79.3,
      fail: 588,
      children: [
        {
          id: 'vendor_baiying',
          type: 'AI外呼',
          vendor: '百应',
          taskId: '-',
          batchId: '-',
          sendRate: 91.2,
          success: 1200,
          successRate: 80.1,
          fail: 280,
          children: [
            { id: 'task_3001', taskName: '分期邀约', type: 'AI外呼', vendor: '百应', taskId: '3001', batchId: 'C001', sendRate: 100, success: 600, successRate: 82.1, fail: 50, time: '2026-01-05 10:00:00' },
            { id: 'task_3002', taskName: '逾期提醒', type: 'AI外呼', vendor: '百应', taskId: '3002', batchId: 'C002', sendRate: 100, success: 600, successRate: 78.1, fail: 80, time: '2026-01-06 10:00:00' }
          ]
        },
        {
          id: 'vendor_jiusi',
          type: 'AI外呼',
          vendor: '九四',
          taskId: '-',
          batchId: '-',
          sendRate: 86.5,
          success: 1088,
          successRate: 78.2,
          fail: 308,
          children: [
            { id: 'task_4001', taskName: '意向确认', type: 'AI外呼', vendor: '九四', taskId: '4001', batchId: 'C101', sendRate: 100, success: 540, successRate: 76.2, fail: 120, time: '2026-01-07 10:00:00' },
            { id: 'task_4002', taskName: '满意度调查', type: 'AI外呼', vendor: '九四', taskId: '4002', batchId: 'C102', sendRate: 100, success: 548, successRate: 80.2, fail: 98, time: '2026-01-08 10:00:00' }
          ]
        }
      ]
    },
    {
      id: 'type_manual',
      type: '人工外呼',
      vendor: '-',
      taskId: '-',
      batchId: '-',
      sendRate: 90.0,
      success: 6029,
      successRate: 73.8,
      fail: 1703,
      children: [
        {
          id: 'vendor_manual',
          type: '人工外呼',
          vendor: '人工电销',
          taskId: '-',
          batchId: '-',
          sendRate: 90.0,
          success: 6029,
          successRate: 73.8,
          fail: 1703,
          children: [
            { id: 'task_5001', taskName: '高端客户回访', type: '人工外呼', vendor: '人工电销', taskId: '5001', batchId: 'D001', sendRate: 100, success: 507, successRate: 79.3, fail: 58, time: '2026-01-09 10:00:00' }
          ]
        }
      ]
    }
  ]
}
