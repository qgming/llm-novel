<template>
  <div class="create-view">
    <h1>{{ bookTitle || '创作页面' }}</h1>
    <div class="editor-layout">
      <BackgroundSetting class="left-panel" :bookId="bookId ? Number(bookId) : 0" />
      <div class="center-content">
        <WritingArea class="center-panel" :bookId="bookId ? Number(bookId) : 0" />
      </div>
      <ChapterHistory class="right-panel" :bookId="bookId ? Number(bookId) : 0" @deleteChapter="handleDeleteChapter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { getBookById, deleteChapter } from '../utils/db'
import BackgroundSetting from '../components/BackgroundSetting.vue'
import WritingArea from '../components/WritingArea.vue'
import ChapterHistory from '../components/ChapterHistory.vue'

// 章节状态管理
const chapters = ref<Array<{
  id: number
  bookId: number
  title: string
  content: string
  contentVector?: number[]
  contentVectorStatus?: 'processing' | 'success' | 'error'
  createdAt: Date
}>>([])

// 提供章节状态和方法给子组件
provide('chapters', chapters)
provide('addChapter', (newChapter: any) => {
  chapters.value.unshift(newChapter)
})
provide('updateChapter', (update: {
  id: number
  oldId?: number
  newId?: number
  contentVector?: number[]
  contentVectorStatus?: string
}) => {
  if (update.oldId && update.newId) {
    const chapterIndex = chapters.value.findIndex(c => c.id === update.oldId)
    if (chapterIndex >= 0) {
      chapters.value[chapterIndex].id = update.newId
    }
    return
  }

  const chapter = chapters.value.find(c => c.id === update.id)
  if (chapter) {
    if (update.contentVector) chapter.contentVector = update.contentVector
    if (update.contentVectorStatus) {
      chapter.contentVectorStatus = update.contentVectorStatus as any
    }
  }
})

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: false
  }
})

const bookTitle = ref('')

onMounted(async () => {
  if (props.bookId) {
    const bookId = typeof props.bookId === 'string' ? parseInt(props.bookId) : props.bookId
    const book = await getBookById(bookId)
    if (book) {
      bookTitle.value = book.title
    }
  }
})

async function handleDeleteChapter(id: number) {
  if (!confirm('确定要删除这个章节吗？')) return
  await deleteChapter(id)
  // 从本地章节列表中移除
  const index = chapters.value.findIndex(c => c.id === id)
  if (index >= 0) {
    chapters.value.splice(index, 1)
  }
}
</script>

<style scoped>
.create-view {
  background-color: #ffffff;
  height: 100vh;
  padding: 0 32px 32px;
  box-sizing: border-box;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  height: calc(100% - 40px);
  min-height: 0;
  overflow: hidden;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.center-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.center-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
