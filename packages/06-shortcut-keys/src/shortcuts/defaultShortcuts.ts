import { ShortcutAction, type ShortcutConfig } from './types'

/**
 * 默认快捷键配置
 */
export const defaultShortcuts: ShortcutConfig[] = [
  // 编辑操作
  {
    id: 'undo',
    name: '撤销',
    description: '撤销上一步操作',
    key: 'z',
    modifiers: { ctrl: true },
    action: ShortcutAction.UNDO,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'redo',
    name: '重做',
    description: '重做上一步撤销的操作',
    key: 'y',
    modifiers: { ctrl: true },
    action: ShortcutAction.REDO,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'redo-shift',
    name: '重做 (Shift)',
    description: '重做上一步撤销的操作 (Shift+Z)',
    key: 'z',
    modifiers: { ctrl: true, shift: true },
    action: ShortcutAction.REDO,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'copy',
    name: '复制',
    description: '复制选中的组件',
    key: 'c',
    modifiers: { ctrl: true },
    action: ShortcutAction.COPY,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'paste',
    name: '粘贴',
    description: '粘贴复制的组件',
    key: 'v',
    modifiers: { ctrl: true },
    action: ShortcutAction.PASTE,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'delete',
    name: '删除',
    description: '删除选中的组件',
    key: 'Delete',
    modifiers: {},
    action: ShortcutAction.DELETE,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'select-all',
    name: '全选',
    description: '选择所有组件',
    key: 'a',
    modifiers: { ctrl: true },
    action: ShortcutAction.SELECT_ALL,
    enabled: true,
    category: '选择'
  },

  // 文件操作
  {
    id: 'save',
    name: '保存',
    description: '保存当前项目',
    key: 's',
    modifiers: { ctrl: true },
    action: ShortcutAction.SAVE,
    enabled: true,
    category: '文件'
  },
  {
    id: 'new',
    name: '新建',
    description: '新建项目',
    key: 'n',
    modifiers: { ctrl: true },
    action: ShortcutAction.NEW,
    enabled: true,
    category: '文件'
  },
  {
    id: 'open',
    name: '打开',
    description: '打开项目',
    key: 'o',
    modifiers: { ctrl: true },
    action: ShortcutAction.OPEN,
    enabled: true,
    category: '文件'
  },

  // 查找替换
  {
    id: 'find',
    name: '查找',
    description: '查找组件',
    key: 'f',
    modifiers: { ctrl: true },
    action: ShortcutAction.FIND,
    enabled: true,
    category: '查找'
  },
  {
    id: 'replace',
    name: '替换',
    description: '查找并替换',
    key: 'h',
    modifiers: { ctrl: true },
    action: ShortcutAction.REPLACE,
    enabled: true,
    category: '查找'
  },

  // 视图操作
  {
    id: 'zoom-in',
    name: '放大',
    description: '放大画布',
    key: '=',
    modifiers: { ctrl: true },
    action: ShortcutAction.ZOOM_IN,
    enabled: true,
    category: '视图'
  },
  {
    id: 'zoom-out',
    name: '缩小',
    description: '缩小画布',
    key: '-',
    modifiers: { ctrl: true },
    action: ShortcutAction.ZOOM_OUT,
    enabled: true,
    category: '视图'
  },
  {
    id: 'reset-zoom',
    name: '重置缩放',
    description: '重置画布缩放比例',
    key: '0',
    modifiers: { ctrl: true },
    action: ShortcutAction.RESET_ZOOM,
    enabled: true,
    category: '视图'
  },
  {
    id: 'toggle-sidebar',
    name: '切换侧边栏',
    description: '显示/隐藏左侧边栏',
    key: 'b',
    modifiers: { ctrl: true },
    action: ShortcutAction.TOGGLE_SIDEBAR,
    enabled: true,
    category: '视图'
  },
  {
    id: 'toggle-props',
    name: '切换属性面板',
    description: '显示/隐藏右侧属性面板',
    key: 'p',
    modifiers: { ctrl: true },
    action: ShortcutAction.TOGGLE_PROPS,
    enabled: true,
    category: '视图'
  },

  // 功能键
  {
    id: 'escape',
    name: '取消选择',
    description: '取消当前选择',
    key: 'Escape',
    modifiers: {},
    action: ShortcutAction.CUSTOM,
    enabled: true,
    category: '导航'
  },
  {
    id: 'enter',
    name: '确认',
    description: '确认当前操作',
    key: 'Enter',
    modifiers: {},
    action: ShortcutAction.CUSTOM,
    enabled: true,
    category: '导航'
  },

  // Mac专用快捷键
  {
    id: 'undo-mac',
    name: '撤销 (Mac)',
    description: '撤销上一步操作 (Mac)',
    key: 'z',
    modifiers: { meta: true },
    action: ShortcutAction.UNDO,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'redo-mac',
    name: '重做 (Mac)',
    description: '重做上一步撤销的操作 (Mac)',
    key: 'z',
    modifiers: { meta: true, shift: true },
    action: ShortcutAction.REDO,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'copy-mac',
    name: '复制 (Mac)',
    description: '复制选中的组件 (Mac)',
    key: 'c',
    modifiers: { meta: true },
    action: ShortcutAction.COPY,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'paste-mac',
    name: '粘贴 (Mac)',
    description: '粘贴复制的组件 (Mac)',
    key: 'v',
    modifiers: { meta: true },
    action: ShortcutAction.PASTE,
    enabled: true,
    category: '编辑'
  },
  {
    id: 'save-mac',
    name: '保存 (Mac)',
    description: '保存当前项目 (Mac)',
    key: 's',
    modifiers: { meta: true },
    action: ShortcutAction.SAVE,
    enabled: true,
    category: '文件'
  }
]

/**
 * 根据平台过滤快捷键
 */
export function getDefaultShortcutsForPlatform(): ShortcutConfig[] {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  if (isMac) {
    // Mac平台：使用Cmd键的快捷键，过滤掉Ctrl键的快捷键
    return defaultShortcuts.filter(shortcut => {
      // 如果是Mac专用快捷键，保留
      if (shortcut.id.endsWith('-mac')) return true
      
      // 如果是Ctrl键快捷键且有对应的Mac版本，过滤掉
      if (shortcut.modifiers.ctrl && !shortcut.modifiers.meta) {
        const hasMacVersion = defaultShortcuts.some(s => 
          s.id === shortcut.id + '-mac' || 
          (s.key === shortcut.key && s.modifiers.meta && s.action === shortcut.action)
        )
        return !hasMacVersion
      }
      
      return true
    })
  } else {
    // Windows/Linux平台：过滤掉Mac专用快捷键
    return defaultShortcuts.filter(shortcut => !shortcut.id.endsWith('-mac'))
  }
}