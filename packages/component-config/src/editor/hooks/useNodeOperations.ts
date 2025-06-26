import type { ComponentNode } from '../types'
import { NodeService } from '../services'

/**
 * 节点操作Hook
 * 提供节点相关的操作方法
 */
export function useNodeOperations(rootNode: ComponentNode) {
  // 查找节点
  const findNodeById = (targetId: string) => {
    return NodeService.findNodeById(rootNode, targetId)
  }

  // 更新节点属性
  const updateNodeProps = (nodeId: string, newProps: Record<string, any>) => {
    return NodeService.updateNodeProps(rootNode, nodeId, newProps)
  }

  // 添加子节点
  const appendNode = (parentNodeId: string, slotKey: string, childNode: ComponentNode) => {
    const parentNode = findNodeById(parentNodeId)
    if (parentNode) {
      NodeService.appendNodeToSlot(parentNode, slotKey, childNode)
      return true
    }
    return false
  }

  // 删除节点
  const removeNode = (nodeId: string): boolean => {
    const removeFromSlots = (node: ComponentNode): boolean => {
      if (!node.slots) return false
      
      for (const [slotKey, slotNodes] of Object.entries(node.slots)) {
        const index = slotNodes.findIndex(child => child.id === nodeId)
        if (index !== -1) {
          slotNodes.splice(index, 1)
          return true
        }
        
        // 递归查找子节点
        for (const childNode of slotNodes) {
          if (removeFromSlots(childNode)) {
            return true
          }
        }
      }
      
      return false
    }

    return removeFromSlots(rootNode)
  }

  return {
    findNodeById,
    updateNodeProps,
    appendNode,
    removeNode
  }
}