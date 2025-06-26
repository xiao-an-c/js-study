import type { ShortcutConfig, ShortcutStorage } from './types'

/**
 * 本地存储实现
 * 用于保存和加载用户自定义的快捷键配置
 */
export class LocalShortcutStorage implements ShortcutStorage {
  private readonly storageKey: string

  constructor(storageKey = 'shortcut-keys-config') {
    this.storageKey = storageKey
  }

  /**
   * 保存快捷键配置到本地存储
   */
  async save(shortcuts: ShortcutConfig[]): Promise<void> {
    try {
      const data = {
        shortcuts,
        timestamp: Date.now(),
        version: '1.0.0'
      }

      localStorage.setItem(this.storageKey, JSON.stringify(data))
      console.log(`已保存 ${shortcuts.length} 个快捷键配置到本地存储`)
    } catch (error) {
      console.error('保存快捷键配置失败:', error)
      throw new Error('保存快捷键配置失败')
    }
  }

  /**
   * 从本地存储加载快捷键配置
   */
  async load(): Promise<ShortcutConfig[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)

      if (!stored) {
        console.log('本地存储中没有找到快捷键配置')
        return []
      }

      const data = JSON.parse(stored)

      // 验证数据格式
      if (!data.shortcuts || !Array.isArray(data.shortcuts)) {
        console.warn('本地存储中的快捷键配置格式无效')
        return []
      }

      // 验证每个快捷键配置的完整性
      const validShortcuts = data.shortcuts.filter((shortcut: any) =>
        this.validateShortcutConfig(shortcut)
      )

      console.log(`从本地存储加载了 ${validShortcuts.length} 个快捷键配置`)
      return validShortcuts
    } catch (error) {
      console.error('加载快捷键配置失败:', error)
      return []
    }
  }

  /**
   * 清空本地存储中的快捷键配置
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey)
      console.log('已清空本地存储中的快捷键配置')
    } catch (error) {
      console.error('清空快捷键配置失败:', error)
      throw new Error('清空快捷键配置失败')
    }
  }

  /**
   * 验证快捷键配置的有效性
   */
  private validateShortcutConfig(config: any): config is ShortcutConfig {
    return (
      typeof config === 'object' &&
      typeof config.id === 'string' &&
      typeof config.name === 'string' &&
      typeof config.description === 'string' &&
      typeof config.key === 'string' &&
      typeof config.action === 'string' &&
      typeof config.enabled === 'boolean' &&
      typeof config.modifiers === 'object' &&
      config.modifiers !== null
    )
  }

  /**
   * 获取存储信息
   */
  getStorageInfo() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) {
        return {
          exists: false,
          size: 0,
          timestamp: null,
          version: null
        }
      }

      const data = JSON.parse(stored)
      return {
        exists: true,
        size: stored.length,
        timestamp: data.timestamp || null,
        version: data.version || null,
        shortcutsCount: data.shortcuts?.length || 0
      }
    } catch (error: any) {
      console.error('获取存储信息失败:', error)
      return {
        exists: false,
        size: 0,
        timestamp: null,
        version: null,
        error: error.message
      }
    }
  }

  /**
   * 导出配置为JSON文件
   */
  async exportToFile(shortcuts: ShortcutConfig[], filename = 'shortcuts-config.json'): Promise<void> {
    try {
      const data = {
        shortcuts,
        timestamp: Date.now(),
        version: '1.0.0',
        platform: navigator.platform,
        userAgent: navigator.userAgent
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log(`已导出快捷键配置到文件: ${filename}`)
    } catch (error) {
      console.error('导出配置文件失败:', error)
      throw new Error('导出配置文件失败')
    }
  }

  /**
   * 从文件导入配置
   */
  async importFromFile(file: File): Promise<ShortcutConfig[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const data = JSON.parse(content)

          if (!data.shortcuts || !Array.isArray(data.shortcuts)) {
            throw new Error('文件格式无效：缺少shortcuts数组')
          }

          const validShortcuts = data.shortcuts.filter((shortcut: any) =>
            this.validateShortcutConfig(shortcut)
          )

          console.log(`从文件导入了 ${validShortcuts.length} 个快捷键配置`)
          resolve(validShortcuts)
        } catch (error: any) {
          console.error('解析配置文件失败:', error)
          reject(new Error('解析配置文件失败: ' + error.message))
        }
      }

      reader.onerror = () => {
        reject(new Error('读取文件失败'))
      }

      reader.readAsText(file)
    })
  }
}
