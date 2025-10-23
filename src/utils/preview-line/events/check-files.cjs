/**
 * 检查事件管理模块文件
 */

const fs = require('fs');
const path = require('path');

console.log('=== 事件管理模块文件检查 ===');

const eventsDir = __dirname;
const files = ['EventManager.js', 'EventHandler.js', 'index.js'];

let allFilesExist = true;

files.forEach(file => {
    const filePath = path.join(eventsDir, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✓ ${file} - 文件大小: ${stats.size} bytes`);
    } else {
        console.log(`✗ ${file} - 文件不存在`);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    console.log('\n🎉 所有事件管理模块文件都已成功创建！');
    console.log('\n模块功能:');
    console.log('- EventManager.js: 提供事件监听、触发、管理功能');
    console.log('- EventHandler.js: 提供事件处理、验证、转换功能');
    console.log('- index.js: 统一导出接口和工厂函数');
    console.log('\n事件管理模块创建完成！');
} else {
    console.log('\n❌ 部分文件缺失，请检查文件创建情况');
}