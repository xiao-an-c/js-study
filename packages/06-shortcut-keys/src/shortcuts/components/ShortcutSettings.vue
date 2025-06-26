<template>
  <div class="shortcut-settings">
    <!-- 头部工具栏 -->
    <div class="settings-header">
      <h3>快捷键设置</h3>
      <div class="header-actions">
        <button
          class="btn btn-secondary"
          @click="resetToDefaults"
          :disabled="isLoading"
        >
          重置默认
        </button>
        <button
          class="btn btn-secondary"
          @click="exportConfig"
          :disabled="isLoading"
        >
          导出配置
        </button>
        <label class="btn btn-secondary">
          导入配置
          <input
            type="file"
            accept=".json"
            @change="handleImport"
            style="display: none;"
          >
        </label>
      </div>
    </div>

    <!-- 搜索和过滤 -->
    <div class="settings-filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索快捷键..."
          class="search-input"
        >
      </div>
      <div class="category-filter">
        <select v-model="selectedCategory" class="category-select">
          <option value="">所有分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <div class="status-filter">
        <label class="checkbox-label">
          <input
            v-model="showDisabled"
            type="checkbox"
          >
          显示已禁用
        </label>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="settings-stats">
      <div class="stat-item">
        <span class="stat-label">总计:</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已启用:</span>
        <span class="stat-value">{{ stats.enabled }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已禁用:</span>
        <span class="stat-value">{{ stats.disabled }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">分类:</span>
        <span class="stat-value">{{ stats.categories }}</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-message">
      正在处理...
    </div>

    <!-- 快捷键列表 -->
    <div class="shortcuts-list">
      <div
        v-for="group in groupedShortcuts"
        :key="group.category"
        class="shortcut-group"
      >
        <h4 class="group-title">{{ group.category }}</h4>
        <div class="group-shortcuts">
          <ShortcutItem
            v-for="shortcut in group.shortcuts"
            :key="shortcut.id"
            :shortcut="shortcut"
            :editing="editingId === shortcut.id"
            @edit="handleEdit"
            @save="handleSave"
            @cancel="handleCancel"
            @toggle="handleToggle"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- 添加新快捷键 -->
    <div class="add-shortcut">
      <button
        class="btn btn-primary"
        @click="showAddDialog = true"
      >
        + 添加快捷键
      </button>
    </div>

    <!-- 添加快捷键对话框 -->
    <ShortcutDialog
      v-if="showAddDialog"
      :shortcut="null"
      @save="handleAdd"
      @cancel="showAddDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useShortcuts } from '../useShortcuts'
import type { ShortcutConfig } from '../types'
import ShortcutItem from './ShortcutItem.vue'
import ShortcutDialog from './ShortcutDialog.vue'

// 使用快捷键Hook
const {
  shortcuts,
  isLoading,
  error,
  stats,
  categories,
  toggle,
  update,
  unregister,
  register,
  resetToDefaults: resetDefaults,
  exportConfig: exportConfiguration,
  importConfig
} = useShortcuts()

// 本地状态
const searchQuery = ref('')
const selectedCategory = ref('')
const showDisabled = ref(true)
const editingId = ref<string | null>(null)
const showAddDialog = ref(false)

// 过滤后的快捷键
const filteredShortcuts = computed(() => {
  let result = shortcuts.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(shortcut =>
      shortcut.name.toLowerCase().includes(query) ||
      shortcut.description.toLowerCase().includes(query) ||
      shortcut.key.toLowerCase().includes(query)
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    result = result.filter(shortcut => shortcut.category === selectedCategory.value)
  }

  // 状态过滤
  if (!showDisabled.value) {
    result = result.filter(shortcut => shortcut.enabled)
  }

  return result
})

// 分组后的快捷键
const groupedShortcuts = computed(() => {
  const groups: Record<string, ShortcutConfig[]> = {}

  filteredShortcuts.value.forEach(shortcut => {
    const category = shortcut.category || '未分类'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(shortcut)
  })

  return Object.entries(groups).map(([category, shortcuts]) => ({
    category,
    shortcuts: shortcuts.sort((a, b) => a.name.localeCompare(b.name))
  })).sort((a, b) => a.category.localeCompare(b.category))
})

// 事件处理
const handleEdit = (shortcutId: string) => {
  editingId.value = shortcutId
}

const handleSave = (shortcutId: string, newConfig: Partial<ShortcutConfig>) => {
  update(shortcutId, newConfig)
  editingId.value = null
}

const handleCancel = () => {
  editingId.value = null
}

const handleToggle = (shortcutId: string) => {
  toggle(shortcutId)
}

const handleDelete = (shortcutId: string) => {
  if (confirm('确定要删除这个快捷键吗？')) {
    unregister(shortcutId)
  }
}

const handleAdd = (config: ShortcutConfig) => {
  // 这里需要提供一个默认的处理器
  const defaultHandler = () => {
    console.log(`执行自定义快捷键: ${config.name}`)
  }

  register(config, defaultHandler)
  showAddDialog.value = false
}

const resetToDefaults = () => {
  if (confirm('确定要重置为默认配置吗？这将清除所有自定义设置。')) {
    resetDefaults()
  }
}

const exportConfig = () => {
  const filename = `shortcuts-config-${new Date().toISOString().split('T')[0]}.json`
  exportConfiguration(filename)
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    try {
      await importConfig(file)
      alert('配置导入成功！')
    } catch (err) {
      alert('配置导入失败: ' + (err instanceof Error ? err.message : '未知错误'))
    }

    // 清空文件输入
    target.value = ''
  }
}

// 监听搜索变化，取消编辑状态
watch(searchQuery, () => {
  editingId.value = null
})

watch(selectedCategory, () => {
  editingId.value = null
})
</script>

<style scoped>
.shortcut-settings {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-header h3 {
  margin: 0;
  color: #374151;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.settings-filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.settings-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1e40af;
}

.error-message {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  margin-bottom: 20px;
}

.loading-message {
  padding: 12px;
  background: #fffbeb;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  color: #d97706;
  margin-bottom: 20px;
  text-align: center;
}

.shortcuts-list {
  margin-bottom: 30px;
}

.shortcut-group {
  margin-bottom: 25px;
}

.group-title {
  margin: 0 0 12px 0;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  border-left: 4px solid #3b82f6;
}

.group-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-shortcut {
  text-align: center;
  padding: 20px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #fafafa;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .shortcut-settings {
    padding: 15px;
  }

  .settings-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .settings-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
