export default [
  {
    key: 'policy-management',
    title: '策略管理',
    path: '/touch/policy/template',
    route: 'PolicyTemplate',
    children: [
      {
        key: 'policy-template',
        title: '策略模板',
        path: '/touch/policy/template',
        route: 'PolicyTemplate'
      },
      {
        key: 'manual-sms',
        title: '手工短信发送',
        path: '/touch/manual-sms',
        route: 'ManualSMS'
      }
    ]
  },
  {
    key: 'channel-management',
    title: '渠道管理',
    path: '/touch/channel',
    route: 'ChannelManagement',
    children: [
      {
        key: 'blacklist',
        title: '黑名单管理',
        path: '/touch/channel/blacklist',
        route: 'ChannelBlacklist'
      }
    ]
  },
  {
    key: 'touch-query',
    title: '触达查询',
    path: '/touch/query',
    route: 'TouchQuery',
    children: [
      {
        key: 'query-detail',
        title: '明细查询',
        path: '/touch/query',
        route: 'TouchQuery'
      }
    ]
  }
  // 注意：以下路由在当前路由配置中未定义，已注释掉
  // {
  //   key: 'TouchAnalysis',
  //   title: '触达分析',
  //   children: [
  //     {
  //       key: 'EffectAnalysis',
  //       title: '效果分析',
  //       path: '/touch/analysis/effect',
  //       route: 'TouchEffectAnalysis'
  //     },
  //     {
  //       key: 'BehaviorAnalysis',
  //       title: '行为分析',
  //       path: '/touch/analysis/behavior',
  //       route: 'TouchBehaviorAnalysis'
  //     }
  //   ]
  // },
  // {
  //   key: 'SystemManagement',
  //   title: '系统管理',
  //   path: '/touch/system',
  //   route: 'TouchSystemManagement'
  // }
]