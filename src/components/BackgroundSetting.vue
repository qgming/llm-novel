<template>
  <div class="background-setting">
    <WorldView :worldview="worldview" :worldview-vector-status="worldviewVectorStatus"
      :is-worldview-expanded="isWorldviewExpanded" @show-worldview-modal="showWorldviewModal = true"
      @edit-worldview="editWorldview" @delete-worldview="deleteWorldview" />

    <CharacterProfile :characters="characters" :expanded-characters="expandedCharacters"
      :character-vector-status="characterVectorStatus" @show-character-modal="showCharacterModal = true"
      @delete-character="deleteCharacter" @toggle-character="toggleCharacter" />

    <!-- 世界观编辑模态框 -->
    <div v-if="showWorldviewModal" class="modal">
      <div class="modal-content">
        <h3>{{ worldview ? '编辑' : '添加' }}世界观</h3>
        <textarea v-model="worldviewEditContent" placeholder="请输入世界观设定"></textarea>
        <div class="modal-actions">
          <button @click="saveWorldview">保存</button>
          <button @click="showWorldviewModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 人物档案编辑模态框 -->
    <div v-if="showCharacterModal" class="modal">
      <div class="modal-content">
        <h3>添加人物档案</h3>
        <div class="form-group">
          <label>人物名称</label>
          <input v-model="newCharacter.name" type="text" placeholder="请输入人物名称">
        </div>
        <div class="form-group">
          <label>人物设定</label>
          <textarea v-model="newCharacter.description" placeholder="请输入人物设定"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="saveCharacter">保存</button>
          <button @click="showCharacterModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WorldView from './WorldView.vue'
import CharacterProfile from './CharacterProfile.vue'
import {
  getWorldviewWithStatus,
  saveWorldview as saveWorldviewToDB,
  deleteWorldview as deleteWorldviewFromDB,
  getCharactersWithStatus,
  saveCharacter as saveCharacterToDB,
  deleteCharacter as deleteCharacterFromDB
} from '@/utils/db'
import { vectorizeText, getStatusColor, type VectorStatus } from '@/utils/vectorUtils'

const props = defineProps<{
  bookId: number
}>()

// 世界观相关状态
const worldview = ref<string | null>(null)
const isWorldviewExpanded = ref(false)
const worldviewEditContent = ref('')
const showWorldviewModal = ref(false)

// 人物档案相关状态
const characters = ref<Array<{ id: number, bookId: number, name: string, description: string, createdAt: Date }>>([])
const expandedCharacters = ref<number[]>([])
const newCharacter = ref({
  name: '',
  description: ''
})
const showCharacterModal = ref(false)

// 加载数据
onMounted(async () => {
  const { content, status } = await getWorldviewWithStatus(props.bookId)
  worldview.value = content
  worldviewVectorStatus.value = status

  const dbCharacters = await getCharactersWithStatus(props.bookId)
  characters.value = dbCharacters.map(c => ({
    ...c,
    id: c.id as number // 确保id存在
  }))

  // 初始化人物向量状态
  dbCharacters.forEach(c => {
    if (c.status) {
      characterVectorStatus.value[c.id] = c.status
    }
  })
})

// 世界观操作
const editWorldview = () => {
  worldviewEditContent.value = worldview.value || ''
  showWorldviewModal.value = true
}

const worldviewVectorStatus = ref<VectorStatus | null>(null)

const saveWorldview = async () => {
  worldviewVectorStatus.value = 'processing'
  showWorldviewModal.value = false  // 立即关闭弹窗

  try {
    const vectorResult = await vectorizeText(worldviewEditContent.value)
    await saveWorldviewToDB(
      props.bookId,
      worldviewEditContent.value,
      vectorResult.vector,
      vectorResult.status
    )
    worldview.value = worldviewEditContent.value
    worldviewVectorStatus.value = vectorResult.status
  } catch (error) {
    await saveWorldviewToDB(
      props.bookId,
      worldviewEditContent.value,
      undefined,
      'error'
    )
    worldviewVectorStatus.value = 'error'
    console.error('保存世界观失败:', error)
  }
}

const deleteWorldview = async () => {
  await deleteWorldviewFromDB(props.bookId)
  worldview.value = null
}

// 人物档案操作
const characterVectorStatus = ref<Record<number, VectorStatus>>({})

const saveCharacter = async () => {
  const statusKey = Date.now() // 临时ID用于状态跟踪
  characterVectorStatus.value[statusKey] = 'processing'
  showCharacterModal.value = false  // 立即关闭弹窗

  // 保存原始人物数据
  const characterData = {
    name: newCharacter.value.name,
    description: newCharacter.value.description
  }
  newCharacter.value = { name: '', description: '' }  // 立即清空表单

  try {
    const combinedText = `姓名：${characterData.name}，描述：${characterData.description}`
    const vectorResult = await vectorizeText(combinedText)
    const id = await saveCharacterToDB(props.bookId, {
      ...characterData,
      descriptionVector: vectorResult.vector,
      descriptionVectorStatus: vectorResult.status
    })

    characters.value.push({
      id: id as number,
      bookId: props.bookId,
      ...characterData,
      createdAt: new Date()
    })

    characterVectorStatus.value[id as number] = vectorResult.status
  } catch (error) {
    characterVectorStatus.value[statusKey] = 'error'
    console.error('保存人物档案失败:', error)
  }
}

const deleteCharacter = async (id: number) => {
  await deleteCharacterFromDB(id)
  characters.value = characters.value.filter(c => c.id !== id)
  expandedCharacters.value = expandedCharacters.value.filter(cid => cid !== id)
}

// 展开/收起人物档案
const toggleCharacter = (id: number) => {
  const index = expandedCharacters.value.indexOf(id)
  if (index === -1) {
    expandedCharacters.value.push(id)
  } else {
    expandedCharacters.value.splice(index, 1)
  }
}
</script>

<style scoped>
.background-setting {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  gap: 16px;
  background: #f5f5f5;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions button {
  min-width: 80px;
  text-align: center;
}

.modal-actions button:first-child {
  background-color: #f0f0f0;
  border-color: #d0d0d0;
}

.modal-actions button:first-child:hover {
  background-color: #e0e0e0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

textarea {
  min-height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

button:hover {
  background-color: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>