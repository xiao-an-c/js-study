# 从零实现可视化编辑器：拖拽API

在可视化编辑器中，拖拽是核心功能之一。

拖拽让复杂的操作变得直观：
- 从组件库拖拽组件到画布
- 调整组件在页面中的位置
- 重新排列侧边栏的工具

## 核心概念

在开始写代码之前，需要理解拖拽中的三个主要概念：

**拖拽源（Drag Source）**：被拖拽的那个元素，比如工具栏里的按钮组件

**放置目标（Drop Target）**：能接收拖拽元素的区域，比如画布区域

**数据传输（DataTransfer）**：在拖拽过程中传递信息的桥梁，告诉目标区域"我拖过来的是什么"

## 动手试试：最简单的拖拽

先从一个简单的例子开始——把文字从左边拖到右边。这个例子虽然简单，但包含了拖拽的核心逻辑：

```vue
<template>
  <div class="drag-demo">
    <!-- 左侧：拖拽源 -->
    <div class="source">
      <div 
        v-for="item in items" 
        :key="item"
        draggable 
        @dragstart="e => startDrag(e, item)"
        class="drag-item">
        {{ item }}
      </div>
    </div>
    
    <!-- 右侧：放置目标 -->
    <div 
      class="target"
      @dragover.prevent
      @drop="handleDrop">
      {{ droppedText || '拖拽文字到这里' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const items = ['你好', '世界', '拖拽']
const droppedText = ref('')

// 开始拖拽时，把数据塞进去
const startDrag = (e: DragEvent, text: string) => {
  e.dataTransfer?.setData('text/plain', text)
}

// 放置时，把数据取出来
const handleDrop = (e: DragEvent) => {
  droppedText.value = e.dataTransfer?.getData('text/plain') || ''
}
</script>

<style scoped>
.drag-demo { display: flex; gap: 20px; height: 200px; }
.source { display: flex; flex-direction: column; gap: 8px; }
.target { flex: 1; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; }
.drag-item { padding: 8px 12px; background: #f0f0f0; border-radius: 4px; cursor: grab; }
.drag-item:active { cursor: grabbing; }
</style>
```

核心逻辑其实就三步：
1. 给元素加上 `draggable` 属性
2. 在 `dragstart` 时用 `setData` 存数据
3. 在 `drop` 时用 `getData` 取数据

## 拖拽事件的完整执行过程

理解拖拽事件的执行顺序，对于调试和优化拖拽功能至关重要。让我们跟着一次完整的拖拽操作，看看浏览器都做了什么：

### 事件执行时序图

```
用户操作          拖拽源事件        目标区域事件
   ↓
按下鼠标并拖动  →  dragstart
   ↓
拖拽到目标上方  →                →  dragenter
   ↓
在目标上方移动  →  drag          →  dragover
   ↓              (持续触发)      (持续触发)
离开目标区域    →                →  dragleave
   ↓
重新进入目标    →                →  dragenter
   ↓
在目标上释放    →                →  drop
   ↓
拖拽结束        →  dragend
```

### 详细的事件说明

**1. dragstart（拖拽源）**
- 触发时机：用户开始拖拽元素时
- 主要作用：设置拖拽数据，配置拖拽效果
- 只触发一次

```javascript
const handleDragStart = (e: DragEvent) => {
  console.log('1. 拖拽开始')
  e.dataTransfer?.setData('text/plain', '拖拽的数据')
  e.dataTransfer!.effectAllowed = 'copy'
}
```

**2. dragenter（目标区域）**
- 触发时机：拖拽元素进入目标区域时
- 主要作用：判断是否接受拖拽，设置视觉反馈
- 每次进入都会触发

```javascript
const handleDragEnter = (e: DragEvent) => {
  console.log('2. 进入目标区域')
  e.preventDefault() // 表示接受拖拽
  // 添加视觉反馈，比如高亮边框
  e.currentTarget.classList.add('drag-over')
}
```

**3. dragover（目标区域）**
- 触发时机：拖拽元素在目标区域上方移动时
- 主要作用：持续表示接受拖拽
- 高频触发（类似 mousemove）

```javascript
const handleDragOver = (e: DragEvent) => {
  console.log('3. 在目标上方移动')
  e.preventDefault() // 必须调用，否则无法触发 drop
  e.dataTransfer!.dropEffect = 'copy'
}
```

**4. dragleave（目标区域）**
- 触发时机：拖拽元素离开目标区域时
- 主要作用：清除视觉反馈
- 每次离开都会触发

```javascript
const handleDragLeave = (e: DragEvent) => {
  console.log('4. 离开目标区域')
  // 移除视觉反馈
  e.currentTarget.classList.remove('drag-over')
}
```

**5. drop（目标区域）**
- 触发时机：在目标区域释放拖拽元素时
- 主要作用：处理拖拽数据，执行实际操作
- 只触发一次

```javascript
const handleDrop = (e: DragEvent) => {
  console.log('5. 放置完成')
  e.preventDefault()
  const data = e.dataTransfer?.getData('text/plain')
  // 处理数据，更新 UI
  console.log('接收到数据:', data)
}
```

**6. dragend（拖拽源）**
- 触发时机：拖拽操作结束时（无论成功与否）
- 主要作用：清理状态，重置 UI
- 只触发一次

```javascript
const handleDragEnd = (e: DragEvent) => {
  console.log('6. 拖拽结束')
  // 清理拖拽状态
  isDragging.value = false
}
```

### 完整的事件监听示例

```vue
<template>
  <div class="drag-demo">
    <!-- 拖拽源 -->
    <div 
      draggable
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      class="drag-source">
      拖拽我
    </div>
    
    <!-- 目标区域 -->
    <div 
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      class="drop-target"
      :class="{ 'drag-over': isDragOver }">
      放置区域
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isDragOver = ref(false)

const handleDragStart = (e: DragEvent) => {
  console.log('🚀 拖拽开始')
  e.dataTransfer?.setData('text/plain', '测试数据')
}

const handleDragEnter = (e: DragEvent) => {
  console.log('📥 进入目标区域')
  e.preventDefault()
  isDragOver.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault() // 关键：必须阻止默认行为
}

const handleDragLeave = (e: DragEvent) => {
  console.log('📤 离开目标区域')
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  console.log('✅ 放置成功')
  e.preventDefault()
  isDragOver.value = false
  const data = e.dataTransfer?.getData('text/plain')
  console.log('接收数据:', data)
}

const handleDragEnd = (e: DragEvent) => {
  console.log('🏁 拖拽结束')
}
</script>

<style scoped>
.drag-source {
  padding: 20px;
  background: #e3f2fd;
  border-radius: 8px;
  cursor: grab;
  margin-bottom: 20px;
}

.drop-target {
  padding: 40px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s;
}

.drop-target.drag-over {
  border-color: #2196f3;
  background: #f3f9ff;
}
</style>
```

### 事件执行的关键要点

**preventDefault() 的重要性**

在 `dragenter` 和 `dragover` 中必须调用 `preventDefault()`，否则：
- `drop` 事件不会触发
- 浏览器会显示"禁止"图标

**事件冒泡的处理**

拖拽事件会冒泡，在复杂的嵌套结构中可能导致意外行为：

```javascript
const handleDragEnter = (e: DragEvent) => {
  e.stopPropagation() // 阻止事件冒泡
  // 其他逻辑...
}
```

**性能优化建议**

`dragover` 事件触发频率很高，避免在其中执行重计算：

```javascript
// ❌ 不好的做法
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  // 避免在这里做复杂计算
  calculateComplexLayout()
}

// ✅ 更好的做法
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  // 只做必要的操作
}
```

## 深入理解：拖拽的几个关键时刻

### 让元素变得可拖拽

```html
<!-- 最简单的方式 -->
<div draggable>我可以被拖拽了</div>

<!-- Vue 中动态控制 -->
<div :draggable="canDrag">条件拖拽</div>
```

有个小细节：默认情况下，只有图片、链接和选中的文本能拖拽。其他元素需要显式设置 `draggable="true"`。

### 拖拽开始：打包数据

```javascript
const startDrag = (e: DragEvent, data: any) => {
  // 最常用的文本格式
  e.dataTransfer?.setData('text/plain', data.text)
  
  // 传递复杂数据？用 JSON
  e.dataTransfer?.setData('application/json', JSON.stringify(data))
  
  // 设置拖拽效果（可选）
  e.dataTransfer!.effectAllowed = 'copy'
}
```

我一般喜欢用 JSON 格式传数据，这样可以传递更复杂的对象。不过要记得在接收端做好错误处理。

### 接收拖拽：解包数据

```javascript
const handleDrop = (e: DragEvent) => {
  e.preventDefault() 
  const data = e.dataTransfer?.getData('text/plain')
  // 处理数据...
}
```

## DataTransfer：拖拽时的剪贴板

`DataTransfer` 就像一个临时的数据包，负责在拖拽过程中传递信息。我把它理解为"拖拽时的剪贴板"。

### 实用的数据传递模式

```javascript
const dragData = {
  type: 'component',
  id: 'button-001',
  props: { text: '点击我', color: 'blue' }
}

// 拖拽开始时
e.dataTransfer?.setData('application/json', JSON.stringify(dragData))

// 接收时
const handleDrop = (e: DragEvent) => {
  try {
    const data = JSON.parse(e.dataTransfer?.getData('application/json') || '{}')
    if (data.type === 'component') {
      // 创建组件...
    }
  } catch {
    console.log('数据格式不对，忽略这次拖拽')
  }
}
```

### 拖拽效果的小细节

```javascript
// 设置拖拽效果（影响鼠标样式）
e.dataTransfer!.effectAllowed = 'copy'  // 显示复制图标
e.dataTransfer!.effectAllowed = 'move'  // 显示移动图标

// 在 dragover 中可以动态改变效果
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy' // 强制显示复制效果
}
```

## 实战中的几个技巧

### 类型安全的数据传递

在 TypeScript 项目中，可以这样定义拖拽数据：

```typescript
interface DragItem {
  type: 'component' | 'asset' | 'text'
  id: string
  data: any
}

// 封装一下，避免重复代码
const useDragData = () => {
  const setDragData = (e: DragEvent, item: DragItem) => {
    e.dataTransfer?.setData('application/json', JSON.stringify(item))
  }
  
  const getDragData = (e: DragEvent): DragItem | null => {
    try {
      const json = e.dataTransfer?.getData('application/json')
      return json ? JSON.parse(json) : null
    } catch {
      return null
    }
  }
  
  return { setDragData, getDragData }
}
```

### 处理拖拽状态

```javascript
// 用 ref 跟踪拖拽状态
const isDragging = ref(false)
const dragOverTarget = ref(null)

const handleDragStart = () => {
  isDragging.value = true
}

const handleDragEnd = () => {
  isDragging.value = false
  dragOverTarget.value = null
}
```

## 我踩过的坑

### 拖拽不生效？检查这两个地方

**问题一**：忘记设置 `draggable` 属性
```html
<!-- ❌ 这样不行 -->
<div>我拖不动</div>

<!-- ✅ 这样才对 -->
<div draggable>我可以拖拽了</div>
```

### 数据传输的小细节

记住：只能在 `drop` 事件中获取数据。我之前试过在 `dragover` 中获取，结果总是空字符串，调试了好久才发现这个限制。
