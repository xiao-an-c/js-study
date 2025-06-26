import { defineComponent, provide, VNode, ref, nextTick, watch } from 'vue'
import type { ComponentDefine, ComponentNode } from '@/type'
import { DropSlotWrap } from './DropSlotWarp'

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

    // 高亮覆盖层的状态
    const highlightStyle = ref<{
      display: string
      left: string
      top: string
      width: string
      height: string
    }>({
      display: 'none',
      left: '0px',
      top: '0px',
      width: '0px',
      height: '0px'
    })

    // 更新高亮位置
    const updateHighlight = async () => {
      if (!props.selectedNodeId) {
        highlightStyle.value.display = 'none'
        return
      }

      await nextTick()
      const element = document.querySelector(`[data-node-id="${props.selectedNodeId}"]`) as HTMLElement
      if (element) {
        const canvasElement = document.querySelector('.canvas-render') as HTMLElement
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect()
          const elementRect = element.getBoundingClientRect()

          highlightStyle.value = {
            display: 'block',
            left: `${elementRect.left - canvasRect.left}px`,
            top: `${elementRect.top - canvasRect.top}px`,
            width: `${elementRect.width}px`,
            height: `${elementRect.height}px`
          }
        }
      } else {
        highlightStyle.value.display = 'none'
      }
    }

    // 监听选中节点变化
    watch(() => props.selectedNodeId, updateHighlight, { immediate: true })

    // 处理单个slot的渲染逻辑
    function renderSlot(slotNodes: ComponentNode[], slotType: 'single' | 'multi'): VNode | VNode[] {
      const vnodes = slotNodes.map(renderNode)
      return slotType === 'single' ? vnodes[0] || <></> : vnodes
    }

    // 构建slot映射对象
    function buildSlotMap(slots: ComponentNode['slots'], defineSlots: ComponentDefine['slots']): Record<string, () => VNode | VNode[]> {
      if (!slots || !defineSlots) return {}

      return Object.entries(slots).reduce((slotMap, [key, slotNodes]) => {
        const slotType = defineSlots[key]
        if (slotType) {
          slotMap[key] = () => renderSlot(slotNodes, slotType)
        }
        return slotMap
      }, {} as Record<string, () => VNode | VNode[]>)
    }

    function renderNode(node: ComponentNode): VNode {
      const { define, props = {}, slots } = node
      const { defaultProps = {}, component: RawComponent, slots: defineSlots } = define
      const realProps = { ...defaultProps, ...props }
      const slotMap = buildSlotMap(slots, defineSlots)

      const Component = DropSlotWrap(RawComponent, node)

      return (
        <Component {...realProps} data-node-id={node.id} data-defintion={define.name}>
          {slotMap}
        </Component>
      )
    }

    // 事件代理处理点击事件
    const handleCanvasClick = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()

      // 收集所有带有 data-node-id 的祖先元素
      let target = event.target as HTMLElement

      while (target && target !== event.currentTarget) {
        const nodeId = target.getAttribute('data-node-id')
        if (nodeId) {
          emit('node-select', nodeId)
          return
        }
        target = target.parentElement as HTMLElement
      }
    }

    return () => (
      <div
        class="flex-1 h-full canvas-render relative"
        onClick={handleCanvasClick}
        style={{ pointerEvents: 'auto' }}
      >
        {renderNode(props.node)}
        {/* 高亮覆盖层 */}
        <div
          class="absolute pointer-events-none z-50"
          style={{
            ...highlightStyle.value,
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
        />
      </div>
    )
  }
})
