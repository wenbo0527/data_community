export const touchMenuItems = [
  {
    key: 'policy-management',
    title: '策略管理',
    path: '/touch/policy',
    children: [
      {
        key: 'policy-template',
        title: '策略模板',
        path: '/touch/policy/template'
      },
      {
        key: 'manual-sms',
        title: '手工短信发送',
        path: '/touch/manual-sms'
      }
    ]
  },
  {
    key: 'channel-management',
    title: '渠道管理',
    path: '/touch/channel',
    children: [
      {
        key: 'blacklist',
        title: '黑名单管理',
        path: '/touch/channel/blacklist'
      }
    ]
  },
  {
    key: 'touch-query',
    title: '触达查询',
    path: '/touch/query',
    children: [
      {
        key: 'query-detail',
        title: '明细查询',
        path: '/touch/query'
      }
    ]
  },
  {
    key: 'TouchAnalysis',
    title: '触达分析',
    children: [
      {
        key: 'TouchQuery',
        title: '触达查询',
        path: '/touch/query'
      },
      {
        key: 'EffectAnalysis',
        title: '效果分析',
        path: '/touch/analysis/effect'
      },
      {
        key: 'BehaviorAnalysis',
        title: '行为分析',
        path: '/touch/analysis/behavior'
      }
    ]
  },
  {
    key: 'SystemManagement',
    title: '系统管理',
    path: '/touch/system'
  }
]