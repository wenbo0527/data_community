// dmt-app standard store (minimal)
export const StandardStore = {
  state: function() { return {} },
  actions: {},
  getStandards: function() {
    return [
      { id: 'STD001', standardNo: 'STD_ID_001', chineseName: 'customer_id', code: 'CUST_ID', name: 'customer_id', category: 'customer', description: 'global customer id', owner: 'customer team', status: 'published', updatedAt: '2026-07-01' },
      { id: 'STD002', standardNo: 'STD_ID_002', chineseName: 'id_card', code: 'ID_CARD_NO', name: 'id_card', category: 'customer', description: 'china id card no', owner: 'customer team', status: 'published', updatedAt: '2026-07-01' },
      { id: 'STD003', standardNo: 'STD_ID_003', chineseName: 'mobile', code: 'MOBILE_NO', name: 'mobile', category: 'customer', description: 'mobile phone', owner: 'customer team', status: 'published', updatedAt: '2026-07-01' },
      { id: 'STD004', standardNo: 'STD_AMT_001', chineseName: 'order_no', code: 'ORDER_NO', name: 'order_no', category: 'trade', description: 'order no', owner: 'trade team', status: 'published', updatedAt: '2026-06-28' },
      { id: 'STD005', standardNo: 'STD_AMT_002', chineseName: 'pay_amount', code: 'PAY_AMT', name: 'pay_amount', category: 'trade', description: 'pay amount', owner: 'trade team', status: 'published', updatedAt: '2026-06-25' },
      { id: 'STD006', standardNo: 'STD_AMT_003', chineseName: 'loan_amount', code: 'LOAN_AMT', name: 'loan_amount', category: 'trade', description: 'loan amount', owner: 'trade team', status: 'published', updatedAt: '2026-06-25' },
      { id: 'STD007', standardNo: 'STD_NUM_001', chineseName: 'overdue_days', code: 'OVERDUE_DAYS', name: 'overdue_days', category: 'risk', description: 'overdue days', owner: 'risk team', status: 'published', updatedAt: '2026-06-20' }
    ]
  }
}

export default StandardStore