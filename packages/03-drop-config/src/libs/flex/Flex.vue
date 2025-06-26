<script setup lang="ts" name="Flex">
import { computed } from 'vue'

interface FlexProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: string | number
  inline?: boolean
}

const props = withDefaults(defineProps<FlexProps>(), {
  direction: 'row',
  justify: 'start',
  align: 'start',
  wrap: 'nowrap',
  gap: 0,
  inline: false
})

const flexClasses = computed(() => {
  const classes = [props.inline ? 'inline-flex' : 'flex']

  // Direction
  if (props.direction !== 'row') {
    classes.push(`flex-${props.direction}`)
  }

  // Justify content
  const justifyMap = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }
  classes.push(justifyMap[props.justify])

  // Align items
  const alignMap = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  }
  classes.push(alignMap[props.align])

  // Flex wrap
  if (props.wrap !== 'nowrap') {
    classes.push(`flex-${props.wrap}`)
  }

  return classes.join(' ')
})

const flexStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.gap) {
    const gapValue = typeof props.gap === 'number' ? `${props.gap}px` : props.gap
    style.gap = gapValue
  }

  return style
})
</script>

<template>
  <div :class="flexClasses" :style="flexStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 确保组件样式的一致性 */
.flex, .inline-flex {
  box-sizing: border-box;
  flex: 1;
  height: 100%;
}
</style>
