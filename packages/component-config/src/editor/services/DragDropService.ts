import type { DragData } from '../types'

/**
 * 拖拽服务类
 * 负责处理拖拽相关的数据传输和解析
 */
export class DragDropService {
  /**
   * 设置拖拽数据
   * @param dataTransfer DataTransfer对象
   * @param data 要传输的数据
   */
  static setDragData(dataTransfer: DataTransfer, data: DragData): void {
    dataTransfer.setData('application/json', JSON.stringify(data))
    dataTransfer.effectAllowed = 'copy'
  }

  /**
   * 获取拖拽数据
   * @param dataTransfer DataTransfer对象
   * @returns 解析后的拖拽数据或null
   */
  static getDragData(dataTransfer: DataTransfer): DragData | null {
    try {
      const jsonString = dataTransfer.getData('application/json')
      return jsonString ? JSON.parse(jsonString) : null
    } catch (error) {
      console.warn('[DragDropService] 解析拖拽数据失败:', error)
      return null
    }
  }

  /**
   * 设置拖拽效果
   * @param dataTransfer DataTransfer对象
   * @param effect 拖拽效果
   */
  static setDropEffect(dataTransfer: DataTransfer, effect: 'copy' | 'move' | 'link' | 'none' = 'copy'): void {
    dataTransfer.dropEffect = effect
  }

  /**
   * 阻止默认拖拽行为
   * @param event 拖拽事件
   */
  static preventDefault(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
  }
}