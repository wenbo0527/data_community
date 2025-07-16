import Mock from 'mockjs';

// 生成虚拟事件数据
export const generateVirtualEventData = (count) => {
    const scenarios = ['营销触达', '风险控制', '用户分析', '行为监控'];
    const statusOptions = ['已上线', '已下线', '草稿'];
    const updaters = ['张三', '李四', '王五', '赵六', '系统管理员'];
    const eventTypes = ['用户注册', '用户登录', '订单支付', '页面访问', '商品收藏', '购物车添加', '优惠券使用', '评价提交'];
    
    const data = [];
    for (let i = 0; i < count; i++) {
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const updater = updaters[Math.floor(Math.random() * updaters.length)];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        data.push({
            id: `VE${Mock.Random.string('number', 6)}`,
            eventName: `${eventType}虚拟事件${Mock.Random.string('number', 3)}`,
            eventId: `virtual_${Mock.Random.string('lower', 8)}`,
            scenario,
            status,
            updater,
            updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
            createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
            description: Mock.Random.sentence(10, 20),
            // 虚拟事件特有的条件配置
            logicRelation: Math.random() > 0.5 ? 'AND' : 'OR',
            conditionGroups: [
                {
                    id: 1,
                    conditions: [
                        {
                            field: eventType,
                            operator: ['身份证号', '手机号', '用户ID'][Math.floor(Math.random() * 3)],
                            value: Mock.Random.string('number', 6),
                            logic: ['等于', '不等于', '包含'][Math.floor(Math.random() * 3)]
                        }
                    ]
                }
            ],
            // 关联的真实事件ID（用于同步）
            realEventId: null,
            syncStatus: 'pending' // pending, synced, failed
        });
    }
    return data;
};

// 生成事件管理数据
export const generateEventData = (count) => {
    const eventTypes = ['系统事件', '业务事件', '用户事件', '营销事件', '风控事件'];
    const eventSources = ['系统', '用户操作', '定时任务', '外部触发', 'API调用'];
    const statusOptions = ['上线', '下线'];
    const owners = ['张三', '李四', '王五', '赵六', '系统管理员'];
    const registryKeys = ['user_id', 'order_id', 'transaction_id', 'event_id', 'session_id'];
    const data = [];
    for (let i = 0; i < count; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventSource = eventSources[Math.floor(Math.random() * eventSources.length)];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const owner = owners[Math.floor(Math.random() * owners.length)];
        const registryKey = registryKeys[Math.floor(Math.random() * registryKeys.length)];
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
        });
    }
    return data;
};
// 模拟API响应
export default [
    {
        url: '/api/events/list',
        method: 'get',
        response: ({ query }) => {
            const { current = 1, pageSize = 10, eventName, eventType, status } = query;
            let data = generateEventData(50);
            // 根据查询条件筛选
            if (eventName) {
                data = data.filter(item => item.eventName.includes(eventName));
            }
            if (eventType) {
                data = data.filter(item => item.eventType === eventType);
            }
            if (status) {
                data = data.filter(item => item.status === status);
            }
            // 分页处理
            const pageData = data.slice((Number(current) - 1) * Number(pageSize), Number(current) * Number(pageSize));
            return {
                code: 200,
                data: {
                    list: pageData,
                    total: data.length,
                    current: Number(current),
                    pageSize: Number(pageSize)
                }
            };
        }
    }
];
