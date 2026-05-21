// 测试fetchUserInfo函数的直接调用
import { fetchUserInfo } from './src/mock/customer360.ts';

console.log('🚀 开始测试fetchUserInfo函数...');

async function testFetchUserInfo() {
  try {
    console.log('📞 调用 fetchUserInfo("887123")...');
    console.log('⏰ 调用时间:', new Date().toISOString());
    
    const result = await fetchUserInfo('887123');
    
    console.log('✅ fetchUserInfo调用完成');
    console.log('📊 返回结果类型:', typeof result);
    console.log('📊 返回结果是否为null:', result === null);
    console.log('📊 返回结果是否为undefined:', result === undefined);
    
    if (result) {
      console.log('📊 返回数据键:', Object.keys(result));
      console.log('📊 是否有错误:', !!result.error);
      console.log('📊 用户ID:', result.userId);
      console.log('📊 用户姓名:', result.name);
      console.log('📊 基本信息存在:', !!result.basicInfo);
      console.log('📊 存款产品数量:', result.depositProducts?.length || 0);
      console.log('📊 贷款产品数量:', result.loanProducts?.length || 0);
      console.log('📊 贷款记录数量:', result.loanRecords?.length || 0);
      console.log('📊 信用记录数量:', result.creditsList?.length || 0);
      
      // 详细输出完整数据结构
      console.log('📋 完整数据结构:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ 返回数据为空');
    }
    
  } catch (error) {
    console.error('💥 fetchUserInfo调用失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 执行测试
testFetchUserInfo();

console.log('🏁 测试脚本执行完成');