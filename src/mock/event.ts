import Mock from 'mockjs'

export interface EventData {
  id: string
  eventName: string
  eventType: string
  eventSource: string
  triggerCondition: string
  status: string
  createTime: string
  updateTime: string
  owner: string
  description: string
  registryKey: string // 注册主键
}

// 生成事件管理数据
export const generateEventData = (count: number): EventData[] => {
  const eventTypes = ['系统事件', '业务事件', '用户事件', '营销事件', '风控事件']
  const eventSources = ['系统', '用户操作', '定时任务', '外部触发', 'API调用']
  const statusOptions = ['上线', '下线']
  const owners = ['张三', '李四', '王五', '赵六', '系统管理员']
  const registryKeys = ['user_id', 'order_id', 'transaction_id', 'event_id', 'session_id']
  
  const data: EventData[] = []

  for (let i = 0; i < count; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const eventSource = eventSources[Math.floor(Math.random() * eventSources.length)]
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const owner = owners[Math.floor(Math.random() * owners.length)]
    const registryKey = registryKeys[Math.floor(Math.random() * registryKeys.length)]
    
    data.push({
      id: `EVT${Mock.Random.string('number', 6)}`,
      eventName: `${eventType}${Mock.Random.ctitle(3, 8)}`,
      eventType,
      eventSource,
      triggerCondition: Mock.Random.sentence(5, 10),
      status,
      createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      owner,
      description: Mock.Random.sentence(10, 20),
      registryKey
    })
  }

  return data
}

// 模拟API响应
export default [
  {
    url: '/api/events/list',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { current = 1, pageSize = 10, eventName, eventType, status } = query
      
      let data = generateEventData(50)
      
      // 根据查询条件筛选
      if (eventName) {
        data = data.filter(item => item.eventName.includes(eventName))
      }
      
      if (eventType) {
        data = data.filter(item => item.eventType === eventType)
      }
      
      if (status) {
        data = data.filter(item => item.status === status)
      }
      
      // 分页处理
      const pageData = data.slice(
        (Number(current) - 1) * Number(pageSize),
        Number(current) * Number(pageSize)
      )
      
      return {
        code: 200,
        data: {
          list: pageData,
          total: data.length,
          current: Number(current),
          pageSize: Number(pageSize)
        }
      }
    }
  }
]