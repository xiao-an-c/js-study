import type { ComponentNode } from '../types'

/**
 * 命令接口
 * 定义所有可撤销操作的基本结构
 */
export interface ICommand {
  /** 执行命令 */
  execute(): void
  /** 撤销命令 */
  undo(): void
  /** 重做命令 */
  redo(): void
  /** 命令描述 */
  description: string
}

/**
 * 添加节点命令
 */
export class AddNodeCommand implements ICommand {
  public description: string

  constructor(
    private parentNode: ComponentNode,
    private slotKey: string,
    private childNode: ComponentNode,
    private index?: number
  ) {
    this.description = `添加 ${childNode.define.text} 组件`
  }

  execute(): void {
    if (!this.parentNode.slots) {
      this.parentNode.slots = {}
    }
    if (!this.parentNode.slots[this.slotKey]) {
      this.parentNode.slots[this.slotKey] = []
    }

    if (this.index !== undefined) {
      this.parentNode.slots[this.slotKey].splice(this.index, 0, this.childNode)
    } else {
      this.parentNode.slots[this.slotKey].push(this.childNode)
      this.index = this.parentNode.slots[this.slotKey].length - 1
    }
  }

  undo(): void {
    if (this.parentNode.slots?.[this.slotKey] && this.index !== undefined) {
      this.parentNode.slots[this.slotKey].splice(this.index, 1)
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * 删除节点命令
 */
export class RemoveNodeCommand implements ICommand {
  public description: string
  private parentNode: ComponentNode | null = null
  private slotKey: string = ''
  private index: number = -1

  constructor(
    private rootNode: ComponentNode,
    private targetNode: ComponentNode
  ) {
    this.description = `删除 ${targetNode.define.text} 组件`
    this.findParentInfo()
  }

  private findParentInfo(): void {
    const findParent = (node: ComponentNode): boolean => {
      if (node.slots) {
        for (const [slotKey, slotNodes] of Object.entries(node.slots)) {
          const index = slotNodes.findIndex(child => child.id === this.targetNode.id)
          if (index !== -1) {
            this.parentNode = node
            this.slotKey = slotKey
            this.index = index
            return true
          }

          for (const childNode of slotNodes) {
            if (findParent(childNode)) {
              return true
            }
          }
        }
      }
      return false
    }

    findParent(this.rootNode)
  }

  execute(): void {
    if (this.parentNode?.slots?.[this.slotKey] && this.index !== -1) {
      this.parentNode.slots[this.slotKey].splice(this.index, 1)
    }
  }

  undo(): void {
    if (this.parentNode?.slots?.[this.slotKey] && this.index !== -1) {
      this.parentNode.slots[this.slotKey].splice(this.index, 0, this.targetNode)
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * 更新节点属性命令
 */
export class UpdatePropsCommand implements ICommand {
  public description: string
  private oldProps: Record<string, any>

  constructor(
    private targetNode: ComponentNode,
    private newProps: Record<string, any>
  ) {
    this.description = `更新 ${targetNode.define.text} 属性`
    this.oldProps = { ...targetNode.props }
  }

  execute(): void {
    this.targetNode.props = { ...this.targetNode.props, ...this.newProps }
  }

  undo(): void {
    this.targetNode.props = { ...this.oldProps }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * 移动节点命令
 */
export class MoveNodeCommand implements ICommand {
  public description: string
  private sourceParent: ComponentNode | null = null
  private sourceSlotKey: string = ''
  private sourceIndex: number = -1

  constructor(
    private rootNode: ComponentNode,
    private targetNode: ComponentNode,
    private destParent: ComponentNode,
    private destSlotKey: string,
    private destIndex?: number
  ) {
    this.description = `移动 ${targetNode.define.text} 组件`
    this.findSourceInfo()
  }

  private findSourceInfo(): void {
    const findParent = (node: ComponentNode): boolean => {
      if (node.slots) {
        for (const [slotKey, slotNodes] of Object.entries(node.slots)) {
          const index = slotNodes.findIndex(child => child.id === this.targetNode.id)
          if (index !== -1) {
            this.sourceParent = node
            this.sourceSlotKey = slotKey
            this.sourceIndex = index
            return true
          }

          for (const childNode of slotNodes) {
            if (findParent(childNode)) {
              return true
            }
          }
        }
      }
      return false
    }

    findParent(this.rootNode)
  }

  execute(): void {
    // 从源位置移除
    if (this.sourceParent?.slots?.[this.sourceSlotKey] && this.sourceIndex !== -1) {
      this.sourceParent.slots[this.sourceSlotKey].splice(this.sourceIndex, 1)
    }

    // 添加到目标位置
    if (!this.destParent.slots) {
      this.destParent.slots = {}
    }
    if (!this.destParent.slots[this.destSlotKey]) {
      this.destParent.slots[this.destSlotKey] = []
    }

    if (this.destIndex !== undefined) {
      this.destParent.slots[this.destSlotKey].splice(this.destIndex, 0, this.targetNode)
    } else {
      this.destParent.slots[this.destSlotKey].push(this.targetNode)
    }
  }

  undo(): void {
    // 从目标位置移除
    if (this.destParent.slots?.[this.destSlotKey]) {
      const currentIndex = this.destParent.slots[this.destSlotKey].findIndex(
        node => node.id === this.targetNode.id
      )
      if (currentIndex !== -1) {
        this.destParent.slots[this.destSlotKey].splice(currentIndex, 1)
      }
    }

    // 恢复到源位置
    if (this.sourceParent?.slots?.[this.sourceSlotKey] && this.sourceIndex !== -1) {
      this.sourceParent.slots[this.sourceSlotKey].splice(this.sourceIndex, 0, this.targetNode)
    }
  }

  redo(): void {
    this.execute()
  }
}

/**
 * 历史记录管理器
 * 使用命令模式实现撤销/重做功能
 */
export class HistoryManager {
  private history: ICommand[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50
  private listeners: (() => void)[] = []

  /**
   * 添加状态变化监听器
   */
  addListener(listener: () => void): () => void {
    this.listeners.push(listener)
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 通知所有监听器状态已变化
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  /**
   * 执行命令并添加到历史记录
   */
  executeCommand(command: ICommand): void {
    console.log(this)
    // 执行命令
    command.execute()

    // 清除当前位置之后的历史记录
    this.history = this.history.slice(0, this.currentIndex + 1)

    // 添加新命令到历史记录
    this.history.push(command)
    this.currentIndex++

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }

    // 通知状态变化
    this.notifyListeners()
  }

  /**
   * 撤销操作
   */
  undo(): boolean {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex]
      command.undo()
      this.currentIndex--
      this.notifyListeners()
      return true
    }
    return false
  }

  /**
   * 重做操作
   */
  redo(): boolean {
    if (this.canRedo()) {
      this.currentIndex++
      const command = this.history[this.currentIndex]
      command.redo()
      this.notifyListeners()
      return true
    }
    return false
  }

  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0
  }

  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 获取当前历史记录信息
   */
  getHistoryInfo() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      historyLength: this.history.length,
      currentCommand: this.currentIndex >= 0 ? this.history[this.currentIndex]?.description : null,
      nextCommand: this.canRedo() ? this.history[this.currentIndex + 1]?.description : null
    }
  }

  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }

  /**
   * 获取历史记录列表
   */
  getHistory(): Array<{ description: string; index: number; isCurrent: boolean }> {
    return this.history.map((command, index) => ({
      description: command.description,
      index,
      isCurrent: index === this.currentIndex
    }))
  }
}
