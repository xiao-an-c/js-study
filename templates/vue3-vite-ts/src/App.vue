<template>
  <div id="app">
    <header class="header">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
      <h1>{{ title }}</h1>
      <p class="subtitle">Vue3 + Vite + TypeScript 学习示例</p>
    </header>

    <main class="main">
      <section class="demo-section">
        <h2>响应式数据示例</h2>
        <div class="counter-demo">
          <p>计数器: <span class="count">{{ count }}</span></p>
          <button @click="increment" class="btn btn-primary">点击 +1</button>
          <button @click="decrement" class="btn btn-secondary">点击 -1</button>
          <button @click="reset" class="btn btn-outline">重置</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>表单绑定示例</h2>
        <div class="form-demo">
          <input 
            v-model="message" 
            type="text" 
            placeholder="输入一些文字..."
            class="input"
          />
          <p>你输入的内容: <span class="message">{{ message || '暂无内容' }}</span></p>
        </div>
      </section>

      <section class="demo-section">
        <h2>列表渲染示例</h2>
        <div class="list-demo">
          <ul class="todo-list">
            <li v-for="(item, index) in todos" :key="item.id" class="todo-item">
              <span :class="{ completed: item.completed }">{{ item.text }}</span>
              <button @click="toggleTodo(index)" class="btn btn-sm">
                {{ item.completed ? '撤销' : '完成' }}
              </button>
            </li>
          </ul>
        </div>
      </section>

      <section class="demo-section">
        <h2>计算属性示例</h2>
        <div class="computed-demo">
          <p>已完成任务: {{ completedCount }} / {{ todos.length }}</p>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>🎯 开始你的 Vue3 + TypeScript 学习之旅吧！</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义接口
interface Todo {
  id: number
  text: string
  completed: boolean
}

// 响应式数据
const title = ref('{{PROJECT_NAME}}')
const count = ref(0)
const message = ref('')
const todos = ref<Todo[]>([
  { id: 1, text: '学习 Vue3 Composition API', completed: false },
  { id: 2, text: '掌握 TypeScript 基础语法', completed: false },
  { id: 3, text: '了解 Vite 构建工具', completed: true },
  { id: 4, text: '创建第一个 Vue3 项目', completed: true }
])

// 方法
const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}

const reset = () => {
  count.value = 0
}

const toggleTodo = (index: number) => {
  todos.value[index].completed = !todos.value[index].completed
}

// 计算属性
const completedCount = computed(() => {
  return todos.value.filter(todo => todo.completed).length
})

const progressPercentage = computed(() => {
  return todos.value.length > 0 ? (completedCount.value / todos.value.length) * 100 : 0
})
</script>

<style scoped>
.header {
  text-align: center;
  padding: 2rem 0;
  border-bottom: 1px solid #eee;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.subtitle {
  color: #666;
  margin-top: 0.5rem;
}

.main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #fafafa;
}

.demo-section h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.counter-demo {
  text-align: center;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.btn {
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 300px;
  margin-right: 1rem;
}

.message {
  font-weight: bold;
  color: #27ae60;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.completed {
  text-decoration: line-through;
  color: #7f8c8d;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s ease;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  border-top: 1px solid #eee;
}
</style>