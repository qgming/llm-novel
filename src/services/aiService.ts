import OpenAI from 'openai'
import type { AIConfig, AIResponse, VectorResponse, AIStreamHandler, AIService, KeywordResponse } from '../types/ai'

class OpenAIService implements AIService {
  async createCompletion(
    prompt: string, 
    config: AIConfig,
    handler: AIStreamHandler
  ): Promise<void> {
    try {
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.apiUrl || 'https://api.openai.com/v1',
        dangerouslyAllowBrowser: true
      })

      const stream = await openai.chat.completions.create({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      })

      let result = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          result += content
          handler(content)
        }
      }
    } catch (error) {
      handler(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async createEmbedding(text: string, config: AIConfig): Promise<VectorResponse> {
    try {
      const openai = new OpenAI({
        apiKey: config.embeddingApiKey || config.apiKey,
        baseURL: config.embeddingApiUrl || config.apiUrl || 'https://api.openai.com/v1',
        dangerouslyAllowBrowser: true
      })

      const response = await openai.embeddings.create({
        model: config.embeddingModel || 'text-embedding-3-small',
        input: text
      })

      return {
        vector: response.data[0].embedding,
        model: response.model
      }
    } catch (error) {
      throw new Error(`向量化失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async testAI(config: AIConfig): Promise<void> {
    const openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.apiUrl || 'https://api.openai.com/v1',
      dangerouslyAllowBrowser: true
    })

    // 发送一个简单的测试请求
    await openai.chat.completions.create({
      model: config.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    })
  }

  async testEmbedding(config: AIConfig): Promise<void> {
    const openai = new OpenAI({
      apiKey: config.embeddingApiKey || config.apiKey,
      baseURL: config.embeddingApiUrl || config.apiUrl || 'https://api.openai.com/v1',
      dangerouslyAllowBrowser: true
    })

    // 发送一个简单的向量化测试请求
    await openai.embeddings.create({
      model: config.embeddingModel || 'text-embedding-3-small',
      input: 'test'
    })
  }

  async extractKeywords(text: string, config: AIConfig): Promise<KeywordResponse> {
    try {
      const openai = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.apiUrl || 'https://api.openai.com/v1',
        dangerouslyAllowBrowser: true
      })

      const response = await openai.chat.completions.create({
        model: config.model || 'gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: '你是一个小说创作助手。请从用户输入中提取与小说相关的关键词，特别关注人物、时间、环境、情节等小说要素。用逗号分隔关键词，只返回关键词，不要解释。'
        }, {
          role: 'user',
          content: text
        }],
        temperature: 0.2,
        max_tokens: 1000
      })

      const keywords = response.choices[0]?.message?.content?.trim() || ''
      return {
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      }
    } catch (error) {
      throw new Error(`关键词提取失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export const aiService: OpenAIService = new OpenAIService()
export const testAI = aiService.testAI.bind(aiService)
export const testEmbedding = aiService.testEmbedding.bind(aiService)
export const embedText = aiService.createEmbedding.bind(aiService)
export const extractKeywords = aiService.extractKeywords.bind(aiService)