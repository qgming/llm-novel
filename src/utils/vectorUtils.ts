import { VectorSearch } from './VectorSearch'
import { embedText } from '@/services/aiService'
import type { AIConfig } from '@/types/ai'

export type VectorStatus = 'processing' | 'success' | 'error'

export async function vectorizeText(text: string): Promise<{
  vector: number[]
  status: VectorStatus
}> {
  try {
    const savedConfig = localStorage.getItem('aiConfig')
    if (!savedConfig) {
      throw new Error('未找到AI配置')
    }
    
    const config: AIConfig = JSON.parse(savedConfig)
    const result = await embedText(text, config)
    
    return {
      vector: result.vector,
      status: 'success'
    }
  } catch (error) {
    console.error('向量化失败:', error)
    return {
      vector: [],
      status: 'error'
    }
  }
}

export const formatSimilarity = VectorSearch.formatSimilarity
export const getStatusColor = VectorSearch.getStatusColor

export const searchSimilarVectors = async (
  queryVector: number[],
  bookId: number,
  worldviewThreshold = 0.55,
  characterThreshold = 0.6,
  queryText = ''
) => {
  return VectorSearch.search(queryVector, bookId, {
    worldviewThreshold,
    characterThreshold,
    queryText
  })
}