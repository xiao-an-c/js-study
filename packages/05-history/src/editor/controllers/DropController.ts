import type { IDropController, ComponentNode } from '../types'
import { NodeService, HistoryManager, AddNodeCommand, RemoveNodeCommand, MoveNodeCommand } from '../services'

/**
 * 拖拽控制器实现类
 * 负责处理组件的拖拽和放置逻辑
 */
export class DropController implements IDropController {
  constructor(private historyManager?: HistoryManager) {}

  /**
   * 向指定节点的插槽添加子节点
   * @param node 父节点
   * @param slotKey 插槽键
   * @param appendNode 要添加的子节点
   */
  public appendNode(node: ComponentNode, slotKey: string, appendNode: ComponentNode): void {
    if (this.historyManager) {
      // 使用历史管理器执行命令
      const command = new AddNodeCommand(node, slotKey, appendNode)
      this.historyManager.executeCommand(command)
    } else {
      // 直接操作（向后兼容）
      NodeService.appendNodeToSlot(node, slotKey, appendNode)
    }
  }

  /**
   * 移除节点
   * @param rootNode 根节点（用于查找父节点）
   * @param targetNode 要移除的节点
   */
  public removeNode(rootNode: ComponentNode, targetNode: ComponentNode): boolean {
    if (this.historyManager) {
      // 使用历史管理器执行命令
      const command = new RemoveNodeCommand(rootNode, targetNode)
      this.historyManager.executeCommand(command)
      return true
    } else {
      // 直接操作（向后兼容）
      return this.removeNodeDirect(rootNode, targetNode.id)
    }
  }

  /**
   * 直接移除节点（不使用历史记录）
   * @param parentNode 父节点
   * @param nodeId 要移除的节点ID
   */
  private removeNodeDirect(parentNode: ComponentNode, nodeId: string): boolean {
    if (!parentNode.slots) return false

    for (const [_, slotNodes] of Object.entries(parentNode.slots)) {
      const index = slotNodes.findIndex(node => node.id === nodeId)
      if (index !== -1) {
        slotNodes.splice(index, 1)
        return true
      }

      // 递归查找子节点
      for (const childNode of slotNodes) {
        if (this.removeNodeDirect(childNode, nodeId)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 移动节点位置
   * @param rootNode 根节点
   * @param targetNode 要移动的节点
   * @param destParent 目标父节点
   * @param destSlotKey 目标插槽键
   * @param destIndex 目标位置索引
   */
  public moveNode(
    rootNode: ComponentNode,
    targetNode: ComponentNode,
    destParent: ComponentNode,
    destSlotKey: string,
    destIndex?: number
  ): boolean {
    if (this.historyManager) {
      // 使用历史管理器执行命令
      const command = new MoveNodeCommand(rootNode, targetNode, destParent, destSlotKey, destIndex)
      this.historyManager.executeCommand(command)
      return true
    } else {
      // 直接操作（向后兼容）
      return this.moveNodeDirect(rootNode, targetNode, destParent, destSlotKey, destIndex)
    }
  }

  /**
   * 直接移动节点（不使用历史记录）
   */
  private moveNodeDirect(
    rootNode: ComponentNode,
    targetNode: ComponentNode,
    destParent: ComponentNode,
    destSlotKey: string,
    destIndex?: number
  ): boolean {
    // 先移除节点
    if (!this.removeNodeDirect(rootNode, targetNode.id)) {
      return false
    }

    // 再添加到目标位置
    if (!destParent.slots) {
      destParent.slots = {}
    }
    if (!destParent.slots[destSlotKey]) {
      destParent.slots[destSlotKey] = []
    }

    if (destIndex !== undefined) {
      destParent.slots[destSlotKey].splice(destIndex, 0, targetNode)
    } else {
      destParent.slots[destSlotKey].push(targetNode)
    }

    return true
  }
}
