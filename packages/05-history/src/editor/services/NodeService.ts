import type { ComponentNode } from '../types'

/**
 * 节点操作服务类
 * 负责处理节点的查找、更新等操作
 */
export class NodeService {
  /**
   * 递归查找节点
   * @param rootNode 根节点
   * @param targetId 目标节点ID
   * @returns 找到的节点或null
   */
  static findNodeById(rootNode: ComponentNode, targetId: string): ComponentNode | null {
    if (rootNode.id === targetId) return rootNode

    if (rootNode.slots) {
      for (const slotNodes of Object.values(rootNode.slots)) {
        for (const childNode of slotNodes) {
          const found = this.findNodeById(childNode, targetId)
          if (found) return found
        }
      }
    }

    return null
  }

  /**
   * 递归更新节点属性
   * @param rootNode 根节点
   * @param targetId 目标节点ID
   * @param newProps 新属性
   * @returns 是否更新成功
   */
  static updateNodeProps(
    rootNode: ComponentNode,
    targetId: string,
    newProps: Record<string, any>
  ): boolean {
    if (rootNode.id === targetId) {
      rootNode.props = { ...rootNode.props, ...newProps }
      return true
    }

    if (rootNode.slots) {
      for (const slotNodes of Object.values(rootNode.slots)) {
        for (const childNode of slotNodes) {
          if (this.updateNodeProps(childNode, targetId, newProps)) {
            return true
          }
        }
      }
    }

    return false
  }

  /**
   * 向指定节点的插槽添加子节点
   * @param parentNode 父节点
   * @param slotKey 插槽键
   * @param childNode 子节点
   */
  static appendNodeToSlot(
    parentNode: ComponentNode,
    slotKey: string,
    childNode: ComponentNode
  ): void {
    if (!parentNode.slots) {
      parentNode.slots = {} as Record<string, ComponentNode[]>
    }

    if (!parentNode.slots[slotKey]) {
      parentNode.slots[slotKey] = []
    }

    parentNode.slots[slotKey].push(childNode)
  }
}