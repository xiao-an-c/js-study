import { defineComponent, defineAsyncComponent, DefineComponent, VNode } from 'vue'

type Component = DefineComponent<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>

const Button = defineAsyncComponent(() => import('./Button.vue'))

interface PropsSchema {
  type: string
  required: boolean
}

interface ComponentDefine {
  name: string
  component: Component
  propsSchema?: Record<string, PropsSchema>
  defaultProps?: Record<string, any>
  slots?: {
    default: 'multi' | 'single'
    [propName: string]: 'multi' | 'single'
  },
}

interface ComponentNode {
  id: string
  define: ComponentDefine
  props?: Record<string, any>,
  slots?: {
    default: ComponentNode[]
    [propName: string]: ComponentNode[]
  },
}

const ButtonDefine: ComponentDefine = {
  name: 'Button',
  component: Button,
  propsSchema: {
    text: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      required: false,
    },
    size: {
      type: 'string',
      required: false,
    },
    disabled: {
      type: 'boolean',
      required: false,
    },
    loading: {
      type: 'boolean',
      required: false,
    },
    block: {
      type: 'boolean',
      required: false,
    }
  },
  defaultProps: {
    text: '按钮',
    type: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    block: false
  }
}

const FlexDefine: ComponentDefine = {
  name: 'Flex',
  component: defineAsyncComponent(() => import('./Flex.vue')),
  propsSchema: {
    direction: {
      type: 'string',
      required: false,
    },
    justify: {
      type: 'string',
      required: false,
    },
    align: {
      type: 'string',
      required: false,
    },
    wrap: {
      type: 'string',
      required: false,
    },
    gap: {
      type: 'string',
      required: false,
    },
    inline: {
      type: 'boolean',
      required: false,
    }
  },
  defaultProps: {
    direction: 'row',
    justify: 'start',
    align: 'start',
    wrap: 'nowrap',
    gap: '0',
    inline: false
  },
  slots: {
    default: 'multi',
  }
}


const node: ComponentNode = {
  id: '1',
  define: FlexDefine,
  props: {
    gap: '10px',
  },
  slots: {
    default: [
      { id: '2', define: ButtonDefine, props: { text: '按钮1' } },
      { id: '3', define: ButtonDefine, props: { text: '按钮2' } },
    ]
  }
}

export default defineComponent({
  name: 'CanvasRender',
  setup() {
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
      const { defaultProps = {}, component: Component, slots: defineSlots } = define
      const realProps = { ...defaultProps, ...props }
      const slotMap = buildSlotMap(slots, defineSlots)

      return (
        <Component {...realProps}>
          {slotMap}
        </Component>
      )
    }

    return () => (
      <div class="flex-1 h-full">
        {renderNode(node)}
      </div>
    )
  }
})
