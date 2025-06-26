import { ref, watch, nextTick, onUnmounted, type Ref } from 'vue'

/**
 * 高亮显示Hook
 * 管理选中节点和悬停节点的高亮显示效果，支持动态响应元素变化
 */
export function useHighlight(selectedNodeId: Ref<string | null>) {
  // 悬停节点ID
  const hoveredNodeId = ref<string | null>(null)

  // 当前观察的元素
  let currentObservedElement: HTMLElement | null = null

  // ResizeObserver 实例
  let resizeObserver: ResizeObserver | null = null

  // 高亮覆盖层的样式
  const highlightStyle = ref<{
    display: string
    left: string
    top: string
    width: string
    height: string
    border: string
    background: string
  }>({
    display: 'none',
    left: '0px',
    top: '0px',
    width: '0px',
    height: '0px',
    border: '2px solid #3b82f6',
    background: 'rgba(59, 130, 246, 0.1)'
  })

  // 清理观察器
  const cleanupObservers = () => {
    if (resizeObserver && currentObservedElement) {
      resizeObserver.unobserve(currentObservedElement)
    }
    currentObservedElement = null
  }

  // 设置元素观察
  const setupElementObserver = (getElement: () => HTMLElement) => {
    cleanupObservers()

    currentObservedElement = getElement()
    resizeObserver = new ResizeObserver(() => {
      updateHighlightPosition()
    })
    resizeObserver.observe(currentObservedElement)
  }

  // 更新高亮位置（纯计算函数）
  const updateHighlightPosition = () => {
    const targetNodeId = selectedNodeId.value || hoveredNodeId.value

    if (!targetNodeId) {
      highlightStyle.value.display = 'none'
      return
    }

    const element = document.querySelector(`[data-node-id="${targetNodeId}"]`) as HTMLElement
    if (!element) {
      highlightStyle.value.display = 'none'
      return
    }

    const canvasElement = document.querySelector('.canvas-render') as HTMLElement
    if (!canvasElement) {
      highlightStyle.value.display = 'none'
      return
    }

    const canvasRect = canvasElement.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    // 根据是否为选中状态设置不同样式
    const isSelected = targetNodeId === selectedNodeId.value
    const border = isSelected ? '2px solid #3b82f6' : '1px dashed #94a3b8'
    const background = isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'

    highlightStyle.value = {
      display: 'block',
      left: `${elementRect.left - canvasRect.left - 5}px`,
      top: `${elementRect.top - canvasRect.top - 5}px`,
      width: `${elementRect.width + 10}px`,
      height: `${elementRect.height + 10}px`,
      border,
      background
    }
  }

  // 更新高亮（包含观察器设置）
  const updateHighlight = async () => {
    const targetNodeId = selectedNodeId.value || hoveredNodeId.value

    if (!targetNodeId) {
      cleanupObservers()
      highlightStyle.value.display = 'none'
      return
    }

    await nextTick()
    const getElement = () => document.querySelector(`[data-node-id="${targetNodeId}"]`) as HTMLElement

    if (targetNodeId) {
      // 如果目标元素变化，重新设置观察器
      setupElementObserver(getElement)
      updateHighlightPosition()
    } else {
      cleanupObservers()
      highlightStyle.value.display = 'none'
    }
  }

  // 监听选中节点和悬停节点变化
  watch(selectedNodeId, updateHighlight, { immediate: true })
  watch(() => hoveredNodeId.value, updateHighlight)

  // 设置悬停节点
  const setHoveredNode = (nodeId: string | null) => {
    hoveredNodeId.value = nodeId
  }

  // 手动触发更新
  const refreshHighlight = () => {
    updateHighlight()
  }

  // 组件卸载时清理观察器
  onUnmounted(() => {
    cleanupObservers()
  })

  return {
    highlightStyle,
    updateHighlight,
    refreshHighlight,
    setHoveredNode
  }
}
