<template>
  <div class="shortcut-conflict-demo">
    <div class="demo-header">
      <h2>快捷键冲突解决方案演示</h2>
      <p>这个演示展示了如何解决文本编辑和自定义快捷键之间的冲突问题</p>
    </div>

    <div class="demo-content">
      <!-- 左侧：测试区域 -->
      <div class="test-area">
        <h3>测试区域</h3>

        <!-- 普通输入框 -->
        <div class="input-group">
          <label>普通输入框（会阻止删除快捷键）：</label>
          <input
            v-model="inputValue"
            type="text"
            placeholder="在这里输入文本，按 Backspace 只会删除文字，不会删除节点"
            class="test-input"
          />
        </div>

        <!-- 文本域 -->
        <div class="input-group">
          <label>文本域（会阻止删除快捷键）：</label>
          <textarea
            v-model="textareaValue"
            placeholder="在这里输入文本，按 Backspace 只会删除文字，不会删除节点"
            class="test-textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- 可编辑div -->
        <div class="input-group">
          <label>可编辑元素（会阻止删除快捷键）：</label>
          <div
            contenteditable="true"
            class="test-editable"
            @input="handleEditableInput"
          >
            {{ editableValue || '在这里输入文本，按 Backspace 只会删除文字，不会删除节点' }}
          </div>
        </div>

        <!-- 普通区域 -->
        <div class="input-group">
          <label>普通区域（快捷键正常工作）：</label>
          <div class="test-normal-area">
            点击这里，然后按 Backspace 会删除选中的节点
          </div>
        </div>
      </div>

      <!-- 右侧：快捷键状态 -->
      <div class="shortcut-status">
        <h3>快捷键状态</h3>

        <div class="status-item">
          <span class="status-label">选中节点：</span>
          <span class="status-value">{{ selectedNodeId || '无' }}</span>
        </div>

        <div class="status-item">
          <span class="status-label">焦点元素：</span>
          <span class="status-value">{{ focusedElement }}</span>
        </div>

        <div class="status-item">
          <span class="status-label">是否在可编辑元素中：</span>
          <span class="status-value" :class="{ 'in-editable': isInEditableElement }">{{ isInEditableElement ? '是' : '否' }}</span>
        </div>

        <div class="shortcut-list">
          <h4>注册的快捷键：</h4>
          <div v-for="shortcut in shortcuts" :key="shortcut.id" class="shortcut-item">
            <span class="shortcut-name">{{ shortcut.name }}</span>
            <span class="shortcut-key">{{ formatShortcut(shortcut) }}</span>
            <span class="shortcut-allowed" :class="{ allowed: isAllowedInEditable(shortcut.id) }">
              {{ isAllowedInEditable(shortcut.id) ? '✓ 可编辑元素中允许' : '✗ 可编辑元素中禁用' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试节点 -->
    <div class="test-nodes">
      <h3>测试节点（选中后可用快捷键删除）</h3>
      <div class="nodes-container">
        <div
          v-for="node in testNodes"
          :key="node.id"
          class="test-node"
          :class="{ selected: selectedNodeId === node.id }"
          @click="selectNode(node.id)"
        >
          <span class="node-text">{{ node.name }}</span>
          <button class="remove-btn" @click.stop="removeNode(node.id)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useShortcuts, formatShortcutDisplay } from '@/shortcuts'

// 测试数据
const inputValue = ref('')
const textareaValue = ref('')
const editableValue = ref('')
const selectedNodeId = ref<string | null>(null)
const focusedElement = ref('无')
const isInEditableElement = ref(false)

// 测试节点
const testNodes = ref([
  { id: 'node-1', name: '测试节点 1' },
  { id: 'node-2', name: '测试节点 2' },
  { id: 'node-3', name: '测试节点 3' }
])

// 快捷键管理
const { register, startListening, stopListening, shortcuts } = useShortcuts({
  allowInEditableElements: [
    'demo-undo',
    'demo-redo',
    'demo-escape'
  ]
})

// 检查快捷键是否在可编辑元素中被允许
const isAllowedInEditable = (shortcutId: string) => {
  const allowedIds = ['demo-undo', 'demo-redo', 'demo-escape']
  return allowedIds.includes(shortcutId)
}

// 格式化快捷键显示
const formatShortcut = (shortcut: any) => {
  return formatShortcutDisplay(shortcut)
}

// 选择节点
const selectNode = (nodeId: string) => {
  selectedNodeId.value = nodeId
}

// 删除节点
const removeNode = (nodeId: string) => {
  const index = testNodes.value.findIndex(node => node.id === nodeId)
  if (index > -1) {
    testNodes.value.splice(index, 1)
    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
  }
}

// 删除选中节点
const removeSelectedNode = () => {
  if (selectedNodeId.value) {
    removeNode(selectedNodeId.value)
  }
}

// 处理可编辑元素输入
const handleEditableInput = (event: Event) => {
  editableValue.value = (event.target as HTMLElement).textContent || ''
}

// 检查当前焦点元素
const checkFocusedElement = () => {
  const activeElement = document.activeElement
  if (!activeElement) {
    focusedElement.value = '无'
    isInEditableElement.value = false
    return
  }

  const tagName = activeElement.tagName.toLowerCase()

  if (tagName === 'input') {
    focusedElement.value = 'INPUT'
    isInEditableElement.value = true
  } else if (tagName === 'textarea') {
    focusedElement.value = 'TEXTAREA'
    isInEditableElement.value = true
  } else if (activeElement.getAttribute('contenteditable') === 'true') {
    focusedElement.value = 'CONTENTEDITABLE'
    isInEditableElement.value = true
  } else {
    focusedElement.value = tagName.toUpperCase()
    isInEditableElement.value = false
  }
}

// 注册演示快捷键
const registerDemoShortcuts = () => {
  // 删除选中节点
  register({
    id: 'demo-delete',
    name: '删除选中节点',
    description: '删除当前选中的测试节点',
    key: 'Backspace',
    modifiers: { ctrl: false, alt: false, shift: false, meta: false },
    action: 'delete',
    enabled: true,
  }, () => {
    removeSelectedNode()
  })

  // 撤销（演示用）
  register({
    id: 'demo-undo',
    name: '撤销',
    description: '撤销操作（演示用）',
    key: 'z',
    modifiers: { ctrl: false, alt: false, shift: false, meta: true },
    action: 'undo',
    enabled: true,
  }, () => {
    console.log('撤销操作（在可编辑元素中也会触发）')
  })

  // 重做（演示用）
  register({
    id: 'demo-redo',
    name: '重做',
    description: '重做操作（演示用）',
    key: 'y',
    modifiers: { ctrl: false, alt: false, shift: false, meta: true },
    action: 'redo',
    enabled: true,
  }, () => {
    console.log('重做操作（在可编辑元素中也会触发）')
  })

  // 取消选择
  register({
    id: 'demo-escape',
    name: '取消选择',
    description: '取消当前选择',
    key: 'Escape',
    modifiers: { ctrl: false, alt: false, shift: false, meta: false },
    action: 'escape',
    enabled: true,
  }, () => {
    selectedNodeId.value = null
  })
}

// 生命周期
onMounted(() => {
  registerDemoShortcuts()
  startListening()

  // 监听焦点变化
  document.addEventListener('focusin', checkFocusedElement)
  document.addEventListener('focusout', checkFocusedElement)
  document.addEventListener('click', checkFocusedElement)

  checkFocusedElement()
})

onUnmounted(() => {
  stopListening()
  document.removeEventListener('focusin', checkFocusedElement)
  document.removeEventListener('focusout', checkFocusedElement)
  document.removeEventListener('click', checkFocusedElement)
})
</script>

<style scoped>
.shortcut-conflict-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.demo-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.test-area h3,
.shortcut-status h3 {
  color: #34495e;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.test-input,
.test-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.test-input:focus,
.test-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.test-editable {
  width: 100%;
  min-height: 40px;
  padding: 10px;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s;
}

.test-editable:focus {
  outline: none;
  border-color: #3498db;
}

.test-normal-area {
  padding: 15px;
  background: #ecf0f1;
  border: 2px dashed #bdc3c7;
  border-radius: 6px;
  text-align: center;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s;
}

.test-normal-area:hover {
  background: #d5dbdb;
  border-color: #95a5a6;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.status-label {
  font-weight: 500;
  color: #2c3e50;
}

.status-value {
  color: #7f8c8d;
  font-family: monospace;
}

.status-value.in-editable {
  color: #e74c3c;
  font-weight: bold;
}

.shortcut-list {
  margin-top: 20px;
}

.shortcut-list h4 {
  color: #34495e;
  margin-bottom: 15px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin-bottom: 10px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  transition: all 0.3s;
}

.shortcut-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.shortcut-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.shortcut-key {
  font-family: monospace;
  color: #7f8c8d;
  font-size: 12px;
  margin-bottom: 4px;
}

.shortcut-allowed {
  font-size: 12px;
  color: #e74c3c;
}

.shortcut-allowed.allowed {
  color: #27ae60;
}

.test-nodes {
  border-top: 1px solid #e1e8ed;
  padding-top: 20px;
}

.test-nodes h3 {
  color: #34495e;
  margin-bottom: 15px;
}

.nodes-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.test-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.test-node:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.test-node.selected {
  border-color: #3498db;
  background: #ebf3fd;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.node-text {
  font-weight: 500;
  color: #2c3e50;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}
</style>
