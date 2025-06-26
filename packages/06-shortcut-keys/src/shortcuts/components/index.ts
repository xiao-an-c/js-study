// 快捷键组件导出
export { default as ShortcutSettings } from './ShortcutSettings.vue'
export { default as ShortcutItem } from './ShortcutItem.vue'
export { default as ShortcutKeyDisplay } from './ShortcutKeyDisplay.vue'
export { default as ShortcutEditor } from './ShortcutEditor.vue'

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
} from '../types'