import type { DefineComponent } from 'vue'

export type Component = DefineComponent<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>

export interface PropsSchema {
  type: string
  required: boolean
}

export interface SlotDefintion {
  [propName: string]: 'multi' | 'single'
}

export interface ComponentDefine {
  /** 唯一标识 */
  name: string
  text: string
  component: Component
  propsSchema?: Record<string, PropsSchema>
  defaultProps?: Record<string, any>
  slots?: SlotDefintion,
}

export type ComponentDefineJSON = Pick<ComponentDefine, 'name' | 'text'>

export interface ComponentNode {
  id: string
  define: ComponentDefine
  props?: Record<string, any>,
  slots?: {
    [propName: string]: ComponentNode[]
  },
}

export interface DragData {
  type: 'component'
  payload: ComponentDefineJSON
}
