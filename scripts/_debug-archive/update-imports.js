#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 定义路径映射规则
const pathMappings = [
  // Components 映射
  {
    from: /from\s+['"]@\/components\/ConnectionContextMenu['"]/g,
    to: "from '@/pages/marketing/tasks/components/canvas/ConnectionContextMenu'"
  },
  {
    from: /from\s+['"]@\/components\/nodes\/FlowNode['"]/g,
    to: "from '@/pages/marketing/tasks/components/canvas/FlowNode'"
  },
  {
    from: /from\s+['"]@\/components\/drawers\/NodeConfigDrawer['"]/g,
    to: "from '@/pages/marketing/tasks/components/canvas/NodeConfigDrawer'"
  },
  {
    from: /from\s+['"]@\/components\/selectors\/NodeTypeSelector['"]/g,
    to: "from '@/pages/marketing/tasks/components/canvas/NodeTypeSelector'"
  },
  {
    from: /from\s+['"]@\/components\/PreviewLineStyleConfig['"]/g,
    to: "from '@/pages/marketing/tasks/components/canvas/PreviewLineStyleConfig'"
  },
  {
    from: /from\s+['"]@\/components\/workflow\//g,
    to: "from '@/pages/marketing/tasks/components/workflow/"
  },
  {
    from: /from\s+['"]@\/components\/workflow-editor\//g,
    to: "from '@/pages/marketing/tasks/components/workflow-editor/"
  },

  // Composables 映射
  {
    from: /from\s+['"]@\/composables\/useCanvasExport['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasExport'"
  },
  {
    from: /from\s+['"]@\/composables\/useBaseDrawer['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useBaseDrawer'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasConnection['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasConnection'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasDragDrop['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasDragDrop'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasEvents['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasEvents'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasHistory['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasHistory'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasKeyboard['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasKeyboard'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasNodes['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasNodes'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasSelection['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasSelection'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasValidation['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasValidation'"
  },
  {
    from: /from\s+['"]@\/composables\/useCanvasZoom['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useCanvasZoom'"
  },
  {
    from: /from\s+['"]@\/composables\/useNodeConfig['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useNodeConfig'"
  },
  {
    from: /from\s+['"]@\/composables\/useNodeConnection['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useNodeConnection'"
  },
  {
    from: /from\s+['"]@\/composables\/usePreviewLine['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/usePreviewLine'"
  },
  {
    from: /from\s+['"]@\/composables\/useWorkflowCanvas['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useWorkflowCanvas'"
  },
  {
    from: /from\s+['"]@\/composables\/layout\//g,
    to: "from '@/pages/marketing/tasks/composables/layout/"
  },

  // Utils 映射
  {
    from: /from\s+['"]@\/utils\/enhancedCanvasValidation['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/enhancedCanvasValidation'"
  },
  {
    from: /from\s+['"]@\/utils\/NodeConfigManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/NodeConfigManager'"
  },
  {
    from: /from\s+['"]@\/utils\/workflowNodeCreator['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/workflowNodeCreator'"
  },
  {
    from: /from\s+['"]@\/utils\/PreviewLineStyleManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/PreviewLineStyleManager'"
  },
  {
    from: /from\s+['"]@\/utils\/workflowNodeTypes['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/workflowNodeTypes'"
  },
  {
    from: /from\s+['"]@\/utils\/EndNodeConfig['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/EndNodeConfig'"
  },
  {
    from: /from\s+['"]@\/utils\/portConfigFactory['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/portConfigFactory'"
  },
  {
    from: /from\s+['"]@\/utils\/canvasValidation['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/canvasValidation'"
  },
  {
    from: /from\s+['"]@\/utils\/connectionConfigFactory['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/connectionConfigFactory'"
  },
  {
    from: /from\s+['"]@\/utils\/CanvasPanZoomManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/CanvasPanZoomManager'"
  },
  {
    from: /from\s+['"]@\/utils\/UnifiedPreviewLineManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/UnifiedPreviewLineManager'"
  },
  {
    from: /from\s+['"]@\/utils\/x6Config['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/x6Config'"
  },
  {
    from: /from\s+['"]@\/utils\/canvasConfig['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/canvasConfig'"
  },
  {
    from: /from\s+['"]@\/utils\/previewConfig['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/previewConfig'"
  },
  {
    from: /from\s+['"]@\/utils\/GlobalDragStateManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/GlobalDragStateManager'"
  },
  {
    from: /from\s+['"]@\/utils\/CoordinateSystemManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/CoordinateSystemManager'"
  },
  {
    from: /from\s+['"]@\/utils\/nodeConnectionHelper['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/nodeConnectionHelper'"
  },
  {
    from: /from\s+['"]@\/utils\/EdgeOverlapManager['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/EdgeOverlapManager'"
  },
  {
    from: /from\s+['"]@\/utils\/branchSpacingConfig['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/branchSpacingConfig'"
  },
  {
    from: /from\s+['"]@\/utils\/uiOptimizationConfig['"]/g,
    to: "from '@/pages/marketing/tasks/utils/canvas/uiOptimizationConfig'"
  },
  {
    from: /from\s+['"]@\/utils\/coordinate-refactor\//g,
    to: "from '@/pages/marketing/tasks/utils/coordinate-refactor/"
  },

  // Types 映射
  {
    from: /from\s+['"]@\/types\/canvas['"]/g,
    to: "from '@/pages/marketing/tasks/types/canvas'"
  },
  {
    from: /from\s+['"]@\/types\/nodeDrawerConfig['"]/g,
    to: "from '@/pages/marketing/tasks/types/nodeDrawerConfig'"
  },
  {
    from: /from\s+['"]@\/types\/workflow['"]/g,
    to: "from '@/pages/marketing/tasks/types/workflow'"
  },
  {
    from: /from\s+['"]@\/types\/startNodeConfig['"]/g,
    to: "from '@/pages/marketing/tasks/types/startNodeConfig'"
  },
  {
    from: /from\s+['"]@\/types\/connectionPreview['"]/g,
    to: "from '@/pages/marketing/tasks/types/connectionPreview'"
  },

  // Composables 额外映射
  {
    from: /from\s+['"]@\/composables\/useStartNodeForm['"]/g,
    to: "from '@/pages/marketing/tasks/composables/canvas/useStartNodeForm'"
  },

  // Core 映射
  {
    from: /from\s+['"]@\/core\/interaction\/NodeConnectionOptimizer['"]/g,
    to: "from '@/pages/marketing/tasks/core/interaction/NodeConnectionOptimizer'"
  },

  // Config 映射
  {
    from: /from\s+['"]@\/config\/canvasAutomationConfig['"]/g,
    to: "from '@/pages/marketing/tasks/config/canvasAutomationConfig'"
  },

  // Constants 映射
  {
    from: /from\s+['"]@\/constants\/startNodeConfig['"]/g,
    to: "from '@/pages/marketing/tasks/constants/startNodeConfig'"
  },

  // 已迁移到目标路径的文件内部引用更新
  {
    from: /from\s+['"]@\/pages\/marketing\/tasks\/utils\/canvas\//g,
    to: "from '@/pages/marketing/tasks/utils/canvas/"
  },
  {
    from: /from\s+['"]@\/pages\/marketing\/tasks\/composables\/canvas\//g,
    to: "from '@/pages/marketing/tasks/composables/canvas/"
  },
  {
    from: /from\s+['"]@\/pages\/marketing\/tasks\/components\/canvas\//g,
    to: "from '@/pages/marketing/tasks/components/canvas/"
  }
];

// 递归遍历目录
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git 目录
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walkDir(filePath, callback);
      }
    } else if (stat.isFile() && (file.endsWith('.vue') || file.endsWith('.js') || file.endsWith('.ts'))) {
      callback(filePath);
    }
  });
}

// 更新文件内容
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    pathMappings.forEach(mapping => {
      if (mapping.from.test(content)) {
        content = content.replace(mapping.from, mapping.to);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// 主函数
function main() {
  console.log('🚀 开始批量更新 import 路径...');
  
  const projectRoot = process.cwd();
  let updatedCount = 0;
  let totalCount = 0;
  
  walkDir(projectRoot, (filePath) => {
    totalCount++;
    if (updateFile(filePath)) {
      updatedCount++;
    }
  });
  
  console.log(`\n📊 更新完成！`);
  console.log(`   - 总文件数: ${totalCount}`);
  console.log(`   - 更新文件数: ${updatedCount}`);
  console.log(`   - 跳过文件数: ${totalCount - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n🔍 建议运行以下命令检查更新结果:');
    console.log('   npm run lint');
    console.log('   npm run build');
  }
}// 执行主函数
main().catch(console.error);

export { main, updateFile, pathMappings };