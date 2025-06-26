<template>
  <div class="tree-node">
    <div 
      class="tree-node-item"
      :class="{ 'selected': node.id === selectedId }"
      :style="{ paddingLeft: level * 20 + 'px' }"
      @click.stop="$emit('select', node.id)"
    >
      <span class="node-icon">📦</span>
      <span class="node-text">{{ node.define.text }} ({{ node.id }})</span>
    </div>
    <div v-if="node.slots" class="tree-children">
      <template v-for="(slotNodes, slotKey) in node.slots" :key="slotKey">
        <ComponentTreeNode
          v-for="child in slotNodes"
          :key="child.id"
          :node="child"
          :selected-id="selectedId"
          :level="level + 1"
          @select="$emit('select', $event)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentNode } from '../editor/types'

interface Props {
  node: ComponentNode
  selectedId?: string
  level?: number
}

withDefaults(defineProps<Props>(), {
  level: 0
})

defineEmits<{
  select: [nodeId: string]
}>()
</script>

<style scoped>
.tree-node-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.tree-node-item:hover {
  background: #f3f4f6;
}

.tree-node-item.selected {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 500;
}

.node-icon {
  font-size: 12px;
}

.node-text {
  flex: 1;
}
</style>