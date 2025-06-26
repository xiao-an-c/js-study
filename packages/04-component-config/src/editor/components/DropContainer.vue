<script setup lang="ts">
import { provide, ref } from 'vue'
import type { ComponentNode } from '../types'
import { DropController } from '../controllers'
import { DragDropService } from '../services'

interface Props {
  node: ComponentNode
}

interface Emits {
  (e: 'test', message: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 创建并提供拖拽控制器实例
const dropController = new DropController()
provide('drop-controller', dropController)

// 拖拽状态
const isDragOver = ref(false)

/**
 * 处理拖拽放置事件
 * @param e 拖拽事件
 */
const handleDrop = (e: DragEvent) => {
  DragDropService.preventDefault(e)
  isDragOver.value = false

  // 发送测试事件
  emit('test', '拖拽放置完成')
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
  // 只有当拖拽真正离开容器时才设置为false
  // 检查是否离开了当前元素的边界
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
    class="drop-container"
    :class="{ 'drop-container--active': isDragOver }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @dragenter="handleDragEnter"
  >
    <div class="drop-container__content">
      <slot />
    </div>

    <!-- 拖拽提示层 -->
    <!-- <div v-if="isDragOver" class="drop-container__overlay">
      <div class="drop-container__hint">
        <div class="drop-container__hint-icon">📦</div>
        <div class="drop-container__hint-text">释放以添加组件</div>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped>
.drop-container {
  @apply flex-1 h-full rounded-md border-2 border-dashed border-gray-300 box-border transition-all duration-300 ease-in-out relative overflow-hidden;

  &--active {
    @apply border-blue-500 bg-blue-50;
  }

  &__content {
    @apply w-full h-full;
  }

  &__overlay {
    @apply absolute inset-0 bg-blue-100 bg-opacity-80 flex items-center justify-center z-10 pointer-events-none;
  }

  &__hint {
    @apply flex flex-col items-center justify-center text-blue-600 bg-white rounded-lg p-6 shadow-lg;
  }

  &__hint-icon {
    @apply text-4xl mb-2;
  }

  &__hint-text {
    @apply text-lg font-medium;
  }
}
</style>
