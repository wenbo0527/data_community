import { Message } from '@arco-design/web-vue'

/**
 * 快速复制服务
 * 提供多种数据格式的复制功能
 */
class CopyService {
  /**
   * 复制文本到剪贴板
   */
  async copyText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // 降级方案
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
      
      Message.success('复制成功')
      return true
    } catch (error) {
      console.error('复制失败:', error)
      Message.error('复制失败')
      return false
    }
  }

  /**
   * 复制JSON数据
   */
  async copyJSON(data: any, formatted = true): Promise<boolean> {
    try {
      const jsonString = formatted 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data)
      return await this.copyText(jsonString)
    } catch (error) {
      console.error('JSON复制失败:', error)
      Message.error('JSON复制失败')
      return false
    }
  }

  /**
   * 复制表格数据
   */
  async copyTableData(data: any[], headers?: string[]): Promise<boolean> {
    try {
      let result = ''
      
      // 添加表头
      if (headers && headers.length > 0) {
        result += headers.join('\t') + '\n'
      }
      
      // 添加数据行
      data.forEach(row => {
        if (Array.isArray(row)) {
          result += row.join('\t') + '\n'
        } else if (typeof row === 'object') {
          const values = headers 
            ? headers.map(header => row[header] || '')
            : Object.values(row)
          result += values.join('\t') + '\n'
        }
      })
      
      return await this.copyText(result)
    } catch (error) {
      console.error('表格数据复制失败:', error)
      Message.error('表格数据复制失败')
      return false
    }
  }

  /**
   * 复制用户基本信息
   */
  async copyBasicInfo(basicInfo: any): Promise<boolean> {
    try {
      const info = [
        `客户姓名: ${basicInfo.name}`,
        `身份证号: ${basicInfo.idCard}`,
        `手机号码: ${basicInfo.phone}`,
        `风险等级: ${basicInfo.riskLevel}`,
        `账户状态: ${basicInfo.accountStatus}`,
        `注册时间: ${basicInfo.registerTime}`,
        `最后登录: ${basicInfo.lastLoginTime}`
      ].join('\n')
      
      return await this.copyText(info)
    } catch (error) {
      console.error('基本信息复制失败:', error)
      Message.error('基本信息复制失败')
      return false
    }
  }

  /**
   * 复制产品信息
   */
  async copyProductInfo(productInfo: any): Promise<boolean> {
    try {
      let info = '产品信息:\n'
      
      if (productInfo.deposits && productInfo.deposits.length > 0) {
        info += '\n存款产品:\n'
        productInfo.deposits.forEach((deposit: any, index: number) => {
          info += `${index + 1}. ${deposit.productName} - 余额: ${deposit.balance}\n`
        })
      }
      
      if (productInfo.loans && productInfo.loans.length > 0) {
        info += '\n贷款产品:\n'
        productInfo.loans.forEach((loan: any, index: number) => {
          info += `${index + 1}. ${loan.productName} - 余额: ${loan.balance}\n`
        })
      }
      
      return await this.copyText(info)
    } catch (error) {
      console.error('产品信息复制失败:', error)
      Message.error('产品信息复制失败')
      return false
    }
  }

  /**
   * 复制催收记录
   */
  async copyCollectionRecord(record: any): Promise<boolean> {
    try {
      const info = [
        `催收时间: ${record.collectionTime}`,
        `催收方式: ${record.collectionMethod}`,
        `催收金额: ${record.amount}`,
        `催收结果: ${record.result}`,
        `催收员: ${record.collector}`,
        `备注: ${record.remarks || '无'}`
      ].join('\n')
      
      return await this.copyText(info)
    } catch (error) {
      console.error('催收记录复制失败:', error)
      Message.error('催收记录复制失败')
      return false
    }
  }

  /**
   * 复制征信记录
   */
  async copyCreditRecord(record: any): Promise<boolean> {
    try {
      const info = [
        `报告类型: ${record.reportType}`,
        `报告来源: ${record.source}`,
        `征信评分: ${record.creditScore}`,
        `征信等级: ${record.creditLevel}`,
        `生成时间: ${record.generatedTime}`,
        `有效期至: ${record.validUntil}`
      ].join('\n')
      
      return await this.copyText(info)
    } catch (error) {
      console.error('征信记录复制失败:', error)
      Message.error('征信记录复制失败')
      return false
    }
  }

  /**
   * 复制营销记录
   */
  async copyMarketingRecord(record: any, type?: string): Promise<boolean> {
    try {
      let info: string
      
      if (type === 'benefit') {
        // 权益发放记录
        info = [
          `权益名称: ${record.benefitName}`,
          `权益类型: ${record.benefitType}`,
          `发放时间: ${record.benefitDate}`,
          `权益价值: ${record.benefitValue}`,
          `权益状态: ${record.benefitStatus}`,
          `有效期至: ${record.expiryDate}`
        ].join('\n')
      } else {
        // 营销触达记录
        info = [
          `活动名称: ${record.campaignName}`,
          `触达渠道: ${record.touchChannel}`,
          `触达时间: ${record.touchDate}`,
          `活动类型: ${record.campaignType}`,
          `触达结果: ${record.touchResult}`,
          `转化价值: ${record.conversionValue}`
        ].join('\n')
      }
      
      return await this.copyText(info)
    } catch (error) {
      console.error('营销记录复制失败:', error)
      Message.error('营销记录复制失败')
      return false
    }
  }

  /**
   * 复制用信记录
   */
  async copyLoanRecord(record: any): Promise<boolean> {
    try {
      const info = [
        `贷款产品: ${record.productName}`,
        `放款金额: ${record.amount}`,
        `贷款期限: ${record.installments}期`,
        `放款时间: ${record.loanDate}`,
        `贷款状态: ${record.status}`,
        `剩余本金: ${record.balance}`,
        `合同编号: ${record.contractNo}`
      ].join('\n')
      
      return await this.copyText(info)
    } catch (error) {
      console.error('用信记录复制失败:', error)
      Message.error('用信记录复制失败')
      return false
    }
  }

  /**
   * 批量复制数据
   */
  async copyBatch(records: any[], formatter?: (record: any) => string): Promise<boolean> {
    try {
      let result = ''
      
      records.forEach((record, index) => {
        if (formatter) {
          result += formatter(record)
        } else {
          result += JSON.stringify(record, null, 2)
        }
        
        if (index < records.length - 1) {
          result += '\n\n---\n\n'
        }
      })
      
      return await this.copyText(result)
    } catch (error) {
      console.error('批量复制失败:', error)
      Message.error('批量复制失败')
      return false
    }
  }
}

export default new CopyService()