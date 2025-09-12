import { ResourceManager } from './src/core/ResourceManager.js'
import { PreviewLineManager } from './src/core/PreviewLineManager.js'
import { SafeMutationObserver } from './src/core/SafeMutationObserver.js'
import { EventCoordinator } from './src/core/EventCoordinator.js'

// 创建资源管理器
const resourceManager = new ResourceManager()
console.log('Initial resource count:', resourceManager.getResourceCount())

// 创建PreviewLineManager with null container
const previewLineManager = new PreviewLineManager(resourceManager, null)
console.log('After PreviewLineManager creation:', resourceManager.getResourceCount())
console.log('Resource IDs:', resourceManager.getResourceIds())

// 创建SafeMutationObserver
const safeMutationObserver = new SafeMutationObserver(resourceManager)
console.log('After SafeMutationObserver creation:', resourceManager.getResourceCount())
console.log('Resource IDs:', resourceManager.getResourceIds())

// 创建EventCoordinator
const eventCoordinator = new EventCoordinator(resourceManager)
console.log('After EventCoordinator creation:', resourceManager.getResourceCount())
console.log('Final Resource IDs:', resourceManager.getResourceIds())

// 清理
resourceManager.cleanup()