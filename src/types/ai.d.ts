export interface AIConfig {
  apiKey: string
  apiUrl?: string
  model?: string
  embeddingApiUrl?: string
  embeddingModel?: string
  embeddingApiKey?: string
}

export interface AIResponse {
  content: string
  isComplete: boolean
}

export interface KeywordResponse {
  keywords: string[]
}

export interface HybridSearchResult {
  worldview: string | null
  characters: Array<{
    name: string
    description: string
    similarity: number
    keywordMatches: number
    combinedScore?: number
  }>
}

export interface AIService {
  createCompletion(prompt: string, config: AIConfig, handler: AIStreamHandler): Promise<void>
  createEmbedding(text: string, config: AIConfig): Promise<VectorResponse>
  extractKeywords(text: string, config: AIConfig): Promise<KeywordResponse>
}

export interface VectorResponse {
  vector: number[]
  model: string
}

export interface AIStreamHandler {
  (chunk: string): void
  (error: Error): void
}
