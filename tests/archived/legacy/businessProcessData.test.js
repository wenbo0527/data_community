import { describe, it, expect } from 'vitest'
import { processSteps, ProcessStatus, ApprovalStatus, DataQualityLevel } from '../src/mock/businessProcessData.ts'

describe('BusinessProcessData 优化测试', () => {
  describe('数据结构完整性测试', () => {
    it('应该包含所有必需的业务流程', () => {
      expect(processSteps).toBeDefined()
      expect(Array.isArray(processSteps)).toBe(true)
      expect(processSteps.length).toBeGreaterThan(5)
      
      // 验证核心业务流程存在
      const processNames = processSteps.map(step => step.name)
      expect(processNames).toContain('注册')
      expect(processNames).toContain('实名')
      expect(processNames).toContain('营销活动')
      expect(processNames).toContain('数据质量监控')
    })

    it('每个流程步骤应该包含完整的字段', () => {
      processSteps.forEach(step => {
        expect(step).toHaveProperty('name')
        expect(step).toHaveProperty('description')
        expect(step).toHaveProperty('icon')
        expect(step).toHaveProperty('owner')
        expect(step).toHaveProperty('order')
        expect(step).toHaveProperty('status')
        expect(step).toHaveProperty('businessDomain')
        expect(step).toHaveProperty('estimatedDuration')
        expect(step).toHaveProperty('riskLevel')
        expect(step).toHaveProperty('tables')
        expect(step).toHaveProperty('prerequisites')
        expect(step).toHaveProperty('nextSteps')
      })
    })
  })

  describe('枚举类型测试', () => {
    it('ProcessStatus 枚举应该包含所有状态', () => {
      expect(ProcessStatus.PENDING).toBe('pending')
      expect(ProcessStatus.IN_PROGRESS).toBe('in_progress')
      expect(ProcessStatus.COMPLETED).toBe('completed')
      expect(ProcessStatus.FAILED).toBe('failed')
      expect(ProcessStatus.CANCELLED).toBe('cancelled')
    })

    it('ApprovalStatus 枚举应该包含所有审批状态', () => {
      expect(ApprovalStatus.SUBMITTED).toBe('submitted')
      expect(ApprovalStatus.UNDER_REVIEW).toBe('under_review')
      expect(ApprovalStatus.APPROVED).toBe('approved')
      expect(ApprovalStatus.REJECTED).toBe('rejected')
      expect(ApprovalStatus.CANCELLED).toBe('cancelled')
    })

    it('DataQualityLevel 枚举应该包含所有质量等级', () => {
      expect(DataQualityLevel.HIGH).toBe('high')
      expect(DataQualityLevel.MEDIUM).toBe('medium')
      expect(DataQualityLevel.LOW).toBe('low')
    })
  })

  describe('表结构验证测试', () => {
    it('每个表应该包含完整的元数据', () => {
      processSteps.forEach(step => {
        step.tables.forEach(table => {
          expect(table).toHaveProperty('name')
          expect(table).toHaveProperty('description')
          expect(table).toHaveProperty('usage')
          expect(table).toHaveProperty('type')
          expect(table).toHaveProperty('owner')
          expect(table).toHaveProperty('dataSource')
          expect(table).toHaveProperty('updateFrequency')
          expect(table).toHaveProperty('dataVolume')
          expect(table).toHaveProperty('fields')
          expect(table).toHaveProperty('metrics')
          expect(table).toHaveProperty('dependencies')
        })
      })
    })

    it('每个字段应该包含完整的定义', () => {
      processSteps.forEach(step => {
        step.tables.forEach(table => {
          table.fields.forEach(field => {
            expect(field).toHaveProperty('name')
            expect(field).toHaveProperty('type')
            expect(field).toHaveProperty('description')
            expect(field).toHaveProperty('usage')
            expect(field).toHaveProperty('required')
            expect(field).toHaveProperty('qualityLevel')
            expect(field).toHaveProperty('businessImportance')
            
            // 验证质量等级是有效值
            expect(['high', 'medium', 'low']).toContain(field.qualityLevel)
            
            // 验证业务重要性是有效值
            expect(['critical', 'important', 'normal']).toContain(field.businessImportance)
          })
        })
      })
    })
  })

  describe('业务指标验证测试', () => {
    it('每个指标应该包含完整的定义', () => {
      processSteps.forEach(step => {
        step.tables.forEach(table => {
          table.metrics.forEach(metric => {
            expect(metric).toHaveProperty('name')
            expect(metric).toHaveProperty('description')
            expect(metric).toHaveProperty('formula')
            expect(metric).toHaveProperty('type')
            expect(metric).toHaveProperty('unit')
            expect(metric).toHaveProperty('owner')
            expect(metric).toHaveProperty('businessMeaning')
            expect(metric).toHaveProperty('calculationPeriod')
          })
        })
      })
    })

    it('指标类型应该是有效值', () => {
      const validMetricTypes = ['count', 'rate', 'avg', 'sum', 'ratio']
      
      processSteps.forEach(step => {
        step.tables.forEach(table => {
          table.metrics.forEach(metric => {
            expect(validMetricTypes).toContain(metric.type)
          })
        })
      })
    })
  })

  describe('审批流程测试', () => {
    it('营销活动应该包含审批流程', () => {
      const marketingProcess = processSteps.find(step => step.name === '营销活动')
      expect(marketingProcess).toBeDefined()
      expect(marketingProcess.approvalProcess).toBeDefined()
      expect(Array.isArray(marketingProcess.approvalProcess)).toBe(true)
      expect(marketingProcess.approvalProcess.length).toBeGreaterThan(0)
      
      const approval = marketingProcess.approvalProcess[0]
      expect(approval).toHaveProperty('processId')
      expect(approval).toHaveProperty('stepName')
      expect(approval).toHaveProperty('approver')
      expect(approval).toHaveProperty('status')
      expect(approval).toHaveProperty('authorityLevel')
      expect(approval).toHaveProperty('deadline')
    })
  })

  describe('SLA要求测试', () => {
    it('每个流程应该包含SLA要求', () => {
      processSteps.forEach(step => {
        if (step.slaRequirements) {
          expect(step.slaRequirements).toHaveProperty('maxDuration')
          expect(step.slaRequirements).toHaveProperty('successRate')
          expect(step.slaRequirements).toHaveProperty('errorThreshold')
          
          expect(typeof step.slaRequirements.maxDuration).toBe('number')
          expect(step.slaRequirements.successRate).toBeGreaterThan(0)
          expect(step.slaRequirements.successRate).toBeLessThanOrEqual(1)
          expect(step.slaRequirements.errorThreshold).toBeGreaterThanOrEqual(0)
          expect(step.slaRequirements.errorThreshold).toBeLessThan(1)
        }
      })
    })
  })

  describe('数据质量监控流程测试', () => {
    it('数据质量监控流程应该包含监控配置', () => {
      const dqProcess = processSteps.find(step => step.name === '数据质量监控')
      expect(dqProcess).toBeDefined()
      expect(dqProcess.monitoring).toBeDefined()
      
      const monitoring = dqProcess.monitoring
      expect(monitoring).toHaveProperty('processId')
      expect(monitoring).toHaveProperty('stepName')
      expect(monitoring).toHaveProperty('startTime')
      expect(monitoring).toHaveProperty('status')
      expect(monitoring).toHaveProperty('performanceMetrics')
      
      const metrics = monitoring.performanceMetrics
      expect(metrics).toHaveProperty('cpuUsage')
      expect(metrics).toHaveProperty('memoryUsage')
      expect(metrics).toHaveProperty('throughput')
    })

    it('数据质量规则表应该包含完整字段', () => {
      const dqProcess = processSteps.find(step => step.name === '数据质量监控')
      const rulesTable = dqProcess.tables.find(table => table.name === 'data_quality_rules')
      
      expect(rulesTable).toBeDefined()
      expect(rulesTable.fields.length).toBeGreaterThan(5)
      
      const fieldNames = rulesTable.fields.map(field => field.name)
      expect(fieldNames).toContain('rule_id')
      expect(fieldNames).toContain('rule_name')
      expect(fieldNames).toContain('table_name')
      expect(fieldNames).toContain('field_name')
      expect(fieldNames).toContain('rule_type')
      expect(fieldNames).toContain('rule_expression')
    })
  })

  describe('营销活动流程测试', () => {
    it('营销活动应该包含完整的表结构', () => {
      const marketingProcess = processSteps.find(step => step.name === '营销活动')
      expect(marketingProcess).toBeDefined()
      expect(marketingProcess.tables.length).toBe(2)
      
      const campaignTable = marketingProcess.tables.find(table => table.name === 'marketing_campaign')
      const participationTable = marketingProcess.tables.find(table => table.name === 'campaign_participation')
      
      expect(campaignTable).toBeDefined()
      expect(participationTable).toBeDefined()
      
      // 验证营销活动表字段
      const campaignFields = campaignTable.fields.map(field => field.name)
      expect(campaignFields).toContain('campaign_id')
      expect(campaignFields).toContain('campaign_name')
      expect(campaignFields).toContain('budget')
      expect(campaignFields).toContain('target_audience')
      
      // 验证参与记录表字段
      const participationFields = participationTable.fields.map(field => field.name)
      expect(participationFields).toContain('participation_id')
      expect(participationFields).toContain('campaign_id')
      expect(participationFields).toContain('user_id')
      expect(participationFields).toContain('participation_time')
    })

    it('营销活动指标应该包含ROI计算', () => {
      const marketingProcess = processSteps.find(step => step.name === '营销活动')
      const campaignTable = marketingProcess.tables.find(table => table.name === 'marketing_campaign')
      
      const roiMetric = campaignTable.metrics.find(metric => metric.name === '活动ROI')
      expect(roiMetric).toBeDefined()
      expect(roiMetric.formula).toContain('revenue')
      expect(roiMetric.formula).toContain('cost')
      expect(roiMetric.type).toBe('ratio')
      expect(roiMetric.unit).toBe('%')
    })
  })
})