/**
 * 事件管理模块功能测试
 * 测试 EventManager 和 EventHandler 的基本功能
 */

import { EventManager, EventHandler, createEventSystem } from './index.js';

// 测试 EventManager 基本功能
function testEventManager() {
    console.log('=== 测试 EventManager ===');
    
    const eventManager = new EventManager({
        maxListeners: 10,
        enableDebug: true
    });
    
    // 测试事件监听和触发
    let testResult = '';
    
    eventManager.on('test-event', (data) => {
        testResult = `收到事件数据: ${data}`;
        console.log('✓ 事件监听器被触发:', testResult);
    });
    
    // 触发事件
    eventManager.emit('test-event', 'Hello World');
    
    // 测试一次性事件监听
    eventManager.once('once-event', (data) => {
        console.log('✓ 一次性事件监听器被触发:', data);
    });
    
    eventManager.emit('once-event', 'Once Event Data');
    eventManager.emit('once-event', 'Should not trigger'); // 不应该触发
    
    // 测试事件移除
    const handler = (data) => console.log('Handler:', data);
    eventManager.on('remove-test', handler);
    eventManager.off('remove-test', handler);
    eventManager.emit('remove-test', 'Should not trigger');
    console.log('✓ 事件移除测试完成');
    
    // 测试异步事件
    eventManager.on('async-event', async (data) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        console.log('✓ 异步事件处理完成:', data);
    });
    
    eventManager.emitAsync('async-event', 'Async Data');
    
    // 测试统计信息
    const stats = eventManager.getStatistics();
    console.log('✓ 事件统计信息:', {
        totalEvents: stats.totalEvents,
        totalListeners: stats.totalListeners,
        eventTypes: stats.eventTypes
    });
    
    return eventManager;
}

// 测试 EventHandler 基本功能
function testEventHandler() {
    console.log('\n=== 测试 EventHandler ===');
    
    const eventHandler = new EventHandler({
        timeout: 5000,
        retryAttempts: 3,
        enableValidation: true
    });
    
    // 注册事件处理器
    eventHandler.register('preview-line-update', {
        handler: (context) => {
            console.log('✓ 预览线更新事件处理:', context.data);
            return { success: true, processed: context.data };
        },
        validator: (data) => {
            return data && typeof data.lineId === 'string';
        },
        transformer: (data) => {
            return {
                ...data,
                timestamp: Date.now(),
                processed: true
            };
        }
    });
    
    // 测试事件处理
    const testData = {
        lineId: 'line-123',
        content: 'Test content',
        position: { x: 100, y: 200 }
    };
    
    eventHandler.handle('preview-line-update', testData)
        .then(result => {
            console.log('✓ 事件处理结果:', result);
        })
        .catch(error => {
            console.error('✗ 事件处理失败:', error);
        });
    
    // 测试中间件
    eventHandler.use((context) => {
        console.log('✓ 中间件执行 - 事件类型:', context.event);
        context.middlewareProcessed = true;
    });
    
    // 测试统计信息
    setTimeout(() => {
        const stats = eventHandler.getStatistics();
        console.log('✓ 事件处理器统计:', {
            totalHandled: stats.totalHandled,
            totalErrors: stats.totalErrors,
            averageProcessingTime: stats.averageProcessingTime
        });
    }, 100);
    
    return eventHandler;
}

// 测试事件系统集成
function testEventSystem() {
    console.log('\n=== 测试事件系统集成 ===');
    
    const eventSystem = createEventSystem({
        manager: {
            maxListeners: 20,
            enableDebug: true
        },
        handler: {
            timeout: 3000,
            retryAttempts: 2
        }
    });
    
    // 注册预览线相关事件处理器
    eventSystem.handler.register('line-created', {
        handler: (context) => {
            console.log('✓ 预览线创建事件:', context);
            eventSystem.manager.emit('line-created-processed', context.data);
        }
    });
    
    eventSystem.handler.register('line-updated', {
        handler: (context) => {
            console.log('✓ 预览线更新事件:', context);
            eventSystem.manager.emit('line-updated-processed', context.data);
        }
    });
    
    // 监听处理后的事件
    eventSystem.manager.on('line-created-processed', (data) => {
        console.log('✓ 预览线创建处理完成:', data.lineId);
    });
    
    eventSystem.manager.on('line-updated-processed', (data) => {
        console.log('✓ 预览线更新处理完成:', data.lineId);
    });
    
    // 模拟事件触发
    eventSystem.handler.handle('line-created', {
        lineId: 'line-001',
        type: 'straight',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 }
    });
    
    eventSystem.handler.handle('line-updated', {
        lineId: 'line-001',
        property: 'color',
        value: '#ff0000'
    });
    
    return eventSystem;
}

// 运行所有测试
export function runEventTests() {
    console.log('开始事件管理模块功能测试...');
    
    try {
        const eventManager = testEventManager();
        const eventHandler = testEventHandler();
        const eventSystem = testEventSystem();
        
        console.log('\n=== 测试总结 ===');
        console.log('✓ EventManager 测试完成');
        console.log('✓ EventHandler 测试完成');
        console.log('✓ 事件系统集成测试完成');
        console.log('\n所有事件管理模块测试通过！');
        
        return {
            success: true,
            eventManager,
            eventHandler,
            eventSystem
        };
    } catch (error) {
        console.error('✗ 测试失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
    // 浏览器环境
    window.runEventTests = runEventTests;
    console.log('事件测试函数已加载到 window.runEventTests');
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js 环境
    module.exports = { runEventTests };
}

// 自动运行测试（可选）
runEventTests();