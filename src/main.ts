import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initDB } from './utils/db'

async function initializeApp() {
  try {
    // 初始化数据库
    await initDB()
    
    const app = createApp(App)
    app.use(router)
    app.mount('#app')
  } catch (error) {
    console.error('应用初始化失败:', error)
    // 即使数据库初始化失败也继续运行应用
    const app = createApp(App)
    app.use(router)
    app.mount('#app')
  }
}

initializeApp()
