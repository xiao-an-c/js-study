import { defineComponent, ref, computed } from 'vue'

// TSX 组件示例
export default defineComponent({
  name: 'TsxDemo',
  setup() {
    // 响应式数据
    const count = ref(0)
    const message = ref('Hello TSX!')
    const items = ref(['Vue', 'React', 'Angular'])
    const selectedItem = ref('')

    // 计算属性
    const doubleCount = computed(() => count.value * 2)
    const hasItems = computed(() => items.value.length > 0)

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

    const addItem = () => {
      const newItem = `Item ${items.value.length + 1}`
      items.value.push(newItem)
    }

    const removeItem = (index: number) => {
      items.value.splice(index, 1)
    }

    const selectItem = (item: string) => {
      selectedItem.value = item
    }

    // 渲染函数
    return () => (
      <div class="tsx-demo p-6 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">TSX 组件示例</h2>

        {/* 基础数据绑定 */}
        <section class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">基础数据绑定</h3>
          <div class="bg-gray-50 p-4 rounded">
            <p class="text-gray-600 mb-2">
              消息: <span class="font-medium">{message.value}</span>
            </p>
            <p class="text-gray-600">
              计数: <span class="font-medium text-blue-600">{count.value}</span>
            </p>
            <p class="text-gray-600">
              双倍计数:{' '}
              <span class="font-medium text-green-600">
                {doubleCount.value}
              </span>
            </p>
          </div>
        </section>

        {/* 事件处理 */}
        <section class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">事件处理</h3>
          <div class="flex gap-2 flex-wrap">
            <button
              onClick={increment}
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              增加
            </button>
            <button
              onClick={decrement}
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              减少
            </button>
            <button
              onClick={reset}
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              重置
            </button>
          </div>
        </section>

        {/* 条件渲染 */}
        <section class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">条件渲染</h3>
          <div class="bg-gray-50 p-4 rounded">
            {count.value > 0 ? (
              <p class="text-green-600 font-medium">
                计数为正数: {count.value}
              </p>
            ) : count.value < 0 ? (
              <p class="text-red-600 font-medium">计数为负数: {count.value}</p>
            ) : (
              <p class="text-gray-600 font-medium">计数为零</p>
            )}
          </div>
        </section>

        {/* 列表渲染 */}
        <section class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">列表渲染</h3>
          <div class="bg-gray-50 p-4 rounded">
            <div class="mb-3">
              <button
                onClick={addItem}
                class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                添加项目
              </button>
            </div>
            {hasItems.value ? (
              <ul class="space-y-2">
                {items.value.map((item, index) => (
                  <li
                    key={index}
                    class={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      selectedItem.value === item
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => selectItem(item)}
                  >
                    <span class="text-gray-700">{item}</span>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        removeItem(index)
                      }}
                      class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p class="text-gray-500 italic">暂无项目</p>
            )}
            {selectedItem.value && (
              <p class="mt-3 text-sm text-blue-600">
                已选择: <span class="font-medium">{selectedItem.value}</span>
              </p>
            )}
          </div>
        </section>

        {/* 输入绑定 */}
        <section class="mb-6">
          <h3 class="text-lg font-semibold text-gray-700 mb-3">输入绑定</h3>
          <div class="bg-gray-50 p-4 rounded">
            <input
              type="text"
              value={message.value}
              onInput={e =>
                (message.value = (e.target as HTMLInputElement).value)
              }
              placeholder="输入消息..."
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-2 text-sm text-gray-600">
              实时预览: <span class="font-medium">{message.value}</span>
            </p>
          </div>
        </section>

        {/* TSX 特性说明 */}
        <section>
          <h3 class="text-lg font-semibold text-gray-700 mb-3">TSX 特性</h3>
          <div class="bg-blue-50 p-4 rounded border border-blue-200">
            <ul class="text-sm text-blue-800 space-y-1">
              <li>✅ 类型安全的 JSX 语法</li>
              <li>✅ 完整的 TypeScript 支持</li>
              <li>✅ Vue 3 Composition API 集成</li>
              <li>✅ 条件渲染和列表渲染</li>
              <li>✅ 事件处理和数据绑定</li>
              <li>✅ 组件 props 类型检查</li>
            </ul>
          </div>
        </section>
      </div>
    )
  }
})
