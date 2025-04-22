<template>
  <nav class="navigation-bar">
    <router-link to="/" class="nav-item" active-class="active">
      <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span class="nav-tooltip">首页</span>
    </router-link>

    <router-link to="/inspiration" class="nav-item" active-class="active">
      <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span class="nav-tooltip">灵感</span>
    </router-link>

    <router-link to="/settings" class="nav-item" active-class="active">
      <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="nav-tooltip">设置</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.navigation-bar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  background-color: #f3f4f6;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0;
  z-index: 1;
}

.nav-item:hover {
  background-color: #e5e7eb;
}

.active {
  background-color: #e5e7eb;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: #374151;
}

.nav-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #1f2937;
  color: white;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  opacity: 0;
  white-space: nowrap;
  z-index: 20;
  pointer-events: none;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item:hover .nav-tooltip {
  opacity: 1;
}
</style>