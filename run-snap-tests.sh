#!/bin/bash

# 预览线终端吸附功能测试运行脚本
# 用于调试预览线拖拽吸附问题

echo "🚀 开始运行预览线终端吸附功能测试..."
echo "📋 测试覆盖范围:"
echo "  ✅ 拖拽事件处理"
echo "  ✅ 节点吸附检测算法"
echo "  ✅ 坐标系转换准确性"
echo "  ✅ 吸附距离阈值配置"
echo "  ✅ 拖拽状态管理"
echo "  ✅ 视觉反馈和高亮显示"
echo "  ✅ 连接创建验证"
echo "  ✅ 综合场景测试"
echo ""

# 运行测试
npx vitest run src/tests/tdd-preview-line-endpoint-snap.test.js --reporter=verbose

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 所有测试通过！预览线终端吸附功能正常"
    echo "💡 如果实际使用中仍有问题，请检查:"
    echo "   - 坐标系转换是否正确"
    echo "   - 吸附距离阈值配置"
    echo "   - 节点过滤逻辑"
    echo "   - 拖拽状态管理"
else
    echo ""
    echo "❌ 测试失败！请检查测试输出中的错误信息"
    echo "🔧 调试建议:"
    echo "   1. 检查UnifiedPreviewLineManager.js中的相关方法实现"
    echo "   2. 验证事件监听器是否正确绑定"
    echo "   3. 确认坐标转换逻辑"
    echo "   4. 检查吸附检测算法"
fi

echo ""
echo "📝 测试文件位置: src/tests/tdd-preview-line-endpoint-snap.test.js"
echo "🔍 如需查看详细日志，请查看测试输出中的console.log信息"