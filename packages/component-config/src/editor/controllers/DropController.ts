import type { ComponentNode, IDropController } from '../types'
import { NodeService } from '../services'

/**
 * 拖拽控制器实现类
 * 负责处理组件的拖拽和放置逻辑
 */
export class DropController implements IDropController {
  /**
   * 向指定节点的插槽添加子节点
   * @param node 父节点
   * @param slotKey 插槽键
   * @param appendNode 要添加的子节点
   */
  public appendNode(node: ComponentNode, slotKey: string, appendNode: ComponentNode): void {
    NodeService.appendNodeToSlot(node, slotKey, appendNode)
  }

  /**
   * 移除节点
   * @param parentNode 父节点
   * @param slotKey 插槽键
   * @param nodeId 要移除的节点ID
   */
  public removeNode(parentNode: ComponentNode, slotKey: string, nodeId: string): boolean {
    if (!parentNode.slots || !parentNode.slots[slotKey]) {
      return false
    }

    const slotNodes = parentNode.slots[slotKey]
    const index = slotNodes.findIndex(node => node.id === nodeId)
    
    if (index !== -1) {
      slotNodes.splice(index, 1)
      return true
    }

    return false
  }

  /**
   * 移动节点位置
   * @param parentNode 父节点
   * @param slotKey 插槽键
   * @param fromIndex 源位置索引
   * @param toIndex 目标位置索引
   */
  public moveNode(parentNode: ComponentNode, slotKey: string, fromIndex: number, toIndex: number): boolean {
    if (!parentNode.slots || !parentNode.slots[slotKey]) {
      return false
    }

    const slotNodes = parentNode.slots[slotKey]
    if (fromIndex < 0 || fromIndex >= slotNodes.length || toIndex < 0 || toIndex >= slotNodes.length) {
      return false
    }

    const [movedNode] = slotNodes.splice(fromIndex, 1)
    slotNodes.splice(toIndex, 0, movedNode)
    return true
  }
}