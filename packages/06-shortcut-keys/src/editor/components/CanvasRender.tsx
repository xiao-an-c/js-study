import { defineComponent, provide, VNode, toRef } from 'vue'
import type { ComponentDefine, ComponentNode } from '../types'
import { useHighlight } from '../hooks'
import { DropSlotWrap } from './DropSlotWrap'

export default defineComponent({
  name: 'CanvasRender',
  props: {
    node: {
      type: Object as () => ComponentNode,
      required: true,
    },
    selectedNodeId: {
      type: String as () => string | null,
      default: null,
    }
  },
  emits: ['node-select'],
  setup(props, { emit }) {
    // 提供选中状态给子组件
    provide('selectedNodeId', props.selectedNodeId)

    // 使用高亮Hook
    const { highlightStyle } = useHighlight(toRef(props, 'selectedNodeId'))

    /**
     * 处理节点点击事件
     * @param nodeId 节点ID
     * @param event 点击事件
     */
    const handleNodeClick = (nodeId: string, event: MouseEvent) => {
      event.stopPropagation()
      emit('node-select', nodeId)
    }

    /**
     * 处理单个slot的渲染逻辑
     * @param slotNodes 插槽节点数组
     * @param slotType 插槽类型
     * @returns 渲染的VNode
     */
    function renderSlot(slotNodes: ComponentNode[], slotType: 'single' | 'multi'): VNode | VNode[] {
      const vnodes = slotNodes.map(renderNode)
      return slotType === 'single' ? vnodes[0] || <></> : vnodes
    }

    /**
     * 构建slot映射对象
     * @param slots 节点插槽
     * @param defineSlots 组件定义的插槽
     * @returns 插槽映射对象
     */
    function buildSlotMap(
      slots: ComponentNode['slots'],
      defineSlots: ComponentDefine['slots']
    ): Record<string, () => VNode | VNode[]> {
      if (!slots || !defineSlots) return {}

      return Object.entries(slots).reduce((slotMap, [key, slotNodes]) => {
        const slotType = defineSlots[key]
        if (slotType) {
          slotMap[key] = () => renderSlot(slotNodes, slotType)
        }
        return slotMap
      }, {} as Record<string, () => VNode | VNode[]>)
    }

    /**
     * 渲染单个节点
     * @param node 组件节点
     * @returns 渲染的VNode
     */
    function renderNode(node: ComponentNode): VNode {
      const { define, props: nodeProps = {} } = node
      const { component: RawComponent, defaultProps = {} } = define

      // 合并默认属性和节点属性
      const mergedProps = { ...defaultProps, ...nodeProps }

      // 构建插槽映射
      const slotMap = buildSlotMap(node.slots, define.slots)

      // 使用DropSlotWrap包装组件，添加拖拽功能和点击事件
      const WrappedComponent = DropSlotWrap(RawComponent, node)

      return (
        <WrappedComponent
          {...mergedProps}
          onClick={(event: MouseEvent) => handleNodeClick(node.id, event)}
        >
          {slotMap}
        </WrappedComponent>
      )
    }

    return () => (
      <div class="canvas-render" onClick={() => emit('node-select', null)}>
        {/* 渲染主要内容 */}
        <div class="canvas-render__content">
          {renderNode(props.node)}
        </div>

        {/* 高亮覆盖层 */}
        <div
          class="canvas-render__highlight"
          style={highlightStyle.value}
        />
      </div>
    )
  }
})

// 添加样式
const style = document.createElement('style')
style.textContent = `
  .canvas-render {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #fff;
    padding: 16px;
  }

  .canvas-render__content {
    min-height: 100%;
  }

  .canvas-render__highlight {
    position: absolute;
    pointer-events: none;
    z-index: 1000;
    transition: all 0.2s ease;
  }

`
document.head.appendChild(style)
