<template>
  <div class="bookshelf">
    <h1 class="bookshelf-title">我的书架</h1>
    <div class="bookshelf-grid">
      <div v-for="book in books" :key="book.id" class="book" @click="goToCreate(book.id)"
        @mouseenter="hoverBookId = book.id" @mouseleave="hoverBookId = null">
        <div class="book-spine"></div>
        <div class="book-cover">
          <div class="book-title">{{ book.title }}</div>
          <div class="delete-btn" v-show="hoverBookId === book.id" @click.stop="handleDeleteBook(book.id)">×</div>
        </div>
      </div>
      <div class="add-book" @click="showDialog = true">
        <span>+</span>
        <span>添加书籍</span>
      </div>
    </div>
  </div>

  <teleport to="body">
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>添加新书籍</h3>
        <input class="dialogInput" v-model="newBookTitle" type="text" placeholder="输入书籍名称" @keyup.enter="handleAddBook">
        <div class="dialog-actions">
          <button @click="showDialog = false">取消</button>
          <button @click="handleAddBook">确认</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBooks, addBook, deleteBook } from '@/utils/db'

const router = useRouter()
const books = ref<Array<{ id: number, title: string }>>([])
const showDialog = ref(false)
const newBookTitle = ref('')
const hoverBookId = ref<number | null>(null)

onMounted(async () => {
  books.value = await getBooks()
})

const goToCreate = (bookId?: number) => {
  router.push({
    path: bookId ? `/create/${bookId}` : '/create'
  })
}

const handleAddBook = async () => {
  if (!newBookTitle.value.trim()) return

  const id = await addBook(newBookTitle.value.trim())
  books.value = await getBooks()
  newBookTitle.value = ''
  showDialog.value = false
}

const handleDeleteBook = async (id: number) => {
  if (!confirm('确定要删除这本书吗？')) return
  await deleteBook(id)
  books.value = await getBooks()
}

</script>

<style scoped>
.bookshelf {
  background-color: #ffffff;
  min-height: 100vh;
}

.bookshelf-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 32px 0 0 32px;
}

.bookshelf-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 16px 32px 32px;
  padding-top: 16px;
}

.book {
  position: relative;
  width: 180px;
  aspect-ratio: 3/4;
  perspective: 1000px;
  cursor: pointer;
}

.book-spine {
  position: absolute;
  left: 0;
  top: 0;
  width: 12px;
  height: 100%;
  background: linear-gradient(90deg, #d9d9d9, #e8e8e8);
  border-radius: 4px 0 0 4px;
  z-index: 1;
}

.book-cover {
  position: absolute;
  left: 12px;
  top: 0;
  right: 0;
  bottom: 0;
  background: #f8f8fa;
  border-radius: 0 8px 8px 0;
  box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 20px;
  border: 1px solid #eaeaea;
}

.book:hover .book-cover {
  transform: translateY(-8px);
  box-shadow: 2px 6px 12px rgba(0, 0, 0, 0.12);
}

.book-title {
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  text-align: center;
  line-height: 1.4;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  opacity: 0;
}

.book:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  opacity: 0.9;
}

.add-book {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180px;
  aspect-ratio: 3/4;
  background: #f8f8fa;
  border-radius: 8px;
  box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px dashed #eaeaea;
  color: #888;
}

.add-book:hover {
  transform: translateY(-8px);
  box-shadow: 2px 6px 12px rgba(0, 0, 0, 0.12);
  background: #f0f0f0;
}

.add-book span:first-child {
  font-size: 48px;
  margin-bottom: 8px;
}

.add-book span:last-child {
  font-size: 16px;
  font-weight: 500;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-20px);
  animation: slideUp 0.3s ease-out forwards;
  box-sizing: border-box;
}

.dialogInput {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 16px;
}

.dialogInput:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

.dialog h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.dialog-actions button {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.dialog-actions button:first-child {
  background-color: #f5f5f7;
  color: #1d1d1f;
}

.dialog-actions button:first-child:hover {
  background-color: #e5e5ea;
}

.dialog-actions button:last-child {
  background-color: #007aff;
  color: white;
}

.dialog-actions button:last-child:hover {
  background-color: #0062cc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
