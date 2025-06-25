<script setup lang="ts" name="DropContainer">
import { provide, ref } from 'vue';
import type { ComponentNode } from '@/type';
import { IDropController } from './IDropController';

interface Props {
  node: ComponentNode
}

defineProps<Props>()
const emit = defineEmits(['test'])

class DropController implements IDropController {
  public appendNode(node: ComponentNode, slotKey: string, appendNode: ComponentNode) {
    if(!node.slots) {
      node.slots = {} as Record<string, ComponentNode[]>
    }

    if(!node.slots[slotKey]) {
      node.slots[slotKey] = []
    }

    node.slots?.[slotKey]?.push(appendNode)
  }
}

provide('drop-controller', new DropController())

const isDragOver = ref(false)
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
  isDragOver.value = true
}

</script>
<template>
  <div class="drop-zone" :class="{ 'drop-zone--active': isDragOver }" @drop="handleDrop" @dragover="handleDragOver">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  @apply flex-1 h-full rounded-md p-1 border border-gray-300 box-border border-2 border-dashed border-gray-400 transition-all duration-300 ease-in-out flex items-center justify-center text-center;
}

.drop-zone--active {
  @apply border-blue-500 bg-gray-50;
}
</style>
