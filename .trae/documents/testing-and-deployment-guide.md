# CSS Grid 节点组件测试与部署指导

## 1. 测试环境准备

### 1.1 环境要求
- Node.js ≥ 18.0.0
- npm/pnpm 包管理器
- 现代浏览器（Chrome/Firefox/Safari/Edge）

### 1.2 安装依赖
```bash
cd /Users/mac/nis_mock/data_comunity/data_comunity
npm install
```

### 1.3 启动开发服务器
```bash
npm run dev
```

访问：`http://localhost:5173/marketing/tasks/horizontal`

## 2. 单元测试

### 2.1 运行端口对齐测试
```bash
npm test src/pages/marketing/tasks/horizontal/__tests__/portAlignment.test.js
```

**预期结果**：
- ✅ 所有端口对齐测试通过
- ✅ 性能测试在10ms内完成
- ✅ 误差检测精度达到±2px

### 2.2 运行配置抽屉联动测试
```bash
npm test src/pages/marketing/tasks/horizontal/__tests__/configDrawer.test.js
```

**预期结果**：
- ✅ 单节点更新性能≤16ms
- ✅ 批量节点更新性能≤1s
- ✅ 异常处理测试通过

### 2.3 运行性能监控测试
```bash
npm test src/pages/marketing/tasks/horizontal/utils/performanceMonitor.js
```

**预期结果**：
- ✅ 性能指标记录正确
- ✅ 超标检测功能正常
- ✅ 报告生成功能完整

## 3. 集成测试

### 3.1 完整测试套件
```bash
npm test src/pages/marketing/tasks/horizontal
```

### 3.2 覆盖率检查
```bash
npm run test:coverage src/pages/marketing/tasks/horizontal
```

**目标覆盖率**：
- 语句覆盖率 ≥ 90%
- 分支覆盖率 ≥ 85%
- 函数覆盖率 ≥ 95%
- 行覆盖率 ≥ 90%

## 4. 手动测试验证

### 4.1 像素级对齐验证

1. **打开浏览器开发者工具**
   - F12 或右键选择"检查"

2. **验证标题区对齐**
   ```javascript
   // 在控制台执行
   const node = document.querySelector('.universal-node')
   const header = node.querySelector('.node-header')
   console.log('标题区高度:', header.offsetHeight) // 应该为36px
   ```

3. **验证端口位置**
   ```javascript
   // 验证输入端口位置
   const inputPort = document.querySelector('.port-input')
   const nodeRect = inputPort.closest('.universal-node').getBoundingClientRect()
   const portRect = inputPort.getBoundingClientRect()
   console.log('输入端口垂直中心偏移:', portRect.top - nodeRect.top - nodeRect.height/2)
   ```

### 4.2 性能验证

1. **单节点更新性能**
   ```javascript
   // 在控制台执行性能测试
   console.time('node-update')
   // 触发节点更新
   window.updateNodeFromConfig(testNode, 'crowd-split', {nodeName: '测试'})
   console.timeEnd('node-update') // 应该≤16ms
   ```

2. **批量节点性能**
   ```javascript
   console.time('batch-update')
   // 批量更新200个节点
   Promise.all(nodes.map(n => updateNodeFromConfig(n, 'crowd-split', config)))
     .then(() => console.timeEnd('batch-update')) // 应该≤1s
   ```

### 4.3 功能验证

1. **配置抽屉联动**
   - 点击节点内容区域
   - 修改配置并保存
   - 验证节点即时刷新
   - 验证端口重新对齐

2. **端口验证**
   - 创建分流节点（crowd-split/event-split/ab-test）
   - 验证每个输出端口与内容行对齐
   - 修改分支数量，验证端口重建

3. **交互状态**
   - 悬停效果：边框颜色变化
   - 选中效果：蓝色边框+阴影
   - 禁用效果：透明度降低
   - 拖拽效果：透明度+阴影变化

## 5. 浏览器兼容性测试

### 5.1 测试矩阵

| 浏览器 | 版本 | 状态 | 备注 |
|--------|------|------|------|
| Chrome | ≥90 | ✅ | 完全支持 |
| Firefox | ≥88 | ✅ | 完全支持 |
| Safari | ≥14 | ✅ | 完全支持 |
| Edge | ≥90 | ✅ | 完全支持 |

### 5.2 移动端测试
- iOS Safari：✅ 支持
- Android Chrome：✅ 支持
- 微信内置浏览器：✅ 支持

## 6. 部署验证

### 6.1 构建验证
```bash
npm run build
```

**验证点**：
- ✅ 构建成功，无错误
- ✅ 产物大小合理（< 2MB）
- ✅ 无构建警告

### 6.2 生产环境验证
```bash
npm run preview
```

**验证步骤**：
1. 访问构建后的应用
2. 验证所有功能正常
3. 检查控制台无错误
4. 验证性能指标达标

## 7. 监控与日志

### 7.1 性能监控
在浏览器控制台查看性能日志：
```
[Performance] updateNodeFromConfig 完成: 8.5ms
[Performance] portConfigCalculation 完成: 2.1ms
[Performance] nodeUpdateOperation 完成: 5.8ms
```

### 7.2 验证日志
```
[updateNodeFromConfig] 端口验证通过
[Horizontal] 节点配置更新成功
```

### 7.3 错误日志
如出现错误，控制台会显示：
```
[Performance] updateNodeFromConfig 性能警告: 25.3ms (阈值: 16ms)
[updateNodeFromConfig] 端口验证失败: [...]
```

## 8. 问题排查

### 8.1 常见问题

**Q1: 端口对齐验证失败**
```
端口配置验证失败: [{type: 'output_port_alignment', ...}]
```
**解决**：
- 检查内容行数量与端口数量是否匹配
- 验证端口dy偏移计算是否正确
- 确保节点高度计算准确

**Q2: 性能超标警告**
```
[Performance] updateNodeFromConfig 性能警告: 25.3ms (阈值: 16ms)
```
**解决**：
- 检查是否有大量DOM操作
- 优化批处理逻辑
- 减少不必要的重计算

**Q3: 样式不符合规范**
**解决**：
- 检查 `nodeStyles.js` 中的常量定义
- 验证CSS样式是否正确应用
- 使用浏览器开发者工具检查具体样式值

### 8.2 调试工具

1. **浏览器开发者工具**
   - Elements面板：检查DOM结构和样式
   - Console面板：查看日志输出
   - Performance面板：分析性能瓶颈
   - Network面板：检查资源加载

2. **性能分析**
   ```javascript
   // 导出性能报告
   const report = performanceMonitor.exportReport()
   console.table(report.stats)
   ```

3. **验证工具**
   ```javascript
   // 验证端口配置
   const validation = usePortValidation()
   const result = validation.validatePortPositions(portConfig, contentLines)
   console.log('验证结果:', result)
   ```

## 9. 验收标准

### 9.1 功能验收 ✅
- [ ] 所有节点类型正确渲染
- [ ] 端口位置精确对齐（±2px）
- [ ] 配置抽屉联动正常工作
- [ ] 交互状态正确切换
- [ ] 性能指标达标

### 9.2 质量验收 ✅
- [ ] 代码无硬编码
- [ ] 常量使用统一
- [ ] 错误处理完善
- [ ] 测试覆盖率≥90%

### 9.3 用户体验验收 ✅
- [ ] 界面响应流畅（60 FPS）
- [ ] 操作反馈及时（≤16ms）
- [ ] 视觉一致性良好
- [ ] 跨浏览器兼容

## 10. 上线检查清单

### 10.1 代码检查 ✅
- [ ] 无console.log调试代码
- [ ] 无未处理的Promise拒绝
- [ ] 性能监控在生产环境适当降级
- [ ] 错误处理完善

### 10.2 构建检查 ✅
- [ ] 构建产物优化
- [ ] 代码压缩正常
- [ ] 资源加载优化
- [ ] CDN配置正确

### 10.3 部署检查 ✅
- [ ] 环境变量配置正确
- [ ] 后端API连接正常
- [ ] 监控告警配置
- [ ] 回滚方案准备

---

**测试完成标准**：所有自动化测试通过 + 手动验证通过 + 性能指标达标

**部署完成标准**：构建成功 + 生产环境验证通过 + 监控正常

**文档版本**：v1.0.0  
**最后更新**：2024年  
**维护团队**：前端技术团队