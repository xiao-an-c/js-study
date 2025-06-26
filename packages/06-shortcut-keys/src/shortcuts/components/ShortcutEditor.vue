<template>
  <div class="shortcut-editor">
    <form @submit.prevent="handleSave" class="editor-form">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        
        <div class="form-group">
          <label for="name" class="form-label">名称 *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="输入快捷键名称"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description" class="form-label">描述</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-textarea"
            placeholder="输入快捷键描述"
            rows="2"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="group" class="form-label">分组</label>
          <select id="group" v-model="form.group" class="form-select">
            <option value="editing">编辑</option>
            <option value="file">文件</option>
            <option value="view">视图</option>
            <option value="search">查找替换</option>
            <option value="function">功能键</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </div>
      
      <!-- 快捷键设置 -->
      <div class="form-section">
        <h3 class="section-title">快捷键组合</h3>
        
        <div class="key-capture-area">
          <div class="capture-input">
            <input
              ref="keyInput"
              v-model="keyDisplayText"
              type="text"
              class="key-input"
              placeholder="点击此处并按下快捷键组合"
              readonly
              @keydown="handleKeyDown"
              @focus="startCapture"
              @blur="stopCapture"
            />
            <button
              type="button"
              class="clear-key-btn"
              @click="clearKey"
              title="清除"
            >
              ×
            </button>
          </div>
          
          <div v-if="capturing" class="capture-hint">
            按下快捷键组合，按 Escape 取消
          </div>
          
          <div v-if="keyError" class="key-error">
            {{ keyError }}
          </div>
        </div>
        
        <!-- 修饰键选择 -->
        <div class="modifier-checkboxes">
          <label class="checkbox-label">
            <input
              v-model="form.modifiers.ctrl"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">Ctrl</span>
          </label>
          
          <label class="checkbox-label">
            <input
              v-model="form.modifiers.alt"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">Alt</span>
          </label>
          
          <label class="checkbox-label">
            <input
              v-model="form.modifiers.shift"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">Shift</span>
          </label>
          
          <label class="checkbox-label">
            <input
              v-model="form.modifiers.meta"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">{{ metaKeyName }}</span>
          </label>
        </div>
      </div>
      
      <!-- 动作设置 -->
      <div class="form-section">
        <h3 class="section-title">动作</h3>
        
        <div class="form-group">
          <label for="action" class="form-label">动作类型</label>
          <select id="action" v-model="form.action" class="form-select">
            <option value="undo">撤销</option>
            <option value="redo">重做</option>
            <option value="copy">复制</option>
            <option value="paste">粘贴</option>
            <option value="cut">剪切</option>
            <option value="selectAll">全选</option>
            <option value="save">保存</option>
            <option value="find">查找</option>
            <option value="replace">替换</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        
        <div v-if="form.action === 'custom'" class="form-group">
          <label for="customAction" class="form-label">自定义动作名称</label>
          <input
            id="customAction"
            v-model="form.customAction"
            type="text"
            class="form-input"
            placeholder="输入自定义动作名称"
          />
        </div>
      </div>
      
      <!-- 其他设置 -->
      <div class="form-section">
        <h3 class="section-title">其他设置</h3>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="form.enabled"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">启用此快捷键</span>
          </label>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="form.preventDefault"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">阻止默认行为</span>
          </label>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="form.stopPropagation"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-text">阻止事件冒泡</span>
          </label>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
          取消
        </button>
        <button type="submit" class="btn btn-primary" :disabled="!isValid">
          保存
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick } from 'vue'
import type { ShortcutConfig, ShortcutAction } from '../types'

interface Props {
  shortcut?: ShortcutConfig
}

interface Emits {
  save: [config: Partial<ShortcutConfig>]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据
const form = reactive<Partial<ShortcutConfig>>({
  id: props.shortcut?.id || '',
  name: props.shortcut?.name || '',
  description: props.shortcut?.description || '',
  key: props.shortcut?.key || '',
  modifiers: {
    ctrl: props.shortcut?.modifiers.ctrl || false,
    alt: props.shortcut?.modifiers.alt || false,
    shift: props.shortcut?.modifiers.shift || false,
    meta: props.shortcut?.modifiers.meta || false
  },
  action: props.shortcut?.action || 'custom' as ShortcutAction,
  customAction: props.shortcut?.customAction || '',
  group: props.shortcut?.group || 'custom',
  enabled: props.shortcut?.enabled ?? true,
  preventDefault: props.shortcut?.preventDefault ?? true,
  stopPropagation: props.shortcut?.stopPropagation ?? false
})

// 键盘捕获相关
const keyInput = ref<HTMLInputElement>()
const capturing = ref(false)
const keyError = ref('')

// 平台相关
const metaKeyName = computed(() => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Win'
})

// 显示文本
const keyDisplayText = computed(() => {
  if (!form.key) return ''
  
  const parts: string[] = []
  if (form.modifiers?.ctrl) parts.push('Ctrl')
  if (form.modifiers?.alt) parts.push('Alt')
  if (form.modifiers?.shift) parts.push('Shift')
  if (form.modifiers?.meta) parts.push(metaKeyName.value)
  
  if (form.key) {
    parts.push(form.key.length === 1 ? form.key.toUpperCase() : form.key)
  }
  
  return parts.join(' + ')
})

// 表单验证
const isValid = computed(() => {
  return !!(form.name && form.key && (form.action !== 'custom' || form.customAction))
})

// 开始捕获键盘事件
const startCapture = () => {
  capturing.value = true
  keyError.value = ''
}

// 停止捕获键盘事件
const stopCapture = () => {
  capturing.value = false
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (!capturing.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  // 按 Escape 取消
  if (event.key === 'Escape') {
    stopCapture()
    keyInput.value?.blur()
    return
  }
  
  // 忽略单独的修饰键
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
    return
  }
  
  // 设置修饰键
  form.modifiers!.ctrl = event.ctrlKey
  form.modifiers!.alt = event.altKey
  form.modifiers!.shift = event.shiftKey
  form.modifiers!.meta = event.metaKey
  
  // 设置主键
  form.key = event.key
  
  // 验证快捷键
  validateShortcut()
  
  // 停止捕获
  stopCapture()
  keyInput.value?.blur()
}

// 清除快捷键
const clearKey = () => {
  form.key = ''
  form.modifiers!.ctrl = false
  form.modifiers!.alt = false
  form.modifiers!.shift = false
  form.modifiers!.meta = false
  keyError.value = ''
}

// 验证快捷键
const validateShortcut = () => {
  keyError.value = ''
  
  if (!form.key) {
    keyError.value = '请设置快捷键'
    return false
  }
  
  // 检查是否只有修饰键
  const hasModifier = form.modifiers!.ctrl || form.modifiers!.alt || 
                     form.modifiers!.shift || form.modifiers!.meta
  
  if (!hasModifier && form.key.length === 1) {
    keyError.value = '单个字母/数字键需要配合修饰键使用'
    return false
  }
  
  return true
}

// 保存
const handleSave = () => {
  if (!isValid.value || !validateShortcut()) {
    return
  }
  
  // 生成 ID（如果是新建）
  if (!form.id) {
    form.id = `shortcut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  emit('save', { ...form })
}

// 监听修饰键变化，重新验证
watch(
  () => [form.modifiers?.ctrl, form.modifiers?.alt, form.modifiers?.shift, form.modifiers?.meta],
  () => {
    if (form.key) {
      validateShortcut()
    }
  }
)

// 自动聚焦到键盘输入框
nextTick(() => {
  keyInput.value?.focus()
})
</script>

<style scoped>
.shortcut-editor {
  max-width: 600px;
  margin: 0 auto;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.key-capture-area {
  margin-bottom: 16px;
}

.capture-input {
  position: relative;
  display: flex;
  align-items: center;
}

.key-input {
  flex: 1;
  padding-right: 40px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  background: white;
  cursor: pointer;
}

.key-input:focus {
  cursor: text;
}

.clear-key-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  transition: background-color 0.2s;
}

.clear-key-btn:hover {
  background: #dc2626;
}

.capture-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #3b82f6;
  font-style: italic;
}

.key-error {
  margin-top: 8px;
  font-size: 12px;
  color: #ef4444;
}

.modifier-checkboxes {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.checkbox-text {
  user-select: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

@media (max-width: 768px) {
  .shortcut-editor {
    max-width: none;
    margin: 0;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .modifier-checkboxes {
    gap: 12px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
}
</style>