/**
 * 端口验证组合式函数
 * 用于验证端口位置与内容行的对齐精度
 */

import { ref, computed } from 'vue'
import { NODE_DIMENSIONS, TYPOGRAPHY } from '../styles/nodeStyles.js'

export function usePortValidation() {
  const validationErrors = ref([])
  const validationWarnings = ref([])
  
  function validatePortPositions(portConfig, contentLines, tolerance = 2) {
    validationErrors.value = []
    validationWarnings.value = []
    
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {}
    }
    
    try {
      if (portConfig.groups?.in) {
        validateInputPort(portConfig.groups.in, results)
      }
      if (portConfig.groups?.out) {
        validateOutputPorts(portConfig.groups.out, contentLines, tolerance, results)
      }
      validationErrors.value = results.errors
      validationWarnings.value = results.warnings
      results.isValid = results.errors.length === 0
    } catch (error) {
      results.isValid = false
      results.errors.push({
        type: 'validation_error',
        message: `验证过程出错: ${error.message}`,
        severity: 'error'
      })
    }
    
    return results
  }
  
  function validateInputPort(inGroup, results) {
    if (!inGroup.items || inGroup.items.length === 0) {
      return
    }
    
    const inputPort = inGroup.items[0]
    const expectedDy = 0
    
    if (Math.abs(inputPort.args?.dy - expectedDy) > 1) {
      results.warnings.push({
        type: 'input_port_alignment',
        message: `输入端口dy偏移(${inputPort.args?.dy})可能未对齐节点中心`,
        expected: expectedDy,
        actual: inputPort.args?.dy,
        severity: 'warning'
      })
    }
    
    results.details.inputPort = {
      id: inputPort.id,
      dy: inputPort.args?.dy,
      isAligned: Math.abs(inputPort.args?.dy - expectedDy) <= 1
    }
  }
  
  function validateOutputPorts(outGroup, contentLines, tolerance, results) {
    if (!outGroup.items || outGroup.items.length === 0) {
      return
    }
    
    const expectedPortsCount = contentLines.length
    const actualPortsCount = outGroup.items.length
    
    if (actualPortsCount !== expectedPortsCount) {
      results.errors.push({
        type: 'port_count_mismatch',
        message: `输出端口数量不匹配: 期望${expectedPortsCount}个，实际${actualPortsCount}个`,
        expected: expectedPortsCount,
        actual: actualPortsCount,
        severity: 'error'
      })
    }
    
    const outputPortDetails = []
    
    outGroup.items.forEach((port, index) => {
      const lineIndex = index
      const expectedDy = getExpectedOutputPortDy(lineIndex, contentLines.length)
      const actualDy = port.args?.dy
      const deviation = Math.abs(actualDy - expectedDy)
      
      const isAligned = deviation <= tolerance
      
      if (!isAligned) {
        results.errors.push({
          type: 'output_port_alignment',
          message: `输出端口${port.id}位置偏差过大: ${deviation}px`,
          portId: port.id,
          lineIndex: lineIndex,
          expectedDy: expectedDy,
          actualDy: actualDy,
          deviation: deviation,
          tolerance: tolerance,
          severity: 'error'
        })
      } else if (deviation > 0) {
        results.warnings.push({
          type: 'output_port_alignment',
          message: `输出端口${port.id}存在轻微偏差: ${deviation}px`,
          portId: port.id,
          lineIndex: lineIndex,
          expectedDy: expectedDy,
          actualDy: actualDy,
          deviation: deviation,
          tolerance: tolerance,
          severity: 'warning'
        })
      }
      
      outputPortDetails.push({
        id: port.id,
        lineIndex: lineIndex,
        dy: actualDy,
        expectedDy: expectedDy,
        deviation: deviation,
        isAligned: isAligned
      })
    })
    
    results.details.outputPorts = outputPortDetails
  }
  
  function getExpectedOutputPortDy(lineIndex, totalLines) {
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST
    const minHeight = NODE_DIMENSIONS.MIN_HEIGHT
    
    const contentHeight = Math.max(1, totalLines) * rowHeight
    const calculatedHeight = headerHeight + contentPadding + contentHeight + 12
    const height = Math.max(minHeight, calculatedHeight)
    
    const verticalOffset = headerHeight + contentPadding + (lineIndex * rowHeight) + Math.floor(rowHeight / 2) + baselineAdjust
    const expectedDy = verticalOffset - (height / 2)
    
    return expectedDy
  }
  
  function validatePortIds(ports, expectedPrefix) {
    const results = {
      isValid: true,
      errors: [],
      details: []
    }
    
    ports.forEach((port, index) => {
      const expectedId = `${expectedPrefix}-${index}`
      const isValidId = port.id === expectedId
      
      if (!isValidId) {
        results.isValid = false
        results.errors.push({
          type: 'port_id_format',
          message: `端口ID格式错误: 期望${expectedId}，实际${port.id}`,
          portIndex: index,
          expectedId: expectedId,
          actualId: port.id,
          severity: 'error'
        })
      }
      
      results.details.push({
        portIndex: index,
        actualId: port.id,
        expectedId: expectedId,
        isValid: isValidId
      })
    })
    
    return results
  }
  
  function getValidationStats() {
    return computed(() => ({
      totalErrors: validationErrors.value.length,
      totalWarnings: validationWarnings.value.length,
      hasErrors: validationErrors.value.length > 0,
      hasWarnings: validationWarnings.value.length > 0
    }))
  }
  
  function clearValidation() {
    validationErrors.value = []
    validationWarnings.value = []
  }
  
  return {
    validationErrors: computed(() => validationErrors.value),
    validationWarnings: computed(() => validationWarnings.value),
    validationStats: getValidationStats(),
    validatePortPositions,
    validatePortIds,
    clearValidation
  }
}
