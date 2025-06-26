import { defineComponent, VNode } from 'vue'

import type { ComponentDefine, ComponentNode } from '@/type'
import { DropSlotWrap } from './DropSlotWarp'

export default defineComponent({
  name: 'CanvasRender',
  props: {
    node: {
      type: Object as () => ComponentNode,
      required: true,
    }
  },
  setup(props) {
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

    return () => (
      <div class="flex-1 h-full">
        {renderNode(props.node)}
      </div>
    )
  }
})
