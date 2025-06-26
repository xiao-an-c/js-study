import { Component, ComponentNode } from '@/type'
import { defineComponent, VNode, inject, ref } from 'vue'
import DropSlot from './DropSlot.vue'

export function DropSlotWrap(RawComponent: Component, node: ComponentNode) {
  return defineComponent({
    setup(props, { slots, attrs }) {
      // 注入选中状态
      const selectedNodeId = inject<string | null>('selectedNodeId', null)
      const isHovered = ref(false)

      const handleMouseEnter = (event: MouseEvent) => {
        event.stopPropagation()
        isHovered.value = true
      }

      const handleMouseLeave = (event: MouseEvent) => {
        event.stopPropagation()
        isHovered.value = false
      }

      return () => (
        <RawComponent
          {...props}
          {...attrs}
          class={[
            attrs.class,
            'canvas-node',
            'is-component'
          ]}
          data-node-id={node.id}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
          // style={{ pointerEvents: 'none' }}
        >
          {Object.keys(node.define.slots ?? {}).map(slotName => {
            const slotFn = slots[slotName]
            const slotDefine = node.define.slots?.[slotName]
            const isMulti = slotDefine === 'multi'
            const slotVNode: VNode | VNode[] = slotFn ? slotFn() : []

            return isMulti ? ([...slotVNode, <DropSlot slotKey={slotName} node={node} />]) : slotVNode
          })}
        </RawComponent>
      )
    }
  })
}

// 添加基础样式
const style = document.createElement('style')
style.textContent = `
  .canvas-node {
    position: relative;
    cursor: pointer;
  }
`
document.head.appendChild(style)

