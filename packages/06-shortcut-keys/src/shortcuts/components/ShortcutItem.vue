<template>
  <div class="shortcut-item" :class="{ disabled: !shortcut.enabled, editing }">
    <div v-if="!editing" class="shortcut-display">
      <!-- 快捷键信息 -->
      <div class="shortcut-info">
        <div class="shortcut-name">{{ shortcut.name }}</div>
        <div class="shortcut-description">{{ shortcut.description }}</div>
      </div>

      <!-- 快捷键组合 -->
      <div class="shortcut-keys">
        <ShortcutKeyDisplay :shortcut="shortcut" />
      </div>

      <!-- 操作按钮 -->
      <div class="shortcut-actions">
        <button
          class="action-btn toggle-btn"
          :class="{ active: shortcut.enabled }"
          @click="$emit('toggle', shortcut.id)"
          :title="shortcut.enabled ? '禁用' : '启用'"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path v-if="shortcut.enabled" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 7 9.5 10.5 12 7 14.5 8.5 16 12 13.5 15.5 16 17 14.5 13.5 12 17 9.5 15.5 8z"/>
          </svg>
        </button>

        <button
          class="action-btn edit-btn"
          @click="$emit('edit', shortcut.id)"
          title="编辑"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>

        <button
          class="action-btn delete-btn"
          @click="$emit('delete', shortcut.id)"
          title="删除"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div v-else class="shortcut-edit">
      <ShortcutEditor
        :shortcut="shortcut"
        @save="handleSave"
        @cancel="$emit('cancel')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShortcutConfig } from '../types'
import ShortcutKeyDisplay from './ShortcutKeyDisplay.vue'
import ShortcutEditor from './ShortcutEditor.vue'

interface Props {
  shortcut: ShortcutConfig
  editing: boolean
}

interface Emits {
  edit: [id: string]
  save: [id: string, config: Partial<ShortcutConfig>]
  cancel: []
  toggle: [id: string]
  delete: [id: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSave = (config: Partial<ShortcutConfig>) => {
  emit('save', config.id!, config)
}
</script>

<style scoped>
.shortcut-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.shortcut-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.shortcut-item.disabled {
  opacity: 0.6;
  background: #f9fafb;
}

.shortcut-item.editing {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.shortcut-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.shortcut-info {
  flex: 1;
  min-width: 0;
}

.shortcut-name {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.shortcut-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.shortcut-keys {
  flex-shrink: 0;
}

.shortcut-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn {
  background: #fef2f2;
  color: #dc2626;
}

.toggle-btn.active {
  background: #f0fdf4;
  color: #16a34a;
}

.toggle-btn:hover {
  background: #fecaca;
}

.toggle-btn.active:hover {
  background: #dcfce7;
}

.edit-btn {
  background: #fffbeb;
  color: #d97706;
}

.edit-btn:hover {
  background: #fed7aa;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
}

.icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.shortcut-edit {
  width: 100%;
}

@media (max-width: 768px) {
  .shortcut-display {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .shortcut-info {
    text-align: center;
  }

  .shortcut-keys {
    align-self: center;
  }

  .shortcut-actions {
    justify-content: center;
  }
}
</style>
