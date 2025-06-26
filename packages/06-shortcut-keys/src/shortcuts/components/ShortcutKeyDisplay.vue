<template>
  <div class="shortcut-key-display">
    <div class="key-combination">
      <!-- 修饰键 -->
      <span v-if="modifierKeys.length > 0" class="modifier-keys">
        <kbd 
          v-for="modifier in modifierKeys" 
          :key="modifier"
          class="key-badge modifier"
        >
          {{ modifier }}
        </kbd>
        <span class="plus">+</span>
      </span>
      
      <!-- 主键 -->
      <kbd class="key-badge main-key">
        {{ displayKey }}
      </kbd>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShortcutConfig } from '../types'

interface Props {
  shortcut: ShortcutConfig
}

const props = defineProps<Props>()

// 修饰键映射
const modifierMap = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  meta: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Win'
}

// 特殊键映射
const specialKeyMap: Record<string, string> = {
  ' ': 'Space',
  'Enter': 'Enter',
  'Escape': 'Esc',
  'Tab': 'Tab',
  'Backspace': 'Backspace',
  'Delete': 'Del',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'Home': 'Home',
  'End': 'End',
  'PageUp': 'PgUp',
  'PageDown': 'PgDn',
  'Insert': 'Ins',
  'F1': 'F1',
  'F2': 'F2',
  'F3': 'F3',
  'F4': 'F4',
  'F5': 'F5',
  'F6': 'F6',
  'F7': 'F7',
  'F8': 'F8',
  'F9': 'F9',
  'F10': 'F10',
  'F11': 'F11',
  'F12': 'F12'
}

// 计算修饰键列表
const modifierKeys = computed(() => {
  const keys: string[] = []
  const { modifiers } = props.shortcut
  
  // 按照常见顺序排列修饰键
  if (modifiers.ctrl) keys.push(modifierMap.ctrl)
  if (modifiers.alt) keys.push(modifierMap.alt)
  if (modifiers.shift) keys.push(modifierMap.shift)
  if (modifiers.meta) keys.push(modifierMap.meta)
  
  return keys
})

// 计算显示的主键
const displayKey = computed(() => {
  const { key } = props.shortcut
  
  // 检查是否是特殊键
  if (specialKeyMap[key]) {
    return specialKeyMap[key]
  }
  
  // 数字和字母键直接显示（转大写）
  if (key.length === 1) {
    return key.toUpperCase()
  }
  
  // 其他键保持原样
  return key
})
</script>

<style scoped>
.shortcut-key-display {
  display: inline-flex;
  align-items: center;
}

.key-combination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.modifier-keys {
  display: flex;
  align-items: center;
  gap: 4px;
}

.key-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  color: #374151;
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  user-select: none;
}

.key-badge.modifier {
  background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
  color: #6b7280;
  font-size: 11px;
}

.key-badge.main-key {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
  color: white;
  border-color: #1d4ed8;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  font-weight: 700;
  min-width: 28px;
}

.plus {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  margin: 0 2px;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .key-badge {
    background: linear-gradient(to bottom, #374151, #1f2937);
    border-color: #4b5563;
    color: #f3f4f6;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
  }
  
  .key-badge.modifier {
    background: linear-gradient(to bottom, #4b5563, #374151);
    color: #d1d5db;
  }
  
  .key-badge.main-key {
    background: linear-gradient(to bottom, #3b82f6, #1e40af);
    border-color: #1e3a8a;
  }
  
  .plus {
    color: #6b7280;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .key-badge {
    min-width: 20px;
    height: 20px;
    font-size: 10px;
    padding: 0 6px;
  }
  
  .key-badge.main-key {
    min-width: 24px;
  }
  
  .plus {
    font-size: 10px;
  }
}

/* 动画效果 */
.key-badge {
  transition: all 0.15s ease;
}

.shortcut-key-display:hover .key-badge {
  transform: translateY(-1px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.shortcut-key-display:hover .key-badge.main-key {
  box-shadow: 
    0 2px 4px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .key-badge {
    transition: none;
  }
  
  .shortcut-key-display:hover .key-badge {
    transform: none;
  }
}
</style>