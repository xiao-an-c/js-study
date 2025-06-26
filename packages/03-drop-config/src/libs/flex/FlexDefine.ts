import { defineAsyncComponent } from 'vue';
import { Defintion } from '../Defintion';

export const FlexDefine = new Defintion({
  name: 'Flex',
  text: 'flex 布局',
  component: defineAsyncComponent(() => import('./Flex.vue')),
  slots: {
    default: 'multi',
  },
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
    gap: '10px',
    inline: false
  },
})
