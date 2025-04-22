<script setup lang="ts">
import NavigationBar from './components/NavigationBar.vue'
</script>

<template>
  <div>
    <NavigationBar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
/* 全局样式重置 */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

<style scoped>
div {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

main {
  margin-left: 48px;
  flex: 1;
  overflow-y: auto;
}
</style>
