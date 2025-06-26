<script setup lang="ts">
import { ref, inject } from 'vue'
import type { DragData, ComponentNode } from '../types'
import { DragDropService, HistoryManager, AddNodeCommand } from '../services'
import { COMPONENT_LIST, Node } from '@/libs'

interface Props { }
defineProps<Props>()

// 注入历史管理器和根节点
const historyManager = inject<HistoryManager>('historyManager')
const rootNode = inject<ComponentNode>('rootNode')

const dragActive = ref<string | null>(null)

/**
 * 拖拽开始事件处理
 * @param e 拖拽事件
 * @param data 拖拽数据
 */
const handleDragStart = (e: DragEvent, data: DragData) => {
  if (!e.dataTransfer) return

  // 使用服务设置拖拽数据
  DragDropService.setDragData(e.dataTransfer, data)

  // 设置拖拽时的视觉反馈
  dragActive.value = data.payload.name
}

/**
 * 拖拽结束事件处理
 */
const handleDragEnd = () => {
  dragActive.value = null
}

/**
 * 双击添加组件到根节点
 * @param componentName 组件名称
 */
const handleDoubleClick = (componentName: string) => {
  if (!historyManager || !rootNode) {
    console.warn('[LibsPanel] 缺少历史管理器或根节点')
    return
  }

  const define = COMPONENT_LIST.find(item => item.name === componentName)
  if (!define) {
    console.warn(`[LibsPanel] 未找到组件定义 ${componentName}`)
    return
  }

  // 创建新节点
  const newNode = new Node(define).toJSON()

  // 创建添加命令并执行
  const command = new AddNodeCommand(rootNode, 'children', newNode)
  historyManager.executeCommand(command)
}
</script>

<template>
  <div class="libs-panel__content">
    <div v-for="item in COMPONENT_LIST" :key="item.name" class="lib-item"
      :class="{ 'lib-item--dragging': dragActive === item.name }" :draggable="true"
      @dragstart="handleDragStart($event, { type: 'component', payload: item.toJSON() })" @dragend="handleDragEnd"
      @dblclick="handleDoubleClick(item.name)">
      <div class="lib-icon">
        {{ item.name === 'button' ? '🔘' : '📦' }}
      </div>
      <div class="lib-name">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.libs-panel {
  @apply h-full rounded-md border border-gray-300 box-border flex flex-col w-44 bg-white;

  &__content {
    @apply flex-1 p-2 overflow-y-auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    height: 100%;
  }
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
  background: white;
  height: 100px;
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

.lib-item--dragging {
  opacity: 0.5;
  transform: rotate(1deg) scale(0.95);
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
</style>
