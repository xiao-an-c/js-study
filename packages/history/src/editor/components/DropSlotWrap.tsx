import { defineComponent, VNode, inject } from 'vue'
import type { ComponentNode, Component } from '../types'
import DropSlot from './DropSlot.vue'

const ComponentMap = new WeakMap<ComponentNode, Component>()

/**
 * 拖拽插槽包装器
 * 为组件添加拖拽功能和插槽支持
 * @param RawComponent 原始组件
 * @param node 组件节点数据
 * @returns 包装后的组件
 */
export function DropSlotWrap(RawComponent: Component, node: ComponentNode) {
  if(ComponentMap.get(node)) {
    return ComponentMap.get(node)
  }

  const ComponentWrapped = defineComponent({
    name: `DropSlotWrap_${node.define.name}`,
    setup(props, { slots, attrs }) {

      // 注入点击处理函数
      const handleNodeClick = inject<(nodeId: string, event: MouseEvent) => void>('handleNodeClick', () => {})

      /**
       * 处理节点点击事件
       * @param event 鼠标事件
       */
      const handleClick = (event: MouseEvent) => {
        event.stopPropagation()
        handleNodeClick(node.id, event)
      }

      /**
       * 渲染插槽内容
       * @returns 插槽VNode数组
       */
      const renderSlots = () => {
        if (!node.define.slots) return {}

        return Object.keys(node.define.slots).reduce((slotMap, slotName) => {
          const slotFn = slots[slotName]
          const slotDefine = node.define.slots?.[slotName]
          const isMulti = slotDefine === 'multi'

          // 获取现有的插槽内容
          const slotVNode: VNode | VNode[] = slotFn ? slotFn() : []

          // 为multi类型插槽添加DropSlot
          if (isMulti) {
            const slotArray = Array.isArray(slotVNode) ? slotVNode : [slotVNode]
            slotMap[slotName] = () => [
              ...slotArray,
              <DropSlot slotKey={slotName} node={node} />
            ]
          } else {
            // single类型插槽，如果为空则显示DropSlot
            slotMap[slotName] = () => {
              if (Array.isArray(slotVNode) && slotVNode.length === 0) {
                return <DropSlot slotKey={slotName} node={node} />
              }
              return slotVNode
            }
          }

          return slotMap
        }, {} as Record<string, () => VNode | VNode[]>)
      }

      return () => (
        <RawComponent
          {...props}
          {...attrs}
          class={[
            attrs.class,
            'canvas-node',
            'canvas-node--component'
          ]}
          data-node-id={node.id}
          data-component-name={node.define.name}
          data-random={Math.random()}
          onClick={handleClick}
        >
          {renderSlots()}
        </RawComponent>
      )
    }
  })

  ComponentMap.set(node, ComponentWrapped)

  return ComponentWrapped
}

// 添加样式
const style = document.createElement('style')
style.textContent = `
  .canvas-node {
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .canvas-node--component {
    border-radius: 4px;
  }
`
document.head.appendChild(style)
