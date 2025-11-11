// 端口连接检查注入脚本
// 此脚本将在任务创建页面中注入并运行端口连接检查

(function() {
    console.log('🔄 正在注入端口连接检查脚本...');
    
    // 等待页面完全加载
    function waitForPageReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }
    
    // 等待X6图实例
    function waitForX6Graph() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            function check() {
                attempts++;
                
                // 检查多种可能的X6图实例位置
                const graph = window.graph || 
                             window.x6Graph || 
                             (window.debugConnectionPoints && window.debugConnectionPoints.graph) ||
                             (window.Vue && window.Vue.prototype.$graph);
                
                if (graph && typeof graph.getNodes === 'function') {
                    console.log('✅ 找到X6图实例');
                    resolve(graph);
                } else if (attempts >= maxAttempts) {
                    reject(new Error('未找到X6图实例'));
                } else {
                    setTimeout(check, 200);
                }
            }
            
            check();
        });
    }
    
    // 加载并运行检查脚本
    async function loadAndRunCheck() {
        try {
            await waitForPageReady();
            console.log('✅ 页面已加载');
            
            await waitForX6Graph();
            console.log('✅ X6图实例已就绪');
            
            // 加载检查脚本
            const response = await fetch('/check-port-connections.js');
            if (!response.ok) {
                throw new Error(`无法加载检查脚本: ${response.status}`);
            }
            
            const scriptContent = await response.text();
            eval(scriptContent);
            
            console.log('✅ 端口连接检查脚本已加载');
            console.log('🚀 开始运行详细检查...');
            console.log('='.repeat(80));
            
            // 运行详细检查
            if (typeof window.checkPortConnections === 'function') {
                const result = window.checkPortConnections(true);
                
                console.log('='.repeat(80));
                console.log('🎉 端口连接检查完成！');
                
                return result;
            } else {
                throw new Error('检查函数未正确加载');
            }
            
        } catch (error) {
            console.error('❌ 检查过程出错:', error);
            console.log('💡 请确保：');
            console.log('   1. 在任务创建页面运行此脚本');
            console.log('   2. 页面已完全加载');
            console.log('   3. X6图实例已初始化');
        }
    }
    
    // 立即执行
    loadAndRunCheck();
    
})();