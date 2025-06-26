import { defineAsyncComponent } from 'vue';
import { Defintion } from '../Defintion';

export const ButtonDefine = new Defintion({
  name: 'Button',
  text: '按钮',
  component: defineAsyncComponent(() => import('./Button.vue')),
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
})
