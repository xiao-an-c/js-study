import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { ShortcutManager } from './ShortcutManager'
import { LocalShortcutStorage } from './LocalStorage'
import { getDefaultShortcutsForPlatform } from './defaultShortcuts'
import type {
  ShortcutConfig,
  ShortcutHandler,
  ShortcutManagerOptions,
} from './types'

/**
 * 快捷键Hook配置
 */
export interface UseShortcutsOptions extends ShortcutManagerOptions {
  autoLoad?: boolean // 是否自动加载保存的配置
  autoSave?: boolean // 是否自动保存配置变更
  useDefaults?: boolean // 是否使用默认快捷键
  target?: EventTarget // 监听目标，默认为document
}

/**
 * Vue3快捷键管理Hook
 * 提供响应式的快捷键管理功能
 */
export function useShortcuts(options: UseShortcutsOptions = {}) {
  const {
    autoLoad = true,
    autoSave = true,
    useDefaults = true,
    target = document,
    ...managerOptions
  } = options

  // 创建管理器和存储实例
  const manager = new ShortcutManager(managerOptions)
  const storage = new LocalShortcutStorage()

  // 响应式状态
  const shortcuts = ref<ShortcutConfig[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const stats = reactive({
    total: 0,
    enabled: 0,
    disabled: 0,
    categories: 0,
    isListening: false
  })

  // 计算属性
  const enabledShortcuts = computed(() =>
    shortcuts.value.filter(config => config.enabled)
  )

  const disabledShortcuts = computed(() =>
    shortcuts.value.filter(config => !config.enabled)
  )

  const categories = computed(() => {
    const categorySet = new Set(
      shortcuts.value
        .map(config => config.category)
        .filter(Boolean)
    )
    return Array.from(categorySet)
  })

  const shortcutsByCategory = computed(() => {
    const result: Record<string, ShortcutConfig[]> = {}

    shortcuts.value.forEach(config => {
      const category = config.category || '未分类'
      if (!result[category]) {
        result[category] = []
      }
      result[category].push(config)
    })

    return result
  })

  /**
   * 更新统计信息
   */
  const updateStats = () => {
    const managerStats = manager.getStats()
    Object.assign(stats, managerStats)
  }

  /**
   * 注册快捷键
   */
  const register = (config: ShortcutConfig, handler: ShortcutHandler): boolean => {
    const success = manager.register(config, handler)
    if (success) {
      const index = shortcuts.value.findIndex(s => s.id === config.id)
      if (index >= 0) {
        shortcuts.value[index] = config
      } else {
        shortcuts.value.push(config)
      }
      updateStats()

      if (autoSave) {
        saveToStorage()
      }
    }
    return success
  }

  /**
   * 批量注册快捷键
   */
  const registerBatch = (configs: Array<{ config: ShortcutConfig; handler: ShortcutHandler }>): boolean[] => {
    const results = manager.registerBatch(configs)

    // 更新响应式数据
    configs.forEach(({ config }, index) => {
      if (results[index]) {
        const existingIndex = shortcuts.value.findIndex(s => s.id === config.id)
        if (existingIndex >= 0) {
          shortcuts.value[existingIndex] = config
        } else {
          shortcuts.value.push(config)
        }
      }
    })

    updateStats()

    if (autoSave) {
      saveToStorage()
    }

    return results
  }

  /**
   * 注销快捷键
   */
  const unregister = (configId: string): boolean => {
    const success = manager.unregister(configId)
    if (success) {
      const index = shortcuts.value.findIndex(s => s.id === configId)
      if (index >= 0) {
        shortcuts.value.splice(index, 1)
      }
      updateStats()

      if (autoSave) {
        saveToStorage()
      }
    }
    return success
  }

  /**
   * 更新快捷键配置
   */
  const update = (configId: string, newConfig: Partial<ShortcutConfig>): boolean => {
    const success = manager.update(configId, newConfig)
    if (success) {
      const index = shortcuts.value.findIndex(s => s.id === configId)
      if (index >= 0) {
        shortcuts.value[index] = { ...shortcuts.value[index], ...newConfig }
      }
      updateStats()

      if (autoSave) {
        saveToStorage()
      }
    }
    return success
  }

  /**
   * 启用/禁用快捷键
   */
  const toggle = (configId: string, enabled?: boolean): boolean => {
    const success = manager.toggle(configId, enabled)
    if (success) {
      const index = shortcuts.value.findIndex(s => s.id === configId)
      if (index >= 0) {
        shortcuts.value[index].enabled = enabled ?? !shortcuts.value[index].enabled
      }
      updateStats()

      if (autoSave) {
        saveToStorage()
      }
    }
    return success
  }

  /**
   * 搜索快捷键
   */
  const search = (query: string): ShortcutConfig[] => {
    return manager.searchShortcuts(query)
  }

  /**
   * 根据分类获取快捷键
   */
  const getByCategory = (category: string): ShortcutConfig[] => {
    return manager.getShortcutsByCategory(category)
  }

  /**
   * 保存到本地存储
   */
  const saveToStorage = async (): Promise<void> => {
    try {
      await storage.save(shortcuts.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存失败'
      console.error('保存快捷键配置失败:', err)
    }
  }

  /**
   * 从本地存储加载
   */
  const loadFromStorage = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const saved = await storage.load()
      shortcuts.value = saved

      // 重新注册所有快捷键（需要外部提供处理器）
      console.log(`从存储加载了 ${saved.length} 个快捷键配置`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败'
      console.error('加载快捷键配置失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 重置为默认配置
   */
  const resetToDefaults = (): void => {
    const defaults = getDefaultShortcutsForPlatform()
    shortcuts.value = [...defaults]

    // 清空管理器并重新注册（需要外部提供处理器）
    manager.clear()

    updateStats()

    if (autoSave) {
      saveToStorage()
    }
  }

  /**
   * 导出配置
   */
  const exportConfig = async (filename?: string): Promise<void> => {
    try {
      await storage.exportToFile(shortcuts.value, filename)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导出失败'
      throw err
    }
  }

  /**
   * 导入配置
   */
  const importConfig = async (file: File): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const imported = await storage.importFromFile(file)
      shortcuts.value = imported

      // 清空管理器并重新注册（需要外部提供处理器）
      manager.clear()

      updateStats()

      if (autoSave) {
        await saveToStorage()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '导入失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清空所有配置
   */
  const clear = async (): Promise<void> => {
    manager.clear()
    shortcuts.value = []
    updateStats()

    if (autoSave) {
      await storage.clear()
    }
  }

  /**
   * 开始监听
   */
  const startListening = (): void => {
    manager.startListening(target)
    updateStats()
  }

  /**
   * 停止监听
   */
  const stopListening = (): void => {
    manager.stopListening(target)
    updateStats()
  }

  /**
   * 初始化
   */
  const initialize = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      if (useDefaults) {
        const defaults = getDefaultShortcutsForPlatform()
        shortcuts.value = [...defaults]
      }

      if (autoLoad) {
        const saved = await storage.load()
        if (saved.length > 0) {
          shortcuts.value = saved
        }
      }

      updateStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失败'
      console.error('快捷键初始化失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 生命周期
  onMounted(() => {
    initialize()
    startListening()
  })

  onUnmounted(() => {
    stopListening()
    manager.destroy()
  })

  return {
    // 状态
    shortcuts,
    isLoading,
    error,
    stats,

    // 计算属性
    enabledShortcuts,
    disabledShortcuts,
    categories,
    shortcutsByCategory,

    // 方法
    register,
    registerBatch,
    unregister,
    update,
    toggle,
    search,
    getByCategory,

    // 存储操作
    saveToStorage,
    loadFromStorage,
    resetToDefaults,
    exportConfig,
    importConfig,
    clear,

    // 监听控制
    startListening,
    stopListening,

    // 工具方法
    updateStats,
    initialize,

    // 原始实例（高级用法）
    manager,
    storage
  }
}

/**
 * 快捷键Hook返回类型
 */
export type ShortcutsHook = ReturnType<typeof useShortcuts>
