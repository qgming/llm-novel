<script setup>
import { ref } from 'vue'

const props = defineProps({
  memories: {
    type: Array,
    required: true,
    default: () => []
  }
})

const expandedMemories = ref([])

const toggleMemory = (id) => {
  expandedMemories.value.includes(id)
    ? expandedMemories.value = expandedMemories.value.filter(memId => memId !== id)
    : expandedMemories.value.push(id)
}

const emit = defineEmits(['deleteMemory'])

const deleteMemory = (id) => {
  if (confirm('确定要删除这条前情提要吗？')) {
    emit('deleteMemory', id)
  }
}
</script>

<template>
  <div class="panel">
    <h3>前情提要</h3>
    <div class="memory-content">
      <div v-if="memories.length === 0" class="empty-memory">
        暂无前情提要
      </div>
      <div v-else>
        <div v-for="item in memories" :key="item.id" class="memory-item">
          <div class="memory-header" @click="toggleMemory(item.id)">
            <p class="memory-preview">{{ item.content.split('\n')[0] }}</p>
            <div class="memory-actions" @click.stop>
              <button @click="deleteMemory(item.id)" class="delete-btn">×</button>
              <span class="toggle-icon">{{ expandedMemories.includes(item.id) ? '−' : '+' }}</span>
            </div>
          </div>
          <div v-if="expandedMemories.includes(item.id)" class="memory-text">
            {{ item.content }}
            <div class="memory-meta">
              {{ item.date }} · {{ item.wordCount }}字
            </div>
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
}

h3 {
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  color: #333;
  font-weight: 500;
}

.empty-memory {
  color: #999;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
}

.memory-item {
  margin-bottom: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.memory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;

  cursor: pointer;
}

.memory-preview {
  margin: 0;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.memory-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.toggle-icon {
  color: #999;
}

.memory-text {
  padding: 0.8rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.memory-meta {
  margin-top: 0.5rem;
  color: #999;
  font-size: 0.8rem;
}
</style>