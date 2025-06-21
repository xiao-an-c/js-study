# TSX 支持说明

本模板已集成 TSX (TypeScript + JSX) 支持，让你可以在 Vue 3 项目中使用类型安全的 JSX 语法。

## 🚀 已配置的依赖

### 开发依赖
- `@vitejs/plugin-vue-jsx`: Vue JSX 插件，支持在 Vue 项目中使用 JSX 语法

## ⚙️ 配置文件

### Vite 配置 (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), vueJsx()], // 添加了 vueJsx 插件
  // ... 其他配置
})
```

### TypeScript 配置 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue",
    // ... 其他配置
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

## 📁 文件结构

```
src/
├── components/
│   ├── TsxDemo.tsx          # TSX 组件示例
│   └── ...
├── App.vue                  # 主应用组件
└── ...
```

## 🎯 TSX 功能特性

### 1. 基础 TSX 组件
```tsx
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MyComponent',
  setup() {
    const count = ref(0)
    
    return () => (
      <div>
        <h1>Count: {count.value}</h1>
        <button onClick={() => count.value++}>Increment</button>
      </div>
    )
  }
})
```

### 2. Props 类型定义
```tsx
import { defineComponent, PropType } from 'vue'

interface User {
  id: number
  name: string
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    title: {
      type: String,
      default: 'Default Title'
    }
  },
  setup(props) {
    return () => (
      <div>
        <h1>{props.title}</h1>
        <p>User: {props.user.name}</p>
      </div>
    )
  }
})
```

### 3. 事件处理
```tsx
export default defineComponent({
  setup() {
    const handleClick = (event: MouseEvent) => {
      console.log('Clicked!', event)
    }
    
    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement
      console.log('Input value:', target.value)
    }
    
    return () => (
      <div>
        <button onClick={handleClick}>Click me</button>
        <input onInput={handleInput} />
      </div>
    )
  }
})
```

### 4. 条件渲染
```tsx
export default defineComponent({
  setup() {
    const isVisible = ref(true)
    const status = ref<'loading' | 'success' | 'error'>('loading')
    
    return () => (
      <div>
        {/* 简单条件渲染 */}
        {isVisible.value && <p>This is visible</p>}
        
        {/* 三元运算符 */}
        {isVisible.value ? <p>Visible</p> : <p>Hidden</p>}
        
        {/* 多条件渲染 */}
        {status.value === 'loading' ? (
          <p>Loading...</p>
        ) : status.value === 'success' ? (
          <p>Success!</p>
        ) : (
          <p>Error occurred</p>
        )}
      </div>
    )
  }
})
```

### 5. 列表渲染
```tsx
export default defineComponent({
  setup() {
    const items = ref(['Apple', 'Banana', 'Orange'])
    
    return () => (
      <ul>
        {items.value.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )
  }
})
```

### 6. 插槽 (Slots)
```tsx
export default defineComponent({
  setup(_, { slots }) {
    return () => (
      <div class="card">
        <header>{slots.header?.()}</header>
        <main>{slots.default?.()}</main>
        <footer>{slots.footer?.()}</footer>
      </div>
    )
  }
})
```

### 7. 响应式样式和类
```tsx
export default defineComponent({
  setup() {
    const isActive = ref(false)
    const theme = ref<'light' | 'dark'>('light')
    
    return () => (
      <div 
        class={{
          'active': isActive.value,
          'theme-light': theme.value === 'light',
          'theme-dark': theme.value === 'dark'
        }}
        style={{
          color: theme.value === 'dark' ? 'white' : 'black',
          backgroundColor: isActive.value ? 'blue' : 'gray'
        }}
      >
        Content
      </div>
    )
  }
})
```

## 🔧 在 Vue 组件中使用 TSX 组件

```vue
<template>
  <div>
    <h1>Vue SFC</h1>
    <TsxComponent :user="user" @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import TsxComponent from './TsxComponent'

const user = { id: 1, name: 'John' }
const handleClick = () => console.log('TSX component clicked')
</script>
```

## 📚 最佳实践

### 1. 文件命名
- TSX 组件文件使用 `.tsx` 扩展名
- 组件名使用 PascalCase
- 文件名与组件名保持一致

### 2. 类型安全
```tsx
// 定义 Props 接口
interface Props {
  title: string
  count?: number
  onUpdate?: (value: number) => void
}

export default defineComponent<Props>({
  props: ['title', 'count', 'onUpdate'],
  setup(props) {
    // props 现在有完整的类型支持
    return () => (
      <div>
        <h1>{props.title}</h1>
        <p>Count: {props.count ?? 0}</p>
      </div>
    )
  }
})
```

### 3. 性能优化
```tsx
import { defineComponent, ref, computed, memo } from 'vue'

// 使用 computed 优化计算
export default defineComponent({
  setup() {
    const items = ref([1, 2, 3, 4, 5])
    
    // 使用 computed 缓存计算结果
    const expensiveComputation = computed(() => {
      return items.value.map(item => item * 2).filter(item => item > 5)
    })
    
    return () => (
      <div>
        {expensiveComputation.value.map(item => (
          <div key={item}>{item}</div>
        ))}
      </div>
    )
  }
})
```

### 4. 组件组合
```tsx
// 高阶组件
function withLoading<T extends Record<string, any>>(Component: any) {
  return defineComponent({
    props: ['loading'],
    setup(props, { attrs, slots }) {
      return () => (
        props.loading ? (
          <div>Loading...</div>
        ) : (
          <Component {...attrs} v-slots={slots} />
        )
      )
    }
  })
}
```

## 🎨 与 Tailwind CSS 结合

TSX 完美支持 Tailwind CSS 类名：

```tsx
export default defineComponent({
  setup() {
    const isActive = ref(false)
    
    return () => (
      <button 
        class={[
          'px-4 py-2 rounded transition-colors',
          isActive.value 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        ]}
        onClick={() => isActive.value = !isActive.value}
      >
        {isActive.value ? 'Active' : 'Inactive'}
      </button>
    )
  }
})
```

## 🐛 调试技巧

### 1. 开发者工具
- TSX 组件在 Vue DevTools 中正常显示
- 支持热重载和状态保持

### 2. 类型检查
```bash
# 运行类型检查
npm run build
# 或者
vue-tsc --noEmit
```

### 3. 常见问题

**问题**: TSX 组件不显示
**解决**: 确保在 `vite.config.ts` 中添加了 `vueJsx()` 插件

**问题**: 类型错误
**解决**: 检查 `tsconfig.json` 中的 `jsx` 和 `jsxImportSource` 配置

**问题**: 事件处理器类型错误
**解决**: 使用正确的事件类型，如 `MouseEvent`、`InputEvent` 等

## 🔗 有用资源

- [Vue 3 TSX 官方文档](https://vuejs.org/guide/extras/render-function.html#jsx-tsx)
- [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- [Vue 3 Composition API](https://vuejs.org/guide/composition-api-introduction.html)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

---

现在你可以在项目中自由使用 TSX 语法，享受类型安全和现代化的开发体验！🎉