<template>
  <div class="app">
    <div class="app-content">
      <HistoryEditor
        v-if="currentView === 'editor'"
        ref="historyEditorRef"
      />
      <ShortcutDemo
        v-else-if="currentView === 'demo'"
      />
      <ShortcutConflictDemo
        v-else-if="currentView === 'conflict'"
      />
    </div>

    <!-- 底部工具栏 -->
    <BottomToolbar
      v-if="currentView === 'editor'"
      :selected-node-id="editorState.selectedNodeId"
      :history-info="editorState.historyInfo"
      :can-undo="editorState.canUndo"
      :can-redo="editorState.canRedo"
      :current-command="editorState.currentCommand"
      :next-command="editorState.nextCommand"
      :current-view="currentView"
      @remove-selected="handleRemoveSelected"
      @undo="handleUndo"
      @redo="handleRedo"
      @change-view="handleViewChange"
      @open-settings="handleOpenSettings"
    />
    <BottomToolbar
      v-else
      :current-view="currentView"
      @change-view="handleViewChange"
      @open-settings="handleOpenSettings"
    />

    <!-- 快捷键设置弹窗 -->
    <div v-if="showShortcutSettings" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>快捷键设置</h2>
          <button class="close-btn" @click="showShortcutSettings = false">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ShortcutSettings />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import HistoryEditor from '@/components/HistoryEditor.vue'
import ShortcutDemo from '@/components/ShortcutDemo.vue'
import ShortcutConflictDemo from '@/components/ShortcutConflictDemo.vue'
import BottomToolbar from '@/components/BottomToolbar.vue'
import { ShortcutSettings } from '@/shortcuts'

const currentView = ref<'editor' | 'demo' | 'conflict'>('editor')
const showShortcutSettings = ref(false)
const historyEditorRef = ref<InstanceType<typeof HistoryEditor> | null>(null)

// 编辑器状态
const editorState = reactive({
  selectedNodeId: null as string | null,
  historyInfo: '1 / 1',
  canUndo: false,
  canRedo: false,
  currentCommand: null as string | null,
  nextCommand: null as string | null
})

// 更新编辑器状态
const updateEditorState = () => {
  if (historyEditorRef.value) {
    const editor = historyEditorRef.value
    editorState.selectedNodeId = editor.selectedNodeId || null
    editorState.historyInfo = `${editor.historyHook.historyState.value.currentIndex + 1} / ${editor.historyHook.historyState.value.historyLength}`
    editorState.canUndo = editor.historyHook.canUndo.value
    editorState.canRedo = editor.historyHook.canRedo.value
    editorState.currentCommand = editor.historyHook.currentCommand.value
    editorState.nextCommand = editor.historyHook.nextCommand.value
  }
}

// 处理编辑器操作
const handleRemoveSelected = () => {
  if (historyEditorRef.value) {
    historyEditorRef.value.removeSelectedNode()
    updateEditorState()
  }
}

const handleUndo = () => {
  if (historyEditorRef.value) {
    historyEditorRef.value.historyHook.undo()
    updateEditorState()
  }
}

const handleRedo = () => {
  if (historyEditorRef.value) {
    historyEditorRef.value.historyHook.redo()
    updateEditorState()
  }
}

const closeModal = () => {
  showShortcutSettings.value = false
}

const handleViewChange = (view: 'editor' | 'demo' | 'conflict') => {
  currentView.value = view
  if (view === 'editor') {
    // 切换到编辑器时更新状态
    setTimeout(updateEditorState, 0)
  }
}

const handleOpenSettings = () => {
  showShortcutSettings.value = true
}

// 监听编辑器状态变化
onMounted(() => {
  // 定期更新编辑器状态
  const interval = setInterval(() => {
    if (currentView.value === 'editor') {
      updateEditorState()
    }
  }, 100)

  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style>
.app {
  height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: scroll;
  display: flex;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 90vw;
  max-height: 90vh;
  width: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-btn .icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    margin: 10px;
  }

  .modal-header {
    padding: 16px 20px;
  }
}
</style>
