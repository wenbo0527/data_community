// 测试用户887123的API数据获取
import { fetchUserInfo } from './src/mock/customer360.ts';

console.log('🚀 开始测试用户887123的API调用...');

async function testUserData() {
  try {
    console.log('📞 调用 fetchUserInfo("887123")...');
    const result = await fetchUserInfo('887123');
    
    console.log('✅ API调用成功');
    console.log('📊 数据概览:');
    console.log('  - 用户ID:', result.userId);
    console.log('  - 用户姓名:', result.name);
    console.log('  - 是否有错误:', !!result.error);
    console.log('  - 数据键数量:', Object.keys(result).length);
    
    console.log('📈 产品数据:');
    console.log('  - 存款产品数量:', result.depositProducts?.length || 0);
    console.log('  - 贷款产品数量:', result.loanProducts?.length || 0);
    console.log('  - 授信记录数量:', result.creditsList?.length || 0);
    console.log('  - 用信记录数量:', result.loanRecords?.length || 0);
    console.log('  - 调额历史数量:', result.quotaAdjustHistory?.length || 0);
    
    console.log('🔍 关键字段检查:');
    console.log('  - basicInfo存在:', !!result.basicInfo);
    console.log('  - depositProducts存在:', !!result.depositProducts);
    console.log('  - loanProducts存在:', !!result.loanProducts);
    console.log('  - creditsList存在:', !!result.creditsList);
    console.log('  - loanRecords存在:', !!result.loanRecords);
    console.log('  - quotaAdjustHistory存在:', !!result.quotaAdjustHistory);
    
    if (result.depositProducts && result.depositProducts.length > 0) {
      console.log('💰 第一个存款产品:');
      const firstDeposit = result.depositProducts[0];
      console.log('  - 产品名称:', firstDeposit.name);
      console.log('  - 余额:', firstDeposit.balance);
      console.log('  - 状态:', firstDeposit.status);
    }
    
    if (result.loanProducts && result.loanProducts.length > 0) {
      console.log('🏦 第一个贷款产品:');
      const firstLoan = result.loanProducts[0];
      console.log('  - 产品名称:', firstLoan.name);
      console.log('  - 余额:', firstLoan.balance);
      console.log('  - 状态:', firstLoan.status);
    }
    
    console.log('\n📋 完整数据结构:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ API调用失败:', error);
  }
}

testUserData();