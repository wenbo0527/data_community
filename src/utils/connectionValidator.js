/**
 * 连接验证工具类
 * 负责节点之间连接的验证逻辑
 */

/**
 * 验证连接是否有效
 * @param {Object} params - 连接参数
 * @param {Object} params.sourceView - 源节点视图
 * @param {Object} params.sourcePort - 源端口
 * @param {Object} params.targetMagnet - 目标磁铁
 * @returns {boolean} 是否允许连接
 */
const validate = ({ sourceView, sourcePort, targetMagnet }) => {
  try {
    // 基础验证
    if (!sourcePort || typeof sourcePort.getParent !== 'function') {
      console.error('Invalid source port structure:', sourcePort)
      return false
    }

    if (!sourcePort?.isNodePort) {
      console.error('Invalid source port:', sourcePort)
      return false
    }

    const parentNode = sourcePort.getParent()
    const nodeType = parentNode?.getData()?.type

    // 根据节点类型进行不同的验证
    switch (nodeType) {
      case 'start':
        return validateStartNodeConnection(sourceView, targetMagnet)
      case 'audience-split':
        return validateAudienceSplitConnection(sourceView, targetMagnet)
      case 'event-split':
        return validateEventSplitConnection(sourceView, targetMagnet)
      default:
        return validateDefaultConnection(sourceView, targetMagnet)
    }
  } catch (error) {
    console.error('Connection validation error:', error)
    return false
  }
}

/**
 * 验证开始节点的连接
 */
const validateStartNodeConnection = (sourceView, targetMagnet) => {
  // 开始节点最多只能有3个出口连接
  const maxConnections = 3
  const currentConnections = sourceView.outgoingEdges?.count || 0
  
  // 只能连接到输入端口
  const isValidTarget = targetMagnet?.getAttribute('port') === 'in1'
  
  const isValid = currentConnections < maxConnections && isValidTarget
  
  console.debug('Start node connection validation:', {
    currentConnections,
    maxConnections,
    isValidTarget,
    isValid
  })
  
  return isValid
}

/**
 * 验证人群分流节点的连接
 */
const validateAudienceSplitConnection = (sourceView, targetMagnet) => {
  // 人群分流节点可以有多个分支连接
  const isValidTarget = !!targetMagnet
  
  console.debug('Audience split connection validation:', {
    isValidTarget
  })
  
  return isValidTarget
}

/**
 * 验证事件分流节点的连接
 */
const validateEventSplitConnection = (sourceView, targetMagnet) => {
  // 事件分流节点最多2个分支
  const maxConnections = 2
  const currentConnections = sourceView.outgoingEdges?.count || 0
  const isValidTarget = !!targetMagnet
  
  const isValid = currentConnections < maxConnections && isValidTarget
  
  console.debug('Event split connection validation:', {
    currentConnections,
    maxConnections,
    isValidTarget,
    isValid
  })
  
  return isValid
}

/**
 * 验证默认节点的连接
 */
const validateDefaultConnection = (sourceView, targetMagnet) => {
  // 默认节点只能有一个出口连接
  const maxConnections = 1
  const currentConnections = sourceView.outgoingEdges?.count || 0
  const isValidTarget = !!targetMagnet
  
  const isValid = currentConnections < maxConnections && isValidTarget
  
  console.debug('Default connection validation:', {
    currentConnections,
    maxConnections,
    isValidTarget,
    isValid
  })
  
  return isValid
}

/**
 * 连接创建时的回调处理
 */
const onEdgeAdded = (args) => {
  try {
    // 从事件参数中获取边对象
    const edge = args.edge || args.cell || args.item || args;
    
    // 检查边对象是否有效
    if (!edge) {
      console.error('Invalid edge object in onEdgeAdded');
      return;
    }
    
    // 尝试获取源节点和目标节点
    let sourceNode, targetNode, sourcePort, targetPort;
    
    // 方法1: 直接使用 getSourceNode 和 getTargetNode (如果可用)
    if (typeof edge.getSourceNode === 'function' && typeof edge.getTargetNode === 'function') {
      sourceNode = edge.getSourceNode();
      targetNode = edge.getTargetNode();
      sourcePort = typeof edge.getSourcePortId === 'function' ? edge.getSourcePortId() : '';
      targetPort = typeof edge.getTargetPortId === 'function' ? edge.getTargetPortId() : '';
    } 
    // 方法2: 使用 getSource 和 getTarget 获取连接信息
    else if (typeof edge.getSource === 'function' && typeof edge.getTarget === 'function') {
      const source = edge.getSource();
      const target = edge.getTarget();
      
      // 源节点可能在 source.cell 中
      if (source) {
        // 这里我们无法直接获取节点对象，只能获取节点ID
        // 在实际应用中，可能需要通过其他方式获取节点对象
        console.log('Edge source:', source);
        
        // 暂时使用节点ID代替节点对象
        sourceNode = { id: source.cell || source.id || '' };
        sourcePort = source.port || '';
      } else {
        console.error('Cannot get source from edge:', edge);
        return;
      }
      
      if (target) {
        console.log('Edge target:', target);
        targetNode = { id: target.cell || target.id || '' };
        targetPort = target.port || '';
      } else {
        console.log('Target is null or undefined, edge may be incomplete');
        // 如果目标节点为空，我们不立即返回，而是设置targetNode为null
        // 这样后续的检查会捕获这个问题
        targetNode = null;
      }
    } else {
      console.error('Edge object does not have methods to get source and target:', edge);
      return;
    }

    // 检查源节点和目标节点是否有效
    if (!sourceNode || !targetNode) {
      console.error('Invalid source or target node:', { sourceNode, targetNode });
      return;
    }
    
    // 检查节点ID是否存在
    if (sourceNode.id === undefined || targetNode.id === undefined) {
      console.error('Node ID is undefined:', { sourceNodeId: sourceNode.id, targetNodeId: targetNode.id });
      return;
    }
    
    // 创建连接信息
    const newConnection = {
      id: edge.id || `edge-${Date.now()}`,
      source: {
        nodeId: sourceNode.id,
        portId: sourcePort || ''
      },
      target: {
        nodeId: targetNode ? targetNode.id : 'unknown',
        portId: targetPort || ''
      }
    }
    
    // 记录连接信息
    console.log('Created new connection:', newConnection)

    // 尝试更新源节点和目标节点的数据
    try {
      // 只有当 sourceNode 和 targetNode 是完整的节点对象时才更新数据
      if (typeof sourceNode.getData === 'function' && typeof sourceNode.setData === 'function') {
        const sourceData = sourceNode.getData() || {}
        sourceNode.setData({
          ...sourceData,
          connections: [...(sourceData.connections || []), newConnection]
        })
      } else {
        console.log('Source node does not support getData/setData:', sourceNode.id)
      }

      if (targetNode && typeof targetNode.getData === 'function' && typeof targetNode.setData === 'function') {
        const targetData = targetNode.getData() || {}
        targetNode.setData({
          ...targetData,
          connections: [...(targetData.connections || []), newConnection]
        })
      } else {
        console.log('Target node is null or does not support getData/setData:', targetNode ? targetNode.id : 'null')
      }
    } catch (innerError) {
      console.error('Error updating node data:', innerError)
    }

    console.log('Connection created:', newConnection)
  } catch (error) {
    console.error('Error handling edge addition:', error)
  }
}

/**
 * 连接验证器对象
 */
export const connectionValidator = {
  validate,
  onEdgeAdded,
  validateStartNodeConnection,
  validateAudienceSplitConnection,
  validateEventSplitConnection,
  validateDefaultConnection
}

export default connectionValidator