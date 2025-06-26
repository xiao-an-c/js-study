<template>
  <div id="app">
    <div class="left">
      <div 
        class="item" 
        :class="{ dragging: draggedItem === '你好' }"
        :draggable="true" 
        @dragstart="handleDragStart($event, { type: 'text', payload: '你好' })"
        @dragend="handleDragEnd"
      >
        文本：你好
      </div>
      <div 
        class="item" 
        :class="{ dragging: draggedItem === '天气好' }"
        :draggable="true" 
        @dragstart="handleDragStart($event, { type: 'text', payload: '天气好' })"
        @dragend="handleDragEnd"
      >
        文本：天气好
      </div>
      <div 
        class="item" 
        :class="{ dragging: draggedItem === 'component' }"
        :draggable="true" 
        @dragstart="handleDragStart($event, { type: 'component', payload: { name: 'Button', props: { text: '按钮' } } })"
        @dragend="handleDragEnd"
      >
        组件：按钮
      </div>
    </div>
    <div 
      class="right drop-zone" 
      :class="{ 'drag-over': isDragOver }"
      @drop="handleDrop" 
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
    >
      <div v-if="!droppedData">拖拽内容到这里</div>
      <div v-else>
        <h3>拖拽的数据：</h3>
        <p><strong>类型：</strong>{{ droppedData.type }}</p>
        <p><strong>内容：</strong></p>
        <pre>{{ JSON.stringify(droppedData.payload, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  draggedItem.value = typeof data.payload === 'string' ? data.payload : data.type
  
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
#app {
  display: flex;
  flex-direction: row;
  gap: 5px;
  height: 400px;
  padding: 5px;
}

.left,
.right {
  height: 100%;
  border-radius: 5px;
  padding: 5px;

  border: 1px solid #dcdcdc;

  box-sizing: border-box;
}

.left {
  display: flex;
  flex-direction: column;
  width: 180px;
  gap: 3px;
}

.right {
  flex: 1;
}

.item {
  cursor: pointer;
  background: #f5f5f5;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  transition: all 0.3s ease;
  user-select: none;
}

.item:hover {
  background: #e9ecef;
  border-color: #007bff;
}

/* 拖拽时的样式 */
.item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

/* 放置目标的样式 */
.drop-zone {
  border: 2px dashed #ccc;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.drop-zone.drag-over {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.drop-zone pre {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  text-align: left;
  font-size: 12px;
  max-width: 100%;
  overflow-x: auto;
}
</style>