import Mock from 'mockjs'

// 生成变量关系图数据
function generateVariableGraph() {
  const nodes = []
  const edges = []
  
  // 生成节点数据
  for (let i = 1; i <= 20; i++) {
    const type = Mock.Random.pick(['numerical', 'categorical', 'text', 'datetime', 'boolean'])
    nodes.push({
      id: `var_${i}`,
      label: Mock.Random.ctitle(3, 8),
      type: type,
      status: Mock.Random.pick(['active', 'deprecated', 'draft']),
      description: Mock.Random.csentence(10, 30),
      createTime: Mock.Random.datetime(),
      updateTime: Mock.Random.datetime(),
      creator: Mock.Random.cname(),
      quality: Mock.Random.float(60, 100, 2, 2),
      usageCount: Mock.Random.integer(10, 1000),
      x: Mock.Random.integer(100, 800),
      y: Mock.Random.integer(100, 600)
    })
  }
  
  // 生成边数据（关系）
  const relationshipTypes = ['depends_on', 'derives_from', 'references', 'transforms_to']
  for (let i = 0; i < 30; i++) {
    const source = nodes[Mock.Random.integer(0, nodes.length - 1)]
    const target = nodes[Mock.Random.integer(0, nodes.length - 1)]
    
    // 避免自连接
    if (source.id !== target.id) {
      edges.push({
        id: `edge_${i}`,
        source: source.id,
        target: target.id,
        type: Mock.Random.pick(relationshipTypes),
        strength: Mock.Random.float(0.1, 1, 2, 2),
        description: Mock.Random.csentence(5, 15),
        createTime: Mock.Random.datetime()
      })
    }
  }
  
  return { nodes, edges }
}

// 生成血缘数据
function generateVariableLineage(variableId) {
  const lineage = {
    upstream: [],
    downstream: [],
    current: null
  }
  
  // 当前变量信息
  lineage.current = {
    id: variableId,
    name: Mock.Random.ctitle(3, 8),
    type: Mock.Random.pick(['numerical', 'categorical', 'text', 'datetime', 'boolean']),
    description: Mock.Random.csentence(10, 30),
    quality: Mock.Random.float(60, 100, 2, 2),
    createTime: Mock.Random.datetime(),
    updateTime: Mock.Random.datetime()
  }
  
  // 上游数据
  for (let i = 1; i <= Mock.Random.integer(1, 5); i++) {
    lineage.upstream.push({
      id: `upstream_${i}`,
      name: Mock.Random.ctitle(3, 8),
      type: Mock.Random.pick(['source_table', 'calculation', 'aggregation']),
      description: Mock.Random.csentence(10, 30),
      transformation: Mock.Random.csentence(5, 15),
      confidence: Mock.Random.float(0.7, 1, 2, 2),
      lastUpdate: Mock.Random.datetime()
    })
  }
  
  // 下游数据
  for (let i = 1; i <= Mock.Random.integer(1, 8); i++) {
    lineage.downstream.push({
      id: `downstream_${i}`,
      name: Mock.Random.ctitle(3, 8),
      type: Mock.Random.pick(['report', 'dashboard', 'model', 'api']),
      description: Mock.Random.csentence(10, 30),
      usage: Mock.Random.csentence(5, 15),
      frequency: Mock.Random.pick(['real-time', 'hourly', 'daily', 'weekly']),
      lastAccess: Mock.Random.datetime()
    })
  }
  
  return lineage
}

// 生成路径分析数据
function generatePathAnalysis(sourceId, targetId) {
  const paths = []
  
  // 生成多条路径
  for (let pathIndex = 0; pathIndex < Mock.Random.integer(1, 3); pathIndex++) {
    const path = {
      id: `path_${pathIndex}`,
      nodes: [],
      edges: [],
      totalSteps: 0,
      complexity: Mock.Random.pick(['simple', 'medium', 'complex']),
      confidence: Mock.Random.float(0.6, 1, 2, 2)
    }
    
    // 生成路径节点
    const stepCount = Mock.Random.integer(2, 6)
    for (let i = 0; i < stepCount; i++) {
      path.nodes.push({
        id: `node_${pathIndex}_${i}`,
        name: Mock.Random.ctitle(3, 8),
        type: Mock.Random.pick(['variable', 'transformation', 'aggregation', 'filter']),
        description: Mock.Random.csentence(10, 30),
        step: i
      })
    }
    
    // 生成路径边
    for (let i = 0; i < stepCount - 1; i++) {
      path.edges.push({
        id: `edge_${pathIndex}_${i}`,
        source: `node_${pathIndex}_${i}`,
        target: `node_${pathIndex}_${i + 1}`,
        type: Mock.Random.pick(['direct', 'transform', 'aggregate', 'filter']),
        description: Mock.Random.csentence(5, 15)
      })
    }
    
    path.totalSteps = stepCount
    paths.push(path)
  }
  
  return {
    sourceId,
    targetId,
    paths,
    analysisTime: Mock.Random.datetime()
  }
}

// 生成影响分析数据
function generateImpactAnalysis(variableId) {
  const impact = {
    affectedVariables: [],
    affectedReports: [],
    affectedDashboards: [],
    totalAffected: 0,
    riskLevel: Mock.Random.pick(['low', 'medium', 'high'])
  }
  
  // 受影响的变量
  for (let i = 1; i <= Mock.Random.integer(1, 10); i++) {
    impact.affectedVariables.push({
      id: `affected_var_${i}`,
      name: Mock.Random.ctitle(3, 8),
      type: Mock.Random.pick(['numerical', 'categorical', 'text', 'datetime', 'boolean']),
      impactType: Mock.Random.pick(['direct', 'indirect']),
      criticality: Mock.Random.pick(['low', 'medium', 'high']),
      lastUsed: Mock.Random.datetime()
    })
  }
  
  // 受影响的报表
  for (let i = 1; i <= Mock.Random.integer(1, 5); i++) {
    impact.affectedReports.push({
      id: `affected_report_${i}`,
      name: Mock.Random.ctitle(5, 15),
      type: Mock.Random.pick(['daily', 'weekly', 'monthly', 'quarterly']),
      owner: Mock.Random.cname(),
      lastRun: Mock.Random.datetime(),
      nextRun: Mock.Random.datetime()
    })
  }
  
  // 受影响的仪表板
  for (let i = 1; i <= Mock.Random.integer(1, 3); i++) {
    impact.affectedDashboards.push({
      id: `affected_dashboard_${i}`,
      name: Mock.Random.ctitle(5, 15),
      owner: Mock.Random.cname(),
      viewers: Mock.Random.integer(10, 100),
      lastAccess: Mock.Random.datetime()
    })
  }
  
  impact.totalAffected = impact.affectedVariables.length + 
                        impact.affectedReports.length + 
                        impact.affectedDashboards.length
  
  return impact
}

// Mock API 配置
export default [
  // 获取变量关系图
  {
    url: '/api/variable-map/graph',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: generateVariableGraph()
      }
    }
  },
  
  // 获取变量血缘
  {
    url: '/api/variable-map/lineage/:id',
    method: 'get',
    response: (options) => {
      const match = options.url && options.url.match(/\/api\/variable-map\/lineage\/(\w+)/)
      const id = match ? match[1] : ''
      return {
        code: 200,
        message: 'success',
        data: generateVariableLineage(id)
      }
    }
  },
  
  // 路径分析
  {
    url: '/api/variable-map/path-analysis',
    method: 'get',
    response: (options) => {
      const url = new URL(options.url, 'http://localhost')
      const sourceId = url.searchParams.get('sourceId')
      const targetId = url.searchParams.get('targetId')
      return {
        code: 200,
        message: 'success',
        data: generatePathAnalysis(sourceId, targetId)
      }
    }
  },
  
  // 影响分析
  {
    url: '/api/variable-map/impact-analysis/:id',
    method: 'get',
    response: (options) => {
      const match = options.url && options.url.match(/\/api\/variable-map\/impact-analysis\/(\w+)/)
      const id = match ? match[1] : ''
      return {
        code: 200,
        message: 'success',
        data: generateImpactAnalysis(id)
      }
    }
  },
  
  // 获取关系类型统计
  {
    url: '/api/variable-map/relationship-stats',
    method: 'get',
    response: () => {
      const stats = {
        totalRelationships: Mock.Random.integer(50, 200),
        relationshipTypes: {
          depends_on: Mock.Random.integer(10, 50),
          derives_from: Mock.Random.integer(10, 50),
          references: Mock.Random.integer(10, 50),
          transforms_to: Mock.Random.integer(10, 50)
        },
        avgPathLength: Mock.Random.float(2, 5, 1, 1),
        maxDepth: Mock.Random.integer(3, 10),
        orphanVariables: Mock.Random.integer(5, 20)
      }
      
      return {
        code: 200,
        message: 'success',
        data: stats
      }
    }
  }
]
