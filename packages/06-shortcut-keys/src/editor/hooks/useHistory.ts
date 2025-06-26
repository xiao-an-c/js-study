import { ref, computed, onUnmounted } from 'vue'
import type { ComponentNode } from '../types'
import {
  HistoryManager,
  AddNodeCommand,
  RemoveNodeCommand,
  UpdatePropsCommand,
  MoveNodeCommand,
  type ICommand
} from '../services/HistoryService'
import { NodeService } from '../services'

/**
 * 历史记录管理Hook
 * 提供撤销/重做功能的Vue3 Composition API封装
 */
export function useHistory(rootNode: ComponentNode) {
  // 创建历史管理器实例
  const historyManager = new HistoryManager()

  // 响应式的历史记录状态
  const historyState = ref(historyManager.getHistoryInfo())

  // 更新历史状态
  const updateHistoryState = () => {
    historyState.value = historyManager.getHistoryInfo()
  }

  // 监听历史状态变化
  const unsubscribe = historyManager.addListener(updateHistoryState)

  // 组件卸载时取消监听
  onUnmounted(() => {
    unsubscribe()
  })

  // 计算属性：是否可以撤销
  const canUndo = computed(() => historyState.value.canUndo)

  // 计算属性：是否可以重做
  const canRedo = computed(() => historyState.value.canRedo)

  // 计算属性：当前命令描述
  const currentCommand = computed(() => historyState.value.currentCommand)

  // 计算属性：下一个命令描述
  const nextCommand = computed(() => historyState.value.nextCommand)

  // 计算属性：历史记录列表
  const historyList = computed(() => historyManager.getHistory())

  /**
   * 执行命令
   */
  const executeCommand = (command: ICommand) => {
    historyManager.executeCommand(command)
  }

  /**
   * 撤销操作
   */
  const undo = () => {
    return historyManager.undo()
  }

  /**
   * 重做操作
   */
  const redo = () => {
    return historyManager.redo()
  }

  /**
   * 添加节点（带历史记录）
   */
  const addNodeWithHistory = (
    parentNodeId: string,
    slotKey: string,
    childNode: ComponentNode,
    index?: number
  ) => {
    const parentNode = NodeService.findNodeById(rootNode, parentNodeId)
    if (parentNode) {
      const command = new AddNodeCommand(parentNode, slotKey, childNode, index)
      executeCommand(command)
      return true
    }
    return false
  }

  /**
   * 删除节点（带历史记录）
   */
  const removeNodeWithHistory = (nodeId: string) => {
    const targetNode = NodeService.findNodeById(rootNode, nodeId)
    if (targetNode) {
      const command = new RemoveNodeCommand(rootNode, targetNode)
      executeCommand(command)
      return true
    }
    return false
  }

  /**
   * 更新节点属性（带历史记录）
   */
  const updateNodePropsWithHistory = (
    nodeId: string,
    newProps: Record<string, any>
  ) => {
    const targetNode = NodeService.findNodeById(rootNode, nodeId)
    if (targetNode) {
      const command = new UpdatePropsCommand(targetNode, newProps)
      executeCommand(command)
      return true
    }
    return false
  }

  /**
   * 移动节点（带历史记录）
   */
  const moveNodeWithHistory = (
    nodeId: string,
    destParentId: string,
    destSlotKey: string,
    destIndex?: number
  ) => {
    const targetNode = NodeService.findNodeById(rootNode, nodeId)
    const destParent = NodeService.findNodeById(rootNode, destParentId)

    if (targetNode && destParent) {
      const command = new MoveNodeCommand(
        rootNode,
        targetNode,
        destParent,
        destSlotKey,
        destIndex
      )
      executeCommand(command)
      return true
    }
    return false
  }

  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    historyManager.clear()
    updateHistoryState()
  }

  /**
   * 批量执行命令（作为一个整体操作）
   */
  const executeBatchCommands = (commands: ICommand[], description: string) => {
    // 创建批量命令
    const batchCommand: ICommand = {
      description,
      execute: () => {
        commands.forEach(cmd => cmd.execute())
      },
      undo: () => {
        // 反向撤销
        commands.slice().reverse().forEach(cmd => cmd.undo())
      },
      redo: () => {
        commands.forEach(cmd => cmd.redo())
      }
    }

    executeCommand(batchCommand)
  }

  /**
   * 键盘快捷键处理
   */
  const handleKeyboardShortcuts = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          if (event.shiftKey) {
            // Ctrl+Shift+Z 或 Cmd+Shift+Z - 重做
            event.preventDefault()
            redo()
          } else {
            // Ctrl+Z 或 Cmd+Z - 撤销
            event.preventDefault()
            undo()
          }
          break
        case 'y':
          // Ctrl+Y 或 Cmd+Y - 重做（Windows风格）
          event.preventDefault()
          redo()
          break
      }
    }
  }

  return {
    // 状态
    historyState: historyState,
    canUndo,
    canRedo,
    currentCommand,
    nextCommand,
    historyList,

    // 基础操作
    executeCommand,
    undo,
    redo,
    clearHistory,

    // 高级操作
    addNodeWithHistory,
    removeNodeWithHistory,
    updateNodePropsWithHistory,
    moveNodeWithHistory,
    executeBatchCommands,

    // 工具方法
    handleKeyboardShortcuts,
    updateHistoryState,

    // 历史管理器
    historyManager
  }
}

/**
 * 历史记录类型定义
 */
export type HistoryHook = ReturnType<typeof useHistory>
