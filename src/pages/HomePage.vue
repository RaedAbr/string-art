<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="page-container">
    <header class="header">
      <!-- <h1>Hello App!</h1> -->
      <p>
        <strong>Current route path:</strong> {{ route.fullPath }}
      </p>
      <nav>
        <RouterLink :to="{ name: 'page1' }">Page 1</RouterLink> |
        <RouterLink :to="{ name: 'page2' }">Page 2</RouterLink> |
        <RouterLink :to="{ name: 'page3' }">Page 3</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 120px;
  background-color: #1f2937;
  /* Dark gray */
  color: white;
}

main {
  flex: 1;
  /* Ensures main content takes remaining space */
}
</style>