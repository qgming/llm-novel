<script setup>
import { ref, onMounted } from 'vue'
import { getEmbedding } from '@/utils/EmbeddingApi'
import { createAIClient } from '@/utils/WritingApi'

const props = defineProps({
  bookName: {
    type: String,
    required: true
  }
})

const settings = ref({
  worldview: null,
  characters: [],
  outlines: [],
  chapters: []
})
const showWorldviewForm = ref(false)
const showCharacterForm = ref(false)
const newWorldview = ref('')
const newCharacter = ref({ name: '', description: '' })
const embeddingStatus = ref({
  worldview: null,
  characters: {},
  chapters: {}
})
const expandedItems = ref({
  characters: {},
  chapters: {}
})
const isSummarizing = ref(false)

// 加载设置数据
const loadSettings = () => {
  const request = indexedDB.open(props.bookName)
  request.onsuccess = (event) => {
    const db = event.target.result
    const transaction = db.transaction('settings', 'readonly')
    const store = transaction.objectStore('settings')

    // 加载世界观
    const worldviewRequest = store.get('worldview')
    worldviewRequest.onsuccess = () => {
      settings.value.worldview = worldviewRequest.result || null
    }

    // 加载人物
    const characterRequest = store.index('type').getAll('character')
    characterRequest.onsuccess = () => {
      settings.value.characters = characterRequest.result
    }

    // 加载章节
    const chapterRequest = store.index('type').getAll('chapter')
    chapterRequest.onsuccess = () => {
      settings.value.chapters = chapterRequest.result
    }
  }
}

// 切换展开状态
const toggleExpand = (type, id) => {
  expandedItems.value[type][id] = !expandedItems.value[type][id]
}

// 保存世界观
const saveWorldview = async () => {
  embeddingStatus.value.worldview = 'processing'
  try {
    const embedding = await getEmbedding(newWorldview.value)
    const request = indexedDB.open(props.bookName)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction('settings', 'readwrite')
      const store = transaction.objectStore('settings')

      const data = {
        id: 'worldview',
        type: 'worldview',
        content: newWorldview.value,
        embedding: embedding,
        updatedAt: new Date()
      }

      store.put(data)
      settings.value.worldview = data
      embeddingStatus.value.worldview = 'success'
      showWorldviewForm.value = false
      newWorldview.value = ''
    }
  } catch (error) {
    console.error('保存世界观失败:', error)
    embeddingStatus.value.worldview = 'error'
  }
}

// 添加人物
const addCharacter = async () => {
  const characterId = Date.now()
  embeddingStatus.value.characters[characterId] = 'processing'

  try {
    const embedding = await getEmbedding(newCharacter.value.description)
    const request = indexedDB.open(props.bookName)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction('settings', 'readwrite')
      const store = transaction.objectStore('settings')

      const data = {
        id: characterId,
        type: 'character',
        name: newCharacter.value.name,
        description: newCharacter.value.description,
        embedding: embedding,
        createdAt: new Date()
      }

      store.add(data)
      settings.value.characters.push(data)
      embeddingStatus.value.characters[characterId] = 'success'
      showCharacterForm.value = false
      newCharacter.value = { name: '', description: '' }
    }
  } catch (error) {
    console.error('添加人物失败:', error)
    embeddingStatus.value.characters[characterId] = 'error'
  }
}

// 删除人物
const deleteCharacter = (id) => {
  const request = indexedDB.open(props.bookName)
  request.onsuccess = (event) => {
    const db = event.target.result
    const transaction = db.transaction('settings', 'readwrite')
    const store = transaction.objectStore('settings')

    store.delete(id)
    settings.value.characters = settings.value.characters.filter(c => c.id !== id)
  }
}

// 章节总结函数
const summarizeChapter = async (text) => {
  isSummarizing.value = true
  try {
    const aiClient = createAIClient()
    const response = await aiClient.getCompletion([
      {
        role: 'system',
        content: `# 身份
你是章节内容概括AI，专业将完整章节内容浓缩成100字以内的精炼摘要，保留核心情节、人物发展和重要伏笔

# 能力
## 内容提炼
   - 情节精简: 能识别并保留故事发展的关键转折点
   - 人物追踪: 准确捕捉主要人物的情感变化和成长
   - 伏笔识别: 甄别并保留对未来情节发展有影响的伏笔
   - 节奏把控: 确保摘要节奏与原章节保持一致

## 语言优化
   - 精准表达: 用最少的文字传达最丰富的信息
   - 逻辑连贯: 确保摘要内部逻辑通顺
   - 风格匹配: 保持与原作一致的叙事风格
   - 关键词保留: 不遗漏重要专有名词和关键对话

# 规则
## 内容原则：
   - 严格字数: 必须控制在100字以内
   - 完整性: 必须包含人物、情节、环境三大要素
   - 平衡性: 合理分配各要素的字数比例
   - 客观性: 不做主观评价，只做事实陈述

## 技术准则：
   - 时间顺序: 按事件发生顺序叙述
   - 主动语态: 优先使用主动语态
   - 具体名词: 避免抽象表述
   - 动词优先: 多用动作性词汇

## 限制条件：
   - 不添加: 不加入原文没有的信息
   - 不解释: 不做分析性说明
   - 不评价: 避免价值判断
   - 不重复: 避免信息冗余

# 任务
- 目标: 创作100字内的章节精炼摘要
- 步骤 1: 通读全文，标记关键情节转折点
- 步骤 2: 追踪主要人物的行为变化和情感发展
- 步骤 3: 识别重要伏笔和悬念设置
- 步骤 4: 按照时间顺序整合信息
- 步骤 5: 精简语言，调整至100字以内
- 预期结果: 一段包含完整叙事要素的精炼摘要

# 输出格式
第x章 章节名称
章节正文

# 初始化
作为章节内容概括AI，你必须遵守上述规则，按照任务执行，并按指定输出格式输出结果。`
      },
      {
        role: 'user',
        content: text
      }
    ], { stream: false })

    if (response && typeof response === 'string') {
      return response
    }
    return '章节总结生成失败'
  } catch (error) {
    console.error('章节总结失败:', error)
    return '章节总结生成失败'
  } finally {
    isSummarizing.value = false
  }
}

// 保存章节内容
const saveChapter = async (content) => {
  const chapterId = Date.now()
  embeddingStatus.value.chapters[chapterId] = 'processing'

  try {
    // 先保存原始内容
    const request = indexedDB.open(props.bookName)
    request.onsuccess = (event) => {
      const db = event.target.result
      const transaction = db.transaction('settings', 'readwrite')
      const store = transaction.objectStore('settings')

      const data = {
        id: chapterId,
        type: 'chapter',
        title: `新章节 ${new Date().toLocaleString()}`,
        content: '总结中...',
        embedding: null,
        createdAt: new Date(),
        status: 'processing'
      }

      store.add(data)
      settings.value.chapters.unshift(data)

      // 开始异步总结
      summarizeChapter(content).then(async (summary) => {
        const embedding = await getEmbedding(summary)

        // 更新章节内容
        const updateRequest = indexedDB.open(props.bookName)
        updateRequest.onsuccess = (e) => {
          const db = e.target.result
          const tx = db.transaction('settings', 'readwrite')
          const st = tx.objectStore('settings')

          st.get(chapterId).onsuccess = (evt) => {
            const record = evt.target.result
            record.content = summary
            record.embedding = embedding
            record.status = 'success'
            st.put(record)

            // 更新本地数据
            const index = settings.value.chapters.findIndex(c => c.id === chapterId)
            if (index > -1) {
              settings.value.chapters.splice(index, 1, record)
            }
            embeddingStatus.value.chapters[chapterId] = 'success'
          }
        }
      }).catch(error => {
        console.error('章节总结失败:', error)
        embeddingStatus.value.chapters[chapterId] = 'error'
      })
    }
  } catch (error) {
    console.error('章节保存失败:', error)
    embeddingStatus.value.chapters[chapterId] = 'error'
  }
}

onMounted(() => {
  if (props.bookName) {
    const request = indexedDB.open(props.bookName, 2)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('settings')) {
        const store = db.createObjectStore('settings', { keyPath: 'id' })
        store.createIndex('type', 'type', { unique: false })
      }
    }
    request.onsuccess = () => {
      loadSettings()
    }
  }
})

defineExpose({
  saveChapter
})
</script>

<template>
  <div class="panel">
    <h3>背景资料</h3>

    <!-- 世界观区域 -->
    <div class="section">
      <div class="section-header">
        <h4>世界观</h4>
        <div>
          <button v-if="!settings.worldview && !showWorldviewForm" @click="showWorldviewForm = true" class="add-btn">
            + 添加世界观
          </button>
          <button v-else-if="settings.worldview && !showWorldviewForm"
            @click="showWorldviewForm = true; newWorldview = settings.worldview.content" class="add-btn">
            编辑世界观
          </button>
        </div>
      </div>

      <div v-if="showWorldviewForm" class="form">
        <textarea v-model="newWorldview" placeholder="请输入世界观设定..."></textarea>
        <div class="form-actions">
          <button @click="showWorldviewForm = false" class="cancel-btn">取消</button>
          <button @click="saveWorldview" :disabled="!newWorldview.trim()" class="save-btn">
            {{ embeddingStatus.worldview === 'processing' ? '处理中...' : '保存' }}
          </button>
        </div>
      </div>

      <div v-if="settings.worldview" class="content-item">
        <div class="status-line">
          <div class="status-dot" :class="{
            'success': settings.worldview.embedding,
            'processing': embeddingStatus.worldview === 'processing',
            'error': embeddingStatus.worldview === 'error'
          }"></div>
          <span v-if="embeddingStatus.worldview === 'processing'" class="status-text">处理中...</span>
        </div>
        <p>{{ settings.worldview.content }}</p>
      </div>
    </div>

    <!-- 人物设定区域 -->
    <div class="section">
      <div class="section-header">
        <h4>人物设定</h4>
        <button @click="showCharacterForm = true" class="add-btn">+ 添加人物</button>
      </div>

      <div v-if="showCharacterForm" class="form">
        <input v-model="newCharacter.name" placeholder="人物名称">
        <textarea v-model="newCharacter.description" placeholder="人物描述..."></textarea>
        <div class="form-actions">
          <button @click="showCharacterForm = false" class="cancel-btn">取消</button>
          <button @click="addCharacter" :disabled="!newCharacter.name.trim() || !newCharacter.description.trim()">
            添加
          </button>
        </div>
      </div>

      <div v-for="character in settings.characters" :key="character.id" class="content-item">
        <div class="character-header" @click="toggleExpand('characters', character.id)">
          <div class="status-dot" :class="{
            'success': character.embedding,
            'processing': embeddingStatus.characters[character.id] === 'processing',
            'error': embeddingStatus.characters[character.id] === 'error'
          }"></div>
          <h5>{{ character.name }}</h5>
          <span class="toggle-icon">
            {{ expandedItems.characters[character.id] ? '−' : '+' }}
          </span>
        </div>
        <div v-if="expandedItems.characters[character.id]" class="character-details">
          <p>{{ character.description }}</p>
          <div class="item-actions">
            <button @click="deleteCharacter(character.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 章节梗概区域 -->
    <div class="section" v-if="settings.chapters.length > 0">
      <div class="section-header">
        <h4>章节梗概</h4>
        <span v-if="isSummarizing" class="summary-status">总结中...</span>
      </div>

      <div v-for="chapter in settings.chapters" :key="chapter.id" class="content-item">
        <div class="chapter-header" @click="toggleExpand('chapters', chapter.id)">
          <div class="status-dot" :class="{
            'success': chapter.status === 'success',
            'processing': chapter.status === 'processing',
            'error': chapter.status === 'error'
          }"></div>
          <h5>{{ chapter.content.split('\n')[0] }}</h5>
          <span class="toggle-icon">
            {{ expandedItems.chapters[chapter.id] ? '−' : '+' }}
          </span>
        </div>
        <div v-if="expandedItems.chapters[chapter.id]" class="chapter-details">
          <p>{{ chapter.content }}</p>
          <div class="chapter-meta">
            创建于: {{ new Date(chapter.createdAt).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  padding: 1.5rem;
  background: #fff;
  border-radius: 4px;
}

h3 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 500;
  padding-bottom: 0.5rem;
}

.section {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

h4 {
  margin: 0;
  font-size: 1rem;
  color: #444;
  font-weight: 500;
}

.add-btn {
  background: none;
  border: 1px dashed #e0e0e0;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.content-item {
  position: relative;
  margin-bottom: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.8rem;
}

.character-header,
.chapter-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.character-header h5,
.chapter-header h5 {
  margin: 0;
  flex-grow: 1;
  font-size: 0.95rem;
  color: #333;
}

.toggle-icon {
  color: #999;
  font-size: 1.1rem;
  margin-left: 0.5rem;
}

.character-details,
.chapter-details {
  padding-top: 0.8rem;
  margin-top: 0.8rem;
  border-top: 1px solid #f0f0f0;
}

.character-details p,
.chapter-details p {
  margin: 0;
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.status-line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-dot.success {
  background-color: #4CAF50;
}

.status-dot.processing {
  background-color: #FFC107;
}

.status-dot.error {
  background-color: #F44336;
}

.status-text {
  font-size: 0.8rem;
  color: #666;
}

.summary-status {
  font-size: 0.8rem;
  color: #666;
}

.item-actions {
  margin-top: 0.5rem;
  text-align: right;
}

.delete-btn {
  background: none;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  color: #666;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.form {
  margin-bottom: 1rem;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.form textarea {
  width: 100%;
  min-height: 80px;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form input {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.cancel-btn {
  background: none;
  border: 1px solid #e0e0e0;
  color: #666;
}

.save-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #333;
}

.chapter-meta {
  margin-top: 0.5rem;
  color: #999;
  font-size: 0.8rem;
}
</style>