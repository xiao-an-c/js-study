import { ComponentDefine, ComponentNode } from "@/type";
import { uniqueId } from 'lodash'
import { Defintion } from "./Defintion";

export class Node implements ComponentNode {
  public id: string
  public define: ComponentDefine
  public props?: Record<string, any>
  public slots: { [propName: string]: ComponentNode[]; } = {};

  constructor(define: Defintion, props?: Record<string, any>) {
    this.id = uniqueId()
    this.define = define
    console.log(this.getDefaultProps())
    this.props = Object.assign({}, this.getDefaultProps(), props)
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
