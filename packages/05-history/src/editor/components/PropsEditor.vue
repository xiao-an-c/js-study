<script setup lang="ts">
import type { ComponentNode } from '../types'

interface Props {
  selectedNode: ComponentNode | null
}

interface Emits {
  (e: 'update-props', nodeId: string, props: Record<string, any>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 获取当前属性值
 * @param propName 属性名
 * @returns 属性值
 */
const getCurrentPropValue = (propName: string) => {
  if (!props.selectedNode) return ''
  return props.selectedNode.props?.[propName] ?? props.selectedNode.define.defaultProps?.[propName] ?? ''
}

/**
 * 处理属性变化
 * @param propName 属性名
 * @param value 新值
 */
const handlePropChange = (propName: string, value: any) => {
  if (!props.selectedNode) return
  
  emit('update-props', props.selectedNode.id, {
    [propName]: value
  })
}

/**
 * 重置属性到默认值
 * @param propName 属性名
 */
const resetPropToDefault = (propName: string) => {
  if (!props.selectedNode) return
  
  const defaultValue = props.selectedNode.define.defaultProps?.[propName]
  if (defaultValue !== undefined) {
    handlePropChange(propName, defaultValue)
  }
}
</script>

<template>
  <div class="props-editor">
    <div class="props-editor__header">
      <h3 class="props-editor__title">属性编辑器</h3>
    </div>

    <div class="props-editor__content">
      <div v-if="!selectedNode" class="props-editor__empty">
        <div class="props-editor__empty-icon">🎯</div>
        <p class="props-editor__empty-text">请选择一个组件</p>
        <p class="props-editor__empty-desc">点击画布中的组件来编辑其属性</p>
      </div>

      <div v-else class="props-editor__form">
        <div class="props-editor__component-info">
          <h4 class="props-editor__component-name">{{ selectedNode.define.text }}</h4>
          <p class="props-editor__component-id">ID: {{ selectedNode.id }}</p>
        </div>

        <div class="props-editor__props-list">
          <div
            v-for="(schema, propName) in selectedNode.define.propsSchema"
            :key="propName"
            class="props-editor__prop-item"
          >
            <div class="props-editor__prop-header">
              <label class="props-editor__prop-label">
                {{ propName }}
                <span v-if="schema.required" class="props-editor__required">*</span>
              </label>
              
              <button 
                v-if="selectedNode.define.defaultProps?.[propName] !== undefined"
                @click="resetPropToDefault(propName)"
                class="props-editor__reset-btn"
                title="重置为默认值"
              >
                ↺
              </button>
            </div>

            <!-- 字符串类型输入 -->
            <input
              v-if="schema.type === 'string'"
              :value="getCurrentPropValue(propName)"
              @input="handlePropChange(propName, ($event.target as HTMLInputElement).value)"
              class="props-editor__input"
              type="text"
              :placeholder="`请输入${propName}`"
            />

            <!-- 数字类型输入 -->
            <input
              v-else-if="schema.type === 'number'"
              :value="getCurrentPropValue(propName)"
              @input="handlePropChange(propName, Number(($event.target as HTMLInputElement).value))"
              class="props-editor__input"
              type="number"
              :placeholder="`请输入${propName}`"
            />

            <!-- 布尔类型选择 -->
            <select
              v-else-if="schema.type === 'boolean'"
              :value="getCurrentPropValue(propName)"
              @change="handlePropChange(propName, ($event.target as HTMLSelectElement).value === 'true')"
              class="props-editor__select"
            >
              <option value="true">是</option>
              <option value="false">否</option>
            </select>

            <!-- 其他类型使用文本域 -->
            <textarea
              v-else
              :value="getCurrentPropValue(propName)"
              @input="handlePropChange(propName, ($event.target as HTMLTextAreaElement).value)"
              class="props-editor__textarea"
              :placeholder="`请输入${propName}`"
              rows="3"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.props-editor {
  @apply h-full rounded-md border border-gray-300 box-border flex flex-col w-64 bg-white;
  
  &__header {
    @apply p-3 border-b border-gray-200;
  }
  
  &__title {
    @apply text-sm font-medium text-gray-700 m-0;
  }
  
  &__content {
    @apply flex-1 overflow-y-auto;
  }
  
  &__empty {
    @apply flex flex-col items-center justify-center h-full p-6 text-center;
  }
  
  &__empty-icon {
    @apply text-4xl mb-3;
  }
  
  &__empty-text {
    @apply text-gray-600 font-medium mb-1;
  }
  
  &__empty-desc {
    @apply text-gray-400 text-sm;
  }
  
  &__form {
    @apply p-3;
  }
  
  &__component-info {
    @apply mb-4 p-3 bg-gray-50 rounded-md;
  }
  
  &__component-name {
    @apply text-base font-medium text-gray-800 m-0 mb-1;
  }
  
  &__component-id {
    @apply text-xs text-gray-500 m-0;
  }
  
  &__props-list {
    @apply space-y-4;
  }
  
  &__prop-item {
    @apply space-y-2;
  }
  
  &__prop-header {
    @apply flex items-center justify-between;
  }
  
  &__prop-label {
    @apply text-sm font-medium text-gray-700 flex items-center gap-1;
  }
  
  &__required {
    @apply text-red-500;
  }
  
  &__reset-btn {
    @apply text-gray-400 hover:text-gray-600 text-sm p-1 rounded transition-colors;
  }
  
  &__input,
  &__select,
  &__textarea {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  }
  
  &__textarea {
    @apply resize-none;
  }
}
</style>