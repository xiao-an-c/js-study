<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600"
  >
    <header class="text-center py-8 text-white">
      <img src="/vite.svg" class="w-16 h-16 mx-auto mb-4" alt="Vite logo" />
      <h1 class="text-4xl font-bold mb-2">{{ title }}</h1>
      <p class="text-xl opacity-90">
        Vue3 + Vite + TypeScript + Tailwind CSS 学习示例
      </p>
    </header>

    <main class="max-w-4xl mx-auto px-4 pb-8">
      <section class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">
          响应式数据示例
        </h2>
        <div class="space-y-4">
          <p class="text-lg">
            计数器:
            <span class="font-bold text-blue-600 text-xl">{{ count }}</span>
          </p>
          <div class="space-x-2">
            <button
              @click="increment"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              点击 +1
            </button>
            <button
              @click="decrement"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              点击 -1
            </button>
            <button
              @click="reset"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">表单绑定示例</h2>
        <div class="space-y-4">
          <input
            v-model="message"
            type="text"
            placeholder="输入一些文字..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-lg">
            你输入的内容:
            <span class="font-medium text-green-600">{{
              message || '暂无内容'
            }}</span>
          </p>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">列表渲染示例</h2>
        <div>
          <ul class="space-y-2">
            <li
              v-for="(item, index) in todos"
              :key="item.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <span
                :class="{
                  'line-through text-gray-500': item.completed,
                  'text-gray-800': !item.completed
                }"
                >{{ item.text }}</span
              >
              <button
                @click="toggleTodo(index)"
                class="px-3 py-1 text-sm rounded-md transition-colors"
                :class="
                  item.completed
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                "
              >
                {{ item.completed ? '撤销' : '完成' }}
              </button>
            </li>
          </ul>
        </div>
      </section>

      <section class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">计算属性示例</h2>
        <div>
          <p class="text-lg">
            已完成任务:
            <span class="font-bold text-purple-600">{{ completedCount }}</span>
            / <span class="font-bold text-gray-600">{{ todos.length }}</span>
          </p>
          <div class="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </section>

      <!-- TSX 组件示例 -->
      <section class="mb-8">
        <TsxDemo />
      </section>
    </main>

    <footer class="text-center py-6 text-white">
      <p class="text-lg">
        🎯 开始你的 Vue3 + TypeScript + Tailwind CSS + SCSS + TSX 学习之旅吧！
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import TsxDemo from './components/TsxDemo'

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
    return todos.value.length > 0
      ? (completedCount.value / todos.value.length) * 100
      : 0
  })
</script>

<style scoped>
  /* Tailwind CSS 已经提供了所有需要的样式 */
</style>
