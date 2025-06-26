<template>
  <div class="history-editor">
    <div class="editor-content">
      <!-- 左侧：Tab面板 -->
      <div class="editor-sidebar">
        <div class="tab-header">
           <button
            class="tab-btn"
            :class="{ active: activeTab === 'libs' }"
            @click="activeTab = 'libs'"
          >
            组件列表
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'tree' }"
            @click="activeTab = 'tree'"
          >
            组件树
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            历史记录
          </button>
        </div>

        <div class="tab-content">
          <!-- 组件树 -->
          <div v-if="activeTab === 'tree'" class="tab-panel">
            <ComponentTreeNode
              :node="rootNode"
              :selected-id="selectedNodeId || undefined"
              @select="handleNodeSelect"
            />
          </div>

          <!-- 组件列表 -->
          <div v-if="activeTab === 'libs'" class="tab-panel">
            <LibsPanel />
          </div>

          <!-- 历史记录 -->
          <div v-if="activeTab === 'history'" class="tab-panel">
            <HistoryPanel :history-hook="historyHook" />
          </div>
        </div>
      </div>

      <!-- 中间：可视化画布 -->
      <div class="editor-canvas">
        <div class="canvas-header">
          <h3>可视化画布</h3>
          <div class="canvas-info">
            <span>选中: {{ selectedNodeId || '无' }}</span>
            <span>历史: {{ historyHook.historyState.value.currentIndex + 1 }} / {{ historyHook.historyState.value.historyLength }}</span>
          </div>
        </div>

        <div class="canvas-content" @click="handleCanvasClick">
          <DropContainer
            :node="rootNode"
            class="editor-drop-container"
          >
            <CanvasRender
              :node="rootNode"
              :selected-node-id="selectedNodeId"
              @node-select="handleNodeSelect"
            />
          </DropContainer>
        </div>
      </div>

      <!-- 右侧：属性编辑器 -->
      <div class="editor-props">
        <div class="props-header">
          <h3>属性编辑器</h3>
        </div>
        <div class="props-content">
          <div v-if="selectedNode">
            <PropsEditor
              :selected-node="selectedNode"
              @update-props="handleUpdateProps"
            />
          </div>
          <div v-else class="no-selection">
            <p>请选择一个组件来编辑属性</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-section">
        <button
          class="toolbar-btn toolbar-btn--danger"
          @click="removeSelectedNode"
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
          @click="historyHook.undo"
          :disabled="!historyHook.canUndo.value"
          :title="`撤销: ${historyHook.currentCommand.value || '无操作'}`"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
          撤销
        </button>

        <button
          class="toolbar-btn toolbar-btn--redo"
          @click="historyHook.redo"
          :disabled="!historyHook.canRedo.value"
          :title="`重做: ${historyHook.nextCommand.value || '无操作'}`"
        >
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
          </svg>
          重做
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-section">
        <span class="toolbar-info">快捷键: Ctrl+Z(撤销) Ctrl+Y/Ctrl+Shift+Z(重做)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import type { ComponentNode } from '../editor/types'
import { useHistory } from '../editor/hooks'
import { ButtonDefine, FlexDefine } from '../libs'
import { NodeService, HistoryManager } from '../editor/services'

// 导入组件
import { CanvasRender, DropContainer, HistoryPanel, PropsEditor } from '../editor'
import ComponentTreeNode from './ComponentTreeNode.vue'
import LibsPanel from '@/editor/components/LibsPanel.vue'

// 初始化根节点
const rootNode = ref<ComponentNode>({
  id: 'root-1',
  define: FlexDefine,
  props: {
    gap: '10px',
    direction: 'column'
  },
  slots: {
    default: [
      { id: 'button-1', define: ButtonDefine, props: { text: '按钮1', type: 'primary' } },
      { id: 'button-2', define: ButtonDefine, props: { text: '按钮2', type: 'secondary' } },
    ]
  }
})

// 选中的节点ID
const selectedNodeId = ref<string | null>(null)

// 当前激活的tab
const activeTab = ref<'tree' | 'libs' | 'history'>('libs')

// 计算选中的节点
const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null
  return NodeService.findNodeById(rootNode.value, selectedNodeId.value)
})

// 使用历史记录
const historyHook = useHistory(rootNode.value)

// 提供依赖注入
provide('historyManager', historyHook.historyManager)
provide('rootNode', rootNode.value)

// 节点选择处理
const handleNodeSelect = (nodeId: string | null) => {
  selectedNodeId.value = nodeId
}

// 画布点击处理
const handleCanvasClick = () => {
  selectedNodeId.value = null
}

// 属性更新处理
const handleUpdateProps = (nodeId: string, newProps: Record<string, any>) => {
  historyHook.updateNodePropsWithHistory(nodeId, newProps)
}

// 测试事件处理
const handleTest = (message: string) => {
  console.log('[HistoryEditor] 测试事件:', message)
}

// 删除选中节点
const removeSelectedNode = () => {
  if (selectedNodeId.value && selectedNodeId.value !== 'root-1') {
    historyHook.removeNodeWithHistory(selectedNodeId.value)
    selectedNodeId.value = null
  }
}

// 键盘快捷键
onMounted(() => {
  document.addEventListener('keydown', historyHook.handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', historyHook.handleKeyboardShortcuts)
})
</script>

<style scoped>
.history-editor {
  height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.editor-content {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 0;
  overflow: hidden;
}

.editor-sidebar {
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-header {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 15px 8px;
  box-sizing: border-box;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.tab-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.component-lib {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.lib-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  text-align: center;
  user-select: none;
  position: relative;
}

.lib-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.lib-item:active {
  cursor: grabbing;
}

.lib-item[draggable="true"]:hover::after {
  content: '拖拽到画布添加';
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: #374151;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
}

.lib-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.lib-name {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}



.editor-canvas {
  background: white;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.canvas-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.canvas-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.canvas-content {
  flex: 1;
  padding: 20px;
  background: #fafbfc;
  overflow: auto;
}

.editor-drop-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.editor-props {
  background: white;
  border-left: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.props-header {
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.props-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.props-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.no-selection {
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;
}

.no-selection p {
  margin: 0;
  font-size: 14px;
}

.editor-toolbar {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
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

.toolbar-btn--primary {
  background: #3b82f6;
  color: white;
}

.toolbar-btn--primary:hover:not(:disabled) {
  background: #2563eb;
}

.toolbar-btn--secondary {
  background: #6b7280;
  color: white;
}

.toolbar-btn--secondary:hover:not(:disabled) {
  background: #4b5563;
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

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
}

.toolbar-info {
  font-size: 12px;
  color: #6b7280;
}

.icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

@media (max-width: 1200px) {
  .editor-content {
    grid-template-columns: 250px 1fr 250px;
  }
}

@media (max-width: 1024px) {
  .editor-content {
    grid-template-columns: 1fr;
    grid-template-rows: 300px 1fr 300px;
  }

  .editor-sidebar,
  .editor-props {
    max-height: 300px;
  }

  .toolbar-section {
    flex-wrap: wrap;
  }
}
</style>
