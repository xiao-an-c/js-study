import { Component, ComponentDefine, ComponentDefineJSON, PropsSchema, SlotDefintion } from "@/type";
import { markRaw } from "vue";

export class Defintion implements ComponentDefine {
  public name: string
  public text: string
  public component: Component
  public propsSchema?: Record<string, PropsSchema>
  public defaultProps?: Record<string, any>
  public slots?: SlotDefintion

  public constructor(config: ComponentDefine) {
    this.name = config.name
    this.text = config.text
    this.component = markRaw(config.component)
    this.propsSchema = config.propsSchema
    this.defaultProps = config.defaultProps
    this.slots = config.slots
  }

  public toJSON(): ComponentDefineJSON {
    return {
      name: this.name,
      text: this.text,
    }
  }
}
