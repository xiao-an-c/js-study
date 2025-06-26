<template>
  <div class="history-panel">
    <!-- 操作按钮区域 -->
    <div class="history-controls">
      <button 
        class="history-btn undo-btn"
        :disabled="!canUndo"
        @click="handleUndo"
        :title="`撤销: ${currentCommand || '无操作'}`"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
        </svg>
        撤销
      </button>
      
      <button 
        class="history-btn redo-btn"
        :disabled="!canRedo"
        @click="handleRedo"
        :title="`重做: ${nextCommand || '无操作'}`"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
        </svg>
        重做
      </button>
      
      <button 
        class="history-btn clear-btn"
        @click="handleClear"
        title="清空历史记录"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
        清空
      </button>
    </div>
    
    <!-- 历史记录信息 -->
    <div class="history-info">
      <div class="info-item">
        <span class="label">当前位置:</span>
        <span class="value">{{ historyState.currentIndex + 1 }} / {{ historyState.historyLength }}</span>
      </div>
      <div class="info-item" v-if="currentCommand">
        <span class="label">当前操作:</span>
        <span class="value">{{ currentCommand }}</span>
      </div>
    </div>
    
    <!-- 历史记录列表 -->
    <div class="history-list" v-if="showHistoryList">
      <div class="list-header">
        <h4>操作历史</h4>
        <button 
          class="toggle-btn"
          @click="showHistoryList = false"
        >
          ×
        </button>
      </div>
      
      <div class="list-content">
        <div 
          v-for="item in historyList"
          :key="item.index"
          class="history-item"
          :class="{ 
            'current': item.isCurrent,
            'future': item.index > historyState.currentIndex
          }"
          @click="jumpToHistory(item.index)"
        >
          <span class="item-index">{{ item.index + 1 }}</span>
          <span class="item-description">{{ item.description }}</span>
          <span v-if="item.isCurrent" class="current-marker">●</span>
        </div>
      </div>
    </div>
    
    <!-- 显示历史列表按钮 -->
    <button 
      v-if="!showHistoryList"
      class="show-list-btn"
      @click="showHistoryList = true"
      title="显示历史记录列表"
    >
      <svg class="icon" viewBox="0 0 24 24">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
      </svg>
      历史
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HistoryHook } from '../hooks/useHistory'

interface Props {
  historyHook: HistoryHook
}

const props = defineProps<Props>()

// 解构历史记录Hook
const {
  historyState,
  canUndo,
  canRedo,
  currentCommand,
  nextCommand,
  historyList,
  undo,
  redo,
  clearHistory
} = props.historyHook

// 控制历史列表显示
const showHistoryList = ref(false)

// 处理撤销
const handleUndo = () => {
  undo()
}

// 处理重做
const handleRedo = () => {
  redo()
}

// 处理清空历史
const handleClear = () => {
  if (confirm('确定要清空所有历史记录吗？')) {
    clearHistory()
  }
}

// 跳转到指定历史位置
const jumpToHistory = (targetIndex: number) => {
  const currentIndex = historyState.currentIndex
  
  if (targetIndex === currentIndex) {
    return
  }
  
  // 计算需要撤销或重做的次数
  if (targetIndex < currentIndex) {
    // 需要撤销
    const undoCount = currentIndex - targetIndex
    for (let i = 0; i < undoCount; i++) {
      undo()
    }
  } else {
    // 需要重做
    const redoCount = targetIndex - currentIndex
    for (let i = 0; i < redoCount; i++) {
      redo()
    }
  }
}
</script>

<style scoped>
.history-panel {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.history-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.history-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.history-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.undo-btn:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.redo-btn:hover:not(:disabled) {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.clear-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.history-info {
  margin-bottom: 12px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
  font-size: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #6b7280;
  font-weight: 500;
}

.value {
  color: #374151;
  font-weight: 600;
}

.history-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border-radius: 8px;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  color: #374151;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.history-item:hover {
  background: #f9fafb;
}

.history-item.current {
  background: #eff6ff;
  border-color: #dbeafe;
}

.history-item.future {
  opacity: 0.6;
}

.item-index {
  width: 24px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.item-description {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.current-marker {
  color: #3b82f6;
  font-size: 12px;
}

.show-list-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.show-list-btn:hover {
  background: #f3f4f6;
  color: #374151;
}
</style>