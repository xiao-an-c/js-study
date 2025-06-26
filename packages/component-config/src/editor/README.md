# Editor 模块重构说明

## 重构概述

本次重构将原本混乱的 `eidtor` 文件夹重新组织为清晰的分层架构，提升了代码的可维护性和可扩展性。

## 架构设计

### 📁 目录结构

```
editor/
├── components/          # 组件层
│   ├── Editor.vue      # 主编辑器组件
│   ├── CanvasRender.tsx # 画布渲染组件
│   ├── DropContainer.vue # 拖拽容器组件
│   ├── DropSlot.vue    # 拖拽插槽组件
│   ├── DropSlotWrap.tsx # 拖拽插槽包装器
│   ├── LibsPanel.vue   # 组件库面板
│   ├── PropsEditor.vue # 属性编辑器
│   └── index.ts        # 组件导出
├── controllers/         # 控制器层
│   ├── DropController.ts # 拖拽控制器
│   └── index.ts        # 控制器导出
├── hooks/              # 自定义Hooks
│   ├── useEditorState.ts # 编辑器状态管理
│   ├── useNodeOperations.ts # 节点操作
│   ├── useHighlight.ts # 高亮显示
│   └── index.ts        # Hooks导出
├── services/           # 服务层
│   ├── NodeService.ts  # 节点操作服务
│   ├── DragDropService.ts # 拖拽服务
│   └── index.ts        # 服务导出
├── types/              # 类型定义
│   └── index.ts        # 类型导出
├── index.ts            # 模块主入口
└── README.md           # 说明文档
```

### 🏗️ 分层架构

#### 1. **组件层 (Components)**
- **职责**: 负责UI渲染和用户交互
- **特点**: 纯展示逻辑，不包含复杂业务逻辑
- **依赖**: 依赖Hooks和Services层

#### 2. **Hooks层 (Hooks)**
- **职责**: 封装可复用的状态逻辑和副作用
- **特点**: 遵循Vue Composition API最佳实践
- **优势**: 提高代码复用性，便于测试

#### 3. **服务层 (Services)**
- **职责**: 封装纯业务逻辑，不依赖Vue
- **特点**: 无状态，可独立测试
- **优势**: 业务逻辑与框架解耦

#### 4. **控制器层 (Controllers)**
- **职责**: 协调不同模块间的交互
- **特点**: 实现具体的业务流程控制

#### 5. **类型层 (Types)**
- **职责**: 统一管理TypeScript类型定义
- **特点**: 提供完整的类型安全保障

## 🔧 重构改进

### 1. **命名规范化**
- ✅ 修复了 `eidtor` 拼写错误 → `editor`
- ✅ 统一了组件和文件命名规范
- ✅ 采用了语义化的目录结构

### 2. **职责分离**
- ✅ 将业务逻辑从组件中抽离到Services
- ✅ 使用Hooks管理状态和副作用
- ✅ 控制器负责协调不同模块

### 3. **代码复用**
- ✅ 提取了可复用的Hooks
- ✅ 封装了通用的服务类
- ✅ 统一了类型定义

### 4. **可维护性提升**
- ✅ 清晰的分层架构
- ✅ 单一职责原则
- ✅ 依赖注入模式

### 5. **用户体验优化**
- ✅ 改进了拖拽交互反馈
- ✅ 优化了组件选中状态显示
- ✅ 增强了属性编辑器功能

## 🚀 使用方式

```typescript
// 导入主编辑器组件
import { Editor } from '@/editor'

// 导入特定组件
import { CanvasRender, LibsPanel } from '@/editor/components'

// 导入Hooks
import { useEditorState, useNodeOperations } from '@/editor/hooks'

// 导入服务
import { NodeService, DragDropService } from '@/editor/services'
```

## 📋 核心特性保持

重构过程中严格保持了原有的核心功能：

- ✅ 拖拽组件到画布
- ✅ 组件属性编辑
- ✅ 节点选中和高亮
- ✅ 插槽系统支持
- ✅ 组件库面板

## 🔮 扩展性

新架构为未来扩展提供了良好的基础：

- **新组件类型**: 在Services层添加新的组件处理逻辑
- **新交互方式**: 通过Hooks封装新的交互逻辑
- **新功能模块**: 在Controllers层添加新的业务流程
- **类型安全**: 在Types层扩展类型定义

## 🧪 测试友好

分层架构使得各层都可以独立测试：

- **Services**: 纯函数，易于单元测试
- **Hooks**: 可使用Vue Test Utils测试
- **Components**: 可进行组件测试
- **Controllers**: 可进行集成测试