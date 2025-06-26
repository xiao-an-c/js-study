import { ComponentDefine, ComponentNode } from "@/type";
import { Defintion } from "./Defintion";

export class Node implements ComponentNode {
  public id: string
  public define: ComponentDefine
  public props?: Record<string, any>
  public slots: { [propName: string]: ComponentNode[]; } = {};

  constructor(define: Defintion, props?: Record<string, any>) {
    this.define = define

    this.id = this.uniqueId()
    this.props = Object.assign({}, this.getDefaultProps(), props)
  }

  private uniqueId() {
    return `${this.define.name}-${Math.random().toString(36).substring(2)}`
  }

  private getDefaultProps() {
    return Object.entries(this.define.defaultProps ?? {}).reduce((preValue, [key, value]) => {
      return {
        ...preValue,
        [key]: value
      }
    }, {} as Record<string, any>)
  }

  toJSON(): ComponentNode {
    return {
      id: this.id,
      define: this.define,
      props: this.props,
      slots: this.slots
    }
  }
}
