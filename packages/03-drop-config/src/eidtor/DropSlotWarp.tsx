import { Component, ComponentNode } from '@/type'
import { defineComponent, VNode } from 'vue'
import DropSlot from './DropSlot.vue'

export function DropSlotWrap(RawComponent: Component, node: ComponentNode) {
  return defineComponent({
    setup(props, { slots, attrs }) {
      console.log(node)
      return () => (
        <RawComponent {...props} {...attrs} class="is-component">
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

