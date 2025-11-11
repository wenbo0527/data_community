import { canvasEventBus } from './CanvasEventBus'
import { CanvasEventTypes, isValidEventType } from './CanvasEventTypes'
import { eventTypeValidator } from './EventTypeValidator'

// 为避免模块初始化早期的循环依赖导致 CanvasEventTypes.KEYBOARD 未定义，添加安全回退常量
const SafeKeyboardTypes = CanvasEventTypes?.KEYBOARD ?? {
  INITIALIZED: 'keyboard:initialized',
  KEY_DOWN: 'keyboard:key-down',
  KEY_UP: 'keyboard:key-up',
  KEY_PRESS: 'keyboard:key-press',
  SHORTCUT_REGISTERED: 'keyboard:shortcut-registered',
  SHORTCUT_UNREGISTERED: 'keyboard:shortcut-unregistered',
  SHORTCUT_UPDATED: 'keyboard:shortcut-updated',
  SHORTCUT_EXECUTED: 'keyboard:shortcut-executed',
  SHORTCUT_FAILED: 'keyboard:shortcut-failed',
  STATE_CHANGED: 'keyboard:state-changed',
  CLEARED: 'keyboard:cleared',
  DESTROYED: 'keyboard:destroyed',
  DELETE_PRESSED: 'keyboard:delete-pressed',
  UNDO_PRESSED: 'keyboard:undo-pressed',
  REDO_PRESSED: 'keyboard:redo-pressed',
  SELECT_ALL_PRESSED: 'keyboard:select-all-pressed',
  COPY_PRESSED: 'keyboard:copy-pressed',
  PASTE_PRESSED: 'keyboard:paste-pressed',
  DEBUG_PRESSED: 'keyboard:debug-pressed'
}

export interface KeyboardShortcut {
  id: string
  key: string
  modifiers?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
  handler: () => void
  context?: string
  priority?: number
  description?: string
  enabled?: boolean
}

export interface KeyboardEventConfig {
  shortcuts?: KeyboardShortcut[]
  preventDefault?: boolean
  stopPropagation?: boolean
  throttleDelay?: number
  debounceDelay?: number
  enabled?: boolean
}

export class KeyboardEventHandler {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private enabled: boolean = true
  private preventDefault: boolean = true
  private stopPropagation: boolean = false
  private throttleDelay: number = 0
  private debounceDelay: number = 0
  private throttleTimers: Map<string, number> = new Map()
  private debounceTimers: Map<string, number> = new Map()
  private boundKeyDownHandler: (event: KeyboardEvent) => void
  private boundKeyUpHandler: (event: KeyboardEvent) => void
  private boundKeyPressHandler: (event: KeyboardEvent) => void

  constructor(config: KeyboardEventConfig = {}) {
    this.preventDefault = config.preventDefault ?? true
    this.stopPropagation = config.stopPropagation ?? false
    this.throttleDelay = config.throttleDelay ?? 0
    this.debounceDelay = config.debounceDelay ?? 0
    this.enabled = config.enabled ?? true
    
    this.boundKeyDownHandler = this.handleKeyDown.bind(this)
    this.boundKeyUpHandler = this.handleKeyUp.bind(this)
    this.boundKeyPressHandler = this.handleKeyPress.bind(this)
    
    if (config.shortcuts) {
      config.shortcuts.forEach(shortcut => this.registerShortcut(shortcut))
    }
    
    this.setupEventListeners()
    this.publishInitializationEvent()
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', this.boundKeyDownHandler)
      document.addEventListener('keyup', this.boundKeyUpHandler)
      document.addEventListener('keypress', this.boundKeyPressHandler)
    }
  }

  private publishInitializationEvent(): void {
    canvasEventBus.emit(SafeKeyboardTypes.INITIALIZED, {
      shortcuts: Array.from(this.shortcuts.values()),
      config: {
        preventDefault: this.preventDefault,
        stopPropagation: this.stopPropagation,
        throttleDelay: this.throttleDelay,
        debounceDelay: this.debounceDelay,
        enabled: this.enabled
      },
      timestamp: Date.now()
    })
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    if (!shortcut.id || !shortcut.key) {
      console.warn('[KeyboardEventHandler] 快捷键缺少必需的id或key属性')
      return
    }

    this.shortcuts.set(shortcut.id, {
      enabled: true,
      ...shortcut
    })

    canvasEventBus.emit(SafeKeyboardTypes.SHORTCUT_REGISTERED, {
      shortcut: { ...shortcut },
      totalShortcuts: this.shortcuts.size,
      timestamp: Date.now()
    })
  }

  unregisterShortcut(id: string): void {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) {
      this.shortcuts.delete(id)
      
      canvasEventBus.emit(SafeKeyboardTypes.SHORTCUT_UNREGISTERED, {
        shortcutId: id,
        shortcut,
        totalShortcuts: this.shortcuts.size,
        timestamp: Date.now()
      })
    }
  }

  updateShortcut(id: string, updates: Partial<KeyboardShortcut>): void {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) {
      const updatedShortcut = { ...shortcut, ...updates }
      this.shortcuts.set(id, updatedShortcut)
      
      canvasEventBus.emit(SafeKeyboardTypes.SHORTCUT_UPDATED, {
        shortcutId: id,
        updates,
        updatedShortcut,
        timestamp: Date.now()
      })
    }
  }

  enableShortcut(id: string): void {
    this.updateShortcut(id, { enabled: true })
  }

  disableShortcut(id: string): void {
    this.updateShortcut(id, { enabled: false })
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    
    canvasEventBus.emit(SafeKeyboardTypes.STATE_CHANGED, {
      enabled,
      timestamp: Date.now()
    })
  }

  private emitBaseKeyboardEvent(type: typeof CanvasEventTypes.KEYBOARD.KEY_DOWN | typeof CanvasEventTypes.KEYBOARD.KEY_UP | typeof CanvasEventTypes.KEYBOARD.KEY_PRESS, event: KeyboardEvent): void {
    const eventData = {
      type,
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
      originalEvent: event
    }
    if (!eventTypeValidator.validateEvent(type, eventData)) {
      // 如果验证失败，仍然允许基础事件发出，但记录警告
      console.warn(`[KeyboardEventHandler] 基础键盘事件验证失败: ${type}`)
    }
    canvasEventBus.emit(type, eventData)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return

    // 优先发出基础按下事件，供其他组件订阅（如上下文菜单Esc关闭）
    this.emitBaseKeyboardEvent(SafeKeyboardTypes.KEY_DOWN as any, event)

    // 检查焦点元素
    const activeElement = document.activeElement
    if (this.shouldIgnoreKeyboardEvent(activeElement, event)) {
      return
    }

    const matchingShortcuts = this.findMatchingShortcuts(event)
    if (matchingShortcuts.length === 0) return

    // 按优先级排序
    matchingShortcuts.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    
    const shortcut = matchingShortcuts[0]
    if (!shortcut) return
    if (!shortcut.enabled) return

    // 遵循配置的默认行为控制
    if (this.preventDefault) event.preventDefault()
    if (this.stopPropagation) event.stopPropagation()

    this.executeShortcut(shortcut, event)
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.enabled) return
    this.emitBaseKeyboardEvent(SafeKeyboardTypes.KEY_UP as any, event)
    // 遵循配置的默认行为控制
    if (this.preventDefault) event.preventDefault()
    if (this.stopPropagation) event.stopPropagation()
  }

  private handleKeyPress(event: KeyboardEvent): void {
    if (!this.enabled) return
    this.emitBaseKeyboardEvent(SafeKeyboardTypes.KEY_PRESS as any, event)
    // 遵循配置的默认行为控制
    if (this.preventDefault) event.preventDefault()
    if (this.stopPropagation) event.stopPropagation()
  }

  private shouldIgnoreKeyboardEvent(activeElement: Element | null, event: KeyboardEvent): boolean {
    // 如果焦点在输入元素上，忽略大多数快捷键
    if (activeElement && this.isInputElement(activeElement)) {
      // 只允许特定的快捷键在输入元素中工作
      const allowedInInput = ['debug']
      const matchingShortcuts = this.findMatchingShortcuts(event)
      return !matchingShortcuts.some(s => allowedInInput.includes(s.id))
    }
    return false
  }

  private isInputElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase()
    return tagName === 'input' || tagName === 'textarea' || element.getAttribute('contenteditable') === 'true'
  }

  private findMatchingShortcuts(event: KeyboardEvent): KeyboardShortcut[] {
    const matches: KeyboardShortcut[] = []
    
    for (const shortcut of this.shortcuts.values()) {
      if (this.matchesShortcut(event, shortcut)) {
        matches.push(shortcut)
      }
    }
    
    return matches
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    // 检查主键
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
      return false
    }

    // 检查修饰符
    const modifiers = shortcut.modifiers || {}
    return (
      (modifiers.ctrl === undefined || event.ctrlKey === modifiers.ctrl) &&
      (modifiers.shift === undefined || event.shiftKey === modifiers.shift) &&
      (modifiers.alt === undefined || event.altKey === modifiers.alt) &&
      (modifiers.meta === undefined || event.metaKey === modifiers.meta)
    )
  }

  private executeShortcut(shortcut: KeyboardShortcut, event: KeyboardEvent): void {
    const shortcutId = shortcut.id
    
    // 防抖处理
    if (this.debounceDelay > 0) {
      const existingTimer = this.debounceTimers.get(shortcutId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      const timer = window.setTimeout(() => {
        this.performShortcutExecution(shortcut, event)
        this.debounceTimers.delete(shortcutId)
      }, this.debounceDelay)
      
      this.debounceTimers.set(shortcutId, timer)
      return
    }

    // 节流处理
    if (this.throttleDelay > 0) {
      const existingTimer = this.throttleTimers.get(shortcutId)
      if (existingTimer) {
        return // 节流中，跳过执行
      }
      
      const timer = window.setTimeout(() => {
        this.throttleTimers.delete(shortcutId)
      }, this.throttleDelay)
      
      this.throttleTimers.set(shortcutId, timer)
    }

    this.performShortcutExecution(shortcut, event)
  }

  private performShortcutExecution(shortcut: KeyboardShortcut, event: KeyboardEvent): void {
    try {
      const eventData = {
        shortcutId: shortcut.id,
        shortcut,
        originalEvent: event,
        timestamp: Date.now()
      }

      // 事件验证
      if (!eventTypeValidator.validateEvent(SafeKeyboardTypes.SHORTCUT_EXECUTED, eventData)) {
        console.warn(`[KeyboardEventHandler] 快捷键事件验证失败: ${shortcut.id}`)
        return
      }

      // 执行快捷键处理函数
      shortcut.handler()

      canvasEventBus.emit(SafeKeyboardTypes.SHORTCUT_EXECUTED, eventData)
    } catch (error) {
      canvasEventBus.emit(SafeKeyboardTypes.SHORTCUT_FAILED, {
        shortcutId: shortcut.id,
        error,
        timestamp: Date.now()
      })
    }
  }

  getRegisteredShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  getShortcut(id: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(id)
  }

  hasShortcut(id: string): boolean {
    return this.shortcuts.has(id)
  }

  clear(): void {
    this.shortcuts.clear()
    this.clearTimers()
    
    canvasEventBus.emit(SafeKeyboardTypes.CLEARED, {
      timestamp: Date.now()
    })
  }

  private clearTimers(): void {
    this.throttleTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.throttleTimers.clear()
    this.debounceTimers.clear()
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      document.removeEventListener('keydown', this.boundKeyDownHandler)
      document.removeEventListener('keyup', this.boundKeyUpHandler)
      document.removeEventListener('keypress', this.boundKeyPressHandler)
    }
    
    this.clear()
    
    canvasEventBus.emit(SafeKeyboardTypes.DESTROYED, {
      timestamp: Date.now()
    })
  }
}

// 预定义的常用快捷键
export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'delete',
    key: 'Delete',
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.DELETE_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 90,
    description: '删除选中节点'
  },
  {
    id: 'backspace-delete',
    key: 'Backspace',
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.DELETE_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 90,
    description: 'Backspace删除选中节点'
  },
  {
    id: 'undo',
    key: 'z',
    modifiers: { ctrl: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.UNDO_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 95,
    description: '撤销操作'
  },
  {
    id: 'redo-shift',
    key: 'z',
    modifiers: { ctrl: true, shift: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.REDO_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 95,
    description: '重做操作'
  },
  {
    id: 'redo-y',
    key: 'y',
    modifiers: { ctrl: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.REDO_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 95,
    description: '重做操作(Ctrl+Y)'
  },
  {
    id: 'select-all',
    key: 'a',
    modifiers: { ctrl: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.SELECT_ALL_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 85,
    description: '全选节点'
  },
  {
    id: 'copy',
    key: 'c',
    modifiers: { ctrl: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.COPY_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 85,
    description: '复制选中节点'
  },
  {
    id: 'paste',
    key: 'v',
    modifiers: { ctrl: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.PASTE_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 85,
    description: '粘贴节点'
  },
  {
    id: 'debug',
    key: 'd',
    modifiers: { ctrl: true, shift: true },
    handler: () => {
      canvasEventBus.emit(SafeKeyboardTypes.DEBUG_PRESSED, { timestamp: Date.now() })
    },
    context: 'canvas',
    priority: 80,
    description: '调试信息'
  }
]

// 创建默认实例
export const keyboardEventHandler = new KeyboardEventHandler({
  shortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
  preventDefault: true,
  stopPropagation: false,
  throttleDelay: 0,
  debounceDelay: 0,
  enabled: true
})

export default KeyboardEventHandler