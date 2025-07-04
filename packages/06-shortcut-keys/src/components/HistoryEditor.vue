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


  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import type { ComponentNode } from '../editor/types'
import { useHistory } from '../editor/hooks'
import { ButtonDefine, FlexDefine } from '../libs'
import { NodeService, HistoryManager } from '../editor/services'
import { useShortcuts } from '@/shortcuts'

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

// 暴露给父组件的属性和方法
defineExpose({
  selectedNodeId,
  historyHook,
  removeSelectedNode
})

// 初始化快捷键
const { register, startListening, stopListening } = useShortcuts({
  // 配置在可编辑元素中允许的快捷键
  allowInEditableElements: [
    'editor-undo',      // 撤销
    'editor-redo-y',    // 重做 (Cmd+Y)
    'editor-redo-z',    // 重做 (Cmd+Shift+Z)
    'editor-escape'     // 取消选择
  ]
})

// 注册编辑器快捷键
const registerEditorShortcuts = () => {
  // 撤销
  register({
    id: 'editor-undo',
    name: '撤销',
    description: '撤销上一步操作',
    key: 'z',
    modifiers: { ctrl: false, alt: false, shift: false, meta: true },
    action: 'undo',
    enabled: true,
  }, () => {
    if (historyHook.canUndo.value) {
      historyHook.undo()
    }
  })

  // 重做 (Ctrl+Y)
  register({
    id: 'editor-redo-y',
    name: '重做',
    description: '重做下一步操作',
    key: 'y',
    modifiers: { ctrl: false, alt: false, shift: false, meta: true },
    action: 'redo',
    enabled: true,
  }, () => {
    if (historyHook.canRedo.value) {
      historyHook.redo()
    }
  })

  // 重做 (Ctrl+Shift+Z)
  register({
    id: 'editor-redo-z',
    name: '重做',
    description: '重做下一步操作',
    key: 'z',
    modifiers: { ctrl: true, alt: false, shift: true, meta: false },
    action: 'redo',
    enabled: true,
  }, () => {
    if (historyHook.canRedo.value) {
      historyHook.redo()
      }
  })

  // 删除选中节点
  register({
    id: 'editor-delete',
    name: '删除选中',
    description: '删除当前选中的节点',
    key: 'backspace',
    modifiers: { ctrl: false, alt: false, shift: false, meta: false },
    action: 'custom',
    enabled: true,
  }, () => {
    if (selectedNodeId.value && selectedNodeId.value !== 'root-1') {
      removeSelectedNode()
    }
  })

  // 取消选择
  register({
    id: 'editor-escape',
    name: '取消选择',
    description: '取消当前选择',
    key: 'Escape',
    modifiers: { ctrl: false, alt: false, shift: false, meta: false },
    action: 'escape',
    enabled: true,
  }, () => {
    selectedNodeId.value = null
  })
}

// 生命周期
onMounted(() => {
  registerEditorShortcuts()
  startListening()
})

onUnmounted(() => {
  stopListening()
})


</script>

<style scoped>
.history-editor {
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  flex:1;
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
