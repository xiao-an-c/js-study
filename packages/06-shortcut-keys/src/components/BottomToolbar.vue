<template>
  <div class="bottom-toolbar">
    <!-- 左侧：标题和状态信息 -->
    <div class="toolbar-section">
      <h3 class="toolbar-title">可视化画布</h3>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <span class="toolbar-info">选中: {{ selectedNodeId || '无' }}</span>
      <span class="toolbar-info">历史: {{ historyInfo }}</span>
    </div>

    <div class="toolbar-divider"></div>

    <!-- 中间：编辑操作 -->
    <div class="toolbar-section">
      <button
        class="toolbar-btn toolbar-btn--danger"
        @click="$emit('remove-selected')"
        :disabled="!selectedNodeId || selectedNodeId === 'root-1'"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        删除选中
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <button
        class="toolbar-btn toolbar-btn--undo"
        @click="$emit('undo')"
        :disabled="!canUndo"
        :title="`撤销: ${currentCommand || '无操作'}`"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
        </svg>
        撤销
      </button>

      <button
        class="toolbar-btn toolbar-btn--redo"
        @click="$emit('redo')"
        :disabled="!canRedo"
        :title="`重做: ${nextCommand || '无操作'}`"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
        </svg>
        重做
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <!-- 右侧：导航和设置 -->
    <div class="toolbar-section">
      <div class="nav-tabs">
        <button 
          class="nav-tab"
          :class="{ active: currentView === 'editor' }"
          @click="$emit('change-view', 'editor')"
        >
          编辑器
        </button>
        <button 
          class="nav-tab"
          :class="{ active: currentView === 'demo' }"
          @click="$emit('change-view', 'demo')"
        >
          快捷键演示
        </button>
        <button 
          class="nav-tab"
          :class="{ active: currentView === 'conflict' }"
          @click="$emit('change-view', 'conflict')"
        >
          冲突解决
        </button>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <button 
        class="toolbar-btn toolbar-btn--settings"
        @click="$emit('open-settings')"
        title="快捷键设置"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
        设置
      </button>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <span class="toolbar-info">快捷键: Ctrl+Z(撤销) Ctrl+Y/Ctrl+Shift+Z(重做)</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedNodeId?: string | null | undefined
  historyInfo?: string
  canUndo?: boolean
  canRedo?: boolean
  currentCommand?: string | null | undefined
  nextCommand?: string | null | undefined
  currentView?: 'editor' | 'demo' | 'conflict'
}

withDefaults(defineProps<Props>(), {
  selectedNodeId: null,
  historyInfo: '1 / 1',
  canUndo: false,
  canRedo: false,
  currentCommand: '',
  nextCommand: '',
  currentView: 'editor'
})

defineEmits<{
  'remove-selected': []
  'undo': []
  'redo': []
  'change-view': [view: 'editor' | 'demo' | 'conflict']
  'open-settings': []
}>()
</script>

<style scoped>
.bottom-toolbar {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn--danger {
  background: #ef4444;
  color: white;
}

.toolbar-btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

.toolbar-btn--undo {
  background: #f59e0b;
  color: white;
}

.toolbar-btn--undo:hover:not(:disabled) {
  background: #d97706;
}

.toolbar-btn--redo {
  background: #10b981;
  color: white;
}

.toolbar-btn--redo:hover:not(:disabled) {
  background: #059669;
}

.toolbar-btn--settings {
  background: #6b7280;
  color: white;
}

.toolbar-btn--settings:hover:not(:disabled) {
  background: #4b5563;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
}

.toolbar-info {
  font-size: 12px;
  color: #6b7280;
}

.toolbar-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.nav-tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.nav-tab {
  padding: 6px 12px;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #374151;
  background: #e5e7eb;
}

.nav-tab.active {
  color: #3b82f6;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

@media (max-width: 1024px) {
  .bottom-toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .toolbar-section {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .bottom-toolbar {
    padding: 10px 16px;
    gap: 8px;
  }
  
  .toolbar-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .nav-tab {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>