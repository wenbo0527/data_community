/**
 * 标签相关API接口
 */

export const getTagLineage = async (tagId) => {
  // 模拟接口请求
  await new Promise(resolve => setTimeout(resolve, 500)); // 添加500ms延迟
  const mockLineageData = {
    nodes: [
      { 
        id: 1, 
        name: '基础用户标签', 
        type: 'tag',
        updatedAt: 1717041600000,
        description: '用户基础属性标签'
      },
      {
        id: 2,
        name: '高价值客户群体',
        type: 'audience',
        lastUpdateTime: 1716955200000,
        definition: '月消费金额>5000元'
      }
    ],
    links: [
      { source: 1, target: 2, relation: '衍生自' }
    ]
  };
  return {
    code: 200,
    data: {
      nodes: [
        { id: 1, name: '标签节点', type: 'tag', updatedAt: Date.now() },
        { id: 2, name: '人群节点', type: 'audience', lastUpdateTime: Date.now() - 86400000 },
        { id: 3, name: '数据表节点', type: 'table', lastSyncTime: Date.now() - 172800000 }
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 }
      ]
    }
  }
}