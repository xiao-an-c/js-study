export * from './button/ButtonDefine'
export * from './flex/FlexDefine'
export * from './Node'

import { ButtonDefine } from './button/ButtonDefine'
import { FlexDefine } from './flex/FlexDefine'

export const COMPONENT_LIST = [
  ButtonDefine,
  FlexDefine,
]

export function getComponentDefine(name: string) {
  return COMPONENT_LIST.find(item => item.name === name)
}
