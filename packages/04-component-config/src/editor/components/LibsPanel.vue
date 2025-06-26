<script setup lang="ts">
import { ref } from 'vue'
import type { DragData } from '../types'
import { DragDropService } from '../services'
import { COMPONENT_LIST } from '@/libs'

interface Props {}
defineProps<Props>()

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
</script>

<template>
  <div class="libs-panel">
    <div class="libs-panel__header">
      <h3 class="libs-panel__title">组件库</h3>
    </div>
    
    <div class="libs-panel__content">
      <div 
        v-for="item in COMPONENT_LIST" 
        :key="item.name"
        class="libs-panel__item" 
        :class="{ 'libs-panel__item--dragging': dragActive === item.name }" 
        :draggable="true"
        @dragstart="handleDragStart($event, { type: 'component', payload: item.toJSON() })" 
        @dragend="handleDragEnd"
      >
        <div class="libs-panel__item-icon">
          <!-- 可以在这里添加组件图标 -->
          📦
        </div>
        <div class="libs-panel__item-text">
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.libs-panel {
  @apply h-full rounded-md border border-gray-300 box-border flex flex-col w-44 bg-white;
  
  &__header {
    @apply p-3 border-b border-gray-200;
  }
  
  &__title {
    @apply text-sm font-medium text-gray-700 m-0;
  }
  
  &__content {
    @apply flex-1 p-2 overflow-y-auto;
  }
  
  &__item {
    @apply cursor-pointer bg-gray-50 border border-gray-200 rounded-md p-3 mb-2 text-sm transition-all duration-200 ease-in-out select-none flex items-center gap-2;
    
    &:hover {
      @apply bg-gray-100 border-blue-300 shadow-sm;
    }
    
    &--dragging {
      @apply opacity-50 rotate-1 scale-95;
    }
  }
  
  &__item-icon {
    @apply text-lg;
  }
  
  &__item-text {
    @apply flex-1 text-gray-700;
  }
}
</style>