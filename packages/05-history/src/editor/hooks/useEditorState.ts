import { ref, computed } from 'vue'
import type { ComponentNode, EditorState } from '../types'
import { NodeService } from '../services'

/**
 * 编辑器状态管理Hook
 * 管理编辑器的全局状态，包括选中节点、拖拽状态等
 */
export function useEditorState(rootNode: ComponentNode) {
  // 编辑器状态
  const state = ref<EditorState>({
    selectedNodeId: null,
    isDragOver: false,
    droppedData: null
  })

  // 计算当前选中的节点
  const selectedNode = computed(() => {
    if (!state.value.selectedNodeId) return null
    return NodeService.findNodeById(rootNode, state.value.selectedNodeId)
  })

  // 选中节点
  const selectNode = (nodeId: string | null) => {
    state.value.selectedNodeId = nodeId
  }

  // 设置拖拽状态
  const setDragOver = (isDragOver: boolean) => {
    state.value.isDragOver = isDragOver
  }

  // 设置拖拽数据
  const setDroppedData = (data: any) => {
    state.value.droppedData = data
  }

  // 清除选中状态
  const clearSelection = () => {
    state.value.selectedNodeId = null
  }

  return {
    state: state.value,
    selectedNode,
    selectNode,
    setDragOver,
    setDroppedData,
    clearSelection
  }
}