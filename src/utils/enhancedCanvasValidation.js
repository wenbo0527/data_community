/**
 * Enhanced Canvas Validation Tool
 * For comprehensive validation during save and publish operations
 */

import { validateCanvasData, formatValidationMessage } from './canvasValidation.js'

/**
 * Validate for publish operation
 * @param {Object} canvasData - Canvas data { nodes, connections }
 * @param {Object} options - Validation options { autoFix, previewLines }
 * @returns {Object} Validation result
 */
export function validateForPublish(canvasData, options = {}) {
  const { autoFix = false, previewLines = [] } = options
  const result = {
    isValid: false,
    errors: [],
    warnings: [],
    autoFixedData: null,
    canAutoFix: false
  }

  if (!canvasData || !canvasData.nodes) {
    result.errors.push('Canvas data cannot be empty')
    return result
  }

  let { nodes, connections = [] } = canvasData
  let fixedNodes = [...nodes]
  let fixedConnections = [...connections]
  let hasAutoFix = false

  // Basic validation
  const basicValidation = validateCanvasData({ nodes: fixedNodes, connections: fixedConnections })
  result.errors.push(...basicValidation.errors)
  result.warnings.push(...basicValidation.warnings)

  // Check start nodes
  const startNodes = fixedNodes.filter(node => node.type === 'start')
  if (startNodes.length === 0) {
    result.errors.push('Must have exactly one start node')
  } else if (startNodes.length > 1) {
    result.errors.push('Can only have one start node')
  }

  // Check start node connections
  if (startNodes.length === 1) {
    const startNodeId = startNodes[0].id
    const startNodeOutConnections = fixedConnections.filter(conn => conn.source === startNodeId)
    if (startNodeOutConnections.length === 0) {
      result.errors.push('Start node must have output connections')
    } else if (startNodeOutConnections.length > 1) {
      result.errors.push('Start node can only have one output connection')
    }
  }

  // Check cycles
  const cycleResult = detectCycles(fixedNodes, fixedConnections)
  if (cycleResult.hasCycles) {
    result.errors.push('Flow contains cycles')
    cycleResult.cycles.forEach(cycle => {
      result.errors.push(`Cycle path: ${cycle.join(' → ')}`)
    })
  }

  // Check nodes needing end nodes
  const nodesNeedingEndNodes = findNodesNeedingEndNodes(fixedNodes, fixedConnections, previewLines)
  if (nodesNeedingEndNodes.length > 0) {
    result.canAutoFix = true
    const fixResult = autoAddEndNodes(fixedNodes, fixedConnections, previewLines)
    if (fixResult.modified) {
      fixedNodes = fixResult.nodes
      fixedConnections = fixResult.connections
      hasAutoFix = true
      result.warnings.push(`Auto-added ${fixResult.addedEndNodes} end nodes`)
    }
  }

  // Check incomplete nodes
  const incompleteNodes = findIncompleteNodes(fixedNodes)
  if (incompleteNodes.length > 0) {
    incompleteNodes.forEach(node => {
      result.warnings.push(`Node "${node.label || node.id}" configuration incomplete`)
    })
  }

  // Final validation
  if (result.errors.length === 0) {
    result.isValid = true
  }

  if (hasAutoFix) {
    result.autoFixedData = {
      nodes: fixedNodes,
      connections: fixedConnections
    }
  }

  return result
}

/**
 * Detect cycles in flow
 * @param {Array} nodes - Node array
 * @param {Array} connections - Connection array
 * @returns {Object} Cycle detection result
 */
export function detectCycles(nodes, connections) {
  const result = {
    hasCycles: false,
    cycles: []
  }

  // Build adjacency list
  const graph = new Map()
  nodes.forEach(node => {
    graph.set(node.id, [])
  })

  connections.forEach(connection => {
    if (graph.has(connection.source)) {
      graph.get(connection.source).push(connection.target)
    }
  })

  // DFS cycle detection
  const visited = new Set()
  const recursionStack = new Set()
  const currentPath = []

  function dfs(nodeId) {
    if (recursionStack.has(nodeId)) {
      const cycleStart = currentPath.indexOf(nodeId)
      const cycle = currentPath.slice(cycleStart).concat([nodeId])
      result.cycles.push(cycle)
      result.hasCycles = true
      return true
    }

    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)
    currentPath.push(nodeId)

    const neighbors = graph.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    currentPath.pop()
    return false
  }

  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId)
    }
  }

  return result
}

/**
 * Find nodes that need end nodes
 * @param {Array} nodes - Node array
 * @param {Array} connections - Connection array
 * @param {Array} previewLines - Preview line array
 * @returns {Array} Nodes needing end nodes
 */
export function findNodesNeedingEndNodes(nodes, connections, previewLines) {
  previewLines = Array.isArray(previewLines) ? previewLines : []
  const nodesWithOutgoing = new Set()

  connections.forEach(connection => {
    nodesWithOutgoing.add(connection.source)
  })

  const nodesWithPreviewLines = new Set()
  previewLines.forEach(previewLine => {
    if (previewLine.sourceNodeId) {
      nodesWithPreviewLines.add(previewLine.sourceNodeId)
    }
  })

  return nodes.filter(node => {
    if (node.type === 'end') return false
    
    const hasRealConnection = nodesWithOutgoing.has(node.id)
    const hasPreviewLine = nodesWithPreviewLines.has(node.id)
    
    return !hasRealConnection && hasPreviewLine
  })
}

/**
 * Auto add end nodes for nodes without subsequent nodes
 * @param {Array} nodes - Node array
 * @param {Array} connections - Connection array
 * @param {Array} previewLines - Preview line array
 * @returns {Object} Fix result
 */
export function autoAddEndNodes(nodes, connections, previewLines = []) {
  const result = {
    modified: false,
    nodes: [...nodes],
    connections: [...connections],
    addedEndNodes: 0
  }

  const nodesNeedingEndNodes = findNodesNeedingEndNodes(nodes, connections, previewLines)
  
  if (nodesNeedingEndNodes.length === 0) {
    return result
  }

  const previewLinePositions = new Map()
  previewLines.forEach(previewLine => {
    if (previewLine.sourceNodeId && previewLine.position) {
      if (!previewLinePositions.has(previewLine.sourceNodeId)) {
        previewLinePositions.set(previewLine.sourceNodeId, [])
      }
      previewLinePositions.get(previewLine.sourceNodeId).push({
        position: previewLine.position,
        branchId: previewLine.branchId,
        branchLabel: previewLine.branchLabel
      })
    }
  })

  nodesNeedingEndNodes.forEach((node, index) => {
    const nodePreviewLines = previewLinePositions.get(node.id) || []
    
    if (nodePreviewLines.length > 0) {
      nodePreviewLines.forEach((previewInfo, branchIndex) => {
        const endNodeId = `end_${node.id}_${previewInfo.branchId || 'default'}_${branchIndex}`
        const endNode = {
          id: endNodeId,
          type: 'end',
          label: 'End',
          position: {
            x: previewInfo.position.x || (node.position.x + 200),
            y: previewInfo.position.y || (node.position.y + branchIndex * 80)
          },
          data: {
            autoGenerated: true,
            fromPreviewLine: true,
            sourceNodeId: node.id,
            branchId: previewInfo.branchId
          }
        }

        const connectionId = `conn_${node.id}_${endNodeId}_${branchIndex}`
        const connection = {
          id: connectionId,
          source: node.id,
          target: endNodeId,
          type: 'default',
          data: {
            autoGenerated: true,
            branchId: previewInfo.branchId,
            branchLabel: previewInfo.branchLabel
          }
        }

        result.nodes.push(endNode)
        result.connections.push(connection)
        result.addedEndNodes++
      })
    } else {
      const endNodeId = `end_${node.id}_${index}`
      const endNode = {
        id: endNodeId,
        type: 'end',
        label: 'End',
        position: {
          x: node.position.x + 200,
          y: node.position.y
        },
        data: {
          autoGenerated: true,
          sourceNodeId: node.id
        }
      }

      const connectionId = `conn_${node.id}_${endNodeId}`
      const connection = {
        id: connectionId,
        source: node.id,
        target: endNodeId,
        type: 'default',
        data: {
          autoGenerated: true
        }
      }

      result.nodes.push(endNode)
      result.connections.push(connection)
      result.addedEndNodes++
    }
  })

  result.modified = result.addedEndNodes > 0
  return result
}

/**
 * Find nodes with incomplete configuration
 * @param {Array} nodes - Node array
 * @returns {Array} Nodes with incomplete configuration
 */
export function findIncompleteNodes(nodes) {
  const branchNodeTypes = ['audience-split', 'event-split', 'ab-test']
  
  function validateStoredBranches(nodeType, nodeConfig) {
    switch (nodeType) {
      case 'audience-split':
        return nodeConfig.crowdLayers && 
               Array.isArray(nodeConfig.crowdLayers) && 
               nodeConfig.crowdLayers.length > 0
        
      case 'event-split':
        return !!(nodeConfig.eventCondition || 
                 nodeConfig.yesLabel || 
                 nodeConfig.noLabel)
        
      case 'ab-test':
        return !!(
          (nodeConfig.versions && Array.isArray(nodeConfig.versions) && nodeConfig.versions.length > 0) ||
          nodeConfig.groupALabel || 
          nodeConfig.groupBLabel || 
          nodeConfig.groupARatio || 
          nodeConfig.groupBRatio
        )
        
      default:
        return true
    }
  }
  
  return nodes.filter(node => {
    if (node.type === 'end') return false
    
    const nodeData = node.data || {}
    const nodeConfig = nodeData.config || {}
    const nodeType = node.type
    
    if (nodeData.isConfigured === true) {
      return false
    }
    
    const hasConfigData = nodeConfig && Object.keys(nodeConfig).length > 0
    if (hasConfigData) {
      const isBranchNode = branchNodeTypes.includes(nodeType)
      
      if (isBranchNode) {
        const isValidBranchConfig = validateStoredBranches(nodeType, nodeConfig)
        if (isValidBranchConfig) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
    }
    
    const isBranchNode = branchNodeTypes.includes(nodeType)
    if (isBranchNode && nodeData.branches && nodeData.branches.length > 0) {
      const validBranches = nodeData.branches.filter(branch => 
        branch && (branch.id || branch.label || branch.name)
      )
      
      if (validBranches.length > 0) {
        return false
      }
    }
    
    if (nodeType === 'start') {
      return false
    }
    
    const hasAnyMeaningfulData = !!(
      node.label || 
      node.name || 
      node.title ||
      (nodeData && Object.keys(nodeData).length > 0)
    )
    
    if (hasAnyMeaningfulData) {
      return false
    }
    
    return true
  })
}

/**
 * Basic validation for save operation
 * @param {Object} canvasData - Canvas data
 * @returns {Object} Validation result
 */
export function validateForSave(canvasData) {
  const result = {
    isValid: true,
    errors: [],
    warnings: []
  }

  if (!canvasData) {
    result.warnings.push('Canvas data is empty, saved as blank draft')
    return result
  }

  if (!canvasData.nodes || canvasData.nodes.length === 0) {
    result.warnings.push('No nodes in canvas, saved as blank draft')
    return result
  }
  
  const { nodes } = canvasData
  const configuredNodes = nodes.filter(node => {
    if (node.type === 'start') return true
    if (node.isConfigured === true || node.data?.isConfigured === true) return true
    if (node.config && Object.keys(node.config).length > 0) return true
    if (node.data?.config && Object.keys(node.data.config).length > 0) return true
    return false
  })
  
  const unconfiguredNodes = nodes.filter(node => {
    if (node.type === 'start') return false
    if (node.isConfigured === true || node.data?.isConfigured === true) return false
    if (node.config && Object.keys(node.config).length > 0) return false
    if (node.data?.config && Object.keys(node.data.config).length > 0) return false
    return true
  })
  
  if (configuredNodes.length > 0) {
    if (unconfiguredNodes.length > 0) {
      result.warnings.push(`Canvas has ${configuredNodes.length} configured nodes and ${unconfiguredNodes.length} unconfigured nodes, current state saved`)
    }
  } else {
    result.warnings.push('Nodes in canvas are not configured yet, saved as draft')
  }

  nodes.forEach((node, index) => {
    if (!node.id) {
      result.errors.push(`Node ${index + 1} missing ID`)
      result.isValid = false
    }
    if (!node.type) {
      result.errors.push(`Node ${node.id || index + 1} missing type`)
      result.isValid = false
    }
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      result.errors.push(`Node ${node.id || index + 1} invalid position`)
      result.isValid = false
    }
  })

  return result
}

/**
 * Format publish validation message
 * @param {Object} validationResult - Validation result
 * @returns {String} Formatted message
 */
export function formatPublishValidationMessage(validationResult) {
  const { isValid, errors, warnings, canAutoFix, autoFixedData } = validationResult
  
  let message = ''
  
  if (errors.length > 0) {
    message += 'Publish failed, errors found:\n'
    message += errors.map(error => `  • ${error}`).join('\n')
  }
  
  if (warnings.length > 0) {
    if (message) message += '\n\n'
    message += 'Warnings:\n'
    message += warnings.map(warning => `  • ${warning}`).join('\n')
    
    if (canAutoFix && !autoFixedData) {
      message += '\n\nSystem can auto-fix these issues'
    }
  }
  
  if (autoFixedData) {
    if (message) message += '\n\n'
    message += 'Issues auto-fixed and layout optimized'
  }
  
  if (isValid) {
    if (!message) {
      message = 'Validation passed, ready to publish'
    } else if (!errors.length) {
      message += '\n\nValidation passed, ready to publish'
    }
  }
  
  return message
}