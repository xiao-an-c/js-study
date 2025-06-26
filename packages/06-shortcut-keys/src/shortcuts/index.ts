import { ShortcutConfig } from './types'

// 核心类导出
export { ShortcutManager } from './ShortcutManager'
export { LocalShortcutStorage } from './LocalStorage'

// Hook 导出
export { useShortcuts } from './useShortcuts'

// 组件导出
export {
  ShortcutSettings,
  ShortcutItem,
  ShortcutKeyDisplay,
  ShortcutEditor
} from './components'

// 默认配置导出
export {
  getDefaultShortcutsForPlatform,
  defaultShortcuts
} from './defaultShortcuts'

// 类型导出
export type {
  ShortcutConfig,
  ShortcutAction,
  ModifierKeys,
  ShortcutHandler,
  ShortcutConflict,
  ShortcutManagerOptions,
  ShortcutStorage,
  ShortcutGroup
} from './types'

// 工具函数
export const createShortcutKey = (config: Pick<ShortcutConfig, 'key' | 'modifiers'>): string => {
  const parts: string[] = []

  if (config.modifiers.ctrl) parts.push('ctrl')
  if (config.modifiers.alt) parts.push('alt')
  if (config.modifiers.shift) parts.push('shift')
  if (config.modifiers.meta) parts.push('meta')

  parts.push(config.key.toLowerCase())

  return parts.join('+')
}

export const parseShortcutKey = (shortcutKey: string): Pick<ShortcutConfig, 'key' | 'modifiers'> => {
  const parts = shortcutKey.toLowerCase().split('+')
  const key = parts.pop() || ''

  const modifiers = {
    ctrl: parts.includes('ctrl'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta')
  }

  return { key, modifiers }
}

export const formatShortcutDisplay = (config: ShortcutConfig): string => {
  const parts: string[] = []

  if (config.modifiers.ctrl) parts.push('Ctrl')
  if (config.modifiers.alt) parts.push('Alt')
  if (config.modifiers.shift) parts.push('Shift')
  if (config.modifiers.meta) {
    parts.push(navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Win')
  }

  if (config.key) {
    const displayKey = config.key.length === 1 ? config.key.toUpperCase() : config.key
    parts.push(displayKey)
  }

  return parts.join(' + ')
}

export const isShortcutEqual = (a: ShortcutConfig, b: ShortcutConfig): boolean => {
  return (
    a.key === b.key &&
    a.modifiers.ctrl === b.modifiers.ctrl &&
    a.modifiers.alt === b.modifiers.alt &&
    a.modifiers.shift === b.modifiers.shift &&
    a.modifiers.meta === b.modifiers.meta
  )
}

export const validateShortcut = (config: Partial<ShortcutConfig>): string[] => {
  const errors: string[] = []

  if (!config.name?.trim()) {
    errors.push('快捷键名称不能为空')
  }

  if (!config.key?.trim()) {
    errors.push('快捷键不能为空')
  }

  if (config.action === 'custom' && !config.customAction?.trim()) {
    errors.push('自定义动作名称不能为空')
  }

  // 检查是否只有修饰键
  const hasModifier = config.modifiers?.ctrl || config.modifiers?.alt ||
                     config.modifiers?.shift || config.modifiers?.meta

  if (config.key && config.key.length === 1 && !hasModifier) {
    errors.push('单个字母/数字键需要配合修饰键使用')
  }

  return errors
}
