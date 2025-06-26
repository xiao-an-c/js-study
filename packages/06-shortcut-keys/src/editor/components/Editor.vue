<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ComponentNode } from '../types'
import { useEditorState, useNodeOperations, useHistory } from '../hooks'
import { ButtonDefine, FlexDefine } from '@/libs'

// 导入组件
import CanvasRender from './CanvasRender'
import DropContainer from './DropContainer.vue'
import LibsPanel from './LibsPanel.vue'
import PropsEditor from './PropsEditor.vue'
import HistoryPanel from './HistoryPanel.vue'

// 初始化根节点数据
const rootNode = ref<ComponentNode>({
  id: 'root-1',
  define: FlexDefine,
  props: {
    gap: '10px',
  },
  slots: {
    default: [
      { id: 'button-1', define: ButtonDefine, props: { text: '按钮1' } },
      { id: 'button-2', define: ButtonDefine, props: { text: '按钮2' } },
    ]
  }
})

// 使用编辑器状态管理
const {
  selectedNode,
  selectNode,
  state
} = useEditorState(rootNode.value)

// 使用节点操作
const {
  updateNodeProps
} = useNodeOperations(rootNode.value)

// 使用历史记录管理
const historyHook = useHistory(rootNode.value)

/**
 * 处理测试事件
 * @param msg 消息
 */
const handleTest = (msg: string) => {
  console.log('[Editor] 测试事件:', msg)
}

/**
 * 处理节点选中事件
 * @param nodeId 节点ID
 */
const handleNodeSelect = (nodeId: string | null) => {
  selectNode(nodeId)
}

/**
 * 处理属性更新事件（带历史记录）
 * @param nodeId 节点ID
 * @param newProps 新属性
 */
const handleUpdateProps = (nodeId: string, newProps: Record<string, any>) => {
  const success = historyHook.updateNodePropsWithHistory(nodeId, newProps)
  if (!success) {
    console.warn('[Editor] 更新节点属性失败:', nodeId, newProps)
  }
}

/**
 * 清除选中状态（点击空白区域）
 */
const handleCanvasClick = () => {
  selectNode(null)
}

// 键盘快捷键支持
onMounted(() => {
  document.addEventListener('keydown', historyHook.handleKeyboardShortcuts)
})

onUnmounted(() => {
  document.removeEventListener('keydown', historyHook.handleKeyboardShortcuts)
})
</script>

<template>
  <div class="editor">
    <!-- 左侧组件库面板 -->
    <div class="editor__sidebar editor__sidebar--left">
      <LibsPanel />
    </div>
    
    <!-- 中间画布区域 -->
    <div class="editor__canvas" @click="handleCanvasClick">
      <DropContainer 
        :node="rootNode" 
        @test="handleTest" 
        class="editor__drop-container"
      >
        <CanvasRender 
          :node="rootNode" 
          :selected-node-id="state.selectedNodeId" 
          @node-select="handleNodeSelect" 
        />
      </DropContainer>
    </div>
    
    <!-- 右侧属性编辑面板 -->
    <div class="editor__sidebar editor__sidebar--right">
      <!-- 历史记录面板 -->
      <div class="editor__history-section">
        <h3 class="editor__section-title">历史记录</h3>
        <HistoryPanel :history-hook="historyHook" />
      </div>
      
      <!-- 属性编辑器 -->
      <div class="editor__props-section">
        <h3 class="editor__section-title">属性编辑</h3>
        <PropsEditor
          :selected-node="selectedNode"
          @update-props="handleUpdateProps"
        />
      </div>
    </div>
    
    <!-- 状态指示器 -->
    <div class="editor__status">
      <div class="editor__status-item">
        选中节点: {{ state.selectedNodeId || '无' }}
      </div>
      <div class="editor__status-item">
        拖拽状态: {{ state.isDragOver ? '拖拽中' : '正常' }}
      </div>
      <div class="editor__status-item">
        历史记录: {{ historyHook.historyState.currentIndex + 1 }} / {{ historyHook.historyState.historyLength }}
      </div>
      <div class="editor__status-item" v-if="historyHook.currentCommand.value">
        当前操作: {{ historyHook.currentCommand.value }}
      </div>
      <div class="editor__status-item">
        快捷键: Ctrl+Z(撤销) Ctrl+Y/Ctrl+Shift+Z(重做)
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.editor {
  @apply h-screen w-full flex bg-gray-100 relative;
  
  &__sidebar {
    @apply flex-shrink-0 p-4;
    
    &--left {
      @apply bg-white border-r border-gray-200;
    }
    
    &--right {
      @apply bg-white border-l border-gray-200;
    }
  }
  
  &__canvas {
    @apply flex-1 p-4 overflow-hidden;
  }
  
  &__drop-container {
    @apply w-full h-full;
  }
  
  &__status {
    @apply absolute bottom-0 left-0 right-0 bg-gray-800 text-white text-xs p-2 flex gap-4 z-50;
  }
  
  &__status-item {
    @apply flex items-center gap-1;
  }
  
  &__history-section,
  &__props-section {
    @apply mb-6;
  }
  
  &__section-title {
    @apply text-sm font-semibold text-gray-700 mb-3 px-2;
  }
}

/* 全局样式重置 */
:deep(.editor) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 确保编辑器占满整个容器 */
:deep(#app) {
  @apply h-screen w-full m-0 p-0;
}
</style>