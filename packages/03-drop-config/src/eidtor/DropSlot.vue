<script setup lang="ts" name="DropSlot">
import { inject } from 'vue'
import { IDropController } from './IDropController'
import { ComponentDefineJSON, ComponentNode, DragData } from '@/type';
import { COMPONENT_LIST, Node } from '@/libs'

const controller = inject<IDropController>('drop-controller')

interface Props {
  node: ComponentNode
  slotKey: string
}

const props = defineProps<Props>()

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const json = JSON.parse(e.dataTransfer?.getData('application/json')!) as DragData
  const { payload } = json
  const define = COMPONENT_LIST.find(item => item.name === payload.name)
  if (!define) {
    console.warn(`[DropSlot] 未找到组件定义 ${payload.name}`)
    return;
  }

  controller?.appendNode(props.node, props.slotKey, (new Node(define)).toJSON())
}
</script>
<template>
  <div class="drop-slot" @drop="handleDrop">
    请拖拽到此处
  </div>
</template>

<style scoped>
.drop-slot {
  border: 1px dashed #ccc;
  padding: 10px;
}
</style>
