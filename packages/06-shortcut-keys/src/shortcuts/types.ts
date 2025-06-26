/**
 * 快捷键相关类型定义
 */

/**
 * 修饰键类型
 */
export interface ModifierKeys {
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean // Cmd键(Mac) 或 Windows键
}

/**
 * 快捷键配置
 */
export interface ShortcutConfig {
  id: string // 唯一标识
  name: string // 显示名称
  description: string // 描述
  key: string // 主键
  modifiers: ModifierKeys // 修饰键
  action: string // 动作类型
  enabled: boolean // 是否启用
  category?: string // 分类
}

/**
 * 快捷键动作类型
 */
export enum ShortcutAction {
  UNDO = 'undo',
  REDO = 'redo',
  COPY = 'copy',
  PASTE = 'paste',
  DELETE = 'delete',
  SELECT_ALL = 'selectAll',
  SAVE = 'save',
  NEW = 'new',
  OPEN = 'open',
  CLOSE = 'close',
  FIND = 'find',
  REPLACE = 'replace',
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut',
  RESET_ZOOM = 'resetZoom',
  TOGGLE_SIDEBAR = 'toggleSidebar',
  TOGGLE_PROPS = 'toggleProps',
  CUSTOM = 'custom' // 自定义动作
}

/**
 * 快捷键事件处理器
 */
export type ShortcutHandler = (event: KeyboardEvent, config: ShortcutConfig) => void | boolean

/**
 * 快捷键冲突信息
 */
export interface ShortcutConflict {
  existing: ShortcutConfig
  new: ShortcutConfig
  conflictKey: string
}

/**
 * 快捷键管理器配置
 */
export interface ShortcutManagerOptions {
  enableGlobalShortcuts?: boolean // 是否启用全局快捷键
  preventDefault?: boolean // 是否阻止默认行为
  stopPropagation?: boolean // 是否阻止事件冒泡
  caseSensitive?: boolean // 是否区分大小写
  allowInEditableElements?: string[] // 在可编辑元素中允许的快捷键ID列表
}

/**
 * 快捷键存储接口
 */
export interface ShortcutStorage {
  save(shortcuts: ShortcutConfig[]): Promise<void>
  load(): Promise<ShortcutConfig[]>
  clear(): Promise<void>
}

/**
 * 快捷键分组
 */
export interface ShortcutGroup {
  id: string
  name: string
  description?: string
  shortcuts: ShortcutConfig[]
}