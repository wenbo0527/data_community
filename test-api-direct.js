// 直接测试API调用
import { fetchUserInfo } from './src/mock/customer360.ts';

console.log('🚀 开始直接测试API调用...');

async function testApi() {
  try {
    console.log('📞 调用 fetchUserInfo("887123")...');
    const result = await fetchUserInfo('887123');
    
    console.log('✅ API调用成功');
    console.log('📊 返回数据类型:', typeof result);
    console.log('📊 返回数据是否为null:', result === null);
    console.log('📊 返回数据是否为undefined:', result === undefined);
    
    if (result) {
      console.log('📊 返回数据键:', Object.keys(result));
      console.log('📊 是否有error属性:', 'error' in result);
      console.log('📊 是否有basicInfo:', 'basicInfo' in result);
      
      if (result.error) {
        console.log('❌ API返回错误:', result.error);
        console.log('❌ 错误消息:', result.message);
      } else {
        console.log('✅ API返回正常数据');
        console.log('👤 用户姓名:', result.basicInfo?.name);
        console.log('📱 用户手机:', result.basicInfo?.phone);
        console.log('🏦 自营产品数量:', result.selfProducts?.length || 0);
        console.log('💰 助贷产品数量:', result.loanProducts?.length || 0);
      }
    } else {
      console.log('❌ API返回null或undefined');
    }
    
  } catch (error) {
    console.error('❌ API调用异常:');
    console.error('  错误类型:', error.constructor.name);
    console.error('  错误消息:', error.message);
    console.error('  错误堆栈:', error.stack);
  }
}

// 测试多次调用
async function testMultipleCalls() {
  console.log('\n🔄 测试多次API调用...');
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- 第${i}次调用 ---`);
    await testApi();
    
    // 等待一秒
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// 运行测试
testMultipleCalls().then(() => {
  console.log('\n🎉 所有测试完成');
}).catch(error => {
  console.error('\n💥 测试过程中出现异常:', error);
});