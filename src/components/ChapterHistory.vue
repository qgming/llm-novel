<template>
  <div class="chapter-history">
    <div class="section-header">
      <h3>历史章节</h3>
    </div>
    <div v-if="chapters && chapters.length > 0" class="chapter-list">
      <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item"
        :class="{ expanded: expandedChapters.includes(chapter.id) }" @click="toggleExpand(chapter.id)">
        <div class="chapter-header">
          <div class="status-indicator" :style="{ backgroundColor: getStatusColor(chapter.contentVectorStatus) }"
            v-if="chapter.contentVectorStatus"></div>
          <span class="chapter-title">{{ getFirstLine(chapter.content) || chapter.title }}</span>
          <button class="delete-btn" @click.stop="handleDeleteClick(chapter.id)">×</button>
        </div>
        <div class="chapter-text">{{ chapter.content }}</div>
        <div class="chapter-time" v-if="expandedChapters.includes(chapter.id)">
          {{ formatTime(chapter.createdAt) }}
        </div>
      </div>
    </div>
    <div v-else class="empty">暂无历史章节</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getStatusColor } from '../utils/vectorUtils'
import { getChapters } from '../utils/db'

const props = defineProps<{
  bookId: number
}>()

const chapters = ref<Array<{
  id: number
  bookId: number
  title: string
  content: string
  contentVector?: number[] | null
  contentVectorStatus?: 'processing' | 'success' | 'error' | null
  createdAt: Date
}>>([])

// 确保id存在
function ensureId(chapter: any): chapter is { id: number } & typeof chapter {
  return chapter.id !== undefined
}

async function loadChapters() {
  const dbChapters = await getChapters(props.bookId)
  chapters.value = dbChapters.filter(ensureId).map(c => ({
    ...c,
    id: c.id as number
  }))
}

// 保存章节后刷新数据
async function handleSave(newChapter: any) {
  if (ensureId(newChapter)) {
    await loadChapters() // 重新加载确保数据最新
    return true
  }
  return false
}

// 删除章节后刷新数据
async function handleDeleteClick(id: number) {
  // 触发删除事件
  window.dispatchEvent(new CustomEvent('chapter-deleted', { detail: { id } }))
  // 本地立即更新
  chapters.value = chapters.value.filter(c => c.id !== id)
  // 通知父组件
  emit('deleteChapter', id)
}

async function handleDeleteEvent(e: Event) {
  const { id } = (e as CustomEvent).detail
  chapters.value = chapters.value.filter(c => c.id !== id)
  setTimeout(loadChapters, 100)
}

// 事件处理函数
const handleSavedEvent = (e: Event) => {
  handleChapterSaved((e as CustomEvent).detail)
}
const handleUpdatedEvent = (e: Event) => {
  handleChapterUpdated((e as CustomEvent).detail)
}

onMounted(() => {
  // 初始加载
  loadChapters()

  // 监听自定义事件
  window.addEventListener('chapter-saved', handleSavedEvent)
  window.addEventListener('chapter-updated', handleUpdatedEvent)
  window.addEventListener('chapter-deleted', handleDeleteEvent)
})

watch(() => props.bookId, loadChapters)

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('chapter-saved', handleSavedEvent)
  window.removeEventListener('chapter-updated', handleUpdatedEvent)
})

const expandedChapters = ref<number[]>([])

const emit = defineEmits(['chapter-selected', 'deleteChapter'])

async function handleChapterSaved(newChapter: any) {
  if (ensureId(newChapter)) {
    // 立即更新UI
    chapters.value.unshift(newChapter)
    // 异步从数据库重新加载确保数据一致
    setTimeout(loadChapters, 100)
  }
}

function handleChapterUpdated(update: {
  id: number
  oldId?: number
  newId?: number
  contentVector?: number[]
  contentVectorStatus?: string
}) {
  // 处理ID更新（临时ID -> 数据库ID）
  if (update.oldId && update.newId) {
    if (!chapters) return
    const chapterIndex = chapters.value.findIndex(c => c.id === update.oldId)
    if (chapterIndex >= 0) {
      chapters.value[chapterIndex].id = update.newId
    }
    return
  }

  // 更新向量状态
  if (!chapters) return
  const chapter = chapters.value.find(c => c.id === update.id)
  if (chapter) {
    if (update.contentVector) chapter.contentVector = update.contentVector
    if (update.contentVectorStatus) {
      chapter.contentVectorStatus = update.contentVectorStatus as any
    }
  }
}


function toggleExpand(chapterId: number) {
  const index = expandedChapters.value.indexOf(chapterId)
  if (index === -1) {
    expandedChapters.value.push(chapterId)
  } else {
    expandedChapters.value.splice(index, 1)
  }
  // 强制触发响应式更新
  if (!chapters || !Array.isArray(chapters)) return
  const newChapters = [...chapters]
  chapters.splice(0, chapters.length, ...newChapters)
}

function getFirstLine(content: string) {
  if (!content) return ''
  return content.split('\n')[0].trim()
}

function formatTime(date: Date) {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}
</script>

<style scoped>
.chapter-history {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  gap: 16px;
  overflow: hidden;
  background: #f5f5f5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
}

.empty {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
  font-style: italic;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.chapter-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.chapter-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.chapter-title {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.chapter-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  line-height: 1.6;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.chapter-item.expanded .chapter-text {
  display: block;
  -webkit-line-clamp: unset;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}


.processing {
  background-color: #fff3cd;
  color: #856404;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #999;
  font-size: 18px;
  flex-shrink: 0;
  margin-left: 8px;
}

.delete-btn:hover {
  color: #f56c6c;
  background: transparent;
}

.chapter-time {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  text-align: right;
}
</style>