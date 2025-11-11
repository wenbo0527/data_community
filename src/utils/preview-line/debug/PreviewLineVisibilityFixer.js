/**
 * 预览线可见性修复工具
 * 专门用于诊断和修复预览线不可见的问题
 */
export class PreviewLineVisibilityFixer {
  constructor(graph) {
    this.graph = graph
    this.fixedCount = 0
    this.diagnostics = []
  }

  /**
   * 诊断预览线可见性问题
   * @returns {Object} 诊断结果
   */
  diagnoseVisibilityIssues() {
    console.log('🔍 [预览线可见性修复] 开始诊断预览线可见性问题')
    
    if (!this.graph) {
      return { error: 'Graph实例不存在' }
    }

    const edges = this.graph.getEdges()
    const previewLines = edges.filter(edge => this.isPreviewLine(edge))
    
    console.log(`🔍 [预览线可见性修复] 找到 ${previewLines.length} 条预览线`)
    
    const diagnostics = []
    
    for (const line of previewLines) {
      const diagnosis = this.diagnoseSingleLine(line)
      diagnostics.push(diagnosis)
    }
    
    this.diagnostics = diagnostics
    
    const summary = {
      totalPreviewLines: previewLines.length,
      visibleLines: diagnostics.filter(d => d.isVisible).length,
      invisibleLines: diagnostics.filter(d => !d.isVisible).length,
      fixableIssues: diagnostics.filter(d => d.fixable).length,
      diagnostics: diagnostics
    }
    
    console.log('🔍 [预览线可见性修复] 诊断完成:', summary)
    return summary
  }

  /**
   * 诊断单条预览线
   * @param {Object} line - 预览线对象
   * @returns {Object} 诊断结果
   */
  diagnoseSingleLine(line) {
    const diagnosis = {
      id: line.id,
      isVisible: false,
      issues: [],
      fixable: false,
      attributes: {},
      domInfo: {}
    }

    try {
      // 检查基本可见性
      diagnosis.isVisible = line.visible !== false && line.isVisible?.() !== false
      
      // 检查属性
      diagnosis.attributes = {
        visible: line.visible,
        opacity: line.getAttrByPath?.('line/opacity'),
        stroke: line.getAttrByPath?.('line/stroke'),
        strokeWidth: line.getAttrByPath?.('line/strokeWidth'),
        strokeOpacity: line.getAttrByPath?.('line/strokeOpacity'),
        display: line.getAttrByPath?.('line/display'),
        visibility: line.getAttrByPath?.('line/visibility'),
        zIndex: line.getZIndex?.()
      }
      
      // 检查DOM元素
      if (line.view && line.view.el) {
        const el = line.view.el
        const computedStyle = window.getComputedStyle(el)
        
        diagnosis.domInfo = {
          hasElement: true,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          pointerEvents: computedStyle.pointerEvents
        }
      } else {
        diagnosis.domInfo = { hasElement: false }
        diagnosis.issues.push('DOM元素不存在')
      }
      
      // 分析问题
      if (diagnosis.attributes.opacity === 0) {
        diagnosis.issues.push('透明度为0')
        diagnosis.fixable = true
      }
      
      if (diagnosis.attributes.display === 'none') {
        diagnosis.issues.push('display设置为none')
        diagnosis.fixable = true
      }
      
      if (diagnosis.attributes.visibility === 'hidden') {
        diagnosis.issues.push('visibility设置为hidden')
        diagnosis.fixable = true
      }
      
      if (!diagnosis.attributes.stroke || diagnosis.attributes.stroke === 'none') {
        diagnosis.issues.push('stroke未设置或为none')
        diagnosis.fixable = true
      }
      
      if (diagnosis.attributes.strokeWidth === 0) {
        diagnosis.issues.push('strokeWidth为0')
        diagnosis.fixable = true
      }
      
      if (diagnosis.domInfo.hasElement) {
        if (diagnosis.domInfo.display === 'none') {
          diagnosis.issues.push('DOM display为none')
          diagnosis.fixable = true
        }
        
        if (diagnosis.domInfo.visibility === 'hidden') {
          diagnosis.issues.push('DOM visibility为hidden')
          diagnosis.fixable = true
        }
        
        if (parseFloat(diagnosis.domInfo.opacity) === 0) {
          diagnosis.issues.push('DOM opacity为0')
          diagnosis.fixable = true
        }
      }
      
    } catch (error) {
      diagnosis.issues.push(`诊断错误: ${error.message}`)
    }
    
    return diagnosis
  }

  /**
   * 修复预览线可见性问题
   * @returns {Object} 修复结果
   */
  fixVisibilityIssues() {
    console.log('🔧 [预览线可见性修复] 开始修复预览线可见性问题')
    
    if (!this.diagnostics.length) {
      this.diagnoseVisibilityIssues()
    }
    
    const fixResults = []
    this.fixedCount = 0
    
    for (const diagnosis of this.diagnostics) {
      if (diagnosis.fixable && diagnosis.issues.length > 0) {
        const result = this.fixSingleLine(diagnosis)
        fixResults.push(result)
        if (result.success) {
          this.fixedCount++
        }
      }
    }
    
    // 强制刷新画布
    if (this.fixedCount > 0) {
      this.forceCanvasRefresh()
    }
    
    const summary = {
      totalFixed: this.fixedCount,
      fixResults: fixResults
    }
    
    console.log('🔧 [预览线可见性修复] 修复完成:', summary)
    return summary
  }

  /**
   * 修复单条预览线
   * @param {Object} diagnosis - 诊断结果
   * @returns {Object} 修复结果
   */
  fixSingleLine(diagnosis) {
    const result = {
      id: diagnosis.id,
      success: false,
      fixedIssues: [],
      errors: []
    }
    
    try {
      const line = this.graph.getCellById(diagnosis.id)
      if (!line) {
        result.errors.push('预览线不存在于图形中')
        return result
      }
      
      // 修复属性问题
      if (diagnosis.issues.includes('透明度为0')) {
        line.setAttrByPath('line/opacity', 0.8)
        result.fixedIssues.push('设置透明度为0.8')
      }
      
      if (diagnosis.issues.includes('display设置为none')) {
        line.setAttrByPath('line/display', 'block')
        result.fixedIssues.push('设置display为block')
      }
      
      if (diagnosis.issues.includes('visibility设置为hidden')) {
        line.setAttrByPath('line/visibility', 'visible')
        result.fixedIssues.push('设置visibility为visible')
      }
      
      if (diagnosis.issues.includes('stroke未设置或为none')) {
        line.setAttrByPath('line/stroke', '#1890ff')
        result.fixedIssues.push('设置stroke为#1890ff')
      }
      
      if (diagnosis.issues.includes('strokeWidth为0')) {
        line.setAttrByPath('line/strokeWidth', 2)
        result.fixedIssues.push('设置strokeWidth为2')
      }
      
      // 设置预览线样式
      line.setAttrByPath('line/strokeDasharray', '5,5')
      line.setAttrByPath('line/strokeOpacity', 1)
      line.setZIndex(1000)
      
      // 修复DOM问题
      if (line.view && line.view.el) {
        const el = line.view.el
        
        if (diagnosis.issues.includes('DOM display为none')) {
          el.style.display = 'block'
          result.fixedIssues.push('设置DOM display为block')
        }
        
        if (diagnosis.issues.includes('DOM visibility为hidden')) {
          el.style.visibility = 'visible'
          result.fixedIssues.push('设置DOM visibility为visible')
        }
        
        if (diagnosis.issues.includes('DOM opacity为0')) {
          el.style.opacity = '1'
          result.fixedIssues.push('设置DOM opacity为1')
        }
        
        // 确保SVG路径可见
        const svgPath = el.querySelector('path')
        if (svgPath) {
          svgPath.style.display = 'block'
          svgPath.style.visibility = 'visible'
          svgPath.style.opacity = '1'
          result.fixedIssues.push('修复SVG路径样式')
        }
      }
      
      // 强制更新视图
      if (line.view && typeof line.view.update === 'function') {
        line.view.update()
      }
      
      result.success = result.fixedIssues.length > 0
      
    } catch (error) {
      result.errors.push(`修复错误: ${error.message}`)
    }
    
    return result
  }

  /**
   * 强制刷新画布
   */
  forceCanvasRefresh() {
    try {
      if (this.graph && typeof this.graph.refresh === 'function') {
        this.graph.refresh()
      }
      
      if (this.graph && typeof this.graph.refreshViews === 'function') {
        this.graph.refreshViews()
      }
      
      // 延迟再次刷新确保DOM更新
      setTimeout(() => {
        if (this.graph && typeof this.graph.refresh === 'function') {
          this.graph.refresh()
        }
      }, 100)
      
    } catch (error) {
      console.warn('⚠️ [预览线可见性修复] 刷新画布时出错:', error)
    }
  }

  /**
   * 判断是否为预览线
   * @param {Object} edge - 边对象
   * @returns {boolean} 是否为预览线
   */
  isPreviewLine(edge) {
    if (!edge) return false
    
    const edgeData = edge.getData() || {}
    
    // 检查数据标记
    if (edgeData.isPreview || edgeData.isUnifiedPreview || edgeData.type === 'preview-line') {
      return true
    }
    
    // 检查ID
    if (edge.id && edge.id.includes('preview')) {
      return true
    }
    
    // 检查源目标
    const hasSource = edge.getSourceCellId && edge.getSourceCellId()
    const hasTarget = edge.getTargetCellId && edge.getTargetCellId()
    
    return hasSource && !hasTarget
  }

  /**
   * 创建预览线可见性报告
   * @returns {Object} 报告
   */
  generateVisibilityReport() {
    const diagnosis = this.diagnoseVisibilityIssues()
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPreviewLines: diagnosis.totalPreviewLines,
        visibleLines: diagnosis.visibleLines,
        invisibleLines: diagnosis.invisibleLines,
        visibilityRate: diagnosis.totalPreviewLines > 0 ? 
          (diagnosis.visibleLines / diagnosis.totalPreviewLines * 100).toFixed(1) + '%' : '0%'
      },
      issues: diagnosis.diagnostics.filter(d => d.issues.length > 0),
      recommendations: []
    }
    
    if (diagnosis.invisibleLines > 0) {
      report.recommendations.push('建议运行修复工具修复不可见的预览线')
    }
    
    if (diagnosis.fixableIssues > 0) {
      report.recommendations.push(`发现 ${diagnosis.fixableIssues} 个可修复的问题`)
    }
    
    return report
  }

  /**
   * 诊断预览线可见性问题
   * @returns {Object} 诊断结果
   */
  diagnoseVisibilityIssues() {
    console.log('🔍 [预览线可见性修复] 开始诊断预览线可见性问题')
    
    if (!this.graph) {
      return { error: 'Graph实例不存在' }
    }

    const edges = this.graph.getEdges()
    const previewLines = edges.filter(edge => this.isPreviewLine(edge))
    
    console.log(`🔍 [预览线可见性修复] 找到 ${previewLines.length} 条预览线`)
    
    const diagnostics = []
    
    for (const line of previewLines) {
      const diagnosis = this.diagnoseSingleLine(line)
      diagnostics.push(diagnosis)
    }
    
    this.diagnostics = diagnostics
    
    const summary = {
      totalPreviewLines: previewLines.length,
      visibleLines: diagnostics.filter(d => d.isVisible).length,
      invisibleLines: diagnostics.filter(d => !d.isVisible).length,
      fixableIssues: diagnostics.filter(d => d.fixable).length,
      diagnostics: diagnostics
    }
    
    console.log('🔍 [预览线可见性修复] 诊断完成:', summary)
    return summary
  }

  /**
   * 诊断单条预览线
   * @param {Object} line - 预览线对象
   * @returns {Object} 诊断结果
   */
  diagnoseSingleLine(line) {
    const diagnosis = {
      id: line.id,
      isVisible: false,
      issues: [],
      fixable: false,
      attributes: {},
      domInfo: {}
    }

    try {
      // 检查基本可见性
      diagnosis.isVisible = line.visible !== false && line.isVisible?.() !== false
      
      // 检查属性
      diagnosis.attributes = {
        visible: line.visible,
        opacity: line.getAttrByPath?.('line/opacity'),
        stroke: line.getAttrByPath?.('line/stroke'),
        strokeWidth: line.getAttrByPath?.('line/strokeWidth'),
        strokeOpacity: line.getAttrByPath?.('line/strokeOpacity'),
        display: line.getAttrByPath?.('line/display'),
        visibility: line.getAttrByPath?.('line/visibility'),
        zIndex: line.getZIndex?.()
      }
      
      // 检查DOM元素
      if (line.view && line.view.el) {
        const el = line.view.el
        const computedStyle = window.getComputedStyle(el)
        
        diagnosis.domInfo = {
          hasElement: true,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          pointerEvents: computedStyle.pointerEvents
        }
      } else {
        diagnosis.domInfo = { hasElement: false }
        diagnosis.issues.push('DOM元素不存在')
      }
      
      // 分析问题
      if (diagnosis.attributes.opacity === 0) {
        diagnosis.issues.push('透明度为0')
        diagnosis.fixable = true
      }
      
      if (diagnosis.attributes.display === 'none') {
        diagnosis.issues.push('display设置为none')
        diagnosis.fixable = true
      }
      
      if (diagnosis.attributes.visibility === 'hidden') {
        diagnosis.issues.push('visibility设置为hidden')
        diagnosis.fixable = true
      }
      
      if (!diagnosis.attributes.stroke || diagnosis.attributes.stroke === 'none') {
        diagnosis.issues.push('stroke未设置或为none')
        diagnosis.fixable = true
      }
      
      if (diagnosis.attributes.strokeWidth === 0) {
        diagnosis.issues.push('strokeWidth为0')
        diagnosis.fixable = true
      }
      
      if (diagnosis.domInfo.hasElement) {
        if (diagnosis.domInfo.display === 'none') {
          diagnosis.issues.push('DOM display为none')
          diagnosis.fixable = true
        }
        
        if (diagnosis.domInfo.visibility === 'hidden') {
          diagnosis.issues.push('DOM visibility为hidden')
          diagnosis.fixable = true
        }
        
        if (parseFloat(diagnosis.domInfo.opacity) === 0) {
          diagnosis.issues.push('DOM opacity为0')
          diagnosis.fixable = true
        }
      }
      
    } catch (error) {
      diagnosis.issues.push(`诊断错误: ${error.message}`)
    }
    
    return diagnosis
  }

  /**
   * 修复预览线可见性问题
   * @returns {Object} 修复结果
   */
  fixVisibilityIssues() {
    console.log('🔧 [预览线可见性修复] 开始修复预览线可见性问题')
    
    if (!this.diagnostics.length) {
      this.diagnoseVisibilityIssues()
    }
    
    const fixResults = []
    this.fixedCount = 0
    
    for (const diagnosis of this.diagnostics) {
      if (diagnosis.fixable && diagnosis.issues.length > 0) {
        const result = this.fixSingleLine(diagnosis)
        fixResults.push(result)
        if (result.success) {
          this.fixedCount++
        }
      }
    }
    
    // 强制刷新画布
    if (this.fixedCount > 0) {
      this.forceCanvasRefresh()
    }
    
    const summary = {
      totalFixed: this.fixedCount,
      fixResults: fixResults
    }
    
    console.log('🔧 [预览线可见性修复] 修复完成:', summary)
    return summary
  }

  /**
   * 修复单条预览线
   * @param {Object} diagnosis - 诊断结果
   * @returns {Object} 修复结果
   */
  fixSingleLine(diagnosis) {
    const result = {
      id: diagnosis.id,
      success: false,
      fixedIssues: [],
      errors: []
    }
    
    try {
      const line = this.graph.getCellById(diagnosis.id)
      if (!line) {
        result.errors.push('预览线不存在于图形中')
        return result
      }
      
      // 修复属性问题
      if (diagnosis.issues.includes('透明度为0')) {
        line.setAttrByPath('line/opacity', 0.8)
        result.fixedIssues.push('设置透明度为0.8')
      }
      
      if (diagnosis.issues.includes('display设置为none')) {
        line.setAttrByPath('line/display', 'block')
        result.fixedIssues.push('设置display为block')
      }
      
      if (diagnosis.issues.includes('visibility设置为hidden')) {
        line.setAttrByPath('line/visibility', 'visible')
        result.fixedIssues.push('设置visibility为visible')
      }
      
      if (diagnosis.issues.includes('stroke未设置或为none')) {
        line.setAttrByPath('line/stroke', '#1890ff')
        result.fixedIssues.push('设置stroke为#1890ff')
      }
      
      if (diagnosis.issues.includes('strokeWidth为0')) {
        line.setAttrByPath('line/strokeWidth', 2)
        result.fixedIssues.push('设置strokeWidth为2')
      }
      
      // 设置预览线样式
      line.setAttrByPath('line/strokeDasharray', '5,5')
      line.setAttrByPath('line/strokeOpacity', 1)
      line.setZIndex(1000)
      
      // 修复DOM问题
      if (line.view && line.view.el) {
        const el = line.view.el
        
        if (diagnosis.issues.includes('DOM display为none')) {
          el.style.display = 'block'
          result.fixedIssues.push('设置DOM display为block')
        }
        
        if (diagnosis.issues.includes('DOM visibility为hidden')) {
          el.style.visibility = 'visible'
          result.fixedIssues.push('设置DOM visibility为visible')
        }
        
        if (diagnosis.issues.includes('DOM opacity为0')) {
          el.style.opacity = '1'
          result.fixedIssues.push('设置DOM opacity为1')
        }
        
        // 确保SVG路径可见
        const svgPath = el.querySelector('path')
        if (svgPath) {
          svgPath.style.display = 'block'
          svgPath.style.visibility = 'visible'
          svgPath.style.opacity = '1'
          result.fixedIssues.push('修复SVG路径样式')
        }
      }
      
      // 强制更新视图
      if (line.view && typeof line.view.update === 'function') {
        line.view.update()
      }
      
      result.success = result.fixedIssues.length > 0
      
    } catch (error) {
      result.errors.push(`修复错误: ${error.message}`)
    }
    
    return result
  }

  /**
   * 强制刷新画布
   */
  forceCanvasRefresh() {
    try {
      if (this.graph && typeof this.graph.refresh === 'function') {
        this.graph.refresh()
      }
      
      if (this.graph && typeof this.graph.refreshViews === 'function') {
        this.graph.refreshViews()
      }
      
      // 延迟再次刷新确保DOM更新
      setTimeout(() => {
        if (this.graph && typeof this.graph.refresh === 'function') {
          this.graph.refresh()
        }
      }, 100)
      
    } catch (error) {
      console.warn('⚠️ [预览线可见性修复] 刷新画布时出错:', error)
    }
  }

  /**
   * 判断是否为预览线
   * @param {Object} edge - 边对象
   * @returns {boolean} 是否为预览线
   */
  isPreviewLine(edge) {
    if (!edge) return false
    
    const edgeData = edge.getData() || {}
    
    // 检查数据标记
    if (edgeData.isPreview || edgeData.isUnifiedPreview || edgeData.type === 'preview-line') {
      return true
    }
    
    // 检查ID
    if (edge.id && edge.id.includes('preview')) {
      return true
    }
    
    // 检查源目标
    const hasSource = edge.getSourceCellId && edge.getSourceCellId()
    const hasTarget = edge.getTargetCellId && edge.getTargetCellId()
    
    return hasSource && !hasTarget
  }

  /**
   * 创建预览线可见性报告
   * @returns {Object} 报告
   */
  generateVisibilityReport() {
    const diagnosis = this.diagnoseVisibilityIssues()
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPreviewLines: diagnosis.totalPreviewLines,
        visibleLines: diagnosis.visibleLines,
        invisibleLines: diagnosis.invisibleLines,
        visibilityRate: diagnosis.totalPreviewLines > 0 ? 
          (diagnosis.visibleLines / diagnosis.totalPreviewLines * 100).toFixed(1) + '%' : '0%'
      },
      issues: diagnosis.diagnostics.filter(d => d.issues.length > 0),
      recommendations: []
    }
    
    if (diagnosis.invisibleLines > 0) {
      report.recommendations.push('建议运行修复工具修复不可见的预览线')
    }
    
    if (diagnosis.fixableIssues > 0) {
      report.recommendations.push(`发现 ${diagnosis.fixableIssues} 个可修复的问题`)
    }
    
    return report
  }
}

export default PreviewLineVisibilityFixer