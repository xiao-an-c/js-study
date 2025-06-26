<template>
  <div class="props-editor">
    <div class="props-editor-header">
      <h3 class="props-editor-title">属性编辑器</h3>
    </div>

    <div class="props-editor-content">
      <div v-if="!selectedNode" class="no-selection">
        <p class="no-selection-text">请选择一个组件</p>
      </div>

      <div v-else class="props-form">
        <div class="component-info">
          <h4 class="component-name">{{ selectedNode.define.text }}</h4>
          <p class="component-id">ID: {{ selectedNode.id }}</p>
        </div>

        <div class="props-list">
          <div
            v-for="(schema, propName) in selectedNode.define.propsSchema"
            :key="propName"
            class="prop-item"
          >
            <label class="prop-label">
              {{ propName }}
              <span v-if="schema.required" class="required">*</span>
            </label>

            <input
              v-if="schema.type === 'string'"
              :value="getCurrentPropValue(propName)"
              @input="handlePropChange(propName, ($event.target as HTMLInputElement).value)"
              class="prop-input"
              type="text"
              :placeholder="`请输入${propName}`"
            />

            <input
              v-else-if="schema.type === 'number'"
              :value="getCurrentPropValue(propName)"
              @input="handlePropChange(propName, Number(($event.target as HTMLInputElement).value))"
              class="prop-input"
              type="number"
              :placeholder="`请输入${propName}`"
            />

            <select
              v-else-if="schema.type === 'boolean'"
              :value="getCurrentPropValue(propName)"
              @change="handlePropChange(propName, ($event.target as HTMLSelectElement).value === 'true')"
              class="prop-select"
            >
              <option value="true">是</option>
              <option value="false">否</option>
            </select>

            <textarea
              v-else
              :value="getCurrentPropValue(propName)"
              @input="handlePropChange(propName, ($event.target as HTMLTextAreaElement).value)"
              class="prop-textarea"
              :placeholder="`请输入${propName}`"
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentNode } from '@/type'

interface Props {
  selectedNode: ComponentNode | null
}

interface Emits {
  (e: 'update-props', nodeId: string, props: Record<string, any>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取当前属性值
const getCurrentPropValue = (propName: string) => {
  if (!props.selectedNode) return ''
  const currentValue = props.selectedNode.props?.[propName]
  const defaultValue = props.selectedNode.define.defaultProps?.[propName]
  return currentValue !== undefined ? currentValue : (defaultValue || '')
}

// 处理属性变化
const handlePropChange = (propName: string, value: any) => {
  if (!props.selectedNode) return

  const newProps = {
    ...props.selectedNode.props,
    [propName]: value
  }

  emit('update-props', props.selectedNode.id, newProps)
}
</script>

<style scoped>
.props-editor {
  @apply w-80 bg-white border-l border-gray-200 flex flex-col h-full;
}

.props-editor-header {
  @apply px-4 py-3 border-b border-gray-200 bg-gray-50;
}

.props-editor-title {
  @apply text-lg font-semibold text-gray-800 m-0;
}

.props-editor-content {
  @apply flex-1 overflow-y-auto;
}

.no-selection {
  @apply flex items-center justify-center h-full;
}

.no-selection-text {
  @apply text-gray-500 text-center;
}

.props-form {
  @apply p-4;
}

.component-info {
  @apply mb-6 pb-4 border-b border-gray-100;
}

.component-name {
  @apply text-base font-medium text-gray-800 mb-1;
}

.component-id {
  @apply text-sm text-gray-500 m-0;
}

.props-list {
  @apply space-y-4;
}

.prop-item {
  @apply space-y-2;
}

.prop-label {
  @apply block text-sm font-medium text-gray-700;
}

.required {
  @apply text-red-500 ml-1;
}

.prop-input,
.prop-select,
.prop-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.prop-textarea {
  @apply resize-none;
}
</style>
