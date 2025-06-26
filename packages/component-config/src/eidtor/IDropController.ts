import { ComponentNode } from "@/type"

export interface IDropController {
  appendNode: (node: ComponentNode, slotKey: string, appendNode: ComponentNode) => void
}
