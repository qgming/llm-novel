import { getBooks, getCharactersWithStatus } from './db'
import type { VectorStatus } from './vectorUtils'

export class VectorSearch {
  public static formatSimilarity(similarity: number): string {
    return `${Math.round(similarity * 100)}%`
  }

  public static getStatusColor(status?: VectorStatus | null): string {
    if (!status) return 'transparent'
    return status === 'processing' ? '#FFC107' :
           status === 'success' ? '#4CAF50' : '#F44336'
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0) return 0
    if (a.length !== b.length) {
      console.warn(`向量长度不匹配: ${a.length} vs ${b.length}`)
      return 0
    }
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }

  /**
   * 关键词搜索 - 匹配至少一个关键词并按匹配数量排序
   * @param texts 待搜索文本数组
   * @param keywords 关键词数组
   * @returns 匹配的文本数组，按匹配关键词数量降序排列
   */
  public static async keywordSearchForBook(
    bookId: number,
    keywords: string[]
  ) {
    if (!keywords.length) {
      return {
        worldview: null,
        characters: []
      }
    }

    const books = await getBooks()
    const book = books.find(b => b.id === bookId)
    const characters = await getCharactersWithStatus(bookId)

    // 搜索世界观
    let worldview = null
    if (book?.worldview) {
      const worldviewText = book.worldview.toLowerCase()
      const matchCount = keywords.filter(k => worldviewText.includes(k.toLowerCase())).length
      if (matchCount > 0) {
        worldview = book.worldview
      }
    }

    // 搜索角色
    const matchedCharacters = characters
      .map(c => {
        const description = c.description.toLowerCase()
        const matchCount = keywords.filter(k => description.includes(k.toLowerCase())).length
        return {
          name: c.name,
          description: c.description,
          similarity: matchCount / keywords.length, // 匹配比例作为相似度
          keywordMatches: matchCount
        }
      })
      .filter(c => c.keywordMatches > 0)
      .sort((a, b) => b.keywordMatches - a.keywordMatches)

    return {
      worldview,
      characters: matchedCharacters
    }
  }

  public static keywordSearch(texts: string[], keywords: string[]): string[] {
    if (!keywords.length) return texts
    
    const lowerKeywords = keywords.map(k => k.toLowerCase())
    
    return texts
      .map(text => {
        const lowerText = text.toLowerCase()
        const matchCount = lowerKeywords.filter(k => lowerText.includes(k)).length
        return { text, matchCount }
      })
      .filter(({ matchCount }) => matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .map(({ text }) => text)
  }

  public static async hybridSearch(
    queryVector: number[],
    bookId: number,
    queryText: string,
    keywords: string[],
    options: {
      worldviewThreshold?: number
      characterThreshold?: number
      keywordThreshold?: number
    } = {}
  ) {
    // 并行执行向量搜索和关键词搜索
    const [vectorResults, keywordResults] = await Promise.all([
      this.search(queryVector, bookId, { ...options, queryText: '' }), // 禁用文本匹配
      this.keywordSearchForBook(bookId, keywords)
    ])

    // 合并世界观结果
    const worldview = vectorResults.worldview || keywordResults.worldview

    // 合并角色结果
    const characterMap = new Map<string, {
      name: string
      description: string
      similarity: number
      keywordMatches: number
    }>()

    // 添加向量搜索结果
    vectorResults.characters.forEach(c => {
      characterMap.set(c.name, {
        ...c,
        keywordMatches: 0
      })
    })

    // 添加关键词搜索结果并更新匹配数
    keywordResults.characters.forEach(c => {
      const existing = characterMap.get(c.name)
      if (existing) {
        existing.keywordMatches = c.keywordMatches
        existing.similarity = Math.max(existing.similarity, c.similarity)
      } else {
        characterMap.set(c.name, c)
      }
    })

    // 计算综合评分并排序
    const characters = Array.from(characterMap.values())
      .map(c => ({
        ...c,
        combinedScore: c.similarity * 0.7 + c.keywordMatches * 0.3
      }))
      .sort((a, b) => b.combinedScore - a.combinedScore)

    return {
      worldview,
      characters
    }
  }

  public static async search(
    queryVector: number[],
    bookId: number,
    options: {
      worldviewThreshold?: number
      characterThreshold?: number
      queryText?: string
    } = {}
  ) {
    const {
      worldviewThreshold = 0.55,
      characterThreshold = 0.6,
      queryText = ''
    } = options

    // 文本匹配检查
    if (queryText && queryText.trim()) {
      const searchTerm = queryText.trim().toLowerCase()
      const books = await getBooks()
      const book = books.find(b => b.id === bookId)
      
      // 搜索世界观内容
      let worldviewMatch = false
      if (book?.worldview && book.worldview.toLowerCase().includes(searchTerm)) {
        worldviewMatch = true
      }
      
      // 搜索角色描述
      const characters = await getCharactersWithStatus(bookId)
      const matchedCharacters = characters
        .filter(c => c.description.toLowerCase().includes(searchTerm))
        .map(c => ({
          name: c.name,
          description: c.description,
          similarity: 0.99 // 关键词匹配设为高相似度
        }))
      
      return {
        worldview: worldviewMatch ? book?.worldview || null : null,
        characters: matchedCharacters
      }
    }

    try {
      // 获取书籍世界观向量
      const books = await getBooks()
      const book = books.find(b => b.id === bookId)
      const worldviewVector = book?.worldviewVector
      let worldviewSimilarity = 0
      if (worldviewVector) {
        worldviewSimilarity = this.cosineSimilarity(queryVector, worldviewVector)
      }

      // 获取角色向量
      const characters = await getCharactersWithStatus(bookId)
      let characterResults = characters
        .filter(c => c.descriptionVector)
        .map(c => ({
          name: c.name,
          description: c.description,
          similarity: this.cosineSimilarity(queryVector, c.descriptionVector!)
        }))

      // 过滤并排序
      characterResults = characterResults
        .filter(c => c.similarity >= characterThreshold)
        .sort((a, b) => b.similarity - a.similarity)

      return {
        worldview: worldviewSimilarity >= worldviewThreshold ? book?.worldview || null : null,
        characters: characterResults
      }
    } catch (error) {
      console.error('向量搜索失败:', {
        error,
        bookId,
        queryVectorLength: queryVector?.length
      })
      return {
        worldview: null,
        characters: []
      }
    }
  }
}