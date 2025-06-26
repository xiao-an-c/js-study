<template>
  <div class="shortcut-dialog-overlay" @click="handleOverlayClick">
    <div class="shortcut-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ isEditing ? '编辑快捷键' : '添加快捷键' }}</h3>
        <button class="close-btn" @click="$emit('cancel')">
          ×
        </button>
      </div>

      <div class="dialog-content">
        <ShortcutEditor
          :shortcut="shortcut"
          :is-editing="isEditing"
          @save="handleSave"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ShortcutConfig } from '../types'
import ShortcutEditor from './ShortcutEditor.vue'

interface Props {
  shortcut?: ShortcutConfig | null
}

interface Emits {
  save: [shortcut: ShortcutConfig]
  cancel: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = computed(() => !!props.shortcut)

const handleSave = (shortcut: ShortcutConfig) => {
  emit('save', shortcut)
}

const handleOverlayClick = () => {
  emit('cancel')
}
</script>

<style scoped>
.shortcut-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.shortcut-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

@media (max-width: 768px) {
  .shortcut-dialog {
    width: 95%;
    max-height: 90vh;
  }

  .dialog-header {
    padding: 15px;
  }

  .dialog-header h3 {
    font-size: 16px;
  }
}
</style>