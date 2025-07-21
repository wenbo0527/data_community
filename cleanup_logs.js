const fs = require('fs');
const path = require('path');

// 需要清理的文件列表
const filesToClean = [
  'src/pages/marketing/tasks/components/TaskFlowCanvas.vue',
  'src/utils/UnifiedPreviewLineManager.js',
  'src/utils/ConnectionPreviewManager.js'
];

// 清理函数
function cleanupLogs(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 删除所有包含特定标识的console.log语句
    const patterns = [
      /console\.log\('🚀 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('📡 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('✅ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('⏭️ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('✨ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🌿 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🔄 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('📊 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🎯 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🖱️ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🔗 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('👻 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🧹 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🏷️ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🗑️ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🔍 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('⚠️ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('📏 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('📝 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('⏳ \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('💡 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🏁 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('🔥 \[统一预览线管理器\].*?\)\s*\n?/g,
      /console\.log\('\[TaskFlowCanvas\].*?\)\s*\n?/g,
      /console\.log\('🔍 \[自动连接\].*?\)\s*\n?/g,
      /console\.log\('🎯 \[自动连接\].*?\)\s*\n?/g,
      /console\.log\('🏷️ \[自动连接\].*?\)\s*\n?/g,
      /console\.log\('✅ \[自动连接\].*?\)\s*\n?/g,
      /console\.log\('🔗 \[TaskFlowCanvas\].*?\)\s*\n?/g,
      /console\.log\('🗑️ \[TaskFlowCanvas\].*?\)\s*\n?/g,
      /console\.log\('🎯 \[TaskFlowCanvas\].*?\)\s*\n?/g,
      /console\.log\('🧪 \[TaskFlowCanvas\].*?\)\s*\n?/g,
      /console\.log\('🔧 \[TaskFlowCanvas\].*?\)\s*\n?/g,
      /console\.log\('🔍 \[TaskFlowCanvas\].*?\)\s*\n?/g
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // 删除多余的空行
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 已清理文件: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ 清理文件失败 ${filePath}:`, error.message);
  }
}

// 执行清理
console.log('🧹 开始清理调试日志...');
filesToClean.forEach(cleanupLogs);
console.log('✅ 调试日志清理完成!');