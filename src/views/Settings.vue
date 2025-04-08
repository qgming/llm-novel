<script setup>
import { computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useRouter } from "vue-router"

const configStore = useConfigStore()
const router = useRouter()

const goToBookList = () => {
  router.push("/")
}

// 使用computed保持响应式
const writingConfig = computed({
  get: () => configStore.writingConfig,
  set: (value) => { configStore.writingConfig = value }
})

const embeddingConfig = computed({
  get: () => configStore.embeddingConfig,
  set: (value) => { configStore.embeddingConfig = value }
})

const saveSettings = () => {
  const success = configStore.saveConfig()
  if (success) {
    alert('配置保存成功')
  } else {
    alert('配置保存失败，请检查控制台')
  }
}

// 组件挂载时加载配置
onMounted(() => {
  configStore.loadConfig()
})
</script>

<template>
  <div class="settings-page">
    <div class="header">
      <div @click="goToBookList" class="back-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </div>
      <h1>模型设置</h1>
    </div>

    <div class="settings-grid">
      <div class="setting-card">
        <h2>写作模型</h2>
        <div class="setting-form">
          <div class="form-group">
            <label>网址</label>
            <input v-model="writingConfig.provider" placeholder="例如: https://api.siliconflow.cn/v1">
          </div>
          <div class="form-group">
            <label>模型</label>
            <input v-model="writingConfig.model" placeholder="例如: deepseek-ai/DeepSeek-V3">
          </div>
          <div class="form-group">
            <label>API Key</label>
            <input v-model="writingConfig.apiKey" type="password" placeholder="输入API密钥">
          </div>
        </div>
      </div>

      <div class="setting-card">
        <h2>向量模型</h2>
        <div class="setting-form">
          <div class="form-group">
            <label>网址</label>
            <input v-model="embeddingConfig.provider" placeholder="例如: https://api.siliconflow.cn/v1/embeddings">
          </div>
          <div class="form-group">
            <label>模型</label>
            <input v-model="embeddingConfig.model" placeholder="例如: BAAI/bge-m3">
          </div>
          <div class="form-group">
            <label>API Key</label>
            <input v-model="embeddingConfig.apiKey" type="password" placeholder="输入API密钥">
          </div>
        </div>
      </div>
    </div>

    <button @click="saveSettings" class="save-btn">保存设置</button>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 2rem;
  background: #f8f8f8;
  min-height: 100vh;
}

.header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
}

h2 {
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  color: #424242;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.setting-card {
  background: #fff;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.setting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.setting-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: #616161;
}

input {
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #424242;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 66, 66, 0.1);
}

.save-btn {
  width: 100%;
  padding: 1rem;
  background: #424242;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: #333;
}

.back-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-icon:hover {
  background-color: #f0f0f0;
}

.back-icon svg {
  width: 20px;
  height: 20px;
}
</style>