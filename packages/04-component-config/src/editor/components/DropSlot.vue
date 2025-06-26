<script setup lang="ts">
import { inject, ref } from 'vue'
import type { IDropController, ComponentNode } from '../types'
import { DragDropService } from '../services'
import { COMPONENT_LIST, Node } from '@/libs'

interface Props {
  node: ComponentNode
  slotKey: string
}

const props = defineProps<Props>()

// 注入拖拽控制器
const controller = inject<IDropController>('drop-controller')

// 拖拽状态
const isDragOver = ref(false)

/**
 * 处理拖拽放置事件
 * @param e 拖拽事件
 */
const handleDrop = (e: DragEvent) => {
  DragDropService.preventDefault(e)

  if (!e.dataTransfer) return

  const dragData = DragDropService.getDragData(e.dataTransfer)
  if (!dragData) {
    console.warn('[DropSlot] 无法解析拖拽数据')
    return
  }

  const { payload } = dragData
  const define = COMPONENT_LIST.find(item => item.name === payload.name)

  if (!define) {
    console.warn(`[DropSlot] 未找到组件定义 ${payload.name}`)
    return
  }

  // 创建新节点并添加到插槽
  const newNode = new Node(define).toJSON()
  controller?.appendNode(props.node, props.slotKey, newNode)

  // 重置状态
  isDragOver.value = false
}

/**
 * 处理拖拽悬停事件
 * @param e 拖拽事件
 */
const handleDragOver = (e: DragEvent) => {
  DragDropService.preventDefault(e)

  if (e.dataTransfer) {
    DragDropService.setDropEffect(e.dataTransfer, 'copy')
  }

  isDragOver.value = true
}

/**
 * 处理拖拽离开事件
 * @param e 拖拽事件
 */
const handleDragLeave = (e: DragEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX
  const y = e.clientY

  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
  }
}

/**
 * 处理拖拽进入事件
 * @param e 拖拽事件
 */
const handleDragEnter = (e: DragEvent) => {
  DragDropService.preventDefault(e)
  isDragOver.value = true
}
</script>

<template>
  <div
    class="drop-slot"
    :class="{
      'drop-slot--drag-over': isDragOver,
      'drop-slot--invalid': isDragOver
    }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @dragenter="handleDragEnter"
  >
    <div class="drop-slot__content">
      <div class="drop-slot__icon">📦</div>
      <div class="drop-slot__text">
        <div class="drop-slot__primary-text">拖拽组件到此处</div>
        <div class="drop-slot__secondary-text">从左侧组件库拖拽组件</div>
      </div>
    </div>

    <!-- 拖拽状态指示器 -->
    <div v-if="isDragOver" class="drop-slot__indicator">
      <div class="drop-slot__indicator-valid">
        ✓ 可以放置
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drop-slot {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-24 flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out relative bg-gray-50;

  &:hover {
    @apply border-gray-400 bg-gray-100;
  }

  &--drag-over {
    @apply border-blue-400 bg-blue-50;
  }

  &--valid {
    @apply border-green-400 bg-green-50;
  }

  &--invalid {
    @apply border-red-400 bg-red-50;
  }

  &__content {
    @apply flex flex-col items-center gap-3;
  }

  &__icon {
    @apply text-2xl opacity-60;
  }

  &__text {
    @apply space-y-1;
  }

  &__primary-text {
    @apply text-sm font-medium text-gray-600;
  }

  &__secondary-text {
    @apply text-xs text-gray-400;
  }

  &__indicator {
    @apply absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium;
  }

  &__indicator-valid {
    @apply bg-green-100 text-green-700;
  }

  &__indicator-invalid {
    @apply bg-red-100 text-red-700;
  }
}
</style>
