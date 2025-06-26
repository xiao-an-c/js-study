<script setup lang="ts" name="LibsPanel">
import type { DragData } from '@/type'
import { ref } from 'vue';
import { COMPONENT_LIST } from '@/libs'

interface Props {}
defineProps<Props>()

const dragActive = ref<string | null>(null)

// 拖拽开始事件处理
const handleDragStart = (e: DragEvent, data: DragData) => {
  if (!e.dataTransfer) return

  // 设置传输数据
  e.dataTransfer.setData('application/json', JSON.stringify(data))
  e.dataTransfer.effectAllowed = 'copy'

  // 设置拖拽时的视觉反馈
  dragActive.value = data.payload.name
}

// 拖拽结束事件处理
const handleDragEnd = () => {
  dragActive.value = null
}
</script>
<template>
  <div class="sidebar">
    <div v-for="item in COMPONENT_LIST" class="drag-item" :class="{ 'drag-item--dragging': dragActive === item.name }" :draggable="true"
      @dragstart="handleDragStart($event, { type: 'component', payload: item.toJSON() })" @dragend="handleDragEnd">
      {{ item.text }}
    </div>
  </div>
</template>
<style lang="scss">
.sidebar {
  @apply h-full rounded-md p-1 border border-gray-300 box-border flex flex-col w-44 gap-1;
}

.drag-item {
  @apply cursor-pointer bg-gray-100 border border-gray-300 rounded-md p-1 text-sm transition-all duration-300 ease-in-out select-none hover:bg-gray-200 hover:border-blue-500;
}

.drag-item--dragging {
  @apply opacity-50 rotate-1;
}
</style>
