<template>
  <div class="settings-view">
    <h1 class="settings-title">设置</h1>

    <div class="settings-cards">
      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">AI模型配置</h2>
          <button class="test-btn" @click="testAIConfig">测试连接</button>
        </div>
        <div class="form-group">
          <label>API Key</label>
          <input v-model="aiConfig.apiKey" type="password" placeholder="输入OpenAI API Key">
        </div>

        <div class="form-group">
          <label>API URL </label>
          <input v-model="aiConfig.apiUrl" placeholder="默认: https://api.openai.com/v1">
        </div>

        <div class="form-group">
          <label>模型</label>
          <input v-model="aiConfig.model" placeholder="例如: gpt-3.5-turbo">
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h2 class="card-title">向量模型配置</h2>
          <button class="test-btn" @click="testEmbeddingConfig">测试连接</button>
        </div>
        <div class="form-group">
          <label>向量API Key </label>
          <input v-model="aiConfig.embeddingApiKey" type="password" placeholder="输入向量模型API Key">
        </div>

        <div class="form-group">
          <label>向量API URL </label>
          <input v-model="aiConfig.embeddingApiUrl" placeholder="例如: https://api.openai.com/v1">
        </div>

        <div class="form-group">
          <label>向量模型 </label>
          <input v-model="aiConfig.embeddingModel" placeholder="例如: text-embedding-3-small">
        </div>
      </div>
    </div>

    <button class="save-btn" @click="saveConfig">保存设置</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AIConfig } from '@/types/ai'
import { aiService } from '@/services/aiService'

const aiConfig = ref<AIConfig>({
  apiKey: '',
  apiUrl: '',
  model: '',
  embeddingApiKey: '',
  embeddingApiUrl: '',
  embeddingModel: ''
})

// 加载已有配置
const savedConfig = localStorage.getItem('aiConfig')
if (savedConfig) {
  aiConfig.value = JSON.parse(savedConfig)
}

function saveConfig() {
  if (!aiConfig.value.apiKey) {
    alert('API Key不能为空')
    return
  }

  localStorage.setItem('aiConfig', JSON.stringify(aiConfig.value))
  alert('设置保存成功')
}

const testAIConfig = async () => {
  try {
    await aiService.testAI(aiConfig.value)
    const btn = document.querySelector('.settings-card:nth-child(1) .test-btn') as HTMLButtonElement
    btn.textContent = '通过'
    btn.style.backgroundColor = '#4CAF50'
  } catch (error) {
    const btn = document.querySelector('.settings-card:nth-child(1) .test-btn') as HTMLButtonElement
    btn.textContent = '失败'
    btn.style.backgroundColor = '#F44336'
  }
}

const testEmbeddingConfig = async () => {
  try {
    await aiService.testEmbedding(aiConfig.value)
    const btn = document.querySelector('.settings-card:nth-child(2) .test-btn') as HTMLButtonElement
    btn.textContent = '通过'
    btn.style.backgroundColor = '#4CAF50'
  } catch (error) {
    const btn = document.querySelector('.settings-card:nth-child(2) .test-btn') as HTMLButtonElement
    btn.textContent = '失败'
    btn.style.backgroundColor = '#F44336'
  }
}
</script>

<style scoped>
.settings-view {
  background-color: #ffffff;
  min-height: 100vh;
  animation: fadeIn 0.3s ease-out;
}

.settings-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 32px 0 0 32px;
}

.settings-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 16px 32px 32px;
  padding-top: 16px;
}

.settings-card {
  flex: 1;
  background: white;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.test-btn {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.test-btn:hover {
  opacity: 0.9;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #1d1d1f;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
}

.save-btn {
  padding: 12px 24px;
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.2s;
  width: 100%;
}

.save-btn:hover {
  background: #0e8e6d;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>