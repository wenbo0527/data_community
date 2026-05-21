// 测试window.previewLineSystem全局可用性
console.log('=== 开始测试 window.previewLineSystem ===');

// 1. 检查是否存在
if (typeof window !== 'undefined' && window.previewLineSystem) {
    console.log('✅ window.previewLineSystem 存在');
    console.log('类型:', typeof window.previewLineSystem);
    console.log('构造函数:', window.previewLineSystem.constructor.name);
    
    // 2. 检查关键方法
    const methods = [
        'init', 'createPreviewLine', 'updatePreviewLine', 'clearPreviewLines',
        'setLayoutEngine', 'updateLayoutDirection', 'validateAndCleanupDuplicates'
    ];
    
    console.log('\n=== 检查关键方法 ===');
    methods.forEach(method => {
        if (typeof window.previewLineSystem[method] === 'function') {
            console.log(`✅ ${method}: 可用`);
        } else {
            console.log(`❌ ${method}: 不可用`);
        }
    });
    
    // 3. 检查系统状态
    console.log('\n=== 系统状态 ===');
    try {
        console.log('初始化状态:', window.previewLineSystem.isInitialized || '未知');
        console.log('布局引擎状态:', window.previewLineSystem.layoutEngine ? '已设置' : '未设置');
        console.log('事件管理器状态:', window.previewLineSystem.eventManager ? '已设置' : '未设置');
    } catch (error) {
        console.log('获取状态时出错:', error.message);
    }
    
    // 4. 测试基本功能
    console.log('\n=== 测试基本功能 ===');
    try {
        // 测试清理功能
        if (typeof window.previewLineSystem.clearPreviewLines === 'function') {
            window.previewLineSystem.clearPreviewLines();
            console.log('✅ clearPreviewLines 调用成功');
        }
        
        // 测试验证功能
        if (typeof window.previewLineSystem.validateAndCleanupDuplicates === 'function') {
            window.previewLineSystem.validateAndCleanupDuplicates();
            console.log('✅ validateAndCleanupDuplicates 调用成功');
        }
    } catch (error) {
        console.log('❌ 功能测试失败:', error.message);
    }
    
} else {
    console.log('❌ window.previewLineSystem 不存在');
    console.log('window对象存在:', typeof window !== 'undefined');
    
    // 检查window对象中相关属性
    if (typeof window !== 'undefined') {
        const relatedProps = Object.keys(window).filter(key => 
            key.toLowerCase().includes('preview') || 
            key.toLowerCase().includes('layout') || 
            key.toLowerCase().includes('engine')
        );
        console.log('相关属性:', relatedProps);
    }
}

console.log('\n=== 测试完成 ===');