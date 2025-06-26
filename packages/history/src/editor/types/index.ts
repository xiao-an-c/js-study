import { ComponentNode, DragData } from '@/type'

export interface IDropController {
  appendNode: (node: ComponentNode, slotKey: string, appendNode: ComponentNode) => void
}

export interface EditorState {
  selectedNodeId: string | null
  isDragOver: boolean
  droppedData: DragData | null
}

export interface NodeOperations {
  findNodeById: (rootNode: ComponentNode, targetId: string) => ComponentNode | null
  updateNodeProps: (rootNode: ComponentNode, targetId: string, newProps: Record<string, any>) => boolean
}

// Re-export types from main type file
export type {
  Component,
  PropsSchema,
  SlotDefintion,
  ComponentDefine,
  ComponentDefineJSON,
  ComponentNode,
  DragData
} from '@/type'
