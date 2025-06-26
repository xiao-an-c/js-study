<template>
  <div id="app" class="app-container">
    <div class="sidebar">
      <div
        class="drag-item"
        :class="{ 'drag-item--dragging': draggedItem === '你好' }"
        :draggable="true"
        @dragstart="handleDragStart($event, { type: 'text', payload: '你好' })"
        @dragend="handleDragEnd"
      >
        文本：你好
      </div>
      <div
        class="drag-item"
        :class="{ 'drag-item--dragging': draggedItem === '天气好' }"
        :draggable="true"
        @dragstart="
          handleDragStart($event, { type: 'text', payload: '天气好' })
        "
        @dragend="handleDragEnd"
      >
        文本：天气好
      </div>
      <div
        class="drag-item"
        :class="{ 'drag-item--dragging': draggedItem === 'component' }"
        :draggable="true"
        @dragstart="
          handleDragStart($event, {
            type: 'component',
            payload: { name: 'Button', props: { text: '按钮' } }
          })
        "
        @dragend="handleDragEnd"
      >
        组件：按钮
      </div>
    </div>
    <div
      class="drop-zone"
      :class="{ 'drop-zone--active': isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
    >
      <CanvasRender />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import CanvasRender from './components/CanvasRender'

  // 定义拖拽数据的类型
  interface DragData {
    type: 'text' | 'component' | 'image'
    payload: any
  }

  const droppedData = ref<DragData | null>(null)
  const isDragOver = ref(false)
  const draggedItem = ref<string | null>(null)

  // 类型安全的数据传输辅助函数
  const setDragData = (dataTransfer: DataTransfer, data: DragData) => {
    dataTransfer.setData('application/json', JSON.stringify(data))
  }

  const getDragData = (dataTransfer: DataTransfer): DragData | null => {
    try {
      const jsonString = dataTransfer.getData('application/json')
      return jsonString ? JSON.parse(jsonString) : null
    } catch {
      return null
    }
  }

  // 拖拽开始事件处理
  const handleDragStart = (e: DragEvent, data: DragData) => {
    console.log('handleDragStart')
    if (!e.dataTransfer) return

    // 设置传输数据
    setDragData(e.dataTransfer, data)
    e.dataTransfer.effectAllowed = 'copy'

    // 设置拖拽时的视觉反馈
    draggedItem.value =
      typeof data.payload === 'string' ? data.payload : data.type

    // 可选：设置拖拽时的图像
    if (e.target instanceof Element) {
      e.dataTransfer.setDragImage(e.target, 0, 0)
    }
  }

  // 拖拽结束事件处理
  const handleDragEnd = () => {
    console.log('handleDragEnd')

    draggedItem.value = null
  }

  // 拖拽进入放置区域
  const handleDragEnter = (e: DragEvent) => {
    console.log('handleDragEnter')

    e.preventDefault()
    isDragOver.value = true
  }

  // 拖拽在放置区域上方
  const handleDragOver = (e: DragEvent) => {
    console.log('handleDragOver')

    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  // 拖拽离开放置区域
  const handleDragLeave = (e: DragEvent) => {
    console.log('handleDragLeave')
    // 检查是否真的离开了放置区域（避免子元素触发）
    if (e.target === e.currentTarget) {
      isDragOver.value = false
    }
  }

  // 放置事件处理
  const handleDrop = (e: DragEvent) => {
    console.log('handleDrop')
    e.preventDefault()
    isDragOver.value = false

    if (!e.dataTransfer) return

    const data = getDragData(e.dataTransfer)
    if (data) {
      droppedData.value = data
      console.log('拖拽数据:', data)
    } else {
      console.error('无效的拖拽数据')
    }
  }
</script>

<style scoped>
  .app-container {
    @apply flex flex-row gap-2 p-2 h-screen;
  }

  .sidebar {
    @apply h-full rounded-md p-1 border border-gray-300 box-border flex flex-col w-44 gap-1;
  }

  .drag-item {
    @apply cursor-pointer bg-gray-100 border border-gray-300 rounded-md p-1 text-sm transition-all duration-300 ease-in-out select-none hover:bg-gray-200 hover:border-blue-500;
  }

  .drag-item--dragging {
    @apply opacity-50 rotate-1;
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
