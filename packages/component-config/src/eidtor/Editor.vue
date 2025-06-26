<template>
  <div id="app" class="app-container">
    <LibsPanel />
    <DropContainer :node="node" @test="handleTest" class="canvas-area">
      <CanvasRender :node="node" :selected-node-id="selectedNodeId" @node-select="handleNodeSelect" />
    </DropContainer>
    <PropsEditor
      :selected-node="selectedNode"
      @update-props="handleUpdateProps"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CanvasRender from '@/eidtor/CanvasRender'
import DropContainer from '@/eidtor/DropContainer.vue'
import type { ComponentNode, DragData } from '@/type'
import LibsPanel from './LibsPanel.vue'
import PropsEditor from './PropsEditor.vue'
import { ButtonDefine, FlexDefine } from '@/libs'

const droppedData = ref<DragData | null>(null)
const isDragOver = ref(false)
const selectedNodeId = ref<string | null>(null)

const handleTest = (msg: string) => {
  console.log(msg)
}

// 计算当前选中的节点
const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null
  return findNodeById(node.value, selectedNodeId.value)
})

// 递归查找节点
const findNodeById = (rootNode: ComponentNode, targetId: string): ComponentNode | null => {
  if (rootNode.id === targetId) return rootNode

  if (rootNode.slots) {
    for (const slotNodes of Object.values(rootNode.slots)) {
      for (const childNode of slotNodes) {
        const found = findNodeById(childNode, targetId)
        if (found) return found
      }
    }
  }

  return null
}

// 处理节点选中
const handleNodeSelect = (nodeId: string) => {
  selectedNodeId.value = nodeId
}

// 处理属性更新
const handleUpdateProps = (nodeId: string, newProps: Record<string, any>) => {
  updateNodeProps(node.value, nodeId, newProps)
}

// 递归更新节点属性
const updateNodeProps = (rootNode: ComponentNode, targetId: string, newProps: Record<string, any>): boolean => {
  if (rootNode.id === targetId) {
    rootNode.props = { ...rootNode.props, ...newProps }
    return true
  }

  if (rootNode.slots) {
    for (const slotNodes of Object.values(rootNode.slots)) {
      for (const childNode of slotNodes) {
        if (updateNodeProps(childNode, targetId, newProps)) {
          return true
        }
      }
    }
  }

  return false
}

const node = ref<ComponentNode>({
  id: '1',
  define: FlexDefine,
  props: {
    gap: '10px',
  },
  slots: {
    default: [
      { id: '2', define: ButtonDefine, props: { text: '按钮1' } },
      { id: '3', define: ButtonDefine, props: { text: '按钮2' } },
    ]
  }
})

const getDragData = (dataTransfer: DataTransfer): DragData | null => {
  try {
    const jsonString = dataTransfer.getData('application/json')
    return jsonString ? JSON.parse(jsonString) : null
  } catch {
    return null
  }
}

// 拖拽进入放置区域
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

// 拖拽在放置区域上方
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

// 拖拽离开放置区域
const handleDragLeave = (e: DragEvent) => {
  // 检查是否真的离开了放置区域（避免子元素触发）
  if (e.target === e.currentTarget) {
    isDragOver.value = false
  }
}

// 放置事件处理
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  if (!e.dataTransfer) return

  const data = getDragData(e.dataTransfer)
  if (data) {
    droppedData.value = data
  } else {
    console.error('无效的拖拽数据')
  }
}
</script>

<style scoped>
.app-container {
  @apply flex flex-row gap-2 p-2 h-screen;
}

.canvas-area {
  @apply flex-1;
}

.drop-zone {
  @apply flex-1 h-full rounded-md p-1 border border-gray-300 box-border border-2 border-dashed border-gray-400 transition-all duration-300 ease-in-out flex items-center justify-center text-center;
}

.drop-zone--active {
  @apply border-blue-500 bg-gray-50;
}

.code-display {
  @apply bg-gray-50 p-2 rounded border border-gray-200 text-left text-xs max-w-full overflow-x-auto;
}
</style>
