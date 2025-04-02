<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { createAIClient } from '../utils/WritingApi'
import { searchRelevantBackground } from '../utils/BackgroundSearchApi'
import PreviousSummary from '../components/PreviousSummary.vue'
import BackgroundInfo from '../components/BackgroundInfo.vue'

const emit = defineEmits(['saveChapter'])
const route = useRoute()
const bookName = ref(decodeURIComponent(route.params.bookName))
const content = ref('')
const outline = ref('')
const temporaryMemory = ref([])
const backgroundInfoRef = ref(null)
const isLoading = ref(false)
const wordCount = ref(0)
const isStreaming = ref(false)

onMounted(() => {
  const savedMemory = localStorage.getItem('temporaryMemory')
  temporaryMemory.value = savedMemory ? JSON.parse(savedMemory) : []
})

const filteredMemories = computed(() => {
  return temporaryMemory.value?.filter(item => item.title === bookName.value) || []
})

watch(content, (newVal) => {
  wordCount.value = newVal ? newVal.replace(/\s+/g, '').length : 0
})

const startWriting = async () => {
  if (!outline.value.trim()) return

  isLoading.value = true
  isStreaming.value = true
  content.value = ''

  try {
    const aiClient = createAIClient()
    const messages = [
      {
        role: 'system',
        content: `# 身份
               你是知名网络小说作者，擅长各种类型的网络小说创作，作品通俗易懂，广受欢迎。

              # 文章要求
                - 文章内容要求通俗易懂，避免过度使用专业词。
                - 符合网文风格，单句成段，更易于阅读。
                - 文章创作方向要追求热门，避免雷点毒点。
                - 当用户提供前文时，新章节剧情必须连贯。
                - 文章不少于2000字。

              # 任务
根据用户提供的故事梗概，按照用户的要求续写扩写成完整的一章网文正文。`
      }
    ]

    const relevantBackground = await searchRelevantBackground(bookName.value, outline.value)

    if (relevantBackground) {
      // 直接使用返回的结构化文本，不再需要手动分类
      messages[0].content += `\n\n# 相关背景信息\n${relevantBackground}`

      // 新增：打印背景信息
      console.log('相关背景信息:', relevantBackground)
    }

    const userMessage = {
      role: 'user',
      content: `开始写新章节，本章节内容为：${outline.value}，可根据全文和背景资料进行合理扩展。
      ${filteredMemories.value.length > 0 ? '前文内容：\n' + filteredMemories.value.map(m => m.content).join('\n\n') : ''}`
    }
    messages.push(userMessage)

    // 新增：打印发送给AI的消息内容
    console.log('发送给AI的消息内容:', JSON.stringify(messages, null, 2))

    const stream = await aiClient.getCompletion(messages, { stream: true })

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        content.value += chunk.choices[0].delta.content
      }
    }
  } catch (error) {
    console.error('写作失败:', error)
    content.value = '写作失败，请重试'
  } finally {
    isLoading.value = false
    isStreaming.value = false
  }
}

const finalizeContent = async () => {
  if (!content.value.trim()) return

  // 保存到前情提要
  const newMemory = {
    id: Date.now(),
    title: bookName.value,
    content: content.value,
    date: new Date().toLocaleString(),
    wordCount: wordCount.value,
  }

  temporaryMemory.value.unshift(newMemory)
  localStorage.setItem('temporaryMemory', JSON.stringify(temporaryMemory.value))

  // 传递给背景资料组件
  if (backgroundInfoRef.value) {
    backgroundInfoRef.value.saveChapter(content.value)
  }

  content.value = ''
  outline.value = ''
}

const handleSaveChapter = (chapterData) => {
  console.log('Received chapter data:', chapterData)
}

const handleDeleteMemory = (id) => {
  temporaryMemory.value = temporaryMemory.value.filter(item => item.id !== id)
  localStorage.setItem('temporaryMemory', JSON.stringify(temporaryMemory.value))
}

const copyContent = () => {
  if (!content.value.trim()) return

  navigator.clipboard.writeText(content.value)
    .then(() => {
      alert('内容已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
      alert('复制失败，请手动复制')
    })
}
</script>

<template>
  <div class="writing-container">
    <BackgroundInfo ref="backgroundInfoRef" :bookName="bookName" @saveChapter="handleSaveChapter" />

    <div class="panel center-panel">
      <div class="header-section">
        <h1 class="book-title">{{ bookName }}</h1>
      </div>

      <div class="input-section">
        <div class="input-group">
          <label class="input-label">章节梗概</label>
          <textarea v-model="outline" placeholder="请输入本章节的主要内容梗概..." class="outline-textarea" rows="2"></textarea>
        </div>

        <button @click="startWriting" class="action-btn start-btn" :disabled="isLoading || !outline.trim()">
          {{ isLoading ? '写作中...' : '开始写作' }}
        </button>
      </div>

      <div class="content-section">
        <textarea v-model="content" placeholder="写作内容将显示在这里..." class="writing-area" :readonly="isStreaming"></textarea>
      </div>

      <div class="bottom-bar">
        <div class="word-count">字数: {{ wordCount }}</div>
        <div class="action-buttons">
          <button @click="copyContent" class="action-btn copy-btn" :disabled="!content.trim()">
            复制全文
          </button>
          <button @click="finalizeContent" class="action-btn finalize-btn" :disabled="!content.trim() || isStreaming">
            定稿保存
          </button>
        </div>
      </div>
    </div>

    <PreviousSummary :memories="filteredMemories" @deleteMemory="handleDeleteMemory" />
  </div>
</template>


<style scoped>
.writing-container {
  display: flex;
  height: 100vh;
  background: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.panel {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  background: #fff;
}

.center-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
  border-right: 1px dashed #e0e0e0;
  border-left: 1px dashed #e0e0e0;
  gap: 20px;
}

.book-title {
  font-size: 1.2rem;
  margin: 0;
  color: #000;
  font-weight: 500;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.outline-textarea {
  max-width: 100%;
  min-height: auto;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.chapter-controls {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.chapter-input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chapter-text {
  font-size: 0.95rem;
  color: #333;
}

.chapter-input {
  width: 120px;
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  background: #fff;
}

.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.writing-area {
  width: 100%;
  flex: 1;
  border: 1px solid #e0e0e0;
  resize: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.8;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
}

.action-btn {
  padding: 10px 20px;
  background: #000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
}

.start-btn {
  height: 40px;
  padding: 0 24px;
}

.action-btn:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.copy-btn {
  background: #555;
}

.word-count {
  color: #333;
  font-size: 0.9rem;
}

.finalize-btn {
  background: #333;
}

@media (max-width: 768px) {
  .writing-container {
    flex-direction: column;
    height: auto;
  }

  .panel {
    padding: 16px;
  }

  .chapter-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>