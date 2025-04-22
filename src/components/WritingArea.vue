<template>
  <div class="writing-area">
    <!-- 输入区 -->
    <div class="input-section">
      <textarea v-model="inputText" placeholder="请输入创作内容..." class="input-box"></textarea>
      <button class="create-btn" @click="handleCreate" :disabled="isLoading">
        {{ isLoading ? '创作中...' : '创作' }}
      </button>
    </div>

    <!-- 显示区 -->
    <div class="output-section">
      <textarea v-model="outputText" class="output-content"></textarea>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="word-count">字数: {{ wordCount }}</div>
      <div class="actions">
        <button class="copy-btn" @click="handleCopy">复制</button>
        <button class="finalize-btn" @click="handleFinalize">定稿</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from 'vue'
import { generateWriting } from '../utils/aiwriting'
import { saveChapter, updateChapterVector } from '../utils/db'
import { vectorizeText } from '../utils/vectorUtils'

const props = defineProps({
  bookId: {
    type: Number,
    required: false,
    default: 0
  }
})

const inputText = ref('')
const outputText = ref('')
const outputContent = ref<HTMLTextAreaElement>()
const isLoading = ref(false)

async function callAI(prompt: string, bookId?: number) {
  const config = JSON.parse(localStorage.getItem('aiConfig') || 'null')
  if (!config?.apiKey) {
    alert('请先在设置中配置AI参数')
    return
  }

  isLoading.value = true
  outputText.value = ''

  try {
    await generateWriting(
      prompt,
      config,
      (chunkOrError: string | Error) => {
        if (chunkOrError instanceof Error) {
          console.error('AI调用失败:', chunkOrError)
          alert(`AI调用失败: ${chunkOrError.message}`)
          isLoading.value = false
        } else {
          outputText.value += chunkOrError
          // 自动滚动到底部
          nextTick(() => {
            if (outputContent.value) {
              outputContent.value.scrollTop = outputContent.value.scrollHeight
            }
          })
        }
      },
      props.bookId
    )
  } catch (error) {
    console.error('AI调用失败:', error)
    alert(`AI调用失败: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    isLoading.value = false
  }
}

function handleCreate() {
  if (!inputText.value.trim()) {
    alert('请输入创作内容')
    return
  }
  isLoading.value = true
  outputText.value = ''
  callAI(inputText.value, props.bookId)
}

const emit = defineEmits(['content-change'])
const addChapter = inject('addChapter') as (chapter: any) => void
const updateChapter = inject('updateChapter') as (update: any) => void
const wordCount = computed(() => outputText.value.length)

function handleCopy() {
  if (outputText.value) {
    navigator.clipboard.writeText(outputText.value)
      .then(() => alert('已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err))
  }
}

function handleOutputChange() {
  emit('content-change', outputText.value)
}

async function handleFinalize() {
  if (!outputText.value.trim()) {
    alert('请先创作内容再定稿')
    return
  }

  const title = `章节 ${new Date().toLocaleString()}`
  const newChapter = {
    id: Date.now(), // 临时ID
    bookId: props.bookId,
    title,
    content: outputText.value,
    contentVector: undefined,
    contentVectorStatus: 'processing' as const,
    createdAt: new Date()
  }

  // 立即乐观UI更新
  addChapter(newChapter)
  // 触发全局事件
  window.dispatchEvent(new CustomEvent('chapter-saved', { detail: newChapter }))
  alert('章节保存中...')

  // 后台异步保存
  try {
    // 保存到数据库并获取真实ID
    const chapterId = await saveChapter(
      props.bookId,
      title,
      outputText.value,
      undefined,
      'processing'
    )

    // 更新ID为数据库返回的真实ID
    updateChapter({
      oldId: newChapter.id,
      newId: chapterId,
      contentVectorStatus: 'processing'
    })

    // 异步生成并更新向量
    vectorizeText(outputText.value)
      .then(async ({ vector, status }) => {
        try {
          await updateChapterVector(chapterId, vector, status)
          updateChapter({
            id: chapterId,
            contentVector: vector,
            contentVectorStatus: status
          })
        } catch (error) {
          console.error('更新章节向量失败:', error)
          updateChapter({
            id: chapterId,
            contentVectorStatus: 'error'
          })
        }
      })
      .catch(error => {
        console.error('生成章节向量失败:', error)
        updateChapter({
          id: chapterId,
          contentVectorStatus: 'error'
        })
      })
  } catch (error) {
    console.error('保存章节失败:', error)
    updateChapter({
      id: newChapter.id,
      contentVectorStatus: 'error'
    })
  }
}
</script>

<style scoped>
.writing-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}

.word-count {
  font-size: 14px;
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
}

.copy-btn,
.finalize-btn {
  padding: 6px 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.copy-btn:hover,
.finalize-btn:hover {
  background-color: #f5f5f5;
}

.input-section {
  padding: 16px 16px 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-box {
  width: 100%;
  min-height: 60px;
  max-height: 30%;
  padding: 12px;
  box-sizing: border-box;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: vertical;
  font-size: 16px;
}

.create-btn {
  align-self: flex-end;
  padding: 8px 16px;
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background-color: #f5f5f5;
}

.create-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.output-section {
  flex: 1;
  padding: 16px;
}

.output-content {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 12px;
  box-sizing: border-box;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: none;
  font-size: 16px;
  line-height: 1.5;
}
</style>