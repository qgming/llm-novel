<template>
  <div class="section">
    <div class="section-header">
      <h3>世界观</h3>
      <button v-if="!worldview" @click="$emit('showWorldviewModal')">添加</button>
      <button v-else @click="$emit('editWorldview')">编辑</button>
    </div>
    <div v-if="worldview" class="content">
      <div class="content-header">
        <div class="status-indicator" :style="{ backgroundColor: getStatusColor(worldviewVectorStatus) }"
          v-if="worldviewVectorStatus"></div>
        <button class="delete-btn" @click="$emit('deleteWorldview')">×</button>
      </div>
      <div class="worldview-content" :class="{ expanded: isWorldviewExpanded }"
        @click="isWorldviewExpanded = !isWorldviewExpanded">
        {{ worldview }}
      </div>
    </div>
    <div v-else class="empty">暂无世界观设定</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getStatusColor, type VectorStatus } from '@/utils/vectorUtils'

const props = defineProps<{
  worldview: string | null
  worldviewVectorStatus: VectorStatus | null
  isWorldviewExpanded: boolean
}>()

const emit = defineEmits<{
  (e: 'showWorldviewModal'): void
  (e: 'editWorldview'): void
  (e: 'deleteWorldview'): void
}>()

const isWorldviewExpanded = ref(props.isWorldviewExpanded)
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

.content {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.empty {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #999;
  font-style: italic;
}

.empty {
  color: #999;
  font-style: italic;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin-left: 8px;
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

.worldview-content {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.worldview-content.expanded {
  display: block;
  -webkit-line-clamp: unset;
}
</style>