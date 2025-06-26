import type {
  ShortcutConfig,
  ShortcutHandler,
  ShortcutConflict,
  ShortcutManagerOptions,
  ModifierKeys
} from './types'

/**
 * 快捷键管理器
 * 负责快捷键的注册、监听、冲突检测和执行
 */
export class ShortcutManager {
  private shortcuts = new Map<string, ShortcutConfig>()
  private handlers = new Map<string, ShortcutHandler>()
  private listeners: ((event: KeyboardEvent) => void)[] = []
  private options: Required<ShortcutManagerOptions>
  private isListening = false

  constructor(options: ShortcutManagerOptions = {}) {
    this.options = {
      enableGlobalShortcuts: true,
      preventDefault: true,
      stopPropagation: true,
      caseSensitive: false,
      allowInEditableElements: [],
      ...options
    }
  }

  /**
   * 注册快捷键
   */
  register(config: ShortcutConfig, handler: ShortcutHandler): boolean {
    const key = this.generateKey(config.key, config.modifiers)

    // 检查冲突
    const conflict = this.checkConflict(config)
    if (conflict) {
      console.warn('快捷键冲突:', conflict)
      return false
    }

    this.shortcuts.set(key, config)
    this.handlers.set(config.id, handler)

    console.log(`注册快捷键: ${config.name} (${key})`)
    return true
  }

  /**
   * 批量注册快捷键
   */
  registerBatch(configs: Array<{ config: ShortcutConfig; handler: ShortcutHandler }>): boolean[] {
    return configs.map(({ config, handler }) => this.register(config, handler))
  }

  /**
   * 注销快捷键
   */
  unregister(configId: string): boolean {
    const config = this.getShortcutById(configId)
    if (!config) return false

    const key = this.generateKey(config.key, config.modifiers)
    this.shortcuts.delete(key)
    this.handlers.delete(configId)

    console.log(`注销快捷键: ${config.name}`)
    return true
  }

  /**
   * 更新快捷键配置
   */
  update(configId: string, newConfig: Partial<ShortcutConfig>): boolean {
    const oldConfig = this.getShortcutById(configId)
    if (!oldConfig) return false

    const handler = this.handlers.get(configId)
    if (!handler) return false

    // 先注销旧配置
    this.unregister(configId)

    // 注册新配置
    const updatedConfig = { ...oldConfig, ...newConfig }
    return this.register(updatedConfig, handler)
  }

  /**
   * 启用/禁用快捷键
   */
  toggle(configId: string, enabled?: boolean): boolean {
    const config = this.getShortcutById(configId)
    if (!config) return false

    config.enabled = enabled ?? !config.enabled
    console.log(`${config.enabled ? '启用' : '禁用'}快捷键: ${config.name}`)
    return true
  }

  /**
   * 开始监听键盘事件
   */
  startListening(target: EventTarget = document): void {
    if (this.isListening) return

    const listener: any = (event: KeyboardEvent) => {
      this.handleKeyboardEvent(event)
    }

    target.addEventListener('keydown', listener)
    this.listeners.push(listener)
    this.isListening = true

    console.log('开始监听快捷键')
  }

  /**
   * 停止监听键盘事件
   */
  stopListening(target: EventTarget = document): void {
    if (!this.isListening) return

    this.listeners.forEach(listener => {
      target.removeEventListener('keydown', listener as EventListener)
    })

    this.listeners = []
    this.isListening = false

    console.log('停止监听快捷键')
  }

  /**
   * 处理键盘事件
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    // 检查是否在可编辑元素中
    if (this.isInEditableElement(event.target as Element)) {
      // 在可编辑元素中，只允许特定的快捷键（如撤销、重做、复制、粘贴等）
      if (!this.isAllowedInEditableElement(event)) {
        return
      }
    }

    const modifiers: ModifierKeys = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey
    }

    const key = this.options.caseSensitive ? event.key : event.key.toLowerCase()
    const shortcutKey = this.generateKey(key, modifiers)

    const config = this.shortcuts.get(shortcutKey)
    if (!config || !config.enabled) return

    const handler = this.handlers.get(config.id)
    if (!handler) return

    // 执行处理器
    try {
      const result = handler(event, config)

      // 如果处理器返回false，不阻止默认行为
      if (result === false) return

      if (this.options.preventDefault) {
        event.preventDefault()
      }

      if (this.options.stopPropagation) {
        event.stopPropagation()
      }

      console.log(`执行快捷键: ${config.name}`)
    } catch (error) {
      console.error(`快捷键执行错误 (${config.name}):`, error)
    }
  }

  /**
   * 检查是否在可编辑元素中
   */
  private isInEditableElement(target: Element | null): boolean {
    if (!target) return false

    const tagName = target.tagName?.toLowerCase()
    
    // 检查是否为输入元素
    if (tagName === 'input' || tagName === 'textarea') {
      return true
    }

    // 检查是否为可编辑元素
    if (target.getAttribute('contenteditable') === 'true') {
      return true
    }

    // 检查父元素
    return this.isInEditableElement(target.parentElement)
  }

  /**
   * 检查在可编辑元素中是否允许该快捷键
   */
  private isAllowedInEditableElement(event: KeyboardEvent): boolean {
    const modifiers: ModifierKeys = {
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey
    }

    const key = this.options.caseSensitive ? event.key : event.key.toLowerCase()
    const shortcutKey = this.generateKey(key, modifiers)

    // 检查当前快捷键是否在配置的允许列表中
    const config = this.shortcuts.get(shortcutKey)
    if (config && this.options.allowInEditableElements?.includes(config.id)) {
      return true
    }

    // 默认允许的系统级快捷键（通常是文本编辑相关的快捷键）
    const defaultAllowedShortcuts = [
      // 撤销/重做
      { key: 'z', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+Z (撤销)
      { key: 'z', modifiers: { ctrl: false, alt: false, shift: true, meta: true } },  // Cmd+Shift+Z (重做)
      { key: 'y', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+Y (重做)
      
      // 复制/粘贴/剪切
      { key: 'c', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+C
      { key: 'v', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+V
      { key: 'x', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+X
      
      // 全选
      { key: 'a', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+A
      
      // 保存
      { key: 's', modifiers: { ctrl: false, alt: false, shift: false, meta: true } }, // Cmd+S
      
      // Escape键（用于取消选择等）
      { key: 'escape', modifiers: { ctrl: false, alt: false, shift: false, meta: false } }
    ]

    const normalizedKey = this.options.caseSensitive ? key : key.toLowerCase()
    return defaultAllowedShortcuts.some(allowed => 
      allowed.key === normalizedKey &&
      allowed.modifiers.ctrl === modifiers.ctrl &&
      allowed.modifiers.alt === modifiers.alt &&
      allowed.modifiers.shift === modifiers.shift &&
      allowed.modifiers.meta === modifiers.meta
    )
  }

  /**
   * 生成快捷键标识
   */
  private generateKey(key: string, modifiers: ModifierKeys): string {
    const parts: string[] = []

    if (modifiers.ctrl) parts.push('ctrl')
    if (modifiers.alt) parts.push('alt')
    if (modifiers.shift) parts.push('shift')
    if (modifiers.meta) parts.push('meta')

    const normalizedKey = this.options.caseSensitive ? key : key.toLowerCase()
    parts.push(normalizedKey)

    return parts.join('+')
  }

  /**
   * 检查快捷键冲突
   */
  private checkConflict(config: ShortcutConfig): ShortcutConflict | null {
    const key = this.generateKey(config.key, config.modifiers)
    const existing = this.shortcuts.get(key)

    if (existing && existing.id !== config.id) {
      return {
        existing,
        new: config,
        conflictKey: key
      }
    }

    return null
  }

  /**
   * 根据ID获取快捷键配置
   */
  getShortcutById(id: string): ShortcutConfig | undefined {
    for (const config of this.shortcuts.values()) {
      if (config.id === id) return config
    }
    return undefined
  }

  /**
   * 获取所有快捷键配置
   */
  getAllShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values())
  }

  /**
   * 根据分类获取快捷键
   */
  getShortcutsByCategory(category: string): ShortcutConfig[] {
    return this.getAllShortcuts().filter(config => config.category === category)
  }

  /**
   * 搜索快捷键
   */
  searchShortcuts(query: string): ShortcutConfig[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllShortcuts().filter(config =>
      config.name.toLowerCase().includes(lowerQuery) ||
      config.description.toLowerCase().includes(lowerQuery) ||
      config.key.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 清空所有快捷键
   */
  clear(): void {
    this.shortcuts.clear()
    this.handlers.clear()
    console.log('清空所有快捷键')
  }

  /**
   * 获取快捷键统计信息
   */
  getStats() {
    const all = this.getAllShortcuts()
    const enabled = all.filter(config => config.enabled)
    const categories = new Set(all.map(config => config.category).filter(Boolean))

    return {
      total: all.length,
      enabled: enabled.length,
      disabled: all.length - enabled.length,
      categories: categories.size,
      isListening: this.isListening
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.stopListening()
    this.clear()
    console.log('快捷键管理器已销毁')
  }
}
