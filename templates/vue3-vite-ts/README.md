# {{PROJECT_NAME}}

> Vue3 + Vite + TypeScript 学习示例项目

## 📋 项目简介

这是一个基于 Vue3、Vite 和 TypeScript 的学习示例项目，包含了常用的 Vue3 特性演示：

- ✅ Vue3 Composition API
- ✅ TypeScript 类型支持
- ✅ 响应式数据绑定
- ✅ 计算属性和侦听器
- ✅ 组件通信
- ✅ 生命周期钩子
- ✅ Vite 热重载

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 📁 项目结构

```
{{PROJECT_NAME}}/
├── public/
│   └── vite.svg
├── src/
│   ├── App.vue          # 主应用组件
│   ├── main.ts          # 应用入口文件
│   └── style.css        # 全局样式
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── tsconfig.node.json   # Node.js TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 🎯 学习要点

### 1. Composition API

使用 `<script setup>` 语法，更简洁的组件编写方式：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>
```

### 2. TypeScript 集成

完整的 TypeScript 支持，包括类型检查和智能提示：

```typescript
interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
```

### 3. 响应式系统

- `ref()` - 基本类型响应式
- `reactive()` - 对象响应式
- `computed()` - 计算属性
- `watch()` - 侦听器

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - JavaScript 的超集
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

## 📚 学习资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/zh/)
- [Vue 3 Composition API](https://cn.vuejs.org/guide/composition-api-introduction.html)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License