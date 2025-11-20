/**
 * 端口验证组合式函数
 * 用于验证端口位置与内容行的对齐精度
 */

import { ref, computed } from 'vue'
import { NODE_DIMENSIONS, TYPOGRAPHY } from '../styles/nodeStyles.js'

/**
 * 端口验证组合式函数
 * @returns {Object} 验证工具函数和状态
 */
export function usePortValidation() {
  const validationErrors = ref([])
  const validationWarnings = ref([])
  
  /**
   * 验证端口位置与内容行的对齐关系
   * @param {Object} portConfig - 端口配置
   * @param {Array} contentLines - 内容行数组
   * @param {number} tolerance - 误差容忍度（默认±2px）
   * @returns {Object} 验证结果
   */
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
      // 验证输入端口
      if (portConfig.groups?.in) {
        validateInputPort(portConfig.groups.in, results)
      }
      
      // 验证输出端口
      if (portConfig.groups?.out) {
        validateOutputPorts(portConfig.groups.out, contentLines, tolerance, results)
      }
      
      // 更新响应式状态
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
  
  /**
   * 验证输入端口位置
   * @param {Object} inGroup - 输入端口组配置
   * @param {Object} results - 验证结果对象
   */
  function validateInputPort(inGroup, results) {
    if (!inGroup.items || inGroup.items.length === 0) {
      return
    }
    
    const inputPort = inGroup.items[0]
    const expectedDy = 0 // 输入端口应该在节点中心
    
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
  
  /**
   * 验证输出端口位置
   * @param {Object} outGroup - 输出端口组配置
   * @param {Array} contentLines - 内容行数组
   * @param {number} tolerance - 误差容忍度
   * @param {Object} results - 验证结果对象
   */
  function validateOutputPorts(outGroup, contentLines, tolerance, results) {
    if (!outGroup.items || outGroup.items.length === 0) {
      return
    }
    
    const expectedPortsCount = contentLines.length
    const actualPortsCount = outGroup.items.length
    
    // 验证端口数量
    if (actualPortsCount !== expectedPortsCount) {
      results.errors.push({
        type: 'port_count_mismatch',
        message: `输出端口数量不匹配: 期望${expectedPortsCount}个，实际${actualPortsCount}个`,
        expected: expectedPortsCount,
        actual: actualPortsCount,
        severity: 'error'
      })
    }
    
    // 验证每个输出端口的位置
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
  
  /**
   * 计算期望的输出端口dy偏移
   * @param {number} lineIndex - 行索引
   * @param {number} totalLines - 总行数
   * @returns {number} 期望的dy值
   */
  function getExpectedOutputPortDy(lineIndex, totalLines) {
    // 基于技术文档第6节：输出端口对齐每一行文本中点
    // 使用与 updateNodeFromConfig 函数完全相同的计算参数
    
    const headerHeight = NODE_DIMENSIONS.HEADER_HEIGHT  // 36
    const contentPadding = NODE_DIMENSIONS.CONTENT_PADDING  // 12
    const rowHeight = NODE_DIMENSIONS.ROW_HEIGHT  // 32
    const baselineAdjust = TYPOGRAPHY.CONTENT_BASELINE_ADJUST  // 5
    const minHeight = NODE_DIMENSIONS.MIN_HEIGHT  // 96
    
    // 计算节点高度（与 updateNodeFromConfig 中的 height 计算相同）
    const contentHeight = Math.max(1, totalLines) * rowHeight
    const calculatedHeight = headerHeight + contentPadding + contentHeight + 12
    const height = Math.max(minHeight, calculatedHeight)
    
    // 计算垂直偏移（与 updateNodeFromConfig 中的 verticalOffsets 计算相同）
    const verticalOffset = headerHeight + contentPadding + (lineIndex * rowHeight) + Math.floor(rowHeight / 2) + baselineAdjust
    const expectedDy = verticalOffset - (height / 2)
    
    return expectedDy
  }
  
  /**
   * 验证端口ID格式
   * @param {Array} ports - 端口数组
   * @param {string} expectedPrefix - 期望的ID前缀
   * @returns {Object} 验证结果
   */
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
  
  /**
   * 获取验证统计信息
   * @returns {Object} 统计信息
   */
  function getValidationStats() {
    return computed(() => ({
      totalErrors: validationErrors.value.length,
      totalWarnings: validationWarnings.value.length,
      hasErrors: validationErrors.value.length > 0,
      hasWarnings: validationWarnings.value.length > 0
    }))
  }
  
  /**
   * 清除验证结果
   */
  function clearValidation() {
    validationErrors.value = []
    validationWarnings.value = []
  }
  
  return {
    // 状态
    validationErrors: computed(() => validationErrors.value),
    validationWarnings: computed(() => validationWarnings.value),
    validationStats: getValidationStats(),
    
    // 方法
    validatePortPositions,
    validatePortIds,
    clearValidation
  }
}