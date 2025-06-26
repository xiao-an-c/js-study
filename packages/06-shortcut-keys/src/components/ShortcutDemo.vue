<template>
  <div class="shortcut-demo">
    <div class="demo-header">
      <h2>快捷键功能演示</h2>
      <p>这个页面展示了快捷键系统的各种功能</p>
    </div>

    <div class="demo-content">
      <!-- 当前快捷键状态 -->
      <div class="demo-section">
        <h3>当前注册的快捷键</h3>
        <div class="shortcut-list">
          <div
            v-for="shortcut in shortcuts"
            :key="shortcut.id"
            class="shortcut-card"
            :class="{ disabled: !shortcut.enabled }"
          >
            <div class="shortcut-info">
              <div class="shortcut-name">{{ shortcut.name }}</div>
              <div class="shortcut-desc">{{ shortcut.description }}</div>
            </div>
            <div class="shortcut-key">
              <ShortcutKeyDisplay :shortcut="shortcut" />
            </div>
          </div>
        </div>
      </div>

      <!-- 测试区域 -->
      <div class="demo-section">
        <h3>测试区域</h3>
        <div class="test-area">
          <div class="test-input">
            <label>测试输入框（在此处按快捷键）:</label>
            <textarea
              v-model="testText"
              class="test-textarea"
              placeholder="在这里输入文本，然后尝试使用快捷键..."
              @focus="inputFocused = true"
              @blur="inputFocused = false"
            ></textarea>
          </div>

          <div class="test-actions">
            <button @click="addTestShortcut" class="demo-btn">
              添加测试快捷键
            </button>
            <button @click="clearTestText" class="demo-btn">
              清空文本
            </button>
            <button @click="showShortcutHelp = !showShortcutHelp" class="demo-btn">
              {{ showShortcutHelp ? '隐藏' : '显示' }}快捷键帮助
            </button>
          </div>
        </div>
      </div>

      <!-- 快捷键帮助 -->
      <div v-if="showShortcutHelp" class="demo-section">
        <h3>快捷键帮助</h3>
        <div class="help-content">
          <div class="help-group" v-for="group in groupedShortcuts" :key="group.name">
            <h4>{{ group.name }}</h4>
            <div class="help-shortcuts">
              <div
                v-for="shortcut in group.shortcuts"
                :key="shortcut.id"
                class="help-item"
              >
                <ShortcutKeyDisplay :shortcut="shortcut" />
                <span class="help-desc">{{ shortcut.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="demo-section">
        <h3>事件日志</h3>
        <div class="event-log">
          <div class="log-header">
            <span>最近的快捷键事件:</span>
            <button @click="clearLog" class="clear-log-btn">清空日志</button>
          </div>
          <div class="log-content">
            <div
              v-for="(event, index) in eventLog"
              :key="index"
              class="log-item"
            >
              <span class="log-time">{{ event.time }}</span>
              <span class="log-shortcut">{{ event.shortcut }}</span>
              <span class="log-action">{{ event.action }}</span>
            </div>
            <div v-if="eventLog.length === 0" class="log-empty">
              暂无事件记录
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useShortcuts } from '@/shortcuts'
import { ShortcutKeyDisplay } from '@/shortcuts'
import type { ShortcutConfig } from '@/shortcuts'


// 快捷键管理
const {
  shortcuts,
  register: registerShortcut,
  unregister: unregisterShortcut,
  startListening,
  stopListening
} = useShortcuts()

// 组件状态
const testText = ref('')
const inputFocused = ref(false)
const showShortcutHelp = ref(false)
const eventLog = ref<Array<{ time: string; shortcut: string; action: string }>>([])

// 按组分类的快捷键
const groupedShortcuts = computed(() => {
  const groups = new Map<string, ShortcutConfig[]>()

  shortcuts.value.forEach(shortcut => {
    const groupName = getGroupName(shortcut.category || 'custom')
    if (!groups.has(groupName)) {
      groups.set(groupName, [])
    }
    groups.get(groupName)!.push(shortcut)
  })

  return Array.from(groups.entries()).map(([name, shortcuts]) => ({
    name,
    shortcuts: shortcuts.filter(s => s.enabled)
  }))
})

// 获取组名
const getGroupName = (group: string): string => {
  const groupNames: Record<string, string> = {
    editing: '编辑',
    file: '文件',
    view: '视图',
    search: '查找替换',
    function: '功能键',
    custom: '自定义',
    demo: '演示'
  }
  return groupNames[group] || group
}

// 记录事件
const logEvent = (shortcut: string, action: string) => {
  const now = new Date()
  const time = now.toLocaleTimeString()
  eventLog.value.unshift({ time, shortcut, action })

  // 限制日志数量
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20)
  }
}

// 清空日志
const clearLog = () => {
  eventLog.value = []
}

// 清空测试文本
const clearTestText = () => {
  testText.value = ''
  logEvent('手动操作', '清空文本')
}

// 添加测试快捷键
const addTestShortcut = () => {
  const testShortcutId = 'demo-test-shortcut'

  // 先注销已存在的测试快捷键
  unregisterShortcut(testShortcutId)

  // 注册新的测试快捷键
  const testHandler = () => {
    if (inputFocused.value) {
      const timestamp = new Date().toLocaleTimeString()
      testText.value += `\n[${timestamp}] 通过快捷键 Ctrl+T 插入的测试文本`
      logEvent('Ctrl+T', '插入测试文本')
    } else {
      logEvent('Ctrl+T', '插入测试文本（未聚焦）')
    }
  }

  registerShortcut({
    id: testShortcutId,
    name: '测试快捷键',
    description: '在文本框中插入测试文本',
    key: 't',
    modifiers: { ctrl: true, alt: false, shift: false, meta: false },
    action: 'custom',
    category: 'demo',
    enabled: true
  }, testHandler)

  logEvent('手动操作', '添加测试快捷键 Ctrl+T')
}

// 注册演示快捷键
const registerDemoShortcuts = () => {
  // 清空文本快捷键
  const clearTextHandler = () => {
    clearTestText()
    logEvent('Ctrl+L', '清空文本')
  }

  registerShortcut({
    id: 'demo-clear-text',
    name: '清空文本',
    description: '清空测试文本框内容',
    key: 'l',
    modifiers: { ctrl: true, alt: false, shift: false, meta: false },
    action: 'custom',
    category: 'demo',
    enabled: true
  }, clearTextHandler)

  // 切换帮助显示
  const toggleHelpHandler = () => {
    showShortcutHelp.value = !showShortcutHelp.value
    logEvent('Ctrl+H', showShortcutHelp.value ? '显示帮助' : '隐藏帮助')
  }

  registerShortcut({
    id: 'demo-toggle-help',
    name: '切换帮助',
    description: '显示/隐藏快捷键帮助',
    key: 'h',
    modifiers: { ctrl: true, alt: false, shift: false, meta: false },
    action: 'custom',
    category: 'demo',
    enabled: true
  }, toggleHelpHandler)

  // 清空日志
  const clearLogHandler = () => {
    clearLog()
    logEvent('Ctrl+K', '清空日志')
  }

  registerShortcut({
    id: 'demo-clear-log',
    name: '清空日志',
    description: '清空事件日志',
    key: 'k',
    modifiers: { ctrl: true, alt: false, shift: false, meta: false },
    action: 'custom',
    category: 'demo',
    enabled: true
  }, clearLogHandler)
}

// 生命周期
onMounted(() => {
  registerDemoShortcuts()
  startListening()
  logEvent('系统', '演示页面已加载')
})

onUnmounted(() => {
  stopListening()
})
</script>

<style scoped>
.shortcut-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  flex: 1;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-header h2 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 28px;
}

.demo-header p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-section h3 {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 20px;
  font-weight: 600;
}

.shortcut-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.shortcut-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.2s;
}

.shortcut-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.shortcut-card.disabled {
  opacity: 0.5;
}

.shortcut-info {
  flex: 1;
}

.shortcut-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.shortcut-desc {
  font-size: 14px;
  color: #6b7280;
}

.shortcut-key {
  margin-left: 16px;
}

.test-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-input label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.test-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 14px;
  resize: vertical;
}

.test-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.test-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-group h4 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.help-shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.help-desc {
  font-size: 14px;
  color: #6b7280;
}

.event-log {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
  color: #374151;
}

.clear-log-btn {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
}

.clear-log-btn:hover {
  background: #f3f4f6;
}

.log-content {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 13px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: #6b7280;
  min-width: 80px;
}

.log-shortcut {
  color: #3b82f6;
  font-weight: 600;
  min-width: 100px;
}

.log-action {
  color: #374151;
}

.log-empty {
  padding: 20px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 768px) {
  .shortcut-demo {
    padding: 16px;
  }

  .shortcut-list {
    grid-template-columns: 1fr;
  }

  .help-shortcuts {
    grid-template-columns: 1fr;
  }

  .test-actions {
    flex-direction: column;
  }

  .demo-btn {
    width: 100%;
  }
}
</style>
