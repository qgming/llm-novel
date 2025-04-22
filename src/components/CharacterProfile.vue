<template>
  <div class="section">
    <div class="section-header">
      <h3>人物档案</h3>
      <button @click="$emit('showCharacterModal')">添加</button>
    </div>
    <div v-if="characters.length === 0" class="empty">暂无人物档案</div>
    <div v-else class="character-list">
      <div v-for="character in characters" :key="character.id" class="character-item"
        @click.stop="$emit('toggleCharacter', character.id)">
        <div class="character-info">
          <div class="character-header">
            <div class="status-indicator"
              :style="{ backgroundColor: getStatusColor(characterVectorStatus[character.id]) }"
              v-if="characterVectorStatus[character.id]"></div>
            <h4>{{ character.name }}</h4>
          </div>
          <div v-if="expandedCharacters.includes(character.id)" class="character-desc">
            <p>{{ character.description }}</p>
          </div>
        </div>
        <button class="delete-btn" @click.stop="$emit('deleteCharacter', character.id)">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getStatusColor, type VectorStatus } from '@/utils/vectorUtils'

const props = defineProps<{
  characters: Array<{ id: number, name: string, description: string }>
  expandedCharacters: number[]
  characterVectorStatus: Record<number, VectorStatus>
}>()

const emit = defineEmits<{
  (e: 'showCharacterModal'): void
  (e: 'deleteCharacter', id: number): void
  (e: 'toggleCharacter', id: number): void
}>()
</script>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
}

.section-header button {
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

.section-header button:hover {
  background-color: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.section-header button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.empty {
  padding: 16px;
  background: white;
  border-radius: 8px;
  color: #999;
  font-style: italic;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.character-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.character-item h4 {
  margin: 10px;
}

.character-info {
  flex: 1;
}

.character-header {
  display: flex;
  align-items: center;
  position: relative;
  gap: 8px;
  flex: 1;
}

.character-desc {
  position: relative;
  margin-top: 4px;
  border-top: 1px dashed #e0e0e0;
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
}

.delete-btn:hover {
  color: #f56c6c;
  background: transparent;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  order: -1;
}
</style>