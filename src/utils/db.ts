import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

interface NovelDB extends DBSchema {
  books: {
    key: number
    value: {
      id?: number
      title: string
      worldview?: string | null
      worldviewVector?: number[] | null
      worldviewVectorStatus?: 'processing' | 'success' | 'error' | null
      createdAt: Date
    }
    indexes: { 'by-title': string }
  }
  characters: {
    key: number
    value: {
      id?: number
      bookId: number
      name: string
      description: string
      descriptionVector?: number[] | null
      descriptionVectorStatus?: 'processing' | 'success' | 'error' | null
      createdAt: Date
    }
    indexes: { 'by-bookId': number }
  }
  chapters: {
    key: number
    value: {
      id?: number
      bookId: number
      title: string
      content: string
      contentVector?: number[] | null
      contentVectorStatus?: 'processing' | 'success' | 'error' | null
      createdAt: Date
    }
    indexes: { 'by-bookId': number }
  }
}

let dbPromise: Promise<IDBPDatabase<NovelDB>>

export async function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<NovelDB>('NovelDB', 1, {
      upgrade(db: IDBPDatabase<NovelDB>) {
        if (!db.objectStoreNames.contains('books')) {
          const bookStore = db.createObjectStore('books', {
            keyPath: 'id',
            autoIncrement: true
          })
          bookStore.createIndex('by-title', 'title')
        }
        if (!db.objectStoreNames.contains('characters')) {
          const characterStore = db.createObjectStore('characters', {
            keyPath: 'id',
            autoIncrement: true
          })
          characterStore.createIndex('by-bookId', 'bookId')
        }
        if (!db.objectStoreNames.contains('chapters')) {
          const chapterStore = db.createObjectStore('chapters', {
            keyPath: 'id',
            autoIncrement: true
          })
          chapterStore.createIndex('by-bookId', 'bookId')
        }
      }
    })
  }
  return dbPromise
}

// 书籍相关操作
export async function addBook(title: string): Promise<number> {
  const db = await initDB()
  return db.add('books', {
    title,
    createdAt: new Date()
  })
}

export async function getBookById(id: number) {
  const db = await initDB()
  return db.get('books', id)
}

export async function getBooks(): Promise<Array<{
  id: number
  title: string
  worldview?: string | null
  worldviewVector?: number[] | null
  worldviewVectorStatus?: 'processing' | 'success' | 'error' | null
  createdAt: Date
}>> {
  const db = await initDB()
  const books = await db.getAll('books')
  return books.map(book => ({
    ...book,
    id: book.id as number // 确保id存在
  }))
}

// 世界观相关操作
export async function saveWorldview(
  bookId: number,
  content: string,
  vector?: number[],
  status?: 'processing' | 'success' | 'error' | null
): Promise<number> {
  const db = await initDB()
  const book = await db.get('books', bookId)
  if (!book) throw new Error('Book not found')
  
  return db.put('books', {
    ...book,
    worldview: content,
    worldviewVector: vector || null,
    worldviewVectorStatus: status || null
  })
}

export async function getWorldview(bookId: number): Promise<string | null> {
  const db = await initDB()
  const book = await db.get('books', bookId)
  return book?.worldview || null
}

export async function getWorldviewWithStatus(
  bookId: number
): Promise<{ content: string | null; status: 'processing' | 'success' | 'error' | null }> {
  const db = await initDB()
  const book = await db.get('books', bookId)
  return {
    content: book?.worldview || null,
    status: book?.worldviewVectorStatus || null
  }
}

export async function deleteWorldview(bookId: number) {
  const db = await initDB()
  const book = await db.get('books', bookId)
  if (!book) throw new Error('Book not found')
  
  return db.put('books', {
    ...book,
    worldview: null
  })
}

// 人物档案相关操作
export async function saveCharacter(bookId: number, character: {
  name: string
  description: string
  descriptionVector?: number[],
  descriptionVectorStatus?: 'processing' | 'success' | 'error' | null
}) {
  const db = await initDB()
  return db.add('characters', {
    bookId,
    ...character,
    createdAt: new Date()
  })
}

export async function getCharactersWithStatus(bookId: number): Promise<Array<{
  id: number
  bookId: number
  name: string
  description: string
  descriptionVector?: number[] | null
  status: 'processing' | 'success' | 'error' | null
  createdAt: Date
}>> {
  try {
    const db = await initDB()
    if (!db.objectStoreNames.contains('characters')) {
      return []
    }
    const allCharacters = await db.getAll('characters')
    return allCharacters
      .filter((c: NovelDB['characters']['value']) => c.bookId === bookId)
      .map(c => ({
        ...c,
        id: c.id as number,
        status: c.descriptionVectorStatus || null
      }))
  } catch (error) {
    console.error('Failed to get characters:', error)
    return []
  }
}

export async function getCharacters(bookId: number) {
  try {
    const db = await initDB()
    if (!db.objectStoreNames.contains('characters')) {
      return []
    }
    const allCharacters = await db.getAll('characters')
    return allCharacters.filter((c: NovelDB['characters']['value']) => c.bookId === bookId)
  } catch (error) {
    console.error('Failed to get characters:', error)
    return []
  }
}

export async function deleteCharacter(id: number) {
  const db = await initDB()
  return db.delete('characters', id)
}

export async function saveChapter(
  bookId: number,
  title: string,
  content: string,
  contentVector?: number[],
  contentVectorStatus?: 'processing' | 'success' | 'error' | null
) {
  const db = await initDB()
  return db.add('chapters', {
    bookId,
    title,
    content,
    contentVector: contentVector || null,
    contentVectorStatus: contentVectorStatus || null,
    createdAt: new Date()
  })
}

export async function updateChapterVector(
  chapterId: number,
  contentVector: number[],
  status: 'processing' | 'success' | 'error'
) {
  const db = await initDB()
  const chapter = await db.get('chapters', chapterId)
  if (!chapter) throw new Error('Chapter not found')
  
  return db.put('chapters', {
    ...chapter,
    contentVector,
    contentVectorStatus: status
  })
}

export async function getChapters(bookId: number) {
  const db = await initDB()
  if (!db.objectStoreNames.contains('chapters')) {
    return []
  }
  const allChapters = await db.getAll('chapters')
  return allChapters
    .filter((c: NovelDB['chapters']['value']) => c.bookId === bookId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function deleteChapter(id: number): Promise<void> {
  const db = await initDB()
  return db.delete('chapters', id)
}

export async function deleteBook(id: number): Promise<void> {
  const db = await initDB()
  
  // 先删除该书籍的所有人物角色
  const characters = await db.getAllFromIndex('characters', 'by-bookId', id)
  await Promise.all(characters.map(c => db.delete('characters', c.id as number)))
  
  // 删除该书籍的所有章节
  const chapters = await db.getAllFromIndex('chapters', 'by-bookId', id)
  await Promise.all(chapters.map(c => db.delete('chapters', c.id as number)))
  
  // 然后删除书籍本身
  await db.delete('books', id)
}