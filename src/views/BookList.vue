<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const books = ref([])
const newBookName = ref('')
const showInput = ref(false)

onMounted(() => {
  const savedBooks = localStorage.getItem('bookList')
  if (savedBooks) books.value = JSON.parse(savedBooks)
})

const saveBookList = () => {
  localStorage.setItem('bookList', JSON.stringify(books.value))
}

const createBook = () => {
  if (newBookName.value.trim()) {
    books.value.push(newBookName.value)
    saveBookList()

    // 创建IndexedDB数据库
    const request = indexedDB.open(newBookName.value, 2)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('settings')) {
        const store = db.createObjectStore('settings', { keyPath: 'id' })
        store.createIndex('type', 'type', { unique: false })
      }
    }

    newBookName.value = ''
    showInput.value = false
  }
}

const deleteBook = (bookName) => {
  if (confirm(`删除《${bookName}》？`)) {
    // 删除IndexedDB数据库
    const request = indexedDB.deleteDatabase(bookName)
    request.onsuccess = () => {
      books.value = books.value.filter(book => book !== bookName)
      saveBookList()

      // 删除该书籍的所有前情提要
      const savedMemory = localStorage.getItem('temporaryMemory')
      if (savedMemory) {
        const memories = JSON.parse(savedMemory)
        const updatedMemories = memories.filter(item => item.title !== bookName)
        localStorage.setItem('temporaryMemory', JSON.stringify(updatedMemories))
      }
    }
    request.onerror = () => {
      console.error('删除数据库失败')
    }
  }
}

</script>

<template>
  <div class="container">
    <div class="header">
      <h1>书籍列表</h1>
      <button @click="router.push('/settings')" class="settings-btn">⚙️</button>
    </div>

    <transition name="fade">
      <div v-if="showInput" class="modal">
        <input v-model="newBookName" placeholder="书名" @keyup.enter="createBook">
        <div class="modal-actions">
          <button @click="showInput = false">取消</button>
          <button @click="createBook">创建</button>
        </div>
      </div>
    </transition>

    <div class="book-grid">
      <div v-for="book in books" :key="book" class="book-card"
        @click="router.push(`/writing/${encodeURIComponent(book)}`)">
        <div class="book-cover">
          <div class="modern-pattern"></div>
          <div class="book-spine"></div>
        </div>
        <div class="book-title">
          {{ book }}
        </div>
        <button @click.stop="deleteBook(book)" class="delete-btn">×</button>
      </div>
    </div>

    <button @click="showInput = true" class="add-btn">+ 新建书籍</button>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  background: #f8f8f8;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
  transition: color 0.3s ease;
}

.settings-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.settings-btn:hover {
  color: #000;
  transform: rotate(90deg);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.book-card {
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  background: #fff;
  cursor: pointer;
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #bdbdbd;
}

.book-card:active {
  transform: translateY(-2px);
}

.book-cover {
  height: 70%;
  background: #f5f5f5;
  position: relative;
  transition: background 0.3s ease;
}

.book-card:hover .book-cover {
  background: #eee;
}

.modern-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(135deg, transparent 49.5%, rgba(0, 0, 0, 0.05) 49.5%, rgba(0, 0, 0, 0.05) 50.5%, transparent 50.5%);
  background-size: 20px 20px;
  transition: opacity 0.3s ease;
}

.book-card:hover .modern-pattern {
  opacity: 0.8;
}

.book-spine {
  position: absolute;
  right: 0;
  width: 10px;
  height: 100%;
  background: #616161;
  transition: width 0.3s ease;
}

.book-card:hover .book-spine {
  width: 12px;
}

.book-title {
  height: 30%;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #424242;
  border-top: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.book-card:hover .book-title {
  color: #000;
}

.delete-btn {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #424242;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.book-card:hover .delete-btn {
  opacity: 1;
  transform: scale(1);
}

.delete-btn:hover {
  background: #424242;
  color: white;
}

.add-btn {
  width: 100%;
  padding: 1rem;
  background: #fff;
  border: 1px dashed #bdbdbd;
  cursor: pointer;
  margin-top: 2rem;
  border-radius: 8px;
  color: #424242;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #f5f5f5;
  border-color: #424242;
}

.add-btn:active {
  transform: scale(0.98);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.modal input {
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal input:focus {
  border-color: #424242;
  box-shadow: 0 0 0 2px rgba(66, 66, 66, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.6rem 1.2rem;
  border: 1px solid #e0e0e0;
  background: #fff;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-actions button:hover {
  background: #f5f5f5;
}

.modal-actions button:last-child {
  background: #424242;
  color: white;
  border-color: #424242;
}

.modal-actions button:last-child:hover {
  background: #333;
  border-color: #333;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
</style>