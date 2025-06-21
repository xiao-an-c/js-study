# Vue3 + Vite + TypeScript 模板使用指南

## 📖 概述

本项目提供了一个完整的 Vue3 + Vite + TypeScript 学习模板，可以快速创建新的学习项目。

## 🚀 快速创建项目

### 方法一：使用 npm 脚本（推荐）

```bash
# 在项目根目录执行
pnpm create:vue <项目名称>

# 示例
pnpm create:vue my-vue-app
```

### 方法二：直接运行脚本

```bash
# 在项目根目录执行
node scripts/create-vue-project.js <项目名称>

# 示例
node scripts/create-vue-project.js my-vue-app
```

## 📋 项目命名规则

- 只能包含小写字母、数字和连字符
- 不能以数字开头
- 建议使用有意义的名称

✅ **正确示例：**
- `vue-basics`
- `component-demo`
- `todo-app`
- `user-management`

❌ **错误示例：**
- `Vue-App` (包含大写字母)
- `my_app` (包含下划线)
- `123-app` (以数字开头)

## 🎯 创建后的操作

1. **进入项目目录**
   ```bash
   cd packages/<项目名称>
   ```

2. **启动开发服务器**
   ```bash
   pnpm dev
   ```

3. **在浏览器中查看**
   - 默认地址：http://localhost:3000
   - 支持热重载，修改代码后自动刷新

## 📁 生成的项目结构

```
<项目名称>/
├── public/
│   └── vite.svg              # Vite 图标
├── src/
│   ├── App.vue               # 主应用组件
│   ├── main.ts               # 应用入口
│   └── style.css             # 全局样式
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── tsconfig.node.json        # Node.js TS 配置
├── vite.config.ts            # Vite 配置
└── README.md                 # 项目说明
```

## 🛠️ 可用命令

在生成的项目中，你可以使用以下命令：

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 清理构建文件
pnpm clean
```

## 📚 模板特性

### 1. Vue3 Composition API 示例
- 响应式数据绑定
- 计算属性
- 事件处理
- 列表渲染
- 条件渲染

### 2. TypeScript 集成
- 完整的类型支持
- 接口定义
- 类型推断
- 编译时类型检查

### 3. Vite 配置
- 快速热重载
- 路径别名 (@/)
- 开发服务器配置
- 构建优化

### 4. 现代化开发体验
- ESNext 语法支持
- 模块化开发
- 自动导入
- 开发工具集成

## 🎨 自定义模板

如果你想修改模板，可以编辑 `templates/vue3-vite-ts/` 目录下的文件：

1. **修改默认组件**：编辑 `src/App.vue`
2. **调整样式**：编辑 `src/style.css`
3. **更新配置**：修改 `vite.config.ts` 或 `tsconfig.json`
4. **添加依赖**：在 `package.json` 中添加新的依赖

## 🔧 故障排除

### 常见问题

1. **项目名称已存在**
   ```
   ❌ 项目 "my-app" 已存在!
   ```
   解决：使用不同的项目名称或删除现有项目

2. **依赖安装失败**
   ```bash
   # 清理缓存后重试
   pnpm store prune
   pnpm install
   ```

3. **端口被占用**
   ```bash
   # 使用不同端口启动
   pnpm dev --port 3001
   ```

### 获取帮助

如果遇到问题，可以：
1. 查看项目的 README.md 文件
2. 检查控制台错误信息
3. 参考官方文档

## 📖 学习建议

1. **从基础开始**：先理解 Vue3 的基本概念
2. **实践为主**：多写代码，多做实验
3. **阅读文档**：Vue3、Vite、TypeScript 官方文档
4. **循序渐进**：从简单组件开始，逐步学习复杂特性

## 🌟 下一步

创建项目后，建议按以下顺序学习：

1. **Vue3 基础**
   - 模板语法
   - 响应式数据
   - 计算属性和侦听器

2. **组件开发**
   - 组件通信
   - 插槽使用
   - 生命周期

3. **TypeScript 集成**
   - 类型定义
   - 接口使用
   - 泛型应用

4. **进阶特性**
   - 路由管理
   - 状态管理
   - 构建优化

祝你学习愉快！🎉